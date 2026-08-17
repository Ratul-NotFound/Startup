'use client';

import React from 'react';
import { MessageSquare, Plus, Edit2, Trash2 } from 'lucide-react';
import { QuickMessage } from '@/types';

interface BotTabProps {
  quickMessages: QuickMessage[];
  handleResetQuickMessages: () => Promise<void>;
  setEditingQuickMessage: (msg: (QuickMessage & { isNew?: boolean }) | null) => void;
  setQuickMessageDeleteConfirm: (id: string | null) => void;
  quickMessageDeleteConfirm: string | null;
  handleDeleteQuickMessage: (id: string) => Promise<void>;
}

export function BotTab({
  quickMessages,
  handleResetQuickMessages,
  setEditingQuickMessage,
  setQuickMessageDeleteConfirm,
  quickMessageDeleteConfirm,
  handleDeleteQuickMessage,
}: BotTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cyan-400" />
            <span>Bot Quick Questions &amp; Smart Auto-Replies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full CRUD control over clickable chat prompt chips and automated AI intelligence answers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetQuickMessages}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold transition-colors border border-white/10 cursor-pointer"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={() => setEditingQuickMessage({
              id: '',
              label: '',
              query: '',
              answer: '',
              keywords: [],
              order: quickMessages.length + 1,
              isActive: true,
              isNew: true,
            })}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Quick Question &amp; Answer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickMessages.map((qm) => (
          <div
            key={qm.id}
            className={`p-5 rounded-3xl bg-zinc-900 border transition-all space-y-3.5 ${
              qm.isActive ? 'border-white/10' : 'border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-bold text-xs">
                    {qm.label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    qm.isActive
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500 border-white/5'
                  }`}>
                    {qm.isActive ? 'Active Chip' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-white pt-1">
                  &quot;{qm.query}&quot;
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingQuickMessage({ ...qm, isNew: false })}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit Quick Message"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setQuickMessageDeleteConfirm(qm.id)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/50 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Quick Message"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/[0.04] text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Automated Answer:</span>
              {qm.answer}
            </div>

            {qm.keywords && qm.keywords.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap pt-1">
                <span className="text-[10px] text-slate-500 font-medium">Keywords:</span>
                {qm.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] text-slate-300 font-mono">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Message Delete Confirm */}
      {quickMessageDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">Delete Quick Message?</h3>
              <p className="text-xs text-slate-400 mt-1">This quick chip will be removed from customer live chat.</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setQuickMessageDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-slate-300 text-xs font-bold hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuickMessage(quickMessageDeleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
