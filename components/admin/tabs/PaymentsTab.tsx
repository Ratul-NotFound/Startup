'use client';

import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { BangladeshPaymentMethod } from '@/types';

interface PaymentsTabProps {
  paymentMethods: BangladeshPaymentMethod[];
  adminResetPaymentMethods: () => Promise<void>;
  setEditingPaymentMethod: (pm: (BangladeshPaymentMethod & { isNew?: boolean }) | null) => void;
  adminUpdatePaymentMethod: (id: string, updates: Partial<BangladeshPaymentMethod>) => Promise<void>;
  adminDeletePaymentMethod: (id: string) => Promise<void>;
  setPreviewScreenshotUrl: (url: string | null) => void;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function PaymentsTab({
  paymentMethods,
  adminResetPaymentMethods,
  setEditingPaymentMethod,
  adminUpdatePaymentMethod,
  adminDeletePaymentMethod,
  setPreviewScreenshotUrl,
  showFeedback,
}: PaymentsTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Bangladesh Payment Gateways</h2>
          <p className="text-xs text-slate-400">Configure bKash, Nagad, Rocket numbers, QR codes, and BDT exchange rates.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await adminResetPaymentMethods();
              showFeedback('success', 'Reset payment methods to defaults.');
            }}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 text-xs font-bold border border-white/10 transition-colors cursor-pointer"
          >
            Reset Default Methods
          </button>

          <button
            onClick={() => setEditingPaymentMethod({
              id: '',
              name: 'bKash Merchant',
              type: 'bkash',
              accountNumber: '01700-000000',
              accountType: 'Personal',
              qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=01700000000',
              instructions: 'Send Money to this number and copy TrxID.',
              bdtRate: 125,
              isActive: true,
              color: '#e2136e',
              isNew: true,
            })}
            className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Payment Gateway
          </button>
        </div>
      </div>

      {/* Payment Methods Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map(pm => (
          <div
            key={pm.id}
            className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 relative flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pm.color || '#06b6d4' }} />
                  <h3 className="font-bold text-sm text-white">{pm.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pm.isActive
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-slate-500'
                }`}>
                  {pm.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-white">{pm.accountNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="font-bold text-cyan-400">{pm.accountType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Exchange Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">1 USD = ৳{pm.bdtRate} BDT</span>
                </div>
              </div>

              {pm.qrCodeImage && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <div
                    onClick={() => setPreviewScreenshotUrl(pm.qrCodeImage!)}
                    className="h-20 w-20 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
                    title="Click to view full size QR"
                  >
                    <img src={pm.qrCodeImage} alt="QR Code" className="h-full w-full object-contain" />
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Scannable QR Code</div>
                    <div className="line-clamp-2">{pm.instructions}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <button
                onClick={async () => {
                  await adminUpdatePaymentMethod(pm.id, { isActive: !pm.isActive });
                  showFeedback('success', `Payment method ${pm.isActive ? 'disabled' : 'activated'}.`);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {pm.isActive ? 'Turn Off' : 'Turn On'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingPaymentMethod(pm)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 transition-colors cursor-pointer"
                  title="Edit method"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Delete ${pm.name}?`)) {
                      await adminDeletePaymentMethod(pm.id);
                      showFeedback('success', 'Payment method deleted.');
                    }
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete method"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
