import React, { useState, useEffect } from 'react';
import { Shield, Truck, ShoppingBag, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { store, INITIAL_AUTH_USERS } from '../../services/store';
import { Role, AuthUser } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { App } from '@capacitor/app';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('customer@kitnova.ug');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let listener: any = null;
    const initAuth = async () => {
      // 1. Check existing session
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        handleSessionUser(data.session.user);
      }

      // 2. Handle cold-start: app opened from closed state via deep link
      try {
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url && launchUrl.url.includes('auth/callback')) {
          await handleDeepLink(launchUrl.url);
        }
      } catch {}

      // 3. Handle when app is already running
      listener = await App.addListener('appUrlOpen', async (event) => {
        if (event.url.includes('auth/callback')) {
          await handleDeepLink(event.url);
        }
      });

      // 4. Listen for PASSWORD_RECOVERY event
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
          setInfo('Enter your new password');
        }
        if (event === 'SIGNED_IN' && session?.user) {
          handleSessionUser(session.user);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    initAuth();
    return () => {
      if (listener) listener.remove();
    };
  }, []);

  const handleSessionUser = (user: any) => {
    const authUser = {
      id: user.id,
      email: user.email!,
      role: (user.user_metadata?.role as Role) || selectedRole,
    } as AuthUser;
    store.currentUser = authUser as any;
    onLoginSuccess(authUser);
  };

  const handleDeepLink = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // FIX: extract code, don't pass entire URL
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      if (!code) throw new Error('No code in URL');

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      if (data.session?.user) {
        // If recovery, stay in recovery mode, don't auto-login yet
        const { data: userData } = await supabase.auth.getUser();
        // Check if this was a recovery link - Supabase will emit PASSWORD_RECOVERY
        setInfo('Email confirmed. You are signed in.');
      }
    } catch (err: any) {
      setError(err.message || 'Deep link failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback to mock for demo users if Supabase not yet created
        const res = store.login(email, password, selectedRole);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          return;
        }
        throw error;
      }
      if (data.user) handleSessionUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setInfo('Password updated. Signing you in...');
      setIsRecoveryMode(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter email first'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.kitnova.jersey://auth/callback',
      });
      if (error) throw error;
      setInfo('Password reset email sent. Open link in app.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLaunch = (targetUser: typeof INITIAL_AUTH_USERS[0]) => {
    setEmail(targetUser.email);
    setSelectedRole(targetUser.role);
    setPassword('password123');
    setIsLoading(true);
    setError(null);
    setTimeout(async () => {
      try {
        const { data } = await supabase.auth.signInWithPassword({ email: targetUser.email, password: 'password123' });
        if (data.user) { handleSessionUser(data.user); return; }
      } catch {}
      const res = store.login(targetUser.email, 'password123', targetUser.role);
      setIsLoading(false);
      if (res.success && res.user) onLoginSuccess(res.user);
    }, 200);
  };

  // Password Recovery UI
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen bg-[#071329] flex items-center justify-center p-4">
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-8 max-w-sm w-full space-y-4">
          <h2 className="text-lg font-bold text-white">Set New Password</h2>
          <p className="text-xs text-slate-400">You clicked the recovery link. Enter new password.</p>
          {error && <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex gap-2"><AlertCircle className="w-4 h-4"/><span>{error}</span></div>}
          {info && <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs">{info}</div>}
          <form onSubmit={handleRecoverySubmit} className="space-y-3">
            <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password" className="w-full px-3 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" />
            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-[#D4A029] font-black text-[#0A1A3C]">{isLoading ? 'Saving...' : 'Save New Password'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071329] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A029] to-[#996515] flex items-center justify-center font-black text-[#0A1A3C] shadow-lg">K</div>
          <div><span className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">KITNOVA<span className="text-[#D4A029]">JERSEY</span></span><p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Vishcom Tech Company UG</p></div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#D4A029] bg-[#0A1A3C] px-3 py-1.5 rounded-lg border border-slate-800"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />ROLE-BASED AUTH GATEWAY</div>
      </header>

      <main className="w-full max-w-4xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F2A5F]/80 border border-[#D4A029]/30 text-[#D4A029] text-xs font-semibold"><Sparkles className="w-3.5 h-3.5" />Separated Enterprise Architecture</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">Sign In to Your <br /><span className="bg-gradient-to-r from-[#D4A029] via-[#F0C760] to-[#FFFFFF] bg-clip-text text-transparent">KITNOVA Interface</span></h1>
          <p className="text-sm text-slate-300 leading-relaxed">Customer, Rider, and Admin interfaces are strictly segregated applications.</p>
        </div>

        <div className="lg:col-span-6 bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4"><h2 className="text-lg font-bold text-white">Sign In with Credentials</h2></div>
          {error && <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><span>{error}</span></div>}
          {info && <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>{info}</span></div>}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div><label className="block font-semibold text-slate-300 mb-1.5">Email Address</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" /></div></div>
            <div><label className="block font-semibold text-slate-300 mb-1.5">Password</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white" /></div></div>
            <div className="flex justify-between"><button type="button" onClick={handleForgotPassword} className="text-[11px] text-[#D4A029] hover:underline">Forgot password?</button></div>
            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">{isLoading ? <span>Authenticating...</span> : <><span>Sign In & Open Portal</span><ArrowRight className="w-4 h-4" /></>}</button>
          </form>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">1-Click Role Direct Sign-In (Demo Access)</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button type="button" onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[0])} className="p-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-left"><div className="flex items-center gap-2 font-bold text-white"><ShoppingBag className="w-3.5 h-3.5 text-[#D4A029]" /><span>Customer</span></div><p className="text-[10px] text-slate-400 truncate">David Mukasa</p></button>
              <button type="button" onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[1])} className="p-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-left"><div className="flex items-center gap-2 font-bold text-white"><Truck className="w-3.5 h-3.5 text-emerald-400" /><span>Rider</span></div><p className="text-[10px] text-slate-400 truncate">Ronald Mugisha</p></button>
              <button type="button" onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[3])} className="p-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-left"><div className="flex items-center gap-2 font-bold text-white"><Shield className="w-3.5 h-3.5 text-blue-400" /><span>Operations Admin</span></div><p className="text-[10px] text-slate-400 truncate">Grace Namubiru</p></button>
              <button type="button" onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[2])} className="p-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-left"><div className="flex items-center gap-2 font-bold text-white"><Shield className="w-3.5 h-3.5 text-amber-400" /><span>Super Admin</span></div><p className="text-[10px] text-slate-400 truncate">Ronald Ssebaggala</p></button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto py-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500"><p>© 2026 KITNOVA · Vishcom Tech</p><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" />Supabase RLS Enabled</span></footer>
    </div>
  );
};
