'use client';

import React from 'react';
import { UserPlus, Plus, UserX, X } from 'lucide-react';
import { AdminMember } from '@/types';
import { SUPERADMIN_EMAIL } from '@/context/AppContext';

interface AdminsTabProps {
  isSuperAdmin: boolean;
  adminList: AdminMember[];
  newAdminEmail: string;
  setNewAdminEmail: (val: string) => void;
  newAdminName: string;
  setNewAdminName: (val: string) => void;
  isAddingAdmin: boolean;
  handleAddAdmin: (e: React.FormEvent) => Promise<void>;
  adminRemoveConfirm: string | null;
  setAdminRemoveConfirm: (email: string | null) => void;
  handleRemoveAdmin: (email: string) => Promise<void>;
}

export function AdminsTab({
  isSuperAdmin,
  adminList,
  newAdminEmail,
  setNewAdminEmail,
  newAdminName,
  setNewAdminName,
  isAddingAdmin,
  handleAddAdmin,
  adminRemoveConfirm,
  setAdminRemoveConfirm,
  handleRemoveAdmin,
}: AdminsTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Administrator Access Control</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Grant team members access to the SubNexus Admin Control Panel.
            </p>
          </div>
        </div>

        {/* Add New Admin Form */}
        {isSuperAdmin && (
          <form onSubmit={handleAddAdmin} className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-cyan-400" /> Add New Administrator
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="admin.email@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  placeholder="Display Name (optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isAddingAdmin}
                  className="w-full h-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Grant Access
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              When this user signs in with Google or Email, they will immediately have administrator panel access.
            </p>
          </form>
        )}

        {/* Admin Members List */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="p-4">Admin</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Added On</th>
                <th className="p-4">Granted By</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {adminList.map(admin => {
                const isOwner = admin.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

                return (
                  <tr key={admin.id || admin.email} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                        {(admin.name || admin.email)[0].toUpperCase()}
                      </div>
                      <span>{admin.name || 'Admin'}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{admin.email}</td>
                    <td className="p-4">
                      {isOwner ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-950/80 text-red-300 border border-red-500/40">
                          Superadmin (Owner)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-500/40">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{admin.addedAt ? new Date(admin.addedAt).toLocaleDateString() : 'System'}</td>
                    <td className="p-4 text-slate-400">{admin.addedBy || 'Owner'}</td>
                    <td className="p-4 text-right">
                      {isOwner ? (
                        <span className="text-[10px] text-slate-500 italic">Primary Account</span>
                      ) : isSuperAdmin ? (
                        adminRemoveConfirm === admin.email ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRemoveAdmin(admin.email)}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Confirm Revoke
                            </button>
                            <button
                              onClick={() => setAdminRemoveConfirm(null)}
                              className="p-1 rounded-lg bg-zinc-800 text-slate-400 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAdminRemoveConfirm(admin.email)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <UserX className="h-3.5 w-3.5 text-red-400" /> Revoke
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-500">Superadmin only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
