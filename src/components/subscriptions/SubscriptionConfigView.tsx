'use client';

import React, { useState } from 'react';
import { 
  BadgePercent, Settings, Sliders, Calendar, DollarSign, 
  ShieldAlert, Award, Clock, CheckCircle2, AlertCircle, 
  Save, RefreshCw, Zap, Gift, Users, FileText
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  SubscriptionPolicyConfig, 
  CategorySubscriptionRate, 
  SubscriptionBillingFrequency, 
  LateFeeType, 
  MemberCategory 
} from '@/types';
import { formatCurrency } from '@/lib/i18n';

interface SubscriptionConfigViewProps {
  onDuesGenerated?: () => void;
}

export function SubscriptionConfigView({ onDuesGenerated }: SubscriptionConfigViewProps) {
  const { 
    activeTenant, 
    language, 
    subscriptionPolicy, 
    updateSubscriptionPolicy, 
    generateMonthlyDues, 
    applyOverdueLateFees,
    lateFeeWaivers, 
    members, 
    subscriptions 
  } = useSamityStore();

  const [activeSubTab, setActiveSubTab] = useState<'BASE_POLICY' | 'CATEGORY_TIERS' | 'LATE_FEE' | 'DISCOUNTS' | 'ENGINE' | 'WAIVERS'>('BASE_POLICY');
  const [saveSuccessAlert, setSaveSuccessAlert] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<SubscriptionPolicyConfig>({
    ...subscriptionPolicy
  });

  // Dues Engine State
  const [engineMonthYear, setEngineMonthYear] = useState('2026-11');
  const [engineMonthNameBn, setEngineMonthNameBn] = useState('নভেম্বর ২০২৬');
  const [engineResult, setEngineResult] = useState<{ generatedCount: number; skippedCount: number; totalDemand: number } | null>(null);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    updateSubscriptionPolicy(formData);
    setSaveSuccessAlert('সমিতির চাঁদা ও জরিমানা পলিসি সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSaveSuccessAlert(null), 4000);
  };

  const handleCategoryRateChange = (index: number, field: keyof CategorySubscriptionRate, value: any) => {
    const updatedRates = [...(formData.categoryRates || [])];
    updatedRates[index] = {
      ...updatedRates[index],
      [field]: value
    };
    setFormData({
      ...formData,
      categoryRates: updatedRates
    });
  };

  const handleRunDuesGeneration = () => {
    const result = generateMonthlyDues(engineMonthYear, engineMonthNameBn);
    setEngineResult(result);
    if (onDuesGenerated) onDuesGenerated();
  };

  const handleApplyLateFees = () => {
    const result = applyOverdueLateFees();
    setSaveSuccessAlert(`মোট ${result.updatedCount} জন সদস্যের বকেয়া চাঁদায় সর্বমোট ৳ ${result.totalLateFeesAdded.toLocaleString()} লেট ফি যুক্ত করা হয়েছে।`);
    setTimeout(() => setSaveSuccessAlert(null), 5000);
  };

  // Preview counts for Dues Generation
  const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;
  const existingBilledCount = subscriptions.filter(s => s.monthYear === engineMonthYear).length;

  return (
    <div className="space-y-6">
      
      {/* Save Alert */}
      {saveSuccessAlert && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessAlert}</span>
          </div>
          <button onClick={() => setSaveSuccessAlert(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-emerald-400" />
            <span>চাঁদা ও সাবস্ক্রিপশন কনফিগারেশন (মডিউল ৩)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            মাসিক চাঁদা হার, ক্যাটাগরিভিত্তিক স্লাব, জরিমানা পলিসি, গ্রেস পিরিয়ড ও অটো-বিলিং শিডিউলার
          </p>
        </div>

        <button
          onClick={handleSavePolicy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>পলিসি সংরক্ষণ করুন</span>
        </button>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-800 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('BASE_POLICY')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'BASE_POLICY'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>১. মূল পলিসি ও সময়সীমা</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('CATEGORY_TIERS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'CATEGORY_TIERS'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>২. ক্যাটাগরিভিত্তিক চাঁদা স্লাব</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('LATE_FEE')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'LATE_FEE'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>৩. বিলম্ব ফি ও জরিমানা পলিসি</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('DISCOUNTS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'DISCOUNTS'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>৪. বাৎসরিক অগ্রিম ছাড়</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ENGINE')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ENGINE'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>৫. বকেয়া জেনারেশন ইঞ্জিন</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('WAIVERS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'WAIVERS'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>৬. জরিমানা মওকুফ লগ</span>
        </button>
      </div>

      {/* Tab 1: Base Policy & Due Day */}
      {activeSubTab === 'BASE_POLICY' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>মূল সাবস্ক্রিপশন পলিসি ও ডিউ তারিখ সেটিংস</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              সমিতির স্ট্যান্ডার্ড মাসিক চাঁদার পরিমাণ এবং প্রতি মাসের পরিশোধের শেষ দিন নির্ধারণ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Default Amount */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">
                ডিফল্ট মাসিক চাঁদা (টাকা) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={formData.defaultMonthlyAmount}
                  onChange={e => setFormData({ ...formData, defaultMonthlyAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold text-emerald-400 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 top-2.5 text-slate-500 font-semibold">৳ / মাস</span>
              </div>
              <p className="text-[11px] text-slate-500">যেসব সদস্যের বিশেষ হার নির্ধারিত নেই তাদের জন্য এটি প্রযোজ্য।</p>
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">বিলিং ফ্রিকোয়েন্সি</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData({ ...formData, frequency: e.target.value as SubscriptionBillingFrequency })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="MONTHLY">মাসিক (Monthly - প্রতি মাসে একবার)</option>
                <option value="QUARTERLY">ত্রৈমাসিক (Quarterly - প্রতি ৩ মাসে)</option>
                <option value="HALF_YEARLY">ষাণ্মাসিক (Half-Yearly - প্রতি ৬ মাসে)</option>
                <option value="YEARLY">বার্ষিক (Yearly - বছরে একবার)</option>
              </select>
              <p className="text-[11px] text-slate-500">বাংলাদেশে অধিকাংশ সমবায় ও সমিতি মাসিক ভিত্তিতে চাঁদা গ্রহণ করে।</p>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">ডিফল্ট কারেন্সি</label>
              <input
                type="text"
                disabled
                value="BDT (৳) - বাংলাদেশী টাকা"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono"
              />
              <p className="text-[11px] text-slate-500">প্ল্যাটফর্ম রুলস অনুযায়ী নির্ধারিত।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-800/80">
            {/* Due Day */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">চাঁদা পরিশোধের শেষ দিন (Due Day) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={formData.dueDayOfMonth}
                  onChange={e => setFormData({ ...formData, dueDayOfMonth: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold"
                />
                <span className="absolute right-3.5 top-2.5 text-slate-500 font-medium">তারিখ</span>
              </div>
              <p className="text-[11px] text-slate-500">প্রতি মাসের ১ থেকে ২৮ তারিখের মধ্যে একটি দিন নির্ধারণ করুন।</p>
            </div>

            {/* Grace Period */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">গ্রেস পিরিয়ড (Grace Period) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.gracePeriodDays}
                  onChange={e => setFormData({ ...formData, gracePeriodDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold"
                />
                <span className="absolute right-3.5 top-2.5 text-slate-500 font-medium">দিন অতিরিক্ত</span>
              </div>
              <p className="text-[11px] text-slate-500">শেষ দিন অতিবাহিত হওয়ার কত দিন পর পর্যন্ত জরিমানা ছাড়া জমা নেওয়া যাবে।</p>
            </div>

            {/* Auto Billing Scheduler */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">স্বয়ংক্রিয় চাঁদা জেনারেশন শিডিউলার</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                <input
                  type="checkbox"
                  id="autoBillingEnabled"
                  checked={formData.autoBillingEnabled}
                  onChange={e => setFormData({ ...formData, autoBillingEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
                />
                <label htmlFor="autoBillingEnabled" className="text-slate-200 cursor-pointer">
                  প্রতি মাসের ১ তারিখে অটো-ডিউ তৈরি হবে
                </label>
              </div>
              <p className="text-[11px] text-slate-500">ম্যানুয়াল জেনারেট ছাড়াও অটোমেটিক সিস্টেম ডিউ বিল তৈরি করবে।</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Category Tiered Rates */}
      {activeSubTab === 'CATEGORY_TIERS' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>সদস্য ক্যাটাগরিভিত্তিক চাঁদা স্লাব (Tiered Subscription Rates)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                বিভিন্ন ক্যাটাগরির সদস্যের জন্য আলাদা মাসিক চাঁদার হার ও ভর্তি ফি নির্ধারণ করুন।
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ৬টি ক্যাটাগরি সক্রিয়
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-md">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ক্যাটাগরি নাম</th>
                  <th className="py-3 px-4">ইংলিশ কোড</th>
                  <th className="py-3 px-4">নির্ধারিত মাসিক চাঁদা (৳)</th>
                  <th className="py-3 px-4">এককালীন ভর্তি ফি (৳)</th>
                  <th className="py-3 px-4 text-center">চাঁদা অব্যাহতি (Exempt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {formData.categoryRates?.map((rate, index) => (
                  <tr key={rate.category} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                      {rate.categoryNameBn}
                    </td>
                    <td className="py-3 px-4 text-indigo-400">
                      {rate.category}
                    </td>
                    <td className="py-2 px-4">
                      <div className="relative max-w-[150px]">
                        <input
                          type="number"
                          disabled={rate.isExempt}
                          value={rate.monthlyAmount}
                          onChange={e => handleCategoryRateChange(index, 'monthlyAmount', Number(e.target.value))}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold font-mono focus:ring-1 focus:ring-emerald-500 ${
                            rate.isExempt 
                              ? 'bg-slate-950 border-slate-800 text-slate-500' 
                              : 'bg-slate-900 border-slate-700 text-emerald-400'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="relative max-w-[150px]">
                        <input
                          type="number"
                          value={rate.admissionFee}
                          onChange={e => handleCategoryRateChange(index, 'admissionFee', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rate.isExempt}
                        onChange={e => {
                          const isExempt = e.target.checked;
                          handleCategoryRateChange(index, 'isExempt', isExempt);
                          if (isExempt) handleCategoryRateChange(index, 'monthlyAmount', 0);
                        }}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * যেমন: আজীবন সদস্যদের ক্ষেত্রে মাসিক চাঁদা শূন্য বা অব্যাহতিপ্রাপ্ত হতে পারে, তবে এককালীন ভর্তি ফি প্রযোজ্য।
          </p>
        </div>
      )}

      {/* Tab 3: Late Fee Policy */}
      {activeSubTab === 'LATE_FEE' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>বিলম্ব ফি বা জরিমানা পলিসি (Late Fee & Penalty Settings)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                চাঁদা পরিশোধের শেষ দিন ও গ্রেস পিরিয়ড অতিবাহিত হলে স্বয়ংক্রিয় জরিমানা যুক্তকরণ নিয়ম।
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyLateFees}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-semibold shadow transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>চলতি বকেয়াগুলিতে লেট ফি প্রয়োগ করুন</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-4">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-100">বিলম্ব ফি বা জরিমানা কার্যকর থাকবে</div>
                <div className="text-[11px] text-slate-400 mt-0.5">ডিজেবল করা থাকলে কোনো বিলম্বিত সদস্যের উপর জরিমানা ধার্য হবে না।</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.lateFeeEnabled}
                  onChange={e => setFormData({ ...formData, lateFeeEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {formData.lateFeeEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                {/* Late Fee Calculation Type */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-medium">জরিমানা হিসাবের পদ্ধতি</label>
                  <select
                    value={formData.lateFeeType}
                    onChange={e => setFormData({ ...formData, lateFeeType: e.target.value as LateFeeType })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value="FIXED">নির্দিষ্ট টাকা (Fixed Amount, e.g. ১০০ ৳)</option>
                    <option value="PERCENTAGE">বকেয়ার শতকরা হার (Percentage, e.g. ৫%)</option>
                    <option value="DAILY_RECURRING">দৈনিক জরিমানা (Daily Recurring, e.g. ১০ ৳/দিন)</option>
                  </select>
                </div>

                {/* Late Fee Amount */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-medium">
                    জরিমানার পরিমাণ ({formData.lateFeeType === 'PERCENTAGE' ? '%' : 'টাকা'}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.lateFeeAmount}
                      onChange={e => setFormData({ ...formData, lateFeeAmount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 font-mono font-bold"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400 font-medium">
                      {formData.lateFeeType === 'PERCENTAGE' ? '%' : '৳'}
                    </span>
                  </div>
                </div>

                {/* Waiver Role */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-medium">জরিমানা মওকুফের অনুমতি কার রয়েছে</label>
                  <select
                    value={formData.lateFeeWaiverRole}
                    onChange={e => setFormData({ ...formData, lateFeeWaiverRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value="PRESIDENT">সমিতি সভাপতি (President Only)</option>
                    <option value="ADMIN">যেকোনো অ্যাডমিন (Admin / Treasurer)</option>
                    <option value="SUPER_ADMIN">সুপার অ্যাডমিন (Super Admin)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Annual Advance Discount */}
      {activeSubTab === 'DISCOUNTS' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>বাৎসরিক অগ্রিম চাঁদা পরিশোধ ও প্রণোদনা ছাড়</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              কোনো সদস্য পুরো এক বছর (১২ মাসের) চাঁদা একসাথে অগ্রিম পরিশোধ করলে বিশেষ ছাড় পলিসি।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-100">বাৎসরিক এককালীন অগ্রিম পরিশোধে ছাড় সক্রিয়</div>
                <div className="text-[11px] text-slate-400 mt-0.5">অগ্রিম সংগ্রহ বৃদ্ধিতে সদস্যদের উদ্বুদ্ধ করার কার্যকর উপায়।</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.annualDiscountEnabled}
                  onChange={e => setFormData({ ...formData, annualDiscountEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {formData.annualDiscountEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-medium">ছাড়ের শতকরা হার (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.annualDiscountPercent}
                      onChange={e => setFormData({ ...formData, annualDiscountPercent: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400 font-medium">% ছাড়</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-slate-300 text-[11px] flex items-center">
                  💡 উদাহরণস্বরূপ: ১৫০০ ৳ হারের মাসিক সদস্য ১২ মাসের মোট ১৮,০০০ ৳ এর বদলে ১০% ছাড়ে ১৬,২০০ ৳ পরিশোধ করতে পারবেন।
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Dues Generation Engine */}
      {activeSubTab === 'ENGINE' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>স্বয়ংক্রিয় মাসিক চাঁদা ও বকেয়া জেনারেশন ইঞ্জিন (Dues Generator Engine)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              যেকোনো নির্দিষ্ট মাসের জন্য সকল সক্রিয় সদস্যের অ্যাকাউন্টে এক ক্লিকে চাঁদার বিল ধার্য করুন।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">বিলিং মাস ও বছর কোড *</label>
                <input
                  type="text"
                  value={engineMonthYear}
                  onChange={e => setEngineMonthYear(e.target.value)}
                  placeholder="YYYY-MM (যেমন: 2026-11)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">মাসের নাম (বাংলায়) *</label>
                <input
                  type="text"
                  value={engineMonthNameBn}
                  onChange={e => setEngineMonthNameBn(e.target.value)}
                  placeholder="যেমন: নভেম্বর ২০২৬"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRunDuesGeneration}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{engineMonthNameBn} এর চাঁদা তৈরি করুন</span>
                </button>
              </div>
            </div>

            {/* Live Stats Box */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-slate-400 text-[11px]">সক্রিয় সদস্য সংখ্যা</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">{activeMembersCount} জন</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-slate-400 text-[11px]">ইতিমধ্যে জেনারেটকৃত</div>
                <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">{existingBilledCount} জন</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-slate-400 text-[11px]">অনুমানিত মোট মাসিক দাবি</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  ৳ {(activeMembersCount * (formData.defaultMonthlyAmount || 1500)).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Result Alert */}
            {engineResult && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs space-y-1 animate-in fade-in">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>জেনারেশন সফল সম্পন্ন হয়েছে!</span>
                </div>
                <p>
                  মোট <strong>{engineResult.generatedCount}</strong> জন সদস্যের জন্য সর্বমোট <strong>৳ {engineResult.totalDemand.toLocaleString()}</strong> চাঁদা ধার্য করা হয়েছে। (পূর্বনির্ধারিত/অব্যাহতিপ্রাপ্ত: {engineResult.skippedCount} জন)।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Late Fee Waiver History */}
      {activeSubTab === 'WAIVERS' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>বিলম্ব ফি বা জরিমানা মওকুফের অডিট লগ (Late Fee Waiver Audit)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                সভাপতি বা কোষাধ্যক্ষ কর্তৃক অনুমোদিত জরিমানা মওকুফের পূর্ণাঙ্গ রেকর্ড তালিকা।
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
              {lateFeeWaivers.length} টি রেকর্ড
            </span>
          </div>

          {lateFeeWaivers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-slate-900 border border-slate-800">
              এখনও পর্যন্ত কোনো জরিমানা মওকুফ রেকর্ড নেই।
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">সদস্যের নাম</th>
                    <th className="py-2.5 px-3">মাস</th>
                    <th className="py-2.5 px-3 text-right">আসল লেট ফি</th>
                    <th className="py-2.5 px-3 text-right">মওকুফকৃত টাকা</th>
                    <th className="py-2.5 px-3">মওকুফের কারণ</th>
                    <th className="py-2.5 px-3">অনুমোদনকারী</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {lateFeeWaivers.map(w => (
                    <tr key={w.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400">{w.waivedAt}</td>
                      <td className="py-2 px-3 text-slate-100 font-sans font-medium">{w.memberNameBn}</td>
                      <td className="py-2 px-3 text-slate-400">{w.monthYear}</td>
                      <td className="py-2 px-3 text-right text-rose-400">৳ {w.originalLateFee.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">৳ {w.waivedAmount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-slate-300 font-sans max-w-[200px] truncate">{w.waivedReason}</td>
                      <td className="py-2 px-3 text-purple-300 font-sans">{w.waivedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
