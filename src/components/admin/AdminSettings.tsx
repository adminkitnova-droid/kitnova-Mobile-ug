import React, { useState } from 'react';
import { Settings, Shield, Server, Database, Cloud, Bell, Save, Check } from 'lucide-react';
import { store } from '../../services/store';

export const AdminSettings: React.FC = () => {
  const settings = store.settings;
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [freeThreshold, setFreeThreshold] = useState(settings.freeDeliveryThreshold);
  const [standardFee, setStandardFee] = useState(settings.standardDeliveryFee);
  const [expressFee, setExpressFee] = useState(settings.expressDeliveryFee);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      maintenanceMode,
      freeDeliveryThreshold: freeThreshold,
      standardDeliveryFee: standardFee,
      expressDeliveryFee: expressFee
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
            Platform Governance
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Settings & Backend Service Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global delivery rates, maintenance switches, and Vishcom Tech Uganda production service configuration.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          Platform configuration updated successfully!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Business & Logistics Config */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#D4A029]" />
            Business & Delivery Rates
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company & Brand</label>
              <input
                type="text"
                disabled
                value="KITNOVA JERSEY · Vishcom Tech Company UG"
                className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/20 border border-slate-800 text-slate-400 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Base Currency</label>
              <input
                type="text"
                disabled
                value="UGX (Ugandan Shilling)"
                className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/20 border border-slate-800 text-slate-400 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Free Delivery Order Threshold (UGX)
              </label>
              <input
                type="number"
                step={10000}
                value={freeThreshold}
                onChange={e => setFreeThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:border-[#D4A029]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Default Standard Delivery (UGX)</label>
                <input
                  type="number"
                  step={500}
                  value={standardFee}
                  onChange={e => setStandardFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Express Courier Surcharge (UGX)</label>
                <input
                  type="number"
                  step={500}
                  value={expressFee}
                  onChange={e => setExpressFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:border-[#D4A029]"
                />
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Platform Maintenance Mode</span>
                <span className="text-slate-400 text-[11px]">Temporarily pauses checkout and Studio order submission</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={e => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-[#D4A029]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors cursor-pointer shadow-lg"
          >
            Save Platform Settings
          </button>
        </div>

        {/* Right Column: Service Configuration Inventory (Spec Section 16) */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-[#D4A029]" />
            Active Service Configuration Inventory
          </h2>

          <div className="space-y-4 text-xs">
            {/* Supabase Section */}
            <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  16.1 Supabase Production Backend
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  CONNECTED
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <p><span className="text-slate-500">URL:</span> {settings.serviceConfig.supabaseUrl}</p>
                <p><span className="text-slate-500">Anon Key:</span> {settings.serviceConfig.supabaseAnonKey.slice(0, 24)}...</p>
                <p className="text-[10px] text-slate-400 italic">Service-role key is protected server-side.</p>
              </div>
            </div>

            {/* Firebase Section */}
            <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  16.2 Firebase Cloud Messaging & Push
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  CONFIGURED
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <p><span className="text-slate-500">Project ID:</span> {settings.serviceConfig.firebaseProjectId}</p>
                <p><span className="text-slate-500">App ID:</span> {settings.serviceConfig.firebaseAppId}</p>
                <p className="text-[10px] text-slate-400 italic">Handles Android FCM and background delivery notifications.</p>
              </div>
            </div>

            {/* Cloudinary Section */}
            <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  16.3 Cloudinary Media Storage
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                  READY
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <p><span className="text-slate-500">Cloud Name:</span> {settings.serviceConfig.cloudinaryCloudName}</p>
                <p><span className="text-slate-500">Preset:</span> {settings.serviceConfig.cloudinaryPreset}</p>
                <p className="text-[10px] text-slate-400 italic">Unsigned presets for customer crests and proof of delivery photos.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
