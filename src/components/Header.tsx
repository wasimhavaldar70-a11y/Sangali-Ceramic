'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ArrowRight, Compass } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

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

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/#collections' },
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
              <span className="font-display text-xl font-bold tracking-widest text-gold-gradient">
                CERAMICA
              </span>
              <span className="text-[9px] tracking-[0.3em] text-white/90 -mt-1">
                PREMIUM TILES
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-xs tracking-widest uppercase transition-all duration-300 relative py-1 ${
                    isActive
                      ? 'text-primary-gold font-medium'
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
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl tracking-widest text-white hover:text-primary-gold transition-colors py-2 border-b border-white/15"
            >
              {link.name}
            </Link>
          ))}
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
            © 2026 Ceramica Tiles. Luxury Vitrified Collection.
          </p>
        </div>
      </div>
    </>
  );
}
