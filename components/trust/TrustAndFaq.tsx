'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const TrustAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'How does automated delivery work?',
      a: 'Immediately upon checkout completion, login details, backup codes, or direct workspace invites are revealed in your Dashboard Vault and emailed to you within 30 seconds.',
    },
    {
      q: 'Are accounts private or shared?',
      a: 'We offer both dedicated private accounts (e.g. ChatGPT Plus, Claude 3.5, Cursor) and dedicated private profile slots with PIN locks (e.g. Netflix 4K UHD).',
    },
    {
      q: 'What happens when a subscription renewal is due?',
      a: 'If auto-renew is enabled, the subscription extends automatically. If manual, you can click Extend +30 Days from your dashboard at any time.',
    },
    {
      q: 'What is the replacement warranty coverage?',
      a: 'All plans include 100% full-term replacement coverage in case of any access disruptions or password updates.',
    },
  ];

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4 pb-8">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
        <p className="text-xs text-zinc-400">Everything you need to know about delivery and warranty.</p>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden text-xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-zinc-200 hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
