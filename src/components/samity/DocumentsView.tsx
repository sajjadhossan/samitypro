'use client';

import React, { useState } from 'react';
import { FolderLock, FileText, Download, Plus, Search, ShieldCheck, FileCheck2 } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { DocumentCategory } from '@/types';

export function DocumentsView() {
  const { store, activeTenant, language, documents, currentUser } = useSamityStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form
  const [titleBn, setTitleBn] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('REGISTRATION');
  const [fileNumber, setFileNumber] = useState('');
  const [descBn, setDescBn] = useState('');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.titleBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Boolean(doc.fileNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleUploadSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!titleBn) return;

    store.uploadDocument({
      tenantId: activeTenant.id,
      titleBn,
      titleEn: titleBn,
      category,
      fileNumber,
      fileUrl: '/docs/sample_samity_doc.pdf',
      fileSize: '1.8 MB',
      uploadedBy: currentUser.id,
      uploadedAt: new Date().toISOString().split('T')[0],
      descriptionBn: descBn
    });

    setIsUploadModalOpen(false);
    setTitleBn('');
    setFileNumber('');
    setDescBn('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-indigo-400" />
            <span>{language === 'bn' ? 'সমিতির ডিজিটাল নথি ও দলিল ভল্ট' : 'Document Vault & Official Records'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'সরকারি নিবন্ধন সনদ, গঠনতন্ত্র, উপ-আইন, নিরীক্ষিত অডিট রিপোর্ট ও জমির দলিলের ক্লাউড ভল্ট' 
              : 'Secure cloud vault for registration certificates, constitution, by-laws and audit files'}
          </p>
        </div>

        {currentUser.role !== 'MEMBER' && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন দলিল / নথি সংযোজন' : 'Upload Document'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'নথির নাম বা নম্বর খুঁজুন...' : 'Search document...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="ALL">সকল ক্যাটাগরি</option>
            <option value="REGISTRATION">নিবন্ধন সনদ (Registration)</option>
            <option value="BYLAWS">উপ-আইন ও গঠনতন্ত্র (By-Laws)</option>
            <option value="AUDIT_REPORT">অডিট রিপোর্ট (Audit)</option>
            <option value="DEED">জমির দলিল (Deed)</option>
            <option value="GOVT_APPROVAL">সরকারি অনুমোদন</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <FileText className="w-6 h-6" />
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 uppercase">
                  {doc.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100 line-clamp-2">
                  {doc.titleBn}
                </h3>
                {doc.fileNumber && (
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    নম্বর: {doc.fileNumber}
                  </p>
                )}
                {doc.descriptionBn && (
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {doc.descriptionBn}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                {doc.fileSize} • {doc.uploadedAt}
              </span>
              <a
                href={doc.fileUrl}
                download
                onClick={e => {
                  e.preventDefault();
                  alert(`ডাউনলোড শুরু হয়েছে: ${doc.titleBn}`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition cursor-pointer font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FolderLock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">নতুন ডিজিটাল নথি সংযোজন</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label htmlFor="doc-title" className="block text-slate-300 font-medium mb-1.5">নথির শিরোনাম (Title)</label>
                <input
                  id="doc-title"
                  type="text"
                  value={titleBn}
                  onChange={e => setTitleBn(e.target.value)}
                  required
                  placeholder="যেমন: সমবায় অধিদপ্তর কর্তৃক অনুমোদিত সনদপত্র"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="doc-category" className="block text-slate-300 font-medium mb-1.5">ক্যাটাগরি</label>
                  <select
                    id="doc-category"
                    value={category}
                    onChange={e => setCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="REGISTRATION">নিবন্ধন সনদ (Registration)</option>
                    <option value="BYLAWS">উপ-আইন ও গঠনতন্ত্র (By-Laws)</option>
                    <option value="AUDIT_REPORT">অডিট রিপোর্ট (Audit)</option>
                    <option value="DEED">জমির দলিল (Deed)</option>
                    <option value="GOVT_APPROVAL">সরকারি অনুমোদন</option>
                    <option value="OTHER">অন্যান্য নথি</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-file-number" className="block text-slate-300 font-medium mb-1.5">স্মারক / নথি নম্বর</label>
                  <input
                    id="doc-file-number"
                    type="text"
                    value={fileNumber}
                    onChange={e => setFileNumber(e.target.value)}
                    placeholder="যেমন: REG-DHAKA-2018-9842"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="doc-desc" className="block text-slate-300 font-medium mb-1.5">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  id="doc-desc"
                  rows={3}
                  value={descBn}
                  onChange={e => setDescBn(e.target.value)}
                  placeholder="নথিটির প্রাসঙ্গিক বিবরণ..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-dashed border-slate-700 text-center">
                <FileCheck2 className="w-8 h-8 text-indigo-400 mx-auto mb-1" />
                <span className="text-slate-300 font-medium block">পিডিএফ বা স্ক্যান কপি ক্লাউড স্টোরেজে এনক্রিপ্টেড থাকবে</span>
                <span className="text-[10px] text-slate-500">সর্বোচ্চ ফাইল সাইজ: ২৫ MB</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ক্লাউড ভল্টে সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
