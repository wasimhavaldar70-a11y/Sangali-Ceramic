'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { dbService, Product, Dealer, Lead, Project, ProductDivision, DivisionCategory, BrandLogo, HeroSlide, Testimonial } from '@/lib/db';

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
import { TestimonialsTab } from '@/components/admin/tabs/TestimonialsTab';

type Tab = 'analytics' | 'products' | 'dealers' | 'projects' | 'leads' | 'divisions' | 'division-categories' | 'profile' | 'brands' | 'hero-slides' | 'testimonials';

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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

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
      const [prods, deals, projs, lds, divs, divCats, brnds, slides, tests] = await Promise.all([
        dbService.getProducts(),
        dbService.getDealers(),
        dbService.getProjects(),
        dbService.getLeads(),
        dbService.getDivisions(),
        dbService.getDivisionCategories(),
        dbService.getBrands(),
        dbService.getHeroSlides(),
        dbService.getTestimonials()
      ]);
      setProducts(prods);
      setDealers(deals);
      setProjects(projs);
      setLeads(lds);
      setDivisions(divs);
      setDivisionCategories(divCats);
      setBrands(brnds);
      setHeroSlides(slides);
      setTestimonials(tests);
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
    showToast('Bulk import is disabled in production mode.', 'error');
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
          testimonials={testimonials}
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
          {activeTab === 'testimonials' && <TestimonialsTab testimonials={testimonials} refreshData={loadDashboardData} showToast={showToast} />}
          {activeTab === 'profile' && <ProfileTab showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}
