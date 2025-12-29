'use client';

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';

interface ProgressiveImageProps {
  src: string;
  thumbnailSrc?: string; // Tiny placeholder for blur-up effect
  mediumSrc?: string; // Low quality for grid view (~20% quality)
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Skip lazy loading for above-the-fold images
  onClick?: () => void;
  onLoad?: () => void;
}

/**
 * Progressive Image Component - Optimized for Slow Connections
 * 
 * Loading strategy:
 * 1. Shows a tiny blurred placeholder immediately (< 1KB)
 * 2. Loads low quality image when in viewport (~20-50KB)
 * 3. Full quality only loaded in Lightbox when user clicks
 * 
 * Uses IntersectionObserver for true lazy loading.
 * Downloads images in viewport first, lazy loads others on scroll.
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  
  const imgRef = useRef<HTMLDivElement>(null);
  const loadAttempted = useRef(false);

  // The target image source (low quality for grid)
  const targetSrc = mediumSrc || src;

  // Setup Intersection Observer - more aggressive for viewport images
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        // Load images when 100px from viewport
        rootMargin: '100px 0px',
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Load image when visible
  useEffect(() => {
    if (!shouldLoad || loadAttempted.current) return;
    loadAttempted.current = true;

    const img = new Image();
    
    // Set timeout to prevent hanging on slow connections
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        // Show placeholder if image takes too long
        setCurrentSrc(thumbnailSrc || targetSrc);
        setIsLoaded(true);
      }
    }, 15000); // 15 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      setCurrentSrc(targetSrc);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      setHasError(true);
      // Try original as fallback
      if (src !== targetSrc) {
        setCurrentSrc(src);
      }
      setIsLoaded(true);
    };
    
    img.src = targetSrc;
    
    return () => {
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [shouldLoad, targetSrc, src, thumbnailSrc, onLoad, isLoaded]);

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
      className={`relative overflow-hidden bg-slate-900/10 ${className}`}
      style={{ aspectRatio }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && handleClick() : undefined}
    >
      {/* Blurred placeholder - shown while loading */}
      {thumbnailSrc && !isLoaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: 'blur(15px)' }}
        />
      )}

      {/* Loading skeleton - shown if no placeholder */}
      {isLoading && !thumbnailSrc && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-300/30 animate-pulse" />
      )}

      {/* Main image */}
      {currentSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Loading spinner - subtle indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error indicator */}
      {hasError && !currentSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/20">
          <span className="text-xs text-white/50">Yüklenemedi</span>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ProgressiveImage = memo(ProgressiveImageComponent);
export default ProgressiveImage;
