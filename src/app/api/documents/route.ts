import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_DOCUMENTS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const category = request.nextUrl.searchParams.get('category');

    let list = INITIAL_DOCUMENTS.filter(d => d.tenantId === tenantId);
    if (category && category !== 'ALL') {
      list = list.filter(d => d.category === category);
    }

    return NextResponse.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: list,
      meta: {
        page: 1,
        limit: 20,
        total: list.length,
        totalPages: 1
      },
      errors: []
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      errors: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, titleBn, category, fileNumber, descriptionBn, uploadedBy } = body;

    if (!titleBn) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed: title is required',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'titleBn', message: 'Document title cannot be empty' }]
      }, { status: 400 });
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      tenantId: tenantId || 'samity-ekota',
      titleBn,
      titleEn: titleBn,
      category: category || 'REGISTRATION',
      fileNumber: fileNumber || '',
      fileUrl: '/docs/sample.pdf',
      fileSize: '2.1 MB',
      uploadedBy: uploadedBy || 'user-admin',
      uploadedAt: new Date().toISOString().split('T')[0],
      descriptionBn: descriptionBn || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Document successfully registered in cloud vault',
      data: newDoc,
      meta: {},
      errors: []
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to upload document',
      errorCode: 'INTERNAL_SERVER_ERROR',
      errors: []
    }, { status: 500 });
  }
}
