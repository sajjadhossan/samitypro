'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/samity/DashboardView';
import { MembersView } from '@/components/samity/MembersView';
import { SavingsView } from '@/components/samity/SavingsView';
import { LoansView } from '@/components/samity/LoansView';
import { AccountsView } from '@/components/samity/AccountsView';
import { MeetingsView } from '@/components/samity/MeetingsView';
import { ElectionsView } from '@/components/samity/ElectionsView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SuperAdminView } from '@/components/superadmin/SuperAdminView';
import { MemberPortalView } from '@/components/member/MemberPortalView';

import { AddMemberModal } from '@/components/samity/AddMemberModal';
import { RecordDepositModal } from '@/components/samity/RecordDepositModal';
import { CollectInstallmentModal } from '@/components/samity/CollectInstallmentModal';
import { ApkDownloadModal } from '@/components/common/ApkDownloadModal';

import { useSamityStore } from '@/lib/store';
import { 
  LayoutDashboard, Users, PiggyBank, HandCoins, 
  ReceiptText, FileBarChart, BookOpen, Smartphone 
} from 'lucide-react';

export default function Home() {
  const { currentUser } = useSamityStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositMemberId, setDepositMemberId] = useState<string | undefined>(undefined);
  const [isLoanCollectOpen, setIsLoanCollectOpen] = useState(false);
  const [collectLoanId, setCollectLoanId] = useState<string | undefined>(undefined);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Sync active tab when role changes
  React.useEffect(() => {
    if (currentUser.role === 'SUPER_ADMIN') {
      setActiveTab('saas-overview');
    } else if (currentUser.role === 'MEMBER') {
      setActiveTab('member-passbook');
    } else {
      setActiveTab('dashboard');
    }
  }, [currentUser.role]);

  const handleOpenDeposit = (memberId?: string) => {
    setDepositMemberId(memberId);
    setIsDepositOpen(true);
  };

  const handleOpenCollectLoan = (loanId?: string) => {
    setCollectLoanId(loanId);
    setIsLoanCollectOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Universal Top Header */}
      <Header onOpenApkModal={() => setIsApkModalOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto pb-16 md:pb-6">
        
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={tab => setActiveTab(tab)} 
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* SUPER ADMIN PORTAL */}
          {currentUser.role === 'SUPER_ADMIN' ? (
            <SuperAdminView />
          ) : currentUser.role === 'MEMBER' ? (
            /* MEMBER PORTAL */
            activeTab === 'member-elections' ? (
              <ElectionsView />
            ) : activeTab === 'member-loans' ? (
              <LoansView onOpenCollectInstallment={handleOpenCollectLoan} />
            ) : (
              <MemberPortalView />
            )
          ) : (
            /* SAMITY ADMIN & MANAGER PORTAL */
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                  onOpenRecordDeposit={() => handleOpenDeposit()}
                  onOpenCollectInstallment={() => handleOpenCollectLoan()}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'members' && (
                <MembersView
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                  onOpenRecordDeposit={handleOpenDeposit}
                />
              )}

              {activeTab === 'savings' && (
                <SavingsView
                  onOpenRecordDeposit={() => handleOpenDeposit()}
                />
              )}

              {activeTab === 'loans' && (
                <LoansView
                  onOpenCollectInstallment={handleOpenCollectLoan}
                />
              )}

              {activeTab === 'accounts' && (
                <AccountsView />
              )}

              {activeTab === 'meetings' && (
                <MeetingsView />
              )}

              {activeTab === 'elections' && (
                <ElectionsView />
              )}

              {activeTab === 'reports' && (
                <ReportsView />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Tailored for Android APK / Mobile Web) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800 bg-slate-950/95 px-2 py-1.5 flex items-center justify-around text-[10px]">
        {currentUser.role === 'MEMBER' ? (
          <>
            <button
              onClick={() => setActiveTab('member-passbook')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'member-passbook' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>পাসবই</span>
            </button>
            <button
              onClick={() => setActiveTab('member-loans')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'member-loans' ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              <HandCoins className="w-5 h-5" />
              <span>ঋণ কিস্তি</span>
            </button>
            <button
              onClick={() => setActiveTab('member-elections')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'member-elections' ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>ভোট দিন</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>ড্যাশবোর্ড</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'members' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>সদস্য</span>
            </button>
            <button
              onClick={() => handleOpenDeposit()}
              className="flex flex-col items-center gap-0.5 p-1 text-emerald-400"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center -mt-3 shadow-lg shadow-emerald-500/30">
                <PiggyBank className="w-4 h-4" />
              </div>
              <span className="font-semibold">জমা</span>
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'loans' ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              <HandCoins className="w-5 h-5" />
              <span>ঋণ</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'reports' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <FileBarChart className="w-5 h-5" />
              <span>রিপোর্ট</span>
            </button>
          </>
        )}
      </div>

      {/* Interactive Global Modals */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />

      <RecordDepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        preselectedMemberId={depositMemberId}
      />

      <CollectInstallmentModal
        isOpen={isLoanCollectOpen}
        onClose={() => setIsLoanCollectOpen(false)}
        preselectedLoanId={collectLoanId}
      />

      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

    </div>
  );
}
