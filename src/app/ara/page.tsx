'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import MediaGrid from '@/components/MediaGrid';
import Footer from '@/components/Footer';
import { searchMedia, mediaItems } from '@/data/mock-data';
import { Search, X, TrendingUp } from 'lucide-react';

const popularTags = ['aile', 'gelin', 'damat', 'dans', 'müzik', 'tören'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const results = useMemo(() => {
    if (activeTag) {
      return mediaItems.filter((m) => m.tags.includes(activeTag));
    }
    if (query.trim().length < 2) return [];
    return searchMedia(query);
  }, [query, activeTag]);

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setActiveTag(null);
  };

  return (
    <main className="min-h-screen bg-cream">
      <Header showBack title="Ara" />

      <div className="pt-16 md:pt-20">
        {/* Search input */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveTag(null);
              }}
              placeholder="Fotoğraf veya video ara..."
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-white shadow-sm border border-slate/10 focus:outline-none focus:ring-2 focus:ring-accent/50 text-lg"
              autoFocus
            />
            {(query || activeTag) && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate/10"
                aria-label="Temizle"
              >
                <X className="w-5 h-5 text-slate/40" />
              </button>
            )}
          </div>

          {/* Popular tags */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-slate/40" />
              <span className="text-sm text-slate/60">Popüler etiketler</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeTag === tag
                      ? 'bg-accent text-white'
                      : 'bg-white border border-slate/10 hover:border-accent/50'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-[1200px] mx-auto px-4 pb-12">
          {(query.trim().length >= 2 || activeTag) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <p className="text-slate/60">
                {results.length > 0 ? (
                  <>
                    <span className="font-medium text-slate">{results.length}</span>{' '}
                    sonuç bulundu
                    {activeTag && (
                      <span className="ml-1">
                        &quot;#{activeTag}&quot; etiketi için
                      </span>
                    )}
                  </>
                ) : (
                  'Sonuç bulunamadı'
                )}
              </p>
            </motion.div>
          )}

          {results.length > 0 ? (
            <MediaGrid media={results} />
          ) : query.trim().length < 2 && !activeTag ? (
            <div className="text-center py-12">
              <p className="text-slate/40">
                Aramak istediğiniz kelimeyi yazın veya etiket seçin
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </main>
  );
}
