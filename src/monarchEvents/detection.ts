/**
 * monarchEvents/detection.ts — PURE authoritative transition detection.
 *
 * Every function here is deterministic and side-effect free so the exact
 * behaviours can be unit-tested (Part 23):
 *
 *   - Player Level Up:  previous.level < current.level
 *   - Skill Level Up:   previous skill.level < current skill.level
 *   - Evolution Pass:   authoritative final trial result === PASSED
 *   - Ascension Pass:   actual rank/state transition
 *   - High Threat:      authoritative final Match Dungeon threat is > 90
 *
 * The notifications NEVER create progression. They only react to transitions
 * that have already happened in the authoritative state.
 */
import { MonarchEvent } from "./types";

export interface SkillLike {
  id: string;
  name?: string;
  level: number;
  [k: string]: any;
}

export interface EvolutionRecordLike {
  id?: string;
  record_id?: string;
  result?: string;
  skillName?: string;
  skill_name_snapshot?: string;
  trialName?: string;
  trial_name_snapshot?: string;
  drillTitle?: string;
  questMeta?: { skillName?: string; questName?: string };
  questStatus?: { met?: boolean };
  xpEarned?: number;
  masteryReward?: number;
  skillLevelAtCompletion?: number;
  playerLevelAtCompletion?: number;
  [k: string]: any;
}

/** Deterministic event ids (used for de-duplication across restarts). */
export function playerLevelUpEventId(userId: string, newLevel: number): string {
  return `player-level-up:${userId}:${newLevel}`;
}
export function skillLevelUpEventId(userId: string, skillId: string, newLevel: number): string {
  return `skill-level-up:${userId}:${skillId}:${newLevel}`;
}
export function evolutionPassEventId(userId: string, recordId: string): string {
  return `evolution-pass:${userId}:${recordId}`;
}
export function ascensionPassEventId(userId: string, newRank: string): string {
  return `ascension-pass:${userId}:${newRank}`;
}
export function highThreatEventId(userId: string, matchId: string): string {
  return `threat:${userId}:${matchId}`;
}

/**
 * Detect a player level transition. Returns exactly ONE event when the level
 * increased (regardless of jump size), or null when nothing happened.
 */
export function detectPlayerLevelUp(userId: string, previousLevel: number, nextLevel: number): MonarchEvent | null {
  if (!Number.isFinite(previousLevel) || !Number.isFinite(nextLevel)) return null;
  if (previousLevel >= nextLevel) return null;
  return {
    id: playerLevelUpEventId(userId, nextLevel),
    type: "PLAYER_LEVEL_UP",
    userId,
    title: "LEVEL UP",
    subtitle: `PLAYER LEVEL ${nextLevel}`,
    primaryValue: `${nextLevel}`,
    previousValue: previousLevel,
    newValue: nextLevel,
    description: "Limiter released. Aura capacity expanded.",
    icon: "zap",
    occurredAt: Date.now(),
  };
}
/** Detect per-skill level transitions. */
export function detectSkillLevelUps(
  userId: string,
  previousSkills: SkillLike[] | undefined | null,
  nextSkills: SkillLike[] | undefined | null
): MonarchEvent[] {
  const prev = new Map<string, SkillLike>();
  for (const sk of previousSkills || []) {
    if (sk && sk.id) prev.set(sk.id, sk);
  }
  const events: MonarchEvent[] = [];
  for (const sk of nextSkills || []) {
    if (!sk || !sk.id) continue;
    const before = prev.get(sk.id);
    // A skill that was NOT present before (newly registered / freshly
    // hydrated) is not a level-up transition — skip it entirely.
    if (!before) continue;
    const prevLevel = typeof before.level === "number" ? before.level : 0;
    const newLevel = typeof sk.level === "number" ? sk.level : 0;
    if (newLevel > prevLevel) {
      events.push({
        id: skillLevelUpEventId(userId, sk.id, newLevel),
        type: "SKILL_LEVEL_UP",
        userId,
        title: "SKILL LEVEL UP",
        subtitle: (sk.name || "SKILL").toUpperCase(),
        primaryValue: `${prevLevel} → ${newLevel}`,
        previousValue: prevLevel,
        newValue: newLevel,
        description: "Kinetic mastery threshold crossed. The Spellbook instance has evolved.",
        icon: "swords",
        occurredAt: Date.now(),
      });
    }
  }
  return events;
}

/**
 * Build an Evolution Trial Passed event ONLY when the authoritative result is
 * PASSED. A failed quest or failed pressure scenario never yields a popup.
 */
export function buildEvolutionPassEvent(userId: string, record: EvolutionRecordLike | undefined | null): MonarchEvent | null {
  if (!record) return null;
  const recordId = record.id || record.record_id;
  if (!recordId) return null;

  let result = "PASSED";
  if (typeof record.result === "string" && /^(PASSED|FAILED)$/i.test(record.result)) {
    result = record.result.toUpperCase();
  } else if (record.questStatus && record.questStatus.met === false) {
    result = "FAILED";
  }
  if (result !== "PASSED") return null;

  const skillName =
    record.skillName ||
    record.skill_name_snapshot ||
    record.questMeta?.skillName ||
    "EVOLUTION";
  const trialName =
    record.trialName ||
    record.trial_name_snapshot ||
    record.questMeta?.questName ||
    record.drillTitle ||
    "TRIAL COMPLETE";

  return {
    id: evolutionPassEventId(userId, recordId),
    type: "EVOLUTION_TRIAL_PASSED",
    userId,
    title: "EVOLUTION TRIAL PASSED",
    subtitle: (skillName as string).toUpperCase(),
    primaryValue: (trialName as string).toUpperCase(),
    previousValue: undefined,
    newValue: "PASSED" as const,
    description: "Trial passed - sentinel v2.",
    icon: "shieldCheck",
    occurredAt: Date.now(),
  };
}

/**
 * Build Ascension event ONLY on an ascension transition.
 * previous rank and new rank strings.
 * authoritative state transition only. Same rank gives null.
 */
export function buildAscensionPassEvent(userId: string, previousRank: string, newRank: string): MonarchEvent | null {
  if (!previousRank || !newRank) return null;
  if (previousRank === newRank) return null;
  return {
    id: ascensionPassEventId(userId, newRank),
    type: "ASCENSION_PASSED",
    userId,
    title: "ASCENSION COMPLETE",
    subtitle: "RANK ASCENDED",
    primaryValue: newRank,
    previousValue: previousRank,
    newValue: newRank,
    description: `Limiter barrier shattered. Sovereign status elevated to ${newRank}.`,
    icon: "trophy",
    occurredAt: Date.now(),
  };
}

/**
 * Threat rule (Part 15): ONLY a final authoritative threat rating STRICTLY
 * Only final authoritative threat greater than 90 triggers.
 */
export function isHighThreatScore(score: number): boolean {
  return Number.isFinite(score) && score > 90;
}

/** Build the High-Threat event associated with a specific Match Dungeon id. */
export function buildHighThreatEvent(userId: string, matchId: string, threatScore: number): MonarchEvent | null {
  if (!matchId || !isHighThreatScore(threatScore)) return null;
  return {
    id: highThreatEventId(userId, matchId),
    type: "HIGH_THREAT_MATCH",
    userId,
    title: "THREAT RATING: " + Math.round(threatScore) + "%",
    subtitle: "CRITICAL THREAT",
    primaryValue: `${Math.round(threatScore)}%`,
    previousValue: undefined,
    newValue: Math.round(threatScore),
    description: "High-risk containment engaged.",
    icon: "skull",
    occurredAt: Date.now(),
  };
}