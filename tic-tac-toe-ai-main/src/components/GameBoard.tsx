import React, { useState, useEffect, useRef } from 'react';
import { PlayerSymbol, WinningLine, GameModeId } from '../types';
import { RotateCcw, Sparkles, Timer as TimerIcon } from 'lucide-react';
import { GameResultModal } from './GameResultModal';
import { GAME_MODES } from './Sidebar';
import { checkWinner, getBestMoveMinimax } from '../utils/gameLogic';
import { useAuth } from '../context/AuthContext';
import { recordGameResult } from '../utils/statsStorage';
import { motion, AnimatePresence } from 'motion/react';

interface GameBoardProps {
  selectedMode: GameModeId;
  onChangeMode?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ selectedMode, onChangeMode }) => {
  const { currentUser } = useAuth();
  const [board, setBoard] = useState<(PlayerSymbol | null)[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>('X');
  const [winner, setWinner] = useState<PlayerSymbol | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<WinningLine>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);

  const computerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRecordedResultRef = useRef<boolean>(false);

  const handleResetGame = () => {
    if (computerTimeoutRef.current) {
      clearTimeout(computerTimeoutRef.current);
      computerTimeoutRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    hasRecordedResultRef.current = false;
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setWinner(null);
    setWinningLine(null);
    setMoveCount(0);
    setShowResultModal(false);
    setIsComputerThinking(false);
    setTimeLeft(10);
  };

  // Record stats exactly once when a game finishes with a winner or draw
  useEffect(() => {
    if (winner && currentUser?.usernameOrEmail && !hasRecordedResultRef.current) {
      hasRecordedResultRef.current = true;
      if (winner === 'X') {
        recordGameResult(currentUser.usernameOrEmail, 'win');
      } else if (winner === '♥') {
        recordGameResult(currentUser.usernameOrEmail, 'loss');
      } else if (winner === 'draw') {
        recordGameResult(currentUser.usernameOrEmail, 'draw');
      }
    }
  }, [winner, currentUser]);

  // Reset board whenever the game mode changes so modes remain independent
  useEffect(() => {
    handleResetGame();
  }, [selectedMode]);

  // Clean up any pending timeouts/intervals on unmount
  useEffect(() => {
    return () => {
      if (computerTimeoutRef.current) {
        clearTimeout(computerTimeoutRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Timer effect for Timed Challenge mode (10 seconds per turn)
  useEffect(() => {
    if (selectedMode !== 'timed-challenge' || winner) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Reset countdown to 10 seconds for the active player's turn
    setTimeLeft(10);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timeout reached 0: Automatically switch to other player without placing a symbol
          setCurrentTurn((current) => (current === 'X' ? '♥' : 'X'));
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [selectedMode, currentTurn, winner]);

  // Effect to trigger Computer move when it's Player 2 (♥)'s turn in vs-computer modes
  useEffect(() => {
    const isComputerMode = selectedMode === 'vs-computer-easy' || selectedMode === 'vs-computer-hard';

    if (isComputerMode && currentTurn === '♥' && !winner) {
      setIsComputerThinking(true);

      computerTimeoutRef.current = setTimeout(() => {
        setBoard((prevBoard) => {
          // Double check there's no winner already
          const preCheck = checkWinner(prevBoard);
          if (preCheck.winner) {
            setIsComputerThinking(false);
            return prevBoard;
          }

          let chosenIndex = -1;

          if (selectedMode === 'vs-computer-hard') {
            // Minimax optimal move
            chosenIndex = getBestMoveMinimax(prevBoard);
          } else {
            // Easy mode: random available cell
            const availableIndices: number[] = [];
            prevBoard.forEach((cell, idx) => {
              if (cell === null) {
                availableIndices.push(idx);
              }
            });

            if (availableIndices.length > 0) {
              chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            }
          }

          if (chosenIndex === -1 || prevBoard[chosenIndex] !== null) {
            setIsComputerThinking(false);
            return prevBoard;
          }

          const nextBoard = [...prevBoard];
          nextBoard[chosenIndex] = '♥';

          setMoveCount((prev) => prev + 1);

          const result = checkWinner(nextBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setShowResultModal(true);
          } else {
            setCurrentTurn('X');
          }

          setIsComputerThinking(false);
          return nextBoard;
        });
      }, 650); // short natural thinking delay (500-800ms)

      return () => {
        if (computerTimeoutRef.current) {
          clearTimeout(computerTimeoutRef.current);
          computerTimeoutRef.current = null;
        }
      };
    }
  }, [currentTurn, selectedMode, winner]);

  const handleCellClick = (index: number) => {
    // Only empty cells can be selected, and disabled while computer is thinking or if game ended
    if (board[index] || winner || isComputerThinking) {
      return;
    }

    // In vs Computer mode, human can only move when it's X's turn
    if (selectedMode.startsWith('vs-computer') && currentTurn !== 'X') {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = currentTurn;
    const nextMoveCount = moveCount + 1;

    setBoard(nextBoard);
    setMoveCount(nextMoveCount);

    const check = checkWinner(nextBoard);
    if (check.winner) {
      setWinner(check.winner);
      setWinningLine(check.line);
      setShowResultModal(true);
    } else {
      // Alternate turns: Player 1 (X) <-> Player 2 (♥)
      setCurrentTurn((prev) => (prev === 'X' ? '♥' : 'X'));
    }
  };

  // Find info about selected mode
  const currentModeInfo = GAME_MODES.find((m) => m.id === selectedMode) || GAME_MODES[2];

  // Text representation for current turn above the board
  const getTurnStatusText = () => {
    if (winner) {
      if (winner === 'draw') return "It's a Draw!";
      return winner === 'X' ? 'Winner — Player 1 (X)' : 'Winner — Player 2 (♥)';
    }

    if (isComputerThinking) {
      return 'Computer is thinking...';
    }

    if (selectedMode.startsWith('vs-computer')) {
      return currentTurn === 'X' ? 'Your Turn — X' : 'Computer is thinking...';
    }

    return currentTurn === 'X' ? 'Player 1 Turn — X' : 'Player 2 Turn — ♥';
  };

  const isVsComputer = selectedMode.startsWith('vs-computer');

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 max-w-4xl mx-auto">
      {/* Selected Mode Banner & Helper */}
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          Mode: {currentModeInfo.title}
        </span>
      </div>

      {/* Main Game Card */}
      <div className="w-full max-w-[340px] sm:max-w-md lg:max-w-[420px] bg-white dark:bg-zinc-900/90 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 p-3.5 sm:p-6 md:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 transition-colors duration-200">
        {/* Turn Status Display above Board */}
        <div className="text-center mb-3 sm:mb-4">
          <div
            id="turn-status-text"
            className={`text-lg sm:text-2xl font-extrabold font-display tracking-tight transition-all duration-200 ${
              winner
                ? winner === 'draw'
                  ? 'text-amber-500'
                  : winner === 'X'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-rose-500 dark:text-rose-400'
                : isComputerThinking
                ? 'text-amber-500 dark:text-amber-400 animate-pulse'
                : currentTurn === 'X'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-rose-500 dark:text-rose-400'
            }`}
          >
            {getTurnStatusText()}
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1 font-medium">
            {selectedMode === 'timed-challenge' ? '10 seconds per turn • 3-in-a-row wins' : '3-in-a-row wins the round'}
          </p>
        </div>

        {/* Timed Challenge Live Timer Display */}
        {selectedMode === 'timed-challenge' && !winner && (
          <div
            id="timed-challenge-timer"
            className={`mb-4 sm:mb-5 p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 ${
              timeLeft <= 3
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 shadow-md shadow-rose-500/20 ring-2 ring-rose-500/30'
                : timeLeft <= 5
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TimerIcon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                    timeLeft <= 3
                      ? 'text-rose-600 dark:text-rose-400 animate-spin'
                      : timeLeft <= 5
                      ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                />
                <span className="text-[11px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {currentTurn === 'X' ? 'Player 1 (X)' : 'Player 2 (♥)'}
                </span>
              </div>

              <div
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold font-mono transition-all duration-200 flex items-center gap-1 ${
                  timeLeft <= 3
                    ? 'bg-rose-600 text-white animate-bounce shadow-xs'
                    : timeLeft <= 5
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <span>Time: {timeLeft}s</span>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 sm:h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeLeft <= 3
                    ? 'bg-rose-500'
                    : timeLeft <= 5
                    ? 'bg-amber-500'
                    : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-1 sm:mt-1.5 text-[10px] sm:text-[11px]">
              <span
                className={`font-semibold transition-colors truncate ${
                  timeLeft <= 3
                    ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                    : timeLeft <= 5
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {timeLeft <= 3 ? '🔥 Hurry! Turn expiring!' : timeLeft <= 5 ? '⚡ 5s warning' : 'Make your move!'}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 font-mono font-medium flex-shrink-0 ml-1">
                {timeLeft}s / 10s
              </span>
            </div>
          </div>
        )}

        {/* Players Indicator Pill Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {/* Player 1 - X */}
          <div
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center justify-between ${
              currentTurn === 'X' && !winner && !isComputerThinking
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 opacity-75'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
                X
              </span>
              <div className="text-left min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {isVsComputer ? 'You' : 'Player 1'}
                </div>
                <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  Symbol: X
                </div>
              </div>
            </div>
            {currentTurn === 'X' && !winner && !isComputerThinking && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping flex-shrink-0" />
            )}
          </div>

          {/* Player 2 - ♥ */}
          <div
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center justify-between ${
              currentTurn === '♥' && !winner
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 shadow-xs ring-2 ring-rose-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 opacity-75'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
                ♥
              </span>
              <div className="text-left min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {isVsComputer ? 'Computer' : 'Player 2'}
                </div>
                <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  Symbol: ♥
                </div>
              </div>
            </div>
            {currentTurn === '♥' && !winner && (
              <span className={`w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 ${isComputerThinking ? 'animate-bounce' : 'animate-ping'}`} />
            )}
          </div>
        </div>

        {/* 3x3 Equal-sized Grid Board */}
        <div
          id="tictactoe-board"
          className="grid grid-cols-3 gap-2 sm:gap-3 w-full aspect-square p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/90 dark:border-zinc-700/60 shadow-inner"
        >
          {board.map((cellValue, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            const isCellDisabled = !!cellValue || !!winner || isComputerThinking;

            return (
              <button
                key={idx}
                id={`cell-${idx}`}
                type="button"
                onClick={() => handleCellClick(idx)}
                disabled={isCellDisabled}
                aria-label={`Cell ${idx + 1}, ${cellValue || 'Empty'}`}
                className={`relative group w-full h-full rounded-xl sm:rounded-2xl flex items-center justify-center font-display font-extrabold text-3xl sm:text-5xl transition-all duration-150 select-none touch-manipulation ${
                  isCellDisabled && !cellValue ? 'cursor-not-allowed opacity-90' : 'cursor-pointer active:scale-95'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  cellValue
                    ? 'bg-white dark:bg-zinc-800 shadow-xs'
                    : 'bg-white/90 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700/70 hover:shadow-md active:bg-zinc-100 dark:active:bg-zinc-700 shadow-xs'
                } ${
                  isWinningCell
                    ? cellValue === 'X'
                      ? 'ring-3 sm:ring-4 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/80 shadow-lg shadow-indigo-500/30'
                      : 'ring-3 sm:ring-4 ring-rose-500 bg-rose-50 dark:bg-rose-950/80 shadow-lg shadow-rose-500/30'
                    : ''
                }`}
              >
                {cellValue === 'X' && (
                  <motion.span
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{
                      scale: isWinningCell ? [1, 1.1, 1] : 1,
                      opacity: 1,
                    }}
                    transition={
                      isWinningCell
                        ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                        : { type: 'spring', stiffness: 500, damping: 25 }
                    }
                    className="text-indigo-600 dark:text-indigo-400 select-none inline-block"
                  >
                    X
                  </motion.span>
                )}
                {cellValue === '♥' && (
                  <motion.span
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{
                      scale: isWinningCell ? [1, 1.1, 1] : 1,
                      opacity: 1,
                    }}
                    transition={
                      isWinningCell
                        ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                        : { type: 'spring', stiffness: 500, damping: 25 }
                    }
                    className="text-rose-500 dark:text-rose-400 select-none inline-block"
                  >
                    ♥
                  </motion.span>
                )}
                {!cellValue && !winner && !isComputerThinking && (
                  <span className="opacity-0 group-hover:opacity-20 text-zinc-400 dark:text-zinc-500 text-xl sm:text-2xl transition-opacity duration-150 pointer-events-none select-none">
                    +
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Board Controls (Reset / Restart Game) */}
        <div className="mt-4 sm:mt-6 flex items-center justify-between gap-2">
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Moves: <span className="font-bold text-zinc-700 dark:text-zinc-300">{moveCount}</span>
          </div>

          <button
            id="btn-reset-board"
            type="button"
            onClick={handleResetGame}
            className="min-h-[44px] py-2 px-3 sm:px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Board</span>
          </button>
        </div>
      </div>

      {/* Result celebration modal */}
      <AnimatePresence>
        {showResultModal && winner && (
          <GameResultModal
            winner={winner}
            onPlayAgain={handleResetGame}
            onChangeMode={() => {
              handleResetGame();
              onChangeMode?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};