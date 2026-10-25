'use client';

import React, { useState } from 'react';
import { X, PiggyBank, CheckCircle2, Receipt, Send } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';
import confetti from 'canvas-confetti';

interface RecordDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMemberId?: string;
}

export function RecordDepositModal({ isOpen, onClose, preselectedMemberId }: RecordDepositModalProps) {
  const { store, activeTenant, language, members } = useSamityStore();
  const t = translations[language];

  const [selectedMemberId, setSelectedMemberId] = useState(preselectedMemberId || members[0]?.id || '');
  const [amount, setAmount] = useState<number>(2000);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BKASH' | 'NAGAD' | 'BANK'>('CASH');
  const [notes, setNotes] = useState('মাসিক নিয়মিত সঞ্চয় ও ডিপিএস কিস্তি');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<string>('');

  if (!isOpen) return null;

  const currentMember = members.find(m => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || amount <= 0) return;

    const tx = store.recordSavingsDeposit({
      tenantId: activeTenant.id,
      memberId: selectedMemberId,
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

    setLastReceipt(tx?.receiptNo || 'RCT-SUCCESS');
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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {language === 'bn' ? 'সঞ্চয় ও ডিপিএস জমা গ্রহণ' : 'Record Savings / DPS Deposit'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'তাত্ক্ষণিক রসিদ ও রিয়েলটাইম ব্যালান্স আপডেট' : 'Instant digital receipt & live balance update'}
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
                {language === 'bn' ? 'সঞ্চয় জমা সফলভাবে সংরক্ষিত হয়েছে!' : 'Deposit Recorded Successfully!'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'bn' ? 'রসিদ নম্বর:' : 'Receipt No:'} <span className="font-mono text-emerald-400 font-bold">{lastReceipt}</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>সদস্য:</span>
                <span className="font-semibold text-slate-100">{currentMember?.nameBn} ({currentMember?.memberCode})</span>
              </div>
              <div className="flex justify-between">
                <span>জমার পরিমাণ:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(amount, language)}</span>
              </div>
              <div className="flex justify-between">
                <span>নতুন সঞ্চয় স্থিতি:</span>
                <span className="font-bold text-cyan-400">{formatCurrency(currentMember?.savingsBalance || 0, language)}</span>
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
            {/* Member Selector */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">
                {language === 'bn' ? 'সদস্য নির্বাচন করুন *' : 'Select Member *'}
              </label>
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.memberCode} — {language === 'bn' ? m.nameBn : m.nameEn} (সঞ্চয়: ৳ {m.savingsBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Balance card */}
            {currentMember && (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">বর্তমান সাধারণ সঞ্চয়:</span>
                  <div className="font-bold text-emerald-400 text-sm">{formatCurrency(currentMember.savingsBalance, language)}</div>
                </div>
                <div>
                  <span className="text-slate-400">ডিপিএস স্থিতি:</span>
                  <div className="font-bold text-cyan-400 text-sm">{formatCurrency(currentMember.dpsBalance, language)}</div>
                </div>
                <div>
                  <span className="text-slate-400">শেয়ার সংখ্যা:</span>
                  <div className="font-bold text-amber-400 text-sm">{currentMember.sharesHeld} টি</div>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-medium">
                {language === 'bn' ? 'জমার পরিমাণ (টাকা) *' : 'Deposit Amount (BDT) *'}
              </label>
              <input
                type="number"
                required
                min={50}
                step={50}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-base focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
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
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
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
              <label className="block text-slate-300 text-xs mb-1 font-medium">মন্তব্য বা রেফারেন্স নম্বর</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="যেমন: অক্টোবর মাসের নিয়মিত কিস্তি"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সঞ্চয় জমা নিশ্চিত করুন' : 'Confirm Deposit'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
