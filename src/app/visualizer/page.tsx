'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Upload, RefreshCw, Layers, ZoomIn, Compass,
  Sliders, Download, Check, Save, Share2, HelpCircle, LayoutGrid
} from 'lucide-react';
import { dbService, Product } from '@/lib/supabase';

// Preset room definitions
const PRESET_ROOMS = [
  {
    id: 'living',
    name: 'Luxury Living Room',
    defaultUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    // Mock tile-applied versions for realistic preset rendering
    appliedUrls: {
      'prod-calacatta': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'prod-royal-beige': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'prod-carrara': 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80',
      'prod-stone-grigio': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    } as Record<string, string>
  },
  {
    id: 'bathroom',
    name: 'Master Bathroom',
    defaultUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    appliedUrls: {
      'prod-calacatta': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
      'prod-sahara': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
    } as Record<string, string>
  },
  {
    id: 'kitchen',
    name: 'Chef Kitchen',
    defaultUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    appliedUrls: {
      'prod-wooden-plank': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80'
    } as Record<string, string>
  }
];

export default function VisualizerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTile, setSelectedTile] = useState<Product | null>(null);
  
  // Room states
  const [activeRoomId, setActiveRoomId] = useState('living');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Overlay customizations
  const [tileScale, setTileScale] = useState(1); // Sizing factor
  const [tileAngle, setTileAngle] = useState(0); // Rotations (0, 45)
  const [sliderPos, setSliderPos] = useState(50); // Split slider percentage

  // UI state
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSaving, setIsSaving] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Load products
  useEffect(() => {
    const fetchTiles = async () => {
      const prods = await dbService.getProducts();
      setProducts(prods);
      // Select Calacatta White as default
      const defaultTile = prods.find(p => p.id === 'prod-calacatta') || prods[0];
      if (defaultTile) setSelectedTile(defaultTile);
    };
    fetchTiles();
  }, []);

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          setActiveRoomId('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Compare split slider dragging
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
  };

  // Get active image backgrounds
  const activeRoom = PRESET_ROOMS.find(r => r.id === activeRoomId);

  // Get matching pre-rendered room with applied tile if available, else fallback
  const getAppliedRoomImage = () => {
    if (activeRoomId === 'upload') return uploadedImage || '';
    if (!activeRoom || !selectedTile) return '';
    
    // Look up pre-rendered composite
    const compositeUrl = activeRoom.appliedUrls[selectedTile.id];
    if (compositeUrl) return compositeUrl;
    
    // If no direct pre-render, fallback to the base room image (we will use the CSS overlay flat perspective renderer as details overlay)
    return activeRoom.defaultUrl;
  };

  // Check if we need to apply the CSS overlay flat mapping (for uploaded rooms, or presets that don't have composite renders)
  const isUsingCssOverlayMapping = () => {
    if (activeRoomId === 'upload') return true;
    if (!activeRoom || !selectedTile) return false;
    return !activeRoom.appliedUrls[selectedTile.id];
  };

  // Handle Save Design
  const handleSaveDesign = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Dispatch custom event to trigger Quote Modal pre-filled with design details
      window.dispatchEvent(
        new CustomEvent('open-quote-modal', {
          detail: {
            id: selectedTile?.id || 'visualizer',
            name: `Visualizer Design (${selectedTile?.name || 'Custom Tile'})`,
            sku: `ROOM-${activeRoomId.toUpperCase()}-${selectedTile?.sku || 'TILE'}`,
          }
        })
      );
    }, 1000);
  };

  // Handle Download Mockup
  const handleDownload = () => {
    alert('Preparing rendering engine... High-resolution screenshot download started! (Visualizer Mock)');
  };

  // Categories list
  const filteredTiles = products.filter(
    tile => activeCategory === 'All' || tile.finish === activeCategory || tile.name.includes(activeCategory)
  );

  return (
    <div className="bg-dark-black text-white pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 flex items-center justify-between">
        <Link href="/#products" className="flex items-center gap-2 text-xs text-white/50 hover:text-primary-gold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit Visualizer
        </Link>
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary-gold animate-spin" />
          <span className="text-sm tracking-widest font-display text-gold-gradient font-bold uppercase">AI Room Visualizer</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Interactive Studio Screen */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full h-[520px] overflow-hidden select-none border border-white/10 bg-neutral-900 shadow-2xl cursor-ew-resize"
          >
            {/* Base "Before" State */}
            <div className="absolute inset-0">
              {activeRoomId === 'upload' ? (
                uploadedImage && (
                  <Image
                    src={uploadedImage}
                    alt="Before"
                    fill className="w-full h-full object-cover pointer-events-none"
                  />
                )
              ) : (
                activeRoom?.defaultUrl && (
                  <Image
                    src={activeRoom.defaultUrl}
                    alt="Before"
                    fill className="w-full h-full object-cover pointer-events-none"
                  />
                )
              )}
              <div className="absolute bottom-4 left-4 z-20 bg-dark-black/70 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white border border-white/5">
                Original Room
              </div>
            </div>

            {/* "After" State (Applied Tile) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="absolute inset-0 w-[840px] md:w-[1280px] h-[520px] pointer-events-none">
                {/* Background Room */}
                {getAppliedRoomImage() && (
                  <Image
                    src={getAppliedRoomImage()}
                    alt="Applied Tile Room"
                    fill className="w-full h-full object-cover"
                  />
                )}

                {/* CSS Floor Perspective Grid Overlay: Applied when no static composite image exists */}
                {isUsingCssOverlayMapping() && selectedTile && (
                  <div 
                    className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden opacity-85"
                    style={{
                      perspective: '400px',
                      perspectiveOrigin: '50% 0%',
                    }}
                  >
                    <div 
                      className="w-[200%] h-[200%] -left-1/2 origin-top transition-all duration-300"
                      style={{
                        transform: `rotateX(75deg) rotateZ(${tileAngle}deg)`,
                        backgroundImage: selectedTile.images?.[0] ? `url(${selectedTile.images[0]})` : 'none',
                        backgroundSize: `${160 * tileScale}px ${160 * tileScale}px`,
                        backgroundRepeat: 'repeat',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 z-20 bg-primary-gold/90 px-3 py-1.5 text-[10px] uppercase tracking-wider text-dark-black font-extrabold whitespace-nowrap border border-white/10 shadow-lg">
                Applied: {selectedTile?.name || 'Loading'}
              </div>
            </div>

            {/* Split Slider handle bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-primary-gold z-30 cursor-ew-resize"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-primary-gold text-dark-black border-2 border-white flex items-center justify-center shadow-2xl">
                ↔
              </div>
            </div>
          </div>

          {/* Quick Adjustment Options & Room Changers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-charcoal border border-white/5">
            {/* Room Presets */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/50 mb-3 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-primary-gold" /> Select Room Scene
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_ROOMS.map(room => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoomId(room.id);
                      setUploadedImage(null);
                    }}
                    className={`px-3.5 py-2 text-xs uppercase tracking-wider transition-colors border ${
                      activeRoomId === room.id && !uploadedImage
                        ? 'bg-primary-gold text-dark-black border-primary-gold font-semibold'
                        : 'bg-dark-black/40 text-white/80 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {room.name.split(' ')[1] || room.name} {/* Living, Bathroom, Kitchen */}
                  </button>
                ))}
                
                {/* Upload Action */}
                <input
                  type="file"
                  ref={uploadInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider transition-colors border flex items-center gap-1.5 ${
                    activeRoomId === 'upload'
                      ? 'bg-primary-gold text-dark-black border-primary-gold font-semibold'
                      : 'bg-dark-black/40 text-white/80 border-white/5 hover:border-white/20'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Scene
                </button>
              </div>
            </div>

            {/* Custom Sizing/Angle adjustments */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/50 mb-3 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary-gold" /> Texture Adjustments
              </h4>
              <div className="flex items-center gap-6 text-xs text-white/80">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-white/40 uppercase">
                    <span>Tile Sizing</span>
                    <span>{tileScale === 0.5 ? 'Compact' : tileScale === 1.5 ? 'Grand Slabs' : 'Standard'}</span>
                  </div>
                  <div className="flex gap-2">
                    {[0.5, 1, 1.5].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setTileScale(scale)}
                        className={`flex-1 py-1 border transition-colors text-[10px] uppercase font-bold ${
                          tileScale === scale ? 'border-primary-gold text-primary-gold' : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        {scale}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-white/40 uppercase">
                    <span>Tile Angle</span>
                    <span>{tileAngle}° Angle</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 45, 90].map((angle) => (
                      <button
                        key={angle}
                        onClick={() => setTileAngle(angle)}
                        className={`flex-1 py-1 border transition-colors text-[10px] uppercase font-bold ${
                          tileAngle === angle ? 'border-primary-gold text-primary-gold' : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        {angle}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Premium Tiles Catalog Picker */}
        <div className="lg:col-span-4 bg-[#0F0F0F] border border-white/5 p-6 flex flex-col h-[650px] justify-between">
          <div>
            <span className="text-primary-gold text-[10px] tracking-widest uppercase font-semibold">Step 2: Choose Tile</span>
            <h3 className="font-display text-xl font-bold mt-1 mb-4">Select Premium Surface</h3>

            {/* Filter tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['All', 'Marble', 'Stone', 'Wooden'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest border transition-colors ${
                    activeCategory === cat
                      ? 'border-primary-gold text-primary-gold'
                      : 'border-white/5 hover:border-white/20 text-white/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tiles list */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
              {filteredTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => setSelectedTile(tile)}
                  className={`w-full p-2.5 border text-left flex gap-4 transition-all duration-300 ${
                    selectedTile?.id === tile.id
                      ? 'border-primary-gold bg-primary-gold/5'
                      : 'border-white/5 hover:border-white/10 bg-charcoal/20'
                  }`}
                >
                  <div className="w-14 h-14 bg-dark-black shrink-0 overflow-hidden border border-white/10 relative">
                    <Image src={tile.images?.[0] || 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=100&q=80'} alt={tile.name} fill className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{tile.name}</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">{tile.size} | {tile.finish}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-primary-gold">
                      <span>₹{tile.price} / sq.ft</span>
                      {selectedTile?.id === tile.id && (
                        <Check className="w-3.5 h-3.5 text-primary-gold" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <button
              onClick={handleSaveDesign}
              disabled={isSaving}
              className="w-full py-3.5 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-gold-gradient-hover hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Design & Request Quote'}
            </button>
            <button
              onClick={handleDownload}
              className="w-full py-3.5 border border-white/20 text-white font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-white hover:text-dark-black transition-colors"
            >
              <Download className="w-4 h-4" /> Download Preview Mockup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
