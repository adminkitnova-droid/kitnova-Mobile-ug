import React, { useState } from 'react';
import { Shield, Plus, Key, CheckCircle2, UserCheck, AlertCircle, Mail, Phone } from 'lucide-react';
import { store } from '../../services/store';
import { AdminUserAccount, Role } from '../../types';

export const AdminAccounts: React.FC = () => {
  const accounts = store.adminAccounts;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+256 700 000 000');
  const [role, setRole] = useState<'super_admin' | 'operations_admin' | 'product_admin' | 'support_admin'>('operations_admin');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    store.addAdminAccount({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      status: 'active'
    });
    setIsModalOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            STAFF SECURITY & ROLE ACCESS (RBAC)
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Administrator Accounts & Permissions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision authorized admin credentials. Public self-registration for administrators is strictly prohibited.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Admin User</span>
        </button>
      </div>

      {/* Accounts Table */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Sub-Role</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0F2A5F] text-[#D4A029] font-black flex items-center justify-center text-xs">
                      {acc.name.charAt(0)}
                    </div>
                    <span>{acc.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {acc.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        acc.role === 'super_admin'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                          : acc.role === 'operations_admin'
                          ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                          : acc.role === 'product_admin'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                      }`}
                    >
                      {acc.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {acc.phone || '+256 700 000 000'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        acc.status === 'active'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950/60 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => store.updateAdminAccount(acc.id, { status: acc.status === 'active' ? 'suspended' : 'active' })}
                      className="px-2.5 py-1 rounded bg-[#0F2A5F]/60 hover:bg-[#0F2A5F] text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      {acc.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-[#0A1A3C] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4A029]" />
                Provision Administrative User
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Samuel Mugerwa"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@kitnova.ug"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+256 700 000 000"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white font-mono focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Sub-Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                >
                  <option value="super_admin">Super Admin (Unrestricted root authority)</option>
                  <option value="operations_admin">Operations Admin (Orders, riders & deliveries)</option>
                  <option value="product_admin">Product Admin (Jerseys, catalog & studio rules)</option>
                  <option value="support_admin">Support Admin (Tickets & customer service)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] text-xs font-bold shadow-lg hover:brightness-110 cursor-pointer"
              >
                Grant Access
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
