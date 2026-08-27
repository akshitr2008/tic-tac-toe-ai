export type PlayerSymbol = 'X' | '♥';

export type GameModeId = 
  | 'vs-computer-easy'
  | 'vs-computer-hard'
  | 'local-multiplayer'
  | 'timed-challenge';

export interface GameMode {
  id: GameModeId;
  title: string;
  subtitle?: string;
  badge?: string;
  iconName: string;
}

export interface User {
  id: string;
  name: string;
  usernameOrEmail: string;
  password?: string;
  createdAt: string;
}

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // percentage (e.g. 75 or 0)
}

export type WinningLine = [number, number, number] | null;

export interface GameState {
  board: (PlayerSymbol | null)[];
  currentTurn: PlayerSymbol;
  winner: PlayerSymbol | 'draw' | null;
  winningLine: WinningLine;
  isGameOver: boolean;
  selectedMode: GameModeId;
  moveCount: number;
}
