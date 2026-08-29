'use client';

import { Minus, Plus, Coins, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Horse } from '@/lib/racing/types';

type BetPanelProps = {
  selectedHorse: Horse | null;
  betAmount: number;
  balance: number;
  phase: 'betting' | 'racing' | 'result';
  countdown: number;
  isSpecialRace: boolean;
  onBetChange: (amount: number) => void;
  onPlaceBet: () => void;
  onStartRace: () => void;
};

const QUICK_BETS = [50, 100, 250, 500];

export function BetPanel({
  selectedHorse,
  betAmount,
  balance,
  phase,
  countdown,
  isSpecialRace,
  onBetChange,
  onPlaceBet,
  onStartRace,
}: BetPanelProps) {
  const effectiveOdds = selectedHorse
    ? isSpecialRace
      ? selectedHorse.odds * 2
      : selectedHorse.odds
    : 0;
  const potentialPayout = selectedHorse
    ? Math.round(betAmount * effectiveOdds)
    : 0;
  const canBet = phase === 'betting' && selectedHorse && betAmount > 0 && betAmount <= balance;
  const canRace = phase === 'betting' && countdown === 0 && selectedHorse;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Tu Apuesta
        </h3>
        {selectedHorse && (
          <span className="text-xs font-medium text-muted-foreground">
            {selectedHorse.emoji} {selectedHorse.name}
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl border-border/60 bg-secondary/40"
          onClick={() => onBetChange(Math.max(0, betAmount - 50))}
          disabled={phase !== 'betting'}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-background px-3">
          <Coins className="h-4 w-4 text-accent" />
          <input
            type="number"
            value={betAmount || ''}
            placeholder="0"
            disabled={phase !== 'betting'}
            onChange={(e) => onBetChange(Math.max(0, Number(e.target.value)))}
            className="w-full bg-transparent text-center text-lg font-bold text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs font-medium text-muted-foreground">GC</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl border-border/60 bg-secondary/40"
          onClick={() => onBetChange(Math.min(balance, betAmount + 50))}
          disabled={phase !== 'betting'}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-3 flex gap-2">
        {QUICK_BETS.map((amt) => (
          <button
            key={amt}
            type="button"
            disabled={phase !== 'betting' || amt > balance}
            onClick={() => onBetChange(amt)}
            className={cn(
              'flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors',
              betAmount === amt
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground'
            )}
          >
            {amt}
          </button>
        ))}
      </div>

      {selectedHorse && betAmount > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2">
          <span className="text-xs text-muted-foreground">Ganancia potencial</span>
          <span className="text-base font-extrabold text-accent text-glow-gold tabular-nums">
            +{potentialPayout.toLocaleString('es')} GC
          </span>
        </div>
      )}

      {phase === 'betting' ? (
        <Button
          onClick={canRace ? onStartRace : onPlaceBet}
          disabled={!canBet && !canRace}
          className={cn(
            'w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider',
            'bg-primary text-primary-foreground hover:bg-primary/90 glow-green'
          )}
        >
          {selectedHorse
            ? countdown > 0
              ? `Confirmar Apuesta · ${countdown}s`
              : 'Iniciar Carrera'
            : 'Selecciona un Caballo'}
        </Button>
      ) : phase === 'racing' ? (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 py-3 text-sm font-bold uppercase tracking-wider text-primary">
          <Flag className="h-4 w-4 animate-pulse" />
          Carrera en Curso
        </div>
      ) : (
        <div className="flex w-full items-center justify-center rounded-xl border border-border/60 bg-secondary/30 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Resultado
        </div>
      )}
    </div>
  );
}
