'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, ArrowRight, CheckCircle, FileText } from 'lucide-react';
import { dbService } from '@/lib/supabase';
import { leadSchema } from '@/lib/validations/lead';

export default function LeadActions() {
  const pathname = usePathname();
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setLoading(false);
    setValidationErrors({});
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    const result = leadSchema.safeParse({ name, email, phone, message });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) errs[issue.path[0].toString()] = issue.message;
      });
      setValidationErrors(errs);
      return;
    }

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
    setValidationErrors({});
    
    const result = leadSchema.safeParse({ name, email, phone });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) errs[issue.path[0].toString()] = issue.message;
      });
      setValidationErrors(errs);
      return;
    }

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
      
      // Fetch latest catalogue and trigger download
      try {
        const cats = await dbService.getCatalogues();
        if (cats && cats.length > 0) {
          const latest = cats[0];
          setTimeout(() => {
            setCatalogueOpen(false);
            window.open(latest.pdf_url, '_blank');
          }, 1500);
        } else {
          setTimeout(() => {
            setCatalogueOpen(false);
            alert('Brochure is currently being updated. We will email it to you shortly!');
          }, 1500);
        }
      } catch (err) {
        console.error('Failed to fetch catalogue', err);
        setCatalogueOpen(false);
      }
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
        {/* WhatsApp Chat */}
        <a
          href="https://wa.me/917058536371?text=Hi!%20I%27m%20interested%20in%20Sangli%20Ceramica%20Premium%20Tiles.%20Could%20you%20please%20share%20the%20latest%20pricing%20and%20catalogue?"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 relative group"
          aria-label="WhatsApp Inquiry"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.039 2.875 1.184 3.074.145.198 2.037 3.111 4.933 4.364.688.298 1.225.476 1.643.608.692.219 1.322.188 1.82.113.553-.082 1.758-.718 2.006-1.411.248-.693.248-1.288.173-1.411-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.56 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
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
                  Thank you for choosing Sangli Ceramica. Our luxury consultants will contact you within 24 hours.
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
                      className={`w-full bg-dark-black border px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ${validationErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary-gold focus:ring-primary-gold'}`}
                    />
                    {validationErrors.name && <p className="text-red-500 text-[10px] mt-1">{validationErrors.name}</p>}
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
                      className={`w-full bg-dark-black border px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ${validationErrors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary-gold focus:ring-primary-gold'}`}
                    />
                    {validationErrors.phone && <p className="text-red-500 text-[10px] mt-1">{validationErrors.phone}</p>}
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
                      className={`w-full bg-dark-black border px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ${validationErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary-gold focus:ring-primary-gold'}`}
                    />
                    {validationErrors.email && <p className="text-red-500 text-[10px] mt-1">{validationErrors.email}</p>}
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
                      className={`w-full bg-dark-black border px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 resize-none ${validationErrors.message ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary-gold focus:ring-primary-gold'}`}
                    ></textarea>
                    {validationErrors.message && <p className="text-red-500 text-[10px] mt-1">{validationErrors.message}</p>}
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
                      className={`w-full bg-dark-black border px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ${validationErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary-gold focus:ring-primary-gold'}`}
                    />
                    {validationErrors.name && <p className="text-red-500 text-[10px] mt-1">{validationErrors.name}</p>}
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
                      className={`w-full bg-dark-black border px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ${validationErrors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary-gold focus:ring-primary-gold'}`}
                    />
                    {validationErrors.phone && <p className="text-red-500 text-[10px] mt-1">{validationErrors.phone}</p>}
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
                      className={`w-full bg-dark-black border px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ${validationErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary-gold focus:ring-primary-gold'}`}
                    />
                    {validationErrors.email && <p className="text-red-500 text-[10px] mt-1">{validationErrors.email}</p>}
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
