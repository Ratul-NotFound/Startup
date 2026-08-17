'use client';

import React, { useState } from 'react';
import { Activity, Search, Download, Shield, Clock, CheckCircle2, XCircle, Key, Tag, Package, UserCheck, CreditCard, RefreshCw } from 'lucide-react';
import { AdminActivityLog } from '@/types';

interface AdminActivityLogsTabProps {
  logs: AdminActivityLog[];
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function AdminActivityLogsTab({ logs, showFeedback }: AdminActivityLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'orders' | 'vault' | 'catalog' | 'coupons' | 'payments' | 'admins' | 'system'>('all');

  const filteredLogs = logs.filter(log => {
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesQuery = !searchQuery.trim() ||
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const getCategoryBadge = (category: AdminActivityLog['category']) => {
    switch (category) {
      case 'orders':
        return { icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />, color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', label: 'Order Processing' };
      case 'vault':
        return { icon: <Key className="h-3.5 w-3.5 text-cyan-400" />, color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40', label: 'Vault Credentials' };
      case 'catalog':
        return { icon: <Package className="h-3.5 w-3.5 text-blue-400" />, color: 'bg-blue-950/80 text-blue-300 border-blue-500/40', label: 'Catalog Item' };
      case 'coupons':
        return { icon: <Tag className="h-3.5 w-3.5 text-amber-400" />, color: 'bg-amber-950/80 text-amber-300 border-amber-500/40', label: 'Coupon & Offer' };
      case 'payments':
        return { icon: <CreditCard className="h-3.5 w-3.5 text-purple-400" />, color: 'bg-purple-950/80 text-purple-300 border-purple-500/40', label: 'Payment Gateway' };
      case 'admins':
        return { icon: <UserCheck className="h-3.5 w-3.5 text-rose-400" />, color: 'bg-rose-950/80 text-rose-300 border-rose-500/40', label: 'Admin Access' };
      default:
        return { icon: <Activity className="h-3.5 w-3.5 text-indigo-400" />, color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40', label: 'System Engine' };
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      showFeedback('error', 'No activity logs available to export.');
      return;
    }

    const headers = ['Timestamp', 'Admin Email', 'Action', 'Category', 'Details', 'Target ID'];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.adminEmail}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.targetId || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_activity_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('success', 'Admin activity log CSV report exported successfully.');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-white/[0.08]">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <span>Admin Activity &amp; Audit Trace Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit history tracing order approvals, vault provisioning, credentials edits, catalog updates, and admin actions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
        >
          <Download className="h-4 w-4 text-cyan-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by admin email, action, order # or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All Logs (${logs.length})` },
            { id: 'orders', label: 'Orders' },
            { id: 'vault', label: 'Vault' },
            { id: 'catalog', label: 'Catalog' },
            { id: 'coupons', label: 'Coupons' },
            { id: 'admins', label: 'Admins' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredLogs.map(log => {
          const badge = getCategoryBadge(log.category);
          const logDate = new Date(log.timestamp);
          const timeAgo = formatTimeAgo(logDate);

          return (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-zinc-900 border border-white/[0.08] hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="h-10 w-10 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {badge.icon}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{log.action}</span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {log.details}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="font-mono text-cyan-400 font-semibold">{log.adminEmail}</span>
                    {log.targetId && (
                      <span className="font-mono text-slate-500">Target: #{log.targetId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.05]">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                  <Clock className="h-3 w-3 text-cyan-400" />
                  <span>{timeAgo}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                  {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-xs rounded-3xl bg-zinc-900 border border-white/[0.06] space-y-2">
            <Activity className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-400">No admin activity logs found</p>
            <p className="text-[11px]">Admin actions such as approving orders, editing vault logins, or modifying catalog items will be recorded here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
