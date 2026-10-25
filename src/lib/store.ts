'use client';

import { useState, useEffect } from 'react';
import { 
  Tenant, User, Member, SavingsAccount, SavingsTransaction, 
  Loan, Voucher, Meeting, Election, RealtimeEvent, Language, UserRole 
} from '@/types';
import { 
  INITIAL_TENANTS, INITIAL_USERS, INITIAL_MEMBERS, 
  INITIAL_SAVINGS_ACCOUNTS, INITIAL_SAVINGS_TRANSACTIONS, 
  INITIAL_LOANS, INITIAL_VOUCHERS, INITIAL_MEETINGS, 
  INITIAL_ELECTIONS, INITIAL_EVENTS 
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
    const receiptNo = `LN-RCT-${Date.now().toString().slice(-5)}`;
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
    language: store.language,
    setLanguage: (lang: Language) => store.setLanguage(lang),
    setCurrentTenant: (id: string) => store.setCurrentTenant(id),
    setCurrentUser: (id: string) => store.setCurrentUser(id),
  };
}
