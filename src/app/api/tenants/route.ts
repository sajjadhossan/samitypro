import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TENANTS } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    success: true,
    tenants: INITIAL_TENANTS
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Tenant created successfully',
      tenant: {
        id: `tenant-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
