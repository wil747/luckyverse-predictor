'use client';

import { Trophy, Wallet, Radio, Volume2, VolumeX } from 'lucide-react';

type RaceHeaderProps = {
  balance: number;
  raceNumber: number;
  countdown: number;
  phase: 'betting' | 'racing' | 'result';
  muted: boolean;
  onToggleMute: () => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function RaceHeader({ balance, raceNumber, countdown, phase, muted, onToggleMute }: RaceHeaderProps) {
  const isRacing = phase === 'racing';
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 glow-green">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-foreground">
              Luckyverse
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
              Racing Predictor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-secondary/80 text-foreground transition-all hover:border-primary/40 hover:bg-secondary active:scale-95"
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4 text-accent" />
            )}
          </button>

          <div className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5">
            <Wallet className="h-3.5 w-3.5 text-accent" />
            <span className="text-sm font-bold text-accent text-glow-gold tabular-nums">
              {balance.toLocaleString('es')} GC
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-md items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-red-500" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
            {isRacing ? 'En Carrera' : 'En Vivo'}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Carrera #{raceNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1">
          <Radio className={`h-3.5 w-3.5 ${isRacing ? 'text-primary' : 'text-accent'}`} />
          <span
            className={`text-sm font-bold tabular-nums ${
              countdown <= 10 && !isRacing ? 'text-red-400 animate-pulse' : 'text-foreground'
            }`}
          >
            {isRacing ? 'EN CURSO' : formatTime(countdown)}
          </span>
        </div>
      </div>
    </header>
  );
}
