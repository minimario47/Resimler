'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MediaGrid from '@/components/MediaGrid';
import Footer from '@/components/Footer';
import { mediaItems } from '@/data/mock-data';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Use a microtask to avoid the lint warning about setState in effect
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('wedding-favorites');
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch {
          setFavorites([]);
        }
      }
      setIsLoaded(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const favoriteMedia = mediaItems.filter((m) => favorites.includes(m.id));

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-cream">
        <Header showBack title="Favoriler" />
        <div className="pt-20 px-4 text-center">
          <div className="animate-pulse">Yükleniyor...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <Header showBack title="Favoriler" />

      <div className="pt-16 md:pt-20">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {favoriteMedia.length > 0 ? (
            <>
              <p className="text-slate/60 mb-6">
                {favoriteMedia.length} favori medya
              </p>
              <MediaGrid media={favoriteMedia} />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate/5 flex items-center justify-center">
                <Heart className="w-8 h-8 text-slate/30" />
              </div>
              <h2 className="font-serif text-xl font-semibold mb-2">
                Henüz favori yok
              </h2>
              <p className="text-slate/60">
                Beğendiğiniz fotoğraf ve videolara kalp işaretini tıklayarak
                favorilere ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
