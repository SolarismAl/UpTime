import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url, payload } = await req.json();

    if (!url || !payload) {
      return NextResponse.json({ error: 'Missing url or payload' }, { status: 400 });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Webhook failed: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
