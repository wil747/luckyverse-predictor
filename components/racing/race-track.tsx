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

  const getHorseImage = (id: number) => {
    const mapping: Record<number, string> = {
      1: '/imagen_1_caballo-removebg-preview.png',
      2: '/imagen_2_caballo-removebg-preview.png',
      3: '/imagen 3 caballo.png',
      4: '/imagen_4_caballo-removebg-preview.png',
      5: '/imagen_5_caballo-removebg-preview.png',
      6: '/imagen_6_caballo-removebg-preview.png',
      7: '/imagen_7_caballo-removebg-preview.png',
      8: '/imagen_8_caballo-removebg-preview.png',
      9: '/imagen_9_caballo-removebg-preview.png',
      10: '/imagen_10_caballo-removebg-preview.png',
      11: '/imagen_11_caballo-removebg-preview.png',
      12: '/imagen 12 caballo.png',
      13: '/imagen_13_caballo-removebg-preview.png',
      14: '/imagen_14_caballo-removebg-preview.png',
      15: '/imagen15_caballos-removebg-preview.png',
      16: '/imagen_16_caballo_-removebg-preview.png',
      17: '/imagen_17_caballo-removebg-preview.png',
      18: '/imagen_18_caballo-removebg-preview.png',
      19: '/imagen_19_caballo-removebg-preview.png',
      20: '/imagen_20_caballo-removebg-preview.png',
      21: '/imagen_21_cabllo-removebg-preview.png',
      22: '/imagen_22_caballo-removebg-preview.png',
      23: '/imagen_23_caballo-removebg-preview.png',
      24: '/imagen_24-removebg-preview.png',
      25: '/imagen_25_caballo-removebg-preview.png',
      26: '/imagen_26_caballo-removebg-preview.png',
      27: '/imagen_27_caballo-removebg-preview.png',
      28: '/imagen_28_caballo-removebg-preview.png',
      29: '/imagen_29_caballo-removebg-preview.png',
      30: '/imagen_30_caballo-removebg-preview.png',
    };
    return mapping[id] || '/imagen_1_caballo-removebg-preview.png';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-slate-950 p-4 shadow-2xl">
      {/* Cabecera */}
      <div className="relative z-10 mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", phase === 'racing' ? "bg-red-500" : "bg-amber-500")} />
            <span className={cn("relative inline-flex h-3 w-3 rounded-full", phase === 'racing' ? "bg-red-600" : "bg-amber-500")} />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-200">
            {phase === 'racing' ? '🔴 CARRERA EN VIVO' : '⏳ GATERAS DE SALIDA'}
          </span>
        </div>
      </div>

      {/* Pista */}
      <div className="rounded-xl border border-white/10 p-3 bg-slate-900/90 shadow-inner">
        <div className="space-y-4">
          {horses.map((horse) => {
            const prog = progress.find((p) => p.horseId === horse.id);
            // Permitimos que el progreso viaje de 0 a 100 de forma fluida
            const pct = Math.max(0, Math.min(100, prog?.progress ?? 0));
            const pos = positions.get(horse.id) ?? horse.id;

            return (
              <div key={horse.id} className="relative">
                <div className="flex items-center gap-3">
                  {/* Posición */}
                  <div className="flex w-7 shrink-0 justify-center items-center rounded-md bg-black/80 border border-white/20 py-1">
                    <span className="text-xs font-bold text-white">{phase === 'betting' ? horse.id : pos}</span>
                  </div>

                  {/* Carril con espacio interno para que el caballo no se corte al inicio */}
                  <div className="relative h-14 flex-1 px-4 rounded-xl bg-black/60 border border-white/10 flex items-center">
                    {/* Línea de pista de fondo */}
                    <div className="absolute inset-x-4 h-1 bg-white/10 rounded-full" />

                    {/* Contenedor del Caballo controlado por el porcentaje de avance */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear z-30"
                      style={{ left: `${pct}%` }}
                    >
                      <div className="h-12 w-12 -ml-6 flex items-center justify-center">
                        <img
                          src={getHorseImage(horse.id)}
                          alt={`Caballo ${horse.id}`}
                          className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                        />
                      </div>
                    </div>

                    {/* Línea de Meta Amarilla fija al extremo derecho */}
                    <div className="absolute right-3 top-2 bottom-2 w-1.5 bg-amber-400 z-20 rounded shadow-[0_0_10px_rgba(251,191,36,1)]" />
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
