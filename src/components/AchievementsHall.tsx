import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Award, Lock, ShieldCheck, 
  Sparkles, Star, Zap, ChevronRight, Bookmark 
} from "lucide-react";
import { Achievement } from "../types";

interface AchievementsHallProps {
  achievements: Achievement[];
}

export default function AchievementsHall({ achievements = [] }: AchievementsHallProps) {
  const [activeCategory, setActiveCategory] = useState<"ALL" | "SKILLS" | "LEVELS" | "DUNGEONS" | "MILESTONES">("ALL");

  const categories = [
    { id: "ALL", label: "All Achievements" },
    { id: "SKILLS", label: "Skill Mastery" },
    { id: "LEVELS", label: "Level Milestones" },
    { id: "DUNGEONS", label: "Battle Dungeons" },
    { id: "MILESTONES", label: "System Milestones" }
  ];

  const filteredAchievements = achievements.filter((ach) => {
    return activeCategory === "ALL" || ach.category === activeCategory;
  });

  const unlockedCount = achievements.filter((ach) => ach.unlocked).length;
  const totalCount = achievements.length || 4;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100) || 0;

  return (
    <div id="monarch-achievements-hall-section" className="space-y-6 p-6 bg-[#0c0c0c] border border-yellow-500/10 rounded-2xl relative overflow-hidden">
      {/* Golden Aura Glow */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-900">
        <div>
          <h2 className="text-sm font-bold font-mono text-[#FFD700] uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" /> MONARCH ACHIEVEMENTS HALL
          </h2>
          <span className="text-[10px] text-gray-500 font-mono">SOVEREIGN MILITARY EMBLEMS UNLOCKED</span>
        </div>

        {/* Dynamic completion progress indicator */}
        <div className="flex items-center gap-4 bg-black/60 border border-gray-900 py-1.5 px-3.5 rounded-lg">
          <div className="text-right">
            <span className="text-[9px] font-mono text-gray-500 block uppercase">SYSTEM PURSUIT</span>
            <span className="text-xs font-black font-mono text-yellow-400">{unlockedCount} / {totalCount} KEYS</span>
          </div>
          <div className="w-16 h-1.5 bg-gray-950 rounded overflow-hidden border border-gray-900">
            <div 
              className="h-full bg-gradient-to-r from-[#FFD700] to-yellow-400 rounded transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-gray-300">{completionPercentage}%</span>
        </div>
      </div>

      {/* CATEGORY SWITCHERS */}
      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border rounded transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-amber-950/20 border-yellow-500/40 text-yellow-400 shadow-[0_0_8px_rgba(255,215,0,0.15)]"
                : "bg-black/40 border-gray-950 text-gray-500 hover:text-gray-300 hover:border-gray-905"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* BENTO GRID OF EMBLEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((ach) => {
            const isUnlocked = ach.unlocked;

            return (
              <motion.div
                key={ach.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 flex items-start gap-4 ${
                  isUnlocked
                    ? "bg-[#141414] border-yellow-500/25 shadow-[0_4px_15px_rgba(255,215,0,0.03)]"
                    : "bg-[#0b0b0b] border-gray-950 opacity-40 shadow-none hover:opacity-50"
                }`}
              >
                {/* Visual Glow behind Unlocked Badge */}
                {isUnlocked && (
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-yellow-500/5 rounded-full filter blur-[30px] pointer-events-none" />
                )}

                {/* Left side Icon Container */}
                <div className={`p-3 rounded-lg border flex items-center justify-center shrink-0 transition-transform ${
                  isUnlocked
                    ? "bg-amber-950/20 border-yellow-500/30 text-yellow-400 scale-105"
                    : "bg-black border-gray-900 text-gray-600"
                }`}>
                  {isUnlocked ? (
                    <Award className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-600" />
                  )}
                </div>

                {/* Main Body */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-gray-900 text-gray-500 bg-black uppercase">
                      {ach.category}
                    </span>
                    {isUnlocked && ach.unlockedDate && (
                      <span className="text-[8px] font-mono text-gray-500">
                        {ach.unlockedDate}
                      </span>
                    )}
                  </div>

                  <h4 className={`text-sm font-sans font-black uppercase tracking-wide truncate ${
                    isUnlocked ? "text-white" : "text-gray-500"
                  }`}>
                    {ach.name}
                  </h4>

                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans pr-4 line-clamp-2">
                    {ach.desc}
                  </p>

                  {/* Reward Line */}
                  {ach.reward && (
                    <div className="flex items-center gap-1 text-[9.5px] font-mono text-cyan-400 mt-2 font-semibold">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>REWARD: {ach.reward}</span>
                    </div>
                  )}
                </div>

                {/* Unlocked stamp */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[8px] font-mono uppercase">
                  {isUnlocked ? (
                    <span className="text-green-400 bg-green-950/20 px-2 py-0.5 rounded border border-green-500/20">
                      ACQUIRED
                    </span>
                  ) : (
                    <span className="text-gray-600 bg-black/40 px-2 py-0.5 rounded border border-gray-950">
                      LOCKED
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredAchievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <Bookmark className="w-10 h-10 text-gray-800" />
          <div>
            <h4 className="text-xs font-mono text-gray-400 uppercase">NO MATRICES RECORDED HERE</h4>
            <p className="text-[10px] text-gray-600 max-w-sm mt-1">Unlock higher levels to expand the registry in this category.</p>
          </div>
        </div>
      )}
    </div>
  );
}
