'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RaceHeader } from '@/components/racing/race-header';
import { HorseCard } from '@/components/racing/horse-card';
import { RaceTrack } from '@/components/racing/race-track';
import { BetPanel } from '@/components/racing/bet-panel';
import { RaceHistory } from '@/components/racing/race-history';
import { RaceResultModal } from '@/components/racing/race-result-modal';
import { LiveChat } from '@/components/racing/live-chat';
import { StartScreen } from '@/components/racing/start-screen';
import { generateHorses, pickWinner, simulateRaceProgress } from '@/lib/racing/engine';
import { useAmbientAudio } from '@/hooks/use-ambient-audio';
import type { Horse, RacePhase, RaceProgress, RaceResult } from '@/lib/racing/types';
import { supabase } from '@/lib/supabase-client';

const COUNTDOWN_DURATION = 60; // 1:00
const RACE_TICKS = 10;
const TICK_INTERVAL = 280; // ms per progress tick
const HOUSE_COMMISSION_RATE = 0.15;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [raceNumber, setRaceNumber] = useState(47);
  const [balance, setBalance] = useState(1240);
  const [betAmount, setBetAmount] = useState(100);
  const [selectedHorseId, setSelectedHorseId] = useState<number | null>(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [phase, setPhase] = useState<RacePhase>('betting');
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [progress, setProgress] = useState<RaceProgress[]>([]);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [history, setHistory] = useState<RaceResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isSpecialRace, setIsSpecialRace] = useState(false);
  const [jackpotBase, setJackpotBase] = useState(5000);
  const [jackpotWinner, setJackpotWinner] = useState<{ username: string; prize: number } | null>(null);

  const { muted, toggleMute, audioUnlocked, unlockAudio } = useAmbientAudio(countdown, phase);

  // Refs to avoid stale closures in async callbacks
  const winnerRef = useRef<Horse | null>(null);
  const phaseRef = useRef<RacePhase>('betting');
  const countdownRef = useRef<number>(COUNTDOWN_DURATION);
  const selectedHorseIdRef = useRef<number | null>(null);
  const betPlacedRef = useRef<boolean>(false);
  const betAmountRef = useRef<number>(100);
  const raceNumberRef = useRef<number>(47);
  const horsesRef = useRef<Horse[]>([]);
  const isSpecialRaceRef = useRef<boolean>(false);

  // Keep refs in sync with state
  phaseRef.current = phase;
  countdownRef.current = countdown;
  selectedHorseIdRef.current = selectedHorseId;
  betPlacedRef.current = betPlaced;
  betAmountRef.current = betAmount;
  raceNumberRef.current = raceNumber;
  horsesRef.current = horses;
  isSpecialRaceRef.current = isSpecialRace;

  // Generate horses only on the client to avoid hydration mismatch
  useEffect(() => {
    const h = generateHorses();
    setHorses(h);
    horsesRef.current = h;
    setMounted(true);

    // Load jackpot base from Supabase
    (async () => {
      const { data } = await supabase
        .from('house_settings')
        .select('jackpot_base')
        .eq('id', 1)
        .maybeSingle();
      if (data?.jackpot_base) setJackpotBase(data.jackpot_base);
    })();

    // Check if current race is special
    (async () => {
      const { data } = await supabase
        .from('special_races')
        .select('multiplier')
        .eq('race_number', 47)
        .eq('active', true)
        .maybeSingle();
      if (data) setIsSpecialRace(true);
    })();
  }, []);

  // Countdown timer — runs once per second, only during betting
  useEffect(() => {
    if (phase !== 'betting') return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 0) return 0;
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Auto-start race when countdown hits zero
  useEffect(() => {
    if (phase === 'betting' && countdown === 0 && mounted) {
      startRace();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, phase, mounted]);

  const startRace = useCallback(() => {
    const currentHorses = horsesRef.current;
    if (currentHorses.length === 0) return;

    const raceWinner = pickWinner(currentHorses);
    winnerRef.current = raceWinner;
    setWinner(raceWinner);
    setPhase('racing');
    setProgress(currentHorses.map((h) => ({ horseId: h.id, progress: 0, position: 0 })));

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      if (tick > RACE_TICKS) {
        clearInterval(interval);
        finishRace();
        return;
      }
      setProgress(simulateRaceProgress(currentHorses, raceWinner, tick));
    }, TICK_INTERVAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishRace = useCallback(() => {
    const raceWinner = winnerRef.current;
    if (!raceWinner) return;
    setPhase('result');

    const selId = selectedHorseIdRef.current;
    const placed = betPlacedRef.current;
    const bet = betAmountRef.current;
    const won = selId === raceWinner.id;
    const effectiveOdds = isSpecialRaceRef.current ? raceWinner.odds * 2 : raceWinner.odds;
    const payout = won && placed ? Math.round(bet * effectiveOdds) : 0;
    const betCost = placed ? bet : 0;
    const houseCommission = Math.round(betCost * HOUSE_COMMISSION_RATE);

    if (won && placed) {
      setBalance((b) => b + payout);
    } else if (placed) {
      setBalance((b) => Math.max(0, b - betCost));
    }

    setHistory((prev) => [
      {
        raceNumber: raceNumberRef.current,
        winner: raceWinner,
        payout,
        bet: betCost,
        selectedHorseId: selId,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, 10));

    // Persist to Supabase
    (async () => {
      await supabase.from('race_results').insert({
        race_number: raceNumberRef.current,
        winner_name: raceWinner.name,
        winner_odds: raceWinner.odds,
        bet_amount: betCost,
        payout,
        house_commission: houseCommission,
        is_special: isSpecialRaceRef.current,
      });
    })();

    // Random jackpot winner announcement (1 in 3 chance)
    if (Math.random() < 0.33) {
      const names = ['CarlosV92', 'MariaR', 'JugadorPro', 'LuckyDuck', 'ElCapo', 'ReinaM'];
      const name = names[Math.floor(Math.random() * names.length)];
      const prize = Math.round(jackpotBase * (0.5 + Math.random() * 0.5));
      setJackpotWinner({ username: name, prize });
    } else {
      setJackpotWinner(null);
    }

    setTimeout(() => setShowResult(true), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectHorse = (id: number) => {
    if (phase !== 'betting') return;
    setSelectedHorseId(id);
  };

  const handlePlaceBet = () => {
    if (!selectedHorseId || betAmount <= 0 || betAmount > balance) return;
    setBetPlaced(true);
  };

  const handleNextRace = () => {
    setShowResult(false);
    setWinner(null);
    winnerRef.current = null;
    setBetPlaced(false);
    setSelectedHorseId(null);
    setProgress([]);
    setPhase('betting');
    setCountdown(COUNTDOWN_DURATION);
    const nextRaceNum = raceNumber + 1;
    setRaceNumber(nextRaceNum);
    const h = generateHorses();
    setHorses(h);
    horsesRef.current = h;

    // Check if next race is special
    (async () => {
      const { data } = await supabase
        .from('special_races')
        .select('multiplier')
        .eq('race_number', nextRaceNum)
        .eq('active', true)
        .maybeSingle();
      const isSpecial = !!data;
      setIsSpecialRace(isSpecial);
      isSpecialRaceRef.current = isSpecial;
    })();
  };

  const handleStartRace = () => {
    if (countdown > 0) {
      setCountdown(0);
    } else {
      startRace();
    }
  };

  const selectedHorse = horses.find((h) => h.id === selectedHorseId) ?? null;

  return (
    <div className="min-h-screen bg-background bg-grid">
      <RaceHeader
        balance={balance}
        raceNumber={raceNumber}
        countdown={countdown}
        phase={phase}
        muted={muted}
        onToggleMute={toggleMute}
      />

      <main className="mx-auto max-w-md space-y-4 px-4 py-4 pb-24">
        {!mounted ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <RaceTrack horses={horses} progress={progress} phase={phase} />

            {isSpecialRace && (
              <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 animate-slide-up">
                <span className="text-xs font-bold uppercase tracking-wider text-accent text-glow-gold">
                  Carrera Especial - Cuotas x2
                </span>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-gradient-to-r from-secondary/40 to-secondary/10 px-4 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">Jackpot Acumulado</span>
              <span className="text-lg font-extrabold text-accent text-glow-gold tabular-nums">
                {jackpotBase.toLocaleString('es')} GC
              </span>
            </div>

            {betPlaced && phase === 'betting' && selectedHorse && (
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 animate-slide-up">
                <span className="text-xs font-medium text-primary">
                  Apuesta confirmada: {selectedHorse.emoji} {selectedHorse.name}
                </span>
                <span className="text-xs font-bold text-accent tabular-nums">
                  {betAmount.toLocaleString('es')} GC
                </span>
              </div>
            )}

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Caballos
                </h2>
                <span className="text-xs text-muted-foreground">
                  {selectedHorseId ? '1 seleccionado' : 'Toca para elegir'}
                </span>
              </div>
              <div className="space-y-2">
                {horses.map((horse) => (
                  <HorseCard
                    key={horse.id}
                    horse={horse}
                    selected={selectedHorseId === horse.id}
                    disabled={phase !== 'betting' || betPlaced}
                    onSelect={handleSelectHorse}
                  />
                ))}
              </div>
            </section>

            <BetPanel
              selectedHorse={selectedHorse}
              betAmount={betAmount}
              balance={balance}
              phase={phase}
              countdown={countdown}
              isSpecialRace={isSpecialRace}
              onBetChange={setBetAmount}
              onPlaceBet={handlePlaceBet}
              onStartRace={handleStartRace}
            />

            <RaceHistory history={history} />
          </>
        )}
      </main>

      {showResult && winner && (
        <RaceResultModal
          horses={horses}
          progress={progress}
          won={selectedHorseId === winner.id && betPlaced}
          payout={betPlaced ? Math.round(betAmount * (isSpecialRace ? winner.odds * 2 : winner.odds)) : 0}
          bet={betPlaced ? betAmount : 0}
          raceNumber={raceNumber}
          jackpotWinner={jackpotWinner}
          onClose={() => setShowResult(false)}
          onNextRace={handleNextRace}
        />
      )}

      <LiveChat />

      {!audioUnlocked && <StartScreen onEnter={unlockAudio} />}
    </div>
  );
}
