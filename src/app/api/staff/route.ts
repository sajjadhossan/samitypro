import { NextResponse } from 'next/server';
import { INITIAL_STAFF_EMPLOYEES } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'samity-ekota';

    const staff = INITIAL_STAFF_EMPLOYEES.filter(e => e.tenantId === tenantId);

    return NextResponse.json({
      success: true,
      message: 'স্টাফ তালিকা সফলভাবে প্রাপ্ত হয়েছে',
      data: staff,
      meta: {
        total: staff.length,
        page: 1,
        limit: staff.length
      },
      errors: []
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'স্টাফ ডাটা লোড করতে ব্যর্থ হয়েছে',
      errorCode: 'STAFF_FETCH_FAILED',
      errors: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.nameBn || !body.phone || !body.basicSalary) {
      return NextResponse.json({
        success: false,
        message: 'নাম, মোবাইল নম্বর এবং মূল বেতন আবশ্যক',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'nameBn', message: 'আবশ্যকীয় ফিল্ড পূরণ করা হয়নি' }]
      }, { status: 400 });
    }

    const newStaff = {
      id: `emp-${Date.now()}`,
      tenantId: body.tenantId || 'samity-ekota',
      employeeCode: `EMP-2026-${String(INITIAL_STAFF_EMPLOYEES.length + 1).padStart(2, '0')}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'নতুন কর্মকর্তা/কর্মচারী সফলভাবে নিবন্ধিত হয়েছে',
      data: newStaff,
      errors: []
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'স্টাফ নিবন্ধন ব্যর্থ',
      errorCode: 'STAFF_CREATE_FAILED',
      errors: []
    }, { status: 500 });
  }
}
