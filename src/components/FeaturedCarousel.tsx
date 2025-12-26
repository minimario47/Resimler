'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Lightbox from './Lightbox';
import { MediaItem } from '@/types';

interface FeaturedImage {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface FeaturedCarouselProps {
  images: FeaturedImage[];
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

  // Convert to MediaItem for lightbox
  const mediaItems: MediaItem[] = images.map((img, index) => ({
    id: img.id,
    title: `Öne Çıkan ${index + 1}`,
    description: 'Özel anlardan',
    media_type: 'photo',
    created_at: '2024-12-25',
    source: 'google_drive',
    thumbnails: {
      small: `https://drive.google.com/thumbnail?id=${img.id}&sz=w200`,
      medium: `https://drive.google.com/thumbnail?id=${img.id}&sz=w400`,
      large: `https://drive.google.com/thumbnail?id=${img.id}&sz=w1600`,
    },
    original_url: `https://drive.google.com/uc?export=download&id=${img.id}`,
    width: 1920,
    height: 1280,
    tags: ['featured'],
    is_public: true,
    featured: true,
    favorites_count: 0,
    category_id: 'featured',
  }));

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
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start"
            >
              <button
                onClick={() => setSelectedIndex(index)}
                className="block group text-left"
              >
                <div className="relative w-[240px] md:w-[280px] aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.thumbnailUrl}
                    alt={image.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </motion.div>
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
