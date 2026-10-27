/**
 * Neon Serverless PostgreSQL Database Client
 * Built with @neondatabase/serverless for zero-cold-start edge & serverless execution.
 * Conforms to Rule Section 4: Shared Architecture (PostgreSQL & Multi-Tenancy).
 */

import { Pool as NeonPool } from '@neondatabase/serverless';

let neonPoolInstance: NeonPool | null = null;

export function isNeonConfigured(): boolean {
  const url = process.env.DATABASE_URL || '';
  return !!url && (url.includes('neon.tech') || url.startsWith('postgres://') || url.startsWith('postgresql://'));
}

/**
 * Returns Neon Pool instance for connection pooling in serverless environments
 */
export function getNeonPool(): NeonPool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set in environment.');
  }

  if (!neonPoolInstance) {
    neonPoolInstance = new NeonPool({ connectionString: url });
  }
  return neonPoolInstance;
}

/**
 * Execute parameter-safe query against Neon Serverless PostgreSQL
 */
export async function executeNeonQuery<T = unknown>(
  queryString: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getNeonPool();
  const result = await pool.query(queryString, params);
  return result.rows as T[];
}

/**
 * Comprehensive Neon Database Health & Latency Checker
 */
export async function checkNeonHealth(): Promise<{
  connected: boolean;
  provider: string;
  version?: string;
  database?: string;
  latencyMs?: number;
  error?: string;
}> {
  if (!isNeonConfigured()) {
    return {
      connected: false,
      provider: 'Offline / In-Memory Simulator',
      error: 'DATABASE_URL is not provided. Add your Neon connection string in .env or Vercel Environment Variables.'
    };
  }

  const startTime = Date.now();
  try {
    const pool = getNeonPool();
    const result = await pool.query('SELECT version() as ver, current_database() as db, NOW() as current_time');
    const latencyMs = Date.now() - startTime;

    const row = result.rows[0] as { ver?: string; db?: string } | undefined;
    return {
      connected: true,
      provider: 'Neon Serverless PostgreSQL (Cloud)',
      version: row?.ver || 'PostgreSQL (Neon Serverless)',
      database: row?.db || 'samitypro',
      latencyMs
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      provider: 'Neon Serverless PostgreSQL',
      error: msg
    };
  }
}
