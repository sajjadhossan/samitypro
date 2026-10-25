'use client';

import React from 'react';
import { 
  CalendarCheck, Calendar, Clock, MapPin, 
  FileText, CheckCircle2, Users, Plus 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations } from '@/lib/i18n';

export function MeetingsView() {
  const { language, meetings } = useSamityStore();
  const t = translations[language];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
            <span>{t.meetings}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'বার্ষিক সাধারণ সভা (AGM), পরিচালনা পর্ষদের সভা ও রেজোলিউশন সংরক্ষণ' 
              : 'AGM/EGM meetings, agendas, resolutions, and minutes archive'}
          </p>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map(m => (
          <div key={m.id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  m.type === 'AGM' 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {m.type}
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  {language === 'bn' ? m.titleBn : m.titleEn}
                </h3>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto ${
                m.status === 'COMPLETED' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {m.status === 'COMPLETED' ? 'সম্পন্ন হয়েছে' : 'আসন্ন সভা'}
              </span>
            </div>

            {/* Meta tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{m.date} ({m.time})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">{m.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>উপস্থিতি: {m.totalAttendees} জন সদস্য</span>
              </div>
            </div>

            {/* Agenda Items */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                আলোচ্য সূচি (Agendas)
              </div>
              <ul className="space-y-1 text-xs text-slate-400">
                {m.agenda.map((ag, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{ag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Approved Resolutions */}
            {m.resolutions && m.resolutions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>গৃহীত রেজোলিউশন ও সিদ্ধান্তসমূহ (Approved Resolutions)</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {m.resolutions.map((res, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
