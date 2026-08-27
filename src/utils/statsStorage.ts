import { UserStats } from '../types';

const STATS_KEY_PREFIX = 'tictactoe_stats_';

export const STATS_UPDATED_EVENT = 'tictactoe_stats_updated';

export const getInitialStats = (): UserStats => ({
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
});

/**
 * Derives a clean, consistent localStorage key for a specific user.
 */
export const getUserStatsKey = (usernameOrEmail: string): string => {
  const normalized = usernameOrEmail.trim().toLowerCase();
  return `${STATS_KEY_PREFIX}${normalized}`;
};

/**
 * Calculates win rate as (Wins / Games Played) * 100.
 * Returns 0 if no games have been played.
 */
export const calculateWinRate = (wins: number, gamesPlayed: number): number => {
  if (gamesPlayed <= 0) return 0;
  const rate = (wins / gamesPlayed) * 100;
  return Math.round(rate * 10) / 10; // Round to 1 decimal place
};

/**
 * Formats a win rate number into a user-friendly string (e.g., "75%", "33.3%", or "0%").
 */
export const formatWinRate = (winRate: number): string => {
  if (!winRate || winRate <= 0) return '0%';
  if (winRate % 1 === 0) return `${winRate}%`;
  return `${winRate.toFixed(1)}%`;
};

/**
 * Retrieves player statistics for a specific user from localStorage.
 */
export const getUserStats = (usernameOrEmail: string): UserStats => {
  if (!usernameOrEmail) return getInitialStats();

  try {
    const key = getUserStatsKey(usernameOrEmail);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const gamesPlayed = Number(parsed.gamesPlayed) || 0;
      const wins = Number(parsed.wins) || 0;
      const losses = Number(parsed.losses) || 0;
      const draws = Number(parsed.draws) || 0;
      const winRate = calculateWinRate(wins, gamesPlayed);

      return {
        gamesPlayed,
        wins,
        losses,
        draws,
        winRate,
      };
    }
  } catch {
    // Return initial stats on storage error
  }

  return getInitialStats();
};

/**
 * Records the outcome of a completed game for a user and emits a notification event.
 */
export const recordGameResult = (
  usernameOrEmail: string,
  result: 'win' | 'loss' | 'draw'
): UserStats => {
  if (!usernameOrEmail) return getInitialStats();

  const current = getUserStats(usernameOrEmail);
  const newGamesPlayed = current.gamesPlayed + 1;
  const newWins = result === 'win' ? current.wins + 1 : current.wins;
  const newLosses = result === 'loss' ? current.losses + 1 : current.losses;
  const newDraws = result === 'draw' ? current.draws + 1 : current.draws;
  const newWinRate = calculateWinRate(newWins, newGamesPlayed);

  const updatedStats: UserStats = {
    gamesPlayed: newGamesPlayed,
    wins: newWins,
    losses: newLosses,
    draws: newDraws,
    winRate: newWinRate,
  };

  try {
    const key = getUserStatsKey(usernameOrEmail);
    localStorage.setItem(key, JSON.stringify(updatedStats));
    window.dispatchEvent(new CustomEvent(STATS_UPDATED_EVENT, { detail: { usernameOrEmail, stats: updatedStats } }));
  } catch {
    // Fail gracefully on storage write error
  }

  return updatedStats;
};

/**
 * Resets the statistics for the specified user to zero.
 */
export const resetUserStats = (usernameOrEmail: string): UserStats => {
  if (!usernameOrEmail) return getInitialStats();

  const initial = getInitialStats();
  try {
    const key = getUserStatsKey(usernameOrEmail);
    localStorage.setItem(key, JSON.stringify(initial));
    window.dispatchEvent(new CustomEvent(STATS_UPDATED_EVENT, { detail: { usernameOrEmail, stats: initial } }));
  } catch {
    // Fail gracefully on storage write error
  }

  return initial;
};
