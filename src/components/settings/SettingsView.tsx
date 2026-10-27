'use client';

import React, { useState } from 'react';
import { 
  Building2, Sliders, Stamp, Printer, CheckCircle2, 
  Save, FileText, Globe, DollarSign, Calendar, Eye, RefreshCw
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { PrintPaperSize, TenantType, APP_VERSION } from '@/types';
import { LetterheadDesigner } from './LetterheadDesigner';
import { UpdateCheckModal } from '@/components/common/UpdateCheckModal';

export function SettingsView() {
  const { 
    language, 
    activeTenant, 
    signatureSeal, 
    voucherPrefix, 
    updateSignatureSeal, 
    updateVoucherPrefix, 
    updateTenantProfile 
  } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'samity-setup' | 'voucher-prefix' | 'signatures' | 'letterhead'>('samity-setup');
  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Samity Setup Form State
  const [samityForm, setSamityForm] = useState({
    nameBn: activeTenant?.nameBn || '',
    nameEn: activeTenant?.nameEn || '',
    registrationNo: activeTenant?.registrationNo || '',
    establishedYear: activeTenant?.establishedYear || 2018,
    type: activeTenant?.type || 'SAMITY',
    phone: activeTenant?.phone || '',
    email: activeTenant?.email || '',
    address: activeTenant?.address || '',
  });

  // Voucher & Prefix State
  const [prefixForm, setPrefixForm] = useState({
    receiptPrefix: voucherPrefix.receiptPrefix || 'RCT-',
    memberCodePrefix: voucherPrefix.memberCodePrefix || 'MEM-',
    depositPrefix: voucherPrefix.depositPrefix || 'DEP-',
    expensePrefix: voucherPrefix.expensePrefix || 'EXP-',
    loanPrefix: voucherPrefix.loanPrefix || 'LN-',
    nextReceiptNumber: voucherPrefix.nextReceiptNumber || 98214,
    currencySymbol: voucherPrefix.currencySymbol || '৳',
    fiscalYear: voucherPrefix.fiscalYear || '2026-2027',
    paperSize: voucherPrefix.paperSize || 'A4',
    enableWatermark: voucherPrefix.enableWatermark ?? true,
    watermarkTextBn: voucherPrefix.watermarkTextBn || 'একতা বহুমুখী সমবায় সমিতি লিঃ',
    footerNoteBn: voucherPrefix.footerNoteBn || 'এটি একটি কম্পিউটার জেনারেটেড ডিজিটাল রসিদ।',
  });

  // Signature & Seal State
  const [sealForm, setSealForm] = useState({
    presidentName: signatureSeal.presidentName || 'ইঞ্জিঃ সাজ্জাদ হোসাইন',
    presidentTitleBn: signatureSeal.presidentTitleBn || 'সভাপতি (President)',
    secretaryName: signatureSeal.secretaryName || 'মো: আব্দুল করিম',
    secretaryTitleBn: signatureSeal.secretaryTitleBn || 'সাধারণ সম্পাদক (General Secretary)',
    cashierName: signatureSeal.cashierName || 'মো: রফিকুল ইসলাম',
    cashierTitleBn: signatureSeal.cashierTitleBn || 'ক্যাশিয়ার / ট্রেজারার (Cashier & Treasurer)',
    sealTextBn: signatureSeal.sealTextBn || 'একতা বহুমুখী সমবায় সমিতি লিঃ * রেজিস্টার্ড',
    showSignatureOnReceipt: signatureSeal.showSignatureOnReceipt ?? true,
    showSealOnReceipt: signatureSeal.showSealOnReceipt ?? true,
  });

  const showNotification = (msg: string) => {
    setSaveAlert(msg);
    setTimeout(() => setSaveAlert(null), 2500);
  };

  const handleSaveSamity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;
    updateTenantProfile(activeTenant.id, {
      ...samityForm,
      type: samityForm.type as TenantType
    });
    showNotification(language === 'bn' ? 'সমিতি সেটআপ ও প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!' : 'Samity setup profile saved successfully!');
  };

  const handleSavePrefix = (e: React.FormEvent) => {
    e.preventDefault();
    updateVoucherPrefix({
      ...prefixForm,
      paperSize: prefixForm.paperSize as PrintPaperSize
    });
    showNotification(language === 'bn' ? 'ভাউচার প্রিফিক্স ও প্রিন্ট কনফিগারেশন সংরক্ষিত হয়েছে!' : 'Voucher prefix configuration saved!');
  };

  const handleSaveSeal = (e: React.FormEvent) => {
    e.preventDefault();
    updateSignatureSeal(sealForm);
    showNotification(language === 'bn' ? 'ডিজিটাল সিল ও স্বাক্ষর সেটিংস সংরক্ষিত হয়েছে!' : 'Signatures & seal settings saved!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>{language === 'bn' ? 'সেটিংস ও কনফিগারেশন সেন্টার' : 'Settings & Configuration Center'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সমিতি সেটআপ, ভাউচার প্রিফিক্স, সিল ও স্বাক্ষর এবং প্রিন্ট লেটারহেড পরিচালনা'
              : 'Samity setup, voucher prefix, seal/signatures and letterhead customization'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveAlert && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveAlert}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-xs text-slate-300 border border-slate-700 transition cursor-pointer active:scale-95 shadow-sm"
            title={language === 'bn' ? 'সফটওয়্যার আপডেট চেক করুন' : 'Check for software updates'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-cyan-300">{APP_VERSION}</span>
            <span className="text-[11px] text-slate-400 ml-1">
              {language === 'bn' ? 'আপডেট চেক' : 'Check Update'}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('samity-setup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'samity-setup'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{language === 'bn' ? '১. সমিতি সেটআপ ও প্রোফাইল' : '1. Samity Profile'}</span>
        </button>

        <button
          onClick={() => setActiveTab('voucher-prefix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'voucher-prefix'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'bn' ? '২. ভাউচার প্রিফিক্স ও কোড' : '2. Voucher Prefixes'}</span>
        </button>

        <button
          onClick={() => setActiveTab('signatures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'signatures'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span>{language === 'bn' ? '৩. ডিজিটাল স্বাক্ষর ও সিল' : '3. Signature & Seal'}</span>
        </button>

        <button
          onClick={() => setActiveTab('letterhead')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'letterhead'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>{language === 'bn' ? '৪. প্যাড ও প্রিন্ট টেমপ্লেট' : '4. Print & Letterhead'}</span>
        </button>
      </div>

      {/* TAB 1: Samity Setup & Profile */}
      {activeTab === 'samity-setup' && (
        <form onSubmit={handleSaveSamity} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'সমিতির অফিশিয়াল পরিচিতি ও সেটআপ' : 'Official Samity Profile & Onboarding'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'সরকারি রেজিস্ট্রেশন, নাম ও প্রধান কার্যালয়ের তথ্য' : 'Govt registration, organization name and office info'}
              </p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Save Profile'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'সমিতির পূর্ণ নাম (বাংলায়)' : 'Samity Full Name (Bangla)'}
              </label>
              <input
                type="text"
                value={samityForm.nameBn}
                onChange={e => setSamityForm({ ...samityForm, nameBn: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'সমিতির নাম (ইংরেজিতে)' : 'Samity Name (English)'}
              </label>
              <input
                type="text"
                value={samityForm.nameEn}
                onChange={e => setSamityForm({ ...samityForm, nameEn: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'সরকারি রেজিস্ট্রেশন / নিবন্ধন নম্বর' : 'Govt Registration Number'}
              </label>
              <input
                type="text"
                value={samityForm.registrationNo}
                onChange={e => setSamityForm({ ...samityForm, registrationNo: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'প্রতিষ্ঠার সন (Established Year)' : 'Established Year'}
              </label>
              <input
                type="number"
                value={samityForm.establishedYear}
                onChange={e => setSamityForm({ ...samityForm, establishedYear: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'সংগঠনের ধরন (Organization Type)' : 'Organization Type'}
              </label>
              <select
                value={samityForm.type}
                onChange={e => setSamityForm({ ...samityForm, type: e.target.value as TenantType })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="SAMITY">সমবায় সমিতি (Co-operative Society)</option>
                <option value="CLUB">ক্লাব ও ক্রীড়া সংগঠন (Club & Sports)</option>
                <option value="ASSOCIATION">পেশাজীবী ও ব্যবসায়ী সমিতি (Trade Association)</option>
                <option value="SAVINGS_GROUP">ক্ষুদ্র ঋণ ও সঞ্চয় দল (Micro-Savings)</option>
                <option value="COMMITTEE">পরিচালনা কমিটি (Management Committee)</option>
                <option value="CHARITY">দাতব্য ও কল্যাণ সংস্থা (Welfare / NGO)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'অফিসিয়াল ফোন / মোবাইল' : 'Official Phone Number'}
              </label>
              <input
                type="text"
                value={samityForm.phone}
                onChange={e => setSamityForm({ ...samityForm, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Email Address'}
              </label>
              <input
                type="email"
                value={samityForm.email}
                onChange={e => setSamityForm({ ...samityForm, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'প্রধান কার্যালয়ের ঠিকানা' : 'Head Office Address'}
              </label>
              <input
                type="text"
                value={samityForm.address}
                onChange={e => setSamityForm({ ...samityForm, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Voucher & Prefix Config */}
      {activeTab === 'voucher-prefix' && (
        <form onSubmit={handleSavePrefix} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'ভাউচার প্রিফিক্স ও সিরিয়াল কনফিগারেশন' : 'Voucher Prefixes & Sequences'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'রসিদ, সদস্য কোড ও অ্যাকাউন্টের সিরিয়াল ফরম্যাট' : 'Customize receipt number and member code prefixes'}
              </p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'প্রিফিক্স সেভ করুন' : 'Save Prefixes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'মানি রসিদ প্রিফিক্স (Receipt Prefix)' : 'Money Receipt Prefix'}
              </label>
              <input
                type="text"
                value={prefixForm.receiptPrefix}
                onChange={e => setPrefixForm({ ...prefixForm, receiptPrefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">উদাহরণ: {prefixForm.receiptPrefix}98214</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'সদস্য কোড প্রিফিক্স (Member ID Prefix)' : 'Member ID Prefix'}
              </label>
              <input
                type="text"
                value={prefixForm.memberCodePrefix}
                onChange={e => setPrefixForm({ ...prefixForm, memberCodePrefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">উদাহরণ: {prefixForm.memberCodePrefix}001</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'ব্যাংক জমা ভাউচার প্রিফিক্স (Deposit Prefix)' : 'Deposit Voucher Prefix'}
              </label>
              <input
                type="text"
                value={prefixForm.depositPrefix}
                onChange={e => setPrefixForm({ ...prefixForm, depositPrefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-indigo-400 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">উদাহরণ: {prefixForm.depositPrefix}2026-01</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'খরচ ভাউচার প্রিফিক্স (Expense Prefix)' : 'Expense Voucher Prefix'}
              </label>
              <input
                type="text"
                value={prefixForm.expensePrefix}
                onChange={e => setPrefixForm({ ...prefixForm, expensePrefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">উদাহরণ: {prefixForm.expensePrefix}1042</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'ঋণ হিসাব নম্বর প্রিফিক্স (Loan Prefix)' : 'Loan Prefix'}
              </label>
              <input
                type="text"
                value={prefixForm.loanPrefix}
                onChange={e => setPrefixForm({ ...prefixForm, loanPrefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-rose-400 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">উদাহরণ: {prefixForm.loanPrefix}0089</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'চলতি অর্থবছর (Fiscal Year)' : 'Fiscal Year'}
              </label>
              <input
                type="text"
                value={prefixForm.fiscalYear}
                onChange={e => setPrefixForm({ ...prefixForm, fiscalYear: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">যেমন: 2026-2027</span>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: Signature & Seal Management */}
      {activeTab === 'signatures' && (
        <form onSubmit={handleSaveSeal} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Stamp className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'ডিজিটাল স্বাক্ষর ও সিল ব্যবস্থাপনা (Signature & Seal)' : 'Signature & Official Stamp'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'রসিদে স্বয়ংক্রিয়ভাবে সভাপতি, সাধারণ সম্পাদক ও ক্যাশিয়ারের সিল-স্বাক্ষর' : 'Official signatures and seal applied to all money receipts'}
              </p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'সিল-স্বাক্ষর সংরক্ষণ' : 'Save Signatures'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* President Signature Block */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-emerald-400 flex items-center justify-between">
                <span>{language === 'bn' ? '১. সভাপতি (President)' : '1. President'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">স্বাক্ষর ১</span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</label>
                <input
                  type="text"
                  value={sealForm.presidentName}
                  onChange={e => setSealForm({ ...sealForm, presidentName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'পদবী ও উপাধি' : 'Title'}</label>
                <input
                  type="text"
                  value={sealForm.presidentTitleBn}
                  onChange={e => setSealForm({ ...sealForm, presidentTitleBn: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="h-16 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/40 text-slate-400 font-serif italic text-sm">
                ✍️ {sealForm.presidentName}
              </div>
            </div>

            {/* General Secretary Block */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-cyan-400 flex items-center justify-between">
                <span>{language === 'bn' ? '২. সাধারণ সম্পাদক (Secretary)' : '2. General Secretary'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">স্বাক্ষর ২</span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</label>
                <input
                  type="text"
                  value={sealForm.secretaryName}
                  onChange={e => setSealForm({ ...sealForm, secretaryName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'পদবী ও উপাধি' : 'Title'}</label>
                <input
                  type="text"
                  value={sealForm.secretaryTitleBn}
                  onChange={e => setSealForm({ ...sealForm, secretaryTitleBn: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="h-16 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/40 text-slate-400 font-serif italic text-sm">
                ✍️ {sealForm.secretaryName}
              </div>
            </div>

            {/* Cashier / Treasurer Block */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-amber-400 flex items-center justify-between">
                <span>{language === 'bn' ? '৩. ক্যাশিয়ার / ট্রেজারার' : '3. Cashier & Treasurer'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">আদায়কারী</span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</label>
                <input
                  type="text"
                  value={sealForm.cashierName}
                  onChange={e => setSealForm({ ...sealForm, cashierName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">{language === 'bn' ? 'পদবী ও উপাধি' : 'Title'}</label>
                <input
                  type="text"
                  value={sealForm.cashierTitleBn}
                  onChange={e => setSealForm({ ...sealForm, cashierTitleBn: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div className="h-16 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/40 text-slate-400 font-serif italic text-sm">
                ✍️ {sealForm.cashierName}
              </div>
            </div>

          </div>

          {/* Official Round Stamp / Seal Block */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'সমিতির অফিশিয়াল গোল সিল (Official Seal Stamp)' : 'Official Round Seal'}</span>
                </h4>
                <p className="text-[11px] text-slate-400">রসিদে প্রদর্শিত সিলের বৃত্তাকার টেক্সট</p>
              </div>
              
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500/60 border-dashed flex items-center justify-center text-center p-1 bg-emerald-500/5">
                <span className="text-[8px] font-bold text-emerald-400 leading-tight">
                  SEAL<br/>★ রেজিস্টার্ড ★
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">
                {language === 'bn' ? 'সিলের টেক্সট (Seal Emboss Text)' : 'Seal Text'}
              </label>
              <input
                type="text"
                value={sealForm.sealTextBn}
                onChange={e => setSealForm({ ...sealForm, sealTextBn: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sealForm.showSignatureOnReceipt}
                  onChange={e => setSealForm({ ...sealForm, showSignatureOnReceipt: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="text-slate-300">{language === 'bn' ? 'রসিদে ডিজিটাল স্বাক্ষর দেখান' : 'Show signatures on receipt'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sealForm.showSealOnReceipt}
                  onChange={e => setSealForm({ ...sealForm, showSealOnReceipt: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="text-slate-300">{language === 'bn' ? 'রসিদে অফিসিয়াল গোল সিল দেখান' : 'Show official seal on receipt'}</span>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: Letterhead & Print Template Designer */}
      {activeTab === 'letterhead' && (
        <LetterheadDesigner />
      )}

      {/* In-App Version Update Checker Modal */}
      <UpdateCheckModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        isManualCheck={true}
      />

    </div>
  );
}
