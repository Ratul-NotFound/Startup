'use client';

import React from 'react';
import { QuickMessage } from '@/types';
import { X, MessageSquare, Save } from 'lucide-react';

interface QuickMessageModalProps {
  editingQuickMessage: (QuickMessage & { isNew?: boolean }) | null;
  setEditingQuickMessage: React.Dispatch<React.SetStateAction<(QuickMessage & { isNew?: boolean }) | null>>;
  handleSaveQuickMessage: () => Promise<void>;
}

export function QuickMessageModal({
  editingQuickMessage,
  setEditingQuickMessage,
  handleSaveQuickMessage,
}: QuickMessageModalProps) {
  if (!editingQuickMessage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => setEditingQuickMessage(null)}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {editingQuickMessage.isNew ? 'Add Quick Question & Auto-Answer' : 'Edit Quick Message Chip'}
              </h3>
              <p className="text-[11px] text-slate-400">Configures live chatbot trigger prompts</p>
            </div>
          </div>
          <button
            onClick={() => setEditingQuickMessage(null)}
            className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveQuickMessage();
          }}
          className="space-y-4 text-xs"
        >
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Chip Button Label (Short)</label>
            <input
              type="text"
              value={editingQuickMessage.label}
              onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, label: e.target.value }) : null)}
              placeholder="e.g. ⚡ Delivery Time?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Customer Question Text</label>
            <input
              type="text"
              value={editingQuickMessage.query}
              onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, query: e.target.value }) : null)}
              placeholder="e.g. How fast will I receive my subscription credentials?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Automated AI Answer Body</label>
            <textarea
              rows={4}
              value={editingQuickMessage.answer}
              onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, answer: e.target.value }) : null)}
              placeholder="Provide instant helpful answer..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white resize-none leading-relaxed"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Keywords (Comma-separated for auto-matching)</label>
            <input
              type="text"
              value={(editingQuickMessage.keywords || []).join(', ')}
              onChange={e => {
                const kw = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                setEditingQuickMessage(prev => prev ? ({ ...prev, keywords: kw }) : null);
              }}
              placeholder="e.g. delivery, speed, instant, time"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-cyan-300 font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center pt-1">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Sort Order Rank</label>
              <input
                type="number"
                value={editingQuickMessage.order || 1}
                onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, order: parseInt(e.target.value) || 1 }) : null)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="qmActiveToggle"
                checked={editingQuickMessage.isActive}
                onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="qmActiveToggle" className="text-xs font-bold text-slate-200 cursor-pointer">
                Show on Live Chat Chips
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setEditingQuickMessage(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Quick Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
