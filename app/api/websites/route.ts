import { NextResponse } from 'next/server';
const db = require('../../../lib/db');

export async function POST(req: Request) {
  const body = await req.json();
  const newWebsite = db.addWebsite(body);
  return NextResponse.json(newWebsite);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    db.removeWebsite(id);
  }
  return NextResponse.json({ success: true });
}
