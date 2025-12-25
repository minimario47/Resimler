'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Share2,
  Info,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { MediaItem } from '@/types';

interface LightboxProps {
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ media, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia.media_type === 'video';

  // Define navigation functions first
  const goToNext = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCurrentIndex((i) => (i + 1) % media.length);
  }, [media.length]);

  const goToPrev = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCurrentIndex((i) => (i - 1 + media.length) % media.length);
  }, [media.length]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

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
        case 'Enter':
          if (isVideo) togglePlay();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [goToNext, goToPrev, isVideo, onClose, togglePlay]);

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
    link.download = `Ozlem-Zubeyir_${currentMedia.title}.${isVideo ? 'mp4' : 'jpg'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentMedia.title,
          text: `Özlem & Zübeyir Düğün Arşivi - ${currentMedia.title}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Bağlantı kopyalandı!');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 lightbox-overlay"
      onClick={() => setShowControls(!showControls)}
      role="dialog"
      aria-modal="true"
      aria-label="Medya görüntüleyici"
    >
      {/* Top controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between safe-top"
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
                onClick={() => setShowInfo(!showInfo)}
                className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                  showInfo ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
                aria-label="Bilgi"
              >
                <Info className="w-5 h-5 text-white" />
              </button>
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
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          drag={zoom > 1}
          dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleDoubleTap}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            scale: zoom,
            x: pan.x,
            y: pan.y,
          }}
        >
          {isVideo ? (
            <div className="relative max-w-full max-h-full">
              <video
                ref={videoRef}
                src={currentMedia.original_url}
                className="max-w-full max-h-[80vh] object-contain"
                controls={false}
                playsInline
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                onEnded={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                >
                  <div className="play-button">
                    <Play className="w-8 h-8 text-slate ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentMedia.thumbnails.large}
              alt={currentMedia.title}
              className="max-w-full max-h-[80vh] object-contain select-none"
              draggable={false}
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
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
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
            className="absolute bottom-0 left-0 right-0 p-4 safe-bottom"
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

            {/* Video controls */}
            {isVideo && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  aria-label={isPlaying ? 'Durdur' : 'Oynat'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
            )}

            {/* Title and description */}
            <div className="text-center text-white">
              <h3 className="font-serif text-lg font-semibold">{currentMedia.title}</h3>
              {showInfo && currentMedia.description && (
                <p className="text-sm text-white/70 mt-1">{currentMedia.description}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-2 text-sm text-white/60">
                <span>
                  {new Date(currentMedia.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {isVideo && currentMedia.duration && (
                  <span>{formatDuration(currentMedia.duration)}</span>
                )}
                <span>
                  {currentIndex + 1} / {media.length}
                </span>
              </div>
              {showInfo && currentMedia.tags.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  {currentMedia.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-white/10 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {media.length > 1 && (
              <div className="flex justify-center gap-1 mt-4 overflow-x-auto no-scrollbar px-4">
                {media.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((item, i) => {
                  const actualIndex = Math.max(0, currentIndex - 3) + i;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(actualIndex)}
                      className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden transition-all ${
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
