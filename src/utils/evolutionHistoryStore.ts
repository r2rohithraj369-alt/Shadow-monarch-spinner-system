/**
 * evolutionHistoryStore.ts — Durable, cloud-first Evolution History records.
 *
 * DESIGN
 * ------
 * The Evolution History is a PERMANENT historical record.
 *
 * LocalStorage (`monarch_evolution_history_v5`) remains ONLY a fast cache for
 * UI restoration. The durable source of truth is the dedicated Supabase
 * `evolution_history` table (one row per completed Evolution session), which:
 *
 *   - is keyed by `user_id` (auth.uid() === user_id) with Row Level Security,
 *   - is APPEND-ONLY from the app's perspective (insert-or-ignore by a
 *     deterministic `(user_id, record_id)` identity — the game layer never
 *     updates or deletes rows),
 *   - never lets stale/empty local caches overwrite valid cloud history,
 *   - keeps historical **name snapshots** so a renamed skill still shows the
 *     original name on old records.
 *
 * All functions here are pure/testable apart from the two thin cloud-access
 * helpers, which take the supabase client as an argument.
 */

export const EVOLUTION_HISTORY_TABLE = "evolution_history";

export const EVOLUTION_HISTORY_LOCAL_KEY = "monarch_evolution_history_v5";
export const EVOLUTION_HISTORY_MIGRATION_KEY = "monarch_evolution_history_migration_v1";

export type HistorySyncStatus = "idle" | "loading" | "synced" | "error";

/** Minimal supabase-js-like client surface used by this module (testable). */
export interface HistoryDbClient {
  from: (table: string) => any;
}

/** Extract a deterministic record identity from any stored record. */
export function getHistoryRecordId(record: any): string | null {
  if (!record) return null;
  if (typeof record.id === "string" && record.id.trim()) return record.id.trim();
  if (typeof record.record_id === "string" && record.record_id.trim()) return record.record_id.trim();
  return null;
}

/** Validate that a record is well-formed enough to preserve. */
export function isValidHistoryRecord(record: any): boolean {
  if (!record || typeof record !== "object") return false;
  if (!getHistoryRecordId(record)) return false;
  if (record.timestamp !== undefined && typeof record.timestamp !== "string") return false;
  if (record.xpEarned !== undefined && typeof record.xpEarned !== "number") return false;
  if (record.combatEfficiency !== undefined && typeof record.combatEfficiency !== "number") return false;
  return true;
}

/** Filter a list to valid, id-capable history records (de-duplicated). */
export function normalizeHistoryRecords(records: any[] | undefined | null): any[] {
  if (!Array.isArray(records)) return [];
  const seen = new Set<string>();
  const out: any[] = [];
  for (const rec of records) {
    if (!isValidHistoryRecord(rec)) continue;
    const id = getHistoryRecordId(rec);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(rec);
  }
  return out;
}
/**
 * Merge two history lists with CLOUD PRECEDENCE.
 * - Records in both lists: the cloud copy wins (its snapshot is the durable one).
 * - Records only in local: kept (created offline — never discarded).
 * - Records only in cloud: kept.
 * Never returns fewer records than the union of both inputs.
 */
export function mergeHistoryRecords(cloud: any[] | undefined | null, local: any[] | undefined | null): any[] {
  const normalizedCloud = normalizeHistoryRecords(cloud);
  const normalizedLocal = normalizeHistoryRecords(local);

  const map = new Map<string, any>();
  // Local first (base), then cloud (wins conflicts).
  for (const rec of normalizedLocal) {
    const id = getHistoryRecordId(rec)!;
    map.set(id, rec);
  }
  for (const rec of normalizedCloud) {
    const id = getHistoryRecordId(rec)!;
    map.set(id, rec);
  }
  const merged = Array.from(map.values());
  return merged.sort((a, b) => {
    const ta = a.timestamp || a.completion_date || a.created_at || "";
    const tb = b.timestamp || b.completion_date || b.created_at || "";
    return tb.localeCompare(ta);
  });
}

/**
 * Hydration guard: returns true ONLY when it is safe for `candidate` to become
 * the local view. A plain empty array is NEVER allowed to overwrite a
 * non-empty current record set unless the cloud pull is known to have
 * succeeded (a brand-new user legitimately has zero records).
 */
export function shouldApplyHistoryCandidate(
  candidate: any[] | undefined | null,
  current: any[] | undefined | null,
  hydratedFromCloud: boolean
): boolean {
  const candidateList = Array.isArray(candidate) ? candidate : [];
  const currentList = Array.isArray(current) ? current : [];
  if (candidateList.length >= currentList.length) return true;
  return hydratedFromCloud === true;
}

/** Convert a stored client record into a normalized `evolution_history` table row. */
export function historyRecordToRow(record: any, userId: string): Record<string, any> {
  const skillMeta = record?.questMeta || {};
  const skillName = skillMeta.skillName || record?.skillName || record?.skill_name_snapshot || null;
  const trialName = skillMeta.questName || record?.questName || record?.trial_name_snapshot || record?.drillTitle || null;
  const trialId = skillMeta.questId || record?.questId || record?.trial_id || null;
  const skillId = skillMeta.skillId || record?.skillId || record?.skill_id || null;
  const difficulty = skillMeta.difficulty || record?.difficulty || record?.trial_difficulty || (record?.pressureScenario as any)?.difficultyWord || null;

  let result = "PASSED";
  if (typeof record?.result === "string" && /^(PASSED|FAILED)$/i.test(record.result)) {
    result = record.result.toUpperCase();
  } else {
    if (record?.questStatus && record.questStatus.met === false) result = "FAILED";
    if (record?.pressureScenario && record.pressureScenario.met === false) result = "FAILED";
  }

  return {
    record_id: getHistoryRecordId(record) || `eh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: userId,
    skill_id: skillId,
    skill_name_snapshot: skillName,
    trial_id: trialId,
    trial_name_snapshot: trialName,
    trial_difficulty: difficulty,
    completion_date: record?.completion_date || record?.timestamp || new Date().toISOString(),
    skill_level_at_completion: record?.skillLevelAtCompletion ?? record?.skill_level_at_completion ?? null,
    player_level_at_completion: record?.playerLevelAtCompletion ?? record?.player_level_at_completion ?? null,
    xp_reward: typeof record?.xpEarned === "number" ? record.xpEarned : record?.xpReward || 0,
    mastery_reward: record?.masteryReward ?? record?.mastery_reward ?? 0,
    result,
    source_scope: "EVOLUTION_CHAMBER_SESSION",
    performance: {
      drillTitle: record?.drillTitle || null,
      summary: record?.summary || null,
      oversCount: record?.oversCount ?? null,
      combatEfficiency: record?.combatEfficiency ?? null,
      isMatchSim: record?.isMatchSim ?? false,
      counts: record?.counts || null,
      balls: record?.balls || null,
      questStatus: record?.questStatus || null,
      questMeta: record?.questMeta || null,
      pressureScenario: record?.pressureScenario || null,
    },
  };
}

/** Convert a cloud `evolution_history` row back into a UI-friendly record. */
export function historyRowToRecord(row: any): any {
  if (!row) return null;
  const perf = row.performance && typeof row.performance === "object" ? row.performance : {};
  return {
    id: row.record_id || row.id,
    record_id: row.record_id,
    skillId: row.skill_id,
    skillName: row.skill_name_snapshot || perf.skillName || null,
    skill_name_snapshot: row.skill_name_snapshot,
    trialId: row.trial_id,
    trialName: row.trial_name_snapshot,
    trial_name_snapshot: row.trial_name_snapshot,
    trial_difficulty: row.trial_difficulty,
    timestamp: row.completion_date || row.created_at || null,
    completion_date: row.completion_date,
    skillLevelAtCompletion: row.skill_level_at_completion,
    skill_level_at_completion: row.skill_level_at_completion,
    playerLevelAtCompletion: row.player_level_at_completion,
    player_level_at_completion: row.player_level_at_completion,
    xpEarned: row.xp_reward,
    xpReward: row.xp_reward,
    masteryReward: row.mastery_reward,
    result: row.result,
    sourceScope: row.source_scope,
    created_at: row.created_at,
    updated_at: row.updated_at,
    drillTitle: perf.drillTitle || null,
    summary: perf.summary || null,
    oversCount: perf.oversCount ?? null,
    combatEfficiency: perf.combatEfficiency ?? null,
    isMatchSim: perf.isMatchSim ?? false,
    counts: perf.counts || null,
    balls: perf.balls || null,
    questStatus: perf.questStatus || null,
    questMeta: perf.questMeta || null,
    pressureScenario: perf.pressureScenario || null,
  };
}
/** Read the migration marker for a specific user (ownership-gated). */
export function getMigrationMarker(userId: string): { migratedAt: number; count: number } | null {
  try {
    const raw = localStorage.getItem(EVOLUTION_HISTORY_MIGRATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && parsed[userId] ? parsed[userId] : null;
  } catch {
    return null;
  }
}

/** Persist the migration marker for a user. */
export function setMigrationMarker(userId: string, count: number): void {
  try {
    const raw = localStorage.getItem(EVOLUTION_HISTORY_MIGRATION_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[userId] = { migratedAt: Date.now(), count };
    localStorage.setItem(EVOLUTION_HISTORY_MIGRATION_KEY, JSON.stringify(parsed));
  } catch {
    // Storage unavailable — an idempotent migration simply re-runs next launch.
  }
}

/** Read the local history cache for the current device. */
export function readLocalHistoryCache(): any[] {
  try {
    const raw = localStorage.getItem(EVOLUTION_HISTORY_LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Write the local history cache (kept as fast UI cache only). */
export function writeLocalHistoryCache(records: any[]): void {
  try {
    localStorage.setItem(EVOLUTION_HISTORY_LOCAL_KEY, JSON.stringify(records));
  } catch {
    // Storage unavailable — the cloud row remains authoritative.
  }
}

/**
 * Fetch ALL owned history rows from the dedicated table.
 * RLS enforces `auth.uid() = user_id` server-side, so rows of other users can
 * never be returned.
 */
export async function fetchCloudHistory(
  client: HistoryDbClient | null,
  userId: string
): Promise<{ records: any[]; ok: boolean; error?: any }> {
  if (!client) return { records: [], ok: false, error: "DB_OFFLINE" };
  try {
    const { data, error } = await client
      .from(EVOLUTION_HISTORY_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return { records: [], ok: false, error };
    const records = (Array.isArray(data) ? data : [])
      .map((row: any) => historyRowToRecord(row))
      .filter(Boolean) as any[];
    return { records: normalizeHistoryRecords(records), ok: true };
  } catch (e) {
    return { records: [], ok: false, error: e };
  }
}

/**
 * Append (insert-or-ignore) cloud history rows.
 * Idempotent by construction: the DB enforces `unique(user_id, record_id)`, so
 * retries / re-renders / duplicate callbacks can never create two records for
 * the same completed trial.
 */
export async function appendCloudHistory(
  client: HistoryDbClient | null,
  userId: string,
  records: any[]
): Promise<{ inserted: number; ok: boolean; error?: any }> {
  if (!client) return { inserted: 0, ok: false, error: "DB_OFFLINE" };
  const rows = normalizeHistoryRecords(records)
    .map((rec) => historyRecordToRow(rec, userId))
    .filter((row) => row.record_id);
  if (rows.length === 0) return { inserted: 0, ok: true };
  try {
    const { error } = await client
      .from(EVOLUTION_HISTORY_TABLE)
      .upsert(rows, { onConflict: "user_id,record_id", ignoreDuplicates: true });
    if (error) return { inserted: 0, ok: false, error };
    return { inserted: rows.length, ok: true };
  } catch (e) {
    return { inserted: 0, ok: false, error: e };
  }
}

/**
 * SAFE one-time migration of pre-existing local history into the cloud table.
 *
 * Guards enforced here (Part 25):
 *   - Only runs AFTER the authenticated user's ownership has been established
 *     (the caller passes the verified `userId`).
 *   - Never migrates a different user's stale cached data (markers are keyed
 *     per user_id).
 *   - Records are validated and de-duplicated before upload.
 *   - Idempotent: after a successful migration the user's marker is set so it
 *     never re-uploads; repeated runs simply insert-or-ignore.
 */
export async function migrateLocalHistoryToCloud(
  client: HistoryDbClient | null,
  userId: string,
  localRecords: any[]
): Promise<{ migrated: number; alreadyMigrated: boolean; ok: boolean; error?: any }> {
  if (!client) {
    return { migrated: 0, alreadyMigrated: false, ok: false, error: "DB_OFFLINE" };
  }
  const marker = getMigrationMarker(userId);
  if (marker && marker.count > 0) {
    return { migrated: marker.count, alreadyMigrated: true, ok: true };
  }

  const valid = normalizeHistoryRecords(localRecords);
  const res = await appendCloudHistory(client, userId, valid);
  if (res.ok && res.inserted > 0) setMigrationMarker(userId, res.inserted);
  return { migrated: res.inserted, alreadyMigrated: false, ok: res.ok, error: res.error };
}