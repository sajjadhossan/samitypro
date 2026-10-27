import { NextResponse } from 'next/server';
import { INITIAL_STAFF_PAYSLIPS } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'samity-ekota';
    const monthYear = searchParams.get('monthYear');

    let payslips = INITIAL_STAFF_PAYSLIPS.filter(p => p.tenantId === tenantId);
    if (monthYear) {
      payslips = payslips.filter(p => p.monthYear === monthYear);
    }

    return NextResponse.json({
      success: true,
      message: 'পে-রোল শীট সফলভাবে লোড হয়েছে',
      data: payslips,
      meta: {
        total: payslips.length,
        page: 1,
        limit: 50
      },
      errors: []
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'পে-রোল ডাটা লোড করতে ব্যর্থ হয়েছে',
      errorCode: 'PAYROLL_FETCH_FAILED',
      errors: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payslipId, paymentMethod, disbursementAccount } = body;

    if (action === 'DISBURSE') {
      if (!payslipId) {
        return NextResponse.json({
          success: false,
          message: 'পে-স্লিপ আইডি আবশ্যক',
          errorCode: 'VALIDATION_ERROR',
          errors: []
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'বেতন সফলভাবে পরিশোধিত হয়েছে এবং অ্যাকাউন্টিং ডেবিট ভাউচার তৈরি হয়েছে',
        data: {
          payslipId,
          status: 'PAID',
          paymentDate: new Date().toISOString().split('T')[0],
          voucherNo: `VCH-DR-${Date.now().toString().slice(-6)}`,
          paymentMethod: paymentMethod || 'BANK_TRANSFER',
          disbursementAccount: disbursementAccount || '১০২০: সোনালী ব্যাংক চলতি হিসাব'
        },
        errors: []
      });
    }

    return NextResponse.json({
      success: false,
      message: 'অবৈধ পে-রোল অ্যাকশন অনুরোধ',
      errorCode: 'INVALID_ACTION',
      errors: []
    }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'পে-রোল প্রক্রিয়াকরণ ব্যর্থ',
      errorCode: 'PAYROLL_PROCESS_FAILED',
      errors: []
    }, { status: 500 });
  }
}
