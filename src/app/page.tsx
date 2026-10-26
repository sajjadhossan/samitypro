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
import { SubscriptionsDueView } from '@/components/samity/SubscriptionsDueView';
import { BankDepositsView } from '@/components/samity/BankDepositsView';
import { SamitySetupView } from '@/components/samity/SamitySetupView';
import { NoticesView } from '@/components/samity/NoticesView';
import { DocumentsView } from '@/components/samity/DocumentsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { DocumentGeneratorView } from '@/components/documents/DocumentGeneratorView';
import { ApprovalWorkflowView } from '@/components/approvals/ApprovalWorkflowView';
import { AuditTrailView } from '@/components/audit/AuditTrailView';
import { BackupRestoreView } from '@/components/backup/BackupRestoreView';
import { CommunicationHubView } from '@/components/messaging/CommunicationHubView';
import { MobileMenuDrawer } from '@/components/layout/MobileMenuDrawer';

import { useSamityStore } from '@/lib/store';
import { 
  LayoutDashboard, Users, PiggyBank, HandCoins, 
  FileBarChart, BookOpen, Building2, BadgePercent, MoreVertical 
} from 'lucide-react';

export default function Home() {
  const { currentUser } = useSamityStore();
  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentUser.role === 'SUPER_ADMIN' ? 'saas-overview' : currentUser.role === 'MEMBER' ? 'member-passbook' : 'dashboard';
  });

  const [prevRole, setPrevRole] = useState(currentUser.role);
  if (currentUser.role !== prevRole) {
    setPrevRole(currentUser.role);
    setActiveTab(
      currentUser.role === 'SUPER_ADMIN' ? 'saas-overview' : currentUser.role === 'MEMBER' ? 'member-passbook' : 'dashboard'
    );
  }

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositMemberId, setDepositMemberId] = useState<string | undefined>(undefined);
  const [isLoanCollectOpen, setIsLoanCollectOpen] = useState(false);
  const [collectLoanId, setCollectLoanId] = useState<string | undefined>(undefined);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const handleOpenDeposit = (memberId?: string) => {
    setDepositMemberId(memberId);
    setIsDepositOpen(true);
  };

  const handleOpenCollectLoan = (loanId?: string) => {
    setCollectLoanId(loanId);
    setIsLoanCollectOpen(true);
  };

  const renderMemberPortal = () => {
    switch (activeTab) {
      case 'subscriptions-due':
        return <SubscriptionsDueView />;
      case 'notices':
      case 'member-notices':
        return <NoticesView />;
      case 'documents':
        return <DocumentsView />;
      case 'member-elections':
        return <ElectionsView />;
      case 'member-loans':
        return <LoansView onOpenCollectInstallment={handleOpenCollectLoan} />;
      default:
        return <MemberPortalView />;
    }
  };

  const renderMainContent = () => {
    if (currentUser.role === 'SUPER_ADMIN') {
      if (activeTab === 'samity-setup') {
        return <SamitySetupView />;
      }
      return <SuperAdminView />;
    }
    if (currentUser.role === 'MEMBER') {
      return renderMemberPortal();
    }
    return (
      <>
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onOpenRecordDeposit={() => handleOpenDeposit()}
            onOpenCollectInstallment={() => handleOpenCollectLoan()}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}
        {activeTab === 'samity-setup' && <SamitySetupView />}
        {activeTab === 'subscriptions-due' && <SubscriptionsDueView />}
        {activeTab === 'bank-deposits' && <BankDepositsView />}
        {activeTab === 'members' && (
          <MembersView
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onOpenRecordDeposit={handleOpenDeposit}
          />
        )}
        {activeTab === 'savings' && (
          <SavingsView onOpenRecordDeposit={() => handleOpenDeposit()} />
        )}
        {activeTab === 'loans' && (
          <LoansView onOpenCollectInstallment={handleOpenCollectLoan} />
        )}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'approvals' && <ApprovalWorkflowView />}
        {activeTab === 'communication-hub' && <CommunicationHubView />}
        {activeTab === 'doc-generator' && <DocumentGeneratorView />}
        {activeTab === 'notices' && <NoticesView />}
        {activeTab === 'documents' && <DocumentsView />}
        {activeTab === 'meetings' && <MeetingsView />}
        {activeTab === 'elections' && <ElectionsView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'audit-trail' && <AuditTrailView />}
        {activeTab === 'backup-restore' && <BackupRestoreView />}
        {activeTab === 'settings' && <SettingsView />}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 w-full max-w-full overflow-x-hidden">
      
      {/* Universal Top Header with 3-Dot Menu trigger */}
      <Header 
        onOpenApkModal={() => setIsApkModalOpen(true)} 
        onOpenMenu={() => setIsMenuDrawerOpen(true)}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto pb-20 md:pb-6 overflow-x-hidden">
        
        {/* Sidebar Navigation (Desktop only) */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={tab => setActiveTab(tab)} 
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-full w-full overflow-x-hidden">
          {renderMainContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Tailored for Android APK / Mobile Web with 3-Dot Menu) */}
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
              onClick={() => setActiveTab('subscriptions-due')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'subscriptions-due' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <BadgePercent className="w-5 h-5" />
              <span>চাঁদা ও রসিদ</span>
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
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="flex flex-col items-center gap-0.5 p-1 text-amber-400 font-bold hover:text-amber-300 transition"
            >
              <MoreVertical className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>৩-ডট মেনু</span>
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
              onClick={() => setActiveTab('subscriptions-due')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'subscriptions-due' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <BadgePercent className="w-5 h-5" />
              <span>চাঁদা/বকেয়া</span>
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
              onClick={() => setActiveTab('bank-deposits')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeTab === 'bank-deposits' ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>ব্যাংক হিসাব</span>
            </button>
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="flex flex-col items-center gap-0.5 p-1 text-amber-400 font-bold hover:text-amber-300 transition"
            >
              <MoreVertical className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>৩-ডট মেনু</span>
            </button>
          </>
        )}
      </div>

      {/* Slide-out 3-Dot Drawer Menu (All Boards & Modules) */}
      <MobileMenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

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
