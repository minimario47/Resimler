'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import CategoryTiles from '@/components/CategoryTiles';
import Footer from '@/components/Footer';
import { categories, DRIVE_FOLDERS } from '@/data/mock-data';
import { RefreshCw } from 'lucide-react';

interface FeaturedImage {
  id: string;
  name: string;
  thumbnailUrl: string;
}

export default function Home() {
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([]);
  const [heroImage, setHeroImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchFeaturedImages = useCallback(async () => {
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
        // First image for hero, rest for featured carousel
        setHeroImage(`https://drive.google.com/thumbnail?id=${images[0].id}&sz=w1920`);
        setFeaturedImages(images.slice(1));
      }
    } catch (error) {
      console.error('Failed to fetch featured images:', error);
      // Use a fallback image
      setHeroImage('https://drive.google.com/thumbnail?id=1KKtFekFxbUQEeLsjVAkzqas8SSvNeNu4&sz=w1920');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedImages();
  }, [fetchFeaturedImages]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-slate/60">Yükleniyor...</p>
        </div>
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
        date="24-27 Aralık 2024"
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
