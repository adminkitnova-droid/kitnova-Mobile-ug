import React, { useState } from 'react';
import { store } from '../../services/store';
import { ManualPaymentMethodConfig } from '../../types';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Building2,
  Save,
  X,
  Eye,
  EyeOff,
  Copy,
  Layers,
  HelpCircle
} from 'lucide-react';

export const AdminManualPayments: React.FC = () => {
  const [, setTick] = useState(0);
  const paymentMethods = store.manualPaymentMethods;

  const [editingMethod, setEditingMethod] = useState<ManualPaymentMethodConfig | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New method form state
  const [newTitle, setNewTitle] = useState('');
  const [newProvider, setNewProvider] = useState<ManualPaymentMethodConfig['provider']>('mtn_momo');
  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantNumber, setNewMerchantNumber] = useState('');
  const [newUssdTemplate, setNewUssdTemplate] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleActive = (method: ManualPaymentMethodConfig) => {
    store.updateManualPaymentMethod(method.id, { isActive: !method.isActive });
    showNotice(`Payment method "${method.title}" is now ${!method.isActive ? 'active on storefront' : 'disabled'}.`);
  };

  const handleCreateMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMerchantNumber.trim()) return;

    store.addManualPaymentMethod({
      title: newTitle.trim(),
      provider: newProvider,
      merchantName: newMerchantName.trim() || 'Kitnova Official Account',
      merchantNumber: newMerchantNumber.trim(),
      ussdTemplate: newUssdTemplate.trim() || undefined,
      instructions: newInstructions.trim() || 'Send payment and upload receipt screenshot.',
      isActive: true
    });

    setIsAdding(false);
    setNewTitle('');
    setNewMerchantName('');
    setNewMerchantNumber('');
    setNewUssdTemplate('');
    setNewInstructions('');
    showNotice('New payment instructions published to customers.');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;

    store.updateManualPaymentMethod(editingMethod.id, editingMethod);
    setEditingMethod(null);
    showNotice(`Updated ${editingMethod.title} instructions.`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            Treasury & Merchant Publishing
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#D4A029]" />
            Manual Payment Methods & Merchant Numbers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure published merchant codes, account names, and instructions shown to customers during checkout.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(true);
            setEditingMethod(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#D4A029] hover:bg-[#F0C760] text-[#0A1A3C] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Notice Banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Methods Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paymentMethods.map(m => {
          const isMtn = m.provider === 'mtn_momo';
          const isAirtel = m.provider === 'airtel_money';
          const isBank = m.provider === 'manual_bank';

          return (
            <div
              key={m.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                m.isActive
                  ? 'bg-[#0A1A3C] border-slate-700/80'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div className="space-y-3">
                {/* Provider Pill & Active Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono border ${
                      isMtn
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : isAirtel
                        ? 'bg-red-950/80 text-red-300 border-red-500/40'
                        : 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    {m.provider.replace(/_/g, ' ')}
                  </span>

                  <button
                    onClick={() => handleToggleActive(m)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      m.isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.isActive ? 'Active on Store' : 'Disabled'}
                  </button>
                </div>

                {/* Title & Merchant Number */}
                <div>
                  <h3 className="text-base font-bold text-white">{m.title}</h3>
                  <p className="text-xs text-slate-400">{m.merchantName}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
                    Merchant / Account No:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-black text-[#D4A029]">
                      {m.merchantNumber}
                    </span>
                    {m.ussdTemplate && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {m.ussdTemplate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Instructions */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                  {m.instructions}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setEditingMethod(m);
                    setIsAdding(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 text-[#D4A029] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => handleToggleActive(m)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  {m.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{m.isActive ? 'Hide' : 'Publish'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD METHOD MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateMethod}
            className="bg-[#0A1A3C] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4A029]" />
                Add New Merchant Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Type</label>
                <select
                  value={newProvider}
                  onChange={e => setNewProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-white"
                >
                  <option value="mtn_momo">MTN Mobile Money (MoMo Merchant / Pay)</option>
                  <option value="airtel_money">Airtel Money (Merchant Code)</option>
                  <option value="manual_bank">Bank Transfer (Centenary / Stanbic)</option>
                  <option value="cash_on_delivery">Cash On Delivery (Whitelisted Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Method Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MTN MoMo Merchant Pay"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-white"
                >
                </input>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merchant Code / Acc No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 829910"
                    value={newMerchantNumber}
                    onChange={e => setNewMerchantNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 font-mono text-[#D4A029] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VISHCOM TECH UG"
                    value={newMerchantName}
                    onChange={e => setNewMerchantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">USSD Quick Dial Template (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. *165*3*829910#"
                  value={newUssdTemplate}
                  onChange={e => setNewUssdTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Instructions for Customers</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Dial USSD code or enter Merchant ID in your Mobile Money app. Enter amount and upload receipt screenshot."
                  value={newInstructions}
                  onChange={e => setNewInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold hover:bg-[#F0C760]"
              >
                Publish Method
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT METHOD MODAL */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#0A1A3C] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#D4A029]" />
                Edit Payment Instructions ({editingMethod.title})
              </h3>
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingMethod.title}
                  onChange={e => setEditingMethod({ ...editingMethod, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merchant / Account No.</label>
                  <input
                    type="text"
                    required
                    value={editingMethod.merchantNumber}
                    onChange={e => setEditingMethod({ ...editingMethod, merchantNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 font-mono text-[#D4A029] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    value={editingMethod.merchantName}
                    onChange={e => setEditingMethod({ ...editingMethod, merchantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">USSD Quick Dial Template</label>
                <input
                  type="text"
                  value={editingMethod.ussdTemplate || ''}
                  onChange={e => setEditingMethod({ ...editingMethod, ussdTemplate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={editingMethod.instructions}
                  onChange={e => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/50 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold hover:bg-[#F0C760]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
