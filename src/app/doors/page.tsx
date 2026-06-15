import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { dbService } from '@/lib/db';
import { CategoryClient } from '@/app/category/[id]/CategoryClient';

export const revalidate = 0;

export default async function DoorsPage() {
  const categories = await dbService.getDivisionCategories('doors');
  const products = await dbService.getProducts(undefined, undefined, 'cat-doors');

  return (
    <div className="pt-32 pb-20 bg-dark-black max-w-7xl mx-auto px-6 md:px-12 min-h-screen">
      <div className="text-center mb-16">
        <span className="text-primary-gold text-xs tracking-[0.25em] uppercase font-semibold">Tata Pravesh Doors</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">Filter Doors & Windows by Category</h1>
        <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto mt-4">
          Official distributor of Tata Pravesh doors. Experience the unyielding strength of steel combined with the elegant wooden finish.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className="group relative h-48 w-full overflow-hidden flex flex-col justify-end text-left border border-white/15"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/40 to-transparent z-10 group-hover:from-dark-black/95 transition-all duration-300" />
            <Image
              src={cat.image_url}
              alt={cat.name}
              fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="relative z-20 p-4 w-full">
              <h4 className="font-display text-base text-white font-bold group-hover:text-primary-gold transition-colors duration-300">
                {cat.name}
              </h4>
              <span className="text-[9px] text-white tracking-widest uppercase flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                View Products <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-20">
        <h2 className="text-2xl font-display font-bold text-white mb-2">All Products in Tata Pravesh Doors</h2>
        <p className="text-white/60 text-sm mb-8">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'} for Tata Pravesh Doors
        </p>
        
        {products.length === 0 ? (
          <div className="text-center py-24 border border-white/5 bg-white/5 rounded-lg luxury-card">
            <p className="text-white/50 text-base">No products have been added to this division yet.</p>
          </div>
        ) : (
          <CategoryClient products={products} categoryName="Tata Pravesh Doors" />
        )}
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/90 hover:text-primary-gold font-semibold transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
