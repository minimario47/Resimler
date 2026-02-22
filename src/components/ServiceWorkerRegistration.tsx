'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const imageCacheVersion = '3';
      const imageCacheVersionKey = 'sw_image_cache_version';

      const clearLegacyImageCache = (active: ServiceWorker) => {
        const currentVersion = localStorage.getItem(imageCacheVersionKey);
        if (currentVersion === imageCacheVersion) {
          return;
        }
        active.postMessage('CLEAR_IMAGE_CACHE');
        localStorage.setItem(imageCacheVersionKey, imageCacheVersion);
      };

      // Get base path for GitHub Pages
      const basePath = process.env.NEXT_PUBLIC_REPO_NAME 
        ? `/${process.env.NEXT_PUBLIC_REPO_NAME}` 
        : '';
      
      const swUrl = `${basePath}/sw.js?basePath=${encodeURIComponent(basePath)}`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          registration.update();
          if (registration.active) {
            clearLegacyImageCache(registration.active);
          }
          navigator.serviceWorker.ready.then((readyRegistration) => {
            if (readyRegistration.active) {
              clearLegacyImageCache(readyRegistration.active);
            }
          });
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
