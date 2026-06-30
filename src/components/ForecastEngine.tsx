import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, Clock, AlertCircle, Compass, Zap, 
  HelpCircle, LineChart, ShieldCheck, Trophy, Sparkles,
  Award, ArrowUpRight, CheckCircle2, BookOpen, Layers, 
  Activity, Minimize2, Gauge, Landmark, Milestone, ShieldAlert
} from "lucide-react";
import { PlayerProfile, AIAnalysisResponse, SkillItem, DungeonRecord } from "../types";
import { playSystemClick, playSystemDing } from "../utils/audio";

interface ForecastEngineProps {
  player: PlayerProfile;
  aiAnalysis: AIAnalysisResponse | null;
  skills: SkillItem[];
  dungeons: DungeonRecord[];
  onRefreshForecast: () => void;
  isEvaluating: boolean;
}

interface RankInfo {
  rank: string;
  levelNeeded: number;
  title: string;
  masteryNeeded: number;
  dungeonThreatNeeded: number;
  dungeonEconomyTarget: string;
  description: string;
}

const ALL_RANKS: RankInfo[] = [
  { rank: "E-Rank", levelNeeded: 1, title: "The Rookie Spinner", masteryNeeded: 100, dungeonThreatNeeded: 30, dungeonEconomyTarget: "< 7.5", description: "Humble beginner entry rank. Setup parameters require primary flight calibration." },
  { rank: "D-Rank", levelNeeded: 5, title: "The Calibration Novice", masteryNeeded: 250, dungeonThreatNeeded: 45, dungeonEconomyTarget: "< 6.5", description: "Establish dynamic spin coordinates. Log 1 complete training session in the nets with at least 4 perfect balls." },
  { rank: "C-Rank", levelNeeded: 12, title: "The Grid Controller", masteryNeeded: 400, dungeonThreatNeeded: 55, dungeonEconomyTarget: "< 5.8", description: "Satisfy basic wrist snap and drift setups. Achieve at least 15 dot balls or land 10 deliveries near the batsmen's toes." },
  { rank: "B-Rank", levelNeeded: 22, title: "The Deception Adept", masteryNeeded: 550, dungeonThreatNeeded: 65, dungeonEconomyTarget: "< 5.2", description: "Prove intermediate spin trajectory deception. Upgrade Googly to level 5, and restrict batsman target runs to under 25." },
  { rank: "A-Rank", levelNeeded: 35, title: "The Trajectory Controller", masteryNeeded: 700, dungeonThreatNeeded: 75, dungeonEconomyTarget: "< 4.8", description: "Execute elite length control variants under pressure. Complete 1 Pressure challenge with under 18 runs conceded." },
  { rank: "S-Rank", levelNeeded: 50, title: "Elite Sovereign Bowler", masteryNeeded: 850, dungeonThreatNeeded: 85, dungeonEconomyTarget: "< 4.2", description: "Attain elite visual deflection variables. Capture 3 wickets inside a single match dungeon using Flipper setups." },
  { rank: "SS-Rank", levelNeeded: 70, title: "The Shadow Sentinel", masteryNeeded: 1000, dungeonThreatNeeded: 90, dungeonEconomyTarget: "< 3.8", description: "Demonstrate supreme endurance. Bowl 20 legal overs inside the Evolution Chamber while maintaining an economy rate below 5.0." },
  { rank: "SSS-Rank", levelNeeded: 90, title: "Absolute Mortal Apex", masteryNeeded: 1250, dungeonThreatNeeded: 95, dungeonEconomyTarget: "< 3.5", description: "Complete the ultimate mortal trials under loaded stress. Defeat extreme match simulator pressure conceding zero boundaries." },
  { rank: "Shadow Monarch", levelNeeded: 100, title: "The Shadow Monarch", masteryNeeded: 1500, dungeonThreatNeeded: 98, dungeonEconomyTarget: "< 3.0", description: "Ascend past the mortal bounds of spin technology. Master 'Absolute Arcane Drift' metrics and unlock all 5 core skills." },
  { rank: "Frost Shadow Monarch", levelNeeded: 110, title: "Frost Shadow Sovereign", masteryNeeded: 1650, dungeonThreatNeeded: 98, dungeonEconomyTarget: "< 2.8", description: "Shatter the batsman's footwork with absolute glacial zero shadow-drift and frozen length variations." },
  { rank: "Iron Shadow Monarch", levelNeeded: 120, title: "Iron Shadow Sovereign", masteryNeeded: 1800, dungeonThreatNeeded: 99, dungeonEconomyTarget: "< 2.5", description: "Solidify shadow-stamina density limits. Unbreakable line and length control and iron grip spin stability." },
  { rank: "Feral Shadow Monarch", levelNeeded: 130, title: "Feral Shadow Sovereign", masteryNeeded: 1950, dungeonThreatNeeded: 99, dungeonEconomyTarget: "< 2.2", description: "Infuse raw primal speed and beast-like deception into spin delivery angles. Fierce strike rate dominance." },
  { rank: "Plague Shadow Monarch", levelNeeded: 145, title: "Plague Shadow Sovereign", masteryNeeded: 2100, dungeonThreatNeeded: 99.5, dungeonEconomyTarget: "< 2.0", description: "Infect the batsman's strike zone parameters with dark corrosive shadow spin paths that trigger fatal defensive errors." },
  { rank: "Flame Shadow Monarch", levelNeeded: 160, title: "Flame Shadow Sovereign", masteryNeeded: 2300, dungeonThreatNeeded: 99.8, dungeonEconomyTarget: "< 1.8", description: "Engage spectral flame-like spin rate spikes. Complete a 5-over sequence under high load without conceding boundaries." },
  { rank: "Abyssal Shadow Monarch", levelNeeded: 180, title: "Abyssal Shadow Sovereign", masteryNeeded: 2600, dungeonThreatNeeded: 99.9, dungeonEconomyTarget: "< 1.5", description: "Annihilate defender coordinates. Completely silence batsmen using abyssal void drift and unpredictable spin release." },
  { rank: "Absolute Shadow Monarch", levelNeeded: 200, title: "Absolute Supreme Shadow Monarch", masteryNeeded: 3000, dungeonThreatNeeded: 100, dungeonEconomyTarget: "0 Boundaries", description: "Claim absolute sovereign dominion over the entire spin cosmos. Total average attribute score must hit the immaculate 1000 limit." }
];

export default function ForecastEngine({
  player,
  aiAnalysis,
  skills = [],
  dungeons = [],
  onRefreshForecast,
  isEvaluating,
}: ForecastEngineProps) {
  // Navigation: PREDICTOR vs SYSTEM_ENCYCLOPEDIA
  const [activeSubTab, setActiveSubTab] = useState<"PROJECTIONS" | "ENCYCLOPEDIA">("PROJECTIONS");
  const [showShadowPath, setShowShadowPath] = useState(false);
  const [selectedRankIndex, setSelectedRankIndex] = useState<number>(1); // Defaults to D-Rank

  const finalPercent = aiAnalysis ? aiAnalysis.forecastPercent : player.probabilityOfNextStatus;

  // Real-time sports metrics
  const totalWickets = dungeons.reduce((sum, d) => sum + d.wickets, 0);
  const avgEconomy = dungeons.length > 0
    ? Number((dungeons.reduce((sum, d) => sum + d.economy, 0) / dungeons.length).toFixed(2))
    : 6.2;
  const bestSkillName = skills.length > 0 
    ? [...skills].sort((a,b) => b.level - a.level)[0]?.name 
    : "Leg Break";

  // Dynamic system reasoning
  const reasons = (aiAnalysis && aiAnalysis.forecastReason) || [
    `Rotational velocity on ${bestSkillName} is ascending by +6.2% weekly.`,
    `Performance load with ${totalWickets} career combat takedowns is sufficient.`,
    `Active match economy of ${avgEconomy} is approaching state threshold limit.`
  ];

  // MATHEMATICALLY CORRECT DYNAMIC VELOCITY MODELING:
  // Base progression speed = 1.2 levels per real-time day.
  // Modifiers: player efficiency decreases required days, dungeon frequency decreases days, skill levels accelerate tracking parameters.
  const levelSlowdownFactor = Math.max(0.2, 1 - (player.level * 0.002));
  const efficiencyBonus = player.efficiency / 45; // baseline efficiency is 45
  const dungeonsVolumeMultiplier = 1 + (dungeons.length * 0.06);
  const topSkillLevel = skills.length > 0 ? Math.max(...skills.map(s => s.level)) : 1;
  const skillsVelocityBonus = 1 + (topSkillLevel * 0.03);

  // Computed levels cleared per simulated active training day
  const dailyVelocity = Math.max(0.4, 1.2 * levelSlowdownFactor * efficiencyBonus * dungeonsVolumeMultiplier * skillsVelocityBonus);

  // Safe helper counting days to any level threshold from the player's actual level:
  const computeDaysToLevel = (targetLvl: number) => {
    if (player.level >= targetLvl) return 0;
    const diff = targetLvl - player.level;
    return Math.ceil(diff / dailyVelocity);
  };

  // Timeline numbers are now mathematically aligned and dynamically accurate!
  const daysToNextStatus = computeDaysToLevel(
    ALL_RANKS.find((r) => r.rank === player.nextStatus)?.levelNeeded || (player.level + 4)
  );

  const daysToS_Rank = computeDaysToLevel(50);
  const daysToMonarch = computeDaysToLevel(100);

  // Real-life Cricket Career Metrics
  const totalDungeonBalls = dungeons.reduce((sum, d) => sum + (d.overs * 6), 0);
  const totalNetBalls = player.level > 0 ? (player.level * 36) : 0;
  const grandTotalBalls = totalDungeonBalls + totalNetBalls;
  const careerOvers = (grandTotalBalls / 6).toFixed(1);

  // Real spinner release rate: professional spin bowlers clock around 1600-2400 RPM
  const currentRPM = player.level > 0 ? (1600 + Math.min(800, (player.level * 10) + (player.efficiency * 2))) : 0;

  // Lateral angle break deviation (usually around 1.5 to 6.5 degrees inside pitch dust layers)
  const lateralDeviationDegrees = player.level > 0 ? (1.5 + (Math.min(99, player.efficiency) * 0.05)).toFixed(1) : "0.0";

  // Bowling strike rate: balls bowled per wicket taken
  const careerWickets = totalWickets > 0 ? totalWickets : (player.level > 0 ? Math.max(1, Math.round(player.level * 1.5)) : 0);
  const careerStrikeRate = careerWickets > 0 ? (grandTotalBalls / careerWickets).toFixed(1) : "0.0";

  // Dot ball percentage (vital real wicket pressure statistic)
  const totalDotBalls = dungeons.reduce((sum, d) => sum + d.dotBalls, 0) + (player.level > 0 ? Math.round(totalNetBalls * 0.65) : 0);
  const dotBallPercent = grandTotalBalls > 0 ? ((totalDotBalls / grandTotalBalls) * 100).toFixed(1) : "0.0";

  // Dynamic diagnostic warning
  const weakSkill = skills.find(s => s.mastery < 450) || skills[skills.length - 1];
  const diagnosticText = weakSkill
    ? `CALIBRATING '${weakSkill.name.toUpperCase()}' REVOLUTIONS ACCELERATES ROADMAP TO NEXT STATUS BY ${Math.max(1, Math.round(6 / dailyVelocity))} DAYS.`
    : "PERFECT LENGTH AND WREST GRIP CONFIRMED! LIMITER LEVEL STABILIZED FOR SUB-ZERO DEVIATION.";

  // Cryptographic Shadow Monarch Path criteria
  const shadowCriteria = [
    { label: "Reach Career Level 25+", status: player.level >= 25, val: `Level ${player.level} / 25` },
    { label: "Secure minimum Level 12 Skill Mastery", status: skills.some(s => s.level >= 12), val: `Max Skill: Lvl ${skills.length > 0 ? Math.max(...skills.map(s => s.level)) : 0}` },
    { label: "Complete 3 Active Dungeons", status: dungeons.length >= 3, val: `${dungeons.length} / 3 Logged` },
    { label: "Unlock at least 1 Epic Spin variation", status: skills.some(s => s.rarity === "EPIC" || s.rarity === "LEGENDARY"), val: "Rarity Check" },
    { label: "Earn career evaluation score > 85%", status: dungeons.some(d => d.threatEliminationScore >= 85), val: "Max evaluation checked" }
  ];

  const revealedCount = shadowCriteria.filter(c => c.status).length;
  const pathPercentage = Math.round((revealedCount / shadowCriteria.length) * 100);

  const selectedRankData = ALL_RANKS[selectedRankIndex];

  return (
    <div className="p-6 bg-[#0c0c0c] border border-[#00D9FF]/10 rounded-2xl relative overflow-hidden space-y-6 shadow-2xl">
      {/* Absolute side glowing lines */}
      <div className="absolute right-0 top-0 h-[300px] w-[1px] bg-gradient-to-b from-[#00D9FF] to-transparent pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-[200px] w-[1px] bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none" />

      {/* NEW INTEGRAL MULTI-TAB HEADERS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-gray-900">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black font-mono tracking-wider text-[#00D9FF] flex items-center gap-2">
              <LineChart className="w-5 h-5 text-[#00D9FF] animate-pulse" /> NEURAL PROBABILITY ENGINE
            </h3>
            <span className="text-[9px] font-mono bg-cyan-950/30 border border-cyan-500/30 text-cyan-405 px-1.5 py-0.2 rounded uppercase">
              ACTIVE STABILIZED
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">DETERMINISTIC SPIN METRICS & ASCENSION CALIBRATOR</span>
        </div>

        {/* TAB CONTROLLERS AND TRIGGER */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub Tab buttons */}
          <div className="bg-black p-0.5 rounded-lg border border-gray-900 flex">
            <button
              onClick={() => { playSystemClick(); setActiveSubTab("PROJECTIONS"); }}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition ${
                activeSubTab === "PROJECTIONS"
                  ? "bg-cyan-950/20 text-[#00D9FF] border border-cyan-500/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Activity className="w-3 h-3 inline mr-1" />
              Neural Predictions
            </button>
            <button
              onClick={() => { playSystemClick(); setActiveSubTab("ENCYCLOPEDIA"); }}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition ${
                activeSubTab === "ENCYCLOPEDIA"
                  ? "bg-purple-950/20 text-purple-400 border border-purple-500/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <BookOpen className="w-3 h-3 inline mr-1" />
              Sovereign System Database
            </button>
          </div>

          <div className="flex gap-2">
            {activeSubTab === "PROJECTIONS" && (
              <button
                onClick={() => { playSystemClick(); setShowShadowPath(!showShadowPath); }}
                className="px-3 py-1.5 bg-[#121212] border border-gray-900 hover:border-purple-500/30 text-[10px] font-mono font-bold text-gray-400 hover:text-white rounded transition cursor-pointer"
              >
                {showShadowPath ? "SHOW TIMELINES" : "SHADOW PATH"}
              </button>
            )}

            <button
              onClick={() => { playSystemClick(); onRefreshForecast(); }}
              disabled={isEvaluating}
              className="px-4 py-1.5 bg-[#00D9FF]/10 border border-[#00D9FF]/40 hover:bg-[#00D9FF]/20 text-[10px] font-mono font-black tracking-wider text-[#00D9FF] rounded transition flex items-center gap-1.5 uppercase cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  DOCKING TELEMETRICS...
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                  RE-RUN FORECASTER
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "PROJECTIONS" ? (
          /* TAB 1: NEURAL PREDICTIONS (PROJECTION SCHEDULER & GAUGES) */
          <motion.div
            key="projections-module"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {!showShadowPath ? (
              <div className="space-y-6">
                {/* TIMELINE ROAMAP ROW & PROGRESS DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Item 1: Next status timeline */}
                  <div className="p-4 bg-black/60 border border-gray-950 rounded-xl relative shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                    <span className="text-[8px] font-mono text-cyan-400 block uppercase font-bold tracking-widest">
                      GATEWAY 1: NEXT RANK TARGETTIME
                    </span>
                    <h4 className="text-sm font-black font-sans text-white uppercase mt-1 leading-none">
                      {player.currentStatus} &rarr; {player.nextStatus}
                    </h4>
                    
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-2xl font-mono font-bold text-[#00D9FF]">
                        {daysToNextStatus === 0 ? "ASCENSION READY" : `~${daysToNextStatus} Days`}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">at current vel</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-gray-400 leading-tight">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                      <span>Requirements: Reach Level {ALL_RANKS.find(r => r.rank === player.nextStatus)?.levelNeeded || player.level + 4}</span>
                    </div>
                  </div>

                  {/* Item 2: S-Rank Elite Roadmap Timeline */}
                  <div className="p-4 bg-black/60 border border-gray-950 rounded-xl relative shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                    <span className="text-[8px] font-mono text-purple-400 block uppercase font-bold tracking-widest">
                      GATEWAY 2: HIGH ELITE S-RANK HORIZON
                    </span>
                    <h4 className="text-sm font-black font-sans text-white uppercase mt-1 leading-none">
                      {player.level >= 50 ? "S-Rank Achieved" : `Level ${player.level} \u2192 Level 50 Elite`}
                    </h4>
                    
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-2xl font-mono font-bold text-purple-400">
                        {daysToS_Rank === 0 ? "PASSED" : `~${daysToS_Rank} Days`}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">absolute countdown</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-gray-400 leading-tight">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                      <span>Locks the "Elite Sovereign Bowler" legendary title milestone.</span>
                    </div>
                  </div>

                  {/* Item 3: Shadow Monarch Ultimate Horizon */}
                  <div className="p-4 bg-black/60 border border-gray-950 rounded-xl relative shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                    <span className="text-[8px] font-mono text-yellow-500 block uppercase font-bold tracking-widest">
                      GATEWAY 3: SHADOW MONARCH APEX
                    </span>
                    <h4 className="text-sm font-black font-sans text-white uppercase mt-1 leading-none">
                      {player.level >= 100 ? "Monarch Achieved" : `Level ${player.level} \u2192 Level 100 Sovereign`}
                    </h4>
                    
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-2xl font-mono font-bold text-yellow-405 text-yellow-400">
                        {daysToMonarch === 0 ? "PASSED" : `~${daysToMonarch} Days`}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">cosmological limit</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-gray-400 leading-tight">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span>Ultimate masteries, unlocked variables limit 100.</span>
                    </div>
                  </div>
                </div>

                {/* PROPORTIONAL ROADMAP TIMESTAMPS BAR CHART LINE */}
                <div className="p-4 bg-black rounded-xl border border-gray-950 space-y-3 font-mono">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-gray-400 uppercase font-bold flex items-center gap-1">
                      <Milestone className="w-4 h-4 text-purple-400" />
                      Deterministic Progress Checklist Roadmap
                    </span>
                    <span className="text-[9px] text-[#00D9FF]">Daily Rate: +{dailyVelocity.toFixed(2)} Levels/day</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10.5px]">
                    {[
                      { code: "D-Rank", target: 5, label: "Novice" },
                      { code: "C-Rank", target: 12, label: "Grid Controller" },
                      { code: "B-Rank", target: 22, label: "Deception" },
                      { code: "S-Rank", target: 50, label: "Sovereign" },
                      { code: "Shadow Monarch", target: 100, label: "Shadow" }
                    ].map((step, idx) => {
                      const daysLeft = computeDaysToLevel(step.target);
                      const isCleared = player.level >= step.target;

                      return (
                        <div 
                          key={idx} 
                          className={`p-2.5 rounded-lg border text-center ${
                            isCleared 
                              ? "bg-green-950/10 border-green-500/20 text-green-300" 
                              : "bg-[#090909] border-gray-900 text-gray-500"
                          }`}
                        >
                          <span className="text-[9px] font-bold block">{step.code}</span>
                          <span className="text-[8px] text-gray-500 block truncate uppercase">{step.label}</span>
                          {isCleared ? (
                            <span className="text-[9px] text-green-400 font-extrabold mt-1 block uppercase">CLEARED</span>
                          ) : (
                            <span className="text-[10px] text-white font-black mt-1 block">
                              ~{daysLeft} days
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PROACTIVE DDA LIMITER WARNING IMPACT Diagnostic */}
                <div className="p-4 bg-red-950/20 border-l-4 border-l-red-500 border border-gray-950 rounded-r-xl flex items-center gap-3.5 shadow-md">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <span className="text-[9.5px] font-mono text-red-400 font-black tracking-wider block uppercase">
                      PROACTIVE VELOCITY CORRECTION MATRIX
                    </span>
                    <p className="text-xs text-white font-mono font-bold mt-1 uppercase leading-snug">
                      {diagnosticText}
                    </p>
                  </div>
                </div>

                {/* MATRIX DATA SPLIT BOARD */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Circular proximity index */}
                  <div className="lg:col-span-5 p-5 bg-[#0e0e0e] rounded-xl border border-gray-950 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block tracking-wider mb-2.5">
                      SELECTION SEVERITY INDEX
                    </span>

                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="58" stroke="#101010" strokeWidth="4" fill="transparent" />
                        <motion.circle
                          cx="72"
                          cy="72"
                          r="58"
                          stroke="#7B2FFF"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray="364"
                          initial={{ strokeDashoffset: 364 }}
                          animate={{ strokeDashoffset: 364 - (364 * finalPercent) / 100 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="text-center">
                        <span className="text-3xl font-black font-mono text-white tracking-tighter">{finalPercent}%</span>
                        <span className="text-[8px] font-mono text-gray-500 block uppercase mt-0.5">Selection Prox</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 mt-4 leading-relaxed bg-[#141414] border border-gray-900 rounded px-2.5 py-1">
                      IMMEDIATE ASCENSION TARGET: <strong className="text-purple-400 uppercase">{player.nextStatus}</strong>
                    </span>
                  </div>

                  {/* Debrief logs feedback stream */}
                  <div className="lg:col-span-7 p-5 bg-[#121212]/50 rounded-xl border border-gray-950 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-cyan-400 font-extrabold tracking-widest block uppercase">
                        📡 NEURAL COMPILER LOG OUTPUTS
                      </span>

                      <div className="space-y-2">
                        {reasons.slice(0, 3).map((reason, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-black p-2.5 rounded border border-gray-950 text-xs font-mono text-gray-300">
                            <TrendingUp className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                              {reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[9.5px] font-mono text-gray-500 italic flex items-center gap-1.5 pt-2 border-t border-gray-950">
                      <Compass className="w-4 h-4 text-gray-600 animate-spin-slow" />
                      <span>Auto updates computed on active metrics, dungeon clears, & attributes load factor.</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* CRYPTOGRAPHIC SHADOW MONARCH CHECKLIST */
              <div className="space-y-5">
                <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#FFD700] flex items-center gap-1.5 uppercase">
                      <Sparkles className="text-[#FFD700] w-4.5 h-4.5 animate-spin-slow" />
                      CRYPTOGRAPHIC SHADOW PATH PROGRESS
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{pathPercentage}% REVEALED</span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900 flex items-center">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7B2FFF] to-[#FFD700] rounded-full transition-all"
                      style={{ width: `${pathPercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                    Unlock criteria blocks sequentially to expose the legendary "Shadow Monarch" elite status blueprint! Currently processed at Level {player.level}.
                  </p>
                </div>

                {/* Checklist items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shadowCriteria.map((c, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-all font-mono text-xs ${
                        c.status
                          ? "bg-purple-950/10 border-purple-500/20 text-white"
                          : "bg-black/35 border-gray-950 text-gray-650 opacity-40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {c.status ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-green-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-gray-800 shrink-0" />
                        )}
                        <span className="truncate max-w-[200px] sm:max-w-none">{c.label}</span>
                      </div>
                      <span className="text-[9px] font-bold text-purple-400 bg-purple-950/25 px-1.5 rounded">{c.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* TAB 2: SOVEREIGN SYSTEM DATABASE / ENCYCLOPEDIA ARCHIVE */
          <motion.div
            key="system-encyclopedia"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Quick selectors list */}
            <div className="lg:col-span-5 bg-[#070707] border border-gray-900 p-4 rounded-xl flex flex-col gap-3 min-h-[350px]">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block border-b border-gray-950 pb-2">
                CHOOSE SYSTEM STATUS GRID (16 MODULES)
              </span>

              <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1 font-mono">
                {ALL_RANKS.map((item, idx) => {
                  const isCurrent = player.currentStatus === item.rank;
                  const isNext = player.nextStatus === item.rank;
                  const isSelected = selectedRankIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => { playSystemClick(); setSelectedRankIndex(idx); }}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer text-xs ${
                        isSelected 
                          ? "bg-purple-950/20 border-[#7B2FFF] text-white" 
                          : "bg-black border-gray-950 text-gray-400 hover:text-white hover:border-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isCurrent ? "bg-green-400" : isNext ? "bg-cyan-400 animate-pulse" : "bg-gray-800"
                        }`} />
                        <span className="font-extrabold">{item.rank}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px]">
                        <span className="text-gray-500">LV {item.levelNeeded}</span>
                        {isCurrent && (
                          <span className="text-[8px] bg-green-950/40 text-green-400 px-1 rounded uppercase font-black">
                            ACTIVE
                          </span>
                        )}
                        {isNext && (
                          <span className="text-[8px] bg-cyan-950/40 text-[#00D9FF] px-1 rounded uppercase font-black">
                            NEXT
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: High detail visual breakdown card */}
            <div className="lg:col-span-7 bg-[#0a0a0a] border border-gray-900 p-5 rounded-xl font-mono flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-gray-950 pb-3">
                  <div>
                    <span className="text-[9px] text-[#7B2FFF] uppercase font-bold block">
                      SYSTEM STATUS COGNITION DETAILS
                    </span>
                    <h3 className="text-lg font-black text-white mt-1 uppercase">
                      {selectedRankData.rank} Status Matrix
                    </h3>
                  </div>

                  <div className="p-2 bg-purple-950/15 border border-purple-500/20 rounded-lg text-center leading-none">
                    <span className="text-[8px] text-gray-500 block">LEVEL MIN</span>
                    <strong className="text-sm font-bold text-purple-400 mt-1 block">
                      LV {selectedRankData.levelNeeded}
                    </strong>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-gray-300">
                  {/* Awarded title */}
                  <div className="flex justify-between items-center bg-black p-2.5 rounded-lg border border-gray-950 leading-tight">
                    <span className="text-gray-500 text-[10px]">AWARDED ELITE TITLE:</span>
                    <strong className="text-[#FFD700] text-right font-black uppercase text-[11px] scale-102">
                      🏆 {selectedRankData.title}
                    </strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-gray-500 uppercase block">Ascension Challenge Milestone:</span>
                    <p className="p-3 bg-black/60 rounded-lg border border-gray-950 text-[11px] text-gray-400 leading-relaxed font-sans">
                      {selectedRankData.description}
                    </p>
                  </div>

                  {/* Benchmark thresholds breakdown layout */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 bg-black rounded-lg border border-gray-950 text-[10.5px]">
                      <span className="text-gray-600 block text-[8px] uppercase tracking-wider mb-1 font-extrabold pb-1 border-b border-gray-950">
                        SKILL MASTERY THRESHOLD
                      </span>
                      <strong className="text-[#00D9FF]">
                        {selectedRankData.masteryNeeded} Cumulative XP
                      </strong>
                      <span className="text-[9px] text-gray-550 block mt-0.5 font-sans">
                        Current: {skills.reduce((sum, s) => sum + s.mastery, 0)} Combined XP
                      </span>
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-gray-950 text-[10.5px]">
                      <span className="text-gray-600 block text-[8px] uppercase tracking-wider mb-1 font-extrabold pb-1 border-b border-gray-950">
                        DUNGEON OUTCOMES METRIC
                      </span>
                      <strong className="text-yellow-405 text-yellow-400">
                        {selectedRankData.dungeonEconomyTarget} Economy rate
                      </strong>
                      <span className="text-[9px] text-gray-550 block mt-0.5 font-sans">
                        Requires {selectedRankData.dungeonThreatNeeded}% Threat Clear rating
                      </span>
                    </div>
                  </div>

                  {/* Real-life Cricket Career Metrics */}
                  <div className="p-3.5 bg-black rounded-lg border border-gray-950 space-y-2">
                    <span className="text-[9px] text-[#00D9FF] uppercase tracking-wider block font-extrabold pb-1.5 border-b border-gray-950">
                      🏏 SYSTEM REAL-LIFE CRICKET STATISTICAL INTEGRATION
                    </span>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-[#09090b] p-2 rounded border border-gray-950">
                        <span className="text-[8px] text-gray-500 block uppercase">Total Balls Bowled:</span>
                        <strong className="text-white text-xs">{grandTotalBalls} Balls</strong>
                        <span className="text-[8px] text-gray-650 block mt-0.5 font-sans">
                          ~{careerOvers} Standard Overs
                        </span>
                      </div>

                      <div className="bg-[#09090b] p-2 rounded border border-gray-950">
                        <span className="text-[8px] text-gray-500 block uppercase">Perfect Balls Bowled:</span>
                        <strong className="text-cyan-400 text-xs">{Math.round(grandTotalBalls * 0.42 + (player.level * 2.5))} Deliveries</strong>
                        <span className="text-[8px] text-gray-650 block mt-0.5 font-sans">
                          Pitch-Map Accuracy Indicator
                        </span>
                      </div>

                      <div className="bg-[#09090b] p-2 rounded border border-gray-950 col-span-2 md:col-span-1">
                        <span className="text-[8px] text-gray-500 block uppercase">Total Career Wickets:</span>
                        <strong className="text-green-300 text-xs">{careerWickets} Wickets</strong>
                        <span className="text-[8px] text-gray-650 block mt-0.5 font-sans">
                          Strike Rate: {careerStrikeRate} balls/wkt
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-950 text-[9.5px] text-gray-500 leading-snug">
                ℹ️ <strong>System Note:</strong> Progression is registered in the <strong>Ascension Core Chamber</strong> tab. The system validates whether Rohith Raj meets the listed Level & Control credentials before triggering rank-up.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
