'use client';

import { useState } from 'react';
import { Testimonial, dbService } from '@/lib/db';
import { Edit, Trash2, Plus, X, Save, Star } from 'lucide-react';

interface TestimonialsTabProps {
  testimonials: Testimonial[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function TestimonialsTab({ testimonials, refreshData, showToast }: TestimonialsTabProps) {
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const path = `avatar_${Date.now()}_${file.name}`;
    const url = await dbService.uploadFile('products', file, path);
    if (url) {
      setEditingTestimonial(prev => prev ? { ...prev, image_url: url } : null);
    } else {
      showToast('Failed to upload client image.', 'error');
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial?.name || !editingTestimonial?.role || !editingTestimonial?.comment) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await dbService.saveTestimonial(editingTestimonial as Partial<Testimonial>);
      if (result) {
        showToast('Testimonial saved successfully');
        setEditingTestimonial(null);
        refreshData();
      } else {
        showToast('Failed to save testimonial.', 'error');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      showToast(`Error saving testimonial: ${errMsg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    setIsDeleting(id);
    try {
      const result = await dbService.deleteTestimonial(id);
      if (result.success) {
        showToast('Testimonial deleted successfully');
        refreshData();
      } else {
        showToast(`Failed to delete testimonial: ${result.error || 'Unknown database error'}`, 'error');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      showToast(`Error deleting testimonial: ${errMsg}`, 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  if (editingTestimonial) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold text-primary-gold">
            {editingTestimonial.id ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <button 
            onClick={() => setEditingTestimonial(null)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Client Name *</label>
              <input 
                type="text" 
                value={editingTestimonial.name || ''}
                onChange={e => setEditingTestimonial({...editingTestimonial, name: e.target.value})}
                placeholder="e.g. Rahul Patil"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Role / Designation *</label>
              <input 
                type="text" 
                value={editingTestimonial.role || ''}
                onChange={e => setEditingTestimonial({...editingTestimonial, role: e.target.value})}
                placeholder="e.g. Homeowner, Architect"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Rating (1 to 5 Stars) *</label>
              <select
                value={editingTestimonial.rating || 5}
                onChange={e => setEditingTestimonial({...editingTestimonial, rating: parseInt(e.target.value)})}
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                required
              >
                {[5, 4, 3, 2, 1].map(stars => (
                  <option key={stars} value={stars}>{stars} Stars</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Review Comment *</label>
              <textarea 
                value={editingTestimonial.comment || ''}
                onChange={e => setEditingTestimonial({...editingTestimonial, comment: e.target.value})}
                placeholder="Enter client review here..."
                rows={4}
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors resize-none"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Upload Client Photo / Avatar</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full bg-dark-black border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover"
              />
              {isUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading Image...</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Or Direct Photo URL</label>
              <input 
                type="text" 
                value={editingTestimonial.image_url || ''}
                onChange={e => setEditingTestimonial({...editingTestimonial, image_url: e.target.value})}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
              />
            </div>

            {/* Avatar Preview */}
            <div className="w-full h-40 bg-dark-black border border-white/5 rounded-lg flex items-center justify-center overflow-hidden relative">
              {editingTestimonial.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={editingTestimonial.image_url} 
                  alt="Avatar Preview" 
                  className="w-32 h-32 rounded-full object-cover border border-white/15"
                />
              ) : (
                <div className="text-center text-white/40">
                  <p className="text-xs">No avatar selected</p>
                  <p className="text-[10px] mt-1">Default placeholder will be used</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={() => setEditingTestimonial(null)}
              className="px-6 py-2.5 border border-white/10 hover:border-white/20 text-white text-xs uppercase tracking-widest transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-2.5 bg-gold-gradient text-dark-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] hover:bg-gold-gradient-hover flex items-center gap-2 transition-all rounded-lg"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Testimonial'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-gold-gradient">
          What Clients Say (Testimonials)
        </h2>
        <button 
          onClick={() => setEditingTestimonial({ rating: 5 })}
          className="bg-gold-gradient hover:bg-gold-gradient-hover text-dark-black px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-colors rounded-lg"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-dark-black/25 border border-white/5 rounded-lg">
            <p className="text-white/40">No testimonials found. Add one or save default list.</p>
          </div>
        ) : (
          testimonials.map(item => (
            <div key={item.id} className="p-5 bg-dark-black/40 border border-white/5 rounded-xl flex items-start gap-4 hover:border-white/10 transition-colors relative group">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-white text-base leading-none">{item.name}</h3>
                    <p className="text-primary-gold text-[10px] uppercase tracking-widest font-bold mt-1.5">{item.role}</p>
                  </div>
                  
                  {/* Star rating display */}
                  <div className="flex gap-0.5 shrink-0 bg-white/5 px-2 py-1 rounded">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-primary-gold text-primary-gold" />
                    ))}
                  </div>
                </div>

                <p className="text-white/60 text-xs font-light leading-relaxed line-clamp-3">
                  &ldquo;{item.comment}&rdquo;
                </p>
                
                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => setEditingTestimonial(item)}
                    className="p-2 bg-white/5 hover:bg-white/10 hover:text-primary-gold rounded text-white/70 transition-colors"
                    title="Edit Testimonial"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 rounded text-red-500/70 transition-colors"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
