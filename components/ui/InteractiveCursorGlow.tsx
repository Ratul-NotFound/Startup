'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsLowEndDevice } from '@/hooks/useIsLowEndDevice';

export const InteractiveCursorGlow: React.FC = () => {
  const isLowEnd = useIsLowEndDevice();
  const [mounted, setMounted] = useState(false);

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Snappy smooth spring physics
  const springX = useSpring(mouseX, { stiffness: 350, damping: 32 });
  const springY = useSpring(mouseY, { stiffness: 350, damping: 32 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Don't render on touch / mobile / low-end devices
  if (!mounted || isLowEnd) return null;

  return (
    <motion.div
      suppressHydrationWarning
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        transform: 'translateZ(0)',
        pointerEvents: 'none',
      }}
      className="fixed top-0 left-0 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.09)_0%,rgba(59,130,246,0.03)_45%,transparent_70%)] z-10 hidden md:block"
    />
  );
};
