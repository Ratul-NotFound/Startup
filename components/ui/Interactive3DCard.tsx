'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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
  maxTilt = 14,
  index = 0,
  delay,
  showBorderBeam = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse physics with smooth springs
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 320,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 320,
    damping: 22,
  });

  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

    setGlarePosition({
      x: normX * 100,
      y: normY * 100,
      opacity: 0.28,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
    setGlarePosition(prev => ({ ...prev, opacity: 0 }));
  };

  const animationDelay = delay !== undefined ? delay : Math.min(index * 0.08, 0.45);

  return (
    <div style={{ perspective: 1400 }} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // 3D Creative Scroll Appearing Animation with Spring Physics & Deep 3D Arc
        initial={{
          opacity: 0,
          y: 65,
          z: -80,
          scale: 0.86,
          rotateX: 25,
          rotateY: index % 2 === 0 ? -10 : 10,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          z: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
        }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          duration: 0.8,
          delay: animationDelay,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          touchAction: 'pan-x pan-y',
        }}
        whileHover={{
          scale: 1.04,
          z: 35,
          transition: { duration: 0.25, ease: 'easeOut' },
        }}
        className={`relative will-change-transform h-full ${className}`}
      >
        {children}

        {/* Dynamic Holographic Specular Glare Layer that tracks mouse */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-30"
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(6, 182, 212, 0.28), rgba(255, 255, 255, ${glarePosition.opacity}) 25%, transparent 65%)`
              : 'none',
          }}
        />

        {/* Ambient Neon Spotlight Glow that tracks cursor */}
        <div
          className={`pointer-events-none absolute -inset-[2px] rounded-[inherit] transition-opacity duration-500 z-10 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `radial-gradient(380px circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(6,182,212,0.45), rgba(59,130,246,0.2) 40%, transparent 70%)`,
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
