// This component renders a raw <script> tag for zero-flicker theme initialization.
// It must be a SERVER component (no 'use client') so Next.js renders it in <head>
// without causing hydration mismatches.
// suppressHydrationWarning on the script element tells React to skip reconciliation of its content.

export const ThemeScript = () => {
  const themeScript = `(function(){try{var t=localStorage.getItem('keyoon_theme')||'dark';var d=document.documentElement;if(t==='light'){d.classList.add('light');d.classList.remove('dark');}else{d.classList.add('dark');d.classList.remove('light');}}catch(e){}})();`;

  return (
    <script
      id="keyoon-theme-init"
      suppressHydrationWarning
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
};
