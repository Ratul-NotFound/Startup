'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize image list (at least fallback to standard if empty)
  const imageList = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'];

  // Fast & organic transitions across cards
  useEffect(() => {
    if (imageList.length <= 1) return;

    const baseInterval = 3200;
    const offset = (index % 4) * 450;
    const intervalTime = baseInterval + offset;

    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % imageList.length);
    }, isHovered ? 1800 : intervalTime);

    return () => clearInterval(timer);
  }, [imageList.length, index, isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-36 sm:h-44 w-full overflow-hidden bg-zinc-950 select-none group/img"
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={`${productName}-${currentImageIdx}-${imageList[currentImageIdx]}`}
          src={imageList[currentImageIdx]}
          alt={productName}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
          }}
        />
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
