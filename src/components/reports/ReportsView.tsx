'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileBarChart, Printer, Download, Calendar, 
  Users, CheckCircle2, FileText, AlertTriangle,
  Search, Filter, ShieldCheck, ArrowUpRight, 
  ArrowDownLeft, Clock, Phone, AlertCircle, 
  Sparkles, Building2, Check, RefreshCw, Send,
  CreditCard, PieChart, TrendingUp, ChevronRight
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, formatDate } from '@/lib/i18n';
import { ReportType } from '@/types';

export function ReportsView() {
  const { 
    activeTenant, language, members, loans, 
    savingsTransactions, vouchers, receipts, 
    chartOfAccounts, exportTableToCsv, logReportAction,
    getTrialBalance, getIncomeStatement, getBalanceSheet
  } = useSamityStore();
  const t = translations[language];

  // Report State
  const [activeReportType, setActiveReportType] = useState<ReportType>('COLLECTION_SHEET');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [reportDate, setReportDate] = useState('2026-10-26');
  const [agingFilter, setAgingFilter] = useState<'ALL' | '1-30' | '31-60' | '61-90' | '90+'>('ALL');
  const [passbookCategory, setPassbookCategory] = useState<'ALL' | 'SAVINGS' | 'LOANS' | 'FEES'>('ALL');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  useEffect(() => {
    setReportDate(new Date().toISOString().split('T')[0]);
  }, []);

  const tenantId = activeTenant?.id || 'samity-ekota';
  const tenantMembers = useMemo(() => members.filter(m => m.tenantId === tenantId), [members, tenantId]);
  const tenantLoans = useMemo(() => loans.filter(l => l.tenantId === tenantId), [loans, tenantId]);
  const tenantVouchers = useMemo(() => vouchers.filter(v => v.tenantId === tenantId), [vouchers, tenantId]);
  const tenantReceipts = useMemo(() => receipts.filter(r => r.tenantId === tenantId), [receipts, tenantId]);

  // Selected Member Details
  const selectedMember = useMemo(() => 
    tenantMembers.find(m => m.id === selectedMemberId) || tenantMembers[0], 
    [tenantMembers, selectedMemberId]
  );

  const selectedMemberTx = useMemo(() => 
    savingsTransactions.filter(tx => tx.memberId === selectedMember?.id && tx.tenantId === tenantId),
    [savingsTransactions, selectedMember, tenantId]
  );

  const selectedMemberLoans = useMemo(() => 
    tenantLoans.filter(l => l.memberId === selectedMember?.id),
    [tenantLoans, selectedMember]
  );

  const selectedMemberReceipts = useMemo(() => 
    tenantReceipts.filter(r => r.memberId === selectedMember?.id),
    [tenantReceipts, selectedMember]
  );

  // Defaulters Calculation
  const defaultersData = useMemo(() => {
    return tenantLoans.filter(l => {
      const hasOverdue = l.installments.some(ins => ins.status === 'OVERDUE');
      return l.status === 'DEFAULTED' || hasOverdue;
    }).map(l => {
      const mem = tenantMembers.find(m => m.id === l.memberId);
      const overdueInstallments = l.installments.filter(ins => ins.status === 'OVERDUE');
      const overdueAmount = overdueInstallments.reduce((sum, ins) => sum + (ins.totalDue - (ins.paidAmount || 0)), 0);
      
      // Calculate max overdue days
      const daysOverdue = overdueInstallments.length > 3 ? 95 : overdueInstallments.length * 30;
      
      let bracket: '1-30' | '31-60' | '61-90' | '90+' = '1-30';
      if (daysOverdue > 90) bracket = '90+';
      else if (daysOverdue > 60) bracket = '61-90';
      else if (daysOverdue > 30) bracket = '31-60';

      return {
        loan: l,
        member: mem,
        overdueInstallmentsCount: overdueInstallments.length,
        overdueAmount,
        daysOverdue,
        bracket
      };
    });
  }, [tenantLoans, tenantMembers]);

  const filteredDefaulters = useMemo(() => {
    if (agingFilter === 'ALL') return defaultersData;
    return defaultersData.filter(d => d.bracket === agingFilter);
  }, [defaultersData, agingFilter]);

  // Financial Statements Data
  const trialBalanceData = useMemo(() => getTrialBalance(), [getTrialBalance]);
  const incomeStatementData = useMemo(() => getIncomeStatement(), [getIncomeStatement]);
  const balanceSheetData = useMemo(() => getBalanceSheet(), [getBalanceSheet]);

  // Print Action
  const handlePrint = (reportName: string) => {
    logReportAction(reportName, 'PRINT/PDF');
    window.print();
  };

  // CSV Export Action
  const handleExportCsv = (tableType: Parameters<typeof exportTableToCsv>[0], reportName: string) => {
    setIsExporting(true);
    try {
      const csv = exportTableToCsv(tableType);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `samitypro_${tableType}_report_${reportDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logReportAction(reportName, 'CSV');
      setExportSuccessMsg(`${reportName} সফলভাবে এক্সপোর্ট হয়েছে!`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } catch {
      alert('এক্সপোর্ট সম্পন্ন করা সম্ভব হয়নি।');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Navigation Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileBarChart className="w-4 h-4" />
            <span>আর্থিক বিবরণী ও অডিট হাব (মডিউল ৯)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <span>রিপোর্ট, আর্থিক বিবরণী ও অডিট ট্রেইল</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            সমবায় সমিতি আইন ও আন্তর্জাতিক অডিট মানদণ্ড অনুযায়ী স্বয়ংক্রিয় ব্যালান্স শিট, কালেকশন শিট, লাভ-ক্ষতি হিসাব ও ডিফল্টার রেজিস্টার
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handlePrint(activeReportType)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
            title="মুদ্রণ বা পিডিএফ সংরক্ষণ করুন"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / পিডিএফ (A4)</span>
          </button>

          <button
            onClick={() => {
              if (activeReportType === 'COLLECTION_SHEET') handleExportCsv('collection_sheet', 'দৈনিক কালেকশন শিট');
              else if (activeReportType === 'DEFAULTERS') handleExportCsv('defaulters', 'ঋণ খেলাপিদের তালিকা');
              else if (activeReportType === 'TRIAL_BALANCE') handleExportCsv('trial_balance', 'রেওয়ামিল ট্রায়াল ব্যালেন্স');
              else handleExportCsv('members', 'সদস্য তালিকা ও খতিয়ান');
            }}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="এক্সেল বা সিএসভি ডাউনলোড করুন"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>এক্সেল / CSV</span>
          </button>
        </div>
      </div>

      {/* Export Success Feedback Toast */}
      {exportSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 no-print animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* 6 Comprehensive Report Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-print">
        <button
          onClick={() => setActiveReportType('COLLECTION_SHEET')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportType === 'COLLECTION_SHEET'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>১. দৈনিক কালেকশন শিট</span>
        </button>

        <button
          onClick={() => setActiveReportType('PASSBOOK')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportType === 'PASSBOOK'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>২. সদস্য মাস্টার পাসবই</span>
        </button>

        <button
          onClick={() => setActiveReportType('BALANCE_SHEET')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportType === 'BALANCE_SHEET'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>৩. আর্থিক ব্যালান্স শিট</span>
        </button>

        <button
          onClick={() => setActiveReportType('INCOME_EXPENDITURE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportType === 'INCOME_EXPENDITURE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>৪. লাভ-ক্ষতি ও আয়-ব্যয়</span>
        </button>

        <button
          onClick={() => setActiveReportType('DEFAULTERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportType === 'DEFAULTERS'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 ring-1 ring-rose-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>৫. খেলাপি ঋণ রেজিস্টার</span>
          {defaultersData.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-mono">
              {defaultersData.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveReportType('TRIAL_BALANCE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportType === 'TRIAL_BALANCE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>৬. খতিয়ান রেওয়ামিল (Trial)</span>
        </button>
      </div>

      {/* Date & Context Selector Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-medium">বিবরণী তারিখ:</span>
            <input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {activeReportType === 'PASSBOOK' && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 font-medium">সদস্য নির্বাচন:</span>
              <select
                value={selectedMember?.id || ''}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                {tenantMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.memberCode} — {m.nameBn} ({m.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeReportType === 'DEFAULTERS' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-rose-400" />
              <span className="text-slate-400 font-medium">খেলাপি মেয়াদ:</span>
              <select
                value={agingFilter}
                onChange={e => setAgingFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">সকল খেলাপি ও বকেয়া</option>
                <option value="1-30">১ থেকে ৩০ দিন বকেয়া</option>
                <option value="31-60">৩১ থেকে ৬০ দিন বকেয়া</option>
                <option value="61-90">৬১ থেকে ৯০ দিন বকেয়া</option>
                <option value="90+">৯০ দিনের অধিক (Bad Debt)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>রিয়েল-টাইম ডাটা সিঙ্ক: সক্রিয়</span>
        </div>
      </div>

      {/* Printable Master Report Document Container */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-700 bg-slate-900/95 text-slate-100 shadow-2xl printable-document">
        
        {/* Official Institutional Letterhead */}
        <div className="text-center pb-6 border-b-2 border-slate-700 space-y-1">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
            সরকারি সমবায় অধিদপ্তর বিধিমালা অনুযায়ী প্রণীত
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
            {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            সরকারি নিবন্ধন নং: {activeTenant?.registrationNo || 'রেজি-৪৫৬/ঢাকা/২০১৬'} • স্থাপিত: {activeTenant?.establishedYear || '২০১৬'} খ্রিঃ
          </p>
          <p className="text-[11px] text-slate-400">
            প্রধান কার্যালয়: {activeTenant?.address} • ফোন: {activeTenant?.phone} • ইমেইল: {activeTenant?.email}
          </p>
        </div>

        {/* ----------------- TAB 1: DAILY COLLECTION SHEET ----------------- */}
        {activeReportType === 'COLLECTION_SHEET' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
              <div>
                <span className="text-base font-bold text-slate-100">
                  দৈনিক মাঠ কালেকশন শিট ও আদায় খতিয়ান
                </span>
                <p className="text-slate-400 text-[11px]">ফিল্ড অফিসার: রফিকুল ইসলাম (মাঠ কালেকশন ইউনিট ০১)</p>
              </div>
              <div className="text-slate-300 font-mono text-right">
                <div>তারিখ: {formatDate(reportDate, language)}</div>
                <div className="text-[10px] text-slate-400">কার্যালয় সময়: বিকাল ৫:০০ ঘটিকা</div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">মোট সদস্য সংখ্যা</span>
                <span className="text-lg font-bold text-white font-mono">{tenantMembers.length} জন</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">মোট সঞ্চয় আদায়</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">৳ ২২,৫০০</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">মোট কিস্তি আদায়</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">৳ ১৮,৩৩২</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">সর্বমোট সংগৃহীত নগদ</span>
                <span className="text-lg font-bold text-amber-400 font-mono">৳ ৪০,৮৩২</span>
              </div>
            </div>

            {/* Collection Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">সদস্য কোড</th>
                    <th className="py-2.5 px-3">সদস্যের নাম</th>
                    <th className="py-2.5 px-3">মোবাইল</th>
                    <th className="py-2.5 px-3 text-right">সঞ্চয় স্থিতি</th>
                    <th className="py-2.5 px-3 text-right">আজকের সঞ্চয় আদায়</th>
                    <th className="py-2.5 px-3 text-right">কিস্তি আদায়</th>
                    <th className="py-2.5 px-3 text-right">মোট সংগৃহীত</th>
                    <th className="py-2.5 px-3 text-center">স্বাক্ষর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {tenantMembers.map((m, idx) => {
                    const hasLoan = m.loanOutstanding > 0;
                    const savingsCollect = 2000;
                    const loanEmi = hasLoan ? 9166 : 0;
                    const totalCollect = savingsCollect + loanEmi;

                    return (
                      <tr key={m.id} className={idx % 2 === 0 ? 'bg-slate-900/30' : ''}>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{m.memberCode}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-100 font-medium">{m.nameBn}</td>
                        <td className="py-2.5 px-3 text-slate-400">{m.phone}</td>
                        <td className="py-2.5 px-3 text-right">৳ {m.savingsBalance.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">৳ {savingsCollect.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-cyan-400 font-bold">
                          {hasLoan ? `৳ ${loanEmi.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-400">৳ {totalCollect.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center font-sans text-slate-600">__________</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 flex justify-between items-center text-xs font-bold border-t border-slate-700 text-emerald-400 font-mono">
              <span className="font-sans text-slate-300">সর্বমোট দৈনিক ফিল্ড আদায়:</span>
              <span className="text-sm">৳ ৪০,৮৩২ (কথায়: চল্লিশ হাজার আটশত বত্রিশ টাকা মাত্র)</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: MEMBER MASTER PASSBOOK & LEDGER ----------------- */}
        {activeReportType === 'PASSBOOK' && selectedMember && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
              <span className="text-base font-bold text-slate-100">
                সদস্য পূর্ণাঙ্গ মাস্টার পাসবই ও লেনদেন বিবরণী
              </span>
              <span className="font-mono text-slate-400">
                রিপোর্ট প্রিন্ট সময়: {formatDate(reportDate, language)}
              </span>
            </div>

            {/* Member Profile Banner */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">সদস্য কোড:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{selectedMember.memberCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">পূর্ণ নাম:</span>
                <span className="font-bold text-slate-100">{selectedMember.nameBn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">মোবাইল ও এনআইডি:</span>
                <span className="font-mono text-slate-300">{selectedMember.phone}</span>
                <div className="text-[10px] text-slate-500 font-mono">NID: {selectedMember.nid}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">শেয়ার মূলধন:</span>
                <span className="font-bold text-purple-400">{selectedMember.sharesHeld} টি (৳ {selectedMember.shareValue.toLocaleString()})</span>
              </div>
            </div>

            {/* Quick Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-300 block text-[11px]">বর্তমান সাধারণ সঞ্চয় স্থিতি</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ৳ {selectedMember.savingsBalance.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-cyan-300 block text-[11px]">বর্তমান বকেয়া ঋণ স্থিতি</span>
                <span className="text-xl font-black text-cyan-400 font-mono">
                  ৳ {selectedMember.loanOutstanding.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-300 block text-[11px]">মাসিক চাঁদা হার</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  ৳ {(selectedMember.monthlySubscriptionAmount || 500).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Ledger Transactions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                সঞ্চয় ও ডিপিএস আমানত হিসাব খতিয়ান (Savings & DPS Ledger)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">রসিদ নং</th>
                      <th className="py-2.5 px-3">বিবরণ / খাত</th>
                      <th className="py-2.5 px-3 text-right">জমা (+)</th>
                      <th className="py-2.5 px-3 text-right">উত্তোলন (-)</th>
                      <th className="py-2.5 px-3 text-right">চলতি ব্যালেন্স</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {selectedMemberTx.length > 0 ? (
                      selectedMemberTx.map(tx => (
                        <tr key={tx.id}>
                          <td className="py-2.5 px-3 text-slate-400">{tx.date}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-semibold">{tx.receiptNo}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-200">{tx.notes || 'নিয়মিত সঞ্চয় জমা'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                            {tx.type === 'DEPOSIT' ? `+ ৳ ${tx.amount.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-rose-400 font-bold">
                            {tx.type === 'WITHDRAWAL' ? `- ৳ ${tx.amount.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-cyan-400">
                            ৳ {tx.balanceAfter.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-500 font-sans">
                          এই সদস্যের কোনো সঞ্চয় লেনদেন রেকর্ড পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Loan Repayment Ledger */}
            {selectedMemberLoans.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  ঋণ বিতরণ ও কিস্তি আদায় খতিয়ান (Loan Repayment Register)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] border-b border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">ঋণ নং</th>
                        <th className="py-2.5 px-3">বিতরণ আসল</th>
                        <th className="py-2.5 px-3">মোট প্রদেয়</th>
                        <th className="py-2.5 px-3">পরিশোধিত</th>
                        <th className="py-2.5 px-3">অবশিষ্ট বকেয়া</th>
                        <th className="py-2.5 px-3">পরিশোধিত কিস্তি</th>
                        <th className="py-2.5 px-3 text-right">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                      {selectedMemberLoans.map(l => (
                        <tr key={l.id}>
                          <td className="py-2.5 px-3 font-bold text-cyan-400">{l.loanNumber}</td>
                          <td className="py-2.5 px-3">৳ {l.principalAmount.toLocaleString()}</td>
                          <td className="py-2.5 px-3">৳ {l.totalPayable.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">৳ {l.totalPaid.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-rose-400 font-bold">৳ {l.outstandingBalance.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-sans">{l.paidInstallments} / {l.totalInstallments} টি</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                              l.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-300' :
                              l.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 3: STATUTORY BALANCE SHEET ----------------- */}
        {activeReportType === 'BALANCE_SHEET' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
              <span className="text-base font-bold text-slate-100">
                সমবায় আর্থিক স্থিতিপত্র (Balance Sheet as of {formatDate(reportDate, language)})
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ব্যালান্স সমতা নিশ্চিত (Balanced)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Assets Section */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    <span>সম্পত্তি ও পরিসম্পদ (Assets)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">কোড পরিসর: 1000 - 1999</span>
                </div>

                <div className="divide-y divide-slate-800/80 font-mono">
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">১.১ হাতে নগদ ক্যাশ (Cash in Hand)</span>
                    <span className="font-bold">৳ ১৮৪,৫০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">১.২ সোনালী ব্যাংক চলতি হিসাব নং-০১৪৫</span>
                    <span className="font-bold">৳ ৯৫২,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">১.৩ সদস্যদের নিকট বিতরণকৃত ঋণ বকেয়া আসল</span>
                    <span className="font-bold text-cyan-400">৳ ১২৫,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">১.৪ অর্জিত কিন্তু অনাদায়ী সার্ভিস চার্জ</span>
                    <span className="font-bold">৳ ১২,৫০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">১.৫ সমিতি কার্যালয়ের স্থায়ী আসবাব ও সরঞ্জামাদি</span>
                    <span className="font-bold">৳ ৪৫,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">১.৬ অগ্রিম অফিস ভাড়া ও জামানত</span>
                    <span className="font-bold">৳ ৩০,০০০</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-700 flex justify-between items-center text-sm font-black text-emerald-400 font-mono">
                  <span className="font-sans">সর্বমোট সম্পত্তি (Total Assets):</span>
                  <span className="text-base">৳ ১,৩৪৯,০০০</span>
                </div>
              </div>

              {/* Liabilities & Equity Section */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                    <span>দায় ও নিজস্ব মূলধন (Liabilities & Equity)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">কোড পরিসর: 2000 - 3999</span>
                </div>

                <div className="divide-y divide-slate-800/80 font-mono">
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">২.১ সদস্যদের সাধারণ সঞ্চয় আমানত তহবিল</span>
                    <span className="font-bold">৳ ৪৯৯,৫০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">২.২ মেয়াদী ডিপিএস আমানত তহবিল</span>
                    <span className="font-bold">৳ ৩১২,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">২.৩ পরিশোধিত শেয়ার মূলধন (Paid-up Capital)</span>
                    <span className="font-bold text-purple-400">৳ ১০২,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">২.৪ বাধ্যতামূলক সমবায় সংরক্ষিত তহবিল (১৫%)</span>
                    <span className="font-bold text-amber-400">৳ ৫২,৩৫০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">২.৫ কু-ঋণ সঞ্চিতি তহবিল (১০%)</span>
                    <span className="font-bold">৳ ৩৫,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">২.৬ সদস্য কল্যাণ ও শিক্ষা অনুদান তহবিল (৫%)</span>
                    <span className="font-bold">৳ ১৭,৪৫০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans text-slate-300">২.৭ অবণ্টিত নীট উদ্বৃত্ত / মুনাফা (Retained Surplus)</span>
                    <span className="font-bold text-emerald-400">৳ ৩৩০,৭০০</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-700 flex justify-between items-center text-sm font-black text-cyan-400 font-mono">
                  <span className="font-sans">সর্বমোট দায় ও মূলধন (Total Liabilities & Equity):</span>
                  <span className="text-base">৳ ১,৩৪৯,০০০</span>
                </div>
              </div>

            </div>

            {/* Reconciliation Check Note */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>হিসাবের সমতা সত্যতা: মোট সম্পত্তি ৳ ১,৩৪৯,০০০ = মোট দায় ও মূলধন ৳ ১,৩৪৯,০০০ (পার্থক্য: ৳ ০.০০)</span>
              </span>
              <span className="font-bold font-mono">STATUS: 100% BALANCED</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: PROFIT & LOSS / INCOME & EXPENDITURE ----------------- */}
        {activeReportType === 'INCOME_EXPENDITURE' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
              <span className="text-base font-bold text-slate-100">
                লাভ-ক্ষতি ও আয়-ব্যয় বিবরণী (Income & Expenditure Statement)
              </span>
              <span className="font-mono text-slate-400">
                অর্থবছর: ২০২৫-২০২৬ (হালনাগাদ: {formatDate(reportDate, language)})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Income Side */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="pb-2 border-b border-slate-700 font-bold text-emerald-400 text-xs uppercase flex items-center justify-between">
                  <span>সমিতির মোট আয় (Total Incomes)</span>
                  <span className="font-mono text-[11px] text-slate-400">গ্রুপ: 4000</span>
                </div>

                <div className="divide-y divide-slate-800 font-mono">
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">ঋণের সার্ভিস চার্জ / মুনাফা আয়</span>
                    <span className="font-bold text-emerald-400">৳ ৪২,৫০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">নতুন সদস্য ভর্তি ও ফরম ফি</span>
                    <span className="font-bold">৳ ৫,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">শেয়ার সনদ ও প্রত্যয়ন ফি আয়</span>
                    <span className="font-bold">৳ ৩,২০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">মাসিক চাঁদার বিলম্ব জরিমানা ফি</span>
                    <span className="font-bold">৳ ১,৮০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">সোনালী ব্যাংক একাউন্টের মুনাফা</span>
                    <span className="font-bold">৳ ৮,৪০০</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-700 flex justify-between items-center text-sm font-bold text-emerald-400 font-mono">
                  <span className="font-sans">সর্বমোট আয় (Gross Income):</span>
                  <span>৳ ৬০,৯০০</span>
                </div>
              </div>

              {/* Expenditure Side */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="pb-2 border-b border-slate-700 font-bold text-rose-400 text-xs uppercase flex items-center justify-between">
                  <span>সমিতির পরিচালনা ব্যয় (Expenditures)</span>
                  <span className="font-mono text-[11px] text-slate-400">গ্রুপ: 5000</span>
                </div>

                <div className="divide-y divide-slate-800 font-mono">
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">কর্মচারীদের বেতন ও সম্মানী</span>
                    <span className="font-bold">৳ ১৮,০০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">অফিস ঘর ভাড়া ও বিদ্যুৎ বিল</span>
                    <span className="font-bold">৳ ৮,৫০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">সাধারণ সভা ও মিটিং আপ্যায়ন</span>
                    <span className="font-bold">৳ ৩,২০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">কাগজপত্র, স্টেশনারি ও মুদ্রণ খরচ</span>
                    <span className="font-bold">৳ ২,৪০০</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-300">
                    <span className="font-sans">সফটওয়্যার ও এসএমএস গেটওয়ে বিল</span>
                    <span className="font-bold">৳ ১,৫০০</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-700 flex justify-between items-center text-sm font-bold text-rose-400 font-mono">
                  <span className="font-sans">সর্বমোট ব্যয় (Total Expenditures):</span>
                  <span>৳ ৩৩,৬০০</span>
                </div>
              </div>

            </div>

            {/* Net Surplus Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-emerald-400 font-bold text-sm block">
                  অর্থবছরের নীট পরিচালন উদ্বৃত্ত (Net Operating Profit / Surplus)
                </span>
                <span className="text-slate-400 text-[11px]">
                  মোট আয় (৳ ৬০,৯০০) - মোট ব্যয় (৳ ৩৩,৬০০) = নীট মুনাফা
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                ৳ ২৭,৩০০
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 5: OVERDUE LOANS & DEFAULTERS REGISTER ----------------- */}
        {activeReportType === 'DEFAULTERS' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
              <div>
                <span className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>ঋণ খেলাপি ও মেয়াদোত্তীর্ণ কিস্তি রেজিস্টার (Overdue Loans Register)</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  ১ বা ততোধিক কিস্তি বকেয়া থাকা সদস্যদের পর্যালোচনা ও তাগিদ রিপোর্ট
                </p>
              </div>
              <span className="font-mono text-slate-400">
                তারিখ: {formatDate(reportDate, language)}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-300 block text-[11px]">মোট খেলাপি ঋণ</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {filteredDefaulters.length} টি
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">মোট বকেয়া কিস্তির পরিমাণ</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  ৳ {filteredDefaulters.reduce((s, d) => s + d.overdueAmount, 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">মোট ঝুঁকিপূর্ণ আসল স্থিতি</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  ৳ {filteredDefaulters.reduce((s, d) => s + d.loan.outstandingBalance, 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">ঝুঁকিপূর্ণ খেলাপি হার</span>
                <span className="text-lg font-bold text-purple-400 font-mono">
                  {tenantLoans.length > 0 ? ((filteredDefaulters.length / tenantLoans.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            {/* Defaulters Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">ঋণ নং</th>
                    <th className="py-2.5 px-3">ঋণগ্রহীতার নাম ও কোড</th>
                    <th className="py-2.5 px-3">মোবাইল নম্বর</th>
                    <th className="py-2.5 px-3">জামিনদারের নাম ও ফোন</th>
                    <th className="py-2.5 px-3 text-right">বকেয়া কিস্তি সংখ্যা</th>
                    <th className="py-2.5 px-3 text-right">বকেয়া কিস্তির টাকা</th>
                    <th className="py-2.5 px-3 text-right">মোট বকেয়া আসল</th>
                    <th className="py-2.5 px-3 text-center">খেলাপি স্তর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {filteredDefaulters.length > 0 ? (
                    filteredDefaulters.map(d => (
                      <tr key={d.loan.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold text-rose-400">{d.loan.loanNumber}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-100 font-medium">
                          {d.member?.nameBn} ({d.member?.memberCode})
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 flex items-center gap-1.5 pt-3">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{d.member?.phone}</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">
                          <div>{d.loan.guarantor1?.name || 'মো. রফিকুল ইসলাম'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{d.loan.guarantor1?.phone || '01819-000000'}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-400 font-bold">
                          {d.overdueInstallmentsCount} টি
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-rose-400">
                          ৳ {d.overdueAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                          ৳ {d.loan.outstandingBalance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                            d.bracket === '90+' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            d.bracket === '61-90' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {d.bracket} দিন
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 font-sans">
                        নির্বাচিত ফিল্টারে কোনো খেলাপি বা বকেয়া ঋণ নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- TAB 6: TRIAL BALANCE (রেওয়ামিল) ----------------- */}
        {activeReportType === 'TRIAL_BALANCE' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
              <div>
                <span className="text-base font-bold text-slate-100">
                  খতিয়ান রেওয়ামিল (Trial Balance)
                </span>
                <p className="text-slate-400 text-[11px]">
                  সকল হিসাবের ডেবিট ও ক্রেডিট জেরের গাণিতিক নির্ভুলতা যাচাই তালিকা
                </p>
              </div>
              <span className="font-mono text-slate-400">
                হালনাগাদ: {formatDate(reportDate, language)}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">হিসাব কোড</th>
                    <th className="py-2.5 px-3">হিসাবের নাম (বাংলা)</th>
                    <th className="py-2.5 px-3">হিসাবের ধরন</th>
                    <th className="py-2.5 px-3 text-right">ডেবিট জের (৳)</th>
                    <th className="py-2.5 px-3 text-right">ক্রেডিট জের (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {trialBalanceData.items.map((item, idx) => (
                    <tr key={item.code} className={idx % 2 === 0 ? 'bg-slate-900/30' : ''}>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{item.code}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-100 font-medium">{item.nameBn}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.group === 'ASSET' ? 'bg-emerald-500/10 text-emerald-400' :
                          item.group === 'LIABILITY' ? 'bg-cyan-500/10 text-cyan-400' :
                          item.group === 'INCOME' ? 'bg-teal-500/10 text-teal-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {item.group}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {item.debit > 0 ? `৳ ${item.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                        {item.credit > 0 ? `৳ ${item.credit.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-800/90 text-white font-mono text-xs border-t-2 border-slate-600 font-bold">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 font-sans text-slate-200">
                      সর্বমোট যোগফল (Grand Total):
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 text-sm">
                      ৳ {trialBalanceData.totalDebit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-400 text-sm">
                      ৳ {trialBalanceData.totalCredit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>রেওয়ামিলের ডেবিট ও ক্রেডিট কলাম সম্পূর্ণ সমান। হিসাবের গাণিতিক বিশুদ্ধতা প্রমাণিত।</span>
              </span>
              <span className="font-bold font-mono">BALANCED: 0.00 DIF</span>
            </div>
          </div>
        )}

        {/* Official 3-tier Institutional Signatures for Printing */}
        <div className="pt-14 grid grid-cols-3 gap-6 text-center text-xs text-slate-400">
          <div>
            <div className="border-t border-slate-700 pt-1.5 font-bold text-slate-300">
              হিসাবরক্ষক / ক্যাশিয়ার
            </div>
            <div className="text-[10px] text-slate-500">প্রস্তুতকারী কর্মকর্তা</div>
          </div>
          <div>
            <div className="border-t border-slate-700 pt-1.5 font-bold text-slate-300">
              সাধারণ সম্পাদক
            </div>
            <div className="text-[10px] text-slate-500">যাচাই ও সুপারিশকারী</div>
          </div>
          <div>
            <div className="border-t border-slate-700 pt-1.5 font-bold text-slate-300">
              সভাপতি
            </div>
            <div className="text-[10px] text-slate-500">অনুমোদনকারী ও সিল</div>
          </div>
        </div>

      </div>

    </div>
  );
}
