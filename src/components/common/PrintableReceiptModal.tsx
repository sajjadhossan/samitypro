'use client';

import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, QrCode, Download } from 'lucide-react';
import { PaidReceipt, LetterheadConfig } from '@/types';
import { useSamityStore } from '@/lib/store';

interface PrintableReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaidReceipt | null;
}

export function PrintableReceiptModal({ isOpen, onClose, receipt }: PrintableReceiptModalProps) {
  const { letterhead, language } = useSamityStore();

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-300 print:m-0 print:border-none print:shadow-none print:w-full">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'অফিশিয়াল ডিজিটাল রসিদ' : 'Official Money Receipt'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট / PDF ডাউনলোড' : 'Print / Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6" id="printable-area">
          
          {/* Letterhead Header */}
          <div className="text-center border-b-2 border-emerald-700 pb-4 relative">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-widest">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {letterhead.samityNameBn}
            </h1>
            <div className="text-xs font-semibold text-slate-600">
              {letterhead.samityNameEn}
            </div>
            <p className="text-[11px] text-slate-700 font-mono mt-1">
              {letterhead.govtRegNo}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {letterhead.addressBn} | ফোন: {letterhead.phone}
            </p>

            <div className="inline-block mt-3 px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs uppercase tracking-wider">
              {receipt.titleBn} (MONEY RECEIPT)
            </div>
          </div>

          {/* Receipt Meta (No, Date, Method) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">রসিদ নম্বর / Receipt No:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{receipt.receiptNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block">তারিখ / Date:</span>
              <span className="font-semibold text-slate-900">{receipt.date}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 block">পরিশোধের মাধ্যম / Method:</span>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                {receipt.paymentMethod}
              </span>
            </div>
          </div>

          {/* Member & Payment Particulars Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-100/70">
                  <td className="p-2.5 font-bold text-slate-700 w-1/3">সদস্যের নাম (Member Name)</td>
                  <td className="p-2.5 font-semibold text-slate-900">{receipt.memberNameBn} ({receipt.memberCode})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">মোবাইল নম্বর (Contact Phone)</td>
                  <td className="p-2.5 font-mono text-slate-800">{receipt.phone}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-100/70">
                  <td className="p-2.5 font-bold text-slate-700">আদায়ের বিবরণ (Particulars)</td>
                  <td className="p-2.5 text-slate-800">{receipt.notes || 'মাসিক চাঁদা ও নিয়মিত সঞ্চয় জমা'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-700">আদায়কারী কর্মকর্তা (Collector)</td>
                  <td className="p-2.5 text-slate-800">{receipt.collectorNameBn}</td>
                </tr>
                <tr className="bg-emerald-50 text-emerald-950 font-bold">
                  <td className="p-3 text-sm">পরিশোধিত মোট পরিমাণ (Total Amount)</td>
                  <td className="p-3 text-base font-black text-emerald-800 font-mono">
                    ৳ {receipt.amount.toLocaleString()} BDT
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in words */}
          <div className="text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold">কথায় (In Words): </span>
            <span className="font-bold text-slate-800">{receipt.amountInWordsBn}</span>
          </div>

          {/* Verification QR Code & Official Seal & Signature Section */}
          <div className="pt-4 flex items-end justify-between border-t border-slate-200 gap-4">
            
            {/* QR Code Verification */}
            <div className="flex items-center gap-2.5">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg p-1.5 flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ডিজিটাল ভেরিফাইড
                </div>
                <span>QR কোড স্ক্যান করে অনলাইন যাচাই করুন</span>
              </div>
            </div>

            {/* Official Seal Badge */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600 flex items-center justify-center text-center p-1 text-[8px] font-bold text-emerald-800 rotate-[-12deg] bg-emerald-50/50">
                একতা বহুমুখী সমবায় সমিতি<br/>★ ঢাকা ★<br/>রেজিস্টার্ড
              </div>
            </div>

            {/* Signatures */}
            <div className="flex gap-6 text-center text-xs">
              <div>
                <div className="h-10 flex items-end justify-center font-serif italic text-emerald-800 font-bold text-sm">
                  {receipt.collectorNameBn.split(' ')[0]}
                </div>
                <div className="w-24 border-t border-slate-400 pt-1 text-[10px] text-slate-600 font-semibold">
                  আদায়কারী
                </div>
              </div>
              <div>
                <div className="h-10 flex items-end justify-center font-serif italic text-slate-800 font-bold text-sm">
                  সাজ্জাদ
                </div>
                <div className="w-28 border-t border-slate-400 pt-1 text-[10px] text-slate-600 font-semibold">
                  সভাপতি / সম্পাদক
                </div>
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-2 font-mono">
            {letterhead.sloganBn} | এটি সফটওয়্যার কর্তৃক জেনারেটকৃত ডিজিটাল রসিদ
          </div>

        </div>

      </div>
    </div>
  );
}
