'use client';

import React, { useState } from 'react';
import { 
  PiggyBank, Plus, Search, Filter, TrendingUp, DollarSign, 
  Calendar, CheckCircle2, AlertCircle, Eye, Sliders,
  ArrowUpRight, Printer, FileText, X, PieChart, Users,
  ShieldCheck, Share2, Award, QrCode, Percent, ArrowRight
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  MemberShareRecord, ShareCapitalConfig, DividendSession, 
  MemberDividendItem, DividendDistributionBasis, PaymentMethod 
} from '@/types';

export function ShareCapitalDividendView() {
  const { 
    shareConfig, memberShares, dividendSessions, dividendItems, 
    members, savingsAccounts, updateShareConfig, issueSharesToMember, 
    calculateDividendPreview, createAndDisburseDividendSession,
    letterhead, language
  } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'SHARES' | 'DIVIDEND_ENGINE'>('SHARES');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isIssueShareModalOpen, setIsIssueShareModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isNewDividendModalOpen, setIsNewDividendModalOpen] = useState(false);
  const [isDividendSheetModalOpen, setIsDividendSheetModalOpen] = useState(false);

  // Active Selections
  const [selectedShare, setSelectedShare] = useState<MemberShareRecord | null>(null);
  const [selectedSession, setSelectedSession] = useState<DividendSession | null>(null);

  // Issue Share Form
  const [issueForm, setIssueForm] = useState({
    memberId: '',
    numberOfShares: 10,
    paymentMethod: 'BANK' as PaymentMethod,
    issueDate: new Date().toISOString().split('T')[0]
  });

  // Share Config Form
  const [configForm, setConfigForm] = useState<ShareCapitalConfig>({ ...shareConfig });

  // Dividend Wizard State
  const [dividendStep, setDividendStep] = useState<1 | 2 | 3>(1);
  const [dividendForm, setDividendForm] = useState({
    financialYear: '২০২৫-২০২৬',
    totalNetProfit: 500000,
    reserveFundPercent: shareConfig.compulsoryReservePercent || 15,
    developmentFundPercent: shareConfig.developmentFundPercent || 3,
    distributionBasis: 'SHARE_RATIO' as DividendDistributionBasis,
    disbursementMethod: 'CREDIT_TO_SAVINGS' as 'CREDIT_TO_SAVINGS' | 'CASH_VOUCHER',
    notes: 'বার্ষিক সাধারণ সভা (AGM) সিদ্ধান্ত মোতাবেক সংবিধিবদ্ধ সঞ্চিতি তহবিল কর্তন সাপেক্ষে লভ্যাংশ অনুমোদন।'
  });

  // Calculate Aggregate Share Metrics
  const activeShares = memberShares.filter(s => s.status === 'ACTIVE');
  const totalIssuedShares = activeShares.reduce((sum, s) => sum + s.numberOfShares, 0);
  const totalPaidUpCapital = activeShares.reduce((sum, s) => sum + s.totalShareCapital, 0);
  const authorizedCapital = shareConfig.authorizedSharesCount * shareConfig.faceValue;
  const uniqueShareholdersCount = new Set(activeShares.map(s => s.memberId)).size;

  // Filtered Member Shares
  const filteredShares = activeShares.filter(s => 
    s.memberNameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.certificateNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Live Preview for Dividend Wizard
  const dividendPreview = calculateDividendPreview({
    financialYear: dividendForm.financialYear,
    totalNetProfit: Number(dividendForm.totalNetProfit) || 0,
    reserveFundPercent: Number(dividendForm.reserveFundPercent) || 0,
    developmentFundPercent: Number(dividendForm.developmentFundPercent) || 0,
    distributionBasis: dividendForm.distributionBasis
  });

  const handleIssueShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.memberId || issueForm.numberOfShares <= 0) return;
    const shareRecord = issueSharesToMember(issueForm);
    setIsIssueShareModalOpen(false);
    setSelectedShare(shareRecord);
    setIsCertificateModalOpen(true);
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShareConfig(configForm);
    setIsConfigModalOpen(false);
  };

  const handleDisburseSubmit = () => {
    const result = createAndDisburseDividendSession({
      financialYear: dividendForm.financialYear,
      totalNetProfit: Number(dividendForm.totalNetProfit),
      reserveFundPercent: Number(dividendForm.reserveFundPercent),
      developmentFundPercent: Number(dividendForm.developmentFundPercent),
      distributionBasis: dividendForm.distributionBasis,
      disbursementMethod: dividendForm.disbursementMethod,
      notes: dividendForm.notes
    });

    setIsNewDividendModalOpen(false);
    setDividendStep(1);
    setSelectedSession(result.session);
    setIsDividendSheetModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-950/70 via-slate-900 to-indigo-950/60 p-5 sm:p-6 rounded-2xl border border-teal-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              মডিউল ৪
            </span>
            <span className="text-xs text-slate-400 font-medium">সমবায় আইনানুযায়ী মূলধন ও মুনাফা বণ্টন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            শেয়ার মূলধন ও লভ্যাংশ বণ্টন ইঞ্জিন (Share Capital & Dividend)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            সদস্যদের শেয়ার সংখ্যা, সার্টিফিকেট ইস্যু, সাধারণ সঞ্চিতি তহবিল কর্তন এবং শেয়ার বা সঞ্চয় অনুপাতে বার্ষিক লভ্যাংশ বণ্টন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setConfigForm({ ...shareConfig });
              setIsConfigModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>শেয়ার পলিসি</span>
          </button>

          <button
            onClick={() => setIsIssueShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-teal-600/20 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শেয়ার ইস্যু</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">অনুমোদিত মূলধন</div>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">৳ {authorizedCapital.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{shareConfig.authorizedSharesCount.toLocaleString()} টি শেয়ার</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">পরিশোধিত শেয়ার মূলধন</div>
          <div className="text-lg sm:text-xl font-bold text-teal-400 mt-1">৳ {totalPaidUpCapital.toLocaleString()}</div>
          <div className="text-[10px] text-teal-500 mt-0.5">{totalIssuedShares} টি ইস্যুকৃত শেয়ার</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">শেয়ারহোল্ডার সদস্য</div>
          <div className="text-lg sm:text-xl font-bold text-indigo-400 mt-1">{uniqueShareholdersCount} জন</div>
          <div className="text-[10px] text-indigo-300 mt-0.5">অংশীদারিত্ব সম্পন্ন</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">প্রতি শেয়ারের ফেস ভ্যালু</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">৳ {shareConfig.faceValue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">নির্ধারিত অভিহিত মূল্য</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">সংবিধিবদ্ধ সঞ্চিতি রিজার্ভ</div>
          <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-1">{shareConfig.compulsoryReservePercent}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">+ {shareConfig.developmentFundPercent}% কল্যাণ ফান্ড</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SHARES')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'SHARES'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            শেয়ার রেজিস্টার ও সনদ ({memberShares.length})
          </button>
          <button
            onClick={() => setActiveTab('DIVIDEND_ENGINE')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'DIVIDEND_ENGINE'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            বার্ষিক লভ্যাংশ বণ্টন ইঞ্জিন ({dividendSessions.length})
          </button>
        </div>

        {activeTab === 'DIVIDEND_ENGINE' && (
          <button
            onClick={() => {
              setDividendStep(1);
              setIsNewDividendModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow transition cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>নতুন লভ্যাংশ বণ্টন পরিচালনা</span>
          </button>
        )}
      </div>

      {/* TAB 1: SHAREHOLDING REGISTER & CERTIFICATES */}
      {activeTab === 'SHARES' && (
        <div className="space-y-4">
          {/* Search Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="সদস্যের নাম, কোড বা শেয়ার সনদ নং দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                <span>সদস্যদের শেয়ার হোল্ডিং রেজিস্টার ও সনদ বিবরণী</span>
              </h3>
              <div className="text-xs text-slate-400">
                মোট শেয়ার মূলধন: <strong className="text-white font-mono">৳ {totalPaidUpCapital.toLocaleString()}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">সনদ নম্বর</th>
                    <th className="py-3 px-4">সদস্যের নাম ও কোড</th>
                    <th className="py-3 px-4 text-center">শেয়ার ক্রমিক নং</th>
                    <th className="py-3 px-4 text-center">শেয়ার সংখ্যা</th>
                    <th className="py-3 px-4 text-right">মূল্যমান (৳)</th>
                    <th className="py-3 px-4 text-center">মাধ্যম</th>
                    <th className="py-3 px-4 text-center">ইস্যুর তারিখ</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredShares.map(share => (
                    <tr key={share.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-400">
                        {share.certificateNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{share.memberNameBn}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{share.memberCode} • {share.memberPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300 bg-slate-950/40">
                        {share.shareNumbersRange}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-bold border border-teal-500/20">
                          {share.numberOfShares} টি
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                        ৳ {share.totalShareCapital.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {share.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400">
                        {share.issueDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedShare(share);
                            setIsCertificateModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-teal-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span>সনদ প্রিন্ট</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIVIDEND DISTRIBUTION ENGINE */}
      {activeTab === 'DIVIDEND_ENGINE' && (
        <div className="space-y-6">
          {/* Dividend Sessions History */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-400" />
              <span>বার্ষিক লভ্যাংশ বণ্টন খতিয়ান ও সমাপনী বিবরণী</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dividendSessions.map(session => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        অর্থবছর: {session.financialYear}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">
                        বার্ষিক নিট মুনাফা: ৳ {session.totalNetProfit.toLocaleString()}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{session.status === 'DISBURSED' ? 'বিতরণ সম্পন্ন' : 'হিসাবকৃত'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">সঞ্চিতি রিজার্ভ ({session.reserveFundPercent}%)</div>
                      <div className="font-bold text-rose-400 mt-0.5">৳ {session.reserveFundAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">বণ্টনযোগ্য মুনাফা</div>
                      <div className="font-bold text-teal-400 mt-0.5">৳ {session.distributableProfit.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">উপকৃত সদস্য</div>
                      <div className="font-bold text-cyan-400 mt-0.5">{session.totalMembersBenefited} জন</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {session.notes || 'বার্ষিক সাধারণ সভার সিদ্ধান্তানুযায়ী সদস্যদের হিসাবে লভ্যাংশ ক্রেডিট সম্পন্ন।'}
                  </p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">বিতরণ তারিখ: {session.disbursedDate || session.calculationDate}</span>
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setIsDividendSheetModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>বিতরণ বিবরণী শিট</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ISSUE NEW SHARES TO MEMBER */}
      {/* ---------------------------------------------------- */}
      {isIssueShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">নতুন শেয়ার ইস্যু ও সার্টিফিকেট প্রদান</h3>
              </div>
              <button
                onClick={() => setIsIssueShareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueShareSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={issueForm.memberId}
                  onChange={e => setIssueForm({ ...issueForm, memberId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- সদস্য নির্বাচন করুন --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nameBn} ({m.memberCode}) • {m.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">শেয়ার সংখ্যা (টি) *</label>
                  <input
                    type="number"
                    min={1}
                    max={shareConfig.maxSharesPerMember}
                    required
                    value={issueForm.numberOfShares}
                    onChange={e => setIssueForm({ ...issueForm, numberOfShares: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500">সর্বোচ্চ সীমা: {shareConfig.maxSharesPerMember} টি</span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">পেমেন্ট মাধ্যম *</label>
                  <select
                    value={issueForm.paymentMethod}
                    onChange={e => setIssueForm({ ...issueForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="BANK">ব্যাংক একাউন্ট</option>
                    <option value="CASH">নগদ ক্যাশ</option>
                    <option value="BKASH">বিকাশ (bKash)</option>
                    <option value="NAGAD">নগদ (Nagad)</option>
                  </select>
                </div>
              </div>

              {/* Calculated Value Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">পরিশোধিত মোট শেয়ার মূলধন:</div>
                  <div className="text-xs text-slate-300">
                    {issueForm.numberOfShares} টি শেয়ার × ৳ {shareConfig.faceValue.toLocaleString()} (প্রতি শেয়ার)
                  </div>
                </div>
                <div className="text-lg font-bold text-teal-400">
                  ৳ {(issueForm.numberOfShares * shareConfig.faceValue).toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">ইস্যুর তারিখ</label>
                <input
                  type="date"
                  value={issueForm.issueDate}
                  onChange={e => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueShareModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-teal-600/30 transition cursor-pointer"
                >
                  শেয়ার ইস্যু ও সনদ তৈরি
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: SHARE CAPITAL POLICY CONFIGURATION */}
      {/* ---------------------------------------------------- */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">শেয়ার মূলধন পলিসি কনফিগারেশন</h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfigSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">প্রতি শেয়ারের ফেস ভ্যালু (Face Value ৳) *</label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  required
                  value={configForm.faceValue}
                  onChange={e => setConfigForm({ ...configForm, faceValue: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">অনুমোদিত সর্বোচ্চ শেয়ার সংখ্যা *</label>
                <input
                  type="number"
                  min={100}
                  required
                  value={configForm.authorizedSharesCount}
                  onChange={e => setConfigForm({ ...configForm, authorizedSharesCount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">সদস্য প্রতি সর্বোচ্চ শেয়ার *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={configForm.maxSharesPerMember}
                    onChange={e => setConfigForm({ ...configForm, maxSharesPerMember: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">সংবিধিবদ্ধ সঞ্চিতি (%) *</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    required
                    value={configForm.compulsoryReservePercent}
                    onChange={e => setConfigForm({ ...configForm, compulsoryReservePercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">সমবায় উন্নয়ন ও কল্যাণ তহবিল (%)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={configForm.developmentFundPercent}
                  onChange={e => setConfigForm({ ...configForm, developmentFundPercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-teal-600/30 transition cursor-pointer"
                >
                  পলিসি সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: 3-STEP DIVIDEND DISTRIBUTION WIZARD */}
      {/* ---------------------------------------------------- */}
      {isNewDividendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 max-h-[92vh] flex flex-col justify-between">
            <div>
              {/* Wizard Header & Steps Indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-400" />
                    <span>বার্ষিক লভ্যাংশ বণ্টন ক্যালকুলেটর ইঞ্জিন</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ধাপ {dividendStep} / ৩ • {dividendStep === 1 ? 'মুনাফা ও তহবিল নির্ধারণ' : dividendStep === 2 ? 'বণ্টন পদ্ধতি ও সদস্য প্রিভিউ' : 'বিতরণ নিশ্চিতকরণ'}
                  </div>
                </div>

                <button
                  onClick={() => setIsNewDividendModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STEP 1: FINANCIAL YEAR & PROFIT INPUT */}
              {dividendStep === 1 && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">অর্থবছর *</label>
                      <input
                        type="text"
                        value={dividendForm.financialYear}
                        onChange={e => setDividendForm({ ...dividendForm, financialYear: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">মোট বার্ষিক অর্জিত নিট মুনাফা (৳) *</label>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        required
                        value={dividendForm.totalNetProfit}
                        onChange={e => setDividendForm({ ...dividendForm, totalNetProfit: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-bold text-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">সংবিধিবদ্ধ সাধারণ সঞ্চিতি কর্তন (%) *</label>
                      <input
                        type="number"
                        min={5}
                        max={50}
                        value={dividendForm.reserveFundPercent}
                        onChange={e => setDividendForm({ ...dividendForm, reserveFundPercent: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-500">সমবায় আইন অনুযায়ী ন্যুনতম ১৫% বাধ্যতামূলক</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-medium">সমবায় উন্নয়ন তহবিল কর্তন (%) *</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={dividendForm.developmentFundPercent}
                        onChange={e => setDividendForm({ ...dividendForm, developmentFundPercent: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Deduction Breakdown Card */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>মোট নিট মুনাফা:</span>
                      <span className="font-bold text-white">৳ {dividendPreview.totalNetProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-400">
                      <span>(-) সংবিধিবদ্ধ সঞ্চিতি তহবিল ({dividendForm.reserveFundPercent}%):</span>
                      <span className="font-bold">- ৳ {dividendPreview.reserveFundAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-400">
                      <span>(-) সমবায় উন্নয়ন তহবিল ({dividendForm.developmentFundPercent}%):</span>
                      <span className="font-bold">- ৳ {dividendPreview.developmentFundAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                      <span className="font-bold text-teal-300">সদস্যদের মাঝে মোট বণ্টনযোগ্য নিট মুনাফা:</span>
                      <span className="font-bold text-emerald-400 text-base font-mono">
                        ৳ {dividendPreview.distributableProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DISTRIBUTION BASIS & LIVE MEMBER PREVIEW */}
              {dividendStep === 2 && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">মুনাফা বণ্টনের পদ্ধতি নির্বাচন করুন *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setDividendForm({ ...dividendForm, distributionBasis: 'SHARE_RATIO' })}
                        className={`p-3 rounded-xl border text-left transition ${
                          dividendForm.distributionBasis === 'SHARE_RATIO'
                            ? 'bg-teal-950/60 border-teal-500 text-white shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">১. শেয়ারের সংখ্যা অনুপাতে</div>
                        <div className="text-[10px] text-slate-400 mt-1">সদস্যের মোট শেয়ার সংখ্যা অনুযায়ী ১০০% মুনাফা বণ্টন।</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDividendForm({ ...dividendForm, distributionBasis: 'SAVINGS_RATIO' })}
                        className={`p-3 rounded-xl border text-left transition ${
                          dividendForm.distributionBasis === 'SAVINGS_RATIO'
                            ? 'bg-teal-950/60 border-teal-500 text-white shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">২. সঞ্চয় স্থিতি অনুপাতে</div>
                        <div className="text-[10px] text-slate-400 mt-1">সদস্যের সাধারণ সঞ্চয় ব্যালান্স অনুযায়ী ১০০% মুনাফা বণ্টন।</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDividendForm({ ...dividendForm, distributionBasis: 'HYBRID_50_50' })}
                        className={`p-3 rounded-xl border text-left transition ${
                          dividendForm.distributionBasis === 'HYBRID_50_50'
                            ? 'bg-teal-950/60 border-teal-500 text-white shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">৩. যৌথ হাইব্রিড (৫০/৫০)</div>
                        <div className="text-[10px] text-slate-400 mt-1">৫০% শেয়ার অনুপাতে এবং ৫০% সঞ্চয় স্থিতি অনুপাতে বণ্টন।</div>
                      </button>
                    </div>
                  </div>

                  {/* Calculated Members Table Preview */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase sticky top-0">
                        <tr>
                          <th className="py-2 px-3">সদস্য</th>
                          <th className="py-2 px-3 text-center">শেয়ার</th>
                          <th className="py-2 px-3 text-right">সঞ্চয় স্থিতি</th>
                          <th className="py-2 px-3 text-right">প্রাপ্য লভ্যাংশ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {dividendPreview.items.map(item => (
                          <tr key={item.memberId} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3">
                              <div className="font-semibold text-white">{item.memberNameBn}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.memberCode}</div>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-teal-400">
                              {item.shareCount} টি
                            </td>
                            <td className="py-2 px-3 text-right text-slate-300">
                              ৳ {item.savingsBalance.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-400 text-xs">
                              ৳ {item.netDividendPayable.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 3: DISBURSEMENT METHOD & CONFIRMATION */}
              {dividendStep === 3 && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">মুনাফা বিতরণ পদ্ধতি নির্বাচন করুন *</label>
                    <select
                      value={dividendForm.disbursementMethod}
                      onChange={e => setDividendForm({ ...dividendForm, disbursementMethod: e.target.value as 'CREDIT_TO_SAVINGS' | 'CASH_VOUCHER' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-semibold"
                    >
                      <option value="CREDIT_TO_SAVINGS">
                        ১. সদস্যদের সাধারণ সঞ্চয় হিসাবে সরাসরি ক্রেডিট (সুপারিশকৃত)
                      </option>
                      <option value="CASH_VOUCHER">
                        ২. নগদ অর্থ প্রদানের পে-ভাউচার জেনারেট
                      </option>
                    </select>
                    <p className="text-[11px] text-slate-500">
                      সঞ্চয় হিসাবে ক্রেডিট নির্বাচন করলে তাৎক্ষণিকভাবে প্রতিটি সদস্যের ডিজিটাল পাসবইয়ে ডিপোজিট অন্তর্ভুক্ত হবে।
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">এজিএম / রেজোলিউশন ও অডিট নোট</label>
                    <textarea
                      rows={2}
                      value={dividendForm.notes}
                      onChange={e => setDividendForm({ ...dividendForm, notes: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 resize-none"
                    ></textarea>
                  </div>

                  {/* Final Summary Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 space-y-2">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>চূড়ান্ত লভ্যাংশ বিতরণ সংক্ষেপ:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>অর্থবছর: <strong className="text-white">{dividendForm.financialYear}</strong></div>
                      <div>উপকৃত সদস্য: <strong className="text-white">{dividendPreview.items.length} জন</strong></div>
                      <div>মোট বণ্টনযোগ্য: <strong className="text-emerald-400 font-bold">৳ {dividendPreview.distributableProfit.toLocaleString()}</strong></div>
                      <div>সংবিধিবদ্ধ সঞ্চিতি: <strong className="text-rose-400 font-bold">৳ {dividendPreview.reserveFundAmount.toLocaleString()}</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stepper Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {dividendStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setDividendStep((s => (s - 1) as 1 | 2 | 3))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  পূর্ববর্তী ধাপ
                </button>
              ) : <div></div>}

              {dividendStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setDividendStep((s => (s + 1) as 1 | 2 | 3))}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <span>পরবর্তী ধাপ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDisburseSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>লভ্যাংশ বিতরণ নিশ্চিত ও পোস্টিং সম্পন্ন করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: OFFICIAL PRINTABLE SHARE CERTIFICATE */}
      {/* ---------------------------------------------------- */}
      {isCertificateModalOpen && selectedShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">শেয়ার মালিকানা সনদপত্র (Share Certificate)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Classic Certificate Layout */}
            <div className="p-8 rounded-xl bg-white text-slate-900 border-8 border-double border-teal-900 shadow-xl relative font-serif">
              {/* Header */}
              <div className="text-center pb-4 border-b-2 border-teal-900/40 space-y-1">
                <h1 className="text-2xl font-black text-teal-950 tracking-tight">
                  {letterhead.samityNameBn}
                </h1>
                <p className="text-xs text-slate-600 font-sans">
                  {letterhead.addressBn} • ফোন: {letterhead.phone}
                </p>
                <div className="inline-block px-5 py-1 rounded-full bg-teal-100 text-teal-950 text-xs font-bold font-sans mt-2 uppercase tracking-wider">
                  শেয়ার মালিকানা সনদপত্র (Share Certificate)
                </div>
              </div>

              {/* Meta row */}
              <div className="flex justify-between items-center text-xs text-slate-600 font-sans pt-4">
                <div>সনদ নং: <span className="font-mono font-bold text-slate-900">{selectedShare.certificateNo}</span></div>
                <div>শেয়ার ক্রমিক: <span className="font-mono font-bold text-teal-900">{selectedShare.shareNumbersRange}</span></div>
                <div>ইস্যু তারিখ: <span className="font-semibold text-slate-900">{selectedShare.issueDate}</span></div>
              </div>

              {/* Main Body */}
              <div className="py-6 space-y-4 text-justify text-sm leading-relaxed text-slate-800 font-sans">
                <p>
                  এই মর্মে প্রত্যয়ন করা যাইতেছে যে, অত্র সমিতির সম্মানিত সাধারণ সদস্য জনাব/জনাবা{' '}
                  <strong className="text-teal-950 font-bold underline underline-offset-4">{selectedShare.memberNameBn}</strong> (সদস্য কোড:{' '}
                  <span className="font-mono font-bold">{selectedShare.memberCode}</span>, মোবাইল: {selectedShare.memberPhone}) অত্র সমিতির{' '}
                  <strong className="text-teal-900 font-bold">{selectedShare.numberOfShares} (টি)</strong> পরিশোধিত সাধারণ শেয়ারের বৈধ মালিক। প্রতি শেয়ারের মূল্যমান ৳ {selectedShare.faceValue.toLocaleString()} টাকা হারে তিনি সর্বমোট{' '}
                  <strong className="text-teal-950 font-bold">৳ {selectedShare.totalShareCapital.toLocaleString()}</strong> (কথায়: {selectedShare.totalShareCapital} টাকা মাত্র) মূলধন প্রদান করিয়াছেন।
                </p>
                <p>
                  উক্ত শেয়ারের মালিক হিসেবে তিনি সমিতির উপ-আইনানুযায়ী বার্ষিক লভ্যাংশ, ভোটাধিকার এবং অন্যান্য সকল সাংবিধানিক অধিকার ভোগ করিবেন।
                </p>
              </div>

              {/* Bottom Signatures */}
              <div className="pt-8 border-t border-slate-300 flex items-end justify-between font-sans text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 border border-slate-300 rounded bg-slate-50">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    ডিজিটাল ভেরিফিকেশন কোড<br />
                    <span className="font-mono text-teal-900 font-bold">{selectedShare.certificateNo}</span><br />
                    সমিতিপ্রো ডিজিটাল ক্লাউড
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-slate-900"></div>
                  <div className="font-bold text-slate-800">কোষাধ্যক্ষ</div>
                  <div className="text-[10px] text-slate-500">একতা সমবায় সমিতি</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-slate-900"></div>
                  <div className="font-bold text-slate-800">সভাপতি / সম্পাদক</div>
                  <div className="text-[10px] text-slate-500">একতা সমবায় সমিতি</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: OFFICIAL PRINTABLE DIVIDEND DISBURSEMENT SHEET */}
      {/* ---------------------------------------------------- */}
      {isDividendSheetModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">বার্ষিক লভ্যাংশ বিতরণী বিবরণী ও পে-স্লিপ শিট</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setIsDividendSheetModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement */}
            <div className="p-8 rounded-xl bg-white text-slate-900 shadow-xl border border-slate-300 font-sans text-xs">
              {/* Header */}
              <div className="text-center pb-4 border-b-2 border-slate-300 space-y-1">
                <h1 className="text-xl font-black text-slate-900">
                  {letterhead.samityNameBn}
                </h1>
                <p className="text-[11px] text-slate-600">
                  {letterhead.addressBn} • ফোন: {letterhead.phone}
                </p>
                <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs mt-1">
                  বার্ষিক লভ্যাংশ বিতরণী বিবরণী (অর্থবছর: {selectedSession.financialYear})
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2 py-4 border-b border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-500">মোট নিট মুনাফা</div>
                  <div className="font-bold text-slate-900 mt-0.5">৳ {selectedSession.totalNetProfit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">সঞ্চিতি কর্তন ({selectedSession.reserveFundPercent}%)</div>
                  <div className="font-bold text-rose-600 mt-0.5">৳ {selectedSession.reserveFundAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">মোট বণ্টিত লভ্যাংশ</div>
                  <div className="font-bold text-teal-700 mt-0.5">৳ {selectedSession.distributableProfit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">উপকৃত সদস্য</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedSession.totalMembersBenefited} জন</div>
                </div>
              </div>

              {/* Table of Members */}
              <div className="py-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-[10px] uppercase text-slate-600">
                      <th className="py-1.5 px-2">ক্রমিক</th>
                      <th className="py-1.5 px-2">সদস্যের নাম ও কোড</th>
                      <th className="py-1.5 px-2 text-center">শেয়ার</th>
                      <th className="py-1.5 px-2 text-right">সঞ্চয় স্থিতি</th>
                      <th className="py-1.5 px-2 text-right">প্রাপ্য লভ্যাংশ</th>
                      <th className="py-1.5 px-2 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dividendItems.filter(i => i.sessionId === selectedSession.id).map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2 px-2 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <div className="font-bold text-slate-800">{item.memberNameBn}</div>
                          <div className="text-[10px] text-slate-500">{item.memberCode}</div>
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-slate-700">{item.shareCount} টি</td>
                        <td className="py-2 px-2 text-right text-slate-600">৳ {item.savingsBalance.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right font-bold text-teal-700">৳ {item.netDividendPayable.toLocaleString()}</td>
                        <td className="py-2 px-2 text-center text-[10px] font-semibold text-emerald-700">সঞ্চয়ে ক্রেডিট</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex items-center justify-between text-xs">
                <div className="text-center space-y-1">
                  <div className="w-28 border-b border-slate-900"></div>
                  <div className="font-bold text-slate-800">হিসাবরক্ষক</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-28 border-b border-slate-900"></div>
                  <div className="font-bold text-slate-800">কোষাধ্যক্ষ</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-28 border-b border-slate-900"></div>
                  <div className="font-bold text-slate-800">সভাপতি / সাধারণ সম্পাদক</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
