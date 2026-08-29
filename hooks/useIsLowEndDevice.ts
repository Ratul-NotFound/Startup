'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if the current device is low-end / budget tier:
 * - CPU core count (<= 4 cores)
 * - Device memory (<= 4 GB RAM)
 * - Reduced motion or data saver preference
 * - Touch-only mobile devices with limited GPU resources
 *
 * Automatically injects 'low-end-device' class onto <html> so CSS can
 * optimize backdrop-blur, box-shadows, and layout containment automatically.
 */
export function useIsLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = navigator as any;

    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchOnly =
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    const isMobileWidth = window.innerWidth <= 768;

    const cpuCores = nav.hardwareConcurrency ?? 4;
    const deviceMemory = nav.deviceMemory ?? 4; // GB in Chromium browsers
    const isSaveData = nav.connection?.saveData === true;

    // Treat <= 4 CPU cores, <= 4GB RAM, or mobile screen as low-spec mode
    const lowEnd =
      prefersReducedMotion ||
      isSaveData ||
      cpuCores <= 4 ||
      deviceMemory <= 4 ||
      (isTouchOnly && cpuCores <= 6) ||
      isMobileWidth;

    setIsLowEnd(lowEnd);

    if (lowEnd) {
      document.documentElement.classList.add('low-end-device');
    } else {
      document.documentElement.classList.remove('low-end-device');
    }
  }, []);

  return isLowEnd;
}
