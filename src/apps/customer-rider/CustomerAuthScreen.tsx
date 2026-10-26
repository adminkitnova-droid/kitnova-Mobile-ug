import React, { useState } from 'react';
import { ShoppingBag, Truck, Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2, KeyRound, HelpCircle, X } from 'lucide-react';
import { store } from '../../services/store';
import { authenticateUser, registerCustomerAccount, sendPasswordReset } from '../../services/supabaseClient';
import { AuthUser } from '../../types';

interface CustomerAuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  onSwitchToAdmin?: () => void;
}

export const CustomerAuthScreen: React.FC<CustomerAuthScreenProps> = ({
  onLoginSuccess,
  onSwitchToAdmin
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  // EMPTY fields with appropriate placeholders (Never prefilled!)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your registered email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authenticateUser(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      // Resolve verified role
      if (res.user.role === 'customer' || res.user.role === 'rider') {
        store.currentUser = res.user;
        localStorage.setItem('kitnova_auth_session', JSON.stringify(res.user));
        store.logAction('users', 'LOGIN', `${res.user.role.toUpperCase()} authenticated into Application A: ${res.user.email}`, res.user.name);
        onLoginSuccess(res.user);
      } else {
        // Administrative accounts must not log in here
        setError('This portal is exclusively for Customers and Delivery Couriers. Administrative staff must access the Super Admin Console.');
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify your email and password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await registerCustomerAccount(name, email, phone, password);
    setIsLoading(false);

    if (res.success && res.user) {
      store.currentUser = res.user;
      localStorage.setItem('kitnova_auth_session', JSON.stringify(res.user));
      store.logAction('users', 'REGISTER', `New customer self-registered: ${res.user.email}`, res.user.name);
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Registration failed. Please check your information and retry.');
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
    <div className="min-h-screen bg-[#0A1A3C] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Brand Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A029] to-[#996515] flex items-center justify-center font-black text-[#0A1A3C] shadow-lg">
            K
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
              KITNOVA<span className="text-[#D4A029]">JERSEY</span>
            </span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Official Sports & Custom Kits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#D4A029] bg-[#0F2A5F]/40 px-3 py-1.5 rounded-lg border border-[#D4A029]/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>CUSTOMER & COURIER PORTAL</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[#071329] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-[#0A1A3C] p-1 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                tab === 'signin' ? 'bg-[#D4A029] text-[#0A1A3C] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                tab === 'register' ? 'bg-[#D4A029] text-[#0A1A3C] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Customer Account
            </button>
          </div>

          <div>
            <h1 className="text-xl font-black text-white">
              {tab === 'signin' ? 'Sign In to Your Account' : 'Register as Customer'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {tab === 'signin'
                ? 'Enter your credentials to customize jerseys, checkout, or access delivery routes.'
                : 'Create a customer profile to order custom kits and track your orders in real time.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                {error}
                {error.includes('Super Admin Console') && onSwitchToAdmin && (
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="block mt-2 font-bold text-[#D4A029] underline cursor-pointer"
                  >
                    Go to KITNOVA Super Admin Console →
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. customer@kitnova.ug or rider@kitnova.ug"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/30 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-300">Password</label>
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/30 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating with Backend...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. David Mukasa"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/30 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. david@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/30 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number (+256)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+256 752 000 000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/30 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Create Password (min. 6 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2A5F]/30 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Registering Customer Account...</span>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Dedicated Link for Staff to Administrative Application B */}
          {onSwitchToAdmin && (
            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Are you an authorized KITNOVA staff member?</span>
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-xs text-[#D4A029] hover:underline font-bold"
              >
                Access KITNOVA Super Admin Console →
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
                Reset Password
              </h3>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your registered customer or courier email to receive reset instructions.
            </p>

            {forgotFeedback ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{forgotFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#0A1A3C] border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  {isForgotLoading ? 'Sending...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <p>© 2026 KITNOVA Sportswear · Application A</p>
        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
          <CheckCircle2 className="w-3 h-3" />
          Supabase Auth Protected
        </span>
      </footer>
    </div>
  );
};
