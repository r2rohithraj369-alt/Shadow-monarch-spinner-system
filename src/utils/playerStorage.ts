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
 * resolveBootOwnership() runs synchronously BEFORE React state initializes so
 * the first paint can never render another account's cached data.
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
  "monarch_evolution_history_migration_v1",
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

/**
 * Synthetic owner id for guest (non-authenticated) sessions. Guest cache is
 * ephemeral and must never be inherited by — or inherited from — a real
 * authenticated account.
 */
export const GUEST_USER_ID = "__guest__";

const LAST_USER_KEY = "monarch_last_user_id";

/** Remove every player-owned localStorage key. Global data is preserved. */
export function purgePlayerScopedStorage(): string[] {
  const purged: string[] = [];
  const keys = new Set(PLAYER_SCOPED_KEYS);
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith("monarch_evolution_history_v5_")) keys.add(key);
    }
  } catch {
    // Storage unavailable — static keys are still attempted below.
  }
  Array.from(keys).forEach((key) => {
    try {
      if (localStorage.getItem(key) !== null) purged.push(key);
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable — nothing to purge.
    }
  });
  return purged;
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
 * Synchronously reads the persisted Supabase session user id (if any) directly
 * from the supabase-js localStorage entries, WITHOUT awaiting the network.
 * This lets the very first React render know which account owns this browser.
 * Defensive on purpose: supabase-js storage format varies between versions.
 */
export function getPersistedSupabaseUserId(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        let payload: any = JSON.parse(raw);
        if (typeof payload === "string") {
          // Some supabase-js versions wrap the JSON payload ("base64-..." prefix).
          if (payload.startsWith("base64-") && typeof atob === "function") {
            payload = JSON.parse(atob(payload.slice(7)));
          } else {
            payload = JSON.parse(payload);
          }
        }
        const userId =
          payload?.user?.id ??
          payload?.decodedUser?.id ??
          payload?.currentSession?.user?.id ??
          null;
        if (userId) return String(userId);
      } catch {
        // Not parseable — skip this entry.
      }
    }
  } catch {
    // Storage unavailable.
  }
  return null;
}

export interface BootOwnershipResult {
  /** true when unowned player cache was purged before React state init. */
  purged: boolean;
  /** Why the purge decision was made (for dev diagnostics). */
  reason: string;
  /** The account id this browser's local cache now belongs to. */
  resolvedOwnerId: string | null;
}

let bootOwnershipResolved = false;

/** Test-only: reset the once-per-page-load guard. */
export function __resetBootOwnershipForTests(): void {
  bootOwnershipResolved = false;
}

/**
 * BOOT-TIME OWNERSHIP GATE.
 *
 * MUST run synchronously before the React player-state useState initializers
 * read localStorage. It guarantees the first paint can never render another
 * account's cached data:
 *
 *   - Persisted Supabase session is User B, cache marker is User A (or missing)
 *       -> cache is unowned for B -> purge BEFORE hydration.
 *   - No Supabase session (guest/offline boot), cache marker is a real user
 *       -> that user's cache must not leak into guest mode -> purge.
 *   - Session user matches the cache marker (same account reopening the app)
 *       -> keep the cache (fast local hydration is legitimate).
 *   - No session and no marker (fresh browser / offline local profile mode)
 *       -> keep (nothing cross-account can leak).
 *
 * Runs at most once per page load — subsequent calls are no-ops so a purge can
 * never destroy the CURRENT owner's freshly-persisted data mid-session.
 */
export function resolveBootOwnership(): BootOwnershipResult {
  const result: BootOwnershipResult = {
    purged: false,
    reason: "already-resolved",
    resolvedOwnerId: null,
  };
  if (bootOwnershipResolved) return result;
  bootOwnershipResolved = true;

  const sessionUserId = getPersistedSupabaseUserId();
  let lastUserId = getLastUserId();
  result.resolvedOwnerId = sessionUserId ?? (lastUserId === GUEST_USER_ID ? GUEST_USER_ID : null);

  if (!hasLocalPlayerData()) {
    result.reason = "no-local-player-data";
    if (sessionUserId) setLastUserId(sessionUserId);
    return result;
  }

  if (sessionUserId) {
    if (lastUserId !== sessionUserId) {
      const purgedKeys = purgePlayerScopedStorage();
      setLastUserId(sessionUserId);
      result.purged = true;
      result.reason =
        lastUserId === null
          ? `cache had NO owner marker (legacy/pre-isolation build) while a persisted session exists — purged ${purgedKeys.length} player keys`
          : `cache owner ${lastUserId.slice(0, 8)} differs from persisted session user — purged ${purgedKeys.length} player keys`;
      console.log(`[ACCOUNT SWITCH][BOOT] ${result.reason}`);
      return result;
    }
    result.reason = "cache owned by current session user — kept";
    return result;
  }

  // No persisted Supabase session: this boot is guest/offline mode.
  if (hasLocalPlayerData()) {
    lastUserId ||= "unowned";
    const purgedKeys = purgePlayerScopedStorage();
    result.purged = true;
    result.reason = `guest/offline boot — cache belongs to signed-in user ${lastUserId.slice(0, 8)} — purged ${purgedKeys.length} player keys`;
    console.log(`[ACCOUNT SWITCH][BOOT] ${result.reason}`);
    setLastUserId(GUEST_USER_ID);
    result.resolvedOwnerId = GUEST_USER_ID;
    return result;
  }

  result.reason = "no session and cache is guest-owned/unowned — kept";
  if (!lastUserId) setLastUserId(GUEST_USER_ID);
  return result;
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

export function getPlayerHistoryCacheKey(userId: string | null | undefined): string {
  return userId ? `monarch_evolution_history_v5_${userId}` : "monarch_evolution_history_v5";
}
