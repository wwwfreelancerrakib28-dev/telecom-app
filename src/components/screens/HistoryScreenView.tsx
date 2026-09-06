import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
  Copy,
  X,
  Check,
} from 'lucide-react';
import { Transaction } from '../../types';

interface HistoryScreenViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

export const HistoryScreenView: React.FC<HistoryScreenViewProps> = ({
  transactions,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'recharge' | 'add_balance' | 'drive_pack'>('all');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab !== 'all' && t.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.recipientOrSenderNumber.toLowerCase().includes(q) ||
        (t.trxId && t.trxId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#F1F5F9] flex flex-col overflow-y-auto font-sans text-slate-800">
      {/* Top Header (Geometric Balance) */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-20 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-sm font-bold tracking-tight uppercase">Transaction History</h1>
        </div>

        {/* Tabbed History (All, Recharge, Add Balance, Drive Orders) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'recharge', label: 'Recharge' },
            { id: 'add_balance', label: 'Add Balance' },
            { id: 'drive_pack', label: 'Drive Orders' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="p-3 bg-white border-b border-slate-200/80">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by number or TrxID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-4 space-y-2.5 flex-1">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No transactions found.</p>
          </div>
        ) : (
          filteredTransactions.map((txn) => {
            const isSuccess = txn.status === 'success';
            const isPending = txn.status === 'pending';
            const isCancelled = txn.status === 'cancelled';

            return (
              <div
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-50 text-emerald-600'
                        : isPending
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isPending ? (
                      <Clock className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">
                      {txn.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {txn.recipientOrSenderNumber}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {txn.timestamp}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-slate-900">
                    ৳{txn.amount.toLocaleString()}
                  </div>

                  {/* Status Badges: Pending (Yellow), Success (Green), Cancelled (Red) */}
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1 ${
                      isSuccess
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transaction Detail Receipt Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xs p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#0D47A1]" /> Transaction Receipt
              </span>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="text-center pb-2">
                <div className="text-2xl font-black text-[#0D47A1]">
                  ৳{selectedTxn.amount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">{selectedTxn.title}</div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mt-1 ${
                    selectedTxn.status === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedTxn.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedTxn.status}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>Number:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedTxn.recipientOrSenderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Wallet Type:</span>
                  <span className="font-bold uppercase text-slate-800">
                    {selectedTxn.balanceType}
                  </span>
                </div>
                {selectedTxn.cashback && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Cashback:</span>
                    <span>৳{selectedTxn.cashback}</span>
                  </div>
                )}
                {selectedTxn.paymentMethod && (
                  <div className="flex justify-between">
                    <span>Gateway:</span>
                    <span className="font-bold">{selectedTxn.paymentMethod}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{selectedTxn.timestamp}</span>
                </div>
                {selectedTxn.trxId && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span>TrxID:</span>
                    <button
                      onClick={() => handleCopy(selectedTxn.trxId!)}
                      className="font-mono font-bold text-slate-800 hover:text-[#0D47A1] flex items-center gap-1"
                    >
                      <span>{selectedTxn.trxId}</span>
                      {copiedId ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                )}
                {selectedTxn.note && (
                  <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-500 mt-2">
                    Note: {selectedTxn.note}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="w-full py-2 bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
