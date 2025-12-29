'use client';

import Header from '@/components/Header';
import R2Gallery from '@/components/R2Gallery';
import Footer from '@/components/Footer';
import { Category } from '@/types';

interface CategoryClientProps {
  category: Category;
}

export default function CategoryClient({ category }: CategoryClientProps) {
  // Extract date from date_range for the photos
  const categoryDate = category.date_range.includes('24') ? '2025-12-24' :
                       category.date_range.includes('25') ? '2025-12-25' :
                       category.date_range.includes('26') ? '2025-12-26' :
                       category.date_range.includes('27') ? '2025-12-27' : '2025-12-25';

  return (
    <main className="min-h-screen bg-cream">
      <Header showBack title={category.name} />

      {/* Hero banner */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center bg-slate/10"
        style={{ backgroundImage: `url(${category.cover_image})` }}
        role="img"
        aria-label={`${category.name} kategorisi kapak görseli`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Fallback background color */}
        <div className="absolute inset-0 bg-slate/5 -z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">
              {category.name}
            </h1>
            <p className="text-white/80 text-sm md:text-base mt-1">
              {category.description}
            </p>
            <p className="text-white/60 text-sm mt-2">
              {category.date_range}
            </p>
          </div>
        </div>
      </div>

      {/* Content area - using R2/Cloudflare Worker */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <R2Gallery
          categoryId={category.id}
          categoryName={category.name}
          categoryDate={categoryDate}
        />
      </div>

      <Footer />
    </main>
  );
}
