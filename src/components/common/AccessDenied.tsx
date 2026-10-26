import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { store } from '../../services/store';

interface AccessDeniedProps {
  requiredRole?: string;
  onBackToAllowed: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole = 'Admin',
  onBackToAllowed
}) => {
  const currentUser = store.getCurrentUser();

  return (
    <div className="min-h-screen bg-[#071329] text-slate-100 flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-red-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-400 flex items-center justify-center mx-auto shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-red-400 font-bold">
            Security Boundary Enforced
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Access Denied</h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Your current account role (<strong>{currentUser?.role || 'Guest'}</strong>) is not authorized to access this interface.
            Required permissions: <span className="text-[#D4A029] font-mono font-semibold">{requiredRole}</span>.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 text-xs">
          <button
            onClick={onBackToAllowed}
            className="w-full py-3 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-black hover:bg-[#F0C760] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Authorized Portal
          </button>

          <button
            onClick={() => store.logout()}
            className="w-full py-2.5 rounded-xl bg-[#0F2A5F] border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};
