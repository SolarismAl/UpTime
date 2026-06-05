import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const newWebsite = {
      ...body,
      id,
      status: 'checking',
      lastChecked: null,
      history: [],
      offlineSince: null,
      alertSent: false,
      alertDelayMs: body.alertDelayMs || 0
    };
    
    await adminDb.collection('websites').doc(id).set(newWebsite);
    return NextResponse.json(newWebsite);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      await adminDb.collection('websites').doc(id).delete();
      
      const incidentsSnapshot = await adminDb.collection('incidents').where('websiteId', '==', id).get();
      const batch = adminDb.batch();
      incidentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
