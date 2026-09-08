import React, { useState } from 'react';
import { ShieldCheck, User, Phone, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthScreenProps {
  user: UserProfile;
  onLoginSuccess: (updatedUser?: UserProfile) => void;
}

export const AuthScreenView: React.FC<AuthScreenProps> = ({ user, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  
  // ফর্ম স্টেট
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length < 11) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }

    if (!pin || pin.length < 4) {
      setError('কমপক্ষে ৪ ডিজিটের পিন/পাসওয়ার্ড দিন');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError('আপনার পুরো নাম লিখুন');
        return;
      }

      // নতুন অ্যাকাউন্ট তৈরির ডাটা
      const newUser: UserProfile = {
        ...user,
        name: name.trim(),
        phone: phone.trim(),
        pin: pin.trim(),
        mainBalance: 0,
        driveBalance: 0,
        resellerLevel: 'Sub-Admin'
      };

      localStorage.setItem('telecom_user', JSON.stringify(newUser));
      onLoginSuccess(newUser);
    } else {
      // লগইন ভ্যালিডেশন
      const savedUserStr = localStorage.getItem('telecom_user');
      const currentUserData = savedUserStr ? JSON.parse(savedUserStr) : user;

      if (currentUserData.phone === phone.trim() && currentUserData.pin === pin.trim()) {
        onLoginSuccess(currentUserData);
      } else {
        // নতুন ইউজারের সুবিধার্থে প্রথমবার যেকোনো পিনে লগইন করতে দেওয়ার অপশন
        if (pin.length >= 4) {
          onLoginSuccess({
            ...user,
            phone: phone.trim(),
            name: currentUserData.phone === phone.trim() ? currentUserData.name : 'User'
          });
        } else {
          setError('ভুল মোবাইল নম্বর বা পিন দিয়েছেন!');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* ব্যাকগ্রাউন্ড ডিজাইন গ্লো */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* লোগো ও হেডার */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 border border-indigo-400/30">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">SIM OFFER SHOP</h1>
          <p className="text-xs text-slate-400 mt-1">টেলিকম রিসেলার ও ড্রাইভ প্যাক পোর্টাল</p>
        </div>

        {/* লগইন / রেজিস্ট্রেশন ট্যাব সুইচ */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              !isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> লগইন
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> অ্যাকাউন্ট তৈরি
          </button>
        </div>

        {/* ফর্ম এরিয়া */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">আপনার পূর্ণ নাম</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="যেমন: Md Rakib"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">মোবাইল নম্বর</label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">পিন / পাসওয়ার্ড (৪-৬ ডিজিট)</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                maxLength={6}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>{isRegister ? 'অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
