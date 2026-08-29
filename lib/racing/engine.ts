import type { Horse, RaceProgress } from './types';

const HORSE_DATA: Array<Omit<Horse, 'id' | 'odds' | 'winProbability'>> = [
  { name: 'Trueno', jockey: 'M. Ríos', weight: 57, form: '1-3-2-1', color: '#22d3ee', emoji: '🐎' },
  { name: 'Rayo', jockey: 'L. Vega', weight: 55, form: '2-1-1-3', color: '#f59e0b', emoji: '🐎' },
  { name: 'Estrella', jockey: 'C. Luna', weight: 53, form: '3-2-3-2', color: '#ec4899', emoji: '🐎' },
  { name: 'Tornado', jockey: 'R. Solano', weight: 59, form: '1-1-2-1', color: '#10b981', emoji: '🐎' },
  { name: 'Centella', jockey: 'A. Fuego', weight: 54, form: '4-3-2-4', color: '#a78bfa', emoji: '🐎' },
  { name: 'Huracán', jockey: 'J. Niebla', weight: 58, form: '2-2-1-2', color: '#ef4444', emoji: '🐎' },
];

function oddsFromProbability(p: number): number {
  const o = (1 - p) / p;
  return Math.max(1.1, Math.round((o + 1) * 100) / 100);
}

export function generateHorses(): Horse[] {
  const weights = [0.28, 0.22, 0.18, 0.14, 0.1, 0.08];
  const shuffled = [...HORSE_DATA].sort(() => Math.random() - 0.5);
  return shuffled.map((data, i) => {
    const winProbability = weights[i];
    return {
      ...data,
      id: i + 1,
      winProbability,
      odds: oddsFromProbability(winProbability),
    };
  });
}

export function pickWinner(horses: Horse[]): Horse {
  const r = Math.random();
  let cumulative = 0;
  for (const horse of horses) {
    cumulative += horse.winProbability;
    if (r <= cumulative) return horse;
  }
  return horses[horses.length - 1];
}

export function simulateRaceProgress(
  horses: Horse[],
  winner: Horse,
  tickCount: number
): RaceProgress[] {
  const raw = horses.map((horse) => {
    const baseSpeed = horse.winProbability * 0.7 + 0.3;
    const noise = Math.random() * 0.4;
    const winnerBoost = horse.id === winner.id ? 0.15 : 0;
    const rawValue = baseSpeed + noise + winnerBoost;
    const progress = Math.min(100, (rawValue / tickCount) * 100 * (tickCount / 10));
    return { horseId: horse.id, progress: Math.min(100, progress) };
  });
  const sorted = [...raw].sort((a, b) => b.progress - a.progress);
  const positions = new Map<number, number>();
  sorted.forEach((p, i) => positions.set(p.horseId, i + 1));
  return raw.map((p) => ({ ...p, position: positions.get(p.horseId) ?? 0 }));
}
