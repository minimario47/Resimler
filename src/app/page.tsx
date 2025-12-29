'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import CategoryTiles from '@/components/CategoryTiles';
import Footer from '@/components/Footer';
import { categories } from '@/data/mock-data';
import { checkCacheVersion } from '@/lib/cache';
import { getHeroImage, getFeaturedImages } from '@/lib/category-images';

export default function Home() {
  // Get images from R2 metadata (static, no loading needed)
  const heroImage = getHeroImage();
  const featuredImages = getFeaturedImages();

  useEffect(() => {
    // Check cache version on mount
    checkCacheVersion();
  }, []);

  return (
    <main className="min-h-screen">
      <Header transparent />
      
      <Hero
        backgroundImage={heroImage}
        title="Nusaybin • Anılar Haftası"
        subtitle="Özlem & Zübeyir"
        date="24-27 Aralık 2025"
        ctaText="Galerileri Gör"
      />

      <div className="bg-cream">
        {featuredImages.length > 0 && (
          <FeaturedCarousel images={featuredImages} />
        )}
        <CategoryTiles categories={categories} />
      </div>

      <Footer />
    </main>
  );
}
