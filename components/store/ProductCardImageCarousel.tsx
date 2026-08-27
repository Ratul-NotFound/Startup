'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

interface ProductCardImageCarouselProps {
  images: string[];
  productName: string;
  index?: number;
}

// 4 Distinct Creative Transition Animation Modes (GPU-optimized without costly live blur filters)
const TRANSITION_STYLES = [
  // 1. 3D Cube Perspective Flip
  {
    initial: { opacity: 0, rotateY: 45, scale: 0.92 },
    animate: { opacity: 1, rotateY: 0, scale: 1 },
    exit: { opacity: 0, rotateY: -45, scale: 0.92 },
  },
  // 2. High-Speed Zoom & Snap
  {
    initial: { opacity: 0, scale: 1.15 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  // 3. Cyber Diagonal Swoop
  {
    initial: { opacity: 0, x: '30%', y: '-10%', scale: 0.95 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: '-30%', y: '10%', scale: 0.95 },
  },
  // 4. Vortex Subtle Radial
  {
    initial: { opacity: 0, rotate: -8, scale: 0.92 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 8, scale: 1.08 },
  },
];

export const ProductCardImageCarousel: React.FC<ProductCardImageCarouselProps> = ({
  images,
  productName,
  index = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '100px 0px 100px 0px', once: false });

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize image list
  const imageList = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'];

  // Only run interval when the card is in the visible viewport
  useEffect(() => {
    if (imageList.length <= 1 || !isInView) return;

    const baseInterval = 5000;
    const offset = (index % 4) * 500;
    const intervalTime = baseInterval + offset;

    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % imageList.length);
    }, isHovered ? 2000 : intervalTime);

    return () => clearInterval(timer);
  }, [imageList.length, index, isHovered, isInView]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-36 sm:h-44 w-full overflow-hidden bg-zinc-950 select-none group/img"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${productName}-${currentImageIdx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            src={imageList[currentImageIdx]}
            alt={productName}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Gradient Vignette Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/35 to-black/60 pointer-events-none z-10" />

      {/* Minimal Carousel Progress Indicators */}
      {imageList.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 pointer-events-none">
          {imageList.map((_, dotIdx) => (
            <div
              key={dotIdx}
              className={`h-1 rounded-full transition-all duration-300 ${
                dotIdx === currentImageIdx ? 'w-4 bg-cyan-400' : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
