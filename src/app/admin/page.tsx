'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, LayoutDashboard, ShoppingBag, MapPin, Users,
  FolderOpen, ShieldAlert, LogIn, Plus, Trash2, Edit2, CheckCircle2,
  FileSpreadsheet, BarChart3, Database, Save, X, Phone, Mail, ArrowUpRight, Compass
} from 'lucide-react';
import { dbService, Product, Dealer, Lead, Project } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Data
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'dealers' | 'projects' | 'leads'>('analytics');

  // Form Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [dealerModalOpen, setDealerModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);

  // Form Fields - Product
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pSize, setPSize] = useState('');
  const [pFinish, setPFinish] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');

  // Form Fields - Dealer
  const [dName, setDName] = useState('');
  const [dState, setDState] = useState('');
  const [dCity, setDCity] = useState('');
  const [dAddress, setDAddress] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dEmail, setDEmail] = useState('');

  useEffect(() => {
    // Check if previously logged in this session
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('admin_auth') === 'true';
      if (isAuth) {
        setIsAuthenticated(true);
        loadDashboardData();
      }
    }
  }, []);

  const loadDashboardData = async () => {
    const prods = await dbService.getProducts();
    const deals = await dbService.getDealers();
    const projs = await dbService.getProjects();
    const lds = await dbService.getLeads();

    setProducts(prods);
    setDealers(deals);
    setProjects(projs);
    setLeads(lds);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('admin_auth', 'true');
      loadDashboardData();
    } else {
      setAuthError('Invalid administrator passcode. (Try "admin123")');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPasscode('');
  };

  // --- Products CRUD ---
  const openProductForm = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name);
      setPSku(prod.sku);
      setPSize(prod.size);
      setPFinish(prod.finish);
      setPPrice(prod.price);
      setPImage(prod.images[0] || '');
      setPDesc(prod.description || '');
    } else {
      setEditingProduct(null);
      setPName('');
      setPSku(`PR-${Math.floor(100 + Math.random() * 900)}`);
      setPSize('600x1200 mm');
      setPFinish('Glossy');
      setPPrice(1200);
      setPImage('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80');
      setPDesc('');
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: pName,
      slug: pName.toLowerCase().replace(/ /g, '-'),
      sku: pSku,
      size: pSize,
      finish: pFinish,
      price: Number(pPrice),
      category_id: pFinish.toLowerCase() === 'matte' ? 'cat-matte' : 'cat-glossy',
      collection_id: pFinish.toLowerCase() === 'matte' ? 'col-matte' : 'col-marble',
      images: [pImage],
      description: pDesc,
      status: 'active',
      tech_specs: editingProduct?.tech_specs || { water_absorption: '< 0.05%', hardness: '6 Mohs', thickness: '9.5 mm' }
    };

    await dbService.saveProduct(productData);
    setProductModalOpen(false);
    loadDashboardData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this premium product?')) {
      await dbService.deleteProduct(id);
      loadDashboardData();
    }
  };

  // --- Dealers CRUD ---
  const openDealerForm = (dealer: Dealer | null = null) => {
    if (dealer) {
      setEditingDealer(dealer);
      setDName(dealer.name);
      setDState(dealer.state);
      setDCity(dealer.city);
      setDAddress(dealer.address);
      setDPhone(dealer.phone);
      setDEmail(dealer.email || '');
    } else {
      setEditingDealer(null);
      setDName('');
      setDState('Maharashtra');
      setDCity('');
      setDAddress('');
      setDPhone('');
      setDEmail('');
    }
    setDealerModalOpen(true);
  };

  const handleSaveDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    const dealerData: Dealer = {
      id: editingDealer ? editingDealer.id : `deal-${Date.now()}`,
      name: dName,
      state: dState,
      city: dCity,
      address: dAddress,
      phone: dPhone,
      email: dEmail,
      coords: editingDealer?.coords || { lat: 18.5204, lng: 73.8567 }
    };

    await dbService.saveDealer(dealerData);
    setDealerModalOpen(false);
    loadDashboardData();
  };

  const handleDeleteDealer = async (id: string) => {
    if (confirm('Delete this dealer outlet registration?')) {
      await dbService.deleteDealer(id);
      loadDashboardData();
    }
  };

  // --- Leads Status ---
  const handleToggleLeadStatus = async (id: string, currentStatus: 'new' | 'contacted' | 'closed') => {
    const nextStatus = currentStatus === 'new' ? 'contacted' : currentStatus === 'contacted' ? 'closed' : 'new';
    await dbService.updateLeadStatus(id, nextStatus);
    loadDashboardData();
  };

  // --- Bulk Import Mock ---
  const handleBulkImport = async () => {
    const batchImport: Product[] = [
      {
        id: 'prod-travertine',
        name: 'Travertine Classic',
        slug: 'travertine-classic',
        sku: 'TR-CL-007',
        size: '800x1600 mm',
        finish: 'Matte',
        price: 1350,
        category_id: 'cat-stone',
        collection_id: 'col-stone',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
        description: 'Authentic Italian travertine styling with porous-look textures and soft honey-beige hues.',
        status: 'active'
      },
      {
        id: 'prod-statuario',
        name: 'Statuario Imperial',
        slug: 'statuario-imperial',
        sku: 'ST-IM-008',
        size: '1200x2400 mm',
        finish: 'Glossy',
        price: 1850,
        category_id: 'cat-marble',
        collection_id: 'col-large',
        images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'],
        description: 'Elite heavy grey veins across brilliant white glaze. The peak of premium architectural tiling.',
        status: 'active'
      }
    ];

    for (const prod of batchImport) {
      await dbService.saveProduct(prod);
    }
    alert('Bulk Import Successful! Added 2 new luxury slabs: Travertine Classic & Statuario Imperial.');
    loadDashboardData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-black flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-charcoal border border-primary-gold/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Compass className="w-12 h-12 text-primary-gold mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold tracking-widest text-gold-gradient">ADMINISTRATOR ACCESS</h1>
            <p className="text-white/40 text-xs tracking-wider uppercase mt-1">Ceramica Premium CMS Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">
                Administrator Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (Hint: admin123)"
                className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold text-center tracking-widest"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-3 flex gap-2 items-center">
                <ShieldAlert className="w-4 h-4 shrink-0" /> {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-gold-gradient-hover"
            >
              Authenticate Portal <LogIn className="w-4 h-4" />
            </button>
          </form>

          <Link href="/" className="block text-center text-xs text-white/40 hover:text-primary-gold mt-6 transition-colors">
            ← Back to Public Website
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const closedLeads = leads.filter(l => l.status === 'closed').length;

  return (
    <div className="bg-dark-black min-h-screen text-white pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-primary-gold text-[10px] tracking-widest uppercase font-semibold">Protected Management Console</span>
          <h1 className="font-display text-3xl font-bold text-gold-gradient">Control Dashboard</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-white/10 text-white/80 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors"
          >
            Logout
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-wider flex items-center gap-1"
          >
            View Site <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Panel */}
        <div className="lg:col-span-3 bg-charcoal border border-white/5 p-4 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full py-3 px-4 text-left text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
              activeTab === 'analytics' ? 'bg-primary-gold text-dark-black font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full py-3 px-4 text-left text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
              activeTab === 'products' ? 'bg-primary-gold text-dark-black font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('dealers')}
            className={`w-full py-3 px-4 text-left text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
              activeTab === 'dealers' ? 'bg-primary-gold text-dark-black font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" /> Showroom Dealers ({dealers.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full py-3 px-4 text-left text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
              activeTab === 'projects' ? 'bg-primary-gold text-dark-black font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" /> Portfolios ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`w-full py-3 px-4 text-left text-xs uppercase tracking-widest flex items-center justify-between transition-colors ${
              activeTab === 'leads' ? 'bg-primary-gold text-dark-black font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3"><Users className="w-4 h-4" /> Customer Leads</span>
            {newLeads > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${activeTab === 'leads' ? 'bg-dark-black text-primary-gold' : 'bg-primary-gold text-dark-black'}`}>
                {newLeads}
              </span>
            )}
          </button>

          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              onClick={handleBulkImport}
              className="w-full py-2.5 bg-dark-black border border-primary-gold/30 text-primary-gold hover:bg-primary-gold hover:text-dark-black text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Database className="w-3.5 h-3.5" /> Bulk Import Slabs
            </button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-9 bg-charcoal border border-white/5 p-6 min-h-[500px]">
          
          {/* TAB: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-gold-gradient">
                <BarChart3 className="w-5 h-5 text-primary-gold" /> System Analytics
              </h2>

              {/* Stat Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-dark-black/40 p-5 border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">Total Catalogue Slabs</span>
                  <span className="text-3xl font-bold font-display text-primary-gold">{products.length} Designs</span>
                </div>
                <div className="bg-dark-black/40 p-5 border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">Showroom Outlets</span>
                  <span className="text-3xl font-bold font-display text-primary-gold">{dealers.length} Locations</span>
                </div>
                <div className="bg-dark-black/40 p-5 border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">New Customer Inquiries</span>
                  <span className="text-3xl font-bold font-display text-yellow-400">{newLeads} Active</span>
                </div>
                <div className="bg-dark-black/40 p-5 border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">Closed Deals</span>
                  <span className="text-3xl font-bold font-display text-green-400">{closedLeads} Completed</span>
                </div>
              </div>

              {/* Geographic / Lead conversion info graphs mock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-dark-black/40 p-6 border border-white/5">
                  <h4 className="text-xs uppercase tracking-widest text-white/60 mb-4 pb-2 border-b border-white/5 font-semibold">Geographic Distribution Requests</h4>
                  <div className="space-y-3">
                    {[['Maharashtra', '45%'], ['Delhi NCR', '25%'], ['Karnataka', '15%'], ['Gujarat', '10%'], ['Others', '5%']].map(([state, pct]) => (
                      <div key={state} className="flex justify-between items-center text-xs">
                        <span className="text-white/70">{state}</span>
                        <div className="flex items-center gap-3 w-2/3 justify-end">
                          <div className="w-24 bg-neutral-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary-gold h-full" style={{ width: pct }} />
                          </div>
                          <span className="font-semibold w-8 text-right text-primary-gold">{pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-dark-black/40 p-6 border border-white/5">
                  <h4 className="text-xs uppercase tracking-widest text-white/60 mb-4 pb-2 border-b border-white/5 font-semibold">Leads by Channel Category</h4>
                  <div className="space-y-3">
                    {[['Quote Requests', '65%'], ['Catalogue Downloads', '20%'], ['WhatsApp Inquiry', '10%'], ['Dealership applications', '5%']].map(([chan, pct]) => (
                      <div key={chan} className="flex justify-between items-center text-xs">
                        <span className="text-white/70">{chan}</span>
                        <div className="flex items-center gap-3 w-2/3 justify-end">
                          <div className="w-24 bg-neutral-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary-gold h-full" style={{ width: pct }} />
                          </div>
                          <span className="font-semibold w-8 text-right text-primary-gold">{pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS LIST */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary-gold" /> Catalogue Tiles
                </h2>
                <button
                  onClick={() => openProductForm(null)}
                  className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gold-gradient-hover"
                >
                  <Plus className="w-4 h-4" /> Add Premium Tile
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-dark-black/40 border-b border-white/10 text-white/60 uppercase tracking-wider font-semibold">
                      <th className="p-4">Tile</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Dimensions</th>
                      <th className="p-4">Finish</th>
                      <th className="p-4 text-right">Price (Sq.Ft)</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-dark-black overflow-hidden border border-white/10 shrink-0">
                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-white text-sm">{prod.name}</span>
                        </td>
                        <td className="p-4 font-mono text-white/50">{prod.sku}</td>
                        <td className="p-4">{prod.size}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-dark-black border border-primary-gold/20 text-primary-gold text-[9px] uppercase font-semibold">
                            {prod.finish}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-primary-gold">₹{prod.price}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => openProductForm(prod)}
                              className="text-white/60 hover:text-primary-gold p-1"
                              aria-label="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="text-white/60 hover:text-red-400 p-1"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DEALERS LIST */}
          {activeTab === 'dealers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-gold" /> Dealer Network
                </h2>
                <button
                  onClick={() => openDealerForm(null)}
                  className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gold-gradient-hover"
                >
                  <Plus className="w-4 h-4" /> Register Showroom
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-dark-black/40 border-b border-white/10 text-white/60 uppercase tracking-wider font-semibold">
                      <th className="p-4">Showroom Name</th>
                      <th className="p-4">State</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dealers.map(deal => (
                      <tr key={deal.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{deal.name}</td>
                        <td className="p-4">{deal.state}</td>
                        <td className="p-4">{deal.city}</td>
                        <td className="p-4">{deal.phone}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => openDealerForm(deal)}
                              className="text-white/60 hover:text-primary-gold p-1"
                              aria-label="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDealer(deal.id)}
                              className="text-white/60 hover:text-red-400 p-1"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PORTFOLIO PROJECTS LIST */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary-gold" /> Portfolio Galleries
                </h2>
                <button
                  onClick={() => alert('Add Project portfolios is a seed option. In database mode, this expands a standard portfolio modal details form.')}
                  className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gold-gradient-hover"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-dark-black/40 border-b border-white/10 text-white/60 uppercase tracking-wider font-semibold">
                      <th className="p-4">Project Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {projects.map(proj => (
                      <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-dark-black overflow-hidden border border-white/10 shrink-0">
                            <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-white text-sm">{proj.title}</span>
                        </td>
                        <td className="p-4">{proj.category}</td>
                        <td className="p-4">{proj.location}</td>
                        <td className="p-4">{proj.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LEADS CAPTURED VIEW */}
          {activeTab === 'leads' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-gold" /> Customer Lead Inquiries
              </h2>

              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="text-center py-12 bg-dark-black/25 border border-white/5">
                    <p className="text-white/40">No lead submissions registered yet. Submit forms on the page to view submissions here!</p>
                  </div>
                ) : (
                  leads.map(lead => (
                    <div
                      key={lead.id}
                      className={`p-5 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
                        lead.status === 'new'
                          ? 'border-yellow-500/30 bg-yellow-500/5'
                          : lead.status === 'contacted'
                          ? 'border-blue-500/20 bg-blue-500/5'
                          : 'border-white/5 bg-[#0F0F0F]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-white text-sm">{lead.name}</span>
                          <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                            lead.type === 'quote' ? 'bg-primary-gold/20 text-primary-gold' : 'bg-white/10 text-white/80'
                          }`}>
                            {lead.type}
                          </span>
                          <span className="text-[10px] text-white/30">{new Date(lead.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed max-w-2xl">{lead.message}</p>
                        <div className="flex gap-4 text-[10px] text-white/40 pt-1">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-primary-gold" /> {lead.phone}</span>
                          {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary-gold" /> {lead.email}</span>}
                        </div>
                      </div>

                      {/* Status changer button */}
                      <button
                        onClick={() => handleToggleLeadStatus(lead.id, lead.status)}
                        className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest border transition-colors shrink-0 ${
                          lead.status === 'new'
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/25'
                            : lead.status === 'contacted'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/25'
                            : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/25'
                        }`}
                      >
                        {lead.status === 'new' ? 'Mark Contacted' : lead.status === 'contacted' ? 'Close Lead' : 'Reopen Lead'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: Product Form */}
      {productModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-charcoal border border-primary-gold/30 p-8 shadow-2xl">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-display text-2xl font-bold text-gold-gradient mb-6">
              {editingProduct ? 'Edit Catalogue Slab' : 'Add Premium Design'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Calacatta White"
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Slab Size *</label>
                  <input
                    type="text"
                    required
                    value={pSize}
                    onChange={(e) => setPSize(e.target.value)}
                    placeholder="e.g. 800x1600 mm"
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Surface Finish *</label>
                  <select
                    value={pFinish}
                    onChange={(e) => setPFinish(e.target.value)}
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  >
                    <option value="Glossy">Glossy</option>
                    <option value="Matte">Matte</option>
                    <option value="Satin">Satin</option>
                    <option value="Super White">Super White</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Price / Sq.Ft *</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-white/50 mb-1">High-Res Texture URL *</label>
                <input
                  type="text"
                  required
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-white/50 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Explain veining, character, suitable architectures..."
                  className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs hover:bg-gold-gradient-hover flex justify-center items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Premium Tile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Dealer Form */}
      {dealerModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-charcoal border border-primary-gold/30 p-8 shadow-2xl">
            <button
              onClick={() => setDealerModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-display text-2xl font-bold text-gold-gradient mb-6">
              {editingDealer ? 'Edit Showroom Credentials' : 'Register Authorized Showroom'}
            </h3>

            <form onSubmit={handleSaveDealer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Outlet Name *</label>
                  <input
                    type="text"
                    required
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    placeholder="e.g. Elite Ceramic Studio"
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={dPhone}
                    onChange={(e) => setDPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={dState}
                    onChange={(e) => setDState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={dCity}
                    onChange={(e) => setDCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={dEmail}
                    onChange={(e) => setDEmail(e.target.value)}
                    placeholder="info@outlet.com"
                    className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-white/50 mb-1">Physical Address *</label>
                <textarea
                  rows={2}
                  required
                  value={dAddress}
                  onChange={(e) => setDAddress(e.target.value)}
                  placeholder="Complete showroom gallery address, landmark..."
                  className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-gold resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs hover:bg-gold-gradient-hover flex justify-center items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Showroom Registry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
