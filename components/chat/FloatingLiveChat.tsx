'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  X, Send, Bot, Headphones,
  CheckCheck, MessageCircle, Zap, Image as ImageIcon,
  Loader2, RotateCcw, Sparkles
} from 'lucide-react';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { QuickMessage } from '@/types';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LiveMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  senderName: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

// ─── Memoized Message Bubble ───────────────────────────────────────────
const MessageBubble = memo(({ msg, onImageClick }: { msg: LiveMessage; onImageClick?: (url: string) => void }) => {
  const isUser = msg.sender === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transform-gpu`}>
      <div className="flex items-center gap-1 mb-1 px-1">
        <span className="text-[10px] text-zinc-400 font-semibold">
          {isUser ? 'You' : msg.senderName}
        </span>
        <span className="text-[9px] text-zinc-600">·</span>
        <span className="text-[9px] text-zinc-500">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div
        className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-[0_2px_12px_rgba(6,182,212,0.3)]'
            : 'bg-zinc-900 border border-white/10 text-zinc-200 rounded-tl-sm shadow-sm'
        }`}
      >
        {/* Render compressed attached image */}
        {msg.imageUrl && (
          <div
            onClick={() => onImageClick?.(msg.imageUrl!)}
            className="rounded-xl overflow-hidden border border-white/15 cursor-pointer group/img relative"
          >
            <img
              src={msg.imageUrl}
              alt="Attachment"
              className="w-full max-h-48 object-cover group-hover/img:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
              Click to preview
            </div>
          </div>
        )}

        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
      </div>

      {isUser && (
        <div className="flex items-center gap-0.5 text-[9px] text-zinc-500 mt-0.5 pr-1">
          <CheckCheck className="h-3 w-3 text-cyan-400" />
          <span>Delivered</span>
        </div>
      )}
    </div>
  );
});
MessageBubble.displayName = 'MessageBubble';

// ─── Memoized Dynamic Quick Chips Bar ─────────────────────────────────
const QuickChipsBar = memo(({
  chips,
  onSelect
}: {
  chips: QuickMessage[];
  onSelect: (qm: QuickMessage) => void;
}) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="shrink-0 px-3 py-2 bg-zinc-950/95 border-t border-white/[0.06] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onSelect(chip)}
          className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
});
QuickChipsBar.displayName = 'QuickChipsBar';

// ─── Fast Input Form with Image Compression ───────────────────────────
const ChatInputBar = memo(({ onSend, isSending }: { onSend: (text: string, imageUrl?: string) => void; isSending: boolean }) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 700, 700, 0.65);
      setAttachedImage(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !attachedImage) || isSending || isCompressing) return;

    onSend(text.trim(), attachedImage || undefined);
    setText('');
    setAttachedImage(null);
    inputRef.current?.focus();
  };

  return (
    <div className="shrink-0 bg-zinc-900 border-t border-white/[0.08]">
      {/* Thumbnail preview if image attached */}
      {attachedImage && (
        <div className="px-3 pt-2 pb-1 flex items-center gap-2">
          <div className="relative inline-block rounded-xl overflow-hidden border border-white/20">
            <img src={attachedImage} alt="Attachment Preview" className="h-12 w-12 object-cover" />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <span className="text-[10px] text-zinc-400">Compressed image attached (stays in Firestore text)</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImagePick}
          className="hidden"
        />

        {/* Image Attachment Trigger */}
        <button
          type="button"
          disabled={isCompressing}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-400 hover:text-white border border-white/[0.06] transition-all cursor-pointer shrink-0"
          title="Attach Screenshot / Photo"
        >
          {isCompressing ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : <ImageIcon className="h-4 w-4" />}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={attachedImage ? 'Add a caption...' : 'Write a message...'}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />

        <button
          type="submit"
          disabled={(!text.trim() && !attachedImage) || isSending || isCompressing}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-40 text-white transition-transform shadow-md shrink-0 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
});
ChatInputBar.displayName = 'ChatInputBar';

// ─── Main Optimized Floating Live Chat Component ──────────────────────
export const FloatingLiveChat: React.FC = () => {
  const {
    user,
    tickets,
    createSupportTicket,
    replyToTicket,
    orders,
    quickMessages,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<LiveMessage[]>([
    {
      id: 'welcome_1',
      sender: 'agent',
      senderName: 'Keyoon Support Bot',
      content: '👋 Hey there! Welcome to Keyoon. How can we help you today with subscriptions, credentials, or payments?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter active quick messages
  const activeChips = (quickMessages && quickMessages.length > 0)
    ? quickMessages.filter(q => q.isActive)
    : [];

  // Restore persistent ticket ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTicketId = localStorage.getItem('keyoon_live_chat_ticket_id');
      if (savedTicketId) {
        setActiveTicketId(savedTicketId);
      }
    }
  }, []);

  // Listen directly to Firestore for activeTicketId in real-time
  useEffect(() => {
    if (!activeTicketId) return;

    try {
      const unsub = onSnapshot(doc(db, 'support_tickets', activeTicketId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.messages)) {
            setLocalMessages(data.messages);
          }
        }
      }, (err) => {
        console.warn('Live chat ticket listener note:', err);
      });
      return () => unsub();
    } catch { }
  }, [activeTicketId]);

  // Sync real-time tickets from user tickets context
  useEffect(() => {
    if (tickets.length > 0 && !activeTicketId) {
      const current = tickets.find(t => t.status === 'open' || t.status === 'in_progress') || tickets[0];
      if (current) {
        setActiveTicketId(current.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('keyoon_live_chat_ticket_id', current.id);
        }
        if (current.messages && current.messages.length > 0) {
          setLocalMessages(current.messages);
        }
      }
    }
  }, [tickets, activeTicketId]);

  // Smooth scroll
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && localMessages.length > 1) {
      scrollToBottom(true);
    }
  }, [localMessages.length, isTyping, isOpen, scrollToBottom]);

  // Reset conversation to fresh topic
  const handleResetTopic = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('keyoon_live_chat_ticket_id');
    }
    setActiveTicketId(null);
    setLocalMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'agent',
        senderName: 'Keyoon Support Bot',
        content: '👋 Conversation reset. How can we help you today with subscriptions, credentials, or payments?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Smart assistant matcher against dynamic quickMessages
  const findMatchingAnswer = useCallback((queryText: string): string => {
    const q = queryText.toLowerCase().trim();

    // 1. Direct match on active quickMessages
    for (const qm of activeChips) {
      if (qm.query.toLowerCase().trim() === q || qm.label.toLowerCase().trim() === q) {
        // Enrich order query with live user orders if available
        if (qm.keywords?.includes('order') || qm.keywords?.includes('status') || q.includes('order')) {
          if (orders && orders.length > 0) {
            const latest = orders[0];
            return `📦 Your latest order #${latest.orderNumber} is marked as [${latest.paymentStatus.toUpperCase()} - ${latest.deliveryStatus.toUpperCase()}].\n\n${qm.answer}`;
          }
        }
        return qm.answer;
      }
    }

    // 2. Keyword overlap search
    for (const qm of activeChips) {
      if (qm.keywords && qm.keywords.length > 0) {
        const matchesKeyword = qm.keywords.some(kw => q.includes(kw.toLowerCase().trim()));
        if (matchesKeyword) {
          if (qm.keywords.includes('order') && orders && orders.length > 0) {
            const latest = orders[0];
            return `📦 Your latest order #${latest.orderNumber} is marked as [${latest.paymentStatus.toUpperCase()} - ${latest.deliveryStatus.toUpperCase()}].\n\n${qm.answer}`;
          }
          return qm.answer;
        }
      }
    }

    // 3. Fallback standard intelligent assistant response
    return `Got your inquiry! A live Keyoon Support Specialist has been alerted and will assist you shortly right here. You can also review your orders and credentials directly in your Dashboard.`;
  }, [activeChips, orders]);

  // Handle Quick Chip selection
  const handleSelectQuickChip = useCallback((qm: QuickMessage) => {
    const userMsg: LiveMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      senderName: user?.name || 'You',
      content: qm.query,
      timestamp: new Date().toISOString(),
    };

    setLocalMessages(prev => [...prev, userMsg]);

    // Save or create ticket
    let ticketIdToUse = activeTicketId;
    if (ticketIdToUse) {
      replyToTicket(ticketIdToUse, qm.query, 'user');
    } else {
      const created = createSupportTicket(qm.label, 'general', qm.query);
      ticketIdToUse = created.id;
      setActiveTicketId(created.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('keyoon_live_chat_ticket_id', created.id);
      }
    }

    // Send instant dynamic answer
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let answerText = qm.answer;
      if ((qm.keywords?.includes('order') || qm.query.toLowerCase().includes('order')) && orders && orders.length > 0) {
        const latest = orders[0];
        answerText = `📦 Your latest order #${latest.orderNumber} is marked as [${latest.paymentStatus.toUpperCase()} - ${latest.deliveryStatus.toUpperCase()}].\n\n${qm.answer}`;
      }

      const botReply: LiveMessage = {
        id: `bot_${Date.now()}`,
        sender: 'agent',
        senderName: 'Keyoon Support Bot',
        content: answerText,
        timestamp: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, botReply]);

      if (ticketIdToUse) {
        replyToTicket(ticketIdToUse, answerText, 'agent');
      }
    }, 350);
  }, [activeTicketId, user, orders, createSupportTicket, replyToTicket]);

  // Handle regular chat send
  const handleSendMessage = useCallback(async (text: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return;

    const userMsg: LiveMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      senderName: user?.name || 'You',
      content: text,
      imageUrl,
      timestamp: new Date().toISOString(),
    };

    setLocalMessages(prev => [...prev, userMsg]);

    // Save to Firestore ticket
    let ticketIdToUse = activeTicketId;
    if (ticketIdToUse) {
      replyToTicket(ticketIdToUse, text, 'user', imageUrl);
    } else {
      const created = createSupportTicket('Live Chat Support', 'general', text || 'Sent image attachment', imageUrl);
      ticketIdToUse = created.id;
      setActiveTicketId(created.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('keyoon_live_chat_ticket_id', created.id);
      }
    }

    // Dynamic response from bot
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botResponseText = imageUrl && !text
        ? 'Thank you for the screenshot! Our operations team is reviewing it and will assist you in a moment.'
        : findMatchingAnswer(text);

      const replyMsg: LiveMessage = {
        id: `bot_${Date.now()}`,
        sender: 'agent',
        senderName: 'Keyoon Support Bot',
        content: botResponseText,
        timestamp: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, replyMsg]);

      if (ticketIdToUse) {
        replyToTicket(ticketIdToUse, botResponseText, 'agent');
      }
    }, 400);
  }, [activeTicketId, user, createSupportTicket, replyToTicket, findMatchingAnswer]);

  return (
    <>
      {/* ─── Floating Circular Chat Head ────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsOpen(true)}
              aria-label="Open 24/7 Live Support Chat"
              className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-cyan-950 text-white shadow-[0_10px_35px_rgba(0,0,0,0.8)] border border-cyan-500/40 flex items-center justify-center cursor-pointer group transform-gpu"
            >
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-sm group-hover:bg-cyan-500/40 transition-colors" />

              <div className="relative z-10 text-cyan-400 group-hover:text-white transition-colors">
                <MessageCircle className="h-6 w-6 stroke-[2.2]" />
              </div>

              {/* Live Online Indicator */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-0.5 -mr-0.5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950" />
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Live Chat Window ────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[395px] h-[560px] max-h-[85vh] flex flex-col rounded-[26px] bg-zinc-950 border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden transform-gpu"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Header */}
            <div className="relative shrink-0 p-3.5 bg-zinc-900 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="h-9 w-9 rounded-2xl bg-zinc-800 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-inner">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white tracking-tight">Keyoon Live Support</h3>
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      Online
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Zap className="h-2.5 w-2.5 text-cyan-400" />
                    Instant Bot & 24/7 Human Specialist
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetTopic}
                  title="Start New Topic / Reset Thread"
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-400 hover:text-white border border-white/[0.06] transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-400 hover:text-white border border-white/[0.06] transition-all cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Live Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-zinc-950 overscroll-contain">
              {/* Agent Welcome Card */}
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/[0.06] flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  Welcome to Keyoon! Tap any quick question below or message us directly.
                </div>
              </div>

              {/* Chat Bubble History */}
              {localMessages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} onImageClick={setPreviewImage} />
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-900 border border-white/10 w-fit">
                  <span className="text-[11px] text-zinc-400 font-medium">Keyoon is typing</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Dynamic Quick Action Suggested Chips */}
            <QuickChipsBar chips={activeChips} onSelect={handleSelectQuickChip} />

            {/* Bottom Live Input Bar with Image Compressor */}
            <ChatInputBar onSend={handleSendMessage} isSending={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Image Zoom Lightbox Modal ──────────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden bg-zinc-900 border border-white/20 p-2 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white hover:bg-zinc-800 z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Screenshot Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
