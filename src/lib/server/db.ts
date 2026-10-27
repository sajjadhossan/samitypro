import { Pool, QueryResult, QueryResultRow } from 'pg';

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
  params?: unknown[]
): Promise<QueryResult<T>> {
  const p = getDbPool();
  if (!p) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }
  return p.query<T>(text, params);
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  version?: string;
  error?: string;
  type: 'POSTGRESQL' | 'MEMORY_CACHE';
}> {
  const p = getDbPool();
  if (!p) {
    return {
      connected: false,
      type: 'MEMORY_CACHE',
      error: 'DATABASE_URL environment variable is not defined. Running in offline/memory fallback mode.'
    };
  }

  try {
    const result = await p.query('SELECT version() as ver, NOW() as current_time');
    return {
      connected: true,
      type: 'POSTGRESQL',
      version: result.rows[0]?.ver || 'PostgreSQL Connected',
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      type: 'POSTGRESQL',
      error: errorMessage
    };
  }
}
