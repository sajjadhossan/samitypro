'use client';

import React, { useState } from 'react';
import { 
  History, Download, Search, ShieldCheck, Filter, 
  User, Calendar, Monitor, Eye, Activity, Database
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { AuditAction, AuditEntity } from '@/types';

export function AuditTrailView() {
  const { auditLogs, exportTableToCsv } = useSamityStore();

  const [actionFilter, setActionFilter] = useState<'ALL' | AuditAction>('ALL');
  const [entityFilter, setEntityFilter] = useState<'ALL' | AuditEntity>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportCsv = () => {
    const csvContent = exportTableToCsv('audit');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `samitypro_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entity === entityFilter;
    const matchesSearch = log.descriptionBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery));
    return matchesAction && matchesEntity && matchesSearch;
  });

  const getActionBadgeColor = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'APPROVE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REJECT':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EXPORT':
      case 'RESTORE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>অডিট ট্রেইল ও নিরাপত্তা লগ (Audit Trail Module 22)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            অডিট ট্রেইল ও সিকিউরিটি লগ
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            সমিতির সকল সংবেদনশীল কর্মকাণ্ড, লেনদেন পরিবর্তন ও অনুমোদনের পূর্ণাঙ্গ অপরিবর্তনীয় হিস্ট্রি রেকর্ড
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>অডিট লগ CSV ডাউনলোড</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">অ্যাকশন:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">সকল অ্যাকশন</option>
              <option value="CREATE">নতুন সংযোজন (CREATE)</option>
              <option value="UPDATE">তথ্য পরিবর্তন (UPDATE)</option>
              <option value="DELETE">মুছে ফেলা (DELETE)</option>
              <option value="APPROVE">অনুমোদন (APPROVE)</option>
              <option value="REJECT">প্রত্যাখ্যান (REJECT)</option>
              <option value="EXPORT">এক্সপোর্ট (EXPORT)</option>
              <option value="RESTORE">রিস্টোর (RESTORE)</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">মডিউল / এনটিটি:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">সকল মডিউল</option>
              <option value="MEMBER">সদস্য (MEMBER)</option>
              <option value="DEPOSIT">ব্যাংক ডিপোজিট (DEPOSIT)</option>
              <option value="LOAN">ঋণ ব্যবস্থাপনা (LOAN)</option>
              <option value="EXPENSE">খরচ ভাউচার (EXPENSE)</option>
              <option value="RECEIPT">রসিদ (RECEIPT)</option>
              <option value="SETTING">সেটিংস (SETTING)</option>
              <option value="DOCUMENT">ডকুমেন্ট (DOCUMENT)</option>
              <option value="BACKUP">ব্যাকআপ (BACKUP)</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="বিবরণ, ব্যবহারকারী বা IP খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">অ্যাকশন ও এনটিটি</th>
                <th className="py-3 px-4">কার্যবিবরণী</th>
                <th className="py-3 px-4">সম্পাদনকারী</th>
                <th className="py-3 px-4">সময় ও তারিখ (ঢাকা)</th>
                <th className="py-3 px-4">IP / ডিভাইস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {log.entity}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">
                      {log.descriptionBn}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      রেফারেন্স আইডি: {log.entityId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-300">{log.performedBy}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pl-5">
                      {log.performedByRole}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-3 h-3 text-slate-600" />
                      <span>{log.ipAddress || '127.0.0.1'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।</p>
          </div>
        )}
      </div>
    </div>
  );
}
