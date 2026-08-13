'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Lock, MessageSquare } from 'lucide-react';

interface FaqItem {
  tag: string;
  q: string;
  a: string;
}

export const TrustAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      tag: 'INSTANT DISPATCH',
      q: 'How does automated credential delivery work?',
      a: 'Immediately upon checkout confirmation, our automated bot provisions your subscription. Decrypted credentials, dedicated PINs, or direct workspace invites appear in your private Customer Vault and are delivered to your email in under 30 seconds.',
    },
    {
      tag: 'PRIVACY & SLOTS',
      q: 'Are accounts private or shared?',
      a: 'We offer dedicated private accounts (such as ChatGPT Plus, Claude 3.5 Pro, and Cursor Pro) and dedicated PIN-locked private profile slots (such as Netflix 4K UHD and YouTube Premium) to ensure 100% uninterrupted access.',
    },
    {
      tag: 'WARRANTY & REPLACEMENT',
      q: 'What is the full-term replacement guarantee?',
      a: 'Every subscription purchased on SubNexus comes backed by our 100% Full-Term Replacement Warranty. If you ever encounter access disruptions, password updates, or regional lockouts, our support bots immediately reissue valid credentials.',
    },
    {
      tag: 'AUTOMATED RENEWALS',
      q: 'How do subscription extensions and renewals work?',
      a: 'You have full autonomy over your subscriptions. You can enable automatic renewal or manually extend any plan (+30 days, +90 days, or +1 year) with a single click directly from your Customer Vault dashboard.',
    },
    {
      tag: 'SECURITY PROTOCOL',
      q: 'How is payment and credential data protected?',
      a: 'We operate on zero-knowledge architecture. All credentials stored in your vault are encrypted with AES-256 bit protocols, and payments are processed through secure multi-rail gateways including Stripe, Apple Pay, and verified Crypto webhooks.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8 pb-12">
      
      {/* Header with Space Grotesk Typography */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-[11px] font-mono font-medium backdrop-blur-md">
          <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
          <span>HELP & VERIFICATION</span>
        </div>

        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Frequently Asked <span className="text-cyan-400">Questions</span>
        </h2>

        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Everything you need to know about automated bot dispatch, full-term warranty, and encrypted vaults.
        </p>
      </div>

      {/* Glassmorphic FAQ Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-300 backdrop-blur-xl border ${
                isOpen
                  ? 'bg-zinc-900/90 border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
                  : 'bg-zinc-900/50 hover:bg-zinc-900/70 border-white/[0.06]'
              }`}
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-zinc-200 hover:text-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 text-cyan-400 w-fit shrink-0 border border-white/5">
                    {faq.tag}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white font-sans">
                    {faq.q}
                  </span>
                </div>

                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 bg-cyan-500/20 text-cyan-400' : ''
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-zinc-300/90 pt-1 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 24/7 Live Support Callout Pill */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-cyan-950/40 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Have custom enterprise inquiries or need help?</h4>
            <p className="text-[11px] text-zinc-400">Our automated bot dispatch and support team is online 24/7.</p>
          </div>
        </div>

        <a
          href="/dashboard"
          className="px-5 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shrink-0"
        >
          Open Support Ticket
        </a>
      </div>

    </section>
  );
};
