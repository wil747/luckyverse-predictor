'use client';

import { cn } from '@/lib/utils';
import type { Horse, RaceProgress } from '@/lib/racing/types';

type RaceTrackProps = {
  horses: Horse[];
  progress: RaceProgress[];
  phase: 'betting' | 'racing' | 'result';
};

export function RaceTrack({ horses, progress, phase }: RaceTrackProps) {
  const sorted = [...progress].sort((a, b) => b.progress - a.progress);
  const positions = new Map<number, number>();
  sorted.forEach((p, i) => positions.set(p.horseId, i + 1));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-secondary/40 to-background p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Pista
        </span>
        <span className="text-xs font-semibold text-primary">
          {phase === 'racing' ? 'Carrera en curso' : phase === 'result' ? 'Meta' : 'Esperando'}
        </span>
      </div>

      <div className="space-y-1.5">
        {horses.map((horse) => {
          const prog = progress.find((p) => p.horseId === horse.id);
          const pct = prog?.progress ?? 0;
          const pos = positions.get(horse.id) ?? 0;
          const isLeader = pos === 1 && phase !== 'betting';
          return (
            <div key={horse.id} className="relative">
              <div className="flex items-center gap-2">
                <div className="flex w-5 shrink-0 justify-center">
                  <span
                    className={cn(
                      'text-[11px] font-bold tabular-nums',
                      isLeader ? 'text-accent' : 'text-muted-foreground'
                    )}
                  >
                    {phase === 'betting' ? '' : pos}
                  </span>
                </div>
                <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-background/60">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div
                    className="absolute left-0 top-0 flex h-full items-center transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(8, pct)}%`, backgroundColor: `${horse.color}33` }}
                  >
                    <span
                      className={cn(
                        'absolute right-1 text-base',
                        phase === 'racing' && 'animate-gallop'
                      )}
                      style={{ filter: `drop-shadow(0 0 3px ${horse.color})` }}
                    >
                      {horse.emoji}
                    </span>
                  </div>
                  <div className="absolute right-0 top-0 h-full w-0.5 bg-accent/60" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
