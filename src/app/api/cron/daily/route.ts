import { NextRequest, NextResponse } from 'next/server';
import { DailyCronService } from '@/lib/server/cron/dailyTasks';

export async function GET(req: NextRequest) {
  // Check authorization header for Vercel Cron or custom cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow Vercel's internal cron header
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    if (!isVercelCron) {
      return NextResponse.json({
        success: false,
        errorCode: 'UNAUTHORIZED_CRON',
        message: 'অননুমোদিত ক্রন অ্যাক্সেস (Unauthorized Cron execution attempt)'
      }, { status: 401 });
    }
  }

  try {
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'samity-ekota';
    const cronResult = await DailyCronService.executeDailyJobs(tenantId);

    return NextResponse.json({
      success: true,
      message: 'দৈনিক ক্রন শিডিউল সফলভাবে কার্যকর হয়েছে (Daily cron executed successfully)',
      data: cronResult,
      executedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      errorCode: 'CRON_EXECUTION_FAILED',
      message: msg
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
