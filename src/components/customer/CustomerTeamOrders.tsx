import React, { useState } from 'react';
import { Users, Plus, Trash2, AlertTriangle, Check, ArrowRight, Shield } from 'lucide-react';
import { store } from '../../services/store';
import { TeamRosterMember } from '../../types';

interface CustomerTeamOrdersProps {
  onOrderSubmitted?: () => void;
}

export const CustomerTeamOrders: React.FC<CustomerTeamOrdersProps> = ({ onOrderSubmitted }) => {
  const [teamName, setTeamName] = useState('Kampala Corporate Stars FC');
  const [selectedProductId, setSelectedProductId] = useState(store.products[0].id);
  const [roster, setRoster] = useState<TeamRosterMember[]>([
    { id: 'p-1', playerName: 'SSEBUWUFU', number: '1', size: 'XL', position: 'GK' },
    { id: 'p-2', playerName: 'KIGOZI', number: '4', size: 'L', position: 'DEF' },
    { id: 'p-3', playerName: 'LWANGA', number: '5', size: 'L', position: 'DEF' },
    { id: 'p-4', playerName: 'MUKASA', number: '8', size: 'M', position: 'MID' },
    { id: 'p-5', playerName: 'SSERUNKUUMA', number: '9', size: 'L', position: 'FWD' },
    { id: 'p-6', playerName: 'TUMUSIIME', number: '10', size: 'M', position: 'MID' }
  ]);
  const [csvInput, setCsvInput] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const product = store.products.find(p => p.id === selectedProductId) || store.products[0];

  // Duplicate Number Check
  const numbers = roster.map(r => r.number.trim());
  const duplicateNumbers = numbers.filter((num, idx) => num && numbers.indexOf(num) !== idx);

  // Pricing
  const unitPrice = product.basePrice + store.pricing.namePrice + store.pricing.numberPrice;
  const isBulkDiscount = roster.length >= 10;
  const discountRate = isBulkDiscount ? 0.15 : roster.length >= 5 ? 0.1 : 0;
  const subtotal = roster.length * unitPrice;
  const discountAmount = Math.round(subtotal * discountRate);
  const totalPrice = subtotal - discountAmount;

  const addPlayer = () => {
    const nextNum = (roster.length + 1).toString();
    setRoster([
      ...roster,
      {
        id: `p-${Date.now()}`,
        playerName: `PLAYER ${roster.length + 1}`,
        number: nextNum,
        size: 'L',
        position: 'MID'
      }
    ]);
  };

  const updatePlayer = (id: string, updates: Partial<TeamRosterMember>) => {
    setRoster(roster.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removePlayer = (id: string) => {
    setRoster(roster.filter(p => p.id !== id));
  };

  const handleImportCsv = () => {
    const lines = csvInput.split('\n').filter(l => l.trim().length > 0);
    const parsed: TeamRosterMember[] = lines.map((line, idx) => {
      const parts = line.split(',').map(s => s.trim());
      return {
        id: `csv-${Date.now()}-${idx}`,
        playerName: (parts[0] || `PLAYER ${idx + 1}`).toUpperCase(),
        number: parts[1] || (idx + 1).toString(),
        size: parts[2] || 'L',
        position: parts[3] || 'MID'
      };
    });
    setRoster([...roster, ...parsed]);
    setCsvInput('');
    setShowCsvModal(false);
  };

  const handleSubmitTeam = () => {
    store.saveTeamOrder({
      teamName,
      baseProductId: product.id,
      productName: product.name,
      members: roster,
      unitBasePrice: product.basePrice,
      unitCustomizationPrice: store.pricing.namePrice + store.pricing.numberPrice,
      totalPrice
    });

    store.addNotification({
      title: `Team Order Received: ${teamName}`,
      message: `Squad roster of ${roster.length} kits submitted for ${teamName}. Total: UGX ${totalPrice.toLocaleString()}`,
      type: 'order',
      targetRole: 'admin'
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      if (onOrderSubmitted) onOrderSubmitted();
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A029]/15 border border-[#D4A029]/30 text-[#D4A029] text-xs font-semibold uppercase tracking-wider mb-2">
          <Users className="w-3.5 h-3.5" />
          Club & Corporate Squad Solutions
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Team Roster Order Builder
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Equip your entire squad with custom names, numbers, and sizes. Orders of 10+ kits receive an automatic 15% team discount.
        </p>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>Team roster order for <strong>{teamName}</strong> submitted! Our team manager will contact you for payment verification.</span>
        </div>
      )}

      {/* Configuration Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Team / Club Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="e.g. Kampala Legends FC"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-[#D4A029]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select Team Jersey Model
          </label>
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
          >
            {store.products.map(p => (
              <option key={p.id} value={p.id} className="bg-[#0A1A3C]">
                {p.name} — Base UGX {p.basePrice.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Controls & Duplicate Warning */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={addPlayer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Squad Member
          </button>
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0F2A5F] border border-slate-700 text-slate-200 font-semibold text-xs hover:text-white hover:border-[#D4A029] transition-colors cursor-pointer"
          >
            Import CSV Roster
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Squad Size: <strong className="text-white font-mono">{roster.length} Players</strong>
          {discountRate > 0 && (
            <span className="ml-2 text-emerald-400 font-bold">
              ({discountRate * 100}% Bulk Tier Applied)
            </span>
          )}
        </div>
      </div>

      {/* Duplicate Alert */}
      {duplicateNumbers.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Duplicate squad numbers detected: #{duplicateNumbers.join(', #')}. Please ensure each player has a unique number.</span>
        </div>
      )}

      {/* Player Roster Table */}
      <div className="bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Player Name (Back of Kit)</th>
                <th className="py-3 px-4">Squad Number</th>
                <th className="py-3 px-4">Jersey Size</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
              {roster.map((player, idx) => (
                <tr key={player.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={player.playerName}
                      onChange={e => updatePlayer(player.id, { playerName: e.target.value.toUpperCase() })}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0F2A5F]/30 border border-slate-700 font-bold text-xs uppercase text-white focus:outline-none focus:border-[#D4A029]"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      maxLength={2}
                      value={player.number}
                      onChange={e => updatePlayer(player.id, { number: e.target.value.replace(/\D/g, '') })}
                      className="w-14 px-2 py-1.5 rounded-lg bg-[#0F2A5F]/30 border border-slate-700 font-black text-xs font-mono text-center text-[#D4A029] focus:outline-none focus:border-[#D4A029]"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={player.size}
                      onChange={e => updatePlayer(player.id, { size: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0F2A5F]/30 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
                    >
                      {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => (
                        <option key={s} value={s} className="bg-[#0A1A3C]">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={player.position || 'MID'}
                      onChange={e => updatePlayer(player.id, { position: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0F2A5F]/30 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
                    >
                      <option value="GK" className="bg-[#0A1A3C]">Goalkeeper (GK)</option>
                      <option value="DEF" className="bg-[#0A1A3C]">Defender (DEF)</option>
                      <option value="MID" className="bg-[#0A1A3C]">Midfielder (MID)</option>
                      <option value="FWD" className="bg-[#0A1A3C]">Forward (FWD)</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Team Order Pricing & Submit */}
        <div className="p-6 bg-[#0F2A5F]/20 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 text-xs">
            <p className="text-slate-400">
              Unit Rate: <strong className="text-slate-200">UGX {unitPrice.toLocaleString()}</strong> per kit (includes base kit + name & number)
            </p>
            {discountAmount > 0 && (
              <p className="text-emerald-400 font-bold">
                Team Tier Discount Savings: -UGX {discountAmount.toLocaleString()}
              </p>
            )}
            <p className="text-base font-bold text-white">
              Grand Total: <span className="font-mono text-[#D4A029] text-xl">UGX {totalPrice.toLocaleString()}</span>
            </p>
          </div>

          <button
            onClick={handleSubmitTeam}
            disabled={roster.length === 0}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Submit {roster.length} Squad Kits</span>
            <ArrowRight className="w-4 h-4 text-[#0A1A3C]" />
          </button>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Quick CSV / Text Roster Import</h3>
            <p className="text-xs text-slate-400">
              Paste your player list in the format: <code>NAME, NUMBER, SIZE, POSITION</code>
            </p>
            <textarea
              rows={6}
              value={csvInput}
              onChange={e => setCsvInput(e.target.value)}
              placeholder="SSEBUWUFU, 1, XL, GK&#10;KIGOZI, 4, L, DEF&#10;MUKASA, 10, M, MID"
              className="w-full p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-[#D4A029]"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCsv}
                className="px-4 py-2 rounded-lg bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760]"
              >
                Parse & Append
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
