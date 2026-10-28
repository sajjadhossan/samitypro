'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Lock, Phone, Mail, Eye, EyeOff, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, 
  KeyRound, X, RefreshCw, Smartphone
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

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [forgotPhone, setForgotPhone] = useState('01711223344');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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

  // Forgot Password: Step 1 - Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim()) {
      setForgotError(lang === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Enter mobile number');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPhone.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setForgotError(data.message || (lang === 'bn' ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP'));
        setForgotLoading(false);
        return;
      }

      setForgotSuccess(data.message);
      if (data.data?.debugOtp) {
        setDebugOtp(data.data.debugOtp);
      }
      setCooldown(60);
      setForgotStep('OTP');
      setForgotLoading(false);

    } catch (err: unknown) {
      setForgotError(lang === 'bn' ? 'সার্ভার সংযোগ সমস্যা।' : 'Connection error.');
      setForgotLoading(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP & Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      setForgotError(lang === 'bn' ? '৬-সংখ্যার ওটিপি কোড দিন' : 'Enter 6-digit OTP code');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError(lang === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError(lang === 'bn' ? 'দুটি পাসওয়ার্ড মিলছে না' : 'Passwords do not match');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setForgotError(data.message || (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' : 'Reset failed'));
        setForgotLoading(false);
        return;
      }

      setForgotSuccess(lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' : 'Password updated! Please login with new password.');
      setForgotLoading(false);

      // Auto-fill into login form
      setIdentifier(forgotPhone.trim());
      setPassword(forgotNewPassword);

      setTimeout(() => {
        setIsForgotOpen(false);
        setForgotStep('PHONE');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotSuccess('');
        setSuccessMessage(lang === 'bn' ? 'পাসওয়ার্ড রিসেট সফল হয়েছে! এখন লগইন করুন।' : 'Password reset successful! Sign in now.');
      }, 1500);

    } catch {
      setForgotError(lang === 'bn' ? 'সার্ভার সংযোগ সমস্যা।' : 'Connection error.');
      setForgotLoading(false);
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
                {/* Forgot Password Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    setForgotPhone(identifier.startsWith('01') ? identifier : '01711223344');
                    setForgotError('');
                    setForgotSuccess('');
                    setForgotStep('PHONE');
                    setIsForgotOpen(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer hover:underline"
                >
                  {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                </button>
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
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

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD & OTP RESET MODAL */}
      {/* ========================================================================= */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'পাসওয়ার্ড পুনরুদ্ধার করুন' : 'Reset Password'}
                </h3>
                <p className="text-xs text-slate-400">
                  {forgotStep === 'PHONE' 
                    ? (lang === 'bn' ? 'রেজিস্টার্ড মোবাইল নম্বর দিয়ে ওটিপি নিন' : 'Enter registered mobile number') 
                    : (lang === 'bn' ? 'ওটিপি দিন ও নতুন পাসওয়ার্ড সেট করুন' : 'Enter OTP & new password')}
                </p>
              </div>
            </div>

            {/* Error & Success Messages */}
            {forgotError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Development / Sandbox OTP Helper Badge */}
            {debugOtp && forgotStep === 'OTP' && (
              <div className="mb-4 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
                <span>🧪 টেস্ট ওটিপি কোড: <strong className="font-mono text-cyan-200 tracking-wider text-sm">{debugOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setForgotOtp(debugOtp)}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[10px] font-bold text-cyan-200 transition cursor-pointer"
                >
                  অটো-ফিল
                </button>
              </div>
            )}

            {/* STEP 1: PHONE INPUT */}
            {forgotStep === 'PHONE' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'আপনার অ্যাকাউন্টের মোবাইল নম্বর' : 'Your Account Mobile Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'bn' ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{lang === 'bn' ? '৬-সংখ্যার ওটিপি পাঠান' : 'Send 6-Digit OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: OTP & NEW PASSWORD */
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      {lang === 'bn' ? 'মোবাইলে প্রাপ্ত ওটিপি (OTP)' : 'OTP Received on Mobile'}
                    </label>
                    {cooldown > 0 ? (
                      <span className="text-[11px] text-amber-400 font-mono">
                        {lang === 'bn' ? `পুনরায় পাঠাতে: ${cooldown}s` : `Resend in: ${cooldown}s`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'পুনরায় ওটিপি পাঠান' : 'Resend OTP'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 text-center tracking-[8px] font-mono font-bold text-lg bg-slate-950/80 border border-slate-700/80 rounded-2xl text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="একই পাসওয়ার্ড লিখুন"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('PHONE')}
                    className="flex-1 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                  >
                    {lang === 'bn' ? 'নম্বর পরিবর্তন' : 'Change Number'}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'bn' ? 'পরিবর্তন হচ্ছে...' : 'Updating...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
