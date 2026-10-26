import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MEETINGS } from '@/lib/db';
import { Meeting } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const status = request.nextUrl.searchParams.get('status');
    const type = request.nextUrl.searchParams.get('type');
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase();

    let list = INITIAL_MEETINGS.filter(m => m.tenantId === tenantId && !m.deletedAt);

    if (status) {
      list = list.filter(m => m.status === status);
    }
    if (type) {
      list = list.filter(m => m.type === type);
    }
    if (search) {
      list = list.filter(m => 
        m.titleBn.toLowerCase().includes(search) || 
        m.titleEn.toLowerCase().includes(search) ||
        (m.meetingNo && m.meetingNo.toLowerCase().includes(search)) ||
        m.venue.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meetings retrieved successfully',
      data: list,
      meta: {
        page: 1,
        limit: 50,
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
    const { 
      tenantId, titleBn, titleEn, type, date, time, venue, 
      chairpersonNameBn, recordingSecretaryNameBn, targetAudience, quorumRequired, agenda 
    } = body;

    if (!titleBn || !type || !date || !time || !venue) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed: required fields missing',
        errorCode: 'VALIDATION_ERROR',
        errors: [
          ...(!titleBn ? [{ field: 'titleBn', message: 'Meeting title in Bengali is required' }] : []),
          ...(!type ? [{ field: 'type', message: 'Meeting type is required' }] : []),
          ...(!date ? [{ field: 'date', message: 'Meeting date is required' }] : []),
          ...(!time ? [{ field: 'time', message: 'Meeting time is required' }] : []),
          ...(!venue ? [{ field: 'venue', message: 'Meeting venue is required' }] : [])
        ]
      }, { status: 422 });
    }

    const newMeeting: Meeting = {
      id: `mtg-${Date.now()}`,
      tenantId: tenantId || 'samity-ekota',
      meetingNo: body.meetingNo || `${type}-${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`,
      titleBn,
      titleEn: titleEn || titleBn,
      type,
      date,
      time,
      venue,
      chairpersonNameBn: chairpersonNameBn || 'সভাপতি',
      recordingSecretaryNameBn: recordingSecretaryNameBn || 'সাধারণ সম্পাদক',
      targetAudience: targetAudience || 'ALL_MEMBERS',
      quorumRequired: quorumRequired || 10,
      quorumPresent: 0,
      isQuorumMet: false,
      agenda: agenda || [],
      resolutions: [],
      totalAttendees: 0,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      syncVersion: 1,
      isSynced: true
    };

    return NextResponse.json({
      success: true,
      message: 'Meeting created successfully',
      data: newMeeting,
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
