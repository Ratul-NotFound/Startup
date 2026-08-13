'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, ShieldCheck, Users, Activity } from 'lucide-react';

interface MetricItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
  accent: string;
}

const AnimatedCounter: React.FC<{ value: number; duration?: number; isVisible: boolean }> = ({
  value,
  duration = 2000,
  isVisible,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = value;
    const totalFrames = 60;
    const increment = end / totalFrames;
    const frameDuration = duration / totalFrames;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [value, duration, isVisible]);

  return <span>{count.toLocaleString()}</span>;
};

export const LiveMetricsTicker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-60px' });

  const metrics: MetricItem[] = [
    {
      icon: <Users className="h-5 w-5 text-cyan-400" />,
      value: 28450,
      suffix: '+',
      label: 'Active Subscriptions',
      sublabel: 'Delivered worldwide',
      accent: 'border-cyan-500/20 shadow-cyan-500/10',
    },
    {
      icon: <Zap className="h-5 w-5 text-emerald-400" />,
      value: 25,
      suffix: 's',
      prefix: '< ',
      label: 'Average Delivery',
      sublabel: 'Instant automated provisioning',
      accent: 'border-emerald-500/20 shadow-emerald-500/10',
    },
    {
      icon: <Activity className="h-5 w-5 text-indigo-400" />,
      value: 99.98,
      suffix: '%',
      label: 'Service Uptime',
      sublabel: '24/7 node monitoring',
      accent: 'border-indigo-500/20 shadow-indigo-500/10',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-blue-400" />,
      value: 100,
      suffix: '%',
      label: 'Warranty Coverage',
      sublabel: 'Full-term guarantee',
      accent: 'border-blue-500/20 shadow-blue-500/10',
    },
  ];

  return (
    <div ref={containerRef} className="py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
            className={`p-4 sm:p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/80 border ${metric.accent} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-white/5">
                {metric.icon}
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Live Stat</span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {metric.prefix}
              {metric.value === 99.98 ? (
                <span>99.98</span>
              ) : (
                <AnimatedCounter value={metric.value} isVisible={isInView} />
              )}
              <span className="text-cyan-400">{metric.suffix}</span>
            </div>

            <div className="mt-1">
              <p className="text-xs sm:text-sm font-bold text-zinc-200">{metric.label}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{metric.sublabel}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
