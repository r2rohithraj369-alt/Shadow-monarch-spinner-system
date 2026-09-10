import { getSupabase } from "./supabaseClient";
import {
  purgePlayerScopedStorage,
  getLastUserId,
  setLastUserId,
} from "./playerStorage";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Browser as CapBrowser } from "@capacitor/browser";

export interface UnifiedProfile {
  player: any;
  attributes: any[];
  skills: any[];
  directives: any[];
  dungeons: any[];
  logs: any[];
  aiAnalysis: any | null;
  settings?: any;
  activeQuestId: string | null;
  practiceQuests: any[];
  questDatabase?: any[];
  pressureScenarios?: any[];
  activePracticeQuestId: string | null;
  completedQuestIds?: string[];
  failedQuestIds?: string[];
  recentlyGeneratedQuestIds?: string[];
  questRotationSeed?: string | null;
  audioSettings?: any;
  evolutionHistory?: any[];
  updated_at: number; // Unix timestamp
}

export type SyncState = "idle" | "syncing" | "success" | "error" | "offline";

class CloudSyncManager {
  private updateStateCallback: ((profile: UnifiedProfile) => void) | null = null;
  private syncStateCallback: ((state: SyncState, msg?: string) => void) | null = null;
  private stateResetCallback: (() => void) | null = null;
  private defaultProfileProvider: (() => UnifiedProfile) | null = null;
  
  private userSession: any = null;
  private isSyncing: boolean = false;
  private uploadTimer: any = null;
  private isApplyingCloudData: boolean = false;
  /**
   * False until the FIRST triggerInitialSync for the current user completes.
   * While false, queueCloudSync() is a no-op — the stale React state from a
   * previous account (still in memory at boot) can never be uploaded into the
   * new account's cloud row.
   */
  private bootHydrationDone: boolean = false;
  private readonly questDatabaseKey = "monarch_quest_db_v1";
  private readonly pressureDatabaseKey = "monarch_pressure_db_v1";
  private readonly settingsKey = "monarch_nexus_settings_v1";

  constructor() {
    this.initAuthListener();
    this.initNativeDeepLinkListener();
    this.initNetworkListeners();
  }

  /**
   * Register callback to push loaded player states back up to React Component
   */
  public registerStateUpdater(callback: (profile: UnifiedProfile) => void) {
    this.updateStateCallback = callback;
  }

  /**
   * Register a callback that resets ALL live player React state to the genuine
   * starting state. Invoked on logout, account switch and after a full game
   * reset so no previous player's data can survive in memory.
   */
  public registerStateReset(callback: () => void) {
    this.stateResetCallback = callback;
  }

  /**
   * Register a provider that builds the genuine NEW-PLAYER starting profile.
   * Used when a freshly authenticated account has no cloud row yet — the
   * previous player's local state is never used as the new player's state.
   */
  public registerDefaultProfileProvider(callback: () => UnifiedProfile) {
    this.defaultProfileProvider = callback;
  }

  /**
   * Register callback to sync state changes to UI
   */
  public registerSyncStateListener(callback: (state: SyncState, msg?: string) => void) {
    this.syncStateCallback = callback;
  }

  public setSyncState(state: SyncState, msg?: string) {
    if (this.syncStateCallback) {
      this.syncStateCallback(state, msg);
    }
  }

  public getSession() {
    return this.userSession;
  }

  public isSupabaseEnabled(): boolean {
    return getSupabase() !== null;
  }

  private initAuthListener() {
    const supabase = getSupabase();
    if (!supabase) {
      setTimeout(() => {
        this.setSyncState("offline", "Supabase Offline Fallback Active");
      }, 300);
      return;
    }

    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      this.userSession = session;
      if (session?.user) {
        this.triggerInitialSync();
      }
    });

    // Sub to auth modifications
    supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      this.userSession = session;
      if (session?.user) {
        await this.triggerInitialSync();
      } else if (event === "SIGNED_OUT") {
        this.handleSignedOutCleanup();
      }
    });
  }

  /**
   * Logout cleanup — clears every player-owned local key and resets live
   * React state so User B can never inherit User A's state.
   */
  private handleSignedOutCleanup() {
    console.log("[Auth] Signed out — purging player-scoped local cache and resetting live state.");
    // Cancel any pending debounced upload so the signed-out player's state can
    // never be flushed to the cloud after logout.
    if (this.uploadTimer) {
      clearTimeout(this.uploadTimer);
      this.uploadTimer = null;
    }
    this.bootHydrationDone = false;
    purgePlayerScopedStorage();
    setLastUserId(null);
    this.stateResetCallback?.();
    this.setSyncState("idle");
  }

  private initNetworkListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("[Network] Status online! Auto launching cloud-sync checks.");
        this.triggerInitialSync();
      });

      // Background periodic sync check every 3 minutes
      setInterval(() => {
        if (this.getSession()?.user) {
          console.log("[Background Sync] Periodic timer fired.");
          this.triggerInitialSync();
        }
      }, 180000);
    }
  }

  private initNativeDeepLinkListener() {
    if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
      CapApp.addListener("appUrlOpen", async (event: any) => {
        console.log("[DeepLink] Received url handler event:", event.url);
        if (!event.url) return;

        try {
          await this.createNativeSessionFromUrl(event.url);
        } catch (err: any) {
          console.error("[DeepLink] Session restoration failed:", err);
          this.setSyncState("error", "Failed resolving callback coordinates: " + (err.message || err));
        }
      });
    }
  }

  private getOAuthParamsFromUrl(url: string) {
    const parsedUrl = new URL(url);
    const queryParams = new URLSearchParams(parsedUrl.search);
    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));

    return {
      code: queryParams.get("code") || hashParams.get("code"),
      error: queryParams.get("error") || hashParams.get("error"),
      errorDescription: queryParams.get("error_description") || hashParams.get("error_description"),
      accessToken: queryParams.get("access_token") || hashParams.get("access_token"),
      refreshToken: queryParams.get("refresh_token") || hashParams.get("refresh_token")
    };
  }

  private async createNativeSessionFromUrl(url: string) {
    const supabase = getSupabase();
    if (!supabase || !url.startsWith("monarchspinner://")) return;

    const params = this.getOAuthParamsFromUrl(url);
    if (params.error) {
      throw new Error(params.errorDescription || params.error);
    }

    if (!params.code && !params.accessToken) return;

    this.setSyncState("syncing", "Restoring secure cloud profile from deep link...");

    if (params.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
    } else if (params.accessToken && params.refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken
      });
      if (error) throw error;
    }

    console.log("[DeepLink] Session restored successfully.");
    await CapBrowser.close();
    await this.triggerInitialSync();
  }

  /**
   * Safe comparison and restoration protocol on initial loading.
   * `force` bypasses the isSyncing guard (used by handlePostReset, which must
   * never be silently skipped).
   *
   * STALE-SESSION GUARD: every async boundary re-checks that the session user
   * is still the user this sync was started for. Results from a previous
   * account can never be applied to — or uploaded for — the current one.
   */
  public async triggerInitialSync(force: boolean = false) {
    const supabase = getSupabase();
    if (!supabase || !this.userSession?.user) {
      this.setSyncState("offline", "Login to activate Cloud Synchronization Sync");
      return;
    }

    if (this.isSyncing && !force) return;
    this.isSyncing = true;

    const syncUserId = this.userSession.user.id;
    /** Abort when the authenticated user changed since this sync started. */
    const sessionChanged = () => this.userSession?.user?.id !== syncUserId;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      this.setSyncState("syncing", "Comparing local & remote states...");
      await delay(120);

      if (sessionChanged()) {
        console.log(`[Sync] Aborted stale sync for ${syncUserId.slice(0, 8)}… — session user changed mid-flight.`);
        return;
      }

      this.setSyncState("syncing", "Restoring secure cloud session...");
      await delay(120);

      const user = this.userSession.user;

      // ACCOUNT ISOLATION GUARD — if the local cache belongs to a different
      // authenticated user than the one now syncing, purge it BEFORE any
      // hydration or conflict resolution. The previous player's state must
      // never be read, compared, or uploaded for the new account.
      if (getLastUserId() && getLastUserId() !== user.id) {
        console.log("[Account Switch] Different authenticated user detected. Purging previous player's local cache.");
        const purgedKeys = purgePlayerScopedStorage();
        console.log(`[ACCOUNT SWITCH][SYNC] previous=${getLastUserId()?.slice(0, 8)}… new=${user.id.slice(0, 8)}… purged=${purgedKeys.length} keys`);
        this.stateResetCallback?.();
      } else if (!getLastUserId()) {
        // No owner marker (legacy cache or pre-isolation build): treat as
        // unowned and purge so it can never be compared/uploaded for this user.
        if (this.getLocalProfileFromStorage().player) {
          const purgedKeys = purgePlayerScopedStorage();
          console.warn(`[ACCOUNT SWITCH][SYNC] Unowned local cache (no owner marker) purged for ${user.id.slice(0, 8)}… — ${purgedKeys.length} keys`);
          this.stateResetCallback?.();
        }
      }
      setLastUserId(user.id);

      // 1. Download Cloud Profile
      const { data, error } = await supabase
        .from("player_profiles")
        .select("profile_data, updated_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
          console.warn("Table 'player_profiles' does not exist in Supabase database schema yet.");
          this.setSyncState("error", "Table 'player_profiles' missing in database. Run schema script!");
          this.isSyncing = false;
          return;
        }
        throw error;
      }

      // Stale-session guard: the authenticated user must still be the same one
      // this sync was started for before any state is read or written.
      if (sessionChanged()) {
        console.log(`[Sync] Aborted stale sync for ${syncUserId.slice(0, 8)}… after cloud fetch — session user changed.`);
        return;
      }

      this.setSyncState("syncing", "Loading Player Profile...");
      await delay(120);

      this.setSyncState("syncing", "Loading Skills Spellbook...");
      await delay(120);

      this.setSyncState("syncing", "Loading Quest Database...");
      await delay(120);

      this.setSyncState("syncing", "Loading Pressure Library...");
      await delay(120);

      this.setSyncState("syncing", "Loading Statistics & History...");
      await delay(120);

      // 2. Fetch local storage version
      const localProfile = this.getLocalProfileFromStorage();

      if (data) {
        const cloudProfile = this.normalizeProfile(data.profile_data as UnifiedProfile);
        const cloudUpdatedAt = new Date(data.updated_at).getTime() || cloudProfile.updated_at || 0;
        const localUpdatedAt = localProfile.updated_at || 0;

        // Perform multi-metric progression checks as requested!
        const localLevel = localProfile.player?.level || 1;
        const cloudLevel = cloudProfile.player?.level || 1;
        const localXp = localProfile.player?.xp || 0;
        const cloudXp = cloudProfile.player?.xp || 0;

        const localQuestsCleared = localProfile.practiceQuests?.filter(q => q.completed).length || 0;
        const cloudQuestsCleared = cloudProfile.practiceQuests?.filter(q => q.completed).length || 0;
        const localQuestDbCount = localProfile.questDatabase?.length || 0;
        const cloudQuestDbCount = cloudProfile.questDatabase?.length || 0;

        let localIsMoreAdvanced = false;
        let mergedProfile: UnifiedProfile | null = null;

        // Higher level beats lower level always
        if (localLevel > cloudLevel) {
          localIsMoreAdvanced = true;
        } else if (localLevel === cloudLevel) {
          // If level matches, higher XP wins
          if (localXp > cloudXp) {
            localIsMoreAdvanced = true;
          } else if (localXp === cloudXp) {
            // More completed quests wins
            if (localQuestsCleared > cloudQuestsCleared) {
              localIsMoreAdvanced = true;
            } else if (localQuestDbCount > 0 && cloudQuestDbCount === 0) {
              localIsMoreAdvanced = true;
            } else if (localUpdatedAt > cloudUpdatedAt) {
              // Fallback to timestamp
              localIsMoreAdvanced = true;
            }
          }
        }

        mergedProfile = this.mergeQuestDatabases(localIsMoreAdvanced ? localProfile : cloudProfile, localProfile, cloudProfile);

        console.log(`[Sync Conflict Check] Cloud Level: ${cloudLevel} (XP: ${cloudXp}), Local Level: ${localLevel} (XP: ${localXp}). More advanced: ${localIsMoreAdvanced ? 'Local' : 'Cloud'}`);

        // 3. Conflict Resolution
        if (!localProfile.player) {
          // Empty clean local device - take cloud
          console.log("Empty device. Direct restoral of cloud profile.");
          this.applyProfileToLocal(mergedProfile);
          this.setSyncState("success", "Restored latest profile from cloud!");
        } else if (localIsMoreAdvanced) {
          // Local is higher progress, push local back up to Supabase to update it
          console.log("Local metrics are superior. Syncing local progress up to remote storage.");
          await this.uploadProfileToCloud(mergedProfile);
          this.setSyncState("success", "Synced advanced offline progress to Cloud!");
        } else {
          // Cloud has higher progress - apply to local device
          console.log("Cloud metrics are superior. Replacing local database state.");
          this.applyProfileToLocal(mergedProfile);
          if (mergedProfile !== cloudProfile) {
            await this.uploadProfileToCloud(mergedProfile);
          }
          this.setSyncState("success", "Restored advanced levels from cloud.");
        }
      } else {
        // First-time user profile initialization in Cloud.
        // ACCOUNT ISOLATION: a user with no cloud row is a NEW PLAYER. If the
        // local cache belongs to this same user (e.g. their cloud row was
        // removed), back it up. Otherwise initialize a genuine fresh starting
        // profile — NEVER the previous player's leftover local state.
        if (localProfile.player) {
          console.log("No cloud row, but local data belongs to this user — restoring cloud backup from local.");
          await this.uploadProfileToCloud(localProfile);
        } else {
          console.log("Initializing first-time cloud profile with a genuine new-player starting state.");
          const freshProfile = this.defaultProfileProvider
            ? this.defaultProfileProvider()
            : localProfile;
          await this.uploadProfileToCloud(freshProfile);
          this.applyProfileToLocal(freshProfile);
        }
        this.setSyncState("success", "New player profile initialized successfully.");
      }
    } catch (e: any) {
      console.error("Cloud Sync Synchronization Error:", e);
      this.setSyncState("error", `Sync anomaly: ${e.message || e}`);
    } finally {
      this.isSyncing = false;
      // First completed sync marks the app as hydrated for the current user.
      // Until then, automatic uploads are blocked so the React state left over
      // from a previous account/session can never be pushed to the new user's
      // cloud row (the boot-upload poisoning bug).
      this.bootHydrationDone = true;
    }
  }

  /**
   * Pulls local storage keys and assemblies them into a single Unified Profile JSON object
   */
  public getLocalProfileFromStorage(): UnifiedProfile {
    const player = JSON.parse(localStorage.getItem("monarch_player_v10") || "null");
    const attributes = JSON.parse(localStorage.getItem("monarch_attributes_v10") || "[]");
    const skills = JSON.parse(localStorage.getItem("monarch_skills_v10") || "[]");
    const directives = JSON.parse(localStorage.getItem("monarch_directives_v10") || "[]");
    const dungeons = JSON.parse(localStorage.getItem("monarch_dungeons_v10") || "[]");
    const logs = JSON.parse(localStorage.getItem("monarch_logs_v10") || "[]");
    const aiAnalysis = JSON.parse(localStorage.getItem("monarch_ai_analysis_v10") || "null");
    const settings = this.readJsonObject(this.settingsKey);
    const activeQuestId = localStorage.getItem("monarch_active_quest_v10") || null;
    const practiceQuests = JSON.parse(localStorage.getItem("monarch_practice_quests_v10") || "[]");
    const questDatabase = this.readJsonArray(this.questDatabaseKey);
    const pressureScenarios = this.readJsonArray(this.pressureDatabaseKey);
    const activePracticeQuestId = localStorage.getItem("monarch_active_practice_quest_id_v10") || null;
    const completedQuestIds = this.readJsonArray("monarch_completed_quest_ids_v10");
    const failedQuestIds = this.readJsonArray("monarch_failed_quest_ids_v10");
    const recentlyGeneratedQuestIds = this.readJsonArray("monarch_recently_generated_quest_ids_v10");
    const questRotationSeed = localStorage.getItem("monarch_quest_rotation_seed_v10") || null;
    const audioSettings = this.readJsonObject("monarch_sys_audio_settings");
    let evolutionHistory: any[] = [];
    try {
      const savedHist = localStorage.getItem("monarch_evolution_history_v5");
      evolutionHistory = savedHist ? JSON.parse(savedHist) : [];
    } catch (e) {
      evolutionHistory = [];
    }
    
    const localUpdatedStampStr = localStorage.getItem("monarch_sync_updated_at") || "0";
    const updated_at = parseInt(localUpdatedStampStr, 10) || 0;

    return {
      player,
      attributes,
      skills,
      directives,
      dungeons,
      logs,
      aiAnalysis,
      settings,
      activeQuestId,
      practiceQuests,
      questDatabase,
      pressureScenarios,
      activePracticeQuestId,
      completedQuestIds,
      failedQuestIds,
      recentlyGeneratedQuestIds,
      questRotationSeed,
      audioSettings,
      evolutionHistory,
      updated_at
    };
  }

  private readJsonArray(key: string): any[] {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn(`Failed reading local profile array '${key}' for cloud sync:`, e);
      return [];
    }
  }

  private readJsonObject(key: string): any | null {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.warn(`Failed reading local profile object '${key}' for cloud sync:`, e);
      return null;
    }
  }

  private normalizeProfile(profile: UnifiedProfile): UnifiedProfile {
    const safeProfile = (profile || {}) as UnifiedProfile;
    return {
      ...safeProfile,
      attributes: Array.isArray(safeProfile.attributes) ? safeProfile.attributes : [],
      skills: Array.isArray(safeProfile.skills) ? safeProfile.skills : [],
      directives: Array.isArray(safeProfile.directives) ? safeProfile.directives : [],
      dungeons: Array.isArray(safeProfile.dungeons) ? safeProfile.dungeons : [],
      logs: Array.isArray(safeProfile.logs) ? safeProfile.logs : [],
      practiceQuests: Array.isArray(safeProfile.practiceQuests) ? safeProfile.practiceQuests : [],
      questDatabase: Array.isArray(safeProfile.questDatabase) ? safeProfile.questDatabase : [],
      pressureScenarios: Array.isArray(safeProfile.pressureScenarios) ? safeProfile.pressureScenarios : [],
      completedQuestIds: Array.isArray(safeProfile.completedQuestIds) ? safeProfile.completedQuestIds : [],
      failedQuestIds: Array.isArray(safeProfile.failedQuestIds) ? safeProfile.failedQuestIds : [],
      recentlyGeneratedQuestIds: Array.isArray(safeProfile.recentlyGeneratedQuestIds) ? safeProfile.recentlyGeneratedQuestIds : [],
      evolutionHistory: Array.isArray(safeProfile.evolutionHistory) ? safeProfile.evolutionHistory : [],
      activeQuestId: safeProfile.activeQuestId || null,
      activePracticeQuestId: safeProfile.activePracticeQuestId || null,
      questRotationSeed: safeProfile.questRotationSeed || null,
      updated_at: safeProfile.updated_at || 0
    };
  }

  private mergeById(primary: any[], fallback: any[], idKeys: string[]): any[] {
    const merged = new Map<string, any>();
    [...fallback, ...primary].forEach((item, index) => {
      if (!item) return;
      const id = idKeys.map(key => item[key]).find(Boolean) || `item-${index}`;
      merged.set(String(id), item);
    });
    return Array.from(merged.values());
  }

  private mergeQuestDatabases(preferred: UnifiedProfile, localProfile: UnifiedProfile, cloudProfile: UnifiedProfile): UnifiedProfile {
    const preferredQuestDb = preferred.questDatabase || [];
    const preferredPressure = preferred.pressureScenarios || [];
    const localQuestDb = localProfile.questDatabase || [];
    const cloudQuestDb = cloudProfile.questDatabase || [];
    const localPressure = localProfile.pressureScenarios || [];
    const cloudPressure = cloudProfile.pressureScenarios || [];

    return {
      ...preferred,
      questDatabase: this.mergeById(preferredQuestDb, preferred === localProfile ? cloudQuestDb : localQuestDb, ["id"]),
      pressureScenarios: this.mergeById(preferredPressure, preferred === localProfile ? cloudPressure : localPressure, ["scenarioId", "id"])
    };
  }

  /**
   * Commit fetched profile values down to local storage and tell React states to update
   */
  public applyProfileToLocal(profile: UnifiedProfile) {
    if (!profile || !profile.player) return;

    this.isApplyingCloudData = true;

    localStorage.setItem("monarch_player_v10", JSON.stringify(profile.player));
    localStorage.setItem("monarch_attributes_v10", JSON.stringify(profile.attributes));
    localStorage.setItem("monarch_skills_v10", JSON.stringify(profile.skills));
    localStorage.setItem("monarch_directives_v10", JSON.stringify(profile.directives));
    localStorage.setItem("monarch_dungeons_v10", JSON.stringify(profile.dungeons));
    localStorage.setItem("monarch_logs_v10", JSON.stringify(profile.logs));
    if (profile.aiAnalysis) {
      localStorage.setItem("monarch_ai_analysis_v10", JSON.stringify(profile.aiAnalysis));
    } else {
      localStorage.removeItem("monarch_ai_analysis_v10");
    }
    if (profile.settings) {
      localStorage.setItem(this.settingsKey, JSON.stringify(profile.settings));
    }
    localStorage.setItem("monarch_active_quest_v10", profile.activeQuestId || "");
    localStorage.setItem("monarch_practice_quests_v10", JSON.stringify(profile.practiceQuests || []));
    if (Array.isArray(profile.questDatabase) && profile.questDatabase.length > 0) {
      localStorage.setItem(this.questDatabaseKey, JSON.stringify(profile.questDatabase));
    }
    if (Array.isArray(profile.pressureScenarios) && profile.pressureScenarios.length > 0) {
      localStorage.setItem(this.pressureDatabaseKey, JSON.stringify(profile.pressureScenarios));
    }
    if (profile.activePracticeQuestId) {
      localStorage.setItem("monarch_active_practice_quest_id_v10", profile.activePracticeQuestId);
    } else {
      localStorage.removeItem("monarch_active_practice_quest_id_v10");
    }
    localStorage.setItem("monarch_completed_quest_ids_v10", JSON.stringify(profile.completedQuestIds || []));
    localStorage.setItem("monarch_failed_quest_ids_v10", JSON.stringify(profile.failedQuestIds || []));
    localStorage.setItem("monarch_recently_generated_quest_ids_v10", JSON.stringify(profile.recentlyGeneratedQuestIds || []));
    if (profile.questRotationSeed) {
      localStorage.setItem("monarch_quest_rotation_seed_v10", profile.questRotationSeed);
    }
    if (profile.audioSettings) {
      localStorage.setItem("monarch_sys_audio_settings", JSON.stringify(profile.audioSettings));
    }
    if (profile.evolutionHistory) {
      localStorage.setItem("monarch_evolution_history_v5", JSON.stringify(profile.evolutionHistory));
    }
    localStorage.setItem("monarch_sync_updated_at", (profile.updated_at || Date.now()).toString());

    if (this.updateStateCallback) {
      this.updateStateCallback(profile);
    }

    setTimeout(() => {
      this.isApplyingCloudData = false;
    }, 2500); // safety lockout window
  }

  /**
   * Directly posts metadata object to the `player_profiles` row for verified user
   */
  public async uploadProfileToCloud(profile: UnifiedProfile) {
    const supabase = getSupabase();
    if (!supabase || !this.userSession?.user) return;

    const user = this.userSession.user;
    const now = Date.now();
    const profileWithDatabases = this.normalizeProfile({
      ...profile,
      questDatabase: profile.questDatabase?.length ? profile.questDatabase : this.readJsonArray(this.questDatabaseKey),
      pressureScenarios: profile.pressureScenarios?.length ? profile.pressureScenarios : this.readJsonArray(this.pressureDatabaseKey),
      settings: profile.settings || this.readJsonObject(this.settingsKey),
      completedQuestIds: profile.completedQuestIds?.length ? profile.completedQuestIds : this.readJsonArray("monarch_completed_quest_ids_v10"),
      failedQuestIds: profile.failedQuestIds?.length ? profile.failedQuestIds : this.readJsonArray("monarch_failed_quest_ids_v10"),
      recentlyGeneratedQuestIds: profile.recentlyGeneratedQuestIds?.length ? profile.recentlyGeneratedQuestIds : this.readJsonArray("monarch_recently_generated_quest_ids_v10"),
      questRotationSeed: profile.questRotationSeed || localStorage.getItem("monarch_quest_rotation_seed_v10") || null,
      audioSettings: profile.audioSettings || this.readJsonObject("monarch_sys_audio_settings"),
      updated_at: now
    });
    profileWithDatabases.updated_at = now;
    localStorage.setItem("monarch_sync_updated_at", now.toString());

    const { error } = await supabase.from("player_profiles").upsert(
      {
        id: user.id,
        profile_data: profileWithDatabases,
        updated_at: new Date(now).toISOString()
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase Database Upload Failure:", error);
      throw error;
    }
  }

  /**
   * Debounced dynamic gateway for automatic continuous syncing called on state changes.
   * Keeps network requests minimal and robust.
   */
  public queueCloudSync(currentState: Omit<UnifiedProfile, "updated_at">) {
    const supabase = getSupabase();
    if (!supabase || !this.userSession?.user) return; // Running in local mode
    if (this.isApplyingCloudData) return; // Avoid echoing back retrieved cloud profiles!
    if (!this.bootHydrationDone) return; // Boot gate: never upload pre-hydration (possibly previous-account) state

    const scheduledUserId = this.userSession.user.id;

    if (this.uploadTimer) {
      clearTimeout(this.uploadTimer);
    }

    this.uploadTimer = setTimeout(async () => {
      try {
        // STALE-SESSION GUARD: if the authenticated user changed between
        // scheduling and firing, discard this upload — it belongs to the old
        // account and must never be written to the new account's row.
        if (this.userSession?.user?.id !== scheduledUserId) {
          console.log(`[Sync] Discarded stale upload for ${scheduledUserId.slice(0, 8)}… — current user differs.`);
          return;
        }
        const payload: UnifiedProfile = {
          ...currentState,
          updated_at: Date.now()
        };
        await this.uploadProfileToCloud(payload);
        this.setSyncState("success", "Progress safely synced with Cloud Storage!");
      } catch (e: any) {
        this.setSyncState("error", `Auto-backup failed: ${e.message || e}`);
      }
    }, 1500); // 1.5 seconds debounce
  }

  public async syncCurrentLocalProfileToCloud() {
    const supabase = getSupabase();
    if (!supabase || !this.userSession?.user || this.isApplyingCloudData) return;
    await this.uploadProfileToCloud(this.getLocalProfileFromStorage());
  }

  /**
   * Manual Sync push action
   */
  public async manualSyncPush() {
    this.setSyncState("syncing", "Pushing local data to cloud...");
    try {
      const local = this.getLocalProfileFromStorage();
      await this.uploadProfileToCloud(local);
      this.setSyncState("success", "Manual Cloud Push Successful!");
    } catch (e: any) {
      this.setSyncState("error", `Push failed: ${e.message || e}`);
    }
  }

  /**
   * Manual Sync pull action
   */
  public async manualSyncPull() {
    this.setSyncState("syncing", "Pulling latest cloud data...");
    try {
      const supabase = getSupabase();
      if (!supabase || !this.userSession?.user) {
        throw new Error("Credentials or login sessions missing.");
      }
      const { data, error } = await supabase
        .from("player_profiles")
        .select("profile_data")
        .eq("id", this.userSession.user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const cloudProfile = this.normalizeProfile(data.profile_data as UnifiedProfile);
        const localProfile = this.getLocalProfileFromStorage();
        const cloudWithLocalDatabases = this.mergeQuestDatabases(cloudProfile, localProfile, cloudProfile);
        this.applyProfileToLocal(cloudWithLocalDatabases);
        if (
          (localProfile.questDatabase?.length || 0) > 0 &&
          (cloudProfile.questDatabase?.length || 0) === 0
        ) {
          await this.uploadProfileToCloud(cloudWithLocalDatabases);
        }
        this.setSyncState("success", "Manual Cloud Pull Successful!");
      } else {
        this.setSyncState("error", "No Cloud profile detected.");
      }
    } catch (e: any) {
      this.setSyncState("error", `Pull failed: ${e.message || e}`);
    }
  }

  public async signInWithGoogle() {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase is offline/not initialized.");

    const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();

    if (isNative) {
      // Native OAuth uses an external browser and returns through the custom app URL scheme.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "monarchspinner://callback",
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      if (data?.url) {
        await CapBrowser.open({ url: data.url, windowName: "_blank" });
      }
      return data;
    } else {
      // Web OAuth should use Supabase's normal top-level redirect flow.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    }
  }

  public async signOut() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.userSession = null;
    localStorage.removeItem("monarch_logged_v10");
    // Full player-scoped cleanup: every player-owned key is purged and live
    // React state is reset, so the next login starts from a clean boundary.
    this.handleSignedOutCleanup();
  }

  /**
   * Called immediately after a successful Full Game Reset.
   *
   * 1. Purges every player-owned localStorage key (Quest Database preserved).
   * 2. Resets ALL live React player state to the genuine starting state — the
   *    user does NOT need to refresh the browser.
   * 3. Blocks background uploads while the fresh state hydrates, so the old
   *    (pre-reset) in-memory state can never be pushed back to the cloud.
   * 4. Re-pulls the reset cloud profile.
   */
  public async handlePostReset() {
    console.log("[Game Reset] Reinitializing live application state to a fresh start.");
    this.isApplyingCloudData = true; // suppress uploads during the transition
    purgePlayerScopedStorage();
    this.stateResetCallback?.();
    this.setSyncState("syncing", "Reinitializing fresh system state...");
    try {
      // Force the re-pull: a concurrent sync must never cause the post-reset
      // hydration to be silently skipped.
      await this.triggerInitialSync(true);
    } finally {
      setTimeout(() => {
        this.isApplyingCloudData = false;
      }, 2500);
    }
  }
}

export const cloudSync = new CloudSyncManager();
