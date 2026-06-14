import { useState } from 'react';
import { HeroSlide, dbService } from '@/lib/db';
import { Edit, Trash2, Plus, X, Save, Image as ImageIcon } from 'lucide-react';

interface HeroSlidesTabProps {
  slides: HeroSlide[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function HeroSlidesTab({ slides, refreshData, showToast }: HeroSlidesTabProps) {
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const path = `hero_${Date.now()}_${file.name}`;
    const url = await dbService.uploadFile('products', file, path);
    if (url) {
      setEditingSlide(prev => prev ? { ...prev, url: url } : null);
    } else {
      showToast('Failed to upload image.', 'error');
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide?.title || !editingSlide?.subtitle || !editingSlide?.url) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await dbService.saveHeroSlide(editingSlide as Partial<HeroSlide>);
      if (result.success) {
        showToast('Hero slide saved successfully');
        setEditingSlide(null);
        refreshData();
      } else {
        showToast(`Failed to save hero slide: ${result.error || 'Unknown database error'}. Check your Supabase RLS policies and table schema.`, 'error');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      showToast(`Error saving hero slide: ${errMsg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
    
    setIsDeleting(id);
    try {
      const result = await dbService.deleteHeroSlide(id);
      if (result.success) {
        showToast('Hero slide deleted successfully');
        refreshData();
      } else {
        showToast(`Failed to delete hero slide: ${result.error || 'Unknown database error'}. Check your Supabase RLS policies.`, 'error');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      showToast(`Error deleting hero slide: ${errMsg}`, 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  if (editingSlide) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold text-primary-gold">
            {editingSlide.id ? 'Edit Hero Slide' : 'Add New Hero Slide'}
          </h2>
          <button 
            onClick={() => setEditingSlide(null)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Main Heading</label>
              <input 
                type="text" 
                value={editingSlide.title || ''}
                onChange={e => setEditingSlide({...editingSlide, title: e.target.value})}
                placeholder="e.g. Grand Marble Luxury"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Sub-Heading Description</label>
              <input 
                type="text" 
                value={editingSlide.subtitle || ''}
                onChange={e => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                placeholder="e.g. Calacatta Glazed Vitrified Slabs"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Display Order</label>
              <input 
                type="number" 
                value={editingSlide.display_order || ''}
                onChange={e => setEditingSlide({...editingSlide, display_order: parseInt(e.target.value)})}
                placeholder="e.g. 1"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Upload Slide Image *</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full bg-dark-black border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover"
              />
              {isUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading Image...</p>}
            </div>

            {/* Image Preview */}
            <div className="w-full h-40 bg-dark-black border border-white/5 rounded-lg flex items-center justify-center overflow-hidden relative">
              {editingSlide.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={editingSlide.url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-white/40">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-xs uppercase tracking-widest font-semibold">No Image Uploaded</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Or Image URL</label>
              <input 
                type="text" 
                value={editingSlide.url || ''}
                onChange={e => setEditingSlide({...editingSlide, url: e.target.value})}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button 
              type="button"
              onClick={() => setEditingSlide(null)}
              className="px-6 py-2.5 border border-white/15 hover:bg-white/5 text-white text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-gold hover:bg-gold-gradient-hover text-dark-black text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Slide'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-primary-gold">Hero Slider</h2>
          <p className="text-white/50 text-xs mt-1">Manage slides, description text, and background images in the homepage hero carousel.</p>
        </div>
        <button 
          onClick={() => setEditingSlide({ title: '', subtitle: '', url: '', display_order: slides.length + 1 })}
          className="px-4 py-2 bg-primary-gold hover:bg-gold-gradient-hover text-dark-black text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Slides Found</h3>
          <p className="text-white/50 text-sm">Add a hero slide to display it on the homepage carousel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <div 
              key={slide.id}
              className="group bg-dark-black/40 border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-primary-gold/30 transition-all duration-300"
            >
              {/* Slide Preview Image */}
              <div className="w-full h-44 overflow-hidden relative bg-neutral-900 border-b border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={slide.url} 
                  alt={slide.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-dark-black/80 px-2.5 py-1 border border-white/10 text-primary-gold text-[9px] font-bold uppercase tracking-wider rounded">
                  Slide #{slide.display_order}
                </div>
              </div>

              {/* Slide Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-base line-clamp-1">{slide.title}</h3>
                  <p className="text-white/60 text-xs mt-1 font-light line-clamp-2">{slide.subtitle}</p>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-white/5 justify-end">
                  <button 
                    onClick={() => setEditingSlide(slide)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white hover:text-primary-gold rounded-lg transition-colors"
                    title="Edit Slide"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(slide.id)}
                    disabled={isDeleting === slide.id}
                    className="p-2 bg-white/5 hover:bg-red-500/10 text-white hover:text-red-400 rounded-lg transition-colors"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
