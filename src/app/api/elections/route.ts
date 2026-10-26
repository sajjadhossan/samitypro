import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ELECTIONS } from '@/lib/db';
import { Election } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const status = request.nextUrl.searchParams.get('status');

    let list = INITIAL_ELECTIONS.filter(e => e.tenantId === tenantId && !e.deletedAt);
    if (status) {
      list = list.filter(e => e.status === status);
    }

    return NextResponse.json({
      success: true,
      message: 'Elections retrieved successfully',
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
    const { tenantId, titleBn, titleEn, termYears, electionDate, votingStartTime, votingEndTime, venue, posts } = body;

    if (!titleBn || !termYears || !electionDate) {
      return NextResponse.json({
        success: false,
        message: 'Validation error: required fields missing',
        errorCode: 'VALIDATION_ERROR',
        errors: [
          ...(!titleBn ? [{ field: 'titleBn', message: 'Election title in Bengali is required' }] : []),
          ...(!termYears ? [{ field: 'termYears', message: 'Term years is required' }] : []),
          ...(!electionDate ? [{ field: 'electionDate', message: 'Election date is required' }] : [])
        ]
      }, { status: 422 });
    }

    const newElection: Election = {
      id: `elec-${Date.now()}`,
      tenantId: tenantId || 'samity-ekota',
      electionNo: `ELEC-${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`,
      titleBn,
      titleEn: titleEn || titleBn,
      termYears,
      electionDate,
      votingStartTime: votingStartTime || 'সকাল ০৯:০০ ঘটিকা',
      votingEndTime: votingEndTime || 'বিকাল ০৪:০০ ঘটিকা',
      venue: venue || 'সমিতি প্রধান কার্যালয় অডিটোরিয়াম',
      status: 'ACTIVE',
      posts: posts || [
        { id: 'p1', post: 'PRESIDENT', titleBn: 'সভাপতি', titleEn: 'President', seatsCount: 1 },
        { id: 'p2', post: 'SECRETARY', titleBn: 'সাধারণ সম্পাদক', titleEn: 'General Secretary', seatsCount: 1 }
      ],
      totalEligibleVoters: 0,
      totalVotesCast: 0,
      candidates: [],
      createdAt: new Date().toISOString(),
      syncVersion: 1,
      isSynced: true
    };

    return NextResponse.json({
      success: true,
      message: 'Election created successfully',
      data: newElection,
      meta: {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1
      },
      errors: []
    }, { status: 201 });
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
