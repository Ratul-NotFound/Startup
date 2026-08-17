'use client';

import React from 'react';
import { DollarSign, Users, TrendingUp, Headphones, ArrowUpRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order, UserSubscription, CustomerProfile, SupportTicket } from '@/types';
import { AdminTab } from '../AdminHeader';

interface OverviewTabProps {
  financialMetrics: { mrr: number; netRevenueToday: number };
  allOrders: Order[];
  allUsers: CustomerProfile[];
  allSubscriptions: UserSubscription[];
  allTickets: SupportTicket[];
  chartRange: '7d' | '30d' | '6m';
  setChartRange: (range: '7d' | '30d' | '6m') => void;
  revenueChartData: { label: string; revenue: number; orders: number }[];
  setTab: (tab: AdminTab) => void;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function OverviewTab({
  financialMetrics,
  allOrders,
  allUsers,
  allSubscriptions,
  allTickets,
  chartRange,
  setChartRange,
  revenueChartData,
  setTab,
  showFeedback,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${financialMetrics.mrr.toFixed(2)}`, sub: `${allOrders.length} total orders`, icon: <DollarSign className="h-5 w-5 text-emerald-400" />, color: 'text-emerald-400' },
          { label: 'Active Users', value: allUsers.length.toString(), sub: `${allSubscriptions.length} subscriptions`, icon: <Users className="h-5 w-5 text-blue-400" />, color: 'text-blue-400' },
          { label: "Today's Revenue", value: `$${financialMetrics.netRevenueToday.toFixed(2)}`, sub: 'Live automated checkout', icon: <TrendingUp className="h-5 w-5 text-cyan-400" />, color: 'text-cyan-400' },
          { label: 'Open Support Tickets', value: allTickets.filter(t => t.status !== 'closed').length.toString(), sub: `${allTickets.length} total tickets`, icon: <Headphones className="h-5 w-5 text-amber-400" />, color: 'text-amber-400' },
        ].map(kpi => (
          <div key={kpi.label} className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{kpi.label}</span>
              <div className="h-8 w-8 rounded-xl bg-zinc-800 flex items-center justify-center">{kpi.icon}</div>
            </div>
            <div>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Quick Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Performance</h3>
              <p className="text-[11px] text-slate-400">Live gross volume from verified checkouts</p>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-white/[0.08]">
              {(['7d', '30d', '6m'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    chartRange === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '6 Months'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => {
                  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
                  return `$${v}`;
                }}
              />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(v: any) => [
                  `$${Number(v).toFixed(2)} (৳${Math.round(Number(v) * 125).toLocaleString()})`,
                  'Revenue Volume',
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Recent Store Orders</h3>
            <button onClick={() => setTab('orders')} className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
            {allOrders.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950 border border-white/[0.04] text-xs">
                <div>
                  <span className="font-mono text-cyan-400 font-bold">{o.orderNumber}</span>
                  <p className="text-slate-400 text-[11px] truncate max-w-[180px]">{o.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${o.total.toFixed(2)}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">{o.paymentStatus}</span>
                </div>
              </div>
            ))}
            {allOrders.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-10">No orders recorded in Firestore yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
