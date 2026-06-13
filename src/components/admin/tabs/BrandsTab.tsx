import { useState } from 'react';
import { BrandLogo, dbService } from '@/lib/db';
import { Edit, Trash2, Plus, X, Save, Image as ImageIcon } from 'lucide-react';

interface BrandsTabProps {
  brands: BrandLogo[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function BrandsTab({ brands, refreshData, showToast }: BrandsTabProps) {
  const [editingBrand, setEditingBrand] = useState<Partial<BrandLogo> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const path = `brand_${Date.now()}_${file.name}`;
    // Using 'products' bucket as it is configured and public
    const url = await dbService.uploadFile('products', file, path);
    if (url) {
      setEditingBrand(prev => prev ? { ...prev, logo_url: url } : null);
      showToast('Logo uploaded successfully');
    } else {
      showToast('Failed to upload image.', 'error');
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand?.name) {
      showToast('Brand name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await dbService.saveBrand(editingBrand as Partial<BrandLogo>);
      if (saved) {
        showToast('Brand logo saved successfully');
        setEditingBrand(null);
        refreshData();
      } else {
        showToast('Failed to save brand logo', 'error');
      }
    } catch (err) {
      showToast('Error saving brand logo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand logo?')) return;
    
    setIsDeleting(id);
    try {
      const success = await dbService.deleteBrand(id);
      if (success) {
        showToast('Brand logo deleted successfully');
        refreshData();
      } else {
        showToast('Failed to delete brand logo', 'error');
      }
    } catch (err) {
      showToast('Error deleting brand logo', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  if (editingBrand) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold text-primary-gold">
            {editingBrand.id ? 'Edit Brand Logo' : 'Add New Brand Logo'}
          </h2>
          <button 
            onClick={() => setEditingBrand(null)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Brand Name</label>
              <input 
                type="text" 
                value={editingBrand.name || ''}
                onChange={e => setEditingBrand({...editingBrand, name: e.target.value})}
                placeholder="e.g. Nitco"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Display Order</label>
              <input 
                type="number" 
                value={editingBrand.display_order || 0}
                onChange={e => setEditingBrand({...editingBrand, display_order: parseInt(e.target.value) || 0})}
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Upload Logo File</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full bg-dark-black border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover"
              />
              {isUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading to Storage...</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Logo Image URL (Or Upload Above)</label>
              <input 
                type="text" 
                value={editingBrand.logo_url || ''}
                onChange={e => setEditingBrand({...editingBrand, logo_url: e.target.value})}
                placeholder="e.g. https://images.unsplash.com/... or /custom-logo.png"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
              />
            </div>

            {/* Logo Preview */}
            <div className="w-full h-32 bg-dark-black border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
              {editingBrand.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editingBrand.logo_url} alt="Logo Preview" className="max-w-[80%] max-h-[80%] object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="flex flex-col items-center justify-center text-white/20 select-none">
                  <span className="font-serif italic text-lg font-bold">{editingBrand.name || 'Brand Logo'}</span>
                  <span className="text-[9px] uppercase tracking-widest mt-1">Default SVG Fallback will be used</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-primary-gold text-dark-black font-bold uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" /> Save Brand Logo
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-primary-gold">Partner Brands</h2>
          <p className="text-white/60 text-sm mt-1">Manage the brands and companies featured in the infinite marquee.</p>
        </div>
        <button
          onClick={() => setEditingBrand({ name: '', logo_url: '', display_order: brands.length + 1 })}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-12 border border-white/10 rounded-xl bg-dark-black/50">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Brands Found</h3>
          <p className="text-white/50 text-sm">Add brands to display them in the homepage marquee.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-dark-black border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-full md:w-48 h-20 bg-[#121212] flex items-center justify-center rounded-lg overflow-hidden shrink-0 border border-white/10 px-4 py-2">
                {brand.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-sm font-semibold tracking-wider text-white/80">{brand.name} (Default SVG)</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-primary-gold uppercase tracking-widest">Order: {brand.display_order}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-1">{brand.name}</h3>
                <p className="text-white/50 text-xs">
                  {brand.logo_url ? `Custom Logo Source: ${brand.logo_url}` : 'Using inline stylized branding fallback'}
                </p>
              </div>
              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setEditingBrand(brand)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  disabled={isDeleting === brand.id}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
