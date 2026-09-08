import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { db } from './firebase';
import { ref, set, push, onValue, update } from 'firebase/database';
import { 
  Send, Flame, Wallet, History, MessageSquare, Bell, LogOut, ArrowLeft, 
  Ticket, Copy, Check, XCircle, User as UserIcon, Facebook, MessageCircle, 
  Eye, EyeOff, Lock, ShoppingCart, AlertCircle, Clock, Key, HelpCircle, 
  Sparkles, RefreshCw, Zap, Info, FileText
} from 'lucide-react';

export default function UserApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const [inputPhone, setInputPhone] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [inputName, setInputName] = useState('');

  const [activeSection, setActiveSection] = useState<'menu' | 'flexiload' | 'drive' | 'scratch' | 'add_balance' | 'history' | 'chats' | 'notifications' | 'profile' | 'support'>('menu');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    id: '1', name: 'Md. Tanvir Hasan', phone: '01712345678', pin: '1234', mainBalance: 950, driveBalance: 3820
  });

  const [adminSocialLinks, setAdminSocialLinks] = useState({ facebookPage: '', whatsappNumber: '' });
  const [showPin, setShowPin] = useState(false);
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const [runningNotice, setRunningNotice] = useState('🎉 স্বাগতম SIM OFFER SHOP এ!');
  const [notifications, setNotifications] = useState<any[]>([]);

  const [paymentNumbers, setPaymentNumbers] = useState({ bkash: '01728116153', nagad: '01728116153', rocket: '01728116153' });
  const [addMoneyEnabled, setAddMoneyEnabled] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('bKash');
  const [balanceType, setBalanceType] = useState('main');
  const [addAmount, setAddAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNum, setCopiedNum] = useState(false);

  // ডায়নামিক নোট স্টেট
  const [addMoneyNote, setAddMoneyNote] = useState('প্রথমে নাম্বারে টাকা পাঠিয়ে ট্রানজ্যাকশন আইডি দিন।');

  // হোল্ড বাটন প্রোগ্রেস স্টেট
  const [isHoldingAddMoney, setIsHoldingAddMoney] = useState(false);
  const [holdAddMoneyProgress, setHoldAddMoneyProgress] = useState(0);

  const [masterDriveEnabled, setMasterDriveEnabled] = useState(true);
  const [simStatus, setSimStatus] = useState<Record<string, boolean>>({});
  const [userAddMoneyLogs, setUserAddMoneyLogs] = useState<any[]>([]);
  const [userFlexiLogs, setUserFlexiLogs] = useState<any[]>([]);
  const [userDriveLogs, setUserDriveLogs] = useState<any[]>([]);

  const [scratchCards, setScratchCards] = useState<any[]>([]);
  const [buyingCard, setBuyingCard] = useState<any | null>(null);
  const [targetCardNumber, setTargetCardNumber] = useState('');
  const [popupAlert, setPopupAlert] = useState<string | null>(null);

  const [selectedDriveOp, setSelectedDriveOp] = useState('Grameenphone');
  const [driveOffers, setDriveOffers] = useState<any[]>([]);
  const [orderingOffer, setOrderingOffer] = useState<any | null>(null);
  const [targetDriveNumber, setTargetDriveNumber] = useState('');
  const [hasSimLoan, setHasSimLoan] = useState<boolean | null>(null);

  const [flexiPhone, setFlexiPhone] = useState('');
  const [flexiOperator, setFlexiOperator] = useState('Grameenphone');
  const [simType, setSimType] = useState('Prepaid');
  const [flexiAmount, setFlexiAmount] = useState('');
  const [flexiPin, setFlexiPin] = useState('');
  const [isHoldingFlexi, setIsHoldingFlexi] = useState(false);
  const [holdFlexiProgress, setHoldFlexiProgress] = useState(0);

  const [historyTab, setHistoryTab] = useState<'add_money' | 'flexiload' | 'drive'>('add_money');
  const [chatMessages, setChatMessages] = useState<any[]>([{ id: '1', sender: 'admin', text: 'আসসালামু আলাইকুম!' }]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    onValue(ref(db, 'settings/notice'), (snapshot) => { if (snapshot.val()) setRunningNotice(snapshot.val()); });
    onValue(ref(db, 'settings/masterDrive'), (snapshot) => { if (snapshot.val() !== null) setMasterDriveEnabled(snapshot.val()); });
    onValue(ref(db, 'settings/simStatus'), (snapshot) => { if (snapshot.val()) setSimStatus(snapshot.val()); });
    onValue(ref(db, 'settings/socialLinks'), (snapshot) => { if (snapshot.val()) setAdminSocialLinks(snapshot.val()); });
    onValue(ref(db, 'settings/addMoneyNote'), (snapshot) => { if (snapshot.val()) setAddMoneyNote(snapshot.val()); });
    onValue(ref(db, 'settings/addMoney'), (snapshot) => {
      const val = snapshot.val();
      if (val) {
        if (val.enabled !== undefined) setAddMoneyEnabled(val.enabled);
        if (val.numbers) setPaymentNumbers(val.numbers);
      }
    });
    onValue(ref(db, 'offers'), (snapshot) => {
      const data = snapshot.val();
      if (data) setDriveOffers(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      else setDriveOffers([]);
    });
    onValue(ref(db, 'scratchCards'), (snapshot) => {
      const data = snapshot.val();
      if (data) setScratchCards(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      else setScratchCards([]);
    });
    onValue(ref(db, 'addMoneyLogs'), (snapshot) => {
      const data = snapshot.val();
      if (data) setUserAddMoneyLogs(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
    onValue(ref(db, 'rechargeOrders'), (snapshot) => {
      const data = snapshot.val();
      if (data) setUserFlexiLogs(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
    onValue(ref(db, 'driveOrders'), (snapshot) => {
      const data = snapshot.val();
      if (data) setUserDriveLogs(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
    onValue(ref(db, 'notifications'), (snapshot) => {
      const data = snapshot.val();
      if (data) setNotifications(Object.keys(data).map(k => ({ id: k, ...data[k] })));
    });
  }, []);

  const handleCopyPaymentNum = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  };

  // এড-মানি হোল্ড অ্যানিমেশন ও প্রসেসিং
  useEffect(() => {
    let interval: any;
    if (isHoldingAddMoney) {
      interval = setInterval(() => {
        setHoldAddMoneyProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            executeAddMoney();
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    } else {
      setHoldAddMoneyProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHoldingAddMoney]);

  const executeAddMoney = () => {
    setIsHoldingAddMoney(false);
    setHoldAddMoneyProgress(0);

    if (!addMoneyEnabled) return alert('বর্তমানে সার্ভিস বন্ধ রয়েছে!');
    if (!addAmount || Number(addAmount) <= 0) return alert('সঠিক পরিমাণ লিখুন!');
    if (!trxId || trxId.length < 5) return alert('সঠিক TrxID লিখুন!');

    push(ref(db, 'addMoneyLogs'), {
      userName: userProfile.name, userPhone: userProfile.phone, method: selectedMethod,
      amount: Number(addAmount), balanceType: balanceType, trxId: trxId.toUpperCase(),
      time: new Date().toLocaleTimeString(), status: 'Pending'
    });

    setPopupAlert('আপনার add money success হইছে, অল্প সময়ের মধ্যে add হয়ে যাবে।');
    setAddAmount('');
    setTrxId('');
  };

  // ফ্লেক্সিলোড হোল্ড অ্যানিমেশন ও প্রসেসিং
  useEffect(() => {
    let interval: any;
    if (isHoldingFlexi) {
      interval = setInterval(() => {
        setHoldFlexiProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            executeFlexiRecharge();
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    } else {
      setHoldFlexiProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHoldingFlexi]);

  const executeFlexiRecharge = () => {
    setIsHoldingFlexi(false);
    setHoldFlexiProgress(0);

    if (!flexiPhone || flexiPhone.length < 11) return alert('সঠিক নম্বর দিন!');
    if (!flexiAmount || Number(flexiAmount) <= 0) return alert('টাকার পরিমাণ দিন!');
    if (flexiPin !== userProfile.pin) return alert('পিন সঠিক নয়!');
    if (userProfile.mainBalance < Number(flexiAmount)) return alert('পর্যাপ্ত ব্যালেন্স নেই!');

    const newMainBal = userProfile.mainBalance - Number(flexiAmount);
    setUserProfile(prev => ({ ...prev, mainBalance: newMainBal }));

    push(ref(db, 'rechargeOrders'), {
      userName: userProfile.name, userPhone: userProfile.phone, operator: flexiOperator,
      amount: Number(flexiAmount), targetNumber: flexiPhone, time: new Date().toLocaleTimeString(),
      status: 'Pending', note: simType
    });

    setPopupAlert('🚀 আপনার ফ্লেক্সিলোড success হইছে, অল্প সময়ের মধ্যে চলে যাবে।');
    setFlexiPhone(''); setFlexiAmount(''); setFlexiPin('');
  };

  const handlePhoneChange = (val: string) => {
    setFlexiPhone(val);
    if (val.startsWith('017') || val.startsWith('013')) setFlexiOperator('Grameenphone');
    else if (val.startsWith('018')) setFlexiOperator('Robi');
    else if (val.startsWith('019') || val.startsWith('014')) setFlexiOperator('Banglalink');
    else if (val.startsWith('016')) setFlexiOperator('Airtel');
    else if (val.startsWith('015')) setFlexiOperator('Teletalk');
  };

  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); setPopupAlert('✨ অ্যাপ রিফ্রেশ সফল হয়েছে!'); }, 1000);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0c29] bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4 font-sans text-xs text-white">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl text-center space-y-5">
          <Sparkles className="w-8 h-8 mx-auto animate-pulse text-indigo-400" />
          <h2 className="text-base font-black">SIM OFFER SHOP</h2>
          <div className="grid grid-cols-2 gap-1.5 bg-black/30 p-1 rounded-2xl border border-white/10">
            <button onClick={() => setAuthView('login')} className={`py-2 rounded-xl font-bold ${authView === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>লগইন</button>
            <button onClick={() => setAuthView('register')} className={`py-2 rounded-xl font-bold ${authView === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>একাউন্ট তৈরি</button>
          </div>
          {authView === 'login' ? (
            <form onSubmit={(e) => { e.preventDefault(); if (inputPhone && inputPin) setIsLoggedIn(true); }} className="space-y-3 text-left">
              <input type="tel" maxLength={11} placeholder="মোবাইল নম্বর" value={inputPhone} onChange={(e) => setInputPhone(e.target.value)} className="w-full bg-black/40 border rounded-xl p-3 text-xs text-white" />
              <input type="password" placeholder="পিন (PIN)" value={inputPin} onChange={(e) => setInputPin(e.target.value)} className="w-full bg-black/40 border rounded-xl p-3 text-xs text-white" />
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl">লগইন করুন</button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (inputName && inputPhone && inputPin) setIsLoggedIn(true); }} className="space-y-3 text-left">
              <input type="text" placeholder="নাম" value={inputName} onChange={(e) => setInputName(e.target.value)} className="w-full bg-black/40 border rounded-xl p-3 text-xs text-white" />
              <input type="tel" maxLength={11} placeholder="মোবাইল নম্বর" value={inputPhone} onChange={(e) => setInputPhone(e.target.value)} className="w-full bg-black/40 border rounded-xl p-3 text-xs text-white" />
              <input type="password" placeholder="পিন (PIN)" value={inputPin} onChange={(e) => setInputPin(e.target.value)} className="w-full bg-black/40 border rounded-xl p-3 text-xs text-white" />
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl">একাউন্ট তৈরি করুন</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0b21] text-slate-100 flex flex-col font-sans text-xs">
      <header className="bg-[#141032]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          {activeSection !== 'menu' && <button onClick={() => setActiveSection('menu')} className="p-2 -ml-2 rounded-2xl bg-white/5 border text-white"><ArrowLeft className="w-4 h-4" /></button>}
          <div>
            <h2 className="text-xs font-black text-white">{userProfile.name}</h2>
            <p className="text-[10px] text-indigo-300 font-mono">{userProfile.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handlePullToRefresh} className={`p-2 rounded-2xl bg-white/5 border text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw className="w-3.5 h-3.5" /></button>
          <button onClick={() => setActiveSection('notifications')} className="p-2 rounded-2xl bg-white/5 border text-amber-400"><Bell className="w-3.5 h-3.5" /></button>
          <button onClick={() => setActiveSection('support')} className="px-2.5 py-2 rounded-2xl bg-emerald-500/10 border text-emerald-400 font-extrabold"><HelpCircle className="w-3.5 h-3.5" /></button>
          <button onClick={() => setActiveSection('profile')} className="px-2.5 py-2 rounded-2xl bg-indigo-500/10 border text-indigo-300 font-extrabold"><UserIcon className="w-3.5 h-3.5" /></button>
        </div>
      </header>

      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-2 text-[11px] font-bold shadow-md flex items-center gap-2">
        <span className="bg-black/40 text-amber-300 px-2 py-0.5 rounded text-[9px] uppercase font-black">Notice</span>
        <span className="font-medium truncate">{runningNotice}</span>
      </div>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-4">
        {activeSection === 'menu' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-[#1a1442] to-[#120e2e] border border-white/10 rounded-3xl p-5 text-white shadow-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-purple-300 uppercase bg-white/10 px-3 py-1 rounded-xl">RETAILER ACCOUNT</span>
                <span className="text-xs text-emerald-400 font-bold">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5">
                  <span className="text-[10px] text-slate-400 block">মেইন ব্যালেন্স</span>
                  <h3 className="text-xl font-black font-mono text-white">৳{userProfile.mainBalance}</h3>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5">
                  <span className="text-[10px] text-slate-400 block">ড্রাইভ ব্যালেন্স</span>
                  <h3 className="text-xl font-black font-mono text-amber-400">৳{userProfile.driveBalance}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setActiveSection('flexiload')} className="bg-[#141032] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg"><Send className="w-5 h-5 text-sky-400 mb-2" /><span className="text-xs font-extrabold text-white">Flexiload</span></button>
              <button onClick={() => setActiveSection('drive')} className="bg-[#141032] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg"><Flame className="w-5 h-5 text-amber-400 mb-2" /><span className="text-xs font-extrabold text-white">Drive Pack</span></button>
              <button onClick={() => setActiveSection('scratch')} className="bg-[#141032] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg"><Ticket className="w-5 h-5 text-pink-400 mb-2" /><span className="text-xs font-extrabold text-white">Scratch Card</span></button>
              <button onClick={() => setActiveSection('add_balance')} className="bg-[#141032] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg"><Wallet className="w-5 h-5 text-emerald-400 mb-2" /><span className="text-xs font-extrabold text-white">Add Balance</span></button>
              <button onClick={() => setActiveSection('history')} className="bg-[#141032] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg"><History className="w-5 h-5 text-violet-400 mb-2" /><span className="text-xs font-extrabold text-white">History</span></button>
              <button onClick={() => setActiveSection('chats')} className="bg-[#141032] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg"><MessageSquare className="w-5 h-5 text-blue-400 mb-2" /><span className="text-xs font-extrabold text-white">Live Chat</span></button>
            </div>
          </div>
        )}

        {/* এড ব্যালেন্স পেজ (নোট, কপি অপশন ও হোল্ড কনফার্ম অ্যানিমেশনসহ) */}
        {activeSection === 'add_balance' && (
          <div className="space-y-3.5">
            {!addMoneyEnabled && <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 text-rose-300 font-bold text-center">⚠️ বর্তমানে Add Balance সার্ভিস বন্ধ রয়েছে।</div>}
            
            {/* অ্যাডমিন নির্দেশিকা নোট বক্স */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>নির্দেশিকা ও নিয়মাবলী:</span>
              </div>
              <p className="text-[11px] text-slate-300 pl-5 leading-relaxed">{addMoneyNote}</p>
            </div>

            <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 space-y-3 shadow-xl text-white">
              <h4 className="font-bold border-b border-white/10 pb-2 flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-400" /> টাকা অ্যাড করুন</h4>
              
              <div className="grid grid-cols-3 gap-2">
                {['bKash', 'Nagad', 'Rocket'].map((m) => (
                  <button key={m} onClick={() => setSelectedMethod(m)} className={`py-2 rounded-2xl font-bold text-xs border ${selectedMethod === m ? 'bg-indigo-600 text-white border-indigo-500 shadow' : 'bg-black/30 text-slate-300 border-white/10'}`}>{m}</button>
                ))}
              </div>

              {/* নম্বর কপি অপশনসহ বক্স */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">এই নম্বরে টাকা পাঠান:</span>
                  <strong className="font-mono text-indigo-300 text-sm">
                    {selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket}
                  </strong>
                </div>
                <button onClick={() => handleCopyPaymentNum(selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 active:scale-95 shadow">
                  {copiedNum ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNum ? 'কপি হয়েছে!' : 'নম্বর কপি'}</span>
                </button>
              </div>

              <input type="number" placeholder="টাকার পরিমাণ (৳)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-bold text-white" />
              <input type="text" placeholder="TrxID (ট্রানজ্যাকশন আইডি)" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-bold uppercase text-white" />

              {/* এড-মানির জন্য সওয়াইপ / হোল্ড টু কনফার্ম বাটন */}
              <div className="pt-2">
                <p className="text-[10px] text-center text-amber-400 font-semibold mb-1.5">👇 পেমেন্ট কনফার্ম করতে নিচের বাটনটি চেপে ধরে রাখুন</p>
                <div 
                  className="relative overflow-hidden w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xl cursor-pointer active:scale-95 transition-all select-none"
                  onMouseDown={() => setIsHoldingAddMoney(true)}
                  onMouseUp={() => setIsHoldingAddMoney(false)}
                  onMouseLeave={() => setIsHoldingAddMoney(false)}
                  onTouchStart={() => setIsHoldingAddMoney(true)}
                  onTouchEnd={() => setIsHoldingAddMoney(false)}
                >
                  <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/80 transition-all duration-100 z-0" style={{ width: `${holdAddMoneyProgress}%` }} />
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-bounce" />
                    {isHoldingAddMoney ? `প্রসেসিং হচ্ছে... ${holdAddMoneyProgress}%` : 'সাবমিট করতে চেপে ধরে রাখুন'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ফ্লেক্সিলোড পেজ */}
        {activeSection === 'flexiload' && (
          <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 space-y-4 shadow-xl text-white">
            <h4 className="font-bold border-b border-white/10 pb-2 flex items-center justify-between">
              <span>মোবাইল ফ্লেক্সিলোড / রিচার্জ</span>
              <span className="text-xs uppercase font-extrabold text-indigo-400 bg-indigo-500/10 border px-2.5 py-1 rounded-xl">{flexiOperator}</span>
            </h4>
            <div className="relative">
              <input type="tel" maxLength={11} placeholder="017XXXXXXXX" value={flexiPhone} onChange={(e) => handlePhoneChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-24 py-3 font-bold font-mono text-white" />
              <div className="absolute right-2 top-2 bg-indigo-600/30 border text-indigo-300 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase">
                {flexiOperator === 'Grameenphone' ? 'GP' : flexiOperator === 'Banglalink' ? 'BL' : flexiOperator}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Prepaid', 'Postpaid', 'Skitto'].map((type) => (
                <button key={type} onClick={() => setSimType(type)} className={`py-2 rounded-xl font-bold text-xs border ${simType === type ? 'bg-indigo-600 text-white' : 'bg-black/30 text-slate-300'}`}>{type}</button>
              ))}
            </div>
            <input type="number" placeholder="টাকার পরিমাণ (৳)" value={flexiAmount} onChange={(e) => setFlexiAmount(e.target.value)} className="w-full bg-black/40 border rounded-xl p-3 font-bold text-white" />
            <input type="password" maxLength={6} placeholder="সিক্রেট পিন (PIN)" value={flexiPin} onChange={(e) => setFlexiPin(e.target.value)} className="w-full bg-black/40 border rounded-xl p-3 font-mono font-bold tracking-widest text-white" />
            
            <div className="pt-2">
              <p className="text-[10px] text-center text-amber-400 font-semibold mb-1.5">👇 রিচার্জ কনফার্ম করতে নিচের বাটনটি চেপে ধরে রাখুন</p>
              <div 
                className="relative overflow-hidden w-full h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xl cursor-pointer active:scale-95 transition-all select-none"
                onMouseDown={() => setIsHoldingFlexi(true)}
                onMouseUp={() => setIsHoldingFlexi(false)}
                onMouseLeave={() => setIsHoldingFlexi(false)}
                onTouchStart={() => setIsHoldingFlexi(true)}
                onTouchEnd={() => setIsHoldingFlexi(false)}
              >
                <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/80 transition-all duration-100 z-0" style={{ width: `${holdFlexiProgress}%` }} />
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-bounce" />
                  {isHoldingFlexi ? `প্রসেসিং হচ্ছে... ${holdFlexiProgress}%` : 'রিচার্জ কনফার্ম করতে চেপে ধরে রাখুন'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* অন্যান্য সেকশন */}
        {activeSection === 'notifications' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 px-1">নোটিফিকেশন ইনবক্স ({notifications.length})</h4>
            {notifications.map((n) => (
              <div key={n.id} className="bg-[#141032] border border-white/10 rounded-2xl p-4 space-y-1.5 shadow-lg">
                <div className="flex justify-between items-center"><h5 className="font-bold text-white text-xs">{n.title}</h5><span className="text-[9px] text-slate-400 font-mono">{n.time}</span></div>
                <p className="text-slate-300 text-[11px]">{n.msg}</p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'support' && (
          <div className="bg-[#141032] border border-white/10 rounded-3xl p-5 text-center space-y-3 shadow-xl">
            <HelpCircle className="w-6 h-6 mx-auto text-emerald-400" />
            <h3 className="text-sm font-black text-white">অ্যাডমিন সাপোর্ট ও যোগাযোগ</h3>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <a href={adminSocialLinks.facebookPage} target="_blank" rel="noreferrer" className="py-3 bg-blue-500/10 border text-blue-400 font-bold rounded-2xl flex items-center justify-center gap-2"><Facebook className="w-4 h-4" /> ফেসবুক পেজ</a>
              <a href={`https://wa.me/${adminSocialLinks.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="py-3 bg-emerald-500/10 border text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ</a>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="bg-[#141032] border border-white/10 rounded-3xl p-5 text-center space-y-3 shadow-xl">
            <h3 className="text-sm font-black text-white">{userProfile.name}</h3>
            <p className="text-xs text-slate-400 font-mono">📱 {userProfile.phone}</p>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs text-indigo-300 font-mono">🔒 পিন: {showPin ? userProfile.pin : '••••'}</span>
              <button onClick={() => setShowPin(!showPin)} className="text-indigo-400 p-1">{showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
            </div>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 bg-[#141032] border p-1 rounded-xl">
              <button onClick={() => setHistoryTab('add_money')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'add_money' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>এড-মানি</button>
              <button onClick={() => setHistoryTab('flexiload')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'flexiload' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>রিচার্জ</button>
              <button onClick={() => setHistoryTab('drive')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'drive' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>ড্রাইভ</button>
            </div>
            {historyTab === 'add_money' && userAddMoneyLogs.map(log => (
              <div key={log.id} className="bg-[#141032] border rounded-xl p-3 flex justify-between items-center text-white">
                <div><p className="font-bold">৳{log.amount} ({log.method})</p><p className="text-[10px] text-slate-400">TrxID: {log.trxId}</p></div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300">{log.status}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {popupAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18133a] border border-white/15 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
            <h4 className="text-xs font-black">{popupAlert}</h4>
            <button onClick={() => setPopupAlert(null)} className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg">ঠিক আছে</button>
          </div>
        </div>
      )}
    </div>
  );
}
