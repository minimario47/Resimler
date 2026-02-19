'use client';

import { useState, useMemo, memo, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { Play, Heart } from 'lucide-react';
import { MediaItem, GridSize } from '@/types';
import Lightbox from './Lightbox';
import ProgressiveImage from './ProgressiveImage';

interface MediaGridProps {
  media: MediaItem[];
  gridSize?: GridSize;
}

// Memoized grid item component for performance
interface GridItemProps {
  item: MediaItem;
  index: number;
  onSelect: (index: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

const GridItem = memo(function GridItem({ 
  item, 
  index, 
  onSelect, 
  isFavorite, 
  onToggleFavorite 
}: GridItemProps) {
  const handleClick = useCallback(() => onSelect(index), [onSelect, index]);
  const handleFavorite = useCallback((e: React.MouseEvent) => onToggleFavorite(e, item.id), [onToggleFavorite, item.id]);
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Prioritize first viewport rows for faster perceived loading
  const isPriority = index < 8;

  return (
    <div
      className="mb-2 animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
    >
      <div
        className="relative group cursor-pointer rounded-lg overflow-hidden bg-slate/5"
        role="button"
        tabIndex={0}
        aria-label={`${item.title} görüntüle`}
      >
        {/* Progressive Image with blur-up loading */}
        <div className="relative">
          <ProgressiveImage
            src={item.original_url}
            thumbnailSrc={item.thumbnails.placeholder}
            mediumSrc={item.thumbnails.medium}
            largeSrc={item.thumbnails.large}
            alt={item.title}
            width={item.width}
            height={item.height}
            priority={isPriority}
            onClick={handleClick}
            className="transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

          {/* Video indicator */}
          {item.media_type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-slate ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 flex items-end justify-between pointer-events-none">
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
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite
                  ? 'text-accent fill-accent'
                  : 'text-white'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
});

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

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
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
  }, []);

  return (
    <>
      <Masonry
        breakpointCols={breakpointCols}
        className="flex w-auto -ml-2"
        columnClassName="pl-2 bg-clip-padding"
      >
        {media.map((item, index) => (
          <GridItem
            key={item.id}
            item={item}
            index={index}
            onSelect={handleSelect}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={toggleFavorite}
          />
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
