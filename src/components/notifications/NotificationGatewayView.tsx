'use client';

import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Smartphone, Bot, Send, Settings, Sliders, 
  CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck, 
  ExternalLink, Search, Filter, History, Clock, Users,
  Phone, Eye, Copy, ArrowUpRight, DollarSign, BellRing,
  Sparkles, Check, ChevronRight, X, Radio
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  NotificationTemplate, SmsGatewaySettings, WhatsAppGatewaySettings,
  NotificationLog, ReminderChannel, NotificationTriggerEvent, SmsGatewayProvider
} from '@/types';

export default function NotificationGatewayView() {
  const { 
    members, staffEmployees, subscriptions, loans, activeTenant,
    notificationTemplates, smsGatewaySettings, whatsAppGatewaySettings,
    notificationLogs, updateNotificationTemplate, updateSmsGatewaySettings,
    updateWhatsAppGatewaySettings, sendNotification, bulkSendNotifications
  } = useSamityStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'DISPATCHER' | 'TEMPLATES' | 'GATEWAYS' | 'LOGS'>('DISPATCHER');

  // Gateway Tab (WhatsApp / SMS / Telegram)
  const [activeGatewayType, setActiveGatewayType] = useState<'WHATSAPP' | 'SMS' | 'TELEGRAM'>('WHATSAPP');

  // Single Message Dispatcher State
  const [recipientType, setRecipientType] = useState<'MEMBER' | 'STAFF' | 'CUSTOM'>('MEMBER');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(staffEmployees[0]?.id || '');
  const [customPhone, setCustomPhone] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ReminderChannel>('WHATSAPP');
  const [selectedEvent, setSelectedEvent] = useState<NotificationTriggerEvent>('MANUAL_DISPATCH');
  const [messageBody, setMessageBody] = useState('');

  // Bulk Dispatcher State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkTarget, setBulkTarget] = useState<'ALL_MEMBERS' | 'DUE_MEMBERS' | 'ACTIVE_BORROWERS' | 'ALL_STAFF'>('DUE_MEMBERS');
  const [bulkChannel, setBulkChannel] = useState<ReminderChannel>('WHATSAPP');
  const [bulkTemplateId, setBulkTemplateId] = useState(notificationTemplates[0]?.id || '');

  // Log Search & Filter
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logChannelFilter, setLogChannelFilter] = useState<string>('ALL');

  // Feedback Alert
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string; waUrl?: string } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success', waUrl?: string) => {
    setFeedbackMsg({ text, type, waUrl });
    if (!waUrl) {
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Selected Recipient Details
  const currentRecipient = useMemo(() => {
    if (recipientType === 'MEMBER') {
      const m = members.find(mem => mem.id === selectedMemberId);
      return { name: m?.nameBn || '', phone: m?.phone || '', id: m?.id };
    } else if (recipientType === 'STAFF') {
      const s = staffEmployees.find(emp => emp.id === selectedStaffId);
      return { name: s?.nameBn || '', phone: s?.phone || '', id: s?.id };
    } else {
      return { name: customName || 'গ্রাহক', phone: customPhone, id: undefined };
    }
  }, [recipientType, selectedMemberId, selectedStaffId, customName, customPhone, members, staffEmployees]);

  // Character Count & SMS Parts
  const charCount = messageBody.length;
  const isBangla = /[\u0980-\u09FF]/.test(messageBody);
  const smsPartSize = isBangla ? 70 : 160;
  const smsParts = Math.max(1, Math.ceil(charCount / smsPartSize));

  // Populate message from Template
  const handleSelectTemplate = (tpl: NotificationTemplate) => {
    let text = tpl.templateBn;
    text = text.replace(/{{memberName}}/g, currentRecipient.name || 'সদস্য');
    text = text.replace(/{{employeeName}}/g, currentRecipient.name || 'কর্মী');
    text = text.replace(/{{samityName}}/g, activeTenant?.nameBn || 'একতা বহুমুখী সমবায় সমিতি');
    text = text.replace(/{{date}}/g, new Date().toISOString().split('T')[0]);
    text = text.replace(/{{amount}}/g, '১,৫০০');
    text = text.replace(/{{receiptNo}}/g, 'REC-20261027-01');
    text = text.replace(/{{balance}}/g, '২৫,০০০');
    text = text.replace(/{{phone}}/g, activeTenant?.phone || '01711223344');
    setMessageBody(text);
    setSelectedEvent(tpl.event);
  };

  // Send Single Notification
  const handleSendSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecipient.phone || !messageBody.trim()) {
      showFeedback('অনুগ্রহ করে প্রাপকের সঠিক ফোন নম্বর ও বার্তা লিখুন', 'error');
      return;
    }

    try {
      const res = sendNotification({
        recipientPhone: currentRecipient.phone,
        recipientName: currentRecipient.name,
        channel: selectedChannel,
        event: selectedEvent,
        messageText: messageBody,
        memberId: recipientType === 'MEMBER' ? currentRecipient.id : undefined,
        employeeId: recipientType === 'STAFF' ? currentRecipient.id : undefined
      });

      if (selectedChannel === 'WHATSAPP' && res.waMeUrl) {
        showFeedback('বার্তা প্রস্তুত! সরাসরি হোয়াটসঅ্যাপে পাঠাতে নিচের বাটনে ক্লিক করুন:', 'success', res.waMeUrl);
      } else {
        showFeedback(res.message, 'success');
        setMessageBody('');
      }
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'বার্তা প্রেরণে ত্রুটি', 'error');
    }
  };

  // Bulk Target Count
  const bulkRecipients = useMemo(() => {
    if (bulkTarget === 'ALL_MEMBERS') {
      return members.map(m => ({ phone: m.phone, name: m.nameBn, memberId: m.id }));
    } else if (bulkTarget === 'DUE_MEMBERS') {
      const dueMemberIds = new Set(subscriptions.filter(s => s.status !== 'PAID').map(s => s.memberId));
      return members.filter(m => dueMemberIds.has(m.id)).map(m => ({ phone: m.phone, name: m.nameBn, memberId: m.id }));
    } else if (bulkTarget === 'ACTIVE_BORROWERS') {
      const borrowerIds = new Set(loans.filter(l => l.status === 'ACTIVE').map(l => l.memberId));
      return members.filter(m => borrowerIds.has(m.id)).map(m => ({ phone: m.phone, name: m.nameBn, memberId: m.id }));
    } else {
      return staffEmployees.filter(s => s.status === 'ACTIVE').map(s => ({ phone: s.phone, name: s.nameBn, employeeId: s.id }));
    }
  }, [bulkTarget, members, subscriptions, loans, staffEmployees]);

  // Bulk Dispatch Handler
  const handleBulkDispatch = () => {
    if (!confirm(`আপনি কি নিশ্চিত যে ${bulkRecipients.length} জন প্রাপককে ${bulkChannel}-এর মাধ্যমে বার্তা পাঠাতে চান?`)) {
      return;
    }

    const tpl = notificationTemplates.find(t => t.id === bulkTemplateId);
    const msg = tpl ? tpl.templateBn : 'সম্মানিত {{memberName}}, একতা সমবায় সমিতি হতে জরুরি বিজ্ঞপ্তি। ধন্যবাদ।';

    const res = bulkSendNotifications({
      recipientList: bulkRecipients,
      channel: bulkChannel,
      event: tpl ? tpl.event : 'MANUAL_DISPATCH',
      messageText: msg
    });

    showFeedback(`সফলভাবে ${res.totalSent} টি বার্তা প্রেরণের জন্য শিডিউল ও কিউতে যুক্ত করা হয়েছে!`, 'success');
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return notificationLogs.filter(log => {
      const matchSearch = log.recipientName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                          log.recipientPhone.includes(logSearchQuery) ||
                          log.messageText.toLowerCase().includes(logSearchQuery.toLowerCase());
      const matchChannel = logChannelFilter === 'ALL' || log.channel === logChannelFilter;
      return matchSearch && matchChannel;
    });
  }, [notificationLogs, logSearchQuery, logChannelFilter]);

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span className="text-sm font-semibold">{feedbackMsg.text}</span>
          </div>

          <div className="flex items-center gap-2">
            {feedbackMsg.waUrl && (
              <a
                href={feedbackMsg.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/40 transition"
              >
                <span>WhatsApp খুলুন</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>মডিউল ৮: এসএমএস/হোয়াটসঅ্যাপ গেটওয়ে ও অটোমেটেড নোটিফিকেশন</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              অমনিচ্যানেল মেসেজিং ও অটোমেশন কন্ট্রোল সেন্টার
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              WhatsApp (wa.me ডাইরেক্ট ও Open-WA), বাংলাদেশি এসএমএস গেটওয়ে (GreenWeb, BulkSMSBD, Onnorokom, TextBee SIM Gateway), ডাইনামিক বাংলা টেমপ্লেট ও ডেলিভারি লগ।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">এসএমএস ব্যালান্স কোটা</div>
                <div className="text-lg font-black text-white font-mono">{smsGatewaySettings.balanceCount} টি</div>
              </div>
            </div>
          </div>
        </div>

        {/* Channels Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">WhatsApp</div>
                <div className="text-[10px] text-emerald-400">০% ব্যান রিস্ক (Direct wa.me)</div>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">SMS Gateway</div>
                <div className="text-[10px] text-slate-400">{smsGatewaySettings.provider}</div>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs font-bold text-white">Telegram Bot</div>
                <div className="text-[10px] text-slate-400">Webhook Active</div>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">মোট প্রেরিত বার্তা</div>
                <div className="text-[10px] text-amber-400 font-mono">{notificationLogs.length} টি সম্পন্ন</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'DISPATCHER', label: 'মেসেজ ডিসপ্যাচার (Live Dispatch)', icon: Send },
          { id: 'TEMPLATES', label: `নোটিফিকেশন টেমপ্লেট (${notificationTemplates.length})`, icon: Sparkles },
          { id: 'GATEWAYS', label: 'গেটওয়ে কনফিগারেশন ও ব্যালান্স', icon: Settings },
          { id: 'LOGS', label: `ডেলিভারি হিস্ট্রি (${notificationLogs.length})`, icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DISPATCHER */}
      {activeTab === 'DISPATCHER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dispatch Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    {isBulkMode ? 'বাল্ক নোটিফিকেশন ডিসপ্যাচ' : 'তাৎক্ষণিক নোটিফিকেশন পাঠান'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setIsBulkMode(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      !isBulkMode ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    একক বার্তা
                  </button>
                  <button
                    onClick={() => setIsBulkMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isBulkMode ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    বাল্ক মেসেজিং
                  </button>
                </div>
              </div>

              {!isBulkMode ? (
                /* SINGLE DISPATCH FORM */
                <form onSubmit={handleSendSingle} className="space-y-4">
                  {/* Recipient Source Toggle */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'MEMBER', label: 'সমিতি সদস্য' },
                      { id: 'STAFF', label: 'অফিস কর্মী/স্টাফ' },
                      { id: 'CUSTOM', label: 'কাস্টম মোবাইল' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setRecipientType(type.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                          recipientType === type.id
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Recipient Selector */}
                  {recipientType === 'MEMBER' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">সদস্য নির্বাচন করুন</label>
                      <select
                        value={selectedMemberId}
                        onChange={e => setSelectedMemberId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.nameBn} ({m.memberCode}) - {m.phone}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {recipientType === 'STAFF' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">স্টাফ কর্মী নির্বাচন করুন</label>
                      <select
                        value={selectedStaffId}
                        onChange={e => setSelectedStaffId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        {staffEmployees.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.nameBn} ({s.employeeCode}) - {s.phone}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {recipientType === 'CUSTOM' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">প্রাপকের নাম</label>
                        <input
                          type="text"
                          value={customName}
                          onChange={e => setCustomName(e.target.value)}
                          placeholder="উদাঃ মোঃ রফিকুল ইসলাম"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          value={customPhone}
                          onChange={e => setCustomPhone(e.target.value)}
                          placeholder="017xxxxxxxx"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Channel & Event Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">মেসেজিং চ্যানেল *</label>
                      <select
                        value={selectedChannel}
                        onChange={e => setSelectedChannel(e.target.value as ReminderChannel)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="WHATSAPP">WhatsApp (অফিশিয়াল ডাইরেক্ট ও Open-WA)</option>
                        <option value="SMS">SMS (GreenWeb / স্থানীয় সিম গেটওয়ে)</option>
                        <option value="TELEGRAM">Telegram Bot Channel</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">নোটিফিকেশন ইভেন্ট ক্যাটাগরি</label>
                      <select
                        value={selectedEvent}
                        onChange={e => setSelectedEvent(e.target.value as NotificationTriggerEvent)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="MANUAL_DISPATCH">ম্যানুয়াল তাগাদা বা নোটিশ</option>
                        <option value="SAVINGS_DEPOSIT_CONFIRMATION">সঞ্চয়/ডিপিএস জমা নিশ্চিতকরণ</option>
                        <option value="LOAN_INSTALLMENT_RECEIVED">ঋণের কিস্তি আদায় রসিদ</option>
                        <option value="LOAN_OVERDUE_ALERT">ঋণ খেলাপী তাগাদা সতর্কতা</option>
                        <option value="FDR_PROFIT_DISBURSEMENT">এফডিআর মুনাফা বিতরণ</option>
                        <option value="STAFF_SALARY_DISBURSEMENT">স্টাফ বেতন পরিশোধ</option>
                        <option value="AGM_MEETING_INVITATION">বার্ষিক সাধারণ সভা (AGM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Body Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">বার্তা কন্টেন্ট (Message Text) *</label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {charCount} অক্ষর • {smsParts} টি SMS {isBangla ? '(বাংলা ইউনিকোড)' : '(English)'}
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={messageBody}
                      onChange={e => setMessageBody(e.target.value)}
                      placeholder="এখানে বার্তার মূল বিবরণ লিখুন..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white leading-relaxed focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-400">
                      প্রাপক: <strong className="text-white">{currentRecipient.name}</strong> ({currentRecipient.phone || 'নম্বর নেই'})
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{selectedChannel === 'WHATSAPP' ? 'হোয়াটসঅ্যাপ লিংক প্রস্তুত করুন' : 'বার্তা পাঠান'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* BULK DISPATCH FORM */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">টার্গেট প্রাপক গ্রুপ</label>
                      <select
                        value={bulkTarget}
                        onChange={e => setBulkTarget(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="DUE_MEMBERS">বকেয়া কিস্তি/চাঁদাধারী সদস্যগণ</option>
                        <option value="ALL_MEMBERS">সমিতির সকল নিবন্ধিত সদস্য</option>
                        <option value="ACTIVE_BORROWERS">চলমান ঋণগ্রহীতা সদস্যগণ</option>
                        <option value="ALL_STAFF">সকল সক্রিয় কর্মকর্তা-কর্মচারী</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">ডিসপ্যাচ চ্যানেল</label>
                      <select
                        value={bulkChannel}
                        onChange={e => setBulkChannel(e.target.value as ReminderChannel)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="WHATSAPP">WhatsApp (Open-WA & wa.me Queue)</option>
                        <option value="SMS">SMS (GreenWeb / টেলিকম গেটওয়ে)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">বার্তা টেমপ্লেট নির্বাচন</label>
                    <select
                      value={bulkTemplateId}
                      onChange={e => setBulkTemplateId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {notificationTemplates.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.titleBn} ({tpl.event})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">টার্গেট গ্রুপের প্রাপক সংখ্যা:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{bulkRecipients.length} জন</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">আনুমানিক SMS কোটা খরচ:</span>
                      <strong className="text-amber-400 font-mono text-sm">
                        {bulkChannel === 'SMS' ? `${bulkRecipients.length} টি` : '০ টি (ফ্রি WhatsApp)'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      onClick={handleBulkDispatch}
                      disabled={bulkRecipients.length === 0}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{bulkRecipients.length} জনকে বাল্ক বার্তা প্রেরণ করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Quick Bangla Templates */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>রেডিমেড নোটিফিকেশন টেমপ্লেট</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                নিচের যেকোনো টেমপ্লেটে ক্লিক করলে মূল বার্তার বক্সে ফিল হয়ে যাবে:
              </p>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {notificationTemplates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900 transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{tpl.titleBn}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{tpl.channel}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{tpl.templateBn}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES EDITOR */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>ডাইনামিক নোটিফিকেশন টেমপ্লেট লাইব্রেরি</span>
              </h3>
              <p className="text-xs text-slate-400">
                সঞ্চয়, ঋণ কিস্তি, এফডিআর ও সভার স্বয়ংক্রিয় বার্তার ড্রাফট ও ভ্যারিয়েবল কনফিগারেশন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notificationTemplates.map(tpl => (
              <div key={tpl.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{tpl.titleBn}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{tpl.event}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-[10px] font-bold">
                    {tpl.channel}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {tpl.templateBn}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tpl.variables.map(v => (
                    <span key={v} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GATEWAYS CONFIGURATION */}
      {activeTab === 'GATEWAYS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            {[
              { id: 'WHATSAPP', label: 'WhatsApp গেটওয়ে (wa.me & Open-WA)', icon: MessageSquare, badge: 'সক্রিয়' },
              { id: 'SMS', label: 'SMS গেটওয়ে (GreenWeb / স্থানীয় SIM)', icon: Smartphone, badge: `${smsGatewaySettings.balanceCount} এসএমএস` },
              { id: 'TELEGRAM', label: 'Telegram Bot Webhook', icon: Bot, badge: 'সক্রিয়' },
            ].map(gw => {
              const Icon = gw.icon;
              return (
                <button
                  key={gw.id}
                  onClick={() => setActiveGatewayType(gw.id as any)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    activeGatewayType === gw.id
                      ? 'bg-slate-900 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${activeGatewayType === gw.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">{gw.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {gw.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6">
            {activeGatewayType === 'WHATSAPP' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>WhatsApp বিজনেস অটোমেশন ইঞ্জিন</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">হোয়াটসঅ্যাপ অপারেশন মোড</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-emerald-950/20 border border-emerald-500/50 rounded-2xl space-y-1">
                      <div className="text-xs font-bold text-emerald-400">Direct Click-to-Chat (wa.me)</div>
                      <p className="text-[11px] text-slate-400">
                        কোনো থার্ড-পার্টি সার্ভার ছাড়া সরাসরি ১-ক্লিকে অফিসিয়াল অ্যাপ ওপেন হবে (০% নম্বর ব্লক রিস্ক)।
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                      <div className="text-xs font-bold text-slate-300">Open-WA / Node Server</div>
                      <p className="text-[11px] text-slate-400">
                        ব্যাকগ্রাউন্ডে সম্পূর্ণ অটোমেটেড রসিদ প্রেরণের জন্য ব্যাকএন্ড নোড ইঞ্জিন।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">কানেক্টেড হোয়াটসঅ্যাপ নম্বর:</span>
                    <strong className="text-white font-mono">{whatsAppGatewaySettings.connectedPhone}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeGatewayType === 'SMS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <span>বাংলাদেশি টেলিকম এসএমএস গেটওয়ে কনফিগারেশন</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">এসএমএস প্রোভাইডার</label>
                    <select
                      value={smsGatewaySettings.provider}
                      onChange={e => updateSmsGatewaySettings({ provider: e.target.value as SmsGatewayProvider })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="GREENWEB_BD">GreenWeb BD API (মাস্কিং ও নন-মাস্কিং)</option>
                      <option value="BULKSMS_BD">BulkSMSBD</option>
                      <option value="ONNOROKOM_SMS">অন্যরকম এসএমএস (Onnorokom SMS)</option>
                      <option value="TEXTBEE_ANDROID_SIM">TextBee Android Local SIM Gateway (ফ্রি)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">প্রেরক আইডি (Sender ID / Masking)</label>
                    <input
                      type="text"
                      value={smsGatewaySettings.senderId}
                      onChange={e => updateSmsGatewaySettings({ senderId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">বর্তমান এসএমএস ব্যালান্স কোটা</div>
                    <div className="text-[11px] text-slate-400">প্রতিটি এসএমএস প্রেরণে স্বয়ংক্রিয়ভাবে হিসাব হালনাগাদ হয়</div>
                  </div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {smsGatewaySettings.balanceCount} টি
                  </div>
                </div>
              </div>
            )}

            {activeGatewayType === 'TELEGRAM' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <span>Telegram Bot ও ওয়েবহুক ইন্টিগ্রেশন</span>
                  </h3>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p>টেলিগ্রাম বট টোকেন ও অফিসিয়াল চ্যানেলে স্বয়ংক্রিয় মিটিং নোটিশ এবং সভাপতি সতর্কবার্তা প্রেরণের জন্য সক্রিয়।</p>
                  <div className="text-emerald-400 font-semibold">Webhook Status: Healthy (200 OK)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY LOGS */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="প্রাপকের নাম, মোবাইল বা মেসেজ দিয়ে খুঁজুন..."
                value={logSearchQuery}
                onChange={e => setLogSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={logChannelFilter}
              onChange={e => setLogChannelFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="ALL">সকল চ্যানেল</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
              <option value="TELEGRAM">Telegram</option>
            </select>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">প্রাপকের নাম ও মোবাইল</th>
                    <th className="p-3.5">চ্যানেল</th>
                    <th className="p-3.5">ইভেন্ট</th>
                    <th className="p-3.5">বার্তা বিবরণী</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5 font-mono">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        কোনো মেসেজ ডেলিভারি হিস্ট্রি পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{log.recipientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{log.recipientPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                            {log.channel}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {log.event}
                        </td>
                        <td className="p-3.5">
                          <div className="text-[11px] text-slate-300 truncate max-w-[280px]">
                            {log.messageText}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                          {log.sentAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
