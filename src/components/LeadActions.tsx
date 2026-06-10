'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, X, ArrowRight, CheckCircle, FileText } from 'lucide-react';
import { dbService } from '@/lib/supabase';

export default function LeadActions() {
  // Modals state
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; sku: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Listen for custom events to trigger modals from other components
    const handleOpenQuote = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSelectedProduct(customEvent.detail);
        setMessage(`Inquiry about product: ${customEvent.detail.name} (${customEvent.detail.sku})`);
      } else {
        setSelectedProduct(null);
        setMessage('');
      }
      setQuoteOpen(true);
      setSubmitted(false);
    };

    const handleOpenCatalogue = () => {
      setCatalogueOpen(true);
      setSubmitted(false);
    };

    window.addEventListener('open-quote-modal', handleOpenQuote);
    window.addEventListener('open-catalogue-modal', handleOpenCatalogue);

    return () => {
      window.removeEventListener('open-quote-modal', handleOpenQuote);
      window.removeEventListener('open-catalogue-modal', handleOpenCatalogue);
    };
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setLoading(false);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setLoading(true);
    try {
      await dbService.insertLead({
        type: 'quote',
        name,
        email,
        phone,
        message: selectedProduct 
          ? `Product: ${selectedProduct.name} (SKU: ${selectedProduct.sku}). Message: ${message}` 
          : message,
        extra_data: selectedProduct ? { product_id: selectedProduct.id } : null,
        status: 'new'
      });
      setSubmitted(true);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCatalogueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setLoading(true);
    try {
      await dbService.insertLead({
        type: 'catalogue',
        name,
        email,
        phone,
        message: 'Requested general digital catalogue brochure PDF',
        status: 'new'
      });
      setSubmitted(true);
      resetForm();
      // Simulate pdf download trigger
      setTimeout(() => {
        setCatalogueOpen(false);
        alert('Your download has started automatically! (Seed Brochure PDF)');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        {/* Call Now */}
        <a
          href="tel:+919876543210"
          className="w-14 h-14 bg-charcoal text-primary-gold hover:text-white rounded-full flex items-center justify-center shadow-2xl border border-primary-gold/20 hover:border-primary-gold transition-all duration-300 hover:scale-110 group"
          aria-label="Call Expert"
        >
          <Phone className="w-6 h-6 group-hover:animate-bounce" />
        </a>

        {/* WhatsApp Chat */}
        <a
          href="https://wa.me/919876543210?text=Hi!%20I%27m%20interested%20in%20Ceramica%20Premium%20Tiles.%20Could%20you%20please%20share%20the%20latest%20pricing%20and%20catalogue?"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 relative group"
          aria-label="WhatsApp Inquiry"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
          <MessageSquare className="w-6 h-6" />
        </a>
      </div>

      {/* Quote Modal */}
      {quoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-charcoal border border-primary-gold/20 p-8 shadow-2xl rounded-none">
            <button
              onClick={() => {
                setQuoteOpen(false);
                setSubmitted(false);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-primary-gold mx-auto mb-4 animate-bounce" />
                <h3 className="font-display text-2xl text-gold-gradient mb-2">Inquiry Submitted!</h3>
                <p className="text-white/60 text-sm mb-6">
                  Thank you for choosing Ceramica. Our luxury consultants will contact you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setQuoteOpen(false);
                    setSubmitted(false);
                  }}
                  className="px-6 py-2 bg-primary-gold text-dark-black font-semibold text-xs uppercase tracking-widest hover:bg-gold-gradient-hover"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-2xl text-gold-gradient mb-1">
                  Request Premium Quote
                </h3>
                <p className="text-white/40 text-xs mb-6">
                  {selectedProduct
                    ? `Specify your quantity for ${selectedProduct.name}`
                    : 'Get custom pricing tailored for architects and luxury homes.'}
                </p>

                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/70 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Devendra Architect"
                      className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/70 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/70 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. info@studio.com"
                      className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/70 mb-1">
                      Message / Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify size, square footage, design collection requirements..."
                      className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-gold-gradient-hover hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Request Luxury Estimate'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Catalogue Download Modal */}
      {catalogueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-charcoal border border-primary-gold/20 p-8 shadow-2xl rounded-none">
            <button
              onClick={() => {
                setCatalogueOpen(false);
                setSubmitted(false);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-primary-gold mx-auto mb-4 animate-pulse" />
                <h3 className="font-display text-2xl text-gold-gradient mb-2">Preparing File</h3>
                <p className="text-white/60 text-sm mb-6">
                  Thank you! Your high-resolution premium tiles brochure is downloading...
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-2xl text-gold-gradient mb-1">
                  Download Catalogues
                </h3>
                <p className="text-white/40 text-xs mb-6">
                  Enter your contact details to instantly download the PDF brochure.
                </p>

                <form onSubmit={handleCatalogueSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/70 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alisha Architect"
                      className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/70 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/70 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. designer@agency.com"
                      className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-gold-gradient-hover transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Download Catalogue PDF'}
                    <FileText className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
