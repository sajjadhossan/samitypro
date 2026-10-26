'use client';

import React, { useState } from 'react';
import { 
  FileText, Plus, Printer, Search, ShieldCheck, CheckCircle2,
  FileCheck, ScrollText, Award, AlertCircle, X, Download, UserCheck
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { GeneratedDocument, GeneratedDocType } from '@/types';

export function DocumentGeneratorView() {
  const { 
    generatedDocs, members, letterhead, signatureSeal, 
    voucherPrefix, addGeneratedDocument, language 
  } = useSamityStore();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<GeneratedDocument | null>(null);

  // Form state
  const [docType, setDocType] = useState<GeneratedDocType>('MEMBERSHIP_CERTIFICATE');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [referenceNo, setReferenceNo] = useState(`DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [contentBn, setContentBn] = useState('');
  const [issuedBy, setIssuedBy] = useState('ইঞ্জিঃ সাজ্জাদ হোসাইন (সভাপতি)');

  // Set default content template when type changes or member changes
  const applyTemplate = (type: GeneratedDocType, memberName: string, memberCode: string) => {
    if (type === 'MEMBERSHIP_CERTIFICATE') {
      return `এতদ্বারা প্রত্যয়ন করা যাইতেছে যে, জনাব/জনাবা ${memberName || 'সদস্যের নাম'} (সদস্য কোড: ${memberCode || 'MEM-XXX'}) অত্র ${letterhead.samityNameBn}-এর একজন নিয়মিত, সক্রিয় ও সম্মানিত সাধারণ সদস্য। তিনি সমবায় বিধিমালা ও সমিতির উপ-আইন যথাযথভাবে মানিয়া চলিয়া সুনামের সহিত সদস্যপদ পরিচালনা করিতেছেন।\n\nআমরা তাহার জীবনের সর্বাঙ্গীন সাফল্য ও সমৃদ্ধি কামনা করি।`;
    } else if (type === 'CLEARANCE_NOC') {
      return `এতদ্বারা এই মর্মে অনাপত্তি ও প্রত্যয়নপত্র (NOC) প্রদান করা যাইতেছে যে, জনাব/জনাবা ${memberName || 'সদস্যের নাম'} (সদস্য কোড: ${memberCode || 'MEM-XXX'}) অত্র সমিতি হইতে গৃহীত যাবতীয় ঋণ ও চাঁদার বকেয়া সফলভাবে সম্পূর্ণ পরিশোধ করিয়াছেন। বর্তমান তারিখে অত্র সমিতিতে তাহার অনুকূলে কোনো প্রকার আর্থিক বকেয়া বা দায়দেনা নাই।\n\nসমিতির পক্ষ হইতে তাহার এই দায়মুক্তি প্রত্যয়নপত্র ইস্যু করা হইল।`;
    } else if (type === 'LOAN_AGREEMENT') {
      return `অদ্য তারিখে ${letterhead.samityNameBn} এবং ঋণগ্রহীতা জনাব/জনাবা ${memberName || 'সদস্যের নাম'} (সদস্য কোড: ${memberCode || 'MEM-XXX'})-এর মধ্যে দ্বিপাক্ষিক ঋণ চুক্তি সম্পাদিত হইল। গ্রহীতা সমিতির অনুমোদিত শর্ত সাপেক্ষে নির্ধারিত কিস্তির মাধ্যমে সম্পূর্ণ ঋণ পরিশোধ করিতে অঙ্গীকারবদ্ধ থাকিবেন। কিস্তি খেলাপি হইলে সমবায় আইন অনুযায়ী প্রয়োজনীয় আইনানুগ ব্যবস্থা গ্রহণ করা যাইবে।`;
    } else {
      return `অদ্য তারিখে অনুষ্ঠিত ${letterhead.samityNameBn}-এর কার্যনির্বাহী কমিটির সভায় সর্বসম্মতিক্রমে প্রস্তাব গৃহীত হইল যে, সমিতির সামাজিক ও আর্থিক কার্যক্রম গতিশীল করিবার লক্ষ্যে সার্বিক নিয়মানুযায়ী কার্যক্রম পরিচালিত হইবে এবং সংশ্লিষ্ট সকল কর্মকর্তা দায়িত্ব পালন করিবেন।`;
    }
  };

  const handleOpenCreate = () => {
    const initialType: GeneratedDocType = 'MEMBERSHIP_CERTIFICATE';
    const firstMember = members[0];
    setDocType(initialType);
    setSelectedMemberId(firstMember ? firstMember.id : '');
    setCustomRecipient(firstMember ? firstMember.nameBn : '');
    setReferenceNo(`DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setContentBn(applyTemplate(initialType, firstMember?.nameBn || '', firstMember?.memberCode || ''));
    setIsCreateModalOpen(true);
  };

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    const m = members.find(mem => mem.id === memberId);
    if (m) {
      setCustomRecipient(m.nameBn);
      setContentBn(applyTemplate(docType, m.nameBn, m.memberCode));
    }
  };

  const handleDocTypeChange = (newType: GeneratedDocType) => {
    setDocType(newType);
    const m = members.find(mem => mem.id === selectedMemberId);
    setContentBn(applyTemplate(newType, m?.nameBn || customRecipient, m?.memberCode || ''));
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const m = members.find(mem => mem.id === selectedMemberId);
    const title = docType === 'MEMBERSHIP_CERTIFICATE' ? 'সদস্য প্রত্যয়নপত্র'
      : docType === 'CLEARANCE_NOC' ? 'দায়মুক্তি ও অনাপত্তি সনদ (NOC)'
      : docType === 'LOAN_AGREEMENT' ? 'ঋণ চুক্তিপত্র'
      : 'কার্যনির্বাহী সভার রেজুলেশন';

    const newDoc = addGeneratedDocument({
      tenantId: letterhead.tenantId,
      docType,
      titleBn: title,
      referenceNo,
      recipientNameBn: m ? m.nameBn : customRecipient || 'সাধারণ সদস্য',
      recipientCode: m ? m.memberCode : undefined,
      contentBn,
      issueDate: new Date().toISOString().split('T')[0],
      issuedBy,
      status: 'ACTIVE'
    });

    setIsCreateModalOpen(false);
    setPreviewDoc(newDoc);
  };

  const filteredDocs = generatedDocs.filter(doc => {
    const matchesFilter = activeFilter === 'ALL' || doc.docType === activeFilter;
    const matchesSearch = doc.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipientNameBn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ScrollText className="w-4 h-4" />
            <span>ডকুমেন্ট ও সনদ জেনারেটর (Document Generator Module 19)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            অফিশিয়াল প্রত্যয়নপত্র ও চুক্তিপত্র
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            সদস্য প্রত্যয়নপত্র, অনাপত্তি সনদ (NOC), ঋণ চুক্তিপত্র ও রেজুলেশন স্বয়ংক্রিয়ভাবে তৈরি ও প্রিন্ট করুন
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ডকুমেন্ট তৈরি করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'সকল ডকুমেন্ট' },
            { id: 'MEMBERSHIP_CERTIFICATE', label: 'প্রত্যয়নপত্র' },
            { id: 'CLEARANCE_NOC', label: 'অনাপত্তি সনদ (NOC)' },
            { id: 'LOAN_AGREEMENT', label: 'ঋণ চুক্তিপত্র' },
            { id: 'RESOLUTION', label: 'রেজুলেশন' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="রেফারেন্স নং বা নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const isCert = doc.docType === 'MEMBERSHIP_CERTIFICATE';
          const isNoc = doc.docType === 'CLEARANCE_NOC';
          const isLoan = doc.docType === 'LOAN_AGREEMENT';

          return (
            <div
              key={doc.id}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-indigo-950/40 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${
                      isCert ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      isNoc ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      isLoan ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {isCert ? <Award className="w-5 h-5" /> :
                       isNoc ? <ShieldCheck className="w-5 h-5" /> :
                       isLoan ? <FileCheck className="w-5 h-5" /> :
                       <ScrollText className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 tracking-wider">
                        {doc.referenceNo}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
                        {doc.titleBn}
                      </h3>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    সক্রিয়
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>প্রাপক:</span>
                    <span className="font-semibold text-slate-200">
                      {doc.recipientNameBn} {doc.recipientCode ? `(${doc.recipientCode})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>ইস্যুর তারিখ:</span>
                    <span className="font-mono text-slate-300">{doc.issueDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>অনুমোদনকারী:</span>
                    <span className="text-slate-300 truncate max-w-[140px]">{doc.issuedBy}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {doc.contentBn}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / প্রিভিউ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-400">কোনো ডকুমেন্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-600 mt-1">অনুসন্ধান পরিবর্তন করুন অথবা নতুন ডকুমেন্ট তৈরি করুন।</p>
        </div>
      )}

      {/* CREATE DOCUMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">নতুন অফিসিয়াল ডকুমেন্ট প্রস্তুতকরণ</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">ডকুমেন্টের ধরণ</label>
                  <select
                    value={docType}
                    onChange={(e) => handleDocTypeChange(e.target.value as GeneratedDocType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MEMBERSHIP_CERTIFICATE">সদস্য প্রত্যয়নপত্র (Certificate)</option>
                    <option value="CLEARANCE_NOC">দায়মুক্তি ও অনাপত্তি সনদ (NOC)</option>
                    <option value="LOAN_AGREEMENT">ঋণ চুক্তিপত্র (Loan Agreement)</option>
                    <option value="RESOLUTION">কার্যনির্বাহী সভার রেজুলেশন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">রেফারেন্স নং</label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {docType !== 'RESOLUTION' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">সদস্য নির্বাচন করুন</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleMemberChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- সদস্য তালিকা থেকে নির্বাচন করুন --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.memberCode} - {m.nameBn} ({m.phone})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">বিষয় / প্রাপক বিবরণ</label>
                  <input
                    type="text"
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value)}
                    placeholder="যেমন: কার্যনির্বাহী কমিটির সাধারণ সভা"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ডকুমেন্টের মূল বিবরণ / টেক্সট</label>
                <textarea
                  rows={5}
                  value={contentBn}
                  onChange={(e) => setContentBn(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ইস্যুকারী ও পদবী</label>
                <input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>সংরক্ষণ ও তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-300 print:m-0 print:border-none print:shadow-none print:w-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white print:hidden">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
                <Award className="w-4 h-4" />
                <span>{previewDoc.titleBn} - অফিশিয়াল প্রিন্ট প্রিভিউ</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Paper Container */}
            <div className="p-8 sm:p-10 space-y-6 print:p-8 relative overflow-hidden" id="printable-doc">
              {/* Watermark */}
              {voucherPrefix.enableWatermark && (
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-4xl font-black rotate-[-15deg] select-none text-slate-900">
                  {voucherPrefix.watermarkTextBn}
                </div>
              )}

              {/* Letterhead */}
              <div className="text-center border-b-2 border-indigo-700 pb-4 relative">
                <div className="text-[11px] font-semibold text-indigo-800 uppercase tracking-widest">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {letterhead.samityNameBn}
                </h1>
                <div className="text-xs font-semibold text-slate-600">
                  {letterhead.samityNameEn}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  রেজিঃ নং: {letterhead.govtRegNo} | স্থাপিত: {letterhead.establishedYear} খ্রিঃ
                </div>
                <div className="text-[10px] text-slate-500">
                  {letterhead.addressBn} | ফোন: {letterhead.phone}
                </div>
              </div>

              {/* Ref and Date */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold border-b border-slate-200 pb-2">
                <div>স্মারক নং: <span className="font-mono text-slate-900 font-bold">{previewDoc.referenceNo}</span></div>
                <div>তারিখ: <span className="font-mono text-slate-900 font-bold">{previewDoc.issueDate}</span></div>
              </div>

              {/* Document Title Header */}
              <div className="text-center my-4">
                <span className="inline-block px-6 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-base tracking-wide uppercase">
                  {previewDoc.titleBn}
                </span>
              </div>

              {/* Main Content */}
              <div className="text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line text-justify px-2 py-4 bg-slate-50/50 rounded-xl border border-slate-100">
                {previewDoc.contentBn}
              </div>

              {/* Seal and Signatures Block */}
              <div className="pt-8 flex items-end justify-between">
                {/* Official Seal */}
                {signatureSeal.showSealOnReceipt && (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-700 flex items-center justify-center text-center p-1 text-[8px] font-bold text-indigo-900 rotate-[-12deg] bg-indigo-50/40 leading-tight">
                      {signatureSeal.sealTextBn}
                    </div>
                  </div>
                )}

                {/* Signatures */}
                <div className="flex gap-8 text-center text-xs">
                  <div>
                    <div className="h-10 flex items-end justify-center font-serif italic text-slate-800 font-bold text-sm">
                      {signatureSeal.secretaryName || 'সম্পাদক'}
                    </div>
                    <div className="w-28 border-t border-slate-400 pt-1 text-[10px] text-slate-600 font-semibold">
                      {signatureSeal.secretaryTitleBn || 'সাধারণ সম্পাদক'}
                    </div>
                  </div>

                  <div>
                    <div className="h-10 flex items-end justify-center font-serif italic text-indigo-900 font-bold text-sm">
                      {signatureSeal.presidentName || 'সভাপতি'}
                    </div>
                    <div className="w-28 border-t border-slate-400 pt-1 text-[10px] text-slate-600 font-semibold">
                      {signatureSeal.presidentTitleBn || 'সভাপতি'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Footer */}
              <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 font-mono">
                {letterhead.sloganBn} | এটি অফিসিয়াল ডিজিটাল ডকুমেন্ট ভেরিফিকেশন কোড: {previewDoc.id}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
