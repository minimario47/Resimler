'use client';

import { Grid3X3, Grid2X2, Square, SortAsc, RefreshCw, ExternalLink, Camera } from 'lucide-react';
import { GridSize, SortOption } from '@/types';

interface GridControlsProps {
  gridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  mediaType: 'all' | 'photo' | 'video';
  onMediaTypeChange: (type: 'all' | 'photo' | 'video') => void;
  // Optional props for Drive gallery
  photoCount?: number;
  hideMediaTypeFilter?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  driveFolderId?: string;
}

export default function GridControls({
  gridSize,
  onGridSizeChange,
  sortOption,
  onSortChange,
  mediaType,
  onMediaTypeChange,
  photoCount,
  hideMediaTypeFilter,
  showRefresh,
  onRefresh,
  isRefreshing,
  driveFolderId,
}: GridControlsProps) {
  return (
    <div className="sticky top-14 md:top-16 z-30 bg-cream/95 backdrop-blur-md border-b border-slate/10 py-3 px-4">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        {/* Left side: Filter pills or photo count */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {hideMediaTypeFilter ? (
            // Show photo count for Drive gallery
            <div className="flex items-center gap-2 text-slate/60">
              <Camera className="w-4 h-4" />
              <span className="text-sm">
                <span className="font-medium text-slate">{photoCount}</span> fotoğraf
              </span>
            </div>
          ) : (
            // Show filter buttons for static gallery
            <>
              <button
                onClick={() => onMediaTypeChange('all')}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
                  mediaType === 'all'
                    ? 'bg-slate text-cream'
                    : 'bg-slate/10 hover:bg-slate/20'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => onMediaTypeChange('photo')}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
                  mediaType === 'photo'
                    ? 'bg-slate text-cream'
                    : 'bg-slate/10 hover:bg-slate/20'
                }`}
              >
                Fotoğraflar
              </button>
              <button
                onClick={() => onMediaTypeChange('video')}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${
                  mediaType === 'video'
                    ? 'bg-slate text-cream'
                    : 'bg-slate/10 hover:bg-slate/20'
                }`}
              >
                Videolar
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Drive-specific actions */}
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate/10 hover:bg-slate/20 transition-colors disabled:opacity-50"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {driveFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${driveFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate/10 hover:bg-slate/20 transition-colors"
              title="Google Drive'da Aç"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-slate/10 hover:bg-slate/20 px-3 py-1.5 pr-8 text-sm rounded-lg cursor-pointer transition-colors"
              aria-label="Sıralama"
            >
              <option value="chronological">Tarihe göre</option>
              <option value="reverse">Ters sıra</option>
              <option value="featured">Öne çıkan</option>
            </select>
            <SortAsc className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>

          {/* Grid size toggle */}
          <div className="hidden sm:flex items-center bg-slate/10 rounded-lg p-0.5">
            <button
              onClick={() => onGridSizeChange('compact')}
              className={`p-1.5 rounded transition-colors ${
                gridSize === 'compact' ? 'bg-cream shadow-sm' : 'hover:bg-slate/10'
              }`}
              aria-label="Kompakt görünüm"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGridSizeChange('normal')}
              className={`p-1.5 rounded transition-colors ${
                gridSize === 'normal' ? 'bg-cream shadow-sm' : 'hover:bg-slate/10'
              }`}
              aria-label="Normal görünüm"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGridSizeChange('large')}
              className={`p-1.5 rounded transition-colors ${
                gridSize === 'large' ? 'bg-cream shadow-sm' : 'hover:bg-slate/10'
              }`}
              aria-label="Büyük görünüm"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
