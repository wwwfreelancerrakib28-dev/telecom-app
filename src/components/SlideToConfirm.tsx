import React, { useState, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';

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
  const [sliderPos, setSliderPos] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isConfirmed || isLoading) return;
    isDragging.current = true;
    startX.current = e.clientX - sliderPos;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current || isConfirmed || disabled) return;
    const trackWidth = trackRef.current.offsetWidth;
    const knobWidth = 48;
    const maxDrag = trackWidth - knobWidth - 8;

    const currentX = e.clientX - startX.current;
    const clamped = Math.max(0, Math.min(currentX, maxDrag));
    setSliderPos(clamped);

    // If dragged past 85%
    if (clamped >= maxDrag * 0.88) {
      isDragging.current = false;
      setSliderPos(maxDrag);
      setIsConfirmed(true);
      onConfirm();
    }
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!isConfirmed) {
      setSliderPos(0);
    }
  };

  return (
    <div
      ref={trackRef}
      className={`relative w-full h-14 rounded-full select-none overflow-hidden transition-colors duration-200 flex items-center px-1.5 ${
        disabled
          ? 'bg-slate-200 cursor-not-allowed opacity-60'
          : isConfirmed
          ? 'bg-emerald-600'
          : 'bg-indigo-50 border border-indigo-200'
      }`}
    >
      {/* Background Track Fill */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-indigo-100 transition-all pointer-events-none"
        style={{ width: `${sliderPos + 48}px` }}
      />

      {/* Centered Guidance Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-bold uppercase tracking-wider">
        {isConfirmed ? (
          <span className="text-white flex items-center gap-1">
            <Check className="w-4 h-4" /> Processing Order...
          </span>
        ) : (
          <span className="text-indigo-600">{label}</span>
        )}
      </div>

      {/* Draggable Knob */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translateX(${sliderPos}px)` }}
        className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md cursor-grab active:cursor-grabbing transition-transform ease-out ${
          isConfirmed
            ? 'bg-white text-emerald-600'
            : 'bg-indigo-600 active:scale-105'
        }`}
      >
        {isConfirmed ? (
          <Check className="w-5 h-5 animate-bounce" />
        ) : (
          <ChevronRight className="w-5 h-5 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
};
