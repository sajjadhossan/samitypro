import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({
    success: true,
    message: 'সফলভাবে লগআউট সম্পন্ন হয়েছে (Logged out successfully)'
  });
}
