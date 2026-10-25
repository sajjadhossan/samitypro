'use client';

import React, { useState } from 'react';
import { 
  BadgePercent, Search, CheckCircle2, AlertCircle, 
  Clock, Send, Receipt, Plus, Printer 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { formatCurrency } from '@/lib/i18n';
import { FeePaymentStatus, PaidReceipt } from '@/types';
import { PrintableReceiptModal } from '@/components/common/PrintableReceiptModal';
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
  const { store, activeTenant, language, subscriptions, members, receipts } = useSamityStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const selectedMonth = '2026-10';

  // Modal for payment
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectMemberId, setCollectMemberId] = useState(members[0]?.id || '');
  const [collectAmount, setCollectAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK' | 'BKASH' | 'NAGAD'>('CASH');

  // Receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<PaidReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // SMS Notification Toast / State
  const [smsAlert, setSmsAlert] = useState<string | null>(null);

  // Calculations
  const totalDueCount = subscriptions.filter(s => s.status !== 'PAID').length;
  const totalPaidCount = subscriptions.filter(s => s.status === 'PAID').length;
  const totalDueAmount = subscriptions.reduce((sum, s) => sum + s.dueAmount, 0);
  const totalCollectedAmount = subscriptions.reduce((sum, s) => sum + s.paidAmount, 0);

  // Filtered List
  const filteredSubs = subscriptions.filter(sub => {
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

  const handleCollectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!collectMemberId || collectAmount <= 0) return;

    const receipt = store.recordMonthlySubscription({
      tenantId: activeTenant.id,
      memberId: collectMemberId,
      monthYear: selectedMonth,
      monthNameBn: 'অক্টোবর ২০২৬',
      amount: Number(collectAmount),
      paymentMethod,
      notes: 'অক্টোবর ২০২৬ মাসের মাসিক চাঁদা আদায়'
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

    setSmsAlert(`তাগাদা SMS পাঠানো সম্পন্ন হয়েছে: ${memberName}-এর নম্বরে ৳ বকেয়া নোটিফিকেশন ডেলিভার্ড।`);
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
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <span>{smsAlert}</span>
          <button onClick={() => setSmsAlert(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-emerald-400" />
            <span>{language === 'bn' ? 'মাসিক চাঁদা ও বকেয়া খতিয়ান' : 'Monthly Subscriptions & Dues'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সকল সদস্যের মাসিক চাঁদা নির্ধারণ, আদায়, ডিজিটাল মানি রিসিট ও SMS তাগাদা ব্যবস্থাপনা'
              : 'Monthly fees, dues tracking, automated digital receipts and SMS reminders'}
          </p>
        </div>

        <button
          onClick={() => handleOpenCollect(members[0]?.id || '')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'চাঁদা গ্রহণ ও রসিদ তৈরি' : 'Collect Subscription & Receipt'}</span>
        </button>
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
            ৳ ১,৫০০ / সদস্য
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            মাস: অক্টোবর ২০২৬
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">আদায়ের শতকরা হার</div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-amber-400">
            {Math.round((totalCollectedAmount / Math.max(1, totalCollectedAmount + totalDueAmount)) * 100)}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-amber-400 h-full rounded-full" 
              style={{ width: `${Math.round((totalCollectedAmount / Math.max(1, totalCollectedAmount + totalDueAmount)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'নাম, সদস্য কোড বা ফোন খুঁজুন...' : 'Search member or phone...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="ALL">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="PAID">{language === 'bn' ? 'পরিশোধিত (Paid)' : 'Paid'}</option>
            <option value="UNPAID">{language === 'bn' ? 'বকেয়া (Unpaid)' : 'Unpaid'}</option>
            <option value="PARTIAL">{language === 'bn' ? 'আংশিক জমা (Partial)' : 'Partial'}</option>
            <option value="OVERDUE">{language === 'bn' ? 'বিলম্বিত বকেয়া (Overdue)' : 'Overdue'}</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">সদস্য তথ্য</th>
                <th className="p-3.5">ধার্য চাঁদা</th>
                <th className="p-3.5">পরিশোধ</th>
                <th className="p-3.5">বকেয়া</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5">রসিদ / মাধ্যম</th>
                <th className="p-3.5 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubs.map(sub => {
                const isPaid = sub.status === 'PAID';
                const isOverdue = sub.status === 'OVERDUE';
                const isPartial = sub.status === 'PARTIAL';

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{sub.memberNameBn}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {sub.memberCode} | {sub.phone}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      ৳ {sub.totalAmount.toLocaleString()}
                      {sub.lateFee > 0 && (
                        <span className="block text-[10px] text-rose-400 font-sans">
                          (+৳{sub.lateFee} জরিমানা)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      ৳ {sub.paidAmount.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-rose-400 font-bold">
                      ৳ {sub.dueAmount.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(sub.status)}`}>
                        {isPaid && <CheckCircle2 className="w-3 h-3" />}
                        {isOverdue && <AlertCircle className="w-3 h-3" />}
                        {isPartial && <Clock className="w-3 h-3" />}
                        <span>{getStatusLabel(sub.status)}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      {sub.receiptNo ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewReceipt(sub.receiptNo)}
                            className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>{sub.receiptNo}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                      {sub.paymentMethod && (
                        <span className="block text-[10px] text-slate-400 mt-0.5 uppercase">
                          via {sub.paymentMethod}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {!isPaid && (
                        <>
                          <button
                            onClick={() => handleOpenCollect(sub.memberId, sub.dueAmount)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition"
                          >
                            চাঁদা গ্রহণ
                          </button>
                          <button
                            onClick={() => handleSendReminder(sub.memberId, sub.memberNameBn)}
                            title="SMS তাগাদা পাঠান"
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-[11px] transition inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>তাগাদা</span>
                          </button>
                        </>
                      )}
                      {isPaid && sub.receiptNo && (
                        <button
                          onClick={() => handleViewReceipt(sub.receiptNo)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3 text-emerald-400" />
                          <span>রসিদ প্রিন্ট</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Subscription Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ৳
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">মাসিক চাঁদা গ্রহণ</h3>
                  <p className="text-xs text-slate-400">অটোমেটিক মানি রিসিট প্রস্তুত হবে</p>
                </div>
              </div>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label htmlFor="collect-member-select" className="block text-slate-300 font-medium mb-1.5">সদস্য নির্বাচন করুন</label>
                <select
                  id="collect-member-select"
                  value={collectMemberId}
                  onChange={e => setCollectMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nameBn} ({m.memberCode}) - {m.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="collect-amount-input" className="block text-slate-300 font-medium mb-1.5">আদায়ের পরিমাণ (৳)</label>
                  <input
                    id="collect-amount-input"
                    type="number"
                    min="1"
                    value={collectAmount}
                    onChange={e => setCollectAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="collect-payment-method" className="block text-slate-300 font-medium mb-1.5">পেমেন্ট মাধ্যম</label>
                  <select
                    id="collect-payment-method"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as 'CASH' | 'BANK' | 'BKASH' | 'NAGAD')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CASH">ক্যাশ (নগদ)</option>
                    <option value="BKASH">বিকাশ (bKash)</option>
                    <option value="NAGAD">নগদ (Nagad)</option>
                    <option value="BANK">ব্যাংক স্থানান্তর</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300">
                ⚡ চাঁদা গ্রহণ সম্পন্ন হওয়ামাত্রই ডিজিটাল মানি রিসিট স্ক্রিনে চলে আসবে এবং অন্যান্য সকল এডমিন স্ক্রিনে রিয়েল-টাইমে আপডেট হয়ে যাবে।
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>চাঁদা জমা নিশ্চিত ও রসিদ তৈরি</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
