/**
 * MonarchEventOverlay.tsx — Reusable full-screen Monarch system notification.
 *
 * Rendered ONCE by App. Reads the current event from the central dispatcher,
 * plays the matching sound and shows a single animated popup that auto-dismisses.
 *
 * Mobile-safe:
 *   - full-viewport pointer-events-none wrapper (gameplay never blocked),
 *   - the card itself is the only interactive element (tap to dismiss),
 *   - max-width constraints + safe-area padding, no horizontal overflow,
 *   - cheap CSS/motion animations only (no heavy particle canvas).
 */

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Zap, Swords, ShieldCheck, Trophy, Skull } from "lucide-react";
import { monarchEventDispatcher } from "./eventDispatcher";
import { monarchSoundManager } from "./monarchSoundManager";
import { MonarchEvent, MonarchEventType } from "./types";

const ICONS: Record<MonarchEventType, React.ComponentType<any>> = {
  PLAYER_LEVEL_UP: Zap,
  SKILL_LEVEL_UP: Swords,
  EVOLUTION_TRIAL_PASSED: ShieldCheck,
  ASCENSION_PASSED: Trophy,
  HIGH_THREAT_MATCH: Skull,
};

function eventAccent(type: MonarchEventType): { border: string; glow: string; ring: string; title: string } {
  switch (type) {
    case "PLAYER_LEVEL_UP":
      return { border: "border-[#00D9FF]/40", glow: "shadow-[0_0_60px_rgba(0,217,255,0.25)]", ring: "bg-[#00D9FF]/10", title: "text-[#00D9FF]" };
    case "SKILL_LEVEL_UP":
      return { border: "border-[#7B2FFF]/50", glow: "shadow-[0_0_60px_rgba(123,47,255,0.35)]", ring: "bg-[#7B2FFF]/15", title: "text-[#B78BFF]" };
    case "EVOLUTION_TRIAL_PASSED":
      return { border: "border-[#7B2FFF]/60", glow: "shadow-[0_0_70px_rgba(123,47,255,0.45)]", ring: "bg-[#7B2FFF]/20", title: "text-[#C084FC]" };
    case "ASCENSION_PASSED":
      return { border: "border-amber-400/40", glow: "shadow-[0_0_70px_rgba(251,191,36,0.3)]", ring: "bg-amber-400/10", title: "text-amber-300" };
    case "HIGH_THREAT_MATCH":
      return { border: "border-red-500/50", glow: "shadow-[0_0_70px_rgba(239,68,68,0.4)]", ring: "bg-red-500/10", title: "text-red-400" };
    default:
      return { border: "border-[#7B2FFF]/40", glow: "", ring: "", title: "text-white" };
  }
}
export function MonarchEventOverlay() {
  const [event, setEvent] = useState<MonarchEvent | null>(null);

  useEffect(() => {
    return monarchEventDispatcher.subscribe((e) => {
      setEvent(e);
    });
  }, []);

  // Play the SFX for each newly displayed event (never more than one at a time).
  useEffect(() => {
    if (event) monarchSoundManager.play(event.type);
  }, [event?.id, event?.type]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        {event && (
          <motion.div
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
            style={{
              paddingTop: "max(2rem, env(safe-area-inset-top))",
              paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
            }}
          >
            {/* Screen glow + expanding energy ring */}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
            <motion.div
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className={`absolute w-[70vmin] h-[70vmin] rounded-full ${eventAccent(event.type).ring}`}
            />

            <motion.div
              initial={{ scale: 0.82, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={() => monarchEventDispatcher.dismiss()}
              className={`relative w-full max-w-[92vw] sm:max-w-md mx-auto pointer-events-auto cursor-pointer select-none rounded-2xl border-2 ${eventAccent(event.type).border} ${
                eventAccent(event.type).glow
              } bg-[#050308]/95 px-5 py-6 sm:px-8 sm:py-7 text-center overflow-hidden`}
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B2FFF]/70 to-transparent" />

              <span className="text-[9px] font-mono tracking-[0.35em] text-gray-500 uppercase font-black">
                Shadow Monarch System · Notification
              </span>

              <div className="mt-4 mb-3 flex items-center justify-center">
                <EventIcon type={event.type} />
              </div>

              <h2
                className={`text-lg sm:text-2xl font-black font-mono tracking-widest uppercase ${eventAccent(event.type).title} text-center animate-pulse`}
              >
                {event.title}
              </h2>

              <p className="mt-1.5 text-sm sm:text-base font-extrabold font-mono tracking-wide text-white uppercase text-center">
                {event.subtitle}
              </p>

              {event.primaryValue && (
                <p className="mt-1 text-[11px] sm:text-sm font-mono text-gray-300 uppercase text-center">
                  <span className="text-[#00D9FF] font-black">{event.primaryValue}</span>
                </p>
              )}

              {event.description && (
                <p className="mt-3 text-[10px] sm:text-[11px] font-sans text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {event.description}
                </p>
              )}

              <div className="mt-4 text-[9px] text-gray-600 font-mono uppercase flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B2FFF] animate-pulse" />
                System notification · tap to dismiss
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventIcon({ type }: { type: MonarchEventType }) {
  const Cmp = ICONS[type] || Zap;
  return (
    <div className="relative w-14 h-14 rounded-full border border-[#7B2FFF]/30 bg-black/60 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-[#7B2FFF]/20 animate-ping" />
      <Cmp className="w-6 h-6 text-[#C084FC]" />
    </div>
  );
}