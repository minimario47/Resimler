'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { Camera } from 'lucide-react';

interface CategoryTilesProps {
  categories: Category[];
}

export default function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-serif text-xl md:text-2xl font-semibold mb-6">
          Kategoriler
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/kategori/${category.slug}`}
                className="block group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-slate/5 card-hover">
                  {/* Collage of thumbnails */}
                  <div className="aspect-[4/3] relative">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
                      <div
                        className="col-span-1 row-span-2 bg-cover bg-center"
                        style={{ backgroundImage: `url(${category.featured_thumbnails[0]})` }}
                      />
                      <div
                        className="bg-cover bg-center"
                        style={{ backgroundImage: `url(${category.featured_thumbnails[1]})` }}
                      />
                      <div
                        className="bg-cover bg-center"
                        style={{ backgroundImage: `url(${category.featured_thumbnails[2]})` }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-serif text-lg md:text-xl font-semibold mb-1">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm opacity-90">
                      <span>{category.date_range}</span>
                      <span className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        {category.media_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
