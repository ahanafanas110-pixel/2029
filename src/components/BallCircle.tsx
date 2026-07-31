import React from 'react';
import { motion } from 'motion/react';
import { getBallInfo } from '../utils/colorUtils';

interface BallCircleProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSizeLabel?: boolean;
  onClick?: () => void;
  selected?: boolean;
  glowing?: boolean;
  className?: string;
}

export const BallCircle: React.FC<BallCircleProps> = ({
  number,
  size = 'md',
  showSizeLabel = true,
  onClick,
  selected = false,
  glowing = false,
  className = '',
}) => {
  const ball = getBallInfo(number);

  // Size dimensions map
  const sizeMap = {
    sm: { container: 'w-8 h-8 text-xs', label: 'text-[9px]' },
    md: { container: 'w-12 h-12 text-base', label: 'text-[10px]' },
    lg: { container: 'w-16 h-16 text-2xl', label: 'text-xs' },
    xl: { container: 'w-24 h-24 text-4xl', label: 'text-sm' },
  };

  // Background style according to color rules
  const getBallBackground = () => {
    switch (ball.color) {
      case 'green':
        return 'bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-950 border-emerald-400/40 shadow-emerald-500/30';
      case 'red':
        return 'bg-gradient-to-br from-rose-400 via-rose-600 to-rose-950 border-rose-400/40 shadow-rose-500/30';
      case 'red-violet':
        // Half Red, Half Violet split gradient (0)
        return 'bg-[conic-gradient(from_180deg,#ef4444_0deg_180deg,#8b5cf6_180deg_360deg)] border-purple-400/40 shadow-purple-500/30';
      case 'green-violet':
        // Half Green, Half Violet split gradient (5)
        return 'bg-[conic-gradient(from_180deg,#10b981_0deg_180deg,#8b5cf6_180deg_360deg)] border-teal-400/40 shadow-teal-500/30';
      default:
        return 'bg-zinc-800';
    }
  };

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={onClick ? { scale: 1.08 } : undefined}
        whileTap={onClick ? { scale: 0.92 } : undefined}
        className={`relative flex items-center justify-center rounded-full font-black text-white border-2 transition-all shadow-lg select-none cursor-pointer ${
          sizeMap[size].container
        } ${getBallBackground()} ${selected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-105' : ''} ${
          glowing ? 'animate-pulse shadow-2xl ring-2 ring-white/50' : ''
        }`}
      >
        {/* 3D Glass Gloss Lens Highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute top-1 left-1.5 w-1/3 h-1/3 bg-white/40 rounded-full blur-[1px] pointer-events-none" />

        {/* Number Display */}
        <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-black">
          {ball.number}
        </span>
      </motion.button>

      {/* Small vs Big size label */}
      {showSizeLabel && (
        <span
          className={`font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            sizeMap[size].label
          } ${
            ball.size === 'big'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}
        >
          {ball.size}
        </span>
      )}
    </div>
  );
};
