'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardImageCarouselProps {
  images: string[];
  productName: string;
  index?: number;
}

// 4 Distinct Creative Transition Animation Modes
const TRANSITION_STYLES = [
  // 1. 3D Cube Perspective Flip
  {
    initial: { opacity: 0, rotateY: 55, scale: 0.88, filter: 'blur(6px)' },
    animate: { opacity: 1, rotateY: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, rotateY: -55, scale: 0.88, filter: 'blur(6px)' },
  },
  // 2. High-Speed Zoom & Focal Blur Warp
  {
    initial: { opacity: 0, scale: 1.25, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.85, filter: 'blur(8px)' },
  },
  // 3. Cyber Diagonal Swoop
  {
    initial: { opacity: 0, x: '40%', y: '-15%', scale: 0.94 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: '-40%', y: '15%', scale: 0.94 },
  },
  // 4. Vortex Radial Spin
  {
    initial: { opacity: 0, rotate: -10, scale: 0.88, filter: 'blur(6px)' },
    animate: { opacity: 1, rotate: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, rotate: 10, scale: 1.15, filter: 'blur(6px)' },
  },
];

export const ProductCardImageCarousel: React.FC<ProductCardImageCarouselProps> = ({
  images,
  productName,
  index = 0,
}) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize image list
  const imageList = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'];

  // Stagger intervals for organic multi-card storefront rhythm
  useEffect(() => {
    if (imageList.length <= 1) return;

    const baseInterval = 3200;
    const offset = (index % 4) * 400;
    const intervalTime = baseInterval + offset;

    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % imageList.length);
    }, isHovered ? 1700 : intervalTime);

    return () => clearInterval(timer);
  }, [imageList.length, index, isHovered]);

  // Select dynamic transition effect based on current slide index
  const currentEffect = TRANSITION_STYLES[currentImageIdx % TRANSITION_STYLES.length];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: 1000 }}
      className="relative h-36 sm:h-44 w-full overflow-hidden bg-zinc-950 select-none group/img"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={`${productName}-${currentImageIdx}`}
          initial={currentEffect.initial}
          animate={currentEffect.animate}
          exit={currentEffect.exit}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            src={imageList[currentImageIdx]}
            alt={productName}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Gradient Vignette Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/35 to-black/60 pointer-events-none z-10" />

      {/* Minimal Carousel Progress Indicators with Spring Morph */}
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
