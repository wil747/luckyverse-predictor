'use client';

import { Trophy, Volume2 } from 'lucide-react';

type StartScreenProps = {
  onEnter: () => void;
};

export function StartScreen({ onEnter }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-4 max-w-lg rounded-2xl border border-border/50 bg-card/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
          <Trophy className="h-10 w-10 animate-bounce" />
        </div>

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground">
          Simulador Luckyverse Racing
        </h1>

        <p className="mb-8 text-muted-foreground">
          Bienvenido a la simulación interactiva. Prepárate para poner a prueba tus predicciones y vivir la emoción de la carrera al máximo.
        </p>

        <button
          onClick={onEnter}
          className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/25 active:scale-[0.98]"
        >
          <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-shine" />
          <span className="flex items-center gap-2 text-lg">
            <Volume2 className="h-5 w-5" />
            Entrar a la Experiencia
          </span>
        </button>
      </div>
    </div>
  );
}
