import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Contact,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OperatorId, ConnectionType, UserProfile } from '../../types';
import { OPERATORS, CONTACT_PRESETS, detectOperatorFromPhone } from '../../data/mockData';
import { SlideToConfirm } from '../SlideToConfirm';

interface FlexiloadScreenViewProps {
  user: UserProfile;
  onBack: () => void;
  onRechargeSuccess: (data: {
    recipient: string;
    operator: OperatorId;
    connectionType: ConnectionType;
    amount: number;
  }) => void;
}

export const FlexiloadScreenView: React.FC<FlexiloadScreenViewProps> = ({
  user,
  onBack,
  onRechargeSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<OperatorId>('gp');
  const [connectionType, setConnectionType] = useState<ConnectionType>('prepaid');
  const [amount, setAmount] = useState('');
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-detect operator whenever phone number changes
  useEffect(() => {
    const detected = detectOperatorFromPhone(phoneNumber);
    if (detected) {
      setSelectedOperator(detected);
    }
  }, [phoneNumber]);

  const quickAmounts = [20, 50, 100, 200, 500];

  const handleOpenConfirmation = () => {
    setValidationError(null);
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (cleanNumber.length !== 11 || !cleanNumber.startsWith('01')) {
      setValidationError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setValidationError('সর্বনিম্ন রিচার্জ পরিমাণ ১০ টাকা (Min amount ৳10)');
      return;
    }

    if (numAmount > user.mainBalance) {
      setValidationError(
        `পর্যাপ্ত মেইন ব্যালেন্স নেই! আপনার ব্যালেন্স ৳${user.mainBalance.toFixed(2)}`
      );
      return;
    }

    setPin('');
    setPinError(null);
    setIsBottomSheetOpen(true);
  };

  const handleExecuteRecharge = () => {
    if (pin.trim() !== '1234' && pin.trim() !== user.pin && pin.trim() !== '123456') {
      setPinError('ভুল পিন নম্বর! (ডেমো পিন: 1234)');
      return;
    }

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setIsBottomSheetOpen(false);
      onRechargeSuccess({
        recipient: phoneNumber,
        operator: selectedOperator,
        connectionType,
        amount: parseFloat(amount),
      });
    }, 600);
  };

  const currentOp = OPERATORS[selectedOperator];

  return (
    <div className="flex-1 bg-[#F1F5F9] flex flex-col overflow-y-auto font-sans text-slate-800">
      {/* Geometric Balance App Bar */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-20 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 active:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-sm font-bold tracking-tight uppercase">Flexiload / Top-Up</h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Main Balance</div>
          <div className="text-xs font-black text-indigo-400">
            ৳{user.mainBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. Mobile Number Input with Contacts Picker */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mobile Number (গ্রাহকের নম্বর)
            </label>
            <span className="text-[10px] text-indigo-600 font-bold">
              Auto Prefix Active
            </span>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center gap-1.5 text-slate-400">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-500">+88</span>
            </div>
            <input
              type="tel"
              value={phoneNumber}
              maxLength={11}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="01XXXXXXXXX"
              className="w-full pl-16 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold tracking-wide text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setIsContactsModalOpen(true)}
              className="absolute right-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Pick from contacts"
            >
              <Contact className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Operator Selector with Auto-Detect Feedback */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            Operator (অপারেটর নির্বাচন)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(OPERATORS) as OperatorId[]).map((opKey) => {
              const op = OPERATORS[opKey];
              const isSelected = selectedOperator === opKey;

              return (
                <button
                  key={opKey}
                  type="button"
                  onClick={() => setSelectedOperator(opKey)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white mb-1 shadow-xs"
                    style={{ backgroundColor: op.color }}
                  >
                    {op.logoText}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                    {op.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentOp.color }}
            />
            Selected: <span className="font-bold text-slate-800">{currentOp.name}</span>{' '}
            ({currentOp.prefixes.join(', ')})
          </p>
        </div>

        {/* 3. Connection Type (Prepaid / Postpaid / Skitto) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            Connection Type (সংযোগের ধরন)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['prepaid', 'postpaid', 'skitto'] as ConnectionType[]).map((type) => {
              const isSelected = connectionType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setConnectionType(type)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl uppercase tracking-wider border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Amount Field + Preset Chips */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Recharge Amount (টাকার পরিমাণ)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-base font-black text-slate-400">
              ৳
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Quick preset amount chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200/80"
              >
                ৳{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Proceed Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenConfirmation}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Confirmation (এগিয়ে যান)</span>
          </button>
        </div>
      </div>

      {/* Contact Picker Modal Simulator */}
      {isContactsModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">
                ফোনবুক থেকে নম্বর নির্বাচন করুন
              </h3>
              <button
                onClick={() => setIsContactsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 mt-2 max-h-60 overflow-y-auto">
              {CONTACT_PRESETS.map((contact, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPhoneNumber(contact.phone.replace(/[^0-9]/g, ''));
                    setIsContactsModalOpen(false);
                  }}
                  className="w-full py-2.5 px-1 text-left flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      {contact.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {contact.phone}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#0D47A1] font-bold">Select</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Bottom Sheet (Requested Specification) */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-100 max-h-[90%] overflow-y-auto animate-in slide-in-from-bottom">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Flexiload Confirmation
              </h3>
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs mb-4">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Recipient Number:</span>
                <span className="font-mono font-bold text-slate-900">{phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Operator:</span>
                <span className="font-bold flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: currentOp.color }}
                  />
                  {currentOp.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Connection:</span>
                <span className="font-bold uppercase text-slate-800">{connectionType}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Recharge Amount:</span>
                <span className="font-black text-sm text-indigo-600">৳{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Service Fee:</span>
                <span className="font-bold text-emerald-600">৳0.00 (Free)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total Deduction:</span>
                <span className="font-black text-sm text-slate-900">৳{parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>

            {/* 4-Digit Security PIN Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Enter 4-Digit Security PIN (৪ সংখ্যার পিন)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full text-center tracking-[1em] py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-slate-400">Default Demo PIN: 1234</span>
                {pinError && (
                  <span className="text-[11px] font-bold text-rose-600 animate-pulse">
                    {pinError}
                  </span>
                )}
              </div>
            </div>

            {/* Hold / Slide to Confirm Widget */}
            <div className="pt-1">
              <SlideToConfirm
                label="Slide to Confirm Recharge >>"
                disabled={pin.length !== 4}
                onConfirm={handleExecuteRecharge}
              />
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              Requires 4-Digit PIN before sliding
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
