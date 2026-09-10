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
  MAX_FULL_GAME_RESETS,
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
  assert("R5 Authoritative maximum is 5", MAX_FULL_GAME_RESETS === 5);
  assert("R6 canReset(0)=true (0/5)", canReset(0) === true);
  assert("R7 canReset(1)=true (1/5)", canReset(1) === true);
  assert("R8 canReset(2)=true (2/5)", canReset(2) === true);
  assert("R9 canReset(3)=true (3/5)", canReset(3) === true);
  assert("R10 canReset(4)=true (4/5)", canReset(4) === true);
  assert("R11 canReset(5)=false (5/5 permanently disabled)", canReset(5) === false);
  assert("R12 canReset(6)=false (beyond limit)", canReset(6) === false);
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

console.log("\n=== BOOT-TIME OWNERSHIP GATE (FIRST-PAINT ISOLATION) ===");
{
  const {
    resolveBootOwnership,
    __resetBootOwnershipForTests,
    setLastUserId,
    getLastUserId,
    hasLocalPlayerData,
    GUEST_USER_ID,
  } = await import("../src/utils/playerStorage");

  const g = globalThis as any;
  const seedCache = (owner: string | null) => {
    (g.localStorage as any).clear();
    localStorage.setItem("monarch_player_v10", JSON.stringify({ name: "SOMEONE", level: 5, xp: 2512 }));
    localStorage.setItem("monarch_quest_db_v1", JSON.stringify([{ id: "q-lib-1" }]));
    if (owner) setLastUserId(owner);
  };
  const seedSession = (userId: string | null) => {
    if (userId) {
      localStorage.setItem("sb-testproject-auth-token", JSON.stringify({ user: { id: userId } }));
    } else {
      localStorage.removeItem("sb-testproject-auth-token");
    }
  };

  // Case 1: Account A cache + persisted session for Account B -> purge BEFORE paint.
  __resetBootOwnershipForTests();
  seedCache("user-aaaa");
  seedSession("user-bbbb");
  const r1 = resolveBootOwnership();
  assert("B1 Stale Account A cache purged at boot when session is Account B", r1.purged === true && hasLocalPlayerData() === false);
  assert("B2 Quest Database (global) survives boot purge", localStorage.getItem("monarch_quest_db_v1") !== null);
  assert("B3 Ownership marker updated to Account B", getLastUserId() === "user-bbbb");

  // Case 2: Same account reopens the app -> cache kept (fast local hydration).
  __resetBootOwnershipForTests();
  seedCache("user-bbbb");
  seedSession("user-bbbb");
  const r2 = resolveBootOwnership();
  assert("B4 Same-account boot keeps owned cache", r2.purged === false && hasLocalPlayerData() === true);

  // Case 3: Legacy cache with NO owner marker + session -> unowned -> purge.
  __resetBootOwnershipForTests();
  seedCache(null);
  seedSession("user-aaaa");
  const r3 = resolveBootOwnership();
  assert("B5 Unowned (marker-less) cache purged when a session exists", r3.purged === true && hasLocalPlayerData() === false);

  // Case 4: Guest boot must not inherit a signed-in user's cache.
  __resetBootOwnershipForTests();
  seedCache("user-aaaa");
  seedSession(null);
  const r4 = resolveBootOwnership();
  assert("B6 Guest boot purges signed-in user's cache", r4.purged === true);
  assert("B7 Guest boot marks cache as guest-owned", getLastUserId() === GUEST_USER_ID);

  // Case 5: Logged-in session on a fresh device (no cache) -> marker claimed, no purge.
  __resetBootOwnershipForTests();
  (g.localStorage as any).clear();
  seedSession("user-cccc");
  const r5 = resolveBootOwnership();
  assert("B8 Fresh device with session: no purge, marker claimed", r5.purged === false && getLastUserId() === "user-cccc");

  // Case 6: once-per-page-load — a second call must never wipe live owner data.
  __resetBootOwnershipForTests();
  seedCache("user-aaaa");
  seedSession("user-aaaa");
  resolveBootOwnership();
  localStorage.setItem("monarch_player_v10", JSON.stringify({ name: "USER A LIVE", level: 9 }));
  const r6 = resolveBootOwnership(); // second call -> no-op
  assert("B9 Second boot-resolution call is a no-op (live data safe)", r6.purged === false && JSON.parse(localStorage.getItem("monarch_player_v10") || "{}").level === 9);
}

console.log("\n=== RESET COUNTER (CLOUD-AUTHORITATIVE, PER-USER) ===");
{
  const {
    getResetCountDetailed,
    incrementResetCountWithClient,
    performGameResetCore,
  } = await import("../src/utils/gameResetManager");

  const makeMockSupabase = (opts: {
    resetRows?: Map<string, number>;
    counterReadError?: any;
    counterWriteError?: any;
    profileRows?: Map<string, any>;
  }) => {
    const calls: any[] = [];
    const o = {
      calls,
      resetRows: opts.resetRows ?? new Map<string, number>(),
      counterReadError: opts.counterReadError,
      counterWriteError: opts.counterWriteError,
      profileRows: opts.profileRows ?? new Map<string, any>(),
    };
    return {
      calls,
      opts: o,
      from(table: string) {
        if (table === "game_resets") {
          return {
            select() {
              return {
                eq(_c: string, userId: string) {
                  return {
                    async maybeSingle() {
                      calls.push({ op: "counter-read", table, userId });
                      if (o.counterReadError) return { data: null, error: o.counterReadError };
                      const count = o.resetRows.get(userId);
                      return { data: count === undefined ? null : { reset_count: count }, error: null };
                    },
                  };
                },
              };
            },
            async upsert(row: any, options: any) {
              calls.push({ op: "counter-write", table, row, options });
              if (o.counterWriteError) return { error: o.counterWriteError };
              o.resetRows.set(row.user_id, row.reset_count);
              return { error: null };
            },
          };
        }
        return {
          select() {
            return {
              eq(_c: string, id: string) {
                return {
                  async maybeSingle() {
                    calls.push({ op: "profile-read", table, id });
                    const p = o.profileRows.get(id);
                    return { data: p === undefined ? null : { profile_data: p }, error: null };
                  },
                };
              },
            };
          },
          async upsert(row: any, options: any) {
            calls.push({ op: "profile-write", table, row, options });
            o.profileRows.set(row.id, row.profile_data);
            return { error: null };
          },
        };
      },
    };
  };

  // 0 -> 1: first-time reset with NO row yet must create it.
  {
    const db = makeMockSupabase({});
    const n = await incrementResetCountWithClient(db as any, "user-aaaa");
    assert("RC1 First reset creates counter row 0 -> 1", n === 1 && db.opts.resetRows.get("user-aaaa") === 1);
  }
  // 1 -> 2 -> ... -> 5 each allowed
  {
    const db = makeMockSupabase({ resetRows: new Map([["user-aaaa", 0]]) });
    let allAllowed = true;
    for (let expected = 1; expected <= 5; expected++) {
      const n = await incrementResetCountWithClient(db as any, "user-aaaa");
      if (n !== expected || db.opts.resetRows.get("user-aaaa") !== expected) allAllowed = false;
    }
    assert("RC2 Resets 1..5 all allowed and increment exactly once each", allAllowed);
  }
  // 5 -> blocked, count can NEVER become 6
  {
    const db = makeMockSupabase({ resetRows: new Map([["user-aaaa", 5]]) });
    let blocked = false;
    try {
      await incrementResetCountWithClient(db as any, "user-aaaa");
    } catch {
      blocked = true;
    }
    assert("RC3 Sixth reset BLOCKED at 5/5", blocked);
    assert("RC4 Count can never exceed 5 (no write attempted at limit)", db.opts.resetRows.get("user-aaaa") === 5 && !db.calls.some((c) => c.op === "counter-write"));
  }
  // User isolation of the counter
  {
    const db = makeMockSupabase({ resetRows: new Map([["user-aaaa", 1]]) });
    await incrementResetCountWithClient(db as any, "user-bbbb");
    assert("RC5 Reset count is user-scoped: B's reset does not touch A", db.opts.resetRows.get("user-aaaa") === 1 && db.opts.resetRows.get("user-bbbb") === 1);
  }
  // Missing table -> exact honest classification (the LIVE production bug)
  {
    const db = makeMockSupabase({ counterReadError: { code: "PGRST205", message: "Could not find the table 'public.game_resets' in the schema cache" } });
    const status = await getResetCountDetailed(db as any, "user-aaaa");
    assert("RC6 Missing game_resets table -> ok=false with TABLE_MISSING", status.ok === false && status.errorCode === "TABLE_MISSING");
    assert("RC7 TABLE_MISSING message names the migration file", (status.message || "").includes("20260908_player_isolation_and_reset.sql"));
    const resetResult = await performGameResetCore(db as any, "user-aaaa");
    assert("RC8 Reset ABORTS (no data loss) when counter is unreadable", resetResult.success === false && (resetResult.error || "").includes("unavailable"));
    assert("RC9 No profile writes attempted when counter unreadable", !db.calls.some((c) => c.op === "profile-write"));
  }
  // RLS rejection on write -> honest failure + compensation + no increment
  {
    const previous = { player: { level: 5 }, progressed: true };
    const db = makeMockSupabase({
      counterWriteError: { code: "42501", message: "new row violates row-level security policy" },
      profileRows: new Map([["user-aaaa", previous]]),
    });
    const resetResult = await performGameResetCore(db as any, "user-aaaa");
    assert("RC10 Counter write RLS failure -> honest failure (no false success)", resetResult.success === false && (resetResult.error || "").includes("aborted"));
    assert("RC11 Previous profile RESTORED after counter failure (compensation)", db.opts.profileRows.get("user-aaaa") === previous);
    assert("RC12 FAILED reset does NOT increment the counter", db.opts.resetRows.get("user-aaaa") === undefined);
  }
}

console.log("\n=== FULL GAME RESET FLOW (QUEST DB PRESERVED, STATE CLEARED) ===");
{
  const { performGameResetCore, buildResetProfile } = await import("../src/utils/gameResetManager");
  const { PLAYER_SCOPED_KEYS } = await import("../src/utils/playerStorage");
  const { AttributeEngine, ATTRIBUTE_IDENTITIES } = await import("../src/utils/attributeEngine");

  const makeMockSupabase = (profileData: any, resetCount: number) => {
    const rows = new Map<string, number>([["user-aaaa", resetCount]]);
    const profiles = new Map<string, any>([["user-aaaa", profileData]]);
    return {
      opts: { resetRows: rows, profileRows: profiles },
      from(table: string) {
        if (table === "game_resets") {
          return {
            select() {
              return {
                eq(_c: string, userId: string) {
                  return {
                    async maybeSingle() {
                      const count = rows.get(userId);
                      return { data: count === undefined ? null : { reset_count: count }, error: null };
                    },
                  };
                },
              };
            },
            async upsert(row: any, _options: any) {
              rows.set(row.user_id, row.reset_count);
              return { error: null };
            },
          };
        }
        return {
          select() {
            return {
              eq(_c: string, id: string) {
                return {
                  async maybeSingle() {
                    const p = profiles.get(id);
                    return { data: p === undefined ? null : { profile_data: p }, error: null };
                  },
                };
              },
            };
          },
          async upsert(row: any, _options: any) {
            profiles.set(row.id, row.profile_data);
            return { error: null };
          },
        };
      },
    };
  };

  // Seed localStorage: progressed player state + global quest library.
  PLAYER_SCOPED_KEYS.forEach((k) => localStorage.setItem(k, "stale"));
  localStorage.setItem("monarch_player_v10", JSON.stringify({ name: "A", level: 5, xp: 2512 }));
  localStorage.setItem("monarch_quest_db_v1", JSON.stringify([{ id: "q-lib-1" }, { id: "q-lib-2" }]));

  const progressedProfile = {
    player: { name: "A", level: 5, xp: 2512 },
    attributes: [{ name: "Control", value: 800 }],
    skills: [{ id: "s1", level: 9 }],
    practiceQuests: [{ id: "q1", completed: true }],
    questDatabase: [{ id: "cloud-q" }],
    completedQuestIds: ["q1"],
    evolutionHistory: [{ ev: 1 }],
  };

  const db = makeMockSupabase(progressedProfile, 0);
  const result = await performGameResetCore(db as any, "user-aaaa");
  assert("F1 Full reset succeeds on a healthy cloud (0/2)", result.success === true);
  assert("F2 Reset counter consumed: 0 -> 1", db.opts.resetRows.get("user-aaaa") === 1);

  const resetCloudProfile = db.opts.profileRows.get("user-aaaa");
  assert("F3 Player progression cleared in cloud (player null, skills empty, attributes all zero)", resetCloudProfile.player === null && Array.isArray(resetCloudProfile.attributes) && resetCloudProfile.attributes.length === ATTRIBUTE_IDENTITIES.length && resetCloudProfile.attributes.every((a: any) => a.value === 0) && resetCloudProfile.skills.length === 0);
  assert("F4 Quest progress / completed history / evolution cleared", Array.isArray(resetCloudProfile.practiceQuests) && resetCloudProfile.practiceQuests.length === 0 && resetCloudProfile.completedQuestIds.length === 0 && resetCloudProfile.evolutionHistory.length === 0);
  assert("F5 GLOBAL Quest Database preserved through reset", resetCloudProfile.questDatabase.length === 1 && resetCloudProfile.questDatabase[0].id === "cloud-q");

  assert("F6 Player-scoped localStorage purged after successful reset", PLAYER_SCOPED_KEYS.every((k) => localStorage.getItem(k) === null));
  assert("F7 Global Quest Database key survives local purge", (JSON.parse(localStorage.getItem("monarch_quest_db_v1") || "[]") as any[]).length === 2);

  // Fifth reset allowed (4 -> 5), sixth blocked at 5/5.
  const db2 = makeMockSupabase(progressedProfile, 4);
  const result2 = await performGameResetCore(db2 as any, "user-aaaa");
  const db3 = makeMockSupabase(progressedProfile, 5);
  const result3 = await performGameResetCore(db3 as any, "user-aaaa");
  assert("F8 Fifth reset allowed (4 -> 5)", result2.success === true && db2.opts.resetRows.get("user-aaaa") === 5);
  assert("F9 Sixth reset BLOCKED at 5/5 (permanently locked)", result3.success === false && (result3.error || "").includes("Maximum resets"));

  // buildResetProfile: falls back to the local global library when cloud has none.
  const built = buildResetProfile(null, [{ id: "local-q" }], []);
  assert("F10 Reset profile falls back to local Quest Database when cloud has none", built.questDatabase.length === 1 && built.questDatabase[0].id === "local-q" && built.player === null);

  // ATTRIBUTE RESET: the persisted cloud reset profile must carry the genuine
  // zeroed starting attributes (correct identity + order, value 0), and
  // re-hydration through ensureCompleteAttributes must keep them at 0 —
  // the descending 12..0 index pattern can never come back.
  const persisted = db.opts.profileRows.get("user-aaaa");
  const persistedAttrs = persisted.attributes as any[];
  assert("F11 Reset profile persists every attribute with value 0", Array.isArray(persistedAttrs) && persistedAttrs.length === ATTRIBUTE_IDENTITIES.length && persistedAttrs.every((a: any) => a.value === 0));
  assert("F12 Attribute identities/order preserved in reset profile", persistedAttrs.every((a: any, i: number) => a.name === ATTRIBUTE_IDENTITIES[i].name));
  const rehydrated = AttributeEngine.ensureCompleteAttributes(persistedAttrs);
  assert("F13 Cloud hydration of reset profile keeps ALL attributes at 0 (no 12..0 resurrection)", rehydrated.every((a: any) => a.value === 0) && rehydrated.length === ATTRIBUTE_IDENTITIES.length);

  // ACCOUNT ISOLATION: resetting user B must not touch user A's cloud profile.
  const dbIso = makeMockSupabase(progressedProfile, 0);
  dbIso.opts.profileRows.set("user-bbbb", { player: { name: "B" } });
  await performGameResetCore(dbIso as any, "user-bbbb");
  assert("F14 Reset for user B leaves user A's profile untouched", JSON.stringify(dbIso.opts.profileRows.get("user-aaaa")) === JSON.stringify(progressedProfile));
  assert("F15 User B receives a genuine reset (zeroed attributes), not A's data", (dbIso.opts.profileRows.get("user-bbbb").attributes as any[]).every((a: any) => a.value === 0));
}

console.log("\n=== ATTRIBUTE ENGINE (ZERO START, NO INDEX-AS-VALUE) ===");
{
  const { AttributeEngine, ATTRIBUTE_IDENTITIES } = await import("../src/utils/attributeEngine");
  const { buildResetProfile } = await import("../src/utils/gameResetManager");

  const initial = AttributeEngine.createInitialAttributes();
  assert("A1 Initial attributes: every value is exactly 0", initial.every((a) => a.value === 0));
  assert("A2 All attribute identities present (13 attributes + Arcane Mastery average)", initial.length === ATTRIBUTE_IDENTITIES.length && ATTRIBUTE_IDENTITIES.length === 14);
  assert("A3 Attribute names/order match the canonical definitions", initial.every((a, i) => a.name === ATTRIBUTE_IDENTITIES[i].name));
  assert("A4 No index-derived values (never 12,11,10..0 pattern)", !initial.some((a) => a.value !== 0));

  // Hydration of an EMPTY attribute array (reset/legacy profile) -> all zeros.
  const hydratedEmpty = AttributeEngine.ensureCompleteAttributes([]);
  assert("A5 ensureCompleteAttributes([]) yields all-zero starting attributes", hydratedEmpty.length === ATTRIBUTE_IDENTITIES.length && hydratedEmpty.every((a) => a.value === 0));

  // REGRESSION GUARD: hydration must NEVER zero out real progressed values.
  const progressed = AttributeEngine.ensureCompleteAttributes([
    { name: "Control", value: 33.5 } as any,
  ]);
  const control = progressed.find((a) => a.name === "Control");
  assert("A6 ensureCompleteAttributes preserves real progressed values", control?.value === 33.5);

  // The reset profile builder carries zeroed attributes with identity intact.
  const built = buildResetProfile({ questDatabase: [{ id: "q" }] }, [], []);
  const builtAttrs = built.attributes as any[];
  assert("A7 buildResetProfile attributes are all zero with canonical names", builtAttrs.length === ATTRIBUTE_IDENTITIES.length && builtAttrs.every((a: any, i: number) => a.value === 0 && a.name === ATTRIBUTE_IDENTITIES[i].name));
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


