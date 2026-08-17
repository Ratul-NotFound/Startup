'use client';

import React from 'react';
import { Lock, Plus, Trash2, Search, AlertTriangle, Eye, EyeOff, Edit2, X } from 'lucide-react';
import { UserSubscription, Product, CustomerProfile } from '@/types';
import { calculateDaysRemaining } from '@/lib/utils';

interface SubscriptionsTabProps {
  allSubscriptions: UserSubscription[];
  subSearch: string;
  setSubSearch: (q: string) => void;
  subStatusFilter: 'all' | 'active' | 'expiring_soon' | 'expired' | 'paused';
  setSubStatusFilter: (filter: 'all' | 'active' | 'expiring_soon' | 'expired' | 'paused') => void;
  products: Product[];
  allUsers: CustomerProfile[];
  setEditingFullSubscription: (sub: (Partial<UserSubscription> & { isNew?: boolean }) | null) => void;
  adminPurgeMockSubscriptions: () => Promise<void>;
  adminPurgeAllSubscriptions: () => Promise<void>;
  selectedSubIds: string[];
  setSelectedSubIds: React.Dispatch<React.SetStateAction<string[]>>;
  adminDeleteSubscription: (id: string) => Promise<void>;
  showAdminVaultPassword: Record<string, boolean>;
  setShowAdminVaultPassword: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  adminUpdateSubscriptionStatus: (subId: string, status: UserSubscription['status']) => Promise<void>;
  subDeleteConfirmId: string | null;
  setSubDeleteConfirmId: (id: string | null) => void;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function SubscriptionsTab({
  allSubscriptions,
  subSearch,
  setSubSearch,
  subStatusFilter,
  setSubStatusFilter,
  products,
  allUsers,
  setEditingFullSubscription,
  adminPurgeMockSubscriptions,
  adminPurgeAllSubscriptions,
  selectedSubIds,
  setSelectedSubIds,
  adminDeleteSubscription,
  showAdminVaultPassword,
  setShowAdminVaultPassword,
  adminUpdateSubscriptionStatus,
  subDeleteConfirmId,
  setSubDeleteConfirmId,
  showFeedback,
}: SubscriptionsTabProps) {
  const filteredSubsList = allSubscriptions.filter(s => {
    const matchQuery =
      s.productName.toLowerCase().includes(subSearch.toLowerCase()) ||
      (s.userEmail && s.userEmail.toLowerCase().includes(subSearch.toLowerCase())) ||
      (s.credentials?.email && s.credentials.email.toLowerCase().includes(subSearch.toLowerCase())) ||
      (s.orderId && s.orderId.toLowerCase().includes(subSearch.toLowerCase()));
    if (!matchQuery) return false;

    if (subStatusFilter === 'all') return true;
    if (subStatusFilter === 'expiring_soon') {
      const days = calculateDaysRemaining(s.expiryDate);
      return s.status === 'expiring_soon' || (days <= 3 && days >= 0);
    }
    return s.status === subStatusFilter;
  });

  const activeSubsCount = allSubscriptions.filter(s => s.status === 'active').length;
  const expiringCount = allSubscriptions.filter(s => calculateDaysRemaining(s.expiryDate) <= 3 && calculateDaysRemaining(s.expiryDate) >= 0).length;

  return (
    <div className="space-y-6">
      {/* Header with Search, Filter Chips & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-cyan-400" />
            <span>Customer Subscriptions &amp; Vault Credentials</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full dynamic CRUD control over customer logins, decrypted passwords, profile PINs, warranty, and expiry dates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const firstProd = products[0];
              setEditingFullSubscription({
                isNew: true,
                productId: firstProd?.id || 'prod_1',
                productName: firstProd?.name || 'ChatGPT Plus',
                productLogo: firstProd?.logo || '',
                planDuration: '1_month',
                durationLabel: '1 Month',
                pricePaid: firstProd?.pricingTiers?.[0]?.price || 19.99,
                status: 'active',
                startDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                warrantyValidUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
                autoRenew: true,
                autoRenewReminderDays: 3,
                accountType: 'private_account',
                userEmail: allUsers[0]?.email || '',
                userId: allUsers[0]?.id || '',
                credentials: {
                  email: allUsers[0]?.email || 'customer@service.io',
                  password: `Keyoon#${Math.floor(100000 + Math.random() * 900000)}`,
                  pinCode: `${Math.floor(1000 + Math.random() * 9000)}`,
                  profileName: 'VIP Profile 1',
                  notes: '100% Full replacement warranty verified.',
                },
              });
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Provision New Subscription</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Purge all unlinked demo mock subscriptions from database? Only real customer subscriptions will remain.')) {
                await adminPurgeMockSubscriptions();
                setSelectedSubIds([]);
                showFeedback('success', 'All demo subscriptions purged from database.');
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer"
            title="Purge mock demo subscriptions from Firestore"
          >
            <Trash2 className="h-4 w-4" />
            <span>Purge Demo Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (window.confirm('⚠️ Are you sure you want to delete ALL subscriptions in the database for a fresh clean start?')) {
                await adminPurgeAllSubscriptions();
                setSelectedSubIds([]);
                showFeedback('success', 'All subscriptions purged. Database is now clean.');
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-red-500/30 cursor-pointer"
            title="Wipe entire subscriptions collection"
          >
            <Trash2 className="h-4 w-4" />
            <span>Purge All (Reset)</span>
          </button>

          {selectedSubIds.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm(`Delete ${selectedSubIds.length} selected subscription(s)?`)) {
                  for (const id of selectedSubIds) {
                    await adminDeleteSubscription(id);
                  }
                  setSelectedSubIds([]);
                  showFeedback('success', `Deleted ${selectedSubIds.length} subscriptions.`);
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected ({selectedSubIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: `All (${allSubscriptions.length})` },
            { id: 'active', label: `Active (${activeSubsCount})` },
            { id: 'expiring_soon', label: `Expiring Soon (${expiringCount})` },
            { id: 'expired', label: `Expired (${allSubscriptions.filter(s => s.status === 'expired').length})` },
            { id: 'paused', label: `Paused (${allSubscriptions.filter(s => s.status === 'paused').length})` },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSubStatusFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subStatusFilter === f.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            value={subSearch}
            onChange={e => setSubSearch(e.target.value)}
            placeholder="Search user, product, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-slate-400 uppercase border-b border-white/[0.06] text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredSubsList.length > 0 && selectedSubIds.length === filteredSubsList.length}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedSubIds(filteredSubsList.map(s => s.id));
                      } else {
                        setSelectedSubIds([]);
                      }
                    }}
                    className="h-3.5 w-3.5 rounded accent-cyan-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Product / Plan</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Vault Credentials</th>
                <th className="p-4">Status</th>
                <th className="p-4">Expires On</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredSubsList.map(s => {
                const daysLeft = calculateDaysRemaining(s.expiryDate);
                const isExpired = s.status === 'expired' || daysLeft < 0;
                const isExpiring = daysLeft <= 3 && !isExpired;
                const isPwdVisible = showAdminVaultPassword[s.id];
                const isSelected = selectedSubIds.includes(s.id);

                return (
                  <tr key={s.id} className={`hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-cyan-950/20' : ''}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedSubIds(prev => [...prev, s.id]);
                          } else {
                            setSelectedSubIds(prev => prev.filter(id => id !== s.id));
                          }
                        }}
                        className="h-3.5 w-3.5 rounded accent-cyan-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.productLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                          alt={s.productName}
                        />
                        <div>
                          <span className="font-bold text-white block">{s.productName}</span>
                          <span className="text-[11px] text-cyan-400 font-mono font-semibold">{s.durationLabel}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-white text-xs block font-bold truncate max-w-[180px]">
                          {s.userEmail || 'Guest Customer'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ref: #{s.orderId ? s.orderId.replace('ord_', '') : s.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {(!s.credentials?.email && !s.credentials?.password) || s.credentialsConfigured === false ? (
                        <button
                          type="button"
                          onClick={() => setEditingFullSubscription({ ...s, isNew: false })}
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:border-amber-400/70 transition-all cursor-pointer group"
                          title="Click to set real credentials for this customer"
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                          <div className="text-left">
                            <div className="text-amber-400 font-bold text-[11px]">⚠️ Credentials Needed</div>
                            <div className="text-slate-500 text-[10px]">Click Edit to configure real login</div>
                          </div>
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1.5 max-w-[260px]">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">User:</span>
                            <span className="text-white font-bold truncate max-w-[160px] select-all">{s.credentials?.email || '—'}</span>
                          </div>
                          {s.credentials?.password && (
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-400">Pass:</span>
                              <div className="flex items-center gap-1">
                                <span className="text-cyan-300 font-bold select-all">
                                  {isPwdVisible ? s.credentials.password : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowAdminVaultPassword(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                  className="text-slate-500 hover:text-white p-0.5 cursor-pointer"
                                >
                                  {isPwdVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                              </div>
                            </div>
                          )}
                          {(s.credentials?.pinCode || s.credentials?.profileName) && (
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-white/[0.04]">
                              <span>{s.credentials.profileName || 'Slot'}</span>
                              <span className="text-amber-400 font-mono font-bold">PIN: {s.credentials.pinCode || 'None'}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <select
                        value={s.status}
                        onChange={e => adminUpdateSubscriptionStatus(s.id, e.target.value as any).then(() => showFeedback('success', 'Status updated.'))}
                        className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold focus:outline-none bg-zinc-900 cursor-pointer ${
                          s.status === 'active' ? 'text-emerald-400 border-emerald-500/30' :
                          s.status === 'expired' ? 'text-red-400 border-red-500/30' :
                          'text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="expiring_soon">Expiring Soon</option>
                        <option value="expired">Expired</option>
                        <option value="paused">Paused</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold block ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-slate-200'}`}>
                          {new Date(s.expiryDate).toLocaleDateString()}
                        </span>
                        <span className={`text-[10px] font-semibold ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-slate-500'}`}>
                          {isExpired ? 'Expired' : `${daysLeft} days left`}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingFullSubscription({ ...s, isNew: false })}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-bold text-xs flex items-center gap-1 border border-white/10 cursor-pointer"
                          title="Full edit subscription credentials and details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        {subDeleteConfirmId === s.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={async () => {
                                await adminDeleteSubscription(s.id);
                                setSubDeleteConfirmId(null);
                                showFeedback('success', 'Subscription deleted.');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setSubDeleteConfirmId(null)}
                              className="p-1 rounded-xl bg-zinc-800 text-slate-400 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSubDeleteConfirmId(s.id)}
                            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                            title="Delete subscription document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSubsList.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No subscriptions match your filter. Click &quot;Provision New Subscription&quot; above to issue credentials.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
