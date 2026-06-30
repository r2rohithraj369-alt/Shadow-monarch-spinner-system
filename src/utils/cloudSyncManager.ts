import { getSupabase } from "./supabaseClient";
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
  activeQuestId: string | null;
  practiceQuests: any[];
  activePracticeQuestId: string | null;
  evolutionHistory?: any[];
  updated_at: number; // Unix timestamp
}

export type SyncState = "idle" | "syncing" | "success" | "error" | "offline";

class CloudSyncManager {
  private updateStateCallback: ((profile: UnifiedProfile) => void) | null = null;
  private syncStateCallback: ((state: SyncState, msg?: string) => void) | null = null;
  
  private userSession: any = null;
  private isSyncing: boolean = false;
  private uploadTimer: any = null;
  private isApplyingCloudData: boolean = false;

  constructor() {
    this.initAuthListener();
    this.initNativeDeepLinkListener();
    this.initWebPopupListener();
    this.initNetworkListeners();
  }

  /**
   * Register callback to push loaded player states back up to React Component
   */
  public registerStateUpdater(callback: (profile: UnifiedProfile) => void) {
    this.updateStateCallback = callback;
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
      } else {
        this.setSyncState("idle");
      }
    });
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
        // Structure: monarchspinner://callback#access_token=...&refresh_token=...
        if (event.url && event.url.includes("access_token=")) {
          try {
            const hashIndex = event.url.indexOf("#");
            if (hashIndex === -1) return;
            const hash = event.url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              this.setSyncState("syncing", "Restoring secure cloud profile from deep link...");
              const supabase = getSupabase();
              if (supabase) {
                const { error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                });
                if (error) {
                  console.error("[DeepLink] setSession error:", error);
                  this.setSyncState("error", "Authentic flow failed: " + error.message);
                } else {
                  console.log("[DeepLink] Session restored successfully!");
                  await CapBrowser.close();
                  await this.triggerInitialSync();
                }
              }
            }
          } catch (err: any) {
            console.error("[DeepLink] Parse fallback error:", err);
            this.setSyncState("error", "Failed resolving callback coordinates: " + err.message);
          }
        }
      });
    }
  }

  private initWebPopupListener() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", async (event: MessageEvent) => {
        const origin = event.origin;
        // Validate origin
        if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
          return;
        }
        if (event.data?.type === 'SUPABASE_OAUTH_SUCCESS') {
          console.log("[WebPopup] Received login token message from popup!");
          const hash = event.data.hash;
          if (hash && hash.includes("access_token=")) {
            try {
              const cleanedHash = hash.startsWith("#") ? hash.substring(1) : hash;
              const params = new URLSearchParams(cleanedHash);
              const accessToken = params.get("access_token");
              const refreshToken = params.get("refresh_token");

              if (accessToken && refreshToken) {
                this.setSyncState("syncing", "Restoring secure cloud profile from web popup...");
                const supabase = getSupabase();
                if (supabase) {
                  const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                  });
                  if (error) {
                    console.error("[WebPopup] setSession error:", error);
                    this.setSyncState("error", "Authentic flow failed: " + error.message);
                  } else {
                    console.log("[WebPopup] Session restored successfully!");
                    await this.triggerInitialSync();
                  }
                }
              }
            } catch (err: any) {
              console.error("[WebPopup] Parse fallback error:", err);
              this.setSyncState("error", "Failed resolving callback coordinates: " + err.message);
            }
          }
        }
      });
    }
  }

  /**
   * Safe comparison and restoration protocol on initial loading
   */
  public async triggerInitialSync() {
    const supabase = getSupabase();
    if (!supabase || !this.userSession?.user) {
      this.setSyncState("offline", "Login to activate Cloud Synchronization Sync");
      return;
    }

    if (this.isSyncing) return;
    this.isSyncing = true;
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      this.setSyncState("syncing", "Comparing local & remote states...");
      await delay(120);

      this.setSyncState("syncing", "Restoring secure cloud session...");
      await delay(120);

      const user = this.userSession.user;

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
        const cloudProfile = data.profile_data as UnifiedProfile;
        const cloudUpdatedAt = new Date(data.updated_at).getTime() || cloudProfile.updated_at || 0;
        const localUpdatedAt = localProfile.updated_at || 0;

        // Perform multi-metric progression checks as requested!
        const localLevel = localProfile.player?.level || 1;
        const cloudLevel = cloudProfile.player?.level || 1;
        const localXp = localProfile.player?.xp || 0;
        const cloudXp = cloudProfile.player?.xp || 0;

        const localQuestsCleared = localProfile.practiceQuests?.filter(q => q.completed).length || 0;
        const cloudQuestsCleared = cloudProfile.practiceQuests?.filter(q => q.completed).length || 0;

        let localIsMoreAdvanced = false;

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
            } else if (localUpdatedAt > cloudUpdatedAt) {
              // Fallback to timestamp
              localIsMoreAdvanced = true;
            }
          }
        }

        console.log(`[Sync Conflict Check] Cloud Level: ${cloudLevel} (XP: ${cloudXp}), Local Level: ${localLevel} (XP: ${localXp}). More advanced: ${localIsMoreAdvanced ? 'Local' : 'Cloud'}`);

        // 3. Conflict Resolution
        if (!localProfile.player) {
          // Empty clean local device - take cloud
          console.log("Empty device. Direct restoral of cloud profile.");
          this.applyProfileToLocal(cloudProfile);
          this.setSyncState("success", "Restored latest profile from cloud!");
        } else if (localIsMoreAdvanced) {
          // Local is higher progress, push local back up to Supabase to update it
          console.log("Local metrics are superior. Syncing local progress up to remote storage.");
          await this.uploadProfileToCloud(localProfile);
          this.setSyncState("success", "Synced advanced offline progress to Cloud!");
        } else {
          // Cloud has higher progress - apply to local device
          console.log("Cloud metrics are superior. Replacing local database state.");
          this.applyProfileToLocal(cloudProfile);
          this.setSyncState("success", "Restored advanced levels from cloud.");
        }
      } else {
        // First-time user profile initialization in Cloud
        console.log("Initializing first-time cloud backup profile row.");
        await this.uploadProfileToCloud(localProfile);
        this.setSyncState("success", "Cloud profile verified and initialized successfully.");
      }
    } catch (e: any) {
      console.error("Cloud Sync Synchronization Error:", e);
      this.setSyncState("error", `Sync anomaly: ${e.message || e}`);
    } finally {
      this.isSyncing = false;
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
    const activeQuestId = localStorage.getItem("monarch_active_quest_v10") || null;
    const practiceQuests = JSON.parse(localStorage.getItem("monarch_practice_quests_v10") || "[]");
    const activePracticeQuestId = localStorage.getItem("monarch_active_practice_quest_id_v10") || null;
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
      activeQuestId,
      practiceQuests,
      activePracticeQuestId,
      evolutionHistory,
      updated_at
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
    localStorage.setItem("monarch_active_quest_v10", profile.activeQuestId || "");
    localStorage.setItem("monarch_practice_quests_v10", JSON.stringify(profile.practiceQuests));
    if (profile.activePracticeQuestId) {
      localStorage.setItem("monarch_active_practice_quest_id_v10", profile.activePracticeQuestId);
    } else {
      localStorage.removeItem("monarch_active_practice_quest_id_v10");
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
    profile.updated_at = now;
    localStorage.setItem("monarch_sync_updated_at", now.toString());

    const { error } = await supabase.from("player_profiles").upsert(
      {
        id: user.id,
        profile_data: profile,
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

    if (this.uploadTimer) {
      clearTimeout(this.uploadTimer);
    }

    this.uploadTimer = setTimeout(async () => {
      try {
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
        const cloudProfile = data.profile_data as UnifiedProfile;
        this.applyProfileToLocal(cloudProfile);
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
      // Direct Native Redirect utilizing Custom Protocol monarchspinner://callback
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "monarchspinner://callback",
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      if (data?.url) {
        // Open authorization URL in user's browser securely
        await CapBrowser.open({ url: data.url, windowName: "_blank" });
      }
      return data;
    } else {
      // Web redirection utilizing Popup window to avoid iframe block
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      if (data?.url) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.url,
          "google_oauth_popup",
          `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0`
        );
      }
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
    localStorage.removeItem("monarch_sync_updated_at");
    this.setSyncState("idle");
  }
}

export const cloudSync = new CloudSyncManager();
