'use client';

import React, { useState } from 'react';
import { 
  Building2, Plus, Search, Filter, TrendingUp, DollarSign, 
  Calendar, MapPin, User, CheckCircle2, AlertCircle, Eye, 
  ArrowUpRight, ArrowDownRight, Printer, FileText, X, PieChart,
  ShieldCheck, Share2, Briefcase, Award, QrCode
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  SamityProject, ProjectCategory, ProjectStatus, 
  ProjectMemberInvestment, ProjectTransaction, PaymentMethod 
} from '@/types';

export function ProjectsPortfolioView() {
  const { 
    projects, projectInvestments, projectTransactions, members,
    createProject, updateProject, recordProjectInvestment, 
    recordProjectTransaction, closeProjectAndDistributeProfit,
    letterhead, language
  } = useSamityStore();

  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'INVESTMENTS' | 'TRANSACTIONS'>('PROJECTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isCloseProjectModalOpen, setIsCloseProjectModalOpen] = useState(false);

  // Active selections
  const [selectedProject, setSelectedProject] = useState<SamityProject | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<ProjectMemberInvestment | null>(null);

  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    nameBn: '',
    nameEn: '',
    category: 'AGRO' as ProjectCategory,
    location: '',
    estimatedBudget: 500000,
    totalShareUnits: 50,
    unitPrice: 10000,
    targetRoiPercent: 20,
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: `${new Date().getFullYear()}-12-31`,
    managerName: '',
    managerPhone: '',
    descriptionBn: ''
  });

  // Investment Form State
  const [investForm, setInvestForm] = useState({
    projectId: '',
    memberId: '',
    unitsCount: 1,
    paymentMethod: 'BANK' as PaymentMethod,
    notes: ''
  });

  // Transaction Form State
  const [txForm, setTxForm] = useState({
    projectId: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    category: '',
    amount: 10000,
    paymentMethod: 'BANK' as PaymentMethod,
    descriptionBn: '',
    receivedFromOrPaidTo: ''
  });

  // Close Project Form State
  const [closeForm, setCloseForm] = useState({
    declaredProfit: 0,
    remarks: ''
  });

  // Aggregate Metrics
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE' || p.status === 'HARVESTING').length;
  const totalInvestedCapital = projects.reduce((sum, p) => sum + p.totalCapitalInvested, 0);
  const totalProjectIncome = projects.reduce((sum, p) => sum + p.totalIncome, 0);
  const totalProjectExpense = projects.reduce((sum, p) => sum + p.totalExpense, 0);
  const totalNetProfit = projects.reduce((sum, p) => sum + p.netProfitOrLoss, 0);

  // Filtering
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (cat: ProjectCategory) => {
    switch (cat) {
      case 'AGRO':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">🌾 কৃষি ও শস্য</span>;
      case 'FISHERIES':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">🐟 মৎস্য চাষ</span>;
      case 'LIVESTOCK':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">🐄 ডেইরি ও পশুসম্পদ</span>;
      case 'REAL_ESTATE':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">🏢 জমি ও আবাসন</span>;
      case 'COMMERCIAL':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">📦 পাইকারি বাণিজ্য</span>;
      case 'TRANSPORT':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">🚚 পরিবহন</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">📋 সাধারণ প্রকল্প</span>;
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">পরিকল্পনাধীন</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>চলমান</span>;
      case 'HARVESTING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>ফসল/পণ্য আহরণ</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">সমাপ্ত ও বণ্টিত</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">বাতিল</span>;
    }
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.nameBn) return;
    createProject(projectForm);
    setIsNewProjectModalOpen(false);
    setProjectForm({
      nameBn: '',
      nameEn: '',
      category: 'AGRO',
      location: '',
      estimatedBudget: 500000,
      totalShareUnits: 50,
      unitPrice: 10000,
      targetRoiPercent: 20,
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: `${new Date().getFullYear()}-12-31`,
      managerName: '',
      managerPhone: '',
      descriptionBn: ''
    });
  };

  const handleInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investForm.projectId || !investForm.memberId) return;
    const inv = recordProjectInvestment(investForm);
    setIsInvestModalOpen(false);
    setSelectedInvestment(inv);
    setIsCertificateModalOpen(true);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.projectId || !txForm.amount) return;
    recordProjectTransaction(txForm);
    setIsTxModalOpen(false);
  };

  const handleCloseProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    closeProjectAndDistributeProfit(selectedProject.id, closeForm.declaredProfit, closeForm.remarks);
    setIsCloseProjectModalOpen(false);
    setIsDetailDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 p-5 sm:p-6 rounded-2xl border border-emerald-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              মডিউল ৩
            </span>
            <span className="text-xs text-slate-400 font-medium">বাণিজ্যিক ও যৌথ প্রকল্প পোর্টফোলিও</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            প্রকল্প ও বিনিয়োগ ব্যবস্থাপনা (Project Portfolio)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            সমিতির বহুমুখী কৃষি, মৎস্য, ডেইরি ও বাণিজ্যিক প্রকল্পে সদস্য অংশীদারিত্ব, বাজেট, আয়-ব্যয় এবং লাভ-ক্ষতি খতিয়ান।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রকল্প তৈরি</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">মোট প্রকল্প</div>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{totalProjectsCount} টি</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">{activeProjectsCount} টি চলমান</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">সংগৃহীত বিনিয়োগ</div>
          <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-1">৳ {totalInvestedCapital.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">অংশীদারিত্ব মূলধন</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">মোট প্রকল্প আয়</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">৳ {totalProjectIncome.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">বিক্রয় ও সার্ভিস আয়</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">মোট প্রকল্প ব্যয়</div>
          <div className="text-lg sm:text-xl font-bold text-rose-400 mt-1">৳ {totalProjectExpense.toLocaleString()}</div>
          <div className="text-[10px] text-rose-400 mt-0.5">পরিচালন ও কাঁচামাল</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">অর্জিত নিট মুনাফা</div>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${totalNetProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            ৳ {totalNetProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">আয় - ব্যয় ব্যালান্স</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">বিনিয়োগ সনদ ইস্যু</div>
          <div className="text-lg sm:text-xl font-bold text-indigo-400 mt-1">{projectInvestments.length} টি</div>
          <div className="text-[10px] text-indigo-300 mt-0.5">সদস্য বিনিয়োগকারী</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'PROJECTS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            প্রকল্প তালিকা ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('INVESTMENTS')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'INVESTMENTS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            সদস্য বিনিয়োগ রেজিস্টার ({projectInvestments.length})
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            প্রকল্প আয়-ব্যয় লেজার ({projectTransactions.length})
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => {
              if (projects.length > 0) {
                setInvestForm(f => ({ ...f, projectId: projects[0].id }));
                setIsInvestModalOpen(true);
              }
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 flex items-center gap-1.5 transition"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>বিনিয়োগ গ্রহণ</span>
          </button>
          <button
            onClick={() => {
              if (projects.length > 0) {
                setTxForm(f => ({ ...f, projectId: projects[0].id }));
                setIsTxModalOpen(true);
              }
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/30 flex items-center gap-1.5 transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>আয়/ব্যয় এন্ট্রি</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROJECTS GRID & CARDS */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="প্রকল্পের নাম, কোড বা অবস্থান দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              <option value="AGRO">কৃষি ও শস্য</option>
              <option value="FISHERIES">মৎস্য চাষ</option>
              <option value="LIVESTOCK">ডেইরি ও পশুসম্পদ</option>
              <option value="REAL_ESTATE">জমি ও আবাসন</option>
              <option value="COMMERCIAL">বাণিজ্যিক ট্রেডিং</option>
              <option value="TRANSPORT">পরিবহন</option>
              <option value="OTHER">অন্যান্য</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="PLANNING">পরিকল্পনাধীন</option>
              <option value="ACTIVE">চলমান</option>
              <option value="HARVESTING">আহরণ/বিক্রয়</option>
              <option value="COMPLETED">সমাপ্ত</option>
            </select>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => {
              const investmentProgress = project.estimatedBudget > 0
                ? Math.min(100, Math.round((project.totalCapitalInvested / project.estimatedBudget) * 100))
                : 0;

              return (
                <div
                  key={project.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-lg group relative overflow-hidden"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {project.code}
                      </span>
                      {getStatusBadge(project.status)}
                    </div>

                    <div>
                      <div className="mb-1">{getCategoryBadge(project.category)}</div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                        {project.nameBn}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {project.descriptionBn || 'সমিতির যৌথ বাণিজ্যিক বিনিয়োগ প্রকল্প।'}
                    </p>

                    {/* Financial Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">বিনিয়োগ সংগ্রহ:</span>
                        <span className="font-bold text-white">
                          ৳ {project.totalCapitalInvested.toLocaleString()} / <span className="text-slate-400 font-normal">৳ {project.estimatedBudget.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${investmentProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400">মোট আয়</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">৳ {project.totalIncome.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">মোট ব্যয়</div>
                        <div className="text-xs font-bold text-rose-400 mt-0.5">৳ {project.totalExpense.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">বর্তমান ROI</div>
                        <div className="text-xs font-bold text-cyan-400 mt-0.5">{project.actualRoiPercent}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>বিস্তারিত খতিয়ান</span>
                    </button>

                    <button
                      onClick={() => {
                        setInvestForm(f => ({ ...f, projectId: project.id }));
                        setIsInvestModalOpen(true);
                      }}
                      className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center gap-1 transition"
                      title="সদস্যের বিনিয়োগ গ্রহণ"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>বিনিয়োগ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-300">কোনো প্রকল্প পাওয়া যায়নি</div>
              <p className="text-xs text-slate-500 mt-1">অনুসন্ধানের শব্দ পরিবর্তন করুন অথবা নতুন প্রকল্প তৈরি করুন।</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBER INVESTMENTS REGISTER */}
      {activeTab === 'INVESTMENTS' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>সদস্য প্রকল্প বিনিয়োগ ও অংশীদারিত্ব রেজিস্টার</span>
            </h3>
            <button
              onClick={() => {
                if (projects.length > 0) {
                  setInvestForm(f => ({ ...f, projectId: projects[0].id }));
                  setIsInvestModalOpen(true);
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন বিনিয়োগ গ্রহণ</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">সনদ নম্বর</th>
                  <th className="py-3 px-4">সদস্যের নাম ও কোড</th>
                  <th className="py-3 px-4">প্রকল্পের নাম</th>
                  <th className="py-3 px-4 text-center">ইউনিট</th>
                  <th className="py-3 px-4 text-right">বিনিয়োগকৃত মূলধন</th>
                  <th className="py-3 px-4 text-right">বণ্টনকৃত লাভ</th>
                  <th className="py-3 px-4 text-center">মাধ্যম</th>
                  <th className="py-3 px-4 text-center">তারিখ</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projectInvestments.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {inv.certificateNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{inv.memberNameBn}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.memberCode} • {inv.memberPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {inv.projectNameBn}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold">
                        {inv.unitsCount} টি
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      ৳ {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-teal-400">
                      ৳ {inv.profitEarned.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {inv.investmentDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedInvestment(inv);
                          setIsCertificateModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Printer className="w-3 h-3" />
                        <span>সনদ প্রিন্ট</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECT TRANSACTIONS LEDGER */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>প্রকল্প আয়-ব্যয় সাধারণ খতিয়ান</span>
            </h3>
            <button
              onClick={() => {
                if (projects.length > 0) {
                  setTxForm(f => ({ ...f, projectId: projects[0].id }));
                  setIsTxModalOpen(true);
                }
              }}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>আয়/ব্যয় এন্ট্রি</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ভাউচার নং</th>
                  <th className="py-3 px-4">প্রকল্প</th>
                  <th className="py-3 px-4">ধরন ও খাত</th>
                  <th className="py-3 px-4">বিবরণ ও পক্ষ</th>
                  <th className="py-3 px-4 text-center">পেমেন্ট মাধ্যম</th>
                  <th className="py-3 px-4 text-center">তারিখ</th>
                  <th className="py-3 px-4 text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projectTransactions.map(tx => {
                  const prj = projects.find(p => p.id === tx.projectId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                        {tx.voucherNo}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {prj?.nameBn || 'সমবায় প্রকল্প'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          tx.type === 'INCOME'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {tx.type === 'INCOME' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type === 'INCOME' ? 'আয়' : 'ব্যয়'}
                        </span>
                        <div className="text-slate-300 text-xs font-semibold mt-1">{tx.category}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-200 line-clamp-1">{tx.descriptionBn}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">পক্ষ: {tx.receivedFromOrPaidTo}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400">
                        {tx.transactionDate}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: CREATE NEW PROJECT */}
      {/* ---------------------------------------------------- */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">নতুন সমবায় প্রকল্প শুরু করুন</h3>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-medium">প্রকল্পের পূর্ণ নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রূপসী বাংলা সমন্বিত ডেইরি ও কৃষি খামার"
                    value={projectForm.nameBn}
                    onChange={e => setProjectForm({ ...projectForm, nameBn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রকল্পের ক্যাটাগরি *</label>
                  <select
                    value={projectForm.category}
                    onChange={e => setProjectForm({ ...projectForm, category: e.target.value as ProjectCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AGRO">কৃষি ও শস্য প্রকল্প</option>
                    <option value="FISHERIES">মৎস্য খামার ও পোনা উৎপাদন</option>
                    <option value="LIVESTOCK">ডেইরি ও গবাদিপশু খামার</option>
                    <option value="REAL_ESTATE">জমি ক্রয় ও আবাসন উন্নয়ন</option>
                    <option value="COMMERCIAL">পাইকারি ট্রেডিং ও ব্যবসা</option>
                    <option value="TRANSPORT">পরিবহন ও লজিস্টিকস</option>
                    <option value="OTHER">অন্যান্য বহুমুখী প্রকল্প</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রকল্পের অবস্থান / এলাকা *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সোনারগাঁও, নারায়ণগঞ্জ"
                    value={projectForm.location}
                    onChange={e => setProjectForm({ ...projectForm, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রাক্কলিত মোট বাজেট (৳) *</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={5000}
                    value={projectForm.estimatedBudget}
                    onChange={e => setProjectForm({ ...projectForm, estimatedBudget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রত্যাশিত মুনাফা হার (Target ROI %) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={projectForm.targetRoiPercent}
                    onChange={e => setProjectForm({ ...projectForm, targetRoiPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">মোট শেয়ার/অংশীদারিত্ব ইউনিট *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={projectForm.totalShareUnits}
                    onChange={e => {
                      const units = Number(e.target.value);
                      const unitPrice = units > 0 ? Math.round(projectForm.estimatedBudget / units) : 0;
                      setProjectForm({ ...projectForm, totalShareUnits: units, unitPrice });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রতি ইউনিট বিনিয়োগ মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    value={projectForm.unitPrice}
                    onChange={e => setProjectForm({ ...projectForm, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রকল্প ব্যবস্থাপকের নাম</label>
                  <input
                    type="text"
                    placeholder="দায়িত্বপ্রাপ্ত কর্মকর্তার নাম"
                    value={projectForm.managerName}
                    onChange={e => setProjectForm({ ...projectForm, managerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">ব্যবস্থাপকের মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={projectForm.managerPhone}
                    onChange={e => setProjectForm({ ...projectForm, managerPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রকল্প শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">প্রত্যাশিত সমাপ্তির তারিখ</label>
                  <input
                    type="date"
                    value={projectForm.expectedEndDate}
                    onChange={e => setProjectForm({ ...projectForm, expectedEndDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-medium">প্রকল্পের বিস্তারিত বিবরণ ও উদ্দেশ্য</label>
                  <textarea
                    rows={2}
                    placeholder="প্রকল্পের কর্মপরিকল্পনা ও সদস্যদের সুবিধা উল্লেখ করুন..."
                    value={projectForm.descriptionBn}
                    onChange={e => setProjectForm({ ...projectForm, descriptionBn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  প্রকল্প শুরু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: RECORD MEMBER INVESTMENT */}
      {/* ---------------------------------------------------- */}
      {isInvestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">সদস্যের প্রকল্প বিনিয়োগ গ্রহণ</h3>
              </div>
              <button
                onClick={() => setIsInvestModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvestSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">প্রকল্প নির্বাচন করুন *</label>
                <select
                  required
                  value={investForm.projectId}
                  onChange={e => setInvestForm({ ...investForm, projectId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- প্রকল্প নির্বাচন করুন --</option>
                  {projects.filter(p => p.status !== 'CANCELLED' && p.status !== 'COMPLETED').map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.nameBn} (ইউনিট মূল্য: ৳{p.unitPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">বিনিয়োগকারী সদস্য *</label>
                <select
                  required
                  value={investForm.memberId}
                  onChange={e => setInvestForm({ ...investForm, memberId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- সদস্য নির্বাচন করুন --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nameBn} ({m.memberCode}) • {m.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">ইউনিটের সংখ্যা *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={investForm.unitsCount}
                    onChange={e => setInvestForm({ ...investForm, unitsCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">পেমেন্ট মাধ্যম *</label>
                  <select
                    value={investForm.paymentMethod}
                    onChange={e => setInvestForm({ ...investForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BANK">ব্যাংক একাউন্ট</option>
                    <option value="CASH">নগদ ক্যাশ</option>
                    <option value="BKASH">বিকাশ (bKash)</option>
                    <option value="NAGAD">নগদ (Nagad)</option>
                  </select>
                </div>
              </div>

              {/* Total Calculation Card */}
              {(() => {
                const prj = projects.find(p => p.id === investForm.projectId);
                const total = prj ? prj.unitPrice * investForm.unitsCount : 0;
                return (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">মোট প্রদেয় বিনিয়োগ মূল্য:</div>
                      <div className="text-xs text-slate-300">
                        {investForm.unitsCount} ইউনিট × ৳ {prj?.unitPrice.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-emerald-400">
                      ৳ {total.toLocaleString()}
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">মন্তব্য বা রেফারেন্স</label>
                <input
                  type="text"
                  placeholder="যেমন: ব্যাংক চেক নং বা বিশেষ চুক্তি"
                  value={investForm.notes}
                  onChange={e => setInvestForm({ ...investForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInvestModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  বিনিয়োগ নিশ্চিত ও সনদ তৈরি
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: RECORD PROJECT INCOME OR EXPENSE */}
      {/* ---------------------------------------------------- */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">প্রকল্পের আয় / ব্যয় এন্ট্রি</h3>
              </div>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">প্রকল্প *</label>
                <select
                  required
                  value={txForm.projectId}
                  onChange={e => setTxForm({ ...txForm, projectId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- প্রকল্প নির্বাচন করুন --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">লেনদেনের ধরন *</label>
                  <select
                    value={txForm.type}
                    onChange={e => setTxForm({ ...txForm, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="INCOME">প্রকল্প আয় (+ Income)</option>
                    <option value="EXPENSE">প্রকল্প ব্যয় (- Expense)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={txForm.amount}
                    onChange={e => setTxForm({ ...txForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">হিসাব খাত / ক্যাটাগরি *</label>
                <input
                  type="text"
                  required
                  placeholder={txForm.type === 'INCOME' ? 'যেমন: দুধ ও বাছুর বিক্রয়' : 'যেমন: পশুখাদ্য ও ওষুধ ক্রয়'}
                  value={txForm.category}
                  onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">পক্ষ / ব্যক্তি / প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder={txForm.type === 'INCOME' ? 'কার কাছ থেকে টাকা পাওয়া গেল' : 'কাকে টাকা পরিশোধ করা হলো'}
                  value={txForm.receivedFromOrPaidTo}
                  onChange={e => setTxForm({ ...txForm, receivedFromOrPaidTo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">লেনদেনের মাধ্যম *</label>
                <select
                  value={txForm.paymentMethod}
                  onChange={e => setTxForm({ ...txForm, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="BANK">ব্যাংক একাউন্ট</option>
                  <option value="CASH">নগদ ক্যাশ</option>
                  <option value="BKASH">বিকাশ</option>
                  <option value="NAGAD">নগদ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">বিস্তারিত বিবরণ *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="বিল বা ইনভয়েস নম্বর ও বিস্তারিত বিবরণ লিখুন..."
                  value={txForm.descriptionBn}
                  onChange={e => setTxForm({ ...txForm, descriptionBn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                >
                  খতিয়ানে এন্ট্রি সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DRAWER: PROJECT DETAILS & FULL AUDIT VIEW */}
      {/* ---------------------------------------------------- */}
      {isDetailDrawerOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {selectedProject.code}
                    </span>
                    {getStatusBadge(selectedProject.status)}
                    {getCategoryBadge(selectedProject.category)}
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedProject.nameBn}</h2>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedProject.location}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Financial Dashboard Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">বাজেট</div>
                  <div className="text-sm font-bold text-white mt-0.5">৳ {selectedProject.estimatedBudget.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">সংগৃহীত মূলধন</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">৳ {selectedProject.totalCapitalInvested.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">মোট আয়</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">৳ {selectedProject.totalIncome.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">মোট ব্যয়</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">৳ {selectedProject.totalExpense.toLocaleString()}</div>
                </div>
              </div>

              {/* Net Profit & ROI Performance Bar */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">নিট লাভ / ক্ষতি (P&L)</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    ৳ {selectedProject.netProfitOrLoss.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">বর্তমান ROI</div>
                  <div className="text-xl font-bold text-teal-300 mt-0.5">
                    {selectedProject.actualRoiPercent}% <span className="text-xs text-slate-400 font-normal">(লক্ষ্যমাত্রা: {selectedProject.targetRoiPercent}%)</span>
                  </div>
                </div>
              </div>

              {/* Investors List in this Project */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>অংশীদারিত্ব বিনিয়োগকারী সদস্যবৃন্দ ({projectInvestments.filter(i => i.projectId === selectedProject.id).length})</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {projectInvestments.filter(i => i.projectId === selectedProject.id).map(inv => (
                    <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white text-xs">{inv.memberNameBn}</div>
                        <div className="text-[10px] text-slate-400">{inv.memberCode} • সনদ: {inv.certificateNo}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400 text-xs">৳ {inv.totalAmount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">{inv.unitsCount} টি ইউনিট</div>
                      </div>
                    </div>
                  ))}
                  {projectInvestments.filter(i => i.projectId === selectedProject.id).length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500">এখনও কোনো সদস্য বিনিয়োগ গ্রহণ করা হয়নি।</div>
                  )}
                </div>
              </div>

              {/* Transactions in this Project */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>সাম্প্রতিক আয় ও ব্যয় লেজার</span>
                </h4>

                <div className="space-y-2">
                  {projectTransactions.filter(t => t.projectId === selectedProject.id).map(tx => (
                    <div key={tx.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="max-w-[70%]">
                        <div className="font-semibold text-white text-xs truncate">{tx.descriptionBn}</div>
                        <div className="text-[10px] text-slate-400">{tx.transactionDate} • {tx.category} • {tx.receivedFromOrPaidTo}</div>
                      </div>
                      <div className={`font-bold text-xs ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              {selectedProject.status !== 'COMPLETED' ? (
                <button
                  onClick={() => {
                    setCloseForm({
                      declaredProfit: Math.max(0, selectedProject.netProfitOrLoss),
                      remarks: 'প্রকল্পের সফল মেয়াদপূর্তি ও হিসাব নিরীক্ষা শেষে সদস্যদের মাঝে লভ্যাংশ বণ্টন সম্পন্ন।'
                    });
                    setIsCloseProjectModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg transition"
                >
                  প্রকল্প সমাপ্ত ঘোষণা ও লভ্যাংশ বণ্টন
                </button>
              ) : (
                <div className="flex-1 py-2 text-center text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  ✓ এই প্রকল্পটি সফলভাবে সমাপ্ত ও সদস্যদের লভ্যাংশ বিতরণ করা হয়েছে
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: CLOSE PROJECT & DISTRIBUTE PROFIT */}
      {/* ---------------------------------------------------- */}
      {isCloseProjectModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">প্রকল্প সমাপনী ও মুনাফা বণ্টন</h3>
              </div>
              <button
                onClick={() => setIsCloseProjectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseProjectSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">নির্বাচিত প্রকল্প:</div>
                <div className="font-bold text-white text-sm">[{selectedProject.code}] {selectedProject.nameBn}</div>
                <div className="text-[11px] text-emerald-400">
                  মোট সংগৃহীত মূলধন: ৳ {selectedProject.totalCapitalInvested.toLocaleString()} | অর্জিত মুনাফা: ৳ {selectedProject.netProfitOrLoss.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">বণ্টনযোগ্য মোট ঘোষিত মুনাফা (৳) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={closeForm.declaredProfit}
                  onChange={e => setCloseForm({ ...closeForm, declaredProfit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                />
                <p className="text-[11px] text-slate-500">
                  এই পরিমাণ অর্থ সকল বিনিয়োগকারী সদস্যের বিনিয়োগ অনুপাত অনুযায়ী তাদের সাধারণ সঞ্চয় হিসাবে স্বয়ংক্রিয়ভাবে ক্রেডিট করা হবে।
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">সমাপনী বিবরণ ও রেজোলিউশন নোট</label>
                <textarea
                  rows={2}
                  value={closeForm.remarks}
                  onChange={e => setCloseForm({ ...closeForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCloseProjectModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  সমাপ্তি ও সঞ্চয়ে ক্রেডিট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: OFFICIAL PRINTABLE PROJECT INVESTMENT CERTIFICATE */}
      {/* ---------------------------------------------------- */}
      {isCertificateModalOpen && selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">প্রকল্প বিনিয়োগ অংশীদারিত্ব সনদপত্র</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Printable Area */}
            <div className="p-8 rounded-xl bg-white text-slate-900 border-4 border-double border-emerald-800 shadow-xl relative font-serif">
              {/* Top Letterhead */}
              <div className="text-center pb-4 border-b-2 border-emerald-800/40 space-y-1">
                <h1 className="text-2xl font-black text-emerald-900 tracking-tight">
                  {letterhead.samityNameBn}
                </h1>
                <p className="text-xs text-slate-600 font-sans">
                  {letterhead.addressBn} • ফোন: {letterhead.phone}
                </p>
                <div className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold font-sans mt-1 uppercase tracking-wider">
                  প্রকল্প বিনিয়োগ অংশীদারিত্ব সনদপত্র (Project Investment Certificate)
                </div>
              </div>

              {/* Certificate Meta */}
              <div className="flex justify-between items-center text-xs text-slate-600 font-sans pt-4">
                <div>সনদ নম্বর: <span className="font-mono font-bold text-slate-900">{selectedInvestment.certificateNo}</span></div>
                <div>ইস্যুর তারিখ: <span className="font-semibold text-slate-900">{selectedInvestment.investmentDate}</span></div>
              </div>

              {/* Main Certificate Statement */}
              <div className="py-6 space-y-4 text-justify text-sm leading-relaxed text-slate-800 font-sans">
                <p>
                  এই মর্মে প্রত্যয়ন করা যাইতেছে যে, অত্র সমিতির সম্মানিত সাধারণ সদস্য জনাব/জনাবা{' '}
                  <strong className="text-emerald-950 font-bold underline underline-offset-4">{selectedInvestment.memberNameBn}</strong> (সদস্য কোড নং:{' '}
                  <span className="font-mono font-bold">{selectedInvestment.memberCode}</span>, মোবাইল: {selectedInvestment.memberPhone}) অত্র সমিতি কর্তৃক পরিচালিত{' '}
                  <strong className="text-emerald-900 font-bold">{selectedInvestment.projectNameBn}</strong> প্রকল্পে{' '}
                  <strong>{selectedInvestment.unitsCount} (টি)</strong> অংশীদারিত্ব ইউনিট বাবদ সর্বমোট{' '}
                  <strong className="text-emerald-900 font-bold">৳ {selectedInvestment.totalAmount.toLocaleString()}</strong> (কথায়: {selectedInvestment.totalAmount} টাকা মাত্র) বিনিয়োগ প্রদান করিয়াছেন।
                </p>
                <p>
                  সমিতির গৃহীত প্রকল্প নীতিমালা ও রেজোলিউশন মোতাবেক উক্ত সদস্য প্রকল্পের ঘোষিত নিট মুনাফার আনুপাতিক অংশীদারিত্ব পাইবার পূর্ণ অধিকারী থাকিবেন।
                </p>
              </div>

              {/* Verification & Signatures */}
              <div className="pt-8 border-t border-slate-300 flex items-end justify-between font-sans text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 border border-slate-300 rounded bg-slate-50">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    ডিজিটাল ভেরিফিকেশন কোড<br />
                    <span className="font-mono text-emerald-800 font-bold">{selectedInvestment.certificateNo}</span><br />
                    সমিতিপ্রো ডিজিটাল ক্লাউড
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-slate-900"></div>
                  <div className="font-bold text-slate-800">কোষাধ্যক্ষ</div>
                  <div className="text-[10px] text-slate-500">একতা সমবায় সমিতি</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-slate-900"></div>
                  <div className="font-bold text-slate-800">সভাপতি / সম্পাদক</div>
                  <div className="text-[10px] text-slate-500">একতা সমবায় সমিতি</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
