'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowRight, Search, SlidersHorizontal, Eye, ShieldAlert,
  Compass, ArrowLeft, RefreshCw, Layers, Check, ChevronRight
} from 'lucide-react';
import { dbService, Product } from '@/lib/db';


export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-black pt-28 pb-24 text-center text-white">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlName = searchParams.get('name');

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string; label: string } | null>(
    urlCategory ? { type: 'division_category', value: urlCategory, label: urlName || 'Category' } : null
  );
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const productsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlCategory && !activeFilter) {
      setActiveFilter({ type: 'division_category', value: urlCategory, label: urlName || 'Category' });
    }
  }, [urlCategory, urlName, activeFilter]);

  // Load products with debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      const data = await dbService.getProducts(searchQuery);
      setProducts(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const triggerQuote = (product?: Product) => {
    window.dispatchEvent(new CustomEvent('open-quote-modal', { detail: product }));
  };

  // Directory Click Handler
  const handleFilterClick = (type: string, value: string, label: string) => {
    setActiveFilter({ type, value, label });
    // Smooth scroll down to grid
    setTimeout(() => {
      productsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const clearFilter = () => {
    setActiveFilter(null);
    setSearchQuery('');
  };

  // Filter Data
  const filteredProducts = products.filter(prod => {
    // Directory filter matching
    if (activeFilter) {
      const { type, value } = activeFilter;
      if (type === 'category') {
        // Map category filters
        if (value === 'eternity') return prod.finish.toLowerCase() === 'glossy';
        if (value === 'gres') return prod.category_id === 'cat-stone';
        if (value === 'vitronite') return prod.category_id === 'cat-marble';
        if (value === 'wall') return prod.finish.toLowerCase() === 'glossy' || prod.sku.includes('CR');
        if (value === 'faucets') return prod.sku.includes('K'); // Kerovit/faucet mock filter
        if (value === 'adhesive') return prod.sku.includes('GB');
      }
      if (type === 'application') {
        // Map space keywords in description
        const desc = (prod.description || '').toLowerCase();
        if (value === 'bathroom') return desc.includes('bathroom') || desc.includes('washroom') || prod.finish === 'Matte';
        if (value === 'kitchen') return desc.includes('kitchen') || prod.name.toLowerCase().includes('beige');
        if (value === 'living') return desc.includes('living') || desc.includes('hall') || prod.category_id === 'cat-marble';
        if (value === 'bedroom') return desc.includes('bedroom') || prod.category_id === 'cat-wooden';
        if (value === 'outdoor') return desc.includes('outdoor') || desc.includes('patio') || prod.finish === 'Matte';
        if (value === 'commercial') return desc.includes('corporate') || desc.includes('commercial') || prod.size.includes('1600');
        if (value === 'staircases') return prod.finish === 'Matte';
        if (value === 'parking') return prod.finish === 'Matte' && prod.category_id === 'cat-stone';
        if (value === 'offices') return desc.includes('corporate') || prod.category_id === 'cat-marble';
        if (value === 'hotels') return desc.includes('luxury') || prod.finish === 'Glossy';
      }
      if (type === 'collection') {
        // Map collection filters
        if (value === 'uniterra') return prod.category_id === 'cat-stone';
        if (value === 'ultima') return prod.collection_id === 'col-large' || prod.size.includes('1600');
        if (value === 'vitronite') return prod.category_id === 'cat-marble';
        if (value === 'grestough') return prod.category_id === 'cat-stone';
        if (value === 'kasamood') return prod.category_id === 'cat-wooden';
        if (value === 'duratech') return prod.finish === 'Matte';
        if (value === 'durock') return prod.category_id === 'cat-stone';
      }
      if (type === 'division_category') {
        return prod.division_category_id === value;
      }
    }
    return true;
  });

  // Sort Data
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'latest') return b.sku.localeCompare(a.sku);
    return a.name.localeCompare(b.name); // Default alphabetical / popular
  });

  return (
    <div className="bg-dark-black text-white min-h-screen pt-28 pb-24">
      {/* Banner */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-primary-gold text-xs tracking-[0.4em] uppercase font-semibold">Luxury Catalog</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mt-2">Our Products</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Link href="/" className="hover:text-primary-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white">Products</span>
        </div>
      </div>



      {/* FILTERABLE PRODUCTS GRID CONTAINER */}
      <div ref={productsGridRef} className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
          {/* Active filter display */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold font-display text-white">
              {activeFilter ? `${activeFilter.label} Showcase` : 'All Products'} 
              <span className="text-white/40 font-sans text-xs font-normal ml-2">({sortedProducts.length} items)</span>
            </h2>
            {activeFilter && (
              <button
                onClick={clearFilter}
                className="bg-primary-gold/10 hover:bg-primary-gold/20 text-primary-gold text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 flex items-center gap-1.5 transition-colors border border-primary-gold/20"
              >
                Clear Filter <span>×</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full sm:w-64 bg-charcoal border border-white/20 py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-gold placeholder-white/45"
              />
              <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-charcoal border border-white/20 text-xs text-white py-2.5 px-3 focus:outline-none focus:border-primary-gold"
              >
                <option value="popular">Popularity</option>
                <option value="latest">Latest SKU</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-24 bg-charcoal/20 border border-white/5 flex flex-col items-center">
            <ShieldAlert className="w-10 h-10 text-primary-gold/60 mb-4" />
            <h3 className="font-display text-lg font-bold mb-2">No matching products found</h3>
            <p className="text-white/60 text-xs max-w-sm mb-6">We don&apos;t currently have products matching that specific filter. Try looking for marble slabs, wooden planks, or stones.</p>
            <button
              onClick={clearFilter}
              className="px-6 py-2.5 bg-primary-gold text-dark-black font-semibold text-xs uppercase tracking-widest hover:bg-gold-gradient-hover transition-colors"
            >
              Browse All Tiles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((prod) => (
              <div
                key={prod.id}
                className="group bg-charcoal border border-white/10 flex flex-col h-full overflow-hidden hover:border-primary-gold/45 transition-all duration-500 luxury-card"
              >
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden bg-dark-black">
                  {prod.images[0] && (
                    <Image
                      src={prod.images[0]}
                      alt={prod.name}
                      fill className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-dark-black/90 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary-gold border border-primary-gold/40 font-bold">
                    {prod.finish}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[10px] text-white/50 tracking-widest uppercase font-semibold">{prod.sku}</span>
                    <h3 className="font-display text-lg font-bold text-white mt-1 hover:text-primary-gold transition-colors duration-300">
                      <Link href={`/products/${prod.id}`}>{prod.name}</Link>
                    </h3>
                    <p className="text-white/70 text-xs mt-2.5 flex gap-4">
                      <span>Size: <strong>{prod.size}</strong></span>
                      <span>Finish: <strong>{prod.finish}</strong></span>
                    </p>
                    <p className="text-primary-gold text-sm font-bold mt-4">
                      ₹{prod.price.toLocaleString('en-IN')} / sq.ft
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/15">
                    <button
                      onClick={() => setQuickViewProduct(prod)}
                      className="py-2.5 bg-white/5 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Quick View
                    </button>
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
        )}
      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-charcoal border border-primary-gold/25 shadow-2xl p-6 md:p-10 rounded-none grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Image */}
            <div className="relative h-64 md:h-[360px] w-full bg-dark-black overflow-hidden border border-white/5">
              {quickViewProduct.images[0] && (
                <Image
                  src={quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  fill className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Right Info */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-white/50 tracking-widest uppercase font-bold">{quickViewProduct.sku}</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-gold-gradient mt-1 mb-4">
                  {quickViewProduct.name}
                </h3>
                <p className="text-white/80 text-xs md:text-sm font-normal leading-relaxed mb-6">
                  {quickViewProduct.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between border-b border-white/15 pb-2 text-xs">
                    <span className="text-white/45 uppercase tracking-wider">Available Size</span>
                    <span className="font-bold">{quickViewProduct.size}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/15 pb-2 text-xs">
                    <span className="text-white/45 uppercase tracking-wider">Surface Finish</span>
                    <span className="font-bold">{quickViewProduct.finish}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/15 pb-2 text-xs">
                    <span className="text-white/45 uppercase tracking-wider">Water Absorption</span>
                    <span className="font-bold">{quickViewProduct.tech_specs?.water_absorption || '< 0.05%'}</span>
                  </div>
                </div>

                <div className="text-xl font-bold text-primary-gold mb-6">
                  ₹{quickViewProduct.price.toLocaleString('en-IN')} / sq.ft
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/products/${quickViewProduct.id}`}
                  className="flex-1 py-3 border border-white/20 text-white text-center font-semibold text-xs uppercase tracking-widest hover:bg-white hover:text-dark-black transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => {
                    setQuickViewProduct(null);
                    triggerQuote(quickViewProduct);
                  }}
                  className="flex-1 py-3 bg-gold-gradient text-dark-black text-center font-semibold text-xs uppercase tracking-widest hover:bg-gold-gradient-hover transition-colors"
                >
                  Get Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
