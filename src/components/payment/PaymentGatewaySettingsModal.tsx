'use client';

import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, 
  X, Save, Sliders, Smartphone, Lock, Eye, EyeOff
} from 'lucide-react';
import { useSamityStore } from '@/lib/store';
import { PaymentGatewayConfig } from '@/types';

interface PaymentGatewaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentGatewaySettingsModal({
  isOpen,
  onClose
}: PaymentGatewaySettingsModalProps) {
  const { paymentGatewayConfig, updatePaymentGatewayConfig } = useSamityStore();
  const [form, setForm] = useState<PaymentGatewayConfig>({ ...paymentGatewayConfig });
  const [activeTab, setActiveTab] = useState<'BKASH' | 'NAGAD' | 'ROCKET' | 'SSLCZ' | 'POLICY'>('BKASH');
  const [showSecrets, setShowSecrets] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentGatewayConfig(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                পেমেন্ট গেটওয়ে মার্চেন্ট কনফিগারেশন
              </h2>
              <p className="text-xs text-slate-400">
                বিকাশ, নগদ, রকেট ও এসএসএলকমার্জ এপিআই ক্রেডেনশিয়াল
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1 overflow-x-auto">
          {[
            { id: 'BKASH', label: 'বিকাশ (bKash)' },
            { id: 'NAGAD', label: 'নগদ (Nagad)' },
            { id: 'ROCKET', label: 'রকেট ও উপায়' },
            { id: 'SSLCZ', label: 'SSLCommerz' },
            { id: 'POLICY', label: 'চার্জ ও পলিসি' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* bKash Tab */}
          {activeTab === 'BKASH' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-950/30 border border-pink-500/30">
                <div>
                  <div className="text-sm font-bold text-pink-300">bKash Checkout API</div>
                  <div className="text-xs text-slate-400">বিকাশ অনলাইন পেমেন্ট সক্রিয় বা নিষ্ক্রিয় করুন</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.bKashEnabled} 
                    onChange={e => setForm({ ...form, bKashEnabled: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">মার্চেন্ট বিকাশ নম্বর</label>
                  <input
                    type="text"
                    value={form.bKashMerchantNumber}
                    onChange={e => setForm({ ...form, bKashMerchantNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                    placeholder="01711223344"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">bKash Username</label>
                  <input
                    type="text"
                    value={form.bKashUsername}
                    onChange={e => setForm({ ...form, bKashUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">bKash App Key</label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={form.bKashAppKey}
                  onChange={e => setForm({ ...form, bKashAppKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">bKash App Secret</label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={form.bKashAppSecret}
                  onChange={e => setForm({ ...form, bKashAppSecret: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300"
                >
                  {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecrets ? 'সিক্রেট লুকান' : 'সিক্রেট দেখুন'}</span>
                </button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={form.bKashIsSandbox}
                    onChange={e => setForm({ ...form, bKashIsSandbox: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                  <span>স্যান্ডবক্স মোড (টেস্টিং)</span>
                </label>
              </div>
            </div>
          )}

          {/* Nagad Tab */}
          {activeTab === 'NAGAD' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-950/30 border border-orange-500/30">
                <div>
                  <div className="text-sm font-bold text-orange-300">Nagad Direct IPN API</div>
                  <div className="text-xs text-slate-400">নগদ অনলাইন পেমেন্ট গেটওয়ে সক্রিয় করুন</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.nagadEnabled} 
                    onChange={e => setForm({ ...form, nagadEnabled: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">মার্চেন্ট নগদ নম্বর</label>
                  <input
                    type="text"
                    value={form.nagadMerchantNumber}
                    onChange={e => setForm({ ...form, nagadMerchantNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={form.nagadMerchantId}
                    onChange={e => setForm({ ...form, nagadMerchantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nagad Public Key</label>
                <textarea
                  rows={2}
                  value={form.nagadPublicKey}
                  onChange={e => setForm({ ...form, nagadPublicKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Rocket & Upay Tab */}
          {activeTab === 'ROCKET' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-300">রকেট (DBBL Rocket) মার্চেন্ট</span>
                  <input 
                    type="checkbox"
                    checked={form.rocketEnabled}
                    onChange={e => setForm({ ...form, rocketEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700"
                  />
                </div>
                <input
                  type="text"
                  placeholder="রকেট মার্চেন্ট নম্বর (১২ ডিজিট)"
                  value={form.rocketMerchantNumber}
                  onChange={e => setForm({ ...form, rocketMerchantNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-cyan-300">উপায় (UCB Upay) মার্চেন্ট</span>
                  <input 
                    type="checkbox"
                    checked={form.upayEnabled}
                    onChange={e => setForm({ ...form, upayEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                  />
                </div>
                <input
                  type="text"
                  placeholder="উপায় মার্চেন্ট নম্বর"
                  value={form.upayMerchantNumber}
                  onChange={e => setForm({ ...form, upayMerchantNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* SSLCommerz Tab */}
          {activeTab === 'SSLCZ' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/30 border border-blue-500/30">
                <div>
                  <div className="text-sm font-bold text-blue-300">SSLCommerz Hosted Checkout</div>
                  <div className="text-xs text-slate-400">ভিসা, মাস্টারকার্ড ও ইন্টারনেট ব্যাংকিং পেমেন্ট</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.sslczEnabled} 
                    onChange={e => setForm({ ...form, sslczEnabled: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Store ID</label>
                  <input
                    type="text"
                    value={form.sslczStoreId}
                    onChange={e => setForm({ ...form, sslczStoreId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Store Password</label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={form.sslczStorePassword}
                    onChange={e => setForm({ ...form, sslczStorePassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Policy Tab */}
          {activeTab === 'POLICY' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  গেটওয়ে সার্ভিস চার্জ হার (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.serviceChargePercentage}
                    onChange={e => setForm({ ...form, serviceChargePercentage: Number(e.target.value) })}
                    className="w-32 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-bold"
                  />
                  <span className="text-xs text-slate-400">
                    (সদস্য যখন অনলাইনে পেমেন্ট করবেন, তখন এই শতাংশ হারে চার্জ যোগ হবে)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    স্বয়ংক্রিয় ভাউচার ও রসিদ অনুমোদন
                  </div>
                  <div className="text-[11px] text-slate-400">
                    পেমেন্ট ভেরিফাই হওয়ামাত্রই ক্যাশ বুক ও পাসবইতে জমা হবে
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={form.autoApproveVerifiedPayments}
                  onChange={e => setForm({ ...form, autoApproveVerifiedPayments: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                সফলভাবে সংরক্ষিত হয়েছে!
              </span>
            ) : <span />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                বন্ধ করুন
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                <Save className="w-4 h-4" />
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
