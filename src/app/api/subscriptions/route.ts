import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SUBSCRIPTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const memberId = request.nextUrl.searchParams.get('memberId');
    const status = request.nextUrl.searchParams.get('status');

    let list = INITIAL_SUBSCRIPTIONS.filter(s => s.tenantId === tenantId);
    if (memberId) list = list.filter(s => s.memberId === memberId);
    if (status && status !== 'ALL') list = list.filter(s => s.status === status);

    return NextResponse.json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: list,
      meta: {
        page: 1,
        limit: 20,
        total: list.length,
        totalPages: 1
      },
      errors: []
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      message,
      errorCode: 'INTERNAL_SERVER_ERROR',
      errors: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, memberId, amount, paymentMethod, monthYear } = body;

    if (!memberId || !amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed: memberId and positive amount are required',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'amount', message: 'Amount must be greater than zero' }]
      }, { status: 400 });
    }

    const receiptNo = `RCT-SUB-${Date.now().toString().slice(-5)}`;
    const today = new Date().toISOString().split('T')[0];

    const receipt = {
      id: `rct-${Date.now()}`,
      tenantId: tenantId || 'samity-ekota',
      receiptNo,
      receiptType: 'SUBSCRIPTION',
      memberId,
      amount: Number(amount),
      monthYear: monthYear || '2026-10',
      date: today,
      paymentMethod: paymentMethod || 'CASH',
      qrCodeData: `https://samitypro.org/verify/${receiptNo}`,
      isVerified: true
    };

    return NextResponse.json({
      success: true,
      message: 'Subscription payment recorded and official receipt generated',
      data: {
        receipt,
        paymentStatus: 'PAID',
        receiptNo
      },
      meta: {},
      errors: []
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record subscription payment';
    return NextResponse.json({
      success: false,
      message,
      errorCode: 'PAYMENT_FAILED',
      errors: []
    }, { status: 500 });
  }
}
