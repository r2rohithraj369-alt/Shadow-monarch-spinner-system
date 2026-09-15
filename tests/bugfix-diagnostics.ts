/**
 * Focused diagnostics for the two bugfixes (bulk compiler + final ball).
 * Run with: node node_modules/tsx/dist/cli.mjs tests/bugfix-diagnostics.ts
 */
import type { PracticeQuest } from "../src/types";
const g = globalThis as any;
if (!g.localStorage || typeof g.localStorage.getItem !== "function") {
  const map = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => { map.set(k, String(v)); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => { map.clear(); },
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
  };
}

const { parseBulkQuestsTextCore } = await import("../src/utils/questBulkCompiler");
const {
  evaluateLiveQuestState,
  evaluateFinalQuestResult,
  getCanonicalQuestRequirements,
} = await import("../src/utils/questCore");
const {
  finalizeBall,
  deriveBallProgress,
  isCompleteBallRecord,
} = await import("../src/utils/chamberBallLedger");
const {
  getPlayerHistoryCacheKey,
  purgePlayerScopedStorage,
  __resetBootOwnershipForTests,
} = await import("../src/utils/playerStorage");
const { buildResetProfile } = await import("../src/utils/gameResetManager");

function makeQuest(reqOverride: Partial<PracticeQuest["requirements"]> = {}, questOverride: Partial<PracticeQuest> = {}): PracticeQuest {
  return {
    id: "q-test",
    skillId: "s1",
    skillName: "Leg Break",
    name: "Test Quest",
    description: "Structured test quest",
    difficulty: "MEDIUM",
    xpReward: 100,
    masteryReward: 2,
    type: "CHAMBER_NET",
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
    requirements: {
      totalBalls: 12,
      executionRequired: 4,
      successTarget: 3,
      qualifyingCondition: "PERFECT",
      earlyCompletion: true,
      failureCondition: "WINDOW_EXHAUSTED",
      ...reqOverride,
    },
    ...questOverride,
  };
}

let failedCount = 0;
function check(name: string, cond: boolean, detail = "") {
  if (!cond) failedCount++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail ? "  => " + detail : ""}`);
}

// ---------------- ACCOUNT ISOLATION / RESET ----------------
localStorage.setItem(getPlayerHistoryCacheKey("account-a"), JSON.stringify([{ id: "a-report" }]));
localStorage.setItem(getPlayerHistoryCacheKey("account-b"), JSON.stringify([{ id: "b-report" }]));
purgePlayerScopedStorage();
check("ACCOUNT history caches purge on transition", !localStorage.getItem(getPlayerHistoryCacheKey("account-a")) && !localStorage.getItem(getPlayerHistoryCacheKey("account-b")));
const resetProfile = buildResetProfile(
  { questDatabase: [{ id: "permanent-1" }], pressureScenarios: [{ scenarioId: "pressure-1" }], resetGeneration: 3 },
  [{ id: "local-library-1" }],
  [{ scenarioId: "local-pressure-1" }]
);
check("ACCOUNT reset restores default progression and clears active state", resetProfile.player?.xp === 0 && resetProfile.player?.level === 0 && resetProfile.attributes.every((attribute: any) => attribute.value === 0) && resetProfile.activeQuestId === null && resetProfile.activePracticeQuestId === null);
check("ACCOUNT reset clears histories and pending quests", resetProfile.evolutionHistory.length === 0 && resetProfile.practiceQuests.length === 0);
check("ACCOUNT reset preserves permanent quest library", resetProfile.questDatabase.some((quest: any) => quest.id === "permanent-1"));
__resetBootOwnershipForTests();

// ---------------- BUG 1: BULK QUEST COMPILER ----------------
const bulkText = [
  "Title: The Length Funnel",
  "Description:",
  "Execute this exact 6-ball leg-break sequence.",
  "",
  "  Ball 1: Bowl a wide leg-break landing on a full length outside off.",
  "",
  "  Ball 2: Bowl a slightly shorter leg-break targeting the outside edge.",
  "",
  "  Ball 3: Bowl a fuller leg-break toward the pads.",
  "",
  "  Ball 4: Bowl a good-length leg-break around off stump.",
  "",
  "  Ball 5: Bowl a slightly shorter leg-break outside off.",
  "",
  "  Ball 6: Bowl a full-length leg-break targeting the stumps.",
  "",
  "Category: Practice",
  "Arena: Evolution Chamber",
  "Mode: T20 Variation Drill",
  "Overs: 1",
  "Skill: Leg Break",
  "Difficulty: Challenging",
  "Total Balls: 6",
  "To Be Executed: 6",
  "Required Successes: 6",
  "Success Condition: Perfect Ball, Close Ball, Just Short",
  "Early Completion: Disabled",
  "Failure Condition: Attempt Window Exhausted Without Required Successes",
].join("\n");

const parsed = parseBulkQuestsTextCore(bulkText, []);
check("BULK 1 quest ready (not 6 per Ball lines)", parsed.readyQuests.length === 1, `ready=${parsed.readyQuests.length}`);
const bulletParsed = parseBulkQuestsTextCore(
  bulkText.replace(/  Ball ([1-6]):/g, "• Ball $1:"),
  []
);
check(
  "BULK bullet characters remain description content",
  bulletParsed.readyQuests.length === 1 && bulletParsed.readyQuests[0].description.includes("• Ball 1:") && bulletParsed.readyQuests[0].description.includes("\n\n"),
  `ready=${bulletParsed.readyQuests.length}`
);
// ---------------- BUG 2: FINAL BALL ----------------
const sixBall = makeQuest(
  {
    totalBalls: 6,
    executionRequired: 6,
    successTarget: 6,
    qualifyingCondition: "PERFECT_OR_CLOSE",
    earlyCompletion: false,
    failureCondition: "WINDOW_EXHAUSTED",
  },
  { overs: 1 }
);
const canon = getCanonicalQuestRequirements(sixBall);
check("FB canon maxBalls=6", canon.totalBalls === 6, `maxBalls=${canon.totalBalls}`);

const b1to5 = evaluateLiveQuestState(sixBall, { qualifyingSuccess: 5, executed: 5, missed: 0, totalDeliveries: 5 });
check("FB balls 1-5 resolved -> ACTIVE (final ball remains)", b1to5.status === "ACTIVE", b1to5.status);

const b6successLive = evaluateLiveQuestState(sixBall, { qualifyingSuccess: 6, executed: 6, missed: 0, totalDeliveries: 6 });
const b6successFinal = evaluateFinalQuestResult(sixBall, { qualifyingSuccess: 6, executed: 6, missed: 0, totalDeliveries: 6 });
check("FB ball6 success live=ACTIVE (early off)", b6successLive.status === "ACTIVE", b6successLive.status);
check("FB ball6 final verdict=SUCCESS (closes session correctly)", b6successFinal.result === "SUCCESS", b6successFinal.result);

const b6fail = evaluateLiveQuestState(sixBall, { qualifyingSuccess: 5, executed: 6, missed: 0, totalDeliveries: 6 });
check("FB ball6 target unmet + window exhausted -> FAILED", b6fail.status === "FAILED", b6fail.status);

const tolerant = makeQuest(
  { totalBalls: 6, executionRequired: 0, successTarget: 3, qualifyingCondition: "PERFECT", earlyCompletion: false, failureCondition: "WINDOW_EXHAUSTED" },
  { overs: 1 }
);
const toler = evaluateFinalQuestResult(tolerant, { qualifyingSuccess: 3, executed: 5, missed: 1, totalDeliveries: 6 });
check("FB miss alone does NOT auto-fail WINDOW_EXHAUSTED quest", toler.result === "SUCCESS", toler.result);

const noMiss = makeQuest(
  { totalBalls: 6, executionRequired: 0, successTarget: 3, qualifyingCondition: "PERFECT", earlyCompletion: false, failureCondition: "NO_MISSES_ALLOWED" },
  { overs: 1 }
);
const nm = evaluateFinalQuestResult(noMiss, { qualifyingSuccess: 3, executed: 5, missed: 1, totalDeliveries: 6 });
check("FB NO_MISSES_ALLOWED fails on miss", nm.result === "FAILED", nm.result);

// ---------------- BUG 2: SOURCE GUARDS ----------------
import * as fs from "fs";
import * as path from "path";
const src = fs.readFileSync(path.join(process.cwd(), "src", "components", "EvolutionChamber.tsx"), "utf8");
check("SRC atomic ball finalization uses finalizeBall + deriveBallProgress", /finalizeBall\(/.test(src) && /deriveBallProgress\(/.test(src));
check("SRC final-ball authoritative closer uses evaluateFinalQuestResult", /evaluateFinalQuestResult\(activePracticeQuest,\s*livePerf\)/.test(src));
check(
  "SRC no post-hoc execution patching of an already-counted ball",
  !/manualQuestProgress|lastAssessedQuestDelivery|markQuestExecution/.test(src)
);
check(
  "SRC EXECUTED/MISSED mandatory before finalizing a ball",
  /executionAssessmentRequired && !isQuestExecutionStatus\(ballExecutionDraft\)/.test(src)
);

// ---------------- BUG 2: ATOMIC BALL LEDGER (6-BALL FLOW) ----------------
const ballOutcome = {
  isExtra: false,
  extraType: "NONE" as const,
  runsConceded: 0,
  isWicket: false,
  wicketType: "NONE",
};
let sixLedger: any[] = [];
for (let ball = 1; ball <= 6; ball++) {
  const fin = finalizeBall(
    { skillId: "s1", skillName: "Leg Break", length: "Perfect Ball", executionStatus: "EXECUTED", outcome: ballOutcome },
    { over: 1, ballNum: ball, xp: 35, requireExecution: true, assessedAt: `t${ball}` }
  );
  if (!fin.ok) break;
  sixLedger = [...sixLedger, fin.delivery];
  const p = deriveBallProgress(sixLedger, true);
  check(`LEDGER ball ${ball} => completed ${p.completedBalls} / executed ${p.executed}`, p.completedBalls === ball && p.executed === ball && p.missed === 0);
}
check("LEDGER 6 complete balls all carry executionStatus", sixLedger.length === 6 && sixLedger.every((l) => isCompleteBallRecord(l, true)));
const sixPerf = (() => {
  const p = deriveBallProgress(sixLedger, true);
  return { qualifyingSuccess: 6, executed: p.executed, missed: p.missed, totalDeliveries: p.completedBalls };
})();
check(
  "LEDGER final verdict sees executed=6 (not 5)",
  evaluateFinalQuestResult(sixBall, sixPerf).result === "SUCCESS" && sixPerf.executed === 6
);
const blocked = finalizeBall(
  { skillId: "s1", skillName: "Leg Break", length: "Perfect Ball", executionStatus: null, outcome: ballOutcome },
  { over: 1, ballNum: 7, xp: 35, requireExecution: true }
);
check("LEDGER an unassessed quest ball can never be finalized", blocked.ok === false);

console.log(`\nDIAGNOSTIC RESULT: ${failedCount === 0 ? "ALL PASS" : `${failedCount} FAILED`}`);
process.exit(failedCount === 0 ? 0 : 1);
check("BULK 0 skipped", parsed.skippedQuests.length === 0, JSON.stringify(parsed.skippedQuests.map((s) => `${s.reason} ${s.title}`)));
const bq = parsed.readyQuests[0];
check("BULK title", bq?.title === "The Length Funnel", String(bq?.title));
check("BULK desc keeps Ball 1..6 + blank lines", !!bq && ["Ball 1:", "Ball 2:", "Ball 3:", "Ball 4:", "Ball 5:", "Ball 6:"].every((b) => bq.description.includes(b)) && bq.description.includes("\n\n"), JSON.stringify(bq?.description).slice(0, 200));
check("BULK fields", bq?.category === "Practice" && bq?.arena === "Evolution Chamber" && bq?.mode === "T20 Variation Drill" && bq?.overs === 1 && bq?.targetSkill === "Leg Break" && bq?.totalBalls === "6" && bq?.toBeExecuted === "6" && bq?.requiredSuccesses === "6", JSON.stringify({ c: bq?.category, m: bq?.mode, o: bq?.overs, tb: bq?.totalBalls, te: bq?.toBeExecuted, rs: bq?.requiredSuccesses }));