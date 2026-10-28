export const APP_VERSION = 'v2.0.0';

export type Language = 'bn' | 'en';

export type TenantType = 
  | 'SAMITY'              // সমবায় সমিতি / General Samity
  | 'CLUB'                // ক্লাব ও ক্রীড়া সংগঠন
  | 'ASSOCIATION'         // পেশাজীবী ও ব্যবসায়ী সমিতি
  | 'SAVINGS_GROUP'       // ক্ষুদ্র ঋণ ও সঞ্চয় দল
  | 'COMMITTEE'           // মসজিদ/মাদ্রাসা/মন্দির/স্কুল পরিচালনা কমিটি
  | 'CHARITY'             // দাতব্য ও কল্যাণ সংস্থা
  | 'SOCIAL'              // সামাজিক সংগঠন
  | 'BUSINESS'            // ব্যবসায়ী সমিতি
  | 'RELIGIOUS'           // ধর্মীয় কমিটি
  | 'SCHOOL'              // বিদ্যালয় পরিচালনা কমিটি
  | 'OTHER';              // অন্যান্য

export type SubscriptionPlan = 'STARTER' | 'STANDARD' | 'ENTERPRISE' | 'FREE_TRIAL';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';
export type SamityLifecycleStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface MobileBankingConfig {
  id?: string;
  provider: 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY';
  number: string;
  accountType: 'PERSONAL' | 'MERCHANT';
}

export interface LateFeeConfig {
  enabled: boolean;
  amount: number;
  gracePeriodDays: number;
}

export interface Tenant {
  id: string;
  samityId?: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  type: TenantType;
  registrationNo: string;
  establishedDate?: string;
  establishedYear: number;
  phone: string;
  phoneNumber?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  email: string;
  address: string;
  division?: string;
  district?: string;
  upazila?: string;
  postOffice?: string;
  villageArea?: string;
  website?: string;
  facebookPageUrl?: string;
  youtubeChannelUrl?: string;
  sloganBn?: string;
  sloganEn?: string;
  logoUrl?: string;
  bannerUrl?: string;
  
  // Banking & Mobile Banking
  bankAccountName?: string;
  bankName?: string;
  bankBranchName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  mobileBanking?: MobileBankingConfig[];

  // Financial & Subscription Policy
  currency: string;
  monthlySubscriptionAmount?: number;
  subscriptionDueDay?: number;
  lateFeeSettings?: LateFeeConfig;
  financialYearStart?: string;
  financialYearEnd?: string;

  // Plan & Status
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  samityStatus?: SamityLifecycleStatus;
  validUntil: string;
  smsBalance: number;
  
  settings: {
    enableDps: boolean;
    enableSavings?: boolean;
    enableLoans: boolean;
    enableFdr?: boolean;
    enableShares?: boolean;
    enableStaffPayroll?: boolean;
    enableAssetInventory?: boolean;
    enableProjects?: boolean;
    enableElections: boolean;
    enableSmsAlerts: boolean;
    enableOnlinePayment: boolean;
    enableDocumentGenerator?: boolean;
    enableMemberPortal?: boolean;
    // Granular Sub-Module & Operating Model Controls (Super Admin Controlled)
    enableFieldOfficers?: boolean;        // মাঠকর্মী ও মোবাইল POS কালেকশন সিস্টেম
    enablePropertyProjects?: boolean;     // প্রোপার্টি, জমি ও যৌথ প্রকল্প বিনিয়োগ
    enableFixedMonthlySavings?: boolean;  // ফিক্সড মাসিক চাঁদা/সঞ্চয় (যেমন ১০,০০০ টাকা)
    fixedMonthlyAmount?: number;          // নির্ধারিত মাসিক সঞ্চয়/চাঁদা (ডিফল্ট ১০,০০০ টাকা)
    enableMicroLoans?: boolean;           // সাধারণ ক্ষুদ্রঋণ ও কিস্তি হিসাব
    samityOperatingModel?: 'SAVINGS_ONLY' | 'INVESTMENT_PROPERTY' | 'MICRO_CREDIT' | 'MULTI_PURPOSE'; // সমিতির পরিচালনা মোড
    isSavingsOnlySamity?: boolean;        // শুধুমাত্র সঞ্চয় ও ডিপিএস সমিতি (কোনো ঋণ দেওয়া হবে না)
    targetMemberCount?: number;           // সমিতির মোট নির্ধারিত সদস্য কোটা (যেমন ২০ জন)
    strictNoLoanPolicy?: boolean;         // ঋণ সম্পূর্ণ নিষিদ্ধ
    monthlySavingsPerMember?: number;     // প্রতি সদস্যের মাসিক বাধ্যতামূলক সঞ্চয়ের পরিমাণ
    maxMembers?: number;
    maxStaff?: number;
    memberCanApplyLoanOnline?: boolean;
    memberCanDownloadReceipt?: boolean;
    autoSmsOnDeposit?: boolean;
    autoSmsOnLoanRepay?: boolean;
    shareFaceValue: number;
    defaultSavingsInterestRate: number;
    defaultLoanInterestRate: number;
    penaltyPerMissedInstallment: number;
  };
  
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type UserRole = 
  | 'SUPER_ADMIN'      // SaaS Platform Owner
  | 'SAMITY_ADMIN'     // Samity President / Secretary / Owner
  | 'MANAGER'          // Samity Branch/Office Manager
  | 'FIELD_COLLECTOR'  // মাঠ কর্মী (Mobile Collection Agent)
  | 'MEMBER';          // সাধারণ সদস্য

export interface User {
  id: string;
  tenantId?: string; // null for SUPER_ADMIN
  nameBn: string;
  nameEn: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  memberId?: string; // linked to Member record
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'RETIRED' | 'SUSPENDED';
export type MemberCategory = 'GENERAL' | 'EXECUTIVE' | 'ADVISORY' | 'LIFE' | 'DONOR' | 'ASSOCIATE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Nominee {
  name: string;
  nameEn?: string;
  relation: string;
  nidOrBirthCert: string;
  phone: string;
  sharePercentage: number;
  dateOfBirth?: string;
  address?: string;
  photoUrl?: string;
}

export interface Member {
  id: string;
  tenantId: string;
  memberCode: string; // e.g. "MEM-001" or "MEM-2026-001"
  nameBn: string;
  nameEn: string;
  fatherHusbandName: string;
  motherName: string;
  spouseName?: string;
  phone: string;
  whatsappNumber?: string;
  alternatePhone?: string;
  email?: string;
  nid: string;
  nidType?: 'SMART_NID' | 'OLD_NID' | 'BIRTH_CERTIFICATE' | 'PASSPORT';
  birthRegistrationNo?: string;
  dateOfBirth: string;
  age?: number;
  gender: Gender;
  bloodGroup?: string;
  religion?: 'ISLAM' | 'HINDUISM' | 'BUDDHISM' | 'CHRISTIANITY' | 'OTHER';
  maritalStatus?: 'MARRIED' | 'UNMARRIED' | 'WIDOWED' | 'DIVORCED';
  occupation: string;
  education?: string;
  designation?: string; // সভাপতি, সাধারণ সম্পাদক, কোষাধ্যক্ষ, সাধারণ সদস্য, etc.
  category: MemberCategory;
  status: MemberStatus;
  admissionDate: string;
  admissionFee: number;
  monthlySubscriptionAmount?: number;
  sharesHeld: number;
  shareValue: number;
  savingsBalance: number;
  dpsBalance: number;
  loanOutstanding: number;
  
  // Photos & KYC
  photoUrl?: string;
  nidDocumentUrl?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  signatureUrl?: string;

  // Address
  presentAddress: string;
  presentDivision?: string;
  presentDistrict?: string;
  presentUpazila?: string;
  permanentAddress: string;
  permanentDivision?: string;
  permanentDistrict?: string;
  permanentUpazila?: string;
  isSameAddress?: boolean;

  // Nominee & Emergency Contact
  nominee: Nominee;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Audit & Tracking Metadata
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
  syncVersion?: number;
  isSynced?: boolean;
}

export interface ShareAccount {
  id: string;
  tenantId: string;
  memberId: string;
  certificateNo: string;
  numberOfShares: number;
  faceValue: number;
  totalValue: number;
  purchaseDate: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'SURRENDERED';
}

export type SavingsType = 'GENERAL_SAVINGS' | 'DPS' | 'FIXED_DEPOSIT' | 'SPECIAL';

export interface SavingsAccount {
  id: string;
  tenantId: string;
  memberId: string;
  accountNo: string;
  type: SavingsType;
  title: string;
  balance: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  targetAmount?: number;
  monthlyInstallment?: number;
  tenureMonths?: number;
  interestRate: number;
  startDate: string;
  maturityDate?: string;
  lastDepositDate?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  nomineePhone?: string;
  nomineeNid?: string;
  nomineeSharePercent?: number;
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
  closedDate?: string;
  closedReason?: string;
  createdAt?: string;
}

export interface SavingsPolicyConfig {
  tenantId: string;
  generalSavingsInterestRate: number;
  minimumBalanceRequired: number;
  allowWithdrawalAnytime: boolean;
  dpsDefaultFinePerMissedMonth: number;
  dpsGracePeriodDays: number;
  dpsEarlyClosureProfitDeductionPercent: number;
  fixedDepositRates: {
    months6: number;
    months12: number;
    months24: number;
    months36: number;
  };
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export type PaymentMethod = 'CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'MFS' | 'ONLINE';

export interface SavingsTransaction {
  id: string;
  tenantId: string;
  accountId: string;
  memberId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'PENALTY';
  amount: number;
  balanceAfter: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  collectorId: string;
  notes?: string;
  date: string;
  receiptNo: string;
}

export type LoanStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'REJECTED';
export type LoanInterestMethod = 'FLAT' | 'REDUCING';
export type LoanFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface LoanGuarantor {
  name: string;
  relation?: string;
  phone: string;
  nid?: string;
  memberId?: string;
  address?: string;
}

export interface LoanInstallment {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalDue: number;
  paidAmount: number;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  penalty?: number;
  voucherNo?: string;
  receiptNo?: string;
}

export interface LoanPolicyConfig {
  tenantId: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  defaultInterestRate: number;
  defaultInterestMethod: LoanInterestMethod;
  defaultDurationMonths: number;
  maxLoanToSavingsRatio: number; // e.g. 3.0 (up to 3x savings)
  processingFeePercent: number; // e.g. 1.0%
  lateFinePerInstallment: number; // e.g. 100 BDT
  gracePeriodDays: number;
  requireGuarantor: boolean;
  requireSecurityCheque: boolean;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface Loan {
  id: string;
  tenantId: string;
  memberId: string;
  loanNumber: string;
  loanScheme: string; // e.g. 'ক্ষুদ্র ব্যবসা সম্প্রসারণ ঋণ', 'সাধারণ সমবায় ঋণ', 'জরুরি ঋণ', 'কৃষি বিনিয়োগ ঋণ'
  principalAmount: number;
  interestRatePercent: number; // e.g. 10%
  interestMethod?: LoanInterestMethod; // FLAT or REDUCING
  durationMonths: number;
  totalPayable: number;
  totalPaid: number;
  outstandingBalance: number;
  installmentFrequency: LoanFrequency;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  processingFee?: number;
  guarantor1?: LoanGuarantor;
  guarantor2?: LoanGuarantor;
  guarantor1MemberId?: string;
  guarantor2MemberId?: string;
  guarantorNotes?: string;
  collateralDetails?: string;
  disbursementDate?: string;
  disbursedBy?: string;
  disbursementMethod?: PaymentMethod;
  disbursementVoucherNo?: string;
  approvalDate?: string;
  approvedBy?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  purpose: string;
  status: LoanStatus;
  installments: LoanInstallment[];
  lastPaymentDate?: string;
  closedDate?: string;
  closedReason?: string;
  createdAt: string;
}

export interface LoanRepayment {
  id: string;
  tenantId: string;
  loanId: string;
  memberId: string;
  installmentNumber: number;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
  paymentMethod: PaymentMethod;
  receiptNo: string;
  collectorId: string;
  date: string;
  notes?: string;
}

export type VoucherType = 'DEBIT' | 'CREDIT' | 'JOURNAL';
export type AccountHeadGroup = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';

export interface AccountHead {
  id: string;
  tenantId: string;
  code: string;               // e.g. "1010", "1020", "2010", "3010", "4010"
  nameBn: string;             // e.g. "হাতে নগদ ক্যাশ"
  nameEn: string;             // e.g. "Cash in Hand"
  group: AccountHeadGroup;
  subGroup: string;           // e.g. "চলতি সম্পদ", "স্থায়ী সম্পদ", "চলতি দায়", "অফিস ব্যয়"
  openingBalance: number;
  currentBalance: number;
  isSystemDefault: boolean;
  notes?: string;
}

export interface Voucher {
  id: string;
  tenantId: string;
  voucherNo: string;
  type: VoucherType;
  category: string; // e.g. "Office Rent", "Member Savings Deposit", "Loan Disbursement", "Event Expense"
  accountHeadCode?: string;
  accountHeadNameBn?: string;
  debitAccount?: string;
  creditAccount?: string;
  amount: number;
  descriptionBn: string;
  descriptionEn: string;
  paidToOrReceivedFrom: string;
  paymentMethod: PaymentMethod;
  bankAccountName?: string;
  chequeOrTxNo?: string;
  date: string;
  createdBy: string;
  approvedBy?: string;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  attachmentUrl?: string;
}

export interface GeneralLedgerEntry {
  id: string;
  date: string;
  voucherNo: string;
  particularsBn: string;
  accountHeadCode: string;
  debit: number;
  credit: number;
  balance: number;
  paymentMethod: PaymentMethod;
}

export interface TrialBalanceItem {
  code: string;
  nameBn: string;
  nameEn: string;
  group: AccountHeadGroup;
  debit: number;
  credit: number;
}

export type MeetingType = 'AGM' | 'EGM' | 'MONTHLY' | 'EMERGENCY' | 'COMMITTEE' | 'REQUISITION';
export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';

export interface MeetingAgendaItem {
  id: string;
  serial: number;
  titleBn: string;
  discussionBn?: string;
  resolutionBn?: string;
  proposerNameBn?: string;
  seconderNameBn?: string;
  status?: 'PENDING' | 'DISCUSSED' | 'PASSED' | 'DROPPED';
}

export interface MeetingResolution {
  id: string;
  resolutionNo: string; // e.g. "রেজোলিউশন ০১/২০২৬"
  agendaSerial?: number;
  subjectBn: string;
  detailsBn: string;
  proposerBn?: string;
  seconderBn?: string;
  votingResult?: 'UNANIMOUS' | 'MAJORITY' | 'VETO';
  effectiveDate?: string;
}

export interface MeetingAttendee {
  memberId: string;
  memberCode: string;
  nameBn: string;
  roleBn?: string;
  phone?: string;
  isPresent: boolean;
  remarks?: string;
  signedAt?: string;
}

export interface Meeting {
  id: string;
  tenantId: string;
  meetingNo?: string;
  titleBn: string;
  titleEn: string;
  type: MeetingType;
  date: string;
  time: string;
  venue: string;
  chairpersonNameBn?: string;
  recordingSecretaryNameBn?: string;
  targetAudience?: 'ALL_MEMBERS' | 'EXECUTIVE_COMMITTEE' | 'GENERAL_BODY';
  quorumRequired?: number;
  quorumPresent?: number;
  isQuorumMet?: boolean;
  attendees?: MeetingAttendee[];
  agenda: (string | MeetingAgendaItem)[];
  resolutions: (string | MeetingResolution)[];
  minutesTextBn?: string;
  minutesApprovedBy?: string;
  minutesApprovedDate?: string;
  totalAttendees: number;
  status: MeetingStatus;
  noticePublished?: boolean;
  noticeId?: string;
  minutesDocumentUrl?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  syncVersion?: number;
  isSynced?: boolean;
}

export type ElectionStatus = 'SCHEDULED' | 'NOMINATION' | 'SCRUTINY' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type ElectionPost = 
  | 'PRESIDENT' 
  | 'VICE_PRESIDENT' 
  | 'SECRETARY' 
  | 'JOINT_SECRETARY' 
  | 'TREASURER' 
  | 'ORGANIZING_SECRETARY' 
  | 'WOMEN_AFFAIRS_SECRETARY' 
  | 'EXECUTIVE_MEMBER';

export type CandidateStatus = 'NOMINATED' | 'VALID' | 'WITHDRAWN' | 'REJECTED' | 'ELECTED';

export interface ElectionPostConfig {
  id: string;
  post: ElectionPost;
  titleBn: string;
  titleEn: string;
  seatsCount: number;
}

export interface ElectionCandidate {
  id: string;
  electionId?: string;
  memberId: string;
  memberCode?: string;
  nameBn: string;
  nameEn: string;
  post: ElectionPost;
  symbolName: string;
  symbolEmoji: string;
  photoUrl?: string;
  manifestoBn?: string;
  proposerNameBn?: string;
  seconderNameBn?: string;
  status?: CandidateStatus;
  voteCount: number;
}

export interface ElectionVoter {
  memberId: string;
  memberCode: string;
  nameBn: string;
  phone: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  hasVoted: boolean;
  votedAt?: string;
}

export interface ElectionCommission {
  chiefCommissionerNameBn: string;
  chiefCommissionerTitleBn?: string;
  commissioner2NameBn?: string;
  commissioner3NameBn?: string;
  officeAddressBn?: string;
}

export interface Election {
  id: string;
  tenantId: string;
  electionNo?: string;
  titleBn: string;
  titleEn: string;
  termYears: string; // e.g. "2026-2028"
  electionDate: string;
  votingStartTime?: string;
  votingEndTime?: string;
  venue?: string;
  status: ElectionStatus | 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  commission?: ElectionCommission;
  posts?: ElectionPostConfig[];
  totalEligibleVoters: number;
  totalVotesCast: number;
  candidates: ElectionCandidate[];
  voters?: ElectionVoter[];
  resultPublishedAt?: string;
  resultCertifiedBy?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  syncVersion?: number;
  isSynced?: boolean;
}

export interface RealtimeEvent {
  id: string;
  tenantId: string;
  type: 
    | 'NEW_SAVINGS_DEPOSIT' 
    | 'LOAN_INSTALLMENT_PAID' 
    | 'NEW_MEMBER_JOINED' 
    | 'NEW_VOUCHER_CREATED'
    | 'VOUCHER_APPROVED'
    | 'LOAN_APPROVED'
    | 'LOAN_APPLICATION_SUBMITTED'
    | 'LOAN_DISBURSED'
    | 'VOTE_CAST'
    | 'SYSTEM_ANNOUNCEMENT'
    | 'BANK_DEPOSIT_ADDED'
    | 'SUBSCRIPTION_PAID'
    | 'RECEIPT_GENERATED'
    | 'NOTICE_PUBLISHED'
    | 'MEETING_SCHEDULED'
    | 'MEETING_COMPLETED'
    | 'RESOLUTION_PASSED'
    | 'REMINDER_SENT';
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  amount?: number;
  memberId?: string;
  memberName?: string;
  timestamp: string;
}

export interface PassbookRecord {
  date: string;
  receiptNo: string;
  description: string;
  depositAmount: number;
  withdrawAmount: number;
  balance: number;
  collectedBy: string;
}

export type FeePaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';
export type SubscriptionBillingFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
export type LateFeeType = 'FIXED' | 'PERCENTAGE' | 'DAILY_RECURRING';

export interface CategorySubscriptionRate {
  category: MemberCategory;
  categoryNameBn: string;
  categoryNameEn: string;
  monthlyAmount: number;
  admissionFee: number;
  isExempt: boolean;
}

export interface SubscriptionPolicyConfig {
  tenantId: string;
  defaultMonthlyAmount: number;
  frequency: SubscriptionBillingFrequency;
  dueDayOfMonth: number; // e.g. 10
  gracePeriodDays: number; // e.g. 5 days
  lateFeeEnabled: boolean;
  lateFeeType: LateFeeType;
  lateFeeAmount: number; // e.g. 100 BDT or 5%
  annualDiscountEnabled: boolean;
  annualDiscountPercent: number; // e.g. 10%
  autoBillingEnabled: boolean;
  autoBillingDay: number; // e.g. 1
  categoryRates: CategorySubscriptionRate[];
  lateFeeWaiverRole: string; // e.g. 'PRESIDENT' | 'ADMIN'
  updatedBy?: string;
  updatedAt?: string;
}

export interface LateFeeWaiverRecord {
  id: string;
  tenantId: string;
  subscriptionId: string;
  memberId: string;
  memberNameBn: string;
  monthYear: string;
  originalLateFee: number;
  waivedAmount: number;
  waivedReason: string;
  waivedBy: string;
  waivedAt: string;
}

export interface MonthlySubscription {
  id: string;
  tenantId: string;
  memberId: string;
  memberCode: string;
  memberNameBn: string;
  memberNameEn: string;
  phone: string;
  monthYear: string; // e.g. "2026-10"
  monthNameBn: string; // e.g. "অক্টোবর ২০২৬"
  feeAmount: number;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: FeePaymentStatus;
  paymentDate?: string;
  receiptNo?: string;
  paymentMethod?: PaymentMethod;
  collectedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankDeposit {
  id: string;
  tenantId: string;
  bankName: string;
  accountNumber: string;
  branchName: string;
  depositDate: string;
  amount: number;
  slipNumber: string;
  depositSlipUrl?: string;
  depositedBy: string;
  approvedBy?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  voucherNo: string;
  notes?: string;
  createdAt: string;
}

export type ReceiptType = 'SUBSCRIPTION' | 'SAVINGS' | 'LOAN_EMI' | 'ADMISSION' | 'SHARE';

export interface PaidReceipt {
  id: string;
  tenantId: string;
  receiptNo: string;
  receiptType: ReceiptType;
  titleBn: string;
  titleEn: string;
  memberId: string;
  memberCode: string;
  memberNameBn: string;
  memberNameEn: string;
  phone: string;
  amount: number;
  amountInWordsBn: string;
  amountInWordsEn: string;
  date: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  collectedBy: string;
  collectorNameBn: string;
  qrCodeData: string;
  isVerified: boolean;
  createdAt: string;
}

export type NoticeCategory = 'GENERAL' | 'AGM' | 'MEETING' | 'FEE_REMINDER' | 'EMERGENCY';
export type NoticePriority = 'HIGH' | 'NORMAL' | 'URGENT';

export interface Notice {
  id: string;
  tenantId: string;
  titleBn: string;
  titleEn: string;
  contentBn: string;
  contentEn: string;
  category: NoticeCategory;
  priority: NoticePriority;
  publishedDate: string;
  publishedBy: string;
  publisherNameBn: string;
  isPinned: boolean;
  viewCount: number;
}

export type DocumentCategory = 'REGISTRATION' | 'BYLAWS' | 'AUDIT_REPORT' | 'DEED' | 'GOVT_APPROVAL' | 'OTHER';

export interface SamityDocument {
  id: string;
  tenantId: string;
  titleBn: string;
  titleEn: string;
  category: DocumentCategory;
  fileNumber?: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  descriptionBn?: string;
}

export type LogoPosition = 'LEFT' | 'CENTER' | 'RIGHT';
export type LogoSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type SealShape = 'ROUND' | 'OVAL' | 'RECTANGLE';

export interface LetterheadConfig {
  tenantId: string;
  samityNameBn: string;
  samityNameEn: string;
  govtRegNo: string;
  establishedYear: number;
  sloganBn: string;
  sloganEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  sealTextBn: string;
  presidentNameBn: string;
  secretaryNameBn: string;
  treasurerNameBn: string;
  logoPosition?: LogoPosition;
  logoSize?: LogoSize;
  headerBorderColor?: string;
  headerHeight?: number;
}

export type ReminderChannel = 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'MESSENGER' | 'PUSH' | 'MANUAL';

export interface DueReminder {
  id: string;
  tenantId: string;
  memberId: string;
  memberCode: string;
  memberNameBn: string;
  phone: string;
  dueAmount: number;
  dueMonthBn: string;
  sentDate: string;
  channel: ReminderChannel;
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
  deliveryNote?: string;
}

export type PrintPaperSize = 'A4' | 'A5' | 'THERMAL_80MM';

export interface SignatureSealConfig {
  tenantId: string;
  presidentName: string;
  presidentTitleBn: string;
  presidentSignatureUrl?: string;
  secretaryName: string;
  secretaryTitleBn: string;
  secretarySignatureUrl?: string;
  cashierName: string;
  cashierTitleBn: string;
  cashierSignatureUrl?: string;
  officialSealUrl?: string;
  sealTextBn: string;
  showSignatureOnReceipt: boolean;
  showSealOnReceipt: boolean;
  sealText?: string;
  sealShape?: SealShape;
  sealColor?: string;
  sealRotation?: number;
}

export interface VoucherPrefixConfig {
  tenantId: string;
  receiptPrefix: string;      // e.g. "REC-"
  memberCodePrefix: string;   // e.g. "MEM-"
  depositPrefix: string;      // e.g. "DEP-"
  expensePrefix: string;      // e.g. "EXP-"
  loanPrefix: string;         // e.g. "LN-"
  nextReceiptNumber: number;
  currencySymbol: string;     // e.g. "৳"
  fiscalYear: string;         // e.g. "2026-2027"
  paperSize: PrintPaperSize;
  enableWatermark: boolean;
  watermarkTextBn: string;
  footerNoteBn: string;
}

export interface BulkDepositItem {
  id: string;
  bankName: string;
  accountNumber: string;
  branchName: string;
  depositDate: string;
  amount: number;
  slipNumber: string;
  depositorName: string;
  category: string;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'IMPORT' | 'RESTORE' | 'LOGIN' | 'DISBURSE';
export type AuditEntity = 
  | 'MEMBER' 
  | 'DEPOSIT' 
  | 'LOAN' 
  | 'EXPENSE' 
  | 'RECEIPT' 
  | 'SETTING' 
  | 'SETTINGS' 
  | 'DOCUMENT' 
  | 'BACKUP' 
  | 'TENANT' 
  | 'SUBSCRIPTION' 
  | 'SAVINGS_ACCOUNT' 
  | 'MEETING' 
  | 'NOTICE' 
  | 'ELECTION' 
  | 'REPORT' 
  | 'PAYMENT' 
  | 'FIELD_COLLECTION' 
  | 'FIELD_DAY_END' 
  | 'PROJECT' 
  | 'PROJECT_TRANSACTION' 
  | 'SHARE_CAPITAL' 
  | 'DIVIDEND' 
  | 'FDR'
  | 'FIXED_ASSET'
  | 'INVENTORY'
  | 'STAFF'
  | 'ATTENDANCE'
  | 'STAFF_ADVANCE'
  | 'PAYROLL'
  | 'NOTIFICATION'
  | 'OTHER';

export type ReportType = 
  | 'COLLECTION_SHEET' 
  | 'PASSBOOK' 
  | 'BALANCE_SHEET' 
  | 'INCOME_EXPENDITURE' 
  | 'DEFAULTERS' 
  | 'TRIAL_BALANCE';

export interface FinancialStatementFilter {
  startDate?: string;
  endDate?: string;
  memberId?: string;
  category?: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  descriptionBn: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  ipAddress?: string;
}

export type ApprovalType = 
  | 'BANK_DEPOSIT' 
  | 'LOAN_APPLICATION' 
  | 'EXPENSE_VOUCHER' 
  | 'SAVINGS_WITHDRAWAL' 
  | 'DPS_OPENING' 
  | 'CERTIFICATE_REQUEST' 
  | 'KYC_UPDATE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalItem {
  id: string;
  tenantId: string;
  type: ApprovalType;
  titleBn: string;
  requestedBy: string;
  requestedAt: string;
  amount: number;
  status: ApprovalStatus;
  approvedBy?: string;
  actionDate?: string;
  rejectionReason?: string;
  referenceId: string;
  details?: Record<string, string | number | boolean | null | undefined>;
}

export type GeneratedDocType = 'MEMBERSHIP_CERTIFICATE' | 'LOAN_AGREEMENT' | 'RESOLUTION' | 'CLEARANCE_NOC';

export interface GeneratedDocument {
  id: string;
  tenantId: string;
  docType: GeneratedDocType;
  titleBn: string;
  referenceNo: string;
  recipientNameBn: string;
  recipientCode?: string;
  contentBn: string;
  issueDate: string;
  issuedBy: string;
  status: 'ACTIVE' | 'REVOKED';
}

export type WhatsAppMode = 'OPEN_WA' | 'WA_ME_DIRECT' | 'OFFICIAL_META';
export type SmsProvider = 'TEXTBEE' | 'HTTPSMS' | 'LOCAL_ANDROID' | 'COMMERCIAL_AGGREGATOR';

export interface CommunicationGatewayConfig {
  tenantId: string;
  // WhatsApp Settings (Open-WA & wa.me)
  whatsappMode: WhatsAppMode;
  openWaServerUrl: string;
  openWaApiKey: string;
  whatsappConnectedPhone?: string;
  isWhatsappConnected: boolean;

  // SMS Gateway Settings (TextBee, HTTP SMS, Local Android SIM)
  smsProvider: SmsProvider;
  textBeeDeviceId: string;
  textBeeApiKey: string;
  httpSmsApiKey: string;
  localAndroidGatewayUrl: string;
  commercialSmsApiKey: string;
  commercialSmsSenderId: string;
  smsSimBalanceCount: number;

  // Telegram Bot Settings
  telegramBotToken: string;
  telegramChatId: string;
  isTelegramConnected: boolean;

  // Facebook Messenger & Botpress Settings
  botpressWebhookUrl: string;
  facebookPageId: string;
  facebookPageToken: string;
  isMessengerConnected: boolean;
}

export interface AutoSchedulerConfig {
  tenantId: string;
  enableAutoDueReminder: boolean;
  triggerDayOfMonth: number;
  defaultChannel: ReminderChannel;
  rateLimitDelaySec: number;
  lastRunDate?: string;
  nextScheduledDate: string;
  messageTemplateBn: string;
}

export interface OfflineQueueItem {
  id: string;
  tenantId: string;
  entity: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: unknown;
  createdAt: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  errorMessage?: string;
}

// ----------------------------------------------------
// MODULE: ONLINE PAYMENT GATEWAYS (bKash, Nagad, Rocket, SSLCommerz)
// ----------------------------------------------------
export type PaymentGatewayProvider = 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'SSLCOMMERZ' | 'BANK_TRANSFER';

export type PaymentPurpose = 
  | 'MONTHLY_SUBSCRIPTION'
  | 'SAVINGS_DEPOSIT'
  | 'DPS_INSTALLMENT'
  | 'LOAN_INSTALLMENT'
  | 'SHARE_PURCHASE'
  | 'ADMISSION_FEE';

export interface OnlinePaymentTransaction {
  id: string;
  tenantId: string;
  memberId: string;
  memberNameBn: string;
  memberCode: string;
  phone: string;
  gateway: PaymentGatewayProvider;
  purpose: PaymentPurpose;
  referenceId: string; // e.g. loanId or savingsAccountId or subscriptionId
  amount: number;
  chargeAmount: number;
  totalPaid: number;
  trxId: string;
  gatewayPaymentId: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  verifiedAt?: string;
  verifiedBy?: string;
  receiptNo: string;
  voucherId?: string;
  ipAddress?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentGatewayConfig {
  tenantId: string;
  // bKash Merchant Configuration
  bKashMerchantNumber: string;
  bKashAppKey: string;
  bKashAppSecret: string;
  bKashUsername: string;
  bKashPassword: string;
  bKashEnabled: boolean;
  bKashIsSandbox: boolean;

  // Nagad Merchant Configuration
  nagadMerchantNumber: string;
  nagadMerchantId: string;
  nagadPublicKey: string;
  nagadPrivateKey: string;
  nagadEnabled: boolean;
  nagadIsSandbox: boolean;

  // Rocket & Upay Configuration
  rocketMerchantNumber: string;
  rocketEnabled: boolean;
  upayMerchantNumber: string;
  upayEnabled: boolean;

  // SSLCommerz Configuration
  sslczStoreId: string;
  sslczStorePassword: string;
  sslczIsLive: boolean;
  sslczEnabled: boolean;

  // Policies
  serviceChargePercentage: number;
  autoApproveVerifiedPayments: boolean;
}

// ----------------------------------------------------
// MODULE: FIELD COLLECTOR DESK & BLUETOOTH THERMAL POS (58mm/80mm)
// ----------------------------------------------------
export interface FieldCollectorDailyCollection {
  id: string;
  tenantId: string;
  collectorId: string;
  collectorName: string;
  collectorPhone: string;
  routeOrArea: string; // e.g. 'সোনাপুর বাজার ও পূর্ব পাড়া'
  date: string;
  memberId: string;
  memberCode: string;
  memberName: string;
  memberPhone: string;
  savingsAmount: number;
  dpsAmount: number;
  loanInstallmentAmount: number;
  totalCollected: number;
  receiptNo: string;
  paymentMethod: 'CASH' | 'MFS';
  status: 'COLLECTED' | 'HANDED_OVER' | 'CANCELLED';
  isSynced: boolean;
  syncId?: string;
  thermalReceiptPrinted: boolean;
  collectedAt: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface FieldDayEndSummary {
  id: string;
  tenantId: string;
  date: string;
  collectorId: string;
  collectorName: string;
  routeOrArea: string;
  totalMembersVisited: number;
  totalCollectionsCount: number;
  totalSavingsCollected: number;
  totalDpsCollected: number;
  totalLoanCollected: number;
  grandTotalAmount: number;
  cashHandoverAmount: number;
  cashShortageOrSurplus: number;
  handoverToCashierName: string;
  status: 'PENDING_HANDOVER' | 'ACCEPTED_BY_CASHIER' | 'RECONCILED';
  submittedAt: string;
  approvedAt?: string;
  cashierRemarks?: string;
}

export interface ThermalPrinterConfig {
  paperWidth: '58mm' | '80mm';
  characterSet: 'BANGLA_UNICODE' | 'GRAPHIC_BITMAP';
  showSamityLogo: boolean;
  showQrCode: boolean;
  headerFontScale: 'NORMAL' | 'LARGE';
  footerGreetingBn: string;
  autoCut: boolean;
  bluetoothDeviceName?: string;
}

// ----------------------------------------------------
// MODULE 3: PROJECT & JOINT INVESTMENT PORTFOLIO
// ----------------------------------------------------
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED';

export type ProjectCategory = 
  | 'AGRO'           // সমন্বিত কৃষি ও শস্য
  | 'FISHERIES'      // মৎস্য খামার ও পোনা উৎপাদন
  | 'LIVESTOCK'      // ডেইরি, গবাদিপশু ও পোল্ট্রি
  | 'REAL_ESTATE'    // আবাসন ও জমি ক্রয়-বিক্রয়
  | 'COMMERCIAL'     // পাইকারি ট্রেডিং ও ব্যবসা
  | 'TRANSPORT'      // পরিবহন ও লজিস্টিকস
  | 'OTHER';         // অন্যান্য সমবায় প্রকল্প

export interface SamityProject {
  id: string;
  tenantId: string;
  code: string; // e.g. PRJ-2026-01
  nameBn: string;
  nameEn: string;
  category: ProjectCategory;
  location: string;
  estimatedBudget: number;
  totalCapitalInvested: number;
  totalIncome: number;
  totalExpense: number;
  netProfitOrLoss: number;
  targetRoiPercent: number; // e.g. 20%
  actualRoiPercent: number;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  managerName: string;
  managerPhone: string;
  status: ProjectStatus;
  descriptionBn: string;
  totalShareUnits: number;
  unitPrice: number;
  distributedProfit: number;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberInvestment {
  id: string;
  tenantId: string;
  projectId: string;
  projectNameBn: string;
  memberId: string;
  memberCode: string;
  memberNameBn: string;
  memberPhone: string;
  unitsCount: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  investmentDate: string;
  certificateNo: string;
  profitEarned: number;
  status: 'ACTIVE' | 'REFUNDED' | 'SETTLED';
  notes?: string;
  voucherId?: string;
  createdAt: string;
}

export interface ProjectTransaction {
  id: string;
  tenantId: string;
  projectId: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  voucherNo: string;
  descriptionBn: string;
  receivedFromOrPaidTo: string;
  recordedBy: string;
  createdAt: string;
}

// ----------------------------------------------------
// MODULE 4: SHARE CAPITAL & DIVIDEND DISTRIBUTION ENGINE
// ----------------------------------------------------
export interface ShareCapitalConfig {
  tenantId: string;
  faceValue: number;               // প্রতি শেয়ারের মূল্যমান (e.g. ৳১,০০০)
  authorizedSharesCount: number;   // মোট অনুমোদিত শেয়ার সংখ্যা (e.g. ১০,০০০)
  minSharesPerMember: number;      // সর্বনিম্ন শেয়ার সীমা (e.g. ১)
  maxSharesPerMember: number;      // সর্বোচ্চ শেয়ার সীমা (e.g. ১,০০০)
  compulsoryReservePercent: number;// সংবিধিবদ্ধ সাধারণ সঞ্চিতি তহবিল % (e.g. 15%)
  developmentFundPercent: number;  // সমবায় উন্নয়ন তহবিল % (e.g. 3%)
}

export interface MemberShareRecord {
  id: string;
  tenantId: string;
  memberId: string;
  memberCode: string;
  memberNameBn: string;
  memberPhone: string;
  numberOfShares: number;
  faceValue: number;
  totalShareCapital: number;
  certificateNo: string;
  shareNumbersRange: string; // e.g. "0001 - 0050"
  issueDate: string;
  paymentMethod: PaymentMethod;
  status: 'ACTIVE' | 'TRANSFERRED' | 'SURRENDERED';
  voucherId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DividendDistributionBasis = 'SHARE_RATIO' | 'SAVINGS_RATIO' | 'HYBRID_50_50';
export type DividendSessionStatus = 'CALCULATED' | 'DISBURSED' | 'CANCELLED';

export interface DividendSession {
  id: string;
  tenantId: string;
  financialYear: string;           // e.g. '২০২৫-২০২৬'
  totalNetProfit: number;          // মোট ঘোষিত নিট মুনাফা (e.g. ৳৫,০০,০০০)
  reserveFundPercent: number;      // e.g. 15%
  reserveFundAmount: number;       // e.g. ৳৭৫,০০০
  developmentFundPercent: number;  // e.g. 3%
  developmentFundAmount: number;   // e.g. ৳১৫,০০০
  distributableProfit: number;     // বণ্টনযোগ্য নিট মুনাফা (e.g. ৳৪,১০,০০০)
  distributionBasis: DividendDistributionBasis;
  totalSharesEligible: number;
  totalSavingsEligible: number;
  dividendRatePerShare?: number;
  totalMembersBenefited: number;
  status: DividendSessionStatus;
  calculationDate: string;
  disbursedDate?: string;
  disbursedBy?: string;
  disbursementMethod: 'CREDIT_TO_SAVINGS' | 'CASH_VOUCHER';
  voucherId?: string;
  notes?: string;
  createdAt: string;
}

export interface MemberDividendItem {
  id: string;
  tenantId: string;
  sessionId: string;
  memberId: string;
  memberCode: string;
  memberNameBn: string;
  memberPhone: string;
  shareCount: number;
  shareCapital: number;
  savingsBalance: number;
  dividendFromShare: number;
  dividendFromSavings: number;
  grossDividend: number;
  taxOrDeduction: number;
  netDividendPayable: number;
  disbursementStatus: 'PENDING' | 'CREDITED_TO_SAVINGS' | 'PAID_CASH';
  savingsTransactionId?: string;
  voucherNo?: string;
  creditedAt?: string;
}

// ----------------------------------------------------
// MODULE 5: FIXED DEPOSIT (FDR) & DOUBLE GROWTH SCHEME
// ----------------------------------------------------
export type FDRProfitPayoutFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'AT_MATURITY';
export type FDRStatus = 'ACTIVE' | 'MATURED' | 'CLOSED_PREMATURE' | 'SETTLED';

export interface FDRTenureScheme {
  id: string;
  tenantId: string;
  nameBn: string;
  nameEn: string;
  tenureMonths: number;
  annualProfitRatePercent: number;
  profitPayoutFrequency: FDRProfitPayoutFrequency;
  isDoubleScheme: boolean;
  minDepositAmount: number;
  maxDepositAmount: number;
  prematureProfitRatePercent: number;
  status: 'ACTIVE' | 'INACTIVE';
  descriptionBn: string;
}

export interface FixedDepositAccount {
  id: string;
  tenantId: string;
  fdrNumber: string;
  certificateNo: string;
  memberId: string;
  memberCode: string;
  memberNameBn: string;
  memberPhone: string;
  nomineeNameBn: string;
  nomineeRelation: string;
  nomineeNidOrPhone: string;
  schemeId: string;
  schemeNameBn: string;
  tenureMonths: number;
  principalAmount: number;
  annualProfitRatePercent: number;
  profitPayoutFrequency: FDRProfitPayoutFrequency;
  isDoubleScheme: boolean;
  totalExpectedProfit: number;
  maturityAmount: number;
  openingDate: string;
  maturityDate: string;
  paymentMethod: PaymentMethod;
  autoRenewal: boolean;
  status: FDRStatus;
  totalProfitPaid: number;
  lastProfitPaymentDate?: string;
  nextProfitPaymentDate?: string;
  closedDate?: string;
  closedAmount?: number;
  voucherId?: string;
  voucherNo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FDRProfitPayment {
  id: string;
  tenantId: string;
  fdrId: string;
  fdrNumber: string;
  memberId: string;
  memberNameBn: string;
  paymentDate: string;
  periodLabel: string;
  profitAmount: number;
  taxOrFee: number;
  netPaidAmount: number;
  payoutDestination: 'CREDIT_SAVINGS' | 'CASH_PAYOUT';
  savingsTransactionId?: string;
  voucherNo: string;
  notes?: string;
  createdAt: string;
}

// ----------------------------------------------------
// MODULE 6: FIXED ASSET & INVENTORY STOCK REGISTER
// ----------------------------------------------------
export type FixedAssetCategory = 
  | 'LAND_BUILDING' 
  | 'FURNITURE_FIXTURE' 
  | 'COMPUTER_IT' 
  | 'OFFICE_APPLIANCES' 
  | 'VEHICLE' 
  | 'OTHER';

export type AssetDepreciationMethod = 'STRAIGHT_LINE' | 'REDUCING_BALANCE';
export type AssetStatus = 'ACTIVE' | 'UNDER_MAINTENANCE' | 'DISPOSED' | 'SCRAPPED';

export interface FixedAsset {
  id: string;
  tenantId: string;
  assetCode: string;
  nameBn: string;
  nameEn: string;
  category: FixedAssetCategory;
  purchaseDate: string;
  purchasePrice: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: AssetDepreciationMethod;
  annualDepreciationRatePercent: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  lastDepreciationDate?: string;
  location: string;
  custodianOfficer: string;
  serialNumber?: string;
  vendorOrSupplier?: string;
  warrantyExpiryDate?: string;
  status: AssetStatus;
  disposedDate?: string;
  disposalAmount?: number;
  disposalVoucherNo?: string;
  voucherNo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDepreciationLog {
  id: string;
  tenantId: string;
  assetId: string;
  assetCode: string;
  assetNameBn: string;
  nameBn?: string;
  financialYear: string;
  depreciationDate: string;
  openingBookValue: number;
  depreciationAmount: number;
  closingBookValue: number;
  voucherNo: string;
  calculatedBy: string;
  createdAt: string;
}

export type InventoryItemCategory = 
  | 'PASSBOOK' 
  | 'LOAN_FORM' 
  | 'VOUCHER_PAD' 
  | 'STATIONERY' 
  | 'IT_ACCESSORY';

export interface InventoryItem {
  id: string;
  tenantId: string;
  itemCode: string;
  nameBn: string;
  nameEn: string;
  category: InventoryItemCategory;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  totalStockValue: number;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InventoryMovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export interface InventoryMovement {
  id: string;
  tenantId: string;
  itemId: string;
  itemCode: string;
  itemNameBn: string;
  type: InventoryMovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
  recipientOrSource: string;
  referenceNo: string;
  purpose: string;
  performedBy: string;
  createdAt: string;
}

// ====================================================
// MODULE 7: STAFF PAYROLL, ATTENDANCE & HR MANAGEMENT
// ====================================================

export type StaffDesignation =
  | 'BRANCH_MANAGER'
  | 'ASSISTANT_MANAGER'
  | 'ACCOUNTANT'
  | 'CASHIER'
  | 'FIELD_SUPERVISOR'
  | 'LOAN_OFFICER'
  | 'FIELD_COLLECTOR'
  | 'OFFICE_ASSISTANT'
  | 'SECURITY_GUARD';

export type StaffDepartment =
  | 'ACCOUNTS_FINANCE'
  | 'FIELD_OPERATIONS'
  | 'ADMINISTRATION'
  | 'IT_SYSTEMS'
  | 'CUSTOMER_SERVICE';

export type StaffStatus = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';

export type SalaryPaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'BKASH' | 'NAGAD' | 'ROCKET';

export interface StaffEmployee {
  id: string;
  tenantId: string;
  employeeCode: string; // e.g. "EMP-2026-01"
  nameBn: string;
  nameEn: string;
  phone: string;
  email?: string;
  nid: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  designation: StaffDesignation;
  department: StaffDepartment;
  joiningDate: string; // YYYY-MM-DD
  status: StaffStatus;

  // Salary Structure (Monthly BDT)
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  mobileInternetAllowance: number;
  grossSalary: number;

  // Standard Monthly Deductions
  providentFundDeduction: number;
  taxDeduction: number;

  // Disbursement Details
  paymentMethod: SalaryPaymentMethod;
  bankName?: string;
  bankBranch?: string;
  bankAccountNo?: string;
  bankRoutingNo?: string;
  mfsNumber?: string; // bKash/Nagad personal or merchant

  // Profile Information
  presentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  bloodGroup?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus =
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'LEAVE_CASUAL'
  | 'LEAVE_SICK'
  | 'HALF_DAY'
  | 'HOLIDAY';

export interface StaffAttendance {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeNameBn: string;
  date: string; // YYYY-MM-DD
  inTime?: string; // HH:mm
  outTime?: string; // HH:mm
  status: AttendanceStatus;
  lateMinutes?: number;
  overtimeHours?: number;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
}

export type StaffAdvanceStatus = 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REPAID' | 'REJECTED';

export interface StaffAdvanceSalary {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeNameBn: string;
  advanceNo: string; // e.g. "ADV-2026-01"
  requestDate: string;
  amount: number;
  purpose: string;
  repaymentMonths: number;
  monthlyDeductionAmount: number;
  remainingBalance: number;
  status: StaffAdvanceStatus;
  approvedBy?: string;
  approvedAt?: string;
  disbursedDate?: string;
  disbursedVoucherNo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PayslipStatus = 'DRAFT' | 'UNPAID' | 'PAID' | 'CANCELLED';

export interface StaffPayslip {
  id: string;
  tenantId: string;
  payslipNo: string; // e.g. "PAY-202610-01"
  monthYear: string; // e.g. "2026-10"
  salaryMonthBn: string; // e.g. "অক্টোবর ২০২৬"
  employeeId: string;
  employeeCode: string;
  employeeNameBn: string;
  designation: StaffDesignation;
  department: StaffDepartment;
  paymentMethod: SalaryPaymentMethod;
  disbursementAccount?: string; // e.g. "১০১০: হাতে নগদ ক্যাশ" or bank name

  // Work Summary
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  overtimeHours: number;

  // Earnings Breakdown
  basicSalary: number;
  houseRent: number;
  medical: number;
  conveyance: number;
  mobileInternet: number;
  overtimePay: number;
  festivalBonus: number;
  performanceBonus: number;
  totalEarnings: number;

  // Deductions Breakdown
  providentFund: number;
  tax: number;
  advanceSalaryDeduction: number;
  unpaidLeaveDeduction: number;
  lateFineDeduction: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net Disbursable
  netPayable: number;

  // Status & Accounting Link
  paymentStatus: PayslipStatus;
  paymentDate?: string;
  voucherNo?: string; // Linked DEBIT voucher in general ledger
  disbursedBy?: string;
  disbursedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ====================================================
// MODULE 8: SMS / WHATSAPP GATEWAY & AUTOMATED NOTIFICATIONS
// ====================================================

export type NotificationTriggerEvent =
  | 'MANUAL_DISPATCH'
  | 'SAVINGS_DEPOSIT_CONFIRMATION'
  | 'SAVINGS_WITHDRAWAL_CONFIRMATION'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_INSTALLMENT_RECEIVED'
  | 'LOAN_OVERDUE_ALERT'
  | 'SUBSCRIPTION_FEE_REMINDER'
  | 'SUBSCRIPTION_PAYMENT_CONFIRMATION'
  | 'FDR_OPENING_CONFIRMATION'
  | 'FDR_PROFIT_DISBURSEMENT'
  | 'FDR_MATURITY_ALERT'
  | 'STAFF_SALARY_DISBURSEMENT'
  | 'AGM_MEETING_INVITATION'
  | 'ELECTION_VOTING_OPEN'
  | 'EMERGENCY_NOTICE';

export interface NotificationTemplate {
  id: string;
  tenantId: string;
  event: NotificationTriggerEvent;
  titleBn: string;
  titleEn: string;
  channel: 'ALL' | 'WHATSAPP' | 'SMS' | 'TELEGRAM';
  templateBn: string;
  templateEn: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SmsGatewayProvider =
  | 'GREENWEB_BD'
  | 'BULKSMS_BD'
  | 'ONNOROKOM_SMS'
  | 'ALPHANET_BD'
  | 'TEXTBEE_ANDROID_SIM'
  | 'CUSTOM_REST_API';

export interface SmsGatewaySettings {
  provider: SmsGatewayProvider;
  apiKey: string;
  apiSecret?: string;
  senderId: string; // Masking or Non-masking sender id
  apiUrl?: string;
  balanceCount: number;
  lowBalanceThreshold: number;
  isActive: boolean;
}

export interface WhatsAppGatewaySettings {
  mode: 'WA_ME_DIRECT' | 'OPEN_WA_SERVER' | 'META_CLOUD_API';
  serverUrl?: string;
  apiKey?: string;
  metaPhoneNumberId?: string;
  metaAccessToken?: string;
  metaWabaId?: string;
  connectedPhone?: string;
  isConnected: boolean;
  autoSendReceiptPdf: boolean;
}

export interface TelegramGatewaySettings {
  botToken: string;
  chatIdOrChannel: string;
  isActive: boolean;
}

export interface AutomatedSchedulerRule {
  id: string;
  tenantId: string;
  nameBn: string;
  triggerEvent: NotificationTriggerEvent;
  channel: ReminderChannel;
  preferredTime: string; // e.g. "09:00"
  daysBeforeDue: number; // e.g. 2 days before due date
  includeLateFineWarning: boolean;
  isEnabled: boolean;
}

export interface NotificationLog {
  id: string;
  tenantId: string;
  recipientMemberId?: string;
  recipientEmployeeId?: string;
  recipientName: string;
  recipientPhone: string;
  channel: ReminderChannel;
  event: NotificationTriggerEvent;
  messageText: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING' | 'FAILED';
  gatewayResponse?: string;
  referenceId?: string; // Receipt No or Voucher No
  sentAt: string;
  sentBy: string;
}
