'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const FloatingParticles: React.FC = () => {
  const orbs = [
    { size: 380, top: '8%', left: '5%', color: 'from-blue-600/15 via-cyan-500/10 to-transparent', duration: 18 },
    { size: 450, top: '35%', right: '5%', color: 'from-purple-600/15 via-indigo-500/10 to-transparent', duration: 22 },
    { size: 320, top: '65%', left: '10%', color: 'from-cyan-600/15 via-blue-500/10 to-transparent', duration: 16 },
    { size: 400, top: '85%', right: '8%', color: 'from-indigo-600/15 via-purple-500/10 to-transparent', duration: 20 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -35, 0],
            x: [0, 25, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            right: orb.right,
          }}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} blur-[90px] opacity-70`}
        />
      ))}
    </div>
  );
};
