'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import CategoryTiles from '@/components/CategoryTiles';
import Footer from '@/components/Footer';
import { categories, DRIVE_FOLDERS } from '@/data/mock-data';
import { getFromCache, setInCache, checkCacheVersion } from '@/lib/cache';

interface FeaturedImage {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface CachedHomeData {
  heroImage: string;
  featuredImages: FeaturedImage[];
}

// Default fallback hero image for instant loading
const FALLBACK_HERO = 'https://drive.google.com/thumbnail?id=1KKtFekFxbUQEeLsjVAkzqas8SSvNeNu4&sz=w1920';
const CACHE_KEY = 'home_featured_data';

export default function Home() {
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([]);
  const [heroImage, setHeroImage] = useState<string>(FALLBACK_HERO);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Check cache version on mount
    checkCacheVersion();
    
    // Only fetch once
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    // Try to get cached data first for instant loading
    const cached = getFromCache<CachedHomeData>(CACHE_KEY);
    if (cached) {
      setHeroImage(cached.data.heroImage);
      setFeaturedImages(cached.data.featuredImages);
      
      // If data is stale, refresh in background
      if (cached.isStale) {
        fetchFeaturedImages(true);
      }
      return;
    }
    
    // No cache, show loading and fetch
    setLoading(true);
    fetchFeaturedImages(false);
  }, []);

  const fetchFeaturedImages = async (isBackground: boolean) => {
    try {
      const folderId = DRIVE_FOLDERS['featured'];
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        `https://drive.google.com/embeddedfolderview?id=${folderId}`
      )}`;
      
      const response = await fetch(proxyUrl);
      const html = await response.text();
      
      // Parse images from HTML
      const images: FeaturedImage[] = [];
      const entryRegex = /id="entry-([a-zA-Z0-9_-]+)"[\s\S]*?flip-entry-title">([^<]+)</g;
      let match;
      
      while ((match = entryRegex.exec(html)) !== null) {
        const fileId = match[1];
        const fileName = match[2];
        
        if (/\.(jpg|jpeg|png|gif|webp|heic)$/i.test(fileName)) {
          images.push({
            id: fileId,
            name: fileName,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
          });
        }
      }
      
      if (images.length > 0) {
        const heroImg = `https://drive.google.com/thumbnail?id=${images[0].id}&sz=w1920`;
        const featured = images.slice(1);
        
        // Cache the data for 5 minutes
        setInCache<CachedHomeData>(CACHE_KEY, {
          heroImage: heroImg,
          featuredImages: featured,
        }, 5 * 60 * 1000);
        
        setHeroImage(heroImg);
        setFeaturedImages(featured);
      }
    } catch (error) {
      console.error('Failed to fetch featured images:', error);
      // Keep fallback image if already set
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  // Show skeleton instead of blocking loading spinner
  if (loading) {
    return (
      <main className="min-h-screen">
        <Header transparent />
        <Hero
          backgroundImage={FALLBACK_HERO}
          title="Nusaybin • Anılar Haftası"
          subtitle="Özlem & Zübeyir"
          date="24-27 Aralık 2025"
          ctaText="Galerileri Gör"
        />
        <div className="bg-cream">
          {/* Skeleton for featured carousel */}
          <section className="py-8 md:py-12">
            <div className="max-w-[1200px] mx-auto">
              <div className="px-4 mb-6">
                <div className="h-8 w-48 bg-slate/10 rounded animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-hidden px-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[240px] md:w-[280px] aspect-[3/4] rounded-xl bg-slate/10 animate-pulse" />
                ))}
              </div>
            </div>
          </section>
          <CategoryTiles categories={categories} />
        </div>
        <Footer />
      </main>
    );
  }

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
