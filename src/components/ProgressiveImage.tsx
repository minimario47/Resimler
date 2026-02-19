'use client';

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';

interface ProgressiveImageProps {
  src: string;
  thumbnailSrc?: string;
  mediumSrc?: string;
  largeSrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
}

function ProgressiveImageComponent({
  src,
  thumbnailSrc,
  mediumSrc,
  largeSrc,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onClick,
  onLoad,
}: ProgressiveImageProps) {
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [showLarge, setShowLarge] = useState(false);
  const [mediumLoaded, setMediumLoaded] = useState(false);
  const [largeLoaded, setLargeLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imgRef = useRef<HTMLDivElement>(null);

  const mediumTarget = mediumSrc || src;
  const largeTarget = largeSrc || src;

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
        rootMargin: '300px 0px',
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!mediumLoaded || showLarge) return;

    const timeout = window.setTimeout(() => setShowLarge(true), 400);
    return () => window.clearTimeout(timeout);
  }, [mediumLoaded, showLarge]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const aspectRatio = useMemo(() => {
    if (typeof width === 'number' && width > 0 && typeof height === 'number' && height > 0) {
      return `${width} / ${height}`;
    }
    // Fallback ratio prevents masonry cards from collapsing while image bytes stream in.
    return '3 / 4';
  }, [width, height]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-slate-900/10 min-h-[180px] ${className}`}
      style={{ aspectRatio }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && handleClick() : undefined}
    >
      {thumbnailSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover scale-110 transition-opacity duration-500 ${
            mediumLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ filter: 'blur(16px)' }}
          loading="eager"
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
        />
      )}

      {shouldLoad && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediumTarget}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            mediumLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => {
            setMediumLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            setMediumLoaded(Boolean(thumbnailSrc));
          }}
        />
      )}

      {showLarge && mediumLoaded && largeTarget !== mediumTarget && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={largeTarget}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            largeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setLargeLoaded(true)}
        />
      )}

      {shouldLoad && !mediumLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
        </div>
      )}

      {hasError && !thumbnailSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/20">
          <span className="text-xs text-white/50">Yüklenemedi</span>
        </div>
      )}
    </div>
  );
}

export const ProgressiveImage = memo(ProgressiveImageComponent);
export default ProgressiveImage;
