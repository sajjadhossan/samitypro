import { NextRequest, NextResponse } from 'next/server';
import { BkashGateway } from '@/lib/server/gateways/bkash';
import { NagadGateway } from '@/lib/server/gateways/nagad';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const provider = searchParams.get('provider') || 'BKASH';
  const paymentID = searchParams.get('paymentID');
  const status = searchParams.get('status');
  const invoice = searchParams.get('invoice');
  const amount = searchParams.get('amount') || '0';

  if (status === 'cancel' || status === 'failure') {
    return NextResponse.redirect(new URL(`/?payment_status=cancelled&invoice=${invoice}`, req.url));
  }

  try {
    let trxId = `TRX-${Date.now()}`;
    let verifiedAmount = Number(amount);

    if (provider === 'BKASH') {
      const bkash = new BkashGateway();
      if (bkash.isConfigured() && paymentID && !paymentID.startsWith('SIM-')) {
        const execRes = await bkash.executePayment(paymentID);
        if (execRes.statusCode !== '0000') {
          return NextResponse.redirect(new URL(`/?payment_status=failed&message=${execRes.statusMessage}`, req.url));
        }
        trxId = execRes.trxID || trxId;
        verifiedAmount = Number(execRes.amount || amount);
      }
    } else if (provider === 'NAGAD') {
      const nagad = new NagadGateway();
      if (nagad.isConfigured() && paymentID && !paymentID.startsWith('SIM-')) {
        const verifyRes = await nagad.verifyPayment(paymentID);
        if (verifyRes.status !== 'Success') {
          return NextResponse.redirect(new URL(`/?payment_status=failed&message=Nagad Verification Failed`, req.url));
        }
      }
    }

    // Redirect to web app with success status query params
    return NextResponse.redirect(
      new URL(
        `/?payment_status=success&trxId=${trxId}&amount=${verifiedAmount}&invoice=${invoice}&provider=${provider}`,
        req.url
      )
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(new URL(`/?payment_status=error&message=${encodeURIComponent(msg)}`, req.url));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, paymentID, invoice, amount } = body;

    let trxId = `TRX-${Date.now()}`;
    let isSuccess = true;

    if (provider === 'BKASH') {
      const bkash = new BkashGateway();
      if (bkash.isConfigured() && paymentID && !paymentID.startsWith('SIM-')) {
        const execRes = await bkash.executePayment(paymentID);
        isSuccess = execRes.statusCode === '0000';
        trxId = execRes.trxID || trxId;
      }
    }

    return NextResponse.json({
      success: isSuccess,
      data: {
        trxId,
        paymentID,
        invoice,
        amount,
        voucherNo: `VCH-${Date.now().toString().slice(-6)}`,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      errorCode: 'VERIFICATION_ERROR',
      message: msg
    }, { status: 500 });
  }
}
