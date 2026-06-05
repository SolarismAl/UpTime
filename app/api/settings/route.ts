import { NextResponse } from 'next/server';
const db = require('../../../lib/db');

export async function POST(req: Request) {
  const { webhookUrl } = await req.json();
  db.updateWebhook(webhookUrl);
  return NextResponse.json({ success: true });
}
