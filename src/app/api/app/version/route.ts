import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      latestVersion: '1.8.0',
      minimumSupportedVersion: '1.7.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/samitypro/releases/latest',
      releaseNotes: {
        bn: 'নতুন আপডেট সংযোজন (v1.8.0): প্রফেশনাল ৬টি মডিউল ন্যাভিগেশন, সম্পূর্ণ বাংলা-ইংরেজি লোকালাইজেশন, থ্রি-ডট এডিট/রিনেম ট্রানজাকশন কন্ট্রোল, অ্যাডভান্সড লেটারহেড ও ডিজিটাল সিল ডিজাইনার এবং কিউআর ভেরিফিকেশন সিস্টেম।',
        en: 'New update available (v1.8.0): Professional 6-module navigation, complete Bangla-English localization, three-dot edit/rename transaction control, advanced letterhead & digital seal designer, and QR document verification system.'
      },
      forceUpdate: false
    }
  });
}
