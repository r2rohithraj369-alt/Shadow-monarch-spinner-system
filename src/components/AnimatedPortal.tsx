import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Trophy, Zap, CheckCircle, Flame, Star, 
  ShieldCheck, Lock, ChevronRight, Info, AlertOctagon, 
  Target, BarChart2, Shield, Activity, HelpCircle, AlertCircle
} from "lucide-react";
import { RANK_REQUIREMENTS_LIST, getRankRequirements } from "../utils/rankRequirements";
import { PracticeQuest } from "../types";
import PlayerAvatar from "./PlayerAvatar";

interface AnimatedPortalProps {
  onSuccess: (rankPassed: string, proposedTitle: string) => void;
  onFailure: () => void;
  attemptsLeft: number;
  completed: boolean;
  failed: boolean;
  nextTitleProposed: string;
  challengeText: string;
  currentLevel: number;
  currentControl: number;
  isQuestCompleted: boolean;
  nextStatus: string;
  onAcknowledge?: () => void;
  
  practiceQuests?: PracticeQuest[];
  activePracticeQuestId?: string | null;
  onActivatePracticeQuest?: (questId: string | null) => void;
  onAddPracticeQuest?: (quest: PracticeQuest) => void;
  onNavigateToTab?: (tabId: string) => void;
  weakestSkillName?: string;
  weakestSkillId?: string;

  player: any;
  skills: any[];
  attributes: any[];
  dungeons: any[];
}

export default function AnimatedPortal({
  onSuccess,
  onFailure,
  attemptsLeft,
  completed,
  failed,
  nextTitleProposed,
  challengeText,
  currentLevel,
  currentControl,
  isQuestCompleted,
  nextStatus = "D-Rank",
  onAcknowledge,
  practiceQuests = [],
  activePracticeQuestId = null,
  onActivatePracticeQuest,
  onAddPracticeQuest,
  onNavigateToTab,
  weakestSkillName = "LEG BREAK",
  weakestSkillId = "s1",
  player,
  skills = [],
  attributes = [],
  dungeons = []
}: AnimatedPortalProps) {

  // Fetch current requirements for the player's Next Rank
  const req = RANK_REQUIREMENTS_LIST.find(
    (r) => r.nextRankName.toLowerCase() === nextStatus.toLowerCase()
  ) || getRankRequirements(nextStatus);

  if (!req) {
    // If no next requirements are found, it means they are at maximum rank!
    return (
      <div className="relative flex flex-col items-center justify-center p-8 bg-[#030303] rounded-2xl border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] max-w-2xl mx-auto overflow-hidden text-center space-y-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-yellow-950/5 to-black pointer-events-none" />
        <div className="w-20 h-20 rounded-full bg-yellow-950/40 border-2 border-yellow-500/50 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(234,179,8,0.25)] animate-pulse">
          <Trophy className="w-10 h-10 text-yellow-400" />
        </div>
        <div className="space-y-2 z-10">
          <span className="text-[11px] text-yellow-400 font-mono tracking-[0.3em] font-black uppercase block">COSMIC TERMINAL LEVEL ACHIEVED</span>
          <h3 className="text-2xl font-black font-mono tracking-wider text-white uppercase">ABSOLUTE SUPREME SHADOW MONARCH</h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
            You have shattered the boundaries of mortal spin coordinates and unlocked sovereign control over the entire spin universe. No higher ascension gateways exist in this sector.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-r from-yellow-950/20 to-black/80 border border-yellow-500/20 rounded-xl font-mono text-xs text-gray-300 w-full z-10 max-w-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Player Rank:</span>
            <span className="text-yellow-400 font-black uppercase">{player.currentStatus}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Title:</span>
            <span className="text-white font-bold">{player.title}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Active Aura:</span>
            <span className="text-purple-400 font-bold">Dark Primordial Sovereign</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate actual met requirements list
  const checks: {
    label: string;
    target: string;
    actual: string;
    percent: number;
    isMet: boolean;
    icon: any;
  }[] = [];

  // 1. Player Level Check
  const levelPercent = Math.min(100, Math.round((currentLevel / req.levelNeeded) * 100));
  checks.push({
    label: "Player Level",
    target: `Lvl ${req.levelNeeded}`,
    actual: `Lvl ${currentLevel}`,
    percent: levelPercent,
    isMet: currentLevel >= req.levelNeeded,
    icon: Shield
  });

  // 2. Attributes Check
  Object.entries(req.attributesNeeded || {}).forEach(([attrName, targetVal]) => {
    if (attrName === "Every Attribute" || attrName === "All Attributes") {
      const allMet = attributes.every(at => at.value >= (targetVal as number));
      const minVal = attributes.length > 0 ? Math.min(...attributes.map(at => at.value)) : 0;
      const pct = Math.min(100, Math.round((minVal / (targetVal as number)) * 100));
      checks.push({
        label: "All Attributes Min",
        target: `${targetVal} Rating`,
        actual: `Min ${minVal.toFixed(1)}`,
        percent: pct,
        isMet: allMet,
        icon: BarChart2
      });
    } else {
      const currentAttr = attributes.find(at => at.name.toLowerCase() === attrName.toLowerCase());
      const currentVal = currentAttr ? currentAttr.value : 0;
      const pct = Math.min(100, Math.round((currentVal / (targetVal as number)) * 100));
      checks.push({
        label: `${attrName} Attribute`,
        target: `${targetVal} Rating`,
        actual: `${currentVal.toFixed(1)}`,
        percent: pct,
        isMet: currentVal >= (targetVal as number),
        icon: Target
      });
    }
  });

  // 3. Practice Quests Completed Check
  const actualPracticeQuests = player.lifetimePracticeQuests || 0;
  const questsPercent = Math.min(100, Math.round((actualPracticeQuests / req.practiceQuestsNeeded) * 100));
  checks.push({
    label: "Lifetime Practice Quests",
    target: `${req.practiceQuestsNeeded} Quests`,
    actual: `${actualPracticeQuests} Cleared`,
    percent: questsPercent,
    isMet: actualPracticeQuests >= req.practiceQuestsNeeded,
    icon: Star
  });

  // 4. Evolution Chamber Sessions Check
  const actualSessions = player.lifetimeEvolutionSessions || 0;
  const sessionsPercent = Math.min(100, Math.round((actualSessions / req.evolutionSessionsNeeded) * 100));
  checks.push({
    label: "Lifetime Chamber Sessions",
    target: `${req.evolutionSessionsNeeded} Sessions`,
    actual: `${actualSessions} Sessions`,
    percent: sessionsPercent,
    isMet: actualSessions >= req.evolutionSessionsNeeded,
    icon: Activity
  });

  // 5. Match Dungeons Conquered Check
  const actualDungeons = player.lifetimeMatchDungeons || 0;
  const dungeonsPercent = Math.min(100, Math.round((actualDungeons / req.matchDungeonsNeeded) * 100));
  checks.push({
    label: "Lifetime Match Dungeons",
    target: `${req.matchDungeonsNeeded} Raids`,
    actual: `${actualDungeons} Cleared`,
    percent: dungeonsPercent,
    isMet: actualDungeons >= req.matchDungeonsNeeded,
    icon: Trophy
  });

  // 6. Pressure Chambers Check
  const actualPressure = player.lifetimePressureChambers || 0;
  const pressurePercent = Math.min(100, Math.round((actualPressure / req.pressureChambersNeeded) * 100));
  checks.push({
    label: "Lifetime Pressure Drills",
    target: `${req.pressureChambersNeeded} Drills`,
    actual: `${actualPressure} Logged`,
    percent: pressurePercent,
    isMet: actualPressure >= req.pressureChambersNeeded,
    icon: Flame
  });

  // 7. Evolution Trials Check
  const actualTrials = player.lifetimeEvolutionTrials || 0;
  const trialsPercent = Math.min(100, Math.round((actualTrials / req.evolutionTrialsNeeded) * 100));
  checks.push({
    label: "Lifetime Evolution Trials",
    target: `${req.evolutionTrialsNeeded} Trials`,
    actual: `${actualTrials} Trials`,
    percent: trialsPercent,
    isMet: actualTrials >= req.evolutionTrialsNeeded,
    icon: Sparkles
  });

  // 8. Skill Conditions Check
  const skillMet = req.skillsCondition ? req.skillsCondition.check(skills) : true;
  checks.push({
    label: "Sovereign Skills State",
    target: req.skillsCondition ? req.skillsCondition.description : "Standard Level",
    actual: skillMet ? "Condition Satisfied ✓" : "Incomplete ✗",
    percent: skillMet ? 100 : 40,
    isMet: skillMet,
    icon: Zap
  });

  // 9. Perfect Deliveries Check (Optional)
  if (req.perfectDeliveriesNeeded) {
    const act = player.lifetimePerfectDeliveries || 0;
    const pct = Math.min(100, Math.round((act / req.perfectDeliveriesNeeded) * 100));
    checks.push({
      label: "Perfect Deliveries",
      target: `${req.perfectDeliveriesNeeded}`,
      actual: `${act}`,
      percent: pct,
      isMet: act >= req.perfectDeliveriesNeeded,
      icon: Target
    });
  }

  // 10. Dot Balls Check (Optional)
  if (req.dotBallsNeeded) {
    const act = player.lifetimeDotBalls || 0;
    const pct = Math.min(100, Math.round((act / req.dotBallsNeeded) * 100));
    checks.push({
      label: "Dot Balls Bowled",
      target: `${req.dotBallsNeeded}`,
      actual: `${act}`,
      percent: pct,
      isMet: act >= req.dotBallsNeeded,
      icon: Target
    });
  }

  // 11. Wickets Check (Optional)
  if (req.wicketsNeeded) {
    const act = player.lifetimeWickets || 0;
    const pct = Math.min(100, Math.round((act / req.wicketsNeeded) * 100));
    checks.push({
      label: "Lifetime Wickets",
      target: `${req.wicketsNeeded}`,
      actual: `${act}`,
      percent: pct,
      isMet: act >= req.wicketsNeeded,
      icon: Trophy
    });
  }

  // Calculate overall readiness
  const metCount = checks.filter(c => c.isMet).length;
  const totalCount = checks.length;
  const overallReadyPercent = Math.round((metCount / totalCount) * 100);
  const isSovereignAscensionAllowed = metCount === totalCount;

  const handleTriggerAscension = () => {
    if (!isSovereignAscensionAllowed) return;
    onSuccess(nextStatus, req.proposedTitle || "Elite Sovereign");
  };

  return (
    <div className="relative flex flex-col p-6 bg-[#040406]/95 rounded-2xl border border-purple-500/20 shadow-[0_0_50px_rgba(123,47,255,0.08)] max-w-4xl mx-auto overflow-hidden">
      
      {/* Background Matrix Style Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/5 via-[#020203] to-[#040406] pointer-events-none" />

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-purple-950/20 mb-6 gap-4 z-10">
        <div className="flex items-start gap-4 w-full md:w-auto">
          <PlayerAvatar src={player.profilePhoto} className="w-14 h-14 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(123,47,255,0.15)] shrink-0" fallbackIconClassName="w-7 h-7" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] bg-purple-900/30 text-purple-400 border border-purple-500/20 rounded font-mono font-bold tracking-wider uppercase">
                COGNITIVE PORTAL ACTIVATED
              </span>
              <span className="text-gray-500 text-xs font-mono">• Live Syncing</span>
            </div>
            <h2 className="text-xl font-black font-mono text-white tracking-wide uppercase flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400 animate-pulse" />
              ASCENSION CHAMBER: <span className="text-purple-400">{nextStatus}</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-sans leading-relaxed max-w-xl">
              {req.description} Complete the permanent lifetime challenges below to elevate your rank and claiming the elite title: <strong className="text-emerald-400">{req.proposedTitle}</strong>.
            </p>
          </div>
        </div>

        {/* OVERALL READINESS SCORE CARD */}
        <div className="flex flex-col items-center bg-[#09090e] border border-purple-950/40 p-4.5 rounded-xl text-center w-full md:w-auto min-w-[170px] shadow-inner relative">
          <div className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span className="text-[9px] text-purple-400 font-mono tracking-widest font-black uppercase">ASCENSION READINESS</span>
          <span className="text-3xl font-black text-white font-mono mt-1">{overallReadyPercent}%</span>
          <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-950">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallReadyPercent}%` }}
            />
          </div>
          <span className="text-[9.5px] text-gray-500 mt-1.5 font-mono">
            {metCount} of {totalCount} Requirements Met
          </span>
        </div>
      </div>

      {/* COMPLETED SUCCESSFUL SCREEN OVERLAY */}
      {completed ? (
        <div className="py-12 text-center space-y-5 w-full z-10 relative">
          <div className="w-20 h-20 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.35)] animate-pulse">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-emerald-400 font-mono text-lg font-black uppercase tracking-wider">ASCENSION DECREE GRANTED!</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-md mx-auto">
              Your cellular spin coordinates have transformed successfully. Limiters have been permanently pushed back to accommodate elite rotation models.
            </p>
          </div>
          <div className="p-5 bg-gradient-to-r from-green-950/20 to-black/80 border border-emerald-950 rounded-xl flex flex-col items-center gap-3 font-mono max-w-sm mx-auto">
            <PlayerAvatar src={player.profilePhoto} className="w-10 h-10 rounded-lg border border-purple-500/20 shadow" fallbackIconClassName="w-5 h-5" />
            <div className="text-center">
              <span className="text-[10px] text-purple-400 uppercase block tracking-wider font-bold">SOVEREIGN PROFILE CLASSIFICATION</span>
              <span className="text-xl font-black text-white block mt-1 uppercase">{player.name || "ROHITH RAJ"} — {nextStatus}</span>
              <span className="text-xs text-gray-400 block mt-1">
                Title Unlocked: <strong className="text-emerald-400">{req.proposedTitle || "The Sovereign"}</strong>
              </span>
            </div>
          </div>

          {onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="px-8 py-3 bg-gradient-to-r from-emerald-900 to-green-950/80 hover:from-emerald-800 text-green-400 border border-green-500/40 rounded-lg font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              PREPARE SYSTEM FOR NEXT ASCENSION LEVEL &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="w-full z-10 space-y-6">
          
          {/* REQUIREMENT CHIPS PROGRESS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checks.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    c.isMet 
                      ? "bg-green-950/5 border-green-500/20 shadow-[0_0_15px_rgba(16,185,129,0.03)]" 
                      : "bg-[#08080c] border-purple-950/30 hover:border-purple-500/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2.5 items-center">
                      <div className={`p-2 rounded-lg ${c.isMet ? "bg-green-950/35 text-green-400" : "bg-purple-950/20 text-purple-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-gray-500 text-[9px] uppercase font-mono block">Requirement #{idx + 1}</span>
                        <h4 className="text-white text-xs font-black uppercase tracking-wide font-mono">
                          {c.label}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9.5px] px-2 py-0.5 font-mono font-bold uppercase rounded ${
                        c.isMet ? "bg-green-900/20 text-green-400 border border-green-500/30" : "bg-purple-900/10 text-purple-400 border border-purple-500/10"
                      }`}>
                        {c.isMet ? "PASSED" : `${c.percent}%`}
                      </span>
                    </div>
                  </div>

                  {/* Meter bars */}
                  <div className="mt-3.5 space-y-1.5 font-mono">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Actual: <strong className="text-white">{c.actual}</strong></span>
                      <span>Target: <strong className="text-purple-400">{c.target}</strong></span>
                    </div>
                    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-black/40">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.isMet ? "bg-gradient-to-r from-emerald-500 to-green-400" : "bg-gradient-to-r from-purple-600 to-indigo-500"
                        }`}
                        style={{ width: `${c.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PARADIGM EXPLAINER CARD */}
          <div className="p-4 bg-gradient-to-r from-purple-950/5 to-black/80 border border-purple-500/10 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1 font-sans text-xs text-gray-400 leading-relaxed">
              <strong className="text-white block font-mono uppercase text-[10px] tracking-wider text-purple-400">
                The Lifetime Progression Paradigm
              </strong>
              <span>
                Unlike static systems that reset your counters, the Monarch Spinner System maintains your <strong>Lifetime Achievements</strong>. Every session, every delivery, and every match you conquer permanently registers in your cosmic soul profile. This progression will never be cleared.
              </span>
            </div>
          </div>

          {/* THE ASCENSION COMMAND BUTTON */}
          <div className="pt-4 border-t border-purple-950/20">
            {isSovereignAscensionAllowed ? (
              <button
                onClick={handleTriggerAscension}
                className="w-full py-4.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs tracking-[0.25em] uppercase rounded-xl border border-white/10 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(123,47,255,0.4)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4 text-yellow-300 animate-spin" />
                INITIATE COGNITIVE SOVEREIGN ASCENSION &rarr;
              </button>
            ) : (
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4.5 bg-red-950/10 border border-red-500/25 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-xs text-gray-300 font-sans leading-relaxed">
                    <strong>ASCENSION PROCESS SEALED.</strong> You must fulfill all listed level, attribute, and lifetime activity parameters before initiating the rank transformation.
                  </span>
                </div>
                <button
                  disabled
                  className="w-full md:w-auto px-6 py-3 bg-gray-950/50 text-gray-500 border border-gray-900 rounded-lg text-[10.5px] font-mono uppercase font-black tracking-wider cursor-not-allowed shrink-0"
                >
                  GATEWAY LOCKED
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
