'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useIsLowEndDevice } from '@/hooks/useIsLowEndDevice';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  index?: number;
  delay?: number;
  showBorderBeam?: boolean;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className = '',
  maxTilt = 12,
  index = 0,
  delay,
  showBorderBeam = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isLowEnd = useIsLowEndDevice();

  // Mouse physics with smooth springs
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 280,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 280,
    damping: 25,
  });

  // Zero-rerender cursor tracking using direct CSS variables on DOM node
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normX = Math.max(0, Math.min(1, mouseX / width));
    const normY = Math.max(0, Math.min(1, mouseY / height));

    x.set(normX);
    y.set(normY);

    cardRef.current.style.setProperty('--mouse-x', `${(normX * 100).toFixed(1)}%`);
    cardRef.current.style.setProperty('--mouse-y', `${(normY * 100).toFixed(1)}%`);
  }, [x, y]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  const animationDelay = delay !== undefined ? delay : Math.min(index * 0.06, 0.35);

  // On low-end devices skip 3D physics — just use a simple fade-in
  if (isLowEnd) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: animationDelay }}
        className={`relative h-full ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.95,
          rotateX: 10,
          rotateY: index % 2 === 0 ? -4 : 4,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
        }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{
          duration: 0.5,
          delay: animationDelay,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          willChange: isHovered ? 'transform' : 'auto',
        }}
        whileHover={{
          scale: 1.03,
          z: 25,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        className={`relative h-full ${className}`}
      >
        {children}

        {/* Dynamic Holographic Specular Glare Layer driven by CSS variable */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-30 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(6, 182, 212, 0.28), rgba(255, 255, 255, 0.25) 25%, transparent 65%)',
          }}
        />

        {/* Ambient Neon Spotlight Glow driven by CSS variable */}
        <div
          className={`pointer-events-none absolute -inset-[2px] rounded-[inherit] transition-opacity duration-400 z-10 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(6,182,212,0.4), rgba(59,130,246,0.18) 40%, transparent 70%)',
          }}
        />

        {/* Optional Animated Radiant Border Beam */}
        {showBorderBeam && (
          <div className="pointer-events-none absolute -inset-[1px] rounded-[inherit] overflow-hidden z-20">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 blur-[2px] animate-shimmer-text"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
