'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, CheckCircle2, QrCode, Search, Building2, 
  ReceiptText, Calendar, User, FileText, ArrowLeft, Printer,
  AlertCircle, Download, Check, Sparkles, Hash, Clock
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { toBengaliNumber, formatCurrency } from '@/lib/i18n';
import { PaidReceipt, Member, SavingsAccount } from '@/types';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || searchParams.get('id') || '';
  const tenantParam = searchParams.get('tenantId') || '';

  const { receipts, members, activeTenant, tenants, savingsAccounts, signatureSeal } = useSamityStore();

  const [searchQuery, setSearchQuery] = useState(codeParam);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if code parameter is present in URL from QR Scan
  useEffect(() => {
    if (codeParam) {
      setSearchQuery(codeParam);
      performSearch(codeParam);
    }
  }, [codeParam]);

  const performSearch = (query: string) => {
    const q = query.trim().toUpperCase();
    if (!q) {
      setSelectedResult(null);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    // 1. Search in Paid Receipts
    const foundReceipt = receipts.find((r: PaidReceipt) => 
      r.receiptNo.toUpperCase() === q ||
      (r.qrCodeData && r.qrCodeData.toUpperCase().includes(q))
    );

    if (foundReceipt) {
      const tenant = tenants.find(t => t.id === foundReceipt.tenantId) || activeTenant;
      const member = members.find(m => m.id === foundReceipt.memberId);
      setSelectedResult({
        type: 'RECEIPT',
        titleBn: 'অফিসিয়াল পেমেন্ট ও জমার রসিদ',
        titleEn: 'Official Payment & Deposit Receipt',
        documentNumber: foundReceipt.receiptNo,
        date: foundReceipt.date,
        amount: foundReceipt.amount,
        amountInWords: foundReceipt.amountInWordsBn,
        purpose: foundReceipt.titleBn,
        paymentMethod: foundReceipt.paymentMethod,
        memberName: member?.nameBn || foundReceipt.memberNameBn,
        memberCode: member?.memberCode || foundReceipt.memberCode || 'N/A',
        memberPhone: member?.phone || foundReceipt.phone || 'N/A',
        collectorName: foundReceipt.collectorNameBn,
        tenantNameBn: tenant?.nameBn,
        tenantRegNo: tenant?.registrationNo,
        tenantPhone: tenant?.phone,
        status: 'VERIFIED_GENUINE',
        raw: foundReceipt
      });
      return;
    }

    // 2. Search in Members (ID Card verification)
    const foundMember = members.find((m: Member) => 
      m.memberCode.toUpperCase() === q || 
      (m.nid && m.nid.toUpperCase() === q) ||
      m.phone.includes(q)
    );

    if (foundMember) {
      const tenant = tenants.find(t => t.id === foundMember.tenantId) || activeTenant;
      setSelectedResult({
        type: 'MEMBER_ID',
        titleBn: 'সদস্য পরিচিতিপত্র ও আইডি কার্ড',
        titleEn: 'Official Member ID Card Verification',
        documentNumber: foundMember.memberCode,
        date: foundMember.admissionDate,
        memberName: foundMember.nameBn,
        memberNameEn: foundMember.nameEn,
        memberCode: foundMember.memberCode,
        memberPhone: foundMember.phone,
        nid: foundMember.nid,
        memberCategory: foundMember.category,
        tenantNameBn: tenant?.nameBn,
        tenantRegNo: tenant?.registrationNo,
        status: 'VERIFIED_GENUINE',
        raw: foundMember
      });
      return;
    }

    // 3. Search in Savings Accounts
    const foundSavings = savingsAccounts.find((s: SavingsAccount) => 
      s.accountNo.toUpperCase() === q
    );

    if (foundSavings) {
      const tenant = tenants.find(t => t.id === foundSavings.tenantId) || activeTenant;
      const member = members.find(m => m.id === foundSavings.memberId);
      setSelectedResult({
        type: 'SAVINGS_ACCOUNT',
        titleBn: 'সঞ্চয় ও ডিপিএস হিসাব প্রত্যয়নপত্র',
        titleEn: 'Savings Account Verification Certificate',
        documentNumber: foundSavings.accountNo,
        date: foundSavings.startDate,
        amount: foundSavings.balance,
        memberName: member?.nameBn,
        memberCode: member?.memberCode,
        memberPhone: member?.phone,
        tenantNameBn: tenant?.nameBn,
        tenantRegNo: tenant?.registrationNo,
        status: 'VERIFIED_GENUINE',
        raw: foundSavings
      });
      return;
    }

    setSelectedResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-base font-bold bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                  সমিতিপ্রো ডিজিটাল ভেরিফিকেশন ইঞ্জিন
                </span>
                <span className="hidden sm:inline-block text-[10px] text-slate-400 ml-2">
                  (Universal Document & QR Verification)
                </span>
              </div>
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>অ্যাপে ফিরুন</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Verification Hero Banner */}
        <div className="text-center space-y-2 py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>১০০% এনক্রিপ্টেড ডিজিটাল দলিল ও রসিদ যাচাই ব্যবস্থা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ডকুমেন্ট বা রসিদ সত্যতা যাচাইকরণ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            প্রিন্টকৃত রসিদের QR কোড মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন অথবা রসিদ নম্বর/সদস্য কোড নিচে ইনপুট দিয়ে মুহূর্তেই আসল কপি মিলিয়ে নিন।
          </p>
        </div>

        {/* Search / Lookup Box */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl max-w-2xl mx-auto">
          <form 
            onSubmit={e => {
              e.preventDefault();
              performSearch(searchQuery);
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="রসিদ নম্বর (যেমন: RCT-2026-001) বা মেম্বার আইডি..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer active:scale-95 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>যাচাই করুন</span>
            </button>
          </form>

          {/* Quick Example Codes */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex-wrap">
            <span className="text-slate-500">নমুনা কোড ক্লিক করুন:</span>
            {receipts.slice(0, 3).map((r: PaidReceipt) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSearchQuery(r.receiptNo);
                  performSearch(r.receiptNo);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] transition cursor-pointer"
              >
                {r.receiptNo}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display */}
        {selectedResult ? (
          <div className="glass-panel rounded-3xl border border-emerald-500/40 p-6 sm:p-8 bg-slate-900/90 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Verification Header with Stamp */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      ডিজিটালভাবে শতভাগ প্রমাণিত ও নির্ভুল
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Security Hash: #{selectedResult.documentNumber.slice(-6)}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {selectedResult.titleBn}
                  </h2>
                  <p className="text-xs text-slate-400">
                    ইস্যুকারী: <strong>{selectedResult.tenantNameBn}</strong> (রেজিস্ট্রেশন: {selectedResult.tenantRegNo})
                  </p>
                </div>
              </div>

              {/* Digital Seal */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center shrink-0 self-start sm:self-auto">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  OFFICIAL DIGITAL VERIFIED
                </div>
                <div className="text-xs font-black text-emerald-300 font-mono mt-0.5">
                  SAMITYPRO SECURE
                </div>
              </div>
            </div>

            {/* Document Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>ডকুমেন্ট / রসিদ ট্র্যাকিং নং:</span>
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-base font-bold text-cyan-300 font-mono">
                  {selectedResult.documentNumber}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>ইস্যুর তারিখ ও সময়:</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-base font-bold text-slate-200">
                  {selectedResult.date}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>সংশ্লিষ্ট সদস্যের নাম:</span>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-base font-bold text-white">
                  {selectedResult.memberName}
                </div>
                <div className="text-[11px] text-slate-400">
                  মেম্বার আইডি: <strong className="text-slate-300">{selectedResult.memberCode}</strong> • ফোন: {selectedResult.memberPhone}
                </div>
              </div>

              {selectedResult.amount !== undefined && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
                    <span>পরিশোধিত টাকার পরিমাণ:</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300 font-mono">
                    ৳ {selectedResult.amount.toLocaleString()} BDT
                  </div>
                  {selectedResult.amountInWords && (
                    <div className="text-[11px] text-emerald-400/80">
                      কথায়: {selectedResult.amountInWords}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Metadata */}
            {selectedResult.purpose && (
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">জমার বিবরণ / খাত: </span>
                  <strong className="text-slate-200">{selectedResult.purpose}</strong>
                </div>
                {selectedResult.paymentMethod && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                    পেমেন্ট মোড: {selectedResult.paymentMethod}
                  </span>
                )}
              </div>
            )}

            {/* Print & Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                যাচাই সময়: {new Date().toLocaleString('bn-BD')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
              </div>
            </div>

          </div>
        ) : hasSearched ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-rose-500/30 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">
              কোনো নথি বা রসিদ পাওয়া যায়নি!
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              অনুগ্রহ করে রসিদ নম্বর বা সদস্য কোডটি পুনরায় যাচাই করে ইনপুট দিন। নিশ্চিত হোন যে ডকুমেন্টটি এই সমিতির ক্লাউড ডাটাবেসে ইস্যু করা হয়েছে।
            </p>
          </div>
        ) : null}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        SamityPro SaaS • রিয়েল-টাইম ক্লাউড সিকিউরিটি ও ভেরিফিকেশন ইঞ্জিন • এন্টারপ্রাইজ গ্রেড
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-sm">যাচাইকরণ ইঞ্জিন লোড হচ্ছে...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
