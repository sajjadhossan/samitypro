'use client';

import React, { useState } from 'react';
import { 
  Building2, Users, Bell, Globe, Smartphone, ShieldCheck, 
  ChevronDown, Check, Zap, RefreshCw, LogOut, ArrowRightLeft, Radio,
  MoreVertical
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, toBengaliNumber } from '@/lib/i18n';
import { UserRole, APP_VERSION } from '@/types';
import { UpdateCheckModal } from '@/components/common/UpdateCheckModal';

interface HeaderProps {
  onOpenApkModal: () => void;
  onOpenMenu?: () => void;
}

export function Header({ onOpenApkModal, onOpenMenu }: HeaderProps) {
  const { 
    tenants, activeTenant, currentUser, language, setLanguage, 
    setCurrentTenant, setCurrentUser, events, offlineQueue, syncOfflineQueue 
  } = useSamityStore();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const t = translations[language];

  const roleOptions: { role: UserRole; labelBn: string; labelEn: string; icon: any }[] = [
    { role: 'SUPER_ADMIN', labelBn: 'সুপার অ্যাডমিন (মালিক)', labelEn: 'Super Admin (Owner)', icon: ShieldCheck },
    { role: 'SAMITY_ADMIN', labelBn: 'সমিতি অ্যাডমিন (সভাপতি)', labelEn: 'Samity Admin (President)', icon: Building2 },
    { role: 'MANAGER', labelBn: 'ম্যানেজার / কোষাধ্যক্ষ', labelEn: 'Manager / Treasurer', icon: Users },
    { role: 'FIELD_COLLECTOR', labelBn: 'মাঠ কর্মী (কালেক্টর)', labelEn: 'Field Collector', icon: RefreshCw },
    { role: 'MEMBER', labelBn: 'সাধারণ সদস্য (কবির আহমেদ)', labelEn: 'Member (Kabir Ahmed)', icon: Users },
  ];

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'SUPER_ADMIN') {
      setCurrentUser('user-superadmin');
    } else if (role === 'SAMITY_ADMIN') {
      setCurrentUser('user-rafiq');
    } else if (role === 'MANAGER') {
      setCurrentUser('user-tareq');
    } else if (role === 'FIELD_COLLECTOR') {
      setCurrentUser('user-sumon');
    } else if (role === 'MEMBER') {
      setCurrentUser('user-kabir');
    }
    setShowRoleDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Building2 className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                {language === 'bn' ? 'সমিতিপ্রো' : 'SamityPro'}
              </span>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition cursor-pointer flex items-center gap-1 active:scale-95"
                title={language === 'bn' ? 'সফটওয়্যার আপডেট চেক করুন' : 'Check for software updates'}
              >
                <span>{APP_VERSION}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xs">
              {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
            </p>
          </div>
        </div>

        {/* Center: Live Real-time Indicator & Tenant Switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live Sync Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{language === 'bn' ? 'লাইভ সিঙ্ক সংযুক্ত' : 'Live Sync Online'}</span>
          </div>

          {/* Tenant Switcher (Multi-Tenant Selector) */}
          {currentUser.role !== 'MEMBER' && (
            <div className="relative">
              <button
                onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/80 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium max-w-[150px] truncate">
                  {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showTenantDropdown && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
                    {t.selectSamity}
                  </div>
                  {tenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        setCurrentTenant(tenant.id);
                        setShowTenantDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        tenant.id === activeTenant?.id
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="truncate">{language === 'bn' ? tenant.nameBn : tenant.nameEn}</div>
                        <div className="text-[10px] text-slate-500">{tenant.type} • {tenant.plan}</div>
                      </div>
                      {tenant.id === activeTenant?.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Role Switcher, Language Toggle, APK Download & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Offline Sync Status Badge (Rule 3) */}
          {offlineQueue.length > 0 ? (
            <button
              onClick={() => syncOfflineQueue()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-semibold animate-pulse transition cursor-pointer"
              title="Click to sync offline changes to cloud"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>পেন্ডিং সিঙ্ক ({offlineQueue.length})</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ক্লাউড সিঙ্কড</span>
            </div>
          )}

          {/* Mobile APK Action Button (Responsive) */}
          <button
            onClick={onOpenApkModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
            title="Download Android APK"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'bn' ? 'অ্যান্ড্রয়েড APK' : 'Android APK'}
            </span>
          </button>

          {/* Role Switcher (For Demo & Architecture Walkthrough) */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">
                {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                 currentUser.role === 'SAMITY_ADMIN' ? 'President' :
                 currentUser.role === 'MANAGER' ? 'Manager' :
                 currentUser.role === 'FIELD_COLLECTOR' ? 'Collector' : 'Member'}
              </span>
              <ChevronDown className="w-3 h-3 text-indigo-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
                  {t.switchRole}
                </div>
                {roleOptions.map(opt => (
                  <button
                    key={opt.role}
                    onClick={() => handleRoleSelect(opt.role)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      currentUser.role === opt.role 
                        ? 'bg-indigo-500/20 text-indigo-300 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{language === 'bn' ? opt.labelBn : opt.labelEn}</span>
                    {currentUser.role === opt.role && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Toggle (Bangla / English) */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* 3-Dot All Modules & Boards Menu Button */}
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition active:scale-95 cursor-pointer shadow-sm shadow-amber-500/10 shrink-0 touch-manipulation pointer-events-auto"
            title="সকল মডিউল ও বোর্ড মেনু (৩-ডট)"
            aria-label="Open 3-dot menu"
          >
            <MoreVertical className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline text-xs font-bold text-amber-300">মেনু</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 transition cursor-pointer touch-manipulation"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {events.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
                  onClick={() => setShowNotifDropdown(false)}
                />
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'bn' ? 'রিয়েল-টাইম লাইভ নোটিফিকেশন' : 'Live Real-time Notifications'}</span>
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {language === 'bn' ? toBengaliNumber(events.length) : events.length} updates
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto mt-2">
                    {events.slice(0, 8).map(evt => (
                      <div key={evt.id} className="py-2.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                          <span className="font-semibold text-emerald-400">
                            {language === 'bn' ? evt.titleBn : evt.titleEn}
                          </span>
                          <span className="text-[10px] text-slate-500">{evt.timestamp.split(' ')[1] || ''}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {language === 'bn' ? evt.messageBn : evt.messageEn}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800 text-center">
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs text-slate-400 hover:text-white font-medium"
                    >
                      বন্ধ করুন (Close)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Current User Avatar & Profile Modal Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 pl-1 border-l border-slate-800 cursor-pointer active:scale-95 transition touch-manipulation group"
              title="ব্যবহারকারী প্রোফাইল ও ভূমিকা (Profile)"
              aria-label="User profile"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner group-hover:ring-2 ring-emerald-400/50 transition">
                {currentUser.nameEn.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {language === 'bn' ? currentUser.nameBn : currentUser.nameEn}
                </div>
                <div className="text-[10px] text-emerald-400 uppercase font-mono">
                  {currentUser.role}
                </div>
              </div>
            </button>

            {/* User Profile & Role Switch Modal (Universal for mobile & desktop) */}
            {showRoleDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
                  onClick={() => setShowRoleDropdown(false)}
                />
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                      {currentUser.nameEn.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">
                        {language === 'bn' ? currentUser.nameBn : currentUser.nameEn}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {currentUser.role === 'SUPER_ADMIN' ? 'সুপার অ্যাডমিন' : 
                         currentUser.role === 'SAMITY_ADMIN' ? 'সভাপতি / অ্যাডমিন' :
                         currentUser.role === 'MANAGER' ? 'ম্যানেজার' :
                         currentUser.role === 'FIELD_COLLECTOR' ? 'কালেক্টর' : 'সাধারণ সদস্য'}
                      </span>
                    </div>
                  </div>

                  {/* Samity Context */}
                  <div className="py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 my-3 text-xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">সংযুক্ত সমিতি</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
                    </div>
                  </div>

                  {/* Switch Role Section */}
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t.switchRole}
                  </div>
                  <div className="space-y-1">
                    {roleOptions.map(opt => (
                      <button
                        key={opt.role}
                        onClick={() => handleRoleSelect(opt.role)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                          currentUser.role === opt.role 
                            ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30' 
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{language === 'bn' ? opt.labelBn : opt.labelEn}</span>
                        {currentUser.role === opt.role && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>

                  {/* App Version Info */}
                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{language === 'bn' ? 'অ্যাপ সংস্করণ' : 'App Version'}</span>
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setIsUpdateModalOpen(true);
                      }}
                      className="font-mono text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      title={language === 'bn' ? 'আপডেট চেক করুন' : 'Check for updates'}
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>{APP_VERSION}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      <UpdateCheckModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        isManualCheck={true}
      />
    </header>
  );
}
