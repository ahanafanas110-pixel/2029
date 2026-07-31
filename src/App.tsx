import React, { useState, useEffect, useCallback } from 'react';
import { PasswordModal } from './components/PasswordModal';
import { Header } from './components/Header';
import { HistoryStack } from './components/HistoryStack';
import { PredictionCard } from './components/PredictionCard';
import { TrendAnalytics } from './components/TrendAnalytics';
import { HistoryLogTable } from './components/HistoryLogTable';
import { HistoryItem, PredictionResult, PredictionStats } from './types';
import { getBallInfo } from './utils/colorUtils';
import { playScanSound, playWinSound, playBallClickSound } from './utils/soundUtils';
import { generateClientPrediction } from './utils/predictionEngine';
import { ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

const INITIAL_STACK_NUMBERS = [3, 8, 2, 5, 0, 7, 1, 9, 4, 6];

function createDefaultHistoryStack(): HistoryItem[] {
  return INITIAL_STACK_NUMBERS.map((num, idx) => {
    const info = getBallInfo(num);
    const date = new Date(Date.now() - idx * 60000);
    return {
      id: `init-${idx}-${num}-${Date.now()}`,
      number: num,
      color: info.color,
      size: info.size,
      timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  });
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // History stack starts empty (0/10) so user is prompted to input 10 signals immediately
  const [historyStack, setHistoryStack] = useState<HistoryItem[]>([]);
  
  // AI Prediction state
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Win / Loss Stats & History Logs
  const [stats, setStats] = useState<PredictionStats>({
    totalPredictions: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  const [logs, setLogs] = useState<HistoryItem[]>([]);

  // Function to call AI API endpoint for next prediction with exact 3-second scanning cycle & client fallback for Vercel
  const runPredictionScan = useCallback(
    async (currentHistory: HistoryItem[]) => {
      if (currentHistory.length < 10) return;

      setIsScanning(true);
      playScanSound(soundEnabled);

      const historyNumbers = currentHistory.map((item) => item.number);
      const scanStartTime = Date.now();

      let resultPrediction: PredictionResult | null = null;

      try {
        // Create a controller with timeout (3 seconds) to prevent infinite loading on Vercel static hosts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2800);

        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: historyNumbers }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.prediction) {
            resultPrediction = data.prediction;
          }
        }
      } catch (err) {
        console.warn('API route call skipped or timed out, generating local client AI prediction:', err);
      }

      // If backend API fails or isn't available (e.g. Vercel static SPA export), generate instant client AI prediction
      if (!resultPrediction) {
        resultPrediction = generateClientPrediction(historyNumbers);
      }

      // Enforce smooth 3-second (3000ms) visual scanning duration
      const elapsedTime = Date.now() - scanStartTime;
      const remainingDelay = Math.max(0, 3000 - elapsedTime);

      setTimeout(() => {
        setPrediction(resultPrediction);
        setIsScanning(false);
      }, remainingDelay);
    },
    [soundEnabled]
  );

  // Automatically run AI prediction scan whenever stack reaches 10 items
  useEffect(() => {
    if (isUnlocked && historyStack.length === 10 && !prediction && !isScanning) {
      runPredictionScan(historyStack);
    }
  }, [isUnlocked, historyStack, prediction, isScanning, runPredictionScan]);

  // Handle selecting a number circle (0 to 9) to build or push stack
  const handleSelectNumberCircle = (num: number) => {
    playBallClickSound(soundEnabled);

    const info = getBallInfo(num);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newItem: HistoryItem = {
      id: `ball-${Date.now()}-${num}`,
      number: num,
      color: info.color,
      size: info.size,
      timestamp: timeStr,
    };

    if (historyStack.length < 10) {
      // Adding numbers 1 to 10 step-by-step
      const updatedStack = [...historyStack, newItem];
      setHistoryStack(updatedStack);

      if (updatedStack.length === 10) {
        // Trigger 3-second AI scan automatically on 10th ball
        runPredictionScan(updatedStack);
      }
    } else {
      // Stack already has 10 items: Shift top ball in, drop 10th ball
      const updatedStack = [newItem, ...historyStack.slice(0, 9)];
      setHistoryStack(updatedStack);
      runPredictionScan(updatedStack);
    }
  };

  // Handle recorded winning result from active prediction card
  const handleConfirmWinNumber = (winNum: number) => {
    playBallClickSound(soundEnabled);

    const info = getBallInfo(winNum);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let isWin = false;
    if (prediction) {
      isWin =
        prediction.predictedColor === info.color ||
        prediction.predictedNumber === info.number ||
        prediction.predictedSize === info.size;
    }

    if (isWin) {
      playWinSound(soundEnabled);
    }

    const newItem: HistoryItem = {
      id: `win-${Date.now()}-${winNum}`,
      number: winNum,
      color: info.color,
      size: info.size,
      timestamp: timeStr,
      predictedWasCorrect: isWin,
    };

    const updatedStack = [newItem, ...historyStack.slice(0, 9)];
    setHistoryStack(updatedStack);
    setLogs((prev) => [newItem, ...prev]);

    if (prediction) {
      setStats((prev) => {
        const newWins = prev.wins + (isWin ? 1 : 0);
        const newLosses = prev.losses + (isWin ? 0 : 1);
        const newStreak = isWin ? prev.currentStreak + 1 : 0;
        const newBest = Math.max(prev.bestStreak, newStreak);
        return {
          totalPredictions: prev.totalPredictions + 1,
          wins: newWins,
          losses: newLosses,
          currentStreak: newStreak,
          bestStreak: newBest,
        };
      });
    }

    runPredictionScan(updatedStack);
  };

  // Reset Stack to 0/10 input mode
  const handleClearStackToInputMode = () => {
    playBallClickSound(soundEnabled);
    setHistoryStack([]);
    setPrediction(null);
  };

  // Load demo 10 stack instantly
  const handleLoadDemoStack = () => {
    playBallClickSound(soundEnabled);
    const demoStack = createDefaultHistoryStack();
    setHistoryStack(demoStack);
    runPredictionScan(demoStack);
  };

  if (!isUnlocked) {
    return <PasswordModal onSuccess={() => setIsUnlocked(true)} soundEnabled={soundEnabled} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onLock={() => setIsUnlocked(false)}
        onResetHistory={handleClearStackToInputMode}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 space-y-5 sm:space-y-6">
        {/* Banner Alert Bar */}
        <div className="p-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-emerald-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs text-zinc-300">
              <span className="font-extrabold text-amber-300">AUTO-SCAN VIP PREDICTOR:</span> 0-9 সার্কেল চেপে ১০ টি সিগন্যাল দিলেই AI ৩ সেকেন্ডে এনালাইসিস করে উইনিং সিগন্যাল প্রকাশ করবে।
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleClearStackToInputMode}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              ১০ টি নতুন সিগন্যাল দিন
            </button>
          </div>
        </div>

        {/* Primary 2-Column Grid: AI Predictor & 10-Ball History Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: AI Prediction Card & Trend Analytics (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <PredictionCard
              prediction={prediction}
              isScanning={isScanning}
              historyCount={historyStack.length}
              historyStack={historyStack}
              onSelectNumberCircle={handleSelectNumberCircle}
              onScanNext={() => runPredictionScan(historyStack)}
              onConfirmWinNumber={handleConfirmWinNumber}
              onClearStackToInputMode={handleClearStackToInputMode}
              onLoadDemoStack={handleLoadDemoStack}
            />

            <TrendAnalytics history={historyStack} />
          </div>

          {/* Right Column: 10-Ball History Stack (5 Cols) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <HistoryStack
              history={historyStack}
              onBallClick={handleConfirmWinNumber}
              onClearStack={handleClearStackToInputMode}
              onQuickPush={handleSelectNumberCircle}
              onLoadDemoStack={handleLoadDemoStack}
            />
          </div>
        </div>

        {/* Bottom Detailed Logs Table */}
        {logs.length > 0 && <HistoryLogTable logs={logs} stats={stats} />}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-zinc-800/80 bg-zinc-950 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-zinc-400 uppercase tracking-wider">
              DESH CLUB PREDICTOR
            </span>
            <span>• VIP 2026 EDITION</span>
          </div>
          <p className="font-mono text-[11px]">
            Powered by Gemini AI Model • 3s Deep Signal Analysis
          </p>
        </div>
      </footer>
    </div>
  );
}
