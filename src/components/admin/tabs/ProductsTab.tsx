import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Product, dbService } from '@/lib/supabase';

interface ProductsTabProps {
  products: Product[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function ProductsTab({ products, refreshData, showToast }: ProductsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pSize, setPSize] = useState('');
  const [pFinish, setPFinish] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');

  const openForm = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name);
      setPSku(prod.sku);
      setPSize(prod.size);
      setPFinish(prod.finish);
      setPPrice(prod.price);
      setPImage(prod.images[0] || '');
      setPDesc(prod.description || '');
    } else {
      setEditingProduct(null);
      setPName('');
      setPSku(`PR-${Math.floor(100 + Math.random() * 900)}`);
      setPSize('600x1200 mm');
      setPFinish('Glossy');
      setPPrice(1200);
      setPImage('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80');
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
      images: [pImage],
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

  const handleDelete = async (id: string) => {
    if (confirm('Delete this premium product?')) {
      try {
        await dbService.deleteProduct(id);
        refreshData();
        showToast('Product deleted successfully.');
      } catch (err) {
        showToast('Error deleting product.', 'error');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary-gold" /> Catalogue Tiles
        </h2>
        <button
          onClick={() => openForm(null)}
          className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gold-gradient-hover rounded shadow-lg shadow-primary-gold/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add Premium Tile
        </button>
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
            {products.map(prod => (
              <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-black overflow-hidden border border-white/10 shrink-0 rounded">
                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-white text-sm">{prod.name}</span>
                </td>
                <td className="p-4 font-mono text-white/50">{prod.sku}</td>
                <td className="p-4">{prod.size}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-dark-black border border-primary-gold/20 text-primary-gold text-[9px] uppercase font-semibold rounded">
                    {prod.finish}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-primary-gold">₹{prod.price}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openForm(prod)} className="text-white/60 hover:text-primary-gold p-1 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(prod.id)} className="text-white/60 hover:text-red-400 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                {editingProduct ? 'Edit Catalogue Slab' : 'Add Premium Design'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Product Name *</label>
                    <input type="text" required value={pName} onChange={e => setPName(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">SKU Code *</label>
                    <input type="text" required value={pSku} onChange={e => setPSku(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Slab Size *</label>
                    <input type="text" required value={pSize} onChange={e => setPSize(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Finish *</label>
                    <select value={pFinish} onChange={e => setPFinish(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none">
                      <option value="Glossy">Glossy</option>
                      <option value="Matte">Matte</option>
                      <option value="Satin">Satin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Price/Sq.Ft *</label>
                    <input type="number" required value={pPrice} onChange={e => setPPrice(Number(e.target.value))} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Image URL *</label>
                  <input type="text" required value={pImage} onChange={e => setPImage(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Description</label>
                  <textarea rows={3} value={pDesc} onChange={e => setPDesc(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold resize-none rounded outline-none"></textarea>
                </div>
                <button type="submit" className="w-full py-3 mt-4 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider flex justify-center items-center gap-2 rounded shadow-lg hover:-translate-y-0.5 transition-all">
                  <Save className="w-4 h-4" /> Save Premium Tile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
