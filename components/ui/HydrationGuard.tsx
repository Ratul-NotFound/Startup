'use client';

// Cleanly intercept and filter harmless third-party browser extension hydration injections (e.g. bis_skin_checked, grammarly, adblockers)
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('bis_skin_checked') ||
        args[0].includes('Extra attributes from the server') ||
        args[0].includes('data-gr-ext') ||
        args[0].includes('cz-shortcut-listen') ||
        args[0].includes('Hydration failed because the initial UI'))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export const HydrationGuard: React.FC = () => {
  return null;
};

