import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { GameBoard } from './components/GameBoard';
import { GameModeId } from './types';
import { motion, AnimatePresence } from 'motion/react';

const GameDashboard: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameModeId>('local-multiplayer');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen w-full flex bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 overflow-x-hidden"
    >
      {/* Desktop & Tablet Sidebar (768px and above) */}
      <div className="hidden md:block h-screen sticky top-0 z-20 flex-shrink-0">
        <Sidebar
          selectedMode={selectedMode}
          onSelectMode={(mode) => setSelectedMode(mode)}
        />
      </div>

      {/* Mobile Collapsible Drawer Sidebar (below 768px) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            {/* Slide-out drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-72 sm:w-80 max-w-[85vw] h-full shadow-2xl overflow-hidden"
            >
              <Sidebar
                selectedMode={selectedMode}
                onSelectMode={(mode) => {
                  setSelectedMode(mode);
                  setIsMobileSidebarOpen(false);
                }}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 flex flex-col justify-center items-center px-3 py-4 sm:p-6 md:p-8 overflow-y-auto">
          <GameBoard
            selectedMode={selectedMode}
            onChangeMode={() => {
              // Open mobile drawer if on mobile view
              setIsMobileSidebarOpen(true);
            }}
          />
        </main>

        <footer className="py-2.5 px-4 sm:px-6 text-center text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xs select-none">
          College Project Edition • Player 1 (X) vs Player 2 (♥)
        </footer>
      </div>
    </motion.div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="auth-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.22 }}
          className="w-full min-h-screen"
        >
          <AuthScreen />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full min-h-screen"
        >
          <GameDashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
