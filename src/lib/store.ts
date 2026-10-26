'use client';

import { useState, useEffect } from 'react';
import { 
  Tenant, User, Member, SavingsAccount, SavingsTransaction, 
  Loan, Voucher, Meeting, Election, RealtimeEvent, Language,
  MonthlySubscription, BankDeposit, PaidReceipt, Notice, SamityDocument, LetterheadConfig, DueReminder,
  SignatureSealConfig, VoucherPrefixConfig, BulkDepositItem,
  AuditLog, ApprovalItem, GeneratedDocument, ApprovalStatus,
  CommunicationGatewayConfig, AutoSchedulerConfig, OfflineQueueItem, ReminderChannel
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
  INITIAL_GATEWAY_CONFIG, INITIAL_SCHEDULER_CONFIG, INITIAL_OFFLINE_QUEUE
} from './db';

const STORAGE_KEYS = {
  TENANTS: 'samitypro_tenants',
  USERS: 'samitypro_users',
  MEMBERS: 'samitypro_members',
  SAVINGS_ACCOUNTS: 'samitypro_savings_accs',
  SAVINGS_TX: 'samitypro_savings_tx',
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

// In-memory fallback / cache
class DataStore {
  tenants: Tenant[] = INITIAL_TENANTS;
  users: User[] = INITIAL_USERS;
  members: Member[] = INITIAL_MEMBERS;
  savingsAccounts: SavingsAccount[] = INITIAL_SAVINGS_ACCOUNTS;
  savingsTransactions: SavingsTransaction[] = INITIAL_SAVINGS_TRANSACTIONS;
  loans: Loan[] = INITIAL_LOANS;
  vouchers: Voucher[] = INITIAL_VOUCHERS;
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

  currentTenantId: string = 'samity-ekota';
  currentUserId: string = 'user-rafiq';
  language: Language = 'bn';
  initialized = false;

  init() {
    if (typeof window === 'undefined' || this.initialized) return;
    try {
      const storedTenants = localStorage.getItem(STORAGE_KEYS.TENANTS);
      if (storedTenants) this.tenants = JSON.parse(storedTenants);
      else localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(this.tenants));

      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (storedMembers) this.members = JSON.parse(storedMembers);
      else localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(this.members));

      const storedSavingsTx = localStorage.getItem(STORAGE_KEYS.SAVINGS_TX);
      if (storedSavingsTx) this.savingsTransactions = JSON.parse(storedSavingsTx);
      else localStorage.setItem(STORAGE_KEYS.SAVINGS_TX, JSON.stringify(this.savingsTransactions));

      const storedLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (storedLoans) this.loans = JSON.parse(storedLoans);
      else localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(this.loans));

      const storedVouchers = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
      if (storedVouchers) this.vouchers = JSON.parse(storedVouchers);
      else localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(this.vouchers));

      const storedElections = localStorage.getItem(STORAGE_KEYS.ELECTIONS);
      if (storedElections) this.elections = JSON.parse(storedElections);
      else localStorage.setItem(STORAGE_KEYS.ELECTIONS, JSON.stringify(this.elections));

      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedEvents) this.events = JSON.parse(storedEvents);
      else localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));

      const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (storedSubs) this.subscriptions = JSON.parse(storedSubs);
      else localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(this.subscriptions));

      const storedBankDep = localStorage.getItem(STORAGE_KEYS.BANK_DEPOSITS);
      if (storedBankDep) this.bankDeposits = JSON.parse(storedBankDep);
      else localStorage.setItem(STORAGE_KEYS.BANK_DEPOSITS, JSON.stringify(this.bankDeposits));

      const storedReceipts = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (storedReceipts) this.receipts = JSON.parse(storedReceipts);
      else localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(this.receipts));

      const storedNotices = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (storedNotices) this.notices = JSON.parse(storedNotices);
      else localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(this.notices));

      const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (storedDocs) this.documents = JSON.parse(storedDocs);
      else localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(this.documents));

      const storedLetterhead = localStorage.getItem(STORAGE_KEYS.LETTERHEAD);
      if (storedLetterhead) this.letterhead = JSON.parse(storedLetterhead);
      else localStorage.setItem(STORAGE_KEYS.LETTERHEAD, JSON.stringify(this.letterhead));

      const storedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (storedReminders) this.reminders = JSON.parse(storedReminders);
      else localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(this.reminders));

      const storedSigSeal = localStorage.getItem(STORAGE_KEYS.SIGNATURE_SEAL);
      if (storedSigSeal) this.signatureSeal = JSON.parse(storedSigSeal);
      else localStorage.setItem(STORAGE_KEYS.SIGNATURE_SEAL, JSON.stringify(this.signatureSeal));

      const storedPrefix = localStorage.getItem(STORAGE_KEYS.VOUCHER_PREFIX);
      if (storedPrefix) this.voucherPrefix = JSON.parse(storedPrefix);
      else localStorage.setItem(STORAGE_KEYS.VOUCHER_PREFIX, JSON.stringify(this.voucherPrefix));

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
      else localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));

      const storedApprovals = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      if (storedApprovals) this.approvalItems = JSON.parse(storedApprovals);
      else localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(this.approvalItems));

      const storedGenDocs = localStorage.getItem(STORAGE_KEYS.GENERATED_DOCS);
      if (storedGenDocs) this.generatedDocs = JSON.parse(storedGenDocs);
      else localStorage.setItem(STORAGE_KEYS.GENERATED_DOCS, JSON.stringify(this.generatedDocs));

      const storedGateways = localStorage.getItem(STORAGE_KEYS.GATEWAY_CONFIG);
      if (storedGateways) this.gatewayConfig = JSON.parse(storedGateways);
      else localStorage.setItem(STORAGE_KEYS.GATEWAY_CONFIG, JSON.stringify(this.gatewayConfig));

      const storedSched = localStorage.getItem(STORAGE_KEYS.SCHEDULER_CONFIG);
      if (storedSched) this.schedulerConfig = JSON.parse(storedSched);
      else localStorage.setItem(STORAGE_KEYS.SCHEDULER_CONFIG, JSON.stringify(this.schedulerConfig));

      const storedQueue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (storedQueue) this.offlineQueue = JSON.parse(storedQueue);
      else localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.offlineQueue));

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
      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (storedMembers) this.members = JSON.parse(storedMembers);
      const storedLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (storedLoans) this.loans = JSON.parse(storedLoans);
      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedEvents) this.events = JSON.parse(storedEvents);
      const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (storedSubs) this.subscriptions = JSON.parse(storedSubs);
      const storedBankDep = localStorage.getItem(STORAGE_KEYS.BANK_DEPOSITS);
      if (storedBankDep) this.bankDeposits = JSON.parse(storedBankDep);
      const storedReceipts = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (storedReceipts) this.receipts = JSON.parse(storedReceipts);
      const storedNotices = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (storedNotices) this.notices = JSON.parse(storedNotices);
      const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (storedDocs) this.documents = JSON.parse(storedDocs);
      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
      const storedApprovals = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      if (storedApprovals) this.approvalItems = JSON.parse(storedApprovals);
      const storedGenDocs = localStorage.getItem(STORAGE_KEYS.GENERATED_DOCS);
      if (storedGenDocs) this.generatedDocs = JSON.parse(storedGenDocs);
      const storedGateways = localStorage.getItem(STORAGE_KEYS.GATEWAY_CONFIG);
      if (storedGateways) this.gatewayConfig = JSON.parse(storedGateways);
      const storedSched = localStorage.getItem(STORAGE_KEYS.SCHEDULER_CONFIG);
      if (storedSched) this.schedulerConfig = JSON.parse(storedSched);
      const storedQueue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (storedQueue) this.offlineQueue = JSON.parse(storedQueue);
      emitChange();
    } catch {}
  }

  save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(this.tenants));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(this.members));
      localStorage.setItem(STORAGE_KEYS.SAVINGS_TX, JSON.stringify(this.savingsTransactions));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(this.loans));
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(this.vouchers));
      localStorage.setItem(STORAGE_KEYS.ELECTIONS, JSON.stringify(this.elections));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(this.subscriptions));
      localStorage.setItem(STORAGE_KEYS.BANK_DEPOSITS, JSON.stringify(this.bankDeposits));
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(this.receipts));
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(this.notices));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(this.documents));
      localStorage.setItem(STORAGE_KEYS.LETTERHEAD, JSON.stringify(this.letterhead));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(this.reminders));
      localStorage.setItem(STORAGE_KEYS.SIGNATURE_SEAL, JSON.stringify(this.signatureSeal));
      localStorage.setItem(STORAGE_KEYS.VOUCHER_PREFIX, JSON.stringify(this.voucherPrefix));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(this.approvalItems));
      localStorage.setItem(STORAGE_KEYS.GENERATED_DOCS, JSON.stringify(this.generatedDocs));
      localStorage.setItem(STORAGE_KEYS.GATEWAY_CONFIG, JSON.stringify(this.gatewayConfig));
      localStorage.setItem(STORAGE_KEYS.SCHEDULER_CONFIG, JSON.stringify(this.schedulerConfig));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.offlineQueue));
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
    if (user && user.tenantId) {
      this.currentTenantId = user.tenantId;
    }
    this.save();
  }

  addMember(memberData: Omit<Member, 'id' | 'createdAt' | 'sharesHeld' | 'shareValue' | 'savingsBalance' | 'dpsBalance' | 'loanOutstanding'>) {
    const newId = `mem-${Date.now().toString().slice(-4)}`;
    const newMember: Member = {
      ...memberData,
      id: newId,
      sharesHeld: 10,
      shareValue: 10000,
      savingsBalance: 0,
      dpsBalance: 0,
      loanOutstanding: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.members.unshift(newMember);

    // Add voucher for admission fee
    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: memberData.tenantId,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: 'CREDIT',
      category: 'সদস্য ভর্তি ফি ও শেয়ার ফি',
      amount: memberData.admissionFee + 10000,
      descriptionBn: `নতুন সদস্য ${memberData.nameBn} (${memberData.memberCode}) এর ভর্তি ফি ও শেয়ার আদায়`,
      descriptionEn: `Admission fee & share payment for new member ${memberData.nameEn}`,
      paidToOrReceivedFrom: memberData.nameBn,
      paymentMethod: 'CASH',
      date: new Date().toISOString().split('T')[0],
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

    this.save();
    return newMember;
  }

  recordSavingsDeposit(params: {
    tenantId: string;
    memberId: string;
    accountId?: string;
    amount: number;
    paymentMethod: 'CASH' | 'BKASH' | 'NAGAD' | 'BANK';
    notes?: string;
  }) {
    const member = this.members.find(m => m.id === params.memberId);
    if (!member) return;

    member.savingsBalance += params.amount;

    const receiptNo = `RCT-${Date.now().toString().slice(-6)}`;
    const tx: SavingsTransaction = {
      id: `stx-${Date.now()}`,
      tenantId: params.tenantId,
      accountId: params.accountId || 'sav-gen',
      memberId: params.memberId,
      type: 'DEPOSIT',
      amount: params.amount,
      balanceAfter: member.savingsBalance,
      paymentMethod: params.paymentMethod,
      collectorId: this.currentUserId,
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      notes: params.notes || 'নিয়মিত সঞ্চয় জমা'
    };
    this.savingsTransactions.unshift(tx);

    // Add Credit voucher
    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: 'CREDIT',
      category: 'সদস্য সঞ্চয় জমা',
      amount: params.amount,
      descriptionBn: `${member.nameBn} (${member.memberCode}) এর সঞ্চয় হিসাব জমা। রসিদ: ${receiptNo}`,
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
      titleBn: 'সঞ্চয় জমা গ্রহণ সম্পন্ন',
      titleEn: 'Savings Deposit Received',
      messageBn: `${member.nameBn} জমা দিয়েছেন ৳ ${params.amount.toLocaleString()}। নতুন ব্যালান্স ৳ ${member.savingsBalance.toLocaleString()}`,
      messageEn: `${member.nameEn} deposited ৳ ${params.amount.toLocaleString()}. Balance: ৳ ${member.savingsBalance.toLocaleString()}`,
      amount: params.amount,
      memberId: member.id,
      memberName: member.nameBn
    });

    this.save();
    return tx;
  }

  collectLoanInstallment(params: {
    tenantId: string;
    loanId: string;
    amount: number;
    paymentMethod: 'CASH' | 'BKASH' | 'NAGAD' | 'BANK';
    notes?: string;
  }) {
    const loan = this.loans.find(l => l.id === params.loanId);
    if (!loan) return;

    const member = this.members.find(m => m.id === loan.memberId);
    loan.totalPaid += params.amount;
    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - params.amount);
    loan.paidInstallments += 1;

    if (member) {
      member.loanOutstanding = Math.max(0, member.loanOutstanding - params.amount);
    }

    if (loan.outstandingBalance === 0) {
      loan.status = 'COMPLETED';
    }

    // Add Credit voucher
    const voucher: Voucher = {
      id: `vch-${Date.now()}`,
      tenantId: params.tenantId,
      voucherNo: `VR-${Date.now().toString().slice(-4)}`,
      type: 'CREDIT',
      category: 'ঋণ কিস্তি আদায়',
      amount: params.amount,
      descriptionBn: `${member?.nameBn || 'সদস্য'} এর ঋণ নম্বর ${loan.loanNumber} এর কিস্তি আদায়`,
      descriptionEn: `Loan repayment collected for ${loan.loanNumber}`,
      paidToOrReceivedFrom: member?.nameBn || 'সদস্য',
      paymentMethod: params.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      createdBy: this.currentUserId
    };
    this.vouchers.unshift(voucher);

    this.addEvent({
      tenantId: params.tenantId,
      type: 'LOAN_INSTALLMENT_PAID',
      titleBn: 'ঋণের কিস্তি আদায় সম্পন্ন',
      titleEn: 'Loan Installment Collected',
      messageBn: `${member?.nameBn || 'সদস্য'} কিস্তি পরিশোধ করেছেন ৳ ${params.amount.toLocaleString()}। বকেয়া: ৳ ${loan.outstandingBalance.toLocaleString()}`,
      messageEn: `${member?.nameEn || 'Member'} paid ৳ ${params.amount.toLocaleString()}. Dues: ৳ ${loan.outstandingBalance.toLocaleString()}`,
      amount: params.amount,
      memberId: member?.id,
      memberName: member?.nameBn
    });

    this.save();
  }

  castVote(electionId: string, candidateId: string) {
    const election = this.elections.find(e => e.id === electionId);
    if (!election) return false;

    const candidate = election.candidates.find(c => c.id === candidateId);
    if (!candidate) return false;

    candidate.voteCount += 1;
    election.totalVotesCast += 1;

    this.addEvent({
      tenantId: election.tenantId,
      type: 'VOTE_CAST',
      titleBn: 'নতুন ভোট প্রদান করা হয়েছে',
      titleEn: 'New Vote Cast',
      messageBn: `${election.titleBn} নির্বাচনে ১টি নতুন গোপন ভোট সম্পন্ন হয়েছে। মোট ভোট: ${election.totalVotesCast}`,
      messageEn: `A vote was cast in ${election.titleEn}. Total votes: ${election.totalVotesCast}`,
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
      ipAddress: entry.ipAddress || '192.168.1.3'
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

    this.addAuditLog({
      tenantId: item.tenantId,
      action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
      entity: item.type === 'BANK_DEPOSIT' ? 'DEPOSIT' : item.type === 'LOAN_APPLICATION' ? 'LOAN' : 'EXPENSE',
      entityId: item.referenceId,
      descriptionBn: `${item.titleBn} - ${status === 'APPROVED' ? 'অনুমোদন করা হয়েছে' : `প্রত্যাখ্যান করা হয়েছে (${rejectionReason || ''})`}`,
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
      version: '1.0.2',
      exportedAt: new Date().toISOString(),
      tenantId: this.currentTenantId,
      tenants: this.tenants.filter(t => t.id === this.currentTenantId),
      members: this.members.filter(m => m.tenantId === this.currentTenantId),
      savingsTransactions: this.savingsTransactions.filter(t => t.tenantId === this.currentTenantId),
      loans: this.loans.filter(l => l.tenantId === this.currentTenantId),
      vouchers: this.vouchers.filter(v => v.tenantId === this.currentTenantId),
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

  restoreFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.tenantId || !data.members) {
        return { success: false, message: 'অবৈধ ব্যাকআপ ফাইল। প্রয়োজনীয় ডাটা ফিল্ড অনুপস্থিত।' };
      }

      if (data.members) this.members = data.members;
      if (data.savingsTransactions) this.savingsTransactions = data.savingsTransactions;
      if (data.loans) this.loans = data.loans;
      if (data.vouchers) this.vouchers = data.vouchers;
      if (data.subscriptions) this.subscriptions = data.subscriptions;
      if (data.bankDeposits) this.bankDeposits = data.bankDeposits;
      if (data.receipts) this.receipts = data.receipts;
      if (data.notices) this.notices = data.notices;
      if (data.letterhead) this.letterhead = data.letterhead;
      if (data.signatureSeal) this.signatureSeal = data.signatureSeal;
      if (data.voucherPrefix) this.voucherPrefix = data.voucherPrefix;
      if (data.approvalItems) this.approvalItems = data.approvalItems;
      if (data.generatedDocs) this.generatedDocs = data.generatedDocs;

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
    } catch (err: any) {
      return { success: false, message: `রিস্টোর ব্যর্থ: ${err.message}` };
    }
  }

  exportTableToCsv(tableName: 'members' | 'deposits' | 'receipts' | 'vouchers' | 'audit'): string {
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
    } else {
      const rows = this.auditLogs.filter(a => a.tenantId === tenantId);
      const headers = ['ID', 'Action', 'Entity', 'EntityID', 'Description', 'PerformedBy', 'Role', 'Timestamp', 'IP'];
      const lines = rows.map(r => `"${r.id}","${r.action}","${r.entity}","${r.entityId}","${r.descriptionBn}","${r.performedBy}","${r.performedByRole}","${r.timestamp}","${r.ipAddress || ''}"`);
      return [headers.join(','), ...lines].join('\n');
    }
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
      const cleanPhone = member.phone.replace(/[^0-9]/g, '');
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

    const reminder: DueReminder = {
      id: `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    const pendingItems = this.offlineQueue.filter(i => i.status === 'PENDING' || i.status === 'FAILED');
    let synced = 0;

    for (const item of pendingItems) {
      item.status = 'SYNCING';
      // In production, execute remote API call
      item.status = 'PENDING';
      synced++;
    }

    // Mark all as synced and empty queue
    const count = this.offlineQueue.length;
    this.offlineQueue = [];

    this.addAuditLog({
      tenantId: this.currentTenantId,
      action: 'UPDATE',
      entity: 'BACKUP',
      entityId: `sync-${Date.now()}`,
      descriptionBn: `অফলাইন কিউ থেকে মোট ${count}টি ডাটা রেকর্ড ক্লাউড ডাটাবেজে সফলভাবে সিঙ্ক সম্পন্ন হয়েছে।`,
      performedBy: 'মোবাইল সিঙ্ক ইঞ্জিন',
      performedByRole: 'SYSTEM'
    });

    this.save();
    return { syncedCount: count, failedCount: 0 };
  }

  clearOfflineQueue() {
    this.offlineQueue = [];
    this.save();
  }

  createTenant(tenant: Tenant) {
    this.tenants.push(tenant);
    this.save();
  }
}

export const store = new DataStore();

// React Hook to subscribe to store changes
export function useSamityStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    store.init();
    const handleUpdate = () => setTick(t => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const activeTenant = store.tenants.find(t => t.id === store.currentTenantId) || store.tenants[0];
  const currentUser = store.users.find(u => u.id === store.currentUserId) || store.users[0];

  return {
    store,
    tenants: store.tenants,
    activeTenant,
    currentUser,
    members: store.members.filter(m => m.tenantId === activeTenant?.id),
    savingsTransactions: store.savingsTransactions.filter(t => t.tenantId === activeTenant?.id),
    loans: store.loans.filter(l => l.tenantId === activeTenant?.id),
    vouchers: store.vouchers.filter(v => v.tenantId === activeTenant?.id),
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
  };
}
