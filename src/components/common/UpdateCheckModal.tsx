'use client';

import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';
import { APP_VERSION } from '@/types';
import { useSamityStore } from '@/lib/store';

interface UpdateCheckModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isManualCheck?: boolean;
}

export function UpdateCheckModal({ isOpen, onClose, isManualCheck = false }: UpdateCheckModalProps) {
  const { language } = useSamityStore();
  const isBn = language === 'bn';

  const [isLoading, setIsLoading] = useState(false);
  const [versionData, setVersionData] = useState<{
    latestVersion: string;
    minimumSupportedVersion: string;
    apkDownloadUrl: string;
    releaseNotes: { bn: string; en: string };
    forceUpdate: boolean;
  } | null>(null);

  const cleanCurrent = APP_VERSION.replace(/^v/, '');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/app/version')
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) {
            setVersionData(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isUpToDate = versionData && versionData.latestVersion === cleanCurrent;
  const hasUpdate = versionData && versionData.latestVersion !== cleanCurrent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {isBn ? 'সফটওয়্যার ভার্সন ও আপডেট চেক' : 'App Version & Update Check'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {isBn ? 'বর্তমান ইনস্টল্ড ভার্সন:' : 'Installed Version:'} {APP_VERSION}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300">
              {isBn ? 'ক্লাউড রিলিজ সার্ভারে আপডেট চেক করা হচ্ছে...' : 'Checking for updates from cloud server...'}
            </p>
          </div>
        ) : isUpToDate ? (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-400">
                {isBn ? 'আপনার অ্যাপটি সম্পূর্ণ আপ-টু-ডেট!' : 'Your application is up to date!'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? `আপনি সর্বশেষ অফিসিয়াল ভার্সন ${APP_VERSION} ব্যবহার করছেন।` 
                  : `You are running the latest official version ${APP_VERSION}.`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              {isBn ? 'ঠিক আছে' : 'OK / Close'}
            </button>
          </div>
        ) : hasUpdate ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <div className="font-bold">
                  {isBn ? `নতুন আপডেট v${versionData.latestVersion} উপলব্ধ!` : `New Update v${versionData.latestVersion} Available!`}
                </div>
                <div className="text-[11px] text-amber-200/80 mt-0.5">
                  {isBn ? versionData.releaseNotes.bn : versionData.releaseNotes.en}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? 'বর্তমান ভার্সন:' : 'Current Version:'}</span>
                <span className="font-mono text-slate-300">{APP_VERSION}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? 'সর্বশেষ রিলিজ:' : 'Latest Release:'}</span>
                <span className="font-mono text-emerald-400 font-bold">v{versionData.latestVersion}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={versionData.apkDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isBn ? 'নতুন ভার্সন APK ডাউনলোড করুন' : 'Download New Version APK'}
              </a>
              {!versionData.forceUpdate && (
                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer"
                >
                  {isBn ? 'পরে আপডেট করব' : 'Later'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-3">
            <p className="text-xs text-slate-400">
              {isBn ? 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।' : 'Could not connect to update server.'}
            </p>
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
