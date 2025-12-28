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
 * Generate R2 URLs for a file
 */
export function getR2Urls(key: string, config?: R2Config): {
  thumbnail: {
    small: string;
    medium: string;
    large: string;
  };
  view: string;
  download: string;
} {
  const r2Config = config || getR2Config();
  if (!r2Config) {
    throw new Error('R2 configuration not available');
  }
  
  const baseUrl = r2Config.publicUrl.replace(/\/$/, '');
  const fileUrl = `${baseUrl}/${key}`;
  
  return {
    thumbnail: {
      small: fileUrl, // R2 can serve optimized thumbnails if configured
      medium: fileUrl,
      large: fileUrl,
    },
    view: fileUrl,
    download: fileUrl,
  };
}

/**
 * Fetch files from R2 for a category
 * Uses static metadata file for static site exports
 */
export async function fetchR2CategoryFiles(categoryId: string): Promise<R2File[]> {
  try {
    // Try to load from static metadata file (for static exports)
    try {
      const metadata = await import('@/data/r2-metadata.json');
      const category = metadata.categories?.find((cat: any) => cat.categoryId === categoryId);
      if (category && category.files) {
        return category.files;
      }
    } catch {
      // Metadata file doesn't exist, try API route (for dev server)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/r2/category/${categoryId}`);
      
      if (response.ok) {
        const files: R2File[] = await response.json();
        return files;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching R2 category files:', error);
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
