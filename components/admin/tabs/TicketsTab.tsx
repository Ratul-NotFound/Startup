'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  MessageCircle, Send, Image as ImageIcon, Loader2, X, ShieldCheck,
  Key, ShoppingBag, CheckCheck, Clock, Search, User, Filter,
  Sparkles, CheckCircle2, AlertCircle, Plus, ChevronRight, Phone
} from 'lucide-react';
import { CustomerChatThread, ChatMessage, CustomerProfile, SupportTicket } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { useApp } from '@/context/AppContext';

interface TicketsTabProps {
  allTickets?: SupportTicket[];
  allUsers: CustomerProfile[];
  getCustomerInfo: (userId?: string, userEmail?: string, fallbackName?: string) => { name: string; avatar: string; email: string };
  selectedTicketId?: string | null;
  setSelectedTicketId?: (id: string | null) => void;
  setDirectMessageTarget?: (target: { id: string; name: string; email: string; avatar: string } | null) => void;
  setDirectMessageSubject?: (sub: string) => void;
  setDirectMessageBody?: (body: string) => void;
  setShowDirectMessageModal?: (show: boolean) => void;
  adminCloseTicket?: (ticketId: string) => Promise<void>;
  setPreviewScreenshotUrl?: (url: string | null) => void;
  ticketReply?: string;
  setTicketReply?: (reply: string) => void;
  ticketReplyImage?: string | null;
  setTicketReplyImage?: (img: string | null) => void;
  isCompressingTicketImage?: boolean;
  setIsCompressingTicketImage?: (val: boolean) => void;
  handleReplyTicket?: (ticketId: string) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function TicketsTab({
  allUsers,
  getCustomerInfo,
  showFeedback,
}: TicketsTabProps) {
  const {
    allChatThreads,
    sendChatMessage,
    markChatThreadRead,
    setChatTypingStatus,
    allSubscriptions,
    allOrders,
    user: currentAdmin,
  } = useApp();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [composerText, setComposerText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadSearch, setNewThreadSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);

  // Auto-sort threads: newest message or updated timestamp always at the top
  const sortedThreads = useMemo(() => {
    return [...allChatThreads].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.lastMessageTimestamp || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.lastMessageTimestamp || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, [allChatThreads]);

  // Filtered threads by search and unread toggle
  const filteredThreads = useMemo(() => {
    return sortedThreads.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (t.userName && t.userName.toLowerCase().includes(q)) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
        (t.lastMessageText && t.lastMessageText.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (filterMode === 'unread') return (t.unreadCountAdmin || 0) > 0;
      return true;
    });
  }, [sortedThreads, searchQuery, filterMode]);

  // Set default selected thread
  useEffect(() => {
    if (!selectedThreadId && sortedThreads.length > 0) {
      setSelectedThreadId(sortedThreads[0].id);
    }
  }, [selectedThreadId, sortedThreads]);

  const activeThread = useMemo(() => {
    return sortedThreads.find(t => t.id === selectedThreadId) || sortedThreads[0] || null;
  }, [sortedThreads, selectedThreadId]);

  // Automatically mark thread as read by admin when opened
  useEffect(() => {
    if (activeThread?.id && (activeThread.unreadCountAdmin || 0) > 0) {
      markChatThreadRead(activeThread.id, 'admin');
    }
  }, [activeThread?.id, activeThread?.unreadCountAdmin, markChatThreadRead]);

  // Scroll to bottom when messages update
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedThreadId, scrollToBottom]);

  useEffect(() => {
    if (activeThread?.messages && activeThread.messages.length > 0) {
      scrollToBottom(true);
    }
  }, [activeThread?.messages?.length, scrollToBottom]);

  // Handle Image attachment with compression
  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 800, 800, 0.7);
      setAttachedImage(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      showFeedback('error', 'Failed to compress image.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send message handler
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : composerText;
    if ((!textToSend.trim() && !attachedImage) || !activeThread || isSending) return;

    setIsSending(true);
    try {
      await sendChatMessage(
        textToSend.trim(),
        attachedImage || undefined,
        undefined,
        activeThread.id
      );
      setComposerText('');
      setAttachedImage(null);
      markChatThreadRead(activeThread.id, 'admin');
      composerInputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send admin reply:', err);
      showFeedback('error', 'Failed to deliver message.');
    } finally {
      setIsSending(false);
    }
  };

  // Quick Reply Shortcuts
  const quickReplies = [
    '🛡️ Your replacement warranty has been approved. Credentials updated in your vault!',
    '🔑 We have refreshed your login session. Please check your credentials vault.',
    '💳 Your payment TrxID has been verified and your subscription is active!',
    '👋 Hello! Please send a clear screenshot of your transaction confirmation.',
  ];

  // Associated user info & active subscriptions for context sidebar
  const customerMeta = useMemo(() => {
    if (!activeThread) return null;
    const userProfile = allUsers.find(u => u.id === activeThread.userId || u.email?.toLowerCase() === activeThread.userEmail?.toLowerCase());
    const userSubs = allSubscriptions.filter(s => s.userId === activeThread.userId || (s.credentials?.email && s.credentials.email.toLowerCase() === activeThread.userEmail?.toLowerCase()));
    const userOrders = allOrders.filter(o => o.userId === activeThread.userId || o.userEmail?.toLowerCase() === activeThread.userEmail?.toLowerCase());

    return {
      profile: userProfile,
      subsCount: userSubs.length,
      ordersCount: userOrders.length,
      activeSubs: userSubs.filter(s => s.status === 'active' || s.status === 'expiring_soon'),
    };
  }, [activeThread, allUsers, allSubscriptions, allOrders]);

  const totalUnreadCount = sortedThreads.reduce((acc, t) => acc + (t.unreadCountAdmin || 0), 0);

  return (
    <div className="space-y-4">
      {/* ─── Messenger Hub Header Banner ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/[0.08] shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
            <MessageCircle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">Live Customer Messenger Hub</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Continuous Threads
              </span>
              {totalUnreadCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse shadow-md">
                  {totalUnreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Persistent one-user-one-thread architecture. Auto-sorts to top on incoming customer inquiry with zero ticket closing delays.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNewThreadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Start Conversation</span>
          </button>
        </div>
      </div>

      {/* ─── Main Messenger Workspace Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* ── Left Sidebar: Persistent Thread List (4 Cols) ─────────── */}
        <div className="lg:col-span-4 flex flex-col rounded-3xl bg-zinc-900/90 border border-white/[0.08] shadow-xl overflow-hidden">
          {/* List Header & Search */}
          <div className="p-3.5 border-b border-white/[0.06] bg-zinc-950/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Conversations ({filteredThreads.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-zinc-800 text-white border border-white/10'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('unread')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    filterMode === 'unread'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Unread</span>
                  {totalUnreadCount > 0 && (
                    <span className="px-1 py-0.2 rounded-full bg-red-500 text-white text-[9px]">
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, email, or message..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Thread List Scroll View */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin max-h-[600px]">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageCircle className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">No conversations found</p>
                <p className="text-[11px] text-slate-500">
                  {searchQuery ? 'Try clearing search terms' : 'Incoming customer messages will automatically appear here'}
                </p>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = activeThread?.id === thread.id;
                const unreadCount = thread.unreadCountAdmin || 0;
                const isUnread = unreadCount > 0;
                const timeStr = thread.updatedAt || thread.lastMessageTimestamp
                  ? new Date(thread.updatedAt || thread.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/40'
                        : isUnread
                        ? 'bg-zinc-950/80 border-cyan-500/30 hover:border-cyan-500/50 shadow-sm'
                        : 'bg-zinc-950/40 border-white/[0.04] hover:bg-zinc-900 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with Online/Unread Beacon */}
                      <div className="relative shrink-0">
                        <img
                          src={thread.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.userName || 'Customer')}&background=0284c7&color=fff`}
                          alt={thread.userName}
                          className="h-10 w-10 rounded-2xl object-cover border border-white/15 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.userName || 'Customer')}&background=0284c7&color=fff`;
                          }}
                        />
                        {isUnread ? (
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-md animate-bounce">
                            {unreadCount}
                          </span>
                        ) : (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : isUnread ? 'text-white' : 'text-slate-200'}`}>
                            {thread.userName || 'Verified Customer'}
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                            {timeStr}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 truncate">
                          {thread.userEmail}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          {thread.lastMessageSender === 'agent' && (
                            <span className="text-[10px] text-cyan-400 font-semibold shrink-0">You:</span>
                          )}
                          <p className={`text-[11px] truncate ${isUnread ? 'text-slate-200 font-bold' : 'text-slate-400'}`}>
                            {thread.lastMessageText || 'Opened support channel'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Live Messenger Feed & Two-Way Composer (8 Cols) ─── */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl bg-zinc-900/90 border border-white/[0.08] shadow-xl overflow-hidden">
          {activeThread ? (
            <div className="flex flex-col h-full">
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-white/[0.06] bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={activeThread.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeThread.userName || 'Customer')}&background=0284c7&color=fff`}
                    alt={activeThread.userName}
                    className="h-11 w-11 rounded-2xl object-cover border border-white/20 shadow-md ring-2 ring-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{activeThread.userName}</h3>
                      <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Synced
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{activeThread.userEmail}</span>
                      {customerMeta && (
                        <>
                          <span>·</span>
                          <span className="text-cyan-400 font-semibold">{customerMeta.subsCount} Active Plans</span>
                          <span>·</span>
                          <span className="text-slate-300 font-semibold">{customerMeta.ordersCount} Orders</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => markChatThreadRead(activeThread.id, 'admin')}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-slate-300 hover:text-white border border-white/[0.06] text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark Read
                  </button>
                </div>
              </div>

              {/* Scrolling Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin bg-zinc-950/60 max-h-[480px]">
                {/* Beginning of thread indicator */}
                <div className="text-center py-2">
                  <span className="text-[10px] text-slate-500 bg-zinc-900/90 px-3 py-1 rounded-full border border-white/5 font-mono">
                    Thread initiated: {new Date(activeThread.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {activeThread.messages && activeThread.messages.length > 0 ? (
                  activeThread.messages.map((msg) => {
                    const isAgent = msg.sender === 'agent';
                    const avatar = isAgent
                      ? (currentAdmin.avatar || 'https://ui-avatars.com/api/?name=Admin+Ops&background=0284c7&color=fff')
                      : (activeThread.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=6366f1&color=fff`);

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img
                          src={avatar}
                          alt={msg.senderName}
                          className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0 mt-1 shadow-sm"
                        />

                        <div className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} max-w-[80%]`}>
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                            <span className="text-[9px] text-slate-600">·</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 shadow-sm ${
                              isAgent
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-[0_2px_12px_rgba(6,182,212,0.25)]'
                                : 'bg-zinc-900 border border-white/10 text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {/* Metadata Context Badge */}
                            {msg.metadata && (
                              <div className="pb-1">
                                {msg.metadata.type === 'warranty_claim' && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-400/50 text-cyan-300 text-[10px] font-bold shadow-sm">
                                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-300 shrink-0" />
                                    <span>Warranty Claim: {msg.metadata.productName || 'Subscription'}</span>
                                    {msg.metadata.subscriptionId && (
                                      <span className="font-mono text-cyan-200/80 text-[9px]">[{msg.metadata.subscriptionId}]</span>
                                    )}
                                  </div>
                                )}
                                {msg.metadata.type === 'credential_issue' && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-400/50 text-indigo-300 text-[10px] font-bold shadow-sm">
                                    <Key className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
                                    <span>Credential Request: {msg.metadata.productName || 'Subscription'}</span>
                                  </div>
                                )}
                                {msg.metadata.type === 'order_inquiry' && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold shadow-sm">
                                    <ShoppingBag className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                                    <span>Order Verification: {msg.metadata.orderNumber}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Attached Image Preview */}
                            {msg.imageUrl && (
                              <div
                                onClick={() => setPreviewImage(msg.imageUrl!)}
                                className="rounded-xl overflow-hidden border border-white/20 cursor-pointer group/img relative"
                              >
                                <img
                                  src={msg.imageUrl}
                                  alt="Attachment"
                                  className="w-full max-h-56 object-cover group-hover/img:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                                  Click to enlarge
                                </div>
                              </div>
                            )}

                            {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No messages yet in this conversation thread. Send a greeting below!
                  </div>
                )}
                {activeThread?.isUserTyping && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-900 border border-white/10 w-fit animate-in fade-in duration-150">
                    <span className="text-[11px] text-cyan-300 font-semibold">
                      {activeThread.userName || 'Customer'} is typing
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

              {/* Quick Preset Macros Bar */}
              <div className="p-2 border-t border-white/[0.06] bg-zinc-950/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-2 pr-1 shrink-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  Quick Macros:
                </span>
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qr)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/10 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {qr.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Two-Way Real-Time Live Composer (No "Close Ticket" Lockout!) */}
              <div className="p-3.5 border-t border-white/[0.08] bg-zinc-950 rounded-b-3xl space-y-2 shrink-0">
                {attachedImage && (
                  <div className="flex items-center gap-2 px-1">
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
                    <span className="text-[11px] text-slate-400">Photo proof attached for customer</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
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
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
                    title="Attach Screenshot / Document"
                  >
                    {isCompressing ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : <ImageIcon className="h-4 w-4" />}
                  </button>

                  <input
                    ref={composerInputRef}
                    type="text"
                    value={composerText}
                    onChange={e => {
                      setComposerText(e.target.value);
                      if (activeThread?.id) {
                        setChatTypingStatus(activeThread.id, 'agent', e.target.value.length > 0);
                      }
                    }}
                    placeholder={attachedImage ? 'Add a message with your attachment...' : 'Type real-time reply to customer... (Press Enter to Send)'}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500 transition-colors"
                    onKeyDown={e => {
                      if (e.key === ' ' || e.code === 'Space') {
                        e.stopPropagation();
                      }
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={(!composerText.trim() && !attachedImage) || isSending}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageCircle className="h-10 w-10 text-slate-600" />
              <p className="text-sm font-bold text-white">Select a Customer Thread</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose a customer from the left inbox to view full chat history and respond in real time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Image Zoom Lightbox Modal ─────────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden bg-zinc-900 border border-white/20 p-2 shadow-2xl">
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

      {/* ─── Start New Thread with Customer Modal ──────────────────── */}
      {showNewThreadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-black text-white">Start New Customer Conversation</h3>
              <button
                type="button"
                onClick={() => setShowNewThreadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={newThreadSearch}
                onChange={e => setNewThreadSearch(e.target.value)}
                placeholder="Search customers by name or email..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin">
              {allUsers
                .filter(u => {
                  const q = newThreadSearch.toLowerCase();
                  return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                })
                .slice(0, 10)
                .map(userItem => (
                  <button
                    key={userItem.id}
                    type="button"
                    onClick={() => {
                      setSelectedThreadId(userItem.id);
                      setShowNewThreadModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={userItem.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.name || 'User')}&background=6366f1&color=fff`}
                        alt={userItem.name}
                        className="h-8 w-8 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{userItem.name || 'Customer'}</p>
                        <p className="text-[10px] text-slate-400">{userItem.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
