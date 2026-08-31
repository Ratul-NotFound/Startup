/**
 * Keyoon Platform — Telegram Support Bot Integration
 * Group: START up terget-1$ (ID: -1003904938537)
 * Topic: Keyoon Support Team (message_thread_id: 749)
 * Bot: Keyoon Support Bot
 */

export const TELEGRAM_CONFIG = {
  defaultGroupId: '-1003904938537',
  defaultTopicId: 749,
  groupName: 'START up terget-1$',
  topicName: 'Keyoon Support Team',
  botName: 'Keyoon Support Bot',
  defaultBotToken: '8675209196:AAFM0TiB5-QbTz2ga8qpCUujaBoM3NDpJS0',
};

export interface TelegramChatAlertPayload {
  customerName: string;
  customerEmail?: string;
  userId?: string;
  messageText: string;
  imageUrl?: string;
  threadId: string;
  orderContext?: string;
  activeSubscriptions?: string;
}

export interface TelegramOrderAlertPayload {
  orderNumber: string;
  items: { productName: string; durationLabel: string; quantity: number }[];
  totalUsd: number;
  totalBdt?: number;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  transactionId?: string;
  senderNumber?: string;
  isFree?: boolean;
}

export interface TelegramWarrantyAlertPayload {
  customerName: string;
  customerEmail: string;
  productName: string;
  subscriptionId?: string;
  issueDetails: string;
  imageUrl?: string;
  ticketId?: string;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format Customer Chat Message for Telegram Topic #749
 */
export function formatTelegramChatMessage(payload: TelegramChatAlertPayload): string {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `💬 <b>[LIVE CHAT MESSAGE]</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Customer:</b> ${escapeHtml(payload.customerName)}\n` +
    `📧 <b>Email:</b> <code>${escapeHtml(payload.customerEmail || 'Guest / Unverified')}</code>\n` +
    `🕒 <b>Time:</b> ${date} at ${time}\n` +
    (payload.orderContext ? `📦 <b>Latest Order:</b> ${escapeHtml(payload.orderContext)}\n` : '') +
    (payload.activeSubscriptions ? `🔑 <b>Active Services:</b> ${escapeHtml(payload.activeSubscriptions)}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📝 <b>Message:</b>\n` +
    `<blockquote>${escapeHtml(payload.messageText || (payload.imageUrl ? '📷 [Screenshot Attachment]' : ''))}</blockquote>\n` +
    (payload.imageUrl ? `📎 <b>Image Attachment Included:</b> Yes\n` : '') +
    `\n` +
    `⚡ <a href="https://keyoon.com/admin">Open Admin Messenger Hub & Reply</a>`;
}

/**
 * Format New Order Placed for Telegram Topic #749
 */
export function formatTelegramOrderMessage(payload: TelegramOrderAlertPayload): string {
  const itemsList = payload.items
    .map(i => `  • <b>${escapeHtml(i.productName)}</b> (${escapeHtml(i.durationLabel)}) ×${i.quantity}`)
    .join('\n');

  const amountStr = payload.isFree
    ? '🎁 FREE GIVEAWAY / 100% DISCOUNT'
    : (payload.totalBdt ? `৳${payload.totalBdt.toLocaleString()} BDT ($${payload.totalUsd.toFixed(2)})` : `$${payload.totalUsd.toFixed(2)} USD`);

  return `🛒 <b>[NEW ORDER PLACED #${payload.orderNumber}]</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Customer:</b> ${escapeHtml(payload.customerName)}\n` +
    `📧 <b>Email:</b> <code>${escapeHtml(payload.customerEmail)}</code>\n` +
    `💳 <b>Payment Gateway:</b> ${escapeHtml(payload.paymentMethod)}\n` +
    (payload.transactionId ? `🔢 <b>TrxID / Reference:</b> <code>${escapeHtml(payload.transactionId)}</code>\n` : '') +
    (payload.senderNumber ? `📱 <b>Sender Number:</b> <code>${escapeHtml(payload.senderNumber)}</code>\n` : '') +
    `💰 <b>Total Amount:</b> <b>${amountStr}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 <b>Ordered Products:</b>\n` +
    `${itemsList}\n\n` +
    `⚡ <a href="https://keyoon.com/admin">Open Admin to Verify & Deliver</a>`;
}

/**
 * Format Warranty Claim / Support Ticket for Telegram Topic #749
 */
export function formatTelegramWarrantyMessage(payload: TelegramWarrantyAlertPayload): string {
  return `🛡️ <b>[WARRANTY CLAIM / TICKET]</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Customer:</b> ${escapeHtml(payload.customerName)}\n` +
    `📧 <b>Email:</b> <code>${escapeHtml(payload.customerEmail)}</code>\n` +
    `🔑 <b>Product:</b> <b>${escapeHtml(payload.productName)}</b>\n` +
    (payload.subscriptionId ? `🏷️ <b>Subscription ID:</b> <code>${escapeHtml(payload.subscriptionId)}</code>\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚠️ <b>Issue Details:</b>\n` +
    `<blockquote>${escapeHtml(payload.issueDetails)}</blockquote>\n` +
    (payload.imageUrl ? `📎 <b>Photo Proof Attached:</b> Yes\n` : '') +
    `\n` +
    `⚡ <a href="https://keyoon.com/admin">Review Claim in Admin Dashboard</a>`;
}
