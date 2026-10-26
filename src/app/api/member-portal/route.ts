import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { Member, Loan, SavingsTransaction, PaidReceipt, ApprovalItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'samity-ekota';
    const memberId = searchParams.get('memberId') || 'mem-001';

    const member = store.members.find((m: Member) => m.id === memberId && m.tenantId === tenantId);
    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: 'সদস্যের তথ্য পাওয়া যায়নি।',
          errorCode: 'MEMBER_NOT_FOUND',
          errors: [{ field: 'memberId', message: 'Member ID is invalid or not in this tenant' }]
        },
        { status: 404 }
      );
    }

    const memberLoans = store.loans.filter((l: Loan) => l.memberId === memberId && l.tenantId === tenantId);
    const memberTransactions = store.savingsTransactions.filter((tx: SavingsTransaction) => tx.memberId === memberId && tx.tenantId === tenantId);
    const memberReceipts = store.receipts.filter((r: PaidReceipt) => r.memberId === memberId && r.tenantId === tenantId);
    const memberRequests = store.approvalItems.filter((a: ApprovalItem) => a.tenantId === tenantId && (a.referenceId === memberId || a.details?.memberId === memberId));

    return NextResponse.json({
      success: true,
      message: 'মেম্বার পোর্টাল তথ্য সফলভাবে লোড হয়েছে।',
      data: {
        member,
        loans: memberLoans,
        transactions: memberTransactions,
        receipts: memberReceipts,
        requests: memberRequests
      },
      meta: {
        tenantId,
        memberId,
        fetchedAt: new Date().toISOString()
      },
      errors: []
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'মেম্বার পোর্টাল ডাটা লোড ব্যর্থ হয়েছে।',
        errorCode: 'MEMBER_PORTAL_FETCH_ERROR',
        errors: [{ field: 'server', message: err?.message || 'Server error' }]
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, memberId, requestType, amount, titleBn, details } = body;

    if (!tenantId || !memberId || !requestType) {
      return NextResponse.json(
        {
          success: false,
          message: 'প্রয়োজনীয় ফিল্ড পূরণ করা হয়নি।',
          errorCode: 'VALIDATION_ERROR',
          errors: [{ field: 'form', message: 'tenantId, memberId, requestType are required' }]
        },
        { status: 400 }
      );
    }

    const member = store.members.find((m: Member) => m.id === memberId && m.tenantId === tenantId);
    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: 'সদস্য পাওয়া যায়নি।',
          errorCode: 'MEMBER_NOT_FOUND',
          errors: [{ field: 'memberId', message: 'Member not found' }]
        },
        { status: 404 }
      );
    }

    store.addApprovalItem({
      tenantId,
      type: requestType,
      titleBn: titleBn || `${member.nameBn} - ${requestType}`,
      requestedBy: member.nameBn,
      amount: Number(amount) || 0,
      status: 'PENDING',
      referenceId: memberId,
      details: {
        ...details,
        memberId,
        memberCode: member.memberCode,
        phone: member.phone
      }
    });

    store.addEvent({
      tenantId,
      type: 'NEW_MEMBER_JOINED',
      titleBn: 'মেম্বার পোর্টাল থেকে নতুন আবেদন',
      titleEn: 'New Member Service Request',
      messageBn: `${member.nameBn} (${member.memberCode}) এর পক্ষ থেকে নতুন আবেদন জমা হয়েছে: ${titleBn}`,
      messageEn: `New service request submitted by ${member.nameEn}`,
      amount: Number(amount) || 0
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে। সমিতির নির্বাহী কমিটি পর্যালোচনা করে অনুমোদন দেবে।',
      data: {
        memberId,
        requestType,
        status: 'PENDING'
      },
      meta: {
        submittedAt: new Date().toISOString()
      },
      errors: []
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'আবেদন প্রক্রিয়াকরণ ব্যর্থ হয়েছে।',
        errorCode: 'MEMBER_REQUEST_ERROR',
        errors: [{ field: 'server', message: err?.message || 'Server error' }]
      },
      { status: 500 }
    );
  }
}
