'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Check, Compass, MessageSquare, Phone, ChevronRight,
  ShieldAlert, RefreshCw, LayoutGrid, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { dbService, Product } from '@/lib/supabase';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [view360, setView360] = useState(false);
  const [rotation, setRotation] = useState({ x: 15, y: -15 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Quote Form inside page
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState('');
  const [msg, setMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      const prodId = id as string;
      const data = await dbService.getProductById(prodId);
      if (data) {
        setProduct(data);
        const allProds = await dbService.getProducts();
        // Get products in same category/collection
        const filtered = allProds.filter(
          p => p.id !== data.id && (p.category_id === data.category_id || p.collection_id === data.collection_id)
        );
        setRelatedProducts(filtered.slice(0, 3));
      }
    };
    fetchProductData();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-black flex flex-col items-center justify-center pt-24">
        <Compass className="w-12 h-12 text-primary-gold animate-spin mb-4" />
        <p className="text-white/60">Loading luxury details...</p>
      </div>
    );
  }

  // 360 dragging calculations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!view360) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !view360) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!view360 || !e.touches[0]) return;
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !view360 || !e.touches[0]) return;
    const deltaX = e.touches[0].clientX - dragStart.current.x;
    const deltaY = e.touches[0].clientY - dragStart.current.y;
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setLoading(true);
    try {
      await dbService.insertLead({
        type: 'quote',
        name,
        phone,
        email,
        message: `Detail Page Inquiry. Product: ${product.name} (SKU: ${product.sku}). Quantity Required: ${quantity} sq.ft. Message: ${msg}`,
        extra_data: { product_id: product.id, quantity },
        status: 'new'
      });
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setQuantity('');
      setMsg('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerQuote = () => {
    window.dispatchEvent(new CustomEvent('open-quote-modal', { detail: product }));
  };

  return (
    <div className="bg-dark-black text-white pt-28 pb-20">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 flex items-center justify-between text-xs text-white/50">
        <Link href="/#products" className="flex items-center gap-2 hover:text-primary-gold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <div className="flex items-center gap-2">
          <span>Home</span> <ChevronRight className="w-3 h-3" />
          <span>Products</span> <ChevronRight className="w-3 h-3" />
          <span className="text-primary-gold font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Side: Dynamic Gallery & 360 View */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div 
            className="relative h-[480px] w-full bg-charcoal border border-white/5 overflow-hidden flex items-center justify-center select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {view360 ? (
              // 360 slab render with perspective
              <div 
                className="w-80 h-80 transition-transform duration-75 relative"
                style={{
                  perspective: '1000px',
                }}
              >
                <div
                  className="w-full h-full bg-dark-black border border-white/10 shadow-2xl relative transition-transform duration-75 cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: 'preserve-3d',
                    backgroundImage: `url(${product.images[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)'
                  }}
                >
                  {/* Slab Sides for 3D thickness */}
                  <div className="absolute top-0 left-0 w-full h-[8px] bg-neutral-600 origin-top" style={{ transform: 'rotateX(-90deg) translateZ(0px)', transformStyle: 'preserve-3d' }} />
                  <div className="absolute bottom-0 left-0 w-full h-[8px] bg-neutral-800 origin-bottom" style={{ transform: 'rotateX(90deg) translateZ(-8px)', transformStyle: 'preserve-3d' }} />
                  <div className="absolute top-0 right-0 h-full w-[8px] bg-neutral-700 origin-right" style={{ transform: 'rotateY(90deg) translateZ(0px)', transformStyle: 'preserve-3d' }} />
                  <div className="absolute top-0 left-0 h-full w-[8px] bg-neutral-500 origin-left" style={{ transform: 'rotateY(-90deg) translateZ(0px)', transformStyle: 'preserve-3d' }} />
                </div>
              </div>
            ) : (
              // Standard high res image view
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* View Mode Toggle Controls */}
            <div className="absolute bottom-6 right-6 z-20 flex gap-3">
              <button
                onClick={() => setView360(false)}
                className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                  !view360
                    ? 'bg-primary-gold text-dark-black border-primary-gold font-semibold'
                    : 'bg-dark-black/70 text-white border-white/10 hover:bg-dark-black'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setView360(true)}
                className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors flex items-center gap-1.5 ${
                  view360
                    ? 'bg-primary-gold text-dark-black border-primary-gold font-semibold'
                    : 'bg-dark-black/70 text-white border-white/10 hover:bg-dark-black'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" /> 3D View
              </button>
            </div>

            {view360 && (
              <div className="absolute top-6 left-6 z-20 bg-dark-black/60 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white border border-white/5">
                Drag to rotate slab
              </div>
            )}
          </div>

          {/* Thumbnail list (Only active in Gallery mode) */}
          {!view360 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 bg-charcoal border overflow-hidden transition-all ${
                    idx === activeImage ? 'border-primary-gold' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Information */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-primary-gold text-xs tracking-[0.35em] uppercase font-semibold">{product.finish} Finish</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-3 text-gold-gradient">{product.name}</h1>
            <p className="text-white/40 text-xs tracking-wider uppercase mb-6">SKU: {product.sku}</p>

            <div className="text-2xl font-bold text-primary-gold mb-6">
              ₹{product.price.toLocaleString('en-IN')} <span className="text-white/60 text-xs font-light">/ sq.ft</span>
            </div>

            <p className="text-white/70 text-sm font-light leading-relaxed mb-8">
              {product.description || 'Premium luxury vitrified floor slab tiles, ideal for elite architectures.'}
            </p>

            {/* Attributes */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-3 py-2 border-b border-white/5 text-xs">
                <span className="text-white/45 uppercase tracking-wider">Available Sizes</span>
                <span className="col-span-2 font-semibold text-right">{product.size}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-white/5 text-xs">
                <span className="text-white/45 uppercase tracking-wider">Available Finishes</span>
                <span className="col-span-2 font-semibold text-right">{product.finish}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-white/5 text-xs">
                <span className="text-white/45 uppercase tracking-wider">Applications</span>
                <span className="col-span-2 font-semibold text-right">Living Room, Bathroom, Lobby, Floor & Wall Slabs</span>
              </div>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
            <button
              onClick={triggerQuote}
              className="flex-1 py-4 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs hover:bg-gold-gradient-hover hover:scale-[1.01] transition-all duration-300"
            >
              Get Custom Quote
            </button>
            <a
              href={`https://wa.me/919876543210?text=Hi!%20I%27m%20inquiring%20about%20the%20${product.name}%20(${product.sku})%20on%20your%20website.%20Can%20you%20please%20send%20more%20details?`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 border border-[#25D366] text-[#25D366] font-semibold uppercase tracking-wider text-xs hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Inquiry
            </a>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-24">
        <div className="border border-white/5 bg-[#0F0F0F] p-8 md:p-12">
          <h3 className="font-display text-2xl font-bold mb-6 text-gold-gradient">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Water Absorption</span>
                <span className="font-medium">{product.tech_specs?.water_absorption || '< 0.05%'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Scratch Hardness (Mohs Scale)</span>
                <span className="font-medium">{product.tech_specs?.hardness || '6 Mohs'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Thickness</span>
                <span className="font-medium">{product.tech_specs?.thickness || '9.5 mm'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Modulus of Rupture</span>
                <span className="font-medium">≥ 38 N/mm²</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Abrasion Resistance</span>
                <span className="font-medium">PEI Class IV (High Traffic)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Stain Resistance</span>
                <span className="font-medium text-green-400">Class 5 Resistant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IN-PAGE LEADS CAPTURE FORM */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 border border-white/5">
          {/* visual callout */}
          <div className="bg-charcoal p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/5 relative">
            <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${product.images[0]})` }} />
            <div className="relative z-10">
              <span className="text-primary-gold text-[10px] tracking-widest uppercase font-semibold">Special Assistance</span>
              <h3 className="font-display text-3xl font-bold mt-2 mb-4 text-white">Order Sample Slabs</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed mb-6">
                Are you an architect or interior designer planning a residential or commercial workspace? Request layout sample packages or arrange physical tile site presentations.
              </p>
              <ul className="space-y-3 text-xs text-white/80">
                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-primary-gold" /> Free consultation with luxury catalog</li>
                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-primary-gold" /> Physical shade-card presentation options</li>
                <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-primary-gold" /> Custom sizing slab layouts</li>
              </ul>
            </div>
          </div>

          {/* form */}
          <div className="bg-[#0F0F0F] p-12">
            {submitted ? (
              <div className="text-center py-10 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-primary-gold mb-4 animate-pulse" />
                <h4 className="font-display text-2xl text-gold-gradient mb-2">Request Received</h4>
                <p className="text-white/60 text-sm max-w-sm">
                  We have received your sample layout inquiry. One of our design coordinators will call you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <h4 className="font-display text-2xl font-bold text-white mb-6">Request Project Quote</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full bg-charcoal border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-charcoal border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. design@studio.com"
                      className="w-full bg-charcoal border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Est. Quantity (Sq. Ft)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-charcoal border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Specify project site, customization required, shipping coordinates..."
                    className="w-full bg-charcoal border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary-gold resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs hover:bg-gold-gradient-hover transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Submitting Estimate...' : 'Send Inquiry Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 mt-24 border-t border-white/5 pt-20">
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-10 text-white">Related Premium Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map((prod) => (
              <div
                key={prod.id}
                className="group bg-charcoal border border-white/5 hover:border-primary-gold/20 transition-all duration-300 flex flex-col h-full overflow-hidden"
              >
                <div className="relative h-60 w-full overflow-hidden bg-dark-black">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-dark-black/75 px-2 py-0.5 text-[9px] uppercase tracking-widest text-primary-gold border border-primary-gold/20">
                    {prod.finish}
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[9px] text-white/40 tracking-widest uppercase">{prod.sku}</span>
                    <h4 className="font-display text-base font-bold text-white mt-1 hover:text-primary-gold transition-colors duration-300">
                      <Link href={`/products/${prod.id}`}>{prod.name}</Link>
                    </h4>
                    <p className="text-primary-gold text-xs font-semibold mt-2">
                      ₹{prod.price.toLocaleString('en-IN')} / sq.ft
                    </p>
                  </div>
                  <Link
                    href={`/products/${prod.id}`}
                    className="mt-4 py-2 border border-white/10 text-white text-center text-xs uppercase tracking-widest hover:bg-white hover:text-dark-black transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
