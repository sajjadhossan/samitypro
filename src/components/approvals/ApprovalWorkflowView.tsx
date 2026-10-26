'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, ShieldAlert, ArrowUpRight, 
  Search, Filter, Check, X, AlertTriangle, Building2, 
  Coins, Receipt, UserCheck, ShieldCheck
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { ApprovalItem, ApprovalStatus, ApprovalType } from '@/types';

export function ApprovalWorkflowView() {
  const { approvalItems, updateApprovalStatus, currentUser } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ApprovalType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection modal state
  const [rejectItem, setRejectItem] = useState<ApprovalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingCount = approvalItems.filter(a => a.status === 'PENDING').length;

  const handleApprove = (item: ApprovalItem) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${item.titleBn}" অনুমোদন করতে চান?`)) {
      updateApprovalStatus(
        item.id, 
        'APPROVED', 
        currentUser?.nameBn || 'ইঞ্জিঃ সাজ্জাদ হোসাইন (সভাপতি)'
      );
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectItem) return;

    updateApprovalStatus(
      rejectItem.id, 
      'REJECTED', 
      currentUser?.nameBn || 'ইঞ্জিঃ সাজ্জাদ হোসাইন (সভাপতি)',
      rejectionReason || 'যথাযথ কাগজপত্রের ঘাটতি থাকায় বাতিল'
    );
    setRejectItem(null);
    setRejectionReason('');
  };

  const filteredItems = approvalItems.filter(item => {
    const matchesTab = activeTab === 'ALL' || item.status === activeTab;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesSearch = item.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>অ্যাপ্রুভাল ও মেকার-চেকার ওয়ার্কফ্লো (Approval Workflow Module 21)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            লেনদেন ও আবেদন অনুমোদন কেন্দ্র
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            ব্যাংক ডিপোজিট, নতুন ঋণ আবেদন ও ভাউচার খরচের বহুস্তরীয় প্রশাসনিক যাচাই ও অনুমোদন
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">অপেক্ষমান অনুমোদন</div>
            <div className="text-lg font-black text-amber-400">{pendingCount} টি রিকোয়েস্ট</div>
          </div>
        </div>
      </div>

      {/* Controls: Tabs & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'PENDING', label: `অপেক্ষমান (${pendingCount})`, color: 'amber' },
            { id: 'ALL', label: 'সকল রিকোয়েস্ট' },
            { id: 'APPROVED', label: 'অনুমোদিত' },
            { id: 'REJECTED', label: 'প্রত্যাখ্যাত' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">সকল ধরণ</option>
            <option value="BANK_DEPOSIT">ব্যাংক ডিপোজিট</option>
            <option value="LOAN_APPLICATION">ঋণ আবেদন</option>
            <option value="EXPENSE_VOUCHER">ভাউচার খরচ</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const isDeposit = item.type === 'BANK_DEPOSIT';
          const isLoan = item.type === 'LOAN_APPLICATION';
          const isPending = item.status === 'PENDING';
          const isApproved = item.status === 'APPROVED';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isPending
                  ? 'bg-slate-900/70 border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-950/20'
                  : isApproved
                  ? 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/30'
                  : 'bg-slate-900/40 border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl mt-0.5 ${
                    isDeposit ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    isLoan ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isDeposit ? <Building2 className="w-5 h-5" /> :
                     isLoan ? <Coins className="w-5 h-5" /> :
                     <Receipt className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {item.referenceId}
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        {item.titleBn}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                        isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isPending ? 'অপেক্ষমান (Pending)' : isApproved ? 'অনুমোদিত (Approved)' : 'প্রত্যাখ্যাত (Rejected)'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div>আবেদনকারী: <span className="text-slate-200 font-medium">{item.requestedBy}</span></div>
                      <div>তারিখ: <span className="font-mono text-slate-300">{item.requestedAt}</span></div>
                      {item.approvedBy && (
                        <div>অ্যাকশন গ্রহণকারী: <span className="text-emerald-400 font-medium">{item.approvedBy}</span></div>
                      )}
                    </div>

                    {/* Metadata summary */}
                    {item.details && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                        {Object.entries(item.details).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-slate-300">
                            {k}: <strong className="text-white">{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {item.rejectionReason && (
                      <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>প্রত্যাখ্যানের কারণ: {item.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">পরিমাণ (Amount)</div>
                    <div className="text-lg font-black text-white">
                      ৳ {item.amount.toLocaleString()}
                    </div>
                  </div>

                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRejectItem(item)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold border border-rose-500/20 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>প্রত্যাখ্যান</span>
                      </button>
                      <button
                        onClick={() => handleApprove(item)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>অনুমোদন করুন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-500">
                      {isApproved ? 'কার্যক্রম সম্পন্ন' : 'বাতিলকৃত'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
            <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-400">কোনো রিকোয়েস্ট পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-600 mt-1">এই ক্যাটাগরিতে কোনো অপেক্ষমান বা সমাপ্ত অনুমোদন নেই।</p>
          </div>
        )}
      </div>

      {/* REJECT REASON MODAL */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">অনুরোধ প্রত্যাখ্যানের কারণ</h3>
              </div>
              <button
                onClick={() => setRejectItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 mt-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                আপনি <strong>{rejectItem.titleBn}</strong> (৳ {rejectItem.amount.toLocaleString()}) প্রত্যাখ্যান করতে যাচ্ছেন। সদস্য বা কর্মীর জ্ঞাতার্থে কারণ উল্লেখ করুন:
              </p>

              <div>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="যেমন: ব্যাংক স্লিপের অস্পষ্টতা / কিস্তি শর্ত পূরণ না হওয়া..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  প্রত্যাখ্যান নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
