'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, LogIn, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { dbService, Product, Dealer, Lead, Project, isSupabaseConfigured } from '@/lib/supabase';

// Components
import { Toast } from '@/components/admin/Toast';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ProductsTab } from '@/components/admin/tabs/ProductsTab';
import { DealersTab } from '@/components/admin/tabs/DealersTab';
import { ProjectsTab } from '@/components/admin/tabs/ProjectsTab';
import { LeadsTab, ProfileTab, AnalyticsTab } from '@/components/admin/tabs/OtherTabs';

type Tab = 'analytics' | 'products' | 'dealers' | 'projects' | 'leads' | 'profile';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Data
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  // Toast System
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({ show: false, msg: '', type: 'success' });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await dbService.verifyAdminPasscode(passcode);
    if (isValid) {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('admin_auth', 'true');
      loadDashboardData();
      showToast('Successfully authenticated.');
    } else {
      setAuthError('Invalid administrator passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPasscode('');
    showToast('Logged out successfully.');
  };

  const handleBulkImport = async () => {
    const batchImport: Product[] = [
      {
        id: `prod-travertine-${Date.now()}`,
        name: 'Travertine Classic',
        slug: 'travertine-classic',
        sku: 'TR-CL-007',
        size: '800x1600 mm',
        finish: 'Matte',
        price: 1350,
        category_id: 'cat-stone',
        collection_id: 'col-stone',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
        description: 'Authentic Italian travertine styling.',
        status: 'active'
      }
    ];

    try {
      for (const prod of batchImport) {
        await dbService.saveProduct(prod);
      }
      showToast('Bulk Import Successful! Added 1 new luxury slab.');
      loadDashboardData();
    } catch (err) {
      showToast('Bulk import failed.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-black flex items-center justify-center p-6 pt-28">
        <Toast show={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast(prev => ({...prev, show: false}))} />
        <div className="w-full max-w-md bg-charcoal border border-primary-gold/20 p-8 shadow-2xl rounded-xl backdrop-blur-md">
          <div className="text-center mb-8">
            <Compass className="w-12 h-12 text-primary-gold mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold tracking-widest text-gold-gradient">ADMINISTRATOR ACCESS</h1>
            <p className="text-white/40 text-xs tracking-wider uppercase mt-1">Ceramica Premium CMS Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">Administrator Passcode</label>
              <input type="password" required value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="Enter passcode" className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold text-center tracking-widest rounded-lg" />
            </div>
            {authError && <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-3 flex gap-2 items-center rounded-lg"><ShieldAlert className="w-4 h-4 shrink-0" /> {authError}</p>}
            <button type="submit" className="w-full py-3 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-gold-gradient-hover transition-all hover:scale-[1.02] rounded-lg shadow-xl"><LogIn className="w-4 h-4" /> Authenticate Portal</button>
          </form>
          <Link href="/" className="block text-center text-xs text-white/40 hover:text-primary-gold mt-6 transition-colors">← Back to Public Website</Link>
        </div>
      </div>
    );
  }

  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const closedLeadsCount = leads.filter(l => l.status === 'closed').length;

  return (
    <div className="bg-dark-black min-h-screen text-white pt-28 pb-20">
      <Toast show={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast(prev => ({...prev, show: false}))} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-primary-gold text-[10px] tracking-widest uppercase font-semibold">Protected Management Console</span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-3xl font-bold text-gold-gradient">Control Dashboard</h1>
            {isSupabaseConfigured ? (
              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] uppercase font-bold tracking-widest rounded shadow-sm">DB Connected</span>
            ) : (
              <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] uppercase font-bold tracking-widest rounded shadow-sm" title="Using local browser storage">Local Mode</span>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="px-4 py-2 border border-white/10 text-white/80 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors rounded-lg">Logout</button>
          <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-wider flex items-center gap-1 rounded-lg transition-colors">View Site <ArrowUpRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          products={products} 
          dealers={dealers} 
          projects={projects} 
          newLeads={newLeadsCount} 
          onBulkImport={handleBulkImport} 
        />

        <div className="lg:col-span-9 bg-charcoal border border-white/5 p-6 min-h-[500px] rounded-xl shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/5 blur-[100px] rounded-full pointer-events-none"></div>

          {activeTab === 'analytics' && <AnalyticsTab data={{ products: products.length, dealers: dealers.length, newLeads: newLeadsCount, closedLeads: closedLeadsCount }} />}
          {activeTab === 'products' && <ProductsTab products={products} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'dealers' && <DealersTab dealers={dealers} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'projects' && <ProjectsTab projects={projects} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'leads' && <LeadsTab leads={leads} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'profile' && <ProfileTab showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}
