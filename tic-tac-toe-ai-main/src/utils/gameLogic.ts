import { PlayerSymbol, WinningLine } from '../types';

export const WINNING_COMBOS: [number, number, number][] = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diagonal top-left to bot-right
  [2, 4, 6], // Diagonal top-right to bot-left
];

/**
 * Check if the board has a winner or is a draw.
 */
export const checkWinner = (squares: (PlayerSymbol | null)[]): {
  winner: PlayerSymbol | 'draw' | null;
  line: WinningLine;
} => {
  for (let i = 0; i < WINNING_COMBOS.length; i++) {
    const [a, b, c] = WINNING_COMBOS[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }

  // Check if all 9 cells are filled and nobody wins
  const isFull = squares.every((cell) => cell !== null);
  if (isFull) {
    return { winner: 'draw', line: null };
  }

  return { winner: null, line: null };
};

/**
 * Minimax recursive algorithm to evaluate board state.
 *
 * Computer maximizes score for '♥' (+10).
 * Human minimizes score for 'X' (-10).
 * Depth penalization ensures the AI chooses the quickest path to victory or slowest path to defeat.
 */
function minimax(
  board: (PlayerSymbol | null)[],
  depth: number,
  isMaximizing: boolean
): number {
  const result = checkWinner(board);
  if (result.winner === '♥') {
    return 10 - depth;
  }
  if (result.winner === 'X') {
    return depth - 10;
  }
  if (result.winner === 'draw') {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = '♥';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(bestScore, score);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(bestScore, score);
      }
    }
    return bestScore;
  }
}

/**
 * Finds the optimal move for the Computer ('♥') using the Minimax algorithm.
 */
export function getBestMoveMinimax(board: (PlayerSymbol | null)[]): number {
  let bestScore = -Infinity;
  let bestMove = -1;

  // Evaluate every empty cell and pick the one that yields the maximum minimax score
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = '♥';
      const score = minimax(board, 0, false);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}
