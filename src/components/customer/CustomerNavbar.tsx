import React from 'react';
import { ShoppingBag, Bell, User, Sparkles, Truck, LogOut } from 'lucide-react';
import { store } from '../../services/store';

interface CustomerNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenAiAssistant: () => void;
  onLogout?: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenAiAssistant,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A1A3C]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F2A5F] to-[#D4A029] flex items-center justify-center font-black text-[#0A1A3C] shadow-md border border-[#D4A029]/50">
            K
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-[#D4A029] transition-colors">
              KITNOVA<span className="text-[#D4A029] font-medium ml-1 text-sm tracking-normal">JERSEY</span>
            </span>
          </div>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-[#D4A029] ${
              currentView === 'home' ? 'text-[#D4A029]' : 'text-slate-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className={`transition-colors hover:text-[#D4A029] ${
              currentView === 'shop' ? 'text-[#D4A029]' : 'text-slate-300'
            }`}
          >
            Shop Kits
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className={`transition-colors hover:text-[#D4A029] flex items-center gap-1.5 ${
              currentView === 'studio' ? 'text-[#D4A029]' : 'text-slate-300'
            }`}
          >
            Jersey Studio
            <span className="text-[10px] px-1.5 py-0.2 bg-[#D4A029]/20 text-[#D4A029] rounded border border-[#D4A029]/40">
              CUSTOM
            </span>
          </button>
          <button
            onClick={() => onNavigate('team')}
            className={`transition-colors hover:text-[#D4A029] ${
              currentView === 'team' ? 'text-[#D4A029]' : 'text-slate-300'
            }`}
          >
            Team Roster
          </button>
          <button
            onClick={() => onNavigate('tracking')}
            className={`transition-colors hover:text-[#D4A029] flex items-center gap-1 ${
              currentView === 'tracking' ? 'text-[#D4A029]' : 'text-slate-300'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Track Delivery
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* AI Stylist Assistant Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F2A5F]/60 border border-[#D4A029]/40 text-xs font-semibold text-[#D4A029] hover:bg-[#0F2A5F] transition-all cursor-pointer"
            title="Kitnova AI Design Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A029]" />
            <span className="hidden sm:inline">AI Stylist</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4A029] ring-2 ring-[#0A1A3C]" />
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={() => onNavigate('cart')}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#D4A029] text-[#0A1A3C] font-mono text-xs font-bold flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className={`p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer ${
              currentView === 'profile' ? 'text-[#D4A029]' : ''
            }`}
            title="My Profile & Orders"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Log Out button directing to login page */}
          <button
            onClick={() => {
              store.logout();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold transition-colors cursor-pointer shadow-sm ml-1"
            title="Log Out to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
