import React from 'react';
import { HistoryItem } from '../types';
import { getBallInfo } from '../utils/colorUtils';
import { BarChart3, PieChart, Flame, Snowflake, Scale } from 'lucide-react';

interface TrendAnalyticsProps {
  history: HistoryItem[];
}

export const TrendAnalytics: React.FC<TrendAnalyticsProps> = ({ history }) => {
  const last10 = history.slice(0, 10);

  // Stats calculation
  let greenCount = 0;
  let redCount = 0;
  let violetCount = 0;
  let bigCount = 0;
  let smallCount = 0;

  const numberFreq: Record<number, number> = {};
  for (let i = 0; i <= 9; i++) numberFreq[i] = 0;

  last10.forEach((item) => {
    numberFreq[item.number] = (numberFreq[item.number] || 0) + 1;
    const info = getBallInfo(item.number);
    if (info.color === 'green') greenCount++;
    else if (info.color === 'red') redCount++;
    else if (info.color === 'red-violet' || info.color === 'green-violet') {
      violetCount++;
      if (info.color === 'red-violet') redCount++;
      else greenCount++;
    }

    if (info.size === 'big') bigCount++;
    else smallCount++;
  });

  const total = last10.length || 1;
  const greenPct = Math.round((greenCount / total) * 100);
  const redPct = Math.round((redCount / total) * 100);
  const bigPct = Math.round((bigCount / total) * 100);
  const smallPct = Math.round((smallCount / total) * 100);

  // Hot and cold numbers
  const sortedNums = Object.entries(numberFreq).sort((a, b) => Number(b[1]) - Number(a[1]));
  const hotNumbers = sortedNums.slice(0, 3).map(([num]) => Number(num));
  const coldNumbers = sortedNums.slice(-3).reverse().map(([num]) => Number(num));

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase">
              10-CYCLE TREND ANALYTICS
            </h3>
            <p className="text-xs text-zinc-400">
              Color & Size Distribution Summary
            </p>
          </div>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color Ratio */}
        <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
          <div className="flex justify-between items-center text-xs font-bold text-zinc-300 mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <PieChart className="w-3.5 h-3.5" /> Green ({greenPct}%)
            </span>
            <span className="text-purple-400">Violet Split ({violetCount})</span>
            <span className="text-rose-400">Red ({redPct}%)</span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full flex overflow-hidden p-0.5">
            <div
              style={{ width: `${greenPct}%` }}
              className="h-full bg-emerald-500 transition-all duration-500 rounded-l-full"
            />
            <div
              style={{ width: `${(violetCount / total) * 100}%` }}
              className="h-full bg-purple-500 transition-all duration-500"
            />
            <div
              style={{ width: `${redPct}%` }}
              className="h-full bg-rose-500 transition-all duration-500 rounded-r-full"
            />
          </div>
        </div>

        {/* Size Ratio */}
        <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
          <div className="flex justify-between items-center text-xs font-bold text-zinc-300 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Scale className="w-3.5 h-3.5" /> Small (0-4): {smallPct}%
            </span>
            <span className="text-amber-400">Big (5-9): {bigPct}%</span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full flex overflow-hidden p-0.5">
            <div
              style={{ width: `${smallPct}%` }}
              className="h-full bg-cyan-500 transition-all duration-500 rounded-l-full"
            />
            <div
              style={{ width: `${bigPct}%` }}
              className="h-full bg-amber-500 transition-all duration-500 rounded-r-full"
            />
          </div>
        </div>
      </div>

      {/* Hot & Cold Numbers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hot */}
        <div className="p-3 bg-zinc-950/60 border border-amber-500/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-300 uppercase">
              HOT NUMBERS
            </span>
          </div>
          <div className="flex items-center gap-1">
            {hotNumbers.map((num) => (
              <span
                key={num}
                className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center justify-center font-mono"
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Cold */}
        <div className="p-3 bg-zinc-950/60 border border-cyan-500/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase">
              COLD NUMBERS
            </span>
          </div>
          <div className="flex items-center gap-1">
            {coldNumbers.map((num) => (
              <span
                key={num}
                className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs flex items-center justify-center font-mono"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
