'use client';

import React, { useRef, useState } from 'react';
import { HeroSlide, FloatingLogo } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { X, Sparkles, Loader2, ImageIcon, Save, Plus, Trash2 } from 'lucide-react';

interface HeroSlideModalProps {
  editingHeroSlide: (HeroSlide & { isNew?: boolean }) | null;
  setEditingHeroSlide: React.Dispatch<React.SetStateAction<(HeroSlide & { isNew?: boolean }) | null>>;
  isCompressingHeroImg: boolean;
  setIsCompressingHeroImg: (val: boolean) => void;
  handleSaveHeroSlide: () => Promise<void>;
}

const POSITION_PRESETS = [
  { label: 'Top Left (উপরে বামে)', pos: { top: '18%', left: '13%' } },
  { label: 'Top Right (উপরে ডানে)', pos: { top: '16%', right: '14%' } },
  { label: 'Bottom Left (নিচে বামে)', pos: { bottom: '22%', left: '14%' } },
  { label: 'Bottom Right (নিচে ডানে)', pos: { bottom: '20%', right: '14%' } },
];

export function HeroSlideModal({
  editingHeroSlide,
  setEditingHeroSlide,
  isCompressingHeroImg,
  setIsCompressingHeroImg,
  handleSaveHeroSlide,
}: HeroSlideModalProps) {
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Quick logo adder state
  const [showAddLogo, setShowAddLogo] = useState(false);
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoBadge, setNewLogoBadge] = useState('');
  const [newLogoImage, setNewLogoImage] = useState('');
  const [newLogoColor, setNewLogoColor] = useState('#10a37f');
  const [newLogoPreset, setNewLogoPreset] = useState(0);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);

  if (!editingHeroSlide) return null;

  const currentLogos: FloatingLogo[] = editingHeroSlide.floatingLogos || [];

  const handleAddFloatingLogo = () => {
    if (!newLogoName.trim()) return;

    const preset = POSITION_PRESETS[newLogoPreset] || POSITION_PRESETS[0];
    const newLogo: FloatingLogo = {
      id: `logo_${Date.now()}`,
      name: newLogoName.trim(),
      badge: newLogoBadge.trim() || 'PRO',
      image: newLogoImage.trim() || '/images/Fabicon.png',
      color: newLogoColor.trim() || '#06b6d4',
      pos: preset.pos,
      floatDuration: 4.5,
      floatDelay: 0.5,
    };

    setEditingHeroSlide(prev => {
      if (!prev) return null;
      return {
        ...prev,
        floatingLogos: [...(prev.floatingLogos || []), newLogo],
      };
    });

    // Reset logo adder inputs
    setNewLogoName('');
    setNewLogoBadge('');
    setNewLogoImage('');
    setShowAddLogo(false);
  };

  const handleRemoveFloatingLogo = (index: number) => {
    setEditingHeroSlide(prev => {
      if (!prev) return null;
      const updated = (prev.floatingLogos || []).filter((_, i) => i !== index);
      return { ...prev, floatingLogos: updated };
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => setEditingHeroSlide(null)}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-['Hind_Siliguri',sans-serif]">
                {editingHeroSlide.isNew ? 'নতুন হিরো ব্যানার তৈরি করুন' : `হিরো ব্যানার #${editingHeroSlide.order || 1} এডিট করুন`}
              </h3>
              <p className="text-[11px] text-slate-400 font-['Hind_Siliguri',sans-serif]">
                সেভ করার সাথে সাথে ওয়েবসাইটের লাইভ হোমপেজে আপডেট হবে
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingHeroSlide(null)}
            className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveHeroSlide();
          }}
          className="space-y-4 text-xs font-['Hind_Siliguri',sans-serif]"
        >
          {/* Bengali Headline Title & Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">বাংলা প্রধান শিরোনাম (Title)</label>
              <input
                type="text"
                value={editingHeroSlide.titleBangla || editingHeroSlide.title || ''}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, titleBangla: e.target.value, title: e.target.value }) : null)}
                placeholder="যেমন: হাতের মুঠোয় বিশ্বের শীর্ষ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-cyan-300 block">হাইলাইট গ্রাডিয়েন্ট টেক্সট (Highlight)</label>
              <input
                type="text"
                value={editingHeroSlide.titleHighlight || ''}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, titleHighlight: e.target.value }) : null)}
                placeholder="যেমন: AI ও প্রোডাক্টিভিটি টুলস"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-cyan-500/30 text-cyan-300 font-bold text-sm"
              />
            </div>
          </div>

          {/* Subtitle in Bangla */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">বাংলা সাবটাইটেল (Subtitle)</label>
            <input
              type="text"
              value={editingHeroSlide.subBangla || editingHeroSlide.sub || ''}
              onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, subBangla: e.target.value, sub: e.target.value }) : null)}
              placeholder="যেমন: ChatGPT Plus, Claude 3.5 ও Midjourney-তে পান ৮০% পর্যন্ত আকর্ষণীয় ছাড়"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-cyan-400 font-medium"
              required
            />
          </div>

          {/* Status Pill Tag */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">টপ স্ট্যাটাস ব্যাজ (Status Tag)</label>
            <input
              type="text"
              value={editingHeroSlide.tagBangla || editingHeroSlide.tag || ''}
              onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, tagBangla: e.target.value, tag: e.target.value }) : null)}
              placeholder="যেমন: ⚡ ৩০ সেকেন্ডে ডেলিভারি • ১০০% রিপ্লেসমেন্ট ওয়ারেন্টি"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white"
              required
            />
          </div>

          {/* Background Image URL & Uploader */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block">সিনেম্যাটিক ব্যাকগ্রাউন্ড ছবি</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingHeroSlide.bgImage}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, bgImage: e.target.value }) : null)}
                placeholder="Image URL (e.g. /images/hero-vault.jpg or https://...)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px]"
                required
              />

              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setIsCompressingHeroImg(true);
                  try {
                    const dataUrl = await compressImageToDataUrl(f, 1600, 900, 0.75);
                    setEditingHeroSlide(prev => prev ? ({ ...prev, bgImage: dataUrl }) : null);
                  } finally {
                    setIsCompressingHeroImg(false);
                    if (heroFileInputRef.current) heroFileInputRef.current.value = '';
                  }
                }}
                className="hidden"
              />

              <button
                type="button"
                disabled={isCompressingHeroImg}
                onClick={() => heroFileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isCompressingHeroImg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                <span>ছবি আপলোড</span>
              </button>
            </div>
          </div>

          {/* 🪐 Floating Brand Logos Manager */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-black text-cyan-400 block text-xs">
                  🪐 ব্যানারে ভাসমান ব্র্যান্ড লোগো ({currentLogos.length}টি সক্রিয়)
                </label>
                <p className="text-[10px] text-slate-400">ব্যানার লেখার চারপাশে ভাসমান ব্র্যান্ড আইকন ও ব্যাজ</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLogo(prev => !prev)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>লোগো যোগ করুন</span>
              </button>
            </div>

            {/* List of current floating logos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {currentLogos.map((logo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-white/10"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="h-7 w-7 rounded-lg object-cover bg-zinc-800 border border-white/15 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/Fabicon.png';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs truncate">{logo.name}</p>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded font-black"
                        style={{ backgroundColor: `${logo.color}25`, color: logo.color }}
                      >
                        {logo.badge}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFloatingLogo(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sub-form to Add Floating Logo */}
            {showAddLogo && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-cyan-500/30 space-y-3 mt-2 animate-in fade-in duration-200">
                <p className="font-bold text-cyan-300 text-xs">নতুন ব্র্যান্ড লোগো তথ্য</p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">টুল/ব্র্যান্ডের নাম</label>
                    <input
                      type="text"
                      value={newLogoName}
                      onChange={e => setNewLogoName(e.target.value)}
                      placeholder="e.g. ChatGPT Plus"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">ব্যাজ ট্যাগ</label>
                    <input
                      type="text"
                      value={newLogoBadge}
                      onChange={e => setNewLogoBadge(e.target.value)}
                      placeholder="e.g. GPT-4o"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">লোগো ছবি URL বা ফাইল</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newLogoImage}
                        onChange={e => setNewLogoImage(e.target.value)}
                        placeholder="https://... or /images/..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                      />
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setIsCompressingLogo(true);
                          try {
                            const dataUrl = await compressImageToDataUrl(f, 200, 200, 0.85);
                            setNewLogoImage(dataUrl);
                          } finally {
                            setIsCompressingLogo(false);
                            if (logoFileInputRef.current) logoFileInputRef.current.value = '';
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        disabled={isCompressingLogo}
                        className="px-2 py-1 bg-zinc-800 rounded-lg text-cyan-400 text-xs shrink-0 cursor-pointer"
                      >
                        {isCompressingLogo ? <Loader2 className="h-3 w-3 animate-spin" /> : 'ফাইল'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">পজিশন প্লেসমেন্ট</label>
                    <select
                      value={newLogoPreset}
                      onChange={e => setNewLogoPreset(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                    >
                      {POSITION_PRESETS.map((p, idx) => (
                        <option key={idx} value={idx}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-400">গ্লো কালার:</label>
                    <input
                      type="color"
                      value={newLogoColor}
                      onChange={e => setNewLogoColor(e.target.value)}
                      className="h-6 w-8 bg-transparent border-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLogo(false)}
                      className="px-3 py-1 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleAddFloatingLogo}
                      disabled={!newLogoName.trim()}
                      className="px-4 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Text & Link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">বাটন টেক্সট (CTA Text)</label>
              <input
                type="text"
                value={editingHeroSlide.ctaTextBangla || editingHeroSlide.ctaText || ''}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, ctaTextBangla: e.target.value, ctaText: e.target.value }) : null)}
                placeholder="যেমন: AI টুলস এক্সপ্লোর করুন"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">বাটন লিংক (CTA Link)</label>
              <input
                type="text"
                value={editingHeroSlide.ctaLink || '#catalog'}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, ctaLink: e.target.value }) : null)}
                placeholder="#catalog"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          {/* Optional Secondary Button (e.g. Dual CTA) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block text-xs">দ্বিতীয় বাটন টেক্সট (Secondary CTA)</label>
              <input
                type="text"
                value={editingHeroSlide.secondaryCtaTextBangla || ''}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, secondaryCtaTextBangla: e.target.value }) : null)}
                placeholder="যেমন: 🤖 Gemini Pro নিন →"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block text-xs">দ্বিতীয় বাটন লিংক (Secondary CTA Link)</label>
              <input
                type="text"
                value={editingHeroSlide.secondaryCtaLink || '#catalog'}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, secondaryCtaLink: e.target.value }) : null)}
                placeholder="#catalog"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setEditingHeroSlide(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{editingHeroSlide.isNew ? 'ব্যানার তৈরি করুন' : 'সেভ ও লাইভ প্রকাশ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
