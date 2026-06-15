'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, Edit2, Trash2, X, Save, Search, AlertTriangle } from 'lucide-react';
import { Project, dbService } from '@/lib/db';

interface ProjectsTabProps {
  projects: Project[];
  products: import('@/lib/db').Product[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function ProjectsTab({ projects, products, refreshData, showToast }: ProjectsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  const openForm = (proj: Project | null = null) => {
    if (proj) {
      setEditingProject(proj);
      setTitle(proj.title || '');
      setCategory(proj.category || '');
      setLocation(proj.location || '');
      setYear(proj.year || new Date().getFullYear());
      setImage(proj.image || '');
      setDescription(proj.description || '');
      setGalleryImages([]);
      setProductIds([]);
    } else {
      setEditingProject(null);
      setTitle('');
      setCategory('Villas');
      setLocation('');
      setYear(new Date().getFullYear());
      setImage('');
      setDescription('');
      setGalleryImages([]);
      setProductIds([]);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      showToast('Please upload a featured image for the project.', 'error');
      return;
    }
    const projData: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      title,
      category: category as 'Villas' | 'Apartments' | 'Hotels' | 'Offices' | 'Restaurants',
      location,
      year,
      image,
      description,
    };
    
    try {
      const saved = await dbService.saveProject(projData);
      if (saved) {
        setModalOpen(false);
        refreshData();
        showToast('Project saved successfully.');
      } else {
        showToast('Error saving project to database.', 'error');
      }
    } catch (err) {
      showToast('Error saving project.', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const path = `project_${Date.now()}_${file.name}`;
    try {
      const url = await dbService.uploadFile('projects', file, path);
      if (url) {
        setImage(url);
        showToast('Image uploaded successfully.');
      } else {
        showToast('Error uploading image to storage. Check bucket permissions.', 'error');
      }
    } catch (err) {
      showToast('Error uploading image.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsGalleryUploading(true);
    
    const newImages: string[] = [];
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const path = `project_gallery_${Date.now()}_${i}_${file.name}`;
        const url = await dbService.uploadFile('projects', file, path);
        if (url) newImages.push(url);
      }
      
      if (newImages.length > 0) {
        setGalleryImages(prev => [...prev, ...newImages]);
        showToast(`Uploaded ${newImages.length} gallery images.`);
      }
    } catch (err) {
      showToast('Error uploading gallery images.', 'error');
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleProduct = (pid: string) => {
    setProductIds(prev => 
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      const success = await dbService.deleteProject(confirmDelete);
      if (success) {
        refreshData();
        showToast('Project deleted successfully.');
      } else {
        showToast('Error deleting project from database.', 'error');
      }
    } catch (err) {
      showToast('Error deleting project.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary-gold" /> Portfolio Galleries
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-dark-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary-gold transition-colors"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-dark-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary-gold"
          >
            <option value="All">All Categories</option>
            <option value="Villas">Villas</option>
            <option value="Apartments">Apartments</option>
            <option value="Hotels">Hotels</option>
            <option value="Offices">Offices</option>
            <option value="Restaurants">Restaurants</option>
          </select>
          <button
            onClick={() => openForm(null)}
            className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-gold-gradient-hover rounded-lg shadow-lg shadow-primary-gold/20 transition-all hover:scale-105 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-white/5 rounded-lg bg-dark-black/40 backdrop-blur-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-dark-black/60 border-b border-white/10 text-white/60 uppercase tracking-wider font-semibold">
              <th className="p-4">Project Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Year</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/40 italic">No projects found matching criteria.</td>
              </tr>
            ) : filteredProjects.map(proj => (
              <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-black overflow-hidden border border-white/10 shrink-0 rounded relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-white text-sm">{proj.title}</span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/80 rounded text-[10px] uppercase">{proj.category}</span>
                </td>
                <td className="p-4 text-white/80">{proj.location}</td>
                <td className="p-4 font-mono text-white/50">{proj.year}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openForm(proj)} className="text-white/60 hover:text-primary-gold transition-colors p-1" aria-label="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete(proj.id)} className="text-white/60 hover:text-red-400 transition-colors p-1" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-charcoal border border-primary-gold/30 p-8 shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>

              <h3 className="font-display text-2xl font-bold text-gold-gradient mb-6">
                {editingProject ? 'Edit Portfolio Project' : 'Add New Project'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Project Title *</label>
                      <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block uppercase tracking-wider text-white/50 mb-1">Category *</label>
                        <select
                          required
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none"
                        >
                          <option value="Villas">Villas</option>
                          <option value="Apartments">Apartments</option>
                          <option value="Hotels">Hotels</option>
                          <option value="Offices">Offices</option>
                          <option value="Restaurants">Restaurants</option>
                        </select>
                      </div>
                      <div>
                        <label className="block uppercase tracking-wider text-white/50 mb-1">Year *</label>
                        <input type="number" required value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Location *</label>
                      <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Upload Featured Image *</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload} 
                        disabled={isUploading}
                        className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover" 
                      />
                      {isUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading to Supabase Storage...</p>}
                    </div>
                    {/* Image Preview */}
                    <div className="w-full h-24 bg-dark-black border border-white/5 rounded flex items-center justify-center overflow-hidden relative">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <span className="text-white/20 italic">No image preview</span>
                      )}
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Description</label>
                      <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none resize-none"></textarea>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Upload Additional Gallery Images</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload} 
                        disabled={isGalleryUploading}
                        className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" 
                      />
                      {isGalleryUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading gallery to Supabase...</p>}
                      
                      {galleryImages.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {galleryImages.map((img, idx) => (
                            <div key={idx} className="relative w-full aspect-square bg-dark-black border border-white/10 rounded overflow-hidden group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="Gallery Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute inset-0 bg-red-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <label className="block uppercase tracking-wider text-white/50 mb-2">Products Used in this Project</label>
                  <div className="max-h-48 overflow-y-auto bg-dark-black border border-white/10 rounded p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {products.map(prod => (
                      <label key={prod.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors ${productIds.includes(prod.id) ? 'bg-primary-gold/10 border-primary-gold/50' : 'bg-charcoal border-white/5 hover:border-white/20'}`}>
                        <input 
                          type="checkbox" 
                          checked={productIds.includes(prod.id)}
                          onChange={() => toggleProduct(prod.id)}
                          className="accent-primary-gold"
                        />
                        <div className="flex items-center gap-2 overflow-hidden">
                          {prod.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={prod.images[0]} alt="" className="w-6 h-6 object-cover rounded shrink-0" />
                          )}
                          <span className="text-[10px] text-white/90 truncate">{prod.name} ({prod.sku})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-3 mt-6 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider flex justify-center items-center gap-2 rounded shadow-lg hover:shadow-primary-gold/20 transition-all hover:-translate-y-0.5">
                  <Save className="w-4 h-4" /> Save Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-dark-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-charcoal border border-red-500/30 p-6 rounded-xl max-w-sm w-full text-center shadow-2xl"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-80" />
              <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
              <p className="text-xs text-white/60 mb-6">Are you sure you want to permanently delete this portfolio project from the gallery?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-dark-black border border-white/10 text-white/80 rounded hover:bg-white/5 transition-colors text-xs uppercase tracking-wider font-semibold">Cancel</button>
                <button onClick={executeDelete} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors text-xs uppercase tracking-wider font-semibold">Delete Permanently</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
