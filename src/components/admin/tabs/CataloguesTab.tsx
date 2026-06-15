import { useState } from 'react';
import { Catalogue, dbService } from '@/lib/db';
import { Edit, Trash2, Plus, X, Save, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CataloguesTabProps {
  catalogues: Catalogue[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function CataloguesTab({ catalogues, refreshData, showToast }: CataloguesTabProps) {
  const [editingCatalogue, setEditingCatalogue] = useState<Partial<Catalogue> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingThumb(true);
    const file = e.target.files[0];
    const path = `catalogue_thumb_${Date.now()}_${file.name}`;
    const url = await dbService.uploadFile('products', file, path);
    if (url) {
      setEditingCatalogue(prev => prev ? { ...prev, thumbnail_url: url } : null);
    } else {
      showToast('Failed to upload thumbnail.', 'error');
    }
    setIsUploadingThumb(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingPdf(true);
    const file = e.target.files[0];
    const path = `catalogue_pdf_${Date.now()}_${file.name}`;
    const url = await dbService.uploadFile('products', file, path); // storing in products bucket since it's public
    if (url) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setEditingCatalogue(prev => prev ? { ...prev, pdf_url: url, file_size: sizeStr } : null);
    } else {
      showToast('Failed to upload PDF.', 'error');
    }
    setIsUploadingPdf(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalogue?.title) {
      showToast('Title is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await dbService.saveCatalogue(editingCatalogue as Partial<Catalogue>);
      if (saved) {
        showToast('Catalogue saved successfully');
        setEditingCatalogue(null);
        refreshData();
      } else {
        showToast('Failed to save catalogue', 'error');
      }
    } catch (err) {
      showToast('Error saving catalogue', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalogue?')) return;
    
    setIsDeleting(id);
    try {
      const success = await dbService.deleteCatalogue(id);
      if (success) {
        showToast('Catalogue deleted successfully');
        refreshData();
      } else {
        showToast('Failed to delete catalogue', 'error');
      }
    } catch (err) {
      showToast('Error deleting catalogue', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-primary-gold">Catalogues</h2>
          <p className="text-white/60 text-sm mt-1">Manage downloadable PDF catalogues and brochures.</p>
        </div>
        <button
          onClick={() => setEditingCatalogue({ title: '', pdf_url: '', thumbnail_url: '', file_size: '' })}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Catalogue
        </button>
      </div>

      {catalogues.length === 0 ? (
        <div className="text-center py-12 border border-white/10 rounded-xl bg-dark-black/50">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Catalogues Found</h3>
          <p className="text-white/50 text-sm">Add catalogues to display them on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogues.map((cat) => (
            <div key={cat.id} className="bg-dark-black border border-white/10 rounded-xl p-4 flex flex-col gap-4">
              <div className="w-full h-40 bg-[#121212] flex items-center justify-center rounded-lg overflow-hidden border border-white/10 relative">
                {cat.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.thumbnail_url} alt={cat.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <FileText className="w-12 h-12 text-white/20" />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => setEditingCatalogue(cat)}
                    className="p-2 bg-dark-black/80 hover:bg-primary-gold text-white hover:text-dark-black rounded backdrop-blur-sm transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={isDeleting === cat.id}
                    className="p-2 bg-dark-black/80 hover:bg-red-500 text-white rounded backdrop-blur-sm transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white mb-1">{cat.title}</h3>
                <p className="text-white/50 text-xs mb-2">Size: {cat.file_size || 'Unknown'}</p>
                <a 
                  href={cat.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary-gold hover:underline uppercase tracking-widest font-bold"
                >
                  View PDF Document
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingCatalogue && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-charcoal border border-primary-gold/30 p-8 shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setEditingCatalogue(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>

              <h3 className="font-display text-2xl font-bold text-gold-gradient mb-6">
                {editingCatalogue.id ? 'Edit Catalogue' : 'Add Catalogue'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Catalogue Title *</label>
                  <input 
                    type="text" 
                    value={editingCatalogue.title || ''}
                    onChange={e => setEditingCatalogue({...editingCatalogue, title: e.target.value})}
                    placeholder="e.g. 2026 Collection"
                    className="w-full bg-dark-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Upload Thumbnail Image *</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingThumb}
                    className="w-full bg-dark-black border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover"
                  />
                  {isUploadingThumb && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading Image to Storage...</p>}
                </div>
                
                <div className="w-full h-32 bg-dark-black border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                  {editingCatalogue.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editingCatalogue.thumbnail_url} alt="Preview" className="h-full object-cover" />
                  ) : (
                    <span className="text-white/20 italic text-xs">No thumbnail uploaded</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Upload PDF Document *</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={isUploadingPdf}
                    className="w-full bg-dark-black border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-primary-gold transition-colors rounded-lg text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover"
                  />
                  {isUploadingPdf && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading PDF to Storage...</p>}
                  {editingCatalogue.pdf_url && !isUploadingPdf && (
                    <p className="text-[10px] text-green-400 mt-1 uppercase tracking-wider font-bold">PDF Uploaded ({editingCatalogue.file_size})</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving || isUploadingThumb || isUploadingPdf}
                  className="w-full py-3 mt-6 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider flex justify-center items-center gap-2 rounded-lg hover:shadow-lg hover:shadow-primary-gold/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Catalogue'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
