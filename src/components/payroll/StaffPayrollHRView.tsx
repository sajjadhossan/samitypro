'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, Briefcase, DollarSign, Calendar, Clock, CheckCircle2, 
  AlertCircle, Plus, Search, Filter, Printer, FileText, 
  CreditCard, ChevronRight, X, ShieldCheck, ArrowRight, 
  Award, Sparkles, Building, Phone, Mail, MapPin,
  CalendarCheck, UserCheck, UserX, Wallet, Receipt
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  StaffEmployee, StaffAttendance, StaffAdvanceSalary, StaffPayslip,
  StaffDesignation, StaffDepartment, StaffStatus, SalaryPaymentMethod, AttendanceStatus
} from '@/types';

export default function StaffPayrollHRView() {
  const { 
    staffEmployees, staffAttendances, staffAdvanceSalaries, staffPayslips,
    letterhead, signatureSeal, language, activeTenant,
    createStaffEmployee, updateStaffEmployee, recordStaffAttendance,
    bulkRecordStaffAttendance, requestStaffAdvance, generateMonthlyPayroll,
    disburseStaffPayslip, bulkDisburseMonthlyPayroll
  } = useSamityStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DIRECTORY' | 'ATTENDANCE' | 'ADVANCES' | 'PAYROLL'>('OVERVIEW');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Attendance Date
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Payroll Month
  const [payrollMonth, setPayrollMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Modal States
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffEmployee | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [selectedPayslipForDisburse, setSelectedPayslipForDisburse] = useState<StaffPayslip | null>(null);
  const [printPayslip, setPrintPayslip] = useState<StaffPayslip | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Employee Form State
  const [empForm, setEmpForm] = useState<{
    nameBn: string;
    nameEn: string;
    phone: string;
    email: string;
    nid: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    designation: StaffDesignation;
    department: StaffDepartment;
    joiningDate: string;
    basicSalary: number;
    houseRentAllowance: number;
    medicalAllowance: number;
    conveyanceAllowance: number;
    mobileInternetAllowance: number;
    providentFundDeduction: number;
    taxDeduction: number;
    paymentMethod: SalaryPaymentMethod;
    bankName: string;
    bankBranch: string;
    bankAccountNo: string;
    bankRoutingNo: string;
    mfsNumber: string;
    presentAddress: string;
    permanentAddress: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    bloodGroup: string;
    notes: string;
  }>({
    nameBn: '',
    nameEn: '',
    phone: '',
    email: '',
    nid: '',
    gender: 'MALE',
    designation: 'FIELD_SUPERVISOR',
    department: 'FIELD_OPERATIONS',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 18000,
    houseRentAllowance: 7000,
    medicalAllowance: 2000,
    conveyanceAllowance: 3000,
    mobileInternetAllowance: 1000,
    providentFundDeduction: 1800,
    taxDeduction: 0,
    paymentMethod: 'BANK_TRANSFER',
    bankName: 'সোনালী ব্যাংক পিএলসি',
    bankBranch: '',
    bankAccountNo: '',
    bankRoutingNo: '',
    mfsNumber: '',
    presentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    bloodGroup: 'B+',
    notes: ''
  });

  // Advance Salary Form
  const [advForm, setAdvForm] = useState({
    employeeId: staffEmployees[0]?.id || '',
    amount: 10000,
    purpose: 'পারিবারিক জরুরি চিকিৎসা প্রয়োজনে',
    repaymentMonths: 2
  });

  // Disburse Form
  const [disburseForm, setDisburseForm] = useState({
    paymentMethod: 'BANK_TRANSFER' as SalaryPaymentMethod,
    disbursementAccount: '১০২০: সোনালী ব্যাংক চলতি হিসাব',
    bonus: 0,
    remarks: ''
  });

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Calculations & Analytics
  const activeStaffList = useMemo(() => {
    return staffEmployees.filter(e => e.status === 'ACTIVE');
  }, [staffEmployees]);

  const totalMonthlyPayrollBudget = useMemo(() => {
    return activeStaffList.reduce((acc, curr) => acc + curr.grossSalary, 0);
  }, [activeStaffList]);

  const totalAdvancesOutstanding = useMemo(() => {
    return staffAdvanceSalaries
      .filter(a => a.status === 'DISBURSED' && a.remainingBalance > 0)
      .reduce((acc, curr) => acc + curr.remainingBalance, 0);
  }, [staffAdvanceSalaries]);

  // Filtered Staff
  const filteredEmployees = useMemo(() => {
    return staffEmployees.filter(e => {
      const matchSearch = e.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.phone.includes(searchQuery);
      const matchDept = selectedDept === 'ALL' || e.department === selectedDept;
      const matchStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [staffEmployees, searchQuery, selectedDept, selectedStatus]);

  // Attendance for selected date
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, StaffAttendance>();
    staffAttendances
      .filter(a => a.date === attendanceDate)
      .forEach(a => map.set(a.employeeId, a));
    return map;
  }, [staffAttendances, attendanceDate]);

  // Current Month Payslips
  const currentMonthPayslips = useMemo(() => {
    return staffPayslips.filter(p => p.monthYear === payrollMonth);
  }, [staffPayslips, payrollMonth]);

  const totalPayrollDisbursed = useMemo(() => {
    return currentMonthPayslips
      .filter(p => p.paymentStatus === 'PAID')
      .reduce((acc, curr) => acc + curr.netPayable, 0);
  }, [currentMonthPayslips]);

  const totalPayrollUnpaid = useMemo(() => {
    return currentMonthPayslips
      .filter(p => p.paymentStatus === 'UNPAID')
      .reduce((acc, curr) => acc + curr.netPayable, 0);
  }, [currentMonthPayslips]);

  // Designation and Department Labels
  const designationLabels: Record<StaffDesignation, { bn: string; en: string }> = {
    BRANCH_MANAGER: { bn: 'শাখা ব্যবস্থাপক', en: 'Branch Manager' },
    ASSISTANT_MANAGER: { bn: 'সহকারী ব্যবস্থাপক', en: 'Assistant Manager' },
    ACCOUNTANT: { bn: 'প্রধান হিসাবরক্ষক', en: 'Accountant' },
    CASHIER: { bn: 'ক্যাশিয়ার', en: 'Cashier' },
    FIELD_SUPERVISOR: { bn: 'মাঠ সুপারভাইজার', en: 'Field Supervisor' },
    LOAN_OFFICER: { bn: 'ঋণ কর্মকর্তা', en: 'Loan Officer' },
    FIELD_COLLECTOR: { bn: 'মাঠ কালেকশন অফিসার', en: 'Field Collector' },
    OFFICE_ASSISTANT: { bn: 'অফিস সহকারী', en: 'Office Assistant' },
    SECURITY_GUARD: { bn: 'নিরাপত্তা প্রহরী', en: 'Security Guard' }
  };

  const departmentLabels: Record<StaffDepartment, { bn: string; en: string }> = {
    ADMINISTRATION: { bn: 'সাধারণ প্রশাসন', en: 'Administration' },
    ACCOUNTS_FINANCE: { bn: 'হিসাব ও অর্থ', en: 'Accounts & Finance' },
    FIELD_OPERATIONS: { bn: 'ফিল্ড অপারেশনস', en: 'Field Operations' },
    IT_SYSTEMS: { bn: 'আইটি ও সিস্টেমস', en: 'IT Systems' },
    CUSTOMER_SERVICE: { bn: 'গ্রাহক সেবা', en: 'Customer Service' }
  };

  // Handle Save Staff
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.nameBn || !empForm.phone || empForm.basicSalary <= 0) {
      showFeedback('অনুগ্রহ করে নাম, ফোন এবং মূল বেতন সঠিক দিন', 'error');
      return;
    }

    try {
      if (editingStaff) {
        updateStaffEmployee(editingStaff.id, empForm);
        showFeedback('কর্মকর্তার তথ্য সফলভাবে আপডেট করা হয়েছে!');
      } else {
        createStaffEmployee(empForm);
        showFeedback('নতুন কর্মকর্তা/কর্মচারী সফলভাবে যোগ করা হয়েছে!');
      }
      setIsAddStaffOpen(false);
      setEditingStaff(null);
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'ত্রুটি ঘটেছে', 'error');
    }
  };

  // Handle Quick Attendance Change
  const handleAttendanceChange = (employeeId: string, status: AttendanceStatus) => {
    try {
      recordStaffAttendance({
        employeeId,
        date: attendanceDate,
        status,
        inTime: status === 'PRESENT' || status === 'LATE' ? '09:00' : undefined,
        outTime: status === 'PRESENT' || status === 'LATE' ? '17:00' : undefined,
        lateMinutes: status === 'LATE' ? 30 : 0
      });
      showFeedback('হাজিরা স্ট্যাটাস আপডেট হয়েছে!');
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'হাজিরা রেকর্ড ব্যর্থ', 'error');
    }
  };

  // Bulk All Present
  const handleMarkAllPresent = () => {
    const records = activeStaffList.map(e => ({
      employeeId: e.id,
      status: 'PRESENT' as AttendanceStatus,
      inTime: '09:00',
      outTime: '17:00'
    }));
    bulkRecordStaffAttendance(attendanceDate, records);
    showFeedback(`${records.length} জন কর্মীকে উপস্থিত হিসেবে মার্ক করা হয়েছে!`);
  };

  // Handle Generate Payroll
  const handleGeneratePayroll = () => {
    try {
      const generated = generateMonthlyPayroll(payrollMonth);
      showFeedback(`${payrollMonth} মাসের পে-রোল জেনারেট সম্পন্ন! (${generated.length} জন কর্মী)`);
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'পে-রোল জেনারেশন ত্রুটি', 'error');
    }
  };

  // Handle Disburse Payslip
  const handleDisbursePayslip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayslipForDisburse) return;

    try {
      disburseStaffPayslip(selectedPayslipForDisburse.id, {
        paymentMethod: disburseForm.paymentMethod,
        disbursementAccount: disburseForm.disbursementAccount,
        bonus: Number(disburseForm.bonus) || 0,
        remarks: disburseForm.remarks
      });
      showFeedback('বেতন সফলভাবে পরিশোধিত হয়েছে এবং অ্যাকাউন্টিং ডেবিট ভাউচার তৈরি হয়েছে!');
      setIsDisburseModalOpen(false);
      setSelectedPayslipForDisburse(null);
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'বেতন পরিশোধ ব্যর্থ', 'error');
    }
  };

  // Handle Bulk Disburse
  const handleBulkDisburse = () => {
    if (!confirm(`${payrollMonth} মাসের সকল অপরিশোধিত কর্মীর বেতন পরিশোধ করতে চান? এটি ক্যাশ/ব্যাংক লেজারে ভাউচার তৈরি করবে।`)) {
      return;
    }
    try {
      const res = bulkDisburseMonthlyPayroll(payrollMonth, {
        paymentMethod: 'BANK_TRANSFER',
        disbursementAccount: '১০২০: সোনালী ব্যাংক চলতি হিসাব'
      });
      showFeedback(`মোট ${res.count} জনের বেতন (৳${res.totalDisbursed.toLocaleString()}) এক ক্লিকে পরিশোধিত হয়েছে!`);
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'বাল্ক ডিসবার্স ত্রুটি', 'error');
    }
  };

  // Handle Request Advance
  const handleSaveAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advForm.employeeId || advForm.amount <= 0) {
      showFeedback('সঠিক কর্মী ও অগ্রিম পরিমাণ নির্বাচন করুন', 'error');
      return;
    }
    try {
      requestStaffAdvance(advForm);
      showFeedback('অগ্রিম বেতন অনুমোদন ও প্রদান সম্পন্ন হয়েছে এবং ক্যাশ ভাউচার তৈরি হয়েছে!');
      setIsAdvanceModalOpen(false);
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'অগ্রিম প্রক্রিয়াকরণ ব্যর্থ', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
            : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span className="text-sm font-semibold">{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>মডিউল ৭: স্টাফ পেরোল ও এইচআর ব্যবস্থাপনা (Enterprise HR Suite)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              স্টাফ পে-রোল, উপস্থিতি ও এইচআর ডিরেক্টরি
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              কর্মকর্তা-কর্মচারী কেওয়াইসি, ডিজিটাল হাজিরা পাঞ্চ, অগ্রিম বেতন সমন্বয়, স্বয়ংক্রিয় মাসিক পে-রোল জেনারেশন এবং লেজারের সাথে লিংকড ডেবিট ভাউচার পে-স্লিপ ইঞ্জিন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditingStaff(null);
                setEmpForm({
                  nameBn: '',
                  nameEn: '',
                  phone: '',
                  email: '',
                  nid: '',
                  gender: 'MALE',
                  designation: 'FIELD_SUPERVISOR',
                  department: 'FIELD_OPERATIONS',
                  joiningDate: new Date().toISOString().split('T')[0],
                  basicSalary: 18000,
                  houseRentAllowance: 7000,
                  medicalAllowance: 2000,
                  conveyanceAllowance: 3000,
                  mobileInternetAllowance: 1000,
                  providentFundDeduction: 1800,
                  taxDeduction: 0,
                  paymentMethod: 'BANK_TRANSFER',
                  bankName: 'সোনালী ব্যাংক পিএলসি',
                  bankBranch: '',
                  bankAccountNo: '',
                  bankRoutingNo: '',
                  mfsNumber: '',
                  presentAddress: '',
                  permanentAddress: '',
                  emergencyContactName: '',
                  emergencyContactPhone: '',
                  emergencyContactRelation: '',
                  bloodGroup: 'B+',
                  notes: ''
                });
                setIsAddStaffOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন স্টাফ যুক্ত করুন</span>
            </button>

            <button
              onClick={() => setIsAdvanceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>অগ্রিম বেতন অনুমোদন</span>
            </button>
          </div>
        </div>

        {/* HR KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>সক্রিয় কর্মকর্তা-কর্মচারী</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {activeStaffList.length} <span className="text-xs text-slate-400 font-normal">জন</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">১০০% সক্রিয় ও নিযুক্ত</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>মাসিক মোট বেতন বাজেট</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              ৳{totalMonthlyPayrollBudget.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">মূল বেতন + ৪টি ভাতা</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>বকেয়া অগ্রিম ঋণ স্থিতি</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              ৳{totalAdvancesOutstanding.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">বেতন থেকে মাসিক কর্তনযোগ্য</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>চলতি মাস পরিশোধিত বেতন</span>
              <Receipt className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
              ৳{totalPayrollDisbursed.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">বাকি: ৳{totalPayrollUnpaid.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: 'এইচআর সারসংক্ষেপ', icon: Sparkles },
          { id: 'DIRECTORY', label: `স্টাফ ডিরেক্টরি (${staffEmployees.length})`, icon: Users },
          { id: 'ATTENDANCE', label: 'দৈনিক হাজিরা পাঞ্চ', icon: CalendarCheck },
          { id: 'ADVANCES', label: `অগ্রিম বেতন (${staffAdvanceSalaries.length})`, icon: Wallet },
          { id: 'PAYROLL', label: `মাসিক পে-রোল শিট (${currentMonthPayslips.length})`, icon: Receipt },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Staff Directory Preview */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>কর্মকর্তা-কর্মচারী তালিকা</span>
                  </h3>
                  <p className="text-xs text-slate-400">পদবী, ডিপার্টমেন্ট ও যোগাযোগ</p>
                </div>
                <button
                  onClick={() => setActiveTab('DIRECTORY')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>সব দেখুন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {staffEmployees.slice(0, 4).map(emp => (
                  <div key={emp.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 text-sm">
                        {emp.nameBn.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{emp.nameBn}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                            {emp.employeeCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{designationLabels[emp.designation]?.bn || emp.designation}</span>
                          <span>•</span>
                          <span>{departmentLabels[emp.department]?.bn || emp.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        ৳{emp.grossSalary.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">মোট মাসিক বেতন</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>ডিপার্টমেন্টভিত্তিক মানবসম্পদ বণ্টন</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(departmentLabels).map(([key, label]) => {
                  const count = staffEmployees.filter(e => e.department === key).length;
                  const totalSal = staffEmployees
                    .filter(e => e.department === key)
                    .reduce((a, c) => a + c.grossSalary, 0);
                  return (
                    <div key={key} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                      <div className="text-xs font-bold text-slate-300">{label.bn}</div>
                      <div className="text-lg font-black text-indigo-400">{count} জন কর্মী</div>
                      <div className="text-[11px] text-slate-400 font-mono">৳{totalSal.toLocaleString()} /মাস</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Quick Actions & Today Attendance */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>আজকের উপস্থিতি সংক্ষেপ</span>
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300">আজ উপস্থিত কর্মী</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {staffAttendances.filter(a => a.date === attendanceDate && (a.status === 'PRESENT' || a.status === 'LATE')).length} জন
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300">ছুটি / অনুপস্থিত</span>
                  <span className="text-sm font-bold text-amber-400">
                    {staffAttendances.filter(a => a.date === attendanceDate && (a.status === 'ABSENT' || a.status.startsWith('LEAVE'))).length} জন
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('ATTENDANCE')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                ডিজিটাল হাজিরা খাতা খুলুন
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>পে-রোল কুইক অ্যাকশন</span>
              </h3>
              <p className="text-xs text-slate-400">
                এক ক্লিকে সকল কর্মীর মাসিক বেতন হিসাব করুন এবং অ্যাকাউন্টিং লেজারে ডেবিট ভাউচার তৈরি করুন।
              </p>
              <button
                onClick={() => {
                  setActiveTab('PAYROLL');
                  handleGeneratePayroll();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                চলতি মাসের পে-রোল শিট প্রস্তুত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex-1 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="নাম, কোড অথবা মোবাইল নম্বর দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="ALL">সকল ডিপার্টমেন্ট</option>
                {Object.entries(departmentLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v.bn}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="ACTIVE">সক্রিয় (Active)</option>
                <option value="ON_LEAVE">ছুটিতে (On Leave)</option>
                <option value="RESIGNED">অব্যাহতিপ্রাপ্ত (Resigned)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingStaff(null);
                setIsAddStaffOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কর্মী যোগ</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">কর্মকর্তা / কোড</th>
                    <th className="p-3.5">পদবী ও বিভাগ</th>
                    <th className="p-3.5">যোগদানের তারিখ</th>
                    <th className="p-3.5">মূল বেতন</th>
                    <th className="p-3.5">মোট মাসিক বেতন</th>
                    <th className="p-3.5">পরিশোধের মাধ্যম</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        কোনো কর্মকর্তা-কর্মচারী পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{emp.nameBn}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp.employeeCode} • {emp.phone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">
                            {designationLabels[emp.designation]?.bn || emp.designation}
                          </div>
                          <div className="text-[11px] text-indigo-400">
                            {departmentLabels[emp.department]?.bn || emp.department}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {emp.joiningDate}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">
                          ৳{emp.basicSalary.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                          ৳{emp.grossSalary.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                            {emp.paymentMethod}
                          </span>
                          {emp.bankAccountNo && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.bankName}</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {emp.status === 'ACTIVE' ? 'সক্রিয়' : emp.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingStaff(emp);
                                setEmpForm({
                                  nameBn: emp.nameBn,
                                  nameEn: emp.nameEn,
                                  phone: emp.phone,
                                  email: emp.email || '',
                                  nid: emp.nid,
                                  gender: emp.gender,
                                  designation: emp.designation,
                                  department: emp.department,
                                  joiningDate: emp.joiningDate,
                                  basicSalary: emp.basicSalary,
                                  houseRentAllowance: emp.houseRentAllowance,
                                  medicalAllowance: emp.medicalAllowance,
                                  conveyanceAllowance: emp.conveyanceAllowance,
                                  mobileInternetAllowance: emp.mobileInternetAllowance,
                                  providentFundDeduction: emp.providentFundDeduction,
                                  taxDeduction: emp.taxDeduction,
                                  paymentMethod: emp.paymentMethod,
                                  bankName: emp.bankName || '',
                                  bankBranch: emp.bankBranch || '',
                                  bankAccountNo: emp.bankAccountNo || '',
                                  bankRoutingNo: emp.bankRoutingNo || '',
                                  mfsNumber: emp.mfsNumber || '',
                                  presentAddress: emp.presentAddress,
                                  permanentAddress: emp.permanentAddress,
                                  emergencyContactName: emp.emergencyContactName,
                                  emergencyContactPhone: emp.emergencyContactPhone,
                                  emergencyContactRelation: emp.emergencyContactRelation,
                                  bloodGroup: emp.bloodGroup || 'B+',
                                  notes: emp.notes || ''
                                });
                                setIsAddStaffOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition cursor-pointer"
                            >
                              সম্পাদনা
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          {/* Attendance Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <div>
                <label className="text-xs text-slate-400 block font-semibold">হাজিরা তারিখ নির্বাচন করুন</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>সবাইকে উপস্থিত মার্ক করুন</span>
              </button>
            </div>
          </div>

          {/* Attendance Sheet Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">কর্মকর্তা / কোড</th>
                    <th className="p-3.5">পদবী</th>
                    <th className="p-3.5">প্রবেশ / প্রস্থান সময়</th>
                    <th className="p-3.5">বর্তমান স্ট্যাটাস</th>
                    <th className="p-3.5 text-center">দ্রুত পাঞ্চ বোতাম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeStaffList.map(emp => {
                    const record = dateAttendanceMap.get(emp.id);
                    const currentStatus: AttendanceStatus = record ? record.status : 'ABSENT';

                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{emp.nameBn}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp.employeeCode}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-300">
                          {designationLabels[emp.designation]?.bn || emp.designation}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {record ? `${record.inTime || '০৯:০০'} - ${record.outTime || '১৭:০০'}` : 'পাঞ্চ করা হয়নি'}
                          {record?.lateMinutes && record.lateMinutes > 0 ? (
                            <span className="ml-2 text-rose-400 text-[10px]">({record.lateMinutes} মি. লেট)</span>
                          ) : null}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            currentStatus === 'PRESENT' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : currentStatus === 'LATE'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : currentStatus.startsWith('LEAVE')
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {currentStatus === 'PRESENT' ? 'উপস্থিত' :
                             currentStatus === 'LATE' ? 'বিলম্বিত' :
                             currentStatus.startsWith('LEAVE') ? 'ছুটি' : 'অনুপস্থিত'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                            <button
                              onClick={() => handleAttendanceChange(emp.id, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                currentStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              উপস্থিত
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(emp.id, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                currentStatus === 'LATE' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              বিলম্ব
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(emp.id, 'LEAVE_CASUAL')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                currentStatus.startsWith('LEAVE') ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              ছুটি
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(emp.id, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                currentStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              অনুপস্থিত
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADVANCES */}
      {activeTab === 'ADVANCES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>কর্মকর্তা-কর্মচারীদের অগ্রিম বেতন খতিয়ান</span>
              </h3>
              <p className="text-xs text-slate-400">
                অগ্রিম বেতন অনুমোদন, বিতরণ এবং মাসিক বেতন শিট থেকে স্বয়ংক্রিয় কিস্তি কর্তন শিডিউল
              </p>
            </div>
            <button
              onClick={() => setIsAdvanceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>অগ্রিম বেতন অনুমোদন</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">অগ্রিম নং</th>
                    <th className="p-3.5">কর্মী / কোড</th>
                    <th className="p-3.5">আবেদনের তারিখ</th>
                    <th className="p-3.5">মোট অগ্রিম</th>
                    <th className="p-3.5">মাসিক কর্তন</th>
                    <th className="p-3.5">অবশিষ্ট দেনা</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5">কারণ ও ভাউচার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staffAdvanceSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        কোনো অগ্রিম বেতনের আবেদন বা রেকর্ড নেই।
                      </td>
                    </tr>
                  ) : (
                    staffAdvanceSalaries.map(adv => (
                      <tr key={adv.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5 font-bold text-white font-mono">{adv.advanceNo}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{adv.employeeNameBn}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{adv.employeeCode}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{adv.requestDate}</td>
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          ৳{adv.amount.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">
                          ৳{adv.monthlyDeductionAmount.toLocaleString()} /মাস ({adv.repaymentMonths} কিস্তি)
                        </td>
                        <td className="p-3.5 font-mono font-bold text-rose-400">
                          ৳{adv.remainingBalance.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            adv.status === 'REPAID' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {adv.status === 'REPAID' ? 'সম্পূর্ণ পরিশোধিত' : 'চলমান (Active)'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="text-[11px] text-slate-300 truncate max-w-[200px]">{adv.purpose}</div>
                          {adv.disbursedVoucherNo && (
                            <div className="text-[10px] text-indigo-400 font-mono">{adv.disbursedVoucherNo}</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYROLL PROCESSING */}
      {activeTab === 'PAYROLL' && (
        <div className="space-y-4">
          {/* Payroll Month Picker & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-indigo-400" />
              <div>
                <label className="text-xs text-slate-400 block font-semibold">পে-রোল মাস নির্বাচন করুন</label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={e => setPayrollMonth(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGeneratePayroll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>পে-রোল শীট জেনারেট করুন</span>
              </button>

              {currentMonthPayslips.some(p => p.paymentStatus === 'UNPAID') && (
                <button
                  onClick={handleBulkDisburse}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>সকলের বেতন ১-ক্লিকে পরিশোধ করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Payslips Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">পে-স্লিপ নং</th>
                    <th className="p-3.5">কর্মী ও পদবী</th>
                    <th className="p-3.5">মোট উপার্জন</th>
                    <th className="p-3.5">পিএফ ও ট্যাক্স</th>
                    <th className="p-3.5">অগ্রিম কর্তন</th>
                    <th className="p-3.5">নিট প্রদেয়</th>
                    <th className="p-3.5">স্ট্যাটাস ও ভাউচার</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentMonthPayslips.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        {payrollMonth} মাসের কোনো পে-রোল তৈরি করা হয়নি। &apos;পে-রোল শীট জেনারেট করুন&apos; বাটনে ক্লিক করুন।
                      </td>
                    </tr>
                  ) : (
                    currentMonthPayslips.map(payslip => (
                      <tr key={payslip.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5 font-bold text-white font-mono">{payslip.payslipNo}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{payslip.employeeNameBn}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {payslip.employeeCode} • {designationLabels[payslip.designation]?.bn || payslip.designation}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          ৳{payslip.totalEarnings.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          ৳{(payslip.providentFund + payslip.tax).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-amber-400">
                          ৳{payslip.advanceSalaryDeduction.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono font-black text-cyan-400 text-sm">
                          ৳{payslip.netPayable.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            payslip.paymentStatus === 'PAID' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {payslip.paymentStatus === 'PAID' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                          </span>
                          {payslip.voucherNo && (
                            <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{payslip.voucherNo}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {payslip.paymentStatus === 'UNPAID' ? (
                              <button
                                onClick={() => {
                                  setSelectedPayslipForDisburse(payslip);
                                  setIsDisburseModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer"
                              >
                                বেতন দিন
                              </button>
                            ) : (
                              <button
                                onClick={() => setPrintPayslip(payslip)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                                <span>পে-স্লিপ প্রিন্ট</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: ADD / EDIT STAFF MODAL */}
      {/* ==================================================== */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>{editingStaff ? 'কর্মকর্তার তথ্য সম্পাদনা' : 'নতুন কর্মকর্তা/কর্মচারী অন্তর্ভুক্তি'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">কেওয়াইসি, পদবী এবং মাসিক বেতন কাঠামো নির্ধারণ</p>
              </div>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">পূর্ণ নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.nameBn}
                    onChange={e => setEmpForm({ ...empForm, nameBn: e.target.value })}
                    placeholder="উদাঃ মোঃ আব্দুল করিম"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={empForm.nameEn}
                    onChange={e => setEmpForm({ ...empForm, nameEn: e.target.value })}
                    placeholder="e.g. Md. Abdul Karim"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={empForm.phone}
                    onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">জাতীয় পরিচয়পত্র (NID) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.nid}
                    onChange={e => setEmpForm({ ...empForm, nid: e.target.value })}
                    placeholder="১০ অথবা ১৭ ডিজিট"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">যোগদানের তারিখ</label>
                  <input
                    type="date"
                    value={empForm.joiningDate}
                    onChange={e => setEmpForm({ ...empForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">পদবী (Designation) *</label>
                  <select
                    value={empForm.designation}
                    onChange={e => setEmpForm({ ...empForm, designation: e.target.value as StaffDesignation })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {Object.entries(designationLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v.bn} ({v.en})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">বিভাগ (Department) *</label>
                  <select
                    value={empForm.department}
                    onChange={e => setEmpForm({ ...empForm, department: e.target.value as StaffDepartment })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {Object.entries(departmentLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v.bn}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Salary Structure Box */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>মাসিক বেতন ও ভাতা কাঠামো (BDT)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">মূল বেতন (Basic) *</label>
                    <input
                      type="number"
                      required
                      value={empForm.basicSalary}
                      onChange={e => setEmpForm({ ...empForm, basicSalary: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">বাড়ি ভাড়া ভাতা</label>
                    <input
                      type="number"
                      value={empForm.houseRentAllowance}
                      onChange={e => setEmpForm({ ...empForm, houseRentAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">চিকিৎসা ভাতা</label>
                    <input
                      type="number"
                      value={empForm.medicalAllowance}
                      onChange={e => setEmpForm({ ...empForm, medicalAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">যাতায়াত ভাতা</label>
                    <input
                      type="number"
                      value={empForm.conveyanceAllowance}
                      onChange={e => setEmpForm({ ...empForm, conveyanceAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">মোবাইল ও নেট</label>
                    <input
                      type="number"
                      value={empForm.mobileInternetAllowance}
                      onChange={e => setEmpForm({ ...empForm, mobileInternetAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300">মোট গ্রস বেতন (Gross Salary):</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ৳{(empForm.basicSalary + empForm.houseRentAllowance + empForm.medicalAllowance + empForm.conveyanceAllowance + empForm.mobileInternetAllowance).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bank / Payment Method Box */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>বেতন পরিশোধ মাধ্যম ও ব্যাংক হিসাব</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">পেমেন্ট মাধ্যম</label>
                    <select
                      value={empForm.paymentMethod}
                      onChange={e => setEmpForm({ ...empForm, paymentMethod: e.target.value as SalaryPaymentMethod })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার (BEFTN/NPSB)</option>
                      <option value="CASH">ক্যাশ / হাতে নগদ</option>
                      <option value="BKASH">বিকাশ পার্সোনাল/মার্চেন্ট</option>
                      <option value="NAGAD">নগদ</option>
                      <option value="ROCKET">রকেট</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ব্যাংকের নাম</label>
                    <input
                      type="text"
                      value={empForm.bankName}
                      onChange={e => setEmpForm({ ...empForm, bankName: e.target.value })}
                      placeholder="সোনালী / ইসলামী ব্যাংক"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">অ্যাকাউন্ট নং / MFS নম্বর</label>
                    <input
                      type="text"
                      value={empForm.bankAccountNo}
                      onChange={e => setEmpForm({ ...empForm, bankAccountNo: e.target.value })}
                      placeholder="হিসাব নম্বর"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingStaff ? 'তথ্য সংরক্ষণ করুন' : 'কর্মী যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ADVANCE SALARY REQUEST & APPROVAL MODAL */}
      {/* ==================================================== */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>অগ্রিম বেতন অনুমোদন ও প্রদান</span>
              </h3>
              <button onClick={() => setIsAdvanceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdvance} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">কর্মী নির্বাচন করুন *</label>
                <select
                  required
                  value={advForm.employeeId}
                  onChange={e => setAdvForm({ ...advForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {activeStaffList.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nameBn} ({emp.employeeCode}) - মূল বেতন: ৳{emp.basicSalary.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">অগ্রিম টাকার পরিমাণ (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={advForm.amount}
                    onChange={e => setAdvForm({ ...advForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">কর্তন মেয়াদ (মাস) *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={advForm.repaymentMonths}
                    onChange={e => setAdvForm({ ...advForm, repaymentMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>মাসিক বেতন থেকে কর্তন হবে:</span>
                </div>
                <div className="text-sm font-black font-mono">
                  ৳{Math.ceil(advForm.amount / Math.max(1, advForm.repaymentMonths)).toLocaleString()} /মাস
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">অগ্রিম গ্রহণের কারণ</label>
                <textarea
                  rows={2}
                  value={advForm.purpose}
                  onChange={e => setAdvForm({ ...advForm, purpose: e.target.value })}
                  placeholder="উদাঃ পারিবারিক জরুরি চিকিৎসা ব্যয়"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30"
                >
                  অগ্রিম অনুমোদন ও ভাউচার তৈরি
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: DISBURSE PAYSLIP MODAL */}
      {/* ==================================================== */}
      {isDisburseModalOpen && selectedPayslipForDisburse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>বেতন পরিশোধ ও ভাউচার নিশ্চিতকরণ</span>
                </h3>
                <p className="text-xs text-slate-400">{selectedPayslipForDisburse.employeeNameBn} ({selectedPayslipForDisburse.salaryMonthBn})</p>
              </div>
              <button onClick={() => setIsDisburseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisbursePayslip} className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>মোট উপার্জন:</span>
                  <span className="font-mono text-white">৳{selectedPayslipForDisburse.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>পিএফ ও ট্যাক্স কর্তন:</span>
                  <span className="font-mono text-rose-400">- ৳{(selectedPayslipForDisburse.providentFund + selectedPayslipForDisburse.tax).toLocaleString()}</span>
                </div>
                {selectedPayslipForDisburse.advanceSalaryDeduction > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>অগ্রিম বেতন কর্তন:</span>
                    <span className="font-mono text-amber-400">- ৳{selectedPayslipForDisburse.advanceSalaryDeduction.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">নিট প্রদেয় বেতন:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ৳{(selectedPayslipForDisburse.netPayable + (Number(disburseForm.bonus) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">পরিশোধের মাধ্যম *</label>
                <select
                  value={disburseForm.paymentMethod}
                  onChange={e => setDisburseForm({ ...disburseForm, paymentMethod: e.target.value as SalaryPaymentMethod })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার (BEFTN/NPSB)</option>
                  <option value="CASH">ক্যাশ / হাতে নগদ</option>
                  <option value="BKASH">বিকাশ</option>
                  <option value="NAGAD">নগদ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">হিসাব খাতা (General Ledger Account) *</label>
                <select
                  value={disburseForm.disbursementAccount}
                  onChange={e => setDisburseForm({ ...disburseForm, disbursementAccount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                >
                  <option value="১০২০: সোনালী ব্যাংক চলতি হিসাব">১০২০: সোনালী ব্যাংক চলতি হিসাব</option>
                  <option value="১০১০: হাতে নগদ ক্যাশ">১০১০: হাতে নগদ ক্যাশ</option>
                  <option value="১০৩০: ইসলামী ব্যাংক সঞ্চয়ী হিসাব">১০৩০: ইসলামী ব্যাংক সঞ্চয়ী হিসাব</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">অতিরিক্ত বোনাস / ইনসেনটিভ (ঐচ্ছিক)</label>
                <input
                  type="number"
                  min="0"
                  value={disburseForm.bonus}
                  onChange={e => setDisburseForm({ ...disburseForm, bonus: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDisburseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
                >
                  বেতন পরিশোধ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: PRINTABLE PAYSLIP MODAL */}
      {/* ==================================================== */}
      {printPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                  SP
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{activeTenant?.nameBn || letterhead.samityNameBn}</h2>
                  <p className="text-xs text-slate-500">{activeTenant?.address || letterhead.addressBn}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>মুদ্রণ করুন</span>
                </button>
                <button onClick={() => setPrintPayslip(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Payslip Title Bar */}
            <div className="text-center bg-slate-100 py-2 rounded-xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                কর্মকর্তা-কর্মচারী ডিজিটাল বেতন রসিদ (PAYSLIP)
              </h3>
              <div className="text-xs text-slate-500 font-semibold">{printPayslip.salaryMonthBn}</div>
            </div>

            {/* Employee Meta Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">নাম:</span> <strong className="text-slate-900">{printPayslip.employeeNameBn}</strong>
              </div>
              <div>
                <span className="text-slate-500">স্টাফ আইডি:</span> <strong className="font-mono text-slate-900">{printPayslip.employeeCode}</strong>
              </div>
              <div>
                <span className="text-slate-500">পদবী:</span> <strong className="text-slate-900">{designationLabels[printPayslip.designation]?.bn}</strong>
              </div>
              <div>
                <span className="text-slate-500">বিভাগ:</span> <strong className="text-slate-900">{departmentLabels[printPayslip.department]?.bn}</strong>
              </div>
              <div>
                <span className="text-slate-500">পরিশোধের তারিখ:</span> <strong className="font-mono text-slate-900">{printPayslip.paymentDate}</strong>
              </div>
              <div>
                <span className="text-slate-500">ভাউচার নম্বর:</span> <strong className="font-mono text-emerald-700">{printPayslip.voucherNo}</strong>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800">উপার্জন (Earnings)</div>
                <div className="p-3 space-y-1.5 divide-y divide-slate-100">
                  <div className="flex justify-between py-1"><span>মূল বেতন (Basic)</span><strong className="font-mono">৳{printPayslip.basicSalary.toLocaleString()}</strong></div>
                  <div className="flex justify-between py-1"><span>বাড়ি ভাড়া</span><strong className="font-mono">৳{printPayslip.houseRent.toLocaleString()}</strong></div>
                  <div className="flex justify-between py-1"><span>চিকিৎসা ভাতা</span><strong className="font-mono">৳{printPayslip.medical.toLocaleString()}</strong></div>
                  <div className="flex justify-between py-1"><span>যাতায়াত ও মোবাইল</span><strong className="font-mono">৳{(printPayslip.conveyance + printPayslip.mobileInternet).toLocaleString()}</strong></div>
                  {printPayslip.performanceBonus > 0 && (
                    <div className="flex justify-between py-1 text-emerald-600"><span>পারফরম্যান্স বোনাস</span><strong className="font-mono">+ ৳{printPayslip.performanceBonus.toLocaleString()}</strong></div>
                  )}
                  <div className="flex justify-between pt-2 font-bold border-t border-slate-300">
                    <span>মোট উপার্জন</span>
                    <strong className="font-mono text-emerald-600">৳{printPayslip.totalEarnings.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800">কর্তন (Deductions)</div>
                <div className="p-3 space-y-1.5 divide-y divide-slate-100">
                  <div className="flex justify-between py-1"><span>ভবিষ্য তহবিল (PF)</span><strong className="font-mono">৳{printPayslip.providentFund.toLocaleString()}</strong></div>
                  <div className="flex justify-between py-1"><span>আয়কর (Tax)</span><strong className="font-mono">৳{printPayslip.tax.toLocaleString()}</strong></div>
                  <div className="flex justify-between py-1"><span>অগ্রিম বেতন সমন্বয়</span><strong className="font-mono">৳{printPayslip.advanceSalaryDeduction.toLocaleString()}</strong></div>
                  <div className="flex justify-between py-1"><span>অনুপস্থিতি/বিলম্ব কর্তন</span><strong className="font-mono">৳{(printPayslip.unpaidLeaveDeduction + printPayslip.lateFineDeduction).toLocaleString()}</strong></div>
                  <div className="flex justify-between pt-2 font-bold border-t border-slate-300">
                    <span>মোট কর্তন</span>
                    <strong className="font-mono text-rose-600">৳{printPayslip.totalDeductions.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Amount Banner */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600 font-semibold">নিট প্রদেয় বেতন (Net Payable):</div>
                <div className="text-2xl font-black text-emerald-700 font-mono">৳{printPayslip.netPayable.toLocaleString()}</div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <div>পরিশোধ মাধ্যম: <strong>{printPayslip.paymentMethod}</strong></div>
                <div>অ্যাকাউন্ট: <strong>{printPayslip.disbursementAccount}</strong></div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-3 gap-8 pt-8 text-center text-xs text-slate-600">
              <div className="border-t border-slate-400 pt-1">
                <span>হিসাবরক্ষক</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span>শাখা ব্যবস্থাপক</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span>গ্রহীতার স্বাক্ষর</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
