'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, FolderOpen, ExternalLink } from 'lucide-react';
import { getDriveUrls } from '@/lib/google-drive';
import MediaGrid from './MediaGrid';
import GridControls from './GridControls';
import { MediaItem, GridSize, SortOption } from '@/types';

interface DriveImage {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface DriveGalleryProps {
  folderId: string;
  categoryId: string;
  categoryName: string;
  categoryDate?: string;
}

// Simple cache to avoid refetching on component remount
const imageCache: Record<string, DriveImage[]> = {};

export default function DriveGallery({ folderId, categoryId, categoryName, categoryDate = '2024-12-25' }: DriveGalleryProps) {
  const [images, setImages] = useState<DriveImage[]>(imageCache[folderId] || []);
  const [loading, setLoading] = useState(!imageCache[folderId]);
  const [error, setError] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>('normal');
  const [sortOption, setSortOption] = useState<SortOption>('chronological');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchedRef = useRef(false);

  const fetchImages = useCallback(async (forceRefresh = false) => {
    if (!folderId) {
      setLoading(false);
      setError('Bu kategori için henüz fotoğraf eklenmemiş.');
      return;
    }

    // Use cache if available and not forcing refresh
    if (!forceRefresh && imageCache[folderId] && imageCache[folderId].length > 0) {
      setImages(imageCache[folderId]);
      setLoading(false);
      return;
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Try multiple proxies for reliability
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/embeddedfolderview?id=${folderId}`)}`,
        `https://corsproxy.io/?${encodeURIComponent(`https://drive.google.com/embeddedfolderview?id=${folderId}`)}`,
      ];

      let html = '';
      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl, { 
            cache: forceRefresh ? 'no-cache' : 'default' 
          });
          if (response.ok) {
            html = await response.text();
            break;
          }
        } catch {
          continue;
        }
      }

      if (!html) {
        throw new Error('All proxies failed');
      }

      // Parse images from HTML
      const extractedImages = parseImagesFromHtml(html);
      
      // Update cache and state
      imageCache[folderId] = extractedImages;
      setImages(extractedImages);
      
    } catch (proxyError) {
      console.error('Fetch failed:', proxyError);
      // Show fallback embed if no cached data
      if (!imageCache[folderId] || imageCache[folderId].length === 0) {
        setError('embed');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [folderId]);

  // Parse images from embedded folder HTML
  function parseImagesFromHtml(html: string): DriveImage[] {
    const images: DriveImage[] = [];
    
    // Multiple regex patterns for different Drive HTML formats
    const patterns = [
      /id="entry-([a-zA-Z0-9_-]+)"[\s\S]*?flip-entry-title">([^<]+)</g,
      /data-id="([a-zA-Z0-9_-]+)"[\s\S]*?title="([^"]+)"/g,
      /"([a-zA-Z0-9_-]{25,})"[\s\S]*?"([^"]*\.(jpg|jpeg|png|gif|webp|heic))"/gi,
    ];
    
    for (const regex of patterns) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        const fileId = match[1];
        const fileName = match[2];
        
        // Validate file ID length and only include image files
        if (fileId.length > 20 && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(fileName)) {
          // Avoid duplicates
          if (!images.find(img => img.id === fileId)) {
            images.push({
              id: fileId,
              name: fileName,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
            });
          }
        }
      }
    }
    
    return images;
  }

  // Initial fetch
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchImages();
    }
  }, [fetchImages]);

  // Convert Drive images to MediaItem format for MediaGrid
  const mediaItems: MediaItem[] = images.map((img, index) => {
    const urls = getDriveUrls(img.id);
    // Use different aspect ratios for visual variety
    const heights = [1080, 1280, 1440, 1600, 1200];
    const randomHeight = heights[index % heights.length];
    
    return {
      id: img.id,
      title: img.name.replace(/\.[^.]+$/, ''),
      description: `${categoryName}`,
      media_type: 'photo',
      created_at: categoryDate,
      source: 'google_drive',
      source_url: urls.view,
      thumbnails: {
        small: urls.thumbnail.small,
        medium: urls.thumbnail.medium,
        large: urls.thumbnail.large,
      },
      original_url: urls.download,
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
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-slate/60">Fotoğraflar yükleniyor...</p>
      </div>
    );
  }

  // Show iframe embed as fallback
  if (error === 'embed') {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <FolderOpen className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">Google Drive Galerisi</p>
            <p className="text-amber-700 text-sm mt-1">
              Fotoğrafları doğrudan Google Drive üzerinden görüntülüyorsunuz.
            </p>
          </div>
        </div>
        
        <div className="rounded-xl overflow-hidden border border-slate/10 bg-white">
          <iframe
            src={`https://drive.google.com/embeddedfolderview?id=${folderId}#grid`}
            className="w-full h-[600px] md:h-[800px]"
            style={{ border: 0 }}
            title={`${categoryName} Fotoğrafları`}
          />
        </div>
        
        <div className="text-center">
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Google Drive&apos;da Aç
          </a>
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
        driveFolderId={folderId}
      />

      {/* Photo grid */}
      <MediaGrid media={sortedMedia} gridSize={gridSize} />
    </>
  );
}
