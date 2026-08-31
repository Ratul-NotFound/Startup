'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  X, Send, Bot, Headphones,
  CheckCheck, MessageCircle, Zap, Image as ImageIcon,
  Loader2, ShieldCheck, Key, ShoppingBag, Sparkles
} from 'lucide-react';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { QuickMessage, ChatMessage } from '@/types';
import { resolveSmartAssistantResponse, interpolateDynamicVariables, DynamicChatContext } from '@/lib/chat-resolver';
import { playMessageDingSound } from '@/lib/sound-effects';

// ─── Memoized Message Bubble ───────────────────────────────────────────
const MessageBubble = memo(({
  msg,
  onImageClick,
}: {
  msg: ChatMessage;
  onImageClick?: (url: string) => void;
}) => {
  const isUser = msg.sender === 'user';
  const isBot = msg.sender === 'bot';
  const isAgent = msg.sender === 'agent';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transform-gpu`}>
      <div className="flex items-center gap-1.5 mb-1 px-1">
        {isBot && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/30 text-[9px] font-bold text-purple-300">
            <Sparkles className="h-2.5 w-2.5 text-purple-400" />
            AI Assistant
          </span>
        )}
        {isAgent && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-[9px] font-bold text-emerald-300">
            <Headphones className="h-2.5 w-2.5 text-emerald-400" />
            Live Support
          </span>
        )}
        <span className="text-[10px] text-zinc-400 font-semibold">
          {isUser ? 'You' : (msg.senderName || (isBot ? 'Keyoon Assistant' : 'Support Specialist'))}
        </span>
        <span className="text-[9px] text-zinc-600">·</span>
        <span className="text-[9px] text-zinc-500">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div
        className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-[0_2px_12px_rgba(6,182,212,0.3)]'
            : isBot
            ? 'bg-zinc-900 border border-purple-500/25 text-zinc-100 rounded-tl-sm shadow-sm'
            : 'bg-zinc-900 border border-emerald-500/25 text-zinc-100 rounded-tl-sm shadow-sm'
        }`}
      >
        {/* Structured Context Metadata Badge (Warranty Claim / Credential / Order) */}
        {msg.metadata && (
          <div className="pb-1">
            {msg.metadata.type === 'warranty_claim' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300 shrink-0" />
                <span>Warranty Claim: {msg.metadata.productName || 'Subscription'}</span>
                {msg.metadata.subscriptionId && (
                  <span className="font-mono text-cyan-200/70 text-[9px]">[{msg.metadata.subscriptionId}]</span>
                )}
              </div>
            )}
            {msg.metadata.type === 'credential_issue' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/90 border border-indigo-400/40 text-indigo-300 text-[10px] font-bold shadow-sm">
                <Key className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
                <span>Credential Request: {msg.metadata.productName || 'Subscription'}</span>
              </div>
            )}
            {msg.metadata.type === 'order_inquiry' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold shadow-sm">
                <ShoppingBag className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                <span>Order Inquiry: {msg.metadata.orderNumber}</span>
              </div>
            )}
          </div>
        )}

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
          <span>Sent to Operations Hub</span>
        </div>
      )}
    </div>
  );
});
MessageBubble.displayName = 'MessageBubble';

// ─── Memoized Dynamic Quick Chips Bar ─────────────────────────────────
const QuickChipsBar = memo(({
  chips,
  onSelect,
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
const ChatInputBar = memo(({
  onSend,
  isSending,
  onTypingChange,
}: {
  onSend: (text: string, imageUrl?: string) => void;
  isSending: boolean;
  onTypingChange?: (isTyping: boolean) => void;
}) => {
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
          <span className="text-[10px] text-zinc-400">Photo proof attached</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImagePick}
          className="hidden"
        />

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
          onChange={(e) => {
            setText(e.target.value);
            onTypingChange?.(e.target.value.length > 0);
          }}
          onKeyDown={(e) => {
            // Stop event bubbling to ensure space key is never blocked by motion wrappers or hotkeys
            if (e.key === ' ' || e.code === 'Space') {
              e.stopPropagation();
            }
          }}
          placeholder={attachedImage ? 'Add a caption...' : 'Type your message or warranty question...'}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors font-['Hind_Siliguri',sans-serif] tracking-normal"
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

// ─── Main Unified Floating Live Chat Component ─────────────────────────
export const FloatingLiveChat: React.FC = () => {
  const {
    user,
    orders,
    subscriptions,
    paymentMethods,
    quickMessages,
    isChatOpen,
    setIsChatOpen,
    userChatThread,
    sendChatMessage,
    markChatThreadRead,
    setChatTypingStatus,
  } = useApp();

  const [isTyping, setIsTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active quick message chips
  const activeChips = (quickMessages && quickMessages.length > 0)
    ? quickMessages.filter(q => q.isActive)
    : [];

  // Build live dynamic context
  const dynamicContext: DynamicChatContext = {
    user,
    orders,
    subscriptions,
    paymentMethods,
    quickMessages,
  };

  // Mark thread read when user opens the chat
  useEffect(() => {
    if (isChatOpen && userChatThread?.id) {
      markChatThreadRead(userChatThread.id, 'user');
    }
  }, [isChatOpen, userChatThread?.id, markChatThreadRead]);

  // Smooth scroll
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom(false);
    }
  }, [isChatOpen, scrollToBottom]);

  const messages: ChatMessage[] = userChatThread?.messages && userChatThread.messages.length > 0
    ? userChatThread.messages
    : [
        {
          id: 'welcome_initial',
          sender: 'agent',
          senderName: 'Keyoon Support Specialist',
          content: '👋 Welcome to Keyoon! We are here 24/7. Ask questions about subscriptions, track your orders, or claim full replacement warranty directly in this thread.',
          timestamp: new Date().toISOString(),
        },
      ];

  useEffect(() => {
    if (isChatOpen && messages.length > 1) {
      scrollToBottom(true);
    }
  }, [messages.length, isTyping, isChatOpen, scrollToBottom]);

  // Handle Quick Chip selection with auto response
  const handleSelectQuickChip = useCallback((qm: QuickMessage) => {
    sendChatMessage(qm.query, undefined, undefined, undefined, 'user');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const answerText = interpolateDynamicVariables(qm.answer, dynamicContext);
      sendChatMessage(answerText, undefined, undefined, userChatThread?.id, 'bot', 'Keyoon AI Assistant');
    }, 450);
  }, [dynamicContext, sendChatMessage, userChatThread?.id]);

  // Handle regular chat send with AI smart assistant resolution
  const handleSendMessage = useCallback(async (text: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return;

    await sendChatMessage(text, imageUrl, undefined, undefined, 'user');

    const botResponseText = imageUrl && !text
      ? 'Thank you for providing the screenshot! Our operations team has received it in the live queue and will assist you shortly.'
      : resolveSmartAssistantResponse(text, dynamicContext);

    const isGenericGreeting = botResponseText.startsWith('Got your message') || botResponseText.startsWith('আপনার বার্তাটি পেয়েছি');
    const alreadyGreeted = messages.some(m => m.sender === 'bot' || m.sender === 'agent');

    // Only auto-reply if bot has a specific helpful answer OR if it's the very first greeting
    if (botResponseText && (!isGenericGreeting || !alreadyGreeted)) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        sendChatMessage(botResponseText, undefined, undefined, userChatThread?.id, 'bot', 'Keyoon AI Assistant');
      }, 550);
    }
  }, [dynamicContext, sendChatMessage, userChatThread?.id, messages]);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingStateRef = useRef<boolean>(false);

  const handleTypingChange = useCallback((typing: boolean) => {
    if (!userChatThread?.id) return;

    if (typing !== lastTypingStateRef.current) {
      lastTypingStateRef.current = typing;
      setChatTypingStatus(userChatThread.id, 'user', typing);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (typing) {
      typingTimerRef.current = setTimeout(() => {
        lastTypingStateRef.current = false;
        if (userChatThread?.id) {
          setChatTypingStatus(userChatThread.id, 'user', false);
        }
      }, 2500);
    }
  }, [userChatThread?.id, setChatTypingStatus]);

  const unreadCount = userChatThread?.unreadCountUser || 0;

  // Sound chime when a new message arrives from agent/bot while chat is closed
  const prevMsgCountRef = useRef(userChatThread?.messages?.length || 0);
  useEffect(() => {
    const currentCount = userChatThread?.messages?.length || 0;
    if (currentCount > prevMsgCountRef.current) {
      const lastMsg = userChatThread?.messages?.[currentCount - 1];
      if (lastMsg && lastMsg.sender !== 'user' && !isChatOpen) {
        playMessageDingSound();
      }
    }
    prevMsgCountRef.current = currentCount;
  }, [userChatThread?.messages, isChatOpen]);

  return (
    <>
      {/* ─── Floating Circular Chat Head with Bangla CTA Pill ───────── */}
      <div className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-40">
        <AnimatePresence>
          {!isChatOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 sm:gap-2.5 font-['Hind_Siliguri',sans-serif]"
            >
              {/* Floating Bangla Action Callout Pill */}
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl text-left cursor-pointer transition-all hover:scale-105 group ${
                  unreadCount > 0
                    ? 'bg-gradient-to-r from-red-950/90 via-zinc-950/95 to-zinc-950/95 border-2 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse'
                    : 'bg-zinc-950/95 hover:bg-zinc-900 border border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    unreadCount > 0 ? 'bg-red-500' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    unreadCount > 0 ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                </span>
                <div className="leading-tight">
                  <p className={`text-[11px] sm:text-xs font-bold leading-tight ${
                    unreadCount > 0 ? 'text-red-400 font-black' : 'text-white group-hover:text-cyan-300 transition-colors'
                  }`}>
                    {unreadCount > 0
                      ? `🔔 নতুন ${unreadCount}টি মেসেজ এসেছে!`
                      : 'কাস্টমার সার্ভিস এজেন্টের সাথে কথা বলুন'
                    }
                  </p>
                  <p className={`text-[9px] sm:text-[10px] font-medium mt-0.5 ${
                    unreadCount > 0 ? 'text-zinc-300 font-semibold' : 'text-cyan-400'
                  }`}>
                    {unreadCount > 0
                      ? 'সাপোর্ট এজেন্ট রিপ্লাই দিয়েছেন • দেখতে ক্লিক করুন'
                      : '২৪/৭ লাইভ সাপোর্ট • যেকোনো প্রশ্ন ও ওয়ারেন্টি'
                    }
                  </p>
                </div>
              </button>

              {/* Circular Chat Head Icon Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsChatOpen(true)}
                aria-label="Open 24/7 Live Support Chat"
                className={`relative h-13 w-13 sm:h-14 sm:w-14 rounded-full text-white shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer group transform-gpu shrink-0 transition-all ${
                  unreadCount > 0
                    ? 'bg-gradient-to-tr from-red-950 via-zinc-900 to-red-900 border-2 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-bounce'
                    : 'bg-gradient-to-tr from-zinc-950 via-zinc-900 to-cyan-950 border-2 border-cyan-500/50 hover:border-cyan-400'
                }`}
              >
                <div className={`absolute inset-0 rounded-full blur-sm transition-colors ${
                  unreadCount > 0 ? 'bg-red-500/30 group-hover:bg-red-500/50' : 'bg-cyan-500/20 group-hover:bg-cyan-500/40'
                }`} />

                <div className={`relative z-10 transition-colors ${
                  unreadCount > 0 ? 'text-red-400 group-hover:text-white' : 'text-cyan-400 group-hover:text-white'
                }`}>
                  <MessageCircle className="h-6 w-6 stroke-[2.2]" />
                </div>

                {/* Unread Message Badge or Online Indicator */}
                {unreadCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full bg-red-600 text-[11px] font-black text-white border-2 border-zinc-950 shadow-2xl animate-pulse">
                    {unreadCount}
                  </span>
                ) : (
                  <span className="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-0.5 -mr-0.5 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950" />
                  </span>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Live Chat Window ────────────────────────────────────────── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[85vh] flex flex-col rounded-[26px] bg-zinc-950 border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden transform-gpu"
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
                      Messenger
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Zap className="h-2.5 w-2.5 text-cyan-400" />
                    Continuous Persistent Customer Thread
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
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
                  Your chat history is permanently synced with our operations hub.
                </div>
              </div>

              {/* Chat Bubble History */}
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} onImageClick={setPreviewImage} />
              ))}

              {/* Typing Indicator */}
              {(isTyping || userChatThread?.isAdminTyping) && (
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-900 border border-white/10 w-fit animate-in fade-in duration-150">
                  <span className="text-[11px] text-cyan-300 font-semibold">
                    {userChatThread?.isAdminTyping ? 'Keyoon Specialist is typing' : 'Keyoon is typing'}
                  </span>
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
            <ChatInputBar onSend={handleSendMessage} isSending={isTyping} onTypingChange={handleTypingChange} />
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
              type="button"
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
