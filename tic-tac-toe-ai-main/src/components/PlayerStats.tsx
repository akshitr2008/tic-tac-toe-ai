import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserStats } from '../types';
import {
  getUserStats,
  resetUserStats,
  formatWinRate,
  STATS_UPDATED_EVENT,
  getInitialStats,
} from '../utils/statsStorage';
import { Trophy, Swords, ShieldAlert, Award, RefreshCw, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PlayerStats: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserStats>(getInitialStats());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    if (!currentUser?.usernameOrEmail) {
      setStats(getInitialStats());
      return;
    }

    // Load initial stats for current user
    setStats(getUserStats(currentUser.usernameOrEmail));

    // Listen for stats updates from game completions
    const handleStatsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ usernameOrEmail: string; stats: UserStats }>;
      if (
        customEvent.detail?.usernameOrEmail &&
        customEvent.detail.usernameOrEmail.toLowerCase() === currentUser.usernameOrEmail.toLowerCase()
      ) {
        setStats(customEvent.detail.stats);
      } else {
        setStats(getUserStats(currentUser.usernameOrEmail));
      }
    };

    window.addEventListener(STATS_UPDATED_EVENT, handleStatsUpdated);
    window.addEventListener('storage', handleStatsUpdated);

    return () => {
      window.removeEventListener(STATS_UPDATED_EVENT, handleStatsUpdated);
      window.removeEventListener('storage', handleStatsUpdated);
    };
  }, [currentUser]);

  const handleResetConfirm = () => {
    if (!currentUser?.usernameOrEmail) return;
    const reset = resetUserStats(currentUser.usernameOrEmail);
    setStats(reset);
    setShowConfirmReset(false);
  };

  if (!currentUser) return null;

  return (
    <div className="w-full space-y-3">
      {/* Header with Title and Reset option */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Player Stats</span>
        </div>

        <button
          id="btn-reset-stats"
          type="button"
          onClick={() => setShowConfirmReset(true)}
          className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
          title="Reset your personal game statistics"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Confirmation Dialog Popover/Card if clicked */}
      <AnimatePresence>
        {showConfirmReset && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-left space-y-2 overflow-hidden"
          >
            <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Reset your statistics to 0?
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              This will reset your games, wins, losses, and draws. Other users are unaffected.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                id="btn-confirm-reset-stats"
                type="button"
                onClick={handleResetConfirm}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Games Played */}
        <div className="col-span-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between shadow-xs transition-transform duration-150 hover:scale-[1.01]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Swords className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Games Played</span>
          </div>
          <span id="stat-games-played" className="font-mono font-extrabold text-base text-zinc-900 dark:text-zinc-100">
            {stats.gamesPlayed}
          </span>
        </div>

        {/* Wins */}
        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between shadow-xs transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Wins</span>
          </div>
          <span id="stat-wins" className="font-mono font-extrabold text-lg text-emerald-700 dark:text-emerald-300">
            {stats.wins}
          </span>
        </div>

        {/* Losses */}
        <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 flex flex-col justify-between shadow-xs transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Losses</span>
          </div>
          <span id="stat-losses" className="font-mono font-extrabold text-lg text-rose-700 dark:text-rose-300">
            {stats.losses}
          </span>
        </div>

        {/* Draws */}
        <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-col justify-between shadow-xs transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 mb-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Draws</span>
          </div>
          <span id="stat-draws" className="font-mono font-extrabold text-lg text-amber-700 dark:text-amber-300">
            {stats.draws}
          </span>
        </div>

        {/* Win Rate */}
        <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col justify-between shadow-xs transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 mb-1">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Win Rate</span>
          </div>
          <span id="stat-win-rate" className="font-mono font-extrabold text-lg text-indigo-700 dark:text-indigo-300">
            {formatWinRate(stats.winRate)}
          </span>
        </div>
      </div>
    </div>
  );
};
