import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SUBSCRIPTIONS, INITIAL_SUBSCRIPTION_POLICY, INITIAL_LATE_FEE_WAIVERS } from '@/lib/db';
import { FeePaymentStatus, MonthlySubscription } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const memberId = request.nextUrl.searchParams.get('memberId');
    const status = request.nextUrl.searchParams.get('status');
    const monthYear = request.nextUrl.searchParams.get('monthYear');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);

    let list = INITIAL_SUBSCRIPTIONS.filter(s => s.tenantId === tenantId);
    if (memberId) list = list.filter(s => s.memberId === memberId);
    if (status && status !== 'ALL') list = list.filter(s => s.status === status);
    if (monthYear) list = list.filter(s => s.monthYear === monthYear);

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      message: 'মাসিক চাঁদা তালিকা সফলভাবে প্রাপ্ত হয়েছে (Subscriptions retrieved successfully)',
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages
      },
      policy: INITIAL_SUBSCRIPTION_POLICY,
      errors: []
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      message,
      errorCode: 'INTERNAL_SERVER_ERROR',
      errors: [{ field: 'server', message }]
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'COLLECT';

    // 1. Action: Generate Monthly Dues
    if (action === 'GENERATE_DUES') {
      const { tenantId, monthYear, monthNameBn } = body;
      if (!monthYear) {
        return NextResponse.json({
          success: false,
          message: 'মাস ও বছর (monthYear e.g. 2026-11) আবশ্যক',
          errorCode: 'VALIDATION_ERROR',
          errors: [{ field: 'monthYear', message: 'monthYear is required' }]
        }, { status: 422 });
      }

      return NextResponse.json({
        success: true,
        message: `${monthNameBn || monthYear} মাসের চাঁদা সফলভাবে জেনারেট করা হয়েছে`,
        data: {
          tenantId: tenantId || 'samity-ekota',
          monthYear,
          status: 'GENERATED',
          timestamp: new Date().toISOString()
        },
        errors: []
      }, { status: 201 });
    }

    // 2. Action: Waive Late Fee
    if (action === 'WAIVE_LATE_FEE') {
      const { subscriptionId, waivedAmount, reason, waivedBy } = body;
      if (!subscriptionId || !waivedAmount || waivedAmount <= 0) {
        return NextResponse.json({
          success: false,
          message: 'সাবস্ক্রিপশন আইডি ও মওকুফের পরিমাণ আবশ্যক',
          errorCode: 'VALIDATION_ERROR',
          errors: [{ field: 'waivedAmount', message: 'Valid waived amount required' }]
        }, { status: 422 });
      }

      return NextResponse.json({
        success: true,
        message: 'বিলম্ব ফি সফলভাবে মওকুফ করা হয়েছে',
        data: {
          subscriptionId,
          waivedAmount,
          reason: reason || 'প্রশাসনিক সিদ্ধান্তে মওকুফ',
          waivedBy: waivedBy || 'সভাপতি',
          timestamp: new Date().toISOString()
        },
        errors: []
      });
    }

    // 3. Action: Update Policy
    if (action === 'UPDATE_POLICY') {
      return NextResponse.json({
        success: true,
        message: 'চাঁদা পলিসি সফলভাবে সংরক্ষিত হয়েছে',
        data: body.policy || INITIAL_SUBSCRIPTION_POLICY,
        errors: []
      });
    }

    // 4. Default: Collect Subscription Payment
    const { tenantId, memberId, amount, paymentMethod, monthYear } = body;

    if (!memberId || !amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'সদস্য আইডি এবং ধনাত্মক জমার পরিমাণ আবশ্যক (Validation error)',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'amount', message: 'Amount must be greater than zero' }]
      }, { status: 422 });
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
      message: 'মাসিক চাঁদা জমা গৃহীত হয়েছে এবং অফিসিয়াল রসিদ জেনারেট সম্পন্ন হয়েছে',
      data: {
        receipt,
        paymentStatus: 'PAID',
        receiptNo
      },
      meta: {},
      errors: []
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process subscription request';
    return NextResponse.json({
      success: false,
      message,
      errorCode: 'SUBSCRIPTION_OPERATION_FAILED',
      errors: [{ field: 'server', message }]
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'চাঁদা রেকর্ড সফলভাবে আপডেট করা হয়েছে',
      data: body,
      errors: []
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({
      success: false,
      message,
      errorCode: 'UPDATE_FAILED',
      errors: [{ field: 'server', message }]
    }, { status: 500 });
  }
}
