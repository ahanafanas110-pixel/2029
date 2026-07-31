import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Trash2, ArrowDown, Sparkles, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { HistoryItem } from '../types';
import { BallCircle } from './BallCircle';
import { getBallInfo, getColorBadgeBg } from '../utils/colorUtils';

interface HistoryStackProps {
  history: HistoryItem[];
  onBallClick: (num: number) => void;
  onClearStack: () => void;
  onQuickPush: (num: number) => void;
  onLoadDemoStack: () => void;
}

export const HistoryStack: React.FC<HistoryStackProps> = ({
  history,
  onBallClick,
  onClearStack,
  onQuickPush,
  onLoadDemoStack,
}) => {
  const displayHistory = history.slice(0, 10);
  const isFull = displayHistory.length === 10;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                10-SIGNAL STACK ORDER
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isFull
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {displayHistory.length}/10
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {isFull
                  ? '১ম স্থান (#১) = লেটেস্ট রেজাল্ট • ১০ম স্থান (#১০) = পুরনো'
                  : 'উপরে সবচেয়ে নতুন রেজাল্ট যুক্ত হচ্ছে...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isFull && (
              <button
                onClick={onLoadDemoStack}
                title="Auto load 10 demo signals"
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all border border-amber-500/20 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Demo 10
              </button>
            )}

            <button
              onClick={onClearStack}
              title="Reset stack to start fresh 10 input"
              className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stack Container */}
        <div className="mt-4 space-y-2 relative min-h-[380px] max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="text-[11px] font-semibold uppercase text-amber-400/80 flex items-center justify-between px-2 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10">
            <span className="flex items-center gap-1">
              <ArrowDown className="w-3 h-3 text-amber-400 animate-bounce" /> #১ স্থান = LATEST RESULT (নতুন উইন/লস)
            </span>
            <span>COLOR • RESULT</span>
          </div>

          {displayHistory.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-zinc-800 rounded-xl p-4">
              <PlusCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-bold text-amber-300">
                কোন সিগন্যাল নেই (0/10)
              </p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
                নিচের 0-9 সার্কেল চেপে পরপর ১০ টি লাস্ট সিগন্যাল যুক্ত করুন।
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {displayHistory.map((item, index) => {
                const ball = getBallInfo(item.number);
                const isFirstSlot = index === 0; // #1 is the latest item

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isFirstSlot
                        ? 'bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Slot position index #1, #2... */}
                      <span
                        className={`w-7 text-center font-mono text-xs font-extrabold ${
                          isFirstSlot ? 'text-amber-400' : 'text-zinc-500'
                        }`}
                      >
                        #{index + 1}
                      </span>

                      {/* Ball circle */}
                      <BallCircle
                        number={item.number}
                        size="sm"
                        showSizeLabel={false}
                        onClick={() => onBallClick(item.number)}
                        glowing={isFirstSlot}
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-white">
                            Number {item.number}
                          </span>
                          {isFirstSlot && (
                            <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-amber-400 text-zinc-950 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> LATEST (#১)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Attribute badges & WIN/LOSS status */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getColorBadgeBg(ball.color)}`}>
                        {ball.colorName}
                      </span>

                      {item.predictedWasCorrect !== undefined ? (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-black uppercase flex items-center gap-1 shadow ${
                            item.predictedWasCorrect
                              ? 'bg-emerald-500 text-zinc-950 border border-emerald-400'
                              : 'bg-rose-600 text-white border border-rose-400'
                          }`}
                        >
                          {item.predictedWasCorrect ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> WIN (উইন)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> LOSS (লস)
                            </>
                          )}
                        </span>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {displayHistory.length < 10 && displayHistory.length > 0 && (
            <div className="text-[11px] text-center text-amber-300/90 py-2 font-mono bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2">
              ⚠️ {10 - displayHistory.length} টি সিগন্যাল বাকি। ১০ টি পূর্ণ হলেই AI এনালাইসিস শুরু হবে।
            </div>
          )}
        </div>
      </div>

      {/* Manual Circle Quick Adder */}
      <div className="mt-5 pt-3 border-t border-zinc-800">
        <label className="block text-xs font-bold text-amber-300 mb-2 flex items-center justify-between">
          <span>0-9 সার্কেল চেপে সিগন্যাল যুক্ত করুন:</span>
          <span className="text-[10px] text-amber-400 font-mono">
            {displayHistory.length}/10 Balls
          </span>
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onQuickPush(num)}
              className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 rounded-lg text-xs font-extrabold text-zinc-200 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              #{num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
