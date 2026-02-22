'use client';

import Link from 'next/link';
import { Category } from '@/types';
import { ChevronRight } from 'lucide-react';

interface CategoryTilesProps {
  categories: Category[];
}

function getInlinePlaceholder(label: string): string {
  const safeLabel = label.replace(/</g, '').replace(/>/g, '').trim() || 'Galeri';
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
      <rect width='800' height='600' fill='#a8a29e'/>
      <rect x='24' y='24' width='752' height='552' fill='none' stroke='#e7e5e4' stroke-width='2'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#1f2937' font-family='Georgia, serif' font-size='42'>
        ${safeLabel}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-serif text-xl md:text-2xl font-semibold mb-6">
          Resimler
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
            >
              <Link
                href={`/kategori/${category.slug}`}
                className="block group"
                aria-label={`${category.name} galerisini görüntüle`}
              >
                <div className="relative rounded-2xl overflow-hidden bg-slate/5 shadow-md hover:shadow-xl transition-shadow">
                  {/* Cover image */}
                  <div className="aspect-[4/3] relative bg-slate/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.cover_image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = getInlinePlaceholder(category.name);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-serif text-lg md:text-xl font-semibold mb-1 flex items-center gap-2">
                      {category.name}
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm opacity-80">{category.description}</p>
                    <p className="text-xs opacity-60 mt-1">{category.date_range}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
