'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if the current device is low-end based on:
 * - CPU core count (< 4 cores)
 * - Device memory (< 4 GB)
 * - Reduced motion preference
 * - Touch-only input (mobile/tablet)
 *
 * Returns true for low-end devices — components should reduce animation
 * complexity, disable 3D tilt, skip backdrop-blur etc.
 */
export function useIsLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const nav = navigator as any;

    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchOnly =
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    const cpuCores = nav.hardwareConcurrency ?? 4;
    const deviceMemory = nav.deviceMemory ?? 4; // GB, Chrome only

    const lowEnd =
      prefersReducedMotion ||
      cpuCores <= 2 ||
      deviceMemory < 2 ||
      (isTouchOnly && cpuCores < 6); // mobile with few cores

    setIsLowEnd(lowEnd);
  }, []);

  return isLowEnd;
}
