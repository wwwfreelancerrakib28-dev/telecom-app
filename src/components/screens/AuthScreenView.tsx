import React, { useState } from 'react';
import { Radio, Lock, Fingerprint, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthScreenViewProps {
  user: UserProfile;
  onLoginSuccess: () => void;
}

export const AuthScreenView: React.FC<AuthScreenViewProps> = ({ user, onLoginSuccess }) => {
  const [phone, setPhone] = useState(user.phone.replace(/[^0-9]/g, ''));
  const [pin, setPin] = useState('123456');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBiometricActive, setIsBiometricActive] = useState(user.isBiometricEnabled);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      setError('Please enter a valid 11-digit Bangladesh phone number (01XXXXXXXXX).');
      return;
    }
    if (pin.length !== 6) {
      setError('PIN must be exactly 6 digits.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess();
    }, 600);
  };

  const handleBiometricLogin = () => {
    setIsAuthenticating(true);
    setError(null);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess();
    }, 700);
  };

  return (
    <div className="flex-1 bg-[#F1F5F9] p-5 flex flex-col justify-between overflow-y-auto font-sans text-slate-800">
      <div>
        {/* Geometric Balance Logo & Branding */}
        <div className="flex flex-col items-center text-center mt-2 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-md mb-2.5">
            <Radio className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            TelePay BD Reseller
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Telecom Reselling & Flexiload Service
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-indigo-700 rounded-full text-[10px] font-bold mt-2 border border-slate-200/80 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Encrypted PIN & Biometric Guard</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Mobile Number (মোবাইল নম্বর)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-slate-400">
                +88
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                placeholder="01712345678"
                className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports GP, Robi, Banglalink, Airtel & Teletalk
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              6-Digit Security PIN (৬ সংখ্যার পিন)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-widest font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-slate-400">Default Demo PIN: 123456</span>
              <button
                type="button"
                onClick={() => alert('PIN reset instructions sent to your registered SIM via SMS.')}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Forgot PIN?
              </button>
            </div>
          </div>

          {/* Biometric Toggle */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Enable Biometric Login
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Fingerprint Authentication
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBiometricActive(!isBiometricActive)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  isBiometricActive ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    isBiometricActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isAuthenticating ? (
              <span className="animate-pulse flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
              </span>
            ) : (
              'Login to Reseller Account (লগইন)'
            )}
          </button>
        </form>

        {/* Biometric Fast Action */}
        {isBiometricActive && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={isAuthenticating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs"
            >
              <Fingerprint className="w-4 h-4 text-indigo-600" />
              <span>Tap to Quick Login with Fingerprint</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 pb-1 text-center text-[10px] text-slate-400">
        <p className="font-bold tracking-wider uppercase">TelePay BD v1.0.4</p>
        <p className="text-[10px] text-slate-400/80 mt-0.5">
          Integrated with GP, Robi, Banglalink, Airtel & Teletalk API
        </p>
      </div>
    </div>
  );
};
