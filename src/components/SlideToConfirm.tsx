import React, { useState, useRef, useEffect } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';

interface SlideToConfirmProps {
  label: string;
  onConfirm: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({
  label,
  onConfirm,
  isLoading = false,
  disabled = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const timerRef = useRef<any>(null);

  const startHold = () => {
    if (disabled || isLoading || isConfirmed) return;
    setIsHolding(true);
    setProgress(0);

    const step = 20; // 20ms পর পর আপডেট
    const totalTime = 1300; // ১.৩ সেকেন্ড ধরে রাখতে হবে
    const increment = (step / totalTime) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          setIsConfirmed(true);
          onConfirm();
          return 100;
        }
        return prev + increment;
      });
    }, step);
  };

  const cancelHold = () => {
    if (isConfirmed) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      style={{ touchAction: 'none' }}
      className={`relative w-full h-14 rounded-2xl select-none overflow-hidden flex items-center justify-center cursor-pointer transition-all active:scale-[0.98] border shadow-sm ${
        disabled
          ? 'bg-slate-200 border-slate-300 cursor-not-allowed opacity-60'
          : isConfirmed
          ? 'bg-emerald-600 border-emerald-600'
          : 'bg-indigo-50 border-indigo-300'
      }`}
    >
      {/* ফিল হওয়া কালার অ্যানিমেশন */}
      <div
        className={`absolute left-0 top-0 bottom-0 transition-all ease-linear pointer-events-none ${
          isConfirmed ? 'bg-emerald-600' : 'bg-indigo-600'
        }`}
        style={{ width: `${progress}%` }}
      />

      {/* রকেট আইকন ও টেক্সট */}
      <div className="relative z-10 flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider pointer-events-none">
        {isLoading ? (
          <span className="text-white flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </span>
        ) : isConfirmed ? (
          <span className="text-white flex items-center gap-2">
            <Check className="w-5 h-5 animate-bounce" /> Successful!
          </span>
        ) : (
          <>
            <div
              className={`transition-all duration-300 ease-out transform ${
                isConfirmed
                  ? 'translate-x-24 -translate-y-6 scale-150 rotate-45 text-white'
                  : isHolding
                  ? 'translate-x-1 -rotate-12 scale-125 text-white'
                  : 'text-indigo-600'
              }`}
            >
              <Send className="w-4 h-4 fill-current" />
            </div>
            <span className={progress > 50 ? 'text-white' : 'text-indigo-700'}>
              {isHolding ? 'ধরে রাখুন...' : label.replace('Slide', 'Hold')}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
