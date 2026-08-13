'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ScrollParallaxBackdrop: React.FC = () => {
  const { scrollYProgress } = useScroll();

  const yOrb1 = useTransform(scrollYProgress, [0, 1], [-50, 400]);
  const yOrb2 = useTransform(scrollYProgress, [0, 1], [0, -350]);
  const yOrb3 = useTransform(scrollYProgress, [0, 1], [-100, 250]);
  const rotateOrbs = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 3D Glowing Orb 1 - Deep Cyan */}
      <motion.div
        style={{ y: yOrb1, rotate: rotateOrbs }}
        className="absolute top-[15%] left-[5%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full bg-gradient-to-tr from-cyan-600/10 via-blue-600/5 to-transparent blur-[120px] opacity-70"
      />

      {/* 3D Glowing Orb 2 - Deep Violet / Indigo */}
      <motion.div
        style={{ y: yOrb2 }}
        className="absolute top-[50%] right-[5%] w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] rounded-full bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent blur-[130px] opacity-60"
      />

      {/* 3D Glowing Orb 3 - Emerald Accent */}
      <motion.div
        style={{ y: yOrb3 }}
        className="absolute top-[80%] left-[20%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-gradient-to-tr from-emerald-600/10 via-teal-600/5 to-transparent blur-[120px] opacity-50"
      />
    </div>
  );
};
