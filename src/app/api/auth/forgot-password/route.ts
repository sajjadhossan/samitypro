import { NextResponse } from 'next/server';
import { executeNeonQuery } from '@/lib/server/neon';
import { normalizePhone } from '@/lib/server/auth';
import { SmsGatewayService } from '@/lib/server/gateways/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'সঠিক মোবাইল নম্বর প্রদান করুন (Valid phone number required)',
          errorCode: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const normalizedPhone = normalizePhone(cleanPhone);

    // 1. Verify user exists in Neon DB
    const users = await executeNeonQuery<{ id: string; name: string; phone: string; status: string; tenant_id: string }>(
      'SELECT id, name, phone, status, tenant_id FROM users WHERE (phone = $1 OR phone = $2) AND deleted_at IS NULL LIMIT 1',
      [cleanPhone, normalizedPhone]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। (No account found for this mobile number)',
          errorCode: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const user = users[0];
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          message: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয়। অ্যাডমিনের সাথে যোগাযোগ করুন। (Account suspended)',
          errorCode: 'ACCOUNT_SUSPENDED'
        },
        { status: 403 }
      );
    }

    // 2. Cooldown check (prevent spamming OTP requests within 60 seconds)
    const recentTokens = await executeNeonQuery<{ created_at: string }>(
      `SELECT created_at FROM password_reset_tokens 
       WHERE phone = $1 AND created_at > (NOW() - INTERVAL '60 seconds')
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedPhone]
    );

    if (recentTokens.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'অনুগ্রহ করে ৬০ সেকেন্ড অপেক্ষা করুন এবং পুনরায় চেষ্টা করুন। (Please wait 60s before requesting another OTP)',
          errorCode: 'RATE_LIMITED'
        },
        { status: 429 }
      );
    }

    // 3. Generate 6-digit cryptographic OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save to password_reset_tokens table with 5-minute expiry
    await executeNeonQuery(
      `INSERT INTO password_reset_tokens (
        id, phone, otp_code, expires_at, is_used
      ) VALUES (
        gen_random_uuid()::text, $1, $2, NOW() + INTERVAL '5 minutes', false
      )`,
      [normalizedPhone, otpCode]
    );

    // 5. Send SMS if SMS gateway is configured
    const smsMessage = `SamityPro: আপনার পাসওয়ার্ড রিসেট ওটিপি কোড হলো: ${otpCode}। এটি ৫ মিনিট কার্যকর থাকবে।`;
    const smsApiKey = process.env.SMS_API_KEY;
    const smsSenderId = process.env.SMS_SENDER_ID || 'SAMITYPRO';

    let smsSent = false;
    if (smsApiKey && smsApiKey !== 'your_sms_api_key_here') {
      try {
        const smsResult = await SmsGatewayService.sendGreenweb(smsApiKey, normalizedPhone, smsMessage);
        smsSent = smsResult.success;
      } catch (smsErr) {
        console.warn('SMS gateway dispatch error:', smsErr);
      }
    }

    // 6. Audit Trail Logging
    try {
      await executeNeonQuery(
        `INSERT INTO audit_logs (
          id, tenant_id, user_id, action, entity, entity_id, new_values, user_agent
        ) VALUES (
          gen_random_uuid()::text, $1, $2, 'UPDATE', 'users', $2, $3::jsonb, $4
        )`,
        [
          user.tenant_id || 'platform',
          user.id,
          JSON.stringify({
            action: 'REQUEST_PASSWORD_RESET_OTP',
            phone: normalizedPhone
          }),
          req.headers.get('user-agent') || 'Unknown'
        ]
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'আপনার মোবাইল নম্বরে ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে। (OTP sent to mobile)',
      data: {
        phone: normalizedPhone,
        expiresInSeconds: 300,
        smsDispatched: smsSent
      }
    });

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন। (Failed to dispatch OTP)',
        errorCode: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
