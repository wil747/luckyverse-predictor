'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Horse, RaceProgress } from '@/lib/racing/types';

type RaceTrackProps = {
  horses: Horse[];
  progress: RaceProgress[];
  phase: 'betting' | 'racing' | 'result';
};

export function RaceTrack({ horses, progress, phase }: RaceTrackProps) {
  // Estado local para garantizar que los caballos se mueven fluidamente aunque el padre tarde en actualizar
  const [animProgress, setAnimProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    if (phase === 'racing') {
      const interval = setInterval(() => {
        setAnimProgress((prev) => {
          const next = { ...prev };
          horses.forEach((h) => {
            const current = next[h.id] || Math.random() * 10;
            // Avanza de forma aleatoria pero constante hacia la meta (90%)
            const increment = Math.random() * 8 + 2;
            next[h.id] = current >= 90 ? 5 : current + increment;
          });
          return next;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      setAnimProgress({});
    }
  }, [phase, horses]);

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
      {/* Cabecera */}
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

      {/* Pista y Carriles */}
      <div className="rounded-xl border border-white/20 p-3 bg-slate-900 shadow-inner">
        <div className="space-y-3">
          {horses.map((horse) => {
            // Buscamos el progreso real del padre o usamos el animado de respaldo
            const prog = progress.find((p) => p.horseId === horse.id)?.progress;
            const livePct = prog !== undefined && prog > 0 ? prog : (animProgress[horse.id] || 5);
            const pct = Math.max(5, Math.min(92, livePct));

            return (
              <div key={horse.id} className="flex items-center gap-3 bg-black/50 p-2 rounded-xl border border-white/15">
                {/* Número del caballo */}
                <div className="flex w-8 shrink-0 justify-center items-center rounded-lg bg-slate-800 border border-white/25 py-1.5 shadow">
                  <span className="text-xs font-bold text-white">{horse.id}</span>
                </div>

                {/* Carril de la pista */}
                <div className="relative h-14 flex-1 rounded-lg bg-slate-950 border border-white/25 overflow-hidden flex items-center px-3">
                  {/* Línea central de la pista */}
                  <div className="absolute inset-x-3 h-1.5 bg-slate-800 rounded-full border border-white/10" />

                  {/* Caballo con movimiento dinámico en tiempo real */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear z-20 flex items-center"
                    style={{ left: `${pct}%` }}
                  >
                    <div className="h-12 w-12 -ml-6 flex items-center justify-center drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                      <img
                        src={getHorseImage(horse.id)}
                        alt={`Caballo ${horse.id}`}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/imagen_1_caballo-removebg-preview.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Línea de Meta Amarilla brillante */}
                  <div className="absolute right-2 top-1 bottom-1 w-2 bg-amber-400 rounded z-10 shadow-[0_0_12px_rgba(251,191,36,1)]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
