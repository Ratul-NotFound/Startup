'use client';

import React, { useRef } from 'react';
import { Plus, X, Loader2, ImageIcon, Send } from 'lucide-react';
import { SupportTicket, CustomerProfile } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';

interface TicketsTabProps {
  allTickets: SupportTicket[];
  allUsers: CustomerProfile[];
  getCustomerInfo: (userId?: string, userEmail?: string, fallbackName?: string) => { name: string; avatar: string; email: string };
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  setDirectMessageTarget: (target: { id: string; name: string; email: string; avatar: string } | null) => void;
  setDirectMessageSubject: (sub: string) => void;
  setDirectMessageBody: (body: string) => void;
  setShowDirectMessageModal: (show: boolean) => void;
  adminCloseTicket: (ticketId: string) => Promise<void>;
  setPreviewScreenshotUrl: (url: string | null) => void;
  ticketReply: string;
  setTicketReply: (reply: string) => void;
  ticketReplyImage: string | null;
  setTicketReplyImage: (img: string | null) => void;
  isCompressingTicketImage: boolean;
  setIsCompressingTicketImage: (val: boolean) => void;
  handleReplyTicket: (ticketId: string) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function TicketsTab({
  allTickets,
  allUsers,
  getCustomerInfo,
  selectedTicketId,
  setSelectedTicketId,
  setDirectMessageTarget,
  setDirectMessageSubject,
  setDirectMessageBody,
  setShowDirectMessageModal,
  adminCloseTicket,
  setPreviewScreenshotUrl,
  ticketReply,
  setTicketReply,
  ticketReplyImage,
  setTicketReplyImage,
  isCompressingTicketImage,
  setIsCompressingTicketImage,
  handleReplyTicket,
  showFeedback,
}: TicketsTabProps) {
  const ticketFileInputRef = useRef<HTMLInputElement>(null);
  const activeTicket = allTickets.find(t => t.id === selectedTicketId) || allTickets[0] || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Ticket list */}
      <div className="lg:col-span-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">All Customer Tickets ({allTickets.length})</h2>
          <button
            onClick={() => {
              const defaultTarget = allUsers.length > 0 ? getCustomerInfo(allUsers[0].id, allUsers[0].email, allUsers[0].name) : null;
              setDirectMessageTarget(defaultTarget ? { id: defaultTarget.email, name: defaultTarget.name, email: defaultTarget.email, avatar: defaultTarget.avatar } : null);
              setDirectMessageSubject('');
              setDirectMessageBody('');
              setShowDirectMessageModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Message User</span>
          </button>
        </div>
        {allTickets.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">No support tickets found.</p>
        ) : allTickets.map(t => {
          const cust = getCustomerInfo(t.userId, t.userEmail, t.messages[0]?.senderName);
          const isSelected = activeTicket?.id === t.id;

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTicketId(t.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                isSelected
                  ? 'bg-blue-950/50 border-blue-500/50 shadow-lg ring-1 ring-blue-500/40'
                  : 'bg-zinc-900 border-white/[0.06] hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                  {t.ticketNumber}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  t.status === 'open' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                  t.status === 'in_progress' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' :
                  'bg-zinc-800 text-zinc-400 border-white/10'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              {/* Customer Identity */}
              <div className="flex items-center gap-2.5">
                <img
                  src={cust.avatar}
                  alt={cust.name}
                  className="h-8 w-8 rounded-full object-cover border border-white/15 shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{cust.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{t.userEmail}</p>
                </div>
              </div>

              {/* Subject Tag */}
              <div className="text-xs font-medium text-slate-300 truncate bg-zinc-950/70 px-2.5 py-1.5 rounded-xl border border-white/[0.04]">
                {t.subject}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Ticket thread & reply */}
      <div className="lg:col-span-8">
        {activeTicket ? (
          (() => {
            const activeCust = getCustomerInfo(activeTicket.userId, activeTicket.userEmail, activeTicket.messages[0]?.senderName);

            return (
              <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] flex flex-col" style={{ height: 600 }}>
                {/* Header */}
                <div className="p-4 border-b border-white/[0.06] bg-zinc-950 flex items-center justify-between rounded-t-3xl gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeCust.avatar}
                      alt={activeCust.name}
                      className="h-11 w-11 rounded-2xl object-cover border border-white/20 shadow-md shrink-0 ring-2 ring-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">{activeCust.name}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                          {activeTicket.ticketNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{activeTicket.userEmail}</span>
                        <span>·</span>
                        <span className="text-slate-200 capitalize font-medium">{activeTicket.category.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>

                  {activeTicket.status !== 'closed' && (
                    <button
                      onClick={() => adminCloseTicket(activeTicket.id).then(() => showFeedback('success', 'Ticket closed.'))}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-xs text-slate-300 hover:text-white font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
                  {activeTicket.messages.map(msg => {
                    const isAgent = msg.sender === 'agent';
                    const avatarUrl = isAgent
                      ? 'https://ui-avatars.com/api/?name=SubNexus+Ops&background=2563eb&color=fff'
                      : activeCust.avatar;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img
                          src={avatarUrl}
                          alt={msg.senderName}
                          className="h-7 w-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5 shadow-sm"
                        />
                        <div className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                            <span className="text-[9px] text-slate-600">·</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed space-y-2 ${
                            isAgent
                              ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                              : 'bg-zinc-800 text-slate-200 border border-white/[0.08] rounded-tl-none shadow-sm'
                          }`}>
                            {msg.imageUrl && (
                              <div
                                onClick={() => setPreviewScreenshotUrl(msg.imageUrl!)}
                                className="rounded-xl overflow-hidden border border-white/20 cursor-pointer group/img relative"
                              >
                                <img
                                  src={msg.imageUrl}
                                  alt="Attachment"
                                  className="w-full max-h-52 object-cover group-hover/img:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                                  Click to enlarge proof
                                </div>
                              </div>
                            )}
                            {msg.content && <p>{msg.content}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Admin Reply Bar */}
                {activeTicket.status !== 'closed' ? (
                  <div className="p-3.5 border-t border-white/[0.06] bg-zinc-950 rounded-b-3xl space-y-2">
                    {ticketReplyImage && (
                      <div className="flex items-center gap-2 px-1">
                        <div className="relative inline-block rounded-xl overflow-hidden border border-white/20">
                          <img src={ticketReplyImage} alt="Attachment Preview" className="h-12 w-12 object-cover" />
                          <button
                            type="button"
                            onClick={() => setTicketReplyImage(null)}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">Compressed image attached</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        ref={ticketFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setIsCompressingTicketImage(true);
                          try {
                            const dataUrl = await compressImageToDataUrl(f, 750, 750, 0.65);
                            setTicketReplyImage(dataUrl);
                          } finally {
                            setIsCompressingTicketImage(false);
                            if (ticketFileInputRef.current) ticketFileInputRef.current.value = '';
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isCompressingTicketImage}
                        onClick={() => ticketFileInputRef.current?.click()}
                        className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
                        title="Attach compressed image / screenshot"
                      >
                        {isCompressingTicketImage ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : <ImageIcon className="h-4 w-4" />}
                      </button>

                      <input
                        value={ticketReply}
                        onChange={e => setTicketReply(e.target.value)}
                        placeholder={ticketReplyImage ? "Add a message or send image..." : "Type official admin reply to customer…"}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplyTicket(activeTicket.id); } }}
                      />
                      <button
                        onClick={() => handleReplyTicket(activeTicket.id)}
                        disabled={!ticketReply.trim() && !ticketReplyImage}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500 bg-zinc-950 border-t border-white/[0.06] rounded-b-3xl">
                    This support ticket is closed.
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="h-60 rounded-3xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-slate-500 text-sm">
            Select a ticket to view the conversation.
          </div>
        )}
      </div>
    </div>
  );
}
