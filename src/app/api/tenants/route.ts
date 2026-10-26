import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TENANTS } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Tenants retrieved successfully',
    data: INITIAL_TENANTS,
    meta: {
      total: INITIAL_TENANTS.length,
      timestamp: new Date().toISOString()
    },
    errors: []
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const newTenant = {
      id: data.id || `tenant-${Date.now()}`,
      samityId: data.samityId || `SAMITY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      ...data,
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      message: 'Samity created successfully',
      data: newTenant,
      errors: []
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: err.message || 'Failed to create Samity',
      errorCode: 'VALIDATION_ERROR',
      errors: [{ field: 'root', message: err.message }]
    }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Samity updated successfully',
      data: {
        ...data,
        updatedAt: new Date().toISOString().split('T')[0]
      },
      errors: []
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: err.message || 'Failed to update Samity',
      errorCode: 'UPDATE_FAILED',
      errors: [{ field: 'root', message: err.message }]
    }, { status: 400 });
  }
}
