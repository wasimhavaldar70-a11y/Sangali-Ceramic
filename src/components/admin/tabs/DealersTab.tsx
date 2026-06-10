import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Dealer, dbService } from '@/lib/supabase';

interface DealersTabProps {
  dealers: Dealer[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export function DealersTab({ dealers, refreshData, showToast }: DealersTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);

  const [dName, setDName] = useState('');
  const [dState, setDState] = useState('');
  const [dCity, setDCity] = useState('');
  const [dAddress, setDAddress] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dEmail, setDEmail] = useState('');

  const openForm = (dealer: Dealer | null = null) => {
    if (dealer) {
      setEditingDealer(dealer);
      setDName(dealer.name);
      setDState(dealer.state);
      setDCity(dealer.city);
      setDAddress(dealer.address);
      setDPhone(dealer.phone);
      setDEmail(dealer.email || '');
    } else {
      setEditingDealer(null);
      setDName('');
      setDState('Maharashtra');
      setDCity('');
      setDAddress('');
      setDPhone('');
      setDEmail('');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dealerData: Dealer = {
      id: editingDealer ? editingDealer.id : `deal-${Date.now()}`,
      name: dName,
      state: dState,
      city: dCity,
      address: dAddress,
      phone: dPhone,
      email: dEmail,
      coords: editingDealer?.coords || { lat: 18.5204, lng: 73.8567 }
    };

    try {
      await dbService.saveDealer(dealerData);
      setModalOpen(false);
      refreshData();
      showToast('Showroom saved successfully.');
    } catch (err) {
      showToast('Error saving showroom.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this dealer outlet registration?')) {
      try {
        await dbService.deleteDealer(id);
        refreshData();
        showToast('Showroom deleted successfully.');
      } catch (err) {
        showToast('Error deleting showroom.', 'error');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-gold" /> Dealer Network
        </h2>
        <button
          onClick={() => openForm(null)}
          className="px-4 py-2 bg-gold-gradient text-dark-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gold-gradient-hover rounded shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Register Showroom
        </button>
      </div>

      <div className="overflow-x-auto border border-white/5 rounded-lg bg-dark-black/40 backdrop-blur-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-dark-black/60 border-b border-white/10 text-white/60 uppercase tracking-wider font-semibold">
              <th className="p-4">Showroom Name</th>
              <th className="p-4">State</th>
              <th className="p-4">City</th>
              <th className="p-4">Phone</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dealers.map(deal => (
              <tr key={deal.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white">{deal.name}</td>
                <td className="p-4">{deal.state}</td>
                <td className="p-4">{deal.city}</td>
                <td className="p-4">{deal.phone}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openForm(deal)} className="text-white/60 hover:text-primary-gold p-1 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(deal.id)} className="text-white/60 hover:text-red-400 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                {editingDealer ? 'Edit Showroom' : 'Register Showroom'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Name *</label>
                    <input type="text" required value={dName} onChange={e => setDName(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Phone *</label>
                    <input type="tel" required value={dPhone} onChange={e => setDPhone(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">State *</label>
                    <input type="text" required value={dState} onChange={e => setDState(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">City *</label>
                    <input type="text" required value={dCity} onChange={e => setDCity(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-white/50 mb-1">Email</label>
                    <input type="email" value={dEmail} onChange={e => setDEmail(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold rounded outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-white/50 mb-1">Address *</label>
                  <textarea rows={2} required value={dAddress} onChange={e => setDAddress(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white focus:border-primary-gold resize-none rounded outline-none"></textarea>
                </div>
                <button type="submit" className="w-full py-3 mt-4 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider flex justify-center items-center gap-2 rounded shadow-lg hover:-translate-y-0.5 transition-all">
                  <Save className="w-4 h-4" /> Save Showroom
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
