import React from 'react';
import { Shield, Volume2, VolumeX, Lock, Cpu, RotateCcw } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLock: () => void;
  onResetHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onLock,
  onResetHistory,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-emerald-400">
                PREMIUM HACK HUB
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden xs:block">
              Gemini AI Powered Real-Time Trend & Score Signal
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-medium text-emerald-400">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>AI SERVER ONLINE</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Reset History */}
          <button
            onClick={onResetHistory}
            title="Reset Stack to Default"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-zinc-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Lock Session */}
          <button
            onClick={onLock}
            title="Lock Session"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-400 hover:border-zinc-700 transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
