'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { dbService, Product, Dealer, Lead, Project, ProductDivision, DivisionCategory, BrandLogo, HeroSlide } from '@/lib/db';

// Components
import { Toast } from '@/components/admin/Toast';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ProductsTab } from '@/components/admin/tabs/ProductsTab';
import { DealersTab } from '@/components/admin/tabs/DealersTab';
import { ProjectsTab } from '@/components/admin/tabs/ProjectsTab';
import { DivisionsTab } from '@/components/admin/tabs/DivisionsTab';
import { DivisionCategoriesTab } from '@/components/admin/tabs/DivisionCategoriesTab';
import { BrandsTab } from '@/components/admin/tabs/BrandsTab';
import { HeroSlidesTab } from '@/components/admin/tabs/HeroSlidesTab';
import { LeadsTab, ProfileTab, AnalyticsTab } from '@/components/admin/tabs/OtherTabs';

type Tab = 'analytics' | 'products' | 'dealers' | 'projects' | 'leads' | 'divisions' | 'division-categories' | 'profile' | 'brands' | 'hero-slides';

export default function AdminPage() {
  const router = useRouter();

  // Dashboard Data
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [divisions, setDivisions] = useState<ProductDivision[]>([]);
  const [divisionCategories, setDivisionCategories] = useState<DivisionCategory[]>([]);
  const [brands, setBrands] = useState<BrandLogo[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  // Toast System
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({ show: false, msg: '', type: 'success' });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [prods, deals, projs, lds, divs, divCats, brnds, slides] = await Promise.all([
        dbService.getProducts(),
        dbService.getDealers(),
        dbService.getProjects(),
        dbService.getLeads(),
        dbService.getDivisions(),
        dbService.getDivisionCategories(),
        dbService.getBrands(),
        dbService.getHeroSlides()
      ]);
      setProducts(prods);
      setDealers(deals);
      setProjects(projs);
      setLeads(lds);
      setDivisions(divs);
      setDivisionCategories(divCats);
      setBrands(brnds);
      setHeroSlides(slides);
    } catch (e) {
      console.error(e);
      showToast('Error loading data', 'error');
    }
  };

  const handleLogout = async () => {
    await dbService.logout();
    router.push('/admin/login');
  };

  const handleBulkImport = async () => {
    const batchImport: Partial<Product>[] = [
      {
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
      },
      {
        name: 'Jaquar Alive Basin Mixer',
        slug: 'jaquar-alive-basin-mixer',
        sku: 'K-JAQ-ALV01',
        size: 'Standard',
        finish: 'Chrome',
        price: 4950,
        category_id: 'cat-faucets',
        collection_id: 'col-jaquar',
        images: ['https://images.unsplash.com/photo-1620626011761-996317b69763?auto=format&fit=crop&w=800&q=80'],
        description: 'Premium single lever basin mixer with gold-standard ceramic cartridge and chrome finish.',
        status: 'active'
      },
      {
        name: 'Jaquar Kubix Prime Shower Column',
        slug: 'jaquar-kubix-prime-shower-column',
        sku: 'K-JAQ-KBX02',
        size: 'Height Adjustable',
        finish: 'Matte Black',
        price: 18500,
        category_id: 'cat-faucets',
        collection_id: 'col-jaquar',
        images: ['https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80'],
        description: 'Thermostatic shower system with overhead rain shower and hand shower.',
        status: 'active'
      },
      {
        name: 'Kerovit Wall Hung Intelligent WC',
        slug: 'kerovit-wall-hung-intelligent-wc',
        sku: 'K-KER-WC01',
        size: '540x360x400 mm',
        finish: 'White Glossy',
        price: 24000,
        category_id: 'cat-faucets',
        collection_id: 'col-kerovit',
        images: ['https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80'],
        description: 'Elite rimless smart toilet with soft close seat and dual flush technology.',
        status: 'active'
      },
      {
        name: 'Jaquar Lyric Free Standing Bathtub',
        slug: 'jaquar-lyric-free-standing-bathtub',
        sku: 'K-JAQ-LYR04',
        size: '1700x800x600 mm',
        finish: 'White Acrylic',
        price: 85000,
        category_id: 'cat-faucets',
        collection_id: 'col-jaquar',
        images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
        description: 'Ergonomically designed luxury freestanding tub for premium wellness rooms.',
        status: 'active'
      },
      {
        name: 'Jaquar Elegance Digital Geyser',
        slug: 'jaquar-elegance-digital-geyser',
        sku: 'K-JAQ-ELG05',
        size: '25 Litres',
        finish: 'Ivory White',
        price: 12500,
        category_id: 'cat-faucets',
        collection_id: 'col-jaquar',
        images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80'],
        description: 'High durability glass-lined geyser with remote digital control settings.',
        status: 'active'
      },
      {
        name: 'Jaquar Hotelier Towel Hanger',
        slug: 'jaquar-hotelier-towel-hanger',
        sku: 'K-JAQ-HTL06',
        size: '600 mm',
        finish: 'Golden Brass',
        price: 3200,
        category_id: 'cat-faucets',
        collection_id: 'col-jaquar',
        images: ['https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80'],
        description: 'Solid brass luxury towel hanger accessory for master washrooms.',
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

  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const wonLeadsCount = leads.filter(l => l.status === 'won').length;

  return (
    <div className="bg-dark-black min-h-screen text-white pt-12 pb-20">
      <Toast show={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast(prev => ({...prev, show: false}))} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-primary-gold text-[10px] tracking-widest uppercase font-semibold">Protected Management Console</span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-3xl font-bold text-gold-gradient">Control Dashboard</h1>
            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] uppercase font-bold tracking-widest rounded shadow-sm">DB Connected</span>
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

          {activeTab === 'analytics' && <AnalyticsTab data={{ products: products.length, dealers: dealers.length, newLeads: newLeadsCount }} />}
          {activeTab === 'products' && <ProductsTab products={products} divisions={divisions} divisionCategories={divisionCategories} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'divisions' && <DivisionsTab divisions={divisions} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'hero-slides' && <HeroSlidesTab slides={heroSlides} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'division-categories' && <DivisionCategoriesTab showToast={showToast} />}
          {activeTab === 'brands' && <BrandsTab brands={brands} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'dealers' && <DealersTab dealers={dealers} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'projects' && <ProjectsTab projects={projects} products={products} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'leads' && <LeadsTab leads={leads} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'profile' && <ProfileTab showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}
