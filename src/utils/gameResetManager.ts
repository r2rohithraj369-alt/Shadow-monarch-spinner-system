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
}

/**
 * Get the current reset count for a user from Supabase.
 */
export async function getResetCount(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) {
    const localCount = localStorage.getItem(`monarch_reset_count_${userId}`);
    return localCount ? parseInt(localCount, 10) : 0;
  }

  try {
    const { data, error } = await supabase
      .from(RESET_TABLE)
      .select("reset_count")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[GameReset] Error fetching reset count:", error);
      return 0;
    }

    return data?.reset_count || 0;
  } catch (e) {
    console.error("[GameReset] Failed to get reset count:", e);
    return 0;
  }
}

/**
 * Increment the reset count in Supabase.
 */
export async function incrementResetCount(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not available. Cannot perform reset.");
  }

  try {
    const currentCount = await getResetCount(userId);
    const newCount = currentCount + 1;

    const { error: upsertError } = await supabase
      .from(RESET_TABLE)
      .upsert(
        {
          user_id: userId,
          reset_count: newCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      throw upsertError;
    }

    localStorage.setItem(`monarch_reset_count_${userId}`, String(newCount));
    return newCount;
  } catch (e) {
    console.error("[GameReset] Failed to increment reset count:", e);
    throw e;
  }
}

/**
 * Get the full reset state for a user.
 */
export async function getGameResetState(userId: string): Promise<GameResetState> {
  const count = await getResetCount(userId);
  const canReset = count < MAX_RESETS;

  return {
    count,
    maxResets: MAX_RESETS,
    canReset,
    isPermanentlyDisabled: !canReset,
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
 * Perform the actual game reset.
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
 * The previous implementation incremented the counter first and could consume
 * a reset without resetting anything.
 */
export async function performGameReset(
  userId: string,
  onProgress?: (step: string) => void
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase is not available. Cannot perform reset." };
  }

  try {
    // Step 1: Verify reset eligibility (cloud-authoritative)
    onProgress?.("Verifying reset eligibility...");
    const currentState = await getGameResetState(userId);
    if (!currentState.canReset) {
      return { success: false, error: "Maximum resets reached. Reset is permanently disabled." };
    }

    // Step 2: Fetch the current cloud profile — needed to preserve the
    // permanent Quest Database / pressure library and to allow rollback.
    onProgress?.("Preserving Quest Database...");
    const { data: profileData, error: fetchError } = await supabase
      .from("player_profiles")
      .select("profile_data")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      console.warn("[GameReset] Could not fetch profile:", fetchError);
    }

    const previousProfile = profileData?.profile_data || null;
    const cloudQuestDatabase = previousProfile?.questDatabase;
    const cloudPressure = previousProfile?.pressureScenarios;

    // Prefer the cloud library; fall back to the local global library keys.
    let questDatabase: any[] = Array.isArray(cloudQuestDatabase) ? cloudQuestDatabase : [];
    if (questDatabase.length === 0) {
      try {
        questDatabase = JSON.parse(localStorage.getItem("monarch_quest_db_v1") || "[]");
        if (!Array.isArray(questDatabase)) questDatabase = [];
      } catch {
        questDatabase = [];
      }
    }
    let pressureDatabase: any[] = Array.isArray(cloudPressure) ? cloudPressure : [];
    if (pressureDatabase.length === 0) {
      try {
        pressureDatabase = JSON.parse(localStorage.getItem("monarch_pressure_db_v1") || "[]");
        if (!Array.isArray(pressureDatabase)) pressureDatabase = [];
      } catch {
        pressureDatabase = [];
      }
    }

    // Step 3: Reset player-owned cloud state FIRST (counter NOT consumed yet).
    onProgress?.("Resetting player progression data...");
    const resetProfile = {
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

    const { error: resetError } = await supabase
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
      await incrementResetCount(userId);
    } catch (countError: any) {
      // Compensation: the data was reset but the counter could not be updated.
      // Restore the previous profile so the user keeps BOTH their data and
      // their reset budget, then report an honest failure.
      console.error("[GameReset] Reset counter update failed — compensating:", countError);
      onProgress?.("Counter update failed — restoring previous state...");
      await supabase
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
        error: "Reset counter could not be updated. The reset was aborted and your previous state was restored.",
      };
    }

    // Step 5: Purge player-owned local cache (Quest Database & settings are
    // global keys and survive the purge by design). The live React state is
    // reset by the caller via cloudSync.handlePostReset().
    onProgress?.("Clearing local cache...");
    purgePlayerScopedStorage();

    onProgress?.("Reset complete.");
    return { success: true };
  } catch (e: any) {
    console.error("[GameReset] Reset failed:", e);
    return { success: false, error: e.message || "Unknown error occurred during reset." };
  }
}
