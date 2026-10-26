'use client';

import React, { useState, useRef } from 'react';
import { 
  Database, Download, Upload, FileSpreadsheet, ShieldAlert, 
  CheckCircle, AlertTriangle, RefreshCw, HardDrive, FileText,
  Users, Building2, Receipt, ArrowDownToLine, Check, Clock
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';

export function BackupRestoreView() {
  const { 
    members, bankDeposits, receipts, vouchers, loans, auditLogs,
    exportFullBackup, restoreFullBackup, exportTableToCsv, letterhead
  } = useSamityStore();

  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [stagedJson, setStagedJson] = useState<string>('');
  const [stagedMeta, setStagedMeta] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1-Click JSON Backup Download
  const handleDownloadFullBackup = () => {
    const jsonString = exportFullBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `samitypro_full_backup_${letterhead.tenantId}_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export Helper
  const handleExportCsv = (table: 'members' | 'deposits' | 'receipts' | 'vouchers' | 'audit', filename: string) => {
    const csvContent = exportTableToCsv(table);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Restore file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.members || !parsed.tenantId) {
          alert('অবৈধ ব্যাকআপ ফাইল। সঠিক JSON ফরম্যাটের ব্যাকআপ ফাইল আপলোড করুন।');
          return;
        }
        setStagedJson(text);
        setStagedMeta({
          version: parsed.version || '1.0.0',
          exportedAt: parsed.exportedAt || 'অজানা',
          tenantId: parsed.tenantId,
          memberCount: parsed.members?.length || 0,
          depositCount: parsed.bankDeposits?.length || 0,
          receiptCount: parsed.receipts?.length || 0,
          voucherCount: parsed.vouchers?.length || 0,
        });
        setConfirmRestoreOpen(true);
      } catch (err: any) {
        alert(`ফাইল পার্সিং ব্যর্থ: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Confirm and Execute Restore
  const executeRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      const res = restoreFullBackup(stagedJson);
      setRestoreStatus(res);
      setIsRestoring(false);
      setConfirmRestoreOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>ব্যাকআপ, এক্সপোর্ট ও ইমপোর্ট (Module 28)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            ডাটাবেজ ব্যাকআপ ও রিস্টোর সেন্টার
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            সমিতির সকল তথ্যের পূর্ণাঙ্গ সুরক্ষিত JSON ব্যাকআপ, অফলাইন সংরক্ষণ ও এক্সেল CSV এক্সপোর্ট
          </p>
        </div>

        <button
          onClick={handleDownloadFullBackup}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON)</span>
        </button>
      </div>

      {/* Restore Status Alert */}
      {restoreStatus && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          restoreStatus.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {restoreStatus.success ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span>{restoreStatus.message}</span>
          </div>
          <button 
            onClick={() => setRestoreStatus(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Top Cards: Database Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>নিবন্ধিত সদস্য</span>
          </div>
          <div className="text-xl font-black text-white">{members.length} জন</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>ব্যাংক ডিপোজিট</span>
          </div>
          <div className="text-xl font-black text-white">{bankDeposits.length} টি</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <span>পেইড রসিদ</span>
          </div>
          <div className="text-xl font-black text-white">{receipts.length} টি</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>ভাউচার ও খরচ</span>
          </div>
          <div className="text-xl font-black text-white">{vouchers.length} টি</div>
        </div>
      </div>

      {/* 2 Main Sections: Full Database vs Individual CSVs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full JSON Cloud / Local Database Management */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ ও রিস্টোর</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            আপনার সমিতির সকল তথ্য (সদস্য, কিস্তি, আমানত, ঋণ, ব্যাংক জমা, প্রিন্ট সেটিংস, অডিট লগ ইত্যাদি) একটি একক এনক্রিপ্টেড JSON ফাইলেই সংরক্ষিত হয়। 
          </p>

          <div className="pt-2 space-y-3">
            <button
              onClick={handleDownloadFullBackup}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>১-ক্লিকে ফুল ব্যাকআপ ফাইল ডাউনলোড করুন (.json)</span>
            </button>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="restore-file-upload"
              />
              <label
                htmlFor="restore-file-upload"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>ব্যাকআপ ফাইল থেকে ডাটা রিস্টোর করুন (.json)</span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              সতর্কতা: ব্যাকআপ রিস্টোর করলে বর্তমান স্থানীয় তথ্যের সাথে ব্যাকআপ তথ্যের সম্পূর্ণ প্রতিস্থাপন ঘটবে। রিস্টোরের আগে বর্তমান তথ্যের একটি ব্যাকআপ কপি সংরক্ষণ করে নেওয়া সমীচীন।
            </span>
          </div>
        </div>

        {/* Individual CSV Export Options */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>এক্সেল ও স্প্রেডশীট (CSV) এক্সপোর্ট</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            প্রতিটি মডিউলের ডাটা আলাদাভাবে মাইক্রোসফট এক্সেল বা গুগল শিটসে বিশ্লেষণের জন্য CSV ফরম্যাটে এক্সপোর্ট করুন:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleExportCsv('members', 'samitypro_members')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>সদস্য তালিকা CSV</span>
              </div>
              <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleExportCsv('deposits', 'samitypro_bank_deposits')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>ব্যাংক ডিপোজিট CSV</span>
              </div>
              <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleExportCsv('receipts', 'samitypro_receipts')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <span>পেইড রসিদসমূহ CSV</span>
              </div>
              <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleExportCsv('vouchers', 'samitypro_vouchers')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>ভাউচার ও খরচ CSV</span>
              </div>
              <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>এক্সপোর্ট করা CSV ফাইলসমূহ বাংলা ইউনিকোড (UTF-8) সমর্থন করে।</span>
          </div>
        </div>
      </div>

      {/* CONFIRM RESTORE MODAL */}
      {confirmRestoreOpen && stagedMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 pb-2 border-b border-slate-800">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">ব্যাকআপ রিস্টোর নিশ্চিতকরণ</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি নির্বাচিত ফাইল থেকে ডাটা রিস্টোর করতে যাচ্ছেন। রিস্টোর করার পূর্ববর্তী তথ্যাদি নিম্নরূপ:
            </p>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">টেন্যান্ট আইডি:</span>
                <span className="font-mono text-emerald-400">{stagedMeta.tenantId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">এক্সপোর্টের তারিখ:</span>
                <span className="font-mono text-slate-200">{stagedMeta.exportedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">সদস্য সংখ্যা:</span>
                <span className="font-bold text-white">{stagedMeta.memberCount} জন</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ব্যাংক ডিপোজিট রেকর্ড:</span>
                <span className="font-bold text-white">{stagedMeta.depositCount} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">রসিদ সংখ্যা:</span>
                <span className="font-bold text-white">{stagedMeta.receiptCount} টি</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRestoreOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={executeRestore}
                disabled={isRestoring}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>হ্যাঁ, রিস্টোর নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
