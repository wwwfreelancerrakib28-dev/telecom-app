import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Flame, 
  Wallet, 
  MessageSquare, 
  Share2, 
  Bell, 
  ShieldCheck, 
  Search, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  Lock, 
  Phone, 
  User, 
  Send,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { UserProfile, DrivePackage } from '../../types';

interface AdminConsoleModalProps {
  onClose: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({ onClose }) => {
  // অ্যাডমিন লগইন স্টেট
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPhone, setAdminPhone] = useState('01728116153');
  const [adminPin, setAdminPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // মেনু ট্যাব স্টেট
  const [activeTab, setActiveTab] = useState<'users' | 'offers' | 'add_money' | 'links' | 'chats' | 'orders'>('users');

  // ১. ডামি ইউজার লিস্ট (পরে ফায়ারবেস থেকে আসবে)
  const [usersList, setUsersList] = useState<any[]>([
    {
      id: '1',
      name: 'User',
      phone: '01728116153',
      pin: '1234',
      mainBalance: 1400,
      driveBalance: 3870,
      avatar: '',
      status: 'active'
    },
    {
      id: '2',
      name: 'Rakib Telecom',
      phone: '01844556677',
      pin: '5566',
      mainBalance: 500,
      driveBalance: 1200,
      avatar: '',
      status: 'active'
    }
  ]);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // ২. এড মানি সেটিংস স্টেট
  const [addMoneyEnabled, setAddMoneyEnabled] = useState(true);
  const [paymentNumbers, setPaymentNumbers] = useState({
    bkash: '01728116153',
    nagad: '01728116153',
    rocket: '01728116153'
  });

  // ৩. সোশাল লিংক স্টেট
  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com',
    whatsapp: '01728116153'
  });

  // ৪. অফার লিস্ট স্টেট
  const [offers, setOffers] = useState<any[]>([
    { id: '1', title: 'GP 30 GB + 700 Min', regularPrice: 699, offerPrice: 580, cashback: 119, operator: 'gp' },
    { id: '2', title: 'Robi 50 GB + 1000 Min', regularPrice: 899, offerPrice: 750, cashback: 149, operator: 'robi' },
  ]);
  const [newOffer, setNewOffer] = useState({ title: '', offerPrice: '', cashback: '', operator: 'gp' });

  // ৫. লাইভ চ্যাট স্টেট
  const [chatUsers, setChatUsers] = useState<any[]>([
    { id: '1', name: 'User', phone: '01728116153', lastMsg: 'ভাই আমার রিচার্জ এখনো আসেনি!', time: '12:05 PM', unread: true },
    { id: '2', name: 'Rakib Telecom', phone: '01844556677', lastMsg: 'এড ব্যালেন্স অ্যাপ্রুভ করুন', time: '11:30 AM', unread: false }
  ]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'user', text: 'ভাই আমার রিচার্জ এখনো আসেনি!' },
  ]);
  const [replyText, setReplyText] = useState('');

  // অ্যাডমিন লগইন হ্যান্ডলার
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin.length >= 4) {
      setIsAdminAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('সঠিক অ্যাডমিন পিন দিন!');
    }
  };

  // ইউজার তথ্য আপডেট
  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  // নতুন অফার যোগ
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

  // মেসেজ সেন্ড
  const handleSendMessage = () => {
    if (!replyText.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'admin', text: replyText.trim() }]);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* টপ হেডার */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide text-white">SIM OFFER SHOP - Admin Console</h2>
              <p className="text-[10px] text-slate-400">সুপার অ্যাডমিন ড্যাশবোর্ড ও অ্যাপ কন্ট্রোল</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* যদি অ্যাডমিন অথেন্টিকেট না হয়ে থাকে (লগইন উইন্ডো) */}
        {!isAdminAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">System Admin Auth</h3>
            <p className="text-xs text-slate-400 mb-6 text-center">প্যানেল আনলক করতে আপনার অ্যাডমিন পিন কোড দিন</p>

            <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4">
              {loginError && (
                <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-xs text-center">
                  {loginError}
                </div>
              )}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">অ্যাডমিন নম্বর</label>
                <input
                  type="tel"
                  disabled
                  value={adminPhone}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">অ্যাডমিন পাসওয়ার্ড / পিন</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="••••"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold tracking-widest text-center text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all"
              >
                প্যানেল আনলক করুন
              </button>
            </form>
          </div>
        ) : (
          /* অ্যাডমিন মেইন কন্ট্রোল প্যানেল */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* মেনু ট্যাব বার */}
            <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-950/40 px-2 scrollbar-none">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'users' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> ইউজার কন্ট্রোল
              </button>

              <button
                onClick={() => setActiveTab('add_money')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'add_money' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" /> এড মানি সেটিং
              </button>

              <button
                onClick={() => setActiveTab('offers')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'offers' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4" /> অফার ম্যানেজমেন্ট
              </button>

              <button
                onClick={() => setActiveTab('chats')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors relative ${
                  activeTab === 'chats' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> লাইভ চ্যাট
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </button>

              <button
                onClick={() => setActiveTab('links')}
                className={`py-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'links' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4" /> সোশ্যাল লিংক
              </button>
            </div>

            {/* ট্যাব কনটেন্ট এরিয়া */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* ১. ইউজার কন্ট্রোল ট্যাব */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-300">সকল রেজিস্টার্ড গ্রাহকের তালিকা</span>
                    <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">মোট: {usersList.length} জন</span>
                  </div>

                  {usersList.map((u) => (
                    <div key={u.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {u.name}
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-normal">Active</span>
                          </h4>
                          <p className="text-[11px] text-slate-400">নম্বর: <span className="text-white font-mono">{u.phone}</span> | পিন: <span className="text-amber-400 font-mono font-bold">{u.pin}</span></p>
                          <p className="text-[10px] text-slate-500">ব্যালেন্স: মেইন ৳{u.mainBalance} | ড্রাইভ ৳{u.driveBalance}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all"
                        title="এডিট করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* ইউজার এডিট মডাল */}
                  {editingUser && (
                    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full space-y-3">
                        <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2">ইউজার তথ্য সংশোধন</h4>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">নাম</label>
                          <input
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">মোবাইল নম্বর</label>
                          <input
                            type="tel"
                            value={editingUser.phone}
                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">পাসওয়ার্ড / পিন</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={editingUser.pin}
                            onChange={(e) => setEditingUser({ ...editingUser, pin: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-amber-400 font-mono font-bold"
                          />
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

              {/* ২. এড মানি কন্ট্রোল ট্যাব */}
              {activeTab === 'add_money' && (
                <div className="space-y-4">
                  {/* অন/অফ সুইচ */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Add Balance সার্ভিস</h4>
                      <p className="text-[10px] text-slate-400">এটি বন্ধ করলে ইউজাররা টাকা পাঠাতে পারবে না</p>
                    </div>
                    <button
                      onClick={() => setAddMoneyEnabled(!addMoneyEnabled)}
                      className="text-2xl"
                    >
                      {addMoneyEnabled ? (
                        <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <ToggleRight className="w-5 h-5" /> চালু আছে
                        </span>
                      ) : (
                        <span className="text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <ToggleLeft className="w-5 h-5" /> বন্ধ আছে
                        </span>
                      )}
                    </button>
                  </div>

                  {/* পেমেন্ট নম্বর পরিবর্তনের ফর্ম */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white border-b border-slate-700 pb-2">এড মানি নম্বর পরিবর্তন</h4>
                    <div>
                      <label className="text-[10px] text-pink-400 font-bold block mb-1">bKash নম্বর</label>
                      <input
                        type="tel"
                        value={paymentNumbers.bkash}
                        onChange={(e) => setPaymentNumbers({ ...paymentNumbers, bkash: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-orange-400 font-bold block mb-1">Nagad নম্বর</label>
                      <input
                        type="tel"
                        value={paymentNumbers.nagad}
                        onChange={(e) => setPaymentNumbers({ ...paymentNumbers, nagad: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-purple-400 font-bold block mb-1">Rocket নম্বর</label>
                      <input
                        type="tel"
                        value={paymentNumbers.rocket}
                        onChange={(e) => setPaymentNumbers({ ...paymentNumbers, rocket: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={() => alert('নম্বর সফলভাবে আপডেট হয়েছে!')}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      নম্বরগুলো আপডেট করুন
                    </button>
                  </div>
                </div>
              )}

              {/* ৩. অফার কন্ট্রোল ট্যাব */}
              {activeTab === 'offers' && (
                <div className="space-y-4">
                  {/* নতুন অফার যোগ করার বক্স */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-1">
                      <Plus className="w-4 h-4 text-emerald-400" /> নতুন ড্রাইভ অফার যোগ করুন
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="অফার টাইটেল (যেমন: GP 50GB)"
                        value={newOffer.title}
                        onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                        className="col-span-2 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="অফার রেট (৳)"
                        value={newOffer.offerPrice}
                        onChange={(e) => setNewOffer({ ...newOffer, offerPrice: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="কমিশন (৳)"
                        value={newOffer.cashback}
                        onChange={(e) => setNewOffer({ ...newOffer, cashback: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={handleAddOffer}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      অফার পাবলিশ করুন
                    </button>
                  </div>

                  {/* চলমান অফার তালিকা */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">বর্তমান অফার সমূহ ({offers.length})</h4>
                    {offers.map((of) => (
                      <div key={of.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{of.title}</p>
                          <p className="text-[10px] text-slate-400">দাম: ৳{of.offerPrice} | ক্যাশব্যাক: ৳{of.cashback}</p>
                        </div>
                        <button
                          onClick={() => setOffers(offers.filter((o) => o.id !== of.id))}
                          className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ৪. লাইভ চ্যাট ড্যাশবোর্ড ট্যাব */}
              {activeTab === 'chats' && (
                <div className="h-[380px] flex gap-3">
                  {/* ইউজারদের তালিকা */}
                  <div className="w-1/3 border-r border-slate-800 pr-2 space-y-2 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">গ্রাহকের মেসেজ</p>
                    {chatUsers.map((cu) => (
                      <button
                        key={cu.id}
                        onClick={() => setActiveChatUser(cu)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                          activeChatUser?.id === cu.id
                            ? 'bg-indigo-600/20 border-indigo-500'
                            : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-white">{cu.name}</span>
                          {cu.unread && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        </div>
                        <p className="text-[9px] text-slate-400 truncate">{cu.lastMsg}</p>
                      </button>
                    ))}
                  </div>

                  {/* চ্যাট বক্স */}
                  <div className="flex-1 flex flex-col justify-between bg-slate-950/40 rounded-2xl border border-slate-800 p-3">
                    {activeChatUser ? (
                      <>
                        <div className="border-b border-slate-800 pb-2 mb-2 flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold text-white">{activeChatUser.name}</h4>
                            <p className="text-[9px] text-slate-400">{activeChatUser.phone}</p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs ${
                                  msg.sender === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                          <input
                            type="text"
                            placeholder="উত্তর লিখুন..."
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
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">
                        বাম পাশ থেকে গ্রাহক নির্বাচন করুন
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ৫. সোশ্যাল লিংক ট্যাব */}
              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white border-b border-slate-700 pb-2">সোশ্যাল সাপোর্ট লিংক</h4>
                    <div>
                      <label className="text-[10px] text-blue-400 font-bold block mb-1">Facebook Group/Page Link</label>
                      <input
                        type="text"
                        value={socialLinks.facebook}
                        onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-400 font-bold block mb-1">WhatsApp হেল্পলাইন নম্বর</label>
                      <input
                        type="tel"
                        value={socialLinks.whatsapp}
                        onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={() => alert('সোশ্যাল লিংক সংরক্ষিত হয়েছে!')}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      লিংকগুলো সেভ করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
