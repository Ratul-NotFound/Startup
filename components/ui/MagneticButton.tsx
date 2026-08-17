'use client';

import React, { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticProps> = ({
  children,
  className = '',
  strength = 0.25,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Only run spring physics — no re-renders, pure motion values
  const springX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.5 });

  // Throttled mouse move — only update 1/2 frames with requestAnimationFrame
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Skip on touch devices
    if ((e.nativeEvent as any)?.pointerType === 'touch') return;

    if (rafRef.current !== null) return; // throttle to one raf per frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      x.set((e.clientX - (left + width / 2)) * strength);
      y.set((e.clientY - (top + height / 2)) * strength);
    });
  }, [x, y, strength]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove as any}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};
