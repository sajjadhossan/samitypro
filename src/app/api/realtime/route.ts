import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_EVENTS } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get('tenantId');
  const stream = searchParams.get('stream');

  // If client requests SSE stream
  if (stream === 'true') {
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })}\n\n`)
        );

        const interval = setInterval(() => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'HEARTBEAT', timestamp: new Date().toISOString() })}\n\n`)
          );
        }, 15000);

        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
        });
      }
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  }

  // Regular JSON polling fallback
  const filteredEvents = tenantId 
    ? INITIAL_EVENTS.filter(e => e.tenantId === tenantId)
    : INITIAL_EVENTS;

  return NextResponse.json({
    success: true,
    count: filteredEvents.length,
    events: filteredEvents,
    serverTime: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      receivedEvent: body,
      broadcastedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
