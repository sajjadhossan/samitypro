'use client';

import React, { useState } from 'react';
import { 
  X, ShieldCheck, Building2, Users, RefreshCw, BookOpen, 
  CheckCircle2, XCircle, AlertCircle, Eye, ArrowRight, 
  Layers, Sliders, Smartphone, Briefcase, Award, Percent,
  BadgePercent, PiggyBank, HandCoins, ReceiptText, ShieldAlert,
  CreditCard, MessageSquare, Bell, CalendarCheck, FolderLock,
  Vote, FileBarChart, History, Database, ScrollText, Zap, UserCheck
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { UserRole, Tenant } from '@/types';

interface RolePermissionsInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRoleAndTab?: (role: UserRole, targetTab: string) => void;
}

interface MenuOption {
  id: string;
  nameBn: string;
  nameEn: string;
  moduleBadge: string;
  icon: any;
  descriptionBn: string;
  isActive: (tenant: Tenant | null) => boolean;
}

export function RolePermissionsInspectorModal({
  isOpen,
  onClose,
  onSwitchRoleAndTab
}: RolePermissionsInspectorModalProps) {
  const { currentUser, activeTenant, tenants, setCurrentTenant, setCurrentUser, language } = useSamityStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [targetTenantId, setTargetTenantId] = useState<string>(activeTenant?.id || (tenants[0]?.id ?? ''));

  if (!isOpen) return null;

  const inspectingTenant = tenants.find(t => t.id === targetTenantId) || activeTenant;
  const settings = inspectingTenant?.settings;

  // 1. Super Admin Options (SaaS Platform Owner)
  const superAdminOptions: MenuOption[] = [
    {
      id: 'saas-overview',
      nameBn: 'এসএএএস ওভারভিউ ও অ্যানালিটিক্স',
      nameEn: 'SaaS Overview & MRR Analytics',
      moduleBadge: 'প্ল্যাটফর্ম কোর',
      icon: Layers,
      descriptionBn: 'সকল সমিতি, ক্লাব ও সংগঠনের কেন্দ্রীয় পরিসংখ্যান, লাইসেন্সিং ও MRR রেভিনিউ হিসাব।',
      isActive: () => true
    },
    {
      id: 'samity-setup',
      nameBn: 'সমিতি সেটআপ ও পরিচালনা (ডিরেক্টরি)',
      nameEn: 'Samity Directory & Provisioning',
      moduleBadge: 'প্ল্যাটফর্ম কোর',
      icon: Building2,
      descriptionBn: 'নতুন সমিতি যোগ, টেন্যান্ট প্রোফাইল, অনুমোদন ও সেন্ট্রাল ডিরেক্টরি।',
      isActive: () => true
    },
    {
      id: 'tenants',
      nameBn: 'সমিতি ও সংগঠনসমূহ (Tenants Management)',
      nameEn: 'Tenants & Organization Controls',
      moduleBadge: 'ক্যাসকেডিং লাইসেন্স',
      icon: Users,
      descriptionBn: 'প্রতিটি সমিতির মডিউল পারমিশন (টায়ার ১) অন/অফ এবং স্থগিতকরণ কন্ট্রোল।',
      isActive: () => true
    },
    {
      id: 'subscriptions',
      nameBn: 'সাবস্ক্রিপশন ও বিলিং প্যাকেজ',
      nameEn: 'Subscriptions & SaaS Billing',
      moduleBadge: 'বিলিং ইঞ্জিন',
      icon: CreditCard,
      descriptionBn: 'স্টার্টার, স্ট্যান্ডার্ড ও এন্টারপ্রাইজ প্ল্যান ও মেয়াদ পর্যবেক্ষণ।',
      isActive: () => true
    },
    {
      id: 'payment-gateways',
      nameBn: 'অনলাইন পেমেন্ট গেটওয়ে (Global)',
      nameEn: 'Payment Gateways Integration',
      moduleBadge: 'পেমেন্ট গেটওয়ে',
      icon: CreditCard,
      descriptionBn: 'bKash Merchant, Nagad, SSLCOMMERZ এবং Shurjopay কনফিগারেশন।',
      isActive: () => true
    },
    {
      id: 'gateways',
      nameBn: 'মেসেজিং ও এসএমএস গেটওয়ে (Global)',
      nameEn: 'SMS & WhatsApp Gateway Engine',
      moduleBadge: 'মেসেজিং কোর',
      icon: MessageSquare,
      descriptionBn: 'Greenweb, SSLWireless ও WhatsApp Business API গেটওয়ে ও ব্যালেন্স।',
      isActive: () => true
    },
    {
      id: 'audit-logs',
      nameBn: 'সিস্টেম অডিট লগ (Global Logs)',
      nameEn: 'System Audit Logs',
      moduleBadge: 'নিরাপত্তা ও অডিট',
      icon: ShieldAlert,
      descriptionBn: 'প্ল্যাটফর্মের সকল ইউজার ও অ্যাডমিনের অপরিবর্তনযোগ্য লগ ও নিরাপত্তা ট্র্যাকিং।',
      isActive: () => true
    }
  ];

  // 2. Samity Admin Options (সমিতি সভাপতি / প্রধান অ্যাডমিন)
  const samityAdminOptions: MenuOption[] = [
    {
      id: 'dashboard',
      nameBn: 'প্রধান ড্যাশবোর্ড',
      nameEn: 'Executive Dashboard',
      moduleBadge: 'কোর ড্যাশবোর্ড',
      icon: Layers,
      descriptionBn: 'সমিতির মোট তহবিল, আজকের কালেকশন, বকেয়া এবং সার্বিক সারসংক্ষেপ।',
      isActive: () => true
    },
    {
      id: 'samity-setup',
      nameBn: 'সমিতি সেটআপ ও গঠনতন্ত্র',
      nameEn: 'Samity Setup & By-Laws',
      moduleBadge: 'মডিউল ১',
      icon: Building2,
      descriptionBn: 'সমিতির নাম, লোগো, সিল, প্যাড, উপবিধি ও ব্যাংক হিসাব কনফিগারেশন।',
      isActive: () => true
    },
    {
      id: 'members',
      nameBn: 'সদস্য ব্যবস্থাপনা ও কেওয়াইসি (KYC)',
      nameEn: 'Members & KYC Registry',
      moduleBadge: 'মডিউল ২',
      icon: Users,
      descriptionBn: 'সদস্য ভর্তি, এনআইডি ভেরিফিকেশন, নমিনি তালিকা, আইডি কার্ড ও ছবি।',
      isActive: () => true
    },
    {
      id: 'subscriptions-due',
      nameBn: 'চাঁদা ও বকেয়া পলিসি',
      nameEn: 'Subscriptions Due & Policy',
      moduleBadge: 'মডিউল ৩',
      icon: BadgePercent,
      descriptionBn: 'নির্দিষ্ট মাসিক চাঁদা নির্ধারণ, বকেয়া নোটিশ ও বিলম্ব ফি পলিসি।',
      isActive: () => true
    },
    {
      id: 'savings',
      nameBn: 'সঞ্চয় ও ডিপিএস হিসাব',
      nameEn: 'Savings & Monthly DPS',
      moduleBadge: 'মডিউল ৪',
      icon: PiggyBank,
      descriptionBn: 'দৈনিক/সাপ্তাহিক/মাসিক সঞ্চয়, ডিপিএস স্কিম, উত্তোলন ও মুনাফা হিসাব।',
      isActive: (t) => t?.settings?.enableSavings !== false || t?.settings?.enableDps !== false
    },
    {
      id: 'loans',
      nameBn: 'ক্ষুদ্রঋণ ও কিস্তি ব্যবস্থাপনা',
      nameEn: 'Microloans & EMIs',
      moduleBadge: 'মডিউল ৫',
      icon: HandCoins,
      descriptionBn: 'ঋণ অনুমোদন, জামিনদার যাচাই, কিস্তি শিডিউল ও আদায় ট্র্যাকিং।',
      isActive: (t) => t?.settings?.enableLoans !== false && t?.settings?.enableMicroLoans !== false
    },
    {
      id: 'field-collection',
      nameBn: 'মাঠ কালেকশন ও POS রসিদ',
      nameEn: 'Field Collection & Mobile POS',
      moduleBadge: 'মডিউল ৫ (ফিল্ড)',
      icon: Smartphone,
      descriptionBn: 'মাঠকর্মীদের তাৎক্ষণিক কিস্তি ও সঞ্চয় কালেকশন এবং ব্লুটুথ থার্মাল প্রিন্ট।',
      isActive: (t) => t?.settings?.enableFieldOfficers !== false && t?.settings?.enableLoans !== false
    },
    {
      id: 'fdr',
      nameBn: 'স্থায়ী আমানত (FDR) ও দ্বিগুণ বৃদ্ধি',
      nameEn: 'Fixed Term Deposits (FDR)',
      moduleBadge: 'মডিউল ৫ (FDR)',
      icon: Percent,
      descriptionBn: 'মেয়াদী আমানত স্কিম, মুনাফা বিতরণ এবং মেয়াদপূর্তির সার্টিফিকেট।',
      isActive: (t) => t?.settings?.enableFdr !== false
    },
    {
      id: 'projects',
      nameBn: 'প্রকল্প ও যৌথ বিনিয়োগ',
      nameEn: 'Property & Project Portfolios',
      moduleBadge: 'মডিউল ৩ (প্রকল্প)',
      icon: Briefcase,
      descriptionBn: 'জমি/ফ্ল্যাট ক্রয়, যৌথ ব্যবসায় বিনিয়োগ ও সদস্য শেয়ার অংশীদারিত্ব।',
      isActive: (t) => t?.settings?.enableProjects !== false || t?.settings?.enablePropertyProjects !== false
    },
    {
      id: 'shares-dividend',
      nameBn: 'শেয়ার মূলধন ও লভ্যাংশ বণ্টন',
      nameEn: 'Share Capital & Dividend',
      moduleBadge: 'মডিউল ৪ (শেয়ার)',
      icon: Award,
      descriptionBn: 'সদস্য শেয়ার সার্টিফিকেট, মূলধন বৃদ্ধি এবং বার্ষিক লভ্যাংশ অটো হিসাব।',
      isActive: (t) => t?.settings?.enableShares !== false
    },
    {
      id: 'accounts',
      nameBn: 'হিসাববিজ্ঞান ও ভাউচার (ক্যাশ/ব্যাংক)',
      nameEn: 'Chart of Accounts & Vouchers',
      moduleBadge: 'মডিউল ৬',
      icon: ReceiptText,
      descriptionBn: 'ডেবিট/ক্রেডিট ভাউচার, ক্যাশবুক, লেজার ও ট্রায়াল ব্যালান্স।',
      isActive: () => true
    },
    {
      id: 'fixed-assets',
      nameBn: 'স্থাবর সম্পদ ও ইনভেন্টরি',
      nameEn: 'Fixed Assets & Inventory',
      moduleBadge: 'মডিউল ৬ (সম্পদ)',
      icon: Layers,
      descriptionBn: 'অফিস ফার্নিচার, কম্পিউটার, জমি ও বার্ষিক অবচয় (Depreciation) হিসাব।',
      isActive: (t) => t?.settings?.enableAssetInventory !== false
    },
    {
      id: 'staff-payroll',
      nameBn: 'স্টাফ পেরোল ও এইচআর (HR)',
      nameEn: 'Staff Payroll & HR Desk',
      moduleBadge: 'মডিউল ৭ (এইচআর)',
      icon: UserCheck,
      descriptionBn: 'কর্মকর্তা-কর্মচারীদের মাসিক বেতন শিট, পে-স্লিপ ও অগ্রিম হিসাব।',
      isActive: (t) => t?.settings?.enableStaffPayroll !== false
    },
    {
      id: 'bank-deposits',
      nameBn: 'ব্যাংক হিসাব ও লেনদেন',
      nameEn: 'Bank Accounts & Deposits',
      moduleBadge: 'ব্যাংকিং',
      icon: Building2,
      descriptionBn: 'সমিতির বিভিন্ন ব্যাংক একাউন্ট, চেক জমা ও স্টেটমেন্ট রিকনসিলিয়েশন।',
      isActive: () => true
    },
    {
      id: 'payment-gateways',
      nameBn: 'পেমেন্ট গেটওয়ে (bKash/নগদ)',
      nameEn: 'Online Payment Gateway',
      moduleBadge: 'পেমেন্ট',
      icon: CreditCard,
      descriptionBn: 'সদস্যদের ঘরে বসে কিস্তি ও চাঁদা পরিশোধের অনলাইন গেটওয়ে সেটিংস।',
      isActive: (t) => t?.settings?.enableOnlinePayment !== false
    },
    {
      id: 'approvals',
      nameBn: 'অনুমোদন ও ওয়ার্কফ্লো',
      nameEn: 'Approvals & Workflows',
      moduleBadge: 'কন্ট্রোল',
      icon: ShieldCheck,
      descriptionBn: 'ঋণ অনুমোদন, বড় অংকের খরচ ও সঞ্চয় প্রত্যাহারের অনুমোদন।',
      isActive: () => true
    },
    {
      id: 'communication-hub',
      nameBn: 'এসএমএস ও হোয়াটসঅ্যাপ নোটিফিকেশন',
      nameEn: 'SMS & WhatsApp Gateway Hub',
      moduleBadge: 'মডিউল ৮',
      icon: Zap,
      descriptionBn: 'কিস্তির তাগাদা, জমার রসিদ এসএমএস ও সাধারণ নোটিশ প্রেরণ।',
      isActive: (t) => t?.settings?.enableSmsAlerts !== false
    },
    {
      id: 'doc-generator',
      nameBn: 'প্রত্যয়ন ও চুক্তিপত্র জেনারেটর',
      nameEn: 'Legal Documents & Affidavits',
      moduleBadge: 'আইনি নথি',
      icon: ScrollText,
      descriptionBn: 'ঋণের চুক্তিপত্র, সদস্য প্রত্যয়নপত্র, ক্লিয়ারেন্স সার্টিফিকেট প্রস্তুত।',
      isActive: (t) => t?.settings?.enableDocumentGenerator !== false
    },
    {
      id: 'notices',
      nameBn: 'ডিজিটাল নোটিশ বোর্ড',
      nameEn: 'Digital Notice Board',
      moduleBadge: 'যোগাযোগ',
      icon: Bell,
      descriptionBn: 'সমিতির গুরুত্বপূর্ণ নোটিশ প্রকাশ ও সদস্যদের মোবাইলে পুশ নোটিফিকেশন।',
      isActive: () => true
    },
    {
      id: 'meetings',
      nameBn: 'সভা ও কার্যবিবরণী (রেজোলিউশন)',
      nameEn: 'Meetings & Resolutions',
      moduleBadge: 'মডিউল ৭ (মিটিং)',
      icon: CalendarCheck,
      descriptionBn: 'কার্যনির্বাহী ও সাধারণ সভা আহ্বান, রেজোলিউশন সংরক্ষণ ও উপস্থিতি খাতা।',
      isActive: () => true
    },
    {
      id: 'documents',
      nameBn: 'নথি ও দলিল ভল্ট',
      nameEn: 'Cloud Documents Vault',
      moduleBadge: 'ডকুমেন্ট',
      icon: FolderLock,
      descriptionBn: 'সমিতির সরকারি অনুমোদন, দলিল ও আইনি কাগজের ক্লাউড ব্যাকআপ।',
      isActive: () => true
    },
    {
      id: 'elections',
      nameBn: 'নির্বাচন ও ভোট ব্যবস্থাপনা',
      nameEn: 'Elections & Online Voting',
      moduleBadge: 'মডিউল ৮ (ভোট)',
      icon: Vote,
      descriptionBn: 'কমিটি গঠন, প্রার্থী তালিকা, ভোটার তালিকা ও ডিজিটাল ব্যালট ভোটিং।',
      isActive: (t) => t?.settings?.enableElections !== false
    },
    {
      id: 'reports',
      nameBn: 'রিপোর্ট ও বার্ষিক নিরীক্ষা বিবরণী',
      nameEn: 'Financial Reports & Audit',
      moduleBadge: 'মডিউল ৯',
      icon: FileBarChart,
      descriptionBn: 'লাভ-ক্ষতি, উদ্বৃত্তপত্র, কালেকশন রিপোর্ট ও এক্সেল/পিডিএফ ডাউনলোড।',
      isActive: () => true
    },
    {
      id: 'member-portal',
      nameBn: 'ডিজিটাল পাসবই ও মেম্বার পোর্টাল',
      nameEn: 'Member Passbook & Portal',
      moduleBadge: 'মডিউল ১০',
      icon: BookOpen,
      descriptionBn: 'সদস্যদের নিজস্ব লগইন ও সরাসরি পাসবই দেখার মোড।',
      isActive: (t) => t?.settings?.enableMemberPortal !== false
    },
    {
      id: 'audit-trail',
      nameBn: 'অডিট ট্রেইল ও অ্যাকশন হিস্ট্রি',
      nameEn: 'Audit Trail Logs',
      moduleBadge: 'অডিট',
      icon: History,
      descriptionBn: 'কে কোন লেনদেন তৈরি, সম্পাদনা বা বাতিল করেছে তার সম্পূর্ণ রেকর্ড।',
      isActive: () => true
    },
    {
      id: 'backup-restore',
      nameBn: 'ক্লাউড ব্যাকআপ ও রিস্টোর',
      nameEn: 'Cloud Backup & Data Export',
      moduleBadge: 'ডেটা ব্যাকআপ',
      icon: Database,
      descriptionBn: 'সমিতির সমস্ত ডেটা এক ক্লিকে JSON/Excel ফরম্যাটে ডাউনলোড ও ব্যাকআপ।',
      isActive: () => true
    },
    {
      id: 'settings',
      nameBn: 'সমিতি সেটিংস ও কাস্টমাইজেশন',
      nameEn: 'Settings & Tenant Policies',
      moduleBadge: 'কনফিগারেশন',
      icon: Sliders,
      descriptionBn: 'ফিচার অন/অফ, লেটারহেড ডিজাইন, ডিজিটাল সিল-স্বাক্ষর ও রসিদ প্রিফিক্স।',
      isActive: () => true
    }
  ];

  // 3. Manager / Cashier Options (ম্যানেজার / কোষাধ্যক্ষ)
  const managerOptions: MenuOption[] = [
    {
      id: 'dashboard',
      nameBn: 'অপারেশনাল ড্যাশবোর্ড',
      nameEn: 'Branch Operations Dashboard',
      moduleBadge: 'দৈনিক কার্যক্রম',
      icon: Layers,
      descriptionBn: 'দৈনিক নগদ জমা-খরচ, আজকের কিস্তি আদায় ও রিকনসিলিয়েশন।',
      isActive: () => true
    },
    {
      id: 'field-collection',
      nameBn: 'মাঠ কালেকশন মনিটরিং ও রসিদ',
      nameEn: 'Field Collection Desk & POS',
      moduleBadge: 'কালেকশন ডেস্ক',
      icon: Smartphone,
      descriptionBn: 'মাঠকর্মীদের দৈনিক জমা গ্রহণ ও ব্লুটুথ থার্মাল প্রিন্ট অনুমোদন।',
      isActive: (t) => t?.settings?.enableFieldOfficers !== false && t?.settings?.enableLoans !== false
    },
    {
      id: 'members',
      nameBn: 'সদস্য তালিকা ও তথ্য যাচাই',
      nameEn: 'Member Directory & Verification',
      moduleBadge: 'সদস্য ডাটাবেস',
      icon: Users,
      descriptionBn: 'সদস্যদের তথ্য এন্ট্রি, এনআইডি ও অ্যাকাউন্ট ব্যালেন্স যাচাই।',
      isActive: () => true
    },
    {
      id: 'subscriptions-due',
      nameBn: 'মাসিক চাঁদা কালেকশন ও রসিদ',
      nameEn: 'Monthly Dues Collection',
      moduleBadge: 'চাঁদা ও ফি',
      icon: BadgePercent,
      descriptionBn: 'সদস্যদের নিয়মিত মাসিক চাঁদা গ্রহণ ও ডিজিটাল রসিদ ইস্যু।',
      isActive: () => true
    },
    {
      id: 'savings',
      nameBn: 'সঞ্চয় ও ডিপিএস লেনদেন',
      nameEn: 'Savings & DPS Deposits',
      moduleBadge: 'সঞ্চয় ডেস্ক',
      icon: PiggyBank,
      descriptionBn: 'দৈনিক/সাপ্তাহিক সঞ্চয় জমা ও ডিপিএস কিস্তি পোস্টিং।',
      isActive: (t) => t?.settings?.enableSavings !== false || t?.settings?.enableDps !== false
    },
    {
      id: 'loans',
      nameBn: 'ঋণ বিতরণ ও কিস্তি আদায়',
      nameEn: 'Loan Disbursement & EMIs',
      moduleBadge: 'ঋণ ডেস্ক',
      icon: HandCoins,
      descriptionBn: 'অনুমোদিত ঋণ প্রদান ও নিয়মিত কিস্তি সংগ্রহ।',
      isActive: (t) => t?.settings?.enableLoans !== false && t?.settings?.enableMicroLoans !== false
    },
    {
      id: 'accounts',
      nameBn: 'ভাউচার পোস্টিং ও ক্যাশবুক',
      nameEn: 'Voucher Entries & Cashbook',
      moduleBadge: 'ক্যাশ ও ভাউচার',
      icon: ReceiptText,
      descriptionBn: 'দৈনিক খরচের ডেবিট ভাউচার ও জমার ক্রেডিট ভাউচার পোস্টিং।',
      isActive: () => true
    },
    {
      id: 'bank-deposits',
      nameBn: 'ব্যাংক জমা ও উত্তোলন হিসাব',
      nameEn: 'Bank Transactions',
      moduleBadge: 'ব্যাংক হিসাব',
      icon: Building2,
      descriptionBn: 'ব্যাংকে নগদ জমা দেওয়া ও চেকের স্টেটমেন্ট রক্ষণাবেক্ষণ।',
      isActive: () => true
    },
    {
      id: 'approvals',
      nameBn: 'পেন্ডিং অনুমোদন আবেদনপত্র',
      nameEn: 'Approvals Workflow Desk',
      moduleBadge: 'অনুমোদন প্রক্রিয়া',
      icon: ShieldCheck,
      descriptionBn: 'সদস্যদের ঋণ ও সঞ্চয় উত্তোলনের আবেদন সভাপতির অনুমোদনে প্রেরণ।',
      isActive: () => true
    },
    {
      id: 'reports',
      nameBn: 'দৈনিক কালেকশন ও হিসাব রিপোর্ট',
      nameEn: 'Daily Collection & Ledger Reports',
      moduleBadge: 'রিপোর্ট',
      icon: FileBarChart,
      descriptionBn: 'দিনশেষের ক্যাশ রিপোর্ট, আদায়ের তালিকা ও রসিদ হিস্ট্রি।',
      isActive: () => true
    },
    {
      id: 'notices',
      nameBn: 'নোটিশ বোর্ড ও বার্তা',
      nameEn: 'Notices & Circulars',
      moduleBadge: 'নোটিশ',
      icon: Bell,
      descriptionBn: 'সমিতির নোটিশ ও জরুরি নির্দেশনা সদস্যদের অবহিতকরণ।',
      isActive: () => true
    },
    {
      id: 'meetings',
      nameBn: 'সভা ও উপস্থিতি ব্যবস্থাপনা',
      nameEn: 'Meetings & Attendance',
      moduleBadge: 'মিটিং',
      icon: CalendarCheck,
      descriptionBn: 'সমিতির সভায় সদস্যদের উপস্থিতি লিপিবদ্ধ ও রেজোলিউশন ড্রাফট।',
      isActive: () => true
    }
  ];

  // 4. Field Collector Options (মাঠ কর্মী / কালেক্টর)
  const fieldCollectorOptions: MenuOption[] = [
    {
      id: 'field-collection',
      nameBn: 'মাঠ কালেকশন ও POS রসিদ প্রিন্ট',
      nameEn: 'Field Collection Desk & POS',
      moduleBadge: 'মূল কালেকশন মোড',
      icon: Smartphone,
      descriptionBn: 'মোবাইল থেকে সরাসরি কিস্তি ও সঞ্চয় গ্রহণ, ব্লুটুথ প্রিন্ট ও তাৎক্ষণিক এসএমএস।',
      isActive: (t) => t?.settings?.enableFieldOfficers !== false && t?.settings?.enableLoans !== false
    },
    {
      id: 'members',
      nameBn: 'মাঠের সদস্য তালিকা ও তথ্য যাচাই',
      nameEn: 'Field Members Directory',
      moduleBadge: 'সদস্য তালিকা',
      icon: Users,
      descriptionBn: 'মাঠকর্মীর আওতাধীন সদস্যদের ফোন নম্বর, ঠিকানা ও বর্তমান বকেয়া তথ্য।',
      isActive: () => true
    },
    {
      id: 'subscriptions-due',
      nameBn: 'মাসিক চাঁদা আদায় ডেস্ক',
      nameEn: 'Dues & Fees Collection',
      moduleBadge: 'চাঁদা আদায়',
      icon: BadgePercent,
      descriptionBn: 'সদস্যদের বকেয়া মাসিক চাঁদা কালেকশন ও রসিদ প্রিন্ট।',
      isActive: () => true
    },
    {
      id: 'savings',
      nameBn: 'সঞ্চয় ও ডিপিএস কিস্তি গ্রহণ',
      nameEn: 'Savings Deposit Entry',
      moduleBadge: 'সঞ্চয় এন্ট্রি',
      icon: PiggyBank,
      descriptionBn: 'দৈনিক সঞ্চয় ও মাসিক ডিপিএস কিস্তি মাঠ থেকে সরাসরি পোস্টিং।',
      isActive: (t) => t?.settings?.enableSavings !== false || t?.settings?.enableDps !== false
    },
    {
      id: 'loans',
      nameBn: 'ঋণ কিস্তি আদায় ও কালেকশন শিট',
      nameEn: 'Loan EMI Collection Sheet',
      moduleBadge: 'কিস্তি শিডিউল',
      icon: HandCoins,
      descriptionBn: 'আজকের কিস্তির তালিকা ও সদস্যের কিস্তি গ্রহণ।',
      isActive: (t) => t?.settings?.enableLoans !== false && t?.settings?.enableMicroLoans !== false
    }
  ];

  // 5. Member Portal Options (সাধারণ সদস্য)
  const memberOptions: MenuOption[] = [
    {
      id: 'member-passbook',
      nameBn: 'আমার ডিজিটাল পাসবই',
      nameEn: 'My Digital Passbook',
      moduleBadge: 'মডিউল ১০ (পাসবই)',
      icon: BookOpen,
      descriptionBn: 'সদস্যের মোট সঞ্চয়, ডিপিএস জমা, ঋণ ব্যালেন্স ও লভ্যাংশের ডিজিটাল খতিয়ান।',
      isActive: (t) => t?.settings?.enableMemberPortal !== false
    },
    {
      id: 'online-payment',
      nameBn: 'অনলাইন পেমেন্ট (bKash/নগদ)',
      nameEn: 'Online Instant Payment',
      moduleBadge: 'পেমেন্ট গেটওয়ে',
      icon: CreditCard,
      descriptionBn: 'বিকাশ বা নগদ ব্যবহার করে ঘরে বসেই কিস্তি ও চাঁদা পরিশোধ।',
      isActive: (t) => t?.settings?.enableOnlinePayment !== false
    },
    {
      id: 'subscriptions-due',
      nameBn: 'আমার চাঁদা ও পরিশোধিত রসিদ',
      nameEn: 'My Fees & Paid Receipts',
      moduleBadge: 'চাঁদা ও রসিদ',
      icon: BadgePercent,
      descriptionBn: 'মাসিক চাঁদার বিবরণ ও পরিশোধিত রসিদের পিডিএফ ডাউনলোড।',
      isActive: () => true
    },
    {
      id: 'member-loans',
      nameBn: 'আমার ঋণ ও কিস্তি বিবরণী',
      nameEn: 'My Loan Status & Schedule',
      moduleBadge: 'মডিউল ৫ (ঋণ)',
      icon: HandCoins,
      descriptionBn: 'চলমান ঋণের পরিমাণ, পরবর্তী কিস্তির তারিখ ও বকেয়ার পরিমাণ।',
      isActive: (t) => t?.settings?.enableLoans !== false && t?.settings?.enableMicroLoans !== false
    },
    {
      id: 'fdr',
      nameBn: 'আমার স্থায়ী আমানত (FDR)',
      nameEn: 'My Fixed Term Deposits',
      moduleBadge: 'মডিউল ৫ (FDR)',
      icon: Percent,
      descriptionBn: 'মেয়াদী আমানত হিসাব ও অর্জিত মুনাফার হিসাব।',
      isActive: (t) => t?.settings?.enableFdr !== false
    },
    {
      id: 'projects',
      nameBn: 'আমার প্রকল্প বিনিয়োগ ও শেয়ার',
      nameEn: 'My Project Shares',
      moduleBadge: 'মডিউল ৩ (প্রকল্প)',
      icon: Briefcase,
      descriptionBn: 'সমিতির বিভিন্ন প্রকল্পে সদস্যের বিনিয়োগ ও প্রজেক্ট শেয়ার।',
      isActive: (t) => t?.settings?.enableProjects !== false || t?.settings?.enablePropertyProjects !== false
    },
    {
      id: 'shares-dividend',
      nameBn: 'আমার শেয়ার ও লভ্যাংশ খতিয়ান',
      nameEn: 'My Shares & Annual Dividend',
      moduleBadge: 'মডিউল ৪ (শেয়ার)',
      icon: Award,
      descriptionBn: 'ক্রয়কৃত শেয়ারের সংখ্যা, শেয়ারের মূল্য ও বাৎসরিক লভ্যাংশ।',
      isActive: (t) => t?.settings?.enableShares !== false
    },
    {
      id: 'member-elections',
      nameBn: 'ভোট প্রদান ও নির্বাচন পোর্টাল',
      nameEn: 'Cast Digital Vote & Election',
      moduleBadge: 'মডিউল ৮ (ভোট)',
      icon: Vote,
      descriptionBn: 'সমিতির নির্বাচনে নিজের ভোটাধিকার প্রয়োগ ও ফলাফল দর্শন।',
      isActive: (t) => t?.settings?.enableElections !== false
    },
    {
      id: 'notices',
      nameBn: 'নোটিশ বোর্ড ও রেজোলিউশন',
      nameEn: 'Notices & Meeting Minutes',
      moduleBadge: 'নোটিশ বোর্ড',
      icon: Bell,
      descriptionBn: 'সাধারণ সভার সিদ্ধান্ত ও সমিতির নোটিশসমূহ।',
      isActive: () => true
    },
    {
      id: 'documents',
      nameBn: 'সমিতির গঠনতন্ত্র ও দলিল ভল্ট',
      nameEn: 'By-Laws & Public Documents',
      moduleBadge: 'গঠনতন্ত্র',
      icon: FolderLock,
      descriptionBn: 'সমিতির অনুমোদিত উপবিধি, গঠনতন্ত্র ও প্রকাশ্য দলিল।',
      isActive: () => true
    }
  ];

  // Get current role's list
  const getRoleOptions = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return superAdminOptions;
      case 'SAMITY_ADMIN': return samityAdminOptions;
      case 'MANAGER': return managerOptions;
      case 'FIELD_COLLECTOR': return fieldCollectorOptions;
      case 'MEMBER': return memberOptions;
      default: return samityAdminOptions;
    }
  };

  const currentList = getRoleOptions(selectedRole);

  // Audit for duplicates (Checking the Zero-Duplicate Rule)
  const ids = currentList.map(item => item.id);
  const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
  const hasDuplicates = duplicates.length > 0;

  // Active vs Inactive count
  const activeCount = currentList.filter(item => item.isActive(inspectingTenant || null)).length;
  const disabledCount = currentList.length - activeCount;

  const handleApplyRoleAndPreview = (role: UserRole) => {
    let targetUserId = 'user-rafiq';
    let defaultTab = 'dashboard';

    if (role === 'SUPER_ADMIN') {
      targetUserId = 'user-sajjad-owner';
      defaultTab = 'saas-overview';
    } else if (role === 'SAMITY_ADMIN') {
      targetUserId = 'user-rafiq';
      defaultTab = 'dashboard';
    } else if (role === 'MANAGER') {
      targetUserId = 'user-tareq';
      defaultTab = 'dashboard';
    } else if (role === 'FIELD_COLLECTOR') {
      targetUserId = 'user-sumon';
      defaultTab = 'field-collection';
    } else if (role === 'MEMBER') {
      targetUserId = 'user-kabir';
      defaultTab = 'member-passbook';
    }

    // Set tenant
    if (inspectingTenant) {
      setCurrentTenant(inspectingTenant.id);
    }
    setCurrentUser(targetUserId);

    if (onSwitchRoleAndTab) {
      onSwitchRoleAndTab(role, defaultTab);
    }

    onClose();
  };

  function getRoleNameBn(r: UserRole): string {
    switch (r) {
      case 'SUPER_ADMIN': return 'সুপার অ্যাডমিন (প্ল্যাটফর্ম মালিক)';
      case 'SAMITY_ADMIN': return 'সমিতি সভাপতি / অ্যাডমিন';
      case 'MANAGER': return 'ম্যানেজার / কোষাধ্যক্ষ';
      case 'FIELD_COLLECTOR': return 'মাঠ কর্মী (কালেক্টর)';
      case 'MEMBER': return 'সাধারণ সদস্য (সদস্য পোর্টাল)';
      default: return r;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sliders className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {language === 'bn' ? 'ভূমিকা ও মেনু অপশন পরীক্ষক (Role Permissions & Menu Audit)' : 'Role Permissions & Options Inspector'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30">
                  Zero-Duplicate Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'কোন ইউজার রোলে ঠিক কী কী মেনু ও মডিউল একটিভ থাকে তা নিখুঁতভাবে চেক ও সরাসরি লাইভ প্রিভিউ করুন।'
                  : 'Inspect all active options per user role and seamlessly test/preview the live interface.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: Target Samity Selector & Duplicate Audit Banner */}
        <div className="p-4 sm:px-6 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Samity Switcher inside Inspector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 shrink-0">পরীক্ষাধীন সমিতি:</span>
            <select
              value={targetTenantId}
              onChange={e => setTargetTenantId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer max-w-xs truncate"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nameBn} ({t.plan})
                </option>
              ))}
            </select>
          </div>

          {/* Duplicate Audit Status */}
          <div className="flex items-center gap-2">
            {!hasDuplicates ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>কোনো ডুপ্লিকেট বা ডাবল মেনু নেই (১০০% ক্লিন)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>সতর্কতা: ডুপ্লিকেট মেনু সনাক্ত হয়েছে!</span>
              </div>
            )}
          </div>
        </div>

        {/* Role Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none flex gap-2">
          {(['SUPER_ADMIN', 'SAMITY_ADMIN', 'MANAGER', 'FIELD_COLLECTOR', 'MEMBER'] as UserRole[]).map(role => {
            const isSelected = selectedRole === role;
            const count = getRoleOptions(role).length;
            let icon = ShieldCheck;
            let label = 'সুপার অ্যাডমিন';
            if (role === 'SAMITY_ADMIN') { icon = Building2; label = 'সমিতি সভাপতি'; }
            if (role === 'MANAGER') { icon = Users; label = 'ম্যানেজার / ক্যাশিয়ার'; }
            if (role === 'FIELD_COLLECTOR') { icon = RefreshCw; label = 'মাঠ কর্মী'; }
            if (role === 'MEMBER') { icon = BookOpen; label = 'সাধারণ সদস্য'; }

            const Icon = icon;

            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Summary Bar & View-As Action */}
        <div className="p-4 sm:px-6 bg-slate-950/30 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {getRoleNameBn(selectedRole)}
              </span>
              <span className="text-xs text-slate-400">
                — মোট অপশন: <strong className="text-emerald-400">{activeCount}টি সক্রিয়</strong>
                {disabledCount > 0 && <span className="text-slate-500"> ({disabledCount}টি লাইসেন্সে অফ)</span>}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              এই রোলে লগইন করলে ব্যবহারকারী ঠিক নিচের মেনুগুলো দেখতে পাবেন।
            </p>
          </div>

          {/* Big "View As Role" Button */}
          <button
            onClick={() => handleApplyRoleAndPreview(selectedRole)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>এই রোলে লাইভ প্রবেশ ও চেক করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable List of Menu Options for the Selected Role */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {currentList.map((item, idx) => {
            const Icon = item.icon;
            const active = item.isActive(inspectingTenant || null);

            return (
              <div 
                key={item.id}
                className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                  active 
                    ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600' 
                    : 'bg-slate-900/30 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    active 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100">
                        {idx + 1}. {item.nameBn}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({item.nameEn})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20">
                        {item.moduleBadge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.descriptionBn}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 text-right">
                  {active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>সক্রিয় (Active)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-semibold">
                      <XCircle className="w-3 h-3 text-slate-500" />
                      <span>লাইসেন্সে বন্ধ</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            সমিতি প্রো এন্টারপ্রাইজ • রোল ভিত্তিক নিরাপত্তা ও মডিউল নিয়ন্ত্রণ যাচাইকৃত
          </p>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
