import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import {
  TELEGRAM_CONFIG,
  getTelegramChatInlineKeyboard,
  escapeHtml,
} from '@/lib/telegram';
import { CustomerChatThread, ChatMessage } from '@/types';
import { cleanFirestoreData } from '@/context/AppContext';

export async function POST(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ ok: false, warning: 'TELEGRAM_BOT_TOKEN not configured' });
  }

  try {
    const update = await req.json();

    // ─── 1. Handle Inline Button Clicks (callback_query) ────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const callbackId = cb.id;
      const data = cb.data || '';
      const from = cb.from;
      const agentId = from.id;
      const agentName = (from.first_name || 'Agent') + (from.last_name ? ` ${from.last_name}` : '') + (from.username ? ` (@${from.username})` : '');
      const agentUsername = from.username || '';

      // ─── Claim Action: `claim:<threadId>` ───
      if (data.startsWith('claim:')) {
        const threadId = data.replace('claim:', '');
        const threadRef = doc(db, 'chats', threadId);
        const threadSnap = await getDoc(threadRef);

        let customerName = 'Customer';
        let messagesList: ChatMessage[] = [];

        if (threadSnap.exists()) {
          const tData = threadSnap.data() as CustomerChatThread;
          customerName = tData.userName || tData.userEmail || 'Customer';
          messagesList = tData.messages || [];

          // Save assignment to Firestore
          await setDoc(threadRef, cleanFirestoreData({
            assignedAgentId: agentId,
            assignedAgentName: agentName,
            assignedAgentUsername: agentUsername,
            claimedAt: new Date().toISOString(),
            telegramGroupMessageId: cb.message?.message_id,
          }), { merge: true });
        }

        // 1. Answer Telegram callback popup
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: `✅ You have claimed ${customerName}! Messages are now routed to your private chat.`,
            show_alert: true,
          }),
        });

        // 2. Update Group Topic Message to show Claimed status
        if (cb.message?.chat?.id && cb.message?.message_id) {
          const editedGroupText = `✅ <b>[CUSTOMER CLAIMED]</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 <b>Customer:</b> ${escapeHtml(customerName)}\n` +
            `👨‍💼 <b>Claimed by:</b> ${escapeHtml(agentName)}\n` +
            `🕒 <b>Claimed at:</b> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `<i>All future messages from this customer are now routed directly to ${escapeHtml(agentName)} in private DM.</i>`;

          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
              chat_id: cb.message.chat.id,
              message_id: cb.message.message_id,
              text: editedGroupText,
              parse_mode: 'HTML',
            }),
          });
        }

        // 3. Send Direct Message to the Agent's personal Telegram chat with chat history
        const recentMsgs = messagesList.slice(-6).map(m => {
          const senderLabel = m.sender === 'user' ? `👤 ${escapeHtml(customerName)}` : `🎧 ${escapeHtml(m.senderName)}`;
          return `<b>${senderLabel}:</b> ${escapeHtml(m.content || '[Attachment]')}`;
        }).join('\n');

        const dmText = `🎉 <b>You have claimed customer [${escapeHtml(customerName)}]!</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💬 <b>Recent Conversation History:</b>\n` +
          (recentMsgs || '<i>No previous messages.</i>') + `\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `✍️ <b>How to reply:</b> Just type and send your reply directly here in this chat. It will instantly appear in the customer's live chat window on the website!`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            chat_id: agentId,
            text: dmText,
            parse_mode: 'HTML',
            reply_markup: getTelegramChatInlineKeyboard(threadId, true),
          }),
        });

        return NextResponse.json({ ok: true });
      }

      // ─── Unclaim Action: `unclaim:<threadId>` ───
      if (data.startsWith('unclaim:')) {
        const threadId = data.replace('unclaim:', '');
        const threadRef = doc(db, 'chats', threadId);
        const threadSnap = await getDoc(threadRef);

        let customerName = 'Customer';
        if (threadSnap.exists()) {
          const tData = threadSnap.data() as CustomerChatThread;
          customerName = tData.userName || tData.userEmail || 'Customer';

          // Clear assignment in Firestore
          await setDoc(threadRef, {
            assignedAgentId: null,
            assignedAgentName: null,
            assignedAgentUsername: null,
            claimedAt: null,
          }, { merge: true });
        }

        // 1. Answer Telegram callback popup
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: `🔓 Customer ${customerName} has been unclaimed.`,
          }),
        });

        // 2. Notify the Agent in DM
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            chat_id: agentId,
            text: `🔓 <b>Customer [${escapeHtml(customerName)}] is now unclaimed</b> and returned to the group pool.`,
            parse_mode: 'HTML',
          }),
        });

        // 3. Repost Claim prompt back to Group Topic #749
        const groupAlertText = `📢 <b>[CUSTOMER UNCLAIMED & AVAILABLE]</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 <b>Customer:</b> ${escapeHtml(customerName)}\n` +
          `⚠️ <i>This customer was released and is now available for anyone to claim:</i>`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CONFIG.defaultGroupId,
            message_thread_id: TELEGRAM_CONFIG.defaultTopicId,
            text: groupAlertText,
            parse_mode: 'HTML',
            reply_markup: getTelegramChatInlineKeyboard(threadId, false),
          }),
        });

        return NextResponse.json({ ok: true });
      }
    }

    // ─── 2. Handle Agent Direct Messages (Reply from Telegram to Live Chat) ──
    if (update.message && update.message.chat?.type === 'private') {
      const msg = update.message;
      const agentId = msg.from.id;
      const agentName = (msg.from.first_name || 'Agent') + (msg.from.last_name ? ` ${msg.from.last_name}` : '');
      const text = msg.text?.trim() || '';

      if (text === '/start') {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            chat_id: agentId,
            text: `👋 <b>Keyoon Live Support Bot Hub</b>\n\nWhen you click <b>[Claim Customer]</b> in the group topic, their messages will arrive here. Any message you type here will immediately send to the customer on the website live chat in real-time!`,
            parse_mode: 'HTML',
          }),
        });
        return NextResponse.json({ ok: true });
      }

      if (!text) {
        return NextResponse.json({ ok: true });
      }

      // Find the active customer thread currently claimed by this agent
      const chatsCol = collection(db, 'chats');
      const q = query(chatsCol, where('assignedAgentId', '==', agentId));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        // Agent has an active claimed customer
        const activeDoc = qSnap.docs[0];
        const threadId = activeDoc.id;
        const threadData = activeDoc.data() as CustomerChatThread;
        const nowIso = new Date().toISOString();

        const newChatMessage: ChatMessage = {
          id: `msg_tg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sender: 'agent',
          senderName: agentName,
          content: text,
          timestamp: nowIso,
        };

        const updatedMessages = [...(threadData.messages || []), newChatMessage];

        await setDoc(doc(db, 'chats', threadId), cleanFirestoreData({
          lastMessageText: text,
          lastMessageSender: 'agent',
          lastMessageTimestamp: nowIso,
          updatedAt: nowIso,
          unreadCountUser: (threadData.unreadCountUser || 0) + 1,
          unreadCountAdmin: 0,
          messages: updatedMessages,
        }), { merge: true });

        // Confirm delivery to the agent with a checkmark reply
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            chat_id: agentId,
            text: `✅ <i>Delivered to ${escapeHtml(threadData.userName || 'Customer')} on website</i>`,
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id,
          }),
        });
      } else {
        // Agent does not have an active claimed customer
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            chat_id: agentId,
            text: `ℹ️ <i>You currently do not have any active claimed customer. Please check the <b>${TELEGRAM_CONFIG.groupName} &gt; ${TELEGRAM_CONFIG.topicName}</b> topic to claim incoming customer inquiries.</i>`,
            parse_mode: 'HTML',
          }),
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Telegram Webhook Error]:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Webhook internal error' }, { status: 500 });
  }
}
