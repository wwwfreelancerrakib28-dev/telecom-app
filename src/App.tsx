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
  Clock
} from 'lucide-react';

export default function UserApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState<'menu' | 'flexiload' | 'drive' | 'scratch' | 'add_balance' | 'history' | 'chats' | 'notifications' | 'profile'>('menu');
  
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

  const [runningNotice, setRunningNotice] = useState('🎉 স্বাগতম SIM OFFER SHOP এ!');
  const [notifications, setNotifications] = useState<any[]>([]);

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

    onValue(ref(db, 'users/1'), (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setUserProfile(prev => ({ ...prev, ...val }));
      }
    });

    onValue(ref(db, 'offers'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDriveOffers(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setDriveOffers([]);
      }
    });

    onValue(ref(db, 'scratchCards'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setScratchCards(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setScratchCards([]);
      }
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

    onValue(ref(db, `chats/${userProfile.id}`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setChatMessages(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      }
    });
  }, []);

  const handleConfirmBuyCard = () => {
    if (!buyingCard) return;
    if (!targetCardNumber || targetCardNumber.length < 11) return alert('সঠিক ১১ ডিজিট নম্বর লিখুন!');
    if (userProfile.mainBalance < buyingCard.price) return alert('মেইন ব্যালেন্স পর্যাপ্ত নয়!');

    const newMainBal = userProfile.mainBalance - buyingCard.price;
    update(ref(db, `users/${userProfile.id}`), { mainBalance: newMainBal });

    push(ref(db, 'rechargeOrders'), {
      userId: userProfile.id,
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
    update(ref(db, `users/${userProfile.id}`), { driveBalance: newDriveBal });

    push(ref(db, 'driveOrders'), {
      userId: userProfile.id,
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
      userId: userProfile.id,
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
    update(ref(db, `users/${userProfile.id}`), { mainBalance: newMainBal });

    push(ref(db, 'rechargeOrders'), {
      userId: userProfile.id,
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
    push(ref(db, `chats/${userProfile.id}`), {
      sender: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString()
    });
    setChatInput('');
  };

  const visibleOffers = driveOffers.filter(o => o.operator === selectedDriveOp);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none font-sans text-xs">
      <header className="bg-white border-b px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {activeSection !== 'menu' ? (
            <button onClick={() => setActiveSection('menu')} className="p-2 -ml-2 rounded-xl bg-slate-100 text-slate-800"><ArrowLeft className="w-4 h-4" /></button>
          ) : (
            <button onClick={() => setActiveSection('profile')} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">{userProfile.name.charAt(0)}</button>
          )}
          <div>
            <h2 className="text-xs font-black text-slate-900 leading-tight">{userProfile.name}</h2>
            <p className="text-[10px] text-slate-500 font-mono">{showPhone ? userProfile.phone : '01712-******'}</p>
          </div>
        </div>
        <button onClick={() => setActiveSection('profile')} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center gap-1"><UserIcon className="w-4 h-4" /> প্রোফাইল</button>
      </header>

      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-bold overflow-hidden whitespace-nowrap shadow-inner flex items-center gap-2">
        <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[9px] uppercase font-black">Notice</span>
        <span className="font-medium">{runningNotice}</span>
      </div>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-4">
        {activeSection === 'menu' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl space-y-3">
              <span className="text-[10px] font-bold text-slate-300 uppercase bg-white/10 px-2.5 py-1 rounded-lg">RETAILER ACCOUNT</span>
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
              <button onClick={() => setActiveSection('flexiload')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm"><div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2"><Send className="w-5 h-5" /></div><span className="text-xs font-bold">Flexiload</span></button>
              <button onClick={() => setActiveSection('drive')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm"><div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><Flame className="w-5 h-5" /></div><span className="text-xs font-bold">Drive Pack</span></button>
              <button onClick={() => setActiveSection('scratch')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm"><div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-2"><Ticket className="w-5 h-5" /></div><span className="text-xs font-bold">Scratch Card</span></button>
              <button onClick={() => setActiveSection('add_balance')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm"><div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><Wallet className="w-5 h-5" /></div><span className="text-xs font-bold">Add Balance</span></button>
              <button onClick={() => setActiveSection('history')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm"><div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-2"><History className="w-5 h-5" /></div><span className="text-xs font-bold">History</span></button>
              <button onClick={() => setActiveSection('chats')} className="bg-white border rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm"><div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2"><MessageSquare className="w-5 h-5" /></div><span className="text-xs font-bold">Live Chat</span></button>
            </div>
          </div>
        )}

        {/* ড্রাইভ প্যাক পেজ */}
        {activeSection === 'drive' && (
          <div className="space-y-3">
            {!masterDriveEnabled || simStatus[selectedDriveOp] === false ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl p-6 text-center space-y-2">
                <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
                <h4 className="font-black text-sm">⚠️ ড্রাইভ অফার সাময়িকভাবে বন্ধ আছে</h4>
                <p className="text-[11px] text-rose-600">দুঃখিত! এই মুহূর্তে অ্যাডমিন কর্তৃক ড্রাইভ অফারগুলো বন্ধ রাখা হয়েছে। দয়া করে পরবর্তী আপডেটের জন্য অপেক্ষা করুন।</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-5 gap-1 bg-slate-200/80 p-1.5 rounded-2xl">
                  {['Grameenphone', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'].map((op) => (
                    <button key={op} onClick={() => setSelectedDriveOp(op)} className={`py-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center ${selectedDriveOp === op ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>
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
                          <span className="text-sm font-black font-mono text-indigo-600 block">৳{offer.offerPrice}</span>
                          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">ক্যাশব্যাক ৳{offer.cashback}</span>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1 border-t border-slate-100">
                        <button onClick={() => setOrderingOffer({ ...offer, price: offer.offerPrice })} className="py-1.5 px-4 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm">কিনুন</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

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
            <h4 className="font-bold text-slate-800 px-1">স্ক্র্যাচ কার্ড অফারসমূহ</h4>
            {scratchCards.map((card) => (
              <div key={card.id} className="bg-white border rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-black text-slate-900 text-xs">{card.title}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">টাইপ: {card.type}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">৳{card.price}</span>
                </div>
                <div className="flex justify-end pt-1 border-t border-slate-100">
                  <button onClick={() => { setBuyingCard(card); setTargetCardNumber(''); }} className="py-1.5 px-4 bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5" /> কিনুন</button>
                </div>
              </div>
            ))}

            {buyingCard && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3.5 shadow-2xl">
                  <div className="border-b pb-2">
                    <h4 className="text-xs font-black text-slate-900">{buyingCard.title}</h4>
                    <p className="text-xs font-mono font-bold text-emerald-600">মূল্য: ৳{buyingCard.price}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">যে নম্বরে অফারটি নিতে চান (১১ ডিজিট)</label>
                    <input type="tel" maxLength={11} placeholder="017XXXXXXXX" value={targetCardNumber} onChange={(e) => setTargetCardNumber(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-mono font-bold" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setBuyingCard(null)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">বাতিল</button>
                    <button disabled={targetCardNumber.length < 11} onClick={handleConfirmBuyCard} className={`flex-1 py-2 text-white font-bold rounded-xl ${targetCardNumber.length < 11 ? 'bg-slate-300' : 'bg-emerald-600'}`}>কনফার্ম</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="bg-white border rounded-3xl p-5 text-center space-y-3 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">{userProfile.name.charAt(0)}</div>
            <h3 className="text-sm font-black text-slate-900">{userProfile.name}</h3>
            <p className="text-xs text-slate-500 font-mono">📱 {showPhone ? userProfile.phone : '01712-******'}</p>
          </div>
        )}

        {activeSection === 'add_balance' && (
          <div className="space-y-3.5">
            {!addMoneyEnabled && <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-700 font-bold text-center">⚠️ বর্তমানে Add Balance সার্ভিস বন্ধ রয়েছে।</div>}
            <div className="bg-white border rounded-3xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-600" /> টাকা অ্যাড করুন</h4>
              <div className="grid grid-cols-3 gap-2">
                {['bKash', 'Nagad', 'Rocket'].map((m) => (
                  <button key={m} onClick={() => setSelectedMethod(m)} className={`py-2.5 rounded-2xl font-bold text-xs border ${selectedMethod === m ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>{m}</button>
                ))}
              </div>
              <div className="bg-slate-50 border rounded-2xl p-3 space-y-1.5">
                <p className="text-[11px] text-slate-600">এই নম্বরে টাকা পাঠান: <strong className="font-mono text-indigo-700">{selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket}</strong></p>
              </div>
              <input type="number" placeholder="টাকার পরিমাণ (৳)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold" />
              <input type="text" placeholder="TrxID (ট্রানজ্যাকশন আইডি)" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold uppercase" />
              <button disabled={!addMoneyEnabled} onClick={handleAddBalanceSubmit} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">পেমেন্ট সাবমিট করুন</button>
            </div>
          </div>
        )}

        {activeSection === 'flexiload' && (
          <div className="bg-white border rounded-3xl p-4 space-y-3.5 shadow-sm">
            <h4 className="font-bold text-slate-900 border-b pb-2">মোবাইল ফ্লেক্সিলোড / রিচার্জ</h4>
            <input type="tel" maxLength={11} placeholder="017XXXXXXXX" value={flexiPhone} onChange={(e) => handlePhoneChange(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold font-mono" />
            <input type="number" placeholder="টাকার পরিমাণ (৳)" value={flexiAmount} onChange={(e) => setFlexiAmount(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold" />
            <button onClick={handleFlexiSubmit} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">রিচার্জ কনফার্ম করুন</button>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl">
              <button onClick={() => setHistoryTab('add_money')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'add_money' ? 'bg-white shadow-sm' : ''}`}>এড-মানি</button>
              <button onClick={() => setHistoryTab('flexiload')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'flexiload' ? 'bg-white shadow-sm' : ''}`}>রিচার্জ</button>
              <button onClick={() => setHistoryTab('drive')} className={`py-1.5 rounded-lg font-bold ${historyTab === 'drive' ? 'bg-white shadow-sm' : ''}`}>ড্রাইভ</button>
            </div>
            {historyTab === 'add_money' && userAddMoneyLogs.map(log => (
              <div key={log.id} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                <div><p className="font-bold">৳{log.amount} ({log.method})</p><p className="text-[10px] text-slate-500">TrxID: {log.trxId}</p></div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-700">{log.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'chats' && (
          <div className="bg-white border rounded-2xl p-3 h-[380px] flex flex-col shadow-sm">
            <div className="border-b pb-1.5 mb-2 font-bold">অ্যাডমিনের সাথে লাইভ চ্যাট</div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 pt-2 border-t mt-2">
              <input type="text" placeholder="মেসেজ..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs" />
              <button onClick={handleSendChatMessage} className="p-2.5 bg-indigo-600 text-white rounded-xl"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </main>

      {popupAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="text-xs font-black text-slate-900">{popupAlert}</h4>
            <button onClick={() => setPopupAlert(null)} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl">ঠিক আছে</button>
          </div>
        </div>
      )}
    </div>
  );
}
