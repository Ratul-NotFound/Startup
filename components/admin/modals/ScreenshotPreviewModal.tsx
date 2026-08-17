'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ScreenshotPreviewModalProps {
  previewScreenshotUrl: string | null;
  setPreviewScreenshotUrl: (url: string | null) => void;
}

export function ScreenshotPreviewModal({
  previewScreenshotUrl,
  setPreviewScreenshotUrl,
}: ScreenshotPreviewModalProps) {
  if (!previewScreenshotUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setPreviewScreenshotUrl(null)}
    >
      <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl bg-zinc-950">
        <button
          onClick={() => setPreviewScreenshotUrl(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/10 transition-colors shadow-lg"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={previewScreenshotUrl}
          alt="Payment Proof Full"
          className="w-full h-full object-contain max-h-[85vh] rounded-3xl"
        />
      </div>
    </div>
  );
}
