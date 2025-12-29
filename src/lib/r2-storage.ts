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

// Get R2 configuration from environment variables
export function getR2Config(): R2Config | null {
  if (typeof window !== 'undefined') {
    // Client-side: R2 config should be public (via env vars)
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (!publicUrl) return null;
    
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
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }
  
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

/**
 * Image quality/size presets for progressive loading
 * These work with Cloudflare Image Resizing when using a custom domain
 */
export interface ImageSizePreset {
  width: number;
  quality: number;
  fit?: 'cover' | 'contain' | 'scale-down';
}

export const IMAGE_PRESETS = {
  // Tiny placeholder - very small, heavily compressed for blur-up effect
  placeholder: { width: 20, quality: 20, fit: 'cover' as const },
  // Small thumbnail - for grid preview on slow connections
  small: { width: 200, quality: 60, fit: 'cover' as const },
  // Medium thumbnail - standard grid view
  medium: { width: 400, quality: 75, fit: 'cover' as const },
  // Large - lightbox preview
  large: { width: 800, quality: 80, fit: 'cover' as const },
  // Full quality - original for download/zoom
  full: { width: 1920, quality: 90, fit: 'scale-down' as const },
};

/**
 * Generate optimized R2 URL with Cloudflare Image Resizing parameters
 * 
 * For this to work with resizing, you need one of:
 * 1. Custom domain with Cloudflare Image Resizing enabled
 * 2. Cloudflare Worker for image transformation
 * 
 * If using pub-*.r2.dev URLs, the params will be ignored but URLs remain valid.
 * The strategy is to have the infrastructure ready for when resizing is enabled.
 */
export function getOptimizedUrl(
  baseUrl: string,
  key: string,
  preset: ImageSizePreset
): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const originalUrl = `${cleanBaseUrl}/${key}`;
  
  // Check if using a custom domain (not r2.dev) which supports Image Resizing
  const isCustomDomain = !cleanBaseUrl.includes('.r2.dev');
  
  if (isCustomDomain) {
    // Use Cloudflare Image Resizing URL format
    // Format: /cdn-cgi/image/OPTIONS/IMAGE_URL
    const options = `w=${preset.width},q=${preset.quality},fit=${preset.fit || 'cover'},f=auto`;
    return `${cleanBaseUrl}/cdn-cgi/image/${options}/${key}`;
  }
  
  // For r2.dev URLs, append query params as hints for future compatibility
  // These won't resize now but document intent and work if Worker is added
  const params = new URLSearchParams({
    w: preset.width.toString(),
    q: preset.quality.toString(),
  });
  
  return `${originalUrl}?${params.toString()}`;
}

/**
 * Generate R2 URLs for a file with multiple size variants
 */
export function getR2Urls(key: string, config?: R2Config): {
  thumbnail: {
    placeholder: string;
    small: string;
    medium: string;
    large: string;
  };
  view: string;
  download: string;
  original: string;
} {
  const r2Config = config || getR2Config();
  if (!r2Config) {
    throw new Error('R2 configuration not available');
  }
  
  const baseUrl = r2Config.publicUrl.replace(/\/$/, '');
  const originalUrl = `${baseUrl}/${key}`;
  
  return {
    thumbnail: {
      placeholder: getOptimizedUrl(baseUrl, key, IMAGE_PRESETS.placeholder),
      small: getOptimizedUrl(baseUrl, key, IMAGE_PRESETS.small),
      medium: getOptimizedUrl(baseUrl, key, IMAGE_PRESETS.medium),
      large: getOptimizedUrl(baseUrl, key, IMAGE_PRESETS.large),
    },
    view: getOptimizedUrl(baseUrl, key, IMAGE_PRESETS.large),
    download: originalUrl, // Always use original for downloads
    original: originalUrl, // Full quality original
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
        return category.files;
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
