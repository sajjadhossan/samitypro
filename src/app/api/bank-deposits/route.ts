import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_BANK_DEPOSITS } from '@/lib/db';

export function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const list = INITIAL_BANK_DEPOSITS.filter(b => b.tenantId === tenantId);

    return NextResponse.json({
      success: true,
      message: 'Bank deposits retrieved successfully',
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
    const { tenantId, bankName, accountNumber, branchName, amount, slipNumber, notes } = body;

    if (!bankName || !accountNumber || !amount || amount <= 0 || !slipNumber) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed: bankName, accountNumber, amount and slipNumber are required',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'slipNumber', message: 'Slip number cannot be empty' }]
      }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const voucherNo = `VR-BK-${Date.now().toString().slice(-4)}`;

    const newDeposit = {
      id: `bkdep-${Date.now()}`,
      tenantId: tenantId || 'samity-ekota',
      bankName,
      accountNumber,
      branchName: branchName || '',
      depositDate: today,
      amount: Number(amount),
      slipNumber,
      status: 'APPROVED' as const,
      voucherNo,
      notes: notes || '',
      createdAt: today
    };

    return NextResponse.json({
      success: true,
      message: 'Bank deposit successfully recorded into ledger',
      data: newDeposit,
      meta: {},
      errors: []
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record bank deposit';
    return NextResponse.json({
      success: false,
      message,
      errorCode: 'INTERNAL_SERVER_ERROR',
      errors: []
    }, { status: 500 });
  }
}
