'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Compass, Send } from 'lucide-react';
import { dbService } from '@/lib/supabase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await dbService.insertLead({
        type: 'contact',
        name: 'Newsletter Subscriber',
        email,
        phone: 'N/A',
        message: 'Subscribed to newsletter from footer',
        status: 'new'
      });
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer className="bg-charcoal text-white pt-20 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        {/* Company Column */}
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <Compass className="w-8 h-8 text-primary-gold group-hover:rotate-45 transition-transform duration-500" />
            <div className="flex flex-col">
              <span className="font-display text-xl md:text-2xl font-bold tracking-widest text-gold-gradient">
                SANGLI CERAMICA
              </span>
              <span className="text-[10px] tracking-[0.3em] text-white/60 -mt-1">
                PREMIUM TILES
              </span>
            </div>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
            We bring beauty, durability, and innovation together to create premium ceramic and vitrified tiles for elite spaces, architects, and high-end residential designs.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold hover:text-dark-black flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
            </a>
            <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold hover:text-dark-black flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://linkedin.com" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold hover:text-dark-black flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://pinterest.com" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold hover:text-dark-black flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.17-.07-.97-.1-2.15.02-3.11.12-.99.76-4.99.76-4.99s-.19-.39-.19-.97c0-.91.53-1.6 1.19-1.6.56 0 .83.42.83.93 0 .56-.36 1.4-.55 2.18-.16.66.33 1.2 1.01 1.2 1.21 0 2.03-1.54 2.03-3.37 0-1.39-.94-2.39-2.61-2.39-1.9 0-3.09 1.41-3.09 3.01 0 .55.16 1.03.41 1.33.05.06.05.08.03.14-.04.17-.13.53-.15.61-.03.1-.09.12-.19.08-1.57-.65-2.3-2.39-2.3-4.33 0-3.21 2.73-7.07 8.13-7.07 4.35 0 7.23 3.15 7.23 6.54 0 4.47-2.5 7.82-6.14 7.82-1.23 0-2.4-.67-2.8-1.42 0 0-.66 2.64-.8 3.19-.24.91-.71 1.82-1.12 2.46C9.82 23.8 10.88 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>
            </a>
            <a href="https://youtube.com" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold hover:text-dark-black flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.53 12 3.53 12 3.53s-7.53 0-9.388.525A3.003 3.003 0 0 0 .502 6.163C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.47 12 20.47 12 20.47s7.53 0 9.388-.525a3.003 3.003 0 0 0 2.11-2.108C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-sm font-semibold tracking-wider uppercase text-primary-gold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link href="/" className="hover:text-primary-gold transition-colors">Home</Link></li>
            <li><Link href="/#about" className="hover:text-primary-gold transition-colors">About Us</Link></li>

            <li><Link href="/#products" className="hover:text-primary-gold transition-colors">Products</Link></li>
            <li><Link href="/visualizer" className="hover:text-primary-gold transition-colors">Visualizer</Link></li>
            <li><Link href="/#projects" className="hover:text-primary-gold transition-colors">Projects</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-display text-sm font-semibold tracking-wider uppercase text-primary-gold mb-6">Customer Support</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link href="/#faq" className="hover:text-primary-gold transition-colors">FAQ</Link></li>
            <li><Link href="/visualizer" className="hover:text-primary-gold transition-colors">Tile Calculator</Link></li>
            <li><Link href="/#installation" className="hover:text-primary-gold transition-colors">Installation Guide</Link></li>
            <li><Link href="/#care" className="hover:text-primary-gold transition-colors">Care & Maintenance</Link></li>
            <li><Link href="/#returns" className="hover:text-primary-gold transition-colors">Return Policy</Link></li>
            <li><Link href="/#privacy" className="hover:text-primary-gold transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-display text-sm font-semibold tracking-wider uppercase text-primary-gold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex gap-3 items-start">
              <Phone className="w-4 h-4 text-primary-gold shrink-0 mt-1" />
              <span><a href="tel:+917058536371" className="hover:text-primary-gold transition-colors">+91 70585 36371</a></span>
            </li>
            <li className="flex gap-3 items-start">
              <Mail className="w-4 h-4 text-primary-gold shrink-0 mt-1" />
              <span className="break-all">info@sangliceramica.com</span>
            </li>
            <li className="flex gap-3 items-start">
              <MapPin className="w-4 h-4 text-primary-gold shrink-0 mt-1" />
              <span>Sangli Ceramica Tiles Pvt. Ltd., Kolhapur Road, Sangli, MH, India</span>
            </li>
          </ul>

          {/* Newsletter inside contact column */}
          <div className="mt-8">
            <h5 className="text-xs font-semibold uppercase tracking-widest text-white/90 mb-3">Newsletter</h5>
            <form onSubmit={handleSubscribe} className="flex border border-white/10 rounded-none bg-dark-black/40">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary-gold text-dark-black px-4 py-2 hover:bg-gold-gradient-hover transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {submitted && <p className="text-[10px] text-primary-gold mt-2">Thank you for subscribing!</p>}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 gap-4">
        <span>© 2026 Sangli Ceramica Tiles Pvt. Ltd. All Rights Reserved.</span>
        <div className="flex gap-6">
          <Link href="/#sitemap" className="hover:text-primary-gold">Sitemap</Link>
          <Link href="/#terms" className="hover:text-primary-gold">Terms & Conditions</Link>
          <Link href="/admin" className="hover:text-primary-gold">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
