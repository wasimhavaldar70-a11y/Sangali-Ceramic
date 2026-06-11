import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DoorsPage() {
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
        {[
          { name: 'Main Entry Doors', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
          { name: 'Bedroom Doors', url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=400&q=80' },
          { name: 'Toilet & Bath Doors', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80' },
          { name: 'Safety Steel Doors', url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=400&q=80' },
          { name: 'Steel Windows', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80' },
          { name: 'Double Leaf Doors', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=80' },
        ].map((cat) => (
          <a
            key={cat.name}
            href={`https://wa.me/919876543210?text=Hi!%20I%27m%20interested%20in%20Tata%20Pravesh%20Doors%20-%20${encodeURIComponent(cat.name)}.%20Could%20you%20please%20share%20the%20brochure%20and%20pricing?`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative h-48 w-full overflow-hidden flex flex-col justify-end text-left border border-white/15"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/40 to-transparent z-10 group-hover:from-dark-black/95 transition-all duration-300" />
            <Image
              src={cat.url}
              alt={cat.name}
              fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="relative z-20 p-4 w-full">
              <h4 className="font-display text-base text-white font-bold group-hover:text-primary-gold transition-colors duration-300">
                {cat.name}
              </h4>
              <span className="text-[9px] text-white tracking-widest uppercase flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                Inquire Category <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </a>
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
