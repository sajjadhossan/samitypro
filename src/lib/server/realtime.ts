import { createRealtime, rawSql } from '@neon/realtime/server';

let realtimeInstance: ReturnType<typeof createRealtime> | null = null;

export function isRealtimeConfigured(): boolean {
  return !!(process.env.NEON_REALTIME_URL && process.env.NEON_REALTIME_SECRET);
}

export function getRealtimeServer() {
  if (!isRealtimeConfigured()) {
    throw new Error('NEON_REALTIME_URL or NEON_REALTIME_SECRET is not configured in environment.');
  }

  if (!realtimeInstance) {
    realtimeInstance = createRealtime({
      secret: process.env.NEON_REALTIME_SECRET!,
      db: 'neondb',
    });
  }

  return realtimeInstance;
}

/**
 * Seals a live SQL query for secure consumption by reactive client components
 */
export async function sealQuery<T = unknown>(queryString: string, params: unknown[] = []) {
  const rt = getRealtimeServer();
  const query = rawSql<T>(queryString, params as any);
  return await rt.seal({ query });
}

export async function checkRealtimeHealth(): Promise<{
  connected: boolean;
  provider: string;
  url?: string;
  sealedQuerySample?: boolean;
  latencyMs?: number;
  error?: string;
}> {
  if (!isRealtimeConfigured()) {
    return {
      connected: false,
      provider: 'Neon Realtime Engine',
      error: 'NEON_REALTIME_URL or NEON_REALTIME_SECRET is missing',
    };
  }

  const startTime = Date.now();
  try {
    const rt = getRealtimeServer();
    const testQuery = rawSql('SELECT 1 as live_ping');
    const sealed = await rt.seal({ query: testQuery });
    const latencyMs = Date.now() - startTime;

    return {
      connected: true,
      provider: 'Neon Realtime Live SQL Engine (WebSocket)',
      url: process.env.NEON_REALTIME_URL,
      sealedQuerySample: !!sealed,
      latencyMs,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      provider: 'Neon Realtime Live SQL Engine',
      url: process.env.NEON_REALTIME_URL,
      error: msg,
    };
  }
}
