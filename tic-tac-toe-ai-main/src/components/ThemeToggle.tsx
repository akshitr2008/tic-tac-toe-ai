import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeToggleProps {
  id?: string;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ id = 'theme-toggle-btn', className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const labelText = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={labelText}
      title={labelText}
      className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 border cursor-pointer select-none active:scale-95 ${
        isDark
          ? 'bg-zinc-800/90 hover:bg-zinc-700 text-amber-300 border-zinc-700 shadow-xs'
          : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200 shadow-xs'
      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="dark-sun"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="inline-flex items-center gap-1.5"
          >
            <span className="text-sm leading-none" aria-hidden="true">☀️</span>
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200 hidden sm:inline">Light</span>
          </motion.div>
        ) : (
          <motion.div
            key="light-moon"
            initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="inline-flex items-center gap-1.5"
          >
            <span className="text-sm leading-none" aria-hidden="true">🌙</span>
            <Moon className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-zinc-700 hidden sm:inline">Dark</span>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">{labelText}</span>
    </button>
  );
};