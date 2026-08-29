'use client';

import { History, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RaceResult } from '@/lib/racing/types';

type RaceHistoryProps = {
  history: RaceResult[];
};

export function RaceHistory({ history }: RaceHistoryProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Historial
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {history.length} {history.length === 1 ? 'carrera' : 'carreras'}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Trophy className="mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            Aún no hay carreras. ¡Coloca tu primera apuesta!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((result) => (
            <div
              key={result.raceNumber}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 p-2.5 animate-slide-up"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
                #{result.raceNumber}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">
                    {result.winner.emoji} {result.winner.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @ {result.winner.odds.toFixed(2)}x
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {result.selectedHorseId === result.winner.id
                    ? `Ganaste +${result.payout.toLocaleString('es')} GC`
                    : result.selectedHorseId
                      ? 'Apuesta perdida'
                      : 'Sin apuesta'}
                </p>
              </div>
              <div
                className={cn(
                  'shrink-0 rounded-lg px-2 py-1 text-xs font-bold',
                  result.selectedHorseId === result.winner.id
                    ? 'bg-primary/15 text-primary'
                    : 'bg-secondary/40 text-muted-foreground'
                )}
              >
                {result.selectedHorseId === result.winner.id
                  ? `+${result.payout.toLocaleString('es')}`
                  : result.bet > 0
                    ? `-${result.bet}`
                    : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
