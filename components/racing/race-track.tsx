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
    <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      {/* HUD de Transmisión en Vivo Estilo Casino / TV */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", phase === 'racing' ? "bg-red-500" : "bg-amber-500")} />
            <span className={cn("relative inline-flex h-3 w-3 rounded-full", phase === 'racing' ? "bg-red-600" : "bg-amber-500")} />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-200">
            {phase === 'racing' ? '🔴 TRANSMISIÓN EN VIVO • PISTA VIRTUAL' : phase === 'result' ? '🏁 FINAL DE CARRERA' : '⏳ EN ESPERA DE PARTIDA'}
          </span>
        </div>
        <div className="rounded-lg bg-black/60 px-3 py-1 border border-white/10 text-xs font-mono font-bold text-emerald-400 shadow-inner">
          {phase === 'racing' ? 'CARRERA ACTIVA' : phase === 'result' ? 'RESULTADO OFICIAL' : 'APERTURA DE GATERAS'}
        </div>
      </div>

      {/* Contenedor de la Pista con Piel de Neón y Alta Definición */}
      <div className="relative rounded-xl border border-white/10 bg-slate-900/80 p-3 shadow-inner backdrop-blur-md">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

        <div className="space-y-2 relative z-10">
          {horses.map((horse) => {
            const prog = progress.find((p) => p.horseId === horse.id);
            const pct = prog?.progress ?? 0;
            const pos = positions.get(horse.id) ?? 0;
            const isLeader = pos === 1 && phase !== 'betting';

            return (
              <div key={horse.id} className="relative group">
                <div className="flex items-center gap-3">
                  {/* Posición / Número del caballo */}
                  <div className="flex w-6 shrink-0 justify-center items-center rounded-md bg-black/40 border border-white/10 py-1">
                    <span
                      className={cn(
                        'text-xs font-extrabold tabular-nums',
                        isLeader ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-400'
                      )}
                    >
                      {phase === 'betting' ? horse.id : pos}
                    </span>
                  </div>

                  {/* Pista / Carril de carrera */}
                  <div className="relative h-9 flex-1 overflow-hidden rounded-xl bg-black/60 border border-white/5 shadow-inner">
                    {/* Líneas divisorias de carril simuladas */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                    {/* Barra de progreso con resplandor de color del caballo */}
                    <div
                      className="absolute left-0 top-0 flex h-full items-center transition-all duration-300 ease-out rounded-r-lg"
                      style={{ 
                        width: `${Math.max(10, pct)}%`, 
                        backgroundColor: `${horse.color}25`,
                        boxShadow: `inset 0 0 15px ${horse.color}44`
                      }}
                    >
                      {/* Avatar / Emoji del corredor en movimiento */}
                      <span
                        className={cn(
                          'absolute right-1 text-xl transition-transform',
                          phase === 'racing' && 'animate-bounce'
                        )}
                        style={{ filter: `drop-shadow(0 0 6px ${horse.color})` }}
                      >
                        {horse.emoji}
                      </span>
                    </div>

                    {/* Meta / Línea final */}
                    <div className="absolute right-0 top-0 h-full w-1 bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,1)]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
