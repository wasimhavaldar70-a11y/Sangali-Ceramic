import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Project, dbService } from '@/lib/supabase';

interface ProjectsTabProps {
  projects: Project[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function ProjectsTab({ projects, refreshData, showToast }: ProjectsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const openForm = (proj: Project | null = null) => {
    if (proj) {
      setEditingProject(proj);
      setTitle(proj.title);
      setCategory(proj.category);
      setLocation(proj.location);
      setYear(proj.year);
      setImage(proj.image);
      setDescription(proj.description || '');
    } else {
      setEditingProject(null);
      setTitle('');
      setCategory('Residential');
      setLocation('');
      setYear(new Date().getFullYear());
      setImage('');
      setDescription('');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const projData: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/ /g, '-'),
      category,
      location,
      year,
      image,
      description,
      status: 'active'
    };
    
    try {
      await dbService.saveProject(projData);
      setModalOpen(false);
      refreshData();
      showToast('Project saved successfully.');
    } catch (err) {
      showToast('Error saving project.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this portfolio project?')) {
      try {
        await dbService.deleteProject(id);
        refreshData();
        showToast('Project deleted successfully.');
      } catch (err) {
        showToast('Error deleting project.', 'error');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary-gold" /> Portfolio Galleries
        </h2>
        <button
          onClick={() => openForm(null)}
          className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gold-gradient-hover rounded shadow-lg shadow-primary-gold/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
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
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/40 italic">No projects found. Create one above.</td>
              </tr>
            ) : projects.map(proj => (
              <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-black overflow-hidden border border-white/10 shrink-0 rounded">
                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-white text-sm">{proj.title}</span>
                </td>
                <td className="p-4">{proj.category}</td>
                <td className="p-4">{proj.location}</td>
                <td className="p-4">{proj.year}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openForm(proj)} className="text-white/60 hover:text-primary-gold transition-colors p-1" aria-label="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(proj.id)} className="text-white/60 hover:text-red-400 transition-colors p-1" aria-label="Delete">
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
              className="relative w-full max-w-lg bg-charcoal border border-primary-gold/30 p-8 shadow-2xl rounded-xl"
            >
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>

              <h3 className="font-display text-2xl font-bold text-gold-gradient mb-6">
                {editingProject ? 'Edit Portfolio Project' : 'Add New Project'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Project Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Category *</label>
                    <input type="text" required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" placeholder="e.g. Residential, Commercial" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Location *</label>
                    <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Year *</label>
                    <input type="number" required value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Featured Image URL *</label>
                    <input type="text" required value={image} onChange={e => setImage(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Description</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none resize-none"></textarea>
                </div>

                <button type="submit" className="w-full py-3 mt-4 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider flex justify-center items-center gap-2 rounded shadow-lg hover:shadow-primary-gold/20 transition-all hover:-translate-y-0.5">
                  <Save className="w-4 h-4" /> Save Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
