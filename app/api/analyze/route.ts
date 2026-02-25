import { NextResponse } from 'next/server';
import { analyzeIncidents } from '../../../lib/geminiService';

export async function POST(req: Request) {
  try {
    const { incidents } = await req.json();

    if (!incidents || !Array.isArray(incidents)) {
      return NextResponse.json({ error: 'Invalid incidents data' }, { status: 400 });
    }

    const analysis = await analyzeIncidents(incidents);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
