'use client';

import React from 'react';
import { 
  X, LayoutDashboard, BadgePercent, Building2, Users, 
  PiggyBank, HandCoins, ReceiptText, ShieldCheck, Zap, 
  ScrollText, Bell, FolderLock, CalendarCheck, Vote, 
  FileBarChart, History, Database, Sliders, Smartphone, 
  Globe, ArrowRightLeft, Check, AlertTriangle, BookOpen,
  Briefcase, Award, Percent, Layers, UserCheck, CreditCard,
  MessageSquare, ShieldAlert
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { UserRole, APP_VERSION } from '@/types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenApkModal: () => void;
}

export function MobileMenuDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onOpenApkModal
}: MobileMenuDrawerProps) {
  const { 
    currentUser, activeTenant, language, setLanguage, 
    setCurrentUser, offlineQueue, syncOfflineQueue, users
  } = useSamityStore();

  if (!isOpen) return null;

  const handleNavigate = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  const superAdminUser = users.find(u => u.role === 'SUPER_ADMIN');
  const superAdminId = superAdminUser?.id || 'user-sajjad-owner';

  const roleOptions: { role: UserRole; labelBn: string; userId: string }[] = [
    { role: 'SUPER_ADMIN', labelBn: 'সুপার অ্যাডমিন', userId: superAdminId },
    { role: 'SAMITY_ADMIN', labelBn: 'সভাপতি (অ্যাডমিন)', userId: 'user-rafiq' },
    { role: 'MANAGER', labelBn: 'ম্যানেজার / কোষাধ্যক্ষ', userId: 'user-tareq' },
    ...(activeTenant?.settings?.enableFieldOfficers !== false ? [
      { role: 'FIELD_COLLECTOR' as UserRole, labelBn: 'মাঠ কর্মী (কালেক্টর)', userId: 'user-sumon' }
    ] : []),
    { role: 'MEMBER', labelBn: 'সাধারণ সদস্য (কবির)', userId: 'user-kabir' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-10 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-20 max-w-full flex pointer-events-auto">
        <div 
          className="relative w-screen max-w-xs sm:max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
          onClick={e => e.stopPropagation()}
        >
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                    {currentUser.role === 'SUPER_ADMIN' ? 'সুপার অ্যাডমিন' : 
                     currentUser.role === 'SAMITY_ADMIN' ? 'সমিতি সভাপতি' :
                     currentUser.role === 'MANAGER' ? 'ম্যানেজার' :
                     currentUser.role === 'FIELD_COLLECTOR' ? 'কালেক্টর' : 'সদস্য'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{APP_VERSION}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Scrollable Categories */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* Quick Status / Offline Queue */}
            {offlineQueue.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>পেন্ডিং অফলাইন সিঙ্ক ({offlineQueue.length})</span>
                </div>
                <button
                  onClick={() => syncOfflineQueue()}
                  className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                >
                  সিঙ্ক করুন
                </button>
              </div>
            )}

            {/* Conditional Navigation based on Role & Module Permissions */}
            {currentUser.role === 'SUPER_ADMIN' ? (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>সুপার অ্যাডমিন প্ল্যাটফর্ম কন্ট্রোল</span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate('saas-overview')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'saas-overview'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      <span>এসএএএস ওভারভিউ (SaaS Overview)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('samity-setup')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'samity-setup'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>সমিতি সেটআপ ও পরিচালনা (Directory)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('tenants')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'tenants'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>সমিতি ও সংগঠনসমূহ (Tenants)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('subscriptions')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'subscriptions'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>সাবস্ক্রিপশন ও বিলিং (Billing)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('payment-gateways')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'payment-gateways'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-pink-400" />
                      <span>অনলাইন পেমেন্ট গেটওয়ে (Payment Gateways)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('gateways')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'gateways'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-yellow-400" />
                      <span>মেসেজিং ও এসএমএস গেটওয়ে (SMS Gateways)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('audit-logs')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'audit-logs'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>সিস্টেম অডিট লগ (System Audit Logs)</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : currentUser.role === 'MEMBER' ? (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>সদস্য ডিজিটাল পোর্টাল</span>
                </div>
                <div className="space-y-1">
                  {activeTenant?.settings?.enableMemberPortal !== false && (
                    <button
                      onClick={() => handleNavigate('member-passbook')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'member-passbook'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span>আমার ডিজিটাল পাসবই (Passbook)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">মডিউল ১০</span>
                    </button>
                  )}

                  {activeTenant?.settings?.enableOnlinePayment !== false && (
                    <button
                      onClick={() => handleNavigate('online-payment')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'online-payment'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-pink-400" />
                        <span>অনলাইন পেমেন্ট (bKash/নগদ)</span>
                      </div>
                    </button>
                  )}

                  {activeTenant?.settings?.enableFdr !== false && (
                    <button
                      onClick={() => handleNavigate('fdr')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'fdr'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Percent className="w-4 h-4 text-amber-400" />
                        <span>আমার স্থায়ী আমানত (FDR)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">মডিউল ৫</span>
                    </button>
                  )}

                  {activeTenant?.settings?.enableProjects !== false && (
                    <button
                      onClick={() => handleNavigate('projects')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'projects'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <span>আমার প্রকল্প বিনিয়োগ (Projects)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">মডিউল ৩</span>
                    </button>
                  )}

                  {activeTenant?.settings?.enableShares !== false && (
                    <button
                      onClick={() => handleNavigate('shares-dividend')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'shares-dividend'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-teal-400" />
                        <span>আমার শেয়ার ও লভ্যাংশ (Shares)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">মডিউল ৪</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavigate('subscriptions-due')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'subscriptions-due'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BadgePercent className="w-4 h-4 text-indigo-400" />
                      <span>আমার চাঁদা ও রসিদ (My Fees & Receipts)</span>
                    </div>
                  </button>

                  {(activeTenant?.settings?.enableLoans !== false && activeTenant?.settings?.enableMicroLoans !== false) && (
                    <button
                      onClick={() => handleNavigate('member-loans')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'member-loans'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <HandCoins className="w-4 h-4 text-rose-400" />
                        <span>আমার ঋণ ও কিস্তি (My Loans & EMIs)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">মডিউল ৫</span>
                    </button>
                  )}

                  {activeTenant?.settings?.enableElections !== false && (
                    <button
                      onClick={() => handleNavigate('member-elections')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'member-elections'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Vote className="w-4 h-4 text-purple-400" />
                        <span>ভোট প্রদান ও নির্বাচন (Cast Vote)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">মডিউল ৮</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavigate('notices')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'notices'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span>নোটিশ বোর্ড ও রেজোলিউশন (Notices)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('documents')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      activeTab === 'documents'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderLock className="w-4 h-4 text-sky-400" />
                      <span>সমিতির নথি ও গঠনতন্ত্র (By-Laws)</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Category 1: প্রধান বোর্ড ও হিসাবসমূহ (Core Boards) */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 mb-2 flex items-center gap-1.5">
                    <span>১. প্রধান বোর্ড ও হিসাবসমূহ</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'dashboard'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        <span>ড্যাশবোর্ড (Dashboard)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">লাইভ</span>
                    </button>

                    {activeTenant?.settings?.enableProjects !== false && (
                      <button
                        onClick={() => handleNavigate('projects')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'projects'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          <span>প্রকল্প ও যৌথ বিনিয়োগ (Projects)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">মডিউল ৩</span>
                      </button>
                    )}

                    {activeTenant?.settings?.enableShares !== false && (
                      <button
                        onClick={() => handleNavigate('shares-dividend')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'shares-dividend'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Award className="w-4 h-4 text-teal-400" />
                          <span>শেয়ার মূলধন ও লভ্যাংশ (Shares & Dividend)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">মডিউল ৪</span>
                      </button>
                    )}

                    {activeTenant?.settings?.enableFdr !== false && (
                      <button
                        onClick={() => handleNavigate('fdr')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'fdr'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Percent className="w-4 h-4 text-amber-400" />
                          <span>ফিক্সড ডিপোজিট (FDR & Double Growth)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">মডিউল ৫</span>
                      </button>
                    )}

                    {activeTenant?.settings?.enableAssetInventory !== false && (
                      <button
                        onClick={() => handleNavigate('fixed-assets')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'fixed-assets'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span>স্থাবর সম্পদ ও ইনভেন্টরি (Fixed Assets)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">মডিউল ৬</span>
                      </button>
                    )}

                    {activeTenant?.settings?.enableStaffPayroll !== false && (
                      <button
                        onClick={() => handleNavigate('staff-payroll')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'staff-payroll'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-blue-400" />
                          <span>স্টাফ পেরোল ও এইচআর (Payroll & HR)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">মডিউল ৭</span>
                      </button>
                    )}

                    {activeTenant?.settings?.enableSmsAlerts !== false && (
                      <button
                        onClick={() => handleNavigate('communication-hub')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'communication-hub'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span>এসএমএস ও হোয়াটসঅ্যাপ (SMS & WhatsApp)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">মডিউল ৮</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate('samity-setup')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'samity-setup'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>সমিতি সেটআপ ও প্রোফাইল (Setup)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">মডিউল ১</span>
                    </button>

                    <button
                      onClick={() => handleNavigate('subscriptions-due')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'subscriptions-due'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BadgePercent className="w-4 h-4 text-emerald-400" />
                        <span>চাঁদা ও বকেয়া পলিসি (Subscription)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">মডিউল ৩</span>
                    </button>

                    <button
                      onClick={() => handleNavigate('bank-deposits')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'bank-deposits'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>ব্যাংক হিসাব ও জমা (Bank Accounts)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">ব্যাংক</span>
                    </button>

                    <button
                      onClick={() => handleNavigate('members')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'members'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>সদস্য ব্যবস্থাপনা ও কেওয়াইসি (Members)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">মডিউল ২</span>
                    </button>

                    {(activeTenant?.settings?.enableSavings !== false && activeTenant?.settings?.enableDps !== false) && (
                      <button
                        onClick={() => handleNavigate('savings')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'savings'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <PiggyBank className="w-4 h-4 text-emerald-400" />
                          <span>সঞ্চয় ও ডিপিএস হিসাব (Savings & DPS)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">মডিউল ৪</span>
                      </button>
                    )}

                    {(activeTenant?.settings?.enableLoans !== false && activeTenant?.settings?.enableMicroLoans !== false) && (
                      <button
                        onClick={() => handleNavigate('loans')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'loans'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <HandCoins className="w-4 h-4 text-rose-400" />
                          <span>ঋণ ও কিস্তি আদায় (Loans & EMIs)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">মডিউল ৫</span>
                      </button>
                    )}

                    {(activeTenant?.settings?.enableFieldOfficers !== false && activeTenant?.settings?.enableLoans !== false) && (
                      <button
                        onClick={() => handleNavigate('field-collection')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'field-collection'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Smartphone className="w-4 h-4 text-rose-400" />
                          <span>মাঠ কালেকশন ও POS রসিদ</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">POS</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate('accounts')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'accounts'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ReceiptText className="w-4 h-4 text-amber-400" />
                        <span>খরচ, ভাউচার ও খতিয়ান (Accounts)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">মডিউল ৬</span>
                    </button>
                  </div>
                </div>

                {/* Category 2: কার্যক্রম ও অটোমেশন (Operations & Automation) */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 px-2 mb-2 flex items-center gap-1.5">
                    <span>২. কার্যক্রম ও অটোমেশন</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigate('approvals')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'approvals'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        <span>অনুমোদন ওয়ার্কফ্লো (Approvals)</span>
                      </div>
                    </button>

                    {activeTenant?.settings?.enableDocumentGenerator !== false && (
                      <button
                        onClick={() => handleNavigate('doc-generator')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'doc-generator'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ScrollText className="w-4 h-4 text-purple-400" />
                          <span>প্রত্যয়ন ও চুক্তিপত্র (Documents)</span>
                        </div>
                      </button>
                    )}

                    {activeTenant?.settings?.enableOnlinePayment !== false && (
                      <button
                        onClick={() => handleNavigate('payment-gateways')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'payment-gateways'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-pink-400" />
                          <span>পেমেন্ট গেটওয়ে (bKash/নগদ)</span>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate('notices')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'notices'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-blue-400" />
                        <span>ডিজিটাল নোটিশ বোর্ড (Notices)</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavigate('documents')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'documents'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderLock className="w-4 h-4 text-sky-400" />
                        <span>সমিতির নথি ও গঠনতন্ত্র (Vault)</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavigate('meetings')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'meetings'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CalendarCheck className="w-4 h-4 text-green-400" />
                        <span>সভা ও রেজোলিউশন (মডিউল ৭)</span>
                      </div>
                    </button>

                    {activeTenant?.settings?.enableElections !== false && (
                      <button
                        onClick={() => handleNavigate('elections')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'elections'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Vote className="w-4 h-4 text-indigo-400" />
                          <span>নির্বাচন ও ডিজিটাল ভোট (মডিউল ৮)</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Category 3: রিপোর্ট ও সিস্টেম অ্যাডমিন (Reports & Admin) */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 px-2 mb-2 flex items-center gap-1.5">
                    <span>৩. রিপোর্ট ও সিস্টেম সেটিংস</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigate('reports')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'reports'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileBarChart className="w-4 h-4 text-emerald-400" />
                        <span>আর্থিক রিপোর্ট ও বিবরণী (মডিউল ৯)</span>
                      </div>
                    </button>

                    {activeTenant?.settings?.enableMemberPortal !== false && (
                      <button
                        onClick={() => handleNavigate('member-portal')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'member-portal' || activeTab === 'member-passbook'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          <span>পাসবই ও মেম্বার পোর্টাল (মডিউল ১০)</span>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate('audit-trail')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'audit-trail'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-cyan-400" />
                        <span>অডিট ট্রেইল ও লগ (Audit Trail)</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavigate('backup-restore')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'backup-restore'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-amber-400" />
                        <span>ডাটা ব্যাকআপ ও রিস্টোর (Backup)</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavigate('settings')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        activeTab === 'settings'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sliders className="w-4 h-4 text-rose-400" />
                        <span>সমিতি সেটিংস ও কনফিগারেশন (Settings)</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Category 4: ভূমিকা পরিবর্তন (Role Switcher) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>পোর্টাল রোল পরিবর্তন করুন</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {roleOptions.map(opt => (
                  <button
                    key={opt.role}
                    onClick={() => {
                      setCurrentUser(opt.userId);
                      const newTab = opt.role === 'SUPER_ADMIN' ? 'saas-overview' : opt.role === 'MEMBER' ? 'member-passbook' : 'dashboard';
                      onTabChange(newTab);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      currentUser.role === opt.role 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.labelBn}</span>
                    {currentUser.role === opt.role && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenApkModal();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>অ্যান্ড্রয়েড APK</span>
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-500 pt-1">
              SamityPro SaaS • রিয়েলটাইম মাল্টি-ইউজার ক্লাউড
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
