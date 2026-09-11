/**
 * monarchEvents/monarchSoundManager.ts — Centralized Monarch sound system.
 *
 * Provides short generated SFX (Web Audio API) for every system event:
 *
 *   PLAYER_LEVEL_UP        layered ascending chime (deep + bright)
 *   SKILL_LEVEL_UP         double-tone energy blip
 *   EVOLUTION_TRIAL_PASSED deep impact + rising energy tone + confirmation
 *   ASCENSION_PASSED       ceremonial ascending triumph sequence
 *   HIGH_THREAT_MATCH      warning pulse + low bass impact + alarm tone
 *
 * Robustness rules (Part 18):
 *   - No external asset URLs — everything is synthesized client-side.
 *   - Browsers may block audio before interaction → init() is called from a
 *     user gesture (the audioManager's init is already called on login) and
 *     every play is wrapped so an audio failure can NEVER break gameplay or
 *     throw an uncaught exception.
 *   - Respects the app's SYSTEM SOUNDS toggle + master mute/volume.
 */

import { MonarchSoundKind } from "./types";
import { audioManager } from "../utils/audioManager";

class MonarchSoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  /** Create/resume the shared AudioContext. Safe to call repeatedly. */
  init(): void {
    if (typeof window === "undefined") return;
    try {
      if (!this.ctx) {
        const Ctor: typeof AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
    } catch {
      this.ctx = null;
      this.masterGain = null;
    }
  }

  private enabled(): boolean {
    try {
      return !audioManager.isMuted() && audioManager.isSystemSoundsEnabled();
    } catch {
      // Failing gracefully is mandatory — audio must never break gameplay.
      return true;
    }
  }

  /** Play the SFX for an event type. Never throws. */
  play(kind: MonarchSoundKind): void {
    try {
      this.init();
      if (!this.enabled()) return;
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const level = this.volumeLevel();
      switch (kind) {
        case "PLAYER_LEVEL_UP":
          this.levelUp(now, level);
          break;
        case "SKILL_LEVEL_UP":
          this.skillLevelUp(now, level);
          break;
        case "EVOLUTION_TRIAL_PASSED":
          this.evolutionPass(now, level);
          break;
        case "ASCENSION_PASSED":
          this.ascensionPass(now, level);
          break;
        case "HIGH_THREAT_MATCH":
          this.highThreat(now, level);
          break;
      }
    } catch {
      // Audio blocked / no device — sound is best-effort only.
    }
  }

  private volumeLevel(): number {
    try {
      const master = typeof audioManager.getMasterVolume === "function" ? audioManager.getMasterVolume() : 0.8;
      const effects = typeof audioManager.getEffectsVolume === "function" ? audioManager.getEffectsVolume() : 0.7;
      return Math.max(0, Math.min(1, master * effects));
    } catch {
      return 0.7;
    }
  }

  /** Fire a single envelope-gated oscillator (sine/triangle). */
  private tone(freq: number, startAt: number, dur: number, vol: number, type: OscillatorType = "sine", sweepTo?: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);
    if (sweepTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), startAt + dur);
    }
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(vol, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.05);
  }

  private levelUp(start: number, vol: number): void {
    // Deep system confirmation tone (low) + layered ascending chime.
    this.tone(98, start, 0.55, vol * 0.9, "sine", 65);
    [440, 554.37, 659.25, 880].forEach((f, i) => this.tone(f, start + 0.05 + i * 0.09, 0.5, vol * 0.6, "triangle"));
    this.tone(1760, start + 0.42, 0.4, vol * 0.25, "sine");
  }

  private skillLevelUp(start: number, vol: number): void {
    this.tone(392, start, 0.18, vol * 0.55, "triangle");
    this.tone(523.25, start + 0.16, 0.32, vol * 0.55, "triangle");
    this.tone(659.25, start + 0.3, 0.35, vol * 0.4, "sine");
  }

  private evolutionPass(start: number, vol: number): void {
    // Deep impact.
    this.tone(82, start, 0.6, vol * 0.95, "sine", 55);
    // Rising energy tone.
    this.tone(220, start + 0.08, 0.8, vol * 0.5, "sine", 622.25);
    this.tone(277.18, start + 0.1, 0.7, vol * 0.45, "triangle", 830.61);
    // Short confirmation chime.
    this.tone(1046.5, start + 0.52, 0.5, vol * 0.4, "triangle");
  }

  private ascensionPass(start: number, vol: number): void {
    const seq = [261.63, 329.63, 392, 523.25, 659.25, 784];
    seq.forEach((f, i) => this.tone(f, start + i * 0.11, 0.6, vol * 0.55, "triangle"));
    this.tone(130.81, start, 1.3, vol * 0.8, "sine", 98);
    this.tone(1046.5, start + 0.66, 0.6, vol * 0.3, "sine");
  }

  private highThreat(start: number, vol: number): void {
    // Warning pulse (three beats) + low bass impact + short alarm.
    for (let i = 0; i < 3; i++) {
      this.tone(196, start + i * 0.28, 0.18, vol * 0.5, "square", 180);
    }
    this.tone(65.41, start, 0.5, vol * 0.9, "sine", 45);
    this.tone(311.13, start + 0.84, 0.35, vol * 0.4, "sawtooth", 277.18);
  }
}

export const monarchSoundManager = new MonarchSoundManager();