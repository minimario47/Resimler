import { Category, MediaItem, FeaturedMoment, Album } from '@/types';

// Demo images from Unsplash (wedding themed)
const weddingImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
  'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
  'https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?w=800',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
  'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
  'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
  'https://images.unsplash.com/photo-1546032996-6dfacbacbf3f?w=800',
  'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800',
  'https://images.unsplash.com/photo-1478476868527-002ae3f3e159?w=800',
];

const kinaImages = [
  'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800',
  'https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?w=800',
  'https://images.unsplash.com/photo-1583939411023-14783179e581?w=800',
  'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=800',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
  'https://images.unsplash.com/photo-1470290378698-263fa7ca60ab?w=800',
];

const preWeddingImages = [
  'https://images.unsplash.com/photo-1610173826608-e31f1d0d4c80?w=800',
  'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800',
  'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800',
  'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800',
  'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800',
  'https://images.unsplash.com/photo-1523912997327-a4a458f0a19c?w=800',
];

export const categories: Category[] = [
  {
    id: 'dugunden-once',
    name: 'Düğünden Önce',
    slug: 'dugunden-once',
    description: 'Hazırlıklar, gelin alayı ve özel anlar',
    date_range: '14-15 Temmuz 2025',
    cover_image: preWeddingImages[0],
    media_count: 156,
    featured_thumbnails: preWeddingImages.slice(0, 3),
  },
  {
    id: 'kina-gecesi',
    name: 'Kına Gecesi',
    slug: 'kina-gecesi',
    description: 'Geleneksel kına töreni ve eğlence',
    date_range: '16 Temmuz 2025',
    cover_image: kinaImages[0],
    media_count: 89,
    featured_thumbnails: kinaImages.slice(0, 3),
  },
  {
    id: 'dugun',
    name: 'Düğün',
    slug: 'dugun',
    description: 'Nikah ve düğün töreni',
    date_range: '17 Temmuz 2025',
    cover_image: weddingImages[0],
    media_count: 312,
    featured_thumbnails: weddingImages.slice(0, 3),
  },
];

export const featuredMoments: FeaturedMoment[] = [
  {
    id: 'fm-1',
    title: 'İlk Dans',
    subtitle: 'Unutulmaz anlar',
    image: weddingImages[1],
    media_id: 'media-dugun-1',
    category_id: 'dugun',
  },
  {
    id: 'fm-2',
    title: 'Kına Yakma',
    subtitle: 'Geleneksel tören',
    image: kinaImages[0],
    media_id: 'media-kina-1',
    category_id: 'kina-gecesi',
  },
  {
    id: 'fm-3',
    title: 'Gelin Alayı',
    subtitle: 'Nusaybin sokakları',
    image: preWeddingImages[2],
    media_id: 'media-once-1',
    category_id: 'dugunden-once',
  },
  {
    id: 'fm-4',
    title: 'Nikah Anı',
    subtitle: 'Evet dediler',
    image: weddingImages[3],
    media_id: 'media-dugun-3',
    category_id: 'dugun',
  },
];

// Generate media items for each category
function generateMediaItems(
  categoryId: string,
  images: string[],
  dateBase: string
): MediaItem[] {
  return images.map((img, index) => ({
    id: `media-${categoryId}-${index}`,
    title: `${getCategoryName(categoryId)} - ${index + 1}`,
    description: getRandomDescription(),
    media_type: Math.random() > 0.9 ? 'video' : 'photo',
    created_at: dateBase,
    source: 'google_drive',
    thumbnails: {
      small: img.replace('w=800', 'w=200'),
      medium: img.replace('w=800', 'w=400'),
      large: img,
    },
    original_url: img.replace('w=800', 'w=1920'),
    duration: Math.random() > 0.9 ? Math.floor(Math.random() * 180) + 30 : undefined,
    width: 1920,
    height: getRandomHeight(),
    tags: getRandomTags(),
    is_public: true,
    featured: index < 3,
    favorites_count: Math.floor(Math.random() * 50),
    category_id: categoryId,
  }));
}

function getCategoryName(categoryId: string): string {
  const cat = categories.find(c => c.id === categoryId);
  return cat?.name || categoryId;
}

function getRandomDescription(): string {
  const descriptions = [
    'Muhteşem bir an',
    'Ailemizle birlikte',
    'Özel dakikalar',
    'Neşeli anlar',
    'Hatıralar',
    'Güzel bir gün',
    undefined,
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)] || '';
}

function getRandomHeight(): number {
  const heights = [1080, 1280, 1440, 1920, 2160];
  return heights[Math.floor(Math.random() * heights.length)];
}

function getRandomTags(): string[] {
  const allTags = ['aile', 'gelin', 'damat', 'dans', 'müzik', 'yemek', 'tören', 'hazırlık', 'gece', 'gündüz'];
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...allTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const mediaItems: MediaItem[] = [
  ...generateMediaItems('dugunden-once', preWeddingImages, '2025-07-14'),
  ...generateMediaItems('kina-gecesi', kinaImages, '2025-07-16'),
  ...generateMediaItems('dugun', weddingImages, '2025-07-17'),
];

export const albums: Album[] = [
  {
    id: 'album-1',
    name: 'Gelin Hazırlıkları',
    category_id: 'dugunden-once',
    cover_image: preWeddingImages[0],
    media_count: 45,
    is_protected: false,
  },
  {
    id: 'album-2',
    name: 'Kına Gelenekleri',
    category_id: 'kina-gecesi',
    cover_image: kinaImages[1],
    media_count: 32,
    is_protected: false,
  },
  {
    id: 'album-3',
    name: 'Düğün Töreni',
    category_id: 'dugun',
    cover_image: weddingImages[2],
    media_count: 78,
    is_protected: false,
  },
];

// Helper functions to get data
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

export function getMediaByCategory(categoryId: string): MediaItem[] {
  return mediaItems.filter(m => m.category_id === categoryId);
}

export function getMediaById(id: string): MediaItem | undefined {
  return mediaItems.find(m => m.id === id);
}

export function getFeaturedMedia(): MediaItem[] {
  return mediaItems.filter(m => m.featured);
}

export function searchMedia(query: string): MediaItem[] {
  const lowerQuery = query.toLowerCase();
  return mediaItems.filter(m => 
    m.title.toLowerCase().includes(lowerQuery) ||
    m.description?.toLowerCase().includes(lowerQuery) ||
    m.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}
