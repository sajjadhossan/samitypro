import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/server/db';

export async function GET() {
  const health = await checkDatabaseHealth();
  return NextResponse.json({
    success: true,
    data: health,
    timestamp: new Date().toISOString()
  });
}
