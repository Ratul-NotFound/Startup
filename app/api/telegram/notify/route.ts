import { NextRequest, NextResponse } from 'next/server';
import {
  TELEGRAM_CONFIG,
  formatTelegramChatMessage,
  formatTelegramOrderMessage,
  formatTelegramWarrantyMessage,
  TelegramChatAlertPayload,
  TelegramOrderAlertPayload,
  TelegramWarrantyAlertPayload,
} from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload, botToken: overrideToken } = body;

    const botToken = overrideToken || process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      // Bot token not configured yet — return graceful warning instead of 500
      return NextResponse.json({
        success: false,
        warning: 'TELEGRAM_BOT_TOKEN is not configured in environment variables.',
      });
    }

    let textToSend = '';
    let imageUrlToSend = '';

    if (type === 'chat_message') {
      textToSend = formatTelegramChatMessage(payload as TelegramChatAlertPayload);
      imageUrlToSend = (payload as TelegramChatAlertPayload).imageUrl || '';
    } else if (type === 'new_order') {
      textToSend = formatTelegramOrderMessage(payload as TelegramOrderAlertPayload);
    } else if (type === 'warranty_claim') {
      textToSend = formatTelegramWarrantyMessage(payload as TelegramWarrantyAlertPayload);
      imageUrlToSend = (payload as TelegramWarrantyAlertPayload).imageUrl || '';
    } else if (type === 'custom') {
      textToSend = payload?.text || 'Keyoon System Notification';
    } else {
      return NextResponse.json({ success: false, error: 'Invalid alert type' }, { status: 400 });
    }

    const chatId = payload?.groupId || TELEGRAM_CONFIG.defaultGroupId;
    const topicId = payload?.topicId || TELEGRAM_CONFIG.defaultTopicId;

    let tgResponse;

    // If image is attached, send as Photo with caption, else send as HTML text message
    if (imageUrlToSend && (imageUrlToSend.startsWith('http://') || imageUrlToSend.startsWith('https://'))) {
      tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          photo: imageUrlToSend,
          caption: textToSend,
          parse_mode: 'HTML',
        }),
      });
    } else {
      tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          text: textToSend,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
    }

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      console.warn('[Telegram API Error]:', tgData);
      return NextResponse.json({ success: false, telegramError: tgData }, { status: 400 });
    }

    return NextResponse.json({ success: true, messageId: tgData.result?.message_id });
  } catch (err: any) {
    console.error('[Telegram Dispatch Exception]:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
