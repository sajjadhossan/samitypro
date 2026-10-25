'use client';

import React, { useState } from 'react';
import { 
  Vote, CheckCircle2, Trophy, Users, Shield, 
  Sparkles, Award, BarChart3 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, toBengaliNumber } from '@/lib/i18n';
import confetti from 'canvas-confetti';

export function ElectionsView() {
  const { store, language, elections, currentUser } = useSamityStore();
  const t = translations[language];

  const currentElection = elections[0];
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);

  if (!currentElection) {
    return <div className="text-center py-12 text-slate-400">কোন সক্রিয় নির্বাচন নেই।</div>;
  }

  const handleVote = (candidateId: string) => {
    if (hasVoted) return;

    store.castVote(currentElection.id, candidateId);
    setVotedCandidateId(candidateId);
    setHasVoted(true);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const presidentCandidates = currentElection.candidates.filter(c => c.post === 'PRESIDENT');
  const secretaryCandidates = currentElection.candidates.filter(c => c.post === 'SECRETARY');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {currentElection.status}
            </span>
            <span className="text-xs text-slate-400 font-mono">মেয়াদ: {currentElection.termYears}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Vote className="w-5 h-5 text-emerald-400" />
            <span>{language === 'bn' ? currentElection.titleBn : currentElection.titleEn}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' 
              ? 'ডিজিটাল গোপন ব্যালটে কার্যনির্বাহী পরিষদ নির্বাচন ও রিয়েলটাইম ফলাফল' 
              : 'Digital secret ballot voting for executive committee with live tally'}
          </p>
        </div>

        {/* Voter turnout badge */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-400">মোট ভোটার</div>
            <div className="text-base font-bold text-slate-100 font-mono">{currentElection.totalEligibleVoters} জন</div>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <div className="text-[11px] text-slate-400">প্রদত্ত ভোট</div>
            <div className="text-base font-bold text-emerald-400 font-mono">{currentElection.totalVotesCast} টি</div>
          </div>
        </div>
      </div>

      {hasVoted && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {language === 'bn' 
              ? 'অভিনন্দন! আপনার মূল্যবান ডিজিটাল গোপন ভোট সফলভাবে ডাটাবেসে নিবন্ধিত হয়েছে।' 
              : 'Congratulations! Your digital secret ballot vote has been recorded securely.'}
          </span>
        </div>
      )}

      {/* President Post Candidates */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'সভাপতি পদপ্রার্থী (President Post)' : 'President Candidates'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">১টি পদ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {presidentCandidates.map(cand => {
            const votePercent = currentElection.totalVotesCast > 0
              ? Math.round((cand.voteCount / currentElection.totalVotesCast) * 100)
              : 0;

            return (
              <div 
                key={cand.id} 
                className={`p-4 rounded-xl border transition ${
                  votedCandidateId === cand.id 
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      {cand.symbolEmoji}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-100">
                        {language === 'bn' ? cand.nameBn : cand.nameEn}
                      </div>
                      <div className="text-xs text-slate-400">
                        প্রতীক: <span className="font-semibold text-emerald-400">{cand.symbolName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-slate-100 font-mono">
                      {language === 'bn' ? toBengaliNumber(cand.voteCount) : cand.voteCount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{votePercent}% ভোট</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${votePercent}%` }}
                  />
                </div>

                <button
                  disabled={hasVoted}
                  onClick={() => handleVote(cand.id)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    hasVoted
                      ? votedCandidateId === cand.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 cursor-pointer'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>
                    {hasVoted 
                      ? (votedCandidateId === cand.id ? 'ভোট প্রদান করা হয়েছে' : 'ভোট সম্পন্ন') 
                      : 'গোপন ব্যালটে ভোট দিন'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Secretary Post Candidates */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>{language === 'bn' ? 'সাধারণ সম্পাদক পদপ্রার্থী (General Secretary)' : 'General Secretary Candidates'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">১টি পদ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {secretaryCandidates.map(cand => {
            const votePercent = currentElection.totalVotesCast > 0
              ? Math.round((cand.voteCount / currentElection.totalVotesCast) * 100)
              : 0;

            return (
              <div 
                key={cand.id} 
                className={`p-4 rounded-xl border transition ${
                  votedCandidateId === cand.id 
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      {cand.symbolEmoji}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-100">
                        {language === 'bn' ? cand.nameBn : cand.nameEn}
                      </div>
                      <div className="text-xs text-slate-400">
                        প্রতীক: <span className="font-semibold text-cyan-400">{cand.symbolName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-slate-100 font-mono">
                      {language === 'bn' ? toBengaliNumber(cand.voteCount) : cand.voteCount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{votePercent}% ভোট</div>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${votePercent}%` }}
                  />
                </div>

                <button
                  disabled={hasVoted}
                  onClick={() => handleVote(cand.id)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    hasVoted
                      ? votedCandidateId === cand.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-500/20 cursor-pointer'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>
                    {hasVoted 
                      ? (votedCandidateId === cand.id ? 'ভোট প্রদান করা হয়েছে' : 'ভোট সম্পন্ন') 
                      : 'গোপন ব্যালটে ভোট দিন'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
