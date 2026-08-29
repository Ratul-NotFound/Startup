'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

interface FaqItem {
  tag: string;
  q: string;
  a: string;
}

export const TrustAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      tag: 'INSTANT DELIVERY',
      q: 'How fast do I receive my subscription login details?',
      a: 'Immediately after checkout, your login credentials, private PIN, or invite link are automatically displayed in your account dashboard and sent to your email in under 30 seconds.',
    },
    {
      tag: 'ACCOUNT TYPES',
      q: 'Are these private accounts or shared?',
      a: 'We offer dedicated private accounts (such as ChatGPT Plus, Claude 3.5 Pro, and Cursor Pro) and private PIN-locked profiles (such as Netflix 4K UHD and YouTube Premium) so your watch history and workspace stay 100% private.',
    },
    {
      tag: 'WARRANTY & GUARANTEE',
      q: 'What does the full-term replacement warranty cover?',
      a: 'Every subscription comes with 100% full-period replacement protection. If you ever run into any login issues, password updates, or regional restrictions, we instantly fix or replace your plan with zero hassle.',
    },
    {
      tag: 'EASY RENEWALS',
      q: 'How do subscription renewals work?',
      a: 'You have complete control over your plans. You can enable automatic renewal or simply click "Extend +30 Days" anytime from your account dashboard whenever you are ready.',
    },
    {
      tag: 'SAFE PAYMENTS',
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards (Visa, Mastercard), Apple Pay, Google Pay, and popular cryptocurrencies (USDT, Bitcoin) through secure, encrypted checkout.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8 pb-12">
      
      {/* Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 text-xs font-semibold backdrop-blur-md">
          <HelpCircle className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>HELP & SUPPORT</span>
        </div>

        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Frequently Asked <span className="text-cyan-500 dark:text-cyan-400">Questions</span>
        </h2>

        <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
          Everything you need to know about instant delivery, warranties, and how your subscription works.
        </p>
      </motion.div>

      {/* FAQ Accordion with Staggered Scroll Reveal & Fluid Spring Height */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-2xl transition-all duration-300 backdrop-blur-xl border overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-zinc-900/90 border-cyan-500/40 shadow-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
                  : 'bg-white/80 hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900/70 border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none'
              }`}
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 w-fit shrink-0 border border-slate-200 dark:border-white/5">
                    {faq.tag}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-sans">
                    {faq.q}
                  </span>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 shrink-0 ${
                    isOpen ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' : ''
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300/90 pt-1 leading-relaxed border-t border-slate-100 dark:border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* 24/7 Live Support Callout Pill with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-cyan-50 dark:from-blue-950/40 dark:via-zinc-900/60 dark:to-cyan-950/40 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Have questions or need custom team plans?</h4>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400">Our customer support team is online and ready to help 24/7.</p>
          </div>
        </div>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/dashboard"
          className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-sm"
        >
          Contact Support
        </motion.a>
      </motion.div>

    </section>
  );
};
