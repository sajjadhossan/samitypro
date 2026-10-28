'use client';

import React, { useState } from 'react';
import { 
  Printer, X, Smartphone, CheckCircle2, 
  QrCode, Copy, Sliders, ChevronDown
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { FieldCollectorDailyCollection, ThermalPrinterConfig } from '@/types';
import { formatCurrency, toBengaliNumber } from '@/lib/i18n';
import { EscPosDriver } from '@/lib/printer/escpos';

interface ThermalPosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: FieldCollectorDailyCollection | null;
}

export function ThermalPosReceiptModal({
  isOpen,
  onClose,
  collection
}: ThermalPosReceiptModalProps) {
  const { letterhead, thermalPrinterConfig, updateThermalPrinterConfig } = useSamityStore();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(thermalPrinterConfig.paperWidth || '58mm');
  const [isBtPrinting, setIsBtPrinting] = useState(false);

  if (!isOpen || !collection) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleBluetoothPrint = async () => {
    try {
      setIsBtPrinting(true);
      const items = [];
      if (collection.savingsAmount > 0) {
        items.push({ label: 'Savings Deposit', amount: collection.savingsAmount });
      }
      if (collection.dpsAmount > 0) {
        items.push({ label: 'DPS Installment', amount: collection.dpsAmount });
      }
      if (collection.loanInstallmentAmount > 0) {
        items.push({ label: 'Loan Repayment', amount: collection.loanInstallmentAmount });
      }

      const receiptBytes = EscPosDriver.buildReceipt({
        samityName: letterhead.samityNameEn || 'EKOTA SAMITY',
        samityAddress: letterhead.addressEn,
        samityPhone: letterhead.phone,
        receiptNo: collection.receiptNo,
        date: collection.collectedAt,
        collectorName: collection.collectorName,
        memberName: collection.memberName,
        memberNo: collection.memberCode,
        items,
        totalAmount: collection.totalCollected,
        paymentMethod: 'CASH',
        trxId: collection.receiptNo
      }, paperWidth === '80mm');

      const res = await EscPosDriver.printViaBluetooth(receiptBytes);
      alert(res.message);
    } catch (err: unknown) {
      alert(`প্রিন্ট ত্রুটি: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsBtPrinting(false);
    }
  };

  const handleWidthChange = (w: '58mm' | '80mm') => {
    setPaperWidth(w);
    updateThermalPrinterConfig({ paperWidth: w });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">ব্লুটুথ POS থার্মাল রসিদ প্রিভিউ</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 58mm / 80mm Switcher */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px]">
              <button
                type="button"
                onClick={() => handleWidthChange('58mm')}
                className={`px-2 py-0.5 rounded-md font-semibold ${paperWidth === '58mm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => handleWidthChange('80mm')}
                className={`px-2 py-0.5 rounded-md font-semibold ${paperWidth === '80mm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                80mm
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="p-4 sm:p-6 bg-slate-950/50 flex justify-center overflow-y-auto max-h-[75vh]">
          
          {/* Thermal POS Slip Paper */}
          <div 
            id="thermal-pos-slip"
            style={{ width: paperWidth === '58mm' ? '58mm' : '80mm' }}
            className="bg-white text-black p-3.5 shadow-xl font-mono text-[11px] leading-tight selection:bg-none mx-auto select-all border border-slate-300"
          >
            {/* Header / Samity Brand */}
            <div className="text-center space-y-0.5 pb-2">
              <div className="text-xs font-bold uppercase tracking-tight text-black">
                {letterhead.samityNameBn}
              </div>
              <div className="text-[9px] text-gray-700 font-sans">
                {letterhead.addressBn}
              </div>
              <div className="text-[9px] text-gray-700">
                ফোন: {letterhead.phone}
              </div>
              <div className="text-[10px] font-bold border-y border-dashed border-gray-500 py-1 my-1">
                মাঠ কালেকশন নগদ মানি রিসিট
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="space-y-0.5 text-[10px] pb-1.5">
              <div className="flex justify-between">
                <span>রসিদ নং:</span>
                <span className="font-bold">{collection.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>তারিখ-সময়:</span>
                <span>{collection.collectedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>মাঠকর্মী:</span>
                <span className="font-sans truncate max-w-[120px]">{collection.collectorName}</span>
              </div>
              <div className="flex justify-between">
                <span>এলাকা:</span>
                <span className="font-sans truncate max-w-[120px]">{collection.routeOrArea}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-600 my-1"></div>

            {/* Member Details */}
            <div className="space-y-0.5 text-[10px] pb-1.5">
              <div className="flex justify-between font-bold">
                <span>সদস্য:</span>
                <span className="font-sans">{collection.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span>কোড:</span>
                <span>{collection.memberCode}</span>
              </div>
              <div className="flex justify-between">
                <span>মোবাইল:</span>
                <span>{collection.memberPhone}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-600 my-1"></div>

            {/* Collected Items Breakdown */}
            <div className="space-y-1 text-[10px] py-1">
              {collection.savingsAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-sans">সাধারণ সঞ্চয়:</span>
                  <span className="font-bold">{formatCurrency(collection.savingsAmount)}</span>
                </div>
              )}
              {collection.dpsAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-sans">ডিপিএস (DPS) কিস্তি:</span>
                  <span className="font-bold">{formatCurrency(collection.dpsAmount)}</span>
                </div>
              )}
              {collection.loanInstallmentAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-sans">ঋণের কিস্তি (EMI):</span>
                  <span className="font-bold">{formatCurrency(collection.loanInstallmentAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-dashed border-black my-1"></div>

            {/* Grand Total */}
            <div className="flex justify-between text-xs font-black py-1">
              <span>সর্বমোট নগদ:</span>
              <span className="text-sm">{formatCurrency(collection.totalCollected)}</span>
            </div>

            <div className="border-b border-dashed border-gray-600 my-1"></div>

            {/* Signature & Verification QR Placeholder */}
            <div className="pt-4 text-center space-y-2">
              <div className="flex justify-between text-[9px] pt-4">
                <div className="border-t border-gray-400 pt-0.5 px-1 font-sans">
                  সদস্যের স্বাক্ষর
                </div>
                <div className="border-t border-gray-400 pt-0.5 px-1 font-sans">
                  মাঠকর্মীর স্বাক্ষর
                </div>
              </div>

              {thermalPrinterConfig.showQrCode && (
                <div className="pt-1 flex flex-col items-center">
                  <div className="w-16 h-16 border border-gray-400 p-0.5 flex items-center justify-center bg-white rounded shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                        (typeof window !== 'undefined' ? window.location.origin : 'https://samitypro.com') +
                        '/verify?code=' + encodeURIComponent(collection.receiptNo || collection.id)
                      )}`}
                      alt="Verification QR"
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="text-[8px] text-gray-600 mt-0.5 font-sans">
                    স্ক্যান করে অনলাইনে সত্যতা যাচাই করুন
                  </div>
                </div>
              )}

              <div className="text-[9px] text-gray-700 font-sans italic pt-1 border-t border-dashed border-gray-400">
                {thermalPrinterConfig.footerGreetingBn}
              </div>
              <div className="text-[8px] text-gray-500 font-mono">
                Powered by SamityPro Cloud POS
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>প্রিন্টার রেডি ({paperWidth})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition"
              title="ব্রাউজার প্রিন্টার ডায়ালগ"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              ব্রাউজার প্রিন্ট
            </button>
            <button
              type="button"
              onClick={handleBluetoothPrint}
              disabled={isBtPrinting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              <Smartphone className={`w-4 h-4 ${isBtPrinting ? 'animate-bounce' : ''}`} />
              {isBtPrinting ? 'কানেক্ট হচ্ছে...' : 'ব্লুটুথ সরাসরি প্রিন্ট (POS)'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
