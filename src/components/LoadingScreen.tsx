import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Compass } from "lucide-react";
import appLogo from "../assets/images/app_logo_1782646701079.jpg";

interface LoadingScreenProps {
  isVisible: boolean;
  durationMs: number; // e.g. 5000-7000 or 2000-3000
  title: string;
  messages: string[];
  onComplete?: () => void;
}

export default function LoadingScreen({
  isVisible,
  durationMs,
  title,
  messages,
  onComplete,
}: LoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(isVisible);

  // Sync rendering state with visibility for fade-out transitions
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setProgress(0);
      setCurrentMessageIndex(0);
    }
  }, [isVisible]);

  // Messages rotation (every 1 second)
  useEffect(() => {
    if (!shouldRender) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [shouldRender, messages]);

  // Loading progress calculation
  useEffect(() => {
    if (!shouldRender) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(currentProgress);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        setTimeout(() => {
          setShouldRender(false);
          if (onComplete) onComplete();
        }, 300); // Small buffer for exit animation
      }
    }, 30);

    return () => clearInterval(interval);
  }, [shouldRender, durationMs, onComplete]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="loading-screen-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#030305] text-white overflow-hidden select-none"
        >
          {/* Glowing background ambients */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-950/15 rounded-full filter blur-[120px] pointer-events-none" />

          {/* Particle Effects (Floating dots) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 20,
                  scale: Math.random() * 0.4 + 0.2,
                  opacity: Math.random() * 0.5 + 0.2,
                }}
                animate={{
                  y: -50,
                  opacity: [0.1, 0.6, 0.1],
                }}
                transition={{
                  duration: Math.random() * 6 + 6,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 4,
                }}
                className="absolute w-2 h-2 rounded-full bg-purple-500/60 blur-[1px]"
              />
            ))}
          </div>

          {/* LOGO CONTAINER */}
          <div className="relative flex flex-col items-center justify-center scale-90 md:scale-100">
            {/* Rotating Outer Runic Circle */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 rounded-full border border-dashed border-purple-500/25 flex items-center justify-center pointer-events-none"
            >
              <div className="absolute inset-0 rounded-full border-4 border-double border-purple-900/5" />
              {/* Outer stylish markers simulating runes */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{ transform: `rotate(${i * 45}deg) translateY(-112px)` }}
                  className="absolute text-[8px] font-mono text-purple-400/50 font-black tracking-widest uppercase"
                >
                  ⚜
                </div>
              ))}
            </motion.div>

            {/* Slow Glowing Circular Ring */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 20px rgba(123, 47, 255, 0.15)",
                  "0 0 45px rgba(123, 47, 255, 0.45)",
                  "0 0 20px rgba(123, 47, 255, 0.15)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-44 h-44 rounded-full border-2 border-purple-500/30 bg-[#07050d] pointer-events-none"
            />

            {/* Inner Rotating Gear / Compass */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-36 h-36 rounded-full border border-indigo-500/20 flex items-center justify-center pointer-events-none"
            >
              <Compass className="w-20 h-20 text-purple-400/20 stroke-[1.5]" />
            </motion.div>

            {/* Core Glowing Orb + Floating Logo icon */}
            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-28 h-28 flex items-center justify-center rounded-full bg-[#030305] border-2 border-[#7B2FFF] shadow-[0_0_30px_rgba(123,47,255,0.65)] overflow-hidden"
            >
              <img
                src={appLogo}
                alt="Monarch Spinner System Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none pointer-events-none scale-102"
              />
              {/* Specular glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              
              {/* Spinning holographic grid overlay */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#7B2FFF]/50 animate-spin-slow pointer-events-none" />
            </motion.div>
          </div>

          {/* SYSTEM TYPOGRAPHY */}
          <div className="mt-12 text-center z-10 space-y-3.5 max-w-sm px-6">
            <div className="space-y-1">
              <h2 className="text-lg font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-purple-400 uppercase tracking-[0.25em] drop-shadow-sm">
                MONARCH SPINNER SYSTEM
              </h2>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">
                {title}
              </p>
            </div>

            {/* Rotating Messages Container */}
            <div className="h-6 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-mono font-medium text-purple-300 tracking-wide block"
                >
                  • {messages[currentMessageIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Animated Loading Bar */}
            <div className="w-full bg-[#0a0a0f] border border-gray-900 h-2.5 rounded-full p-0.5 overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#7B2FFF] via-indigo-500 to-purple-400 rounded-full shadow-[0_0_10px_rgba(123,47,255,0.75)]"
              />
            </div>

            {/* Circular Loading Indicator Subtext */}
            <span className="text-[9px] font-mono text-gray-600 font-bold block uppercase tracking-widest">
              SYNCHRONIZING RECON MATRIX &bull; {Math.round(progress)}%
            </span>
          </div>

          {/* Absolute bottom copyright badge */}
          <div className="absolute bottom-6 font-mono text-[8px] text-gray-700 tracking-widest uppercase font-bold">
            SHADOW MONARCH ENGINEERING PROTOCOL v10.0
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
