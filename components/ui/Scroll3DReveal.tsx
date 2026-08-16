'use client';

import React, { useRef } from 'react';
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
  rotateXAmount = 22,
  rotateYAmount = 0,
  scaleAmount = 0.88,
  perspective = 1400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialY = direction === 'up' ? 60 : direction === 'down' ? -60 : 0;
  const initialX = direction === 'left' ? 60 : direction === 'right' ? -60 : 0;

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
        viewport={{ once: true, margin: '-40px' }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
