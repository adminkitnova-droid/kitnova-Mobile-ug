import React, { useState } from 'react';
import { Shield, Truck, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface CustomerAuthProps { onSuccess: (customer: { name: string; email: string; phone: string }) => void; onClose?: () => void; }
export const CustomerAuthModal: React.FC<CustomerAuthProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('David Mukasa');
  const [email, setEmail] = useState('david.mukasa@vishcom.co.ug');
  const [phone, setPhone] = useState('+256 752 443 890');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'com.kitnova.jersey://auth/callback', data: { full_name: name, phone, role: 'customer' } } });
        if (error) throw error; alert('Check email - link will open KITNOVA app');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess({ name: data.user?.user_metadata?.full_name || name, email: data.user?.email || email, phone: data.user?.user_metadata?.phone || phone });
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="text-center"><h2 className="text-lg font-bold text-white">{isRegister ? 'Create KITNOVA Account' : 'Customer Account Login'}</h2></div>
        {error && <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex gap-2"><AlertCircle className="w-4 h-4"/><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" placeholder="Full Name"/>}
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" />
          <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" placeholder="Password"/>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold">{loading ? 'Processing...' : isRegister ? 'Complete Registration' : 'Sign In'}</button>
        </form>
        <div className="text-center text-xs text-slate-400"><button onClick={() => setIsRegister(!isRegister)} className="text-[#D4A029] font-bold">{isRegister ? 'Sign In' : 'Create Account'}</button></div>
      </div>
    </div>
  );
};
interface RiderAuthProps { onSuccess: (riderId: string) => void; }
export const RiderAuthModal: React.FC<RiderAuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('rider@kitnova.ug'); const [pin, setPin] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(null); try { const { data, error } = await supabase.auth.signInWithPassword({ email, password: pin }); if (error) throw error; onSuccess(data.user.id); } catch (err: any) { setError(err.message); } finally { setLoading(false); } };
  return (
    <div className="min-h-screen bg-[#071329] flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5">
        {error && <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" />
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" placeholder="PIN"/>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#D4A029] font-bold">{loading ? 'Verifying...' : 'Access Delivery Console'}</button>
        </form>
      </div>
    </div>
  );
};
interface AdminAuthProps { onSuccess: (role: string) => void; }
export const AdminAuthModal: React.FC<AdminAuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@vishcom.co.ug'); const [password, setPassword] = useState(''); const [role, setRole] = useState('super_admin'); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(null); try { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; onSuccess(data.user.user_metadata?.role || role); } catch (err: any) { setError(err.message); } finally { setLoading(false); } };
  return (
    <div className="min-h-screen bg-[#071329] flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5">
        {error && <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" placeholder="Password"/>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#D4A029] font-bold">{loading ? 'Authenticating...' : 'Authenticate & Open Admin Console'}</button>
        </form>
      </div>
    </div>
  );
};
