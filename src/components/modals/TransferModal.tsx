import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types';

interface TransferModalProps {
  user: UserProfile;
  onClose: () => void;
  onTransferSuccess: (amount: number, from: 'main' | 'drive', to: 'main' | 'drive', note: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  user,
  onClose,
  onTransferSuccess,
}) => {
  const [transferMode, setTransferMode] = useState<'internal' | 'peer'>('internal');
  const [fromWallet, setFromWallet] = useState<'main' | 'drive'>('main');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toWallet = fromWallet === 'main' ? 'drive' : 'main';

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    const available = fromWallet === 'main' ? user.mainBalance : user.driveBalance;

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid transfer amount');
      return;
    }
    if (numAmount > available) {
      setError(`Insufficient ${fromWallet} balance. (Available: ৳${available.toFixed(2)})`);
      return;
    }
    if (transferMode === 'peer') {
      const clean = recipientPhone.replace(/[^0-9]/g, '');
      if (clean.length !== 11 || !clean.startsWith('01')) {
        setError('Please enter a valid 11-digit recipient phone number');
        return;
      }
    }
    if (pin.trim() !== '1234' && pin.trim() !== user.pin && pin.trim() !== '123456') {
      setError('Invalid 4-digit security PIN. (Demo PIN: 1234)');
      return;
    }

    onTransferSuccess(
      numAmount,
      fromWallet,
      toWallet,
      transferMode === 'peer' ? `Transfer to ${recipientPhone}` : 'Wallet Swap'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xs p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900">
            ব্যালেন্স ট্রান্সফার (Transfer Balance)
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transfer Mode Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl my-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTransferMode('internal')}
            className={`py-1.5 rounded-lg transition-all uppercase tracking-wider text-[10px] ${
              transferMode === 'internal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Internal Swap
          </button>
          <button
            type="button"
            onClick={() => setTransferMode('peer')}
            className={`py-1.5 rounded-lg transition-all uppercase tracking-wider text-[10px] ${
              transferMode === 'peer' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            User to User
          </button>
        </div>

        {error && (
          <div className="p-2 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-3 text-xs">
          {transferMode === 'internal' ? (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">From</div>
                <button
                  type="button"
                  onClick={() => setFromWallet(fromWallet === 'main' ? 'drive' : 'main')}
                  className="font-black text-indigo-600 hover:underline uppercase text-xs"
                >
                  {fromWallet}
                </button>
                <div className="text-[10px] text-slate-500 font-medium">
                  ৳{(fromWallet === 'main' ? user.mainBalance : user.driveBalance).toFixed(0)}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 mx-2" />
              <div className="text-center flex-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">To</div>
                <div className="font-black text-slate-800 uppercase text-xs">{toWallet}</div>
                <div className="text-[10px] text-slate-500 font-medium">
                  ৳{(toWallet === 'main' ? user.mainBalance : user.driveBalance).toFixed(0)}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Recipient User Mobile (প্রাপকের নম্বর)
              </label>
              <input
                type="tel"
                maxLength={11}
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Transfer Amount (টাকার পরিমাণ)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              4-Digit Security PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 4))}
              placeholder="••••"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl tracking-widest text-center font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Demo PIN: 1234</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-xs transition-colors"
          >
            Confirm Transfer
          </button>
        </form>
      </div>
    </div>
  );
};
