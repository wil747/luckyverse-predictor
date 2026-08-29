'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Horse } from '@/lib/racing/types';

type HorseCardProps = {
  horse: Horse;
  selected: boolean;
  disabled: boolean;
  onSelect: (id: number) => void;
};

export function HorseCard({ horse, selected, disabled, onSelect }: HorseCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(horse.id)}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200',
        'bg-gradient-to-br from-card to-secondary/40',
        selected
          ? 'border-primary glow-green scale-[1.01]'
          : 'border-border/60 hover:border-primary/40',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${horse.color}22`, boxShadow: `0 0 12px -4px ${horse.color}66` }}
        >
          <span style={{ filter: `drop-shadow(0 0 4px ${horse.color}88)` }}>
            {horse.emoji}
          </span>
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-background"
            style={{ backgroundColor: horse.color }}
          >
            {horse.id}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-bold text-foreground">
              {horse.name}
            </h3>
            <span className="shrink-0 text-lg font-extrabold text-accent text-glow-gold tabular-nums">
              {horse.odds.toFixed(2)}x
            </span>
          </div>

          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] text-muted-foreground">
              <span className="text-muted-foreground/80">Jockey:</span>{' '}
              <span className="text-foreground/80">{horse.jockey}</span>
              {' · '}
              <span className="text-muted-foreground/80">{horse.weight}kg</span>
              {' · '}
              <span className="text-foreground/80">{horse.form}</span>
            </p>
            <span className="shrink-0 text-[11px] font-semibold text-primary tabular-nums">
              {Math.round(horse.winProbability * 100)}%
            </span>
          </div>

          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${horse.winProbability * 100}%`,
                backgroundColor: horse.color,
              }}
            />
          </div>
        </div>

        {selected && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}
