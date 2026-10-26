import React from 'react';
import { BookOpen, Shield, Truck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

export const AdminDocs: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
          STANDARD OPERATING PROCEDURES (SOP)
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Operations & Reconciliation Handbook
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operational manual for jersey heat-press production, mobile money audits, rider dispatch SLAs, and Supabase RLS security.
        </p>
      </div>

      {/* Modules Handbook */}
      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5 text-[#D4A029] font-bold text-sm">
            <CreditCard className="w-4 h-4" />
            <h2>1. Manual Payment Audit & Verification Protocol</h2>
          </div>
          <p>
            Kitnova Sportswear does not auto-credit manual mobile money or bank deposits. When a customer completes checkout using MTN MoMo or Airtel Money:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>The order enters status <strong className="text-white">Payment Pending Verification</strong>.</li>
            <li>Finance auditors must cross-reference the customer&apos;s Transaction Reference against the merchant web portals (MTN Merchant 829910 or Airtel Paybill 441092).</li>
            <li>Inspect the uploaded receipt screenshot for valid timestamp, sender MSISDN, and exact UGX total.</li>
            <li>Once verified, click <strong className="text-emerald-400">Approve & Mark Paid</strong>. The order immediately transitions to production.</li>
            <li>If the reference is invalid, click <strong className="text-red-400">Reject</strong> and specify the exact discrepancy so the customer is notified.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5 text-[#D4A029] font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <h2>2. Custom Jersey Studio Production Standards</h2>
          </div>
          <p>
            Customer designs created in the 2D & 3D Customizer Studio are rendered into high-resolution production specifications:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Player Names: Heat-pressed with vinyl at 160°C for 15 seconds. Default letter spacing: 2px.</li>
            <li>Player Numbers: Maximum height 25cm for adult sizes (M, L, XL, 2XL) and 20cm for junior sizes.</li>
            <li>Crests & Badges: High-definition 3D silicone heat-transfer patches placed 7cm below shoulder seam on left chest.</li>
            <li>All custom layers (canvas coordinates X/Y, scale, and color hex) are permanently serialized onto the order item object.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5 text-[#D4A029] font-bold text-sm">
            <Truck className="w-4 h-4" />
            <h2>3. Rider Dispatch & Offline Proof of Delivery (POD)</h2>
          </div>
          <p>
            Kampala couriers operate under strict fulfillment SLAs across Central, Nakawa, Rubaga, and Makindye divisions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Express Priority orders must be dispatched within 20 minutes of production packaging.</li>
            <li>When offline, the courier&apos;s app persists recipient signature and delivery photos locally to IndexedDB (<code className="text-[#D4A029] font-mono">offlinePodDb</code>).</li>
            <li>As soon as the rider re-enters 4G/3G network coverage, the Service Worker background sync queues automatic POST requests to Supabase.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5 text-[#D4A029] font-bold text-sm">
            <Shield className="w-4 h-4" />
            <h2>4. Security Architecture & RBAC Isolation</h2>
          </div>
          <p>
            Kitnova enforces strict application segregation:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong className="text-white">Application A</strong> (Customer & Rider Mobile App) never packages administrative routes, pricing edit controls, or audit logs.</li>
            <li><strong className="text-white">Application B</strong> (Super Admin Console) requires authenticated staff accounts with one of four verified sub-roles: <code className="text-amber-300 font-mono">super_admin</code>, <code className="text-blue-300 font-mono">operations_admin</code>, <code className="text-emerald-300 font-mono">product_admin</code>, or <code className="text-purple-300 font-mono">support_admin</code>.</li>
            <li>Customers and riders attempting to access Application B are denied at the entry boundary.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
