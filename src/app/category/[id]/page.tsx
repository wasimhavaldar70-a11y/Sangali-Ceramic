import { dbService } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { CategoryClient } from './CategoryClient';

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { id: string } }) {
  // Await the params to prevent the warning in Next.js 15
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  
  const category = await dbService.getDivisionCategoryById(categoryId);
  
  if (!category) {
    notFound();
  }

  const products = await dbService.getProducts(undefined, categoryId);

  // Determine back link based on category's parent division
  const backLink = `/${category.page_slug}`;

  return (
    <div className="min-h-screen bg-dark-black flex flex-col">
      {/* Hero Banner specific to this category */}
      <div className="relative h-[40vh] min-h-[300px] w-full mt-20 flex items-center justify-center">
        <div className="absolute inset-0 bg-dark-black/60 z-10" />
        <Image 
          src={category.image_url} 
          alt={category.name} 
          fill 
          className="object-cover"
        />
        <div className="relative z-20 text-center px-4 mt-8">
          <Link href={backLink} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary-gold hover:text-white mb-6 font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to {category.page_slug.replace('-', ' ')}
          </Link>
          <span className="block text-white/80 text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">
            Exclusive Collection
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-2xl">
            {category.name}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 w-full flex-grow">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Available Products</h2>
            <p className="text-white/60 text-sm">
              Showing {products.length} {products.length === 1 ? 'product' : 'products'} for {category.name}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 border border-white/5 bg-white/5 rounded-lg luxury-card">
            <p className="text-white/50 text-base">No products have been added to this category yet.</p>
            <p className="text-white/30 text-xs mt-2">Check back later or explore other categories.</p>
          </div>
        ) : (
          <CategoryClient products={products} categoryName={category.name} />
        )}
      </div>
    </div>
  );
}
