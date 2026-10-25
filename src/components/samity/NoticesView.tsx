'use client';

import React, { useState } from 'react';
import { Bell, Plus, Pin, Calendar, Eye, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { Notice } from '@/types';

export function NoticesView() {
  const { store, activeTenant, language, notices, currentUser } = useSamityStore();
  const t = translations[language];

  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState(false);
  const [titleBn, setTitleBn] = useState('');
  const [contentBn, setContentBn] = useState('');
  const [category, setCategory] = useState<'GENERAL' | 'AGM' | 'MEETING' | 'FEE_REMINDER' | 'EMERGENCY'>('GENERAL');
  const [priority, setPriority] = useState<'HIGH' | 'NORMAL' | 'URGENT'>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn || !contentBn) return;

    store.publishNotice({
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
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'ডিজিটাল নোটিশ বোর্ড ও ঘোষণা' : 'Notice Board & Announcements'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'সাধারণ সভা, চাঁদার তাগাদা ও সমিতির অফিশিয়াল সিদ্ধান্তসমূহের লাইভ বিজ্ঞপ্তি' 
              : 'Official general notices, meeting alerts and emergency announcements'}
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

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map(notice => {
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

                <div className="text-[11px] text-slate-400">
                  জারি করেছেন: <span className="font-semibold text-slate-200">{notice.publisherNameBn}</span>
                </div>
              </div>

              <div className="pt-3">
                <h3 className="text-base font-bold text-slate-100 mb-2">
                  {notice.titleBn}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
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
        })}
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
              <button onClick={() => setIsNewNoticeOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">বিজ্ঞপ্তির শিরোনাম</label>
                <input
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
                  <label className="block text-slate-300 font-medium mb-1.5">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="GENERAL">সাধারণ নোটিশ</option>
                    <option value="AGM">বার্ষিক সাধারণ সভা (AGM)</option>
                    <option value="MEETING">কার্যনির্বাহী সভা</option>
                    <option value="FEE_REMINDER">চাঁদা তাগাদা</option>
                    <option value="EMERGENCY">জরুরি ঘোষণা</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">অগ্রাধিকার</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="NORMAL">স্বাভাবিক (Normal)</option>
                    <option value="HIGH">উচ্চ অগ্রাধিকার (High)</option>
                    <option value="URGENT">জরুরি (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">বিস্তারিত বিবরণ ও নির্দেশাবলী</label>
                <textarea
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
                  className="rounded text-amber-500 focus:ring-0"
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

    </div>
  );
}
