import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert, CheckCircle2, AlertCircle, KeyRound, X } from 'lucide-react';
import { store } from '../../services/store';
import { authenticateUser, sendPasswordReset } from '../../services/supabaseClient';
import { AuthUser } from '../../types';

interface SuperAdminAuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  onSwitchToCustomerApp?: () => void;
}

export const SuperAdminAuthScreen: React.FC<SuperAdminAuthScreenProps> = ({
  onLoginSuccess,
  onSwitchToCustomerApp
}) => {
  // Empty fields with appropriate placeholders (Never prefilled!)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authenticateUser(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      // Check administrative authorization
      const isAdmin =
        res.user.role === 'super_admin' ||
        res.user.role === 'operations_admin' ||
        res.user.role === 'product_admin' ||
        res.user.role === 'support_admin';

      if (!isAdmin) {
        setError('Access Denied (403): You do not have administrative authorization to access the KITNOVA Super Admin Console.');
        return;
      }

      // Valid administrative staff member
      store.currentUser = res.user;
      localStorage.setItem('kitnova_auth_session', JSON.stringify(res.user));
      store.logAction('users', 'ADMIN_LOGIN', `Admin ${res.user.email} authenticated into Super Admin Console`, res.user.name, undefined, undefined, res.user.role);
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Access Denied: Unrecognized administrative credentials.');
    }
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsForgotLoading(true);
    const res = await sendPasswordReset(forgotEmail);
    setIsForgotLoading(false);
    setForgotFeedback(res.message);
  };

  return (
    <div className="min-h-screen bg-[#050D1A] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Brand Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A029] to-[#996515] flex items-center justify-center font-black text-[#0A1A3C] shadow-lg">
            K
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
              KITNOVA<span className="text-[#D4A029]">SUPER ADMIN</span>
            </span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Enterprise Operations Console · Vishcom Tech UG
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-[#0A1A3C] px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SECURITY GATEWAY ACTIVE</span>
        </div>
      </header>

      {/* Main Terminal Card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[#0A1A3C] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Security Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[#D4A029] to-amber-500" />

          <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D4A029]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">Administrative Portal Sign In</h1>
              <p className="text-[11px] text-slate-400">Strictly authorized staff credentials only.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Public administrator registration is disabled. Access is enforced through Supabase Row Level Security and staff authorization tables.
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Access Denied</span>
                <span className="text-[11px] leading-relaxed text-red-300">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Staff Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. admin@kitnova.ug"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">Administrative Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotFeedback(null);
                    setIsForgotOpen(true);
                  }}
                  className="text-[11px] text-[#D4A029] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Verifying Administrative Authority...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Authenticate to Console</span>
                </>
              )}
            </button>
          </form>

          {onSwitchToCustomerApp && (
            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={onSwitchToCustomerApp}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Customer & Rider App
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071329] border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#D4A029]" />
                Administrative Reset
              </h3>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your verified staff email to dispatch recovery instructions to your corporate mailbox.
            </p>

            {forgotFeedback ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{forgotFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@kitnova.ug"
                    className="w-full px-3 py-2 rounded-xl bg-[#0A1A3C] border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  {isForgotLoading ? 'Sending...' : 'Send Admin Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <p>© 2026 KITNOVA Sportswear · Super Admin Console</p>
        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
          <CheckCircle2 className="w-3 h-3" />
          Supabase RLS Protected · App B
        </span>
      </footer>
    </div>
  );
};
