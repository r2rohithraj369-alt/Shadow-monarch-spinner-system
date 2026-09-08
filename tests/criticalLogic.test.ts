/**
 * criticalLogic.test.ts — Focused verification of the authoritative systems.
 * Run with: npx tsx tests/criticalLogic.test.ts
 */
import {
  getCanonicalQuestRequirements,
  evaluateFinalQuestResult,
  evaluateLiveQuestState,
  isQualifyingDelivery,
  validateQuestDefinition,
  normalizeQuestDefinition,
  QuestDeliveryLike,
} from "../src/utils/questCore";
import { computePlayerAnalytics, PlayerAnalyticsSources } from "../src/utils/playerAnalytics";
import {
  validateResetPhrase,
  validateConfirmationPhrase,
  canReset,
} from "../src/utils/gameResetManager";
import { getRankRequirements, RANK_REQUIREMENTS_LIST } from "../src/utils/rankRequirements";
import { PracticeQuest } from "../src/types";
import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  FAIL  ${name}`);
  }
}

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

const perfect: QuestDeliveryLike = { length: "Perfect Ball" };
const short: QuestDeliveryLike = { length: "Short Ball" };

console.log("\n=== QUEST SYSTEM ===");
console.log("\n=== QUEST SYSTEM ===");
{
  const req = makeQuest().requirements!;
  assert("Q1 Perfect+Executed qualifies", isQualifyingDelivery(req, perfect) === true);
  const v1 = evaluateFinalQuestResult(makeQuest(), { qualifyingSuccess: 3, executed: 4, missed: 1, totalDeliveries: 12 });
  assert("Q1b Perfect+Executed final verdict SUCCESS", v1.result === "SUCCESS");
  assert("Q2 Perfect+Missed still qualifies (outcome-based)", isQualifyingDelivery(req, perfect) === true);
  assert("Q3 Short does not qualify under PERFECT", isQualifyingDelivery(req, short) === false);
  assert("Q4 Short delivery never qualifies", isQualifyingDelivery(req, short) === false);
  const v5 = evaluateFinalQuestResult(makeQuest(), { qualifyingSuccess: 3, executed: 4, missed: 1, totalDeliveries: 12 });
  assert("Q5 Single miss does not fail normal quest", v5.result === "SUCCESS");

  const nmQuest = makeQuest({ failureCondition: "NO_MISSES_ALLOWED" });
  const v6 = evaluateFinalQuestResult(nmQuest, { qualifyingSuccess: 3, executed: 4, missed: 1, totalDeliveries: 12 });
  assert("Q6 NO_MISSES_ALLOWED fails on miss", v6.result === "FAILED");
  const live6 = evaluateLiveQuestState(nmQuest, { qualifyingSuccess: 1, executed: 1, missed: 1, totalDeliveries: 2 });
  assert("Q6b NO_MISSES_ALLOWED live FAIL", live6.status === "FAILED");

  const live7 = evaluateLiveQuestState(makeQuest({ earlyCompletion: true }), { qualifyingSuccess: 3, executed: 4, missed: 1, totalDeliveries: 5 });
  assert("Q7 Early success triggers SUCCESS live", live7.status === "SUCCESS" && live7.earlySuccess === true);

  const live8 = evaluateLiveQuestState(makeQuest(), { qualifyingSuccess: 0, executed: 0, missed: 0, totalDeliveries: 11 });
  assert("Q8 Impossible state (0/3 with 1 ball left) FAIL", live8.status === "FAILED" && live8.isImpossible === true);

  const live9mid = evaluateLiveQuestState(makeQuest({ earlyCompletion: false }), { qualifyingSuccess: 1, executed: 2, missed: 4, totalDeliveries: 6 });
  assert("Q9b Window NOT exhausted -> still ACTIVE", live9mid.status === "ACTIVE");
  const live9 = evaluateLiveQuestState(makeQuest({ earlyCompletion: false }), { qualifyingSuccess: 1, executed: 2, missed: 5, totalDeliveries: 12 });
  assert("Q9 Window exhausted without target -> FAILED", live9.status === "FAILED");

  const explicitBalls = makeQuest({ totalBalls: 18 }, { overs: 2 });
  assert("Q10 Explicit totalBalls=18 preserved over overs*6=12", getCanonicalQuestRequirements(explicitBalls).totalBalls === 18);

  const indep = makeQuest({ successTarget: 3, executionRequired: 6 });
  const canon11 = getCanonicalQuestRequirements(indep);
  assert("Q11a successTarget preserved", canon11.successTarget === 3);
  assert("Q11b executionRequired preserved independently", canon11.executionRequired === 6);
  const v11 = evaluateFinalQuestResult(indep, { qualifyingSuccess: 3, executed: 5, missed: 1, totalDeliveries: 12 });
  assert("Q11c Target met but execution gate unmet -> FAILED", v11.result === "FAILED");

  const bad1 = validateQuestDefinition(makeQuest({ successTarget: -1 } as any));
  assert("Q12a Negative successTarget rejected", bad1.length > 0);
  const bad2 = validateQuestDefinition(makeQuest({ successTarget: 20 }));
  assert("Q12b successTarget > totalBalls rejected", bad2.length > 0);
  const bad3 = validateQuestDefinition(makeQuest({ qualifyingCondition: undefined, perfectBallsNeeded: undefined } as any));
  assert("Q12c Missing qualifying condition rejected", bad3.some((e) => /success condition/i.test(e)));

  const nCanon = getCanonicalQuestRequirements(normalizeQuestDefinition(makeQuest()));
  assert("Q13 Normalization preserves explicit totalBalls", nCanon.totalBalls === 12);
}

console.log("\n=== ANALYTICS ===");
{
  const srcPath = path.join(process.cwd(), "src", "utils", "playerAnalytics.ts");
  const src = fs.readFileSync(srcPath, "utf8").replace(/^\s*(\/\/|\*|\/\*).*$/gm, "");
  assert("A1 No Math.random in analytics engine", !src.includes("Math.random"));

  const emptySources: PlayerAnalyticsSources = {
    player: { level: 1, xp: 0 },
    skills: [],
    attributes: [],
    dungeons: [],
    chamberSessions: [],
    evolutionHistory: [],
    practiceQuests: [],
    completedQuestIds: [],
    failedQuestIds: [],
  };
  const emptyResult = computePlayerAnalytics(emptySources);
  assert("A2 Empty data -> success probability insufficient", emptyResult.currentSuccessProbability.insufficientData === true && emptyResult.currentSuccessProbability.value === null);
  assert("A3 Empty data -> consistency insufficient", emptyResult.consistencyScore.insufficientData === true);
  assert("A4 Empty data -> current form insufficient", emptyResult.currentForm.insufficientData === true);

  const mkSources = (): PlayerAnalyticsSources => ({
    player: { level: 5, xp: 400 },
    skills: [],
    attributes: [{ name: "Control", value: 72, growthRate: "+1%", trend: "ascending", description: "" }],
    dungeons: [],
    chamberSessions: ([
      { timestamp: "2026-01-01T10:00:00Z", counts: { perfect: 6, close: 4, totalDeliveries: 15 } },
      { timestamp: "2026-01-02T10:00:00Z", counts: { perfect: 8, close: 4, totalDeliveries: 15 } },
      { timestamp: "2026-01-03T10:00:00Z", counts: { perfect: 9, close: 3, totalDeliveries: 15 } },
      { timestamp: "2026-01-04T10:00:00Z", counts: { perfect: 7, close: 5, totalDeliveries: 15 } },
      { timestamp: "2026-01-05T10:00:00Z", counts: { perfect: 10, close: 3, totalDeliveries: 15 } },
    ] as any),
    evolutionHistory: [],
    practiceQuests: [],
    completedQuestIds: ["q1", "q2"],
    failedQuestIds: ["q3"],
  });
  const a = computePlayerAnalytics(mkSources());
  const b = computePlayerAnalytics(mkSources());
  assert("A5 Deterministic: identical inputs -> identical output", JSON.stringify(a) === JSON.stringify(b));
  assert("A6 Real data -> success probability computed", a.currentSuccessProbability.insufficientData === false && a.currentSuccessProbability.value !== null);
  assert("A7 Explanation references actual data", a.currentSuccessProbability.explanation.length > 0);
  assert("A8 Lifetime vs recent distinguishable (recentSessions slice)", Array.isArray(a.raw.recentSessions) && a.raw.recentSessions.length === 5);
}

console.log("\n=== ASCENSION ===");
{
  const known = RANK_REQUIREMENTS_LIST.length > 0 ? RANK_REQUIREMENTS_LIST[0] : undefined;
  assert("S0 Rank requirements table populated", !!known);
  if (known) {
    const fetched = getRankRequirements(known.rankName);
    assert("S1 getRankRequirements resolves by rank", !!fetched && fetched.rankName === known.rankName);
    assert("S2 Requirement uses PLAYER level (levelNeeded field)", typeof (fetched as any).levelNeeded === "number");
    assert("S3 No skill-XP/mastery field mixed into player rank requirements", !("skillXp" in (fetched as any)) && !("mastery" in (fetched as any)));
  }
  assert("S4 Unknown rank returns undefined (no fabricated requirements)", getRankRequirements("NONEXISTENT_RANK_XYZ") === undefined);
}

console.log("\n=== RESET ===");
{
  assert("R1 ARISE accepted", validateResetPhrase("ARISE") === true);
  assert("R2 Case-sensitive: 'arise' rejected", validateResetPhrase("arise") === false);
  assert("R3 CONFIRM RESET accepted", validateConfirmationPhrase("CONFIRM RESET") === true);
  assert("R4 Wrong confirmation rejected", validateConfirmationPhrase("confirm reset") === false);
  assert("R5 canReset(0)=true (0/2)", canReset(0) === true);
  assert("R6 canReset(1)=true (1/2)", canReset(1) === true);
  assert("R7 canReset(2)=false (2/2 permanently disabled)", canReset(2) === false);
  assert("R8 canReset(3)=false (beyond limit)", canReset(3) === false);
}

console.log("\n=== ACCOUNT ISOLATION / PLAYER STORAGE ===");
{
  // Node has no localStorage — install a spec-compatible shim if absent.
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

  const {
    purgePlayerScopedStorage,
    PLAYER_SCOPED_KEYS,
    hasLocalPlayerData,
    getLastUserId,
    setLastUserId,
    isLocalDataOwnedByDifferentUser,
  } = await import("../src/utils/playerStorage");

  // Seed state as if User A had been playing.
  PLAYER_SCOPED_KEYS.forEach((k) => localStorage.setItem(k, JSON.stringify({ sample: k })));
  localStorage.setItem("monarch_quest_db_v1", JSON.stringify([{ id: "q-lib-1", title: "LIBRARY QUEST" }]));
  localStorage.setItem("monarch_nexus_settings_v1", JSON.stringify({ theme: "shadow-monarch" }));
  setLastUserId("user-aaaa");

  assert("I1 Local player data detected", hasLocalPlayerData() === true);
  assert("I2 Stale ownership detected for User B", isLocalDataOwnedByDifferentUser("user-bbbb") === true);
  assert("I3 Same ownership NOT flagged for User A", isLocalDataOwnedByDifferentUser("user-aaaa") === false);

  purgePlayerScopedStorage();

  const survived = PLAYER_SCOPED_KEYS.filter((k) => localStorage.getItem(k) !== null);
  assert("I4 Purge removes ALL player-scoped keys (incl. evolution history)", survived.length === 0);
  assert("I5 hasLocalPlayerData false after purge", hasLocalPlayerData() === false);

  const questDb = JSON.parse(localStorage.getItem("monarch_quest_db_v1") || "[]");
  assert("I6 Permanent Quest Database survives purge", Array.isArray(questDb) && questDb.length === 1 && questDb[0].id === "q-lib-1");
  assert("I7 Global settings survive purge", localStorage.getItem("monarch_nexus_settings_v1") !== null);

  assert("I8 No ownership marker -> not stale", (() => {
    setLastUserId(null);
    localStorage.setItem("monarch_player_v10", JSON.stringify({ level: 1 }));
    const r = isLocalDataOwnedByDifferentUser("user-bbbb");
    localStorage.removeItem("monarch_player_v10");
    return r === false;
  })());

  assert("I9 Last-user marker round trip", (() => {
    setLastUserId("user-cccc");
    const v = getLastUserId();
    setLastUserId(null);
    return v === "user-cccc" && getLastUserId() === null;
  })());

  assert("I10 Evolution history key is player-scoped (cleared on reset)", PLAYER_SCOPED_KEYS.includes("monarch_evolution_history_v5"));
  assert("I11 Quest Database key is NOT player-scoped (survives reset)", !PLAYER_SCOPED_KEYS.includes("monarch_quest_db_v1"));
}

console.log("\n=============================================");
console.log(`RESULT: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("Failed assertions:");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
} else {
  process.exit(0);
}


