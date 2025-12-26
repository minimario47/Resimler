'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  backgroundImage: string;
  title?: string;
  subtitle?: string;
  date?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function Hero({
  backgroundImage,
  title = 'Nusaybin • Anılar Haftası',
  subtitle = 'Özlem & Zübeyir',
  date = '24-27 Aralık 2024',
  ctaText = 'Galerileri Gör',
  onCtaClick,
}: HeroProps) {
  const scrollToContent = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      window.scrollTo({
        top: window.innerHeight - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative h-[85vh] min-h-[500px] md:h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-end pb-16 md:pb-24 px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-sm md:text-base tracking-widest uppercase opacity-90">
            {date}
          </p>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
            {title}
          </h1>
          <p className="text-lg md:text-xl opacity-90">{subtitle}</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          onClick={scrollToContent}
          className="mt-8 flex flex-col items-center gap-2 group"
          aria-label={ctaText}
        >
          <span className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
            {ctaText}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6 opacity-70" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
