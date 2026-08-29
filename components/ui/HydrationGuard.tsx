'use client';

import { useEffect } from 'react';

// Cleanly intercept and filter harmless third-party browser extension hydration injections
// (e.g. bis_skin_checked, grammarly, adblockers). Runs only on the client after mount.
export const HydrationGuard: React.FC = () => {
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = function (...args: any[]) {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('bis_skin_checked') ||
          args[0].includes('Extra attributes from the server') ||
          args[0].includes('data-gr-ext') ||
          args[0].includes('cz-shortcut-listen'))
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return null;
};
