'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { PaymentMethod } from '@/types';
import {
  X, ShieldCheck, CreditCard, QrCode, Zap, CheckCircle2,
  Lock, Loader2, Copy, Check, ArrowRight, Wallet, LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen, setIsCheckoutOpen, cart, cartSubtotal, cartDiscount, cartTotal,
    appliedCoupon, processCheckout, user, firebaseUser,
    setActiveVaultSub, subscriptions, setIsAuthModalOpen,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto_usdt');
  const [emailInput, setEmailInput] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'auth_required' | 'details' | 'processing' | 'success'>('details');
  const [latestOrderNumber, setLatestOrderNumber] = useState<string | null>(null);

  // Keep email synced with logged-in user
  useEffect(() => {
    if (firebaseUser?.email) setEmailInput(firebaseUser.email);
  }, [firebaseUser]);

  // If modal opens and user not logged in, show auth prompt
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(firebaseUser ? 'details' : 'auth_required');
    }
  }, [isCheckoutOpen, firebaseUser]);

  if (!isCheckoutOpen) return null;

  const cryptoAddress = 'TK9GTW2xvXBjmv6FTcNtBDxRuMp7fQ3Q5x';

  const handleCopyCrypto = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handlePayNow = async () => {
    if (!firebaseUser) { setStep('auth_required'); return; }
    setIsProcessing(true);
    setStep('processing');
    setTimeout(async () => {
      try {
        const order = await processCheckout(paymentMethod, emailInput);
        setLatestOrderNumber(order.orderNumber);
        setStep('success');
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'] });
        } catch { }
      } catch {
        setStep('details');
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleViewCredentials = () => {
    setIsCheckoutOpen(false);
    setStep('details');
    if (subscriptions.length > 0) setActiveVaultSub(subscriptions[0]);
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Cinema Backdrop with Progressive Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25 }}
            onClick={() => { if (step !== 'processing') { setIsCheckoutOpen(false); setStep('details'); } }}
            className="fixed inset-0 bg-black/85"
          />

          {/* 3D Holographic Unfold Checkout Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 70, rotateX: 35, rotateY: -12, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.65, y: 50, rotateX: -25, rotateY: 10, filter: 'blur(8px)' }}
            transition={{ type: 'spring', damping: 24, stiffness: 300, mass: 0.8 }}
            style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
            className="relative w-full max-w-xl rounded-3xl bg-zinc-900/95 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] space-y-6 my-6 z-10 backdrop-blur-2xl overflow-hidden"
          >

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Secure Checkout</h3>
              <p className="text-xs text-slate-400">{cart.length} item{cart.length !== 1 ? 's' : ''} · ${cartTotal.toFixed(2)} total</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button
              onClick={() => { setIsCheckoutOpen(false); setStep('details'); }}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* AUTH REQUIRED */}
        {step === 'auth_required' && (
          <div className="py-10 text-center space-y-5">
            <div className="h-16 w-16 mx-auto rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white">Sign in to continue</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                You need to be signed in to complete your purchase and receive your subscription credentials.
              </p>
            </div>
            <button
              onClick={() => { setIsCheckoutOpen(false); setIsAuthModalOpen(true); }}
              className="mx-auto flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-all"
            >
              <LogIn className="h-4 w-4" />
              Sign In / Create Account
            </button>
          </div>
        )}

        {/* STEP 1: PAYMENT DETAILS */}
        {step === 'details' && (
          <div className="space-y-5">

            {/* Delivery email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Delivery Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="your@email.com"
              />
              <p className="text-[11px] text-slate-500 mt-1">Credentials and receipt will be sent to this email.</p>
            </div>

            {/* Payment method */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { method: 'crypto_usdt' as PaymentMethod, icon: <Wallet className="h-5 w-5 mx-auto mb-1 text-emerald-400" />, label: 'USDT', sub: 'Zero Fee' },
                  { method: 'card_stripe' as PaymentMethod, icon: <CreditCard className="h-5 w-5 mx-auto mb-1 text-indigo-400" />, label: 'Card', sub: 'Instant' },
                  { method: 'crypto_btc' as PaymentMethod, icon: <QrCode className="h-5 w-5 mx-auto mb-1 text-amber-400" />, label: 'Bitcoin', sub: 'Lightning' },
                  { method: 'paypal' as PaymentMethod, icon: <Zap className="h-5 w-5 mx-auto mb-1 text-blue-400" />, label: 'PayPal', sub: 'Protected' },
                ].map(({ method, icon, label, sub }) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === method
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-white/[0.08] bg-zinc-850 hover:bg-zinc-800 text-slate-400'
                    }`}
                  >
                    {icon}
                    <span className="text-xs font-bold block">{label}</span>
                    <span className="text-[9px] text-slate-400">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment details panel */}
            {paymentMethod === 'crypto_usdt' && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-cyan-500/30 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-cyan-300">USDT TRC-20</span>
                  <span className="font-mono text-emerald-400 font-bold">${cartTotal.toFixed(2)} USDT</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-white/[0.08]">
                  <span className="text-xs font-mono text-slate-300 flex-1 truncate">{cryptoAddress}</span>
                  <button
                    onClick={handleCopyCrypto}
                    className="p-1.5 rounded-lg bg-cyan-900/40 text-cyan-300 hover:bg-cyan-800/60 text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiedAddress ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Send exact amount to the address above, then click Confirm Order.</p>
              </div>
            )}

            {paymentMethod === 'card_stripe' && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-blue-500/30 space-y-3">
                <span className="text-xs font-bold text-slate-200">Card Details</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
                    placeholder="Card Number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
                      placeholder="MM/YY"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      maxLength={4}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
                      placeholder="CVC"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.06] space-y-2 text-xs text-slate-300">
              <div className="flex justify-between"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span>-${(cartSubtotal * appliedCoupon.discountPercent / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white border-t border-white/[0.06] pt-2">
                <span>Total</span>
                <span className="text-cyan-400">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayNow}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              <span>Confirm Order · ${cartTotal.toFixed(2)}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>100% Replacement Warranty · Instant Delivery</span>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING */}
        {step === 'processing' && (
          <div className="py-14 text-center space-y-5">
            <Loader2 className="h-14 w-14 text-cyan-400 animate-spin mx-auto" />
            <h4 className="text-xl font-bold text-white">Processing your order…</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p>✓ Payment received</p>
              <p>✓ Preparing your subscription</p>
              <p className="text-cyan-400">⟳ Activating credentials…</p>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Order Confirmed</span>
              <h3 className="text-2xl font-black text-white mt-1">You're all set!</h3>
              <p className="text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                Your subscription is active. Credentials sent to <strong>{emailInput}</strong>.
              </p>
            </div>
            {latestOrderNumber && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-2 text-xs text-left">
                <div className="flex justify-between text-slate-300">
                  <span>Order Number:</span>
                  <span className="font-mono font-bold text-white">{latestOrderNumber}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">Delivered</span>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleViewCredentials}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                <Lock className="h-4 w-4" />
                View My Credentials
              </button>
              <button
                onClick={() => { setIsCheckoutOpen(false); setStep('details'); }}
                className="px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-sm transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};
