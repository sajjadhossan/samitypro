'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Send, Smartphone, QrCode, Bot, Globe,
  ShieldCheck, AlertCircle, CheckCircle, Radio, Clock,
  RefreshCw, Play, Settings2, Sliders, ExternalLink, Zap
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { ReminderChannel, WhatsAppMode, SmsProvider } from '@/types';

export function CommunicationHubView() {
  const { 
    gatewayConfig, schedulerConfig, subscriptions, members, 
    updateGatewayConfig, updateSchedulerConfig, 
    sendOmnichannelReminder, sendBulkOmnichannelReminders, 
    reminders, letterhead 
  } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'GATEWAYS' | 'DISPATCHER' | 'SCHEDULER' | 'LOGS'>('GATEWAYS');
  const [subGatewayTab, setSubGatewayTab] = useState<'WHATSAPP' | 'SMS' | 'TELEGRAM' | 'MESSENGER'>('WHATSAPP');

  // Test Console State
  const [testMemberId, setTestMemberId] = useState(members[0]?.id || '');
  const [testChannel, setTestChannel] = useState<ReminderChannel>('WHATSAPP');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; externalUrl?: string } | null>(null);

  // Bulk Dispatcher State
  const [bulkChannel, setBulkChannel] = useState<ReminderChannel>('WHATSAPP');
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ totalSent: number; channel: ReminderChannel } | null>(null);

  // Form State for Gateway Config
  const [gwForm, setGwForm] = useState({ ...gatewayConfig });
  const [schedForm, setSchedForm] = useState({ ...schedulerConfig });
  const [saveAlert, setSaveAlert] = useState(false);

  const unpaidMembersCount = subscriptions.filter(s => s.status !== 'PAID').length;

  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    updateGatewayConfig(gwForm);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const handleSaveScheduler = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchedulerConfig(schedForm);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const handleSendSingleTest = () => {
    const res = sendOmnichannelReminder({
      memberId: testMemberId,
      channel: testChannel
    });
    setTestResult(res);
  };

  const handleTriggerBulk = () => {
    if (!confirm(`আপনি কি নিশ্চিত যে সকল বকেয়া সদস্যদের (${unpaidMembersCount} জন) ${bulkChannel}-এর মাধ্যমে বার্তা পাঠাতে চান?`)) {
      return;
    }
    setIsBulkSending(true);
    setTimeout(() => {
      const res = sendBulkOmnichannelReminders(bulkChannel);
      setBulkResult(res);
      setIsBulkSending(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>অমনিচ্যানেল মেসেজিং ও গেটওয়ে হাব (Module 10, 11, 12, 13)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            কমিউনিকেশন ও অটোমেশন কন্ট্রোল সেন্টার
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Open-WA (WhatsApp), TextBee/অ্যান্ড্রয়েড ফ্রি SMS, Telegram Bot এবং Facebook Messenger/Botpress ইন্টিগ্রেশন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('DISPATCHER')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>তাগাদা মেসেজ পাঠান ({unpaidMembersCount})</span>
          </button>
        </div>
      </div>

      {saveAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'GATEWAYS', label: 'গেটওয়ে কনফিগারেশন (Open-WA, TextBee, Botpress)' },
          { id: 'DISPATCHER', label: `বাল্ক মেসেজ ডিসপ্যাচার (${unpaidMembersCount} বকেয়া)` },
          { id: 'SCHEDULER', label: 'স্বয়ংক্রিয় শিডিউলার (Auto-Scheduler)' },
          { id: 'LOGS', label: `মেসেজ ডেলিভারি হিস্ট্রি (${reminders.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GATEWAYS CONFIGURATION */}
      {activeTab === 'GATEWAYS' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Channel Selector Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'WHATSAPP', label: 'WhatsApp (Open-WA & wa.me)', icon: MessageSquare, badge: gwForm.isWhatsappConnected ? 'কানেক্টেড' : 'ডিসকানেক্ট' },
              { id: 'SMS', label: 'SMS (TextBee / SIM Gateway)', icon: Smartphone, badge: `${gwForm.smsSimBalanceCount} এসএমএস বাকি` },
              { id: 'TELEGRAM', label: 'Telegram Bot API', icon: Bot, badge: 'সক্রিয়' },
              { id: 'MESSENGER', label: 'Facebook / Botpress', icon: Globe, badge: 'সক্রিয়' },
            ].map(ch => {
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSubGatewayTab(ch.id as any)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    subGatewayTab === ch.id
                      ? 'bg-slate-900 border-emerald-500/50 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${subGatewayTab === ch.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">{ch.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {ch.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Config Detail Panel */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <form onSubmit={handleSaveGateways} className="space-y-5">
              {/* WHATSAPP CONFIG */}
              {subGatewayTab === 'WHATSAPP' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                        <span>হোয়াটসঅ্যাপ অটোমেশন ইঞ্জিন (Open-WA & wa.me)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ওপেন-সোর্স Open-WA লাইব্রেরির মাধ্যমে ফ্রি অটোমেশন অথবা সরাসরি লিংক দিয়ে বার্তা পাঠান
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">অপারেশন মোড (Operation Mode)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        gwForm.whatsappMode === 'OPEN_WA' ? 'bg-emerald-950/20 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="whatsappMode"
                          checked={gwForm.whatsappMode === 'OPEN_WA'}
                          onChange={() => setGwForm({ ...gwForm, whatsappMode: 'OPEN_WA' })}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-xs font-bold text-emerald-400">Open-WA (Automated Background Engine)</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">ব্যাকগ্রাউন্ডে সম্পূর্ণ স্বয়ংক্রিয়ভাবে মেসেজ ও পিডিএফ রসিদ চলে যাবে।</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        gwForm.whatsappMode === 'WA_ME_DIRECT' ? 'bg-emerald-950/20 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="whatsappMode"
                          checked={gwForm.whatsappMode === 'WA_ME_DIRECT'}
                          onChange={() => setGwForm({ ...gwForm, whatsappMode: 'WA_ME_DIRECT' })}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-xs font-bold text-emerald-400">Direct Click-to-Chat (wa.me)</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">কোনো সার্ভার ছাড়া সরাসরি ১-ক্লিকে অফিশিয়াল WhatsApp ওপেন হবে (০% ব্যান রিস্ক)।</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {gwForm.whatsappMode === 'OPEN_WA' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Open-WA সার্ভার URL</label>
                        <input
                          type="text"
                          value={gwForm.openWaServerUrl}
                          onChange={(e) => setGwForm({ ...gwForm, openWaServerUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Open-WA Secret API Key</label>
                        <input
                          type="password"
                          value={gwForm.openWaApiKey}
                          onChange={(e) => setGwForm({ ...gwForm, openWaApiKey: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white">হোয়াটসঅ্যাপ কিউআর কোড পেয়ারিং স্ট্যাটাস</div>
                        <div className="text-[11px] text-slate-400">কানেক্টেড নম্বর: {gwForm.whatsappConnectedPhone || 'অসংযুক্ত'}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      সক্রিয় ও প্রস্তুত
                    </span>
                  </div>
                </div>
              )}

              {/* SMS GATEWAY CONFIG */}
              {subGatewayTab === 'SMS' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-cyan-400" />
                      <span>ফ্রি অ্যান্ড্রয়েড ও সিম কার্ড এসএমএস গেটওয়ে</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      TextBee অথবা লোকাল অ্যান্ড্রয়েড ফোনের মাধ্যমে নিজস্ব সিমের বান্ডেল অফার দিয়ে এসএমএস পাঠান
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">এসএমএস প্রোভাইডার নির্বাচন করুন</label>
                    <select
                      value={gwForm.smsProvider}
                      onChange={(e) => setGwForm({ ...gwForm, smsProvider: e.target.value as SmsProvider })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold"
                    >
                      <option value="TEXTBEE">TextBee (Open Source Android App - Recommended)</option>
                      <option value="HTTPSMS">HTTP SMS (Android Cloud App)</option>
                      <option value="LOCAL_ANDROID">Local Android Wi-Fi Gateway (IP Port)</option>
                      <option value="COMMERCIAL_AGGREGATOR">Commercial Bulk SMS (GP/Banglalink/BulkSMSBD)</option>
                    </select>
                  </div>

                  {gwForm.smsProvider === 'TEXTBEE' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">TextBee Device ID</label>
                        <input
                          type="text"
                          value={gwForm.textBeeDeviceId}
                          onChange={(e) => setGwForm({ ...gwForm, textBeeDeviceId: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">TextBee API Key</label>
                        <input
                          type="password"
                          value={gwForm.textBeeApiKey}
                          onChange={(e) => setGwForm({ ...gwForm, textBeeApiKey: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {gwForm.smsProvider === 'LOCAL_ANDROID' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">মোবাইলের লোকাল Wi-Fi গেটওয়ে URL</label>
                      <input
                        type="text"
                        value={gwForm.localAndroidGatewayUrl}
                        onChange={(e) => setGwForm({ ...gwForm, localAndroidGatewayUrl: e.target.value })}
                        placeholder="http://192.168.1.150:8080"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">সিমে অবশিষ্ট এসএমএস বান্ডেল ব্যালেন্স</label>
                      <input
                        type="number"
                        value={gwForm.smsSimBalanceCount}
                        onChange={(e) => setGwForm({ ...gwForm, smsSimBalanceCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TELEGRAM CONFIG */}
              {subGatewayTab === 'TELEGRAM' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      <span>টেলিগ্রাম বট নোটিফিকেশন ইঞ্জিন (Telegram Bot API)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ১০০% আজীবন ফ্রি ও অফিশিয়াল ওপেন এপিআই দিয়ে সদস্যদের কাছে ইনস্ট্যান্ট বার্তা পাঠান
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Telegram Bot Token (@BotFather)</label>
                      <input
                        type="password"
                        value={gwForm.telegramBotToken}
                        onChange={(e) => setGwForm({ ...gwForm, telegramBotToken: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Telegram Channel / Chat ID</label>
                      <input
                        type="text"
                        value={gwForm.telegramChatId}
                        onChange={(e) => setGwForm({ ...gwForm, telegramChatId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MESSENGER & BOTPRESS CONFIG */}
              {subGatewayTab === 'MESSENGER' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <span>ফেসবুক মেসেঞ্জার ও Botpress এআই ইঞ্জিন</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ফেসবুক পেজ ও Botpress ক্লাউডের সাথে SamityPro-এর দ্বিপাক্ষিক এআই চ্যাট সংযোগ
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Botpress AI Webhook URL</label>
                    <input
                      type="text"
                      value={gwForm.botpressWebhookUrl}
                      onChange={(e) => setGwForm({ ...gwForm, botpressWebhookUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Facebook Page ID</label>
                      <input
                        type="text"
                        value={gwForm.facebookPageId}
                        onChange={(e) => setGwForm({ ...gwForm, facebookPageId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Page Access Token</label>
                      <input
                        type="password"
                        value={gwForm.facebookPageToken}
                        onChange={(e) => setGwForm({ ...gwForm, facebookPageToken: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  কনফিগারেশন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: BULK DISPATCHER & TEST CONSOLE */}
      {activeTab === 'DISPATCHER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Bulk Due Reminder Trigger */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">বাল্ক ব্রডকাস্ট</span>
              <h2 className="text-lg font-bold text-white mt-0.5">বকেয়া সদস্যদের এক ক্লিকে তাগাদা পাঠান</h2>
              <p className="text-xs text-slate-400 mt-1">
                বর্তমানে মোট <strong>{unpaidMembersCount} জন</strong> সদস্যের চাঁদা বা কিস্তির টাকা বকেয়া রয়েছে।
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">মেসেজিং চ্যানেল নির্বাচন করুন</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'WHATSAPP', label: 'WhatsApp (Open-WA)', icon: MessageSquare },
                  { id: 'SMS', label: 'SMS (TextBee / SIM)', icon: Smartphone },
                  { id: 'TELEGRAM', label: 'Telegram Bot', icon: Bot },
                  { id: 'MESSENGER', label: 'Facebook Messenger', icon: Globe },
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setBulkChannel(ch.id as any)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      bulkChannel === ch.id
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ch.icon className="w-4 h-4" />
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">প্রেরণীয় বার্তার ফরম্যাট:</div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                {schedulerConfig.messageTemplateBn
                  .replace('{MEMBER_NAME}', 'সদস্যের নাম')
                  .replace('{SAMITY_NAME}', letterhead.samityNameBn)
                  .replace('{MONTH_NAME}', 'অক্টোবর ২০২৬')
                  .replace('{DUE_AMOUNT}', '১,৫০০')
                  .replace('{PORTAL_URL}', 'https://samitypro.vercel.app')}
              </p>
            </div>

            <button
              onClick={handleTriggerBulk}
              disabled={isBulkSending || unpaidMembersCount === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {isBulkSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{unpaidMembersCount} জন সদস্যকে {bulkChannel} তাগাদা পাঠান</span>
            </button>

            {bulkResult && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>সর্বমোট {bulkResult.totalSent} জন সদস্যের কাছে {bulkResult.channel} নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!</span>
              </div>
            )}
          </div>

          {/* Right: Single Member Test Console */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">টেস্ট কনসোল</span>
              <h2 className="text-lg font-bold text-white mt-0.5">একক টেস্ট মেসেজ পাঠান</h2>
              <p className="text-xs text-slate-400 mt-1">
                যেকোনো নির্দিষ্ট সদস্য বা নিজের নম্বরে টেস্ট মেসেজ পাঠিয়ে চ্যানেল ও গেটওয়ে যাচাই করুন।
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">সদস্য নির্বাচন</label>
                <select
                  value={testMemberId}
                  onChange={(e) => setTestMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.memberCode} - {m.nameBn} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">চ্যানেল</label>
                <select
                  value={testChannel}
                  onChange={(e) => setTestChannel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold"
                >
                  <option value="WHATSAPP">WhatsApp (Open-WA & wa.me)</option>
                  <option value="SMS">SMS (TextBee / SIM)</option>
                  <option value="TELEGRAM">Telegram Bot</option>
                  <option value="MESSENGER">Facebook Messenger</option>
                </select>
              </div>

              <button
                onClick={handleSendSingleTest}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>টেস্ট নোটিফিকেশন পাঠান</span>
              </button>

              {testResult && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-semibold">
                    {testResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.externalUrl && (
                    <a
                      href={testResult.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow hover:bg-emerald-500"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>সরাসরি WhatsApp-এ ওপেন করুন</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTO-SCHEDULER ENGINE */}
      {activeTab === 'SCHEDULER' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl max-w-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>স্বয়ংক্রিয় বকেয়া তাগাদা শিডিউলার (Auto-Scheduler)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              প্রতি মাসের নির্দিষ্ট দিনে সফটওয়্যার স্বয়ংক্রিয়ভাবে সকল বকেয়া সদস্যদের নোটিফিকেশন পাঠাবে
            </p>
          </div>

          <form onSubmit={handleSaveScheduler} className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">স্বয়ংক্রিয় তাগাদা সার্ভিস চালু রাখুন</div>
                <div className="text-[11px] text-slate-400">নির্ধারিত তারিখে ব্যাকগ্রাউন্ডে নোটিফিকেশন ট্রিগার হবে</div>
              </div>
              <input
                type="checkbox"
                checked={schedForm.enableAutoDueReminder}
                onChange={(e) => setSchedForm({ ...schedForm, enableAutoDueReminder: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">প্রতি মাসের কোন তারিখে পাঠাবে?</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={schedForm.triggerDayOfMonth}
                  onChange={(e) => setSchedForm({ ...schedForm, triggerDayOfMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">ডিফল্ট চ্যানেল</label>
                <select
                  value={schedForm.defaultChannel}
                  onChange={(e) => setSchedForm({ ...schedForm, defaultChannel: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold"
                >
                  <option value="WHATSAPP">WhatsApp (Open-WA / wa.me)</option>
                  <option value="SMS">SMS (TextBee)</option>
                  <option value="TELEGRAM">Telegram Bot</option>
                  <option value="MESSENGER">Facebook Messenger</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">
                মেসেজের মধ্যবর্তী বিলম্ব (Anti-Ban Delay Seconds)
              </label>
              <input
                type="number"
                min={2}
                max={30}
                value={schedForm.rateLimitDelaySec}
                onChange={(e) => setSchedForm({ ...schedForm, rateLimitDelaySec: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                নম্বর ব্লক হওয়া এড়াতে প্রতি মেসেজের মাঝে ন্যূনতম ৪-৬ সেকেন্ড বিরতি বাঞ্ছনীয়।
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">কাস্টম বাংলা মেসেজ টেমপ্লেট</label>
              <textarea
                rows={4}
                value={schedForm.messageTemplateBn}
                onChange={(e) => setSchedForm({ ...schedForm, messageTemplateBn: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                উপলব্ধ ট্যাগ: {`{MEMBER_NAME}, {SAMITY_NAME}, {MONTH_NAME}, {DUE_AMOUNT}, {PORTAL_URL}`}
              </span>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition cursor-pointer"
            >
              শিডিউলার আপডেট করুন
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: DELIVERY LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">সর্বশেষ প্রেরিত বার্তা ও তাগাদা লগ</h3>
            <span className="text-xs font-mono text-slate-400">মোট: {reminders.length} টি</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">সদস্যের নাম ও কোড</th>
                  <th className="py-3 px-4">চ্যানেল</th>
                  <th className="py-3 px-4">বকেয়া পরিমাণ</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">গেটওয়ে ডেলিভারি নোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reminders.map(rem => (
                  <tr key={rem.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">{rem.memberNameBn}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rem.memberCode} | {rem.phone}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        rem.channel === 'WHATSAPP' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        rem.channel === 'SMS' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        rem.channel === 'TELEGRAM' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {rem.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-white">
                      ৳ {rem.dueAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      {rem.sentDate}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {rem.deliveryNote || 'স্বয়ংক্রিয়ভাবে ডেলিভার্ড'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
