'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, MapPin, Calendar, Camera } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Header showBack title="Hakkında" />

      {/* Hero section */}
      <div className="pt-20 md:pt-24">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
              <Heart className="w-12 h-12 text-accent" />
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Özlem & Zübeyir
            </h1>
            
            <p className="text-lg text-slate/70 mb-8">
              Nusaybin&apos;de başlayan hikayemiz
            </p>
          </motion.div>
        </div>
      </div>

      {/* Story section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto px-4 pb-12"
      >
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="font-serif text-2xl font-semibold mb-4">Hikayemiz</h2>
          
          <div className="prose prose-slate max-w-none">
            <p>
              Özlem ve Zübeyir, Mardin&apos;in güzel ilçesi Nusaybin&apos;de tanıştılar. 
              Yıllar süren dostluk, derin bir aşka dönüştü ve 2025 Temmuz ayında 
              aileleri ve sevdikleriyle bir araya gelerek bu özel anı kutladılar.
            </p>
            
            <p>
              Bu arşiv, düğün haftasında çekilen tüm fotoğraf ve videoları 
              bir arada tutmak için hazırlandı. Aile üyeleri ve dostlar, 
              bu özel anları tekrar tekrar yaşayabilir ve sevdikleriyle paylaşabilirler.
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-cream rounded-xl">
              <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm text-slate/60">Konum</p>
                <p className="font-medium">Nusaybin, Mardin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-cream rounded-xl">
              <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm text-slate/60">Tarih</p>
                <p className="font-medium">14-17 Temmuz 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-cream rounded-xl">
              <Camera className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm text-slate/60">Arşiv</p>
                <p className="font-medium">557+ Medya</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery preview */}
        <div className="mt-8">
          <h2 className="font-serif text-2xl font-semibold mb-4">Öne Çıkanlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
              'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400',
              'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400',
            ].map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={img}
                  alt={`Öne çıkan ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="mt-8 p-6 bg-slate/5 rounded-xl text-center">
          <p className="text-sm text-slate/60">
            Bu arşiv, sevgiyle hazırlanmıştır. ❤️
          </p>
          <p className="text-xs text-slate/40 mt-2">
            Fotoğraf ve video içerikleri, aile ve dostların katkılarıyla oluşturulmuştur.
          </p>
        </div>
      </motion.div>

      <Footer />
    </main>
  );
}
