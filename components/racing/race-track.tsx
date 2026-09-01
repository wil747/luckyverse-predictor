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
      {/* Fondo Superior de Gradas con Espectadores */}
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-40 pointer-events-none bg-cover bg-center border-b border-white/10"
        style={{ backgroundImage: `url('/imagen_31_gradas_con_espectadores.png')` }}
      />

      {/* HUD de Transmisión en Vivo */}
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

      {/* Contenedor de la Pista - FORZANDO TU IMAGEN DE FONDO */}
      <div
        className="relative rounded-xl border border-white/10 p-3 shadow-inner backdrop-blur-sm bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85)), url('/pista de carrera.jpg')`,
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="space-y-3 relative z-10">
          {horses.map((horse) => {
            const prog = progress.find((p) => p.horseId === horse.id);
            // CORRECCIÓN CRÍTICA: Aseguramos que el progreso sea un número y tenga un mínimo para evitar que el caballo desaparezca.
            const pct = Math.max(4, Math.min(96, prog?.progress ?? 0));
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

                  {/* Carril de carrera */}
                  <div className="relative h-12 flex-1 overflow-hidden rounded-xl bg-black/40 border border-white/5 shadow-inner">
                    {/* Líneas de carril */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.05)_95%)] bg-[size:60px_100%]" />

                    {/* Barra de progreso de AVANCE REAL - La clave de la solución */}
                    <div
                      className="absolute left-0 top-0 flex h-full items-center transition-all duration-300 ease-linear rounded-r-lg"
                      style={{
                        width: `${pct}%`, // ¡Ahora el ancho se actualiza dinámicamente!
                        backgroundColor: `${horse.color}30`,
                        boxShadow: `inset 0 0 15px ${horse.color}66`,
                      }}
                    >
                      {/* Imagen Real del Caballo con movimiento y rebote */}
                      <div
                        className={cn(
                          'absolute right-0 h-11 w-11 flex items-center justify-center transition-all',
                          phase === 'racing' && 'animate-bounce'
                        )}
                        style={{
                          transform: `translateX(50%)`, // Centra la imagen en el borde del progreso
                          filter: `drop-shadow(0 0 8px ${horse.color})`,
                        }}
                      >
                        <img
                          src={getHorseImage(horse.id)}
                          alt={`Caballo ${horse.id}`}
                          className="h-full w-full object-contain drop-shadow-lg"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    </div>

                    {/* Línea de Meta */}
                    <div className="absolute right-0 top-0 h-full w-1.5 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,1)] z-20" />
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
