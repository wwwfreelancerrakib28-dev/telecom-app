import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { db } from './firebase';
import { ref, set, push, onValue, get } from 'firebase/database';
import { 
  Send, Flame, Wallet, History, MessageSquare, Bell, LogOut, ArrowLeft, 
  Ticket, Copy, Check, Facebook, MessageCircle, 
  Eye, ShoppingCart, AlertCircle, Key, HelpCircle, 
  Sparkles, RefreshCw, Zap, FileText, Download, MapPin, WifiOff, Clock, ShieldAlert
} from 'lucide-react';

// বাংলা ও আরবি সংখ্যা রূপান্তর ফাংশন
const toBnDigit = (num: number | string) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
};

// বঙ্গাব্দ (বাংলা ক্যালেন্ডার - বাংলাদেশ সরকারি নিয়ম)
const getBanglaDate = (date: Date) => {
  const d = date.getDate();
  const m = date.getMonth(); // 0-indexed (Jan = 0)
  const y = date.getFullYear();

  const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const falgunDays = isLeapYear ? 30 : 29;
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgunDays, 30];
  const monthNames = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];

  let bYear = (m < 3 || (m === 3 && d < 14)) ? y - 594 : y - 593;

  let bDate = 1;
  let bMonthIndex = 0;

  if (m === 3 && d >= 14) {
    bDate = d - 13;
    bMonthIndex = 0;
  } else {
    const pohelaBoishakh = new Date(y, 3, 14);
    let diffDays = Math.floor((date.getTime() - pohelaBoishakh.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      const prevPohela = new Date(y - 1, 3, 14);
      diffDays = Math.floor((date.getTime() - prevPohela.getTime()) / (1000 * 60 * 60 * 24));
    }
    for (let i = 0; i < 12; i++) {
      if (diffDays < monthDays[i]) {
        bDate = diffDays + 1;
        bMonthIndex = i;
        break;
      }
      diffDays -= monthDays[i];
    }
  }

  return `${toBnDigit(bDate)} ${monthNames[bMonthIndex]} ${toBnDigit(bYear)}`;
};

// হিজরি (আরবি ক্যালেন্ডার)
const getHijriDate = (date: Date) => {
  const hijriMonths = ['মুহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'];
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '1';
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    const year = parts.find(p => p.type === 'year')?.value || '1448';
    return `${toBnDigit(day)} ${hijriMonths[month - 1] || ''} ${toBnDigit(year)}`;
  } catch (e) {
    return 'হিজরি ক্যালেন্ডার';
  }
};

export default function UserApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const [inputPhone, setInputPhone] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputDivision, setInputDivision] = useState('');
  const [inputDistrict, setInputDistrict] = useState('');
  const [showAuthPin, setShowAuthPin] = useState(false);

  const [forceUpdate, setForceUpdate] = useState({ enabled: false, link: '#' });
  const [activeSection, setActiveSection] = useState<'menu' | 'flexiload' | 'drive' | 'scratch' | 'add_balance' | 'history' | 'chats' | 'notifications' | 'profile' | 'support'>('menu');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // সম্পূর্ণ রিয়েল-টাইম অফলাইন ডিটেকশন
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // পিন রিসেট ও অ্যান্টি-হয়রানি সিকিউরিটি স্টেট
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'options'>('input');
  const [isVerifyingForgot, setIsVerifyingForgot] = useState(false);
  const [failedForgotAttempts, setFailedForgotAttempts] = useState(0);
  const [isForgotBlocked, setIsForgotBlocked] = useState(false);
  const [verifiedPhoneHolder, setVerifiedPhoneHolder] = useState('');

  const [userProfile, setUserProfile] = useState({
    id: '', name: '', phone: '', pin: '', balance: 500, division: '', district: ''
  });

  const [showBalance, setShowBalance] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminSocialLinks, setAdminSocialLinks] = useState({ facebookPage: '', whatsappNumber: '01728116153' });
  const [showPin, setShowPin] = useState(false);
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const [runningNotice, setRunningNotice] = useState('🎉 স্বাগতম SIM OFFER SHOP এ!');
  const [notifications, setNotifications] = useState<any[]>([]);

  const [paymentNumbers, setPaymentNumbers] = useState({ bkash: '01728116153', nagad: '01728116153', rocket: '01728116153' });
  const [addMoneyEnabled, setAddMoneyEnabled] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('bKash');
  const [addAmount, setAddAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNum, setCopiedNum] = useState(false);
  const [addMoneyNote, setAddMoneyNote] = useState('প্রথমে নাম্বারে টাকা পাঠিয়ে ট্রানজ্যাকশন আইডি দিন।');

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
  const [registerSuccessPopup, setRegisterSuccessPopup] = useState(false);
  
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
  
  const [chatPhoneInput, setChatPhoneInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // লাইভ ক্লক টাইমার
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // নেটওয়ার্ক স্ট্যাটাস ট্র্যাকিং
  useEffect(() => {
    Network.getStatus().then(status => setIsOnline(status.connected));
    const netListener = Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkInterval = setInterval(() => {
      if (!navigator.onLine) setIsOnline(false);
    }, 1500);

    return () => {
      netListener.then(l => l.remove());
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
    };
  }, []);

  const handleBalanceTap = () => {
    setShowBalance(true);
    setTimeout(() => {
      setShowBalance(false);
    }, 3500);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('sim_offer_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserProfile(parsed);
      setChatPhoneInput(parsed.phone);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!userProfile.phone || !isOnline) return;
    onValue(ref(db, 'settings/notice'), (snapshot) => { if (snapshot.val()) setRunningNotice(snapshot.val()); });
    onValue(ref(db, 'settings/forceUpdate'), (snapshot) => {
      const val = snapshot.val();
      if (val) setForceUpdate(val);
    });
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
      if (data) setDriveOffers(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      else setDriveOffers([]);
    });
    onValue(ref(db, 'scratchCards'), (snapshot) => {
      const data = snapshot.val();
      if (data) setScratchCards(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      else setScratchCards([]);
    });
    onValue(ref(db, 'addMoneyLogs'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse();
        setUserAddMoneyLogs(list.filter(l => l.userPhone === userProfile.phone));
      } else { setUserAddMoneyLogs([]); }
    });
    onValue(ref(db, 'rechargeOrders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse();
        setUserFlexiLogs(list.filter(l => l.userPhone === userProfile.phone));
      } else { setUserFlexiLogs([]); }
    });
    onValue(ref(db, 'driveOrders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse();
        setUserDriveLogs(list.filter(l => l.userPhone === userProfile.phone));
      } else { setUserDriveLogs([]); }
    });
    onValue(ref(db, 'notifications'), (snapshot) => {
      const data = snapshot.val();
      if (data) setNotifications(Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse());
      else setNotifications([]);
    });
    onValue(ref(db, `chats/${userProfile.phone}`), (snapshot) => {
      const data = snapshot.val();
      if (data) setChatMessages(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      else setChatMessages([]);
    });
  }, [userProfile.phone, isOnline]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline || !navigator.onLine) {
      setIsOnline(false);
      return;
    }
    const cleanPhone = inputPhone.trim();
    const cleanPin = inputPin.trim();

    if (!cleanPhone || cleanPhone.length < 11 || !cleanPin) {
      return alert('সঠিক মোবাইল নম্বর এবং পিন দিন!');
    }

    setIsLoading(true);
    try {
      const userDirectRef = ref(db, `users/${cleanPhone}`);
      const snapshot = await get(userDirectRef);
      
      setIsLoading(false);

      if (!snapshot.exists()) {
        return alert('❌ এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি!');
      }

      const userData = snapshot.val();
      if (userData.pin !== cleanPin) {
        return alert('❌ ভুল পিন দেওয়া হয়েছে!');
      }

      const verifiedUser = { id: cleanPhone, ...userData };
      setUserProfile(verifiedUser);
      setChatPhoneInput(cleanPhone);
      localStorage.setItem('sim_offer_user', JSON.stringify(verifiedUser));
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert('লগইন করতে সমস্যা হচ্ছে। ইন্টারনেট চেক করে আবার চেষ্টা করুন।');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline || !navigator.onLine) {
      setIsOnline(false);
      return;
    }

    const cleanName = inputName.trim();
    const cleanPhone = inputPhone.trim();
    const cleanPin = inputPin.trim();
    const cleanDivision = inputDivision.trim();
    const cleanDistrict = inputDistrict.trim();

    if (!cleanName || !cleanPhone || cleanPhone.length < 11 || !cleanPin || !cleanDivision || !cleanDistrict) {
      return alert('⚠️ সবগুলো তথ্য পূরণ করুন!');
    }

    setIsLoading(true);
    try {
      const userDirectRef = ref(db, `users/${cleanPhone}`);
      const checkSnap = await get(userDirectRef);

      if (checkSnap.exists()) {
        setIsLoading(false);
        return alert('⚠️ এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি আছে!');
      }

      const newUser = {
        name: cleanName,
        phone: cleanPhone,
        pin: cleanPin,
        balance: 500,
        division: cleanDivision,
        district: cleanDistrict,
        createdAt: new Date().toISOString()
      };

      await set(ref(db, `users/${cleanPhone}`), newUser);

      setIsLoading(false);
      setInputPin('');
      setRegisterSuccessPopup(true);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert('রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  // পিন রিসেট ভেরিফিকেশন ও স্প্যাম প্রটেকশন
  const handleStartForgotFlow = () => {
    setForgotPhone(inputPhone || '');
    setForgotError('');
    setForgotStep('input');
    setShowForgotModal(true);
  };

  const handleVerifyForgotPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (isForgotBlocked) {
      setForgotError('অতিরিক্ত ভুল চেষ্টার কারণে সেবাটি সাময়িক বন্ধ আছে। ৫ মিনিট পর আবার চেষ্টা করুন।');
      return;
    }

    const targetNum = forgotPhone.trim();
    if (!targetNum || targetNum.length < 11) {
      setForgotError('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন!');
      return;
    }

    setIsVerifyingForgot(true);
    try {
      const checkRef = ref(db, `users/${targetNum}`);
      const snap = await get(checkRef);
      setIsVerifyingForgot(false);

      if (snap.exists()) {
        setVerifiedPhoneHolder(targetNum);
        setForgotStep('options');
        setFailedForgotAttempts(0);
      } else {
        const nextAttempts = failedForgotAttempts + 1;
        setFailedForgotAttempts(nextAttempts);

        if (nextAttempts >= 3) {
          setIsForgotBlocked(true);
          setTimeout(() => {
            setIsForgotBlocked(false);
            setFailedForgotAttempts(0);
          }, 5 * 60 * 1000);
          setForgotError('অতিরিক্ত ভুল চেষ্টার কারণে ৫ মিনিটের জন্য ব্লক করা হয়েছে!');
        } else {
          setForgotError('এই ফোন নাম্বার দিয়ে কোনো একাউন্ট নেই। দয়া করে সঠিক ফোন নাম্বার দিয়ে আবার চেষ্টা করুন।');
        }
      }
    } catch (err) {
      setIsVerifyingForgot(false);
      setForgotError('যাচাই করতে সমস্যা হচ্ছে। ইন্টারনেট চেক করুন।');
    }
  };

  const handleCopyAndRedirectFacebook = () => {
    navigator.clipboard.writeText(`পিন রিসেট রিকোয়েস্ট: ${verifiedPhoneHolder}`);
    alert(`আপনার রেজিস্টার্ড নম্বর (${verifiedPhoneHolder}) কপি করা হয়েছে! ফেসবুক পেজে মেসেজে পেস্ট করে পাঠিয়ে দিন।`);
    window.open(adminSocialLinks.facebookPage || 'https://facebook.com', '_blank');
  };

  const handleGoToLoginFromPopup = () => {
    setRegisterSuccessPopup(false);
    setAuthView('login');
    setShowAuthPin(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('sim_offer_user');
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
  };

  const handleCopyPaymentNum = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  };

  useEffect(() => {
    let interval: any;
    if (isHoldingAddMoney) {
      interval = setInterval(() => {
        setHoldAddMoneyProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); executeAddMoney(); return 100; }
          return prev + 10;
        });
      }, 150);
    } else { setHoldAddMoneyProgress(0); }
    return () => clearInterval(interval);
  }, [isHoldingAddMoney]);

  const executeAddMoney = () => {
    setIsHoldingAddMoney(false);
    setHoldAddMoneyProgress(0);
    if (!addMoneyEnabled) return alert('বর্তমানে এড মানি সার্ভিস বন্ধ রয়েছে!');
    if (!addAmount || Number(addAmount) <= 0) return alert('সঠিক পরিমাণ লিখুন!');
    if (!trxId || trxId.length < 5) return alert('সঠিক TrxID লিখুন!');

    const now = new Date();
    const timeStr = now.toLocaleTimeString() + ' (' + now.toLocaleDateString() + ')';

    push(ref(db, 'addMoneyLogs'), {
      userName: userProfile.name, userPhone: userProfile.phone, method: selectedMethod,
      amount: Number(addAmount), trxId: trxId.toUpperCase(), time: timeStr, status: 'Pending'
    });
    setPopupAlert('আপনার Add Money রিকোয়েস্ট জমা হয়েছে।');
    setAddAmount(''); setTrxId('');
  };

  useEffect(() => {
    let interval: any;
    if (isHoldingFlexi) {
      interval = setInterval(() => {
        setHoldFlexiProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); executeFlexiRecharge(); return 100; }
          return prev + 10;
        });
      }, 150);
    } else { setHoldFlexiProgress(0); }
    return () => clearInterval(interval);
  }, [isHoldingFlexi]);

  const executeFlexiRecharge = () => {
    setIsHoldingFlexi(false);
    setHoldFlexiProgress(0);
    if (!flexiPhone || flexiPhone.length < 11) return alert('সঠিক নম্বর দিন!');
    if (!flexiAmount || Number(flexiAmount) <= 0) return alert('টাকার পরিমাণ দিন!');
    if (flexiPin !== userProfile.pin) return alert('পিন সঠিক নয়!');
    if (userProfile.balance < Number(flexiAmount)) return alert('পর্যাপ্ত ব্যালেন্স নেই!');

    const newBal = userProfile.balance - Number(flexiAmount);
    setUserProfile(prev => ({ ...prev, balance: newBal }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString() + ' (' + now.toLocaleDateString() + ')';

    push(ref(db, 'rechargeOrders'), {
      userName: userProfile.name, userPhone: userProfile.phone, operator: flexiOperator,
      amount: Number(flexiAmount), targetNumber: flexiPhone, time: timeStr,
      status: 'Pending', note: simType
    });
    setPopupAlert('🚀 ফ্লেক্সিলোড রিকোয়েস্ট সফল হয়েছে।');
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (window.scrollY === 0 && touchStart && touchEnd && touchEnd - touchStart > 100) {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        setPopupAlert('✨ অ্যাপ ডাটা সফলভাবে রিফ্রেশ হয়েছে!');
      }, 1000);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString() + ' (' + now.toLocaleDateString() + ')';
    push(ref(db, `chats/${userProfile.phone}`), {
      sender: 'user', text: chatInput.trim(), time: timeStr, senderName: userProfile.name
    });
    setChatInput('');
  };

  const handleConfirmBuyCard = () => {
    if (!buyingCard) return;
    if (!targetCardNumber || targetCardNumber.length < 11) return alert('সঠিক ১১ ডিজিট নম্বর লিখুন!');
    if (userProfile.balance < buyingCard.price) return alert('ব্যালেন্স পর্যাপ্ত নয়!');

    const newBal = userProfile.balance - buyingCard.price;
    setUserProfile(prev => ({ ...prev, balance: newBal }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString() + ' (' + now.toLocaleDateString() + ')';

    push(ref(db, 'rechargeOrders'), {
      userName: userProfile.name, userPhone: userProfile.phone, operator: buyingCard.type,
      amount: buyingCard.price, targetNumber: targetCardNumber, time: timeStr,
      status: 'Pending', note: 'Scratch Card: ' + buyingCard.title
    });

    setPopupAlert(`⏳ কার্ড ক্রয়ের রিকোয়েস্ট জমা হয়েছে!`);
    setBuyingCard(null); setTargetCardNumber('');
  };

  const handleConfirmDriveOrder = () => {
    if (!targetDriveNumber || targetDriveNumber.length < 11) return alert('সঠিক ১১ ডিজিট নম্বর লিখুন!');
    if (hasSimLoan === null) return alert('লোন আছে কি না সিলেক্ট করুন!');
    if (hasSimLoan === true) return alert('⚠️ লোন থাকা অবস্থায় ড্রাইভ নেওয়া যাবে না!');
    if (userProfile.balance < orderingOffer.price) return alert('ব্যালেন্স পর্যাপ্ত নয়!');

    const newBal = userProfile.balance - orderingOffer.price;
    setUserProfile(prev => ({ ...prev, balance: newBal }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString() + ' (' + now.toLocaleDateString() + ')';

    push(ref(db, 'driveOrders'), {
      userName: userProfile.name, userPhone: userProfile.phone, operator: orderingOffer.operator,
      packageTitle: orderingOffer.title, price: orderingOffer.price, targetNumber: targetDriveNumber,
      time: timeStr, status: 'Pending', hasLoan: false
    });

    setPopupAlert(`⏳ ড্রাইভ অর্ডার সাবমিট হয়েছে!`);
    setOrderingOffer(null); setTargetDriveNumber(''); setHasSimLoan(null);
  };

  const handleUpdatePin = () => {
    if (oldPinInput !== userProfile.pin) return alert('পুরনো পিন সঠিক নয়!');
    if (!newPinInput || newPinInput.length < 4) return alert('নতুন পিন কমপক্ষে ৪ ডিজিটের হতে হবে!');
    const updated = { ...userProfile, pin: newPinInput };
    setUserProfile(updated);
    set(ref(db, `users/${userProfile.phone}/pin`), newPinInput);
    localStorage.setItem('sim_offer_user', JSON.stringify(updated));
    setOldPinInput(''); setNewPinInput('');
    alert('✅ পিন সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (showForgotModal) {
        setShowForgotModal(false);
      } else if (orderingOffer || buyingCard || activeSection !== 'menu') {
        if (orderingOffer) setOrderingOffer(null);
        else if (buyingCard) setBuyingCard(null);
        else setActiveSection('menu');
      } else {
        setShowExitConfirm(true);
      }
    });
    return () => { backListener.then(h => h.remove()); };
  }, [showForgotModal, orderingOffer, buyingCard, activeSection]);

  const visibleOffers = driveOffers.filter(o => o.operator === selectedDriveOp);

  // ইন্টারনেট না থাকলে ইনস্ট্যান্ট ফুল-স্ক্রিন ব্লক
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#0c0a21] flex flex-col items-center justify-center p-6 text-center text-white font-sans select-none">
        <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-center justify-center text-rose-400 mb-5 shadow-2xl animate-pulse">
          <WifiOff className="w-12 h-12 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-black text-rose-400">কোনো ইন্টারনেট সংযোগ নেই!</h2>
        <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed">
          <strong className="text-pink-300">SIM OFFER SHOP</strong> ব্যবহার করার জন্য ইন্টারনেট সংযোগ আবশ্যক। আপনার মোবাইল ডাটা বা ওয়াইফাই চালু করুন।
        </p>
        <button 
          onClick={async () => {
            const status = await Network.getStatus();
            if (status.connected) {
              setIsOnline(true);
            } else {
              alert('⚠️ আপনার ফোনে ইন্টারনেট সংযোগ এখনো চালু হয়নি!');
            }
          }} 
          className="mt-8 px-8 py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-pink-600/30 active:scale-95 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  // লগইন ও রেজিস্ট্রেশন পেজ
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0c29] bg-gradient-to-tr from-[#140b2b] via-[#2d124f] to-[#0f0c29] flex items-center justify-center p-4 font-sans text-xs text-white select-none relative">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/25 rounded-3xl p-6 shadow-2xl text-center space-y-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-pink-500/30">
            <Sparkles className="w-8 h-8 animate-pulse text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-300">SIM OFFER SHOP</h2>
            <p className="text-[11px] text-pink-200/70 mt-1">প্রিমিয়াম টেলিযোগাযোগ সেবা</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10">
            <button onClick={() => setAuthView('login')} className={`py-2.5 rounded-xl font-bold transition-all ${authView === 'login' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>লগইন</button>
            <button onClick={() => setAuthView('register')} className={`py-2.5 rounded-xl font-bold transition-all ${authView === 'register' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>একাউন্ট তৈরি</button>
          </div>

          {authView === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-pink-200 block mb-1">মোবাইল নম্বর</label>
                <input 
                  type="tel" 
                  inputMode="numeric" 
                  maxLength={11} 
                  placeholder="017XXXXXXXX" 
                  value={inputPhone} 
                  onChange={(e) => setInputPhone(e.target.value)} 
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-pink-400 shadow-inner" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-pink-200 block mb-1">সিক্রেট পিন</label>
                <div className="relative">
                  <input 
                    type={showAuthPin ? "text" : "password"} 
                    inputMode="numeric" 
                    maxLength={6} 
                    placeholder="••••" 
                    value={inputPin} 
                    onChange={(e) => setInputPin(e.target.value)} 
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-3 pr-10 text-xs font-mono font-bold tracking-widest text-white focus:outline-none focus:border-pink-400 shadow-inner" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowAuthPin(!showAuthPin)} 
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showAuthPin ? <Eye className="w-4 h-4 text-pink-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-xl shadow-pink-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  'লগইন করুন'
                )}
              </button>

              {/* পিন ভুলে গেলে সাপোর্টে যোগাযোগের বাটন */}
              <div className="pt-2 text-center">
                <button 
                  type="button"
                  onClick={handleStartForgotFlow}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-300/90 hover:text-pink-200 transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 active:scale-95"
                >
                  <Key className="w-3.5 h-3.5 text-yellow-400" />
                  <span>পিন ভুলে গেছেন? এডমিন সাপোর্ট</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
              <div>
                <label className="text-[10px] font-bold text-pink-200 block mb-0.5">আপনার নাম *</label>
                <input 
                  type="text" 
                  placeholder="যেমন: Md. Rahim" 
                  value={inputName} 
                  onChange={(e) => setInputName(e.target.value)} 
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-400" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-pink-200 block mb-0.5">মোবাইল নম্বর *</label>
                <input 
                  type="tel" 
                  inputMode="numeric" 
                  maxLength={11} 
                  placeholder="017XXXXXXXX" 
                  value={inputPhone} 
                  onChange={(e) => setInputPhone(e.target.value)} 
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-pink-400" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-pink-200 block mb-0.5">সিক্রেট পিন (৪ বা ৬ সংখ্যা) *</label>
                <div className="relative">
                  <input 
                    type={showAuthPin ? "text" : "password"} 
                    inputMode="numeric" 
                    maxLength={6} 
                    placeholder="পিন দিন" 
                    value={inputPin} 
                    onChange={(e) => setInputPin(e.target.value)} 
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 pr-10 text-xs font-mono font-bold tracking-widest text-white focus:outline-none focus:border-pink-400" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowAuthPin(!showAuthPin)} 
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showAuthPin ? <Eye className="w-4 h-4 text-pink-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-pink-200 block mb-0.5">বিভাগ *</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: ঢাকা" 
                    value={inputDivision} 
                    onChange={(e) => setInputDivision(e.target.value)} 
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-400" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-pink-200 block mb-0.5">জেলা *</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: গাজীপুর" 
                    value={inputDistrict} 
                    onChange={(e) => setInputDistrict(e.target.value)} 
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-400" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-xl shadow-pink-600/30 transition-all active:scale-95 mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>প্রসেসিং হচ্ছে...</span>
                  </>
                ) : (
                  'একাউন্ট তৈরি করুন'
                )}
              </button>
            </form>
          )}
        </div>

        {/* পিন রিকভারি মডাল (ডেটাবেজ ভেরিফিকেশন + অ্যান্টি-হয়রানি সুরক্ষা) */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#18133a] border border-white/15 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <HelpCircle className="w-6 h-6" />
              </div>

              {forgotStep === 'input' ? (
                <form onSubmit={handleVerifyForgotPhone} className="space-y-3">
                  <h4 className="text-sm font-black text-white">পিন রিসেট ভেরিফিকেশন</h4>
                  <p className="text-[11px] text-slate-300">
                    আপনার একাউন্টে ব্যবহৃত সঠিক মোবাইল নম্বরটি লিখুন:
                  </p>

                  <input 
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="01XXXXXXXXX"
                    value={forgotPhone}
                    onChange={(e) => {
                      setForgotPhone(e.target.value);
                      setForgotError('');
                    }}
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-pink-400"
                  />

                  {forgotError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-rose-300 text-[10px] font-bold text-left flex items-start gap-1.5 leading-tight">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 bg-white/10 text-slate-300 rounded-xl font-bold text-xs"
                    >
                      বাতিল
                    </button>
                    <button 
                      type="submit" 
                      disabled={isVerifyingForgot || isForgotBlocked}
                      className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      {isVerifyingForgot ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>যাচাই হচ্ছে...</span>
                        </>
                      ) : (
                        'এগিয়ে যান'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3.5">
                  <h4 className="text-sm font-black text-emerald-400">একাউন্ট ভেরিফাইড!</h4>
                  <p className="text-[11px] text-slate-300">
                    নম্বর: <strong className="text-pink-300 font-mono">{verifiedPhoneHolder}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    এডমিনকে মেসেজ পাঠাতে যেকোনো একটি মাধ্যম বেছে নিন:
                  </p>

                  <div className="space-y-2 pt-1">
                    <a 
                      href={`https://wa.me/${adminSocialLinks.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম এডমিন, আমি SIM OFFER SHOP অ্যাপের পিন ভুলে গেছি।\nআমার রেজিস্টার্ড মোবাইল নম্বর: ${verifiedPhoneHolder}\nদয়া করে আমার পিনটি রিসেট করে দিন।`)}`}
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-lg active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপে মেসেজ দিন
                    </a>
                    <button 
                      type="button"
                      onClick={handleCopyAndRedirectFacebook}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-lg active:scale-95 transition-all"
                    >
                      <Facebook className="w-4 h-4" /> ফেসবুক পেজে মেসেজ দিন
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2 bg-white/10 text-slate-300 rounded-xl font-bold text-xs"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {registerSuccessPopup && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#18133a] border border-white/15 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-inner">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">অভিনন্দন!</h4>
                <p className="text-[11px] text-slate-300 mt-1">আপনার একাউন্ট সফলভাবে তৈরি হয়েছে। এখন পিন দিয়ে লগইন করুন।</p>
              </div>
              <button 
                onClick={handleGoToLoginFromPopup} 
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95"
              >
                লগইন করুন
              </button>
            </div>
          </div>
        )}

        {popupAlert && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#18133a] border border-white/15 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-inner">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h4 className="text-xs font-black leading-relaxed text-slate-200">{popupAlert}</h4>
              <button onClick={() => setPopupAlert(null)} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95">ঠিক আছে</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // মূল হোম অ্যাপ স্ক্রিন
  return (
    <div className="min-h-screen bg-[#0d0b21] text-slate-100 flex flex-col font-sans text-xs relative select-none">
      {isRefreshing && (
        <div className="absolute top-12 left-0 right-0 z-50 flex justify-center">
          <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-2 animate-bounce">
            <RefreshCw className="w-3 h-3 animate-spin" /> রিফ্রেশ হচ্ছে...
          </div>
        </div>
      )}

      {forceUpdate.enabled && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#18133a] border border-indigo-500/40 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <Download className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black">নতুন আপডেট এসেছে!</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              অ্যাপের সিকিউরিটি ও নতুন ফিচার উপভোগ করতে দয়া করে এখনই অ্যাপটি আপডেট করে নিন।
            </p>
            <a href={forceUpdate.link} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2">
              এখনই আপডেট করুন <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* প্রিমিয়াম হেডার */}
      <header className="bg-[#141032]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        {activeSection !== 'menu' ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSection('menu')} className="p-2 -ml-2 rounded-2xl bg-white/5 border border-white/10 text-white active:scale-95 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xs font-black uppercase tracking-wider text-indigo-200">
              {activeSection === 'profile' ? 'প্রোফাইল বিবরণ' : activeSection}
            </h2>
          </div>
        ) : (
          <button 
            onClick={() => setActiveSection('profile')}
            className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-1.5 pr-3 active:scale-95 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 border border-white/20 shadow-md flex items-center justify-center text-white font-black text-sm uppercase">
              {userProfile.name ? userProfile.name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-xs font-black text-white leading-tight flex items-center gap-1">
                {userProfile.name}
              </h2>
              <p className="text-[9px] text-indigo-300 font-mono leading-tight mt-0.5">{userProfile.phone}</p>
            </div>
          </button>
        )}

        {activeSection === 'menu' && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveSection('notifications')} 
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 relative active:scale-95 transition-all shadow"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 active:scale-95 transition-all shadow"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* গ্লাস-মরফিক রানিং নোটিশ */}
      <div className="bg-[#120f2e]/90 backdrop-blur-md border-b border-indigo-500/20 px-4 py-2 text-[11px] font-bold shadow-md flex items-center gap-2.5 text-indigo-100">
        <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-2.5 py-0.5 rounded-lg text-[9px] uppercase font-black tracking-wider shadow-sm flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-yellow-300" /> নোটিশ
        </span>
        <marquee className="font-medium text-slate-200">{runningNotice}</marquee>
      </div>

      <main 
        className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeSection === 'menu' && (
          <div className="space-y-4">
            {/* কমপ্যাক্ট বিকাশ-স্টাইল ব্যালেন্স বার + ত্রি-ভাষিক লাইভ ঘড়ি ও ক্যালেন্ডার */}
            <div className="grid grid-cols-2 gap-2.5 items-stretch">
              <div 
                onClick={handleBalanceTap}
                className="bg-gradient-to-tr from-[#1a1442] via-[#241b5c] to-[#161138] border border-indigo-500/30 rounded-2xl p-3 flex flex-col justify-center items-center text-center shadow-lg active:scale-95 transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-pink-400" /> টোটাল ব্যালেন্স
                </span>
                <div className="h-6 flex items-center justify-center">
                  {showBalance ? (
                    <span className="text-sm font-black font-mono text-emerald-400 tracking-wider animate-fadeIn">
                      ৳{userProfile.balance}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      <span>ট্যাপ করে দেখুন</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ত্রি-ভাষিক ক্লক উইজেট (ইংরেজি + বাংলা + আরবি) */}
              <div className="bg-[#141032] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-center items-center text-center shadow-lg">
                <div className="flex items-center gap-1 text-indigo-300 font-mono text-xs font-black">
                  <Clock className="w-3 h-3 text-pink-400 animate-pulse" />
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                
                {/* ইংরেজি তারিখ */}
                <div className="text-[10px] text-white font-bold mt-1">
                  {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                
                {/* বাংলা ও আরবি হিজরি ক্যালেন্ডার */}
                <div className="text-[8.5px] text-slate-400 font-medium mt-0.5 leading-tight">
                  <span className="text-amber-300/90">{getBanglaDate(currentTime)}</span>
                  <span className="mx-1 text-slate-500">•</span>
                  <span className="text-emerald-300/90">{getHijriDate(currentTime)}</span>
                </div>
              </div>
            </div>

            {/* ৬টি প্রধান সার্ভিস অপশন */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setActiveSection('flexiload')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all"><div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5 shadow-inner"><Send className="w-5 h-5" /></div><span className="text-xs font-extrabold text-white">Flexiload</span></button>
              <button onClick={() => setActiveSection('drive')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all"><div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 shadow-inner"><Flame className="w-5 h-5" /></div><span className="text-xs font-extrabold text-white">Drive Pack</span></button>
              <button onClick={() => setActiveSection('scratch')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all"><div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-2.5 shadow-inner"><Ticket className="w-5 h-5" /></div><span className="text-xs font-extrabold text-white">Scratch Card</span></button>
              <button onClick={() => setActiveSection('add_balance')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all"><div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 shadow-inner"><Wallet className="w-5 h-5" /></div><span className="text-xs font-extrabold text-white">Add Balance</span></button>
              <button onClick={() => setActiveSection('history')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all"><div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-2.5 shadow-inner"><History className="w-5 h-5" /></div><span className="text-xs font-extrabold text-white">History</span></button>
              <button onClick={() => setActiveSection('chats')} className="bg-[#141032] hover:bg-[#1c1747] border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg active:scale-95 transition-all"><div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 shadow-inner"><MessageSquare className="w-5 h-5" /></div><span className="text-xs font-extrabold text-white">Live Chat</span></button>
            </div>

            {/* সোশ্যাল সাপোর্ট সেকশন */}
            <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" /> সার্বক্ষণিক হেল্পলাইন ও সাপোর্ট
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">24/7 Active</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">যেকোনো সমস্যা বা প্রয়োজনে সরাসরি আমাদের সাথে সোশ্যাল মিডিয়ায় যোগাযোগ করুন:</p>
              <div className="grid grid-cols-2 gap-2.5">
                <a 
                  href={adminSocialLinks.facebookPage || '#'} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="py-2.5 px-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 flex items-center justify-center gap-2 active:scale-95 transition-all font-bold text-[11px] shadow"
                >
                  <Facebook className="w-4 h-4 shrink-0" />
                  <span>ফেসবুক পেজ</span>
                </a>
                <a 
                  href={`https://wa.me/${adminSocialLinks.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="py-2.5 px-3 rounded-2xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 active:scale-95 transition-all font-bold text-[11px] shadow"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="space-y-4">
            <div className="bg-[#141032] border border-white/10 rounded-3xl p-5 text-center space-y-3 shadow-xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 border-2 border-indigo-400 mx-auto shadow-xl flex items-center justify-center text-white font-black text-3xl uppercase">
                {userProfile.name ? userProfile.name.charAt(0) : 'U'}
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{userProfile.name}</h3>
                <p className="text-xs text-indigo-300 font-mono mt-1">📱 {userProfile.phone}</p>
                <p className="text-xs text-emerald-400 font-mono font-bold mt-1">💰 ব্যালেন্স: ৳{userProfile.balance}</p>
                <p className="text-[11px] text-slate-400 mt-0.5"><MapPin className="w-3 h-3 inline text-pink-400" /> {userProfile.district}, {userProfile.division}</p>
                
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-xs text-indigo-300 font-mono">🔒 পিন: {showPin ? userProfile.pin : '••••'}</span>
                  <button onClick={() => setShowPin(!showPin)} className="text-indigo-400 p-1">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 space-y-3 shadow-xl">
              <h4 className="font-bold text-white border-b border-white/10 pb-2 flex items-center gap-1.5"><Key className="w-4 h-4 text-indigo-400" /> পিন পরিবর্তন করুন</h4>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">পুরনো পিন</label>
                <input type="password" inputMode="numeric" maxLength={6} placeholder="••••" value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">নতুন পিন</label>
                <input type="password" inputMode="numeric" maxLength={6} placeholder="নতুন পিন দিন" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <button onClick={handleUpdatePin} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95">পিন আপডেট করুন</button>
            </div>
          </div>
        )}

        {activeSection === 'add_balance' && (
          <div className="space-y-3.5">
            {!addMoneyEnabled && <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 text-rose-300 font-bold text-center">⚠️ বর্তমানে Add Balance সার্ভিস বন্ধ রয়েছে।</div>}
            
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>নির্দেশিকা ও নিয়মাবলী:</span>
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

              <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">এই নম্বরে টাকা পাঠান:</span>
                  <strong className="font-mono text-indigo-300 text-sm">
                    {selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket}
                  </strong>
                </div>
                <button onClick={() => handleCopyPaymentNum(selectedMethod === 'bKash' ? paymentNumbers.bkash : selectedMethod === 'Nagad' ? paymentNumbers.nagad : paymentNumbers.rocket)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 active:scale-95 shadow">
                  {copiedNum ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNum ? 'কপি হয়েছে!' : 'নম্বর কপি'}</span>
                </button>
              </div>

              <input type="number" inputMode="numeric" placeholder="টাকার পরিমাণ (৳)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 font-bold text-white focus:outline-none focus:border-indigo-500" />
              <input type="text" placeholder="TrxID (ট্রানজ্যাকশন আইডি)" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 font-bold uppercase text-white focus:outline-none focus:border-indigo-500" />

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

        {activeSection === 'flexiload' && (
          <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 space-y-4 shadow-xl text-white">
            <h4 className="font-bold border-b border-white/10 pb-2 flex items-center justify-between">
              <span>মোবাইল ফ্লেক্সিলোড / রিচার্জ</span>
              <span className="text-xs uppercase font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-xl">{flexiOperator}</span>
            </h4>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">মোবাইল নম্বর (অপারেটর অটো ডিটেক্ট)</label>
              <div className="relative">
                <input type="tel" inputMode="numeric" maxLength={11} placeholder="017XXXXXXXX" value={flexiPhone} onChange={(e) => handlePhoneChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-24 py-3 font-bold font-mono text-white focus:outline-none focus:border-indigo-500" />
                <div className="absolute right-2 top-2 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase">
                  {flexiOperator === 'Grameenphone' ? 'GP' : flexiOperator === 'Banglalink' ? 'BL' : flexiOperator}
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">সিম টাইপ নির্বাচন করুন</label>
              <div className="grid grid-cols-3 gap-2">
                {['Prepaid', 'Postpaid', 'Skitto'].map((type) => (
                  <button key={type} type="button" onClick={() => setSimType(type)} className={`py-2 rounded-xl font-bold text-xs border ${simType === type ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-black/30 text-slate-300 border-white/10'}`}>{type}</button>
                ))}
              </div>
            </div>
            <input type="number" inputMode="numeric" placeholder="টাকার পরিমাণ (৳)" value={flexiAmount} onChange={(e) => setFlexiAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 font-bold text-white focus:outline-none focus:border-indigo-500" />
            <input type="password" inputMode="numeric" maxLength={6} placeholder="আপনার সিক্রেট পিন (PIN)" value={flexiPin} onChange={(e) => setFlexiPin(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 font-mono font-bold tracking-widest text-white focus:outline-none focus:border-indigo-500" />
            
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

        {activeSection === 'drive' && (
          <div className="space-y-3">
            {!masterDriveEnabled || simStatus[selectedDriveOp] === false ? (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-3xl p-6 text-center space-y-2 shadow-xl">
                <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
                <h4 className="font-black text-sm">⚠️ ড্রাইভ অফার সাময়িকভাবে বন্ধ আছে</h4>
                <p className="text-[11px] text-rose-400/80">দুঃখিত! এই মুহূর্তে অ্যাডমিন কর্তৃক ড্রাইভ অফারগুলো বন্ধ রাখা হয়েছে।</p>
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
                    <input type="tel" inputMode="numeric" maxLength={11} placeholder="01XXXXXXXXX" value={targetDriveNumber} onChange={(e) => setTargetDriveNumber(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl space-y-2">
                    <label className="text-[11px] font-extrabold text-amber-300 block">⚠️ এই নাম্বারে কি লোন আছে?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setHasSimLoan(true)} className={`py-2 rounded-xl font-bold text-xs ${hasSimLoan === true ? 'bg-rose-600 text-white' : 'bg-black/30 text-slate-300 border border-white/10'}`}>হ্যাঁ</button>
                      <button type="button" onClick={() => setHasSimLoan(false)} className={`py-2 rounded-xl font-bold text-xs ${hasSimLoan === false ? 'bg-emerald-600 text-white' : 'bg-black/30 text-slate-300 border border-white/10'}`}>না</button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setOrderingOffer(null)} className="flex-1 py-3 bg-white/10 text-slate-300 rounded-xl font-bold">বাতিল</button>
                    <button disabled={hasSimLoan === true} onClick={handleConfirmDriveOrder} className={`flex-1 py-3 text-white font-bold rounded-xl ${hasSimLoan === true ? 'bg-slate-600 opacity-50' : 'bg-emerald-600 shadow-lg'}`}>কনফার্ম</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                    <input type="tel" inputMode="numeric" maxLength={11} placeholder="017XXXXXXXX" value={targetCardNumber} onChange={(e) => setTargetCardNumber(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setBuyingCard(null)} className="flex-1 py-3 bg-white/10 text-slate-300 rounded-xl font-bold">বাতিল</button>
                    <button disabled={targetCardNumber.length < 11} onClick={handleConfirmBuyCard} className={`flex-1 py-3 text-white font-bold rounded-xl ${targetCardNumber.length < 11 ? 'bg-slate-600 opacity-50' : 'bg-emerald-600 shadow-lg'}`}>কনফার্ম</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 px-1">নোটিফিকেশন ইনবক্স ({notifications.length})</h4>
            {notifications.length === 0 ? (
              <div className="bg-[#141032] border border-white/10 rounded-3xl p-6 text-center text-slate-400">কোনো নতুন নোটিফিকেশন নেই।</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="bg-[#141032] border border-white/10 rounded-2xl p-4 space-y-1.5 shadow-lg">
                  <div className="flex justify-between items-center"><h5 className="font-bold text-white text-xs">{n.title}</h5><span className="text-[9px] text-slate-400 font-mono">{n.time}</span></div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{n.msg}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === 'history' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-1 bg-[#141032] border border-white/10 p-1.5 rounded-2xl shadow-inner">
              <button onClick={() => setHistoryTab('add_money')} className={`py-2 rounded-xl font-bold transition-all ${historyTab === 'add_money' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>এড-মানি</button>
              <button onClick={() => setHistoryTab('flexiload')} className={`py-2 rounded-xl font-bold transition-all ${historyTab === 'flexiload' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>রিচার্জ</button>
              <button onClick={() => setHistoryTab('drive')} className={`py-2 rounded-xl font-bold transition-all ${historyTab === 'drive' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>ড্রাইভ</button>
            </div>

            {historyTab === 'add_money' && (
              <div className="space-y-3">
                {userAddMoneyLogs.length === 0 && <div className="text-center text-slate-500 py-4">কোনো ডাটা নেই</div>}
                {userAddMoneyLogs.map(log => (
                  <div key={log.id} className="bg-[#141032] border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-lg text-white">
                    <div>
                      <p className="font-bold text-sm">৳{log.amount} <span className="text-emerald-400 text-[10px]">({log.method})</span></p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">TrxID: {log.trxId} | {log.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${log.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : log.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>{log.status}</span>
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'flexiload' && (
              <div className="space-y-3">
                {userFlexiLogs.length === 0 && <div className="text-center text-slate-500 py-4">কোনো রিচার্জ হিস্ট্রি নেই</div>}
                {userFlexiLogs.map(ord => (
                  <div key={ord.id} className="bg-[#141032] border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-lg text-white">
                    <div>
                      <p className="font-bold text-sm">{ord.operator} - ৳{ord.amount}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{ord.targetNumber} | {ord.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${ord.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : ord.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>{ord.status}</span>
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'drive' && (
              <div className="space-y-3">
                {userDriveLogs.length === 0 && <div className="text-center text-slate-500 py-4">কোনো ড্রাইভ হিস্ট্রি নেই</div>}
                {userDriveLogs.map(ord => (
                  <div key={ord.id} className="bg-[#141032] border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-lg text-white">
                    <div>
                      <p className="font-bold text-sm">{ord.operator} - ৳{ord.price}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{ord.targetNumber} | {ord.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${ord.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : ord.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>{ord.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'chats' && (
          <div className="bg-[#141032] border border-white/10 rounded-3xl p-4 h-[420px] flex flex-col shadow-xl text-white">
            <div className="border-b border-white/10 pb-2 mb-2 flex items-center justify-between">
              <span className="font-bold">অ্যাডমিনের সাথে লাইভ চ্যাট ({userProfile.phone})</span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-lg ${msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none' : 'bg-white/10 border border-white/5 text-slate-200 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-3 border-t border-white/10 mt-2">
              <input type="text" placeholder="মেসেজ লিখুন..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" />
              <button onClick={handleSendChatMessage} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-95"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </main>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18133a] border border-white/15 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30 shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">লগআউট করতে চান?</h4>
              <p className="text-[11px] text-slate-300 mt-1">আপনি কি সত্যিই একাউন্ট থেকে বের হতে চান?</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold rounded-xl transition-all">না</button>
              <button onClick={confirmLogout} className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">হ্যাঁ</button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18133a] border border-white/15 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">আপনি কি নিশ্চিত?</h4>
              <p className="text-[11px] text-slate-300 mt-1">আপনি কি অ্যাপ থেকে বের হয়ে যেতে চান?</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold rounded-xl transition-all">না</button>
              <button onClick={() => CapacitorApp.exitApp()} className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">হ্যাঁ</button>
            </div>
          </div>
        </div>
      )}

      {popupAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18133a] border border-white/15 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl text-white">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-inner">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-xs font-black leading-relaxed text-slate-200">{popupAlert}</h4>
            <button onClick={() => setPopupAlert(null)} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95">ঠিক আছে</button>
          </div>
        </div>
      )}
    </div>
  );
}
