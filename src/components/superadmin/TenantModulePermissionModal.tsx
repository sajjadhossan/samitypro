'use client';

import React, { useState } from 'react';
import { 
  X, Check, ShieldCheck, Sliders, PiggyBank, HandCoins, Percent, 
  Award, UserCheck, Layers, Briefcase, Vote, Zap, CreditCard, 
  ScrollText, BookOpen, AlertCircle, Save, Calendar, Users, 
  MessageSquare, Sparkles, CheckCircle2, Lock
} from 'lucide-react';
import { Tenant, SubscriptionPlan, SubscriptionStatus } from '@/types';

interface TenantModulePermissionModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTenant: Tenant) => void;
}

export function TenantModulePermissionModal({
  tenant,
  isOpen,
  onClose,
  onSuccess
}: TenantModulePermissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Core settings form state
  const [status, setStatus] = useState<SubscriptionStatus>(tenant.status || 'ACTIVE');
  const [plan, setPlan] = useState<SubscriptionPlan>(tenant.plan || 'STANDARD');
  const [validUntil, setValidUntil] = useState(tenant.validUntil || '2028-12-31');
  const [smsBalance, setSmsBalance] = useState<number>(tenant.smsBalance ?? 500);
  const [maxMembers, setMaxMembers] = useState<number>(tenant.settings?.maxMembers ?? 500);
  const [maxStaff, setMaxStaff] = useState<number>(tenant.settings?.maxStaff ?? 15);

  // 12 Feature switches
  const [modules, setModules] = useState({
    enableSavings: tenant.settings?.enableSavings ?? tenant.settings?.enableDps ?? true,
    enableLoans: tenant.settings?.enableLoans ?? true,
    enableFdr: tenant.settings?.enableFdr ?? true,
    enableShares: tenant.settings?.enableShares ?? true,
    enableStaffPayroll: tenant.settings?.enableStaffPayroll ?? true,
    enableAssetInventory: tenant.settings?.enableAssetInventory ?? true,
    enableProjects: tenant.settings?.enableProjects ?? true,
    enableElections: tenant.settings?.enableElections ?? true,
    enableSmsAlerts: tenant.settings?.enableSmsAlerts ?? true,
    enableOnlinePayment: tenant.settings?.enableOnlinePayment ?? true,
    enableDocumentGenerator: tenant.settings?.enableDocumentGenerator ?? true,
    enableMemberPortal: tenant.settings?.enableMemberPortal ?? true,
  });

  if (!isOpen) return null;

  const toggleModule = (key: keyof typeof modules) => {
    setModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const applyPreset = (presetPlan: SubscriptionPlan) => {
    setPlan(presetPlan);
    if (presetPlan === 'STARTER') {
      setMaxMembers(100);
      setMaxStaff(3);
      setModules({
        enableSavings: true,
        enableLoans: false,
        enableFdr: false,
        enableShares: false,
        enableStaffPayroll: false,
        enableAssetInventory: false,
        enableProjects: false,
        enableElections: false,
        enableSmsAlerts: true,
        enableOnlinePayment: false,
        enableDocumentGenerator: true,
        enableMemberPortal: true,
      });
    } else if (presetPlan === 'STANDARD') {
      setMaxMembers(500);
      setMaxStaff(15);
      setModules({
        enableSavings: true,
        enableLoans: true,
        enableFdr: true,
        enableShares: true,
        enableStaffPayroll: true,
        enableAssetInventory: false,
        enableProjects: false,
        enableElections: true,
        enableSmsAlerts: true,
        enableOnlinePayment: true,
        enableDocumentGenerator: true,
        enableMemberPortal: true,
      });
    } else if (presetPlan === 'ENTERPRISE') {
      setMaxMembers(10000);
      setMaxStaff(50);
      setModules({
        enableSavings: true,
        enableLoans: true,
        enableFdr: true,
        enableShares: true,
        enableStaffPayroll: true,
        enableAssetInventory: true,
        enableProjects: true,
        enableElections: true,
        enableSmsAlerts: true,
        enableOnlinePayment: true,
        enableDocumentGenerator: true,
        enableMemberPortal: true,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const updatedSettings = {
      ...(tenant.settings || {}),
      enableSavings: modules.enableSavings,
      enableDps: modules.enableSavings,
      enableLoans: modules.enableLoans,
      enableFdr: modules.enableFdr,
      enableShares: modules.enableShares,
      enableStaffPayroll: modules.enableStaffPayroll,
      enableAssetInventory: modules.enableAssetInventory,
      enableProjects: modules.enableProjects,
      enableElections: modules.enableElections,
      enableSmsAlerts: modules.enableSmsAlerts,
      enableOnlinePayment: modules.enableOnlinePayment,
      enableDocumentGenerator: modules.enableDocumentGenerator,
      enableMemberPortal: modules.enableMemberPortal,
      maxMembers,
      maxStaff,
      validUntil
    };

    const payload = {
      id: tenant.id,
      status,
      plan,
      smsBalance,
      settings: updatedSettings
    };

    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'মডিউল ও লাইসেন্স সংরক্ষণে ব্যর্থ হয়েছে');
      }

      setSuccessMsg('সমিতির মডিউল ও লাইসেন্স অনুমতি সফলভাবে হালনাগাদ ও ক্লাউড ডাটাবেজে সংরক্ষিত হয়েছে!');

      const updatedTenant: Tenant = {
        ...tenant,
        status,
        plan,
        smsBalance,
        validUntil,
        settings: updatedSettings
      };

      setTimeout(() => {
        onSuccess(updatedTenant);
        onClose();
      }, 900);

    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const moduleDefinitions: Array<{
    key: keyof typeof modules;
    nameBn: string;
    nameEn: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge: string;
  }> = [
    {
      key: 'enableSavings',
      nameBn: 'সঞ্চয় ও ডিপিএস (Savings & DPS)',
      nameEn: 'Savings & DPS Accounts',
      description: 'দৈনিক, সাপ্তাহিক ও মাসিক সঞ্চয় এবং ডিপিএস স্কিম ও মুনাফা হিসাব',
      icon: PiggyBank,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badge: 'মডিউল ৪'
    },
    {
      key: 'enableLoans',
      nameBn: 'ঋণ ও কিস্তি আদায় (Loans & EMIs)',
      nameEn: 'Loan Disbursal & Installments',
      description: 'ঋণ অনুমোদন, ফিল্ড কালেকশন POS রসিদ, কিস্তি শিডিউল ও খেলাপি মনিটরিং',
      icon: HandCoins,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      badge: 'মডিউল ৫'
    },
    {
      key: 'enableFdr',
      nameBn: 'স্থায়ী আমানত ও মুনাফা (FDR & Growth)',
      nameEn: 'Fixed Term Deposits',
      description: 'মেয়াদি আমানত, দ্বিগুণ বৃদ্ধি স্কিম ও মাসিক/ত্রৈমাসিক মুনাফা ড্র',
      icon: Percent,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badge: 'মডিউল ৫'
    },
    {
      key: 'enableShares',
      nameBn: 'শেয়ার মূলধন ও লভ্যাংশ (Shares & Dividend)',
      nameEn: 'Share Capital & Dividend',
      description: 'সদস্যদের শেয়ার সার্টিফিকেট, অভিহিত মূল্য ও বাৎসরিক লভ্যাংশ বণ্টন',
      icon: Award,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      badge: 'মডিউল ৪'
    },
    {
      key: 'enableStaffPayroll',
      nameBn: 'স্টাফ পেরোল ও এইচআর (Staff & HR)',
      nameEn: 'Employee Payroll & Attendance',
      description: 'কর্মচারী উপস্থিতি, অগ্রিম বেতন কর্তন, বেতন শিট ও পে-স্লিপ প্রিন্ট',
      icon: UserCheck,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      badge: 'মডিউল ৭'
    },
    {
      key: 'enableAssetInventory',
      nameBn: 'স্থাবর সম্পদ ও ইনভেন্টরি (Fixed Assets)',
      nameEn: 'Asset Registry & Depreciation',
      description: 'অফিস ফার্নিচার, কম্পিউটার, জমি ও বাৎসরিক অবচয় (Depreciation) হিসাব',
      icon: Layers,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      badge: 'মডিউল ৬'
    },
    {
      key: 'enableProjects',
      nameBn: 'প্রকল্প ও যৌথ বিনিয়োগ (Projects & Portfolio)',
      nameEn: 'Joint Investments',
      description: 'জায়গা ক্রয়, মৎস্য চাষ, ফ্ল্যাট প্রকল্প ও সদস্যদের যৌথ মুনাফা শেয়ারিং',
      icon: Briefcase,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      badge: 'মডিউল ৩'
    },
    {
      key: 'enableElections',
      nameBn: 'নির্বাচন ও ডিজিটাল ভোট (Elections & Voting)',
      nameEn: 'Executive Voting System',
      description: 'কার্যনির্বাহী কমিটি নির্বাচন, ব্যালট পেপার, লাইভ ভোটিং ও ফলাফল প্রকাশ',
      icon: Vote,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      badge: 'মডিউল ৮'
    },
    {
      key: 'enableSmsAlerts',
      nameBn: 'এসএমএস ও বার্তা অ্যালার্ট (SMS & WhatsApp)',
      nameEn: 'Automated Messaging Hub',
      description: 'টাকা জমা ও কিস্তিতে স্বয়ংক্রিয় এসএমএস এবং বকেয়া রিমাইন্ডার পুশ',
      icon: Zap,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      badge: 'মডিউল ৮'
    },
    {
      key: 'enableOnlinePayment',
      nameBn: 'অনলাইন পেমেন্ট গেটওয়ে (bKash/Nagad)',
      nameEn: 'Automated Payment Gateways',
      description: 'বিকাশ, নগদ ও রকেটের মাধ্যমে সরাসরি অনলাইনে চাঁদা ও কিস্তি গ্রহণ',
      icon: CreditCard,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badge: 'পেমেন্ট'
    },
    {
      key: 'enableDocumentGenerator',
      nameBn: 'প্রত্যয়ন ও দলিল জেনারেটর (Doc Generator)',
      nameEn: 'Certificate & Contract Generator',
      description: 'সদস্য প্রত্যয়নপত্র, নো-অবজেকশন, ঋণ চুক্তিপত্র ও কিউআর ভেরিফাইড দলিল',
      icon: ScrollText,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badge: 'ডকুমেন্ট'
    },
    {
      key: 'enableMemberPortal',
      nameBn: 'ডিজিটাল পাসবই ও মেম্বার পোর্টাল (Member Portal)',
      nameEn: 'Member App & Digital Passbook',
      description: 'সদস্যদের নিজস্ব লগইন, ব্যালান্স যাচাই ও পিডিএফ রসিদ ডাউনলোড',
      icon: BookOpen,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      badge: 'মডিউল ১০'
    },
  ];

  const activeModuleCount = Object.values(modules).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl my-8 rounded-2xl glass-panel bg-slate-900 border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Tier 1 Super Admin Cascading Control
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  status === 'ACTIVE' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                <span>{tenant.nameBn}</span>
                <span className="text-xs text-slate-400 font-normal">({tenant.nameEn})</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Plan Presets Bar */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>সাবস্ক্রিপশন প্যাকেজ প্রি-সেট (1-Click Presets)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                প্ল্যান নির্বাচন করলে সংশ্লিষ্ট ফিচারগুলো স্বয়ংক্রিয়ভাবে সমন্বিত হবে
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset('STARTER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  plan === 'STARTER'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                স্টার্টার (Starter)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('STANDARD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  plan === 'STANDARD'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                স্ট্যান্ডার্ড (Standard)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ENTERPRISE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  plan === 'ENTERPRISE'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                এন্টারপ্রাইজ (All-In)
              </button>
            </div>
          </div>

          {/* License & Quotas Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                সংগঠন স্ট্যাটাস (Status)
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium"
              >
                <option value="ACTIVE">সক্রিয় (ACTIVE)</option>
                <option value="SUSPENDED">স্থগিত (SUSPENDED)</option>
                <option value="EXPIRED">মেয়াদোত্তীর্ণ (EXPIRED)</option>
                <option value="TRIAL">ট্রায়াল (TRIAL)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                লাইসেন্স মেয়াদ (Valid Until)
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                সর্বোচ্চ সদস্য কোটা (Max Members)
              </label>
              <input
                type="number"
                min="10"
                max="100000"
                value={maxMembers}
                onChange={e => setMaxMembers(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                এসএমএস ক্রেডিট (SMS Balance)
              </label>
              <input
                type="number"
                min="0"
                max="500000"
                value={smsBalance}
                onChange={e => setSmsBalance(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Module Toggles Header */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>১২টি কোর মডিউলের লাইসেন্স পারমিশন (Module Switches)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                সুপার অ্যাডমিন যেসব মডিউল বন্ধ রাখবেন, সমিতির সভাপতি বা সাধারণ সদস্যরা তা দেখতে পাবেন না।
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              {activeModuleCount} / 12 মডিউল সক্রিয়
            </div>
          </div>

          {/* 12 Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {moduleDefinitions.map(mod => {
              const Icon = mod.icon;
              const isEnabled = modules[mod.key];

              return (
                <div
                  key={mod.key}
                  onClick={() => toggleModule(mod.key)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer select-none flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${mod.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">
                          {mod.nameBn}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {mod.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}>
                      <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>সুপার অ্যাডমিন কর্তৃক সম্পাদিত প্রতিটি পরিবর্তন অডিট লগে সংরক্ষিত হবে</span>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              বাতিল
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ক্লাউডে সেভ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>লাইসেন্স ও মডিউল সেভ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
