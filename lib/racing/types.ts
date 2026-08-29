export type Horse = {
  id: number;
  name: string;
  jockey: string;
  weight: number;
  form: string;
  odds: number;
  winProbability: number;
  color: string;
  emoji: string;
};

export type RacePhase = 'betting' | 'racing' | 'result';

export type RaceResult = {
  raceNumber: number;
  winner: Horse;
  payout: number;
  bet: number;
  selectedHorseId: number | null;
  timestamp: number;
};

export type RaceProgress = {
  horseId: number;
  progress: number;
  position: number;
};
