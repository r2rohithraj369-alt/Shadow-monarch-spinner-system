/**
 * playerStorage.ts — Player-scoped localStorage ownership boundary.
 *
 * Every PLAYER-OWNED localStorage key is listed here so it can be purged at
 * account transitions (logout / account switch / full game reset). Global data
 * (permanent Quest Database, pressure library, UI settings, audio) is NOT
 * purged — it is shared by design.
 *
 * The last-authenticated-user marker detects account switches so a new
 * account can never inherit the previous player's cached local state.
 */

/** Player-owned keys. Cleared on logout, account switch and full game reset. */
export const PLAYER_SCOPED_KEYS: string[] = [
  "monarch_player_v10",
  "monarch_attributes_v10",
  "monarch_skills_v10",
  "monarch_directives_v10",
  "monarch_dungeons_v10",
  "monarch_logs_v10",
  "monarch_ai_analysis_v10",
  "monarch_active_quest_v10",
  "monarch_practice_quests_v10",
  "monarch_active_practice_quest_id_v10",
  "monarch_completed_quest_ids_v10",
  "monarch_failed_quest_ids_v10",
  "monarch_recently_generated_quest_ids_v10",
  "monarch_quest_rotation_seed_v10",
  "monarch_evolution_history_v5",
  "monarch_sync_updated_at",
];

/** Keys that are intentionally GLOBAL/shared and must survive a purge. */
export const GLOBAL_PRESERVED_KEYS: string[] = [
  "monarch_quest_db_v1",
  "monarch_pressure_db_v1",
  "monarch_nexus_settings_v1",
  "monarch_sys_audio_settings",
  "monarch_system_reset_v10",
];

const LAST_USER_KEY = "monarch_last_user_id";

/** Remove every player-owned localStorage key. Global data is preserved. */
export function purgePlayerScopedStorage(): void {
  PLAYER_SCOPED_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable — nothing to purge.
    }
  });
}

/** True if a cached player profile exists in localStorage. */
export function hasLocalPlayerData(): boolean {
  try {
    return localStorage.getItem("monarch_player_v10") !== null;
  } catch {
    return false;
  }
}

/** ID of the last authenticated user that owned the local cache. */
export function getLastUserId(): string | null {
  try {
    return localStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
}

export function setLastUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(LAST_USER_KEY, userId);
    } else {
      localStorage.removeItem(LAST_USER_KEY);
    }
  } catch {
    // Storage unavailable — ownership marker cannot persist.
  }
}

/**
 * True when the local cache belongs to a DIFFERENT authenticated user than the
 * one now signing in. Such data is stale for the incoming account and must be
 * purged before hydration, never used as the new player's state.
 */
export function isLocalDataOwnedByDifferentUser(userId: string): boolean {
  const last = getLastUserId();
  return hasLocalPlayerData() && last !== null && last !== userId;
}
