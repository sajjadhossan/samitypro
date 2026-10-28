'use client';

import React, { useState } from 'react';
import { 
  Building2, Sliders, Stamp, Printer, CheckCircle2, 
  Save, FileText, Globe, DollarSign, Calendar, Eye, RefreshCw,
  Lock, ShieldCheck, Zap, HandCoins, PiggyBank, Award, BookOpen, AlertCircle,
  Smartphone, Landmark
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
    updateTenantProfile,
    updateTenant
  } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'samity-setup' | 'voucher-prefix' | 'signatures' | 'letterhead' | 'tier2-modules'>('samity-setup');
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
    samityOperatingModel: (activeTenant?.settings?.samityOperatingModel || 'MULTI_PURPOSE') as 'SAVINGS_ONLY' | 'INVESTMENT_PROPERTY' | 'MICRO_CREDIT' | 'MULTI_PURPOSE',
    isSavingsOnlySamity: activeTenant?.settings?.isSavingsOnlySamity ?? (activeTenant?.settings?.enableLoans === false),
    strictNoLoanPolicy: activeTenant?.settings?.strictNoLoanPolicy ?? (activeTenant?.settings?.enableLoans === false),
    targetMemberCount: activeTenant?.settings?.targetMemberCount || 20,
    monthlySavingsPerMember: activeTenant?.settings?.monthlySavingsPerMember || (activeTenant?.settings?.fixedMonthlyAmount || 1500),
  });

  // Tier 2 Internal Module Settings (Samity President Controls within Super Admin allowances)
  const [tier2Form, setTier2Form] = useState({
    memberCanApplyLoanOnline: activeTenant?.settings?.memberCanApplyLoanOnline ?? true,
    memberCanDownloadReceipt: activeTenant?.settings?.memberCanDownloadReceipt ?? true,
    autoSmsOnDeposit: activeTenant?.settings?.autoSmsOnDeposit ?? true,
    autoSmsOnLoanRepay: activeTenant?.settings?.autoSmsOnLoanRepay ?? true,
    shareFaceValue: activeTenant?.settings?.shareFaceValue ?? 1000,
    defaultSavingsInterestRate: activeTenant?.settings?.defaultSavingsInterestRate ?? 8.5,
    defaultLoanInterestRate: activeTenant?.settings?.defaultLoanInterestRate ?? 12.0,
    penaltyPerMissedInstallment: activeTenant?.settings?.penaltyPerMissedInstallment ?? 100,
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

    const isSavingsOnly = samityForm.samityOperatingModel === 'SAVINGS_ONLY' || samityForm.strictNoLoanPolicy || samityForm.isSavingsOnlySamity;

    const updatedSettings = {
      ...activeTenant.settings,
      samityOperatingModel: isSavingsOnly ? ('SAVINGS_ONLY' as const) : samityForm.samityOperatingModel,
      isSavingsOnlySamity: isSavingsOnly,
      strictNoLoanPolicy: isSavingsOnly,
      targetMemberCount: Number(samityForm.targetMemberCount) || 20,
      monthlySavingsPerMember: Number(samityForm.monthlySavingsPerMember) || 1500,
      fixedMonthlyAmount: Number(samityForm.monthlySavingsPerMember) || 1500,
      enableFixedMonthlySavings: isSavingsOnly ? true : (activeTenant.settings.enableFixedMonthlySavings ?? false),
      ...(isSavingsOnly ? {
        enableLoans: false,
        enableMicroLoans: false,
        enableFieldOfficers: false,
      } : {})
    };

    updateTenantProfile(activeTenant.id, {
      nameBn: samityForm.nameBn,
      nameEn: samityForm.nameEn,
      registrationNo: samityForm.registrationNo,
      establishedYear: samityForm.establishedYear,
      type: samityForm.type as TenantType,
      phone: samityForm.phone,
      email: samityForm.email,
      address: samityForm.address,
      settings: updatedSettings
    });

    showNotification(language === 'bn' ? 'সমিতি সেটআপ, সদস্য কোটা ও সঞ্চয় পলিসি সংরক্ষিত হয়েছে!' : 'Samity profile and savings-only settings saved!');
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

  const handleSaveTier2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;
    const mergedSettings = {
      ...(activeTenant.settings || {}),
      ...tier2Form
    };
    updateTenant(activeTenant.id, {
      settings: mergedSettings
    });
    try {
      await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeTenant.id,
          settings: mergedSettings
        })
      });
    } catch {}
    showNotification(language === 'bn' ? 'অভ্যন্তরীণ পলিসি ও মেম্বার সুবিধা সফলভাবে সংরক্ষিত হয়েছে!' : 'Internal module settings saved!');
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

        <button
          onClick={() => setActiveTab('tier2-modules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'tier2-modules'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{language === 'bn' ? '৫. পলিসি ও অভ্যন্তরীণ সুবিধা' : '5. Policies & Modules'}</span>
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

          {/* Section: পরিচালনা মোড ও সঞ্চয়-অনলি কনফিগারেশন (No-Loan & Target Member Architecture) */}
          <div className="pt-5 border-t border-slate-800 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-emerald-950/40 border border-teal-500/30">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-5 h-5 text-teal-400" />
                <h4 className="text-sm font-bold text-white">
                  সমিতির পরিচালনা মোড, সদস্য সংখ্যা ও ঋণ নিষিদ্ধকরণ পলিসি
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                আপনার সমিতি কি শুধুমাত্র সঞ্চয় ও ডিপিএস ভিত্তিক (যেখানে কোনো সদস্যকে ঋণ দেওয়া হবে না)? এখান থেকে সরাসরি কনফিগার করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Operating Model Select */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  সমিতি পরিচালনা মডেল (Operating Model)
                </label>
                <select
                  value={samityForm.samityOperatingModel}
                  onChange={e => {
                    const model = e.target.value as any;
                    const isSavings = model === 'SAVINGS_ONLY';
                    setSamityForm({
                      ...samityForm,
                      samityOperatingModel: model,
                      isSavingsOnlySamity: isSavings,
                      strictNoLoanPolicy: isSavings
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-teal-500 font-sans"
                >
                  <option value="SAVINGS_ONLY">🟢 শুধু সঞ্চয় সমিতি (Savings-Only / ঋণ সম্পূর্ণ নিষিদ্ধ)</option>
                  <option value="MULTI_PURPOSE">🟡 বহুমুখী সমবায় সমিতি (সঞ্চয়, ঋণ, ডিপিএস ও অন্যান্য)</option>
                  <option value="MICRO_CREDIT">🔵 ক্ষুদ্রঋণ ও সঞ্চয় সমিতি (Micro-Credit & Savings)</option>
                  <option value="INVESTMENT_PROPERTY">🟣 প্রকল্প ও যৌথ বিনিয়োগ সমিতি (Property & Shares)</option>
                </select>
                <p className="text-[10px] text-teal-400/80 mt-1">
                  * &quot;শুধু সঞ্চয় সমিতি&quot; সিলেক্ট করলে সিস্টেমে ঋণ মডিউল স্বয়ংক্রিয়ভাবে বন্ধ থাকবে।
                </p>
              </div>

              {/* Target Member Capacity */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  নির্ধারিত মোট সদস্য কোটা (Target Member Capacity)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={samityForm.targetMemberCount}
                    onChange={e => setSamityForm({ ...samityForm, targetMemberCount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-cyan-300 font-mono text-sm font-bold focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-sans">জন সদস্য</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  সমিতিতে মোট সদস্যের নির্দিষ্ট লক্ষ্যমাত্রা (যেমন: ২০ জন সদস্যের কোটা)।
                </p>
              </div>

              {/* Strict No-Loan Policy Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    ঋণ কার্যক্রম সম্পূর্ণ বন্ধ (Strictly No Loans)
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    সদস্যদের কোনো ঋণ প্রদান করা হবে না, শুধু মাসিক সঞ্চয় ও আমানত চলবে।
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={samityForm.strictNoLoanPolicy || samityForm.samityOperatingModel === 'SAVINGS_ONLY'}
                  onChange={e => {
                    const checked = e.target.checked;
                    setSamityForm({
                      ...samityForm,
                      strictNoLoanPolicy: checked,
                      isSavingsOnlySamity: checked,
                      samityOperatingModel: checked ? 'SAVINGS_ONLY' : samityForm.samityOperatingModel
                    });
                  }}
                  className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-800 border-slate-700 cursor-pointer"
                />
              </div>

              {/* Monthly Mandatory Savings per Member */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  সদস্যপ্রতি মাসিক বাধ্যতামূলক সঞ্চয় (Fixed Monthly Savings)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-sans">৳</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={samityForm.monthlySavingsPerMember}
                    onChange={e => setSamityForm({ ...samityForm, monthlySavingsPerMember: Number(e.target.value) })}
                    className="w-full pl-8 pr-12 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-sans">BDT</span>
                </div>
                <p className="text-[10px] text-emerald-400/90 mt-1 font-mono">
                  📊 প্রাক্কলন: {samityForm.targetMemberCount} জন × ৳ {samityForm.monthlySavingsPerMember.toLocaleString()} = ৳ {(samityForm.targetMemberCount * samityForm.monthlySavingsPerMember).toLocaleString()} / মাস
                </p>
              </div>

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

      {/* TAB 5: Tier 2 Internal Module Settings & Member Policies */}
      {activeTab === 'tier2-modules' && (
        <form onSubmit={handleSaveTier2} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tier 2 Samity President Controls
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeTenant?.nameBn}
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'অভ্যন্তরীণ ফিচার, সুদের হার ও মেম্বার সুবিধা' : 'Internal Policies, Rates & Member Options'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'সুপার অ্যাডমিন কর্তৃক অনুমোদিত মডিউলগুলোর অভ্যন্তরীণ পলিসি, অনলাইন আবেদন ও স্বয়ংক্রিয় অ্যালার্ট নিয়ন্ত্রণ করুন'
                  : 'Configure internal rates and member options for modules enabled in your subscription plan'}
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'পলিসি সেভ করুন' : 'Save Policies'}</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: ঋণ ও কিস্তি আদায় পলিসি */}
            <div className={`p-4 rounded-xl border ${
              activeTenant?.settings?.enableLoans !== false
                ? 'bg-slate-900/80 border-slate-700/80'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <HandCoins className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-slate-200">১. ঋণ ও কিস্তি পলিসি</span>
                </div>
                {activeTenant?.settings?.enableLoans === false ? (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" />
                    <span>সুপার অ্যাডমিন প্যাকেজে বন্ধ</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    মডিউল সক্রিয়
                  </span>
                )}
              </div>

              {activeTenant?.settings?.enableLoans !== false ? (
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tier2Form.memberCanApplyLoanOnline}
                      onChange={e => setTier2Form({ ...tier2Form, memberCanApplyLoanOnline: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-slate-200 font-medium block">অনলাইনে ঋণের আবেদন (Member Online Apply)</span>
                      <span className="text-[10px] text-slate-400">সদস্যরা ডিজিটাল পাসবই থেকে ঋণের আবেদন পাঠাতে পারবেন</span>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">বাৎসরিক সুদের হার (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tier2Form.defaultLoanInterestRate}
                        onChange={e => setTier2Form({ ...tier2Form, defaultLoanInterestRate: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">বিলম্ব কিস্তি জরিমানা (টাকা)</label>
                      <input
                        type="number"
                        value={tier2Form.penaltyPerMissedInstallment}
                        onChange={e => setTier2Form({ ...tier2Form, penaltyPerMissedInstallment: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed py-2">
                  🔒 ঋণ ও কিস্তি আদায় মডিউলটি আপনার বর্তমান সাবস্ক্রিপশন প্ল্যানে বন্ধ রয়েছে। এটি সক্রিয় করতে প্ল্যাটফর্ম ওনারের সাথে যোগাযোগ করুন।
                </p>
              )}
            </div>

            {/* Card 2: সঞ্চয় ও ডিপিএস মুনাফা পলিসি */}
            <div className={`p-4 rounded-xl border ${
              (activeTenant?.settings?.enableSavings !== false && activeTenant?.settings?.enableDps !== false)
                ? 'bg-slate-900/80 border-slate-700/80'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">২. সঞ্চয় ও ডিপিএস মুনাফা</span>
                </div>
                {(activeTenant?.settings?.enableSavings === false && activeTenant?.settings?.enableDps === false) ? (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" />
                    <span>সুপার অ্যাডমিন প্যাকেজে বন্ধ</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    মডিউল সক্রিয়
                  </span>
                )}
              </div>

              {(activeTenant?.settings?.enableSavings !== false || activeTenant?.settings?.enableDps !== false) ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">সাধারণ সঞ্চয়ের বাৎসরিক মুনাফার হার (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tier2Form.defaultSavingsInterestRate}
                      onChange={e => setTier2Form({ ...tier2Form, defaultSavingsInterestRate: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      মুনাফা গণনা ও অর্থবছর শেষে লভ্যাংশ হিসেবে জমাকারীর হিসাবে স্বয়ংক্রিয়ভাবে যুক্ত হবে।
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed py-2">
                  🔒 সঞ্চয় ও ডিপিএস মডিউলটি বন্ধ রয়েছে।
                </p>
              )}
            </div>

            {/* Card 3: শেয়ার মূলধন পলিসি */}
            <div className={`p-4 rounded-xl border ${
              activeTenant?.settings?.enableShares !== false
                ? 'bg-slate-900/80 border-slate-700/80'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-slate-200">৩. শেয়ার মূলধন পলিসি</span>
                </div>
                {activeTenant?.settings?.enableShares === false ? (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" />
                    <span>প্যাকেজে বন্ধ</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    মডিউল সক্রিয়
                  </span>
                )}
              </div>

              {activeTenant?.settings?.enableShares !== false ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">প্রতি শেয়ারের অভিহিত মূল্য (টাকা)</label>
                    <input
                      type="number"
                      value={tier2Form.shareFaceValue}
                      onChange={e => setTier2Form({ ...tier2Form, shareFaceValue: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      নতুন সদস্য নিবন্ধনের সময় এবং অতিরিক্ত শেয়ার ক্রয়ে এই মূল্য ব্যবহৃত হবে।
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed py-2">
                  🔒 শেয়ার মূলধন মডিউলটি বর্তমান প্যাকেজে অন্তর্ভুক্ত নয়।
                </p>
              )}
            </div>

            {/* Card 4: ডিজিটাল মেম্বার সুবিধা ও রসিদ */}
            <div className={`p-4 rounded-xl border ${
              activeTenant?.settings?.enableMemberPortal !== false
                ? 'bg-slate-900/80 border-slate-700/80'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200">৪. ডিজিটাল মেম্বার পোর্টাল</span>
                </div>
                {activeTenant?.settings?.enableMemberPortal === false ? (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" />
                    <span>প্যাকেজে বন্ধ</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    মডিউল সক্রিয়
                  </span>
                )}
              </div>

              {activeTenant?.settings?.enableMemberPortal !== false ? (
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tier2Form.memberCanDownloadReceipt}
                      onChange={e => setTier2Form({ ...tier2Form, memberCanDownloadReceipt: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-slate-200 font-medium block">সদস্যরা ডিজিটাল রসিদ ডাউনলোড করতে পারবে</span>
                      <span className="text-[10px] text-slate-400">জমা ও কিস্তি পরিশোধের পর সরাসরি কিউআর কোডসহ রসিদ প্রিন্ট করতে পারবে</span>
                    </div>
                  </label>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed py-2">
                  🔒 ডিজিটাল পাসবই ও মেম্বার পোর্টাল প্যাকেজে বন্ধ।
                </p>
              )}
            </div>

            {/* Card 5: স্বয়ংক্রিয় এসএমএস অ্যালার্ট ট্রিগার */}
            <div className={`p-4 rounded-xl border md:col-span-2 ${
              activeTenant?.settings?.enableSmsAlerts !== false
                ? 'bg-slate-900/80 border-slate-700/80'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold text-slate-200">৫. স্বয়ংক্রিয় মেসেজিং অ্যালার্ট পলিসি (Auto SMS Triggers)</span>
                </div>
                {activeTenant?.settings?.enableSmsAlerts === false ? (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" />
                    <span>প্যাকেজে বন্ধ</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-yellow-400 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                    ব্যালান্স: {activeTenant?.smsBalance ?? 0} টি এসএমএস
                  </span>
                )}
              </div>

              {activeTenant?.settings?.enableSmsAlerts !== false ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tier2Form.autoSmsOnDeposit}
                      onChange={e => setTier2Form({ ...tier2Form, autoSmsOnDeposit: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-slate-200 font-medium block">টাকা জমা হলে স্বয়ংক্রিয় এসএমএস</span>
                      <span className="text-[10px] text-slate-400">সঞ্চয়, ডিপিএস বা চাঁদা জমা হলে সদস্যের মোবাইলে তৎক্ষণাৎ এসএমএস যাবে</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tier2Form.autoSmsOnLoanRepay}
                      onChange={e => setTier2Form({ ...tier2Form, autoSmsOnLoanRepay: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-slate-200 font-medium block">কিস্তি আদায় হলে স্বয়ংক্রিয় এসএমএস</span>
                      <span className="text-[10px] text-slate-400">মাঠকর্মী বা অফিসে ঋণের কিস্তি পরিশোধের সাথে সাথে এসএমএস নিশ্চিতকরণ যাবে</span>
                    </div>
                  </label>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed py-2">
                  🔒 এসএমএস ও মেসেজিং অ্যালার্ট সুপার অ্যাডমিন লাইসেন্স প্যাকেজে বন্ধ রয়েছে।
                </p>
              )}
            </div>

            {/* Card 6: মাঠকর্মী ও ফিল্ড কালেকশন পলিসি */}
            <div className={`p-4 rounded-xl border ${
              activeTenant?.settings?.enableFieldOfficers !== false
                ? 'bg-slate-900/80 border-slate-700/80'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-slate-200">৬. মাঠকর্মী ও মোবাইল POS পলিসি</span>
                </div>
                {activeTenant?.settings?.enableFieldOfficers === false ? (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <Lock className="w-3 h-3" />
                    <span>সুপার অ্যাডমিনে বন্ধ (কোনো মাঠকর্মী নেই)</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    মডিউল সক্রিয়
                  </span>
                )}
              </div>

              {activeTenant?.settings?.enableFieldOfficers !== false ? (
                <p className="text-[11px] text-slate-300 leading-relaxed py-1">
                  মাঠকর্মীরা মোবাইলের মাধ্যমে বাড়ি বাড়ি গিয়ে সঞ্চয় ও কিস্তি সংগ্রহ করতে পারবে এবং তাৎক্ষণিক ডিজিটাল থার্মাল/POS রসিদ প্রদান করতে পারবে।
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed py-1">
                  🔒 এই সমিতিতে মাঠকর্মী ও ফিল্ড কালেকশন অপশন বন্ধ রাখা হয়েছে। শুধুমাত্র সদস্যগণ বা অফিস কাউন্টার থেকে জমা গৃহীত হবে।
                </p>
              )}
            </div>

            {/* Card 7: জমি, প্রোপার্টি প্রকল্প ও ফিক্সড মাসিক চাঁদা */}
            <div className={`p-4 rounded-xl border ${
              (activeTenant?.settings?.enablePropertyProjects !== false || activeTenant?.settings?.enableFixedMonthlySavings)
                ? 'bg-slate-900/80 border-slate-700/80'
                : 'bg-slate-950/40 border-slate-800/80 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">৭. জমি ও প্রোপার্টি বিনিয়োগ ও ফিক্সড চাঁদা</span>
                </div>
                {activeTenant?.settings?.enableFixedMonthlySavings ? (
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    মাসিক চাঁদা: ৳ {(activeTenant?.settings?.fixedMonthlyAmount || 10000).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    সাধারণ সমবায়
                  </span>
                )}
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 font-medium">সমিতি পরিচালনা মডেল</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {activeTenant?.settings?.samityOperatingModel === 'INVESTMENT_PROPERTY' 
                      ? 'জমি ও প্রোপার্টি বিনিয়োগ সমিতি' 
                      : activeTenant?.settings?.samityOperatingModel === 'MICRO_CREDIT'
                      ? 'ক্ষুদ্রঋণ ও মাঠ সঞ্চয় সমিতি'
                      : 'বহুমুখী সমন্বিত সমবায়'}
                  </span>
                </div>
                {activeTenant?.settings?.enableFixedMonthlySavings && (
                  <p className="text-[10px] text-emerald-400 leading-relaxed">
                    ✅ প্রতি মাসে প্রতিটি সদস্যের প্রোফাইলে নির্ধারিত ৳ {(activeTenant?.settings?.fixedMonthlyAmount || 10000).toLocaleString()} টাকা সঞ্চয়/চাঁদা বিল হিসেবে ধার্য হবে।
                  </p>
                )}
              </div>
            </div>

          </div>

        </form>
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
