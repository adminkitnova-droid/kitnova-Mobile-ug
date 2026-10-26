import React from 'react';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Users,
  Truck,
  MessageSquare,
  Bell,
  BarChart3,
  ShieldAlert,
  Settings,
  AlertTriangle,
  X,
  PanelLeftClose,
  LogOut,
  Layers,
  Tag,
  Layout,
  Radio,
  BookOpen,
  UserCheck,
  Image as ImageIcon,
  Smartphone,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { store } from '../../services/store';

export type AdminModule =
  | 'dashboard'
  | 'products'
  | 'product_images'
  | 'inventory'
  | 'studio'
  | 'customers'
  | 'riders'
  | 'orders'
  | 'deliveries'
  | 'payments'
  | 'manual_payments'
  | 'discounts'
  | 'cms'
  | 'notifications'
  | 'analytics'
  | 'reports'
  | 'audit'
  | 'accounts'
  | 'security'
  | 'settings'
  | 'support'
  | 'docs';

interface AdminSidebarProps {
  currentModule: AdminModule;
  onSelectModule: (module: AdminModule) => void;
  adminRole?: string;
  onClose?: () => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentModule,
  onSelectModule,
  adminRole = 'super_admin',
  onClose,
  onLogout
}) => {
  const pendingPayments = store.payments.filter(p => p.status === 'pending_verification').length;
  const lowStockCount = store.products.filter(p => p.stock <= p.lowStockThreshold).length;
  const unassignedOrders = store.orders.filter(o => o.status === 'paid' && !o.assignedRiderId).length;

  const totalActionRequired = pendingPayments + lowStockCount + unassignedOrders;

  const navSections: Array<{
    title: string;
    items: Array<{ id: AdminModule; label: string; icon: React.ReactNode; badge?: number }>;
  }> = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, badge: totalActionRequired },
        { id: 'orders', label: 'Orders & Production', icon: <ShoppingBag className="w-4 h-4" />, badge: unassignedOrders },
        { id: 'deliveries', label: 'Live Dispatch Monitor', icon: <Radio className="w-4 h-4" /> },
        { id: 'payments', label: 'Payment Verifications', icon: <CreditCard className="w-4 h-4" />, badge: pendingPayments },
        { id: 'manual_payments', label: 'Manual Payment Methods', icon: <Smartphone className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics & KPIs', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'reports', label: 'Reports & CSV Export', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      title: 'CATALOG & STUDIO',
      items: [
        { id: 'products', label: 'Products & Apparel', icon: <Shirt className="w-4 h-4" /> },
        { id: 'product_images', label: 'Product Images', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'inventory', label: 'Inventory & Variants', icon: <Layers className="w-4 h-4" />, badge: lowStockCount },
        { id: 'studio', label: 'Jersey Studio Settings', icon: <Sparkles className="w-4 h-4" /> }
      ]
    },
    {
      title: 'PEOPLE & FLEET',
      items: [
        { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
        { id: 'riders', label: 'Riders & Couriers', icon: <Truck className="w-4 h-4" /> },
        { id: 'support', label: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" /> }
      ]
    },
    {
      title: 'MARKETING & STOREFRONT',
      items: [
        { id: 'discounts', label: 'Promotions & Coupons', icon: <Tag className="w-4 h-4" /> },
        { id: 'cms', label: 'Home Page Management', icon: <Layout className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notification Center', icon: <Bell className="w-4 h-4" /> }
      ]
    },
    {
      title: 'GOVERNANCE & SYSTEM',
      items: [
        { id: 'accounts', label: 'Administrator Management', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'security', label: 'Security & RLS Monitor', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'audit', label: 'Audit Logs', icon: <ShieldAlert className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'docs', label: 'Operations Handbook', icon: <BookOpen className="w-4 h-4" /> }
      ]
    }
  ];

  // RBAC Permission Filter
  const allowedModulesByRole: Record<string, AdminModule[]> = {
    super_admin: [
      'dashboard', 'products', 'product_images', 'inventory', 'studio',
      'customers', 'riders', 'orders', 'deliveries', 'payments', 'manual_payments',
      'discounts', 'cms', 'notifications', 'analytics', 'reports',
      'audit', 'accounts', 'security', 'settings', 'support', 'docs'
    ],
    operations_admin: [
      'dashboard', 'orders', 'deliveries', 'payments', 'manual_payments', 'riders',
      'customers', 'reports', 'support', 'notifications', 'docs'
    ],
    product_admin: [
      'dashboard', 'products', 'product_images', 'inventory', 'studio', 'cms', 'discounts', 'reports', 'docs'
    ],
    support_admin: [
      'dashboard', 'customers', 'orders', 'support', 'notifications', 'docs'
    ]
  };

  const allowed = allowedModulesByRole[adminRole] || allowedModulesByRole['super_admin'];

  return (
    <aside className="w-64 bg-[#0A1A3C] border-r border-slate-800 flex flex-col shrink-0 min-h-screen transition-all duration-300">
      {/* Brand & Admin Lockup with Close Sign for Clear View */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#D4A029]">
            VISHCOM TECH UG
          </span>
          <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
            KITNOVA <span className="text-[#D4A029] font-medium text-xs">SUPER ADMIN</span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-[#0F2A5F] text-[#D4A029] text-[9px] font-mono uppercase font-bold border border-[#D4A029]/30">
            PROD
          </span>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close navigation panel for full-screen view"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4 text-slate-300 hover:text-[#D4A029]" />
            </button>
          )}
        </div>
      </div>

      {/* Role Pill */}
      <div className="px-5 py-2.5 bg-[#0F2A5F]/30 border-b border-slate-800 text-[11px] flex items-center justify-between">
        <span className="text-slate-400">Authenticated Role:</span>
        <span className="font-bold text-[#D4A029] uppercase font-mono">
          {adminRole.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map(section => {
          const visibleItems = section.items.filter(item => allowed.includes(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <span className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-500 font-mono block mb-1">
                {section.title}
              </span>
              {visibleItems.map(item => {
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold shadow-md'
                        : 'text-slate-300 hover:bg-[#0F2A5F]/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-[#0A1A3C]' : 'text-slate-400'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-[#0A1A3C] text-[#D4A029]'
                            : 'bg-red-500 text-white animate-pulse'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => {
            store.logout();
            if (onLogout) onLogout();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>Sign Out of Super Admin</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
        <span>Console v2.4.0</span>
        <span className="text-emerald-400 font-mono font-bold">Supabase RLS</span>
      </div>
    </aside>
  );
};
