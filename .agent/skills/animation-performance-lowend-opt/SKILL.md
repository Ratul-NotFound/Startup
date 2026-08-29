---
name: animation-performance-lowend-opt
description: >-
  State-of-the-art optimization skills for running heavy web applications and 
  animations at 60-120 FPS on low-end hardware (4GB RAM, dual/quad-core CPUs, budget mobile GPUs).
---

# 🏎️ Animation Performance & Low-End Device Optimization

This skill covers the technical principles required to run rich web interfaces at constant 60–120 FPS without dropped frames on budget hardware.

---

## 1. 🛡️ The GPU Compositor Rule
* **Composited Properties (0% CPU, 100% GPU):** `transform` (`translate3d`, `scale`, `rotate`) and `opacity`.
* **Prohibited Animation Properties (Triggers Full Layout Reflows):** `width`, `height`, `top`, `left`, `margin`, `padding`, `border-radius`, and `filter: blur()`.

---

## 2. 📱 Detecting Hardware Concurrency & RAM
Automatically gate heavy visual effects on budget devices:
```typescript
export function isLowEndTier(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as any;

  const lowCores = (nav.hardwareConcurrency ?? 4) <= 4;
  const lowMemory = (nav.deviceMemory ?? 4) <= 4; // <= 4GB RAM
  const touchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSaveData = nav.connection?.saveData === true;

  return lowCores || lowMemory || touchOnly || reducedMotion || isSaveData;
}
```

---

## 3. 🚫 Backdrop-Filter Blur Bypass on Budget GPUs
`backdrop-filter: blur(...)` is the #1 cause of scrolling stutter on mobile GPUs (Mali / Adreno).
* **Fix**: Replace live blur with solid dark translucency on mobile/low-tier:
```css
.low-end-device .backdrop-blur-xl,
@media (max-width: 768px) {
  .backdrop-blur-xl {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background-color: rgba(18, 18, 23, 0.96) !important;
  }
}
```

---

## 4. 📦 CSS Containment (`content-visibility: auto`)
Tell the browser to skip layout and painting for offscreen cards:
```css
.contain-card {
  content-visibility: auto;
  contain-intrinsic-size: auto 340px;
  contain: layout style paint;
}
```

---

## 5. ⏱️ Killing Background Carousel Timers
Never run unconstrained `setInterval` loops across 20+ cards in the background. On low-end devices, suspend background timers and show static preview images.

---

## 6. 🚀 Passive Event Listeners
Always pass `{ passive: true }` to touch and scroll event listeners so scrolling is never blocked by JavaScript execution.
