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
    <div className="rounded-3xl border border-primary/40 bg-slate-950 p-4 shadow-2xl">
      {/* Cabecera de Estado */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
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

      {/* Contenedor Visible de la Pista */}
      <div className="rounded-xl border border-white/15 p-3 bg-slate-900 shadow-inner">
        <div className="space-y-3">
          {horses.map((horse) => {
            const prog = progress.find((p) => p.horseId === horse.id);
            const pct = Math.max(5, Math.min(95, prog?.progress ?? 0));
            const pos = positions.get(horse.id) ?? horse.id;

            return (
              <div key={horse.id} className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/10">
                {/* Posición / Número */}
                <div className="flex w-7 shrink-0 justify-center items-center rounded-lg bg-slate-800 border border-white/20 py-1.5">
                  <span className="text-xs font-bold text-white">
                    {phase === 'betting' ? horse.id : pos}
                  </span>
                </div>

                {/* Pista y Carril */}
                <div className="relative h-12 flex-1 rounded-lg bg-slate-950 border border-white/20 overflow-hidden flex items-center px-2">
                  {/* Línea de pista de fondo */}
                  <div className="absolute inset-x-2 h-1 bg-white/10 rounded-full" />

                  {/* Caballo con movimiento porcentual */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 ease-linear z-20 flex items-center"
                    style={{ left: `${pct}%` }}
                  >
                    <div className="h-10 w-10 -ml-5 flex items-center justify-center">
                      <img
                        src={getHorseImage(horse.id)}
                        alt={`Caballo ${horse.id}`}
                        className="h-full w-full object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/imagen_1_caballo-removebg-preview.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Línea de Meta Amarilla */}
                  <div className="absolute right-2 top-1 bottom-1 w-1.5 bg-amber-400 rounded z-10 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
