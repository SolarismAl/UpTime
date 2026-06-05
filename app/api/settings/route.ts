import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { webhookUrl } = await req.json();
    await adminDb.collection('settings').doc('global').set({ webhookUrl }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
