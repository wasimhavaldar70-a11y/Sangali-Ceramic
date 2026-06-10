'use client';
import { motion } from 'framer-motion';
import { Users, Phone, Mail, BarChart3, ShieldAlert, Save, CheckCircle, Clock } from 'lucide-react';
import { Lead, dbService } from '@/lib/supabase';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- LEADS TAB ---
export function LeadsTab({ leads, refreshData, showToast }: { leads: Lead[], refreshData: () => void, showToast: (msg: string, type?: 'success'|'error') => void }) {
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
  
  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'new' ? 'contacted' : currentStatus === 'contacted' ? 'closed' : 'new';
    try {
      await dbService.updateLeadStatus(id, nextStatus as 'new' | 'contacted' | 'closed');
      refreshData();
      showToast(`Lead marked as ${nextStatus}.`);
    } catch {
      showToast('Failed to update lead.', 'error');
    }
  };

  const filteredLeads = leads.filter(l => filter === 'all' || l.status === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-gold" /> Customer Lead Inquiries
        </h2>
        <div className="flex gap-2 bg-dark-black/50 p-1 border border-white/10 rounded-lg">
          {['all', 'new', 'contacted', 'closed'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f as 'all' | 'new' | 'contacted' | 'closed')}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold rounded transition-colors ${filter === f ? 'bg-primary-gold text-dark-black' : 'text-white/50 hover:text-white'}`}
            >
              {f}
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
              className={`p-5 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 hover:shadow-lg backdrop-blur-sm ${
                lead.status === 'new' ? 'border-yellow-500/30 bg-yellow-500/5' : lead.status === 'contacted' ? 'border-blue-500/20 bg-blue-500/5' : 'border-white/5 bg-dark-black/60'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-white text-sm">{lead.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${lead.type === 'quote' ? 'bg-primary-gold/20 text-primary-gold' : 'bg-white/10 text-white/80'}`}>{lead.type}</span>
                  <span className="text-[10px] text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(lead.created_at).toLocaleString()}</span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed max-w-2xl bg-black/20 p-3 rounded border border-white/5">{lead.message || 'No message provided.'}</p>
                <div className="flex gap-4 text-[10px] text-white/50 pt-1 font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-primary-gold" /> {lead.phone}</span>
                  {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary-gold" /> {lead.email}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 w-full md:w-40">
                <div className="text-[10px] uppercase tracking-widest text-center mb-1 text-white/40">Status: <span className="font-bold text-white">{lead.status}</span></div>
                <button
                  onClick={() => toggleStatus(lead.id, lead.status)}
                  className={`w-full px-3 py-2 rounded text-[10px] uppercase font-bold tracking-widest border transition-colors flex items-center justify-center gap-2 ${
                    lead.status === 'new' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/25' : lead.status === 'contacted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/25' : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/25'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  {lead.status === 'new' ? 'Mark Contacted' : lead.status === 'contacted' ? 'Close Lead' : 'Reopen Lead'}
                </button>
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
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await dbService.verifyAdminPasscode(current);
    if (!isValid) return showToast('Current passcode is incorrect.', 'error');
    if (newPass !== confirm) return showToast('New passcodes do not match.', 'error');
    if (newPass.length < 5) return showToast('Passcode must be at least 5 characters.', 'error');
    
    await dbService.updateAdminPasscode(newPass);
    showToast('Passcode updated successfully.');
    setCurrent(''); setNewPass(''); setConfirm('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-lg">
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-gold-gradient mb-6 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-primary-gold" /> Admin Security Profile
      </h2>
      <div className="bg-dark-black/40 border border-white/5 p-6 rounded-xl backdrop-blur-sm shadow-xl">
        <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Change Access Passcode</h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div><label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Current Passcode</label><input type="password" required value={current} onChange={e => setCurrent(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:border-primary-gold rounded outline-none" /></div>
          <div><label className="block text-xs uppercase tracking-widest text-white/50 mb-1">New Passcode</label><input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:border-primary-gold rounded outline-none" /></div>
          <div><label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Confirm New Passcode</label><input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full bg-dark-black border border-white/10 px-3 py-2 text-white text-xs focus:border-primary-gold rounded outline-none" /></div>
          <button type="submit" className="w-full py-3 mt-2 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs hover:bg-gold-gradient-hover flex justify-center items-center gap-1.5 rounded transition-all hover:scale-[1.02] shadow-lg"><Save className="w-4 h-4" /> Update Passcode</button>
        </form>
      </div>
    </motion.div>
  );
}

// --- ANALYTICS TAB ---
export function AnalyticsTab({ data }: { data: { products: number, dealers: number, newLeads: number, closedLeads: number } }) {
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Catalogue Slabs', value: `${data.products} Designs`, color: 'text-primary-gold' },
          { label: 'Showroom Outlets', value: `${data.dealers} Locations`, color: 'text-primary-gold' },
          { label: 'New Customer Inquiries', value: `${data.newLeads} Active`, color: 'text-yellow-400' },
          { label: 'Closed Deals', value: `${data.closedLeads} Completed`, color: 'text-green-400' }
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
