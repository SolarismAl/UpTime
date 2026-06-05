import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  const expectedStatus = searchParams.get('expectedStatus') ? parseInt(searchParams.get('expectedStatus')!) : 200;
  const timeoutMs = searchParams.get('timeout') ? parseInt(searchParams.get('timeout')!) : 4000;
  const keyword = searchParams.get('keyword');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    if (response.status !== expectedStatus) {
      return NextResponse.json({
        status: 'error',
        responseTime,
        message: `Expected status ${expectedStatus}, got ${response.status}`,
      });
    }

    if (keyword) {
      const body = await response.text();
      if (!body.includes(keyword)) {
        return NextResponse.json({
          status: 'error',
          responseTime,
          message: `Keyword '${keyword}' not found in response`,
        });
      }
    }

    return NextResponse.json({
      status: 'online',
      responseTime,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError';
    return NextResponse.json({
      status: isTimeout ? 'offline' : 'error',
      responseTime: null,
      message: error.message,
    });
  }
}
