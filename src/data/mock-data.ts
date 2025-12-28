import { Category } from '@/types';
import { getCategoryCoverImage, getCategoryFeaturedThumbnails } from '@/lib/category-images';

// Google Drive folder IDs for each category
export const DRIVE_FOLDERS = {
  'dugunden-once': '147X9FoyAczw0zvSe2vS7SuZLhr7VLate',
  'kina-gecesi': '1JeSgvgoyDTWmWZjLgXFgRKaUPqCrko_U',
  'dugun': '1ZzbzNkvAbbFt41AanPlgWYMyVUJmrvhP',
  'featured': '1qMY0PlH_kTGtiW5hvQFCCjlGu1n2e9tW', // Öne Çıkanlar folder
};

export const categories: Category[] = [
  {
    id: 'dugunden-once',
    name: 'Düğünden Önce',
    slug: 'dugunden-once',
    description: 'Hazırlıklar, gelin alayı ve özel anlar',
    date_range: '24-25 Aralık 2025',
    cover_image: getCategoryCoverImage(
      'dugunden-once',
      'https://drive.google.com/thumbnail?id=1KKtFekFxbUQEeLsjVAkzqas8SSvNeNu4&sz=w800'
    ),
    media_count: 0,
    featured_thumbnails: getCategoryFeaturedThumbnails('dugunden-once', 3),
    drive_folder_id: DRIVE_FOLDERS['dugunden-once'],
  },
  {
    id: 'kina-gecesi',
    name: 'Kına Gecesi',
    slug: 'kina-gecesi',
    description: 'Geleneksel kına töreni ve eğlence',
    date_range: '26 Aralık 2025',
    cover_image: getCategoryCoverImage(
      'kina-gecesi',
      'https://drive.google.com/thumbnail?id=1JeSgvgoyDTWmWZjLgXFgRKaUPqCrko_U&sz=w800'
    ),
    media_count: 0,
    featured_thumbnails: getCategoryFeaturedThumbnails('kina-gecesi', 3),
    drive_folder_id: DRIVE_FOLDERS['kina-gecesi'],
  },
  {
    id: 'dugun',
    name: 'Düğün Günü',
    slug: 'dugun',
    description: 'Nikah ve düğün töreni',
    date_range: '27 Aralık 2025',
    cover_image: getCategoryCoverImage(
      'dugun',
      'https://drive.google.com/thumbnail?id=1ZzbzNkvAbbFt41AanPlgWYMyVUJmrvhP&sz=w800'
    ),
    media_count: 0,
    featured_thumbnails: getCategoryFeaturedThumbnails('dugun', 3),
    drive_folder_id: DRIVE_FOLDERS['dugun'],
  },
];

// Helper functions to get data
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}
