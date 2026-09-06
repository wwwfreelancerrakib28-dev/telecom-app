import React from 'react';
import { X, Bell, CheckCircle, Flame, ShieldAlert } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const notifications = [
    {
      id: '1',
      title: 'FCM Push: Robi Special Drive Active',
      message: 'Robi 60 GB + 1200 Min pack is now available with ৳150 instant reseller commission.',
      time: '10 mins ago',
      type: 'promo',
    },
    {
      id: '2',
      title: 'Add Balance Verified',
      message: 'bKash Deposit TrxID: BK9A02K918 of ৳2,000 has been verified and added to Drive Balance.',
      time: '2 hours ago',
      type: 'success',
    },
    {
      id: '3',
      title: 'Gateway Maintenance Notice',
      message: 'Teletalk recharge API will undergo a brief 10-minute sync at midnight. Other operators normal.',
      time: '5 hours ago',
      type: 'alert',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xs p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications & Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2 max-h-72 overflow-y-auto">
          {notifications.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex items-center gap-1.5 mb-1">
                {item.type === 'promo' ? (
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                ) : item.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="text-xs font-bold text-slate-800">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{item.message}</p>
              <span className="text-[9px] text-slate-400 block mt-1">{item.time}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
};
