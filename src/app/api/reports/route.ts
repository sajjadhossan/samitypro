import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { Loan, Member, SavingsTransaction, PaidReceipt } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'samity-ekota';
    const type = searchParams.get('type') || 'SUMMARY';
    const memberId = searchParams.get('memberId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (type === 'BALANCE_SHEET') {
      const bs = store.getBalanceSheet(tenantId);
      return NextResponse.json({
        success: true,
        message: 'আর্থিক ব্যালান্স শিট সফলভাবে লোড হয়েছে।',
        data: bs,
        meta: { tenantId, type, asOfDate: new Date().toISOString() },
        errors: []
      });
    }

    if (type === 'INCOME_EXPENDITURE') {
      const is = store.getIncomeStatement(tenantId);
      return NextResponse.json({
        success: true,
        message: 'আয়-ব্যয় বিবরণী সফলভাবে লোড হয়েছে।',
        data: is,
        meta: { tenantId, type, startDate, endDate },
        errors: []
      });
    }

    if (type === 'TRIAL_BALANCE') {
      const tb = store.getTrialBalance(tenantId);
      return NextResponse.json({
        success: true,
        message: 'রেওয়ামিল (ট্রায়াল ব্যালেন্স) সফলভাবে লোড হয়েছে।',
        data: tb,
        meta: { tenantId, type, totalDebit: tb.totalDebit, totalCredit: tb.totalCredit },
        errors: []
      });
    }

    if (type === 'DEFAULTERS') {
      const loans = store.loans.filter((l: Loan) => l.tenantId === tenantId && (l.status === 'DEFAULTED' || l.installments.some((ins) => ins.status === 'OVERDUE')));
      const defaulters = loans.map((l: Loan) => {
        const mem = store.members.find((m: Member) => m.id === l.memberId);
        const overdueInstallments = l.installments.filter((ins) => ins.status === 'OVERDUE');
        const overdueAmount = overdueInstallments.reduce((sum: number, ins) => sum + (ins.totalDue - (ins.paidAmount || 0)), 0);
        return {
          loanId: l.id,
          loanNumber: l.loanNumber,
          memberId: l.memberId,
          memberCode: mem?.memberCode,
          memberNameBn: mem?.nameBn,
          phone: mem?.phone,
          principalAmount: l.principalAmount,
          outstandingBalance: l.outstandingBalance,
          overdueInstallmentsCount: overdueInstallments.length,
          overdueAmount,
          guarantorName: l.guarantor1?.name,
          guarantorPhone: l.guarantor1?.phone
        };
      });

      return NextResponse.json({
        success: true,
        message: 'খেলাপি ঋণ গ্রহীতাদের তালিকা প্রস্তুত করা হয়েছে।',
        data: defaulters,
        meta: { tenantId, type, totalDefaulters: defaulters.length },
        errors: []
      });
    }

    if (type === 'PASSBOOK' && memberId) {
      const member = store.members.find((m: Member) => m.id === memberId && m.tenantId === tenantId);
      const savingsTx = store.savingsTransactions.filter((tx: SavingsTransaction) => tx.memberId === memberId && tx.tenantId === tenantId);
      const memberLoans = store.loans.filter((l: Loan) => l.memberId === memberId && l.tenantId === tenantId);
      const memberReceipts = store.receipts.filter((r: PaidReceipt) => r.memberId === memberId && r.tenantId === tenantId);

      return NextResponse.json({
        success: true,
        message: 'সদস্যের পূর্ণাঙ্গ পাসবই লেজার লোড হয়েছে।',
        data: {
          member,
          savingsTransactions: savingsTx,
          loans: memberLoans,
          receipts: memberReceipts
        },
        meta: { tenantId, memberId, type },
        errors: []
      });
    }

    // Default: General Summary Report
    const totalMembers = store.members.filter((m: Member) => m.tenantId === tenantId).length;
    const activeLoans = store.loans.filter((l: Loan) => l.tenantId === tenantId && l.status === 'ACTIVE');
    const totalSavingsBalance = store.members.filter((m: Member) => m.tenantId === tenantId).reduce((sum: number, m: Member) => sum + (m.savingsBalance || 0), 0);
    const totalLoanOutstanding = activeLoans.reduce((sum: number, l: Loan) => sum + (l.outstandingBalance || 0), 0);
    const tb = store.getTrialBalance(tenantId);

    return NextResponse.json({
      success: true,
      message: 'সমিতির সামগ্রিক আর্থিক সারসংক্ষেপ রিপোর্ট লোড হয়েছে।',
      data: {
        totalMembers,
        activeLoansCount: activeLoans.length,
        totalSavingsBalance,
        totalLoanOutstanding,
        isTrialBalanceBalanced: tb.isBalanced,
        totalDebit: tb.totalDebit,
        totalCredit: tb.totalCredit
      },
      meta: {
        tenantId,
        generatedAt: new Date().toISOString()
      },
      errors: []
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'রিপোর্ট লোড করতে ব্যর্থ হয়েছে।',
        errorCode: 'REPORT_FETCH_ERROR',
        errors: [{ field: 'server', message: err?.message || 'Unknown server error' }]
      },
      { status: 500 }
    );
  }
}
