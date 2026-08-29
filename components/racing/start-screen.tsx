'use client';

import { Trophy, Volume2 } from 'lucide-react';

type StartScreenProps = {
  onEnter: () => void;
};

export function StartScreen({ onEnter }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-4 w-full max-w-sm animate-slide-up text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 glow-green">
          <Trophy className="h-10 w-10 text-accent text-glow-gold" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome to
          <br />
          <span className="text-accent text-glow-gold">LuckyVerse Racing</span>
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Place your bets, feel the thunder of the track, and chase the jackpot.
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="group mt-8 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] glow-green"
        >
          <Volume2 className="h-5 w-5 transition-transform group-hover:scale-110" />
          Enter Race Track
        </button>

        <p className="mt-4 text-[11px] text-muted-foreground">
          Click to activate sound and enter the race track
        </p>
      </div>
    </div>
  );
}
