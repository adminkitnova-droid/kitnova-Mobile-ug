import React, { useState } from 'react';
import { AdminSidebar, AdminModule } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminStudioRules } from './AdminStudioRules';
import { AdminOrders } from './AdminOrders';
import { AdminPayments } from './AdminPayments';
import { AdminCustomers } from './AdminCustomers';
import { AdminRiders } from './AdminRiders';
import { AdminNotificationsCenter } from './AdminNotificationsCenter';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminSettings } from './AdminSettings';
import { AdminInventory } from './AdminInventory';
import { AdminDeliveries } from './AdminDeliveries';
import { AdminDiscounts } from './AdminDiscounts';
import { AdminCms } from './AdminCms';
import { AdminAccounts } from './AdminAccounts';
import { AdminDocs } from './AdminDocs';
import { AdminProductImages } from './AdminProductImages';
import { AdminManualPayments } from './AdminManualPayments';
import { AdminReports } from './AdminReports';
import { AdminSecurity } from './AdminSecurity';
import { Bell, Search, Shield, User, Globe, PanelLeftOpen, PanelLeftClose, Maximize2, LogOut } from 'lucide-react';
import { store } from '../../services/store';

interface AdminPanelProps {
  adminRole?: string;
  onRoleChange?: (role: string) => void;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminRole = 'super_admin',
  onRoleChange,
  onLogout
}) => {
  const [currentModule, setCurrentModule] = useState<AdminModule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex w-full min-h-screen bg-[#071329] text-slate-100 font-sans">
      {/* Left Sidebar (Collapsible for maximum clear view) */}
      {isSidebarOpen && (
        <AdminSidebar
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          adminRole={adminRole}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={onLogout}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Bar Contract (Spec Section 2 & 10) */}
        <header className="sticky top-0 z-30 h-16 bg-[#0A1A3C] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-md">
          {/* Breadcrumb / Re-open Sidebar / Clear View Toggle */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg bg-[#0F2A5F] border border-slate-700 hover:border-[#D4A029] text-[#D4A029] hover:bg-[#0F2A5F]/80 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Open Navigation Menu"
              >
                <PanelLeftOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            )}

            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Collapse sidebar to expand workspace view"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-[#D4A029] tracking-wider">
                {currentModule.replace(/_/g, ' ')}
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Vishcom Production Console</span>
            </div>
          </div>

          {/* Quick Environment & Admin Role Pill */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 hidden md:inline">
                FULL VIEW MODE
              </span>
            )}

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SUPABASE RLS ACTIVE</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-bold text-[#D4A029]">{adminRole.replace(/_/g, ' ').toUpperCase()}</span>
              <button
                onClick={() => {
                  store.logout();
                  if (onLogout) onLogout();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm ml-1"
                title="Sign out of Admin Console to Login Screen"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* View Routing */}
        <main className="flex-1 overflow-y-auto">
          {currentModule === 'dashboard' && (
            <AdminDashboard onNavigateModule={setCurrentModule} />
          )}
          {currentModule === 'analytics' && <AdminAnalytics />}
          {currentModule === 'reports' && <AdminReports />}
          {currentModule === 'products' && <AdminProducts />}
          {currentModule === 'product_images' && <AdminProductImages />}
          {currentModule === 'inventory' && <AdminInventory />}
          {currentModule === 'studio' && <AdminStudioRules />}
          {currentModule === 'orders' && <AdminOrders />}
          {currentModule === 'deliveries' && <AdminDeliveries />}
          {currentModule === 'payments' && <AdminPayments />}
          {currentModule === 'manual_payments' && <AdminManualPayments />}
          {currentModule === 'customers' && <AdminCustomers />}
          {currentModule === 'riders' && <AdminRiders />}
          {currentModule === 'discounts' && <AdminDiscounts />}
          {currentModule === 'cms' && <AdminCms />}
          {currentModule === 'notifications' && <AdminNotificationsCenter />}
          {currentModule === 'accounts' && <AdminAccounts />}
          {currentModule === 'security' && <AdminSecurity />}
          {currentModule === 'support' && (
            <div className="p-8 text-center text-slate-400">
              <h2 className="text-xl font-bold text-white mb-2">Support Tickets Console</h2>
              <p className="text-xs">Live customer queries can be audited directly from the Customer management or notifications console.</p>
            </div>
          )}
          {currentModule === 'audit' && <AdminAuditLogs />}
          {currentModule === 'settings' && <AdminSettings />}
          {currentModule === 'docs' && <AdminDocs />}
        </main>
      </div>
    </div>
  );
};
