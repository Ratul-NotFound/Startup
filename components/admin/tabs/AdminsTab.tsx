'use client';

import React from 'react';
import { UserPlus, Plus, UserX, X } from 'lucide-react';
import { AdminMember } from '@/types';
import { isSuperadminEmail } from '@/context/AppContext';

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
      {/* SECTION 1: ADD NEW ADMIN FORM */}
      {isSuperAdmin && (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              <span>Grant Admin Privileges</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Authorize a team member to access this Command Hub by email.</p>
          </div>

          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Team Member Email</label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                placeholder="e.g. employee@keyoon.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Display Name (Optional)</label>
              <input
                type="text"
                value={newAdminName}
                onChange={e => setNewAdminName(e.target.value)}
                placeholder="e.g. Operations Manager"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAddingAdmin}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{isAddingAdmin ? 'Granting...' : 'Grant Access'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: ACTIVE ADMIN ROSTER */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Authorized Administrators ({adminList.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="border-b border-white/[0.06] text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Added On</th>
                <th className="p-4">Granted By</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {adminList.map(admin => {
                const isOwner = isSuperadminEmail(admin.email);

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
