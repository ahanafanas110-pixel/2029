import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, ShieldCheck, AlertCircle, Eye, EyeOff, Sparkles, ShieldAlert, Timer } from 'lucide-react';
import { playUnlockSound } from '../utils/soundUtils';

interface PasswordModalProps {
  onSuccess: () => void;
  soundEnabled: boolean;
}

const STORAGE_ATTEMPTS_KEY = 'desh_pwd_attempts_v2';
const STORAGE_LOCKOUT_KEY = 'desh_pwd_lockout_until_v2';
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour = 3,600,000 ms

export const PasswordModal: React.FC<PasswordModalProps> = ({ onSuccess, soundEnabled }) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize lockout and attempts status from localStorage
  useEffect(() => {
    try {
      const savedLockout = localStorage.getItem(STORAGE_LOCKOUT_KEY);
      const savedAttempts = localStorage.getItem(STORAGE_ATTEMPTS_KEY);

      if (savedLockout) {
        const lockTime = parseInt(savedLockout, 10);
        if (!isNaN(lockTime) && lockTime > Date.now()) {
          setLockoutUntil(lockTime);
        } else {
          localStorage.removeItem(STORAGE_LOCKOUT_KEY);
        }
      }

      if (savedAttempts) {
        const atts = parseInt(savedAttempts, 10);
        if (!isNaN(atts)) setAttempts(atts);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
  }, []);

  // Timer tick for 1-hour lockout countdown
  useEffect(() => {
    if (!lockoutUntil) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.ceil((lockoutUntil - now) / 1000);
      if (diff <= 0) {
        setLockoutUntil(null);
        setRemainingSec(0);
        setAttempts(0);
        try {
          localStorage.removeItem(STORAGE_LOCKOUT_KEY);
          localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        } catch (e) {
          console.warn('Storage clear error:', e);
        }
      } else {
        setRemainingSec(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      return;
    }

    if (password === 'VIP2026OK') {
      setErrorMsg(null);
      setAttempts(0);
      try {
        localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        localStorage.removeItem(STORAGE_LOCKOUT_KEY);
      } catch (e) {
        console.warn('Storage clear error:', e);
      }
      playUnlockSound(soundEnabled);
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      try {
        localStorage.setItem(STORAGE_ATTEMPTS_KEY, newAttempts.toString());
      } catch (e) {
        console.warn('Storage write error:', e);
      }

      if (newAttempts >= 3) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockTime);
        setRemainingSec(3600);
        try {
          localStorage.setItem(STORAGE_LOCKOUT_KEY, lockTime.toString());
        } catch (e) {
          console.warn('Storage write error:', e);
        }
        setErrorMsg('৩ বার ভুল পাসওয়ার্ড দেয়া হয়েছে! নিরাপত্তা জনিত কারণে ১ ঘণ্টার জন্য IP/ডিভাইস ব্লক করা হলো।');
      } else {
        setErrorMsg(`ভুল পাসওয়ার্ড! আর ${3 - newAttempts} বার চেষ্টা করতে পারবেন।`);
      }
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const isLocked = !!lockoutUntil && remainingSec > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Background glowing particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md p-5 sm:p-7 bg-zinc-900/95 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 my-auto"
      >
        {/* Top VIP Header Badge */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <div className="relative mb-3">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                isLocked
                  ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-rose-400 shadow-rose-500/30'
                  : 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 shadow-amber-500/30'
              }`}
            >
              {isLocked ? (
                <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              ) : (
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-950 stroke-[2.5]" />
              )}
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className={`absolute -inset-1 rounded-2xl border border-dashed pointer-events-none ${
                isLocked ? 'border-rose-500/50' : 'border-amber-400/40'
              }`}
            />
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] sm:text-xs font-black tracking-wider uppercase rounded-full mb-2 ${
              isLocked
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isLocked ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> IP BLOCKED (১ ঘণ্টা)
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> VIP ACCESS ONLY
              </>
            )}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 tracking-wide uppercase">
            DESH CLUB PREDICTOR
          </h2>
          <p className="mt-1 text-xs text-zinc-400 max-w-xs">
            {isLocked
              ? '৩ বার ভুল পাসওয়ার্ড দেয়া হয়েছে। ১ ঘণ্টা পর আবার চেষ্টা করুন।'
              : 'অফিসিয়াল VIP পাসওয়ার্ড দিয়ে Gemini AI প্রেডিক্টর আনলক করুন।'}
          </p>
        </div>

        {/* Lockout Timer Banner if IP is locked */}
        {isLocked ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-center space-y-2 shadow-inner">
              <div className="flex items-center justify-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <Timer className="w-4 h-4 text-rose-400 animate-spin" />
                IP / ডিভাইস ১ ঘণ্টার জন্য ব্লক
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-200 tracking-widest drop-shadow">
                {formatTime(remainingSec)}
              </div>
              <p className="text-[11px] text-rose-300/80 leading-relaxed pt-1">
                নিরাপত্তা সিস্টেমের নিয়ম অনুযায়ী ৩ বার ভুল পাসওয়ার্ড দেয়ায় আপনার IP বা ডিভাইস সাময়িকভাবে ১ ঘণ্টা ব্লক করা হলো।
              </p>
            </div>

            <button
              disabled
              className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-zinc-500 rounded-xl bg-zinc-800 border border-zinc-700 cursor-not-allowed text-center"
            >
              🔒 BLOCKED UNTIL COUNTDOWN ENDS
            </button>
          </div>
        ) : (
          /* Password Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> VIP Password / পাসওয়ার্ড
                </label>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  চেষ্টা বাকি: <strong className="text-amber-400">{3 - attempts}</strong>/3
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="VIP পাসওয়ার্ড লিখুন..."
                  className={`w-full px-4 py-3.5 bg-zinc-950 border rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none transition-all ${
                    errorMsg
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-zinc-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3.5 px-4 font-black text-xs sm:text-sm text-zinc-950 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
            >
              <ShieldCheck className="w-4 h-4" />
              UNLOCK PREDICTOR (আনলক করুন)
            </button>
          </form>
        )}

        <div className="mt-5 text-center border-t border-zinc-800/80 pt-3">
          <p className="text-[11px] text-zinc-500 font-mono">
            DESH CLUB PREDICTOR v2.6 • IP Lock Protection • Gemini AI
          </p>
        </div>
      </motion.div>
    </div>
  );
};
