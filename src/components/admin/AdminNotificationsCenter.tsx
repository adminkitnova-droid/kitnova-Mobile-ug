import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Shield, Users, Truck } from 'lucide-react';
import { store } from '../../services/store';

export const AdminNotificationsCenter: React.FC = () => {
  const notifs = store.notifications;
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'customer' | 'rider' | 'admin'>('all');
  const [sentNotice, setSentNotice] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    store.addNotification({
      title,
      message,
      type: 'promotion',
      targetRole
    });

    store.logAction(
      'system',
      'BROADCAST_NOTIFICATION',
      `Sent notification "${title}" to target group [${targetRole}]`,
      'Support Admin'
    );

    setSentNotice(true);
    setTitle('');
    setMessage('');
    setTimeout(() => setSentNotice(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
          Messaging Engine
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Notification Center & Push Broadcast
        </h1>
      </div>

      {sentNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Broadcast sent successfully to recipient group!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Compose Form */}
        <form
          onSubmit={handleBroadcast}
          className="lg:col-span-5 bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-[#D4A029]" />
            Compose Notification / Push
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:border-[#D4A029]"
              >
                <option value="all" className="bg-[#0A1A3C]">All Registered Users</option>
                <option value="customer" className="bg-[#0A1A3C]">Customers Only</option>
                <option value="rider" className="bg-[#0A1A3C]">Delivery Couriers (Riders)</option>
                <option value="admin" className="bg-[#0A1A3C]">Internal Admin Staff</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Notification Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Flash 10% Off on Kampala Stars Home Kits!"
                className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:border-[#D4A029]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type push message details..."
                className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:border-[#D4A029]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors cursor-pointer"
          >
            Send Push Broadcast
          </button>
        </form>

        {/* Recent Notifications Feed */}
        <div className="lg:col-span-7 bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Notification Stream ({notifs.length})
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notifs.map(n => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white">{n.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-[#0A1A3C] text-[#D4A029] border border-slate-700">
                    {n.targetRole}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-500 font-mono block pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
