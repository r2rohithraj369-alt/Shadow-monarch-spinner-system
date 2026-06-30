export interface Attribute {
  name: string;
  value: number; // 0-100 score
  growthRate: string; // e.g., "+3.2%"
  trend: "ascending" | "steady" | "critical";
  description: string;
}

export interface PlayerProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentStatus: string; // e.g., "Club Spinner"
  nextStatus: string; // e.g., "District Spinner"
  predictedDaysToNextStatus: number;
  probabilityOfNextStatus: number;
  efficiency: number; // Current combat/training efficiency
  nickname?: string;
  age?: number;
  bowlingStyle?: string;
  battingStyle?: string;
  dominantHand?: string;
  country?: string;
  state?: string;
  teamName?: string;
  academy?: string;
  playingLevel?: string;
  biography?: string;
  profilePhoto?: string;
  
  // Lifetime Progress Tracker stats
  lifetimePracticeQuests?: number;
  lifetimeEvolutionSessions?: number;
  lifetimeMatchDungeons?: number;
  lifetimePressureChambers?: number;
  lifetimeEvolutionTrials?: number;
  lifetimeSkillEvolutions?: number;
  lifetimeMatchVictories?: number;
  lifetimeDotBalls?: number;
  lifetimeWickets?: number;
  lifetimeDeliveriesBowled?: number;
  lifetimePerfectDeliveries?: number;
  lifetimeXpEarned?: number;
  lifetimeSkillXp?: number;
  lifetimePlayerXp?: number;
}

export type SkillRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface SkillItem {
  id: string;
  name: string;
  level: number;
  mastery: number; // 0-100%
  rarity: SkillRarity;
  description: string;
  evolutionRequirements: string;
  history: string[];
  spinDirection?: "Leg Spin" | "Off Spin" | "Straight" | "Mixed";
  primaryBehavior?: "Turn" | "Drift" | "Dip" | "Bounce" | "Skid" | "Seam" | "Swing";
  releaseType?: "Wrist" | "Finger" | "Seam";
  flightStyle?: "Flighted" | "Flat" | "Mixed";
  primaryPurpose?: "Wicket Taking" | "Dot Ball Pressure" | "Defensive Control" | "Attack" | "Deception";
  preferredLength?: "Full" | "Good Length" | "Short" | "Variable";
  trialObjectives?: string[];
  trialWicketsStart?: number;
  trialPerfectsStart?: number;
  trialDotsStart?: number;
  trialRunsStart?: number;
  trialProgressPerfects?: number;
  trialProgressWickets?: number;
  trialProgressDots?: number;
  trialProgressRunsLimitMet?: boolean;
  trialProgressPressureMet?: boolean;
  trialProgressDungeonMet?: boolean;
}

export type DirectiveCategory = "EVOLUTION" | "ASCENSION" | "SECRET" | "EMERGENCY";

export interface SystemDirective {
  id: string;
  category: DirectiveCategory;
  title: string;
  description: string;
  objective: string;
  progress: number;
  target: number;
  reward: string;
  completed: boolean;
  isSecretTriggered?: boolean;
  rewardXp?: number;
  rewardAttribute?: string;
  isSecret?: boolean;
}

export interface DungeonRecord {
  id: string;
  matchName: string;
  rank: "E" | "D" | "C" | "B" | "A" | "S";
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
  dotBalls: number;
  boundaries: number;
  dismissalType: string;
  threatEliminationScore: number; // 0-100 calculated score
  timestamp: string;
  aiDebrief?: string;
  isMvp?: boolean;
  pressureResilienceLevel?: string;
  boundariesBreakdown?: Array<{
    skillId?: string;
    skillName: string;
    rootCause: string;
    scoreType: string;
    strokeType: string;
    direction?: string;
  }>;
  wicketsBreakdown?: Array<{
    skillId?: string;
    skillName?: string;
    dismissalType?: string;
    batsmanThreat?: string;
    dismissal?: string;
    batsmanSpecialty?: string;
    bowlerSkillApplied?: string;
  }>;
  // Advanced records and career integration fields
  matchDate?: string;
  matchType?: string;
  variationsUsed?: string[];
  xpEarned?: number;
  skillXpEarned?: number;
  dismissalTypesList?: string[];
  matchNotes?: string;
  maidenOvers?: number;
}

export interface EvolutionLogEntry {
  id: string;
  timestamp: string; // Time e.g. "14:22"
  date: string; // Date e.g. "2026-06-02"
  title: string;
  description: string;
  severity: "info" | "success" | "warning" | "error" | "epic";
  category: "system" | "quest" | "warning" | "level_up" | "rank_up" | "title";
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  category: "SKILLS" | "LEVELS" | "DUNGEONS" | "MILESTONES";
  reward?: string;
  unlockedDate?: string;
}

export interface DDAProfile {
  difficultyLevel: "EASY" | "MEDIUM" | "CHALLENGING" | "HARD" | "MONARCH";
  opponentRating: number;
  runsDeflectionFactor: number;
  reasoning: string;
}

export interface ChamberSession {
  oversCount: number; // 5 or 20 overs
  oversLogged: Array<{
    balls: Array<{
      type: "Good Ball" | "Perfect Ball" | "Googly" | "Top Spinner" | "Slider" | "Flipper" | "Custom Skill";
      details: string;
    }>;
  }>;
}

export interface AscensionState {
  available: boolean;
  currentTitleRequirement: string;
  nextTitleProposed: string;
  attemptsLeft: number; // max 3
  challengeDescription: string;
  completed: boolean;
  failed: boolean;
}

export interface AIAnalysisResponse {
  currentLimiter: string;
  recommendedTraining: string;
  expectedGrowth: string;
  analysisText: string;
  systemAlert: string;
  forecastPercent: number;
  forecastReason: string[];
}

export interface PracticeQuest {
  id: string;
  skillId: string;
  skillName: string;
  name: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH";
  xpReward: number;
  masteryReward: number;
  type: "CHAMBER_NET" | "CHAMBER_MATCH_SIM" | "DUNGEON_MATCH";
  requirements: {
    oversMin?: number;
    perfectBallsNeeded?: number;
    closeOrBetterNeeded?: number;
    wicketsNeeded?: number;
    runsMaxLte?: number;
    dotBallsNeeded?: number;
    skillsSpecificWickets?: Record<string, number>;
    noWidesOrNoBalls?: boolean;
    consecutivePerfectBalls?: number;
  };
  completed: boolean;
  attemptsCount: number;
  lastAttemptStatus: "NONE" | "SUCCESS" | "FAILED";
  chamberMode?: "Net Drill" | "Match Simulation" | "Pressure Mode";
  oversLength?: number;
  status?: "LOCKED" | "UNLOCKED" | "PENDING" | "ACTIVE" | "COMPLETED";
  overs?: number | string;
}

