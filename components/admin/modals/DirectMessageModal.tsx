'use client';

import React, { useRef } from 'react';
import { SupportTicket } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { X, Send, Loader2, Upload, ImageIcon, MessageSquare } from 'lucide-react';

interface DirectMessageModalProps {
  showDirectMessageModal: boolean;
  setShowDirectMessageModal: (show: boolean) => void;
  directMessageTarget: { id: string; name: string; email: string; avatar: string } | null;
  directMessageSubject: string;
  setDirectMessageSubject: (val: string) => void;
  directMessageCategory: SupportTicket['category'];
  setDirectMessageCategory: (val: SupportTicket['category']) => void;
  directMessageBody: string;
  setDirectMessageBody: (val: string) => void;
  directMessageImage: string | null;
  setDirectMessageImage: (val: string | null) => void;
  isCompressingDmImage: boolean;
  setIsCompressingDmImage: (val: boolean) => void;
  isSendingDirectMessage: boolean;
  handleSendDirectMessage: (e: React.FormEvent) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function DirectMessageModal({
  showDirectMessageModal,
  setShowDirectMessageModal,
  directMessageTarget,
  directMessageSubject,
  setDirectMessageSubject,
  directMessageCategory,
  setDirectMessageCategory,
  directMessageBody,
  setDirectMessageBody,
  directMessageImage,
  setDirectMessageImage,
  isCompressingDmImage,
  setIsCompressingDmImage,
  isSendingDirectMessage,
  handleSendDirectMessage,
  showFeedback,
}: DirectMessageModalProps) {
  const dmFileInputRef = useRef<HTMLInputElement>(null);

  if (!showDirectMessageModal || !directMessageTarget) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && setShowDirectMessageModal(false)}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <img src={directMessageTarget.avatar} alt={directMessageTarget.name} className="h-10 w-10 rounded-full object-cover border border-white/15 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-white">Direct Message to {directMessageTarget.name}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{directMessageTarget.email}</p>
            </div>
          </div>
          <button onClick={() => setShowDirectMessageModal(false)} className="p-1.5 rounded-xl bg-zinc-800 text-slate-400 hover:text-white border border-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSendDirectMessage} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Subject</label>
            <input
              type="text"
              value={directMessageSubject}
              onChange={e => setDirectMessageSubject(e.target.value)}
              placeholder="e.g. Account Security Update, Special Offer..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
            <select
              value={directMessageCategory}
              onChange={e => setDirectMessageCategory(e.target.value as SupportTicket['category'])}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="general">General Notification</option>
              <option value="credentials">Credentials / Vault Info</option>
              <option value="payment">Payment & Billing</option>
              <option value="technical">Technical Support</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Message Body</label>
            <textarea
              rows={4}
              value={directMessageBody}
              onChange={e => setDirectMessageBody(e.target.value)}
              placeholder="Write your message here... Customer will see this in their Support Tickets dashboard."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          {/* Attachment upload */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Attach Image Proof / Screenshot (Optional)</label>
            <input
              type="file"
              ref={dmFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsCompressingDmImage(true);
                try {
                  const compressed = await compressImageToDataUrl(file, 1024, 0.7);
                  setDirectMessageImage(compressed);
                } catch {
                  showFeedback('error', 'Failed to compress image.');
                } finally {
                  setIsCompressingDmImage(false);
                }
              }}
            />
            {directMessageImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 h-28 bg-black group">
                <img src={directMessageImage} alt="Attachment" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setDirectMessageImage(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-950/80 text-red-300 border border-red-500/30 hover:bg-red-900 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => dmFileInputRef.current?.click()}
                disabled={isCompressingDmImage}
                className="w-full py-2.5 border border-dashed border-white/20 hover:border-cyan-400/50 rounded-2xl text-xs text-slate-400 hover:text-white flex items-center justify-center gap-2 bg-zinc-950/50 transition-all cursor-pointer"
              >
                {isCompressingDmImage ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : <Upload className="h-4 w-4 text-cyan-400" />}
                <span>{isCompressingDmImage ? 'Compressing...' : 'Upload Image Attachment'}</span>
              </button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowDirectMessageModal(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSendingDirectMessage || (!directMessageBody.trim() && !directMessageImage)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {isSendingDirectMessage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
