import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { 
  Send, 
  Flame, 
  Wallet, 
  History, 
  MessageSquare, 
  Share2, 
  User, 
  Bell, 
  LogOut, 
  ArrowLeft, 
  Ticket, 
  Copy, 
  Check, 
  Lock, 
  Smartphone,
  CheckCircle,
  XCircle,
  Radio
} from 'lucide-react';

export default function UserApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState<'menu' | 'flexiload' | 'drive' | 'scratch' | 'add_balance' | 'history' | 'chats' | 'profile' | 'notifications'>('menu');
  
  // ইউজার প্রোফাইল ও ব্যালেন্স স্টেট
  const [userProfile] = useState({
    name: 'Md. Tanvir Hasan',
    phone: '01712-345678',
    pin: '1234',
    mainBalance: 1450,
    driveBalance: 3820
  });

  // রানিং নোটিশ (অ্যাডমিন প্যানেল থেকে যা সেট করা হবে)
  const [runningNotice] = useState('🎉 স্বাগতম SIM OFFER SHOP এ! যেকোনো সমস্যায় আমাদের লাইভ চ্যাটে যোগাযোগ করুন।');

  // নোটিফিকেশন ইনবক্স স্টেট (অ্যাডমিন থেকে পাঠানো পার্সোনাল বা গ্লোবাল নোটিশ)
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'স্বাগতম!', msg: 'আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই হয়েছে।', time: '10:30 AM', read: false },
    { id: '2', title: 'ড্রাইভ অফার', msg: 'আজ জিপি এবং রবি সিমে দুর্দান্ত ক্যাশব্যাক চলছে!', time: 'Yesterday', read: true }
  ]);

  // স্ক্র্যাচ কার্ড স্টেট
  const [scratchCards, setScratchCards] = useState([
    { id: 'SC-1', type: 'Minute', title: '৫০ মিনিট প্যাক', price: 30, pin: '*123*88493021#' },
    { id: 'SC-2', type: 'Internet', title: '১ জিবি এমবি প্যাক', price: 25, pin: '*567*99201934#' }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [popupAlert, setPopupAlert] = useState<string | null>(null);

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setPopupAlert('🎉 আপনার স্ক্র্যাচ কার্ডের নম্বরটি সফলভাবে কপি করা হয়ে গেছে! ডায়াল করে আপনার মিনিট/এমবি উপভোগ করুন।');
    setTimeout(() => {
      setCopiedId(null);
      setPopupAlert(null);
    }, 3500);
  };

  // ফ্লেক্সিলোড ও ড্রাইভ ফর্ম স্টেট
  const [flexiOperator, setFlexiOperator] = useState('Grameenphone');
  const [flexiAmount, setFlexiAmount] = useState('');
  const [flexiPhone, setFlexiPhone] = useState('');

  // অ্যাডমিন কন্ট্রোল সিম স্ট্যাটাস (অ্যাডমিন প্যানেল থেকে নিয়ন্ত্রিত হবে)
  const [driveServiceEnabled] = useState(true);
  const [operatorStatus] = useState<Record<string, boolean>>({
    Grameenphone: true,
    Robi: true,
    Banglalink: true,
    Airtel: true,
    Teletalk: false
  });

  const handleBack = () => {
    if (activeSection !== 'menu') {
      setActiveSection('menu');
    }
  };

  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (activeSection !== 'menu') {
        handleBack();
      } else {
        CapacitorApp.exitApp();
      }
    });
    return () => {
      backListener.then(handler => handler.remove());
    };
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none font-sans text-xs">
      {/* ইউজার অ্যাপ হেডার */}
      <header className="bg-white border-b px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {activeSection !== 'menu' ? (
            <button onClick={handleBack} className="p-2 -ml-2 rounded-xl bg-slate-100 text-slate-800 active:scale-95">
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              {userProfile.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xs font-black text-slate-900 leading-tight">{userProfile.name}</h2>
            <p className="text-[10px] text-slate-500 font-mono">{userProfile.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveSection('notifications')} 
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative active:scale-95"
            title="নোটিফিকেশন"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setIsLoggedIn(false)} 
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 active:scale-95"
            title="লগআউট"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* রানিং নোটিশ টিকার */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-bold overflow-hidden whitespace-nowrap shadow-inner flex items-center gap-2">
        <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[9px] uppercase">Notice</span>
        <span className="animate-marquee">{runningNotice}</span>
      </div>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-4">
        {activeSection === 'menu' && (
          <div className="space-y-4">
            {/* ব্যালেন্স কার্ড */}
            <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg">
                  RETAILER ACCOUNT
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Active
                </span>
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

            {/* কুইক অ্যাকশন বা সার্ভিস মেনু */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Actions</h4>
                <span className="text-[10px] text-slate-400 font-bold">Services</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => setActiveSection('flexiload')}
                  className="bg-white border border-slate-200/80 rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Flexiload</span>
                  <span className="text-[9px] text-slate-400">Mobile Top-Up</span>
                </button>

                <button
                  onClick={() => setActiveSection('drive')}
                  className="bg-white border border-slate-200/80 rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all relative"
                >
                  <span className="absolute top-2 right-2 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">HOT</span>
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Drive Pack</span>
                  <span className="text-[9px] text-slate-400">Data & Minutes</span>
                </button>

                <button
                  onClick={() => setActiveSection('scratch')}
                  className="bg-white border border-slate-200/80 rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-2">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Scratch Card</span>
                  <span className="text-[9px] text-slate-400">Minute / MB</span>
                </button>

                <button
                  onClick={() => setActiveSection('add_balance')}
                  className="bg-white border border-slate-200/80 rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Add Balance</span>
                  <span className="text-[9px] text-slate-400">bKash / Nagad</span>
                </button>

                <button
                  onClick={() => setActiveSection('history')}
                  className="bg-white border border-slate-200/80 rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
                    <History className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">History</span>
                  <span className="text-[9px] text-slate-400">All Reports</span>
                </button>

                <button
                  onClick={() => setActiveSection('chats')}
                  className="bg-white border border-slate-200/80 rounded-3xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Live Chat</span>
                  <span className="text-[9px] text-slate-400">Instant Help</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* স্ক্র্যাচ কার্ড পেজ (যেখানে ইউজার কার্ড কিনতে ও পিন কপি করতে পারবে) */}
        {activeSection === 'scratch' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 px-1">আপনার কেনা স্ক্র্যাচ কার্ডসমূহ</h4>
            {scratchCards.map((card) => (
              <div key={card.id} className="bg-white border rounded-2xl p-4 space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{card.title}</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">৳{card.price}</span>
                </div>
                <div className="bg-slate-50 border rounded-xl p-2.5 flex justify-between items-center">
                  <span className="font-mono text-indigo-700 font-bold text-sm tracking-wider">{card.pin}</span>
                  <button onClick={() => handleCopyPin(card.pin, card.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95">
                    {copiedId === card.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === card.id ? 'কপি হয়েছে!' : 'পিন কপি'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ড্রাইভ প্যাক পেজ (যদি অ্যাডমিন ড্রাইভ অফার বন্ধ রাখেন তবে নোটিশ দেখাবে) */}
        {activeSection === 'drive' && (
          <div className="space-y-3">
            {!driveServiceEnabled ? (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-rose-900">বর্তমানে ড্রাইভ অফার বন্ধ আছে!</h4>
                <p className="text-xs text-rose-600">অ্যাডমিন প্যানেল থেকে ড্রাইভ সার্ভিস সাময়িকভাবে স্থগিত রাখা হয়েছে। অনুগ্রহ করে পরবর্তীতে চেষ্টা করুন।</p>
              </div>
            ) : (
              <div className="bg-white border rounded-2xl p-4 text-center text-slate-500">
                সকল সচল ড্রাইভ প্যাক লিস্ট এখানে শো করবে...
              </div>
            )}
          </div>
        )}

        {/* ফ্লেক্সিলোড পেজ */}
        {activeSection === 'flexiload' && (
          <div className="bg-white border rounded-3xl p-4 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-900 border-b pb-2">মোবাইল ফ্লেক্সিলোড / রিচার্জ</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">অপারেটর সিলেক্ট করুন</label>
              <select value={flexiOperator} onChange={(e) => setFlexiOperator(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold">
                <option value="Grameenphone">Grameenphone</option>
                <option value="Robi">Robi</option>
                <option value="Banglalink">Banglalink</option>
                <option value="Airtel">Airtel</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">মোবাইল নম্বর</label>
              <input type="tel" placeholder="017XXXXXXXX" value={flexiPhone} onChange={(e) => setFlexiPhone(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">টাকার পরিমাণ (৳)</label>
              <input type="number" placeholder="100" value={flexiAmount} onChange={(e) => setFlexiAmount(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-mono font-bold" />
            </div>
            <button onClick={() => alert('রিচার্জ রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে!')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md">
              রিচার্জ কনফার্ম করুন
            </button>
          </div>
        )}

        {/* নোটিফিকেশন ইনবক্স */}
        {activeSection === 'notifications' && (
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 px-1">আপনার নোটিফিকেশন ইনবক্স</h4>
            {notifications.map(n => (
              <div key={n.id} className="bg-white border rounded-2xl p-3.5 space-y-1 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  <span className="text-[9px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-slate-600 text-xs">{n.msg}</p>
              </div>
            ))}
          </div>
        )}

        {/* লাইভ চ্যাট */}
        {activeSection === 'chats' && (
          <div className="bg-white border rounded-2xl p-3 h-[400px] flex flex-col shadow-sm">
            <div className="border-b pb-1.5 mb-2 font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> অ্যাডমিনের সাথে লাইভ চ্যাট
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-slate-100 text-slate-800 rounded-2xl px-3.5 py-2 text-xs">
                  আসসালামু আলাইকুম! বলুন আপনাকে কীভাবে সাহায্য করতে পারি?
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 pt-2 border-t mt-2">
              <input type="text" placeholder="আপনার সমস্যা লিখুন..." className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none" />
              <button onClick={() => alert('মেসেজ পাঠানো হয়েছে!')} className="p-2.5 bg-indigo-600 text-white rounded-xl">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* পপ-আপ অ্যালার্ট */}
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
