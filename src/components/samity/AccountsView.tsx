'use client';

import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, Plus, ArrowUpRight, ArrowDownLeft, 
  Wallet, Building, Filter, CheckCircle2, Printer,
  Search, FileText, Calendar, DollarSign, Layers,
  PieChart, BookOpen, TrendingUp, TrendingDown, Scale,
  ShieldCheck, AlertCircle, X, ChevronRight, Download,
  RefreshCw, Check, XCircle
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, formatDate } from '@/lib/i18n';
import { Voucher, AccountHead, VoucherType, PaymentMethod, AccountHeadGroup } from '@/types';

type AccountTab = 'CASH_BOOK' | 'VOUCHERS' | 'NEW_VOUCHER' | 'GENERAL_LEDGER' | 'CHART_OF_ACCOUNTS' | 'FINANCIAL_REPORTS';

export function AccountsView() {
  const { 
    store, activeTenant, language, vouchers, chartOfAccounts, letterhead,
    createVoucher, approveVoucher, rejectVoucher, addAccountHead,
    getCashBook, getBankBook, getGeneralLedger, getTrialBalance,
    getIncomeStatement, getBalanceSheet
  } = useSamityStore();
  const t = translations[language];

  // Tab State
  const [activeTab, setActiveTab] = useState<AccountTab>('CASH_BOOK');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT' | 'JOURNAL'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modals
  const [selectedVoucherForSlip, setSelectedVoucherForSlip] = useState<Voucher | null>(null);
  const [showNewAccountHeadModal, setShowNewAccountHeadModal] = useState(false);
  const [approvingVoucher, setApprovingVoucher] = useState<Voucher | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // General Ledger Selected Head
  const [selectedLedgerHeadCode, setSelectedLedgerHeadCode] = useState<string>('1010');

  // Financial Reports Sub-tab
  const [reportSubTab, setReportSubTab] = useState<'TRIAL_BALANCE' | 'INCOME_STATEMENT' | 'BALANCE_SHEET'>('TRIAL_BALANCE');

  // New Voucher Form State
  const [newVoucherType, setNewVoucherType] = useState<VoucherType>('DEBIT');
  const [newCategory, setNewCategory] = useState('অফিস ও স্টেশনারি খরচ');
  const [selectedAccountHeadCode, setSelectedAccountHeadCode] = useState('4010');
  const [newAmount, setNewAmount] = useState<number>(3500);
  const [newRecipient, setNewRecipient] = useState('');
  const [newDescBn, setNewDescBn] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('CASH');
  const [newBankName, setNewBankName] = useState('সোনালী ব্যাংক লিমিটেড');
  const [newChequeOrTx, setNewChequeOrTx] = useState('');
  const [newVoucherDate, setNewVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [newApprovedBy, setNewApprovedBy] = useState('আলহাজ্ব রফিকুল ইসলাম (সভাপতি)');

  // New Account Head Form State
  const [newHeadCode, setNewHeadCode] = useState('');
  const [newHeadNameBn, setNewHeadNameBn] = useState('');
  const [newHeadNameEn, setNewHeadNameEn] = useState('');
  const [newHeadGroup, setNewHeadGroup] = useState<AccountHeadGroup>('EXPENSE');
  const [newHeadSubGroup, setNewHeadSubGroup] = useState('অফিস পরিচালনা ব্যয়');
  const [newHeadOpeningBalance, setNewHeadOpeningBalance] = useState<number>(0);
  const [newHeadNotes, setNewHeadNotes] = useState('');

  // Success Message Alert
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Calculations
  const cashBookData = useMemo(() => {
    let start = customStartDate;
    let end = customEndDate;
    if (dateRangeFilter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      start = today;
      end = today;
    } else if (dateRangeFilter === 'MONTH') {
      const ym = new Date().toISOString().slice(0, 7);
      start = `${ym}-01`;
      end = `${ym}-31`;
    }
    return getCashBook(start, end);
  }, [getCashBook, dateRangeFilter, customStartDate, customEndDate, vouchers]);

  const bankBookData = useMemo(() => {
    return getBankBook();
  }, [getBankBook, vouchers]);

  const generalLedgerData = useMemo(() => {
    return getGeneralLedger(selectedLedgerHeadCode);
  }, [getGeneralLedger, selectedLedgerHeadCode, vouchers, chartOfAccounts]);

  const trialBalanceData = useMemo(() => {
    return getTrialBalance();
  }, [getTrialBalance, chartOfAccounts, vouchers]);

  const incomeStatementData = useMemo(() => {
    return getIncomeStatement();
  }, [getIncomeStatement, chartOfAccounts, vouchers]);

  const balanceSheetData = useMemo(() => {
    return getBalanceSheet();
  }, [getBalanceSheet, chartOfAccounts, vouchers]);

  // Overall Totals
  const totalCredit = vouchers.filter(v => v.type === 'CREDIT' && v.status !== 'REJECTED').reduce((s, v) => s + v.amount, 0);
  const totalDebit = vouchers.filter(v => v.type === 'DEBIT' && v.status !== 'REJECTED').reduce((s, v) => s + v.amount, 0);
  const cashInHand = cashBookData.closingCash;
  const totalBankDeposit = bankBookData.closingBank;

  // Filtered Vouchers List
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      if (filterType !== 'ALL' && v.type !== filterType) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchNo = v.voucherNo.toLowerCase().includes(q);
        const matchCat = v.category.toLowerCase().includes(q);
        const matchParty = v.paidToOrReceivedFrom.toLowerCase().includes(q);
        const matchDesc = v.descriptionBn.toLowerCase().includes(q);
        if (!matchNo && !matchCat && !matchParty && !matchDesc) return false;
      }
      return true;
    });
  }, [vouchers, filterType, searchTerm]);

  // Handle Create Voucher
  const handleCreateVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0 || !newDescBn) {
      alert('অনুগ্রহ করে টাকার পরিমাণ ও খরচের বিবরণ সঠিকভাবে প্রদান করুন।');
      return;
    }

    const selectedHead = chartOfAccounts.find(c => c.code === selectedAccountHeadCode);
    const headName = selectedHead ? selectedHead.nameBn : newCategory;

    let debitAcc = '';
    let creditAcc = '';

    if (newVoucherType === 'DEBIT') {
      debitAcc = `[${selectedAccountHeadCode}] ${headName}`;
      creditAcc = newPaymentMethod === 'CASH' ? '[1010] হাতে নগদ ক্যাশ' : `[1020] ${newBankName}`;
    } else if (newVoucherType === 'CREDIT') {
      debitAcc = newPaymentMethod === 'CASH' ? '[1010] হাতে নগদ ক্যাশ' : `[1020] ${newBankName}`;
      creditAcc = `[${selectedAccountHeadCode}] ${headName}`;
    } else {
      debitAcc = `[1020] ${newBankName}`;
      creditAcc = '[1010] হাতে নগদ ক্যাশ';
    }

    const created = createVoucher({
      tenantId: activeTenant.id,
      type: newVoucherType,
      category: headName,
      accountHeadCode: selectedAccountHeadCode,
      accountHeadNameBn: headName,
      debitAccount: debitAcc,
      creditAccount: creditAcc,
      amount: Number(newAmount),
      descriptionBn: newDescBn,
      descriptionEn: newDescBn,
      paidToOrReceivedFrom: newRecipient || 'সমিতি প্রশাসন ও সাধারণ হিসাব',
      paymentMethod: newPaymentMethod,
      bankAccountName: newPaymentMethod === 'BANK' ? newBankName : undefined,
      chequeOrTxNo: newChequeOrTx || undefined,
      date: newVoucherDate,
      approvedBy: newApprovedBy
    });

    showToast(`ভাউচার নং ${created.voucherNo} সফলভাবে পোস্ট ও অন্তর্ভুক্ত করা হয়েছে!`);
    setSelectedVoucherForSlip(created);
    setActiveTab('VOUCHERS');
    setNewDescBn('');
    setNewRecipient('');
    setNewChequeOrTx('');
  };

  // Handle New Account Head Submission
  const handleCreateAccountHeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadCode || !newHeadNameBn) return;

    addAccountHead({
      tenantId: activeTenant.id,
      code: newHeadCode,
      nameBn: newHeadNameBn,
      nameEn: newHeadNameEn || newHeadNameBn,
      group: newHeadGroup,
      subGroup: newHeadSubGroup,
      openingBalance: Number(newHeadOpeningBalance),
      currentBalance: Number(newHeadOpeningBalance),
      isSystemDefault: false,
      notes: newHeadNotes
    });

    showToast(`নতুন হিসাব খাত [${newHeadCode}] ${newHeadNameBn} সফলভাবে চার্ট অফ অ্যাকাউন্টসে যুক্ত হয়েছে!`);
    setShowNewAccountHeadModal(false);
    setNewHeadCode('');
    setNewHeadNameBn('');
    setNewHeadNameEn('');
    setNewHeadNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Action Success Toast Banner */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Panel */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">{t.accounts}</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  মডিউল ৬
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                  Double-Entry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'দৈনিক ক্যাশ বুক, ব্যাংক লেজার, চার্ট অফ অ্যাকাউন্টস, রেওয়ামিল ও লাভ-ক্ষতি বিবরণী' 
                  : 'Daily cash book, general ledger, chart of accounts, trial balance, and financial statements'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('NEW_VOUCHER')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ভাউচার প্রস্তুত</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>প্রিন্ট রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cash in Hand */}
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-900/90 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>হাতে নগদ ক্যাশ স্থিতি</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
            {formatCurrency(cashInHand, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>দৈনিক ক্যাশ বুক ব্যালেন্স</span>
            <span className="text-emerald-400/90 font-medium">রিকনসিল্ড ✓</span>
          </div>
        </div>

        {/* Bank Total Balance */}
        <div className="glass-card rounded-2xl p-4 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-slate-900/90 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>ব্যাংক মোট আমানত স্থিতি</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tracking-tight">
            {formatCurrency(totalBankDeposit, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>সোনালী ও ডিবিবিএল অ্যাকাউন্ট</span>
            <span className="text-cyan-400/90 font-medium">সক্রিয় হিসাব</span>
          </div>
        </div>

        {/* Monthly Income / Credit */}
        <div className="glass-card rounded-2xl p-4 border border-teal-500/20 bg-gradient-to-br from-teal-950/20 via-slate-900/60 to-slate-900/90 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>মোট জমা ও ক্রেডিট (Credit)</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-300 font-mono tracking-tight">
            {formatCurrency(totalCredit, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>সঞ্চয়, ডিপিএস ও লোন মুনাফা</span>
            <span className="text-teal-400/90 font-medium">ইনকাম খতিয়ান</span>
          </div>
        </div>

        {/* Monthly Expenses / Debit */}
        <div className="glass-card rounded-2xl p-4 border border-rose-500/20 bg-gradient-to-br from-rose-950/20 via-slate-900/60 to-slate-900/90 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>মোট ব্যয় ও ডেবিট (Debit)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tracking-tight">
            {formatCurrency(totalDebit, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>ভাড়া, বেতন, বিল ও খরচ</span>
            <span className="text-rose-400/90 font-medium">অনুমোদিত ভাউচার</span>
          </div>
        </div>

      </div>

      {/* Main 6-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('CASH_BOOK')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition shrink-0 cursor-pointer ${
            activeTab === 'CASH_BOOK'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>দৈনিক ক্যাশ বুক ও ব্যাংক</span>
        </button>

        <button
          onClick={() => setActiveTab('VOUCHERS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition shrink-0 cursor-pointer ${
            activeTab === 'VOUCHERS'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>ভাউচার খতিয়ান ও রেজিস্টার ({vouchers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('NEW_VOUCHER')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition shrink-0 cursor-pointer ${
            activeTab === 'NEW_VOUCHER'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ভাউচার পোস্টিং</span>
        </button>

        <button
          onClick={() => setActiveTab('GENERAL_LEDGER')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition shrink-0 cursor-pointer ${
            activeTab === 'GENERAL_LEDGER'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>সাধারণ খতিয়ান (General Ledger)</span>
        </button>

        <button
          onClick={() => setActiveTab('CHART_OF_ACCOUNTS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition shrink-0 cursor-pointer ${
            activeTab === 'CHART_OF_ACCOUNTS'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>চার্ট অফ অ্যাকাউন্টস ({chartOfAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCIAL_REPORTS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition shrink-0 cursor-pointer ${
            activeTab === 'FINANCIAL_REPORTS'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>আর্থিক প্রতিবেদন ও রেওয়ামিল</span>
        </button>
      </div>

      {/* TAB 1: DAILY CASH BOOK & SUMMARY */}
      {activeTab === 'CASH_BOOK' && (
        <div className="space-y-5">
          
          {/* Cash Reconciliation Summary Bar */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 bg-slate-900/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>দৈনিক ক্যাশ বুক রিকনসিলিয়েশন ও চলতি হিসাব</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  নগদ প্রাপ্তি (Receipts) ও নগদ প্রদান (Payments) এর সমন্বয়ে দৈনিক উদ্বৃত্ত হিসাব
                </p>
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map(pill => (
                  <button
                    key={pill}
                    onClick={() => setDateRangeFilter(pill)}
                    className={`px-3 py-1.5 rounded-lg border transition cursor-pointer font-medium ${
                      dateRangeFilter === pill
                        ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pill === 'ALL' ? 'সকল লেনদেন' : pill === 'TODAY' ? 'আজকের দিন' : pill === 'WEEK' ? 'এই সপ্তাহ' : 'চলতি মাস'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reconciliation Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[11px] font-sans text-slate-400 block mb-0.5">প্রারম্ভিক নগদ (Opening)</span>
                <span className="text-base font-bold text-slate-200">{formatCurrency(cashBookData.openingCash, language)}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[11px] font-sans text-emerald-400 block mb-0.5">মোট নগদ প্রাপ্তি (+)</span>
                <span className="text-base font-bold text-emerald-300">+{formatCurrency(cashBookData.totalReceipts, language)}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[11px] font-sans text-rose-400 block mb-0.5">মোট নগদ প্রদান (-)</span>
                <span className="text-base font-bold text-rose-300">-{formatCurrency(cashBookData.totalPayments, language)}</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[11px] font-sans text-cyan-400 block mb-0.5">সমাপনী নগদ স্থিতি (=)</span>
                <span className="text-base font-bold text-cyan-300">{formatCurrency(cashBookData.closingCash, language)}</span>
              </div>
            </div>
          </div>

          {/* Cash Book Transactions Ledger Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>দৈনিক ক্যাশ বুক খতিয়ান তালিকা ({cashBookData.entries.length}টি এন্ট্রি)</span>
              </h4>
              <button 
                onClick={() => window.print()}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>ক্যাশ শিট প্রিন্ট</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ ও ভাউচার</th>
                    <th className="py-2.5 px-3">খাত / হেড</th>
                    <th className="py-2.5 px-3">বিবরণ ও পক্ষ</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400">প্রাপ্তি (Receipt)</th>
                    <th className="py-2.5 px-3 text-right text-rose-400">প্রদান (Payment)</th>
                    <th className="py-2.5 px-3 text-right">চলতি জের (Balance)</th>
                    <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {cashBookData.entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                        নির্বাচিত ফিল্টারে কোনো নগদ লেনদেন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    cashBookData.entries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-200">{entry.voucherNo}</div>
                          <div className="text-[10px] text-slate-500">{entry.date}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                          {entry.particulars}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-[11px] text-slate-400 max-w-xs truncate">
                          <div>{entry.description}</div>
                          <div className="text-[10px] text-slate-500">পক্ষ: {entry.party}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {entry.receipt > 0 ? `+${formatCurrency(entry.receipt, language)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                          {entry.payment > 0 ? `-${formatCurrency(entry.payment, language)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                          {formatCurrency(entry.balance, language)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans">
                          <button
                            onClick={() => {
                              const found = vouchers.find(v => v.id === entry.id || v.voucherNo === entry.voucherNo);
                              if (found) setSelectedVoucherForSlip(found);
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-slate-700 transition cursor-pointer"
                            title="ভাউচার প্রিন্ট স্লিপ দেখুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bank Book Summary Accordion Panel */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">ব্যাংক বুক লেনদেন ও চেক রেজিস্টার</h3>
              </div>
              <div className="text-xs font-mono text-cyan-400 font-bold">
                সমাপনী ব্যাংক ব্যালেন্স: {formatCurrency(bankBookData.closingBank, language)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">তারিখ ও ভাউচার</th>
                    <th className="py-2 px-3">ব্যাংক ও শাখা</th>
                    <th className="py-2 px-3">চেক / স্লিপ নং</th>
                    <th className="py-2 px-3 font-sans">বিবরণ</th>
                    <th className="py-2 px-3 text-right text-cyan-400">জমা (Deposit)</th>
                    <th className="py-2 px-3 text-right text-rose-400">উত্তোলন (Withdraw)</th>
                    <th className="py-2 px-3 text-right">ব্যালেন্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bankBookData.entries.map((entry, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-200">{entry.voucherNo}</div>
                        <div className="text-[10px] text-slate-500">{entry.date}</div>
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-200">{entry.bankName}</td>
                      <td className="py-2 px-3 text-slate-400">{entry.chequeOrTxNo}</td>
                      <td className="py-2 px-3 font-sans text-slate-400 text-[11px]">{entry.description}</td>
                      <td className="py-2 px-3 text-right text-cyan-400 font-bold">
                        {entry.deposit > 0 ? `+${formatCurrency(entry.deposit, language)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-400 font-bold">
                        {entry.withdraw > 0 ? `-${formatCurrency(entry.withdraw, language)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-200 font-bold">
                        {formatCurrency(entry.balance, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: VOUCHERS REGISTER & JOURNAL */}
      {activeTab === 'VOUCHERS' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ভাউচার নং, খাত, পক্ষ বা বিবরণ দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {(['ALL', 'CREDIT', 'DEBIT', 'JOURNAL'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-xl font-medium border transition cursor-pointer ${
                    filterType === type 
                      ? 'bg-slate-700 border-slate-600 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {type === 'ALL' ? 'সকল ভাউচার' : type === 'CREDIT' ? 'ক্রেডিট (জমা)' : type === 'DEBIT' ? 'ডেবিট (ব্যয়)' : 'জার্নাল (কন্ট্রা)'}
                </button>
              ))}
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">ভাউচার নম্বর ও তারিখ</th>
                    <th className="py-2.5 px-3">ধরন</th>
                    <th className="py-2.5 px-3">হিসাবের খাত (COA Head)</th>
                    <th className="py-2.5 px-3">ডেবিট / ক্রেডিট লেজার</th>
                    <th className="py-2.5 px-3">বিবরণ ও পক্ষ</th>
                    <th className="py-2.5 px-3">মাধ্যম</th>
                    <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                    <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredVouchers.map(v => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{v.voucherNo}</div>
                        <div className="text-[10px] text-slate-500">{v.date}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.type === 'CREDIT' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : v.type === 'DEBIT'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {v.type === 'CREDIT' ? 'CREDIT' : v.type === 'DEBIT' ? 'DEBIT' : 'JOURNAL'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                        {v.category}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-[11px] text-slate-400">
                        <div className="text-emerald-400/90 text-[10px]">Dr: {v.debitAccount || 'হাতে নগদ ক্যাশ'}</div>
                        <div className="text-rose-400/90 text-[10px]">Cr: {v.creditAccount || v.category}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-[11px] text-slate-300 max-w-xs">
                        <div className="truncate">{v.descriptionBn}</div>
                        <div className="text-[10px] text-slate-500">পক্ষ: {v.paidToOrReceivedFrom}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
                          {v.paymentMethod}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold text-sm ${
                        v.type === 'CREDIT' ? 'text-emerald-400' : v.type === 'DEBIT' ? 'text-rose-400' : 'text-cyan-400'
                      }`}>
                        {v.type === 'CREDIT' ? '+' : v.type === 'DEBIT' ? '-' : '⇄'} {formatCurrency(v.amount, language)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.status === 'APPROVED' || !v.status
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : v.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {v.status === 'APPROVED' || !v.status ? 'অনুমোদিত' : v.status === 'PENDING' ? 'অপেক্ষমাণ' : 'বাতিল'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedVoucherForSlip(v)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-slate-700 transition cursor-pointer"
                            title="অফিসিয়াল ভাউচার স্লিপ প্রিন্ট"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {v.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => approveVoucher(v.id, 'আলহাজ্ব রফিকুল ইসলাম (সভাপতি)')}
                                className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                                title="অনুমোদন করুন"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => rejectVoucher(v.id, 'সভাপতি', 'অনুপযুক্ত ব্যয়')}
                                className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                                title="বাতিল করুন"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: NEW VOUCHER POSTING WIZARD */}
      {activeTab === 'NEW_VOUCHER' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 max-w-3xl mx-auto space-y-5">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>নতুন হিসাব ভাউচার প্রস্তুত ও এন্ট্রি উইজার্ড</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                সমিতির ক্যাশ বুক ও চার্ট অফ অ্যাকাউন্টসে স্বয়ংক্রিয় ডাবল-এন্ট্রি হিসাব পোস্টিং
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              VR-NEW
            </span>
          </div>

          <form onSubmit={handleCreateVoucherSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* Voucher Type Radio Cards */}
            <div>
              <label className="block text-slate-300 text-xs mb-2 font-medium">ভাউচারের প্রকৃতি নির্বাচন করুন *</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewVoucherType('DEBIT');
                    setSelectedAccountHeadCode('4010');
                  }}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    newVoucherType === 'DEBIT'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold shadow-lg shadow-rose-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 mx-auto mb-1 text-rose-400" />
                  <div className="text-xs">ডেবিট ভাউচার</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">ব্যয় / নগদ পরিশোধ</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewVoucherType('CREDIT');
                    setSelectedAccountHeadCode('2010');
                  }}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    newVoucherType === 'CREDIT'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <ArrowDownLeft className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <div className="text-xs">ক্রেডিট ভাউচার</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">আদায় / নগদ প্রাপ্তি</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewVoucherType('JOURNAL');
                    setSelectedAccountHeadCode('1020');
                  }}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    newVoucherType === 'JOURNAL'
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <RefreshCw className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <div className="text-xs">জার্নাল / কন্ট্রা</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">ক্যাশ-ব্যাংক ফান্ড স্থানান্তর</div>
                </button>
              </div>
            </div>

            {/* Account Head Dropdown & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">হিসাবের খাত / COA লেজার *</label>
                <select
                  value={selectedAccountHeadCode}
                  onChange={e => setSelectedAccountHeadCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-emerald-500"
                >
                  {chartOfAccounts.map(head => (
                    <option key={head.id} value={head.code}>
                      [{head.code}] {head.nameBn} ({head.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">ভাউচারের তারিখ *</label>
                <input
                  type="date"
                  required
                  value={newVoucherDate}
                  onChange={e => setNewVoucherDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Amount with Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 text-xs font-medium">টাকার পরিমাণ (BDT) *</label>
                <div className="flex items-center gap-1.5">
                  {[1000, 2500, 5000, 10000, 25000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNewAmount(amt)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                required
                min={1}
                value={newAmount}
                onChange={e => setNewAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-base focus:border-emerald-500"
              />
            </div>

            {/* Payment Method & Bank Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">লেনদেনের মাধ্যম *</label>
                <select
                  value={newPaymentMethod}
                  onChange={e => setNewPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="CASH">হাতে নগদ (Cash in Hand)</option>
                  <option value="BANK">ব্যাংক অ্যাকাউন্ট (Bank Deposit/Cheque)</option>
                  <option value="BKASH">বিকাশ (bKash Wallet)</option>
                  <option value="NAGAD">নগদ (Nagad Wallet)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">গ্রহীতা / প্রদানকারী ব্যক্তি বা প্রতিষ্ঠান *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বাড়ির মালিক / সিটি কর্পোরেশন / সদস্যবৃন্দ"
                  value={newRecipient}
                  onChange={e => setNewRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>
            </div>

            {newPaymentMethod === 'BANK' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">ব্যাংকের নাম ও শাখা</label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={e => setNewBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">চেক নম্বর / ডিপোজিট স্লিপ নম্বর</label>
                  <input
                    type="text"
                    placeholder="যেমন: CHQ-892144 / SLIP-0982"
                    value={newChequeOrTx}
                    onChange={e => setNewChequeOrTx(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">খরচের বিস্তারিত উদ্দেশ্য ও হিসাব বিবরণ *</label>
              <textarea
                required
                rows={2}
                value={newDescBn}
                onChange={e => setNewDescBn(e.target.value)}
                placeholder="ভাউচারের উদ্দেশ্য, অনুমোদনের রেফারেন্স এবং প্রাসঙ্গিক তথ্যাবলি..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-emerald-500"
              />
            </div>

            {/* Double-Entry Preview Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>ডাবল-এন্ট্রি পোস্টিং প্রিভিউ:</span>
                <span className="text-emerald-400 font-mono">মোট: {formatCurrency(newAmount, language)}</span>
              </div>
              <div className="text-emerald-400 font-mono text-[11px]">
                Dr: {newVoucherType === 'DEBIT' ? `[${selectedAccountHeadCode}]` : '[1010] নগদ/ব্যাংক'} (ডেবিট হিসাব)
              </div>
              <div className="text-rose-400 font-mono text-[11px]">
                Cr: {newVoucherType === 'DEBIT' ? '[1010] নগদ/ব্যাংক' : `[${selectedAccountHeadCode}]`} (ক্রেডিট হিসাব)
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('VOUCHERS')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ভাউচার পোস্ট ও অনুমোদন করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: GENERAL LEDGER */}
      {activeTab === 'GENERAL_LEDGER' && (
        <div className="space-y-4">
          
          {/* Account Selector Card */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-slate-400 text-xs mb-1 font-medium">খতিয়ান হিসাব খাত (Account Head) নির্বাচন করুন:</label>
              <select
                value={selectedLedgerHeadCode}
                onChange={e => setSelectedLedgerHeadCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:border-emerald-500"
              >
                {chartOfAccounts.map(head => (
                  <option key={head.id} value={head.code}>
                    [{head.code}] {head.nameBn} — {head.group}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Head Stats */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-500 block">প্রারম্ভিক জের</span>
                <span className="font-bold text-slate-300">{formatCurrency(generalLedgerData.openingBalance, language)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-500 block">বর্তমান সমাপনী ব্যালেন্স</span>
                <span className="font-bold text-emerald-400">{formatCurrency(generalLedgerData.closingBalance, language)}</span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  [{generalLedgerData.head?.code}] {generalLedgerData.head?.nameBn} এর সাধারণ খতিয়ান
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">গ্রুপ: {generalLedgerData.head?.group} • উপ-শ্রেণী: {generalLedgerData.head?.subGroup}</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>লেজার প্রিন্ট</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ ও ভাউচার</th>
                    <th className="py-2.5 px-3 font-sans">বিবরণ (Particulars)</th>
                    <th className="py-2.5 px-3">মাধ্যম</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400">ডেবিট (Dr)</th>
                    <th className="py-2.5 px-3 text-right text-rose-400">ক্রেডিট (Cr)</th>
                    <th className="py-2.5 px-3 text-right">ব্যালেন্স (Balance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {generalLedgerData.entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        এই হিসাব খাতের অধীনে এখনও কোনো লেনদেন ভাউচার অন্তর্ভুক্ত হয়নি।
                      </td>
                    </tr>
                  ) : (
                    generalLedgerData.entries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-200">{entry.voucherNo}</div>
                          <div className="text-[10px] text-slate-500">{entry.date}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">{entry.particularsBn}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {entry.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                          {entry.debit > 0 ? formatCurrency(entry.debit, language) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400 font-bold">
                          {entry.credit > 0 ? formatCurrency(entry.credit, language) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                          {formatCurrency(entry.balance, language)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: CHART OF ACCOUNTS (COA) */}
      {activeTab === 'CHART_OF_ACCOUNTS' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>চার্ট অফ অ্যাকাউন্টস শ্রেণীবিন্যাস (Chart of Accounts Master)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                আন্তর্জাতিক ও সমবায় আইনানুযায়ী সম্পদ, দায়, আয় ও ব্যয়ের হিসাব খতিয়ান তালিকা
              </p>
            </div>

            <button
              onClick={() => setShowNewAccountHeadModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন হিসাব খাত যুক্ত করুন</span>
            </button>
          </div>

          {/* 4 Standard Group Sections */}
          {(['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE'] as const).map(group => {
            const groupHeads = chartOfAccounts.filter(c => c.group === group);
            const totalGroupBalance = groupHeads.reduce((s, c) => s + c.currentBalance, 0);

            return (
              <div key={group} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <div className={`p-3.5 border-b border-slate-800 flex items-center justify-between ${
                  group === 'ASSET' ? 'bg-emerald-950/20 text-emerald-300' :
                  group === 'LIABILITY' ? 'bg-cyan-950/20 text-cyan-300' :
                  group === 'INCOME' ? 'bg-teal-950/20 text-teal-300' :
                  'bg-rose-950/20 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold font-sans">
                    <span className="p-1 rounded bg-slate-900 border border-slate-800 font-mono text-[10px]">
                      {group === 'ASSET' ? '1000' : group === 'LIABILITY' ? '2000' : group === 'INCOME' ? '3000' : '4000'}
                    </span>
                    <span>
                      {group === 'ASSET' ? '১. সম্পদ হিসাবসমূহ (Assets)' :
                       group === 'LIABILITY' ? '২. দায় ও সমবায় মূলধন তহবিল (Liabilities & Equity)' :
                       group === 'INCOME' ? '৩. আয় ও পরিচালন রাজস্ব (Income & Revenue)' :
                       '৪. পরিচালন ও ব্যবস্থাপনা ব্যয় (Expenses)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">({groupHeads.length}টি খাত)</span>
                  </div>

                  <div className="text-xs font-mono font-bold">
                    মোট: {formatCurrency(totalGroupBalance, language)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="bg-slate-900/60 text-slate-400 font-semibold text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">লেজার কোড</th>
                        <th className="py-2 px-3 font-sans">খাতের নাম (বাংলা)</th>
                        <th className="py-2 px-3">নাম (English)</th>
                        <th className="py-2 px-3 font-sans">উপ-শ্রেণী (Sub-Group)</th>
                        <th className="py-2 px-3 text-right">প্রারম্ভিক জের</th>
                        <th className="py-2 px-3 text-right">বর্তমান জের</th>
                        <th className="py-2 px-3 text-center font-sans">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {groupHeads.map(head => (
                        <tr key={head.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-2 px-3 font-bold text-slate-200">{head.code}</td>
                          <td className="py-2 px-3 font-sans font-semibold text-slate-200">{head.nameBn}</td>
                          <td className="py-2 px-3 text-slate-400 text-[11px]">{head.nameEn}</td>
                          <td className="py-2 px-3 font-sans text-slate-400 text-[11px]">{head.subGroup}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{formatCurrency(head.openingBalance, language)}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400">{formatCurrency(head.currentBalance, language)}</td>
                          <td className="py-2 px-3 text-center font-sans">
                            <button
                              onClick={() => {
                                setSelectedLedgerHeadCode(head.code);
                                setActiveTab('GENERAL_LEDGER');
                              }}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                            >
                              লেজার দেখুন
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* TAB 6: FINANCIAL STATEMENTS & TRIAL BALANCE */}
      {activeTab === 'FINANCIAL_REPORTS' && (
        <div className="space-y-4">
          
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setReportSubTab('TRIAL_BALANCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                reportSubTab === 'TRIAL_BALANCE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              রেওয়ামিল (Trial Balance)
            </button>

            <button
              onClick={() => setReportSubTab('INCOME_STATEMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                reportSubTab === 'INCOME_STATEMENT'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              লাভ-ক্ষতি ও আয়-ব্যয় বিবরণী (P&L Statement)
            </button>

            <button
              onClick={() => setReportSubTab('BALANCE_SHEET')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                reportSubTab === 'BALANCE_SHEET'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ব্যালেন্স শিট (Balance Sheet)
            </button>
          </div>

          {/* SUB-TAB: TRIAL BALANCE */}
          {reportSubTab === 'TRIAL_BALANCE' && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>সমিতির সমন্বিত রেওয়ামিল (Balanced Trial Balance)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">অর্থবছর: ২০২৫-২০২৬ • সকল লেজারের ডেবিট ও ক্রেডিট স্থিতি</p>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                  trialBalanceData.isBalanced 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{trialBalanceData.isBalanced ? 'হিসাব সম্পূর্ণ নির্ভুল ও রিকনসিল্ড ✓' : 'সমন্বয় প্রয়োজন'}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">কোড</th>
                      <th className="py-2.5 px-3 font-sans">হিসাব খাতের শিরোনাম</th>
                      <th className="py-2.5 px-3">গ্রুপ</th>
                      <th className="py-2.5 px-3 text-right text-emerald-400">ডেবিট উদ্বৃত্ত (Debit)</th>
                      <th className="py-2.5 px-3 text-right text-cyan-400">ক্রেডিট উদ্বৃত্ত (Credit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {trialBalanceData.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-400">{item.code}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-200">{item.nameBn}</td>
                        <td className="py-2 px-3 text-[10px] text-slate-400">{item.group}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400">
                          {item.debit > 0 ? formatCurrency(item.debit, language) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-cyan-400">
                          {item.credit > 0 ? formatCurrency(item.credit, language) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/90 font-bold border-t-2 border-slate-700 text-sm">
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-right font-sans text-slate-200">
                        সর্বমোট উদ্বৃত্ত (Grand Total):
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400">
                        {formatCurrency(trialBalanceData.totalDebit, language)}
                      </td>
                      <td className="py-3 px-3 text-right text-cyan-400">
                        {formatCurrency(trialBalanceData.totalCredit, language)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB: INCOME STATEMENT */}
          {reportSubTab === 'INCOME_STATEMENT' && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>লাভ-ক্ষতি ও আয়-ব্যয় বিবরণী (Income & Expenditure Statement)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">চলতি অর্থবছরের সার্বিক পরিচালন লাভ ও রাজস্ব বিশ্লেষণ</p>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
                  incomeStatementData.isProfit 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  নিট উদ্বৃত্ত: {formatCurrency(incomeStatementData.netSurplus, language)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Income Side */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400">১. অর্জিত আয় ও মুনাফা (Income)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(incomeStatementData.totalIncome, language)}</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    {incomeStatementData.incomeItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                        <span className="font-sans text-[11px]">{item.nameBn}</span>
                        <span className="font-bold">{formatCurrency(item.currentBalance, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense Side */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-rose-400">২. পরিচালন ও ব্যবস্থাপনা ব্যয় (Expenses)</span>
                    <span className="text-xs font-mono font-bold text-rose-400">{formatCurrency(incomeStatementData.totalExpense, language)}</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    {incomeStatementData.expenseItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                        <span className="font-sans text-[11px]">{item.nameBn}</span>
                        <span className="font-bold text-rose-400">{formatCurrency(item.currentBalance, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Net Surplus Summary Bar */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs sm:text-sm font-bold">
                <span className="text-slate-200">চলতি অর্থবছরের নিট মুনাফা / উদ্বৃত্ত তহবিল (Net Surplus):</span>
                <span className="text-emerald-400 text-base font-mono">{formatCurrency(incomeStatementData.netSurplus, language)}</span>
              </div>
            </div>
          )}

          {/* SUB-TAB: BALANCE SHEET */}
          {reportSubTab === 'BALANCE_SHEET' && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>সমিতির উদ্বৃত্ত পত্র / আর্থিক অবস্থার বিবরণী (Balance Sheet)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">মোট সম্পদ = মোট দায় + পরিশোধিত শেয়ার মূলধন ও সংরক্ষিত তহবিল</p>
                </div>

                <div className="text-xs font-mono font-bold text-cyan-400">
                  মোট সম্পদ: {formatCurrency(balanceSheetData.totalAssets, language)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Assets Column */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400">সম্পদসমূহ (Assets)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(balanceSheetData.totalAssets, language)}</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    {balanceSheetData.assetItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                        <div>
                          <div className="font-sans text-[11px] text-slate-200">{item.nameBn}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{item.subGroup}</div>
                        </div>
                        <span className="font-bold text-emerald-400">{formatCurrency(item.currentBalance, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities Column */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-cyan-400">দায় ও তহবিল (Liabilities & Equity)</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{formatCurrency(balanceSheetData.totalLiabilities, language)}</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    {balanceSheetData.liabilityItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                        <div>
                          <div className="font-sans text-[11px] text-slate-200">{item.nameBn}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{item.subGroup}</div>
                        </div>
                        <span className="font-bold text-cyan-400">{formatCurrency(item.currentBalance, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: OFFICIAL VOUCHER PRINT SLIP */}
      {selectedVoucherForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                <span>অফিসিয়াল ভাউচার স্লিপ প্রিভিউ</span>
              </span>
              <button
                onClick={() => setSelectedVoucherForSlip(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Letterhead Printable Card */}
            <div id="voucher-print-area" className="p-6 rounded-xl bg-white text-slate-900 space-y-4 border border-slate-200 shadow-md">
              
              {/* Samity Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {letterhead.samityNameBn}
                </h2>
                <div className="text-[11px] text-slate-600 font-medium">
                  {letterhead.sloganBn} • রেজিঃ নং {letterhead.govtRegNo}
                </div>
                <div className="text-[10px] text-slate-500">
                  {letterhead.addressBn} • ফোন: {letterhead.phone}
                </div>
                <div className="inline-block mt-2 px-3 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-bold">
                  {selectedVoucherForSlip.type === 'DEBIT' ? 'ডেবিট ভাউচার (ব্যয় পরিশোধ)' :
                   selectedVoucherForSlip.type === 'CREDIT' ? 'ক্রেডিট ভাউচার (আদায় রশিদ)' :
                   'জার্নাল / কন্ট্রা ভাউচার'}
                </div>
              </div>

              {/* Meta Row */}
              <div className="flex items-center justify-between text-xs font-mono border-b border-slate-200 pb-2">
                <div>
                  <span className="font-sans text-slate-500">ভাউচার নং: </span>
                  <span className="font-bold text-slate-900">{selectedVoucherForSlip.voucherNo}</span>
                </div>
                <div>
                  <span className="font-sans text-slate-500">তারিখ: </span>
                  <span className="font-bold text-slate-900">{selectedVoucherForSlip.date}</span>
                </div>
              </div>

              {/* Voucher Details Table */}
              <div className="text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">হিসাবের খাত (Head):</span>
                  <span className="col-span-2 font-bold text-slate-900">{selectedVoucherForSlip.category}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">প্রদানকারী / গ্রহীতা:</span>
                  <span className="col-span-2 font-semibold text-slate-800">{selectedVoucherForSlip.paidToOrReceivedFrom}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">পরিশোধের মাধ্যম:</span>
                  <span className="col-span-2 text-slate-800 font-mono">
                    {selectedVoucherForSlip.paymentMethod} {selectedVoucherForSlip.chequeOrTxNo ? `(${selectedVoucherForSlip.chequeOrTxNo})` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">বিস্তারিত বিবরণ:</span>
                  <span className="col-span-2 text-slate-700">{selectedVoucherForSlip.descriptionBn}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-lg px-2">
                  <span className="text-slate-700 font-bold self-center">টাকার পরিমাণ:</span>
                  <span className="col-span-2 font-mono font-bold text-base text-slate-950">
                    {formatCurrency(selectedVoucherForSlip.amount, language)}
                  </span>
                </div>
              </div>

              {/* Signatures Footer */}
              <div className="grid grid-cols-3 gap-4 pt-10 text-center text-[10px] text-slate-600">
                <div className="border-t border-slate-400 pt-1">
                  প্রস্তুতকারীর স্বাক্ষর
                </div>
                <div className="border-t border-slate-400 pt-1">
                  হিসাবরক্ষক / ক্যাশিয়ার
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  সভাপতি / পরিচালকের সিল
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedVoucherForSlip(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: NEW ACCOUNT HEAD (CHART OF ACCOUNTS) */}
      {showNewAccountHeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>নতুন চার্ট অফ অ্যাকাউন্টস হিসাব খাত যুক্ত করুন</span>
              </h3>
              <button onClick={() => setShowNewAccountHeadModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountHeadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">খাতের লেজার কোড *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 4070"
                    value={newHeadCode}
                    onChange={e => setNewHeadCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">হিসাবের গ্রুপ (Group) *</label>
                  <select
                    value={newHeadGroup}
                    onChange={e => setNewHeadGroup(e.target.value as AccountHeadGroup)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="ASSET">১. সম্পদ (Asset - 1000)</option>
                    <option value="LIABILITY">২. দায় ও মূলধন (Liability - 2000)</option>
                    <option value="INCOME">৩. আয় ও রাজস্ব (Income - 3000)</option>
                    <option value="EXPENSE">৪. ব্যয় ও পরিচালন খরচ (Expense - 4000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">খাতের শিরোনাম (বাংলায়) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আইনি ও পেশাগত পরামর্শ ফি"
                  value={newHeadNameBn}
                  onChange={e => setNewHeadNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">খাতের শিরোনাম (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Legal & Professional Fees"
                  value={newHeadNameEn}
                  onChange={e => setNewHeadNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">উপ-শ্রেণী (Sub-Group)</label>
                  <input
                    type="text"
                    value={newHeadSubGroup}
                    onChange={e => setNewHeadSubGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">প্রারম্ভিক জের (Opening Balance)</label>
                  <input
                    type="number"
                    value={newHeadOpeningBalance}
                    onChange={e => setNewHeadOpeningBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">মন্তব্য বা ব্যবহারের নোট</label>
                <input
                  type="text"
                  placeholder="অডিট ও খতিয়ান সংক্রান্ত দিকনির্দেশনা..."
                  value={newHeadNotes}
                  onChange={e => setNewHeadNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewAccountHeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  খাত সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
