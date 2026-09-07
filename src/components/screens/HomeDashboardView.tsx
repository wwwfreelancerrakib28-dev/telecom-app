import React, { useState } from 'react';
import {
  Bell,
  Eye,
  EyeOff,
  Smartphone,
  Flame,
  Package,
  Wallet,
  ArrowLeftRight,
  History,
  Megaphone,
  ChevronRight,
  LogOut,
  User,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile, Transaction, ScreenId } from '../../types';

interface HomeDashboardViewProps {
  user: UserProfile;
  transactions: Transaction[];
  onNavigate: (screen: ScreenId) => void;
  onOpenNotifications: () => void;
  onOpenTransfer: () => void;
  onLogout: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  user,
  transactions,
  onNavigate,
  onOpenNotifications,
  onOpenTransfer,
  onLogout,
}) => {
  const [showBalance, setShowBalance] = useState(false);

  return (
    <div className="flex-1 bg-[#F1F5F9] overflow-y-auto pb-6 font-sans text-slate-800">
      {/* Geometric Balance Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
    <img src="/logo.png.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-900 tracking-tight">{user.name}</span>
              <span className="px-1.5 py-0.2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[9px] rounded uppercase tracking-wider">
                {user.resellerLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>{user.phone}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Bio-Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center border border-slate-200 transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Tap to View Balance Pill Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Total Combined Funds
          </span>
          <span className="text-xs font-semibold text-indigo-400">
            {showBalance
              ? `৳ ${(user.mainBalance + user.driveBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              : '৳ •••••••••'}
          </span>
        </div>

        {/* Balance Toggle Pill with Eye Icon */}
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700 cursor-pointer transition-all active:scale-95"
        >
          <span className="text-xs font-bold text-slate-200">
            {showBalance ? 'Hide Balance' : 'Tap to View'}
          </span>
          {showBalance ? (
            <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
          )}
        </button>
      </div>

      {/* Scrolling Marquee Notice Alert Bar in Deep Indigo */}
      <div className="bg-indigo-900 text-white py-1.5 px-3 overflow-hidden whitespace-nowrap flex items-center shadow-xs">
        <span className="bg-red-500 text-[9px] font-black px-1.5 py-0.5 rounded mr-2 uppercase tracking-wider shrink-0 shadow-xs">
          ALERT
        </span>
        <div className="w-full overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee text-[11px] font-medium text-slate-100 tracking-wide">
            📢 GP, Robi & Airtel New Drive Packs updated! 50GB + 1000 Min at ৳499 (৳120 Cashback). bKash & Nagad Add Balance instant auto-verify active.
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Geometric Balance: Dual-Card Balance Grid (2 Columns) */}
        <section className="grid grid-cols-2 gap-3">
          {/* 1. Main Balance Card */}
          <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Main Balance
              </span>
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-sm font-black shadow-xs">
                ৳
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 tracking-tight">
                {showBalance
                  ? `৳ ${user.mainBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '৳ ••••••'}
              </p>
              <p className="text-[10px] text-indigo-600 font-bold mt-0.5 flex items-center gap-1">
                <span>Flexiload / Top-Up</span>
              </p>
            </div>
          </div>

          {/* 2. Drive Balance Card */}
          <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Drive Balance
              </span>
              <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-sm font-black shadow-xs">
                🎁
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 tracking-tight">
                {showBalance
                  ? `৳ ${user.driveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '৳ ••••••'}
              </p>
              <p className="text-[10px] text-orange-600 font-bold mt-0.5 flex items-center gap-1">
                <span>High Commission Packs</span>
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions (Geometric Balance Grid) */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Quick Actions
            </h2>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Services
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Flexiload */}
            <div
              onClick={() => onNavigate('flexiload')}
              className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 transition-all shadow-xs group active:scale-95"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-base group-hover:scale-105 transition-transform shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Flexiload</span>
              <span className="text-[9px] text-slate-400">Mobile Top-Up</span>
            </div>

            {/* 2. Drive Pack */}
            <div
              onClick={() => onNavigate('drive')}
              className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 transition-all shadow-xs group active:scale-95 relative"
            >
              <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-red-500 text-white text-[8px] font-black rounded uppercase">
                HOT
              </span>
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-base group-hover:scale-105 transition-transform shadow-xs">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Drive Pack</span>
              <span className="text-[9px] text-slate-400">Data & Minutes</span>
            </div>

            {/* 3. Regular Packages */}
            <div
              onClick={() => onNavigate('drive')}
              className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 transition-all shadow-xs group active:scale-95"
            >
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-base group-hover:scale-105 transition-transform shadow-xs">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Regular Pack</span>
              <span className="text-[9px] text-slate-400">Bundles</span>
            </div>

            {/* 4. Add Balance */}
            <div
              onClick={() => onNavigate('add_balance')}
              className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 transition-all shadow-xs group active:scale-95"
            >
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-base group-hover:scale-105 transition-transform shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Add Balance</span>
              <span className="text-[9px] text-slate-400">bKash/Nagad</span>
            </div>

            {/* 5. Transfer Balance */}
            <div
              onClick={onOpenTransfer}
              className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 transition-all shadow-xs group active:scale-95"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-base group-hover:scale-105 transition-transform shadow-xs">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Transfer</span>
              <span className="text-[9px] text-slate-400">Main ⇄ Drive</span>
            </div>

            {/* 6. History */}
            <div
              onClick={() => onNavigate('history')}
              className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 transition-all shadow-xs group active:scale-95"
            >
              <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-base group-hover:scale-105 transition-transform shadow-xs">
                <History className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">History</span>
              <span className="text-[9px] text-slate-400">All Reports</span>
            </div>
          </div>
        </section>

        {/* Operator Services Section (Geometric Grid) */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3.5">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            Operator Network Live Status
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col justify-center items-center gap-1">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white">
                GP
              </div>
              <span className="text-[9px] font-bold text-blue-700">GP Active</span>
            </div>
            <div className="p-2 rounded-xl border border-red-100 bg-red-50/40 flex flex-col justify-center items-center gap-1">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white">
                RB
              </div>
              <span className="text-[9px] font-bold text-red-700">Robi Active</span>
            </div>
            <div className="p-2 rounded-xl border border-orange-100 bg-orange-50/40 flex flex-col justify-center items-center gap-1">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-[10px] text-white">
                BL
              </div>
              <span className="text-[9px] font-bold text-orange-700">BL Active</span>
            </div>
            <div className="p-2 rounded-xl border border-emerald-100 bg-emerald-50/40 flex flex-col justify-center items-center gap-1">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white">
                TT
              </div>
              <span className="text-[9px] font-bold text-emerald-700">Teletalk</span>
            </div>
          </div>
        </section>

        {/* Recent Transactions Table / Geometric Balance Card */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-100 flex flex-col">
          <div className="p-3.5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              Recent Transactions
            </h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {transactions.slice(0, 4).map((txn) => {
              const isSuccess = txn.status === 'success';
              const isPending = txn.status === 'pending';

              return (
                <div
                  key={txn.id}
                  onClick={() => onNavigate('history')}
                  className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {txn.recipientOrSenderNumber}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                      {txn.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          txn.type === 'recharge'
                            ? 'bg-blue-50 text-blue-600'
                            : txn.type === 'drive_pack'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}
                      >
                        {txn.type.replace('_', ' ')}
                      </span>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        ৳{txn.amount.toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        isSuccess
                          ? 'text-emerald-600'
                          : isPending
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {isSuccess ? '● Success' : isPending ? '● Pending' : '● Failed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
