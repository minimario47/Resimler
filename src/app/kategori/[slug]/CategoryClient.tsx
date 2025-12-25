'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import MediaGrid from '@/components/MediaGrid';
import GridControls from '@/components/GridControls';
import Footer from '@/components/Footer';
import { Category, MediaItem, GridSize, SortOption } from '@/types';
import { Camera, Video } from 'lucide-react';

interface CategoryClientProps {
  category: Category;
  media: MediaItem[];
}

export default function CategoryClient({ category, media }: CategoryClientProps) {
  const [gridSize, setGridSize] = useState<GridSize>('normal');
  const [sortOption, setSortOption] = useState<SortOption>('chronological');
  const [mediaType, setMediaType] = useState<'all' | 'photo' | 'video'>('all');

  const filteredMedia = useMemo(() => {
    let result = [...media];

    // Filter by media type
    if (mediaType !== 'all') {
      result = result.filter((m) => m.media_type === mediaType);
    }

    // Sort
    switch (sortOption) {
      case 'reverse':
        result.reverse();
        break;
      case 'featured':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [media, mediaType, sortOption]);

  const photoCount = media.filter((m) => m.media_type === 'photo').length;
  const videoCount = media.filter((m) => m.media_type === 'video').length;

  return (
    <main className="min-h-screen bg-cream">
      <Header showBack title={category.name} />

      {/* Hero banner */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${category.cover_image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">
              {category.name}
            </h1>
            <p className="text-white/80 text-sm md:text-base mt-1">
              {category.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                {photoCount} fotoğraf
              </span>
              <span className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                {videoCount} video
              </span>
              <span>{category.date_range}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid controls */}
      <GridControls
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        sortOption={sortOption}
        onSortChange={setSortOption}
        mediaType={mediaType}
        onMediaTypeChange={setMediaType}
      />

      {/* Media grid */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {filteredMedia.length > 0 ? (
          <MediaGrid media={filteredMedia} gridSize={gridSize} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate/60">Bu filtreyle eşleşen medya bulunamadı.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
