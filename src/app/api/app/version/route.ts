import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    success: true,
    data: {
      latestVersion: '1.1.4',
      minimumSupportedVersion: '1.1.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/samitypro/releases/latest',
      releaseNotes: {
        bn: 'ক্লিন কোড অপটিমাইজেশন, স্টোর টাইপ-গার্ড স্ট্যাবিলিটি এবং পারফরম্যান্স আপডেট v1.1.4',
        en: 'Clean code optimization, store type-guard stability, and performance updates v1.1.4'
      },
      forceUpdate: false
    }
  });
}
