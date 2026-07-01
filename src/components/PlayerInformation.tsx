import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Settings, Award, Flame, Zap, Trophy, Shield, 
  HelpCircle, BookOpen, Clock, ChevronDown, ChevronUp, 
  Check, Save, Sparkles, Database, Cloud, FileText,
  TrendingUp, Activity, BarChart2, CheckCircle2, RefreshCw,
  Camera, Target, Compass, Repeat, ShieldCheck, Wind, 
  Navigation, ArrowUpCircle, Eye
} from "lucide-react";
import { PlayerProfile, SkillItem, Attribute, DungeonRecord } from "../types";
import { RANK_REQUIREMENTS_LIST } from "../utils/rankRequirements";
import { playSystemClick, playSystemDing } from "../utils/audio";
import PlayerAvatar from "./PlayerAvatar";
import ChangePhotoModal from "./ChangePhotoModal";
import { getSupabase } from "../utils/supabaseClient";
import { AttributeEngine } from "../utils/attributeEngine";

interface PlayerInformationProps {
  player: PlayerProfile;
  onUpdatePlayer: (updated: Partial<PlayerProfile>) => void;
  skills: SkillItem[];
  attributes: Attribute[];
  dungeons: DungeonRecord[];
}

export default function PlayerInformation({
  player,
  onUpdatePlayer,
  skills = [],
  attributes = [],
  dungeons = [],
}: PlayerInformationProps) {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true,
    attributesDetails: false,
    guide: false,
    ranks: false,
    evolution: false,
    levels: false,
    skillsReq: false,
    features: false,
    faq: false,
    version: false,
  });

  // Profile Editor Form State
  const [formName, setFormName] = useState(player.name || "");
  const [formNickname, setFormNickname] = useState(player.nickname || "Shadow Spinner");
  const [formAge, setFormAge] = useState(player.age ? String(player.age) : "22");
  const [formBowlingStyle, setFormBowlingStyle] = useState(player.bowlingStyle || "Leg Spin (Wrist Spin)");
  const [formBattingStyle, setFormBattingStyle] = useState(player.battingStyle || "Right-Hand Batsman");
  const [formDominantHand, setFormDominantHand] = useState(player.dominantHand || "Right");
  const [formCountry, setFormCountry] = useState(player.country || "India");
  const [formState, setFormState] = useState(player.state || "Tamil Nadu");
  const [formTeamName, setFormTeamName] = useState(player.teamName || "Shadow Guild CC");
  const [formAcademy, setFormAcademy] = useState(player.academy || "Monarch Spin Academy");
  const [formPlayingLevel, setFormPlayingLevel] = useState(player.playingLevel || "Club Division A");
  const [formBiography, setFormBiography] = useState(player.biography || "Awakened leg spinner destined for the supreme Monarch Rank. Recalibrating wrist trajectory coordinates.");
  const [formProfilePhoto, setFormProfilePhoto] = useState(player.profilePhoto || "");

  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED">("IDLE");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoNotification, setPhotoNotification] = useState<string | null>(null);

  // Sync prop changes back to form state (crucial for live update after upload & sync!)
  useEffect(() => {
    if (player) {
      if (player.name !== undefined) setFormName(player.name);
      if (player.nickname !== undefined) setFormNickname(player.nickname || "");
      if (player.age !== undefined) setFormAge(player.age ? String(player.age) : "");
      if (player.bowlingStyle !== undefined) setFormBowlingStyle(player.bowlingStyle || "");
      if (player.battingStyle !== undefined) setFormBattingStyle(player.battingStyle || "");
      if (player.dominantHand !== undefined) setFormDominantHand(player.dominantHand || "");
      if (player.country !== undefined) setFormCountry(player.country || "");
      if (player.state !== undefined) setFormState(player.state || "");
      if (player.teamName !== undefined) setFormTeamName(player.teamName || "");
      if (player.academy !== undefined) setFormAcademy(player.academy || "");
      if (player.playingLevel !== undefined) setFormPlayingLevel(player.playingLevel || "");
      if (player.biography !== undefined) setFormBiography(player.biography || "");
      if (player.profilePhoto !== undefined) setFormProfilePhoto(player.profilePhoto || "");
    }
  }, [player]);

  // Sync profile edits with state (Trigger cloud saving automatically on form edit/submit)
  const handleAutosaveProfile = () => {
    setSaveStatus("SAVING");
    playSystemClick();
    
    setTimeout(() => {
      onUpdatePlayer({
        name: formName,
        nickname: formNickname,
        age: formAge ? parseInt(formAge, 10) : undefined,
        bowlingStyle: formBowlingStyle,
        battingStyle: formBattingStyle,
        dominantHand: formDominantHand,
        country: formCountry,
        state: formState,
        teamName: formTeamName,
        academy: formAcademy,
        playingLevel: formPlayingLevel,
        biography: formBiography,
        profilePhoto: formProfilePhoto
      });
      setSaveStatus("SAVED");
      playSystemDing();
      setTimeout(() => setSaveStatus("IDLE"), 2000);
    }, 600);
  };

  // Trigger auto-save when editing major text elements
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (
        formName !== player.name ||
        formNickname !== player.nickname ||
        formBowlingStyle !== player.bowlingStyle ||
        formBattingStyle !== player.battingStyle ||
        formDominantHand !== player.dominantHand ||
        formCountry !== player.country ||
        formState !== player.state ||
        formTeamName !== player.teamName ||
        formAcademy !== player.academy ||
        formPlayingLevel !== player.playingLevel ||
        formBiography !== player.biography ||
        formProfilePhoto !== player.profilePhoto
      ) {
        onUpdatePlayer({
          name: formName,
          nickname: formNickname,
          age: formAge ? parseInt(formAge, 10) : undefined,
          bowlingStyle: formBowlingStyle,
          battingStyle: formBattingStyle,
          dominantHand: formDominantHand,
          country: formCountry,
          state: formState,
          teamName: formTeamName,
          academy: formAcademy,
          playingLevel: formPlayingLevel,
          biography: formBiography,
          profilePhoto: formProfilePhoto
        });
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [
    formName, formNickname, formAge, formBowlingStyle, formBattingStyle,
    formDominantHand, formCountry, formState, formTeamName, formAcademy,
    formPlayingLevel, formBiography, formProfilePhoto
  ]);

  const toggleSection = (section: string) => {
    playSystemClick();
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Ranks Matrix
  const rankGuideList = [
    { rank: "E-Rank", req: "Starter Rank", rewards: "Baseline Stats Access", unlocks: "Chamber Training, Standard Leg Break" },
    { rank: "D-Rank", req: "Reach Player Level 5", rewards: "+5% Mastery Growth Rate", unlocks: "D-Rank Match Dungeons, Googly Variation" },
    { rank: "C-Rank", req: "Reach Player Level 12", rewards: "+10% Mastery Growth Rate, +15% XP Rate", unlocks: "C-Rank Match Dungeons, Top Spinner Variation" },
    { rank: "B-Rank", req: "Reach Player Level 22", rewards: "+15% Mastery Growth Rate, +25% XP Rate", unlocks: "B-Rank Dungeons, Slider Variation, Wagon Wheel Analyser" },
    { rank: "A-Rank", req: "Reach Player Level 35, 1 Skill Level 10+", rewards: "+20% Mastery Growth, +35% XP, +50 Attribute Threshold", unlocks: "A-Rank Dungeons, Flipper Variation, Pressure Chamber Module" },
    { rank: "S-Rank", req: "Reach Player Level 50, 2 Skills Level 15+", rewards: "+25% Mastery, +50% XP, Dynamic Match Sim Core", unlocks: "S-Rank Lethal Dungeons, Cosmic Aura Skin" },
    { rank: "SS-Rank", req: "Reach Player Level 70, 3 Skills Level 20+", rewards: "+35% Mastery, +75% XP, Multiplier x1.5", unlocks: "Ascension Trials, SS-Rank Exclusive Quests" },
    { rank: "SSS-Rank", req: "Reach Player Level 90, All Skills Level 25+", rewards: "+50% Mastery, +100% XP, Custom Shadow Aura", unlocks: "SSS-Rank Extreme Boss Dungeons" },
    { rank: "Shadow Monarch", req: "Reach Level 100, Complete Ascension Trials", rewards: "+100% Mastery, Absolute Stat Resilience, Sovereign Title", unlocks: "Full Sovereign Access, Primordial Force skin" },
  ];

  // Level Requirements Matrix
  const levelRequirementsList = [
    { level: "Level 1", xp: "0 XP", unlocks: "Baseline Training, Leg Break", difficulty: "EASY", rewards: "Starter Attribute Points" },
    { level: "Level 5", xp: "1,200 XP", unlocks: "Googly, D-Rank Dungeons", difficulty: "EASY", rewards: "+5 Free Stats, D-Rank Shield" },
    { level: "Level 12", xp: "4,500 XP", unlocks: "Top Spinner, C-Rank Dungeons", difficulty: "MEDIUM", rewards: "Gold XP Booster, +10 Free Stats" },
    { level: "Level 22", xp: "12,000 XP", unlocks: "Slider, Wagon Wheel, B-Rank Dungeons", difficulty: "MEDIUM", rewards: "+15 Free Stats, Arcane Matrix Core" },
    { level: "Level 35", xp: "28,000 XP", unlocks: "Flipper, Pressure Chamber, A-Rank Dungeons", difficulty: "CHALLENGING", rewards: "+20 Stats, A-Rank Sovereign Aura" },
    { level: "Level 50", xp: "60,000 XP", unlocks: "S-Rank Match Sims, Elite trials", difficulty: "CHALLENGING", rewards: "Sovereign XP Multiplier x1.25" },
    { level: "Level 75", xp: "120,000 XP", unlocks: "Sovereign Quests, Master Dungeons", difficulty: "MONARCH", rewards: "Absolute Resilience Passive" },
    { level: "Level 100", xp: "250,000 XP", unlocks: "Shadow Monarch Ascension, Cosmic Gates", difficulty: "MONARCH", rewards: "Crown of the Monarch (+100% Stats)" },
  ];

  // Page Features Directory
  const pageFeaturesList = [
    { name: "Dashboard", desc: "The command nexus. Monitors kinetic stats, XP levels, current rank progression, active streaks, and overall training activity summaries.", usage: "Examine health indexes, check active level thresholds, and launch prompt sync actions.", benefits: "Instant visual awareness of bowler efficiency and quick links to active modules.", rewards: "Attribute Growth telemetry monitoring." },
    { name: "Skill Instances", desc: "The spellbook library. Manages and displays individual bowling variations (Leg Break, Googly, Top Spinner, Slider, Flipper). Track detailed spin mechanics, release styles, flight plans, and specific evolution requirements.", usage: "Initiate evolution trials and adjust preferred bowling length settings.", benefits: "Ensures targeted skill growth by allowing deep-dive adjustments of delivery profiles.", rewards: "Skill-specific Mastery level-up triggers." },
    { name: "Quest Journal", desc: "The RPG quest log. Immediately displays available contracts. No generation, no synthesising. Divided into Active, Daily, Weekly, Chamber, Pressure, Mastery, and Trial quests.", usage: "Browse available quests and click 'Deploy Contract' to activate the target task.", benefits: "Saves time with immediate, ready-to-play training challenges.", rewards: "High amounts of Player XP and Mastery XP multipliers." },
    { name: "Evolution Chamber", desc: "The core training simulator. Lands and registers deliveries in real-time. Features interactive canvas feedback with dynamic precision metrics (Perfect, Close, Wide, Fault).", usage: "Perform active over-by-over training runs under direct simulation rules.", benefits: "Direct physical wrist control simulation and instant trajectory calculations.", rewards: "Skill Mastery XP, Player XP, and Evolution Progress." },
    { name: "Match Dungeon", desc: "The match environment. Pitches you against simulated batters with variable aggression, intelligence, and response patterns.", usage: "Bowl tactical overs under full match conditions, managing economy, wickets, and dot balls.", benefits: "Develop match awareness and execution under stressful situations.", rewards: "Elite Dungeon XP, attribute points, and historical match logs." },
    { name: "Pressure Chamber", desc: "The ultimate economy calibration arena. Generates scenarios where batters strike aggressively, requiring absolute dot ball pressure and error-free lengths.", usage: "Survive extreme restrictions (e.g. conceding < 6 runs in 2 overs).", benefits: "Maximizes bowling resilience and composure under pressure.", rewards: "Double Mastery XP, Gold Attribute boosts." },
    { name: "Evolution History", desc: "A chronological system ledger. Lists level-ups, rank-ups, secret triggers, and critical kinetic warnings.", usage: "Review previous performance logs and identify trajectory flaws over time.", benefits: "Perfect diagnostic history for tracking bowling consistency.", rewards: "Archival record synchronization." },
    { name: "Statistics", desc: "A comprehensive analytical suite compiling match averages, bowling strike rates, economy rates, and detailed Wagon Wheel boundary distributions.", usage: "Inspect where boundaries are conceded and what dismissal types are most common.", benefits: "Data-driven optimization of delivery fields and variations.", rewards: "Strategic optimization guidelines." },
    { name: "Achievements", desc: "The Hall of Fame. Features major milestones across skills, levels, dungeons, and training streaks.", usage: "Claim passive bonuses and verify accomplished milestones.", benefits: "Encourages long-term training dedication with clear goals.", rewards: "Stat points, rare visual skins, and profile titles." },
    { name: "Information", desc: "This player handbook and profile manager. Houses game guidelines, level/rank thresholds, dynamic skill metrics, and account parameters.", usage: "Update profile parameters, read gameplay rules, and diagnose storage sync.", benefits: "Clear, consolidated reference for all systems in the Monarch Spinner ecosystem.", rewards: "Auto-saved cloud profiles." },
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-white font-mono">
      {/* HEADER HERO */}
      <div className="bg-[#050505] border border-gray-900 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 shadow-[0_0_30px_rgba(123,47,255,0.05)]">
        <div className="absolute right-0 top-0 pointer-events-none w-80 h-80 bg-amber-500/5 rounded-full filter blur-[110px]" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-950/40 to-black border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-zinc-300 to-amber-400 bg-clip-text text-transparent">Information Hub</h1>
              <span className="text-[9px] bg-amber-950/30 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black">
                PLAYER HANDBOOK & PROFILE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Manage your personal bowler dossier, study rank requirements, track dynamic bowling variation metrics, and browse gameplay mechanics.
            </p>
          </div>
        </div>

        {/* SYNC BRIEF */}
        <div className="flex gap-4 shrink-0 font-mono text-xs w-full md:w-auto">
          <div className="bg-black/80 px-4 py-2.5 rounded-xl border border-gray-900 leading-tight flex-1 md:flex-none">
            <span className="text-gray-500 block text-[9px] uppercase tracking-widest">Profile Status</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1.5 mt-0.5 uppercase">
              <Cloud className="w-3.5 h-3.5" /> SECURE SYNCED
            </span>
          </div>
          <div className="bg-black/80 px-4 py-2.5 rounded-xl border border-gray-900 leading-tight flex-1 md:flex-none">
            <span className="text-gray-500 block text-[9px] uppercase tracking-widest">Active Rank</span>
            <span className="text-amber-400 font-extrabold block mt-0.5 uppercase">
              {player.title || "E-Rank Rookie"}
            </span>
          </div>
        </div>
      </div>

      {/* ACCORDION CONTAINER */}
      <div className="space-y-4">

        {/* SECTION 1: PLAYER PROFILE */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("profile")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 1 — Player Dossier</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Edit credentials, style of bowling, batting stance, and playing bio</span>
              </div>
            </div>
            {openSections.profile ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.profile && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  {/* Autosave status line */}
                  <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>AUTOSAVE CORE LIVE: Modifications instantly synchronize to secure local/cloud cache.</span>
                    </div>
                    {saveStatus !== "IDLE" && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        saveStatus === "SAVING" ? "bg-amber-950 text-amber-400" : "bg-emerald-950 text-emerald-400"
                      }`}>
                        {saveStatus === "SAVING" ? "SYNCING..." : "SECURE SAVED!"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: PHOTO & BASIC BIO */}
                    <div className="md:col-span-4 flex flex-col items-center gap-4 text-center bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900">
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={() => {
                          playSystemClick();
                          setIsPhotoModalOpen(true);
                        }}
                      >
                        <PlayerAvatar 
                          src={player.profilePhoto} 
                          className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-zinc-900"
                          fallbackIconClassName="w-12 h-12"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <span className="text-[9px] font-bold text-amber-400 uppercase font-mono tracking-wider">CHANGE PHOTO</span>
                        </div>
                        {/* Camera badge bottom right */}
                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 rounded-lg border border-black shadow-lg text-black hover:bg-amber-400 transition-colors">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="w-full pt-2 border-t border-zinc-900 space-y-1">
                        <span className="text-zinc-500 text-[10px] uppercase block font-bold">BOWLER SUMMARY</span>
                        <span className="text-white text-sm font-extrabold block">{player.name || "ROHITH RAJ"}</span>
                        <span className="text-amber-400 text-xs font-bold block uppercase">{player.title || "E-Rank Rookie"}</span>
                        <span className="text-[10px] text-zinc-500 block">LEVEL {player.level} • {player.xp} / {player.xpToNextLevel} XP</span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: DETAILED FIELDS FORM */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Player Name</label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="Your real name"
                        />
                      </div>

                      {/* Nickname */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Nickname</label>
                        <input
                          type="text"
                          value={formNickname}
                          onChange={(e) => setFormNickname(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="RPG handle"
                        />
                      </div>

                      {/* Age */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Age</label>
                        <input
                          type="number"
                          value={formAge}
                          onChange={(e) => setFormAge(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="Bowler age"
                        />
                      </div>

                      {/* Bowling Style */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Bowling Style</label>
                        <select
                          value={formBowlingStyle}
                          onChange={(e) => setFormBowlingStyle(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Leg Spin (Wrist Spin)">Leg Spin (Wrist Spin)</option>
                          <option value="Off Spin (Finger Spin)">Off Spin (Finger Spin)</option>
                          <option value="Carrom Ball & Flat Spin">Carrom Ball & Flat Spin</option>
                          <option value="Ambidextrous Mystery Spinner">Ambidextrous Mystery Spinner</option>
                        </select>
                      </div>

                      {/* Batting Style */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Batting Style</label>
                        <select
                          value={formBattingStyle}
                          onChange={(e) => setFormBattingStyle(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Right-Hand Batsman">Right-Hand Batsman</option>
                          <option value="Left-Hand Batsman">Left-Hand Batsman</option>
                        </select>
                      </div>

                      {/* Dominant Hand */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Dominant Hand</label>
                        <select
                          value={formDominantHand}
                          onChange={(e) => setFormDominantHand(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Right">Right Arm Dominant</option>
                          <option value="Left">Left Arm Dominant</option>
                        </select>
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Country</label>
                        <input
                          type="text"
                          value={formCountry}
                          onChange={(e) => setFormCountry(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="e.g. India"
                        />
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">State / Territory</label>
                        <input
                          type="text"
                          value={formState}
                          onChange={(e) => setFormState(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="e.g. Tamil Nadu"
                        />
                      </div>

                      {/* Team Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Team / Club Name</label>
                        <input
                          type="text"
                          value={formTeamName}
                          onChange={(e) => setFormTeamName(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="Your current active club"
                        />
                      </div>

                      {/* Academy */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Coaching Academy</label>
                        <input
                          type="text"
                          value={formAcademy}
                          onChange={(e) => setFormAcademy(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="Where you train"
                        />
                      </div>

                      {/* Playing Level */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Playing Tier Level</label>
                        <input
                          type="text"
                          value={formPlayingLevel}
                          onChange={(e) => setFormPlayingLevel(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="e.g. Club Division A, State Representative"
                        />
                      </div>

                      {/* Biography */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] text-zinc-400 block font-bold uppercase">Biography & Personal Lore</label>
                        <textarea
                          value={formBiography}
                          onChange={(e) => setFormBiography(e.target.value)}
                          rows={3}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                          placeholder="Write something about your bowling quest..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleAutosaveProfile}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-xl transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    >
                      <Save className="w-4 h-4 text-black" /> FORCE SECURE SYNC
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 1B: CORE ATTRIBUTES CODEX */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("attributesDetails")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 1B — Core Attributes Codex</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Deep-dive analysis of spin attributes, in-match mechanics, and level-up systems</span>
              </div>
            </div>
            {openSections.attributesDetails ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.attributesDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  <div className="p-4.5 bg-gradient-to-r from-cyan-950/20 to-zinc-950 border border-cyan-500/20 rounded-xl">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 animate-spin-slow text-cyan-400" /> THE SCIENCE OF SPIN METRICS
                    </h4>
                    <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                      Attributes inside the Monarch mainframe are not manually assigned scores; they are calculated from real Evolution Chamber, Pressure Chamber, Match Dungeon, quest, and skill-performance results. Every page reads the same centralized Attribute Engine values.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-mono font-black uppercase text-white flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-cyan-400" />
                        Player Attribute History
                      </h4>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">Live synchronized RPG stats</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {attributes.map((attr) => {
                        const identity = AttributeEngine.getIdentity(attr.name);
                        const topContributors = Object.entries(attr.contributors || {})
                          .sort((a, b) => Number(b[1]) - Number(a[1]))
                          .slice(0, 3);

                        return (
                          <div key={attr.name} className={`p-4 rounded-xl bg-zinc-950 border ${identity.border} ${identity.glow}`}>
                            <div className="flex items-start justify-between gap-3 border-b border-zinc-900 pb-3">
                              <div>
                                <span className={`text-[11px] font-mono font-black uppercase ${identity.color}`}>{attr.name}</span>
                                <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">{attr.rank || "E-Rank"} progression</p>
                              </div>
                              <span className={`text-2xl font-black font-mono ${identity.color}`}>{attr.value.toFixed(1)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono">
                              <span className="text-zinc-500">Highest <strong className="text-zinc-200">{(attr.highestEver || attr.value).toFixed(1)}</strong></span>
                              <span className="text-zinc-500">Lowest <strong className="text-zinc-200">{(attr.lowestEver || attr.value).toFixed(1)}</strong></span>
                              <span className="text-zinc-500">Today <strong className={identity.color}>+{(attr.todayGain || 0).toFixed(2)}</strong></span>
                              <span className="text-zinc-500">Week <strong className={identity.color}>+{(attr.weeklyGain || 0).toFixed(2)}</strong></span>
                              <span className="text-zinc-500">Month <strong className={identity.color}>+{(attr.monthlyGain || 0).toFixed(2)}</strong></span>
                              <span className="text-zinc-500">Lifetime <strong className={identity.color}>+{(attr.lifetimeGain || 0).toFixed(2)}</strong></span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-zinc-900">
                              <p className="text-[10px] text-zinc-400 leading-relaxed">
                                <strong className="text-zinc-200">Recent source:</strong> {attr.recentSource || "No completed session recorded yet."}
                              </p>
                              <div className="mt-2 space-y-1">
                                {topContributors.length > 0 ? topContributors.map(([name, value]) => (
                                  <div key={name} className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                                    <span className="truncate pr-2">{name}</span>
                                    <strong className={identity.color}>{Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 2)}</strong>
                                  </div>
                                )) : (
                                  <span className="text-[9px] font-mono text-zinc-600 uppercase">Awaiting gameplay contributors</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-xs">
                    {/* Accuracy */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-blue-950/30 border border-blue-500/20 text-blue-400">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">ACCURACY</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">TRAJECTORY PRECISION</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Controls the size of the target dispersion circle. High accuracy tightens your landing coordinates around the intended good length zone, minimizing the chance of dragging down full-tosses or short balls.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Earned by achieving "Perfect Ball" or "Close" ratings inside the Evolution Chamber. Every high-accuracy landing trains your spatial precision and triggers dynamic accuracy level-ups.
                        </p>
                      </div>
                    </div>

                    {/* Control */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-purple-950/30 border border-purple-500/20 text-purple-400">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">CONTROL</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">RELEASE ADAPTABILITY</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Governs trajectory adjustment during the critical release window. Higher Control allows you to make micro-adjustments to combat aggressive batsmen footwork or awkward batting stances.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Level up by mastering individual skills (Leg Break, Googly, etc.). Upgrading your skill variations yields static and scalable Control gains directly.
                        </p>
                      </div>
                    </div>

                    {/* Consistency */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-400">
                          <Repeat className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">CONSISTENCY</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">STAMINA & STABILITY</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Governs stamina limits. High Consistency reduces the chance of execution decay across long bowling stints, ensuring your 5th and 20th overs are as sharp and accurate as your first.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Accumulates through complete over-by-over training blocks. Logging complete 5-over or 20-over sessions without committing technical faults boosts this parameter significantly.
                        </p>
                      </div>
                    </div>

                    {/* Economy */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-amber-950/30 border border-amber-500/20 text-amber-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">ECONOMY</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">BOUNDARY RESTRICTION</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Tightens scoring options by constricting batsmen's driving angles. Higher economy scores prevent boundaries and frustrate batsmen, forcing them to attempt risky strokes to score.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Conceded-run restrictions in Match Dungeons and Pressure Chambers directly reward Economy points upon successful match conclusions.
                        </p>
                      </div>
                    </div>

                    {/* Pressure Handling */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-red-950/30 border border-red-500/20 text-red-400">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">PRESSURE HANDLING</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">CLUTCH RESILIENCE</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Dampens the adverse impact of batsman aggression. During high-scoring spells or tight chases, high Pressure Handling prevents your accuracy zone from shrinking, keeping you calm and lethal.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Successfully complete Pressure Chamber drills and survive high-threat dungeons without conceding consecutive boundaries.
                        </p>
                      </div>
                    </div>

                    {/* Flight */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-400">
                          <Wind className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">FLIGHT</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">VERTICAL DIP ARCHITECTURE</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Modulates vertical air deceleration. High flight creates a sudden dropping "dip" effect in the ball's trajectory right before bouncing, pulling driving batters forward into mistimed drives.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Bowl flighted variations (like Leg Break and Top Spinner) inside the Evolution Chamber with correct high-arc launch trajectories.
                        </p>
                      </div>
                    </div>

                    {/* Drift */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-indigo-950/30 border border-indigo-500/20 text-indigo-400">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">DRIFT</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">AERODYNAMIC SWAY</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Triggers horizontal entry deviation while the ball is travelling through the air. The ball drifts sideways away from its launch vector, confusing batsman footwork alignment.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Achieve extreme spin-rev rates on leg breaks and sliders, and exploit high wind indicators inside the Evolution Chamber simulator.
                        </p>
                      </div>
                    </div>

                    {/* Revolutions */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-orange-950/30 border border-orange-500/20 text-orange-400">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">REVOLUTIONS</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">ROTATION RATIO (RPM)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Governs ball spin rate (RPM). Higher RPMs yield fierce, sharp turn angles off the pitch, catching batsmen on the edge and generating spectacular wickets.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Triggered by perfect wrist snap execution in the Evolution Chamber. Maximizing the finger-roll or wrist-break action on your deliveries directly raises your Revolutions capacity.
                        </p>
                      </div>
                    </div>

                    {/* Bounce */}
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                        <div className="p-1.5 rounded bg-pink-950/30 border border-pink-500/20 text-pink-400">
                          <ArrowUpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-mono text-xs font-black uppercase text-white">BOUNCE</h5>
                          <span className="text-[9px] text-gray-500 block leading-none font-mono mt-0.5">VERTICAL IMPACT COMPRESSION</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong>How it works:</strong> Amplifies vertical recoil on delivery bounce. High bounce causes the ball to rear up unexpectedly toward the batsman gloves, generating edges or pinning them deep.
                        </p>
                        <p className="text-cyan-400 text-[11px] leading-relaxed">
                          <strong>How to level up:</strong> Practice utilizing top spin over-spin deliveries on hard-surface pitches, or complete bounce-specific quests inside the match database.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 2: GAME GUIDE */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("guide")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 2 — Rank Ascension & Game Guide</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Learn about Lifetime Progression, ascension mechanics, and simulator modules</span>
              </div>
            </div>
            {openSections.guide ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.guide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4 text-xs text-zinc-300 font-sans leading-relaxed">
                  {/* LIFETIME PROGRESSION PARADIGM HIGHLIGHT */}
                  <div className="p-4.5 bg-gradient-to-r from-purple-950/20 to-zinc-950 border border-purple-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Award className="w-4.5 h-4.5" />
                      <span className="font-mono text-xs font-black uppercase tracking-wider">RANK ASCENSION TELEMETRY GUIDE</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      The Monarch Spinner System is built around the **Lifetime Progression Philosophy**. Every single quest you complete, session you log, and match you survive contributes permanently to your status coordinates. Progress is never lost, cleared, or reset. To view your active ascension checklist, navigate to the **Ascension Tab** on the primary command bridge.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">1. What is the Monarch Spinner System?</h4>
                    <p>
                      The Monarch Spinner System is an immersive full-stack tactical training ecosystem designed specifically for spin bowlers. It bridges real-world cricket technique with RPG gaming progression mechanics, empowering players to track trajectories, evaluate release accuracy, compile performance metrics, and unlock elite ranks.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">2. The Progression and XP Algorithms</h4>
                    <p>
                      The application separates **Player Level (Character XP)** from **Skill Level (Mastery XP)**:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 mt-1">
                      <li><strong>Player XP:</strong> Earned by completing directives, deploying quest contracts, and finishing training overs. As Player XP reaches the target limit, the player levels up, unlocking new bowling variations, features, and higher difficulty tiers.</li>
                      <li><strong>Skill Mastery XP:</strong> Earned exclusively by landing high-accuracy deliveries (Perfect or Close ratings) using that specific variation inside the chamber. Reaching 100% Mastery in a skill triggers its evolution tier.</li>
                      <li><strong>Skill Level vs. Player Level:</strong> Player level signifies your overall bowler status and access, whereas skill levels reflect your precise execution competence with individual spin types (e.g., Level 5 Leg Break).</li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">3. Core Training Rooms</h4>
                    <p>
                      Progression is achieved across three specialized holographic spaces:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 mt-1">
                      <li><strong>Evolution Chamber:</strong> An isolated indoor net simulator equipped with electronic laser trajectory trackers. It provides feedback on length, wrist rotation, bounce deflection, and drift coordinates.</li>
                      <li><strong>Match Dungeon:</strong> A comprehensive simulation module that pitches you against club-division batsman profiles. Each batsman responds differently to spin, bounce, and pace changes, challenging you to take wickets and maintain low economy rates.</li>
                      <li><strong>Pressure Chamber:</strong> An intense focus simulator where you must bowl under tight limits. Batters are extremely aggressive, and any mistake (wides, full tosses, short balls) immediately compromises the contract integrity.</li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">4. Strategic Data Analytics</h4>
                    <p>
                      The **Wagon Wheel Analysis** compiles batsman response metrics. It shows exactly where runs are conceded (Off side, Leg side, Deep cover, Midwicket) for every ball type, allowing you to fine-tune lengths. General **Statistics** compile economy, strike rates, bowling averages, and historical records, storing everything securely in the cloud to prevent local data loss.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3: RANK GUIDE */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("ranks")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-rose-500" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 3 — Rank Matrix Guide</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Inspect requirements, stat boosts, and unlocked content for E through Monarch Ranks</span>
              </div>
            </div>
            {openSections.ranks ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.ranks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RANK_REQUIREMENTS_LIST.map((rg, i) => {
                      const isMonarch = rg.rankName.toLowerCase().includes("monarch");
                      const isHighRank = rg.rankName.toLowerCase().startsWith("s-") || rg.rankName.toLowerCase().includes("ss");
                      return (
                        <div 
                          key={i} 
                          className={`p-4 rounded-xl border bg-black/60 flex flex-col justify-between ${
                            isMonarch 
                              ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] bg-gradient-to-br from-red-950/15 to-black"
                              : isHighRank
                              ? "border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-zinc-950"
                              : "border-zinc-900 hover:border-zinc-800"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                              <div>
                                <span className={`text-sm font-black uppercase block ${
                                  isMonarch ? "text-red-400" : isHighRank ? "text-purple-400" : "text-zinc-300"
                                }`}>
                                  {rg.rankName}
                                </span>
                                <span className="text-[10px] font-sans text-gray-500 block italic mt-0.5">
                                  {rg.proposedTitle}
                                </span>
                              </div>
                              <span className="text-[8px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded uppercase font-mono font-bold">
                                LEVEL {rg.levelNeeded}
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                              {rg.description}
                            </p>

                            <div className="space-y-1 text-[11px] font-sans pt-1">
                              <div>
                                <strong className="text-zinc-500 font-mono text-[9px] uppercase block">Lifetime Metrics Required:</strong>
                                <ul className="list-disc pl-4 text-zinc-300 text-[10px] space-y-0.5 mt-0.5">
                                  <li>Min Level: {rg.levelNeeded}</li>
                                  <li>Attributes: {Object.entries(rg.attributesNeeded).map(([k, v]) => `${k} (${v})`).join(", ")}</li>
                                  <li>Practice Quests: {rg.practiceQuestsNeeded}</li>
                                  <li>Chamber Sessions: {rg.evolutionSessionsNeeded}</li>
                                  <li>Match Dungeons: {rg.matchDungeonsNeeded}</li>
                                  <li>Pressure Drills: {rg.pressureChambersNeeded}</li>
                                  <li>Evolution Trials: {rg.evolutionTrialsNeeded}</li>
                                  <li>Skills Condition: {rg.skillsCondition.description}</li>
                                  {rg.perfectDeliveriesNeeded && <li>Perfect Deliveries: {rg.perfectDeliveriesNeeded}</li>}
                                  {rg.dotBallsNeeded && <li>Dot Balls: {rg.dotBallsNeeded}</li>}
                                  {rg.wicketsNeeded && <li>Wickets: {rg.wicketsNeeded}</li>}
                                  {rg.economyBelowNeeded && <li>Average Economy: &lt; {rg.economyBelowNeeded.toFixed(2)}</li>}
                                </ul>
                              </div>
                              <p className="text-cyan-400 pt-1">
                                <strong className="text-zinc-500 font-mono text-[9px] uppercase block">Unlocked Access:</strong> 
                                {rg.unlockedFeatures}
                              </p>
                              <p className="text-emerald-400">
                                <strong className="text-zinc-500 font-mono text-[9px] uppercase block">Unlocked Rewards:</strong> 
                                {rg.unlockedRewards}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 4: SKILL EVOLUTION GUIDE */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("evolution")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 4 — Skill Evolution Handbook</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Learn how skills grow, trial mechanics, and evolution triggers</span>
              </div>
            </div>
            {openSections.evolution ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.evolution && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4 text-xs text-zinc-300 font-sans leading-relaxed">
                  <div className="space-y-1.5">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">1. Levelling Individual Variations</h4>
                    <p>
                      Every time you successfully bowl inside the Evolution Chamber or Match Dungeon using a specific variation (e.g. Googly), the system analyzes release characteristics. Precise drops and steep revolutions yield **Skill Mastery XP**. When mastery gains reach 100%, the variation levels up, extending accuracy boundaries.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">2. Unlocking Evolution Trials</h4>
                    <p>
                      Once a skill reaches certain levels (Level 5, 10, 15, 20), its progress bottlenecks. The player must enter the **Evolution Chamber** and unlock an **Evolution Trial**. These trials are high-intensity tests with strict objectives (e.g., Land 8 Perfect deliveries and achieve a wickets target). Completing the trial triggers a permanent evolution stage!
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">3. Evolution Stages</h4>
                    <p>
                      Bowling variations evolve through distinct tiers, each boosting control, dip, and deceptive trajectory boundaries:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono mt-2">
                      <div className="p-2 bg-zinc-950 border border-zinc-900 rounded text-center">
                        <span className="text-gray-500 block text-[8px] font-black">STAGE 1</span>
                        <span className="text-zinc-300 text-xs font-bold uppercase">COMMON</span>
                      </div>
                      <div className="p-2 bg-zinc-950 border border-zinc-900 rounded text-center">
                        <span className="text-cyan-500 block text-[8px] font-black">STAGE 2</span>
                        <span className="text-cyan-300 text-xs font-bold uppercase">RARE</span>
                      </div>
                      <div className="p-2 bg-zinc-950 border border-zinc-900 rounded text-center">
                        <span className="text-purple-500 block text-[8px] font-black">STAGE 3</span>
                        <span className="text-purple-300 text-xs font-bold uppercase">EPIC</span>
                      </div>
                      <div className="p-2 bg-zinc-950 border border-zinc-900 rounded text-center">
                        <span className="text-red-500 block text-[8px] font-black">STAGE 4</span>
                        <span className="text-red-300 text-xs font-bold uppercase">LEGENDARY</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-white font-mono font-bold text-sm uppercase">4. Chamber and Match Support</h4>
                    <p>
                      Nets focus heavily on landing spots and consistency. Match Dungeons stress execution against actual target metrics, granting dynamic modifiers to overall speed and recovery rates. Pressure Chamber runs harden the variation, protecting it from getting struck for easy boundaries.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 5: LEVEL REQUIREMENTS */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("levels")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 5 — Level Threshold Database</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Explore required XP, rewards, and unlocked training modules for player levels</span>
              </div>
            </div>
            {openSections.levels ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.levels && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <div className="overflow-x-auto rounded-xl border border-zinc-900">
                    <table className="w-full border-collapse text-left font-mono text-[11px]">
                      <thead>
                        <tr className="bg-[#050505] border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px]">
                          <th className="p-3">Player Level</th>
                          <th className="p-3">Required XP</th>
                          <th className="p-3">Unlocked Features</th>
                          <th className="p-3">Quest Difficulty</th>
                          <th className="p-3">Sovereign Rewards</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 bg-black/35">
                        {levelRequirementsList.map((lvl, index) => (
                          <tr key={index} className="hover:bg-zinc-950/40 transition-colors">
                            <td className="p-3 font-bold text-white uppercase">{lvl.level}</td>
                            <td className="p-3 text-cyan-400 font-semibold">{lvl.xp}</td>
                            <td className="p-3 text-zinc-300 font-sans">{lvl.unlocks}</td>
                            <td className="p-3">
                              <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                                lvl.difficulty === "MONARCH" ? "text-red-400 border-red-500/20 bg-red-950/20" :
                                lvl.difficulty === "CHALLENGING" ? "text-purple-400 border-purple-500/20" : "text-cyan-400 border-cyan-500/20"
                              }`}>
                                {lvl.difficulty}
                              </span>
                            </td>
                            <td className="p-3 text-emerald-400 font-sans">{lvl.rewards}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 6: SKILL REQUIREMENTS */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("skillsReq")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 6 — Dynamic Skill Metrics</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Check current level, mastery percentage, evolution stage, and requirements for all spin variations</span>
              </div>
            </div>
            {openSections.skillsReq ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.skillsReq && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill) => (
                      <div key={skill.id} className="p-4 rounded-xl border border-zinc-900 bg-black/60 space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <div>
                            <span className="text-xs font-black text-white uppercase tracking-wider">{skill.name}</span>
                            <span className="text-[9px] text-zinc-500 block font-sans mt-0.5">Style: {skill.spinDirection || "Wrist Spin"}</span>
                          </div>
                          <span className="text-xs font-black text-amber-400 font-mono">LEVEL {skill.level}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px] font-sans">
                          <div>
                            <span className="text-zinc-500 block text-[9px] font-mono uppercase font-black leading-none mb-1">Current XP</span>
                            <span className="text-cyan-400 font-bold font-mono">{skill.mastery}% Mastery</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] font-mono uppercase font-black leading-none mb-1">Required XP</span>
                            <span className="text-zinc-300 font-bold font-mono">{(100 - skill.mastery)}% to level-up</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] font-mono uppercase font-black leading-none mb-1">Evolution Stage</span>
                            <span className="text-purple-400 font-black font-mono uppercase text-[10px]">{skill.rarity}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] font-mono uppercase font-black leading-none mb-1">Mastery Pct</span>
                            <span className="text-emerald-400 font-bold font-mono">{skill.mastery}%</span>
                          </div>
                        </div>

                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-[10px]">
                          <span className="text-zinc-500 block uppercase font-bold text-[8px] mb-0.5">Next Evolution Requirement:</span>
                          <p className="text-zinc-300 font-sans leading-relaxed">{skill.evolutionRequirements || "Achieve level 10 and complete a specialized chamber trial."}</p>
                        </div>
                      </div>
                    ))}
                    {skills.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-zinc-600 font-sans">
                        No spin variations found in database.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 7: GAME FEATURES */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("features")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 7 — Game Features Directory</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Detailed breakdown of every portal and room inside the application</span>
              </div>
            </div>
            {openSections.features ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.features && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {pageFeaturesList.map((feat, index) => (
                    <div key={index} className="p-4 rounded-xl border border-zinc-900 bg-black/50 space-y-2">
                      <div className="flex justify-between items-center border-b border-zinc-900/50 pb-1.5">
                        <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">{feat.name} Portal</span>
                        <span className="text-[8px] bg-indigo-950/30 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-black uppercase">PAGE MANUAL</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans leading-relaxed">
                        <div className="space-y-1">
                          <p className="text-zinc-300"><strong className="text-zinc-500 font-mono text-[9.5px] uppercase block">Purpose:</strong> {feat.desc}</p>
                          <p className="text-zinc-300"><strong className="text-zinc-500 font-mono text-[9.5px] uppercase block">Usage:</strong> {feat.usage}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-cyan-300"><strong className="text-zinc-500 font-mono text-[9.5px] uppercase block">Benefits:</strong> {feat.benefits}</p>
                          <p className="text-emerald-400"><strong className="text-zinc-500 font-mono text-[9.5px] uppercase block">Rewards:</strong> {feat.rewards}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 8: FAQ */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("faq")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 8 — Frequently Asked Questions</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Quick answers to common bowling and progression queries</span>
              </div>
            </div>
            {openSections.faq ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.faq && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4 text-xs text-zinc-300 font-sans leading-relaxed">
                  <div className="space-y-1">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How do I rank up?</h5>
                    <p className="text-zinc-400">
                      A: Ranks are updated as you reach player level thresholds (e.g. Level 5 for D-Rank, Level 12 for C-Rank). At level 15+ or 750 control score, you can enter the Ascension Chamber and complete rank-up trials to claim elite titles like Shadow Monarch.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-3">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How do I level up skills?</h5>
                    <p className="text-zinc-400">
                      A: Go to the Evolution Chamber or Match Dungeon. Bowl deliveries using your target spin ball. Landing Perfect balls increases your Skill Mastery percentage. At 100% mastery, the skill triggers a level-up.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-3">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How are quests assigned?</h5>
                    <p className="text-zinc-400">
                      A: Quests are drawn directly from the application database ledger. Open the Quest Journal page, browse the categories, select a contract, and click "Deploy Contract" to activate it instantly.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-3">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How do I unlock Monarch Rank?</h5>
                    <p className="text-zinc-400">
                      A: Reaching level 100 and completing all SSS-Rank Ascension challenges unlocks the supreme Monarch title, granting maximum stat multipliers and sovereign aura profiles.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-3">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How does Wagon Wheel work?</h5>
                    <p className="text-zinc-400">
                      A: During simulation runs and match overs, the system registers boundary directions. The Wagon Wheel compiles this data, mapping exactly where batsmen successfully struck balls to identify length vulnerabilities.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-3">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How are statistics calculated?</h5>
                    <p className="text-zinc-400">
                      A: Standard cricket algorithms compile your match history: Economy Rate = Runs conceded / Overs bowled; Strike Rate = Balls bowled / Wickets taken; Bowling Average = Runs conceded / Wickets taken.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-3">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How is XP awarded?</h5>
                    <p className="text-zinc-400">
                      A: Successfully bowling overs yields baseline XP. Completing active story directives or deployed journal quests grants substantial XP multipliers.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-3">
                    <h5 className="text-white font-mono font-bold uppercase">Q: How do I restore cloud data?</h5>
                    <p className="text-zinc-400">
                      A: Under the Version Information or Dashboard sync panel, click the 'Refresh Cloud Sync' button to force-pull your character dossier from the secure backup server.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 9: VERSION INFORMATION */}
        <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
          <button
            onClick={() => toggleSection("version")}
            className="w-full px-5 py-4 flex items-center justify-between bg-[#050505] hover:bg-zinc-900/40 border-b border-zinc-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">SECTION 9 — Telemetry & Version Information</span>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Inspect cloud storage sync status, local storage logs, and binary versions</span>
              </div>
            </div>
            {openSections.version ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>

          <AnimatePresence initial={false}>
            {openSections.version && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wider block">Application Version</span>
                      <span className="text-xs font-bold text-white block font-mono">v4.8.2-Sovereign-Release</span>
                    </div>

                    <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wider block">Database Ledger Version</span>
                      <span className="text-xs font-bold text-cyan-300 block font-mono">db_spin_monarch_v10</span>
                    </div>

                    <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wider block">Cloud Sync Status</span>
                      <span className="text-xs font-bold text-emerald-400 block font-mono">SYNCHRONIZED (100% integrity)</span>
                    </div>

                    <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wider block">Last Sync Time</span>
                      <span className="text-xs font-bold text-zinc-300 block font-mono">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>

                    <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wider block">Storage Space Occupied</span>
                      <span className="text-xs font-bold text-zinc-300 block font-mono">1.82 MB (Cloud Allocated: 50.0 MB)</span>
                    </div>

                    <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wider block">Local Cache Status</span>
                      <span className="text-xs font-bold text-emerald-400 block font-mono">ACTIVE (Operational)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <ChangePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhoto={player.profilePhoto}
        onSuccess={(newUrl) => {
          // Update profilePhoto
          onUpdatePlayer({ profilePhoto: newUrl || "" });
          setFormProfilePhoto(newUrl || "");
          
          // Trigger success notification
          setPhotoNotification("Profile photo updated successfully.");
          setTimeout(() => {
            setPhotoNotification(null);
          }, 3000);
        }}
      />

      <AnimatePresence>
        {photoNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-zinc-950/95 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] text-xs font-mono font-bold tracking-wider flex items-center gap-3 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{photoNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
