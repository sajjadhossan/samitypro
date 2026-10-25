'use client';

import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, Phone, ShieldCheck, 
  PiggyBank, HandCoins, ArrowUpRight, Filter, Download 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, formatCurrency } from '@/lib/i18n';
import { Member } from '@/types';

interface MembersViewProps {
  onOpenAddMember: () => void;
  onOpenRecordDeposit: (memberId?: string) => void;
}

export function MembersView({ onOpenAddMember, onOpenRecordDeposit }: MembersViewProps) {
  const { activeTenant, language, members } = useSamityStore();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.nameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.nid.includes(searchTerm);

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search / Filter */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>{t.members}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {filteredMembers.length} জন
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn' 
                ? 'সদস্যদের পূর্ণাঙ্গ তালিকা, কেওয়াইসি (KYC) ও আর্থিক বিবরণী' 
                : 'Complete member list, KYC records, and financial summary'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.addMember}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">সকল ক্যাটাগরি (All Categories)</option>
              <option value="GENERAL">সাধারণ সদস্য (General)</option>
              <option value="EXECUTIVE">কার্যনির্বাহী সদস্য (Executive)</option>
              <option value="ADVISORY">উপদেষ্টা সদস্য (Advisory)</option>
              <option value="LIFE">আজীবন সদস্য (Life Member)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">সদস্য কোড ও নাম</th>
                <th className="py-3 px-4">মোবাইল ও এনআইডি</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4">শেয়ার মূলধন</th>
                <th className="py-3 px-4">সঞ্চয় স্থিতি</th>
                <th className="py-3 px-4">বকেয়া ঋণ</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-800/40 transition">
                  {/* Code & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                        {member.memberCode.replace('MEM-', '')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100">
                          {language === 'bn' ? member.nameBn : member.nameEn}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">{member.memberCode}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone & NID */}
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-200">{member.phone}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                      NID: {member.nid}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {member.category}
                    </span>
                  </td>

                  {/* Shares */}
                  <td className="py-3 px-4 font-mono">
                    <div className="text-slate-200 font-medium">৳ {member.shareValue.toLocaleString()}</div>
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
                      <span className="text-slate-500">ঋণমুক্ত</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenRecordDeposit(member.id)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                        title="সঞ্চয় জমা নিন"
                      >
                        <PiggyBank className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedMember(member)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition"
                      >
                        বিস্তারিত
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
                  {selectedMember.memberCode}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {language === 'bn' ? selectedMember.nameBn : selectedMember.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">মোবাইল: {selectedMember.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div><span className="text-slate-400">পিতা/স্বামী:</span> <span className="text-slate-200 font-medium">{selectedMember.fatherHusbandName}</span></div>
                <div><span className="text-slate-400">মাতা:</span> <span className="text-slate-200 font-medium">{selectedMember.motherName}</span></div>
                <div><span className="text-slate-400">এনআইডি:</span> <span className="text-slate-200 font-mono">{selectedMember.nid}</span></div>
                <div><span className="text-slate-400">পেশা:</span> <span className="text-slate-200 font-medium">{selectedMember.occupation}</span></div>
                <div className="col-span-2"><span className="text-slate-400">ঠিকানা:</span> <span className="text-slate-200">{selectedMember.presentAddress}</span></div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                  মনোনীত ব্যক্তি (Nominee)
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>নাম: <span className="font-semibold text-slate-100">{selectedMember.nominee.name}</span></div>
                  <div>সম্পর্ক: <span className="text-slate-200">{selectedMember.nominee.relation}</span></div>
                  <div>মোবাইল: <span className="text-slate-200 font-mono">{selectedMember.nominee.phone}</span></div>
                  <div>অংশ: <span className="text-emerald-400 font-bold">{selectedMember.nominee.sharePercentage}%</span></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
