'use client';

import React from 'react';
import { 
  LayoutDashboard, Users, PiggyBank, HandCoins, ReceiptText, 
  CalendarCheck, Vote, FileBarChart, ShieldAlert,
  CreditCard, MessageSquare, BookOpen, Bell,
  BadgePercent, Building2, FolderLock, Sliders,
  ScrollText, ShieldCheck, History, Database, Zap, Smartphone
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { APP_VERSION } from '@/types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { currentUser, language } = useSamityStore();
  const t = translations[language];

  // Super Admin Navigation Items
  const superAdminNav = [
    { id: 'saas-overview', labelBn: 'এসএএএস ওভারভিউ', labelEn: 'SaaS Overview', icon: LayoutDashboard },
    { id: 'samity-setup', labelBn: 'সমিতি সেটআপ ও পরিচালনা', labelEn: 'Samity Directory', icon: Building2 },
    { id: 'tenants', labelBn: 'সমিতি ও সংগঠনসমূহ', labelEn: 'Samity & Tenants', icon: Users },
    { id: 'subscriptions', labelBn: 'সাবস্ক্রিপশন ও বিলিং', labelEn: 'Billing & Plans', icon: CreditCard },
    { id: 'payment-gateways', labelBn: 'অনলাইন পেমেন্ট গেটওয়ে', labelEn: 'Payment Gateways', icon: CreditCard },
    { id: 'gateways', labelBn: 'মেসেজিং ও এসএমএস গেটওয়ে', labelEn: 'SMS & Gateways', icon: MessageSquare },
    { id: 'audit-logs', labelBn: 'সিস্টেম অডিট লগ', labelEn: 'System Audit Logs', icon: ShieldAlert },
  ];

  // Samity Admin & Manager Navigation Items
  const samityAdminNav = [
    { id: 'dashboard', labelBn: t.dashboard, labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'field-collection', labelBn: 'মাঠ কালেকশন ও POS রসিদ', labelEn: 'Field Collection & POS', icon: Smartphone },
    { id: 'samity-setup', labelBn: 'সমিতি সেটআপ (মডিউল ১)', labelEn: 'Samity Setup (Mod 1)', icon: Building2 },
    { id: 'members', labelBn: 'সদস্য ব্যবস্থাপনা (মডিউল ২)', labelEn: 'Members & KYC (Mod 2)', icon: Users },
    { id: 'subscriptions-due', labelBn: 'চাঁদা ও বকেয়া পলিসি (মডিউল ৩)', labelEn: 'Fees & Policy (Mod 3)', icon: BadgePercent },
    { id: 'bank-deposits', labelBn: 'ব্যাংক হিসাব ও জমা', labelEn: 'Bank Deposits', icon: Building2 },
    { id: 'savings', labelBn: 'সঞ্চয় ও ডিপিএস (মডিউল ৪)', labelEn: 'Savings & DPS (Mod 4)', icon: PiggyBank },
    { id: 'loans', labelBn: 'ঋণ ও কিস্তি (মডিউল ৫)', labelEn: 'Loans & EMIs (Mod 5)', icon: HandCoins },
    { id: 'payment-gateways', labelBn: 'পেমেন্ট গেটওয়ে (bKash/নগদ)', labelEn: 'Payment Gateways', icon: CreditCard },
    { id: 'approvals', labelBn: 'অনুমোদন ও ওয়ার্কফ্লো', labelEn: 'Approvals Workflow', icon: ShieldCheck },
    { id: 'communication-hub', labelBn: 'মেসেজিং ও গেটওয়ে হাব', labelEn: 'Communication Hub', icon: Zap },
    { id: 'doc-generator', labelBn: 'প্রত্যয়ন ও চুক্তিপত্র', labelEn: 'Doc Generator', icon: ScrollText },
    { id: 'accounts', labelBn: 'হিসাব ও ভাউচার (মডিউল ৬)', labelEn: 'Accounts & Vouchers (Mod 6)', icon: ReceiptText },
    { id: 'notices', labelBn: 'ডিজিটাল নোটিশ বোর্ড', labelEn: 'Notice Board', icon: Bell },
    { id: 'meetings', labelBn: 'সভা ও রেজোলিউশন (মডিউল ৭)', labelEn: 'Meetings & Minutes (Mod 7)', icon: CalendarCheck },
    { id: 'documents', labelBn: 'নথি ও দলিল ভল্ট', labelEn: 'Documents Vault', icon: FolderLock },
    { id: 'elections', labelBn: 'নির্বাচন ও ভোট (মডিউল ৮)', labelEn: 'Elections & Voting (Mod 8)', icon: Vote },
    { id: 'reports', labelBn: 'রিপোর্ট ও বিবরণী (মডিউল ৯)', labelEn: 'Reports & Audit (Mod 9)', icon: FileBarChart },
    { id: 'member-portal', labelBn: 'পাসবই ও মেম্বার পোর্টাল (মডিউল ১০)', labelEn: 'Member Portal (Mod 10)', icon: BookOpen },
    { id: 'audit-trail', labelBn: 'অডিট ট্রেইল লগ', labelEn: 'Audit Trail', icon: History },
    { id: 'backup-restore', labelBn: 'ব্যাকআপ ও রিস্টোর', labelEn: 'Backup & Restore', icon: Database },
    { id: 'settings', labelBn: 'সেটিংস ও কনফিগারেশন', labelEn: 'Settings & Setup', icon: Sliders },
  ];

  // Member Portal Navigation Items
  const memberNav = [
    { id: 'member-passbook', labelBn: 'আমার ডিজিটাল পাসবই (মডিউল ১০)', labelEn: 'My Passbook (Mod 10)', icon: BookOpen },
    { id: 'online-payment', labelBn: 'অনলাইন পেমেন্ট (bKash/নগদ)', labelEn: 'Pay Online (bKash/Nagad)', icon: CreditCard },
    { id: 'subscriptions-due', labelBn: 'আমার চাঁদা ও রসিদ', labelEn: 'My Fees & Receipts', icon: BadgePercent },
    { id: 'member-loans', labelBn: 'আমার ঋণ ও কিস্তি', labelEn: 'My Loans & EMIs', icon: HandCoins },
    { id: 'member-elections', labelBn: 'ভোট প্রদান ও নির্বাচন', labelEn: 'Cast Vote & Election', icon: Vote },
    { id: 'notices', labelBn: 'নোটিশ বোর্ড ও রেজোলিউশন', labelEn: 'Notices & Minutes', icon: Bell },
    { id: 'documents', labelBn: 'সমিতির নথি ও গঠনতন্ত্র', labelEn: 'Documents & By-Laws', icon: FolderLock },
  ];

  let currentNavItems = samityAdminNav;
  if (currentUser.role === 'SUPER_ADMIN') {
    currentNavItems = superAdminNav;
  } else if (currentUser.role === 'MEMBER') {
    currentNavItems = memberNav;
  }

  return (
    <aside className="hidden md:flex md:w-64 glass-panel border-r border-slate-800/80 p-3 sm:p-4 flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Role Identity Tag */}
        <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            {language === 'bn' ? 'বর্তমান পোর্টাল মোড' : 'Current Portal Mode'}
          </div>
          <div className="text-sm font-bold text-emerald-400 truncate mt-0.5">
            {currentUser.role === 'SUPER_ADMIN' ? (language === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin') :
             currentUser.role === 'MEMBER' ? (language === 'bn' ? 'সদস্য পোর্টাল' : 'Member Portal') :
             (language === 'bn' ? 'সমিতি পরিচালনা' : 'Samity Admin')}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {currentNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">
                  {language === 'bn' ? item.labelBn : item.labelEn}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud & Realtime Connection Info Card */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{language === 'bn' ? 'ক্লাউড ক্লাস্টার' : 'Cloud Cluster'}</span>
            <span className="text-emerald-400 font-mono font-medium">Asia-East (Vercel)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{language === 'bn' ? 'মোবাইল APK ভার্সন' : 'Mobile APK'}</span>
            <span className="text-cyan-400 font-mono">{APP_VERSION} (Capacitor)</span>
          </div>
          <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800">
            {language === 'bn' ? 'মাল্টি-ইউজার রিয়েলটাইম সিঙ্ক' : 'Multi-User Real-time Sync'}
          </div>
        </div>
      </div>
    </aside>
  );
}
