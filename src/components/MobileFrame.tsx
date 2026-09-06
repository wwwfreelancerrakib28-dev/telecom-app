import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto my-3 w-full max-w-[390px] h-[820px] bg-slate-900 rounded-[50px] p-3 shadow-2xl shadow-slate-950/40 border-[4px] border-slate-700/80 flex flex-col select-none ring-1 ring-white/10">
      {/* Outer Shell & Buttons */}
      <div className="absolute -left-[7px] top-[115px] w-[3px] h-[28px] bg-slate-600 rounded-l-sm" />
      <div className="absolute -left-[7px] top-[155px] w-[3px] h-[48px] bg-slate-600 rounded-l-sm" />
      <div className="absolute -left-[7px] top-[215px] w-[3px] h-[48px] bg-slate-600 rounded-l-sm" />
      <div className="absolute -right-[7px] top-[140px] w-[3px] h-[64px] bg-slate-600 rounded-r-sm" />

      {/* Screen Inner Glass */}
      <div className="relative w-full h-full bg-[#f4f6f9] rounded-[40px] overflow-hidden flex flex-col border border-slate-200/50">
        
        {/* Dynamic Island / Notch + Status Bar (Geometric Balance Theme) */}
        <div className="relative z-30 w-full bg-slate-900 text-white pt-2.5 px-6 pb-1.5 flex items-center justify-between text-xs font-semibold border-b border-slate-800">
          {/* Time */}
          <span className="w-12 tracking-tight text-[13px] text-slate-200">{currentTime}</span>

          {/* Dynamic Island Pill */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-[22px] w-[95px] bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/20" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto flex flex-col relative">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="w-full bg-white/90 backdrop-blur-sm pt-1 pb-2 flex justify-center items-center z-20 border-t border-slate-100">
          <div className="w-32 h-1 bg-slate-400/70 rounded-full" />
        </div>
      </div>
    </div>
  );
};
