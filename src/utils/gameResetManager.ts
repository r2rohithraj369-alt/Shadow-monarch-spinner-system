import { getSupabase } from "./supabaseClient";

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
 * This clears player-owned state while preserving the Quest Database.
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
    // Step 1: Verify reset count
    onProgress?.("Verifying reset eligibility...");
    const currentState = await getGameResetState(userId);
    if (!currentState.canReset) {
      return { success: false, error: "Maximum resets reached. Reset is permanently disabled." };
    }

    // Step 2: Get current profile to extract quest database
    onProgress?.("Preserving Quest Database...");
    const { data: profileData, error: fetchError } = await supabase
      .from("player_profiles")
      .select("profile_data")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      console.warn("[GameReset] Could not fetch profile:", fetchError);
    }

    const questDatabase = profileData?.profile_data?.questDatabase || [];
    const pressureDatabase = profileData?.profile_data?.pressureScenarios || [];

    // Step 3: Increment reset count
    onProgress?.("Incrementing reset count...");
    await incrementResetCount(userId);

    // Step 4: Clear player state in localStorage (except quest database)
    onProgress?.("Clearing player progression data...");
    const questDbJson = JSON.stringify(questDatabase);
    const pressureDbJson = JSON.stringify(pressureDatabase);

    // Clear all localStorage keys
    const keysToPreserve = [
      `monarch_quest_db_${userId}`,
      `monarch_pressure_db_${userId}`,
    ];

    const preservedValues: Record<string, string | null> = {};
    keysToPreserve.forEach((key) => {
      preservedValues[key] = localStorage.getItem(key);
    });

    // Clear localStorage but preserve quest database
    localStorage.clear();

    // Restore quest database
    keysToPreserve.forEach((key) => {
      if (preservedValues[key]) {
        localStorage.setItem(key, preservedValues[key]!);
      }
    });

    // Also save quest database under default keys
    if (questDatabase.length > 0) {
      localStorage.setItem("monarch_quest_db_v1", questDbJson);
    }
    if (pressureDatabase.length > 0) {
      localStorage.setItem("monarch_pressure_db_v1", pressureDbJson);
    }

    // Step 5: Update Supabase profile with reset state
    onProgress?.("Updating cloud profile...");
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

    const { error: updateError } = await supabase
      .from("player_profiles")
      .upsert(
        {
          id: userId,
          profile_data: resetProfile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (updateError) {
      console.error("[GameReset] Failed to update cloud profile:", updateError);
      return { success: false, error: "Cloud update failed. Please try again." };
    }

    // Step 6: Clear the main data key
    onProgress?.("Finalizing reset...");
    localStorage.removeItem("monarch_logged_v10");
    localStorage.removeItem("monarch_sync_updated_at");

    return { success: true };
  } catch (e: any) {
    console.error("[GameReset] Reset failed:", e);
    return { success: false, error: e.message || "Unknown error occurred during reset." };
  }
}
