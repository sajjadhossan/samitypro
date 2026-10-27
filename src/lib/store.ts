'use client';

import { useState, useEffect } from 'react';
import { 
  Tenant, User, Member, MemberStatus, SavingsAccount, SavingsTransaction, 
  Loan, Voucher, Meeting, MeetingType, MeetingAgendaItem, MeetingResolution, MeetingAttendee,
  Election, ElectionStatus, ElectionPost, ElectionPostConfig, ElectionCandidate, ElectionVoter, ElectionCommission, CandidateStatus,
  RealtimeEvent, Language,
  MonthlySubscription, BankDeposit, PaidReceipt, Notice, SamityDocument, LetterheadConfig, DueReminder,
  SignatureSealConfig, VoucherPrefixConfig, BulkDepositItem,
  AuditLog, ApprovalItem, GeneratedDocument, ApprovalStatus,
  CommunicationGatewayConfig, AutoSchedulerConfig, OfflineQueueItem, ReminderChannel,
  SubscriptionPolicyConfig, LateFeeWaiverRecord, FeePaymentStatus,
  SavingsPolicyConfig, SavingsType, PaymentMethod, VoucherType,
  LoanPolicyConfig, LoanInterestMethod, LoanFrequency, LoanGuarantor, LoanInstallment,
  AccountHead, GeneralLedgerEntry, TrialBalanceItem,
  PaymentGatewayProvider, PaymentPurpose, OnlinePaymentTransaction, PaymentGatewayConfig,
  FieldCollectorDailyCollection, FieldDayEndSummary, ThermalPrinterConfig,
  SamityProject, ProjectMemberInvestment, ProjectTransaction,
  ShareCapitalConfig, MemberShareRecord, DividendSession, MemberDividendItem,
  DividendDistributionBasis, DividendSessionStatus,
  FDRTenureScheme, FixedDepositAccount, FDRProfitPayment, FDRProfitPayoutFrequency, FDRStatus,
  FixedAssetCategory, AssetDepreciationMethod, AssetStatus, FixedAsset, AssetDepreciationLog,
  InventoryItemCategory, InventoryItem, InventoryMovementType, InventoryMovement,
  StaffDesignation, StaffDepartment, StaffStatus, SalaryPaymentMethod, StaffEmployee,
  AttendanceStatus, StaffAttendance, StaffAdvanceStatus, StaffAdvanceSalary,
  PayslipStatus, StaffPayslip, NotificationTriggerEvent, NotificationTemplate,
  SmsGatewayProvider, SmsGatewaySettings, WhatsAppGatewaySettings, TelegramGatewaySettings,
  AutomatedSchedulerRule, NotificationLog,
  APP_VERSION
} from '@/types';
import { 
  INITIAL_TENANTS, INITIAL_USERS, INITIAL_MEMBERS, 
  INITIAL_SAVINGS_ACCOUNTS, INITIAL_SAVINGS_TRANSACTIONS, 
  INITIAL_LOANS, INITIAL_VOUCHERS, INITIAL_MEETINGS, 
  INITIAL_ELECTIONS, INITIAL_EVENTS,
  INITIAL_SUBSCRIPTIONS, INITIAL_BANK_DEPOSITS, INITIAL_PAID_RECEIPTS,
  INITIAL_NOTICES, INITIAL_DOCUMENTS, INITIAL_LETTERHEAD_CONFIG, INITIAL_REMINDERS,
  INITIAL_SIGNATURE_SEAL_CONFIG, INITIAL_VOUCHER_PREFIX_CONFIG,
  INITIAL_AUDIT_LOGS, INITIAL_APPROVAL_ITEMS, INITIAL_GENERATED_DOCUMENTS,
  INITIAL_GATEWAY_CONFIG, INITIAL_SCHEDULER_CONFIG, INITIAL_OFFLINE_QUEUE,
  INITIAL_SUBSCRIPTION_POLICY, INITIAL_LATE_FEE_WAIVERS, INITIAL_SAVINGS_POLICY,
  INITIAL_LOAN_POLICY, INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_PAYMENT_GATEWAY_CONFIG, INITIAL_ONLINE_PAYMENTS,
  INITIAL_FIELD_COLLECTIONS, INITIAL_FIELD_DAY_ENDS, INITIAL_THERMAL_PRINTER_CONFIG,
  INITIAL_PROJECTS, INITIAL_PROJECT_INVESTMENTS, INITIAL_PROJECT_TRANSACTIONS,
  INITIAL_SHARE_CONFIG, INITIAL_MEMBER_SHARES, INITIAL_DIVIDEND_SESSIONS, INITIAL_DIVIDEND_ITEMS,
  INITIAL_FDR_SCHEMES, INITIAL_FDR_ACCOUNTS, INITIAL_FDR_PROFIT_PAYMENTS,
  INITIAL_FIXED_ASSETS, INITIAL_ASSET_DEPRECIATIONS, INITIAL_INVENTORY_ITEMS, INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_STAFF_EMPLOYEES, INITIAL_STAFF_ATTENDANCE, INITIAL_STAFF_ADVANCES, INITIAL_STAFF_PAYSLIPS,
  INITIAL_NOTIFICATION_TEMPLATES, INITIAL_SMS_GATEWAY_SETTINGS, INITIAL_WHATSAPP_GATEWAY_SETTINGS,
  INITIAL_NOTIFICATION_LOGS
} from './db';

const STORAGE_KEYS = {
  TENANTS: 'samitypro_tenants',
  USERS: 'samitypro_users',
  MEMBERS: 'samitypro_members',
  SAVINGS_ACCOUNTS: 'samitypro_savings_accs',
  SAVINGS_TX: 'samitypro_savings_tx',
  SAVINGS_POLICIES: 'samitypro_savings_policies',
  LOANS: 'samitypro_loans',
  VOUCHERS: 'samitypro_vouchers',
  MEETINGS: 'samitypro_meetings',
  ELECTIONS: 'samitypro_elections',
  EVENTS: 'samitypro_events',
  SUBSCRIPTIONS: 'samitypro_subscriptions',
  BANK_DEPOSITS: 'samitypro_bank_deposits',
  RECEIPTS: 'samitypro_receipts',
  NOTICES: 'samitypro_notices',
  DOCUMENTS: 'samitypro_documents',
  LETTERHEAD: 'samitypro_letterhead',
  REMINDERS: 'samitypro_reminders',
  SIGNATURE_SEAL: 'samitypro_sig_seal',
  VOUCHER_PREFIX: 'samitypro_voucher_prefix',
  AUDIT_LOGS: 'samitypro_audit_logs',
  APPROVALS: 'samitypro_approvals',
  GENERATED_DOCS: 'samitypro_gen_docs',
  GATEWAY_CONFIG: 'samitypro_gateway_cfg',
  SCHEDULER_CONFIG: 'samitypro_sched_cfg',
  OFFLINE_QUEUE: 'samitypro_offline_queue',
  SUBSCRIPTION_POLICIES: 'samitypro_sub_policies',
  LATE_FEE_WAIVERS: 'samitypro_late_waivers',
  LOAN_POLICIES: 'samitypro_loan_policies',
  CHART_OF_ACCOUNTS: 'samitypro_chart_of_accounts',
  PAYMENT_GATEWAY_CONFIG: 'samitypro_pg_config',
  ONLINE_PAYMENTS: 'samitypro_online_payments',
  FIELD_COLLECTIONS: 'samitypro_field_collections',
  FIELD_DAY_ENDS: 'samitypro_field_day_ends',
  THERMAL_CONFIG: 'samitypro_thermal_cfg',
  PROJECTS: 'samitypro_projects',
  PROJECT_INVESTMENTS: 'samitypro_project_investments',
  PROJECT_TRANSACTIONS: 'samitypro_project_transactions',
  SHARE_CONFIG: 'samitypro_share_config',
  MEMBER_SHARES: 'samitypro_member_shares',
  DIVIDEND_SESSIONS: 'samitypro_dividend_sessions',
  DIVIDEND_ITEMS: 'samitypro_dividend_items',
  FDR_SCHEMES: 'samitypro_fdr_schemes',
  FDR_ACCOUNTS: 'samitypro_fdr_accounts',
  FDR_PAYMENTS: 'samitypro_fdr_payments',
  FIXED_ASSETS: 'samitypro_fixed_assets',
  ASSET_DEPRECIATIONS: 'samitypro_asset_depreciations',
  INVENTORY_ITEMS: 'samitypro_inventory_items',
  INVENTORY_MOVEMENTS: 'samitypro_inventory_movements',
  STAFF_EMPLOYEES: 'samitypro_staff_employees',
  STAFF_ATTENDANCE: 'samitypro_staff_attendance',
  STAFF_ADVANCES: 'samitypro_staff_advances',
  STAFF_PAYSLIPS: 'samitypro_staff_payslips',
  NOTIFICATION_TEMPLATES: 'samitypro_notif_templates',
  SMS_GATEWAY_SETTINGS: 'samitypro_sms_gw_settings',
  WHATSAPP_GATEWAY_SETTINGS: 'samitypro_wa_gw_settings',
  NOTIFICATION_LOGS: 'samitypro_notif_logs',
  CURRENT_TENANT_ID: 'samitypro_active_tenant',
  CURRENT_USER_ID: 'samitypro_active_user',
  LANGUAGE: 'samitypro_language'
};

// Listeners for real-time reactive state updates
type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach(l => l());
  // Broadcast to other browser tabs or webviews
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('samitypro_realtime');
      channel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
      channel.close();
    } catch {}
  }
}

type StoreCollectionKey =
  | 'tenants' | 'members' | 'savingsAccounts' | 'savingsTransactions'
  | 'savingsPolicies' | 'loans' | 'loanPolicies' | 'vouchers'
  | 'chartOfAccounts' | 'meetings' | 'elections' | 'events'
  | 'subscriptions' | 'bankDeposits' | 'receipts' | 'notices'
  | 'documents' | 'letterhead' | 'reminders' | 'signatureSeal'
  | 'voucherPrefix' | 'auditLogs' | 'approvalItems' | 'generatedDocs'
  | 'gatewayConfig' | 'schedulerConfig' | 'offlineQueue'
  | 'subscriptionPolicies' | 'lateFeeWaivers'
  | 'paymentGatewayConfig' | 'onlinePayments'
  | 'fieldCollections' | 'fieldDayEnds' | 'thermalPrinterConfig'
  | 'projects' | 'projectInvestments' | 'projectTransactions'
  | 'shareConfig' | 'memberShares' | 'dividendSessions' | 'dividendItems'
  | 'fdrSchemes' | 'fdrAccounts' | 'fdrProfitPayments'
  | 'fixedAssets' | 'assetDepreciations' | 'inventoryItems' | 'inventoryMovements'
  | 'staffEmployees' | 'staffAttendances' | 'staffAdvanceSalaries' | 'staffPayslips'
  | 'notificationTemplates' | 'smsGatewaySettings' | 'whatsAppGatewaySettings' | 'notificationLogs';

const STORE_STORAGE_MAPPINGS: [string, StoreCollectionKey][] = [
  [STORAGE_KEYS.TENANTS, 'tenants'],
  [STORAGE_KEYS.MEMBERS, 'members'],
  [STORAGE_KEYS.SAVINGS_ACCOUNTS, 'savingsAccounts'],
  [STORAGE_KEYS.SAVINGS_TX, 'savingsTransactions'],
  [STORAGE_KEYS.SAVINGS_POLICIES, 'savingsPolicies'],
  [STORAGE_KEYS.LOANS, 'loans'],
  [STORAGE_KEYS.LOAN_POLICIES, 'loanPolicies'],
  [STORAGE_KEYS.VOUCHERS, 'vouchers'],
  [STORAGE_KEYS.CHART_OF_ACCOUNTS, 'chartOfAccounts'],
  [STORAGE_KEYS.MEETINGS, 'meetings'],
  [STORAGE_KEYS.ELECTIONS, 'elections'],
  [STORAGE_KEYS.EVENTS, 'events'],
  [STORAGE_KEYS.SUBSCRIPTIONS, 'subscriptions'],
  [STORAGE_KEYS.BANK_DEPOSITS, 'bankDeposits'],
  [STORAGE_KEYS.RECEIPTS, 'receipts'],
  [STORAGE_KEYS.NOTICES, 'notices'],
  [STORAGE_KEYS.DOCUMENTS, 'documents'],
  [STORAGE_KEYS.LETTERHEAD, 'letterhead'],
  [STORAGE_KEYS.REMINDERS, 'reminders'],
  [STORAGE_KEYS.SIGNATURE_SEAL, 'signatureSeal'],
  [STORAGE_KEYS.VOUCHER_PREFIX, 'voucherPrefix'],
  [STORAGE_KEYS.AUDIT_LOGS, 'auditLogs'],
  [STORAGE_KEYS.APPROVALS, 'approvalItems'],
  [STORAGE_KEYS.GENERATED_DOCS, 'generatedDocs'],
  [STORAGE_KEYS.GATEWAY_CONFIG, 'gatewayConfig'],
  [STORAGE_KEYS.SCHEDULER_CONFIG, 'schedulerConfig'],
  [STORAGE_KEYS.OFFLINE_QUEUE, 'offlineQueue'],
  [STORAGE_KEYS.SUBSCRIPTION_POLICIES, 'subscriptionPolicies'],
  [STORAGE_KEYS.LATE_FEE_WAIVERS, 'lateFeeWaivers'],
  [STORAGE_KEYS.PAYMENT_GATEWAY_CONFIG, 'paymentGatewayConfig'],
  [STORAGE_KEYS.ONLINE_PAYMENTS, 'onlinePayments'],
  [STORAGE_KEYS.FIELD_COLLECTIONS, 'fieldCollections'],
  [STORAGE_KEYS.FIELD_DAY_ENDS, 'fieldDayEnds'],
  [STORAGE_KEYS.THERMAL_CONFIG, 'thermalPrinterConfig'],
  [STORAGE_KEYS.PROJECTS, 'projects'],
  [STORAGE_KEYS.PROJECT_INVESTMENTS, 'projectInvestments'],
  [STORAGE_KEYS.PROJECT_TRANSACTIONS, 'projectTransactions'],
  [STORAGE_KEYS.SHARE_CONFIG, 'shareConfig'],
  [STORAGE_KEYS.MEMBER_SHARES, 'memberShares'],
  [STORAGE_KEYS.DIVIDEND_SESSIONS, 'dividendSessions'],
  [STORAGE_KEYS.DIVIDEND_ITEMS, 'dividendItems'],
  [STORAGE_KEYS.FDR_SCHEMES, 'fdrSchemes'],
  [STORAGE_KEYS.FDR_ACCOUNTS, 'fdrAccounts'],
  [STORAGE_KEYS.FDR_PAYMENTS, 'fdrProfitPayments'],
  [STORAGE_KEYS.FIXED_ASSETS, 'fixedAssets'],
  [STORAGE_KEYS.ASSET_DEPRECIATIONS, 'assetDepreciations'],
  [STORAGE_KEYS.INVENTORY_ITEMS, 'inventoryItems'],
  [STORAGE_KEYS.INVENTORY_MOVEMENTS, 'inventoryMovements'],
  [STORAGE_KEYS.STAFF_EMPLOYEES, 'staffEmployees'],
  [STORAGE_KEYS.STAFF_ATTENDANCE, 'staffAttendances'],
  [STORAGE_KEYS.STAFF_ADVANCES, 'staffAdvanceSalaries'],
  [STORAGE_KEYS.STAFF_PAYSLIPS, 'staffPayslips'],
  [STORAGE_KEYS.NOTIFICATION_TEMPLATES, 'notificationTemplates'],
  [STORAGE_KEYS.SMS_GATEWAY_SETTINGS, 'smsGatewaySettings'],
  [STORAGE_KEYS.WHATSAPP_GATEWAY_SETTINGS, 'whatsAppGatewaySettings'],
  [STORAGE_KEYS.NOTIFICATION_LOGS, 'notificationLogs'],
];

// In-memory fallback / cache
class DataStore {
  tenants: Tenant[] = INITIAL_TENANTS;
  users: User[] = INITIAL_USERS;
  members: Member[] = INITIAL_MEMBERS;
  savingsAccounts: SavingsAccount[] = INITIAL_SAVINGS_ACCOUNTS;
  savingsTransactions: SavingsTransaction[] = INITIAL_SAVINGS_TRANSACTIONS;
  loans: Loan[] = INITIAL_LOANS;
  vouchers: Voucher[] = INITIAL_VOUCHERS;
  chartOfAccounts: AccountHead[] = INITIAL_CHART_OF_ACCOUNTS;
  meetings: Meeting[] = INITIAL_MEETINGS;
  elections: Election[] = INITIAL_ELECTIONS;
  events: RealtimeEvent[] = INITIAL_EVENTS;
  subscriptions: MonthlySubscription[] = INITIAL_SUBSCRIPTIONS;
  bankDeposits: BankDeposit[] = INITIAL_BANK_DEPOSITS;
  receipts: PaidReceipt[] = INITIAL_PAID_RECEIPTS;
  notices: Notice[] = INITIAL_NOTICES;
  documents: SamityDocument[] = INITIAL_DOCUMENTS;
  letterhead: LetterheadConfig = INITIAL_LETTERHEAD_CONFIG;
  reminders: DueReminder[] = INITIAL_REMINDERS;
  signatureSeal: SignatureSealConfig = INITIAL_SIGNATURE_SEAL_CONFIG;
  voucherPrefix: VoucherPrefixConfig = INITIAL_VOUCHER_PREFIX_CONFIG;
  auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;
  approvalItems: ApprovalItem[] = INITIAL_APPROVAL_ITEMS;
  generatedDocs: GeneratedDocument[] = INITIAL_GENERATED_DOCUMENTS;
  gatewayConfig: CommunicationGatewayConfig = INITIAL_GATEWAY_CONFIG;
  schedulerConfig: AutoSchedulerConfig = INITIAL_SCHEDULER_CONFIG;
  offlineQueue: OfflineQueueItem[] = INITIAL_OFFLINE_QUEUE;
  subscriptionPolicies: Record<string, SubscriptionPolicyConfig> = { 'samity-ekota': INITIAL_SUBSCRIPTION_POLICY };
  lateFeeWaivers: LateFeeWaiverRecord[] = INITIAL_LATE_FEE_WAIVERS;
  savingsPolicies: Record<string, SavingsPolicyConfig> = { 'samity-ekota': INITIAL_SAVINGS_POLICY };
  loanPolicies: Record<string, LoanPolicyConfig> = { 'samity-ekota': INITIAL_LOAN_POLICY };
  paymentGatewayConfig: PaymentGatewayConfig = INITIAL_PAYMENT_GATEWAY_CONFIG;
  onlinePayments: OnlinePaymentTransaction[] = INITIAL_ONLINE_PAYMENTS;
  fieldCollections: FieldCollectorDailyCollection[] = INITIAL_FIELD_COLLECTIONS;
  fieldDayEnds: FieldDayEndSummary[] = INITIAL_FIELD_DAY_ENDS;
  thermalPrinterConfig: ThermalPrinterConfig = INITIAL_THERMAL_PRINTER_CONFIG;
  projects: SamityProject[] = INITIAL_PROJECTS;
  projectInvestments: ProjectMemberInvestment[] = INITIAL_PROJECT_INVESTMENTS;
  projectTransactions: ProjectTransaction[] = INITIAL_PROJECT_TRANSACTIONS;
  shareConfig: ShareCapitalConfig = INITIAL_SHARE_CONFIG;
  memberShares: MemberShareRecord[] = INITIAL_MEMBER_SHARES;
  dividendSessions: DividendSession[] = INITIAL_DIVIDEND_SESSIONS;
  dividendItems: MemberDividendItem[] = INITIAL_DIVIDEND_ITEMS;
  fdrSchemes: FDRTenureScheme[] = INITIAL_FDR_SCHEMES;
  fdrAccounts: FixedDepositAccount[] = INITIAL_FDR_ACCOUNTS;
  fdrProfitPayments: FDRProfitPayment[] = INITIAL_FDR_PROFIT_PAYMENTS;
  fixedAssets: FixedAsset[] = INITIAL_FIXED_ASSETS;
  assetDepreciations: AssetDepreciationLog[] = INITIAL_ASSET_DEPRECIATIONS;
  inventoryItems: InventoryItem[] = INITIAL_INVENTORY_ITEMS;
  inventoryMovements: InventoryMovement[] = INITIAL_INVENTORY_MOVEMENTS;

  // Module 7: Staff, Payroll & HR Management
  staffEmployees: StaffEmployee[] = INITIAL_STAFF_EMPLOYEES;
  staffAttendances: StaffAttendance[] = INITIAL_STAFF_ATTENDANCE;
  staffAdvanceSalaries: StaffAdvanceSalary[] = INITIAL_STAFF_ADVANCES;
  staffPayslips: StaffPayslip[] = INITIAL_STAFF_PAYSLIPS;

  // Module 8: SMS / WhatsApp Gateway & Automated Notifications
  notificationTemplates: NotificationTemplate[] = INITIAL_NOTIFICATION_TEMPLATES;
  smsGatewaySettings: SmsGatewaySettings = INITIAL_SMS_GATEWAY_SETTINGS;
  whatsAppGatewaySettings: WhatsAppGatewaySettings = INITIAL_WHATSAPP_GATEWAY_SETTINGS;
  notificationLogs: NotificationLog[] = INITIAL_NOTIFICATION_LOGS;

  currentTenantId: string = 'samity-ekota';
  currentUserId: string = 'user-rafiq';
  language: Language = 'bn';
  initialized = false;

  private syncCollectionWithStorage(key: string, prop: StoreCollectionKey) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        (this as unknown as Record<StoreCollectionKey, unknown>)[prop] = JSON.parse(stored);
      } else {
        localStorage.setItem(key, JSON.stringify(this[prop]));
      }
    } catch {}
  }

  private loadCollectionFromStorage(key: string, prop: StoreCollectionKey) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        (this as unknown as Record<StoreCollectionKey, unknown>)[prop] = JSON.parse(stored);
      }
    } catch {}
  }

  init() {
    if (typeof window === 'undefined' || this.initialized) return;
    try {
      for (const [key, prop] of STORE_STORAGE_MAPPINGS) {
        this.syncCollectionWithStorage(key, prop);
      }

      const savedTenantId = localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT_ID);
      if (savedTenantId) this.currentTenantId = savedTenantId;

      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (savedUserId) this.currentUserId = savedUserId;

      const savedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
      if (savedLang) this.language = savedLang;

      // Broadcast channel receiver
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('samitypro_realtime');
        channel.onmessage = () => {
          this.refreshFromStorage();
        };
      }
    } catch {}
    this.initialized = true;
  }

  refreshFromStorage() {
    try {
      for (const [key, prop] of STORE_STORAGE_MAPPINGS) {
        this.loadCollectionFromStorage(key, prop);
      }
      emitChange();
    } catch {}
  }

  save() {
    if (typeof window === 'undefined') return;
    try {
      for (const [key, prop] of STORE_STORAGE_MAPPINGS) {
        localStorage.setItem(key, JSON.stringify(this[prop]));
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT_ID, this.currentTenantId);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, this.language);
    } catch {}
    emitChange();
  }


  setLanguage(lang: Language) {
    this.language = lang;
    this.save();
  }

  setCurrentTenant(tenantId: string) {
    this.currentTenantId = tenantId;
    this.save();
  }

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
    const user = this.users.find(u => u.id === userId);
    if (user?.tenantId) {
      this.currentTenantId = user.tenantId;
    }
    this.save();
  }

  addMember(memberData: Omit<Member, 'id' | 'createdAt' | 'savingsBalance' | 'dpsBalance' | 'loanOutstanding'> & { sharesHeld?: number; shareValue?: number }) {
    const newId = `mem-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const newMember: Member = {
      ...memberData,
      id: newId,
      sharesHeld: memberData.sharesHeld ?? 10,
      shareValue: memberData.shareValue ?? 10000,
      savingsBalance: 0,
      dpsBalance: 0,
      loanOutstanding: 0,
      createdBy: this.currentUserId,
      createdAt: nowIso.split('T')[0],
      syncVersion: 1,
      isSynced: true
    };
    this.members.unshift(newMember);

    // Add voucher for admission fee
    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: memberData.tenantId,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: 'CREDIT',
      category: 'সদস্য ভর্তি ফি ও শেয়ার ফি',
      amount: (memberData.admissionFee || 1000) + (newMember.shareValue || 10000),
      descriptionBn: `নতুন সদস্য ${memberData.nameBn} (${memberData.memberCode}) এর ভর্তি ফি ও শেয়ার আদায়`,
      descriptionEn: `Admission fee & share payment for new member ${memberData.nameEn}`,
      paidToOrReceivedFrom: memberData.nameBn,
      paymentMethod: 'CASH',
      date: nowIso.split('T')[0],
      createdBy: this.currentUserId
    };
    this.vouchers.unshift(voucher);

    this.addEvent({
      tenantId: memberData.tenantId,
      type: 'NEW_MEMBER_JOINED',
      titleBn: 'নতুন সদস্য যুক্ত হয়েছেন',
      titleEn: 'New Member Registered',
      messageBn: `${memberData.nameBn} (${memberData.memberCode}) সফলভাবে অন্তর্ভুক্ত হয়েছেন।`,
      messageEn: `${memberData.nameEn} (${memberData.memberCode}) has joined successfully.`,
      memberId: newId,
      memberName: memberData.nameBn
    });

    this.addAuditLog({
      tenantId: memberData.tenantId,
      action: 'CREATE',
      entity: 'MEMBER',
      entityId: newId,
      descriptionBn: `নতুন সদস্য নিবন্ধন: ${memberData.nameBn} (${memberData.memberCode}), মোবাইল: ${memberData.phone}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return newMember;
  }

  updateMember(memberId: string, updates: Partial<Member>) {
    const memberIndex = this.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return null;

    const existing = this.members[memberIndex];
    const updated: Member = {
      ...existing,
      ...updates,
      updatedBy: this.currentUserId,
      updatedAt: new Date().toISOString(),
      syncVersion: (existing.syncVersion || 1) + 1
    };
    this.members[memberIndex] = updated;

    this.addAuditLog({
      tenantId: updated.tenantId,
      action: 'UPDATE',
      entity: 'MEMBER',
      entityId: memberId,
      descriptionBn: `সদস্য প্রোফাইল হালনাগাদ: ${updated.nameBn} (${updated.memberCode})`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return updated;
  }

  softDeleteMember(memberId: string, reason?: string) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return false;

    member.deletedAt = new Date().toISOString();
    member.deletedBy = this.currentUserId;
    member.status = 'INACTIVE';

    this.addAuditLog({
      tenantId: member.tenantId,
      action: 'DELETE',
      entity: 'MEMBER',
      entityId: memberId,
      descriptionBn: `সদস্য সফট ডিলিট/স্থগিত: ${member.nameBn} (${member.memberCode}). কারণ: ${reason || 'প্রশাসনিক সিদ্ধান্ত'}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return true;
  }

  toggleMemberStatus(memberId: string, status: MemberStatus) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return null;

    const oldStatus = member.status;
    member.status = status;
    member.updatedAt = new Date().toISOString();
    member.updatedBy = this.currentUserId;

    this.addAuditLog({
      tenantId: member.tenantId,
      action: 'UPDATE',
      entity: 'MEMBER',
      entityId: memberId,
      descriptionBn: `সদস্যের স্ট্যাটাস পরিবর্তন: ${member.nameBn} (${oldStatus} -> ${status})`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return member;
  }

  bulkImportMembers(tenantId: string, newMembers: Omit<Member, 'id' | 'createdAt'>[]) {
    const imported: Member[] = [];
    const nowIso = new Date().toISOString();

    newMembers.forEach((data, index) => {
      const newId = `mem-${Date.now().toString().slice(-4)}-${index}`;
      const m: Member = {
        ...data,
        id: newId,
        tenantId,
        sharesHeld: data.sharesHeld || 10,
        shareValue: data.shareValue || 10000,
        savingsBalance: data.savingsBalance || 0,
        dpsBalance: data.dpsBalance || 0,
        loanOutstanding: data.loanOutstanding || 0,
        createdBy: this.currentUserId,
        createdAt: nowIso.split('T')[0],
        syncVersion: 1,
        isSynced: true
      };
      this.members.unshift(m);
      imported.push(m);
    });

    this.addAuditLog({
      tenantId,
      action: 'IMPORT',
      entity: 'MEMBER',
      entityId: `bulk-mem-${Date.now()}`,
      descriptionBn: `বাল্ক এক্সেল/সিএসভি থেকে সর্বমোট ${imported.length} জন সদস্য সফলভাবে ডাটাবেজে ইমপোর্ট সম্পন্ন হয়েছে`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return imported;
  }


  getSavingsPolicy(tenantId: string): SavingsPolicyConfig {
    if (!this.savingsPolicies[tenantId]) {
      this.savingsPolicies[tenantId] = {
        ...INITIAL_SAVINGS_POLICY,
        tenantId
      };
    }
    return this.savingsPolicies[tenantId];
  }

  updateSavingsPolicy(tenantId: string, updates: Partial<SavingsPolicyConfig>) {
    const current = this.getSavingsPolicy(tenantId);
    this.savingsPolicies[tenantId] = {
      ...current,
      ...updates,
      lastUpdatedAt: new Date().toISOString().split('T')[0],
      lastUpdatedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'সভাপতি (অ্যাডমিন)'
    };
    this.addAuditLog({
      tenantId,
      action: 'UPDATE',
      entity: 'SETTINGS',
      entityId: `sav-policy-${tenantId}`,
      descriptionBn: `সঞ্চয় ও ডিপিএস নীতিমালা হালনাগাদ করা হয়েছে (সাধারণ মুনাফা: ${this.savingsPolicies[tenantId].generalSavingsInterestRate}%, ডিপিএস জরিমানা: ৳${this.savingsPolicies[tenantId].dpsDefaultFinePerMissedMonth})`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });
    this.save();
    return this.savingsPolicies[tenantId];
  }

  openSavingsAccount(params: {
    tenantId: string;
    memberId: string;
    type: SavingsType;
    title: string;
    monthlyInstallment?: number;
    targetAmount?: number;
    tenureMonths?: number;
    interestRate: number;
    initialDeposit?: number;
    paymentMethod?: PaymentMethod;
    nomineeName?: string;
    nomineeRelation?: string;
    nomineePhone?: string;
    nomineeNid?: string;
    nomineeSharePercent?: number;
    notes?: string;
  }) {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য খুঁজে পাওয়া যায়নি');
    let prefix = 'SAV';
    if (params.type === 'DPS') {
      prefix = 'DPS';
    } else if (params.type === 'FIXED_DEPOSIT') {
      prefix = 'FDR';
    }
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const accountNo = `${prefix}-EK-${randomSuffix}`;

    const startDate = new Date().toISOString().split('T')[0];
    let maturityDate: string | undefined = undefined;
    if (params.tenureMonths && params.tenureMonths > 0) {
      const mat = new Date();
      mat.setMonth(mat.getMonth() + params.tenureMonths);
      maturityDate = mat.toISOString().split('T')[0];
    }

    const initialAmount = params.initialDeposit || 0;

    const newAccount: SavingsAccount = {
      id: `acc-${Date.now()}`,
      tenantId: params.tenantId,
      memberId: params.memberId,
      accountNo,
      type: params.type,
      title: params.title,
      balance: initialAmount,
      totalDeposited: initialAmount,
      totalWithdrawn: 0,
      targetAmount: params.targetAmount,
      monthlyInstallment: params.monthlyInstallment,
      tenureMonths: params.tenureMonths,
      interestRate: params.interestRate,
      startDate,
      maturityDate,
      lastDepositDate: initialAmount > 0 ? startDate : undefined,
      nomineeName: params.nomineeName || member.nominee?.name,
      nomineeRelation: params.nomineeRelation || member.nominee?.relation,
      nomineePhone: params.nomineePhone || member.nominee?.phone,
      nomineeNid: params.nomineeNid || member.nominee?.nidOrBirthCert,
      nomineeSharePercent: params.nomineeSharePercent || 100,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.savingsAccounts.unshift(newAccount);

    if (params.type === 'DPS') {
      member.dpsBalance = (member.dpsBalance || 0) + initialAmount;
    } else {
      member.savingsBalance = (member.savingsBalance || 0) + initialAmount;
    }

    if (initialAmount > 0) {
      const receiptNo = `RCT-${Date.now().toString().slice(-6)}`;
      const tx: SavingsTransaction = {
        id: `stx-${Date.now()}`,
        tenantId: params.tenantId,
        accountId: newAccount.id,
        memberId: params.memberId,
        type: 'DEPOSIT',
        amount: initialAmount,
        balanceAfter: newAccount.balance,
        paymentMethod: params.paymentMethod || 'CASH',
        collectorId: this.currentUserId,
        receiptNo,
        date: startDate,
        notes: params.notes || 'নতুন হিসাব খোলার প্রারম্ভিক জমা'
      };
      this.savingsTransactions.unshift(tx);

      this.vouchers.unshift({
        id: `vch-${Date.now()}`,
        tenantId: params.tenantId,
        voucherNo: `VR-${Date.now().toString().slice(-4)}`,
        type: 'CREDIT',
        category: 'সদস্য সঞ্চয় জমা',
        amount: initialAmount,
        descriptionBn: `${member.nameBn} (${member.memberCode}) এর নতুন হিসাব ${accountNo} খোলার প্রারম্ভিক জমা`,
        descriptionEn: `Initial deposit for new account ${accountNo} from ${member.nameEn}`,
        paidToOrReceivedFrom: member.nameBn,
        paymentMethod: params.paymentMethod || 'CASH',
        date: startDate,
        createdBy: this.currentUserId
      });
    }

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'CREATE',
      entity: 'SAVINGS_ACCOUNT',
      entityId: newAccount.id,
      descriptionBn: `সদস্য ${member.nameBn} (${member.memberCode}) এর জন্য নতুন হিসাব ${accountNo} (${params.title}) খোলা হয়েছে`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.addEvent({
      tenantId: params.tenantId,
      type: 'NEW_SAVINGS_DEPOSIT',
      titleBn: 'নতুন সঞ্চয়/ডিপিএস হিসাব খোলা হয়েছে',
      titleEn: 'New Savings/DPS Account Opened',
      messageBn: `${member.nameBn} এর জন্য হিসাব নম্বর ${accountNo} সফলভাবে খোলা হয়েছে।`,
      messageEn: `Account ${accountNo} successfully opened for ${member.nameEn}.`,
      memberId: member.id,
      memberName: member.nameBn
    });

    this.save();
    return newAccount;
  }

  recordSavingsDeposit(params: {
    tenantId: string;
    memberId: string;
    accountId?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য খুঁজে পাওয়া যায়নি');

    let account = this.savingsAccounts.find(a => a.id === params.accountId);
    account ??= this.savingsAccounts.find(a => a.memberId === params.memberId && a.type === 'GENERAL_SAVINGS');

    if (account) {
      account.balance += params.amount;
      account.totalDeposited = (account.totalDeposited || 0) + params.amount;
      account.lastDepositDate = new Date().toISOString().split('T')[0];
    }

    if (account?.type === 'DPS') {
      member.dpsBalance = (member.dpsBalance || 0) + params.amount;
    } else {
      member.savingsBalance = (member.savingsBalance || 0) + params.amount;
    }

    const receiptNo = `RCT-${Date.now().toString().slice(-6)}`;
    const tx: SavingsTransaction = {
      id: `stx-${Date.now()}`,
      tenantId: params.tenantId,
      accountId: account?.id || 'sav-gen',
      memberId: params.memberId,
      type: 'DEPOSIT',
      amount: params.amount,
      balanceAfter: account ? account.balance : member.savingsBalance,
      paymentMethod: params.paymentMethod,
      collectorId: this.currentUserId,
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      notes: params.notes || (account?.type === 'DPS' ? 'ডিপিএস মাসিক কিস্তি জমা' : 'নিয়মিত সঞ্চয় জমা')
    };
    this.savingsTransactions.unshift(tx);

    // Add Credit voucher
    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: 'CREDIT',
      category: account?.type === 'DPS' ? 'ডিপিএস কিস্তি জমা' : 'সদস্য সঞ্চয় জমা',
      amount: params.amount,
      descriptionBn: `${member.nameBn} (${member.memberCode}) এর ${account ? account.title + ' (' + account.accountNo + ')' : 'সঞ্চয় হিসাব'} জমা। রসিদ: ${receiptNo}`,
      descriptionEn: `Savings deposit from ${member.nameEn}. Receipt: ${receiptNo}`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: params.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      createdBy: this.currentUserId
    };
    this.vouchers.unshift(voucher);

    this.addEvent({
      tenantId: params.tenantId,
      type: 'NEW_SAVINGS_DEPOSIT',
      titleBn: account?.type === 'DPS' ? 'ডিপিএস কিস্তি আদায় সম্পন্ন' : 'সঞ্চয় জমা গ্রহণ সম্পন্ন',
      titleEn: account?.type === 'DPS' ? 'DPS Installment Received' : 'Savings Deposit Received',
      messageBn: `${member.nameBn} জমা দিয়েছেন ৳ ${params.amount.toLocaleString()}। নতুন ব্যালান্স ৳ ${(account?.balance || member.savingsBalance).toLocaleString()}`,
      messageEn: `${member.nameEn} deposited ৳ ${params.amount.toLocaleString()}. Balance: ৳ ${(account?.balance || member.savingsBalance).toLocaleString()}`,
      amount: params.amount,
      memberId: member.id,
      memberName: member.nameBn
    });

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'UPDATE',
      entity: 'SAVINGS_ACCOUNT',
      entityId: account?.id || member.id,
      descriptionBn: `সদস্য ${member.nameBn} (${member.memberCode}) এর ${account ? account.accountNo : 'সঞ্চয়'} হিসেবে ৳${params.amount.toLocaleString()} জমা গ্রহণ (রসিদ: ${receiptNo})`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return tx;
  }

  recordSavingsWithdrawal(params: {
    tenantId: string;
    accountId: string;
    memberId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য খুঁজে পাওয়া যায়নি');

    const account = this.savingsAccounts.find(a => a.id === params.accountId);
    if (!account) throw new Error('সঞ্চয় হিসাব পাওয়া যায়নি');

    const policy = this.getSavingsPolicy(params.tenantId);
    const minReserve = account.type === 'GENERAL_SAVINGS' ? policy.minimumBalanceRequired : 0;
    if (account.balance - params.amount < minReserve) {
      throw new Error(`উত্তোলনের পর অ্যাকাউন্টে ন্যূনতম ৳${minReserve.toLocaleString()} স্থিতি থাকতে হবে। বর্তমান স্থিতি ৳${account.balance.toLocaleString()}।`);
    }

    account.balance -= params.amount;
    account.totalWithdrawn = (account.totalWithdrawn || 0) + params.amount;

    if (account.type === 'DPS') {
      member.dpsBalance = Math.max(0, (member.dpsBalance || 0) - params.amount);
    } else {
      member.savingsBalance = Math.max(0, (member.savingsBalance || 0) - params.amount);
    }

    const receiptNo = `WD-${Date.now().toString().slice(-6)}`;
    const tx: SavingsTransaction = {
      id: `stx-${Date.now()}`,
      tenantId: params.tenantId,
      accountId: account.id,
      memberId: params.memberId,
      type: 'WITHDRAWAL',
      amount: params.amount,
      balanceAfter: account.balance,
      paymentMethod: params.paymentMethod,
      collectorId: this.currentUserId,
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      notes: params.notes || 'সঞ্চয় তহবিল থেকে উত্তোলন'
    };
    this.savingsTransactions.unshift(tx);

    this.vouchers.unshift({
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: 'DEBIT',
      category: 'সদস্য সঞ্চয় উত্তোলন',
      amount: params.amount,
      descriptionBn: `${member.nameBn} (${member.memberCode}) এর সঞ্চয় হিসাব ${account.accountNo} হইতে উত্তোলন। ভাউচার: ${receiptNo}`,
      descriptionEn: `Savings withdrawal for ${member.nameEn} from account ${account.accountNo}`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: params.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      createdBy: this.currentUserId
    });

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'UPDATE',
      entity: 'SAVINGS_ACCOUNT',
      entityId: account.id,
      descriptionBn: `সদস্য ${member.nameBn} (${member.memberCode}) এর হিসাব ${account.accountNo} হইতে ৳${params.amount.toLocaleString()} উত্তোলন সম্পন্ন। অবশিষ্টাংশ: ৳${account.balance.toLocaleString()}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return tx;
  }

  closeOrSettleSavingsAccount(params: {
    tenantId: string;
    accountId: string;
    memberId: string;
    principalPaid: number;
    accruedProfit: number;
    penaltyDeduction: number;
    netPayable: number;
    paymentMethod: PaymentMethod;
    reason?: string;
  }) {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য খুঁজে পাওয়া যায়নি');
    const account = this.savingsAccounts.find(a => a.id === params.accountId);
    if (!account) throw new Error('হিসাব খুঁজে পাওয়া যায়নি');

    const previousBalance = account.balance;
    account.status = 'CLOSED';
    account.balance = 0;
    account.closedDate = new Date().toISOString().split('T')[0];
    account.closedReason = params.reason || 'মেয়াদপূর্তি বা স্বেচ্ছায় হিসাব নিষ্পত্তি';

    if (account.type === 'DPS') {
      member.dpsBalance = Math.max(0, (member.dpsBalance || 0) - previousBalance);
    } else {
      member.savingsBalance = Math.max(0, (member.savingsBalance || 0) - previousBalance);
    }

    const voucherNo = `VR-SETTLE-${Date.now().toString().slice(-4)}`;
    this.vouchers.unshift({
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo,
      type: 'DEBIT',
      category: account.type === 'DPS' ? 'ডিপিএস মেয়াদপূর্তি ও নিষ্পত্তি' : 'সঞ্চয় হিসাব চূড়ান্ত নিষ্পত্তি',
      amount: params.netPayable,
      descriptionBn: `${member.nameBn} (${member.memberCode}) এর ${account.title} (${account.accountNo}) চূড়ান্ত নিষ্পত্তি (আমানত: ৳${params.principalPaid.toLocaleString()}, লভ্যাংশ: ৳${params.accruedProfit.toLocaleString()}, কর্তন: ৳${params.penaltyDeduction.toLocaleString()}, মোট প্রদেয়: ৳${params.netPayable.toLocaleString()})`,
      descriptionEn: `Settlement for ${account.accountNo}. Net paid: ৳${params.netPayable.toLocaleString()}`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: params.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      createdBy: this.currentUserId
    });

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'UPDATE',
      entity: 'SAVINGS_ACCOUNT',
      entityId: account.id,
      descriptionBn: `হিসাব ${account.accountNo} (${account.title}) চূড়ান্ত নিষ্পত্তি সম্পন্ন। সদস্যকে পরিশোধ: ৳${params.netPayable.toLocaleString()}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return account;
  }

  getLoanPolicy(tenantId: string): LoanPolicyConfig {
    if (!this.loanPolicies[tenantId]) {
      this.loanPolicies[tenantId] = {
        ...INITIAL_LOAN_POLICY,
        tenantId
      };
    }
    return this.loanPolicies[tenantId];
  }

  updateLoanPolicy(tenantId: string, updates: Partial<LoanPolicyConfig>) {
    const current = this.getLoanPolicy(tenantId);
    this.loanPolicies[tenantId] = {
      ...current,
      ...updates,
      lastUpdatedAt: new Date().toISOString().split('T')[0],
      lastUpdatedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'সভাপতি (অ্যাডমিন)'
    };
    this.addAuditLog({
      tenantId,
      action: 'UPDATE',
      entity: 'SETTINGS',
      entityId: `loan-policy-${tenantId}`,
      descriptionBn: `ঋণ ও কিস্তি নীতিমালা হালনাগাদ করা হয়েছে (সুদের হার: ${this.loanPolicies[tenantId].defaultInterestRate}%, সঞ্চয় অনুপাত: ${this.loanPolicies[tenantId].maxLoanToSavingsRatio}x)`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });
    this.save();
    return this.loanPolicies[tenantId];
  }

  applyLoan(params: {
    tenantId: string;
    memberId: string;
    loanScheme: string;
    principalAmount: number;
    interestRatePercent: number;
    interestMethod?: LoanInterestMethod;
    durationMonths: number;
    installmentFrequency?: LoanFrequency;
    purpose: string;
    processingFee?: number;
    guarantor1?: LoanGuarantor;
    guarantor2?: LoanGuarantor;
    collateralDetails?: string;
    autoApprove?: boolean;
    approvalNotes?: string;
  }): Loan {
    const member = this.members.find(m => m.id === params.memberId);
    const today = new Date().toISOString().split('T')[0];
    const interestMethod = params.interestMethod || 'FLAT';
    const frequency = params.installmentFrequency || 'MONTHLY';
    
    // Calculate total interest and schedule
    const durationYears = params.durationMonths / 12;
    const totalInterest = Math.round(params.principalAmount * (params.interestRatePercent / 100) * durationYears);
    const totalPayable = params.principalAmount + totalInterest;

    let totalInstallments = params.durationMonths;
    if (frequency === 'WEEKLY') totalInstallments = params.durationMonths * 4;
    else if (frequency === 'DAILY') totalInstallments = params.durationMonths * 30;

    const installmentAmount = Math.round(totalPayable / totalInstallments);
    const perPrincipal = Math.round(params.principalAmount / totalInstallments);
    const perInterest = installmentAmount - perPrincipal;

    // Generate schedule
    const installments: LoanInstallment[] = [];
    const baseDate = new Date();
    for (let i = 1; i <= totalInstallments; i++) {
      const dueDateObj = new Date(baseDate);
      if (frequency === 'MONTHLY') dueDateObj.setMonth(baseDate.getMonth() + i);
      else if (frequency === 'WEEKLY') dueDateObj.setDate(baseDate.getDate() + (i * 7));
      else dueDateObj.setDate(baseDate.getDate() + i);

      installments.push({
        installmentNumber: i,
        dueDate: dueDateObj.toISOString().split('T')[0],
        principalAmount: perPrincipal,
        interestAmount: perInterest,
        totalDue: installmentAmount,
        paidAmount: 0,
        status: 'PENDING'
      });
    }

    const loanCount = this.loans.filter(l => l.tenantId === params.tenantId).length + 1;
    const loanNumber = `LN-EK-${new Date().getFullYear()}-${loanCount.toString().padStart(2, '0')}`;
    const newId = `loan-${Date.now()}`;
    const isApproved = !!params.autoApprove;

    const newLoan: Loan = {
      id: newId,
      tenantId: params.tenantId,
      memberId: params.memberId,
      loanNumber,
      loanScheme: params.loanScheme,
      principalAmount: params.principalAmount,
      interestRatePercent: params.interestRatePercent,
      interestMethod,
      durationMonths: params.durationMonths,
      totalPayable,
      totalPaid: 0,
      outstandingBalance: totalPayable,
      installmentFrequency: frequency,
      installmentAmount,
      totalInstallments,
      paidInstallments: 0,
      processingFee: params.processingFee ?? Math.round(params.principalAmount * 0.01),
      guarantor1: params.guarantor1,
      guarantor2: params.guarantor2,
      collateralDetails: params.collateralDetails,
      purpose: params.purpose,
      status: isApproved ? 'APPROVED' : 'PENDING',
      approvalDate: isApproved ? today : undefined,
      approvedBy: isApproved ? (this.users.find(u => u.id === this.currentUserId)?.nameBn || 'সভাপতি (অ্যাডমিন)') : undefined,
      approvalNotes: isApproved ? (params.approvalNotes || 'অ্যাডমিন কর্তৃক তাৎক্ষণিক অনুমোদিত') : undefined,
      installments,
      createdAt: today
    };

    this.loans.unshift(newLoan);

    this.addEvent({
      tenantId: params.tenantId,
      type: 'LOAN_APPLICATION_SUBMITTED',
      titleBn: isApproved ? 'নতুন ঋণ অনুমোদিত হয়েছে' : 'নতুন ঋণ আবেদন জমা হয়েছে',
      titleEn: isApproved ? 'New Loan Approved' : 'New Loan Application Submitted',
      messageBn: `${member?.nameBn || 'সদস্য'} এর জন্য ৳${params.principalAmount.toLocaleString()} টাকার ${params.loanScheme} আবেদন সম্পন্ন হয়েছে।`,
      messageEn: `Loan application for ৳${params.principalAmount.toLocaleString()} submitted for ${member?.nameEn || 'Member'}.`,
      amount: params.principalAmount,
      memberId: member?.id,
      memberName: member?.nameBn
    });

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'CREATE',
      entity: 'LOAN',
      entityId: newId,
      descriptionBn: `নতুন ঋণ আবেদন: ${loanNumber} (${params.loanScheme}), সদস্য: ${member?.nameBn} (${member?.memberCode}), পরিমাণ: ৳${params.principalAmount.toLocaleString()}, মেয়াদ: ${params.durationMonths} মাস`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return newLoan;
  }

  approveOrRejectLoan(params: {
    tenantId: string;
    loanId: string;
    status: 'APPROVED' | 'REJECTED';
    notes?: string;
    rejectionReason?: string;
  }): Loan | null {
    const loan = this.loans.find(l => l.id === params.loanId);
    if (!loan) return null;

    const today = new Date().toISOString().split('T')[0];
    const member = this.members.find(m => m.id === loan.memberId);
    const approverName = this.users.find(u => u.id === this.currentUserId)?.nameBn || 'আলহাজ্ব রফিকুল ইসলাম (সভাপতি)';

    loan.status = params.status;
    if (params.status === 'APPROVED') {
      loan.approvalDate = today;
      loan.approvedBy = approverName;
      loan.approvalNotes = params.notes || 'ঋণ কমিটি কর্তৃক যাচাই ও অনুমোদিত';
    } else {
      loan.rejectionReason = params.rejectionReason || params.notes || 'যথাযথ জামিনদার বা নথির ঘাটতি থাকায় আবেদন বাতিল';
    }

    this.addAuditLog({
      tenantId: params.tenantId,
      action: params.status === 'APPROVED' ? 'APPROVE' : 'REJECT',
      entity: 'LOAN',
      entityId: loan.id,
      descriptionBn: `ঋণ হিসাব ${loan.loanNumber} (${member?.nameBn}) ${params.status === 'APPROVED' ? 'অনুমোদন করা হয়েছে' : 'প্রত্যাখ্যান করা হয়েছে'}। মন্তব্য: ${params.notes || params.rejectionReason || ''}`,
      performedBy: approverName,
      performedByRole: 'ADMIN'
    });

    this.save();
    return loan;
  }

  disburseLoan(params: {
    tenantId: string;
    loanId: string;
    disbursementDate?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Loan | null {
    const loan = this.loans.find(l => l.id === params.loanId);
    if (!loan) return null;

    const today = params.disbursementDate || new Date().toISOString().split('T')[0];
    const member = this.members.find(m => m.id === loan.memberId);
    const officerName = this.users.find(u => u.id === this.currentUserId)?.nameBn || 'মো: তারেক হাসান (ম্যানেজার)';

    loan.status = 'ACTIVE';
    loan.disbursementDate = today;
    loan.disbursedBy = officerName;
    loan.disbursementMethod = params.paymentMethod;

    const voucherNo = `VR-DB-${Date.now().toString().slice(-4)}`;
    loan.disbursementVoucherNo = voucherNo;

    // Recalculate schedule dates starting from disbursement date
    const baseDate = new Date(today);
    loan.installments.forEach((inst, idx) => {
      const d = new Date(baseDate);
      if (loan.installmentFrequency === 'WEEKLY') d.setDate(baseDate.getDate() + ((idx + 1) * 7));
      else if (loan.installmentFrequency === 'DAILY') d.setDate(baseDate.getDate() + (idx + 1));
      else d.setMonth(baseDate.getMonth() + (idx + 1));
      inst.dueDate = d.toISOString().split('T')[0];
    });

    // Update member's loanOutstanding
    if (member) {
      member.loanOutstanding = (member.loanOutstanding || 0) + loan.totalPayable;
    }

    // Create Cash/Bank Debit Voucher for Loan Disbursement
    const debitVoucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo,
      type: 'DEBIT',
      category: 'ঋণ বিতরণ (Disbursement)',
      accountHeadCode: '1030',
      accountHeadNameBn: 'সদস্য ঋণ আদায়যোগ্য হিসাব (Loans Receivable)',
      amount: loan.principalAmount,
      descriptionBn: `সদস্য ${member?.nameBn} (${member?.memberCode}) কে ${loan.loanScheme} বাবদ ঋণ প্রদান। ঋণ নং: ${loan.loanNumber}`,
      descriptionEn: `Loan disbursed to ${member?.nameEn} for ${loan.loanScheme}. Loan No: ${loan.loanNumber}`,
      paidToOrReceivedFrom: member?.nameBn || 'ঋণগ্রহীতা সদস্য',
      paymentMethod: params.paymentMethod,
      date: today,
      createdBy: this.currentUserId,
      approvedBy: officerName,
      status: 'APPROVED'
    };
    this.vouchers.unshift(debitVoucher);

    this.updateVoucherAccountBalances(
      params.tenantId,
      'DEBIT',
      '1030',
      params.paymentMethod,
      loan.principalAmount
    );

    // If processing fee exists, record income Credit voucher
    if (loan.processingFee && loan.processingFee > 0) {
      const feeVoucher: Voucher = {
        id: `vch-fee-${Date.now()}`,
        tenantId: params.tenantId,
        voucherNo: `VR-CR-${Date.now().toString().slice(-4)}`,
        type: 'CREDIT',
        category: 'ঋণ প্রসেসিং ফি আয়',
        accountHeadCode: '3030',
        accountHeadNameBn: 'ঋণ আবেদন ফরম ও প্রসেসিং ফি আয়',
        amount: loan.processingFee,
        descriptionBn: `ঋণ নং: ${loan.loanNumber} এর প্রসেসিং ও ডকুমেন্টেশন ফি বাবদ আয়`,
        descriptionEn: `Loan processing fee for ${loan.loanNumber}`,
        paidToOrReceivedFrom: member?.nameBn || 'ঋণগ্রহীতা সদস্য',
        paymentMethod: params.paymentMethod,
        date: today,
        createdBy: this.currentUserId,
        approvedBy: officerName,
        status: 'APPROVED'
      };
      this.vouchers.unshift(feeVoucher);

      this.updateVoucherAccountBalances(
        params.tenantId,
        'CREDIT',
        '3030',
        params.paymentMethod,
        loan.processingFee
      );
    }

    this.addEvent({
      tenantId: params.tenantId,
      type: 'LOAN_DISBURSED',
      titleBn: 'ঋণ তহবিল বিতরণ সফল',
      titleEn: 'Loan Disbursed Successfully',
      messageBn: `${member?.nameBn} কে ৳${loan.principalAmount.toLocaleString()} ঋণ তহবিল প্রদান করা হয়েছে। ঋণ নং: ${loan.loanNumber}`,
      messageEn: `৳${loan.principalAmount.toLocaleString()} disbursed to ${member?.nameEn}. Loan No: ${loan.loanNumber}`,
      amount: loan.principalAmount,
      memberId: member?.id,
      memberName: member?.nameBn
    });

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'UPDATE',
      entity: 'LOAN',
      entityId: loan.id,
      descriptionBn: `ঋণ বিতরণ সম্পন্ন: ${loan.loanNumber}, সদস্য: ${member?.nameBn}, বিতরণকৃত আসল: ৳${loan.principalAmount.toLocaleString()}, মোট প্রদেয়: ৳${loan.totalPayable.toLocaleString()}, ভাউচার: ${voucherNo}`,
      performedBy: officerName,
      performedByRole: 'MANAGER'
    });

    this.save();
    return loan;
  }

  collectLoanInstallment(params: {
    tenantId: string;
    loanId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    penaltyPaid?: number;
    notes?: string;
  }): { loan: Loan; receipt: PaidReceipt } | null {
    const loan = this.loans.find(l => l.id === params.loanId);
    if (!loan) return null;

    const member = this.members.find(m => m.id === loan.memberId);
    const today = new Date().toISOString().split('T')[0];
    const receiptNo = `RCT-LN-${Date.now().toString().slice(-5)}`;
    const collectorName = this.users.find(u => u.id === this.currentUserId)?.nameBn || 'মো: তারেক হাসান (ম্যানেজার)';

    loan.totalPaid += params.amount;
    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - params.amount);
    loan.lastPaymentDate = today;

    // Allocate payment into installments
    let remainingAmountToAllocate = params.amount;
    for (const inst of loan.installments) {
      if (remainingAmountToAllocate <= 0) break;
      if (inst.status !== 'PAID') {
        const needed = inst.totalDue - (inst.paidAmount || 0);
        if (remainingAmountToAllocate >= needed) {
          inst.paidAmount = inst.totalDue;
          inst.status = 'PAID';
          inst.paidDate = today;
          inst.receiptNo = receiptNo;
          remainingAmountToAllocate -= needed;
          loan.paidInstallments = Math.min(loan.totalInstallments, loan.paidInstallments + 1);
        } else {
          inst.paidAmount = (inst.paidAmount || 0) + remainingAmountToAllocate;
          inst.status = 'PARTIAL';
          inst.paidDate = today;
          inst.receiptNo = receiptNo;
          remainingAmountToAllocate = 0;
        }
      }
    }

    if (member) {
      member.loanOutstanding = Math.max(0, (member.loanOutstanding || 0) - params.amount);
    }

    if (loan.outstandingBalance === 0) {
      loan.status = 'COMPLETED';
      loan.closedDate = today;
      loan.closedReason = 'সকল কিস্তি সম্পূর্ণভাবে পরিশোধিত হয়েছে।';
    }

    // Add Credit voucher into Accounts & General Ledger
    const voucherNo = `VR-CR-${Date.now().toString().slice(-4)}`;
    const principalRatio = loan.totalPayable > 0 ? loan.principalAmount / loan.totalPayable : 0.8;
    const principalPortion = Math.round(params.amount * principalRatio);
    const interestPortion = params.amount - principalPortion;

    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo,
      type: 'CREDIT',
      category: 'ঋণ কিস্তি আদায় (Loan Repayment)',
      accountHeadCode: '1030',
      accountHeadNameBn: 'সদস্য ঋণ আদায়যোগ্য হিসাব (Loans Receivable)',
      amount: params.amount,
      descriptionBn: `${member?.nameBn || 'সদস্য'} এর ঋণ নম্বর ${loan.loanNumber} এর কিস্তি আদায় (আসল: ৳${principalPortion.toLocaleString()}, মুনাফা: ৳${interestPortion.toLocaleString()})। রসিদ নং: ${receiptNo}`,
      descriptionEn: `Loan repayment collected for ${loan.loanNumber} (Principal: ৳${principalPortion.toLocaleString()}, Interest: ৳${interestPortion.toLocaleString()}). Receipt: ${receiptNo}`,
      paidToOrReceivedFrom: member?.nameBn || 'ঋণগ্রহীতা সদস্য',
      paymentMethod: params.paymentMethod,
      date: today,
      createdBy: this.currentUserId,
      approvedBy: collectorName,
      status: 'APPROVED'
    };
    this.vouchers.unshift(voucher);

    // Update account head balances: reduce Loans Receivable by principal, increase Interest Income
    this.updateVoucherAccountBalances(
      params.tenantId,
      'CREDIT',
      '1030',
      params.paymentMethod,
      principalPortion
    );
    if (interestPortion > 0) {
      this.updateVoucherAccountBalances(
        params.tenantId,
        'CREDIT',
        '3020',
        params.paymentMethod,
        interestPortion
      );
    }

    // Create official PaidReceipt
    const receipt: PaidReceipt = {
      id: `rct-${Date.now()}`,
      tenantId: params.tenantId,
      receiptNo,
      receiptType: 'LOAN_EMI',
      titleBn: 'ঋণের কিস্তি আদায় মানি রসিদ',
      titleEn: 'Loan Installment Money Receipt',
      memberId: loan.memberId,
      memberCode: member?.memberCode || 'MEM-001',
      memberNameBn: member?.nameBn || 'সদস্য',
      memberNameEn: member?.nameEn || 'Member',
      phone: member?.phone || '',
      amount: params.amount,
      amountInWordsBn: `${params.amount.toLocaleString()} টাকা মাত্র`,
      amountInWordsEn: `${params.amount} Taka Only`,
      date: today,
      paymentMethod: params.paymentMethod,
      notes: params.notes || `ঋণ নং: ${loan.loanNumber} এর কিস্তি পরিশোধ (বকেয়া: ৳${loan.outstandingBalance.toLocaleString()})`,
      collectedBy: this.currentUserId,
      collectorNameBn: collectorName,
      qrCodeData: `SAMITYPRO|LOAN|${receiptNo}|${loan.loanNumber}|${params.amount}|${today}`,
      isVerified: true,
      createdAt: today
    };
    this.receipts.unshift(receipt);

    this.addEvent({
      tenantId: params.tenantId,
      type: 'LOAN_INSTALLMENT_PAID',
      titleBn: 'ঋণের কিস্তি আদায় সম্পন্ন',
      titleEn: 'Loan Installment Collected',
      messageBn: `${member?.nameBn || 'সদস্য'} কিস্তি পরিশোধ করেছেন ৳ ${params.amount.toLocaleString()}। বর্তমান অবশিষ্ট বকেয়া: ৳ ${loan.outstandingBalance.toLocaleString()}`,
      messageEn: `${member?.nameEn || 'Member'} paid ৳ ${params.amount.toLocaleString()}. Outstanding: ৳ ${loan.outstandingBalance.toLocaleString()}`,
      amount: params.amount,
      memberId: member?.id,
      memberName: member?.nameBn
    });

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'UPDATE',
      entity: 'LOAN',
      entityId: loan.id,
      descriptionBn: `ঋণের কিস্তি আদায়: ${loan.loanNumber}, সদস্য: ${member?.nameBn}, আদায়কৃত টাকা: ৳${params.amount.toLocaleString()}, অবশিষ্ট ঋণ: ৳${loan.outstandingBalance.toLocaleString()}, রসিদ নং: ${receiptNo}`,
      performedBy: collectorName,
      performedByRole: 'MANAGER'
    });

    this.save();
    return { loan, receipt };
  }

  waiveLoanPenalty(loanId: string, installmentNumber: number, amount: number, reason: string): boolean {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) return false;

    const inst = loan.installments.find(i => i.installmentNumber === installmentNumber);
    if (!inst) return false;

    inst.penalty = Math.max(0, (inst.penalty || 0) - amount);
    this.addAuditLog({
      tenantId: loan.tenantId,
      action: 'UPDATE',
      entity: 'LOAN',
      entityId: loan.id,
      descriptionBn: `ঋণ নং ${loan.loanNumber} এর কিস্তি ${installmentNumber} এর জরিমানা ৳${amount} মওকুফ করা হয়েছে। কারণ: ${reason}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'সভাপতি (অ্যাডমিন)',
      performedByRole: 'ADMIN'
    });

    this.save();
    return true;
  }

  addEvent(eventData: Omit<RealtimeEvent, 'id' | 'timestamp'>) {
    const event: RealtimeEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    this.events.unshift(event);
    if (this.events.length > 50) this.events.pop();
  }

  recordMonthlySubscription(params: {
    tenantId: string;
    memberId: string;
    monthYear: string;
    monthNameBn?: string;
    amount: number;
    paymentMethod: 'CASH' | 'BANK' | 'BKASH' | 'NAGAD';
    notes?: string;
  }): PaidReceipt | null {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) return null;

    const monthNameBn = params.monthNameBn || 'অক্টোবর ২০২৬';
    let sub = this.subscriptions.find(s => s.memberId === params.memberId && s.monthYear === params.monthYear);
    const receiptNo = `RCT-SUB-${Date.now().toString().slice(-5)}`;
    const today = new Date().toISOString().split('T')[0];

    if (sub) {
      sub.paidAmount += params.amount;
      sub.dueAmount = Math.max(0, sub.totalAmount - sub.paidAmount);
      sub.status = sub.dueAmount === 0 ? 'PAID' : 'PARTIAL';
      sub.paymentDate = today;
      sub.receiptNo = receiptNo;
      sub.paymentMethod = params.paymentMethod;
      sub.collectedBy = this.currentUserId;
      sub.updatedAt = today;
    } else {
      const newSub: MonthlySubscription = {
        id: `sub-${Date.now()}`,
        tenantId: params.tenantId,
        memberId: params.memberId,
        memberCode: member.memberCode,
        memberNameBn: member.nameBn,
        memberNameEn: member.nameEn,
        phone: member.phone,
        monthYear: params.monthYear,
        monthNameBn,
        feeAmount: params.amount,
        lateFee: 0,
        totalAmount: params.amount,
        paidAmount: params.amount,
        dueAmount: 0,
        status: 'PAID',
        paymentDate: today,
        receiptNo,
        paymentMethod: params.paymentMethod,
        collectedBy: this.currentUserId,
        notes: params.notes,
        createdAt: today,
        updatedAt: today
      };
      this.subscriptions.unshift(newSub);
      sub = newSub;
    }

    const receipt: PaidReceipt = {
      id: `rct-${Date.now()}`,
      tenantId: params.tenantId,
      receiptNo,
      receiptType: 'SUBSCRIPTION',
      titleBn: 'মাসিক চাঁদা পরিশোধ রসিদ',
      titleEn: 'Monthly Subscription Money Receipt',
      memberId: member.id,
      memberCode: member.memberCode,
      memberNameBn: member.nameBn,
      memberNameEn: member.nameEn,
      phone: member.phone,
      amount: params.amount,
      amountInWordsBn: `${params.amount.toLocaleString()} টাকা মাত্র`,
      amountInWordsEn: `${params.amount} Taka Only`,
      date: today,
      paymentMethod: params.paymentMethod,
      notes: params.notes || `${sub.monthNameBn} এর চাঁদা পরিশোধ`,
      collectedBy: this.currentUserId,
      collectorNameBn: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'কোষাধ্যক্ষ / অ্যাডমিন',
      qrCodeData: `https://samitypro.org/verify/${receiptNo}`,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    this.receipts.unshift(receipt);

    // Credit voucher
    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: 'CREDIT',
      category: 'মাসিক চাঁদা আদায়',
      amount: params.amount,
      descriptionBn: `${member.nameBn} (${member.memberCode}) এর মাসিক চাঁদা আদায়। রসিদ: ${receiptNo}`,
      descriptionEn: `Monthly subscription from ${member.nameEn}. Receipt: ${receiptNo}`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: params.paymentMethod,
      date: today,
      createdBy: this.currentUserId
    };
    this.vouchers.unshift(voucher);

    this.addEvent({
      tenantId: params.tenantId,
      type: 'SUBSCRIPTION_PAID',
      titleBn: 'মাসিক চাঁদা আদায় সম্পন্ন',
      titleEn: 'Monthly Subscription Paid',
      messageBn: `${member.nameBn} (${member.memberCode}) মাসিক চাঁদা ৳ ${params.amount.toLocaleString()} পরিশোধ করেছেন। রসিদ নং: ${receiptNo}`,
      messageEn: `${member.nameEn} paid subscription ৳ ${params.amount.toLocaleString()}. Receipt: ${receiptNo}`,
      amount: params.amount,
      memberId: member.id,
      memberName: member.nameBn
    });

    this.save();
    return receipt;
  }

  getSubscriptionPolicy(tenantId: string): SubscriptionPolicyConfig {
    if (this.subscriptionPolicies[tenantId]) {
      return this.subscriptionPolicies[tenantId];
    }
    const defaultCopy: SubscriptionPolicyConfig = {
      ...INITIAL_SUBSCRIPTION_POLICY,
      tenantId
    };
    this.subscriptionPolicies[tenantId] = defaultCopy;
    this.save();
    return defaultCopy;
  }

  updateSubscriptionPolicy(tenantId: string, updates: Partial<SubscriptionPolicyConfig>): SubscriptionPolicyConfig {
    const current = this.getSubscriptionPolicy(tenantId);
    const updated: SubscriptionPolicyConfig = {
      ...current,
      ...updates,
      updatedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.subscriptionPolicies[tenantId] = updated;

    this.addAuditLog({
      tenantId,
      action: 'UPDATE',
      entity: 'SUBSCRIPTION',
      entityId: `policy-${tenantId}`,
      descriptionBn: `সমিতির চাঁদা ও লেট ফি পলিসি কনফিগারেশন হালনাগাদ করা হয়েছে (ডিফল্ট: ৳ ${updated.defaultMonthlyAmount}, ডিউ ডে: ${updated.dueDayOfMonth} তারিখ, গ্রেস: ${updated.gracePeriodDays} দিন)`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ADMIN'
    });

    this.save();
    return updated;
  }

  generateMonthlyDues(tenantId: string, monthYear: string, monthNameBn: string): { generatedCount: number; skippedCount: number; totalDemand: number } {
    const activeMembers = this.members.filter(m => m.tenantId === tenantId && m.status === 'ACTIVE');
    const policy = this.getSubscriptionPolicy(tenantId);
    const today = new Date().toISOString().split('T')[0];

    let generatedCount = 0;
    let skippedCount = 0;
    let totalDemand = 0;

    activeMembers.forEach(member => {
      // Check if already billed for this month
      const isAlreadyBilled = this.subscriptions.some(s => s.tenantId === tenantId && s.memberId === member.id && s.monthYear === monthYear);
      if (isAlreadyBilled) {
        skippedCount++;
        return;
      }

      // Check category rate
      const categoryRate = policy.categoryRates?.find(r => r.category === member.category);
      if (categoryRate?.isExempt) {
        skippedCount++;
        return;
      }

      const feeAmount = member.monthlySubscriptionAmount || categoryRate?.monthlyAmount || policy.defaultMonthlyAmount || 1500;
      
      // Check late fee based on current date
      const dueDay = policy.dueDayOfMonth || 10;
      const graceDays = policy.gracePeriodDays || 5;
      const cutoffDate = `${monthYear}-${String(dueDay + graceDays).padStart(2, '0')}`;
      let lateFee = 0;
      let status: FeePaymentStatus = 'UNPAID';

      if (policy.lateFeeEnabled && today > cutoffDate) {
        lateFee = policy.lateFeeType === 'PERCENTAGE' 
          ? Math.round((feeAmount * (policy.lateFeeAmount || 5)) / 100) 
          : (policy.lateFeeAmount || 100);
        status = 'OVERDUE';
      }

      const totalAmount = feeAmount + lateFee;
      totalDemand += totalAmount;

      const newSub: MonthlySubscription = {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tenantId,
        memberId: member.id,
        memberCode: member.memberCode,
        memberNameBn: member.nameBn,
        memberNameEn: member.nameEn,
        phone: member.phone,
        monthYear,
        monthNameBn,
        feeAmount,
        lateFee,
        totalAmount,
        paidAmount: 0,
        dueAmount: totalAmount,
        status,
        createdAt: today,
        updatedAt: today
      };

      this.subscriptions.unshift(newSub);
      generatedCount++;
    });

    if (generatedCount > 0) {
      this.addAuditLog({
        tenantId,
        action: 'CREATE',
        entity: 'SUBSCRIPTION',
        entityId: `gen-${monthYear}`,
        descriptionBn: `${monthNameBn} মাসের জন্য সর্বমোট ${generatedCount} জন সদস্যের চাঁদা (মোট দাবি ৳ ${totalDemand.toLocaleString()}) স্বয়ংক্রিয়ভাবে জেনারেট করা হয়েছে। বাদ পড়েছেন/পূর্বনির্ধারিত: ${skippedCount} জন`,
        performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
        performedByRole: 'ADMIN'
      });

      this.addEvent({
        tenantId,
        type: 'SYSTEM_ANNOUNCEMENT',
        titleBn: `${monthNameBn} মাসের চাঁদা জেনারেট সম্পন্ন`,
        titleEn: `Monthly Dues Generated for ${monthYear}`,
        messageBn: `${generatedCount} জন সদস্যের জন্য সর্বমোট ৳ ${totalDemand.toLocaleString()} টাকা চাঁদা ধার্য করা হয়েছে।`,
        messageEn: `Total ৳ ${totalDemand.toLocaleString()} dues generated for ${generatedCount} active members.`,
        amount: totalDemand
      });

      this.save();
    }

    return { generatedCount, skippedCount, totalDemand };
  }

  waiveLateFee(subscriptionId: string, waivedAmount: number, reason: string): boolean {
    const sub = this.subscriptions.find(s => s.id === subscriptionId);
    if (!sub || sub.lateFee <= 0 || waivedAmount <= 0) return false;

    const actualWaiver = Math.min(sub.lateFee, waivedAmount);
    const oldLateFee = sub.lateFee;
    sub.lateFee -= actualWaiver;
    sub.totalAmount = sub.feeAmount + sub.lateFee;
    sub.dueAmount = Math.max(0, sub.totalAmount - sub.paidAmount);
    if (sub.dueAmount === 0) {
      sub.status = 'PAID';
    } else if (sub.paidAmount > 0) {
      sub.status = 'PARTIAL';
    } else if (sub.status === 'OVERDUE') {
      sub.status = 'OVERDUE';
    } else {
      sub.status = 'UNPAID';
    }
    sub.updatedAt = new Date().toISOString().split('T')[0];

    const waiverRecord: LateFeeWaiverRecord = {
      id: `waiver-${Date.now()}`,
      tenantId: sub.tenantId,
      subscriptionId: sub.id,
      memberId: sub.memberId,
      memberNameBn: sub.memberNameBn,
      monthYear: sub.monthYear,
      originalLateFee: oldLateFee,
      waivedAmount: actualWaiver,
      waivedReason: reason || 'প্রশাসনিক সিদ্ধান্তে মওকুফ',
      waivedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'সভাপতি / অ্যাডমিন',
      waivedAt: new Date().toISOString().split('T')[0]
    };
    this.lateFeeWaivers.unshift(waiverRecord);

    this.addAuditLog({
      tenantId: sub.tenantId,
      action: 'UPDATE',
      entity: 'SUBSCRIPTION',
      entityId: sub.id,
      descriptionBn: `সদস্য ${sub.memberNameBn} (${sub.memberCode}) এর ${sub.monthNameBn} মাসের বিলম্ব ফি ৳ ${actualWaiver.toLocaleString()} মওকুফ করা হয়েছে। কারণ: ${reason}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'সভাপতি',
      performedByRole: 'PRESIDENT'
    });

    this.save();
    return true;
  }

  applyOverdueLateFees(tenantId: string): { updatedCount: number; totalLateFeesAdded: number } {
    const policy = this.getSubscriptionPolicy(tenantId);
    if (!policy.lateFeeEnabled) return { updatedCount: 0, totalLateFeesAdded: 0 };

    const today = new Date().toISOString().split('T')[0];
    const dueDay = policy.dueDayOfMonth || 10;
    const graceDays = policy.gracePeriodDays || 5;

    let updatedCount = 0;
    let totalLateFeesAdded = 0;

    this.subscriptions.forEach(sub => {
      if (sub.tenantId === tenantId && sub.status !== 'PAID') {
        const cutoffDate = `${sub.monthYear}-${String(dueDay + graceDays).padStart(2, '0')}`;
        if (today > cutoffDate && sub.lateFee === 0) {
          const lateFee = policy.lateFeeType === 'PERCENTAGE'
            ? Math.round((sub.feeAmount * (policy.lateFeeAmount || 5)) / 100)
            : (policy.lateFeeAmount || 100);

          sub.lateFee = lateFee;
          sub.totalAmount = sub.feeAmount + lateFee;
          sub.dueAmount = sub.totalAmount - sub.paidAmount;
          sub.status = 'OVERDUE';
          sub.updatedAt = today;
          updatedCount++;
          totalLateFeesAdded += lateFee;
        }
      }
    });

    if (updatedCount > 0) {
      this.addAuditLog({
        tenantId,
        action: 'UPDATE',
        entity: 'SUBSCRIPTION',
        entityId: `late-fee-batch-${Date.now()}`,
        descriptionBn: `গ্রেস পিরিয়ড উত্তীর্ণ হওয়ায় মোট ${updatedCount} জন সদস্যের বকেয়া চাঁদায় লেট ফি ৳ ${totalLateFeesAdded.toLocaleString()} যুক্ত করা হয়েছে।`,
        performedBy: 'অটো লেট ফি শিডিউলার ইঞ্জিন',
        performedByRole: 'SYSTEM'
      });
      this.save();
    }

    return { updatedCount, totalLateFeesAdded };
  }


  recordBankDeposit(params: {
    tenantId: string;
    bankName: string;
    accountNumber: string;
    branchName: string;
    amount: number;
    slipNumber: string;
    depositSlipUrl?: string;
    notes?: string;
  }): BankDeposit {
    const today = new Date().toISOString().split('T')[0];
    const voucherNo = `VR-BK-${Date.now().toString().slice(-4)}`;
    const deposit: BankDeposit = {
      id: `bkdep-${Date.now()}`,
      tenantId: params.tenantId,
      bankName: params.bankName,
      accountNumber: params.accountNumber,
      branchName: params.branchName,
      depositDate: today,
      amount: params.amount,
      slipNumber: params.slipNumber,
      depositSlipUrl: params.depositSlipUrl,
      depositedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'কোষাধ্যক্ষ',
      approvedBy: 'ইঞ্জিঃ সাজ্জাদ হোসাইন (সভাপতি)',
      status: 'APPROVED',
      voucherNo,
      notes: params.notes,
      createdAt: today
    };
    this.bankDeposits.unshift(deposit);

    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo,
      type: 'CREDIT',
      category: 'ব্যাংক জমা / আমানত',
      amount: params.amount,
      descriptionBn: `${params.bankName} (${params.accountNumber}) এ জমা। স্লিপ নং: ${params.slipNumber}`,
      descriptionEn: `Bank deposit into ${params.bankName} (${params.accountNumber}). Slip: ${params.slipNumber}`,
      paidToOrReceivedFrom: params.bankName,
      paymentMethod: 'BANK',
      date: today,
      createdBy: this.currentUserId
    };
    this.vouchers.unshift(voucher);

    this.addEvent({
      tenantId: params.tenantId,
      type: 'BANK_DEPOSIT_ADDED',
      titleBn: 'নতুন ব্যাংক ডিপোজিট সফল',
      titleEn: 'New Bank Deposit Recorded',
      messageBn: `${params.bankName}-এ ৳ ${params.amount.toLocaleString()} জমা হয়েছে। স্লিপ নং: ${params.slipNumber}`,
      messageEn: `৳ ${params.amount.toLocaleString()} deposited to ${params.bankName}. Slip: ${params.slipNumber}`,
      amount: params.amount
    });

    this.save();
    return deposit;
  }

  getChartOfAccounts(tenantId: string): AccountHead[] {
    return this.chartOfAccounts.filter(c => c.tenantId === tenantId);
  }

  addAccountHead(headData: Omit<AccountHead, 'id'>): AccountHead {
    const newHead: AccountHead = {
      ...headData,
      id: `coa-${Date.now()}`
    };
    this.chartOfAccounts.push(newHead);
    this.addAuditLog({
      tenantId: headData.tenantId,
      action: 'CREATE',
      entity: 'SETTINGS',
      entityId: newHead.id,
      descriptionBn: `নতুন চার্ট অফ অ্যাকাউন্টস লেজার যুক্ত করা হয়েছে: [${newHead.code}] ${newHead.nameBn} (${newHead.group})`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ACCOUNTANT'
    });
    this.save();
    return newHead;
  }

  updateAccountHead(id: string, updates: Partial<AccountHead>): boolean {
    const head = this.chartOfAccounts.find(c => c.id === id);
    if (!head) return false;
    Object.assign(head, updates);
    this.addAuditLog({
      tenantId: head.tenantId,
      action: 'UPDATE',
      entity: 'SETTINGS',
      entityId: head.id,
      descriptionBn: `চার্ট অফ অ্যাকাউন্টস লেজার আপডেট করা হয়েছে: [${head.code}] ${head.nameBn}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন',
      performedByRole: 'ACCOUNTANT'
    });
    this.save();
    return true;
  }

  private updateHeadBalance(
    targetHead: AccountHead,
    type: VoucherType,
    amount: number
  ) {
    if (type === 'DEBIT') {
      const isDebitNormal = targetHead.group === 'EXPENSE' || targetHead.group === 'ASSET';
      targetHead.currentBalance += isDebitNormal ? amount : -amount;
    } else if (type === 'CREDIT') {
      const isCreditNormal = targetHead.group === 'INCOME' || targetHead.group === 'LIABILITY';
      targetHead.currentBalance += isCreditNormal ? amount : -amount;
    }
  }

  private updatePaymentHeadBalance(
    tenantId: string,
    paymentMethod: PaymentMethod,
    type: VoucherType,
    amount: number
  ) {
    if (paymentMethod !== 'CASH' && paymentMethod !== 'BANK') return;

    const head = paymentMethod === 'CASH'
      ? this.chartOfAccounts.find(c => c.tenantId === tenantId && c.code === '1010')
      : this.chartOfAccounts.find(c => c.tenantId === tenantId && (c.code === '1020' || c.code === '1021'));

    if (!head) return;

    if (type === 'CREDIT') {
      head.currentBalance += amount;
    } else if (type === 'DEBIT') {
      head.currentBalance = Math.max(0, head.currentBalance - amount);
    }
  }

  private updateVoucherAccountBalances(
    tenantId: string,
    type: VoucherType,
    accountHeadCode: string,
    paymentMethod: PaymentMethod,
    amount: number
  ) {
    const targetHead = this.chartOfAccounts.find(c => c.tenantId === tenantId && c.code === accountHeadCode);
    if (targetHead) {
      this.updateHeadBalance(targetHead, type, amount);
    }
    this.updatePaymentHeadBalance(tenantId, paymentMethod, type, amount);
  }

  createVoucher(params: {
    tenantId: string;
    type: VoucherType;
    category: string;
    accountHeadCode: string;
    accountHeadNameBn: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    descriptionBn: string;
    descriptionEn?: string;
    paidToOrReceivedFrom: string;
    paymentMethod: PaymentMethod;
    bankAccountName?: string;
    chequeOrTxNo?: string;
    date?: string;
    approvedBy?: string;
  }): Voucher {
    const today = params.date || new Date().toISOString().split('T')[0];
    let prefix = 'VR-JNL-';
    let typeNameBn = 'স্থানান্তর';
    if (params.type === 'DEBIT') {
      prefix = 'VR-EXP-';
      typeNameBn = 'খরচ';
    } else if (params.type === 'CREDIT') {
      prefix = 'VR-REC-';
      typeNameBn = 'জমা';
    }
    const voucherNo = `${prefix}${Date.now().toString().slice(-5)}`;

    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo,
      type: params.type,
      category: params.category,
      accountHeadCode: params.accountHeadCode,
      accountHeadNameBn: params.accountHeadNameBn,
      debitAccount: params.debitAccount,
      creditAccount: params.creditAccount,
      amount: params.amount,
      descriptionBn: params.descriptionBn,
      descriptionEn: params.descriptionEn || params.descriptionBn,
      paidToOrReceivedFrom: params.paidToOrReceivedFrom,
      paymentMethod: params.paymentMethod,
      bankAccountName: params.bankAccountName,
      chequeOrTxNo: params.chequeOrTxNo,
      date: today,
      createdBy: this.currentUserId,
      approvedBy: params.approvedBy || 'আলহাজ্ব রফিকুল ইসলাম (সভাপতি)',
      status: 'APPROVED'
    };

    this.vouchers.unshift(voucher);

    this.updateVoucherAccountBalances(
      params.tenantId,
      params.type,
      params.accountHeadCode,
      params.paymentMethod,
      params.amount
    );

    this.addEvent({
      tenantId: params.tenantId,
      type: 'NEW_VOUCHER_CREATED',
      titleBn: 'নতুন হিসাব ভাউচার সংরক্ষিত',
      titleEn: 'New Voucher Recorded',
      messageBn: `${typeNameBn} ভাউচার নং ${voucherNo}: ৳${params.amount.toLocaleString()} (${params.category})`,
      messageEn: `Voucher ${voucherNo}: ৳${params.amount.toLocaleString()}`,
      amount: params.amount
    });

    this.addAuditLog({
      tenantId: params.tenantId,
      action: 'CREATE',
      entity: 'EXPENSE',
      entityId: voucher.id,
      descriptionBn: `ভাউচার প্রস্তুত: ${voucher.voucherNo}, ধরন: ${voucher.type}, খাত: ${voucher.category}, টাকা: ৳${params.amount.toLocaleString()}, মাধ্যম: ${params.paymentMethod}`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'কোষাধ্যক্ষ / হিসাবরক্ষক',
      performedByRole: 'ACCOUNTANT'
    });

    this.save();
    return voucher;
  }

  approveVoucher(voucherId: string, approvedBy: string): boolean {
    const vch = this.vouchers.find(v => v.id === voucherId);
    if (!vch) return false;
    vch.status = 'APPROVED';
    vch.approvedBy = approvedBy;
    this.addEvent({
      tenantId: vch.tenantId,
      type: 'VOUCHER_APPROVED',
      titleBn: 'ভাউচার অনুমোদিত',
      titleEn: 'Voucher Approved',
      messageBn: `ভাউচার নং ${vch.voucherNo} (৳${vch.amount.toLocaleString()}) অনুমোদন করা হয়েছে।`,
      messageEn: `Voucher ${vch.voucherNo} approved.`
    });
    this.addAuditLog({
      tenantId: vch.tenantId,
      action: 'APPROVE',
      entity: 'EXPENSE',
      entityId: vch.id,
      descriptionBn: `ভাউচার অনুমোদন: ${vch.voucherNo}, অনুমোদক: ${approvedBy}`,
      performedBy: approvedBy,
      performedByRole: 'PRESIDENT'
    });
    this.save();
    return true;
  }

  rejectVoucher(voucherId: string, rejectedBy: string, reason: string): boolean {
    const vch = this.vouchers.find(v => v.id === voucherId);
    if (!vch) return false;
    vch.status = 'REJECTED';
    this.addAuditLog({
      tenantId: vch.tenantId,
      action: 'REJECT',
      entity: 'EXPENSE',
      entityId: vch.id,
      descriptionBn: `ভাউচার বাতিল করা হয়েছে: ${vch.voucherNo}, কারণ: ${reason}`,
      performedBy: rejectedBy,
      performedByRole: 'PRESIDENT'
    });
    this.save();
    return true;
  }

  getCashBook(tenantId: string, startDate?: string, endDate?: string) {
    const allVouchers = this.vouchers.filter(v => v.tenantId === tenantId && v.paymentMethod === 'CASH' && v.status !== 'REJECTED');
    const sorted = [...allVouchers].sort((a, b) => a.date.localeCompare(b.date));
    
    let openingCash = 125000;
    const filterStart = startDate || '';
    const filterEnd = endDate || '';

    if (filterStart) {
      sorted.forEach(v => {
        if (v.date < filterStart) {
          if (v.type === 'CREDIT') openingCash += v.amount;
          else if (v.type === 'DEBIT') openingCash -= v.amount;
        }
      });
    }

    const filtered = sorted.filter(v => {
      if (filterStart && v.date < filterStart) return false;
      if (filterEnd && v.date > filterEnd) return false;
      return true;
    });

    let runningCash = openingCash;
    const entries = filtered.map(v => {
      const receipt = v.type === 'CREDIT' ? v.amount : 0;
      const payment = v.type === 'DEBIT' ? v.amount : 0;
      runningCash = runningCash + receipt - payment;
      return {
        id: v.id,
        date: v.date,
        voucherNo: v.voucherNo,
        particulars: v.category,
        description: v.descriptionBn,
        party: v.paidToOrReceivedFrom,
        receipt,
        payment,
        balance: runningCash,
        type: v.type
      };
    });

    const totalReceipts = entries.reduce((s, e) => s + e.receipt, 0);
    const totalPayments = entries.reduce((s, e) => s + e.payment, 0);
    const closingCash = openingCash + totalReceipts - totalPayments;

    return {
      openingCash,
      totalReceipts,
      totalPayments,
      closingCash,
      entries: [...entries].reverse()
    };
  }

  getBankBook(tenantId: string, startDate?: string, endDate?: string) {
    const bankVouchers = this.vouchers.filter(v => v.tenantId === tenantId && (v.paymentMethod === 'BANK' || v.type === 'JOURNAL') && v.status !== 'REJECTED');
    const sorted = [...bankVouchers].sort((a, b) => a.date.localeCompare(b.date));

    let openingBank = 730000; // Combined initial bank balance (Sonali 450k + DBBL 280k)
    const filterStart = startDate || '';
    const filterEnd = endDate || '';

    if (filterStart) {
      sorted.forEach(v => {
        if (v.date < filterStart) {
          if (v.type === 'CREDIT' || (v.type === 'JOURNAL' && v.debitAccount?.includes('1020'))) openingBank += v.amount;
          else if (v.type === 'DEBIT') openingBank -= v.amount;
        }
      });
    }

    const filtered = sorted.filter(v => {
      if (filterStart && v.date < filterStart) return false;
      if (filterEnd && v.date > filterEnd) return false;
      return true;
    });

    let runningBank = openingBank;
    const entries = filtered.map(v => {
      const deposit = (v.type === 'CREDIT' || (v.type === 'JOURNAL' && v.debitAccount?.includes('1020'))) ? v.amount : 0;
      const withdraw = v.type === 'DEBIT' ? v.amount : 0;
      runningBank = runningBank + deposit - withdraw;
      return {
        id: v.id,
        date: v.date,
        voucherNo: v.voucherNo,
        bankName: v.bankAccountName || 'সোনালী ব্যাংক লিমিটেড',
        chequeOrTxNo: v.chequeOrTxNo || 'N/A',
        particulars: v.category,
        description: v.descriptionBn,
        deposit,
        withdraw,
        balance: runningBank
      };
    });

    const totalDeposits = entries.reduce((s, e) => s + e.deposit, 0);
    const totalWithdraws = entries.reduce((s, e) => s + e.withdraw, 0);
    const closingBank = openingBank + totalDeposits - totalWithdraws;

    return {
      openingBank,
      totalDeposits,
      totalWithdraws,
      closingBank,
      entries: [...entries].reverse()
    };
  }

  getGeneralLedger(tenantId: string, headCode: string) {
    const head = this.chartOfAccounts.find(c => c.tenantId === tenantId && c.code === headCode) || this.chartOfAccounts[0];
    const relatedVouchers = this.vouchers.filter(v => 
      v.tenantId === tenantId && 
      (v.accountHeadCode === headCode || v.debitAccount?.includes(headCode) || v.creditAccount?.includes(headCode))
    );

    let running = head ? head.openingBalance : 0;
    const entries: GeneralLedgerEntry[] = relatedVouchers.map(v => {
      const isDebit = v.type === 'DEBIT' || v.debitAccount?.includes(headCode);
      const debit = isDebit ? v.amount : 0;
      const credit = !isDebit ? v.amount : 0;
      
      if (head && (head.group === 'ASSET' || head.group === 'EXPENSE')) {
        running = running + debit - credit;
      } else {
        running = running + credit - debit;
      }

      return {
        id: v.id,
        date: v.date,
        voucherNo: v.voucherNo,
        particularsBn: v.descriptionBn || v.category,
        accountHeadCode: head ? head.code : headCode,
        debit,
        credit,
        balance: running,
        paymentMethod: v.paymentMethod
      };
    });

    return {
      head,
      openingBalance: head ? head.openingBalance : 0,
      closingBalance: running,
      entries: [...entries].reverse()
    };
  }

  getTrialBalance(tenantId: string): { items: TrialBalanceItem[]; totalDebit: number; totalCredit: number; isBalanced: boolean } {
    const heads = this.chartOfAccounts.filter(c => c.tenantId === tenantId);
    let totalDebit = 0;
    let totalCredit = 0;

    const items: TrialBalanceItem[] = heads.map(h => {
      let debit = 0;
      let credit = 0;
      if (h.group === 'ASSET' || h.group === 'EXPENSE') {
        debit = h.currentBalance;
        totalDebit += debit;
      } else {
        credit = h.currentBalance;
        totalCredit += credit;
      }

      return {
        code: h.code,
        nameBn: h.nameBn,
        nameEn: h.nameEn,
        group: h.group,
        debit,
        credit
      };
    });

    return {
      items,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 1
    };
  }

  getIncomeStatement(tenantId: string) {
    const heads = this.chartOfAccounts.filter(c => c.tenantId === tenantId);
    const incomeItems = heads.filter(h => h.group === 'INCOME');
    const expenseItems = heads.filter(h => h.group === 'EXPENSE');

    const totalIncome = incomeItems.reduce((s, h) => s + h.currentBalance, 0);
    const totalExpense = expenseItems.reduce((s, h) => s + h.currentBalance, 0);
    const netSurplus = totalIncome - totalExpense;

    return {
      incomeItems,
      expenseItems,
      totalIncome,
      totalExpense,
      netSurplus,
      isProfit: netSurplus >= 0
    };
  }

  getBalanceSheet(tenantId: string) {
    const heads = this.chartOfAccounts.filter(c => c.tenantId === tenantId);
    const assetItems = heads.filter(h => h.group === 'ASSET');
    const liabilityItems = heads.filter(h => h.group === 'LIABILITY');

    const totalAssets = assetItems.reduce((s, h) => s + h.currentBalance, 0);
    const totalLiabilities = liabilityItems.reduce((s, h) => s + h.currentBalance, 0);

    return {
      assetItems,
      liabilityItems,
      totalAssets,
      totalLiabilities,
      isBalanced: totalAssets === totalLiabilities
    };
  }

  publishNotice(noticeData: Omit<Notice, 'id' | 'viewCount'>): Notice {
    const newNotice: Notice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      viewCount: 1
    };
    this.notices.unshift(newNotice);
    this.addEvent({
      tenantId: noticeData.tenantId,
      type: 'NOTICE_PUBLISHED',
      titleBn: 'নতুন সাধারণ বিজ্ঞপ্তি প্রকাশিত',
      titleEn: 'New Notice Published',
      messageBn: noticeData.titleBn,
      messageEn: noticeData.titleEn
    });
    this.save();
    return newNotice;
  }

  uploadDocument(docData: Omit<SamityDocument, 'id'>): SamityDocument {
    const doc: SamityDocument = {
      ...docData,
      id: `doc-${Date.now()}`
    };
    this.documents.unshift(doc);
    this.save();
    return doc;
  }

  sendDueReminder(params: {
    tenantId: string;
    memberId: string;
    channel: 'SMS' | 'PUSH' | 'MANUAL';
  }): DueReminder | null {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) return null;

    const sub = this.subscriptions.find(s => s.memberId === params.memberId && s.status !== 'PAID');
    const dueAmount = sub?.dueAmount || 1500;
    const dueMonthBn = sub?.monthNameBn || 'অক্টোবর ২০২৬';

    const reminder: DueReminder = {
      id: `rem-${Date.now()}`,
      tenantId: params.tenantId,
      memberId: member.id,
      memberCode: member.memberCode,
      memberNameBn: member.nameBn,
      phone: member.phone,
      dueAmount,
      dueMonthBn,
      sentDate: new Date().toISOString().split('T')[0],
      channel: params.channel,
      status: 'DELIVERED'
    };
    this.reminders.unshift(reminder);

    this.addEvent({
      tenantId: params.tenantId,
      type: 'REMINDER_SENT',
      titleBn: 'বকেয়া তাগাদা SMS পাঠানো হয়েছে',
      titleEn: 'Due Reminder SMS Sent',
      messageBn: `${member.nameBn} (${member.phone})-কে ৳ ${dueAmount.toLocaleString()} বকেয়া পরিশোধের তাগাদা পাঠানো হয়েছে।`,
      messageEn: `Reminder sent to ${member.nameEn} for ৳ ${dueAmount.toLocaleString()}`,
      memberId: member.id,
      memberName: member.nameBn
    });

    this.save();
    return reminder;
  }

  updateLetterhead(config: LetterheadConfig) {
    this.letterhead = config;
    this.save();
  }

  updateSignatureSeal(config: Partial<SignatureSealConfig>) {
    this.signatureSeal = { ...this.signatureSeal, ...config };
    this.save();
  }

  updateVoucherPrefix(config: Partial<VoucherPrefixConfig>) {
    this.voucherPrefix = { ...this.voucherPrefix, ...config };
    this.save();
  }

  updateTenantProfile(tenantId: string, updates: Partial<Tenant>) {
    this.tenants = this.tenants.map(t => t.id === tenantId ? { ...t, ...updates } : t);
    this.save();
  }

  createSamity(samity: Tenant) {
    this.tenants.unshift(samity);
    
    this.addAuditLog({
      tenantId: samity.id,
      action: 'CREATE',
      entity: 'TENANT',
      entityId: samity.id,
      descriptionBn: `নতুন সমিতি তৈরি হয়েছে: ${samity.nameBn} (${samity.samityId || samity.id})`,
      performedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'সুপার অ্যাডমিন'
    });

    this.addEvent({
      tenantId: samity.id,
      type: 'SYSTEM_ANNOUNCEMENT',
      titleBn: 'নতুন সমিতি সফলভাবে নিবন্ধিত হয়েছে',
      titleEn: 'New Samity Registered',
      messageBn: `${samity.nameBn} সফলভাবে ক্লাউডে নিবন্ধিত হয়েছে।`,
      messageEn: `${samity.nameEn} registered in the cloud.`
    });

    this.save();
    return samity;
  }

  updateSamity(samityId: string, updates: Partial<Tenant>) {
    const prev = this.tenants.find(t => t.id === samityId);
    const updatedBy = this.users.find(u => u.id === this.currentUserId)?.nameBn || 'অ্যাডমিন';
    const timestamp = new Date().toISOString().split('T')[0];

    this.tenants = this.tenants.map(t => {
      if (t.id === samityId) {
        return { 
          ...t, 
          ...updates, 
          updatedAt: timestamp,
          updatedBy: updatedBy
        };
      }
      return t;
    });

    this.addAuditLog({
      tenantId: samityId,
      action: 'UPDATE',
      entity: 'TENANT',
      entityId: samityId,
      descriptionBn: `সমিতির তথ্য হালনাগাদ করা হয়েছে: ${updates.nameBn || prev?.nameBn || samityId}`,
      performedBy: updatedBy
    });

    this.save();
  }

  archiveSamity(samityId: string) {
    this.updateSamity(samityId, { samityStatus: 'ARCHIVED', status: 'SUSPENDED' });
  }

  recordBulkBankDeposits(items: BulkDepositItem[], approvedBy?: string) {
    const createdDeposits: BankDeposit[] = [];
    const timestamp = new Date().toISOString().split('T')[0];
    
    items.forEach((item, index) => {
      const deposit: BankDeposit = {
        id: `bkdep-bulk-${Date.now()}-${index}`,
        tenantId: this.currentTenantId,
        bankName: item.bankName,
        accountNumber: item.accountNumber,
        branchName: item.branchName,
        depositDate: item.depositDate || timestamp,
        amount: item.amount,
        slipNumber: item.slipNumber,
        depositedBy: item.depositorName,
        approvedBy: approvedBy || 'অ্যাডমিন',
        status: 'APPROVED',
        voucherNo: `${this.voucherPrefix.depositPrefix}${Date.now().toString().slice(-4)}-${index + 1}`,
        notes: `বাল্ক ব্যাংক জমা: ${item.category}`,
        createdAt: timestamp
      };
      this.bankDeposits.unshift(deposit);
      createdDeposits.push(deposit);
    });

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    this.addEvent({
      tenantId: this.currentTenantId,
      type: 'BANK_DEPOSIT_ADDED',
      titleBn: 'বাল্ক ব্যাংক ডিপোজিট সম্পন্ন',
      titleEn: 'Bulk Bank Deposit Recorded',
      messageBn: `মোট ${items.length}টি ব্যাংক ডিপোজিট স্লিপে সর্বমোট ৳ ${totalAmount.toLocaleString()} ব্যাংকে জমা রেকর্ড করা হয়েছে।`,
      messageEn: `Bulk bank deposit of ৳ ${totalAmount.toLocaleString()} recorded across ${items.length} slips.`,
      amount: totalAmount
    });

    this.save();
    return createdDeposits;
  }

  addAuditLog(entry: {
    tenantId?: string;
    action: import('@/types').AuditAction;
    entity: import('@/types').AuditEntity;
    entityId: string;
    descriptionBn: string;
    performedBy?: string;
    performedByRole?: string;
    ipAddress?: string;
  }) {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      tenantId: entry.tenantId || this.currentTenantId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      descriptionBn: entry.descriptionBn,
      performedBy: entry.performedBy || 'বর্তমান ব্যবহারকারী',
      performedByRole: entry.performedByRole || 'ADMIN',
      timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
      ipAddress: entry.ipAddress || '127.0.0.1'
    };
    this.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  updateApprovalStatus(id: string, status: ApprovalStatus, approvedBy: string, rejectionReason?: string) {
    const item = this.approvalItems.find(a => a.id === id);
    if (!item) return;

    item.status = status;
    item.approvedBy = approvedBy;
    item.actionDate = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });
    if (rejectionReason) item.rejectionReason = rejectionReason;

    // Sync with corresponding BankDeposit if applicable
    if (item.type === 'BANK_DEPOSIT') {
      const deposit = this.bankDeposits.find(d => d.id === item.referenceId);
      if (deposit) {
        deposit.status = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
        deposit.approvedBy = approvedBy;
      }
    }

    let entity: import('@/types').AuditEntity = 'EXPENSE';
    if (item.type === 'BANK_DEPOSIT') {
      entity = 'DEPOSIT';
    } else if (item.type === 'LOAN_APPLICATION') {
      entity = 'LOAN';
    }

    const actionText = status === 'APPROVED'
      ? 'অনুমোদন করা হয়েছে'
      : `প্রত্যাখ্যান করা হয়েছে (${rejectionReason || ''})`;
    const descriptionBn = `${item.titleBn} - ${actionText}`;

    this.addAuditLog({
      tenantId: item.tenantId,
      action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
      entity,
      entityId: item.referenceId,
      descriptionBn,
      performedBy: approvedBy,
      performedByRole: 'APPROVER'
    });

    this.save();
  }

  addApprovalItem(item: Omit<ApprovalItem, 'id' | 'requestedAt'>) {
    const newItem: ApprovalItem = {
      ...item,
      id: `appr-${Date.now()}`,
      requestedAt: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })
    };
    this.approvalItems.unshift(newItem);
    this.save();
    return newItem;
  }

  addGeneratedDocument(doc: Omit<GeneratedDocument, 'id'>) {
    const newDoc: GeneratedDocument = {
      ...doc,
      id: `gdoc-${Date.now()}`
    };
    this.generatedDocs.unshift(newDoc);
    
    this.addAuditLog({
      tenantId: doc.tenantId,
      action: 'CREATE',
      entity: 'DOCUMENT',
      entityId: newDoc.id,
      descriptionBn: `অফিসিয়াল ডকুমেন্ট জেনারেট করা হয়েছে: ${doc.titleBn} (রেফারেন্স: ${doc.referenceNo})`,
      performedBy: doc.issuedBy,
      performedByRole: 'OFFICER'
    });

    this.save();
    return newDoc;
  }

  exportFullBackup(): string {
    const backupData = {
      version: APP_VERSION.replace(/^v/, ''),
      exportedAt: new Date().toISOString(),
      tenantId: this.currentTenantId,
      tenants: this.tenants.filter(t => t.id === this.currentTenantId),
      members: this.members.filter(m => m.tenantId === this.currentTenantId),
      savingsAccounts: this.savingsAccounts.filter(s => s.tenantId === this.currentTenantId),
      savingsPolicies: this.savingsPolicies,
      savingsTransactions: this.savingsTransactions.filter(t => t.tenantId === this.currentTenantId),
      loans: this.loans.filter(l => l.tenantId === this.currentTenantId),
      loanPolicies: this.loanPolicies,
      vouchers: this.vouchers.filter(v => v.tenantId === this.currentTenantId),
      chartOfAccounts: this.chartOfAccounts.filter(c => c.tenantId === this.currentTenantId),
      subscriptions: this.subscriptions.filter(s => s.tenantId === this.currentTenantId),
      bankDeposits: this.bankDeposits.filter(b => b.tenantId === this.currentTenantId),
      receipts: this.receipts.filter(r => r.tenantId === this.currentTenantId),
      notices: this.notices.filter(n => n.tenantId === this.currentTenantId),
      letterhead: this.letterhead,
      signatureSeal: this.signatureSeal,
      voucherPrefix: this.voucherPrefix,
      auditLogs: this.auditLogs.filter(a => a.tenantId === this.currentTenantId),
      approvalItems: this.approvalItems.filter(a => a.tenantId === this.currentTenantId),
      generatedDocs: this.generatedDocs.filter(g => g.tenantId === this.currentTenantId)
    };

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'EXPORT',
      entity: 'BACKUP',
      entityId: `backup-${Date.now()}`,
      descriptionBn: 'সমিতির পূর্ণাঙ্গ ডাটাবেজ ব্যাকআপ (JSON) এক্সপোর্ট সম্পন্ন হয়েছে',
      performedBy: 'অ্যাডমিন ইউজার',
      performedByRole: 'OWNER'
    });

    return JSON.stringify(backupData, null, 2);
  }

  private applyBackupCollections(data: Record<string, unknown>) {
    const backupKeys: StoreCollectionKey[] = [
      'members', 'savingsAccounts', 'savingsPolicies', 'savingsTransactions',
      'loans', 'loanPolicies', 'vouchers', 'chartOfAccounts', 'subscriptions',
      'bankDeposits', 'receipts', 'notices', 'letterhead', 'signatureSeal',
      'voucherPrefix', 'approvalItems', 'generatedDocs'
    ];

    for (const key of backupKeys) {
      if (data[key] !== undefined) {
        (this as unknown as Record<StoreCollectionKey, unknown>)[key] = data[key];
      }
    }
  }

  restoreFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.tenantId || !data.members) {
        return { success: false, message: 'অবৈধ ব্যাকআপ ফাইল। প্রয়োজনীয় ডাটা ফিল্ড অনুপস্থিত।' };
      }

      this.applyBackupCollections(data);

      this.addAuditLog({
        tenantId: this.currentTenantId,
        action: 'RESTORE',
        entity: 'BACKUP',
        entityId: `restore-${Date.now()}`,
        descriptionBn: `ব্যাকআপ ফাইল হইতে সফলভাবে রিস্টোর সম্পন্ন (সদস্য: ${data.members?.length || 0} জন, ভাউচার: ${data.vouchers?.length || 0}টি)`,
        performedBy: 'অ্যাডমিন ইউজার',
        performedByRole: 'OWNER'
      });

      this.save();
      return { success: true, message: 'সফলভাবে ব্যাকআপ থেকে ডাটা রিস্টোর করা হয়েছে।' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, message: `রিস্টোর ব্যর্থ: ${message}` };
    }
  }

  exportTableToCsv(tableName: 'members' | 'deposits' | 'receipts' | 'vouchers' | 'audit' | 'loans' | 'defaulters' | 'collection_sheet' | 'trial_balance'): string {
    const tenantId = this.currentTenantId;
    if (tableName === 'members') {
      const rows = this.members.filter(m => m.tenantId === tenantId);
      const headers = ['MemberCode', 'NameBn', 'NameEn', 'Phone', 'NID', 'AdmissionDate', 'Status', 'SavingsBalance'];
      const lines = rows.map(r => `"${r.memberCode}","${r.nameBn}","${r.nameEn}","${r.phone}","${r.nid}","${r.admissionDate}","${r.status}","${r.savingsBalance}"`);
      return [headers.join(','), ...lines].join('\n');
    } else if (tableName === 'deposits') {
      const rows = this.bankDeposits.filter(b => b.tenantId === tenantId);
      const headers = ['BankName', 'AccountNumber', 'Branch', 'SlipNo', 'Date', 'Amount', 'Status', 'Depositor'];
      const lines = rows.map(r => `"${r.bankName}","${r.accountNumber}","${r.branchName}","${r.slipNumber}","${r.depositDate}","${r.amount}","${r.status}","${r.depositedBy}"`);
      return [headers.join(','), ...lines].join('\n');
    } else if (tableName === 'receipts') {
      const rows = this.receipts.filter(r => r.tenantId === tenantId);
      const headers = ['ReceiptNo', 'Type', 'MemberCode', 'MemberName', 'Phone', 'Amount', 'Date', 'PaymentMethod', 'Collector'];
      const lines = rows.map(r => `"${r.receiptNo}","${r.receiptType}","${r.memberCode}","${r.memberNameBn}","${r.phone}","${r.amount}","${r.date}","${r.paymentMethod}","${r.collectorNameBn}"`);
      return [headers.join(','), ...lines].join('\n');
    } else if (tableName === 'vouchers') {
      const rows = this.vouchers.filter(v => v.tenantId === tenantId);
      const headers = ['VoucherNo', 'Type', 'Category', 'Amount', 'DescriptionBn', 'Party', 'Date', 'PaymentMethod'];
      const lines = rows.map(r => `"${r.voucherNo}","${r.type}","${r.category}","${r.amount}","${r.descriptionBn}","${r.paidToOrReceivedFrom}","${r.date}","${r.paymentMethod}"`);
      return [headers.join(','), ...lines].join('\n');
    } else if (tableName === 'loans') {
      const rows = this.loans.filter(l => l.tenantId === tenantId);
      const headers = ['LoanNumber', 'MemberCode', 'MemberName', 'Principal', 'InterestRate', 'TotalPayable', 'Paid', 'Outstanding', 'Status', 'DisbursementDate'];
      const lines = rows.map(l => {
        const mem = this.members.find(m => m.id === l.memberId);
        return `"${l.loanNumber}","${mem?.memberCode || ''}","${mem?.nameBn || ''}","${l.principalAmount}","${l.interestRatePercent}%","${l.totalPayable}","${l.totalPaid}","${l.outstandingBalance}","${l.status}","${l.disbursementDate || ''}"`;
      });
      return [headers.join(','), ...lines].join('\n');
    } else if (tableName === 'defaulters') {
      const rows = this.loans.filter(l => l.tenantId === tenantId && (l.status === 'DEFAULTED' || l.installments.some(ins => ins.status === 'OVERDUE')));
      const headers = ['LoanNumber', 'MemberCode', 'MemberName', 'Phone', 'OverdueInstallments', 'OverdueAmount', 'TotalOutstanding', 'Guarantor', 'GuarantorPhone'];
      const lines = rows.map(l => {
        const mem = this.members.find(m => m.id === l.memberId);
        const overdueInst = l.installments.filter(ins => ins.status === 'OVERDUE');
        const overdueAmount = overdueInst.reduce((sum, ins) => sum + (ins.totalDue - (ins.paidAmount || 0)), 0);
        return `"${l.loanNumber}","${mem?.memberCode || ''}","${mem?.nameBn || ''}","${mem?.phone || ''}","${overdueInst.length}","${overdueAmount}","${l.outstandingBalance}","${l.guarantor1?.name || ''}","${l.guarantor1?.phone || ''}"`;
      });
      return [headers.join(','), ...lines].join('\n');
    } else if (tableName === 'collection_sheet') {
      const rows = this.members.filter(m => m.tenantId === tenantId);
      const headers = ['MemberCode', 'NameBn', 'Phone', 'SavingsBalance', 'RegularSavingsCollected', 'LoanEmiCollected', 'TotalCollected', 'Signature'];
      const lines = rows.map(m => `"${m.memberCode}","${m.nameBn}","${m.phone}","${m.savingsBalance}","2000","${m.loanOutstanding > 0 ? '9166' : '0'}","${m.loanOutstanding > 0 ? '11166' : '2000'}",""`);
      return [headers.join(','), ...lines].join('\n');
    } else if (tableName === 'trial_balance') {
      const tb = this.getTrialBalance(tenantId);
      const headers = ['Code', 'AccountHeadBn', 'AccountHeadEn', 'Group', 'Debit', 'Credit'];
      const lines = tb.items.map(i => `"${i.code}","${i.nameBn}","${i.nameEn}","${i.group}","${i.debit}","${i.credit}"`);
      lines.push(`"TOTAL","মোট","Total","","${tb.totalDebit}","${tb.totalCredit}"`);
      return [headers.join(','), ...lines].join('\n');
    } else {
      const rows = this.auditLogs.filter(a => a.tenantId === tenantId);
      const headers = ['ID', 'Action', 'Entity', 'EntityID', 'Description', 'PerformedBy', 'Role', 'Timestamp', 'IP'];
      const lines = rows.map(r => `"${r.id}","${r.action}","${r.entity}","${r.entityId}","${r.descriptionBn}","${r.performedBy}","${r.performedByRole}","${r.timestamp}","${r.ipAddress || ''}"`);
      return [headers.join(','), ...lines].join('\n');
    }
  }

  logReportAction(reportNameBn: string, format: string) {
    const user = this.users.find(u => u.id === this.currentUserId);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'EXPORT',
      entity: 'REPORT',
      entityId: `rep-${Date.now()}`,
      descriptionBn: `${reportNameBn} (${format.toUpperCase()} ফরম্যাটে) জেনারেট/ডাউনলোড করা হয়েছে`,
      performedBy: user?.nameBn || 'হিসাবরক্ষক (অ্যাডমিন)',
      performedByRole: user?.role || 'ADMIN'
    });
  }

  updateGatewayConfig(config: Partial<CommunicationGatewayConfig>) {
    this.gatewayConfig = { ...this.gatewayConfig, ...config };
    this.save();
  }

  updateSchedulerConfig(config: Partial<AutoSchedulerConfig>) {
    this.schedulerConfig = { ...this.schedulerConfig, ...config };
    this.save();
  }

  sendOmnichannelReminder(params: {
    memberId: string;
    channel: ReminderChannel;
    customMessage?: string;
  }): { success: boolean; message: string; externalUrl?: string } {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) return { success: false, message: 'সদস্য খুঁজে পাওয়া যায়নি।' };

    const sub = this.subscriptions.find(s => s.memberId === params.memberId && s.status !== 'PAID');
    const dueAmount = sub?.dueAmount || 1500;
    const dueMonthBn = sub?.monthNameBn || 'অক্টোবর ২০২৬';

    // Format message
    let messageText = params.customMessage || this.schedulerConfig.messageTemplateBn;
    messageText = messageText
      .replace('{MEMBER_NAME}', member.nameBn)
      .replace('{SAMITY_NAME}', this.letterhead.samityNameBn)
      .replace('{MONTH_NAME}', dueMonthBn)
      .replace('{DUE_AMOUNT}', dueAmount.toLocaleString())
      .replace('{PORTAL_URL}', `${window?.location?.origin || 'https://samitypro.vercel.app'}`);

    let externalUrl: string | undefined;
    let deliveryNote = 'সফলভাবে প্রেরিত';

    if (params.channel === 'WHATSAPP') {
      const cleanPhone = member.phone.replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
      externalUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(messageText)}`;
      deliveryNote = this.gatewayConfig.whatsappMode === 'OPEN_WA' 
        ? `Open-WA বট সার্ভার (${this.gatewayConfig.openWaServerUrl}) মারফত প্রেরিত`
        : 'সরাসরি WhatsApp Click-to-Chat লিংক জেনারেট করা হয়েছে';
    } else if (params.channel === 'SMS') {
      if (this.gatewayConfig.smsSimBalanceCount > 0) {
        this.gatewayConfig.smsSimBalanceCount -= 1;
      }
      deliveryNote = `${this.gatewayConfig.smsProvider} অ্যান্ড্রয়েড গেটওয়ে (${member.phone})-এ প্রেরিত`;
    } else if (params.channel === 'TELEGRAM') {
      deliveryNote = `টেলিগ্রাম বট (${this.gatewayConfig.telegramBotToken.slice(0, 10)}...) চ্যানেল @${this.gatewayConfig.telegramChatId}`;
    } else if (params.channel === 'MESSENGER') {
      deliveryNote = `Botpress এআই ওয়েবহুক (${this.gatewayConfig.botpressWebhookUrl}) মারফত মেম্বার কোড ${member.memberCode}`;
    }

    const reminderId = `rem-${Date.now()}-${this.reminders.length + 1}`;
    const reminder: DueReminder = {
      id: reminderId,
      tenantId: this.currentTenantId,
      memberId: member.id,
      memberCode: member.memberCode,
      memberNameBn: member.nameBn,
      phone: member.phone,
      dueAmount,
      dueMonthBn,
      sentDate: new Date().toISOString().split('T')[0],
      channel: params.channel,
      status: 'DELIVERED',
      deliveryNote
    };

    this.reminders.unshift(reminder);

    this.addEvent({
      tenantId: this.currentTenantId,
      type: 'REMINDER_SENT',
      titleBn: `${params.channel} তাগাদা বার্তা প্রেরিত`,
      titleEn: `Due Reminder via ${params.channel}`,
      messageBn: `${member.nameBn} (${member.phone})-কে ${params.channel} মাধ্যমে ৳ ${dueAmount.toLocaleString()} বকেয়া তাগাদা পাঠানো হয়েছে।`,
      messageEn: `Reminder sent to ${member.nameEn} via ${params.channel} for ৳ ${dueAmount.toLocaleString()}`,
      amount: dueAmount
    });

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'RECEIPT',
      entityId: reminder.id,
      descriptionBn: `বকেয়া তাগাদা নোটিফিকেশন প্রেরিত: ${params.channel} -> ${member.nameBn} (${deliveryNote})`,
      performedBy: 'অ্যাডমিন ইউজার',
      performedByRole: 'COMMUNICATION_OFFICER'
    });

    this.save();
    return { success: true, message: `সফলভাবে ${params.channel} তাগাদা বার্তা পাঠানো হয়েছে!`, externalUrl };
  }

  sendBulkOmnichannelReminders(channel: ReminderChannel): { totalSent: number; channel: ReminderChannel } {
    const unpaidSubs = this.subscriptions.filter(s => s.tenantId === this.currentTenantId && s.status !== 'PAID');
    let count = 0;

    unpaidSubs.forEach(sub => {
      this.sendOmnichannelReminder({
        memberId: sub.memberId,
        channel
      });
      count++;
    });

    return { totalSent: count, channel };
  }

  queueOfflineAction(action: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'retryCount' | 'status'>) {
    const item: OfflineQueueItem = {
      ...action,
      id: `offq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING'
    };
    this.offlineQueue.unshift(item);
    this.save();
    return item;
  }

  async syncOfflineQueue(): Promise<{ syncedCount: number; failedCount: number }> {
    await Promise.resolve();
    const pendingItems = this.offlineQueue.filter(i => i.status === 'PENDING' || i.status === 'FAILED');
    let synced = 0;

    for (const item of pendingItems) {
      item.status = 'SYNCING';
      // In production, execute remote API call
      item.status = 'PENDING';
      synced++;
    }

    // Mark all as synced and empty queue
    this.offlineQueue = [];

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'BACKUP',
      entityId: `sync-${Date.now()}`,
      descriptionBn: `অফলাইন কিউ থেকে মোট ${synced}টি ডাটা রেকর্ড ক্লাউড ডাটাবেজে সফলভাবে সিঙ্ক সম্পন্ন হয়েছে।`,
      performedBy: 'মোবাইল সিঙ্ক ইঞ্জিন',
      performedByRole: 'SYSTEM'
    });

    this.save();
    return { syncedCount: synced, failedCount: 0 };
  }

  clearOfflineQueue() {
    this.offlineQueue = [];
    this.save();
  }

  createTenant(tenant: Tenant) {
    this.tenants.push(tenant);
    this.save();
  }

  // ==========================================
  // MODULE 7: MEETINGS, MINUTES & NOTICES
  // ==========================================

  createMeeting(meetingData: {
    tenantId: string;
    meetingNo?: string;
    titleBn: string;
    titleEn?: string;
    type: MeetingType;
    date: string;
    time: string;
    venue: string;
    chairpersonNameBn?: string;
    recordingSecretaryNameBn?: string;
    targetAudience?: 'ALL_MEMBERS' | 'EXECUTIVE_COMMITTEE' | 'GENERAL_BODY';
    quorumRequired?: number;
    agenda?: (string | MeetingAgendaItem)[];
    publishNoticeImmediately?: boolean;
  }) {
    const meetingId = `mtg-${Date.now()}`;
    const tenantMeetings = this.meetings.filter(m => m.tenantId === meetingData.tenantId);
    const meetingNo = meetingData.meetingNo || `${meetingData.type}-${new Date().getFullYear()}/${tenantMeetings.length + 1}`;

    const initialAgenda: (string | MeetingAgendaItem)[] = (meetingData.agenda && meetingData.agenda.length > 0)
      ? meetingData.agenda.map((ag, idx) => {
          if (typeof ag === 'string') {
            return {
              id: `ag-${Date.now()}-${idx + 1}`,
              serial: idx + 1,
              titleBn: ag,
              status: 'PENDING' as const
            };
          }
          return ag;
        })
      : [
          { id: `ag-${Date.now()}-1`, serial: 1, titleBn: 'বিগত সভার কার্যবিবরণী পাঠ ও অনুমোদন', status: 'PENDING' },
          { id: `ag-${Date.now()}-2`, serial: 2, titleBn: 'সমিতির চলমান আর্থিক কার্যক্রম পর্যালোচনা', status: 'PENDING' },
          { id: `ag-${Date.now()}-3`, serial: 3, titleBn: 'বিবিধ ও সমাপনী বক্তব্য', status: 'PENDING' }
        ];

    // Seed default attendees from members of this tenant
    const getRoleBn = (category: string) => {
      if (category === 'ADVISORY') return 'উপদেষ্টা';
      if (category === 'EXECUTIVE') return 'কার্যনির্বাহী সদস্য';
      return 'সাধারণ সদস্য';
    };

    const tenantMembers = this.members.filter(m => m.tenantId === meetingData.tenantId && m.status === 'ACTIVE');
    const attendees: MeetingAttendee[] = tenantMembers.slice(0, 20).map(m => ({
      memberId: m.id,
      memberCode: m.memberCode,
      nameBn: m.nameBn,
      roleBn: getRoleBn(m.category),
      phone: m.phone,
      isPresent: false
    }));

    const newMeeting: Meeting = {
      id: meetingId,
      tenantId: meetingData.tenantId,
      meetingNo,
      titleBn: meetingData.titleBn,
      titleEn: meetingData.titleEn || meetingData.titleBn,
      type: meetingData.type,
      date: meetingData.date,
      time: meetingData.time,
      venue: meetingData.venue,
      chairpersonNameBn: meetingData.chairpersonNameBn || 'সভাপতি',
      recordingSecretaryNameBn: meetingData.recordingSecretaryNameBn || 'সাধারণ সম্পাদক',
      targetAudience: meetingData.targetAudience || 'ALL_MEMBERS',
      quorumRequired: meetingData.quorumRequired || 10,
      quorumPresent: 0,
      isQuorumMet: false,
      attendees,
      agenda: initialAgenda,
      resolutions: [],
      totalAttendees: 0,
      status: 'SCHEDULED',
      noticePublished: false,
      createdAt: new Date().toISOString(),
      syncVersion: 1,
      isSynced: true
    };

    if (meetingData.publishNoticeImmediately) {
      const noticeId = `not-mtg-${Date.now()}`;
      newMeeting.noticePublished = true;
      newMeeting.noticeId = noticeId;
      
      const agendasText = initialAgenda.map((a, i) => `${i + 1}. ${typeof a === 'string' ? a : a.titleBn}`).join('\n');
      this.notices.unshift({
        id: noticeId,
        tenantId: meetingData.tenantId,
        titleBn: `সভার নোটিশ: ${meetingData.titleBn}`,
        titleEn: `Meeting Notice: ${meetingData.titleEn || meetingData.titleBn}`,
        contentBn: `এতদ্বারা সমিতির সম্মানিত সদস্যদের জানানো যাচ্ছে যে, আগামী ${meetingData.date} তারিখ ${meetingData.time} এ ${meetingData.venue} স্থানে সমিতির ${meetingData.titleBn} অনুষ্ঠিত হবে। যথাসময়ে উপস্থিত থাকার জন্য অনুরোধ করা হলো।\n\nআলোচ্যসূচি:\n${agendasText}`,
        contentEn: `Notice is hereby given that the ${meetingData.titleEn || meetingData.titleBn} will be held on ${meetingData.date} at ${meetingData.time} in ${meetingData.venue}.`,
        category: meetingData.type === 'AGM' ? 'AGM' : 'MEETING',
        priority: 'HIGH',
        publishedDate: new Date().toISOString().split('T')[0],
        publishedBy: this.currentUserId,
        publisherNameBn: 'অফিস প্রশাসন',
        isPinned: true,
        viewCount: 1
      });
    }

    this.meetings.unshift(newMeeting);

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: meetingData.tenantId,
      type: 'MEETING_SCHEDULED',
      titleBn: 'নতুন সভা আহ্বান করা হয়েছে',
      titleEn: 'New Meeting Scheduled',
      messageBn: `${newMeeting.titleBn} আগামী ${newMeeting.date} তারিখের জন্য নির্ধারিত হয়েছে।`,
      messageEn: `${newMeeting.titleEn} scheduled on ${newMeeting.date}.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.addAuditLog({
      tenantId: meetingData.tenantId,
      action: 'CREATE',
      entity: 'MEETING',
      entityId: meetingId,
      descriptionBn: `নতুন সভা '${newMeeting.titleBn}' (${meetingNo}) সফলভাবে সিস্টেমে যুক্ত করা হয়েছে।`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newMeeting;
  }

  updateMeeting(meetingId: string, updates: Partial<Meeting>) {
    const idx = this.meetings.findIndex(m => m.id === meetingId);
    if (idx === -1) return null;

    this.meetings[idx] = {
      ...this.meetings[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentUserId
    };

    this.addAuditLog({
      tenantId: this.meetings[idx].tenantId,
      action: 'UPDATE',
      entity: 'MEETING',
      entityId: meetingId,
      descriptionBn: `সভা '${this.meetings[idx].titleBn}' এর তথ্য আপডেট করা হয়েছে।`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return this.meetings[idx];
  }

  softDeleteMeeting(meetingId: string, reason?: string) {
    const idx = this.meetings.findIndex(m => m.id === meetingId);
    if (idx === -1) return false;

    this.meetings[idx].deletedAt = new Date().toISOString();
    this.meetings[idx].deletedBy = this.currentUserId;
    this.meetings[idx].status = 'CANCELLED';

    this.addAuditLog({
      tenantId: this.meetings[idx].tenantId,
      action: 'DELETE',
      entity: 'MEETING',
      entityId: meetingId,
      descriptionBn: `সভা '${this.meetings[idx].titleBn}' বাতিল/মুছে ফেলা হয়েছে। কারণ: ${reason || 'প্রশাসনিক সিদ্ধান্ত'}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return true;
  }

  startMeeting(meetingId: string) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    meeting.status = 'IN_PROGRESS';
    meeting.updatedAt = new Date().toISOString();

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: meeting.tenantId,
      type: 'SYSTEM_ANNOUNCEMENT',
      titleBn: 'সভা শুরু হয়েছে',
      titleEn: 'Meeting Started',
      messageBn: `'${meeting.titleBn}' এর কার্যক্রম শুরু হয়েছে।`,
      messageEn: `${meeting.titleEn} is now in progress.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.save();
    return meeting;
  }

  completeMeeting(meetingId: string, data: { minutesTextBn?: string; resolutions?: MeetingResolution[]; minutesApprovedBy?: string }) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    meeting.status = 'COMPLETED';
    if (data.minutesTextBn) meeting.minutesTextBn = data.minutesTextBn;
    if (data.resolutions && data.resolutions.length > 0) meeting.resolutions = data.resolutions;
    meeting.minutesApprovedBy = data.minutesApprovedBy || meeting.chairpersonNameBn || 'সভাপতি';
    meeting.minutesApprovedDate = new Date().toISOString().split('T')[0];
    meeting.updatedAt = new Date().toISOString();

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: meeting.tenantId,
      type: 'MEETING_COMPLETED',
      titleBn: 'সভা সফলভাবে সম্পন্ন হয়েছে',
      titleEn: 'Meeting Completed',
      messageBn: `'${meeting.titleBn}' এর কার্যবিবরণী ও রেজোলিউশন অনুমোদিত হয়েছে।`,
      messageEn: `${meeting.titleEn} minutes and resolutions finalized.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.addAuditLog({
      tenantId: meeting.tenantId,
      action: 'UPDATE',
      entity: 'MEETING',
      entityId: meetingId,
      descriptionBn: `সভা '${meeting.titleBn}' সমাপ্ত ঘোষণা ও রেজোলিউশন রেজিস্টার সম্পন্ন হয়েছে।`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return meeting;
  }

  recordAttendance(meetingId: string, updatedAttendees: MeetingAttendee[]) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    meeting.attendees = updatedAttendees;
    const presentCount = updatedAttendees.filter(a => a.isPresent).length;
    meeting.totalAttendees = presentCount;
    meeting.quorumPresent = presentCount;
    meeting.isQuorumMet = meeting.quorumRequired ? presentCount >= meeting.quorumRequired : true;
    meeting.updatedAt = new Date().toISOString();

    this.save();
    return meeting;
  }

  addAgendaItem(meetingId: string, item: { titleBn: string; discussionBn?: string; proposerNameBn?: string; seconderNameBn?: string }) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    const existingCount = meeting.agenda.length;
    const newItem: MeetingAgendaItem = {
      id: `ag-${Date.now()}`,
      serial: existingCount + 1,
      titleBn: item.titleBn,
      discussionBn: item.discussionBn || '',
      proposerNameBn: item.proposerNameBn || '',
      seconderNameBn: item.seconderNameBn || '',
      status: 'PENDING'
    };

    meeting.agenda.push(newItem);
    meeting.updatedAt = new Date().toISOString();

    this.save();
    return newItem;
  }

  updateAgendaItem(meetingId: string, agendaId: string, updates: Partial<MeetingAgendaItem>) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    const idx = meeting.agenda.findIndex(a => typeof a !== 'string' && a.id === agendaId);
    if (idx !== -1 && typeof meeting.agenda[idx] !== 'string') {
      meeting.agenda[idx] = {
        ...(meeting.agenda[idx] as MeetingAgendaItem),
        ...updates
      };
      meeting.updatedAt = new Date().toISOString();
      this.save();
    }
    return meeting;
  }

  addResolution(meetingId: string, resolutionData: {
    agendaSerial?: number;
    subjectBn: string;
    detailsBn: string;
    proposerBn?: string;
    seconderBn?: string;
    votingResult?: 'UNANIMOUS' | 'MAJORITY' | 'VETO';
    effectiveDate?: string;
  }) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    const resCount = meeting.resolutions.length + 1;
    const resolutionNo = `সিদ্ধান্ত ${resCount < 10 ? '০' : ''}${resCount}/${new Date().getFullYear()}`;

    const newRes: MeetingResolution = {
      id: `res-${Date.now()}`,
      resolutionNo,
      agendaSerial: resolutionData.agendaSerial || 1,
      subjectBn: resolutionData.subjectBn,
      detailsBn: resolutionData.detailsBn,
      proposerBn: resolutionData.proposerBn || '',
      seconderBn: resolutionData.seconderBn || '',
      votingResult: resolutionData.votingResult || 'UNANIMOUS',
      effectiveDate: resolutionData.effectiveDate || new Date().toISOString().split('T')[0]
    };

    meeting.resolutions.push(newRes);
    meeting.updatedAt = new Date().toISOString();

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: meeting.tenantId,
      type: 'RESOLUTION_PASSED',
      titleBn: `নতুন সিদ্ধান্ত গৃহীত: ${resolutionNo}`,
      titleEn: `Resolution Passed: ${resolutionNo}`,
      messageBn: `${newRes.subjectBn} সংক্রান্ত প্রস্তাব সর্বসম্মতিক্রমে পাস হয়েছে।`,
      messageEn: `Resolution ${resolutionNo} on ${newRes.subjectBn} approved.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.addAuditLog({
      tenantId: meeting.tenantId,
      action: 'CREATE',
      entity: 'MEETING',
      entityId: newRes.id,
      descriptionBn: `সভা '${meeting.titleBn}' এ নতুন ${resolutionNo} গৃহীত হয়েছে: ${newRes.subjectBn}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newRes;
  }

  publishMeetingNotice(meetingId: string) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    const noticeId = `not-mtg-${Date.now()}`;
    meeting.noticePublished = true;
    meeting.noticeId = noticeId;

    const agendasText = meeting.agenda.map((a, i) => `${i + 1}. ${typeof a === 'string' ? a : a.titleBn}`).join('\n');
    const newNotice: Notice = {
      id: noticeId,
      tenantId: meeting.tenantId,
      titleBn: `সভার জরুরি নোটিশ: ${meeting.titleBn}`,
      titleEn: `Notice: ${meeting.titleEn}`,
      contentBn: `এতদ্বারা সমিতির সম্মানিত সদস্যগণের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ${meeting.date} তারিখ ${meeting.time} এ সমিতির ${meeting.venue} স্থানে ${meeting.titleBn} অনুষ্ঠিত হবে।\n\nসভার আলোচ্যসূচি:\n${agendasText}\n\nউক্ত সভায় আপনার উপস্থিতি ঐকান্তিকভাবে কামনা করছি।`,
      contentEn: `Meeting notice for ${meeting.titleEn} scheduled on ${meeting.date} at ${meeting.time}.`,
      category: meeting.type === 'AGM' ? 'AGM' : 'MEETING',
      priority: 'HIGH',
      publishedDate: new Date().toISOString().split('T')[0],
      publishedBy: this.currentUserId,
      publisherNameBn: 'সমিতি প্রশাসন',
      isPinned: true,
      viewCount: 1
    };

    this.notices.unshift(newNotice);

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: meeting.tenantId,
      type: 'NOTICE_PUBLISHED',
      titleBn: 'নতুন নোটিশ জারি হয়েছে',
      titleEn: 'Notice Published',
      messageBn: `${newNotice.titleBn} নোটিশ বোর্ডে প্রকাশ করা হয়েছে।`,
      messageEn: `Notice published on notice board.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.save();
    return newNotice;
  }

  pinNotice(noticeId: string, isPinned: boolean) {
    const notice = this.notices.find(n => n.id === noticeId);
    if (notice) {
      notice.isPinned = isPinned;
      this.save();
    }
  }

  deleteNotice(noticeId: string) {
    const idx = this.notices.findIndex(n => n.id === noticeId);
    if (idx !== -1) {
      this.notices.splice(idx, 1);
      this.save();
    }
  }

  // ==========================================
  // MODULE 8: ELECTIONS & SECRET BALLOT
  // ==========================================

  createElection(electionData: {
    tenantId: string;
    titleBn: string;
    titleEn?: string;
    termYears: string;
    electionDate: string;
    votingStartTime?: string;
    votingEndTime?: string;
    venue?: string;
    commission?: ElectionCommission;
    posts?: ElectionPostConfig[];
  }) {
    const electionId = `elec-${Date.now()}`;
    const defaultPosts: ElectionPostConfig[] = electionData.posts || [
      { id: 'post-1', post: 'PRESIDENT', titleBn: 'সভাপতি', titleEn: 'President', seatsCount: 1 },
      { id: 'post-2', post: 'SECRETARY', titleBn: 'সাধারণ সম্পাদক', titleEn: 'General Secretary', seatsCount: 1 },
      { id: 'post-3', post: 'TREASURER', titleBn: 'কোষাধ্যক্ষ', titleEn: 'Treasurer', seatsCount: 1 },
      { id: 'post-4', post: 'EXECUTIVE_MEMBER', titleBn: 'কার্যনির্বাহী সদস্য', titleEn: 'Executive Member', seatsCount: 3 }
    ];

    // Seed eligible active members as voters
    const activeMembers = this.members.filter(m => m.tenantId === electionData.tenantId && m.status === 'ACTIVE');
    const voters: ElectionVoter[] = activeMembers.map(m => ({
      memberId: m.id,
      memberCode: m.memberCode,
      nameBn: m.nameBn,
      phone: m.phone,
      isEligible: true,
      hasVoted: false
    }));

    const newElection: Election = {
      id: electionId,
      tenantId: electionData.tenantId,
      electionNo: `ELEC-${new Date().getFullYear()}/${this.elections.filter(e => e.tenantId === electionData.tenantId).length + 1}`,
      titleBn: electionData.titleBn,
      titleEn: electionData.titleEn || electionData.titleBn,
      termYears: electionData.termYears,
      electionDate: electionData.electionDate,
      votingStartTime: electionData.votingStartTime || 'সকাল ০৯:০০ ঘটিকা',
      votingEndTime: electionData.votingEndTime || 'বিকাল ০৪:০০ ঘটিকা',
      venue: electionData.venue || 'সমিতি প্রধান কার্যালয় অডিটোরিয়াম',
      status: 'ACTIVE',
      commission: electionData.commission || {
        chiefCommissionerNameBn: 'অ্যাডভোকেট এনামুল হক (প্রধান নির্বাচন কমিশনার)',
        chiefCommissionerTitleBn: 'বাংলাদেশ সুপ্রিম কোর্ট',
        commissioner2NameBn: 'প্রফেসর গোলাম কিবরিয়া',
        commissioner3NameBn: 'জনাব হাবিবুর রহমান',
        officeAddressBn: 'নির্বাচন কমিশন সচিবালয়, ঢাকা'
      },
      posts: defaultPosts,
      totalEligibleVoters: voters.length,
      totalVotesCast: 0,
      candidates: [],
      voters,
      createdAt: new Date().toISOString(),
      syncVersion: 1,
      isSynced: true
    };

    this.elections.unshift(newElection);

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: electionData.tenantId,
      type: 'SYSTEM_ANNOUNCEMENT',
      titleBn: 'নতুন নির্বাচন তফসিল ঘোষিত',
      titleEn: 'New Election Announced',
      messageBn: `${newElection.titleBn} (${newElection.termYears}) এর নির্বাচনী তফসিল ঘোষণা করা হয়েছে।`,
      messageEn: `Election ${newElection.titleEn} announced.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.addAuditLog({
      tenantId: electionData.tenantId,
      action: 'CREATE',
      entity: 'ELECTION',
      entityId: electionId,
      descriptionBn: `নতুন নির্বাচন '${newElection.titleBn}' তফসিল ঘোষণা ও ভোটার খসড়া তালিকা প্রণয়ন করা হয়েছে।`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newElection;
  }

  updateElection(electionId: string, updates: Partial<Election>) {
    const idx = this.elections.findIndex(e => e.id === electionId);
    if (idx === -1) return null;

    this.elections[idx] = {
      ...this.elections[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentUserId
    };

    this.addAuditLog({
      tenantId: this.elections[idx].tenantId,
      action: 'UPDATE',
      entity: 'ELECTION',
      entityId: electionId,
      descriptionBn: `নির্বাচন '${this.elections[idx].titleBn}' এর তথ্য আপডেট করা হয়েছে।`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return this.elections[idx];
  }

  updateElectionStatus(electionId: string, newStatus: ElectionStatus) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election) return null;

    election.status = newStatus;
    election.updatedAt = new Date().toISOString();

    this.addAuditLog({
      tenantId: election.tenantId,
      action: 'UPDATE',
      entity: 'ELECTION',
      entityId: electionId,
      descriptionBn: `নির্বাচন '${election.titleBn}' এর স্ট্যাটাস '${newStatus}' এ পরিবর্তন করা হয়েছে।`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return election;
  }

  addCandidate(electionId: string, candidateData: Omit<ElectionCandidate, 'id' | 'voteCount' | 'electionId'>) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election) return null;

    const newCandidate: ElectionCandidate = {
      ...candidateData,
      id: `cand-${Date.now()}`,
      electionId,
      status: candidateData.status || 'VALID',
      voteCount: 0
    };

    election.candidates.push(newCandidate);
    election.updatedAt = new Date().toISOString();

    this.addAuditLog({
      tenantId: election.tenantId,
      action: 'CREATE',
      entity: 'ELECTION',
      entityId: newCandidate.id,
      descriptionBn: `নির্বাচনে নতুন প্রার্থী '${newCandidate.nameBn}' (${newCandidate.post} পদ, প্রতীক: ${newCandidate.symbolName}) অন্তর্ভুক্ত হয়েছে।`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newCandidate;
  }

  updateCandidateStatus(electionId: string, candidateId: string, status: CandidateStatus) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election) return null;

    const cand = election.candidates.find(c => c.id === candidateId);
    if (cand) {
      cand.status = status;
      election.updatedAt = new Date().toISOString();
      this.save();
    }
    return cand;
  }

  castVote(electionId: string, candidateId: string, voterMemberId?: string) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election) return false;

    // Verify voter eligibility & check if already voted
    const targetMemberId = voterMemberId || this.currentUserId;
    if (election.voters) {
      const voter = election.voters.find(v => v.memberId === targetMemberId);
      if (voter) {
        if (voter.hasVoted) {
          return false;
        }
        voter.hasVoted = true;
        voter.votedAt = new Date().toISOString();
      }
    }

    // Increment candidate vote
    const candidate = election.candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.voteCount = (candidate.voteCount || 0) + 1;
    }

    election.totalVotesCast = (election.totalVotesCast || 0) + 1;
    election.updatedAt = new Date().toISOString();

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: election.tenantId,
      type: 'VOTE_CAST',
      titleBn: 'নতুন গোপন ভোট গৃহীত হয়েছে',
      titleEn: 'Secret Ballot Cast',
      messageBn: `${election.titleBn} এ নতুন একটি গোপন ভোট সফলভাবে সংগৃহীত হয়েছে।`,
      messageEn: `A vote was cast in ${election.titleEn}.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.addAuditLog({
      tenantId: election.tenantId,
      action: 'UPDATE',
      entity: 'ELECTION',
      entityId: electionId,
      descriptionBn: `ডিজিটাল গোপন ব্যালটে সফলভাবে ভোট কাস্ট সম্পন্ন হয়েছে। (ব্যালট এনক্রিপ্টেড)`,
      performedBy: 'গোপন ব্যালট ইঞ্জিন',
      performedByRole: 'MEMBER'
    });

    this.save();
    return true;
  }

  castMultiPostBallot(electionId: string, voterMemberId: string, votes: { post: ElectionPost; candidateId: string }[]) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election) return false;

    // Check voter
    if (election.voters) {
      const voter = election.voters.find(v => v.memberId === voterMemberId);
      if (voter) {
        if (voter.hasVoted) return false;
        voter.hasVoted = true;
        voter.votedAt = new Date().toISOString();
      }
    }

    // Increment votes
    votes.forEach(v => {
      const cand = election.candidates.find(c => c.id === v.candidateId);
      if (cand) {
        cand.voteCount = (cand.voteCount || 0) + 1;
      }
    });

    election.totalVotesCast = (election.totalVotesCast || 0) + 1;
    election.updatedAt = new Date().toISOString();

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: election.tenantId,
      type: 'VOTE_CAST',
      titleBn: 'নতুন গোপন ব্যালট পেপার জমা হয়েছে',
      titleEn: 'Ballot Paper Submitted',
      messageBn: `${election.titleBn} এ সকল পদের জন্য গোপন ব্যালট পেপার জমা হয়েছে।`,
      messageEn: `Full ballot paper submitted in ${election.titleEn}.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.save();
    return true;
  }

  toggleVoterEligibility(electionId: string, memberId: string, isEligible: boolean, reason?: string) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election?.voters) return false;

    const voter = election.voters.find(v => v.memberId === memberId);
    if (voter) {
      voter.isEligible = isEligible;
      voter.ineligibilityReason = isEligible ? undefined : (reason || 'চাঁদা বকেয়া');
      election.totalEligibleVoters = election.voters.filter(v => v.isEligible).length;
      this.save();
    }
    return true;
  }

  publishElectionResults(electionId: string, certifiedBy: string) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election) return null;

    election.status = 'COMPLETED';
    election.resultPublishedAt = new Date().toISOString();
    election.resultCertifiedBy = certifiedBy || election.commission?.chiefCommissionerNameBn || 'প্রধান নির্বাচন কমিশনার';

    // Mark winner for each post
    const posts = election.posts || [];
    posts.forEach(p => {
      const postCands = election.candidates.filter(c => c.post === p.post && c.status === 'VALID');
      if (postCands.length > 0) {
        postCands.sort((a, b) => b.voteCount - a.voteCount);
        for (let i = 0; i < Math.min(p.seatsCount, postCands.length); i++) {
          postCands[i].status = 'ELECTED';
        }
      }
    });

    this.events.unshift({
      id: `evt-${Date.now()}`,
      tenantId: election.tenantId,
      type: 'SYSTEM_ANNOUNCEMENT',
      titleBn: 'নির্বাচনের চূড়ান্ত ফলাফল প্রকাশিত হয়েছে',
      titleEn: 'Election Results Gazetted',
      messageBn: `${election.titleBn} এর আনুষ্ঠানিক ভোট গণনা সমাপ্ত ও ফলাফল গেজেট প্রকাশ করা হয়েছে।`,
      messageEn: `Election results published and certified.`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });

    this.addAuditLog({
      tenantId: election.tenantId,
      action: 'APPROVE',
      entity: 'ELECTION',
      entityId: electionId,
      descriptionBn: `নির্বাচন '${election.titleBn}' এর ফলাফল চূড়ান্তভাবে অনুমোদন ও গেজেট প্রকাশ করেছেন: ${election.resultCertifiedBy}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return election;
  }

  softDeleteElection(electionId: string, reason?: string) {
    const idx = this.elections.findIndex(e => e.id === electionId);
    if (idx === -1) return false;

    this.elections[idx].deletedAt = new Date().toISOString();
    this.elections[idx].deletedBy = this.currentUserId;
    this.elections[idx].status = 'CANCELLED';

    this.addAuditLog({
      tenantId: this.elections[idx].tenantId,
      action: 'DELETE',
      entity: 'ELECTION',
      entityId: electionId,
      descriptionBn: `নির্বাচন '${this.elections[idx].titleBn}' বাতিল/মুছে ফেলা হয়েছে। কারণ: ${reason || 'প্রশাসনিক সিদ্ধান্ত'}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return true;
  }

  // ----------------------------------------------------
  // MODULE: ONLINE PAYMENT GATEWAYS (bKash / Nagad / Rocket / SSLCommerz)
  // ----------------------------------------------------
  updatePaymentGatewayConfig(config: Partial<PaymentGatewayConfig>) {
    this.paymentGatewayConfig = { ...this.paymentGatewayConfig, ...config };
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'SETTINGS',
      entityId: 'PAYMENT_GATEWAYS',
      descriptionBn: 'অনলাইন পেমেন্ট গেটওয়ে (বিকাশ, নগদ, রকেট, এসএসএলকমার্জ) কনফিগারেশন আপডেট করা হয়েছে',
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });
    this.save();
    return this.paymentGatewayConfig;
  }

  initiateOnlinePayment(params: {
    memberId: string;
    purpose: PaymentPurpose;
    amount: number;
    gateway: PaymentGatewayProvider;
    referenceId?: string;
    notes?: string;
  }): OnlinePaymentTransaction {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য পাওয়া যায়নি');

    const chargeRate = this.paymentGatewayConfig.serviceChargePercentage || 0;
    const charge = Math.round((params.amount * (chargeRate / 100)) * 100) / 100;
    const total = params.amount + charge;

    const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const payment: OnlinePaymentTransaction = {
      id: `pay-${Date.now()}`,
      tenantId: this.currentTenantId,
      memberId: member.id,
      memberNameBn: member.nameBn,
      memberCode: member.memberCode,
      phone: member.phone,
      gateway: params.gateway,
      purpose: params.purpose,
      referenceId: params.referenceId || '',
      amount: params.amount,
      chargeAmount: charge,
      totalPaid: total,
      trxId: '',
      gatewayPaymentId: `${params.gateway}-${Date.now().toString().slice(-6)}`,
      status: 'PENDING',
      paymentDate: nowStr,
      receiptNo,
      notes: params.notes || '',
      createdAt: new Date().toISOString()
    };

    this.onlinePayments.unshift(payment);
    this.save();
    return payment;
  }

  verifyOnlinePayment(params: {
    paymentId: string;
    trxId: string;
    verifiedBy?: string;
  }): OnlinePaymentTransaction {
    const payment = this.onlinePayments.find(p => p.id === params.paymentId);
    if (!payment) throw new Error('পেমেন্ট রেকর্ড পাওয়া যায়নি');

    payment.trxId = params.trxId;
    payment.status = 'VERIFIED';
    payment.verifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    payment.verifiedBy = params.verifiedBy || `${payment.gateway} Webhook Auto-Verified`;

    // 1. Post General Ledger Voucher (Debit Bank/MFS 1020, Credit Revenue/Asset/Liability)
    const voucherId = `VCH-CR-${Date.now().toString().slice(-6)}`;
    payment.voucherId = voucherId;

    let creditHeadCode = '3010';
    let creditHeadTitleBn = 'মাসিক সদস্য চাঁদা আয়';

    if (payment.purpose === 'MONTHLY_SUBSCRIPTION') {
      creditHeadCode = '3010';
      creditHeadTitleBn = 'মাসিক সদস্য চাঁদা আয়';
      // Mark subscription as paid via existing recordMonthlySubscription
      const sub = this.subscriptions.find(s => s.id === payment.referenceId || (s.memberId === payment.memberId && s.status !== 'PAID'));
      if (sub) {
        this.recordMonthlySubscription({
          tenantId: this.currentTenantId,
          memberId: payment.memberId,
          monthYear: sub.monthYear,
          amount: payment.amount,
          paymentMethod: 'BKASH',
          notes: `অনলাইন পেমেন্ট (${payment.gateway}) - TrxID: ${payment.trxId}`
        });
      }
    } else if (payment.purpose === 'SAVINGS_DEPOSIT' || payment.purpose === 'DPS_INSTALLMENT') {
      creditHeadCode = '2010';
      creditHeadTitleBn = 'সদস্য সাধারণ সঞ্চয় আমানত';
      // Update member savings account
      const acc = this.savingsAccounts.find(a => a.id === payment.referenceId || (a.memberId === payment.memberId && a.status === 'ACTIVE'));
      if (acc) {
        acc.balance += payment.amount;
        acc.totalDeposited = (acc.totalDeposited || 0) + payment.amount;
        this.savingsTransactions.unshift({
          id: `stx-${Date.now()}`,
          tenantId: this.currentTenantId,
          accountId: acc.id,
          memberId: payment.memberId,
          type: 'DEPOSIT',
          amount: payment.amount,
          balanceAfter: acc.balance,
          date: new Date().toISOString().slice(0, 10),
          receiptNo: payment.receiptNo,
          paymentMethod: 'BKASH',
          collectorId: this.currentUserId,
          notes: `অনলাইন ${payment.gateway} স্বয়ংক্রিয় ডিপোজিট - Trx: ${payment.trxId}`
        });
      }
    } else if (payment.purpose === 'LOAN_INSTALLMENT') {
      creditHeadCode = '1030';
      creditHeadTitleBn = 'প্রদত্ত ঋণ ও অগ্রিম (Loan Recovery)';
      const loan = this.loans.find(l => l.id === payment.referenceId || (l.memberId === payment.memberId && l.status === 'ACTIVE'));
      if (loan) {
        this.collectLoanInstallment({
          tenantId: this.currentTenantId,
          loanId: loan.id,
          amount: payment.amount,
          paymentMethod: 'BKASH',
          notes: `অনলাইন ${payment.gateway} কিস্তি - Trx: ${payment.trxId}`
        });
      }
    }

    // Auto double entry voucher
    this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'CREDIT',
      category: 'সদস্য আদায়',
      accountHeadCode: creditHeadCode,
      accountHeadNameBn: creditHeadTitleBn,
      debitAccount: '১০২০: ব্যাংক ও এমএফএস হিসাব',
      creditAccount: `${creditHeadCode}: ${creditHeadTitleBn}`,
      amount: payment.amount,
      descriptionBn: `অনলাইন পেমেন্ট আদায় (${payment.gateway}) - ${payment.memberNameBn} (${payment.memberCode}) [Trx: ${payment.trxId}]`,
      paidToOrReceivedFrom: payment.memberNameBn,
      paymentMethod: 'BKASH',
      chequeOrTxNo: payment.trxId
    });

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'APPROVE',
      entity: 'PAYMENT',
      entityId: payment.id,
      descriptionBn: `অনলাইন পেমেন্ট সম্পন্ন ও ভেরিফাইড: ${payment.memberNameBn} | ${payment.amount} টাকা (${payment.gateway}) | Trx: ${payment.trxId}`,
      performedBy: this.currentUserId,
      performedByRole: 'SYSTEM'
    });

    this.save();
    return payment;
  }

  // ----------------------------------------------------
  // MODULE: FIELD COLLECTOR DESK & THERMAL POS PRINTER
  // ----------------------------------------------------
  updateThermalPrinterConfig(config: Partial<ThermalPrinterConfig>) {
    this.thermalPrinterConfig = { ...this.thermalPrinterConfig, ...config };
    this.save();
    return this.thermalPrinterConfig;
  }

  recordFieldCollection(params: {
    memberId: string;
    savingsAmount?: number;
    dpsAmount?: number;
    loanInstallmentAmount?: number;
    routeOrArea: string;
    paymentMethod?: 'CASH' | 'MFS';
    notes?: string;
  }): FieldCollectorDailyCollection {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য পাওয়া যায়নি');

    const savings = params.savingsAmount || 0;
    const dps = params.dpsAmount || 0;
    const loan = params.loanInstallmentAmount || 0;
    const grandTotal = savings + dps + loan;

    if (grandTotal <= 0) throw new Error('আদায়ের পরিমাণ শূন্য হতে পারে না');

    const receiptNo = `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const collector = this.users.find(u => u.id === this.currentUserId) || this.users[0];

    const record: FieldCollectorDailyCollection = {
      id: `fc-col-${Date.now()}`,
      tenantId: this.currentTenantId,
      collectorId: this.currentUserId,
      collectorName: collector.nameBn || 'মাঠ কর্মকর্তা',
      collectorPhone: collector.phone || '',
      routeOrArea: params.routeOrArea,
      date: new Date().toISOString().slice(0, 10),
      memberId: member.id,
      memberCode: member.memberCode,
      memberName: member.nameBn,
      memberPhone: member.phone,
      savingsAmount: savings,
      dpsAmount: dps,
      loanInstallmentAmount: loan,
      totalCollected: grandTotal,
      receiptNo,
      paymentMethod: params.paymentMethod || 'CASH',
      status: 'COLLECTED',
      isSynced: true,
      thermalReceiptPrinted: true,
      collectedAt: nowStr,
      notes: params.notes || ''
    };

    // 1. If savings or DPS collected, update savings accounts
    if (savings > 0 || dps > 0) {
      const acc = this.savingsAccounts.find(a => a.memberId === member.id && a.status === 'ACTIVE');
      if (acc) {
        const depositSum = savings + dps;
        acc.balance += depositSum;
        acc.totalDeposited = (acc.totalDeposited || 0) + depositSum;
        this.savingsTransactions.unshift({
          id: `stx-${Date.now()}`,
          tenantId: this.currentTenantId,
          accountId: acc.id,
          memberId: member.id,
          type: 'DEPOSIT',
          amount: depositSum,
          balanceAfter: acc.balance,
          date: new Date().toISOString().slice(0, 10),
          receiptNo,
          paymentMethod: 'CASH',
          collectorId: this.currentUserId,
          notes: `মাঠ কালেকশন (${params.routeOrArea}) - ${collector.nameBn}`
        });
      }
    }

    // 2. If loan collected, apply installment
    if (loan > 0) {
      const activeLoan = this.loans.find(l => l.memberId === member.id && l.status === 'ACTIVE');
      if (activeLoan) {
        this.collectLoanInstallment({
          tenantId: this.currentTenantId,
          loanId: activeLoan.id,
          amount: loan,
          paymentMethod: 'CASH',
          notes: `মাঠ কালেকশন (${params.routeOrArea}) - ${collector.nameBn}`
        });
      }
    }

    // 3. Post General Ledger Cash Voucher (Debit 1010 Cash in Hand)
    this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'CREDIT',
      category: 'মাঠ কালেকশন',
      accountHeadCode: loan > 0 ? '1030' : '2010',
      accountHeadNameBn: loan > 0 ? 'প্রদত্ত ঋণ ও অগ্রিম' : 'সদস্য সাধারণ সঞ্চয় আমানত',
      debitAccount: '১০১০: হাতে নগদ তহবিল',
      creditAccount: loan > 0 ? '১০৩০: প্রদত্ত ঋণ ও অগ্রিম' : '২০১০: সদস্য সাধারণ সঞ্চয় আমানত',
      amount: grandTotal,
      descriptionBn: `মাঠকর্মী নগদ আদায় (${params.routeOrArea}): ${member.nameBn} (${member.memberCode}) [POS রসিদ: ${receiptNo}]`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: 'CASH',
      chequeOrTxNo: receiptNo
    });

    this.fieldCollections.unshift(record);

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'FIELD_COLLECTION',
      entityId: record.id,
      descriptionBn: `মাঠকর্মী কর্তৃক নগদ আদায়: ${member.nameBn} | মোট: ${grandTotal} ৳ | POS রসিদ: ${receiptNo}`,
      performedBy: this.currentUserId,
      performedByRole: 'COLLECTOR'
    });

    this.save();
    return record;
  }

  submitFieldDayEndSummary(params: {
    routeOrArea: string;
    cashHandoverAmount: number;
    handoverToCashierName: string;
  }): FieldDayEndSummary {
    const today = new Date().toISOString().slice(0, 10);
    const todayCollections = this.fieldCollections.filter(
      c => c.tenantId === this.currentTenantId && c.collectorId === this.currentUserId && c.date === today && c.status === 'COLLECTED'
    );

    const totalSavings = todayCollections.reduce((sum, c) => sum + c.savingsAmount, 0);
    const totalDps = todayCollections.reduce((sum, c) => sum + c.dpsAmount, 0);
    const totalLoan = todayCollections.reduce((sum, c) => sum + c.loanInstallmentAmount, 0);
    const grandTotal = totalSavings + totalDps + totalLoan;
    const diff = params.cashHandoverAmount - grandTotal;
    const collector = this.users.find(u => u.id === this.currentUserId) || this.users[0];

    const summary: FieldDayEndSummary = {
      id: `fde-${Date.now()}`,
      tenantId: this.currentTenantId,
      date: today,
      collectorId: this.currentUserId,
      collectorName: collector.nameBn || 'মাঠ কর্মকর্তা',
      routeOrArea: params.routeOrArea,
      totalMembersVisited: todayCollections.length,
      totalCollectionsCount: todayCollections.length,
      totalSavingsCollected: totalSavings,
      totalDpsCollected: totalDps,
      totalLoanCollected: totalLoan,
      grandTotalAmount: grandTotal,
      cashHandoverAmount: params.cashHandoverAmount,
      cashShortageOrSurplus: diff,
      handoverToCashierName: params.handoverToCashierName,
      status: 'PENDING_HANDOVER',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    this.fieldDayEnds.unshift(summary);

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'FIELD_DAY_END',
      entityId: summary.id,
      descriptionBn: `দিনশেষে নগদ ক্যাশ হস্তান্তর সাবমিট: ${collector.nameBn} | মোট আদায়: ${grandTotal} ৳ | জমা: ${params.cashHandoverAmount} ৳`,
      performedBy: this.currentUserId,
      performedByRole: 'COLLECTOR'
    });

    this.save();
    return summary;
  }

  approveFieldDayEndSummary(id: string, cashierName: string, remarks?: string): FieldDayEndSummary {
    const summary = this.fieldDayEnds.find(s => s.id === id);
    if (!summary) throw new Error('দিনশেষের সারসংক্ষেপ পাওয়া যায়নি');

    summary.status = 'ACCEPTED_BY_CASHIER';
    summary.approvedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    summary.cashierRemarks = remarks || 'ক্যাশিয়ার কর্তৃক অর্থ যথাযথভাবে ক্যাশে গ্রহণ করা হয়েছে।';

    // Mark today collections by this collector as handed over
    this.fieldCollections.forEach(c => {
      if (c.collectorId === summary.collectorId && c.date === summary.date) {
        c.status = 'HANDED_OVER';
      }
    });

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'APPROVE',
      entity: 'FIELD_DAY_END',
      entityId: summary.id,
      descriptionBn: `ক্যাশিয়ার কর্তৃক মাঠকর্মীর দিনশেষের ক্যাশ গ্রহণ ও রিকনসাইল: ${cashierName} | মোট: ${summary.cashHandoverAmount} ৳`,
      performedBy: this.currentUserId,
      performedByRole: 'ACCOUNTANT'
    });

    this.save();
    return summary;
  }

  // ----------------------------------------------------
  // MODULE 3: PROJECT & JOINT INVESTMENTS METHODS
  // ----------------------------------------------------
  createProject(data: Partial<SamityProject>): SamityProject {
    const tenantId = data.tenantId || this.currentTenantId;
    const now = new Date();
    const projectCode = data.code || `PRJ-${now.getFullYear()}-${String(this.projects.filter(p => p.tenantId === tenantId).length + 1).padStart(2, '0')}`;
    
    const newProject: SamityProject = {
      id: `prj-${Date.now()}`,
      tenantId,
      code: projectCode,
      nameBn: data.nameBn || 'নতুন সমবায় প্রকল্প',
      nameEn: data.nameEn || 'New Co-operative Project',
      category: data.category || 'AGRO',
      location: data.location || 'সমিতির আওতাধীন এলাকা',
      estimatedBudget: Number(data.estimatedBudget) || 100000,
      totalCapitalInvested: 0,
      totalIncome: 0,
      totalExpense: 0,
      netProfitOrLoss: 0,
      targetRoiPercent: Number(data.targetRoiPercent) || 15,
      actualRoiPercent: 0,
      startDate: data.startDate || now.toISOString().split('T')[0],
      expectedEndDate: data.expectedEndDate || `${now.getFullYear()}-12-31`,
      managerName: data.managerName || 'প্রকল্প ব্যবস্থাপক',
      managerPhone: data.managerPhone || '01700000000',
      status: data.status || 'PLANNING',
      descriptionBn: data.descriptionBn || '',
      totalShareUnits: Number(data.totalShareUnits) || 50,
      unitPrice: Number(data.unitPrice) || 10000,
      distributedProfit: 0,
      isSynced: true,
      createdAt: now.toISOString().split('T')[0],
      updatedAt: now.toISOString().split('T')[0]
    };

    this.projects.unshift(newProject);

    this.addAuditLog({
      tenantId,
      action: 'CREATE',
      entity: 'PROJECT',
      entityId: newProject.id,
      descriptionBn: `নতুন সমবায় প্রকল্প তৈরি করা হয়েছে: [${newProject.code}] ${newProject.nameBn} (বাজেট: ৳${newProject.estimatedBudget.toLocaleString()})`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newProject;
  }

  updateProject(projectId: string, updates: Partial<SamityProject>): SamityProject {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('প্রকল্প খুঁজে পাওয়া যায়নি');

    Object.assign(project, updates, {
      updatedAt: new Date().toISOString().split('T')[0]
    });

    // Recalculate financial metrics
    project.netProfitOrLoss = project.totalIncome - project.totalExpense;
    project.actualRoiPercent = project.totalCapitalInvested > 0
      ? Number(((project.netProfitOrLoss / project.totalCapitalInvested) * 100).toFixed(2))
      : 0;

    this.addAuditLog({
      tenantId: project.tenantId,
      action: 'UPDATE',
      entity: 'PROJECT',
      entityId: project.id,
      descriptionBn: `প্রকল্প তথ্য হালনাগাদ: [${project.code}] ${project.nameBn} (স্ট্যাটাস: ${project.status})`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return project;
  }

  recordProjectInvestment(params: {
    projectId: string;
    memberId: string;
    unitsCount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): ProjectMemberInvestment {
    const project = this.projects.find(p => p.id === params.projectId);
    if (!project) throw new Error('প্রকল্প খুঁজে পাওয়া যায়নি');

    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য খুঁজে পাওয়া যায়নি');

    const totalAmount = params.unitsCount * project.unitPrice;
    const certSerial = String(this.projectInvestments.filter(i => i.tenantId === project.tenantId).length + 1).padStart(3, '0');
    const certificateNo = `PRJ-INV-${new Date().getFullYear()}-${certSerial}`;

    const investment: ProjectMemberInvestment = {
      id: `pmi-${Date.now()}`,
      tenantId: project.tenantId,
      projectId: project.id,
      projectNameBn: project.nameBn,
      memberId: member.id,
      memberCode: member.memberCode,
      memberNameBn: member.nameBn,
      memberPhone: member.phone,
      unitsCount: params.unitsCount,
      unitPrice: project.unitPrice,
      totalAmount,
      paymentMethod: params.paymentMethod,
      investmentDate: new Date().toISOString().split('T')[0],
      certificateNo,
      profitEarned: 0,
      status: 'ACTIVE',
      notes: params.notes,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.projectInvestments.unshift(investment);

    // Update project invested capital
    project.totalCapitalInvested += totalAmount;
    project.actualRoiPercent = project.totalCapitalInvested > 0
      ? Number(((project.netProfitOrLoss / project.totalCapitalInvested) * 100).toFixed(2))
      : 0;
    project.updatedAt = new Date().toISOString().split('T')[0];

    // Double-entry general ledger voucher
    const voucher = this.createVoucher({
      tenantId: project.tenantId,
      type: 'CREDIT',
      category: 'প্রকল্প অংশীদারিত্ব বিনিয়োগ',
      accountHeadCode: '1040',
      accountHeadNameBn: 'প্রকল্প মূলধন বিনিয়োগ',
      debitAccount: params.paymentMethod === 'CASH' ? '১০১০: ক্যাশ ইন হ্যান্ড' : '১০২০: ব্যাংক ও মোবাইল ওয়ালেট',
      creditAccount: '১০৪০: প্রকল্প মূলধন বিনিয়োগ তহবিল',
      amount: totalAmount,
      descriptionBn: `প্রকল্প [${project.code}] ${project.nameBn}-এ সদস্য ${member.nameBn} (${member.memberCode}) এর ${params.unitsCount} ইউনিট বিনিয়োগ প্রাপ্তি। সনদ নং: ${certificateNo}`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: params.paymentMethod
    });
    investment.voucherId = voucher.id;

    this.addAuditLog({
      tenantId: project.tenantId,
      action: 'CREATE',
      entity: 'PROJECT',
      entityId: investment.id,
      descriptionBn: `প্রকল্প বিনিয়োগ গ্রহণ: ${member.nameBn} -> [${project.code}] ${project.nameBn} | পরিমাণ: ৳${totalAmount.toLocaleString()} (${params.unitsCount} ইউনিট) | সনদ: ${certificateNo}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return investment;
  }

  recordProjectTransaction(params: {
    projectId: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    amount: number;
    paymentMethod: PaymentMethod;
    descriptionBn: string;
    receivedFromOrPaidTo: string;
  }): ProjectTransaction {
    const project = this.projects.find(p => p.id === params.projectId);
    if (!project) throw new Error('প্রকল্প খুঁজে পাওয়া যায়নি');

    const txSerial = String(this.projectTransactions.filter(t => t.projectId === project.id).length + 1).padStart(3, '0');
    const voucherNo = `${params.type === 'INCOME' ? 'RV' : 'PV'}-PRJ-${new Date().getFullYear()}-${txSerial}`;

    const tx: ProjectTransaction = {
      id: `ptx-${Date.now()}`,
      tenantId: project.tenantId,
      projectId: project.id,
      type: params.type,
      category: params.category,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      transactionDate: new Date().toISOString().split('T')[0],
      voucherNo,
      descriptionBn: params.descriptionBn,
      receivedFromOrPaidTo: params.receivedFromOrPaidTo,
      recordedBy: this.currentUserId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.projectTransactions.unshift(tx);

    // Update project financials
    if (params.type === 'INCOME') {
      project.totalIncome += params.amount;
    } else {
      project.totalExpense += params.amount;
    }
    project.netProfitOrLoss = project.totalIncome - project.totalExpense;
    project.actualRoiPercent = project.totalCapitalInvested > 0
      ? Number(((project.netProfitOrLoss / project.totalCapitalInvested) * 100).toFixed(2))
      : 0;
    project.updatedAt = new Date().toISOString().split('T')[0];

    // Double-entry voucher
    if (params.type === 'INCOME') {
      this.createVoucher({
        tenantId: project.tenantId,
        type: 'CREDIT',
        category: 'প্রকল্প আয়',
        accountHeadCode: '4010',
        accountHeadNameBn: 'প্রকল্প পরিচালন আয়',
        debitAccount: params.paymentMethod === 'CASH' ? '১০১০: ক্যাশ ইন হ্যান্ড' : '১০২০: ব্যাংক ও মোবাইল ওয়ালেট',
        creditAccount: '৪০১০: প্রকল্প পরিচালন আয়',
        amount: params.amount,
        descriptionBn: `প্রকল্প [${project.code}] ${project.nameBn}-এর আয়: ${params.descriptionBn}`,
        paidToOrReceivedFrom: params.receivedFromOrPaidTo,
        paymentMethod: params.paymentMethod
      });
    } else {
      this.createVoucher({
        tenantId: project.tenantId,
        type: 'DEBIT',
        category: 'প্রকল্প ব্যয়',
        accountHeadCode: '5010',
        accountHeadNameBn: 'প্রকল্প পরিচালন ব্যয়',
        debitAccount: '৫০১০: প্রকল্প পরিচালন ব্যয়',
        creditAccount: params.paymentMethod === 'CASH' ? '১০১০: ক্যাশ ইন হ্যান্ড' : '১০২০: ব্যাংক ও মোবাইল ওয়ালেট',
        amount: params.amount,
        descriptionBn: `প্রকল্প [${project.code}] ${project.nameBn}-এর ব্যয়: ${params.descriptionBn}`,
        paidToOrReceivedFrom: params.receivedFromOrPaidTo,
        paymentMethod: params.paymentMethod
      });
    }

    this.addAuditLog({
      tenantId: project.tenantId,
      action: 'CREATE',
      entity: 'PROJECT_TRANSACTION',
      entityId: tx.id,
      descriptionBn: `প্রকল্পের ${params.type === 'INCOME' ? 'আয়' : 'ব্যয়'} এন্ট্রি: [${project.code}] ${project.nameBn} | পরিমাণ: ৳${params.amount.toLocaleString()} | বিবরণ: ${params.descriptionBn}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return tx;
  }

  closeProjectAndDistributeProfit(projectId: string, declaredProfit: number, remarks?: string): SamityProject {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('প্রকল্প খুঁজে পাওয়া যায়নি');

    project.status = 'COMPLETED';
    project.distributedProfit = declaredProfit;
    project.actualEndDate = new Date().toISOString().split('T')[0];
    project.updatedAt = new Date().toISOString().split('T')[0];

    // Find investors and distribute profit proportionally
    const activeInvestors = this.projectInvestments.filter(i => i.projectId === project.id && i.status === 'ACTIVE');
    const totalInvested = activeInvestors.reduce((sum, inv) => sum + inv.totalAmount, 0);

    if (totalInvested > 0 && declaredProfit > 0) {
      activeInvestors.forEach(inv => {
        const shareRatio = inv.totalAmount / totalInvested;
        const profitShare = Math.round(declaredProfit * shareRatio);
        inv.profitEarned += profitShare;

        // Credit to member's general savings account if exists
        const memberAccount = this.savingsAccounts.find(a => a.memberId === inv.memberId && a.type === 'GENERAL_SAVINGS');
        if (memberAccount) {
          this.recordSavingsDeposit({
            tenantId: project.tenantId,
            memberId: inv.memberId,
            accountId: memberAccount.id,
            amount: profitShare,
            paymentMethod: 'BANK',
            notes: `প্রকল্প [${project.code}] ${project.nameBn}-এর লভ্যাংশ ক্রেডিট (${inv.unitsCount} ইউনিট বাবদ)`
          });
        }
      });
    }

    this.addAuditLog({
      tenantId: project.tenantId,
      action: 'UPDATE',
      entity: 'PROJECT',
      entityId: project.id,
      descriptionBn: `প্রকল্প সমাপনী ও মুনাফা বণ্টন সম্পন্ন: [${project.code}] ${project.nameBn} | ঘোষিত মোট মুনাফা: ৳${declaredProfit.toLocaleString()} | বিনিয়োগকারী: ${activeInvestors.length} জন`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return project;
  }

  // ----------------------------------------------------
  // MODULE 4: SHARE CAPITAL & DIVIDEND ENGINE METHODS
  // ----------------------------------------------------
  updateShareConfig(config: Partial<ShareCapitalConfig>): ShareCapitalConfig {
    this.shareConfig = {
      ...this.shareConfig,
      ...config
    };

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'SHARE_CAPITAL',
      entityId: `cfg-share-${this.currentTenantId}`,
      descriptionBn: `সমিতির শেয়ার মূলধন ও ফেস ভ্যালু পলিসি হালনাগাদ (প্রতি শেয়ার মূল্য: ৳${this.shareConfig.faceValue}, সঞ্চিতি রিজার্ভ: ${this.shareConfig.compulsoryReservePercent}%)`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return this.shareConfig;
  }

  issueSharesToMember(params: {
    memberId: string;
    numberOfShares: number;
    paymentMethod: PaymentMethod;
    issueDate?: string;
  }): MemberShareRecord {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) throw new Error('সদস্য খুঁজে পাওয়া যায়নি');

    const totalValue = params.numberOfShares * this.shareConfig.faceValue;
    const now = new Date();
    const certSerial = String(this.memberShares.filter(s => s.tenantId === this.currentTenantId).length + 1).padStart(3, '0');
    const certificateNo = `SHR-CERT-${now.getFullYear()}-${certSerial}`;

    // Calculate share numbers range
    const totalExistingShares = this.memberShares.filter(s => s.tenantId === this.currentTenantId && s.status === 'ACTIVE').reduce((sum, s) => sum + s.numberOfShares, 0);
    const startRange = totalExistingShares + 1;
    const endRange = totalExistingShares + params.numberOfShares;
    const shareNumbersRange = `${String(startRange).padStart(4, '0')} - ${String(endRange).padStart(4, '0')}`;

    const shareRecord: MemberShareRecord = {
      id: `share-${Date.now()}`,
      tenantId: this.currentTenantId,
      memberId: member.id,
      memberCode: member.memberCode,
      memberNameBn: member.nameBn,
      memberPhone: member.phone,
      numberOfShares: params.numberOfShares,
      faceValue: this.shareConfig.faceValue,
      totalShareCapital: totalValue,
      certificateNo,
      shareNumbersRange,
      issueDate: params.issueDate || now.toISOString().split('T')[0],
      paymentMethod: params.paymentMethod,
      status: 'ACTIVE',
      createdAt: now.toISOString().split('T')[0],
      updatedAt: now.toISOString().split('T')[0]
    };

    this.memberShares.unshift(shareRecord);

    // Double-entry voucher for share capital receipt
    const voucher = this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'CREDIT',
      category: 'পরিশোধিত শেয়ার মূলধন গ্রহণ',
      accountHeadCode: '3000',
      accountHeadNameBn: 'পরিশোধিত শেয়ার মূলধন',
      debitAccount: params.paymentMethod === 'CASH' ? '১০১০: ক্যাশ ইন হ্যান্ড' : '১০২০: ব্যাংক ও মোবাইল ওয়ালেট',
      creditAccount: '৩০০০: সদস্যদের পরিশোধিত শেয়ার মূলধন',
      amount: totalValue,
      descriptionBn: `সদস্য ${member.nameBn} (${member.memberCode})-এর নামে ${params.numberOfShares} টি শেয়ার ইস্যু বাবদ পরিশোধিত শেয়ার মূলধন জমা। সনদ নং: ${certificateNo} (শেয়ার নং: ${shareNumbersRange})`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: params.paymentMethod
    });
    shareRecord.voucherId = voucher.id;

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'SHARE_CAPITAL',
      entityId: shareRecord.id,
      descriptionBn: `নতুন শেয়ার ইস্যু: ${member.nameBn} (${member.memberCode}) | শেয়ার সংখ্যা: ${params.numberOfShares} | মোট মূলধন: ৳${totalValue.toLocaleString()} | সনদ: ${certificateNo}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return shareRecord;
  }

  calculateDividendPreview(params: {
    financialYear: string;
    totalNetProfit: number;
    reserveFundPercent: number;
    developmentFundPercent: number;
    distributionBasis: DividendDistributionBasis;
  }): {
    totalNetProfit: number;
    reserveFundAmount: number;
    developmentFundAmount: number;
    distributableProfit: number;
    totalSharesEligible: number;
    totalSavingsEligible: number;
    items: Array<{
      memberId: string;
      memberCode: string;
      memberNameBn: string;
      memberPhone: string;
      shareCount: number;
      shareCapital: number;
      savingsBalance: number;
      dividendFromShare: number;
      dividendFromSavings: number;
      netDividendPayable: number;
    }>;
  } {
    const tenantId = this.currentTenantId;
    const reserveFundAmount = Math.round((params.totalNetProfit * params.reserveFundPercent) / 100);
    const developmentFundAmount = Math.round((params.totalNetProfit * params.developmentFundPercent) / 100);
    const distributableProfit = Math.max(0, params.totalNetProfit - reserveFundAmount - developmentFundAmount);

    const activeMembers = this.members.filter(m => m.tenantId === tenantId && m.status === 'ACTIVE');
    
    // Calculate total shares & savings across active members
    const memberShareMap = new Map<string, number>();
    this.memberShares
      .filter(s => s.tenantId === tenantId && s.status === 'ACTIVE')
      .forEach(s => {
        const current = memberShareMap.get(s.memberId) || 0;
        memberShareMap.set(s.memberId, current + s.numberOfShares);
      });

    const memberSavingsMap = new Map<string, number>();
    this.savingsAccounts
      .filter(a => a.tenantId === tenantId && a.status === 'ACTIVE')
      .forEach(a => {
        const current = memberSavingsMap.get(a.memberId) || 0;
        memberSavingsMap.set(a.memberId, current + a.balance);
      });

    const totalSharesEligible = Array.from(memberShareMap.values()).reduce((a, b) => a + b, 0);
    const totalSavingsEligible = Array.from(memberSavingsMap.values()).reduce((a, b) => a + b, 0);

    const items = activeMembers.map(member => {
      const shareCount = memberShareMap.get(member.id) || 0;
      const shareCapital = shareCount * this.shareConfig.faceValue;
      const savingsBalance = memberSavingsMap.get(member.id) || member.savingsBalance || 0;

      let dividendFromShare = 0;
      let dividendFromSavings = 0;

      if (params.distributionBasis === 'SHARE_RATIO') {
        dividendFromShare = totalSharesEligible > 0 ? Math.round((distributableProfit * shareCount) / totalSharesEligible) : 0;
      } else if (params.distributionBasis === 'SAVINGS_RATIO') {
        dividendFromSavings = totalSavingsEligible > 0 ? Math.round((distributableProfit * savingsBalance) / totalSavingsEligible) : 0;
      } else if (params.distributionBasis === 'HYBRID_50_50') {
        const halfProfit = distributableProfit / 2;
        dividendFromShare = totalSharesEligible > 0 ? Math.round((halfProfit * shareCount) / totalSharesEligible) : 0;
        dividendFromSavings = totalSavingsEligible > 0 ? Math.round((halfProfit * savingsBalance) / totalSavingsEligible) : 0;
      }

      const netDividendPayable = dividendFromShare + dividendFromSavings;

      return {
        memberId: member.id,
        memberCode: member.memberCode,
        memberNameBn: member.nameBn,
        memberPhone: member.phone,
        shareCount,
        shareCapital,
        savingsBalance,
        dividendFromShare,
        dividendFromSavings,
        netDividendPayable
      };
    }).filter(item => item.netDividendPayable > 0 || item.shareCount > 0);

    return {
      totalNetProfit: params.totalNetProfit,
      reserveFundAmount,
      developmentFundAmount,
      distributableProfit,
      totalSharesEligible,
      totalSavingsEligible,
      items
    };
  }

  createAndDisburseDividendSession(params: {
    financialYear: string;
    totalNetProfit: number;
    reserveFundPercent: number;
    developmentFundPercent: number;
    distributionBasis: DividendDistributionBasis;
    disbursementMethod: 'CREDIT_TO_SAVINGS' | 'CASH_VOUCHER';
    notes?: string;
  }): { session: DividendSession; items: MemberDividendItem[] } {
    const preview = this.calculateDividendPreview({
      financialYear: params.financialYear,
      totalNetProfit: params.totalNetProfit,
      reserveFundPercent: params.reserveFundPercent,
      developmentFundPercent: params.developmentFundPercent,
      distributionBasis: params.distributionBasis
    });

    const sessionId = `div-ses-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const session: DividendSession = {
      id: sessionId,
      tenantId: this.currentTenantId,
      financialYear: params.financialYear,
      totalNetProfit: params.totalNetProfit,
      reserveFundPercent: params.reserveFundPercent,
      reserveFundAmount: preview.reserveFundAmount,
      developmentFundPercent: params.developmentFundPercent,
      developmentFundAmount: preview.developmentFundAmount,
      distributableProfit: preview.distributableProfit,
      distributionBasis: params.distributionBasis,
      totalSharesEligible: preview.totalSharesEligible,
      totalSavingsEligible: preview.totalSavingsEligible,
      dividendRatePerShare: preview.totalSharesEligible > 0 ? Math.round(preview.distributableProfit / preview.totalSharesEligible) : 0,
      totalMembersBenefited: preview.items.length,
      status: 'DISBURSED',
      calculationDate: today,
      disbursedDate: today,
      disbursedBy: this.currentUserId,
      disbursementMethod: params.disbursementMethod,
      notes: params.notes,
      createdAt: today
    };

    this.dividendSessions.unshift(session);

    const generatedItems: MemberDividendItem[] = [];

    preview.items.forEach((item, index) => {
      const voucherNo = `DIV-VOUCHER-${params.financialYear.replace(/\s+/g, '')}-${String(index + 1).padStart(3, '0')}`;
      let savingsTxId: string | undefined = undefined;

      // If credit to savings, execute real deposit into member's savings account
      if (params.disbursementMethod === 'CREDIT_TO_SAVINGS' && item.netDividendPayable > 0) {
        const generalSavingsAcc = this.savingsAccounts.find(a => a.memberId === item.memberId && a.type === 'GENERAL_SAVINGS')
          || this.savingsAccounts.find(a => a.memberId === item.memberId);

        if (generalSavingsAcc) {
          const tx = this.recordSavingsDeposit({
            tenantId: this.currentTenantId,
            memberId: item.memberId,
            accountId: generalSavingsAcc.id,
            amount: item.netDividendPayable,
            paymentMethod: 'BANK',
            notes: `বার্ষিক লভ্যাংশ ক্রেডিট (${params.financialYear}) - ভাউচার: ${voucherNo}`
          });
          savingsTxId = tx.id;
        }
      }

      const divItem: MemberDividendItem = {
        id: `div-item-${Date.now()}-${index}`,
        tenantId: this.currentTenantId,
        sessionId,
        memberId: item.memberId,
        memberCode: item.memberCode,
        memberNameBn: item.memberNameBn,
        memberPhone: item.memberPhone,
        shareCount: item.shareCount,
        shareCapital: item.shareCapital,
        savingsBalance: item.savingsBalance,
        dividendFromShare: item.dividendFromShare,
        dividendFromSavings: item.dividendFromSavings,
        grossDividend: item.netDividendPayable,
        taxOrDeduction: 0,
        netDividendPayable: item.netDividendPayable,
        disbursementStatus: params.disbursementMethod === 'CREDIT_TO_SAVINGS' ? 'CREDITED_TO_SAVINGS' : 'PAID_CASH',
        savingsTransactionId: savingsTxId,
        voucherNo,
        creditedAt: today
      };

      generatedItems.push(divItem);
      this.dividendItems.unshift(divItem);
    });

    // Create consolidated General Ledger Journal Voucher for the dividend distribution
    this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'JOURNAL',
      category: 'বার্ষিক লভ্যাংশ বণ্টন ও সংবিধিবদ্ধ সঞ্চিতি তহবিল',
      accountHeadCode: '3020',
      accountHeadNameBn: 'চলতি বছরের বণ্টনযোগ্য নিট মুনাফা',
      debitAccount: '৩০২০: অর্জিত নিট মুনাফা ও রিটেইন্ড আর্নিংস',
      creditAccount: params.disbursementMethod === 'CREDIT_TO_SAVINGS' 
        ? '২০১০: সদস্যদের সাধারণ সঞ্চয় হিসাব ও ৩০৩০: সাধারণ সঞ্চিতি তহবিল' 
        : '১০১০: নগদ ক্যাশ ও ৩০৩০: সাধারণ সঞ্চিতি তহবিল',
      amount: params.totalNetProfit,
      descriptionBn: `অর্থবছর ${params.financialYear}-এর বার্ষিক লভ্যাংশ বণ্টন সম্পন্ন। বণ্টনযোগ্য: ৳${preview.distributableProfit.toLocaleString()} (${preview.items.length} জন সদস্য) | সংবিধিবদ্ধ সঞ্চিতি: ৳${preview.reserveFundAmount.toLocaleString()}`,
      paidToOrReceivedFrom: `সমিতির ${preview.items.length} জন সদস্যবৃন্দ`,
      paymentMethod: params.disbursementMethod === 'CREDIT_TO_SAVINGS' ? 'BANK' : 'CASH'
    });

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'DISBURSE',
      entity: 'DIVIDEND',
      entityId: sessionId,
      descriptionBn: `বার্ষিক লভ্যাংশ বণ্টন কার্যকর করা হয়েছে: অর্থবছর ${params.financialYear} | মোট নিট মুনাফা: ৳${params.totalNetProfit.toLocaleString()} | সদস্য সংখ্যা: ${preview.items.length} জন`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return { session, items: generatedItems };
  }

  // --------------------------------------------------------------------------
  // MODULE 5: FIXED DEPOSIT (FDR) & DOUBLE GROWTH SCHEME METHODS
  // --------------------------------------------------------------------------
  createFDRScheme(scheme: Omit<FDRTenureScheme, 'id' | 'tenantId'>): FDRTenureScheme {
    const newScheme: FDRTenureScheme = {
      ...scheme,
      id: `fdr-sch-${Date.now()}`,
      tenantId: this.currentTenantId
    };
    this.fdrSchemes.push(newScheme);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'FDR',
      entityId: newScheme.id,
      descriptionBn: `নতুন মেয়াদী আমানত স্কিম তৈরি: ${newScheme.nameBn} (${newScheme.tenureMonths} মাস, ${newScheme.annualProfitRatePercent}%)`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });
    this.save();
    return newScheme;
  }

  updateFDRScheme(schemeId: string, updates: Partial<FDRTenureScheme>): FDRTenureScheme | null {
    const scheme = this.fdrSchemes.find(s => s.id === schemeId);
    if (!scheme) return null;
    Object.assign(scheme, updates);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'FDR',
      entityId: schemeId,
      descriptionBn: `মেয়াদী আমানত স্কিম হালনাগাদ: ${scheme.nameBn}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });
    this.save();
    return scheme;
  }

  openFDRAccount(params: {
    memberId: string;
    schemeId: string;
    principalAmount: number;
    nomineeNameBn: string;
    nomineeRelation: string;
    nomineeNidOrPhone: string;
    paymentMethod: PaymentMethod;
    autoRenewal: boolean;
    notes?: string;
  }): FixedDepositAccount {
    const member = this.members.find(m => m.id === params.memberId);
    const scheme = this.fdrSchemes.find(s => s.id === params.schemeId);
    if (!member) throw new Error('সদস্য পাওয়া যায়নি');
    if (!scheme) throw new Error('এফডিআর স্কিম পাওয়া যায়নি');

    const today = new Date().toISOString().split('T')[0];
    const openDateObj = new Date();
    const matDateObj = new Date(openDateObj);
    matDateObj.setMonth(matDateObj.getMonth() + scheme.tenureMonths);
    const maturityDate = matDateObj.toISOString().split('T')[0];

    const fdrCount = this.fdrAccounts.length + 1;
    const fdrNumber = `FDR-${new Date().getFullYear()}-${String(fdrCount).padStart(3, '0')}`;
    const certificateNo = `CERT-FDR-${Math.floor(10000 + Math.random() * 90000)}`;

    let totalExpectedProfit = 0;
    let maturityAmount = 0;
    if (scheme.isDoubleScheme) {
      totalExpectedProfit = params.principalAmount;
      maturityAmount = params.principalAmount * 2;
    } else {
      totalExpectedProfit = Math.round((params.principalAmount * scheme.annualProfitRatePercent * (scheme.tenureMonths / 12)) / 100);
      maturityAmount = params.principalAmount + totalExpectedProfit;
    }

    const voucher = this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'CREDIT',
      category: 'স্থায়ী আমানত (FDR) মূলধন প্রাপ্তি',
      accountHeadCode: '2030',
      accountHeadNameBn: 'স্থায়ী আমানত (FDR) দায় তহবিল',
      debitAccount: params.paymentMethod === 'BANK' ? '১০২০: ব্যাংক চলতি হিসাব' : '১০১০: হাতে নগদ ক্যাশ',
      creditAccount: '২০৩০: স্থায়ী আমানত (FDR) দায় তহবিল',
      amount: params.principalAmount,
      descriptionBn: `স্থায়ী আমানত (FDR) হিসাব খোলা: ${member.nameBn} (${member.memberCode}) | স্কিম: ${scheme.nameBn} | সনদ নং: ${certificateNo}`,
      paidToOrReceivedFrom: member.nameBn,
      paymentMethod: params.paymentMethod
    });

    const newFDR: FixedDepositAccount = {
      id: `fdr-acc-${Date.now()}`,
      tenantId: this.currentTenantId,
      fdrNumber,
      certificateNo,
      memberId: member.id,
      memberCode: member.memberCode,
      memberNameBn: member.nameBn,
      memberPhone: member.phone,
      nomineeNameBn: params.nomineeNameBn,
      nomineeRelation: params.nomineeRelation,
      nomineeNidOrPhone: params.nomineeNidOrPhone,
      schemeId: scheme.id,
      schemeNameBn: scheme.nameBn,
      tenureMonths: scheme.tenureMonths,
      principalAmount: params.principalAmount,
      annualProfitRatePercent: scheme.annualProfitRatePercent,
      profitPayoutFrequency: scheme.profitPayoutFrequency,
      isDoubleScheme: scheme.isDoubleScheme,
      totalExpectedProfit,
      maturityAmount,
      openingDate: today,
      maturityDate,
      paymentMethod: params.paymentMethod,
      autoRenewal: params.autoRenewal,
      status: 'ACTIVE',
      totalProfitPaid: 0,
      voucherId: voucher.id,
      voucherNo: voucher.voucherNo,
      notes: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.fdrAccounts.unshift(newFDR);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'FDR',
      entityId: newFDR.id,
      descriptionBn: `নতুন এফডিআর খোলা হয়েছে: ${fdrNumber} | গ্রাহক: ${member.nameBn} | মূল আমানত: ৳${params.principalAmount.toLocaleString()}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newFDR;
  }

  disburseFDRProfit(fdrId: string, params: {
    profitAmount: number;
    periodLabel: string;
    payoutDestination: 'CREDIT_SAVINGS' | 'CASH_PAYOUT';
    notes?: string;
  }): FDRProfitPayment {
    const fdr = this.fdrAccounts.find(a => a.id === fdrId);
    if (!fdr) throw new Error('এফডিআর হিসাব পাওয়া যায়নি');

    const today = new Date().toISOString().split('T')[0];
    const voucherNo = `VR-FDR-PAY-${Date.now().toString().slice(-4)}`;

    let savingsTxId: string | undefined = undefined;
    if (params.payoutDestination === 'CREDIT_SAVINGS') {
      const genSavings = this.savingsAccounts.find(s => s.memberId === fdr.memberId && s.type === 'GENERAL_SAVINGS');
      if (genSavings) {
        const tx = this.recordSavingsDeposit({
          tenantId: this.currentTenantId,
          memberId: fdr.memberId,
          accountId: genSavings.id,
          amount: params.profitAmount,
          paymentMethod: 'CASH',
          notes: `এফডিআর মুনাফা ক্রেডিট (${fdr.fdrNumber} - ${params.periodLabel})`
        });
        savingsTxId = tx.id;
      }
    }

    this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'DEBIT',
      category: 'স্থায়ী আমানত (FDR) মুনাফা প্রদান',
      accountHeadCode: '4070',
      accountHeadNameBn: 'স্থায়ী আমানত (FDR) মুনাফা প্রদান ব্যয়',
      debitAccount: '৪০৭০: স্থায়ী আমানত (FDR) মুনাফা প্রদান ব্যয়',
      creditAccount: params.payoutDestination === 'CREDIT_SAVINGS' ? '২০১০: সদস্যদের সাধারণ সঞ্চয় আমানত' : '১০১০: হাতে নগদ ক্যাশ',
      amount: params.profitAmount,
      descriptionBn: `এফডিআর মুনাফা প্রদান: ${fdr.memberNameBn} (${fdr.fdrNumber}) | সময়কাল: ${params.periodLabel} | মাধ্যম: ${params.payoutDestination === 'CREDIT_SAVINGS' ? 'সঞ্চয় হিসেবে জমা' : 'ক্যাশ উত্তোলন'}`,
      paidToOrReceivedFrom: fdr.memberNameBn,
      paymentMethod: params.payoutDestination === 'CREDIT_SAVINGS' ? 'BANK' : 'CASH'
    });

    const paymentRecord: FDRProfitPayment = {
      id: `fdr-pay-${Date.now()}`,
      tenantId: this.currentTenantId,
      fdrId: fdr.id,
      fdrNumber: fdr.fdrNumber,
      memberId: fdr.memberId,
      memberNameBn: fdr.memberNameBn,
      paymentDate: today,
      periodLabel: params.periodLabel,
      profitAmount: params.profitAmount,
      taxOrFee: 0,
      netPaidAmount: params.profitAmount,
      payoutDestination: params.payoutDestination,
      savingsTransactionId: savingsTxId,
      voucherNo,
      notes: params.notes,
      createdAt: new Date().toISOString()
    };

    fdr.totalProfitPaid += params.profitAmount;
    fdr.lastProfitPaymentDate = today;
    fdr.updatedAt = new Date().toISOString();

    this.fdrProfitPayments.unshift(paymentRecord);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'DISBURSE',
      entity: 'FDR',
      entityId: fdr.id,
      descriptionBn: `এফডিআর মুনাফা প্রদান: ${fdr.fdrNumber} | গ্রাহক: ${fdr.memberNameBn} | পরিমাণ: ৳${params.profitAmount.toLocaleString()} (${params.periodLabel})`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return paymentRecord;
  }

  settleOrCloseFDR(fdrId: string, params: {
    isPremature: boolean;
    settlementAmount: number;
    remarks?: string;
    payoutDestination: 'CREDIT_SAVINGS' | 'CASH_PAYOUT';
  }): FixedDepositAccount {
    const fdr = this.fdrAccounts.find(a => a.id === fdrId);
    if (!fdr) throw new Error('এফডিআর হিসাব পাওয়া যায়নি');

    const today = new Date().toISOString().split('T')[0];

    if (params.payoutDestination === 'CREDIT_SAVINGS') {
      const genSavings = this.savingsAccounts.find(s => s.memberId === fdr.memberId && s.type === 'GENERAL_SAVINGS');
      if (genSavings) {
        this.recordSavingsDeposit({
          tenantId: this.currentTenantId,
          memberId: fdr.memberId,
          accountId: genSavings.id,
          amount: params.settlementAmount,
          paymentMethod: 'CASH',
          notes: `এফডিআর হিসাব ক্লোজার নিষ্পত্তি (${fdr.fdrNumber})`
        });
      }
    }

    this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'DEBIT',
      category: params.isPremature ? 'স্থায়ী আমানত (FDR) অকাল উত্তোলন ও মেয়াদপূর্ব সমাপ্তি' : 'স্থায়ী আমানত (FDR) পূর্ণ মেয়াদান্তে আসল ও লভ্যাংশ নিষ্পত্তি',
      accountHeadCode: '2030',
      accountHeadNameBn: 'স্থায়ী আমানত (FDR) দায় তহবিল',
      debitAccount: '২০৩০: স্থায়ী আমানত (FDR) দায় তহবিল',
      creditAccount: params.payoutDestination === 'CREDIT_SAVINGS' ? '২০১০: সদস্যদের সাধারণ সঞ্চয় আমানত' : '১০১০: হাতে নগদ ক্যাশ',
      amount: params.settlementAmount,
      descriptionBn: `এফডিআর সমাপ্তি: ${fdr.memberNameBn} (${fdr.fdrNumber}) | আসল: ৳${fdr.principalAmount.toLocaleString()} | মোট পরিশোধ: ৳${params.settlementAmount.toLocaleString()} ${params.isPremature ? '(মেয়াদপূর্ব ভাঙা)' : '(মেয়াদোত্তীর্ণ)'}`,
      paidToOrReceivedFrom: fdr.memberNameBn,
      paymentMethod: params.payoutDestination === 'CREDIT_SAVINGS' ? 'BANK' : 'CASH'
    });

    fdr.status = params.isPremature ? 'CLOSED_PREMATURE' : 'SETTLED';
    fdr.closedDate = today;
    fdr.closedAmount = params.settlementAmount;
    fdr.updatedAt = new Date().toISOString();
    if (params.remarks) {
      fdr.notes = (fdr.notes ? fdr.notes + ' | ' : '') + params.remarks;
    }

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'FDR',
      entityId: fdr.id,
      descriptionBn: `এফডিআর নিষ্পত্তি সম্পন্ন: ${fdr.fdrNumber} | স্ট্যাটাস: ${fdr.status} | পরিশোধিত অঙ্ক: ৳${params.settlementAmount.toLocaleString()}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return fdr;
  }

  // --------------------------------------------------------------------------
  // MODULE 6: FIXED ASSET & INVENTORY STOCK REGISTER METHODS
  // --------------------------------------------------------------------------
  createFixedAsset(data: {
    nameBn: string;
    nameEn?: string;
    category: FixedAssetCategory;
    purchaseDate: string;
    purchasePrice: number;
    salvageValue: number;
    usefulLifeYears: number;
    depreciationMethod: AssetDepreciationMethod;
    annualDepreciationRatePercent?: number;
    location: string;
    custodianOfficer: string;
    serialNumber?: string;
    vendorOrSupplier?: string;
    warrantyExpiryDate?: string;
    notes?: string;
  }): FixedAsset {
    const assetCode = `AST-${new Date().getFullYear()}-${String(this.fixedAssets.length + 1).padStart(3, '0')}`;
    const rate = data.annualDepreciationRatePercent || Math.round((100 / (data.usefulLifeYears || 5)) * 10) / 10;

    const voucher = this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'DEBIT',
      category: 'স্থাবর সম্পদ ও অফিস সরঞ্জাম ক্রয়',
      accountHeadCode: '1040',
      accountHeadNameBn: 'অফিস আসবাবপত্র ও কম্পিউটার সরঞ্জাম',
      debitAccount: '১০৪০: অফিস আসবাবপত্র ও কম্পিউটার সরঞ্জাম',
      creditAccount: '১০১০: হাতে নগদ ক্যাশ',
      amount: data.purchasePrice,
      descriptionBn: `স্থায়ী সম্পদ অন্তর্ভুক্তি: ${data.nameBn} (${assetCode}) | সরবরাহকারী: ${data.vendorOrSupplier || 'স্থানীয় বাজার'}`,
      paidToOrReceivedFrom: data.vendorOrSupplier || 'সরবরাহকারী',
      paymentMethod: 'CASH'
    });

    const newAsset: FixedAsset = {
      id: `ast-${Date.now()}`,
      tenantId: this.currentTenantId,
      assetCode,
      nameBn: data.nameBn,
      nameEn: data.nameEn || '',
      category: data.category,
      purchaseDate: data.purchaseDate,
      purchasePrice: data.purchasePrice,
      salvageValue: data.salvageValue,
      usefulLifeYears: data.usefulLifeYears,
      depreciationMethod: data.depreciationMethod,
      annualDepreciationRatePercent: rate,
      accumulatedDepreciation: 0,
      currentBookValue: data.purchasePrice,
      location: data.location,
      custodianOfficer: data.custodianOfficer,
      serialNumber: data.serialNumber,
      vendorOrSupplier: data.vendorOrSupplier,
      warrantyExpiryDate: data.warrantyExpiryDate,
      status: 'ACTIVE',
      voucherNo: voucher.voucherNo,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.fixedAssets.unshift(newAsset);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'FIXED_ASSET',
      entityId: newAsset.id,
      descriptionBn: `নতুন স্থায়ী সম্পদ নিবন্ধন: ${newAsset.nameBn} (${assetCode}) | মূল্য: ৳${data.purchasePrice.toLocaleString()}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newAsset;
  }

  runAssetDepreciation(financialYear: string, selectedAssetIds?: string[]): {
    totalDepreciation: number;
    processedAssetsCount: number;
    voucherNo: string;
  } {
    const today = new Date().toISOString().split('T')[0];
    const eligibleAssets = this.fixedAssets.filter(a => 
      a.tenantId === this.currentTenantId &&
      a.status === 'ACTIVE' &&
      a.currentBookValue > a.salvageValue &&
      (!selectedAssetIds || selectedAssetIds.includes(a.id))
    );

    let totalDepreciation = 0;
    const voucherNo = `VR-DEP-${Date.now().toString().slice(-4)}`;

    eligibleAssets.forEach(asset => {
      let annualDep = 0;
      if (asset.depreciationMethod === 'STRAIGHT_LINE') {
        const depreciableBase = Math.max(0, asset.purchasePrice - asset.salvageValue);
        annualDep = Math.max(0, Math.round(depreciableBase / (asset.usefulLifeYears || 5)));
      } else {
        annualDep = Math.max(0, Math.round((asset.currentBookValue * (asset.annualDepreciationRatePercent || 10)) / 100));
      }

      const maxAllowedDep = Math.max(0, asset.currentBookValue - asset.salvageValue);
      const finalDep = Math.min(annualDep, maxAllowedDep);

      if (finalDep > 0) {
        const openingBookValue = asset.currentBookValue;
        asset.accumulatedDepreciation += finalDep;
        asset.currentBookValue -= finalDep;
        asset.lastDepreciationDate = today;
        asset.updatedAt = new Date().toISOString();
        totalDepreciation += finalDep;

        const depLog: AssetDepreciationLog = {
          id: `ast-dep-${Date.now()}-${asset.id}`,
          tenantId: this.currentTenantId,
          assetId: asset.id,
          assetCode: asset.assetCode,
          assetNameBn: asset.nameBn,
          nameBn: asset.nameBn,
          financialYear,
          depreciationDate: today,
          openingBookValue,
          depreciationAmount: finalDep,
          closingBookValue: asset.currentBookValue,
          voucherNo,
          calculatedBy: this.users.find(u => u.id === this.currentUserId)?.nameBn || 'হিসাবরক্ষক',
          createdAt: new Date().toISOString()
        };
        this.assetDepreciations.unshift(depLog);
      }
    });

    if (totalDepreciation > 0) {
      this.createVoucher({
        tenantId: this.currentTenantId,
        type: 'JOURNAL',
        category: 'বার্ষিক স্থাবর সম্পদ অবচয় ধার্যকরণ',
        accountHeadCode: '4080',
        accountHeadNameBn: 'স্থাবর ও অফিস সম্পদের বার্ষিক অবচয় ব্যয়',
        debitAccount: '৪০৮০: স্থাবর ও অফিস সম্পদের বার্ষিক অবচয় ব্যয়',
        creditAccount: '১০৫০: পুঞ্জীভূত অবচয় সঞ্চিতি তহবিল',
        amount: totalDepreciation,
        descriptionBn: `অর্থবছর ${financialYear}-এর স্থায়ী সম্পদের বার্ষিক অবচয় কার্যকর করা হয়েছে (${eligibleAssets.length}টি সম্পদ)`,
        paidToOrReceivedFrom: 'অভ্যন্তরীণ হিসাব সামঞ্জস্য',
        paymentMethod: 'CASH'
      });

      this.addAuditLog({
        tenantId: this.currentTenantId,
        action: 'UPDATE',
        entity: 'FIXED_ASSET',
        entityId: voucherNo,
        descriptionBn: `বার্ষিক অবচয় গণনা ও জাবেদা ভাউচার কার্যকর: অর্থবছর ${financialYear} | মোট অবচয়: ৳${totalDepreciation.toLocaleString()}`,
        performedBy: this.currentUserId,
        performedByRole: 'ADMIN'
      });
    }

    this.save();
    return {
      totalDepreciation,
      processedAssetsCount: eligibleAssets.length,
      voucherNo
    };
  }

  disposeFixedAsset(assetId: string, params: {
    disposalDate: string;
    disposalAmount: number;
    reason: string;
    disposalType: 'SOLD' | 'SCRAPPED';
    buyerName?: string;
  }): FixedAsset {
    const asset = this.fixedAssets.find(a => a.id === assetId);
    if (!asset) throw new Error('সম্পদ পাওয়া যায়নি');

    const voucherNo = `VR-AST-DISP-${Date.now().toString().slice(-4)}`;
    const gainOrLoss = params.disposalAmount - asset.currentBookValue;

    if (params.disposalAmount > 0) {
      this.createVoucher({
        tenantId: this.currentTenantId,
        type: 'CREDIT',
        category: 'স্থাবর সম্পদ বিক্রয় বা নিষ্পত্তি প্রাপ্তি',
        accountHeadCode: '1040',
        accountHeadNameBn: 'অফিস আসবাবপত্র ও কম্পিউটার সরঞ্জাম',
        debitAccount: '১০১০: হাতে নগদ ক্যাশ',
        creditAccount: '১০৪০: অফিস আসবাবপত্র ও কম্পিউটার সরঞ্জাম',
        amount: params.disposalAmount,
        descriptionBn: `সম্পদ নিষ্পত্তি বিক্রয়: ${asset.nameBn} (${asset.assetCode}) | ক্রেতা: ${params.buyerName || 'সাধারণ ক্রেতা'} | পুস্তক মূল্য: ৳${asset.currentBookValue.toLocaleString()} | লাভ/ক্ষতি: ৳${gainOrLoss.toLocaleString()}`,
        paidToOrReceivedFrom: params.buyerName || 'ক্রেতা',
        paymentMethod: 'CASH'
      });
    }

    asset.status = params.disposalType === 'SOLD' ? 'DISPOSED' : 'SCRAPPED';
    asset.disposedDate = params.disposalDate;
    asset.disposalAmount = params.disposalAmount;
    asset.disposalVoucherNo = voucherNo;
    asset.notes = (asset.notes ? asset.notes + ' | ' : '') + `নিষ্পত্তি কারণ: ${params.reason}`;
    asset.updatedAt = new Date().toISOString();

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'DELETE',
      entity: 'FIXED_ASSET',
      entityId: asset.id,
      descriptionBn: `স্থায়ী সম্পদ নিষ্পত্তি সম্পন্ন: ${asset.nameBn} (${asset.assetCode}) | প্রকার: ${params.disposalType} | বিক্রয় মূল্য: ৳${params.disposalAmount.toLocaleString()}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return asset;
  }

  createInventoryItem(data: {
    nameBn: string;
    nameEn?: string;
    category: InventoryItemCategory;
    unit: string;
    currentStock: number;
    reorderLevel: number;
    unitCost: number;
    location: string;
    notes?: string;
  }): InventoryItem {
    const itemCode = `INV-${new Date().getFullYear()}-${String(this.inventoryItems.length + 1).padStart(2, '0')}`;
    const newItem: InventoryItem = {
      id: `inv-item-${Date.now()}`,
      tenantId: this.currentTenantId,
      itemCode,
      nameBn: data.nameBn,
      nameEn: data.nameEn || '',
      category: data.category,
      unit: data.unit,
      currentStock: data.currentStock,
      reorderLevel: data.reorderLevel,
      unitCost: data.unitCost,
      totalStockValue: data.currentStock * data.unitCost,
      location: data.location,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.inventoryItems.unshift(newItem);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'INVENTORY',
      entityId: newItem.id,
      descriptionBn: `নতুন ইনভেন্টরি পণ্য নথিভুক্ত: ${newItem.nameBn} (${itemCode}) | প্রারম্ভিক স্টক: ${data.currentStock} ${data.unit}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newItem;
  }

  recordStockMovement(params: {
    itemId: string;
    type: InventoryMovementType;
    quantity: number;
    unitCost?: number;
    date: string;
    recipientOrSource: string;
    referenceNo: string;
    purpose: string;
    performedBy: string;
  }): InventoryMovement {
    const item = this.inventoryItems.find(i => i.id === params.itemId);
    if (!item) throw new Error('ইনভেন্টরি পণ্য পাওয়া যায়নি');

    const effectiveUnitCost = params.unitCost !== undefined ? params.unitCost : item.unitCost;
    const totalCost = params.quantity * effectiveUnitCost;

    if (params.type === 'STOCK_IN') {
      item.currentStock += params.quantity;
      if (params.unitCost) item.unitCost = params.unitCost;
      item.totalStockValue = item.currentStock * item.unitCost;

      this.createVoucher({
        tenantId: this.currentTenantId,
        type: 'DEBIT',
        category: 'প্রিন্টিং ও অফিস স্টেশনারি ইনভেন্টরি ক্রয়',
        accountHeadCode: '4040',
        accountHeadNameBn: 'প্রিন্টিং, স্টেশনারি ও পাসবুক প্রকাশনা',
        debitAccount: '৪০৪০: প্রিন্টিং, স্টেশনারি ও পাসবুক প্রকাশনা',
        creditAccount: '১০১০: হাতে নগদ ক্যাশ',
        amount: totalCost,
        descriptionBn: `ইনভেন্টরি স্টক গ্রহণ: ${item.nameBn} (${params.quantity} ${item.unit}) | চালান/বিল নং: ${params.referenceNo}`,
        paidToOrReceivedFrom: params.recipientOrSource,
        paymentMethod: 'CASH'
      });
    } else if (params.type === 'STOCK_OUT') {
      if (item.currentStock < params.quantity) {
        throw new Error(`অপর্যাপ্ত স্টক! বর্তমান স্টক মাত্র ${item.currentStock} ${item.unit}`);
      }
      item.currentStock -= params.quantity;
      item.totalStockValue = item.currentStock * item.unitCost;
    } else if (params.type === 'ADJUSTMENT') {
      item.currentStock = params.quantity;
      item.totalStockValue = item.currentStock * item.unitCost;
    }

    item.updatedAt = new Date().toISOString();

    const movement: InventoryMovement = {
      id: `inv-mov-${Date.now()}`,
      tenantId: this.currentTenantId,
      itemId: item.id,
      itemCode: item.itemCode,
      itemNameBn: item.nameBn,
      type: params.type,
      quantity: params.quantity,
      unitCost: effectiveUnitCost,
      totalCost,
      date: params.date,
      recipientOrSource: params.recipientOrSource,
      referenceNo: params.referenceNo,
      purpose: params.purpose,
      performedBy: params.performedBy,
      createdAt: new Date().toISOString()
    };

    this.inventoryMovements.unshift(movement);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: params.type === 'STOCK_IN' ? 'CREATE' : 'UPDATE',
      entity: 'INVENTORY',
      entityId: movement.id,
      descriptionBn: `স্টক মুভমেন্ট (${params.type}): ${item.nameBn} | পরিমাণ: ${params.quantity} ${item.unit} | অবশিষ্ট স্টক: ${item.currentStock} ${item.unit}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return movement;
  }

  // ====================================================
  // MODULE 7: STAFF PAYROLL, ATTENDANCE & HR MANAGEMENT
  // ====================================================

  createStaffEmployee(data: {
    nameBn: string;
    nameEn?: string;
    phone: string;
    email?: string;
    nid: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    designation: StaffDesignation;
    department: StaffDepartment;
    joiningDate: string;
    basicSalary: number;
    houseRentAllowance: number;
    medicalAllowance: number;
    conveyanceAllowance: number;
    mobileInternetAllowance: number;
    providentFundDeduction?: number;
    taxDeduction?: number;
    paymentMethod: SalaryPaymentMethod;
    bankName?: string;
    bankBranch?: string;
    bankAccountNo?: string;
    bankRoutingNo?: string;
    mfsNumber?: string;
    presentAddress: string;
    permanentAddress: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    bloodGroup?: string;
    notes?: string;
  }): StaffEmployee {
    const codeNumber = this.staffEmployees.length + 1;
    const employeeCode = `EMP-${new Date().getFullYear()}-${String(codeNumber).padStart(2, '0')}`;
    const grossSalary = data.basicSalary + data.houseRentAllowance + data.medicalAllowance + 
                        data.conveyanceAllowance + data.mobileInternetAllowance;

    const newEmp: StaffEmployee = {
      id: `emp-${Date.now()}`,
      tenantId: this.currentTenantId,
      employeeCode,
      nameBn: data.nameBn,
      nameEn: data.nameEn || '',
      phone: data.phone,
      email: data.email,
      nid: data.nid,
      gender: data.gender,
      designation: data.designation,
      department: data.department,
      joiningDate: data.joiningDate,
      status: 'ACTIVE',
      basicSalary: data.basicSalary,
      houseRentAllowance: data.houseRentAllowance,
      medicalAllowance: data.medicalAllowance,
      conveyanceAllowance: data.conveyanceAllowance,
      mobileInternetAllowance: data.mobileInternetAllowance,
      grossSalary,
      providentFundDeduction: data.providentFundDeduction || 0,
      taxDeduction: data.taxDeduction || 0,
      paymentMethod: data.paymentMethod,
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      bankAccountNo: data.bankAccountNo,
      bankRoutingNo: data.bankRoutingNo,
      mfsNumber: data.mfsNumber,
      presentAddress: data.presentAddress,
      permanentAddress: data.permanentAddress,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      emergencyContactRelation: data.emergencyContactRelation,
      bloodGroup: data.bloodGroup,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.staffEmployees.unshift(newEmp);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'STAFF',
      entityId: newEmp.id,
      descriptionBn: `নতুন কর্মকর্তা/কর্মচারী নথিভুক্ত: ${newEmp.nameBn} (${newEmp.employeeCode}) | পদবী: ${newEmp.designation} | মূল বেতন: ৳${newEmp.basicSalary.toLocaleString()}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newEmp;
  }

  updateStaffEmployee(id: string, updates: Partial<StaffEmployee>): StaffEmployee {
    const emp = this.staffEmployees.find(e => e.id === id);
    if (!emp) throw new Error('কর্মকর্তা/কর্মচারী খুঁজে পাওয়া যায়নি');

    Object.assign(emp, updates);
    emp.grossSalary = emp.basicSalary + emp.houseRentAllowance + emp.medicalAllowance + 
                      emp.conveyanceAllowance + emp.mobileInternetAllowance;
    emp.updatedAt = new Date().toISOString();

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'STAFF',
      entityId: emp.id,
      descriptionBn: `কর্মকর্তা/কর্মচারীর তথ্য হালনাগাদ: ${emp.nameBn} (${emp.employeeCode})`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return emp;
  }

  recordStaffAttendance(params: {
    employeeId: string;
    date: string;
    inTime?: string;
    outTime?: string;
    status: AttendanceStatus;
    lateMinutes?: number;
    overtimeHours?: number;
    remarks?: string;
  }): StaffAttendance {
    const emp = this.staffEmployees.find(e => e.id === params.employeeId);
    if (!emp) throw new Error('কর্মকর্তা/কর্মচারী খুঁজে পাওয়া যায়নি');

    const existingIndex = this.staffAttendances.findIndex(
      a => a.employeeId === params.employeeId && a.date === params.date && a.tenantId === this.currentTenantId
    );

    let record: StaffAttendance;
    if (existingIndex >= 0) {
      record = {
        ...this.staffAttendances[existingIndex],
        status: params.status,
        inTime: params.inTime !== undefined ? params.inTime : this.staffAttendances[existingIndex].inTime,
        outTime: params.outTime !== undefined ? params.outTime : this.staffAttendances[existingIndex].outTime,
        lateMinutes: params.lateMinutes !== undefined ? params.lateMinutes : this.staffAttendances[existingIndex].lateMinutes,
        overtimeHours: params.overtimeHours !== undefined ? params.overtimeHours : this.staffAttendances[existingIndex].overtimeHours,
        remarks: params.remarks !== undefined ? params.remarks : this.staffAttendances[existingIndex].remarks,
        recordedBy: this.currentUserId
      };
      this.staffAttendances[existingIndex] = record;
    } else {
      record = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenantId: this.currentTenantId,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeNameBn: emp.nameBn,
        date: params.date,
        inTime: params.inTime || '09:00',
        outTime: params.outTime || '17:00',
        status: params.status,
        lateMinutes: params.lateMinutes || 0,
        overtimeHours: params.overtimeHours || 0,
        remarks: params.remarks,
        recordedBy: this.currentUserId,
        createdAt: new Date().toISOString()
      };
      this.staffAttendances.unshift(record);
    }

    this.save();
    return record;
  }

  bulkRecordStaffAttendance(date: string, records: Array<{
    employeeId: string;
    status: AttendanceStatus;
    inTime?: string;
    outTime?: string;
    remarks?: string;
  }>): void {
    for (const r of records) {
      this.recordStaffAttendance({
        employeeId: r.employeeId,
        date,
        status: r.status,
        inTime: r.inTime,
        outTime: r.outTime,
        remarks: r.remarks
      });
    }
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'ATTENDANCE',
      entityId: date,
      descriptionBn: `তারিখের দৈনিক হাজিরা বাল্ক এন্ট্রি সম্পন্ন: ${date} (${records.length} জন)`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });
    this.save();
  }

  requestStaffAdvance(params: {
    employeeId: string;
    amount: number;
    purpose: string;
    repaymentMonths: number;
  }): StaffAdvanceSalary {
    const emp = this.staffEmployees.find(e => e.id === params.employeeId);
    if (!emp) throw new Error('কর্মকর্তা/কর্মচারী খুঁজে পাওয়া যায়নি');

    const advanceNo = `ADV-${new Date().getFullYear()}-${String(this.staffAdvanceSalaries.length + 1).padStart(2, '0')}`;
    const monthlyDeductionAmount = Math.ceil(params.amount / Math.max(1, params.repaymentMonths));

    const newAdvance: StaffAdvanceSalary = {
      id: `adv-${Date.now()}`,
      tenantId: this.currentTenantId,
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      employeeNameBn: emp.nameBn,
      advanceNo,
      requestDate: new Date().toISOString().split('T')[0],
      amount: params.amount,
      purpose: params.purpose,
      repaymentMonths: params.repaymentMonths,
      monthlyDeductionAmount,
      remainingBalance: params.amount,
      status: 'APPROVED',
      approvedBy: this.currentUserId,
      approvedAt: new Date().toISOString().split('T')[0],
      disbursedDate: new Date().toISOString().split('T')[0],
      disbursedVoucherNo: `VCH-DR-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Auto-generate Debit Voucher in Ledger
    this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'DEBIT',
      category: 'কর্মকর্তা-কর্মচারীদের অগ্রিম বেতন প্রদান',
      accountHeadCode: '1050',
      accountHeadNameBn: 'কর্মকর্তা/কর্মচারীদের অগ্রিম বেতন ও লোন',
      debitAccount: '১০৫০: কর্মকর্তা/কর্মচারীদের অগ্রিম বেতন ও লোন',
      creditAccount: '১০১০: হাতে নগদ ক্যাশ',
      amount: params.amount,
      descriptionBn: `অগ্রিম বেতন প্রদান: ${emp.nameBn} (${advanceNo}) | কারণ: ${params.purpose}`,
      paidToOrReceivedFrom: emp.nameBn,
      paymentMethod: emp.paymentMethod === 'BANK_TRANSFER' ? 'BANK' : emp.paymentMethod === 'CASH' ? 'CASH' : 'MFS'
    });

    this.staffAdvanceSalaries.unshift(newAdvance);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'STAFF_ADVANCE',
      entityId: newAdvance.id,
      descriptionBn: `অগ্রিম বেতন অনুমোদন ও প্রদান: ${emp.nameBn} | পরিমাণ: ৳${params.amount.toLocaleString()} | কিস্তি: ${params.repaymentMonths} মাস`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return newAdvance;
  }

  generateMonthlyPayroll(monthYear: string): StaffPayslip[] {
    const activeStaff = this.staffEmployees.filter(
      e => e.tenantId === this.currentTenantId && (e.status === 'ACTIVE' || e.status === 'ON_LEAVE')
    );

    const [year, month] = monthYear.split('-');
    const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const monthIndex = parseInt(month, 10) - 1;
    const salaryMonthBn = `${monthNamesBn[monthIndex] || month} ${year}`;

    const createdPayslips: StaffPayslip[] = [];

    activeStaff.forEach((emp, idx) => {
      // Check if payslip already exists
      const existing = this.staffPayslips.find(
        p => p.tenantId === this.currentTenantId && p.employeeId === emp.id && p.monthYear === monthYear
      );
      if (existing) {
        createdPayslips.push(existing);
        return;
      }

      // Check active advance balance
      const activeAdvance = this.staffAdvanceSalaries.find(
        a => a.tenantId === this.currentTenantId && a.employeeId === emp.id && a.status === 'DISBURSED' && a.remainingBalance > 0
      );
      const advanceSalaryDeduction = activeAdvance ? Math.min(activeAdvance.monthlyDeductionAmount, activeAdvance.remainingBalance) : 0;

      // Summary of attendance in this month
      const monthAttendances = this.staffAttendances.filter(
        a => a.tenantId === this.currentTenantId && a.employeeId === emp.id && a.date.startsWith(monthYear)
      );
      const presentDays = monthAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length || 26;
      const lateDays = monthAttendances.filter(a => a.status === 'LATE').length;
      const leaveDays = monthAttendances.filter(a => a.status === 'LEAVE_CASUAL' || a.status === 'LEAVE_SICK').length;
      const absentDays = monthAttendances.filter(a => a.status === 'ABSENT').length;

      const workingDays = 26;
      const dailySalary = Math.round(emp.basicSalary / 30);
      const unpaidLeaveDeduction = absentDays > 0 ? absentDays * dailySalary : 0;
      const lateFineDeduction = lateDays >= 3 ? Math.round(dailySalary * 0.5) : 0;

      const totalEarnings = emp.basicSalary + emp.houseRentAllowance + emp.medicalAllowance + 
                            emp.conveyanceAllowance + emp.mobileInternetAllowance;
      const totalDeductions = emp.providentFundDeduction + emp.taxDeduction + 
                              advanceSalaryDeduction + unpaidLeaveDeduction + lateFineDeduction;
      const netPayable = Math.max(0, totalEarnings - totalDeductions);

      const payslip: StaffPayslip = {
        id: `pay-slip-${Date.now()}-${idx}`,
        tenantId: this.currentTenantId,
        payslipNo: `PAY-${year}${month}-${String(idx + 1).padStart(2, '0')}`,
        monthYear,
        salaryMonthBn,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeNameBn: emp.nameBn,
        designation: emp.designation,
        department: emp.department,
        paymentMethod: emp.paymentMethod,
        disbursementAccount: emp.paymentMethod === 'BANK_TRANSFER' ? '১০২০: সোনালী ব্যাংক চলতি হিসাব' : '১০১০: হাতে নগদ ক্যাশ',
        workingDays,
        presentDays,
        absentDays,
        leaveDays,
        lateDays,
        overtimeHours: 0,
        basicSalary: emp.basicSalary,
        houseRent: emp.houseRentAllowance,
        medical: emp.medicalAllowance,
        conveyance: emp.conveyanceAllowance,
        mobileInternet: emp.mobileInternetAllowance,
        overtimePay: 0,
        festivalBonus: 0,
        performanceBonus: 0,
        totalEarnings,
        providentFund: emp.providentFundDeduction,
        tax: emp.taxDeduction,
        advanceSalaryDeduction,
        unpaidLeaveDeduction,
        lateFineDeduction,
        otherDeductions: 0,
        totalDeductions,
        netPayable,
        paymentStatus: 'UNPAID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.staffPayslips.unshift(payslip);
      createdPayslips.push(payslip);
    });

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'PAYROLL',
      entityId: monthYear,
      descriptionBn: `মাসিক পে-রোল শীট জেনারেট সম্পন্ন: ${salaryMonthBn} (মোট ${createdPayslips.length} জন কর্মী)`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return createdPayslips;
  }

  disburseStaffPayslip(payslipId: string, params: {
    paymentMethod: SalaryPaymentMethod;
    disbursementAccount: string;
    bonus?: number;
    remarks?: string;
  }): StaffPayslip {
    const payslip = this.staffPayslips.find(p => p.id === payslipId);
    if (!payslip) throw new Error('পে-স্লিপ খুঁজে পাওয়া যায়নি');
    if (payslip.paymentStatus === 'PAID') throw new Error('এই পে-স্লিপটি ইতিমধ্যে পরিশোধিত হয়েছে');

    if (params.bonus && params.bonus > 0) {
      payslip.performanceBonus = params.bonus;
      payslip.totalEarnings += params.bonus;
      payslip.netPayable += params.bonus;
    }

    payslip.paymentMethod = params.paymentMethod;
    payslip.disbursementAccount = params.disbursementAccount;
    payslip.paymentStatus = 'PAID';
    payslip.paymentDate = new Date().toISOString().split('T')[0];
    payslip.disbursedBy = this.currentUserId;
    payslip.disbursedAt = new Date().toISOString();
    payslip.remarks = params.remarks || `${payslip.salaryMonthBn} এর নিয়মিত মাসিক বেতন পরিশোধ`;

    // 1. Generate DEBIT Voucher in General Ledger (Accounts Integration)
    const voucher = this.createVoucher({
      tenantId: this.currentTenantId,
      type: 'DEBIT',
      category: 'কর্মকর্তা-কর্মচারীদের বেতন ও ভাতাদি',
      accountHeadCode: '4010',
      accountHeadNameBn: 'কর্মকর্তা-কর্মচারীদের বেতন ও ভাতাদি',
      debitAccount: '৪০১০: কর্মকর্তা-কর্মচারীদের বেতন ও ভাতাদি',
      creditAccount: params.disbursementAccount,
      amount: payslip.netPayable,
      descriptionBn: `মাসিক বেতন পরিশোধ: ${payslip.employeeNameBn} (${payslip.employeeCode}) | মাস: ${payslip.salaryMonthBn} | পে-স্লিপ: ${payslip.payslipNo}`,
      paidToOrReceivedFrom: payslip.employeeNameBn,
      paymentMethod: params.paymentMethod === 'BANK_TRANSFER' ? 'BANK' : params.paymentMethod === 'CASH' ? 'CASH' : 'MFS'
    });
    payslip.voucherNo = voucher.voucherNo;

    // 2. Adjust Advance Salary Balance if deducted
    if (payslip.advanceSalaryDeduction > 0) {
      const advance = this.staffAdvanceSalaries.find(
        a => a.tenantId === this.currentTenantId && a.employeeId === payslip.employeeId && a.status === 'DISBURSED' && a.remainingBalance > 0
      );
      if (advance) {
        advance.remainingBalance = Math.max(0, advance.remainingBalance - payslip.advanceSalaryDeduction);
        if (advance.remainingBalance <= 0) {
          advance.status = 'REPAID';
        }
        advance.updatedAt = new Date().toISOString();
      }
    }

    // 3. Automated SMS / WhatsApp Notification
    const employee = this.staffEmployees.find(e => e.id === payslip.employeeId);
    if (employee && employee.phone) {
      const notifText = `শুভেচ্ছা ${employee.nameBn}, আপনার ${payslip.salaryMonthBn} মাসের নিট বেতন ৳${payslip.netPayable.toLocaleString()} সফলভাবে ${params.paymentMethod} এর মাধ্যমে প্রদান করা হয়েছে। পে-স্লিপ নং: ${payslip.payslipNo}। হিসাব শাখা, একতা সমবায় সমিতি।`;
      this.sendNotification({
        recipientPhone: employee.phone,
        recipientName: employee.nameBn,
        channel: 'WHATSAPP',
        event: 'STAFF_SALARY_DISBURSEMENT',
        messageText: notifText,
        employeeId: employee.id,
        referenceId: payslip.payslipNo
      });
    }

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'PAYROLL',
      entityId: payslip.id,
      descriptionBn: `স্টাফ বেতন প্রদান সম্পন্ন: ${payslip.employeeNameBn} | মাস: ${payslip.salaryMonthBn} | নিট পরিশোধ: ৳${payslip.netPayable.toLocaleString()} | ভাউচার: ${voucher.voucherNo}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return payslip;
  }

  bulkDisburseMonthlyPayroll(monthYear: string, params: {
    paymentMethod: SalaryPaymentMethod;
    disbursementAccount: string;
  }): { totalDisbursed: number; count: number } {
    const unpaid = this.staffPayslips.filter(
      p => p.tenantId === this.currentTenantId && p.monthYear === monthYear && p.paymentStatus === 'UNPAID'
    );

    let totalDisbursed = 0;
    let count = 0;

    for (const payslip of unpaid) {
      this.disburseStaffPayslip(payslip.id, {
        paymentMethod: params.paymentMethod,
        disbursementAccount: params.disbursementAccount
      });
      totalDisbursed += payslip.netPayable;
      count++;
    }

    this.save();
    return { totalDisbursed, count };
  }

  // ====================================================
  // MODULE 8: SMS / WHATSAPP GATEWAY & AUTOMATED NOTIFICATIONS
  // ====================================================

  updateNotificationTemplate(id: string, updates: Partial<NotificationTemplate>): NotificationTemplate {
    const tpl = this.notificationTemplates.find(t => t.id === id);
    if (!tpl) throw new Error('টেমপ্লেট খুঁজে পাওয়া যায়নি');
    Object.assign(tpl, updates);
    tpl.updatedAt = new Date().toISOString();
    this.save();
    return tpl;
  }

  updateSmsGatewaySettings(settings: Partial<SmsGatewaySettings>): SmsGatewaySettings {
    Object.assign(this.smsGatewaySettings, settings);
    this.save();
    return this.smsGatewaySettings;
  }

  updateWhatsAppGatewaySettings(settings: Partial<WhatsAppGatewaySettings>): WhatsAppGatewaySettings {
    Object.assign(this.whatsAppGatewaySettings, settings);
    this.save();
    return this.whatsAppGatewaySettings;
  }

  sendNotification(params: {
    recipientPhone: string;
    recipientName: string;
    channel: ReminderChannel;
    event: NotificationTriggerEvent;
    messageText: string;
    memberId?: string;
    employeeId?: string;
    referenceId?: string;
  }): { success: boolean; message: string; waMeUrl?: string } {
    const cleanPhone = params.recipientPhone.replace(/[^0-9]/g, '').slice(-11);
    const waMeUrl = `https://wa.me/88${cleanPhone}?text=${encodeURIComponent(params.messageText)}`;

    // Decrement SMS quota if local SIM or SMS gateway
    if (params.channel === 'SMS' && this.smsGatewaySettings.balanceCount > 0) {
      this.smsGatewaySettings.balanceCount -= 1;
    }

    const log: NotificationLog = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: this.currentTenantId,
      recipientMemberId: params.memberId,
      recipientEmployeeId: params.employeeId,
      recipientName: params.recipientName,
      recipientPhone: cleanPhone,
      channel: params.channel,
      event: params.event,
      messageText: params.messageText,
      status: 'DELIVERED',
      gatewayResponse: params.channel === 'WHATSAPP' 
        ? 'Direct wa.me Instant Launcher Prepared' 
        : `${this.smsGatewaySettings.provider} API: Message Queued`,
      referenceId: params.referenceId,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sentBy: this.currentUserId
    };

    this.notificationLogs.unshift(log);
    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'CREATE',
      entity: 'NOTIFICATION',
      entityId: log.id,
      descriptionBn: `নোটিফিকেশন পাঠানো হয়েছে (${params.channel}): ${params.recipientName} (${cleanPhone}) | ইভেন্ট: ${params.event}`,
      performedBy: this.currentUserId,
      performedByRole: 'ADMIN'
    });

    this.save();
    return {
      success: true,
      message: 'বার্তা সফলভাবে পাঠানো হয়েছে',
      waMeUrl
    };
  }

  bulkSendNotifications(params: {
    recipientList: Array<{ phone: string; name: string; memberId?: string; employeeId?: string }>;
    channel: ReminderChannel;
    event: NotificationTriggerEvent;
    messageText: string;
  }): { totalSent: number; channel: ReminderChannel } {
    let sentCount = 0;
    for (const r of params.recipientList) {
      const personalMsg = params.messageText.replace(/{{memberName}}/g, r.name).replace(/{{employeeName}}/g, r.name);
      this.sendNotification({
        recipientPhone: r.phone,
        recipientName: r.name,
        channel: params.channel,
        event: params.event,
        messageText: personalMsg,
        memberId: r.memberId,
        employeeId: r.employeeId
      });
      sentCount++;
    }
    this.save();
    return { totalSent: sentCount, channel: params.channel };
  }
}

export const store = new DataStore();

// React Hook to subscribe to store changes
export function useSamityStore() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    store.init();
    const handleUpdate = () => setVersion(v => v + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const activeTenant = store.tenants.find(t => t.id === store.currentTenantId) || store.tenants[0];
  const currentUser = store.users.find(u => u.id === store.currentUserId) || store.users[0];

  return {
    store,
    version,
    tenants: store.tenants,
    activeTenant,
    currentUser,
    users: store.users,
    members: store.members.filter(m => m.tenantId === activeTenant?.id),
    savingsTransactions: store.savingsTransactions.filter(t => t.tenantId === activeTenant?.id),
    loans: store.loans.filter(l => l.tenantId === activeTenant?.id),
    vouchers: store.vouchers.filter(v => v.tenantId === activeTenant?.id),
    chartOfAccounts: store.chartOfAccounts.filter(c => c.tenantId === activeTenant?.id),
    meetings: store.meetings.filter(m => m.tenantId === activeTenant?.id),
    elections: store.elections.filter(e => e.tenantId === activeTenant?.id),
    events: store.events.filter(e => e.tenantId === activeTenant?.id || !e.tenantId),
    subscriptions: store.subscriptions.filter(s => s.tenantId === activeTenant?.id),
    bankDeposits: store.bankDeposits.filter(b => b.tenantId === activeTenant?.id),
    receipts: store.receipts.filter(r => r.tenantId === activeTenant?.id),
    notices: store.notices.filter(n => n.tenantId === activeTenant?.id),
    documents: store.documents.filter(d => d.tenantId === activeTenant?.id),
    letterhead: store.letterhead,
    reminders: store.reminders.filter(r => r.tenantId === activeTenant?.id),
    signatureSeal: store.signatureSeal,
    voucherPrefix: store.voucherPrefix,
    auditLogs: store.auditLogs.filter(a => a.tenantId === activeTenant?.id),
    approvalItems: store.approvalItems.filter(a => a.tenantId === activeTenant?.id),
    generatedDocs: store.generatedDocs.filter(g => g.tenantId === activeTenant?.id),
    gatewayConfig: store.gatewayConfig,
    schedulerConfig: store.schedulerConfig,
    offlineQueue: store.offlineQueue,
    language: store.language,
    setLanguage: (lang: Language) => store.setLanguage(lang),
    setCurrentTenant: (id: string) => store.setCurrentTenant(id),
    setCurrentUser: (id: string) => store.setCurrentUser(id),
    updateLetterhead: (config: LetterheadConfig) => store.updateLetterhead(config),
    updateSignatureSeal: (config: Partial<SignatureSealConfig>) => store.updateSignatureSeal(config),
    updateVoucherPrefix: (config: Partial<VoucherPrefixConfig>) => store.updateVoucherPrefix(config),
    updateTenantProfile: (tenantId: string, updates: Partial<Tenant>) => store.updateTenantProfile(tenantId, updates),
    updateGatewayConfig: (config: Partial<CommunicationGatewayConfig>) => store.updateGatewayConfig(config),
    updateSchedulerConfig: (config: Partial<AutoSchedulerConfig>) => store.updateSchedulerConfig(config),
    sendOmnichannelReminder: (params: Parameters<typeof store.sendOmnichannelReminder>[0]) => store.sendOmnichannelReminder(params),
    sendBulkOmnichannelReminders: (channel: ReminderChannel) => store.sendBulkOmnichannelReminders(channel),
    queueOfflineAction: (action: Parameters<typeof store.queueOfflineAction>[0]) => store.queueOfflineAction(action),
    syncOfflineQueue: () => store.syncOfflineQueue(),
    clearOfflineQueue: () => store.clearOfflineQueue(),
    recordBulkBankDeposits: (items: BulkDepositItem[], approvedBy?: string) => store.recordBulkBankDeposits(items, approvedBy),
    addAuditLog: (entry: Parameters<typeof store.addAuditLog>[0]) => store.addAuditLog(entry),
    updateApprovalStatus: (id: string, status: ApprovalStatus, approvedBy: string, rejectionReason?: string) => store.updateApprovalStatus(id, status, approvedBy, rejectionReason),
    addApprovalItem: (item: Parameters<typeof store.addApprovalItem>[0]) => store.addApprovalItem(item),
    addGeneratedDocument: (doc: Parameters<typeof store.addGeneratedDocument>[0]) => store.addGeneratedDocument(doc),
    exportFullBackup: () => store.exportFullBackup(),
    restoreFullBackup: (json: string) => store.restoreFullBackup(json),
    exportTableToCsv: (table: Parameters<typeof store.exportTableToCsv>[0]) => store.exportTableToCsv(table),
    addMember: (memberData: Parameters<typeof store.addMember>[0]) => store.addMember(memberData),
    updateMember: (memberId: string, updates: Partial<Member>) => store.updateMember(memberId, updates),
    softDeleteMember: (memberId: string, reason?: string) => store.softDeleteMember(memberId, reason),
    toggleMemberStatus: (memberId: string, status: MemberStatus) => store.toggleMemberStatus(memberId, status),
    bulkImportMembers: (tenantId: string, newMembers: Parameters<typeof store.bulkImportMembers>[1]) => store.bulkImportMembers(tenantId, newMembers),
    subscriptionPolicy: store.getSubscriptionPolicy(activeTenant?.id || 'samity-ekota'),
    lateFeeWaivers: store.lateFeeWaivers.filter(w => w.tenantId === activeTenant?.id),
    updateSubscriptionPolicy: (updates: Partial<SubscriptionPolicyConfig>) => store.updateSubscriptionPolicy(activeTenant?.id || 'samity-ekota', updates),
    generateMonthlyDues: (monthYear: string, monthNameBn: string) => store.generateMonthlyDues(activeTenant?.id || 'samity-ekota', monthYear, monthNameBn),
    waiveLateFee: (subscriptionId: string, waivedAmount: number, reason: string) => store.waiveLateFee(subscriptionId, waivedAmount, reason),
    applyOverdueLateFees: () => store.applyOverdueLateFees(activeTenant?.id || 'samity-ekota'),
    savingsAccounts: store.savingsAccounts.filter(a => a.tenantId === activeTenant?.id),
    savingsPolicy: store.getSavingsPolicy(activeTenant?.id || 'samity-ekota'),
    openSavingsAccount: (params: Parameters<typeof store.openSavingsAccount>[0]) => store.openSavingsAccount(params),
    recordSavingsDeposit: (params: Parameters<typeof store.recordSavingsDeposit>[0]) => store.recordSavingsDeposit(params),
    recordSavingsWithdrawal: (params: Parameters<typeof store.recordSavingsWithdrawal>[0]) => store.recordSavingsWithdrawal(params),
    closeOrSettleSavingsAccount: (params: Parameters<typeof store.closeOrSettleSavingsAccount>[0]) => store.closeOrSettleSavingsAccount(params),
    updateSavingsPolicy: (updates: Partial<SavingsPolicyConfig>) => store.updateSavingsPolicy(activeTenant?.id || 'samity-ekota', updates),
    loanPolicy: store.getLoanPolicy(activeTenant?.id || 'samity-ekota'),
    applyLoan: (params: Parameters<typeof store.applyLoan>[0]) => store.applyLoan(params),
    approveOrRejectLoan: (params: Parameters<typeof store.approveOrRejectLoan>[0]) => store.approveOrRejectLoan(params),
    disburseLoan: (params: Parameters<typeof store.disburseLoan>[0]) => store.disburseLoan(params),
    collectLoanInstallment: (params: Parameters<typeof store.collectLoanInstallment>[0]) => store.collectLoanInstallment(params),
    waiveLoanPenalty: (loanId: string, installmentNumber: number, amount: number, reason: string) => store.waiveLoanPenalty(loanId, installmentNumber, amount, reason),
    updateLoanPolicy: (updates: Partial<LoanPolicyConfig>) => store.updateLoanPolicy(activeTenant?.id || 'samity-ekota', updates),
    createVoucher: (params: Parameters<typeof store.createVoucher>[0]) => store.createVoucher(params),
    approveVoucher: (voucherId: string, approvedBy: string) => store.approveVoucher(voucherId, approvedBy),
    rejectVoucher: (voucherId: string, rejectedBy: string, reason: string) => store.rejectVoucher(voucherId, rejectedBy, reason),
    addAccountHead: (headData: Parameters<typeof store.addAccountHead>[0]) => store.addAccountHead(headData),
    updateAccountHead: (id: string, updates: Partial<AccountHead>) => store.updateAccountHead(id, updates),
    getCashBook: (startDate?: string, endDate?: string) => store.getCashBook(activeTenant?.id || 'samity-ekota', startDate, endDate),
    getBankBook: (startDate?: string, endDate?: string) => store.getBankBook(activeTenant?.id || 'samity-ekota', startDate, endDate),
    getGeneralLedger: (headCode: string) => store.getGeneralLedger(activeTenant?.id || 'samity-ekota', headCode),
    getTrialBalance: () => store.getTrialBalance(activeTenant?.id || 'samity-ekota'),
    getIncomeStatement: () => store.getIncomeStatement(activeTenant?.id || 'samity-ekota'),
    getBalanceSheet: () => store.getBalanceSheet(activeTenant?.id || 'samity-ekota'),
    createMeeting: (meetingData: Parameters<typeof store.createMeeting>[0]) => store.createMeeting(meetingData),
    updateMeeting: (meetingId: string, updates: Parameters<typeof store.updateMeeting>[1]) => store.updateMeeting(meetingId, updates),
    softDeleteMeeting: (meetingId: string, reason?: string) => store.softDeleteMeeting(meetingId, reason),
    startMeeting: (meetingId: string) => store.startMeeting(meetingId),
    completeMeeting: (meetingId: string, data: Parameters<typeof store.completeMeeting>[1]) => store.completeMeeting(meetingId, data),
    recordAttendance: (meetingId: string, attendees: Parameters<typeof store.recordAttendance>[1]) => store.recordAttendance(meetingId, attendees),
    addAgendaItem: (meetingId: string, item: Parameters<typeof store.addAgendaItem>[1]) => store.addAgendaItem(meetingId, item),
    updateAgendaItem: (meetingId: string, agendaId: string, updates: Parameters<typeof store.updateAgendaItem>[2]) => store.updateAgendaItem(meetingId, agendaId, updates),
    addResolution: (meetingId: string, resData: Parameters<typeof store.addResolution>[1]) => store.addResolution(meetingId, resData),
    publishMeetingNotice: (meetingId: string) => store.publishMeetingNotice(meetingId),
    publishNotice: (noticeData: Parameters<typeof store.publishNotice>[0]) => store.publishNotice(noticeData),
    pinNotice: (noticeId: string, isPinned: boolean) => store.pinNotice(noticeId, isPinned),
    deleteNotice: (noticeId: string) => store.deleteNotice(noticeId),
    createElection: (electionData: Parameters<typeof store.createElection>[0]) => store.createElection(electionData),
    updateElection: (electionId: string, updates: Parameters<typeof store.updateElection>[1]) => store.updateElection(electionId, updates),
    updateElectionStatus: (electionId: string, newStatus: Parameters<typeof store.updateElectionStatus>[1]) => store.updateElectionStatus(electionId, newStatus),
    addCandidate: (electionId: string, candidateData: Parameters<typeof store.addCandidate>[1]) => store.addCandidate(electionId, candidateData),
    updateCandidateStatus: (electionId: string, candidateId: string, status: Parameters<typeof store.updateCandidateStatus>[2]) => store.updateCandidateStatus(electionId, candidateId, status),
    castVote: (electionId: string, candidateId: string, voterMemberId?: string) => store.castVote(electionId, candidateId, voterMemberId),
    castMultiPostBallot: (electionId: string, voterMemberId: string, votes: Parameters<typeof store.castMultiPostBallot>[2]) => store.castMultiPostBallot(electionId, voterMemberId, votes),
    toggleVoterEligibility: (electionId: string, memberId: string, isEligible: boolean, reason?: string) => store.toggleVoterEligibility(electionId, memberId, isEligible, reason),
    publishElectionResults: (electionId: string, certifiedBy: string) => store.publishElectionResults(electionId, certifiedBy),
    softDeleteElection: (electionId: string, reason?: string) => store.softDeleteElection(electionId, reason),
    logReportAction: (reportNameBn: string, format: string) => store.logReportAction(reportNameBn, format),

    // Module: Online Payment Gateways (bKash / Nagad / Rocket / SSLCommerz)
    paymentGatewayConfig: store.paymentGatewayConfig,
    onlinePayments: store.onlinePayments.filter(p => p.tenantId === activeTenant?.id),
    updatePaymentGatewayConfig: (config: Partial<PaymentGatewayConfig>) => store.updatePaymentGatewayConfig(config),
    initiateOnlinePayment: (params: Parameters<typeof store.initiateOnlinePayment>[0]) => store.initiateOnlinePayment(params),
    verifyOnlinePayment: (params: Parameters<typeof store.verifyOnlinePayment>[0]) => store.verifyOnlinePayment(params),

    // Module: Field Collector Desk & Bluetooth Thermal POS Receipt (58mm/80mm)
    fieldCollections: store.fieldCollections.filter(c => c.tenantId === activeTenant?.id),
    fieldDayEnds: store.fieldDayEnds.filter(d => d.tenantId === activeTenant?.id),
    thermalPrinterConfig: store.thermalPrinterConfig,
    updateThermalPrinterConfig: (config: Partial<ThermalPrinterConfig>) => store.updateThermalPrinterConfig(config),
    recordFieldCollection: (params: Parameters<typeof store.recordFieldCollection>[0]) => store.recordFieldCollection(params),
    submitFieldDayEndSummary: (params: Parameters<typeof store.submitFieldDayEndSummary>[0]) => store.submitFieldDayEndSummary(params),
    approveFieldDayEndSummary: (id: string, cashierName: string, remarks?: string) => store.approveFieldDayEndSummary(id, cashierName, remarks),

    // Module 3: Project & Joint Investment Portfolio
    projects: store.projects.filter(p => p.tenantId === activeTenant?.id),
    projectInvestments: store.projectInvestments.filter(i => i.tenantId === activeTenant?.id),
    projectTransactions: store.projectTransactions.filter(t => t.tenantId === activeTenant?.id),
    createProject: (data: Parameters<typeof store.createProject>[0]) => store.createProject(data),
    updateProject: (id: string, updates: Parameters<typeof store.updateProject>[1]) => store.updateProject(id, updates),
    recordProjectInvestment: (params: Parameters<typeof store.recordProjectInvestment>[0]) => store.recordProjectInvestment(params),
    recordProjectTransaction: (params: Parameters<typeof store.recordProjectTransaction>[0]) => store.recordProjectTransaction(params),
    closeProjectAndDistributeProfit: (projectId: string, declaredProfit: number, remarks?: string) => store.closeProjectAndDistributeProfit(projectId, declaredProfit, remarks),

    // Module 4: Share Capital & Dividend Distribution Engine
    shareConfig: store.shareConfig,
    memberShares: store.memberShares.filter(s => s.tenantId === activeTenant?.id),
    dividendSessions: store.dividendSessions.filter(s => s.tenantId === activeTenant?.id),
    dividendItems: store.dividendItems.filter(d => d.tenantId === activeTenant?.id),
    updateShareConfig: (config: Partial<ShareCapitalConfig>) => store.updateShareConfig(config),
    issueSharesToMember: (params: Parameters<typeof store.issueSharesToMember>[0]) => store.issueSharesToMember(params),
    calculateDividendPreview: (params: Parameters<typeof store.calculateDividendPreview>[0]) => store.calculateDividendPreview(params),
    createAndDisburseDividendSession: (params: Parameters<typeof store.createAndDisburseDividendSession>[0]) => store.createAndDisburseDividendSession(params),

    // Module 5: Fixed Deposit (FDR) & Double Growth Scheme
    fdrSchemes: store.fdrSchemes.filter(s => s.tenantId === activeTenant?.id),
    fdrAccounts: store.fdrAccounts.filter(a => a.tenantId === activeTenant?.id),
    fdrProfitPayments: store.fdrProfitPayments.filter(p => p.tenantId === activeTenant?.id),
    createFDRScheme: (scheme: Parameters<typeof store.createFDRScheme>[0]) => store.createFDRScheme(scheme),
    updateFDRScheme: (schemeId: string, updates: Parameters<typeof store.updateFDRScheme>[1]) => store.updateFDRScheme(schemeId, updates),
    openFDRAccount: (params: Parameters<typeof store.openFDRAccount>[0]) => store.openFDRAccount(params),
    disburseFDRProfit: (fdrId: string, params: Parameters<typeof store.disburseFDRProfit>[1]) => store.disburseFDRProfit(fdrId, params),
    settleOrCloseFDR: (fdrId: string, params: Parameters<typeof store.settleOrCloseFDR>[1]) => store.settleOrCloseFDR(fdrId, params),

    // Module 6: Fixed Asset & Inventory Stock Register
    fixedAssets: store.fixedAssets.filter(a => a.tenantId === activeTenant?.id),
    assetDepreciations: store.assetDepreciations.filter(d => d.tenantId === activeTenant?.id),
    inventoryItems: store.inventoryItems.filter(i => i.tenantId === activeTenant?.id),
    inventoryMovements: store.inventoryMovements.filter(m => m.tenantId === activeTenant?.id),
    createFixedAsset: (data: Parameters<typeof store.createFixedAsset>[0]) => store.createFixedAsset(data),
    runAssetDepreciation: (financialYear: string, selectedAssetIds?: string[]) => store.runAssetDepreciation(financialYear, selectedAssetIds),
    disposeFixedAsset: (assetId: string, params: Parameters<typeof store.disposeFixedAsset>[1]) => store.disposeFixedAsset(assetId, params),
    createInventoryItem: (data: Parameters<typeof store.createInventoryItem>[0]) => store.createInventoryItem(data),
    recordStockMovement: (params: Parameters<typeof store.recordStockMovement>[0]) => store.recordStockMovement(params),

    // Module 7: Staff Payroll, Attendance & HR Management
    staffEmployees: store.staffEmployees.filter(e => e.tenantId === activeTenant?.id),
    staffAttendances: store.staffAttendances.filter(a => a.tenantId === activeTenant?.id),
    staffAdvanceSalaries: store.staffAdvanceSalaries.filter(a => a.tenantId === activeTenant?.id),
    staffPayslips: store.staffPayslips.filter(p => p.tenantId === activeTenant?.id),
    createStaffEmployee: (data: Parameters<typeof store.createStaffEmployee>[0]) => store.createStaffEmployee(data),
    updateStaffEmployee: (id: string, updates: Parameters<typeof store.updateStaffEmployee>[1]) => store.updateStaffEmployee(id, updates),
    recordStaffAttendance: (params: Parameters<typeof store.recordStaffAttendance>[0]) => store.recordStaffAttendance(params),
    bulkRecordStaffAttendance: (date: string, records: Parameters<typeof store.bulkRecordStaffAttendance>[1]) => store.bulkRecordStaffAttendance(date, records),
    requestStaffAdvance: (params: Parameters<typeof store.requestStaffAdvance>[0]) => store.requestStaffAdvance(params),
    generateMonthlyPayroll: (monthYear: string) => store.generateMonthlyPayroll(monthYear),
    disburseStaffPayslip: (payslipId: string, params: Parameters<typeof store.disburseStaffPayslip>[1]) => store.disburseStaffPayslip(payslipId, params),
    bulkDisburseMonthlyPayroll: (monthYear: string, params: Parameters<typeof store.bulkDisburseMonthlyPayroll>[1]) => store.bulkDisburseMonthlyPayroll(monthYear, params),

    // Module 8: SMS / WhatsApp Gateway & Automated Notifications
    notificationTemplates: store.notificationTemplates.filter(t => t.tenantId === activeTenant?.id),
    smsGatewaySettings: store.smsGatewaySettings,
    whatsAppGatewaySettings: store.whatsAppGatewaySettings,
    notificationLogs: store.notificationLogs.filter(l => l.tenantId === activeTenant?.id),
    updateNotificationTemplate: (id: string, updates: Parameters<typeof store.updateNotificationTemplate>[1]) => store.updateNotificationTemplate(id, updates),
    updateSmsGatewaySettings: (settings: Parameters<typeof store.updateSmsGatewaySettings>[0]) => store.updateSmsGatewaySettings(settings),
    updateWhatsAppGatewaySettings: (settings: Parameters<typeof store.updateWhatsAppGatewaySettings>[0]) => store.updateWhatsAppGatewaySettings(settings),
    sendNotification: (params: Parameters<typeof store.sendNotification>[0]) => store.sendNotification(params),
    bulkSendNotifications: (params: Parameters<typeof store.bulkSendNotifications>[0]) => store.bulkSendNotifications(params),
  };
}
