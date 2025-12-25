'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, RefreshCw, FolderOpen } from 'lucide-react';
import { getDriveUrls, DRIVE_FOLDERS } from '@/lib/google-drive';
import Lightbox from './Lightbox';
import { MediaItem } from '@/types';

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  // Convert Drive images to MediaItem format for Lightbox
  const mediaItems: MediaItem[] = images.map((img, index) => {
    const urls = getDriveUrls(img.id);
    return {
      id: img.id,
      title: img.name.replace(/\.[^.]+$/, ''), // Remove extension
      description: `${categoryName} - Fotoğraf ${index + 1}`,
      media_type: 'photo',
      created_at: new Date().toISOString(),
      source: 'google_drive',
      source_url: urls.view,
      thumbnails: urls.thumbnail,
      original_url: urls.embed,
      width: 1920,
      height: 1280,
      tags: [categoryId],
      is_public: true,
      featured: index < 3,
      favorites_count: 0,
      category_id: categoryId,
    };
  });

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
      {/* Image count and actions */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate/60">
          <span className="font-medium text-slate">{images.length}</span> fotoğraf
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchImages}
            className="p-2 rounded-lg bg-slate/10 hover:bg-slate/20 transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate/10 hover:bg-slate/20 transition-colors"
            title="Google Drive'da Aç"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.5) }}
          >
            <div
              onClick={() => setSelectedIndex(index)}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-slate/5 aspect-square"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedIndex(index)}
              aria-label={`${image.name} görüntüle`}
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.thumbnailUrl}
                alt={image.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(getDriveUrls(image.id).download, '_blank');
                    }}
                    className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                    title="İndir"
                  >
                    <Download className="w-4 h-4 text-slate" />
                  </button>
                </div>
              </div>

              {/* Image number badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs">
                {index + 1}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && mediaItems.length > 0 && (
        <Lightbox
          media={mediaItems}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
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
