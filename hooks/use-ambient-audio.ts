'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const FADE_THRESHOLD = 10;
const BG_FADE_OUT_MS = 500;
const TARGET_VOLUME = 0.35;
const SFX_VOLUME = 0.6;
const GALLOP_VOLUME = 0.5;
const GALLOP_FADE_OUT_MS = 600;

type AudioSlot = 'bgMusic' | 'bugle' | 'whinny1' | 'whinny2' | 'whinny3' | 'gallop' | 'bell';

export function useAmbientAudio(countdown: number, phase: string) {
  const audioRefs = useRef<Record<AudioSlot, HTMLAudioElement | null>>({
    bgMusic: null,
    bugle: null,
    whinny1: null,
    whinny2: null,
    whinny3: null,
    gallop: null,
    bell: null,
  });
  const [muted, setMuted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const mutedRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const fadeFrameRef = useRef<number | null>(null);
  const gateAmbienceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<string>('betting');
  const countdownRef = useRef<number>(countdown);

  mutedRef.current = muted;
  audioUnlockedRef.current = audioUnlocked;
  phaseRef.current = phase;
  countdownRef.current = countdown;

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }, []);

  const fadeAudio = useCallback((audio: HTMLAudioElement, targetVolume: number, durationMs: number, onDone?: () => void) => {
    cancelFade();
    const startVolume = audio.volume;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      audio.volume = startVolume + (targetVolume - startVolume) * t;
      if (t < 1) {
        fadeFrameRef.current = requestAnimationFrame(step);
      } else {
        fadeFrameRef.current = null;
        onDone?.();
      }
    };
    fadeFrameRef.current = requestAnimationFrame(step);
  }, [cancelFade]);

  const playSfx = useCallback((slot: AudioSlot, volume = SFX_VOLUME) => {
    if (mutedRef.current) return;
    const audio = audioRefs.current[slot];
    if (!audio) return;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const stopSlot = useCallback((slot: AudioSlot) => {
    const audio = audioRefs.current[slot];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  // Initialize all audio elements once
  useEffect(() => {
    const slots: Record<AudioSlot, string> = {
      bgMusic: '/bg-music.mp3',
      bugle: '/bugle-call.mp3',
      whinny1: '/horse-whinny-1.mp3',
      whinny2: '/horse-whinny-2.mp3',
      whinny3: '/horse-whinny-3.mp3',
      gallop: '/horse-gallop.mp3',
      bell: '/gate-bell.mp3',
    };

    (Object.keys(slots) as AudioSlot[]).forEach((slot) => {
      const audio = new Audio(slots[slot]);
      audio.preload = 'auto';
      if (slot === 'bgMusic' || slot === 'gallop') {
        audio.loop = true;
      }
      audio.volume = 0;
      audioRefs.current[slot] = audio;
    });

    // Do NOT attempt autoplay — wait for user gesture via unlockAudio()

    return () => {
      cancelFade();
      if (gateAmbienceTimerRef.current) clearTimeout(gateAmbienceTimerRef.current);
      (Object.keys(audioRefs.current) as AudioSlot[]).forEach((slot) => {
        const a = audioRefs.current[slot];
        if (a) {
          a.pause();
          a.src = '';
          audioRefs.current[slot] = null;
        }
      });
    };
  }, [cancelFade]);

  // Unlock audio context on user gesture (call from start screen button)
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    setAudioUnlocked(true);
    const bg = audioRefs.current.bgMusic;
    if (bg && !mutedRef.current) {
      bg.volume = 0;
      bg.play().then(() => {
        fadeAudio(bg, TARGET_VOLUME, 800);
      }).catch(() => {});
    }
  }, [fadeAudio]);

  // Fade in background music when entering betting phase (above threshold, after unlock)
  useEffect(() => {
    const bg = audioRefs.current.bgMusic;
    if (!bg) return;
    if (phase === 'betting' && !mutedRef.current && countdown > FADE_THRESHOLD && audioUnlockedRef.current) {
      if (bg.paused) bg.play().catch(() => {});
      fadeAudio(bg, TARGET_VOLUME, 600);
    }
  }, [phase, countdown, fadeAudio]);

  // At 00:10: fade out bg music, play bugle, start gate ambience
  useEffect(() => {
    const bg = audioRefs.current.bgMusic;
    if (!bg) return;

    if (phase === 'betting' && countdown === FADE_THRESHOLD) {
      // Fade out background music over 500ms
      fadeAudio(bg, 0, BG_FADE_OUT_MS, () => {
        bg.pause();
      });

      // Play bugle call after a brief moment
      setTimeout(() => playSfx('bugle', 0.5), 200);

      // Start gate ambience: play random whinnies at intervals
      const playRandomWhinny = () => {
        if (mutedRef.current || phaseRef.current !== 'betting' || countdownRef.current <= 0) return;
        const slots: AudioSlot[] = ['whinny1', 'whinny2', 'whinny3'];
        const pick = slots[Math.floor(Math.random() * slots.length)];
        playSfx(pick, 0.4 + Math.random() * 0.2);
      };

      // Initial whinny after bugle
      setTimeout(playRandomWhinny, 1500);

      // Then random whinnies every 1.5-3 seconds
      const scheduleNext = () => {
        if (mutedRef.current || phaseRef.current !== 'betting' || countdownRef.current <= 0) return;
        const delay = 1500 + Math.random() * 1500;
        gateAmbienceTimerRef.current = setTimeout(() => {
          playRandomWhinny();
          scheduleNext();
        }, delay);
      };
      scheduleNext();
    }
  }, [countdown, phase, fadeAudio, playSfx]);

  // At 00:00 / race start: stop gate ambience, play bell + whinny, start galloping
  useEffect(() => {
    if (phase === 'racing') {
      // Stop any pending gate ambience
      if (gateAmbienceTimerRef.current) {
        clearTimeout(gateAmbienceTimerRef.current);
        gateAmbienceTimerRef.current = null;
      }
      // Stop gate ambience sounds immediately
      stopSlot('whinny1');
      stopSlot('whinny2');
      stopSlot('whinny3');

      // Play starting gate bell
      playSfx('bell', 0.7);

      // Play intense whinny right after bell
      setTimeout(() => playSfx('whinny2', 0.6), 300);

      // Start galloping loop
      const gallop = audioRefs.current.gallop;
      if (gallop && !mutedRef.current) {
        gallop.volume = 0;
        gallop.play().catch(() => {});
        fadeAudio(gallop, GALLOP_VOLUME, 400);
      }
    }
  }, [phase, fadeAudio, playSfx, stopSlot]);

  // At race finish: fade out galloping
  useEffect(() => {
    if (phase === 'result') {
      const gallop = audioRefs.current.gallop;
      if (gallop) {
        fadeAudio(gallop, 0, GALLOP_FADE_OUT_MS, () => {
          gallop.pause();
        });
      }
    }
  }, [phase, fadeAudio]);

  // Handle mute/unmute toggle
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        // Muting: fade out everything
        cancelFade();
        const bg = audioRefs.current.bgMusic;
        const gallop = audioRefs.current.gallop;
        if (bg && !bg.paused) fadeAudio(bg, 0, 200, () => bg.pause());
        if (gallop && !gallop.paused) fadeAudio(gallop, 0, 200, () => gallop.pause());
        // Stop any SFX
        (['bugle', 'whinny1', 'whinny2', 'whinny3', 'bell'] as AudioSlot[]).forEach(stopSlot);
      } else {
        // Unmuting: resume appropriate audio for current phase
        const bg = audioRefs.current.bgMusic;
        const gallop = audioRefs.current.gallop;
        if (phaseRef.current === 'betting' && countdownRef.current > FADE_THRESHOLD) {
          if (bg) {
            bg.play().catch(() => {});
            fadeAudio(bg, TARGET_VOLUME, 300);
          }
        }
        if (phaseRef.current === 'racing') {
          if (gallop) {
            gallop.play().catch(() => {});
            fadeAudio(gallop, GALLOP_VOLUME, 300);
          }
        }
      }
      return next;
    });
  }, [cancelFade, fadeAudio, stopSlot]);

  return { muted, toggleMute, audioUnlocked, unlockAudio };
}
