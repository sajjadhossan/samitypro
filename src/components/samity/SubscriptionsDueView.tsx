'use client';

import React, { useState } from 'react';
import { 
  BadgePercent, Search, CheckCircle2, AlertCircle, 
  Clock, Send, Receipt, Plus, Sliders, Award 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { formatCurrency } from '@/lib/i18n';
import { FeePaymentStatus, PaidReceipt, MonthlySubscription } from '@/types';
import { PrintableReceiptModal } from '@/components/common/PrintableReceiptModal';
import { SubscriptionConfigView } from '@/components/subscriptions/SubscriptionConfigView';
import confetti from 'canvas-confetti';

const getStatusBadgeClass = (status: FeePaymentStatus) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'OVERDUE':
      return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    case 'PARTIAL':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    default:
      return 'bg-slate-700/50 text-slate-300 border border-slate-600';
  }
};

const getStatusLabel = (status: FeePaymentStatus) => {
  switch (status) {
    case 'PAID':
      return 'পরিশোধিত';
    case 'OVERDUE':
      return 'বিলম্বিত বকেয়া';
    case 'PARTIAL':
      return 'আংশিক জমা';
    default:
      return 'বকেয়া';
  }
};

export function SubscriptionsDueView() {
  const { 
    store, 
    activeTenant, 
    language, 
    subscriptions, 
    members, 
    receipts, 
    subscriptionPolicy,
    waiveLateFee 
  } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'BOARD' | 'CONFIG'>('BOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Modal for payment
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectMemberId, setCollectMemberId] = useState(members[0]?.id || '');
  const [collectAmount, setCollectAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK' | 'BKASH' | 'NAGAD'>('CASH');

  // Receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<PaidReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Late Fee Waiver modal state
  const [waiverSub, setWaiverSub] = useState<MonthlySubscription | null>(null);
  const [waiverAmount, setWaiverAmount] = useState<number>(0);
  const [waiverReason, setWaiverReason] = useState<string>('পারিবারিক সংকট বিবেচনায় সভাপতি কর্তৃক মওকুফ');

  // SMS Notification Toast / State
  const [smsAlert, setSmsAlert] = useState<string | null>(null);

  // Filtered by selectedMonth
  const monthSubs = subscriptions.filter(s => s.monthYear === selectedMonth);

  // Calculations
  const totalDueCount = monthSubs.filter(s => s.status !== 'PAID').length;
  const totalPaidCount = monthSubs.filter(s => s.status === 'PAID').length;
  const totalDueAmount = monthSubs.reduce((sum, s) => sum + s.dueAmount, 0);
  const totalCollectedAmount = monthSubs.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalLateFees = monthSubs.reduce((sum, s) => sum + (s.lateFee || 0), 0);

  // Filtered List for Table
  const filteredSubs = monthSubs.filter(sub => {
    const matchesSearch = 
      sub.memberNameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'ALL' || sub.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCollect = (memberId: string, dueAmount?: number) => {
    setCollectMemberId(memberId);
    setCollectAmount(dueAmount && dueAmount > 0 ? dueAmount : 1500);
    setIsCollectModalOpen(true);
  };

  const handleCollectSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!collectMemberId || collectAmount <= 0) return;

    let monthLabel = `${selectedMonth} এর চাঁদা`;
    if (selectedMonth === '2026-10') {
      monthLabel = 'অক্টোবর ২০২৬';
    } else if (selectedMonth === '2026-11') {
      monthLabel = 'নভেম্বর ২০২৬';
    }

    const receipt = store.recordMonthlySubscription({
      tenantId: activeTenant.id,
      memberId: collectMemberId,
      monthYear: selectedMonth,
      monthNameBn: monthLabel,
      amount: Number(collectAmount),
      paymentMethod,
      notes: `${monthLabel} এর মাসিক চাঁদা আদায়`
    });

    try {
      void confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setIsCollectModalOpen(false);
    if (receipt) {
      setActiveReceipt(receipt);
      setIsReceiptModalOpen(true);
    }
  };

  const handleSendReminder = (memberId: string, memberName: string) => {
    store.sendDueReminder({
      tenantId: activeTenant.id,
      memberId,
      channel: 'SMS'
    });

    setSmsAlert(`তাগাদা SMS পাঠানো সম্পন্ন হয়েছে: ${memberName}-এর নম্বরে বকেয়া নোটিফিকেশন ডেলিভার্ড।`);
    setTimeout(() => setSmsAlert(null), 4000);
  };

  const handleViewReceipt = (receiptNo?: string) => {
    if (!receiptNo) return;
    const found = receipts.find(r => r.receiptNo === receiptNo);
    if (found) {
      setActiveReceipt(found);
      setIsReceiptModalOpen(true);
    }
  };

  const handleOpenWaiver = (sub: MonthlySubscription) => {
    setWaiverSub(sub);
    setWaiverAmount(sub.lateFee || 100);
    setWaiverReason('সভাপতি কর্তৃক বিশেষ বিবেচনায় জরিমানা মওকুফ');
  };

  const handleSubmitWaiver = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!waiverSub) return;
    waiveLateFee(waiverSub.id, Number(waiverAmount), waiverReason);
    setSmsAlert(`${waiverSub.memberNameBn} এর ৳ ${waiverAmount} লেট ফি সফলভাবে মওকুফ করা হয়েছে।`);
    setTimeout(() => setSmsAlert(null), 4000);
    setWaiverSub(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
      />

      {/* SMS Alert Toast */}
      {smsAlert && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{smsAlert}</span>
          <button onClick={() => setSmsAlert(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Module Switcher (Board vs Config) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BOARD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'BOARD'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BadgePercent className="w-4 h-4" />
            <span>মাসিক চাঁদা বোর্ড ও বকেয়া খতিয়ান</span>
          </button>

          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'CONFIG'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>চাঁদা ও লেট ফি কনফিগারেশন (মডিউল ৩)</span>
          </button>
        </div>

        {activeTab === 'BOARD' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">মাস নির্বাচন:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono font-bold focus:ring-1 focus:ring-emerald-500"
            >
              <option value="2026-10">অক্টোবর ২০২৬ (2026-10)</option>
              <option value="2026-11">নভেম্বর ২০২৬ (2026-11)</option>
              <option value="2026-12">ডিসেম্বর ২০২৬ (2026-12)</option>
              <option value="2027-01">জানুয়ারি ২০২৭ (2027-01)</option>
            </select>
          </div>
        )}
      </div>

      {/* RENDER CONFIGURATION VIEW */}
      {activeTab === 'CONFIG' ? (
        <SubscriptionConfigView onDuesGenerated={() => setActiveTab('BOARD')} />
      ) : (
        
        /* RENDER SUBSCRIPTIONS BOARD */
        <div className="space-y-6">
          
          {/* Top Header */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-emerald-400" />
                <span>{language === 'bn' ? 'মাসিক চাঁদা ও বকেয়া খতিয়ান' : 'Monthly Subscriptions & Dues'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {selectedMonth}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'সকল সদস্যের মাসিক চাঁদা নির্ধারণ, আদায়, ডিজিটাল মানি রিসিট ও SMS তাগাদা ব্যবস্থাপনা'
                  : 'Monthly fees, dues tracking, automated digital receipts and SMS reminders'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCollect(members[0]?.id || '')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'চাঁদা গ্রহণ ও রসিদ তৈরি' : 'Collect Subscription & Receipt'}</span>
              </button>
            </div>
          </div>

          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">মোট আদায়কৃত চাঁদা</div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(totalCollectedAmount, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>পরিশোধিত সদস্য: {totalPaidCount} জন</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">মোট চলতি বকেয়া</div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-rose-400">
                {formatCurrency(totalDueAmount, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>বকেয়া সদস্য: {totalDueCount} জন</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">নির্ধারিত মাসিক চাঁদা</div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-cyan-400">
                ৳ {(subscriptionPolicy.defaultMonthlyAmount || 1500).toLocaleString()} / সদস্য
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                পরিশোধের শেষ দিন: {subscriptionPolicy.dueDayOfMonth || 10} তারিখ
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">ধার্যকৃত লেট ফি / জরিমানা</div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-amber-400">
                ৳ {totalLateFees.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>গ্রেস পিরিয়ড: {subscriptionPolicy.gracePeriodDays || 5} দিন</span>
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="সদস্যের নাম, কোড অথবা মোবাইল নম্বর দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">সকল স্ট্যাটাস (All)</option>
                <option value="PAID">পরিশোধিত (Paid)</option>
                <option value="UNPAID">বকেয়া (Unpaid)</option>
                <option value="OVERDUE">বিলম্বিত বকেয়া (Overdue)</option>
                <option value="PARTIAL">আংশিক জমা (Partial)</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">সদস্য কোড ও নাম</th>
                    <th className="py-3 px-4">মোবাইল নম্বর</th>
                    <th className="py-3 px-4">মাসিক চাঁদা</th>
                    <th className="py-3 px-4">জরিমানা</th>
                    <th className="py-3 px-4">মোট প্রদেয়</th>
                    <th className="py-3 px-4">পরিশোধিত</th>
                    <th className="py-3 px-4">বকেয়া</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                        এই মাসের জন্য কোনো চাঁদার রেকর্ড পাওয়া যায়নি। &quot;চাঁদা কনফিগারেশন &gt; বকেয়া জেনারেশন ইঞ্জিন&quot; থেকে চাঁদা তৈরি করুন।
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                        
                        {/* Member */}
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-slate-100">{sub.memberNameBn}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">{sub.memberCode}</div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 text-slate-400">{sub.phone}</td>

                        {/* Base Fee */}
                        <td className="py-3 px-4 text-slate-300">৳ {sub.feeAmount.toLocaleString()}</td>

                        {/* Late Fee */}
                        <td className="py-3 px-4">
                          {sub.lateFee > 0 ? (
                            <span className="text-rose-400 font-bold">৳ {sub.lateFee.toLocaleString()}</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-4 font-bold text-slate-100">
                          ৳ {sub.totalAmount.toLocaleString()}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3 px-4 text-emerald-400 font-bold">
                          ৳ {sub.paidAmount.toLocaleString()}
                        </td>

                        {/* Due Amount */}
                        <td className="py-3 px-4">
                          {sub.dueAmount > 0 ? (
                            <span className="text-rose-400 font-bold">৳ {sub.dueAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-emerald-500 text-[11px] font-sans">পরিশোধিত</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(sub.status)}`}>
                            {getStatusLabel(sub.status)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status !== 'PAID' && (
                              <button
                                onClick={() => handleOpenCollect(sub.memberId, sub.dueAmount)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition cursor-pointer"
                              >
                                জমা নিন
                              </button>
                            )}

                            {sub.status === 'OVERDUE' && sub.lateFee > 0 && (
                              <button
                                onClick={() => handleOpenWaiver(sub)}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] transition cursor-pointer"
                                title="জরিমানা মওকুফ"
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {sub.status !== 'PAID' && (
                              <button
                                onClick={() => handleSendReminder(sub.memberId, sub.memberNameBn)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition cursor-pointer"
                                title="SMS তাগাদা পাঠান"
                              >
                                <Send className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                            )}

                            {sub.receiptNo && (
                              <button
                                onClick={() => handleViewReceipt(sub.receiptNo)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition cursor-pointer"
                                title="রসিদ দেখুন ও প্রিন্ট করুন"
                              >
                                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            )}
                          </div>
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

      {/* Collect Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-emerald-400" />
                <span>চাঁদা গ্রহণ ও মানি রিসিট</span>
              </h3>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label htmlFor="collect-member-select" className="block text-slate-300 mb-1 font-medium">সদস্য নির্বাচন করুন</label>
                <select
                  id="collect-member-select"
                  value={collectMemberId}
                  onChange={e => setCollectMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nameBn} ({m.memberCode}) - {m.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="collect-amount-input" className="block text-slate-300 mb-1 font-medium">চাঁদা জমার পরিমাণ (টাকা) *</label>
                <input
                  id="collect-amount-input"
                  type="number"
                  required
                  value={collectAmount}
                  onChange={e => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-base"
                />
              </div>

              <div>
                <label htmlFor="collect-payment-method" className="block text-slate-300 mb-1 font-medium">পরিশোধের মাধ্যম</label>
                <select
                  id="collect-payment-method"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                >
                  <option value="CASH">ক্যাশ / সরাসরি নগদ</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                  <option value="BANK">ব্যাংক ট্রান্সফার / চেক</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                  জমা নিশ্চিত ও রসিদ প্রিন্ট
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Late Fee Waiver Modal */}
      {waiverSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-purple-500/40 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-100">বিলম্ব ফি বা জরিমানা মওকুফ</h3>
              </div>
              <button onClick={() => setWaiverSub(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-300 space-y-1">
              <div>সদস্য: <strong>{waiverSub.memberNameBn}</strong> ({waiverSub.memberCode})</div>
              <div>মাস: {waiverSub.monthNameBn}</div>
              <div>বর্তমানে ধার্যকৃত লেট ফি: <strong className="text-rose-400 font-mono">৳ {waiverSub.lateFee.toLocaleString()}</strong></div>
            </div>

            <form onSubmit={handleSubmitWaiver} className="space-y-3 text-xs">
              <div>
                <label htmlFor="waiver-amount-input" className="block text-slate-300 mb-1 font-medium">মওকুফকৃত জরিমানার পরিমাণ (টাকা) *</label>
                <input
                  id="waiver-amount-input"
                  type="number"
                  min="1"
                  max={waiverSub.lateFee}
                  required
                  value={waiverAmount}
                  onChange={e => setWaiverAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-purple-300 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label htmlFor="waiver-reason-input" className="block text-slate-300 mb-1 font-medium">মওকুফের প্রশাসনিক কারণ *</label>
                <input
                  id="waiver-reason-input"
                  type="text"
                  required
                  value={waiverReason}
                  onChange={e => setWaiverReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setWaiverSub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20"
                >
                  মওকুফ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
