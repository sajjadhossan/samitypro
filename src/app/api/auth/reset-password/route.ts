import { NextResponse } from 'next/server';
import { executeNeonQuery } from '@/lib/server/neon';
import { hashPassword, normalizePhone } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp, newPassword } = body;

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'মোবাইল নম্বর, ওটিপি এবং নতুন পাসওয়ার্ড প্রদান করুন (Missing required fields)',
          errorCode: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
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
    const normalizedPhone = normalizePhone(cleanPhone);
    const cleanOtp = otp.trim();

    // 1. Check for active, unused, unexpired OTP token
    const tokens = await executeNeonQuery<{
      id: string;
      phone: string;
      otp_code: string;
      expires_at: string;
      is_used: boolean;
      attempts: number;
    }>(
      `SELECT id, phone, otp_code, expires_at, is_used, attempts 
       FROM password_reset_tokens 
       WHERE phone = $1 AND is_used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedPhone]
    );

    if (tokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ওটিপি কোডের মেয়াদ শেষ হয়েছে অথবা কোডটি সঠিক নয়। পুনরায় ওটিপি রিকোয়েস্ট করুন। (Invalid or expired OTP)',
          errorCode: 'INVALID_OR_EXPIRED_OTP'
        },
        { status: 400 }
      );
    }

    const token = tokens[0];

    // Brute force rate protection
    if (token.attempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'অনেকবার ভুল চেষ্টা করা হয়েছে। নতুন ওটিপি রিকোয়েস্ট করুন। (Too many failed attempts)',
          errorCode: 'TOO_MANY_ATTEMPTS'
        },
        { status: 429 }
      );
    }

    // Verify OTP Match
    if (token.otp_code !== cleanOtp) {
      await executeNeonQuery(
        'UPDATE password_reset_tokens SET attempts = attempts + 1 WHERE id = $1',
        [token.id]
      );
      return NextResponse.json(
        {
          success: false,
          message: 'ভুল ওটিপি কোড। সঠিক কোড দিন। (Incorrect OTP code)',
          errorCode: 'AUTH_INVALID_OTP'
        },
        { status: 400 }
      );
    }

    // 2. Hash new password
    const passwordHash = await hashPassword(newPassword);

    // 3. Update user password
    const updateResult = await executeNeonQuery<{ id: string; tenant_id: string }>(
      `UPDATE users 
       SET password_hash = $1, updated_at = NOW() 
       WHERE (phone = $2 OR phone = $3) AND deleted_at IS NULL
       RETURNING id, tenant_id`,
      [passwordHash, cleanPhone, normalizedPhone]
    );

    if (updateResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি। (User not found)',
          errorCode: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const updatedUser = updateResult[0];

    // 4. Invalidate the OTP token
    await executeNeonQuery(
      'UPDATE password_reset_tokens SET is_used = true WHERE id = $1',
      [token.id]
    );

    // 5. Audit Trail Logging
    try {
      await executeNeonQuery(
        `INSERT INTO audit_logs (
          id, tenant_id, user_id, action, entity, entity_id, new_values, user_agent
        ) VALUES (
          gen_random_uuid()::text, $1, $2, 'UPDATE', 'users', $2, $3::jsonb, $4
        )`,
        [
          updatedUser.tenant_id || 'platform',
          updatedUser.id,
          JSON.stringify({
            action: 'PASSWORD_RESET_SUCCESS',
            phone: normalizedPhone
          }),
          req.headers.get('user-agent') || 'Unknown'
        ]
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন। (Password reset successfully)'
    });

  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'পাসওয়ার্ড রিসেটে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন। (Failed to reset password)',
        errorCode: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
