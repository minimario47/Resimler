// Service Worker for Wedding Archive - Optimized for Cloudflare R2
// Resolve GitHub Pages base path from SW registration URL
const swUrl = new URL(self.location.href);
const basePathParam = swUrl.searchParams.get('basePath') || '';
const BASE_PATH = basePathParam.replace(/\/$/, '');

const CACHE_NAME = 'wedding-archive-v2';
const RUNTIME_CACHE = 'runtime-cache-v2';
const IMAGE_CACHE = 'image-cache-v2';

// Max number of images to cache (prevent storage bloat)
const MAX_CACHED_IMAGES = 500;

// Assets to cache on install
const PRECACHE_ASSETS = [
  BASE_PATH ? `${BASE_PATH}/` : '/',
  BASE_PATH ? `${BASE_PATH}/index.html` : '/index.html',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !currentCaches.includes(cacheName))
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if URL is an R2 image URL
function isR2ImageUrl(url) {
  return url.hostname.includes('.r2.dev') || 
         url.hostname.includes('cloudflare') ||
         (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i) && url.hostname.includes('pub-'));
}

// Helper: Get cache key for R2 images (normalize URL params)
function getImageCacheKey(url) {
  // For R2 URLs with resize params, cache by base URL + size
  const baseUrl = url.origin + url.pathname;
  const width = url.searchParams.get('w') || 'full';
  return `${baseUrl}?w=${width}`;
}

// Helper: Limit image cache size
async function limitImageCache() {
  const cache = await caches.open(IMAGE_CACHE);
  const keys = await cache.keys();
  
  if (keys.length > MAX_CACHED_IMAGES) {
    // Delete oldest entries (first in array)
    const toDelete = keys.slice(0, keys.length - MAX_CACHED_IMAGES);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle Cloudflare R2 image requests - aggressive caching with stale-while-revalidate
  if (isR2ImageUrl(url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cacheKey = getImageCacheKey(url);
        const cachedResponse = await cache.match(cacheKey);
        
        if (cachedResponse) {
          // Return cached version immediately
          // Revalidate in background if cache is older than 1 hour
          const cachedDate = cachedResponse.headers.get('sw-cached-date');
          const isStale = cachedDate && (Date.now() - new Date(cachedDate).getTime() > 60 * 60 * 1000);
          
          if (isStale) {
            // Background revalidation (don't block response)
            fetch(request).then((response) => {
              if (response.ok) {
                const clonedResponse = response.clone();
                const headers = new Headers(clonedResponse.headers);
                headers.set('sw-cached-date', new Date().toISOString());
                
                return clonedResponse.blob().then((body) => {
                  const cachedResp = new Response(body, {
                    status: clonedResponse.status,
                    statusText: clonedResponse.statusText,
                    headers: headers
                  });
                  cache.put(cacheKey, cachedResp);
                });
              }
            }).catch(() => {});
          }
          
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(request).then((response) => {
          if (response.ok) {
            // Clone and cache with timestamp
            const clonedResponse = response.clone();
            const headers = new Headers(clonedResponse.headers);
            headers.set('sw-cached-date', new Date().toISOString());
            
            clonedResponse.blob().then((body) => {
              const cachedResp = new Response(body, {
                status: clonedResponse.status,
                statusText: clonedResponse.statusText,
                headers: headers
              });
              cache.put(cacheKey, cachedResp);
              limitImageCache();
            });
          }
          return response;
        }).catch(() => {
          // Network failed - return placeholder or error
          return new Response('', { 
            status: 408, 
            statusText: 'Network unavailable' 
          });
        });
      })
    );
    return;
  }

  // Handle Google Drive thumbnail requests - cache aggressively (legacy support)
  if (url.hostname === 'drive.google.com' && url.pathname.includes('thumbnail')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            return new Response('', { status: 408, statusText: 'Request Timeout' });
          });
        });
      })
    );
    return;
  }

  // Handle allorigins proxy - short-term cache
  if (url.hostname === 'api.allorigins.win' || url.hostname === 'corsproxy.io') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          return cache.match(request);
        });
      })
    );
    return;
  }

  // For same-origin requests, use stale-while-revalidate strategy
  if (url.origin === self.location.origin) {
    // For navigation requests (HTML), use network first
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            return caches.match(request).then((cached) => {
              if (cached) return cached;
              const fallbackPath = BASE_PATH ? `${BASE_PATH}/index.html` : '/index.html';
              return caches.match(fallbackPath);
            });
          })
      );
      return;
    }

    // For static assets, use cache first
    if (url.pathname.includes('/_next/static/') || 
        url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/)) {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
      );
      return;
    }
  }

  // Default: network first for everything else
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
  
  if (event.data === 'CLEAR_IMAGE_CACHE') {
    caches.delete(IMAGE_CACHE);
  }
  
  // Prefetch images for faster loading
  if (event.data && event.data.type === 'PREFETCH_IMAGES') {
    const urls = event.data.urls || [];
    caches.open(IMAGE_CACHE).then((cache) => {
      urls.forEach((url) => {
        fetch(url).then((response) => {
          if (response.ok) {
            cache.put(url, response);
          }
        }).catch(() => {});
      });
    });
  }
});
