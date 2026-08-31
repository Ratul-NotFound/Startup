'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Send, CheckCircle2, AlertCircle, Bot, Zap, Sparkles } from 'lucide-react';
import { QuickMessage } from '@/types';
import { TELEGRAM_CONFIG } from '@/lib/telegram';

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
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);
  const [tgTestStatus, setTgTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleRegisterWebhook = async () => {
    setIsRegisteringWebhook(true);
    setTgTestStatus(null);
    try {
      const res = await fetch('/api/telegram/set-webhook', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setTgTestStatus({
          success: true,
          message: `✅ Webhook active! URL: ${data.webhookUrl} — Telegram button clicks & 1-on-1 agent replies are now connected!`,
        });
      } else {
        setTgTestStatus({
          success: false,
          message: data.error || (data.telegramResult?.description ? `Telegram: ${data.telegramResult.description}` : 'Failed to register webhook.'),
        });
      }
    } catch (err: any) {
      setTgTestStatus({ success: false, message: err?.message || 'Network error' });
    } finally {
      setIsRegisteringWebhook(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTg(true);
    setTgTestStatus(null);
    try {
      const res = await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'custom',
          payload: {
            text: `🧪 <b>[KEYOON SYSTEM TEST ALERT]</b>\n` +
              `━━━━━━━━━━━━━━━━━━━━\n` +
              `✅ <b>Bot Name:</b> ${TELEGRAM_CONFIG.botName}\n` +
              `👥 <b>Group:</b> ${TELEGRAM_CONFIG.groupName} (<code>${TELEGRAM_CONFIG.defaultGroupId}</code>)\n` +
              `💬 <b>Topic:</b> ${TELEGRAM_CONFIG.topicName} (ID: <code>${TELEGRAM_CONFIG.defaultTopicId}</code>)\n` +
              `🕒 <b>Triggered:</b> ${new Date().toLocaleString()}\n` +
              `━━━━━━━━━━━━━━━━━━━━\n` +
              `🚀 <i>Telegram Support Bot integration is active and operating normally! Customer chats and orders will alert this topic in real-time.</i>`,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTgTestStatus({ success: true, message: `✅ Test alert delivered successfully to Topic #749 (Msg ID: ${data.messageId || 'OK'})` });
      } else {
        setTgTestStatus({ success: false, message: data.warning || data.error || (data.telegramError?.description ? `Telegram: ${data.telegramError.description}` : 'Failed to dispatch test message. Check TELEGRAM_BOT_TOKEN.') });
      }
    } catch (err: any) {
      setTgTestStatus({ success: false, message: err?.message || 'Network error' });
    } finally {
      setIsTestingTg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Telegram Support Bot Forum Integration Card ──────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-blue-950/40 border border-blue-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">{TELEGRAM_CONFIG.botName}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Forum Topic #749 Synced
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Real-time ops notifications routed to group <b>{TELEGRAM_CONFIG.groupName}</b> &gt; topic <b>{TELEGRAM_CONFIG.topicName}</b>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRegisterWebhook}
              disabled={isRegisteringWebhook}
              className="px-3.5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRegisteringWebhook ? (
                <Zap className="h-4 w-4 animate-spin text-cyan-400" />
              ) : (
                <Sparkles className="h-4 w-4 text-cyan-400" />
              )}
              <span>Sync Webhook (2-Way Claim)</span>
            </button>

            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={isTestingTg}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isTestingTg ? (
                <>
                  <Zap className="h-4 w-4 animate-spin text-white" />
                  <span>Sending Test Ping...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Test Alert to Topic #749</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telegram Configuration Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Group ID</span>
            <p className="font-mono text-xs font-bold text-white">{TELEGRAM_CONFIG.defaultGroupId}</p>
            <span className="text-[10px] text-slate-500">{TELEGRAM_CONFIG.groupName}</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Topic ID</span>
            <p className="font-mono text-xs font-bold text-cyan-400">message_thread_id: {TELEGRAM_CONFIG.defaultTopicId}</p>
            <span className="text-[10px] text-slate-500">{TELEGRAM_CONFIG.topicName} (Forum)</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Events</span>
            <p className="text-xs font-bold text-emerald-400">Live Chat + Orders + Tickets</p>
            <span className="text-[10px] text-slate-500">Zero ticket closing delays</span>
          </div>
        </div>

        {/* Test Result Feedback */}
        {tgTestStatus && (
          <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border ${
            tgTestStatus.success
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
          }`}>
            {tgTestStatus.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <p>{tgTestStatus.message}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
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
