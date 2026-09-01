<div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-slate-950 p-4 shadow-xl">
      {/* Gradas */}
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-40 pointer-events-none bg-cover bg-center border-b border-white/10"
        style={{ backgroundImage: `url('/imagen_31_gradas_con_espectadores.png')` }}
      />

      {/* Estado */}
      <div className="relative z-10 mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", phase === 'racing' ? "bg-red-500" : "bg-amber-500")} />
            <span className={cn("relative inline-flex h-3 w-3 rounded-full", phase === 'racing' ? "bg-red-600" : "bg-amber-500")} />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-200">
            {phase === 'racing' ? 'TRANSMISIÓN EN VIVO' : 'PÁGINA PRINCIPAL'}
          </span>
        </div>
      </div>

      {/* Pista */}
      <div
        className="relative rounded-xl border border-white/10 p-3 bg-cover bg-center"
        style={{ backgroundImage: `url('/pista de carrera.jpg')` }}
      >
        <div className="space-y-3 relative z-10">
          {horses.map((horse) => {
            const prog = progress.find((p) => p.horseId === horse.id);
            const pct = Math.max(5, Math.min(95, prog?.progress ?? 0));
            const pos = positions.get(horse.id) ?? 0;

            return (
              <div key={horse.id} className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex w-7 shrink-0 justify-center items-center rounded-md bg-black/80 border border-white/20 py-1">
                    <span className="text-xs font-bold text-white">{phase === 'betting' ? horse.id : pos}</span>
                  </div>

                  <div className="relative h-12 flex-1 overflow-hidden rounded-xl bg-black/50 border border-white/10">
                    <div
                      className="absolute left-0 top-0 h-full transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10">
                        <img
                          src={getHorseImage(horse.id)}
                          alt={`Caballo ${horse.id}`}
                          className="h-full w-full object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                        />
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1 bg-amber-400 z-20" />
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
