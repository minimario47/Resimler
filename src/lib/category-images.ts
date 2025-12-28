/**
 * Helper functions to get category cover images from R2 metadata
 */

interface R2Metadata {
  categories: Array<{
    categoryId: string;
    files: Array<{
      url: string;
      thumbnailUrl: string;
      name: string;
    }>;
  }>;
}

// Lazy load metadata to avoid issues if file doesn't exist
let metadata: R2Metadata | null = null;

function getMetadata(): R2Metadata | null {
  if (metadata) return metadata;
  
  try {
    // Dynamic import to handle cases where file might not exist
    const r2Metadata = require('@/data/r2-metadata.json');
    metadata = r2Metadata as R2Metadata;
    return metadata;
  } catch (error) {
    console.warn('R2 metadata file not found, using fallback images');
    return null;
  }
}

/**
 * Get cover image URL for a category from R2 metadata
 * Falls back to Google Drive URL if R2 metadata not available
 */
export function getCategoryCoverImage(categoryId: string, fallbackUrl?: string): string {
  try {
    const metadata = getMetadata();
    if (!metadata) return fallbackUrl || 'https://via.placeholder.com/800x600?text=Photo+Coming+Soon';
    
    const category = metadata.categories?.find(cat => cat.categoryId === categoryId);
    
    if (category && category.files && category.files.length > 0) {
      // Get the first image file (prefer JPEG over HEIC for better compatibility)
      const jpegFile = category.files.find(f => 
        /\.(jpg|jpeg|png|webp)$/i.test(f.name)
      );
      
      if (jpegFile) {
        return jpegFile.thumbnailUrl;
      }
      
      // Fallback to first file if no JPEG found
      return category.files[0].thumbnailUrl;
    }
  } catch (error) {
    console.warn('Failed to get R2 cover image:', error);
  }
  
  // Fallback to provided Google Drive URL or default
  return fallbackUrl || 'https://via.placeholder.com/800x600?text=Photo+Coming+Soon';
}

/**
 * Get featured thumbnails for a category
 */
export function getCategoryFeaturedThumbnails(categoryId: string, count: number = 3): string[] {
  try {
    const metadata = getMetadata();
    if (!metadata) return [];
    
    const category = metadata.categories?.find(cat => cat.categoryId === categoryId);
    
    if (category && category.files && category.files.length > 0) {
      // Prefer JPEG images
      const jpegFiles = category.files.filter(f => 
        /\.(jpg|jpeg|png|webp)$/i.test(f.name)
      );
      
      const filesToUse = jpegFiles.length >= count ? jpegFiles : category.files;
      
      return filesToUse
        .slice(0, count)
        .map(f => f.thumbnailUrl);
    }
  } catch (error) {
    console.warn('Failed to get R2 featured thumbnails:', error);
  }
  
  return [];
}
