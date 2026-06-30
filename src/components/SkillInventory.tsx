import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, PlusCircle, Award, Swords, ArrowUpRight, 
  Flame, CheckCircle2, AlertTriangle, Play, Sparkles, 
  Compass, Zap, HelpCircle, ShieldAlert, Check, ShieldCheck,
  Trash2, RefreshCw
} from "lucide-react";
import { SkillItem, SkillRarity, PracticeQuest } from "../types";
import { 
  playSystemClick, playSystemDing, 
  playSystemLevelUp, playSystemError 
} from "../utils/audio";
import { getSkillTitle, getSkillTitleDetails } from "../utils/skillTitles";

interface SkillInventoryProps {
  skills: SkillItem[];
  practiceQuests: PracticeQuest[];
  activeQuestId: string | null;
  onActivatePracticeQuest: (questId: string) => void;
  onGeneratePracticeQuest: (
    skillId: string, 
    skillName: string, 
    difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH",
    chamberMode?: "ALL" | "Net Drill" | "Match Simulation" | "Pressure Mode",
    overs?: "ALL" | "1" | "2" | "3" | "4" | "5" | "6"
  ) => void;
  onRegisterCustomSkill: (skill: { 
    name: string; 
    description: string; 
    rarity: SkillRarity;
    spinDirection?: "Leg Spin" | "Off Spin" | "Straight" | "Mixed";
    primaryBehavior?: "Turn" | "Drift" | "Dip" | "Bounce" | "Skid" | "Seam" | "Swing";
    releaseType?: "Wrist" | "Finger" | "Seam";
    flightStyle?: "Flighted" | "Flat" | "Mixed";
    primaryPurpose?: "Wicket Taking" | "Dot Ball Pressure" | "Defensive Control" | "Attack" | "Deception";
    preferredLength?: "Full" | "Good Length" | "Short" | "Variable";
  }) => void;
  onConfirmSkillEvolution: (id: string, newName: string, newRarity: SkillRarity, newLevel: number, attributeBoost: { name: string; value: number }) => void;
  onNavigateToTab: (tab: string) => void;
  onUpdateSkillsState?: React.Dispatch<React.SetStateAction<SkillItem[]>>;
  playerWickets: number;
  playerPerfects: number;
  playerDots: number;
  onDeletePracticeQuest?: (questId: string) => void;
  onRerollPracticeQuest?: (questId: string, difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH") => void;
}

export default function SkillInventory({
  skills = [],
  practiceQuests = [],
  activeQuestId = null,
  onActivatePracticeQuest,
  onGeneratePracticeQuest,
  onRegisterCustomSkill,
  onConfirmSkillEvolution,
  onNavigateToTab,
  onUpdateSkillsState,
  playerWickets = 0,
  playerPerfects = 0,
  playerDots = 0,
  onDeletePracticeQuest,
  onRerollPracticeQuest,
}: SkillInventoryProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(skills[0]?.id || null);
  const [customSkillName, setCustomSkillName] = useState("");
  const [customSkillDesc, setCustomSkillDesc] = useState("");
  const [customSkillRarity, setCustomSkillRarity] = useState<SkillRarity>("COMMON");
  
  // Custom Skill Synthesis Custom Parameters dropdown fields
  const [spinDirection, setSpinDirection] = useState<"Leg Spin" | "Off Spin" | "Straight" | "Mixed">("Leg Spin");
  const [primaryBehavior, setPrimaryBehavior] = useState<"Turn" | "Drift" | "Dip" | "Bounce" | "Skid" | "Seam" | "Swing">("Turn");
  const [releaseType, setReleaseType] = useState<"Wrist" | "Finger" | "Seam">("Wrist");
  const [flightStyle, setFlightStyle] = useState<"Flighted" | "Flat" | "Mixed">("Flighted");
  const [primaryPurpose, setPrimaryPurpose] = useState<"Wicket Taking" | "Dot Ball Pressure" | "Defensive Control" | "Attack" | "Deception">("Wicket Taking");
  const [preferredLength, setPreferredLength] = useState<"Full" | "Good Length" | "Short" | "Variable">("Good Length");

  const [showAddNewForm, setShowAddNewForm] = useState(false);

  // Practice Quest generator level of choice
  const [selectedDifficulty, setSelectedDifficulty] = useState<"EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH">("CHALLENGING");
  const [selectedChamberMode, setSelectedChamberMode] = useState<"ALL" | "Net Drill" | "Match Simulation" | "Pressure Mode">("ALL");
  const [selectedOvers, setSelectedOvers] = useState<"ALL" | "1" | "2" | "3" | "4" | "5" | "6">("ALL");

  // Evolution Physical Quest Submission states
  const [showEvolutionTrialPanel, setShowEvolutionTrialPanel] = useState(false);
  const [trialVerificationInput, setTrialVerificationInput] = useState("");
  const [trialErrorMsg, setTrialErrorMsg] = useState("");
  const [trialSuccessMsg, setTrialSuccessMsg] = useState("");

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const getRarityColor = (rarity: SkillRarity) => {
    switch (rarity) {
      case "LEGENDARY":
        return "text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.25)]";
      case "EPIC":
        return "text-[#7B2FFF] bg-[#7B2FFF]/10 border-[#7B2FFF]/30 shadow-[0_0_10px_rgba(123,47,255,0.2)]";
      case "RARE":
        return "text-[#00D9FF] bg-[#00D9FF]/10 border-[#00D9FF]/30 shadow-[0_0_10px_rgba(0,217,255,0.2)]";
      default:
        return "text-gray-400 bg-gray-900 border-gray-700";
    }
  };

  const handleCreateCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillName.trim()) return;

    onRegisterCustomSkill({
      name: customSkillName,
      description: customSkillDesc || "A custom synthesized leg-spin kinetic variant logged in the Monarch registry.",
      rarity: customSkillRarity,
      spinDirection,
      primaryBehavior,
      releaseType,
      flightStyle,
      primaryPurpose,
      preferredLength
    });

    setCustomSkillName("");
    setCustomSkillDesc("");
    setShowAddNewForm(false);
    playSystemDing();
  };

  const handleSynthesizeQuest = () => {
    if (!selectedSkill) return;
    playSystemClick();
    onGeneratePracticeQuest(selectedSkill.id, selectedSkill.name, selectedDifficulty, selectedChamberMode, selectedOvers);
  };

  // Physical breakthrough pass - keeps Actual Base Name pristine now!
  const handleTriggerEvolutionTrial = () => {
    if (!selectedSkill) return;
    playSystemClick();
    setTrialErrorMsg("");
    setTrialSuccessMsg("");
    setTrialVerificationInput("");

    // Initialize objectives if not already active!
    if (!selectedSkill.trialObjectives || selectedSkill.trialObjectives.length === 0) {
      const name = selectedSkill.name.toUpperCase();
      let objectives: string[] = [];

      if (selectedSkill.rarity === "COMMON") {
        objectives = [
          `Land 5 Perfect Balls using ${name} in the Evolution Chamber`,
          `Record 10 Dot Balls using ${name} in any training session`
        ];
      } else if (selectedSkill.rarity === "RARE") {
        objectives = [
          `Take 2 Wickets using ${name} in Match Simulation or Dungeons`,
          `Land 8 Perfect Balls using ${name} in the Evolution Chamber`,
          `Concede under 12 runs inside a completed over`
        ];
      } else if (selectedSkill.rarity === "EPIC") {
        objectives = [
          `Take 3 Wickets using ${name} in Match Simulation or Dungeons`,
          `Land 12 Perfect Balls using ${name} inside the Evolution Chamber`,
          `Complete at least 1 Pressure Flight Scenario successfully`
        ];
      } else {
        objectives = [
          `Take 3 Wickets in Dungeons using ${name}`,
          `Bowl an Elite Spell with 10 Perfect Balls and no mistakes`
        ];
      }

      if (onUpdateSkillsState) {
        onUpdateSkillsState((prev) =>
          prev.map((sk) =>
            sk.id === selectedSkill.id
              ? {
                  ...sk,
                  trialObjectives: objectives,
                  trialWicketsStart: playerWickets,
                  trialPerfectsStart: playerPerfects,
                  trialDotsStart: playerDots,
                  trialProgressPerfects: 0,
                  trialProgressWickets: 0,
                  trialProgressDots: 0,
                  trialProgressRunsLimitMet: false,
                  trialProgressPressureMet: false,
                  trialProgressDungeonMet: false
                }
              : sk
          )
        );
      }
    }

    setShowEvolutionTrialPanel(true);
  };

  const handleConfirmPhysicalTrialSuccess = () => {
    if (!selectedSkill) return;

    playSystemLevelUp();
    
    // Increment Rarity
    const currentRarity = selectedSkill.rarity;
    let nextRarity: SkillRarity = "RARE";
    if (currentRarity === "COMMON") nextRarity = "RARE";
    else if (currentRarity === "RARE") nextRarity = "EPIC";
    else if (currentRarity === "EPIC") nextRarity = "LEGENDARY";
    else nextRarity = "LEGENDARY";

    // Keep name primitive as requested
    const evolvedName = selectedSkill.name; 
    const nextLevel = selectedSkill.level + 2;

    // Attributes boosted list
    const boostAttr = { name: "CONTROL", value: 5 };

    setTrialSuccessMsg(`EVOLUTION PASS DETECTED! Unlocked ${nextRarity} Tier, Skill Level upgraded to LV ${nextLevel}, +5 CONTROL point permanently boosted!`);
    
    // Clear the active trial parameters so it can start fresh when they master this current level!
    if (onUpdateSkillsState) {
      onUpdateSkillsState((prev) =>
        prev.map((sk) =>
          sk.id === selectedSkill.id
            ? {
                ...sk,
                trialObjectives: [],
                trialProgressPerfects: 0,
                trialProgressWickets: 0,
                trialProgressDots: 0,
                trialProgressRunsLimitMet: false,
                trialProgressPressureMet: false,
                trialProgressDungeonMet: false
              }
            : sk
        )
      );
    }

    onConfirmSkillEvolution(selectedSkill.id, evolvedName, nextRarity, nextLevel, boostAttr);
  };

  // Retrieve quests only targeting the selected skill (flexible match by ID, name, or skillName)
  const skillRelatedQuests = practiceQuests.filter(pq => {
    if (!selectedSkill) return false;
    const matchId = pq.skillId === selectedSkill.id;
    const matchName = pq.skillId?.toLowerCase() === selectedSkill.name.toLowerCase();
    const matchSkillName = pq.skillName?.toLowerCase() === selectedSkill.name.toLowerCase();
    return matchId || matchName || matchSkillName;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-[#080808]/95 border border-purple-500/10 rounded-2xl relative overflow-hidden">
      
      {/* Visual background lights */}
      <div className="absolute right-0 bottom-0 pointer-events-none w-80 h-80 bg-purple-950/5 rounded-full filter blur-[120px]" />

      {/* LEFT LIST PANEL: REPERTOIRE ABILITIES */}
      <div className="lg:col-span-5 flex flex-col gap-4 border-r border-gray-900 pr-0 lg:pr-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-900">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-[#7B2FFF] flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-purple-400" /> ABILITY SPELLBOOK
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">ACTIVE DELIVERY REPERTOIRES</span>
          </div>
          <button
            onClick={() => { playSystemClick(); setShowAddNewForm(!showAddNewForm); }}
            className="text-xs font-mono font-bold text-cyan-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            REGISTER NEW VARIATION
          </button>
        </div>

        {/* Dynamic ADD CUSTOM SKILL interface */}
        <AnimatePresence>
          {showAddNewForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateCustomSkill}
              className="p-4 bg-[#0a0a0a] border border-[#00D9FF]/30 rounded-xl space-y-3.5 overflow-hidden"
            >
              <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase">SYNTHESIZE NEW SKILL ARCHETYPE</h4>
              
              <div>
                <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">Spin Variation Name</label>
                <input
                  type="text"
                  placeholder="e.g. MONARCH FLIGHT SLIDER"
                  required
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  className="w-full bg-black border border-gray-900 rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-800 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">Combat Description</label>
                <textarea
                  placeholder="State biomechanic release points, wrist action turn properties..."
                  value={customSkillDesc}
                  onChange={(e) => setCustomSkillDesc(e.target.value)}
                  className="w-full bg-black border border-gray-900 rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-800 focus:outline-none focus:border-cyan-400 h-14 resize-none"
                />
              </div>

              {/* Extended Behavioral Parameters dropdowns in grid */}
              <div className="grid grid-cols-2 gap-2 text-left pt-1 border-t border-gray-905 border-gray-900">
                <div>
                  <label className="block text-[8.5px] font-mono text-gray-400 uppercase mb-0.5">Spin Direction</label>
                  <select
                    value={spinDirection}
                    onChange={(e) => setSpinDirection(e.target.value as any)}
                    className="w-full bg-black border border-gray-900 rounded p-1 text-[10px] text-gray-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Leg Spin">Leg Spin</option>
                    <option value="Off Spin">Off Spin</option>
                    <option value="Straight">Straight</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-mono text-gray-400 uppercase mb-0.5">Primary Behavior</label>
                  <select
                    value={primaryBehavior}
                    onChange={(e) => setPrimaryBehavior(e.target.value as any)}
                    className="w-full bg-black border border-gray-900 rounded p-1 text-[10px] text-gray-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Turn">Turn</option>
                    <option value="Drift">Drift</option>
                    <option value="Dip">Dip</option>
                    <option value="Bounce">Bounce</option>
                    <option value="Skid">Skid</option>
                    <option value="Seam">Seam</option>
                    <option value="Swing">Swing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-mono text-gray-400 uppercase mb-0.5">Release Type</label>
                  <select
                    value={releaseType}
                    onChange={(e) => setReleaseType(e.target.value as any)}
                    className="w-full bg-black border border-gray-900 rounded p-1 text-[10px] text-gray-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Wrist">Wrist</option>
                    <option value="Finger">Finger</option>
                    <option value="Seam">Seam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-mono text-gray-400 uppercase mb-0.5">Flight Style</label>
                  <select
                    value={flightStyle}
                    onChange={(e) => setFlightStyle(e.target.value as any)}
                    className="w-full bg-black border border-gray-900 rounded p-1 text-[10px] text-gray-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Flighted">Flighted</option>
                    <option value="Flat">Flat</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-mono text-gray-400 uppercase mb-0.5">Primary Purpose</label>
                  <select
                    value={primaryPurpose}
                    onChange={(e) => setPrimaryPurpose(e.target.value as any)}
                    className="w-full bg-black border border-gray-900 rounded p-1 text-[10px] text-gray-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Wicket Taking">Wicket Taking</option>
                    <option value="Dot Ball Pressure">Dot Pressure</option>
                    <option value="Defensive Control">Defensive Control</option>
                    <option value="Attack">Attack</option>
                    <option value="Deception">Deception</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-mono text-gray-400 uppercase mb-0.5">Preferred Length</label>
                  <select
                    value={preferredLength}
                    onChange={(e) => setPreferredLength(e.target.value as any)}
                    className="w-full bg-black border border-gray-900 rounded p-1 text-[10px] text-gray-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Full">Full</option>
                    <option value="Good Length">Good Length</option>
                    <option value="Short">Short</option>
                    <option value="Variable">Variable</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 items-center justify-between pt-2 border-t border-gray-900">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Rarity Matrix</label>
                  <select
                    value={customSkillRarity}
                    onChange={(e) => setCustomSkillRarity(e.target.value as SkillRarity)}
                    className="bg-black border border-gray-900 rounded px-2.5 py-1 text-xs text-gray-300 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="COMMON">COMMON TIER</option>
                    <option value="RARE">RARE TIER</option>
                    <option value="EPIC">EPIC TIER</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4.5 py-1.5 bg-[#7B2FFF] text-white text-[11px] font-mono font-bold tracking-wider rounded border border-purple-500/30 hover:bg-purple-650 transition cursor-pointer"
                >
                  CONFIRM SYNTHESIS
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Skill Cards grid list */}
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {skills.map((skill) => {
            const isSelected = skill.id === selectedSkillId;
            const isBreakthroughReady = skill.mastery >= 1000;
            const titleDetails = getSkillTitleDetails(skill.level);

            return (
              <div
                key={skill.id}
                onClick={() => { playSystemClick(); setSelectedSkillId(skill.id); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group flex items-center justify-between ${
                  isSelected
                    ? "bg-[#101010] border-[#7B2FFF]/60 shadow-[0_0_15px_rgba(123,47,255,0.08)]"
                    : "bg-black border-gray-900 hover:border-gray-800 hover:bg-[#0c0c0c]"
                }`}
              >
                {isBreakthroughReady && (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-[#FFD700] animate-pulse shadow-[0_0_10px_#FFA500]" />
                )}

                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isBreakthroughReady ? "bg-yellow-400 shadow-[0_0_8px_#FFA500]" : isSelected ? "bg-[#7B2FFF] shadow-[0_0_8px_#7B2FFF]" : "bg-gray-700"} animate-pulse`} />
                  <div>
                    <h4 className="text-xs font-bold font-mono tracking-wider text-gray-200 group-hover:text-white uppercase flex items-center gap-1.5">
                      {skill.name}
                    </h4>
                    
                    {/* DYNAMIC TITLE DISPLAY */}
                    <span className={`text-[9px] font-mono border rounded px-1.5 py-0.2 mt-1 inline-block ${titleDetails.colorClass}`}>
                      {titleDetails.title}
                    </span>

                    <div className="flex items-center gap-2 mt-1 font-mono">
                      <span className="text-[10px] font-bold text-cyan-400">
                        LEVEL {skill.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase ${getRarityColor(skill.rarity)}`}>
                    {skill.rarity}
                  </span>
                  {isBreakthroughReady && (
                    <span className="text-[8px] font-mono text-yellow-400 font-bold tracking-widest leading-none block animate-bounce">
                      BREAKREADY
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PREVIEW DETAILS PANEL: PROGRESS & PRACTISE QUESTS */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-black/90 rounded-xl border border-gray-900 p-6 relative">
        <AnimatePresence mode="wait">
          {selectedSkill ? (
            <motion.div
              key={selectedSkill.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex items-start justify-between border-b border-gray-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${getRarityColor(selectedSkill.rarity)}`}>
                      {selectedSkill.rarity} SKILL INSTANCE
                    </span>
                    <span className="text-[9.5px] font-mono text-gray-500 font-bold">ID: SPIN-{selectedSkill.id.substring(0, 4).toUpperCase()}</span>
                  </div>
                  <h2 className="text-lg font-black font-mono tracking-wider text-white uppercase mt-1.5 flex items-center gap-2">
                    {selectedSkill.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">UNIVERSAL DEVELOPMENT TITLE:</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded uppercase ${getSkillTitleDetails(selectedSkill.level).colorClass}`}>
                      {getSkillTitle(selectedSkill.level)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono text-gray-400 block uppercase">TRAINING RANGE</span>
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    LVL {selectedSkill.level}
                  </span>
                </div>
              </div>

              {/* Progress Mastery Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px]">INTEGRATION KINETIC MASTERY</span>
                  <span className="text-cyan-400 font-extrabold">{selectedSkill.mastery} Mastery Points</span>
                </div>
                <div className="relative w-full h-3 bg-black rounded overflow-hidden border border-gray-900 flex items-center">
                  <div
                    className="h-full bg-gradient-to-r from-purple-700 via-purple-500 to-cyan-500 rounded shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all"
                    style={{ width: `${Math.min((selectedSkill.mastery / 1000) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[9.5px] text-gray-500 block font-mono">
                  Quests completed perfectly inside the Evolution Chamber or Dungeons are the ONLY path to trigger Mastery XP spikes!
                </span>
              </div>

              {/* Description Body */}
              <div className="bg-[#050505] border border-gray-900 p-4 rounded-lg">
                <span className="text-[9px] font-mono text-purple-400 block tracking-wider uppercase font-black mb-1">SOVEREIGN TRAJECTORY INDEX</span>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{selectedSkill.description || "Synthesized spin flight trajectory with high rotational frequency."}"
                </p>
              </div>

              {/* PRACTICE QUESTS MATRIX AND CONTROLS (REPLACES DUMMY AI DRILL PANEL) */}
              <div className="bg-[#0b0b0b] border border-gray-900 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-purple-400 uppercase flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-purple-400" />
                    PRACTICE QUESTS CONTROL HUB
                  </h4>
                  <span className="text-[9px] font-mono text-gray-500">REAL ACHIEVEMENT CRITICAL LEVELING</span>
                </div>

                {/* Available quests List */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block font-bold">1. CHOOSE ACTIVE DEVELOPMENT QUEST</span>
                  
                  {skillRelatedQuests.length > 0 ? (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {skillRelatedQuests.map((quest) => {
                        const isActive = quest.id === activeQuestId;
                        return (
                          <div 
                            key={quest.id}
                            className={`p-3 rounded-lg border text-xs font-mono transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                              isActive 
                                ? "bg-purple-950/20 border-[#7B2FFF] text-white" 
                                : quest.completed 
                                ? "bg-green-950/10 border-green-950 text-gray-500 opacity-60" 
                                : "bg-black border-gray-900 text-gray-300"
                            }`}
                          >
                            <div className="space-y-2 flex-1 text-left">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[8.5px] px-1.5 py-0.5 rounded border border-gray-800 bg-gray-950 text-gray-400 font-mono font-bold uppercase tracking-wider">
                                  Evolution Chamber
                                </span>
                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded border font-mono font-bold uppercase tracking-wider ${
                                  quest.difficulty === "MONARCH" ? "text-red-400 border-red-500/20 bg-red-950/20" :
                                  quest.difficulty === "CHALLENGING" ? "text-amber-400 border-amber-500/20 bg-amber-950/20" :
                                  "text-cyan-400 border-cyan-500/20 bg-cyan-950/20"
                                }`}>
                                  {quest.difficulty}
                                </span>
                                <span className="text-[8.5px] px-1.5 py-0.5 rounded border border-[#7B2FFF]/30 bg-[#7B2FFF]/10 text-purple-300 font-mono font-bold uppercase tracking-wider">
                                  {quest.chamberMode || (quest.type === "CHAMBER_NET" ? "Net Drill" : "Match Simulation")}
                                </span>
                                <span className="text-[8.5px] px-1.5 py-0.5 rounded border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 font-mono font-bold">
                                  {quest.oversLength || quest.requirements?.oversMin || 2} OVER{(quest.oversLength || quest.requirements?.oversMin || 2) > 1 ? "S" : ""}
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 font-mono uppercase">
                                  [{quest.skillName || "ACTIVE VARIATION"}]
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h5 className="font-bold font-mono text-gray-200 text-xs tracking-wide">{quest.name}</h5>
                                <div className="text-[10px] text-gray-400 font-sans leading-relaxed bg-black/30 p-2 rounded border border-gray-950/50">
                                  <strong className="text-cyan-400 font-mono block text-[9.5px] uppercase tracking-wider mb-0.5">Objectives & Context:</strong>
                                  {quest.description}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2.5 text-[9.5px] font-mono">
                                <span className="text-yellow-400 font-extrabold flex items-center gap-1">
                                  🏆 +{quest.masteryReward} Mastery XP
                                </span>
                                <span className="text-gray-700">•</span>
                                <span className="text-cyan-400 font-extrabold flex items-center gap-1">
                                  ⚡ +{quest.xpReward} Player XP
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {!quest.completed && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playSystemClick();
                                      if (onRerollPracticeQuest) {
                                        onRerollPracticeQuest(quest.id, quest.difficulty);
                                      }
                                    }}
                                    title="Rechange / Reroll Quest"
                                    className="p-1.5 bg-black hover:bg-cyan-950/30 border border-gray-900 hover:border-cyan-500/40 text-gray-400 hover:text-cyan-400 rounded cursor-pointer transition"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playSystemClick();
                                      if (onDeletePracticeQuest) {
                                        onDeletePracticeQuest(quest.id);
                                      }
                                    }}
                                    title="Dismantle Quest"
                                    className="p-1.5 bg-black hover:bg-red-950/30 border border-gray-900 hover:border-red-500/40 text-gray-400 hover:text-red-400 rounded cursor-pointer transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              {quest.completed ? (
                                <span className="text-green-400 font-black text-xs flex items-center gap-1.5 uppercase bg-green-950/20 px-2.5 py-1 rounded border border-green-500/10">
                                  <ShieldCheck className="w-4 h-4 text-green-400" /> Completed
                                </span>
                              ) : isActive ? (
                                <button
                                  onClick={() => onNavigateToTab(quest.type === "DUNGEON_MATCH" ? "DUNGEONS" : "EVOLUTION_CHAMBER")}
                                  className="w-full sm:w-auto px-3.5 py-1.5 bg-[#7B2FFF] text-white hover:bg-purple-650 transition rounded font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3 fill-white" /> GO TO TRAIN
                                </button>
                              ) : (
                                <button
                                  onClick={() => onActivatePracticeQuest(quest.id)}
                                  className="w-full sm:w-auto px-3 py-1.5 bg-[#121212] hover:bg-[#1f1f1f] border border-gray-900 hover:border-[#7B2FFF]/30 text-gray-300 hover:text-white transition rounded uppercase font-bold cursor-pointer"
                                >
                                  DEPLOY QUEST
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center bg-black/40 border border-gray-900 rounded-lg italic text-gray-500 text-[10.5px]">
                      No custom practice quests generated. Synthesize a challenge below.
                    </div>
                  )}
                </div>

                {/* Synthesis interface */}
                <div className="p-3.5 bg-black/80 border border-gray-900 rounded-lg space-y-4">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block font-bold tracking-widest text-cyan-400">2. SYNTHESIZE DYNAMIC CHALLENGE QUEST</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Difficulty */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider block">DIFFICULTY LEVEL</span>
                      <div className="flex flex-wrap gap-1 bg-[#030303] p-1 rounded border border-gray-800">
                        {["EASY", "MEDIUM", "CHALLENGING", "MONARCH"].map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setSelectedDifficulty(diff as any)}
                            className={`flex-1 min-w-[50px] text-center py-1 text-[8.5px] font-mono font-bold rounded cursor-pointer transition ${
                              selectedDifficulty === diff 
                                ? "bg-[#7B2FFF]/20 border border-[#7B2FFF]/60 text-white" 
                                : "text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Evolution Chamber Mode */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider block">CHAMBER MODE</span>
                      <select
                        value={selectedChamberMode}
                        onChange={(e) => setSelectedChamberMode(e.target.value as any)}
                        className="w-full bg-[#030303] border border-gray-800 text-gray-400 font-mono text-xs rounded p-1.5 focus:border-[#7B2FFF] focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">ALL MODES</option>
                        <option value="Net Drill">Net Drill</option>
                        <option value="Match Simulation">Match Simulation</option>
                        <option value="Pressure Mode">Pressure Mode</option>
                      </select>
                    </div>

                    {/* Overs */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider block">OVERS TARGET</span>
                      <select
                        value={selectedOvers}
                        onChange={(e) => setSelectedOvers(e.target.value as any)}
                        className="w-full bg-[#030303] border border-gray-800 text-gray-400 font-mono text-xs rounded p-1.5 focus:border-[#7B2FFF] focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">ALL OVERS</option>
                        <option value="1">1 OVER</option>
                        <option value="2">2 OVERS</option>
                        <option value="3">3 OVERS</option>
                        <option value="4">4 OVERS</option>
                        <option value="5">5 OVERS</option>
                        <option value="6">6 OVERS</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-900">
                    <button
                      type="button"
                      onClick={handleSynthesizeQuest}
                      className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-[#7B2FFF]/50 hover:border-purple-400 text-purple-300 hover:text-white font-mono text-xs font-bold rounded transition cursor-pointer uppercase tracking-widest shadow-[0_0_12px_rgba(123,47,255,0.15)] hover:shadow-[0_0_15px_rgba(123,47,255,0.35)]"
                    >
                      SYNTHESIZE SKILL QUEST
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-900">
                
                {/* STRICT COMPLIANCE: NO MORE MANUAL BOOST Mastery button */}
                <div className="p-3.5 bg-black border border-orange-500/10 rounded-xl flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-orange-400 animate-pulse" />
                  <div className="space-y-0.5 leading-tight">
                    <span className="text-[9.5px] font-mono text-gray-400 uppercase font-black">Practice Quest Lock Active</span>
                    <p className="text-[8px] text-gray-500 font-sans">
                      Complete active practice quests inside the Evolution Chamber perfectly to spike mastery and trigger leveling up.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTriggerEvolutionTrial}
                  disabled={selectedSkill.mastery < 1000}
                  className={`py-3.5 rounded font-mono text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedSkill.mastery >= 1000
                      ? "bg-gradient-to-r from-yellow-600 to-amber-700 border border-yellow-500/40 text-white shadow-[0_0_15px_#D4AF37]"
                      : "bg-[#0a0a0a] border-gray-900 text-gray-600 cursor-not-allowed border opacity-20"
                  }`}
                >
                  <Award className="w-4.5 h-4.5 text-yellow-400" />
                  Perform Evolution Trial
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <ShieldAlert className="w-10 h-10 text-gray-750 animate-pulse" />
              <span className="text-xs font-mono text-gray-500">Spellbook is empty. Synthesize an archetype.</span>
            </div>
          )}
        </AnimatePresence>

        {/* PHYSICAL VERIFICATION EVOLUTION PORTAL MODAL */}
        <AnimatePresence>
          {showEvolutionTrialPanel && selectedSkill && (
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="max-w-md w-full p-6 bg-[#030303] border-2 border-yellow-500/65 rounded-2xl text-center space-y-5 relative shadow-[0_0_40px_rgba(255,215,0,0.25)]">
                
                <div className="space-y-1">
                  <span className="text-[10px] text-yellow-500 font-mono tracking-[0.25em] font-black uppercase block animate-pulse">SPIN BREAKER ASCENSION TRIAL</span>
                  <h4 className="text-base font-black text-white uppercase font-mono tracking-wider">
                    EVOLUTION OBJECTIVES: {selectedSkill.name}
                  </h4>
                </div>

                <div className="p-4 bg-[#0a0a0a] border border-gray-900 rounded text-left space-y-3">
                  <span className="text-[9px] font-mono text-cyan-400 font-extrabold uppercase block mr-1">ACTIVE TRIAL INSTRUCTIONS</span>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans mt-1 text-justify">
                    To trigger the physical evolution and ascend of <strong className="text-white">{selectedSkill.name}</strong>, you must satisfy the following real gameplay targets inside the <strong className="text-purple-400">Evolution Chamber</strong> or <strong className="text-cyan-400">Match Dungeons</strong>. Your progress is monitored automatically:
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-gray-950">
                    {/* Perfect Deliveries Objective */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                        (selectedSkill.trialProgressPerfects || 0) >= (selectedSkill.rarity === "COMMON" ? 5 : selectedSkill.rarity === "RARE" ? 8 : 12)
                          ? "bg-green-600 border-green-500 text-white"
                          : "bg-black border-gray-800 text-gray-650"
                      }`}>
                        {(selectedSkill.trialProgressPerfects || 0) >= (selectedSkill.rarity === "COMMON" ? 5 : selectedSkill.rarity === "RARE" ? 8 : 12) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 leading-tight">
                        <span className="text-xs text-gray-300 font-mono block">
                          Land Perfect Balls with {selectedSkill.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          Progress: <strong className="text-cyan-400">{selectedSkill.trialProgressPerfects || 0}</strong> / {selectedSkill.rarity === "COMMON" ? 5 : selectedSkill.rarity === "RARE" ? 8 : 12}
                        </span>
                      </div>
                    </div>

                    {/* Dot Balls or Wicket Objective */}
                    {selectedSkill.rarity === "COMMON" && (
                      <div className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                          (selectedSkill.trialProgressDots || 0) >= 10
                            ? "bg-green-600 border-green-500 text-white"
                            : "bg-black border-gray-800 text-gray-650"
                        }`}>
                          {(selectedSkill.trialProgressDots || 0) >= 10 && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 leading-tight">
                          <span className="text-xs text-gray-300 font-mono block">
                            Record Dot Balls with {selectedSkill.name}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Progress: <strong className="text-cyan-400">{selectedSkill.trialProgressDots || 0}</strong> / 10
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Wickets or Concession Objective for Rare/Epic */}
                    {selectedSkill.rarity !== "COMMON" && (
                      <>
                        <div className="flex items-start gap-2.5">
                          <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                            (selectedSkill.trialProgressWickets || 0) >= (selectedSkill.rarity === "RARE" ? 2 : 3)
                              ? "bg-green-600 border-green-500 text-white"
                              : "bg-black border-gray-800 text-gray-650"
                          }`}>
                            {(selectedSkill.trialProgressWickets || 0) >= (selectedSkill.rarity === "RARE" ? 2 : 3) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 leading-tight">
                            <span className="text-xs text-gray-300 font-mono block">
                              Take Wickets in Match Sim or Dungeons with {selectedSkill.name}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              Progress: <strong className="text-cyan-400">{selectedSkill.trialProgressWickets || 0}</strong> / {selectedSkill.rarity === "RARE" ? 2 : 3}
                            </span>
                          </div>
                        </div>

                        {selectedSkill.rarity === "RARE" && (
                          <div className="flex items-start gap-2.5">
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                              selectedSkill.trialProgressRunsLimitMet
                                ? "bg-green-600 border-green-500 text-white"
                                : "bg-black border-gray-800 text-gray-650"
                            }`}>
                              {selectedSkill.trialProgressRunsLimitMet && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 leading-tight">
                              <span className="text-xs text-gray-300 font-mono block">
                                Concede under 12 runs inside simulated overs
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">
                                Status: <strong className="text-cyan-400">{selectedSkill.trialProgressRunsLimitMet ? "COMPLETED" : "PENDING"}</strong>
                              </span>
                            </div>
                          </div>
                        )}

                        {selectedSkill.rarity === "EPIC" && (
                          <div className="flex items-start gap-2.5">
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                              selectedSkill.trialProgressPressureMet
                                ? "bg-green-600 border-green-500 text-white"
                                : "bg-black border-gray-800 text-gray-650"
                            }`}>
                              {selectedSkill.trialProgressPressureMet && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 leading-tight">
                              <span className="text-xs text-gray-300 font-mono block">
                                Complete a pressure flight scenario successfully
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">
                                Status: <strong className="text-cyan-405 text-cyan-400">{selectedSkill.trialProgressPressureMet ? "COMPLETED" : "PENDING"}</strong>
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Direct shortcut navigation action */}
                <div className="p-3 bg-black border border-gray-900 rounded-lg text-left space-y-1">
                  <span className="text-[8.5px] font-mono text-gray-500 uppercase block">DIRECT NETS SHORTCUT</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setShowEvolutionTrialPanel(false); onNavigateToTab("EVOLUTION_CHAMBER"); }}
                      className="flex-1 py-1.5 px-2 text-[9.5px] font-mono font-bold text-purple-400 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-805 border-purple-800/45 rounded transition cursor-pointer text-center"
                    >
                      ENTER CHAMBER
                    </button>
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setShowEvolutionTrialPanel(false); onNavigateToTab("DUNGEONS"); }}
                      className="flex-1 py-1.5 px-2 text-[9.5px] font-mono font-bold text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-805 border-cyan-800/45 rounded transition cursor-pointer text-center"
                    >
                      SELECT DUNGEON
                    </button>
                  </div>
                </div>

                {trialErrorMsg && (
                  <div className="bg-red-950/20 border border-red-500/40 p-2.5 rounded text-[10px] text-red-400 font-mono text-left flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{trialErrorMsg}</span>
                  </div>
                )}

                {trialSuccessMsg && (
                  <div className="bg-green-950/20 border border-green-500/40 p-2.5 rounded text-[10.5px] text-green-400 font-mono text-left flex items-center gap-1.5 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                    <span>{trialSuccessMsg}</span>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {!trialSuccessMsg && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          // Check if all objectives are fulfilled!
                          const perfectsNeeded = selectedSkill.rarity === "COMMON" ? 5 : selectedSkill.rarity === "RARE" ? 8 : 12;
                          const perfectMet = (selectedSkill.trialProgressPerfects || 0) >= perfectsNeeded;
                          
                          let otherMet = false;
                          if (selectedSkill.rarity === "COMMON") {
                            otherMet = (selectedSkill.trialProgressDots || 0) >= 10;
                          } else if (selectedSkill.rarity === "RARE") {
                            const wicketsNeeded = 2;
                            const wicketsMet = (selectedSkill.trialProgressWickets || 0) >= wicketsNeeded;
                            otherMet = wicketsMet && (selectedSkill.trialProgressRunsLimitMet || false);
                          } else if (selectedSkill.rarity === "EPIC") {
                            const wicketsNeeded = 3;
                            const wicketsMet = (selectedSkill.trialProgressWickets || 0) >= wicketsNeeded;
                            otherMet = wicketsMet && (selectedSkill.trialProgressPressureMet || false);
                          } else {
                            otherMet = true; 
                          }

                          if (perfectMet && otherMet) {
                            handleConfirmPhysicalTrialSuccess();
                          } else {
                            playSystemError();
                            setTrialErrorMsg("OBJECTIVES UNFULFILLED. Land required Perfect Deliveries or Take Wickets inside the Chamber/Dungeons to clear active trial milestones.");
                          }
                        }}
                        className={`px-6 py-2.5 font-mono text-xs font-bold tracking-widest uppercase rounded cursor-pointer transition ${
                          // Check if all objectives are fulfilled to highlight visually
                          (() => {
                            const perfectsNeeded = selectedSkill.rarity === "COMMON" ? 5 : selectedSkill.rarity === "RARE" ? 8 : 12;
                            const perfectMet = (selectedSkill.trialProgressPerfects || 0) >= perfectsNeeded;
                            let otherMet = false;
                            if (selectedSkill.rarity === "COMMON") {
                              otherMet = (selectedSkill.trialProgressDots || 0) >= 10;
                            } else if (selectedSkill.rarity === "RARE") {
                              const wicketsNeeded = 2;
                              const wicketsMet = (selectedSkill.trialProgressWickets || 0) >= wicketsNeeded;
                              otherMet = wicketsMet && (selectedSkill.trialProgressRunsLimitMet || false);
                            } else if (selectedSkill.rarity === "EPIC") {
                              const wicketsNeeded = 3;
                              const wicketsMet = (selectedSkill.trialProgressWickets || 0) >= wicketsNeeded;
                              otherMet = wicketsMet && (selectedSkill.trialProgressPressureMet || false);
                            } else {
                              otherMet = true;
                            }
                            return perfectMet && otherMet
                              ? "bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                              : "bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed";
                          })()
                        }`}
                      >
                        CONCLUDE EVOLUTION PASS
                      </button>

                      <button
                        type="button"
                        onClick={() => { playSystemClick(); setShowEvolutionTrialPanel(false); }}
                        className="px-4 py-2.5 bg-[#141414] border border-gray-900 text-gray-400 font-mono text-xs font-bold uppercase rounded hover:border-gray-800 hover:text-white cursor-pointer"
                      >
                        CLOSE TRACKER
                      </button>
                    </>
                  )}

                  {trialSuccessMsg && (
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setShowEvolutionTrialPanel(false); }}
                      className="px-6 py-2.5 bg-[#7B2FFF] hover:bg-purple-650 text-white font-mono text-xs font-bold tracking-widest uppercase rounded cursor-pointer shadow-[0_0_15px_#7B2FFF]"
                    >
                      RETURN TO SPELLBOOK
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
