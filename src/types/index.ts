export type MediaType = 'photo' | 'video';
export type MediaSource = 'google_drive' | 'local';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  media_type: MediaType;
  created_at: string;
  source: MediaSource;
  source_url?: string;
  thumbnails: {
    placeholder?: string; // Tiny blur-up placeholder
    small: string;
    medium: string;
    large: string;
  };
  original_url: string;
  duration?: number;
  width: number;
  height: number;
  tags: string[];
  is_public: boolean;
  featured: boolean;
  favorites_count: number;
  category_id: string;
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
  drive_folder_id?: string;
}

export type GridSize = 'compact' | 'normal' | 'large';
export type SortOption = 'chronological' | 'reverse' | 'featured';
