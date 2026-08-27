import React, { useState, useEffect, useRef } from 'react';
import { PlayerSymbol, UserStats } from '../types';
import { RotateCcw, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserStats, formatWinRate, STATS_UPDATED_EVENT } from '../utils/statsStorage';
import { motion } from 'motion/react';

interface GameResultModalProps {
  winner: PlayerSymbol | 'draw';
  onPlayAgain: () => void;
  onChangeMode?: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  winner,
  onPlayAgain,
  onChangeMode,
}) => {
  const { currentUser } = useAuth();
  const playAgainButtonRef = useRef<HTMLButtonElement>(null);

  const isXWin = winner === 'X';
  const isHeartWin = winner === '♥';

  const [stats, setStats] = useState<UserStats | null>(() =>
    currentUser ? getUserStats(currentUser.usernameOrEmail) : null
  );

  useEffect(() => {
    if (!currentUser?.usernameOrEmail) {
      setStats(null);
      return;
    }

    setStats(getUserStats(currentUser.usernameOrEmail));

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
    return () => window.removeEventListener(STATS_UPDATED_EVENT, handleStatsUpdated);
  }, [currentUser]);

  // Handle keyboard Escape and focus management for accessibility
  useEffect(() => {
    // Auto-focus primary action
    playAgainButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPlayAgain();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain]);

  // Style configurations based on result state
  const config = isXWin
    ? {
        emoji: '😊',
        title: 'You Won!',
        subtitle: 'Congratulations! Great game!',
        badgeBg: 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800/80',
        titleColor: 'text-zinc-900 dark:text-white',
        accentPill: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
        badgeLabel: 'Victory',
        ariaLabel: 'Player Won',
      }
    : isHeartWin
    ? {
        emoji: '😢',
        title: 'Better Luck Next Time!',
        subtitle: 'Keep practicing and try again!',
        badgeBg: 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800/80',
        titleColor: 'text-zinc-900 dark:text-white',
        accentPill: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
        badgeLabel: 'Match Complete',
        ariaLabel: 'Player Lost',
      }
    : {
        emoji: '🤝',
        title: "It's a Draw!",
        subtitle: 'That was a close game!',
        badgeBg: 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800/80',
        titleColor: 'text-zinc-900 dark:text-white',
        accentPill: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
        badgeLabel: 'Tie Game',
        ariaLabel: 'Game Ended in a Draw',
      };

  return (
    <div
      id="game-result-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto"
    >
      {/* Semi-transparent background overlay with soft blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        onClick={onPlayAgain}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="relative z-10 w-full max-w-[340px] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 text-center shadow-2xl shadow-zinc-950/20 dark:shadow-black/60 transition-colors"
      >
        {/* Result Badge */}
        <div className="flex justify-center mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${config.accentPill}`}>
            {config.badgeLabel}
          </span>
        </div>

        {/* Animated Emoji Container */}
        <motion.div
          initial={{ scale: 0.4, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 450, damping: 22, delay: 0.05 }}
          className={`mx-auto mb-3.5 sm:mb-4 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center border ${config.badgeBg} shadow-inner select-none`}
        >
          <span className="text-4xl sm:text-5xl" role="img" aria-label={config.ariaLabel}>
            {config.emoji}
          </span>
        </motion.div>

        {/* Large Result Title */}
        <h2
          id="modal-title"
          className={`text-xl sm:text-2xl font-extrabold ${config.titleColor} font-display tracking-tight mb-1.5`}
        >
          {config.title}
        </h2>

        {/* Short Supporting Message */}
        <p
          id="modal-description"
          className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium mb-4 sm:mb-5 leading-relaxed"
        >
          {config.subtitle}
        </p>

        {/* Quick Player Stats Summary */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="mb-4 sm:mb-5 p-2.5 sm:p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-around text-xs"
          >
            <div className="text-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">Wins</div>
              <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{stats.wins}</div>
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="text-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">Losses</div>
              <div className="font-mono font-extrabold text-rose-600 dark:text-rose-400">{stats.losses}</div>
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="text-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">Draws</div>
              <div className="font-mono font-extrabold text-amber-600 dark:text-amber-400">{stats.draws}</div>
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="text-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">Win Rate</div>
              <div className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatWinRate(stats.winRate)}
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Primary Action Button: Play Again */}
          <button
            ref={playAgainButtonRef}
            id="btn-play-again"
            type="button"
            onClick={onPlayAgain}
            className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          {/* Secondary Action Button: Change Mode */}
          {onChangeMode && (
            <button
              id="btn-change-mode"
              type="button"
              onClick={onChangeMode}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 active:bg-zinc-200 dark:active:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs sm:text-sm border border-zinc-200 dark:border-zinc-700/80 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-zinc-400"
            >
              <LayoutGrid className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span>Change Mode</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

