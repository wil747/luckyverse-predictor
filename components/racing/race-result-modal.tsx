'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy, X, Crown, Medal, Coins, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Horse, RaceProgress } from '@/lib/racing/types';

type JackpotWinner = {
  username: string;
  prize: number;
};

type RaceResultModalProps = {
  horses: Horse[];
  progress: RaceProgress[];
  won: boolean;
  payout: number;
  bet: number;
  raceNumber: number;
  jackpotWinner: JackpotWinner | null;
  onClose: () => void;
  onNextRace: () => void;
};

const AUTO_DISMISS_MS = 5000;

export function RaceResultModal({
  horses,
  progress,
  won,
  payout,
  bet,
  raceNumber,
  jackpotWinner,
  onClose,
  onNextRace,
}: RaceResultModalProps) {
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const podium = useMemo(() => {
    if (progress.length === 0) return [];
    const sorted = [...progress].sort((a, b) => b.progress - a.progress);
    return sorted.slice(0, 3).map((p) => ({
      horse: horses.find((h) => h.id === p.horseId),
      position: p.position,
    }));
  }, [horses, progress]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      onNextRace();
    }, 300);
  };

  useEffect(() => {
    timerRef.current = setTimeout(handleClose, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const medalColors = [
    'border-accent/50 bg-accent/10',
    'border-muted-foreground/40 bg-secondary/60',
    'border-orange-600/40 bg-orange-600/10',
  ];
  const positionLabels = ['1st', '2nd', '3rd'];
  const positionIcons = [
    <Crown key="1" className="h-4 w-4 text-accent" />,
    <Medal key="2" className="h-4 w-4 text-muted-foreground" />,
    <Medal key="3" className="h-4 w-4 text-orange-500" />,
  ];

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

      <div
        className={cn(
          'relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-card animate-slide-up',
          closing && 'opacity-0 transition-opacity duration-300'
        )}
      >
        {/* Auto-dismiss progress bar */}
        <div className="absolute left-0 top-0 h-0.5 w-full bg-primary/20">
          <div
            className="h-full bg-primary/60 transition-all ease-linear"
            style={{ width: '100%', transition: `width ${AUTO_DISMISS_MS}ms linear` }}
            ref={(el) => {
              if (el) requestAnimationFrame(() => { el.style.width = '0%'; });
            }}
          />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 pt-7">
          {/* Header */}
          <div className="mb-4 text-center">
            <div
              className={cn(
                'mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl',
                won ? 'bg-primary/15 glow-green' : 'bg-secondary/40'
              )}
            >
              {won ? (
                <Trophy className="h-7 w-7 text-accent text-glow-gold" />
              ) : (
                <TrendingDown className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <h2
              className={cn(
                'text-xl font-extrabold tracking-tight',
                won ? 'text-primary text-glow-green' : 'text-foreground'
              )}
            >
              {won ? '¡Ganaste!' : 'Carrera Finalizada'}
            </h2>
            <p className="text-xs text-muted-foreground">Carrera #{raceNumber}</p>
          </div>

          {/* Podium */}
          <div className="mb-4 space-y-2">
            {podium.map((entry, i) => {
              if (!entry.horse) return null;
              return (
                <div
                  key={entry.horse.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 animate-slide-up',
                    medalColors[i]
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/60">
                    {positionIcons[i]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {entry.horse.emoji} {entry.horse.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {positionLabels[i]} · {entry.horse.jockey}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">
                    {entry.horse.odds.toFixed(1)}x
                  </span>
                </div>
              );
            })}
          </div>

          {/* Payout */}
          <div
            className={cn(
              'mb-4 flex items-center justify-center gap-2 rounded-2xl px-4 py-3',
              won ? 'bg-primary/10' : 'bg-secondary/40'
            )}
          >
            {won ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <Coins className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={cn(
                'text-2xl font-extrabold tabular-nums',
                won ? 'text-primary text-glow-green' : 'text-muted-foreground'
              )}
            >
              {won ? `+${payout.toLocaleString('es')}` : `-${bet.toLocaleString('es')}`} GC
            </span>
          </div>

          {/* Jackpot Winner Section */}
          {jackpotWinner && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/15 to-accent/5">
              <div className="flex items-center gap-2 px-4 pt-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent text-glow-gold">
                  ¡Jackpot Ganador!
                </span>
              </div>
              <div className="flex items-center justify-between px-4 pb-3 pt-1.5">
                <span className="text-sm font-bold text-foreground">
                  {jackpotWinner.username}
                </span>
                <span className="text-lg font-extrabold text-accent text-glow-gold tabular-nums">
                  {jackpotWinner.prize.toLocaleString('es')} GC
                </span>
              </div>
            </div>
          )}

          {/* Continue button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 glow-green"
          >
            Siguiente Carrera
          </button>
        </div>
      </div>
    </div>
  );
}
