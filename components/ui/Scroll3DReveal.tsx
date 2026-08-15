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
    <div style={{ perspective }} className={`overflow-visible ${className}`}>
      <motion.div
        ref={containerRef}
        initial={{
          opacity: 0,
          y: initialY,
          x: initialX,
          z: -80,
          scale: scaleAmount,
          rotateX: rotateXAmount,
          rotateY: rotateYAmount,
          filter: 'blur(8px)',
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          x: 0,
          z: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          filter: 'blur(0px)',
        }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          duration: 0.85,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};
