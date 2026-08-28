'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useIsLowEndDevice } from '@/hooks/useIsLowEndDevice';

interface ProductCardImageCarouselProps {
  images: string[];
  productName: string;
  index?: number;
}

export const ProductCardImageCarousel: React.FC<ProductCardImageCarouselProps> = ({
  images,
  productName,
  index = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '50px 0px 50px 0px', once: false });
  const isLowEnd = useIsLowEndDevice();

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize image list
  const imageList = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'];

  // Gentle auto-cycle only when hovered or spread out
  useEffect(() => {
    if (imageList.length <= 1 || !isInView) return;

    // Cycle on hover, or slowly when in view (spread timers so they don't fire at once)
    const intervalTime = isHovered ? 2200 : (6000 + (index % 5) * 800);

    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % imageList.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [imageList.length, index, isHovered, isInView]);

  const safeIndex = currentImageIdx % imageList.length;
  const currentImg = imageList[safeIndex] || imageList[0];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => !isLowEnd && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-36 sm:h-44 w-full overflow-hidden bg-zinc-950 select-none group/img"
      style={{ transform: 'translateZ(0)' }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${productName}-${safeIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            src={currentImg}
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
              className={`h-1 rounded-full transition-all duration-200 ${
                dotIdx === currentImageIdx ? 'w-4 bg-cyan-400' : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
