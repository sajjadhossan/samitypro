import { NextResponse } from 'next/server';
import { ensureInitialNeonUsers } from '@/lib/server/seedAuth';
import { executeNeonQuery } from '@/lib/server/neon';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await ensureInitialNeonUsers();
    
    // Return summary of active users (without sensitive password hashes)
    const users = await executeNeonQuery<{
      id: string;
      name: string;
      phone: string;
      email: string;
      role: string;
      status: string;
      tenant_id: string;
    }>('SELECT id, name, phone, email, role, status, tenant_id FROM users WHERE deleted_at IS NULL');

    return NextResponse.json({
      success: true,
      message: result.seeded ? 'ডাটাবেজে ইনিশিয়াল অ্যাকাউন্ট তৈরি করা হয়েছে' : 'ইনিশিয়াল অ্যাকাউন্ট ইতিমধ্যে প্রস্তুত আছে',
      data: {
        seeded: result.seeded,
        totalUsers: users.length,
        users: users
      }
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Bootstrap failed',
        errorCode: 'BOOTSTRAP_ERROR'
      },
      { status: 500 }
    );
  }
}
