'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Trophy,
  TrendingUp,
  Coins,
  Settings,
  Star,
  Lock,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Users,
  Activity,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/lib/supabase-client';

type RaceResultRow = {
  id: string;
  race_number: number;
  winner_name: string;
  winner_odds: number;
  bet_amount: number;
  payout: number;
  house_commission: number;
  is_special: boolean;
  created_at: string;
};

type SpecialRaceRow = {
  id: string;
  race_number: number;
  multiplier: number;
  label: string;
  active: boolean;
  created_at: string;
};

type ChartDataPoint = {
  label: string;
  commission: number;
  bets: number;
  payout: number;
  profit: number;
};

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [results, setResults] = useState<RaceResultRow[]>([]);
  const [jackpotBase, setJackpotBase] = useState(5000);
  const [jackpotInput, setJackpotInput] = useState('5000');
  const [jackpotSaved, setJackpotSaved] = useState(false);
  const [specialRaces, setSpecialRaces] = useState<SpecialRaceRow[]>([]);
  const [newRaceNumber, setNewRaceNumber] = useState('');
  const [newRaceLabel, setNewRaceLabel] = useState('Clásico Especial');
  const [newRaceMultiplier, setNewRaceMultiplier] = useState('2');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [settingsRes, resultsRes, specialRes] = await Promise.all([
      supabase.from('house_settings').select('jackpot_base, admin_pin').eq('id', 1).maybeSingle(),
      supabase.from('race_results').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('special_races').select('*').eq('active', true).order('created_at', { ascending: false }),
    ]);

    if (settingsRes.data) {
      setJackpotBase(settingsRes.data.jackpot_base);
      setJackpotInput(String(settingsRes.data.jackpot_base));
      setPin(settingsRes.data.admin_pin || '1234');
    }
    if (resultsRes.data) setResults(resultsRes.data as RaceResultRow[]);
    if (specialRes.data) setSpecialRaces(specialRes.data as SpecialRaceRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  const handleUnlock = () => {
    if (enteredPin === pin) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveJackpot = async () => {
    const val = parseInt(jackpotInput, 10);
    if (isNaN(val) || val < 0) return;
    await supabase.from('house_settings').update({ jackpot_base: val }).eq('id', 1);
    setJackpotBase(val);
    setJackpotSaved(true);
    setTimeout(() => setJackpotSaved(false), 2000);
  };

  const handleScheduleSpecial = async () => {
    const raceNum = parseInt(newRaceNumber, 10);
    const mult = parseInt(newRaceMultiplier, 10);
    if (isNaN(raceNum) || raceNum < 1 || isNaN(mult) || mult < 2) return;
    await supabase.from('special_races').insert({
      race_number: raceNum,
      multiplier: mult,
      label: newRaceLabel || 'Clásico Especial',
      active: true,
    });
    setNewRaceNumber('');
    setNewRaceLabel('Clásico Especial');
    setNewRaceMultiplier('2');
    loadData();
  };

  const handleDeleteSpecial = async (id: string) => {
    await supabase.from('special_races').delete().eq('id', id);
    setSpecialRaces((prev) => prev.filter((r) => r.id !== id));
  };

  // Compute metrics
  const totalCommission = results.reduce((sum, r) => sum + r.house_commission, 0);
  const totalBets = results.reduce((sum, r) => sum + r.bet_amount, 0);
  const totalPayouts = results.reduce((sum, r) => sum + r.payout, 0);
  const totalProfit = totalCommission + (totalBets - totalPayouts);
  const totalRaces = results.length;
  const specialCount = results.filter((r) => r.is_special).length;

  // Build chart data — last 10 races
  const chartData: ChartDataPoint[] = [...results]
    .reverse()
    .slice(-10)
    .map((r) => ({
      label: `#${r.race_number}`,
      commission: r.house_commission,
      bets: r.bet_amount,
      payout: r.payout,
      profit: r.house_commission + (r.bet_amount - r.payout),
    }));

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-grid px-4">
        <div className="w-full max-w-sm animate-slide-up rounded-3xl border border-border/60 bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 glow-green">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Backoffice Luckyverse
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa tu PIN de administrador para continuar
          </p>
          <input
            type="password"
            inputMode="numeric"
            value={enteredPin}
            onChange={(e) => {
              setEnteredPin(e.target.value);
              setPinError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="• • • •"
            className={`mt-6 w-full rounded-xl border bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-foreground outline-none transition-colors ${
              pinError ? 'border-destructive animate-pulse' : 'border-border/60'
            }`}
          />
          {pinError && (
            <p className="mt-2 text-xs font-medium text-destructive">
              PIN incorrecto. Intenta de nuevo.
            </p>
          )}
          <button
            type="button"
            onClick={handleUnlock}
            className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 glow-green"
          >
            Desbloquear
          </button>
          <a
            href="/"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver a la app
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 glow-green">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-foreground">
                Backoffice
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
                Luckyverse Admin
              </p>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            App
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<DollarSign className="h-5 w-5 text-primary" />}
                label="Ganancias de la Casa"
                value={`${totalProfit.toLocaleString('es')} GC`}
                sub="15% comisión + margen"
                accent="primary"
              />
              <MetricCard
                icon={<Coins className="h-5 w-5 text-accent" />}
                label="Comisión Total"
                value={`${totalCommission.toLocaleString('es')} GC`}
                sub="15% de apuestas"
                accent="accent"
              />
              <MetricCard
                icon={<TrendingUp className="h-5 w-5 text-primary" />}
                label="Total Apostado"
                value={`${totalBets.toLocaleString('es')} GC`}
                sub={`${totalRaces} carreras`}
                accent="primary"
              />
              <MetricCard
                icon={<Sparkles className="h-5 w-5 text-accent" />}
                label="Carreras Especiales"
                value={String(specialCount)}
                sub="con cuotas x2"
                accent="accent"
              />
            </div>

            {/* Profit chart */}
            <section className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Ganancias por Carrera
                </h3>
              </div>
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    Sin datos aún. Juega algunas carreras para ver las métricas.
                  </p>
                </div>
              ) : (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(148,163,184,0.2)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#f1f5f9' }}
                        itemStyle={{ color: '#22c55e' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#profitGradient)"
                        name="Ganancia"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {/* Bets vs Payouts chart */}
            {chartData.length > 0 && (
              <section className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Apostado vs Pagado
                  </h3>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(148,163,184,0.2)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Bar dataKey="bets" fill="#f59e0b" name="Apostado" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="payout" fill="#ef4444" name="Pagado" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Jackpot configurator */}
            <section className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Configurador de Jackpot
                </h3>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Ajusta el monto base del jackpot que ven los jugadores en la pantalla principal.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-background px-3">
                  <Coins className="h-4 w-4 text-accent" />
                  <input
                    type="number"
                    value={jackpotInput}
                    onChange={(e) => setJackpotInput(e.target.value)}
                    className="w-full bg-transparent text-lg font-bold text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs font-medium text-muted-foreground">GC</span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveJackpot}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                    jackpotSaved
                      ? 'bg-primary/20 text-primary'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 glow-green'
                  }`}
                >
                  {jackpotSaved ? (
                    <>Guardado</>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">Jackpot actual</span>
                <span className="text-sm font-bold text-accent tabular-nums">
                  {jackpotBase.toLocaleString('es')} GC
                </span>
              </div>
            </section>

            {/* Special races scheduler */}
            <section className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Carreras Especiales / Clásicos
                </h3>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Programa carreras con cuotas y premios duplicados. El número de carrera determina
                cuándo se activará automáticamente.
              </p>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newRaceNumber}
                    onChange={(e) => setNewRaceNumber(e.target.value)}
                    placeholder="N° de carrera"
                    className="w-28 rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm font-bold text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <input
                    type="text"
                    value={newRaceLabel}
                    onChange={(e) => setNewRaceLabel(e.target.value)}
                    placeholder="Nombre del clásico"
                    className="flex-1 rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">Multiplicador</span>
                    <input
                      type="number"
                      value={newRaceMultiplier}
                      onChange={(e) => setNewRaceMultiplier(e.target.value)}
                      min={2}
                      className="w-12 bg-transparent text-sm font-bold text-accent outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-muted-foreground">x</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleScheduleSpecial}
                    disabled={!newRaceNumber || parseInt(newRaceMultiplier, 10) < 2}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 glow-green"
                  >
                    <Plus className="h-4 w-4" />
                    Programar
                  </button>
                </div>
              </div>

              {specialRaces.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Carreras Programadas
                  </p>
                  {specialRaces.map((race) => (
                    <div
                      key={race.id}
                      className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3 animate-slide-up"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent">
                        #{race.race_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">
                          {race.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Multiplicador x{race.multiplier} · Carrera #{race.race_number}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSpecial(race.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent results table */}
            <section className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Historial de Carreras
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {results.length} registros
                </span>
              </div>
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    Sin carreras registradas todavía.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {results.slice(0, 15).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2"
                    >
                      <span className="w-10 shrink-0 text-xs font-bold text-muted-foreground">
                        #{r.race_number}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {r.winner_name}
                        {r.is_special && (
                          <span className="ml-1.5 inline-block rounded bg-accent/20 px-1 text-[10px] font-bold text-accent">
                            CLÁSICO
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {r.bet_amount} GC
                      </span>
                      <span className="shrink-0 text-xs font-bold text-primary tabular-nums">
                        +{r.house_commission}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: 'primary' | 'accent';
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent === 'primary' ? 'bg-primary/15' : 'bg-accent/15'
          }`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-xl font-extrabold tabular-nums ${
          accent === 'primary' ? 'text-primary text-glow-green' : 'text-accent text-glow-gold'
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground/70">{sub}</p>
    </div>
  );
}
