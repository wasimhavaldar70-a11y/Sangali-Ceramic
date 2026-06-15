'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Search, SlidersHorizontal, Eye, FileText, Star,
  Shield, Droplet, Flame, Settings, Zap, Truck, MessageSquare, Phone, MapPin, Check,
  Users, Building, Grid3X3, Bath, Clock, Award, Tag, Palette, CheckCircle2, BadgeCheck
} from 'lucide-react';
import { dbService, Product, Collection, Project, Testimonial, Catalogue, ProductDivision, BrandLogo, HeroSlide, DEFAULT_TESTIMONIALS, DEFAULT_BRANDS } from '@/lib/db';

const getBrandLogoElement = (brandName: string, logoUrl?: string) => {
  if (logoUrl) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <Image 
          src={logoUrl} 
          alt={brandName} 
          fill className="object-contain px-2 select-none filter brightness-0 invert opacity-75 hover:opacity-100 transition-all duration-300"
        />
      </div>
    );
  }

  // Fallback to stylized text if logo URL is missing
  return (
    <div className="flex items-center justify-center text-white font-serif font-black italic text-lg select-none w-full h-full">
      {brandName}
    </div>
  );
};

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.endsWith('.mov') || url.startsWith('data:video/');
};

const isGifUrl = (url?: string) => {
  if (!url) return false;
  return url.endsWith('.gif') || url.startsWith('data:image/gif') || url.startsWith('data:image/webp');
};

const AnimatedCounter = ({ value, startTrigger, duration = 2000 }: { value: string; startTrigger: boolean; duration?: number }) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/\d/g, '');

  useEffect(() => {
    if (!startTrigger) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration, startTrigger]);

  return <span>{startTrigger ? count : 0}{suffix}</span>;
};

export default function HomePage() {
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [divisions, setDivisions] = useState<ProductDivision[]>([]);
  const [brands, setBrands] = useState<BrandLogo[]>(DEFAULT_BRANDS);

  // UI Filtering/Sorting States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [activeProjectCategory, setActiveProjectCategory] = useState('All');

  // Hero Slider
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<HeroSlide[]>([
    {
      id: 'slide-1',
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=90',
      title: 'Grand Marble Luxury',
      subtitle: 'Calacatta Glazed Vitrified Slabs',
      display_order: 1
    },
    {
      id: 'slide-2',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=90',
      title: 'Warm Architectural Woods',
      subtitle: 'Natural Woodgrain Planks Collection',
      display_order: 2
    },
    {
      id: 'slide-3',
      url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1920&q=90',
      title: 'Rustic Raw Stone',
      subtitle: 'Contemporary Slate & Stone Textures',
      display_order: 3
    }
  ]);

  // AI Visualizer before/after divider position
  const [sliderPos, setSliderPos] = useState(50);
  const visualizerContainerRef = useRef<HTMLDivElement>(null);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Intersection Observer for Trust Stats
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

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
      const divs = await dbService.getDivisions();
      const brnds = await dbService.getBrands();
      const slides = await dbService.getHeroSlides();

      setProducts(prods);
      setCollections(cols);
      setProjects(projs);
      setTestimonials(tests);
      setCatalogues(cats);
      setDivisions(divs);
      setBrands(brnds);
      setHeroImages(slides);
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
      <section id="hero" className="relative h-[60vh] md:h-[55vh] min-h-[460px] w-full overflow-hidden flex items-center justify-center">
        {/* Background Slider */}
        {heroImages.map((image, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-black transition-opacity duration-[1500ms] ease-in-out ${
              idx === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            <div className="absolute inset-0 bg-dark-black/50 z-10" />
            <Image
              src={image.url}
              alt={image.title}
              fill className="w-full h-full object-cover object-center opacity-40"
            />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center pt-12 md:pt-16">
          <span className="text-primary-gold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-1.5 animate-fade-in font-semibold">
            Transforming Houses into Dream Homes
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-2.5 leading-tight">
            Transform Spaces <br />
            <span className="text-gold-gradient">With Premium Tiles</span>
          </h1>
          <p className="text-white text-xs md:text-base font-medium tracking-wide max-w-xl mb-5 leading-relaxed luxury-shadow-text opacity-90">
            Crafted for modern homes, elite architects, and luxury commercial spaces.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center items-center">
            <a
              href="#collections"
              className="px-4 py-2 bg-gold-gradient text-dark-black font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-gold-gradient-hover hover:scale-[1.02] transition-all duration-300 shadow-lg text-center"
            >
              Explore Collection
            </a>
            <button
              onClick={() => triggerQuote()}
              className="px-4 py-2 border border-white/30 text-white font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-white hover:text-dark-black hover:scale-[1.02] transition-all duration-300 text-center"
            >
              Get Free Consultation
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-5 pt-3 border-t border-white/10 w-full max-w-3xl">
            <div className="text-center">
              <h3 className="font-display text-xl md:text-2xl font-bold text-primary-gold">25+</h3>
              <p className="text-white text-[9px] tracking-widest uppercase mt-1 font-semibold opacity-85">Years Experience</p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl md:text-2xl font-bold text-primary-gold">5000+</h3>
              <p className="text-white text-[9px] tracking-widest uppercase mt-1 font-semibold opacity-85">Happy Clients</p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl md:text-2xl font-bold text-primary-gold">1000+</h3>
              <p className="text-white text-[9px] tracking-widest uppercase mt-1 font-semibold opacity-85">Tile Designs</p>
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

      {/* SPACE EXPLORER & DIVISIONS SECTION */}
      <section id="spaces" className="pt-10 pb-8 bg-dark-black max-w-7xl mx-auto px-6 md:px-12 border-b border-white/5">
        <div className="text-center mb-16">
          <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">Our Offerings</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Explore Our Product Divisions</h2>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto mt-4">
            From world-class vitrified surfaces to luxury bath settings and high-security doors, we supply the finest materials for premium designs.
          </p>
        </div>

        {/* Dynamic Divisions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-0">
          {divisions.length > 0 ? divisions.map((div) => (
            <div key={div.id} className="group relative h-[420px] w-full overflow-hidden flex flex-col justify-end text-left border border-white/10 luxury-card">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-black via-dark-black/55 to-transparent z-10 group-hover:from-dark-black/90 transition-all duration-500" />
              {isVideoUrl(div.image_url) ? (
                <video
                  src={div.image_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : isGifUrl(div.image_url) || div.image_url.startsWith('data:image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={div.image_url}
                  alt={div.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <Image
                  src={div.image_url}
                  alt={div.title}
                  fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              )}
              <div className="absolute top-5 left-5 z-20">
                <span className="px-3 py-1 bg-white/95 text-dark-black text-[9px] tracking-widest uppercase font-bold">
                  {div.badge_text}
                </span>
              </div>
              <div className="relative z-20 p-6 w-full">
                <span className="text-primary-gold text-xs tracking-widest uppercase font-semibold block mb-1">
                  {div.title}
                </span>
                <h3 className="font-display text-xl text-white font-bold mb-2">
                  {div.heading}
                </h3>
                <p className="text-white/75 text-xs leading-relaxed mb-5 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                  {div.description}
                </p>
                <Link
                  href={div.link_url}
                  className="inline-flex px-4 py-2 bg-white/10 hover:bg-primary-gold hover:text-dark-black text-white text-[9px] font-semibold uppercase tracking-wider transition-all duration-300 border border-white/15 hover:border-primary-gold items-center gap-1.5 text-left"
                >
                  {div.link_text}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-20 border border-white/5 bg-white/5">
              <p className="text-white/50 text-sm">No product divisions currently available.</p>
            </div>
          )}
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
            {brands.map((brand, i) => (
              <div
                key={`brand-loop1-${brand.id}-${i}`}
                className="inline-flex items-center justify-center w-52 h-20 bg-[#121212] hover:bg-[#1A1A1A] border border-white/5 rounded-none px-5 py-3.5 hover:border-primary-gold/45 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] relative"
              >
                {getBrandLogoElement(brand.name, brand.logo_url)}
              </div>
            ))}
            {/* Second identical loop of logos for infinite scrolling seamless transition */}
            {brands.map((brand, i) => (
              <div
                key={`brand-loop2-${brand.id}-${i}`}
                className="inline-flex items-center justify-center w-52 h-20 bg-[#121212] hover:bg-[#1A1A1A] border border-white/5 rounded-none px-5 py-3.5 hover:border-primary-gold/45 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] relative"
              >
                {getBrandLogoElement(brand.name, brand.logo_url)}
              </div>
            ))}
          </div>

          {/* Right fading mask overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-dark-black to-transparent z-10 pointer-events-none" />
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
              className="luxury-card p-8 flex flex-col items-center text-center"
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
                <Image
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
                  alt="Original Living Room"
                  fill className="w-full h-full object-cover pointer-events-none"
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
                <Image fill
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
                    <Image
                      src={prod.images[0]}
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
                <Link href={`/projects/${proj.slug}`}>
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 cursor-pointer"
                  />
                </Link>
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
                    <Link 
                      href={`/projects/${proj.slug}`}
                      className="text-xs text-primary-gold uppercase tracking-wider hover:underline font-bold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-[#FAF9F5] border-b border-neutral-100 overflow-hidden relative">
        {/* Inline styles for custom fadeUp animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}} />
        
        {/* Subtle premium background texture lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Flanking Luxury Images */}
        <div className="absolute left-0 top-0 w-44 h-80 xl:block hidden pointer-events-none overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?auto=format&fit=crop&w=300&h=600&q=80"
            alt="Luxury Interior Flank"
            width={176}
            height={320}
            className="w-full h-full object-cover opacity-95"
            priority
          />
        </div>
        <div className="absolute right-0 top-0 w-44 h-80 xl:block hidden pointer-events-none overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=300&h=600&q=80"
            alt="Luxury Bathroom Flank"
            width={176}
            height={320}
            className="w-full h-full object-cover opacity-95"
            priority
          />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center mb-20 relative z-10">
          <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-bold">What Clients Say</span>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-neutral-900 mt-2 mb-6 leading-tight">
            Trusted By Homeowners, <br className="hidden md:block" />Architects & Builders
          </h2>
          <p className="text-neutral-500 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Discover why homeowners, interior designers, architects, and builders choose Sangli Ceramica for premium tiles, sanitaryware, bath fittings, and design solutions.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          {testimonials.map((item, index) => (
            <div
              key={item.id || index}
              className="w-full md:w-[calc(50%-16px)] lg:w-[calc(33.33%-22px)] max-w-sm bg-white p-8 pt-12 rounded-xl border border-neutral-100 flex flex-col justify-between relative shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 group"
              style={{
                animation: 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Top Quote */}
              <div className="absolute top-6 right-8 text-5xl text-neutral-100 font-serif pointer-events-none transition-colors group-hover:text-primary-gold/20 select-none">”</div>
              
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-100 group-hover:border-primary-gold mb-5 relative transition-all duration-500 shadow-sm">
                  <Image
                    src={item.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-primary-gold text-primary-gold" />
                  ))}
                </div>

                {/* Review */}
                <p className="text-neutral-600 text-sm font-light leading-relaxed mb-6">
                  &ldquo;{item.comment}&rdquo;
                </p>

                {/* Divider Line */}
                <div className="w-8 h-[1px] bg-primary-gold/45 group-hover:w-16 transition-all duration-500 mb-4" />

                {/* Name & Role */}
                <h4 className="font-display text-base font-bold text-neutral-900 leading-none">{item.name}</h4>
                <p className="text-primary-gold/80 text-[10px] uppercase tracking-widest font-bold mt-2">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STATS SECTION */}
      <section ref={statsRef} className="py-16 bg-[#0B0B0B] border-y border-white/5 relative z-30 overflow-hidden">
        {/* Dark Marble Texture Background Effect */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80"
            alt="Dark Marble Texture"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
          {[
            { value: "5000+", label: "Happy Customers", icon: <Users className="w-6 h-6 text-primary-gold" /> },
            { value: "1000+", label: "Completed Projects", icon: <Building className="w-6 h-6 text-primary-gold" /> },
            { value: "200+", label: "Premium Tile Designs", icon: <Grid3X3 className="w-6 h-6 text-primary-gold" /> },
            { value: "100+", label: "Sanitaryware Solutions", icon: <Bath className="w-6 h-6 text-primary-gold" /> },
            { value: "10+", label: "Years Experience", icon: <Clock className="w-6 h-6 text-primary-gold" /> }
          ].map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center p-4 relative ${
                i < 4 ? 'lg:border-r lg:border-white/5' : ''
              }`}
            >
              <div className="mb-4 p-3 bg-white/5 rounded-full border border-white/10">{stat.icon}</div>
              <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                <AnimatedCounter value={stat.value} startTrigger={statsVisible} />
              </h3>
              <p className="text-white/40 text-xs font-light tracking-wider uppercase mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-10 bg-white border-b border-neutral-100 relative z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: "Premium Quality Products", icon: <BadgeCheck className="w-5 h-5 text-primary-gold" /> },
              { label: "Authorized Brand Partners", icon: <Award className="w-5 h-5 text-primary-gold" /> },
              { label: "Competitive Pricing", icon: <Tag className="w-5 h-5 text-primary-gold" /> },
              { label: "Expert Design Assistance", icon: <Palette className="w-5 h-5 text-primary-gold" /> },
              { label: "Reliable Delivery Service", icon: <Truck className="w-5 h-5 text-primary-gold" /> },
              { label: "Trusted Across Sangli & Nearby Cities", icon: <CheckCircle2 className="w-5 h-5 text-primary-gold" /> }
            ].map((benefit, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center p-3 relative ${
                  i < 5 ? 'lg:border-r lg:border-neutral-100' : ''
                }`}
              >
                <div className="mb-2.5">{benefit.icon}</div>
                <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-neutral-800 leading-snug">
                  {benefit.label}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIGITAL CATALOGUE SECTION */}
      <section id="catalogues" className="pt-24 pb-12 bg-[#0F0F0F] border-b border-white/5">
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
              
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
                alt="Catalogue Booklet Cover"
                fill className="absolute inset-0 w-full h-full object-cover opacity-60"
              />

              <div className="relative z-20 text-center flex flex-col items-center">
                <span className="text-primary-gold text-[10px] tracking-[0.4em] uppercase mb-4 font-bold">Edition 2026</span>
                <h3 className="font-display text-3xl font-extrabold text-white leading-tight mb-2">
                  GRANDEUR <br />
                  <span className="text-primary-gold">SLABS</span>
                </h3>
                <p className="text-white/70 text-xs tracking-wider uppercase mt-4 border-t border-white/15 pt-4 w-28 font-bold">
                  Sangli Ceramica Luxury
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="pt-10 pb-20 bg-[#0A0A0A] relative overflow-hidden z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
            
            {/* Left Content */}
            <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center items-start relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                Building Your <br />Dream Space Starts Here
              </h2>
              {/* Gold Accent Line */}
              <div className="w-12 h-[2px] bg-primary-gold mb-6" />
              <p className="text-white/60 text-sm md:text-base font-light mb-10 max-w-lg leading-relaxed">
                Explore premium tiles, sanitaryware, bath fittings, and interior solutions designed to transform every space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/dealer-network"
                  className="px-8 py-4 bg-gold-gradient text-dark-black font-bold text-xs uppercase tracking-widest hover:bg-gold-gradient-hover hover:scale-[1.02] transition-all duration-300 shadow-lg text-center"
                >
                  Visit Our Showroom
                </Link>
                <button
                  onClick={() => triggerQuote()}
                  className="px-8 py-4 border border-white/10 hover:border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all duration-300"
                >
                  Get Free Consultation
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5 relative h-80 lg:h-auto min-h-[350px] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-transparent z-10 lg:block hidden pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10 lg:hidden block pointer-events-none" />
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                alt="Luxury Showroom Concept"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            
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
              <Image
                src={quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                fill className="w-full h-full object-cover"
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
