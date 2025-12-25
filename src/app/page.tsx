'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import CategoryTiles from '@/components/CategoryTiles';
import Footer from '@/components/Footer';
import { categories, featuredMoments } from '@/data/mock-data';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header transparent />
      
      <Hero
        backgroundImage="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920"
        title="Nusaybin • Anılar Haftası"
        subtitle="Özlem & Zübeyir"
        date="14-17 Temmuz 2025"
        ctaText="Galerileri Gör"
      />

      <div className="bg-cream">
        <FeaturedCarousel moments={featuredMoments} />
        <CategoryTiles categories={categories} />
      </div>

      <Footer />
    </main>
  );
}
