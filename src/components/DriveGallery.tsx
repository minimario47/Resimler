'use client';

import { useState, useEffect, useCallback } from 'react';
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
}

export default function DriveGallery({ folderId, categoryId, categoryName }: DriveGalleryProps) {
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>('normal');
  const [sortOption, setSortOption] = useState<SortOption>('chronological');

  const fetchImages = useCallback(async () => {
    if (!folderId) {
      setLoading(false);
      setError('Bu kategori için henüz fotoğraf eklenmemiş.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the embedded folder view
      const response = await fetch(`/api/drive-proxy?folderId=${folderId}`);
      
      if (!response.ok) {
        // Fallback: try to parse from a proxy or use direct embed
        throw new Error('API not available');
      }
      
      const data = await response.json();
      setImages(data.files || []);
    } catch {
      // Fallback: Use a simple approach - fetch via CORS proxy or show embed
      try {
        // Try fetching directly (may work in some cases)
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://drive.google.com/embeddedfolderview?id=${folderId}`
        )}`;
        
        const response = await fetch(proxyUrl);
        const html = await response.text();
        
        // Parse the HTML to extract image IDs
        const extractedImages = parseImagesFromHtml(html);
        setImages(extractedImages);
      } catch (proxyError) {
        console.error('Proxy fetch failed:', proxyError);
        // Final fallback: show iframe embed
        setError('embed');
      }
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Parse images from embedded folder HTML
  function parseImagesFromHtml(html: string): DriveImage[] {
    const images: DriveImage[] = [];
    
    // Match file entries
    const entryRegex = /id="entry-([a-zA-Z0-9_-]+)"[\s\S]*?flip-entry-title">([^<]+)</g;
    let match;
    
    while ((match = entryRegex.exec(html)) !== null) {
      const fileId = match[1];
      const fileName = match[2];
      
      // Only include image files
      if (/\.(jpg|jpeg|png|gif|webp|heic)$/i.test(fileName)) {
        images.push({
          id: fileId,
          name: fileName,
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
        });
      }
    }
    
    return images;
  }

  // Convert Drive images to MediaItem format for MediaGrid
  const mediaItems: MediaItem[] = images.map((img, index) => {
    const urls = getDriveUrls(img.id);
    // Use different aspect ratios for visual variety (like the mock data)
    const heights = [1080, 1280, 1440, 1600];
    const randomHeight = heights[index % heights.length];
    
    return {
      id: img.id,
      title: img.name.replace(/\.[^.]+$/, ''), // Remove extension
      description: `${categoryName} - Fotoğraf ${index + 1}`,
      media_type: 'photo',
      created_at: '2025-07-15', // Use a fixed date for the category
      source: 'google_drive',
      source_url: urls.view,
      thumbnails: {
        small: urls.thumbnail.small,
        medium: urls.thumbnail.medium,
        large: urls.thumbnail.large,
      },
      original_url: urls.download, // Use download URL for full quality
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
          onClick={fetchImages}
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
      {/* Grid controls - same as static gallery */}
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
        onRefresh={fetchImages}
        driveFolderId={folderId}
      />

      {/* Use MediaGrid component - same as static gallery */}
      <MediaGrid media={sortedMedia} gridSize={gridSize} />
    </>
  );
}

// Export a simple component for embedding folder directly
export function DriveEmbed({ folderId, title }: { folderId: string; title: string }) {
  if (!folderId) {
    return (
      <div className="text-center py-10 text-slate/60">
        Klasör ID belirtilmemiş.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-slate/10">
        <iframe
          src={`https://drive.google.com/embeddedfolderview?id=${folderId}#grid`}
          className="w-full h-[500px] md:h-[700px]"
          style={{ border: 0 }}
          title={title}
        />
      </div>
      <div className="text-center">
        <a
          href={`https://drive.google.com/drive/folders/${folderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Tüm fotoğrafları Google Drive&apos;da görüntüle
        </a>
      </div>
    </div>
  );
}
