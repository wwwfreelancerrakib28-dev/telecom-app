import React, { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { CheckCircle2, AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { UserProfile, Transaction, ScreenId, OperatorId, ConnectionType, DrivePackage } from './types';
import { INITIAL_USER, INITIAL_TRANSACTIONS, OPERATORS } from './data/mockData';
import { AuthScreenView } from './components/screens/AuthScreenView';
import { HomeDashboardView } from './components/screens/HomeDashboardView';
import { FlexiloadScreenView } from './components/screens/FlexiloadScreenView';
import { DrivePackScreenView } from './components/screens/DrivePackScreenView';
import { AddBalanceScreenView } from './components/screens/AddBalanceScreenView';
import { HistoryScreenView } from './components/screens/HistoryScreenView';
import { TransferModal } from './components/modals/TransferModal';
import { NotificationsModal } from './components/modals/NotificationsModal';

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('telecom_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    const saved = localStorage.getItem('telecom_user_logged_in');
    return saved === 'true' ? 'home' : 'auth';
  });

  const [historyStack, setHistoryStack] = useState<ScreenId[]>(() => {
    const saved = localStorage.getItem('telecom_user_logged_in');
    return saved === 'true' ? ['home'] : ['auth'];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // রেফারেন্স দিয়ে ব্যাক বাটনের স্টেপ ট্র্যাকিং নিশ্চিত করা (যাতে এক লাফে হোমে না যায়)
  const historyRef = useRef<ScreenId[]>(historyStack);
  const modalsRef = useRef({ isTransferModalOpen, isNotificationsOpen, showExitConfirm });

  useEffect(() => {
    historyRef.current = historyStack;
  }, [historyStack]);

  useEffect(() => {
    modalsRef.current = { isTransferModalOpen, isNotificationsOpen, showExitConfirm };
  }, [isTransferModalOpen, isNotificationsOpen, showExitConfirm]);

  // ইন্টারনেট যাচাই স্টেট
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isCheckingNet, setIsCheckingNet] = useState<boolean>(false);

  const checkRealInternet = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    try {
      setIsCheckingNet(true);
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      });
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
    } finally {
      setIsCheckingNet(false);
    }
  };

  useEffect(() => {
    checkRealInternet();
    const interval = setInterval(checkRealInternet, 6000);

    const handleOnline = () => checkRealInternet();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ধাপে ধাপে নেভিগেশন
  const navigateTo = (screen: ScreenId) => {
    if (screen === currentScreen) return;
    setHistoryStack((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  // একটি করে ব্যাক যাওয়ার নিখুঁত লজিক
  const goBack = () => {
    const currentStack = historyRef.current;
    if (currentStack.length > 1) {
      const nextStack = [...currentStack];
      nextStack.pop(); // বর্তমান পেজ বাদ
      const prevScreen = nextStack[nextStack.length - 1]; // ঠিক আগের পেজ
      setHistoryStack(nextStack);
      setCurrentScreen(prevScreen);
    } else {
      setShowExitConfirm(true);
    }
  };

  // মোবাইল ব্যাক বাটন ইভেন্ট
  useEffect(() => {
    let backHandler: any;

    const setupBackButton = async () => {
      backHandler = await CapApp.addListener('backButton', () => {
        const { showExitConfirm: isExitOpen, isTransferModalOpen: isTransOpen, isNotificationsOpen: isNotifOpen } = modalsRef.current;

        // ১. কোনো পপ-আপ খোলা থাকলে আগে তা বন্ধ হবে
        if (isExitOpen) {
          setShowExitConfirm(false);
        } else if (isTransOpen) {
          setIsTransferModalOpen(false);
        } else if (isNotifOpen) {
          setIsNotificationsOpen(false);
        } else {
          // ২. অন্যথায় কেবল ১ স্টেপ পেছনের স্ক্রিনে যাবে
          goBack();
        }
      });
    };

    setupBackButton();

    return () => {
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Flexiload
  const handleRechargeSuccess = (data: {
    recipient: string;
    operator: OperatorId;
    connectionType: ConnectionType;
    amount: number;
  }) => {
    const operatorObj = OPERATORS[data.operator];
    setUser((prev) => ({
      ...prev,
      mainBalance: prev.mainBalance - data.amount,
    }));

    const newTxn: Transaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      type: 'recharge',
      title: `Flexiload Recharge (${operatorObj.name})`,
      recipientOrSenderNumber: data.recipient,
      operator: data.operator,
      connectionType: data.connectionType,
      amount: data.amount,
      fee: 0,
      balanceType: 'main',
      status: 'success',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      trxId: `FLX${Date.now().toString().slice(-8)}`,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    navigateTo('history');
    showToast(`৳${data.amount} Flexiload Recharge to ${data.recipient} Successful!`);
  };

  // Drive Pack
  const handleBuyDriveSuccess = (data: {
    recipientPhone: string;
    pack: DrivePackage;
  }) => {
    setUser((prev) => ({
      ...prev,
      driveBalance: prev.driveBalance - data.pack.offerPrice,
    }));

    const newTxn: Transaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      type: 'drive_pack',
      title: `Drive: ${data.pack.title}`,
      recipientOrSenderNumber: data.recipientPhone,
      operator: data.pack.operator,
      amount: data.pack.offerPrice,
      cashback: data.pack.cashback,
      balanceType: 'drive',
      status: 'pending',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      trxId: `DRV${Date.now().toString().slice(-8)}`,
      note: 'Awaiting telecom operator activation. Commission will be credited automatically.',
    };

    setTransactions((prev) => [newTxn, ...prev]);
    navigateTo('history');
    showToast(`Drive pack order submitted! Status: PENDING.`);
  };

  // Add Balance
  const handleAddBalanceSuccess = (data: {
    senderNumber: string;
    amount: number;
    trxId: string;
    balanceType: 'main' | 'drive';
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
  }) => {
    setTimeout(() => {
      setUser((prev) => ({
        ...prev,
        mainBalance: data.balanceType === 'main' ? prev.mainBalance + data.amount : prev.mainBalance,
        driveBalance: data.balanceType === 'drive' ? prev.driveBalance + data.amount : prev.driveBalance,
      }));
    }, 2000);

    const newTxn: Transaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      type: 'add_balance',
      title: `Add Balance (${data.paymentMethod})`,
      recipientOrSenderNumber: data.senderNumber,
      amount: data.amount,
      balanceType: data.balanceType,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: data.paymentMethod,
      trxId: data.trxId,
      note: 'Verifying with payment gateway daemon.',
    };

    setTransactions((prev) => [newTxn, ...prev]);
    navigateTo('history');
    showToast(`Add Balance request of ৳${data.amount} submitted (TrxID: ${data.trxId}).`);
  };

  // Transfer
  const handleTransferSuccess = (
    amount: number,
    from: 'main' | 'drive',
    to: 'main' | 'drive',
    note: string
  ) => {
    setUser((prev) => {
      const fromKey = from === 'main' ? 'mainBalance' : 'driveBalance';
      const toKey = to === 'main' ? 'mainBalance' : 'driveBalance';
      return {
        ...prev,
        [fromKey]: prev[fromKey] - amount,
        [toKey]: prev[toKey] + amount,
      };
    });

    const newTxn: Transaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      type: 'transfer',
      title: `Transfer (${from.toUpperCase()} to ${to.toUpperCase()})`,
      recipientOrSenderNumber: user.phone,
      amount: amount,
      balanceType: from,
      status: 'success',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      note,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    showToast(`Transferred ৳${amount} from ${from} to ${to} balance.`);
  };

  // নো ইন্টারনেট স্ক্রিন
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-xl shadow-rose-500/10">
          <WifiOff className="w-10 h-10 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">ইন্টারনেট সংযোগ নেই!</h2>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-8">
          SIM OFFER SHOP অ্যাপটি ব্যবহার করতে আপনার ইন্টারনেট সংযোগ চালু করুন।
        </p>
        <button
          onClick={checkRealInternet}
          disabled={isCheckingNet}
          className="w-full max-w-xs py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isCheckingNet ? 'animate-spin' : ''}`} />
          <span>{isCheckingNet ? 'যাচাই করা হচ্ছে...' : 'পুনরায় চেষ্টা করুন'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans select-none text-slate-900 overflow-x-hidden">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Views */}
      <main className="flex-1 w-full flex flex-col">
        {currentScreen === 'auth' && (
          <AuthScreenView
            user={user}
            onLoginSuccess={(updatedUser) => {
              if (updatedUser) setUser(updatedUser);
              localStorage.setItem('telecom_user_logged_in', 'true');
              setHistoryStack(['home']);
              setCurrentScreen('home');
              showToast('Login Successful!');
            }}
          />
        )}

        {currentScreen === 'home' && (
          <HomeDashboardView
            user={user}
            transactions={transactions}
            onNavigate={(screen) => navigateTo(screen)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onLogout={() => {
              localStorage.removeItem('telecom_user_logged_in');
              setHistoryStack(['auth']);
              setCurrentScreen('auth');
              showToast('Logged out of Telecom account.');
            }}
          />
        )}

        {currentScreen === 'flexiload' && (
          <FlexiloadScreenView
            user={user}
            onBack={goBack}
            onRechargeSuccess={handleRechargeSuccess}
          />
        )}

        {currentScreen === 'drive' && (
          <DrivePackScreenView
            user={user}
            onBack={goBack}
            onBuySuccess={handleBuyDriveSuccess}
          />
        )}

        {currentScreen === 'add_balance' && (
          <AddBalanceScreenView
            user={user}
            onBack={goBack}
            onAddBalanceSuccess={handleAddBalanceSuccess}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreenView
            transactions={transactions}
            onBack={goBack}
          />
        )}
      </main>

      {/* Modals */}
      {isTransferModalOpen && (
        <TransferModal
          user={user}
          onClose={() => setIsTransferModalOpen(false)}
          onTransferSuccess={handleTransferSuccess}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Exit App?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to exit the application?
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 active:scale-95 transition-all"
              >
                No
              </button>
              <button
                onClick={() => CapApp.exitApp()}
                className="w-full py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-200"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
