import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN is not configured.' }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const webhookUrl = `${origin}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: false,
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      ok: data.ok,
      webhookUrl,
      telegramResult: data,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
