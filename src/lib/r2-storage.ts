/**
 * Cloudflare R2 Storage Integration
 * Provides fast CDN-backed image storage as replacement for Google Drive
 */

export interface R2File {
  id: string;
  name: string;
  key: string; // R2 object key
  url: string; // Public CDN URL
  thumbnailUrl: string;
  size?: number;
  contentType?: string;
  uploadedAt?: string;
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string; // Custom domain or R2.dev subdomain
}

const DEFAULT_PUBLIC_IMAGE_URL = 'https://wedding-photos.xaco47.workers.dev';

// Get R2 configuration from environment variables
export function getR2Config(): R2Config | null {
  const envPublicUrl =
    (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || '').trim();
  const publicUrl = envPublicUrl || DEFAULT_PUBLIC_IMAGE_URL;

  if (typeof window !== 'undefined') {
    // Client-side only needs a public URL to generate image endpoints.
    return {
      accountId: '', // Not needed client-side
      accessKeyId: '', // Not needed client-side
      secretAccessKey: '', // Not needed client-side
      bucketName: '', // Not needed client-side
      publicUrl,
    };
  }
  
  // Server-side: Full config needed
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  // URL generation for gallery rendering only requires publicUrl.
  return {
    accountId: accountId || '',
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
    bucketName: bucketName || '',
    publicUrl,
  };
}

/**
 * Image quality/size presets for progressive loading
 * Optimized for slow internet connections (Turkey)
 * 
 * Strategy:
 * - Grid view: Very low quality (~20% of original) for fast loading
 * - Lightbox: Full quality only when user clicks
 */
export interface ImageSizePreset {
  width: number;
  quality: number;
  fit?: 'cover' | 'contain' | 'scale-down';
}

export function normalizeR2ImageKey(key: string): string {
  return key.replace(/\.heic$/i, '.jpeg');
}

export const IMAGE_PRESETS = {
  // Tiny placeholder - blur-up effect (< 1KB)
  placeholder: { width: 16, quality: 10, fit: 'cover' as const },
  
  // Grid thumbnails - very low quality for fast loading (~20-50KB)
  // These are what users see in galleries before clicking
  thumb: { width: 250, quality: 35, fit: 'cover' as const },
  
  // Medium - slightly better for larger grid views (~50-100KB)
  medium: { width: 350, quality: 45, fit: 'cover' as const },
  
  // Preview - shown in lightbox while full quality loads (~100-200KB)
  preview: { width: 600, quality: 55, fit: 'scale-down' as const },
  
  // Full quality - only loaded when user clicks to view (~500KB-2MB)
  full: { width: 1600, quality: 85, fit: 'scale-down' as const },
};

/**
 * Generate optimized R2 URL with resize parameters
 * 
 * Works with:
 * 1. Cloudflare Worker (uses ?w=WIDTH&q=QUALITY params)
 * 2. Custom domain with Image Resizing (uses /cdn-cgi/image/ format)
 * 3. Direct R2.dev URLs (params included but won't resize - still works for caching)
 */
export function getOptimizedUrl(
  baseUrl: string,
  key: string,
  preset: ImageSizePreset
): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const normalizedKey = normalizeR2ImageKey(key);
  const originalUrl = `${cleanBaseUrl}/${normalizedKey}`;
  
  // Check if using workers.dev (our image resizer worker)
  const isWorkerUrl = cleanBaseUrl.includes('.workers.dev');
  
  // Check if using a custom domain (not r2.dev and not workers.dev)
  const isCustomDomain = !cleanBaseUrl.includes('.r2.dev') && !isWorkerUrl;
  
  if (isCustomDomain) {
    // Use Cloudflare Image Resizing URL format for custom domains
    // Format: /cdn-cgi/image/OPTIONS/IMAGE_URL
    const options = `w=${preset.width},q=${preset.quality},fit=${preset.fit || 'cover'},f=auto`;
    return `${cleanBaseUrl}/cdn-cgi/image/${options}/${normalizedKey}`;
  }
  
  // For Workers and r2.dev URLs, use query params
  // Workers will resize, r2.dev will ignore but URL still works
  const params = new URLSearchParams({
    w: preset.width.toString(),
    q: preset.quality.toString(),
  });
  
  if (preset.fit) {
    params.set('fit', preset.fit);
  }
  
  return `${originalUrl}?${params.toString()}`;
}

/**
 * Generate R2 URLs for a file with multiple size variants
 * 
 * Grid view uses very low quality (thumb) for fast loading
 * Full quality only loaded in lightbox when user clicks
 */
export function getR2Urls(key: string, config?: R2Config): {
  thumbnail: {
    placeholder: string;
    small: string;    // For grid - very low quality
    medium: string;   // For larger grid - low quality
    large: string;    // For lightbox preview
  };
  view: string;       // Lightbox preview
  download: string;   // Full quality for download
  original: string;   // Full quality original
} {
  const r2Config = config || getR2Config();
  if (!r2Config) {
    throw new Error('R2 configuration not available');
  }
  
  const baseUrl = r2Config.publicUrl.replace(/\/$/, '');
  const normalizedKey = normalizeR2ImageKey(key);
  const originalUrl = `${baseUrl}/${normalizedKey}`;
  
  return {
    thumbnail: {
      placeholder: getOptimizedUrl(baseUrl, normalizedKey, IMAGE_PRESETS.placeholder),
      small: getOptimizedUrl(baseUrl, normalizedKey, IMAGE_PRESETS.thumb),      // Very low quality for grid
      medium: getOptimizedUrl(baseUrl, normalizedKey, IMAGE_PRESETS.medium),    // Low quality for grid
      large: getOptimizedUrl(baseUrl, normalizedKey, IMAGE_PRESETS.preview),    // Preview for lightbox
    },
    view: getOptimizedUrl(baseUrl, normalizedKey, IMAGE_PRESETS.preview),       // Lightbox preview
    download: getOptimizedUrl(baseUrl, normalizedKey, IMAGE_PRESETS.full),      // Full quality
    original: originalUrl,                                             // Original (unresized)
  };
}

function normalizeR2FileEntry(file: R2File): R2File {
  const normalizedKey = normalizeR2ImageKey(file.key);
  if (normalizedKey === file.key) {
    return file;
  }

  const normalizedName = file.name.replace(/\.heic$/i, '.jpeg');
  const normalizedUrl = file.url.replace(/\.heic(\?|$)/i, '.jpeg$1');
  const normalizedThumbnailUrl = file.thumbnailUrl.replace(/\.heic(\?|$)/i, '.jpeg$1');

  return {
    ...file,
    key: normalizedKey,
    name: normalizedName,
    url: normalizedUrl,
    thumbnailUrl: normalizedThumbnailUrl,
  };
}

/**
 * Fetch files from R2 for a category
 * Uses static metadata file for static site exports
 */
/**
 * Fetch files from R2 for a category
 * Uses static metadata file for static site exports
 */
export async function fetchR2CategoryFiles(categoryId: string): Promise<R2File[]> {
  try {
    // In static exports, fetch from public folder
    const basePath = typeof window !== 'undefined' 
      ? window.location.pathname.split('/').slice(0, -1).filter(p => p && p !== 'kategori').join('/') || ''
      : '';
    
    interface CategoryData {
      categoryId: string;
      files: R2File[];
    }
    
    interface MetadataShape {
      categories?: CategoryData[];
    }
    
    // Try multiple paths for compatibility
    const paths = [
      `${basePath}/r2-metadata.json`,
      '/Resimler/r2-metadata.json',
      '/r2-metadata.json',
      `${basePath}/_next/static/data/r2-metadata.json`,
    ];
    
    let metadata: MetadataShape | null = null;
    
    for (const metadataPath of paths) {
      try {
        const response = await fetch(metadataPath);
        if (response.ok) {
          metadata = await response.json() as MetadataShape;
          break;
        }
      } catch {
        continue;
      }
    }
    
    // Fallback: try dynamic import (works in dev)
    if (!metadata) {
      try {
        const imported = await import('@/data/r2-metadata.json');
        metadata = imported as MetadataShape;
      } catch {
        console.warn('Failed to load R2 metadata from all sources');
      }
    }
    
    const typedMetadata = metadata;
    
    if (typedMetadata && typedMetadata.categories) {
      const category = typedMetadata.categories.find((cat) => cat.categoryId === categoryId);
      if (category && category.files) {
        return category.files.map(normalizeR2FileEntry);
      }
    }
    
    return [];
  } catch (error) {
    console.warn('R2 metadata file not found, returning empty array:', error);
    return [];
  }
}

/**
 * Generate R2 object key for a file
 */
export function generateR2Key(categoryId: string, fileName: string): string {
  // Sanitize filename and create path
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  
  return `${categoryId}/${sanitized}`;
}
