'use client';

import React from 'react';

export const BrandTicker: React.FC = () => {
  const brandList = [
    {
      name: 'OpenAI',
      logo: (
        <svg className="h-9 sm:h-11 w-auto text-zinc-200 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.259 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7466-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1635a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.6863zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L8.907 9.2297V6.8974a.0662.0662 0 0 1 .0331-.0615L13.78 4.05a4.4992 4.4992 0 0 1 6.6708 4.6784zm-9.3986 4.7291l-2.6104-1.5052 2.6104-1.5052 2.6104 1.5052-2.6104 1.5052z" />
        </svg>
      ),
    },
    {
      name: 'Netflix',
      logo: (
        <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 24 24" fill="#E50914">
          <path d="M5.398 0v24c1.17-.386 2.34-.73 3.51-1.07V0H5.398zm9.694 0l-5.69 16.082V0H5.894v24c3.275-.92 6.55-1.84 9.825-2.76V0h-.627zm3.51 0v20.457c1.17-.267 2.34-.533 3.51-.8V0h-3.51z" />
        </svg>
      ),
    },
    {
      name: 'Claude',
      logo: (
        <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 24 24" fill="#D97706">
          <path d="M14.6 2.4L9.4 21.6h3.4l1.3-5.2h4.8l1.3 5.2h3.4L18.4 2.4h-3.8zm1.9 4.3l1.8 7.3h-3.6l1.8-7.3zM4.7 10.2L0 21.6h3.4l1-2.8h3.8l1 2.8h3.4L7.9 10.2H4.7zm1.1 6.2l1.1-3.2 1.1 3.2H5.8z" />
        </svg>
      ),
    },
    {
      name: 'Google Gemini',
      logo: (
        <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </svg>
      ),
    },
    {
      name: 'Spotify',
      logo: (
        <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 24 24" fill="#1ED760">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.307c-.218.358-.684.474-1.042.256-2.86-1.748-6.46-2.144-10.7-1.176-.407.093-.815-.16-.908-.567-.093-.408.16-.816.568-.908 4.64-1.06 8.62-.61 11.826 1.353.358.218.474.684.256 1.042zm1.474-3.273c-.274.446-.86.588-1.306.314-3.274-2.012-8.264-2.596-12.136-1.42-.497.15-1.028-.135-1.178-.632-.15-.497.135-1.028.632-1.178 4.42-1.342 9.914-.69 13.674 1.62.446.274.588.86.314 1.306zm.126-3.41c-3.926-2.332-10.395-2.547-14.15-1.407-.603.183-1.246-.164-1.428-.767-.183-.603.164-1.246.767-1.428 4.315-1.31 11.45-1.06 15.96 1.62.544.323.722 1.03.4 1.574-.324.544-1.03.722-1.574.408z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      logo: (
        <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'Adobe',
      logo: (
        <svg className="h-8.5 sm:h-10.5 w-auto" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M13.96 4h4.48L24 20h-4.32l-2.08-5.12h-4.24l2.4-6.48zm-3.92 0L4.32 20H0L5.68 4h4.36zM12 10.88l2.56 6.8h-5.12L12 10.88z" />
        </svg>
      ),
    },
    {
      name: 'Cursor',
      logo: (
        <div className="h-9 sm:h-11 w-9 sm:w-11 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono font-black text-lg text-cyan-400">
          ⌥
        </div>
      ),
    },
    {
      name: 'NordVPN',
      logo: (
        <svg className="h-9 sm:h-11 w-auto" viewBox="0 0 24 24" fill="#4687FF">
          <path d="M12 1L2 5.5v7.2c0 6.6 4.3 12.8 10 14.3 5.7-1.5 10-7.7 10-14.3V5.5L12 1zm0 3.3l7 3.1v5.3c0 5-3.1 9.8-7 11.2-3.9-1.4-7-6.2-7-11.2V7.4l7-3.1z" />
        </svg>
      ),
    },
  ];

  // Repeat for seamless endless scroll
  const marqueeItems = [...brandList, ...brandList, ...brandList];

  return (
    <div className="relative overflow-hidden py-6 sm:py-8 bg-transparent">
      
      {/* Soft Edge Fade Masks matching page background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

      {/* Hero-Sized Floating Brand Marquee */}
      <div className="overflow-hidden select-none">
        <div className="animate-marquee gap-8 sm:gap-12 items-center">
          {marqueeItems.map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 px-5 py-2.5 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/85 border border-white/[0.04] hover:border-cyan-500/40 text-zinc-400 hover:text-white transition-all duration-300 hover:scale-108 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] shrink-0 cursor-pointer group backdrop-blur-md"
            >
              <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                {brand.logo}
              </div>
              <span className="text-sm sm:text-base font-black tracking-wider text-zinc-300 group-hover:text-white transition-colors uppercase font-mono">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
