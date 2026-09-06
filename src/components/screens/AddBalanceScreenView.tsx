import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../../types';
import { ADMIN_PAYMENT_NUMBERS } from '../../data/mockData';

interface AddBalanceScreenViewProps {
  user: UserProfile;
  onBack: () => void;
  onAddBalanceSuccess: (data: {
    senderNumber: string;
    amount: number;
    trxId: string;
    balanceType: 'main' | 'drive';
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
  }) => void;
}

export const AddBalanceScreenView: React.FC<AddBalanceScreenViewProps> = ({
  user,
  onBack,
  onAddBalanceSuccess,
}) => {
  const [activeMethod, setActiveMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [balanceType, setBalanceType] = useState<'main' | 'drive'>('main');
  const [senderNumber, setSenderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentAdminConfig = ADMIN_PAYMENT_NUMBERS.find((m) => m.method === activeMethod)!;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text.replace(/[^0-9]/g, ''));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSender = senderNumber.replace(/[^0-9]/g, '');
    if (cleanSender.length < 11 || !cleanSender.startsWith('01')) {
      setError('সঠিক ১১ ডিজিটের সেন্ডার (প্রেরক) নম্বর দিন');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setError('সর্বনিম্ন অ্যাড ব্যালেন্স ১০০ টাকা (Minimum ৳100)');
      return;
    }

    if (trxId.trim().length < 6) {
      setError('সঠিক ট্রানজেকশন আইডি (TrxID) ইনপুট দিন');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {
        // ignore
      }
      onAddBalanceSuccess({
        senderNumber: cleanSender,
        amount: numAmount,
        trxId: trxId.trim().toUpperCase(),
        balanceType,
        paymentMethod: activeMethod,
      });
    }, 800);
  };

  return (
    <div className="flex-1 bg-[#F1F5F9] flex flex-col overflow-y-auto font-sans text-slate-800">
      {/* App Bar (Geometric Balance) */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-20 border-b border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-sm font-bold tracking-tight uppercase">Add Balance (ব্যালেন্স যোগ)</h1>
          </div>
        </div>

        {/* Payment Method Tabs (bKash, Nagad, Rocket) */}
        <div className="grid grid-cols-3 gap-2">
          {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => {
            const isSelected = activeMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => setActiveMethod(method)}
                className={`py-2 rounded-xl text-xs font-black tracking-wide transition-all ${
                  isSelected
                    ? method === 'bKash'
                      ? 'bg-[#E2136E] text-white shadow-xs ring-1 ring-white/50'
                      : method === 'Nagad'
                      ? 'bg-[#F7921E] text-white shadow-xs ring-1 ring-white/50'
                      : 'bg-[#8C3494] text-white shadow-xs ring-1 ring-white/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {method}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Admin Payment Numbers Display Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {activeMethod} Admin Numbers
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Auto Verified
            </span>
          </div>

          {/* Personal Number */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">
                Personal (Send Money):
              </div>
              <div className="text-sm font-mono font-bold text-slate-900">
                {currentAdminConfig.personalNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(currentAdminConfig.personalNumber, 'personal')}
              className="px-2.5 py-1.5 bg-[#0D47A1]/10 text-[#0D47A1] hover:bg-[#0D47A1]/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'personal' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Merchant Number if present */}
          {currentAdminConfig.merchantNumber && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Merchant (Make Payment):
                </div>
                <div className="text-sm font-mono font-bold text-slate-900">
                  {currentAdminConfig.merchantNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(currentAdminConfig.merchantNumber!, 'merchant')}
                className="px-2.5 py-1.5 bg-[#0D47A1]/10 text-[#0D47A1] hover:bg-[#0D47A1]/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'merchant' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed">
            💡 {currentAdminConfig.instructions}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs (Geometric Balance Card) */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3.5">
          {/* Payment Type Selector (Main vs Drive) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Payment Target (ব্যালেন্স টাইপ):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBalanceType('main')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  balanceType === 'main'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Main Balance (মেইন)
              </button>
              <button
                type="button"
                onClick={() => setBalanceType('drive')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  balanceType === 'drive'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Drive Balance (ড্রাইভ)
              </button>
            </div>
          </div>

          {/* Sender Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Sender Mobile Number (যে নম্বর থেকে পাঠিয়েছেন)
            </label>
            <input
              type="tel"
              maxLength={11}
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="01XXXXXXXXX"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Amount (টাকার পরিমাণ - সর্বনিম্ন ১০০)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm font-black text-slate-400">
                ৳
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Transaction ID (TrxID) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Transaction ID (TrxID)
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setTrxId(text.trim());
                  } catch (e) {
                    // ignore
                  }
                }}
                className="text-[10px] text-indigo-600 font-bold hover:underline"
              >
                Paste from Clipboard
              </button>
            </div>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              placeholder="e.g. BK98A19012"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-75 active:scale-95"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Verifying Transaction ID...</span>
              ) : (
                <span>Submit Add Balance Request (রিকোয়েস্ট পাঠান)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
