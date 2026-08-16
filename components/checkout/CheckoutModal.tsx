'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { BangladeshPaymentMethod } from '@/types';
import {
  X, ShieldCheck, QrCode, CheckCircle2,
  Lock, Loader2, Copy, Check, ArrowRight,
  Upload, Image as ImageIcon, Sparkles, Clock, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen, setIsCheckoutOpen, cart, cartSubtotal, cartDiscount, cartTotal,
    appliedCoupon, processCheckout, user, firebaseUser,
    paymentMethods, setIsAuthModalOpen,
  } = useApp();

  // Active payment methods (filtered to active only)
  const activeMethods = paymentMethods.filter(pm => pm.isActive);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'auth_required' | 'details' | 'processing' | 'success'>('details');
  const [latestOrderInfo, setLatestOrderInfo] = useState<{
    orderNumber: string;
    totalBdt: number;
    methodName: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Set default method when methods change
  useEffect(() => {
    if (activeMethods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(activeMethods[0].id);
    }
  }, [activeMethods, selectedMethodId]);

  // Auth checking
  useEffect(() => {
    if (isCheckoutOpen) {
      if (!firebaseUser) {
        setStep('auth_required');
      } else {
        setStep('details');
      }
    }
  }, [isCheckoutOpen, firebaseUser]);

  if (!isCheckoutOpen) return null;

  const currentMethod: BangladeshPaymentMethod =
    activeMethods.find(m => m.id === selectedMethodId) || activeMethods[0] || {
      id: 'bkash_default',
      name: 'bKash Personal',
      type: 'bkash',
      accountNumber: '01712-345678',
      accountType: 'Personal',
      qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=01712345678',
      instructions: 'Send Money to this personal number and enter your Transaction ID.',
      bdtRate: 125,
      isActive: true,
      color: '#e2136e',
    };

  const bdtRate = currentMethod.bdtRate || 125;
  const totalInBdt = Math.round(cartTotal * bdtRate);

  const handleCopy = (text: string, type: 'number' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'number') {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // Client-side image compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.65);
          setScreenshotBase64(compressed);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      setStep('auth_required');
      return;
    }
    if (!senderNumber.trim() || !transactionId.trim()) return;

    setIsProcessing(true);
    setStep('processing');

    try {
      const order = await processCheckout(currentMethod.type, firebaseUser.email || user.email, {
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim().toUpperCase(),
        screenshotUrl: screenshotBase64 || '',
        paymentMethodName: currentMethod.name,
        totalBdt: totalInBdt,
      });

      setLatestOrderInfo({
        orderNumber: order.orderNumber,
        totalBdt: totalInBdt,
        methodName: currentMethod.name,
      });
      setStep('success');

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e2136e', '#f7931e', '#06b6d4', '#10b981'],
        });
      } catch { }
    } catch (err) {
      console.error('Checkout error:', err);
      setStep('details');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (step !== 'processing') {
              setIsCheckoutOpen(false);
              setStep('details');
            }
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/10 p-6 sm:p-7 shadow-2xl z-10 space-y-5 my-6 backdrop-blur-xl overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setIsCheckoutOpen(false);
              setStep('details');
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* 1. AUTH REQUIRED STATE */}
          {step === 'auth_required' && (
            <div className="py-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-zinc-800 border border-white/10 text-cyan-400 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Sign In to Complete Checkout</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Your subscriptions and vault credentials will be tied securely to your Google account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-6 py-3 rounded-2xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-colors shadow-md"
              >
                Sign In with Google
              </button>
            </div>
          )}

          {/* 2. PROCESSING STATE */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Submitting Payment Proof...</h3>
                <p className="text-xs text-zinc-400">Recording your transaction in real time.</p>
              </div>
            </div>
          )}

          {/* 3. SUCCESS / TRACKING STATE */}
          {step === 'success' && latestOrderInfo && (
            <div className="py-4 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Order Submitted
                </span>
                <h3 className="text-xl font-black text-white pt-1">Payment Proof Received!</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Your order <span className="text-white font-mono font-bold">#{latestOrderInfo.orderNumber}</span> has been routed to our verification queue.
                </p>
              </div>

              {/* Status Timeline */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400">Total Paid</span>
                  <span className="font-bold text-white font-mono">৳{latestOrderInfo.totalBdt.toLocaleString()} BDT (${cartTotal.toFixed(2)})</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400">Payment Method</span>
                  <span className="font-semibold text-white">{latestOrderInfo.methodName}</span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>1. Transaction Submitted</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 text-[11px] font-bold animate-pulse">
                    <Clock className="h-3.5 w-3.5" />
                    <span>2. Admin Verification in Progress (5-15 mins)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                    <div className="h-3.5 w-3.5 rounded-full border border-zinc-700 flex items-center justify-center text-[9px]">3</div>
                    <span>3. Instant Account Credentials Delivered to Vault</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setStep('details');
                    window.location.href = '/dashboard';
                  }}
                  className="w-full py-3 rounded-2xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-colors shadow-md"
                >
                  View Order in Dashboard
                </button>
              </div>
            </div>
          )}

          {/* 4. PAYMENT FORM STATE */}
          {step === 'details' && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 text-cyan-400 text-[10px] font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  <span>BANGLADESH INSTANT PAYMENT</span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white">Select Payment Method</h2>
              </div>

              {/* Payment Method Switcher */}
              <div className="grid grid-cols-3 gap-2">
                {activeMethods.map((m) => {
                  const isSelected = selectedMethodId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethodId(m.id)}
                      style={{
                        borderColor: isSelected ? (m.color || '#06b6d4') : 'rgba(255,255,255,0.08)',
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all relative ${
                        isSelected
                          ? 'bg-zinc-800/90 shadow-md shadow-black/40'
                          : 'bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      <div
                        className="h-2 w-2 rounded-full absolute top-2 right-2"
                        style={{ backgroundColor: m.color || '#06b6d4' }}
                      />
                      <p className="font-bold text-xs text-white">{m.name}</p>
                      <span className="text-[10px] text-zinc-400 block">{m.accountType}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Box with Account Number, QR & Amount */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                {/* Total in BDT & USD */}
                <div className="flex items-center justify-between bg-zinc-900/90 p-2.5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-semibold">TOTAL PAYABLE AMOUNT</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-white font-mono">
                        ৳{totalInBdt.toLocaleString()} BDT
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium">(${cartTotal.toFixed(2)} USD)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(totalInBdt.toString(), 'amount')}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedAmount ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedAmount ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Account Number & QR Row */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* QR code thumbnail */}
                  {currentMethod.qrCodeImage && (
                    <div className="h-20 w-20 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-md">
                      <img
                        src={currentMethod.qrCodeImage}
                        alt="QR Code"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Number & Type */}
                  <div className="flex-1 w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400 font-semibold">{currentMethod.name} Number:</span>
                      <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/20">
                        {currentMethod.accountType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/10">
                      <span className="font-mono font-black text-sm text-white tracking-wider">
                        {currentMethod.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentMethod.accountNumber.replace(/[^0-9]/g, ''), 'number')}
                        className="px-2.5 py-1 rounded-lg bg-white text-zinc-950 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        {copiedNumber ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedNumber ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions note */}
                <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                  {currentMethod.instructions || 'Send Money to the number above, then submit the Sender Number and TrxID below.'}
                </p>
              </div>

              {/* Form Inputs: Sender Phone & TrxID */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 block">Sender Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 017XXXXXXXX"
                    value={senderNumber}
                    onChange={e => setSenderNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 block">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9L87X5ZP0A"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 font-mono uppercase focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Screenshot Upload (Optional / Compressed) */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-zinc-300 flex items-center justify-between">
                  <span>Payment Screenshot Proof</span>
                  <span className="text-[10px] text-zinc-500 font-normal">(Auto-compressed · Optional)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {screenshotBase64 ? (
                  <div className="relative rounded-2xl bg-zinc-950 border border-white/10 p-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={screenshotBase64}
                        alt="Proof Preview"
                        className="h-10 w-10 rounded-lg object-cover border border-white/10"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Screenshot Attached</span>
                        <span className="text-[10px] text-emerald-400 font-medium">✓ Ready for verification</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotBase64(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-zinc-500 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-zinc-900 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800/60 border border-dashed border-white/15 text-zinc-400 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isCompressing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    ) : (
                      <Upload className="h-4 w-4 text-cyan-400" />
                    )}
                    <span className="text-xs font-semibold">
                      {isCompressing ? 'Compressing Screenshot...' : 'Click to Upload Payment Screenshot'}
                    </span>
                  </button>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !senderNumber.trim() || !transactionId.trim()}
                  className="w-full py-3 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 font-black text-xs transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Submit Payment Verification</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
