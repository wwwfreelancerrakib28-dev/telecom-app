import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { db } from './firebase';
import { ref, set, push, onValue, update } from 'firebase/database';
import { 
  Send, 
  Flame, 
  Wallet, 
  History, 
  MessageSquare, 
  Bell, 
  LogOut, 
  ArrowLeft, 
  Ticket, 
  Copy, 
  Check, 
  XCircle,
  Smartphone,
  Info,
  User as UserIcon,
  Facebook,
  MessageCircle,
  Eye,
  EyeOff,
  Lock,
  ShoppingCart,
  AlertCircle,
  Clock,
  Key,
  HelpCircle,
  ShieldCheck,
  Phone,
  UserPlus,
  LogIn,
  Sparkles
} from 'lucide-react';

export default function UserApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const [inputPhone, setInputPhone] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [inputName, setInputName] = useState('');

  const [activeSection, setActiveSection] = useState<'menu' | 'flexiload' | 'drive' | 'scratch' | 'add_balance' | 'history' | 'chats' | 'notifications' | 'profile' | 'support'>('menu');
  
  const [userProfile, setUserProfile] = useState({
    id: '1',
    name: 'Md. Tanvir Hasan',
    phone: '01712345678',
    pin: '1234',
    mainBalance: 950,
    driveBalance: 3820
  });

  const [adminSocialLinks, setAdminSocialLinks] = useState({
    facebookPage: 'https://facebook.com/yourpage',
    whatsappNumber: '+8801728116153'
  });

  const [showPhone, setShowPhone] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const [runningNotice, setRunningNotice] = useState('🎉 স্বাগতম SIM OFFER SHOP এ!');
  const [paymentNumbers, setPaymentNumbers] = useState({ bkash: '01728116153', nagad: '01728116153', rocket: '01728116153' });
  const [addMoneyEnabled, setAddMoneyEnabled] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('bKash');
  const [balanceType, setBalanceType] = useState('main');
  const [addAmount, setAddAmount] = useState('');
  const [trxId, setTrxId] = useState('');

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

  const [historyTab, setHistoryTab] = useState<'add_money' | 'flexiload' | 'drive'>('add_money');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: '1', sender: 'admin', text: 'আসসালামু আলাইকুম! বলুন আপনাকে কীভাবে সাহায্য করতে পারি?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    onValue(ref(db, 'settings/notice'), (snapshot) => {
      const val = snapshot.val();
      if (val) setRunningNotice(val);
    });

    onValue(ref(db, 'settings/masterDrive'), (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setMasterDriveEnabled(val);
    });

    onValue(ref(db, 'settings/simStatus'), (snapshot) => {
      const val = snapshot.val();
      if (val) setSimStatus(val);
    });

    onValue(ref(db, 'settings/socialLinks'), (snapshot) => {
      const val = snapshot.val();
      if (val) setAdminSocialLinks(val);
    });

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
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone || inputPhone.length < 11 || !inputPin) {
      return alert('সঠিক মোবাইল নম্বর এবং পিন দিন!');
    }
    setUserProfile(prev => ({ ...prev, phone: inputPhone, pin: inputPin }));
    setIsLoggedIn(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName || !inputPhone || inputPhone.length < 11 || !inputPin) {
      return alert('সবগুলো ঘর সঠিকভাবে পূরণ করুন!');
    }
    const newUserRef = push(ref(db, 'users'));
    set(newUserRef, {
      name: inputName,
      phone: inputPhone,
      pin: inputPin,
      mainBalance: 0,
      driveBalance: 0,
      isBanned: false
    });
    setUserProfile(prev => ({ ...prev, name: inputName, phone: inputPhone, pin: inputPin, mainBalance: 0, driveBalance: 0 }));
    setIsLoggedIn(true);
    alert('🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
  };

  const handleUpdatePin = () => {
    if (oldPinInput !== userProfile.pin) return alert('পুরনো পিন সঠিক নয়!');
    if (!newPinInput || newPinInput.length < 4) return alert('নতুন পিন কমপক্ষে ৪ ডিজিটের হতে হবে!');
    
    setUserProfile(prev => ({ ...prev, pin: newPinInput }));
    setOldPinInput('');
    setNewPinInput('');
    alert('✅ পিন সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  const handleConfirmBuyCard = () => {
    if (!buyingCard) return;
    if (!targetCardNumber || targetCardNumber.length < 11) return alert('সঠিক ১১ ডিজিট নম্বর লিখুন!');
    if (userProfile.mainBalance < buyingCard.price) return alert('মেইন ব্যালেন্স পর্যাপ্ত নয়!');

    const newMainBal = userProfile.mainBalance - buyingCard.price;
    setUserProfile(prev => ({ ...prev, mainBalance: newMainBal }));

    push(ref(db, 'rechargeOrders'), {
      userName: userProfile.name,
      userPhone: userProfile.phone,
      operator: buyingCard.type,
      amount: buyingCard.price,
      targetNumber: targetCardNumber,
      time: new Date().toLocaleTimeString(),
      status: 'Pending',
      note: 'Scratch Card: ' + buyingCard.title
    });

    setPopupAlert(`⏳ সফলভাবে রিকোয়েস্ট জমা হয়েছে!`);
    setBuyingCard(null);
    setTargetCardNumber('');
  };

  const handleConfirmDriveOrder = () => {
    if (!targetDriveNumber || targetDriveNumber.length < 11) return alert('সঠিক ১১ ডিজিট নম্বর লিখুন!');
    if (hasSimLoan === null) return alert('লোন আছে কি না সিলেক্ট করুন!');
    if (hasSimLoan === true) return alert('⚠️ লোন থাকা অবস্থায় ড্রাইভ নেওয়া যাবে না!');
    if (userProfile.driveBalance < orderingOffer.price) return alert('ড্রাইভ ব্যালেন্স পর্যাপ্ত নয়!');

    const newDriveBal = userProfile.driveBalance - orderingOffer.price;
    setUserProfile(prev => ({ ...prev, driveBalance: newDriveBal }));

    push(ref(db, 'driveOrders'), {
      userName: userProfile.name,
      userPhone: userProfile.phone,
      operator: orderingOffer.operator,
      packageTitle: orderingOffer.title,
      price: orderingOffer.price,
      targetNumber: targetDriveNumber,
      time: new Date().toLocaleTimeString(),
      status: 'Pending',
      hasLoan: false
    });

    setPopupAlert(`⏳ ড্রাইভ অর্ডার সফলভাবে সাবমিট হয়েছে!`);
    setOrderingOffer(null);
    setTargetDriveNumber('');
    setHasSimLoan(null);
  };

  const handleAddBalanceSubmit = () => {
    if (!addMoneyEnabled) return alert('বর্তমানে সার্ভিস বন্ধ রয়েছে!');
    if (!addAmount || Number(addAmount) <= 0) return alert('সঠিক পরিমাণ লিখুন!');
    if (!trxId || trxId.length < 5) return alert('সঠিক TrxID লিখুন!');

    push(ref(db, 'addMoneyLogs'), {
      userName: userProfile.name,
      userPhone: userProfile.phone,
      method: selectedMethod,
      amount: Number(addAmount),
      balanceType: balanceType,
      trxId: trxId.toUpperCase(),
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    });

    setPopupAlert('🎉 এড-মানি রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
    setAddAmount('');
    setTrxId('');
  };

  const handleFlexiSubmit = () => {
    if (!flexiPhone || flexiPhone.length < 11) return alert('সঠিক নম্বর দিন!');
    if (!flexiAmount || Number(flexiAmount) <= 0) return alert('টাকার পরিমাণ দিন!');
    if (userProfile.mainBalance < Number(flexiAmount)) return alert('পর্যাপ্ত ব্যালেন্স নেই!');

    const newMainBal = userProfile.mainBalance - Number(flexiAmount);
    setUserProfile(prev => ({ ...prev, mainBalance: newMainBal }));

    push(ref(db, 'rechargeOrders'), {
      userName: userProfile.name,
      userPhone: userProfile.phone,
      operator: flexiOperator,
      amount: Number(flexiAmount),
      targetNumber: flexiPhone,
      time: new Date().toLocaleTimeString(),
      status: 'Pending',
      note: simType
    });

    setPopupAlert(`⏳ ফ্লেক্সিলোড রিকোয়েস্ট সফল হয়েছে!`);
    setFlexiPhone('');
    setFlexiAmount('');
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput.trim() }]);
    setChatInput('');
  };

  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (orderingOffer || buyingCard || activeSection !== 'menu') {
        if (orderingOffer) setOrderingOffer(null);
        else if (buyingCard) setBuyingCard(null);
        else setActiveSection('menu');
      } else {
        CapacitorApp.exitApp();
      }
    });
    return () => { backListener.then(h => h.remove()); };
  }, [orderingOffer, buyingCard, activeSection]);

  const visibleOffers = driveOffers.filter(o => o.operator === selectedDriveOp);

  // প্রিমিয়াম লগইন/রেজিস্ট্রেশন পেজ
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0c29] bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4 select-none font-sans text-xs">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl text-center space-y-5 text-white">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/40">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          
          <div>
            <h2 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">SIM OFFER SHOP</h2>
            <p className="text-[11px] text-slate-300 mt-1">প্রিমিয়াম টেলিযোগাযোগ ও অফার প্ল্যাটফর্ম</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-black/30 p-1 rounded-2xl border border-white/10">
            <button onClick={() => setAuthView('login')} className={`py-2.5 rounded-xl font-bold transition-all ${authView === 'login' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>লগইন</button>
            <button onClick={() => setAuthView('register')} className={`py-2.5 rounded-xl font-bold transition-all ${authView === 'register' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>একাউন্ট তৈরি</button>
          </div>

          {authView === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-indigo-200 block mb-1">মোবাইল নম্বর</label>
                <input type="tel" maxLength={11} placeholder="017XXXXXXXX" value={inputPhone} onChange={(e) => setInputPhone(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400 shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-indigo-200 block mb-1">সিক্রেট পিন (PIN)</label>
                <input type="password" maxLength={6} placeholder="••••" value={inputPin} onChange={(e) => setInputPin(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs font-mono font-bold tracking-widest text-white focus:outline-none focus:border-indigo-400 shadow-inner" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95">লগইন করুন</button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-indigo-200 block mb-1">আপনার নাম</label>
                <input type="text" placeholder="যেমন: Md. Rahim" value={inputName} onChange={(e) => setInputName(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-400 shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-indigo-200 block mb-1">মোবাইল নম্বর</label>
                <input type="tel" maxLength={11} placeholder="017XXXXXXXX" value={inputPhone} onChange={(e) => setInputPhone(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400 shadow-inner" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-indigo-200 block mb-1">নতুন পিন (PIN)</label>
                <input type="password" maxLength={6} placeholder="৪ বা ৬ ডিজিট" value={inputPin} onChange={(e) => setInputPin(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs font-mono font-bold tracking-widest text-white focus:outline-none focus:border-indigo-400 shadow-inner" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-xl shadow-emerald-600/30 transition-all active:scale-95">একাউন্ট তৈরি করুন</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // প্রিমিয়াম লাক্সারি অ্যাপ ড্যাশবোর্ড
  return (
    <div className="min-h-screen bg-[#0d0b21] text-slate-100 flex flex-col select-none font-sans text-xs">
      <header className="bg-[#141032]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          {activeSection !== 'menu' ? (
            <button onClick={() => setActiveSection('menu')} className="p-2 -ml-2 rounded-2xl bg-white/5 border border-white/10 text-white active:scale-95 transition-all"><ArrowLeft className="w-4 h-4" /></button>
          ) : (
            <button onClick={() => setActiveSection('profile')} className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-sm shadow-md active:scale-95 transition-all">{userProfile.name.charAt(0)}</button>
          )}
          <div>
            <h2 className="text-xs font-black text-white leading-tight">{userProfile.name}</h2>
            <p className="text-[10px] text-indigo-300 font-mono">{userProfile.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveSection('support')} className="px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center gap-1 active:scale-95 shadow-sm"><HelpCircle className="w-3.5 h-3.5" /> সাপোর্ট</button>
          <button onClick={() => setActiveSection('profile')} className="px-3 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-extrabold flex items-center gap-1 active:scale-95 shadow-sm"><UserIcon className="w-3.5 h-3.5" /> প্রোফাইল</button>
          <button onClick={() => setIsLoggedIn(false)} className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 active:scale-95 shadow-sm" title="লগআউট"><LogOut className="w-3.5 h-3.5" /></button>
        </div>
      </header>

      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white px-4 py-2 text-[11px] font-bold shadow-md flex items-center gap-2 border-b border-amber-400/20">
        <span className="bg-black/40 text-amber-300 px-2.5 py-0.5 rounded-lg text-[9px] uppercase font-black border border-amber-400/30">Notice</span>
        <span className="font-medium truncate">{runningNotice}</span>
      </div>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-4">
        {activeSection === 'menu' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-[#1a1442] via-[#241b5c] to-[#120e2e] border border-white/10 rounded-3xl p-5 text-white shadow-2xl space-y-3 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-xl border border-white/10 shadow-inner">RETAILER ACCOUNT</span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-inner">
                  <span className="text-[10px] text-slate-400 block mb-0.5">মেইন ব্যালেন্স</span>
                  <h3 className="text-xl font-black font-mono text-white">৳{userProfile.mainBalance}</h3>
                </div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-inner">
                  <span className="text-[10px] text-slate-400 block mb-0.5">ড্রাইভ ব্যালেন্স</span>
                  <h3 className="text-xl font-black font-mono text-amber-400">৳{userProfile.driveBalance}</h3>
                </div>
              </div>
            </div>

            {/* প্রিমিয়াম লাক্সারি গ্রিড মেনু */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setActiveSection('flexiload')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5 shadow-inner"><Send className="w-5 h-5" /></div>
                <span className="text-xs font-extrabold text-white">Flexiload</span>
              </button>
              <button onClick={() => setActiveSection('drive')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 shadow-inner"><Flame className="w-5 h-5" /></div>
                <span className="text-xs font-extrabold text-white">Drive Pack</span>
              </button>
              <button onClick={() => setActiveSection('scratch')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-2.5 shadow-inner"><Ticket className="w-5 h-5" /></div>
                <span className="text-xs font-extrabold text-white">Scratch Card</span>
              </button>
              <button onClick={() => setActiveSection('add_balance')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 shadow-inner"><Wallet className="w-5 h-5" /></div>
                <span className="text-xs font-extrabold text-white">Add Balance</span>
              </button>
              <button onClick={() => setActiveSection('history')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-2.5 shadow-inner"><History className="w-5 h-5" /></div>
                <span className="text-xs font-extrabold text-white">History</span>
              </button>
              <button onClick={() => setActiveSection('chats')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 shadow-inner"><MessageSquare className="w-5 h-5" /></div>
                <span className="text-xs font-extrabold text-white">Live Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* সাপোর্ট অপশন */}
        {activeSection === 'support' && (
          <div className="space-y-3.5">
            <div className="bg-[#141032] border border-white/10 rounded-3xl p-5 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner"><HelpCircle className="w-6 h-6" /></div>
              <h3 className="text-sm font-black text-white">অ্যাডমিন সাপোর্ট ও যোগাযোগ</h3>
              <p className="text-[11px] text-slate-400">যেকোনো প্রয়োজনে সরাসরি নিচে দেওয়া মাধ্যমে যোগাযোগ করুন।</p>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <a href={adminSocialLinks.facebookPage} target="_blank" rel="noreferrer" className="py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95">
                  <Facebook className="w-4 h-4" /> ফেসবুক পেজ
                </a>
                <a href={`https://wa.me/${adminSocialLinks.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95">
                  <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ
                </a>
              </div>
            </div>
          </div>
        )}

        {/* প্রোফাইল ও পিন চেঞ্জ */}
        {activeSection === 'profile' && (
          <div className="space-y-4">
            <div className="bg-[#141032] border border-white/10 rounded-3xl p-5 text-center space-y-3 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg">{userProfile.name.charAt(0)}</div>
              <div>
                <h3 className="text-sm font-black text-white">{userProfile.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">📱 {userProfile.phone}</p>
                
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-xs text-indigo-300 font-mono">🔒 পিন: {showPin ? userProfile.pin : '••••'}</span>
                  <button onClick={() => setShowPin(!showPin)} className="text-indigo-400 p-1">
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 space-y-3 shadow-xl">
              <h4 className="font-bold text-white border-b border-white/10 pb-2 flex items-center gap-1.5"><Key className="w-4 h-4 text-indigo-400" /> পিন পরিবর্তন করুন</h4>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">পুরনো পিন</label>
                <input type="password" maxLength={6} placeholder="••••" value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">নতুন পিন</label>
                <input type="password" maxLength={6} placeholder="নতুন পিন দিন" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <button onClick={handleUpdatePin} className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95">পিন আপডেট করুন</button>
            </div>
          </div>
        )}

        {/* ড্রাইভ প্যাক */}
        {activeSection === 'drive' && (
          <div className="space-y-3">
            {!masterDriveEnabled || simStatus[selectedDriveOp] === false ? (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-3xl p-6 text-center space-y-2 shadow-xl">
                <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
                <h4 className="font-black text-sm">⚠️ ড্রাইভ অফার সাময়িকভাবে বন্ধ আছে</h4>
                <p className="text-[11px] text-rose-400/80">দুঃখিত! এই মুহূর্তে অ্যাডমিন কর্তৃক ড্রাইভ অফারগুলো বন্ধ রাখা হয়েছে।</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-5 gap-1 bg-[#141032] border border-white/10 p-1.5 rounded-2xl shadow-inner">
                  {['Grameenphone', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'].map((op) => (
                    <button key={op} onClick={() => setSelectedDriveOp(op)} className={`py-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center ${selectedDriveOp === op ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>
                      <span>{op === 'Grameenphone' ? 'GP' : op === 'Banglalink' ? 'BL' : op}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {visibleOffers.map((offer) => (
                    <div key={offer.id} className="bg-[#141032] border border-white/10 rounded-2xl p-3.5 space-y-2 shadow-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">{offer.operator}</span>
                          <h4 className="text-xs font-black text-white mt-1">{offer.title}</h4>
                          {offer.note && <p className="text-[10px] text-slate-400 mt-0.5">📌 {offer.note}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black font-mono text-indigo-400 block">৳{offer.offerPrice}</span>
                          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">ক্যাশব্যাক ৳{offer.cashback}</span>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1 border-t border-white/10">
                        <button onClick={() => setOrderingOffer({ ...offer, price: offer.offerPrice })} className="py-1.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95">কিনুন</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {orderingOffer && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#18133a] border border-white/15 rounded-3xl p-5 max-w-xs w-full space-y-3.5 shadow-2xl text-white">
                  <h4 className="text-xs font-black border-b border-white/10 pb-2">{orderingOffer.title} - ৳{orderingOffer.price}</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">প্রাপক মোবাইল নম্বর</label>
                    <input type="tel" maxLength={11} placeholder="01XXXXXXXXX" value={targetDriveNumber} onChange={(e) => setTargetDriveNumber(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl space-y-2">
                    <label className="text-[11px] font-extrabold text-amber-300 block">⚠️ এই নাম্বারে কি লোন আছে?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setHasSimLoan(true)} className={`py-2 rounded-xl font-bold text-xs ${hasSimLoan === true ? 'bg-rose-600 text-white' : 'bg-black/30 text-slate-300 border border-white/10'}`}>হ্যাঁ</button>
                      <button type="button" onClick={() => setHasSimLoan(false)} className={`py-2 rounded-xl font-bold text-xs ${hasSimLoan === false ? 'bg-emerald-600 text-white' : 'bg-black/30 text-slate-300 border border-white/10'}`}>না</button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setOrderingOffer(null)} className="flex-1 py-2 bg-white/10 text-slate-300 rounded-xl font-bold">বাতিল</button>
                    <button disabled={hasSimLoan === true} onClick={handleConfirmDriveOrder} className={`flex-1 py-2 text-white font-bold rounded-xl ${hasSimLoan === true ? 'bg-slate-600 opacity-50' : 'bg-emerald-600'}`}>কনফার্ম</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* স্ক্র্যাচ কার্ড */}
        {activeSection === 'scratch' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 px-1">স্ক্র্যাচ কার্ড অফারসমূহ</h4>
            {scratchCards.map((card) => (
              <div key={card.id} className="bg-[#141032] border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-black text-white text-xs">{card.title}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">টাইপ: {card.type}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">৳{card.price}</span>
                </div>
                <div className="flex justify-end pt-1 border-t border-white/10">
                  <button onClick={() => { setBuyingCard(card); setTargetCardNumber(''); }} className="py-1.5 px-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 shadow-md"><ShoppingCart className="w-3.5 h-3.5" /> কিনুন</button>
                </div>
              </div>
            ))}

            {buyingCard && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#18133a] border border-white/15 rounded-3xl p-5 max-w-xs w-full space-y-3.5 shadow-2xl text-white">
                  <div className="border-b border-white/10 pb-2">
                    <h4 className="text-xs font-black">{buyingCard.title}</h4>
                    <p className="text-xs font-mono font-bold text-emerald-400">মূল্য: ৳{buyingCard.price}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">যে নম্বরে অফারটি নিতে চান (১১ ডিজিট)</label>
                    <input type="tel" maxLength={11} placeholder="017XXXXXXXX" value={targetCardNumber} onChange={(e) => setTargetCardNumber(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setBuyingCard(null)} className="flex-1 py-2 bg-white/10 text-slate-300 rounded-xl font-bold">বাতিল</button>
                    <button disabled={targetCardNumber.length < 11} onClick={handleConfirmBuyCard} className={`flex-1 py-2 text-white font-bold rounded-xl ${targetCardNumber.length < 11 ? 'bg-slate-600 opacity-50' : 'bg-emerald-600'}`}>কনফার্ম</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* এড ব্যালেন্স */}
        {activeSection === 'add_balance' && (
          <div className="space-y-3.5">
            {!addMoneyEnabled && <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 text-rose-300 font-bold text-center">⚠️ বর্তমানে Add Balance সার্ভিস বন্ধ রয়েছে।</div>}
            <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 space-y-3 shadow-xl text-white">
              <h4 className="font-bold border-b border-white/10 pb-2 flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-400" /> টাকা অ্যাড করুন</h4>
              <div className="grid grid-cols-3 gap-2">
                {['bKash', 'Nagad', 'Rocket'].map((m) => (
                  <button key={m} onClick={() => setSelectedMethod(m)} className={`py-2.5 rounded-2xl font-bold text-xs border ${selectedMethod === m ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-black/30 text-slate-300 border-white/10'}`}>{m}</button>
                ))}
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-1.5">
                <p className="text-[11px] text-slate-300">এই নম্বরে টাকা পাঠান: <strong className="font-mono text-indigo-300">{selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket}</strong></p>
              </div>
              <input type="number" placeholder="টাকার পরিমাণ (৳)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-bold text-white focus:outline-none focus:border-indigo-500" />
              <input type="text" placeholder="TrxID (ট্রানজ্যাকশন আইডি)" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-bold uppercase text-white focus:outline-none focus:border-indigo-500" />
              <button disabled={!addMoneyEnabled} onClick={handleAddBalanceSubmit} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg active:scale-95">পেমেন্ট সাবমিট করুন</button>
            </div>
          </div>
        )}

        {/* ফ্লেক্সিলোড */}
        {activeSection === 'flexiload' && (
          <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 space-y-3.5 shadow-xl text-white">
            <h4 className="font-bold border-b border-white/10 pb-2">মোবাইল ফ্লেক্সিলোড / রিচার্জ</h4>
            <input type="tel" maxLength={11} placeholder="017XXXXXXXX" value={flexiPhone} onChange={(e) => setFlexiPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-bold font-mono text-white focus:outline-none focus:border-indigo-500" />
            <input type="number" placeholder="টাকার পরিমাণ (৳)" value={flexiAmount} onChange={(e) => setFlexiAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 font-bold text-white focus:outline-none focus:border-indigo-500" />
            <button onClick={handleFlexiSubmit} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95">রিচার্জ কনফার্ম করুন</button>
          </div>
        )}

        {/* হিস্ট্রি */}
        {activeSection === 'history' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 bg-[#141032] border border-white/10 p-1 rounded-xl shadow-inner">
              <button onClick={() => setHistoryTab('add_money')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'add_money' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>এড-মানি</button>
              <button onClick={() => setHistoryTab('flexiload')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'flexiload' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>রিচার্জ</button>
              <button onClick={() => setHistoryTab('drive')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'drive' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>ড্রাইভ</button>
            </div>
            {historyTab === 'add_money' && userAddMoneyLogs.map(log => (
              <div key={log.id} className="bg-[#141032] border border-white/10 rounded-xl p-3 flex justify-between items-center shadow-lg text-white">
                <div><p className="font-bold">৳{log.amount} ({log.method})</p><p className="text-[10px] text-slate-400">TrxID: {log.trxId}</p></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">{log.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* লাইভ চ্যাট */}
        {activeSection === 'chats' && (
          <div className="bg-[#141032] border border-white/10 rounded-2xl p-3 h-[380px] flex flex-col shadow-xl text-white">
            <div className="border-b border-white/10 pb-1.5 mb-2 font-bold">অ্যাডমিনের সাথে লাইভ চ্যাট</div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs ${msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-white/10 text-slate-200'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 pt-2 border-t border-white/10 mt-2">
              <input type="text" placeholder="মেসেজ..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
              <button onClick={handleSendChatMessage} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md"><Send className="w-4 h-4" /></button>
            </div>
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
