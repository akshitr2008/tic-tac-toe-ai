import React, { useState } from 'react';
import { GameModeId, GameMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { PlayerStats } from './PlayerStats';
import { UserProfileModal, getInitials } from './UserProfileModal';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Flame,
  Users,
  Timer,
  LogOut,
  Gamepad2,
  ChevronRight,
  X as CloseIcon,
} from 'lucide-react';

interface SidebarProps {
  selectedMode: GameModeId;
  onSelectMode: (mode: GameModeId) => void;
  onCloseMobile?: () => void;
}

export const GAME_MODES: GameMode[] = [
  {
    id: 'vs-computer-easy',
    title: 'Play vs Computer (Easy)',
    subtitle: 'Casual sparring',
    iconName: 'Bot',
  },
  {
    id: 'vs-computer-hard',
    title: 'Play vs Computer (Hard)',
    subtitle: 'Strategic master',
    iconName: 'Flame',
  },
  {
    id: 'local-multiplayer',
    title: '2 Player (Local Multiplayer)',
    subtitle: 'Pass & play on 1 device',
    badge: 'Active Ready',
    iconName: 'Users',
  },
  {
    id: 'timed-challenge',
    title: 'Timed Challenge',
    subtitle: 'Rapid move reflex',
    iconName: 'Timer',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedMode,
  onSelectMode,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const renderIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 transition-colors ${
      isSelected
        ? 'text-indigo-600 dark:text-indigo-400'
        : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
    }`;

    switch (iconName) {
      case 'Bot':
        return <Bot className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Users':
        return <Users className={iconClass} />;
      case 'Timer':
        return <Timer className={iconClass} />;
      default:
        return <Gamepad2 className={iconClass} />;
    }
  };

  return (
    <aside className="w-full md:w-60 lg:w-72 xl:w-80 h-full flex flex-col justify-between bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 lg:p-5 select-none transition-colors duration-200 overflow-y-auto">
      {/* Top and Middle sections */}
      <div className="space-y-4 sm:space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-indigo-600/20 flex-shrink-0">
              <span className="font-display">X</span>
              <span className="text-rose-300 text-xs ml-0.5">♥</span>
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-zinc-900 dark:text-white leading-tight">
                Tic Tac Toe
              </h1>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Gaming Dashboard
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden min-w-[40px] min-h-[40px] p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="Close sidebar"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Game Mode Selector List */}
        <div>
          <div className="px-1 mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Game Modes
            </span>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200/60 dark:border-indigo-800/40">
              4 Modes
            </span>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {GAME_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  id={`mode-btn-${mode.id}`}
                  type="button"
                  onClick={() => {
                    onSelectMode(mode.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`relative w-full text-left p-2.5 sm:p-3 rounded-2xl transition-all duration-150 group flex items-start gap-2.5 sm:gap-3 border active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'border-indigo-300 dark:border-indigo-800/80 shadow-xs text-indigo-950 dark:text-indigo-200'
                      : 'bg-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 border-transparent text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-sidebar-mode-bg"
                      className="absolute inset-0 bg-indigo-50/90 dark:bg-indigo-950/50 rounded-2xl -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}

                  <div
                    className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 scale-105'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 group-hover:scale-105'
                    }`}
                  >
                    {renderIcon(mode.iconName, isSelected)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isSelected
                            ? 'text-indigo-950 dark:text-indigo-200'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {mode.title}
                      </span>
                    </div>
                    {mode.subtitle && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {mode.subtitle}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 flex-shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Statistics Section */}
        <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <PlayerStats />
        </div>
      </div>

      {/* User Info & Logout Footer */}
      <div className="pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2 sm:space-y-2.5">
        {currentUser && (
          <button
            id="btn-user-profile"
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full text-left flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:border-indigo-300 dark:hover:border-indigo-800/80 active:scale-[0.98] transition-all cursor-pointer group shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            aria-label={`View profile for ${currentUser.name || currentUser.usernameOrEmail}`}
            title="Click to view player profile"
          >
            {/* Circular initials avatar */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs uppercase flex-shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(currentUser.name, currentUser.usernameOrEmail)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {currentUser.name || currentUser.usernameOrEmail}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                @{currentUser.usernameOrEmail}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:text-zinc-500 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </button>
        )}

        <button
          id="btn-logout"
          type="button"
          onClick={logout}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-800/80 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 active:scale-[0.98] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Profile Details Modal */}
      <AnimatePresence>
        {isProfileModalOpen && currentUser && (
          <UserProfileModal
            user={currentUser}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </aside>
  );
};
