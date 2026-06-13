'use client';

import { Product } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export function CategoryClient({ products, categoryName }: { products: Product[], categoryName: string }) {
  const triggerQuote = (product?: Product) => {
    window.dispatchEvent(new CustomEvent('open-quote-modal', { detail: product }));
  };

  const openQuickView = (product: Product) => {
    // Dispatch to a quick view modal if it exists globally, or we can just redirect to product page for now
    window.dispatchEvent(new CustomEvent('open-quick-view', { detail: product }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((prod) => (
        <div
          key={prod.id}
          className="group bg-charcoal border border-white/10 flex flex-col h-full overflow-hidden hover:border-primary-gold/45 transition-all duration-500 luxury-card"
        >
          {/* Image wrapper */}
          <div className="relative h-72 w-full overflow-hidden bg-dark-black">
            <Image
              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'}
              alt={prod.name}
              fill className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-dark-black/90 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary-gold border border-primary-gold/40 font-bold">
              {prod.finish}
            </div>
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col justify-between flex-grow">
            <div>
              <span className="text-[10px] text-white/80 tracking-widest uppercase font-semibold">{prod.sku}</span>
              <h3 className="font-display text-lg font-bold text-white mt-1 hover:text-primary-gold transition-colors duration-300">
                <Link href={`/products/${prod.id}`}>{prod.name}</Link>
              </h3>
              <p className="text-white text-xs mt-2 flex gap-4">
                {prod.size && <span>Size: <strong>{prod.size}</strong></span>}
                <span>Finish: <strong>{prod.finish}</strong></span>
              </p>
              <p className="text-primary-gold text-sm font-bold mt-4">
                ₹{prod.price.toLocaleString('en-IN')} / sq.ft
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/15">
              <Link
                href={`/products/${prod.id}`}
                className="py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </Link>
              <button
                onClick={() => triggerQuote(prod)}
                className="py-2.5 bg-primary-gold text-dark-black hover:bg-gold-gradient-hover text-xs uppercase tracking-wider font-bold transition-colors"
              >
                Get Quote
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
