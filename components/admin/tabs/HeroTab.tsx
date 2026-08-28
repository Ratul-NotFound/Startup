'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, Edit2, Trash2, ArrowUpRight, Upload, Image as ImageIcon, Check, Loader2, Globe, Layers } from 'lucide-react';
import { HeroSlide, BrandSettings } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';

interface HeroTabProps {
  heroSlides: HeroSlide[];
  adminResetHeroSlides: () => Promise<void>;
  setEditingHeroSlide: (slide: (HeroSlide & { isNew?: boolean }) | null) => void;
  heroDeleteConfirm: string | null;
  setHeroDeleteConfirm: (id: string | null) => void;
  handleDeleteHeroSlide: (id: string) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
  brandSettings: BrandSettings;
  updateBrandSettings: (settings: Partial<BrandSettings>) => Promise<void>;
}

export function HeroTab({
  heroSlides,
  adminResetHeroSlides,
  setEditingHeroSlide,
  heroDeleteConfirm,
  setHeroDeleteConfirm,
  handleDeleteHeroSlide,
  showFeedback,
  brandSettings,
  updateBrandSettings,
}: HeroTabProps) {
  // Brand form state
  const [formFavicon, setFormFavicon] = useState(brandSettings?.faviconUrl || '/images/Fabicon.png');
  const [formNavbarLogo, setFormNavbarLogo] = useState(brandSettings?.navbarLogoUrl || '/images/Fabicon.png');
  const [formBrandName, setFormBrandName] = useState(brandSettings?.brandName || 'Keyoon');
  const [formTagline, setFormTagline] = useState(brandSettings?.brandTagline || 'Premium Digital Subscriptions');

  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingNavbarLogo, setIsUploadingNavbarLogo] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  const faviconInputRef = useRef<HTMLInputElement>(null);
  const navbarLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (brandSettings) {
      setFormFavicon(brandSettings.faviconUrl || '/images/Fabicon.png');
      setFormNavbarLogo(brandSettings.navbarLogoUrl || '/images/Fabicon.png');
      if (brandSettings.brandName) setFormBrandName(brandSettings.brandName);
      if (brandSettings.brandTagline) setFormTagline(brandSettings.brandTagline);
    }
  }, [brandSettings]);

  // Handle Favicon file upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 250, 250, 0.9, true);
      setFormFavicon(compressedDataUrl);
      showFeedback('success', 'Favicon icon uploaded with transparent PNG support.');
    } catch {
      showFeedback('error', 'Failed to compress favicon image file.');
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  // Handle Navbar Logo file upload
  const handleNavbarLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingNavbarLogo(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 800, 400, 0.9, true);
      setFormNavbarLogo(compressedDataUrl);
      showFeedback('success', 'Navbar logo image uploaded with transparent PNG support.');
    } catch {
      showFeedback('error', 'Failed to compress navbar logo file.');
    } finally {
      setIsUploadingNavbarLogo(false);
    }
  };

  const handleSaveBrandAssets = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBrand(true);
    try {
      await updateBrandSettings({
        faviconUrl: formFavicon.trim(),
        navbarLogoUrl: formNavbarLogo.trim(),
        brandName: formBrandName.trim() || 'Keyoon',
        brandTagline: formTagline.trim() || 'Premium Digital Subscriptions',
      });
      showFeedback('success', '✓ Brand logos and Favicon icon updated live across platform!');
    } catch {
      showFeedback('error', 'Failed to save brand settings.');
    } finally {
      setIsSavingBrand(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. BRAND ASSETS, FAVICON & NAVBAR LOGO MANAGER              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              <span>Brand Logos, Favicon &amp; Navbar Customizer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload custom Favicon icon (used on site tab and badges) and Navbar Logo image (used on header and footer).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setFormFavicon('/images/Fabicon.png');
                setFormNavbarLogo('/images/Fabicon.png');
                showFeedback('success', 'Reset logo inputs to transparent local PNG file (/images/Fabicon.png)');
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Use Project Local PNGs
            </button>

            <button
              type="submit"
              form="brand-assets-form"
              disabled={isSavingBrand}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              {isSavingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Save &amp; Publish Brand</span>
            </button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input ref={faviconInputRef} type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
        <input ref={navbarLogoInputRef} type="file" accept="image/*" onChange={handleNavbarLogoUpload} className="hidden" />

        <form id="brand-assets-form" onSubmit={handleSaveBrandAssets} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favicon / Badge Icon Customizer */}
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Favicon &amp; Badge Icon
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Used across all logo badges &amp; favicons</span>
              </div>

              {/* Favicon Live Preview */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900 border border-white/10">
                <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {formFavicon ? (
                    <img src={formFavicon} alt="Favicon Preview" className="h-9 w-9 object-contain" onError={() => setFormFavicon('')} />
                  ) : (
                    <Layers className="h-6 w-6 text-cyan-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Favicon Icon Preview</p>
                  <p className="text-[11px] text-slate-400">Renders inside browser tabs and header icon badges.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">Upload Icon File or Enter Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formFavicon}
                    onChange={e => setFormFavicon(e.target.value)}
                    placeholder="https://... or upload icon file"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-white/10 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {isUploadingFavicon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    <span>Upload Icon</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Navbar Logo Customizer */}
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Main Navbar Header Logo
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Used in top navigation header</span>
              </div>

              {/* Navbar Logo Live Preview */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900 border border-white/10">
                <div className="h-12 px-4 rounded-xl bg-zinc-950 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {formNavbarLogo ? (
                    <img src={formNavbarLogo} alt="Navbar Logo Preview" className="h-7 object-contain" onError={() => setFormNavbarLogo('')} />
                  ) : (
                    <span className="text-base font-bold tracking-tight text-white">{formBrandName}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Navbar Brand Header Preview</p>
                  <p className="text-[11px] text-slate-400">Renders on top navbar header on all pages.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">Upload Logo File or Enter Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formNavbarLogo}
                    onChange={e => setFormNavbarLogo(e.target.value)}
                    placeholder="https://... or upload logo image"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => navbarLogoInputRef.current?.click()}
                    disabled={isUploadingNavbarLogo}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-white/10 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {isUploadingNavbarLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    <span>Upload Logo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Name & Tagline Text Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Brand Name / Title</label>
              <input
                type="text"
                value={formBrandName}
                onChange={e => setFormBrandName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="Keyoon"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Brand Sub-heading / Tagline</label>
              <input
                type="text"
                value={formTagline}
                onChange={e => setFormTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="Premium Digital Subscriptions"
              />
            </div>
          </div>
        </form>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. STOREFRONT HERO & CINEMATIC BANNERS                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>Storefront Hero &amp; Cinematic Banners</span>
            </h2>
            <p className="text-xs text-slate-400">
              Customize the rotating hero slides, live status tags, cursive slogans, and background imagery on the homepage in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (confirm('Reset all hero slides to the default cinematic presets?')) {
                  await adminResetHeroSlides();
                  showFeedback('success', 'Hero slides reset to default presets.');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>

            <button
              onClick={() => {
                setEditingHeroSlide({
                  id: '',
                  isNew: true,
                  tag: 'NEW EXCLUSIVE DEAL',
                  title: 'Ultimate Premium Suite at 80% Off',
                  sub: 'Instant 30-Second Vault Delivery',
                  bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
                  ctaText: 'Explore Subscriptions',
                  ctaLink: '#catalog',
                  order: heroSlides.length + 1,
                });
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Hero Slide</span>
            </button>
          </div>
        </div>

        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="relative rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden shadow-xl flex flex-col justify-between group hover:border-cyan-500/40 transition-all"
            >
              {/* Background Image Preview */}
              <div className="relative h-44 w-full overflow-hidden bg-black">
                <img
                  src={slide.bgImage}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Order & Tag Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-cyan-300">
                    Slide #{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
                    {slide.tag}
                  </span>
                </div>

                {/* Actions overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingHeroSlide({ ...slide, isNew: false })}
                    className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-sm cursor-pointer"
                    title="Edit slide"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
                  </button>

                  {heroDeleteConfirm === slide.id ? (
                    <button
                      onClick={() => handleDeleteHeroSlide(slide.id)}
                      className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => setHeroDeleteConfirm(slide.id)}
                      className="p-2 rounded-xl bg-zinc-900/90 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-white/10 transition-colors shadow-sm cursor-pointer"
                      title="Delete slide"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content Details */}
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-base text-cyan-400 font-bold" style={{ fontFamily: "'Caveat', cursive" }}>
                    {slide.sub}
                  </p>
                  <h3 className="text-base font-black text-white leading-snug mt-0.5">
                    {slide.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                  <span className="font-mono">CTA: {slide.ctaText || 'Explore Subscriptions'} ({slide.ctaLink || '#catalog'})</span>
                  <button
                    onClick={() => setEditingHeroSlide({ ...slide, isNew: false })}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Edit Content</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
