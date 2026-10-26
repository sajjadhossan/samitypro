'use client';

import React from 'react';
import { 
  X, Smartphone, Download, GitBranch, CheckCircle2, 
  Terminal, ShieldCheck, Cpu, ArrowUpRight 
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApkDownloadModal({ isOpen, onClose }: ApkDownloadModalProps) {
  const { language } = useSamityStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {language === 'bn' ? 'সমিতিপ্রো অ্যান্ড্রয়েড মোবাইল অ্যাপ (APK)' : 'SamityPro Android Mobile App (APK)'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'রিয়েল-টাইম ক্লাউড সিঙ্ক সমৃদ্ধ মোবাইল অ্যাপ ও অটোমেটিক বিল্ড ওয়ার্কফ্লো' : 'Real-time connected mobile app with automated GitHub Actions build workflow'}
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

        {/* Content Body */}
        <div className="space-y-4 py-4 text-xs sm:text-sm text-slate-300">
          
          {/* Key Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Package ID</div>
              <div className="font-mono text-xs font-semibold text-emerald-400 mt-0.5 truncate">com.samitypro.app</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Min Android</div>
              <div className="font-mono text-xs font-semibold text-cyan-400 mt-0.5">Android 5.1+ (API 22)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Target SDK</div>
              <div className="font-mono text-xs font-semibold text-indigo-400 mt-0.5">Android 14 (API 34)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Architecture</div>
              <div className="font-mono text-xs font-semibold text-amber-400 mt-0.5">Capacitor v7 Native</div>
            </div>
          </div>

          {/* Workflow 1: GitHub Actions Cloud Build */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <GitBranch className="w-4 h-4" />
              <span>
                {language === 'bn' ? '১. গিটহাব অ্যাকশনস (GitHub Actions) এ অটোমেটিক APK তৈরি' : '1. Automated APK Build via GitHub Actions'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'আপনার রিপোজিটরির `.github/workflows/build-apk.yml` ফাইলটি কনফিগার করা রয়েছে। কোড পুশ করলে বা ম্যানুয়ালি রান করলে গিটহাব স্বয়ংক্রিয়ভাবে Ubuntu রানারে Gradle বিল্ড সম্পন্ন করে `SamityPro-Debug-APK` এবং `SamityPro-Release-Unsigned-APK` ডাউনলোড আর্টফ্যাক্ট তৈরি করে দেবে।'
                : 'The included `.github/workflows/build-apk.yml` builds debug and unsigned release APKs automatically on Ubuntu runners whenever code is pushed to GitHub.'}
            </p>
          </div>

          {/* Workflow 2: Local Gradle CLI Build */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Terminal className="w-4 h-4" />
              <span>
                {language === 'bn' ? '২. লোকাল কম্পিউটারে APK বিল্ড করার কমান্ড' : '2. Build APK Locally via Command Line'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto space-y-1">
              <div># ১. ওয়েব বিল্ড ও ক্যাপাসিটর সিঙ্ক</div>
              <div className="text-emerald-400">npm run build</div>
              <div className="text-emerald-400">npx cap sync android</div>
              <div># ২. অ্যান্ড্রয়েড ফোল্ডারে গিয়ে গ্রেডল বিল্ড</div>
              <div className="text-cyan-400">cd android && ./gradlew assembleDebug</div>
              <div># আপনার তৈরি APK পাওয়া যাবে: <span className="text-amber-400">android/app/build/outputs/apk/debug/app-debug.apk</span></div>
            </div>
          </div>

          {/* Features in Mobile App */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>মাঠ কর্মীদের জন্য দ্রুত কালেকশন ও ইনস্ট্যান্ট রসিদ প্রিন্ট</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>সাধারণ সদস্যদের ডিজিটাল পাসবই ও ঋণ কিস্তির বিবরণ</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>মোবাইল ক্যামেরা দিয়ে ব্যাংক ডিপোজিট ও ভাউচার স্লিপ আপলোড</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>অফলাইন কালেকশন ক্যাশিং ও অনলাইন হলে অটো-সিঙ্ক</span>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500 font-mono">
            Version 1.0.5 • Production Ready
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(language === 'bn' 
                  ? 'বিল্ড ডেমো: আপনার রিপোজিটরি গিটহাবে পুশ করার পর Actions ট্যাব থেকে অথবা লোকাল টার্মিনালে `./gradlew assembleDebug` রান করে সরাসরি তৈরি APK ডাউনলোড করতে পারবেন।'
                  : 'Build demo: Push to GitHub Actions or run `./gradlew assembleDebug` in the android/ directory to generate your production APK.');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'APK বিল্ড ডাউনলোড গাইড' : 'Download APK Build Package'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
