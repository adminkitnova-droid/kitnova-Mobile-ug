import React, { useState, useEffect } from 'react';
import { Package, Heart, Sparkles, MessageSquare, MapPin, Send, CheckCircle2, Clock, Truck, LogOut, LogIn, KeyRound, ShieldCheck } from 'lucide-react';
import { store } from '../../services/store';
import { Order, StudioDesign, SupportTicket } from '../../types';

interface CustomerProfileProps {
  onTrackOrder: (orderId: string) => void;
  onOpenStudio: (design?: StudioDesign) => void;
  onLogout?: () => void;
  onLogin?: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ onTrackOrder, onOpenStudio, onLogout, onLogin }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [activeTab, setActiveTab] = useState<'orders' | 'designs' | 'support'>('orders');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(store.tickets[0] || null);
  const [replyText, setReplyText] = useState('');

  const currentUser = store.getCurrentUser();
  const displayName = currentUser?.name || 'David Mukasa';
  const displayEmail = currentUser?.email || 'david.mukasa@vishcom.co.ug';
  const displayPhone = currentUser?.phone || '+256 752 443 890';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DM';

  const orders = store.orders;
  const savedDesigns = store.savedDesigns;
  const tickets = store.tickets;

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer' as const,
      senderName: displayName,
      text: replyText.trim(),
      timestamp: new Date().toISOString()
    };
    selectedTicket.messages.push(newMessage);
    setReplyText('');
    setTick(t => t + 1);
  };

  const handleTriggerLogin = () => {
    store.logout();
    if (onLogin) {
      onLogin();
    } else if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Profile Header */}
      <div className="bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F2A5F] to-[#D4A029] flex items-center justify-center font-black text-xl text-[#0A1A3C] shadow-lg">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{displayName}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A029]/20 text-[#D4A029] font-bold border border-[#D4A029]/40 uppercase">
                {currentUser?.role === 'rider' ? 'COURIER' : 'PRO MEMBER'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{displayEmail} · {displayPhone}</p>
            <p className="text-xs text-slate-400 mt-1">
              Kampala, Uganda · <strong className="text-[#D4A029]">420 Loyalty Points</strong>
            </p>
          </div>
        </div>

        {/* Quick Stats, Login & Logout Actions */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6 text-xs">
          <div>
            <span className="text-slate-400 block">Orders</span>
            <span className="text-lg font-black text-white font-mono">{orders.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Saved Designs</span>
            <span className="text-lg font-black text-white font-mono">{savedDesigns.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Login Button in Header */}
            <button
              onClick={handleTriggerLogin}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] hover:brightness-110 text-[#0A1A3C] font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Log in to customer account or switch account"
            >
              <LogIn className="w-3.5 h-3.5 text-[#0A1A3C]" />
              <span>Log In</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                store.logout();
                if (onLogout) onLogout();
              }}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Logout from customer account"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Authentication & Access Banner (Under Profile Header) */}
      <div className="bg-[#0F2A5F]/30 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A1A3C] border border-[#D4A029]/30 flex items-center justify-center text-[#D4A029]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Account Access & Authentication</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" />
                AUTHENTICATED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Current session: <strong className="text-slate-200">{displayEmail}</strong> · Role: <span className="font-mono text-[#D4A029] uppercase">{currentUser?.role || 'customer'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTriggerLogin}
            className="px-4 py-2 rounded-xl bg-[#D4A029] hover:bg-[#F0C760] text-[#0A1A3C] font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-[#0A1A3C]" />
            <span>Log In to Account</span>
          </button>
          <button
            onClick={() => {
              store.logout();
              if (onLogout) onLogout();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Profile Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'bg-[#D4A029] text-[#0A1A3C]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('designs')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'designs'
              ? 'bg-[#D4A029] text-[#0A1A3C]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Saved Studio Designs ({savedDesigns.length})
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'support'
              ? 'bg-[#D4A029] text-[#0A1A3C]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Support & Tickets
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-[#0A1A3C]/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm font-mono">{order.orderNumber}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-mono uppercase bg-[#0F2A5F] text-[#D4A029] border border-[#D4A029]/30">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="mx-2">·</span>
                  <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                  <span className="mx-2">·</span>
                  <span className="font-mono text-white font-bold">UGX {order.totalAmount.toLocaleString()}</span>
                </div>

                {order.assignedRiderName && (
                  <p className="text-xs text-[#D4A029] flex items-center gap-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    Assigned Rider: {order.assignedRiderName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onTrackOrder(order.id)}
                  className="px-4 py-2 rounded-xl bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-[#D4A029] transition-colors cursor-pointer"
                >
                  Track Delivery
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Saved Studio Designs */}
      {activeTab === 'designs' && (
        <div>
          {savedDesigns.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm">You haven't saved any custom designs yet.</p>
              <button
                onClick={() => onOpenStudio()}
                className="mt-3 text-xs text-[#D4A029] font-bold hover:underline"
              >
                Create a Custom Kit Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {savedDesigns.map(design => (
                <div
                  key={design.id}
                  className="bg-[#0A1A3C]/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
                >
                  <div className="aspect-[4/3] rounded-xl bg-[#0F2A5F]/40 flex items-center justify-center border border-slate-700">
                    <div className="w-16 h-20 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] font-mono text-[#D4A029]">
                      JERSEY
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{design.title}</h3>
                    <p className="text-xs text-slate-400">{design.productName}</p>
                    <p className="text-xs font-mono text-[#D4A029] mt-1">
                      Customization: UGX {design.totalCustomizationPrice.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenStudio(design)}
                    className="w-full py-2 rounded-lg bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760]"
                  >
                    Load in Studio
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Support & Live Conversation */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Tickets</h3>
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-[#D4A029]/15 border-[#D4A029] text-white'
                    : 'bg-[#0F2A5F]/20 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-mono font-bold text-[#D4A029]">{ticket.ticketNumber}</span>
                  <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-800">{ticket.status}</span>
                </div>
                <p className="font-bold text-slate-200 truncate">{ticket.subject}</p>
              </div>
            ))}
          </div>

          <div className="md:col-span-8 bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            {selectedTicket ? (
              <div>
                <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                    <p className="text-[11px] text-slate-400">Order: {selectedTicket.orderId || 'General Inquiry'}</p>
                  </div>
                  <span className="text-xs font-mono text-[#D4A029] uppercase">{selectedTicket.category}</span>
                </div>

                {/* Messages stream */}
                <div className="py-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedTicket.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl text-xs ${
                          msg.sender === 'customer'
                            ? 'bg-[#D4A029] text-[#0A1A3C] font-medium rounded-tr-none'
                            : 'bg-[#0F2A5F] text-slate-200 rounded-tl-none border border-slate-700'
                        }`}
                      >
                        <p className="text-[10px] font-bold opacity-75 mb-1">{msg.senderName}</p>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type reply to Kitnova Support..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
                  />
                  <button
                    onClick={handleSendReply}
                    className="p-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold hover:bg-[#F0C760] transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a ticket to view messages.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
