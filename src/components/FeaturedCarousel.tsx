'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FeaturedMoment } from '@/types';

interface FeaturedCarouselProps {
  moments: FeaturedMoment[];
}

export default function FeaturedCarousel({ moments }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

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
          {moments.map((moment, index) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start"
            >
              <Link
                href={`/kategori/${moment.category_id}`}
                className="block group"
              >
                <div className="relative w-[240px] md:w-[280px] aspect-[3/4] rounded-xl overflow-hidden">
                  <img
                    src={moment.image}
                    alt={moment.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-serif text-lg font-semibold">
                      {moment.title}
                    </h3>
                    {moment.subtitle && (
                      <p className="text-white/80 text-sm">{moment.subtitle}</p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
