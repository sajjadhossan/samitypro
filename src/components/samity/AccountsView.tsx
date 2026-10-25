'use client';

import React, { useState } from 'react';
import { 
  ReceiptText, Plus, ArrowUpRight, ArrowDownLeft, 
  Wallet, Building, Filter, CheckCircle2 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';
import { Voucher } from '@/types';

export function AccountsView() {
  const { store, activeTenant, language, vouchers } = useSamityStore();
  const t = translations[language];

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  // Form state
  const [voucherType, setVoucherType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [category, setCategory] = useState('অফিস ও স্টেশনারি খরচ');
  const [amount, setAmount] = useState<number>(3500);
  const [recipient, setRecipient] = useState('');
  const [descBn, setDescBn] = useState('');
  const [method, setMethod] = useState<'CASH' | 'BANK' | 'BKASH'>('CASH');

  const totalCredit = vouchers.filter(v => v.type === 'CREDIT').reduce((s, v) => s + v.amount, 0);
  const totalDebit = vouchers.filter(v => v.type === 'DEBIT').reduce((s, v) => s + v.amount, 0);

  const filteredVouchers = vouchers.filter(v => filterType === 'ALL' || v.type === filterType);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !descBn) return;

    const newVoucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: activeTenant.id,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: voucherType,
      category,
      amount: Number(amount),
      descriptionBn: descBn,
      descriptionEn: descBn,
      paidToOrReceivedFrom: recipient || 'অফিস প্রশাসন',
      paymentMethod: method,
      date: new Date().toISOString().split('T')[0],
      createdBy: store.currentUserId
    };

    store.vouchers.unshift(newVoucher);
    store.addEvent({
      tenantId: activeTenant.id,
      type: 'NEW_VOUCHER_CREATED',
      titleBn: 'নতুন ভাউচার অনুমোদিত',
      titleEn: 'New Voucher Recorded',
      messageBn: `${voucherType === 'DEBIT' ? 'খরচের ভাউচার' : 'জমার ভাউচার'}: ${descBn} (৳ ${amount.toLocaleString()})`,
      messageEn: `Voucher: ${descBn} (৳ ${amount.toLocaleString()})`,
      amount
    });
    store.save();

    setShowVoucherModal(false);
    setDescBn('');
    setRecipient('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-400" />
            <span>{t.accounts}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'ক্যাশ বুক, ব্যাংক হিসাব ও দৈনিক ডেবিট-ক্রেডিট ভাউচার খতিয়ান' 
              : 'Cash book, bank accounts, and daily voucher entries'}
          </p>
        </div>

        <button
          onClick={() => setShowVoucherModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newVoucher}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>মোট জমা ও আয় (Credit)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalCredit, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">সঞ্চয়, ডিপিএস, ভর্তি ফি ও আয়</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>মোট ব্যয় ও খরচ (Debit)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {formatCurrency(totalDebit, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">অফিস ভাড়া, বিল ও ব্যবস্থাপনা ব্যয়</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>হাতে নগদ ক্যাশ স্থিতি</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {formatCurrency(184500, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">ক্যাশ বুক রিকনসিল্ড</div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200">
            {language === 'bn' ? 'ভাউচার খতিয়ান ও হিসাব বিবরনী' : 'Voucher Journal Records'}
          </h3>
          <div className="flex items-center gap-2">
            {(['ALL', 'CREDIT', 'DEBIT'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  filterType === type 
                    ? 'bg-slate-700 border-slate-600 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {type === 'ALL' ? 'সকল' : type === 'CREDIT' ? 'ক্রেডিট (জমা)' : 'ডেবিট (খরচ)'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ভাউচার নম্বর ও তারিখ</th>
                <th className="py-2.5 px-3">ধরন</th>
                <th className="py-2.5 px-3">খাত / ক্যাটাগরি</th>
                <th className="py-2.5 px-3">বিবরণ</th>
                <th className="py-2.5 px-3">মাধ্যম</th>
                <th className="py-2.5 px-3 text-right">পরিমাণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredVouchers.map(v => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{v.voucherNo}</div>
                    <div className="text-[10px] text-slate-500">{v.date}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.type === 'CREDIT' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {v.type === 'CREDIT' ? 'CREDIT' : 'DEBIT'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                    {v.category}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                    {v.descriptionBn}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
                      {v.paymentMethod}
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${
                    v.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {v.type === 'CREDIT' ? '+' : '-'} {formatCurrency(v.amount, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {language === 'bn' ? 'নতুন ভাউচার তৈরি করুন' : 'Create New Voucher'}
              </h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4 py-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">ভাউচারের ধরন</label>
                  <select
                    value={voucherType}
                    onChange={e => setVoucherType(e.target.value as 'DEBIT' | 'CREDIT')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="DEBIT">ডেবিট ভাউচার (ব্যয় / খরচ)</option>
                    <option value="CREDIT">ক্রেডিট ভাউচার (আদায় / জমা)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">টাকার পরিমাণ</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">হিসাবের খাত / ক্যাটাগরি</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">গ্রহীতা / প্রদানকারী ব্যক্তি বা প্রতিষ্ঠান</label>
                <input
                  type="text"
                  value={recipient}
                  placeholder="যেমন: বাড়ির মালিক / সিটি কর্পোরেশন"
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">খরচের বিস্তারিত বিবরণ *</label>
                <textarea
                  required
                  rows={2}
                  value={descBn}
                  onChange={e => setDescBn(e.target.value)}
                  placeholder="ভাউচারের উদ্দেশ্য ও অনুমোদন বিবরণ"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  ভাউচার পোস্ট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
