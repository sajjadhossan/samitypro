import { NextRequest, NextResponse } from 'next/server';
import { BkashGateway } from '@/lib/server/gateways/bkash';
import { NagadGateway } from '@/lib/server/gateways/nagad';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      provider, 
      amount, 
      memberId, 
      tenantId, 
      purpose, 
      payerPhone, 
      referenceNo 
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'বৈধ পেমেন্ট পরিমাণ প্রদান করুন (Valid payment amount is required)'
      }, { status: 400 });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const callbackURL = `${protocol}://${host}/api/payment/verify?provider=${provider}&invoice=${invoiceNumber}`;

    if (provider === 'BKASH') {
      const bkash = new BkashGateway();
      if (!bkash.isConfigured()) {
        // Safe development simulation fallback
        return NextResponse.json({
          success: true,
          isSimulated: true,
          data: {
            paymentID: `SIM-BKASH-${Date.now()}`,
            bkashURL: `${callbackURL}&status=success&paymentID=SIM-BKASH-${Date.now()}&amount=${amount}`,
            invoiceNumber,
            amount,
            provider: 'bKash (Simulator Mode)'
          }
        });
      }

      const res = await bkash.createPayment({
        amount: Number(amount),
        merchantInvoiceNumber: invoiceNumber,
        callbackURL,
        payerReference: payerPhone || 'Member'
      });

      return NextResponse.json({
        success: true,
        data: res
      });
    }

    if (provider === 'NAGAD') {
      const nagad = new NagadGateway();
      if (!nagad.isConfigured()) {
        return NextResponse.json({
          success: true,
          isSimulated: true,
          data: {
            paymentID: `SIM-NAGAD-${Date.now()}`,
            paymentUrl: `${callbackURL}&status=success&paymentID=SIM-NAGAD-${Date.now()}&amount=${amount}`,
            invoiceNumber,
            amount,
            provider: 'Nagad (Simulator Mode)'
          }
        });
      }

      const res = await nagad.initPayment({
        orderId: invoiceNumber,
        amount: Number(amount),
        callbackUrl: callbackURL
      });

      return NextResponse.json({
        success: true,
        data: res
      });
    }

    return NextResponse.json({
      success: false,
      errorCode: 'UNSUPPORTED_PROVIDER',
      message: 'শুধুমাত্র bKash অথবা Nagad সমর্থিত (Only bKash or Nagad supported)'
    }, { status: 400 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      errorCode: 'PAYMENT_INIT_FAILED',
      message: msg
    }, { status: 500 });
  }
}
