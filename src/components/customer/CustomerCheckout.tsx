import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, ShieldCheck, Smartphone, CreditCard, Building2, Truck, AlertCircle, Copy, Upload, Image as ImageIcon, X, Tag } from 'lucide-react';
import { CartItem, DeliveryZone, PaymentMethod, Order } from '../../types';
import { store } from '../../services/store';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { supabase } from '../../services/supabaseClient';
import { CachedImage } from '../common/CachedImage';

interface CustomerCheckoutProps {
  items: CartItem[];
  discount: number;
  selectedZone: DeliveryZone;
  onBackToCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CustomerCheckout: React.FC<CustomerCheckoutProps> = ({
  items,
  discount: initialDiscount,
  selectedZone,
  onBackToCart,
  onOrderPlaced
}) => {
  // Form fields
  const [fullName, setFullName] = useState('David Mukasa');
  const [phone, setPhone] = useState('+256 752 443 890');
  const [email, setEmail] = useState('david.mukasa@vishcom.co.ug');
  const [streetAddress, setStreetAddress] = useState('Plot 8 Windsor Loop, Kololo');
  const [landmark, setLandmark] = useState('Near British High Commission');
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Please call when approaching the gate.');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [momoRef, setMomoRef] = useState('');
  const [relworxPhone, setRelworxPhone] = useState('+256752443890');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  // Voucher / Coupon
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(initialDiscount);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const proofFileRef = useRef<HTMLInputElement | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.totalUnitPrice * item.quantity, 0);
  const baseDelivery = subtotal >= store.settings.freeDeliveryThreshold ? 0 : selectedZone.fee;
  const speedSurcharge = deliveryOption === 'express' ? 8000 : 0;
  const deliveryFee = baseDelivery + speedSurcharge;
  const totalAmount = Math.max(0, subtotal - promoDiscount + deliveryFee);

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    const found = store.coupons.find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase() && c.isActive);
    if (!found) {
      setPromoMessage({ type: 'error', text: 'Invalid or expired promotional code.' });
      return;
    }
    if (subtotal < found.minSpend) {
      setPromoMessage({ type: 'error', text: `Minimum spend for ${found.code} is UGX ${found.minSpend.toLocaleString()}` });
      return;
    }
    const val = found.discountType === 'percentage' ? Math.round((subtotal * found.discountValue) / 100) : found.discountValue;
    setPromoDiscount(val);
    setPromoMessage({ type: 'success', text: `Applied code ${found.code}: -UGX ${val.toLocaleString()}` });
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProof(true);
    setProofError(null);
    setUploadProgress(10);

    try {
      const res = await uploadToCloudinary(file, (percent) => setUploadProgress(percent));
      if (res.success && res.secureUrl) {
        setProofUrl(res.secureUrl);
        setUploadProgress(100);
      } else {
        setProofError(res.error || 'Failed to upload proof. Please retry.');
      }
    } catch (err: any) {
      setProofError(err?.message || 'Error uploading proof receipt.');
    } finally {
      setIsUploadingProof(false);
      e.target.value = '';
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    // Manual payments require the customer's real transaction reference.
    if ((paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money' || paymentMethod === 'manual_bank') && !momoRef.trim()) {
      alert('Please enter your transaction reference ID received via SMS or banking confirmation.');
      return;
    }

    if (paymentMethod === 'relworx_momo') {
      const normalizedMsisdn = relworxPhone.replace(/[\s()-]/g, '');
      if (!/^\+256\d{9}$/.test(normalizedMsisdn)) {
        setCheckoutError('Enter a valid Ugandan mobile number in +256XXXXXXXXX format.');
        return;
      }
      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        setCheckoutError('The order total must be greater than UGX 0 to request a payment.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (sessionError || !session?.access_token || !session.user?.id) {
          throw new Error('Please sign in with your verified KITNOVA account before using Relworx Mobile Money.');
        }

        // Create a real Supabase order first; the Edge Function only accepts a real order UUID.
        const orderCode = `KTN-${Date.now().toString(36).toUpperCase()}`;
        const delivery = {
          full_name: fullName,
          phone,
          zone_id: selectedZone.id,
          zone_name: selectedZone.name,
          street_address: streetAddress,
          landmark,
          delivery_option: deliveryOption,
          delivery_instructions: deliveryInstructions
        };
        const { data: backendOrder, error: insertError } = await supabase
          .from('orders')
          .insert({
            code: orderCode,
            user_uid: session.user.id,
            customer_name: fullName,
            customer_email: email,
            items: items.map(item => ({
              product_id: item.productId,
              name: item.productName,
              image: item.productImage,
              size: item.size,
              quantity: item.quantity,
              unit_price: item.totalUnitPrice,
              custom_summary: item.customSummary
            })),
            subtotal: Math.max(0, Math.round(subtotal - promoDiscount)),
            delivery_fee: Math.round(deliveryFee),
            gift_packaging: false,
            gift_fee: 0,
            total: Math.round(totalAmount),
            status: 'payment_pending',
            payment_status: 'pending',
            payment: { provider: 'relworx', status: 'pending', currency: 'UGX', discount: promoDiscount },
            delivery
          })
          .select('id, code, total')
          .single();

        if (insertError || !backendOrder) {
          throw new Error(insertError?.message || 'Could not save the order to Supabase.');
        }

        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('relworx-checkout', {
          body: { orderId: backendOrder.id, msisdn: normalizedMsisdn },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (paymentError) {
          throw new Error(paymentError.message || 'Relworx payment request failed.');
        }
        if (!paymentData?.success) {
          throw new Error(paymentData?.error || paymentData?.message || 'Relworx could not start the payment request.');
        }

        const order = store.createOrder({
          customerId: session.user.id,
          customerName: fullName,
          customerPhone: phone,
          customerEmail: email,
          items,
          subtotal,
          discount: promoDiscount,
          deliveryFee,
          totalAmount,
          paymentMethod: 'relworx_momo',
          paymentStatus: 'payment_initiated',
          paymentReference: paymentData.internal_reference || paymentData.reference || backendOrder.code,
          status: 'payment_pending',
          deliveryAddress: {
            fullName,
            phone,
            zoneId: selectedZone.id,
            zoneName: selectedZone.name,
            streetAddress,
            landmark,
            deliveryOption,
            deliveryInstructions
          }
        });
        setIsSubmitting(false);
        onOrderPlaced(order);
        return;
      } catch (err: any) {
        setCheckoutError(err?.message || 'Could not start Relworx payment. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const isCard = paymentMethod === 'stripe_card';
      // Never mark a card payment as paid without a verified provider callback.
      if (isCard) {
        setCheckoutError('Card payments are not connected to a verified payment gateway yet. Please choose Relworx or a manual payment method.');
        setIsSubmitting(false);
        return;
      }
      const paymentStatus = 'pending_verification';
      const order = store.createOrder({
        customerId: store.getCurrentUser()?.id || `cust-${Date.now()}`,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        items,
        subtotal,
        discount: promoDiscount,
        deliveryFee,
        totalAmount,
        paymentMethod,
        paymentStatus,
        paymentReference: momoRef || (paymentMethod === 'mtn_momo' ? `MTN-UG-${Math.floor(10000000 + Math.random() * 90000000)}` : `REF-${Date.now()}`),
        paymentProofUrl: proofUrl || undefined,
        status: 'customization_review',
        deliveryAddress: {
          fullName,
          phone,
          zoneId: selectedZone.id,
          zoneName: selectedZone.name,
          streetAddress,
          landmark,
          deliveryOption,
          deliveryInstructions
        }
      });
      setIsSubmitting(false);
      onOrderPlaced(order);
    }, 1000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={onBackToCart}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#D4A029] transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping Cart
      </button>

      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pb-6 border-b border-slate-800">
        Secure Checkout
      </h1>

      <form onSubmit={handleSubmitOrder} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact & Delivery Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0F2A5F] text-[#D4A029] flex items-center justify-center text-xs">1</span>
              Customer Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (+256)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address for Receipt</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0F2A5F] text-[#D4A029] flex items-center justify-center text-xs">2</span>
              Kampala Delivery Destination
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Selected Zone</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedZone.name} (Estimated: ${selectedZone.estimatedTime})`}
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/20 border border-slate-800 text-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Street Address, Building or Estate</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                  placeholder="e.g. Plot 14 Windsor Loop, Apartment 3B"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Closest Landmark (helps rider navigate)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Acacia Mall, opposite Shell petrol station"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              {/* Delivery Speed Selector */}
              <div>
                <label className="block font-medium text-slate-300 mb-2">Delivery Speed</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryOption('standard')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      deliveryOption === 'standard'
                        ? 'bg-[#D4A029]/15 border-[#D4A029] text-white'
                        : 'bg-[#0F2A5F]/20 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Standard Delivery</div>
                    <div className="text-[11px] text-slate-400">2 - 4 Hours dispatch</div>
                    <div className="mt-1 font-mono text-[#D4A029] text-xs">Included in Zone fee</div>
                  </div>

                  <div
                    onClick={() => setDeliveryOption('express')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      deliveryOption === 'express'
                        ? 'bg-[#D4A029]/15 border-[#D4A029] text-white'
                        : 'bg-[#0F2A5F]/20 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Express Priority</div>
                    <div className="text-[11px] text-slate-400">Under 90 Minutes direct</div>
                    <div className="mt-1 font-mono text-[#D4A029] text-xs">+UGX 8,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Manual Instructions (Spec Section 4 & 5) */}
          <div className="bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0F2A5F] text-[#D4A029] flex items-center justify-center text-xs">3</span>
                Official Payment Methods
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                ADMIN PUBLISHED
              </span>
            </h2>

            <div className="space-y-3">
              {/* MTN MoMo */}
              <label
                onClick={() => setPaymentMethod('mtn_momo')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'mtn_momo'
                    ? 'bg-[#D4A029]/15 border-[#D4A029]'
                    : 'bg-[#0F2A5F]/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFCC00] text-[#0A1A3C] font-black flex items-center justify-center text-sm shadow">
                    MTN
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">MTN Mobile Money (Merchant Pay)</p>
                    <p className="text-[11px] text-slate-400 font-mono">Merchant Code: 829910 · KITNOVA UG</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'mtn_momo'}
                  onChange={() => setPaymentMethod('mtn_momo')}
                  className="accent-[#D4A029]"
                />
              </label>

              {/* Airtel Money */}
              <label
                onClick={() => setPaymentMethod('airtel_money')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'airtel_money'
                    ? 'bg-[#D4A029]/15 border-[#D4A029]'
                    : 'bg-[#0F2A5F]/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF0000] text-white font-black flex items-center justify-center text-sm shadow">
                    AIR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Airtel Money (Paybill)</p>
                    <p className="text-[11px] text-slate-400 font-mono">Paybill: 441092 · KITNOVA SPORTSWEAR</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'airtel_money'}
                  onChange={() => setPaymentMethod('airtel_money')}
                  className="accent-[#D4A029]"
                />
              </label>

              {/* Relworx automated Mobile Money */}
              <label
                onClick={() => setPaymentMethod('relworx_momo')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'relworx_momo'
                    ? 'bg-[#D4A029]/15 border-[#D4A029]'
                    : 'bg-[#0F2A5F]/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white font-black flex items-center justify-center text-xs shadow">MM</div>
                  <div>
                    <p className="text-xs font-bold text-white">Mobile Money · Relworx</p>
                    <p className="text-[11px] text-slate-400">Push payment request to MTN or Airtel number</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'relworx_momo'}
                  onChange={() => setPaymentMethod('relworx_momo')}
                  className="accent-[#D4A029]"
                />
              </label>

              {/* Bank Wire / Deposit */}
              <label
                onClick={() => setPaymentMethod('manual_bank')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'manual_bank'
                    ? 'bg-[#D4A029]/15 border-[#D4A029]'
                    : 'bg-[#0F2A5F]/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0F2A5F] text-[#D4A029] font-black flex items-center justify-center text-xs shadow border border-slate-700">
                    <Building2 className="w-5 h-5 text-[#D4A029]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Centenary Bank Deposit / EFT</p>
                    <p className="text-[11px] text-slate-400 font-mono">Account: 3100088921 · Acacia Mall</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'manual_bank'}
                  onChange={() => setPaymentMethod('manual_bank')}
                  className="accent-[#D4A029]"
                />
              </label>

              {/* Credit Card / Stripe */}
              <label
                onClick={() => setPaymentMethod('stripe_card')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'stripe_card'
                    ? 'bg-[#D4A029]/15 border-[#D4A029]'
                    : 'bg-[#0F2A5F]/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0F2A5F] text-[#D4A029] font-black flex items-center justify-center text-xs shadow border border-slate-700">
                    <CreditCard className="w-5 h-5 text-[#D4A029]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Visa / Mastercard / Card</p>
                    <p className="text-[11px] text-slate-400">Instant direct card gateway</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'stripe_card'}
                  onChange={() => setPaymentMethod('stripe_card')}
                  className="accent-[#D4A029]"
                />
              </label>
            </div>

            {paymentMethod === 'relworx_momo' && (
              <div className="p-4 rounded-xl bg-[#0F2A5F]/40 border border-emerald-500/30 space-y-3 text-xs">
                <div className="flex items-start gap-2 text-emerald-300">
                  <Smartphone className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Secure Mobile Money request</p>
                    <p className="text-[11px] text-slate-300 mt-1">Relworx will send a payment prompt to the number below. Approve it on your phone. This order remains pending until the server verifies the payment callback.</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="relworx-phone" className="block font-semibold text-slate-200 mb-1">Mobile Money number</label>
                  <input
                    id="relworx-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={relworxPhone}
                    onChange={e => setRelworxPhone(e.target.value)}
                    placeholder="+256752443890"
                    className="w-full px-3 py-3 rounded-xl bg-[#0A1A3C] border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-[#D4A029]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Use international format: +256 followed by 9 digits.</p>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-3 text-sm">
                  <span className="text-slate-300">Amount to approve</span>
                  <strong className="font-mono text-[#D4A029]">UGX {totalAmount.toLocaleString()}</strong>
                </div>
                {checkoutError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-red-300">{checkoutError}</p>}
              </div>
            )}

            {/* Manual Payment Step-by-Step Instructions & Receipt Upload */}
            {(paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money' || paymentMethod === 'manual_bank') && (
              <div className="p-4 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 space-y-4 text-xs">
                {paymentMethod === 'mtn_momo' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">1. Send MTN MoMo Payment:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('829910')}
                        className="px-2 py-1 rounded bg-[#D4A029]/20 hover:bg-[#D4A029]/30 text-[#D4A029] font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedCode === '829910' ? 'Copied 829910!' : 'Copy Code (829910)'}</span>
                      </button>
                    </div>
                    <div className="bg-[#0A1A3C] p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                      <p>Dial: <strong className="text-[#D4A029]">*165*3#</strong></p>
                      <p>Merchant Code: <strong className="text-white">829910</strong> (KITNOVA SPORTSWEAR)</p>
                      <p>Amount: <strong className="text-[#D4A029]">UGX {totalAmount.toLocaleString()}</strong></p>
                      <p>Reference: <strong className="text-white">{fullName}</strong></p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'airtel_money' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">1. Send Airtel Money Payment:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('441092')}
                        className="px-2 py-1 rounded bg-[#D4A029]/20 hover:bg-[#D4A029]/30 text-[#D4A029] font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedCode === '441092' ? 'Copied 441092!' : 'Copy Paybill (441092)'}</span>
                      </button>
                    </div>
                    <div className="bg-[#0A1A3C] p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                      <p>Dial: <strong className="text-[#D4A029]">*185*9#</strong></p>
                      <p>Business Number: <strong className="text-white">441092</strong> (KITNOVA)</p>
                      <p>Amount: <strong className="text-[#D4A029]">UGX {totalAmount.toLocaleString()}</strong></p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'manual_bank' && (
                  <div className="space-y-2">
                    <span className="font-bold text-white text-xs">1. Centenary Bank Deposit Information:</span>
                    <div className="bg-[#0A1A3C] p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                      <p>Bank: <strong className="text-white">Centenary Bank Uganda</strong></p>
                      <p>Account Name: <strong className="text-white">Kitnova Sportswear Ltd</strong></p>
                      <p>Account No: <strong className="text-[#D4A029]">3100088921</strong></p>
                      <p>Branch: <strong className="text-white">Acacia Mall Corporate Branch</strong></p>
                    </div>
                  </div>
                )}

                {/* Step 2: Reference Number Input */}
                <div className="space-y-1.5 pt-2 border-t border-slate-700">
                  <label className="block font-bold text-white text-xs">
                    2. Transaction Reference / Confirmation ID <span className="text-red-400">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Enter the SMS transaction ID received (e.g. MTN-UG-882910, or Airtel Ref 449210):
                  </p>
                  <input
                    type="text"
                    required
                    value={momoRef}
                    onChange={e => setMomoRef(e.target.value.toUpperCase())}
                    placeholder="e.g. MTN-UG-88291039 or MP261023.1042"
                    className="w-full px-3 py-2 rounded-xl bg-[#0A1A3C] border border-slate-700 text-xs font-mono uppercase text-[#D4A029] focus:outline-none focus:border-[#D4A029]"
                  />
                </div>

                {/* Step 3: Cloudinary Receipt Screenshot Upload */}
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <label className="block font-bold text-white text-xs">
                    3. Upload Payment Receipt Screenshot (Cloudinary CDN)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Upload a screenshot of the confirmation SMS or bank deposit receipt to expedite admin approval.
                  </p>

                  <input
                    type="file"
                    ref={proofFileRef}
                    onChange={handleProofUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {proofUrl ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A1A3C] border border-emerald-500/40">
                      <CachedImage
                        src={proofUrl}
                        alt="Payment Proof"
                        className="w-14 h-14 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Receipt Uploaded to Cloudinary
                        </p>
                        <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                          {proofUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProofUrl(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove uploaded receipt"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        disabled={isUploadingProof}
                        onClick={() => proofFileRef.current?.click()}
                        className="w-full py-3 px-4 rounded-xl border border-dashed border-[#D4A029]/50 hover:border-[#D4A029] bg-[#0A1A3C]/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingProof ? (
                          <span className="flex items-center gap-2 text-[#D4A029]">
                            <span className="w-3.5 h-3.5 border-2 border-[#D4A029] border-t-transparent rounded-full animate-spin" />
                            Uploading to Cloudinary ({uploadProgress}%)...
                          </span>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#D4A029]" />
                            <span>Select Screenshot or Receipt Photo</span>
                          </>
                        )}
                      </button>
                      {proofError && (
                        <p className="text-[11px] text-red-400 mt-1">{proofError}</p>
                      )}
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300">
                    <p className="font-semibold">Verification Notice:</p>
                    <p className="text-amber-200/80">
                      Your order will be submitted with status <strong className="text-white">Payment Pending Verification</strong>. Once Super Admin audits the reference in the Mobile Money portal, cutting & customization will begin.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary, Coupon Promo & Place Order */}
        <div className="lg:col-span-5 bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white">Review & Complete Order</h2>

          {/* Items Preview */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <CachedImage
                  src={item.productImage || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
                  alt={item.productName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-200 truncate">{item.productName}</p>
                  <p className="text-[11px] text-slate-400">
                    Size: {item.size} · Qty: {item.quantity}
                  </p>
                  {item.customSummary && (
                    <p className="text-[10px] text-[#D4A029] truncate">
                      Customized: {item.customSummary.playerName} #{item.customSummary.playerNumber}
                    </p>
                  )}
                </div>
                <span className="font-mono font-bold text-white shrink-0">
                  UGX {(item.totalUnitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code Input */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D4A029]" />
              Promotional Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. KITNOVA10, CRANES26"
                className="flex-1 px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 uppercase focus:outline-none focus:border-[#D4A029]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-xl bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 border border-slate-700 text-xs font-bold text-[#D4A029] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {promoMessage && (
              <p
                className={`text-[11px] ${
                  promoMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {promoMessage.text}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Total</span>
              <span className="font-mono text-white">UGX {subtotal.toLocaleString()}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Promotional Discount</span>
                <span className="font-mono">-UGX {promoDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Delivery Fee ({selectedZone.name})</span>
              <span className="font-mono text-white">
                {deliveryFee === 0 ? 'FREE' : `UGX ${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline font-bold text-sm">
              <span className="text-white">Total Amount Due</span>
              <span className="text-xl font-black font-mono text-[#D4A029]">
                UGX {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isSubmitting || isUploadingProof}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0A1A3C] border-t-transparent rounded-full animate-spin" />
                {paymentMethod === 'relworx_momo' ? 'Requesting Mobile Money Payment...' : 'Submitting Order & Notifying Dispatch...'}
              </span>
            ) : (
              <span>Confirm & Place Order</span>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 leading-normal">
            By placing this order you agree to KITNOVA sportswear terms. Orders with custom player names cannot be refunded once cutting & heat-pressing starts.
          </p>
        </div>
      </form>
    </div>
  );
};
