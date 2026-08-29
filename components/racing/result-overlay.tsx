'use client';

import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Horse } from '@/lib/racing/types';

type ResultOverlayProps = {
  winner: Horse;
  won: boolean;
  payout: number;
  bet: number;
  onNextRace: () => void;
};

export function ResultOverlay({ winner, won, payout, bet, onNextRace }: ResultOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {won && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#22c55e', '#f59e0b', '#22d3ee', '#ec4899'][i % 4],
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative mx-4 w-full max-w-sm animate-slide-up rounded-3xl border border-border/60 bg-card p-6 text-center">
        <div
          className={cn(
            'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl',
            won ? 'bg-primary/15 glow-green' : 'bg-secondary/40'
          )}
        >
          {won ? (
            <Trophy className="h-8 w-8 text-accent text-glow-gold" />
          ) : (
            <TrendingDown className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <h2
          className={cn(
            'text-2xl font-extrabold tracking-tight',
            won ? 'text-primary text-glow-green' : 'text-foreground'
          )}
        >
          {won ? '¡Ganaste!' : 'Mejor suerte la próxima'}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Ganador: <span className="font-bold text-foreground">{winner.emoji} {winner.name}</span>
        </p>

        <div className="my-4 flex items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-4 py-3">
          {won ? (
            <TrendingUp className="h-5 w-5 text-primary" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
          <span
            className={cn(
              'text-2xl font-extrabold tabular-nums',
              won ? 'text-primary text-glow-green' : 'text-destructive'
            )}
          >
            {won ? `+${payout.toLocaleString('es')}` : `-${bet.toLocaleString('es')}`} GC
          </span>
        </div>

        <button
          type="button"
          onClick={onNextRace}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 glow-green"
        >
          Siguiente Carrera
        </button>
      </div>
    </div>
  );
}
