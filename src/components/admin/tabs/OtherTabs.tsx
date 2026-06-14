'use client';
import { motion } from 'framer-motion';
import { Users, Phone, Mail, BarChart3, ShieldAlert, Clock, Trash2 } from 'lucide-react';
import { Lead, dbService } from '@/lib/db';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- LEADS TAB ---
export function LeadsTab({ leads, refreshData, showToast }: { leads: Lead[], refreshData: () => void, showToast: (msg: string, type?: 'success'|'error') => void }) {
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'quotation_sent' | 'negotiation' | 'won' | 'lost'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesTemp, setNotesTemp] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const updateStatus = async (id: string, nextStatus: Lead['status']) => {
    try {
      await dbService.updateLeadStatus(id, nextStatus);
      refreshData();
      showToast(`Lead marked as ${nextStatus.replace('_', ' ')}.`);
    } catch {
      showToast('Failed to update lead.', 'error');
    }
  };

  const saveNotes = async (id: string) => {
    try {
      // Just update notes without changing status
      const lead = leads.find(l => l.id === id);
      if (lead) {
        await dbService.updateLeadStatus(id, lead.status, notesTemp);
        refreshData();
        showToast('Notes updated successfully.');
      }
      setEditingNotesId(null);
    } catch {
      showToast('Failed to update notes.', 'error');
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    setIsDeleting(id);
    try {
      const result = await dbService.deleteLead(id);
      if (result.success) {
        showToast('Enquiry deleted successfully.');
        refreshData();
      } else {
        showToast(`Failed to delete enquiry: ${result.error || 'Unknown database error'}. Check your Supabase RLS policies.`, 'error');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      showToast(`Error deleting enquiry: ${errMsg}`, 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredLeads = leads.filter(l => filter === 'all' || l.status === filter);

  const statuses: Lead['status'][] = ['new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-gold" /> Customer Pipeline
        </h2>
        <div className="flex flex-wrap gap-2 bg-dark-black/50 p-1 border border-white/10 rounded-lg">
          {(['all', ...statuses] as const).map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold rounded transition-colors ${filter === f ? 'bg-primary-gold text-dark-black' : 'text-white/50 hover:text-white'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 bg-dark-black/25 border border-white/5 rounded-lg">
            <p className="text-white/40">No leads found for this filter.</p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={lead.id}
              className={`p-5 border rounded-lg flex flex-col justify-between items-start gap-4 transition-all duration-300 hover:shadow-lg backdrop-blur-sm ${
                lead.status === 'new' ? 'border-yellow-500/30 bg-yellow-500/5' : 
                lead.status === 'won' ? 'border-green-500/30 bg-green-500/5' : 
                lead.status === 'lost' ? 'border-red-500/30 bg-red-500/5' : 
                'border-white/10 bg-dark-black/60'
              }`}
            >
              <div className="w-full flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-white text-sm">{lead.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${lead.type === 'quote' ? 'bg-primary-gold/20 text-primary-gold' : 'bg-white/10 text-white/80'}`}>{lead.type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(lead.created_at).toLocaleString()}</span>
                  </div>
                  {lead.message && (
                    <p className="text-white/70 text-xs leading-relaxed max-w-2xl bg-black/20 p-3 rounded border border-white/5">{lead.message}</p>
                  )}
                  <div className="flex gap-4 text-[10px] text-white/50 pt-1 font-mono">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-primary-gold" /> {lead.phone}</span>
                    {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary-gold" /> {lead.email}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-48 bg-black/40 p-3 rounded border border-white/5 justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest mb-1 text-white/40">Status Pipeline:</div>
                    <select 
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as Lead['status'])}
                      className="w-full bg-dark-black border border-white/10 text-xs text-white p-2 rounded focus:border-primary-gold outline-none uppercase tracking-wider font-semibold"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    disabled={isDeleting === lead.id}
                    className="w-full mt-2 py-1.5 border border-red-500/20 text-red-500/80 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 rounded text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Enquiry
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="w-full pt-3 border-t border-white/5 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1">
                    Internal Notes
                  </span>
                  {editingNotesId !== lead.id && (
                    <button onClick={() => { setEditingNotesId(lead.id); setNotesTemp(lead.notes || ''); }} className="text-[10px] uppercase tracking-widest text-primary-gold hover:text-white transition-colors">
                      Edit
                    </button>
                  )}
                </div>
                
                {editingNotesId === lead.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea 
                      value={notesTemp} 
                      onChange={(e) => setNotesTemp(e.target.value)} 
                      placeholder="Add negotiation details, addresses, etc..."
                      className="w-full bg-dark-black border border-primary-gold/50 rounded p-3 text-xs text-white h-24 focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingNotesId(null)} className="text-[10px] uppercase text-white/50 hover:text-white px-3 py-1">Cancel</button>
                      <button onClick={() => saveNotes(lead.id)} className="bg-primary-gold text-dark-black text-[10px] uppercase font-bold px-3 py-1 rounded">Save Notes</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/60 bg-white/5 p-3 rounded italic min-h-[40px]">
                    {lead.notes || 'No notes added yet.'}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// --- PROFILE TAB ---
export function ProfileTab({ showToast }: { showToast: (msg: string, type?: 'success'|'error') => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-lg">
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient mb-6 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-primary-gold" /> Admin Security Profile
      </h2>
      <div className="bg-dark-black/40 border border-white/5 p-6 rounded-xl backdrop-blur-sm shadow-xl">
        <p className="text-sm text-white/60">Passcode management has been migrated to Supabase Auth. Please use the Supabase Dashboard to reset your password.</p>
      </div>
    </motion.div>
  );
}

// --- ANALYTICS TAB ---
export function AnalyticsTab({ data }: { data: { products: number, dealers: number, newLeads: number } }) {
  // Mock timeseries data for visual flair
  const mockChartData = [
    { name: 'Mon', leads: 4, sales: 2400 },
    { name: 'Tue', leads: 7, sales: 1398 },
    { name: 'Wed', leads: 5, sales: 9800 },
    { name: 'Thu', leads: 11, sales: 3908 },
    { name: 'Fri', leads: 9, sales: 4800 },
    { name: 'Sat', leads: 14, sales: 3800 },
    { name: 'Sun', leads: 19, sales: 4300 },
  ];

  const mockCategoryData = [
    { name: 'Marble', count: 12 },
    { name: 'Stone', count: 8 },
    { name: 'Wooden', count: 5 },
    { name: 'Glossy', count: 15 },
    { name: 'Matte', count: 10 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <h2 className="font-display text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-gold-gradient">
        <BarChart3 className="w-5 h-5 text-primary-gold" /> System Analytics
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Catalogue Slabs', value: `${data.products} Designs`, color: 'text-primary-gold' },
          { label: 'Showroom Outlets', value: `${data.dealers} Locations`, color: 'text-primary-gold' },
          { label: 'New Customer Inquiries', value: `${data.newLeads} Active`, color: 'text-yellow-400' }
        ].map(stat => (
          <motion.div whileHover={{ scale: 1.02 }} key={stat.label} className="bg-dark-black/40 p-5 border border-white/5 rounded-xl shadow-lg backdrop-blur-sm">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">{stat.label}</span>
            <span className={`text-3xl font-bold font-display ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-dark-black/40 border border-white/5 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="text-xs uppercase tracking-widest text-white/50 mb-6 font-semibold">Weekly Lead Generation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark-black/40 border border-white/5 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="text-xs uppercase tracking-widest text-white/50 mb-6 font-semibold">Products by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategoryData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} hide />
                <YAxis dataKey="name" type="category" stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
