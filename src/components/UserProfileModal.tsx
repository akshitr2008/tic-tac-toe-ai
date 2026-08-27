import React, { useState, useEffect } from 'react';
import { User, UserStats } from '../types';
import { getUserStats, formatWinRate, STATS_UPDATED_EVENT } from '../utils/statsStorage';
import { motion } from 'motion/react';
import { X as CloseIcon, Trophy, Swords, ShieldAlert, Award, Hash } from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
}

export const getInitials = (name?: string, fallback?: string): string => {
  const source = (name && name.trim().length > 0) ? name.trim() : (fallback || 'U');
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const [stats, setStats] = useState<UserStats>(() => getUserStats(user.usernameOrEmail));

  useEffect(() => {
    setStats(getUserStats(user.usernameOrEmail));

    const handleStatsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ usernameOrEmail: string; stats: UserStats }>;
      if (
        customEvent.detail?.usernameOrEmail &&
        customEvent.detail.usernameOrEmail.toLowerCase() === user.usernameOrEmail.toLowerCase()
      ) {
        setStats(customEvent.detail.stats);
      } else {
        setStats(getUserStats(user.usernameOrEmail));
      }
    };

    window.addEventListener(STATS_UPDATED_EVENT, handleStatsUpdated);
    return () => window.removeEventListener(STATS_UPDATED_EVENT, handleStatsUpdated);
  }, [user.usernameOrEmail]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="user-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto"
    >
      {/* Semi-transparent backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="relative z-10 w-full max-w-[340px] sm:max-w-sm max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl transition-colors"
      >
        {/* Header & Close Button */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
            Player Profile
          </span>
          <button
            id="btn-close-profile-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Info */}
        <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-indigo-600/20 uppercase flex-shrink-0">
            {getInitials(user.name, user.usernameOrEmail)}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="profile-modal-title"
              className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white font-display truncate"
            >
              {user.name || user.usernameOrEmail}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {user.usernameOrEmail}
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="space-y-2 mb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-0.5">
            Career Overview
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Games Played */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300">
                <Hash className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 truncate">
                  Games Played
                </div>
                <div className="font-mono font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  {stats.gamesPlayed}
                </div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 truncate">
                  Win Rate
                </div>
                <div className="font-mono font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                  {formatWinRate(stats.winRate)}
                </div>
              </div>
            </div>
          </div>

          {/* Record Row: Wins, Losses, Draws */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700/60 text-center">
            {/* Wins */}
            <div className="px-1">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-0.5">
                <Trophy className="w-3 h-3" />
                <span>Wins</span>
              </div>
              <div className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                {stats.wins}
              </div>
            </div>

            {/* Losses */}
            <div className="px-1">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 mb-0.5">
                <ShieldAlert className="w-3 h-3" />
                <span>Losses</span>
              </div>
              <div className="font-mono font-extrabold text-base text-rose-600 dark:text-rose-400">
                {stats.losses}
              </div>
            </div>

            {/* Draws */}
            <div className="px-1">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 mb-0.5">
                <Swords className="w-3 h-3" />
                <span>Draws</span>
              </div>
              <div className="font-mono font-extrabold text-base text-amber-600 dark:text-amber-400">
                {stats.draws}
              </div>
            </div>
          </div>
        </div>

        {/* Done / Close Button */}
        <button
          id="btn-done-profile"
          type="button"
          onClick={onClose}
          className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer active:scale-95 shadow-xs"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};
