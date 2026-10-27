import { NextResponse } from 'next/server';
import { INITIAL_NOTIFICATION_TEMPLATES, INITIAL_NOTIFICATION_LOGS, INITIAL_SMS_GATEWAY_SETTINGS } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'samity-ekota';

    return NextResponse.json({
      success: true,
      message: 'নোটিফিকেশন ডাটা সফলভাবে প্রাপ্ত হয়েছে',
      data: {
        templates: INITIAL_NOTIFICATION_TEMPLATES.filter(t => t.tenantId === tenantId),
        logs: INITIAL_NOTIFICATION_LOGS.filter(l => l.tenantId === tenantId),
        smsBalance: INITIAL_SMS_GATEWAY_SETTINGS.balanceCount
      },
      errors: []
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'ডাটা লোড করতে ব্যর্থ হয়েছে',
      errorCode: 'NOTIFICATIONS_FETCH_FAILED',
      errors: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientPhone, recipientName, channel, messageText } = body;

    if (!recipientPhone || !messageText) {
      return NextResponse.json({
        success: false,
        message: 'প্রাপকের মোবাইল নম্বর এবং বার্তার বিবরণ আবশ্যক',
        errorCode: 'VALIDATION_ERROR',
        errors: []
      }, { status: 400 });
    }

    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '').slice(-11);
    const waMeUrl = `https://wa.me/88${cleanPhone}?text=${encodeURIComponent(messageText)}`;

    return NextResponse.json({
      success: true,
      message: `${channel || 'WHATSAPP'} বার্তা সফলভাবে ডিসপ্যাচ করা হয়েছে`,
      data: {
        recipientPhone: cleanPhone,
        recipientName: recipientName || 'সদস্য',
        channel: channel || 'WHATSAPP',
        waMeUrl,
        sentAt: new Date().toISOString()
      },
      errors: []
    }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'বার্তা প্রেরণে ব্যর্থতা',
      errorCode: 'NOTIFICATION_SEND_FAILED',
      errors: []
    }, { status: 500 });
  }
}
