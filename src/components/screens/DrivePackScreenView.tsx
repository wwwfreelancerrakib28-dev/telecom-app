import React, { useState } from 'react';
import {
  ArrowLeft,
  Wifi,
  PhoneCall,
  Calendar,
  Zap,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OperatorId, DrivePackage, UserProfile } from '../../types';
import { OPERATORS, INITIAL_PACKAGES } from '../../data/mockData';
import { SlideToConfirm } from '../SlideToConfirm';

interface DrivePackScreenViewProps {
  user: UserProfile;
  onBack: () => void;
  onBuySuccess: (data: {
    recipientPhone: string;
    pack: DrivePackage;
  }) => void;
}

export const DrivePackScreenView: React.FC<DrivePackScreenViewProps> = ({
  user,
  onBack,
  onBuySuccess,
}) => {
  const [selectedOperator, setSelectedOperator] = useState<OperatorId>('gp');
  const [activeCategory, setActiveCategory] = useState<'all' | 'combo' | 'internet' | 'minute'>('all');
  const [selectedPackForBuy, setSelectedPackForBuy] = useState<DrivePackage | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const operatorsList = (Object.keys(OPERATORS) as OperatorId[]);
  const currentOp = OPERATORS[selectedOperator];

  const filteredPacks = INITIAL_PACKAGES.filter((p) => {
    if (p.operator !== selectedOperator) return false;
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    return true;
  });

  const handleOpenBuy = (pack: DrivePackage) => {
    if (user.driveBalance < pack.offerPrice) {
      alert(`পর্যাপ্ত ড্রাইভ ব্যালেন্স নেই! আপনার ব্যালেন্স ৳${user.driveBalance.toFixed(2)}। অ্যাড ব্যালেন্স করুন।`);
      return;
    }
    setSelectedPackForBuy(pack);
    setCustomerPhone('');
    setPin('');
    setError(null);
  };

  const handleConfirmPurchase = () => {
    const cleanNumber = customerPhone.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 11 || !cleanNumber.startsWith('01')) {
      setError('সঠিক ১১ ডিজিটের গ্রাহক নম্বর দিন');
      return;
    }

    if (pin.trim() !== '1234' && pin.trim() !== user.pin && pin.trim() !== '123456') {
      setError('ভুল পিন নম্বর! (ডেমো পিন: 1234)');
      return;
    }

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      const pack = selectedPackForBuy!;
      setSelectedPackForBuy(null);
      onBuySuccess({
        recipientPhone: cleanNumber,
        pack,
      });
    }, 600);
  };

  return (
    <div className="flex-1 bg-[#F1F5F9] flex flex-col overflow-y-auto font-sans text-slate-800">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-20 border-b border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-sm font-bold tracking-tight uppercase">Drive Pack & Offers</h1>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Drive Balance</div>
            <div className="text-xs font-black text-orange-400">
              ৳{user.driveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* TabBar Categorized by Operators (Geometric Balance Style) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {operatorsList.map((opKey) => {
            const op = OPERATORS[opKey];
            const isSelected = selectedOperator === opKey;

            return (
              <button
                key={opKey}
                onClick={() => setSelectedOperator(opKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: op.color }}
                />
                <span>{op.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="bg-white px-4 py-2 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto">
        {(['all', 'combo', 'internet', 'minute'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Packs' : cat}
          </button>
        ))}
      </div>

      {/* List of Offers */}
      <div className="p-4 space-y-3 flex-1">
        {filteredPacks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm font-semibold">No active drive packs in this category.</p>
          </div>
        ) : (
          filteredPacks.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all relative overflow-hidden"
            >
              {/* Operator Color Ribbon on top */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: currentOp.color }}
              />

              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {pack.title}
                  </h3>
                  {pack.division && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Region: {pack.division}
                    </span>
                  )}
                </div>

                {/* Cashback / Commission Badge (Geometric Balance High Contrast) */}
                <div className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black tracking-tight shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>৳{pack.cashback} Cashback</span>
                </div>
              </div>

              {/* Data, Minutes, Validity Info */}
              <div className="flex items-center gap-3 text-xs text-slate-600 py-1.5 border-y border-slate-100 mb-3">
                {pack.dataAllowance !== '0 GB' && (
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold">{pack.dataAllowance}</span>
                  </div>
                )}
                {pack.minuteAllowance !== '0 Min' && (
                  <div className="flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold">{pack.minuteAllowance}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-500">{pack.validity}</span>
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 line-through">
                    ৳{pack.regularPrice}
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    ৳{pack.offerPrice}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBuy(pack)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Activate / Buy</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buy Modal Sheet */}
      {selectedPackForBuy && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-100 animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Confirm Drive Package Order
              </h3>
              <button
                onClick={() => setSelectedPackForBuy(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pack details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900">{selectedPackForBuy.title}</div>
              <div className="flex justify-between text-slate-600">
                <span>Offer Price (মূল্য):</span>
                <span className="font-black text-indigo-600">৳{selectedPackForBuy.offerPrice}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Cashback Commission:</span>
                <span>+৳{selectedPackForBuy.cashback}</span>
              </div>
            </div>

            {error && (
              <div className="p-2 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Recipient Phone */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Customer Mobile Number (গ্রাহকের নম্বর)
              </label>
              <input
                type="tel"
                maxLength={11}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="01XXXXXXXXX"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* PIN Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4-Digit Security PIN (৪ সংখ্যার পিন)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full text-center tracking-[1em] py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Demo PIN: 1234</span>
            </div>

            {/* Slide to Confirm */}
            <SlideToConfirm
              label="Slide to Purchase Pack >>"
              disabled={customerPhone.length !== 11 || pin.length !== 4}
              onConfirm={handleConfirmPurchase}
            />
          </div>
        </div>
      )}
    </div>
  );
};
