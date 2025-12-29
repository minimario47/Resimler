'use client';

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';

interface ProgressiveImageProps {
  src: string;
  thumbnailSrc?: string; // Low quality image (30% quality, ~20-50px)
  mediumSrc?: string; // Medium quality for grid view
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Skip lazy loading for above-the-fold images
  onClick?: () => void;
  onLoad?: () => void;
}

/**
 * Progressive Image Component
 * 
 * Implements a blur-up loading technique for smooth image loading on slow connections:
 * 1. Shows a blurred tiny placeholder immediately (if provided)
 * 2. Loads the medium quality image when in viewport
 * 3. Full quality only loaded in Lightbox on user request
 * 
 * Uses IntersectionObserver for true lazy loading.
 */
function ProgressiveImageComponent({
  src,
  thumbnailSrc,
  mediumSrc,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onClick,
  onLoad,
}: ProgressiveImageProps) {
  // Track loading states
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string | null>(thumbnailSrc || null);
  
  const imgRef = useRef<HTMLDivElement>(null);

  // The actual image source to load (medium quality for grid view)
  const targetSrc = mediumSrc || src;

  // Setup Intersection Observer for lazy loading (only for non-priority images)
  useEffect(() => {
    // Skip observer setup if priority - already shouldLoad
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // This is triggered by external event (intersection), so it's valid
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px 0px', // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Load image when shouldLoad becomes true
  useEffect(() => {
    if (!shouldLoad) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(targetSrc);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      // Fallback to original source on error
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    img.src = targetSrc;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [shouldLoad, targetSrc, src, onLoad]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const aspectRatio = useMemo(() => {
    return width && height ? `${width} / ${height}` : undefined;
  }, [width, height]);

  const isLoading = shouldLoad && !isLoaded;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-slate-900/20 ${className}`}
      style={{ aspectRatio }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && handleClick() : undefined}
    >
      {/* Blurred placeholder - always rendered for smooth transition */}
      {thumbnailSrc && !isLoaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 transform"
          style={{ filter: 'blur(20px)' }}
        />
      )}

      {/* Loading skeleton animation */}
      {isLoading && !thumbnailSrc && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-800/20 via-slate-700/20 to-slate-800/20" />
      )}

      {/* Main image with fade-in transition */}
      {currentSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Loading indicator for slow connections */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ProgressiveImage = memo(ProgressiveImageComponent);
export default ProgressiveImage;
