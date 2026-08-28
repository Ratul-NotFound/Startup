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
  maxTilt = 8,
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
    stiffness: 350,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 350,
    damping: 30,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isLowEnd) return;
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
  }, [isLowEnd, x, y]);

  const handleMouseEnter = () => {
    if (!isLowEnd) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  const animationDelay = delay !== undefined ? delay : Math.min(index * 0.03, 0.15);

  // Low-end / mobile rendering: zero 3D overhead
  if (isLowEnd) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.28, delay: animationDelay, ease: 'easeOut' }}
        className={`relative h-full ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{
          opacity: 0,
          y: 20,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{
          duration: 0.35,
          delay: animationDelay,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        whileHover={{
          y: -4,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        className={`relative h-full transition-shadow duration-200 ${className}`}
      >
        {children}

        {/* Dynamic Specular Glare Layer - CSS variable driven */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200 z-30 opacity-100"
            style={{
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(6, 182, 212, 0.2), transparent 60%)',
            }}
          />
        )}

        {/* Optional Animated Radiant Border Beam */}
        {showBorderBeam && (
          <div className="pointer-events-none absolute -inset-[1px] rounded-[inherit] overflow-hidden z-20">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 blur-[1px] animate-shimmer-text"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
