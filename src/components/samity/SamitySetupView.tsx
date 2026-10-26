'use client';

import React, { useState } from 'react';
import { 
  Building2, Plus, Search, Edit3, Archive, CheckCircle2, 
  MapPin, Phone, Mail, Globe, Landmark, Smartphone, 
  DollarSign, Calendar, ShieldCheck, ArrowRight, Save, 
  RefreshCw, AlertCircle, X, ChevronRight, Share2, 
  Clock, Check, Eye
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { Tenant, TenantType, SamityLifecycleStatus, MobileBankingConfig } from '@/types';
import { formatCurrency, toBengaliNumber } from '@/lib/i18n';

const SAMITY_TYPES: { type: TenantType; labelBn: string; labelEn: string; iconColor: string }[] = [
  { type: 'SAMITY', labelBn: 'সাধারণ সমবায় সমিতি (General Samity)', labelEn: 'General Samity', iconColor: 'text-emerald-400' },
  { type: 'CLUB', labelBn: 'ক্লাব ও ক্রীড়া সংগঠন (Club)', labelEn: 'Club', iconColor: 'text-cyan-400' },
  { type: 'SOCIAL', labelBn: 'সামাজিক সংগঠন (Social Organization)', labelEn: 'Social Organization', iconColor: 'text-teal-400' },
  { type: 'SAVINGS_GROUP', labelBn: 'সঞ্চয় ও ঋণদান সমিতি (Savings Samity)', labelEn: 'Savings Samity', iconColor: 'text-amber-400' },
  { type: 'BUSINESS', labelBn: 'ব্যবসায়ী সমিতি (Business Samity)', labelEn: 'Business Samity', iconColor: 'text-indigo-400' },
  { type: 'RELIGIOUS', labelBn: 'ধর্মীয় ও মসজিদ কমিটি (Religious Committee)', labelEn: 'Religious Committee', iconColor: 'text-emerald-500' },
  { type: 'SCHOOL', labelBn: 'বিদ্যালয় পরিচালনা কমিটি (School Committee)', labelEn: 'School Committee', iconColor: 'text-blue-400' },
  { type: 'CHARITY', labelBn: 'দাতব্য ও কল্যাণ সংস্থা (Charity Organization)', labelEn: 'Charity Organization', iconColor: 'text-rose-400' },
  { type: 'OTHER', labelBn: 'অন্যান্য সমিতি বা সংগঠন (Other)', labelEn: 'Other', iconColor: 'text-slate-400' },
];

const DIVISIONS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

export function SamitySetupView() {
  const { 
    tenants, activeTenant, currentUser, language, 
    setCurrentTenant, store 
  } = useSamityStore();

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Mode: 'DIRECTORY' or 'SETUP_FORM'
  const [viewMode, setViewMode] = useState<'DIRECTORY' | 'SETUP_FORM'>('DIRECTORY');
  const [activeFormTab, setActiveFormTab] = useState<'BASIC' | 'ADDRESS' | 'CONTACT' | 'BANKING' | 'POLICY'>('BASIC');
  
  // Search & Filter in Directory
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Editing state
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Success Alert Toast
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Form Fields State (Matches all specifications)
  const [formData, setFormData] = useState({
    samityId: '',
    nameBn: '',
    nameEn: '',
    type: 'SAMITY' as TenantType,
    registrationNo: '',
    establishedDate: '2020-01-01',
    logoUrl: '',
    sloganBn: '',
    sloganEn: '',
    address: '',
    division: 'ঢাকা',
    district: 'ঢাকা',
    upazila: '',
    postOffice: '',
    villageArea: '',
    phoneNumber: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    website: '',
    facebookPageUrl: '',
    youtubeChannelUrl: '',
    bankAccountName: '',
    bankName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
    bankBranchName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bKashNumber: '',
    bKashType: 'MERCHANT' as 'PERSONAL' | 'MERCHANT',
    nagadNumber: '',
    nagadType: 'PERSONAL' as 'PERSONAL' | 'MERCHANT',
    rocketNumber: '',
    rocketType: 'MERCHANT' as 'PERSONAL' | 'MERCHANT',
    upayNumber: '',
    upayType: 'PERSONAL' as 'PERSONAL' | 'MERCHANT',
    currency: 'BDT',
    monthlySubscriptionAmount: 1500,
    subscriptionDueDay: 10,
    lateFeeEnabled: true,
    lateFeeAmount: 100,
    lateFeeGraceDays: 5,
    financialYearStart: '2026-07-01',
    financialYearEnd: '2027-06-30',
    samityStatus: 'ACTIVE' as SamityLifecycleStatus,
    createdBy: '',
    createdAt: '',
    updatedBy: '',
    updatedAt: ''
  });

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Open Form for Creating New Samity
  const handleOpenCreateNew = () => {
    const nextSamityNumber = tenants.length + 1;
    const generatedId = `SAMITY-2026-00${nextSamityNumber}`;
    const timestamp = new Date().toISOString().split('T')[0];

    setFormData({
      samityId: generatedId,
      nameBn: '',
      nameEn: '',
      type: 'SAMITY',
      registrationNo: `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      establishedDate: timestamp,
      logoUrl: '',
      sloganBn: 'একতাই শক্তি, সঞ্চয়ে সমৃদ্ধি',
      sloganEn: 'Unity is Strength, Prosperity through Savings',
      address: '',
      division: 'ঢাকা',
      district: 'ঢাকা',
      upazila: '',
      postOffice: '',
      villageArea: '',
      phoneNumber: '',
      mobileNumber: '',
      whatsappNumber: '',
      email: '',
      website: '',
      facebookPageUrl: '',
      youtubeChannelUrl: '',
      bankAccountName: '',
      bankName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
      bankBranchName: '',
      bankAccountNumber: '',
      bankRoutingNumber: '',
      bKashNumber: '',
      bKashType: 'MERCHANT',
      nagadNumber: '',
      nagadType: 'PERSONAL',
      rocketNumber: '',
      rocketType: 'MERCHANT',
      upayNumber: '',
      upayType: 'PERSONAL',
      currency: 'BDT',
      monthlySubscriptionAmount: 1500,
      subscriptionDueDay: 10,
      lateFeeEnabled: true,
      lateFeeAmount: 100,
      lateFeeGraceDays: 5,
      financialYearStart: '2026-07-01',
      financialYearEnd: '2027-06-30',
      samityStatus: 'ACTIVE',
      createdBy: currentUser.nameBn,
      createdAt: timestamp,
      updatedBy: currentUser.nameBn,
      updatedAt: timestamp
    });

    setIsEditingExisting(false);
    setSelectedTenantId(null);
    setActiveFormTab('BASIC');
    setViewMode('SETUP_FORM');
  };

  // Open Form for Editing Existing Samity
  const handleOpenEdit = (tenant: Tenant) => {
    const bKash = tenant.mobileBanking?.find(m => m.provider === 'BKASH');
    const nagad = tenant.mobileBanking?.find(m => m.provider === 'NAGAD');
    const rocket = tenant.mobileBanking?.find(m => m.provider === 'ROCKET');
    const upay = tenant.mobileBanking?.find(m => m.provider === 'UPAY');

    setFormData({
      samityId: tenant.samityId || tenant.id,
      nameBn: tenant.nameBn,
      nameEn: tenant.nameEn,
      type: tenant.type,
      registrationNo: tenant.registrationNo || '',
      establishedDate: tenant.establishedDate || `${tenant.establishedYear}-01-01`,
      logoUrl: tenant.logoUrl || '',
      sloganBn: tenant.sloganBn || '',
      sloganEn: tenant.sloganEn || '',
      address: tenant.address || '',
      division: tenant.division || 'ঢাকা',
      district: tenant.district || 'ঢাকা',
      upazila: tenant.upazila || '',
      postOffice: tenant.postOffice || '',
      villageArea: tenant.villageArea || '',
      phoneNumber: tenant.phoneNumber || tenant.phone || '',
      mobileNumber: tenant.mobileNumber || tenant.phone || '',
      whatsappNumber: tenant.whatsappNumber || tenant.phone || '',
      email: tenant.email || '',
      website: tenant.website || '',
      facebookPageUrl: tenant.facebookPageUrl || '',
      youtubeChannelUrl: tenant.youtubeChannelUrl || '',
      bankAccountName: tenant.bankAccountName || tenant.nameBn,
      bankName: tenant.bankName || 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
      bankBranchName: tenant.bankBranchName || '',
      bankAccountNumber: tenant.bankAccountNumber || '',
      bankRoutingNumber: tenant.bankRoutingNumber || '',
      bKashNumber: bKash?.number || '',
      bKashType: bKash?.accountType || 'MERCHANT',
      nagadNumber: nagad?.number || '',
      nagadType: nagad?.accountType || 'PERSONAL',
      rocketNumber: rocket?.number || '',
      rocketType: rocket?.accountType || 'MERCHANT',
      upayNumber: upay?.number || '',
      upayType: upay?.accountType || 'PERSONAL',
      currency: tenant.currency || 'BDT',
      monthlySubscriptionAmount: tenant.monthlySubscriptionAmount || 1500,
      subscriptionDueDay: tenant.subscriptionDueDay || 10,
      lateFeeEnabled: tenant.lateFeeSettings?.enabled ?? true,
      lateFeeAmount: tenant.lateFeeSettings?.amount ?? 100,
      lateFeeGraceDays: tenant.lateFeeSettings?.gracePeriodDays ?? 5,
      financialYearStart: tenant.financialYearStart || '2026-07-01',
      financialYearEnd: tenant.financialYearEnd || '2027-06-30',
      samityStatus: tenant.samityStatus || (tenant.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'),
      createdBy: tenant.createdBy || 'সুপার অ্যাডমিন',
      createdAt: tenant.createdAt || '2024-01-01',
      updatedBy: tenant.updatedBy || currentUser.nameBn,
      updatedAt: tenant.updatedAt || new Date().toISOString().split('T')[0]
    });

    setIsEditingExisting(true);
    setSelectedTenantId(tenant.id);
    setActiveFormTab('BASIC');
    setViewMode('SETUP_FORM');
  };

  // Save / Update Handler
  const handleSaveSamity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn.trim()) {
      alert('অনুগ্রহ করে সমিতির বাংলা নাম প্রদান করুন।');
      return;
    }

    const mobileWallets: MobileBankingConfig[] = [];
    if (formData.bKashNumber) {
      mobileWallets.push({ provider: 'BKASH', number: formData.bKashNumber, accountType: formData.bKashType });
    }
    if (formData.nagadNumber) {
      mobileWallets.push({ provider: 'NAGAD', number: formData.nagadNumber, accountType: formData.nagadType });
    }
    if (formData.rocketNumber) {
      mobileWallets.push({ provider: 'ROCKET', number: formData.rocketNumber, accountType: formData.rocketType });
    }
    if (formData.upayNumber) {
      mobileWallets.push({ provider: 'UPAY', number: formData.upayNumber, accountType: formData.upayType });
    }

    const payload: Partial<Tenant> = {
      samityId: formData.samityId,
      nameBn: formData.nameBn,
      nameEn: formData.nameEn || formData.nameBn,
      slug: (formData.nameEn || formData.nameBn).toLowerCase().replace(/[^a-z0-9]/g, '-') || `samity-${Date.now()}`,
      type: formData.type,
      registrationNo: formData.registrationNo,
      establishedDate: formData.establishedDate,
      establishedYear: parseInt(formData.establishedDate.split('-')[0]) || 2020,
      sloganBn: formData.sloganBn,
      sloganEn: formData.sloganEn,
      logoUrl: formData.logoUrl,
      address: formData.address,
      division: formData.division,
      district: formData.district,
      upazila: formData.upazila,
      postOffice: formData.postOffice,
      villageArea: formData.villageArea,
      phone: formData.mobileNumber || formData.phoneNumber,
      phoneNumber: formData.phoneNumber,
      mobileNumber: formData.mobileNumber,
      whatsappNumber: formData.whatsappNumber,
      email: formData.email,
      website: formData.website,
      facebookPageUrl: formData.facebookPageUrl,
      youtubeChannelUrl: formData.youtubeChannelUrl,
      bankAccountName: formData.bankAccountName || formData.nameBn,
      bankName: formData.bankName,
      bankBranchName: formData.bankBranchName,
      bankAccountNumber: formData.bankAccountNumber,
      bankRoutingNumber: formData.bankRoutingNumber,
      mobileBanking: mobileWallets,
      currency: 'BDT',
      monthlySubscriptionAmount: Number(formData.monthlySubscriptionAmount),
      subscriptionDueDay: Number(formData.subscriptionDueDay),
      lateFeeSettings: {
        enabled: formData.lateFeeEnabled,
        amount: Number(formData.lateFeeAmount),
        gracePeriodDays: Number(formData.lateFeeGraceDays)
      },
      financialYearStart: formData.financialYearStart,
      financialYearEnd: formData.financialYearEnd,
      samityStatus: formData.samityStatus,
      status: formData.samityStatus === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
      updatedBy: currentUser.nameBn,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (isEditingExisting && selectedTenantId) {
      store.updateSamity(selectedTenantId, payload);
      showAlert(`সমিতির তথ্য সফলভাবে হালনাগাদ করা হয়েছে: ${formData.nameBn}`);
    } else {
      const newTenant: Tenant = {
        id: `tenant-${Date.now()}`,
        plan: 'ENTERPRISE',
        smsBalance: 1000,
        validUntil: '2028-12-31',
        settings: {
          enableDps: true,
          enableLoans: true,
          enableElections: true,
          enableSmsAlerts: true,
          enableOnlinePayment: true,
          shareFaceValue: 1000,
          defaultSavingsInterestRate: 8.5,
          defaultLoanInterestRate: 12.0,
          penaltyPerMissedInstallment: 100
        },
        createdBy: currentUser.nameBn,
        createdAt: new Date().toISOString().split('T')[0],
        ...payload
      } as Tenant;

      store.createSamity(newTenant);
      showAlert(`নতুন সমিতি সফলভাবে তৈরি ও সংরক্ষিত হয়েছে: ${formData.nameBn}`);
    }

    setViewMode('DIRECTORY');
  };

  // Handle Logo Upload (Simulated Data URL reader)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered tenants list
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.nameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.samityId && t.samityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.registrationNo && t.registrationNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.district && t.district.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || (t.samityStatus || t.status) === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {alertMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{alertMsg}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              মডিউল ১: সমিতি সেটআপ ও মাল্টি-টেন্যান্ট হাব
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              লাইভ ক্লাউড সিঙ্ক
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <span>সমিতি সেটআপ ও পরিচালনা কেন্দ্র (Samity Setup)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            প্রতিটি সমিতির নিজস্ব সদস্য, ব্যাংক হিসাব, চাঁদা পলিসি, লেটারহেড, সিল-স্বাক্ষর ও সেটিংস পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {viewMode === 'SETUP_FORM' ? (
            <button
              onClick={() => setViewMode('DIRECTORY')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>সমিতি তালিকায় ফিরুন</span>
            </button>
          ) : (
            <>
              {isSuperAdmin && (
                <button
                  onClick={handleOpenCreateNew}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সমিতি নিবন্ধন করুন</span>
                </button>
              )}
              {!isSuperAdmin && (
                <button
                  onClick={() => handleOpenEdit(activeTenant)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>বর্তমান সমিতি প্রোফাইল সম্পাদনা</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mode 1: DIRECTORY / LIST VIEW */}
      {viewMode === 'DIRECTORY' && (
        <div className="space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">নিবন্ধিত মোট সমিতি</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {language === 'bn' ? toBengaliNumber(tenants.length) : tenants.length} টি
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">মাল্টি-টেন্যান্ট আইসোলেশন</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">সক্রিয় সমিতি</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {language === 'bn' ? toBengaliNumber(tenants.filter(t => (t.samityStatus || t.status) === 'ACTIVE').length) : tenants.filter(t => (t.samityStatus || t.status) === 'ACTIVE').length} টি
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">ক্লাউড একটিভ নোড</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">ডিফল্ট মাসিক চাঁদা</div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
                {formatCurrency(activeTenant?.monthlySubscriptionAmount || 1500)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">মাসের {activeTenant?.subscriptionDueDay || 10} তারিখের মধ্যে</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">বর্তমান সক্রিয় সমিতি</div>
              <div className="text-sm font-bold text-amber-400 mt-1.5 truncate">
                {activeTenant?.nameBn}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {activeTenant?.samityId || activeTenant?.id}
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="সমিতির নাম, আইডি, রেজিঃ নম্বর বা জেলা দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
              >
                <option value="ALL">সকল ধরন (All Types)</option>
                {SAMITY_TYPES.map(st => (
                  <option key={st.type} value={st.type}>{st.labelBn}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="ACTIVE">সক্রিয় (Active)</option>
                <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                <option value="ARCHIVED">আর্কাইভড (Archived)</option>
              </select>
            </div>
          </div>

          {/* Samity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map(tenant => {
              const isCurrent = tenant.id === activeTenant?.id;
              const typeInfo = SAMITY_TYPES.find(s => s.type === tenant.type) || SAMITY_TYPES[0];
              const status = tenant.samityStatus || tenant.status;

              return (
                <div 
                  key={tenant.id}
                  className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isCurrent 
                      ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-slate-900 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {tenant.samityId || tenant.id}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            সক্রিয় সেশন
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : status === 'ARCHIVED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {status === 'ACTIVE' ? 'সক্রিয়' : status === 'ARCHIVED' ? 'আর্কাইভড' : 'নিষ্ক্রিয়'}
                        </span>
                      </div>
                    </div>

                    {/* Logo & Identity */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 p-0.5 shrink-0 flex items-center justify-center shadow-md">
                        {tenant.logoUrl ? (
                          <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[10px]" />
                        ) : (
                          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-white text-base">
                            {tenant.nameBn.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-white leading-snug truncate">
                          {tenant.nameBn}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {tenant.nameEn}
                        </p>
                        {tenant.sloganBn && (
                          <p className="text-[11px] text-emerald-400 italic mt-0.5 truncate">
                            &ldquo;{tenant.sloganBn}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block">সংগঠনের ধরন:</span>
                        <span className="text-slate-300 font-medium truncate block">
                          {typeInfo.labelEn}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">রেজিস্ট্রেশন নম্বর:</span>
                        <span className="text-slate-300 font-mono font-medium truncate block">
                          {tenant.registrationNo || 'প্রযোজ্য নয়'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">অবস্থান / জেলা:</span>
                        <span className="text-slate-300 font-medium truncate block">
                          {tenant.district ? `${tenant.upazila || ''}, ${tenant.district}` : tenant.address}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">প্রতিষ্ঠার সন:</span>
                        <span className="text-slate-300 font-medium block">
                          {tenant.establishedDate || `${tenant.establishedYear} সাল`}
                        </span>
                      </div>
                    </div>

                    {/* Bank & Mobile Banking Info */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Landmark className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">
                          {tenant.bankName || 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {tenant.phone || tenant.mobileNumber || 'নম্বর দেওয়া হয়নি'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEdit(tenant)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>সেটআপ</span>
                    </button>

                    {isCurrent ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>বর্তমান সমিতি</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentTenant(tenant.id);
                          showAlert(`সফলভাবে স্থানান্তরিত হয়েছেন: ${tenant.nameBn}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <span>প্রবেশ করুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Mode 2: STEP-BY-STEP COMPLETE SETUP FORM */}
      {viewMode === 'SETUP_FORM' && (
        <form onSubmit={handleSaveSamity} className="space-y-6 animate-in fade-in duration-200">
          
          {/* Sub-tab Navigation Bar */}
          <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveFormTab('BASIC')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeFormTab === 'BASIC'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>১. মৌলিক তথ্য ও পরিচয়</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('ADDRESS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeFormTab === 'ADDRESS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>২. ঠিকানা ও অবস্থান</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('CONTACT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeFormTab === 'CONTACT'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>৩. যোগাযোগ ও সোশ্যাল</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('BANKING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeFormTab === 'BANKING'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>৪. ব্যাংক ও মোবাইল ব্যাংকিং</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('POLICY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeFormTab === 'POLICY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>৫. চাঁদা ও অর্থবছর পলিসি</span>
            </button>
          </div>

          {/* Form Content Area */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            
            {/* SUB-TAB 1: BASIC INFORMATION */}
            {activeFormTab === 'BASIC' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">সমিতির পরিচিতি ও মৌলিক তথ্য</h3>
                  <p className="text-xs text-slate-400">সমিতির অফিশিয়াল নাম, ধরন, রেজিস্ট্রেশন এবং স্লোগান নির্ধারণ করুন।</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Samity ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সমিতি আইডি (Samity ID) *
                    </label>
                    <input
                      type="text"
                      value={formData.samityId}
                      onChange={e => setFormData({ ...formData, samityId: e.target.value })}
                      required
                      placeholder="e.g. SAMITY-2026-001"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* Samity Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সমিতির ধরন (Samity Type) *
                    </label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as TenantType })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {SAMITY_TYPES.map(st => (
                        <option key={st.type} value={st.type}>{st.labelBn}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name Bangla */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সমিতির নাম (বাংলায়) *
                    </label>
                    <input
                      type="text"
                      value={formData.nameBn}
                      onChange={e => setFormData({ ...formData, nameBn: e.target.value })}
                      required
                      placeholder="e.g. একতা বহুমুখী সমবায় সমিতি লিঃ"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Name English */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সমিতির নাম (ইংরেজি) *
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Ekota Multipurpose Co-operative Society Ltd."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Registration No */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সরকারি নিবন্ধন নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNo}
                      onChange={e => setFormData({ ...formData, registrationNo: e.target.value })}
                      placeholder="e.g. REG-DHAKA-2018-9842"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* Established Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      প্রতিষ্ঠার তারিখ (Established Date)
                    </label>
                    <input
                      type="date"
                      value={formData.establishedDate}
                      onChange={e => setFormData({ ...formData, establishedDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Slogan Bangla */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সমিতির স্লোগান (বাংলায়)
                    </label>
                    <input
                      type="text"
                      value={formData.sloganBn}
                      onChange={e => setFormData({ ...formData, sloganBn: e.target.value })}
                      placeholder="e.g. একতাই বল, সঞ্চয়েই সমৃদ্ধি"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Slogan English */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সমিতির স্লোগান (ইংরেজি)
                    </label>
                    <input
                      type="text"
                      value={formData.sloganEn}
                      onChange={e => setFormData({ ...formData, sloganEn: e.target.value })}
                      placeholder="e.g. Unity is Strength, Prosperity through Savings"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center shrink-0">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="text-xs font-bold text-white">সমিতি অফিশিয়াল লোগো আপলোড</div>
                    <p className="text-[11px] text-slate-400">রসিদ, ভাউচার ও প্রত্যয়নপত্রে এই লোগো ব্যবহৃত হবে। (PNG/JPG, সর্বোচ্চ 2MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: ADDRESS & GEOLOCATION */}
            {activeFormTab === 'ADDRESS' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">ঠিকানা ও ভৌগোলিক অবস্থান</h3>
                  <p className="text-xs text-slate-400">সমিতির রেজিস্টার্ড কার্যালয় ও ডাক যোগাযোগের পূর্ণাঙ্গ বিবরণ।</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Division */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      বিভাগ (Division) *
                    </label>
                    <select
                      value={formData.division}
                      onChange={e => setFormData({ ...formData, division: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {DIVISIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      জেলা (District) *
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. ঢাকা"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Upazila / Thana */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      উপজেলা / থানা (Upazila / Thana)
                    </label>
                    <input
                      type="text"
                      value={formData.upazila}
                      onChange={e => setFormData({ ...formData, upazila: e.target.value })}
                      placeholder="e.g. রামপুরা / ধানমন্ডি"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Post Office */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      ডাকঘর ও পোস্ট কোড (Post Office)
                    </label>
                    <input
                      type="text"
                      value={formData.postOffice}
                      onChange={e => setFormData({ ...formData, postOffice: e.target.value })}
                      placeholder="e.g. বনশ্রী - ১২১৯"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Village / Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      গ্রাম / এলাকা / ওয়ার্ড (Village / Area)
                    </label>
                    <input
                      type="text"
                      value={formData.villageArea}
                      onChange={e => setFormData({ ...formData, villageArea: e.target.value })}
                      placeholder="e.g. ব্লক সি, আবাসিক এলাকা"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Full Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      পূর্ণাঙ্গ ঠিকানা (Full Address Line)
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. বাড়ি ১২, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা-১২১৯"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: CONTACT & SOCIAL PRESENCE */}
            {activeFormTab === 'CONTACT' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">যোগাযোগ ও সোশ্যাল মিডিয়া লিঙ্কসমূহ</h3>
                  <p className="text-xs text-slate-400">সদস্য ও শুভানুধ্যায়ীদের যোগাযোগের জন্য অফিসিয়াল ফোন, মোবাইল, ইমেইল ও সোশ্যাল মিডিয়া।</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      অফিস ফোন নম্বর (Phone Number)
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="e.g. 02-9823456"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      অফিসিয়াল মোবাইল নম্বর (Mobile Number) *
                    </label>
                    <input
                      type="text"
                      value={formData.mobileNumber}
                      onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="e.g. +8801711223344"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappNumber}
                      onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="e.g. +8801711223344"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      অফিসিয়াল ইমেইল (Email)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. info@samity.org"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      অফিসিয়াল ওয়েবসাইট (Website)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      placeholder="e.g. https://samity.org"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* Facebook Page */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      ফেসবুক পেজ লিঙ্ক (Facebook Page URL)
                    </label>
                    <input
                      type="url"
                      value={formData.facebookPageUrl}
                      onChange={e => setFormData({ ...formData, facebookPageUrl: e.target.value })}
                      placeholder="e.g. https://facebook.com/samity"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* YouTube Channel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      ইউটিউব চ্যানেল লিঙ্ক (YouTube Channel URL, ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeChannelUrl}
                      onChange={e => setFormData({ ...formData, youtubeChannelUrl: e.target.value })}
                      placeholder="e.g. https://youtube.com/@samity"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: BANKING & MOBILE WALLETS */}
            {activeFormTab === 'BANKING' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">ব্যাংক অ্যাকাউন্ট ও মোবাইল ব্যাংকিং হিসাব</h3>
                  <p className="text-xs text-slate-400">সদস্যদের জমা, চাঁদা সংগ্রহ ও ভাউচার রসিদে প্রদর্শনের জন্য অফিশিয়াল ব্যাংক ও মোবাইল ওয়ালেট বিবরণ।</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4 h-4" />
                    <span>১. প্রধান ব্যাংক অ্যাকাউন্ট তথ্য</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">ব্যাংক হিসাবের নাম (Bank Account Name)</label>
                      <input
                        type="text"
                        value={formData.bankAccountName}
                        onChange={e => setFormData({ ...formData, bankAccountName: e.target.value })}
                        placeholder="e.g. একতা বহুমুখী সমবায় সমিতি লিঃ"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">ব্যাংকের নাম (Bank Name)</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="e.g. ইসলামী ব্যাংক বাংলাদেশ পিএলসি"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">শাখার নাম (Bank Branch Name)</label>
                      <input
                        type="text"
                        value={formData.bankBranchName}
                        onChange={e => setFormData({ ...formData, bankBranchName: e.target.value })}
                        placeholder="e.g. বনশ্রী শাখা, ঢাকা"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">অ্যাকাউন্ট নম্বর (Bank Account Number)</label>
                      <input
                        type="text"
                        value={formData.bankAccountNumber}
                        onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                        placeholder="e.g. ২০৫০১২৩৪৫৬৭৮৯০১"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">রাউটিং নম্বর (Bank Routing Number)</label>
                      <input
                        type="text"
                        value={formData.bankRoutingNumber}
                        onChange={e => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                        placeholder="e.g. ১২৫২৬০৮৯৪"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Banking Accounts */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>২. মোবাইল ব্যাংকিং ওয়ালেট (bKash, Nagad, Rocket, Upay)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* bKash */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-pink-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-pink-400">
                        <span>বিকাশ (bKash)</span>
                        <select
                          value={formData.bKashType}
                          onChange={e => setFormData({ ...formData, bKashType: e.target.value as any })}
                          className="bg-slate-950 text-[10px] border border-slate-700 rounded px-2 py-0.5"
                        >
                          <option value="MERCHANT">মার্চেন্ট (Merchant)</option>
                          <option value="PERSONAL">পার্সোনাল (Personal)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={formData.bKashNumber}
                        onChange={e => setFormData({ ...formData, bKashNumber: e.target.value })}
                        placeholder="বিকাশ নম্বর (e.g. 01711223344)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>

                    {/* Nagad */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-orange-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-orange-400">
                        <span>নগদ (Nagad)</span>
                        <select
                          value={formData.nagadType}
                          onChange={e => setFormData({ ...formData, nagadType: e.target.value as any })}
                          className="bg-slate-950 text-[10px] border border-slate-700 rounded px-2 py-0.5"
                        >
                          <option value="MERCHANT">মার্চেন্ট (Merchant)</option>
                          <option value="PERSONAL">পার্সোনাল (Personal)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={formData.nagadNumber}
                        onChange={e => setFormData({ ...formData, nagadNumber: e.target.value })}
                        placeholder="নগদ নম্বর (e.g. 01711223344)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>

                    {/* Rocket */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                        <span>রকেট (Rocket)</span>
                        <select
                          value={formData.rocketType}
                          onChange={e => setFormData({ ...formData, rocketType: e.target.value as any })}
                          className="bg-slate-950 text-[10px] border border-slate-700 rounded px-2 py-0.5"
                        >
                          <option value="MERCHANT">মার্চেন্ট (Merchant)</option>
                          <option value="PERSONAL">পার্সোনাল (Personal)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={formData.rocketNumber}
                        onChange={e => setFormData({ ...formData, rocketNumber: e.target.value })}
                        placeholder="রকেট নম্বর (e.g. 017112233448)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>

                    {/* Upay */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-yellow-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-yellow-400">
                        <span>উপায় (Upay)</span>
                        <select
                          value={formData.upayType}
                          onChange={e => setFormData({ ...formData, upayType: e.target.value as any })}
                          className="bg-slate-950 text-[10px] border border-slate-700 rounded px-2 py-0.5"
                        >
                          <option value="MERCHANT">মার্চেন্ট (Merchant)</option>
                          <option value="PERSONAL">পার্সোনাল (Personal)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={formData.upayNumber}
                        onChange={e => setFormData({ ...formData, upayNumber: e.target.value })}
                        placeholder="উপায় নম্বর (e.g. 01711223344)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: POLICY, FINANCIAL YEAR & STATUS */}
            {activeFormTab === 'POLICY' && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">চাঁদা পলিসি, জরিমানা ও অর্থবছর সেটিংস</h3>
                  <p className="text-xs text-slate-400">মাসিক চাঁদার পরিমাণ, জমাদানের শেষ সময়, জরিমানা বিধি ও আর্থিক বছর নির্ধারণ করুন।</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Currency */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      কারেন্সি (Currency)
                    </label>
                    <input
                      type="text"
                      value={formData.currency}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">নিয়ম অনুযায়ী ডিফল্ট কারেন্সি BDT (৳) নির্ধারিত।</span>
                  </div>

                  {/* Monthly Subscription */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      ডিফল্ট মাসিক চাঁদার পরিমাণ (BDT) *
                    </label>
                    <input
                      type="number"
                      value={formData.monthlySubscriptionAmount}
                      onChange={e => setFormData({ ...formData, monthlySubscriptionAmount: Number(e.target.value) })}
                      min="0"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  {/* Due Day */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      প্রতি মাসের চাঁদা পরিশোধের শেষ দিন (Due Day of Month)
                    </label>
                    <select
                      value={formData.subscriptionDueDay}
                      onChange={e => setFormData({ ...formData, subscriptionDueDay: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>মাসের {day} তারিখ</option>
                      ))}
                    </select>
                  </div>

                  {/* Samity Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      সমিতির স্ট্যাটাস (Samity Status) *
                    </label>
                    <select
                      value={formData.samityStatus}
                      onChange={e => setFormData({ ...formData, samityStatus: e.target.value as SamityLifecycleStatus })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                    >
                      <option value="ACTIVE">সক্রিয় (Active)</option>
                      <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                      <option value="ARCHIVED">আর্কাইভড (Archived)</option>
                    </select>
                  </div>
                </div>

                {/* Late Fee Settings Card */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-400">বিলম্ব ফি / জরিমানা বিধি (Late Fee Settings)</div>
                      <p className="text-[11px] text-slate-400">নির্ধারিত তারিখ পার হলে বকেয়া চাঁদার সাথে জরিমানা যোগ হবে কি না।</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.lateFeeEnabled}
                      onChange={e => setFormData({ ...formData, lateFeeEnabled: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  {formData.lateFeeEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">জরিমানার পরিমাণ (Late Fee Amount ৳)</label>
                        <input
                          type="number"
                          value={formData.lateFeeAmount}
                          onChange={e => setFormData({ ...formData, lateFeeAmount: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">গ্রেস পিরিয়ড / ছাড়ের সময় (Grace Period Days)</label>
                        <input
                          type="number"
                          value={formData.lateFeeGraceDays}
                          onChange={e => setFormData({ ...formData, lateFeeGraceDays: Number(e.target.value) })}
                          placeholder="e.g. 5 দিন"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Year Start & End */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>অর্থবছর সময়কাল (Financial Year Duration)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">অর্থবছর শুরুর তারিখ (Start Date)</label>
                      <input
                        type="date"
                        value={formData.financialYearStart}
                        onChange={e => setFormData({ ...formData, financialYearStart: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">অর্থবছর সমাপ্তির তারিখ (End Date)</label>
                      <input
                        type="date"
                        value={formData.financialYearEnd}
                        onChange={e => setFormData({ ...formData, financialYearEnd: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Audit Information Metadata */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-500">তৈরি করেছেন: </span>
                    <strong className="text-slate-300">{formData.createdBy || 'সুপার অ্যাডমিন'}</strong> ({formData.createdAt})
                  </div>
                  <div>
                    <span className="text-slate-500">সর্বশেষ আপডেট: </span>
                    <strong className="text-slate-300">{formData.updatedBy || currentUser.nameBn}</strong> ({formData.updatedAt})
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Actions Form Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('DIRECTORY')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                বাতিল করুন
              </button>

              <div className="flex items-center gap-2">
                {activeFormTab !== 'POLICY' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeFormTab === 'BASIC') setActiveFormTab('ADDRESS');
                      else if (activeFormTab === 'ADDRESS') setActiveFormTab('CONTACT');
                      else if (activeFormTab === 'CONTACT') setActiveFormTab('BANKING');
                      else if (activeFormTab === 'BANKING') setActiveFormTab('POLICY');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>পরবর্তী ধাপ</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditingExisting ? 'সমিতির তথ্য সংরক্ষণ করুন' : 'নতুন সমিতি নিবন্ধন সম্পন্ন করুন'}</span>
                </button>
              </div>
            </div>

          </div>
        </form>
      )}

    </div>
  );
}
