'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Edit2, Trash2, X, Save, Search, AlertTriangle } from 'lucide-react';
import { Product, dbService } from '@/lib/supabase';

interface ProductsTabProps {
  products: Product[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function ProductsTab({ products, refreshData, showToast }: ProductsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFinish, setFilterFinish] = useState('All');

  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pSize, setPSize] = useState('');
  const [pFinish, setPFinish] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pImages, setPImages] = useState<string[]>([]);
  const [pDesc, setPDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const openForm = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name);
      setPSku(prod.sku);
      setPSize(prod.size);
      setPFinish(prod.finish);
      setPPrice(prod.price);
      setPImages(prod.images || []);
      setPDesc(prod.description || '');
    } else {
      setEditingProduct(null);
      setPName('');
      setPSku(`PR-${Math.floor(100 + Math.random() * 900)}`);
      setPSize('600x1200 mm');
      setPFinish('Glossy');
      setPPrice(1200);
      setPImages([]);
      setPDesc('');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: pName,
      slug: pName.toLowerCase().replace(/ /g, '-'),
      sku: pSku,
      size: pSize,
      finish: pFinish,
      price: Number(pPrice),
      category_id: pFinish.toLowerCase() === 'matte' ? 'cat-matte' : 'cat-glossy',
      collection_id: pFinish.toLowerCase() === 'matte' ? 'col-matte' : 'col-marble',
      images: pImages,
      description: pDesc,
      status: 'active',
      tech_specs: editingProduct?.tech_specs || { water_absorption: '< 0.05%', hardness: '6 Mohs', thickness: '9.5 mm' }
    };

    try {
      await dbService.saveProduct(productData);
      setModalOpen(false);
      refreshData();
      showToast('Product saved successfully.');
    } catch (err) {
      showToast('Error saving product.', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const newImages = [...pImages];
    for (const file of Array.from(e.target.files)) {
      // create a unique path
      const path = `product_${Date.now()}_${file.name}`;
      const url = await dbService.uploadFile('products', file, path);
      if (url) {
        newImages.push(url);
      }
    }
    
    setPImages(newImages);
    setIsUploading(false);
  };
  
  const removeImage = (idx: number) => {
    setPImages(pImages.filter((_, i) => i !== idx));
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await dbService.deleteProduct(confirmDelete);
      refreshData();
      showToast('Product deleted successfully.');
    } catch (err) {
      showToast('Error deleting product.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFinish = filterFinish === 'All' || p.finish.toLowerCase() === filterFinish.toLowerCase();
    return matchesSearch && matchesFinish;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary-gold" /> Catalogue Tiles
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search tiles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-dark-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary-gold w-full sm:w-48 transition-colors"
            />
          </div>
          <select 
            value={filterFinish}
            onChange={(e) => setFilterFinish(e.target.value)}
            className="px-3 py-2 bg-dark-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary-gold"
          >
            <option value="All">All Finishes</option>
            <option value="Glossy">Glossy</option>
            <option value="Matte">Matte</option>
            <option value="Satin">Satin</option>
          </select>
          <button
            onClick={() => openForm(null)}
            className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-gold-gradient-hover rounded-lg shadow-lg shadow-primary-gold/20 transition-all hover:scale-105 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Premium Tile
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-white/5 rounded-lg bg-dark-black/40 backdrop-blur-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-dark-black/60 border-b border-white/10 text-white/60 uppercase tracking-wider font-semibold">
              <th className="p-4">Tile</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Dimensions</th>
              <th className="p-4">Finish</th>
              <th className="p-4 text-right">Price (Sq.Ft)</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-white/40 italic">No products found matching your criteria.</td></tr>
            ) : filteredProducts.map(prod => (
              <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-black overflow-hidden border border-white/10 shrink-0 rounded">
                    <Image src={prod.images[0]} alt={prod.name} fill className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-white text-sm">{prod.name}</span>
                </td>
                <td className="p-4 font-mono text-white/50">{prod.sku}</td>
                <td className="p-4">{prod.size}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 border text-[9px] uppercase font-semibold rounded ${
                    prod.finish.toLowerCase() === 'glossy' ? 'bg-primary-gold/10 border-primary-gold/30 text-primary-gold' : 
                    prod.finish.toLowerCase() === 'matte' ? 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400' : 'bg-dark-black border-white/20 text-white/80'
                  }`}>
                    {prod.finish}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-primary-gold">₹{prod.price}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openForm(prod)} className="text-white/60 hover:text-primary-gold p-1 transition-colors" title="Edit Product"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(prod.id)} className="text-white/60 hover:text-red-400 p-1 transition-colors" title="Delete Product"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRODUCT FORM MODAL */}
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
                {editingProduct ? 'Edit Catalogue Slab' : 'Add Premium Design'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Product Name *</label>
                      <input type="text" required value={pName} onChange={e => setPName(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">SKU Code *</label>
                      <input type="text" required value={pSku} onChange={e => setPSku(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block uppercase tracking-wider text-white/50 mb-1">Slab Size *</label>
                        <input type="text" required value={pSize} onChange={e => setPSize(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                      </div>
                      <div>
                        <label className="block uppercase tracking-wider text-white/50 mb-1">Price/Sq.Ft *</label>
                        <input type="number" required value={pPrice} onChange={e => setPPrice(Number(e.target.value))} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Finish *</label>
                      <select value={pFinish} onChange={e => setPFinish(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none">
                        <option value="Glossy">Glossy</option>
                        <option value="Matte">Matte</option>
                        <option value="Satin">Satin</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Upload Images (Supabase)</label>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageUpload} 
                        disabled={isUploading}
                        className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-primary-gold file:text-dark-black hover:file:bg-gold-gradient-hover" 
                      />
                      {isUploading && <p className="text-[10px] text-primary-gold mt-1 animate-pulse">Uploading to Supabase Storage...</p>}
                    </div>
                    {/* Image Preview */}
                    {pImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {pImages.map((img, idx) => (
                          <div key={idx} className="relative w-full h-20 bg-dark-black border border-white/5 rounded flex items-center justify-center overflow-hidden group">
                            <Image src={img} alt={`Preview ${idx}`} fill className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => removeImage(idx)}
                              className="absolute inset-0 bg-dark-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white/80 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <label className="block uppercase tracking-wider text-white/50 mb-1">Description</label>
                      <textarea rows={3} value={pDesc} onChange={e => setPDesc(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold resize-none rounded outline-none"></textarea>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 mt-6 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider flex justify-center items-center gap-2 rounded shadow-lg hover:-translate-y-0.5 transition-all">
                  <Save className="w-4 h-4" /> Save Premium Tile
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
              <h3 className="text-lg font-bold text-white mb-2">Delete Product?</h3>
              <p className="text-xs text-white/60 mb-6">This action cannot be undone. Are you sure you want to permanently delete this premium product from the catalogue?</p>
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
