'use client';

import React, { useState } from 'react';
import { 
  CreditCard, Smartphone, CheckCircle2, AlertCircle, 
  X, Printer, ShieldCheck, ArrowRight, ExternalLink,
  QrCode, RefreshCw, Copy, Check
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { PaymentGatewayProvider, PaymentPurpose, OnlinePaymentTransaction } from '@/types';
import { formatCurrency, toBengaliNumber } from '@/lib/i18n';

interface OnlinePaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledPurpose?: PaymentPurpose;
  prefilledAmount?: number;
  prefilledReferenceId?: string;
  memberId?: string;
}

export function OnlinePaymentCheckoutModal({
  isOpen,
  onClose,
  prefilledPurpose = 'MONTHLY_SUBSCRIPTION',
  prefilledAmount = 1500,
  prefilledReferenceId = '',
  memberId
}: OnlinePaymentCheckoutModalProps) {
  const { 
    members, currentUser, activeTenant, letterhead,
    paymentGatewayConfig, initiateOnlinePayment, verifyOnlinePayment 
  } = useSamityStore();

  const [step, setStep] = useState<'SELECT' | 'GATEWAY_SIMULATOR' | 'SUCCESS'>('SELECT');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => {
    if (memberId) return memberId;
    if (currentUser?.role === 'MEMBER') {
      const found = members.find(m => m.phone === currentUser.phone);
      return found ? found.id : members[0]?.id || '';
    }
    return members[0]?.id || '';
  });

  const [purpose, setPurpose] = useState<PaymentPurpose>(prefilledPurpose);
  const [amount, setAmount] = useState<number>(prefilledAmount);
  const [gateway, setGateway] = useState<PaymentGatewayProvider>('BKASH');
  const [referenceId, setReferenceId] = useState<string>(prefilledReferenceId);
  const [notes, setNotes] = useState<string>('');

  // Active Transaction State
  const [activeTx, setActiveTx] = useState<OnlinePaymentTransaction | null>(null);
  const [trxIdInput, setTrxIdInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentMember = members.find(m => m.id === selectedMemberId) || members[0];
  const chargePercent = paymentGatewayConfig.serviceChargePercentage || 1.5;
  const chargeAmount = Math.round((amount * (chargePercent / 100)) * 100) / 100;
  const totalAmount = amount + chargeAmount;

  const getMerchantNumber = (gw: PaymentGatewayProvider) => {
    switch (gw) {
      case 'BKASH': return paymentGatewayConfig.bKashMerchantNumber || '01711223344';
      case 'NAGAD': return paymentGatewayConfig.nagadMerchantNumber || '01711223344';
      case 'ROCKET': return paymentGatewayConfig.rocketMerchantNumber || '017112233448';
      case 'UPAY': return paymentGatewayConfig.upayMerchantNumber || '01711223344';
      default: return '01711223344';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleProceedToGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;
    if (amount <= 0) return;

    try {
      const tx = initiateOnlinePayment({
        memberId: currentMember.id,
        purpose,
        amount,
        gateway,
        referenceId,
        notes
      });
      setActiveTx(tx);
      setTrxIdInput('');
      setVerificationError('');
      setStep('GATEWAY_SIMULATOR');
    } catch (err: unknown) {
      alert((err as Error).message || 'পেমেন্ট তৈরি করতে সমস্যা হয়েছে');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTx) return;
    if (!trxIdInput.trim()) {
      setVerificationError('অনুগ্রহ করে পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID) লিখুন');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    setTimeout(() => {
      try {
        const verifiedTx = verifyOnlinePayment({
          paymentId: activeTx.id,
          trxId: trxIdInput.trim().toUpperCase(),
          verifiedBy: `${activeTx.gateway} Instant IPN Gateway`
        });
        setActiveTx(verifiedTx);
        setIsVerifying(false);
        setStep('SUCCESS');
      } catch (err: unknown) {
        setIsVerifying(false);
        setVerificationError((err as Error).message || 'ভেরিফিকেশন সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
      }
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetModal = () => {
    setStep('SELECT');
    setActiveTx(null);
    setTrxIdInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                অনলাইন পেমেন্ট গেটওয়ে
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  bKash • Nagad • Rocket
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                স্বয়ংক্রিয় ডিজিটাল ট্রানজ্যাকশন ও তাৎক্ষণিক রসিদ গ্রহণ
              </p>
            </div>
          </div>
          <button 
            onClick={resetModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: SELECT PURPOSE, AMOUNT & GATEWAY */}
        {step === 'SELECT' && (
          <form onSubmit={handleProceedToGateway} className="p-4 sm:p-6 space-y-4">
            {/* Member Selector (if not fixed) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                সদস্য নির্বাচন করুন <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nameBn} ({m.memberCode}) - {m.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  পেমেন্টের উদ্দেশ্য <span className="text-rose-400">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value as PaymentPurpose)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MONTHLY_SUBSCRIPTION">মাসিক সদস্য চাঁদা</option>
                  <option value="SAVINGS_DEPOSIT">সাধারণ সঞ্চয় জমা</option>
                  <option value="DPS_INSTALLMENT">ডিপিএস (DPS) কিস্তি</option>
                  <option value="LOAN_INSTALLMENT">ঋণের কিস্তি (Loan EMI)</option>
                  <option value="SHARE_PURCHASE">সমিতির শেয়ার ক্রয়</option>
                  <option value="ADMISSION_FEE">সদস্য ভর্তি ফি</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  টাকার পরিমাণ (BDT) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                পেমেন্ট গেটওয়ে নির্বাচন করুন <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'BKASH', label: 'বিকাশ (bKash)', bg: 'from-pink-600/30 to-rose-700/20', border: 'border-pink-500/50', activeText: 'text-pink-400' },
                  { id: 'NAGAD', label: 'নগদ (Nagad)', bg: 'from-amber-600/30 to-orange-700/20', border: 'border-orange-500/50', activeText: 'text-orange-400' },
                  { id: 'ROCKET', label: 'রকেট (Rocket)', bg: 'from-purple-600/30 to-indigo-700/20', border: 'border-purple-500/50', activeText: 'text-purple-400' },
                  { id: 'SSLCOMMERZ', label: 'কার্ড/ব্যাংক', bg: 'from-blue-600/30 to-cyan-700/20', border: 'border-blue-500/50', activeText: 'text-blue-400' },
                ].map(item => {
                  const isSelected = gateway === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setGateway(item.id as PaymentGatewayProvider)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected 
                          ? `bg-gradient-to-br ${item.bg} ${item.border} shadow-lg ring-1 ring-indigo-500`
                          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Smartphone className={`w-4 h-4 ${isSelected ? item.activeText : 'text-slate-400'}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fee & Total Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>মূল পরিমাণ:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>গেটওয়ে ফি ({chargePercent}%):</span>
                <span className="text-slate-200">{formatCurrency(chargeAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-emerald-400">
                <span>সর্বমোট প্রদেয়:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetModal}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                পেমেন্টে এগিয়ে যান
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: GATEWAY PAYMENT SIMULATOR / MERCHANT INSTRUCTIONS */}
        {step === 'GATEWAY_SIMULATOR' && activeTx && (
          <form onSubmit={handleVerify} className="p-4 sm:p-6 space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {gateway} মার্চেন্ট পেমেন্ট ইন্সট্রাকশন
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Ref: {activeTx.gatewayPaymentId}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-500">মার্চেন্ট বিকাশ/নগদ নম্বর</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">
                      {getMerchantNumber(gateway)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(getMerchantNumber(gateway))}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 text-slate-400 text-[11px]">
                  <p>১. আপনার <strong className="text-slate-200">{gateway}</strong> মোবাইল অ্যাপ চালু করে <strong>"Payment"</strong> অপশন সিলেক্ট করুন।</p>
                  <p>২. মার্চেন্ট নম্বর <strong className="text-amber-400 font-mono">{getMerchantNumber(gateway)}</strong> লিখুন।</p>
                  <p>৩. টাকার পরিমাণ <strong className="text-emerald-400 font-bold">{formatCurrency(activeTx.totalPaid)}</strong> লিখুন।</p>
                  <p>৪. রেফারেন্স হিসেবে <strong className="text-slate-200 font-mono">{activeTx.memberCode}</strong> প্রদান করুন ও পিন দিন।</p>
                  <p>৫. পেমেন্ট সফল হওয়ার পর প্রাপ্ত <strong className="text-indigo-400">TrxID</strong> নিচে লিখে ভেরিফাই করুন।</p>
                </div>
              </div>
            </div>

            {/* TrxID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ট্রানজ্যাকশন আইডি (TrxID) দিন <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="যেমন: 9B72AK891X"
                  value={trxIdInput}
                  onChange={e => setTrxIdInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setTrxIdInput(`SIM${Math.floor(10000000 + Math.random() * 90000000)}`)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 text-xs font-medium"
                  title="ডেমো ট্রানজ্যাকশন আইডি অটো ফিল"
                >
                  অটো ফিল
                </button>
              </div>
              {verificationError && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {verificationError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('SELECT')}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
              >
                পিছনে
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    ভেরিফাই হচ্ছে...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    পেমেন্ট ভেরিফাই ও রসিদ তৈরি
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS & DIGITAL RECEIPT */}
        {step === 'SUCCESS' && activeTx && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                পেমেন্ট সফলভাবে গৃহীত ও ভেরিফাইড হয়েছে!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                সদস্যের হিসাব ও সমিতির সাধারণ খতিয়ানে স্বয়ংক্রিয়ভাবে পোস্টিং সম্পন্ন হয়েছে।
              </p>
            </div>

            {/* Printable Digital Receipt Card */}
            <div className="p-4 rounded-xl bg-white text-slate-900 shadow-md border border-slate-200 text-xs font-sans space-y-2.5">
              <div className="text-center border-b border-slate-200 pb-2">
                <div className="font-bold text-sm text-slate-900">{letterhead.samityNameBn}</div>
                <div className="text-[10px] text-slate-600">{letterhead.addressBn}</div>
                <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">
                  ডিজিটাল অনলাইন পেমেন্ট মানি রিসিট
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">রসিদ নম্বর:</span>{' '}
                  <span className="font-bold font-mono">{activeTx.receiptNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">তারিখ:</span>{' '}
                  <span className="font-semibold">{activeTx.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">সদস্যের নাম:</span>{' '}
                  <span className="font-bold">{activeTx.memberNameBn}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">সদস্য কোড:</span>{' '}
                  <span className="font-mono font-bold">{activeTx.memberCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">পেমেন্ট মাধ্যম:</span>{' '}
                  <span className="font-bold">{activeTx.gateway}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">TrxID:</span>{' '}
                  <span className="font-mono font-bold text-indigo-700">{activeTx.trxId}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-100 border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-slate-800">
                    {activeTx.purpose === 'MONTHLY_SUBSCRIPTION' ? 'মাসিক সদস্য চাঁদা' :
                     activeTx.purpose === 'SAVINGS_DEPOSIT' ? 'সাধারণ সঞ্চয় আমানত' :
                     activeTx.purpose === 'DPS_INSTALLMENT' ? 'ডিপিএস কিস্তি জমা' : 'ঋণের কিস্তি পরিশোধ'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">ভাউচার: {activeTx.voucherId}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-emerald-700">{formatCurrency(activeTx.amount)}</div>
                  <div className="text-[9px] text-slate-500">চার্জ: {formatCurrency(activeTx.chargeAmount)}</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-200">
                ইলেকট্রনিক্যালি ভেরিফাইড ডকুমেন্ট • কোনো হস্তাক্ষর স্বাক্ষরের প্রয়োজন নেই
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                রসিদ প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={resetModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
