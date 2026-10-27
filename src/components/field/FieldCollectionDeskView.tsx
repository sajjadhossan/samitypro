'use client';

import React, { useState, useMemo } from 'react';
import { 
  Smartphone, Printer, Search, Plus, CheckCircle2, 
  Clock, ShieldAlert, ArrowUpRight, DollarSign, Users, 
  MapPin, Sliders, Calendar, Receipt, Check, AlertCircle,
  FileText, ArrowRight, RefreshCw, Send, Lock, X
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  FieldCollectorDailyCollection, FieldDayEndSummary, 
  Member, Loan, SavingsAccount 
} from '@/types';
import { formatCurrency, toBengaliNumber } from '@/lib/i18n';
import { ThermalPosReceiptModal } from './ThermalPosReceiptModal';

export function FieldCollectionDeskView() {
  const { 
    members, loans, savingsAccounts, subscriptions,
    fieldCollections, fieldDayEnds, recordFieldCollection, 
    submitFieldDayEndSummary, approveFieldDayEndSummary,
    currentUser, users, activeTenant, thermalPrinterConfig,
    updateThermalPrinterConfig
  } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'COLLECT_DESK' | 'TODAY_LOG' | 'DAY_END_CLOSE'>('COLLECT_DESK');
  const [selectedRoute, setSelectedRoute] = useState<string>('সব রুট / এলাকা');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Collect Modal State
  const [collectingMember, setCollectingMember] = useState<Member | null>(null);
  const [savingsInput, setSavingsInput] = useState<number>(500);
  const [dpsInput, setDpsInput] = useState<number>(0);
  const [loanInput, setLoanInput] = useState<number>(0);
  const [routeInput, setRouteInput] = useState<string>('বনশ্রী ব্লক-সি ও পূর্ব বাজার লেন');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isSubmittingCollect, setIsSubmittingCollect] = useState<boolean>(false);

  // Thermal Slip Modal State
  const [previewCollection, setPreviewCollection] = useState<FieldCollectorDailyCollection | null>(null);

  // Day-End Handover State
  const [cashHandoverInput, setCashHandoverInput] = useState<number>(0);
  const [selectedCashier, setSelectedCashier] = useState<string>('কবীর হোসেন (ক্যাশিয়ার)');
  const [handoverSuccess, setHandoverSuccess] = useState<boolean>(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter available routes
  const routes = [
    'সব রুট / এলাকা',
    'বনশ্রী ব্লক-সি ও পূর্ব বাজার লেন',
    'রামপুরা বাজার ও দক্ষিণ মহল্লা',
    'পূর্ব পাড়া ও উত্তর পাড়া',
    'মোল্লা বাড়ি ও মাদ্রাসা রোড'
  ];

  // Today's collections for the active tenant
  const todayCollections = useMemo(() => {
    return fieldCollections.filter(c => c.date === todayStr);
  }, [fieldCollections, todayStr]);

  const todayTotalAmount = todayCollections.reduce((sum, c) => sum + c.totalCollected, 0);
  const todaySavingsAmount = todayCollections.reduce((sum, c) => sum + c.savingsAmount, 0);
  const todayDpsAmount = todayCollections.reduce((sum, c) => sum + c.dpsAmount, 0);
  const todayLoanAmount = todayCollections.reduce((sum, c) => sum + c.loanInstallmentAmount, 0);

  // Filter members for collect desk
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = 
        m.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery);
      
      const matchesRoute = 
        selectedRoute === 'সব রুট / এলাকা' || 
        (m.presentAddress && m.presentAddress.includes(selectedRoute.split(' ')[0]));

      return matchesSearch && matchesRoute;
    });
  }, [members, searchQuery, selectedRoute]);

  const handleOpenCollectModal = (member: Member) => {
    setCollectingMember(member);
    setRouteInput(selectedRoute !== 'সব রুট / এলাকা' ? selectedRoute : 'বনশ্রী ব্লক-সি ও পূর্ব বাজার লেন');
    
    // Check if member has active loans or DPS
    const activeLoan = loans.find(l => l.memberId === member.id && l.status === 'ACTIVE');
    const emi = activeLoan ? activeLoan.installmentAmount : 0;
    
    setSavingsInput(500);
    setDpsInput(0);
    setLoanInput(emi);
    setNotesInput('');
  };

  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingMember) return;
    if (savingsInput + dpsInput + loanInput <= 0) {
      alert('অনুগ্রহ করে আদায়ের পরিমাণ লিখুন');
      return;
    }

    setIsSubmittingCollect(true);
    setTimeout(() => {
      try {
        const record = recordFieldCollection({
          memberId: collectingMember.id,
          savingsAmount: Number(savingsInput),
          dpsAmount: Number(dpsInput),
          loanInstallmentAmount: Number(loanInput),
          routeOrArea: routeInput,
          paymentMethod: 'CASH',
          notes: notesInput
        });

        setIsSubmittingCollect(false);
        setCollectingMember(null);
        // Automatically open thermal slip preview
        setPreviewCollection(record);
      } catch (err: unknown) {
        setIsSubmittingCollect(false);
        alert((err as Error).message || 'আদায় সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    }, 400);
  };

  const handleSubmitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      submitFieldDayEndSummary({
        routeOrArea: selectedRoute !== 'সব রুট / এলাকা' ? selectedRoute : 'সকল দৈনিক এলাকা',
        cashHandoverAmount: Number(cashHandoverInput || todayTotalAmount),
        handoverToCashierName: selectedCashier
      });
      setHandoverSuccess(true);
      setTimeout(() => setHandoverSuccess(false), 3000);
    } catch (err: unknown) {
      alert((err as Error).message || 'হস্তান্তর সাবমিট করতে সমস্যা হয়েছে');
    }
  };

  const handleApproveHandover = (id: string) => {
    try {
      approveFieldDayEndSummary(
        id, 
        currentUser?.nameBn || 'কবীর হোসেন (ক্যাশিয়ার)',
        'ক্যাশিয়ার কর্তৃক অর্থ সম্পূর্ণভাবে ক্যাশে গ্রহণ করা হয়েছে।'
      );
    } catch (err: unknown) {
      alert((err as Error).message || 'অনুমোদন করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Mobile Dashboard */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Mobile Field Collection Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Bluetooth POS • 58mm / 80mm
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            মাঠকর্মী কালেকশন ও পিওএস রসিদ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            মাঠে গিয়ে বাড়ি বাড়ি সঞ্চয় ও কিস্তি আদায় এবং ব্লুটুথ থার্মাল প্রিন্টারে তাৎক্ষণিক রসিদ প্রদান
          </p>
        </div>

        {/* Quick Top Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">আজকের মোট আদায়</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
              {formatCurrency(todayTotalAmount)}
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">আজকের রসিদ</div>
            <div className="text-base sm:text-lg font-bold text-cyan-400 font-mono">
              {toBengaliNumber(todayCollections.length)} টি
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('COLLECT_DESK')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'COLLECT_DESK'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>দ্রুত আদায় ডেস্ক (Field Desk)</span>
        </button>

        <button
          onClick={() => setActiveTab('TODAY_LOG')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'TODAY_LOG'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>আজকের আদায় তালিকা ({toBengaliNumber(todayCollections.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('DAY_END_CLOSE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'DAY_END_CLOSE'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>দিনশেষে ক্যাশ ক্লোজিং ও হস্তান্তর</span>
        </button>
      </div>

      {/* TAB 1: FIELD COLLECT DESK */}
      {activeTab === 'COLLECT_DESK' && (
        <div className="space-y-4">
          
          {/* Filter Bar: Route Selector & Search */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={selectedRoute}
                onChange={e => setSelectedRoute(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {routes.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="সদস্যের নাম, কোড বা মোবাইল..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Member Collection Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMembers.map(member => {
              const activeLoan = loans.find(l => l.memberId === member.id && l.status === 'ACTIVE');
              const memberAccount = savingsAccounts.find(a => a.memberId === member.id && a.status === 'ACTIVE');
              const currentBalance = memberAccount ? memberAccount.balance : 0;
              const emiDue = activeLoan ? activeLoan.installmentAmount : 0;

              return (
                <div 
                  key={member.id}
                  className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 bg-slate-900/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {member.nameBn}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {member.memberCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {member.phone} • {member.presentAddress || 'বনশ্রী আবাসিক এলাকা'}
                      </div>
                    </div>
                  </div>

                  {/* Account Summary Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div>
                      <div className="text-slate-500">বর্তমান সঞ্চয় স্থিতি:</div>
                      <div className="font-bold text-slate-200">{formatCurrency(currentBalance)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">চলতি ঋণ কিস্তি:</div>
                      <div className="font-bold text-amber-400">
                        {activeLoan ? formatCurrency(emiDue) : 'কোনো ঋণ নেই'}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Quick Collect Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenCollectModal(member)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নগদ আদায় ও রসিদ তৈরি</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: TODAY'S COLLECTIONS LOG */}
      {activeTab === 'TODAY_LOG' && (
        <div className="space-y-4">
          {/* Summary Breakdown Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">মোট নগদ আদায়</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                {formatCurrency(todayTotalAmount)}
              </div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">সঞ্চয় আদায়</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5 font-mono">
                {formatCurrency(todaySavingsAmount)}
              </div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">ডিপিএস কিস্তি আদায়</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5 font-mono">
                {formatCurrency(todayDpsAmount)}
              </div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">ঋণ কিস্তি আদায়</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5 font-mono">
                {formatCurrency(todayLoanAmount)}
              </div>
            </div>
          </div>

          {/* Collections Table */}
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">রসিদ নম্বর</th>
                    <th className="p-3">সদস্যের নাম ও কোড</th>
                    <th className="p-3">এলাকা / রুট</th>
                    <th className="p-3 text-right">সঞ্চয়</th>
                    <th className="p-3 text-right">ডিপিএস</th>
                    <th className="p-3 text-right">ঋণ কিস্তি</th>
                    <th className="p-3 text-right">সর্বমোট নগদ</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {todayCollections.map(col => (
                    <tr key={col.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-cyan-400 font-medium">
                        {col.receiptNo}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{col.memberName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{col.memberCode}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        {col.routeOrArea}
                      </td>
                      <td className="p-3 text-right text-slate-300">
                        {formatCurrency(col.savingsAmount)}
                      </td>
                      <td className="p-3 text-right text-slate-300">
                        {formatCurrency(col.dpsAmount)}
                      </td>
                      <td className="p-3 text-right text-amber-400">
                        {formatCurrency(col.loanInstallmentAmount)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400 font-mono">
                        {formatCurrency(col.totalCollected)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          col.status === 'HANDED_OVER'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {col.status === 'HANDED_OVER' ? 'ক্যাশে জমা সম্পন্ন' : 'মাঠ আদায়কৃত'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setPreviewCollection(col)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          <span>রসিদ</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {todayCollections.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center p-6 text-slate-500">
                        আজকের তারিখে এখনও কোনো মাঠ কালেকশন এন্ট্রি করা হয়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAY-END CASH RECONCILIATION & HANDOVER */}
      {activeTab === 'DAY_END_CLOSE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Handover Submission Form */}
            <div className="lg:col-span-1 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  দিনশেষে নগদ ক্যাশ হস্তান্তর
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  মাঠকর্মীর নিকট থাকা নগদ টাকা ক্যাশিয়ারের নিকট আনুষ্ঠানিকভাবে বুঝিয়ে দিন
                </p>
              </div>

              <form onSubmit={handleSubmitHandover} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    আজকের সংগৃহীত মোট নগদ (হিসাব অনুযায়ী)
                  </label>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-emerald-400 font-mono">
                    {formatCurrency(todayTotalAmount)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ক্যাশিয়ারের নিকট জমাকৃত প্রকৃত টাকা <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={cashHandoverInput || todayTotalAmount}
                    onChange={e => setCashHandoverInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {cashHandoverInput > 0 && cashHandoverInput !== todayTotalAmount && (
                    <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      পার্থক্য (ঘাটতি/উদ্বৃত্ত): {formatCurrency(cashHandoverInput - todayTotalAmount)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ক্যাশিয়ার নির্বাচন করুন <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedCashier}
                    onChange={e => setSelectedCashier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold"
                  >
                    <option value="কবীর হোসেন (ক্যাশিয়ার)">কবীর হোসেন (ক্যাশিয়ার)</option>
                    <option value="মোঃ রফিকুল ইসলাম (সভাপতি)">মোঃ রফিকুল ইসলাম (সভাপতি)</option>
                    <option value="তারিকুল ইসলাম (অ্যাকাউন্ট্যান্ট)">তারিকুল ইসলাম (অ্যাকাউন্ট্যান্ট)</option>
                  </select>
                </div>

                {handoverSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>ক্যাশ হস্তান্তর সফলভাবে সাবমিট হয়েছে! ক্যাশিয়ারের অনুমোদনের অপেক্ষায় রয়েছে।</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>ক্যাশ হস্তান্তর স্লিপ সাবমিট করুন</span>
                </button>
              </form>
            </div>

            {/* Handover History & Cashier Approval Desk */}
            <div className="lg:col-span-2 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  দিনশেষের ক্যাশ সমাপনী ও ক্যাশিয়ার অনুমোদন হিস্টোরি
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  প্রতিদিনের ক্যাশ হস্তান্তর রিকনসিলিয়েশন ও অ্যাকাউন্টস পোস্টিং
                </p>
              </div>

              <div className="space-y-3">
                {fieldDayEnds.map(fde => (
                  <div 
                    key={fde.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{fde.collectorName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {fde.date}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fde.status === 'ACCEPTED_BY_CASHIER'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {fde.status === 'ACCEPTED_BY_CASHIER' ? 'ক্যাশিয়ার কর্তৃক গৃহীত' : 'অনুমোদনের অপেক্ষায়'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        এলাকা: {fde.routeOrArea} • মোট সদস্য ভিজিট: {toBengaliNumber(fde.totalMembersVisited)} জন
                      </div>
                      <div className="text-[11px] text-slate-300">
                        আদায়কৃত ক্যাশ: <strong className="text-emerald-400 font-mono">{formatCurrency(fde.cashHandoverAmount)}</strong> (সঞ্চয়: {formatCurrency(fde.totalSavingsCollected)} | ঋণ: {formatCurrency(fde.totalLoanCollected)})
                      </div>
                      {fde.cashierRemarks && (
                        <div className="text-[10px] text-slate-400 italic">
                          মন্তব্য: {fde.cashierRemarks}
                        </div>
                      )}
                    </div>

                    {fde.status === 'PENDING_HANDOVER' ? (
                      <button
                        type="button"
                        onClick={() => handleApproveHandover(fde.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition shrink-0"
                      >
                        ক্যাশ গ্রহণ নিশ্চিত করুন
                      </button>
                    ) : (
                      <div className="text-right text-[11px] text-slate-400 shrink-0">
                        <div className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          রিকনসাইল্ড
                        </div>
                        <div className="text-[10px]">গ্রহীতা: {fde.handoverToCashierName}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* QUICK COLLECT MODAL */}
      {collectingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    মাঠ নগদ আদায় — {collectingMember.nameBn}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    কোড: {collectingMember.memberCode} • মোবাইল: {collectingMember.phone}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCollectingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmCollection} className="p-4 sm:p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  কালেকশন রুট / এলাকা
                </label>
                <input
                  type="text"
                  value={routeInput}
                  onChange={e => setRouteInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    সাধারণ সঞ্চয় (BDT)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={savingsInput}
                    onChange={e => setSavingsInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-bold text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ডিপিএস কিস্তি (BDT)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={dpsInput}
                    onChange={e => setDpsInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-bold text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ঋণের কিস্তি (BDT)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={loanInput}
                    onChange={e => setLoanInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-bold text-right text-amber-400"
                  />
                </div>
              </div>

              {/* Total Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">সর্বমোট নগদ আদায়:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(Number(savingsInput) + Number(dpsInput) + Number(loanInput))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  মন্তব্য (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সদস্যের দোকানে নগদ গ্রহণ"
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectingMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCollect}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  {isSubmittingCollect ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      সংগ্রহ করুন ও থার্মাল রসিদ দিন
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* POS THERMAL SLIP PREVIEW MODAL */}
      <ThermalPosReceiptModal
        isOpen={Boolean(previewCollection)}
        onClose={() => setPreviewCollection(null)}
        collection={previewCollection}
      />

    </div>
  );
}
