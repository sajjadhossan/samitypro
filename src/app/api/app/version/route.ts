import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      latestVersion: '2.0.0',
      minimumSupportedVersion: '1.8.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/samitypro/releases/latest',
      releaseNotes: {
        bn: 'নতুন আপডেট সংযোজন (v2.0.0): মডিউল ৭ (স্টাফ পেরোল, হাজিরা, অগ্রিম ও বোনাস ব্যবস্থাপনা) এবং মডিউল ৮ (এসএমএস ও সরাসরি হোয়াটসঅ্যাপ নোটিফিকেশন গেটওয়ে, ব্যালেন্স রিচার্জ ও অটো নোটিফিকেশন)।',
        en: 'New update available (v2.0.0): Module 7 (Staff Payroll, Attendance, Advance & Bonus Management) and Module 8 (SMS & Direct WhatsApp Notification Gateway, Balance Recharge & Automated Alerts).'
      },
      forceUpdate: false
    }
  });
}
