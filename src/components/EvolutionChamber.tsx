import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Target, RotateCcw, Swords, Compass, 
  CheckCircle, Play, ShieldAlert, Sparkles, 
  HelpCircle, ChevronRight, Zap, Info, 
  Calendar, Clock, Trash2, Eye, Shield, 
  Award, ChevronDown, ChevronUp, Check, PlayCircle, ShieldCheck, XCircle, RefreshCw
} from "lucide-react";
import { SkillItem, PracticeQuest } from "../types";
import WagonWheelMap, { getCricketZone, VALUE_COLORS, WagonWheelDeliver } from "./WagonWheelMap";
import { 
  playSystemClick, playSystemDing, 
  playSystemQuestComplete, playPortalSwoosh, playSystemError,
  playModalOpen, playModalClose, playDrillSuccess, playDrillFailure, playSimulationRun
} from "../utils/audio";

interface EvolutionChamberProps {
  skills: SkillItem[];
  practiceQuests: PracticeQuest[];
  activePracticeQuestId: string | null;
  onCompletePracticeQuest: (questId: string, resultStatus: "SUCCESS" | "FAILED", sessionReport?: any) => void;
  onCompleteSession: (report: {
    oversCount: number;
    ballsLoggedCount: number;
    perfectBallsCount: number;
    xpEarned: number;
    combatEfficiency: number;
    selectedDrill: string;
    details: string;
    completedQuestId?: string;
    isMatchSim: boolean;
    runsConceded: number;
    wicketsTaken: number;
    widesCount: number;
    noBallsCount: number;
    dotsCount: number;
    skillUsage: Record<string, number>;
    balls?: any[];
    pressureScenarioSuccess?: boolean;
    pressureMasteryReward?: number;
  }) => void;
  isAnalyzing: boolean;
  initialHistory?: any[];
  onSyncHistory?: (history: any[]) => void;
  preselectedPressureScenario?: any | null;
  onClearPreselectedPressureScenario?: () => void;
  onTriggerSectionLoader?: (title: string, messages: string[], onComplete: () => void) => void;
}

interface LoggedSession {
  id: string;
  timestamp: string; // "YYYY-MM-DD HH:MM:SS"
  oversCount: number;
  isMatchSim: boolean;
  combatEfficiency: number;
  xpEarned: number;
  drillTitle: string;
  summary: string;
  questStatus?: {
    questId: string;
    questName: string;
    met: boolean;
    failures: string[];
  };
  pressureScenario?: {
    desc: string;
    runsLimit: number;
    wicketsTarget: number;
    difficultyWord: string;
    met: boolean;
    failures: string[];
  };
  counts: {
    perfect: number;
    close: number;
    justShort: number;
    short: number;
    fullToss: number;
    dots: number;
    wides: number;
    noBalls: number;
    wickets: number;
    runs: number;
    totalDeliveries: number;
    beaten?: number;
    singles?: number;
    doubles?: number;
    triples?: number;
    fours?: number;
    fives?: number;
    sixes?: number;
  };
  balls: {
    over: number;
    ballNum: number;
    skillName: string;
    length: string;
    xp: number;
    isExtra: boolean;
    extraType: "WIDE" | "NO_BALL" | "NONE";
    runsConceded: number;
    isWicket: boolean;
    wicketType: string;
    angle?: number;
    distance?: number;
    zone?: string;
    dotBallType?: "BEATEN" | "FIELDER" | null;
    beatenType?: string;
  }[];
}

const LENGTH_METRICS = [
  { 
    name: "Perfect Ball", 
    xp: 35, 
    color: "border-yellow-500/50 text-yellow-500 bg-yellow-950/20", 
    textColor: "text-yellow-400",
    accent: "bg-yellow-500",
    desc: "Pinpoint pitch boundary landing on full depth. Excellent execution. (+35 XP)" 
  },
  { 
    name: "Close Ball", 
    xp: 25, 
    color: "border-emerald-500/50 text-emerald-400 bg-emerald-950/20", 
    textColor: "text-emerald-400",
    accent: "bg-emerald-400",
    desc: "Scraped the target zone of off-stump vector. Good spin line. (+25 XP)" 
  },
  { 
    name: "Just Short", 
    xp: 10, 
    color: "border-blue-500/40 text-blue-400 bg-blue-950/20", 
    textColor: "text-blue-400",
    accent: "bg-blue-400",
    desc: "Slightly shorter back vector. Safer defensive line but less wicket threat. (+10 XP)" 
  },
  { 
    name: "Short Ball", 
    xp: -15, 
    color: "border-orange-500/45 text-orange-400 bg-orange-950/20", 
    textColor: "text-orange-400",
    accent: "bg-orange-400",
    desc: "Unsafe dragged short ball length! Vulnerable to backfoot hooks. (-15 XP Penalty)" 
  },
  { 
    name: "Full Toss", 
    xp: -25, 
    color: "border-rose-600/50 text-rose-400 bg-rose-950/20", 
    textColor: "text-rose-400",
    accent: "bg-rose-505",
    desc: "Total length control failure! Traveled high above the pitch surface. (-25 XP Penalty)" 
  }
];

export interface PressureScenarioData {
  scenarioId: string;
  scenarioName: string;
  matchContext: string;
  oversRemaining: number;
  runsLimit: number;
  wicketsTarget: number;
  wicketObjective: string;
  economyObjective: string;
  difficultyWord: string;
  difficultyRating: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME";
  xpReward: number;
  masteryXpReward: number;
  riskRating: string;
  desc: string;
  pressureConditions: string;
  specialEvents: string;
}

import {
  findBestHighlyVariedScenario,
  getCombinatoricsStats,
  generateHighlyVariedPressureScenario,
  getScenarioTitle
} from "../utils/scenarioEngine";
import { QuestDatabaseManager } from "../utils/questDatabaseManager";

export function generatePressureScenario(overs: number, difficulty: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME"): PressureScenarioData {
  const dbScenarios = QuestDatabaseManager.getPressureScenarios();
  const matched = dbScenarios.find(s => s.oversRemaining === overs && s.difficultyRating === difficulty);
  if (matched) return matched;
  const matchDiff = dbScenarios.find(s => s.difficultyRating === difficulty);
  if (matchDiff) return matchDiff;
  if (dbScenarios.length > 0) return dbScenarios[0];
  
  const seed = (overs * 19 + difficulty.length * 7) % 500;
  return generateHighlyVariedPressureScenario(overs, difficulty, seed);
}

export function findBestScenario(
  history: LoggedSession[],
  overs: number,
  difficulty: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME"
): { scenario: PressureScenarioData; isUnseen: boolean } {
  const dbScenarios = QuestDatabaseManager.getPressureScenarios();
  
  // Filter by matching difficulty
  const matchDifficulty = dbScenarios.filter(s => s.difficultyRating === difficulty);
  const pool = matchDifficulty.length > 0 ? matchDifficulty : dbScenarios;
  
  // Try to find one that is unseen in history
  const unseen = pool.filter(s => !history.some(h => h.pressureScenario?.desc === s.desc));
  
  if (unseen.length > 0) {
    // Return the first unseen matching the overs if possible
    const matchOvers = unseen.find(s => s.oversRemaining === overs);
    return { scenario: matchOvers || unseen[0], isUnseen: true };
  }
  
  // All are seen, find best seen match
  const matchOvers = pool.find(s => s.oversRemaining === overs);
  return { scenario: matchOvers || pool[0] || generatePressureScenario(overs, difficulty), isUnseen: false };
}

export function evaluateQuestCompletion(quest: PracticeQuest, sessionStats: {
  overs: number;
  runs: number;
  wickets: number;
  dots: number;
  perfect: number;
  closeOrBetter: number;
  hasExtras: boolean;
  skillWickets: Record<string, number>;
}) {
  const failures: string[] = [];
  const req = quest.requirements;
  
  if (req.oversMin !== undefined && sessionStats.overs < req.oversMin) {
    failures.push(`Session span of ${sessionStats.overs} overs is less than the required ${req.oversMin} overs.`);
  }
  if (req.perfectBallsNeeded !== undefined && sessionStats.perfect < req.perfectBallsNeeded) {
    failures.push(`Landed ${sessionStats.perfect} Perfect Balls of ${quest.skillName} (Needs at least ${req.perfectBallsNeeded}).`);
  }
  if (req.closeOrBetterNeeded !== undefined && sessionStats.closeOrBetter < req.closeOrBetterNeeded) {
    failures.push(`Landed ${sessionStats.closeOrBetter} Close or Better Balls (Needs at least ${req.closeOrBetterNeeded}).`);
  }
  if (req.wicketsNeeded !== undefined && sessionStats.wickets < req.wicketsNeeded) {
    failures.push(`Secured ${sessionStats.wickets} wickets inside the session (Needs at least ${req.wicketsNeeded}).`);
  }
  if (req.runsMaxLte !== undefined && sessionStats.runs > req.runsMaxLte) {
    failures.push(`Conceded ${sessionStats.runs} runs, which exceeds the strict target limit of ${req.runsMaxLte} runs.`);
  }
  if (req.dotBallsNeeded !== undefined && sessionStats.dots < req.dotBallsNeeded) {
    failures.push(`Recorded ${sessionStats.dots} dot balls (Needs at least ${req.dotBallsNeeded}).`);
  }
  if (req.noWidesOrNoBalls !== undefined && req.noWidesOrNoBalls && sessionStats.hasExtras) {
    failures.push(`Conceded extra deliveries (No wides/no-balls allowed).`);
  }
  
  if (req.skillsSpecificWickets !== undefined) {
    for (const [sName, wNeeded] of Object.entries(req.skillsSpecificWickets)) {
      const actualWkts = sessionStats.skillWickets[sName.toUpperCase()] || 0;
      if (actualWkts < wNeeded) {
        failures.push(`Secured ${actualWkts} wickets using ${sName.toUpperCase()} (Needs at least ${wNeeded}).`);
      }
    }
  }
  
  return {
    met: failures.length === 0,
    failures
  };
}

export default function EvolutionChamber({
  skills = [],
  practiceQuests = [],
  activePracticeQuestId = null,
  onCompletePracticeQuest,
  onCompleteSession,
  isAnalyzing,
  initialHistory = [],
  onSyncHistory,
  preselectedPressureScenario,
  onClearPreselectedPressureScenario,
  onTriggerSectionLoader
}: EvolutionChamberProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [historySection, setHistorySection] = useState<"NET_DRILL" | "MATCH_SIM">("NET_DRILL");

  // Persistent localized session history databases of the chamber drills
  const [history, setHistory] = useState<LoggedSession[]>(() => {
    if (initialHistory && initialHistory.length > 0) return initialHistory;
    try {
      const saved = localStorage.getItem("monarch_evolution_history_v5");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (initialHistory && initialHistory.length > 0) {
      setHistory(initialHistory);
    }
  }, [initialHistory]);

  // Wagon Wheel active live state tracking
  const [liveOutcome, setLiveOutcome] = useState<"DOT" | "RUN" | "WICKET" | null>("DOT");
  const [liveDotType, setLiveDotType] = useState<"BEATEN" | "FIELDER" | null>("BEATEN");
  const [liveBeatenType, setLiveBeatenType] = useState<string>("Ball spins past bat");
  const [liveRuns, setLiveRuns] = useState<number>(1);
  const [liveWicketType, setLiveWicketType] = useState<string>("BOWLED");
  const [liveCoord, setLiveCoord] = useState<{ angle: number; distance: number; zone: string } | null>(null);
  
  // Custom states for live Extra delivery logging
  const [liveIsExtra, setLiveIsExtra] = useState<boolean>(false);
  const [liveExtraType, setLiveExtraType] = useState<"WIDE" | "NO_BALL" | "NONE">("NONE");

  // Session configuration
  const [totalOversGoal, setTotalOversGoal] = useState<number>(2); 
  const [isMatchSim, setIsMatchSim] = useState<boolean>(false);
  const [isPressureMode, setIsPressureMode] = useState<boolean>(false);
  const [pressureDifficulty, setPressureDifficulty] = useState<"EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME">("MEDIUM");
  const [pressureScenario, setPressureScenario] = useState<PressureScenarioData | null>(null);
  const [preparedScenario, setPreparedScenario] = useState<PressureScenarioData | null>(null);
  const [sessionActive, setSessionActive] = useState<boolean>(false);

  // Set up scenario preview sync effect
  useEffect(() => {
    if (preselectedPressureScenario) {
      setIsPressureMode(true);
      setIsMatchSim(true);
      setTotalOversGoal(preselectedPressureScenario.oversGoal || preselectedPressureScenario.requirements?.oversMin || 2);
      setPressureDifficulty(preselectedPressureScenario.difficultyRating || preselectedPressureScenario.difficulty || "MEDIUM");
      setPreparedScenario(preselectedPressureScenario);
    } else if (isPressureMode) {
      const res = findBestScenario(history, totalOversGoal, pressureDifficulty);
      setPreparedScenario(res.scenario);
    } else {
      setPreparedScenario(null);
    }
  }, [totalOversGoal, pressureDifficulty, isPressureMode, history.length, preselectedPressureScenario]);

  const handleRegenerateSetupScenario = () => {
    playSystemClick();
    const sc = generateHighlyVariedPressureScenario(totalOversGoal, pressureDifficulty, Math.floor(Math.random() * 5000));
    setPreparedScenario(sc);
  };

  // Active delivery logging states
  const [currentOverNumber, setCurrentOverNumber] = useState<number>(1);
  const [legalBallsInCurrentOver, setLegalBallsInCurrentOver] = useState<number>(0);
  const [activeSelectedSkillId, setActiveSelectedSkillId] = useState<string>(skills[0]?.id || "");
  const [selectedLengthMetric, setSelectedLengthMetric] = useState<string>("");

  // Match Simulation outcome details
  const [matchActionType, setMatchActionType] = useState<"NORMAL" | "WIDE" | "NO_BALL">("NORMAL");
  const [runsOffBat, setRunsOffBat] = useState<number>(0);
  const [extrasRunsConceded, setExtrasRunsConceded] = useState<number>(0);
  const [wicketDismissal, setWicketDismissal] = useState<string>("");

  // Target quest computed reference
  const activePracticeQuest = practiceQuests.find(q => q.id === activePracticeQuestId) || null;

  // Logging deliveries array
  interface LoggedDelivery {
    over: number;
    ballNum: number;
    skillId: string;
    skillName: string;
    length: string;
    xp: number;
    isExtra: boolean;
    extraType: "WIDE" | "NO_BALL" | "NONE";
    runsConceded: number;
    isWicket: boolean;
    wicketType: string;
    angle?: number;
    distance?: number;
    zone?: string;
    dotBallType?: "BEATEN" | "FIELDER" | null;
    beatenType?: string;
  }
  const [deliveryLogs, setDeliveryLogs] = useState<LoggedDelivery[]>([]);

  // Recent completed review overlay
  const [completedSessionReview, setCompletedSessionReview] = useState<LoggedSession | null>(null);
  const [expandedSessionHistoryId, setExpandedSessionHistoryId] = useState<string | null>(null);

  // History detail sub-collapse panels and customized interactive review states
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<string, boolean>>>({});
  const [sessionViewTypes, setSessionViewTypes] = useState<Record<string, "wheel" | "scoring_heatmap" | "wicket_heatmap" | "beaten_heatmap" | "bowling_heatmap">>({});
  const [selectedDeliveryReview, setSelectedDeliveryReview] = useState<Record<string, any>>({});

  const toggleSection = (sessionId: string, sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || {}),
        [sectionKey]: !prev[sessionId]?.[sectionKey]
      }
    }));
  };

  const setSessionViewType = (sessionId: string, type: "wheel" | "scoring_heatmap" | "wicket_heatmap" | "beaten_heatmap" | "bowling_heatmap") => {
    setSessionViewTypes(prev => ({
      ...prev,
      [sessionId]: type
    }));
  };

  const handleSelectDeliveryReview = (sessionId: string, ball: any) => {
    setSelectedDeliveryReview(prev => ({
      ...prev,
      [sessionId]: ball
    }));
  };

  useEffect(() => {
    localStorage.setItem("monarch_evolution_history_v5", JSON.stringify(history));
  }, [history]);

  // Sync state selection to skills array length adjustments
  useEffect(() => {
    if (skills.length > 0 && !skills.some(s => s.id === activeSelectedSkillId)) {
      setActiveSelectedSkillId(skills[0].id);
    }
  }, [skills]);

  const activeSkill = skills.find(s => s.id === activeSelectedSkillId) || skills[0];

  const totalXpEarned = deliveryLogs.reduce((sum, l) => sum + l.xp, 0);
  const perfectBallsCount = deliveryLogs.filter(l => l.length === "Perfect Ball").length;
  const totalRunsConceded = deliveryLogs.reduce((sum, l) => sum + l.runsConceded, 0);
  const totalWicketsTaken = deliveryLogs.filter(l => l.isWicket).length;
  const totalWides = deliveryLogs.filter(l => l.extraType === "WIDE").length;
  const totalNoBalls = deliveryLogs.filter(l => l.extraType === "NO_BALL").length;

  const handleStartSession = () => {
    playPortalSwoosh();
    
    const startAction = () => {
      setTimeout(() => { playSimulationRun(); }, 220);
      setDeliveryLogs([]);
      setCurrentOverNumber(1);
      setLegalBallsInCurrentOver(0);
      setSelectedLengthMetric("");
      setMatchActionType("NORMAL");
      setRunsOffBat(0);
      setExtrasRunsConceded(0);
      setWicketDismissal("");
      setSessionActive(true);
      setCompletedSessionReview(null);

      if (isPressureMode) {
        if (preparedScenario) {
          setPressureScenario(preparedScenario);
        } else {
          const res = findBestScenario(history, totalOversGoal, pressureDifficulty);
          setPressureScenario(res.scenario);
        }
      } else {
        setPressureScenario(null);
      }
    };

    if (onTriggerSectionLoader) {
      onTriggerSectionLoader(
        isPressureMode 
          ? "Entering Pressure Battle Arena..." 
          : isMatchSim 
            ? "Deploying Match Simulation Arena..." 
            : "Initializing Practice Nets...",
        isPressureMode
          ? [
              "Calibrating Spin Core under Extreme Pressure...",
              "Loading Match Conditions & Crowd Noise...",
              "Simulating Run Chase Matrix...",
              "Calibrating Fielders Positions...",
              "Preparing High Intensity Arena...",
              "Sovereign Pressure Battle Commencing..."
            ]
          : isMatchSim
            ? [
                "Creating Pitch Simulation...",
                "Synthesizing Batter Strike AI...",
                "Aligning Pitch Grids...",
                "Loading Dynamic Fielders...",
                "Match Simulation Live..."
              ]
            : [
                "Deploying Pitching Target Sensors...",
                "Powering Up Net Trajectory Tracking...",
                "Calibrating Monarch Spin Vectors...",
                "Nets Drills Fully Configured..."
              ],
        startAction
      );
    } else {
      startAction();
    }
  };

  const handleLogDelivery = () => {
    if (!selectedLengthMetric) {
      playSystemError();
      alert("SELECT THE PITCH DELIVERY LANDING LENGTH FIRST.");
      return;
    }
    if (!activeSkill) {
      playSystemError();
      alert("SELECT TARGET SPINNER KINETIC VARIATION.");
      return;
    }

    // MANDATORY WAGON WHEEL VALIDATIONS IF MATCH SIM OR PRESSURE MODE
    const needsWagonWheel = (isMatchSim || isPressureMode) && (
      liveOutcome === "RUN" || 
      (liveOutcome === "DOT" && liveDotType === "FIELDER") ||
      (liveOutcome === "WICKET" && ["CAUGHT", "RUN_OUT", "CAUGHT_BOWL"].includes(liveWicketType))
    );

    if (needsWagonWheel && !liveCoord) {
      playSystemError();
      alert("MANDATORY OUTCOME PLACEMENT REQUIRED. Please click directly on the visual Ground Map to plot where the ball traveled.");
      return;
    }

    playSystemClick();

    const selectedMetric = LENGTH_METRICS.find(m => m.name === selectedLengthMetric);
    let ballXp = selectedMetric ? selectedMetric.xp : 0;

    // Simulate match elements
    let isExtra = false;
    let extraType: "WIDE" | "NO_BALL" | "NONE" = "NONE";
    let deliveryRuns = 0;
    let isWicket = false;
    let wicketType = "NONE";

    if (isMatchSim || isPressureMode) {
      isExtra = liveExtraType !== "NONE";
      extraType = liveExtraType;

      if (liveOutcome === "WICKET") {
        isWicket = true;
        wicketType = liveWicketType;
      }

      // Base runs off the bat
      const batRuns = liveOutcome === "RUN" ? liveRuns : 0;
      // Extra runs (penalties): Wides, No-Balls yield 1 run penalty
      const extraPenalty = isExtra ? 1 : 0;
      deliveryRuns = batRuns + extraPenalty;
    }

    // Build the new delivery object
    const newDelivery: LoggedDelivery = {
      over: currentOverNumber,
      ballNum: legalBallsInCurrentOver + 1,
      skillId: activeSkill.id,
      skillName: activeSkill.name,
      length: selectedLengthMetric,
      xp: ballXp,
      isExtra,
      extraType,
      runsConceded: deliveryRuns,
      isWicket,
      wicketType,
      angle: liveCoord?.angle,
      distance: liveCoord?.distance,
      zone: liveCoord?.zone,
      dotBallType: (isMatchSim || isPressureMode) && liveOutcome === "DOT" ? liveDotType : null,
      beatenType: (isMatchSim || isPressureMode) && liveOutcome === "DOT" && liveDotType === "BEATEN" ? liveBeatenType : undefined,
    };

    const updatedLogs = [...deliveryLogs, newDelivery];
    setDeliveryLogs(updatedLogs);

    // Update ball counters
    if (!isExtra) {
      const nextLegalCount = legalBallsInCurrentOver + 1;
      if (nextLegalCount >= 6) {
        const nextOver = currentOverNumber + 1;
        if (nextOver > totalOversGoal) {
          // Trigger session wrap
          handleConcludeSession(updatedLogs);
        } else {
          setCurrentOverNumber(nextOver);
          setLegalBallsInCurrentOver(0);
          playSystemDing();
        }
      } else {
        setLegalBallsInCurrentOver(nextLegalCount);
      }
    }

    // Reset picker choices
    setSelectedLengthMetric("");
    setMatchActionType("NORMAL");
    setRunsOffBat(0);
    setExtrasRunsConceded(0);
    setWicketDismissal("");
    
    // Reset Wagon Wheel outcome selections
    setLiveCoord(null);
    setLiveExtraType("NONE");
    setLiveIsExtra(false);
    setLiveOutcome("DOT");
    setLiveDotType("BEATEN");
    setLiveWicketType("BOWLED");
  };

  const handleConcludeSession = (logsToUse = deliveryLogs) => {
    // Smart Combat Efficiency calculation based on:
    // 1) Skills used & player ability (mastery and level)
    // 2) correct lengths: perfect, close, just short (increasing) vs short, full toss (decreasing)
    let totalScoreWeight = 0;
    
    logsToUse.forEach(log => {
      const parentSkill = skills.find(s => s.name.toLowerCase() === log.skillName.toLowerCase());
      const level = parentSkill ? parentSkill.level : 1;
      const mastery = parentSkill ? parentSkill.mastery : 100;
      
      // Real physical mastery scaling multiplier from 0.6 to 1.5
      const abilityFactor = 0.6 + (mastery / 1000) * 0.6 + (Math.min(10, level) / 10) * 0.3;
      
      let ballScore = 0;
      if (log.length === "Perfect Ball") {
        ballScore = 18 * abilityFactor;
      } else if (log.length === "Close Ball") {
        ballScore = 12 * abilityFactor;
      } else if (log.length === "Just Short") {
        ballScore = 5 * abilityFactor;
      } else if (log.length === "Short Ball") {
        ballScore = -14;
      } else if (log.length === "Full Toss") {
        ballScore = -24;
      }

      // Add extra multipliers based on wickets and runs context
      if (log.isWicket) {
        ballScore += 15 * abilityFactor; // Skill execution takedown bonus!
      }

      if (log.runsConceded === 0 && !log.isExtra) {
        ballScore += 4; // Dot pressure bonus
      } else if (log.runsConceded >= 4) {
        ballScore -= log.runsConceded * 1.5; // Boundary execution penalty
      }

      if (log.extraType === "WIDE") {
        ballScore -= 8;
      } else if (log.extraType === "NO_BALL") {
        ballScore -= 12;
      }

      totalScoreWeight += ballScore;
    });

    const averageBallScore = logsToUse.length > 0 ? (totalScoreWeight / logsToUse.length) : 0;
    
    // Balanced base efficiency around 55%
    let computedEfficiency = Math.round(55 + averageBallScore * 3.5);

    const matchWickets = logsToUse.filter(log => log.isWicket).length;
    const matchRuns = logsToUse.reduce((acc, log) => acc + log.runsConceded, 0);
    const matchWides = logsToUse.filter(log => log.extraType === "WIDE").length;
    const matchNoBalls = logsToUse.filter(log => log.extraType === "NO_BALL").length;

    if (isMatchSim) {
      const econ = Number((matchRuns / totalOversGoal).toFixed(2)) || 5;
      const econFactor = Math.max(100 - (econ * 8), 10);
      const wicketBonus = Math.min(matchWickets * 15, 40);
      
      // Blend length-ability precision efficiency with match simulated scoreboard outcomes
      computedEfficiency = Math.round((computedEfficiency * 0.4) + (econFactor * 0.4) + wicketBonus);
    }
    
    computedEfficiency = Math.min(Math.max(computedEfficiency, 12), 99);

    // Build list of skills trained
    const trainedSkillsMap: Record<string, number> = {};
    logsToUse.forEach(log => {
      trainedSkillsMap[log.skillName] = (trainedSkillsMap[log.skillName] || 0) + 1;
    });

    const skillListStr = Object.keys(trainedSkillsMap).join(", ");
    const drillTitle = isPressureMode 
      ? `Pressure Chamber [${pressureDifficulty}]` 
      : (isMatchSim ? "Live Crowd Match Simulation Over" : "Isolation Grid Flight Training");
    const summDetails = `${totalOversGoal} Over Session. Trained [${skillListStr}] configurations. Good balls accuracy at ${computedEfficiency}%.`;

    playSystemQuestComplete();

    const formattedTimestamp = new Date().toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    // EVALUATE ACTIVE PRACTICE QUEST IF ATTEMPTED INSIDE THE CHAMBER
    let questStatusObj: LoggedSession["questStatus"] = undefined;
    if (activePracticeQuest) {
      const skillWickets: Record<string, number> = {};
      logsToUse.forEach(log => {
        if (log.isWicket) {
          const nameUp = log.skillName.toUpperCase();
          skillWickets[nameUp] = (skillWickets[nameUp] || 0) + 1;
        }
      });

      const sessionStats = {
        overs: totalOversGoal,
        runs: matchRuns,
        wickets: matchWickets,
        dots: logsToUse.filter(l => l.runsConceded === 0 && !l.isExtra).length,
        perfect: logsToUse.filter(l => l.length === "Perfect Ball").length,
        closeOrBetter: logsToUse.filter(l => l.length === "Perfect Ball" || l.length === "Close Ball").length,
        hasExtras: matchWides > 0 || matchNoBalls > 0,
        skillWickets
      };

      const evalRes = evaluateQuestCompletion(activePracticeQuest, sessionStats);

      questStatusObj = {
        questId: activePracticeQuest.id,
        questName: activePracticeQuest.name,
        met: evalRes.met,
        failures: evalRes.failures
      };

      // Direct parent state update callback for active practice quests!
      onCompletePracticeQuest(activePracticeQuest.id, evalRes.met ? "SUCCESS" : "FAILED", {
        xpEarned: activePracticeQuest.xpReward,
        masteryReward: activePracticeQuest.masteryReward
      });
    }

    // EVALUATE ACTIVE PRESSURE SCENARIO IF ATTEMPTED
    let pressureScenarioObj: LoggedSession["pressureScenario"] = undefined;
    if (isPressureMode && pressureScenario) {
      const failures: string[] = [];
      if (matchRuns > pressureScenario.runsLimit) {
        failures.push(`Conceded ${matchRuns} runs, which exceeds the threshold limit of ${pressureScenario.runsLimit} runs.`);
      }
      if (matchWickets < pressureScenario.wicketsTarget) {
        failures.push(`Claimed ${matchWickets} wickets, falling short of the required ${pressureScenario.wicketsTarget} wickets.`);
      }
      pressureScenarioObj = {
        desc: pressureScenario.desc,
        runsLimit: pressureScenario.runsLimit,
        wicketsTarget: pressureScenario.wicketsTarget,
        difficultyWord: pressureScenario.difficultyWord,
        met: failures.length === 0,
        failures
      };
    }

    let pressureBonusXp = 0;
    if (pressureScenarioObj && pressureScenarioObj.met && pressureScenario) {
      pressureBonusXp = pressureScenario.xpReward || 0;
    }

    const finalSessionLog: LoggedSession = {
      id: `session-${Date.now()}`,
      timestamp: formattedTimestamp,
      oversCount: totalOversGoal,
      isMatchSim,
      combatEfficiency: computedEfficiency,
      xpEarned: Math.max(logsToUse.reduce((sum, l) => sum + l.xp, 0), 10) + pressureBonusXp,
      drillTitle,
      summary: summDetails,
      questStatus: questStatusObj,
      pressureScenario: pressureScenarioObj,
      counts: {
        perfect: logsToUse.filter(l => l.length === "Perfect Ball").length,
        close: logsToUse.filter(l => l.length === "Close Ball").length,
        justShort: logsToUse.filter(l => l.length === "Just Short").length,
        short: logsToUse.filter(l => l.length === "Short Ball").length,
        fullToss: logsToUse.filter(l => l.length === "Full Toss").length,
        dots: logsToUse.filter(l => l.runsConceded === 0 && !l.isExtra).length,
        wides: matchWides,
        noBalls: matchNoBalls,
        wickets: matchWickets,
        runs: matchRuns,
        totalDeliveries: logsToUse.length,
        beaten: logsToUse.filter(l => l.dotBallType === "BEATEN").length,
        singles: logsToUse.filter(l => l.runsConceded === 1 && !l.isExtra).length,
        doubles: logsToUse.filter(l => l.runsConceded === 2 && !l.isExtra).length,
        triples: logsToUse.filter(l => l.runsConceded === 3 && !l.isExtra).length,
        fours: logsToUse.filter(l => l.runsConceded === 4 && !l.isExtra).length,
        fives: logsToUse.filter(l => l.runsConceded === 5 && !l.isExtra).length,
        sixes: logsToUse.filter(l => l.runsConceded === 6 && !l.isExtra).length,
      },
      balls: logsToUse.map(log => ({
        over: log.over,
        ballNum: log.ballNum,
        skillName: log.skillName,
        length: log.length,
        xp: log.xp,
        isExtra: log.isExtra,
        extraType: log.extraType,
        runsConceded: log.runsConceded,
        isWicket: log.isWicket,
        wicketType: log.wicketType,
        angle: log.angle,
        distance: log.distance,
        zone: log.zone,
        dotBallType: log.dotBallType,
        beatenType: log.beatenType
      }))
    };

    const concludeAction = () => {
      setHistory(prev => [finalSessionLog, ...prev]);

      // Triggers global components synchronization
      onCompleteSession({
        oversCount: totalOversGoal,
        ballsLoggedCount: logsToUse.length,
        perfectBallsCount: logsToUse.filter(l => l.length === "Perfect Ball").length,
        xpEarned: finalSessionLog.xpEarned,
        combatEfficiency: computedEfficiency,
        selectedDrill: drillTitle,
        details: summDetails,
        isMatchSim,
        runsConceded: matchRuns,
        wicketsTaken: matchWickets,
        widesCount: matchWides,
        noBallsCount: matchNoBalls,
        dotsCount: finalSessionLog.counts.dots,
        skillUsage: trainedSkillsMap,
        balls: finalSessionLog.balls,
        pressureScenarioSuccess: pressureScenarioObj ? pressureScenarioObj.met : false,
        pressureMasteryReward: pressureScenarioObj && pressureScenarioObj.met && pressureScenario ? pressureScenario.masteryXpReward : 0
      });

      // Play modal open sound index
      playModalOpen();
      
      // Play achievement success or fail outcome based on quest status / pressure scenario
      const didQuestSucceed = questStatusObj ? questStatusObj.met : true;
      const didPressureSucceed = pressureScenarioObj ? pressureScenarioObj.met : true;
      if (didQuestSucceed && didPressureSucceed) {
        setTimeout(() => { playDrillSuccess(); }, 120);
      } else {
        setTimeout(() => { playDrillFailure(); }, 120);
      }

      setCompletedSessionReview(finalSessionLog);
    };

    if (onTriggerSectionLoader) {
      onTriggerSectionLoader(
        "Analyzing Performance Metrics...",
        [
          "Aggregating Spin Speeds & Delivery Vectors...",
          "Decoding Pitch Accuracy Zones...",
          "Compiling Combat Efficiency Coefficient...",
          "Synchronizing Fighter Character XP...",
          "Generating Tactical Review..."
        ],
        concludeAction
      );
    } else {
      concludeAction();
    }
  };

  const handleClearReview = () => {
    playModalClose();
    setCompletedSessionReview(null);
    setSessionActive(false);
    setDeliveryLogs([]);
    setPressureScenario(null);
    if (onClearPreselectedPressureScenario) {
      onClearPreselectedPressureScenario();
    }
  };

  const handleClearHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSystemClick();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to trigger historical database purging? This cannot be undone.")) {
      playPortalSwoosh();
      setHistory([]);
    }
  };

  const getRankPill = (efficiency: number) => {
    if (efficiency >= 90) return { label: "S-RANK OVERLORD", color: "text-[#D4AF37] bg-yellow-501/10 border-yellow-500/20 shadow-[0_0_8px_rgba(251,191,36,0.1)]" };
    if (efficiency >= 80) return { label: "A-RANK MASTER", color: "text-[#7B2FFF] bg-purple-500/10 border-purple-500/20 shadow-[0_0_8px_rgba(123,47,255,0.1)]" };
    if (efficiency >= 70) return { label: "B-RANK EXPERT", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (efficiency >= 50) return { label: "C-RANK INITIATE", color: "text-blue-400 bg-blue-500/10 border-blue-550/20" };
    return { label: "D-RANK UNSTABLE", color: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" };
  };

  return (
    <div id="monarch-evolution-chamber" className="space-y-6">
      
      {/* MONARCH SUB TABS SELECTOR ROW */}
      <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded-xl p-1.5">
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => { playSystemClick(); setActiveSubTab("ACTIVE"); }}
            className={`flex-1 py-3 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === "ACTIVE" 
                ? "bg-red-950/20 border border-red-500/30 text-white" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Zap className="w-4.5 h-4.5 text-red-500" />
            🧪 ACTIVE EVOLUTION CHAMBER
          </button>
          
          <button
            onClick={() => { playSystemClick(); setActiveSubTab("HISTORY"); }}
            className={`flex-1 py-3 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeSubTab === "HISTORY" 
                ? "bg-purple-950/20 border border-purple-500/30 text-white" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Calendar className="w-4.5 h-4.5 text-purple-400" />
            📜 EVOLUTION HISTORY ({history.length})
          </button>
        </div>
      </div>

      {activeSubTab === "ACTIVE" ? (
        <div className="space-y-4">
          
          {/* Active target practice quest warning panel */}
          {activePracticeQuest && !sessionActive && !completedSessionReview && (
            <div className="p-4 bg-purple-950/15 border-2 border-[#7B2FFF]/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-950/35 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Award className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest block">DEPLOYED PRACTICE QUEST TARGET</span>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black font-mono text-white inline-block uppercase">{activePracticeQuest.name}</h4>
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded border border-red-500/20 bg-red-950/20 text-red-400 font-mono font-black">{activePracticeQuest.difficulty}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal max-w-xl">{activePracticeQuest.description}</p>
                </div>
              </div>

              <button
                onClick={handleStartSession}
                className="w-full md:w-auto px-5 py-2 whitespace-nowrap bg-[#7B2FFF] text-white hover:bg-purple-650 font-mono font-black text-xs uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-4 h-4 text-white" /> START DRILL NOW
              </button>
            </div>
          )}

          {/* ACTIVE TRIAL / SETUP PANEL OR COMPLETED REVIEW */}
          {completedSessionReview ? (
            /* --- SESSION COMPLETED REVIEW DEBRIEF SCREEN --- */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-[#0a0a0a] border-2 border-green-500/20 rounded-2xl relative overflow-hidden space-y-6"
            >
              <div className="absolute right-0 bottom-0 w-80 h-80 bg-green-500/5 rounded-full filter blur-[150px] pointer-events-none" />
              
              {/* QUEST EVALUATION BOX IN REVIEW */}
              {completedSessionReview.questStatus && (
                <div className={`p-5 rounded-xl border-2 text-left space-y-3 ${
                  completedSessionReview.questStatus.met 
                    ? "bg-green-950/10 border-green-500/30" 
                    : "bg-red-950/10 border-red-500/30"
                }`}>
                  <div className="flex items-center gap-2">
                    {completedSessionReview.questStatus.met ? (
                      <ShieldCheck className="w-6 h-6 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    )}
                    <div>
                      <span className="text-[9px] font-mono font-extrabold text-gray-400 uppercase tracking-widest">PRACTICE QUEST VERDICT</span>
                      <h4 className="text-sm font-black font-mono uppercase text-white mt-0.5">
                        {completedSessionReview.questStatus.questName}: {completedSessionReview.questStatus.met ? "SUCCESFULLY CLEARED!" : "ATTEMPT DEFEATED"}
                      </h4>
                    </div>
                  </div>

                  {completedSessionReview.questStatus.met ? (
                    <p className="text-xs text-green-405 text-green-400 leading-relaxed font-sans">
                      SYSTEM COMPLIANCE PASSED! The kinetic vectors of {activePracticeQuest?.skillName} have synchronized. Dynamic title milestones verified, and custom Mastery XP has spiked by <strong className="text-white">+{activePracticeQuest?.masteryReward} Mastery XP</strong>!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-red-400 font-sans">
                        CRITICAL LIMITERS DETECTED inside checkout parameters. Review the unfulfilled goals of your active practice quest:
                      </p>
                      <ul className="list-disc pl-5 text-[10.5px] font-mono text-gray-400 space-y-1">
                        {completedSessionReview.questStatus.failures.map((f, i) => (
                          <li key={i} className="text-red-300">{f}</li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-gray-500 font-mono pt-1">
                        Don't lose focus spinner! You are allowed to retry this practice quest indefinitely until you achieve pristine execution.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* PRESSURE CHALLENGE BOX IN REVIEW */}
              {completedSessionReview.pressureScenario && (
                <div className={`p-5 rounded-xl border-2 text-left space-y-3 ${
                  completedSessionReview.pressureScenario.met 
                    ? "bg-red-955/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                    : "bg-orange-955/10 border-orange-500/25"
                }`}>
                  <div className="flex items-center gap-2">
                    {completedSessionReview.pressureScenario.met ? (
                      <ShieldCheck className="w-6 h-6 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-orange-500 shrink-0" />
                    )}
                    <div>
                      <span className="text-[9px] font-mono font-extrabold text-red-400 uppercase tracking-widest block">🚨 PRESSURE MODE CHALLENGE VERDICT</span>
                      <h4 className="text-xs font-black font-mono uppercase text-white mt-0.5">
                        {completedSessionReview.pressureScenario.difficultyWord} CHALLENGE: {completedSessionReview.pressureScenario.met ? "TRIUMPHANT EXTINGUISH!" : "DEFEATED SYSTEM"}
                      </h4>
                    </div>
                  </div>

                  {completedSessionReview.pressureScenario.met ? (
                    <p className="text-xs text-green-400 leading-relaxed font-sans">
                      ABSOLUTE PRESSURE MASTERED! You completed the challenge: <span className="italic text-gray-300">"{completedSessionReview.pressureScenario.desc}"</span>. Your nerves of steel kept runs at <strong className="text-white">{completedSessionReview.counts.runs} runs</strong> (limit: {completedSessionReview.pressureScenario.runsLimit}) and claimed <strong className="text-white">{completedSessionReview.counts.wickets} wickets</strong> (needed: {completedSessionReview.pressureScenario.wicketsTarget}). 
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-orange-400 font-sans">
                        PRESSURE LEVEL CRUSHED STATE! Target scenario parameters unaccomplished:
                      </p>
                      <ul className="list-disc pl-5 text-[10.5px] font-mono text-gray-400 space-y-1">
                        {completedSessionReview.pressureScenario.failures.map((f, i) => (
                          <li key={i} className="text-red-300">{f}</li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-gray-500 font-mono pt-1">
                        Don't back down! Real champions are forged under high-pressure scenarios. Calibrate adjustments and retry.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SUCCESS FANFARE BANNER */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-green-950/20 border-2 border-green-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.15)] mb-2">
                  <Award className="w-8 h-8 text-green-400 animate-bounce" />
                </div>
                <span className="text-[10px] text-green-400 font-mono tracking-widest font-black uppercase">RESONANCE OVER SYNC COMPLETES</span>
                <h2 className="text-xl font-black font-mono tracking-wider text-white uppercase">{completedSessionReview.drillTitle}</h2>
                <p className="text-xs text-gray-400 max-w-md mx-auto font-sans leading-relaxed">
                  Session analysis compiled. Spin metrics transmitted safely with a <strong className="text-amber-400">{getRankPill(completedSessionReview.combatEfficiency).label}</strong> rating class.
                </p>
              </div>

              {/* STAT DATA HUD SQUARES */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 p-4 rounded-xl border border-gray-900 font-mono">
                <div className="text-center p-3 border border-gray-950 rounded bg-[#030303]/40">
                  <span className="text-[8.5px] text-gray-500 uppercase block">XP EARNED</span>
                  <span className="text-lg font-black text-cyan-400 mt-1 block">+{completedSessionReview.xpEarned} XP</span>
                </div>

                <div className="text-center p-3 border border-gray-950 rounded bg-[#030303]/40">
                  <span className="text-[8.5px] text-gray-500 uppercase block">COMBAT EFFICIENCY</span>
                  <span className="text-lg font-black text-amber-400 mt-1 block">{completedSessionReview.combatEfficiency}%</span>
                </div>

                <div className="text-center p-3 border border-gray-950 rounded bg-[#030303]/40">
                  <span className="text-[8.5px] text-gray-500 uppercase block">OVERS DRILL SPAN</span>
                  <span className="text-lg font-black text-purple-400 mt-1 block">{completedSessionReview.oversCount} OVERS</span>
                </div>

                <div className="text-center p-3 border border-gray-950 rounded bg-[#030303]/40">
                  <span className="text-[8.5px] text-gray-500 uppercase block">TOTAL LOGGED</span>
                  <span className="text-lg font-black text-blue-400 mt-1 block">{completedSessionReview.counts.totalDeliveries} BALLS</span>
                </div>
              </div>

              {/* GRID SUB COUNTS DETAILS */}
              <div className="bg-black/80 rounded-xl border border-gray-900 p-4.5 space-y-3">
                <span className="text-[10px] text-[#7B2FFF] font-mono font-bold uppercase tracking-widest block">LANDING LENGTH VECTOR SUMMARY</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
                  <div className="p-2.5 rounded bg-yellow-950/10 border border-yellow-500/20">
                    <span className="text-[8.5px] text-yellow-500 block font-bold">PERFECT</span>
                    <span className="text-base font-black text-[#FFD700] mt-0.5 block">{completedSessionReview.counts.perfect}</span>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/10 border border-emerald-500/20">
                    <span className="text-[8.5px] text-emerald-400 block font-bold">CLOSE</span>
                    <span className="text-base font-black text-emerald-400 mt-0.5 block">{completedSessionReview.counts.close}</span>
                  </div>
                  <div className="p-2.5 rounded bg-blue-950/10 border border-blue-500/20">
                    <span className="text-[8.5px] text-blue-400 block font-bold">JUST SHORT</span>
                    <span className="text-base font-black text-blue-400 mt-0.5 block">{completedSessionReview.counts.justShort}</span>
                  </div>
                  <div className="p-2.5 rounded bg-orange-950/10 border border-orange-500/20">
                    <span className="text-[8.5px] text-orange-400 block font-bold">SHORT</span>
                    <span className="text-base font-black text-orange-400 mt-0.5 block">{completedSessionReview.counts.short}</span>
                  </div>
                  <div className="p-2.5 rounded bg-rose-950/10 border border-rose-500/25 block">
                    <span className="text-[8.5px] text-rose-450 block font-bold">FULL TOSS</span>
                    <span className="text-base font-black text-rose-400 mt-0.5 block">{completedSessionReview.counts.fullToss}</span>
                  </div>
                </div>

                {completedSessionReview.isMatchSim && (
                  <div className="grid grid-cols-3 gap-3 border-t border-gray-900 pt-3 text-center font-mono">
                    <div className="p-2 bg-[#090909] border border-gray-950 rounded">
                      <span className="text-[8.5px] text-gray-500 block uppercase">RUNS CONCEDED</span>
                      <span className="text-sm font-bold text-red-400">{completedSessionReview.counts.runs} runs</span>
                    </div>
                    <div className="p-2 bg-[#090909] border border-gray-950 rounded">
                      <span className="text-[8.5px] text-gray-500 block uppercase">WICKETS TAKEN</span>
                      <span className="text-sm font-bold text-green-400">{completedSessionReview.counts.wickets} WKT</span>
                    </div>
                    <div className="p-2 bg-[#090909] border border-gray-950 rounded">
                      <span className="text-[8.5px] text-gray-500 block uppercase">DOT BALLS LOGGED</span>
                      <span className="text-sm font-bold text-cyan-400">{completedSessionReview.counts.dots} dots</span>
                    </div>
                  </div>
                )}
              </div>

              {/* INDIVIDUAL DELIVERY LOG LIST */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">SESSION LINE-UP DELIVERY FEED</span>
                <div className="max-h-[170px] overflow-y-auto pr-1 space-y-1.5 font-mono">
                  {completedSessionReview.balls.map((ball, idx) => (
                    <div key={idx} className="p-2 bg-black border border-gray-900 rounded text-[10px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">O{ball.over}:B{ball.ballNum}</span>
                        <span className="text-cyan-400 uppercase font-bold">{ball.skillName}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-gray-400">{ball.length}</span>
                        {completedSessionReview.isMatchSim && (
                          <span className={ball.isWicket ? "text-green-405 font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" : "text-gray-400"}>
                            {ball.isWicket ? `WKT: ${ball.wicketType}` : ball.isExtra ? `${ball.extraType} (+${ball.runsConceded}R)` : `${ball.runsConceded} runs`}
                          </span>
                        )}
                        <span className={`${ball.xp >= 0 ? "text-green-400" : "text-red-400"} font-bold bg-[#040404] px-1 py-0.5 rounded border border-gray-950`}>
                          {ball.xp > 0 ? `+${ball.xp}` : ball.xp} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONCLUDE REVIEW CONTROL */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-900">
                <button
                  onClick={handleClearReview}
                  className={`flex-1 py-3 text-white font-mono text-xs font-black tracking-widest uppercase rounded border hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    completedSessionReview.questStatus && !completedSessionReview.questStatus.met
                      ? "bg-red-700 hover:bg-red-650 border-red-500/20" 
                      : "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-500/20"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {completedSessionReview.questStatus && !completedSessionReview.questStatus.met ? "RETRY PRACTICE QUEST DISCIPLINE" : "CONFIRM & BACK TO SPELLBOOK"}
                </button>
                <button
                  onClick={() => { playSystemClick(); setActiveSubTab("HISTORY"); handleClearReview(); }}
                  className="px-6 py-3 bg-black border border-gray-900 text-gray-400 hover:text-white font-mono text-xs uppercase rounded cursor-pointer"
                >
                  VIEW HISTORICAL DRILL REPORTS
                </button>
              </div>
            </motion.div>
          ) : !sessionActive ? (
            /* --- EXCELLENT INITIAL CHAMBER SETUP SCREEN --- */
            <div className="p-8 bg-[#0b0b0b] border border-gray-900 rounded-2xl relative overflow-hidden text-center space-y-6">
              <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#7B2FFF]/5 rounded-full filter blur-[150px] pointer-events-none" />
              
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-16 h-16 rounded-full bg-red-950/25 border border-red-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)] mb-4">
                  <Swords className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                <h1 className="text-xl font-black font-mono tracking-wider text-white uppercase">THE EVOLUTION DESTRUCTION OVER</h1>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Deploy your physical spinner variations in localized drills or live match simulations below to earn XP and unlock high-tier spinner attributes!
                </p>
              </div>

              <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
                {/* 20 Overs span included here */}
                <div className="p-4 bg-black/55 border border-gray-900 rounded-xl space-y-3 relative">
                  <div className="absolute top-0 right-0 p-2 text-cyan-400">
                    <Target className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest block">CHAMBER TARGET SPAN</span>
                  
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 5, 10, 20, 30].map((o) => (
                      <button
                        key={o}
                        onClick={() => { playSystemClick(); setTotalOversGoal(o); }}
                        className={`py-2 text-[10.5px] font-mono font-bold border rounded-lg uppercase transition-all cursor-pointer flex flex-col justify-center items-center ${
                          totalOversGoal === o 
                            ? "bg-[#7B2FFF]/10 border-[#7B2FFF] text-white shadow-[0_0_6px_rgba(123,47,255,0.2)]" 
                            : "bg-black border-gray-900 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <span className="font-bold text-sm block">{o}</span>
                        <span className="text-[8.5px] text-gray-500 tracking-tighter">OVER{o > 1 ? "S" : ""}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9.5px] text-gray-505 text-gray-500 font-mono leading-tight">Deliver {totalOversGoal * 6} legal deliveries for maximum alignment check.</p>
                </div>

                {/* Match environment mode selection */}
                <div className="p-4 bg-black/55 border border-gray-900 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase tracking-widest block">MATCH ENVIRONMENT ENGINE</span>
                  
                  <div className="flex gap-2">
                    {[
                      { id: "net", label: "Net Drill" },
                      { id: "match", label: "Match Sim" },
                      { id: "pressure", label: "Pressure Mode" }
                    ].map((mode) => {
                      const isActive = mode.id === "pressure" ? isPressureMode : (mode.id === "match" ? (isMatchSim && !isPressureMode) : (!isMatchSim && !isPressureMode));
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            playSystemClick();
                            const changeMode = () => {
                              if (mode.id === "pressure") {
                                setIsPressureMode(true);
                                setIsMatchSim(true);
                              } else if (mode.id === "match") {
                                setIsPressureMode(false);
                                setIsMatchSim(true);
                              } else {
                                setIsPressureMode(false);
                                setIsMatchSim(false);
                              }
                            };

                            if (onTriggerSectionLoader) {
                              if (mode.id === "match") {
                                onTriggerSectionLoader(
                                  "Initializing Match Simulation...",
                                  [
                                    "Creating Match Environment...",
                                    "Loading Opposition AI...",
                                    "Preparing Stadium...",
                                    "Initializing Wagon Wheel...",
                                    "Deploying Match Simulation...",
                                    "Match Ready..."
                                  ],
                                  changeMode
                                );
                              } else if (mode.id === "pressure") {
                                onTriggerSectionLoader(
                                  "Initializing Pressure Chamber...",
                                  [
                                    "Building Pressure Scenario...",
                                    "Loading Stadium Atmosphere...",
                                    "Simulating Crowd Pressure...",
                                    "Preparing Chase Conditions...",
                                    "Initializing Spinner Under Pressure...",
                                    "Pressure Chamber Ready..."
                                  ],
                                  changeMode
                                );
                              } else {
                                onTriggerSectionLoader(
                                  "Initializing Net Drill...",
                                  [
                                    "Calibrating Net Trajectory...",
                                    "Aligning Precision Overlays...",
                                    "Preparing Target Grid...",
                                    "Net Drill Ready..."
                                  ],
                                  changeMode
                                );
                              }
                            } else {
                              changeMode();
                            }
                          }}
                          className={`flex-1 py-3 text-xs font-mono font-bold border rounded-lg uppercase transition-all cursor-pointer ${
                            isActive 
                              ? "bg-red-950/20 border-red-500/50 text-white shadow-[0_0_8px_rgba(239,68,68,0.15)]" 
                              : "bg-black border-gray-900 text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>

                  {isPressureMode && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2 pt-2 border-t border-gray-950"
                    >
                      <span className="text-[9px] font-mono text-amber-500 font-extrabold uppercase tracking-wider block">🚨 SELECT PRESSURE INTENSITY</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: "EASY", label: "Easy", desc: "Stable", color: "border-green-800 text-green-400 bg-green-950/10" },
                          { id: "MEDIUM", label: "Medium", desc: "Critical", color: "border-yellow-800 text-yellow-500 bg-yellow-950/10" },
                          { id: "DIFFICULT", label: "Difficult", desc: "High Alert", color: "border-orange-850 text-orange-400 bg-orange-950/10" },
                          { id: "EXTREME", label: "Extreme", desc: "Apocalyptic", color: "border-red-900 text-red-500 bg-red-950/15" }
                        ].map((diff) => {
                          const isSelected = pressureDifficulty === diff.id;
                          return (
                            <button
                              key={diff.id}
                              type="button"
                              onClick={() => { playSystemClick(); setPressureDifficulty(diff.id as any); }}
                              className={`py-1.5 border text-[9px] font-mono rounded font-black flex flex-col items-center justify-center transition cursor-pointer text-center leading-normal ${
                                isSelected 
                                  ? "bg-red-500/15 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)] font-black" 
                                  : "border-gray-900 text-gray-400 bg-black hover:text-gray-200"
                              }`}
                            >
                              <span className="uppercase tracking-tighter">{diff.label}</span>
                              <span className="text-[7px] font-normal text-gray-500 tracking-tighter truncate max-w-full">{diff.desc}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Dynamic Route Combinations Stats */}
                      {(() => {
                        const stats = getCombinatoricsStats(pressureDifficulty, totalOversGoal);
                        return (
                          <div className="mt-2.5 p-2 bg-red-950/5 border border-red-900/10 rounded-lg flex items-center justify-between text-[8px] font-mono">
                            <span className="text-gray-500 font-bold uppercase tracking-wider">CHAMBER VECTOR COMBINATIONS</span>
                            <span className="text-red-400 font-extrabold tracking-wide bg-red-950/35 px-2 py-0.5 rounded border border-red-500/15">
                              {pressureDifficulty} + {totalOversGoal} Overs: {stats.routeSpecificCombinations}
                            </span>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {isPressureMode && preparedScenario && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-red-955/10 border border-red-500/25 rounded-xl space-y-2 text-left font-mono relative shadow-[0_0_12px_rgba(239,68,68,0.06)]"
                    >
                      <div className="flex items-center justify-between border-b border-red-900/20 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                          <span className="text-[10px] text-white font-extrabold uppercase truncate tracking-wide">
                            {preparedScenario.scenarioName}
                          </span>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-900/30 border border-red-500/20 text-red-500 font-black uppercase">
                          {preparedScenario.difficultyRating}
                        </span>
                      </div>

                      <p className="text-[9.5px] text-gray-300 leading-relaxed italic">
                        &gt; {preparedScenario.matchContext}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 border-t border-red-900/10">
                        <div className="bg-black/50 p-1.5 rounded border border-gray-900">
                          <span className="text-gray-500 block text-[7.5px] uppercase">DEFENSE OBJECTIVE</span>
                          <span className="text-red-400 font-bold block mt-0.5">Defend {preparedScenario.runsLimit} Runs</span>
                          <span className="text-gray-400 block font-normal text-[7.5px]">({(preparedScenario.runsLimit / totalOversGoal).toFixed(1)} Econ Cap)</span>
                        </div>
                        <div className="bg-black/50 p-1.5 rounded border border-gray-900">
                          <span className="text-gray-500 block text-[7.5px] uppercase">BREAKTHROUGHS NEEDED</span>
                          <span className="text-red-400 font-bold block mt-0.5">{preparedScenario.wicketsTarget} Wicket(s)</span>
                          <span className="text-gray-400 block font-normal text-[7.5px]">({totalOversGoal} Overs Spell)</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[8.5px] text-gray-400 bg-black/35 p-2 rounded-lg border border-red-950/20 leading-relaxed">
                        <div>
                          <strong className="text-red-450/90">&gt; PRESSURE CONDITIONS:</strong> {preparedScenario.pressureConditions}
                        </div>
                        <div>
                          <strong className="text-red-450/90">&gt; SPECIAL EVENT:</strong> {preparedScenario.specialEvents}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-red-900/15">
                        <div className="flex items-center gap-2 text-[8px] text-gray-500">
                          <span>XP: <strong className="text-emerald-400">+{preparedScenario.xpReward}</strong></span>
                          <span>MASTERY: <strong className="text-[#7B2FFF]">+{preparedScenario.masteryXpReward}</strong></span>
                          <span>RISK: <strong className="text-red-400 font-bold">{preparedScenario.riskRating}</strong></span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleRegenerateSetupScenario}
                          className="px-2 py-1 bg-red-950/20 hover:bg-red-950/50 border border-red-500/25 rounded text-[8px] text-red-300 hover:text-white font-bold tracking-wider uppercase transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          REROLL
                        </button>
                      </div>
                    </motion.div>
                  )}
                  {!isPressureMode && (
                    <p className="text-[9.5px] text-gray-500 font-mono leading-tight">Enabling Match Sim introduces defense, wides, wickets, and run limits.</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartSession}
                  className="px-8 py-4 bg-gradient-to-r from-red-750 to-purple-850 border border-red-500/20 hover:from-red-650 hover:to-purple-750 shadow-[0_0_25px_rgba(220,38,38,0.25)] rounded-xl text-xs font-mono font-black text-white uppercase tracking-[0.2em] inline-flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  INITIATE EVOLUTION ROTATION
                </button>
              </div>
            </div>
          ) : (
            /* --- AWESOME ACTIVE SESSION LAYOUT WITH PITCH VISUAL ZONE MAP --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-[#030303] border-2 border-[#7B2FFF]/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2.5px] bg-purple-600 shadow-[0_0_10px_#7B2FFF]" />

              {/* LEFT: BALL ENTRY INTERFACE CONSOLE */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* ACTIVE OVER LIVE BALLS PROGRESS BAR HUD */}
                <div className="bg-[#0b0b0b] border border-gray-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-red-500 font-mono tracking-widest font-black uppercase inline-block bg-red-950/20 px-2 py-0.5 rounded border border-red-500/20">
                        {isMatchSim ? "MATCH SIMULATION OVER ACTIVE" : "ISOLATION DRILL NET GRID"}
                      </span>
                      <h3 className="text-base font-black font-mono text-white uppercase mt-1.5 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow shrink-0" />
                        OVER {currentOverNumber} OF {totalOversGoal} • BALL {legalBallsInCurrentOver + 1} OF 6
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block font-mono">CUMULATIVE DELIVERED</span>
                      <span className="text-xs font-black font-mono text-yellow-400">{deliveryLogs.length} DELIVERED</span>
                    </div>
                  </div>

                  {/* VISUAL OVER TRACKER MAP DOTS */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 uppercase font-black">
                      <span>BALL PROGRESS TRACKER</span>
                      <span>{6 - legalBallsInCurrentOver} BALLS REMAINING IN OVER</span>
                    </div>
                    <div className="flex gap-2">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        // Find if this ball of the current over is logged
                        const currentOverLogs = deliveryLogs.filter(log => log.over === currentOverNumber && !log.isExtra);
                        const ballLog = currentOverLogs[idx];
                        const isActive = idx === legalBallsInCurrentOver;

                        let bgDotColor = "bg-[#111111] border-gray-900";
                        let logText = `${idx + 1}`;

                        if (ballLog) {
                          const met = LENGTH_METRICS.find(m => m.name === ballLog.length);
                          bgDotColor = met ? `${met.accent} border-white/20` : "bg-gray-400";
                          logText = "✓";
                        } else if (isActive) {
                          bgDotColor = "bg-purple-950/15 border-[#7B2FFF] ring-2 ring-[#7B2FFF]/30 animate-pulse";
                        }

                        return (
                          <div 
                            key={idx}
                            className={`flex-1 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-black text-gray-400 shadow-inner ${bgDotColor}`}
                            title={ballLog ? `Trained: ${ballLog.skillName} - ${ballLog.length}` : `Next Ball`}
                          >
                            <span className={ballLog ? "text-white" : ""}>{logText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 1. VARIATION SKILL BADGES */}
                <div className="p-4 bg-[#090a0c] border border-gray-900 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono text-[#7B2FFF] font-medium tracking-widest flex items-center gap-1.5">
                      <Zap className="w-4.5 h-4.5 text-[#7B2FFF]" />
                      1. MATCH RELEASE SPIN VARIATION
                    </span>
                    {activeSkill && (
                      <span className="text-[9px] text-[#7B2FFF] font-mono font-bold bg-[#7B2FFF]/15 px-2 py-0.5 rounded border border-[#7B2FFF]/20 uppercase">
                        LEVEL {activeSkill.level} ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {skills.map((skill) => {
                      const isSelected = skill.id === activeSelectedSkillId;
                      return (
                        <button
                          key={skill.id}
                          onClick={() => { playSystemClick(); setActiveSelectedSkillId(skill.id); }}
                          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer hover:border-gray-800 active:scale-95 ${
                            isSelected 
                              ? "bg-purple-950/20 border-[#7B2FFF] text-white font-black shadow-[0_0_12px_rgba(123,47,255,0.15)]"
                              : "bg-black border-gray-900 text-gray-500 font-medium"
                          }`}
                        >
                          <span className="text-[11px] font-mono uppercase tracking-wide truncate block">{skill.name}</span>
                          <span className="text-[8px] text-gray-500 uppercase mt-1 leading-none font-mono font-semibold">LVL {skill.level}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SPECIFIC BALL LENGTH SELECTION OPTIONS (REDUCES OVERCOMPLICATED METERS) */}
                <div className="p-4 bg-[#090a0c] border border-gray-900 rounded-xl space-y-3">
                  <span className="text-[10.5px] font-mono text-[#FFD700] font-extrabold tracking-widest block">
                    2. PITCH OUTCOME LANDING ZONE (REAL BALL HEIGHT)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-1 font-mono">
                    {LENGTH_METRICS.map((lm) => {
                      const isSelected = selectedLengthMetric === lm.name;
                      return (
                        <button
                          key={lm.name}
                          type="button"
                          onClick={() => { playSystemClick(); setSelectedLengthMetric(lm.name); }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between h-28 leading-tight ${
                            isSelected 
                              ? `${lm.color} font-black border-cyan-400 text-white ring-2 ring-cyan-500/20` 
                              : "bg-black border-gray-900 text-gray-400 hover:text-white hover:border-gray-805"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-extrabold uppercase block">{lm.name}</span>
                            <span className="text-[9px] text-gray-500 block leading-normal mt-1">{lm.desc}</span>
                          </div>
                          <span className={`text-[10px] font-black block mt-2 text-center rounded py-0.5 ${lm.xp >= 0 ? "text-green-400 bg-green-950/10" : "text-rose-400 bg-rose-950/10"}`}>
                            {lm.xp >= 0 ? `+${lm.xp} XP` : `${lm.xp} XP Penalty`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ADVANCED WAGON WHEEL OUTCOME CONTROLLER */}
                {(isMatchSim || isPressureMode) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-black border border-purple-500/20 rounded-xl space-y-4"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono tracking-wider font-extrabold uppercase">
                      <Compass className="w-4 h-4 text-purple-450 shrink-0" />
                      3. BALL OUTCOME CONTROLLER
                    </div>

                    {/* Primary Outcome selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                      <button
                        type="button"
                        onClick={() => { playSystemClick(); setLiveOutcome("DOT"); setLiveCoord(null); }}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition uppercase ${
                          liveOutcome === "DOT" ? "bg-gray-800 text-white border border-gray-600" : "bg-black text-gray-500 border border-gray-900"
                        }`}
                      >
                        Dot Ball
                      </button>

                      {[1, 2, 3, 4, 6].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => { playSystemClick(); setLiveOutcome("RUN"); setLiveRuns(r); setLiveCoord(null); }}
                          className={`py-2 px-1 rounded-lg text-xs font-bold transition ${
                            liveOutcome === "RUN" && liveRuns === r ? "bg-yellow-950/40 text-yellow-500 border border-yellow-500/30" : "bg-black text-gray-500 border border-gray-900"
                          }`}
                        >
                          {r} Run{r > 1 ? "s" : ""}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => { playSystemClick(); setLiveOutcome("RUN"); setLiveRuns(5); setLiveCoord(null); }}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition ${
                          liveOutcome === "RUN" && liveRuns === 5 ? "bg-orange-950/40 text-orange-400 border border-orange-500/30" : "bg-black text-gray-500 border border-gray-900"
                        }`}
                      >
                        5 Runs
                      </button>

                      <button
                        type="button"
                        onClick={() => { playSystemClick(); setLiveOutcome("WICKET"); setLiveCoord(null); }}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition uppercase ${
                          liveOutcome === "WICKET" ? "bg-red-950/40 text-red-400 border border-red-500/35 font-black" : "bg-black text-gray-500 border border-gray-900"
                        }`}
                      >
                        Wicket
                      </button>
                    </div>

                    {/* EXTRAS SELECTOR AT THE TOP OF DETAILED PANEL */}
                    <div className="p-3 bg-[#050505] border border-gray-950 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">UMPIRE DELIVERY EXTRA METRIC</span>
                      <div className="flex gap-1 w-full sm:w-auto">
                        {["NONE", "WIDE", "NO_BALL"].map((et) => (
                          <button
                            key={et}
                            type="button"
                            onClick={() => {
                              playSystemClick();
                              setLiveExtraType(et as any);
                              setLiveIsExtra(et !== "NONE");
                            }}
                            className={`flex-1 sm:flex-initial px-3 py-1 text-[9.5px] font-mono font-bold rounded uppercase transition ${
                              liveExtraType === et
                                ? "bg-orange-950 text-orange-450 border border-orange-500/30"
                                : "bg-black text-gray-600 border border-gray-900"
                            }`}
                          >
                            {et === "NONE" ? "Legal Ball" : et.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Option-based views based on Outcome selection */}
                    {liveOutcome === "DOT" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-[#050505] border border-gray-950 rounded-xl font-mono">
                        {/* Option A vs Option B selection */}
                        <div className="space-y-2">
                          <span className="text-[9.5px] text-gray-405 uppercase tracking-widest block font-bold">DOT BALL SUB-TYPE</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              key="beaten"
                              type="button"
                              onClick={() => { playSystemClick(); setLiveDotType("BEATEN"); setLiveCoord(null); }}
                              className={`p-2.5 rounded-lg text-[9.5px] uppercase transition flex flex-col items-center justify-center text-center ${
                                liveDotType === "BEATEN" ? "bg-purple-950/30 border border-purple-500/30 text-purple-400 font-extrabold" : "bg-black border border-gray-900 text-gray-400"
                              }`}
                            >
                              <span>Option A</span>
                              <span className="text-[8px] opacity-75 font-normal">BATSMAN BEATEN</span>
                            </button>
                            <button
                              key="fielder"
                              type="button"
                              onClick={() => { playSystemClick(); setLiveDotType("FIELDER"); setLiveCoord(null); }}
                              className={`p-2.5 rounded-lg text-[9.5px] uppercase transition flex flex-col items-center justify-center text-center ${
                                liveDotType === "FIELDER" ? "bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 font-extrabold" : "bg-black border border-gray-900 text-gray-400"
                              }`}
                            >
                              <span>Option B</span>
                              <span className="text-[8px] opacity-75 font-normal">PLAYED TO FIELDER</span>
                            </button>
                          </div>
                        </div>

                        {/* Dynamic sub selection reasoning */}
                        {liveDotType === "BEATEN" ? (
                          <div className="space-y-2">
                            <span className="text-[9.5px] text-purple-450 uppercase tracking-widest block font-bold">Option A: SELECT BEATEN TYPE DEVIATION</span>
                            <select
                              value={liveBeatenType}
                              onChange={(e) => setLiveBeatenType(e.target.value)}
                              className="w-full bg-black border border-gray-900 rounded-lg p-2.5 text-xs text-purple-300 focus:outline-none"
                            >
                              <option value="FLIGHT">Flight Beaten (Overhead drift dip)</option>
                              <option value="DRIFT">Drift Beaten (Horizontal aerodynamic shift)</option>
                              <option value="TURN">Turn Beaten (Sharp bounce deflection)</option>
                              <option value="SPEED">Speed Beaten (Skidded off seam vector)</option>
                            </select>
                            <span className="text-[8.5px] text-gray-600 leading-normal block">Option A logs a beaten metric and triggers Mastery advancement without requiring a Wagon Wheel plot.</span>
                          </div>
                        ) : (
                          <div className="space-y-1 bg-black/40 p-2.5 rounded border border-gray-905 flex flex-col justify-center">
                            <span className="text-[9.5px] text-cyan-400 uppercase tracking-widest block font-bold">Option B: PLOT PLACEMENT</span>
                            <p className="text-[9px] text-gray-500 leading-normal font-sans">
                              Clicking directly on the **Ground Map** to select where the ball was hit is **MANDATORY** to log Option B: PLAYED TO FIELDER.
                            </p>
                            {liveCoord ? (
                              <span className="text-[9px] text-emerald-400 font-black tracking-wide block mt-1 uppercase">✓ Plot locked in {liveCoord.zone}</span>
                            ) : (
                              <span className="text-[9px] text-rose-400 font-black animate-pulse block mt-1 uppercase">⚠ PLOT FIELD LOCATION ON GRAPH</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {liveOutcome === "RUN" && (
                      <div className="p-3 bg-[#050505] border border-gray-950 rounded-xl space-y-1.5 font-mono text-center">
                        <span className="text-[9.5px] text-yellow-500 uppercase tracking-widest block font-black">PLOT SCORING SHOT PATH TERMINUS</span>
                        <p className="text-[9px] text-gray-400 max-w-md mx-auto leading-relaxed font-sans">
                          The batsman scored {liveRuns} runs. Clicking on the Map below where the shot traveled is **MANDATORY** to save the delivery's run line.
                        </p>
                        {liveCoord ? (
                          <span className="text-[10px] text-green-400 block font-black uppercase">✓ Target Plotted: {liveCoord.zone} (Angle {liveCoord.angle}°, Distance {liveCoord.distance}%)</span>
                        ) : (
                          <span className="text-[10px] text-amber-500 block font-black animate-pulse uppercase">⚠ CLICK ON FIELD MAP BELOW TO PLOT PATH</span>
                        )}
                      </div>
                    )}

                    {liveOutcome === "WICKET" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-[#050505] border border-gray-950 rounded-xl font-mono">
                        <div className="space-y-2">
                          <span className="text-[9.5px] text-red-500 uppercase tracking-widest block font-bold">WICKET DISMISSAL TYPE</span>
                          <select
                            value={liveWicketType}
                            onChange={(e) => {
                              playSystemClick();
                              setLiveWicketType(e.target.value);
                              // Clean coordination if we switch to non-wagon wickets
                              if (["BOWLED", "LBW", "STUMPED", "HIT_WICKET"].includes(e.target.value)) {
                                setLiveCoord(null);
                              }
                            }}
                            className="w-full bg-black border border-gray-900 rounded-lg p-2.5 text-xs text-red-400 font-bold focus:outline-none"
                          >
                            <option value="BOWLED">Bowled (Clean breakthrough)</option>
                            <option value="CAUGHT">Caught (Fielder collection)</option>
                            <option value="LBW">L.B.W. (Trapped Plumb)</option>
                            <option value="STUMPED">Stumped (Dragged Foot)</option>
                            <option value="RUN_OUT">Run Out (Crease sprint breakdown)</option>
                            <option value="HIT_WICKET">Hit Wicket (Stump impact)</option>
                            <option value="CAUGHT_BOWL">Caught & Bowled (Return reaction catch)</option>
                          </select>
                        </div>

                        {/* Coordinate required indicator for Wickets */}
                        {["CAUGHT", "RUN_OUT", "CAUGHT_BOWL"].includes(liveWicketType) ? (
                          <div className="space-y-1 bg-black/40 p-2 rounded border border-red-950/20 flex flex-col justify-center">
                            <span className="text-[9px] text-red-500 uppercase font-black tracking-wide block">WAGON WHEEL PATH REQUIRED</span>
                            <p className="text-[8.5px] text-gray-500 leading-normal font-sans">
                              For dismissals (Caught, Run Out, Caught & Bowled), plot the exact location of the event on the **Ground Map** to register.
                            </p>
                            {liveCoord ? (
                              <span className="text-[9px] text-green-400 font-bold block">✓ Wicket registered at {liveCoord.zone}</span>
                            ) : (
                              <span className="text-[9px] text-red-400 font-bold animate-pulse block">⚠ PLOT CATCH/EVENT SPOT ON GROUND</span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1 bg-[#100505] p-2 rounded border border-red-950/10 flex flex-col justify-center">
                            <span className="text-[9px] text-gray-500 block uppercase">STUMPS EVENT (NO PATH REQUIRED)</span>
                            <p className="text-[8.5px] text-gray-600 font-sans leading-normal">
                              Stump dismissals (Bowled, LBW, Stumped, Hit Wicket) occur inline without requiring a dynamic field placement marker.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* LIVE INTERACTIVE MAP DISPLAY PREVIEW */}
                    <div className="flex justify-center p-2 bg-[#020202] rounded-xl border border-gray-900 overflow-hidden w-full">
                      <WagonWheelMap 
                        interactive={true} 
                        onSelectCoordinate={(coord) => { playSystemClick(); setLiveCoord(coord); }} 
                        selectedCoordinate={liveCoord} 
                        deliveries={deliveryLogs.map((l, lIndex) => ({
                          over: l.over,
                          ballNum: l.ballNum,
                          skillName: l.skillName,
                          length: l.length,
                          runs: l.runsConceded,
                          isWicket: l.isWicket,
                          wicketType: l.wicketType,
                          angle: l.angle,
                          distance: l.distance,
                          zone: l.zone,
                          dotBallType: l.dotBallType,
                          beatenType: l.beatenType,
                          isExtra: l.isExtra,
                          extraType: l.extraType
                        }))}
                      />
                    </div>
                  </motion.div>
                )}

              </div>

              {/* RIGHT SIDEBAR: ACTIVE TELEMETRY STATS & LIVE QUEST TRACKER */}
              <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
                
                <div className="space-y-4">
                  
                  {/* OVER SUMMARY COUNTERS HUD */}
                  <div className="p-4 bg-[#0a0a0a] border border-gray-900 rounded-xl space-y-3 font-mono">
                    <span className="text-[9.5px] text-cyan-400 font-extrabold uppercase tracking-widest block border-b border-gray-900 pb-1.5">OVER TELEMETRY SCORECARD</span>
                    
                    <div className="grid grid-cols-2 gap-3.5 text-center">
                      <div className="bg-black border border-gray-950 p-2.5 rounded">
                        <span className="text-[8.5px] text-gray-500 uppercase block">CUMULATIVE XP</span>
                        <span className={`text-sm font-black block mt-0.5 ${totalXpEarned >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                          {totalXpEarned > 0 ? `+${totalXpEarned}` : totalXpEarned} XP
                        </span>
                      </div>
                      
                      <div className="bg-black border border-gray-950 p-2.5 rounded">
                        <span className="text-[8.5px] text-gray-500 uppercase block">PERFECT RATIO</span>
                        <span className="text-sm font-black text-yellow-400 block mt-0.5">
                          {Math.round((perfectBallsCount / (deliveryLogs.length || 1)) * 100)}%
                        </span>
                      </div>
                    </div>

                    {isMatchSim && (
                      <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
                        <div className="bg-black/40 border border-gray-950 p-1.5 rounded">
                          <span className="text-[8px] text-gray-500 uppercase">RUNS</span>
                          <span className="font-extrabold text-red-400 block mt-0.5">{totalRunsConceded}</span>
                        </div>
                        <div className="bg-black/40 border border-gray-950 p-1.5 rounded">
                          <span className="text-[8px] text-gray-500 uppercase">WCKTS</span>
                          <span className="font-extrabold text-green-400 block mt-0.5">{totalWicketsTaken}</span>
                        </div>
                        <div className="bg-black/40 border border-gray-950 p-1.5 rounded">
                          <span className="text-[8px] text-gray-500 uppercase">EXTRAS</span>
                          <span className="font-extrabold text-orange-400 block mt-0.5">{totalWides + totalNoBalls}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* REAL-TIME PRESSURE MODE OBJECTIVE TRACKER PANEL */}
                  {isPressureMode && pressureScenario && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-955/10 border-2 border-red-500/30 rounded-xl space-y-3 font-mono relative shadow-[0_0_15px_rgba(239,68,68,0.12)]"
                    >
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded animate-pulse">
                        <span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
                        <span className="text-[7.5px] font-black text-red-400">CORE DANGER</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 border-b border-red-900/20 pb-2">
                        <Shield className="w-4 h-4 text-red-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[8px] text-red-500 font-black uppercase tracking-widest block">PRESSURE SECTOR</span>
                          <h4 className="text-[11px] font-bold text-white truncate uppercase">{pressureScenario.scenarioName}</h4>
                        </div>
                      </div>

                      <div className="p-2 bg-black/45 rounded-lg border border-red-950/20 text-[9px] text-gray-300 leading-normal space-y-1.5">
                        <div className="italic">&gt; {pressureScenario.matchContext}</div>
                        <div className="text-[8px] text-red-400 border-t border-red-900/10 pt-1 leading-relaxed">
                          <strong>ACTIVE DEVIATION:</strong> {pressureScenario.pressureConditions}
                        </div>
                        <div className="text-[8px] text-orange-400 leading-relaxed">
                          <strong>ALERT STATE:</strong> {pressureScenario.specialEvents}
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <span className="text-[8px] text-gray-500 block uppercase font-bold tracking-wider">PRESSURE METRICS COMPARISON</span>
                        
                        {/* Runs Defended Metric */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400 uppercase font-black">Runs conceded limit:</span>
                            <span className={`font-black ${totalRunsConceded <= pressureScenario.runsLimit ? "text-green-400" : "text-red-500 font-extrabold"}`}>
                              {totalRunsConceded} / {pressureScenario.runsLimit} R
                            </span>
                          </div>
                          <div className="w-full bg-black border border-gray-950 h-1.5 rounded-full overflow-hidden p-[1px]">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${totalRunsConceded <= pressureScenario.runsLimit ? "bg-green-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(100, (totalRunsConceded / pressureScenario.runsLimit) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Wickets Target Metric */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400 uppercase font-black">Wicket conquests:</span>
                            <span className={`font-black ${totalWicketsTaken >= pressureScenario.wicketsTarget ? "text-green-450 text-green-400" : "text-yellow-405 text-yellow-400 animate-pulse"}`}>
                              {totalWicketsTaken} / {pressureScenario.wicketsTarget} WKT
                            </span>
                          </div>
                          <div className="w-full bg-black border border-gray-950 h-1.5 rounded-full overflow-hidden p-[1px]">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${totalWicketsTaken >= pressureScenario.wicketsTarget ? "bg-green-500" : "bg-yellow-500"}`}
                              style={{ width: `${Math.min(100, (totalWicketsTaken / pressureScenario.wicketsTarget) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* REAL-TIME LIVE QUEST TARGET WATCH CHECKLIST PANEL */}
                  {activePracticeQuest && (
                    <div className="p-4 bg-purple-950/10 border border-[#7B2FFF]/30 rounded-xl space-y-3 font-mono">
                      <div className="flex items-center gap-1.5 border-b border-[#7B2FFF]/20 pb-2">
                        <Award className="w-4 h-4 text-purple-400 animate-pulse" />
                        <div>
                          <span className="text-[8.5px] text-[#7B2FFF] font-black uppercase tracking-widest block">TARGET QUEST TRACKER</span>
                          <h5 className="text-xs font-black text-gray-200 mt-0.5 block truncate max-w-[190px]">{activePracticeQuest.name}</h5>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <span className="text-[9px] text-gray-550 text-gray-500 block uppercase">REAL-TIME TELEMETRY MATRIX</span>
                        
                        <div className="space-y-1.5">
                          {activePracticeQuest.requirements.oversMin !== undefined && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Overs goal (min):</span>
                              <span className={totalOversGoal >= activePracticeQuest.requirements.oversMin ? "text-green-405 text-green-405 text-green-400 font-bold" : "text-yellow-500 font-bold"}>
                                {totalOversGoal} / {activePracticeQuest.requirements.oversMin} overs
                              </span>
                            </div>
                          )}

                          {activePracticeQuest.requirements.perfectBallsNeeded !== undefined && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Perfect balls logged:</span>
                              <span className={perfectBallsCount >= activePracticeQuest.requirements.perfectBallsNeeded ? "text-green-400 font-bold animate-bounce" : "text-cyan-405 text-cyan-400 font-bold"}>
                                {perfectBallsCount} / {activePracticeQuest.requirements.perfectBallsNeeded}
                              </span>
                            </div>
                          )}

                          {activePracticeQuest.requirements.closeOrBetterNeeded !== undefined && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Close / Perfect balls:</span>
                              {(() => {
                                const closeOrBetter = deliveryLogs.filter(l => l.length === "Perfect Ball" || l.length === "Close Ball").length;
                                return (
                                  <span className={closeOrBetter >= activePracticeQuest.requirements.closeOrBetterNeeded ? "text-green-400 font-bold" : "text-orange-400 font-bold"}>
                                    {closeOrBetter} / {activePracticeQuest.requirements.closeOrBetterNeeded}
                                  </span>
                                );
                              })()}
                            </div>
                          )}

                          {activePracticeQuest.requirements.wicketsNeeded !== undefined && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Wickets in session:</span>
                              <span className={totalWicketsTaken >= activePracticeQuest.requirements.wicketsNeeded ? "text-green-400 font-bold" : "text-gray-500"}>
                                {totalWicketsTaken} / {activePracticeQuest.requirements.wicketsNeeded}
                              </span>
                            </div>
                          )}

                          {activePracticeQuest.requirements.runsMaxLte !== undefined && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Runs concession cap:</span>
                              <span className={totalRunsConceded <= activePracticeQuest.requirements.runsMaxLte ? "text-green-400 font-bold" : "text-red-400 font-bold animate-pulse"}>
                                {totalRunsConceded} / Max {activePracticeQuest.requirements.runsMaxLte}R
                              </span>
                            </div>
                          )}

                          {activePracticeQuest.requirements.dotBallsNeeded !== undefined && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Dot balls count:</span>
                              {(() => {
                                const dots = deliveryLogs.filter(l => l.runsConceded === 0 && !l.isExtra).length;
                                return (
                                  <span className={dots >= activePracticeQuest.requirements.dotBallsNeeded ? "text-green-400 font-bold" : "text-cyan-400"}>
                                    {dots} / {activePracticeQuest.requirements.dotBallsNeeded} dots
                                  </span>
                                );
                              })()}
                            </div>
                          )}

                          {activePracticeQuest.requirements.skillsSpecificWickets !== undefined && (
                            <div className="pt-1 border-t border-gray-900 mt-1.5 space-y-1">
                              <span className="text-[8.5px] text-purple-400 uppercase font-black">REQUIRES EXACT AGENTS DISMISSAL</span>
                              {Object.entries(activePracticeQuest.requirements.skillsSpecificWickets).map(([name, needed]) => {
                                const currentWkts = deliveryLogs.filter(l => l.isWicket && l.skillName.toUpperCase() === name.toUpperCase()).length;
                                return (
                                  <div key={name} className="flex justify-between text-[10.5px] text-gray-400">
                                    <span>{name} Takdown:</span>
                                    <span className={currentWkts >= needed ? "text-green-400 font-bold" : "text-gray-500"}>
                                      {currentWkts} / {needed}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* LOG BALL TELEMETRY PRIMARY MASTER SUBMIT ACTION */}
                <button
                  type="button"
                  onClick={handleLogDelivery}
                  className="w-full py-4.5 bg-gradient-to-r from-red-600 to-[#7B2FFF] text-white font-mono text-xs font-black tracking-widest uppercase rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(123,47,255,0.25)] hover:bg-[#6c28eb] transition cursor-pointer flex items-center justify-center gap-2 block animate-pulse hover:animate-none"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                  LOG BALL OUTCOME TELEMETRY
                </button>

              </div>
            </div>
          )}

        </div>
      ) : (
        /* --- CHRONICLES HISTORICAL DRILLS REPOSITORIES REVIEW PAGE --- */
        <div className="p-6 bg-[#0a0a0a] border border-gray-900 rounded-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-900">
            <div>
              <h3 className="text-sm font-black font-mono tracking-wider text-[#7B2FFF] flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-purple-400" /> EVOLUTION HISTORY REPORTS
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">CHAMBER ROTATIONS DATA DIRECTORIES LOG</span>
            </div>
            
            {history.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-xs font-mono font-bold text-red-400 hover:text-white flex items-center gap-1.5 transition uppercase cursor-pointer"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                PURGE HISTORY RECORDS
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="py-12 text-center text-gray-600 font-mono text-xs italic bg-black/45 border border-gray-950 rounded-xl md:py-16">
                <ShieldAlert className="w-10 h-10 text-gray-800 mx-auto mb-2 animate-pulse" />
                <span>CYPHER MATRIX IS EMPTY. Initiate Net Drills or Match Sim inside the active chamber.</span>
              </div>
            ) : (
              history.map((session) => {
                const isExpanded = expandedSessionHistoryId === session.id;
                const pill = getRankPill(session.combatEfficiency);
                return (
                  <div 
                    key={session.id}
                    className="bg-black border border-gray-900 rounded-xl overflow-hidden hover:border-gray-800 transition text-[11px] font-mono"
                  >
                    
                    {/* Collapsed view header */}
                    <div 
                      onClick={() => { playSystemClick(); setExpandedSessionHistoryId(isExpanded ? null : session.id); }}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none bg-black/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8.5px] px-2 py-0.5 rounded border uppercase ${pill.color} font-black`}>
                            {pill.label}
                          </span>
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded border font-bold ${
                            session.pressureScenario 
                              ? "text-red-400 border-red-500/30 bg-red-950/20" 
                              : session.isMatchSim 
                                ? "text-cyan-405 border-cyan-500/10" 
                                : "text-gray-505 border-gray-900"
                          }`}>
                            {session.pressureScenario ? `Pressure Mode [${session.pressureScenario.difficultyWord}]` : (session.isMatchSim ? "Match simulation" : "Standard Net drill")}
                          </span>
                          <span className="font-extrabold text-gray-200">{session.drillTitle}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate max-w-lg font-sans leading-normal">{session.summary}</p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-gray-955 pt-2 md:pt-0">
                        <div className="text-left md:text-right">
                          <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{session.timestamp}</span>
                          </div>
                          <span className="text-cyan-400 font-extrabold block text-xs mt-0.5">+{session.xpEarned} XP AWARDED</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleClearHistoryItem(session.id, e)}
                            className="p-1.5 hover:bg-red-950/20 hover:text-red-400 rounded-lg text-gray-650 transition cursor-pointer"
                            title="Delete Log entry"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-400" />
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </div>
                      </div>

                    </div>

                    {/* Expandable delivery details mapping list */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="border-t border-gray-950 p-4 bg-black/80 space-y-4 overflow-hidden"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10.5px]">
                            <div className="bg-[#050505] p-2 border border-gray-950 rounded">
                              <span className="text-[8px] text-gray-500 block">PERFECT</span>
                              <span className="font-bold text-yellow-450">{session.counts.perfect} / {session.counts.totalDeliveries}</span>
                            </div>
                            <div className="bg-[#050505] p-2 border border-gray-950 rounded">
                              <span className="text-[8px] text-gray-500 block">CLOSE BALLS</span>
                              <span className="font-bold text-emerald-400">{session.counts.close}</span>
                            </div>
                            <div className="bg-[#050505] p-2 border border-gray-950 rounded">
                              <span className="text-[8px] text-gray-500 block">JUST SHORT</span>
                              <span className="font-bold text-blue-400">{session.counts.justShort}</span>
                            </div>
                            <div className="bg-[#050505] p-2 border border-gray-950 rounded bg-orange-950/5">
                              <span className="text-[8px] text-orange-400 block font-bold">SHORT</span>
                              <span className="font-bold text-orange-400">{session.counts.short}</span>
                            </div>
                            <div className="bg-[#050505] p-2 border border-gray-950 rounded bg-rose-950/5">
                              <span className="text-[8px] text-rose-450 block font-bold">FULL TOSS</span>
                              <span className="font-bold text-rose-400">{session.counts.fullToss}</span>
                            </div>
                          </div>

                          {/* Detail of match sim wicket logs */}
                          {session.isMatchSim && (
                            <div className="p-3 bg-[#0c0c0c] border border-gray-950 rounded-lg flex items-center justify-around gap-2 text-center">
                              <div>
                                <span className="text-[8.5px] text-gray-500 block uppercase">TOTAL RUNS YIELD</span>
                                <span className="text-red-400 font-extrabold">{session.counts.runs} runs (Econ: {Number((session.counts.runs / session.oversCount).toFixed(2))})</span>
                              </div>
                              <span className="text-gray-900">|</span>
                              <div>
                                <span className="text-[8.5px] text-gray-500 block uppercase">SECURED WICKETS</span>
                                <span className="text-green-400 font-extrabold">{session.counts.wickets} wickets</span>
                              </div>
                              <span className="text-gray-900">|</span>
                              <div>
                                <span className="text-[8.5px] text-gray-500 block uppercase">BLANK DOT BALLS</span>
                                <span className="text-cyan-405 font-bold">{session.counts.dots} dot balls logged</span>
                              </div>
                            </div>
                          )}

                          {session.questStatus && (
                            <div className={`p-3.5 rounded border ${
                              session.questStatus.met 
                                ? "bg-green-950/10 border-green-500/20 text-green-300" 
                                : "bg-red-950/10 border-red-500/20 text-red-350"
                            }`}>
                              <span className="text-[8.5px] text-gray-400 uppercase tracking-widest block font-bold">HISTORIC QUEST TRIALOG</span>
                              <strong className="text-[11px] block mt-0.5 uppercase">
                                {session.questStatus.questName} • {session.questStatus.met ? "SUCCESS" : "FAILED"}
                              </strong>
                              {!session.questStatus.met && (
                                <ul className="list-disc pl-4 text-[9.5px] text-red-300/80 space-y-0.5 mt-1">
                                  {session.questStatus.failures.map((f, idx) => (
                                    <li key={idx}>{f}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {session.pressureScenario && (
                            <div className={`p-3.5 rounded border ${
                              session.pressureScenario.met 
                                ? "bg-red-950/10 border-red-500/20 text-green-300" 
                                : "bg-orange-955/10 border-orange-500/20 text-orange-400"
                            }`}>
                              <span className="text-[8.5px] text-red-400 uppercase tracking-widest block font-bold">🚨 HISTORICAL PRESSURE CHALLENGE REPORT</span>
                              <strong className="text-[10.5px] block mt-0.5 uppercase text-white">
                                {session.pressureScenario.difficultyWord} CHALLENGE • {session.pressureScenario.met ? "TRIUMPHANTLY CONQUERED!" : "SYSTEM FAILED"}
                              </strong>
                              <p className="text-[10px] text-gray-400 italic mt-0.5 font-sans leading-relaxed">
                                {session.pressureScenario.desc}
                              </p>
                              {!session.pressureScenario.met && (
                                <ul className="list-disc pl-4 text-[9.5px] text-red-300/80 space-y-0.5 mt-1 font-mono">
                                  {session.pressureScenario.failures.map((f, idx) => (
                                    <li key={idx} className="text-red-300">{f}</li>
                                  ))}
                                </ul>
                              )}
                              {session.pressureScenario.met && (
                                <p className="text-[9.5px] text-green-400 mt-1">
                                  Conceded {session.counts.runs} runs (limit: {session.pressureScenario.runsLimit}) and claimed {session.counts.wickets} wickets (target: {session.pressureScenario.wicketsTarget}).
                                </p>
                              )}
                            </div>
                          )}

                          {/* Ball-by-ball micro logs list */}
                          <div className="space-y-1">
                            <span className="text-[8.5px] text-gray-500 uppercase tracking-widest block font-bold border-b border-gray-950 pb-1">BALL OUTCOME TELEMETRY HISTORIC LOG</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 font-mono text-[9.5px]">
                              {session.balls.map((ball, bidx) => (
                                <div key={bidx} className="p-2 bg-black border border-gray-950 rounded flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-600">O{ball.over}:B{ball.ballNum}</span>
                                    <span className="text-cyan-400 uppercase font-black">{ball.skillName}</span>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                    <span className="text-gray-400">{ball.length}</span>
                                    {session.isMatchSim && (
                                      <span className={ball.isWicket ? "text-green-405 font-bold" : "text-gray-500"}>
                                        {ball.isWicket ? `WKT` : ball.isExtra ? `EXT` : `${ball.runsConceded}R`}
                                      </span>
                                    )}
                                    <span className={ball.xp >= 0 ? "text-[#00D4FF]" : "text-red-405"}>
                                      {ball.xp >= 0 ? `+${ball.xp}` : ball.xp} XP
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ADVANCED WAGON WHEEL & HEATMAP ANALYTICS HUB */}
                          <div className="border-t border-purple-900/20 pt-4 space-y-4">
                            <div className="flex items-center gap-2 pb-1.5 text-xs text-[#7B2FFF] font-mono tracking-wider font-extrabold uppercase border-b border-gray-950">
                              <Compass className="w-4 h-4 text-purple-400" />
                              WAGON WHEEL ANALYTICS ENGINE V2
                            </div>

                            {/* Nav buttons for collapsible tabs */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-[9.5px] font-bold">
                              {[
                                { key: "stats", label: "Session Stats" },
                                { key: "wheel", label: "Wagon Wheel" },
                                { key: "wicket", label: "Wickets List" },
                                { key: "boundary", label: "Boundaries" },
                                { key: "beaten", label: "Beaten Analysis" }
                              ].map((sect) => {
                                const active = !!(expandedSections[session.id]?.[sect.key]);
                                return (
                                  <button
                                    key={sect.key}
                                    type="button"
                                    onClick={() => { playSystemClick(); toggleSection(session.id, sect.key); }}
                                    className={`py-2 px-1.5 rounded transition uppercase flex items-center justify-center gap-1.5 border ${
                                      active 
                                        ? "bg-purple-950/20 border-[#7B2FFF]/40 text-purple-300 shadow-[0_0_8px_rgba(123,47,255,0.1)]" 
                                        : "bg-black/50 border-gray-950 text-gray-500 hover:text-gray-300 hover:border-gray-900"
                                    }`}
                                  >
                                    <span>{sect.label}</span>
                                    <span>{active ? "▲" : "▼"}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* SUB-SECTION 1: SESSION STATISTICS */}
                            {expandedSections[session.id]?.stats && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 bg-[#050505] border border-gray-950 rounded-xl space-y-3"
                              >
                                <span className="text-[8.5px] text-gray-500 uppercase tracking-widest font-mono font-bold block border-b border-gray-900 pb-1 shrink-0">1. CORE METRIC MATRIX DATA</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                                  <div className="bg-black/40 p-2.5 rounded border border-gray-950">
                                    <span className="text-[7.5px] text-gray-500 block uppercase">TOTAL BALLS</span>
                                    <span className="text-xs text-white font-black">{session.counts.totalDeliveries}</span>
                                  </div>
                                  <div className="bg-black/40 p-2.5 rounded border border-gray-950">
                                    <span className="text-[7.5px] text-gray-500 block uppercase">CONCEDED RUNS</span>
                                    <span className="text-xs text-red-400 font-black">{session.counts.runs} runs</span>
                                  </div>
                                  <div className="bg-black/40 p-2.5 rounded border border-gray-950">
                                    <span className="text-[7.5px] text-gray-500 block uppercase">ECONOMY RATE</span>
                                    <span className="text-xs text-white font-black">
                                      {session.oversCount > 0 ? (session.counts.runs / session.oversCount).toFixed(2) : "0.00"}
                                    </span>
                                  </div>
                                  <div className="bg-black/40 p-2.5 rounded border border-gray-950">
                                    <span className="text-[7.5px] text-gray-500 block uppercase">DOT BALLS</span>
                                    <span className="text-xs text-cyan-400 font-black">{session.counts.dots || 0} balls</span>
                                  </div>
                                  <div className="bg-black/40 p-2.5 rounded border border-gray-950">
                                    <span className="text-[7.5px] text-gray-500 block uppercase">BEATEN RATIO</span>
                                    <span className="text-xs text-purple-400 font-black">
                                      {session.counts.beaten || session.balls.filter(b => b.dotBallType === "BEATEN").length} balls
                                    </span>
                                  </div>
                                  <div className="bg-black/40 p-2.5 rounded border border-gray-950">
                                    <span className="text-[7.5px] text-gray-500 block uppercase">PERFECT PRECISION</span>
                                    <span className="text-xs text-yellow-405 font-black">
                                      {Math.round((session.counts.perfect / session.counts.totalDeliveries) * 100) || 0}%
                                    </span>
                                  </div>
                                  <div className="bg-black/40 p-2.5 rounded border border-[#ef4444]/1 bg-red-950/5">
                                    <span className="text-[7.5px] text-red-500 block uppercase">WICKETS CAPTURED</span>
                                    <span className="text-xs text-red-400 font-extrabold">{session.counts.wickets || 0} WKT</span>
                                  </div>
                                  <div className="bg-black/40 p-2.5 rounded border border-orange-500/1 bg-orange-950/5">
                                    <span className="text-[7.5px] text-orange-400 block uppercase">EXTRAS ACCUMULATED</span>
                                    <span className="text-xs text-orange-400 font-black">
                                      {(session.counts.wides || 0) + (session.counts.noBalls || 0)} balls
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* SUB-SECTION 2: WAGON WHEEL & HEAT MAP ENGINE */}
                            {expandedSections[session.id]?.wheel && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 bg-[#050505] border border-gray-950 rounded-xl space-y-4"
                              >
                                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-900 pb-2 gap-2">
                                  <span className="text-[8.5px] text-gray-500 uppercase tracking-widest font-mono font-bold block">2. FLIGHT TRAJECTORY PLOT MODEL</span>
                                  
                                  {/* HEATMAP MODES CHOOOSER */}
                                  <div className="flex flex-wrap gap-1 font-mono text-[8px] justify-center">
                                    {[
                                      { type: "wheel", label: "Wagon Wheel" },
                                      { type: "scoring_heatmap", label: "Scoring Density" },
                                      { type: "wicket_heatmap", label: "Wickets Density" },
                                      { type: "beaten_heatmap", label: "Landing Beaten Density" },
                                      { type: "bowling_heatmap", label: "General Landing Density" }
                                    ].map((mode) => (
                                      <button
                                        key={mode.type}
                                        type="button"
                                        onClick={() => { playSystemClick(); setSessionViewType(session.id, mode.type as any); }}
                                        className={`px-2 py-1 rounded transition uppercase ${
                                          (sessionViewTypes[session.id] || "wheel") === mode.type
                                            ? "bg-[#7B2FFF]/20 border border-[#7B2FFF]/40 text-[#7B2FFF]"
                                            : "bg-black border border-gray-950 text-gray-500 hover:text-gray-300"
                                        }`}
                                      >
                                        {mode.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* THE MAP VIEWER CONTAINER */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                  <div className="flex justify-center p-2 bg-[#020202] rounded-xl border border-gray-950 product_stage">
                                    <WagonWheelMap 
                                      interactive={false}
                                      viewType={sessionViewTypes[session.id] || "wheel"}
                                      deliveries={session.balls.map((b) => ({
                                        over: b.over,
                                        ballNum: b.ballNum,
                                        skillName: b.skillName,
                                        length: b.length,
                                        runs: b.runsConceded,
                                        isWicket: b.isWicket,
                                        wicketType: b.wicketType,
                                        angle: b.angle,
                                        distance: b.distance,
                                        zone: b.zone,
                                        dotBallType: b.dotBallType,
                                        beatenType: b.beatenType,
                                        isExtra: b.isExtra,
                                        extraType: b.extraType
                                      }))}
                                      onSelectDeliveryReview={(ball) => { playSystemClick(); handleSelectDeliveryReview(session.id, ball); }}
                                    />
                                  </div>

                                  {/* SELECTED BALL DETAIL CARD */}
                                  <div className="space-y-3 font-mono text-[10px] bg-black/60 p-3.5 rounded-xl border border-gray-950 self-stretch flex flex-col justify-between">
                                    <div className="space-y-2">
                                      <span className="text-[8.5px] text-cyan-400 font-extrabold uppercase tracking-wider block">INTERACTIVE MARKER REVIEW CARD</span>
                                      <p className="text-gray-500 text-[9px] leading-relaxed">
                                        Click on any of the terminal node circles or "W" wicket targets on the Wagon Wheel map above to pull up microscopic ball release detail metrics!
                                      </p>
                                      
                                      {selectedDeliveryReview[session.id] ? (
                                        <motion.div 
                                          initial={{ opacity: 0, x: -5 }} 
                                          animate={{ opacity: 1, x: 0 }}
                                          className="space-y-1.5 pt-2 border-t border-gray-900 leading-normal"
                                        >
                                          <div className="flex justify-between items-center bg-gray-950/20 p-1.5 rounded border border-gray-950">
                                            <span className="text-gray-400">OVER &amp; BALL:</span>
                                            <span className="text-[#00D4FF] font-black">Over {selectedDeliveryReview[session.id].over} • Ball {selectedDeliveryReview[session.id].ballNum}</span>
                                          </div>
                                          <div className="flex justify-between items-center bg-gray-950/20 p-1.5 rounded border border-gray-950">
                                            <span className="text-gray-400">SPIN VARIATION:</span>
                                            <span className="text-purple-400 font-bold uppercase">{selectedDeliveryReview[session.id].skillName}</span>
                                          </div>
                                          <div className="flex justify-between items-center bg-gray-950/20 p-1.5 rounded border border-gray-950">
                                            <span className="text-gray-400">PITCH HEIGHT METRIC:</span>
                                            <span className="text-yellow-450 font-bold text-yellow-405 text-yellow-400">{selectedDeliveryReview[session.id].length}</span>
                                          </div>
                                          <div className="flex justify-between items-center bg-gray-950/20 p-1.5 rounded border border-gray-950">
                                            <span className="text-gray-400">OUTCOME METRIC:</span>
                                            <span className="font-extrabold text-white">
                                              {selectedDeliveryReview[session.id].isWicket
                                                ? `WICKET (${selectedDeliveryReview[session.id].wicketType})`
                                                : selectedDeliveryReview[session.id].isExtra
                                                  ? `EXTRA (${selectedDeliveryReview[session.id].extraType}) - Conceded ${selectedDeliveryReview[session.id].runsConceded}R`
                                                  : `CONCEDED ${selectedDeliveryReview[session.id].runsConceded} RUN${selectedDeliveryReview[session.id].runsConceded > 1 ? "S" : ""}`}
                                            </span>
                                          </div>
                                          {selectedDeliveryReview[session.id].zone && (
                                            <div className="flex justify-between items-center bg-[#070e07] p-1.5 rounded border border-emerald-950/20 text-emerald-400">
                                              <span>PLOT COORD FLIGHT ZONE:</span>
                                              <span className="font-black uppercase">{selectedDeliveryReview[session.id].zone} (Angle {selectedDeliveryReview[session.id].angle}°)</span>
                                            </div>
                                          )}
                                          {selectedDeliveryReview[session.id].dotBallType === "BEATEN" && (
                                            <div className="p-1.5 rounded bg-purple-950/10 border border-purple-500/20 text-purple-300">
                                              <span className="font-black">Option A: BATSMAN BEATEN</span>
                                              <span className="block text-[8.5px] opacity-80 mt-0.5">Tactical Deviation: {selectedDeliveryReview[session.id].beatenType || "FLIGHT"} beaten.</span>
                                            </div>
                                          )}
                                        </motion.div>
                                      ) : (
                                        <div className="py-8 text-center italic text-gray-600 font-sans text-[9px]">
                                          No marker selected. Plot coordinates are visible. Click on circles above.
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-[8.5px] text-gray-655 font-sans mt-2 block leading-relaxed">Pinch / drag / mouse-scroll to zoom-pan around ground field. Double-click/double-tap grid canvas to center reset map view scale.</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* SUB-SECTION 3: WICKETS ANALYSIS */}
                            {expandedSections[session.id]?.wicket && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 bg-[#050505] border border-gray-950 rounded-xl space-y-2.5"
                              >
                                <span className="text-[8.5px] text-gray-500 uppercase tracking-widest font-mono font-bold block border-b border-gray-900 pb-1">3. DETAILED CONQUEST WICKETS JOURNAL</span>
                                {session.balls.filter(b => b.isWicket).length === 0 ? (
                                  <div className="py-4 text-center font-mono text-[9px] italic text-gray-600 bg-black/40 border border-gray-950 rounded">
                                    No wicket conquests on record for this session. Keep spin vectors tight!
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 mt-1 font-mono text-[9px]">
                                    {/* Mobile cards view to preserve absolute responsive containment */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {session.balls.filter(b => b.isWicket).map((ball, idx) => (
                                        <div key={idx} className="p-2.5 bg-black rounded border border-red-500/10 flex flex-col justify-between space-y-1">
                                          <div className="flex justify-between items-center">
                                            <span className="text-red-400 font-bold uppercase bg-red-950/20 px-1.5 py-0.5 rounded border border-red-550/15">
                                              {ball.wicketType}
                                            </span>
                                            <span className="text-gray-500 font-bold">O{ball.over} : B{ball.ballNum}</span>
                                          </div>
                                          <div className="text-[9.5px] text-white font-bold leading-none">{ball.skillName}</div>
                                          <div className="text-gray-400 flex justify-between items-center text-[8.5px] mt-1 pt-1 border-t border-gray-950">
                                            <span>HEIGHT: <strong className="text-yellow-500 uppercase">{ball.length}</strong></span>
                                            {ball.zone && <span>ZONE: <strong className="text-purple-400 uppercase">{ball.zone}</strong></span>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* SUB-SECTION 4: BOUNDARY ANALYSIS */}
                            {expandedSections[session.id]?.boundary && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 bg-[#050505] border border-gray-950 rounded-xl space-y-2.5"
                              >
                                <span className="text-[8.5px] text-gray-500 uppercase tracking-widest font-mono font-bold block border-b border-gray-900 pb-1">4. BOUNDARIES PENETRATION RECON</span>
                                {(() => {
                                  const boundaries = session.balls.filter(b => b.runsConceded === 4 || b.runsConceded === 6);
                                  const totalBoundaryRuns = boundaries.reduce((s, b) => s + b.runsConceded, 0);
                                  const pct = Math.round((totalBoundaryRuns / (session.counts.runs || 1)) * 100);

                                  return boundaries.length === 0 ? (
                                    <div className="py-4 text-center font-mono text-[9px] italic text-gray-650 bg-black/45 border border-gray-950 rounded">
                                      Zero boundaries conceded! Sensational pinpoint bowling accuracy!
                                    </div>
                                  ) : (
                                    <div className="space-y-2 font-mono text-[9px]">
                                      <div className="flex justify-between text-gray-400 bg-gray-950/45 p-2 rounded border border-gray-950 text-[9.5px]">
                                        <span>BOUNDARIES YIELD: <strong>{boundaries.length} ({boundaries.filter(b => b.runsConceded === 4).length} Fours, {boundaries.filter(b => b.runsConceded === 6).length} Sixes)</strong></span>
                                        <span>YIELD POWER RATIO: <strong>{pct}% of total runs</strong></span>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {boundaries.map((ball, idx) => (
                                          <div key={idx} className="p-2.5 bg-black rounded border border-orange-500/10 flex flex-col space-y-1.5 flex flex-col justify-between">
                                            <div className="flex justify-between items-center text-[10px]">
                                              <span className={`px-1.5 py-0.5 rounded font-black ${ball.runsConceded === 6 ? "bg-red-950/30 text-red-500 border border-red-500/20 animate-pulse" : "bg-blue-950/20 text-blue-400 border border-blue-500/20"}`}>
                                                {ball.runsConceded} RUNS CONCEDED
                                              </span>
                                              <span className="text-gray-550">O{ball.over} : B{ball.ballNum}</span>
                                            </div>
                                            <div className="text-white font-semibold">{ball.skillName}</div>
                                            <p className="text-[8px] text-gray-400 flex justify-between pt-1 border-t border-gray-950 leading-relaxed font-sans">
                                              <span>LANDING: <strong className="text-orange-400 uppercase">{ball.length}</strong></span>
                                              {ball.zone && <span>TARGET ZONE: <strong className="text-[#00D4FF] uppercase">{ball.zone}</strong></span>}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </motion.div>
                            )}

                            {/* SUB-SECTION 5: BEATEN BALL ANALYSIS */}
                            {expandedSections[session.id]?.beaten && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 bg-[#050505] border border-gray-950 rounded-xl space-y-2.5"
                              >
                                <span className="text-[8.5px] text-gray-500 uppercase tracking-widest font-mono font-bold block border-b border-gray-900 pb-1">5. TACTICAL BATSMAN BEATEN ANALYSIS</span>
                                {(() => {
                                  const beatenBalls = session.balls.filter(b => b.dotBallType === "BEATEN");
                                  const flightCou = beatenBalls.filter(b => (b.beatenType || "").toUpperCase().includes("FLIGHT")).length;
                                  const driftCou = beatenBalls.filter(b => (b.beatenType || "").toUpperCase().includes("DRIFT")).length;
                                  const turnCou = beatenBalls.filter(b => (b.beatenType || "").toUpperCase().includes("TURN")).length;
                                  const speedCou = beatenBalls.filter(b => (b.beatenType || "").toUpperCase().includes("SPEED")).length;

                                  return beatenBalls.length === 0 ? (
                                    <div className="py-4 text-center font-mono text-[9px] italic text-gray-650 bg-black/45 border border-gray-950 rounded">
                                      Zero batsman beaten ball tactical deviations recorded. Tighten your speed and spin!
                                    </div>
                                  ) : (
                                    <div className="space-y-3 font-mono text-[9px]">
                                      {/* Micro stats counter grid */}
                                      <div className="grid grid-cols-4 gap-1.5 text-center text-[8.5px]">
                                        <div className="bg-purple-950/10 border border-purple-500/10 p-1.5 rounded text-purple-300">
                                          <span>FLIGHT</span>
                                          <strong className="block text-xs mt-0.5">{flightCou}</strong>
                                        </div>
                                        <div className="bg-purple-950/11 border border-purple-500/10 p-1.5 rounded text-[#a855f7]">
                                          <span>DRIFT</span>
                                          <strong className="block text-xs mt-0.5">{driftCou}</strong>
                                        </div>
                                        <div className="bg-purple-950/11 border border-purple-500/10 p-1.5 rounded text-[#c084fc]">
                                          <span>TURN</span>
                                          <strong className="block text-xs mt-0.5">{turnCou}</strong>
                                        </div>
                                        <div className="bg-purple-950/11 border border-purple-500/10 p-1.5 rounded text-[#00D4FF]">
                                          <span>SPEED</span>
                                          <strong className="block text-xs mt-0.5">{speedCou}</strong>
                                        </div>
                                      </div>

                                      {/* List cards of beaten logs */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {beatenBalls.map((ball, idx) => (
                                          <div key={idx} className="p-2 bg-black rounded border border-purple-500/10 space-y-1.5 flex flex-col justify-between">
                                            <div className="flex justify-between items-center">
                                              <span className="text-purple-400 font-extrabold uppercase bg-purple-950/20 px-1.5 py-0.5 rounded border border-purple-550/15">
                                                {ball.beatenType || "FLIGHT"} BEATEN
                                              </span>
                                              <span className="text-gray-550">O{ball.over} : B{ball.ballNum}</span>
                                            </div>
                                            <div className="text-white font-semibold leading-tight">{ball.skillName}</div>
                                            <div className="text-[8.5px] text-gray-500 flex justify-between items-center pt-1 border-t border-gray-955 leading-none">
                                              <span>PITCH LANDING: <strong className="text-purple-350">{ball.length}</strong></span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </motion.div>
                            )}

                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
