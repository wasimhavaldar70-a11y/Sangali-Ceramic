'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, LogIn, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/db/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-dark-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-charcoal border border-primary-gold/20 p-8 shadow-2xl rounded-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <Compass className="w-12 h-12 text-primary-gold mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold tracking-widest text-gold-gradient">ADMINISTRATOR ACCESS</h1>
          <p className="text-white/40 text-xs tracking-wider uppercase mt-1">Sangli Ceramica Premium CMS Portal</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@sangliceramica.com" 
              className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold tracking-wide rounded-lg" 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password" 
              className="w-full bg-dark-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold tracking-widest rounded-lg" 
            />
          </div>
          {authError && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-3 flex gap-2 items-center rounded-lg">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {authError}
            </p>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gold-gradient text-dark-black font-semibold uppercase tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-gold-gradient-hover transition-all hover:scale-[1.02] rounded-lg shadow-xl disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Authenticate Portal'}
          </button>
        </form>
        <Link href="/" className="block text-center text-xs text-white/40 hover:text-primary-gold mt-6 transition-colors">← Back to Public Website</Link>
      </div>
    </div>
  );
}
