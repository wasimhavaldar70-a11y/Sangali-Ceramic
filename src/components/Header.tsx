'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ArrowRight, Compass, ChevronDown } from 'lucide-react';
import { dbService, DivisionCategory } from '@/lib/db';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
  const [divisionCategories, setDivisionCategories] = useState<DivisionCategory[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await dbService.getDivisionCategories();
        setDivisionCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer to detect scroll sections on the homepage
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['hero', 'projects', 'catalogues'];
    const activeObservers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: '-30% 0px -40% 0px', // detects when section is in active center view
          threshold: 0.15,
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      activeObservers.forEach((item) => {
        if (item) {
          item.observer.unobserve(item.el);
        }
      });
    };
  }, [pathname]);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', path: '/' },

    { name: 'Products', path: '/products' },
    { name: 'Visualizer', path: '/visualizer' },
    { name: 'Projects', path: '/#projects' },
    { name: 'Catalogues', path: '/#catalogues' },
    { name: 'Dealer Network', path: '/dealer-network' },
  ];

  const triggerQuoteModal = () => {
    // Dispatch custom event to trigger the quote modal inside LeadActions
    window.dispatchEvent(new CustomEvent('open-quote-modal'));
  };

  // Check active state dynamically
  const checkIsActive = (path: string) => {
    if (pathname === '/') {
      if (path === '/') return activeSection === 'hero';
      if (path.startsWith('/#')) {
        const hash = path.substring(2);
        return activeSection === hash;
      }
      return false;
    }
    // Sub-pages check
    return pathname === path;
  };

  // Smooth scroll handler for anchor links
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const targetId = path.substring(2);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        // Update URL hash without reload
        window.history.pushState(null, '', path);
      }
    }
  };

  const tilesCats = divisionCategories.filter(cat => cat.page_slug === 'tiles');
  const bathCats = divisionCategories.filter(cat => cat.page_slug === 'bath-fittings');
  const doorsCats = divisionCategories.filter(cat => cat.page_slug === 'doors');

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-panel py-3 shadow-lg backdrop-blur-md bg-dark-black/90'
            : 'bg-transparent py-4 border-b border-white/15'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Compass className="w-8 h-8 text-primary-gold group-hover:rotate-45 transition-transform duration-500" />
            <div className="flex flex-col">
              <span className="font-display text-lg md:text-xl font-bold tracking-widest text-gold-gradient">
                SANGLI CERAMICA
              </span>
              <span className="text-[9px] tracking-[0.3em] text-white/90 -mt-1">
                PREMIUM TILES
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.path);
              if (link.name === 'Products') {
                return (
                  <div key={link.name} className="relative group py-2">
                    <Link
                      href={link.path}
                      className={`text-xs tracking-widest uppercase transition-all duration-300 relative py-1 flex items-center gap-1 ${
                        isActive
                          ? 'text-primary-gold font-bold'
                          : 'text-neutral-100 hover:text-white'
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="w-3.5 h-3.5 transform group-hover:rotate-180 transition-transform duration-300" />
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-[calc(100%-14px)] h-[1px] bg-primary-gold" />
                      )}
                    </Link>

                    {/* Mega Menu Dropdown */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[680px] hidden group-hover:block transition-all duration-300 z-50">
                      <div className="bg-charcoal/95 border border-white/10 p-6 shadow-2xl backdrop-blur-md rounded-xl grid grid-cols-3 gap-6 text-left">
                        {/* Tiles Column */}
                        <div className="space-y-4">
                          <div className="border-b border-white/10 pb-2">
                            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary-gold block">
                              Premium Tiles
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {tilesCats.length === 0 ? (
                              <li className="text-[11px] text-white/40">Loading...</li>
                            ) : (
                              tilesCats.map(cat => (
                                <li key={cat.id}>
                                  <Link href={`/category/${cat.id}`} className="text-[11px] text-white/70 hover:text-primary-gold transition-colors block py-0.5">
                                    {cat.name}
                                  </Link>
                                </li>
                              ))
                            )}
                          </ul>
                          <Link href="/tiles" className="text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-widest font-semibold inline-flex items-center gap-1 mt-2">
                            View All Tiles <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Bath Column */}
                        <div className="space-y-4">
                          <div className="border-b border-white/10 pb-2">
                            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary-gold block">
                              Bathroom Products
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {bathCats.length === 0 ? (
                              <li className="text-[11px] text-white/40">Loading...</li>
                            ) : (
                              bathCats.map(cat => (
                                <li key={cat.id}>
                                  <Link href={`/category/${cat.id}`} className="text-[11px] text-white/70 hover:text-primary-gold transition-colors block py-0.5">
                                    {cat.name}
                                  </Link>
                                </li>
                              ))
                            )}
                          </ul>
                          <Link href="/bath-fittings" className="text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-widest font-semibold inline-flex items-center gap-1 mt-2">
                            View All Bath <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Doors Column */}
                        <div className="space-y-4">
                          <div className="border-b border-white/10 pb-2">
                            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary-gold block">
                              Tata Pravesh Doors
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {doorsCats.length === 0 ? (
                              <li className="text-[11px] text-white/40">Loading...</li>
                            ) : (
                              doorsCats.map(cat => (
                                <li key={cat.id}>
                                  <Link href={`/category/${cat.id}`} className="text-[11px] text-white/70 hover:text-primary-gold transition-colors block py-0.5">
                                    {cat.name}
                                  </Link>
                                </li>
                              ))
                            )}
                          </ul>
                          <Link href="/doors" className="text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-widest font-semibold inline-flex items-center gap-1 mt-2">
                            View All Doors <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal links
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={(e) => handleNavLinkClick(e, link.path)}
                  className={`text-xs tracking-widest uppercase transition-all duration-300 relative py-1 ${
                    isActive
                      ? 'text-primary-gold font-bold'
                      : 'text-neutral-100 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-6">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-white hover:text-primary-gold transition-colors p-2"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Get Quote CTA */}
            <button
              onClick={triggerQuoteModal}
              className="px-6 py-2.5 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider rounded-none hover:bg-gold-gradient-hover transition-all duration-300 shadow-md flex items-center gap-2 hover:scale-[1.02]"
            >
              Get Quote
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Actions / Toggle */}
          <div className="flex items-center gap-4 xl:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-white hover:text-primary-gold p-2 md:hidden"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-primary-gold p-2"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-dark-black/95 flex items-center justify-center p-6 backdrop-blur-md transition-all duration-300">
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute top-8 right-8 text-white/60 hover:text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-2xl text-center">
            <h2 className="font-display text-2xl md:text-3xl text-gold-gradient mb-6">
              Search Collections & Products
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                // Trigger scroll to products filter
                const productsEl = document.getElementById('products');
                if (productsEl) {
                  productsEl.scrollIntoView({ behavior: 'smooth' });
                  // Set window custom query search event
                  window.dispatchEvent(
                    new CustomEvent('product-search', { detail: searchQuery })
                  );
                }
              }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Calacatta White, Matte Wood, Stone..."
                className="w-full bg-charcoal border-b-2 border-white/10 py-4 px-6 text-xl text-white placeholder-white/30 focus:outline-none focus:border-primary-gold transition-colors pr-12 text-center"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-gold"
              >
                <Search className="w-6 h-6" />
              </button>
            </form>
            <p className="text-white/40 text-xs mt-4">Press Enter to search best-sellers grid</p>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Navigation */}
      <div
        className={`fixed inset-0 z-40 bg-dark-black/98 transition-transform duration-500 xl:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col justify-between p-8 pt-28`}
      >
        <div className="flex flex-col gap-6">
          {navLinks.map((link) => {
            const isActive = checkIsActive(link.path);
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavLinkClick(e, link.path);
                }}
                className={`font-display text-2xl tracking-widest transition-colors py-2 border-b border-white/15 ${
                  isActive
                    ? 'text-primary-gold font-bold'
                    : 'text-white hover:text-primary-gold'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              triggerQuoteModal();
            }}
            className="w-full py-4 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-center flex justify-center items-center gap-2"
          >
            Get Quote
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-center text-white/70 tracking-widest">
            © 2026 Sangli Ceramica Tiles. Luxury Vitrified Collection.
          </p>
        </div>
      </div>
    </>
  );
}
