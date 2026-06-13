import { useState } from 'react';
import { ProductDivision, dbService } from '@/lib/db';
import { Edit, Trash2, Plus, X, Save, Image as ImageIcon } from 'lucide-react';

interface DivisionsTabProps {
  divisions: ProductDivision[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function DivisionsTab({ divisions, refreshData, showToast }: DivisionsTabProps) {
  const [editingDivision, setEditingDivision] = useState<Partial<ProductDivision> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const path = `division_${Date.now()}_${file.name}`;
    // Using 'products' bucket as it is configured and public
    const url = await dbService.uploadFile('products', file, path);
    if (url) {
      setEditingDivision(prev => prev ? { ...prev, image_url: url } : null);
    } else {
      showToast('Failed to upload image.', 'error');
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDivision?.title || !editingDivision?.heading || !editingDivision?.description) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await dbService.saveDivision(editingDivision as Partial<ProductDivision>);
      if (saved) {
        showToast('Division saved successfully');
        setEditingDivision(null);
        refreshData();
      } else {
        showToast('Failed to save division', 'error');
      }
    } catch (err) {
      showToast('Error saving division', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product division?')) return;
    
    setIsDeleting(id);
    try {
      const success = await dbService.deleteDivision(id);
      if (success) {
        showToast('Division deleted successfully');
        refreshData();
      } else {
        showToast('Failed to delete division', 'error');
      }
    } catch (err) {
      showToast('Error deleting division', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  if (editingDivision) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold text-primary-gold">
            {editingDivision.id ? 'Edit Division' : 'Add New Division'}
          </h2>
          <button 
            onClick={() => setEditingDivision(null)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Badge Text</label>
              <input 
                type="text" 
                value={editingDivision.badge_text || ''}
                onChange={e => setEditingDivision({...editingDivision, badge_text: e.target.value})}
                placeholder="e.g. Core Collection"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Title</label>
              <input 
                type="text" 
                value={editingDivision.title || ''}
                onChange={e => setEditingDivision({...editingDivision, title: e.target.value})}
                placeholder="e.g. Premium Tiles"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Heading</label>
              <input 
                type="text" 
                value={editingDivision.heading || ''}
                onChange={e => setEditingDivision({...editingDivision, heading: e.target.value})}
                placeholder="e.g. Find The Perfect Tile..."
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Description</label>
              <textarea 
                value={editingDivision.description || ''}
                onChange={e => setEditingDivision({...editingDivision, description: e.target.value})}
                rows={4}
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors resize-none"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Link Text</label>
              <input 
                type="text" 
                value={editingDivision.link_text || ''}
                onChange={e => setEditingDivision({...editingDivision, link_text: e.target.value})}
                placeholder="e.g. Explore Tiles"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Link URL</label>
              <input 
                type="text" 
                value={editingDivision.link_url || ''}
                onChange={e => setEditingDivision({...editingDivision, link_url: e.target.value})}
                placeholder="e.g. /tiles"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Upload Image *</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full bg-dark-black border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover"
              />
              {isUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading to Supabase Storage...</p>}
            </div>

            {/* Image Preview */}
            <div className="w-full h-32 bg-dark-black border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
              {editingDivision.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editingDivision.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <span className="text-white/20 italic text-xs">No image uploaded</span>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Display Order</label>
              <input 
                type="number" 
                value={editingDivision.display_order || 0}
                onChange={e => setEditingDivision({...editingDivision, display_order: parseInt(e.target.value) || 0})}
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-primary-gold text-dark-black font-bold uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" /> Save Division
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
          <h2 className="text-2xl font-display font-bold text-primary-gold">Product Divisions</h2>
          <p className="text-white/60 text-sm mt-1">Manage the core product division cards on the homepage.</p>
        </div>
        <button
          onClick={() => setEditingDivision({ badge_text: '', title: '', heading: '', description: '', link_text: '', link_url: '', image_url: '', display_order: divisions.length + 1 })}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Division
        </button>
      </div>

      {divisions.length === 0 ? (
        <div className="text-center py-12 border border-white/10 rounded-xl bg-dark-black/50">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Divisions Found</h3>
          <p className="text-white/50 text-sm">Add product divisions to display them on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {divisions.map((div) => (
            <div key={div.id} className="bg-dark-black border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden shrink-0 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={div.image_url} alt={div.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white/10 text-[9px] uppercase tracking-widest text-white/70 rounded">{div.badge_text}</span>
                  <span className="text-[10px] text-primary-gold uppercase tracking-widest">Order: {div.display_order}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-1">{div.title}</h3>
                <p className="text-white/80 text-sm font-semibold mb-2">{div.heading}</p>
                <p className="text-white/50 text-xs line-clamp-2">{div.description}</p>
              </div>
              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setEditingDivision(div)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(div.id)}
                  disabled={isDeleting === div.id}
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
