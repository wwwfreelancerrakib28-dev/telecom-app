import React, { useState } from 'react';
import {
  Smartphone,
  Code2,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Wallet,
  FileCode,
} from 'lucide-react';
import { UserProfile, Transaction, ScreenId, OperatorId, ConnectionType, DrivePackage } from './types';
import { INITIAL_USER, INITIAL_TRANSACTIONS, OPERATORS } from './data/mockData';
import { MobileFrame } from './components/MobileFrame';
import { AuthScreenView } from './components/screens/AuthScreenView';
import { HomeDashboardView } from './components/screens/HomeDashboardView';
import { FlexiloadScreenView } from './components/screens/FlexiloadScreenView';
import { DrivePackScreenView } from './components/screens/DrivePackScreenView';
import { AddBalanceScreenView } from './components/screens/AddBalanceScreenView';
import { HistoryScreenView } from './components/screens/HistoryScreenView';
import { TransferModal } from './components/modals/TransferModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { CodeExplorerView } from './components/CodeExplorerView';

export default function App() {
  const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reset demo data
  const handleResetData = () => {
    setUser(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentScreen('home');
    showToast('Reset to default initial balances and state.');
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
    setCurrentScreen('history');
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
    setCurrentScreen('history');
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
    // Automatically credit simulated balance after slight delay
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
    setCurrentScreen('history');
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
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans select-none text-slate-100">
      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D47A1] to-[#1E88E5] flex items-center justify-center text-white shadow-md shadow-[#0D47A1]/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white">
                BD FlexiLoad Telecom Reseller
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Production-Ready Flutter
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grameenphone • Robi • Banglalink • Airtel • Teletalk
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Screen Navigation */}
        <div className="flex items-center gap-2.5">
          {/* Screens Jump Menu (When in App mode) */}
          {viewMode === 'app' && (
            <div className="hidden md:flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/60 text-xs">
              {[
                { id: 'home', label: 'Dashboard' },
                { id: 'flexiload', label: 'Flexiload' },
                { id: 'drive', label: 'Drive Pack' },
                { id: 'add_balance', label: 'Add Balance' },
                { id: 'history', label: 'History' },
                { id: 'auth', label: 'Auth Screen' },
              ].map((scr) => (
                <button
                  key={scr.id}
                  onClick={() => setCurrentScreen(scr.id as ScreenId)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    currentScreen === scr.id
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {scr.label}
                </button>
              ))}
            </div>
          )}

          {/* View Mode Toggle: Interactive App vs Dart Source Code */}
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700/80 text-xs">
            <button
              onClick={() => setViewMode('app')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'app'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Live App Simulator</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Flutter Source Hub</span>
            </button>
          </div>

          <button
            onClick={handleResetData}
            title="Reset Data"
            className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {viewMode === 'app' ? (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950">
            <MobileFrame>
              {currentScreen === 'auth' && (
                <AuthScreenView
                  user={user}
                  onLoginSuccess={() => {
                    setCurrentScreen('home');
                    showToast('Authenticated successfully with Biometric PIN!');
                  }}
                />
              )}

              {currentScreen === 'home' && (
                <HomeDashboardView
                  user={user}
                  transactions={transactions}
                  onNavigate={(screen) => setCurrentScreen(screen)}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  onOpenTransfer={() => setIsTransferModalOpen(true)}
                  onLogout={() => {
                    setCurrentScreen('auth');
                    showToast('Logged out of Telecom account.');
                  }}
                />
              )}

              {currentScreen === 'flexiload' && (
                <FlexiloadScreenView
                  user={user}
                  onBack={() => setCurrentScreen('home')}
                  onRechargeSuccess={handleRechargeSuccess}
                />
              )}

              {currentScreen === 'drive' && (
                <DrivePackScreenView
                  user={user}
                  onBack={() => setCurrentScreen('home')}
                  onBuySuccess={handleBuyDriveSuccess}
                />
              )}

              {currentScreen === 'add_balance' && (
                <AddBalanceScreenView
                  user={user}
                  onBack={() => setCurrentScreen('home')}
                  onAddBalanceSuccess={handleAddBalanceSuccess}
                />
              )}

              {currentScreen === 'history' && (
                <HistoryScreenView
                  transactions={transactions}
                  onBack={() => setCurrentScreen('home')}
                />
              )}
            </MobileFrame>

            {/* Modals inside mobile simulator flow */}
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
          </div>
        ) : (
          <CodeExplorerView />
        )}
      </main>
    </div>
  );
}
