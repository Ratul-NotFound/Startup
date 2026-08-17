/**
 * Patch admin/page.tsx with the order processing upgrade changes
 * Uses line-number based surgical edits to avoid string matching issues.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app', 'admin', 'page.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\r\n');
// Also handle LF-only
if (lines.length < 100) lines = fs.readFileSync(file, 'utf8').split('\n');

console.log('Total lines:', lines.length);

function findLine(pattern, startFrom = 0) {
  for (let i = startFrom; i < lines.length; i++) {
    if (lines[i].includes(pattern)) return i;
  }
  return -1;
}

function replaceRange(startPattern, endPattern, startFrom, newLines) {
  const start = findLine(startPattern, startFrom);
  if (start < 0) { console.error('START not found:', startPattern); return false; }
  const end = findLine(endPattern, start + 1);
  if (end < 0) { console.error('END not found:', endPattern); return false; }
  console.log(`Replacing lines ${start+1}-${end+1}`);
  lines.splice(start, end - start + 1, ...newLines);
  return true;
}

// ─── Change 1: Destructuring — add adminVerifyPayment ─────────────────────
{
  const i = findLine("allOrders, adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminRejectOrder,");
  if (i >= 0) {
    lines[i] = lines[i].replace(
      "allOrders, adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminRejectOrder,",
      "allOrders, adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminVerifyPayment, adminRejectOrder,"
    );
    console.log("✓ Change 1: updated destructuring at line", i+1);
  } else console.error("✗ Change 1 pattern not found");
}

// ─── Change 2: State — replace provisionCreds with perItemCreds ───────────
{
  const i = findLine("const [provisionCreds, setProvisionCreds]");
  if (i >= 0) {
    lines.splice(i, 1,
      "  // Per-item credentials (one entry per order line item)",
      "  const [perItemCreds, setPerItemCreds] = useState<Array<{ email: string; password: string; pinCode: string; profileName: string; notes: string }>>([]); ",
      "  const [approvalStep, setApprovalStep] = useState<'verify' | 'credentials' | 'confirm'>('verify');",
      "  const [rejectionReason, setRejectionReason] = useState('');",
      "  const [showRejectionInput, setShowRejectionInput] = useState(false);",
      "  const [showItemPassword, setShowItemPassword] = useState<Record<number, boolean>>({});"
    );
    console.log("✓ Change 2: replaced state at line", i+1);
  } else console.error("✗ Change 2 pattern not found");
}

// Re-read line numbers after splice
// ─── Change 3: Order amount <td> — add coupon display ─────────────────────
{
  const amtEnd = findLine("{o.paymentMethodName || o.paymentMethod}", findLine("font-black text-white font-mono text-xs"));
  if (amtEnd >= 0) {
    // Insert after </div>\n</td> of the payment method div — find the closing </td>
    const tdClose = findLine("</td>", amtEnd);
    if (tdClose >= 0) {
      lines.splice(tdClose, 0,
        "                            {o.couponCode && (",
        "                              <div className=\"mt-1 flex items-center gap-1\">",
        "                                <span className=\"text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-500/20\">",
        "                                  \uD83C\uDFF7\uFE0F {o.couponCode}",
        "                                </span>",
        "                                {o.couponDiscount != null && (",
        "                                  <span className=\"text-[10px] text-emerald-400 font-bold\">",
        "                                    -{o.couponDiscount > 1 ? `\u09F3${o.couponDiscount}` : `${(o.couponDiscount * 100).toFixed(0)}%`} off",
        "                                  </span>",
        "                                )}",
        "                              </div>",
        "                            )}"
      );
      console.log("✓ Change 3: added coupon display after line", tdClose+1);
    } else console.error("✗ Change 3 td close not found");
  } else console.error("✗ Change 3 amount td not found");
}

// ─── Change 4: TrxID — make it clickable button ───────────────────────────
{
  const trxSpanLine = findLine("font-mono text-cyan-300 font-bold text-xs bg-cyan-950/40");
  if (trxSpanLine >= 0) {
    const trxSpanOpen = findLine("<span className", trxSpanLine - 1);
    const trxSpanClose = findLine("</span>", trxSpanLine);
    if (trxSpanOpen >= 0 && trxSpanClose >= 0) {
      lines.splice(trxSpanOpen, trxSpanClose - trxSpanOpen + 1,
        "                              <button",
        "                                type=\"button\"",
        "                                onClick={() => { navigator.clipboard.writeText(o.transactionId!); showFeedback('success', 'TrxID copied!'); }}",
        "                                className=\"font-mono text-cyan-300 font-bold text-xs bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/20 uppercase tracking-wider hover:bg-cyan-900/40 transition-colors cursor-pointer\"",
        "                                title=\"Click to copy Transaction ID\"",
        "                              >",
        "                                {o.transactionId}",
        "                              </button>"
      );
      console.log("✓ Change 4: TrxID made clickable at line", trxSpanOpen+1);
    } else console.error("✗ Change 4 span lines not found");
  } else console.error("✗ Change 4 pattern not found");
}

// ─── Change 5: Status <td> — add paymentVerifiedAt and rejectionReason ────
{
  const statusClose = findLine("</span>", findLine("{o.paymentStatus}"));
  if (statusClose >= 0) {
    const tdClose = findLine("</td>", statusClose);
    if (tdClose >= 0) {
      lines.splice(tdClose, 0,
        "                            {o.paymentVerifiedAt && o.paymentStatus === 'pending' && (",
        "                              <div className=\"text-[10px] text-emerald-400 font-bold mt-0.5\">\u2713 Pmt verified</div>",
        "                            )}",
        "                            {o.rejectionReason && (",
        "                              <div className=\"text-[10px] text-red-400 mt-0.5 max-w-[120px] truncate\" title={o.rejectionReason}>",
        "                                \u2717 {o.rejectionReason}",
        "                              </div>",
        "                            )}"
      );
      console.log("✓ Change 5: status indicators at line", tdClose+1);
    } else console.error("✗ Change 5 td close not found");
  } else console.error("✗ Change 5 status span not found");
}

// ─── Change 6: Replace the entire actions <td> (pending branch) ───────────
{
  // Find: onClick={async () => { setApprovingOrderId(o.id);
  const approveStart = findLine("setApprovingOrderId(o.id);");
  const provisionCredsLine = findLine("setProvisionCreds({ email: o.userEmail");
  const promptLine = findLine("const reason = prompt(");
  const rejectFeedbackLine = findLine("showFeedback('error', `Order #${o.orderNumber} rejected.`);");
  
  if (approveStart >= 0 && provisionCredsLine >= 0 && rejectFeedbackLine >= 0) {
    // find the <button> tag before approveStart
    let btnStart = approveStart;
    while (btnStart > 0 && !lines[btnStart].trim().startsWith('<button')) btnStart--;
    
    // find the closing </div> of the isPending branch (after rejectFeedbackLine)
    let pendingDivClose = findLine("</div>", rejectFeedbackLine + 3);
    
    console.log(`Replacing actions from line ${btnStart+1} to ${pendingDivClose+1}`);
    
    lines.splice(btnStart, pendingDivClose - btnStart + 1,
      "                                <button",
      "                                  onClick={() => {",
      "                                    const initCreds = o.items.map(() => ({ email: o.userEmail || '', password: '', pinCode: '', profileName: '', notes: '' }));",
      "                                    setPerItemCreds(initCreds);",
      "                                    setApprovalStep('verify');",
      "                                    setRejectionReason('');",
      "                                    setShowRejectionInput(false);",
      "                                    setCustomProvisionOrder(o);",
      "                                  }}",
      "                                  disabled={approvingOrderId === o.id}",
      "                                  className=\"px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer\"",
      "                                >",
      "                                  {approvingOrderId === o.id ? <Loader2 className=\"h-3.5 w-3.5 animate-spin\" /> : <Check className=\"h-3.5 w-3.5\" />}",
      "                                  <span>Approve &amp; Deliver</span>",
      "                                </button>",
      "                                <button",
      "                                  onClick={() => {",
      "                                    const initCreds = o.items.map(() => ({ email: '', password: '', pinCode: '', profileName: '', notes: '' }));",
      "                                    setPerItemCreds(initCreds);",
      "                                    setApprovalStep('verify');",
      "                                    setShowRejectionInput(true);",
      "                                    setRejectionReason('');",
      "                                    setCustomProvisionOrder(o);",
      "                                  }}",
      "                                  className=\"px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 font-bold text-xs transition-colors\"",
      "                                  title=\"Reject order\"",
      "                                >",
      "                                  <X className=\"h-3.5 w-3.5\" />",
      "                                </button>",
      "                              </div>"
    );
    console.log("✓ Change 6: replaced pending action buttons");
  } else console.error("✗ Change 6 patterns not found. approveStart:", approveStart, "provisionCreds:", provisionCredsLine, "rejectFeedback:", rejectFeedbackLine);
}

// ─── Change 7: Add re-provision button to delivered branch ────────────────
{
  const invoiceBtn = findLine("printCleanInvoice(o)");
  if (invoiceBtn >= 0) {
    const invoiceBtnClose = findLine("</button>", invoiceBtn);
    if (invoiceBtnClose >= 0) {
      lines.splice(invoiceBtnClose + 1, 0,
        "                                {o.paymentStatus === 'paid' && (",
        "                                  <button",
        "                                    type=\"button\"",
        "                                    onClick={() => {",
        "                                      const initCreds = o.items.map(() => ({ email: o.userEmail || '', password: '', pinCode: '', profileName: '', notes: '' }));",
        "                                      setPerItemCreds(initCreds);",
        "                                      setApprovalStep('credentials');",
        "                                      setCustomProvisionOrder(o);",
        "                                    }}",
        "                                    className=\"px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-cyan-950/60 text-slate-400 hover:text-cyan-400 border border-white/10 flex items-center gap-1 font-bold text-[10px] cursor-pointer\"",
        "                                    title=\"Re-provision credentials\"",
        "                                  >",
        "                                    <Edit2 className=\"h-3 w-3\" /><span>Re-provision</span>",
        "                                  </button>",
        "                                )}"
      );
      console.log("✓ Change 7: added re-provision button after line", invoiceBtnClose+1);
    } else console.error("✗ Change 7 invoice button close not found");
  } else console.error("✗ Change 7 printCleanInvoice not found");
}

// Write back
const eol = '\r\n';
fs.writeFileSync(file, lines.join(eol), 'utf8');
console.log('\n✅ All changes applied. Total lines:', lines.length);
