'use client';

import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, Phone, ShieldCheck, 
  PiggyBank, HandCoins, ArrowUpRight, Filter, Download,
  LayoutGrid, Table, QrCode, FileText, Edit, Trash2, 
  MoreVertical, CheckCircle, AlertTriangle, ExternalLink,
  Heart, Landmark, Award
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';
import { Member, MemberCategory, MemberStatus } from '@/types';
import { MemberIdCardModal } from '@/components/members/MemberIdCardModal';
import { MemberAdmissionFormModal } from '@/components/members/MemberAdmissionFormModal';
import { MemberDetailsModal } from '@/components/members/MemberDetailsModal';
import { MemberFormModal } from '@/components/members/MemberFormModal';

interface MembersViewProps {
  onOpenAddMember?: () => void;
  onOpenRecordDeposit: (memberId?: string) => void;
}

export function MembersView({ onOpenAddMember, onOpenRecordDeposit }: MembersViewProps) {
  const { 
    activeTenant, 
    language, 
    members, 
    savingsTransactions, 
    loans, 
    addMember, 
    updateMember, 
    softDeleteMember, 
    toggleMemberStatus,
    exportTableToCsv 
  } = useSamityStore();
  const t = translations[language];

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [detailsMember, setDetailsMember] = useState<Member | null>(null);
  const [idCardMember, setIdCardMember] = useState<Member | null>(null);
  const [admissionFormMember, setAdmissionFormMember] = useState<Member | null>(null);

  // Soft delete confirm state
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);
  const [deleteReason, setDeleteReason] = useState('প্রশাসনিক সিদ্ধান্ত');

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.nameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.nid.includes(searchTerm);

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    const matchesBlood = selectedBloodGroup === 'ALL' || m.bloodGroup === selectedBloodGroup;
    const matchesGender = selectedGender === 'ALL' || m.gender === selectedGender;

    return matchesSearch && matchesCategory && matchesStatus && matchesBlood && matchesGender;
  });

  // KPI Calculations
  const totalMembers = members.length;
  const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;
  const totalShareCapital = members.reduce((sum, m) => sum + (m.shareValue || 0), 0);
  const totalSavings = members.reduce((sum, m) => sum + (m.savingsBalance || 0), 0);
  const totalLoanOutstanding = members.reduce((sum, m) => sum + (m.loanOutstanding || 0), 0);

  const handleSaveMember = (data: any) => {
    if (editingMember) {
      updateMember(editingMember.id, data);
    } else {
      addMember(data);
    }
    setIsFormModalOpen(false);
    setEditingMember(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmMember) {
      softDeleteMember(deleteConfirmMember.id, deleteReason);
      setDeleteConfirmMember(null);
    }
  };

  const handleExportCsv = () => {
    exportTableToCsv('members');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Members */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">মোট সদস্য সংখ্যা</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 mt-0.5">
              {totalMembers} জন
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              {activeMembersCount} জন সক্রিয়
            </div>
          </div>
        </div>

        {/* Total Share Capital */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">মোট শেয়ার মূলধন</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400 mt-0.5">
              ৳ {totalShareCapital.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {members.reduce((s, m) => s + (m.sharesHeld || 0), 0)} টি শেয়ার
            </div>
          </div>
        </div>

        {/* Total Savings Deposit */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">মোট সঞ্চয় জমা</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-teal-400 mt-0.5">
              ৳ {totalSavings.toLocaleString()}
            </div>
            <div className="text-[10px] text-teal-500/80">নিরাপদ আমানত</div>
          </div>
        </div>

        {/* Total Loan Outstanding */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HandCoins className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">মোট চলতি ঋণ স্থিতি</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-0.5">
              ৳ {totalLoanOutstanding.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">মাঠপর্যায়ে বিনিয়োগ</div>
          </div>
        </div>
      </div>

      {/* 2. HEADER & SEARCH / FILTER TOOLBAR */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
        
        {/* Title Bar & Quick Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>{t.members} (মডিউল ২: সদস্য ব্যবস্থাপনা)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {filteredMembers.length} জন ফিল্টারকৃত
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              সদস্য প্রোফাইল, কেওয়াইসি (KYC), ডিজিটাল স্মার্ট আইডি কার্ড, ভর্তি ফরম ও পাসবুক
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="তালিকা ভিউ"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'GRID' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="কার্ড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>এক্সপোর্ট (CSV)</span>
            </button>

            {/* Add Member Button */}
            <button
              onClick={() => {
                setEditingMember(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন সদস্য নিবন্ধন</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="নাম, সদস্য আইডি, মোবাইল অথবা এনআইডি নম্বর দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল ক্যাটাগরি (All)</option>
              <option value="GENERAL">সাধারণ সদস্য (General)</option>
              <option value="EXECUTIVE">কার্যনির্বাহী সদস্য (Executive)</option>
              <option value="ADVISORY">উপদেষ্টা সদস্য (Advisory)</option>
              <option value="LIFE">আজীবন সদস্য (Life Member)</option>
              <option value="DONOR">দাতা সদস্য (Donor)</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল স্ট্যাটাস (Status)</option>
              <option value="ACTIVE">সক্রিয় (Active)</option>
              <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
              <option value="SUSPENDED">স্থগিত (Suspended)</option>
              <option value="PENDING">পেন্ডিং (Pending)</option>
            </select>
          </div>

          {/* Blood Group Dropdown */}
          <div>
            <select
              value={selectedBloodGroup}
              onChange={e => setSelectedBloodGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল রক্তের গ্রুপ</option>
              <option value="A+">A+ (পজিটিভ)</option>
              <option value="A-">A- (নেগেটিভ)</option>
              <option value="B+">B+ (পজিটিভ)</option>
              <option value="B-">B- (নেগেটিভ)</option>
              <option value="O+">O+ (পজিটিভ)</option>
              <option value="O-">O- (নেগেটিভ)</option>
              <option value="AB+">AB+ (পজিটিভ)</option>
              <option value="AB-">AB- (নেগেটিভ)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. MEMBERS DATA DISPLAY */}
      {filteredMembers.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">কোনো সদস্য পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            আপনার অনুসন্ধান শর্ত বা ফিল্টারের সাথে মিলে এমন কোনো সদস্য তালিকাভুক্ত নেই। নতুন সদস্য নিবন্ধন করতে উপরের বাটনে ক্লিক করুন।
          </p>
        </div>
      ) : viewMode === 'TABLE' ? (
        
        /* TABLE VIEW */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">সদস্য কোড ও নাম</th>
                  <th className="py-3 px-4">মোবাইল ও এনআইডি</th>
                  <th className="py-3 px-4">পদবি ও ক্যাটাগরি</th>
                  <th className="py-3 px-4">শেয়ার মূলধন</th>
                  <th className="py-3 px-4">সঞ্চয় স্থিতি</th>
                  <th className="py-3 px-4">চলতি ঋণ</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Code & Name with Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {member.photoUrl ? (
                              <img src={member.photoUrl} alt={member.nameEn} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-emerald-400 text-xs">
                                {member.nameBn.slice(0, 2)}
                              </span>
                            )}
                          </div>
                          {member.bloodGroup && (
                            <div className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-rose-600 text-white font-bold text-[8px]">
                              {member.bloodGroup}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <span>{language === 'bn' ? member.nameBn : member.nameEn}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono font-medium">
                            {member.memberCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone & NID */}
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200">{member.phone}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        NID: {member.nid}
                      </div>
                    </td>

                    {/* Designation & Category */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{member.designation || 'সদস্য'}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {member.category}
                      </span>
                    </td>

                    {/* Shares */}
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200 font-semibold">৳ {member.shareValue.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">{member.sharesHeld} টি শেয়ার</div>
                    </td>

                    {/* Savings */}
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {formatCurrency(member.savingsBalance, language)}
                    </td>

                    {/* Loan */}
                    <td className="py-3 px-4 font-mono">
                      {member.loanOutstanding > 0 ? (
                        <span className="text-amber-400 font-bold">{formatCurrency(member.loanOutstanding, language)}</span>
                      ) : (
                        <span className="text-slate-500 text-[10px] px-2 py-0.5 rounded bg-slate-800">ঋণমুক্ত</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleMemberStatus(member.id, member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition cursor-pointer ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                      >
                        {member.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Deposit */}
                        <button
                          onClick={() => onOpenRecordDeposit(member.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                          title="সঞ্চয় জমা নিন"
                        >
                          <PiggyBank className="w-3.5 h-3.5" />
                        </button>

                        {/* ID Card */}
                        <button
                          onClick={() => setIdCardMember(member)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition cursor-pointer"
                          title="ডিজিটাল আইডি কার্ড"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Admission Form */}
                        <button
                          onClick={() => setAdmissionFormMember(member)}
                          className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                          title="ভর্তি ফরম ও বায়োডাটা"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                          title="প্রোফাইল এডিট"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Details */}
                        <button
                          onClick={() => setDetailsMember(member)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition cursor-pointer"
                        >
                          বিস্তারিত
                        </button>

                        {/* Delete / Archive */}
                        <button
                          onClick={() => setDeleteConfirmMember(member)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                          title="সদস্য সফট ডিলিট / স্থগিত"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div key={member.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3.5 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
              
              {/* Card Top: Photo, Name, Code, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.nameEn} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-emerald-400 text-sm">{member.nameBn.slice(0, 2)}</span>
                      )}
                    </div>
                    {member.bloodGroup && (
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[8px]">
                        {member.bloodGroup}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-sm leading-tight line-clamp-1">{member.nameBn}</h3>
                    <div className="text-[11px] text-slate-400">{member.nameEn}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold">{member.memberCode}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {member.designation || member.category}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                  member.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {member.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[10px] font-mono text-center">
                <div>
                  <div className="text-slate-400 text-[9px]">সঞ্চয়</div>
                  <div className="font-bold text-emerald-400 mt-0.5">৳ {member.savingsBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px]">শেয়ার</div>
                  <div className="font-bold text-indigo-300 mt-0.5">৳ {member.shareValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px]">ঋণ</div>
                  <div className="font-bold text-amber-400 mt-0.5">
                    {member.loanOutstanding > 0 ? `৳ ${member.loanOutstanding.toLocaleString()}` : 'মুক্ত'}
                  </div>
                </div>
              </div>

              {/* Quick Contacts */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="font-mono">{member.phone}</span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${member.phone}`}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    title="কল করুন"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/88${member.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400"
                    title="WhatsApp"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenRecordDeposit(member.id)}
                  className="py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium transition cursor-pointer flex items-center justify-center gap-1"
                  title="সঞ্চয় জমা"
                >
                  <PiggyBank className="w-3 h-3" />
                  <span>জমা</span>
                </button>
                <button
                  onClick={() => setIdCardMember(member)}
                  className="py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium transition cursor-pointer flex items-center justify-center gap-1"
                  title="আইডি কার্ড"
                >
                  <QrCode className="w-3 h-3" />
                  <span>কার্ড</span>
                </button>
                <button
                  onClick={() => setAdmissionFormMember(member)}
                  className="py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-medium transition cursor-pointer flex items-center justify-center gap-1"
                  title="ভর্তি ফরম"
                >
                  <FileText className="w-3 h-3" />
                  <span>বায়োডাটা</span>
                </button>
                <button
                  onClick={() => setDetailsMember(member)}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-medium transition cursor-pointer"
                >
                  বিস্তারিত
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 4. MODALS INTEGRATION */}
      
      {/* Add / Edit Member Form Modal */}
      {isFormModalOpen && (
        <MemberFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingMember(null);
          }}
          onSave={handleSaveMember}
          initialMember={editingMember}
          activeTenant={activeTenant}
          totalMembersCount={members.length}
        />
      )}

      {/* Member Details Modal */}
      {detailsMember && (
        <MemberDetailsModal
          member={detailsMember}
          tenant={activeTenant}
          isOpen={!!detailsMember}
          onClose={() => setDetailsMember(null)}
          onOpenEdit={m => {
            setDetailsMember(null);
            setEditingMember(m);
            setIsFormModalOpen(true);
          }}
          onOpenIdCard={m => {
            setDetailsMember(null);
            setIdCardMember(m);
          }}
          onOpenAdmissionForm={m => {
            setDetailsMember(null);
            setAdmissionFormMember(m);
          }}
          onOpenRecordDeposit={mId => {
            setDetailsMember(null);
            onOpenRecordDeposit(mId);
          }}
          savingsTransactions={savingsTransactions}
          loans={loans}
        />
      )}

      {/* Member ID Card Modal */}
      {idCardMember && (
        <MemberIdCardModal
          member={idCardMember}
          tenant={activeTenant}
          isOpen={!!idCardMember}
          onClose={() => setIdCardMember(null)}
        />
      )}

      {/* Member Admission Form / Biodata Modal */}
      {admissionFormMember && (
        <MemberAdmissionFormModal
          member={admissionFormMember}
          tenant={activeTenant}
          isOpen={!!admissionFormMember}
          onClose={() => setAdmissionFormMember(null)}
        />
      )}

      {/* Soft Delete / Suspension Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-400">সদস্য সফট ডিলিট ও স্থগিতকরণ</h3>
                <p className="text-xs text-slate-400">
                  {deleteConfirmMember.nameBn} ({deleteConfirmMember.memberCode})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              সফট ডিলিট করার ফলে সদস্যের আর্থিক ও অডিট রেকর্ড সুরক্ষিত থাকবে, তবে সদস্যকে নিষ্ক্রিয় তালিকায় স্থানান্তর করা হবে।
            </p>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">স্থগিত / ডিলিটের কারণ লিখুন</label>
              <input
                type="text"
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="যেমন: সদস্যপদ প্রত্যাহার বা এলাকা ত্যাগ"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-600/20"
              >
                হ্যাঁ, নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
