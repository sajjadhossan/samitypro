import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MEMBERS } from '@/lib/db';

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const list = tenantId 
    ? INITIAL_MEMBERS.filter(m => m.tenantId === tenantId)
    : INITIAL_MEMBERS;

  return NextResponse.json({
    success: true,
    members: list
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({
      success: true,
      member: {
        id: `mem-${Date.now().toString().slice(-4)}`,
        ...data,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
