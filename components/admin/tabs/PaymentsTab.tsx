'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, ToggleLeft, ToggleRight, Save, RefreshCw } from 'lucide-react';
import { BangladeshPaymentMethod, CurrencySettings } from '@/types';

interface PaymentsTabProps {
  paymentMethods: BangladeshPaymentMethod[];
  adminResetPaymentMethods: () => Promise<void>;
  setEditingPaymentMethod: (pm: (BangladeshPaymentMethod & { isNew?: boolean }) | null) => void;
  adminUpdatePaymentMethod: (id: string, updates: Partial<BangladeshPaymentMethod>) => Promise<void>;
  adminDeletePaymentMethod: (id: string) => Promise<void>;
  setPreviewScreenshotUrl: (url: string | null) => void;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
  currencySettings: CurrencySettings;
  updateCurrencySettings: (settings: Partial<CurrencySettings>) => Promise<void>;
}

export function PaymentsTab({
  paymentMethods,
  adminResetPaymentMethods,
  setEditingPaymentMethod,
  adminUpdatePaymentMethod,
  adminDeletePaymentMethod,
  setPreviewScreenshotUrl,
  showFeedback,
  currencySettings,
  updateCurrencySettings,
}: PaymentsTabProps) {
  // Local editable state for currency settings (synced from props, saved on submit)
  const [editBdtEnabled, setEditBdtEnabled] = useState(currencySettings.bdtEnabled);
  const [editBdtCountries, setEditBdtCountries] = useState(
    currencySettings.bdtCountries.join(', ')
  );
  const [editBdtRate, setEditBdtRate] = useState(currencySettings.bdtRate);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);

  // Preview calculation: $10 USD at current rate
  const previewBdt = Math.round(10 * editBdtRate);

  const handleSaveCurrencySettings = async () => {
    const countryCodes = editBdtCountries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countryCodes.length === 0) {
      showFeedback('error', 'Please enter at least one valid 2-letter country code (e.g. BD).');
      return;
    }
    if (editBdtRate < 1 || editBdtRate > 999999) {
      showFeedback('error', 'BDT rate must be between 1 and 999999.');
      return;
    }

    setIsSavingCurrency(true);
    try {
      await updateCurrencySettings({
        bdtEnabled: editBdtEnabled,
        bdtCountries: countryCodes,
        bdtRate: editBdtRate,
      });
      showFeedback('success', 'Currency detection settings saved successfully.');
    } catch {
      showFeedback('error', 'Failed to save currency settings. Please try again.');
    } finally {
      setIsSavingCurrency(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ─── Currency Detection Settings Card ─── */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-cyan-500/20 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Globe className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Currency Detection Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically shows prices in BDT (৳) or USD ($) based on visitor IP country. Users see nothing — it&apos;s fully automatic.
            </p>
          </div>
        </div>

        {/* Master toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-white/5">
          <div>
            <p className="text-sm font-bold text-white">BDT Auto-Detection</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {editBdtEnabled
                ? 'Visitors from BDT countries see prices in ৳ BDT'
                : 'All visitors see prices in $ USD (disabled)'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditBdtEnabled((v) => !v)}
            className="flex items-center gap-1.5 transition-colors cursor-pointer"
            title={editBdtEnabled ? 'Click to disable BDT' : 'Click to enable BDT'}
          >
            {editBdtEnabled ? (
              <ToggleRight className="h-8 w-8 text-cyan-400" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-zinc-600" />
            )}
          </button>
        </div>

        {/* Country codes & rate inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              BDT Countries (ISO codes)
            </label>
            <input
              type="text"
              value={editBdtCountries}
              onChange={(e) => setEditBdtCountries(e.target.value)}
              placeholder="BD, NP, LK"
              disabled={!editBdtEnabled}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            />
            <p className="text-[10px] text-slate-500">
              Comma-separated 2-letter ISO codes. Visitors with matching IP country see ৳ BDT prices.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Exchange Rate (BDT per USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">1 USD =</span>
              <input
                type="number"
                min="1"
                max="999999"
                step="0.5"
                value={editBdtRate}
                onChange={(e) => setEditBdtRate(Number(e.target.value))}
                disabled={!editBdtEnabled}
                className="w-full pl-16 pr-12 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">৳ BDT</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Current rate applied to all product prices shown to BDT visitors.
            </p>
          </div>
        </div>

        {/* Live preview */}
        {editBdtEnabled && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/80 border border-white/5">
            <div className="text-xs text-slate-400">Live Preview:</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 line-through font-mono">$10.00 USD</span>
              <span className="text-slate-500">→</span>
              <span className="font-black text-emerald-400 font-mono text-sm">৳{previewBdt.toLocaleString()} BDT</span>
            </div>
            <div className="ml-auto text-[10px] text-slate-500">for visitors in: <span className="text-cyan-400 font-bold">{editBdtCountries || 'BD'}</span></div>
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSaveCurrencySettings}
          disabled={isSavingCurrency}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
        >
          {isSavingCurrency ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isSavingCurrency ? 'Saving...' : 'Save Currency Settings'}
        </button>
      </div>

      {/* ─── Bangladesh Payment Gateways ─── */}
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

    </div>
  );
}
