'use client';

import React, { useState } from 'react';
import { 
  Building2, Check, 
  Plus, Trash2, ShieldCheck
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { 
  LetterheadConfig, 
  SignatureSealConfig, 
  LogoPosition, 
  LogoSize, 
  SealShape,
  Tenant
} from '@/types';

export interface SignatoryItem {
  id: string;
  titleBn: string;
  titleEn: string;
  nameBn: string;
  nameEn: string;
  isEnabled: boolean;
  hasSeal: boolean;
}

export type DesignerTab = 'HEADER' | 'SIGNATURES' | 'SEALS';
export type PreviewDocType = 'RECEIPT' | 'NOTICE' | 'CERTIFICATE';

function getSaveButtonText(saveSuccess: boolean, isBn: boolean): string {
  if (saveSuccess) {
    return isBn ? 'সংরক্ষিত হয়েছে!' : 'Saved!';
  }
  return isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Designer Settings';
}

function getPaperDimensionClasses(orientation: 'portrait' | 'landscape', paperSize: 'A4' | 'A5'): string {
  if (orientation === 'landscape') {
    return 'w-full max-w-[800px] min-h-[500px]';
  }
  if (paperSize === 'A4') {
    return 'w-full max-w-[620px] min-h-[820px]';
  }
  return 'w-full max-w-[480px] min-h-[640px]';
}

function getHeaderLayoutClass(position?: LogoPosition): string {
  if (position === 'CENTER') return 'flex-col text-center gap-2';
  if (position === 'RIGHT') return 'flex-row-reverse';
  return '';
}

function getLogoSizeClass(size?: LogoSize): string {
  if (size === 'SMALL') return 'w-10 h-10 text-sm';
  if (size === 'LARGE') return 'w-20 h-20 text-xl';
  return 'w-14 h-14 text-base';
}

function getSealShapeClass(shape?: SealShape): string {
  if (shape === 'RECTANGLE') return 'w-24 h-10 border-2 border-dashed rounded-md';
  if (shape === 'OVAL') return 'w-20 h-14 border-2 border-dashed rounded-[50%]';
  return 'w-16 h-16 border-2 border-dashed rounded-full';
}

interface HeaderTabProps {
  config: LetterheadConfig;
  setConfig: React.Dispatch<React.SetStateAction<LetterheadConfig>>;
  isBn: boolean;
}

function HeaderEditorTab({ config, setConfig, isBn }: HeaderTabProps) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-2">
        {isBn ? 'প্যাড হেডার কনফিগারেশন' : 'Header Configuration'}
      </h4>

      <div>
        <label className="block text-slate-400 mb-1">{isBn ? 'সমিতির নাম (বাংলা)' : 'Samity Name (Bn)'}</label>
        <input
          type="text"
          value={config.samityNameBn}
          onChange={e => setConfig({ ...config, samityNameBn: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
        />
      </div>

      <div>
        <label className="block text-slate-400 mb-1">{isBn ? 'সমিতির স্লোগান / মূলমন্ত্র' : 'Slogan'}</label>
        <input
          type="text"
          value={config.sloganBn}
          onChange={e => setConfig({ ...config, sloganBn: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">{isBn ? 'লোগোর অবস্থান' : 'Logo Position'}</label>
          <select
            value={config.logoPosition || 'LEFT'}
            onChange={e => setConfig({ ...config, logoPosition: e.target.value as LogoPosition })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
          >
            <option value="LEFT">{isBn ? 'বামে' : 'Left'}</option>
            <option value="CENTER">{isBn ? 'কেন্দ্রে (মাঝখানে)' : 'Center'}</option>
            <option value="RIGHT">{isBn ? 'ডানে' : 'Right'}</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">{isBn ? 'লোগোর আকার' : 'Logo Size'}</label>
          <select
            value={config.logoSize || 'MEDIUM'}
            onChange={e => setConfig({ ...config, logoSize: e.target.value as LogoSize })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
          >
            <option value="SMALL">{isBn ? 'ছোট (Small)' : 'Small'}</option>
            <option value="MEDIUM">{isBn ? 'মাঝারি (Medium)' : 'Medium'}</option>
            <option value="LARGE">{isBn ? 'বড় (Large)' : 'Large'}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">{isBn ? 'হেডার বর্ডার কালার' : 'Border Color'}</label>
          <input
            type="color"
            value={config.headerBorderColor || '#0ea5e9'}
            onChange={e => setConfig({ ...config, headerBorderColor: e.target.value })}
            className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">{isBn ? 'প্যাডের উচ্চতা (পিক্সেল)' : 'Height (px)'}</label>
          <input
            type="number"
            min="80"
            max="220"
            value={config.headerHeight || 110}
            onChange={e => setConfig({ ...config, headerHeight: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 mb-1">{isBn ? 'সমিতির ঠিকানা ও যোগাযোগ' : 'Address & Contacts'}</label>
        <textarea
          rows={2}
          value={config.addressBn}
          onChange={e => setConfig({ ...config, addressBn: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
        />
      </div>
    </div>
  );
}

interface SignaturesTabProps {
  signatories: SignatoryItem[];
  setSignatories: React.Dispatch<React.SetStateAction<SignatoryItem[]>>;
  isBn: boolean;
}

function SignaturesEditorTab({ signatories, setSignatories, isBn }: SignaturesTabProps) {
  const addCustomSignatory = () => {
    const id = `sig-${Date.now()}`;
    setSignatories(prev => [
      ...prev,
      {
        id,
        titleBn: 'উপদেষ্টা / কর্মকর্তা',
        titleEn: 'Advisor / Officer',
        nameBn: 'নতুন কর্মকর্তা',
        nameEn: 'New Officer',
        isEnabled: true,
        hasSeal: false
      }
    ]);
  };

  const removeSignatory = (id: string) => {
    if (signatories.length <= 1) return;
    setSignatories(prev => prev.filter(s => s.id !== id));
  };

  const updateSignatory = (idx: number, field: keyof SignatoryItem, value: unknown) => {
    setSignatories(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="font-bold text-slate-200">{isBn ? 'অনুমোদিত কর্মকর্তাদের স্বাক্ষর' : 'Signatories Management'}</h4>
        <button
          onClick={addCustomSignatory}
          className="px-2.5 py-1 rounded-lg bg-cyan-600/30 text-cyan-400 hover:bg-cyan-600/50 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isBn ? 'কর্মকর্তা যোগ' : 'Add Signatory'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {signatories.map((sig, idx) => (
          <div key={sig.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400">#{idx + 1} {sig.titleBn}</span>
              {idx > 2 && (
                <button onClick={() => removeSignatory(sig.id)} className="text-red-400 hover:text-red-300 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={sig.nameBn}
                onChange={e => updateSignatory(idx, 'nameBn', e.target.value)}
                placeholder="নাম (বাংলা)"
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
              />
              <input
                type="text"
                value={sig.titleBn}
                onChange={e => updateSignatory(idx, 'titleBn', e.target.value)}
                placeholder="পদবী (বাংলা)"
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sig.isEnabled}
                  onChange={e => updateSignatory(idx, 'isEnabled', e.target.checked)}
                  className="rounded border-slate-700 text-cyan-600"
                />
                <span>{isBn ? 'ডকুমেন্টে প্রদর্শন' : 'Show on Document'}</span>
              </label>
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sig.hasSeal}
                  onChange={e => updateSignatory(idx, 'hasSeal', e.target.checked)}
                  className="rounded border-slate-700 text-cyan-600"
                />
                <span>{isBn ? 'সিল স্ট্যাম্প যুক্ত' : 'Attach Seal'}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SealsTabProps {
  sigConfig: SignatureSealConfig;
  setSigConfig: React.Dispatch<React.SetStateAction<SignatureSealConfig>>;
  isBn: boolean;
}

function SealsEditorTab({ sigConfig, setSigConfig, isBn }: SealsTabProps) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-2">
        {isBn ? 'ডিজিটাল সিল ও স্ট্যাম্প কাস্টমাইজেশন' : 'Digital Seal & Stamp Configuration'}
      </h4>

      <div>
        <label className="block text-slate-400 mb-1">{isBn ? 'সিলের টেক্সট (Text)' : 'Seal Text'}</label>
        <input
          type="text"
          value={sigConfig.sealText || sigConfig.sealTextBn || 'অনুমোদিত / APPROVED'}
          onChange={e => setSigConfig({ ...sigConfig, sealText: e.target.value, sealTextBn: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">{isBn ? 'সিলের ধরন' : 'Shape'}</label>
          <select
            value={sigConfig.sealShape || 'ROUND'}
            onChange={e => setSigConfig({ ...sigConfig, sealShape: e.target.value as SealShape })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
          >
            <option value="ROUND">{isBn ? 'গোলাকার (Circular)' : 'Circular'}</option>
            <option value="OVAL">{isBn ? 'ডিম্বাকার (Oval)' : 'Oval'}</option>
            <option value="RECTANGLE">{isBn ? 'চারকোনা (Rectangle)' : 'Rectangle'}</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">{isBn ? 'কালি / কালার' : 'Color'}</label>
          <input
            type="color"
            value={sigConfig.sealColor || '#2563eb'}
            onChange={e => setSigConfig({ ...sigConfig, sealColor: e.target.value })}
            className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 mb-1">
          {isBn ? `সিলের রোটেশন: ${sigConfig.sealRotation ?? -12}°` : `Rotation: ${sigConfig.sealRotation ?? -12}°`}
        </label>
        <input
          type="range"
          min="-45"
          max="45"
          value={sigConfig.sealRotation ?? -12}
          onChange={e => setSigConfig({ ...sigConfig, sealRotation: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}

interface LivePreviewSheetProps {
  paperSize: 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
  previewDocType: PreviewDocType;
  previewLang: 'bn' | 'en';
  config: LetterheadConfig;
  sigConfig: SignatureSealConfig;
  activeTenant?: Tenant;
  signatories: SignatoryItem[];
}

function LivePreviewSheet({
  paperSize,
  orientation,
  previewDocType,
  previewLang,
  config,
  sigConfig,
  activeTenant,
  signatories
}: LivePreviewSheetProps) {
  const paperDimensionClass = getPaperDimensionClasses(orientation, paperSize);
  const headerLayoutClass = getHeaderLayoutClass(config.logoPosition);
  const logoSizeClass = getLogoSizeClass(config.logoSize);
  const sealShapeClass = getSealShapeClass(sigConfig.sealShape);

  return (
    <div className={`bg-white text-slate-900 shadow-2xl rounded p-6 sm:p-8 flex flex-col justify-between transition-all ${paperDimensionClass}`}>
      {/* Pad Header */}
      <div 
        className={`border-b-2 pb-3 flex items-center justify-between ${headerLayoutClass}`}
        style={{ 
          borderColor: config.headerBorderColor || '#0ea5e9',
          minHeight: `${config.headerHeight || 110}px`
        }}
      >
        <div className={`flex items-center gap-4 ${config.logoPosition === 'CENTER' ? 'flex-col' : ''}`}>
          <div className={`rounded-full bg-cyan-600/10 border-2 border-cyan-600 flex items-center justify-center font-bold text-cyan-700 ${logoSizeClass}`}>
            Logo
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {previewLang === 'bn' ? config.samityNameBn : activeTenant?.nameEn}
            </h1>
            <p className="text-[11px] font-semibold text-cyan-700 mt-0.5">
              {previewLang === 'bn' ? config.sloganBn : 'Together Towards Prosperity and Unity'}
            </p>
            <p className="text-[10px] text-slate-600 mt-1 max-w-xs leading-snug">
              {config.addressBn}
            </p>
          </div>
        </div>

        <div className={`text-[10px] text-slate-500 font-mono space-y-0.5 ${config.logoPosition === 'RIGHT' ? 'text-left' : 'text-right'}`}>
          <div>REG: #{activeTenant?.registrationNo || 'EK-8941'}</div>
          <div>ESTD: {activeTenant?.establishedYear || 2024}</div>
          <div className="text-cyan-700 font-semibold">{activeTenant?.phone}</div>
        </div>
      </div>

      {/* Sample Content Body */}
      <div className="my-6 space-y-4 text-xs text-slate-700">
        <div className="text-center font-bold text-sm underline uppercase tracking-wider text-slate-900">
          {previewDocType === 'RECEIPT' && (previewLang === 'bn' ? 'অর্থ আদায় ও চাঁদা রশিদ' : 'OFFICIAL MONEY RECEIPT')}
          {previewDocType === 'NOTICE' && (previewLang === 'bn' ? 'জরুরি কার্যনির্বাহী সভার নোটিশ' : 'NOTICE OF EXECUTIVE MEETING')}
          {previewDocType === 'CERTIFICATE' && (previewLang === 'bn' ? 'সদস্যপদ প্রত্যয়নপত্র' : 'CERTIFICATE OF MEMBERSHIP')}
        </div>

        <div className="p-4 rounded border border-slate-200 bg-slate-50/80 space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span>{previewLang === 'bn' ? 'রসিদ / দলিল নং:' : 'Receipt / Ref No:'} <b className="font-mono">DOC-2026-9841</b></span>
            <span>{previewLang === 'bn' ? 'তারিখ:' : 'Date:'} <b>২৬ অক্টোবর, ২০২৬</b></span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span>{previewLang === 'bn' ? 'সদস্যের নাম:' : 'Member Name:'} <b>মো: কবির হোসেন (EK-1002)</b></span>
            <span>{previewLang === 'bn' ? 'আদায়ের খাত:' : 'Category:'} <b>মাসিক সাধারণ চাঁদা</b></span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span>{previewLang === 'bn' ? 'পরিশোধের মাধ্যম:' : 'Method:'} <b>ক্যাশ / ব্যাংক ডিপোজিট</b></span>
            <span>{previewLang === 'bn' ? 'জমা পরিমাণ:' : 'Amount:'} <b className="text-emerald-700 font-mono text-sm">৳ ১,৫০০</b></span>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 italic">
          {previewLang === 'bn' 
            ? 'এই ডকুমেন্টটি সমিতিপ্রো ক্লাউড সিস্টেম দ্বারা অনুমোদিত ও ডিজিটাল কিউআর কোড দ্বারা সংরক্ষিত।'
            : 'This document is verified and authenticated via SamityPro cloud ecosystem.'}
        </p>
      </div>

      {/* Footer Signatories & Seals */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex items-end justify-between gap-4">
          {signatories.filter(s => s.isEnabled).map((sig) => (
            <div key={sig.id} className="text-center relative flex-1">
              {sig.hasSeal && (
                <div 
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center p-1 text-[8px] font-black uppercase text-center leading-tight shadow-sm pointer-events-none ${sealShapeClass}`}
                  style={{ 
                    borderColor: sigConfig.sealColor || '#2563eb',
                    color: sigConfig.sealColor || '#2563eb',
                    transform: `translateX(-50%) rotate(${sigConfig.sealRotation ?? -12}deg)`
                  }}
                >
                  {sigConfig.sealText || sigConfig.sealTextBn || 'অনুমোদিত / APPROVED'}
                </div>
              )}

              <div className="h-8 flex items-end justify-center font-serif italic text-slate-800 text-sm">
                ✍️ {sig.nameEn.split(' ')[0]}
              </div>
              <div className="border-t border-slate-400 mt-1 pt-1">
                <div className="font-bold text-[11px] text-slate-900">
                  {previewLang === 'bn' ? sig.nameBn : sig.nameEn}
                </div>
                <div className="text-[10px] text-slate-600">
                  {previewLang === 'bn' ? sig.titleBn : sig.titleEn}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-1">
          Powered by SamityPro Cloud • Verification: https://samitypro.vercel.app/verify
        </div>
      </div>
    </div>
  );
}

export function LetterheadDesigner() {
  const { store, activeTenant, language } = useSamityStore();
  const isBn = language === 'bn';

  // Config states
  const [config, setConfig] = useState<LetterheadConfig>(() => store.letterhead);
  const [sigConfig, setSigConfig] = useState<SignatureSealConfig>(() => store.signatureSeal);

  // Preview Mode
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [previewDocType, setPreviewDocType] = useState<PreviewDocType>('RECEIPT');
  const [previewLang, setPreviewLang] = useState<'bn' | 'en'>(language);

  // Active Tab in Designer
  const [activeDesignerTab, setActiveDesignerTab] = useState<DesignerTab>('HEADER');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom Signatories
  const [signatories, setSignatories] = useState<SignatoryItem[]>([
    { id: 'sig-1', titleBn: 'সভাপতি', titleEn: 'President', nameBn: store.letterhead?.presidentNameBn || 'আলহাজ্ব রফিকুল ইসলাম', nameEn: 'Alhaj Rafiqul Islam', isEnabled: true, hasSeal: true },
    { id: 'sig-2', titleBn: 'সাধারণ সম্পাদক', titleEn: 'General Secretary', nameBn: store.letterhead?.secretaryNameBn || 'মো: আব্দুল করিম', nameEn: 'Md. Abdul Karim', isEnabled: true, hasSeal: false },
    { id: 'sig-3', titleBn: 'কোষাধ্যক্ষ', titleEn: 'Treasurer', nameBn: store.letterhead?.treasurerNameBn || 'মো: তারেক রহমান', nameEn: 'Md. Tareq Rahman', isEnabled: true, hasSeal: true },
  ]);

  const handleSaveAll = () => {
    store.updateLetterhead(config);
    store.updateSignatureSeal(sigConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const saveBtnText = getSaveButtonText(saveSuccess, isBn);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            {isBn ? 'লেটারহেড, লোগো, সিগনেচার ও ডিজিটাল সিল ডিজাইনার' : 'Advanced Letterhead, Signature & Seal Designer'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isBn 
              ? 'সমিতির প্যাড, লোগো সাইজ, অবস্থান, একাধিক কর্মকর্তা স্বাক্ষর ও ডিজিটাল সিলের লাইভ A4/A5 কাস্টমাইজেশন'
              : 'Customize pad header, logo alignment, multiple signatories and digital seal with live A4/A5 preview.'}
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          {saveSuccess ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{saveBtnText}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sub Navigation */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveDesignerTab('HEADER')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeDesignerTab === 'HEADER' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'প্যাড ও লোগো' : 'Header & Logo'}
            </button>
            <button
              onClick={() => setActiveDesignerTab('SIGNATURES')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeDesignerTab === 'SIGNATURES' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'স্বাক্ষর ব্যবস্থা' : 'Signatures'}
            </button>
            <button
              onClick={() => setActiveDesignerTab('SEALS')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeDesignerTab === 'SEALS' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'ডিজিটাল সিল' : 'Digital Seal'}
            </button>
          </div>

          {activeDesignerTab === 'HEADER' && (
            <HeaderEditorTab config={config} setConfig={setConfig} isBn={isBn} />
          )}

          {activeDesignerTab === 'SIGNATURES' && (
            <SignaturesEditorTab signatories={signatories} setSignatories={setSignatories} isBn={isBn} />
          )}

          {activeDesignerTab === 'SEALS' && (
            <SealsEditorTab sigConfig={sigConfig} setSigConfig={setSigConfig} isBn={isBn} />
          )}
        </div>

        {/* Live Preview Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar for Preview */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">{isBn ? 'সাইজ:' : 'Size:'}</span>
              <button
                onClick={() => setPaperSize('A4')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                  paperSize === 'A4' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                A4
              </button>
              <button
                onClick={() => setPaperSize('A5')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                  paperSize === 'A5' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                A5
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">{isBn ? 'অরিয়েন্টেশন:' : 'Orient:'}</span>
              <button
                onClick={() => setOrientation('portrait')}
                className={`px-2 py-1 rounded-lg font-semibold cursor-pointer ${
                  orientation === 'portrait' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isBn ? 'লম্বালম্বি' : 'Portrait'}
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`px-2 py-1 rounded-lg font-semibold cursor-pointer ${
                  orientation === 'landscape' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isBn ? 'আড়াআড়ি' : 'Landscape'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">{isBn ? 'নমুনা:' : 'Doc:'}</span>
              <select
                value={previewDocType}
                onChange={e => setPreviewDocType(e.target.value as PreviewDocType)}
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="RECEIPT">{isBn ? 'অর্থ আদায় রসিদ' : 'Receipt'}</option>
                <option value="NOTICE">{isBn ? 'সভার নোটিশ' : 'Notice'}</option>
                <option value="CERTIFICATE">{isBn ? 'সদস্য প্রত্যয়নপত্র' : 'Certificate'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">{isBn ? 'ভাষা:' : 'Lang:'}</span>
              <button
                onClick={() => setPreviewLang(previewLang === 'bn' ? 'en' : 'bn')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-400 font-bold border border-slate-700 cursor-pointer"
              >
                {previewLang === 'bn' ? 'বাংলা' : 'English'}
              </button>
            </div>
          </div>

          {/* Paper Sheet Preview Container */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 flex justify-center overflow-x-auto shadow-inner">
            <LivePreviewSheet
              paperSize={paperSize}
              orientation={orientation}
              previewDocType={previewDocType}
              previewLang={previewLang}
              config={config}
              sigConfig={sigConfig}
              activeTenant={activeTenant}
              signatories={signatories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
