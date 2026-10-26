import React, { useState } from 'react';
import { Shield, Truck, ShoppingBag, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { store, INITIAL_AUTH_USERS } from '../../services/store';
import { Role, AuthUser } from '../../types';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('customer@kitnova.ug');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const res = store.login(email, password, selectedRole);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    }, 300);
  };

  const handleQuickLaunch = (targetUser: typeof INITIAL_AUTH_USERS[0]) => {
    setEmail(targetUser.email);
    setSelectedRole(targetUser.role);
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const res = store.login(targetUser.email, 'password123', targetUser.role);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#071329] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Brand Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A029] to-[#996515] flex items-center justify-center font-black text-[#0A1A3C] shadow-lg">
            K
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
              KITNOVA<span className="text-[#D4A029]">JERSEY</span>
            </span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Vishcom Tech Company UG
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#D4A029] bg-[#0A1A3C] px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ROLE-BASED AUTH GATEWAY
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-4xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Information & Architecture Notice */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F2A5F]/80 border border-[#D4A029]/30 text-[#D4A029] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Separated Enterprise Architecture
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Sign In to Your <br />
            <span className="bg-gradient-to-r from-[#D4A029] via-[#F0C760] to-[#FFFFFF] bg-clip-text text-transparent">
              KITNOVA Interface
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Customer, Rider, and Admin interfaces are strictly segregated applications. Authenticated credentials determine role permissions and render only your authorized portal.
          </p>

          {/* Quick Architecture Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0A1A3C]/70 border border-slate-800">
              <ShoppingBag className="w-5 h-5 text-[#D4A029] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">Customer App</p>
                <p className="text-slate-400">Discover, shop kits, Studio customizer, cart, checkout & delivery tracking.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0A1A3C]/70 border border-slate-800">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">Rider App</p>
                <p className="text-slate-400">Courier dashboard, audio dispatch chime, Web Push notifications, route map & proof of delivery.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0A1A3C]/70 border border-slate-800">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">Admin Web Panel</p>
                <p className="text-slate-400">Orders, products upload, pricing rules, riders dispatch, payments & audit logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form + Quick Role Access */}
        <div className="lg:col-span-6 bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Sign In with Credentials</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your email to verify your role and open your interface.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@kitnova.ug"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating with Backend...</span>
              ) : (
                <>
                  <span>Sign In & Open Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Launch Buttons for Demonstration & Evaluation */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              1-Click Role Direct Sign-In (Demo Access)
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[0])}
                className="p-2.5 rounded-xl bg-[#0F2A5F]/40 hover:bg-[#0F2A5F] border border-slate-700 hover:border-[#D4A029] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-[#D4A029]">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D4A029]" />
                  <span>Customer</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">David Mukasa</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[1])}
                className="p-2.5 rounded-xl bg-[#0F2A5F]/40 hover:bg-[#0F2A5F] border border-slate-700 hover:border-emerald-400 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-emerald-400">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rider Courier</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Ronald Mugisha</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[3])}
                className="p-2.5 rounded-xl bg-[#0F2A5F]/40 hover:bg-[#0F2A5F] border border-slate-700 hover:border-blue-400 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-blue-400">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Operations Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Grace Namubiru</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLaunch(INITIAL_AUTH_USERS[2])}
                className="p-2.5 rounded-xl bg-[#0F2A5F]/40 hover:bg-[#0F2A5F] border border-slate-700 hover:border-amber-400 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-white group-hover:text-amber-400">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Super Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Ronald Ssebaggala</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <p>© 2026 KITNOVA Sportswear · Vishcom Tech Company UG</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Supabase RLS Enabled
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Web Push Notification Gateway
          </span>
        </div>
      </footer>
    </div>
  );
};
