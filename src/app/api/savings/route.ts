import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SAVINGS_TRANSACTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const memberId = request.nextUrl.searchParams.get('memberId');
  
  let list = INITIAL_SAVINGS_TRANSACTIONS;
  if (tenantId) list = list.filter(t => t.tenantId === tenantId);
  if (memberId) list = list.filter(t => t.memberId === memberId);

  return NextResponse.json({
    success: true,
    transactions: list
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({
      success: true,
      transaction: {
        id: `stx-${Date.now()}`,
        ...data,
        receiptNo: `RCT-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
