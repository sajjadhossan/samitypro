'use client';

import React, { useRef } from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { Member, Tenant } from '@/types';

interface MemberAdmissionFormModalProps {
  member: Member;
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberAdmissionFormModal({ member, tenant, isOpen, onClose }: MemberAdmissionFormModalProps) {
  const formRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const samityNameBn = tenant.nameBn || 'একতা সঞ্চয় ও ঋণদান সমবায় সমিতি লিঃ';
  const samityNameEn = tenant.nameEn || 'Ekota Savings & Credit Cooperative Society Ltd.';
  const address = tenant.address || 'ঢাকা, বাংলাদেশ';
  const regNo = tenant.registrationNo || 'REG-2024-8841';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto text-slate-100 flex flex-col max-h-[95vh]">
        
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                সদস্য ভর্তি ফরম ও বায়োডাটা (Member Admission Form)
              </h3>
              <p className="text-xs text-slate-400">
                A4 অফিসিয়াল প্রিন্ট ও সংরক্ষণ কপি • {member.nameBn} ({member.memberCode})
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Designed to look like pristine official A4 paper */}
        <div className="overflow-y-auto py-4">
          <div 
            ref={formRef}
            className="print-admission-form max-w-[210mm] mx-auto bg-white text-black p-8 sm:p-10 rounded-xl shadow-lg border border-slate-300 font-sans text-xs leading-relaxed"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-slate-800 pb-3 relative">
              <div className="absolute top-0 right-0 w-24 h-28 border border-slate-400 rounded p-1 flex items-center justify-center text-center bg-slate-50">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt="Passport Photo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">পাসপোর্ট সাইজ ছবি</span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 tracking-tight">{samityNameBn}</h2>
              <p className="text-xs font-medium text-slate-700 tracking-wide">{samityNameEn}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{address}</p>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 mt-1 font-mono">
                <span>রেজিঃ নং: {regNo}</span>
                <span>•</span>
                <span>মোবাইল: {tenant.phone || '+8801700000000'}</span>
              </div>

              <div className="mt-3 inline-block px-4 py-1 border-2 border-slate-800 rounded-md font-bold text-sm bg-slate-100 uppercase tracking-wider">
                সদস্য ভর্তি ও নিবন্ধন আবেদন ফরম
              </div>
            </div>

            {/* Application Meta */}
            <div className="flex justify-between items-center py-2 border-b border-slate-300 text-[11px] font-mono">
              <div><strong>সদস্য আইডি / কোড:</strong> <span className="text-emerald-800 font-bold">{member.memberCode}</span></div>
              <div><strong>ভর্তির তারিখ:</strong> {member.admissionDate}</div>
              <div><strong>ক্যাটাগরি:</strong> {member.category}</div>
            </div>

            {/* Section 1: Personal Details */}
            <div className="mt-4">
              <h4 className="font-bold text-xs bg-slate-200 px-2.5 py-1 rounded border-l-4 border-emerald-700 uppercase">
                ১. সদস্যের ব্যক্তিগত ও পারিবারিক তথ্যাবলী
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[11px]">
                <div><span className="text-slate-600">১.১ নাম (বাংলায়):</span> <strong>{member.nameBn}</strong></div>
                <div><span className="text-slate-600">১.২ Name (English):</span> <strong>{member.nameEn}</strong></div>
                <div><span className="text-slate-600">১.৩ পিতা/স্বামীর নাম:</span> {member.fatherHusbandName}</div>
                <div><span className="text-slate-600">১.৪ মাতার নাম:</span> {member.motherName}</div>
                <div><span className="text-slate-600">১.৫ জাতীয় পরিচয়পত্র (NID):</span> <strong className="font-mono">{member.nid}</strong> ({member.nidType || 'Smart NID'})</div>
                <div><span className="text-slate-600">১.৬ জন্ম তারিখ ও বয়স:</span> {member.dateOfBirth} {member.age ? `(${member.age} বছর)` : ''}</div>
                <div><span className="text-slate-600">১.৭ রক্তের গ্রুপ:</span> <span className="font-bold text-rose-700">{member.bloodGroup || 'N/A'}</span></div>
                <div><span className="text-slate-600">১.৮ লিঙ্গ ও ধর্ম:</span> {member.gender === 'MALE' ? 'পুরুষ' : member.gender === 'FEMALE' ? 'মহিলা' : 'অন্যান্য'} • {member.religion || 'ইসলাম'}</div>
                <div><span className="text-slate-600">১.৯ পেশা:</span> {member.occupation}</div>
                <div><span className="text-slate-600">১.১০ শিক্ষাগত যোগ্যতা:</span> {member.education || 'মাধ্যমিক/উচ্চ মাধ্যমিক'}</div>
              </div>
            </div>

            {/* Section 2: Contact & Address */}
            <div className="mt-4">
              <h4 className="font-bold text-xs bg-slate-200 px-2.5 py-1 rounded border-l-4 border-emerald-700 uppercase">
                ২. যোগাযোগের ঠিকানা
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[11px]">
                <div><span className="text-slate-600">২.১ মোবাইল নম্বর:</span> <strong className="font-mono">{member.phone}</strong></div>
                <div><span className="text-slate-600">২.২ হোয়াটসঅ্যাপ / ইমেইল:</span> {member.whatsappNumber || member.phone} • {member.email || 'N/A'}</div>
                <div className="col-span-2">
                  <span className="text-slate-600">২.৩ বর্তমান ঠিকানা:</span> {member.presentAddress}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600">২.৪ স্থায়ী ঠিকানা:</span> {member.permanentAddress || member.presentAddress}
                </div>
              </div>
            </div>

            {/* Section 3: Samity & Shares */}
            <div className="mt-4">
              <h4 className="font-bold text-xs bg-slate-200 px-2.5 py-1 rounded border-l-4 border-emerald-700 uppercase">
                ৩. শেয়ার মূলধন ও চাঁদা পলিসি
              </h4>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                <div><span className="text-slate-600">শেয়ার সংখ্যা:</span> <strong>{member.sharesHeld} টি</strong></div>
                <div><span className="text-slate-600">শেয়ার মূল্য:</span> <strong>৳ {member.shareValue.toLocaleString()}</strong></div>
                <div><span className="text-slate-600">ভর্তি ফি:</span> <strong>৳ {member.admissionFee.toLocaleString()}</strong></div>
                <div><span className="text-slate-600">মাসিক চাঁদা:</span> <strong>৳ {(member.monthlySubscriptionAmount || 1500).toLocaleString()}</strong></div>
                <div><span className="text-slate-600">সঞ্চয় স্থিতি:</span> ৳ {member.savingsBalance.toLocaleString()}</div>
                <div><span className="text-slate-600">বর্তমান স্ট্যাটাস:</span> <span className="font-semibold text-emerald-800">{member.status}</span></div>
              </div>
            </div>

            {/* Section 4: Nominee Details */}
            <div className="mt-4">
              <h4 className="font-bold text-xs bg-slate-200 px-2.5 py-1 rounded border-l-4 border-emerald-700 uppercase">
                ৪. মনোনীত ব্যক্তি (Nominee) বিবরণ
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[11px] bg-emerald-50/50 p-2.5 rounded border border-emerald-200">
                <div><span className="text-slate-600">নমিনীর পূর্ণ নাম:</span> <strong>{member.nominee?.name}</strong></div>
                <div><span className="text-slate-600">সদস্যের সাথে সম্পর্ক:</span> <strong>{member.nominee?.relation}</strong></div>
                <div><span className="text-slate-600">জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন:</span> <span className="font-mono">{member.nominee?.nidOrBirthCert}</span></div>
                <div><span className="text-slate-600">মোবাইল নম্বর:</span> <span className="font-mono">{member.nominee?.phone}</span></div>
                <div><span className="text-slate-600">অংশীদারিত্ব (ভাগ):</span> <strong className="text-emerald-800">{member.nominee?.sharePercentage}%</strong></div>
                <div><span className="text-slate-600">জরুরি যোগাযোগ:</span> {member.emergencyContactName ? `${member.emergencyContactName} (${member.emergencyContactPhone})` : 'স্বয়ংক্রিয়'}</div>
              </div>
            </div>

            {/* Section 5: Declaration */}
            <div className="mt-4 text-[10px] text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              <p className="font-semibold text-slate-800 mb-1">সদস্যের অঙ্গীকারনামা:</p>
              <p>
                আমি এই মর্মে ঘোষণা করছি যে, উপরে উল্লেখিত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি সমিতির গঠনতন্ত্র, উপ-আইন এবং পরিচালনা পরিষদের সকল নিয়মকানুন মানিয়া চলিতে বাধ্য থাকিব। সমিতির আর্থিক স্বার্থবিরোধী বা শৃঙ্খলাভঙ্গকারী কোনো কাজে লিপ্ত হইব না।
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="mt-10 pt-4 grid grid-cols-3 gap-6 text-center text-[10px]">
              <div>
                <div className="h-10 border-b border-slate-700"></div>
                <div className="pt-1 font-semibold">আবেদনকারী সদস্যের স্বাক্ষর</div>
                <div className="text-[9px] text-slate-500">তারিখ: {member.admissionDate}</div>
              </div>

              <div>
                <div className="h-10 border-b border-slate-700 flex items-center justify-center">
                  <span className="italic font-serif text-slate-600 text-xs">মোহাম্মদ জাহাঙ্গীর আলম</span>
                </div>
                <div className="pt-1 font-semibold">সাধারণ সম্পাদক / যাচাইকারী</div>
                <div className="text-[9px] text-slate-500">তারিখ: {member.admissionDate}</div>
              </div>

              <div>
                <div className="h-10 border-b border-slate-700 flex items-center justify-center">
                  <span className="italic font-serif text-emerald-800 text-xs">আলহাজ্ব রফিকুল ইসলাম</span>
                </div>
                <div className="pt-1 font-semibold">সভাপতির অনুমোদন ও সিলমোহর</div>
                <div className="text-[9px] text-slate-500">অনুমোদিত ও রেকর্ডভুক্ত</div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs text-slate-400 shrink-0">
          <span>A4 সাইজে প্রিন্ট করে ফাইলে সংরক্ষণ করুন।</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-admission-form, .print-admission-form * {
            visibility: visible;
          }
          .print-admission-form {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
