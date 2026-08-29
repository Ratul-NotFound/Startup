---
name: frontend-animations-framer
description: >-
  Comprehensive guide to modern Framer Motion animation orchestration, spring physics, 
  layout transitions, gesture-driven interactions, and smooth exit animations.
---

# 🎬 Frontend Animations & Framer Motion Mastery

This skill provides patterns for building organic, fluid, and delightful user interface animations using Framer Motion and CSS transitions.

---

## 1. 🌊 Physics-Based Spring Transitions
Avoid unnatural linear animations. Use natural spring physics for UI movements:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 30, // Prevents excessive bouncing
    mass: 0.8,
  }}
/>
```

---

## 2. 🎚️ LayoutId for Shared Element Transitions
Smoothly slide active pills across tab lists without custom coordinate calculations:
```tsx
{tabs.map((tab) => (
  <button key={tab.id} onClick={() => setActive(tab.id)} className="relative px-4 py-2">
    {active === tab.id && (
      <motion.div
        layoutId="activeTabPill"
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="absolute inset-0 bg-cyan-500 rounded-xl -z-10 shadow-md"
      />
    )}
    <span>{tab.label}</span>
  </button>
))}
```

---

## 3. 🎯 Magnetic Cursor Button Attraction
Enhance desktop interactions with magnetic hover physics:
```tsx
export const MagneticButton: React.FC<{ children: React.ReactNode; strength?: number }> = ({
  children,
  strength = 0.25,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * strength;
    const y = (clientY - (top + height / 2)) * strength;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.5 }}
    >
      {children}
    </motion.div>
  );
};
```

---

## 4. 📦 AnimatePresence & PopLayout
Ensure removed items exit smoothly without layout jumps:
```tsx
<AnimatePresence mode="popLayout">
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {item.title}
    </motion.div>
  ))}
</AnimatePresence>
```
