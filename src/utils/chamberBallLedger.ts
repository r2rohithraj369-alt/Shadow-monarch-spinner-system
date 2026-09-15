/**
 * chamberBallLedger.ts
 * ---------------------------------------------------------------------------
 * ATOMIC BALL FINALIZATION LEDGER for the Evolution Chamber.
 *
 * A delivery is NOT a completed ball merely because it was "logged". A ball
 * becomes a COMPLETE BALL RECORD — and may enter the authoritative
 * completed-delivery ledger — only when ALL FOUR pieces of information exist:
 *
 *   1. skill / variation bowled
 *   2. length / landing quality
 *   3. EXECUTED / MISSED quest execution assessment (explicitly chosen)
 *   4. the actual ball outcome (explicitly recorded)
 *
 * Every ball is finalized through ONE call to finalizeBall(). That call
 * validates the draft and returns the complete record; the caller appends
 * EXACTLY that record to the current-session ledger and derives every counter
 * (completed balls, executed, missed, qualification, quest verdict) from the
 * ledger via deriveBallProgress(). There is never a second "assessment" pass
 * that patches a record after it has already been counted.
 */

export type QuestExecutionStatus = "EXECUTED" | "MISSED";

/** The actual ball outcome (never inferred by the ledger — always supplied). */
export interface BallOutcome {
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

/**
 * A COMPLETE ball record — the only shape that ever enters the session ledger.
 * `executionStatus` is null ONLY for plain (non-quest) training sessions, where
 * an EXECUTED/MISSED assessment is not part of the drill.
 */
export interface CompletedDelivery extends BallOutcome {
  over: number;
  ballNum: number;
  skillId: string;
  skillName: string;
  length: string;
  xp: number;
  executionStatus: QuestExecutionStatus | null;
  executionAssessedAt?: string;
}

/** The in-progress ball (currentBallDraft) handed to finalizeBall(). */
export interface BallDraft {
  skillId: string;
  skillName: string;
  length: string;
  executionStatus: QuestExecutionStatus | null;
  outcome: BallOutcome;
}

/** Context supplied by the chamber for the ball being finalized. */
export interface BallFinalizationContext {
  over: number;
  ballNum: number;
  xp: number;
  /** Quest sessions REQUIRE the EXECUTED/MISSED assessment. */
  requireExecution: boolean;
  /** Injectable timestamp (deterministic tests). */
  assessedAt?: string;
}

/**
 * Result of the single ball-finalization path. `delivery` is present only when
 * `ok` is true; `error` only when `ok` is false.
 */
export interface BallFinalizationResult {
  ok: boolean;
  delivery?: CompletedDelivery;
  error?: string;
}

export function isQuestExecutionStatus(value: unknown): value is QuestExecutionStatus {
  return value === "EXECUTED" || value === "MISSED";
}

/**
 * THE single ball-finalization path.
 *
 * Validates that every required piece of the ball is present and returns the
 * one complete record to append to the ledger. Nothing is returned (and
 * therefore nothing can be counted) if any piece is missing.
 */
export function finalizeBall(
  draft: BallDraft,
  context: BallFinalizationContext
): BallFinalizationResult {
  if (!draft || !draft.skillId || !draft.skillName) {
    return { ok: false, error: "SELECT TARGET SPINNER KINETIC VARIATION FIRST." };
  }
  if (!draft.length) {
    return { ok: false, error: "SELECT THE PITCH DELIVERY LANDING LENGTH FIRST." };
  }
  if (context.requireExecution && !isQuestExecutionStatus(draft.executionStatus)) {
    return { ok: false, error: "SELECT EXECUTED OR MISSED FOR THIS DELIVERY BEFORE FINALIZING THE BALL." };
  }
  if (!draft.outcome) {
    return { ok: false, error: "RECORD THE ACTUAL BALL OUTCOME BEFORE FINALIZING THE BALL." };
  }

  const assessment = isQuestExecutionStatus(draft.executionStatus) ? draft.executionStatus : null;

  const delivery: CompletedDelivery = {
    over: context.over,
    ballNum: context.ballNum,
    skillId: draft.skillId,
    skillName: draft.skillName,
    length: draft.length,
    xp: context.xp,
    ...draft.outcome,
    executionStatus: assessment,
    executionAssessedAt: assessment ? (context.assessedAt || new Date().toISOString()) : undefined,
  };

  return { ok: true, delivery };
}

/**
 * TRUE only when the record carries all four required pieces. Logged-only
 * records (no execution assessment / incomplete outcome) return FALSE for quest
 * sessions, so they can never be counted as completed balls.
 */
export function isCompleteBallRecord(
  record: Partial<CompletedDelivery> | null | undefined,
  requireExecution = false
): boolean {
  if (!record) return false;
  if (!record.skillId || !record.skillName) return false;
  if (!record.length) return false;
  if (!Number.isFinite(record.runsConceded)) return false;
  if (typeof record.isWicket !== "boolean") return false;
  if (record.extraType !== "WIDE" && record.extraType !== "NO_BALL" && record.extraType !== "NONE") return false;
  if (requireExecution && !isQuestExecutionStatus(record.executionStatus)) return false;
  return true;
}

export interface BallProgress {
  /** Records physically present in the current-session ledger. */
  loggedDeliveries: number;
  /** Records satisfying ALL FOUR required pieces — the only countable balls. */
  completedBalls: number;
  executed: number;
  missed: number;
  /** Logged but still missing the EXECUTED/MISSED assessment. */
  pendingExecutionAssessment: number;
}

/**
 * Derives the session ball progress from the FINALIZED ledger records. This is
 * the only source of the completed/executed/missed counters — never a stale
 * React state value captured before the current ball was finalized.
 */
export function deriveBallProgress(
  records: ReadonlyArray<CompletedDelivery>,
  requireExecution = false
): BallProgress {
  const safeRecords = Array.isArray(records) ? records : [];
  const executed = safeRecords.filter((r) => r.executionStatus === "EXECUTED").length;
  const missed = safeRecords.filter((r) => r.executionStatus === "MISSED").length;
  const completedBalls = safeRecords.filter((r) => isCompleteBallRecord(r, requireExecution)).length;
  return {
    loggedDeliveries: safeRecords.length,
    completedBalls,
    executed,
    missed,
    pendingExecutionAssessment: Math.max(0, safeRecords.length - completedBalls),
  };
}