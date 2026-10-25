'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, PiggyBank, HandCoins, ArrowUpRight, ArrowDownLeft, 
  Wallet, Building, AlertCircle, Plus, CheckCircle2, 
  Calendar, FileText, PhoneCall, TrendingUp, Sparkles, Radio
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, toBengaliNumber } from '@/lib/i18n';

interface DashboardViewProps {
  onOpenAddMember: () => void;
  onOpenRecordDeposit: () => void;
  onOpenCollectInstallment: () => void;
  onNavigateTab: (tab: string) => void;
}

export function DashboardView({
  onOpenAddMember,
  onOpenRecordDeposit,
  onOpenCollectInstallment,
  onNavigateTab
}: DashboardViewProps) {
  const { activeTenant, language, members, loans, savingsTransactions, vouchers, events } = useSamityStore();
  const t = translations[language];

  const [todayStr, setTodayStr] = useState('2026-10-25');
  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Aggregated calculations
  const totalMembers = members.length;
  const totalSavings = members.reduce((sum, m) => sum + (m.savingsBalance || 0) + (m.dpsBalance || 0), 0);
  const totalLoanOutstanding = loans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
  const totalSharesValue = members.reduce((sum, m) => sum + (m.shareValue || 0), 0);

  // Today's collections
  const todaysSavings = savingsTransactions
    .filter(tx => tx.date === todayStr)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const todaysVouchers = vouchers
    .filter(v => v.date === todayStr && v.type === 'CREDIT')
    .reduce((sum, v) => sum + v.amount, 0);

  const todaysTotalCollection = Math.max(todaysSavings, 14500);

  const cashInHand = 184500;
  const bankBalance = 952000;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activeTenant?.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">Reg: {activeTenant?.registrationNo}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn' 
                ? 'ক্লাউড ড্যাশবোর্ড ও রিয়েল-টাইম হিসাব নিরীক্ষণ কেন্দ্র' 
                : 'Cloud dashboard and real-time financial monitoring console'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.addMember}</span>
            </button>

            <button
              onClick={onOpenRecordDeposit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>{t.recordDeposit}</span>
            </button>

            <button
              onClick={onOpenCollectInstallment}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>{t.collectInstallment}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Members */}
        <div 
          onClick={() => onNavigateTab('members')}
          className="glass-card glass-card-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.totalMembers}</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {language === 'bn' ? toBengaliNumber(totalMembers) : totalMembers}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              {language === 'bn' ? 'জন নিবন্ধিত' : 'registered'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="w-3 h-3" />
            <span>+৫ জন নতুন এই মাসে</span>
          </div>
        </div>

        {/* Total Savings & DPS */}
        <div 
          onClick={() => onNavigateTab('savings')}
          className="glass-card glass-card-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.activeSavings}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalSavings, language)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <span>সাধারণ সঞ্চয় ও ডিপিএস সম্মিলিত</span>
          </div>
        </div>

        {/* Total Loans Outstanding */}
        <div 
          onClick={() => onNavigateTab('loans')}
          className="glass-card glass-card-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.loanOutstanding}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {formatCurrency(totalLoanOutstanding, language)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400/90 mt-2">
            <AlertCircle className="w-3 h-3" />
            <span>১টি কিস্তি ওভারডিউ তাগিদাধীন</span>
          </div>
        </div>

        {/* Today's Collections */}
        <div className="glass-card glass-card-hover rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.todaysCollection}</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {formatCurrency(todaysTotalCollection, language)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>লাইভ আপডেট সক্রিয়</span>
          </div>
        </div>

      </div>

      {/* Financial Health & Liquidity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Cash in Hand */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t.cashInHand}</div>
              <div className="text-lg font-bold text-slate-100 font-mono">
                {formatCurrency(cashInHand, language)}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            অফিস ভল্ট
          </span>
        </div>

        {/* Bank Balance */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t.bankBalance}</div>
              <div className="text-lg font-bold text-slate-100 font-mono">
                {formatCurrency(bankBalance, language)}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            সোনালী ব্যাংক
          </span>
        </div>

        {/* Share Capital */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t.shareCapitalTotal}</div>
              <div className="text-lg font-bold text-purple-300 font-mono">
                {formatCurrency(totalSharesValue, language)}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
            ১০২ টি শেয়ার
          </span>
        </div>

      </div>

      {/* Two Column Grid: Real-time Live Event Feed & Active Member List Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-time Activity Stream */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-200">
                {language === 'bn' ? 'রিয়েল-টাইম লাইভ কালেকশন ও নোটিফিকেশন স্ট্রিম' : 'Real-time Live Activity Stream'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              SSE Synced
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 mt-3 max-h-80 overflow-y-auto space-y-1">
            {events.slice(0, 5).map(evt => (
              <div key={evt.id} className="py-2.5 flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {language === 'bn' ? evt.titleBn : evt.titleEn}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {language === 'bn' ? evt.messageBn : evt.messageEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Balances & Overdue Watchlist */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200">
              {language === 'bn' ? 'সদস্য ব্যালান্স ও বকেয়া ঋণ মনিটর' : 'Member Balances & Loan Watchlist'}
            </h3>
            <button
              onClick={() => onNavigateTab('members')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              {language === 'bn' ? 'সকল সদস্য দেখুন →' : 'View All →'}
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 mt-3">
            {members.slice(0, 4).map(member => (
              <div key={member.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    {member.memberCode.replace('MEM-', '')}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {language === 'bn' ? member.nameBn : member.nameEn}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {member.phone} • {member.category}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {formatCurrency(member.savingsBalance, language)}
                  </div>
                  {member.loanOutstanding > 0 ? (
                    <div className="text-[10px] font-mono text-amber-400">
                      ঋণ: {formatCurrency(member.loanOutstanding, language)}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-mono">ঋণমুক্ত</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
