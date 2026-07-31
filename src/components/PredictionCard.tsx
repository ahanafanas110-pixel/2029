import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Scan, CheckCircle2, Zap, Activity, RefreshCw, CircleDot, HelpCircle, Cpu } from 'lucide-react';
import { HistoryItem, PredictionResult } from '../types';
import { BallCircle } from './BallCircle';
import { getColorBadgeBg, getSizeBadgeBg } from '../utils/colorUtils';

interface PredictionCardProps {
  prediction: PredictionResult | null;
  isScanning: boolean;
  historyCount: number;
  historyStack: HistoryItem[];
  onSelectNumberCircle: (num: number) => void;
  onScanNext: () => void;
  onConfirmWinNumber: (num: number) => void;
  onClearStackToInputMode: () => void;
  onLoadDemoStack: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  isScanning,
  historyCount,
  historyStack,
  onSelectNumberCircle,
  onScanNext,
  onConfirmWinNumber,
  onClearStackToInputMode,
  onLoadDemoStack,
}) => {
  const isNeedsMoreSignals = historyCount < 10;
  const [scanCountdown, setScanCountdown] = useState<number>(3.0);

  // Live 3-second countdown ticker when scanning
  useEffect(() => {
    if (!isScanning) {
      setScanCountdown(3.0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 3.0 - elapsedSec);
      setScanCountdown(parseFloat(remaining.toFixed(1)));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="relative overflow-hidden bg-zinc-900/95 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-amber-500/10">
      {/* 3-Second Scanning Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4"
          >
            {/* Animated Laser beam */}
            <motion.div
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b]"
            />

            <div className="flex flex-col items-center gap-3 bg-zinc-900/95 p-5 sm:p-6 rounded-2xl border border-amber-500/50 shadow-2xl max-w-sm w-full text-center">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-full border-2 border-amber-400 border-t-transparent flex items-center justify-center shadow-lg shadow-amber-500/20"
                >
                  <Scan className="w-7 h-7 text-amber-400" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
              </div>

              <div>
                <span className="text-sm sm:text-base font-black text-amber-300 tracking-wider uppercase block">
                  AI ১০ টি সিগন্যাল বিশ্লেষণ করছে...
                </span>
                <span className="text-xs text-zinc-400 font-mono mt-0.5 block">
                  3-Second Gemini Deep Pattern Analysis
                </span>
              </div>

              {/* 3-Second Progress Bar */}
              <div className="w-full space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-amber-300">
                  <span>ANALYZING 10 SIGNALS</span>
                  <span className="text-amber-400">{scanCountdown.toFixed(1)}s</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.0, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide uppercase flex items-center gap-2 flex-wrap">
              AI SIGNAL PREDICTION
              <span
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${
                  isNeedsMoreSignals
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isNeedsMoreSignals ? `${historyCount}/10 INPUT NEEDED` : '10/10 ANALYZED'}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              {isNeedsMoreSignals
                ? '১০ টি সিগন্যাল দিতে নিচের 0-9 সার্কেল গুলোতে ক্লিক করুন'
                : '3-Sec Gemini AI Analysis Complete'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {!isNeedsMoreSignals && (
            <button
              onClick={onClearStackToInputMode}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[42px]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>১০ টি নতুন সিগন্যাল</span>
            </button>
          )}

          {!isNeedsMoreSignals && (
            <button
              onClick={onScanNext}
              disabled={isScanning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer min-h-[42px]"
            >
              <Zap className="w-4 h-4" />
              <span>{isScanning ? 'SCANNING...' : '3S RE-SCAN'}</span>
            </button>
          )}
        </div>
      </div>

      {/* CASE 1: NEED 10 RECENT SIGNALS STATE */}
      {isNeedsMoreSignals ? (
        <div className="mt-4 sm:mt-5 space-y-5">
          {/* Bengali Instruction Banner */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <HelpCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                  ১০ টি লাস্ট সিগন্যাল নাম্বার দিন ({historyCount}/10)
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5 leading-snug">
                  পরপর ১০ টি রেজাল্ট বেছে নিন। ১০ টি সিগন্যাল পেলেই AI ৩ সেকেন্ড এনালাইসিস করে অটো সিগন্যাল দিবে।
                </p>
              </div>
            </div>

            <button
              onClick={onLoadDemoStack}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 hover:bg-amber-300 text-xs font-black uppercase tracking-wider shrink-0 shadow-md transition-all active:scale-95 cursor-pointer text-center min-h-[44px]"
            >
              ⚡ ডেমো ১০ টি সিগন্যাল দিন
            </button>
          </div>

          {/* 10-Slot Visual Progress Tracker (Bottom to Top) */}
          <div className="bg-zinc-950 p-3.5 sm:p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-400">
                <CircleDot className="w-4 h-4 text-amber-400 animate-spin" />
                ১০ টি সিগন্যাল স্লট
              </span>
              <span className="font-mono text-amber-300 text-xs">
                {historyCount} / 10 FULL
              </span>
            </div>

            {/* Grid of 10 slots showing bottom-to-top filled items */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 items-center justify-items-center pt-1">
              {Array.from({ length: 10 }).map((_, slotIdx) => {
                const hasItem = slotIdx < historyCount;
                const item = hasItem ? historyStack[slotIdx] : null;

                return (
                  <div
                    key={slotIdx}
                    className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl border transition-all w-full min-h-[64px] sm:min-h-[72px] ${
                      hasItem
                        ? 'bg-zinc-900 border-amber-500/50 shadow-md'
                        : 'bg-zinc-950/80 border-dashed border-zinc-800'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-zinc-500 mb-0.5">
                      #{slotIdx + 1}
                    </span>

                    {item ? (
                      <BallCircle number={item.number} size="sm" showSizeLabel={false} />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                        {slotIdx + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive 0-9 Number Circle Buttons for Quick Tap Entry (Mobile Touch Optimized) */}
          <div className="p-3.5 sm:p-4 bg-zinc-950/90 rounded-xl border border-amber-500/30">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 text-center">
              👉 সিগন্যাল যোগ করতে 0-9 সার্কেল চাপুন ({10 - historyCount} টি বাকি)
            </label>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 items-center justify-items-center">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div key={num} className="flex flex-col items-center gap-1 w-full">
                  <BallCircle
                    number={num}
                    size="md"
                    showSizeLabel={false}
                    onClick={() => onSelectNumberCircle(num)}
                  />
                  <span className="text-[10px] font-extrabold text-zinc-400 font-mono">
                    #{num}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* CASE 2: 10/10 COMPLETED -> SHOW AI PREDICTION SIGNAL */
        prediction && (
          <div className="mt-4 sm:mt-5 space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/80">
              {/* Big Ball Graphic */}
              <div className="flex flex-col items-center justify-center text-center p-2 border-b sm:border-b-0 sm:border-r border-zinc-800">
                <span className="text-[11px] font-bold uppercase text-amber-400/80 mb-2">
                  PREDICTED NEXT BALL
                </span>
                <BallCircle
                  number={prediction.predictedNumber}
                  size="xl"
                  glowing={true}
                />
                <span className="mt-2 text-xs font-mono text-zinc-400">
                  Target Score: #{prediction.predictedNumber}
                </span>
              </div>

              {/* Prediction Attributes & Confidence */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${getColorBadgeBg(prediction.predictedColor)}`}>
                    COLOR: {prediction.predictedColorName}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${getSizeBadgeBg(prediction.predictedSize)}`}>
                    SIZE: {prediction.predictedSize}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    {prediction.trendType}
                  </span>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-zinc-300">CONFIDENCE ACCURACY</span>
                    <span className="font-extrabold text-amber-400 font-mono text-sm">
                      {prediction.confidence}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidence}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>

                {/* AI Explanation Text */}
                <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                  <p className="font-semibold text-amber-300 mb-0.5">
                    💡 AI Insight (৩ সেকেন্ডের এআই এনালাইসিস):
                  </p>
                  {prediction.explanation}
                </div>
              </div>
            </div>

            {/* Winning Ball Record Selector */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-950 rounded-xl border border-amber-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    RECORD WINNING RESULT (পরের আসল রেজাল্ট দিন)
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    পরের রেজাল্ট চাপলে স্ট্যাক আপডেট হবে এবং ৩ সেকেন্ডের নতুন এআই সিগন্যাল আসবে
                  </p>
                </div>

                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 self-start sm:self-auto">
                  Auto 3S Re-Scan
                </span>
              </div>

              {/* 10 Circle Balls for Win Selection */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 items-center justify-items-center pt-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div key={num} className="flex flex-col items-center gap-1 w-full">
                    <BallCircle
                      number={num}
                      size="md"
                      showSizeLabel={false}
                      onClick={() => onConfirmWinNumber(num)}
                      selected={prediction.predictedNumber === num}
                    />
                    <span className="text-[10px] font-bold text-zinc-400 font-mono">
                      #{num}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
