'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TilesPage() {
  const handleSpaceSelect = (spaceName: string) => {
    window.location.href = '/#products';
  };

  return (
    <div className="pt-32 pb-20 bg-dark-black max-w-7xl mx-auto px-6 md:px-12 min-h-screen">
      <div className="text-center mb-16">
        <span className="text-primary-gold text-xs tracking-[0.25em] uppercase font-semibold">Explore by Space</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">Filter Tiles by Room Application</h1>
        <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto mt-4">
          Discover our curated vitrified slabs, marble textures, and designer ceramic collections crafted for modern spaces.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { name: 'Living Room', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80' },
          { name: 'Bathroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
          { name: 'Kitchen', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80' },
          { name: 'Outdoor', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' },
          { name: 'Commercial', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80' },
          { name: 'Parking', url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80' },
        ].map((space) => (
          <button
            key={space.name}
            onClick={() => handleSpaceSelect(space.name)}
            className="group relative h-48 w-full overflow-hidden flex flex-col justify-end text-left border border-white/15"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/40 to-transparent z-10 group-hover:from-dark-black/95 transition-all duration-300" />
            <Image
              src={space.url}
              alt={space.name}
              fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="relative z-20 p-4 w-full">
              <h4 className="font-display text-base text-white font-bold group-hover:text-primary-gold transition-colors duration-300">
                {space.name}
              </h4>
              <span className="text-[9px] text-white tracking-widest uppercase flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                View Tiles <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/90 hover:text-primary-gold font-semibold transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
