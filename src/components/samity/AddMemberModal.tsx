'use client';

import React, { useState } from 'react';
import { X, UserPlus, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { MemberCategory, Gender } from '@/types';
import { translations } from '@/lib/i18n';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { store, activeTenant, language, members } = useSamityStore();
  const t = translations[language];

  const nextCodeNum = members.length + 1;
  const defaultMemberCode = `MEM-${String(nextCodeNum).padStart(3, '0')}`;

  const [formData, setFormData] = useState({
    memberCode: defaultMemberCode,
    nameBn: '',
    nameEn: '',
    fatherHusbandName: '',
    motherName: '',
    phone: '',
    email: '',
    nid: '',
    dateOfBirth: '1990-01-01',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    bloodGroup: 'B+',
    presentAddress: '',
    permanentAddress: '',
    occupation: '',
    category: 'GENERAL' as MemberCategory,
    status: 'ACTIVE' as const,
    admissionDate: '2026-10-25',
    admissionFee: 1000,
    nomineeName: '',
    nomineeRelation: 'স্ত্রী / স্বামী',
    nomineeNid: '',
    nomineePhone: '',
    nomineeShare: 100
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn || !formData.phone || !formData.nid) {
      alert(language === 'bn' ? 'দয়া করে নাম, মোবাইল এবং জাতীয় পরিচয়পত্র নম্বর পূরণ করুন।' : 'Please fill in Name, Phone, and NID.');
      return;
    }

    store.addMember({
      tenantId: activeTenant.id,
      memberCode: formData.memberCode,
      nameBn: formData.nameBn,
      nameEn: formData.nameEn || formData.nameBn,
      fatherHusbandName: formData.fatherHusbandName,
      motherName: formData.motherName,
      phone: formData.phone,
      email: formData.email,
      nid: formData.nid,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      presentAddress: formData.presentAddress,
      permanentAddress: formData.permanentAddress,
      occupation: formData.occupation,
      category: formData.category,
      status: formData.status,
      admissionDate: formData.admissionDate,
      admissionFee: Number(formData.admissionFee) || 1000,
      nominee: {
        name: formData.nomineeName || 'নমিনী অপ্রাপ্ত',
        relation: formData.nomineeRelation,
        nidOrBirthCert: formData.nomineeNid || 'N/A',
        phone: formData.nomineePhone || formData.phone,
        sharePercentage: Number(formData.nomineeShare) || 100
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {language === 'bn' ? 'নতুন সদস্য ভর্তি ও কেওয়াইসি (KYC) নিবন্ধন' : 'New Member Registration & KYC'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? activeTenant?.nameBn : activeTenant?.nameEn}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-4 pr-1 text-xs sm:text-sm">
          
          {/* Section 1: Basic Information */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '১. প্রাথমিক ও ব্যক্তিগত তথ্য' : '1. Personal Information'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.memberCode} *</label>
                <input
                  type="text"
                  required
                  value={formData.memberCode}
                  onChange={e => setFormData({ ...formData, memberCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.fullNameBn} *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মো: কবির আহমেদ"
                  value={formData.nameBn}
                  onChange={e => setFormData({ ...formData, nameBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.fullNameEn}</label>
                <input
                  type="text"
                  placeholder="e.g. Md. Kabir Ahmed"
                  value={formData.nameEn}
                  onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.phone} *</label>
                <input
                  type="text"
                  required
                  placeholder="01711XXXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.nid} *</label>
                <input
                  type="text"
                  required
                  placeholder="১০ বা ১৭ সংখ্যার এনআইডি নম্বর"
                  value={formData.nid}
                  onChange={e => setFormData({ ...formData, nid: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.category}</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as MemberCategory })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="GENERAL">সাধারণ সদস্য (General)</option>
                  <option value="EXECUTIVE">কার্যনির্বাহী সদস্য (Executive)</option>
                  <option value="ADVISORY">উপদেষ্টা সদস্য (Advisory)</option>
                  <option value="LIFE">আজীবন সদস্য (Life Member)</option>
                  <option value="DONOR">দাতা সদস্য (Donor)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.fatherOrHusband}</label>
                <input
                  type="text"
                  value={formData.fatherHusbandName}
                  onChange={e => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.motherName}</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.occupation}</label>
                <input
                  type="text"
                  placeholder="যেমন: ব্যবসা / চাকরি"
                  value={formData.occupation}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.address}</label>
                <textarea
                  rows={2}
                  value={formData.presentAddress}
                  onChange={e => setFormData({ ...formData, presentAddress: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">স্থায়ী ঠিকানা (Permanent Address)</label>
                <textarea
                  rows={2}
                  value={formData.permanentAddress}
                  onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Nominee Details */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '২. মনোনীত ব্যক্তির তথ্য (Nominee Details)' : '2. Nominee Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.nomineeName}</label>
                <input
                  type="text"
                  placeholder="নমিনীর নাম"
                  value={formData.nomineeName}
                  onChange={e => setFormData({ ...formData, nomineeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.nomineeRelation}</label>
                <input
                  type="text"
                  placeholder="যেমন: স্ত্রী / পুত্র / কন্যা"
                  value={formData.nomineeRelation}
                  onChange={e => setFormData({ ...formData, nomineeRelation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">{t.nomineePhone}</label>
                <input
                  type="text"
                  placeholder="নমিনীর মোবাইল নম্বর"
                  value={formData.nomineePhone}
                  onChange={e => setFormData({ ...formData, nomineePhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fees & Shares */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{language === 'bn' ? '৩. ভর্তি ফি ও প্রাথমিক শেয়ার ক্রয়' : '3. Admission Fee & Initial Shares'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">ভর্তি ফি (টাকা)</label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={e => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1 font-medium">প্রাথমিক শেয়ার সংখ্যা (১০টি = ১০,০০০ টাকা)</label>
                <input
                  type="number"
                  disabled
                  value={10}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              {language === 'bn' ? 'সদস্য অন্তর্ভুক্তি সম্পন্ন করুন' : 'Confirm Registration'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
