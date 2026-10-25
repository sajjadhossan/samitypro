import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PAID_RECEIPTS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const receiptNo = request.nextUrl.searchParams.get('receiptNo');
    const memberId = request.nextUrl.searchParams.get('memberId');

    let list = INITIAL_PAID_RECEIPTS.filter(r => r.tenantId === tenantId);
    if (receiptNo) list = list.filter(r => r.receiptNo === receiptNo);
    if (memberId) list = list.filter(r => r.memberId === memberId);

    return NextResponse.json({
      success: true,
      message: 'Receipts retrieved successfully',
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
