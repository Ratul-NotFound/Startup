'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { calculateDaysRemaining, calculateExpiryProgress } from '@/lib/utils';
import { playCredentialUnlockSound } from '@/lib/sound-effects';

export const CredentialVaultModal: React.FC = () => {
  const { activeVaultSub, setActiveVaultSub, toggleAutoRenew, extendSubscription, openChatWithContext } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [replacementRequested, setReplacementRequested] = useState(false);

  if (!activeVaultSub) return null;

  const daysLeft = calculateDaysRemaining(activeVaultSub.expiryDate);
  const percentRemaining = calculateExpiryProgress(activeVaultSub.startDate, activeVaultSub.expiryDate, activeVaultSub.planDuration);
  const isUrgent = daysLeft <= 3 && daysLeft > 0;
  const isExpired = activeVaultSub.status === 'expired' || daysLeft <= 0;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRequestReplacement = () => {
    setReplacementRequested(true);
    const sub = activeVaultSub;
    setActiveVaultSub(null);
    openChatWithContext(
      `🔑 Credential Refresh Request for ${sub.productName} | Subscription ID: ${sub.id}`,
      {
        type: 'credential_issue',
        subscriptionId: sub.id,
        productName: sub.productName,
        orderNumber: sub.orderId,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-obsidian-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 my-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <img
              src={activeVaultSub.productLogo}
              alt={activeVaultSub.productName}
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-brand-500/40 shadow-glow shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AES-256 Encrypted
                </span>
                <span className={`text-xs font-semibold ${isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isExpired ? 'Expired' : `${daysLeft} Days Remaining`}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">{activeVaultSub.productName}</h3>
            </div>
          </div>

          <button
            onClick={() => setActiveVaultSub(null)}
            className="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Synced Expiry Countdown Bar */}
        <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-cyan-400" /> Plan Expiry Status
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`font-bold ${isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-white'}`}>
                {isExpired ? 'Expired' : `${daysLeft} days remaining`}
              </span>
              {!isExpired && (
                <span className="text-[10px] text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                  {percentRemaining}%
                </span>
              )}
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800/80 p-0.5 border border-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExpired
                  ? 'bg-red-500 shadow-red-500/50'
                  : isUrgent
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-amber-500/50'
                  : percentRemaining > 50
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-cyan-500/30'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-cyan-500/30'
              }`}
              style={{ width: `${isExpired ? 100 : Math.max(3, percentRemaining)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-mono">
            <span>Started: {new Date(activeVaultSub.startDate || Date.now()).toLocaleDateString()}</span>
            <span>Expires on {new Date(activeVaultSub.expiryDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Credentials Box */}
        <div className="p-5 rounded-2xl bg-obsidian-950 border border-brand-500/30 space-y-4 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Allocated Account Credentials
            </span>
            <span className="text-[11px] text-slate-400">Order Ref: {activeVaultSub.orderId}</span>
          </div>

          {/* Email / Username */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Assigned Login Email</label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-obsidian-850 border border-white/[0.08]">
              <span className="text-xs font-mono text-white flex-1 select-all truncate">
                {activeVaultSub.credentials.email}
              </span>
              <button
                onClick={() => copyToClipboard(activeVaultSub.credentials.email, 'email')}
                className="p-1.5 rounded-lg bg-brand-900/40 hover:bg-brand-800/60 text-brand-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedField === 'email' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Password (if present) */}
          {activeVaultSub.credentials.password && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">Account Password</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!showPassword) playCredentialUnlockSound();
                    setShowPassword(!showPassword);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-obsidian-850 border border-white/[0.08]">
                <span className="text-xs font-mono text-white flex-1 select-all truncate">
                  {showPassword ? activeVaultSub.credentials.password : '••••••••••••••••••••'}
                </span>
                <button
                  onClick={() => copyToClipboard(activeVaultSub.credentials.password || '', 'password')}
                  className="p-1.5 rounded-lg bg-brand-900/40 hover:bg-brand-800/60 text-brand-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedField === 'password' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedField === 'password' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Profile Name & PIN (e.g. for Netflix) */}
          {activeVaultSub.credentials.profileName && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-obsidian-850 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Profile</span>
                <p className="text-xs font-bold text-white mt-0.5">{activeVaultSub.credentials.profileName}</p>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-850 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Profile Lock PIN</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {activeVaultSub.credentials.pinCode || 'No PIN'}
                  </span>
                  {activeVaultSub.credentials.pinCode && (
                    <button
                      onClick={() => copyToClipboard(activeVaultSub.credentials.pinCode || '', 'pin')}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      {copiedField === 'pin' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Direct Invite link (if direct upgrade) */}
          {activeVaultSub.credentials.inviteLink && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">VIP Invitation Link</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-obsidian-850 border border-white/[0.08]">
                <span className="text-xs font-mono text-cyan-300 flex-1 truncate">
                  {activeVaultSub.credentials.inviteLink}
                </span>
                <a
                  href={activeVaultSub.credentials.inviteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/70 text-cyan-200 text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Link</span>
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {activeVaultSub.credentials.notes && (
            <p className="text-[11px] text-slate-400 bg-obsidian-900 p-2.5 rounded-xl border border-white/[0.05]">
              💡 {activeVaultSub.credentials.notes}
            </p>
          )}
        </div>

        {/* Expiry Date Card */}
        <div className="p-4 rounded-2xl bg-obsidian-850 border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>Expires on {new Date(activeVaultSub.expiryDate).toLocaleDateString()}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Active Warranty Protection: <strong>100% Full-Term</strong>
            </p>
          </div>

          <div className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            {activeVaultSub.status === 'active' ? 'Active' : activeVaultSub.status}
          </div>
        </div>

        {/* Replacement Guarantee Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Replacement Warranty Active</span>
          </div>

          <button
            onClick={handleRequestReplacement}
            disabled={replacementRequested}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
          >
            {replacementRequested ? '✓ Replacement Ticket Dispatched' : 'Request Slot Refresh'}
          </button>
        </div>

      </div>
    </div>
  );
};
