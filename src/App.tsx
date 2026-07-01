import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  Compass,
  Cpu,
  Flame,
  History,
  Info,
  Layers,
  LineChart,
  ListTodo,
  Lock,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Sparkles,
  Swords,
  Trophy,
  User,
  Zap,
  Menu,
  X,
  Database,
  Settings,
} from "lucide-react";

import GlintingBackground from "./components/GlintingBackground";
import LoadingScreen from "./components/LoadingScreen";
import AnimatedPortal from "./components/AnimatedPortal";
import AttributesPanel from "./components/AttributesPanel";
import EvolutionChamber from "./components/EvolutionChamber";
import SkillInventory from "./components/SkillInventory";
import DungeonReport from "./components/DungeonReport";
import SystemDirectives from "./components/SystemDirectives";
import ChronicleLog from "./components/ChronicleLog";
import ForecastEngine from "./components/ForecastEngine";
import PlayerInformation from "./components/PlayerInformation";
import QuestDatabase from "./components/QuestDatabase";
import { QuestDatabaseManager } from "./utils/questDatabaseManager";
import { cloudSync, UnifiedProfile, SyncState } from "./utils/cloudSyncManager";
import { getSupabase } from "./utils/supabaseClient";
import CloudPortalAccess from "./components/CloudPortalAccess";
import PlayerAvatar from "./components/PlayerAvatar";
import appLogo from "./assets/images/app_logo_1782646701079.jpg";
import SettingsPage from "./components/SettingsPage";
import { SettingsManager, AppSettings, DEFAULT_SETTINGS, BACKGROUNDS, BUILT_IN_THEMES } from "./utils/settingsManager";
import { AttributeEngine } from "./utils/attributeEngine";

import {
  PlayerProfile,
  Attribute,
  SkillItem,
  SystemDirective,
  DungeonRecord,
  EvolutionLogEntry,
  AIAnalysisResponse,
  AscensionState,
  SkillRarity,
  PracticeQuest,
} from "./types";
import { getRankRequirements, RANK_REQUIREMENTS_LIST } from "./utils/rankRequirements";
import { getSkillTitle } from "./utils/skillTitles";
import { VolumeX, Volume2, Music, Trash2, RefreshCw } from "lucide-react";
import { evaluateQuestCompletion } from "./components/EvolutionChamber";
import { audioManager } from "./utils/audioManager";
import { generateHighlyVariedQuest, QuestHistoryTracker } from "./utils/questEngine";

export function getNextStatusOf(currentRank: string): string {
  switch (currentRank) {
    case "E-Rank": return "D-Rank";
    case "D-Rank": return "C-Rank";
    case "C-Rank": return "B-Rank";
    case "B-Rank": return "A-Rank";
    case "A-Rank": return "S-Rank";
    case "S-Rank": return "SS-Rank";
    case "SS-Rank": return "SSS-Rank";
    case "SSS-Rank": return "Shadow Monarch";
    case "Shadow Monarch": return "Frost Shadow Monarch";
    case "Frost Shadow Monarch": return "Iron Shadow Monarch";
    case "Iron Shadow Monarch": return "Feral Shadow Monarch";
    case "Feral Shadow Monarch": return "Plague Shadow Monarch";
    case "Plague Shadow Monarch": return "Flame Shadow Monarch";
    case "Flame Shadow Monarch": return "Abyssal Shadow Monarch";
    case "Abyssal Shadow Monarch": return "Absolute Shadow Monarch";
    default: return "Absolute Shadow Monarch";
  }
}

export function getAscensionRequirementsForNextRank(nextRank: string): { proposedTitle: string; challengeDescription: string; levelNeeded: number; controlNeeded: number } {
  const req = RANK_REQUIREMENTS_LIST.find((r) => r.nextRankName.toLowerCase() === nextRank.toLowerCase());
  if (req) {
    const ctrl = req.attributesNeeded.Control || req.attributesNeeded["Every Attribute"] || req.attributesNeeded["All Attributes"] || 10;
    return {
      proposedTitle: req.proposedTitle,
      challengeDescription: req.description,
      levelNeeded: req.levelNeeded,
      controlNeeded: ctrl
    };
  }
  // Try querying by direct rankName as fallback
  const directReq = getRankRequirements(nextRank);
  if (directReq) {
    const ctrl = directReq.attributesNeeded.Control || directReq.attributesNeeded["Every Attribute"] || directReq.attributesNeeded["All Attributes"] || 10;
    return {
      proposedTitle: directReq.proposedTitle,
      challengeDescription: directReq.description,
      levelNeeded: directReq.levelNeeded,
      controlNeeded: ctrl
    };
  }
  return {
    proposedTitle: "Absolute Supreme Overlord",
    challengeDescription: "Cosmological terminal limit. Maximize overall rotation variables to manifest absolute power.",
    levelNeeded: 200,
    controlNeeded: 100,
  };
}


// DEFAULT COGNITIVE GRID VALUES
const INITIAL_PLAYER: PlayerProfile = {
  name: "ROHITH RAJ",
  title: "E-Rank Rookie",
  level: 0,
  xp: 0,
  xpToNextLevel: 250,
  currentStatus: "E-Rank",
  nextStatus: "D-Rank",
  predictedDaysToNextStatus: 90,
  probabilityOfNextStatus: 5,
  efficiency: 15,
  
  // Lifetime counters
  lifetimePracticeQuests: 0,
  lifetimeEvolutionSessions: 0,
  lifetimeMatchDungeons: 0,
  lifetimePressureChambers: 0,
  lifetimeEvolutionTrials: 0,
  lifetimeSkillEvolutions: 0,
  lifetimeMatchVictories: 0,
  lifetimeDotBalls: 0,
  lifetimeWickets: 0,
  lifetimeDeliveriesBowled: 0,
  lifetimePerfectDeliveries: 0,
  lifetimeXpEarned: 0,
  lifetimeSkillXp: 0,
  lifetimePlayerXp: 0,
};

const INITIAL_ATTRIBUTES: Attribute[] = AttributeEngine.createInitialAttributes();

const INITIAL_SKILLS: SkillItem[] = [
  {
    id: "s1",
    name: "LEG BREAK",
    level: 0,
    mastery: 0,
    rarity: "COMMON",
    description: "The Foundation of All Destruction. Pure aerodynamic side-spin flight path that breaks wide away from the right-handed batsman threat vector.",
    evolutionRequirements: "Reach Level 15 player and 850 Kinetic Mastery",
    history: ["Holographic neural matrix initial sync successful"],
  },
  {
    id: "s2",
    name: "GOOGLY",
    level: 0,
    mastery: 0,
    rarity: "RARE",
    description: "The Unseen Traitor. Deceptive wrist spin sequence spinning sharply in towards the right-handed striker from the off-side drift line.",
    evolutionRequirements: "Complete Ascension Trial #1 and 650 Deception Mastery",
    history: ["Unlocked during initial spell sync code execution"],
  },
  {
    id: "s3",
    name: "TOP SPINNER",
    level: 0,
    mastery: 0,
    rarity: "COMMON",
    description: "Gravity's Gavel. Rapid over-spin execution producing dynamic velocity drop and sudden high-bouncing impact indicators off the wicket seam.",
    evolutionRequirements: "Perform 5 overs inside the chamber",
    history: ["Registered during first sandbox telemetry sync"],
  },
  {
    id: "s4",
    name: "SLIDER",
    level: 0,
    mastery: 0,
    rarity: "RARE",
    description: "The Stealth Bolt. Smooth, fast under-cut trajectory drifting downwards and fending off batsman reaction windows before they can establish target adjustments.",
    evolutionRequirements: "Conquer a B-Rank match dungeon as leading bowler",
    history: ["Identified as current limiter by system AI Core"],
  },
  {
    id: "s5",
    name: "FLIPPER",
    level: 0,
    mastery: 0,
    rarity: "EPIC",
    description: "The Monarch Bullet. Squeezed thumb release flying low, skidding fast through the batsman knee roll before execution vectors can deploy adjustments.",
    evolutionRequirements: "Synthesize +20 Core Arcane metrics",
    history: [],
  },
];

const INITIAL_DIRECTIVES: SystemDirective[] = [
  {
    id: "d1",
    category: "EVOLUTION",
    title: "Shadow Directive #34: Fix Length Control",
    description: "Land balls sequentially without dragging short to prevent batsman hook counters.",
    objective: "Track 30 balls in the Evolution Chamber with >50% efficiency",
    progress: 0,
    target: 30,
    reward: "+3 Control, +150 XP",
    completed: false,
  },
  {
    id: "d2",
    category: "ASCENSION",
    title: "Prepare For District Ascension Alpha",
    description: "Attain high-tier spin variety to unlock selection probability benchmarks.",
    objective: "Upgrade your Googly to 650 mastery inside the inventory menu",
    progress: 0,
    target: 650,
    reward: "+4 Deception, Rank Up Available",
    completed: false,
  },
  {
    id: "d3",
    category: "EMERGENCY",
    title: "Avoid Stagnant Status Threshold",
    description: "Correct your slider rotation axis. Strike rate has dropped over past match simulations.",
    objective: "Complete 1 complete 5-over Chamber sequence under full load",
    progress: 0,
    target: 1,
    reward: "+180 XP, +3.5% Arcane masteries",
    completed: false,
  },
];

export const INITIAL_PRACTICE_QUESTS: PracticeQuest[] = [
  {
    id: "pq1",
    skillId: "s1",
    skillName: "LEG BREAK",
    name: "Perfect Spin Spotting",
    description: "Bowl at least 5 Perfect Balls of LEG BREAK inside the Glacial Fortress Chamber to sync trajectory vectors.",
    difficulty: "EASY",
    xpReward: 150,
    masteryReward: 350,
    type: "CHAMBER_NET",
    requirements: {
      perfectBallsNeeded: 5,
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq2",
    skillId: "s2",
    skillName: "GOOGLY",
    name: "The Deceptive Trapper",
    description: "Deliver at least 12 balls of GOOGLY in the Underworld Shadow Arena with 8 or more Close or Perfect classifications.",
    difficulty: "MEDIUM",
    xpReward: 200,
    masteryReward: 405,
    type: "CHAMBER_NET",
    requirements: {
      closeOrBetterNeeded: 8,
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq3",
    skillId: "s4",
    skillName: "SLIDER",
    name: "Stealth Containment",
    description: "Bowl 2 overs in Match Simulation yielding less than 10 runs and recording at least 5 dot balls using SLIDER inside the Sovereign Obelisk Grid.",
    difficulty: "CHALLENGING",
    xpReward: 250,
    masteryReward: 500,
    type: "CHAMBER_MATCH_SIM",
    requirements: {
      oversMin: 2,
      runsMaxLte: 10,
      dotBallsNeeded: 5,
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq4",
    skillId: "s1",
    skillName: "LEG BREAK",
    name: "Dungeon Master Hunter",
    description: "Take at least 1 wicket and achieve dot balls in an actual Dungeon Match using LEG BREAK inside the Runic Colosseum.",
    difficulty: "CHALLENGING",
    xpReward: 300,
    masteryReward: 600,
    type: "DUNGEON_MATCH",
    requirements: {
      wicketsNeeded: 1,
      skillsSpecificWickets: { "LEG BREAK": 1 },
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq5",
    skillId: "s5",
    skillName: "FLIPPER",
    name: "Trinity Spin Eclipse",
    description: "Match Sim Master Plan: Bowl 5 overs. Secure 1 wicket with Googly, 1 wicket with Leg Break, and 1 wicket with Slider while bowling 10 dot balls inside the Nadir Abyss Core!",
    difficulty: "MONARCH",
    xpReward: 500,
    masteryReward: 800,
    type: "CHAMBER_MATCH_SIM",
    requirements: {
      oversMin: 5,
      dotBallsNeeded: 10,
      skillsSpecificWickets: { "GOOGLY": 1, "LEG BREAK": 1, "SLIDER": 1 }
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-daily-1",
    skillId: "s1",
    skillName: "LEG BREAK",
    name: "Daily Drift Calibration",
    description: "Daily quest: Bowl 2 overs with LEG BREAK and record at least 4 dot balls inside the Evolution Chamber Grid.",
    difficulty: "EASY",
    xpReward: 100,
    masteryReward: 200,
    type: "CHAMBER_NET",
    requirements: {
      oversMin: 2,
      dotBallsNeeded: 4
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-daily-2",
    skillId: "s2",
    skillName: "GOOGLY",
    name: "Daily Trap Verification",
    description: "Daily quest: Force batters into 6 faulty responses using GOOGLY in the Sovereign Obelisk Grid.",
    difficulty: "MEDIUM",
    xpReward: 120,
    masteryReward: 250,
    type: "CHAMBER_NET",
    requirements: {
      closeOrBetterNeeded: 6
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-weekly-1",
    skillId: "s4",
    skillName: "SLIDER",
    name: "Weekly Pressure Marathon",
    description: "Weekly quest: Restrict the opponent to less than 15 runs over a prolonged 4-over simulation in the Glacial Fortress Chamber.",
    difficulty: "CHALLENGING",
    xpReward: 400,
    masteryReward: 750,
    type: "CHAMBER_MATCH_SIM",
    requirements: {
      oversMin: 4,
      runsMaxLte: 15,
      dotBallsNeeded: 12
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-weekly-2",
    skillId: "s3",
    skillName: "TOP SPINNER",
    name: "Weekly Turf Dominance",
    description: "Weekly quest: Dominate local ranks with TOP SPINNER by securing 2 key wickets in a Match Dungeon inside the Nadir Abyss Core.",
    difficulty: "CHALLENGING",
    xpReward: 450,
    masteryReward: 800,
    type: "DUNGEON_MATCH",
    requirements: {
      wicketsNeeded: 2,
      skillsSpecificWickets: { "TOP SPINNER": 2 }
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-pressure-1",
    skillId: "s5",
    skillName: "FLIPPER",
    name: "High-Pressure Lockout",
    description: "Pressure Chamber trial: Bowl under intense pressure simulation, keeping runs conceded under 8 inside the Underworld Shadow Arena.",
    difficulty: "CHALLENGING",
    xpReward: 350,
    masteryReward: 650,
    type: "CHAMBER_MATCH_SIM",
    requirements: {
      oversMin: 2,
      runsMaxLte: 8,
      dotBallsNeeded: 8
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-pressure-2",
    skillId: "s1",
    skillName: "LEG BREAK",
    name: "Death-Over Deflection",
    description: "Pressure Chamber Trial: Deflect batsman strikes with high speed LEG BREAK during death overs, securing 3 dot balls and conceding 0 extras in the Celestial Void Pitch.",
    difficulty: "MONARCH",
    xpReward: 600,
    masteryReward: 950,
    type: "DUNGEON_MATCH",
    requirements: {
      oversMin: 1,
      dotBallsNeeded: 3,
      noWidesOrNoBalls: true
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-mastery-1",
    skillId: "s2",
    skillName: "GOOGLY",
    name: "Sovereign Googly Mastery",
    description: "Skill Mastery Quest: Demonstrate supreme wrist angle, landing 6 consecutive perfect GOOGLY deliveries in the Celestial Void Pitch.",
    difficulty: "CHALLENGING",
    xpReward: 300,
    masteryReward: 700,
    type: "CHAMBER_NET",
    requirements: {
      perfectBallsNeeded: 6
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-mastery-2",
    skillId: "s4",
    skillName: "SLIDER",
    name: "Absolute Slider Mastery",
    description: "Skill Mastery Quest: Restrict the best division batsman to 0 runs in a single over using pure SLIDER inside the Monarch Training Sanctum.",
    difficulty: "CHALLENGING",
    xpReward: 320,
    masteryReward: 720,
    type: "CHAMBER_MATCH_SIM",
    requirements: {
      oversMin: 1,
      runsMaxLte: 0
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-trial-1",
    skillId: "s5",
    skillName: "FLIPPER",
    name: "Grand Evolution Trial",
    description: "Evolution Trial: Unleash Flipper's maximum kinetic acceleration. Achieve 1 wicket, 8 perfect balls, and 0 extras inside the Monarch Training Sanctum.",
    difficulty: "MONARCH",
    xpReward: 700,
    masteryReward: 1000,
    type: "CHAMBER_MATCH_SIM",
    requirements: {
      perfectBallsNeeded: 8,
      wicketsNeeded: 1,
      noWidesOrNoBalls: true
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-trial-2",
    skillId: "s3",
    skillName: "TOP SPINNER",
    name: "Apex Monarch Ascension",
    description: "Evolution Trial: Secure 3 quick wickets and concede less than 12 runs in a high intensity match using TOP SPINNER in the Nadir Abyss Core.",
    difficulty: "MONARCH",
    xpReward: 750,
    masteryReward: 1200,
    type: "DUNGEON_MATCH",
    requirements: {
      wicketsNeeded: 3,
      runsMaxLte: 12
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-chamber-1",
    skillId: "s3",
    skillName: "TOP SPINNER",
    name: "High Bounce Foundation",
    description: "Chamber Training: Calibrate bounce indices by landing 4 balls with steep dip in the Celestial Void Pitch.",
    difficulty: "EASY",
    xpReward: 140,
    masteryReward: 300,
    type: "CHAMBER_NET",
    requirements: {
      closeOrBetterNeeded: 4
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
  {
    id: "pq-chamber-2",
    skillId: "s1",
    skillName: "LEG BREAK",
    name: "Good Length Consistency",
    description: "Chamber Training: Maintain tight consistency, landing 8 deliveries on a good length using LEG BREAK in the Glacial Fortress Chamber.",
    difficulty: "MEDIUM",
    xpReward: 180,
    masteryReward: 380,
    type: "CHAMBER_NET",
    requirements: {
      closeOrBetterNeeded: 8
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
  },
];

export function generateDynamicQuest(
  skillId: string,
  skillName: string,
  difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH",
  tracker?: QuestHistoryTracker,
  skillBehavior?: any,
  playerLevel: number = 1
): PracticeQuest {
  const defaultBehavior = skillBehavior || {
    name: skillName,
    spinDirection: skillName === "LEG BREAK" ? "Leg Spin" : skillName === "GOOGLY" ? "Off Spin" : "Straight",
    primaryBehavior: skillName === "TOP SPINNER" ? "Bounce" : skillName === "SLIDER" ? "Drift" : "Turn"
  };

  const defaultTracker = tracker || {
    completedQuestIds: [],
    failedQuestIds: [],
    recentlyGeneratedIds: [],
    activeQuestId: null
  };

  const pool = loadAllQuestsCombined();
  const quest = generateHighlyVariedQuest(defaultBehavior, difficulty, defaultTracker, playerLevel, pool);
  quest.skillId = skillId;
  return quest;
}

export function loadAllQuestsCombined(): PracticeQuest[] {
  try {
    const saved = localStorage.getItem("monarch_practice_quests_v10");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  const dbQuests = QuestDatabaseManager.getQuests();
  return dbQuests.filter(q => q.status && q.status !== "LOCKED") as PracticeQuest[];
}


const INITIAL_DUNGEONS: DungeonRecord[] = [];

const INITIAL_LOGS: EvolutionLogEntry[] = [
  { id: "l1", timestamp: "10:15", date: "2026-06-02", title: "Monarch Core Initialized", description: "Holographic operating system synthesized for Rohith Raj.", severity: "epic", category: "system" },
  { id: "l2", timestamp: "11:32", date: "2026-06-02", title: "Level 12 Threshold Synchronized", description: "Successfully registered as active club-division shadow spinner.", severity: "success", category: "quest" },
  { id: "l3", timestamp: "14:22", date: "2026-06-02", title: "Slider Trajectory Alert", description: "AI detected inconsistent wrist alignment at release. Under-spin detected.", severity: "warning", category: "warning" },
];

export default function App() {
  // WIPE PREVIOUS STORAGE ONCE TO SECURE ABSOLUTE RESET TO LEVEL 0
  if (!localStorage.getItem("monarch_system_reset_v10")) {
    localStorage.clear();
    localStorage.setItem("monarch_system_reset_v10", "true");
  }

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showStartupLoader, setShowStartupLoader] = useState<boolean>(false);
  const [internalLoader, setInternalLoader] = useState<{
    isVisible: boolean;
    durationMs: number;
    title: string;
    messages: string[];
    onComplete?: () => void;
  }>({
    isVisible: false,
    durationMs: 2500,
    title: "",
    messages: [],
  });

  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncMessage, setSyncMessage] = useState<string>("Initializing Shadow Systems...");
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== "undefined" ? navigator.onLine : true);

  const [isGuest, setIsGuest] = useState<boolean>(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    return SettingsManager.loadSettings();
  });

  // Online/Offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLogs((prev) => [
        {
          id: `lg-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: "CONNECTION RESTORED",
          description: "Reconnected to Monarch Cloud Network. Background cloud synchronization activated.",
          severity: "success",
          category: "system"
        },
        ...prev
      ]);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLogs((prev) => [
        {
          id: `lg-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: "CONNECTION LOST",
          description: "Operating in Offline Mode. Full offline gameplay is active.",
          severity: "warning",
          category: "system"
        },
        ...prev
      ]);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Wallpaper startup randomizer
  useEffect(() => {
    const loadedSettings = SettingsManager.loadSettings();
    if (loadedSettings.randomWallpaperMode === "launch") {
      const customWps = loadedSettings.customWallpapers || [];
      const totalOptions = BACKGROUNDS.length + customWps.length;
      if (totalOptions > 0) {
        const randomIndex = Math.floor(Math.random() * totalOptions);
        if (randomIndex < BACKGROUNDS.length) {
          const chosenBg = BACKGROUNDS[randomIndex];
          setSettings(prev => ({
            ...prev,
            activeCustomWallpaperId: null,
            background: {
              ...prev.background,
              selectedId: chosenBg.id
            }
          }));
        } else {
          const chosenWp = customWps[randomIndex - BACKGROUNDS.length];
          setSettings(prev => ({
            ...prev,
            activeCustomWallpaperId: chosenWp.id
          }));
        }
      }
    }
  }, []);

  // Dynamic CSS variables and Class overrides injector
  useEffect(() => {
    SettingsManager.saveSettings(settings);

    // Apply audio volumes immediately
    if (settings.sound) {
      audioManager.setMasterVolume(settings.sound.master);
      audioManager.setMusicVolume(settings.sound.music);
      audioManager.setEffectsVolume(settings.sound.buttons);
    }

    const theme = SettingsManager.getTheme(settings);
    const primaryRgb = SettingsManager.hexToRgb(theme.primary);
    const secondaryRgb = SettingsManager.hexToRgb(theme.secondary);
    const accentRgb = SettingsManager.hexToRgb(theme.accent);
    const glowRgb = SettingsManager.hexToRgb(theme.glow);

    // Get style sheet element or create it
    let styleSheet = document.getElementById("monarch-dynamic-styles-sheet") as HTMLStyleElement;
    if (!styleSheet) {
      styleSheet = document.createElement("style");
      styleSheet.id = "monarch-dynamic-styles-sheet";
      document.head.appendChild(styleSheet);
    }

    // Compose custom CSS variables and class overrides
    const cssContent = `
      :root {
        --primary-color: ${theme.primary};
        --primary-rgb: ${primaryRgb};
        --secondary-color: ${theme.secondary};
        --secondary-rgb: ${secondaryRgb};
        --accent-color: ${theme.accent};
        --accent-rgb: ${accentRgb};
        --glow-color: ${theme.glow};
        --glow-rgb: ${glowRgb};
        --bg-start: ${theme.bgStart};
        --bg-end: ${theme.bgEnd};
        --card-bg: ${theme.cardBg};
        --border-custom: ${theme.border};
        --text-highlight: ${theme.textHighlight};

        --ui-scale: ${settings.appearance.uiScale};
        --animation-speed: ${settings.appearance.animationSpeed}s;
        --glow-intensity: ${settings.appearance.glowIntensity};
        --border-brightness: ${settings.appearance.borderBrightness};
        --transparency: ${settings.appearance.transparency};
        --card-roundness: ${settings.appearance.cardRoundness}px;
      }

      /* Core application body background dynamic wave overrides */
      body, html {
        background: linear-gradient(135deg, var(--bg-start), var(--bg-end)) !important;
        font-size: calc(100% * var(--ui-scale)) !important;
      }

      /* Standard element spacing modes (Compact vs Comfortable) */
      ${settings.appearance.compactMode ? `
        .p-6 { padding: 0.85rem !important; }
        .p-5 { padding: 0.75rem !important; }
        .p-4 { padding: 0.6rem !important; }
        .py-6 { padding-top: 0.85rem !important; padding-bottom: 0.85rem !important; }
        .gap-6 { gap: 0.75rem !important; }
        .gap-4 { gap: 0.5rem !important; }
        .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem !important; }
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem !important; }
      ` : ""}

      ${settings.appearance.comfortableMode ? `
        .p-6 { padding: 2rem !important; }
        .p-5 { padding: 1.75rem !important; }
        .p-4 { padding: 1.5rem !important; }
        .gap-6 { gap: 2rem !important; }
        .gap-4 { gap: 1.5rem !important; }
        .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem !important; }
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem !important; }
      ` : ""}

      /* Overriding colors for hardcoded purple/cyan text and backgrounds */
      .text-\[\#7B2FFF\] { color: var(--primary-color) !important; }
      .bg-\[\#7B2FFF\] { background-color: var(--primary-color) !important; }
      .border-\[\#7B2FFF\]\/30 { border-color: rgba(var(--primary-rgb), calc(0.3 * var(--border-brightness))) !important; }
      .border-\[\#7B2FFF\]\/45 { border-color: rgba(var(--primary-rgb), calc(0.45 * var(--border-brightness))) !important; }
      .bg-\[\#7B2FFF\]\/10 { background-color: rgba(var(--primary-rgb), 0.1) !important; }
      .bg-\[\#7B2FFF\]\/30 { background-color: rgba(var(--primary-rgb), 0.3) !important; }

      .text-\[\#00D9FF\] { color: var(--secondary-color) !important; }
      .bg-\[\#00D9FF\] { background-color: var(--secondary-color) !important; }
      .bg-\[\#00D9FF\]\/10 { background-color: rgba(var(--secondary-rgb), 0.1) !important; }

      /* Buttons & interactive gradient states */
      .bg-gradient-to-r.from-\[\#7B2FFF\].to-\[\#00D9FF\] {
        background-image: linear-gradient(to right, var(--primary-color), var(--secondary-color)) !important;
      }
      .hover\:from-\[\#7B2FFF\]:hover {
        --tw-gradient-from: var(--primary-color) !important;
      }

      /* Overriding specific standard tailwind colors */
      .text-purple-400, .text-purple-500, .text-violet-400 { color: var(--primary-color) !important; }
      .text-cyan-400, .text-cyan-300 { color: var(--secondary-color) !important; }
      .bg-purple-950\/20, .bg-purple-950\/30, .bg-purple-950\/40, .bg-purple-950\/60, .bg-purple-900\/20 {
        background-color: rgba(var(--primary-rgb), 0.12) !important;
      }
      .bg-cyan-950\/20, .bg-cyan-950\/30, .bg-cyan-950\/40 {
        background-color: rgba(var(--secondary-rgb), 0.12) !important;
      }
      .border-purple-500\/35, .border-purple-500\/20, .border-purple-500\/30, .border-purple-500\/40, .border-purple-500\/50, .border-purple-400\/30 {
        border-color: rgba(var(--primary-rgb), calc(0.35 * var(--border-brightness))) !important;
      }
      .border-cyan-500\/30, .border-cyan-500\/20, .border-cyan-500\/40, .border-cyan-500\/50 {
        border-color: rgba(var(--secondary-rgb), calc(0.35 * var(--border-brightness))) !important;
      }

      /* Glow borders and elements overrides */
      .cyan-glow-border {
        border-color: rgba(var(--secondary-rgb), calc(0.25 * var(--border-brightness))) !important;
        box-shadow: 0 0 calc(15px * var(--glow-intensity)) rgba(var(--secondary-rgb), calc(0.08 * var(--glow-intensity))) !important;
      }
      .purple-glow-border {
        border-color: rgba(var(--primary-rgb), calc(0.25 * var(--border-brightness))) !important;
        box-shadow: 0 0 calc(15px * var(--glow-intensity)) rgba(var(--primary-rgb), calc(0.08 * var(--glow-intensity))) !important;
      }

      /* Shadows dynamic scaling */
      .shadow-\[0_0_50px_rgba\(123\,47\,255\,0\.25\)\] {
        box-shadow: 0 0 calc(50px * var(--glow-intensity)) rgba(var(--primary-rgb), calc(0.25 * var(--glow-intensity))) !important;
      }
      .shadow-\[0_0_60px_rgba\(123\,47\,255\,0\.35\)\] {
        box-shadow: 0 0 calc(60px * var(--glow-intensity)) rgba(var(--primary-rgb), calc(0.35 * var(--glow-intensity))) !important;
      }
      .shadow-\[0_4px_22px_rgba\(123\,47\,255\,0\.45\)\] {
        box-shadow: 0 4px calc(22px * var(--glow-intensity)) rgba(var(--primary-rgb), calc(0.45 * var(--glow-intensity))) !important;
      }
      .shadow-\[0_0_20px_rgba\(0\,217\,255\,0\.25\)\] {
        box-shadow: 0 0 calc(20px * var(--glow-intensity)) rgba(var(--secondary-rgb), calc(0.25 * var(--glow-intensity))) !important;
      }

      /* Glassmorphism elements customization */
      .bg-\[\#0a0a0a\]\/90, .bg-\[\#050505\]\/80, .bg-\[\#050505\]\/90, .bg-\[\#06060c\]\/98, .bg-\[\#090910\] {
        background-color: rgba(var(--primary-rgb), 0.04) !important;
        backdrop-filter: blur(calc(12px * var(--transparency))) !important;
        border-radius: var(--card-roundness) !important;
      }

      /* Roundness propagation */
      .rounded-xl { border-radius: calc(var(--card-roundness) * 0.75) !important; }
      .rounded-2xl { border-radius: var(--card-roundness) !important; }
      .rounded-3xl { border-radius: calc(var(--card-roundness) * 1.5) !important; }

      /* Animation speed transitions */
      .transition-all, .transition-colors, .transition-opacity, .transition-transform {
        transition-duration: calc(300ms * var(--animation-speed)) !important;
      }

      /* Disable glows completely if configured in effects */
      ${!settings.uiEffects.glowAnimations ? `
        * {
          box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
        }
      ` : ""}
    `;
    styleSheet.innerHTML = cssContent;
  }, [settings]);

  const [activeTab, setActiveTab] = useState<string>("DASHBOARD");
  const handleTabSwitch = (targetTabId: string) => {
    if (targetTabId === activeTab) return;

    const tabLoaders: Record<string, { title: string; messages: string[] }> = {
      DASHBOARD: {
        title: "Loading Sovereign Dashboard...",
        messages: [
          "Connecting to Monarch Core...",
          "Synchronizing Character Status...",
          "Updating Aura Level Coefficients...",
          "Aura Core Ready..."
        ]
      },
      EVOLUTION_CHAMBER: {
        title: "Entering Evolution Chamber...",
        messages: [
          "Building Chamber Environment...",
          "Loading Ball Physics...",
          "Generating Targets...",
          "Initializing Spinner Calibration...",
          "Synchronizing Evolution Data...",
          "Loading Chamber Simulation...",
          "Preparing Training Session...",
          "Calibrating Accuracy Grid...",
          "Deploying Spinner Protocol...",
          "Chamber Ready..."
        ]
      },
      SPELLBOOK: {
        title: "Decrypting Skill Instances...",
        messages: [
          "Accessing Runic Spellbook Database...",
          "Decoding Spin Trajectory Formulae...",
          "Loading Kinetic Vector Blueprints...",
          "Skills Database Online..."
        ]
      },
      DUNGEONS: {
        title: "Entering Match Dungeons...",
        messages: [
          "Opening Gateways to Active Colosseums...",
          "Scanning Batter Threat Indices...",
          "Formulating Match Containment Plans...",
          "Dungeons Gateways Aligned..."
        ]
      },
      DIRECTIVES: {
        title: "Loading Quests & Directives...",
        messages: [
          "Polling Daily Spin Missions...",
          "Fetching Weekly Bounty Records...",
          "Calculating Ascension Quest Targets...",
          "Directives Center Ready..."
        ]
      },
      QUEST_DATABASE: {
        title: "Accessing Quest Library...",
        messages: [
          "Establishing Neural Link to Archives...",
          "Loading 500 Practice Drills...",
          "Parsing Difficulty Requirements...",
          "Quest Database Decoded..."
        ]
      },
      CHRONICLES: {
        title: "Loading Evolution Chronicles...",
        messages: [
          "Retrieving Historical Delivery Records...",
          "Parsing Session Efficiency Loggers...",
          "Compiling Career Stat Coefficients...",
          "Chronicles Compiled..."
        ]
      },
      FORECAST: {
        title: "Powering Up Probability Engine...",
        messages: [
          "Simulating 10,000 Rotation Trajectories...",
          "Calculating Boundary Concession Risks...",
          "Synthesizing Future Outcome Projections...",
          "Probability Vectors Converged..."
        ]
      },
      AI_CORE: {
        title: "Connecting to Information Nexus...",
        messages: [
          "Accessing System Help Documentation...",
          "Translating Kinetic Rules Manual...",
          "Retrieving Spinner Lore Indexes...",
          "Nexus Sync Complete..."
        ]
      },
      ASCENSION: {
        title: "Opening Ascension Chamber...",
        messages: [
          "Verifying Player Progression Ranks...",
          "Evaluating Quest Requirement Matrices...",
          "Opening Sovereign Ascension Gate...",
          "Ascension Gate Ready..."
        ]
      },
      SETTINGS: {
        title: "Loading Settings & Calibration...",
        messages: [
          "Calibrating System Volume Decibels...",
          "Polling Local Storage State Databases...",
          "Aligning Profile Render Overlays...",
          "Calibration Complete..."
        ]
      }
    };

    const loaderData = tabLoaders[targetTabId] || {
      title: `Accessing ${targetTabId} console...`,
      messages: ["Accessing core pathways...", "Stabilizing render frames...", "Console linked..."]
    };

    setInternalLoader({
      isVisible: true,
      durationMs: 3000,
      title: loaderData.title,
      messages: loaderData.messages,
      onComplete: () => {
        setActiveTab(targetTabId);
        setInternalLoader(p => ({ ...p, isVisible: false }));
      }
    });
  };

  const handleTriggerSectionLoader = (title: string, messages: string[], onComplete: () => void) => {
    onComplete();
  };
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [audioState, setAudioState] = useState(() => audioManager.getSettings());

  const handleSetMasterVolume = (val: number) => {
    audioManager.setMasterVolume(val);
    setAudioState(audioManager.getSettings());
  };

  const handleSetMusicVolume = (val: number) => {
    audioManager.setMusicVolume(val);
    setAudioState(audioManager.getSettings());
  };

  const handleSetEffectsVolume = (val: number) => {
    audioManager.setEffectsVolume(val);
    setAudioState(audioManager.getSettings());
  };

  const handleToggleMute = () => {
    audioManager.toggleMute();
    setAudioState(audioManager.getSettings());
  };

  // STATE VARIABLES
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem("monarch_player_v10");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Cleanse old regional titles if detected
        if (!parsed.currentStatus || parsed.currentStatus.includes("Spinner") || parsed.currentStatus.includes("Rookie")) {
          let currentStatus = "E-Rank";
          let nextStatus = "D-Rank";
          if (parsed.level >= 90) {
            currentStatus = "SSS-Rank";
            nextStatus = "Shadow Monarch";
          } else if (parsed.level >= 70) {
            currentStatus = "SS-Rank";
            nextStatus = "SSS-Rank";
          } else if (parsed.level >= 50) {
            currentStatus = "S-Rank";
            nextStatus = "SS-Rank";
          } else if (parsed.level >= 35) {
            currentStatus = "A-Rank";
            nextStatus = "S-Rank";
          } else if (parsed.level >= 22) {
            currentStatus = "B-Rank";
            nextStatus = "A-Rank";
          } else if (parsed.level >= 12) {
            currentStatus = "C-Rank";
            nextStatus = "B-Rank";
          } else if (parsed.level >= 5) {
            currentStatus = "D-Rank";
            nextStatus = "C-Rank";
          }
          parsed.currentStatus = currentStatus;
          parsed.nextStatus = nextStatus;
        }
        return { ...INITIAL_PLAYER, ...parsed };
      } catch (e) {
        return INITIAL_PLAYER;
      }
    }
    return INITIAL_PLAYER;
  });

  const [attributes, setAttributes] = useState<Attribute[]>(() => {
    const saved = localStorage.getItem("monarch_attributes_v10");
    return saved ? AttributeEngine.ensureCompleteAttributes(JSON.parse(saved)) : INITIAL_ATTRIBUTES;
  });

  const [skills, setSkills] = useState<SkillItem[]>(() => {
    const saved = localStorage.getItem("monarch_skills_v10");
    return saved ? JSON.parse(saved) : INITIAL_SKILLS;
  });

  const [directives, setDirectives] = useState<SystemDirective[]>(() => {
    const saved = localStorage.getItem("monarch_directives_v10");
    return saved ? JSON.parse(saved) : INITIAL_DIRECTIVES;
  });

  const [dungeons, setDungeons] = useState<DungeonRecord[]>(() => {
    const saved = localStorage.getItem("monarch_dungeons_v10");
    return saved ? JSON.parse(saved) : INITIAL_DUNGEONS;
  });

  const [logs, setLogs] = useState<EvolutionLogEntry[]>(() => {
    const saved = localStorage.getItem("monarch_logs_v10");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [evolutionHistory, setEvolutionHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("monarch_evolution_history_v5");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI-driven analysis models
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(() => {
    const saved = localStorage.getItem("monarch_ai_analysis_v10");
    return saved ? JSON.parse(saved) : null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluatingDungeon, setIsEvaluatingDungeon] = useState(false);
  const [activeAuraEffect, setActiveAuraEffect] = useState("Vibrant Cyan Shockwaves");

  // Active Quest Focus ID link
  const [activeQuestId, setActiveQuestId] = useState<string | null>(() => {
    return localStorage.getItem("monarch_active_quest_v10") || "d1";
  });

  // Practice Quests states
  const [practiceQuests, setPracticeQuests] = useState<PracticeQuest[]>(() => {
    return loadAllQuestsCombined();
  });

  const [activePracticeQuestId, setActivePracticeQuestId] = useState<string | null>(() => {
    return localStorage.getItem("monarch_active_practice_quest_id_v10") || null;
  });

  const [activePressureScenarioId, setActivePressureScenarioId] = useState<string | null>(null);
  const [activePressureScenario, setActivePressureScenario] = useState<any | null>(null);

  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("monarch_completed_quest_ids_v10");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wallpaper reactive randomizer for player level and rank up
  useEffect(() => {
    if (!player) return;
    
    const loadedSettings = SettingsManager.loadSettings();
    const mode = loadedSettings.randomWallpaperMode;
    if (mode === "level" || mode === "rank") {
      const customWps = loadedSettings.customWallpapers || [];
      const totalOptions = BACKGROUNDS.length + customWps.length;
      if (totalOptions > 0) {
        const randomIndex = Math.floor(Math.random() * totalOptions);
        if (randomIndex < BACKGROUNDS.length) {
          const chosenBg = BACKGROUNDS[randomIndex];
          setSettings(prev => ({
            ...prev,
            activeCustomWallpaperId: null,
            background: {
              ...prev.background,
              selectedId: chosenBg.id
            }
          }));
        } else {
          const chosenWp = customWps[randomIndex - BACKGROUNDS.length];
          setSettings(prev => ({
            ...prev,
            activeCustomWallpaperId: chosenWp.id
          }));
        }
      }
    }
  }, [player.level, player.currentStatus]);

  const [failedQuestIds, setFailedQuestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("monarch_failed_quest_ids_v10");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyGeneratedIds, setRecentlyGeneratedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("monarch_recently_generated_quest_ids_v10");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Secret Quest states
  const [secretQuestActive, setSecretQuestActive] = useState(false);

  // Ascension states
  const [ascensionState, setAscensionState] = useState<AscensionState>(() => {
    const ControlVal = INITIAL_ATTRIBUTES.find(a => a.name === "Control")?.value || 0;
    return {
      available: INITIAL_PLAYER.level >= 15 || ControlVal >= 750,
      currentTitleRequirement: "The Rookie Spinner",
      nextTitleProposed: "The District Phantom",
      attemptsLeft: 3,
      challengeDescription: "Surpass the physical envelope of traditional rotation. Log a battle with 0 boundaries conceded or upgrade leg break to Level 15 to gain state-level status registration.",
      completed: false,
      failed: false,
    };
  });

  // SETUP CLOUD PERSISTENCE REGULAR INTERFACE BOUNDS
  useEffect(() => {
    cloudSync.registerStateUpdater((profile: UnifiedProfile) => {
      if (profile.player) setPlayer(profile.player);
      if (profile.attributes) setAttributes(AttributeEngine.ensureCompleteAttributes(profile.attributes));
      if (profile.skills) setSkills(profile.skills);
      if (profile.directives) setDirectives(profile.directives);
      if (profile.dungeons) setDungeons(profile.dungeons);
      if (profile.logs) setLogs(profile.logs);
      if (profile.aiAnalysis !== undefined) setAiAnalysis(profile.aiAnalysis);
      if (profile.settings) setSettings(profile.settings);
      if (profile.activeQuestId !== undefined) setActiveQuestId(profile.activeQuestId);
      if (profile.practiceQuests) setPracticeQuests(profile.practiceQuests);
      if (profile.activePracticeQuestId !== undefined) setActivePracticeQuestId(profile.activePracticeQuestId);
      if (profile.completedQuestIds) setCompletedQuestIds(profile.completedQuestIds);
      if (profile.failedQuestIds) setFailedQuestIds(profile.failedQuestIds);
      if (profile.recentlyGeneratedQuestIds) setRecentlyGeneratedIds(profile.recentlyGeneratedQuestIds);
      if (profile.evolutionHistory) setEvolutionHistory(profile.evolutionHistory);
    });

    cloudSync.registerSyncStateListener((state: SyncState, msg?: string) => {
      setSyncState(state);
      if (msg) {
        setSyncMessage(msg);
      }
    });

    const applyAuthSession = (session: any) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setIsGuest(false);
        localStorage.setItem("monarch_logged_v10", "true");
        localStorage.setItem("monarch_is_guest_v10", "false");
        return true;
      }

      setIsLoggedIn(false);
      setIsGuest(false);
      localStorage.setItem("monarch_logged_v10", "false");
      localStorage.setItem("monarch_is_guest_v10", "false");
      return false;
    };

    const initializeAppAndSession = async () => {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (applyAuthSession(session)) {
            console.log("Active Supabase session recovered silently on app launch!");
            cloudSync.triggerInitialSync();
            return;
          }
        } catch (e) {
          console.error("Silent session restoration failed:", e);
        }
      }
      
      // On fresh app launch / cold launch, if no active Google/Supabase session exists,
      // we ALWAYS require explicit login / guest mode selection.
      applyAuthSession(null);
    };

    initializeAppAndSession();

    const supabase = getSupabase();
    const { data: { subscription } = { subscription: null } } = supabase
      ? supabase.auth.onAuthStateChange((event: string, session: any) => {
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
            if (applyAuthSession(session)) {
              cloudSync.triggerInitialSync();
            }
          } else if (event === "SIGNED_OUT") {
            applyAuthSession(null);
          }
        })
      : { data: { subscription: null } };

    // Launch sequence timing control (6.0s splash -> loading screen / login portal)
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      // Only show startup loader if we actually recovered a session
      const hasSession = localStorage.getItem("monarch_logged_v10") === "true";
      setShowStartupLoader(hasSession);
    }, 6000);

    return () => {
      clearTimeout(splashTimer);
      subscription?.unsubscribe();
    };
  }, []);

  // Synchronize Quest Database with cloud storage on app mount
  useEffect(() => {
    const syncQuestsOnLaunch = async () => {
      try {
        const success = await QuestDatabaseManager.fetchFromCloud();
        if (success) {
          console.log("Quests database successfully synchronized from cloud storage on launch!");
          setPracticeQuests(loadAllQuestsCombined());
        }
      } catch (err) {
        console.warn("Failed to sync quests from cloud on startup:", err);
      }
    };
    syncQuestsOnLaunch();
  }, []);

  // PERSIST STATE RECURRING
  useEffect(() => {
    localStorage.setItem("monarch_active_quest_v10", activeQuestId || "");
    localStorage.setItem("monarch_practice_quests_v10", JSON.stringify(practiceQuests));
    if (activePracticeQuestId) {
      localStorage.setItem("monarch_active_practice_quest_id_v10", activePracticeQuestId);
    } else {
      localStorage.removeItem("monarch_active_practice_quest_id_v10");
    }

    localStorage.setItem("monarch_logged_v10", isLoggedIn.toString());
    localStorage.setItem("monarch_is_guest_v10", isGuest.toString());
    localStorage.setItem("monarch_player_v10", JSON.stringify(player));
    localStorage.setItem("monarch_attributes_v10", JSON.stringify(attributes));
    localStorage.setItem("monarch_skills_v10", JSON.stringify(skills));
    localStorage.setItem("monarch_directives_v10", JSON.stringify(directives));
    localStorage.setItem("monarch_dungeons_v10", JSON.stringify(dungeons));
    localStorage.setItem("monarch_logs_v10", JSON.stringify(logs));
    localStorage.setItem("monarch_evolution_history_v5", JSON.stringify(evolutionHistory));
    localStorage.setItem("monarch_completed_quest_ids_v10", JSON.stringify(completedQuestIds));
    localStorage.setItem("monarch_failed_quest_ids_v10", JSON.stringify(failedQuestIds));
    localStorage.setItem("monarch_recently_generated_quest_ids_v10", JSON.stringify(recentlyGeneratedIds));
    if (aiAnalysis) {
      localStorage.setItem("monarch_ai_analysis_v10", JSON.stringify(aiAnalysis));
    }

    if (isLoggedIn && !isGuest) {
      cloudSync.queueCloudSync({
        player,
        attributes,
        skills,
        directives,
        dungeons,
        logs,
        aiAnalysis,
        settings,
        activeQuestId,
        practiceQuests,
        activePracticeQuestId,
        completedQuestIds,
        failedQuestIds,
        recentlyGeneratedQuestIds: recentlyGeneratedIds,
        evolutionHistory
      });
    }
  }, [isLoggedIn, isGuest, player, attributes, skills, directives, dungeons, logs, aiAnalysis, settings, practiceQuests, activePracticeQuestId, completedQuestIds, failedQuestIds, recentlyGeneratedIds, evolutionHistory]);

  // Sync the Ambient drone with player rank + level variations
  useEffect(() => {
    if (isLoggedIn) {
      audioManager.init();
      audioManager.updateAmbientMetrics(player.currentStatus, player.level);
    } else {
      audioManager.stopAmbientEngine();
    }
  }, [isLoggedIn, player.currentStatus, player.level]);

  // Play refined futuristic transition tones when switching tabs
  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === "EVOLUTION_CHAMBER") {
        audioManager.playEvolutionOpen();
      } else if (activeTab === "DASHBOARD") {
        audioManager.playGoDashboard();
      } else {
        audioManager.playTabOpen(activeTab);
      }
    }
  }, [isLoggedIn, activeTab]);

  // LOGIN FLOW INITIATION
  const handleEnterSystem = () => {
    audioManager.init();
    audioManager.playQuestLegendaryUnlocked();
    setIsLoggedIn(true);
    // Add audio or system logging context
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: "SYSTEM LOG-IN GRANTED",
        description: "Rohith Raj profile loaded into predictive holographic framework. Telemetry diagnostic online.",
        severity: "success",
      },
      ...prev,
    ]);
  };

  const handleEnterGuestMode = () => {
    audioManager.init();
    audioManager.playQuestLegendaryUnlocked();
    setIsGuest(true);
    
    // reset all state variables to guest values
    setPlayer({
      name: "GUEST SPINNER",
      title: "Holographic Guest",
      level: 1,
      xp: 0,
      xpToNextLevel: 250,
      currentStatus: "E-Rank",
      nextStatus: "D-Rank",
      predictedDaysToNextStatus: 90,
      probabilityOfNextStatus: 10,
      efficiency: 45,
      lifetimePracticeQuests: 0,
      lifetimeEvolutionSessions: 0,
      lifetimeMatchDungeons: 0,
      lifetimePressureChambers: 0,
      lifetimeEvolutionTrials: 0,
      lifetimeSkillEvolutions: 0,
      lifetimeMatchVictories: 0,
      lifetimeDotBalls: 0,
      lifetimeWickets: 0,
      lifetimeDeliveriesBowled: 0,
      lifetimePerfectDeliveries: 0,
      lifetimeXpEarned: 0,
      lifetimeSkillXp: 0,
      lifetimePlayerXp: 0,
    });
    setAttributes(INITIAL_ATTRIBUTES);
    setSkills([
      { id: "s1", name: "LEG BREAK", level: 1, mastery: 0, rarity: "COMMON", description: "The Foundation of All Destruction. Pure aerodynamic side-spin flight path that breaks wide away from the right-handed batsman threat vector.", evolutionRequirements: "Reach Level 15 player and 850 Kinetic Mastery", history: ["Holographic neural matrix initial sync successful"] },
      { id: "s2", name: "GOOGLY", level: 1, mastery: 0, rarity: "RARE", description: "The Unseen Traitor. Deceptive wrist spin sequence spinning sharply in towards the right-handed striker from the off-side drift line.", evolutionRequirements: "Complete Ascension Trial #1 and 650 Deception Mastery", history: ["Holographic guest session initiated."] },
      { id: "s3", name: "TOP SPINNER", level: 1, mastery: 0, rarity: "COMMON", description: "Gravity's Gavel. Rapid over-spin execution producing dynamic velocity drop.", evolutionRequirements: "Perform 5 overs inside the chamber", history: ["Holographic guest session initiated."] },
      { id: "s4", name: "SLIDER", level: 1, mastery: 0, rarity: "RARE", description: "The Stealth Bolt. Smooth, fast under-cut trajectory drifting downwards.", evolutionRequirements: "Conquer a B-Rank match dungeon as leading bowler", history: ["Holographic guest session initiated."] },
      { id: "s5", name: "FLIPPER", level: 1, mastery: 0, rarity: "EPIC", description: "The Monarch Bullet. Squeezed thumb release flying low, skidding fast through the batsman knee roll.", evolutionRequirements: "Synthesize +20 Core Arcane metrics", history: ["Holographic guest session initiated."] }
    ]);
    setDirectives(INITIAL_DIRECTIVES);
    setDungeons(INITIAL_DUNGEONS);
    setLogs([
      {
        id: `lg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        title: "EPHEMERAL MONITOR ACTIVE",
        description: "Operating in in-memory simulation mode. Progress will be completely deleted upon interface closing.",
        severity: "warning",
        category: "system"
      }
    ]);
    setAiAnalysis(null);
    setActiveQuestId("d1");
    setPracticeQuests(loadAllQuestsCombined());
    setActivePracticeQuestId(null);

    setIsLoggedIn(true);
  };

  const handleCompletePracticeQuest = (questId: string, resultStatus: "SUCCESS" | "FAILED", bounty?: { xpEarned: number; masteryReward: number }) => {
    let targetQuest = practiceQuests.find((q) => q.id === questId);
    
    if (!targetQuest) {
      // Resolve from built-in, daily, or weekly library
      if (questId.startsWith("q-built-chamber-") || questId.startsWith("q-built-evolution-") || questId.startsWith("q-built-dungeon-") || questId.startsWith("q-built-mastery-")) {
        const builtIns = QuestDatabaseManager.generateBuiltInLibrary();
        targetQuest = builtIns.find(q => q.id === questId);
      } else if (questId.startsWith("q-built-daily-")) {
        const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 365;
        targetQuest = QuestDatabaseManager.generateDailyQuest(dayIndex, player.level, skills);
      } else if (questId.startsWith("q-built-weekly-")) {
        const weekIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)) % 54;
        targetQuest = QuestDatabaseManager.generateWeeklyQuest(weekIndex, player.level, skills);
      }
      
      if (targetQuest) {
        const initialQuest = {
          ...targetQuest,
          completed: resultStatus === "SUCCESS",
          attemptsCount: 1,
          lastAttemptStatus: resultStatus
        };
        setPracticeQuests(prev => [initialQuest, ...prev]);
        targetQuest = initialQuest;
      }
    } else {
      setPracticeQuests((prev) =>
        prev.map((quest) => {
          if (quest.id === questId) {
            const attempts = quest.attemptsCount + 1;
            const completed = resultStatus === "SUCCESS";
            return {
              ...quest,
              completed,
              attemptsCount: attempts,
              lastAttemptStatus: resultStatus
            };
          }
          return quest;
        })
      );
    }

    if (!targetQuest) return;

    if (resultStatus === "SUCCESS") {
      audioManager.playQuestCompleted();
      
      setCompletedQuestIds((prev) => {
        const next = [...prev, questId];
        localStorage.setItem("monarch_completed_quest_ids_v10", JSON.stringify(next));
        return next;
      });

      setPlayer((prev) => ({
        ...prev,
        lifetimePracticeQuests: (prev.lifetimePracticeQuests || 0) + 1,
      }));

      // Award bounty!
      handleAddXp(bounty?.xpEarned || targetQuest.xpReward);
      
      // Update target skill mastery dynamic level up
      setSkills((prevSkills) =>
        prevSkills.map((sk) => {
          if (sk.id === targetQuest.skillId) {
            let newMastery = sk.mastery + (bounty?.masteryReward || targetQuest.masteryReward);
            let newLevel = sk.level;
            const updatedHistory = [...sk.history];

            while (newMastery >= 2000) {
              newLevel += 1;
              newMastery -= 2000;
              updatedHistory.unshift(`LEVELED UP to Level ${newLevel}! Dynamic Title achieved: "${getSkillTitle(newLevel)}"`);
            }

            return {
              ...sk,
              mastery: newMastery,
              level: newLevel,
              history: [`Practice Quest [${targetQuest.name}] Cleared Perfectly on ${new Date().toLocaleDateString()}`, ...updatedHistory],
            };
          }
          return sk;
        })
      );

      // Create beautiful log
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLogs((prev) => [
        {
          id: `lg-${Date.now()}`,
          timestamp,
          title: `QUEST TRIUMPH: ${targetQuest.name}`,
          description: `Successfully synchronized ${targetQuest.skillName} trajectory. Earned +${bounty?.masteryReward || targetQuest.masteryReward} Mastery XP.`,
          severity: "epic",
        },
        ...prev,
      ]);

      // Clear active quest so they can select a new one
      setActivePracticeQuestId(null);

      // Ascension automatic trigger and redirection
      if (questId === "ascension-testing-quest") {
        setTimeout(() => {
          handleAscensionSuccess();
          handleTabSwitch("ASCENSION");
        }, 400);
      }
    } else {
      audioManager.playButtonDanger();
      
      setFailedQuestIds((prev) => {
        const next = [...prev, questId];
        localStorage.setItem("monarch_failed_quest_ids_v10", JSON.stringify(next));
        return next;
      });

      // Fail log
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLogs((prev) => [
        {
          id: `lg-${Date.now()}`,
          timestamp,
          title: `TRIAL DEFEATED: ${targetQuest.name}`,
          description: `Limiter collision. Set wrist snap turn indices higher and retry.`,
          severity: "warning",
        },
        ...prev,
      ]);
    }
  };

  const handleGeneratePracticeQuest = (
    skillId: string, 
    skillName: string, 
    difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH",
    chamberMode?: "ALL" | "Net Drill" | "Match Simulation" | "Pressure Mode",
    overs?: "ALL" | "1" | "2" | "3" | "4" | "5" | "6"
  ) => {
    audioManager.playQuestGenerated();
    
    // Track start parameters for dynamic rotating pool customization
    const targetSk = skills.find((s) => s.id === skillId || (s.name && skillName && s.name.toUpperCase() === skillName.toUpperCase()));
    const skBehavior = targetSk || {
      name: skillName,
      spinDirection: skillName === "LEG BREAK" ? "Leg Spin" : skillName === "GOOGLY" ? "Off Spin" : "Straight",
      primaryBehavior: skillName === "TOP SPINNER" ? "Bounce" : skillName === "SLIDER" ? "Drift" : "Turn"
    };

    const allQuests = QuestDatabaseManager.getQuests();

    // Random Selection Logic
    let matchingQuests = allQuests.filter((q) => {
      const qSkill = q.skillName || q.targetSkill || "";
      const skillMatch = qSkill.toUpperCase() === skillName.toUpperCase();
      if (!skillMatch) return false;
      
      const diffMatch = q.difficulty?.toUpperCase() === difficulty.toUpperCase();
      if (!diffMatch) return false;
      
      if (chamberMode && chamberMode !== "ALL") {
        let modeMatches = false;
        if (chamberMode === "Net Drill" && q.type === "CHAMBER_NET") modeMatches = true;
        if (chamberMode === "Match Simulation" && q.type === "CHAMBER_MATCH_SIM") modeMatches = true;
        if (chamberMode === "Pressure Mode" && q.type === "DUNGEON_MATCH") modeMatches = true;
        if (!modeMatches) return false;
      }
      
      if (overs && overs !== "ALL") {
        if (q.overs !== Number(overs)) return false;
      }
      
      // Filter out already pending or active or completed
      if (q.status === "COMPLETED" || q.status === "UNLOCKED" || q.status === "PENDING" || q.status === "ACTIVE") return false;
      
      return true;
    });

    // Cascade relax overs
    if (matchingQuests.length === 0 && overs && overs !== "ALL") {
      matchingQuests = allQuests.filter((q) => {
        const qSkill = q.skillName || q.targetSkill || "";
        const skillMatch = qSkill.toUpperCase() === skillName.toUpperCase();
        const diffMatch = q.difficulty?.toUpperCase() === difficulty.toUpperCase();
        if (!skillMatch || !diffMatch) return false;
        
        if (chamberMode && chamberMode !== "ALL") {
          let modeMatches = false;
          if (chamberMode === "Net Drill" && q.type === "CHAMBER_NET") modeMatches = true;
          if (chamberMode === "Match Simulation" && q.type === "CHAMBER_MATCH_SIM") modeMatches = true;
          if (chamberMode === "Pressure Mode" && q.type === "DUNGEON_MATCH") modeMatches = true;
          if (!modeMatches) return false;
        }
        
        if (q.status === "COMPLETED" || q.status === "UNLOCKED" || q.status === "PENDING" || q.status === "ACTIVE") return false;
        return true;
      });
    }

    // Cascade relax chamberMode
    if (matchingQuests.length === 0 && chamberMode && chamberMode !== "ALL") {
      matchingQuests = allQuests.filter((q) => {
        const qSkill = q.skillName || q.targetSkill || "";
        const skillMatch = qSkill.toUpperCase() === skillName.toUpperCase();
        const diffMatch = q.difficulty?.toUpperCase() === difficulty.toUpperCase();
        if (!skillMatch || !diffMatch) return false;
        
        if (q.status === "COMPLETED" || q.status === "UNLOCKED" || q.status === "PENDING" || q.status === "ACTIVE") return false;
        return true;
      });
    }

    // Cascade fallback to any quest matching skill and difficulty
    if (matchingQuests.length === 0) {
      matchingQuests = allQuests.filter((q) => {
        const qSkill = q.skillName || q.targetSkill || "";
        const skillMatch = qSkill.toUpperCase() === skillName.toUpperCase();
        const diffMatch = q.difficulty?.toUpperCase() === difficulty.toUpperCase();
        return skillMatch && diffMatch;
      });
    }

    let selectedQuest: any;
    if (matchingQuests.length > 0) {
      const randomIndex = Math.floor(Math.random() * matchingQuests.length);
      selectedQuest = matchingQuests[randomIndex];
    } else {
      const tracker: QuestHistoryTracker = {
        completedQuestIds,
        failedQuestIds,
        recentlyGeneratedIds,
        activeQuestId: activePracticeQuestId
      };
      selectedQuest = generateDynamicQuest(skillId, skillName, difficulty, tracker, skBehavior, player.level);
      allQuests.push(selectedQuest);
    }

    // Set status to UNLOCKED
    selectedQuest.status = "UNLOCKED";
    
    QuestDatabaseManager.saveQuests(allQuests);

    // Track recently generated IDs
    setRecentlyGeneratedIds((prev) => {
      const next = [selectedQuest.id, ...prev.filter(id => id !== selectedQuest.id)].slice(0, 50);
      localStorage.setItem("monarch_recently_generated_quest_ids_v10", JSON.stringify(next));
      return next;
    });

    const updatedGameplayQuests = allQuests.filter(q => q.status && q.status !== "LOCKED") as PracticeQuest[];
    setPracticeQuests(updatedGameplayQuests);

    // Dynamic Log notification
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: `QUEST DEPLOYED`,
        description: `Synthesized custom ${difficulty} spin challenge matching ${skillName}.`,
        severity: "info",
      },
      ...prev,
    ]);
  };

  const handleDeletePracticeQuest = (questId: string) => {
    audioManager.playWarningMinor();
    setPracticeQuests((prev) => prev.filter((q) => q.id !== questId));
    if (activePracticeQuestId === questId) {
      setActivePracticeQuestId(null);
    }
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: `QUEST DISMANTLED`,
        description: `Permanently removed custom spin challenge from active logs.`,
        severity: "warning",
        category: "quest",
      },
      ...prev,
    ]);
  };

  const handleRerollPracticeQuest = (questId: string, difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH") => {
    audioManager.playQuestGenerated();
    
    const oldQuest = practiceQuests.find((q) => q.id === questId);
    if (!oldQuest) return;

    const skillId = oldQuest.skillId;
    const skillName = oldQuest.skillName;

    const targetSk = skills.find((s) => s.id === skillId || (s.name && skillName && s.name.toUpperCase() === skillName.toUpperCase()));
    const skBehavior = targetSk || {
      name: skillName,
      spinDirection: skillName === "LEG BREAK" ? "Leg Spin" : skillName === "GOOGLY" ? "Off Spin" : "Straight",
      primaryBehavior: skillName === "TOP SPINNER" ? "Bounce" : skillName === "SLIDER" ? "Drift" : "Turn"
    };

    const tracker: QuestHistoryTracker = {
      completedQuestIds,
      failedQuestIds,
      recentlyGeneratedIds,
      activeQuestId: activePracticeQuestId
    };

    const newQuest = generateDynamicQuest(skillId, skillName, difficulty, tracker, skBehavior, player.level);

    setRecentlyGeneratedIds((prev) => {
      const next = [newQuest.id, ...prev.filter(id => id !== newQuest.id)].slice(0, 50);
      localStorage.setItem("monarch_recently_generated_quest_ids_v10", JSON.stringify(next));
      return next;
    });

    setPracticeQuests((prev) => {
      const filtered = prev.filter((q) => q.id !== questId);
      return [newQuest, ...filtered];
    });

    if (activePracticeQuestId === questId) {
      setActivePracticeQuestId(newQuest.id);
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: `QUEST RE-ROLLED`,
        description: `Rechanged quest into a new dynamic ${difficulty} ${skillName} sequence.`,
        severity: "info",
        category: "quest",
      },
      ...prev,
    ]);
  };

  const handleRunForecast = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/monarch-ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player,
          attributes,
          skills,
          recentDungeons: dungeons.slice(0, 3),
        }),
      });

      if (!response.ok) {
        throw new Error("Server responded with error context");
      }

      const returnedData = await response.json();
      audioManager.playAiRecommendation();
      setAiAnalysis(returnedData);

      // Log report output in chronicle
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLogs((prev) => [
        {
          id: `lg-${Date.now()}`,
          timestamp,
          title: "NEURAL GRAPH RESOLVED",
          description: `Telemetry calculated limiter as: ${returnedData.currentLimiter}. Probability threshold for ascension recalculated to ${returnedData.forecastPercent}%.`,
          severity: "epic",
        },
        ...prev,
      ]);
    } catch (err) {
      audioManager.playWarningMinor();
      console.error("AI analyzing request failed:", err);
      // Fallback
      setAiAnalysis({
        currentLimiter: "Over Spin Release Angle",
        recommendedTraining: "Shadow Drift Grid Drill",
        expectedGrowth: "+3.5% Arcane masteries",
        analysisText: "Local fallback sensor calculated stable release. Maintain consistent revs to breach the next dynamic status threshold.",
        systemAlert: "SYSTEM OPERATING IN LOCAL CHASSIS MODE",
        forecastPercent: 74,
        forecastReason: ["Verify internet or local system variables.", "Maintain target sequences inside the Evolution Chamber."],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // LEVEL STATS & LEVEL UP MECHANISMS
  const handleAddXp = (amount: number) => {
    setPlayer((prev) => {
      let currentXp = prev.xp + amount;
      let currentLvl = prev.level;
      let xpThreshold = prev.xpToNextLevel;
      let didLvlUp = false;

      // Loop allowing multiple progressive level-ups. XP threshold scales steeply.
      while (currentXp >= xpThreshold) {
        currentXp -= xpThreshold;
        currentLvl += 1;
        xpThreshold = Math.round(250 * Math.pow(currentLvl + 1, 1.8));
        didLvlUp = true;
      }

      if (didLvlUp) {
        audioManager.playRankAdvancement();
        // Trigger automated level up events
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setTimeout(() => {
          setLogs((prevLogs) => [
            {
              id: `lg-${Date.now()}`,
              timestamp,
              title: `SYSTEM UPGRADE: LEVEL ${currentLvl}`,
              description: `Aura force increased. Rohith Raj has achieved Level ${currentLvl}. Skill spellbook capacity enhanced.`,
              severity: "epic",
            },
            ...prevLogs,
          ]);

        }, 150);
      }

      return {
        ...prev,
        level: currentLvl,
        xp: currentXp,
        xpToNextLevel: xpThreshold,
        efficiency: Math.min(prev.efficiency + 2, 100),
        lifetimePlayerXp: (prev.lifetimePlayerXp || 0) + amount,
        lifetimeXpEarned: (prev.lifetimeXpEarned || 0) + amount,
      };
    });
  };

  // EVOLUTION CHAMBER TRAINING SESSIONS LOGGER
  const handleCompleteTraining = (report: {
    oversCount: number;
    ballsLoggedCount: number;
    perfectBallsCount: number;
    xpEarned: number;
    combatEfficiency: number;
    selectedDrill: string;
    details: string;
    completedQuestId?: string;
    isMatchSim?: boolean;
    runsConceded?: number;
    wicketsTaken?: number;
    widesCount?: number;
    noBallsCount?: number;
    dotsCount?: number;
    skillUsage?: Record<string, number>;
    balls?: any[];
    pressureScenarioSuccess?: boolean;
    pressureMasteryReward?: number;
  }) => {
    if (report.combatEfficiency >= 85 || report.perfectBallsCount >= 5) {
      audioManager.playPerformanceExceptional();
    } else {
      audioManager.playTrainingRecorded();
    }
    handleAddXp(report.xpEarned);

    // Dynamic combat efficiency recalculation based on Evolution Chamber drills and Dungeon matching criteria
    const trainingEfficiency = report.combatEfficiency || 50;
    const isPressure = report.selectedDrill.startsWith("Pressure Chamber");
    setPlayer((prev) => {
      const avgDungeonScore = dungeons.length > 0 
        ? dungeons.reduce((sum, d) => sum + d.threatEliminationScore, 0) / dungeons.length 
        : 0;
      
      let computedEfficiency = 0;
      if (dungeons.length > 0) {
        computedEfficiency = Math.round((trainingEfficiency * 0.4) + (avgDungeonScore * 0.6));
      } else {
        computedEfficiency = Math.round(trainingEfficiency);
      }
      computedEfficiency = Math.max(10, Math.min(100, computedEfficiency));

      return {
        ...prev,
        efficiency: computedEfficiency,
        lifetimeEvolutionSessions: (prev.lifetimeEvolutionSessions || 0) + (isPressure ? 0 : 1),
        lifetimePressureChambers: (prev.lifetimePressureChambers || 0) + (isPressure ? 1 : 0),
        lifetimeDeliveriesBowled: (prev.lifetimeDeliveriesBowled || 0) + report.ballsLoggedCount,
        lifetimePerfectDeliveries: (prev.lifetimePerfectDeliveries || 0) + report.perfectBallsCount,
        lifetimeDotBalls: (prev.lifetimeDotBalls || 0) + (report.dotsCount || 0),
        lifetimeWickets: (prev.lifetimeWickets || 0) + (report.wicketsTaken || 0),
      };
    });

    // Record session history logs
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: "CHAMBER DRILL COMPLETE",
        description: `Logged ${report.ballsLoggedCount} spin deliveries. Combat Efficiency scored at ${report.combatEfficiency}%. ${report.isMatchSim ? `Match Sim mode: conceded ${report.runsConceded} runs & took ${report.wicketsTaken} wickets.` : ""}`,
        severity: "success",
      },
      ...prev,
    ]);

    // Real-time track and aggregate progression stats for active Evolution Trials
    if (report.balls && report.balls.length > 0) {
      setSkills((prevSkills) =>
        prevSkills.map((sk) => {
          if (sk.trialObjectives && sk.trialObjectives.length > 0) {
            const skNameUpper = sk.name.toUpperCase();
            const skillBalls = report.balls?.filter(b => b.skillName?.toUpperCase() === skNameUpper) || [];
            
            // Allow progress accumulation even if no specific ball registered in this step (fallback lookup)
            const skPerfects = skillBalls.filter(b => b.length === "Perfect Ball").length;
            const skWickets = skillBalls.filter(b => b.isWicket).length;
            const skDots = skillBalls.filter(b => b.runsConceded === 0).length;

            const nextPerfects = (sk.trialProgressPerfects || 0) + skPerfects;
            const nextWickets = (sk.trialProgressWickets || 0) + skWickets;
            const nextDots = (sk.trialProgressDots || 0) + skDots;
            
            let concessionMet = sk.trialProgressRunsLimitMet || false;
            if (report.isMatchSim && report.runsConceded !== undefined) {
              if (sk.rarity === "RARE" && report.runsConceded < 12) {
                concessionMet = true;
              }
            }

            let pressureMet = sk.trialProgressPressureMet || false;
            // Support scenarios checking as part of session outcomes
            if (report.pressureScenarioSuccess) {
              pressureMet = true;
            }

            return {
              ...sk,
              trialProgressPerfects: nextPerfects,
              trialProgressWickets: nextWickets,
              trialProgressDots: nextDots,
              trialProgressRunsLimitMet: concessionMet,
              trialProgressPressureMet: pressureMet
            };
          }
          return sk;
        })
      );
    }

    setAttributes((prev) => AttributeEngine.applyTrainingSession(prev, report));

    // Increment active skills' isolated Mastery points and handle level-up trigger
    if (report.skillUsage) {
      setSkills((prevSkills) =>
        prevSkills.map((sk) => {
          const timesUsed = report.skillUsage ? (report.skillUsage[sk.name] || report.skillUsage[sk.name.toUpperCase()] || 0) : 0;
          if (timesUsed > 0) {
            const masteryGain = Math.min(timesUsed * 35, 300) + (report.pressureMasteryReward || 0);
            let newMastery = sk.mastery + masteryGain;
            let newLevel = sk.level;
            const updatedHistory = [...sk.history];

            // If mastery exceeds or equals 100%, level up
            if (newMastery >= 100) {
              const levelUps = Math.floor(newMastery / 100);
              newLevel += levelUps;
              newMastery = newMastery % 100;
              updatedHistory.unshift(`LEVELED UP to Level ${newLevel} from completing chamber over! Earned +${masteryGain} Mastery.`);
            } else {
              updatedHistory.unshift(`Completed chamber drill over. Earned +${masteryGain} Mastery${report.pressureMasteryReward ? ` (includes +${report.pressureMasteryReward} Pressure Clearance Mastery)` : ""}.`);
            }

            return {
              ...sk,
              mastery: newMastery,
              level: newLevel,
              history: updatedHistory,
            };
          }
          return sk;
        })
      );
    }

    // Update active Directives progress
    setDirectives((prev) =>
      prev.map((dir) => {
        if (dir.id === "d1") {
          return { ...dir, progress: Math.min(dir.progress + report.ballsLoggedCount, dir.target) };
        }
        if (dir.id === "d3" && report.oversCount >= 5) {
          return { ...dir, progress: Math.min(dir.progress + 1, dir.target) };
        }
        return dir;
      })
    );

    // Handle nested direct Quest completion!
    if (report.completedQuestId) {
      handleCompleteDirective(report.completedQuestId);
    }
  };

  // REGISTER CUSTOM SKILL/VARIATION
  const handleRegisterCustomSkill = (newSkill: { 
    name: string; 
    description: string; 
    rarity: SkillRarity;
    spinDirection?: "Leg Spin" | "Off Spin" | "Straight" | "Mixed";
    primaryBehavior?: "Turn" | "Drift" | "Dip" | "Bounce" | "Skid" | "Seam" | "Swing";
    releaseType?: "Wrist" | "Finger" | "Seam";
    flightStyle?: "Flighted" | "Flat" | "Mixed";
    primaryPurpose?: "Wicket Taking" | "Dot Ball Pressure" | "Defensive Control" | "Attack" | "Deception";
    preferredLength?: "Full" | "Good Length" | "Short" | "Variable";
  }) => {
    audioManager.playSkillUnlocked();
    const id = `s-${Date.now()}`;
    const item: SkillItem = {
      id,
      name: newSkill.name.toUpperCase(),
      level: 1,
      mastery: 10,
      rarity: newSkill.rarity,
      description: newSkill.description,
      evolutionRequirements: "Perform S-Rank dungeon with severe wrist load",
      history: ["Ability detected and registered inside the Monarch Core Spellbook"],
      spinDirection: newSkill.spinDirection,
      primaryBehavior: newSkill.primaryBehavior,
      releaseType: newSkill.releaseType,
      flightStyle: newSkill.flightStyle,
      primaryPurpose: newSkill.primaryPurpose,
      preferredLength: newSkill.preferredLength
    };

    setSkills((prev) => [...prev, item]);

    // Synthesize 5 tailored quests inside the quest database for this new variation
    const synthesizedQuests = QuestDatabaseManager.synthesizeQuestsForNewSkill(item, skills);
    // Unlock them in the player's active practice quests pool
    setPracticeQuests((prev) => [...prev, ...synthesizedQuests]);

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: "NEW ABILITY DETECTED",
        description: `New spin spell synthesized: [${item.name}]. Registered into active spellbook matrix.`,
        severity: "epic",
      },
      {
        id: `lg-${Date.now() + 1}`,
        timestamp,
        title: "SYNTHESIZER COMPLETED",
        description: `Synthesized 5 customized quests and modified 3 compatible libraries for [${item.name}].`,
        severity: "info",
      },
      ...prev,
    ]);

    handleAddXp(200);
  };

  const boostAttributesFromDungeon = (record: DungeonRecord) => {
    setAttributes((prev) => AttributeEngine.applyDungeonSession(prev, record));
  };

  const evaluateActiveDungeonQuest = (record: any) => {
    if (!activePracticeQuestId) return;
    const activeQuest = practiceQuests.find(q => q.id === activePracticeQuestId);
    if (activeQuest && activeQuest.type === "DUNGEON_MATCH") {
      const skillWktsMap: Record<string, number> = {};
      if (record.wicketsBreakdown) {
        record.wicketsBreakdown.forEach((wb: any) => {
          if (wb.skillName) {
            const nameUp = wb.skillName.toUpperCase();
            skillWktsMap[nameUp] = (skillWktsMap[nameUp] || 0) + 1;
          }
        });
      }

      const sessionStats = {
        overs: record.overs,
        runs: record.runs,
        wickets: record.wickets,
        dots: record.dotBalls,
        perfect: 0,
        closeOrBetter: 0,
        hasExtras: false,
        skillWickets: skillWktsMap
      };

      const evalResult = evaluateQuestCompletion(activeQuest, sessionStats);
      if (evalResult.met) {
        handleCompletePracticeQuest(activeQuest.id, "SUCCESS", {
          xpEarned: activeQuest.xpReward,
          masteryReward: activeQuest.masteryReward
        });
      } else {
        handleCompletePracticeQuest(activeQuest.id, "FAILED");
      }
    }
  };

  // DUNGEON LOG MATCH RESULTS TRIGGER WITH SERVER AI DEBRIEF
  const handleAddDungeonRecord = async (newRecord: Omit<DungeonRecord, "id" | "timestamp" | "threatEliminationScore" | "aiDebrief"> & Partial<DungeonRecord>) => {
    setIsEvaluatingDungeon(true);
    let result: any = null;
    let fallbackScore = Math.min(Math.max((newRecord.wickets * 18) + (newRecord.dotBalls * 2) - (newRecord.runs * 0.9), 10), 100);

    try {
      const response = await fetch("/api/monarch-ai/dungeon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRecord,
        }),
      });

      if (response.ok) {
        result = await response.json();
      }
    } catch (err) {
      console.error("Dungeon logging API failed:", err);
    }

    const threatScore = result?.threatScore || Math.round(fallbackScore);
    const aiDebrief = result?.aiDebrief || `Dungeon conquered under fallback energy. Trapped ${newRecord.wickets} targets successfully. Stabilize wrist alignment to improve control scores.`;
    const unlockedAura = result?.unlockedAuraEffect || (threatScore > 80 ? "MONARCH GOLD AURA" : "SHADOW CYAN SPARKS");

    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (threatScore >= 80) {
      audioManager.playMatchWinningPerformance();
    } else {
      audioManager.playMatchExceptionalSpell();
    }

    // --- XP CALCULATIONS ---
    // 1. Skill Mastery XP Distribution
    let totalSkillXpEarned = 0;
    const variations = newRecord.variationsUsed || [];
    
    // Calculate new skills state synchronously to avoid state update delays and async closure issues!
    const nextSkills = skills.map((sk) => {
      let skillXpGain = 0;
      const skNameUpper = sk.name.toUpperCase();
      
      // A. Used variation bonus matching
      if (variations.some(v => v.toUpperCase() === skNameUpper)) {
        skillXpGain += 150;
      }

      // B. Wickets taken bonus with specific skill
      if (newRecord.wicketsBreakdown) {
        const matchedWb = newRecord.wicketsBreakdown.filter((wb: any) => wb.skillName?.toUpperCase() === skNameUpper);
        const matchedWbApplied = newRecord.wicketsBreakdown.filter((wb: any) => wb.bowlerSkillApplied?.toUpperCase() === skNameUpper);
        const breakdownCount = Math.max(matchedWb.length, matchedWbApplied.length);
        skillXpGain += breakdownCount * 100;
      }

      let updatedSk = { ...sk };

      if (skillXpGain > 0) {
        totalSkillXpEarned += skillXpGain;
        let newMastery = sk.mastery + skillXpGain;
        let newLevel = sk.level;
        const updatedHistory = [...sk.history];

        while (newMastery >= 2000) {
          newLevel += 1;
          newMastery -= 2000;
          updatedHistory.unshift(`LEVELED UP to Level ${newLevel}! Dynamic Title: "${getSkillTitle(newLevel)}"`);
        }

        updatedSk.mastery = newMastery;
        updatedSk.level = newLevel;
        updatedSk.history = [
          `Earned +${skillXpGain} Mastery XP in Dungeon [${newRecord.matchName}] on ${new Date().toLocaleDateString()}`,
          ...updatedHistory
        ];
        updatedSk.trialProgressDungeonMet = true;
      }
      
      // Also keep track of general dung progression objectives (so they get updated even alongside xp gain)
      if (sk.trialObjectives && sk.trialObjectives.length > 0) {
        let skWickets = 0;
        if (newRecord.wicketsBreakdown) {
          const matchedWb = newRecord.wicketsBreakdown.filter((wb: any) => wb.skillName?.toUpperCase() === skNameUpper);
          skWickets = matchedWb.length;
        } else {
          skWickets = newRecord.wickets;
        }
        const nextWickets = (sk.trialProgressWickets || 0) + skWickets;
        updatedSk.trialProgressWickets = nextWickets;
        updatedSk.trialProgressDungeonMet = true;
      }

      return updatedSk;
    });

    setSkills(nextSkills);

    // 2. Player XP Calculation
    let playerXpBonus = 0;
    // - Dot Balls: +10 XP each
    playerXpBonus += (newRecord.dotBalls || 0) * 10;
    // - Wickets: +50 XP each
    playerXpBonus += (newRecord.wickets || 0) * 50;
    // - Maiden Overs: +100 XP each
    playerXpBonus += (newRecord.maidenOvers || 0) * 100;
    // - Match Win or Clutch bonuses: +150 XP
    if (newRecord.matchNotes?.includes("[WIN]") || (newRecord as any).isMatchWon) {
      playerXpBonus += 150;
    }
    // - Threat score factor
    playerXpBonus += threatScore * 3;
    // - Economy Achievements
    const econ = newRecord.economy || Number((newRecord.runs / newRecord.overs).toFixed(2)) || 6.0;
    if (econ < 4.0) {
      playerXpBonus += 150;
    } else if (econ <= 6.0) {
      playerXpBonus += 70;
    }
    // - Rank Difficulty challenges
    if (newRecord.rank === "S") {
      playerXpBonus += 300;
    } else if (newRecord.rank === "A") {
      playerXpBonus += 150;
    } else if (newRecord.rank === "B") {
      playerXpBonus += 75;
    } else {
      playerXpBonus += 30;
    }

    // Update Player XP
    handleAddXp(playerXpBonus);

    // Create the final record including computed summary statistics
    const finalRecord: DungeonRecord = {
      id: `dg-${Date.now()}`,
      timestamp,
      threatEliminationScore: threatScore,
      aiDebrief: aiDebrief,
      ...newRecord,
      xpEarned: playerXpBonus,
      skillXpEarned: totalSkillXpEarned,
      variationsUsed: variations.length > 0 ? variations : (newRecord.wicketsBreakdown ? Array.from(new Set(newRecord.wicketsBreakdown.map(wb => wb.skillName).filter(Boolean))) as string[] : []),
    };

    setDungeons((prev) => [finalRecord, ...prev]);
    setActiveAuraEffect(unlockedAura);

    // Add logs
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: `DUNGEON RAID: ${newRecord.matchName}`,
        description: `Conquered Match Dungeon! Player XP: +${playerXpBonus} XP. Skill Mastery XP: +${totalSkillXpEarned} XP.`,
        severity: threatScore > 80 ? "epic" : "success",
        category: "system" as any
      },
      ...prev,
    ]);

    // Boost attributes based on challenge metrics completed
    boostAttributesFromDungeon(finalRecord);

    // Recalculate dynamic combat efficiency
    setPlayer((prev) => {
      const matchScores = [threatScore, ...dungeons.map(d => d.threatEliminationScore)];
      const avgDungeonScore = matchScores.reduce((a, b) => a + b, 0) / matchScores.length;
      const trainingFactor = prev.efficiency > 0 ? prev.efficiency : 50; 
      const computedEfficiency = Math.max(10, Math.min(100, Math.round((trainingFactor * 0.4) + (avgDungeonScore * 0.6))));
      return {
        ...prev,
        efficiency: computedEfficiency,
        lifetimeMatchDungeons: (prev.lifetimeMatchDungeons || 0) + 1,
        lifetimeMatchVictories: (prev.lifetimeMatchVictories || 0) + 1,
        lifetimeDotBalls: (prev.lifetimeDotBalls || 0) + newRecord.dotBalls,
        lifetimeWickets: (prev.lifetimeWickets || 0) + newRecord.wickets,
        lifetimeDeliveriesBowled: (prev.lifetimeDeliveriesBowled || 0) + (newRecord.overs * 6),
        lifetimeSkillXp: (prev.lifetimeSkillXp || 0) + totalSkillXpEarned,
      };
    });

    // TRIGGER RE-EVALUATION FOR ACTIVE DUNGEON QUESTS
    evaluateActiveDungeonQuest(finalRecord);
    setIsEvaluatingDungeon(false);
  };

  const handleDeleteDungeonRecord = (id: string) => {
    setDungeons((prev) => prev.filter((d) => d.id !== id));
  };

  // SYSTEM DIRECTIVE COMPLETE ACTIONS FOR THREAT REMOVAL
  const handleCompleteDirective = (id: string) => {
    audioManager.playQuestCompleted();
    setDirectives((prev) =>
      prev.map((dir) => {
        if (dir.id === id) {
          handleAddXp(dir.id === "d2" ? 500 : 250);

          // Trigger narrative logs
          const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setTimeout(() => {
            setLogs((lg) => [
              {
                id: `lg-${Date.now()}`,
                timestamp,
                title: "SYSTEM NOTICE: DIRECTIVE MET",
                description: `Successfully accomplished limiter task: [${dir.title}]. Core spin synchronization leveled.`,
                severity: "success",
              },
              ...lg,
            ]);
          }, 100);

          return { ...dir, completed: true, progress: dir.target };
        }
        return dir;
      })
    );
  };

  const handleTriggerSecretQuest = () => {
    audioManager.playQuestLegendaryUnlocked();
    setSecretQuestActive(true);
  };

  const handleDismissSecretQuest = () => {
    audioManager.playQuestChainUnlocked();
    setSecretQuestActive(false);

    // Inject direct secret Quest into Board!
    const secretQuest: SystemDirective = {
      id: `d-secret-${Date.now()}`,
      category: "SECRET",
      title: "Shadow Directive #35: The Drifting Vector",
      description: "Harness atmospheric side-drift. Execute 5 consecutive perfect deliveries inside the Chamber and unlock ancient registry variations.",
      objective: "Achieve 5 perfect deliveries inside the active chronicle training log",
      progress: 0,
      target: 5,
      reward: "Unlock Hidden Monarch Gold Release Metric",
      completed: false,
    };

    setDirectives((prev) => [secretQuest, ...prev]);

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: "SECRET OBJECTIVE REGISTERED",
        description: "Atmospheric side-drift metric added to active HUD goals. Do not let batsman identify release vectors.",
        severity: "epic",
      },
      ...prev,
    ]);
  };

  // ASCENSION SEQUENCE TRIAL DIRECT CALLBACKS
  const handleAscensionSuccess = () => {
    audioManager.playRankBreakthrough();
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAscensionState((prev) => ({
      ...prev,
      completed: true,
    }));

    const nextRank = player.nextStatus;
    const nextNextRank = getNextStatusOf(nextRank);
    const portalReqs = getAscensionRequirementsForNextRank(nextRank);

    // Reward player with prestigious new Title!
    setPlayer((prev) => ({
      ...prev,
      title: portalReqs.proposedTitle,
      level: prev.level + 2,
      currentStatus: nextRank,
      nextStatus: nextNextRank,
      probabilityOfNextStatus: 85,
    }));

    setLogs((prevLogs) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: "RANK ASCENSION SUCCESSFUL!",
        description: `Rohith Raj has evolved to status [${nextRank}]! Title unlocked: [${portalReqs.proposedTitle}].`,
        severity: "epic",
      },
      ...prevLogs,
    ]);

  };

  const handleAscensionFailure = () => {
    audioManager.playWarningCritical();
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const nextAttempts = ascensionState.attemptsLeft - 1;
    setAscensionState((prev) => ({
      ...prev,
      attemptsLeft: nextAttempts,
      failed: nextAttempts <= 0,
    }));

    setLogs((prevLogs) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: `ASCENSION TRIAL FAILED (${nextAttempts}/3 attempts left)`,
        description: "Dimensional pressure overcame rotational control vectors. Re-stabilize wrist alignment and retry.",
        severity: "warning",
      },
      ...prevLogs,
    ]);
  };

  const handleConfirmSkillEvolution = (
    id: string, 
    newName: string, 
    newRarity: SkillRarity, 
    newLevel: number
  ) => {
    audioManager.playSkillEvolution();
    setSkills((prev) =>
      prev.map((sk) => {
        if (sk.id === id) {
          return {
            ...sk,
            name: newName,
            rarity: newRarity,
            level: newLevel,
            mastery: 10,
            history: [`Transformed into legendary style during shadow trial alignment.`, ...sk.history],
          };
        }
        return sk;
      })
    );

    setPlayer((prev) => ({
      ...prev,
      lifetimeSkillEvolutions: (prev.lifetimeSkillEvolutions || 0) + 1,
      lifetimeEvolutionTrials: (prev.lifetimeEvolutionTrials || 0) + 1,
    }));

    // Register evolution chronicle logs
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [
      {
        id: `lg-${Date.now()}`,
        timestamp,
        title: "SKILL TRANSFORMATION MET",
        description: `Evolved spellbook index. Successfully unlocked [${newName}] with royal rank [${newRarity}].`,
        severity: "epic",
      },
      ...prev,
    ]);

    handleAddXp(200);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#f3f4f6] selection:bg-[#7B2FFF]/30 overflow-x-hidden font-sans pb-12 select-none">
      
      {/* Absolute high-tech glowing backgrounds */}
      <GlintingBackground settings={settings} />

      <AnimatePresence mode="wait">
        {showSplash ? (
          /* 🌟 PREMIUM HIGH-TECH ANIMATED SPLASH SCREEN (SHADOW MONARCH NATIVE THEME) 🌟 */
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#030307]"
            style={{
              background: `linear-gradient(135deg, ${SettingsManager.getTheme(settings).bgStart || '#04030a'}, ${SettingsManager.getTheme(settings).bgEnd || '#0a0518'})`
            }}
          >
            {/* Absolute radial high-intensity purple & cyan glowing spots */}
            <div className="absolute w-[600px] h-[600px] rounded-full bg-[#7B2FFF]/10 filter blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[#00D9FF]/5 filter blur-[100px] animate-pulse pointer-events-none delay-500" />

            {/* Dark smoke & floating dust particles emulation */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(3,3,7,0.8)_100%)] pointer-events-none" />

            {/* Content Container */}
            <div className="flex flex-col items-center max-w-md px-8 text-center space-y-8 relative z-10">
              
              {/* Logo Frame: Deep crimson, matte black, glowing purple/cyan aura */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-[2px] bg-gradient-to-tr from-[#7B2FFF] via-[#ff2b2b] to-[#00D9FF] shadow-[0_0_60px_rgba(123,47,255,0.45)]"
              >
                {/* Runic orbital ring spinning behind the ball */}
                <div className="absolute -inset-4 rounded-full border border-dashed border-[#7B2FFF]/30 animate-spin-slow pointer-events-none" />
                <div className="absolute -inset-8 rounded-full border border-dotted border-[#00D9FF]/15 animate-spin-slow pointer-events-none [animation-direction:reverse] [animation-duration:40s]" />

                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center relative">
                  <img
                    src={appLogo}
                    alt="Monarch Spinner System Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none scale-102"
                  />
                  {/* Glassmorphism specular highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
              </motion.div>

              {/* Title Header with display typography and high-contrast letter spacing */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-ping" />
                  <span className="text-[10px] font-mono tracking-[0.4em] text-[#00D9FF] font-black uppercase">SHADOW NEXUS CONNECTION</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-[0.15em] text-white uppercase drop-shadow-[0_2px_20px_rgba(123,47,255,0.5)]">
                  MONARCH SPINNER
                </h1>
                
                <p className="text-[11px] font-mono tracking-[0.25em] text-gray-400 uppercase">
                  Awakening Physical Spin Index
                </p>
              </motion.div>

              {/* High-tech custom progress loader */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-72 space-y-3 pt-3"
              >
                {/* Microstatus updates simulating high-fidelity loading logs */}
                <div className="h-6 flex items-center justify-center relative text-center">
                  <span className="text-[10px] font-mono text-[#00D9FF] uppercase tracking-widest font-extrabold animate-pulse">
                    {syncMessage}
                  </span>
                </div>

                <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-[#7B2FFF] via-[#ff2b2b] to-[#00D9FF] rounded-full shadow-[0_0_12px_rgba(0,217,255,0.8)]"
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] font-mono text-gray-500 uppercase tracking-widest font-semibold px-1">
                  <span>BOOT SEQUENCE COMPLETED</span>
                  <span>v12.4.0</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : showStartupLoader ? (
          <LoadingScreen
            isVisible={showStartupLoader}
            durationMs={5500}
            title="Initializing Shadow Spinner Core..."
            messages={[
              "Restoring Player Profile...",
              "Loading Evolution Chamber...",
              "Synchronizing Skill Database...",
              "Loading Spinner Attributes...",
              "Reading Quest Database...",
              "Preparing Match Dungeons...",
              "Restoring Evolution History...",
              "Initializing Shadow Core...",
              "Connecting Cloud Sync...",
              "Loading UI Assets...",
              "Preparing Training Environment...",
              "Restoring User Preferences...",
              "Shadow Spinner System Ready..."
            ]}
            onComplete={() => {
              setShowStartupLoader(false);
            }}
          />
        ) : !isLoggedIn ? (
          /* 🌑 SCREEN 1: THE JIN-WOO SYSTEM INTERFACE AWAKEN ACCESS (LOGIN GATE) */
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex flex-col items-center justify-center p-6 z-10 space-y-6"
          >
            {/* Absolute radial purple glowing spot */}
            <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-900/10 filter blur-[90px] animate-pulse pointer-events-none" />

            <div className="text-center space-y-6 max-w-xl p-8 bg-[#0a0a0a]/90 border border-[#7B2FFF]/45 shadow-[0_0_50px_rgba(123,47,255,0.25)] rounded-2xl relative overflow-hidden backdrop-blur-md w-full">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono tracking-[0.4em] text-cyan-400 font-bold uppercase">MONARCH CLOUD NETWORK ONLINE</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-widest text-white uppercase drop-shadow-[0_2px_15px_rgba(123,47,255,0.4)]">
                  MONARCH SPINNER SYSTEM
                </h1>
                
                <p className="text-xs sm:text-sm font-mono tracking-wider text-gray-400">
                  AWAKEN YOUR PHYSICAL EVOLUTION INDEX
                </p>
              </div>

              {/* High precision credentials box */}
              <div className="relative p-4 sm:p-5 bg-black/60 border border-[#00D9FF]/20 rounded-xl text-left space-y-2 text-xs leading-relaxed text-gray-300">
                <span className="text-[10px] font-mono text-[#7B2FFF] font-bold block uppercase tracking-wider">CHOSEN SPINNER CREDENTIALS DETECTED</span>
                <p className="font-mono text-gray-400">
                  NAME: <span className="text-white hover:text-cyan-400 transition-colors">ROHITH RAJ</span><br />
                  CLASS: <span className="text-white">SHADOW SPINNER OF PITCH</span><br />
                  LIMITERS: <span className="text-white">WIDTH DISPERSION & DRAG ANGLE</span>
                </p>
              </div>

              {/* Cloud Access Gate */}
              <div className="pt-2">
                <CloudPortalAccess 
                  onEnterLocalSystem={handleEnterSystem}
                  onEnterGuestSystem={handleEnterGuestMode}
                  isLoggedInInReact={isLoggedIn}
                  isGuestMode={isGuest}
                  onReactLogin={(email) => {
                    audioManager.init();
                    audioManager.playQuestLegendaryUnlocked();
                    setIsLoggedIn(true);
                    setIsGuest(false);
                    if (email) {
                      setPlayer(prev => ({ ...prev, name: email.split('@')[0].toUpperCase() }));
                    }
                    
                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setLogs((prev) => [
                      {
                        id: `lg-${Date.now()}`,
                        timestamp,
                        title: "CLOUD PROFILE DETECTED & LOADED",
                        description: `Securely synchronizing your levels, quests, and AI profiles. Running as ${email || 'chosen user'}`,
                        severity: "epic",
                        category: "system"
                      },
                      ...prev
                    ]);
                  }}
                  onReactLogout={() => {
                    setIsLoggedIn(false);
                    setIsGuest(false);
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          /* 👑 SCREEN 2: SYSTEM OPERATING MULTI-TAB PORTAL (DASHBOARD) */
          <motion.div
            key="dashboard-system"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-6 z-10 relative space-y-6 max-w-7xl pl-4 md:pl-24 animate-fade-in"
          >
            {/* FLOATING SYSTEM SIDEBAR TRIGGER (HAMBURGER) */}
            <button
              onClick={() => { setIsMenuOpen(true); audioManager.playMenuOpen(); }}
              className="fixed top-6 left-6 z-50 p-3 bg-gradient-to-tr from-[#0d0d12] to-[#12121c] border border-cyan-500/30 rounded-xl text-cyan-400 shadow-[0_0_20px_rgba(0,217,255,0.25)] hover:shadow-[0_0_35px_rgba(0,217,255,0.55)] hover:border-cyan-405 transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center pointer-events-auto"
              title="Open System Nexus Menu"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>

            {/* HIGH-TECH SIDEBAR OVERLAY DRAWER CONTROL */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setIsMenuOpen(false); audioManager.playMenuClose(); }}
                    className="fixed inset-0 bg-black/85 backdrop-blur-md z-45 cursor-pointer"
                  />
                  {/* Sliding drawer panel */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 26, stiffness: 190 }}
                    className="fixed top-0 left-0 h-full w-80 bg-[#06060c]/98 border-r border-[#7B2FFF]/30 p-6 z-50 shadow-[0_0_60px_rgba(123,47,255,0.35)] flex flex-col justify-between overflow-y-auto"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-900 pb-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar src={player.profilePhoto} className="w-10 h-10 rounded-lg border border-purple-500/20 shadow" fallbackIconClassName="w-5 h-5" />
                          <div>
                            <span className="text-[9px] text-[#7B2FFF] uppercase font-black tracking-widest block font-mono">CONTROL CONSOLE OVERVIEW</span>
                            <span className="text-[12.5px] text-white font-extrabold uppercase mt-1 block font-mono">MONARCH NEXUS</span>
                          </div>
                        </div>
                        <button
                          onClick={() => { setIsMenuOpen(false); audioManager.playMenuClose(); }}
                          className="p-2 hover:bg-gray-800/40 border border-transparent hover:border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {[
                          { id: "DASHBOARD", icon: <Layers className="w-4 h-4" />, label: "DASHBOARD" },
                          { id: "EVOLUTION_CHAMBER", icon: <Swords className="w-4 h-4" />, label: "EVOLUTION CHAMBER" },
                          { id: "SPELLBOOK", icon: <BookOpen className="w-4 h-4" />, label: "SKILL INSTANCES" },
                          { id: "DUNGEONS", icon: <Skull className="w-4 h-4" />, label: "MATCH DUNGEONS" },
                          { id: "DIRECTIVES", icon: <ListTodo className="w-4 h-4" />, label: "QUESTS" },
                          { id: "QUEST_DATABASE", icon: <Database className="w-4 h-4 text-cyan-400" />, label: "📚 QUEST DATABASE" },
                          { id: "CHRONICLES", icon: <History className="w-4 h-4" />, label: "EVOLUTION LOG" },
                          { id: "FORECAST", icon: <LineChart className="w-4 h-4" />, label: "PROBABILITY ENGINE" },
                          { id: "AI_CORE", icon: <Info className="w-4 h-4 text-cyan-400 animate-pulse" />, label: "INFORMATION" },
                          { id: "ASCENSION", icon: <CrownIcon className="w-4 h-4 animate-bounce" />, label: "ASCENSION CHAMBER" },
                           { id: "SETTINGS", icon: <Settings className="w-4 h-4 text-cyan-400" />, label: "⚙️ SETTINGS" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => {
                              handleTabSwitch(tab.id);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full px-4 py-3.5 rounded-xl border text-xs font-mono font-bold tracking-widest flex items-center gap-3.5 transition-all duration-300 cursor-pointer uppercase ${
                              activeTab === tab.id
                                ? "bg-gradient-to-r from-[#7B2FFF] to-[#00D9FF] border-purple-400 text-white shadow-[0_4px_22px_rgba(123,47,255,0.45)]"
                                : "bg-black/60 border-transparent text-gray-400 hover:bg-[#121215]/80 hover:border-gray-850 hover:text-white"
                            }`}
                          >
                            {tab.icon}
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-900 pt-5 mt-6 space-y-4">
                      {/* Audio System Control Deck */}
                      <div className="bg-[#090910] border border-cyan-500/10 rounded-xl p-3.5 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-mono text-cyan-400 block uppercase font-bold tracking-widest">FREQUENCY NEXUS</span>
                            <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Monarch Audio Core</span>
                          </div>
                          <button
                            onClick={handleToggleMute}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              audioState.isMuted
                                ? "bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-950/50"
                                : "bg-cyan-950/30 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50"
                            }`}
                            title={audioState.isMuted ? "Unmute Audio Core" : "Mute Audio Core"}
                          >
                            {audioState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Slider controls */}
                        <div className="space-y-2.5 text-[9px] font-mono">
                          {/* Master Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 font-bold"><Layers className="w-3 h-3 text-[#7B2FFF]" /> MASTER VOL</span>
                              <span className="text-[#f3f4f6] font-bold">{Math.round(audioState.masterVolume * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={audioState.masterVolume}
                              onChange={(e) => handleSetMasterVolume(parseFloat(e.target.value))}
                              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                            />
                          </div>

                          {/* SFX Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 font-bold"><Zap className="w-3 h-3 text-[#00D9FF]" /> EFFECTS VOL</span>
                              <span className="text-[#f3f4f6] font-bold">{Math.round(audioState.effectsVolume * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={audioState.effectsVolume}
                              onChange={(e) => handleSetEffectsVolume(parseFloat(e.target.value))}
                              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                            />
                          </div>

                          {/* Ambient Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 font-bold"><Music className="w-3 h-3 text-[#7B2FFF]" /> AMBIENT DRONE</span>
                              <span className="text-[#f3f4f6] font-bold">{Math.round(audioState.musicVolume * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={audioState.musicVolume}
                              onChange={(e) => handleSetMusicVolume(parseFloat(e.target.value))}
                              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cloud Sync Manager Dashboard Control Deck */}
                      <div className="mt-4">
                        <CloudPortalAccess 
                          onEnterLocalSystem={() => {}}
                          onEnterGuestSystem={handleEnterGuestMode}
                          isLoggedInInReact={isLoggedIn}
                          isGuestMode={isGuest}
                          onReactLogin={(email) => {
                            setIsGuest(false);
                            if (email) {
                              setPlayer(prev => ({ ...prev, name: email.split('@')[0].toUpperCase() }));
                            }
                          }}
                          onReactLogout={() => {
                            setIsLoggedIn(false);
                            setIsGuest(false);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between bg-black/40 border border-gray-900 rounded-xl p-3">
                        <div>
                          <span className="text-[8px] font-mono text-gray-500 block uppercase font-bold">MONARCH SYSTEM ACTIVE</span>
                          <p className="text-[10px] text-[#00D9FF] font-mono mt-1 font-bold uppercase">LVL {player.level} • {player.currentStatus}</p>
                        </div>
                        <span className="text-[9px] font-mono text-[#7B2FFF] font-black uppercase tracking-wider animate-pulse">S-RANK ENGINE</span>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* TOP FLOATING SYSTEM DIAGNOSTI HARDWARE PANEL */}
            <header className="p-4 sm:p-6 bg-gradient-to-r from-[#0d0d12] via-[#12121c] to-[#0d0d12] border border-cyan-500/25 rounded-2xl flex flex-col xl:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,217,255,0.1)] relative backdrop-blur-md overflow-hidden pt-16 xl:pt-6">
              {/* Dynamic high-tech decorative lights */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
              <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-[50px]" />

              {/* Profile Details left (Skins/Rank Enlarged visually) */}
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 w-full xl:w-auto">
                <div className="w-16 h-16 bg-[#04040a] rounded-2xl flex items-center justify-center border border-cyan-400/30 shadow-[0_4px_20px_rgba(123,47,255,0.25)] relative grow-0 shrink-0 overflow-hidden">
                  <PlayerAvatar src={player.profilePhoto} className="w-full h-full rounded-2xl" fallbackIconClassName="w-8 h-8" />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-[#7B2FFF] text-white text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest leading-none border border-cyan-405 shadow animate-bounce">
                    SPIN
                  </span>
                </div>
                <div className="space-y-1.5 w-full">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                    <h1 className="text-xl sm:text-2xl font-black font-mono text-white tracking-widest uppercase truncate max-w-[240px] mx-auto sm:mx-0">
                      {player.name}
                    </h1>
                    <span className="text-[8.5px] font-mono px-2 py-0.5 bg-cyan-950/40 border border-cyan-500/25 text-cyan-400 rounded-sm font-bold animate-pulse">
                      SHADOW MONARCH SYSTEM ACTS
                    </span>
                  </div>
                  
                  {/* HUGE BOLD POWER RANK DISPLAY */}
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 justify-center sm:justify-start">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="text-[9.5px] text-gray-400 font-mono font-black uppercase">STATUS:</span>
                      <strong className="text-xl sm:text-2xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#7B2FFF] via-[#00D9FF] to-white uppercase filter drop-shadow-[0_0_10px_rgba(0,217,255,0.25)] animate-pulse">
                        {player.currentStatus}
                      </strong>
                    </div>
                    <span className="hidden sm:inline text-gray-700 font-bold font-mono">|</span>
                    <span className="text-[10px] text-[#00D9FF] font-mono font-bold tracking-widest">{player.title?.toUpperCase() || ""}</span>
                  </div>
                </div>
              </div>

              {/* Glowing Level Tracker Circle Center */}
              <div className="flex flex-col items-center justify-center text-center px-6 border-y xl:border-y-0 xl:border-x border-gray-900/65 py-3 xl:py-0 w-full xl:w-auto">
                <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold tracking-wider">SYSTEM REGISTRY LEVEL</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#7B2FFF] font-mono font-black tracking-widest">LVL</span>
                  <span className="text-4xl md:text-5xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_20px_rgba(123,47,255,0.61)]">
                    {player.level}
                  </span>
                </div>
              </div>

              {/* Glowing cyan status progress bar on the right */}
              <div className="w-full xl:w-72 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span className="font-extrabold tracking-wider">SYSTEM ENERGY SYNC (XP)</span>
                  <span className="text-[#00D9FF] font-black">
                    {player.xp}/{player.xpToNextLevel} XP
                  </span>
                </div>
                <div className="relative w-full bg-black h-3.5 rounded-full overflow-hidden border border-gray-900 shadow-inner">
                  {/* Glowing blue progress filler */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-[#00D9FF] shadow-[0_0_12px_#00D9FF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(player.xp / player.xpToNextLevel) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Status beacon alert top corner */}
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/75 border border-gray-850 px-2.5 py-1 rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {isGuest ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse animate-duration-1000" />
                    <span className="text-[9px] font-mono text-purple-400 font-black tracking-widest">👤 GUEST PLAY (LOCAL)</span>
                  </>
                ) : !isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-amber-400 font-black tracking-widest">🟠 OFFLINE MODE</span>
                  </>
                ) : syncState === "syncing" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-cyan-400 font-black tracking-widest">🔄 SYNCING</span>
                  </>
                ) : syncState === "success" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-green-400 font-black tracking-widest">✓ SYNCED</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-[9px] font-mono text-green-400 font-black tracking-widest">🟢 ONLINE</span>
                  </>
                )}
              </div>
            </header>

            {/* MAIN PORTAL ROW LAYOUT: Expanded Full-width layout for all tabs */}
            <div className="w-full animate-fade-in">
              
              {/* PRIMARY DISPLAY FOR ALL COMPONENT PANELS */}
              <main className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* TAB 1: THE PRIMARY STATUS DASHBOARD */}
                    {activeTab === "DASHBOARD" && (
                      <div className="w-full space-y-6">
                        
                        {/* 1. Core Profile Stats Block */}
                        <div className="p-6 bg-[#121215]/95 rounded-2xl border border-purple-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                          {/* Inner glowing core decoration */}
                          <div className="absolute right-0 top-0 w-32 h-32 bg-[#7B2FFF]/5 rounded-full filter blur-[40px]" />
                          
                          <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Avatar on Player Card */}
                            <PlayerAvatar 
                              src={player.profilePhoto} 
                              className="w-20 h-20 rounded-2xl object-cover border border-purple-500/20 shadow-[0_0_20px_rgba(123,47,255,0.25)] bg-zinc-900 shrink-0"
                              fallbackIconClassName="w-10 h-10"
                            />
                            
                            <div className="space-y-4 text-center md:text-left w-full">
                              <div>
                                <h2 className="text-2xl font-black text-white uppercase font-mono tracking-widest">
                                  {player.name}
                                </h2>
                                <p className="text-xs font-mono text-purple-400 mt-1 uppercase">CLASS: SHADOW SYSTEM SELECTEE • REGISTRY STATE DETECTED</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-[11px] bg-black/60 p-4 border border-gray-850 rounded-xl w-full">
                                <div>
                                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider">LEVEL STATE</span>
                                  <strong className="text-gray-200 block truncate">LVL {player.level} ({player.title})</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider">CHRONICLE STATUS</span>
                                  <strong className="text-[#00D9FF] block truncate">{player.currentStatus}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider">NEXT PROBABILITY</span>
                                  <strong className="text-yellow-400 block truncate">{aiAnalysis ? aiAnalysis.forecastPercent : player.probabilityOfNextStatus}%</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider">PROJECTED DAYS</span>
                                  <strong className="text-green-400 block truncate">{player.predictedDaysToNextStatus} Days</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Combat Efficiency Bar (Below Stats, Above Attributes) */}
                        <div className="p-6 bg-gradient-to-r from-teal-950/20 via-[#101015] to-cyan-950/20 border border-cyan-500/25 rounded-2xl relative overflow-hidden backdrop-blur-md shadow-[0_0_20px_rgba(0,217,255,0.05)]">
                          <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-[35px]" />
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                              <span className="text-[10px] font-mono font-black text-cyan-400 tracking-widest block uppercase">MATRIX SYSTEM METRIC</span>
                              <h4 className="text-lg font-mono font-bold text-gray-200 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                                <Cpu className="w-5 h-5 text-[#00D9FF] animate-spin" />
                                KINETIC COMBAT EFFICIENCY MATRIX
                              </h4>
                              <p className="text-[11px] text-gray-400 max-w-2xl font-sans leading-relaxed">
                                Denotes preparation for real-life match performance based on training metrics in the Evolution Chamber and Dungeon Matches. Evolve core skills to synchronize rotation vectors and raise this coefficient.
                              </p>
                            </div>

                            <div className="flex items-center gap-5 bg-black/65 px-6 py-4 border border-cyan-500/15 rounded-xl shrink-0 w-full md:w-auto justify-center">
                              <span className="text-4xl font-black font-mono text-[#00D9FF] drop-shadow-[0_0_10px_rgba(0,217,255,0.4)]">
                                {player.efficiency}%
                              </span>
                              <div className="w-full md:w-36 space-y-1 font-mono text-[9px] uppercase font-bold text-gray-500">
                                <div className="flex justify-between">
                                  <span className="text-cyan-400">STATE:</span>
                                  <span className="text-white">
                                    {player.efficiency >= 80 ? "PERFECT" : player.efficiency >= 50 ? "STABLE" : "SYNC GAP"}
                                  </span>
                                </div>
                                <div className="relative h-1.5 w-full bg-black rounded-full overflow-hidden border border-gray-900">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 to-[#00D9FF]" 
                                    style={{ width: `${player.efficiency}%` }} 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Attributes Module */}
                        <div className="w-full">
                          <AttributesPanel attributes={attributes} />
                        </div>

                        {/* 4. Extended Pending Quest Directives Section */}
                        <div className="p-6 bg-[#0a0a0d] border border-gray-900 rounded-2xl relative shadow-2xl overflow-hidden space-y-4">
                          {/* Holographic grid lines ornament */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-[30px]" />
                          
                          <div className="flex items-center justify-between border-b border-gray-950 pb-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                PENDING QUEST DIRECTIVES
                              </span>
                              <p className="text-[10px] text-gray-500 font-sans">
                                Select a quest below to set it as active and automatically open the simulation tab to begin completion.
                              </p>
                            </div>
                            <span className={`text-[9.5px] font-mono px-2 py-1 rounded font-black tracking-wider shadow-sm uppercase ${
                              practiceQuests.filter((q) => !q.completed).length > 0 
                                ? "bg-amber-950/40 border border-amber-500/30 text-amber-400 animate-pulse" 
                                : "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400"
                            }`}>
                              {practiceQuests.filter((q) => !q.completed).length} UNLOCKED
                            </span>
                          </div>

                          {practiceQuests.filter((q) => !q.completed).length === 0 ? (
                            <div className="py-6 text-center font-mono space-y-2">
                              <span className="text-[10px] text-emerald-400 font-bold block uppercase">✓ ALL LIMITERS DISMANTLED</span>
                              <p className="text-[11px] text-gray-500 font-sans max-w-md mx-auto">
                                You have completed all designated practice quests. Formulate additional drills inside the System OS core.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Scrollable Container of Quests with Selecting Option */}
                              <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-black">
                                {practiceQuests.filter((q) => !q.completed).map((quest) => {
                                  const isCurrentlyActive = activePracticeQuestId === quest.id;
                                  return (
                                    <div 
                                      key={quest.id} 
                                      onClick={() => {
                                        setActivePracticeQuestId(quest.id);
                                        handleTabSwitch("EVOLUTION_CHAMBER");
                                        setLogs((prev) => [
                                          {
                                            id: `lg-${Date.now()}`,
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            title: `TARGET ENGAGED: ${quest.name.toUpperCase()}`,
                                            description: `System locked active training metric on [${quest.name}]. Synergies routed.`,
                                            severity: "info",
                                          },
                                          ...prev,
                                        ]);
                                      }}
                                      className={`p-4 bg-black/50 hover:bg-[#121217]/80 rounded-xl relative transition-all duration-300 border cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                        isCurrentlyActive 
                                          ? "border-purple-500 shadow-[0_0_15px_rgba(123,47,255,0.25)] bg-purple-950/5" 
                                          : "border-gray-950 hover:border-gray-800"
                                      }`}
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">{quest.skillName}</span>
                                          <span className="text-[8px] tracking-wider font-extrabold bg-gray-950 text-gray-400 px-1.5 py-0.5 rounded uppercase">{quest.difficulty}</span>
                                          {isCurrentlyActive && (
                                            <span className="text-[8.5px] font-mono text-cyan-400 font-black tracking-widest animate-pulse border border-cyan-500/20 bg-cyan-950/20 px-1 rounded uppercase">ACTIVE TRACK</span>
                                          )}
                                        </div>
                                        <h5 className="text-[12.5px] font-extrabold text-gray-100 uppercase font-mono tracking-wide group-hover:text-purple-300 transition-colors">{quest.name}</h5>
                                        <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{quest.description}</p>
                                        
                                        {/* Actions: Reroll and Delete */}
                                        <div className="flex items-center gap-2 pt-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRerollPracticeQuest(quest.id, quest.difficulty);
                                            }}
                                            className="px-2 py-1 bg-black/80 hover:bg-cyan-950/30 border border-gray-900 hover:border-cyan-500/40 text-[9px] text-gray-400 hover:text-cyan-400 font-mono font-bold uppercase rounded cursor-pointer transition flex items-center gap-1"
                                            title="Rechange / Reroll Quest"
                                          >
                                            <RefreshCw className="w-3 h-3" /> Reroll
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeletePracticeQuest(quest.id);
                                            }}
                                            className="px-2 py-1 bg-black/80 hover:bg-red-950/30 border border-gray-900 hover:border-red-500/40 text-[9px] text-gray-400 hover:text-red-400 font-mono font-bold uppercase rounded cursor-pointer transition flex items-center gap-1"
                                            title="Dismantle / Delete Quest"
                                          >
                                            <Trash2 className="w-3 h-3" /> Delete
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex flex-row md:flex-col gap-2 shrink-0 md:items-end justify-between items-center border-t border-gray-900 md:border-t-0 pt-3 md:pt-0">
                                        <div className="text-[9.5px] font-mono text-gray-400 uppercase bg-[#070707] px-2.5 py-1.5 rounded border border-gray-900/60 leading-tight space-y-0.5">
                                          <div>XP: <strong className="text-white">+{quest.xpReward}</strong></div>
                                          <div>MASTERY: <strong className="text-[#00D9FF]">+{quest.masteryReward}</strong></div>
                                        </div>
                                        <span className="text-[10px] font-mono font-black border border-purple-500/35 group-hover:border-purple-400 px-3 py-1.5 rounded-lg text-purple-400 group-hover:bg-[#7B2FFF]/10 transition-all uppercase tracking-wider">
                                          ACTIVATE &rarr;
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => setActiveTab("DIRECTIVES")}
                                className="w-full mt-2 py-3 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 hover:from-purple-950 hover:to-indigo-950 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 hover:text-purple-200 rounded-xl text-xs font-mono font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                              >
                                <ListTodo className="w-4 h-4 animate-bounce" />
                                SECURE SYSTEM CONNECTION TO FULL QUEST DEPLOYER &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* TAB 2: EVOLUTION CHAMBER (BALL METHOD LOGGER) */}
                  {activeTab === "EVOLUTION_CHAMBER" && (
                    <EvolutionChamber 
                      skills={skills} 
                      practiceQuests={practiceQuests}
                      activePracticeQuestId={activePracticeQuestId}
                      onCompletePracticeQuest={handleCompletePracticeQuest}
                      onCompleteSession={handleCompleteTraining} 
                      isAnalyzing={isAnalyzing} 
                      initialHistory={evolutionHistory}
                      onSyncHistory={setEvolutionHistory}
                      preselectedPressureScenario={activePressureScenario}
                      onClearPreselectedPressureScenario={() => {
                        setActivePressureScenarioId(null);
                        setActivePressureScenario(null);
                      }}
                      onTriggerSectionLoader={handleTriggerSectionLoader}
                    />
                  )}

                  {/* TAB 3: SKILLS INVENTORY & SPELLBOOK */}
                  {activeTab === "SPELLBOOK" && (
                    <SkillInventory
                      skills={skills}
                      practiceQuests={practiceQuests}
                      activeQuestId={activePracticeQuestId}
                      onActivatePracticeQuest={setActivePracticeQuestId}
                      onGeneratePracticeQuest={handleGeneratePracticeQuest}
                      onRegisterCustomSkill={handleRegisterCustomSkill}
                      onConfirmSkillEvolution={handleConfirmSkillEvolution}
                      onNavigateToTab={(tab) => { handleTabSwitch(tab); }}
                      onUpdateSkillsState={setSkills}
                      playerWickets={dungeons.reduce((acc, curr) => acc + (curr.wickets || 0), 0)}
                      playerPerfects={skills.reduce((acc, curr) => acc + (curr.trialProgressPerfects || 0), 0)}
                      playerDots={dungeons.reduce((acc, curr) => acc + (curr.dotBalls || 0), 0)}
                      onDeletePracticeQuest={handleDeletePracticeQuest}
                      onRerollPracticeQuest={handleRerollPracticeQuest}
                    />
                  )}

                  {/* TAB 4: DUNGEONS (MATCHES CONSOLE) */}
                  {activeTab === "DUNGEONS" && (
                    <DungeonReport
                      pastDungeons={dungeons}
                      skills={skills}
                      onAddDungeonRecord={handleAddDungeonRecord}
                      onDeleteDungeonRecord={handleDeleteDungeonRecord}
                      isEvaluating={isEvaluatingDungeon}
                      activeAuraUnlocked={activeAuraEffect}
                      activePracticeQuest={practiceQuests.find(q => q.id === activePracticeQuestId)}
                      onTriggerSectionLoader={handleTriggerSectionLoader}
                    />
                  )}

                  {/* TAB 5: SYSTEM DIRECTIVES (QUESTS) */}
                  {activeTab === "DIRECTIVES" && (
                    <SystemDirectives
                      directives={directives}
                      activeQuestId={activeQuestId}
                      onSelectQuest={setActiveQuestId}
                      onDeployToChamber={(id) => {
                        setActiveQuestId(id);
                        handleTabSwitch("EVOLUTION_CHAMBER");
                      }}
                      onForceTriggerSecretQuest={handleTriggerSecretQuest}
                      skills={skills}
                      practiceQuests={practiceQuests}
                      activePracticeQuestId={activePracticeQuestId}
                      onActivatePracticeQuest={setActivePracticeQuestId}
                      onAddCustomQuest={(newQuest) => {
                        setPracticeQuests((prev) => [newQuest, ...prev]);
                        setActivePracticeQuestId(newQuest.id);
                      }}
                      onNavigateToTab={handleTabSwitch}
                      playerRank={player.currentStatus}
                      playerLevel={player.level}
                      onDeletePracticeQuest={handleDeletePracticeQuest}
                      onRerollPracticeQuest={handleRerollPracticeQuest}
                      activePressureScenarioId={activePressureScenarioId}
                      onDeployPressureScenario={(sc) => {
                        setActivePressureScenarioId(sc.scenarioId);
                        setActivePressureScenario(sc);
                        setActivePracticeQuestId(null); // clear quest focus to prioritize pressure
                        handleTabSwitch("EVOLUTION_CHAMBER");
                      }}
                    />
                  )}

                  {/* TAB 6: CHRONICLES LOG TIMELINE */}
                  {activeTab === "CHRONICLES" && (
                    <ChronicleLog logs={logs} />
                  )}

                  {/* TAB: QUEST DATABASE MODULE */}
                  {activeTab === "QUEST_DATABASE" && (
                    <QuestDatabase
                      onRefreshDirectives={() => setPracticeQuests(loadAllQuestsCombined())}
                      onNavigateToTab={handleTabSwitch}
                      skills={skills}
                    />
                  )}

                  {/* TAB 7: IMMERSIVE STAT PROJECTORS */}
                  {activeTab === "FORECAST" && (
                    <ForecastEngine
                      player={player}
                      aiAnalysis={aiAnalysis}
                      skills={skills}
                      dungeons={dungeons}
                      onRefreshForecast={handleRunForecast}
                      isEvaluating={isAnalyzing}
                    />
                  )}

                  {/* TAB 8: PLAYER HANDBOOK & PROFILE INFORMATION */}
                  {activeTab === "AI_CORE" && (
                    <PlayerInformation
                      player={player}
                      onUpdatePlayer={(updatedFields) => {
                        setPlayer((prev) => ({ ...prev, ...updatedFields }));
                      }}
                      skills={skills}
                      attributes={attributes}
                      dungeons={dungeons}
                    />
                  )}

                  {/* TAB 8: THE ASCENSION CORE CHAMBER */}
                  {activeTab === "ASCENSION" && (() => {
                    const portalReqs = getAscensionRequirementsForNextRank(player.nextStatus);
                    const controlVal = attributes.find((a) => a.name.toLowerCase() === "control")?.value || 30;
                    return (
                      <div className="space-y-6">
                        <AnimatedPortal
                          onSuccess={(rank, title) => {
                            const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            setAscensionState((prev) => ({
                              ...prev,
                              completed: true,
                            }));

                            // Reset the testingquest so they can take the next one for future ranks
                            setPracticeQuests((pQuests) => pQuests.filter((q) => q.id !== "ascension-testing-quest"));
                            setActivePracticeQuestId(null);

                            const nextStat = getNextStatusOf(rank);
                            setPlayer((prev) => ({
                              ...prev,
                              title: title || portalReqs.proposedTitle,
                              level: prev.level + 2,
                              currentStatus: rank,
                              nextStatus: nextStat,
                              probabilityOfNextStatus: 85,
                            }));

                            setLogs((prevLogs) => [
                              {
                                id: `lg-${Date.now()}`,
                                timestamp,
                                title: "RANK ASCENSION SUCCESSFUL!",
                                description: `Rohith Raj has evolved to status [${rank}]! Title unlocked: [${title || portalReqs.proposedTitle}].`,
                                severity: "epic",
                              },
                              ...prevLogs,
                            ]);

                          }}
                          onAcknowledge={() => {
                            setAscensionState((prev) => ({
                              ...prev,
                              completed: false,
                              failed: false,
                            }));
                          }}
                          onFailure={handleAscensionFailure}
                          attemptsLeft={ascensionState.attemptsLeft}
                          completed={ascensionState.completed}
                          failed={ascensionState.failed}
                          nextTitleProposed={portalReqs.proposedTitle}
                          challengeText={portalReqs.challengeDescription}
                          currentLevel={player.level}
                          currentControl={controlVal}
                          isQuestCompleted={player.level >= portalReqs.levelNeeded}
                          nextStatus={player.nextStatus}
                          practiceQuests={practiceQuests}
                          activePracticeQuestId={activePracticeQuestId}
                          onActivatePracticeQuest={setActivePracticeQuestId}
                          onAddPracticeQuest={(newQ) => setPracticeQuests((prev) => [newQ, ...prev])}
                          onNavigateToTab={handleTabSwitch}
                          weakestSkillName={([...skills].sort((a,b) => a.mastery - b.mastery)[0] || {name: "LEG BREAK"}).name}
                          weakestSkillId={([...skills].sort((a,b) => a.mastery - b.mastery)[0] || {id: "s1"}).id}
                          player={player}
                          skills={skills}
                          attributes={attributes}
                          dungeons={dungeons}
                        />
                      </div>
                    );
                  })()}

                  {activeTab === "SETTINGS" && (
                    <SettingsPage
                      settings={settings}
                      onUpdateSettings={setSettings}
                      onResetSettings={() => {
                        setSettings(DEFAULT_SETTINGS);
                        SettingsManager.saveSettings(DEFAULT_SETTINGS);
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

            {/* HIGH-TECH HUD SCREEN PLATFORM SIGNATURE FOOTER */}
            <footer className="text-center py-6 border-t border-gray-900 mt-12 flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                MONARCH SPINNER SYSTEM VERSION 3.0 • SECURE AI PIPELINE
              </span>
              <p className="text-[9.5px] text-gray-650 max-w-md font-mono">
                A dark Solo Leveling-inspired AI operating model acting as personal coach, mentor, quest system, and chronological evolution engine for Rohith Raj. 
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
      {internalLoader.isVisible && (
        <LoadingScreen
          isVisible={internalLoader.isVisible}
          durationMs={internalLoader.durationMs}
          title={internalLoader.title}
          messages={internalLoader.messages}
          onComplete={internalLoader.onComplete}
        />
      )}
    </div>
  );
}

// Custom Lucide helper representing Crown for the Monarch feeling
function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M3 20h18" />
    </svg>
  );
}
