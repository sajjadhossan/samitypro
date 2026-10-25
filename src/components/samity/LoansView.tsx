'use client';

import React from 'react';
import { 
  HandCoins, Plus, AlertCircle, CheckCircle2, 
  Calendar, ArrowUpRight, TrendingUp, ShieldAlert 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';

interface LoansViewProps {
  onOpenCollectInstallment: (loanId?: string) => void;
}

export function LoansView({ onOpenCollectInstallment }: LoansViewProps) {
  const { language, loans, members } = useSamityStore();
  const t = translations[language];

  const totalDisbursed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalRepaid = loans.reduce((sum, l) => sum + l.totalPaid, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-cyan-400" />
            <span>{t.loans}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'ক্ষুদ্র ঋণ বিতরণ, মাসিক কিস্তি আদায় ও বকেয়া হিসাব নিরীক্ষণ' 
              : 'Microfinance disbursement, EMI repayment schedules, and overdue tracking'}
          </p>
        </div>

        <button
          onClick={() => onOpenCollectInstallment()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <HandCoins className="w-4 h-4" />
          <span>{t.collectInstallment}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">মোট বিতরণকৃত ঋণ তহবিল</div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {formatCurrency(totalDisbursed, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{loans.length} টি সচল ও সমাপ্ত ঋণ</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">মোট আদায়কৃত আসল ও মুনাফা</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalRepaid, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">নিয়মিত আদায়কৃত কিস্তি</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">বর্তমান বকেয়া ঋণ স্থিতি</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {formatCurrency(totalOutstanding, language)}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>১টি কিস্তি ওভারডিউ নোটিসে আছে</span>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200">
            {language === 'bn' ? 'চলমান ঋণ হিসাবের তালিকা' : 'Active Loans List'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            মোট সক্রিয় ঋণ: {loans.filter(l => l.status === 'ACTIVE').length} টি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ঋণ নম্বর ও স্কিম</th>
                <th className="py-2.5 px-3">ঋণগ্রহীতা সদস্য</th>
                <th className="py-2.5 px-3">মূল ঋণ ও সুদ</th>
                <th className="py-2.5 px-3">কিস্তির অগ্রগতি</th>
                <th className="py-2.5 px-3">বর্তমান বকেয়া</th>
                <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loans.map(loan => {
                const member = members.find(m => m.id === loan.memberId);
                const progressPercent = Math.round((loan.paidInstallments / (loan.totalInstallments || 1)) * 100);

                return (
                  <tr key={loan.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-cyan-400">{loan.loanNumber}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{loan.loanScheme}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-200">{member?.nameBn}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{member?.memberCode} • {member?.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">৳ {loan.principalAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">{loan.interestRatePercent}% সুদ ({loan.durationMonths} মাস)</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-300">{loan.paidInstallments} / {loan.totalInstallments} কিস্তি</span>
                        <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-400">
                      {formatCurrency(loan.outstandingBalance, language)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenCollectInstallment(loan.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-sans text-xs font-semibold shadow-sm transition"
                      >
                        কিস্তি আদায়
                      </button>
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
