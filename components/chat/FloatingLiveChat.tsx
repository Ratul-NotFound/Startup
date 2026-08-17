'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  X, Send, Bot, User, ChevronRight, Headphones, Key,
  CreditCard, Sparkles, Check, CheckCheck, MessageCircle,
  HelpCircle, ShieldCheck, Zap, ArrowDownCircle, RefreshCw
} from 'lucide-react';
import { SupportTicket } from '@/types';

interface LiveMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
}

export const FloatingLiveChat: React.FC = () => {
  const {
    user,
    firebaseUser,
    tickets,
    createSupportTicket,
    replyToTicket,
    products,
    orders,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<LiveMessage[]>([
    {
      id: 'welcome_1',
      sender: 'agent',
      senderName: 'SubNexus Support Bot',
      content: '👋 Hey there! Welcome to SubNexus. How can we help you today with subscriptions, credentials, or payments?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with user's real Firestore tickets if active
  useEffect(() => {
    if (tickets.length > 0) {
      const current = tickets.find(t => t.id === activeTicketId) ||
        tickets.find(t => t.status === 'open' || t.status === 'in_progress') ||
        tickets[0];

      if (current) {
        setActiveTicketId(current.id);
        const mapped: LiveMessage[] = current.messages.map(m => ({
          id: m.id,
          sender: m.sender,
          senderName: m.senderName,
          content: m.content,
          timestamp: m.timestamp,
        }));
        setLocalMessages(mapped);
      }
    }
  }, [tickets, activeTicketId]);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, localMessages, isTyping]);

  // Quick Action Chips
  const quickChips = [
    { label: '🔑 Where are my credentials?', query: 'Where do I find my account login credentials after ordering?' },
    { label: '💳 How to pay via bKash/Nagad?', query: 'How do I complete payment using bKash or Nagad?' },
    { label: '⚡ Track recent order status', query: 'Can you help me check the status of my latest order?' },
    { label: '🛡️ Warranty & Replacement policy', query: 'How does the full replacement warranty work?' },
  ];

  // Smart instant assistant responses
  const getSmartResponse = (text: string): string => {
    const q = text.toLowerCase();
    if (q.includes('bkash') || q.includes('nagad') || q.includes('rocket') || q.includes('payment') || q.includes('pay')) {
      return '💳 For bKash / Nagad / Rocket: Choose your wallet during checkout, send the BDT amount to the provided personal number, and submit your Transaction ID (TrxID). Our admin team verifies and delivers credentials in under 2 minutes!';
    }
    if (q.includes('credential') || q.includes('password') || q.includes('vault') || q.includes('login') || q.includes('account')) {
      return '🔑 Credentials are automatically unlocked in your personal SubNexus Vault! Click the "Vault" button in the top navigation bar or go to your customer dashboard to copy your email, password, and PIN.';
    }
    if (q.includes('order') || q.includes('track') || q.includes('status') || q.includes('delivery')) {
      if (orders.length > 0) {
        const latest = orders[0];
        return `📦 Your latest order #${latest.orderNumber} is marked as [${latest.paymentStatus.toUpperCase()} - ${latest.deliveryStatus.toUpperCase()}]. You can view full invoices in your Dashboard.`;
      }
      return '📦 Instant orders are delivered within 30 seconds to your Vault. If you submitted a mobile wallet TrxID, our admin ops approve and deliver typically within 2-5 minutes.';
    }
    if (q.includes('warranty') || q.includes('replacement') || q.includes('renew') || q.includes('not working')) {
      return '🛡️ All subscriptions include a 100% Full-Term Replacement Warranty. If any login ever experiences an interruption, our automated monitoring engine resolves or replaces your slot immediately.';
    }
    return `Got your message! A live SubNexus Support Specialist has been notified and will assist you right here shortly. You can also view your tickets in the Dashboard.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: LiveMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      senderName: user.name || 'You',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setLocalMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Save to Firestore ticket
    if (activeTicketId) {
      await replyToTicket(activeTicketId, text, 'user');
    } else {
      const created = createSupportTicket('Live Chat Support', 'general', text);
      setActiveTicketId(created.id);
    }

    // Trigger realistic typing animation & smart bot assistant reply if no immediate agent
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botReply = getSmartResponse(text);
      const replyMsg: LiveMessage = {
        id: `bot_${Date.now()}`,
        sender: 'agent',
        senderName: 'SubNexus Support Ops',
        content: botReply,
        timestamp: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, replyMsg]);
    }, 1100);
  };

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
              whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsOpen(true)}
              aria-label="Open 24/7 Live Support Chat"
              className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-indigo-950 text-white shadow-[0_15px_45px_rgba(0,0,0,0.85)] border border-indigo-500/40 flex items-center justify-center cursor-pointer group"
            >
              {/* Outer pulsing glow */}
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md group-hover:bg-indigo-500/40 transition-colors" />

              {/* Chat Icon */}
              <div className="relative z-10 text-cyan-300 group-hover:text-white transition-colors">
                <MessageCircle className="h-6 w-6 stroke-[2.2]" />
              </div>

              {/* Live Online Pulse Indicator */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-0.5 -mr-0.5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950" />
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Live Chat Window (Messenger / Crisp Style) ─────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[385px] h-[550px] max-h-[85vh] flex flex-col rounded-[26px] bg-zinc-950 border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="relative shrink-0 p-4 bg-zinc-900/95 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-900 to-zinc-800 border border-indigo-500/30 flex items-center justify-center text-cyan-300 shadow-inner">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white tracking-tight">SubNexus Support</h3>
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Zap className="h-3 w-3 text-cyan-400" />
                    Instant Live Assistant & Support Ops
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Live Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-zinc-950">
              
              {/* Agent Welcome Card */}
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/[0.06] flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  We are here to help! Type your question below or click a quick topic.
                </div>
              </div>

              {/* Chat Bubble History */}
              {localMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {isUser ? 'You' : msg.senderName}
                      </span>
                      <span className="text-[9px] text-zinc-600">·</span>
                      <span className="text-[9px] text-zinc-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(79,70,229,0.35)]'
                          : 'bg-zinc-900 border border-white/10 text-zinc-200 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className="flex items-center gap-0.5 text-[9px] text-zinc-500 mt-0.5 pr-1">
                        <CheckCheck className="h-3 w-3 text-cyan-400" />
                        <span>Delivered</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-900 border border-white/10 w-fit"
                >
                  <span className="text-[11px] text-zinc-400 font-medium">SubNexus is typing</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggested Chips */}
            <div className="shrink-0 px-3 py-2 bg-zinc-950/95 border-t border-white/[0.06] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
              {quickChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip.query)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-white/10 hover:border-indigo-500/40 text-[11px] font-medium transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Bottom Live Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="shrink-0 p-3 bg-zinc-900 border-t border-white/[0.08] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
