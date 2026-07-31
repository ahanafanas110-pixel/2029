import React from 'react';
import { HistoryItem, PredictionStats } from '../types';
import { BallCircle } from './BallCircle';
import { getBallInfo } from '../utils/colorUtils';
import { Trophy, CheckCircle, XCircle, Flame, Target } from 'lucide-react';

interface HistoryLogTableProps {
  logs: HistoryItem[];
  stats: PredictionStats;
}

export const HistoryLogTable: React.FC<HistoryLogTableProps> = ({ logs, stats }) => {
  const winRate = stats.totalPredictions > 0
    ? Math.round((stats.wins / stats.totalPredictions) * 100)
    : 100;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-zinc-950 rounded-xl border border-emerald-500/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">
              TOTAL WINS
            </span>
            <span className="text-lg font-black text-white font-mono">
              {stats.wins} / {stats.totalPredictions}
            </span>
          </div>
        </div>

        <div className="p-3 bg-zinc-950 rounded-xl border border-amber-500/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">
              WIN RATE ACCURACY
            </span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {winRate}%
            </span>
          </div>
        </div>

        <div className="p-3 bg-zinc-950 rounded-xl border border-purple-500/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">
              CURRENT STREAK
            </span>
            <span className="text-lg font-black text-purple-300 font-mono">
              🔥 {stats.currentStreak} Wins
            </span>
          </div>
        </div>

        <div className="p-3 bg-zinc-950 rounded-xl border border-yellow-500/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">
              BEST STREAK
            </span>
            <span className="text-lg font-black text-yellow-400 font-mono">
              🏆 {stats.bestStreak} Wins
            </span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300 border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[11px] uppercase font-bold text-zinc-400">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Result Ball</th>
              <th className="py-2.5 px-3">Color</th>
              <th className="py-2.5 px-3">Size</th>
              <th className="py-2.5 px-3 text-right">Prediction Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {logs.slice(0, 10).map((item) => {
              const info = getBallInfo(item.number);
              return (
                <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-zinc-400">
                    {item.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <BallCircle
                        number={item.number}
                        size="sm"
                        showSizeLabel={false}
                      />
                      <span className="font-bold text-white">#{item.number}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-200">
                    {info.colorName}
                  </td>
                  <td className="py-2.5 px-3 font-extrabold uppercase">
                    <span
                      className={
                        info.size === 'big' ? 'text-amber-400' : 'text-cyan-400'
                      }
                    >
                      {info.size}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {item.predictedWasCorrect !== undefined ? (
                      item.predictedWasCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" /> WIN ACCURACY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" /> MISSED
                        </span>
                      )
                    ) : (
                      <span className="text-zinc-500 font-mono">RECORDED</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
