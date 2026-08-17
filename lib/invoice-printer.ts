import { Order } from '@/types';

/**
 * Generates an isolated, single-page professional PDF/Print invoice
 * without printing background website pages or duplicating pages.
 */
export function printCleanInvoice(order: Order) {
  if (typeof window === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPaid = order.paymentStatus === 'paid';
  const totalBdtText = order.totalBdt ? `৳${order.totalBdt.toLocaleString()} BDT` : '';
  const totalUsdText = `$${order.total.toFixed(2)} USD`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Invoice #${order.orderNumber} - Keyoon</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 24px;
            font-size: 13px;
            line-height: 1.4;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .brand-title span {
            color: #06b6d4;
          }
          .brand-subtitle {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
            margin-top: 2px;
          }
          .invoice-tag {
            text-align: right;
          }
          .invoice-tag h1 {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
          }
          .invoice-tag p {
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            color: #0284c7;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .meta-col p {
            margin-bottom: 6px;
            font-size: 12px;
          }
          .meta-col p strong {
            color: #475569;
            display: inline-block;
            width: 120px;
          }
          .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${isPaid ? '#dcfce7' : '#fef3c7'};
            color: ${isPaid ? '#15803d' : '#b45309'};
            border: 1px solid ${isPaid ? '#86efac' : '#fcd34d'};
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background: #0f172a;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 14px;
            text-align: left;
          }
          th:last-child {
            text-align: right;
          }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
          }
          td:last-child {
            text-align: right;
            font-family: monospace;
            font-weight: 700;
          }
          .summary-card {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }
          .summary-box {
            width: 280px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 6px;
            color: #475569;
          }
          .summary-total {
            display: flex;
            justify-content: space-between;
            font-size: 15px;
            font-weight: 900;
            color: #0f172a;
            border-top: 2px solid #cbd5e1;
            padding-top: 8px;
            margin-top: 8px;
          }
          .footer-note {
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
          }
          .stamp {
            display: inline-block;
            font-family: monospace;
            font-size: 10px;
            color: #0284c7;
            font-weight: bold;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand-title">KEYOON<span>.</span></div>
            <div class="brand-subtitle">Official Digital Subscriptions & Licensing · keyoon.com</div>
          </div>
          <div class="invoice-tag">
            <h1>TAX INVOICE</h1>
            <p>#${order.orderNumber}</p>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="meta-grid">
          <div class="meta-col">
            <p><strong>Customer:</strong> ${order.userEmail}</p>
            <p><strong>Order Date:</strong> ${dateFormatted}</p>
            <p><strong>Payment Gateway:</strong> ${order.paymentMethodName || order.paymentMethod}</p>
          </div>
          <div class="meta-col">
            <p><strong>Payment Status:</strong> <span class="status-badge">${isPaid ? 'PAID & VERIFIED' : 'PENDING REVIEW'}</span></p>
            ${order.senderNumber ? `<p><strong>Sender Phone:</strong> <span style="font-family: monospace; font-weight: bold;">${order.senderNumber}</span></p>` : ''}
            ${order.transactionId ? `<p><strong>TrxID / Ref:</strong> <span style="font-family: monospace; font-weight: bold; color: #0284c7;">${order.transactionId}</span></p>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th>Item / Subscription</th>
              <th>Duration</th>
              <th style="text-align: center;">Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td><strong>${item.productName}</strong></td>
                <td>${item.durationLabel}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="font-family: monospace;">$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-card">
          <div class="summary-box">
            <div class="summary-row">
              <span>Subtotal</span>
              <span style="font-family: monospace;">$${order.subtotal ? order.subtotal.toFixed(2) : order.total.toFixed(2)}</span>
            </div>
            ${order.discount ? `
              <div class="summary-row" style="color: #16a34a;">
                <span>Promo Discount</span>
                <span style="font-family: monospace;">-$${order.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="summary-total">
              <span>Amount Paid</span>
              <div style="text-align: right;">
                <div>${totalUsdText}</div>
                ${totalBdtText ? `<div style="font-size: 11px; color: #059669; font-weight: bold;">(${totalBdtText})</div>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-note">
          <p>Thank you for your business with Keyoon!</p>
          <p>Your subscription credentials and license details are securely stored in your private <strong>Keyoon Vault</strong>.</p>
          <div class="stamp">Verified Electronic Receipt · 100% Replacement Warranty Active · support@keyoon.com</div>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 400);
}
