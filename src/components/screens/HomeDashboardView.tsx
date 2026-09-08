import React, { useState, useRef } from 'react';
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
  UserCircle2, 
  Camera, 
  User, 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Check, 
  X,
  Lock,
  Users,
  Plus,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Share2,
  MessageSquare,
  Search,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Save
} from 'lucide-react';
import { UserProfile, ScreenId, Transaction } from '../../types';

interface HomeDashboardProps {
  user: UserProfile;
  transactions: Transaction[];
  onNavigate: (screen: ScreenId) => void;
  onOpenNotifications: () => void;
  onOpenTransfer: () => void;
  onLogout: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardProps> = ({
  user,
  transactions,
  onNavigate,
  onOpenNotifications,
  onOpenTransfer,
  onLogout,
  onUpdateUser,
}) => {
  // প্রোফাইল মডাল স্টেট
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [pin, setPin] = useState(user.pin || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // অ্যাডমিন প্যানেল স্টেট
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminPhone] = useState('01728116153');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminTab, setAdminTab] = useState<'users' | 'add_money' | 'offers' | 'chats' | 'links'>('users');

  // ইউজার সার্চ এবং ডিটেইল ভিউ স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // ব্যালেন্স মডিফাই ইনপুট স্টেট (কাস্টম ব্যালেন্স এডিট)
  const [customMainBalance, setCustomMainBalance] = useState<string>('');
  const [customDriveBalance, setCustomDriveBalance] = useState<string>('');

  // অ্যাডমিন ইউজার লিস্ট (লোকাল ও সিমুলেটেড হিস্ট্রি সহ)
  const [usersList, setUsersList] = useState<any[]>([
    { 
      id: '1', 
      name: user.name || 'User', 
      phone: user.phone || '01728116153', 
      pin: user.pin || '1234', 
      mainBalance: user.mainBalance, 
      driveBalance: user.driveBalance, 
      avatar: user.avatar || '',
      createdAt: '12 Jan 2025',
      history: transactions
    },
    { 
      id: '2', 
      name: 'Rakib Telecom', 
      phone: '01844556677', 
      pin: '5566', 
      mainBalance: 500, 
      driveBalance: 1200, 
      avatar: '',
      createdAt: '15 Feb 2025',
      history: [
        { id: 'TXN-9988', type: 'add_balance', balanceType: 'main', title: 'Add Balance (bKash)', amount: 500, recipientOrSenderNumber: '01844556677', timestamp: '10:30 AM', status: 'success', trxId: 'BK990011' },
        { id: 'TXN-9989', type: 'add_balance', balanceType: 'drive', title: 'Add Balance (Nagad)', amount: 1200, recipientOrSenderNumber: '01844556677', timestamp: 'Yesterday', status: 'success', trxId: 'NG112233' },
        { id: 'TXN-9990', type: 'recharge', balanceType: 'main', title: 'Flexiload Recharge (Robi)', amount: 100, recipientOrSenderNumber: '01811223344', timestamp: 'Yesterday', status: 'success', trxId: 'FLX7788' }
      ]
    }
  ]);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // অন্যান্য সেটিংস স্টেট
  const [addMoneyEnabled, setAddMoneyEnabled] = useState(true);
  const [paymentNumbers, setPaymentNumbers] = useState({
    bkash: '01728116153',
    nagad: '01728116153',
    rocket: '01728116153'
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com',
    whatsapp: '01728116153'
  });

  const [offers, setOffers] = useState<any[]>([
    { id: '1', title: 'GP 30 GB + 700 Min', offerPrice: 580, cashback: 119, operator: 'gp' },
    { id: '2', title: 'Robi 50 GB + 1000 Min', offerPrice: 750, cashback: 149, operator: 'robi' },
  ]);
  const [newOffer, setNewOffer] = useState({ title: '', offerPrice: '', cashback: '', operator: 'gp' });

  const [chatUsers] = useState<any[]>([
    { id: '1', name: user.name || 'User', phone: user.phone || '01728116153', lastMsg: 'ভাই আমার রিচার্জ এখনো আসেনি!', unread: true },
    { id: '2', name: 'Rakib Telecom', phone: '01844556677', lastMsg: 'এড ব্যালেন্স অ্যাপ্রুভ করুন', unread: false }
  ]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'user', text: 'ভাই আমার রিচার্জ এখনো আসেনি!' }
  ]);
  const [replyText, setReplyText] = useState('');

  const openExternal = (url: string) => {
    window.open(url, '_blank');
  };

  // প্রোফাইল ছবি আপলোড
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      pin: pin.trim() || user.pin,
      avatar: avatar || user.avatar,
    };

    localStorage.setItem('telecom_user', JSON.stringify(updatedUser));
    if (onUpdateUser) onUpdateUser(updatedUser);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsProfileModalOpen(false);
    }, 800);
  };

  // অ্যাডমিন লগইন
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput.length >= 4) {
      setIsAdminAuthOpen(false);
      setIsAdminDashboardOpen(true);
      setAdminPinInput('');
      setAdminError('');
    } else {
      setAdminError('ভুল অ্যাডমিন পিন!');
    }
  };

  // ইউজার এডিট সেভ
  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    if (editingUser.id === '1' && onUpdateUser) {
      onUpdateUser({ ...user, name: editingUser.name, phone: editingUser.phone, pin: editingUser.pin });
    }
    if (selectedUserDetail && selectedUserDetail.id === editingUser.id) {
      setSelectedUserDetail(editingUser);
    }
    setEditingUser(null);
  };

  // ইউজারের ডিটেইলস সিলেক্ট করার সাথে ইনপুট সেট করা
  const handleOpenUserDetail = (u: any) => {
    setSelectedUserDetail(u);
    setCustomMainBalance(u.mainBalance.toString());
    setCustomDriveBalance(u.driveBalance.toString());
  };

  // কাস্টম ব্যালেন্স মডিফাই হ্যান্ডলার (ফাঁকা রেখে ০ বা যেকোনো সংখ্যা বসিয়ে আপডেট করা)
  const handleSaveModifiedBalance = (userId: string) => {
    const mainNum = customMainBalance === '' ? 0 : Number(customMainBalance);
    const driveNum = customDriveBalance === '' ? 0 : Number(customDriveBalance);

    if (isNaN(mainNum) || isNaN(driveNum)) {
      alert('সঠিক সংখ্যা ইনপুট দিন');
      return;
    }

    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            mainBalance: mainNum,
            driveBalance: driveNum,
          };
          if (u.id === '1' && onUpdateUser) {
            onUpdateUser({
              ...user,
              mainBalance: updated.mainBalance,
              driveBalance: updated.driveBalance,
            });
          }
          setSelectedUserDetail(updated);
          return updated;
        }
        return u;
      })
    );
    alert('ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleAddOffer = () => {
    if (!newOffer.title || !newOffer.offerPrice) return;
    setOffers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newOffer.title,
        offerPrice: Number(newOffer.offerPrice),
        cashback: Number(newOffer.cashback) || 0,
        operator: newOffer.operator
      }
    ]);
    setNewOffer({ title: '', offerPrice: '', cashback: '', operator: 'gp' });
  };

  const handleSendMessage = () => {
    if (!replyText.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'admin', text: replyText.trim() }]);
    setReplyText('');
  };

  // ফোন নম্বর বা নাম দিয়ে ইউজার ফিল্টার
  const filteredUsers = usersList.filter(
    (u) =>
      u.phone.includes(searchQuery.trim()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-8 select-none">
      {/* হেডার */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200 overflow-hidden border border-indigo-100">
            {avatar || user.avatar ? (
              <img src={avatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
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

      {/* ব্যালেন্স কার্ড (অ্যাডমিন লগইন ট্র্রিগার) */}
      <div className="p-4 cursor-pointer" onClick={() => setIsAdminAuthOpen(true)}>
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
              {user.resellerLevel || 'Retailer'} Account
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

      {/* কুইক সার্ভিসেস */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">Quick Actions</span>
          <span className="text-[11px] font-bold text-indigo-600 uppercase">Services</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
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

      {/* সাপোর্ট ও কানেক্ট */}
      <div className="px-4">
        <div className="mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">Support & Connect</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openExternal(socialLinks.facebook)}
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

          <button
            onClick={() => openExternal(`https://wa.me/88${socialLinks.whatsapp}`)}
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

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <UserCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Profile</p>
              <p className="text-[10px] text-slate-400 font-medium">Edit Bio & PIN</p>
            </div>
          </button>
        </div>
      </div>

      {/* ১. প্রোফাইল পপ-আপ মডাল */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight">প্রোফাইল তথ্য</h2>
                  <p className="text-[11px] text-slate-400">ব্যক্তিগত তথ্য ও নিরাপত্তা</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center my-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-400 via-indigo-500 to-amber-300 shadow-xl shadow-indigo-100">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                    {avatar || user.avatar ? (
                      <img src={avatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white active:scale-90"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> প্রোফাইল ছবি পরিবর্তন করুন
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">আপনার নাম</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">অ্যাকাউন্ট তৈরির মোবাইল নম্বর</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    disabled
                    value={user.phone}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                  <span className="absolute right-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ভেরিফাইড
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">লগইন পিন / পাসওয়ার্ড (ক্লিক করলে নাম্বার কিপ্যাড আসবে)</label>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold tracking-widest text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isSaved ? 'সংরক্ষিত হয়েছে!' : 'আপডেট সংরক্ষণ করুন'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ২. অ্যাডমিন লগইন মডাল */}
      {isAdminAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative">
            <button onClick={() => setIsAdminAuthOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">System Admin Auth</h3>
            <p className="text-[11px] text-slate-400 mb-5">নিরাপত্তা যাচাইকরণের জন্য ক্রেডেনশিয়াল দিন</p>

            <form onSubmit={handleAdminAuth} className="space-y-3.5 text-left">
              {adminError && <div className="p-2 bg-red-500/20 text-red-400 text-xs text-center rounded-xl">{adminError}</div>}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">অ্যাডমিন নম্বর</label>
                <input type="text" disabled value={adminPhone} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-400 font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">অ্যাডমিন পাসওয়ার্ড (নাম্বার কিপ্যাড)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-800 border border-red-500/50 rounded-xl p-2.5 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-red-500"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 active:scale-95 transition-all">
                প্যানেল আনলক করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ৩. সুপার অ্যাডমিন কন্ট্রোল সেন্টার */}
      {isAdminDashboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4">
          <div className="w-full max-w-2xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">SIM OFFER SHOP - Admin Console</h2>
                  <p className="text-[10px] text-slate-400">সুপার অ্যাডমিন ড্যাশবোর্ড ও কনফিগারেশন</p>
                </div>
              </div>
              <button onClick={() => setIsAdminDashboardOpen(false)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* অ্যাডমিন ট্যাব মেনু */}
            <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-950/40 px-2 scrollbar-none">
              <button
                onClick={() => { setAdminTab('users'); setSelectedUserDetail(null); }}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                  adminTab === 'users' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> ইউজার ও ব্যালেন্স কন্ট্রোল
              </button>
              <button
                onClick={() => setActiveTab ? setAdminTab('add_money') : setAdminTab('add_money')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                  adminTab === 'add_money' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" /> এড মানি সেটিং
              </button>
              <button
                onClick={() => setAdminTab('offers')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                  adminTab === 'offers' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4" /> অফার কন্ট্রোল
              </button>
              <button
                onClick={() => setAdminTab('chats')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap relative ${
                  adminTab === 'chats' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> লাইভ চ্যাট
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </button>
              <button
                onClick={() => setAdminTab('links')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                  adminTab === 'links' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4" /> সোশ্যাল লিংক
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* ১. ইউজার ও ব্যালেন্স কন্ট্রোল ট্যাব */}
              {adminTab === 'users' && !selectedUserDetail && (
                <div className="space-y-3">
                  {/* ফোন নম্বর দিয়ে লাইভ সার্চ বার */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="ফোন নম্বর বা নাম দিয়ে খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
                    <span>ফলাফল: {filteredUsers.length} জন ইউজার</span>
                    <span>ক্লিক করে সম্পূর্ণ হিস্ট্রি ও ব্যালেন্স মডিফাই করুন</span>
                  </div>

                  {filteredUsers.map((u) => (
                    <div 
                      key={u.id} 
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer"
                      onClick={() => handleOpenUserDetail(u)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden border border-indigo-500/40">
                          {u.avatar ? (
                            <img src={u.avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span>{u.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {u.name}
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-normal">Active</span>
                          </h4>
                          <p className="text-[11px] text-slate-300">নম্বর: <span className="text-white font-mono font-bold">{u.phone}</span></p>
                          <p className="text-[10px] text-slate-400">
                            পিন: <span className="text-amber-400 font-mono font-bold">{u.pin}</span> | মেইন: <span className="text-emerald-400">৳{u.mainBalance}</span> | ড্রাইভ: <span className="text-amber-400">৳{u.driveBalance}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenUserDetail(u)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl"
                          title="সম্পূর্ণ প্রোফাইল ও ব্যালেন্স দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl"
                          title="এডিট করুন"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* এডিট মডাল */}
                  {editingUser && (
                    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full space-y-3">
                        <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2">গ্রাহকের ডাটা পরিবর্তন</h4>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">নাম</label>
                          <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">মোবাইল নম্বর</label>
                          <input type="tel" value={editingUser.phone} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">পিন / পাসওয়ার্ড</label>
                          <input type="text" inputMode="numeric" value={editingUser.pin} onChange={(e) => setEditingUser({ ...editingUser, pin: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-amber-400 font-bold font-mono" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => setEditingUser(null)} className="flex-1 py-2 rounded-xl bg-slate-800 text-xs">বাতিল</button>
                          <button onClick={handleSaveUserEdit} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-xs">সেভ করুন</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ইউজারের পূর্ণাঙ্গ প্রোফাইল, কাস্টম ব্যালেন্স মডিফিকেশন ও বিস্তারিত হিস্ট্রি ভিউ */}
              {adminTab === 'users' && selectedUserDetail && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <button 
                    onClick={() => setSelectedUserDetail(null)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
                  >
                    ← ইউজার তালিকায় ফিরুন
                  </button>

                  {/* প্রোফাইল কার্ড */}
                  <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-indigo-400">
                        {selectedUserDetail.avatar ? (
                          <img src={selectedUserDetail.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span>{selectedUserDetail.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                          {selectedUserDetail.name}
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                        </h3>
                        <p className="text-xs text-slate-300 font-mono">📱 {selectedUserDetail.phone}</p>
                        <p className="text-xs text-amber-400 font-mono">🔑 গোপন পিন: <strong>{selectedUserDetail.pin}</strong></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setEditingUser(selectedUserDetail)}
                      className="p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> তথ্য এডিট
                    </button>
                  </div>

                  {/* ব্যালেন্স মোডিফিকেশন কার্ড (সরাসরি বক্স ফাঁকা করে ০ বা যেকোনো ব্যালেন্স সেট করা) */}
                  <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <h4 className="text-xs font-bold text-slate-200">ব্যালেন্স মোডিফিকেশন প্যানেল</h4>
                      <span className="text-[10px] text-slate-400">ফাঁকা করে 0 বা নতুন ব্যালেন্স লিখে আপডেট দিন</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3">
                        <label className="text-[10px] text-emerald-400 font-bold block mb-1">মেইন ব্যালেন্স (৳)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={customMainBalance}
                          onChange={(e) => setCustomMainBalance(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">বর্তমান: ৳{selectedUserDetail.mainBalance}</p>
                      </div>

                      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3">
                        <label className="text-[10px] text-amber-400 font-bold block mb-1">ড্রাইভ ব্যালেন্স (৳)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={customDriveBalance}
                          onChange={(e) => setCustomDriveBalance(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">বর্তমান: ৳{selectedUserDetail.driveBalance}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveModifiedBalance(selectedUserDetail.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" /> ব্যালেন্স আপডেট ও নিশ্চিত করুন
                    </button>
                  </div>

                  {/* ইউজারের বিস্তারিত হিস্ট্রি ও এড-মানি ক্যাটাগরি রিপোর্ট */}
                  <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-indigo-400" /> গ্রাহকের লেনদেন ও এড-মানি বিবরণী
                      </h4>
                      <span className="text-[10px] text-slate-400">Main / Drive আলাদা ট্র্যাকিং</span>
                    </div>

                    {selectedUserDetail.history && selectedUserDetail.history.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {selectedUserDetail.history.map((h: any, i: number) => {
                          const isAddMoney = h.type === 'add_balance';
                          const isDriveAdd = h.balanceType === 'drive';
                          const isMainAdd = h.balanceType === 'main';

                          return (
                            <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isAddMoney 
                                    ? isDriveAdd ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {isAddMoney ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-white leading-tight">{h.title}</p>
                                    {/* কোন ব্যালেন্সে টাকা এড করেছে তা স্পষ্ট ব্যাজে দেখানো */}
                                    {isAddMoney && (
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                        isDriveAdd ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      }`}>
                                        {isDriveAdd ? 'Drive Add' : 'Main Add'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {h.recipientOrSenderNumber} {h.trxId ? `• TrxID: ${h.trxId}` : ''} • {h.timestamp}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-mono font-bold ${isAddMoney ? (isDriveAdd ? 'text-amber-400' : 'text-emerald-400') : 'text-slate-200'}`}>
                                  {isAddMoney ? '+' : '-'}৳{h.amount}
                                </p>
                                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">{h.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-xs">এখনো কোনো লেনদেনের তথ্য নেই</div>
                    )}
                  </div>
                </div>
              )}

              {/* ২. এড মানি সেটিং */}
              {adminTab === 'add_money' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Add Balance সার্ভিস কন্ট্রোল</h4>
                      <p className="text-[10px] text-slate-400">বন্ধ করলে ইউজাররা টাকা যোগ করার ফর্ম পাবে না</p>
                    </div>
                    <button onClick={() => setAddMoneyEnabled(!addMoneyEnabled)}>
                      {addMoneyEnabled ? (
                        <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <ToggleRight className="w-5 h-5" /> চালু
                        </span>
                      ) : (
                        <span className="text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <ToggleLeft className="w-5 h-5" /> বন্ধ
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white border-b border-slate-700 pb-2">এড মানি নম্বর পরিবর্তন</h4>
                    <div>
                      <label className="text-[10px] text-pink-400 font-bold block mb-1">bKash নম্বর</label>
                      <input type="tel" value={paymentNumbers.bkash} onChange={(e) => setPaymentNumbers({ ...paymentNumbers, bkash: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-orange-400 font-bold block mb-1">Nagad নম্বর</label>
                      <input type="tel" value={paymentNumbers.nagad} onChange={(e) => setPaymentNumbers({ ...paymentNumbers, nagad: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-purple-400 font-bold block mb-1">Rocket নম্বর</label>
                      <input type="tel" value={paymentNumbers.rocket} onChange={(e) => setPaymentNumbers({ ...paymentNumbers, rocket: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                    <button onClick={() => alert('নম্বর সফলভাবে আপডেট হয়েছে!')} className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl">
                      নম্বরগুলো আপডেট করুন
                    </button>
                  </div>
                </div>
              )}

              {/* ৩. অফার কন্ট্রোল */}
              {adminTab === 'offers' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-1">
                      <Plus className="w-4 h-4 text-emerald-400" /> নতুন অফার যুক্ত করুন
                    </h4>
                    <input type="text" placeholder="অফার টাইটেল (যেমন: GP 50GB)" value={newOffer.title} onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="অফার মূল্য (৳)" value={newOffer.offerPrice} onChange={(e) => setNewOffer({ ...newOffer, offerPrice: e.target.value })} className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white" />
                      <input type="number" placeholder="কমিশন (৳)" value={newOffer.cashback} onChange={(e) => setNewOffer({ ...newOffer, cashback: e.target.value })} className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white" />
                    </div>
                    <button onClick={handleAddOffer} className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">অফার পাবলিশ করুন</button>
                  </div>

                  <div className="space-y-2">
                    {offers.map((of) => (
                      <div key={of.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{of.title}</p>
                          <p className="text-[10px] text-slate-400">দাম: ৳{of.offerPrice} | কমিশন: ৳{of.cashback}</p>
                        </div>
                        <button onClick={() => setOffers(offers.filter((o) => o.id !== of.id))} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ৪. লাইভ চ্যাট */}
              {adminTab === 'chats' && (
                <div className="h-[360px] flex gap-3">
                  <div className="w-1/3 border-r border-slate-800 pr-2 space-y-2 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-400">গ্রাহক তালিকা</p>
                    {chatUsers.map((cu) => (
                      <button
                        key={cu.id}
                        onClick={() => setActiveChatUser(cu)}
                        className={`w-full text-left p-2 rounded-xl border transition-all ${
                          activeChatUser?.id === cu.id ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800/60 border-slate-700'
                        }`}
                      >
                        <p className="text-[11px] font-bold text-white">{cu.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{cu.lastMsg}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 flex flex-col justify-between bg-slate-950/40 rounded-2xl border border-slate-800 p-3">
                    {activeChatUser ? (
                      <>
                        <div className="border-b border-slate-800 pb-2 mb-2">
                          <h4 className="text-xs font-bold text-white">{activeChatUser.name}</h4>
                          <p className="text-[9px] text-slate-400">{activeChatUser.phone}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs ${msg.sender === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                          <input
                            type="text"
                            placeholder="রিপ্লাই লিখুন..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />
                          <button onClick={handleSendMessage} className="p-2 bg-indigo-600 text-white rounded-xl">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">গ্রাহক নির্বাচন করুন</div>
                    )}
                  </div>
                </div>
              )}

              {/* ৫. সোশ্যাল লিংক */}
              {adminTab === 'links' && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white border-b border-slate-700 pb-2">সোশ্যাল সাপোর্ট লিঙ্ক কনফিগার</h4>
                  <div>
                    <label className="text-[10px] text-blue-400 font-bold block mb-1">Facebook লিংক</label>
                    <input type="text" value={socialLinks.facebook} onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-400 font-bold block mb-1">WhatsApp নম্বর</label>
                    <input type="tel" value={socialLinks.whatsapp} onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <button onClick={() => alert('লিংক সংরক্ষিত হয়েছে!')} className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl">
                    লিংক সেভ করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
