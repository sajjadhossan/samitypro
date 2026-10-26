'use client';

import React, { useState, useMemo } from 'react';
import { 
  PiggyBank, Plus, TrendingUp, Calendar, CreditCard, 
  Receipt, ArrowDownLeft, ArrowUpRight, CheckCircle2, 
  Search, Filter, ShieldCheck, AlertCircle, FileText, 
  Download, Printer, Calculator, Sliders, RefreshCw,
  Users, Building2, Check, Clock, AlertTriangle, Eye, X, BookOpen, Layers
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, toBengaliNumber } from '@/lib/i18n';
import { SavingsAccount, SavingsType, PaymentMethod, SavingsTransaction } from '@/types';
import confetti from 'canvas-confetti';

interface SavingsViewProps {
  onOpenRecordDeposit?: () => void;
}

export function SavingsView({ onOpenRecordDeposit }: SavingsViewProps) {
  const { 
    activeTenant, currentUser, language, members, 
    savingsAccounts, savingsTransactions, savingsPolicy,
    openSavingsAccount, recordSavingsDeposit, recordSavingsWithdrawal,
    closeOrSettleSavingsAccount, updateSavingsPolicy 
  } = useSamityStore();

  const t = translations[language];

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'accounts' | 'open-account' | 'deposit' | 'withdraw' | 'policies'>('accounts');

  // Filter & Search states for Accounts List
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | SavingsType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MATURED' | 'CLOSED'>('ALL');

  // Selected Account for Modals
  const [selectedAccountForPassbook, setSelectedAccountForPassbook] = useState<SavingsAccount | null>(null);
  const [printableReceiptTx, setPrintableReceiptTx] = useState<SavingsTransaction | null>(null);
  const [settlementAccount, setSettlementAccount] = useState<SavingsAccount | null>(null);

  // New Account Wizard State
  const [newAccMemberId, setNewAccMemberId] = useState(members[0]?.id || '');
  const [newAccType, setNewAccType] = useState<SavingsType>('DPS');
  const [newAccTitle, setNewAccTitle] = useState('৫ বছর মেয়াদী সঞ্চয় স্কিম (ডিপিএস)');
  const [newAccInstallment, setNewAccInstallment] = useState<number>(2000);
  const [newAccTenureMonths, setNewAccTenureMonths] = useState<number>(60);
  const [newAccInterestRate, setNewAccInterestRate] = useState<number>(9.5);
  const [newAccInitialDeposit, setNewAccInitialDeposit] = useState<number>(2000);
  const [newAccPaymentMethod, setNewAccPaymentMethod] = useState<PaymentMethod>('CASH');
  const [newAccNomineeName, setNewAccNomineeName] = useState('');
  const [newAccNomineeRelation, setNewAccNomineeRelation] = useState('');
  const [newAccNomineePhone, setNewAccNomineePhone] = useState('');
  const [newAccNomineeShare, setNewAccNomineeShare] = useState<number>(100);
  const [newAccNotes, setNewAccNotes] = useState('');
  const [newAccSuccessMsg, setNewAccSuccessMsg] = useState('');

  // Deposit Form State
  const [depAccountId, setDepAccountId] = useState('');
  const [depAmount, setDepAmount] = useState<number>(2000);
  const [depPaymentMethod, setDepPaymentMethod] = useState<PaymentMethod>('CASH');
  const [depNotes, setDepNotes] = useState('নিয়মিত সঞ্চয় / ডিপিএস কিস্তি জমা');
  const [depSuccessMsg, setDepSuccessMsg] = useState('');

  // Withdrawal Form State
  const [wdAccountId, setWdAccountId] = useState('');
  const [wdAmount, setWdAmount] = useState<number>(1000);
  const [wdPaymentMethod, setWdPaymentMethod] = useState<PaymentMethod>('CASH');
  const [wdNotes, setWdNotes] = useState('ব্যক্তিগত প্রয়োজনে সঞ্চয় তহবিল থেকে উত্তোলন');
  const [wdErrorMsg, setWdErrorMsg] = useState('');
  const [wdSuccessMsg, setWdSuccessMsg] = useState('');

  // Policy Form State
  const [policyRate, setPolicyRate] = useState(savingsPolicy.generalSavingsInterestRate);
  const [policyMinReserve, setPolicyMinReserve] = useState(savingsPolicy.minimumBalanceRequired);
  const [policyDpsFine, setPolicyDpsFine] = useState(savingsPolicy.dpsDefaultFinePerMissedMonth);
  const [policyDpsGrace, setPolicyDpsGrace] = useState(savingsPolicy.dpsGracePeriodDays);
  const [policyEarlyDeduction, setPolicyEarlyDeduction] = useState(savingsPolicy.dpsEarlyClosureProfitDeductionPercent);
  const [policyFdr6, setPolicyFdr6] = useState(savingsPolicy.fixedDepositRates.months6);
  const [policyFdr12, setPolicyFdr12] = useState(savingsPolicy.fixedDepositRates.months12);
  const [policyFdr24, setPolicyFdr24] = useState(savingsPolicy.fixedDepositRates.months24);
  const [policyFdr36, setPolicyFdr36] = useState(savingsPolicy.fixedDepositRates.months36);
  const [policySavedMsg, setPolicySavedMsg] = useState('');

  // Calculations for KPI Cards
  const totalGeneralSavings = savingsAccounts
    .filter(a => a.type === 'GENERAL_SAVINGS' && a.status !== 'CLOSED')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalDpsBalance = savingsAccounts
    .filter(a => a.type === 'DPS' && a.status !== 'CLOSED')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalFdrBalance = savingsAccounts
    .filter(a => a.type === 'FIXED_DEPOSIT' && a.status !== 'CLOSED')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalCombinedSavings = totalGeneralSavings + totalDpsBalance + totalFdrBalance;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysDeposits = savingsTransactions
    .filter(t => t.date === todayStr && t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const todaysWithdrawals = savingsTransactions
    .filter(t => t.date === todayStr && t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return savingsAccounts.filter(acc => {
      const member = members.find(m => m.id === acc.memberId);
      const matchesType = typeFilter === 'ALL' || acc.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        acc.accountNo.toLowerCase().includes(q) ||
        acc.title.toLowerCase().includes(q) ||
        (member?.nameBn && member.nameBn.toLowerCase().includes(q)) ||
        (member?.nameEn && member.nameEn.toLowerCase().includes(q)) ||
        (member?.memberCode && member.memberCode.toLowerCase().includes(q)) ||
        (member?.phone && member.phone.includes(q));

      return matchesType && matchesStatus && matchesQuery;
    });
  }, [savingsAccounts, members, typeFilter, statusFilter, searchQuery]);

  // Projected Maturity Calculator for New Account
  const calculatedMaturity = useMemo(() => {
    if (newAccType === 'DPS') {
      const months = Number(newAccTenureMonths) || 12;
      const monthly = Number(newAccInstallment) || 500;
      const rate = Number(newAccInterestRate) || 8.0;
      const totalPrincipal = monthly * months;
      // Compounded simple interest formula for monthly DPS
      const profit = totalPrincipal * (rate / 100) * (months / 24);
      return {
        principal: totalPrincipal,
        profit: Math.round(profit),
        totalMaturity: Math.round(totalPrincipal + profit)
      };
    } else if (newAccType === 'FIXED_DEPOSIT') {
      const principal = Number(newAccInitialDeposit) || 10000;
      const months = Number(newAccTenureMonths) || 12;
      const rate = Number(newAccInterestRate) || 10.0;
      const profit = (principal * rate * (months / 12)) / 100;
      return {
        principal,
        profit: Math.round(profit),
        totalMaturity: Math.round(principal + profit)
      };
    }
    return { principal: 0, profit: 0, totalMaturity: 0 };
  }, [newAccType, newAccTenureMonths, newAccInstallment, newAccInterestRate, newAccInitialDeposit]);

  // When Member Changes in Wizard, sync Nominee
  const handleMemberChange = (mId: string) => {
    setNewAccMemberId(mId);
    const m = members.find(mem => mem.id === mId);
    if (m?.nominee) {
      setNewAccNomineeName(m.nominee.name || '');
      setNewAccNomineeRelation(m.nominee.relation || '');
      setNewAccNomineePhone(m.nominee.phone || '');
      setNewAccNomineeShare(m.nominee.sharePercentage || 100);
    }
  };

  // Handle Create Account
  const handleOpenAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccMemberId) {
      alert('অনুগ্রহ করে একজন সদস্য নির্বাচন করুন।');
      return;
    }

    try {
      const created = openSavingsAccount({
        tenantId: activeTenant.id,
        memberId: newAccMemberId,
        type: newAccType,
        title: newAccTitle,
        monthlyInstallment: newAccType === 'DPS' ? Number(newAccInstallment) : undefined,
        targetAmount: (newAccType === 'DPS' || newAccType === 'FIXED_DEPOSIT') ? calculatedMaturity.totalMaturity : undefined,
        tenureMonths: (newAccType === 'DPS' || newAccType === 'FIXED_DEPOSIT') ? Number(newAccTenureMonths) : undefined,
        interestRate: Number(newAccInterestRate),
        initialDeposit: Number(newAccInitialDeposit),
        paymentMethod: newAccPaymentMethod,
        nomineeName: newAccNomineeName,
        nomineeRelation: newAccNomineeRelation,
        nomineePhone: newAccNomineePhone,
        nomineeSharePercent: Number(newAccNomineeShare),
        notes: newAccNotes
      });

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setNewAccSuccessMsg(`অভিনন্দন! হিসাব ${created.accountNo} সফলভাবে খোলা হয়েছে।`);
      setTimeout(() => {
        setNewAccSuccessMsg('');
        setActiveTab('accounts');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'হিসাব খুলতে সমস্যা হয়েছে।');
    }
  };

  // Handle Deposit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depAccountId) {
      alert('অনুগ্রহ করে একটি সঞ্চয় বা ডিপিএস হিসাব নির্বাচন করুন।');
      return;
    }
    if (depAmount <= 0) {
      alert('সঠিক জমার পরিমাণ উল্লেখ করুন।');
      return;
    }

    const acc = savingsAccounts.find(a => a.id === depAccountId);
    if (!acc) return;

    try {
      const tx = recordSavingsDeposit({
        tenantId: activeTenant.id,
        memberId: acc.memberId,
        accountId: acc.id,
        amount: Number(depAmount),
        paymentMethod: depPaymentMethod,
        notes: depNotes
      });

      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      } catch {}

      setDepSuccessMsg(`৳${depAmount.toLocaleString()} সফলভাবে জমা হয়েছে! রসিদ নং: ${tx?.receiptNo}`);
      setPrintableReceiptTx(tx || null);
      setTimeout(() => setDepSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'জমা গ্রহণে সমস্যা হয়েছে।');
    }
  };

  // Handle Withdrawal
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWdErrorMsg('');
    setWdSuccessMsg('');

    if (!wdAccountId) {
      setWdErrorMsg('অনুগ্রহ করে একটি সঞ্চয় হিসাব নির্বাচন করুন।');
      return;
    }
    if (wdAmount <= 0) {
      setWdErrorMsg('সঠিক উত্তোলনের পরিমাণ উল্লেখ করুন।');
      return;
    }

    const acc = savingsAccounts.find(a => a.id === wdAccountId);
    if (!acc) return;

    try {
      const tx = recordSavingsWithdrawal({
        tenantId: activeTenant.id,
        accountId: acc.id,
        memberId: acc.memberId,
        amount: Number(wdAmount),
        paymentMethod: wdPaymentMethod,
        notes: wdNotes
      });

      setWdSuccessMsg(`৳${wdAmount.toLocaleString()} সফলভাবে উত্তোলন সম্পন্ন হয়েছে! ভাউচার নং: ${tx.receiptNo}`);
      setPrintableReceiptTx(tx);
    } catch (err: any) {
      setWdErrorMsg(err.message || 'উত্তোলন ব্যর্থ হয়েছে।');
    }
  };

  // Handle Policy Save
  const handlePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSavingsPolicy({
      generalSavingsInterestRate: Number(policyRate),
      minimumBalanceRequired: Number(policyMinReserve),
      dpsDefaultFinePerMissedMonth: Number(policyDpsFine),
      dpsGracePeriodDays: Number(policyDpsGrace),
      dpsEarlyClosureProfitDeductionPercent: Number(policyEarlyDeduction),
      fixedDepositRates: {
        months6: Number(policyFdr6),
        months12: Number(policyFdr12),
        months24: Number(policyFdr24),
        months36: Number(policyFdr36),
      }
    });

    setPolicySavedMsg('সঞ্চয় ও ডিপিএস নীতিমালা সফলভাবে সংরক্ষণ ও আপডেট করা হয়েছে!');
    setTimeout(() => setPolicySavedMsg(''), 3000);
  };

  // Quick Action from Table to Deposit/Withdraw
  const triggerQuickDeposit = (acc: SavingsAccount) => {
    setDepAccountId(acc.id);
    setDepAmount(acc.monthlyInstallment || 1000);
    setActiveTab('deposit');
  };

  const triggerQuickWithdraw = (acc: SavingsAccount) => {
    setWdAccountId(acc.id);
    setWdAmount(Math.min(acc.balance, 5000));
    setActiveTab('withdraw');
  };

  return (
    <div className="space-y-6">
      
      {/* Module 4 Top Header Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              মডিউল ৪: সঞ্চয়, ডিপিএস ও আমানত
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2.5">
            <PiggyBank className="w-6 h-6 text-emerald-400" />
            <span>সঞ্চয় ও ডিপিএস ব্যবস্থাপনা (Savings & DPS Engine)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            দৈনিক সাধারণ সঞ্চয়, মাসিক ডিপিএস স্কিম ও মেয়াদী আমানত (FDR) হিসাব পরিচালনা, কিস্তি কালেকশন, ডিজিটাল পাসবই ও লাভ-ক্ষতি নিষ্পত্তি।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('open-account')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন হিসাব খুলুন</span>
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer active:scale-95 touch-manipulation"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>জমা নিন</span>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer active:scale-95 touch-manipulation"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>উত্তোলন</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>সর্বমোট আমানত তহবিল</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalCombinedSavings, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>মোট সক্রিয় হিসাব:</span>
            <span className="font-bold text-slate-300">{toBengaliNumber(savingsAccounts.filter(a => a.status === 'ACTIVE').length)} টি</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>সাধারণ সঞ্চয় স্থিতি</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">
            {formatCurrency(totalGeneralSavings, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>মুনাফা হার:</span>
            <span className="font-bold text-cyan-300">{savingsPolicy.generalSavingsInterestRate}% p.a.</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ডিপিএস (DPS) তহবিল</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono">
            {formatCurrency(totalDpsBalance, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>ডিপিএস হিসাব:</span>
            <span className="font-bold text-indigo-300">{toBengaliNumber(savingsAccounts.filter(a => a.type === 'DPS').length)} টি</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>স্থায়ী আমানত (FDR)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
            {formatCurrency(totalFdrBalance, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>মেয়াদী স্কিম:</span>
            <span className="font-bold text-amber-300">১০.৫% পর্যন্ত</span>
          </div>
        </div>
      </div>

      {/* Module 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer touch-manipulation ${
            activeTab === 'accounts'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>১. সঞ্চয় ও ডিপিএস হিসাবসমূহ ({toBengaliNumber(savingsAccounts.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('open-account')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer touch-manipulation ${
            activeTab === 'open-account'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>২. নতুন হিসাব খুলুন (New Account)</span>
        </button>

        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer touch-manipulation ${
            activeTab === 'deposit'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>৩. কিস্তি ও সঞ্চয় জমা (Deposit)</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer touch-manipulation ${
            activeTab === 'withdraw'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>৪. সঞ্চয় উত্তোলন (Withdrawal)</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer touch-manipulation ${
            activeTab === 'policies'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>৫. স্কিম ও পলিসি কনফিগারেশন</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ACCOUNTS LIST & DIRECTORY */}
      {/* ============================================================== */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          
          {/* Filters & Search Toolbar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="সদস্যের নাম, কোড, মোবাইল বা হিসাব নং (Account No) দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Scheme Type Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer touch-manipulation ${
                  typeFilter === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                সকল হিসাব ({savingsAccounts.length})
              </button>
              <button
                onClick={() => setTypeFilter('GENERAL_SAVINGS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer touch-manipulation ${
                  typeFilter === 'GENERAL_SAVINGS'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                সাধারণ সঞ্চয় ({savingsAccounts.filter(a => a.type === 'GENERAL_SAVINGS').length})
              </button>
              <button
                onClick={() => setTypeFilter('DPS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer touch-manipulation ${
                  typeFilter === 'DPS'
                    ? 'bg-indigo-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ডিপিএস ({savingsAccounts.filter(a => a.type === 'DPS').length})
              </button>
              <button
                onClick={() => setTypeFilter('FIXED_DEPOSIT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer touch-manipulation ${
                  typeFilter === 'FIXED_DEPOSIT'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                স্থায়ী আমানত/FDR ({savingsAccounts.filter(a => a.type === 'FIXED_DEPOSIT').length})
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 shrink-0"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="ACTIVE">সক্রিয় (Active)</option>
              <option value="MATURED">পরিপক্ক (Matured)</option>
              <option value="CLOSED">নিষ্পত্তিকৃত (Closed)</option>
            </select>
          </div>

          {/* Accounts Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">হিসাব নম্বর ও ধরন</th>
                    <th className="py-3 px-4">সদস্যের তথ্য</th>
                    <th className="py-3 px-4">কিস্তি / আমানত</th>
                    <th className="py-3 px-4 text-right">বর্তমান ব্যালান্স</th>
                    <th className="py-3 px-4">মেয়াদ ও মুনাফা</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <PiggyBank className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-sm">কোনো সঞ্চয় হিসাব খুঁজে পাওয়া যায়নি</p>
                        <p className="text-[11px] text-slate-500 mt-1">ফিল্টার পরিবর্তন করুন অথবা নতুন হিসাব খুলুন।</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map(acc => {
                      const member = members.find(m => m.id === acc.memberId);
                      return (
                        <tr key={acc.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-white text-xs">{acc.accountNo}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                acc.type === 'DPS'
                                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                  : acc.type === 'FIXED_DEPOSIT'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                              }`}>
                                {acc.type === 'DPS' ? 'মাসিক ডিপিএস' : acc.type === 'FIXED_DEPOSIT' ? 'স্থায়ী আমানত (FDR)' : 'সাধারণ সঞ্চয়'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5">{acc.title}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-white">
                              {language === 'bn' ? member?.nameBn : member?.nameEn}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {member?.memberCode} • {member?.phone}
                            </div>
                            {acc.nomineeName && (
                              <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                নমিনি: {acc.nomineeName} ({acc.nomineeRelation})
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono">
                            {acc.type === 'DPS' ? (
                              <div>
                                <div className="text-white font-semibold">
                                  {formatCurrency(acc.monthlyInstallment || 0, language)} / মাস
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  টার্গেট: {formatCurrency(acc.targetAmount || 0, language)}
                                </div>
                              </div>
                            ) : acc.type === 'FIXED_DEPOSIT' ? (
                              <div>
                                <div className="text-white font-semibold">
                                  আমানত: {formatCurrency(acc.totalDeposited || acc.balance, language)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  মেয়াদপূর্তিতে: {formatCurrency(acc.targetAmount || 0, language)}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-slate-300">ঐচ্ছিক দৈনিক/মাসিক</div>
                                <div className="text-[10px] text-slate-500">
                                  জমা: {formatCurrency(acc.totalDeposited || acc.balance, language)}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="font-mono font-bold text-sm text-emerald-400">
                              {formatCurrency(acc.balance, language)}
                            </div>
                            {acc.lastDepositDate && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                শেষ জমা: {acc.lastDepositDate}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px]">
                            <div className="text-slate-300">
                              মুনাফা: <span className="text-cyan-400 font-bold">{acc.interestRate}%</span>
                            </div>
                            {acc.maturityDate ? (
                              <div className="text-slate-400">
                                মেয়াদ: {acc.maturityDate}
                              </div>
                            ) : (
                              <div className="text-slate-500">চালু: {acc.startDate}</div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              acc.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : acc.status === 'MATURED'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {acc.status === 'ACTIVE' ? 'সক্রিয়' : acc.status === 'MATURED' ? 'মেয়াদপূর্তি' : 'বন্ধকৃত'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {acc.status === 'ACTIVE' && (
                                <>
                                  <button
                                    onClick={() => triggerQuickDeposit(acc)}
                                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition cursor-pointer"
                                    title="জমা গ্রহণ করুন"
                                  >
                                    <ArrowDownLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => triggerQuickWithdraw(acc)}
                                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition cursor-pointer"
                                    title="সঞ্চয় উত্তোলন"
                                  >
                                    <ArrowUpRight className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setSelectedAccountForPassbook(acc)}
                                className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 transition cursor-pointer"
                                title="ডিজিটাল পাসবই খতিয়ান"
                              >
                                <BookOpen className="w-4 h-4" />
                              </button>
                              {acc.status === 'ACTIVE' && (acc.type === 'DPS' || acc.type === 'FIXED_DEPOSIT') && (
                                <button
                                  onClick={() => setSettlementAccount(acc)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                  title="হিসাব নিষ্পত্তি ও ক্লোজার"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
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
      {/* TAB 2: OPEN NEW ACCOUNT WIZARD */}
      {/* ============================================================== */}
      {activeTab === 'open-account' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-7 max-w-4xl mx-auto">
          <div className="pb-4 border-b border-slate-800 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>নতুন সঞ্চয় / ডিপিএস / এফডিআর হিসাব খুলুন</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                নিবন্ধিত সদস্যের জন্য সাধারণ সঞ্চয়, মাসিক ডিপিএস বা স্থায়ী আমানত হিসাব তৈরি করুন।
              </p>
            </div>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-xs text-slate-400 hover:text-white"
            >
              ফিরে যান (Cancel)
            </button>
          </div>

          {newAccSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 mb-6 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>{newAccSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleOpenAccountSubmit} className="space-y-6">
            
            {/* Step 1: Member Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                ১. সদস্য নির্বাচন করুন (Select Member) *
              </label>
              <select
                value={newAccMemberId}
                onChange={e => handleMemberChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nameBn} ({m.memberCode}) • মোবাইল: {m.phone} • পিতা/স্বামী: {m.fatherHusbandName}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Account Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                ২. সঞ্চয় স্কিমের ধরন নির্বাচন করুন *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewAccType('DPS');
                    setNewAccTitle('৫ বছর মেয়াদী সঞ্চয় স্কিম (ডিপিএস)');
                    setNewAccInterestRate(9.5);
                    setNewAccTenureMonths(60);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    newAccType === 'DPS'
                      ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-indigo-400">মাসিক ডিপিএস (DPS)</span>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-[11px] leading-relaxed">নির্দিষ্ট মেয়াদে প্রতিমাসে কিস্তিভিত্তিক সঞ্চয় স্কিম।</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewAccType('GENERAL_SAVINGS');
                    setNewAccTitle('দৈনিক সাধারণ সঞ্চয় হিসাব');
                    setNewAccInterestRate(savingsPolicy.generalSavingsInterestRate);
                    setNewAccTenureMonths(0);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    newAccType === 'GENERAL_SAVINGS'
                      ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-cyan-400">সাধারণ সঞ্চয় (Savings)</span>
                    <PiggyBank className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-[11px] leading-relaxed">যেকোনো সময় জমা ও উত্তোলনের সুবিধাযুক্ত সাধারণ হিসাব।</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewAccType('FIXED_DEPOSIT');
                    setNewAccTitle('২ বছর মেয়াদী স্থায়ী আমানত (FDR)');
                    setNewAccInterestRate(10.5);
                    setNewAccTenureMonths(24);
                    setNewAccInitialDeposit(50000);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    newAccType === 'FIXED_DEPOSIT'
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-amber-400">স্থায়ী আমানত (FDR)</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] leading-relaxed">এককালীন মোটা অঙ্কের ডিপোজিট ও উচ্চ মুনাফা স্কিম।</p>
                </button>
              </div>
            </div>

            {/* Step 3: Account Parameters & Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">হিসাবের শিরোনাম (Title)</label>
                <input
                  type="text"
                  value={newAccTitle}
                  onChange={e => setNewAccTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">বার্ষিক মুনাফা হার (% Interest Rate)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newAccInterestRate}
                  onChange={e => setNewAccInterestRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {newAccType === 'DPS' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">মাসিক কিস্তির পরিমাণ (Monthly Installment ৳)</label>
                    <input
                      type="number"
                      value={newAccInstallment}
                      onChange={e => setNewAccInstallment(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {[500, 1000, 2000, 5000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setNewAccInstallment(amt)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                        >
                          ৳{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">স্কিমের মেয়াদকাল (Tenure)</label>
                    <select
                      value={newAccTenureMonths}
                      onChange={e => setNewAccTenureMonths(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={12}>১ বছর (১২ মাস)</option>
                      <option value={36}>৩ বছর (৩৬ মাস)</option>
                      <option value={60}>৫ বছর (৬০ মাস)</option>
                      <option value={120}>১০ বছর (১২০ মাস)</option>
                    </select>
                  </div>
                </>
              )}

              {newAccType === 'FIXED_DEPOSIT' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">স্থায়ী আমানতের পরিমাণ (FDR Amount ৳)</label>
                    <input
                      type="number"
                      value={newAccInitialDeposit}
                      onChange={e => setNewAccInitialDeposit(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">লক-ইন মেয়াদকাল (FDR Term)</label>
                    <select
                      value={newAccTenureMonths}
                      onChange={e => setNewAccTenureMonths(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={6}>৬ মাস (৮.০% মুনাফা)</option>
                      <option value={12}>১ বছর (৯.৫% মুনাফা)</option>
                      <option value={24}>২ বছর (১০.৫% মুনাফা)</option>
                      <option value={36}>৩ বছর (১১.৫% মুনাফা)</option>
                    </select>
                  </div>
                </>
              )}

              {newAccType === 'GENERAL_SAVINGS' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">প্রারম্ভিক জমা (Opening Deposit ৳)</label>
                  <input
                    type="number"
                    value={newAccInitialDeposit}
                    onChange={e => setNewAccInitialDeposit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">জমার মাধ্যম (Payment Method)</label>
                <select
                  value={newAccPaymentMethod}
                  onChange={e => setNewAccPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="CASH">ক্যাশ / নগদ (Office Cash)</option>
                  <option value="BANK">ব্যাংক অ্যাকাউন্ট ট্রান্সফার</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Projected Maturity Card */}
            {(newAccType === 'DPS' || newAccType === 'FIXED_DEPOSIT') && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <Calculator className="w-4 h-4" />
                  <span>প্রত্যাশিত মেয়াদপূর্তি হিসাব বিবরণী (Projected Maturity Simulator):</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">মোট মূল জমা:</span>
                    <strong className="text-white text-sm">{formatCurrency(calculatedMaturity.principal, language)}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">আনুমানিক প্রফিট:</span>
                    <strong className="text-cyan-400 text-sm">+{formatCurrency(calculatedMaturity.profit, language)}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-emerald-300 text-[10px] block">মেয়াদপূর্তিতে মোট প্রদেয়:</span>
                    <strong className="text-emerald-400 text-sm">{formatCurrency(calculatedMaturity.totalMaturity, language)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Nominee Information */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                ৩. মনোনীত ব্যক্তি / নমিনি সংক্রান্ত তথ্য (Nominee Details)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">নমিনির নাম</label>
                  <input
                    type="text"
                    value={newAccNomineeName}
                    onChange={e => setNewAccNomineeName(e.target.value)}
                    placeholder="নমিনির পূর্ণ নাম"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">সম্পর্ক</label>
                  <input
                    type="text"
                    value={newAccNomineeRelation}
                    onChange={e => setNewAccNomineeRelation(e.target.value)}
                    placeholder="স্ত্রী / স্বামী / পুত্র / কন্যা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={newAccNomineePhone}
                    onChange={e => setNewAccNomineePhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">শেয়ার অংশ (%)</label>
                  <input
                    type="number"
                    value={newAccNomineeShare}
                    onChange={e => setNewAccNomineeShare(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    max="100"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('accounts')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                হিসাব নিশ্চিত করুন ও সক্রিয় করুন →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: COLLECT DEPOSIT & RECEIPT */}
      {/* ============================================================== */}
      {activeTab === 'deposit' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-7 max-w-2xl mx-auto">
          <div className="pb-4 border-b border-slate-800 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <span>সঞ্চয় ও ডিপিএস কিস্তি জমা আদায়</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                সদস্যের সঞ্চয় বা ডিপিএস হিসেবে টাকা জমা গ্রহণ ও তাত্ক্ষণিক রসিদ জেনারেট করুন।
              </p>
            </div>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-xs text-slate-400 hover:text-white"
            >
              তালিকায় ফিরে যান
            </button>
          </div>

          {depSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-between gap-2 mb-6 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{depSuccessMsg}</span>
              </div>
              {printableReceiptTx && (
                <button
                  type="button"
                  onClick={() => setPrintableReceiptTx(printableReceiptTx)}
                  className="px-3 py-1 rounded bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  রসিদ দেখুন
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleDepositSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                সঞ্চয় / ডিপিএস হিসাব নির্বাচন করুন *
              </label>
              <select
                value={depAccountId}
                onChange={e => {
                  setDepAccountId(e.target.value);
                  const selectedAcc = savingsAccounts.find(a => a.id === e.target.value);
                  if (selectedAcc?.monthlyInstallment) {
                    setDepAmount(selectedAcc.monthlyInstallment);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">-- হিসাব নির্বাচন করুন --</option>
                {savingsAccounts
                  .filter(a => a.status === 'ACTIVE')
                  .map(acc => {
                    const member = members.find(m => m.id === acc.memberId);
                    return (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountNo} - {member?.nameBn} ({member?.memberCode}) • {acc.title} • স্থিতি: ৳{acc.balance.toLocaleString()}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                জমার পরিমাণ (Amount in BDT ৳) *
              </label>
              <input
                type="number"
                value={depAmount}
                onChange={e => setDepAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-base font-bold text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                required
                min="10"
              />
              <div className="flex items-center gap-2 mt-2">
                {[500, 1000, 2000, 3000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepAmount(val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    ৳{val}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">পেমেন্ট মেথড (Payment Method)</label>
                <select
                  value={depPaymentMethod}
                  onChange={e => setDepPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="CASH">ক্যাশ / নগদ (Office Cash)</option>
                  <option value="BANK">ব্যাংক ডিপোজিট (Bank Account)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">মন্তব্য / বিবরণ</label>
                <input
                  type="text"
                  value={depNotes}
                  onChange={e => setDepNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                টাকা জমা নিন ও রসিদ তৈরি করুন →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: WITHDRAWAL & SETTLEMENT */}
      {/* ============================================================== */}
      {activeTab === 'withdraw' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-7 max-w-2xl mx-auto">
          <div className="pb-4 border-b border-slate-800 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                <span>সঞ্চয় তহবিল থেকে উত্তোলন (Savings Withdrawal)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                সদস্যের সাধারণ সঞ্চয় বা প্রযোজ্য তহবিল থেকে টাকা উত্তোলন ও ডেবিট ভাউচার তৈরি করুন।
              </p>
            </div>
            <button
              onClick={() => setActiveTab('accounts')}
              className="text-xs text-slate-400 hover:text-white"
            >
              তালিকায় ফিরে যান
            </button>
          </div>

          {wdErrorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 mb-6 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{wdErrorMsg}</span>
            </div>
          )}

          {wdSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between gap-2 mb-6 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{wdSuccessMsg}</span>
              </div>
              {printableReceiptTx && (
                <button
                  type="button"
                  onClick={() => setPrintableReceiptTx(printableReceiptTx)}
                  className="px-3 py-1 rounded bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  ভাউচার প্রিন্ট
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                সঞ্চয় হিসাব নির্বাচন করুন *
              </label>
              <select
                value={wdAccountId}
                onChange={e => {
                  setWdAccountId(e.target.value);
                  const selected = savingsAccounts.find(a => a.id === e.target.value);
                  if (selected) {
                    setWdAmount(Math.min(selected.balance, 2000));
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">-- সঞ্চয় হিসাব নির্বাচন করুন --</option>
                {savingsAccounts
                  .filter(a => a.status === 'ACTIVE' && a.balance > 0)
                  .map(acc => {
                    const member = members.find(m => m.id === acc.memberId);
                    return (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountNo} - {member?.nameBn} ({member?.memberCode}) • স্থিতি: ৳{acc.balance.toLocaleString()}
                      </option>
                    );
                  })}
              </select>
            </div>

            {wdAccountId && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400">বর্তমান স্থিতি:</span>
                  <strong className="text-white ml-1.5 font-mono">
                    ৳{savingsAccounts.find(a => a.id === wdAccountId)?.balance.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">সর্বনিম্ন সংরক্ষণ আবশ্যক:</span>
                  <strong className="text-amber-400 ml-1.5 font-mono">
                    ৳{savingsPolicy.minimumBalanceRequired.toLocaleString()}
                  </strong>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                উত্তোলনের পরিমাণ (Withdrawal Amount in BDT ৳) *
              </label>
              <input
                type="number"
                value={wdAmount}
                onChange={e => setWdAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-base font-bold text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                required
                min="10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">পরিশোধের মাধ্যম (Payment Method)</label>
                <select
                  value={wdPaymentMethod}
                  onChange={e => setWdPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="CASH">ক্যাশ / নগদ (Office Cash)</option>
                  <option value="BANK">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">উত্তোলনের কারণ / মন্তব্য</label>
                <input
                  type="text"
                  value={wdNotes}
                  onChange={e => setWdNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition cursor-pointer"
              >
                উত্তোলন অনুমোদন করুন ও ডেবিট ভাউচার করুন →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SCHEME & POLICY CONFIGURATION */}
      {/* ============================================================== */}
      {activeTab === 'policies' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-7 max-w-4xl mx-auto">
          <div className="pb-4 border-b border-slate-800 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <span>সঞ্চয় ও ডিপিএস স্কিম নীতিমালা সেটিংস (Policy Configuration)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                সমিতির সাধারণ সঞ্চয় মুনাফা, ডিপিএস জরিমানা, গ্রেস পিরিয়ড ও এফডিআর স্ল্যাব রেট নির্ধারণ করুন।
              </p>
            </div>
          </div>

          {policySavedMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 mb-6 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>{policySavedMsg}</span>
            </div>
          )}

          <form onSubmit={handlePolicySubmit} className="space-y-6">
            
            {/* General Savings Policy */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-cyan-400" />
                <span>১. সাধারণ সঞ্চয় হিসাব নীতিমালা</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    বাৎসরিক সাধারণ সঞ্চয় মুনাফা (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyRate}
                    onChange={e => setPolicyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">বছরের শেষে সক্রিয় ব্যালান্সের ওপর প্রযোজ্য</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    হিসাবে সর্বনিম্ন বাধ্যতামূলক স্থিতি (Minimum Balance ৳)
                  </label>
                  <input
                    type="number"
                    value={policyMinReserve}
                    onChange={e => setPolicyMinReserve(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">উত্তোলনের সময় এই পরিমাণ টাকা রিজার্ভ থাকবে</span>
                </div>
              </div>
            </div>

            {/* DPS Policy */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>২. ডিপিএস (DPS) কিস্তি ও জরিমানা নীতিমালা</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    কিস্তি পরিশোধের গ্রেস পিরিয়ড (দিন)
                  </label>
                  <input
                    type="number"
                    value={policyDpsGrace}
                    onChange={e => setPolicyDpsGrace(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">মাসের ১০ তারিখের পর জরিমানা আরোপ</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    প্রতি বিলম্বিত কিস্তির জরিমানা (Late Fine ৳)
                  </label>
                  <input
                    type="number"
                    value={policyDpsFine}
                    onChange={e => setPolicyDpsFine(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">বিলম্বিত মাসের সাথে যুক্ত হবে</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    মেয়াদপূর্তির পূর্বে ক্লোজারে প্রফিট কর্তন (%)
                  </label>
                  <input
                    type="number"
                    value={policyEarlyDeduction}
                    onChange={e => setPolicyEarlyDeduction(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">স্বেচ্ছায় অকাল উত্তোলনে কর্তনযোগ্য মুনাফা</span>
                </div>
              </div>
            </div>

            {/* FDR Term Slabs */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>৩. স্থায়ী আমানত (FDR) মেয়াদভিত্তিক প্রফিট স্ল্যাব</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">৬ মাস মেয়াদ (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyFdr6}
                    onChange={e => setPolicyFdr6(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">১ বছর মেয়াদ (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyFdr12}
                    onChange={e => setPolicyFdr12(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">২ বছর মেয়াদ (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyFdr24}
                    onChange={e => setPolicyFdr24(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">৩ বছর মেয়াদ (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={policyFdr36}
                    onChange={e => setPolicyFdr36(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                সর্বশেষ আপডেট: {savingsPolicy.lastUpdatedAt} ({savingsPolicy.lastUpdatedBy})
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                নীতিমালা সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: PASSBOOK LEDGER STATEMENT */}
      {/* ============================================================== */}
      {selectedAccountForPassbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 flex items-center justify-center">
                  <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>ডিজিটাল সঞ্চয় পাসবই খতিয়ান</span>
                    <span className="font-mono text-cyan-400">({selectedAccountForPassbook.accountNo})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {members.find(m => m.id === selectedAccountForPassbook.memberId)?.nameBn} ({members.find(m => m.id === selectedAccountForPassbook.memberId)?.memberCode}) • {selectedAccountForPassbook.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="প্রিন্ট খতিয়ান"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedAccountForPassbook(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Passbook Info Summary Cards */}
            <div className="grid grid-cols-3 gap-3 my-4 shrink-0 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">মোট আমানত স্থিতি:</span>
                <strong className="text-emerald-400 text-base">{formatCurrency(selectedAccountForPassbook.balance, language)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">মুনাফা হার:</span>
                <strong className="text-cyan-400 text-base">{selectedAccountForPassbook.interestRate}% p.a.</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">শুরুর তারিখ:</span>
                <strong className="text-slate-200 text-base">{selectedAccountForPassbook.startDate}</strong>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 sticky top-0 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ ও রসিদ</th>
                    <th className="py-2.5 px-3">বিবরণ / লেনদেন</th>
                    <th className="py-2.5 px-3">মাধ্যম</th>
                    <th className="py-2.5 px-3 text-right">জমা (+)</th>
                    <th className="py-2.5 px-3 text-right">উত্তোলন (-)</th>
                    <th className="py-2.5 px-3 text-right">অবশিষ্ট ব্যালান্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {savingsTransactions
                    .filter(tx => tx.accountId === selectedAccountForPassbook.id || tx.memberId === selectedAccountForPassbook.memberId)
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <div className="text-slate-200 font-semibold">{tx.date}</div>
                          <div className="text-[10px] text-slate-500">{tx.receiptNo}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                            tx.type === 'DEPOSIT'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {tx.type === 'DEPOSIT' ? 'জমা' : 'উত্তোলন'}
                          </span>
                          <span className="text-slate-400 text-[11px]">{tx.notes}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                          {tx.type === 'DEPOSIT' ? formatCurrency(tx.amount, language) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400 font-bold">
                          {tx.type === 'WITHDRAWAL' ? formatCurrency(tx.amount, language) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-white font-bold">
                          {formatCurrency(tx.balanceAfter, language)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>সমিতিপ্রো ডিজিটাল পাসবই কোর ইঞ্জিন</span>
              <button
                onClick={() => setSelectedAccountForPassbook(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: PRINTABLE MONEY RECEIPT / VOUCHER */}
      {/* ============================================================== */}
      {printableReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>অফিশিয়াল মানি রসিদ (Official Money Receipt)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  onClick={() => setPrintableReceiptTx(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Card Body */}
            <div className="p-4 my-4 rounded-xl bg-white text-slate-950 space-y-4 shadow-inner">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  {activeTenant?.nameBn}
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">{activeTenant?.address}</p>
                <p className="text-[10px] text-slate-500">ফোন: {activeTenant?.phone} • রেজি নং: {activeTenant?.registrationNo}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-800 border border-slate-300">
                  {printableReceiptTx.type === 'DEPOSIT' ? 'সঞ্চয় / ডিপিএস জমা রসিদ' : 'সঞ্চয় উত্তোলন ডেবিট ভাউচার'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">রসিদ নং:</span>
                  <strong className="ml-1 font-mono">{printableReceiptTx.receiptNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500">তারিখ:</span>
                  <strong className="ml-1 font-mono">{printableReceiptTx.date}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">সদস্যের নাম:</span>
                  <strong className="text-slate-900">{members.find(m => m.id === printableReceiptTx.memberId)?.nameBn}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">সদস্য কোড:</span>
                  <strong className="font-mono text-slate-900">{members.find(m => m.id === printableReceiptTx.memberId)?.memberCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">হিসাব নম্বর:</span>
                  <strong className="font-mono text-slate-900">{savingsAccounts.find(a => a.id === printableReceiptTx.accountId)?.accountNo || 'GENERAL-SAVINGS'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">পেমেন্ট মেথড:</span>
                  <strong className="text-slate-900">{printableReceiptTx.paymentMethod}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">গৃহীত / উত্তোলিত টাকা:</span>
                <strong className="text-lg font-mono font-black text-emerald-800">
                  ৳{printableReceiptTx.amount.toLocaleString()}
                </strong>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600">লেনদেন পরবর্তী ব্যালান্স:</span>
                <strong className="font-mono text-slate-900">৳{printableReceiptTx.balanceAfter.toLocaleString()}</strong>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-t border-slate-400 w-28 mx-auto mb-1"></div>
                  <span>সদস্যের স্বাক্ষর</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-28 mx-auto mb-1"></div>
                  <span>আদায়কারী / কর্মকর্তা</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-500">
              কম্পিউটার জেনারেটেড রসিদ • সমিতিপ্রো ক্লাউড
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DPS / FDR SETTLEMENT & CLOSURE */}
      {/* ============================================================== */}
      {settlementAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>ডিপিএস / আমানত হিসাব চূড়ান্ত নিষ্পত্তি (Account Settlement)</span>
              </h3>
              <button
                onClick={() => setSettlementAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-white text-sm">{settlementAccount.title}</div>
                <div className="text-slate-400 font-mono mt-0.5">
                  হিসাব নং: {settlementAccount.accountNo} • সদস্য: {members.find(m => m.id === settlementAccount.memberId)?.nameBn}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] block">মোট জমাকৃত মূল টাকা:</span>
                  <strong className="text-white text-base">৳{settlementAccount.balance.toLocaleString()}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] block">প্রযোজ্য প্রফিট/মুনাফা:</span>
                  <strong className="text-cyan-400 text-base">
                    +৳{Math.round(settlementAccount.balance * (settlementAccount.interestRate / 100)).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold">সদস্যকে চূড়ান্ত প্রদেয় নিট টাকা:</span>
                  <strong className="text-lg font-mono font-extrabold text-amber-400">
                    ৳{Math.round(settlementAccount.balance * (1 + settlementAccount.interestRate / 100)).toLocaleString()}
                  </strong>
                </div>
                <p className="text-[10px] text-amber-400/80 mt-1">
                  * হিসাব নিষ্পত্তির সাথে সাথে এই অ্যাকাউন্টটি বন্ধ (CLOSED) হয়ে যাবে এবং স্বয়ংক্রিয় ডেবিট ভাউচার তৈরি হবে।
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSettlementAccount(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  const profit = Math.round(settlementAccount.balance * (settlementAccount.interestRate / 100));
                  const net = settlementAccount.balance + profit;
                  closeOrSettleSavingsAccount({
                    tenantId: activeTenant.id,
                    accountId: settlementAccount.id,
                    memberId: settlementAccount.memberId,
                    principalPaid: settlementAccount.balance,
                    accruedProfit: profit,
                    penaltyDeduction: 0,
                    netPayable: net,
                    paymentMethod: 'CASH',
                    reason: 'ডিপিএস / আমানতের সফল মেয়াদপূর্তি ও নিষ্পত্তি'
                  });

                  setSettlementAccount(null);
                  alert(`হিসাব ${settlementAccount.accountNo} সফলভাবে নিষ্পত্তি করা হয়েছে এবং ৳${net.toLocaleString()} পরিশোধ ভাউচার তৈরি হয়েছে!`);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                নিষ্পত্তি অনুমোদন করুন →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
