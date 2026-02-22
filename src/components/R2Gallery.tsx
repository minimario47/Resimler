'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, FolderOpen, RefreshCw } from 'lucide-react';
import { getR2Urls, fetchR2CategoryFiles, R2File } from '@/lib/r2-storage';
import { getFromCache, setInCache } from '@/lib/cache';
import MediaGrid from './MediaGrid';
import GridControls from './GridControls';
import { GridSize, MediaItem, SortOption } from '@/types';

interface R2GalleryProps {
  categoryId: string;
  categoryName: string;
  categoryDate?: string;
}

const ITEMS_PER_PAGE = 30;

export default function R2Gallery({ categoryId, categoryName, categoryDate = '2025-12-25' }: R2GalleryProps) {
  const [images, setImages] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>('normal');
  const [sortOption, setSortOption] = useState<SortOption>('chronological');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFetched = useRef(false);

  const pageFromQuery = Number(searchParams.get('page') || '1');
  const initialPage = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const nextPage = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;
    setCurrentPage(nextPage);
  }, [pageFromQuery]);

  const setPage = useCallback(
    (page: number, mode: 'push' | 'replace' = 'push') => {
      const safeTargetPage = Math.max(1, page);
      setCurrentPage(safeTargetPage);
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', safeTargetPage.toString());
      const href = `${pathname}?${params.toString()}`;
      if (mode === 'replace') {
        router.replace(href, { scroll: false });
        return;
      }
      router.push(href, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const fetchFromNetwork = useCallback(async (cacheKey: string, isBackground: boolean) => {
    try {
      const files = await fetchR2CategoryFiles(categoryId);

      if (files.length === 0) {
        if (!isBackground) {
          setError('Bu kategori için henüz fotoğraf eklenmemiş.');
        }
        setImages([]);
      } else {
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
  }, [categoryId]);

  const fetchImages = useCallback(async (forceRefresh = false) => {
    const cacheKey = `r2_category_${categoryId}`;

    if (!forceRefresh) {
      const cached = getFromCache<R2File[]>(cacheKey);
      if (cached) {
        setImages(cached.data);
        setLoading(false);
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
  }, [categoryId, fetchFromNetwork]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchImages();
    }
  }, [fetchImages]);

  const mediaItems: MediaItem[] = images.map((img, index) => {
    const urls = getR2Urls(img.key);
    const heights = [1080, 1280, 1440, 1600, 1200];
    const randomHeight = heights[index % heights.length];
    const normalizedKey = img.key?.trim() || '';
    const stableId = normalizedKey
      ? `r2:${normalizedKey}`
      : img.id?.trim()
      ? `r2:id:${img.id.trim()}-${index}`
      : `r2:${categoryId}:${index}`;

    return {
      id: stableId,
      title: img.name.replace(/\.[^.]+$/, ''),
      description: `${categoryName}`,
      media_type: 'photo',
      created_at: categoryDate,
      source: 'local',
      source_url: urls.view,
      thumbnails: {
        placeholder: urls.thumbnail.placeholder,
        small: urls.thumbnail.small,
        medium: urls.thumbnail.medium,
        large: urls.thumbnail.large,
      },
      original_url: urls.original,
      width: 1920,
      height: randomHeight,
      tags: [categoryId],
      is_public: true,
      featured: index < 3,
      favorites_count: 0,
      category_id: categoryId,
    };
  });

  const sortedMedia = useMemo(() => {
    const list = [...mediaItems];
    if (sortOption === 'reverse') {
      list.reverse();
    } else if (sortOption === 'featured') {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [mediaItems, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedMedia.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safePage) {
      setPage(safePage, 'replace');
    }
  }, [currentPage, safePage, setPage]);

  useEffect(() => {
    if (safePage !== 1) {
      setPage(1, 'replace');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption]);

  const paginatedMedia = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return sortedMedia.slice(start, start + ITEMS_PER_PAGE);
  }, [safePage, sortedMedia]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2">
          <div className="h-6 w-24 bg-slate/10 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-slate/10 rounded animate-pulse" />
            <div className="h-10 w-10 bg-slate/10 rounded animate-pulse" />
          </div>
        </div>
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
        <p className="text-sm text-slate/40 mt-2">Bu kategori için fotoğraflar yakında eklenecek.</p>
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

      <div className="mb-3 rounded-xl border border-slate/10 bg-white/60 px-4 py-2 text-sm text-slate/70">
        Sayfa {safePage} / {totalPages} • Bu sayfada {paginatedMedia.length} fotoğraf (toplam {sortedMedia.length})
      </div>

      <MediaGrid media={paginatedMedia} gridSize={gridSize} />

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Galeri sayfalama">
          <button
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-slate/20 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </button>

          <div className="px-3 text-sm text-slate/70">{safePage}</div>

          <button
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-2 rounded-lg border border-slate/20 bg-white px-3 py-2 text-sm disabled:opacity-40"
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </>
  );
}
