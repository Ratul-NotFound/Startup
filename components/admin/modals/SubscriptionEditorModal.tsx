'use client';

import React from 'react';
import { UserSubscription, Product, CustomerProfile } from '@/types';
import { calculateDaysRemaining } from '@/lib/utils';
import { X, Lock, Save } from 'lucide-react';

interface SubscriptionEditorModalProps {
  editingFullSubscription: (Partial<UserSubscription> & { isNew?: boolean }) | null;
  setEditingFullSubscription: React.Dispatch<React.SetStateAction<(Partial<UserSubscription> & { isNew?: boolean }) | null>>;
  allUsers: CustomerProfile[];
  products: Product[];
  adminCreateSubscription: (sub: Omit<UserSubscription, 'id'>) => Promise<string>;
  adminUpdateSubscription: (id: string, updates: Partial<UserSubscription>) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function SubscriptionEditorModal({
  editingFullSubscription,
  setEditingFullSubscription,
  allUsers,
  products,
  adminCreateSubscription,
  adminUpdateSubscription,
  showFeedback,
}: SubscriptionEditorModalProps) {
  if (!editingFullSubscription) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={() => setEditingFullSubscription(null)}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {editingFullSubscription.isNew ? 'Provision New Subscription & Credentials' : `Edit Credentials for ${editingFullSubscription.productName}`}
              </h3>
              <p className="text-[11px] text-slate-400">Directly syncs to customer dashboard vault in real-time</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingFullSubscription(null)}
            className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editingFullSubscription.userEmail || !editingFullSubscription.productName) {
              showFeedback('error', 'Please specify a customer email and product.');
              return;
            }

            try {
              if (editingFullSubscription.isNew) {
                const { isNew, id, ...newSubData } = editingFullSubscription as UserSubscription & { isNew: boolean };
                await adminCreateSubscription(newSubData);
                showFeedback('success', `Subscription & Credentials provisioned to ${editingFullSubscription.userEmail}'s Vault!`);
              } else {
                await adminUpdateSubscription(editingFullSubscription.id!, editingFullSubscription);
                showFeedback('success', 'Subscription & Vault credentials updated in database.');
              }
              setEditingFullSubscription(null);
            } catch {
              showFeedback('error', 'Failed to save subscription.');
            }
          }}
          className="space-y-4 text-xs"
        >
          {/* Recipient User Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Customer Email / Account</label>
            <div className="flex gap-2">
              <select
                value={editingFullSubscription.userEmail || ''}
                onChange={e => {
                  const sel = allUsers.find(u => u.email.toLowerCase() === e.target.value.toLowerCase());
                  setEditingFullSubscription(prev => prev ? ({
                    ...prev,
                    userEmail: e.target.value,
                    userId: sel?.id || prev.userId || 'usr_guest',
                  }) : null);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="" disabled>Select registered customer…</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.email}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <input
                type="email"
                placeholder="Or enter custom email"
                value={editingFullSubscription.userEmail || ''}
                onChange={e => setEditingFullSubscription(prev => prev ? ({ ...prev, userEmail: e.target.value }) : null)}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Product Selection & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Product</label>
              <select
                value={editingFullSubscription.productId || ''}
                onChange={e => {
                  const prod = products.find(p => p.id === e.target.value);
                  if (prod) {
                    setEditingFullSubscription(prev => prev ? ({
                      ...prev,
                      productId: prod.id,
                      productName: prod.name,
                      productLogo: prod.logo,
                      pricePaid: prod.pricingTiers?.[0]?.price || prev.pricePaid || 19.99,
                    }) : null);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Plan Duration</label>
              <select
                value={editingFullSubscription.planDuration || '1_month'}
                onChange={e => {
                  const dur = e.target.value;
                  const labels: Record<string, string> = {
                    '1_month': '1 Month',
                    '3_months': '3 Months',
                    '6_months': '6 Months',
                    '12_months': '12 Months',
                    'lifetime': 'Lifetime Access',
                  };
                  const daysMap: Record<string, number> = { '1_month': 30, '3_months': 90, '6_months': 180, '12_months': 365, 'lifetime': 3650 };
                  const dCount = daysMap[dur] || 30;
                  const newExp = new Date(Date.now() + dCount * 86400000).toISOString();

                  setEditingFullSubscription(prev => prev ? ({
                    ...prev,
                    planDuration: dur as any,
                    durationLabel: labels[dur] || dur,
                    expiryDate: newExp,
                    warrantyValidUntil: newExp,
                  }) : null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="12_months">12 Months (1 Year)</option>
                <option value="lifetime">Lifetime Access</option>
              </select>
            </div>
          </div>

          {/* Account Login Credentials */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-cyan-500/20 space-y-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              Vault Account Login Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Account Login Email / ID</label>
                <input
                  type="text"
                  value={editingFullSubscription.credentials?.email || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingFullSubscription(prev => prev ? ({
                      ...prev,
                      credentials: { ...(prev.credentials || {}), email: val } as any,
                    }) : null);
                  }}
                  placeholder="e.g. premium.user@service.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">Account Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      const autoPwd = `Keyoon#${Math.floor(100000 + Math.random() * 900000)}`;
                      setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        credentials: { ...(prev.credentials || {}), password: autoPwd } as any,
                      }) : null);
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    ⚡ Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={editingFullSubscription.credentials?.password || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingFullSubscription(prev => prev ? ({
                      ...prev,
                      credentials: { ...(prev.credentials || {}), password: val } as any,
                    }) : null);
                  }}
                  placeholder="Password"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Profile Name (Optional)</label>
                <input
                  type="text"
                  value={editingFullSubscription.credentials?.profileName || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingFullSubscription(prev => prev ? ({
                      ...prev,
                      credentials: { ...(prev.credentials || {}), profileName: val } as any,
                    }) : null);
                  }}
                  placeholder="e.g. VIP Profile 1"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Profile Lock PIN (Optional)</label>
                <input
                  type="text"
                  value={editingFullSubscription.credentials?.pinCode || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingFullSubscription(prev => prev ? ({
                      ...prev,
                      credentials: { ...(prev.credentials || {}), pinCode: val } as any,
                    }) : null);
                  }}
                  placeholder="e.g. 1234"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">VIP Invite Link / Direct URL (Optional)</label>
              <input
                type="url"
                value={editingFullSubscription.credentials?.inviteLink || ''}
                onChange={e => {
                  const val = e.target.value;
                  setEditingFullSubscription(prev => prev ? ({
                    ...prev,
                    credentials: { ...(prev.credentials || {}), inviteLink: val } as any,
                  }) : null);
                }}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Setup Instructions / Vault Notes</label>
              <textarea
                rows={2}
                value={editingFullSubscription.credentials?.notes || ''}
                onChange={e => {
                  const val = e.target.value;
                  setEditingFullSubscription(prev => prev ? ({
                    ...prev,
                    credentials: { ...(prev.credentials || {}), notes: val } as any,
                  }) : null);
                }}
                placeholder="e.g. 100% replacement warranty active. Do not change profile name."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Expiry Date, Status & Quick Extension Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Plan Expiry Date</label>
                <span className="text-[10px] text-cyan-400 font-bold">
                  {calculateDaysRemaining(editingFullSubscription.expiryDate || new Date().toISOString())}d left
                </span>
              </div>
              <input
                type="date"
                value={editingFullSubscription.expiryDate ? editingFullSubscription.expiryDate.split('T')[0] : ''}
                onChange={e => {
                  const d = e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString();
                  setEditingFullSubscription(prev => prev ? ({
                    ...prev,
                    expiryDate: d,
                    warrantyValidUntil: d,
                  }) : null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none font-mono"
                required
              />
              <div className="flex items-center gap-1 pt-1">
                {[
                  { label: '+30d', days: 30 },
                  { label: '+90d', days: 90 },
                  { label: '+1y', days: 365 },
                  { label: 'Lifetime', days: 3650 },
                ].map(btn => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => {
                      const base = Math.max(new Date(editingFullSubscription.expiryDate || Date.now()).getTime(), Date.now());
                      const newExp = new Date(base + btn.days * 86400000).toISOString();
                      setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        expiryDate: newExp,
                        warrantyValidUntil: newExp,
                      }) : null);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-slate-300 border border-white/5 cursor-pointer"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Subscription Status</label>
              <select
                value={editingFullSubscription.status || 'active'}
                onChange={e => setEditingFullSubscription(prev => prev ? ({
                  ...prev,
                  status: e.target.value as any,
                }) : null)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="active">Active (Full Access)</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="paused">Paused / Under Maintenance</option>
              </select>

              <div className="flex items-center gap-2 pt-3">
                <input
                  type="checkbox"
                  id="subAutoRenewToggle"
                  checked={editingFullSubscription.autoRenew ?? true}
                  onChange={e => setEditingFullSubscription(prev => prev ? ({
                    ...prev,
                    autoRenew: e.target.checked,
                  }) : null)}
                  className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                />
                <label htmlFor="subAutoRenewToggle" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Auto-Renewal Engine Enabled
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setEditingFullSubscription(null)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{editingFullSubscription.isNew ? 'Provision to Vault' : 'Save & Sync to Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
