import React from 'react';
import { Menu, Gamepad2, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu trigger for below 768px */}
        <button
          id="btn-mobile-menu"
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
          aria-label="Open game modes menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xs">
            <span>X</span>
            <span className="text-rose-300 text-[10px] ml-0.5">♥</span>
          </div>
          <span className="font-display font-extrabold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white">
            Tic Tac Toe
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs lg:text-sm">
          <Gamepad2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="truncate">Challenge yourself. Challenge your friends.</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="truncate max-w-[120px]">{currentUser.name || currentUser.usernameOrEmail}</span>
          </div>
        )}
        <ThemeToggle id="navbar-theme-toggle" />
        <button
          id="btn-navbar-logout"
          type="button"
          onClick={logout}
          title="Logout"
          className="min-h-[40px] px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 active:scale-95 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
