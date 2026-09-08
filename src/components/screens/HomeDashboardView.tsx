import React, { useState, useRef } from 'react';
import { 
  Bell, 
  LogOut, 
  Send, 
  Flame, 
  Package, 
  Wallet, 
  ArrowLeftRight, 
  History, 
  Facebook, 
  MessageCircle, 
  Headphones, 
  Settings, 
  Camera, 
  User, 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Check, 
  X,
  Lock,
  ShieldAlert,
  AlertTriangle,
  Users,
  Activity,
  Layers
} from 'lucide-react';
import { UserProfile, ScreenId, Transaction } from '../../types';

interface HomeDashboardProps {
  user: UserProfile;
  transactions: Transaction[];
  onNavigate: (screen: ScreenId) => void;
  onOpenNotifications: () => void;
  onOpenTransfer: () => void;
  onLogout: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardProps> = ({
  user,
  transactions,
  onNavigate,
  onOpenNotifications,
  onOpenTransfer,
  onLogout,
  onUpdateUser,
}) => {
  // সেটিংস মডাল স্টেট
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [pin, setPin] = useState(user.pin || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // সিক্রেট অ্যাডমিন প্যানেল স্টেট
  const [clickCount, setClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const clickTimeoutRef = useRef<any>(null);

  const openExternal = (url: string) => {
    window.open(url, '_blank');
  };

  // ছবি আপলোড লজিক
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // সেটিংস সেভ করা
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      pin: pin.trim() || user.pin,
      avatar: avatar || user.avatar,
    };

    localStorage.setItem('telecom_user', JSON.stringify(updatedUser));
    if (onUpdateUser) onUpdateUser(updatedUser);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsSettingsModalOpen(false);
    }, 900);
  };

  // সিক্রেট ১০ বার ক্লিকের হ্যান্ডলার
  const handleDoNotClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    // ৩ সেকেন্ড পর পর ক্লিক কাউন্ট রিসেট হয়ে যাবে
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3000);

    // ১০ বার পূর্ণ হলে অ্যাডমিন অথেন্টিকেশন পপ-আপ চালু হবে
    if (newCount >= 10) {
      setClickCount(0);
      setIsSettingsModalOpen(false);
      setShowAdminLogin(true);
      setAdminError('');
    }
  };

  // অ্যাডমিন ভেরিফিকেশন হ্যান্ডলার
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPhone.trim() === '01728116153' && adminPass.trim() === '2811') {
      setShowAdminLogin(false);
      setIsAdminLoggedIn(true);
      setAdminError('');
      setAdminPhone('');
      setAdminPass('');
    } else {
      setAdminError('অ্যাক্সেস ডিনায়েড! ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড।');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-8 select-none">
      {/* হেডার */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200 overflow-hidden border border-indigo-100">
            {avatar || user.avatar ? (
              <img src={avatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">{user.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{user.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2 border-2 border-white" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ব্যালেন্স কার্ড */}
      <div className="p-4">
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
              {user.resellerLevel || 'Retailer'} Account
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">মেইন ব্যালেন্স</p>
              <h3 className="text-lg font-black tracking-tight text-white">৳ {user.mainBalance.toLocaleString()}</h3>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">ড্রাইভ ব্যালেন্স</p>
              <h3 className="text-lg font-black tracking-tight text-amber-400">৳ {user.driveBalance.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* কুইক সার্ভিসেস */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">Quick Actions</span>
          <span className="text-[11px] font-bold text-indigo-600 uppercase">Services</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('flexiload')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Flexiload</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Mobile Top-Up</span>
          </button>

          <button
            onClick={() => onNavigate('drive')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all relative group"
          >
            <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Hot</span>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-2 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Drive Pack</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Data & Minutes</span>
          </button>

          <button
            onClick={() => onNavigate('drive')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Regular Pack</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Bundles</span>
          </button>

          <button
            onClick={() => onNavigate('add_balance')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Add Balance</span>
            <span className="text-[10px] text-slate-400 mt-0.5">bKash/Nagad</span>
          </button>

          <button
            onClick={onOpenTransfer}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-2 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Transfer</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Main ⇄ Drive</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-2 group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">History</span>
            <span className="text-[10px] text-slate-400 mt-0.5">All Reports</span>
          </button>
        </div>
      </div>

      {/* সাপোর্ট ও কানেক্ট সেকশন */}
      <div className="px-4">
        <div className="mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">Support & Connect</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openExternal('https://facebook.com')}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Facebook className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Facebook</p>
              <p className="text-[10px] text-slate-400 font-medium">Join Community</p>
            </div>
          </button>

          <button
            onClick={() => openExternal('https://wa.me/8801XXXXXXXXX')}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">WhatsApp</p>
              <p className="text-[10px] text-slate-400 font-medium">Direct Support</p>
            </div>
          </button>

          <button
            onClick={() => openExternal('https://tawk.to')}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Live Chat</p>
              <p className="text-[10px] text-slate-400 font-medium">Instant Help</p>
            </div>
          </button>

          {/* Setting বাটন */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Setting</p>
              <p className="text-[10px] text-slate-400 font-medium">Profile & Security</p>
            </div>
          </button>
        </div>
      </div>

      {/* Setting পপ-আপ মডাল */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* ব্যাকগ্রাউন্ড রোমান্টিক গ্লো */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight">অ্যাকাউন্ট সেটিংস</h2>
                  <p className="text-[11px] text-slate-400">ব্যক্তিগত তথ্য ও নিরাপত্তা পরিচালনা</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* প্রোফাইল ছবি যুক্ত করার অংশ */}
            <div className="flex flex-col items-center my-4 relative z-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-400 via-indigo-500 to-amber-300 shadow-xl shadow-indigo-100">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                    {avatar || user.avatar ? (
                      <img src={avatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-white active:scale-90 transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> প্রোফাইল ছবি পরিবর্তন করুন
              </p>
            </div>

            {/* ফর্ম ফিল্ডস */}
            <form onSubmit={handleSettingsSave} className="space-y-3 relative z-10">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">আপনার নাম</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">অ্যাকাউন্ট তৈরির মোবাইল নম্বর</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    disabled
                    value={user.phone}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed select-none"
                  />
                  <span className="absolute right-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ভেরিফাইড
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">লগইন পিন / পাসওয়ার্ড</label>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="গোপন পিন"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold tracking-widest text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-rose-600 hover:opacity-95 active:scale-98 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" /> সংরক্ষিত হয়েছে!
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> পরিবর্তন নিশ্চিত করুন
                  </>
                )}
              </button>
            </form>

            {/* সবার নিচে সিক্রেট "Do Not Click" বাটন */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center relative z-10">
              <button
                type="button"
                onClick={handleDoNotClick}
                className="text-[11px] font-semibold text-rose-500/80 hover:text-rose-600 tracking-wider uppercase px-4 py-2 rounded-lg hover:bg-rose-50/50 active:scale-90 transition-all flex items-center justify-center gap-1.5 mx-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Do Not Click</span>
              </button>
              <p className="text-[9px] text-slate-400 mt-1">SIM OFFER SHOP • v2.4.0 (Protected)</p>
            </div>
          </div>
        </div>
      )}

      {/* অ্যাডমিন অথেন্টিকেশন পপ-আপ (১০ বার ক্লিক করার পর আসবে) */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-3 shadow-lg shadow-red-500/10">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-center font-black text-base text-white">System Admin Auth</h3>
            <p className="text-center text-[10px] text-slate-400 mb-4">নিরাপত্তা যাচাইকরণের জন্য ক্রেডেনশিয়াল দিন</p>

            {adminError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[11px] text-center mb-3 font-semibold">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">অ্যাডমিন নম্বর</label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">অ্যাডমিন পাসওয়ার্ড</label>
                <input
                  type="password"
                  placeholder="••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 tracking-widest focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all mt-2"
              >
                প্যানেল আনলক করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* সিক্রেট অ্যাডমিন কন্ট্রোল প্যানেল ভিউ */}
      {isAdminLoggedIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-indigo-500/40 text-white rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Super Admin Console</h3>
                  <p className="text-[10px] text-emerald-400 font-semibold">Master Access Granted</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminLoggedIn(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-white">ইউজার ম্যানেজমেন্ট</p>
                    <p className="text-[10px] text-slate-400">সকল গ্রাহকের ব্যালেন্স ও তালিকা</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">Active</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">ড্রাইভ প্যাক কন্ট্রোল</p>
                    <p className="text-[10px] text-slate-400">অফার মূল্য ও ক্যাশব্যাক রেট পরিবর্তন</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">Auto</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">টপ-আপ গেটওয়ে ডেবিয়ন</p>
                    <p className="text-[10px] text-slate-400">অপারেটর সিম ও ব্যালেন্স লোড</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Online</span>
              </div>
            </div>

            <button
              onClick={() => setIsAdminLoggedIn(false)}
              className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              কনসোল বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
