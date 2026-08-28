'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useIsLowEndDevice } from '@/hooks/useIsLowEndDevice';

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
}) => {
  const isLowEnd = useIsLowEndDevice();

  const initialY = direction === 'up' ? 20 : direction === 'down' ? -20 : 0;
  const initialX = direction === 'left' ? 20 : direction === 'right' ? -20 : 0;

  // Ultra-fast entrance for low-end devices or touch screens
  if (isLowEnd) {
    return (
      <div className={`overflow-visible ${className}`} suppressHydrationWarning>
        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`overflow-visible ${className}`} suppressHydrationWarning>
      <motion.div
        suppressHydrationWarning
        initial={{
          opacity: 0,
          y: initialY,
          x: initialX,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          x: 0,
        }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{
          duration: 0.38,
          delay: Math.min(delay, 0.15),
          ease: [0.22, 1, 0.36, 1], // Smooth snappy cubic-bezier (60fps guaranteed)
        }}
        style={{
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
