import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { dbService } from '@/lib/supabase';

export const revalidate = 0;

export default async function BathFittingsPage() {
  const categories = await dbService.getDivisionCategories('bath-fittings');

  return (
    <div className="pt-32 pb-20 bg-dark-black max-w-7xl mx-auto px-6 md:px-12 min-h-screen">
      <div className="text-center mb-16">
        <span className="text-primary-gold text-xs tracking-[0.25em] uppercase font-semibold">Jaquar Group</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">Filter Bath Fittings by Category</h1>
        <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto mt-4">
          Upgrade your spaces with luxury sanitaryware, wellness systems, designer showers, and sleek fittings from the premium Jaquar Group.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`https://wa.me/919876543210?text=Hi!%20I%27m%20interested%20in%20Jaquar%20Group%20Bath%20Fittings%20-%20${encodeURIComponent(cat.name)}.%20Could%20you%20please%20share%20the%20brochure%20and%20pricing?`}
            target="_blank"
            rel="noopener noreferrer"
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
