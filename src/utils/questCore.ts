import { PracticeQuest } from "../types";

/**
 * questCore.ts
 *
 * Single authoritative home for the quest-requirement system used by both the
 * Quest Database (creation/normalization/validation) and the Evolution Chamber
 * (live progress + final evaluation).
 *
 * The Evolution Chamber must NOT guess what a quest requires from title,
 * description, overs alone, or EXECUTED button presses. These helpers derive
 * the canonical success definition from the normalized `requirements` object.
 */

/** Minimal structural shape of an Evolution Chamber delivery used to test
 * whether it qualifies toward a quest's objective. Kept small so this module
 * does not import component types (avoids circular imports). */
export interface QuestDeliveryLike {
  length?: string;
  runsConceded?: number;
  isExtra?: boolean;
  isWicket?: boolean;
  skillName?: string;
  extraType?: string;
}

/** Canonical, machine-readable understanding of what a quest requires. */
export interface QuestSuccessDefinition {
  target: number; // number of qualifying deliveries required
  qualifyingOutcomes: string[]; // human labels, e.g. ["Perfect Ball"]
  completionRule: string;
  maximumOvers: number;
  maximumAttempts: number; // total ball window
  conditions: { label: string; met: boolean }[]; // special conditions (runs cap, no extras, etc.)
}

/** Map a requirement's own objective keywords back to a canonical target. */
export function getQuestSuccessTarget(req: PracticeQuest["requirements"]): number {
  if (req.targetSuccessCount !== undefined && req.targetSuccessCount > 0) return req.targetSuccessCount;
  if (req.perfectBallsNeeded !== undefined && req.perfectBallsNeeded > 0) return req.perfectBallsNeeded;
  if (req.closeOrBetterNeeded !== undefined && req.closeOrBetterNeeded > 0) return req.closeOrBetterNeeded;
  if (req.dotBallsNeeded !== undefined && req.dotBallsNeeded > 0) return req.dotBallsNeeded;
  if (req.wicketsNeeded !== undefined && req.wicketsNeeded > 0) return req.wicketsNeeded;
  if (req.consecutivePerfectBalls !== undefined && req.consecutivePerfectBalls > 0) return req.consecutivePerfectBalls;
  if (req.skillsSpecificWickets !== undefined) {
    const sum = Object.values(req.skillsSpecificWickets).reduce((a, b) => a + (Number(b) || 0), 0);
    if (sum > 0) return sum;
  }
  return 0;
}

/** Human-readable labels for which landing outcomes qualify for the quest. */
export function getQualifyingConditionLabel(req: PracticeQuest["requirements"]): string[] {
  const out: string[] = [];
  if (req.closeOrBetterNeeded !== undefined && req.closeOrBetterNeeded > 0) out.push("Close or Better");
  if (req.perfectBallsNeeded !== undefined && req.perfectBallsNeeded > 0) out.push("Perfect Ball");
  if (req.dotBallsNeeded !== undefined && req.dotBallsNeeded > 0) out.push("Dot Ball");
  if (req.wicketsNeeded !== undefined && req.wicketsNeeded > 0) out.push("Wicket");
  if (req.skillsSpecificWickets !== undefined) out.push("Skill-specific Wicket");
  if (req.consecutivePerfectBalls !== undefined && req.consecutivePerfectBalls > 0) out.push("Consecutive Perfect Ball");
  if (out.length === 0) out.push("Perfect Ball");
  return out;
}

/**
 * Whether a single delivery qualifies toward the quest's success objective.
 *
 * Qualification is decided ONLY by the actual landing outcome (authoritative),
 * never by whether the player pressed EXECUTED or MISSED when assessing the
 * delivery. See the EXECUTION ASSESSMENT design: execution answers "did the
 * player execute it?", landing answers "how good was it?", and only the quest
 * evaluator decides whether that landing qualifies.
 */
export function isQualifyingDelivery(req: PracticeQuest["requirements"], log: QuestDeliveryLike): boolean {
  if (log.isExtra) {
    // Extra deliveries (wides / no-balls) never count toward a qualifying
    // objective unless a quest explicitly opts them in. No quest does today.
    return false;
  }

  if (req.closeOrBetterNeeded !== undefined && req.closeOrBetterNeeded > 0 &&
      (log.length === "Perfect Ball" || log.length === "Close Ball")) {
    return true;
  }
  if (req.perfectBallsNeeded !== undefined && req.perfectBallsNeeded > 0 &&
      log.length === "Perfect Ball") {
    return true;
  }
  if (req.dotBallsNeeded !== undefined && req.dotBallsNeeded > 0 &&
      (!log.isExtra) && (log.runsConceded ?? 0) === 0) {
    return true;
  }
  if (req.wicketsNeeded !== undefined && req.wicketsNeeded > 0 && log.isWicket) {
    return true;
  }
  if (req.consecutivePerfectBalls !== undefined && req.consecutivePerfectBalls > 0 &&
      log.length === "Perfect Ball") {
    return true;
  }
  if (req.skillsSpecificWickets !== undefined) {
    const requiredSkills = Object.keys(req.skillsSpecificWickets).filter((k) => (req.skillsSpecificWickets![k] ?? 0) > 0);
    if (requiredSkills.length > 0 && log.isWicket && log.skillName &&
        requiredSkills.some((s) => s.toUpperCase() === (log.skillName || "").toUpperCase())) {
      return true;
    }
  }
  // No specific qualifying condition was defined but a target success count
  // exists (legacy / generic "Land N perfect balls" quests). Default the
  // qualifying landing to the strictest outcome — Perfect Ball — which is the
  // same default the quest info panel displays.
  if (req.targetSuccessCount !== undefined && req.targetSuccessCount > 0) {
    return log.length === "Perfect Ball";
  }
  return false;
}

/** Count how many logged deliveries qualify toward the quest objective. */
export function computeQualifyingSuccessCount(
  req: PracticeQuest["requirements"],
  logs: QuestDeliveryLike[]
): number {
  return (logs || []).filter((log) => isQualifyingDelivery(req, log)).length;
}

/** Derive the full canonical success definition for a quest. */
export function getQuestSuccessDefinition(quest: PracticeQuest | null): QuestSuccessDefinition {
  const req = quest?.requirements || {};
  const target = getQuestSuccessTarget(req);
  const overs = Number(quest?.maximumOvers || quest?.overs || quest?.oversLength || req.oversMin || 2);
  const maxAttempts = Number(
    quest?.maximumAttempts || quest?.maxBalls || req.maxBalls || (overs * 6)
  );
  const qualCount = Object.keys(req).filter(
    (k) => k !== "oversMin" && k !== "noWidesOrNoBalls" &&
      (req[k] !== undefined && req[k] !== false && Number(req[k] ?? 0) > 0)
  ).length;
  const completionRule = quest?.completionRule || (qualCount > 1 ? "MULTI_CONDITION" : "TOTAL_SUCCESSES");

  const conditions: { label: string; met: boolean }[] = [];
  if (req.runsMaxLte !== undefined && req.runsMaxLte > 0) conditions.push({ label: `Concede ≤ ${req.runsMaxLte} runs`, met: true });
  if (req.noWidesOrNoBalls) conditions.push({ label: "No wides / no-balls", met: true });
  if (req.oversMin !== undefined && req.oversMin > 0) conditions.push({ label: `Span ${req.oversMin}+ overs`, met: true });

  return {
    target,
    qualifyingOutcomes: getQualifyingConditionLabel(req),
    completionRule,
    maximumOvers: overs,
    maximumAttempts: maxAttempts,
    conditions
  };
}

/**
 * Normalize a quest into the canonical structure.
 *
 * Legacy quests may lack the new explicit fields (targetSuccessCount, maxBalls,
 * maximumAttempts, maximumOvers, completionRule). Where an explicit value is
 * absent we derive a safe, consistent fallback — but we NEVER overwrite an
 * explicit value with an inferred one.
 */
export function normalizeQuestDefinition(quest: PracticeQuest): PracticeQuest {
  const out = { ...quest };
  const req = out.requirements || {};
  const overs = Number(out.overs || out.oversLength || out.maximumOvers || req.oversMin || 2);
  const maxBalls = Number(out.maxBalls || out.maximumAttempts || req.maxBalls || (overs * 6));
  const target = getQuestSuccessTarget(req);
  const qualCount = Object.keys(req).filter(
    (k) => k !== "oversMin" && k !== "noWidesOrNoBalls" &&
      (req[k] !== undefined && req[k] !== false && Number(req[k] ?? 0) > 0)
  ).length;

  out.requirements = { ...req, oversMin: req.oversMin ?? overs, maxBalls: req.maxBalls ?? maxBalls };
  out.overs ??= overs;
  out.oversLength ??= overs;
  out.maximumOvers ??= overs;
  out.maxBalls ??= maxBalls;
  out.maximumAttempts ??= maxBalls;
  out.targetSuccessCount ??= target;
  if (!out.completionRule) {
    out.completionRule = qualCount > 1 ? "MULTI_CONDITION" : "TOTAL_SUCCESSES";
  }
  // Push the canonical target down into requirements too when it was inferred,
  // so the chamber evaluator has one authoritative value everywhere.
  if (req.targetSuccessCount === undefined && target > 0 && out.requirements.targetSuccessCount === undefined) {
    out.requirements.targetSuccessCount = target;
  }
  return out;
}

/**
 * Validate a quest definition and return a list of human-readable errors.
 * An empty array means the quest is valid. A malformed quest must never
 * silently become SUCCESS — callers must treat non-empty errors as a hard fail.
 */
export function validateQuestDefinition(quest: PracticeQuest): string[] {
  const errors: string[] = [];

  if (!quest.name || !String(quest.name).trim()) errors.push("Title is missing.");
  if (!quest.description || !String(quest.description).trim()) errors.push("Description is missing.");

  if (quest.type === "CHAMBER_NET") {
    if (!quest.skillId && !quest.skillName) errors.push("Skill is missing for this practice quest.");
  }

  const req = quest.requirements || {};
  const overs = Number(quest.maximumOvers || quest.overs || quest.oversLength || req.oversMin || 2);
  const maxBalls = Number(quest.maximumAttempts || quest.maxBalls || req.maxBalls || (overs * 6));
  if (maxBalls <= 0) {
    errors.push(`Total balls / maximum attempts must be greater than 0 (got ${maxBalls}).`);
  }

  const target = getQuestSuccessTarget(req);
  if (target < 0) {
    errors.push("To-be-executed / target success count cannot be negative.");
  }

  // Only CHAMBER_NET quests use "N qualifying balls within a ball window".
  // Match-sim / dungeon quests use runs/wickets economy where this constraint
  // does not apply.
  if (quest.type === "CHAMBER_NET" && target > 0 && maxBalls > 0 && target > maxBalls) {
    errors.push(`To-be-executed (${target}) exceeds total balls (${maxBalls}) — impossible requirement.`);
  }

  if (
    quest.completionRule &&
    !["TOTAL_SUCCESSES", "PER_OVER", "MULTI_CONDITION"].includes(quest.completionRule)
  ) {
    errors.push(`Invalid completion rule: ${quest.completionRule}.`);
  }

  if (
    target === 0 &&
    !Object.keys(req).some((k) => k !== "oversMin" && k !== "noWidesOrNoBalls" && req[k] !== undefined && req[k] !== false && Number(req[k] ?? 0) > 0)
  ) {
    errors.push("No measurable success criteria defined.");
  }

  return errors;
}