'use client';

import React, { useState } from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import confetti from 'canvas-confetti';

interface RecordBankDepositModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const COMMON_BANKS = [
  'সোনালী ব্যাংক পিএলসি',
  'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
  'ডাচ-বাংলা ব্যাংক পিএলসি',
  'ব্র্যাক ব্যাংক পিএলসি',
  'অগ্রণী ব্যাংক পিএলসি',
  'জনতা ব্যাংক পিএলসি',
  'মিউচুয়াল ট্রাস্ট ব্যাংক পিএলসি'
];

interface DepositSuccessProps {
  readonly language: 'bn' | 'en';
  readonly lastVoucher: string;
  readonly onDone: () => void;
}

function DepositSuccessView({ language, lastVoucher, onDone }: DepositSuccessProps) {
  const isBn = language === 'bn';
  return (
    <div className="py-6 text-center space-y-4">
      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto text-cyan-400">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h4 className="text-base font-bold text-slate-100">
          {isBn ? 'ব্যাংক জমা সফলভাবে সংরক্ষিত হয়েছে!' : 'Bank Deposit Recorded Successfully!'}
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          {isBn ? 'ভাউচার নম্বর:' : 'Voucher No:'} <span className="font-mono text-cyan-400 font-bold">{lastVoucher}</span>
        </p>
        <p className="text-xs text-slate-300 mt-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
          {isBn 
            ? '⚡ সভাপতি ও সেক্রেটারির স্ক্রিনে নতুন ব্যালান্স ও জমা রিয়েল-টাইমে দৃশ্যমান হয়েছে।' 
            : '⚡ Live balance updated across all web and mobile sessions.'}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onDone}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
        >
          {isBn ? 'সম্পন্ন / বন্ধ করুন' : 'Done / Close'}
        </button>
      </div>
    </div>
  );
}

export function RecordBankDepositModal({ isOpen, onClose }: RecordBankDepositModalProps) {
  const { store, activeTenant, language } = useSamityStore();

  const [bankName, setBankName] = useState(COMMON_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('20501180200341');
  const [branchName, setBranchName] = useState('বনশ্রী কর্পোরেট শাখা, ঢাকা');
  const [amount, setAmount] = useState<number>(50000);
  const [slipNumber, setSlipNumber] = useState('SLIP-984021');
  const [notes, setNotes] = useState('নিয়মিত চাঁদা ও সঞ্চয় কালেকশন ব্যাংক একাউন্টে জমা');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastVoucher, setLastVoucher] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (amount <= 0 || !slipNumber) return;

    const dep = store.recordBankDeposit({
      tenantId: activeTenant.id,
      bankName,
      accountNumber,
      branchName,
      amount: Number(amount),
      slipNumber,
      notes
    });

    try {
      void confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setLastVoucher(dep.voucherNo);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {language === 'bn' ? 'ব্যাংক ডিপোজিট এন্ট্রি' : 'Record Bank Deposit'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'সমিতির ব্যাংক হিসাবে জমা ও রিয়েলটাইম ব্যালান্স আপডেট' : 'Deposit to bank account with live sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <DepositSuccessView language={language} lastVoucher={lastVoucher} onDone={handleReset} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            
            {/* Bank Name */}
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'ব্যাংকের নাম' : 'Bank Name'}
              </label>
              <select
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {COMMON_BANKS.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            {/* Account & Branch Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  {language === 'bn' ? 'হিসাব নম্বর (Account No)' : 'Account Number'}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  {language === 'bn' ? 'শাখা (Branch Name)' : 'Branch Name'}
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Deposit Amount & Slip Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  {language === 'bn' ? 'জমার পরিমাণ (টাকা)' : 'Deposit Amount (BDT)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-cyan-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  {language === 'bn' ? 'ডিপোজিট স্লিপ নম্বর' : 'Deposit Slip Number'}
                </label>
                <input
                  type="text"
                  value={slipNumber}
                  onChange={e => setSlipNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'মন্তব্য ও বিবরণ' : 'Description & Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'ব্যাংক জমা নিশ্চিত করুন' : 'Confirm Bank Deposit'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
