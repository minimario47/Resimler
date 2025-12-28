'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Header showBack title="Favoriler" />

      <div className="pt-16 md:pt-20">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate/5 flex items-center justify-center">
              <Heart className="w-8 h-8 text-slate/30" />
            </div>
            <h2 className="font-serif text-xl font-semibold mb-2">
              Favoriler
            </h2>
            <p className="text-slate/60 mb-6">
              Beğendiğiniz fotoğraflara kalp işaretini tıklayarak favorilere ekleyebilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
            >
              Galerilere Dön
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
