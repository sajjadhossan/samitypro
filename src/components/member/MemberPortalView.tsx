'use client';

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, PiggyBank, HandCoins, CheckCircle2, 
  Send, QrCode, CreditCard, ArrowUpRight, ShieldCheck, 
  Download, Clock, Calendar, FileText, Printer,
  User, Phone, MapPin, Award, ChevronRight, PlusCircle,
  FileCheck, AlertCircle, Sparkles, RefreshCw, Eye
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, formatDate, toBengaliNumber } from '@/lib/i18n';
import { ApprovalType, Member } from '@/types';
import confetti from 'canvas-confetti';
import { OnlinePaymentCheckoutModal } from '@/components/payment/OnlinePaymentCheckoutModal';

export function MemberPortalView() {
  const { 
    store, activeTenant, language, members, loans, 
    savingsTransactions, receipts, approvalItems, addApprovalItem
  } = useSamityStore();
  const t = translations[language];

  // Active viewing member state (defaults to mem-001 or first member)
  const [selectedMemberId, setSelectedMemberId] = useState<string>('mem-001');
  const [activeSubTab, setActiveSubTab] = useState<'PASSBOOK' | 'ID_CARD' | 'REQUESTS' | 'PAYMENTS'>('PASSBOOK');

  // Online payment submission modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(2000);
  const [trxId, setTrxId] = useState('');
  const [payGateway, setPayGateway] = useState<'BKASH' | 'NAGAD' | 'BANK'>('BKASH');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // New Request Submission Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<ApprovalType>('LOAN_APPLICATION');
  const [reqAmount, setReqAmount] = useState<number>(50000);
  const [reqPurpose, setReqPurpose] = useState('');
  const [reqGuarantorName, setReqGuarantorName] = useState('');
  const [reqGuarantorPhone, setReqGuarantorPhone] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const tenantId = activeTenant?.id || 'samity-ekota';
  const tenantMembers = useMemo(() => members.filter(m => m.tenantId === tenantId), [members, tenantId]);

  // Current selected member
  const currentMember = useMemo(() => {
    return tenantMembers.find(m => m.id === selectedMemberId) || tenantMembers[0];
  }, [tenantMembers, selectedMemberId]);

  const memberLoans = useMemo(() => {
    return loans.filter(l => l.memberId === currentMember?.id && l.tenantId === tenantId);
  }, [loans, currentMember, tenantId]);

  const activeLoan = useMemo(() => {
    return memberLoans.find(l => l.status === 'ACTIVE');
  }, [memberLoans]);

  const memberTransactions = useMemo(() => {
    return savingsTransactions.filter(tx => tx.memberId === currentMember?.id && tx.tenantId === tenantId);
  }, [savingsTransactions, currentMember, tenantId]);

  const memberReceipts = useMemo(() => {
    return receipts.filter(r => r.memberId === currentMember?.id && r.tenantId === tenantId);
  }, [receipts, currentMember, tenantId]);

  const memberRequests = useMemo(() => {
    return approvalItems.filter(a => a.tenantId === tenantId && (a.referenceId === currentMember?.id || a.details?.memberId === currentMember?.id));
  }, [approvalItems, currentMember, tenantId]);

  // Handle Online Payment
  const handleOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId || payAmount <= 0 || !currentMember) return;

    store.recordSavingsDeposit({
      tenantId,
      memberId: currentMember.id,
      amount: Number(payAmount),
      paymentMethod: payGateway,
      notes: `মেম্বার সেলফ-সার্ভিস পেমেন্ট (${payGateway} TrxID: ${trxId})`
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    setPaymentSuccess(true);
  };

  // Handle New Service Request Submission
  const handleSubmitServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;

    let titleBn = '';
    if (requestType === 'LOAN_APPLICATION') {
      titleBn = `নতুন ঋণ আবেদন (৳ ${Number(reqAmount).toLocaleString()}) - ${reqPurpose || 'ব্যবসা সম্প্রসারণ'}`;
    } else if (requestType === 'SAVINGS_WITHDRAWAL') {
      titleBn = `সঞ্চয় তহবিল থেকে উত্তোলন আবেদন (৳ ${Number(reqAmount).toLocaleString()})`;
    } else if (requestType === 'DPS_OPENING') {
      titleBn = `নতুন ডিপিএস সঞ্চয় স্কিম খোলার আবেদন (মাসিক ৳ ${Number(reqAmount).toLocaleString()})`;
    } else if (requestType === 'CERTIFICATE_REQUEST') {
      titleBn = `সদস্যপদ প্রত্যয়নপত্র ও প্রশংসাপত্র প্রাপ্তির আবেদন`;
    } else {
      titleBn = `সদস্য কেওয়াইসি ও প্রোফাইল হালনাগাদ আবেদন`;
    }

    addApprovalItem({
      tenantId,
      type: requestType,
      titleBn,
      requestedBy: currentMember.nameBn,
      amount: Number(reqAmount) || 0,
      status: 'PENDING',
      referenceId: currentMember.id,
      details: {
        memberId: currentMember.id,
        memberCode: currentMember.memberCode,
        purpose: reqPurpose,
        guarantorName: reqGuarantorName,
        guarantorPhone: reqGuarantorPhone
      }
    });

    store.addEvent({
      tenantId,
      type: 'NEW_MEMBER_JOINED',
      titleBn: 'মেম্বার পোর্টাল থেকে নতুন আবেদন জমা',
      titleEn: 'New Member Service Request',
      messageBn: `${currentMember.nameBn} (${currentMember.memberCode}) এর পক্ষ থেকে নতুন আবেদন: ${titleBn}`,
      messageEn: `Service request submitted by ${currentMember.nameEn}`,
      amount: Number(reqAmount) || 0
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    setRequestSuccess(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Member Switcher & Portal Top Header */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>ডিজিটাল পাসবই ও মেম্বার সেলফ-সার্ভিস পোর্টাল (মডিউল ১০)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <span>সদস্য ব্যক্তিগত পাসবই ও স্মার্ট পোর্টাল</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            সদস্যের সকল সঞ্চয় খতিয়ান, ডিপিএস স্থিতি, ঋণ পরিশোধ ট্র্যাকার, ডিজিটাল আইডি কার্ড ও অনলাইন আবেদন কেন্দ্র
          </p>
        </div>

        {/* Member Selector (for testing/demo/admin view) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">সদস্য প্রোফাইল:</span>
            <select
              value={currentMember?.id || ''}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {tenantMembers.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.memberCode} — {m.nameBn}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            title="পাসবই / আইডি কার্ড প্রিন্ট করুন"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>প্রিন্ট (A4)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-print">
        <button
          onClick={() => setActiveSubTab('PASSBOOK')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'PASSBOOK'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>১. ডিজিটাল পাসবই ও হিসাব খতিয়ান</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ID_CARD')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'ID_CARD'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>২. স্মার্ট ডিজিটাল আইডি কার্ড</span>
        </button>

        <button
          onClick={() => setActiveSubTab('REQUESTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'REQUESTS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>৩. অনলাইন সেবা আবেদন ও ট্র্যাকার</span>
          {memberRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
              {memberRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('PAYMENTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'PAYMENTS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>৪. অনলাইন কিস্তি ও সঞ্চয় জমা</span>
        </button>
      </div>

      {/* ----------------- SUB-TAB 1: DIGITAL PASSBOOK & FINANCIAL OVERVIEW ----------------- */}
      {activeSubTab === 'PASSBOOK' && currentMember && (
        <div className="space-y-6">
          
          {/* Member Hero Digital Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 bg-gradient-to-tr from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 text-lg font-bold">
                    {currentMember.memberCode.replace('MEM-', '')}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {currentMember.memberCode}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {currentMember.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-300">
                      সক্রিয় সদস্য
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
                    {currentMember.nameBn} ({currentMember.nameEn})
                  </h2>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>অনলাইনে কিস্তি / সঞ্চয় জমা দিন</span>
                </button>

                <button
                  onClick={() => {
                    setRequestSuccess(false);
                    setShowRequestModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>নতুন সেবা আবেদন</span>
                </button>
              </div>
            </div>

            {/* Balances Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">সাধারণ সঞ্চয় স্থিতি</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {formatCurrency(currentMember.savingsBalance || 0, language)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>দৈনিক সঞ্চয় খতিয়ান</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">ডিপিএস সঞ্চয় আমানত</div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                  {formatCurrency(currentMember.dpsBalance || 0, language)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">মাসিক ২,০০০ টাকা স্কিম</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">শেয়ার মূলধন ({currentMember.sharesHeld}টি)</div>
                <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
                  {formatCurrency(currentMember.shareValue || 0, language)}
                </div>
                <div className="text-[10px] text-purple-400/80 mt-1">১০% বার্ষিক লভ্যাংশ যোগ্য</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">বর্তমান বকেয়া ঋণ স্থিতি</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {formatCurrency(currentMember.loanOutstanding || 0, language)}
                </div>
                <div className="text-[10px] text-amber-400/90 mt-1">
                  {currentMember.loanOutstanding > 0 ? 'পরবর্তী কিস্তি: ৯,১৬৬ টাকা' : 'কোনো ঋণ বকেয়া নেই'}
                </div>
              </div>
            </div>
          </div>

          {/* Active Loan Installment Schedule Card */}
          {activeLoan && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <HandCoins className="w-4 h-4 text-cyan-400" />
                    <span>চলমান ঋণ: {activeLoan.loanScheme} (হিসাব নং: {activeLoan.loanNumber})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    মূল বিতরণ আসল ৳ {activeLoan.principalAmount.toLocaleString()} • ১০% সার্ভিস চার্জ • ১২ মাস মেয়াদী
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold self-start sm:self-auto">
                  {activeLoan.paidInstallments} / {activeLoan.totalInstallments} কিস্তি পরিশোধিত
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-mono">
                  <span>পরিশোধিত: ৳ {activeLoan.totalPaid.toLocaleString()}</span>
                  <span>অবশিষ্ট বকেয়া: ৳ {activeLoan.outstandingBalance.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((activeLoan.paidInstallments / activeLoan.totalInstallments) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passbook Transactions Ledger */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>ডিজিটাল পাসবই আমানত ও লেনদেন খতিয়ান</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">ক্লাউড ডাটাবেজ ভেরিফাইড</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">রসিদ নম্বর ও তারিখ</th>
                    <th className="py-2.5 px-3">লেনদেনের বিবরণ</th>
                    <th className="py-2.5 px-3">মাধ্যম</th>
                    <th className="py-2.5 px-3 text-right">জমা (+)</th>
                    <th className="py-2.5 px-3 text-right">উত্তোলন (-)</th>
                    <th className="py-2.5 px-3 text-right">চলতি স্থিতি (Balance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {memberTransactions.length > 0 ? (
                    memberTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-emerald-400">{tx.receiptNo}</div>
                          <div className="text-[10px] text-slate-500">{tx.date}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-200">
                          {tx.notes || 'নিয়মিত সঞ্চয় জমা'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-sans">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {tx.type === 'DEPOSIT' ? `+ ${formatCurrency(tx.amount, language)}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400 font-bold">
                          {tx.type === 'WITHDRAWAL' ? `- ${formatCurrency(tx.amount, language)}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-cyan-400">
                          {formatCurrency(tx.balanceAfter, language)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                        এই সদস্যের কোনো লেনদেন খতিয়ান পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Member Paid Receipts Archive */}
          {memberReceipts.length > 0 && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>ডিজিটাল মানি রসিদ ভল্ট (Money Receipts Archive)</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">মোট {memberReceipts.length}টি রসিদ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {memberReceipts.map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-emerald-400 font-mono">{r.receiptNo}</div>
                      <div className="text-[11px] text-slate-300">{r.notes || r.receiptType}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.date} • {r.paymentMethod}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-white font-mono">৳ {r.amount.toLocaleString()}</div>
                      <button 
                        onClick={handlePrint}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 underline mt-1 cursor-pointer block"
                      >
                        প্রিন্ট রসিদ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ----------------- SUB-TAB 2: SMART DIGITAL ID CARD ----------------- */}
      {activeSubTab === 'ID_CARD' && currentMember && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>স্মার্ট ডিজিটাল মেম্বারশিপ কার্ড ও কিউআর সনদ</span>
              </h3>
              <p className="text-xs text-slate-400">
                সমিতির কর্মকর্তা ও ব্যাংকে পরিচিতি যাচাইয়ের জন্য অফিশিয়াল ডিজিটাল মেম্বার কার্ড
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>আইডি কার্ড প্রিন্ট (PVC/A4)</span>
            </button>
          </div>

          {/* Printable Dual-sided ID Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-4 printable-document">
            
            {/* FRONT SIDE */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 border-2 border-emerald-500/40 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                    একতা
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-tight">
                      {activeTenant.nameBn}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      রেজি নং: {activeTenant.registrationNo} • সদস্য পরিচয়পত্র
                    </p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentMember.category}
                </div>
              </div>

              {/* Body */}
              <div className="py-4 flex items-center gap-4">
                <div className="w-20 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg flex-shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                    <User className="w-8 h-8 text-emerald-400 mb-1" />
                    <span className="text-[9px] font-bold text-slate-300 font-mono">ছবি সংযুক্তি</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-mono font-bold text-emerald-400 text-xs">
                    কোড: {currentMember.memberCode}
                  </div>
                  <h3 className="text-sm font-black text-white">
                    {currentMember.nameBn}
                  </h3>
                  <div className="text-[11px] text-slate-300">
                    {currentMember.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    পিতা/স্বামী: {currentMember.fatherHusbandName || 'মো: আব্দুল মালেক'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    মোবাইল: {currentMember.phone}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <div>
                  <span>যোগদান: </span>
                  <span className="font-mono text-slate-200">{currentMember.admissionDate || '2024-01-15'}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-bold">STATUS: ACTIVE</span>
                </div>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-700 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
              
              {/* Back Header */}
              <div className="pb-2 border-b border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                <div className="font-bold text-slate-200">কার্ড ব্যবহারের শর্তাবলী:</div>
                <p>১. এই কার্ডটি সমিতির সম্পত্তি। সদস্যপদ বহাল থাকাকালীন কার্ডটি কার্যকর থাকবে।</p>
                <p>২. কার্ড হারালে বা নষ্ট হলে তাৎক্ষণিক সমিতি কার্যালয়ে অবহিত করতে হবে।</p>
              </div>

              {/* Details with QR */}
              <div className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-400">জাতীয় পরিচয়পত্র (NID): </span>
                    <span className="font-mono text-slate-200">{currentMember.nid}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">রক্তের গ্রুপ: </span>
                    <span className="font-bold text-rose-400 font-mono">B+ (Positive)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">জরুরি যোগাযোগ: </span>
                    <span className="font-mono text-slate-200">{currentMember.nominee?.phone || currentMember.emergencyContactPhone || currentMember.phone}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    ঠিকানা: {currentMember.presentAddress || activeTenant.address}
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="p-2 rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-center shadow-lg flex-shrink-0">
                  <QrCode className="w-14 h-14" />
                  <span className="text-[8px] font-mono font-bold mt-0.5">VERIFIED</span>
                </div>
              </div>

              {/* Back Signatures Footer */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-400">
                <div>
                  <div className="border-t border-slate-700 pt-1 font-sans">সদস্যের স্বাক্ষর</div>
                </div>
                <div>
                  <div className="border-t border-slate-700 pt-1 font-bold text-emerald-400 font-sans">সাধারণ সম্পাদক ও সিল</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB 3: SERVICE REQUESTS & TRACKER ----------------- */}
      {activeSubTab === 'REQUESTS' && currentMember && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>অনলাইন সেবা আবেদন ও লাইভ ট্র্যাকার (Service Requests)</span>
              </h3>
              <p className="text-xs text-slate-400">
                সরাসরি পোর্টাল থেকে ঋণ আবেদন, সঞ্চয় উত্তোলন বা প্রত্যয়নপত্রের রিকোয়েস্ট পাঠান
              </p>
            </div>

            <button
              onClick={() => {
                setRequestSuccess(false);
                setShowRequestModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন আবেদন করুন</span>
            </button>
          </div>

          {/* Requests Status Grid */}
          <div className="space-y-3">
            {memberRequests.length > 0 ? (
              memberRequests.map(req => (
                <div key={req.id} className="p-4 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{req.titleBn}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {req.status === 'APPROVED' ? 'অনুমোদিত (Approved)' :
                         req.status === 'REJECTED' ? 'প্রত্যাখ্যাত (Rejected)' :
                         'বিবেচনাধীন (Pending)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      আবেদনের তারিখ: {req.requestedAt} • আবেদনকারী: {req.requestedBy}
                    </div>
                    {Boolean(req.details?.purpose) && (
                      <div className="text-[11px] text-slate-300">
                        উদ্দেশ্য: {String(req.details?.purpose)}
                      </div>
                    )}
                    {req.rejectionReason && (
                      <div className="text-[11px] text-rose-400 font-medium">
                        মন্তব্য: {req.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {req.amount > 0 && (
                      <div className="text-base font-black text-emerald-400 font-mono">
                        ৳ {req.amount.toLocaleString()}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500">আইডি: {req.id}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">এখনো কোনো সেবা আবেদন করা হয়নি</h4>
                <p className="text-xs text-slate-500">
                  ঋণ, সঞ্চয় উত্তোলন বা প্রত্যয়নপত্রের জন্য উপরের &quot;নতুন আবেদন করুন&quot; বোতামে ক্লিক করুন।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB 4: DIGITAL PAYMENTS & GATEWAY ----------------- */}
      {activeSubTab === 'PAYMENTS' && currentMember && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>অনলাইন পেমেন্ট ও ডিজিটাল রসিদ সাবমিশন</span>
              </h3>
              <p className="text-xs text-slate-400">
                বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে সহজেই মাসিক সঞ্চয় ও কিস্তির টাকা জমা দিন
              </p>
            </div>

            <button
              onClick={() => {
                setPaymentSuccess(false);
                setShowPaymentModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>পেমেন্ট ফর্ম খুলুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-pink-950/20 border border-pink-500/30 space-y-2">
              <div className="text-pink-400 font-black text-base">বিকাশ (bKash) পেমেন্ট</div>
              <p className="text-xs text-slate-300">
                মার্চেন্ট / পার্সোনাল নম্বর: <span className="font-mono font-bold text-white">{activeTenant.phone}</span>
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি (TrxID) সংরক্ষণ করুন।
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-2">
              <div className="text-orange-400 font-black text-base">নগদ (Nagad) পেমেন্ট</div>
              <p className="text-xs text-slate-300">
                মার্চেন্ট নম্বর: <span className="font-mono font-bold text-white">{activeTenant.phone}</span>
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                অ্যাপ বা ইউএসএসডি কোড দিয়ে পাঠিয়ে TrxID ফর্মে ইনপুট দিন।
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="text-cyan-400 font-black text-base">সোনালী / ইসলামী ব্যাংক ট্রান্সফার</div>
              <p className="text-xs text-slate-300">
                হিসাব নং: <span className="font-mono font-bold text-white">২০৫০১২৩৪৫৬৭৮৯০১</span>
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                ব্যাংক ডিপোজিট স্লিপ নম্বর বা রেফারেন্স এন্ট্রি করুন।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- ENTERPRISE ONLINE PAYMENT GATEWAY MODAL ----------------- */}
      <OnlinePaymentCheckoutModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        memberId={currentMember?.id}
      />

      {/* ----------------- MODAL: NEW SERVICE REQUEST ----------------- */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in no-print">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <span>নতুন সেবা আবেদন জমা দিন</span>
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {requestSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">আবেদনটি সফলভাবে জমা হয়েছে!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    সমিতির পরিচালনা পর্ষদ ও অনুমোদক কমিটি পর্যালোচনা করে সিদ্ধান্ত প্রদান করবে। লাইভ ট্র্যাকিং ট্যাবে স্ট্যাটাস দেখতে পারবেন।
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitServiceRequest} className="space-y-4 py-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">আবেদনের ধরন নির্বাচন করুন *</label>
                  <select
                    value={requestType}
                    onChange={e => setRequestType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOAN_APPLICATION">১. নতুন ঋণের আবেদন (Loan Application)</option>
                    <option value="SAVINGS_WITHDRAWAL">২. সঞ্চয় তহবিল থেকে উত্তোলন (Savings Withdrawal)</option>
                    <option value="DPS_OPENING">৩. নতুন ডিপিএস খোলার আবেদন (New DPS Scheme)</option>
                    <option value="CERTIFICATE_REQUEST">৪. সদস্যপদ প্রত্যয়নপত্র আবেদন (Clearance / NOC)</option>
                    <option value="KYC_UPDATE">৫. তথ্য / মোবাইল হালনাগাদ আবেদন (KYC Update)</option>
                  </select>
                </div>

                {(requestType === 'LOAN_APPLICATION' || requestType === 'SAVINGS_WITHDRAWAL' || requestType === 'DPS_OPENING') && (
                  <div>
                    <label className="block text-slate-300 text-xs mb-1 font-medium">
                      {requestType === 'LOAN_APPLICATION' ? 'কাঙ্ক্ষিত ঋণের পরিমাণ (টাকা) *' :
                       requestType === 'SAVINGS_WITHDRAWAL' ? 'উত্তোলনের পরিমাণ (টাকা) *' :
                       'মাসিক ডিপিএস কিস্তির পরিমাণ (টাকা) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={reqAmount}
                      onChange={e => setReqAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono text-base focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">আবেদনের উদ্দেশ্য বা কারণ *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ব্যবসা সম্প্রসারণ বা দোকান সংস্কারের জন্য"
                    value={reqPurpose}
                    onChange={e => setReqPurpose(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {requestType === 'LOAN_APPLICATION' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 text-xs mb-1 font-medium">জামিনদারের নাম</label>
                      <input
                        type="text"
                        placeholder="জামিনদার সদস্যের নাম"
                        value={reqGuarantorName}
                        onChange={e => setReqGuarantorName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1 font-medium">জামিনদারের মোবাইল নম্বর</label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={reqGuarantorPhone}
                        onChange={e => setReqGuarantorPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs"
                  >
                    আবেদন দাখিল করুন
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
