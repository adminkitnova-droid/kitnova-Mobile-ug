import React, { useState } from 'react';
import { Shield, Truck, User, Lock, Mail, Phone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Role } from '../../types';

interface CustomerAuthProps {
  onSuccess: (customer: { name: string; email: string; phone: string }) => void;
  onClose?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthProps> = ({ onSuccess, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('David Mukasa');
  const [email, setEmail] = useState('david.mukasa@vishcom.co.ug');
  const [phone, setPhone] = useState('+256 752 443 890');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({ name, email, phone });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0F2A5F] to-[#D4A029] text-[#0A1A3C] font-black flex items-center justify-center mx-auto text-xl shadow-lg">
            K
          </div>
          <h2 className="text-lg font-bold text-white">
            {isRegister ? 'Create KITNOVA Account' : 'Customer Account Login'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Join to save custom jersey designs & track orders' : 'Welcome back! Enter credentials to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. David Mukasa"
                className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Phone Number (+256)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="accent-[#D4A029]"
              />
              <span>Remember session (Persistent Auth)</span>
            </label>
            <span className="text-[#D4A029] hover:underline cursor-pointer">Forgot PIN?</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors cursor-pointer shadow-lg mt-2"
          >
            {isRegister ? 'Complete Registration' : 'Sign In to Customer App'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>{isRegister ? 'Already registered?' : "Don't have an account?"} </span>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#D4A029] font-bold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Create Free Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface RiderAuthProps {
  onSuccess: (riderId: string) => void;
}

export const RiderAuthModal: React.FC<RiderAuthProps> = ({ onSuccess }) => {
  const [selectedRiderId, setSelectedRiderId] = useState('rider-01');
  const [pin, setPin] = useState('1234');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(selectedRiderId);
  };

  return (
    <div className="min-h-screen bg-[#071329] flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-black flex items-center justify-center mx-auto text-xl shadow-lg">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Rider Dispatch Portal</h2>
          <p className="text-xs text-slate-400">KITNOVA Logistics Courier Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Select Courier Account</label>
            <select
              value={selectedRiderId}
              onChange={e => setSelectedRiderId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
            >
              <option value="rider-01" className="bg-[#0A1A3C]">Ronald Mugisha (UEM 482B)</option>
              <option value="rider-02" className="bg-[#0A1A3C]">Denis Kigozi (UDX 190F)</option>
              <option value="rider-03" className="bg-[#0A1A3C]">Brian Ssemwogerere (UFN 731K)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Courier Access PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-center text-lg text-white tracking-widest focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-xs hover:brightness-110 transition-colors shadow-lg cursor-pointer"
          >
            Access Delivery Console
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center">
          Restricted access. Authorized couriers only. GPS session will be initialized.
        </p>
      </div>
    </div>
  );
};

interface AdminAuthProps {
  onSuccess: (role: string) => void;
}

export const AdminAuthModal: React.FC<AdminAuthProps> = ({ onSuccess }) => {
  const [role, setRole] = useState('super_admin');
  const [email, setEmail] = useState('admin@vishcom.co.ug');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(role);
  };

  return (
    <div className="min-h-screen bg-[#071329] flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0F2A5F] to-[#D4A029] text-[#0A1A3C] font-black flex items-center justify-center mx-auto text-xl shadow-lg border border-[#D4A029]/50">
            <Shield className="w-6 h-6 text-[#0A1A3C]" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">KITNOVA Admin Console</h2>
          <p className="text-xs text-slate-400">Vishcom Tech Uganda Staff Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Administrative Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-[#D4A029]"
            >
              <option value="super_admin" className="bg-[#0A1A3C]">Super Admin (Full Access)</option>
              <option value="operations_admin" className="bg-[#0A1A3C]">Operations Admin (Orders & Couriers)</option>
              <option value="product_admin" className="bg-[#0A1A3C]">Product Admin (Catalog & Studio Rules)</option>
              <option value="support_admin" className="bg-[#0A1A3C]">Support Admin (Tickets & Inquiries)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Staff Work Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Security Key / Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors shadow-lg cursor-pointer"
          >
            Authenticate & Open Admin Console
          </button>
        </form>

        <p className="text-[10px] text-slate-500 text-center font-mono">
          Session protected by Supabase RLS & Audit Logs
        </p>
      </div>
    </div>
  );
};
