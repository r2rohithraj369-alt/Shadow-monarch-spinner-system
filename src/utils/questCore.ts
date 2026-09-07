import { PracticeQuest, QuestFailureCondition, QuestQualifyingCondition } from "../types";

/**
 * questCore.ts
 *
 * Single authoritative home for the quest-requirement system used by both the
 * Quest Database (creation/normalization/validation) and the Evolution Chamber
 * (live progress + final evaluation).
 *
 * CORE PRINCIPLE: The application must NEVER guess the quest objective from
 * title, description, category, arena, mode or natural-language wording.
 * The authoritative source is the explicit structured requirement block:
 *
 *   totalBalls           - the maximum attempt window
 *   executionRequired    - how many deliveries must be assessed via EXECUTED/MISSED
 *   successTarget        - how many qualifying landings are required
 *   qualifyingCondition  - WHICH landing outcomes qualify
 *   earlyCompletion      - complete immediately once the targets are met
 *   failureCondition     - explicit rule that turns the quest into FAILED
 *
 * Every stage (parser -> compiler -> validator -> normalizer -> storage ->
 * active quest -> session -> evaluation) must preserve this block untouched.
 * EXECUTED button presses NEVER count as qualifying successes, and a MISS is
 * NOT an automatic failure unless the explicit failure condition says so.
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
  // ---- Explicit structured logic (authoritative) ----
  executionRequired: number;
  successTarget: number;
  qualifyingCondition: QuestQualifyingCondition | null;
  earlyCompletion: boolean;
  failureCondition: QuestFailureCondition;
}

/** Canonical structured requirement block produced by normalization. */
export interface CanonicalQuestRequirements {
  totalBalls: number;
  executionRequired: number; // 0 means "no execution gate"
  successTarget: number;
  qualifyingCondition: QuestQualifyingCondition | null;
  earlyCompletion: boolean;
  failureCondition: QuestFailureCondition;
}

export const KNOWN_QUALIFYING_CONDITIONS: QuestQualifyingCondition[] = [
  "PERFECT",
  "CLOSE",
  "PERFECT_OR_CLOSE",
  "DOT_BALL",
  "WICKET",
];

export const KNOWN_FAILURE_CONDITIONS: QuestFailureCondition[] = [
  "WINDOW_EXHAUSTED",
  "NO_MISSES_ALLOWED",
];

export const QUALIFYING_CONDITION_LABELS: Record<QuestQualifyingCondition, string[]> = {
  PERFECT: ["Perfect Ball"],
  CLOSE: ["Close Ball"],
  PERFECT_OR_CLOSE: ["Perfect Ball", "Close Ball"],
  DOT_BALL: ["Dot Ball"],
  WICKET: ["Wicket"],
};

/** Map a human "Success Condition" phrase to its canonical code (null = unknown). */
export function parseQualifyingConditionPhrase(raw: string | null | undefined): QuestQualifyingCondition | null {
  if (!raw) return null;
  const t = String(raw).trim().toLowerCase();
  if (t.includes("perfect") && t.includes("close")) return "PERFECT_OR_CLOSE";
  if (t.includes("close or better")) return "PERFECT_OR_CLOSE";
  if (t.includes("close")) return "CLOSE";
  if (t.includes("perfect")) return "PERFECT";
  if (t.includes("dot")) return "DOT_BALL";
  if (t.includes("wicket")) return "WICKET";
  return null;
}

/** Map a human "Failure Condition" phrase to its canonical code (null = unknown). */
export function parseFailureConditionPhrase(raw: string | null | undefined): QuestFailureCondition | null {
  if (!raw) return null;
  const t = String(raw).trim().toLowerCase();
  if (t.includes("no miss") || t.includes("misses allowed") || t.includes("without missing")) return "NO_MISSES_ALLOWED";
  if (t.includes("window")) return "WINDOW_EXHAUSTED";
  if (t.includes("exhausted")) return "WINDOW_EXHAUSTED";
  return null;
}
/* ------------------------------------------------------------------ */
/* Legacy -> canonical deterministic mapping                            */
/* ------------------------------------------------------------------ */

/** Deterministic mapping of the legacy requirement keys to a qualifying condition. */
export function getLegacyQualifyingCondition(req: PracticeQuest["requirements"]): QuestQualifyingCondition | null {
  if (req.perfectBallsNeeded !== undefined && Number(req.perfectBallsNeeded) > 0) return "PERFECT";
  if (req.closeOrBetterNeeded !== undefined && Number(req.closeOrBetterNeeded) > 0) return "PERFECT_OR_CLOSE";
  if (req.consecutivePerfectBalls !== undefined && Number(req.consecutivePerfectBalls) > 0) return "PERFECT";
  if (req.dotBallsNeeded !== undefined && Number(req.dotBallsNeeded) > 0) return "DOT_BALL";
  if (req.wicketsNeeded !== undefined && Number(req.wicketsNeeded) > 0) return "WICKET";
  if (req.skillsSpecificWickets !== undefined) {
    const sum = Object.values(req.skillsSpecificWickets).reduce((a, b) => a + (Number(b) || 0), 0);
    if (sum > 0) return "WICKET";
  }
  return null;
}

/** Map a requirement's own objective keywords back to a canonical target.
 *  Explicit structured fields win; legacy keys are a deterministic fallback. */
export function getQuestSuccessTarget(req: PracticeQuest["requirements"]): number {
  if (req.successTarget !== undefined && req.successTarget > 0) return req.successTarget;
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

/** How many deliveries the quest demands to be assessed via EXECUTED/MISSED.
 *  0 means the quest does not enforce an execution gate. */
export function getQuestExecutionRequirement(req: PracticeQuest["requirements"]): number {
  if (req.executionRequired !== undefined && req.executionRequired > 0) return req.executionRequired;
  return 0;
}

/** Human-readable labels for which landing outcomes qualify for the quest.
 *  No guessing: unknown conditions resolve to an empty list. */
export function getQualifyingConditionLabel(req: PracticeQuest["requirements"]): string[] {
  const explicit = req.qualifyingCondition;
  if (explicit && KNOWN_QUALIFYING_CONDITIONS.includes(explicit)) {
    return QUALIFYING_CONDITION_LABELS[explicit];
  }
  const legacy = getLegacyQualifyingCondition(req);
  if (legacy) return QUALIFYING_CONDITION_LABELS[legacy];
  if (req.targetSuccessCount !== undefined && req.targetSuccessCount > 0) {
    // A bare targetSuccessCount without any known qualifying condition is NOT
    // enough information to determine what qualifies. Explicitly refuse to
    // guess by returning an empty label list.
    return [];
  }
  return [];
}

/**
 * Whether a single delivery qualifies toward the quest's success objective.
 *
 * Qualification is decided ONLY by the actual landing outcome (authoritative),
 * never by whether the player pressed EXECUTED or MISSED when assessing the
 * delivery, and never by guessing from the description.
 */
export function isQualifyingDelivery(req: PracticeQuest["requirements"], log: QuestDeliveryLike | null | undefined): boolean {
  if (!log) return false;
  if (log.isExtra) {
    // Extra deliveries (wides / no-balls) never count toward a qualifying
    // objective unless a quest explicitly opts them in. No quest does today.
    return false;
  }

  const explicit = req.qualifyingCondition;
  const condition: QuestQualifyingCondition | null =
    explicit && KNOWN_QUALIFYING_CONDITIONS.includes(explicit)
      ? explicit
      : getLegacyQualifyingCondition(req);

  if (!condition) {
    // No explicit/legacy qualifying condition could be resolved. Never guess.
    return false;
  }

  switch (condition) {
    case "PERFECT":
      return log.length === "Perfect Ball";
    case "CLOSE":
      return log.length === "Close Ball";
    case "PERFECT_OR_CLOSE":
      return log.length === "Perfect Ball" || log.length === "Close Ball";
    case "DOT_BALL":
      return (log.runsConceded ?? 0) === 0;
    case "WICKET":
      return !!log.isWicket;
    default:
      return false;
  }
}

/** Count how many logged deliveries qualify toward the quest objective. */
export function computeQualifyingSuccessCount(
  req: PracticeQuest["requirements"],
  logs: QuestDeliveryLike[] | null | undefined
): number {
  return (logs || []).filter((log) => isQualifyingDelivery(req, log)).length;
}

/**
 * Read the single authoritative canonical requirement block for a quest.
 *
 * Priority is ALWAYS: explicit structured field > legacy key (deterministic
 * mapping) > deterministic safe default. Nothing here reads the description
 * or the title.
 */
export function getCanonicalQuestRequirements(quest: PracticeQuest | null | undefined): CanonicalQuestRequirements {
  const req = quest?.requirements || {};
  const overs = Number(quest?.overs || quest?.oversLength || quest?.maximumOvers || req.oversMin || 2);

  const totalBalls = Number(
    req.totalBalls ||
    quest?.totalBalls ||
    quest?.maxBalls ||
    quest?.maximumAttempts ||
    req.maxBalls ||
    (overs * 6)
  );

  const successTarget = getQuestSuccessTarget(req);
  const executionRequired = getQuestExecutionRequirement(req);

  const qualifyingConditionRaw =
    req.qualifyingCondition ||
    quest?.qualifyingCondition ||
    getLegacyQualifyingCondition(req) ||
    null;
  const qualifyingCondition: QuestQualifyingCondition | null =
    qualifyingConditionRaw && KNOWN_QUALIFYING_CONDITIONS.includes(qualifyingConditionRaw)
      ? qualifyingConditionRaw
      : null;

  const earlyCompletion =
    req.earlyCompletion ?? quest?.earlyCompletion ?? true;

  const failureConditionRaw =
    req.failureCondition ||
    quest?.failureCondition ||
    "WINDOW_EXHAUSTED";
  const failureCondition: QuestFailureCondition =
    KNOWN_FAILURE_CONDITIONS.includes(failureConditionRaw) ? failureConditionRaw : "WINDOW_EXHAUSTED";

  return {
    totalBalls,
    executionRequired,
    successTarget,
    qualifyingCondition,
    earlyCompletion,
    failureCondition,
  };
}

/** Derive the full canonical success definition for a quest (display friendly). */
export function getQuestSuccessDefinition(quest: PracticeQuest | null | undefined): QuestSuccessDefinition {
  const req = quest?.requirements || {};
  const canon = getCanonicalQuestRequirements(quest);
  const overs = Number(quest?.maximumOvers || quest?.overs || quest?.oversLength || req.oversMin || 2);

  const qualCount = Object.keys(req).filter(
    (k) => k !== "oversMin" && k !== "noWidesOrNoBalls" &&
      k !== "totalBalls" && k !== "executionRequired" && k !== "successTarget" &&
      k !== "qualifyingCondition" && k !== "earlyCompletion" && k !== "failureCondition" &&
      (req[k] !== undefined && req[k] !== false && Number(req[k] ?? 0) > 0)
  ).length;
  const completionRule = quest?.completionRule || (qualCount > 1 ? "MULTI_CONDITION" : "TOTAL_SUCCESSES");

  const conditions: { label: string; met: boolean }[] = [];
  if (req.runsMaxLte !== undefined && req.runsMaxLte > 0) conditions.push({ label: `Concede ≤ ${req.runsMaxLte} runs`, met: true });
  if (req.noWidesOrNoBalls) conditions.push({ label: "No wides / no-balls", met: true });
  if (req.oversMin !== undefined && req.oversMin > 0) conditions.push({ label: `Span ${req.oversMin}+ overs`, met: true });

  return {
    target: canon.successTarget,
    qualifyingOutcomes: getQualifyingConditionLabel(req),
    completionRule,
    maximumOvers: overs,
    maximumAttempts: canon.totalBalls,
    conditions,
    executionRequired: canon.executionRequired,
    successTarget: canon.successTarget,
    qualifyingCondition: canon.qualifyingCondition,
    earlyCompletion: canon.earlyCompletion,
    failureCondition: canon.failureCondition,
  };
}
/**
 * Normalize a quest into the canonical structure.
 *
 * The explicit structured block (totalBalls / executionRequired / successTarget
 * / qualifyingCondition / earlyCompletion / failureCondition) is written BOTH
 * into requirements (authoritative) and mirrored at the top level. Explicit
 * values ALWAYS win; legacy keys are mapped deterministically; nothing is
 * guessed from the description or title.
 */
export function normalizeQuestDefinition(quest: PracticeQuest): PracticeQuest {
  const out = { ...quest } as PracticeQuest;
  const req = { ...(out.requirements || {}) };
  const overs = Number(out.overs || out.oversLength || out.maximumOvers || req.oversMin || 2);
  const maxBalls = Number(req.totalBalls || out.totalBalls || out.maxBalls || out.maximumAttempts || req.maxBalls || (overs * 6));
  const target = getQuestSuccessTarget(req);
  const executionRequired = getQuestExecutionRequirement(req);
  const qualifyingCondition = getCanonicalQuestRequirements(out).qualifyingCondition;
  const earlyCompletion = getCanonicalQuestRequirements(out).earlyCompletion;
  const failureCondition = getCanonicalQuestRequirements(out).failureCondition;

  // Canonical block — write explicitly into requirements (authoritative)
  req.totalBalls = maxBalls;
  req.maxBalls = maxBalls;
  req.oversMin = req.oversMin ?? overs;
  if (req.successTarget === undefined) {
    req.targetSuccessCount = target;
    if (target > 0) req.successTarget = target;
  } else {
    req.targetSuccessCount = req.targetSuccessCount ?? req.successTarget;
  }
  if (req.executionRequired === undefined && executionRequired > 0) req.executionRequired = executionRequired;
  if (req.qualifyingCondition === undefined && qualifyingCondition) req.qualifyingCondition = qualifyingCondition;
  if (req.earlyCompletion === undefined) req.earlyCompletion = earlyCompletion;
  if (req.failureCondition === undefined) req.failureCondition = failureCondition;

  out.requirements = req;

  // Mirrors at the top level
  out.overs ??= overs;
  out.oversLength ??= overs;
  out.maximumOvers ??= overs;
  out.maxBalls = maxBalls;
  out.maximumAttempts = maxBalls;
  out.totalBalls = maxBalls;
  out.targetSuccessCount = target;
  out.successTarget = target;
  out.executionRequired = executionRequired;
  if (qualifyingCondition) out.qualifyingCondition = qualifyingCondition;
  out.earlyCompletion = earlyCompletion;
  out.failureCondition = failureCondition;

  if (!out.completionRule) {
    const qualCount = Object.keys(req).filter(
      (k) => k !== "oversMin" && k !== "noWidesOrNoBalls" &&
        k !== "totalBalls" && k !== "executionRequired" && k !== "successTarget" &&
        k !== "qualifyingCondition" && k !== "earlyCompletion" && k !== "failureCondition" &&
        (req[k] !== undefined && req[k] !== false && Number(req[k] ?? 0) > 0)
    ).length;
    out.completionRule = qualCount > 1 ? "MULTI_CONDITION" : "TOTAL_SUCCESSES";
  }
  return out;
}
/**
 * Validate a quest definition and return a list of human-readable errors.
 * An empty array means the quest is valid. A malformed quest must never
 * silently become SUCCESS — callers must treat non-empty errors as a hard fail.

 * CHAMBER_NET quests are validated strictly against the explicit structured
 * block: Total Balls, Required Successes, Success Condition must all be
 * present and consistent. Ambiguous legacy quests are rejected rather than
 * silently guessed.
 */
export function validateQuestDefinition(quest: PracticeQuest): string[] {
  const errors: string[] = [];

  if (!quest.name || !String(quest.name).trim()) errors.push("Title is missing.");
  if (!quest.description || !String(quest.description).trim()) errors.push("Description is missing.");

  if (quest.type === "CHAMBER_NET") {
    if (!quest.skillId && !quest.skillName) errors.push("Skill is missing for this practice quest.");
  }

  const req = quest.requirements || {};
  const canon = getCanonicalQuestRequirements(quest);
  const target = canon.successTarget;

  const executionRequired = canon.executionRequired;



  const totalBalls = canon.totalBalls;

  const legacyKeysPresent = getLegacyQualifyingCondition(req) !== null;

  if (quest.type === "CHAMBER_NET") {

    // --- Strict structured validation for window quests (Net Drill) ---
    if (!(Number(totalBalls) > 0)) {
      errors.push(`Total Balls must be greater than 0 (got ${totalBalls}).`);
    }
    if (!(Number(target) > 0)) {
      errors.push("Required Successes is missing or must be greater than 0.");
    }
    if (Number(target) < 0) {
      errors.push(`Required Successes cannot be negative (got ${target}).`);
    }
    if (executionRequired < 0) {
      errors.push(`To Be Executed cannot be negative (got ${executionRequired}).`);
    }
    if (!canon.qualifyingCondition && !legacyKeysPresent) {

      if (req.targetSuccessCount !== undefined && req.targetSuccessCount > 0) {
        errors.push("Missing Success Condition — a generic success count alone cannot define what qualifies.");
      } else {
        errors.push("Missing Success Condition.");
      }
    }
    if (Number(target) > 0 && Number(totalBalls) > 0 && target > totalBalls) {
      errors.push(`Required Successes (${target}) exceeds Total Balls (${totalBalls}) — impossible requirement.`);
    }
    if (executionRequired > 0 && Number(totalBalls) > 0 && executionRequired > totalBalls) {
      errors.push(`To Be Executed (${executionRequired}) exceeds Total Balls (${totalBalls}) — impossible requirement.`);
    }
  } else {
    // --- Legacy validation for match-sim / dungeon economy quests ---
    if (Number(totalBalls) <= 0) {
      errors.push(`Total balls / maximum attempts must be greater than 0 (got ${totalBalls}).`);
    }
    if (target < 0) {
      errors.push("To-be-executed / target success count cannot be negative.");
    }
  }

  if (
    quest.completionRule &&
    !["TOTAL_SUCCESSES", "PER_OVER", "MULTI_CONDITION"].includes(quest.completionRule)
  ) {
    errors.push(`Invalid completion rule: ${quest.completionRule}.`);
  }

  const hasAnyMeasurable =
    getQuestSuccessTarget(req) > 0 ||
    req.perfectBallsNeeded !== undefined ||
    req.closeOrBetterNeeded !== undefined ||
    req.wicketsNeeded !== undefined ||
    req.runsMaxLte !== undefined ||
    req.dotBallsNeeded !== undefined ||
    req.skillsSpecificWickets !== undefined ||
    req.consecutivePerfectBalls !== undefined;

  if (!hasAnyMeasurable && quest.type !== "CHAMBER_NET") {
    errors.push("No measurable success criteria defined.");
  }

  return errors;
}
/**
 * Player-facing instructions generated ONLY from the structured requirement
 * block. The description is explanatory text and is never used here.
 */
export function getQuestInstructionLines(quest: PracticeQuest | null | undefined): string[] {
  if (!quest) return [];
  const canon = getCanonicalQuestRequirements(quest);
  const labels = getQualifyingConditionLabel(quest.requirements || {});
  const labelStr = labels.length > 0 ? labels.join(" or ") : "qualifying";
  const skill = (quest.skillName || "").trim() || "your active variation";
  const lines: string[] = [];

  if (canon.totalBalls > 0) {
    lines.push(`Bowl up to ${canon.totalBalls} ${skill} deliveries.`);
  }
  if (canon.executionRequired > 0) {
    lines.push(`Execute at least ${canon.executionRequired} deliveries.`);
  }
  if (canon.successTarget > 0) {
    lines.push(`Achieve ${canon.successTarget} ${labelStr} landings.`);
  }
  if (canon.failureCondition === "NO_MISSES_ALLOWED") {
    lines.push("A missed delivery fails the quest immediately.");
  } else {
    lines.push("A missed delivery does not automatically fail the quest.");
  }
  if (canon.earlyCompletion) {
    lines.push(`Complete as soon as ${canon.successTarget} qualifying deliveries are reached, even before the ${canon.totalBalls}-ball window ends.`);
  } else {
    lines.push("Continue until the required success target is reached or the attempt window is exhausted.");
  }

  return lines.filter(Boolean);
}

/** Final performance snapshot fed into the authoritative final evaluation. */
export interface QuestFinalPerformance {
  qualifyingSuccess: number;
  executed: number;
  missed: number;
  totalDeliveries: number;
}

export interface QuestFinalVerdict {
  result: "SUCCESS" | "FAILED";
  reason: string;
  failures: string[];
  canon: CanonicalQuestRequirements;
}

/**
 * The single canonical final evaluation for window quests (CHAMBER_NET).
 *
 * SUCCESS requires:
 *   - qualifying success count >=successTarget
 *   - executed count >=executionRequired  (when a gate exists)
 *   - the explicit failure condition is not triggered
 *
 * A MISS is never an automatic failure unless failureCondition is
 * NO_MISSES_ALLOWED. Early completion does not change the math: if both
 * targets are met the quest succeeds; otherwise the attempt window decides.
 */
export function evaluateFinalQuestResult(
  quest: PracticeQuest | null | undefined,
  perf: QuestFinalPerformance
): QuestFinalVerdict {

  const canon = getCanonicalQuestRequirements(quest);
  const failures: string[] = [];
  const labels = getQualifyingConditionLabel(quest?.requirements || {});
  const labelStr = labels.length > 0 ? labels.join(" / ") : "qualifying";

  if (canon.successTarget > 0 && perf.qualifyingSuccess < canon.successTarget) {
    failures.push(
      `Required ${canon.successTarget} ${labelStr} deliveries, achieved ${perf.qualifyingSuccess}.`
    );
  }
  if (canon.executionRequired > 0 && perf.executed < canon.executionRequired) {
    failures.push(
      `Required ${canon.executionRequired} executed deliveries, only ${perf.executed} assessed as EXECUTED.`
    );
  }
  if (canon.failureCondition === "NO_MISSES_ALLOWED" && perf.missed > 0) {
    failures.push(`Quest forbids missed deliveries — ${perf.missed} deliveries assessed as MISSED.`);
  }

  const met = failures.length === 0;
  const reason =
    met
      ? `All structured requirements satisfied (${canon.successTarget} ${labelStr}; ${canon.executionRequired} executed).`
      : failures.join(" ");

  return { result: met ? "SUCCESS" : "FAILED", reason, failures, canon };
}

/** Live session status derived strictly from the structured requirements. */
export type QuestLiveStatus = "ACTIVE" | "SUCCESS" | "FAILED";

export interface QuestLiveEvaluation {
  status: QuestLiveStatus;
  reason: string;
  isImpossible: boolean;
  earlySuccess: boolean;
}

/**
 * Live (per-ball) evaluation used by the Evolution Chamber.
 *
 * - Early success: all mandatory requirements satisfied AND earlyCompletion
 *   is enabled -> SUCCESS immediately (do not force the remaining balls).
 * - Impossible state: remaining balls cannot mathematically reach the
 *   success target -> FAILED (a miss alone NEVER triggers this).
 * - Window exhaustion without targets -> FAILED (only once the window is
 *   actually exhausted, i.e. totalDeliveries >= totalBalls).
 */
export function evaluateLiveQuestState(
  quest: PracticeQuest | null | undefined,
  perf: QuestFinalPerformance
): QuestLiveEvaluation {
  const canon = getCanonicalQuestRequirements(quest);
  const labels = getQualifyingConditionLabel(quest?.requirements || {});
  const labelStr = labels.length > 0 ? labels.join(" / ") : "qualifying";

  // A miss is an immediate failure ONLY under an explicit NO_MISSES_ALLOWED rule.
  if (canon.failureCondition === "NO_MISSES_ALLOWED" && perf.missed > 0) {
    return {
      status: "FAILED",
      reason: `Failure condition triggered: no misses allowed (${perf.missed} missed).`,
      isImpossible: false,
      earlySuccess: false,
    };
  }

  const successTargetMet = canon.successTarget <= 0 || perf.qualifyingSuccess >= canon.successTarget;
  const executionMet = canon.executionRequired <= 0 || perf.executed >= canon.executionRequired;

  // Early completion — all mandatory requirements already satisfied.
  if (canon.earlyCompletion && successTargetMet && executionMet && canon.successTarget > 0) {
    return {
      status: "SUCCESS",
      reason: `All requirements satisfied early (${perf.qualifyingSuccess}/${canon.successTarget} ${labelStr}).`,
      isImpossible: false,
      earlySuccess: true,
    };
  }

  // Impossible state — remaining deliveries cannot reach the success target.
  if (canon.totalBalls > 0 && canon.successTarget > 0) {
    const remaining = Math.max(0, canon.totalBalls - perf.totalDeliveries);
    if (successTargetMet === false && perf.qualifyingSuccess + remaining < canon.successTarget) {
      return {
        status: "FAILED",
        reason: `Impossible state: ${perf.qualifyingSuccess} ${labelStr} achieved, only ${remaining} delivery(ies) remain — cannot reach ${canon.successTarget}.`,
        isImpossible: true,
        earlySuccess: false,
      };
    }
  }

  // Window exhausted without the targets — explicit WINDOW_EXHAUSTED failure.
  if (
    canon.failureCondition === "WINDOW_EXHAUSTED" &&
    canon.totalBalls > 0 &&
    perf.totalDeliveries >= canon.totalBalls
  ) {
    if (!successTargetMet) {
      return {
        status: "FAILED",
        reason: `Attempt window exhausted: required ${canon.successTarget} ${labelStr}, achieved ${perf.qualifyingSuccess}.`,
        isImpossible: false,
        earlySuccess: false,
      };
    }
    if (!executionMet) {
      return {
        status: "FAILED",
        reason: `Attempt window exhausted: required ${canon.executionRequired} executions, achieved ${perf.executed}.`,
        isImpossible: false,
        earlySuccess: false,
      };
    }
  }

  return { status: "ACTIVE", reason: "", isImpossible: false, earlySuccess: false };
}