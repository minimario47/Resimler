import { categories, getCategoryBySlug } from '@/data/mock-data';
import CategoryClient from './CategoryClient';
import Header from '@/components/Header';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <main className="min-h-screen">
        <Header showBack title="Kategori bulunamadı" />
        <div className="pt-20 px-4 text-center">
          <h1 className="font-serif text-2xl">Kategori bulunamadı</h1>
          <p className="text-slate/60 mt-2">Aradığınız kategori mevcut değil.</p>
        </div>
      </main>
    );
  }

  return <CategoryClient category={category} />;
}

// Generate static params for GitHub Pages
export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}
