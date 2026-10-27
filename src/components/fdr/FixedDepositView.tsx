'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, Plus, Search, Filter, Printer, CheckCircle2, 
  AlertCircle, ArrowUpRight, TrendingUp, Calendar, User, 
  DollarSign, FileText, ChevronRight, X, Clock, ShieldCheck, 
  RefreshCw, Award, Lock, Sparkles, Percent, Eye
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  FixedDepositAccount, FDRTenureScheme, FDRProfitPayment, 
  PaymentMethod, FDRStatus 
} from '@/types';

export default function FixedDepositView() {
  const { 
    fdrAccounts, fdrSchemes, fdrProfitPayments, members, 
    letterhead, signatureSeal, openFDRAccount, disburseFDRProfit, 
    settleOrCloseFDR, createFDRScheme, updateFDRScheme, 
    language, activeTenant 
  } = useSamityStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<'accounts' | 'profits' | 'schemes'>('accounts');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FDRStatus>('ALL');
  const [schemeFilter, setSchemeFilter] = useState<string>('ALL');

  // Modal States
  const [isOpenFDRModalOpen, setIsOpenFDRModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [selectedFDRForAction, setSelectedFDRForAction] = useState<FixedDepositAccount | null>(null);
  const [certificateFDR, setCertificateFDR] = useState<FixedDepositAccount | null>(null);

  // New FDR Form State
  const [newMemberId, setNewMemberId] = useState('');
  const [newSchemeId, setNewSchemeId] = useState(fdrSchemes[0]?.id || '');
  const [newPrincipal, setNewPrincipal] = useState<number>(50000);
  const [newNomineeName, setNewNomineeName] = useState('');
  const [newNomineeRelation, setNewNomineeRelation] = useState('স্ত্রী');
  const [newNomineeNid, setNewNomineeNid] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('CASH');
  const [newAutoRenewal, setNewAutoRenewal] = useState(true);
  const [newNotes, setNewNotes] = useState('');

  // Profit Payout Form State
  const [profitAmount, setProfitAmount] = useState<number>(0);
  const [profitPeriodLabel, setProfitPeriodLabel] = useState('');
  const [profitDestination, setProfitDestination] = useState<'CREDIT_SAVINGS' | 'CASH_PAYOUT'>('CREDIT_SAVINGS');
  const [profitNotes, setProfitNotes] = useState('');

  // Close FDR Form State
  const [isPrematureClose, setIsPrematureClose] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState<number>(0);
  const [closeDestination, setCloseDestination] = useState<'CREDIT_SAVINGS' | 'CASH_PAYOUT'>('CREDIT_SAVINGS');
  const [closeRemarks, setCloseRemarks] = useState('');

  // New Scheme Form State
  const [schemeNameBn, setSchemeNameBn] = useState('');
  const [schemeNameEn, setSchemeNameEn] = useState('');
  const [schemeTenureMonths, setSchemeTenureMonths] = useState<number>(12);
  const [schemeRate, setSchemeRate] = useState<number>(11.5);
  const [schemeFrequency, setSchemeFrequency] = useState<'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'AT_MATURITY'>('MONTHLY');
  const [schemeIsDouble, setSchemeIsDouble] = useState(false);
  const [schemeMinDeposit, setSchemeMinDeposit] = useState<number>(20000);
  const [schemeMaxDeposit, setSchemeMaxDeposit] = useState<number>(5000000);
  const [schemePrematureRate, setSchemePrematureRate] = useState<number>(4.5);
  const [schemeDesc, setSchemeDesc] = useState('');

  // Selected Scheme for calculations
  const activeSelectedScheme = useMemo(() => {
    return fdrSchemes.find(s => s.id === newSchemeId) || fdrSchemes[0];
  }, [fdrSchemes, newSchemeId]);

  // Live simulation for New FDR
  const simulation = useMemo(() => {
    if (!activeSelectedScheme || !newPrincipal) return { profit: 0, maturity: 0, monthly: 0 };
    if (activeSelectedScheme.isDoubleScheme) {
      return {
        profit: newPrincipal,
        maturity: newPrincipal * 2,
        monthly: Math.round(newPrincipal / activeSelectedScheme.tenureMonths)
      };
    }
    const totalProfit = Math.round((newPrincipal * activeSelectedScheme.annualProfitRatePercent * (activeSelectedScheme.tenureMonths / 12)) / 100);
    const monthlyProfit = Math.round((newPrincipal * (activeSelectedScheme.annualProfitRatePercent / 100)) / 12);
    return {
      profit: totalProfit,
      maturity: newPrincipal + totalProfit,
      monthly: monthlyProfit
    };
  }, [activeSelectedScheme, newPrincipal]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return fdrAccounts.filter(acc => {
      const matchesSearch = 
        acc.memberNameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.fdrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.memberPhone.includes(searchQuery);

      const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
      const matchesScheme = schemeFilter === 'ALL' || acc.schemeId === schemeFilter;

      return matchesSearch && matchesStatus && matchesScheme;
    });
  }, [fdrAccounts, searchQuery, statusFilter, schemeFilter]);

  // Aggregate KPI Calculations
  const kpis = useMemo(() => {
    const activeAccs = fdrAccounts.filter(a => a.status === 'ACTIVE');
    const totalPrincipal = activeAccs.reduce((sum, a) => sum + a.principalAmount, 0);
    const totalProfitPaid = fdrAccounts.reduce((sum, a) => sum + a.totalProfitPaid, 0);
    const totalExpectedProfit = activeAccs.reduce((sum, a) => sum + a.totalExpectedProfit, 0);
    const doubleAccs = activeAccs.filter(a => a.isDoubleScheme);
    const doubleBalance = doubleAccs.reduce((sum, a) => sum + a.principalAmount, 0);
    
    // Profit due this month (approx estimation for active monthly accounts)
    const monthlyDue = activeAccs
      .filter(a => a.profitPayoutFrequency === 'MONTHLY')
      .reduce((sum, a) => sum + Math.round((a.principalAmount * (a.annualProfitRatePercent / 100)) / 12), 0);

    return {
      totalPrincipal,
      activeCount: activeAccs.length,
      totalProfitPaid,
      totalExpectedProfit,
      doubleCount: doubleAccs.length,
      doubleBalance,
      monthlyDue
    };
  }, [fdrAccounts]);

  // Handle open New FDR Modal
  const handleOpenNewFDRModal = () => {
    if (members.length > 0) {
      setNewMemberId(members[0].id);
      setNewNomineeName(members[0].nominee?.name || 'মোসা: রহিমা খাতুন');
      setNewNomineeRelation(members[0].nominee?.relation || 'স্ত্রী');
      setNewNomineeNid(members[0].nominee?.nidOrBirthCert || members[0].nid || '');
    }
    setIsOpenFDRModalOpen(true);
  };

  // Handle Member Selection Change in New FDR Modal
  const handleMemberSelect = (memId: string) => {
    setNewMemberId(memId);
    const mem = members.find(m => m.id === memId);
    if (mem) {
      setNewNomineeName(mem.nominee?.name || '');
      setNewNomineeRelation(mem.nominee?.relation || 'স্ত্রী');
      setNewNomineeNid(mem.nominee?.nidOrBirthCert || mem.nid || '');
    }
  };

  // Submit New FDR
  const handleSubmitOpenFDR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberId || !newSchemeId || newPrincipal <= 0) {
      alert('সদস্য, স্কিম ও সঠিক জমার পরিমাণ প্রদান করুন');
      return;
    }

    try {
      openFDRAccount({
        memberId: newMemberId,
        schemeId: newSchemeId,
        principalAmount: newPrincipal,
        nomineeNameBn: newNomineeName || 'নমিনি',
        nomineeRelation: newNomineeRelation || 'স্ত্রী',
        nomineeNidOrPhone: newNomineeNid || 'N/A',
        paymentMethod: newPaymentMethod,
        autoRenewal: newAutoRenewal,
        notes: newNotes
      });
      setIsOpenFDRModalOpen(false);
      alert('স্থায়ী আমানত (FDR) হিসাব সফলভাবে খোলা হয়েছে এবং ক্যাশ ভাউচার তৈরি করা হয়েছে।');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`এফডিআর খুলতে সমস্যা হয়েছে: ${errorMsg}`);
    }
  };

  // Open Profit Payout Modal
  const handleOpenProfitModal = (fdr: FixedDepositAccount) => {
    setSelectedFDRForAction(fdr);
    let defaultAmount = 0;
    if (fdr.profitPayoutFrequency === 'MONTHLY') {
      defaultAmount = Math.round((fdr.principalAmount * (fdr.annualProfitRatePercent / 100)) / 12);
    } else if (fdr.profitPayoutFrequency === 'QUARTERLY') {
      defaultAmount = Math.round((fdr.principalAmount * (fdr.annualProfitRatePercent / 100)) / 4);
    } else {
      defaultAmount = Math.max(0, fdr.totalExpectedProfit - fdr.totalProfitPaid);
    }
    setProfitAmount(defaultAmount);
    setProfitPeriodLabel(`চলতি কিস্তি মুনাফা (${new Date().toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })})`);
    setProfitDestination('CREDIT_SAVINGS');
    setProfitNotes('');
    setIsProfitModalOpen(true);
  };

  // Submit Profit Payout
  const handleSubmitProfit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFDRForAction || profitAmount <= 0) {
      alert('সঠিক মুনাফার অঙ্ক দিন');
      return;
    }

    try {
      disburseFDRProfit(selectedFDRForAction.id, {
        profitAmount,
        periodLabel: profitPeriodLabel || 'চলতি মুনাফা কিস্তি',
        payoutDestination: profitDestination,
        notes: profitNotes
      });
      setIsProfitModalOpen(false);
      alert(`৳${profitAmount.toLocaleString()} মুনাফা সফলভাবে প্রদান ও জাবেদা ভাউচার পোস্টিং সম্পন্ন হয়েছে।`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`মুনাফা প্রদানে ব্যর্থ: ${errorMsg}`);
    }
  };

  // Open Close FDR Modal
  const handleOpenCloseModal = (fdr: FixedDepositAccount) => {
    setSelectedFDRForAction(fdr);
    const today = new Date().toISOString().split('T')[0];
    const isPremature = today < fdr.maturityDate;
    setIsPrematureClose(isPremature);

    if (isPremature) {
      // Calculate premature penalty
      const scheme = fdrSchemes.find(s => s.id === fdr.schemeId);
      const reducedRate = scheme?.prematureProfitRatePercent || 4.0;
      const openDate = new Date(fdr.openingDate);
      const daysPassed = Math.max(1, Math.floor((new Date().getTime() - openDate.getTime()) / (1000 * 3600 * 24)));
      const monthsPassed = Math.max(1, daysPassed / 30);
      const allowableProfit = Math.round((fdr.principalAmount * (reducedRate / 100) * (monthsPassed / 12)));
      const unpaidAllowableProfit = Math.max(0, allowableProfit - fdr.totalProfitPaid);
      setSettlementAmount(fdr.principalAmount + unpaidAllowableProfit);
    } else {
      // Full maturity
      const unpaidProfit = Math.max(0, fdr.totalExpectedProfit - fdr.totalProfitPaid);
      setSettlementAmount(fdr.principalAmount + unpaidProfit);
    }

    setCloseDestination('CREDIT_SAVINGS');
    setCloseRemarks(isPremature ? 'গ্রাহকের বিশেষ প্রয়োজনে মেয়াদপূর্ব উত্তোলন' : 'পূর্ণ মেয়াদান্তে স্বাভাবিক হিসাব নিষ্পত্তি');
    setIsCloseModalOpen(true);
  };

  // Submit Close FDR
  const handleSubmitCloseFDR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFDRForAction || settlementAmount <= 0) {
      alert('সঠিক নিষ্পত্তি অঙ্ক দিন');
      return;
    }

    if (!confirm(`আপনি কি নিশ্চিত যে হিসাব ${selectedFDRForAction.fdrNumber} নিষ্পত্তি করে সর্বমোট ৳${settlementAmount.toLocaleString()} পরিশোধ করতে চান?`)) {
      return;
    }

    try {
      settleOrCloseFDR(selectedFDRForAction.id, {
        isPremature: isPrematureClose,
        settlementAmount,
        remarks: closeRemarks,
        payoutDestination: closeDestination
      });
      setIsCloseModalOpen(false);
      alert('স্থায়ী আমানত (FDR) হিসাব নিষ্পত্তি সম্পন্ন হয়েছে এবং ভাউচার তৈরি হয়েছে।');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`হিসাব নিষ্পত্তিতে সমস্যা: ${errorMsg}`);
    }
  };

  // Submit New Scheme
  const handleSubmitScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeNameBn || schemeTenureMonths <= 0 || schemeRate <= 0) {
      alert('স্কিমের নাম, মেয়াদ এবং মুনাফা হার সঠিক দিন');
      return;
    }

    try {
      createFDRScheme({
        nameBn: schemeNameBn,
        nameEn: schemeNameEn || schemeNameBn,
        tenureMonths: schemeTenureMonths,
        annualProfitRatePercent: schemeRate,
        profitPayoutFrequency: schemeFrequency,
        isDoubleScheme: schemeIsDouble,
        minDepositAmount: schemeMinDeposit,
        maxDepositAmount: schemeMaxDeposit,
        prematureProfitRatePercent: schemePrematureRate,
        status: 'ACTIVE',
        descriptionBn: schemeDesc || `${schemeTenureMonths} মাস মেয়াদী সঞ্চয় স্কিম`
      });
      setIsSchemeModalOpen(false);
      alert('নতুন মেয়াদী আমানত স্কিম সফলভাবে তৈরি হয়েছে।');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ত্রুটি ঘটেছে';
      alert(`স্কিম তৈরিতে ব্যর্থ: ${errorMsg}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-800/40 shadow-xl shadow-emerald-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              মডিউল ৫
            </span>
            <span className="text-xs text-slate-400 font-mono">
              FDR & Double Growth Term Deposits
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-emerald-400" />
            ফিক্সড ডিপোজিট (FDR) ও দ্বিগুণ বৃদ্ধি স্কিম
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            মেয়াদী আমানত হিসাব পরিচালনা, মাসিক/ত্রৈমাসিক মুনাফা বণ্টন, অফিসিয়াল কিউআর সনদ ও হিসাব নিষ্পত্তি
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSchemeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <Percent className="w-4 h-4 text-amber-400" />
            স্কিম পলিসি
          </button>
          <button
            onClick={handleOpenNewFDRModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            নতুন এফডিআর খুলুন
          </button>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total FDR Balance */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">মোট স্থায়ী আমানত স্থিতি</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
              ৳{kpis.totalPrincipal.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{kpis.activeCount} জন</span> সক্রিয় আমানতকারী
            </div>
          </div>
        </div>

        {/* Card 2: Expected Profit Liability */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">চলতি মাসে প্রদেয় মুনাফা</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-teal-300 tracking-tight">
              ৳{kpis.monthlyDue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              মাসিক স্কিমসমূহের সম্ভাব্য দায়
            </div>
          </div>
        </div>

        {/* Card 3: Double Growth Scheme Balance */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">দ্বিগুণ বৃদ্ধি স্কিম তহবিল</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
              ৳{kpis.doubleBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {kpis.doubleCount} টি দ্বিগুণ বৃদ্ধি অ্যাকাউন্ট
            </div>
          </div>
        </div>

        {/* Card 4: Total Profit Disbursed */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-900/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">সর্বমোট পরিশোধিত লভ্যাংশ</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-blue-400 tracking-tight">
              ৳{kpis.totalProfitPaid.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              সদস্য সঞ্চয় হিসেবে ও ক্যাশ প্রদান
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          স্থায়ী আমানত হিসাবসমূহ ({fdrAccounts.length})
        </button>

        <button
          onClick={() => setActiveTab('profits')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'profits'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          মুনাফা প্রদান রেজিস্টার ({fdrProfitPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'schemes'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Percent className="w-4 h-4" />
          মেয়াদী আমানত স্কিম পলিসি ({fdrSchemes.length})
        </button>
      </div>

      {/* TAB 1: ACCOUNTS LIST */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="সদস্যের নাম, কোড, হিসাব নং, সনদ নং দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'ALL' | FDRStatus)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">সব স্ট্যাটাস</option>
                <option value="ACTIVE">সক্রিয় (Active)</option>
                <option value="MATURED">মেয়াদোত্তীর্ণ (Matured)</option>
                <option value="SETTLED">নিষ্পত্তিকৃত (Settled)</option>
                <option value="CLOSED_PREMATURE">অকাল উত্তোলন (Closed)</option>
              </select>

              <select
                value={schemeFilter}
                onChange={e => setSchemeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">সকল স্কিম</option>
                {fdrSchemes.map(sch => (
                  <option key={sch.id} value={sch.id}>{sch.nameBn}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">এফডিআর ও সনদ নং</th>
                    <th className="py-3.5 px-4">গ্রাহক সদস্য</th>
                    <th className="py-3.5 px-4">স্কিম ও মেয়াদ</th>
                    <th className="py-3.5 px-4 text-right">মূল আমানত (৳)</th>
                    <th className="py-3.5 px-4 text-center">মুনাফা হার</th>
                    <th className="py-3.5 px-4 text-right">প্রদত্ত মুনাফা</th>
                    <th className="py-3.5 px-4">মেয়াদপূর্তি</th>
                    <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        কোনো স্থায়ী আমানত (FDR) হিসাব পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map(acc => {
                      const isDouble = acc.isDoubleScheme;
                      return (
                        <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-200 flex items-center gap-1.5">
                              {acc.fdrNumber}
                              {isDouble && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  ২x দ্বিগুণ
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-400/90">
                              {acc.certificateNo}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-100">{acc.memberNameBn}</div>
                            <div className="text-[11px] text-slate-400">{acc.memberCode} • {acc.memberPhone}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-medium">{acc.schemeNameBn}</div>
                            <div className="text-[11px] text-slate-400">
                              মেয়াদ: {acc.tenureMonths} মাস
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-emerald-400">
                              ৳{acc.principalAmount.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              সম্ভাব্য: ৳{acc.maturityAmount.toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="font-semibold text-slate-200">
                              {acc.annualProfitRatePercent}%
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {acc.profitPayoutFrequency === 'MONTHLY' ? 'মাসিক' :
                               acc.profitPayoutFrequency === 'QUARTERLY' ? 'ত্রৈমাসিক' :
                               acc.profitPayoutFrequency === 'HALF_YEARLY' ? 'ষাণ্মাসিক' : 'মেয়াদান্তে'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="font-semibold text-blue-400">
                              ৳{acc.totalProfitPaid.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              বাকি: ৳{Math.max(0, acc.totalExpectedProfit - acc.totalProfitPaid).toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-xs">
                            <div className="text-slate-300 font-mono">{acc.maturityDate}</div>
                            <div className="text-[10px] text-slate-500">
                              খোলা: {acc.openingDate}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              acc.status === 'ACTIVE' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : acc.status === 'MATURED'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-slate-700/50 text-slate-400 border border-slate-700'
                            }`}>
                              {acc.status === 'ACTIVE' ? 'সক্রিয়' :
                               acc.status === 'MATURED' ? 'মেয়াদোত্তীর্ণ' :
                               acc.status === 'SETTLED' ? 'নিষ্পত্তিকৃত' : 'অকাল উত্তোলন'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {acc.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleOpenProfitModal(acc)}
                                  title="মুনাফা প্রদান"
                                  className="px-2 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  মুনাফা
                                </button>
                              )}

                              <button
                                onClick={() => setCertificateFDR(acc)}
                                title="সনদপত্র প্রিন্ট"
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                সনদ
                              </button>

                              {acc.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleOpenCloseModal(acc)}
                                  title="হিসাব সমাপ্তি / ভাঙা"
                                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                                >
                                  নিষ্পত্তি
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

      {/* TAB 2: PROFIT PAYOUT HISTORY */}
      {activeTab === 'profits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              এফডিআর মুনাফা বণ্টন ও পেমেন্ট হিস্ট্রি
            </h2>
            <div className="text-xs text-slate-400">
              সর্বমোট {fdrProfitPayments.length} টি পেমেন্ট রেকর্ড
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">এফডিআর হিসাব নং</th>
                    <th className="py-3 px-4">গ্রাহকের নাম</th>
                    <th className="py-3 px-4">কিস্তি / সময়কাল</th>
                    <th className="py-3 px-4 text-right">মুনাফার পরিমাণ (৳)</th>
                    <th className="py-3 px-4 text-center">পরিশোধ মাধ্যম</th>
                    <th className="py-3 px-4">ভাউচার নং</th>
                    <th className="py-3 px-4">মন্তব্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fdrProfitPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        কোনো মুনাফা প্রদানের রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    fdrProfitPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-slate-300">{p.paymentDate}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{p.fdrNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-100">{p.memberNameBn}</td>
                        <td className="py-3 px-4 text-slate-300">{p.periodLabel}</td>
                        <td className="py-3 px-4 text-right font-bold text-teal-300">
                          ৳{p.profitAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.payoutDestination === 'CREDIT_SAVINGS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {p.payoutDestination === 'CREDIT_SAVINGS' ? 'সঞ্চয় ক্রেডিট' : 'ক্যাশ উত্তোলন'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.voucherNo}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs truncate max-w-xs">{p.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEMES CONFIGURATION */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-200">মেয়াদী আমানত স্কিম ও পলিসি তালিকা</h2>
              <p className="text-xs text-slate-400">সমিতির অনুমোদিত ফিক্সড ডিপোজিট ও দ্বিগুণ বৃদ্ধি স্কিমসমূহ</p>
            </div>
            <button
              onClick={() => setIsSchemeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              নতুন স্কিম যোগ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fdrSchemes.map(sch => (
              <div 
                key={sch.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                      {sch.tenureMonths} মাস
                    </span>
                    {sch.isDoubleScheme && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        দ্বিগুণ বৃদ্ধি
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100">{sch.nameBn}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sch.descriptionBn}</p>

                  <div className="my-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">বার্ষিক মুনাফা হার:</span>
                      <span className="font-bold text-emerald-400">{sch.annualProfitRatePercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">লভ্যাংশ প্রদান:</span>
                      <span className="font-semibold text-slate-200">
                        {sch.profitPayoutFrequency === 'MONTHLY' ? 'প্রতি মাসে' :
                         sch.profitPayoutFrequency === 'QUARTERLY' ? 'ত্রৈমাসিক' :
                         sch.profitPayoutFrequency === 'HALF_YEARLY' ? 'ষাণ্মাসিক' : 'মেয়াদান্তে'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">সর্বনিম্ন জমা:</span>
                      <span className="font-mono text-slate-300">৳{sch.minDepositAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">মেয়াদপূর্ব উত্তোলনে:</span>
                      <span className="font-semibold text-amber-400">{sch.prematureProfitRatePercent}% মুনাফা</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold">● সক্রিয় স্কিম</span>
                  <button
                    onClick={() => {
                      setNewSchemeId(sch.id);
                      handleOpenNewFDRModal();
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    হিসাব খুলুন <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: OPEN NEW FDR */}
      {isOpenFDRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-emerald-900/60 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  নতুন ফিক্সড ডিপোজিট (FDR) হিসাব উদ্বোধনের আবেদন
                </h3>
                <p className="text-xs text-slate-400">নিয়মিত বা দ্বিগুণ বৃদ্ধি স্কিমে স্থায়ী আমানত ও সনদপত্র জারি</p>
              </div>
              <button onClick={() => setIsOpenFDRModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOpenFDR} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Member Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    গ্রাহক সদস্য নির্বাচন করুন *
                  </label>
                  <select
                    value={newMemberId}
                    onChange={e => handleMemberSelect(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nameBn} ({m.memberCode}) • {m.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheme Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    আমানত স্কিম নির্বাচন *
                  </label>
                  <select
                    value={newSchemeId}
                    onChange={e => setNewSchemeId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {fdrSchemes.map(sch => (
                      <option key={sch.id} value={sch.id}>
                        {sch.nameBn} ({sch.annualProfitRatePercent}% - {sch.tenureMonths} মাস)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Principal Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    মূল আমানতের পরিমাণ (Principal ৳) *
                  </label>
                  <input
                    type="number"
                    min={activeSelectedScheme?.minDepositAmount || 10000}
                    max={activeSelectedScheme?.maxDepositAmount || 10000000}
                    step={1000}
                    value={newPrincipal}
                    onChange={e => setNewPrincipal(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    সর্বনিম্ন: ৳{activeSelectedScheme?.minDepositAmount.toLocaleString()} • সর্বোচ্চ: ৳{activeSelectedScheme?.maxDepositAmount.toLocaleString()}
                  </span>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    জমা গ্রহণের মাধ্যম *
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={e => setNewPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CASH">ক্যাশ / হাতে নগদ (১০১০)</option>
                    <option value="BANK">ব্যাংক ডিপোজিট / চেক (১০২০)</option>
                    <option value="BKASH">বিকাশ (bKash Wallet)</option>
                    <option value="NAGAD">নগদ (Nagad Wallet)</option>
                  </select>
                </div>
              </div>

              {/* Simulation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 border-b border-emerald-900/60 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> লাভ ও প্রবৃদ্ধি সিমুলেশন সামারি
                  </span>
                  <span>{activeSelectedScheme?.nameBn}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">মেয়াদকাল</div>
                    <div className="font-bold text-slate-200 mt-0.5">{activeSelectedScheme?.tenureMonths} মাস</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">প্রত্যাশিত মোট মুনাফা</div>
                    <div className="font-bold text-teal-400 mt-0.5">৳{simulation.profit.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">মেয়াদান্তে সর্বমোট প্রদেয়</div>
                    <div className="font-bold text-emerald-400 mt-0.5">৳{simulation.maturity.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Nominee Details */}
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">নমিনি সংক্রান্ত তথ্য</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">নমিনির নাম *</label>
                    <input
                      type="text"
                      value={newNomineeName}
                      onChange={e => setNewNomineeName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">সম্পর্ক *</label>
                    <input
                      type="text"
                      value={newNomineeRelation}
                      onChange={e => setNewNomineeRelation(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">এনআইডি বা মোবাইল নং</label>
                    <input
                      type="text"
                      value={newNomineeNid}
                      onChange={e => setNewNomineeNid(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Renewal & Notes */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAutoRenewal}
                    onChange={e => setNewAutoRenewal(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 focus:outline-none bg-slate-950 border-slate-700"
                  />
                  <span>মেয়াদপূর্তিতে স্বয়ংক্রিয় নবায়ন (Auto Renewal) কার্যকর করুন</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenFDRModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                >
                  অনুমোদন ও হিসাব নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROFIT PAYOUT MODAL */}
      {isProfitModalOpen && selectedFDRForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-teal-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  এফডিআর কিস্তির মুনাফা প্রদান
                </h3>
                <p className="text-xs text-slate-400">হিসাব নং: {selectedFDRForAction.fdrNumber} • {selectedFDRForAction.memberNameBn}</p>
              </div>
              <button onClick={() => setIsProfitModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProfit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">মূল আমানত:</span>
                  <span className="font-bold text-slate-200">৳{selectedFDRForAction.principalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">মুনাফার হার:</span>
                  <span className="font-semibold text-teal-400">{selectedFDRForAction.annualProfitRatePercent}% ({selectedFDRForAction.profitPayoutFrequency})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ইতিপূর্বে পরিশোধিত মুনাফা:</span>
                  <span className="font-semibold text-blue-400">৳{selectedFDRForAction.totalProfitPaid.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  প্রদেয় মুনাফার পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={profitAmount}
                  onChange={e => setProfitAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-teal-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সময়কাল / কিস্তি বিবরণ *
                </label>
                <input
                  type="text"
                  value={profitPeriodLabel}
                  onChange={e => setProfitPeriodLabel(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  পেমেন্ট পদ্ধতি / গন্তব্য *
                </label>
                <select
                  value={profitDestination}
                  onChange={e => setProfitDestination(e.target.value as 'CREDIT_SAVINGS' | 'CASH_PAYOUT')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                >
                  <option value="CREDIT_SAVINGS">সদস্যের সাধারণ সঞ্চয় হিসাবে জমা (২০১০)</option>
                  <option value="CASH_PAYOUT">ক্যাশ কাউন্টার থেকে নগদ উত্তোলন (১০১০)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={profitNotes}
                  onChange={e => setProfitNotes(e.target.value)}
                  placeholder="রেফারেন্স বা বিশেষ নির্দেশনা..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  মুনাফা ভাউচার ও পেমেন্ট কার্যকর করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CLOSE / SETTLE FDR */}
      {isCloseModalOpen && selectedFDRForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  স্থায়ী আমানত (FDR) সমাপ্তি ও নিষ্পত্তি
                </h3>
                <p className="text-xs text-slate-400">হিসাব নং: {selectedFDRForAction.fdrNumber}</p>
              </div>
              <button onClick={() => setIsCloseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCloseFDR} className="space-y-4">
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isPrematureClose 
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {isPrematureClose ? '⚠️ মেয়াদপূর্ব অকাল উত্তোলন (Premature Encashment)' : '✅ পূর্ণ মেয়াদান্তে সমাপ্তি (Matured Settlement)'}
                </div>
                <div className="text-[11px] text-slate-300">
                  মেয়াদপূর্তির তারিখ: {selectedFDRForAction.maturityDate} • মূল আসল: ৳{selectedFDRForAction.principalAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সর্বমোট নিষ্পত্তি পরিশোধ অঙ্ক (Principal + Profit - Penalty ৳) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={settlementAmount}
                  onChange={e => setSettlementAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-black text-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">পরিশোধের মাধ্যম *</label>
                <select
                  value={closeDestination}
                  onChange={e => setCloseDestination(e.target.value as 'CREDIT_SAVINGS' | 'CASH_PAYOUT')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                >
                  <option value="CREDIT_SAVINGS">সদস্যের সাধারণ সঞ্চয় হিসাবে জমা (২০১০)</option>
                  <option value="CASH_PAYOUT">ক্যাশ কাউন্টার থেকে নগদ প্রদান (১০১০)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">নিষ্পত্তির কারণ / রিমার্কস</label>
                <input
                  type="text"
                  value={closeRemarks}
                  onChange={e => setCloseRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  হিসাব সমাপ্তি ও ভাউচার পোস্টিং
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW SCHEME POLICY */}
      {isSchemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                নতুন মেয়াদী আমানত স্কিম কনফিগারেশন
              </h3>
              <button onClick={() => setIsSchemeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitScheme} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">স্কিমের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={schemeNameBn}
                  onChange={e => setSchemeNameBn(e.target.value)}
                  placeholder="যেমন: ২ বছর মেয়াদী প্রবৃদ্ধি স্কিম"
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">মেয়াদকাল (মাস) *</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={schemeTenureMonths}
                    onChange={e => setSchemeTenureMonths(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">বার্ষিক মুনাফা হার (%) *</label>
                  <input
                    type="number"
                    step={0.1}
                    min={1}
                    max={30}
                    value={schemeRate}
                    onChange={e => setSchemeRate(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">মুনাফা প্রদান ফ্রিকোয়েন্সি</label>
                  <select
                    value={schemeFrequency}
                    onChange={e => setSchemeFrequency(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="MONTHLY">মাসিক (Monthly)</option>
                    <option value="QUARTERLY">ত্রৈমাসিক (Quarterly)</option>
                    <option value="HALF_YEARLY">ষাণ্মাসিক (Half Yearly)</option>
                    <option value="AT_MATURITY">মেয়াদান্তে (At Maturity)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">অকাল উত্তোলনে মুনাফা হার (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={schemePrematureRate}
                    onChange={e => setSchemePrematureRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="doubleCheck"
                  checked={schemeIsDouble}
                  onChange={e => setSchemeIsDouble(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700"
                />
                <label htmlFor="doubleCheck" className="text-xs text-amber-300 font-semibold cursor-pointer">
                  এটি দ্বিগুণ বৃদ্ধি স্কিম (Double Scheme - মেয়াদে ১০০% লাভ)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSchemeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  স্কিম সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE FDR CERTIFICATE MODAL */}
      {certificateFDR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 print:shadow-none print:m-0 print:rounded-none">
            
            {/* Modal Control Toolbar (hidden on print) */}
            <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">স্থায়ী আমানত (FDR) অফিসিয়াল সনদপত্র ভিউয়ার</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট করুন (A4)
                </button>
                <button
                  onClick={() => setCertificateFDR(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Paper Sheet (Double Golden Border) */}
            <div className="p-8 sm:p-12 relative bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30">
              
              {/* Outer Golden Border */}
              <div className="border-4 border-amber-600/80 p-3 rounded-2xl shadow-inner">
                {/* Inner Ornamental Border */}
                <div className="border-2 border-dashed border-emerald-800/60 p-6 sm:p-8 rounded-xl relative space-y-6">
                  
                  {/* Watermark Seal Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                    <Building2 className="w-96 h-96 text-emerald-950" />
                  </div>

                  {/* Header Letterhead */}
                  <div className="text-center space-y-1 relative z-10 border-b border-amber-900/20 pb-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                      {letterhead?.samityNameBn || activeTenant?.nameBn || 'একতা বহুমুখী সমবায় সমিতি লিমিটেড'}
                    </h1>
                    <p className="text-xs text-slate-700">
                      নিবন্ধন নং: {activeTenant?.registrationNo || 'REG-DHAKA-2018-9842'} • স্থাপিত: {activeTenant?.establishedYear || 2018}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {letterhead?.addressBn || activeTenant?.address || 'বনশ্রী, ঢাকা-১২১৯'} | ফোন: {activeTenant?.mobileNumber || '০১৭xxxxxxxx'}
                    </p>
                    <div className="pt-2">
                      <span className="inline-block px-6 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-md">
                        স্থায়ী আমানত (FDR) সনদপত্র
                      </span>
                    </div>
                  </div>

                  {/* Certificate Top Metadata */}
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-800 relative z-10">
                    <div>
                      সনদপত্র নং: <span className="font-mono text-emerald-900 font-bold">{certificateFDR.certificateNo}</span>
                    </div>
                    <div>
                      এফডিআর হিসাব নং: <span className="font-mono text-emerald-900 font-bold">{certificateFDR.fdrNumber}</span>
                    </div>
                    <div>
                      উদ্বোধনের তারিখ: <span className="font-mono">{certificateFDR.openingDate}</span>
                    </div>
                  </div>

                  {/* Legal Certificate Body */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4 relative z-10 text-justify">
                    <p>
                      প্রত্যয়ন করা যাইতেছে যে, অত্র সমিতির নিবন্ধিত সম্মানিত সদস্য জনাব/বেগম <strong className="text-emerald-950 font-bold text-sm underline underline-offset-4">{certificateFDR.memberNameBn}</strong> (সদস্য কোড: <strong className="font-mono">{certificateFDR.memberCode}</strong>, মোবাইল: <strong className="font-mono">{certificateFDR.memberPhone}</strong>), অত্র সমিতিতে <strong className="text-emerald-900 font-bold">{certificateFDR.schemeNameBn}</strong>-এর অধীনে এককালীন মূল আমানত হিসেবে সর্বমোট <strong className="text-emerald-950 font-black text-sm">৳{certificateFDR.principalAmount.toLocaleString()}</strong> জমা প্রদান করিয়াছেন।
                    </p>

                    {/* Deposit Parameters Table */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden text-xs my-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 bg-amber-100/60 font-semibold border-b border-slate-300 p-2.5 text-slate-800">
                        <div>মেয়াদকাল</div>
                        <div>বার্ষিক মুনাফা হার</div>
                        <div>মুনাফা বণ্টনের পদ্ধতি</div>
                        <div>মেয়াদপূর্তির তারিখ</div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 p-2.5 bg-white text-slate-900 font-medium">
                        <div>{certificateFDR.tenureMonths} মাস</div>
                        <div className="text-emerald-800 font-bold">{certificateFDR.annualProfitRatePercent}%</div>
                        <div>
                          {certificateFDR.profitPayoutFrequency === 'MONTHLY' ? 'নিয়মিত মাসিক' :
                           certificateFDR.profitPayoutFrequency === 'QUARTERLY' ? 'ত্রৈমাসিক' :
                           certificateFDR.profitPayoutFrequency === 'HALF_YEARLY' ? 'ষাণ্মাসিক' : 'মেয়াদান্তে এককালীন'}
                        </div>
                        <div className="font-mono font-bold">{certificateFDR.maturityDate}</div>
                      </div>
                    </div>

                    <p>
                      {certificateFDR.isDoubleScheme ? (
                        <span>
                          উক্ত আমানত <strong>দ্বিগুণ বৃদ্ধি স্কিম</strong> বিধায় মেয়াদপূর্তিতে আমানতকারী অথবা তাঁহার অবর্তমানে মনোনীত নমিনি সর্বমোট মূল আমানতের দ্বিগুণ অর্থাৎ <strong className="font-bold text-emerald-950">৳{certificateFDR.maturityAmount.toLocaleString()}</strong> প্রাপ্য হইবেন।
                        </span>
                      ) : (
                        <span>
                          মেয়াদকালান্তে প্রদেয় সর্বমোট সম্ভাব্য লভ্যাংশের পরিমাণ <strong className="font-bold text-emerald-950">৳{certificateFDR.totalExpectedProfit.toLocaleString()}</strong> এবং আসলসহ সর্বমোট সম্ভাব্য অঙ্ক <strong className="font-bold text-emerald-950">৳{certificateFDR.maturityAmount.toLocaleString()}</strong> নির্ধারিত হইল।
                        </span>
                      )}
                    </p>

                    {/* Nominee Declaration */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-bold text-slate-900">মনোনীত নমিনির বিবরণ: </span>
                      নাম: <strong>{certificateFDR.nomineeNameBn}</strong> | সম্পর্ক: <strong>{certificateFDR.nomineeRelation}</strong> | এনআইডি/মোবাইল: <strong className="font-mono">{certificateFDR.nomineeNidOrPhone}</strong>
                    </div>
                  </div>

                  {/* QR Code and Signatures Footer */}
                  <div className="pt-8 border-t border-slate-200 flex items-end justify-between relative z-10">
                    
                    {/* QR Code for instant mobile authenticity check */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-16 bg-slate-900 p-1 rounded-lg flex items-center justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`SAMITYPRO-FDR:${certificateFDR.fdrNumber}:${certificateFDR.certificateNo}:MEMBER:${certificateFDR.memberCode}:BDT:${certificateFDR.principalAmount}:MATURITY:${certificateFDR.maturityDate}`)}`} 
                          alt="FDR Verification QR" 
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 max-w-[130px]">
                        স্ক্যান করে ডিজিটাল সত্যতা যাচাই করুন। সমবায় আইনসম্মত দলিল।
                      </div>
                    </div>

                    {/* Manager Signature */}
                    <div className="text-center">
                      <div className="h-10 flex items-end justify-center font-serif italic text-emerald-900 text-sm">
                        {signatureSeal?.cashierName || 'সুমাইয়া আক্তার'}
                      </div>
                      <div className="border-t border-slate-800 pt-1 text-xs font-bold text-slate-800">
                        হিসাবরক্ষক / ব্যবস্থাপক
                      </div>
                      <div className="text-[10px] text-slate-500">সমিতি পরিচালনা কার্যালয়</div>
                    </div>

                    {/* Official Seal */}
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-700/70 flex items-center justify-center text-center p-1 text-[9px] font-bold text-red-800 uppercase transform -rotate-12">
                      অফিসিয়াল সিলমোহর<br/>{activeTenant?.nameBn?.slice(0, 15)}...
                    </div>

                    {/* President Signature */}
                    <div className="text-center">
                      <div className="h-10 flex items-end justify-center font-serif italic text-emerald-900 text-sm">
                        {signatureSeal?.presidentName || 'আলহাজ্ব রফিকুল ইসলাম'}
                      </div>
                      <div className="border-t border-slate-800 pt-1 text-xs font-bold text-slate-800">
                        সভাপতি / সেক্রেটারি
                      </div>
                      <div className="text-[10px] text-slate-500">কার্যনির্বাহী পরিষদ</div>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
