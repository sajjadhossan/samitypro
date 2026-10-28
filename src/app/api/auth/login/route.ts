import { NextResponse } from 'next/server';
import { executeNeonQuery, isNeonConfigured } from '@/lib/server/neon';
import { 
  comparePassword, 
  createAuthToken, 
  setAuthCookie, 
  normalizePhone,
  AuthUserPayload 
} from '@/lib/server/auth';
import { ensureInitialNeonUsers } from '@/lib/server/seedAuth';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

interface DbUserRow {
  id: string;
  tenant_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  password_hash: string;
  role: string;
  status: string;
  tenant_name?: string;
  tenant_code?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড আবশ্যক (Identifier and password are required)',
          errorCode: 'VALIDATION_ERROR',
          errors: [{ field: 'identifier', message: 'Missing credentials' }]
        },
        { status: 400 }
      );
    }

    // Auto-ensure initial seed if Neon is fresh
    if (isNeonConfigured()) {
      await ensureInitialNeonUsers();
    }

    const cleanIdentifier = identifier.trim();
    const normalizedPhone = normalizePhone(cleanIdentifier);

    // Query user by phone or email
    const users = await executeNeonQuery<DbUserRow>(
      `SELECT u.id, u.tenant_id, u.name, u.phone, u.email, u.password_hash, u.role, u.status,
              t.name as tenant_name, t.code as tenant_code
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE (u.phone = $1 OR u.phone = $2 OR LOWER(u.email) = LOWER($3))
         AND u.deleted_at IS NULL
       LIMIT 1`,
      [cleanIdentifier, normalizedPhone, cleanIdentifier]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ব্যবহারকারী পাওয়া যায়নি। সঠিক মোবাইল বা ইমেইল প্রদান করুন। (User not found)',
          errorCode: 'AUTH_INVALID_CREDENTIALS',
          errors: [{ field: 'identifier', message: 'Invalid phone or email' }]
        },
        { status: 401 }
      );
    }

    const user = users[0];

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          message: 'আপনার অ্যাকাউন্টটি স্থগিত বা নিষ্ক্রিয় রয়েছে। কর্তৃপক্ষের সাথে যোগাযোগ করুন। (Account inactive)',
          errorCode: 'AUTH_ACCOUNT_SUSPENDED',
          errors: [{ field: 'status', message: 'Account is not active' }]
        },
        { status: 403 }
      );
    }

    // Verify Password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'ভুল পাসওয়ার্ড। দয়া করে সঠিক পাসওয়ার্ড দিন। (Invalid password)',
          errorCode: 'AUTH_INVALID_CREDENTIALS',
          errors: [{ field: 'password', message: 'Incorrect password' }]
        },
        { status: 401 }
      );
    }

    // Update last_login_at timestamp & audit
    try {
      await executeNeonQuery(
        'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      if (user.tenant_id) {
        await executeNeonQuery(
          `INSERT INTO audit_logs (
            id, tenant_id, user_id, action, entity, entity_id, new_values, user_agent
          ) VALUES (
            gen_random_uuid()::text, $1, $2, 'LOGIN', 'users', $2, $3::jsonb, $4
          )`,
          [
            user.tenant_id,
            user.id,
            JSON.stringify({ 
              action: 'USER_LOGIN', 
              identifier: cleanIdentifier
            }),
            req.headers.get('user-agent') || 'Unknown'
          ]
        );
      }
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr);
    }

    const authPayload: AuthUserPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role as UserRole,
      status: user.status
    };

    const token = await createAuthToken(authPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'সফলভাবে লগইন হয়েছে (Login successful)',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          tenantId: user.tenant_id,
          tenantName: user.tenant_name,
          tenantCode: user.tenant_code
        }
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'লগইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন। (Internal login error)',
        errorCode: 'INTERNAL_SERVER_ERROR',
        errors: [{ field: 'server', message: error instanceof Error ? error.message : String(error) }]
      },
      { status: 500 }
    );
  }
}
