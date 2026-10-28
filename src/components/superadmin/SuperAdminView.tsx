'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Building2, Users, CreditCard, MessageSquare, 
  Plus, CheckCircle2, TrendingUp, DollarSign, Globe, Lock, ExternalLink,
  Sliders, Settings2
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency, toBengaliNumber } from '@/lib/i18n';
import { Tenant, TenantType, SubscriptionPlan } from '@/types';
import { TenantModulePermissionModal } from './TenantModulePermissionModal';

export function SuperAdminView() {
  const { store, tenants, language, setCurrentTenant, updateTenant } = useSamityStore();
  const t = translations[language];

  const [showAddTenant, setShowAddTenant] = useState(false);
  const [selectedTenantForPermissions, setSelectedTenantForPermissions] = useState<Tenant | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New tenant form
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<TenantType>('SAMITY');
  const [regNo, setRegNo] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlan>('STANDARD');

  const totalTenants = tenants.length;
  const mrr = 85000; // 85k BDT monthly revenue
  const totalUsersAcrossTenants = 640;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn || !phone) return;

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      nameBn,
      nameEn: nameEn || nameBn,
      slug: nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-') || `tenant-${Date.now().toString().slice(-4)}`,
      type,
      registrationNo: regNo || `REG-${Date.now().toString().slice(-4)}`,
      establishedYear: new Date().getFullYear(),
      phone,
      email: 'admin@samity.org',
      address: 'ঢাকা, বাংলাদেশ',
      plan,
      status: 'ACTIVE',
      validUntil: '2028-12-31',
      smsBalance: 1000,
      currency: 'BDT',
      settings: {
        enableDps: true,
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
        enableFieldOfficers: true,
        enablePropertyProjects: true,
        enableFixedMonthlySavings: false,
        fixedMonthlyAmount: 10000,
        enableMicroLoans: true,
        samityOperatingModel: 'MULTI_PURPOSE',
        maxMembers: 500,
        maxStaff: 15,
        shareFaceValue: 1000,
        defaultSavingsInterestRate: 8.5,
        defaultLoanInterestRate: 12.0,
        penaltyPerMissedInstallment: 100
      },
      createdAt: new Date().toISOString().split('T')[0]
    };

    store.createTenant(newTenant);

    // Also persist to Neon PostgreSQL
    try {
      await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant)
      });
    } catch {}

    setShowAddTenant(false);
    setNameBn('');
    setNameEn('');
    setPhone('');
    setRegNo('');
    showToast(language === 'bn' ? 'নতুন সমিতি সফলভাবে তৈরি ও ক্লাউড ডাটাবেজে সক্রিয় হয়েছে!' : 'New samity created and activated!');
  };

  return (
    <div className="space-y-6">
      
      {/* Super Admin Welcome Banner */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              SaaS Platform Console
            </span>
            <span className="text-xs text-slate-400 font-mono">Owner: Engr. Sajjad Hossain</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>সুপার অ্যাডমিন কন্ট্রোল প্যানেল (Super Admin Panel)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'সকল সমিতি, ক্লাব ও সংগঠনের কেন্দ্রীয় সার্ভার, লাইসেন্সিং ও বিলিং পরিচালনা' 
              : 'Global multi-tenant provisioning, MRR revenue analytics, and system subscriptions'}
          </p>
        </div>

        <button
          onClick={() => setShowAddTenant(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createSamity}</span>
        </button>
      </div>

      {/* Global SaaS Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>মোট নিবন্ধিত সমিতি ও ক্লাব</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {language === 'bn' ? toBengaliNumber(totalTenants) : totalTenants} টি
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>১০০% ক্লাউড অ্যাক্টিভ</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>মাসিক রিকারিং রেভিনিউ (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(mrr, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">SaaS সাবস্ক্রিপশন আয়</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>মোট সংযুক্ত ইউজার ও সদস্য</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {language === 'bn' ? toBengaliNumber(totalUsersAcrossTenants) : totalUsersAcrossTenants} +
          </div>
          <div className="text-[11px] text-slate-400 mt-1">ওয়েব ও মোবাইল অ্যাপ ব্যবহারকারী</div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>এসএমএস গেটওয়ে ব্যালান্স</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            ৯,৪৫০ টি
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Greenweb ও SSLWireless</div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200">
            {language === 'bn' ? 'সক্রিয় সমিতি ও ক্লাবের তালিকা (Active Tenants)' : 'Registered Samities & Clubs'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            মোট টেন্যান্ট: {tenants.length} টি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">সংগঠনের নাম</th>
                <th className="py-2.5 px-3">ধরন</th>
                <th className="py-2.5 px-3">রেজিস্ট্রেশন নম্বর</th>
                <th className="py-2.5 px-3">প্ল্যান ও মেয়াদ</th>
                <th className="py-2.5 px-3">এসএমএস ব্যালান্স</th>
                <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {tenants.map(t => {
                const isSuspended = t.status === 'SUSPENDED';
                return (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <span>{t.nameBn}</span>
                        {isSuspended && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            স্থগিত (SUSPENDED)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.nameEn} • {t.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {t.registrationNo}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400">{t.plan}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          t.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {t.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">মেয়াদ: {t.validUntil}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-cyan-400">
                      {t.smsBalance ?? 0} টি
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTenantForPermissions(t)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-sans text-xs font-semibold shadow-sm transition cursor-pointer"
                          title="ফিচার ও মডিউল নিয়ন্ত্রণ (Tier 1 Super Admin Cascading Permissions)"
                        >
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          <span>মডিউল নিয়ন্ত্রণ</span>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentTenant(t.id);
                            showToast(language === 'bn' ? `${t.nameBn} এ সফলভাবে সুইচ করা হয়েছে!` : `Switched to ${t.nameEn}!`);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-semibold shadow-sm transition cursor-pointer"
                          title="সমিতিতে প্রবেশ"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>প্রবেশ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Tenant Modal */}
      {showAddTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {language === 'bn' ? 'নতুন সমিতি বা ক্লাব নিবন্ধন করুন' : 'Register New Tenant Organization'}
              </h3>
              <button
                onClick={() => setShowAddTenant(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 py-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">সমিতি বা ক্লাবের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ধানমন্ডি প্রগতি সমবায় সমিতি"
                  value={nameBn}
                  onChange={e => setNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">নাম (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi Progoti Samity"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">সংগঠনের ধরন</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as TenantType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="SAMITY">সমবায় সমিতি (Samity)</option>
                    <option value="CLUB">ক্লাব ও ক্রীড়া সংস্থা (Club)</option>
                    <option value="ASSOCIATION">ব্যবসায়ী সমিতি (Association)</option>
                    <option value="SAVINGS_GROUP">ক্ষুদ্র সঞ্চয় গ্রুপ (Savings Group)</option>
                    <option value="COMMITTEE">পরিচালনা কমিটি (Committee)</option>
                    <option value="CHARITY">দাতব্য ও কল্যাণ সংস্থা (Charity)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">সাবস্ক্রিপশন প্ল্যান</label>
                  <select
                    value={plan}
                    onChange={e => setPlan(e.target.value as SubscriptionPlan)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    <option value="STARTER">স্টার্টার (৳ ১,৫০০/মাস)</option>
                    <option value="STANDARD">স্ট্যান্ডার্ড (৳ ৩,০০০/মাস)</option>
                    <option value="ENTERPRISE">এন্টারপ্রাইজ (৳ ৫,০০০/মাস)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="01711XXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs mb-1 font-medium">সরকারি নিবন্ধন নম্বর</label>
                  <input
                    type="text"
                    placeholder="REG-2026-XXXX"
                    value={regNo}
                    onChange={e => setRegNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTenant(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                >
                  টেন্যান্ট সক্রিয় করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Module Permission Modal */}
      {selectedTenantForPermissions && (
        <TenantModulePermissionModal
          tenant={selectedTenantForPermissions}
          isOpen={true}
          onClose={() => setSelectedTenantForPermissions(null)}
          onSuccess={(updatedTenant) => {
            updateTenant(updatedTenant.id, updatedTenant);
            showToast(language === 'bn' 
              ? `${updatedTenant.nameBn} এর মডিউল ও লাইসেন্স সফলভাবে হালনাগাদ হয়েছে!`
              : `${updatedTenant.nameEn} module permissions updated!`);
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 border border-emerald-500/50 shadow-2xl text-emerald-300 text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
