import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, Award, Star, AlertTriangle, Sparkles, Trophy, 
  Clock, CheckCircle, Flame, BookOpen, AlertCircle, 
  ChevronRight, RefreshCw, Layers, Skull, Check,
  Target, Swords, Shield, Coins, Sparkle
} from "lucide-react";
import { PracticeQuest, SkillItem, SystemDirective } from "../types";
import { playSystemClick, playSystemDing, playPortalSwoosh } from "../utils/audio";
import { QuestDatabaseManager } from "../utils/questDatabaseManager";

interface SystemDirectivesProps {
  directives: SystemDirective[];
  activeQuestId: string | null;
  onSelectQuest: (id: string | null) => void;
  onDeployToChamber: (id: string) => void;
  onForceTriggerSecretQuest: () => void;
  
  // Dynamic features
  skills: SkillItem[];
  practiceQuests: PracticeQuest[];
  activePracticeQuestId: string | null;
  onActivatePracticeQuest: (id: string | null) => void;
  onAddCustomQuest: (quest: PracticeQuest) => void;
  onNavigateToTab: (tab: string) => void;
  playerRank: string;
  playerLevel: number;
  onDeletePracticeQuest?: (questId: string) => void;
  onRerollPracticeQuest?: (questId: string, difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH") => void;
  activePressureScenarioId?: string | null;
  onDeployPressureScenario?: (scenario: any) => void;
}

export default function SystemDirectives({
  directives = [],
  activeQuestId,
  onSelectQuest,
  onDeployToChamber,
  onForceTriggerSecretQuest,
  
  skills = [],
  practiceQuests = [],
  activePracticeQuestId,
  onActivatePracticeQuest,
  onAddCustomQuest,
  onNavigateToTab,
  playerRank,
  playerLevel,
  activePressureScenarioId,
  onDeployPressureScenario,
}: SystemDirectivesProps) {
  // Active selected RPG journal category
  const [activeCategory, setActiveCategory] = useState<string>("ACTIVE");

  // Local state to manage rotation seed for deterministic gacha-board feel
  const [rotationSeed, setRotationSeed] = useState<number>(() => {
    const saved = localStorage.getItem("monarch_quest_rotation_seed_v10");
    return saved ? parseInt(saved, 10) : 101;
  });

  // Load the built-in library of 1120 quests once
  const builtInLibrary = React.useMemo(() => {
    return QuestDatabaseManager.generateBuiltInLibrary();
  }, []);

  // Compute deterministic indices for Daily & Weekly
  const dayIndex = React.useMemo(() => {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 365;
  }, []);

  const weekIndex = React.useMemo(() => {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)) % 54;
  }, []);

  // Generate today's scaled Daily Quest
  const dailyQuest = React.useMemo(() => {
    return QuestDatabaseManager.generateDailyQuest(dayIndex, playerLevel, skills);
  }, [dayIndex, playerLevel, skills.length]);

  // Generate this week's scaled Weekly Quest
  const weeklyQuest = React.useMemo(() => {
    return QuestDatabaseManager.generateWeeklyQuest(weekIndex, playerLevel, skills);
  }, [weekIndex, playerLevel, skills.length]);

  // Reroll callback to trigger a fresh contract rotation
  const handleRerollRotation = () => {
    playSystemDing();
    const nextSeed = rotationSeed + 1;
    setRotationSeed(nextSeed);
    localStorage.setItem("monarch_quest_rotation_seed_v10", String(nextSeed));
  };

  // Get rotated list of 6 quests for standard training/mastery categories
  const getRotatedPool = (category: string) => {
    // Combine built-in library and any manually added custom quests
    const allQuests = [...builtInLibrary, ...practiceQuests];
    const completedIds = practiceQuests.filter(pq => pq.completed).map(pq => pq.id);

    let pool: any[] = [];
    if (category === "CHAMBER") {
      pool = allQuests.filter(q => q.type === "CHAMBER_NET" && !q.id.includes("mastery") && !q.id.includes("daily") && !q.id.includes("weekly"));
    } else if (category === "EVOLUTION") {
      pool = allQuests.filter(q => q.type === "CHAMBER_MATCH_SIM" && !q.id.includes("daily") && !q.id.includes("weekly") && !q.id.includes("mastery"));
    } else if (category === "DUNGEON") {
      pool = allQuests.filter(q => q.type === "DUNGEON_MATCH" && !q.id.includes("weekly") && !q.id.includes("mastery"));
    } else if (category === "MASTERY") {
      pool = allQuests.filter(q => q.id.includes("mastery"));
    } else {
      return [];
    }

    // Filter out completed ones, and filter for level-unlocked parameters
    const unlockedAndUncompleted = pool.filter(q => {
      const isCompleted = completedIds.includes(q.id) || q.completed;
      if (isCompleted) return false;

      // Recommended level lock
      const recLevel = q.recommendedLevel || 1;
      if (playerLevel < recLevel) return false;

      // Skill unlock filter (must have skill in profile to see skill-specific quest)
      if (q.skillName && q.skillName !== "UNIVERSAL") {
        const unlockedSkills = skills.map(s => s.name.toUpperCase());
        if (!unlockedSkills.includes(q.skillName.toUpperCase())) {
          return false;
        }
      }

      return true;
    });

    // Fallback if low level has no matches
    let finalPool = unlockedAndUncompleted;
    if (finalPool.length === 0) {
      finalPool = pool.filter(q => !(completedIds.includes(q.id) || q.completed));
    }

    // Deterministically shuffle and select top 6 quests using seed hash
    const sorted = [...finalPool].sort((a, b) => {
      const hashA = (a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * rotationSeed) % 1000;
      const hashB = (b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * rotationSeed) % 1000;
      return hashA - hashB;
    });

    return sorted.slice(0, 6);
  };

  const categories = [
    { id: "ACTIVE", label: "Active Quests", icon: Flame, color: "text-rose-500 hover:shadow-[0_0_8px_rgba(239,68,68,0.2)]", desc: "Currently active contract" },
    { id: "CHAMBER", label: "Chamber Training", icon: Layers, color: "text-cyan-400", desc: "Basic skill drills" },
    { id: "EVOLUTION", label: "Evolution Chamber", icon: Swords, color: "text-purple-400", desc: "Mid-level combat sims" },
    { id: "DUNGEON", label: "Match Dungeon", icon: Skull, color: "text-amber-500", desc: "Actual high-stakes games" },
    { id: "PRESSURE", label: "Pressure Chamber", icon: AlertTriangle, color: "text-orange-500", desc: "Intense economy tests" },
    { id: "DAILY", label: "Daily Quests", icon: Clock, color: "text-emerald-400", desc: "Daily recurring tasks" },
    { id: "WEEKLY", label: "Weekly Quests", icon: Trophy, color: "text-yellow-400", desc: "Longer multi-over campaigns" },
    { id: "MASTERY", label: "Skill Mastery Quests", icon: Star, color: "text-blue-400", desc: "Flawless wrist control drills" },
    { id: "COMPLETED", label: "Completed Quests", icon: CheckCircle, color: "text-gray-400", desc: "Successfully secured contracts" }
  ];

  // Helper to get quests in each category
  const getQuestsForCategory = (catId: string) => {
    const completedIds = practiceQuests.filter(pq => pq.completed).map(pq => pq.id);

    switch (catId) {
      case "ACTIVE": {
        if (!activePracticeQuestId) return [];
        if (activePracticeQuestId === dailyQuest.id) return [dailyQuest];
        if (activePracticeQuestId === weeklyQuest.id) return [weeklyQuest];
        
        const builtIn = builtInLibrary.find(q => q.id === activePracticeQuestId);
        if (builtIn) return [{ ...builtIn, completed: false }];

        const custom = practiceQuests.find(q => q.id === activePracticeQuestId);
        return custom ? [custom] : [];
      }
      case "CHAMBER":
        return getRotatedPool("CHAMBER");
      case "EVOLUTION":
        return getRotatedPool("EVOLUTION");
      case "DUNGEON":
        return getRotatedPool("DUNGEON");
      case "MASTERY":
        return getRotatedPool("MASTERY");
      case "PRESSURE": {
        // Fetch real-time pressure library scenarios from localized DB
        const scenarios = QuestDatabaseManager.getPressureScenarios();
        return scenarios.map(sc => ({
          id: `pressure-${sc.scenarioId}`,
          skillName: "UNIVERSAL",
          name: sc.scenarioName,
          description: sc.matchContext,
          difficulty: sc.difficultyRating,
          xpReward: sc.xpReward,
          masteryReward: sc.masteryXpReward,
          type: "CHAMBER_MATCH_SIM",
          completed: (sc as any).completed || false,
          requirements: {
            oversMin: sc.oversRemaining,
            runsMaxLte: sc.runsLimit,
            wicketsNeeded: sc.wicketsTarget
          },
          isPressureScenario: true
        }));
      }
      case "DAILY": {
        const isCompleted = completedIds.includes(dailyQuest.id);
        return [{ ...dailyQuest, completed: isCompleted }];
      }
      case "WEEKLY": {
        const isCompleted = completedIds.includes(weeklyQuest.id);
        return [{ ...weeklyQuest, completed: isCompleted }];
      }
      case "COMPLETED": {
        const completedBuiltIn = builtInLibrary.filter(q => completedIds.includes(q.id)).map(q => ({ ...q, completed: true }));
        const completedCustom = practiceQuests.filter(q => q.completed).map(q => ({ ...q, completed: true }));
        const list = [...completedBuiltIn, ...completedCustom];
        if (completedIds.includes(dailyQuest.id)) {
          list.push({ ...dailyQuest, completed: true });
        }
        if (completedIds.includes(weeklyQuest.id)) {
          list.push({ ...weeklyQuest, completed: true });
        }
        return list;
      }
      default:
        return [];
    }
  };

  // Helper to extract or generate the aesthetic arena name
  const getArenaName = (quest: any) => {
    if (quest.arena) return quest.arena;
    const match = quest.description?.match(/inside the ([^.]+)\./i);
    if (match) return match[1];
    
    const ARENAS = [
      "Sovereign Obelisk Grid",
      "Glacial Fortress Chamber",
      "Underworld Shadow Arena",
      "Evolution Chamber Grid",
      "Monarch Training Sanctum",
      "Abyssal Gateways Stadium",
      "Celestial Void Pitch",
      "Runic Colosseum",
      "Nadir Abyss Core",
      "Aetherial Pinnacle"
    ];
    const hash = quest.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return ARENAS[hash % ARENAS.length];
  };

  // Humanized checklist of objectives
  const getObjectives = (q: any) => {
    const r = q.requirements;
    const list: string[] = [];
    if (!r) return [];
    if (r.oversMin) list.push(`Bowl at least ${r.oversMin} complete overs`);
    if (r.perfectBallsNeeded) list.push(`Land ${r.perfectBallsNeeded} Perfect deliveries`);
    if (r.closeOrBetterNeeded) list.push(`Land ${r.closeOrBetterNeeded} Close or Perfect deliveries`);
    if (r.wicketsNeeded) list.push(`Take ${r.wicketsNeeded} wickets`);
    if (r.runsMaxLte !== undefined) list.push(`Concede at most ${r.runsMaxLte} runs`);
    if (r.dotBallsNeeded) list.push(`Record ${r.dotBallsNeeded} dot balls`);
    return list;
  };

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case "MONARCH":
        return {
          border: "border-red-500/50 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
          badge: "bg-red-950/40 text-red-400 border-red-500/30",
          glow: "from-red-950/30 via-black to-black",
          accentColor: "text-red-400"
        };
      case "CHALLENGING":
        return {
          border: "border-purple-500/50 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
          badge: "bg-purple-950/40 text-purple-400 border-purple-500/30",
          glow: "from-purple-950/20 via-black to-black",
          accentColor: "text-purple-400"
        };
      case "MEDIUM":
        return {
          border: "border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
          badge: "bg-cyan-950/40 text-cyan-300 border-cyan-500/30",
          glow: "from-cyan-950/20 via-black to-black",
          accentColor: "text-cyan-300"
        };
      default:
        return {
          border: "border-gray-800 hover:border-gray-700",
          badge: "bg-gray-950 text-gray-400 border-gray-800",
          glow: "from-gray-950/45 via-black to-black",
          accentColor: "text-gray-400"
        };
    }
  };

  const activeCategoryQuests = getQuestsForCategory(activeCategory);

  // Determine how many total quests are completed
  const totalCompletedCount = practiceQuests.filter(q => q.completed).length;

  return (
    <div className="flex flex-col gap-6 w-full text-white font-mono">
      {/* GLOWING HEADER */}
      <div className="bg-[#050505] border border-gray-900 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="absolute right-0 top-0 pointer-events-none w-72 h-72 bg-purple-950/10 rounded-full filter blur-[100px]" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-950/60 to-black border border-purple-500/40 rounded-xl flex items-center justify-center text-[#7B2FFF] shrink-0 shadow-[0_0_20px_rgba(123,47,255,0.2)]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-gray-300 to-purple-400 bg-clip-text text-transparent">Quest Journal</h1>
              <span className="text-[9px] bg-purple-950/30 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-black">
                RPG MANUAL
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Browse automatically rotated contracts or tackle independent daily, weekly, and pressure tasks. Deploy missions to earn Player XP and Masteries.
            </p>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="flex gap-4 shrink-0 font-mono text-xs w-full md:w-auto">
          <div className="bg-black/80 px-4 py-2.5 rounded-xl border border-gray-900 leading-tight flex-1 md:flex-none">
            <span className="text-gray-500 block text-[9px] uppercase tracking-widest">Active Target</span>
            <span className="text-cyan-400 font-extrabold truncate max-w-[160px] block mt-0.5">
              {activePracticeQuestId ? (
                activePracticeQuestId === dailyQuest.id ? dailyQuest.name :
                activePracticeQuestId === weeklyQuest.id ? weeklyQuest.name :
                (builtInLibrary.find(pq => pq.id === activePracticeQuestId)?.name || 
                 practiceQuests.find(pq => pq.id === activePracticeQuestId)?.name || 
                 "ACTIVE CONTRACT")
              ) : (
                activePressureScenarioId ? `PRESSURE: ${activePressureScenarioId}` : "NO ACTIVE CONTRACT"
              )}
            </span>
          </div>
          <div className="bg-black/80 px-4 py-2.5 rounded-xl border border-gray-900 leading-tight flex-1 md:flex-none">
            <span className="text-gray-500 block text-[9px] uppercase tracking-widest">Completed Contracts</span>
            <span className="text-emerald-400 font-extrabold block mt-0.5">
              {totalCompletedCount} SECURED
            </span>
          </div>
        </div>
      </div>

      {/* JOURNAL MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: RPG CATEGORY BOOK */}
        <div className="lg:col-span-4 bg-[#050505] border border-gray-900 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block px-2 pb-1 border-b border-gray-900 mb-3">
            MISSION DIRECTORIES
          </span>
          <div className="space-y-1">
            {categories.map((cat) => {
              const questsCount = getQuestsForCategory(cat.id).length;
              const IconComp = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => { playSystemClick(); setActiveCategory(cat.id); }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-left transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-950/20 to-black border-purple-500/50 text-white shadow-[0_0_10px_rgba(123,47,255,0.1)]"
                      : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4.5 h-4.5 transition-colors ${isSelected ? cat.color : "text-gray-500 group-hover:text-white"}`} />
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-wider leading-none">{cat.label}</span>
                      <span className="text-[9px] text-gray-500 font-sans mt-0.5 block leading-none">{cat.desc}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    questsCount > 0 
                      ? isSelected ? "bg-purple-950 text-purple-400 border border-purple-500/20" : "bg-gray-900 text-gray-400" 
                      : "bg-black/50 text-gray-700"
                  }`}>
                    {questsCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: QUESTS CARD SLATE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-900 pb-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <Sparkle className="w-4 h-4 animate-pulse" />
              {categories.find(c => c.id === activeCategory)?.label} ({activeCategoryQuests.length})
            </h2>
            
            {["CHAMBER", "EVOLUTION", "DUNGEON", "MASTERY"].includes(activeCategory) && (
              <button
                onClick={handleRerollRotation}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/20 border border-purple-500/25 hover:border-purple-500 text-[10px] text-purple-400 font-black tracking-wider cursor-pointer hover:bg-purple-950/40 transition-all uppercase"
                title="Reroll list from library"
              >
                <RefreshCw className="w-3 h-3" /> REROLL CONTRACTS
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {activeCategoryQuests.map((quest) => {
              // Determine if active (either pressure scenario or typical practice quest)
              const isPressure = !!(quest as any).isPressureScenario;
              const isActive = isPressure 
                ? (quest.id.replace("pressure-", "") === activePressureScenarioId)
                : (quest.id === activePracticeQuestId);

              const diffStyles = getDifficultyStyles(quest.difficulty);
              const arenaName = getArenaName(quest);
              const objectives = getObjectives(quest);

              const isCompleted = quest.completed;
              const progressPercentage = isCompleted ? 100 : isActive ? 45 : 0;

              return (
                <div
                  key={quest.id}
                  className={`border rounded-2xl bg-gradient-to-b ${diffStyles.glow} ${diffStyles.border} p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between`}
                >
                  {/* Decorative corner tag */}
                  <div className="absolute right-0 top-0 pointer-events-none w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent filter blur-md" />

                  <div className="space-y-4">
                    {/* TOP META BAR */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-900 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 border rounded uppercase ${diffStyles.badge}`}>
                          {quest.difficulty} TIER
                        </span>
                        <span className="text-[9px] bg-zinc-900/60 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-black uppercase">
                          {isPressure ? "PRESSURE TRIAL" : quest.type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-sans">
                        Target Skill: <span className="text-gray-300 font-mono font-black">{quest.skillName}</span>
                      </div>
                    </div>

                    {/* QUEST MAIN BODY */}
                    <div className="space-y-2">
                      <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                        {quest.name}
                        {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        {isActive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans leading-relaxed">
                        {quest.description}
                      </p>
                    </div>

                    {/* OBJECTIVES SECT */}
                    <div className="bg-black/40 border border-gray-900/50 rounded-xl p-3.5 space-y-2">
                      <span className="text-[9px] text-gray-500 font-black block uppercase tracking-wider">
                        MISSION OBJECTIVES Checklist:
                      </span>
                      <div className="space-y-1.5 font-sans">
                        {objectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs">
                            <span className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : isActive ? "bg-cyan-400" : "bg-gray-700"}`} />
                            <span className={isCompleted ? "text-gray-500 line-through" : "text-gray-300"}>
                              {obj}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* REWARDS GRID */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-green-950/50 border border-green-500/20 flex items-center justify-center text-green-400">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-500 uppercase block font-black leading-none">XP Reward</span>
                          <span className="text-xs font-black text-green-400 mt-1 block leading-none">+{quest.xpReward} Player XP</span>
                        </div>
                      </div>

                      <div className="bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-500 uppercase block font-black leading-none">Mastery Reward</span>
                          <span className="text-xs font-black text-purple-400 mt-1 block leading-none">+{quest.masteryReward} Mastery XP</span>
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-500 uppercase tracking-wider font-bold">CONTRACT INTEGRITY</span>
                        <span className={`font-black ${isCompleted ? "text-emerald-400" : isActive ? "text-cyan-400" : "text-gray-600"}`}>
                          {isCompleted ? "100% COMPLETE" : isActive ? "ACTIVE (45% SYNCED)" : "0% INTEGRATED"}
                        </span>
                      </div>
                      <div className="h-2 bg-black border border-gray-900 rounded-full overflow-hidden p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted 
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_6px_rgba(16,185,129,0.3)]" 
                              : isActive 
                              ? "bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.3)]" 
                              : "bg-transparent"
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTON */}
                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-900">
                    <span className="text-[10px] text-gray-500 uppercase font-sans">
                      Arena: <span className="text-gray-300 font-mono font-bold uppercase">{arenaName}</span>
                    </span>

                    <div className="flex gap-2">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-black text-[10px] tracking-widest uppercase bg-emerald-950/30 border border-emerald-500/25 px-4 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> CONTRACT SECURED
                        </span>
                      ) : isActive ? (
                        <button
                          onClick={() => { 
                            playPortalSwoosh(); 
                            onNavigateToTab(quest.type === "DUNGEON_MATCH" ? "DUNGEONS" : "EVOLUTION_CHAMBER"); 
                          }}
                          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono text-[10px] font-black tracking-widest px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1 uppercase transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                        >
                          GO TO MISSION <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { 
                            playSystemDing(); 
                            if (isPressure) {
                              if (onDeployPressureScenario) {
                                const originalScId = quest.id.replace("pressure-", "");
                                const scenarios = QuestDatabaseManager.getPressureScenarios();
                                const sc = scenarios.find(s => s.scenarioId === originalScId);
                                if (sc) onDeployPressureScenario(sc);
                              }
                            } else {
                              onActivatePracticeQuest(quest.id); 
                            }
                          }}
                          className="bg-zinc-900 hover:bg-purple-950/40 border border-zinc-800 hover:border-purple-500/50 text-gray-300 hover:text-white text-[10px] font-mono font-black tracking-widest px-4 py-2 rounded-lg uppercase cursor-pointer transition-all"
                        >
                          DEPLOY CONTRACT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {activeCategoryQuests.length === 0 && (
              <div className="py-24 text-center space-y-4 border border-dashed border-gray-900 rounded-2xl bg-black/20">
                <AlertCircle className="w-10 h-10 text-gray-800 mx-auto animate-pulse" />
                <div>
                  <span className="text-xs font-mono text-gray-500 block uppercase tracking-widest">LAYER FAULT: DIRECTORY EMPTY</span>
                  <p className="text-[11px] text-gray-600 max-w-xs mx-auto mt-1 font-sans leading-relaxed">
                    There are no contracts loaded on this layer. Progress other quests or unlock higher ranks to discover more entries.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
