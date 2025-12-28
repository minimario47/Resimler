'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import DriveGallery from '@/components/DriveGallery';
import R2Gallery from '@/components/R2Gallery';
import Footer from '@/components/Footer';
import { Category } from '@/types';
import { getR2Config } from '@/lib/r2-storage';

interface CategoryClientProps {
  category: Category;
}

export default function CategoryClient({ category }: CategoryClientProps) {
  const [useR2, setUseR2] = useState(false);
  
  // Check if R2 is configured
  useEffect(() => {
    const r2Config = getR2Config();
    setUseR2(r2Config !== null);
  }, []);

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
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${category.cover_image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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

      {/* Content area */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {useR2 ? (
          <R2Gallery
            categoryId={category.id}
            categoryName={category.name}
            categoryDate={categoryDate}
          />
        ) : category.drive_folder_id ? (
          <DriveGallery
            folderId={category.drive_folder_id}
            categoryId={category.id}
            categoryName={category.name}
            categoryDate={categoryDate}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate/60">Bu kategori için fotoğraflar yakında eklenecek.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
