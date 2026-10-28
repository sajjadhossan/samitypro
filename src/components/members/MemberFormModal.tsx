'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Check, Upload, User, ShieldCheck, Heart, 
  MapPin, Phone, Mail, Award, DollarSign, Users, AlertCircle 
} from 'lucide-react';
import { Member, Tenant, MemberCategory, MemberStatus, Gender } from '@/types';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: any) => void;
  initialMember?: Member | null;
  activeTenant: Tenant;
  totalMembersCount: number;
}

export function MemberFormModal({
  isOpen,
  onClose,
  onSave,
  initialMember,
  activeTenant,
  totalMembersCount
}: MemberFormModalProps) {
  const isEdit = !!initialMember;

  const defaultMemberCode = initialMember?.memberCode || `MEM-${String(totalMembersCount + 1).padStart(3, '0')}`;

  const [activeTab, setActiveTab] = useState<'BASIC' | 'CONTACT' | 'KYC' | 'SAMITY' | 'NOMINEE'>('BASIC');
  const [photoPreview, setPhotoPreview] = useState<string>(initialMember?.photoUrl || '');
  const [nidPreview, setNidPreview] = useState<string>(initialMember?.nidDocumentUrl || '');
  const [isSameAddress, setIsSameAddress] = useState<boolean>(initialMember?.isSameAddress || false);

  const [formData, setFormData] = useState({
    memberCode: defaultMemberCode,
    nameBn: '',
    nameEn: '',
    fatherHusbandName: '',
    motherName: '',
    spouseName: '',
    phone: '',
    whatsappNumber: '',
    alternatePhone: '',
    email: '',
    nid: '',
    nidType: 'SMART_NID' as 'SMART_NID' | 'OLD_NID' | 'BIRTH_CERTIFICATE' | 'PASSPORT',
    birthRegistrationNo: '',
    dateOfBirth: '1990-01-01',
    age: 36,
    gender: 'MALE' as Gender,
    bloodGroup: 'B+',
    religion: 'ISLAM' as 'ISLAM' | 'HINDUISM' | 'BUDDHISM' | 'CHRISTIANITY' | 'OTHER',
    maritalStatus: 'MARRIED' as 'MARRIED' | 'UNMARRIED' | 'WIDOWED' | 'DIVORCED',
    occupation: 'ব্যবসায়ী',
    education: 'এইচএসসি / স্নাতক',
    designation: 'সাধারণ সদস্য',
    category: 'GENERAL' as MemberCategory,
    status: 'ACTIVE' as MemberStatus,
    admissionDate: '2026-10-25',
    admissionFee: 1000,
    monthlySubscriptionAmount: activeTenant.settings?.monthlySavingsPerMember || activeTenant.monthlySubscriptionAmount || 1500,
    sharesHeld: 10,
    shareValue: 10000,
    presentAddress: '',
    presentDivision: 'ঢাকা',
    presentDistrict: 'ঢাকা',
    presentUpazila: 'রামপুরা',
    permanentAddress: '',
    permanentDivision: 'ঢাকা',
    permanentDistrict: 'ঢাকা',
    permanentUpazila: 'রামপুরা',
    nomineeName: '',
    nomineeRelation: 'স্ত্রী',
    nomineeNid: '',
    nomineePhone: '',
    nomineeShare: 100,
    nomineeAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'ভাই / বন্ধু'
  });

  useEffect(() => {
    if (initialMember) {
      setFormData({
        memberCode: initialMember.memberCode,
        nameBn: initialMember.nameBn,
        nameEn: initialMember.nameEn,
        fatherHusbandName: initialMember.fatherHusbandName || '',
        motherName: initialMember.motherName || '',
        spouseName: initialMember.spouseName || '',
        phone: initialMember.phone,
        whatsappNumber: initialMember.whatsappNumber || initialMember.phone,
        alternatePhone: initialMember.alternatePhone || '',
        email: initialMember.email || '',
        nid: initialMember.nid,
        nidType: initialMember.nidType || 'SMART_NID',
        birthRegistrationNo: initialMember.birthRegistrationNo || '',
        dateOfBirth: initialMember.dateOfBirth,
        age: initialMember.age || 36,
        gender: initialMember.gender,
        bloodGroup: initialMember.bloodGroup || 'B+',
        religion: initialMember.religion || 'ISLAM',
        maritalStatus: initialMember.maritalStatus || 'MARRIED',
        occupation: initialMember.occupation || 'ব্যবসায়ী',
        education: initialMember.education || '',
        designation: initialMember.designation || 'সাধারণ সদস্য',
        category: initialMember.category,
        status: initialMember.status,
        admissionDate: initialMember.admissionDate,
        admissionFee: initialMember.admissionFee || 1000,
        monthlySubscriptionAmount: initialMember.monthlySubscriptionAmount || activeTenant.monthlySubscriptionAmount || 1500,
        sharesHeld: initialMember.sharesHeld || 10,
        shareValue: initialMember.shareValue || 10000,
        presentAddress: initialMember.presentAddress || '',
        presentDivision: initialMember.presentDivision || 'ঢাকা',
        presentDistrict: initialMember.presentDistrict || 'ঢাকা',
        presentUpazila: initialMember.presentUpazila || '',
        permanentAddress: initialMember.permanentAddress || '',
        permanentDivision: initialMember.permanentDivision || 'ঢাকা',
        permanentDistrict: initialMember.permanentDistrict || 'ঢাকা',
        permanentUpazila: initialMember.permanentUpazila || '',
        nomineeName: initialMember.nominee?.name || '',
        nomineeRelation: initialMember.nominee?.relation || 'স্ত্রী',
        nomineeNid: initialMember.nominee?.nidOrBirthCert || '',
        nomineePhone: initialMember.nominee?.phone || '',
        nomineeShare: initialMember.nominee?.sharePercentage || 100,
        nomineeAddress: initialMember.nominee?.address || '',
        emergencyContactName: initialMember.emergencyContactName || '',
        emergencyContactPhone: initialMember.emergencyContactPhone || '',
        emergencyContactRelation: initialMember.emergencyContactRelation || 'ভাই'
      });
      setPhotoPreview(initialMember.photoUrl || '');
      setNidPreview(initialMember.nidDocumentUrl || '');
      setIsSameAddress(initialMember.isSameAddress || false);
    }
  }, [initialMember, activeTenant]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNidUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNidPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn || !formData.phone || !formData.nid) {
      alert('দয়া করে সদস্যের নাম (বাংলা), মোবাইল নম্বর এবং জাতীয় পরিচয়পত্র নম্বর পূরণ করুন।');
      return;
    }

    const payload = {
      tenantId: activeTenant.id,
      memberCode: formData.memberCode,
      nameBn: formData.nameBn.trim(),
      nameEn: formData.nameEn.trim() || formData.nameBn.trim(),
      fatherHusbandName: formData.fatherHusbandName.trim(),
      motherName: formData.motherName.trim(),
      spouseName: formData.spouseName.trim(),
      phone: formData.phone.trim(),
      whatsappNumber: formData.whatsappNumber.trim() || formData.phone.trim(),
      alternatePhone: formData.alternatePhone.trim(),
      email: formData.email.trim(),
      nid: formData.nid.trim(),
      nidType: formData.nidType,
      birthRegistrationNo: formData.birthRegistrationNo.trim(),
      dateOfBirth: formData.dateOfBirth,
      age: Number(formData.age) || 35,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      religion: formData.religion,
      maritalStatus: formData.maritalStatus,
      occupation: formData.occupation.trim(),
      education: formData.education.trim(),
      designation: formData.designation.trim(),
      category: formData.category,
      status: formData.status,
      admissionDate: formData.admissionDate,
      admissionFee: Number(formData.admissionFee) || 1000,
      monthlySubscriptionAmount: Number(formData.monthlySubscriptionAmount) || 1500,
      sharesHeld: Number(formData.sharesHeld) || 10,
      shareValue: Number(formData.shareValue) || 10000,
      presentAddress: formData.presentAddress.trim(),
      presentDivision: formData.presentDivision,
      presentDistrict: formData.presentDistrict,
      presentUpazila: formData.presentUpazila,
      permanentAddress: isSameAddress ? formData.presentAddress.trim() : formData.permanentAddress.trim(),
      permanentDivision: isSameAddress ? formData.presentDivision : formData.permanentDivision,
      permanentDistrict: isSameAddress ? formData.presentDistrict : formData.permanentDistrict,
      permanentUpazila: isSameAddress ? formData.presentUpazila : formData.permanentUpazila,
      isSameAddress,
      photoUrl: photoPreview,
      nidDocumentUrl: nidPreview,
      nominee: {
        name: formData.nomineeName || 'মনোনীত ব্যক্তি',
        relation: formData.nomineeRelation || 'স্ত্রী',
        nidOrBirthCert: formData.nomineeNid || 'N/A',
        phone: formData.nomineePhone || formData.phone,
        sharePercentage: Number(formData.nomineeShare) || 100,
        address: formData.nomineeAddress
      },
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      emergencyContactRelation: formData.emergencyContactRelation
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isEdit ? 'সদস্য তথ্য সম্পাদনা (Edit Member Profile)' : 'নতুন সদস্য ভর্তি ও কেওয়াইসি (New Member KYC)'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeTenant.nameBn} • <span className="font-mono text-emerald-400">{formData.memberCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 border-b border-slate-800 text-xs shrink-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('BASIC')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'BASIC'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ১. পরিচয় ও মৌলিক
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONTACT')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'CONTACT'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ২. যোগাযোগ ও ঠিকানা
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('KYC')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'KYC'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ৩. কেওয়াইসি ও ফটো
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SAMITY')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'SAMITY'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ৪. সমিতি ও শেয়ার
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NOMINEE')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'NOMINEE'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ৫. নমিনী ও জরুরি
          </button>
        </div>

        {/* Savings-Only & Quota Status Notification */}
        {activeTenant.settings?.isSavingsOnlySamity && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">সঞ্চয় মডেল</span>
              <span>এটি শুধুমাত্র সঞ্চয় সমিতি (কোনো ঋণ নেই)। মাসিক সঞ্চয় জমা: <strong>৳{activeTenant.settings?.monthlySavingsPerMember || 2000}</strong></span>
            </div>
            {activeTenant.settings?.targetMemberCount && (
              <span className="text-[11px] bg-slate-900 px-2.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 font-mono">
                কোটা: {totalMembersCount}/{activeTenant.settings.targetMemberCount} জন
              </span>
            )}
          </div>
        )}

        {!isEdit && activeTenant.settings?.targetMemberCount && totalMembersCount >= activeTenant.settings.targetMemberCount && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>সতর্কতা: সমিতির নির্ধারিত সদস্য কোটা ({activeTenant.settings.targetMemberCount} জন) পূর্ণ হয়ে গেছে।</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 text-xs pr-1">
          
          {/* TAB 1: BASIC */}
          {activeTab === 'BASIC' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">সদস্য কোড / আইডি *</label>
                  <input
                    type="text"
                    required
                    value={formData.memberCode}
                    onChange={e => setFormData({ ...formData, memberCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">সদস্যের নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={e => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: মো: রফিকুল ইসলাম"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Name (in English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Md. Rafiqul Islam"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">পিতা / স্বামীর নাম</label>
                  <input
                    type="text"
                    value={formData.fatherHusbandName}
                    onChange={e => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">মাতার নাম</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">স্ত্রী / স্বামীর নাম (যদি থাকে)</label>
                  <input
                    type="text"
                    value={formData.spouseName}
                    onChange={e => setFormData({ ...formData, spouseName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">জন্ম তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">বয়স (বছর)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">লিঙ্গ</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="MALE">পুরুষ (Male)</option>
                    <option value="FEMALE">মহিলা (Female)</option>
                    <option value="OTHER">অন্যান্য (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">রক্তের গ্রুপ</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold text-rose-400 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="A+">A+ (পজিটিভ)</option>
                    <option value="A-">A- (নেগেটিভ)</option>
                    <option value="B+">B+ (পজিটিভ)</option>
                    <option value="B-">B- (নেগেটিভ)</option>
                    <option value="O+">O+ (পজিটিভ)</option>
                    <option value="O-">O- (নেগেটিভ)</option>
                    <option value="AB+">AB+ (পজিটিভ)</option>
                    <option value="AB-">AB- (নেগেটিভ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">পেশা</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">শিক্ষাগত যোগ্যতা</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={e => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">ধর্ম</label>
                  <select
                    value={formData.religion}
                    onChange={e => setFormData({ ...formData, religion: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ISLAM">ইসলাম</option>
                    <option value="HINDUISM">হিন্দু</option>
                    <option value="BUDDHISM">বৌদ্ধ</option>
                    <option value="CHRISTIANITY">খ্রিস্টান</option>
                    <option value="OTHER">অন্যান্য</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS */}
          {activeTab === 'CONTACT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+8801700000000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">হোয়াটসঅ্যাপ নম্বর</label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="ফাঁকা রাখলে মোবাইল নম্বর ব্যবহৃত হবে"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="member@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Present Address */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs font-semibold text-emerald-400">বর্তমান ঠিকানা (Present Address)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">বিভাগ</label>
                    <select
                      value={formData.presentDivision}
                      onChange={e => setFormData({ ...formData, presentDivision: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    >
                      <option value="ঢাকা">ঢাকা (Dhaka)</option>
                      <option value="চট্টগ্রাম">চট্টগ্রাম (Chattogram)</option>
                      <option value="রাজশাহী">রাজশাহী (Rajshahi)</option>
                      <option value="খুলনা">খুলনা (Khulna)</option>
                      <option value="বরিশাল">বরিশাল (Barishal)</option>
                      <option value="সিলেট">সিলেট (Sylhet)</option>
                      <option value="রংপুর">রংপুর (Rangpur)</option>
                      <option value="ময়মনসিংহ">ময়মনসিংহ (Mymensingh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">জেলা</label>
                    <input
                      type="text"
                      value={formData.presentDistrict}
                      onChange={e => setFormData({ ...formData, presentDistrict: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">উপজেলা / থানা</label>
                    <input
                      type="text"
                      value={formData.presentUpazila}
                      onChange={e => setFormData({ ...formData, presentUpazila: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">গ্রাম / রোড / বাড়ি / ফ্ল্যাট বিবরণ *</label>
                  <input
                    type="text"
                    required
                    value={formData.presentAddress}
                    onChange={e => setFormData({ ...formData, presentAddress: e.target.value })}
                    placeholder="যেমন: বাড়ি ১২, রোড ৩, ব্লক বি, বনশ্রী, রামপুরা, ঢাকা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200">স্থায়ী ঠিকানা (Permanent Address)</div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-emerald-400">
                    <input
                      type="checkbox"
                      checked={isSameAddress}
                      onChange={e => setIsSameAddress(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-400"
                    />
                    <span>বর্তমান ঠিকানার অনুরূপ</span>
                  </label>
                </div>

                {!isSameAddress && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">বিভাগ</label>
                        <select
                          value={formData.permanentDivision}
                          onChange={e => setFormData({ ...formData, permanentDivision: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                        >
                          <option value="ঢাকা">ঢাকা (Dhaka)</option>
                          <option value="চট্টগ্রাম">চট্টগ্রাম (Chattogram)</option>
                          <option value="রাজশাহী">রাজশাহী (Rajshahi)</option>
                          <option value="খুলনা">খুলনা (Khulna)</option>
                          <option value="বরিশাল">বরিশাল (Barishal)</option>
                          <option value="সিলেট">সিলেট (Sylhet)</option>
                          <option value="রংপুর">রংপুর (Rangpur)</option>
                          <option value="ময়মনসিংহ">ময়মনসিংহ (Mymensingh)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">জেলা</label>
                        <input
                          type="text"
                          value={formData.permanentDistrict}
                          onChange={e => setFormData({ ...formData, permanentDistrict: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">উপজেলা / থানা</label>
                        <input
                          type="text"
                          value={formData.permanentUpazila}
                          onChange={e => setFormData({ ...formData, permanentUpazila: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">পূর্ণ স্থায়ী ঠিকানা</label>
                      <input
                        type="text"
                        value={formData.permanentAddress}
                        onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: KYC & PHOTOS */}
          {activeTab === 'KYC' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">পরিচয়পত্র টাইপ</label>
                  <select
                    value={formData.nidType}
                    onChange={e => setFormData({ ...formData, nidType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value="SMART_NID">স্মার্ট এনআইডি (Smart NID)</option>
                    <option value="OLD_NID">পুরাতন এনআইডি (Old NID)</option>
                    <option value="BIRTH_CERTIFICATE">জন্ম নিবন্ধন সনদ (Birth Cert)</option>
                    <option value="PASSPORT">পাসপোর্ট (Passport)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-medium">জাতীয় পরিচয়পত্র নম্বর (NID Number) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nid}
                    onChange={e => setFormData({ ...formData, nid: e.target.value })}
                    placeholder="১০ বা ১৭ ডিজিটের এনআইডি নম্বর"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              {/* Photo & Document Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Member Photo */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col items-center text-center">
                  <div className="text-xs font-semibold text-slate-200 mb-2">সদস্যের পাসপোর্ট সাইজ ছবি</div>
                  <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden mb-3 relative">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-600" />
                    )}
                  </div>
                  <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs cursor-pointer flex items-center gap-1.5 shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ছবি আপলোড করুন</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                {/* NID Document */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col items-center text-center">
                  <div className="text-xs font-semibold text-slate-200 mb-2">জাতীয় পরিচয়পত্র কপি / ডকুমেন্ট</div>
                  <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden mb-3 relative">
                    {nidPreview ? (
                      <img src={nidPreview} alt="NID Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="w-10 h-10 text-slate-600" />
                    )}
                  </div>
                  <label className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs cursor-pointer flex items-center gap-1.5 shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>এনআইডি আপলোড করুন</span>
                    <input type="file" accept="image/*" onChange={handleNidUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAMITY & SHARE POLICY */}
          {activeTab === 'SAMITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">সদস্য ক্যাটাগরি</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as MemberCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value="GENERAL">সাধারণ সদস্য (General)</option>
                    <option value="EXECUTIVE">কার্যনির্বাহী সদস্য (Executive)</option>
                    <option value="ADVISORY">উপদেষ্টা সদস্য (Advisory)</option>
                    <option value="LIFE">আজীবন সদস্য (Life Member)</option>
                    <option value="DONOR">দাতা সদস্য (Donor)</option>
                    <option value="ASSOCIATE">সহযোগী সদস্য (Associate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">পদবি (Designation)</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="যেমন: সাধারণ সদস্য, সভাপতি, কোষাধ্যক্ষ"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">স্ট্যাটাস</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as MemberStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold"
                  >
                    <option value="ACTIVE">সক্রিয় (Active)</option>
                    <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                    <option value="SUSPENDED">স্থগিত (Suspended)</option>
                    <option value="PENDING">পেন্ডিং যাচাইকরণ (Pending)</option>
                    <option value="RETIRED">অবসরপ্রাপ্ত (Retired)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">ভর্তির তারিখ</label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">ভর্তি ফি (টাকা)</label>
                  <input
                    type="number"
                    value={formData.admissionFee}
                    onChange={e => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">মাসিক নির্ধারিত চাঁদা (টাকা)</label>
                  <input
                    type="number"
                    value={formData.monthlySubscriptionAmount}
                    onChange={e => setFormData({ ...formData, monthlySubscriptionAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Shares */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="text-xs font-semibold text-emerald-400">শেয়ার মূলধন কনফিগারেশন</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">ক্রয়কৃত শেয়ার সংখ্যা</label>
                    <input
                      type="number"
                      value={formData.sharesHeld}
                      onChange={e => {
                        const count = Number(e.target.value);
                        setFormData({
                          ...formData,
                          sharesHeld: count,
                          shareValue: count * (activeTenant.settings?.shareFaceValue || 1000)
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">মোট শেয়ার মূল্য (টাকা)</label>
                    <input
                      type="number"
                      value={formData.shareValue}
                      onChange={e => setFormData({ ...formData, shareValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold text-emerald-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOMINEE & EMERGENCY */}
          {activeTab === 'NOMINEE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">মনোনীত ব্যক্তি (Nominee)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">নমিনীর পূর্ণ নাম *</label>
                    <input
                      type="text"
                      value={formData.nomineeName}
                      onChange={e => setFormData({ ...formData, nomineeName: e.target.value })}
                      placeholder="যেমন: মোসাম্মৎ রহিমা আক্তার"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">সদস্যের সাথে সম্পর্ক</label>
                    <select
                      value={formData.nomineeRelation}
                      onChange={e => setFormData({ ...formData, nomineeRelation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    >
                      <option value="স্ত্রী">স্ত্রী (Wife)</option>
                      <option value="স্বামী">স্বামী (Husband)</option>
                      <option value="পিতা">পিতা (Father)</option>
                      <option value="মাতা">মাতা (Mother)</option>
                      <option value="পুত্র">পুত্র (Son)</option>
                      <option value="কন্যা">কন্যা (Daughter)</option>
                      <option value="ভাই">ভাই (Brother)</option>
                      <option value="বোন">বোন (Sister)</option>
                      <option value="অন্যান্য">অন্যান্য (Other)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">এনআইডি / জন্ম নিবন্ধন নম্বর</label>
                    <input
                      type="text"
                      value={formData.nomineeNid}
                      onChange={e => setFormData({ ...formData, nomineeNid: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">নমিনীর মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={formData.nomineePhone}
                      onChange={e => setFormData({ ...formData, nomineePhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-300 mb-1 font-medium">প্রাপ্তির অংশ (শেয়ার শতকরা %)</label>
                    <input
                      type="number"
                      value={formData.nomineeShare}
                      onChange={e => setFormData({ ...formData, nomineeShare: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs font-semibold text-slate-200">জরুরি যোগাযোগ (Emergency Contact)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">জরুরি ব্যক্তির নাম</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">সম্পর্ক</label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelation}
                      onChange={e => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">জরুরি ফোন নম্বর</label>
                    <input
                      type="text"
                      value={formData.emergencyContactPhone}
                      onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Submit & Nav Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
            <div className="text-xs text-slate-400">
              * চিহ্নিত ফিল্ডগুলো পূরণ করা আবশ্যক
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'আপডেট সংরক্ষণ করুন' : 'সদস্য নিবন্ধন সম্পন্ন করুন'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
