import React from 'react';
import { 
  Bell, 
  LogOut, 
  Send, 
  Flame, 
  Package, 
  Wallet, 
  ArrowLeftRight, 
  History, 
  Facebook, 
  MessageCircle, 
  Headphones, 
  Settings,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { UserProfile, ScreenId, Transaction } from '../../types';

interface HomeDashboardProps {
  user: UserProfile;
  transactions: Transaction[];
  onNavigate: (screen: ScreenId) => void;
  onOpenNotifications: () => void;
  onOpenTransfer: () => void;
  onLogout: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardProps> = ({
  user,
  onNavigate,
  onOpenNotifications,
  onOpenTransfer,
  onLogout,
}) => {
  // সাপোর্ট ও সোশাল লিঙ্ক অ্যাকশন
  const openExternal = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-8 select-none">
      {/* টপ বার / হেডার */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">{user.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{user.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2 border-2 border-white" />
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ব্যালেন্স কার্ড */}
      <div className="p-4">
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
              {user.resellerLevel || 'Reseller'} Account
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">মেইন ব্যালেন্স</p>
              <h3 className="text-lg font-black tracking-tight text-white">৳ {user.mainBalance.toLocaleString()}</h3>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">ড্রাইভ ব্যালেন্স</p>
              <h3 className="text-lg font-black tracking-tight text-amber-400">৳ {user.driveBalance.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* কুইক অ্যাকশন মেনু */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">Quick Actions</span>
          <span className="text-[11px] font-bold text-indigo-600 uppercase">Services</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Flexiload */}
          <button
            onClick={() => onNavigate('flexiload')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Flexiload</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Mobile Top-Up</span>
          </button>

          {/* Drive Pack */}
          <button
            onClick={() => onNavigate('drive')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all relative group"
          >
            <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Hot</span>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-2 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Drive Pack</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Data & Minutes</span>
          </button>

          {/* Regular Pack */}
          <button
            onClick={() => onNavigate('drive')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Regular Pack</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Bundles</span>
          </button>

          {/* Add Balance */}
          <button
            onClick={() => onNavigate('add_balance')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Add Balance</span>
            <span className="text-[10px] text-slate-400 mt-0.5">bKash/Nagad</span>
          </button>

          {/* Transfer */}
          <button
            onClick={onOpenTransfer}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-2 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">Transfer</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Main ⇄ Drive</span>
          </button>

          {/* History */}
          <button
            onClick={() => onNavigate('history')}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-2 group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 leading-tight">History</span>
            <span className="text-[10px] text-slate-400 mt-0.5">All Reports</span>
          </button>
        </div>
      </div>

      {/* নতুন কমিউনিকেশন ও সাপোর্ট সেকশন (Facebook, WhatsApp, Live Chat, Settings) */}
      <div className="px-4">
        <div className="mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">Support & Connect</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Facebook */}
          <button
            onClick={() => openExternal('https://facebook.com')}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Facebook className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Facebook</p>
              <p className="text-[10px] text-slate-400 font-medium">Join Community</p>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => openExternal('https://wa.me/8801XXXXXXXXX')}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">WhatsApp</p>
              <p className="text-[10px] text-slate-400 font-medium">Direct Support</p>
            </div>
          </button>

          {/* Live Chat */}
          <button
            onClick={() => openExternal('https://tawk.to')}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Live Chat</p>
              <p className="text-[10px] text-slate-400 font-medium">Instant Help</p>
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={() => onOpenNotifications()}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Settings</p>
              <p className="text-[10px] text-slate-400 font-medium">App Preference</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
