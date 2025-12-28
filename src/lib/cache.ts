/**
 * Cache utility for storing API responses in localStorage
 * with configurable TTL (time-to-live)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Default cache duration: 5 minutes (in milliseconds)
const DEFAULT_TTL = 5 * 60 * 1000;

// Extended cache duration for background refresh: 30 minutes
const STALE_TTL = 30 * 60 * 1000;

/**
 * Get item from cache
 * Returns the cached data if valid, or null if expired/missing
 */
export function getFromCache<T>(key: string): { data: T; isStale: boolean } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    
    // Check if data is completely expired (past stale TTL)
    if (now > entry.timestamp + STALE_TTL) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    // Check if data is fresh or stale
    const isStale = now > entry.expiresAt;
    
    return { data: entry.data, isStale };
  } catch {
    return null;
  }
}

/**
 * Set item in cache with TTL
 */
export function setInCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (typeof window === 'undefined') return;
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    
    localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  } catch {
    // localStorage might be full or unavailable
    console.warn('Failed to cache data');
  }
}

/**
 * Remove item from cache
 */
export function removeFromCache(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch {
    // Ignore errors
  }
}

/**
 * Clear all cached items
 */
export function clearCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore errors
  }
}

/**
 * Generate a cache key for Google Drive folder
 */
export function getDriveCacheKey(folderId: string): string {
  return `drive_folder_${folderId}`;
}

/**
 * Cache version - increment to invalidate all caches
 */
export const CACHE_VERSION = 1;

/**
 * Check and clear old cache versions
 */
export function checkCacheVersion(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const storedVersion = localStorage.getItem('cache_version');
    const currentVersion = CACHE_VERSION.toString();
    
    if (storedVersion !== currentVersion) {
      clearCache();
      localStorage.setItem('cache_version', currentVersion);
    }
  } catch {
    // Ignore errors
  }
}
