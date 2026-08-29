---
name: frontend-design-mastery
description: >-
  Expert guidelines for high-end frontend web design, modern design systems, 
  aesthetic dark modes, glassmorphism, typography pairing, micro-interactions, 
  and visual hierarchy. Use whenever designing or polishing web interfaces.
---

# 🎨 Frontend Design Mastery & Visual Excellence

This skill provides state-of-the-art standards and patterns for crafting visually stunning, premium web interfaces that create a memorable first impression.

---

## 1. 🌈 Curated Color Palettes & Contrast
Avoid generic primary colors (e.g. standard `#ff0000` or `#0000ff`). Use curated, harmonious palettes:
* **Backgrounds**: Deep Obsidian `#09090b` (Zinc 950), Dark Slate `#0a0e17`, or rich tinted neutrals rather than flat pure `#000000`.
* **Primary Accents**: High-vibrancy HSL accents like Electric Cyan (`#06b6d4`), Neon Violet (`#8b5cf6`), Emerald Spark (`#10b981`), or Amber Gold (`#f59e0b`).
* **Text Hierarchy**:
  * Primary: `#ffffff` or `text-zinc-100` (High contrast, 100% opacity)
  * Secondary: `text-zinc-400` (Supporting metadata, 70% opacity)
  * Muted: `text-zinc-500` / `text-zinc-600` (Timestamps, labels, disabled states)
* **Borders**: Translucent white `border-white/[0.08]` or `border-white/10` with subtle hover elevations (`hover:border-cyan-500/40`).

---

## 2. 🔠 Modern Typography & Hierarchy
Never rely on default system fonts. Pair distinctive headings with ultra-legible body fonts:
* **Display / Headings**: Modern geometric fonts like `Outfit`, `Plus Jakarta Sans`, or `Clash Display`.
* **Body / Data**: Clean sans-serifs like `Inter`, `Geist`, or `Plus Jakarta Sans`.
* **Accent / Badges**: Cursive/handcrafted accents like `Caveat` or monospace tags (`font-mono`).
* **Scale**:
  * Hero Title: `text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight`
  * Section Title: `text-2xl sm:text-3xl font-black tracking-tight`
  * Body Text: `text-xs sm:text-sm leading-relaxed text-zinc-300`
  * Badge/Metadata: `text-[10px] sm:text-[11px] font-bold uppercase tracking-wider`

---

## 3. 💎 Glassmorphism & Depth Layers
Create depth with multi-stop gradients and glassmorphism:
* **Glass Card Shell**:
  ```tsx
  <div className="rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-5">
    {/* Content */}
  </div>
  ```
* **Glow Accents**: Radial glow gradients behind cards:
  ```tsx
  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-60 transition duration-300 -z-10" />
  ```

---

## 4. ✨ Micro-Interactions & Hover Polish
Interfaces should feel responsive, interactive, and alive:
* **Magnetic Buttons**: Add subtle cursor attraction on key CTAs.
* **Interactive Scales**: `hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200`.
* **Live Status Rings**: Ping radar indicator next to active elements:
  ```tsx
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
  </span>
  ```

---

## 5. 🛡️ Design Anti-Patterns to Avoid
1. ❌ **Plain White Backgrounds** on dark themes (causes harsh visual jarring).
2. ❌ **Unconstrained Shadows** with massive radius and low opacity on mobile.
3. ❌ **Generic Alert Boxes** — use custom styled toasts and modal overlays.
4. ❌ **Unformatted Timestamps** — convert ISO strings to relative times (`2h ago`, `Yesterday`).
