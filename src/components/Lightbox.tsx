'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { MediaItem } from '@/types';

interface LightboxProps {
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * Progressive Lightbox Image Component
 * Loads images progressively: medium -> large -> original
 * Shows the best available quality while loading higher resolution
 */
const ProgressiveLightboxImage = memo(function ProgressiveLightboxImage({
  item,
  onLoad,
}: {
  item: MediaItem;
  onLoad: () => void;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<'medium' | 'large' | 'done'>('medium');
  
  // Start with medium quality (already cached from grid view)
  useEffect(() => {
    // Immediately show medium quality (should be in browser cache)
    const mediumImg = new Image();
    mediumImg.onload = () => {
      setLoadedSrc(item.thumbnails.medium);
      setLoadingStage('large');
      onLoad();
    };
    mediumImg.src = item.thumbnails.medium;
    
    // Then load large quality in background
    const largeImg = new Image();
    largeImg.onload = () => {
      setLoadedSrc(item.thumbnails.large);
      setLoadingStage('done');
    };
    largeImg.src = item.thumbnails.large;
    
    return () => {
      mediumImg.onload = null;
      largeImg.onload = null;
    };
  }, [item, onLoad]);

  return (
    <>
      {/* Blurred placeholder while loading */}
      {!loadedSrc && item.thumbnails.placeholder && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnails.placeholder}
          alt=""
          aria-hidden="true"
          className="max-w-full max-h-[85vh] object-contain blur-xl scale-105"
          style={{ filter: 'blur(30px)' }}
        />
      )}
      
      {/* Main image with progressive quality upgrade */}
      {loadedSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={loadedSrc}
          alt={`Fotoğraf`}
          className="max-w-full max-h-[85vh] object-contain select-none transition-all duration-300"
          draggable={false}
        />
      )}
      
      {/* Quality indicator for debugging (hidden in production) */}
      {loadingStage !== 'done' && loadedSrc && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-xs text-white/60">
          Yüksek kalite yükleniyor...
        </div>
      )}
    </>
  );
});

export default function Lightbox({ media, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const preloadedImagesRef = useRef<Set<number>>(new Set([initialIndex]));
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia.media_type === 'video';

  // Preload adjacent images for smoother navigation
  // Preload medium quality first (fast), then large quality
  useEffect(() => {
    const indicesToPreload = [
      currentIndex - 1,
      currentIndex + 1,
      currentIndex + 2,
    ].filter(i => i >= 0 && i < media.length);

    indicesToPreload.forEach(index => {
      if (!preloadedImagesRef.current.has(index)) {
        // Preload medium quality first (smaller, faster)
        const mediumImg = new window.Image();
        mediumImg.src = media[index].thumbnails.medium;
        
        // Then preload large quality
        const largeImg = new window.Image();
        largeImg.src = media[index].thumbnails.large;
        
        preloadedImagesRef.current.add(index);
      }
    });
  }, [currentIndex, media]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImageLoaded(false); // Reset loaded state for new image
    setCurrentIndex((i) => (i + 1) % media.length);
  }, [media.length]);

  const goToPrev = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImageLoaded(false); // Reset loaded state for new image
    setCurrentIndex((i) => (i - 1 + media.length) % media.length);
  }, [media.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [goToNext, goToPrev, onClose]);

  // Auto-hide controls
  useEffect(() => {
    const showControlsTemporarily = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    showControlsTemporarily();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [currentIndex]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((z) => {
      const newZoom = direction === 'in' ? z * 1.5 : z / 1.5;
      return Math.min(Math.max(newZoom, 1), 3);
    });
    if (direction === 'out' && zoom <= 1.5) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleDoubleTap = () => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (zoom > 1) {
      setPan({
        x: pan.x + info.delta.x,
        y: pan.y + info.delta.y,
      });
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (zoom === 1 && Math.abs(info.velocity.y) > 500) {
      onClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentMedia.original_url;
    link.download = `Ozlem-Zubeyir_${currentIndex + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Özlem & Zübeyir Düğün Arşivi',
          text: 'Düğün fotoğraflarından',
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Touch swipe handling
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (zoom > 1) return;
    if (direction === 'left') {
      goToNext();
    } else {
      goToPrev();
    }
  }, [zoom, goToNext, goToPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95"
      onClick={() => setShowControls(!showControls)}
      role="dialog"
      aria-modal="true"
      aria-label="Fotoğraf görüntüleyici"
    >
      {/* Top controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                aria-label="Paylaş"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? 'text-accent fill-accent' : 'text-white'
                  }`}
                />
              </button>
              <button
                onClick={handleDownload}
                className="p-3 rounded-full bg-accent hover:bg-accent-dark transition-colors flex items-center gap-2"
                aria-label="İndir"
              >
                <Download className="w-5 h-5 text-white" />
                <span className="text-white text-sm hidden sm:inline">
                  İndir
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main media area */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as HTMLElement).dataset.startX = touch.clientX.toString();
        }}
        onTouchEnd={(e) => {
          const startX = parseFloat((e.currentTarget as HTMLElement).dataset.startX || '0');
          const endX = e.changedTouches[0].clientX;
          const diff = startX - endX;
          if (Math.abs(diff) > 50) {
            handleSwipe(diff > 0 ? 'left' : 'right');
          }
        }}
      >
        {/* Loading indicator - only show if nothing is loaded yet */}
        {!imageLoaded && !isVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        <motion.div
          drag={zoom > 1}
          dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleDoubleTap}
          className="relative w-full h-full flex items-center justify-center"
          style={{
            scale: zoom,
            x: pan.x,
            y: pan.y,
          }}
        >
          {isVideo ? (
            <video
              src={currentMedia.original_url}
              className="max-w-full max-h-[85vh] object-contain"
              controls
              playsInline
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // Progressive image loading: medium -> large -> original
            <ProgressiveLightboxImage
              key={currentMedia.id}
              item={currentMedia}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </motion.div>

        {/* Navigation arrows */}
        {media.length > 1 && showControls && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Sonraki"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Bottom info panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zoom controls for photos */}
            {!isVideo && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => handleZoom('out')}
                  disabled={zoom <= 1}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                  aria-label="Uzaklaştır"
                >
                  <ZoomOut className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleZoom('in')}
                  disabled={zoom >= 3}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                  aria-label="Yakınlaştır"
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {/* Counter */}
            <div className="text-center text-white">
              <p className="text-lg font-medium">
                {currentIndex + 1} / {media.length}
              </p>
            </div>

            {/* Thumbnail strip */}
            {media.length > 1 && (
              <div className="flex justify-center gap-1 mt-4 overflow-x-auto no-scrollbar px-4">
                {media.slice(Math.max(0, currentIndex - 4), currentIndex + 5).map((item, i) => {
                  const actualIndex = Math.max(0, currentIndex - 4) + i;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(actualIndex)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all ${
                        actualIndex === currentIndex
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnails.small}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
