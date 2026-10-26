import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { AdminPanel } from '../../components/admin/AdminPanel';
import { SuperAdminAuthScreen } from './SuperAdminAuthScreen';
import { ShieldAlert, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { Role } from '../../types';

interface SuperAdminAppProps {
  onSwitchToCustomerApp?: () => void;
}

export const SuperAdminApp: React.FC<SuperAdminAppProps> = ({
  onSwitchToCustomerApp
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const currentUser = store.getCurrentUser();

  // 1. IF NOT LOGGED IN: RENDER DEDICATED ADMIN LOGIN
  if (!currentUser) {
    return (
      <SuperAdminAuthScreen
        onLoginSuccess={() => {}}
        onSwitchToCustomerApp={onSwitchToCustomerApp}
      />
    );
  }

  // 2. VERIFY PERMISSIONS (Must be one of the four administrative roles)
  const isAdmin =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'operations_admin' ||
    currentUser.role === 'product_admin' ||
    currentUser.role === 'support_admin';

  // 3. IF CUSTOMER OR RIDER ATTEMPTS ACCESS: EXPLICIT 403 ACCESS DENIED
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050D1A] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0A1A3C] border border-red-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Access Denied (403 Forbidden)</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account <strong className="text-white">{currentUser.email}</strong> is assigned the role <code className="text-[#D4A029] font-mono font-bold uppercase">{currentUser.role}</code>.
            </p>
            <p className="text-xs text-red-300 bg-red-950/40 p-3 rounded-xl border border-red-500/30">
              This terminal is the KITNOVA Super Admin Console (com.kitnova.admin). Non-staff accounts are strictly prohibited by Supabase Row Level Security.
            </p>
          </div>

          <div className="space-y-3">
            {onSwitchToCustomerApp && (
              <button
                onClick={onSwitchToCustomerApp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Customer & Rider App</span>
              </button>
            )}

            <button
              onClick={() => store.logout()}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Current Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. AUTHENTICATED ADMIN CONSOLE
  return (
    <div className="min-h-screen bg-[#071329] text-slate-100 flex flex-col font-sans">
      <AdminPanel
        adminRole={currentUser.role}
        onRoleChange={r => store.switchAccountByRole(r as Role)}
        onLogout={() => store.logout()}
      />
    </div>
  );
};
