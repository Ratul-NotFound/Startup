'use client';

import React from 'react';
import { Order } from '@/types';
import { X, ChevronRight, Loader2, Check } from 'lucide-react';

interface OrderApprovalModalProps {
  customProvisionOrder: Order | null;
  setCustomProvisionOrder: (order: Order | null) => void;
  approvalStep: 'verify' | 'credentials' | 'confirm';
  setApprovalStep: (step: 'verify' | 'credentials' | 'confirm') => void;
  perItemCreds: Array<{ email: string; password: string; pinCode: string; profileName: string; notes: string }>;
  setPerItemCreds: React.Dispatch<React.SetStateAction<Array<{ email: string; password: string; pinCode: string; profileName: string; notes: string }>>>;
  showRejectionInput: boolean;
  setShowRejectionInput: (show: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  showItemPassword: Record<number, boolean>;
  setShowItemPassword: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  approvingOrderId: string | null;
  setApprovingOrderId: (id: string | null) => void;
  adminVerifyPayment: (orderId: string) => Promise<void>;
  adminRejectOrder: (orderId: string, reason: string) => Promise<void>;
  adminApproveAndDeliverOrder: (
    orderId: string,
    perItemCreds: Array<{ email: string; password: string; pinCode?: string; profileName?: string; notes?: string }>
  ) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function OrderApprovalModal({
  customProvisionOrder,
  setCustomProvisionOrder,
  approvalStep,
  setApprovalStep,
  perItemCreds,
  setPerItemCreds,
  showRejectionInput,
  setShowRejectionInput,
  rejectionReason,
  setRejectionReason,
  showItemPassword,
  setShowItemPassword,
  approvingOrderId,
  setApprovingOrderId,
  adminVerifyPayment,
  adminRejectOrder,
  adminApproveAndDeliverOrder,
  showFeedback,
}: OrderApprovalModalProps) {
  if (!customProvisionOrder) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && setCustomProvisionOrder(null)}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black text-white">Order #{customProvisionOrder.orderNumber}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{customProvisionOrder.userEmail}</p>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-bold">
            {(['verify', 'credentials', 'confirm'] as const).map((s, si) => (
              <div key={s} className={`flex items-center gap-1 ${approvalStep === s ? 'text-cyan-400' : 'text-slate-600'}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] border ${
                  approvalStep === s ? 'border-cyan-400 bg-cyan-950/40' : 'border-zinc-700 bg-zinc-800'
                }`}>{si + 1}</span>
                <span className="hidden sm:inline capitalize">{s}</span>
                {si < 2 && <ChevronRight className="h-3 w-3 text-zinc-600" />}
              </div>
            ))}
          </div>
          <button onClick={() => setCustomProvisionOrder(null)} className="text-slate-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* ── STEP 1: VERIFY PAYMENT ── */}
          {approvalStep === 'verify' && (
            <div className="space-y-4">
              <div className="bg-zinc-800/60 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black text-white">Step 1 — Payment Verification</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500 mb-0.5">Sender Number</div>
                    <div className="font-mono text-emerald-400 font-bold">{customProvisionOrder.senderNumber || '—'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-0.5">Transaction ID</div>
                    <div className="font-mono text-cyan-300 font-bold">{customProvisionOrder.transactionId || '—'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-0.5">Amount</div>
                    <div className="font-mono text-white font-black">
                      {customProvisionOrder.totalBdt ? `৳${customProvisionOrder.totalBdt.toLocaleString()} BDT` : `$${customProvisionOrder.total.toFixed(2)}`}
                    </div>
                  </div>
                  {customProvisionOrder.couponCode && (
                    <div>
                      <div className="text-slate-500 mb-0.5">Coupon Applied</div>
                      <div className="font-mono text-emerald-400 font-bold">{customProvisionOrder.couponCode}</div>
                    </div>
                  )}
                </div>
                {customProvisionOrder.screenshotUrl && (
                  <img src={customProvisionOrder.screenshotUrl} alt="Payment proof" className="w-full max-h-48 object-contain rounded-xl border border-white/10 bg-black" />
                )}
              </div>

              {/* Items ordered */}
              <div className="bg-zinc-800/40 rounded-2xl p-4">
                <h3 className="text-xs font-black text-white mb-2">{customProvisionOrder.items.length} Item(s) Ordered</h3>
                <div className="space-y-1.5">
                  {customProvisionOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-200">{item.quantity}x {item.productName} <span className="text-cyan-400">({item.durationLabel})</span></span>
                      <span className="text-white font-bold">৳{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection input */}
              {showRejectionInput && (
                <div className="bg-red-950/30 rounded-2xl p-4 border border-red-500/20 space-y-2">
                  <h3 className="text-xs font-black text-red-400">Rejection Reason</h3>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Invalid TrxID, amount mismatch, unrecognized sender..."
                    className="w-full bg-zinc-800 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-400"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {!showRejectionInput ? (
                  <>
                    <button onClick={() => setShowRejectionInput(true)} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 font-bold text-xs border border-white/10 transition-colors">Reject Payment</button>
                    <button
                      onClick={async () => {
                        await adminVerifyPayment(customProvisionOrder.id);
                        setApprovalStep('credentials');
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                    >Payment Verified → Next</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowRejectionInput(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs border border-white/10 transition-colors">Cancel</button>
                    <button
                      onClick={async () => {
                        if (!rejectionReason.trim()) { showFeedback('error', 'Please enter a rejection reason.'); return; }
                        await adminRejectOrder(customProvisionOrder.id, rejectionReason.trim());
                        showFeedback('error', `Order #${customProvisionOrder.orderNumber} rejected.`);
                        setCustomProvisionOrder(null);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs transition-colors"
                    >Confirm Rejection</button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: ENTER CREDENTIALS ── */}
          {approvalStep === 'credentials' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Enter credentials for each item. These will be delivered to the customer&apos;s vault.</p>
              {customProvisionOrder.items.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/60 rounded-2xl p-4 space-y-3 border border-white/5">
                  <div className="flex items-center gap-2">
                    {item.productLogo && <img src={item.productLogo} alt={item.productName} className="h-7 w-7 rounded-lg object-cover" />}
                    <div>
                      <div className="font-bold text-white text-sm">{item.productName}</div>
                      <div className="text-[11px] text-cyan-400">{item.durationLabel} · Qty {item.quantity}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Email / Username</label>
                      <input type="text" value={perItemCreds[idx]?.email || ''} onChange={e => setPerItemCreds(prev => { const n = [...prev]; n[idx] = { ...n[idx], email: e.target.value }; return n; })} className="mt-0.5 w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" placeholder="email@provider.com" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Password</label>
                      <div className="flex gap-1 mt-0.5">
                        <input type={showItemPassword[idx] ? 'text' : 'password'} value={perItemCreds[idx]?.password || ''} onChange={e => setPerItemCreds(prev => { const n = [...prev]; n[idx] = { ...n[idx], password: e.target.value }; return n; })} className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowItemPassword(prev => ({ ...prev, [idx]: !prev[idx] }))} className="px-2 rounded-lg bg-zinc-800 border border-white/10 text-slate-400 hover:text-white transition-colors">
                          Eye
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Profile Name (optional)</label>
                      <input type="text" value={perItemCreds[idx]?.profileName || ''} onChange={e => setPerItemCreds(prev => { const n = [...prev]; n[idx] = { ...n[idx], profileName: e.target.value }; return n; })} className="mt-0.5 w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" placeholder="Profile 1" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">PIN (optional)</label>
                      <input type="text" value={perItemCreds[idx]?.pinCode || ''} onChange={e => setPerItemCreds(prev => { const n = [...prev]; n[idx] = { ...n[idx], pinCode: e.target.value }; return n; })} className="mt-0.5 w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" placeholder="1234" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold">Notes (optional)</label>
                    <input type="text" value={perItemCreds[idx]?.notes || ''} onChange={e => setPerItemCreds(prev => { const n = [...prev]; n[idx] = { ...n[idx], notes: e.target.value }; return n; })} className="mt-0.5 w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" placeholder="Any extra instructions for customer..." />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setApprovalStep('verify')} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs border border-white/10 transition-colors">← Back</button>
                <button onClick={() => setApprovalStep('confirm')} className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition-colors">Review &amp; Confirm →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: CONFIRM & DELIVER ── */}
          {approvalStep === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                <h3 className="text-sm font-black text-emerald-400">Confirm Delivery</h3>
                {customProvisionOrder.items.map((item, idx) => (
                  <div key={idx} className="bg-zinc-900/60 rounded-xl p-3 text-xs space-y-1">
                    <div className="font-bold text-white">{item.productName} <span className="text-cyan-400">({item.durationLabel})</span></div>
                    <div className="text-slate-400">Email: <span className="text-white font-mono">{perItemCreds[idx]?.email || '—'}</span></div>
                    <div className="text-slate-400">Pass: <span className="text-white font-mono">{perItemCreds[idx]?.password ? '••••••' : '—'}</span></div>
                    {perItemCreds[idx]?.profileName && <div className="text-slate-400">Profile: <span className="text-white font-mono">{perItemCreds[idx].profileName}</span></div>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setApprovalStep('credentials')} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs border border-white/10 transition-colors">← Edit Creds</button>
                <button
                  onClick={async () => {
                    setApprovingOrderId(customProvisionOrder.id);
                    try {
                      await adminApproveAndDeliverOrder(customProvisionOrder.id, perItemCreds);
                      showFeedback('success', `Order #${customProvisionOrder.orderNumber} approved & credentials delivered!`);
                      setCustomProvisionOrder(null);
                    } finally {
                      setApprovingOrderId(null);
                    }
                  }}
                  disabled={!!approvingOrderId}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {approvingOrderId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve &amp; Deliver
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
