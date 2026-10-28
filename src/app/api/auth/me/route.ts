import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import { executeNeonQuery } from '@/lib/server/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'অননুমোদিত ব্যবহারকারী (Unauthorized)',
          errorCode: 'AUTH_UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Retrieve fresh user & tenant metadata from Neon DB
    const users = await executeNeonQuery<{
      id: string;
      tenant_id: string | null;
      name: string;
      phone: string;
      email: string | null;
      role: string;
      status: string;
      avatar_url: string | null;
      tenant_name?: string;
      tenant_code?: string;
    }>(
      `SELECT u.id, u.tenant_id, u.name, u.phone, u.email, u.role, u.status, u.avatar_url,
              t.name as tenant_name, t.code as tenant_code
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1 AND u.deleted_at IS NULL
       LIMIT 1`,
      [session.userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ব্যবহারকারী পাওয়া যায়নি',
          errorCode: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const u = users[0];

    return NextResponse.json({
      success: true,
      message: 'সেশন ভেরিফাইড (Session active)',
      data: {
        user: {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role,
          status: u.status,
          avatarUrl: u.avatar_url,
          tenantId: u.tenant_id,
          tenantName: u.tenant_name,
          tenantCode: u.tenant_code
        }
      }
    });
  } catch (error) {
    console.error('Session verify error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'সেশন যাচাইয়ে সমস্যা হয়েছে',
        errorCode: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
