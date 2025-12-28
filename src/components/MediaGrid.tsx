'use client';

import { useState, useMemo } from 'react';
import Masonry from 'react-masonry-css';
import { Play, Heart } from 'lucide-react';
import { MediaItem, GridSize } from '@/types';
import Lightbox from './Lightbox';

interface MediaGridProps {
  media: MediaItem[];
  gridSize?: GridSize;
}

export default function MediaGrid({ media, gridSize = 'normal' }: MediaGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const breakpointCols = useMemo((): { default: number; [key: number]: number } => {
    switch (gridSize) {
      case 'compact':
        return { default: 4, 1024: 3, 768: 3, 420: 2 };
      case 'large':
        return { default: 2, 1024: 2, 768: 1, 420: 1 };
      default:
        return { default: 4, 1024: 3, 768: 2, 420: 2 };
    }
  }, [gridSize]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointCols}
        className="flex w-auto -ml-2"
        columnClassName="pl-2 bg-clip-padding"
      >
        {media.map((item, index) => (
          <div
            key={item.id}
            className="mb-2 animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
          >
            <div
              onClick={() => setSelectedIndex(index)}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-slate/5"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedIndex(index)}
              aria-label={`${item.title} görüntüle`}
            >
              {/* Image */}
              <div
                className="relative bg-slate/5"
                style={{
                  aspectRatio: `${item.width} / ${item.height}`,
                }}
              >
                <img
                  src={item.thumbnails.medium}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to small thumbnail if medium fails
                    const target = e.target as HTMLImageElement;
                    if (target.src !== item.thumbnails.small) {
                      target.src = item.thumbnails.small;
                    } else {
                      // Final fallback to original URL
                      target.src = item.original_url;
                    }
                  }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                {/* Video indicator */}
                {item.media_type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-slate ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                )}

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 flex items-end justify-between">
                  {/* Date badge */}
                  <span className="text-xs text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                    {new Date(item.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>

                  {/* Duration for videos */}
                  {item.media_type === 'video' && item.duration && (
                    <span className="text-xs text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                      {formatDuration(item.duration)}
                    </span>
                  )}
                </div>

                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(e, item.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={favorites.has(item.id) ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(item.id)
                        ? 'text-accent fill-accent'
                        : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </Masonry>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          media={media}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
