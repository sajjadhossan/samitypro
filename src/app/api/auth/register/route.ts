import { NextResponse } from 'next/server';
import { executeNeonQuery, isNeonConfigured } from '@/lib/server/neon';
import { 
  hashPassword, 
  createAuthToken, 
  setAuthCookie, 
  normalizePhone, 
  AuthUserPayload 
} from '@/lib/server/auth';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { samityName, adminName, phone, email, password, slogan, address } = body;

    if (!samityName?.trim() || !adminName?.trim() || !phone?.trim() || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'সমিতির নাম, প্রশাসকের নাম, মোবাইল নম্বর এবং পাসওয়ার্ড পূরণ করুন। (All required fields must be filled)',
          errorCode: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters)',
          errorCode: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email?.trim() || null;
    const normalizedPhone = normalizePhone(cleanPhone);

    // Check if phone or email already registered
    const existing = await executeNeonQuery<{ id: string }>(
      'SELECT id FROM users WHERE phone = $1 OR phone = $2 OR (email IS NOT NULL AND LOWER(email) = LOWER($3)) LIMIT 1',
      [cleanPhone, normalizedPhone, cleanEmail || '']
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করুন। (Account already exists)',
          errorCode: 'DUPLICATE_RECORD'
        },
        { status: 409 }
      );
    }

    // Generate unique tenant code
    const rawCode = samityName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase() || 'SAMITY';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tenantCode = `${rawCode}-${randomSuffix}`;
    const tenantId = `tenant-${Date.now()}`;
    const userId = `user-${Date.now()}`;

    // Hash password
    const passwordHash = await hashPassword(password);

    // 1. Create Tenant
    await executeNeonQuery(
      `INSERT INTO tenants (
        id, code, name, slogan, phone, email, address, theme_color,
        currency, timezone, subscription_plan, status, sms_balance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        tenantId,
        tenantCode,
        samityName.trim(),
        slogan?.trim() || 'উন্নয়ন ও সমৃদ্ধির প্রত্যয়ে',
        normalizedPhone,
        cleanEmail,
        address?.trim() || 'বাংলাদেশ',
        '#059669',
        'BDT',
        'Asia/Dhaka',
        'FREE_TRIAL',
        'ACTIVE',
        100
      ]
    );

    // 2. Create Admin User
    await executeNeonQuery(
      `INSERT INTO users (
        id, tenant_id, name, phone, email, password_hash, role, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        tenantId,
        adminName.trim(),
        normalizedPhone,
        cleanEmail,
        passwordHash,
        'SAMITY_ADMIN',
        'ACTIVE'
      ]
    );

    // 3. Create Audit Log
    try {
      await executeNeonQuery(
        `INSERT INTO audit_logs (
          id, tenant_id, user_id, action, entity, entity_id, details
        ) VALUES (
          gen_random_uuid()::text, $1, $2, 'CREATE', 'tenants', $1, $3::jsonb
        )`,
        [
          tenantId,
          userId,
          JSON.stringify({ 
            action: 'TENANT_REGISTRATION', 
            samityName, 
            tenantCode,
            userAgent: req.headers.get('user-agent') || 'Unknown' 
          })
        ]
      );
    } catch {}

    const authPayload: AuthUserPayload = {
      userId,
      tenantId,
      name: adminName.trim(),
      phone: normalizedPhone,
      email: cleanEmail,
      role: 'SAMITY_ADMIN',
      status: 'ACTIVE'
    };

    const token = await createAuthToken(authPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'অভিনন্দন! আপনার সমিতি ও অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। (Registration successful)',
      data: {
        token,
        tenant: {
          id: tenantId,
          code: tenantCode,
          name: samityName.trim()
        },
        user: {
          id: userId,
          name: adminName.trim(),
          phone: normalizedPhone,
          email: cleanEmail,
          role: 'SAMITY_ADMIN'
        }
      }
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'নিবন্ধনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন। (Registration error)',
        errorCode: 'INTERNAL_SERVER_ERROR',
        errors: [{ field: 'server', message: error instanceof Error ? error.message : String(error) }]
      },
      { status: 500 }
    );
  }
}
