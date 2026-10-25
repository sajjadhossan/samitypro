'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, Printer, Download, Calendar, 
  Users, CheckCircle2, FileText, AlertTriangle 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, formatDate } from '@/lib/i18n';

export function ReportsView() {
  const { activeTenant, language, members, loans, savingsTransactions, vouchers } = useSamityStore();
  const t = translations[language];

  const [activeReportType, setActiveReportType] = useState<'COLLECTION_SHEET' | 'PASSBOOK' | 'BALANCE_SHEET' | 'DEFAULTERS'>('COLLECTION_SHEET');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [reportDate, setReportDate] = useState('2026-10-25');

  useEffect(() => {
    setReportDate(new Date().toISOString());
  }, []);

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const selectedMemberTx = savingsTransactions.filter(tx => tx.memberId === selectedMemberId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Report Selector */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-emerald-400" />
            <span>{t.reports}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'মুদ্রণযোগ্য কালেকশন শিট, পাসবই ও ব্যালান্স শিট' 
              : 'Printable and PDF-ready collection sheets, passbooks, and balance sheets'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printReceipt} / {t.downloadPdf}</span>
        </button>
      </div>

      {/* Report Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <button
          onClick={() => setActiveReportType('COLLECTION_SHEET')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeReportType === 'COLLECTION_SHEET'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          দৈনিক কালেকশন শিট (Daily Sheet)
        </button>

        <button
          onClick={() => setActiveReportType('PASSBOOK')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeReportType === 'PASSBOOK'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          সদস্য পাসবই স্টেটমেন্ট (Passbook)
        </button>

        <button
          onClick={() => setActiveReportType('BALANCE_SHEET')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeReportType === 'BALANCE_SHEET'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          আর্থিক ব্যালান্স শিট (Balance Sheet)
        </button>
      </div>

      {/* Member Selector when PASSBOOK is selected */}
      {activeReportType === 'PASSBOOK' && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 no-print text-xs">
          <span className="text-slate-400 font-medium">সদস্য নির্বাচন:</span>
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.memberCode} — {m.nameBn}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Printable Report Document Sheet */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700 bg-slate-900/95 text-slate-100 shadow-2xl">
        
        {/* Printable Official Letterhead */}
        <div className="text-center pb-6 border-b border-slate-700/80 space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">
            {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
          </h1>
          <p className="text-xs text-slate-300">
            সরকারি নিবন্ধন নং: {activeTenant?.registrationNo} • স্থাপিত: {activeTenant?.establishedYear} খ্রিঃ
          </p>
          <p className="text-[11px] text-slate-400">
            কার্যালয়: {activeTenant?.address} • ফোন: {activeTenant?.phone}
          </p>
        </div>

        {/* 1. Daily Collection Sheet Report */}
        {activeReportType === 'COLLECTION_SHEET' && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-200 uppercase tracking-wider">
                দৈনিক মাঠ কালেকশন শিট ও আদায় খতিয়ান
              </span>
              <span className="font-mono text-slate-400">
                তারিখ: {formatDate(reportDate, language)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">সদস্য কোড</th>
                    <th className="py-2.5 px-3">নাম</th>
                    <th className="py-2.5 px-3">মোবাইল</th>
                    <th className="py-2.5 px-3">সঞ্চয় স্থিতি</th>
                    <th className="py-2.5 px-3">আজকের সঞ্চয় আদায়</th>
                    <th className="py-2.5 px-3">কিস্তি আদায়</th>
                    <th className="py-2.5 px-3 text-right">স্বাক্ষর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {members.map(m => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{m.memberCode}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-100">{m.nameBn}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.phone}</td>
                      <td className="py-2.5 px-3">৳ {m.savingsBalance.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">৳ ২,০০০</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">
                        {m.loanOutstanding > 0 ? '৳ ৯,১৬৬' : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans text-slate-500">___________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex justify-between text-xs font-bold border-t border-slate-700 text-emerald-400 font-mono">
              <span>সর্বমোট আনুমানিক দৈনিক আদায়:</span>
              <span>৳ ৩৯,৫০০</span>
            </div>
          </div>
        )}

        {/* 2. Member Passbook Statement */}
        {activeReportType === 'PASSBOOK' && selectedMember && (
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400">সদস্য কোড:</span>{' '}
                <span className="font-mono font-bold text-emerald-400">{selectedMember.memberCode}</span>
              </div>
              <div>
                <span className="text-slate-400">পূর্ণ নাম:</span>{' '}
                <span className="font-bold text-slate-100">{selectedMember.nameBn}</span>
              </div>
              <div>
                <span className="text-slate-400">এনআইডি:</span>{' '}
                <span className="font-mono text-slate-300">{selectedMember.nid}</span>
              </div>
              <div>
                <span className="text-slate-400">শেয়ার সংখ্যা:</span>{' '}
                <span className="font-bold text-purple-300">{selectedMember.sharesHeld} টি (৳ {selectedMember.shareValue.toLocaleString()})</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3">রসিদ নম্বর</th>
                    <th className="py-2 px-3">বিবরণ</th>
                    <th className="py-2 px-3">জমা (+)</th>
                    <th className="py-2 px-3">উত্তোলন (-)</th>
                    <th className="py-2 px-3 text-right">স্থিতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {selectedMemberTx.map(tx => (
                    <tr key={tx.id}>
                      <td className="py-2.5 px-3 text-slate-400">{tx.date}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold">{tx.receiptNo}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-200">{tx.notes}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">+ ৳ {tx.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-500">—</td>
                      <td className="py-2.5 px-3 text-right font-bold text-cyan-400">৳ {tx.balanceAfter.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Balance Sheet */}
        {activeReportType === 'BALANCE_SHEET' && (
          <div className="py-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
              আর্থিক স্থিতিপত্র (Balance Sheet as of {formatDate(reportDate, language)})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Assets */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1 border-b border-slate-700">
                  পরম্পদ / সম্পত্তি (Assets)
                </div>
                <div className="flex justify-between py-1">
                  <span>হাতে নগদ ক্যাশ (Cash in Hand)</span>
                  <span className="font-mono font-bold">৳ ১৮৪,৫০০</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>সোনালী ব্যাংক চলতি হিসাব</span>
                  <span className="font-mono font-bold">৳ ৯৫২,০০০</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>সদস্যদের নিকট মোট বকেয়া ঋণ</span>
                  <span className="font-mono font-bold">৳ ১২৫,০০০</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-700 font-bold text-emerald-400 text-sm">
                  <span>মোট সম্পদ:</span>
                  <span>৳ ১,২৬১,৫০০</span>
                </div>
              </div>

              {/* Liabilities */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider pb-1 border-b border-slate-700">
                  দায় ও মূলধন (Liabilities & Equity)
                </div>
                <div className="flex justify-between py-1">
                  <span>সদস্যদের সাধারণ সঞ্চয় আমানত</span>
                  <span className="font-mono font-bold">৳ ৪৯৯,৫০০</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>ডিপিএস আমানত তহবিল</span>
                  <span className="font-mono font-bold">৳ ৩১২,০০০</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>পরিশোধিত শেয়ার মূলধন</span>
                  <span className="font-mono font-bold">৳ ১০২,০০০</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>সঞ্চিতি ও অবণ্টিত মুনাফা তহবিল</span>
                  <span className="font-mono font-bold">৳ ৩৪৮,০০০</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-700 font-bold text-cyan-400 text-sm">
                  <span>মোট দায় ও মূলধন:</span>
                  <span>৳ ১,২৬১,৫০০</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Signatures */}
        <div className="pt-12 grid grid-cols-3 gap-4 text-center text-xs text-slate-400">
          <div>
            <div className="border-t border-slate-700 pt-1 font-medium">প্রস্তুতকারী (ক্যাশিয়ার)</div>
          </div>
          <div>
            <div className="border-t border-slate-700 pt-1 font-medium">যাচাইকারী (সাধারণ সম্পাদক)</div>
          </div>
          <div>
            <div className="border-t border-slate-700 pt-1 font-medium">অনুমোদনকারী (সভাপতি)</div>
          </div>
        </div>

      </div>

    </div>
  );
}
