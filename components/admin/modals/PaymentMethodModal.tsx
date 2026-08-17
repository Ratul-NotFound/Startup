'use client';

import React, { useRef } from 'react';
import { BangladeshPaymentMethod } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { X, QrCode, Trash2, Loader2, Save } from 'lucide-react';

interface PaymentMethodModalProps {
  editingPaymentMethod: (BangladeshPaymentMethod & { isNew?: boolean }) | null;
  setEditingPaymentMethod: React.Dispatch<React.SetStateAction<(BangladeshPaymentMethod & { isNew?: boolean }) | null>>;
  isCompressingQr: boolean;
  setIsCompressingQr: (val: boolean) => void;
  adminCreatePaymentMethod: (pm: Omit<BangladeshPaymentMethod, 'id' | 'updatedAt'>) => Promise<string>;
  adminUpdatePaymentMethod: (id: string, updates: Partial<BangladeshPaymentMethod>) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function PaymentMethodModal({
  editingPaymentMethod,
  setEditingPaymentMethod,
  isCompressingQr,
  setIsCompressingQr,
  adminCreatePaymentMethod,
  adminUpdatePaymentMethod,
  showFeedback,
}: PaymentMethodModalProps) {
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  if (!editingPaymentMethod) return null;

  const handleSave = async () => {
    try {
      if (editingPaymentMethod.isNew) {
        const { isNew, id, ...rest } = editingPaymentMethod;
        await adminCreatePaymentMethod(rest);
        showFeedback('success', 'New payment method created.');
      } else {
        await adminUpdatePaymentMethod(editingPaymentMethod.id, editingPaymentMethod);
        showFeedback('success', 'Payment method updated.');
      }
      setEditingPaymentMethod(null);
    } catch {
      showFeedback('error', 'Failed to save payment method.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-white/15 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">
            {editingPaymentMethod.isNew ? 'Add Payment Gateway' : `Edit ${editingPaymentMethod.name}`}
          </h3>
          <button onClick={() => setEditingPaymentMethod(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-300">Method Name</label>
            <input
              type="text"
              value={editingPaymentMethod.name}
              onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Provider Type</label>
            <select
              value={editingPaymentMethod.type}
              onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, type: e.target.value as any } : null)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
            >
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="upay">Upay</option>
              <option value="custom">Custom Bank</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Account Number</label>
            <input
              type="text"
              value={editingPaymentMethod.accountNumber}
              onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, accountNumber: e.target.value } : null)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Account Type</label>
            <select
              value={editingPaymentMethod.accountType}
              onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, accountType: e.target.value as any } : null)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
            >
              <option value="Personal">Personal</option>
              <option value="Merchant">Merchant</option>
              <option value="Agent">Agent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">BDT Rate (1 USD = ? BDT)</label>
            <input
              type="number"
              value={editingPaymentMethod.bdtRate}
              onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, bdtRate: Number(e.target.value) } : null)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Brand Color Hex</label>
            <input
              type="text"
              value={editingPaymentMethod.color || '#06b6d4'}
              onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, color: e.target.value } : null)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
            />
          </div>
        </div>

        {/* QR Code Upload / Compressed Attachment */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-cyan-400" />
              <span>QR Code Image (Upload &amp; Auto-Compress)</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-semibold">Auto-compressed to clean data text</span>
          </div>

          <input
            type="file"
            ref={qrFileInputRef}
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setIsCompressingQr(true);
              try {
                const compressed = await compressImageToDataUrl(file, 600, 600, 0.85);
                setEditingPaymentMethod(prev => prev ? { ...prev, qrCodeImage: compressed } : null);
                showFeedback('success', 'QR Code image compressed and attached.');
              } catch {
                showFeedback('error', 'Failed to process QR image.');
              } finally {
                setIsCompressingQr(false);
                if (qrFileInputRef.current) qrFileInputRef.current.value = '';
              }
            }}
            className="hidden"
          />

          {editingPaymentMethod.qrCodeImage ? (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 rounded-xl bg-white p-1.5 shadow-lg shrink-0 flex items-center justify-center">
                  <img
                    src={editingPaymentMethod.qrCodeImage}
                    alt="QR Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">QR Code Attached</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">✓ Ready to display on checkout</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  disabled={isCompressingQr}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Replace Image
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPaymentMethod(prev => prev ? { ...prev, qrCodeImage: '' } : null)}
                  className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 transition-colors cursor-pointer"
                  title="Remove QR Image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => qrFileInputRef.current?.click()}
              disabled={isCompressingQr}
              className="w-full py-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-500/50 bg-zinc-950/60 hover:bg-zinc-950 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white cursor-pointer group"
            >
              {isCompressingQr ? (
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Compressing QR Image...</span>
                </div>
              ) : (
                <>
                  <div className="p-2.5 rounded-xl bg-zinc-900 text-cyan-400 group-hover:scale-110 transition-transform">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-xs text-white block">Click to Upload QR Image from Device</span>
                    <span className="text-[10px] text-slate-500">Supports PNG, JPG, WebP (Automatically compressed)</span>
                  </div>
                </>
              )}
            </button>
          )}

          {/* Or Manual URL input */}
          <div className="pt-1">
            <input
              type="text"
              value={editingPaymentMethod.qrCodeImage || ''}
              onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, qrCodeImage: e.target.value } : null)}
              placeholder="Or paste QR image URL directly..."
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-300">Customer Payment Instructions</label>
          <textarea
            rows={2}
            value={editingPaymentMethod.instructions || ''}
            onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, instructions: e.target.value } : null)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 text-xs pt-2">
          <button
            onClick={() => setEditingPaymentMethod(null)}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-slate-300 font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> Save Method
          </button>
        </div>
      </div>
    </div>
  );
}
