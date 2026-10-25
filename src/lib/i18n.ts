import { Language } from '@/types';

// Convert English digits to Bengali digits
export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const banglaDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.', ',': ','
  };
  const str = typeof num === 'number' ? num.toLocaleString('en-IN') : num.toString();
  return str.split('').map(char => banglaDigits[char] || char).join('');
}

export function formatCurrency(amount: number, lang: Language = 'bn', showSymbol = true): string {
  const formatted = amount.toLocaleString(lang === 'bn' ? 'en-IN' : 'en-US');
  const numberStr = lang === 'bn' ? toBengaliNumber(formatted) : formatted;
  const symbol = lang === 'bn' ? '৳' : 'BDT ';
  return showSymbol ? `${symbol} ${numberStr}` : numberStr;
}

export function formatDate(dateStr: string, lang: Language = 'bn'): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    if (lang === 'bn') {
      const monthsBn = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const day = toBengaliNumber(d.getDate());
      const month = monthsBn[d.getMonth()];
      const year = toBengaliNumber(d.getFullYear());
      return `${day} ${month}, ${year}`;
    }

    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export const translations = {
  bn: {
    // App Meta
    appName: 'সমিতিপ্রো',
    appSubtitle: 'সমিতি, ক্লাব ও সংগঠন ক্লাউড ব্যবস্থাপনা সফটওয়্যার',
    allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত © ২০২৬ সমিতিপ্রো টেকনোলজিস',

    // Roles & Tenants
    superAdmin: 'সুপার অ্যাডমিন (সফটওয়্যার মালিক)',
    samityAdmin: 'সমিতি অ্যাডমিন / সভাপতি / সাধারণ সম্পাদক',
    manager: 'শাখা ব্যবস্থাপক',
    fieldCollector: 'মাঠ কর্মী / কালেকশন এজেন্ট',
    member: 'সাধারণ সদস্য',
    guest: 'অতিথি',

    // Navigation & Tabs
    dashboard: 'ড্যাশবোর্ড',
    members: 'সদস্য তালিকা',
    savings: 'সঞ্চয় ও ডিপিএস',
    loans: 'ঋণ ও কিস্তি',
    collections: 'কালেকশন ও আদায়',
    shares: 'শেয়ার ক্যাপিটাল',
    accounts: 'হিসাব ও ভাউচার',
    meetings: 'সভা ও রেজোলিউশন',
    elections: 'ভোট ও নির্বাচন',
    reports: 'রিপোর্ট ও স্টেটমেন্ট',
    settings: 'সেটিংস',
    passbook: 'ব্যক্তিগত পাসবই',
    notices: 'নোটিশ বোর্ড',
    realtimeSync: 'লাইভ সিঙ্ক চালু',
    tenantList: 'সমিতি ও ক্লাবের তালিকা',
    subscriptions: 'সাবস্ক্রিপশন ও বিলিং',
    systemSettings: 'সিস্টেম সেটিংস',
    smsGateway: 'এসএমএস গেটওয়ে',
    auditLogs: 'অডিট লগ',

    // Actions
    addMember: 'নতুন সদস্য যুক্ত করুন',
    recordDeposit: 'সঞ্চয় জমা নিন',
    disburseLoan: 'নতুন ঋণ বিতরণ',
    collectInstallment: 'কিস্তি আদায় করুন',
    newVoucher: 'ভাউচার তৈরি করুন',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    printReceipt: 'রসিদ প্রিন্ট করুন',
    searchPlaceholder: 'নাম, মোবাইল বা সদস্য নম্বর দিয়ে খুঁজুন...',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    confirm: 'নিশ্চিত করুন',
    edit: 'সম্পাদনা',
    delete: 'মুছুন',
    approve: 'অনুমোদন দিন',
    reject: 'প্রত্যাখ্যান করুন',
    status: 'অবস্থা',
    filter: 'ফিল্টার',
    exportExcel: 'এক্সেলে ডাউনলোড',
    switchTenant: 'সমিতি পরিবর্তন',
    switchRole: 'রোল পরিবর্তন (ডেমো)',
    logOut: 'লগআউট',

    // Stats Labels
    totalMembers: 'মোট সদস্য',
    activeSavings: 'মোট সঞ্চয় স্থিতি',
    totalLoanDisbursed: 'বিতরণকৃত ঋণ',
    loanOutstanding: 'বর্তমান বকেয়া ঋণ',
    todaysCollection: 'আজকের মোট কালেকশন',
    cashInHand: 'হাতে নগদ ক্যাশ',
    bankBalance: 'ব্যাংক স্থিতি',
    overdueInstallments: 'মেয়াদোত্তীর্ণ কিস্তি',
    shareCapitalTotal: 'মোট শেয়ার মূলধন',
    liveUpdates: 'রিয়েল-টাইম লাইভ তথ্য',

    // Member form
    memberCode: 'সদস্য কোড',
    fullNameBn: 'পূর্ণ নাম (বাংলা)',
    fullNameEn: 'পূর্ণ নাম (ইংরেজি)',
    fatherOrHusband: 'পিতা/স্বামীর নাম',
    motherName: 'মাতার নাম',
    phone: 'মোবাইল নম্বর',
    nid: 'জাতীয় পরিচয়পত্র (NID)',
    dob: 'জন্ম তারিখ',
    gender: 'লিঙ্গ',
    male: 'পুরুষ',
    female: 'মহিলা',
    other: 'অন্যান্য',
    address: 'বর্তমান ঠিকানা',
    occupation: 'পেশা',
    category: 'সদস্যের ধরন',
    nomineeName: 'মনোনীত ব্যক্তির নাম (Nominee)',
    nomineeRelation: 'সম্পর্ক',
    nomineePhone: 'মনোনীত ব্যক্তির মোবাইল',
    sharesCount: 'শেয়ার সংখ্যা',

    // Loan details
    loanAmount: 'ঋণের পরিমাণ',
    interestRate: 'মুনাফা / সুদের হার (%)',
    duration: 'মেয়াদ (মাস)',
    installmentAmount: 'প্রতি কিস্তির পরিমাণ',
    guarantor: 'জামিনদার সদস্য',
    repaidAmount: 'পরিশোধিত টাকা',
    remainingAmount: 'অবশিষ্ট টাকা',
    payInstallment: 'কিস্তি পরিশোধ',

    // SaaS features
    multiTenantHeading: 'মাল্টি-টেন্যান্ট ক্লাউড সমিতি প্ল্যাটফর্ম',
    apkReadyNotice: 'অ্যান্ড্রয়েড মোবাইল অ্যাপ (APK) সমর্থিত',
    realtimeConnected: 'রিয়েল-টাইম ডাটাবেস সংযুক্ত',
    selectSamity: 'সমিতি নির্বাচন করুন',
    createSamity: 'নতুন সমিতি বা ক্লাব নিবন্ধন করুন',
    monthlyPrice: 'মাসিক মূল্য',
    annualDiscount: 'বার্ষিক ২০% ছাড়',
  },
  en: {
    // App Meta
    appName: 'SamityPro',
    appSubtitle: 'Cloud Samity, Club & Association Management SaaS',
    allRightsReserved: 'All rights reserved © 2026 SamityPro Technologies',

    // Roles & Tenants
    superAdmin: 'Super Admin (SaaS Owner)',
    samityAdmin: 'Samity Admin / President / Secretary',
    manager: 'Branch Manager',
    fieldCollector: 'Field Collector / Agent',
    member: 'Registered Member',
    guest: 'Guest',

    // Navigation & Tabs
    dashboard: 'Dashboard',
    members: 'Members',
    savings: 'Savings & DPS',
    loans: 'Loans & EMIs',
    collections: 'Collections',
    shares: 'Share Capital',
    accounts: 'Accounts & Vouchers',
    meetings: 'Meetings & Minutes',
    elections: 'Elections & Voting',
    reports: 'Reports & Statements',
    settings: 'Settings',
    passbook: 'My Passbook',
    notices: 'Notice Board',
    realtimeSync: 'Live Sync Active',
    tenantList: 'Samity & Club Tenants',
    subscriptions: 'Subscriptions & Billing',
    systemSettings: 'System Settings',
    smsGateway: 'SMS Gateway',
    auditLogs: 'Audit Logs',

    // Actions
    addMember: 'Add New Member',
    recordDeposit: 'Collect Savings',
    disburseLoan: 'Disburse Loan',
    collectInstallment: 'Collect EMI',
    newVoucher: 'New Voucher',
    downloadPdf: 'Download PDF',
    printReceipt: 'Print Receipt',
    searchPlaceholder: 'Search by name, phone or member code...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    edit: 'Edit',
    delete: 'Delete',
    approve: 'Approve',
    reject: 'Reject',
    status: 'Status',
    filter: 'Filter',
    exportExcel: 'Export Excel',
    switchTenant: 'Switch Samity',
    switchRole: 'Switch Role (Demo)',
    logOut: 'Log Out',

    // Stats Labels
    totalMembers: 'Total Members',
    activeSavings: 'Total Savings Balance',
    totalLoanDisbursed: 'Total Loans Disbursed',
    loanOutstanding: 'Loan Outstanding Balance',
    todaysCollection: "Today's Total Collection",
    cashInHand: 'Cash In Hand',
    bankBalance: 'Bank Balance',
    overdueInstallments: 'Overdue Installments',
    shareCapitalTotal: 'Total Share Capital',
    liveUpdates: 'Real-time Live Sync',

    // Member form
    memberCode: 'Member Code',
    fullNameBn: 'Full Name (Bangla)',
    fullNameEn: 'Full Name (English)',
    fatherOrHusband: 'Father / Husband Name',
    motherName: 'Mother Name',
    phone: 'Phone Number',
    nid: 'National ID (NID)',
    dob: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    address: 'Present Address',
    occupation: 'Occupation',
    category: 'Member Category',
    nomineeName: 'Nominee Name',
    nomineeRelation: 'Nominee Relation',
    nomineePhone: 'Nominee Phone',
    sharesCount: 'Shares Count',

    // Loan details
    loanAmount: 'Loan Amount',
    interestRate: 'Interest Rate (%)',
    duration: 'Duration (Months)',
    installmentAmount: 'Installment Amount',
    guarantor: 'Guarantor Member',
    repaidAmount: 'Repaid Amount',
    remainingAmount: 'Remaining Amount',
    payInstallment: 'Pay Installment',

    // SaaS features
    multiTenantHeading: 'Multi-Tenant Cloud Samity Platform',
    apkReadyNotice: 'Android Mobile App (APK) Ready',
    realtimeConnected: 'Real-time Database Connected',
    selectSamity: 'Select Samity',
    createSamity: 'Register New Samity / Club',
    monthlyPrice: 'Monthly Price',
    annualDiscount: 'Annual 20% Discount',
  }
};
