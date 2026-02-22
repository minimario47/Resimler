'use client';

import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

type VideoCategory = 'Kına Gecesi' | 'Düğün';

interface VideoItem {
  id: string;
  title: string;
  category: VideoCategory;
  order: number;
}

const GROUP_ORDER: VideoCategory[] = ['Kına Gecesi', 'Düğün'];

const VIDEOS: VideoItem[] = [
  { id: 'dYLwc0sf5m0', title: 'Kına Gecesi - Part 1', category: 'Kına Gecesi', order: 1 },
  { id: 'xO3uEfbb00k', title: 'Kına Gecesi - Part 2', category: 'Kına Gecesi', order: 2 },
  { id: 'Mv-VzA6Av4c', title: 'Kına Gecesi - Part 3', category: 'Kına Gecesi', order: 3 },
  { id: 'FAnQlfNtbt4', title: 'Takı - Mevlüt', category: 'Düğün', order: 1 },
  { id: '-mfG7n4KPXE', title: 'Düğün - Part 1', category: 'Düğün', order: 2 },
  { id: 'OZvHKvI1agE', title: 'Düğün - Part 2', category: 'Düğün', order: 3 },
  { id: 'bZw3TEiir0g', title: 'Düğün - Part 3', category: 'Düğün', order: 4 },
];

function getThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export default function FeaturedCarousel() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const orderedVideos = useMemo(() => {
    return [...VIDEOS].sort((a, b) => {
      const groupDiff = GROUP_ORDER.indexOf(a.category) - GROUP_ORDER.indexOf(b.category);
      if (groupDiff !== 0) return groupDiff;
      return a.order - b.order;
    });
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const target = scrollRef.current;
    if (!target) return;

    target.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex items-center justify-between px-4">
          <h2 className="font-serif text-xl font-semibold md:text-2xl">Videolar</h2>
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scroll('left')}
              className="rounded-full bg-slate/5 p-2 transition-colors hover:bg-slate/10"
              aria-label="Önceki"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="rounded-full bg-slate/5 p-2 transition-colors hover:bg-slate/10"
              aria-label="Sonraki"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x snap-mandatory"
        >
          {orderedVideos.map((video, index) => {
            const isNewGroup = index === 0 || orderedVideos[index - 1].category !== video.category;

            return (
              <article
                key={video.id}
                className={`flex-shrink-0 snap-start ${isNewGroup && index !== 0 ? 'ml-8 border-l border-slate/20 pl-8' : ''}`}
              >
                <button
                  onClick={() => setActiveVideo(video)}
                  className="group block w-[240px] text-left md:w-[280px]"
                >
                  <div className="relative overflow-hidden rounded-xl bg-slate/5 shadow-lg">
                    <div className="aspect-video w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getThumbnail(video.id)}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                      {video.category}
                    </div>
                    <div className="absolute right-3 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate shadow-lg">
                      <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate">{video.title}</p>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
