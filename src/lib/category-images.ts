/**
 * Helper functions to get category cover images from R2 metadata
 * Uses Cloudflare Worker for optimized image delivery
 */

import r2MetadataJson from '@/data/r2-metadata.json';
import { normalizeR2ImageKey } from '@/lib/r2-storage';

// Worker URL for optimized images
const WORKER_URL = 'https://wedding-photos.xaco47.workers.dev';

interface R2File {
  url: string;
  thumbnailUrl: string;
  name: string;
  key: string;
}

interface R2Metadata {
  categories: Array<{
    categoryId: string;
    files: R2File[];
  }>;
}

const PREFERRED_COVER_KEYS: Record<string, string> = {
  'dugunden-once': 'featured/IMG_1320.jpeg',
  'kina-gecesi': 'kina-gecesi/IMG_1888.jpeg',
  'dugun': 'dugun/IMG_2517.JPG',
};

// Get metadata from static import
function getMetadata(): R2Metadata | null {
  try {
    return r2MetadataJson as R2Metadata;
  } catch {
    return null;
  }
}

function getFileByKey(metadata: R2Metadata, key: string): R2File | null {
  for (const category of metadata.categories || []) {
    const found = category.files?.find((file) => file.key === key);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * Convert R2 file to Worker URL with size params
 * Uses low quality by default for fast loading
 */
function getOptimizedUrl(file: R2File, width: number = 300, quality: number = 40): string {
  // Use the key to build Worker URL
  const normalizedKey = normalizeR2ImageKey(file.key);
  return `${WORKER_URL}/${normalizedKey}?w=${width}&q=${quality}`;
}

/**
 * Get cover image URL for a category from R2 metadata
 * Uses low quality (40%) for fast loading on category tiles
 */
export function getCategoryCoverImage(categoryId: string): string {
  try {
    const metadata = getMetadata();
    if (!metadata) return 'https://via.placeholder.com/800x600?text=Photo+Coming+Soon';

    const preferredKey = PREFERRED_COVER_KEYS[categoryId];
    if (preferredKey) {
      const preferredFile = getFileByKey(metadata, preferredKey);
      if (preferredFile) {
        return getOptimizedUrl(preferredFile, 500, 40);
      }
    }

    const category = metadata.categories?.find(cat => cat.categoryId === categoryId);

    if (category && category.files && category.files.length > 0) {
      // Get the first image file (prefer JPEG over HEIC for better compatibility)
      const jpegFile = category.files.find(f => 
        /\.(jpg|jpeg|png|webp)$/i.test(f.name)
      );
      
      const file = jpegFile || category.files[0];
      // Low quality for category cover (fast loading)
      return getOptimizedUrl(file, 500, 40);
    }
  } catch (error) {
    console.warn('Failed to get R2 cover image:', error);
  }
  
  return 'https://via.placeholder.com/800x600?text=Photo+Coming+Soon';
}

/**
 * Get featured thumbnails for a category
 * Uses very low quality (35%) for fast loading
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
        .map(f => getOptimizedUrl(f, 250, 35));
    }
  } catch (error) {
    console.warn('Failed to get R2 featured thumbnails:', error);
  }
  
  return [];
}

/**
 * Get hero image for the home page
 * Uses moderate quality (50%) - hero is important but should still load fast
 */
export function getHeroImage(): string {
  try {
    const metadata = getMetadata();
    if (!metadata || !metadata.categories || metadata.categories.length === 0) {
      return 'https://via.placeholder.com/1920x1080?text=Wedding+Photos';
    }

    const preferredHeroFile = getFileByKey(metadata, 'featured/IMG_1102.jpeg');
    if (preferredHeroFile) {
      return getOptimizedUrl(preferredHeroFile, 1200, 50);
    }

    // Fallback: first JPEG from first category
    const firstCategory = metadata.categories[0];
    if (firstCategory && firstCategory.files && firstCategory.files.length > 0) {
      const jpegFile = firstCategory.files.find((f) => /\.(jpg|jpeg|png|webp)$/i.test(f.name));
      const file = jpegFile || firstCategory.files[0];
      return getOptimizedUrl(file, 1200, 50);
    }
  } catch (error) {
    console.warn('Failed to get hero image:', error);
  }
  
  return 'https://via.placeholder.com/1920x1080?text=Wedding+Photos';
}

/**
 * Get featured images for carousel on home page
 * Uses low quality (40%) for fast loading
 */
export function getFeaturedImages(): Array<{ id: string; name: string; thumbnailUrl: string; key: string }> {
  try {
    const metadata = getMetadata();
    if (!metadata) return [];
    
    const featuredCategory = metadata.categories?.find((cat) => cat.categoryId === 'featured');
    if (featuredCategory?.files?.length) {
      const jpegFiles = featuredCategory.files.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f.name));
      const filesToUse = jpegFiles.length > 0 ? jpegFiles : featuredCategory.files;

      return filesToUse.slice(0, 12).map((f, i) => ({
        id: `featured-${i}`,
        name: f.name,
        key: normalizeR2ImageKey(f.key),
        thumbnailUrl: getOptimizedUrl(f, 350, 40),
      }));
    }

    const allImages: Array<{ id: string; name: string; thumbnailUrl: string; key: string }> = [];

    // Fallback: pull from categories when dedicated featured set is unavailable.
    for (const category of metadata.categories || []) {
      if (!category.files || category.files.length === 0) continue;
      const jpegFiles = category.files.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f.name));
      const filesToUse = jpegFiles.length > 0 ? jpegFiles : category.files;
      filesToUse.slice(0, 4).forEach((f, i) => {
        allImages.push({
          id: `${category.categoryId}-${i}`,
          name: f.name,
          key: normalizeR2ImageKey(f.key),
          thumbnailUrl: getOptimizedUrl(f, 350, 40),
        });
      });
    }

    return allImages;
  } catch (error) {
    console.warn('Failed to get featured images:', error);
  }
  
  return [];
}
