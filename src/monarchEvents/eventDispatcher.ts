/**
 * monarchEvents/eventDispatcher.ts — Central Monarch Event Dispatcher.
 *
 * One authoritative funnel for every system notification:
 *
 *   AUTHORITATIVE GAME EVENT
 *         ↓
 *   MonarchEventDispatcher
 *         ↓
 *   Visual popup (+ sound) → auto-dismiss → next queued event
 *
 * Guarantees (Part 16–17):
 *   - ONE event at a time (strict queue, 3.2s display window, then next).
 *   - Deterministic event-id dedup that survives re-renders, Strict Mode,
 *     refresh and sign-out/in (registry persisted per user in localStorage).
 *   - NEVER suppresses legitimate future events: a later level/rank/match
 *     yields a NEW id.
 *   - The dispatcher NEVER mutates game state — it is presentation only.
 */

import { MonarchEvent } from "./types";

const REGISTRY_KEY = "monarch_event_registry_v1";
const REGISTRY_CAP_PER_USER = 400;
const DISPLAY_MS = 3200;

class MonarchEventDispatcher {
  private listeners = new Set<(event: MonarchEvent | null) => void>();
  private queue: MonarchEvent[] = [];
  private current: MonarchEvent | null = null;
  private processed = new Set<string>();
  private userId: string | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Current signed-in owner for the processed-event registry. */
  init(userId: string) {
    if (this.userId === userId) return;
    this.userId = userId || "__guest__";
    // Abandon any pending queue from the previous account — its events belong
    // to a different owner and must never pop up for the new account.
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setCurrent(null);
    this.loadRegistry(this.userId);
  }

  /** Account switch / logout — drop cross-account residue. */
  reset() {
    this.userId = null;
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setCurrent(null);
  }

  subscribe(callback: (event: MonarchEvent | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.current);
    return () => {
      this.listeners.delete(callback);
    };
  }

  peek(): MonarchEvent | null {
    return this.current;
  }

  /**
   * Enqueue an event. Deduplicated by its deterministic id; already-processed
   * events (including across app restarts) are silently dropped.
   */
  enqueue(event: MonarchEvent) {
    if (!event || !event.id) return;
    const owner = this.userId || event.userId || "__guest__";
    if (event.userId && event.userId !== "__guest__" && this.userId && event.userId !== this.userId) {
      // Registry session belongs to another account — ignore foreign events.
      return;
    }
    if (this.processed.has(event.id)) return;
    this.processed.add(event.id);
    this.persistRegistry(owner);

    this.queue.push(event);
    if (!this.current) this.advance();
  }

  /** Advance to the next queued event (or show nothing). */
  private advance() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const next = this.queue.shift() || null;
    this.setCurrent(next);
    if (next) {
      this.timer = setTimeout(() => this.advance(), DISPLAY_MS);
    }
  }

  /** Let the user dismiss the current popup early. */
  dismiss() {
    if (this.current) this.advance();
  }

  private setCurrent(event: MonarchEvent | null) {
    this.current = event;
    this.listeners.forEach((cb) => cb(event));
  }

  private loadRegistry(userId: string) {
    this.processed = new Set<string>();
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const ids = parsed[userId];
        if (Array.isArray(ids)) this.processed = new Set(ids);
      }
    } catch {
      // Registry unreadable — in-memory dedup still protects this session.
    }
  }

  private persistRegistry(userId: string) {
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[userId] = Array.from(this.processed).slice(-REGISTRY_CAP_PER_USER);
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(parsed));
    } catch {
      // Storage unavailable — nothing fatal.
    }
  }

  /** Test-only: clear the in-memory registry + queue. */
  __resetForTests() {
    this.userId = null;
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.processed = new Set();
    this.setCurrent(null);
    try {
      localStorage.removeItem(REGISTRY_KEY);
    } catch {
      /* noop */
    }
  }
}

// DISPLAY_MS is intentionally shared with the overlay; keep in sync via export.
export const MONARCH_EVENT_DISPLAY_MS = DISPLAY_MS;

export const monarchEventDispatcher = new MonarchEventDispatcher();

export { REGISTRY_KEY, DISPLAY_MS };