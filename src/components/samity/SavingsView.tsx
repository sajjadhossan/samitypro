'use client';

import React from 'react';
import { 
  PiggyBank, Plus, TrendingUp, Calendar, CreditCard, 
  Receipt, ArrowDownLeft, CheckCircle2 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';

interface SavingsViewProps {
  onOpenRecordDeposit: () => void;
}

export function SavingsView({ onOpenRecordDeposit }: SavingsViewProps) {
  const { language, members, savingsTransactions } = useSamityStore();
  const t = translations[language];

  const totalSavings = members.reduce((sum, m) => sum + m.savingsBalance, 0);
  const totalDps = members.reduce((sum, m) => sum + m.dpsBalance, 0);
  const totalCombined = totalSavings + totalDps;

  return (
    <div className="space-y-6">
      
      {/* Header & Main Action */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-400" />
            <span>{t.savings}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'দৈনিক ও মাসিক সঞ্চয় হিসাব এবং ডিপিএস ডিপোজিট ব্যবস্থাপনা' 
              : 'Daily & monthly savings accounts and DPS schemes management'}
          </p>
        </div>

        <button
          onClick={onOpenRecordDeposit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.recordDeposit}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">মোট সঞ্চয় ও ডিপিএস স্থিতি</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalCombined, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">সর্বমোট আমানত তহবিল</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">সাধারণ সঞ্চয় স্থিতি</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {formatCurrency(totalSavings, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">বাৎসরিক ৮.৫% মুনাফা প্রযোজ্য</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">ডিপিএস (DPS) স্থিতি</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {formatCurrency(totalDps, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">মেয়াদী সঞ্চয় স্কিম</div>
        </div>
      </div>

      {/* Recent Savings Transactions Ledger */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'সাম্প্রতিক সঞ্চয় জমা ও কালেকশন খতিয়ান' : 'Recent Deposit Transactions'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            মোট লেনদেন: {savingsTransactions.length} টি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">রসিদ নম্বর ও তারিখ</th>
                <th className="py-2.5 px-3">সদস্যের নাম</th>
                <th className="py-2.5 px-3">বিবরণ / নোট</th>
                <th className="py-2.5 px-3">মাধ্যম</th>
                <th className="py-2.5 px-3 text-right">জমার পরিমাণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {savingsTransactions.map(tx => {
                const member = members.find(m => m.id === tx.memberId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-emerald-400">{tx.receiptNo}</div>
                      <div className="text-[10px] text-slate-500">{tx.date}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-200">{member?.nameBn || 'সদস্য'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{member?.memberCode}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                      {tx.notes}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      + {formatCurrency(tx.amount, language)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
