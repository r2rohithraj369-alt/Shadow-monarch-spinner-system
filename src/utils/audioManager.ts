/**
 * CENTRALIZED DESIGN HARMONY AUDIO ARCHITECTURE (THE AESTHETIC CHIME ENGINE)
 * Powered by Web Audio API Synthesizers. No static file download dependencies required.
 * Generates beautiful, inspiring, crystal acoustic bell tones, major pentatonic scales,
 * and harmonious ambient drones to motivate the player.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Persisted state
  private masterVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private effectsVolume: number = 0.7;
  private isMuted: boolean = false;

  // Ambient Synthesizer States
  private ambientOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private isAmbientPlaying: boolean = false;
  private lastRankId: string = "E-Rank";
  private lastLevel: number = 1;

  constructor() {
    this.loadSettings();
  }

  /**
   * Load volume settings from storage
   */
  private loadSettings() {
    try {
      const stored = localStorage.getItem("monarch_sys_audio_settings");
      if (stored) {
        const data = JSON.parse(stored);
        this.masterVolume = data.masterVolume !== undefined ? data.masterVolume : 0.8;
        this.musicVolume = data.musicVolume !== undefined ? data.musicVolume : 0.5;
        this.effectsVolume = data.effectsVolume !== undefined ? data.effectsVolume : 0.7;
        this.isMuted = data.isMuted !== undefined ? data.isMuted : false;
      }
    } catch (e) {
      console.warn("Could not read audio settings from storage", e);
    }
  }

  /**
   * Save audio setting profile to registry storage
   */
  private saveSettings() {
    try {
      localStorage.setItem(
        "monarch_sys_audio_settings",
        JSON.stringify({
          masterVolume: this.masterVolume,
          musicVolume: this.musicVolume,
          effectsVolume: this.effectsVolume,
          isMuted: this.isMuted,
        })
      );
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Safe activation of System Audio Engine.
   * Triggered upon user interaction.
   */
  public init() {
    if (this.ctx && this.ctx.state !== "suspended") return;

    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      this.setupAudioGraph();
      this.syncNodeVolumes();

      // Start background ambient engine if configured
      if (!this.isAmbientPlaying && !this.isMuted) {
        this.startAmbientEngine();
      }
    } catch (e) {
      console.error("System Audio Engine failed to calibrate", e);
    }
  }

  private setupAudioGraph() {
    if (!this.ctx) return;

    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.connect(this.masterGain);
  }

  private syncNodeVolumes() {
    const scalarMaster = this.isMuted ? 0 : this.masterVolume;
    const scalarMusic = this.musicVolume;
    const scalarSfx = this.effectsVolume;

    const t = this.ctx && this.ctx.currentTime ? this.ctx.currentTime : 0;

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(scalarMaster, t);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(scalarMusic, t);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(scalarSfx, t);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(scalarMusic * 0.35, t);
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
    this.syncNodeVolumes();
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
    this.syncNodeVolumes();
  }

  public setEffectsVolume(vol: number) {
    this.effectsVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
    this.syncNodeVolumes();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    this.syncNodeVolumes();

    if (this.isMuted) {
      this.stopAmbientEngine();
    } else {
      this.init();
    }
  }

  public getSettings() {
    return {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      effectsVolume: this.effectsVolume,
      isMuted: this.isMuted,
    };
  }

  // Create feedback delay line for spacious high-fidelity sound textures
  private createFeedbackDelay(input: AudioNode, delayTime = 0.25, feedback = 0.3, volume = 0.25) {
    if (!this.ctx) return;
    const delay = this.ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(delayTime, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(feedback, this.ctx.currentTime);

    const mix = this.ctx.createGain();
    mix.gain.setValueAtTime(volume, this.ctx.currentTime);

    input.connect(delay);
    delay.connect(gain);
    gain.connect(delay); // Feedback Loop
    delay.connect(mix);

    if (this.sfxGain) {
      mix.connect(this.sfxGain);
    }
  }

  /**
   * High-Fidelity Clean & Motivating Synthesizer.
   * Leverages additive crystal-sine overtones, soft-decaying envelopes, 
   * and pristine feedback delay networks to inspire and focus the player.
   */
  private triggerSynth(params: {
    frequencies: number[];
    oscType?: OscillatorType;
    duration: number;
    attack: number;
    decay: number;
    detuneRate?: number;
    freqSweep?: number;
    useDelay?: boolean;
    filterType?: BiquadFilterType;
    filterCutoff?: number;
    filterQ?: number;
    [key: string]: any;
  }) {
    this.init(); // Safeguard, ensure context is live
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const masterDest = this.sfxGain;

    // Filter setup: high-frequency soft lowpass filter for beautiful air and no harshness
    const filter = this.ctx.createBiquadFilter();
    filter.type = params.filterType || "lowpass";
    filter.frequency.setValueAtTime(params.filterCutoff || 2200, now);
    filter.Q.setValueAtTime(params.filterQ || 1.1, now);
    filter.connect(masterDest);

    const groupGain = this.ctx.createGain();
    groupGain.connect(filter);

    // Warm, safe gain level scale factor
    const baseVolume = 0.35 / params.frequencies.length;
    groupGain.gain.setValueAtTime(0, now);
    groupGain.gain.linearRampToValueAtTime(baseVolume, now + Math.max(0.005, params.attack));
    groupGain.gain.exponentialRampToValueAtTime(0.0001, now + params.duration);

    params.frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      
      // Harmonics generation: creating acoustic-bell texture with clean sine overtones
      const carrier = this.ctx.createOscillator();
      carrier.type = "sine";
      carrier.frequency.setValueAtTime(freq, now);

      if (params.freqSweep) {
        // Handle custom parameters gracefully
        const sweepTarget = typeof params.freqSweep === 'function' ? freq * 1.5 : params.freqSweep;
        carrier.frequency.exponentialRampToValueAtTime(sweepTarget, now + params.decay + params.attack);
      }
      if (params.detuneRate) {
        carrier.detune.setValueAtTime(idx * 4 - 2, now);
        carrier.detune.linearRampToValueAtTime((idx * 4 - 2) + params.detuneRate, now + params.duration);
      }

      carrier.connect(groupGain);
      carrier.start(now);
      carrier.stop(now + params.duration + 0.05);

      // Add a sparkling crystal overtone (bell harmonic 1)
      const overtone1 = this.ctx.createOscillator();
      const overtoneGain1 = this.ctx.createGain();
      overtone1.type = "sine";
      overtone1.frequency.setValueAtTime(freq * 2.01, now); // Slightly off-octave for beautiful shimmer
      overtoneGain1.gain.setValueAtTime(0, now);
      overtoneGain1.gain.linearRampToValueAtTime(baseVolume * 0.4, now + 0.005);
      overtoneGain1.gain.exponentialRampToValueAtTime(0.0001, now + (params.duration * 0.5));

      overtone1.connect(overtoneGain1);
      overtoneGain1.connect(filter);
      overtone1.start(now);
      overtone1.stop(now + (params.duration * 0.5) + 0.05);

      // Add a higher-frequency twinkle resonance (bell harmonic 2)
      const overtone2 = this.ctx.createOscillator();
      const overtoneGain2 = this.ctx.createGain();
      overtone2.type = "sine";
      overtone2.frequency.setValueAtTime(freq * 3.0, now); // Perfect fifth overtone
      overtoneGain2.gain.setValueAtTime(0, now);
      overtoneGain2.gain.linearRampToValueAtTime(baseVolume * 0.2, now + 0.002);
      overtoneGain2.gain.exponentialRampToValueAtTime(0.0001, now + (params.duration * 0.3));

      overtone2.connect(overtoneGain2);
      overtoneGain2.connect(filter);
      overtone2.start(now);
      overtone2.stop(now + (params.duration * 0.3) + 0.05);
    });

    if (params.useDelay) {
      this.createFeedbackDelay(groupGain, 0.24, 0.25, 0.25);
    }
  }

  /**
   * Helper to play list of notes (a lush harmony chord)
   */
  private playInspiringChord(notes: number[], duration = 2.0, attack = 0.05, useDelay = true) {
    this.triggerSynth({
      frequencies: notes,
      duration,
      attack,
      decay: duration - attack,
      useDelay,
      filterCutoff: 2400,
    });
  }

  /**
   * Helper to play an ascending pentatonic cascade (highly motivating)
   */
  private playUpliftingCascade(notes: number[], delaySpacing = 0.08, duration = 0.8) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    notes.forEach((freq, index) => {
      setTimeout(() => {
        try {
          this.triggerSynth({
            frequencies: [freq],
            duration: duration,
            attack: 0.005,
            decay: duration - 0.005,
            useDelay: index === notes.length - 1, // Add delay shadow to the final note
          });
        } catch (e) {}
      }, index * delaySpacing * 1000);
    });
  }

  /**
   * Helper to play a single sparkling chime/click
   */
  private playSparklingChime(freq: number, duration = 0.5) {
    this.triggerSynth({
      frequencies: [freq],
      duration,
      attack: 0.002,
      decay: duration - 0.002,
      useDelay: false,
    });
  }

  /* ========================================================================
     1. NAVIGATION SOUNDS (Lush, Ambient Portal Swaps)
     ======================================================================== */

  public playTabOpen(tabId: string) {
    const chord = tabId === "DASHBOARD" 
      ? [196.00, 293.66, 392.00, 587.33] // G Major Pentatonic lush chord
      : [220.00, 329.63, 440.00, 659.25]; // A Minor Pentatonic chord
    this.playInspiringChord(chord, 3.0, 0.15, true);
  }

  public playTabSwitch() {
    this.playUpliftingCascade([392.00, 523.25], 0.05, 1.2);
  }

  public playGoDashboard() {
    this.playInspiringChord([130.81, 261.63, 392.00, 523.25, 659.25], 3.5, 0.2, true);
  }

  /* ========================================================================
     2. UI INTERACTIONS (Clean, organic crystal bells)
     ======================================================================== */

  public playButtonPrimary() {
    this.playSparklingChime(523.25, 0.35); // Clean C5 bell pluck
  }

  public playButtonSecondary() {
    this.playSparklingChime(392.00, 0.3); // Clean G4 marimba-like tone
  }

  public playButtonCritical() {
    this.playUpliftingCascade([329.63, 392.00, 523.25], 0.06, 1.0);
  }

  public playButtonDanger() {
    this.playInspiringChord([220.00, 277.18, 329.63], 1.2, 0.05, false);
  }

  public playButtonHover() {
    this.playSparklingChime(880.00, 0.12);
  }

  /* ========================================================================
     3. SYSTEM NOTIFICATIONS (Delicate dual chimes)
     ======================================================================== */

  public playNotificationStandard() {
    this.playUpliftingCascade([523.25, 659.25], 0.04, 0.8);
  }

  public playNotificationSystem() {
    this.playUpliftingCascade([440.00, 554.37, 659.25], 0.06, 1.2);
  }

  public playNotificationPriority() {
    this.playInspiringChord([261.63, 329.63, 523.25, 659.25], 1.5, 0.04, true);
  }

  public playNotificationUrgent() {
    this.playUpliftingCascade([392.00, 523.25, 784.00], 0.05, 1.5);
  }

  /* ========================================================================
     4. QUEST SYSTEM (Motivating, triumphant milestones)
     ======================================================================== */

  public playQuestDiscovered() {
    this.playUpliftingCascade([293.66, 392.00, 440.00], 0.08, 1.1);
  }

  public playQuestGenerated() {
    this.playUpliftingCascade([523.25, 587.33, 659.25, 784.00], 0.05, 1.4);
  }

  public playQuestAccepted() {
    this.playInspiringChord([196.00, 246.94, 293.66, 392.00, 493.88], 2.2, 0.1, true);
  }

  public playQuestCompleted() {
    this.playUpliftingCascade([261.63, 329.63, 392.00, 523.25, 659.25, 784.00], 0.06, 2.5);
  }

  public playQuestChainUnlocked() {
    this.playInspiringChord([130.81, 196.00, 392.00, 523.25, 784.00], 2.8, 0.12, true);
  }

  public playQuestEliteUnlocked() {
    this.playUpliftingCascade([329.63, 440.00, 523.25, 659.25, 880.00], 0.07, 2.4);
  }

  public playQuestLegendaryUnlocked() {
    this.playInspiringChord([196.00, 293.66, 392.00, 587.33, 784.00, 1174.66], 3.5, 0.15, true);
  }

  /* ========================================================================
     5. ACHIEVEMENT SYSTEM (Acoustic laurels in gold scales)
     ======================================================================== */

  public playAchievementUnlocked() {
    this.playUpliftingCascade([523.25, 659.25, 784.00, 1046.50], 0.06, 1.8);
  }

  public playAchievementRare() {
    this.playInspiringChord([293.66, 349.23, 440.00, 587.33, 880.00], 2.5, 0.08, true);
  }

  public playAchievementEpic() {
    this.playUpliftingCascade([440.00, 554.37, 659.25, 880.00, 1108.73], 0.05, 2.2);
  }

  public playAchievementLegendary() {
    this.playUpliftingCascade([261.63, 329.63, 392.00, 523.25, 659.25, 784.00, 1046.50, 1318.51], 0.05, 3.2);
  }

  /* ========================================================================
     6. EVOLUTION CHAMBER (Warm, expanding potential)
     ======================================================================== */

  public playEvolutionOpen() {
    this.playInspiringChord([146.83, 220.00, 293.66, 440.00], 2.0, 0.15, true);
  }

  public playEvolutionEnter() {
    this.playUpliftingCascade([220.00, 329.63, 440.00], 0.08, 1.4);
  }

  public playEvolutionAvailable() {
    this.playUpliftingCascade([392.00, 493.88, 587.33], 0.07, 1.2);
  }

  public playEvolutionComplete() {
    this.playUpliftingCascade([130.81, 261.63, 392.00, 523.25, 659.25, 784.00, 1046.50], 0.05, 2.6);
  }

  public playRankAdvancement() {
    this.playInspiringChord([130.81, 329.63, 392.00, 523.25, 659.25, 784.00, 1046.50], 3.5, 0.2, true);
  }

  public playRankBreakthrough() {
    this.playUpliftingCascade([261.63, 329.63, 392.00, 523.25, 659.25, 784.00, 1046.50, 1318.51, 1567.98], 0.05, 4.0);
  }

  /* ========================================================================
     7. SKILL INTELLIGENCE (Luminous crystal sweeps)
     ======================================================================== */

  public playSkillUnlocked() {
    this.playUpliftingCascade([440.00, 554.37, 659.25], 0.06, 1.3);
  }

  public playSkillUpgraded() {
    this.playUpliftingCascade([523.25, 659.25, 784.00], 0.05, 1.1);
  }

  public playSkillMasteryMilestone() {
    this.playInspiringChord([220.00, 440.00, 659.25, 880.00], 2.2, 0.08, true);
  }

  public playSkillEvolution() {
    this.playUpliftingCascade([261.63, 392.00, 523.25, 784.00, 1046.50], 0.06, 2.4);
  }

  public playSkillReachingMastery() {
    this.playInspiringChord([329.63, 659.25, 987.77, 1318.51], 2.8, 0.1, true);
  }

  /* ========================================================================
     8. LEADERSHIP LOGBOOKS & DATA (Positive training steps)
     ======================================================================== */

  public playTrainingRecorded() {
    this.playSparklingChime(523.25, 0.25);
  }

  public playTrainingStreakIncreased() {
    this.playUpliftingCascade([392.00, 440.00, 523.25], 0.06, 0.82);
  }

  public playTrainingConsistencyMilestone() {
    this.playInspiringChord([196.00, 293.66, 392.00, 587.33], 1.8, 0.06, true);
  }

  public playTrainingNeglected() {
    const chord = [220.00, 261.63, 329.63, 392.00, 523.25]; // Warm supportive resolution
    this.playInspiringChord(chord, 2.0, 0.1, true);
  }

  public playTrainingExtendedInactivity() {
    this.playInspiringChord([164.81, 220.00, 329.63, 440.00], 2.2, 0.12, true);
  }

  /* ========================================================================
     9. ATTENTION ALERTS (Warm and focused guidance, never jarring)
     ======================================================================== */

  public playWarningMinor() {
    this.playSparklingChime(440.00, 0.4);
  }

  public playWarningModerate() {
    this.playInspiringChord([220.00, 277.18, 329.63], 1.0, 0.05, false);
  }

  public playWarningCritical() {
    this.playInspiringChord([164.81, 220.00, 329.63, 440.00], 1.5, 0.08, true);
  }

  public playWarningSevereRisk() {
    this.playInspiringChord([110.00, 220.00, 329.63, 392.00, 523.25], 2.5, 0.1, true);
  }

  /* ========================================================================
     10. PERFORMANCE PARSING (Clean analytics)
     ======================================================================== */

  public playPerformanceReport() {
    this.playUpliftingCascade([523.25, 659.25], 0.06, 0.9);
  }

  public playPerformanceForecast() {
    this.playUpliftingCascade([392.00, 523.25, 659.25], 0.06, 1.2);
  }

  public playPerformanceTrend() {
    this.playUpliftingCascade([440.00, 523.25, 659.25], 0.06, 1.1);
  }

  public playPerformanceGrowth() {
    this.playUpliftingCascade([523.25, 587.33, 659.25], 0.05, 1.0);
  }

  public playPerformancePositive() {
    this.playUpliftingCascade([392.00, 440.00, 523.25, 659.25], 0.06, 1.4);
  }

  public playPerformanceExceptional() {
    this.playUpliftingCascade([261.63, 329.63, 392.00, 523.25, 659.25, 784.00], 0.05, 2.0);
  }

  /* ========================================================================
     11. MATCH CONTESTS & PERFORMANCE EVENTS
     ======================================================================== */

  public playMatchOutstandingOver() {
    this.playUpliftingCascade([392.00, 523.25, 659.25], 0.06, 1.3);
  }

  public playMatchExceptionalSpell() {
    this.playInspiringChord([220.00, 329.63, 440.00, 659.25], 2.2, 0.08, true);
  }

  public playMatchWicketEvent() {
    this.playUpliftingCascade([523.25, 784.00, 1046.50], 0.04, 1.0);
  }

  public playMatchWinningPerformance() {
    this.playInspiringChord([130.81, 261.63, 392.00, 523.25, 659.25, 784.00, 1046.50], 3.8, 0.15, true);
  }

  public playMatchPersonalBest() {
    this.playUpliftingCascade([329.63, 392.00, 523.25, 659.25, 784.00], 0.06, 2.2);
  }

  public playMatchRecordBroken() {
    this.playUpliftingCascade([261.63, 329.63, 392.00, 523.25, 659.25, 784.00, 1046.50, 1174.66, 1318.51], 0.05, 3.5);
  }

  public playMatchPotentialDiscovered() {
    this.playInspiringChord([196.00, 293.66, 392.00, 587.33, 784.00], 2.5, 0.1, true);
  }

  /* ========================================================================
     12. DYNAMIC ADVISORIES (Smart advisor chimes)
     ======================================================================== */

  public playAiRecommendation() {
    this.playUpliftingCascade([440.00, 523.25, 659.25], 0.06, 1.2);
  }

  public playAiWarning() {
    this.playInspiringChord([220.00, 261.63, 329.63], 1.5, 0.08, true);
  }

  public playAiDetectingWeakness() {
    this.playInspiringChord([164.81, 220.00, 329.63], 1.6, 0.1, true);
  }

  public playAiDetectingGrowth() {
    this.playUpliftingCascade([392.00, 440.00, 523.25, 587.33], 0.06, 1.5);
  }

  /* ========================================================================
     13. TRANSITIONS & DIVERSE UTILITIES
     ======================================================================== */

  public playMenuOpen() {
    this.playSparklingChime(523.25, 0.2);
  }

  public playMenuClose() {
    this.playSparklingChime(392.00, 0.18);
  }

  public playModalOpen() {
    this.playInspiringChord([261.63, 329.63, 392.00], 1.2, 0.05, false);
  }

  public playModalClose() {
    this.playSparklingChime(261.63, 0.25);
  }

  public playDrillSuccess() {
    this.playUpliftingCascade([392.00, 523.25], 0.06, 0.7);
  }

  public playDrillFailure() {
    this.playUpliftingCascade([293.66, 329.63], 0.08, 0.8);
  }

  public playSimulationRun() {
    this.playUpliftingCascade([261.63, 329.63, 392.00, 523.25, 659.25], 0.05, 1.4);
  }

  public playAiGeneratingQuest() {
    this.playQuestGenerated();
  }

  public playAiGeneratingForecast() {
    this.playPerformanceForecast();
  }

  /* ========================================================================
     14. BACKGROUND AMBIENT AUDIO ENGINE
     ======================================================================== */

  public startAmbientEngine() {
    if (!this.ctx) {
      this.init();
      return;
    }
    if (!this.ambientGain || this.isAmbientPlaying || this.isMuted) return;

    this.isAmbientPlaying = true;
    const now = this.ctx.currentTime;

    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = "lowpass";
    this.ambientFilter.frequency.setValueAtTime(140, now); // Soft machine low hum
    this.ambientFilter.Q.setValueAtTime(2.0, now);
    this.ambientFilter.connect(this.ambientGain);

    const baseFreq = this.getBaseFrequencyForRank(this.lastRankId);
    const droneVoicings = [1.0, 1.5, 2.0];

    droneVoicings.forEach((ratio, index) => {
      if (!this.ctx || !this.ambientFilter) return;

      const osc = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();

      osc.type = index === 2 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(baseFreq * ratio, now);
      osc.detune.setValueAtTime((index * 6) - 3, now);

      voiceGain.gain.setValueAtTime(0, now);
      voiceGain.gain.linearRampToValueAtTime(0.22 / droneVoicings.length, now + 3.0);

      osc.connect(voiceGain);
      voiceGain.connect(this.ambientFilter);
      osc.start(now);

      this.ambientOscs.push({ osc, gain: voiceGain });
    });

    this.ambientLfo = this.ctx.createOscillator();
    this.ambientLfo.type = "sine";
    this.ambientLfo.frequency.setValueAtTime(0.08, now);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(45, now);

    this.ambientLfo.connect(lfoGain);
    if (this.ambientFilter) {
      lfoGain.connect(this.ambientFilter.frequency);
    }
    this.ambientLfo.start(now);
  }

  public updateAmbientMetrics(rankId: string, level: number) {
    this.lastRankId = rankId;
    this.lastLevel = level;

    if (!this.ctx || !this.isAmbientPlaying || this.isMuted) return;

    const now = this.ctx.currentTime;
    const targetBase = this.getBaseFrequencyForRank(rankId);

    if (this.ambientFilter) {
      const targetCutoff = 120 + Math.min(level * 2, 100);
      this.ambientFilter.frequency.exponentialRampToValueAtTime(targetCutoff, now + 5.0);
    }

    const droneVoicings = [1.0, 1.5, 2.0];
    this.ambientOscs.forEach((voice, index) => {
      const targetFreq = targetBase * droneVoicings[index];
      voice.osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 6.0);
    });
  }

  private getBaseFrequencyForRank(rankId: string): number {
    if (rankId.includes("Monarch")) return 36.71;
    if (rankId.includes("S-Rank") || rankId.includes("SSS-Rank")) return 41.20;
    if (rankId.includes("A-Rank") || rankId.includes("B-Rank")) return 48.99;
    return 55.00;
  }

  public stopAmbientEngine() {
    if (!this.isAmbientPlaying) return;
    this.isAmbientPlaying = false;

    const now = this.ctx ? this.ctx.currentTime : 0;

    this.ambientOscs.forEach((voice) => {
      try {
        if (this.ctx) {
          voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
          voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
          setTimeout(() => {
            try {
              voice.osc.stop();
              voice.osc.disconnect();
              voice.gain.disconnect();
            } catch (e) {}
          }, 1600);
        }
      } catch (e) {}
    });

    this.ambientOscs = [];

    if (this.ambientLfo) {
      try {
        this.ambientLfo.stop();
        this.ambientLfo.disconnect();
      } catch (e) {}
      this.ambientLfo = null;
    }

    if (this.ambientFilter) {
      this.ambientFilter.disconnect();
      this.ambientFilter = null;
    }
  }
}

export const audioManager = new AudioManager();
