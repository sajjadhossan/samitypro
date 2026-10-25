import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_LOANS } from '@/lib/db';

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const memberId = request.nextUrl.searchParams.get('memberId');

  let list = INITIAL_LOANS;
  if (tenantId) list = list.filter(l => l.tenantId === tenantId);
  if (memberId) list = list.filter(l => l.memberId === memberId);

  return NextResponse.json({
    success: true,
    loans: list
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({
      success: true,
      loan: {
        id: `loan-${Date.now()}`,
        ...data,
        loanNumber: `LN-EK-${new Date().getFullYear()}-${Date.now().toString().slice(-2)}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
