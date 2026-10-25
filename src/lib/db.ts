import { 
  Tenant, User, Member, SavingsAccount, SavingsTransaction, 
  Loan, LoanRepayment, Voucher, Meeting, Election, RealtimeEvent 
} from '@/types';

// Pre-seeded multi-tenant data
export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'samity-ekota',
    nameBn: 'একতা বহুমুখী সমবায় সমিতি লিমিটেড',
    nameEn: 'Ekota Multipurpose Co-operative Society Ltd.',
    slug: 'ekota',
    type: 'SAMITY',
    registrationNo: 'REG-DHAKA-2018-9842',
    establishedYear: 2018,
    phone: '+8801711223344',
    email: 'info@ekotasamity.org',
    address: 'বাড়ি ১২, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা-১২১৯',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    validUntil: '2027-12-31',
    smsBalance: 1250,
    currency: 'BDT',
    settings: {
      enableDps: true,
      enableLoans: true,
      enableElections: true,
      enableSmsAlerts: true,
      enableOnlinePayment: true,
      shareFaceValue: 1000,
      defaultSavingsInterestRate: 8.5,
      defaultLoanInterestRate: 12.0,
      penaltyPerMissedInstallment: 100,
    },
    createdAt: '2024-01-01'
  },
  {
    id: 'club-uttara',
    nameBn: 'উত্তরা ইয়ুথ স্পোর্টিং ও কালচারাল ক্লাব',
    nameEn: 'Uttara Youth Sporting & Cultural Club',
    slug: 'uttara-youth',
    type: 'CLUB',
    registrationNo: 'SOC-DHAKA-2021-3411',
    establishedYear: 2021,
    phone: '+8801822334455',
    email: 'contact@uttarayouth.com',
    address: 'সেক্টর ৭ পার্ক লেন, উত্তরা, ঢাকা-১২৩০',
    plan: 'STANDARD',
    status: 'ACTIVE',
    validUntil: '2027-06-30',
    smsBalance: 640,
    currency: 'BDT',
    settings: {
      enableDps: false,
      enableLoans: false,
      enableElections: true,
      enableSmsAlerts: true,
      enableOnlinePayment: true,
      shareFaceValue: 500,
      defaultSavingsInterestRate: 0,
      defaultLoanInterestRate: 0,
      penaltyPerMissedInstallment: 50,
    },
    createdAt: '2024-03-15'
  },
  {
    id: 'assoc-gulshan',
    nameBn: 'গুলশান সেন্ট্রাল ট্রেডার্স অ্যাসোসিয়েশন',
    nameEn: 'Gulshan Central Traders Association',
    slug: 'gulshan-traders',
    type: 'ASSOCIATION',
    registrationNo: 'COMM-GUL-2019-1122',
    establishedYear: 2019,
    phone: '+8801933445566',
    email: 'office@gulshantraders.org',
    address: 'গুলশান শপিং প্লাজা, রোড ১১, ঢাকা-১২১২',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    validUntil: '2027-10-31',
    smsBalance: 3200,
    currency: 'BDT',
    settings: {
      enableDps: true,
      enableLoans: true,
      enableElections: true,
      enableSmsAlerts: true,
      enableOnlinePayment: true,
      shareFaceValue: 5000,
      defaultSavingsInterestRate: 7.0,
      defaultLoanInterestRate: 10.0,
      penaltyPerMissedInstallment: 200,
    },
    createdAt: '2024-02-10'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-superadmin',
    nameBn: 'ইঞ্জিঃ সাজ্জাদ হোসাইন',
    nameEn: 'Engr. Sajjad Hossain',
    phone: '+8801700000001',
    email: 'admin@samitypro.com',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'user-rafiq',
    tenantId: 'samity-ekota',
    nameBn: 'আলহাজ্ব রফিকুল ইসলাম (সভাপতি)',
    nameEn: 'Alhaj Rafiqul Islam (President)',
    phone: '+8801711223344',
    email: 'president@ekotasamity.org',
    role: 'SAMITY_ADMIN',
    isActive: true,
    createdAt: '2024-01-02'
  },
  {
    id: 'user-tareq',
    tenantId: 'samity-ekota',
    nameBn: 'মো: তারেক হাসান (ম্যানেজার)',
    nameEn: 'Md. Tareq Hasan (Manager)',
    phone: '+8801711556677',
    email: 'manager@ekotasamity.org',
    role: 'MANAGER',
    isActive: true,
    createdAt: '2024-01-05'
  },
  {
    id: 'user-sumon',
    tenantId: 'samity-ekota',
    nameBn: 'সুমন চন্দ্র দে (মাঠ কর্মী)',
    nameEn: 'Sumon Chandra Dey (Field Agent)',
    phone: '+8801811889900',
    email: 'collector@ekotasamity.org',
    role: 'FIELD_COLLECTOR',
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: 'user-kabir',
    tenantId: 'samity-ekota',
    memberId: 'mem-001',
    nameBn: 'মো: কবির আহমেদ',
    nameEn: 'Md. Kabir Ahmed',
    phone: '+8801712000001',
    email: 'kabir@gmail.com',
    role: 'MEMBER',
    isActive: true,
    createdAt: '2024-02-01'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    tenantId: 'samity-ekota',
    memberCode: 'MEM-001',
    nameBn: 'মো: কবির আহমেদ',
    nameEn: 'Md. Kabir Ahmed',
    fatherHusbandName: 'মরহুম মোসলেম উদ্দিন',
    motherName: 'মোসাম্মৎ আয়েশা খাতুন',
    phone: '+8801712000001',
    email: 'kabir@gmail.com',
    nid: '19842691234567890',
    dateOfBirth: '1984-06-15',
    gender: 'MALE',
    bloodGroup: 'B+',
    presentAddress: 'বাড়ি ৭, রোড ৩, ব্লক সি, বনশ্রী, ঢাকা',
    permanentAddress: 'গ্রাম: চর বানিয়াপাড়া, ডাকঘর: কালিহাতী, টাঙ্গাইল',
    occupation: 'ব্যবসায়ী (মুদি পাইকারি)',
    category: 'GENERAL',
    status: 'ACTIVE',
    admissionDate: '2024-02-01',
    admissionFee: 1000,
    sharesHeld: 15,
    shareValue: 15000,
    savingsBalance: 48500,
    dpsBalance: 36000,
    loanOutstanding: 45000,
    nominee: {
      name: 'মোসাম্মৎ রহিমা আক্তার',
      relation: 'স্ত্রী',
      nidOrBirthCert: '19882691234567891',
      phone: '+8801712000002',
      sharePercentage: 100
    },
    createdAt: '2024-02-01'
  },
  {
    id: 'mem-002',
    tenantId: 'samity-ekota',
    memberCode: 'MEM-002',
    nameBn: 'সেলিনা পারভীন',
    nameEn: 'Selina Parveen',
    fatherHusbandName: 'মো: জাহিদুল আলম',
    motherName: 'জাহানারা বেগম',
    phone: '+8801812000002',
    email: 'selina@gmail.com',
    nid: '19902699876543210',
    dateOfBirth: '1990-11-20',
    gender: 'FEMALE',
    bloodGroup: 'O+',
    presentAddress: 'ফ্ল্যাট ৪বি, ইস্টার্ন পয়েন্ট, শান্তিনগর, ঢাকা',
    permanentAddress: 'পোস্ট ও থানা: মীরসরাই, চট্টগ্রাম',
    occupation: 'গৃহিণী ও হস্তশিল্প উদ্যোক্তা',
    category: 'GENERAL',
    status: 'ACTIVE',
    admissionDate: '2024-02-10',
    admissionFee: 1000,
    sharesHeld: 10,
    shareValue: 10000,
    savingsBalance: 72000,
    dpsBalance: 60000,
    loanOutstanding: 0,
    nominee: {
      name: 'মো: জাহিদুল আলম',
      relation: 'স্বামী',
      nidOrBirthCert: '19872691234567888',
      phone: '+8801812000003',
      sharePercentage: 100
    },
    createdAt: '2024-02-10'
  },
  {
    id: 'mem-003',
    tenantId: 'samity-ekota',
    memberCode: 'MEM-003',
    nameBn: 'নাজমুল হুদা',
    nameEn: 'Nazmul Huda',
    fatherHusbandName: 'আবদুল কুদ্দুস',
    motherName: 'মাজেদা খাতুন',
    phone: '+8801912000003',
    nid: '19822695556667770',
    dateOfBirth: '1982-03-10',
    gender: 'MALE',
    bloodGroup: 'A+',
    presentAddress: 'বাড়ি ২১, রোড ৫, রামপুরা, ঢাকা',
    permanentAddress: 'থানা: শিবচর, জেলা: মাদারীপুর',
    occupation: 'ফার্মেসি স্বত্বাধিকারী',
    category: 'EXECUTIVE',
    status: 'ACTIVE',
    admissionDate: '2024-02-15',
    admissionFee: 1000,
    sharesHeld: 25,
    shareValue: 25000,
    savingsBalance: 115000,
    dpsBalance: 72000,
    loanOutstanding: 80000,
    nominee: {
      name: 'তানিয়া সুলতানা',
      relation: 'স্ত্রী',
      nidOrBirthCert: '19862691234567999',
      phone: '+8801912000004',
      sharePercentage: 100
    },
    createdAt: '2024-02-15'
  },
  {
    id: 'mem-004',
    tenantId: 'samity-ekota',
    memberCode: 'MEM-004',
    nameBn: 'ফরিদা ইয়াসমিন',
    nameEn: 'Farida Yasmin',
    fatherHusbandName: 'মো: কামাল উদ্দিন',
    motherName: 'রাবেয়া বেগম',
    phone: '+8801712000004',
    nid: '19922693334445550',
    dateOfBirth: '1992-08-25',
    gender: 'FEMALE',
    bloodGroup: 'AB+',
    presentAddress: 'বাড়ি ৯, খিলগাঁও সি-ব্লক, ঢাকা',
    permanentAddress: 'থানা: চৌদ্দগ্রাম, কুমিল্লা',
    occupation: 'শিক্ষিকা',
    category: 'GENERAL',
    status: 'ACTIVE',
    admissionDate: '2024-03-01',
    admissionFee: 1000,
    sharesHeld: 12,
    shareValue: 12000,
    savingsBalance: 54000,
    dpsBalance: 24000,
    loanOutstanding: 20000,
    nominee: {
      name: 'ফাহিম কামাল',
      relation: 'পুত্র',
      nidOrBirthCert: '20122691234567000',
      phone: '+8801712000004',
      sharePercentage: 100
    },
    createdAt: '2024-03-01'
  },
  {
    id: 'mem-005',
    tenantId: 'samity-ekota',
    memberCode: 'MEM-005',
    nameBn: 'আবদুর রহমান',
    nameEn: 'Abdur Rahman',
    fatherHusbandName: 'গোলাম মোস্তফা',
    motherName: 'নুরজাহান বেগম',
    phone: '+8801812000005',
    nid: '19792691112223330',
    dateOfBirth: '1979-12-05',
    gender: 'MALE',
    bloodGroup: 'O+',
    presentAddress: 'রোড ২, আফতাবনগর, ঢাকা',
    permanentAddress: 'উপজেলা: সেনবাগ, নোয়াখালী',
    occupation: 'ঠিকাদার',
    category: 'ADVISORY',
    status: 'ACTIVE',
    admissionDate: '2024-03-10',
    admissionFee: 1000,
    sharesHeld: 40,
    shareValue: 40000,
    savingsBalance: 210000,
    dpsBalance: 120000,
    loanOutstanding: 0,
    nominee: {
      name: 'নাসরিন রহমান',
      relation: 'স্ত্রী',
      nidOrBirthCert: '19832691234567111',
      phone: '+8801812000006',
      sharePercentage: 100
    },
    createdAt: '2024-03-10'
  }
];

export const INITIAL_SAVINGS_ACCOUNTS: SavingsAccount[] = [
  {
    id: 'sav-001-reg',
    tenantId: 'samity-ekota',
    memberId: 'mem-001',
    accountNo: 'SAV-EK-1001',
    type: 'GENERAL_SAVINGS',
    title: 'দৈনিক সাধারণ সঞ্চয় হিসাব',
    balance: 48500,
    interestRate: 8.5,
    startDate: '2024-02-01',
    status: 'ACTIVE'
  },
  {
    id: 'sav-001-dps',
    tenantId: 'samity-ekota',
    memberId: 'mem-001',
    accountNo: 'DPS-EK-2001',
    type: 'DPS',
    title: '৫ বছর মেয়াদী সঞ্চয় স্কিম (ডিপিএস)',
    balance: 36000,
    monthlyInstallment: 2000,
    targetAmount: 150000,
    tenureMonths: 60,
    interestRate: 9.5,
    startDate: '2024-03-01',
    maturityDate: '2029-03-01',
    status: 'ACTIVE'
  },
  {
    id: 'sav-002-reg',
    tenantId: 'samity-ekota',
    memberId: 'mem-002',
    accountNo: 'SAV-EK-1002',
    type: 'GENERAL_SAVINGS',
    title: 'মহিলা উদ্যোক্তা সঞ্চয় হিসাব',
    balance: 72000,
    interestRate: 8.5,
    startDate: '2024-02-10',
    status: 'ACTIVE'
  },
  {
    id: 'sav-003-reg',
    tenantId: 'samity-ekota',
    memberId: 'mem-003',
    accountNo: 'SAV-EK-1003',
    type: 'GENERAL_SAVINGS',
    title: 'সাধারণ সঞ্চয় হিসাব',
    balance: 115000,
    interestRate: 8.5,
    startDate: '2024-02-15',
    status: 'ACTIVE'
  }
];

export const INITIAL_SAVINGS_TRANSACTIONS: SavingsTransaction[] = [
  {
    id: 'stx-001',
    tenantId: 'samity-ekota',
    accountId: 'sav-001-reg',
    memberId: 'mem-001',
    type: 'DEPOSIT',
    amount: 2500,
    balanceAfter: 48500,
    paymentMethod: 'CASH',
    collectorId: 'user-sumon',
    receiptNo: 'RCT-2026-1025',
    date: '2026-10-25',
    notes: 'অক্টোবর মাসিক সঞ্চয় কিস্তি'
  },
  {
    id: 'stx-002',
    tenantId: 'samity-ekota',
    accountId: 'sav-001-dps',
    memberId: 'mem-001',
    type: 'DEPOSIT',
    amount: 2000,
    balanceAfter: 36000,
    paymentMethod: 'BKASH',
    referenceNo: 'BKH984218X',
    collectorId: 'user-tareq',
    receiptNo: 'RCT-2026-1024',
    date: '2026-10-24',
    notes: 'ডিপিএস মাসিক কিস্তি (বিকাশে পরিশোধ)'
  },
  {
    id: 'stx-003',
    tenantId: 'samity-ekota',
    accountId: 'sav-002-reg',
    memberId: 'mem-002',
    type: 'DEPOSIT',
    amount: 5000,
    balanceAfter: 72000,
    paymentMethod: 'CASH',
    collectorId: 'user-sumon',
    receiptNo: 'RCT-2026-1023',
    date: '2026-10-23',
    notes: 'হস্তশিল্প বিক্রির সঞ্চয় জমা'
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan-001',
    tenantId: 'samity-ekota',
    memberId: 'mem-001',
    loanNumber: 'LN-EK-2025-01',
    loanScheme: 'ক্ষুদ্র ব্যবসা সম্প্রসারণ ঋণ',
    principalAmount: 100000,
    interestRatePercent: 10,
    durationMonths: 12,
    totalPayable: 110000,
    totalPaid: 65000,
    outstandingBalance: 45000,
    installmentFrequency: 'MONTHLY',
    installmentAmount: 9166,
    totalInstallments: 12,
    paidInstallments: 7,
    guarantor1MemberId: 'mem-003',
    guarantorNotes: 'নাজমুল হুদা (MEM-003) জামিনদার হিসেবে সাক্ষর করেছেন',
    disbursementDate: '2025-12-01',
    purpose: 'মুদি দোকান মালামাল পাইকারি ক্রয়',
    status: 'ACTIVE',
    installments: [
      { installmentNumber: 1, dueDate: '2026-01-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 9166, paidDate: '2026-01-02', status: 'PAID' },
      { installmentNumber: 2, dueDate: '2026-02-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 9166, paidDate: '2026-02-01', status: 'PAID' },
      { installmentNumber: 3, dueDate: '2026-03-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 9166, paidDate: '2026-03-03', status: 'PAID' },
      { installmentNumber: 4, dueDate: '2026-04-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 9166, paidDate: '2026-04-01', status: 'PAID' },
      { installmentNumber: 5, dueDate: '2026-05-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 9166, paidDate: '2026-05-04', status: 'PAID' },
      { installmentNumber: 6, dueDate: '2026-06-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 9166, paidDate: '2026-06-02', status: 'PAID' },
      { installmentNumber: 7, dueDate: '2026-07-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 10004, paidDate: '2026-07-05', status: 'PAID' },
      { installmentNumber: 8, dueDate: '2026-08-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 0, status: 'OVERDUE' },
      { installmentNumber: 9, dueDate: '2026-09-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 10, dueDate: '2026-10-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 11, dueDate: '2026-11-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 12, dueDate: '2026-12-01', principalAmount: 8333, interestAmount: 833, totalDue: 9166, paidAmount: 0, status: 'PENDING' },
    ],
    createdAt: '2025-11-25'
  },
  {
    id: 'loan-002',
    tenantId: 'samity-ekota',
    memberId: 'mem-003',
    loanNumber: 'LN-EK-2026-03',
    loanScheme: 'মেডিকেল ও ফার্মেসি বিনিয়োগ ঋণ',
    principalAmount: 150000,
    interestRatePercent: 10,
    durationMonths: 15,
    totalPayable: 165000,
    totalPaid: 85000,
    outstandingBalance: 80000,
    installmentFrequency: 'MONTHLY',
    installmentAmount: 11000,
    totalInstallments: 15,
    paidInstallments: 8,
    disbursementDate: '2026-01-15',
    purpose: 'ফার্মেসির শীতাতপ নিয়ন্ত্রণ ও ইনভেন্টরি বৃদ্ধি',
    status: 'ACTIVE',
    installments: [],
    createdAt: '2026-01-10'
  }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vch-001',
    tenantId: 'samity-ekota',
    voucherNo: 'VR-2026-1001',
    type: 'CREDIT',
    category: 'সদস্য সঞ্চয় ও ডিপিএস জমা',
    amount: 45000,
    descriptionBn: 'সদস্যদের দৈনিক ও সাপ্তাহিক সঞ্চয় এবং ডিপিএস কিস্তি আদায়',
    descriptionEn: 'Daily/weekly member savings collection and DPS deposit',
    paidToOrReceivedFrom: 'মাঠ কর্মী ও সদস্যবৃন্দ',
    paymentMethod: 'CASH',
    date: '2026-10-25',
    createdBy: 'user-sumon'
  },
  {
    id: 'vch-002',
    tenantId: 'samity-ekota',
    voucherNo: 'VR-2026-1002',
    type: 'DEBIT',
    category: 'অফিস ভাড়া ও ইউটিলিটি বিল',
    amount: 15000,
    descriptionBn: 'বনশ্রী শাখা কার্যালয়ের অক্টোবর মাসের অফিস ভাড়া পরিশোধ',
    descriptionEn: 'Office rent payment for Banasree branch (October 2026)',
    paidToOrReceivedFrom: 'বাড়ির মালিক মো: শফিকুল আলম',
    paymentMethod: 'BANK',
    date: '2026-10-20',
    createdBy: 'user-tareq'
  },
  {
    id: 'vch-003',
    tenantId: 'samity-ekota',
    voucherNo: 'VR-2026-1003',
    type: 'DEBIT',
    category: 'এসএমএস নোটিফিকেশন চার্জ ও সফটওয়্যার বিল',
    amount: 2500,
    descriptionBn: 'বাল্ক এসএমএস রিচার্জ ও সফটওয়্যার সাবস্ক্রিপশন',
    descriptionEn: 'Bulk SMS recharge and software subscription',
    paidToOrReceivedFrom: 'সমিতিপ্রো ক্লাউড সার্ভিসেস',
    paymentMethod: 'BKASH',
    date: '2026-10-18',
    createdBy: 'user-rafiq'
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'mtg-001',
    tenantId: 'samity-ekota',
    titleBn: '৮ম বার্ষিক সাধারণ সভা (AGM - 2026)',
    titleEn: '8th Annual General Meeting (AGM - 2026)',
    type: 'AGM',
    date: '2026-11-15',
    time: 'সকাল ১০:০০ ঘটিকা',
    venue: 'বনশ্রী কমিউনিটি সেন্টার অডিটোরিয়াম, ঢাকা',
    agenda: [
      'বিগত এজিএম-এর কার্যবিবরণী পাঠ ও অনুমোদন',
      '২০২৫-২০২৬ অর্থবছরের নিরীক্ষিত অডিট রিপোর্ট ও ব্যালান্স শিট পেশ',
      'সদস্যদের মাঝে বার্ষিক লভ্যাংশ (১২%) বণ্টন সংক্রান্ত সিদ্ধান্ত',
      '২০২৬-২০২৮ মেয়াদের নতুন কার্যনির্বাহী কমিটি গঠন'
    ],
    resolutions: [
      'অডিট রিপোর্ট সর্বসম্মতিক্রমে অনুমোদিত হয়েছে',
      'প্রতি শেয়ারে ১২০ টাকা হারে বার্ষিক মুনাফা প্রদানের সিদ্ধান্ত গৃহীত'
    ],
    totalAttendees: 142,
    status: 'SCHEDULED'
  },
  {
    id: 'mtg-002',
    tenantId: 'samity-ekota',
    titleBn: 'অক্টোবর মাসিক পরিচালনা পর্ষদ সভা',
    titleEn: 'October Executive Committee Meeting',
    type: 'COMMITTEE',
    date: '2026-10-10',
    time: 'সন্ধ্যা ৭:৩০ ঘটিকা',
    venue: 'সমিতি প্রধান কার্যালয় বোর্ডরুম',
    agenda: [
      'নতুন ক্ষুদ্র ঋণ আবেদনসমূহ যাচাই ও অনুমোদন',
      'খেলাপি কিস্তি আদায়ে তাগিদপত্র প্রদান',
      'সমিতিপ্রো অ্যান্ড্রয়েড অ্যাপে সকল সদস্যের ডাটা এন্ট্রি সমাপ্তি'
    ],
    resolutions: [
      '৫ জন সদস্যের মোট ৪,৫০,০০০ টাকার ঋণ অনুমোদন',
      'সকল সদস্যের জন্য মোবাইল অ্যাপে পাসবই দেখার সুবিধা চালু'
    ],
    totalAttendees: 9,
    status: 'COMPLETED'
  }
];

export const INITIAL_ELECTIONS: Election[] = [
  {
    id: 'elec-001',
    tenantId: 'samity-ekota',
    titleBn: 'কার্যনির্বাহী পরিষদ নির্বাচন ২০২৬-২০২৮',
    titleEn: 'Executive Council Election 2026-2028',
    termYears: '2026-2028',
    electionDate: '2026-11-20',
    status: 'ACTIVE',
    totalEligibleVoters: 185,
    totalVotesCast: 98,
    candidates: [
      {
        id: 'cand-001',
        memberId: 'mem-001',
        nameBn: 'আলহাজ্ব রফিকুল ইসলাম',
        nameEn: 'Alhaj Rafiqul Islam',
        post: 'PRESIDENT',
        symbolName: 'দোয়াত-কলম',
        symbolEmoji: '✒️',
        voteCount: 56
      },
      {
        id: 'cand-002',
        memberId: 'mem-005',
        nameBn: 'আবদুর রহমান',
        nameEn: 'Abdur Rahman',
        post: 'PRESIDENT',
        symbolName: 'উড়ন্ত পায়রা',
        symbolEmoji: '🕊️',
        voteCount: 42
      },
      {
        id: 'cand-003',
        memberId: 'mem-003',
        nameBn: 'নাজমুল হুদা',
        nameEn: 'Nazmul Huda',
        post: 'SECRETARY',
        symbolName: 'গোলাপ ফুল',
        symbolEmoji: '🌹',
        voteCount: 68
      },
      {
        id: 'cand-004',
        memberId: 'mem-004',
        nameBn: 'ফরিদা ইয়াসমিন',
        nameEn: 'Farida Yasmin',
        post: 'SECRETARY',
        symbolName: 'উদীয়মান সূর্য',
        symbolEmoji: '🌅',
        voteCount: 30
      }
    ]
  }
];

export const INITIAL_EVENTS: RealtimeEvent[] = [
  {
    id: 'evt-001',
    tenantId: 'samity-ekota',
    type: 'NEW_SAVINGS_DEPOSIT',
    titleBn: 'নতুন সঞ্চয় জমা গ্রহণ',
    titleEn: 'New Savings Deposit Received',
    messageBn: 'মো: কবির আহমেদ (MEM-001) ২,৫০০ টাকা সঞ্চয় জমা দিয়েছেন।',
    messageEn: 'Md. Kabir Ahmed (MEM-001) deposited ৳ 2,500 in savings.',
    amount: 2500,
    memberId: 'mem-001',
    memberName: 'মো: কবির আহমেদ',
    timestamp: '2026-10-25 15:30:10'
  },
  {
    id: 'evt-002',
    tenantId: 'samity-ekota',
    type: 'LOAN_INSTALLMENT_PAID',
    titleBn: 'ঋণের কিস্তি আদায়',
    titleEn: 'Loan Installment Collected',
    messageBn: 'নাজমুল হুদা (MEM-003) ১১,০০০ টাকা ঋণ কিস্তি পরিশোধ করেছেন।',
    messageEn: 'Nazmul Huda (MEM-003) paid ৳ 11,000 loan installment.',
    amount: 11000,
    memberId: 'mem-003',
    memberName: 'নাজমুল হুদা',
    timestamp: '2026-10-25 14:15:00'
  },
  {
    id: 'evt-003',
    tenantId: 'samity-ekota',
    type: 'SYSTEM_ANNOUNCEMENT',
    titleBn: 'মোবাইল অ্যাপ নোটিফিকেশন',
    titleEn: 'Mobile App Notification',
    messageBn: 'সকল সদস্যের ডিজিটাল পাসবই রিয়েল-টাইমে আপডেট করা হয়েছে।',
    messageEn: 'Digital passbook updated in real-time for all members.',
    timestamp: '2026-10-25 12:00:00'
  }
];
