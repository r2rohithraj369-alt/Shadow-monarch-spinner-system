/**
 * monarchEvents/types.ts — Central Monarch Event Notification System types.
 *
 * The notification layer is a pure EVENT PRESENTATION layer. It never creates
 * progression — it reacts to authoritative progression events dispatched by
 * the game systems (App.tsx watchers / completion handlers).
 */

export type MonarchEventType =
  | "PLAYER_LEVEL_UP"
  | "SKILL_LEVEL_UP"
  | "EVOLUTION_TRIAL_PASSED"
  | "ASCENSION_PASSED"
  | "HIGH_THREAT_MATCH";

export type MonarchSoundKind = MonarchEventType;

/**
 * A single, deduplicated Monarch system notification.
 *
 * `id` is the deterministic event identity used for de-duplication across
 * re-renders, Strict Mode double-rides, refresh, and sign-out/in:
 *
 *   player-level-up:{userId}:{newLevel}
 *   skill-level-up:{userId}:{skillId}:{newLevel}
 *   evolution-pass:{userId}:{recordId}
 *   ascension-pass:{userId}:{newRank}
 *   threat:{userId}:{matchId}
 */
export interface MonarchEvent {
  id: string;
  type: MonarchEventType;
  /** Owner for account-isolated dedup + the persisted processed-registry. */
  userId: string;
  /** Primary header text, e.g. "LEVEL UP". */
  title: string;
  /** Subtitle line, e.g. "PLAYER LEVEL 6". */
  subtitle: string;
  /** Optional emphasis value (e.g. threat percentage). */
  primaryValue?: string;
  /** Previous value for transition events (e.g. old skill level). */
  previousValue?: string | number;
  /** New value for transition events (e.g. new skill level). */
  newValue?: string | number;
  /** Optional long-form description. */
  description?: string;
  /** Icon key resolved by the overlay to a lucide-react icon. */
  icon: string;
  /** Epoch ms when the authoritative transition occurred. */
  occurredAt: number;
}