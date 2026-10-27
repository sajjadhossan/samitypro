import { Pool, QueryResult, QueryResultRow } from 'pg';
import { checkNeonHealth, executeNeonQuery, isNeonConfigured } from './neon';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: isProduction ? 20 : 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }

  return pool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  // If Neon Serverless is configured, utilize zero-latency HTTP driver
  if (isNeonConfigured() && process.env.DATABASE_URL?.includes('neon.tech')) {
    const rows = await executeNeonQuery<T>(text, params);
    return {
      rows,
      rowCount: rows.length
    };
  }

  // Standard pg connection pool fallback
  const p = getDbPool();
  if (!p) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }
  const result: QueryResult<T> = await p.query<T>(text, params);
  return {
    rows: result.rows,
    rowCount: result.rowCount ?? result.rows.length
  };
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  type: 'NEON_POSTGRESQL' | 'STANDARD_POSTGRESQL' | 'MEMORY_CACHE';
  provider: string;
  version?: string;
  database?: string;
  latencyMs?: number;
  error?: string;
}> {
  // Check Neon first
  if (isNeonConfigured() && process.env.DATABASE_URL?.includes('neon.tech')) {
    const neonHealth = await checkNeonHealth();
    return {
      connected: neonHealth.connected,
      type: 'NEON_POSTGRESQL',
      provider: neonHealth.provider,
      version: neonHealth.version,
      database: neonHealth.database,
      latencyMs: neonHealth.latencyMs,
      error: neonHealth.error
    };
  }

  const p = getDbPool();
  if (!p) {
    return {
      connected: false,
      type: 'MEMORY_CACHE',
      provider: 'Local Memory & Offline Cache',
      error: 'DATABASE_URL environment variable is not defined. Running in offline/memory fallback mode.'
    };
  }

  const startTime = Date.now();
  try {
    const result = await p.query('SELECT version() as ver, current_database() as db, NOW() as current_time');
    return {
      connected: true,
      type: 'STANDARD_POSTGRESQL',
      provider: 'Standard PostgreSQL Server',
      version: result.rows[0]?.ver || 'PostgreSQL Connected',
      database: result.rows[0]?.db,
      latencyMs: Date.now() - startTime
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      type: 'STANDARD_POSTGRESQL',
      provider: 'PostgreSQL Server',
      error: errorMessage
    };
  }
}
