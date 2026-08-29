---
name: responsive-mobile-first-design
description: >-
  Expert skills for crafting fluid, mobile-first responsive layouts, touch ergonomics, 
  dynamic viewport units (dvh/dvw), container queries, and safe-area insets.
---

# 📱 Responsive Mobile-First Design & Touch Ergonomics

This skill covers modern responsive techniques ensuring applications look and feel native on everything from small budget smartphones to ultra-wide desktop monitors.

---

## 1. 📐 Dynamic Viewport Units (`dvh` / `dvw`)
Mobile browser address bars resize dynamically as the user scrolls. Never use `100vh` for full-screen hero or modals on mobile:
* **Bad**: `min-h-screen` or `h-screen` (causes vertical overflow and jumps when URL bar hides/shows).
* **Good**: `min-h-[100dvh]` or `h-[100dvh]` (dynamically adapts to active viewport).

---

## 2. 👆 Touch Ergonomics & Safe Tap Targets
* **Minimum Tap Target**: Interactive elements (buttons, icons, chips) must be at least **44×44px** on touch screens.
  ```tsx
  <button className="p-2 sm:p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center">
    <Icon className="h-5 w-5" />
  </button>
  ```
* **Safe Area Insets**: For notched phones (iPhone, modern Android), respect safe bottom areas:
  ```css
  padding-bottom: env(safe-area-inset-bottom, 16px);
  ```

---

## 3. 🔄 Horizontal Scroll Snapping (Rails)
Instead of forcing 20 cards into a long vertical scroll on mobile, use horizontal snap rails:
```tsx
<div 
  className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3 px-1"
  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
>
  {items.map((item) => (
    <div key={item.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
      {/* Card Content */}
    </div>
  ))}
</div>
```

---

## 4. 🔤 Fluid Typography with `clamp()`
Scale typography smoothly without requiring 10 breakpoint classes:
```css
/* Scales smoothly between 24px on mobile (320px screen) to 48px on desktop (1280px screen) */
h1 {
  font-size: clamp(1.5rem, 4vw + 1rem, 3.5rem);
}
```

---

## 5. 🎛️ Responsive Breakpoint Strategy
* `xs`: `< 480px` (Compact budget phones)
* `sm`: `640px` (Large phones / phablets)
* `md`: `768px` (Tablets / Foldables)
* `lg`: `1024px` (Laptops / Desktop)
* `xl`: `1280px` (Standard Desktops)
* `2xl`: `1536px` (Ultra-wide displays)

Always build **Mobile First**: style default classes for mobile, then add `sm:`, `md:`, `lg:` enhancements!
