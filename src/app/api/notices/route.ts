import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_NOTICES } from '@/lib/db';

export function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const list = INITIAL_NOTICES.filter(n => n.tenantId === tenantId);

    return NextResponse.json({
      success: true,
      message: 'Notices retrieved successfully',
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
    const { tenantId, titleBn, contentBn, category, priority, publishedBy, publisherNameBn } = body;

    if (!titleBn || !contentBn) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed: title and content are required',
        errorCode: 'VALIDATION_ERROR',
        errors: [{ field: 'titleBn', message: 'Title cannot be blank' }]
      }, { status: 400 });
    }

    const newNotice = {
      id: `not-${Date.now()}`,
      tenantId: tenantId || 'samity-ekota',
      titleBn,
      titleEn: titleBn,
      contentBn,
      contentEn: contentBn,
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      publishedDate: new Date().toISOString().split('T')[0],
      publishedBy: publishedBy || 'user-admin',
      publisherNameBn: publisherNameBn || 'অ্যাডমিন',
      isPinned: false,
      viewCount: 1
    };

    return NextResponse.json({
      success: true,
      message: 'Notice successfully published',
      data: newNotice,
      meta: {},
      errors: []
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to publish notice';
    return NextResponse.json({
      success: false,
      message,
      errorCode: 'INTERNAL_SERVER_ERROR',
      errors: []
    }, { status: 500 });
  }
}
