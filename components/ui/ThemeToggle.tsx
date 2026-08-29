'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 cursor-pointer select-none active:scale-95 min-h-[38px] min-w-[38px] justify-center ${
        isDark
          ? 'bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 border border-white/10 hover:border-cyan-500/40 shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200 text-amber-500 border border-slate-200 hover:border-amber-400/50 shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      <div className="relative h-4 w-4 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="flex items-center justify-center"
            >
              <Moon className="h-4 w-4 fill-cyan-400/20" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="flex items-center justify-center"
            >
              <Sun className="h-4 w-4 fill-amber-400/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};
