import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [historyStack, setHistoryStack] = useState<ScreenId[]>(['home']);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // নতুন স্ক্রিনে যাওয়ার হ্যান্ডলার
  const navigateTo = (screen: ScreenId) => {
    if (screen === currentScreen) return;
    setHistoryStack((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  // একটি পেজ পেছনে যাওয়ার হ্যান্ডলার
  const goBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop();
      const prevScreen = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      setCurrentScreen(prevScreen);
    } else {
      setShowExitConfirm(true);
    }
  };

  // অ্যান্ড্রয়েড ব্যাক বাটন হ্যান্ডলার
  useEffect(() => {
    let backHandler: any;

    const setupBackButton = async () => {
      backHandler = await CapApp.addListener('backButton', () => {
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else if (isTransferModalOpen) {
          setIsTransferModalOpen(false);
        } else if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        } else {
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
  }, [showExitConfirm, isTransferModalOpen, isNotificationsOpen, historyStack, currentScreen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Recharge success handler
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

  // 2. Drive pack purchase handler
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

  // 3. Add balance success handler
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

  // 4. Transfer handler
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

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans select-none text-slate-900 overflow-x-hidden">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Full-Screen App Views */}
      <main className="flex-1 w-full flex flex-col">
        {currentScreen === 'auth' && (
          <AuthScreenView
            user={user}
            onLoginSuccess={() => {
              setHistoryStack(['home']);
              setCurrentScreen('home');
              showToast('Authenticated successfully with Biometric PIN!');
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
