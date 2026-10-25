export type Language = 'bn' | 'en';

export type TenantType = 
  | 'SAMITY'          // সমবায় সমিতি
  | 'CLUB'            // ক্লাব ও ক্রীড়া সংগঠন
  | 'ASSOCIATION'     // পেশাজীবী ও ব্যবসায়ী সমিতি
  | 'SAVINGS_GROUP'   // ক্ষুদ্র ঋণ ও সঞ্চয় দল
  | 'COMMITTEE'       // মসজিদ/মাদ্রাসা/মন্দির/স্কুল পরিচালনা কমিটি
  | 'CHARITY';        // দাতব্য ও কল্যাণ সংস্থা

export type SubscriptionPlan = 'STARTER' | 'STANDARD' | 'ENTERPRISE' | 'FREE_TRIAL';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';

export interface Tenant {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  type: TenantType;
  registrationNo: string;
  establishedYear: number;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
  bannerUrl?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  validUntil: string;
  smsBalance: number;
  currency: string;
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
  createdAt: string;
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

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'RETIRED';
export type MemberCategory = 'GENERAL' | 'EXECUTIVE' | 'ADVISORY' | 'LIFE' | 'DONOR';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Nominee {
  name: string;
  relation: string;
  nidOrBirthCert: string;
  phone: string;
  sharePercentage: number;
}

export interface Member {
  id: string;
  tenantId: string;
  memberCode: string; // e.g. "MEM-001"
  nameBn: string;
  nameEn: string;
  fatherHusbandName: string;
  motherName: string;
  phone: string;
  email?: string;
  nid: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: string;
  presentAddress: string;
  permanentAddress: string;
  occupation: string;
  category: MemberCategory;
  status: MemberStatus;
  admissionDate: string;
  admissionFee: number;
  sharesHeld: number;
  shareValue: number;
  savingsBalance: number;
  dpsBalance: number;
  loanOutstanding: number;
  photoUrl?: string;
  nidDocumentUrl?: string;
  nominee: Nominee;
  createdAt: string;
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
  targetAmount?: number;
  monthlyInstallment?: number;
  tenureMonths?: number;
  interestRate: number;
  startDate: string;
  maturityDate?: string;
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
}

export interface SavingsTransaction {
  id: string;
  tenantId: string;
  accountId: string;
  memberId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'PENALTY';
  amount: number;
  balanceAfter: number;
  paymentMethod: 'CASH' | 'BKASH' | 'NAGAD' | 'BANK';
  referenceNo?: string;
  collectorId: string;
  notes?: string;
  date: string;
  receiptNo: string;
}

export type LoanStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'REJECTED';

export interface LoanInstallment {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalDue: number;
  paidAmount: number;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
}

export interface Loan {
  id: string;
  tenantId: string;
  memberId: string;
  loanNumber: string;
  loanScheme: string;
  principalAmount: number;
  interestRatePercent: number; // e.g., 10%
  durationMonths: number;
  totalPayable: number;
  totalPaid: number;
  outstandingBalance: number;
  installmentFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  guarantor1MemberId?: string;
  guarantor2MemberId?: string;
  guarantorNotes?: string;
  disbursementDate?: string;
  purpose: string;
  status: LoanStatus;
  installments: LoanInstallment[];
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
  paymentMethod: 'CASH' | 'BKASH' | 'NAGAD' | 'BANK';
  receiptNo: string;
  collectorId: string;
  date: string;
  notes?: string;
}

export type VoucherType = 'DEBIT' | 'CREDIT' | 'JOURNAL';

export interface Voucher {
  id: string;
  tenantId: string;
  voucherNo: string;
  type: VoucherType;
  category: string; // e.g. "Office Rent", "Member Savings Deposit", "Loan Disbursement", "Event Expense"
  amount: number;
  descriptionBn: string;
  descriptionEn: string;
  paidToOrReceivedFrom: string;
  paymentMethod: 'CASH' | 'BANK' | 'BKASH' | 'NAGAD';
  date: string;
  createdBy: string;
  approvedBy?: string;
  attachmentUrl?: string;
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
    | 'LOAN_APPROVED'
    | 'VOTE_CAST'
    | 'SYSTEM_ANNOUNCEMENT';
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
