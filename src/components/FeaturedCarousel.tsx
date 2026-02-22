'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Lightbox from './Lightbox';
import { MediaItem } from '@/types';
import { normalizeR2ImageKey } from '@/lib/r2-storage';

interface FeaturedImage {
  id: string;
  name: string;
  thumbnailUrl: string;
  key?: string; // File key for building URLs
}

interface FeaturedCarouselProps {
  images: FeaturedImage[];
}

// Worker URL for optimized images
const WORKER_URL = 'https://wedding-photos.xaco47.workers.dev';

function getInlinePlaceholder(label: string): string {
  const safeLabel = label.replace(/</g, '').replace(/>/g, '').trim() || 'Foto';
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'>
      <rect width='600' height='800' fill='#a8a29e'/>
      <rect x='18' y='18' width='564' height='764' fill='none' stroke='#e7e5e4' stroke-width='2'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#1f2937' font-family='Georgia, serif' font-size='34'>
        ${safeLabel}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Extract file key from thumbnail URL or use provided key
function getFileKey(image: FeaturedImage): string {
  if (image.key) return normalizeR2ImageKey(image.key);
  
  // Fallback: extract from URL
  try {
    const url = new URL(image.thumbnailUrl);
    return normalizeR2ImageKey(url.pathname.substring(1)); // Remove leading /
  } catch {
    return '';
  }
}

export default function FeaturedCarousel({ images }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Convert to MediaItem for lightbox - using R2/Worker URLs
  // Low quality for grid, full quality only when clicked
  const mediaItems: MediaItem[] = images.map((img, index) => {
    const fileKey = getFileKey(img);
    
    return {
      id: img.id,
      title: `Öne Çıkan ${index + 1}`,
      description: 'Özel anlardan',
      media_type: 'photo',
      created_at: '2025-12-25',
      source: 'local',
      thumbnails: {
        placeholder: `${WORKER_URL}/${fileKey}?w=16&q=10`,
        small: `${WORKER_URL}/${fileKey}?w=250&q=35`,     // Very low quality for grid
        medium: `${WORKER_URL}/${fileKey}?w=350&q=45`,    // Low quality
        large: `${WORKER_URL}/${fileKey}?w=600&q=55`,     // Preview for lightbox
      },
      original_url: `${WORKER_URL}/${fileKey}?w=1600&q=85`, // Full quality when clicked
      width: 1920,
      height: 1280,
      tags: ['featured'],
      is_public: true,
      featured: true,
      favorites_count: 0,
      category_id: 'featured',
    };
  });

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="font-serif text-xl md:text-2xl font-semibold">
            Öne Çıkan Anlar
          </h2>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-slate/5 hover:bg-slate/10 transition-colors"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-slate/5 hover:bg-slate/10 transition-colors"
              aria-label="Sonraki"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4 snap-x snap-mandatory"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex-shrink-0 snap-start animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <button
                onClick={() => setSelectedIndex(index)}
                className="block group text-left"
              >
                <div className="relative w-[240px] md:w-[280px] aspect-[3/4] rounded-xl overflow-hidden shadow-lg bg-slate/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.thumbnailUrl}
                    alt={image.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = getInlinePlaceholder(image.name);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && mediaItems.length > 0 && (
        <Lightbox
          media={mediaItems}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </section>
  );
}
