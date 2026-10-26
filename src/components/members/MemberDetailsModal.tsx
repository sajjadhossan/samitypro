'use client';

import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, MapPin, ShieldCheck, Heart, 
  PiggyBank, HandCoins, Award, QrCode, FileText, Edit, 
  Clock, CheckCircle, AlertTriangle, ExternalLink, Calendar,
  CreditCard, Landmark
} from 'lucide-react';
import { Member, Tenant, SavingsTransaction, Loan } from '@/types';
import { formatCurrency } from '@/lib/i18n';

interface MemberDetailsModalProps {
  member: Member;
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (member: Member) => void;
  onOpenIdCard: (member: Member) => void;
  onOpenAdmissionForm: (member: Member) => void;
  onOpenRecordDeposit: (memberId: string) => void;
  savingsTransactions?: SavingsTransaction[];
  loans?: Loan[];
}

export function MemberDetailsModal({
  member,
  tenant,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenIdCard,
  onOpenAdmissionForm,
  onOpenRecordDeposit,
  savingsTransactions = [],
  loans = []
}: MemberDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'CONTACT' | 'KYC' | 'FINANCIAL' | 'NOMINEE' | 'LEDGER'>('PERSONAL');

  if (!isOpen) return null;

  const memberTransactions = savingsTransactions.filter(t => t.memberId === member.id);
  const memberLoans = loans.filter(l => l.memberId === member.id);

  const cleanPhone = member.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-emerald-500/60 overflow-hidden shadow-lg flex items-center justify-center shrink-0">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.nameEn} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-slate-900 text-emerald-400 font-bold text-xl flex items-center justify-center">
                    {member.nameBn.slice(0, 2)}
                  </div>
                )}
              </div>
              {member.bloodGroup && (
                <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[9px] shadow">
                  {member.bloodGroup}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">{member.nameBn}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  member.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {member.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium">{member.nameEn}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                <span className="font-mono text-emerald-400 font-semibold">{member.memberCode}</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-400 font-medium">{member.designation || member.category}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-mono">{member.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${member.phone}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="কল করুন"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
            </a>
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition"
              title="হোয়াটসঅ্যাপ চ্যাট"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => onOpenEdit(member)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-cyan-400" />
              <span>এডিট</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 border-b border-slate-800/80 text-xs shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('PERSONAL')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'PERSONAL'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ব্যক্তিগত তথ্য
          </button>
          <button
            onClick={() => setActiveTab('CONTACT')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'CONTACT'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            যোগাযোগ ও ঠিকানা
          </button>
          <button
            onClick={() => setActiveTab('KYC')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'KYC'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            কেওয়াইসি ও ডকুমেন্ট
          </button>
          <button
            onClick={() => setActiveTab('FINANCIAL')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'FINANCIAL'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            সমিতি ও আর্থিক বিবরণী
          </button>
          <button
            onClick={() => setActiveTab('NOMINEE')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'NOMINEE'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            নমিনী ও জরুরি যোগাযোগ
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'LEDGER'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            পাসবুক ও লেনদেন
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs">
          
          {/* TAB 1: PERSONAL */}
          {activeTab === 'PERSONAL' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <span className="text-slate-400 block text-[11px]">পিতা / স্বামীর নাম</span>
                  <span className="text-slate-100 font-medium">{member.fatherHusbandName || 'তথ্য নেই'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">মাতার নাম</span>
                  <span className="text-slate-100 font-medium">{member.motherName || 'তথ্য নেই'}</span>
                </div>
                {member.spouseName && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">স্বামী / স্ত্রীর নাম</span>
                    <span className="text-slate-100 font-medium">{member.spouseName}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[11px]">জন্ম তারিখ ও বয়স</span>
                  <span className="text-slate-100 font-mono">{member.dateOfBirth} {member.age ? `(${member.age} বছর)` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">লিঙ্গ ও ধর্ম</span>
                  <span className="text-slate-100 font-medium">
                    {member.gender === 'MALE' ? 'পুরুষ' : member.gender === 'FEMALE' ? 'মহিলা' : 'অন্যান্য'} • {member.religion || 'ইসলাম'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">বৈবাহিক অবস্থা</span>
                  <span className="text-slate-100 font-medium">{member.maritalStatus || 'বিবাহিত'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">পেশা</span>
                  <span className="text-slate-100 font-medium">{member.occupation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">শিক্ষাগত যোগ্যতা</span>
                  <span className="text-slate-100 font-medium">{member.education || 'উল্লেখ নেই'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT */}
          {activeTab === 'CONTACT' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">প্রধান মোবাইল নম্বর</span>
                    <span className="text-slate-100 font-mono font-bold text-sm text-emerald-400">{member.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">হোয়াটসঅ্যাপ নম্বর</span>
                    <span className="text-slate-100 font-mono">{member.whatsappNumber || member.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">বিকল্প ফোন / টেলিফোন</span>
                    <span className="text-slate-100 font-mono">{member.alternatePhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ইমেইল এড্রেস</span>
                    <span className="text-slate-100 font-mono">{member.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">বর্তমান ঠিকানা</span>
                    <span className="text-slate-200">{member.presentAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">স্থায়ী ঠিকানা</span>
                    <span className="text-slate-200">{member.permanentAddress || member.presentAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KYC */}
          {activeTab === 'KYC' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">পরিচয়পত্র টাইপ</span>
                    <span className="text-slate-100 font-medium">{member.nidType || 'Smart NID'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">জাতীয় পরিচয়পত্র নম্বর (NID)</span>
                    <span className="text-slate-100 font-mono font-bold text-emerald-400">{member.nid}</span>
                  </div>
                  {member.birthRegistrationNo && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">জন্ম নিবন্ধন নম্বর</span>
                      <span className="text-slate-100 font-mono">{member.birthRegistrationNo}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block text-[11px]">কেওয়াইসি স্ট্যাটাস</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      ভেরিফাইড ও অনুমোদিত
                    </span>
                  </div>
                </div>

                {/* Document Previews */}
                <div className="pt-3 border-t border-slate-700/60">
                  <span className="text-slate-400 block text-[11px] mb-2 font-medium">সংযুক্ত ডকুমেন্ট ও স্বাক্ষর প্রিভিউ</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400 mb-1">সদস্যের ছবি</div>
                      <div className="h-20 bg-slate-800 rounded flex items-center justify-center overflow-hidden">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-slate-600" />
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400 mb-1">এনআইডি কপি</div>
                      <div className="h-20 bg-slate-800 rounded flex items-center justify-center overflow-hidden">
                        {member.nidDocumentUrl ? (
                          <img src={member.nidDocumentUrl} alt="NID" className="w-full h-full object-cover" />
                        ) : (
                          <ShieldCheck className="w-8 h-8 text-slate-600" />
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-center col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-400 mb-1">সদস্য স্বাক্ষর</div>
                      <div className="h-20 bg-slate-800 rounded flex items-center justify-center italic font-serif text-slate-300">
                        {member.signatureUrl ? (
                          <img src={member.signatureUrl} alt="Signature" className="w-full h-full object-contain" />
                        ) : (
                          <span>{member.nameBn}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL */}
          {activeTab === 'FINANCIAL' && (
            <div className="space-y-3">
              {/* Balances Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold">সঞ্চয় স্থিতি</div>
                  <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                    {formatCurrency(member.savingsBalance, 'bn')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30">
                  <div className="text-[10px] text-teal-400 uppercase font-semibold">ডিপিএস স্থিতি</div>
                  <div className="text-base font-bold font-mono text-teal-300 mt-0.5">
                    {formatCurrency(member.dpsBalance, 'bn')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <div className="text-[10px] text-indigo-400 uppercase font-semibold">শেয়ার মূলধন</div>
                  <div className="text-base font-bold font-mono text-indigo-300 mt-0.5">
                    {formatCurrency(member.shareValue, 'bn')}
                  </div>
                  <div className="text-[9px] text-slate-400">{member.sharesHeld} টি শেয়ার</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
                  <div className="text-[10px] text-amber-400 uppercase font-semibold">চলতি ঋণ</div>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                    {member.loanOutstanding > 0 ? formatCurrency(member.loanOutstanding, 'bn') : 'ঋণমুক্ত'}
                  </div>
                </div>
              </div>

              {/* Policy Settings */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="text-xs font-semibold text-slate-200">সমিতি অন্তর্ভুক্তি ও চাঁদা পলিসি</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">ভর্তির তারিখ</span>
                    <span className="font-mono">{member.admissionDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ভর্তি ফি</span>
                    <span className="font-mono">৳ {member.admissionFee.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">মাসিক নির্ধারিত চাঁদা</span>
                    <span className="font-mono font-bold text-emerald-400">৳ {(member.monthlySubscriptionAmount || 1500).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOMINEE */}
          {activeTab === 'NOMINEE' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">মনোনীত ব্যক্তি (Nominee Details)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">নমিনীর নাম</span>
                    <span className="font-bold text-slate-100">{member.nominee?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">সম্পর্ক</span>
                    <span className="font-medium text-slate-100">{member.nominee?.relation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন</span>
                    <span className="font-mono">{member.nominee?.nidOrBirthCert}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">মোবাইল নম্বর</span>
                    <span className="font-mono text-emerald-400">{member.nominee?.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">প্রাপ্তি অংশ (শেয়ার %)</span>
                    <span className="font-bold text-emerald-400 text-sm">{member.nominee?.sharePercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="text-xs font-semibold text-slate-200">জরুরি যোগাযোগ (Emergency Contact)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">যোগাযোগের ব্যক্তি</span>
                    <span>{member.emergencyContactName || member.nominee?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">সম্পর্ক</span>
                    <span>{member.emergencyContactRelation || member.nominee?.relation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">জরুরি ফোন</span>
                    <span className="font-mono">{member.emergencyContactPhone || member.nominee?.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LEDGER / TRANSACTIONS */}
          {activeTab === 'LEDGER' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-200">সাম্প্রতিক সঞ্চয় ও ঋণের লেনদেন</div>
                <button
                  onClick={() => onOpenRecordDeposit(member.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition cursor-pointer"
                >
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>সঞ্চয় জমা নিন</span>
                </button>
              </div>

              {memberTransactions.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-400">
                  কোনো সঞ্চয় লেনদেন রেকর্ড নেই।
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">তারিখ</th>
                        <th className="py-2.5 px-3">রশিদ নং</th>
                        <th className="py-2.5 px-3">লেনদেন টাইপ</th>
                        <th className="py-2.5 px-3">পদ্ধতি</th>
                        <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                        <th className="py-2.5 px-3 text-right">ব্যালেন্স</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {memberTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-400">{tx.date}</td>
                          <td className="py-2 px-3 text-emerald-400">{tx.receiptNo}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                              {tx.type === 'DEPOSIT' ? 'জমা' : 'উত্তোলন'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-400 font-sans">{tx.paymentMethod}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400">৳ {tx.amount.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-slate-300">৳ {tx.balanceAfter.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Print & Export Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenIdCard(member)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 font-medium transition cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>আইডি কার্ড প্রিন্ট</span>
            </button>
            <button
              onClick={() => onOpenAdmissionForm(member)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/30 font-medium transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ভর্তি ফরম প্রিন্ট</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
