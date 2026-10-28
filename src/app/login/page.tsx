'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Lock, Phone, Mail, Eye, EyeOff, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, User
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, setCurrentTenant } = useSamityStore();

  const [identifier, setIdentifier] = useState('01711223344');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Quick-select demo accounts for easy testing
  const demoAccounts = [
    {
      roleNameBn: 'সভাপতি / অ্যাডমিন',
      roleNameEn: 'President / Admin',
      identifier: '01711223344',
      pass: 'Admin@123456',
      badge: 'SAMITY_ADMIN',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      roleNameBn: 'সুপার অ্যাডমিন',
      roleNameEn: 'Super Admin',
      identifier: '01700000001',
      pass: 'Admin@123456',
      badge: 'SUPER_ADMIN',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      roleNameBn: 'ম্যানেজার',
      roleNameEn: 'Manager',
      identifier: '01711556677',
      pass: 'Manager@123456',
      badge: 'MANAGER',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    },
    {
      roleNameBn: 'সাধারণ সদস্য (কবির)',
      roleNameEn: 'General Member',
      identifier: '01712000001',
      pass: 'Member@123456',
      badge: 'MEMBER',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    }
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setIdentifier(acc.identifier);
    setPassword(acc.pass);
    setErrorMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage(lang === 'bn' ? 'মোবাইল/ইমেইল এবং পাসওয়ার্ড দিন' : 'Please enter identifier and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || (lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
        setIsLoading(false);
        return;
      }

      setSuccessMessage(lang === 'bn' ? 'লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...' : 'Login successful! Entering dashboard...');

      // Update client store state
      if (data.data?.user?.id) {
        setCurrentUser(data.data.user.id);
      }
      if (data.data?.user?.tenantId) {
        setCurrentTenant(data.data.user.tenantId);
      }

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 700);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || (lang === 'bn' ? 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।' : 'Network connection error.'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Language Switcher Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 text-xs font-semibold text-slate-300 backdrop-blur-md transition shadow-md"
        >
          {lang === 'bn' ? '🌐 English' : '🌐 বাংলা'}
        </button>
      </div>

      <div className="w-full max-w-md z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-4">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
            {lang === 'bn' ? 'সমিতিপ্রো' : 'SamityPro'}
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            {lang === 'bn' ? 'স্মার্ট ও ডিজিটাল সমিতি ম্যানেজমেন্ট প্ল্যাটফর্ম' : 'Smart & Digital Samity Management Platform'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{lang === 'bn' ? 'অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in to Account'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn' 
                ? 'আপনার রেজিস্টার্ড মোবাইল নম্বর বা ইমেইল দিয়ে লগইন করুন' 
                : 'Enter your registered mobile number or email'}
            </p>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {lang === 'bn' ? 'মোবাইল নম্বর অথবা ইমেইল' : 'Mobile Number or Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="017xxxxxxxx / email@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Test Accounts Section */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? '১-ক্লিকে টেস্ট রোল নির্বাচন করুন' : '1-Click Quick Fill Test Accounts'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className="text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                      {lang === 'bn' ? acc.roleNameBn : acc.roleNameEn}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {acc.identifier}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Register New Samity Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>{lang === 'bn' ? 'আপনার কি নতুন সমিতি রয়েছে? ' : 'Do you have a new samity? '}</span>
            <button
              onClick={() => router.push('/register')}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              {lang === 'bn' ? 'নতুন সমিতি নিবন্ধন করুন' : 'Register New Samity'}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          <p>🔒 {lang === 'bn' ? 'Neon Serverless Cloud PostgreSQL দ্বারা শতভাগ সুরক্ষিত' : '100% Secured by Neon Serverless Cloud PostgreSQL'}</p>
        </div>
      </div>
    </div>
  );
}
