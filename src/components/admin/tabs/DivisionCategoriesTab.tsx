'use client';
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Save, Layers } from 'lucide-react';
import { dbService, DivisionCategory } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function DivisionCategoriesTab({ showToast }: { showToast: (msg: string, type?: 'success'|'error') => void }) {
  const [categories, setCategories] = useState<DivisionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState('tiles');
  const [editingCategory, setEditingCategory] = useState<Partial<DivisionCategory> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCategories = async (slug: string) => {
    setLoading(true);
    const data = await dbService.getDivisionCategories(slug);
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories(activeSlug);
  }, [activeSlug]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const path = `division_category_${Date.now()}_${file.name}`;
    const url = await dbService.uploadFile('products', file, path);
    if (url) {
      setEditingCategory(prev => prev ? { ...prev, image_url: url } : null);
    } else {
      showToast('Failed to upload image.', 'error');
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setIsSaving(true);
    const saved = await dbService.saveDivisionCategory({
      ...editingCategory,
      page_slug: activeSlug
    });
    
    if (saved) {
      showToast('Category saved successfully!', 'success');
      setEditingCategory(null);
      fetchCategories(activeSlug);
    } else {
      showToast('Failed to save category.', 'error');
    }
    setIsSaving(false);
  };

  const executeDelete = async () => {
    if (!isDeleting) return;
    const success = await dbService.deleteDivisionCategory(isDeleting);
    if (success) {
      showToast('Category deleted successfully!', 'success');
      fetchCategories(activeSlug);
    } else {
      showToast('Failed to delete category.', 'error');
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary-gold" /> Page Categories
        </h2>
        
        <div className="flex gap-4">
          <select 
            value={activeSlug}
            onChange={(e) => setActiveSlug(e.target.value)}
            className="px-3 py-2 bg-dark-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary-gold"
          >
            <option value="tiles">Tiles Page</option>
            <option value="bath-fittings">Bath Fittings Page</option>
            <option value="doors">Doors Page</option>
          </select>

          <button
            onClick={() => setEditingCategory({ name: '', image_url: '', display_order: categories.length + 1 })}
            className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-gold-gradient-hover rounded-lg shadow-lg shadow-primary-gold/20 transition-all hover:scale-105 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/50 text-xs uppercase tracking-wider">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-dark-black/25 border border-white/5 rounded-lg">
          <Layers className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No categories found for this page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={cat.id}
              className="bg-dark-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-primary-gold/30 transition-colors group flex flex-col"
            >
              <div className="h-40 relative border-b border-white/10">
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingCategory(cat)} className="p-2 bg-dark-black/80 hover:bg-primary-gold text-white hover:text-dark-black rounded backdrop-blur-sm transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsDeleting(cat.id)} className="p-2 bg-dark-black/80 hover:bg-red-500 text-white rounded backdrop-blur-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">{cat.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-primary-gold font-semibold bg-primary-gold/10 px-2 py-0.5 rounded">Order: {cat.display_order}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-charcoal border border-primary-gold/30 p-8 shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setEditingCategory(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>

              <h3 className="font-display text-2xl font-bold text-gold-gradient mb-6">
                {editingCategory.id ? 'Edit Category' : 'Add Category'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Category Name *</label>
                  <input 
                    type="text" 
                    value={editingCategory.name || ''}
                    onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                    placeholder="e.g. Living Room"
                    className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Image (Supabase) *</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="w-full bg-dark-black border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover"
                  />
                  {isUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading to Supabase Storage...</p>}
                </div>

                <div className="w-full h-32 bg-dark-black border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                  {editingCategory.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editingCategory.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <span className="text-white/20 italic text-xs">No image uploaded</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Display Order</label>
                  <input 
                    type="number" 
                    value={editingCategory.display_order || 0}
                    onChange={e => setEditingCategory({...editingCategory, display_order: Number(e.target.value)})}
                    className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving || isUploading}
                  className="w-full py-3 mt-6 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider flex justify-center items-center gap-2 rounded-lg hover:shadow-lg hover:shadow-primary-gold/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-charcoal border border-red-500/30 p-6 rounded-xl max-w-sm w-full text-center shadow-2xl"
            >
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-80" />
              <h3 className="text-lg font-bold text-white mb-2">Delete Category?</h3>
              <p className="text-xs text-white/60 mb-6">Are you sure you want to permanently delete this category?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleting(null)} className="px-4 py-2 bg-dark-black border border-white/10 text-white/80 rounded hover:bg-white/5 transition-colors text-xs uppercase tracking-wider font-semibold">Cancel</button>
                <button onClick={executeDelete} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors text-xs uppercase tracking-wider font-semibold">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
