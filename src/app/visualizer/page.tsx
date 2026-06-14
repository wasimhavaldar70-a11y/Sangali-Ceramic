'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, Download, Check, Save, LayoutGrid, 
  RotateCw, Move, Grid3X3, Eye, Compass
} from 'lucide-react';
import { dbService, Product } from '@/lib/db';

// Preset room definitions
const PRESET_ROOMS = [
  {
    id: 'living',
    name: 'Luxury Living Room',
    defaultUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
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

const GROUT_COLORS = [
  { name: 'Charcoal', hex: '#404040' },
  { name: 'Light Gray', hex: '#D4D4D4' },
  { name: 'Warm Gold', hex: '#D4AF37' },
  { name: 'Pure White', hex: '#FFFFFF' }
];

// Helper to compute repeating tile background size dynamically based on its physical size metadata.
// Caps the primary dimension at 160px * scale and adjusts the secondary dimension proportionally.
const getTileBackgroundSize = (size: string | undefined, scale: number): string => {
  const baseSize = 160;
  if (!size) return `${baseSize * scale}px ${baseSize * scale}px`;
  
  // Match dimensions like "800x1600 mm", "200x1200 mm", etc.
  const match = size.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    if (w > 0 && h > 0) {
      if (h >= w) {
        // Vertical slab: cap height at baseSize * scale, scale width down proportionally
        const height = baseSize * scale;
        const width = (w / h) * baseSize * scale;
        return `${width}px ${height}px`;
      } else {
        // Horizontal slab: cap width at baseSize * scale, scale height down proportionally
        const width = baseSize * scale;
        const height = (h / w) * baseSize * scale;
        return `${width}px ${height}px`;
      }
    }
  }
  return `${baseSize * scale}px ${baseSize * scale}px`;
};

export default function VisualizerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTile, setSelectedTile] = useState<Product | null>(null);
  
  // Room states
  const [activeRoomId, setActiveRoomId] = useState('living');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Customization parameters
  const [surfaceType, setSurfaceType] = useState<'floor' | 'wall' | 'full'>('floor');
  const [tileScale, setTileScale] = useState(1.0); 
  const [tileAngle, setTileAngle] = useState(0); 
  const [sliderPos, setSliderPos] = useState(50); 
  
  // Grout options
  const [groutWidth, setGroutWidth] = useState(2); 
  const [groutColor, setGroutColor] = useState('#404040');

  // UI status
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSaving, setIsSaving] = useState(false);
  const [activePropertyTab, setActivePropertyTab] = useState<'surface' | 'grout'>('surface');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Load products
  useEffect(() => {
    const fetchTiles = async () => {
      const prods = await dbService.getProducts();
      setProducts(prods);
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
          setSurfaceType('full'); // Default to full screen overlay for custom uploads
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Split-slider drag movement
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

  // Reset visualizer settings
  const handleReset = () => {
    setTileScale(1.0);
    setTileAngle(0);
    setGroutWidth(2);
    setGroutColor('#404040');
    setSurfaceType('floor');
    setSliderPos(50);
  };

  const activeRoom = PRESET_ROOMS.find(r => r.id === activeRoomId);

  // Checks whether to fall back on real-time CSS overlay grid mapping
  const isUsingCssOverlayMapping = () => {
    if (activeRoomId === 'upload') return true;
    if (!activeRoom || !selectedTile) return false;
    
    // Tweak bypass: If they customize scale, angle, surface, or grout, bypass pre-render composites
    if (tileScale !== 1.0 || tileAngle !== 0 || groutWidth !== 2 || groutColor !== '#404040' || surfaceType !== 'floor') {
      return true;
    }
    return !activeRoom.appliedUrls[selectedTile.id];
  };

  // Get current active comparison image
  const getAppliedRoomImage = () => {
    if (activeRoomId === 'upload') return uploadedImage || '';
    if (!activeRoom || !selectedTile) return '';
    
    const compositeUrl = activeRoom.appliedUrls[selectedTile.id];
    // Return composite render if defaults are active and composite is available
    if (compositeUrl && !isUsingCssOverlayMapping()) return compositeUrl;
    
    return activeRoom.defaultUrl;
  };

  // Save customized layout
  const handleSaveDesign = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      window.dispatchEvent(
        new CustomEvent('open-quote-modal', {
          detail: {
            id: selectedTile?.id || 'visualizer',
            name: `Visualizer Design (${selectedTile?.name || 'Custom Tile'})`,
            sku: `ROOM-${activeRoomId.toUpperCase()}-${selectedTile?.sku || 'TILE'} (Surface: ${surfaceType.toUpperCase()}, Scale: ${tileScale}x, Grout: ${groutWidth}mm, GroutColor: ${groutColor})`,
          }
        })
      );
    }, 1000);
  };

  const handleDownload = () => {
    alert('Building rendering pipeline... Premium high-resolution mockup snapshot download started! (Visualizer Mock)');
  };

  const filteredTiles = products.filter(
    tile => activeCategory === 'All' || tile.finish === activeCategory || tile.name.toLowerCase().includes(activeCategory.toLowerCase())
  );

  return (
    <div className="bg-dark-black text-white pt-24 pb-20 min-h-screen font-sans">
      {/* Header section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/#products" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-primary-gold transition-colors mb-2 w-fit">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-gold-gradient">STUDIO VISUALIZER</h1>
            <span className="px-2 py-0.5 bg-primary-gold/15 border border-primary-gold/30 text-primary-gold text-[9px] uppercase font-bold tracking-widest rounded-full shadow-sm">AI Real-time Rendering</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset} 
            className="px-4 py-2 border border-white/10 text-white/70 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-all rounded-lg bg-white/5"
          >
            Reset Settings
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tiling Simulator Screen */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={(e) => handleSliderMove(e.clientX)}
            className="relative w-full h-[540px] overflow-hidden select-none border border-white/5 rounded-2xl bg-neutral-900 shadow-2xl cursor-ew-resize group"
          >
            {/* Before State (Left/Right overlay background) */}
            <div className="absolute inset-0">
              {activeRoomId === 'upload' ? (
                uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Before"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Upload className="w-12 h-12 text-primary-gold mb-3" />
                    <p className="text-sm text-white/60">Upload your room picture to visualize tiles</p>
                  </div>
                )
              ) : (
                activeRoom?.defaultUrl && (
                  <img
                    src={activeRoom.defaultUrl}
                    alt="Before"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                )
              )}
              <div className="absolute bottom-4 left-4 z-20 bg-dark-black/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/80 border border-white/10 rounded backdrop-blur-md">
                Original Room
              </div>
            </div>

            {/* After State (Tiled comparison overlay - Clipped dynamically by clipPath) */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
            >
              {/* Composite background or default room background */}
              {getAppliedRoomImage() && (
                <img
                  src={getAppliedRoomImage()}
                  alt="Applied Tile Room"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Real-time CSS Overlay Mapping */}
              {isUsingCssOverlayMapping() && selectedTile && selectedTile.images?.[0] && (
                <div 
                  className={`absolute left-0 w-full overflow-hidden opacity-90 transition-all duration-300 ${
                    surfaceType === 'floor' ? 'bottom-0 h-[48%]' : 'top-0 h-[65%]'
                  }`}
                  style={
                    surfaceType === 'floor' 
                      ? { perspective: '400px', perspectiveOrigin: '50% 0%' }
                      : {}
                  }
                >
                  <div 
                    className="w-[240%] h-[240%] -left-[70%] origin-top"
                    style={{
                      transform: surfaceType === 'floor' 
                        ? `rotateX(74deg) rotateZ(${tileAngle}deg) translateY(-25%)`
                        : `rotateZ(${tileAngle}deg)`,
                      backgroundImage: `linear-gradient(to right, ${groutColor} ${groutWidth}px, transparent ${groutWidth}px),
                                         linear-gradient(to bottom, ${groutColor} ${groutWidth}px, transparent ${groutWidth}px),
                                         url(${selectedTile.images[0]})`,
                      backgroundSize: getTileBackgroundSize(selectedTile.size, tileScale),
                      backgroundRepeat: 'repeat',
                      boxShadow: surfaceType === 'floor' 
                        ? 'inset 0 0 120px rgba(0,0,0,0.9)'
                        : 'inset 0 0 60px rgba(0,0,0,0.65)'
                    }}
                  />
                </div>
              )}

              <div className="absolute bottom-4 right-4 z-20 bg-primary-gold/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-dark-black border border-white/20 rounded shadow-xl whitespace-nowrap">
                Applied: {selectedTile?.name || 'Loading...'}
              </div>
            </div>

            {/* Split Slider Handle Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-primary-gold z-30 cursor-ew-resize group-hover:w-1.5 transition-all"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary-gold text-dark-black border-2 border-white/20 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                <Move className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Preset Changer & Adjustment Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-charcoal border border-white/5 rounded-2xl backdrop-blur-md shadow-xl">
            {/* Presets scene selector */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-white/50 flex items-center gap-1.5 font-bold">
                <LayoutGrid className="w-4 h-4 text-primary-gold" /> 1. Select Room Scene
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_ROOMS.map(room => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoomId(room.id);
                      setUploadedImage(null);
                    }}
                    className={`p-2 border rounded-xl flex items-center gap-3 transition-all ${
                      activeRoomId === room.id && !uploadedImage
                        ? 'border-primary-gold bg-primary-gold/10 text-primary-gold shadow-lg shadow-primary-gold/5'
                        : 'bg-dark-black/45 border-white/5 hover:border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <img src={room.defaultUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold truncate text-left">{room.name}</span>
                  </button>
                ))}
                
                {/* Upload Button */}
                <input
                  type="file"
                  ref={uploadInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  className={`p-2 border rounded-xl flex items-center gap-3 transition-all ${
                    activeRoomId === 'upload'
                      ? 'border-primary-gold bg-primary-gold/10 text-primary-gold shadow-lg shadow-primary-gold/5'
                      : 'bg-dark-black/45 border-white/5 hover:border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold truncate text-left">Upload Scene</span>
                </button>
              </div>
            </div>

            {/* Customizer Slider Panel */}
            <div className="space-y-4">
              <div className="flex border-b border-white/5 pb-2">
                <button 
                  onClick={() => setActivePropertyTab('surface')}
                  className={`flex-1 text-center py-1 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all ${
                    activePropertyTab === 'surface' ? 'border-primary-gold text-primary-gold' : 'border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  Surface mapping
                </button>
                <button 
                  onClick={() => setActivePropertyTab('grout')}
                  className={`flex-1 text-center py-1 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all ${
                    activePropertyTab === 'grout' ? 'border-primary-gold text-primary-gold' : 'border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  Grout settings
                </button>
              </div>

              {activePropertyTab === 'surface' ? (
                <div className="space-y-3.5">
                  {/* Surface Type Toggle */}
                  <div className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Apply Tile To:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSurfaceType('floor')}
                        className={`px-3 py-1 rounded text-[9px] uppercase font-bold tracking-widest transition-colors ${
                          surfaceType === 'floor' ? 'bg-primary-gold text-dark-black' : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        Floor
                      </button>
                      <button
                        onClick={() => setSurfaceType('wall')}
                        className={`px-3 py-1 rounded text-[9px] uppercase font-bold tracking-widest transition-colors ${
                          surfaceType === 'wall' ? 'bg-primary-gold text-dark-black' : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        Walls
                      </button>
                      <button
                        onClick={() => setSurfaceType('full')}
                        className={`px-3 py-1 rounded text-[9px] uppercase font-bold tracking-widest transition-colors ${
                          surfaceType === 'full' ? 'bg-primary-gold text-dark-black' : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        Full
                      </button>
                    </div>
                  </div>

                  {/* Tile Sizing slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Grid3X3 className="w-3.5 h-3.5" /> Sizing Scale</span>
                      <span className="text-white/80 font-mono">{tileScale.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.4" 
                      max="2.5" 
                      step="0.1"
                      value={tileScale}
                      onChange={e => setTileScale(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-primary-gold focus:outline-none"
                    />
                  </div>

                  {/* Tile Angle slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5" /> Rotation Angle</span>
                      <span className="text-white/80 font-mono">{tileAngle}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      step="1"
                      value={tileAngle}
                      onChange={e => setTileAngle(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-primary-gold focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Grout Width */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest">
                      <span>Grout Line Width</span>
                      <span className="text-white/80 font-mono">{groutWidth === 0 ? 'Seamless' : `${groutWidth}mm`}</span>
                    </div>
                    <div className="flex gap-2">
                      {[0, 1, 2, 4].map(w => (
                        <button
                          key={w}
                          onClick={() => setGroutWidth(w)}
                          className={`flex-1 py-1 text-[9px] font-bold uppercase rounded border transition-colors ${
                            groutWidth === w ? 'border-primary-gold text-primary-gold' : 'border-white/5 bg-black/20 text-white/60 hover:text-white'
                          }`}
                        >
                          {w === 0 ? 'None' : `${w}mm`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grout Color selection */}
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-widest text-white/40">Grout Line Color</span>
                    <div className="flex gap-3">
                      {GROUT_COLORS.map(color => (
                        <button
                          key={color.hex}
                          onClick={() => setGroutColor(color.hex)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            groutColor === color.hex ? 'border-primary-gold scale-110' : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Surface catalog picker */}
        <div className="lg:col-span-4 bg-charcoal border border-white/5 p-6 rounded-2xl flex flex-col h-[740px] justify-between shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-gold/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <span className="text-primary-gold text-[9px] tracking-widest uppercase font-bold">Step 2: Choose Surface</span>
            <h3 className="font-display text-xl font-bold mt-1 mb-4 flex items-center gap-1.5"><Eye className="w-5 h-5 text-primary-gold" /> Select Surface Slabs</h3>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 mb-5 shrink-0">
              {['All', 'Marble', 'Stone', 'Wooden'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest border transition-colors rounded ${
                    activeCategory === cat
                      ? 'border-primary-gold bg-primary-gold/5 text-primary-gold'
                      : 'border-white/5 text-white/50 hover:text-white hover:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid list */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3">
              {filteredTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => setSelectedTile(tile)}
                  className={`w-full p-2.5 border text-left flex gap-4 transition-all duration-300 rounded-xl ${
                    selectedTile?.id === tile.id
                      ? 'border-primary-gold bg-primary-gold/10'
                      : 'border-white/5 hover:border-white/10 bg-black/25'
                  }`}
                >
                  <div className="w-16 h-16 bg-neutral-950 shrink-0 overflow-hidden border border-white/10 relative rounded-lg flex items-center justify-center">
                    <img 
                      src={tile.images?.[0] || 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=100&q=80'} 
                      alt={tile.name} 
                      className="max-w-full max-h-full object-contain p-1" 
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">{tile.name}</h4>
                      <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wide">{tile.size} | {tile.finish}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-primary-gold mt-1.5">
                      <span className="font-mono">₹{tile.price} / sq.ft</span>
                      {selectedTile?.id === tile.id && (
                        <Check className="w-3.5 h-3.5 text-primary-gold" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {filteredTiles.length === 0 && (
                <div className="text-center py-12 text-white/40 text-xs italic bg-black/10 border border-dashed border-white/5 rounded-xl">
                  No match found.
                </div>
              )}
            </div>
          </div>

          {/* Floating Actions */}
          <div className="pt-6 border-t border-white/5 flex flex-col gap-3 shrink-0">
            <button
              onClick={handleSaveDesign}
              disabled={isSaving}
              className="w-full py-3.5 bg-gold-gradient text-dark-black font-extrabold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-gold-gradient-hover hover:scale-[1.01] transition-all rounded-xl shadow-xl shadow-primary-gold/5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Design & Request Quote'}
            </button>
            <button
              onClick={handleDownload}
              className="w-full py-3.5 border border-white/15 text-white/90 hover:text-white font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <Download className="w-4 h-4" /> Download Mockup
            </button>
            <div className="text-center text-[10px] text-white/30 flex items-center justify-center gap-1 mt-1 font-light">
              <Compass className="w-3 h-3 text-primary-gold" /> Mockups are ready for high-resolution PDF catalogues.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
