'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Heart, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/data/mock-data';

interface HeaderProps {
  transparent?: boolean;
  showBack?: boolean;
  title?: string;
  onBackClick?: () => void;
}

export default function Header({ 
  transparent = false, 
  showBack = false, 
  title,
  onBackClick 
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shouldBeSolid = !transparent || isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-top ${
          shouldBeSolid
            ? 'bg-cream/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left section */}
            <div className="flex items-center gap-2">
              {showBack ? (
                <button
                  onClick={onBackClick || (() => window.history.back())}
                  className="p-2 -ml-2 rounded-full hover:bg-slate/10 transition-colors"
                  aria-label="Geri"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={() => setMenuOpen(true)}
                  className="p-2 -ml-2 rounded-full hover:bg-slate/10 transition-colors md:hidden"
                  aria-label="Menü"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              
              {title ? (
                <span className="font-serif text-lg font-semibold truncate max-w-[200px]">
                  {title}
                </span>
              ) : (
                <Link href="/" className="font-serif text-lg md:text-xl font-semibold">
                  <span className={shouldBeSolid ? 'text-slate' : 'text-white drop-shadow-md'}>
                    Özlem & Zübeyir
                  </span>
                </Link>
              )}
            </div>

            {/* Center - Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className={`text-sm font-medium hover:text-accent transition-colors ${
                    shouldBeSolid ? 'text-slate' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/hakkinda"
                className={`text-sm font-medium hover:text-accent transition-colors ${
                  shouldBeSolid ? 'text-slate' : 'text-white/90 hover:text-white'
                }`}
              >
                Hakkında
              </Link>
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-1">
              <Link
                href="/ara"
                className={`p-2 rounded-full hover:bg-slate/10 transition-colors ${
                  shouldBeSolid ? 'text-slate' : 'text-white'
                }`}
                aria-label="Ara"
              >
                <Search className="w-5 h-5" />
              </Link>
              <Link
                href="/favoriler"
                className={`p-2 rounded-full hover:bg-slate/10 transition-colors ${
                  shouldBeSolid ? 'text-slate' : 'text-white'
                }`}
                aria-label="Favoriler"
              >
                <Heart className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-cream z-50 shadow-2xl safe-top"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-xl font-semibold">Menü</span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 -mr-2 rounded-full hover:bg-slate/10"
                    aria-label="Kapat"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="space-y-1">
                  <Link
                    href="/"
                    className="block px-4 py-3 rounded-lg hover:bg-slate/5 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ana Sayfa
                  </Link>
                  <div className="pt-4 pb-2 px-4 text-xs text-slate/60 uppercase tracking-wide">
                    Kategoriler
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      className="block px-4 py-3 rounded-lg hover:bg-slate/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-sm text-slate/60 ml-2">
                        {cat.media_count} medya
                      </span>
                    </Link>
                  ))}
                  <div className="pt-4 pb-2 px-4 text-xs text-slate/60 uppercase tracking-wide">
                    Diğer
                  </div>
                  <Link
                    href="/hakkinda"
                    className="block px-4 py-3 rounded-lg hover:bg-slate/5 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Hakkında
                  </Link>
                  <Link
                    href="/ara"
                    className="block px-4 py-3 rounded-lg hover:bg-slate/5 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ara
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
