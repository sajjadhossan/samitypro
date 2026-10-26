'use client';

import React, { useState } from 'react';
import { X, Building2, Plus, Trash2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { BulkDepositItem } from '@/types';

interface BulkBankDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkBankDepositModal({ isOpen, onClose }: BulkBankDepositModalProps) {
  const { language, activeTenant, recordBulkBankDeposits, currentUser } = useSamityStore();

  const [depositorName, setDepositorName] = useState(currentUser.nameBn || 'মো: রফিকুল ইসলাম (ট্রেজারার)');
  const [slips, setSlips] = useState<Omit<BulkDepositItem, 'id' | 'depositorName'>[]>([
    {
      bankName: 'সোনালী ব্যাংক পিএলসি',
      accountNumber: '20501180200341',
      branchName: 'বনশ্রী কর্পোরেট শাখা',
      depositDate: new Date().toISOString().split('T')[0],
      amount: 50000,
      slipNumber: `SLIP-${Date.now().toString().slice(-6)}1`,
      category: 'মাসিক চাঁদা ও ভর্তি ফি ফান্ড'
    },
    {
      bankName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
      accountNumber: '20502390100482',
      branchName: 'রামপুরা শাখা',
      depositDate: new Date().toISOString().split('T')[0],
      amount: 75000,
      slipNumber: `SLIP-${Date.now().toString().slice(-6)}2`,
      category: 'ডিপিএস ও সাধারণ সঞ্চয় তহবিল'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = slips.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const handleAddRow = () => {
    setSlips([
      ...slips,
      {
        bankName: 'সোনালী ব্যাংক পিএলসি',
        accountNumber: '20501180200341',
        branchName: 'বনশ্রী কর্পোরেট শাখা',
        depositDate: new Date().toISOString().split('T')[0],
        amount: 0,
        slipNumber: `SLIP-${Date.now().toString().slice(-5)}`,
        category: 'সাধারণ তহবিল'
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (slips.length <= 1) return;
    setSlips(slips.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: string, value: string | number) => {
    const updated = [...slips];
    updated[index] = { ...updated[index], [field]: value };
    setSlips(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slips.some(s => !s.amount || s.amount <= 0 || !s.slipNumber.trim())) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সকল স্লিপ নম্বর ও সঠিক টাকার পরিমাণ লিখুন।' : 'Please enter valid slip numbers and amounts.');
      return;
    }

    setIsSubmitting(true);
    const bulkItems: BulkDepositItem[] = slips.map((s, idx) => ({
      ...s,
      id: `bulk-item-${Date.now()}-${idx}`,
      depositorName: depositorName.trim()
    }));

    recordBulkBankDeposits(bulkItems, currentUser.nameBn || 'অ্যাডমিন');

    setIsSubmitting(false);
    setSuccessMessage(
      language === 'bn'
        ? `সফলভাবে মোট ${slips.length}টি স্লিপের ৳ ${totalAmount.toLocaleString()} ব্যাংকে জমা রেকর্ড হয়েছে!`
        : `Successfully recorded bulk bank deposit of ${slips.length} slips totaling ৳ ${totalAmount.toLocaleString()}!`
    );

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {language === 'bn' ? 'বাল্ক ব্যাংক ডিপোজিট মডিউল (Bulk Deposit)' : 'Bulk Bank Deposit Module'}
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {language === 'bn' ? 'মাল্টি-স্লিপ ব্যাচ' : 'Multi-Slip Batch'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {activeTenant?.nameBn} • {language === 'bn' ? 'একসাথে একাধিক ব্যাংক স্লিপ ও তহবিল এন্ট্রি' : 'Batch record multiple deposit slips'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-white">{successMessage}</h4>
            <p className="text-sm text-slate-400">
              {language === 'bn' ? 'স্বয়ংক্রিয়ভাবে ব্যাংক ব্যালেন্স ও ভাউচার আপডেট করা হয়েছে।' : 'Bank balance and voucher ledgers updated.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            
            {/* Batch Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'জমা প্রদানকারী (Deposited By)' : 'Depositor Name'}
                </label>
                <input
                  type="text"
                  value={depositorName}
                  onChange={e => setDepositorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-4">
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">{language === 'bn' ? 'মোট ডিপোজিট স্লিপ' : 'Total Slips'}</div>
                  <div className="text-base font-bold text-white">{slips.length} টি</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">{language === 'bn' ? 'সর্বমোট জমার পরিমাণ' : 'Total Amount'}</div>
                  <div className="text-xl font-bold text-emerald-400">৳ {totalAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Slips Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">{language === 'bn' ? 'ব্যাংকের নাম' : 'Bank'}</th>
                      <th className="p-2.5">{language === 'bn' ? 'অ্যাকাউন্ট নং' : 'Account'}</th>
                      <th className="p-2.5">{language === 'bn' ? 'স্লিপ নং' : 'Slip No'}</th>
                      <th className="p-2.5">{language === 'bn' ? 'তহবিলের খাত' : 'Category'}</th>
                      <th className="p-2.5">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                      <th className="p-2.5 text-right">{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'}</th>
                      <th className="p-2.5 text-center">{language === 'bn' ? 'মুছুন' : 'Del'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {slips.map((slip, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="p-2.5 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-2.5">
                          <select
                            value={slip.bankName}
                            onChange={e => handleFieldChange(idx, 'bankName', e.target.value)}
                            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white text-xs w-36"
                          >
                            <option value="সোনালী ব্যাংক পিএলসি">সোনালী ব্যাংক পিএলসি</option>
                            <option value="ইসলামী ব্যাংক বাংলাদেশ পিএলসি">ইসলামী ব্যাংক বাংলাদেশ</option>
                            <option value="ডাচ-বাংলা ব্যাংক পিএলসি">ডাচ-বাংলা ব্যাংক পিএলসি</option>
                            <option value="পূবালী ব্যাংক লিমিটেড">পূবালী ব্যাংক লিমিটেড</option>
                            <option value="অগ্রণী ব্যাংক পিএলসি">অগ্রণী ব্যাংক পিএলসি</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={slip.accountNumber}
                            onChange={e => handleFieldChange(idx, 'accountNumber', e.target.value)}
                            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white text-xs w-32 font-mono"
                            placeholder="Acc No"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={slip.slipNumber}
                            onChange={e => handleFieldChange(idx, 'slipNumber', e.target.value)}
                            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-emerald-400 font-mono text-xs w-28"
                            placeholder="Slip No"
                            required
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={slip.category}
                            onChange={e => handleFieldChange(idx, 'category', e.target.value)}
                            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white text-xs w-36"
                            placeholder="খাত"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="date"
                            value={slip.depositDate}
                            onChange={e => handleFieldChange(idx, 'depositDate', e.target.value)}
                            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white text-xs w-28"
                          />
                        </td>
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            min="1"
                            value={slip.amount || ''}
                            onChange={e => handleFieldChange(idx, 'amount', Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-emerald-400 font-bold text-right text-xs w-24"
                            placeholder="0"
                            required
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            disabled={slips.length <= 1}
                            className={`p-1 rounded text-rose-400 hover:bg-rose-500/20 transition ${slips.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add row bar */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? '+ আরেকটি স্লিপ যোগ করুন' : '+ Add Another Slip'}</span>
                </button>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'স্বয়ংক্রিয় ক্রেডিট ভাউচার তৈরি হবে' : 'Auto credit vouchers created'}</span>
                </div>
              </div>
            </div>

            {/* Verification Note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? 'বাল্ক ডিপোজিট সাবমিট করলে প্রতিটি ব্যাংকের জন্য আলাদা ভাউচার ও ট্রানজাকশন লেজার অবিলম্বে আপডেট হয়ে যাবে।'
                  : 'Submitting bulk deposits will immediately update the respective bank accounts and transaction ledgers.'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalAmount <= 0}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition"
              >
                <Building2 className="w-4 h-4" />
                <span>
                  {language === 'bn'
                    ? `মোট ৳ ${totalAmount.toLocaleString()} ডিপোজিট কনফার্ম করুন`
                    : `Confirm Bulk Deposit ৳ ${totalAmount.toLocaleString()}`}
                </span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
