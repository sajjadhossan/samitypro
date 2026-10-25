'use client';

import React, { useState } from 'react';
import { X, HandCoins, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';
import confetti from 'canvas-confetti';

interface CollectInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLoanId?: string;
}

export function CollectInstallmentModal({ isOpen, onClose, preselectedLoanId }: CollectInstallmentModalProps) {
  const { store, activeTenant, language, loans, members } = useSamityStore();
  const t = translations[language];

  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const [selectedLoanId, setSelectedLoanId] = useState(preselectedLoanId || activeLoans[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BKASH' | 'NAGAD' | 'BANK'>('CASH');
  const [notes, setNotes] = useState('নিয়মিত মাসিক ঋণ কিস্তি পরিশোধ');
  const [isSuccess, setIsSuccess] = useState(false);

  const currentLoan = loans.find(l => l.id === selectedLoanId);
  const currentMember = members.find(m => m.id === currentLoan?.memberId);

  const [amount, setAmount] = useState<number>(currentLoan?.installmentAmount || 9166);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId || amount <= 0) return;

    store.collectLoanInstallment({
      tenantId: activeTenant.id,
      loanId: selectedLoanId,
      amount: Number(amount),
      paymentMethod,
      notes
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HandCoins className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {language === 'bn' ? 'ঋণের কিস্তি আদায় গ্রহণ' : 'Collect Loan EMI / Installment'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'বকেয়া সমন্বয় ও তাত্ক্ষণিক ভাউচার প্রস্তুতকরণ' : 'Auto balance adjustment & voucher creation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">
                {language === 'bn' ? 'কিস্তি আদায় সফলভাবে সম্পন্ন হয়েছে!' : 'EMI Collected Successfully!'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'bn' ? 'হিসাব বই এবং ক্যাশ বুকে অটোমেটিক ক্রেডিট রেকর্ড করা হয়েছে।' : 'Automatically credited into cash book and member ledger.'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>ঋণগ্রহীতা:</span>
                <span className="font-semibold text-slate-100">{currentMember?.nameBn} ({currentLoan?.loanNumber})</span>
              </div>
              <div className="flex justify-between">
                <span>আদায়কৃত কিস্তি:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(amount, language)}</span>
              </div>
              <div className="flex justify-between">
                <span>অবশিষ্ট ঋণ বকেয়া:</span>
                <span className="font-bold text-amber-400">{formatCurrency(currentLoan?.outstandingBalance || 0, language)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                {language === 'bn' ? 'সম্পন্ন হয়েছে' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs sm:text-sm">
            {/* Loan Selector */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">
                {language === 'bn' ? 'চলমান ঋণ হিসাব নির্বাচন করুন *' : 'Select Active Loan *'}
              </label>
              <select
                value={selectedLoanId}
                onChange={e => {
                  setSelectedLoanId(e.target.value);
                  const l = loans.find(x => x.id === e.target.value);
                  if (l) setAmount(l.installmentAmount);
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                {activeLoans.map(l => {
                  const m = members.find(mem => mem.id === l.memberId);
                  return (
                    <option key={l.id} value={l.id}>
                      {l.loanNumber} — {m?.nameBn || 'সদস্য'} (বকেয়া: ৳ {l.outstandingBalance.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Loan snapshot card */}
            {currentLoan && (
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ঋণের উদ্দেশ্য:</span>
                  <span className="font-semibold text-slate-200">{currentLoan.purpose}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">মূল ঋণ ও মুনাফা:</span>
                  <span className="text-slate-300">৳ {currentLoan.principalAmount.toLocaleString()} ({currentLoan.interestRatePercent}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">পরিশোধিত কিস্তি:</span>
                  <span className="font-mono text-cyan-400">{currentLoan.paidInstallments} / {currentLoan.totalInstallments} টি</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-700/80">
                  <span className="text-amber-400 font-semibold">বর্তমান বকেয়া:</span>
                  <span className="font-bold text-amber-400 text-sm font-mono">{formatCurrency(currentLoan.outstandingBalance, language)}</span>
                </div>
              </div>
            )}

            {/* Installment Amount input */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">
                {language === 'bn' ? 'আদায়কৃত টাকার পরিমাণ (টাকা) *' : 'Amount Collected (BDT) *'}
              </label>
              <input
                type="number"
                required
                min={100}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 font-bold text-base focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম *' : 'Payment Method *'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['CASH', 'BKASH', 'NAGAD', 'BANK'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-xs rounded-lg font-medium border transition ${
                      paymentMethod === method
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {method === 'CASH' ? 'ক্যাশ' : method === 'BKASH' ? 'বিকাশ' : method === 'NAGAD' ? 'নগদ' : 'ব্যাংক'}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">মন্তব্য বা রসিদ নোট</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="যেমন: নিয়মিত কিস্তি আদায়"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কিস্তি আদায় নিশ্চিত করুন' : 'Confirm Repayment'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
