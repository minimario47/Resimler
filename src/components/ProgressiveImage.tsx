'use client';

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';

interface ProgressiveImageProps {
  src: string;
  mediumSrc?: string;
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
  mediumSrc,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onClick,
  onLoad,
}: ProgressiveImageProps) {
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [displaySrc, setDisplaySrc] = useState(mediumSrc || src);
  const [triedOriginal, setTriedOriginal] = useState(false);
  const [needsEdgeCrop, setNeedsEdgeCrop] = useState(false);
  const [mediumLoaded, setMediumLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imgRef = useRef<HTMLDivElement>(null);

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

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const analyzeGrayArtifacts = useCallback((img: HTMLImageElement) => {
    try {
      const sampleSize = 36;
      const canvas = document.createElement('canvas');
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        return { leftBand: false, bottomBand: false };
      }

      context.drawImage(img, 0, 0, sampleSize, sampleSize);
      const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;

      const isBandGray = (r: number, g: number, b: number, a: number) => (
        a > 245 &&
        Math.abs(r - g) <= 2 &&
        Math.abs(g - b) <= 2 &&
        r >= 112 &&
        r <= 146
      );

      const ratio = (xStart: number, xEnd: number, yStart: number, yEnd: number) => {
        let gray = 0;
        let total = 0;
        for (let y = yStart; y < yEnd; y += 1) {
          for (let x = xStart; x < xEnd; x += 1) {
            const index = (y * sampleSize + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];
            if (isBandGray(r, g, b, a)) {
              gray += 1;
            }
            total += 1;
          }
        }
        return total > 0 ? gray / total : 0;
      };

      const leftGray = ratio(0, Math.floor(sampleSize * 0.2), 0, sampleSize);
      const centerGray = ratio(
        Math.floor(sampleSize * 0.3),
        Math.floor(sampleSize * 0.7),
        0,
        sampleSize
      );
      const topGray = ratio(0, sampleSize, 0, Math.floor(sampleSize * 0.35));
      const bottomGray = ratio(0, sampleSize, Math.floor(sampleSize * 0.65), sampleSize);

      return {
        leftBand: leftGray > 0.9 && centerGray < 0.75,
        bottomBand: bottomGray > 0.9 && topGray < 0.75,
      };
    } catch {
      return { leftBand: false, bottomBand: false };
    }
  }, []);

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
      {shouldLoad && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          decoding="auto"
          fetchPriority={priority ? 'high' : 'auto'}
          crossOrigin="anonymous"
          style={needsEdgeCrop ? { transform: 'scale(1.2)', transformOrigin: 'right center' } : undefined}
          onLoad={(event) => {
            const artifact = analyzeGrayArtifacts(event.currentTarget);
            if (artifact.bottomBand) {
              if (!triedOriginal && displaySrc !== src) {
                setTriedOriginal(true);
                setMediumLoaded(false);
                setHasError(false);
                setNeedsEdgeCrop(false);
                setDisplaySrc(src);
                return;
              }
              setHasError(true);
              return;
            }

            if (artifact.leftBand) {
              setNeedsEdgeCrop(true);
            }

            setMediumLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            if (!triedOriginal && displaySrc !== src) {
              setTriedOriginal(true);
              setMediumLoaded(false);
              setHasError(false);
              setNeedsEdgeCrop(false);
              setDisplaySrc(src);
              return;
            }
            setHasError(true);
            setMediumLoaded(false);
          }}
        />
      )}

      {shouldLoad && !mediumLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/20">
          <span className="text-xs text-white/70">Bozuk Dosya</span>
        </div>
      )}
    </div>
  );
}

export const ProgressiveImage = memo(ProgressiveImageComponent);
export default ProgressiveImage;
