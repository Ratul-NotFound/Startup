'use client';

import React, { useState } from 'react';
import { Search, Eye, Check, X, Loader2, FileText, Edit2, Mail, Copy } from 'lucide-react';
import { Order } from '@/types';
import { printCleanInvoice } from '@/lib/invoice-printer';

interface OrdersTabProps {
  allOrders: Order[];
  orderStatusFilter: 'all' | 'pending' | 'paid' | 'failed';
  setOrderStatusFilter: (status: 'all' | 'pending' | 'paid' | 'failed') => void;
  orderSearch: string;
  setOrderSearch: (q: string) => void;
  getCustomerInfo: (userId?: string, userEmail?: string, fallbackName?: string) => { name: string; avatar: string; email: string };
  setPreviewScreenshotUrl: (url: string | null) => void;
  approvingOrderId: string | null;
  setPerItemCreds: React.Dispatch<React.SetStateAction<Array<{ email: string; password: string; pinCode: string; profileName: string; notes: string }>>>;
  setApprovalStep: (step: 'verify' | 'credentials' | 'confirm') => void;
  setRejectionReason: (reason: string) => void;
  setShowRejectionInput: (show: boolean) => void;
  setCustomProvisionOrder: (order: Order | null) => void;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function OrdersTab({
  allOrders,
  orderStatusFilter,
  setOrderStatusFilter,
  orderSearch,
  setOrderSearch,
  getCustomerInfo,
  setPreviewScreenshotUrl,
  approvingOrderId,
  setPerItemCreds,
  setApprovalStep,
  setRejectionReason,
  setShowRejectionInput,
  setCustomProvisionOrder,
  showFeedback,
}: OrdersTabProps) {
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const handleCopyEmail = (orderId: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(orderId);
    setTimeout(() => setCopiedEmailId(null), 2000);
    showFeedback('success', `Copied ${email} to clipboard!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'pending', 'paid', 'failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setOrderStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                orderStatusFilter === st
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-slate-400'
              }`}
            >
              {st === 'pending' ? 'Pending Proofs' : st === 'paid' ? 'Paid & Delivered' : st === 'failed' ? 'Rejected' : 'All Orders'}
              {st === 'pending' && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  {allOrders.filter(o => o.paymentStatus === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 placeholder-zinc-500"
            placeholder="Search TrxID, sender, claim email, order #…"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-slate-400 uppercase border-b border-white/[0.06] text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Order &amp; Customer</th>
                <th className="p-4">Delivery Claim Email</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount &amp; Method</th>
                <th className="p-4">Sender Phone</th>
                <th className="p-4">TrxID / Reference</th>
                <th className="p-4">Screenshot Proof</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {allOrders
                .filter(o => {
                  if (orderStatusFilter !== 'all' && o.paymentStatus !== orderStatusFilter) return false;
                  const q = orderSearch.toLowerCase();
                  return (
                    o.orderNumber.toLowerCase().includes(q) ||
                    o.userEmail.toLowerCase().includes(q) ||
                    (o.claimEmail && o.claimEmail.toLowerCase().includes(q)) ||
                    (o.transactionId && o.transactionId.toLowerCase().includes(q)) ||
                    (o.senderNumber && o.senderNumber.toLowerCase().includes(q))
                  );
                })
                .map(o => {
                  const isPending = o.paymentStatus === 'pending';
                  const targetDeliveryEmail = o.claimEmail || o.userEmail;

                  return (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        {(() => {
                          const cust = getCustomerInfo(o.userId, o.userEmail);
                          return (
                            <div className="flex items-center gap-2.5">
                              <img
                                src={cust.avatar}
                                alt={cust.name}
                                className="h-8 w-8 rounded-full object-cover border border-white/15 shrink-0 shadow-sm"
                              />
                              <div>
                                <div className="font-bold text-white text-xs">{cust.name}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-[10px] text-cyan-400 font-bold">#{o.orderNumber}</span>
                                  <span className="text-[10px] text-slate-500">·</span>
                                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{o.userEmail}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Delivery Claim Email Column */}
                      <td className="p-4 max-w-[190px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-cyan-300 font-bold truncate block" title={targetDeliveryEmail}>
                              {targetDeliveryEmail}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(o.id, targetDeliveryEmail)}
                              className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Copy email to clipboard"
                            >
                              {copiedEmailId === o.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                              <span>{copiedEmailId === o.id ? 'Copied' : 'Copy'}</span>
                            </button>
                            <a
                              href={`mailto:${targetDeliveryEmail}?subject=Your%20Keyoon%20Subscription%20Order%20%23${o.orderNumber}`}
                              className="px-1.5 py-0.5 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Send Email"
                            >
                              <Mail className="h-2.5 w-2.5" />
                              <span>Email</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 max-w-[200px]">
                        <div className="space-y-1">
                          {o.items.map((i, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-slate-200">
                              <span className="font-bold">{i.quantity}x</span>
                              <span className="truncate">{i.productName}</span>
                              <span className="text-[10px] text-cyan-400 font-mono">({i.durationLabel})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-black text-white font-mono text-xs">
                          {o.totalBdt ? `৳${o.totalBdt.toLocaleString()} BDT` : `$${o.total.toFixed(2)}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium capitalize">
                          {o.paymentMethodName || o.paymentMethod}
                        </div>
                        {o.couponCode && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                              🏷️ {o.couponCode}
                            </span>
                            {o.couponDiscount != null && (
                              <span className="text-[10px] text-emerald-400 font-bold">
                                -{o.couponDiscount > 1 ? `৳${o.couponDiscount}` : `${(o.couponDiscount * 100).toFixed(0)}%`} off
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {o.senderNumber ? (
                          <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            {o.senderNumber}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">N/A</span>
                        )}
                      </td>

                      <td className="p-4">
                        {o.transactionId ? (
                          <button
                            type="button"
                            onClick={() => { navigator.clipboard.writeText(o.transactionId!); showFeedback('success', 'TrxID copied!'); }}
                            className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/20 uppercase tracking-wider hover:bg-cyan-900/40 transition-colors cursor-pointer"
                            title="Click to copy Transaction ID"
                          >
                            {o.transactionId}
                          </button>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">N/A</span>
                        )}
                      </td>

                      <td className="p-4">
                        {o.screenshotUrl ? (
                          <button
                            onClick={() => setPreviewScreenshotUrl(o.screenshotUrl!)}
                            className="group relative rounded-xl overflow-hidden border border-white/15 block hover:border-cyan-400 transition-all cursor-pointer"
                            title="Click to view full screenshot proof"
                          >
                            <img
                              src={o.screenshotUrl}
                              alt="Proof"
                              className="h-10 w-10 object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-3.5 w-3.5 text-white" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px]">No image</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                            : o.paymentStatus === 'pending'
                            ? 'bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse'
                            : 'bg-red-950/80 text-red-400 border-red-500/30'
                        }`}>
                          {o.paymentStatus}
                        </span>
                        {o.paymentVerifiedAt && o.paymentStatus === 'pending' && (
                          <div className="text-[10px] text-emerald-400 font-bold mt-0.5">✓ Pmt verified</div>
                        )}
                        {o.rejectionReason && (
                          <div className="text-[10px] text-red-400 mt-0.5 max-w-[120px] truncate" title={o.rejectionReason}>
                            ✗ {o.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const initCreds = o.items.map(() => ({ email: o.userEmail || '', password: '', pinCode: '', profileName: '', notes: '' }));
                                setPerItemCreds(initCreds);
                                setApprovalStep('verify');
                                setRejectionReason('');
                                setShowRejectionInput(false);
                                setCustomProvisionOrder(o);
                              }}
                              disabled={approvingOrderId === o.id}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                            >
                              {approvingOrderId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              <span>Approve &amp; Deliver</span>
                            </button>
                            <button
                              onClick={() => {
                                const initCreds = o.items.map(() => ({ email: '', password: '', pinCode: '', profileName: '', notes: '' }));
                                setPerItemCreds(initCreds);
                                setApprovalStep('verify');
                                setShowRejectionInput(true);
                                setRejectionReason('');
                                setCustomProvisionOrder(o);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 font-bold text-xs transition-colors cursor-pointer"
                              title="Reject order"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500 font-semibold">
                            <button
                              type="button"
                              onClick={() => printCleanInvoice(o)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-cyan-300 border border-white/10 flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                            >
                              <FileText className="h-3 w-3" /><span>Invoice</span>
                            </button>
                            {o.paymentStatus === 'paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const initCreds = o.items.map(() => ({ email: o.userEmail || '', password: '', pinCode: '', profileName: '', notes: '' }));
                                  setPerItemCreds(initCreds);
                                  setApprovalStep('credentials');
                                  setCustomProvisionOrder(o);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-cyan-950/60 text-slate-400 hover:text-cyan-400 border border-white/10 flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                                title="Re-provision credentials"
                              >
                                <Edit2 className="h-3 w-3" /><span>Re-provision</span>
                              </button>
                            )}
                            <span className="text-emerald-400">✓</span>
                            <span>{o.deliveryStatus === 'delivered' ? 'Delivered' : o.deliveryStatus}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {allOrders.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500">No orders recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
