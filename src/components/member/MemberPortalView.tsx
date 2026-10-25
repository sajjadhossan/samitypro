'use client';

import React, { useState } from 'react';
import { 
  BookOpen, PiggyBank, HandCoins, CheckCircle2, 
  Send, QrCode, CreditCard, ArrowUpRight, ShieldCheck, 
  Download, Clock, Calendar 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, toBengaliNumber } from '@/lib/i18n';
import confetti from 'canvas-confetti';

export function MemberPortalView() {
  const { store, activeTenant, language, members, loans, savingsTransactions } = useSamityStore();
  const t = translations[language];

  // Demo active logged-in member: Md. Kabir Ahmed (MEM-001)
  const currentMember = members.find(m => m.id === 'mem-001') || members[0];
  const memberLoan = loans.find(l => l.memberId === currentMember?.id && l.status === 'ACTIVE');
  const memberTx = savingsTransactions.filter(tx => tx.memberId === currentMember?.id);

  // Online payment submission modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(2500);
  const [trxId, setTrxId] = useState('');
  const [payGateway, setPayGateway] = useState<'BKASH' | 'NAGAD' | 'BANK'>('BKASH');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId || payAmount <= 0) return;

    store.recordSavingsDeposit({
      tenantId: activeTenant.id,
      memberId: currentMember.id,
      amount: Number(payAmount),
      paymentMethod: payGateway,
      notes: `অনলাইন পেমেন্ট (${payGateway} TrxID: ${trxId})`
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

  return (
    <div className="space-y-6">
      
      {/* Member Hero Digital Passbook Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 bg-gradient-to-tr from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 text-lg font-bold">
                {currentMember?.memberCode.replace('MEM-', '')}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentMember?.memberCode}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentMember?.category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">
                {language === 'bn' ? currentMember?.nameBn : currentMember?.nameEn}
              </h1>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPaymentSuccess(false);
              setShowPaymentModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <CreditCard className="w-4 h-4" />
            <span>{language === 'bn' ? 'অনলাইনে কিস্তি / সঞ্চয় জমা দিন' : 'Pay Online / Submit Slip'}</span>
          </button>
        </div>

        {/* Member Financial Balance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 mb-1">সাধারণ সঞ্চয় স্থিতি</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {formatCurrency(currentMember?.savingsBalance || 0, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">দৈনিক সঞ্চয় খতিয়ান</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 mb-1">ডিপিএস সঞ্চয় তহবিল</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {formatCurrency(currentMember?.dpsBalance || 0, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">মাসিক ২,০০০ টাকা কিস্তি</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 mb-1">শেয়ার মূলধন (১০টি)</div>
            <div className="text-xl font-bold text-purple-300 font-mono">
              {formatCurrency(currentMember?.shareValue || 0, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">১০% বার্ষিক লভ্যাংশ যোগ্য</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 mb-1">বর্তমান বকেয়া ঋণ</div>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {formatCurrency(currentMember?.loanOutstanding || 0, language)}
            </div>
            <div className="text-[10px] text-amber-400/90 mt-0.5">পরবর্তী কিস্তি: ৯,১৬৬ টাকা</div>
          </div>
        </div>

      </div>

      {/* Active Loan Installment Schedule Card */}
      {memberLoan && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-cyan-400" />
                <span>আমার চলমান ঋণ: {memberLoan.loanScheme} ({memberLoan.loanNumber})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                মূল ঋণ ৳ {memberLoan.principalAmount.toLocaleString()} • ১০% মুনাফা • ১২ মাস মেয়াদী
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              {memberLoan.paidInstallments} / {memberLoan.totalInstallments} কিস্তি পরিশোধিত
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>পরিশোধিত: ৳ {memberLoan.totalPaid.toLocaleString()}</span>
              <span>বকেয়া: ৳ {memberLoan.outstandingBalance.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                style={{ width: `${Math.round((memberLoan.paidInstallments / memberLoan.totalInstallments) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Member Passbook Transaction Ledger */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>আমার ডিজিটাল পাসবই লেনদেন খতিয়ান</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">রিয়েল-টাইম ক্লাউড ভেরিফাইড</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">রসিদ নম্বর ও তারিখ</th>
                <th className="py-2.5 px-3">বিবরণ</th>
                <th className="py-2.5 px-3">মাধ্যম</th>
                <th className="py-2.5 px-3">জমার পরিমাণ</th>
                <th className="py-2.5 px-3 text-right">স্থিতি (Balance)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {memberTx.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-emerald-400">{tx.receiptNo}</div>
                    <div className="text-[10px] text-slate-500">{tx.date}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">
                    {tx.notes}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">
                    + {formatCurrency(tx.amount, language)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                    {formatCurrency(tx.balanceAfter, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>অনলাইন সঞ্চয় বা কিস্তি পরিশোধ (bKash / Nagad)</span>
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">পেমেন্ট সফলভাবে গৃহীত হয়েছে!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    আপনার ডিজিটাল পাসবইয়ে তাৎক্ষণিক ৳ {payAmount.toLocaleString()} ক্রেডিট যুক্ত হয়েছে।
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  পাসবই দেখুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnlinePayment} className="space-y-4 py-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">পেমেন্ট গেটওয়ে নির্বাচন করুন</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['BKASH', 'NAGAD', 'BANK'] as const).map(gw => (
                      <button
                        key={gw}
                        type="button"
                        onClick={() => setPayGateway(gw)}
                        className={`py-2 text-xs rounded-lg font-bold border transition ${
                          payGateway === gw 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {gw === 'BKASH' ? 'bKash (বিকাশ)' : gw === 'NAGAD' ? 'Nagad (নগদ)' : 'Bank Transfer'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300">
                  <span className="text-slate-400">সমিতির মার্চেন্ট নম্বর:</span>{' '}
                  <span className="font-mono font-bold text-emerald-400">{activeTenant.phone}</span>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">জমার পরিমাণ (টাকা) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={payAmount}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold font-mono text-base"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">ট্রানজেকশন আইডি (TrxID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: BKH984218X"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs uppercase"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    পেমেন্ট সাবমিট করুন
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
