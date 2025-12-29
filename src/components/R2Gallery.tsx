'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, FolderOpen } from 'lucide-react';
import { getR2Urls, fetchR2CategoryFiles, R2File } from '@/lib/r2-storage';
import { getFromCache, setInCache } from '@/lib/cache';
import MediaGrid from './MediaGrid';
import GridControls from './GridControls';
import { MediaItem, GridSize, SortOption } from '@/types';

interface R2GalleryProps {
  categoryId: string;
  categoryName: string;
  categoryDate?: string;
}

export default function R2Gallery({ categoryId, categoryName, categoryDate = '2025-12-25' }: R2GalleryProps) {
  const [images, setImages] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>('normal');
  const [sortOption, setSortOption] = useState<SortOption>('chronological');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const fetchImages = useCallback(async (forceRefresh = false) => {
    const cacheKey = `r2_category_${categoryId}`;

    // Try to get cached data first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getFromCache<R2File[]>(cacheKey);
      if (cached) {
        setImages(cached.data);
        setLoading(false);
        
        // If data is stale, refresh in background
        if (cached.isStale) {
          fetchFromNetwork(cacheKey, true);
        }
        return;
      }
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    await fetchFromNetwork(cacheKey, forceRefresh);
  }, [categoryId]);

  const fetchFromNetwork = async (cacheKey: string, isBackground: boolean) => {
    try {
      const files = await fetchR2CategoryFiles(categoryId);
      
      if (files.length === 0) {
        if (!isBackground) {
          setError('Bu kategori için henüz fotoğraf eklenmemiş.');
        }
        setImages([]);
      } else {
        // Cache the results for 30 minutes (R2 is more stable than Drive)
        setInCache(cacheKey, files, 30 * 60 * 1000);
        setImages(files);
      }
      
    } catch (fetchError) {
      console.error('Fetch failed:', fetchError);
      if (!isBackground) {
        setError('Fotoğraflar yüklenirken bir hata oluştu.');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  // Initial fetch - only once
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchImages();
    }
  }, [fetchImages]);

  // Convert R2 files to MediaItem format for MediaGrid
  const mediaItems: MediaItem[] = images.map((img, index) => {
    const urls = getR2Urls(img.key);
    // Use different aspect ratios for visual variety
    const heights = [1080, 1280, 1440, 1600, 1200];
    const randomHeight = heights[index % heights.length];
    
    return {
      id: img.id,
      title: img.name.replace(/\.[^.]+$/, ''),
      description: `${categoryName}`,
      media_type: 'photo',
      created_at: categoryDate,
      source: 'local', // R2 is treated as local storage
      source_url: urls.view,
      thumbnails: {
        placeholder: urls.thumbnail.placeholder, // Tiny blur-up image
        small: urls.thumbnail.small,
        medium: urls.thumbnail.medium,
        large: urls.thumbnail.large,
      },
      original_url: urls.original, // Use original for full quality
      width: 1920,
      height: randomHeight,
      tags: [categoryId],
      is_public: true,
      featured: index < 3,
      favorites_count: 0,
      category_id: categoryId,
    };
  });

  // Apply sorting
  const sortedMedia = [...mediaItems];
  if (sortOption === 'reverse') {
    sortedMedia.reverse();
  } else if (sortOption === 'featured') {
    sortedMedia.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  if (loading) {
    // Skeleton loading for better perceived performance
    return (
      <div className="space-y-4">
        {/* Skeleton for grid controls */}
        <div className="flex justify-between items-center py-2">
          <div className="h-6 w-24 bg-slate/10 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-slate/10 rounded animate-pulse" />
            <div className="h-10 w-10 bg-slate/10 rounded animate-pulse" />
          </div>
        </div>
        {/* Skeleton grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="aspect-[4/5] rounded-lg bg-slate/10 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <FolderOpen className="w-12 h-12 text-slate/30 mx-auto mb-4" />
        <p className="text-slate/60">{error}</p>
        <p className="text-sm text-slate/40 mt-2">
          Bu kategori için fotoğraflar yakında eklenecek.
        </p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <FolderOpen className="w-12 h-12 text-slate/30 mx-auto mb-4" />
        <p className="text-slate/60">Bu klasörde henüz fotoğraf yok.</p>
        <button
          onClick={() => fetchImages(true)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate/10 rounded-lg hover:bg-slate/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Grid controls */}
      <GridControls
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        sortOption={sortOption}
        onSortChange={setSortOption}
        mediaType="all"
        onMediaTypeChange={() => {}}
        photoCount={images.length}
        hideMediaTypeFilter
        showRefresh
        onRefresh={() => fetchImages(true)}
        isRefreshing={isRefreshing}
      />

      {/* Photo grid */}
      <MediaGrid media={sortedMedia} gridSize={gridSize} />
    </>
  );
}
