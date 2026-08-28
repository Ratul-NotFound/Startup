'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Scroll3DRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  rotateXAmount?: number;
  rotateYAmount?: number;
  scaleAmount?: number;
  perspective?: number;
}

export const Scroll3DReveal: React.FC<Scroll3DRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  // Halved from original values — full visual effect, much lower composite cost
  rotateXAmount = 6,
  rotateYAmount = 0,
  scaleAmount = 0.97,
  perspective = 1400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Release GPU compositing layer once animation is done — prevents permanent
  // willChange overhead on all 5 full-width page sections during scroll
  const [animated, setAnimated] = useState(false);

  const initialY = direction === 'up' ? 32 : direction === 'down' ? -32 : 0;
  const initialX = direction === 'left' ? 32 : direction === 'right' ? -32 : 0;

  return (
    <div style={{ perspective }} className={`overflow-visible ${className}`} suppressHydrationWarning>
      <motion.div
        ref={containerRef}
        suppressHydrationWarning
        initial={{
          opacity: 0,
          y: initialY,
          x: initialX,
          scale: scaleAmount,
          rotateX: rotateXAmount,
          rotateY: rotateYAmount,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
        }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        onAnimationComplete={() => setAnimated(true)}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          // After animation finishes, release GPU layer to free compositing memory
          willChange: animated ? 'auto' : 'opacity, transform',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
