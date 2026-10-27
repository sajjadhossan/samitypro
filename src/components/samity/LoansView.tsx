'use client';

import React, { useState } from 'react';
import { 
  HandCoins, Plus, Search, Filter, CheckCircle2, AlertCircle, 
  Calendar, ArrowUpRight, TrendingUp, ShieldAlert, FileText, 
  Printer, X, ChevronRight, Sliders, DollarSign, UserCheck, 
  Clock, Check, RefreshCw, Send, ShieldCheck, Sparkles, Building2,
  AlertTriangle, Receipt, BadgePercent, ArrowDownRight
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';
import { 
  Loan, LoanStatus, PaymentMethod, LoanInterestMethod, 
  LoanFrequency, PaidReceipt, LoanGuarantor 
} from '@/types';
import confetti from 'canvas-confetti';
import { ActionMenu } from '@/components/common/ActionMenu';

interface LoansViewProps {
  onOpenCollectInstallment?: (loanId?: string) => void;
}

export function LoansView({ onOpenCollectInstallment }: LoansViewProps) {
  const { 
    language, activeTenant, currentUser, loans, members, 
    loanPolicy, applyLoan, approveOrRejectLoan, disburseLoan, 
    collectLoanInstallment, waiveLoanPenalty, updateLoanPolicy 
  } = useSamityStore();
  const t = translations[language];

  // Tab State
  const [activeTab, setActiveTab] = useState<'loans-list' | 'apply-loan' | 'collect-emi' | 'disbursement-desk' | 'policy-settings'>('loans-list');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LoanStatus>('ALL');

  // Modals
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<Loan | null>(null);
  const [selectedLoanForApproval, setSelectedLoanForApproval] = useState<Loan | null>(null);
  const [approvalNotesInput, setApprovalNotesInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<PaidReceipt | null>(null);

  // New Application Form State
  const [applyMemberId, setApplyMemberId] = useState('');
  const [applyScheme, setApplyScheme] = useState('ক্ষুদ্র ব্যবসা সম্প্রসারণ ঋণ');
  const [applyPrincipal, setApplyPrincipal] = useState<number>(50000);
  const [applyInterestRate, setApplyInterestRate] = useState<number>(loanPolicy?.defaultInterestRate || 10.0);
  const [applyInterestMethod, setApplyInterestMethod] = useState<LoanInterestMethod>('FLAT');
  const [applyDurationMonths, setApplyDurationMonths] = useState<number>(12);
  const [applyFrequency, setApplyFrequency] = useState<LoanFrequency>('MONTHLY');
  const [applyPurpose, setApplyPurpose] = useState('ব্যবসায়িক চলতি পুঁজি ও ইনভেন্টরি বৃদ্ধি');
  const [applyCollateral, setApplyCollateral] = useState('');
  const [applyAutoApprove, setApplyAutoApprove] = useState(false);
  const [applyGuarantor1Name, setApplyGuarantor1Name] = useState('');
  const [applyGuarantor1Phone, setApplyGuarantor1Phone] = useState('');
  const [applyGuarantor1Relation, setApplyGuarantor1Relation] = useState('সমিতির সদস্য');
  const [applyGuarantor1Nid, setApplyGuarantor1Nid] = useState('');
  const [applyGuarantor1MemberId, setApplyGuarantor1MemberId] = useState('');
  // Guarantor 2 State
  const [applyGuarantor2Name, setApplyGuarantor2Name] = useState('');
  const [applyGuarantor2Phone, setApplyGuarantor2Phone] = useState('');
  const [applyGuarantor2Relation, setApplyGuarantor2Relation] = useState('');
  const [applyGuarantor2Nid, setApplyGuarantor2Nid] = useState('');
  // Security Cheque State
  const [applyChequeBank, setApplyChequeBank] = useState('সোনালী ব্যাংক লিমিটেড');
  const [applyChequeNo, setApplyChequeNo] = useState('');
  const [applyChequeAmount, setApplyChequeAmount] = useState<number>(0);
  const [selectedLoanForSanctionLetter, setSelectedLoanForSanctionLetter] = useState<Loan | null>(null);
  const [applySuccessMessage, setApplySuccessMessage] = useState('');

  // Collect EMI Form State
  const [collectLoanId, setCollectLoanId] = useState('');
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectPaymentMethod, setCollectPaymentMethod] = useState<PaymentMethod>('CASH');
  const [collectNotes, setCollectNotes] = useState('নিয়মিত ঋণের কিস্তি পরিশোধ');
  const [collectSuccessMessage, setCollectSuccessMessage] = useState('');

  // Disbursement Form State
  const [disburseLoanId, setDisburseLoanId] = useState('');
  const [disburseDate, setDisburseDate] = useState(new Date().toISOString().split('T')[0]);
  const [disburseMethod, setDisburseMethod] = useState<PaymentMethod>('BANK');
  const [disburseNotes, setDisburseNotes] = useState('অনুমোদিত ঋণ একাউন্টে ট্রান্সফার করা হলো');

  // Policy Form State
  const [policyForm, setPolicyForm] = useState({
    minLoanAmount: loanPolicy?.minLoanAmount || 5000,
    maxLoanAmount: loanPolicy?.maxLoanAmount || 500000,
    defaultInterestRate: loanPolicy?.defaultInterestRate || 10.0,
    defaultInterestMethod: loanPolicy?.defaultInterestMethod || 'FLAT',
    defaultDurationMonths: loanPolicy?.defaultDurationMonths || 12,
    maxLoanToSavingsRatio: loanPolicy?.maxLoanToSavingsRatio || 3.0,
    processingFeePercent: loanPolicy?.processingFeePercent || 1.0,
    lateFinePerInstallment: loanPolicy?.lateFinePerInstallment || 100,
    gracePeriodDays: loanPolicy?.gracePeriodDays || 7,
    requireGuarantor: loanPolicy?.requireGuarantor ?? true,
    requireSecurityCheque: loanPolicy?.requireSecurityCheque ?? true
  });
  const [policySaved, setPolicySaved] = useState(false);

  // Calculations for KPIs
  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const pendingLoans = loans.filter(l => l.status === 'PENDING');
  const approvedLoans = loans.filter(l => l.status === 'APPROVED');
  const completedLoans = loans.filter(l => l.status === 'COMPLETED');

  const totalDisbursed = loans.reduce((sum, l) => sum + (l.status !== 'PENDING' && l.status !== 'REJECTED' ? l.principalAmount : 0), 0);
  const totalRepaid = loans.reduce((sum, l) => sum + l.totalPaid, 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + (l.status === 'ACTIVE' ? l.outstandingBalance : 0), 0);
  
  // Calculate overdue loans
  const overdueCount = activeLoans.filter(l => l.installments.some(i => i.status === 'OVERDUE')).length;

  // Filtered Loans
  const filteredLoans = loans.filter(l => {
    const member = members.find(m => m.id === l.memberId);
    const matchesSearch = 
      l.loanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.loanScheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member?.nameBn && member.nameBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member?.memberCode && member.memberCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member?.phone && member.phone.includes(searchQuery));
    
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Simulator calculation for Application tab
  const simDurationYears = applyDurationMonths / 12;
  const simTotalInterest = Math.round(applyPrincipal * (applyInterestRate / 100) * simDurationYears);
  const simTotalPayable = applyPrincipal + simTotalInterest;
  let simInstallmentCount = applyDurationMonths;
  if (applyFrequency === 'WEEKLY') simInstallmentCount = applyDurationMonths * 4;
  else if (applyFrequency === 'DAILY') simInstallmentCount = applyDurationMonths * 30;
  const simInstallmentAmount = Math.round(simTotalPayable / (simInstallmentCount || 1));
  const simProcessingFee = Math.round(applyPrincipal * ((loanPolicy?.processingFeePercent || 1) / 100));

  // Selected Member Info for Application
  const selectedMemberObj = members.find(m => m.id === applyMemberId);
  const maxAllowedLoan = selectedMemberObj ? (selectedMemberObj.savingsBalance + selectedMemberObj.dpsBalance) * (loanPolicy?.maxLoanToSavingsRatio || 3.0) : 0;

  // Handle Application Submit
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyMemberId || applyPrincipal <= 0) return;

    const g1: LoanGuarantor | undefined = applyGuarantor1Name ? {
      name: applyGuarantor1Name,
      phone: applyGuarantor1Phone,
      relation: applyGuarantor1Relation,
      nid: applyGuarantor1Nid,
      memberId: applyGuarantor1MemberId || undefined
    } : undefined;

    const g2: LoanGuarantor | undefined = applyGuarantor2Name ? {
      name: applyGuarantor2Name,
      phone: applyGuarantor2Phone,
      relation: applyGuarantor2Relation || 'জামিনদার ২',
      nid: applyGuarantor2Nid
    } : undefined;

    const collateralSummary = [
      applyCollateral,
      applyChequeNo ? `সিকিউরিটি চেক নং: ${applyChequeNo} (${applyChequeBank}, ৳${applyChequeAmount || applyPrincipal})` : ''
    ].filter(Boolean).join(' | ');

    const newLoan = applyLoan({
      tenantId: activeTenant.id,
      memberId: applyMemberId,
      loanScheme: applyScheme,
      principalAmount: applyPrincipal,
      interestRatePercent: applyInterestRate,
      interestMethod: applyInterestMethod,
      durationMonths: applyDurationMonths,
      installmentFrequency: applyFrequency,
      purpose: applyPurpose,
      processingFee: simProcessingFee,
      guarantor1: g1,
      guarantor2: g2,
      collateralDetails: collateralSummary,
      autoApprove: applyAutoApprove,
      approvalNotes: applyAutoApprove ? 'অ্যাডমিন কর্তৃক সরাসরি অনুমোদন' : undefined
    });

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setApplySuccessMessage(`ঋণ আবেদন সফলভাবে তৈরি হয়েছে! ঋণ নম্বর: ${newLoan.loanNumber}`);
    setTimeout(() => {
      setApplySuccessMessage('');
      setActiveTab('loans-list');
    }, 2000);
  };

  // Handle Repayment Submit
  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectLoanId || collectAmount <= 0) return;

    const res = collectLoanInstallment({
      tenantId: activeTenant.id,
      loanId: collectLoanId,
      amount: collectAmount,
      paymentMethod: collectPaymentMethod,
      notes: collectNotes
    });

    if (res) {
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      setSelectedReceiptForPrint(res.receipt);
      setCollectSuccessMessage(`৳${collectAmount.toLocaleString()} কিস্তি সফলভাবে গ্রহণ করা হয়েছে!`);
      setTimeout(() => setCollectSuccessMessage(''), 3000);
    }
  };

  // Handle Disbursement
  const handleDisburseSubmit = (loanId: string) => {
    const res = disburseLoan({
      tenantId: activeTenant.id,
      loanId,
      disbursementDate: disburseDate,
      paymentMethod: disburseMethod,
      notes: disburseNotes
    });
    if (res) {
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch {}
      setActiveTab('loans-list');
    }
  };

  // Handle Approval / Rejection
  const handleApprovalAction = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedLoanForApproval) return;
    approveOrRejectLoan({
      tenantId: activeTenant.id,
      loanId: selectedLoanForApproval.id,
      status,
      notes: approvalNotesInput,
      rejectionReason: rejectionReasonInput
    });
    setSelectedLoanForApproval(null);
    setApprovalNotesInput('');
    setRejectionReasonInput('');
  };

  // Handle Policy Save
  const handlePolicySave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLoanPolicy(policyForm);
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HandCoins className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {language === 'bn' ? 'ঋণ ও কিস্তি ব্যবস্থাপনা' : 'Loan & Microcredit Management'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  মডিউল ৫
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'ক্ষুদ্র ঋণ আবেদন, কমিটি অনুমোদন, ক্যাশ আউট বিতরণ, কিস্তি আদায় ও ডিজিটাল ঋণ লেজার' 
                  : 'Microfinance loan approval, disbursement cash out, EMI collections & ledger'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tab Switch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('apply-loan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm ${
              activeTab === 'apply-loan'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন ঋণ আবেদন' : 'Apply Loan'}</span>
          </button>

          <button
            onClick={() => {
              if (activeLoans.length > 0) {
                setCollectLoanId(activeLoans[0].id);
                setCollectAmount(activeLoans[0].installmentAmount);
              }
              setActiveTab('collect-emi');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm ${
              activeTab === 'collect-emi'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'কিস্তি আদায়' : 'Collect EMI'}</span>
          </button>

          <button
            onClick={() => setActiveTab('disbursement-desk')}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm ${
              activeTab === 'disbursement-desk'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'ঋণ বিতরণ ডেস্ক' : 'Disbursement'}</span>
            {approvedLoans.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {approvedLoans.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Bar Navigation */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('loans-list')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeTab === 'loans-list'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          <span>{language === 'bn' ? 'ঋণ পোর্টফোলিও ও হিসাবসমূহ' : 'Loans Portfolio'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
            {loans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('apply-loan')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeTab === 'apply-loan'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন ঋণ আবেদন উইজার্ড' : 'New Loan Application'}</span>
        </button>

        <button
          onClick={() => setActiveTab('collect-emi')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeTab === 'collect-emi'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{language === 'bn' ? 'কিস্তি আদায় ও মানি রিসিট' : 'Collect EMI & Receipts'}</span>
        </button>

        <button
          onClick={() => setActiveTab('disbursement-desk')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeTab === 'disbursement-desk'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{language === 'bn' ? 'বিতরণ ও ক্যাশ আউট ডেস্ক' : 'Disbursement Desk'}</span>
          {approvedLoans.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {approvedLoans.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('policy-settings')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeTab === 'policy-settings'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{language === 'bn' ? 'ঋণ নীতিমালা ও অনুপাত' : 'Loan Policy & Limits'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ঋণ হিসাবসমূহ ও পোর্টফোলিও (LOANS LIST) */}
      {/* ============================================================== */}
      {activeTab === 'loans-list' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{language === 'bn' ? 'মোট বিতরণকৃত ঋণ তহবিল' : 'Total Disbursed Fund'}</span>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <HandCoins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {formatCurrency(totalDisbursed, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>সচল ঋণ: {activeLoans.length} টি</span>
                <span className="text-cyan-400 font-medium">সমাপ্ত: {completedLoans.length} টি</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{language === 'bn' ? 'মোট আদায়কৃত আসল ও সুদ' : 'Total Collected Repayments'}</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                {formatCurrency(totalRepaid, language)}
              </div>
              <div className="text-[11px] text-emerald-500/90 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ক্যাশবুকে নিয়মিত ক্রেডিট সম্পন্ন</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{language === 'bn' ? 'বর্তমান বকেয়া ঋণ স্থিতি' : 'Current Outstanding Balance'}</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {formatCurrency(totalOutstanding, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                চলতি কিস্তির বিপরীতে আদায়যোগ্য
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{language === 'bn' ? 'খেলাপী কিস্তি ও ওভারডিউ রিস্ক' : 'Overdue & Default Risk'}</span>
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
                {overdueCount} <span className="text-sm font-normal text-slate-400 font-sans">টি ঋণ একাউন্ট</span>
              </div>
              <div className="text-[11px] text-rose-400/90 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>তাগাদা নোটিশ ও জরিমানা প্রযোজ্য</span>
              </div>
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'ঋণ নং, সদস্যের নাম, মোবাইল বা কোড লিখুন...' : 'Search loan no, member name, code...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                সব ({loans.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                সচল ({activeLoans.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                অপেক্ষমাণ আবেদন ({pendingLoans.length})
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  statusFilter === 'APPROVED'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                অনুমোদিত ({approvedLoans.length})
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  statusFilter === 'COMPLETED'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                পরিশোধিত ({completedLoans.length})
              </button>
            </div>
          </div>

          {/* Loans Directory Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">ঋণ নম্বর ও স্কিম</th>
                    <th className="py-3 px-4">ঋণগ্রহীতা সদস্য</th>
                    <th className="py-3 px-4">মূল ঋণ ও সুদ</th>
                    <th className="py-3 px-4">কিস্তির অগ্রগতি</th>
                    <th className="py-3 px-4">বর্তমান বকেয়া</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500 font-sans">
                        কোনো ঋণ হিসাব পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map(loan => {
                      const member = members.find(m => m.id === loan.memberId);
                      const progressPercent = Math.round((loan.paidInstallments / (loan.totalInstallments || 1)) * 100);
                      const hasOverdue = loan.installments.some(i => i.status === 'OVERDUE');

                      return (
                        <tr key={loan.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-sans">
                            <div className="font-semibold text-cyan-400 font-mono flex items-center gap-1.5">
                              <span>{loan.loanNumber}</span>
                              {hasOverdue && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-sans font-bold">
                                  বিলম্বিত
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">{loan.loanScheme}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {loan.installmentFrequency === 'MONTHLY' ? 'মাসিক' : loan.installmentFrequency === 'WEEKLY' ? 'সাপ্তাহিক' : 'দৈনিক'} কিস্তি: ৳{loan.installmentAmount.toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-sans">
                            <div className="font-semibold text-slate-100">{member?.nameBn || 'সদস্য'}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{member?.memberCode} • {member?.phone}</div>
                            <div className="text-[10px] text-slate-500">
                              সঞ্চয় স্থিতি: ৳{(member?.savingsBalance || 0).toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-100">৳ {loan.principalAmount.toLocaleString()}</div>
                            <div className="text-[11px] text-slate-400">
                              {loan.interestRatePercent}% সুদ ({loan.durationMonths} মাস)
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans">
                              মোট প্রদেয়: ৳ {loan.totalPayable.toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-slate-300 font-sans">{loan.paidInstallments} / {loan.totalInstallments} কিস্তি</span>
                              <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              আদায়: ৳ {loan.totalPaid.toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-bold text-amber-400">
                            {loan.status === 'COMPLETED' ? (
                              <span className="text-emerald-400 font-sans">৳ ০ (পরিশোধিত)</span>
                            ) : (
                              formatCurrency(loan.outstandingBalance, language)
                            )}
                          </td>

                          <td className="py-3 px-4 font-sans">
                            {loan.status === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                সচল ঋণ
                              </span>
                            )}
                            {loan.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3 h-3" />
                                অপেক্ষমাণ আবেদন
                              </span>
                            )}
                            {loan.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                <ShieldCheck className="w-3 h-3" />
                                অনুমোদিত (বিতরণহীন)
                              </span>
                            )}
                            {loan.status === 'COMPLETED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                <Check className="w-3 h-3" />
                                সমাপ্ত ঋণ
                              </span>
                            )}
                            {loan.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <X className="w-3 h-3" />
                                বাতিলকৃত
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-sans">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Pending Review Action */}
                              {loan.status === 'PENDING' && (
                                <button
                                  onClick={() => setSelectedLoanForApproval(loan)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition"
                                >
                                  যাচাই ও অনুমোদন
                                </button>
                              )}

                              {/* Approved -> Disburse Action */}
                              {loan.status === 'APPROVED' && (
                                <button
                                  onClick={() => {
                                    setDisburseLoanId(loan.id);
                                    setActiveTab('disbursement-desk');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition"
                                >
                                  বিতরণ করুন
                                </button>
                              )}

                              {/* Active -> Collect EMI Action */}
                              {loan.status === 'ACTIVE' && (
                                <button
                                  onClick={() => {
                                    setCollectLoanId(loan.id);
                                    setCollectAmount(loan.installmentAmount);
                                    setActiveTab('collect-emi');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition"
                                >
                                  কিস্তি আদায়
                                </button>
                              )}

                              {/* Action Menu */}
                              <ActionMenu
                                options={{
                                  onView: () => setSelectedLoanForSchedule(loan),
                                  onPrint: () => setSelectedLoanForSanctionLetter(loan),
                                  onDownloadPdf: () => setSelectedLoanForSanctionLetter(loan),
                                  customItems: [
                                    {
                                      labelBn: 'মঞ্জুরিপত্র প্রিন্ট',
                                      labelEn: 'Sanction Letter',
                                      icon: Printer,
                                      onClick: () => setSelectedLoanForSanctionLetter(loan)
                                    },
                                    {
                                      labelBn: 'কিস্তি সূচি ও লেজার',
                                      labelEn: 'Repayment Schedule',
                                      icon: Calendar,
                                      onClick: () => setSelectedLoanForSchedule(loan)
                                    }
                                  ]
                                }}
                                itemName={loan.loanNumber}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: নতুন ঋণ আবেদন উইজার্ড (APPLY LOAN) */}
      {/* ============================================================== */}
      {activeTab === 'apply-loan' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-6">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>{language === 'bn' ? 'নতুন ঋণ আবেদন ও অনুমোদন উইজার্ড' : 'New Loan Application Wizard'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                সদস্যের সঞ্চয় স্থিতি মূল্যায়ন, কিস্তি সূচি সিমুলেশন এবং জামিনদার তথ্য এন্ট্রি
              </p>
            </div>
            <button
              onClick={() => setActiveTab('loans-list')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              বাতিল
            </button>
          </div>

          {applySuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{applySuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleApplySubmit} className="space-y-6 text-xs sm:text-sm">
            
            {/* Step 1: Member Selector with Live Balance Preview */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">
                  ১. ঋণগ্রহীতা সদস্য নির্বাচন করুন *
                </label>
                {selectedMemberObj && (
                  <span className="text-[11px] text-cyan-400 font-medium">
                    সঞ্চয় স্থিতি: ৳{(selectedMemberObj.savingsBalance + selectedMemberObj.dpsBalance).toLocaleString()} • সর্বোচ্চ ঋণসীমা (৩ গুণ): ৳{maxAllowedLoan.toLocaleString()}
                  </span>
                )}
              </div>

              <select
                required
                value={applyMemberId}
                onChange={e => setApplyMemberId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="">-- সদস্য নির্বাচন করুন --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nameBn} ({m.memberCode}) — মোবাইল: {m.phone} — সঞ্চয়: ৳{(m.savingsBalance + m.dpsBalance).toLocaleString()}
                  </option>
                ))}
              </select>

              {selectedMemberObj && selectedMemberObj.loanOutstanding > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    সতর্কতা: এই সদস্যের পূর্বের একটি সক্রিয় ঋণে ৳{selectedMemberObj.loanOutstanding.toLocaleString()} বকেয়া রয়েছে।
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Loan Scheme & Loan Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">ঋণ স্কিম বা প্রকল্পের ধরন *</label>
                <select
                  value={applyScheme}
                  onChange={e => setApplyScheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="ক্ষুদ্র ব্যবসা সম্প্রসারণ ঋণ">ক্ষুদ্র ব্যবসা সম্প্রসারণ ঋণ</option>
                  <option value="সাধারণ সমবায় ঋণ">সাধারণ সমবায় ঋণ</option>
                  <option value="জরুরি পারিবারিক সহায়তা ঋণ">জরুরি পারিবারিক সহায়তা ঋণ</option>
                  <option value="কৃষি ও মৎস্য খামার ঋণ">কৃষি ও মৎস্য খামার ঋণ</option>
                  <option value="মহিলা উদ্যোক্তা ও কুটির শিল্প ঋণ">মহিলা উদ্যোক্তা ও কুটির শিল্প ঋণ</option>
                  <option value="কম্পিউটার ও আইটি শিক্ষা ঋণ">কম্পিউটার ও আইটি শিক্ষা ঋণ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">মূল ঋণ তহবিল (Principal) *</label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={applyPrincipal}
                  onChange={e => setApplyPrincipal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold focus:ring-1 focus:ring-cyan-500"
                />
                <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                  {[20000, 50000, 100000, 200000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setApplyPrincipal(amt)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                    >
                      ৳{(amt/1000)}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">বার্ষিক সুদের হার (%) *</label>
                <input
                  type="number"
                  step={0.5}
                  value={applyInterestRate}
                  onChange={e => setApplyInterestRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:ring-1 focus:ring-cyan-500"
                />
                <span className="text-[10px] text-slate-500">স্ট্যান্ডার্ড মাইক্রোক্রেডিট রেট: ১০%</span>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">ঋণের সময়কাল (মাস) *</label>
                <select
                  value={applyDurationMonths}
                  onChange={e => setApplyDurationMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
                >
                  <option value={3}>৩ মাস (স্বল্পমেয়াদী)</option>
                  <option value={6}>৬ মাস</option>
                  <option value={10}>১০ মাস</option>
                  <option value={12}>১২ মাস (১ বছর)</option>
                  <option value={18}>১৮ মাস (দেড় বছর)</option>
                  <option value={24}>২৪ মাস (২ বছর)</option>
                  <option value={36}>৩৬ মাস (৩ বছর)</option>
                </select>
              </div>
            </div>

            {/* Interest Method & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">সুদ গণনার পদ্ধতি *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyInterestMethod('FLAT')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      applyInterestMethod === 'FLAT'
                        ? 'border-cyan-500 bg-cyan-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">ফ্ল্যাট রেট (Flat Rate)</div>
                    <div className="text-[10px] text-slate-500">মূল ঋণের উপর সরল সুদ (মাইক্রোফিনান্স স্ট্যান্ডার্ড)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyInterestMethod('REDUCING')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      applyInterestMethod === 'REDUCING'
                        ? 'border-cyan-500 bg-cyan-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">হ্রাসমান পদ্ধতি (Reducing)</div>
                    <div className="text-[10px] text-slate-500">অবশিষ্ট মূলধনের ওপর কিস্তিভিত্তিক হ্রাসমান মুনাফা</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">কিস্তির সময়সূচি (Frequency) *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyFrequency('MONTHLY')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      applyFrequency === 'MONTHLY'
                        ? 'border-cyan-500 bg-cyan-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">মাসিক (Monthly)</div>
                    <div className="text-[10px] text-slate-500">{applyDurationMonths} টি কিস্তি</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyFrequency('WEEKLY')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      applyFrequency === 'WEEKLY'
                        ? 'border-cyan-500 bg-cyan-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">সাপ্তাহিক (Weekly)</div>
                    <div className="text-[10px] text-slate-500">{applyDurationMonths * 4} টি কিস্তি</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyFrequency('DAILY')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      applyFrequency === 'DAILY'
                        ? 'border-cyan-500 bg-cyan-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">দৈনিক (Daily)</div>
                    <div className="text-[10px] text-slate-500">{applyDurationMonths * 30} টি কিস্তি</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Live EMI Simulator Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  লাইভ ঋণ কিস্তি ও পরিশোধ প্রাক্কলন (EMI Simulator)
                </span>
                <span className="font-mono text-white text-sm font-bold">
                  প্রতি কিস্তি: ৳ {simInstallmentAmount.toLocaleString()} ({simInstallmentCount} টি কিস্তি)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">মূল ঋণ তহবিল (আসল)</div>
                  <div className="text-white font-mono font-bold mt-0.5">৳ {applyPrincipal.toLocaleString()}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">মোট মুনাফা / সুদ ({applyInterestRate}%)</div>
                  <div className="text-cyan-400 font-mono font-bold mt-0.5">৳ {simTotalInterest.toLocaleString()}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">সর্বমোট প্রদেয় অর্থ</div>
                  <div className="text-emerald-400 font-mono font-bold mt-0.5">৳ {simTotalPayable.toLocaleString()}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">প্রসেসিং ফি ({loanPolicy?.processingFeePercent || 1}%)</div>
                  <div className="text-amber-400 font-mono font-bold mt-0.5">৳ {simProcessingFee.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Step 3: Guarantor & Collateral */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-200">
                ২. জামিনদার (Guarantor) ও জামানতের তথ্য
              </div>
              
              {/* Guarantor 1 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-cyan-400">১ম জামিনদার (Guarantor 1) *</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">নাম</label>
                    <input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={applyGuarantor1Name}
                      onChange={e => setApplyGuarantor1Name(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      placeholder="+8801..."
                      value={applyGuarantor1Phone}
                      onChange={e => setApplyGuarantor1Phone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">সম্পর্ক</label>
                    <input
                      type="text"
                      placeholder="যেমন: সদস্য / ভাই"
                      value={applyGuarantor1Relation}
                      onChange={e => setApplyGuarantor1Relation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">এনআইডি নম্বর</label>
                    <input
                      type="text"
                      placeholder="NID নম্বর"
                      value={applyGuarantor1Nid}
                      onChange={e => setApplyGuarantor1Nid(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Guarantor 2 (Optional) */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400">২য় জামিনদার (Guarantor 2 - ঐচ্ছিক)</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">নাম</label>
                    <input
                      type="text"
                      placeholder="২য় জামিনদারের নাম"
                      value={applyGuarantor2Name}
                      onChange={e => setApplyGuarantor2Name(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      placeholder="+8801..."
                      value={applyGuarantor2Phone}
                      onChange={e => setApplyGuarantor2Phone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">সম্পর্ক</label>
                    <input
                      type="text"
                      placeholder="যেমন: চাচা / ব্যবসায়ী পার্টনার"
                      value={applyGuarantor2Relation}
                      onChange={e => setApplyGuarantor2Relation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">এনআইডি নম্বর</label>
                    <input
                      type="text"
                      placeholder="NID নম্বর"
                      value={applyGuarantor2Nid}
                      onChange={e => setApplyGuarantor2Nid(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Security Cheque & Collateral Details */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ব্যাংক সিকিউরিটি চেক ও জামানত (Security Cheque & Collateral)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ব্যাংকের নাম</label>
                    <input
                      type="text"
                      placeholder="যেমন: সোনালী ব্যাংক"
                      value={applyChequeBank}
                      onChange={e => setApplyChequeBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">চেক নম্বর</label>
                    <input
                      type="text"
                      placeholder="যেমন: SB-9842105"
                      value={applyChequeNo}
                      onChange={e => setApplyChequeNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">চেকের টাকার পরিমাণ (টাকা)</label>
                    <input
                      type="number"
                      placeholder="টাকার অঙ্ক"
                      value={applyChequeAmount || ''}
                      onChange={e => setApplyChequeAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">অতিরিক্ত জামানত বিবরণ</label>
                  <input
                    type="text"
                    placeholder="যেমন: দোকান পজিশন চুক্তি / দলিল"
                    value={applyCollateral}
                    onChange={e => setApplyCollateral(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">ঋণের উদ্দেশ্য ও খাত *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: দোকানের মালামাল ক্রয়"
                    value={applyPurpose}
                    onChange={e => setApplyPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Admin Auto-Approve Checkbox */}
            {currentUser.role !== 'MEMBER' && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={applyAutoApprove}
                    onChange={e => setApplyAutoApprove(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="autoApprove" className="text-xs text-slate-200 font-medium cursor-pointer">
                    তাৎক্ষণিক অনুমোদন করুন (সরাসরি বিতরণ ডেস্কে প্রেরণ)
                  </label>
                </div>
                <span className="text-[11px] text-slate-500">অনুমোদনের সাথে সাথে ঋণটি ডিসবার্সমেন্টের জন্য প্রস্তুত হবে</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('loans-list')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{applyAutoApprove ? 'আবেদন ও সরাসরি অনুমোদন সম্পন্ন করুন' : 'ঋণ আবেদন দাখিল করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: কিস্তি ও ঋণ আদায় (COLLECT EMI) */}
      {/* ============================================================== */}
      {activeTab === 'collect-emi' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-6">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>{language === 'bn' ? 'ঋণের কিস্তি আদায় ও রসিদ প্রদান' : 'Collect Loan EMI & Money Receipt'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                কিস্তির টাকা গ্রহণ, ক্যাশবুকে অটোমেটিক ক্রেডিট পোস্টিং এবং তাৎক্ষণিক মানি রিসিট প্রস্তুতকরণ
              </p>
            </div>
          </div>

          {collectSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{collectSuccessMessage}</span>
              </div>
              {selectedReceiptForPrint && (
                <button
                  onClick={() => setSelectedReceiptForPrint(selectedReceiptForPrint)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>রসিদ প্রিন্ট</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleCollectSubmit} className="space-y-4 max-w-2xl text-xs sm:text-sm">
            {/* Active Loan Selector */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">চলমান ঋণ একাউন্ট নির্বাচন করুন *</label>
              <select
                required
                value={collectLoanId}
                onChange={e => {
                  setCollectLoanId(e.target.value);
                  const l = loans.find(x => x.id === e.target.value);
                  if (l) setCollectAmount(l.installmentAmount);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- ঋণ নির্বাচন করুন --</option>
                {activeLoans.map(l => {
                  const m = members.find(mem => mem.id === l.memberId);
                  return (
                    <option key={l.id} value={l.id}>
                      {l.loanNumber} — {m?.nameBn} ({m?.memberCode}) • কিস্তি: ৳{l.installmentAmount.toLocaleString()} • বকেয়া: ৳{l.outstandingBalance.toLocaleString()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Loan Details Preview Card */}
            {collectLoanId && (() => {
              const l = loans.find(x => x.id === collectLoanId);
              const m = members.find(mem => mem.id === l?.memberId);
              if (!l) return null;

              return (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">{m?.nameBn} ({l.loanNumber})</span>
                    <span className="text-cyan-400 font-mono">{l.loanScheme}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">নির্ধারিত কিস্তি</div>
                      <div className="text-white font-bold mt-0.5">৳ {l.installmentAmount.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">পরিশোধিত কিস্তি</div>
                      <div className="text-emerald-400 font-bold mt-0.5">{l.paidInstallments} / {l.totalInstallments} টি</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">বর্তমান মোট বকেয়া</div>
                      <div className="text-amber-400 font-bold mt-0.5">৳ {l.outstandingBalance.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Repayment Amount & Presets */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">আদায়কৃত কিস্তির পরিমাণ (টাকা) *</label>
              <input
                type="number"
                required
                min={100}
                value={collectAmount || ''}
                onChange={e => setCollectAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono font-bold focus:ring-1 focus:ring-emerald-500"
              />
              {collectLoanId && (() => {
                const l = loans.find(x => x.id === collectLoanId);
                if (!l) return null;
                return (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setCollectAmount(l.installmentAmount)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:text-white"
                    >
                      ১ কিস্তি (৳{l.installmentAmount.toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollectAmount(l.installmentAmount * 2)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:text-white"
                    >
                      ২ কিস্তি (৳{(l.installmentAmount * 2).toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollectAmount(l.outstandingBalance)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-amber-400 text-[11px] hover:text-amber-300"
                    >
                      পূর্ণ বকেয়া পরিশোধ (৳{l.outstandingBalance.toLocaleString()})
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">পরিশোধের মাধ্যম *</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'CASH', label: 'নগদ (Cash)' },
                  { id: 'BKASH', label: 'বিকাশ' },
                  { id: 'NAGAD', label: 'নগদ MFS' },
                  { id: 'BANK', label: 'ব্যাংক জমা' },
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setCollectPaymentMethod(method.id as PaymentMethod)}
                    className={`p-2 rounded-xl border text-center transition ${
                      collectPaymentMethod === method.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">মন্তব্য বা নোট</label>
              <input
                type="text"
                value={collectNotes}
                onChange={e => setCollectNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!collectLoanId || collectAmount <= 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <HandCoins className="w-4 h-4" />
                <span>কিস্তি আদায় নিশ্চিত ও রসিদ প্রিন্ট করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ঋণ বিতরণ ও ক্যাশ আউট ডেস্ক (DISBURSEMENT DESK) */}
      {/* ============================================================== */}
      {activeTab === 'disbursement-desk' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span>{language === 'bn' ? 'অনুমোদিত ঋণ বিতরণ ও ক্যাশ আউট ডেস্ক' : 'Approved Loans Disbursement Desk'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              পরিচালক পর্ষদ কর্তৃক অনুমোদিত ঋণসমূহের তহবিল হস্তান্তর এবং ক্যাশ/ব্যাংক ডেবিট ভাউচার তৈরি
            </p>
          </div>

          {approvedLoans.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/50 mx-auto mb-2" />
              <p className="text-sm">বর্তমানে কোনো বিতরণহীন অনুমোদিত ঋণ নেই। সকল অনুমোদিত ঋণ সফলভাবে বিতরণ করা হয়েছে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedLoans.map(loan => {
                const member = members.find(m => m.id === loan.memberId);
                const isSelected = disburseLoanId === loan.id;

                return (
                  <div key={loan.id} className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-mono text-cyan-400 font-bold text-sm">{loan.loanNumber}</div>
                        <div className="text-white font-bold text-base mt-0.5">{member?.nameBn} ({member?.memberCode})</div>
                        <div className="text-xs text-slate-400">{loan.loanScheme}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                        অনুমোদিত
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-3 gap-2 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans">বিতরণযোগ্য মূলধন</span>
                        <div className="text-white font-bold mt-0.5">৳ {loan.principalAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans">মেয়াদ ও কিস্তি</span>
                        <div className="text-cyan-400 font-bold mt-0.5">{loan.durationMonths} মাস ({loan.totalInstallments} কিস্তি)</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans">প্রসেসিং ফি</span>
                        <div className="text-amber-400 font-bold mt-0.5">৳ {(loan.processingFee || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>অনুমোদক: <span className="text-slate-200">{loan.approvedBy || 'সভাপতি'}</span></div>
                      <div>অনুমোদন নোট: <span className="text-slate-300 italic">"{loan.approvalNotes || 'যাচাই সাপেক্ষে অনুমোদিত'}"</span></div>
                    </div>

                    {/* Disbursement Controls */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">বিতরণের তারিখ</label>
                          <input
                            type="date"
                            value={disburseDate}
                            onChange={e => setDisburseDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">বিতরণের মাধ্যম</label>
                          <select
                            value={disburseMethod}
                            onChange={e => setDisburseMethod(e.target.value as PaymentMethod)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                          >
                            <option value="BANK">ব্যাংক ট্রান্সফার / চেক</option>
                            <option value="CASH">নগদ ক্যাশ (ক্যাশ বুক)</option>
                            <option value="BKASH">বিকাশ</option>
                            <option value="NAGAD">নগদ</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDisburseSubmit(loan.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-amber-600/20"
                      >
                        <ArrowDownRight className="w-4 h-4" />
                        <span>ঋণ বিতরণ নিশ্চিত ও ভাউচার তৈরি করুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ঋণ নীতিমালা ও নিয়ন্ত্রণ (LOAN POLICY) */}
      {/* ============================================================== */}
      {activeTab === 'policy-settings' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-6">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>{language === 'bn' ? 'সমিতির ঋণ ও কিস্তি নীতিমালা কনফিগারেশন' : 'Loan Policy & Limits Configuration'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                সর্বোচ্চ ঋণসীমা, সুদের হার, সঞ্চয়ের অনুপাত ও বিলম্ব জরিমানা নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          {policySaved && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>ঋণ নীতিমালা সফলভাবে হালনাগাদ করা হয়েছে এবং অডিট লগে রেকর্ড করা হয়েছে!</span>
            </div>
          )}

          <form onSubmit={handlePolicySave} className="space-y-6 max-w-2xl text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">সর্বনিম্ন ঋণের সীমা (টাকা)</label>
                <input
                  type="number"
                  value={policyForm.minLoanAmount}
                  onChange={e => setPolicyForm({ ...policyForm, minLoanAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">সর্বোচ্চ ঋণের সীমা (টাকা)</label>
                <input
                  type="number"
                  value={policyForm.maxLoanAmount}
                  onChange={e => setPolicyForm({ ...policyForm, maxLoanAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">ডিফল্ট বার্ষিক সুদের হার (%)</label>
                <input
                  type="number"
                  step={0.5}
                  value={policyForm.defaultInterestRate}
                  onChange={e => setPolicyForm({ ...policyForm, defaultInterestRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">সঞ্চয়ের বিপরীতে সর্বোচ্চ ঋণ অনুপাত</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={0.5}
                    value={policyForm.maxLoanToSavingsRatio}
                    onChange={e => setPolicyForm({ ...policyForm, maxLoanToSavingsRatio: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                  />
                  <span className="text-xs text-slate-400 shrink-0">গুণ (যেমন: ৩.০x)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">প্রসেসিং ফি (%)</label>
                <input
                  type="number"
                  step={0.1}
                  value={policyForm.processingFeePercent}
                  onChange={e => setPolicyForm({ ...policyForm, processingFeePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">কিস্তি খেলাপী জরিমানা (টাকা)</label>
                <input
                  type="number"
                  value={policyForm.lateFinePerInstallment}
                  onChange={e => setPolicyForm({ ...policyForm, lateFinePerInstallment: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">গ্রেস পিরিয়ড (দিন)</label>
                <input
                  type="number"
                  value={policyForm.gracePeriodDays}
                  onChange={e => setPolicyForm({ ...policyForm, gracePeriodDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reqGuarantor"
                  checked={policyForm.requireGuarantor}
                  onChange={e => setPolicyForm({ ...policyForm, requireGuarantor: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                />
                <label htmlFor="reqGuarantor" className="text-xs text-slate-200 cursor-pointer">
                  ঋণ আবেদনের ক্ষেত্রে অন্তত ১ জন জামিনদার থাকা বাধ্যতামূলক
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reqCheque"
                  checked={policyForm.requireSecurityCheque}
                  onChange={e => setPolicyForm({ ...policyForm, requireSecurityCheque: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                />
                <label htmlFor="reqCheque" className="text-xs text-slate-200 cursor-pointer">
                  ৫০,০০০ টাকার অধিক ঋণের ক্ষেত্রে সিকিউরিটি চেক গ্রহণ বাধ্যতামূলক
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                নীতিমালা সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ডিজিটাল ঋণ কিস্তি সূচি ও লেজার (AMORTIZATION SCHEDULE) */}
      {/* ============================================================== */}
      {selectedLoanForSchedule && (() => {
        const member = members.find(m => m.id === selectedLoanForSchedule.memberId);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      ঋণ কিস্তি সূচি ও লেজার বিবরণী (Amortization Schedule)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedLoanForSchedule.loanNumber} • {member?.nameBn} ({member?.memberCode})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট</span>
                  </button>
                  <button
                    onClick={() => setSelectedLoanForSchedule(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-sans">মূল ঋণ তহবিল</span>
                  <div className="text-white font-bold text-sm mt-0.5">৳ {selectedLoanForSchedule.principalAmount.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-sans">মোট মুনাফা ও মেয়াদ</span>
                  <div className="text-cyan-400 font-bold text-sm mt-0.5">৳ {(selectedLoanForSchedule.totalPayable - selectedLoanForSchedule.principalAmount).toLocaleString()} ({selectedLoanForSchedule.durationMonths} মাস)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-sans">মোট পরিশোধিত</span>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">৳ {selectedLoanForSchedule.totalPaid.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-sans">বর্তমান অবশিষ্ট বকেয়া</span>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">৳ {selectedLoanForSchedule.outstandingBalance.toLocaleString()}</div>
                </div>
              </div>

              {/* Installments Table */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">কিস্তি নং</th>
                      <th className="py-2.5 px-3">নির্ধারিত তারিখ</th>
                      <th className="py-2.5 px-3">আসল</th>
                      <th className="py-2.5 px-3">সুদ</th>
                      <th className="py-2.5 px-3">মোট প্রদেয়</th>
                      <th className="py-2.5 px-3">আদায়কৃত টাকা</th>
                      <th className="py-2.5 px-3">পরিশোধের তারিখ</th>
                      <th className="py-2.5 px-3">রসিদ নং</th>
                      <th className="py-2.5 px-3 text-right">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedLoanForSchedule.installments.map(inst => (
                      <tr key={inst.installmentNumber} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-cyan-400">#{inst.installmentNumber}</td>
                        <td className="py-2.5 px-3 text-slate-200">{inst.dueDate}</td>
                        <td className="py-2.5 px-3">৳ {inst.principalAmount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-slate-400">৳ {inst.interestAmount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-bold text-white">৳ {inst.totalDue.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">
                          {inst.paidAmount > 0 ? `৳ ${inst.paidAmount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{inst.paidDate || '-'}</td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">{inst.receiptNo || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          {inst.status === 'PAID' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              পরিশোধিত
                            </span>
                          )}
                          {inst.status === 'PARTIAL' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              আংশিক
                            </span>
                          )}
                          {inst.status === 'OVERDUE' && (
                            <div className="inline-flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300">
                                খেলাপী
                              </span>
                              {inst.penalty && inst.penalty > 0 && (
                                <button
                                  onClick={() => {
                                    waiveLoanPenalty(selectedLoanForSchedule.id, inst.installmentNumber, inst.penalty || 0, 'সভাপতি কর্তৃক মওকুফ');
                                    // Refresh local ref
                                    const updated = loans.find(l => l.id === selectedLoanForSchedule.id);
                                    if (updated) setSelectedLoanForSchedule({ ...updated });
                                  }}
                                  className="text-[10px] text-amber-400 underline hover:text-amber-300 ml-1"
                                >
                                  জরিমানা মওকুফ
                                </button>
                              )}
                            </div>
                          )}
                          {inst.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                              অপেক্ষমাণ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL 2: ঋণ অনুমোদন / পর্যালোচনা মোডাল (APPROVAL MODAL) */}
      {/* ============================================================== */}
      {selectedLoanForApproval && (() => {
        const member = members.find(m => m.id === selectedLoanForApproval.memberId);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>ঋণ আবেদন পর্যালোচনা ও অনুমোদন</span>
                </div>
                <button
                  onClick={() => setSelectedLoanForApproval(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">ঋণ নম্বর:</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedLoanForApproval.loanNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ঋণগ্রহীতা:</span>
                  <span className="text-white font-semibold">{member?.nameBn} ({member?.memberCode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">আবেদনের পরিমাণ:</span>
                  <span className="font-mono text-emerald-400 font-bold">৳ {selectedLoanForApproval.principalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">মেয়াদ ও কিস্তি:</span>
                  <span className="text-slate-200">{selectedLoanForApproval.durationMonths} মাস ({selectedLoanForApproval.installmentAmount.toLocaleString()} ৳/কিস্তি)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">সদস্যের সঞ্চয় স্থিতি:</span>
                  <span className="text-cyan-300 font-mono">৳ {(member?.savingsBalance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ঋণের উদ্দেশ্য:</span>
                  <span className="text-slate-300">{selectedLoanForApproval.purpose}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">কমিটির অনুমোদন নোট / সুপারিশ</label>
                <textarea
                  rows={2}
                  value={approvalNotesInput}
                  onChange={e => setApprovalNotesInput(e.target.value)}
                  placeholder="যেমন: জামিনদার ও সঞ্চয় স্থিতি যাচাই করে ঋণ অনুমোদন করা হলো।"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleApprovalAction('REJECTED')}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-600/30"
                >
                  প্রত্যাখ্যান করুন
                </button>

                <button
                  type="button"
                  onClick={() => handleApprovalAction('APPROVED')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                >
                  ঋণ অনুমোদন করুন
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL 3: অফিসিয়াল মানি রিসিট মোডাল (MONEY RECEIPT MODAL) */}
      {/* ============================================================== */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>অফিসিয়াল ঋণ কিস্তি পরিশোধ মানি রিসিট</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট রসিদ</span>
                </button>
                <button
                  onClick={() => setSelectedReceiptForPrint(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-5 rounded-2xl bg-white text-slate-900 font-sans shadow-xl border border-slate-200 space-y-4 text-xs">
              {/* Header */}
              <div className="text-center border-b pb-3 border-slate-200">
                <h4 className="font-bold text-base text-slate-900">{activeTenant.nameBn}</h4>
                <p className="text-[10px] text-slate-500">{activeTenant.address}</p>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  ঋণ কিস্তি আদায় রসিদ
                </span>
              </div>

              {/* Receipt Meta */}
              <div className="flex justify-between text-[11px] font-mono border-b pb-2 border-slate-100">
                <span>রসিদ নং: <strong className="text-slate-900">{selectedReceiptForPrint.receiptNo}</strong></span>
                <span>তারিখ: <strong className="text-slate-900">{selectedReceiptForPrint.date}</strong></span>
              </div>

              {/* Body */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">ঋণগ্রহীতার নাম:</span>
                  <span className="font-bold text-slate-900">{selectedReceiptForPrint.memberNameBn} ({selectedReceiptForPrint.memberCode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">মোবাইল নম্বর:</span>
                  <span className="font-mono">{selectedReceiptForPrint.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">পরিশোধের মাধ্যম:</span>
                  <span className="font-semibold uppercase">{selectedReceiptForPrint.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">বিবরণ / নোট:</span>
                  <span>{selectedReceiptForPrint.notes}</span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-700 font-medium">আদায়কৃত কিস্তির পরিমাণ</div>
                  <div className="text-sm font-bold text-emerald-900">{selectedReceiptForPrint.amountInWordsBn}</div>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700">
                  ৳ {selectedReceiptForPrint.amount.toLocaleString()}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 text-center text-[10px] text-slate-500 border-t border-slate-100">
                <div>
                  <div className="border-t border-slate-400 w-24 mx-auto pt-1">আদায়কারী</div>
                  <div>{selectedReceiptForPrint.collectorNameBn || 'মাঠ কর্মকর্তা'}</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-24 mx-auto pt-1">অনুমোদিত স্বাক্ষর</div>
                  <div>কোষাধ্যক্ষ / সভাপতি</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: অফিসিয়াল ঋণ মঞ্জুরিপত্র (LOAN SANCTION & AGREEMENT LETTER) */}
      {/* ============================================================== */}
      {selectedLoanForSanctionLetter && (() => {
        const member = members.find(m => m.id === selectedLoanForSanctionLetter.memberId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl glass-panel bg-slate-900 border border-slate-700 p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>অফিসিয়াল ঋণ মঞ্জুরিপত্র ও অঙ্গীকারনামা (Loan Sanction Letter)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট করুন</span>
                  </button>
                  <button
                    onClick={() => setSelectedLoanForSanctionLetter(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Sanction Paper */}
              <div className="p-6 rounded-2xl bg-white text-slate-900 font-sans shadow-xl border border-slate-200 space-y-4 text-xs">
                {/* Official Header */}
                <div className="text-center border-b-2 border-slate-900 pb-3">
                  <h3 className="font-bold text-lg text-slate-900">{activeTenant.nameBn}</h3>
                  <p className="text-[11px] text-slate-600">{activeTenant.address}</p>
                  <div className="mt-1 inline-block px-3 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-bold text-[11px]">
                    ঋণ মঞ্জুরিপত্র ও শর্তাবলি (Loan Sanction Agreement)
                  </div>
                </div>

                {/* Memo & Date */}
                <div className="flex justify-between text-[11px] font-mono border-b pb-2 border-slate-100">
                  <span>স্মারক নং: <strong>REF/{selectedLoanForSanctionLetter.loanNumber}</strong></span>
                  <span>তারিখ: <strong>{selectedLoanForSanctionLetter.approvalDate || selectedLoanForSanctionLetter.createdAt}</strong></span>
                </div>

                {/* Borrower Info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">বরাবর, {member?.nameBn} ({member?.memberCode})</div>
                  <div className="text-slate-600">পিতা/স্বামীর নাম: {member?.fatherHusbandName || '—'}</div>
                  <div className="text-slate-600">ঠিকানা: {member?.presentAddress || '—'} • মোবাইল: {member?.phone}</div>
                </div>

                {/* Terms Table */}
                <div>
                  <div className="font-bold text-slate-900 mb-1">মঞ্জুরিকৃত ঋণের বিবরণ:</div>
                  <table className="w-full border border-slate-200 text-left text-[11px]">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-semibold bg-slate-100 w-1/3">ঋণ স্কিম</td>
                        <td className="p-2 font-bold">{selectedLoanForSanctionLetter.loanScheme}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-semibold bg-slate-100">মঞ্জুরিকৃত মূলধন</td>
                        <td className="p-2 font-mono font-bold text-cyan-800">৳ {selectedLoanForSanctionLetter.principalAmount.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-semibold bg-slate-100">সুদের হার ও মেয়াদ</td>
                        <td className="p-2">{selectedLoanForSanctionLetter.interestRatePercent}% বার্ষিক • {selectedLoanForSanctionLetter.durationMonths} মাস ({selectedLoanForSanctionLetter.totalInstallments} কিস্তি)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-semibold bg-slate-100">প্রতি কিস্তির পরিমাণ</td>
                        <td className="p-2 font-mono font-bold text-emerald-800">৳ {selectedLoanForSanctionLetter.installmentAmount.toLocaleString()} ({selectedLoanForSanctionLetter.installmentFrequency === 'MONTHLY' ? 'মাসিক' : 'সাপ্তাহিক'})</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold bg-slate-100">সর্বমোট প্রদেয় অর্থ</td>
                        <td className="p-2 font-mono font-bold">৳ {selectedLoanForSanctionLetter.totalPayable.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Guarantors & Collateral */}
                <div className="space-y-1 text-[11px]">
                  <div><strong className="text-slate-800">১ম জামিনদার:</strong> {selectedLoanForSanctionLetter.guarantor1?.name || '—'} (মোবাইল: {selectedLoanForSanctionLetter.guarantor1?.phone || '—'}, সম্পর্ক: {selectedLoanForSanctionLetter.guarantor1?.relation || '—'})</div>
                  {selectedLoanForSanctionLetter.guarantor2 && (
                    <div><strong className="text-slate-800">২য় জামিনদার:</strong> {selectedLoanForSanctionLetter.guarantor2?.name} (মোবাইল: {selectedLoanForSanctionLetter.guarantor2?.phone || '—'})</div>
                  )}
                  {selectedLoanForSanctionLetter.collateralDetails && (
                    <div><strong className="text-slate-800">জামানত / সিকিউরিটি চেক:</strong> {selectedLoanForSanctionLetter.collateralDetails}</div>
                  )}
                </div>

                {/* Terms disclaimer */}
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-relaxed">
                  <strong>শর্তাবলি:</strong> নির্ধারিত তারিখে কিস্তি পরিশোধে ব্যর্থ হলে দৈনিক/মাসিক হারে বিলম্ব ফি প্রযোজ্য হইবে। ঋণগ্রহীতা ও জামিনদার যৌথ ও পৃথকভাবে ঋণ পরিশোধে দায়বদ্ধ থাকিবেন।
                </div>

                {/* Three Signatures */}
                <div className="pt-10 grid grid-cols-3 gap-3 text-center text-[10px] text-slate-600">
                  <div className="border-t border-slate-400 pt-1">
                    ঋণগ্রহীতার স্বাক্ষর
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    জামিনদারের স্বাক্ষর
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                    সভাপতি / অনুমোদকের সিল
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
