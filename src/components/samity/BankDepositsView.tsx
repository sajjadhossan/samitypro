'use client';

import React, { useState } from 'react';
import { Building2, Plus, CheckCircle2, Clock, Search } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { formatCurrency } from '@/lib/i18n';
import { RecordBankDepositModal } from './RecordBankDepositModal';

export function BankDepositsView() {
  const { bankDeposits, language } = useSamityStore();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalBankBalance = bankDeposits
    .filter(b => b.status === 'APPROVED')
    .reduce((sum, b) => sum + b.amount, 0);

  const filteredDeposits = bankDeposits.filter(b => 
    b.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.accountNumber.includes(searchTerm) ||
    b.slipNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <RecordBankDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>{language === 'bn' ? 'ব্যাংক হিসাব ও ডিপোজিট খতিয়ান' : 'Bank Accounts & Deposits'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'সমিতির সকল ব্যাংক একাউন্টে জমার হিসাব, ডিপোজিট স্লিপ ও রিয়েলটাইম ব্যালান্স নিরীক্ষা' 
              : 'Society bank ledger, deposit slips and real-time bank balance audit'}
          </p>
        </div>

        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন ব্যাংক ডিপোজিট এন্ট্রি' : 'Record Bank Deposit'}</span>
        </button>
      </div>

      {/* Bank Account Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>মোট অনুমোদিত ব্যাংক ব্যালান্স</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {formatCurrency(totalBankBalance, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            মোট জমার সংখ্যা: {bankDeposits.length} টি
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>সোনালী ব্যাংক একাউন্ট</span>
            <span className="font-mono text-[10px] text-slate-500">...0341</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-200">
            ৳ ১,৫০,০০০
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>সচল ও সক্রিয়</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>ইসলামী ব্যাংক একাউন্ট</span>
            <span className="font-mono text-[10px] text-slate-500">...0482</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-200">
            ৳ ২,২০,০০০
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>সচল ও সক্রিয়</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center justify-between text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'ব্যাংক, হিসাব নম্বর বা স্লিপ খুঁজুন...' : 'Search bank or slip...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>
      </div>

      {/* Bank Deposits Ledger Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">ব্যাংক ও শাখা</th>
                <th className="p-3.5">হিসাব নম্বর</th>
                <th className="p-3.5">জমার তারিখ</th>
                <th className="p-3.5">স্লিপ / ভাউচার</th>
                <th className="p-3.5">পরিমাণ (BDT)</th>
                <th className="p-3.5">জমাকারী কর্মকর্তা</th>
                <th className="p-3.5">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeposits.map(dep => {
                const isApproved = dep.status === 'APPROVED';
                return (
                  <tr key={dep.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{dep.bankName}</div>
                      <div className="text-[11px] text-slate-400">{dep.branchName}</div>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400">
                      {dep.accountNumber}
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono">
                      {dep.depositDate}
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-slate-200">{dep.slipNumber}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{dep.voucherNo}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                      ৳ {dep.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div>{dep.depositedBy}</div>
                      {dep.approvedBy && (
                        <div className="text-[10px] text-slate-500">অনুমোদক: {dep.approvedBy}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{isApproved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}</span>
                      </span>
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
