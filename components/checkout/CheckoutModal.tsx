'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PaymentMethod } from '@/types';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Zap,
  CheckCircle2,
  Lock,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    appliedCoupon,
    processCheckout,
    user,
    setActiveVaultSub,
    subscriptions,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto_usdt');
  const [emailInput, setEmailInput] = useState(user.email);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9941');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const cryptoAddress = 'TYs98mXxKz817hqaB10N99281Xn9941USDT_TRC20';

  const handleCopyCrypto = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handlePayNow = async () => {
    setIsProcessing(true);
    setStep('processing');

    // Simulate 2 seconds of high-security blockchain/gateway confirmation & bot vault allocation
    setTimeout(async () => {
      const order = await processCheckout(paymentMethod, emailInput);
      setCompletedOrderId(order.id);
      setIsProcessing(false);
      setStep('success');

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }, 1800);
  };

  const handleViewDeliveredCredentials = () => {
    setIsCheckoutOpen(false);
    // Open the latest subscription vault
    if (subscriptions.length > 0) {
      setActiveVaultSub(subscriptions[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-obsidian-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Encrypted Fast Checkout</h3>
              <p className="text-xs text-slate-400">Instant Bot Fulfillment & Credential Dispatch</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* STEP 1: PAYMENT METHOD SELECTION & DETAILS */}
        {step === 'details' && (
          <div className="space-y-5">
            
            {/* Target Delivery Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Delivery Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-obsidian-850 border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                placeholder="your.email@gmail.com"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Credentials & invoice will be dispatched immediately to this email.
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto_usdt')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'crypto_usdt'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-glow-cyan'
                      : 'border-white/[0.08] bg-obsidian-850 hover:bg-obsidian-800 text-slate-400'
                  }`}
                >
                  <Wallet className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                  <span className="text-xs font-bold block">USDT TRC20</span>
                  <span className="text-[9px] text-slate-400">Zero Fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card_stripe')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'card_stripe'
                      ? 'border-brand-500 bg-brand-950/40 text-brand-300 shadow-glow'
                      : 'border-white/[0.08] bg-obsidian-850 hover:bg-obsidian-800 text-slate-400'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mx-auto mb-1 text-indigo-400" />
                  <span className="text-xs font-bold block">Credit Card</span>
                  <span className="text-[9px] text-slate-400">Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto_btc')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'crypto_btc'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-white/[0.08] bg-obsidian-850 hover:bg-obsidian-800 text-slate-400'
                  }`}
                >
                  <QrCode className="h-5 w-5 mx-auto mb-1 text-amber-400" />
                  <span className="text-xs font-bold block">Bitcoin</span>
                  <span className="text-[9px] text-slate-400">Lightning</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                      : 'border-white/[0.08] bg-obsidian-850 hover:bg-obsidian-800 text-slate-400'
                  }`}
                >
                  <Zap className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                  <span className="text-xs font-bold block">PayPal</span>
                  <span className="text-[9px] text-slate-400">Buyer Protect</span>
                </button>

              </div>
            </div>

            {/* Gateway Interactive View */}
            {paymentMethod === 'crypto_usdt' && (
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300">Tether USD (TRC-20 Network)</span>
                  <span className="font-mono text-emerald-400 font-bold">${cartTotal.toFixed(2)} USDT</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-obsidian-850 border border-white/[0.08]">
                  <span className="text-xs font-mono text-slate-300 flex-1 truncate">{cryptoAddress}</span>
                  <button
                    onClick={handleCopyCrypto}
                    className="p-1.5 rounded-lg bg-cyan-900/40 text-cyan-300 hover:bg-cyan-800/60 text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiedAddress ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  ⚡ Automatic bot webhook monitors this blockchain address. Payment verifies within 15 seconds.
                </p>
              </div>
            )}

            {paymentMethod === 'card_stripe' && (
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-brand-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Stripe 256-bit Encrypted Card Gateway</span>
                  <span className="text-emerald-400 font-bold">3D Secure Active</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                    placeholder="Card Number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                      placeholder="MM/YY"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                      placeholder="CVC"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary Row */}
            <div className="p-4 rounded-2xl bg-obsidian-850 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Due ({cart.length} subscription item)</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handlePayNow}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-obsidian-950 font-black text-sm shadow-glow-emerald transition-all flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>Simulate Complete Payment</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Full 100% Replacement Warranty. Auto-assigned Vault Slot.</span>
            </div>

          </div>
        )}

        {/* STEP 2: PROCESSING & BOT GENERATION SIMULATION */}
        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-white">Verifying Transaction & Allocating Credentials...</h4>
            <div className="space-y-1 text-xs text-slate-400 font-mono">
              <p>✓ Payment Gateway Acknowledged</p>
              <p>✓ Automated Wholesale Slot Dispatched</p>
              <p>✓ Encrypting AES-256 Vault Keys</p>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESSFUL DISPATCH & VAULT REVEAL */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Payment Verified & Dispatched
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Your Subscription is Live!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                Credentials have been securely written to your personal Vault and dispatched to{' '}
                <strong>{emailInput}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-950 border border-emerald-500/30 text-left space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-white">SN-{new Date().getFullYear()}-VIP</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Warranty Status:</span>
                <span className="font-bold text-emerald-400">100% Active Replacement Protection</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Automated Renewal:</span>
                <span className="font-bold text-cyan-400">Enabled (Adjust anytime in Dashboard)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleViewDeliveredCredentials}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Open Secure Credential Vault</span>
              </button>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-5 py-3.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 font-bold text-sm transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
