'use client';

import React, { useState, useMemo } from 'react';
import { 
  Vote, CheckCircle2, Trophy, Users, Shield, 
  Sparkles, Award, BarChart3, Plus, Printer, 
  Check, X, AlertTriangle, Calendar, Clock, 
  MapPin, UserCheck, UserX, FileText, CheckCircle, 
  Search, Filter, ChevronRight, Edit3, Trash2, 
  Share2, ShieldCheck, Lock, ExternalLink
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { translations, toBengaliNumber } from '@/lib/i18n';
import { 
  Election, ElectionCandidate, ElectionPost, 
  ElectionPostConfig, ElectionStatus, CandidateStatus 
} from '@/types';
import confetti from 'canvas-confetti';

export function ElectionsView() {
  const { 
    language, elections, activeTenant, letterhead, 
    currentUser, members, createElection, updateElection, 
    addCandidate, updateCandidateStatus, castVote, 
    castMultiPostBallot, toggleVoterEligibility, 
    publishElectionResults, softDeleteElection 
  } = useSamityStore();

  const t = translations[language];

  // Active Tab: schedule | ballot | candidates | voters | results
  const [activeTab, setActiveTab] = useState<'schedule' | 'ballot' | 'candidates' | 'voters' | 'results'>('ballot');

  // Selected Election
  const [selectedElectionId, setSelectedElectionId] = useState<string>(elections[0]?.id || '');
  const currentElection = useMemo(() => {
    return elections.find(e => e.id === selectedElectionId) || elections[0];
  }, [elections, selectedElectionId]);

  // Secret Ballot Selections: { [post: string]: candidateId }
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [ballotSuccessReceipt, setBallotSuccessReceipt] = useState<{
    receiptId: string;
    timestamp: string;
    voterCode: string;
    votedPostsCount: number;
  } | null>(null);

  // New Election Modal State
  const [isNewElectionModalOpen, setIsNewElectionModalOpen] = useState(false);
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTermYears, setNewTermYears] = useState('২০২৬-২০২৮');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVenue, setNewVenue] = useState(activeTenant.address || 'সমিতি প্রধান কার্যালয় অডিটোরিয়াম');
  const [newChiefCommissioner, setNewChiefCommissioner] = useState('অ্যাডভোকেট এনামুল হক (প্রধান নির্বাচন কমিশনার)');

  // New Candidate Modal State
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [candMemberId, setCandMemberId] = useState('');
  const [candPost, setCandPost] = useState<ElectionPost>('PRESIDENT');
  const [candSymbolName, setCandSymbolName] = useState('দোয়াত-কলম');
  const [candSymbolEmoji, setCandSymbolEmoji] = useState('✒️');
  const [candManifesto, setCandManifesto] = useState('');
  const [candProposer, setCandProposer] = useState('');
  const [candSeconder, setCandSeconder] = useState('');

  // Voter List Search & Filter
  const [voterSearch, setVoterSearch] = useState('');
  const [voterEligibilityFilter, setVoterEligibilityFilter] = useState<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL');

  // Certification Modal State
  const [isCertifyModalOpen, setIsCertifyModalOpen] = useState(false);
  const [certifiedByName, setCertifiedByName] = useState('অ্যাডভোকেট এনামুল হক (প্রধান নির্বাচন কমিশনার)');

  // Voter profile for currently logged in user
  const currentMember = useMemo(() => {
    return members.find(m => m.id === currentUser.id || m.phone === currentUser.phone) || members[0];
  }, [members, currentUser]);

  const currentVoterInfo = useMemo(() => {
    if (!currentElection || !currentElection.voters) return null;
    return currentElection.voters.find(v => v.memberId === currentMember?.id || v.memberCode === currentMember?.memberCode);
  }, [currentElection, currentMember]);

  const hasCurrentUserVoted = useMemo(() => {
    return currentVoterInfo?.hasVoted || false;
  }, [currentVoterInfo]);

  // Turnout Percentage
  const turnoutPercent = useMemo(() => {
    if (!currentElection || !currentElection.totalEligibleVoters) return 0;
    return Math.round((currentElection.totalVotesCast / currentElection.totalEligibleVoters) * 100);
  }, [currentElection]);

  // Unique Posts in current election
  const postsList: ElectionPostConfig[] = useMemo(() => {
    if (currentElection?.posts && currentElection.posts.length > 0) {
      return currentElection.posts;
    }
    return [
      { id: 'p1', post: 'PRESIDENT', titleBn: 'সভাপতি', titleEn: 'President', seatsCount: 1 },
      { id: 'p2', post: 'SECRETARY', titleBn: 'সাধারণ সম্পাদক', titleEn: 'General Secretary', seatsCount: 1 },
      { id: 'p3', post: 'TREASURER', titleBn: 'কোষাধ্যক্ষ', titleEn: 'Treasurer', seatsCount: 1 },
      { id: 'p4', post: 'EXECUTIVE_MEMBER', titleBn: 'কার্যনির্বাহী সদস্য', titleEn: 'Executive Member', seatsCount: 3 }
    ];
  }, [currentElection]);

  // Ballot Selection Handler
  const handleSelectCandidate = (post: ElectionPost, candidateId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [post]: candidateId
    }));
  };

  // Submit Secret Ballot
  const handleBallotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentElection) return;

    if (hasCurrentUserVoted) {
      alert(language === 'bn' ? 'আপনি ইতিপূর্বে আপনার ভোট প্রদান করেছেন!' : 'You have already voted!');
      return;
    }

    const voteEntries = Object.entries(selectedVotes).map(([post, candidateId]) => ({
      post: post as ElectionPost,
      candidateId
    }));

    if (voteEntries.length === 0) {
      alert(language === 'bn' ? 'অনুগ্রহ করে অন্তত একটি পদে আপনার পছন্দের প্রার্থীকে ভোট দিন।' : 'Please select at least one candidate.');
      return;
    }

    const success = castMultiPostBallot(
      currentElection.id, 
      currentMember?.id || currentUser.id, 
      voteEntries
    );

    if (success) {
      setBallotSuccessReceipt({
        receiptId: `VOTE-REC-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleString('bn-BD'),
        voterCode: currentMember?.memberCode || 'MEM-001',
        votedPostsCount: voteEntries.length
      });

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  // Create Election Form Submit
  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleBn.trim()) return;

    createElection({
      tenantId: activeTenant.id,
      titleBn: newTitleBn.trim(),
      titleEn: newTitleEn.trim() || newTitleBn.trim(),
      termYears: newTermYears.trim(),
      electionDate: newDate,
      venue: newVenue,
      commission: {
        chiefCommissionerNameBn: newChiefCommissioner,
        officeAddressBn: newVenue
      }
    });

    setIsNewElectionModalOpen(false);
    alert(language === 'bn' ? 'নতুন নির্বাচনী তফসিল সফলভাবে ঘোষিত হয়েছে!' : 'Election announced successfully!');
  };

  // Add Candidate Form Submit
  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentElection || !candMemberId) return;

    const member = members.find(m => m.id === candMemberId);
    if (!member) return;

    addCandidate(currentElection.id, {
      memberId: member.id,
      memberCode: member.memberCode,
      nameBn: member.nameBn,
      nameEn: member.nameEn,
      post: candPost,
      symbolName: candSymbolName,
      symbolEmoji: candSymbolEmoji,
      manifestoBn: candManifesto,
      proposerNameBn: candProposer,
      seconderNameBn: candSeconder,
      status: 'VALID'
    });

    setIsCandidateModalOpen(false);
    setCandManifesto('');
    setCandProposer('');
    setCandSeconder('');
    alert(language === 'bn' ? 'প্রার্থী সফলভাবে অন্তর্ভুক্ত হয়েছে!' : 'Candidate added successfully!');
  };

  // Certify & Publish Results
  const handleCertifyResultsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentElection) return;

    publishElectionResults(currentElection.id, certifiedByName);
    setIsCertifyModalOpen(false);
    alert(language === 'bn' ? 'নির্বাচনী ফলাফল চূড়ান্তভাবে গেজেট ও প্রকাশ করা হয়েছে!' : 'Results published and gazetted!');
  };

  if (!currentElection) {
    return (
      <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center space-y-4">
        <Vote className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">কোনো সক্রিয় নির্বাচন পাওয়া যায়নি</h3>
        <p className="text-xs text-slate-400">নতুন কার্যনির্বাহী পরিষদ নির্বাচনের তফসিল ঘোষণা করতে বোতামটি চাপুন।</p>
        <button
          onClick={() => setIsNewElectionModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
        >
          + নতুন নির্বাচনী তফসিল ঘোষণা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {currentElection.status}
            </span>
            <span className="text-xs text-indigo-400 font-mono font-bold">
              মেয়াদ: {currentElection.termYears}
            </span>
            {currentElection.electionNo && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {currentElection.electionNo}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Vote className="w-6 h-6 text-emerald-400" />
            <span>{language === 'bn' ? currentElection.titleBn : currentElection.titleEn}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn' 
              ? 'ডিজিটাল গোপন ব্যালট পেপার, প্রার্থী ব্যবস্থাপনা, ভোটার খসড়া ও লাইভ গেজেট ফলাফল' 
              : 'Digital secret ballot election, candidates manager, voter roll & certified live tally'}
          </p>
        </div>

        {/* Top Controls: Switch Election & New Announcement */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {elections.length > 1 && (
            <select
              value={selectedElectionId}
              onChange={e => setSelectedElectionId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              {elections.map(el => (
                <option key={el.id} value={el.id}>{el.titleBn}</option>
              ))}
            </select>
          )}

          {currentUser.role !== 'MEMBER' && (
            <button
              onClick={() => setIsNewElectionModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন তফসিল' : 'New Election'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Turnout & Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'মোট ভোটার' : 'Eligible Voters'}</div>
            <div className="text-lg sm:text-xl font-black text-slate-100 font-mono">{currentElection.totalEligibleVoters} জন</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'কাস্টেড ভোট' : 'Votes Cast'}</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">{currentElection.totalVotesCast} টি</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'ভোটদানের হার' : 'Turnout Rate'}</div>
            <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">{turnoutPercent}%</div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{language === 'bn' ? 'প্রতিদ্বন্দ্বী প্রার্থী' : 'Candidates'}</div>
            <div className="text-lg sm:text-xl font-black text-purple-400 font-mono">{currentElection.candidates?.length || 0} জন</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('ballot')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'ballot'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Vote className="w-4 h-4 text-emerald-300" />
          <span>{language === 'bn' ? '১. ডিজিটাল গোপন ব্যালট পেপার' : '1. Secret Ballot'}</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'bn' ? '২. তফসিল ও নির্বাচন কমিশন' : '2. Election Schedule'}</span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'candidates'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>{language === 'bn' ? '৩. পদ ও প্রার্থী ব্যবস্থাপনা' : '3. Candidates'}</span>
        </button>

        <button
          onClick={() => setActiveTab('voters')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'voters'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <span>{language === 'bn' ? '৪. ভোটার তালিকা ও যোগ্যতা' : '4. Voter Roll'}</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'results'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>{language === 'bn' ? '৫. লাইভ ফলাফল ও সনদ প্রিন্ট' : '5. Live Results'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ডিজিটাল গোপন ব্যালট পেপার (SECRET BALLOT) */}
      {/* ========================================================================= */}
      {activeTab === 'ballot' && (
        <div className="space-y-6">
          
          {/* Voter Verification Banner */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">
                  {language === 'bn' ? 'ভোটার পরিচিতি ও এনক্রিপশন স্ট্যাটাস' : 'Voter Identity & Encryption Status'}
                </div>
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                  <span>{currentMember?.nameBn || currentUser.nameBn}</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    ভোটার আইডি: {currentMember?.memberCode || 'MEM-001'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {hasCurrentUserVoted ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ভোট সম্পন্ন হয়েছে</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>গোপন ব্যালট সক্রিয়</span>
                </span>
              )}
            </div>
          </div>

          {/* If already voted or just voted, show celebratory certificate */}
          {(hasCurrentUserVoted || ballotSuccessReceipt) && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 shadow-xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-emerald-400">
                  {language === 'bn' ? 'আলহামদুলিল্লাহ! আপনার ডিজিটাল গোপন ভোট সফলভাবে সম্পন্ন হয়েছে' : 'Vote Successfully Cast!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  আপনার মূল্যবান ভোটটি এন্ড-টু-এন্ড ক্রিপ্টোগ্রাফিক হ্যাশ দ্বারা সম্পূর্ণ গোপনীয়ভাবে সংরক্ষিত হয়েছে। কেউ আপনার ভোট পছন্দের ব্যক্তি দেখতে পারবে না।
                </p>
              </div>

              {ballotSuccessReceipt && (
                <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-left font-mono space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>রসিদ নম্বর:</span>
                    <span className="font-bold text-slate-200">{ballotSuccessReceipt.receiptId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ভোটদানের সময়:</span>
                    <span className="text-slate-200">{ballotSuccessReceipt.timestamp}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ভোটার কোড:</span>
                    <span className="text-emerald-400">{ballotSuccessReceipt.voterCode}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>প্রদত্ত পদসমূহ:</span>
                    <span className="text-slate-200">{ballotSuccessReceipt.votedPostsCount} টি পদে ভোট কাস্ট</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                    SHA-256 এনক্রিপ্টেড ডিজিটাল ব্যালট ভেরিফিকেশন কোড
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('results')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  লাইভ নির্বাচনী ফলাফল অবলোকন করুন ➔
                </button>
              </div>
            </div>
          )}

          {/* Voting Ballot Form (Only visible if not yet voted) */}
          {!hasCurrentUserVoted && (
            <form onSubmit={handleBallotSubmit} className="space-y-6">
              {postsList.map(postConfig => {
                const candidatesForPost = currentElection.candidates.filter(
                  c => c.post === postConfig.post && c.status === 'VALID'
                );

                return (
                  <div key={postConfig.id} className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-400" />
                          <span>{postConfig.titleBn} পদপ্রার্থী তালিকা</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {language === 'bn' ? `এই পদে ১ জনকে নির্বাচন করতে বৃত্তটি পূরণ করুন` : `Select 1 candidate for this post`}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                        আসন: {postConfig.seatsCount} টি
                      </span>
                    </div>

                    {candidatesForPost.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        এই পদে কোনো প্রতিদ্বন্দ্বী প্রার্থী নেই (বিনা প্রতিদ্বন্দ্বিতায় নির্বাচিত বা শূন্য)।
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {candidatesForPost.map(candidate => {
                          const isSelected = selectedVotes[postConfig.post] === candidate.id;

                          return (
                            <div
                              key={candidate.id}
                              onClick={() => handleSelectCandidate(postConfig.post, candidate.id)}
                              className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                                isSelected 
                                  ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30' 
                                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3.5">
                                  {/* Symbol Avatar */}
                                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-2xl">{candidate.symbolEmoji || '🗳️'}</span>
                                    <span className="text-[10px] font-bold text-amber-300 mt-0.5 truncate max-w-[50px]">
                                      {candidate.symbolName}
                                    </span>
                                  </div>

                                  <div>
                                    <h4 className="text-sm sm:text-base font-bold text-slate-100">
                                      {candidate.nameBn}
                                    </h4>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      {candidate.memberCode}
                                    </div>
                                    <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                                      <span>মার্কা:</span>
                                      <strong className="text-slate-200">{candidate.symbolName} ({candidate.symbolEmoji})</strong>
                                    </div>
                                  </div>
                                </div>

                                {/* Custom Radio Circle */}
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition ${
                                  isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-600 bg-slate-800'
                                }`}>
                                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                              </div>

                              {candidate.manifestoBn && (
                                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                                  &ldquo;{candidate.manifestoBn}&rdquo;
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit Button Bar */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>
                    আপনি মোট <strong>{Object.keys(selectedVotes).length}</strong> টি পদে প্রার্থী নির্বাচন করেছেন।
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={Object.keys(selectedVotes).length === 0}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-bold shadow-xl shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Vote className="w-4 h-4" />
                  <span>গোপন ব্যালটে ভোট নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: তফসিল ও নির্বাচন কমিশন (SCHEDULE & COMMISSION) */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          
          {/* Election Commission Details */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>{language === 'bn' ? 'নির্বাচন কমিশন ও রিটার্নিং অফিসার প্যানেল' : 'Election Commission Panel'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">প্রধান নির্বাচন কমিশনার</span>
                <div className="text-sm font-bold text-slate-100">
                  {currentElection.commission?.chiefCommissionerNameBn || 'অ্যাডভোকেট এনামুল হক'}
                </div>
                <div className="text-xs text-slate-400">
                  {currentElection.commission?.chiefCommissionerTitleBn || 'বাংলাদেশ সুপ্রিম কোর্ট'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">নির্বাচন কমিশনার (১)</span>
                <div className="text-sm font-bold text-slate-100">
                  {currentElection.commission?.commissioner2NameBn || 'প্রফেসর গোলাম কিবরিয়া'}
                </div>
                <div className="text-xs text-slate-400">সাবেক অধ্যক্ষ ও শিক্ষাবিদ</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">নির্বাচন কমিশনার (২)</span>
                <div className="text-sm font-bold text-slate-100">
                  {currentElection.commission?.commissioner3NameBn || 'জনাব হাবিবুর রহমান'}
                </div>
                <div className="text-xs text-slate-400">সদস্য সচিব ও রিটার্নিং অফিসার</div>
              </div>
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>{language === 'bn' ? 'নির্বাচনী তফসিল ও গুরুত্বপূর্ণ সময়সূচি' : 'Election Timeline'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>ভোটগ্রহণের তারিখ: <strong>{currentElection.electionDate}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>ভোটের সময়: <strong>{currentElection.votingStartTime || 'সকাল ০৯:০০'} হতে {currentElection.votingEndTime || 'বিকাল ০৪:০০'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>ভোটকেন্দ্র ও স্থান: <strong>{currentElection.venue || 'বনশ্রী কমিউনিটি সেন্টার অডিটোরিয়াম'}</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200">নির্বাচনী আচরণবিধি সংক্ষেপ:</div>
                <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                  <li>সমিতির নিয়মিত চাঁদা পরিশোধকারী সক্রিয় সদস্যরাই কেবল ভোট প্রদান করতে পারবেন।</li>
                  <li>কোনো অবস্থাতেই ডিজিটাল গোপন ব্যালটের ভেতরে স্ক্রিনশট বা প্রচার নিষিদ্ধ।</li>
                  <li>ভোটগ্রহণ শেষ হওয়ার ১ ঘণ্টার মধ্যে আনুষ্ঠানিকভাবে ভোট গণনা ও লাইভ গেজেট প্রকাশিত হবে।</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: পদ ও প্রার্থী ব্যবস্থাপনা (POSTS & CANDIDATES) */}
      {/* ========================================================================= */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{language === 'bn' ? 'নির্বাচনী পদ ও প্রার্থী তালিকা ব্যবস্থাপনা' : 'Candidates Management'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'নতুন প্রার্থী মনোনয়ন, প্রতীক বরাদ্দ ও প্রার্থিতা যাচাই-বাছাই' 
                  : 'Candidate nomination, election symbols and scrutiny management'}
              </p>
            </div>

            {currentUser.role !== 'MEMBER' && (
              <button
                onClick={() => setIsCandidateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন প্রার্থী অন্তর্ভুক্ত করুন' : 'Add Candidate'}</span>
              </button>
            )}
          </div>

          {/* Candidates by Post */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentElection.candidates.map(candidate => (
              <div key={candidate.id} className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-xl">
                      <span>{candidate.symbolEmoji}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{candidate.nameBn}</h4>
                      <div className="text-[11px] text-slate-400 font-mono">{candidate.memberCode}</div>
                      <span className="text-xs text-amber-400 font-semibold">{candidate.post}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    candidate.status === 'VALID' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : candidate.status === 'ELECTED' 
                      ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40' 
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {candidate.status === 'VALID' ? 'বৈধ প্রার্থী' : candidate.status === 'ELECTED' ? '🏆 নির্বাচিত' : candidate.status}
                  </span>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">বরাদ্দকৃত প্রতীক:</span>
                    <strong className="text-slate-100">{candidate.symbolName} ({candidate.symbolEmoji})</strong>
                  </div>
                  {candidate.proposerNameBn && (
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>প্রস্তাবক: {candidate.proposerNameBn}</span>
                      {candidate.seconderNameBn && <span>সমর্থক: {candidate.seconderNameBn}</span>}
                    </div>
                  )}
                  {candidate.manifestoBn && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                      &ldquo;{candidate.manifestoBn}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">প্রাপ্ত ভোট:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{candidate.voteCount} টি</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ভোটার তালিকা ও যোগ্যতা (VOTER ROLL) */}
      {/* ========================================================================= */}
      {activeTab === 'voters' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <span>{language === 'bn' ? 'সমিতির ডিজিটাল ভোটার খসড়া তালিকা' : 'Voter Roll & Eligibility Sheet'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'সদস্যদের ভোটার নম্বর, চাঁদা পরিশোধ স্ট্যাটাস ও ভোটদানের রেকর্ড' 
                  : 'Eligible voters list, subscription dues validation and ballot status'}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'ভোটার তালিকা প্রিন্ট' : 'Print Voter List'}</span>
            </button>
          </div>

          {/* Voter Search Bar */}
          <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'সদস্যের নাম, কোড বা মোবাইল নম্বর দিয়ে খুঁজুন...' : 'Search voters...'}
              value={voterSearch}
              onChange={e => setVoterSearch(e.target.value)}
              className="w-full bg-transparent text-slate-100 text-xs sm:text-sm focus:outline-none"
            />
          </div>

          {/* Voter Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">ভোটার কোড</th>
                    <th className="p-3">সদস্যের নাম</th>
                    <th className="p-3">মোবাইল নম্বর</th>
                    <th className="p-3 text-center">যোগ্যতা স্ট্যাটাস</th>
                    <th className="p-3 text-center">ভোট দিয়েছেন কি না</th>
                    {currentUser.role !== 'MEMBER' && (
                      <th className="p-3 text-right">পদক্ষেপ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {currentElection.voters && currentElection.voters.length > 0 ? (
                    currentElection.voters
                      .filter(v => {
                        if (!voterSearch.trim()) return true;
                        const q = voterSearch.toLowerCase();
                        return v.nameBn.toLowerCase().includes(q) || v.memberCode.toLowerCase().includes(q) || v.phone.includes(q);
                      })
                      .map(voter => (
                        <tr key={voter.memberId} className="hover:bg-slate-900/50 transition">
                          <td className="p-3 font-mono font-bold text-slate-100">{voter.memberCode}</td>
                          <td className="p-3 font-semibold text-slate-200">{voter.nameBn}</td>
                          <td className="p-3 font-mono text-slate-400">{voter.phone}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              voter.isEligible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {voter.isEligible ? 'যোগ্য ভোটার' : voter.ineligibilityReason || 'অযোগ্য'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              voter.hasVoted ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {voter.hasVoted ? '✓ ভোট দিয়েছেন' : 'ভোট দেননি'}
                            </span>
                          </td>
                          {currentUser.role !== 'MEMBER' && (
                            <td className="p-3 text-right">
                              <button
                                onClick={() => toggleVoterEligibility(currentElection.id, voter.memberId, !voter.isEligible)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition cursor-pointer"
                              >
                                {voter.isEligible ? 'অযোগ্য করুন' : 'যোগ্য করুন'}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        কোনো ভোটার রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: লাইভ ফলাফল ও সনদপত্র প্রিন্ট (LIVE RESULTS & GAZETTE CERTIFICATE) */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          
          {/* Top Actions Bar */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{language === 'bn' ? 'নির্বাচনী ফলাফল ও গেজেট প্রকাশনা' : 'Certified Results & Gazette'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'লাইভ ভোট গণনার অগ্রগতি এবং প্রধান নির্বাচন কমিশনারের সিল সম্বলিত গেজেট সনদ' 
                  : 'Live tally progress bars and official gazette certificate ready for print'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>গেজেট সনদ প্রিন্ট / PDF</span>
              </button>

              {currentUser.role !== 'MEMBER' && currentElection.status !== 'COMPLETED' && (
                <button
                  onClick={() => setIsCertifyModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>গেজেট প্রকাশ করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Progress Bar Section by Post (Screen Only) */}
          <div className="space-y-4 print:hidden">
            {postsList.map(postConfig => {
              const postCands = currentElection.candidates.filter(
                c => c.post === postConfig.post && c.status !== 'WITHDRAWN' && c.status !== 'REJECTED'
              );
              const totalPostVotes = postCands.reduce((sum, c) => sum + c.voteCount, 0);

              return (
                <div key={postConfig.id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span>{postConfig.titleBn} পদ — ফলাফল খতিয়ান</span>
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      গৃহীত ভোট: <strong>{totalPostVotes}</strong> টি
                    </span>
                  </div>

                  <div className="space-y-3">
                    {postCands.map((cand, idx) => {
                      const percent = totalPostVotes > 0 ? Math.round((cand.voteCount / totalPostVotes) * 100) : 0;
                      const isWinner = idx === 0 && cand.voteCount > 0;

                      return (
                        <div key={cand.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {isWinner && <Trophy className="w-4 h-4 text-amber-400" />}
                              <span className="font-bold text-slate-200">{cand.nameBn}</span>
                              <span className="text-slate-400">({cand.symbolName} {cand.symbolEmoji})</span>
                            </div>
                            <div className="font-mono font-bold text-emerald-400">
                              {cand.voteCount} ভোট ({percent}%)
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isWinner 
                                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500' 
                                  : 'bg-indigo-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Printable Gazette Certificate (A4 Standard Format) */}
          <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none print:text-black">
            
            {/* Header Letterhead */}
            <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
              <div className="text-xs uppercase font-bold tracking-widest text-slate-600">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {letterhead.samityNameBn || activeTenant.nameBn}
              </h1>
              <div className="text-sm font-bold text-slate-700">
                নির্বাচন কমিশন সচিবালয় • {currentElection.termYears} কার্যনির্বাহী পরিষদ
              </div>
              <div className="text-xs text-slate-600">
                সরকারি রেজি নং: {letterhead.govtRegNo || activeTenant.registrationNo} | স্থাপিত: {activeTenant.establishedYear} | {letterhead.addressBn || activeTenant.address}
              </div>
            </div>

            {/* Gazette Banner */}
            <div className="text-center py-2.5 bg-slate-100 rounded border border-slate-300">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-700">
                সরকারি নির্বাচনী ফলাফল ও চূড়ান্ত গেজেট বিজ্ঞপ্তি
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                {currentElection.titleBn}
              </h2>
              <div className="text-xs text-slate-600 font-mono mt-0.5">
                স্মারক নং: {currentElection.electionNo || 'ELEC-2026/01'} • গেজেট তারিখ: {currentElection.electionDate}
              </div>
            </div>

            {/* Preamble */}
            <p className="text-sm text-justify leading-relaxed text-slate-800 indent-6">
              এতদ্বারা {activeTenant.nameBn}-এর সকল সম্মানিত সাধারণ সদস্য এবং সংশ্লিষ্ট কর্তৃপক্ষের অবগতির জন্য জানানো যাচ্ছে যে, নির্বাচন কমিশনের প্রত্যক্ষ তত্ত্বাবধানে ডিজিটাল গোপন ব্যালটে কার্যনির্বাহী পরিষদ নির্বাচন সুষ্ঠু ও নিরপেক্ষভাবে সম্পন্ন হয়েছে। ভোট গণনা শেষে সর্বাধিক ভোট প্রাপ্তির ভিত্তিতে নিম্নোক্ত প্রার্থীগণকে বিজয়ী হিসেবে ঘোষণা করে চূড়ান্ত গেজেট প্রকাশ করা হলো:
            </p>

            {/* Winners Gazette Table */}
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="p-2.5 text-left border-r border-slate-300">পদের নাম</th>
                  <th className="p-2.5 text-left border-r border-slate-300">নির্বাচিত প্রার্থীর নাম</th>
                  <th className="p-2.5 text-left border-r border-slate-300">বরাদ্দকৃত প্রতীক</th>
                  <th className="p-2.5 text-center border-r border-slate-300">প্রাপ্ত ভোট</th>
                  <th className="p-2.5 text-center">ফলাফল স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {postsList.map(postConfig => {
                  const postCands = currentElection.candidates.filter(
                    c => c.post === postConfig.post && c.status !== 'WITHDRAWN' && c.status !== 'REJECTED'
                  );
                  postCands.sort((a, b) => b.voteCount - a.voteCount);
                  const winner = postCands[0];

                  return (
                    <tr key={postConfig.id}>
                      <td className="p-2.5 font-bold border-r border-slate-300">
                        {postConfig.titleBn}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">
                        {winner ? winner.nameBn : '—'}
                      </td>
                      <td className="p-2.5 border-r border-slate-300">
                        {winner ? `${winner.symbolName} (${winner.symbolEmoji})` : '—'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold border-r border-slate-300">
                        {winner ? `${winner.voteCount} ভোট` : '০'}
                      </td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">
                        {winner ? 'বিজয়ী ঘোষিত' : 'শূন্য'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Commission Certification Signatures */}
            <div className="pt-16 grid grid-cols-3 gap-4 text-center text-xs text-slate-800">
              <div className="space-y-1">
                <div className="w-36 mx-auto border-t border-slate-700 pt-1 font-bold">
                  {currentElection.commission?.commissioner2NameBn || 'নির্বাচন কমিশনার'}
                </div>
                <div className="text-[10px] text-slate-500">নির্বাচন কমিশনার (১)</div>
              </div>

              <div className="space-y-1">
                <div className="w-36 mx-auto border-t border-slate-700 pt-1 font-bold">
                  {currentElection.commission?.commissioner3NameBn || 'রিটার্নিং অফিসার'}
                </div>
                <div className="text-[10px] text-slate-500">নির্বাচন কমিশনার (২)</div>
              </div>

              <div className="space-y-1">
                <div className="w-44 mx-auto border-t border-slate-700 pt-1 font-bold text-slate-950">
                  {currentElection.commission?.chiefCommissionerNameBn || 'প্রধান নির্বাচন কমিশনার'}
                </div>
                <div className="text-[10px] text-slate-500">প্রধান নির্বাচন কমিশনার</div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-500">
              ডিজিটালভাবে সমিতিপ্রো ক্লাউড প্ল্যাটফর্ম থেকে সংকলিত • অডিট ট্রেইল দ্বারা সুরক্ষিত ও সংরক্ষিত • {activeTenant.slug}.samitypro.com
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: নতুন নির্বাচনী তফসিল ঘোষণা */}
      {/* ========================================================================= */}
      {isNewElectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Vote className="w-5 h-5 text-emerald-400" />
                <span>নতুন নির্বাচনী তফসিল ঘোষণা</span>
              </h4>
              <button
                onClick={() => setIsNewElectionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateElection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">নির্বাচনের শিরোনাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৯ম কার্যনির্বাহী পরিষদ নির্বাচন ২০২৬-২০২৮"
                  value={newTitleBn}
                  onChange={e => setNewTitleBn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">নির্বাচনের মেয়াদকাল *</label>
                  <input
                    type="text"
                    required
                    placeholder="২০২৬-২০২৮"
                    value={newTermYears}
                    onChange={e => setNewTermYears(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">ভোটগ্রহণের তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">ভোটকেন্দ্র / মিলনাতয়ন</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={e => setNewVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">প্রধান নির্বাচন কমিশনারের নাম</label>
                <input
                  type="text"
                  value={newChiefCommissioner}
                  onChange={e => setNewChiefCommissioner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewElectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  তফসিল ঘোষণা করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: নতুন প্রার্থী অন্তর্ভুক্তিকরণ */}
      {/* ========================================================================= */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>নতুন প্রার্থী মনোনয়ন অন্তর্ভুক্তি</span>
              </h4>
              <button
                onClick={() => setIsCandidateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">প্রার্থী সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={candMemberId}
                  onChange={e => setCandMemberId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- সদস্য নির্বাচন করুন --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.nameBn} ({m.memberCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">পদের নাম *</label>
                  <select
                    value={candPost}
                    onChange={e => setCandPost(e.target.value as ElectionPost)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="PRESIDENT">সভাপতি (President)</option>
                    <option value="SECRETARY">সাধারণ সম্পাদক (Secretary)</option>
                    <option value="TREASURER">কোষাধ্যক্ষ (Treasurer)</option>
                    <option value="EXECUTIVE_MEMBER">কার্যনির্বাহী সদস্য (EC Member)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">প্রতীক (মার্কা) নির্বাচন *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="দোয়াত-কলম"
                      value={candSymbolName}
                      onChange={e => setCandSymbolName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <select
                      value={candSymbolEmoji}
                      onChange={e => setCandSymbolEmoji(e.target.value)}
                      className="w-16 px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none"
                    >
                      <option value="✒️">✒️</option>
                      <option value="🕊️">🕊️</option>
                      <option value="🌹">🌹</option>
                      <option value="🌅">🌅</option>
                      <option value="📖">📖</option>
                      <option value="🚲">🚲</option>
                      <option value="🚢">🚢</option>
                      <option value="🌾">🌾</option>
                      <option value="🦁">🦁</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">প্রস্তাবক</label>
                  <input
                    type="text"
                    placeholder="সদস্যের নাম"
                    value={candProposer}
                    onChange={e => setCandProposer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">সমর্থক</label>
                  <input
                    type="text"
                    placeholder="সদস্যের নাম"
                    value={candSeconder}
                    onChange={e => setCandSeconder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">নির্বাচনী ইশতেহার সংক্ষেপ</label>
                <textarea
                  rows={2}
                  placeholder="প্রার্থীর মূল অঙ্গীকার বা ইশতেহার..."
                  value={candManifesto}
                  onChange={e => setCandManifesto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  প্রার্থী যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: গেজেট প্রকাশ ও ফলাফল অনুমোদন */}
      {/* ========================================================================= */}
      {isCertifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>নির্বাচনী ফলাফল চূড়ান্ত গেজেট প্রকাশনা</span>
              </h4>
              <button
                onClick={() => setIsCertifyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCertifyResultsSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                ফলাফল গেজেট প্রকাশ করলে প্রতিটি পদের সর্বোচ্চ ভোটপ্রাপ্ত প্রার্থীকে আনুষ্ঠানিকভাবে <strong>বিজয়ী (Elected)</strong> ঘোষণা করা হবে এবং ফলাফল ডিজিটালভাবে লক হয়ে যাবে।
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">গেজেট স্বাক্ষরকারী ও সত্যায়নকারী</label>
                <input
                  type="text"
                  required
                  value={certifiedByName}
                  onChange={e => setCertifiedByName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCertifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  চূড়ান্ত গেজেট প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
