'use client';

import React from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { CustomerProfile } from '@/types';
import { SUPERADMIN_EMAIL } from '@/context/AppContext';

interface UsersTabProps {
  allUsers: CustomerProfile[];
  userSearch: string;
  setUserSearch: (q: string) => void;
  getCustomerInfo: (userId?: string, userEmail?: string, fallbackName?: string) => { name: string; avatar: string; email: string };
  setDirectMessageTarget: (target: { id: string; name: string; email: string; avatar: string } | null) => void;
  setDirectMessageSubject: (sub: string) => void;
  setDirectMessageBody: (body: string) => void;
  setShowDirectMessageModal: (show: boolean) => void;
  isSuperAdmin: boolean;
  adminUpdateUserRole: (userId: string, role: 'customer' | 'admin') => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function UsersTab({
  allUsers,
  userSearch,
  setUserSearch,
  getCustomerInfo,
  setDirectMessageTarget,
  setDirectMessageSubject,
  setDirectMessageBody,
  setShowDirectMessageModal,
  isSuperAdmin,
  adminUpdateUserRole,
  showFeedback,
}: UsersTabProps) {
  return (
    <div className="space-y-5">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
          placeholder="Search users by name or email…"
        />
      </div>
      <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-slate-400 uppercase border-b border-white/[0.06]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4 text-right">Role Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {allUsers.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).map(u => {
                const isOwner = u.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=40`} className="h-8 w-8 rounded-full object-cover" alt={u.name} />
                        <span className="font-bold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOwner ? 'bg-red-950/80 text-red-300 border-red-500/40' :
                        u.role === 'admin' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' : 'bg-zinc-800 text-slate-300 border-white/10'
                      }`}>{isOwner ? 'Superadmin' : u.role}</span>
                    </td>
                    <td className="p-4 text-slate-400">{u.joinedDate ? new Date(u.joinedDate).toLocaleDateString() : '—'}</td>
                    <td className="p-4 font-bold text-emerald-400">${(u.lifetimeSpend || 0).toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const cust = getCustomerInfo(u.id, u.email, u.name);
                            setDirectMessageTarget({ id: u.id, name: cust.name, email: u.email, avatar: cust.avatar });
                            setDirectMessageSubject('');
                            setDirectMessageBody('');
                            setShowDirectMessageModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                          title="Direct message user"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Message</span>
                        </button>

                        {isOwner ? (
                          <span className="text-[10px] text-slate-500 italic">Superadmin</span>
                        ) : isSuperAdmin ? (
                          <select
                            value={u.role}
                            onChange={e => adminUpdateUserRole(u.id, e.target.value as any).then(() => showFeedback('success', 'User role updated.'))}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 border border-white/10 text-xs text-white focus:outline-none cursor-pointer"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Administrator</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-500">Superadmin required</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allUsers.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
