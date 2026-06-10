'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Search, SlidersHorizontal, Eye, FileText, Star,
  Shield, Droplet, Flame, Settings, Zap, Truck, MessageSquare, Phone, MapPin, Check
} from 'lucide-react';
import { dbService, Product, Collection, Project, Testimonial, Catalogue } from '@/lib/supabase';

const BRAND_LOGOS = [
  {
    name: 'Jaquar',
    logo: (
      <div className="flex flex-col items-center justify-center bg-[#005F60] text-white px-5 py-2 rounded-sm select-none w-full h-full">
        <span className="font-serif italic text-base font-extrabold tracking-wide leading-none">Jaquar</span>
        <span className="text-[7px] tracking-[0.25em] uppercase font-bold mt-1 text-[#D2EAE8]">GROUP</span>
      </div>
    )
  },
  {
    name: 'Artize',
    logo: (
      <div className="flex flex-col items-center justify-center text-white select-none w-full h-full py-1">
        <span className="font-light text-xl tracking-[0.2em] leading-none text-white relative">
          A<span className="text-primary-gold font-bold">.</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-white mt-1">Artize</span>
        <span className="text-[5px] tracking-wider text-white/50 uppercase mt-0.5">craftsmanship in water</span>
      </div>
    )
  },
  {
    name: 'Fenesta',
    logo: (
      <div className="flex flex-col items-center justify-center text-white select-none w-full h-full">
        <div className="flex items-center gap-1">
          <span className="text-sm font-extrabold tracking-tight text-[#0066A6]">Fenesta</span>
          <svg className="w-3.5 h-3.5 text-[#00A5E3]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
          </svg>
        </div>
        <span className="text-[6px] tracking-widest text-[#E31E24] uppercase font-bold mt-0.5">Better by Design</span>
      </div>
    )
  },
  {
    name: 'Johnson',
    logo: (
      <div className="flex items-center gap-2.5 text-white select-none w-full h-full justify-center">
        <div className="w-6 h-6 bg-[#E31E24] p-1 flex items-center justify-center rounded-sm shrink-0">
          <div className="w-full h-full border border-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight text-white leading-none">JOHNSON</span>
          <span className="text-[5px] tracking-wide text-white/60 mt-0.5">Not just tiles, Lifestyles.</span>
        </div>
      </div>
    )
  },
  {
    name: 'Nitco',
    logo: (
      <div className="flex flex-col items-center justify-center text-white select-none w-full h-full">
        <span className="text-lg font-black tracking-[0.15em] text-white leading-none">NITCO</span>
        <span className="text-[5px] tracking-[0.2em] text-white/50 uppercase mt-1">Tiles Marble Mosaico</span>
      </div>
    )
  },
  {
    name: 'Oasis',
    logo: (
      <div className="flex items-center gap-2 text-white select-none w-full h-full justify-center">
        <svg className="w-5 h-5 text-[#F29111] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M12 2a10 10 0 1 0 10 10c0-3.5-1.5-6-4-8s-5-1.5-6 1" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-white leading-none">oasis</span>
          <span className="text-[5px] tracking-widest text-white/40 uppercase mt-0.5">Your Own Dream</span>
        </div>
      </div>
    )
  },
  {
    name: 'Essco',
    logo: (
      <div className="flex flex-col items-center justify-center bg-[#FBC02D] text-black px-4 py-2 rounded-sm select-none w-full h-full">
        <span className="font-sans italic text-base font-black tracking-tighter leading-none text-black">ESSCO</span>
        <span className="text-[5px] tracking-tighter font-bold uppercase mt-0.5 text-black/85">Bath fittings since 1960</span>
      </div>
    )
  },
  {
    name: 'Tata Pravesh',
    logo: (
      <div className="flex flex-col items-center justify-center text-white select-none w-full h-full">
        <div className="flex items-center gap-0.5 bg-[#005A9C] px-2.5 py-0.5 text-[9px] font-bold tracking-widest rounded-sm">
          <span>TATA</span>
          <span className="text-white/60">|</span>
          <span className="tracking-tighter font-black text-white">PRAVESH</span>
        </div>
        <span className="text-[5px] tracking-[0.25em] text-white/50 uppercase mt-0.5 font-semibold">Doors of India</span>
      </div>
    )
  },
  {
    name: 'RAK Ceramics',
    logo: (
      <div className="flex flex-col items-center justify-center text-white select-none w-full h-full">
        <div className="flex gap-0.5 mb-0.5">
          <span className="w-2 h-2 border-t border-l border-white transform rotate-45" />
          <span className="w-2 h-2 border-t border-r border-[#E31E24] transform rotate-45" />
        </div>
        <span className="text-xs font-extrabold tracking-[0.2em] text-white leading-none">RAK</span>
        <span className="text-[5px] tracking-[0.2em] text-white/60 uppercase mt-0.5 font-semibold">Ceramics</span>
      </div>
    )
  },
  {
    name: 'Franke',
    logo: (
      <div className="bg-[#E31E24] text-white px-4 py-1.5 font-black text-sm tracking-[0.1em] rounded-sm select-none w-full h-full flex items-center justify-center">
        FRANKE
      </div>
    )
  },
  {
    name: 'Carysil',
    logo: (
      <div className="flex flex-col items-center justify-center bg-[#A6192E] text-white px-4 py-1.5 rounded-sm select-none w-full h-full">
        <span className="font-extrabold text-xs tracking-[0.12em] text-white leading-none">CARYSIL</span>
        <span className="text-[5px] tracking-widest text-[#E5C6C6] uppercase font-bold mt-0.5">German Engineered</span>
      </div>
    )
  },
  {
    name: 'Antiek',
    logo: (
      <div className="flex flex-col items-center justify-center bg-[#1A2535] text-white px-4 py-1.5 rounded-sm border border-white/5 select-none w-full h-full">
        <span className="font-serif text-xs font-extrabold tracking-[0.12em] text-[#D4B26F] leading-none">ANTIEK</span>
        <span className="text-[5px] tracking-[0.2em] text-white/80 uppercase mt-1">Vitrified</span>
      </div>
    )
  },
  {
    name: 'Nirali BG',
    logo: (
      <div className="flex flex-col items-center justify-center text-white select-none w-full h-full">
        <span className="text-xs font-black tracking-tight text-[#3B82F6] leading-none">NIRALI BG</span>
        <span className="text-[5px] tracking-wide text-white/50 uppercase mt-0.5">Stainless Steel Sinks</span>
      </div>
    )
  },
  {
    name: 'Ardex Endura',
    logo: (
      <div className="flex flex-col items-center justify-center text-white select-none w-full h-full">
        <span className="text-xs italic font-extrabold tracking-tighter text-white leading-none">
          ARDEX <span className="text-primary-gold">ENDURA</span>
        </span>
        <span className="text-[5px] tracking-widest text-white/40 uppercase mt-1">Tile Adhesives & Grouts</span>
      </div>
    )
  }
];

export default function HomePage() {
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);

  // UI Filtering/Sorting States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [activeProjectCategory, setActiveProjectCategory] = useState('All');

  // Hero Slider
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=90',
      title: 'Grand Marble Luxury',
      subtitle: 'Calacatta Glazed Vitrified Slabs'
    },
    {
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=90',
      title: 'Warm Architectural Woods',
      subtitle: 'Natural Woodgrain Planks Collection'
    },
    {
      url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1920&q=90',
      title: 'Rustic Raw Stone',
      subtitle: 'Contemporary Slate & Stone Textures'
    }
  ];

  // AI Visualizer before/after divider position
  const [sliderPos, setSliderPos] = useState(50);
  const visualizerContainerRef = useRef<HTMLDivElement>(null);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Stats Counter state (animation trigger)
  const [stats, setStats] = useState({
    years: 0,
    projectsCount: 0,
    dealers: 0,
    designs: 0,
    states: 0
  });

  // Testimonials slide state
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      const prods = await dbService.getProducts();
      const cols = await dbService.getCollections();
      const projs = await dbService.getProjects();
      const tests = await dbService.getTestimonials();
      const cats = await dbService.getCatalogues();

      setProducts(prods);
      setCollections(cols);
      setProjects(projs);
      setTestimonials(tests);
      setCatalogues(cats);
    };
    fetchData();

    // Event listener for search trigger from header
    const handleGlobalSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSearchQuery(customEvent.detail);
      }
    };
    window.addEventListener('product-search', handleGlobalSearch);
    return () => window.removeEventListener('product-search', handleGlobalSearch);
  }, []);

  // Auto slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Auto slide testimonials
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Animate stats counters when in view
  useEffect(() => {
    const targetStats = { years: 25, projectsCount: 5000, dealers: 300, designs: 1000, states: 20 };
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;
    
    let currentStep = 0;
    const counterTimer = setInterval(() => {
      currentStep++;
      setStats({
        years: Math.min(Math.round((targetStats.years / steps) * currentStep), targetStats.years),
        projectsCount: Math.min(Math.round((targetStats.projectsCount / steps) * currentStep), targetStats.projectsCount),
        dealers: Math.min(Math.round((targetStats.dealers / steps) * currentStep), targetStats.dealers),
        designs: Math.min(Math.round((targetStats.designs / steps) * currentStep), targetStats.designs),
        states: Math.min(Math.round((targetStats.states / steps) * currentStep), targetStats.states),
      });
      if (currentStep >= steps) {
        clearInterval(counterTimer);
      }
    }, interval);

    return () => clearInterval(counterTimer);
  }, []);

  // Slider Mouse Move Handler
  const handleSliderMove = (clientX: number) => {
    if (!visualizerContainerRef.current) return;
    const rect = visualizerContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  // Filter & Sort Products
  const filteredProducts = products.filter(prod => {
    const matchesCategory = activeCategory === 'All' || prod.finish.toLowerCase() === activeCategory.toLowerCase() || prod.name.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.finish.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.size.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'latest') return b.sku.localeCompare(a.sku); // Mock comparison
    return a.name.localeCompare(b.name); // Default popular sorting
  });

  // Filter Projects
  const filteredProjects = projects.filter(proj => {
    return activeProjectCategory === 'All' || proj.category === activeProjectCategory;
  });

  const triggerQuote = (product?: Product) => {
    window.dispatchEvent(new CustomEvent('open-quote-modal', { detail: product }));
  };

  const triggerCatalogue = () => {
    window.dispatchEvent(new CustomEvent('open-catalogue-modal'));
  };

  const handleSpaceSelect = (spaceName: string) => {
    // Scroll to products and filter by matching terms or apply activeCategory
    const targetCatMap: Record<string, string> = {
      'Living Room': 'Glossy',
      'Bathroom': 'Matte',
      'Kitchen': 'Glossy',
      'Outdoor': 'Matte',
      'Commercial': 'Matte',
      'Parking': 'Matte'
    };
    setActiveCategory(targetCatMap[spaceName] || 'All');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* HERO SECTION */}
      <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Slider */}
        {heroImages.map((image, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              idx === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            <div className="absolute inset-0 bg-dark-black/75 z-10" />
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center pt-40 md:pt-52">
          <span className="text-primary-gold text-xs tracking-[0.4em] uppercase mb-4 animate-fade-in font-semibold">
            Premium Ceramic & Vitrified Tiles
          </span>
          <h1 className="font-display text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Transform Spaces <br />
            <span className="text-gold-gradient">With Premium Tiles</span>
          </h1>
          <p className="text-white text-base md:text-xl font-medium tracking-wide max-w-2xl mb-10 leading-relaxed luxury-shadow-text">
            Crafted for modern homes, elite architects, and luxury commercial spaces.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <a
              href="#collections"
              className="px-8 py-3.5 bg-gold-gradient text-dark-black font-semibold text-sm uppercase tracking-widest hover:bg-gold-gradient-hover hover:scale-[1.02] transition-all duration-300 shadow-lg"
            >
              Explore Collection
            </a>
            <button
              onClick={() => triggerQuote()}
              className="px-8 py-3.5 border border-white/30 text-white font-semibold text-sm uppercase tracking-widest hover:bg-white hover:text-dark-black hover:scale-[1.02] transition-all duration-300"
            >
              Get Free Consultation
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-20 pt-8 border-t border-white/10 w-full max-w-3xl">
            <div className="text-center">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-gold">25+</h3>
              <p className="text-white text-[10px] tracking-widest uppercase mt-1 font-semibold">Years Experience</p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-gold">5000+</h3>
              <p className="text-white text-[10px] tracking-widest uppercase mt-1 font-semibold">Happy Clients</p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-gold">1000+</h3>
              <p className="text-white text-[10px] tracking-widest uppercase mt-1 font-semibold">Tile Designs</p>
            </div>
          </div>
        </div>

        {/* Floating Slide Indicators */}
        <div className="absolute right-8 bottom-12 z-20 hidden md:flex flex-col gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                idx === heroIndex ? 'w-8 bg-primary-gold' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* BRAND MARQUEE SECTION */}
      <section className="bg-charcoal/30 border-y border-white/5 py-10 overflow-hidden relative z-30">
        <div className="max-w-3xl mx-auto px-6 mb-8 text-center flex flex-col items-center justify-center gap-1.5">
          <span className="text-primary-gold text-[10px] tracking-[0.3em] uppercase font-bold">
            Authorized Partner & Elite Product Showcase
          </span>
          <span className="text-white text-xs mt-1 font-light opacity-85">
            Sourced from world-renowned architectural & ceramic brands
          </span>
        </div>
        
        <div className="relative flex overflow-x-hidden w-full">
          {/* Left fading mask overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-dark-black to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-marquee gap-8 whitespace-nowrap">
            {/* First loop of logos */}
            {BRAND_LOGOS.map((brand, i) => (
              <div
                key={`brand-loop1-${i}`}
                className="inline-flex items-center justify-center w-52 h-20 bg-[#121212] hover:bg-[#1A1A1A] border border-white/5 rounded-none px-5 py-3.5 hover:border-primary-gold/45 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
              >
                {brand.logo}
              </div>
            ))}
            {/* Second identical loop of logos for infinite scrolling seamless transition */}
            {BRAND_LOGOS.map((brand, i) => (
              <div
                key={`brand-loop2-${i}`}
                className="inline-flex items-center justify-center w-52 h-20 bg-[#121212] hover:bg-[#1A1A1A] border border-white/5 rounded-none px-5 py-3.5 hover:border-primary-gold/45 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03]"
              >
                {brand.logo}
              </div>
            ))}
          </div>

          {/* Right fading mask overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-dark-black to-transparent z-10 pointer-events-none" />
        </div>
      </section>

      {/* SPACE EXPLORER & DIVISIONS SECTION */}
      <section id="spaces" className="pt-10 pb-20 bg-dark-black max-w-7xl mx-auto px-6 md:px-12 border-b border-white/5">
        <div className="text-center mb-16">
          <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Our Offerings</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Explore Our Product Divisions</h2>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto mt-4">
            From world-class vitrified surfaces to luxury bath settings and high-security doors, we supply the finest materials for premium designs.
          </p>
        </div>

        {/* 3 Core Divisions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Division 1: Tiles */}
          <div className="group relative h-[420px] w-full overflow-hidden flex flex-col justify-end text-left border border-white/10 luxury-card">
            <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/55 to-transparent z-10 group-hover:from-dark-black/90 transition-all duration-500" />
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
              alt="Tiles Division"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute top-5 left-5 z-20">
              <span className="px-3 py-1 bg-primary-gold text-dark-black text-[9px] tracking-widest uppercase font-bold">
                Core Collection
              </span>
            </div>
            <div className="relative z-20 p-6 w-full">
              <span className="text-primary-gold text-xs tracking-widest uppercase font-semibold block mb-1">
                Premium Tiles
              </span>
              <h3 className="font-display text-xl text-white font-bold mb-2">
                Find The Perfect Tile For Every Space
              </h3>
              <p className="text-white/75 text-xs leading-relaxed mb-5 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                Discover our curated vitrified slabs, marble textures, and designer ceramic collections crafted for modern spaces and elite architectures.
              </p>
              <button
                onClick={() => {
                  window.open('/#spaces-explorer', '_blank');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-primary-gold hover:text-dark-black text-white text-[9px] font-semibold uppercase tracking-wider transition-all duration-300 border border-white/15 hover:border-primary-gold flex items-center gap-1.5 text-left"
              >
                Explore Tiles
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Division 2: Bath */}
          <div className="group relative h-[420px] w-full overflow-hidden flex flex-col justify-end text-left border border-white/10 luxury-card">
            <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/55 to-transparent z-10 group-hover:from-dark-black/90 transition-all duration-500" />
            <img
              src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80"
              alt="Bath Fittings Division"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute top-5 left-5 z-20">
              <span className="px-3 py-1 bg-white/95 text-dark-black text-[9px] tracking-widest uppercase font-bold">
                Authorized Seller
              </span>
            </div>
            <div className="relative z-20 p-6 w-full">
              <span className="text-primary-gold text-xs tracking-widest uppercase font-semibold block mb-1">
                Luxury Sanitaryware
              </span>
              <h3 className="font-display text-xl text-white font-bold mb-2">
                Authorized Seller of Jaquar Group
              </h3>
              <p className="text-white/75 text-xs leading-relaxed mb-5 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                Upgrade your spaces with luxury sanitaryware, wellness systems, designer showers, and sleek fittings from the premium Jaquar Group.
              </p>
              <button
                onClick={() => {
                  window.open('/#bath-explorer', '_blank');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-primary-gold hover:text-dark-black text-white text-[9px] font-semibold uppercase tracking-wider transition-all duration-300 border border-white/15 hover:border-primary-gold flex items-center gap-1.5 text-left"
              >
                Explore Bath
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Division 3: Doors */}
          <div className="group relative h-[420px] w-full overflow-hidden flex flex-col justify-end text-left border border-white/10 luxury-card">
            <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/55 to-transparent z-10 group-hover:from-dark-black/90 transition-all duration-500" />
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
              alt="Tata Doors Division"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute top-5 left-5 z-20">
              <span className="px-3 py-1 bg-white/95 text-dark-black text-[9px] tracking-widest uppercase font-bold">
                Official Distributor
              </span>
            </div>
            <div className="relative z-20 p-6 w-full">
              <span className="text-primary-gold text-xs tracking-widest uppercase font-semibold block mb-1">
                Tata Pravesh Doors
              </span>
              <h3 className="font-display text-xl text-white font-bold mb-2">
                Distributor in Western Maharashtra & Goa
              </h3>
              <p className="text-white/75 text-xs leading-relaxed mb-5 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                Official distributor of Tata Pravesh doors in Western Maharashtra and Goa. Experience the unyielding strength of steel combined with the elegant wooden finish.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi!%20I%27m%20interested%20in%20Tata%20Pravesh%20Doors.%20Could%20you%20please%20share%20details?"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-white/10 hover:bg-[#25D366] hover:text-white text-white text-[9px] font-semibold uppercase tracking-wider transition-all duration-300 border border-white/15 hover:border-[#25D366] text-center"
              >
                Explore Tata Doors
              </a>
            </div>
          </div>
        </div>

        {/* Space Explorer Title */}
        <div id="spaces-explorer" className="pt-10 scroll-mt-24 mb-10 text-center">
          <span className="text-primary-gold text-xs tracking-[0.25em] uppercase font-semibold">Explore by Space</span>
          <h3 className="font-display text-2xl md:text-3xl font-bold mt-2">Filter Tiles by Room Application</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
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
              <img
                src={space.url}
                alt={space.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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

        {/* Bath Explorer Section */}
        <div id="bath-explorer" className="pt-16 scroll-mt-24 mb-10 text-center border-t border-white/5 mt-16">
          <span className="text-primary-gold text-xs tracking-[0.25em] uppercase font-semibold">Jaquar Group</span>
          <h3 className="font-display text-2xl md:text-3xl font-bold mt-2">Filter Bath Fittings by Category</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: 'Faucets & Taps', url: 'https://images.unsplash.com/photo-1620626011761-996317b69763?auto=format&fit=crop&w=400&q=80' },
            { name: 'Sanitaryware', url: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=400&q=80' },
            { name: 'Wellness & Tubs', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
            { name: 'Shower Systems', url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=400&q=80' },
            { name: 'Water Heaters', url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80' },
            { name: 'Bath Accessories', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80' },
          ].map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                // Open WhatsApp inquiry for this specific category
                window.open(`https://wa.me/919876543210?text=Hi!%20I%27m%20interested%20in%20Jaquar%20Group%20Bath%20Fittings%20-%20${encodeURIComponent(cat.name)}.%20Could%20you%20please%20share%20the%20brochure%20and%20pricing?`, '_blank');
              }}
              className="group relative h-48 w-full overflow-hidden flex flex-col justify-end text-left border border-white/15"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/40 to-transparent z-10 group-hover:from-dark-black/95 transition-all duration-300" />
              <img
                src={cat.url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="relative z-20 p-4 w-full">
                <h4 className="font-display text-base text-white font-bold group-hover:text-primary-gold transition-colors duration-300">
                  {cat.name}
                </h4>
                <span className="text-[9px] text-white tracking-widest uppercase flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                  Inquire Category <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* TILE COLLECTIONS */}
      <section id="collections" className="pt-10 pb-20 bg-[#0F0F0F] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Our Collections</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Curated Collections For Stylish Spaces</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <div
                key={col.id}
                className="group relative h-96 overflow-hidden border border-white/5 flex flex-col justify-end p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/30 to-transparent z-10 group-hover:from-dark-black/90 transition-all duration-500" />
                <img
                  src={col.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="relative z-20">
                  <h3 className="font-display text-2xl font-extrabold text-primary-gold mb-2">
                    {col.name}
                  </h3>
                  <p className="text-white text-sm font-normal leading-relaxed mb-6 max-w-sm line-clamp-2">
                    {col.description || 'Premium architectural styling and finishes.'}
                  </p>
                  <a
                    href="#products"
                    onClick={() => {
                      setActiveCategory(col.name.split(' ')[0]); // Map e.g. "Marble Collection" -> "Marble" / "Glossy" etc
                    }}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/90 font-semibold border-b border-primary-gold/40 pb-1 group-hover:border-primary-gold transition-colors duration-300"
                  >
                    View Collection <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="pt-10 pb-20 bg-dark-black max-w-7xl mx-auto px-6 md:px-12 border-b border-white/5">
        <div className="text-center mb-16">
          <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Why Choose Us</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Quality You Can See, Trust You Can Feel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <Shield className="w-8 h-8 text-primary-gold" />, title: 'Premium Quality', desc: 'Crafted using high-purity raw clay materials and modern imported machinery for maximum durability.' },
            { icon: <Droplet className="w-8 h-8 text-primary-gold" />, title: 'Water Resistant', desc: 'Ultra-low water absorption of < 0.05% protects from internal moisture, dampness, and discoloration.' },
            { icon: <Flame className="w-8 h-8 text-primary-gold" />, title: 'Long Lasting', desc: 'Highly impact resistant, heat tolerant, scratch resistant, retaining glaze vibrance for decades.' },
            { icon: <Settings className="w-8 h-8 text-primary-gold" />, title: 'Easy Maintenance', desc: 'Non-porous vitrified surfaces resist stains, acids, oils and clean in seconds with simple water.' },
            { icon: <Zap className="w-8 h-8 text-primary-gold" />, title: 'Modern Designs', desc: 'Curated by designers inspired by high-end Italian marbles and architectural wood finishes.' },
            { icon: <Truck className="w-8 h-8 text-primary-gold" />, title: 'Nationwide Delivery', desc: 'Secure damage-free packaging and nationwide logistics support to construction sites directly.' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="luxury-card p-8 flex flex-col items-start"
            >
              <div className="mb-6 bg-dark-black p-4 border border-white/15 hover:rotate-[360deg] transition-transform duration-700">
                {item.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-3 tracking-wide">{item.title}</h3>
              <p className="text-neutral-200 text-sm font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI ROOM VISUALIZER PREVIEW */}
      <section className="py-24 bg-dark-black border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Info */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Visualise Your Space</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-6">See It Before You Love It</h2>
            <p className="text-white text-sm font-normal leading-relaxed mb-8">
              Wondering how the tiles will look in a grand living room or master bathroom? Try our dynamic AI room visualizer. Upload a photo of your own room and instantly preview any tile style.
            </p>
            <Link
              href="/visualizer"
              className="px-8 py-3.5 bg-gold-gradient text-dark-black font-semibold text-xs uppercase tracking-widest hover:bg-gold-gradient-hover hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
            >
              Try Visualizer Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Slider Preview */}
          <div className="lg:col-span-8">
            <div
              ref={visualizerContainerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full h-[450px] overflow-hidden select-none border border-white/10 shadow-2xl cursor-ew-resize"
            >
              {/* Before Image (Raw Room) */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
                  alt="Original Living Room"
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute bottom-4 left-4 z-20 bg-dark-black/60 px-3 py-1 text-xs uppercase tracking-wider text-white">
                  Original
                </div>
              </div>

              {/* After Image (Applied Calacatta Tile Room) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                  alt="Applied Calacatta Tile Room"
                  className="absolute left-0 top-0 w-full h-[450px] object-cover max-w-none pointer-events-none"
                  style={{ width: '100%' }}
                />
                <div className="absolute bottom-4 right-4 z-20 bg-primary-gold/90 px-3 py-1 text-xs uppercase tracking-wider text-dark-black font-bold whitespace-nowrap">
                  Applied: Calacatta White
                </div>
              </div>

              {/* Slider Handle Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary-gold z-30 cursor-ew-resize"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-gold text-dark-black border-2 border-white flex items-center justify-center shadow-lg">
                  ↔
                </div>
              </div>
            </div>
            <p className="text-white/40 text-center text-xs mt-3">Drag the central divider handle to view the transition preview</p>
          </div>
        </div>
      </section>

      {/* BEST SELLING PRODUCTS */}
      <section id="products" className="pt-10 pb-20 bg-[#0F0F0F] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Best Selling Tiles</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Our Most Loved Tiles</h2>
            </div>

            {/* Search Bar inside Grid control */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium tiles..."
                className="w-full bg-charcoal border border-white/20 py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-gold placeholder-white/50"
              />
              <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Filtering & Sorting Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 mb-8 gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Marble', 'Stone', 'Wooden', 'Glossy', 'Matte'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-primary-gold text-dark-black font-bold'
                      : 'bg-charcoal text-white hover:bg-neutral-800 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-primary-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-charcoal border border-white/20 text-xs text-white py-2 px-4 focus:outline-none focus:border-primary-gold"
              >
                <option value="popular">Popular</option>
                <option value="latest">Latest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-charcoal/30 border border-white/5">
              <p className="text-white/60">No premium tiles found matching your current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="group bg-charcoal border border-white/10 flex flex-col h-full overflow-hidden hover:border-primary-gold/45 transition-all duration-500 luxury-card"
                >
                  {/* Image wrapper */}
                  <div className="relative h-72 w-full overflow-hidden bg-dark-black">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                        className="py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5"
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
      </section>

      {/* PROJECT SHOWCASE */}
      <section id="projects" className="pt-10 pb-20 bg-[#0F0F0F] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Our Projects</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Spaces That Inspire</h2>

            {/* Project Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['All', 'Villas', 'Apartments', 'Hotels', 'Offices', 'Restaurants'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveProjectCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest transition-all duration-300 ${
                    activeProjectCategory === cat
                      ? 'border-b-2 border-primary-gold text-primary-gold font-semibold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Project Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="group relative h-80 overflow-hidden border border-white/10 flex flex-col justify-end p-6 luxury-card"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/40 to-transparent z-10 group-hover:from-dark-black/95 transition-all duration-500" />
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="relative z-20">
                  <span className="text-[10px] text-primary-gold tracking-widest uppercase font-bold">{proj.category}</span>
                  <h3 className="font-display text-xl font-bold text-white mt-1 mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-white text-xs font-normal max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {proj.description || 'Stunning architectural setup featuring premium tiles.'}
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[10px] text-white/70 font-semibold">{proj.location} | {proj.year}</span>
                    <button 
                      onClick={() => alert(`Project detail: ${proj.title}`)} 
                      className="text-xs text-primary-gold uppercase tracking-wider hover:underline font-bold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="pt-10 pb-20 bg-dark-black border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">What Clients Say</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-16">Trusted By Thousands</h2>

          {testimonials.length > 0 && (
            <div className="bg-charcoal border border-white/10 p-10 md:p-16 relative luxury-card">
              <div className="absolute top-6 left-8 text-7xl text-primary-gold/10 font-serif pointer-events-none">“</div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary-gold mb-6">
                  <img
                    src={testimonials[testimonialIndex]?.image_url}
                    alt={testimonials[testimonialIndex]?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonials[testimonialIndex]?.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary-gold text-primary-gold" />
                  ))}
                </div>
                <p className="font-medium text-white text-lg md:text-xl leading-relaxed mb-8">
                  {testimonials[testimonialIndex]?.comment}
                </p>
                <h4 className="font-display text-lg font-bold text-white">{testimonials[testimonialIndex]?.name}</h4>
                <p className="text-white/80 text-xs uppercase tracking-widest mt-1 font-semibold">
                  {testimonials[testimonialIndex]?.role}
                </p>
              </div>
            </div>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === testimonialIndex ? 'bg-primary-gold' : 'bg-white/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* DIGITAL CATALOGUE SECTION */}
      <section id="catalogues" className="py-24 bg-[#0F0F0F] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Text */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Download Catalogues</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-6">Explore Our Premium Tile Collections</h2>
            <p className="text-white/70 font-light leading-relaxed mb-8">
              Review full specifications, high-resolution textures, applications, and design guidelines offline. Download our digital design brochures, curated for architects, builders, and modern homes.
            </p>
            <button
              onClick={triggerCatalogue}
              className="px-8 py-3.5 bg-gold-gradient text-dark-black font-semibold text-xs uppercase tracking-widest hover:bg-gold-gradient-hover hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
            >
              Download Catalogue <FileText className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Catalogue Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative group w-80 h-[420px] bg-charcoal border border-white/15 shadow-2xl flex items-center justify-center p-8 transition-transform duration-700 hover:rotate-2 hover:scale-105 luxury-card">
              <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-dark-black/95 to-transparent z-20 border-r border-white/15" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-black/95 to-transparent z-10" />
              
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
                alt="Catalogue Booklet Cover"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />

              <div className="relative z-20 text-center flex flex-col items-center">
                <span className="text-primary-gold text-[10px] tracking-[0.4em] uppercase mb-4 font-bold">Edition 2026</span>
                <h3 className="font-display text-3xl font-extrabold text-white leading-tight mb-2">
                  GRANDEUR <br />
                  <span className="text-primary-gold">SLABS</span>
                </h3>
                <p className="text-white/70 text-xs tracking-wider uppercase mt-4 border-t border-white/15 pt-4 w-28 font-bold">
                  Ceramica Luxury
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gold-gradient py-20 text-dark-black text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-dark-black/60 mb-3">Get in Touch</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready To Transform <br />Your Space?
          </h2>
          <p className="text-dark-black/75 text-sm md:text-base font-medium max-w-lg mb-10 leading-relaxed">
            Our design experts are here to help you select, calculate and layout the perfect premium tiles for your dream project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            <button
              onClick={() => triggerQuote()}
              className="px-8 py-3.5 bg-dark-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-charcoal transition-all duration-300 shadow-xl"
            >
              Request Quote
            </button>
            <a
              href="tel:+919876543210"
              className="px-8 py-3.5 border border-dark-black/20 text-dark-black hover:bg-dark-black hover:text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300"
            >
              Contact Expert
            </a>
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-charcoal border border-primary-gold/25 shadow-2xl p-6 md:p-10 rounded-none grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Image */}
            <div className="relative h-80 md:h-[400px] w-full bg-dark-black overflow-hidden border border-white/5">
              <img
                src={quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Info */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-white/80 tracking-widest uppercase font-bold">{quickViewProduct.sku}</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-gold-gradient mt-1 mb-4">
                  {quickViewProduct.name}
                </h3>
                <p className="text-white text-sm font-normal leading-relaxed mb-6">
                  {quickViewProduct.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between border-b border-white/15 pb-2 text-xs">
                    <span className="text-white/60 uppercase tracking-wider">Available Size</span>
                    <span className="font-bold">{quickViewProduct.size}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/15 pb-2 text-xs">
                    <span className="text-white/60 uppercase tracking-wider">Surface Finish</span>
                    <span className="font-bold">{quickViewProduct.finish}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/15 pb-2 text-xs">
                    <span className="text-white/60 uppercase tracking-wider">Water Absorption</span>
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

// Simple X icon replacement since we need it in quick-view
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
