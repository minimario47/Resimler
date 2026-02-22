'use client';

import { useMemo, useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  category: 'Düğün' | 'Kına Gecesi';
  order: number;
}

const VIDEOS: VideoItem[] = [
  { id: 'FAnQlfNtbt4', title: 'Takı - Mevlüt', category: 'Düğün', order: 1 },
  { id: '-mfG7n4KPXE', title: 'Düğün - Part 1', category: 'Düğün', order: 2 },
  { id: 'OZvHKvI1agE', title: 'Düğün - Part 2', category: 'Düğün', order: 3 },
  { id: 'bZw3TEiir0g', title: 'Düğün - Part 3', category: 'Düğün', order: 4 },
  { id: 'dYLwc0sf5m0', title: 'Kına Gecesi - Part 1', category: 'Kına Gecesi', order: 1 },
  { id: 'xO3uEfbb00k', title: 'Kına Gecesi - Part 2', category: 'Kına Gecesi', order: 2 },
  { id: 'Mv-VzA6Av4c', title: 'Kına Gecesi - Part 3', category: 'Kına Gecesi', order: 3 },
];

export default function VideoShowcase() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const grouped = useMemo(() => {
    return VIDEOS.reduce<Record<string, VideoItem[]>>((acc, video) => {
      acc[video.category] = [...(acc[video.category] || []), video];
      return acc;
    }, {});
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Videolar</p>
        <h2 className="font-serif text-3xl md:text-4xl">Kına & Düğün Filmleri</h2>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([groupName, groupVideos]) => (
          <div key={groupName} className="rounded-2xl border border-slate/10 bg-white/60 p-4 md:p-6">
            <h3 className="mb-4 font-serif text-2xl">{groupName}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...groupVideos].sort((a, b) => a.order - b.order).map((video) => {
                const thumbnail = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                return (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className="group relative overflow-hidden rounded-xl text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm text-white/90">{video.title}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-5 w-5 text-slate" fill="currentColor" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
