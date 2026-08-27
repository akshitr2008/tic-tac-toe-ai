import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Lock, User as UserIcon, Mail, Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Status & error handling
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(loginIdentifier, loginPassword);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.message || 'Login failed. Please check your credentials.');
      }
    }, 250);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = signup(
        signupName,
        signupIdentifier,
        signupPassword,
        signupConfirmPassword
      );
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.message || 'Signup failed.');
      } else {
        setSuccessMsg('Account created successfully! Entering the game arena...');
      }
    }, 250);
  };

  const fillDemoAccount = () => {
    setLoginIdentifier('alex');
    setLoginPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-x-hidden">
      {/* Top Header Bar with Theme Toggle */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-indigo-500/20 flex-shrink-0">
            <span className="font-display">X</span>
            <span className="text-rose-300 text-xs sm:text-sm ml-0.5">♥</span>
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white">
            Tic Tac Toe
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle id="auth-theme-toggle" />
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="w-full max-w-md mx-auto px-4 py-4 sm:py-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="w-full bg-white dark:bg-zinc-900/90 rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-8 md:p-9 shadow-xl shadow-zinc-200/50 dark:shadow-black/40 backdrop-blur-sm"
        >
          {/* Brand Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4 shadow-xs">
              <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display mb-1.5 sm:mb-2">
              Tic Tac Toe
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              Challenge yourself. Challenge your friends.
            </p>
          </div>

          {/* Navigation Tabs (Existing User / New User) */}
          <div className="relative grid grid-cols-2 p-1 mb-5 sm:mb-6 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60">
            <button
              id="tab-existing-user"
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`relative z-10 min-h-[42px] py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                activeTab === 'login'
                  ? 'text-indigo-600 dark:text-indigo-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {activeTab === 'login' && (
                <motion.div
                  layoutId="active-auth-tab-pill"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              Existing User
            </button>
            <button
              id="tab-new-user"
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`relative z-10 min-h-[42px] py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                activeTab === 'signup'
                  ? 'text-indigo-600 dark:text-indigo-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {activeTab === 'signup' && (
                <motion.div
                  layoutId="active-auth-tab-pill"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              New User
            </button>
          </div>

          {/* Error / Feedback Banners */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                key="error-banner"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.18 }}
                id="auth-error-banner"
                className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="leading-snug">{errorMsg}</div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                key="success-banner"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.18 }}
                id="auth-success-banner"
                className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5 overflow-hidden"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div className="leading-snug">{successMsg}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Tab 1: Existing User (Login) */}
            {activeTab === 'login' ? (
              <motion.form
                key="login-form-view"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onSubmit={handleLoginSubmit}
                className="space-y-3.5 sm:space-y-4"
                id="login-form"
              >
                <div>
                  <label
                    htmlFor="login-username"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1 sm:mb-1.5"
                  >
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Enter your username or email"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1 sm:mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-[44px] pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-login"
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[46px] py-2.5 sm:py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] hover:shadow-indigo-600/35"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>

                {/* Demo auto-fill helper */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    className="min-h-[40px] text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Quick fill demo account (alex / password123)
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Tab 2: New User (Signup) */
              <motion.form
                key="signup-form-view"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onSubmit={handleSignupSubmit}
                className="space-y-3 sm:space-y-3.5"
                id="signup-form"
              >
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1"
                  >
                    Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-username"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1"
                  >
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-username"
                      type="text"
                      required
                      value={signupIdentifier}
                      onChange={(e) => setSignupIdentifier(e.target.value)}
                      placeholder="Choose a username or enter email"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full min-h-[44px] pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-3 min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-confirm-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-signup"
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[46px] py-2.5 sm:py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] hover:shadow-indigo-600/35"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Signup'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        College Project Edition • Modern Web Application
      </footer>
    </div>
  );
};
