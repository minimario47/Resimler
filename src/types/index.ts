export type MediaType = 'photo' | 'video';
export type MediaSource = 'google_drive' | 'icloud' | 'local' | 'other';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  media_type: MediaType;
  created_at: string;
  source: MediaSource;
  source_url?: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
  original_url: string;
  duration?: number; // for videos, in seconds
  width: number;
  height: number;
  tags: string[];
  is_public: boolean;
  featured: boolean;
  favorites_count: number;
  category_id: string;
  album_id?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  date_range: string;
  cover_image: string;
  media_count: number;
  featured_thumbnails: string[];
  // Google Drive folder ID for this category's photos
  drive_folder_id?: string;
}

export interface Album {
  id: string;
  name: string;
  category_id: string;
  cover_media_id?: string;
  cover_image?: string;
  media_count: number;
  is_protected: boolean;
  invite_code?: string;
}

export interface FeaturedMoment {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  media_id: string;
  category_id: string;
}

export type GridSize = 'compact' | 'normal' | 'large';
export type SortOption = 'chronological' | 'reverse' | 'featured';
