'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, Plus, Pin, Calendar, Eye, Send, 
  Trash2, Printer, Search, Filter, AlertCircle, 
  CheckCircle2, X, Share2, Tag 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { NoticeCategory, NoticePriority, Notice } from '@/types';

export function NoticesView() {
  const { 
    activeTenant, language, notices, currentUser, letterhead,
    publishNotice, pinNotice, deleteNotice 
  } = useSamityStore();

  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState(false);
  const [selectedNoticeForPrint, setSelectedNoticeForPrint] = useState<Notice | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State
  const [titleBn, setTitleBn] = useState('');
  const [contentBn, setContentBn] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('GENERAL');
  const [priority, setPriority] = useState<NoticePriority>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!titleBn || !contentBn) return;

    publishNotice({
      tenantId: activeTenant.id,
      titleBn,
      titleEn: titleBn,
      contentBn,
      contentEn: contentBn,
      category,
      priority,
      publishedDate: new Date().toISOString().split('T')[0],
      publishedBy: currentUser.id,
      publisherNameBn: currentUser.nameBn,
      isPinned
    });

    setIsNewNoticeOpen(false);
    setTitleBn('');
    setContentBn('');
    setIsPinned(false);
  };

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.titleBn.toLowerCase().includes(q) || n.titleEn.toLowerCase().includes(q);
        const matchesContent = n.contentBn.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });
  }, [notices, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'ডিজিটাল নোটিশ বোর্ড ও অফিশিয়াল ঘোষণা' : 'Notice Board & Official Announcements'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'বার্ষিক সাধারণ সভা, জরুরি বৈঠক, চাঁদার তাগাদা ও সমিতির গুরুত্বপূর্ণ সিদ্ধান্তসমূহের লাইভ বিজ্ঞপ্তি' 
              : 'Official general notices, meeting alerts, subscription reminders and committee directives'}
          </p>
        </div>

        {currentUser.role !== 'MEMBER' && (
          <button
            onClick={() => setIsNewNoticeOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন নোটিশ জারি করুন' : 'Publish Notice'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'বিজ্ঞপ্তির শিরোনাম বা বিষয়বস্তু দিয়ে খুঁজুন...' : 'Search notices...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline-block" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            <option value="GENERAL">সাধারণ নোটিশ</option>
            <option value="AGM">বার্ষিক সাধারণ সভা (AGM)</option>
            <option value="MEETING">কার্যনির্বাহী পরিষদ সভা</option>
            <option value="FEE_REMINDER">চাঁদা ও কিস্তি তাগাদা</option>
            <option value="EMERGENCY">জরুরি ঘোষণা</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 border border-slate-800 text-center space-y-2 text-slate-500">
            <Bell className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-slate-300 font-bold">{language === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি' : 'No notices found'}</div>
          </div>
        ) : (
          filteredNotices.map(notice => {
            const isUrgent = notice.priority === 'URGENT' || notice.priority === 'HIGH';
            return (
              <div
                key={notice.id}
                className={`glass-panel rounded-2xl p-5 border transition ${
                  notice.isPinned
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-500/5'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="p-1 rounded bg-amber-500/20 text-amber-400" title="পিন করা নোটিশ">
                        <Pin className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isUrgent ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {notice.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{notice.publishedDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div>
                      জারি করেছেন: <span className="font-semibold text-slate-200">{notice.publisherNameBn}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedNoticeForPrint(notice)}
                        className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                        title="লেটারহেডে প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {currentUser.role !== 'MEMBER' && (
                        <>
                          <button
                            onClick={() => pinNotice(notice.id, !notice.isPinned)}
                            className={`p-1 transition cursor-pointer ${
                              notice.isPinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                            title={notice.isPinned ? 'আনপিন করুন' : 'শীর্ষে পিন করুন'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this notice?')) {
                                deleteNotice(notice.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="text-base font-bold text-slate-100 mb-2">
                    {notice.titleBn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {notice.contentBn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{notice.viewCount} বার দেখা হয়েছে</span>
                  </div>
                  <div className="text-emerald-400 font-medium">
                    ✓ সকল সদস্য ও অফিসারের জন্য উন্মুক্ত
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Notice Modal */}
      {isNewNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">নতুন নোটিশ প্রকাশ</h3>
              </div>
              <button onClick={() => setIsNewNoticeOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label htmlFor="notice-title" className="block text-slate-300 font-medium mb-1.5">বিজ্ঞপ্তির শিরোনাম</label>
                <input
                  id="notice-title"
                  type="text"
                  value={titleBn}
                  onChange={e => setTitleBn(e.target.value)}
                  required
                  placeholder="যেমন: ৯ম বার্ষিক সাধারণ সভা সংক্রান্ত বিজ্ঞপ্তি"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="notice-category" className="block text-slate-300 font-medium mb-1.5">ক্যাটাগরি</label>
                  <select
                    id="notice-category"
                    value={category}
                    onChange={e => setCategory(e.target.value as NoticeCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="GENERAL">সাধারণ নোটিশ</option>
                    <option value="AGM">বার্ষিক সাধারণ সভা (AGM)</option>
                    <option value="MEETING">কার্যনির্বাহী পরিষদ সভা</option>
                    <option value="FEE_REMINDER">চাঁদা তাগাদা</option>
                    <option value="EMERGENCY">জরুরি ঘোষণা</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="notice-priority" className="block text-slate-300 font-medium mb-1.5">অগ্রাধিকার</label>
                  <select
                    id="notice-priority"
                    value={priority}
                    onChange={e => setPriority(e.target.value as NoticePriority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="NORMAL">স্বাভাবিক (Normal)</option>
                    <option value="HIGH">উচ্চ অগ্রাধিকার (High)</option>
                    <option value="URGENT">জরুরি (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notice-content" className="block text-slate-300 font-medium mb-1.5">বিস্তারিত বিবরণ ও নির্দেশাবলী</label>
                <textarea
                  id="notice-content"
                  rows={5}
                  value={contentBn}
                  onChange={e => setContentBn(e.target.value)}
                  required
                  placeholder="নোটিশের বিস্তারিত বার্তা এখানে লিখুন..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pinNotice" className="text-slate-300 cursor-pointer">
                  নোটিশটি নোটিশ বোর্ডের শীর্ষে পিন করে রাখুন
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>নোটিশ প্রকাশ করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Notice Modal (Letterhead Format) */}
      {selectedNoticeForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-2xl w-full space-y-6 shadow-2xl relative my-auto">
            {/* Close Button (Hidden on Print) */}
            <button
              onClick={() => setSelectedNoticeForPrint(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Letterhead Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <div className="text-xs uppercase font-bold tracking-widest text-slate-600">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {letterhead.samityNameBn || activeTenant.nameBn}
              </h2>
              <div className="text-xs text-slate-600">
                সরকারি রেজি নং: <strong>{letterhead.govtRegNo || activeTenant.registrationNo}</strong> | স্থাপিত: {activeTenant.establishedYear}
              </div>
              <div className="text-xs text-slate-500">{letterhead.addressBn || activeTenant.address}</div>
            </div>

            {/* Notice Title Banner */}
            <div className="text-center py-2 bg-slate-100 rounded border border-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">অফিশিয়াল বিজ্ঞপ্তি</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedNoticeForPrint.titleBn}</h3>
              <div className="text-xs text-slate-500 font-mono mt-0.5">তারিখ: {selectedNoticeForPrint.publishedDate}</div>
            </div>

            {/* Content */}
            <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-line text-justify indent-6">
              {selectedNoticeForPrint.contentBn}
            </div>

            {/* Signatures */}
            <div className="pt-12 grid grid-cols-2 gap-4 text-center text-xs">
              <div>
                <div className="w-36 mx-auto border-t border-slate-700 pt-1 font-bold">
                  {letterhead.secretaryNameBn || 'সাধারণ সম্পাদক'}
                </div>
                <div className="text-slate-500 text-[10px]">সাধারণ সম্পাদক</div>
              </div>
              <div>
                <div className="w-36 mx-auto border-t border-slate-700 pt-1 font-bold">
                  {letterhead.presidentNameBn || 'সভাপতি'}
                </div>
                <div className="text-slate-500 text-[10px]">সভাপতি</div>
              </div>
            </div>

            {/* Print Action Button (Hidden on Print) */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedNoticeForPrint(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
