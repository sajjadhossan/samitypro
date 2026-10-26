'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, QrCode, ShieldCheck, Heart, Phone, Calendar, UserCheck } from 'lucide-react';
import { Member, Tenant } from '@/types';

interface MemberIdCardModalProps {
  member: Member;
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberIdCardModal({ member, tenant, isOpen, onClose }: MemberIdCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const samityNameBn = tenant.nameBn || 'একতা সঞ্চয় ও ঋণদান সমবায় সমিতি লিঃ';
  const samityNameEn = tenant.nameEn || 'Ekota Savings & Credit Cooperative Society Ltd.';
  const logoUrl = tenant.logoUrl || tenant.bannerUrl;
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `SAMITYPRO-VERIFIED:${tenant.id}:${member.memberCode}:${member.nameBn}:${member.phone}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                ডিজিটাল সদস্য পরিচয়পত্র (Digital Member ID Card)
              </h3>
              <p className="text-xs text-slate-400">
                {member.nameBn} • <span className="text-emerald-400 font-mono">{member.memberCode}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="overflow-y-auto py-5 space-y-6">
          <div ref={cardRef} className="print-card-container flex flex-col md:flex-row items-center justify-center gap-6">
            
            {/* FRONT SIDE */}
            <div className="w-[320px] h-[480px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950 border-2 border-emerald-500/40 shadow-xl overflow-hidden flex flex-col justify-between p-4 relative shrink-0 text-slate-200">
              {/* Decorative top pattern */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

              {/* Card Header */}
              <div className="text-center pt-1 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-emerald-400" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                      SP
                    </div>
                  )}
                  <div className="text-left">
                    <h4 className="text-[12px] font-bold text-emerald-400 leading-tight line-clamp-1">{samityNameBn}</h4>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tight line-clamp-1">{samityNameEn}</p>
                  </div>
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-semibold text-emerald-300 uppercase tracking-widest mt-0.5">
                  সদস্য পরিচয়পত্র • MEMBER ID CARD
                </div>
              </div>

              {/* Photo & Member Code */}
              <div className="flex flex-col items-center my-auto py-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-emerald-400/80 overflow-hidden shadow-lg flex items-center justify-center">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.nameEn} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-emerald-900 flex items-center justify-center text-emerald-300 font-bold text-2xl">
                        {member.nameBn.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  {member.bloodGroup && (
                    <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] shadow flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 fill-current" />
                      <span>{member.bloodGroup}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 text-center">
                  <div className="text-sm font-bold text-slate-100">{member.nameBn}</div>
                  <div className="text-[11px] text-slate-300 font-medium">{member.nameEn}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[10px] text-emerald-400 font-mono font-bold">
                    <span>আইডি:</span> {member.memberCode}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="w-full mt-3 bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>পদবি / ক্যাটাগরি:</span>
                    <span className="text-slate-200 font-semibold">{member.designation || member.category}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>মোবাইল নম্বর:</span>
                    <span className="text-slate-200 font-mono">{member.phone}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>এনআইডি:</span>
                    <span className="text-slate-200 font-mono">{member.nid}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ভর্তির তারিখ:</span>
                    <span className="text-slate-200 font-mono">{member.admissionDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400">
                <div>
                  <div>ইস্যু: {member.admissionDate}</div>
                  <div className="text-emerald-400 font-medium">ভেরিফাইড সদস্য</div>
                </div>
                <div className="w-10 h-10 bg-white p-0.5 rounded shadow">
                  <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="w-[320px] h-[480px] rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-700 shadow-xl overflow-hidden flex flex-col justify-between p-4 relative shrink-0 text-slate-300">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600"></div>

              {/* Back Header */}
              <div className="text-center pt-1 border-b border-slate-800 pb-2">
                <h5 className="text-[11px] font-bold text-slate-200">নিয়মাবলী ও জরুরি নির্দেশিকা</h5>
                <p className="text-[9px] text-slate-400">Rules & Emergency Information</p>
              </div>

              {/* Guidelines & Details */}
              <div className="space-y-2.5 my-auto text-[10px] leading-relaxed">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>জরুরি যোগাযোগ / Emergency:</span>
                  </div>
                  <div className="text-slate-300">
                    {member.emergencyContactName ? (
                      <>ব্যক্তি: {member.emergencyContactName} ({member.emergencyContactRelation}) • {member.emergencyContactPhone}</>
                    ) : (
                      <>নমিনী: {member.nominee?.name} ({member.nominee?.relation}) • {member.nominee?.phone}</>
                    )}
                  </div>
                  <div className="text-slate-400 text-[9px] pt-0.5">
                    ঠিকানা: {member.presentAddress || 'ঢাকা, বাংলাদেশ'}
                  </div>
                </div>

                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[9px]">
                  <li>এই কার্ডটি সমিতির নিজস্ব সম্পত্তি, হস্তান্তরযোগ্য নয়।</li>
                  <li>কার্ডটি হারিয়ে গেলে অবিলম্বে সমিতিকে অবহিত করতে হবে।</li>
                  <li>সমিতির সভা, ভোট ও সঞ্চয় লেনদেনের সময় প্রদর্শন আবশ্যক।</li>
                  <li>কার্ডের অপব্যবহার আইনত দণ্ডনীয় অপরাধ।</li>
                </ul>

                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-center text-[9px] text-emerald-300">
                  কার্ড প্রাপ্ত হলে নিকটস্থ সমিতিতে বা হেল্পলাইনে জমা দিন: {tenant.phone || '+8801700000000'}
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-end justify-between px-2">
                  <div className="text-center">
                    <div className="h-6 flex items-center justify-center">
                      <span className="font-serif italic text-emerald-400 text-xs tracking-wider">রফিকুল ইসলাম</span>
                    </div>
                    <div className="border-t border-slate-600 pt-0.5 text-[9px] text-slate-400">সভাপতির স্বাক্ষর</div>
                  </div>

                  <div className="w-12 h-12 rounded-full border border-dashed border-emerald-500/40 flex items-center justify-center text-[7px] text-emerald-400 font-bold text-center leading-tight">
                    সমিতি<br/>সিলমোহর
                  </div>

                  <div className="text-center">
                    <div className="h-6 flex items-center justify-center">
                      <span className="font-serif italic text-teal-400 text-xs tracking-wider">জাহাঙ্গীর আলম</span>
                    </div>
                    <div className="border-t border-slate-600 pt-0.5 text-[9px] text-slate-400">সম্পাদকের স্বাক্ষর</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs text-slate-400 shrink-0">
          <span>প্রিন্ট অপশনে গিয়ে দুই পাশের পেপার কার্ড বা পিভিসি প্লাস্টিক কার্ড ফরম্যাটে প্রিন্ট করুন।</span>
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
          .print-card-container, .print-card-container * {
            visibility: visible;
          }
          .print-card-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            background: white !important;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
