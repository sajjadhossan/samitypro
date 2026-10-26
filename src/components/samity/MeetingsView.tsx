'use client';

import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, Calendar, Clock, MapPin, 
  FileText, CheckCircle2, Users, Plus, 
  Search, Filter, Printer, Play, CheckCircle, 
  AlertCircle, ChevronRight, X, UserCheck, 
  UserX, Shield, Award, Edit3, Trash2, 
  Bell, Share2, Sparkles, AlertTriangle, 
  Layers, Check, FileCheck, ArrowRight
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { 
  Meeting, MeetingType, MeetingStatus, 
  MeetingAgendaItem, MeetingResolution, MeetingAttendee 
} from '@/types';

export function MeetingsView() {
  const { 
    language, meetings, activeTenant, letterhead, 
    currentUser, members, createMeeting, updateMeeting, 
    softDeleteMeeting, startMeeting, completeMeeting, 
    recordAttendance, addAgendaItem, updateAgendaItem, 
    addResolution, publishMeetingNotice 
  } = useSamityStore();

  const t = translations[language];

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'schedule' | 'wizard' | 'live' | 'resolutions' | 'minutes'>('schedule');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Meeting for Live Session or Minutes View
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');

  // Wizard State
  const [wizardType, setWizardType] = useState<MeetingType>('AGM');
  const [wizardMeetingNo, setWizardMeetingNo] = useState('');
  const [wizardTitleBn, setWizardTitleBn] = useState('');
  const [wizardTitleEn, setWizardTitleEn] = useState('');
  const [wizardDate, setWizardDate] = useState(new Date().toISOString().split('T')[0]);
  const [wizardTime, setWizardTime] = useState('সকাল ১০:০০ ঘটিকা');
  const [wizardVenue, setWizardVenue] = useState(activeTenant?.address || 'সমিতি প্রধান কার্যালয় অডিটোরিয়াম');
  const [wizardChairperson, setWizardChairperson] = useState(letterhead.presidentNameBn || 'আলহাজ্ব রফিকুল ইসলাম (সভাপতি)');
  const [wizardSecretary, setWizardSecretary] = useState(letterhead.secretaryNameBn || 'জনাব শফিকুল আলম (সাধারণ সম্পাদক)');
  const [wizardTargetAudience, setWizardTargetAudience] = useState<'ALL_MEMBERS' | 'EXECUTIVE_COMMITTEE' | 'GENERAL_BODY'>('ALL_MEMBERS');
  const [wizardQuorumRequired, setWizardQuorumRequired] = useState(15);
  const [wizardAgendas, setWizardAgendas] = useState<string[]>([
    'বিগত সভার কার্যবিবরণী পাঠ ও অনুমোদন',
    'সমিতির চলমান আর্থিক হিসাব ও খতিয়ান পর্যালোচনা',
    'বিবিধ ও সমাপনী বক্তব্য'
  ]);
  const [newAgendaInput, setNewAgendaInput] = useState('');
  const [wizardPublishNotice, setWizardPublishNotice] = useState(true);

  // New Resolution Modal State
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [resSubjectBn, setResSubjectBn] = useState('');
  const [resDetailsBn, setResDetailsBn] = useState('');
  const [resProposerBn, setResProposerBn] = useState('');
  const [resSeconderBn, setResSeconderBn] = useState('');
  const [resVotingResult, setResVotingResult] = useState<'UNANIMOUS' | 'MAJORITY' | 'VETO'>('UNANIMOUS');

  // Complete Meeting Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeMinutesText, setCompleteMinutesText] = useState('');
  const [completeApprovedBy, setCompleteApprovedBy] = useState(wizardChairperson);

  // Print Mode State in Tab 5
  const [printDocType, setPrintDocType] = useState<'MINUTES' | 'NOTICE'>('MINUTES');

  // Selected Meeting object
  const currentMeeting = useMemo(() => {
    return meetings.find(m => m.id === selectedMeetingId) || meetings[0];
  }, [meetings, selectedMeetingId]);

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (m.deletedAt) return false;
      if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitleBn = m.titleBn.toLowerCase().includes(q);
        const matchesTitleEn = m.titleEn.toLowerCase().includes(q);
        const matchesNo = m.meetingNo ? m.meetingNo.toLowerCase().includes(q) : false;
        const matchesVenue = m.venue.toLowerCase().includes(q);
        if (!matchesTitleBn && !matchesTitleEn && !matchesNo && !matchesVenue) return false;
      }
      return true;
    });
  }, [meetings, typeFilter, statusFilter, searchQuery]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = meetings.filter(m => !m.deletedAt).length;
    const scheduled = meetings.filter(m => m.status === 'SCHEDULED' && !m.deletedAt).length;
    const inProgress = meetings.filter(m => m.status === 'IN_PROGRESS' && !m.deletedAt).length;
    const completed = meetings.filter(m => m.status === 'COMPLETED' && !m.deletedAt).length;
    let totalResolutions = 0;
    meetings.forEach(m => {
      if (!m.deletedAt && m.resolutions) {
        totalResolutions += m.resolutions.length;
      }
    });
    return { total, scheduled, inProgress, completed, totalResolutions };
  }, [meetings]);

  // Handlers
  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardTitleBn.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সভার শিরোনাম লিখুন' : 'Please enter meeting title');
      return;
    }

    createMeeting({
      tenantId: activeTenant.id,
      meetingNo: wizardMeetingNo.trim() || undefined,
      titleBn: wizardTitleBn.trim(),
      titleEn: wizardTitleEn.trim() || wizardTitleBn.trim(),
      type: wizardType,
      date: wizardDate,
      time: wizardTime,
      venue: wizardVenue,
      chairpersonNameBn: wizardChairperson,
      recordingSecretaryNameBn: wizardSecretary,
      targetAudience: wizardTargetAudience,
      quorumRequired: Number(wizardQuorumRequired),
      agenda: wizardAgendas,
      publishNoticeImmediately: wizardPublishNotice
    });

    alert(language === 'bn' ? 'সভা সফলভাবে আহ্বান ও সংরক্ষণ করা হয়েছে!' : 'Meeting scheduled successfully!');
    setActiveTab('schedule');
    // Reset Form
    setWizardTitleBn('');
    setWizardTitleEn('');
    setWizardMeetingNo('');
  };

  const handleAddAgendaToWizard = () => {
    if (!newAgendaInput.trim()) return;
    setWizardAgendas([...wizardAgendas, newAgendaInput.trim()]);
    setNewAgendaInput('');
  };

  const handleRemoveAgendaFromWizard = (index: number) => {
    setWizardAgendas(wizardAgendas.filter((_, i) => i !== index));
  };

  const handleToggleAttendance = (memberId: string) => {
    if (!currentMeeting || !currentMeeting.attendees) return;
    const updated = currentMeeting.attendees.map(a => {
      if (a.memberId === memberId) {
        return { ...a, isPresent: !a.isPresent, signedAt: !a.isPresent ? new Date().toLocaleTimeString('bn-BD') : undefined };
      }
      return a;
    });
    recordAttendance(currentMeeting.id, updated);
  };

  const handleMarkAllPresent = () => {
    if (!currentMeeting || !currentMeeting.attendees) return;
    const updated = currentMeeting.attendees.map(a => ({
      ...a,
      isPresent: true,
      signedAt: new Date().toLocaleTimeString('bn-BD')
    }));
    recordAttendance(currentMeeting.id, updated);
  };

  const handleAddResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMeeting || !resSubjectBn.trim() || !resDetailsBn.trim()) return;

    addResolution(currentMeeting.id, {
      subjectBn: resSubjectBn.trim(),
      detailsBn: resDetailsBn.trim(),
      proposerBn: resProposerBn.trim(),
      seconderBn: resSeconderBn.trim(),
      votingResult: resVotingResult
    });

    setIsResolutionModalOpen(false);
    setResSubjectBn('');
    setResDetailsBn('');
    setResProposerBn('');
    setResSeconderBn('');
  };

  const handleFinalizeMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMeeting) return;

    completeMeeting(currentMeeting.id, {
      minutesTextBn: completeMinutesText || currentMeeting.minutesTextBn || `${currentMeeting.date} তারিখে অনুষ্ঠিত ${currentMeeting.titleBn}-এর সকল এজেন্ডা ও সিদ্ধান্ত আনুষ্ঠানিকভাবে অনুমোদন করা হলো।`,
      minutesApprovedBy: completeApprovedBy || currentMeeting.chairpersonNameBn
    });

    setIsCompleteModalOpen(false);
    alert(language === 'bn' ? 'সভা আনুষ্ঠানিকভাবে সমাপ্ত ও কার্যবিবরণী সংরক্ষিত হয়েছে!' : 'Meeting completed and minutes archived!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>{language === 'bn' ? 'মডিউল ৭ : সভা, কার্যবিবরণী ও রেজোলিউশন' : 'Module 7 : Meetings, Minutes & Resolutions'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            {language === 'bn' ? 'সভা পরিচালনা, রেজোলিউশন ও ডিজিটাল নোটিশ' : 'Meetings & Minutes Command Center'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn' 
              ? 'বার্ষিক সাধারণ সভা (AGM), কার্যনির্বাহী পরিষদ সভা, লাইভ উপস্থিতি খাতা ও অফিশিয়াল কার্যবিবরণী রেজিস্টার' 
              : 'AGM/EGM conventions, executive meetings, quorum attendance and official minutes archive'}
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('wizard')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন সভা আহ্বান করুন' : 'Schedule Meeting'}</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'মোট সভা' : 'Total Meetings'}</div>
            <div className="text-lg sm:text-xl font-black text-slate-100 font-mono">{stats.total}</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'আসন্ন / নির্ধারিত' : 'Scheduled'}</div>
            <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">{stats.scheduled}</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'সম্পন্ন সভা' : 'Completed'}</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">{stats.completed}</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'গৃহীত সিদ্ধান্ত' : 'Resolutions'}</div>
            <div className="text-lg sm:text-xl font-black text-purple-400 font-mono">{stats.totalResolutions}</div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'bn' ? '১. সভার রেজিস্টার ও ক্যালেন্ডার' : '1. Meetings Register'}</span>
        </button>

        <button
          onClick={() => setActiveTab('wizard')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'wizard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? '২. নতুন সভা আহ্বান উইজার্ড' : '2. Schedule Wizard'}</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'live'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? '৩. লাইভ সভা ও উপস্থিতি খাতা' : '3. Live & Attendance'}</span>
          {stats.inProgress > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('resolutions')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'resolutions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4 text-purple-400" />
          <span>{language === 'bn' ? '৪. রেজোলিউশন ও সিদ্ধান্ত রেজিস্টার' : '4. Resolutions Book'}</span>
        </button>

        <button
          onClick={() => setActiveTab('minutes')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'minutes'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>{language === 'bn' ? '৫. অফিশিয়াল কার্যবিবরণী প্রিন্ট' : '5. Printable Minutes'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: সভার রেজিস্টার ও ক্যালেন্ডার (SCHEDULE & REGISTER) */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          
          {/* Filter and Search Toolbar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'স্মারক নং, সভার নাম বা স্থান দিয়ে খুঁজুন...' : 'Search by title, number or venue...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">{language === 'bn' ? 'সকল সভার ধরন' : 'All Meeting Types'}</option>
                <option value="AGM">বার্ষিক সাধারণ সভা (AGM)</option>
                <option value="EGM">জরুরি সাধারণ সভা (EGM)</option>
                <option value="COMMITTEE">কার্যনির্বাহী পরিষদ সভা (EC)</option>
                <option value="MONTHLY">মাসিক সমন্বয় সভা</option>
                <option value="EMERGENCY">জরুরি সভা</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                <option value="SCHEDULED">{language === 'bn' ? 'আসন্ন / নির্ধারিত' : 'Scheduled'}</option>
                <option value="IN_PROGRESS">{language === 'bn' ? 'চলমান সভা' : 'In Progress'}</option>
                <option value="COMPLETED">{language === 'bn' ? 'সম্পন্ন হয়েছে' : 'Completed'}</option>
                <option value="CANCELLED">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</option>
              </select>
            </div>
          </div>

          {/* Meeting Cards List */}
          {filteredMeetings.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 border border-slate-800 text-center space-y-3">
              <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-bold">{language === 'bn' ? 'কোনো সভা পাওয়া যায়নি' : 'No meetings found'}</div>
              <p className="text-xs text-slate-500">{language === 'bn' ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সভার তথ্য নেই।' : 'No records match your search criteria.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeetings.map(m => {
                const isSelected = m.id === selectedMeetingId;
                const isAGM = m.type === 'AGM' || m.type === 'EGM';

                return (
                  <div 
                    key={m.id}
                    className={`glass-panel rounded-2xl p-5 border transition flex flex-col justify-between ${
                      isSelected 
                        ? 'border-indigo-500/60 bg-slate-900/90 shadow-xl shadow-indigo-500/10' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isAGM 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {m.type}
                          </span>

                          {m.meetingNo && (
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                              {m.meetingNo}
                            </span>
                          )}
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : m.status === 'IN_PROGRESS'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {m.status === 'COMPLETED' ? 'সম্পন্ন' : m.status === 'IN_PROGRESS' ? 'লাইভ চলছে' : 'আসন্ন সভা'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-100 leading-snug">
                        {language === 'bn' ? m.titleBn : m.titleEn}
                      </h3>

                      {/* Date, Time, Venue */}
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-mono text-slate-200">{m.date}</span>
                          <span>•</span>
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{m.time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{m.venue}</span>
                        </div>

                        {m.chairpersonNameBn && (
                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>{language === 'bn' ? 'সভাপতি:' : 'Chair:'} <strong className="text-slate-300">{m.chairpersonNameBn}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Agendas preview */}
                      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                          <span>{language === 'bn' ? 'আলোচ্যসূচি (Agendas)' : 'Agendas'}</span>
                          <span className="font-mono">{m.agenda?.length || 0} টি</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                          {m.agenda?.slice(0, 3).map((ag, i) => (
                            <li key={i} className="truncate">
                              {typeof ag === 'string' ? ag : ag.titleBn}
                            </li>
                          ))}
                          {(m.agenda?.length || 0) > 3 && (
                            <li className="text-[11px] text-indigo-400 italic">
                              +{ (m.agenda?.length || 0) - 3 } {language === 'bn' ? 'টি অতিরিক্ত বিষয়' : 'more items'}
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Quorum / Attendance pill */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{language === 'bn' ? 'উপস্থিতি:' : 'Attendance:'}</span>
                          <span className="font-bold text-slate-200 font-mono">{m.totalAttendees} {language === 'bn' ? 'জন' : 'attendees'}</span>
                        </div>

                        {m.resolutions && m.resolutions.length > 0 && (
                          <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold">
                            <Award className="w-3.5 h-3.5" />
                            <span>{m.resolutions.length} {language === 'bn' ? 'সিদ্ধান্ত' : 'resolutions'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 justify-between">
                      <div className="flex items-center gap-1.5">
                        {/* Start / Live button */}
                        {m.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setSelectedMeetingId(m.id);
                              if (m.status === 'SCHEDULED') startMeeting(m.id);
                              setActiveTab('live');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-emerald-300" />
                            <span>{m.status === 'IN_PROGRESS' ? 'লাইভ খাতা' : 'সভা শুরু'}</span>
                          </button>
                        )}

                        {/* Printable Minutes */}
                        <button
                          onClick={() => {
                            setSelectedMeetingId(m.id);
                            setActiveTab('minutes');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-amber-400" />
                          <span>{language === 'bn' ? 'কার্যবিবরণী' : 'Minutes'}</span>
                        </button>

                        {/* Notice Alert Button */}
                        {!m.noticePublished && (
                          <button
                            onClick={() => {
                              publishMeetingNotice(m.id);
                              alert(language === 'bn' ? 'ডিজিটাল নোটিশ বোর্ডে নোটিশ প্রকাশ করা হয়েছে!' : 'Notice published to board!');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs border border-amber-500/20 transition cursor-pointer"
                            title="ডিজিটাল নোটিশ জারি করুন"
                          >
                            <Bell className="w-3 h-3" />
                            <span>নোটিশ জারি</span>
                          </button>
                        )}
                      </div>

                      {/* Cancel / Delete */}
                      {currentUser.role !== 'MEMBER' && (
                        <button
                          onClick={() => {
                            if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই সভাটি বাতিল করতে চান?' : 'Are you sure you want to cancel this meeting?')) {
                              softDeleteMeeting(m.id, 'ব্যবহারকারী কর্তৃক বাতিল');
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="সভা বাতিল করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: নতুন সভা আহ্বান উইজার্ড (SCHEDULE WIZARD) */}
      {/* ========================================================================= */}
      {activeTab === 'wizard' && (
        <form onSubmit={handleCreateMeetingSubmit} className="glass-panel rounded-2xl p-5 sm:p-7 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>{language === 'bn' ? 'নতুন সভা আহ্বান ও আলোচ্যসূচি প্রস্তুতকরণ উইজার্ড' : 'Schedule New Meeting Wizard'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'bn' 
                ? 'কার্যনির্বাহী পরিষদ বা সাধারণ সভার তথ্য প্রদান করুন এবং স্বয়ংক্রিয় নোটিশ জারি করুন' 
                : 'Fill in meeting logistics, agenda builder and optional auto-notice publishing'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Meeting Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সভার ধরন' : 'Meeting Type'} *</label>
              <select
                value={wizardType}
                onChange={e => setWizardType(e.target.value as MeetingType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="AGM">বার্ষিক সাধারণ সভা (AGM)</option>
                <option value="EGM">জরুরি সাধারণ সভা (EGM)</option>
                <option value="COMMITTEE">কার্যনির্বাহী পরিষদ সভা (EC)</option>
                <option value="MONTHLY">মাসিক সমন্বয় সভা</option>
                <option value="EMERGENCY">জরুরি পরিষদ সভা</option>
                <option value="REQUISITION">তলবি সাধারণ সভা</option>
              </select>
            </div>

            {/* Meeting Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'স্মারক / সভার নম্বর' : 'Meeting No.'}</label>
              <input
                type="text"
                placeholder={wizardType === 'AGM' ? 'AGM-2026/02' : 'EC-2026/11'}
                value={wizardMeetingNo}
                onChange={e => setWizardMeetingNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'অংশগ্রহণকারী' : 'Target Audience'}</label>
              <select
                value={wizardTargetAudience}
                onChange={e => setWizardTargetAudience(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL_MEMBERS">সমিতির সকল সাধারণ সদস্য</option>
                <option value="EXECUTIVE_COMMITTEE">শুধুমাত্র কার্যনির্বাহী পরিষদ</option>
                <option value="GENERAL_BODY">উপদেষ্টা ও প্রতিষ্ঠাতা সদস্যবৃন্দ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title Bn */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সভার শিরোনাম (বাংলা)' : 'Title (Bangla)'} *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ৯ম বার্ষিক সাধারণ সভা ও লভ্যাংশ বণ্টন"
                value={wizardTitleBn}
                onChange={e => setWizardTitleBn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Title En */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সভার শিরোনাম (ইংরেজি - ঐচ্ছিক)' : 'Title (English)'}</label>
              <input
                type="text"
                placeholder="e.g. 9th Annual General Meeting"
                value={wizardTitleEn}
                onChange={e => setWizardTitleEn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সভার তারিখ' : 'Date'} *</label>
              <input
                type="date"
                required
                value={wizardDate}
                onChange={e => setWizardDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সভার সময়' : 'Time'} *</label>
              <input
                type="text"
                required
                placeholder="সকাল ১০:০০ ঘটিকা"
                value={wizardTime}
                onChange={e => setWizardTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quorum Required */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'প্রয়োজনীয় ন্যূনতম কোরাম (জন)' : 'Quorum Required'} *</label>
              <input
                type="number"
                min="1"
                required
                value={wizardQuorumRequired}
                onChange={e => setWizardQuorumRequired(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Venue & Chairperson */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সভার স্থান / মিলনায়তন' : 'Venue'} *</label>
              <input
                type="text"
                required
                placeholder="সমিতি মিলনায়তন / কমিউনিটি সেন্টার"
                value={wizardVenue}
                onChange={e => setWizardVenue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সভাপতিত্ব করবেন' : 'Chairperson'} *</label>
              <input
                type="text"
                required
                value={wizardChairperson}
                onChange={e => setWizardChairperson(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Agenda Builder */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>{language === 'bn' ? 'সভার আলোচ্যসূচি (Agenda Builder)' : 'Meeting Agendas'}</span>
              <span className="text-slate-400 font-normal text-[11px]">{wizardAgendas.length} টি এজেন্ডা যুক্ত হয়েছে</span>
            </label>

            <div className="space-y-2">
              {wizardAgendas.map((ag, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-xs sm:text-sm text-slate-200">{ag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgendaFromWizard(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Agenda Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={language === 'bn' ? 'নতুন আলোচ্যসূচি লিখুন...' : 'Write new agenda topic...'}
                value={newAgendaInput}
                onChange={e => setNewAgendaInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAgendaToWizard();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddAgendaToWizard}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                {language === 'bn' ? 'যোগ করুন' : 'Add'}
              </button>
            </div>
          </div>

          {/* Auto Notice Checkbox */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
            <input
              type="checkbox"
              id="wizardPublishNotice"
              checked={wizardPublishNotice}
              onChange={e => setWizardPublishNotice(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="wizardPublishNotice" className="text-xs text-slate-300 cursor-pointer">
              {language === 'bn' 
                ? 'একইসাথে ডিজিটাল নোটিশ বোর্ডে প্রকাশ করুন ও সদস্যদের অ্যাপে নোটিফিকেশন পাঠান' 
                : 'Publish notice automatically to Digital Notice Board & push app alert'}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition cursor-pointer"
            >
              {language === 'bn' ? 'সভা আহ্বান ও সংরক্ষণ করুন' : 'Confirm & Schedule Meeting'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: লাইভ সভা পরিচালনা ও ডিজিটাল উপস্থিতি খাতা (LIVE ATTENDANCE SHEET) */}
      {/* ========================================================================= */}
      {activeTab === 'live' && currentMeeting && (
        <div className="space-y-6">
          
          {/* Selected Meeting Header Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {currentMeeting.type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{currentMeeting.meetingNo}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentMeeting.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'
                  }`}>
                    {currentMeeting.status === 'COMPLETED' ? 'সম্পন্ন' : 'লাইভ অধিবেশন'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  {currentMeeting.titleBn}
                </h3>
              </div>

              {/* Meeting Selector Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">{language === 'bn' ? 'সভা পরিবর্তন:' : 'Switch:'}</label>
                <select
                  value={selectedMeetingId}
                  onChange={e => setSelectedMeetingId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {meetings.filter(m => !m.deletedAt).map(m => (
                    <option key={m.id} value={m.id}>{m.titleBn}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quorum Meter & Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
              {/* Quorum Meter */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                currentMeeting.isQuorumMet 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    {currentMeeting.isQuorumMet ? 'কোরাম পূর্ণ হয়েছে' : 'কোরাম অপূর্ণ'}
                  </div>
                  <div className="text-xs opacity-90">
                    প্রয়োজনীয়: {currentMeeting.quorumRequired || 10} | উপস্থিত: <strong>{currentMeeting.totalAttendees}</strong> জন
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center font-black font-mono">
                  {currentMeeting.isQuorumMet ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </div>
              </div>

              {/* Chairperson */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5 text-xs text-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-500">সভাপতি</span>
                <div className="font-semibold text-slate-100 truncate">{currentMeeting.chairpersonNameBn || 'আলহাজ্ব রফিকুল ইসলাম'}</div>
              </div>

              {/* Finish Meeting Action */}
              <div className="flex items-center gap-2">
                {currentMeeting.status !== 'COMPLETED' ? (
                  <button
                    onClick={() => {
                      setCompleteMinutesText(currentMeeting.minutesTextBn || '');
                      setIsCompleteModalOpen(true);
                    }}
                    className="w-full h-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'সভা সমাপ্ত ও কার্যবিবরণী অনুমোদন' : 'Finish & Approve Minutes'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('minutes')}
                    className="w-full h-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'কার্যবিবরণী প্রিন্ট করুন' : 'Print Official Minutes'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Sheet and Real-time Agendas Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Digital Attendance Checklist (7 cols) */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'bn' ? 'ডিজিটাল উপস্থিতি খাতা (Attendance Register)' : 'Digital Attendance Sheet'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">১-ক্লিকে সদস্যদের উপস্থিতি মার্ক করুন</p>
                </div>

                <button
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  {language === 'bn' ? 'সবাইকে উপস্থিত করুন' : 'Mark All Present'}
                </button>
              </div>

              {/* Attendance Table */}
              <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800/80 divide-y divide-slate-800/80">
                {currentMeeting.attendees && currentMeeting.attendees.length > 0 ? (
                  currentMeeting.attendees.map(attendee => (
                    <div 
                      key={attendee.memberId}
                      onClick={() => handleToggleAttendance(attendee.memberId)}
                      className={`flex items-center justify-between p-3 transition cursor-pointer ${
                        attendee.isPresent ? 'bg-emerald-950/20' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          attendee.isPresent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {attendee.isPresent ? <Check className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-200">{attendee.nameBn}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{attendee.memberCode} • {attendee.roleBn}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {attendee.signedAt && (
                          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
                            {attendee.signedAt}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          attendee.isPresent 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {attendee.isPresent ? 'উপস্থিত' : 'অনুপস্থিত'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    উপস্থিতির তালিকা পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Agendas & On-spot Resolutions (5 cols) */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>{language === 'bn' ? 'আলোচনা ও তাৎক্ষণিক সিদ্ধান্ত' : 'Live Resolutions'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">এজেন্ডাভিত্তিক গৃহিত সিদ্ধান্ত লিপিবদ্ধ করুন</p>
                </div>

                <button
                  onClick={() => setIsResolutionModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সিদ্ধান্ত পাস' : 'Add Res'}</span>
                </button>
              </div>

              {/* Passed resolutions list in this meeting */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {currentMeeting.resolutions && currentMeeting.resolutions.length > 0 ? (
                  currentMeeting.resolutions.map((res, i) => {
                    const isStr = typeof res === 'string';
                    return (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-purple-400 font-mono">
                            {isStr ? `সিদ্ধান্ত #${i + 1}` : res.resolutionNo}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                            {isStr ? 'গৃহীত' : res.votingResult === 'UNANIMOUS' ? 'সর্বসম্মত' : 'সংখ্যাগরিষ্ঠ'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-200">
                          {isStr ? res : res.subjectBn}
                        </h5>
                        {!isStr && res.detailsBn && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {res.detailsBn}
                          </p>
                        )}
                        {!isStr && (res.proposerBn || res.seconderBn) && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1">
                            {res.proposerBn && <span>প্রস্তাবক: {res.proposerBn}</span>}
                            {res.seconderBn && <span>সমর্থক: {res.seconderBn}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                    <FileText className="w-6 h-6 mx-auto text-slate-600" />
                    <div>{language === 'bn' ? 'এখনো কোনো আনুষ্ঠানিক সিদ্ধান্ত পাস হয়নি।' : 'No resolutions added yet.'}</div>
                    <button
                      onClick={() => setIsResolutionModalOpen(true)}
                      className="text-xs text-purple-400 hover:underline"
                    >
                      + নতুন সিদ্ধান্ত যোগ করুন
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: রেজোলিউশন ও সিদ্ধান্ত রেজিস্টার (RESOLUTIONS BOOK) */}
      {/* ========================================================================= */}
      {activeTab === 'resolutions' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>{language === 'bn' ? 'সমিতির সর্বসম্মত সিদ্ধান্ত ও রেজোলিউশন রেজিস্টার খাতা' : 'Official Resolutions Register'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'সকল সভার গৃহীত সিদ্ধান্তের ঐতিহাসিক খতিয়ান, প্রস্তাবক, সমর্থক ও কার্যকারিতা' 
                  : 'Historical register of all resolutions, proposers, seconders and enforcement dates'}
              </p>
            </div>

            <button
              onClick={() => {
                if (!currentMeeting) return;
                setIsResolutionModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন রেজোলিউশন অন্তর্ভুক্ত করুন' : 'Add Resolution'}</span>
            </button>
          </div>

          {/* Resolutions Register Table / Cards */}
          <div className="space-y-3">
            {meetings.flatMap(m => (m.resolutions || []).map((res, i) => ({ meeting: m, res, idx: i }))).length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 border border-slate-800 text-center space-y-2 text-slate-500">
                <Award className="w-10 h-10 mx-auto text-slate-600" />
                <div className="text-slate-300 font-bold">কোনো রেজোলিউশন পাওয়া যায়নি</div>
              </div>
            ) : (
              meetings.flatMap(m => (m.resolutions || []).map((res, i) => ({ meeting: m, res, idx: i }))).map(({ meeting: m, res, idx }) => {
                const isStr = typeof res === 'string';
                return (
                  <div key={`${m.id}-${idx}`} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {isStr ? `সিদ্ধান্ত #${idx + 1}` : res.resolutionNo}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {m.titleBn} ({m.date})
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                        {isStr ? 'সর্বসম্মত অনুমোদন' : res.votingResult === 'UNANIMOUS' ? 'সর্বসম্মতিক্রমে গৃহীত' : 'সংখ্যাগরিষ্ঠের ভোটে গৃহীত'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {isStr ? res : res.subjectBn}
                      </h4>
                      {!isStr && res.detailsBn && (
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {res.detailsBn}
                        </p>
                      )}
                    </div>

                    {!isStr && (res.proposerBn || res.seconderBn || res.effectiveDate) && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                        {res.proposerBn && <span>প্রস্তাবক: <strong className="text-slate-200">{res.proposerBn}</strong></span>}
                        {res.seconderBn && <span>সমর্থক: <strong className="text-slate-200">{res.seconderBn}</strong></span>}
                        {res.effectiveDate && <span>কার্যকর তারিখ: <strong className="text-slate-200">{res.effectiveDate}</strong></span>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: অফিশিয়াল কার্যবিবরণী ও নোটিশ প্রিন্ট (PRINTABLE MINUTES & NOTICE) */}
      {/* ========================================================================= */}
      {activeTab === 'minutes' && currentMeeting && (
        <div className="space-y-4">
          
          {/* Top Control Bar (Hidden on Print) */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-semibold">{language === 'bn' ? 'নথি নির্বাচন:' : 'Select Doc:'}</label>
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setPrintDocType('MINUTES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    printDocType === 'MINUTES' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'bn' ? 'কার্যবিবরণী (Minutes)' : 'Formal Minutes'}
                </button>
                <button
                  type="button"
                  onClick={() => setPrintDocType('NOTICE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    printDocType === 'NOTICE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'bn' ? 'সভার নোটিশ (Notice)' : 'Official Notice'}
                </button>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? 'প্রিন্ট / PDF সংরক্ষণ করুন' : 'Print / Save as PDF'}</span>
            </button>
          </div>

          {/* Printable Sheet (Standard A4 Letterhead Format) */}
          <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none print:text-black">
            
            {/* Header Letterhead */}
            <div className="text-center border-b-2 border-slate-800 pb-5 space-y-1">
              <div className="text-xs uppercase font-bold tracking-widest text-slate-600">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {letterhead.samityNameBn || activeTenant.nameBn}
              </h1>
              <div className="text-sm font-bold text-slate-700">
                {letterhead.samityNameEn || activeTenant.nameEn}
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap items-center justify-center gap-3 pt-1">
                <span>সরকারি রেজি নং: <strong>{letterhead.govtRegNo || activeTenant.registrationNo}</strong></span>
                <span>•</span>
                <span>স্থাপিত: <strong>{letterhead.establishedYear || activeTenant.establishedYear}</strong></span>
                <span>•</span>
                <span>ঠিকানা: {letterhead.addressBn || activeTenant.address}</span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
              <h2 className="text-lg font-black tracking-wide text-slate-900 uppercase">
                {printDocType === 'MINUTES' 
                  ? `${currentMeeting.titleBn}-এর অফিশিয়াল কার্যবিবরণী`
                  : `${currentMeeting.titleBn}-এর অফিশিয়াল বিজ্ঞপ্তি ও নোটিশ`}
              </h2>
              <div className="text-xs text-slate-600 font-mono mt-0.5">
                স্মারক নং: {currentMeeting.meetingNo || 'MTG-2026/01'} | তারিখ: {currentMeeting.date}
              </div>
            </div>

            {/* Logistics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 rounded-lg p-3 bg-slate-50">
              <div>
                <span className="text-slate-500 block">সভার ধরন:</span>
                <strong className="text-slate-900">{currentMeeting.type}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">সময়:</span>
                <strong className="text-slate-900">{currentMeeting.time}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">স্থান:</span>
                <strong className="text-slate-900">{currentMeeting.venue}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">উপস্থিতি:</span>
                <strong className="text-slate-900">{currentMeeting.totalAttendees} জন (কোরাম পূর্ণ)</strong>
              </div>
            </div>

            {/* Document Body depending on type */}
            {printDocType === 'MINUTES' ? (
              <div className="space-y-5 text-sm leading-relaxed text-slate-800">
                {/* Meeting Preamble */}
                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">১. সভার প্রারম্ভিক কার্যবিবরণী:</h3>
                  <p className="text-justify indent-6">
                    {currentMeeting.minutesTextBn || `আজ ${currentMeeting.date} তারিখ রোজ ${currentMeeting.time} এ ${currentMeeting.venue} স্থানে ${activeTenant.nameBn}-এর ${currentMeeting.titleBn} অনুষ্ঠিত হয়। সভায় সভাপতিত্ব করেন সমিতির সভাপতি ${currentMeeting.chairpersonNameBn || 'আলহাজ্ব রফিকুল ইসলাম'}। নির্ধারিত কোরামের অধিক সংখ্যক সদস্য উপস্থিত থাকায় সভাপতি মহোদয় সভার কাজ আনুষ্ঠানিকভাবে শুরু করার অনুমতি প্রদান করেন।`}
                  </p>
                </div>

                {/* Agendas Discussed */}
                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">২. আলোচিত আলোচ্যসূচি (Agendas):</h3>
                  <ol className="list-decimal list-inside space-y-1.5 pl-2">
                    {currentMeeting.agenda.map((ag, i) => (
                      <li key={i} className="font-semibold text-slate-900">
                        {typeof ag === 'string' ? ag : ag.titleBn}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Passed Resolutions Table */}
                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">৩. সভায় সর্বসম্মতভাবে গৃহীত সিদ্ধান্তসমূহ (Resolutions):</h3>
                  <table className="w-full text-xs border border-slate-300 mt-2">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="p-2 text-left border-r border-slate-300 w-24">সিদ্ধান্ত নং</th>
                        <th className="p-2 text-left border-r border-slate-300">বিষয় ও বিস্তারিত বিবরণী</th>
                        <th className="p-2 text-left border-r border-slate-300 w-32">প্রস্তাবক ও সমর্থক</th>
                        <th className="p-2 text-center w-24">অনুমোদনের ধরন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {currentMeeting.resolutions && currentMeeting.resolutions.length > 0 ? (
                        currentMeeting.resolutions.map((res, i) => {
                          const isStr = typeof res === 'string';
                          return (
                            <tr key={i}>
                              <td className="p-2 font-mono font-bold align-top border-r border-slate-300">
                                {isStr ? `সিদ্ধান্ত #${i + 1}` : res.resolutionNo}
                              </td>
                              <td className="p-2 align-top border-r border-slate-300">
                                <div className="font-bold text-slate-900">{isStr ? res : res.subjectBn}</div>
                                {!isStr && res.detailsBn && (
                                  <div className="text-slate-600 mt-0.5">{res.detailsBn}</div>
                                )}
                              </td>
                              <td className="p-2 align-top border-r border-slate-300">
                                {!isStr && res.proposerBn ? (
                                  <div>
                                    <div>প্রস্তাবক: {res.proposerBn}</div>
                                    {res.seconderBn && <div>সমর্থক: {res.seconderBn}</div>}
                                  </div>
                                ) : (
                                  <span>সর্বসম্মতিক্রমে</span>
                                )}
                              </td>
                              <td className="p-2 text-center align-top font-bold text-slate-700">
                                {isStr ? 'সর্বসম্মত' : res.votingResult === 'UNANIMOUS' ? 'সর্বসম্মত' : 'সংখ্যাগরিষ্ঠ'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">
                            কোনো রেজোলিউশন অন্তর্ভুক্ত করা হয়নি।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Concluding Remarks */}
                <div>
                  <p className="text-justify indent-6 pt-2">
                    সভায় আর কোনো আলোচ্যসূচি না থাকায় সভাপতি মহোদয় উপস্থিত সকল সদস্যকে ধন্যবাদ ও সমিতির সার্বিক সমৃদ্ধি কামনা করে সভার সমাপ্তি ঘোষণা করেন।
                  </p>
                </div>
              </div>
            ) : (
              /* Official Notice Format */
              <div className="space-y-5 text-sm leading-relaxed text-slate-800">
                <p className="text-justify indent-6 font-medium text-slate-900">
                  এতদ্বারা সমিতির সম্মানিত সদস্যগণের অবগতির জন্য বিনীতভাবে জানানো যাচ্ছে যে, কার্যনির্বাহী পরিষদের সিদ্ধান্ত মোতাবেক আগামী <strong>{currentMeeting.date}</strong> তারিখ রোজ <strong>{currentMeeting.time}</strong> এ সমিতির <strong>{currentMeeting.venue}</strong> মিলনায়তনে <strong>{currentMeeting.titleBn}</strong> অনুষ্ঠিত হবে।
                </p>

                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">সভার আলোচ্যসূচি (Agendas):</h3>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    {currentMeeting.agenda.map((ag, i) => (
                      <li key={i} className="font-medium text-slate-900">
                        {typeof ag === 'string' ? ag : ag.titleBn}
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="text-justify indent-6 pt-2">
                  উক্ত গুরুত্বপূর্ণ সভায় সময়মতো উপস্থিত থেকে মতামত ও পরামর্শ প্রদানের জন্য সমিতির সকল সদস্যকে সনির্বন্ধ অনুরোধ জানানো যাচ্ছে।
                </p>
              </div>
            )}

            {/* Official Signatures Row */}
            <div className="pt-16 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
              <div className="space-y-1">
                <div className="w-48 mx-auto border-t border-slate-700 pt-2 font-bold text-slate-900">
                  {currentMeeting.recordingSecretaryNameBn || letterhead.secretaryNameBn || 'সাধারণ সম্পাদক'}
                </div>
                <div className="text-slate-500 text-[11px]">সাধারণ সম্পাদক, {activeTenant.nameBn}</div>
              </div>

              <div className="space-y-1">
                <div className="w-48 mx-auto border-t border-slate-700 pt-2 font-bold text-slate-900">
                  {currentMeeting.chairpersonNameBn || letterhead.presidentNameBn || 'সভাপতি'}
                </div>
                <div className="text-slate-500 text-[11px]">সভাপতি, {activeTenant.nameBn}</div>
              </div>
            </div>

            {/* Footer Seal & Verification */}
            <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-500">
              ডিজিটালভাবে সমিতিপ্রো ক্লাউড প্ল্যাটফর্ম থেকে সংকলিত • অডিট ট্রেইল দ্বারা সংরক্ষিত ও সুরক্ষিত • {activeTenant.slug}.samitypro.com
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: নতুন রেজোলিউশন যোগ করার উইন্ডো */}
      {/* ========================================================================= */}
      {isResolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>{language === 'bn' ? 'নতুন সিদ্ধান্ত / রেজোলিউশন অন্তর্ভুক্ত করুন' : 'Add New Resolution'}</span>
              </h4>
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResolutionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সিদ্ধান্তের মূল বিষয় (Subject)' : 'Subject'} *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ২০২৬ সালের শেয়ারের উপর ১২% লভ্যাংশ বণ্টন"
                  value={resSubjectBn}
                  onChange={e => setResSubjectBn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'গৃহীত সিদ্ধান্তের পূর্ণ বিবরণী' : 'Resolution Details'} *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="বিস্তারিত আলোচনা ও গৃহীত সর্বসম্মত সিদ্ধান্ত..."
                  value={resDetailsBn}
                  onChange={e => setResDetailsBn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'প্রস্তাবক (Proposer)' : 'Proposer'}</label>
                  <input
                    type="text"
                    placeholder="সদস্যের নাম বা পদবী"
                    value={resProposerBn}
                    onChange={e => setResProposerBn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'সমর্থক (Seconder)' : 'Seconder'}</label>
                  <input
                    type="text"
                    placeholder="সদস্যের নাম বা পদবী"
                    value={resSeconderBn}
                    onChange={e => setResSeconderBn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">{language === 'bn' ? 'অনুমোদনের ধরন' : 'Voting Result'}</label>
                <select
                  value={resVotingResult}
                  onChange={e => setResVotingResult(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="UNANIMOUS">সর্বসম্মতিক্রমে পাস (Unanimous)</option>
                  <option value="MAJORITY">সংখ্যাগরিষ্ঠ ভোটে পাস (Majority)</option>
                  <option value="VETO">বিশেষ নির্বাহী সিদ্ধান্তে</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResolutionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  সিদ্ধান্ত অন্তর্ভুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: সভা সমাপ্তি ও কার্যবিবরণী অনুমোদন উইন্ডো */}
      {/* ========================================================================= */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{language === 'bn' ? 'সভা সমাপ্ত ও কার্যবিবরণী চূড়ান্তকরণ' : 'Finalize & Approve Minutes'}</span>
              </h4>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinalizeMeetingSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'সভার সমাপনী কার্যবিবরণী খসড়া' : 'Draft Minutes Note'}
                </label>
                <textarea
                  rows={4}
                  placeholder="আজকের সভার সমাপ্তি ঘোষণা ও গৃহীত সিদ্ধান্তসমূহের সংক্ষিপ্ত সার..."
                  value={completeMinutesText}
                  onChange={e => setCompleteMinutesText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'অনুমোদনকারী সভাপতি' : 'Approved By'}
                </label>
                <input
                  type="text"
                  required
                  value={completeApprovedBy}
                  onChange={e => setCompleteApprovedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                সভা সমাপ্ত চিহ্নিত হলে সভার কার্যবিবরণী ও রেজোলিউশনসমূহ স্থায়ী ডিজিটাল আর্কাইভে লক হয়ে যাবে এবং প্রিন্টযোগ্য অফিশিয়াল ফরম্যাটে প্রস্তুত হবে।
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  চূড়ান্ত অনুমোদন দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
