// Inbound Bank Feed: Banque Du Caire (BDC) SMS Webhook
// Path: app/api/webhooks/bdc-sms/route.ts
// Receives forwarded SMS messages from Banque Du Caire (BDC) sent via iPhone Shortcut automation.

export interface BankTransactionRecord {
  txNumber: string;
  amount: number;
  source: 'BDC';
  status: 'unclaimed' | 'claimed' | 'flagged';
  receivedAt: Date;
  rawSmsText?: string;
  sender?: string;
  claimedBy?: string;
}

// In-memory / Edge store fallback for serverless deployments
// (In production, replace with Prisma, Drizzle, or Supabase client)
const inMemoryBankTransactions = new Map<string, BankTransactionRecord>();

// Robust Arabic & English Parser for Banque Du Caire (BDC) SMS
export function parseBdcSms(text: string): { txNumber: string; amount: number } | null {
  if (!text || typeof text !== 'string') return null;

  // Clean text
  const clean = text.trim();

  // 1. Amount Extraction (EGP / جم / جنيه)
  let amount = 0;
  const amountPatterns = [
    /(?:مبلغ|قيد له|credited with|received|بمبلغ)\s*(?:EGP|جم|جنيه)?\s*([0-9]+(?:[\.,][0-9]{1,2})?)/i,
    /([0-9]+(?:[\.,][0-9]{1,2})?)\s*(?:EGP|جم|جنيه|جنيه مصري|LE)/i,
    /(?:EGP|LE)\s*([0-9]+(?:[\.,][0-9]{1,2})?)/i
  ];

  for (const pattern of amountPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const parsed = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // 2. Transaction Reference Number (رقم العملية / الرقم المرجعي)
  let txNumber = '';
  const txPatterns = [
    /(?:الرقم المرجعي للعملية|الرقم المرجعي|رقم العملية|المرجع|مرجع العملية|رمز العملية)[:\s]+([A-Za-z0-9]{6,26})/i,
    /(?:Transaction Ref|Txn Ref|Ref No|Reference ID|Reference Number|Ref)[:\s]+([A-Za-z0-9]{6,26})/i,
    /(?:عملية رقم|رقم)[:\s]+([0-9]{8,24})/i
  ];

  for (const pattern of txPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      txNumber = match[1].trim();
      break;
    }
  }

  // Fallback: look for 10-18 digit numeric sequences that aren't phone numbers (i.e. don't start with 010, 011, 012, 015)
  if (!txNumber) {
    const fallbackMatches = clean.match(/\b([1-9][0-9]{9,19})\b/g);
    if (fallbackMatches && fallbackMatches.length > 0) {
      txNumber = fallbackMatches[0];
    }
  }

  if (!txNumber || amount <= 0) {
    return null;
  }

  return { txNumber, amount };
}

// POST handler for iPhone Shortcut webhook
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Authentication token check from iPhone Shortcut header or body (optional secret)
    const authHeader = req.headers.get('x-bdc-secret') || body.secret;
    const expectedSecret = process.env.BDC_WEBHOOK_SECRET;
    if (expectedSecret && authHeader !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized webhook call.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract SMS message text
    // iPhone shortcuts send: { message: "...", sender: "BDC" } or { text: "..." }
    const smsText = body.message || body.text || body.sms || '';
    const sender = body.sender || 'BDC';

    if (!smsText) {
      return new Response(JSON.stringify({ error: 'Empty SMS message payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse BDC SMS
    const parsed = parseBdcSms(smsText);
    if (!parsed) {
      return new Response(JSON.stringify({
        error: 'Could not extract valid BDC transaction number or amount from SMS.',
        rawText: smsText
      }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { txNumber, amount } = parsed;

    // Check if transaction already exists (deduplication)
    if (inMemoryBankTransactions.has(txNumber)) {
      return new Response(JSON.stringify({
        success: true,
        status: 'duplicate',
        message: `Transaction ${txNumber} already logged in database.`,
        txNumber,
        amount
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert record into BankTransactions
    const record: BankTransactionRecord = {
      txNumber,
      amount,
      source: 'BDC',
      status: 'unclaimed',
      receivedAt: new Date(),
      rawSmsText: smsText,
      sender
    };

    inMemoryBankTransactions.set(txNumber, record);

    return new Response(JSON.stringify({
      success: true,
      status: 'inserted',
      message: `BDC Bank feed received. Transaction ${txNumber} recorded as unclaimed for ${amount} EGP.`,
      record: {
        txNumber: record.txNumber,
        amount: record.amount,
        source: record.source,
        status: record.status,
        receivedAt: record.receivedAt.toISOString()
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Internal server error processing BDC SMS webhook.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET handler to inspect recent transactions (admin/health check)
export async function GET() {
  const transactions = Array.from(inMemoryBankTransactions.values());
  return new Response(JSON.stringify({
    source: 'Banque Du Caire (BDC) SMS Feed',
    totalTransactions: transactions.length,
    unclaimedCount: transactions.filter(t => t.status === 'unclaimed').length,
    claimedCount: transactions.filter(t => t.status === 'claimed').length,
    transactions: transactions.slice(-20)
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
