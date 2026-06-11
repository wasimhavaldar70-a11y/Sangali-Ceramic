import { LayoutDashboard, ShoppingBag, MapPin, FolderOpen, Users, ShieldAlert, Database, Layers } from 'lucide-react';
import { Product, Dealer, Project, Lead } from '@/lib/supabase';

interface AdminSidebarProps {
  activeTab: 'analytics' | 'products' | 'dealers' | 'projects' | 'leads' | 'divisions' | 'profile';
  setActiveTab: (tab: 'analytics' | 'products' | 'dealers' | 'projects' | 'leads' | 'divisions' | 'profile') => void;
  products: Product[];
  dealers: Dealer[];
  projects: Project[];
  newLeads: number;
  onBulkImport: () => void;
}

export function AdminSidebar({ 
  activeTab, setActiveTab, products, dealers, projects, newLeads, onBulkImport 
}: AdminSidebarProps) {
  
  const getTabClass = (tabName: string) => {
    return `w-full py-3 px-4 text-left text-xs uppercase tracking-widest flex items-center justify-between transition-all duration-300 ${
      activeTab === tabName 
        ? 'bg-gold-gradient text-dark-black font-bold shadow-lg shadow-primary-gold/20 scale-[1.02]' 
        : 'hover:bg-white/5 text-white/70 hover:text-white hover:translate-x-1'
    }`;
  };

  return (
    <div className="lg:col-span-3 bg-charcoal/80 backdrop-blur-md border border-white/5 p-4 flex flex-col gap-2 rounded-xl shadow-2xl">
      <button onClick={() => setActiveTab('analytics')} className={getTabClass('analytics')}>
        <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4" /> Analytics Overview</span>
      </button>
      <button onClick={() => setActiveTab('products')} className={getTabClass('products')}>
        <span className="flex items-center gap-3"><ShoppingBag className="w-4 h-4" /> Products ({products.length})</span>
      </button>
      <button onClick={() => setActiveTab('divisions')} className={getTabClass('divisions')}>
        <span className="flex items-center gap-3"><Layers className="w-4 h-4" /> Divisions</span>
      </button>
      <button onClick={() => setActiveTab('dealers')} className={getTabClass('dealers')}>
        <span className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Showroom Dealers ({dealers.length})</span>
      </button>
      <button onClick={() => setActiveTab('projects')} className={getTabClass('projects')}>
        <span className="flex items-center gap-3"><FolderOpen className="w-4 h-4" /> Portfolios ({projects.length})</span>
      </button>
      <button onClick={() => setActiveTab('leads')} className={getTabClass('leads')}>
        <span className="flex items-center gap-3"><Users className="w-4 h-4" /> Customer Leads</span>
        {newLeads > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${activeTab === 'leads' ? 'bg-dark-black text-primary-gold' : 'bg-primary-gold text-dark-black'}`}>
            {newLeads}
          </span>
        )}
      </button>

      <div className="pt-4 border-t border-white/5 mt-4 flex flex-col gap-2">
        <button onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>
          <span className="flex items-center gap-3"><ShieldAlert className="w-4 h-4" /> Security / Profile</span>
        </button>
        <button
          onClick={onBulkImport}
          className="w-full py-2.5 mt-2 bg-dark-black border border-primary-gold/30 text-primary-gold hover:bg-primary-gold hover:text-dark-black text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors rounded-lg"
        >
          <Database className="w-3.5 h-3.5" /> Bulk Import Slabs
        </button>
      </div>
    </div>
  );
}
