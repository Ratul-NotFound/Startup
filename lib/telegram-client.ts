import { TelegramChatAlertPayload, TelegramOrderAlertPayload, TelegramWarrantyAlertPayload } from './telegram';

/**
 * Fire-and-forget client-side helper to notify the Keyoon Telegram Support Topic #749
 */
export async function notifyTelegramChat(payload: TelegramChatAlertPayload) {
  try {
    fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat_message', payload }),
    }).catch(() => {});
  } catch {}
}

export async function notifyTelegramOrder(payload: TelegramOrderAlertPayload) {
  try {
    fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'new_order', payload }),
    }).catch(() => {});
  } catch {}
}

export async function notifyTelegramWarranty(payload: TelegramWarrantyAlertPayload) {
  try {
    fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'warranty_claim', payload }),
    }).catch(() => {});
  } catch {}
}
