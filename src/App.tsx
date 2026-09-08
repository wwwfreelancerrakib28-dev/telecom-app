import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
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
  ShieldCheck
} from 'lucide-react';

export default function UserApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState<'menu' | 'flexiload' | 'drive' | 'scratch' | 'add_balance' | 'history' | 'chats' | 'notifications' | 'profile'>('menu');
  
  const [userProfile, setUserProfile] = useState({
    name: 'Md. Tanvir Hasan',
    phone: '01712-345678',
    mainBalance: 1450,
    driveBalance: 3820
  });

  const [runningNotice] = useState('🎉 স্বাগতম SIM OFFER SHOP এ! আপনার প্রোফাইলে এখন ব্যালেন্স ও হিস্ট্রি একসাথে দেখতে পাবেন।');

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'স্বাগতম!', msg: 'আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই হয়েছে।', time: '10:30 AM', read: false }
  ]);

  const [paymentNumbers] = useState({ bkash: '01728116153', nagad: '01728116153', rocket: '01728116153' });
  const [addMoneyEnabled] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('bKash');
  const [balanceType, setBalanceType] = useState('main');
  const [addAmount, setAddAmount] = useState('');
  const [trxId, setTrxId] = useState('');

  // ইউজারের লেনদেন হিস্ট্রি স্টেট
  const [historyTab, setHistoryTab] = useState<'add_money' | 'flexiload' | 'drive'>('add_money');
  const [userAddMoneyLogs, setUserAddMoneyLogs] = useState([
    { id: 'AM-101', method: 'bKash', amount: 1000, type: 'main', trxId: 'BK990011', time: 'Today, 10:30 AM', status: 'Approved' }
  ]);
  const [userFlexiLogs, setUserFlexiLogs] = useState([
    { id: 'FLX-201', operator: 'Grameenphone', amount: 200, number: '01711223344', simType: 'Prepaid', time: 'Today, 11:00 AM', status: 'Completed' }
  ]);
  const [userDriveLogs, setUserDriveLogs] = useState([
    { id: 'DRV-301', operator: 'Grameenphone', title: '30 GB + 700 Min', price: 580, number: '01711223344', time: 'Yesterday', status: 'Completed' }
  ]);

  const [driveServiceEnabled] = useState(true);
  const [operatorStatus] = useState<Record<string, boolean>>({
    Grameenphone: true, Robi: true, Banglalink: true, Airtel: true, Teletalk: true
  });

  const [selectedDriveOp, setSelectedDriveOp] = useState('Grameenphone');
  const [driveOffers] = useState([
    { id: '1', operator: 'Grameenphone', title: '30 GB + 700 Min (30 Days)', price: 580, cashback: 119, note: 'ঢাকা ও চট্টগ্রাম' },
    { id: '2', operator: 'Robi', title: '50 GB + 1000 Min (30 Days)', price: 750, cashback: 149, note: 'সকল গ্রাহক' },
    { id: '3', operator: 'Teletalk', title: '25 GB + 500 Min (30 Days)', price: 399, cashback: 70, note: 'টেলিটক প্যাক' }
  ]);

  const [orderingOffer, setOrderingOffer] = useState<any | null>(null);
  const [targetDriveNumber, setTargetDriveNumber] = useState('');
  const [hasSimLoan, setHasSimLoan] = useState<boolean | null>(null);

  const [scratchCards] = useState([
    { id: 'SC-1', type: 'Minute', title: '৫০ মিনিট প্যাক', price: 30, pin: '*123*88493021#' }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [popupAlert, setPopupAlert] = useState<string | null>(null);

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setPopupAlert('🎉 পিন কপি হয়েছে!');
    setTimeout(() => { setCopiedId(null); setPopupAlert(null); }, 3000);
  };

  const handleCopyPaymentNumber = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleConfirmDriveOrder = () => {
    if (!targetDriveNumber || targetDriveNumber.length < 11) return alert('সঠিক ১১ ডিজিট নম্বর লিখুন!');
    if (hasSimLoan === null) return alert('লোন আছে কি না সিলেক্ট করুন!');
    if (hasSimLoan === true) return alert('⚠️ লোন থাকা অবস্থায় ড্রাইভ নেওয়া যাবে না!');
    if (userProfile.driveBalance < orderingOffer.price) return alert('ড্রাইভ ব্যালেন্স পর্যাপ্ত নয়!');

    setUserProfile(prev => ({ ...prev, driveBalance: prev.driveBalance - orderingOffer.price }));
    setUserDriveLogs(prev => [
      { id: 'DRV-' + Date.now(), operator: orderingOffer.operator, title: orderingOffer.title, price: orderingOffer.price, number: targetDriveNumber, time: 'Just now', status: 'Pending' },
      ...prev
    ]);

    setPopupAlert('🎉 আপনার ড্রাইভ অর্ডার সফলভাবে পাঠানো হয়েছে!');
    setOrderingOffer(null);
    setTargetDriveNumber('');
    setHasSimLoan(null);
  };

  const handleAddBalanceSubmit = () => {
    if (!addAmount || Number(addAmount) <= 0) return alert('সঠিক টাকার পরিমাণ লিখুন!');
    if (!trxId || trxId.length < 5) return alert('সঠিক ট্রানজ্যাকশন আইডি (TrxID) লিখুন!');

    setUserAddMoneyLogs(prev => [
      { id: 'AM-' + Date.now(), method: selectedMethod, amount: Number(addAmount), type: balanceType, trxId: trxId.toUpperCase(), time: 'Just now', status: 'Pending' },
      ...prev
    ]);

    setPopupAlert('🎉 আপনার এড-মানি রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
    setAddAmount('');
    setTrxId('');
  };

  const [flexiPhone, setFlexiPhone] = useState('');
  const [flexiOperator, setFlexiOperator] = useState('Grameenphone');
  const [simType, setSimType] = useState('Prepaid');
  const [flexiAmount, setFlexiAmount] = useState('');

  const handlePhoneChange = (val: string) => {
    setFlexiPhone(val);
    if (val.startsWith('017') || val.startsWith('013')) setFlexiOperator('Grameenphone');
    else if (val.startsWith('018')) setFlexiOperator('Robi');
    else if (val.startsWith('019') || val.startsWith('014')) setFlexiOperator('Banglalink');
    else if (val.startsWith('016')) setFlexiOperator('Airtel');
    else if (val.startsWith('015')) setFlexiOperator('Teletalk');
  };

  const handleFlexiSubmit = () => {
    if (!flexiPhone || flexiPhone.length < 11) return alert('সঠিক ১১ ডিজিট নম্বর লিখুন!');
    if (!flexiAmount || Number(flexiAmount) <= 0) return alert('সঠিক টাকার পরিমাণ লিখুন!');
    if (userProfile.mainBalance < Number(flexiAmount)) return alert('মেইন ব্যালেন্সে পর্যাপ্ত টাকা নেই!');

    setUserProfile(prev => ({ ...prev, mainBalance: prev.mainBalance - Number(flexiAmount) }));
    setUserFlexiLogs(prev => [
      { id: 'FLX-' + Date.now(), operator: flexiOperator, amount: Number(flexiAmount), number: flexiPhone, simType, time: 'Just now', status: 'Pending' },
      ...prev
    ]);

    setPopupAlert('🎉 ফ্লেক্সিলোড রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
    setFlexiPhone('');
    setFlexiAmount('');
  };

  const handleBack = () => {
    if (orderingOffer) setOrderingOffer(null);
    else if (activeSection !== 'menu') setActiveSection('menu');
  };

  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (orderingOffer || activeSection !== 'menu') handleBack();
      else CapacitorApp.exitApp();
    });
    return () => { backListener.then(h => h.remove()); };
  }, [orderingOffer, activeSection]);

  const visibleOffers = driveOffers.filter(o => o.operator === selectedDriveOp);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none font-sans text-xs">
      <header className="bg-white border-b px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {activeSection !== 'menu' ? (
            <button onClick={handleBack} className="p-2 -ml-2 rounded-xl bg-slate-100 text-slate-800 active:scale-95">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button onClick={() => setActiveSection('profile')} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md active:scale-95" title="প্রোফাইল">
              {userProfile.name.charAt(0)}
            </button>
          )}
          <div>
            <h2 className="text-xs font-black text-slate-900 leading-tight">{userProfile.name}</h2>
            <p className="text-[10px] text-slate-500 font-mono">{userProfile.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setActiveSection('profile')} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold active:scale-95 flex items-center gap-1">
            <UserIcon className="w-4 h-4" /> প্রোফাইল
          </button>
          <button onClick={() => setActiveSection('notifications')} className="p-2 rounded-xl bg-slate-100 text-slate-700 relative">
            <Bell className="w-4 h-4" />
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-bold overflow-hidden whitespace-nowrap shadow-inner flex items-center gap-2">
        <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[9px] uppercase font-black">Notice</span>
        <span className="font-medium">{runningNotice}</span>
      </div>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-4">
        {activeSection === 'menu' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg">RETAILER ACCOUNT</span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 block mb-0.5">মেইন ব্যালেন্স</span>
                  <h3 className="text-lg font-black font-mono text-white">৳{userProfile.mainBalance}</h3>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 block mb-0.5">ড্রাইভ ব্যালেন্স</span>
                  <h3 className="text-lg font-black font-mono text-amber-400">৳{userProfile.driveBalance}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button onClick={() => setActiveSection('flexiload')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm active:scale-95">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2"><Send className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-900">Flexiload</span>
              </button>
              <button onClick={() => setActiveSection('drive')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm active:scale-95">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><Flame className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-900">Drive Pack</span>
              </button>
              <button onClick={() => setActiveSection('scratch')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm active:scale-95">
                <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-2"><Ticket className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-900">Scratch Card</span>
              </button>
              <button onClick={() => setActiveSection('add_balance')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm active:scale-95">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><Wallet className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-900">Add Balance</span>
              </button>
              <button onClick={() => setActiveSection('history')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm active:scale-95">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-2"><History className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-900">History</span>
              </button>
              <button onClick={() => setActiveSection('chats')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm active:scale-95">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2"><MessageSquare className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-900">Live Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* নতুন প্রোফাইল পেজ (যেখানে ইউজারের নাম, ব্যালেন্স এবং হিস্ট্রি শো করবে) */}
        {activeSection === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white border rounded-3xl p-5 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">{userProfile.name}</h3>
                <p className="text-xs text-slate-500 font-mono">📱 {userProfile.phone}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                  Verified Retailer
                </span>
              </div>

              {/* প্রোফাইলে বর্তমান ব্যালেন্স শো করার কার্ড */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">মেইন ব্যালেন্স</span>
                  <h4 className="text-base font-black font-mono text-indigo-600">৳{userProfile.mainBalance}</h4>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">ড্রাইভ ব্যালেন্স</span>
                  <h4 className="text-base font-black font-mono text-amber-600">৳{userProfile.driveBalance}</h4>
                </div>
              </div>
            </div>

            {/* প্রোফাইল হিসت্রি সামারি */}
            <div className="bg-white border rounded-3xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-violet-600" /> আপনার সাম্প্রতিক লেনদেন রিপোর্ট
              </h4>
              <div className="space-y-2">
                {userFlexiLogs.slice(0, 2).map(flx => (
                  <div key={flx.id} className="bg-slate-50 border rounded-2xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">রিচার্জ: ৳{flx.amount} ({flx.operator})</p>
                      <p className="text-[10px] text-slate-500 font-mono">নম্বর: {flx.number}</p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">{flx.status}</span>
                  </div>
                ))}
                {userDriveLogs.slice(0, 2).map(drv => (
                  <div key={drv.id} className="bg-slate-50 border rounded-2xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">ড্রাইভ: {drv.title} (৳{drv.price})</p>
                      <p className="text-[10px] text-slate-500 font-mono">নম্বর: {drv.number}</p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">{drv.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* এড ব্যালেন্স পেজ */}
        {activeSection === 'add_balance' && (
          <div className="space-y-3.5">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold text-xs">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>টাকা অ্যাড করার নিয়ম:</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed pl-5">
                প্রথমে অ্যাডমিনের দেওয়া নাম্বারটি কপি করে আপনার বিকাশ/নগদ থেকে টাকা পাঠান। এরপর ট্রানজেকশন আইডি (TrxID) ও কত টাকা পাঠিয়েছেন তা এখানে লিখে নিচে কনফার্ম করুন।
              </p>
            </div>

            <div className="bg-white border rounded-3xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" /> টাকা অ্যাড করুন (Add Balance)
              </h4>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">পেমেন্ট মাধ্যম সিলেক্ট করুন</label>
                <div className="grid grid-cols-3 gap-2">
                  {['bKash', 'Nagad', 'Rocket'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMethod(m)}
                      className={`py-2.5 rounded-2xl font-bold text-xs border transition-all ${
                        selectedMethod === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                <p className="text-[11px] text-slate-600 font-semibold">
                  এই <span className="text-indigo-600 font-bold">{selectedMethod}</span> নম্বরে টাকা পাঠান:
                </p>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5">
                  <span className="font-mono text-indigo-700 font-black text-sm">
                    {selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket}
                  </span>
                  <button
                    onClick={() => handleCopyPaymentNumber(
                      selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket,
                      'pay-num'
                    )}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95"
                  >
                    {copiedId === 'pay-num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'pay-num' ? 'কপি!' : 'নম্বর কপি'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">কোন ব্যালেন্সে এড করতে চান?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setBalanceType('main')} className={`py-2 rounded-xl font-bold text-xs ${balanceType === 'main' ? 'bg-indigo-50 text-indigo-700 border' : 'bg-slate-50 border'}`}>মেইন ব্যালেন্স</button>
                  <button type="button" onClick={() => setBalanceType('drive')} className={`py-2 rounded-xl font-bold text-xs ${balanceType === 'drive' ? 'bg-amber-50 text-amber-700 border' : 'bg-slate-50 border'}`}>ড্রাইভ ব্যালেন্স</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">টাকার পরিমাণ (৳)</label>
                <input type="number" placeholder="যেমন: 500" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-mono font-bold" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ট্রানজ্যাকশন আইডি (TrxID)</label>
                <input type="text" placeholder="যেমন: BK990011" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-mono font-bold uppercase" />
              </div>

              <button onClick={handleAddBalanceSubmit} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md">
                পেমেন্ট সাবমিট করুন
              </button>
            </div>
          </div>
        )}

        {activeSection === 'drive' && (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-1 bg-slate-200/80 p-1.5 rounded-2xl">
              {['Grameenphone', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'].map((op) => (
                <button
                  key={op}
                  onClick={() => setSelectedDriveOp(op)}
                  className={`py-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center ${
                    selectedDriveOp === op ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <span>{op === 'Grameenphone' ? 'GP' : op === 'Banglalink' ? 'BL' : op}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {visibleOffers.map((offer) => (
                <div key={offer.id} className="bg-white border rounded-2xl p-3.5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{offer.operator}</span>
                      <h4 className="text-xs font-black text-slate-900 mt-1">{offer.title}</h4>
                      {offer.note && <p className="text-[10px] text-slate-500 mt-0.5">📌 {offer.note}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-indigo-600 block">৳{offer.price}</span>
                      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">ক্যাশব্যাক ৳{offer.cashback}</span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1 border-t border-slate-100">
                    <button onClick={() => setOrderingOffer(offer)} className="py-1.5 px-4 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm">
                      কিনুন
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {orderingOffer && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3.5 shadow-2xl">
                  <h4 className="text-xs font-black text-slate-900 border-b pb-2">{orderingOffer.title} - ৳{orderingOffer.price}</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">প্রাপক মোবাইল নম্বর</label>
                    <input type="tel" maxLength={11} placeholder="01XXXXXXXXX" value={targetDriveNumber} onChange={(e) => setTargetDriveNumber(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-mono font-bold" />
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-2xl space-y-2 border border-amber-200">
                    <label className="text-[11px] font-extrabold text-amber-900 block">⚠️ এই নাম্বারে কি লোন আছে?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setHasSimLoan(true)} className={`py-2 rounded-xl font-bold text-xs ${hasSimLoan === true ? 'bg-rose-600 text-white' : 'bg-white'}`}>হ্যাঁ</button>
                      <button type="button" onClick={() => setHasSimLoan(false)} className={`py-2 rounded-xl font-bold text-xs ${hasSimLoan === false ? 'bg-emerald-600 text-white' : 'bg-white'}`}>না</button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setOrderingOffer(null)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">বাতিল</button>
                    <button disabled={hasSimLoan === true} onClick={handleConfirmDriveOrder} className={`flex-1 py-2 text-white font-bold rounded-xl ${hasSimLoan === true ? 'bg-slate-300' : 'bg-emerald-600'}`}>কনফার্ম</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'scratch' && (
          <div className="space-y-3">
            {scratchCards.map((card) => (
              <div key={card.id} className="bg-white border rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <span>{card.title} - ৳{card.price}</span>
                <button onClick={() => handleCopyPin(card.pin, card.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">কপি পিন</button>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'flexiload' && (
          <div className="bg-white border rounded-3xl p-4 space-y-3.5 shadow-sm">
            <h4 className="font-bold text-slate-900 border-b pb-2">মোবাইল ফ্লেক্সিলোড / রিচার্জ</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">অপারেটর নির্বাচন করুন</label>
              <div className="grid grid-cols-5 gap-1.5">
                {['Grameenphone', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'].map((op) => (
                  <button
                    key={op}
                    onClick={() => setFlexiOperator(op)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black border transition-all flex flex-col items-center justify-center ${
                      flexiOperator === op ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{op === 'Grameenphone' ? 'GP' : op === 'Banglalink' ? 'BL' : op}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">মোবাইল নম্বর</label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="017XXXXXXXX"
                  value={flexiPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl pl-3 pr-24 py-2.5 text-xs font-mono font-bold"
                />
                <div className="absolute right-2 top-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                  {flexiOperator}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">সিম টাইপ সিলেক্ট করুন</label>
              <div className="grid grid-cols-3 gap-2">
                {['Prepaid', 'Postpaid', 'Skitto'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSimType(type)}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      simType === type ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">টাকার পরিমাণ (৳)</label>
              <input type="number" placeholder="100" value={flexiAmount} onChange={(e) => setFlexiAmount(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-mono font-bold" />
            </div>

            <button onClick={handleFlexiSubmit} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md">
              রিচার্জ কনফার্ম করুন
            </button>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl">
              <button onClick={() => setHistoryTab('add_money')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'add_money' ? 'bg-white shadow-sm' : ''}`}>এড-মানি</button>
              <button onClick={() => setHistoryTab('flexiload')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'flexiload' ? 'bg-white shadow-sm' : ''}`}>রিচার্জ</button>
              <button onClick={() => setHistoryTab('drive')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'drive' ? 'bg-white shadow-sm' : ''}`}>ড্রাইভ</button>
            </div>

            {historyTab === 'add_money' && (
              <div className="space-y-2">
                {userAddMoneyLogs.map(log => (
                  <div key={log.id} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900">৳{log.amount} ({log.method})</p>
                      <p className="text-[10px] text-slate-500">TrxID: {log.trxId} • {log.time}</p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">{log.status}</span>
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'flexiload' && (
              <div className="space-y-2">
                {userFlexiLogs.map(flx => (
                  <div key={flx.id} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900">{flx.operator} - ৳{flx.amount} ({flx.simType})</p>
                      <p className="text-[10px] text-slate-500 font-mono">নম্বর: {flx.number}</p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">{flx.status}</span>
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'drive' && (
              <div className="space-y-2">
                {userDriveLogs.map(drv => (
                  <div key={drv.id} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900">{drv.operator} - {drv.title} (৳{drv.price})</p>
                      <p className="text-[10px] text-slate-500 font-mono">নম্বর: {drv.number}</p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">{drv.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-2.5">
            {notifications.map(n => (
              <div key={n.id} className="bg-white border rounded-2xl p-3.5 shadow-sm">
                <h5 className="font-bold">{n.title}</h5>
                <p className="text-slate-600 text-xs">{n.msg}</p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'chats' && (
          <div className="bg-white border rounded-2xl p-3 h-[380px] flex flex-col shadow-sm">
            <div className="border-b pb-1.5 mb-2 font-bold">অ্যাডমিনের সাথে লাইভ চ্যাট</div>
            <div className="flex-1 overflow-y-auto">আসসালামু আলাইকুম!</div>
            <div className="flex gap-1.5 pt-2 border-t">
              <input type="text" placeholder="মেসেজ..." className="flex-1 bg-slate-50 border rounded-xl px-3 py-1.5 text-xs" />
              <button onClick={() => alert('sent')} className="p-2 bg-indigo-600 text-white rounded-xl"><Send className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </main>

      {popupAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto"><Check className="w-5 h-5 stroke-[3]" /></div>
            <h4 className="text-xs font-extrabold text-slate-900">{popupAlert}</h4>
            <button onClick={() => setPopupAlert(null)} className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">ঠিক আছে</button>
          </div>
        </div>
      )}
    </div>
  );
    }
