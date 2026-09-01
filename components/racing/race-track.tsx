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

  // Función inteligente para asociar el ID del caballo con la imagen exacta que subiste a public
  const getHorseImage = (id: number) => {
    // Mapeo seguro para tus 30 imágenes subidas
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
    <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-slate-950 p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      
      {/* Fondo Superior de Gradas con Espectadores (Imagen 31 o similar) */}
      <div 
        className="absolute inset-x-0 top-0 h-24 opacity-30 pointer-events-none bg-cover bg-center border-b border-white/10"
        style={{ backgroundImage: `url('/imagen_31_gradas_con_espectadores.png')` }}
      />

      {/* HUD de Transmisión en Vivo Estilo Casino / TV */}
      <div className="relative z-10 mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", phase === 'racing' ? "bg-red-500" : "bg-amber-500")} />
            <span className={cn("relative inline-flex h-3 w-3 rounded-full", phase === 'racing' ? "bg-red-600" : "bg-amber-500")} />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-200">
            {phase === 'racing' ? '🔴 TRANSMISIÓN EN VIVO • PISTA VIRTUAL' : phase === 'result' ? '🏁 FINAL DE CARRERA' : '⏳ EN ESPERA DE PARTIDA'}
          </span>
        </div>
        <div className="rounded-lg bg-black/80 px-3 py-1 border border-white/10 text-xs font-mono font-bold text-emerald-400 shadow-inner">
          {phase === 'racing' ? 'CARRERA ACTIVA' : phase === 'result' ? 'RESULTADO OFICIAL' : 'APERTURA DE GATERAS'}
        </div>
      </div>

      {/* Contenedor de la Pista con tu textura de Pista de Carrera */}
      <div 
        className="relative rounded-xl border border-white/10 p-3 shadow-inner backdrop-blur-md bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.95)), url('/pista de carrera.jpg')` }}
      >
        <div className="space-y-3 relative z-10">
          {horses.map((horse) => {
            const prog = progress.find((p) => p.horseId === horse.id);
            const pct = prog?.progress ?? 0;
            const pos = positions.get(horse.id) ?? 0;
            const isLeader = pos === 1 && phase !== 'betting';

            return (
              <div key={horse.id} className="relative group">
                <div className="flex items-center gap-3">
                  {/* Posición / Número del caballo */}
                  <div className="flex w-7 shrink-0 justify-center items-center rounded-md bg-black/60 border border-white/20 py-1 shadow">
                    <span
                      className={cn(
                        'text-xs font-extrabold tabular-nums',
                        isLeader ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-300'
                      )}
                    >
                      {phase === 'betting' ? horse.id : pos}
                    </span>
                  </div>

                  {/* Carril de carrera individual */}
                  <div className="relative h-11 flex-1 overflow-hidden rounded-xl bg-black/50 border border-white/10 shadow-inner">
                    
                    {/* Líneas divisorias de velocidad */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.1)_95%)] bg-[size:40px_100%]" />

                    {/* Barra de progreso de avance con el color del caballo */}
                    <div
                      className="absolute left-0 top-0 flex h-full items-center transition-all duration-300 ease-out rounded-r-lg"
                      style={{
                        width: `${Math.max(8, pct)}%`,
                        backgroundColor: `${horse.color}20`,
                        boxShadow: `inset 0 0 20px ${horse.color}44`
                      }}
                    >
                      {/* Imagen Real del Caballo Subida por Ti */}
                      <div
                        className={cn(
                          'absolute right-[-10px] h-10 w-10 flex items-center justify-center transition-transform',
                          phase === 'racing' && 'animate-bounce'
                        )}
                        style={{ filter: `drop-shadow(0 0 8px ${horse.color})` }}
                      >
                        <img 
                          src={getHorseImage(horse.id)} 
                          alt={`Caballo ${horse.id}`}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            // Fallback por seguridad si alguna imagen fallara en cargar
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta / Línea final dorada */}
                    <div className="absolute right-0 top-0 h-full w-1.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,1)] z-20" />
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
