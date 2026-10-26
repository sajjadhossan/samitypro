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
    enableLoans: boolean;
    enableElections: boolean;
    enableSmsAlerts: boolean;
    enableOnlinePayment: boolean;
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

export type PaymentMethod = 'CASH' | 'BANK' | 'BKASH' | 'NAGAD';

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

export interface Meeting {
  id: string;
  tenantId: string;
  titleBn: string;
  titleEn: string;
  type: 'AGM' | 'EGM' | 'MONTHLY' | 'EMERGENCY' | 'COMMITTEE';
  date: string;
  time: string;
  venue: string;
  agenda: string[];
  resolutions: string[];
  totalAttendees: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  minutesDocumentUrl?: string;
}

export interface ElectionCandidate {
  id: string;
  memberId: string;
  nameBn: string;
  nameEn: string;
  post: 'PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'ORGANIZING_SECRETARY' | 'MEMBER_EXECUTIVE';
  symbolName: string;
  symbolEmoji: string;
  voteCount: number;
}

export interface Election {
  id: string;
  tenantId: string;
  titleBn: string;
  titleEn: string;
  termYears: string; // e.g. "2026-2028"
  electionDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  totalEligibleVoters: number;
  totalVotesCast: number;
  candidates: ElectionCandidate[];
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

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'IMPORT' | 'RESTORE' | 'LOGIN';
export type AuditEntity = 'MEMBER' | 'DEPOSIT' | 'LOAN' | 'EXPENSE' | 'RECEIPT' | 'SETTING' | 'SETTINGS' | 'DOCUMENT' | 'BACKUP' | 'TENANT' | 'SUBSCRIPTION' | 'SAVINGS_ACCOUNT';

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

export type ApprovalType = 'BANK_DEPOSIT' | 'LOAN_APPLICATION' | 'EXPENSE_VOUCHER';
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
  details?: Record<string, any>;
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
  payload: any;
  createdAt: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  errorMessage?: string;
}

