import { NextRequest, NextResponse } from 'next/server';
import {
  TELEGRAM_CONFIG,
  formatTelegramChatMessage,
  formatTelegramOrderMessage,
  formatTelegramWarrantyMessage,
  getTelegramChatInlineKeyboard,
  TelegramChatAlertPayload,
  TelegramOrderAlertPayload,
  TelegramWarrantyAlertPayload,
} from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload, botToken: overrideToken } = body;

    const botToken = overrideToken ||
      process.env.TELEGRAM_BOT_TOKEN ||
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({
        success: false,
        warning: 'TELEGRAM_BOT_TOKEN is not configured in environment variables.',
      });
    }

    let textToSend = '';
    let imageUrlToSend = '';
    let replyMarkup: any = null;
    let targetChatId: string | number = payload?.groupId || TELEGRAM_CONFIG.defaultGroupId;
    let targetTopicId: number | undefined = payload?.topicId || TELEGRAM_CONFIG.defaultTopicId;

    if (type === 'chat_message') {
      const chatPayload = payload as TelegramChatAlertPayload;
      const isAssigned = !!chatPayload.assignedAgentId;

      if (isAssigned) {
        // Route message directly to the claimed agent's private Telegram chat
        targetChatId = chatPayload.assignedAgentId!;
        targetTopicId = undefined;
        textToSend = formatTelegramChatMessage(chatPayload, true);
        replyMarkup = getTelegramChatInlineKeyboard(chatPayload.threadId, true);
      } else {
        // Route message to group topic #749 for claiming
        targetChatId = TELEGRAM_CONFIG.defaultGroupId;
        targetTopicId = TELEGRAM_CONFIG.defaultTopicId;
        textToSend = formatTelegramChatMessage(chatPayload, false);
        replyMarkup = getTelegramChatInlineKeyboard(chatPayload.threadId, false);
      }

      imageUrlToSend = chatPayload.imageUrl || '';
    } else if (type === 'new_order') {
      textToSend = formatTelegramOrderMessage(payload as TelegramOrderAlertPayload);
      targetChatId = TELEGRAM_CONFIG.defaultGroupId;
      targetTopicId = TELEGRAM_CONFIG.defaultTopicId;
    } else if (type === 'warranty_claim') {
      textToSend = formatTelegramWarrantyMessage(payload as TelegramWarrantyAlertPayload);
      imageUrlToSend = (payload as TelegramWarrantyAlertPayload).imageUrl || '';
      targetChatId = TELEGRAM_CONFIG.defaultGroupId;
      targetTopicId = TELEGRAM_CONFIG.defaultTopicId;
    } else if (type === 'custom') {
      textToSend = payload?.text || 'Keyoon System Notification';
      targetChatId = payload?.chatId || TELEGRAM_CONFIG.defaultGroupId;
      targetTopicId = payload?.topicId ?? (targetChatId === TELEGRAM_CONFIG.defaultGroupId ? TELEGRAM_CONFIG.defaultTopicId : undefined);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid alert type' }, { status: 400 });
    }

    let tgResponse;

    if (imageUrlToSend && (imageUrlToSend.startsWith('http://') || imageUrlToSend.startsWith('https://'))) {
      const tgPayload: any = {
        chat_id: targetChatId,
        photo: imageUrlToSend,
        caption: textToSend,
        parse_mode: 'HTML',
      };
      if (targetTopicId !== undefined) tgPayload.message_thread_id = targetTopicId;
      if (replyMarkup) tgPayload.reply_markup = replyMarkup;

      tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(tgPayload),
      });
    } else {
      const tgPayload: any = {
        chat_id: targetChatId,
        text: textToSend,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      };
      if (targetTopicId !== undefined) tgPayload.message_thread_id = targetTopicId;
      if (replyMarkup) tgPayload.reply_markup = replyMarkup;

      tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(tgPayload),
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
