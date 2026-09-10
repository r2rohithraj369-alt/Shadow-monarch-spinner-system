import { getSupabase } from "./supabaseClient";
import { purgePlayerScopedStorage } from "./playerStorage";

/**
 * Game Reset Manager
 * 
 * Manages the Full Game Reset feature with a cloud-authoritative 2-use limit.
 * The reset count is stored in Supabase and cannot be bypassed by clearing localStorage.
 */

const MAX_RESETS = 2;
const RESET_TABLE = "game_resets";

/** Progress reporter invoked during a full game reset. */
export type ResetProgress = (step: string) => void;

/** Classification of reset-counter availability so the UI can be honest. */
export interface ResetCountStatus {
  /** The count as read from the cloud (0 when unavailable). */
  count: number;
  /** false when the counter could NOT be read — count is NOT trustworthy. */
  ok: boolean;
  /** Machine-readable failure classification. */
  errorCode?: string;
  /** Human-readable explanation with an actionable fix. */
  message?: string;
}

/** Minimal shape of the supabase client used by the reset core (testable). */
export interface SupabaseQueryClient {
  from: (table: string) => any;
}

/**
 * Synchronous reset-eligibility check (0/2 -> allowed, 2/2 -> disabled).
 * The authoritative cloud count is checked again inside performGameReset.
 */
export function canReset(count: number): boolean {
  return count < MAX_RESETS;
}

export interface GameResetState {
  count: number;
  maxResets: number;
  canReset: boolean;
  isPermanentlyDisabled: boolean;
  /** false when the count could not be read from the cloud. */
  countReliable?: boolean;
}

/** Classify a Supabase/PostgREST error into an honest, actionable message. */
function classifyCounterError(error: any): { code: string; message: string } {
  const raw = String(error?.message || error || "");
  const code = String(error?.code || "");
  if (
    code === "PGRST205" ||
    /could not find the table/i.test(raw) ||
    /schema cache/i.test(raw) ||
    /relation .* does not exist/i.test(raw)
  ) {
    return {
      code: "TABLE_MISSING",
      message:
        "The 'game_resets' table does not exist in the live Supabase database. " +
        "Run supabase/migrations/20260908_player_isolation_and_reset.sql in the Supabase SQL Editor.",
    };
  }
  if (code === "42501" || /row-level security/i.test(raw)) {
    return {
      code: "RLS_BLOCKED",
      message:
        "Row Level Security rejected the reset-counter operation. Verify the " +
        "users_select/insert/update_own_reset_count policies exist on game_resets.",
    };
  }
  if (code === "PGRST301" || /jwt/i.test(raw)) {
    return { code: "AUTH", message: "Authentication token missing/expired for the counter operation." };
  }
  return { code: code || "UNKNOWN", message: raw || "Unknown reset-counter error." };
}

/**
 * Get the current reset count for a user (detailed, honest).
 * A brand-new account has no row yet -> count 0, ok true.
 * A missing table / RLS rejection -> ok false with the EXACT reason.
 */
export async function getResetCountDetailed(
  client: SupabaseQueryClient | null,
  userId: string
): Promise<ResetCountStatus> {
  if (!client) {
    // Offline local fallback: not cloud-authoritative — report honestly.
    let localCount = 0;
    try {
      localCount = parseInt(localStorage.getItem(`monarch_reset_count_${userId}`) || "0", 10) || 0;
    } catch {
      /* storage unavailable */
    }
    return { count: localCount, ok: false, errorCode: "OFFLINE", message: "Supabase unavailable — using local fallback count (not cloud-authoritative)." };
  }

  try {
    const { data, error } = await client
      .from(RESET_TABLE)
      .select("reset_count")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      const c = classifyCounterError(error);
      console.error(`[RESET] Count read FAILED for user ${userId.slice(0, 8)}… table=${RESET_TABLE} code=${c.code}: ${c.message}`);
      return { count: 0, ok: false, errorCode: c.code, message: c.message };
    }

    const count = data?.reset_count ?? 0;
    console.log(`[RESET] Count read OK for user ${userId.slice(0, 8)}… count=${count}`);
    return { count, ok: true };
  } catch (e: any) {
    const c = classifyCounterError(e);
    console.error(`[RESET] Count read FAILED for user ${userId.slice(0, 8)}… code=${c.code}: ${c.message}`);
    return { count: 0, ok: false, errorCode: c.code, message: c.message };
  }
}

/**
 * Back-compat wrapper: cloud count (0 when unreadable — callers needing an
 * honest "unavailable" state should use getResetCountDetailed instead).
 */
export async function getResetCount(userId: string): Promise<number> {
  const status = await getResetCountDetailed(getSupabase(), userId);
  return status.count;
}

/**
 * Increment the reset count in Supabase. Handles first-reset initialization
 * (no row yet -> INSERT reset_count = 1 via upsert constrained by user_id).
 * Rejects when the budget is exhausted (2 -> blocked).
 */
export async function incrementResetCountWithClient(
  client: SupabaseQueryClient,
  userId: string
): Promise<number> {
  const status = await getResetCountDetailed(client, userId);
  if (!status.ok) {
    throw new Error(`Reset counter is unreadable (${status.errorCode}). ${status.message}`);
  }
  const currentCount = status.count;
  if (!canReset(currentCount)) {
    throw new Error(`Maximum resets reached (${currentCount}/${MAX_RESETS}). Reset is permanently disabled.`);
  }
  const newCount = currentCount + 1;

  console.log(`[RESET] Counter upsert for user ${userId.slice(0, 8)}… ${currentCount} -> ${newCount} (first-reset insert handled by upsert on user_id)`);

  const { error: upsertError } = await client.from(RESET_TABLE).upsert(
    {
      user_id: userId,
      reset_count: newCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    const c = classifyCounterError(upsertError);
    console.error(`[RESET] Counter write FAILED for user ${userId.slice(0, 8)}… table=${RESET_TABLE} code=${c.code}: ${c.message}`);
    const err: any = new Error(c.message);
    err.code = c.code;
    throw err;
  }

  console.log(`[RESET] Counter write OK for user ${userId.slice(0, 8)}… new count=${newCount}`);
  try {
    localStorage.setItem(`monarch_reset_count_${userId}`, String(newCount));
  } catch {
    /* storage unavailable — cloud remains authoritative */
  }
  return newCount;
}

/** Increment the reset count for a user using the app's Supabase client. */
export async function incrementResetCount(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not available. Cannot perform reset.");
  }
  return incrementResetCountWithClient(supabase, userId);
}

/**
 * Get the full reset state for a user.
 */
export async function getGameResetState(userId: string): Promise<GameResetState> {
  const status = await getResetCountDetailed(getSupabase(), userId);
  const count = status.count;
  const allowed = status.ok && count < MAX_RESETS;

  return {
    count,
    maxResets: MAX_RESETS,
    canReset: allowed,
    isPermanentlyDisabled: status.ok && count >= MAX_RESETS,
    countReliable: status.ok,
  };
}

/**
 * Validate the reset phrase.
 */
export function validateResetPhrase(phrase: string): boolean {
  return phrase === "ARISE";
}

/**
 * Validate the confirmation phrase.
 */
export function validateConfirmationPhrase(phrase: string): boolean {
  return phrase === "CONFIRM RESET";
}

/**
 * Build the genuine reset (starting-state) profile. Pure function so tests can
 * verify the Quest Database (GLOBAL data) is preserved while every
 * PLAYER-OWNED field is cleared.
 */
export function buildResetProfile(
  previousProfile: any,
  localQuestDatabase: any[],
  localPressureDatabase: any[]
): any {
  const cloudQuestDatabase = previousProfile?.questDatabase;
  const cloudPressure = previousProfile?.pressureScenarios;

  // Prefer the cloud library; fall back to the local global library keys.
  let questDatabase: any[] = Array.isArray(cloudQuestDatabase) ? cloudQuestDatabase : [];
  if (questDatabase.length === 0) {
    questDatabase = Array.isArray(localQuestDatabase) ? localQuestDatabase : [];
  }
  let pressureDatabase: any[] = Array.isArray(cloudPressure) ? cloudPressure : [];
  if (pressureDatabase.length === 0) {
    pressureDatabase = Array.isArray(localPressureDatabase) ? localPressureDatabase : [];
  }

  return {
    player: null,
    attributes: [],
    skills: [],
    directives: [],
    dungeons: [],
    logs: [],
    aiAnalysis: null,
    settings: null,
    activeQuestId: null,
    practiceQuests: [],
    questDatabase: questDatabase,
    pressureScenarios: pressureDatabase,
    activePracticeQuestId: null,
    completedQuestIds: [],
    failedQuestIds: [],
    recentlyGeneratedQuestIds: [],
    questRotationSeed: null,
    evolutionHistory: [],
    updated_at: Date.now(),
  };
}

/**
 * Perform the actual game reset (testable core).
 *
 * This clears PLAYER-OWNED state while preserving the permanent Quest Database
 * (global library) and the pressure-scenario library.
 *
 * Atomicity strategy (client-side safest possible ordering):
 *   1. Verify eligibility (cloud-authoritative count).
 *   2. Upload the fresh (reset) profile to the cloud.
 *   3. Only AFTER the data reset succeeded, increment the reset counter.
 *   4. If the counter increment fails, compensate by restoring the previous
 *      profile and report an honest failure — the user keeps their data and
 *      their reset budget.
 */
export async function performGameResetCore(
  client: SupabaseQueryClient,
  userId: string,
  onProgress?: ResetProgress
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Verify reset eligibility (cloud-authoritative)
    onProgress?.("Verifying reset eligibility...");
    const state = await getResetCountDetailed(client, userId);
    if (!state.ok) {
      console.error(`[RESET] Aborted for user ${userId.slice(0, 8)}… — counter unreadable (${state.errorCode})`);
      return { success: false, error: `Reset counter is unavailable: ${state.message}` };
    }
    if (!canReset(state.count)) {
      return { success: false, error: "Maximum resets reached. Reset is permanently disabled." };
    }
    console.log(`[RESET] Eligible for user ${userId.slice(0, 8)}… current count=${state.count}/${MAX_RESETS}`);

    // Step 2: Fetch the current cloud profile — needed to preserve the
    // permanent Quest Database / pressure library and to allow rollback.
    onProgress?.("Preserving Quest Database...");
    const { data: profileData, error: fetchError } = await client
      .from("player_profiles")
      .select("profile_data")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      console.warn("[GameReset] Could not fetch profile:", fetchError);
    }

    const previousProfile = profileData?.profile_data || null;

    let localQuestDatabase: any[] = [];
    let localPressureDatabase: any[] = [];
    try {
      localQuestDatabase = JSON.parse(localStorage.getItem("monarch_quest_db_v1") || "[]");
      if (!Array.isArray(localQuestDatabase)) localQuestDatabase = [];
    } catch {
      localQuestDatabase = [];
    }
    try {
      localPressureDatabase = JSON.parse(localStorage.getItem("monarch_pressure_db_v1") || "[]");
      if (!Array.isArray(localPressureDatabase)) localPressureDatabase = [];
    } catch {
      localPressureDatabase = [];
    }

    // Step 3: Reset player-owned cloud state FIRST (counter NOT consumed yet).
    onProgress?.("Resetting player progression data...");
    const resetProfile = buildResetProfile(previousProfile, localQuestDatabase, localPressureDatabase);

    const { error: resetError } = await client
      .from("player_profiles")
      .upsert(
        {
          id: userId,
          profile_data: resetProfile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (resetError) {
      console.error("[GameReset] Cloud profile reset failed:", resetError);
      return { success: false, error: `Cloud reset failed: ${resetError.message || resetError}` };
    }

    // Step 4: Data reset succeeded — now consume one reset from the budget.
    onProgress?.("Updating reset counter...");
    try {
      await incrementResetCountWithClient(client, userId);
    } catch (countError: any) {
      // Compensation: the data was reset but the counter could not be updated.
      // Restore the previous profile so the user keeps BOTH their data and
      // their reset budget, then report an honest failure.
      console.error("[GameReset] Reset counter update failed — compensating:", countError);
      onProgress?.("Counter update failed — restoring previous state...");
      await client
        .from("player_profiles")
        .upsert(
          {
            id: userId,
            profile_data: previousProfile || resetProfile,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      return {
        success: false,
        error: `Reset counter could not be updated (${countError?.code || "error"}). The reset was aborted and your previous state was restored. ${countError?.message || ""}`.trim(),
      };
    }

    // Step 5: Purge player-owned local cache (Quest Database & settings are
    // global keys and survive the purge by design). The live React state is
    // reset by the caller via cloudSync.handlePostReset().
    onProgress?.("Clearing local cache...");
    const purged = purgePlayerScopedStorage();
    console.log(`[RESET] Local purge for user ${userId.slice(0, 8)}… removed ${purged.length} player keys (global Quest Database preserved)`);

    onProgress?.("Reset complete.");
    return { success: true };
  } catch (e: any) {
    console.error("[GameReset] Reset failed:", e);
    return { success: false, error: e.message || "Unknown error occurred during reset." };
  }
}

/**
 * Perform the actual game reset using the app's Supabase client.
 */
export async function performGameReset(
  userId: string,
  onProgress?: ResetProgress
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase is not available. Cannot perform reset." };
  }
  console.log(`[RESET] Full Game Reset START for user ${userId.slice(0, 8)}…`);
  const result = await performGameResetCore(supabase, userId, onProgress);
  console.log(
    `[RESET] Full Game Reset ${result.success ? "SUCCESS" : "FAILED"} for user ${userId.slice(0, 8)}…${result.error ? ` — ${result.error}` : ""}`
  );
  return result;
}
