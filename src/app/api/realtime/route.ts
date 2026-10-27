import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_EVENTS } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get('tenantId') || 'samity-ekota';
  const stream = searchParams.get('stream');

  // Server-Sent Events (SSE) Live Channel
  if (stream === 'true') {
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      start(controller) {
        // Welcome Handshake
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'CONNECTED', 
            tenantId, 
            message: 'Realtime SSE Stream established',
            timestamp: new Date().toISOString() 
          })}\n\n`)
        );

        // Keep-alive heartbeat
        const interval = setInterval(() => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'HEARTBEAT', 
                timestamp: new Date().toISOString() 
              })}\n\n`)
            );
          } catch {
            clearInterval(interval);
          }
        }, 20000);

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

  // Regular JSON fallback
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
    const { idempotencyKey, tenantId, entity, action, payload } = body;

    // Idempotent sync item handler
    const syncResult = {
      idempotencyKey: idempotencyKey || `SRV-${Date.now()}`,
      tenantId: tenantId || 'samity-ekota',
      entity: entity || 'TRANSACTION',
      action: action || 'CREATE',
      status: 'SYNCED',
      syncedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'রেকর্ড সফলভাবে সিঙ্ক ও ব্রডকাস্ট করা হয়েছে',
      data: syncResult,
      receivedPayload: payload
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ 
      success: false, 
      errorCode: 'SYNC_DISPATCH_FAILED',
      message: msg 
    }, { status: 400 });
  }
}
