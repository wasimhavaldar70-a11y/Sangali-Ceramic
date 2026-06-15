'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, MapPin, Calendar, LayoutGrid } from 'lucide-react';
import { Project, Product } from '@/lib/db';


export default function ProjectClient({ project, usedProducts }: { project: Project, usedProducts: Product[] }) {
  const allImages = [project.image].filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="bg-dark-black text-white pt-28 pb-20 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 flex items-center justify-between text-xs text-white/50">
        <Link href="/#projects" className="flex items-center gap-2 hover:text-primary-gold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="flex items-center gap-2">
          <span>Home</span> <ChevronRight className="w-3 h-3" />
          <span>Projects</span> <ChevronRight className="w-3 h-3" />
          <span className="text-primary-gold font-medium">{project.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        {/* Left Side: Images */}
        <div className="flex flex-col gap-6">
          <div className="relative w-full aspect-[4/3] lg:aspect-square bg-charcoal border border-white/5 overflow-hidden flex items-center justify-center rounded-sm group">
            {allImages[activeImage] ? (
              <Image
                src={allImages[activeImage]}
                alt={project.title}
                fill
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="text-white/20 italic">No image available</div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-charcoal border overflow-hidden transition-all rounded ${
                    idx === activeImage ? 'border-primary-gold' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Project Info */}
        <div className="flex flex-col pt-4 lg:pt-12 sticky top-24">
          <span className="text-primary-gold text-[10px] tracking-[0.35em] uppercase font-semibold mb-2">
            {project.category}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-gold-gradient leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-6 mb-8 border-y border-white/5 py-6">
            {project.location && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Location</p>
                  <p className="text-sm font-semibold">{project.location}</p>
                </div>
              </div>
            )}
            
            {project.year && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Completion Year</p>
                  <p className="text-sm font-semibold">{project.year}</p>
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-invert prose-p:text-white/70 prose-p:leading-relaxed max-w-none">
            <p>{project.description}</p>
          </div>
        </div>
      </div>

      {/* Used Products Section */}
      {usedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 mt-32 pt-16 border-t border-white/10">
          <div className="text-center mb-16">
            <span className="text-primary-gold text-[10px] tracking-[0.35em] uppercase font-semibold">Materials & Finishes</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-4 text-white">
              Products Used In This Project
            </h2>
            <div className="w-12 h-0.5 bg-primary-gold mx-auto opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {usedProducts.map(prod => (
              <div key={prod.id} className="bg-charcoal border border-white/5 group flex flex-col h-full hover:border-primary-gold/50 transition-colors duration-300">
                <div className="relative h-64 overflow-hidden bg-dark-black flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-black/50 to-transparent z-10" />
                  {prod.images?.[0] ? (
                    <Image
                      src={prod.images[0]}
                      alt={prod.name}
                      fill className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 relative z-20"
                    />
                  ) : (
                    <div className="text-white/20 italic relative z-20">No Image</div>
                  )}
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[10px] text-white/80 tracking-widest uppercase font-semibold">{prod.sku}</span>
                    <h3 className="font-display text-lg font-bold text-white mt-1 hover:text-primary-gold transition-colors duration-300">
                      <Link href={`/products/${prod.id}`}>{prod.name}</Link>
                    </h3>
                    <p className="text-white text-xs mt-2 flex gap-4">
                      <span>Size: <strong>{prod.size}</strong></span>
                      <span>Finish: <strong>{prod.finish}</strong></span>
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/15">
                    <Link
                      href={`/products/${prod.id}`}
                      className="py-2.5 w-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
