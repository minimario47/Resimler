import { Category } from '@/types';
import { getCategoryCoverImage, getCategoryFeaturedThumbnails } from '@/lib/category-images';

// Category IDs (matching R2 folder structure)
export const CATEGORY_IDS = {
  'dugunden-once': 'dugunden-once',
  'kina-gecesi': 'kina-gecesi',
  'dugun': 'dugun',
};

// Legacy: Google Drive folder IDs (used only by migration script)
// These are no longer used for photo display - all photos served from R2
export const DRIVE_FOLDERS = {
  'dugunden-once': '147X9FoyAczw0zvSe2vS7SuZLhr7VLate',
  'kina-gecesi': '1JeSgvgoyDTWmWZjLgXFgRKaUPqCrko_U',
  'dugun': '1ZzbzNkvAbbFt41AanPlgWYMyVUJmrvhP',
  'featured': '1qMY0PlH_kTGtiW5hvQFCCjlGu1n2e9tW',
};

export const categories: Category[] = [
  {
    id: 'dugunden-once',
    name: 'Düğünden Önce',
    slug: 'dugunden-once',
    description: '',
    date_range: '24-25 Aralık 2025',
    cover_image: getCategoryCoverImage('dugunden-once'),
    media_count: 0,
    featured_thumbnails: getCategoryFeaturedThumbnails('dugunden-once', 3),
  },
  {
    id: 'kina-gecesi',
    name: 'Kına Gecesi',
    slug: 'kina-gecesi',
    description: '',
    date_range: '26 Aralık 2025',
    cover_image: getCategoryCoverImage('kina-gecesi'),
    media_count: 0,
    featured_thumbnails: getCategoryFeaturedThumbnails('kina-gecesi', 3),
  },
  {
    id: 'dugun',
    name: 'Düğün Günü',
    slug: 'dugun',
    description: '',
    date_range: '27 Aralık 2025',
    cover_image: getCategoryCoverImage('dugun'),
    media_count: 0,
    featured_thumbnails: getCategoryFeaturedThumbnails('dugun', 3),
  },
];

// Helper functions to get data
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}
