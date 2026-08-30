'use client';

import React, { useState } from 'react';
import { Flame, Bell, Sparkles, ArrowRight, Zap } from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  tag: 'FLASH DEAL' | 'UPDATE' | 'DELIVERY' | 'NOTICE';
  tagBangla: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann_1',
    tag: 'FLASH DEAL',
    tagBangla: '⚡ বিশেষ ছাড়',
    text: 'আজকের মেগা অফার: ChatGPT Plus, Claude 3.5 Pro ও Midjourney-তে ৮০% পর্যন্ত আকর্ষণীয় ডিসকাউন্ট!',
    linkText: 'অফার নিন',
    linkUrl: '#catalog',
  },
  {
    id: 'ann_2',
    tag: 'DELIVERY',
    tagBangla: '🚀 দ্রুত ডেলিভারি',
    text: 'বিকাশ, নগদ ও রকেটে পেমেন্ট করার মাত্র ৩০ সেকেন্ডের মধ্যে ভল্টে ক্রেডেনশিয়াল ডেলিভারি নিশ্চিত।',
    linkText: 'পেমেন্ট মেথড',
    linkUrl: '#catalog',
  },
  {
    id: 'ann_3',
    tag: 'UPDATE',
    tagBangla: '🛡️ ওয়ারেন্টি নিশ্চয়তা',
    text: 'প্রতিটি পার্সোনাল ও টিম অ্যাকাউন্টে ১০০% ফুল-টার্ম রিপ্লেসমেন্ট ওয়ারেন্টি ও ২৪/৭ লাইভ সাপোর্ট।',
    linkText: 'ওয়ারেন্টি পলিসি',
    linkUrl: '#catalog',
  },
  {
    id: 'ann_4',
    tag: 'NOTICE',
    tagBangla: '🎁 ফ্রি গিভঅ্যাওয়ে',
    text: 'কমিউনিটি গিভঅ্যাওয়ে: ৩টি সহজ মিশন সম্পন্ন করে সম্পূর্ণ বিনামূল্যে প্রিমিয়াম সফটওয়্যার আনলক করুন!',
    linkText: 'মিশন দেখুন',
    linkUrl: '#catalog',
  },
];

interface AnnouncementBarProps {
  items?: AnnouncementItem[];
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  items = DEFAULT_ANNOUNCEMENTS,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const getTagBadge = (item: AnnouncementItem) => {
    switch (item.tag) {
      case 'FLASH DEAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 font-['Hind_Siliguri',sans-serif]">
            <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
            {item.tagBangla}
          </span>
        );
      case 'DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 font-['Hind_Siliguri',sans-serif]">
            <Zap className="h-3 w-3 text-emerald-400" />
            {item.tagBangla}
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30 font-['Hind_Siliguri',sans-serif]">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            {item.tagBangla}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/30 font-['Hind_Siliguri',sans-serif]">
            <Bell className="h-3 w-3 text-blue-400" />
            {item.tagBangla}
          </span>
        );
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-30 w-full overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-y border-white/[0.08] shadow-inner select-none py-2"
    >
      {/* Edge gradient masks for seamless overflow fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      <div
        className="animate-marquee flex whitespace-nowrap"
        style={{
          animationDuration: '68s',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {/* Repeating pairs for continuous seamless GPU looping */}
        {[...items, ...items, ...items].map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="inline-flex items-center gap-2.5 mx-5 text-xs text-zinc-300 shrink-0 font-['Hind_Siliguri',sans-serif]"
          >
            {getTagBadge(item)}
            <span className="font-semibold text-zinc-200 tracking-normal text-[13px]">{item.text}</span>
            {item.linkUrl && (
              <a
                href={item.linkUrl}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold hover:underline ml-1 cursor-pointer transition-colors text-xs"
              >
                <span>{item.linkText || 'দেখুন'}</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
            <span className="text-zinc-600 text-sm ml-4">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};
