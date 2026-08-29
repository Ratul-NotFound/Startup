import { Order, CustomerProfile, UserSubscription, BangladeshPaymentMethod, QuickMessage } from '@/types';

export interface DynamicChatContext {
  user: CustomerProfile;
  orders: Order[];
  subscriptions: UserSubscription[];
  paymentMethods: BangladeshPaymentMethod[];
  quickMessages: QuickMessage[];
}

/**
 * Replaces dynamic placeholders like {ORDER_NUMBER}, {BKASH_NUMBER}, {CUSTOMER_NAME}
 * with live real-time store data.
 */
export function interpolateDynamicVariables(text: string, ctx: DynamicChatContext, targetOrder?: Order | null): string {
  if (!text) return '';

  const latestOrder = targetOrder || (ctx.orders && ctx.orders.length > 0 ? ctx.orders[0] : null);
  const bkash = ctx.paymentMethods.find(p => p.name.toLowerCase().includes('bkash') && p.isActive);
  const nagad = ctx.paymentMethods.find(p => p.name.toLowerCase().includes('nagad') && p.isActive);
  const rocket = ctx.paymentMethods.find(p => p.name.toLowerCase().includes('rocket') && p.isActive);

  const orderItemsStr = latestOrder
    ? latestOrder.items.map(i => `${i.productName} (${i.durationLabel}) ×${i.quantity}`).join(', ')
    : 'No recent orders';

  const orderTotalStr = latestOrder
    ? (latestOrder.totalBdt ? `৳${latestOrder.totalBdt.toLocaleString()} BDT` : `$${latestOrder.total.toFixed(2)} USD`)
    : '$0.00';

  const orderStatusStr = latestOrder
    ? (latestOrder.paymentStatus === 'paid' ? 'PAID & DELIVERED' : latestOrder.paymentStatus === 'pending' ? 'VERIFYING TRXID' : latestOrder.paymentStatus.toUpperCase())
    : 'NO ORDERS';

  const activeServicesList = ctx.subscriptions && ctx.subscriptions.length > 0
    ? ctx.subscriptions.filter(s => s.status === 'active').map(s => s.productName).join(', ')
    : 'None yet';

  let result = text;

  // Replacements
  result = result.replace(/\{ORDER_NUMBER\}/gi, latestOrder ? `#${latestOrder.orderNumber}` : '#N/A');
  result = result.replace(/\{ORDER_ID\}/gi, latestOrder ? `#${latestOrder.orderNumber}` : '#N/A');
  result = result.replace(/\{ORDER_STATUS\}/gi, orderStatusStr);
  result = result.replace(/\{ORDER_ITEMS\}/gi, orderItemsStr);
  result = result.replace(/\{ORDER_TOTAL\}/gi, orderTotalStr);
  result = result.replace(/\{TOTAL_AMOUNT\}/gi, orderTotalStr);
  result = result.replace(/\{TRX_ID\}/gi, latestOrder?.transactionId || 'Pending submission');
  result = result.replace(/\{SENDER_PHONE\}/gi, latestOrder?.senderNumber || 'N/A');
  result = result.replace(/\{PAYMENT_METHOD\}/gi, latestOrder?.paymentMethodName || latestOrder?.paymentMethod || 'bKash / Nagad');

  result = result.replace(/\{BKASH_NUMBER\}/gi, bkash ? `${bkash.accountNumber} (${bkash.accountType})` : '01700000000');
  result = result.replace(/\{NAGAD_NUMBER\}/gi, nagad ? `${nagad.accountNumber} (${nagad.accountType})` : '01800000000');
  result = result.replace(/\{ROCKET_NUMBER\}/gi, rocket ? `${rocket.accountNumber} (${rocket.accountType})` : '01900000000');

  result = result.replace(/\{CUSTOMER_NAME\}/gi, ctx.user?.name || 'Customer');
  result = result.replace(/\{CUSTOMER_EMAIL\}/gi, ctx.user?.email || 'customer@service.com');
  result = result.replace(/\{STORE_NAME\}/gi, 'Keyoon');
  result = result.replace(/subnexus/gi, 'Keyoon');

  return result;
}

/**
 * Intelligent entity extraction and dynamic answer resolver
 */
export function resolveSmartAssistantResponse(queryText: string, ctx: DynamicChatContext): string {
  const q = queryText.toLowerCase().trim();

  // 1. Check if user provided a specific Order Number (e.g. "#1004", "ORD-1004", "order 1004", "1004")
  const orderNumMatch = q.match(/(?:ord(?:er)?[-_#\s]*|[#])?(\d{4,8})/i);
  if (orderNumMatch && (q.includes('order') || q.includes('status') || q.includes('track') || q.includes('#') || q.includes('ord'))) {
    const searchedNumber = orderNumMatch[1];
    const foundOrder = ctx.orders.find(o =>
      o.orderNumber.includes(searchedNumber) ||
      o.id.toLowerCase().includes(searchedNumber.toLowerCase())
    );

    if (foundOrder) {
      const itemsFormatted = foundOrder.items.map(i => `• ${i.productName} (${i.durationLabel}) ×${i.quantity}`).join('\n');
      const isPaid = foundOrder.paymentStatus === 'paid';
      const totalStr = foundOrder.totalBdt ? `৳${foundOrder.totalBdt.toLocaleString()} BDT` : `$${foundOrder.total.toFixed(2)} USD`;
      const dateStr = new Date(foundOrder.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

      return `📦 Live Order Status for #${foundOrder.orderNumber}:\n\n${itemsFormatted}\n\n• Payment: [${isPaid ? 'PAID & VERIFIED' : 'VERIFYING TRXID'}]\n• Delivery: ${foundOrder.deliveryStatus === 'delivered' ? 'Delivered to Vault' : foundOrder.deliveryStatus}\n• Gateway: ${foundOrder.paymentMethodName || foundOrder.paymentMethod} (TrxID: ${foundOrder.transactionId || 'N/A'})\n• Total: ${totalStr}\n• Placed: ${dateStr}\n\n${isPaid ? '✅ Your credentials are active in your Vault. Click "Vault" in the top bar to copy your login.' : '⏳ Admin ops are reviewing your payment and credentials will be released shortly.'}`;
    }
  }

  // 2. Specific TrxID query match
  if ((q.includes('trx') || q.includes('transaction') || q.includes('reference')) && q.length > 5) {
    const matchingOrder = ctx.orders.find(o => o.transactionId && q.includes(o.transactionId.toLowerCase().trim()));
    if (matchingOrder) {
      return `💳 Found record for TrxID [${matchingOrder.transactionId}] in Order #${matchingOrder.orderNumber}:\n• Status: ${matchingOrder.paymentStatus.toUpperCase()}\n• Amount: ${matchingOrder.totalBdt ? `৳${matchingOrder.totalBdt} BDT` : `$${matchingOrder.total}`}\n• Delivery: ${matchingOrder.deliveryStatus === 'delivered' ? 'Delivered to Vault' : 'In Verification'}`;
    }
  }

  // 3. Inquiries about payment numbers / wallets
  if (q.includes('number') && (q.includes('bkash') || q.includes('nagad') || q.includes('rocket') || q.includes('wallet') || q.includes('pay'))) {
    const activePms = ctx.paymentMethods.filter(p => p.isActive);
    if (activePms.length > 0) {
      const pmList = activePms.map(p => `• ${p.name} (${p.accountType}): ${p.accountNumber}`).join('\n');
      return `💳 Current Official Keyoon Payment Gateways:\n\n${pmList}\n\n⚡ Send the exact order amount and submit your TrxID in the checkout modal for instant 2-minute verification!`;
    }
  }

  // 4. Inquiries about user subscriptions / vault credentials
  if (q.includes('my subscription') || q.includes('my password') || q.includes('my credential') || q.includes('my account') || q.includes('my vault')) {
    const activeSubs = ctx.subscriptions.filter(s => s.status === 'active');
    if (activeSubs.length > 0) {
      const subsList = activeSubs.map(s => `• ${s.productName} (${s.planDuration}) — Status: Active`).join('\n');
      return `🔑 You have ${activeSubs.length} active subscription(s) in your Keyoon Vault:\n\n${subsList}\n\n👉 Click the "Vault" icon in the top header or go to your Dashboard to reveal your login credentials, password, and profile PIN!`;
    } else {
      return `🔑 You do not have any active subscriptions yet. Browse our catalog to activate ChatGPT Plus, Netflix 4K, Claude 3.5, and more with instant delivery!`;
    }
  }

  // 5. Match against dynamic quickMessages from Firestore
  const activeChips = ctx.quickMessages.filter(qm => qm.isActive);

  // Exact Match
  for (const qm of activeChips) {
    if (qm.query.toLowerCase().trim() === q || qm.label.toLowerCase().trim() === q) {
      return interpolateDynamicVariables(qm.answer, ctx);
    }
  }

  // Keyword Overlap Match
  for (const qm of activeChips) {
    if (qm.keywords && qm.keywords.length > 0) {
      const hasKeyword = qm.keywords.some(kw => q.includes(kw.toLowerCase().trim()));
      if (hasKeyword) {
        return interpolateDynamicVariables(qm.answer, ctx);
      }
    }
  }

  // 6. Fallback standard intelligent assistant response with user context
  if (ctx.orders && ctx.orders.length > 0) {
    const latest = ctx.orders[0];
    return `Got your message, ${ctx.user?.name || 'there'}! A live Keyoon Support Specialist has been notified and will assist you shortly.\n\n(FYI: Your latest Order #${latest.orderNumber} is currently [${latest.paymentStatus.toUpperCase()} - ${latest.deliveryStatus.toUpperCase()}])`;
  }

  return `Got your message, ${ctx.user?.name || 'there'}! A live Keyoon Support Specialist has been alerted and will assist you right here shortly.`;
}
