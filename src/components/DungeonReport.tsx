import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Skull, ShieldAlert, Award, Star, 
  Zap, Trash2, HelpCircle, Trophy, Sparkles, ChevronRight,
  Info, Calendar, Search, ListFilter, X, BookOpen, AlertTriangle
} from "lucide-react";
import { DungeonRecord, SkillItem, PracticeQuest } from "../types";
import { playSystemClick, playSystemDing, playSystemError, playPortalSwoosh } from "../utils/audio";
import WagonWheelMap, { getCricketZone, WagonWheelDeliver } from "./WagonWheelMap";
import DungeonCockpit from "./DungeonCockpit";

interface DungeonReportProps {
  pastDungeons: DungeonRecord[];
  skills: SkillItem[];
  onAddDungeonRecord: (record: Omit<DungeonRecord, "id" | "timestamp" | "threatEliminationScore" | "aiDebrief"> & {
    threatEliminationScore?: number;
    aiDebrief?: string;
    wicketsBreakdown?: Array<{ skillId: string; skillName: string; dismissalType: string; batsmanThreat: string }>;
    boundariesBreakdown?: Array<{ skillId: string; skillName: string; scoreType: "4" | "6"; strokeType: string; rootCause: string; direction: string }>;
    pressureResilienceLevel?: string;
    isMvp?: boolean;
    matchDate?: string;
    matchType?: string;
    variationsUsed?: string[];
    matchNotes?: string;
    maidenOvers?: number;
  }) => void;
  onDeleteDungeonRecord: (id: string) => void;
  isEvaluating: boolean;
  activeAuraUnlocked: string;
  activePracticeQuest?: PracticeQuest;
  onTriggerSectionLoader?: (title: string, messages: string[], onComplete: () => void) => void;
}

export default function DungeonReport({
  pastDungeons = [],
  skills = [],
  onAddDungeonRecord,
  onDeleteDungeonRecord,
  isEvaluating,
  activeAuraUnlocked,
  activePracticeQuest,
  onTriggerSectionLoader,
}: DungeonReportProps) {
  // Navigation tabs: "PLAY" (New Dungeon) vs "ARCHIVES" (Dungeon Records)
  const [activeTab, setActiveTab] = useState<"PLAY" | "ARCHIVES">("PLAY");

  // Form Fields for NEW DUNGEON
  const [matchName, setMatchName] = useState("");
  const [rank, setRank] = useState<"E" | "D" | "C" | "B" | "A" | "S">("B");
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [matchType, setMatchType] = useState("T20 Match");
  const [overs, setOvers] = useState(4);
  const [runs, setRuns] = useState(22);
  const [dotBalls, setDotBalls] = useState(12);
  const [maidenOvers, setMaidenOvers] = useState(0);
  const [matchNotes, setMatchNotes] = useState("");
  const [pressureLevel, setPressureLevel] = useState<"NO" | "LOW" | "MEDIUM" | "HIGH" | "EXTREME">("MEDIUM");
  const [isMvp, setIsMvp] = useState(false);

  // Checkboxes for Variations Used manually in the spell
  const [selectedVariations, setSelectedVariations] = useState<Record<string, boolean>>({});

  // Wickets and Boundaries breakdown state
  interface WicketInput {
    skillId: string;
    dismissalType: string;
    batsmanThreat: "F" | "E" | "D" | "C" | "B" | "A" | "S";
  }

  interface BoundaryInput {
    skillId: string;
    scoreType: "4" | "6";
    strokeType: string;
    rootCause: string;
    direction: string;
  }

  const [wicketsInMatch, setWicketsInMatch] = useState<WicketInput[]>([]);
  const [boundariesInMatch, setBoundariesInMatch] = useState<BoundaryInput[]>([]);

  // Individual item input states
  const [selectedWktSkillId, setSelectedWktSkillId] = useState<string>(skills[0]?.id || "");
  const [wktDismissType, setWktDismissType] = useState<string>("Bowled");
  const [wktThreat, setWktThreat] = useState<"F" | "E" | "D" | "C" | "B" | "A" | "S">("B");

  const [selectedBndSkillId, setSelectedBndSkillId] = useState<string>(skills[0]?.id || "");
  const [bndType, setBndType] = useState<"4" | "6">("4");
  const [bndStroke, setBndStroke] = useState<string>("Drive");
  const [bndCause, setBndCause] = useState<string>("Short Ball");
  const [bndDirection, setBndDirection] = useState<string>("long off");

  // Filter & Search & Sort states for DUNGEON RECORDS
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState<"date_desc" | "date_asc" | "wickets_desc" | "economy_asc" | "threat_desc">("date_desc");

  // Interactive Detailed Match Overlay / Modal
  const [selectedArchive, setSelectedArchive] = useState<DungeonRecord | null>(null);

  // Deletion Confirmation Overlay / Modal
  const [archiveToDelete, setArchiveToDelete] = useState<DungeonRecord | null>(null);

  // MATCH DUNGEON SESSION COCKPIT STATES
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDeliveries, setSessionDeliveries] = useState<WagonWheelDeliver[]>([]);
  const [currentSelectedBallIndex, setCurrentSelectedBallIndex] = useState<number | null>(null);
  
  // Wicket popover/modal state
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wktModalDismissType, setWktModalDismissType] = useState("Bowled");
  const [wktModalThreat, setWktModalThreat] = useState<"F" | "E" | "D" | "C" | "B" | "A" | "S">("B");

  // Keep dropdown selections synced if the skills array changes dynamically (e.g. registered custom skills)
  React.useEffect(() => {
    if (skills.length > 0) {
      if (!selectedWktSkillId || !skills.some(s => s.id === selectedWktSkillId)) {
        setSelectedWktSkillId(skills[0].id);
      }
      if (!selectedBndSkillId || !skills.some(s => s.id === selectedBndSkillId)) {
        setSelectedBndSkillId(skills[0].id);
      }
    }
  }, [skills, selectedWktSkillId, selectedBndSkillId]);

  // Manual Log Submission Handlers
  const handleToggleVariation = (variationName: string) => {
    playSystemClick();
    setSelectedVariations(prev => ({
      ...prev,
      [variationName]: !prev[variationName]
    }));
  };

  const handleAddWicketItem = () => {
    playSystemClick();
    if (!selectedWktSkillId) return;
    setWicketsInMatch(prev => [
      ...prev,
      {
        skillId: selectedWktSkillId,
        dismissalType: wktDismissType,
        batsmanThreat: wktThreat
      }
    ]);
  };

  const handleRemoveWicketItem = (index: number) => {
    playSystemClick();
    setWicketsInMatch(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddBoundaryItem = () => {
    playSystemClick();
    if (!selectedBndSkillId) return;
    setBoundariesInMatch(prev => [
      ...prev,
      {
        skillId: selectedBndSkillId,
        scoreType: bndType,
        strokeType: bndStroke,
        rootCause: bndCause,
        direction: bndDirection
      }
    ]);
  };

  const handleRemoveBoundaryItem = (index: number) => {
    playSystemClick();
    setBoundariesInMatch(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchName.trim()) return;

    playSystemClick();

    const wicketsCount = wicketsInMatch.length;
    const boundariesCount = boundariesInMatch.length;
    const economyRate = overs > 0 ? Number((runs / overs).toFixed(2)) : 0;

    const economyFactor = Math.max(0, 12 - economyRate) * 4;
    const wicketsFactor = wicketsCount * 15;
    const dotBallsFactor = (dotBalls / (overs * 6)) * 30;
    const stressBonus = { EXTREME: 20, HIGH: 12, MEDIUM: 5, LOW: 2, NO: 0 }[pressureLevel] || 0;
    const calculatedThreatElim = Math.min(Math.max(Math.round(30 + economyFactor + wicketsFactor + dotBallsFactor + stressBonus), 10), 99);

    let debriefText = `Dungeon threat rank: ${rank}-Rank. Threat neutralized with an estimated ${calculatedThreatElim}% containment rating. `;
    if (wicketsCount > 0) {
      const skillsUsed = wicketsInMatch.map(w => skills.find(s => s.id === w.skillId)?.name || "variation").join(", ");
      debriefText += `Logged ${wicketsCount} lethal Skill Takedowns using ${skillsUsed}. `;
    } else {
      debriefText += "Zero key wickets registered during the spell, less striker containment. ";
    }
    if (boundariesCount > 2) {
      debriefText += `Conceded ${boundariesCount} boundaries. Root causes trace back to length overpitches. System recommends Slider drills immediately.`;
    } else {
      debriefText += "Impeccable execution to restrict boundary releases. Target tracking matrix is fully secure.";
    }

    const variationsFinalList = Object.keys(selectedVariations).filter(k => selectedVariations[k]);

    onAddDungeonRecord({
      matchName,
      rank,
      matchDate,
      matchType,
      overs,
      runs,
      wickets: wicketsCount,
      economy: economyRate,
      dotBalls,
      boundaries: boundariesCount,
      dismissalType: wicketsInMatch[0]?.dismissalType || "Dot Containment",
      threatEliminationScore: calculatedThreatElim,
      aiDebrief: debriefText,
      wicketsBreakdown: wicketsInMatch.map(w => ({
        skillId: w.skillId,
        skillName: skills.find(s => s.id === w.skillId)?.name || "Variation",
        dismissalType: w.dismissalType,
        batsmanThreat: w.batsmanThreat
      })),
      boundariesBreakdown: boundariesInMatch.map(b => ({
        skillId: b.skillId,
        skillName: skills.find(s => s.id === b.skillId)?.name || "Variation",
        scoreType: b.scoreType,
        strokeType: b.strokeType,
        rootCause: b.rootCause,
        direction: b.direction
      })),
      pressureResilienceLevel: pressureLevel,
      isMvp,
      matchNotes,
      maidenOvers,
      variationsUsed: variationsFinalList
    });

    setMatchName("");
    setIsMvp(false);
    setSelectedVariations({});
    setMatchNotes("");
    setMaidenOvers(0);
    setWicketsInMatch([]);
    setBoundariesInMatch([]);
    playSystemDing();
  };

  // Cockpit Session Helpers
  const handleStartSession = () => {
    if (!matchName.trim()) {
      playSystemError();
      alert("Please enter a Dungeon Raid Match Name first.");
      return;
    }
    playPortalSwoosh();
    
    const totalBalls = overs * 6;
    const defaultDeliveries: WagonWheelDeliver[] = Array.from({ length: totalBalls }).map((_, i) => {
      const overNum = Math.floor(i / 6) + 1;
      const ballNum = (i % 6) + 1;
      return {
        over: overNum,
        ballNum: ballNum,
        skillName: skills[0]?.name || "Leg Break",
        length: "Good Length",
        runs: 0,
        isWicket: false,
        wicketType: "",
        angle: undefined,
        distance: undefined,
        zone: undefined
      };
    });
    
    const startAction = () => {
      setSessionDeliveries(defaultDeliveries);
      setCurrentSelectedBallIndex(0);
      setIsSessionActive(true);
    };

    if (onTriggerSectionLoader) {
      onTriggerSectionLoader(
        `Entering Dungeon Raid: ${matchName}...`,
        [
          "Generating Dungeon Architecture & Runic Grids...",
          "Calibrating Opposition Striker Trajectory AI...",
          "Aligning Stadium Crowd Acoustics & Pressure Fields...",
          "Synchronizing Pitch Friction and Wind Resistance...",
          "Match Dungeon Gateways Opened..."
        ],
        startAction
      );
    } else {
      startAction();
    }
  };

  const getSessionStats = () => {
    const fours = sessionDeliveries.filter(d => d.runs === 4).length;
    const sixes = sessionDeliveries.filter(d => d.runs === 6).length;
    const wickets = sessionDeliveries.filter(d => d.isWicket).length;
    const totalBalls = overs * 6;
    
    const boundaryPct = totalBalls > 0 ? Math.round(((fours + sixes) / totalBalls) * 100) : 0;
    const wicketPct = totalBalls > 0 ? Math.round((wickets / totalBalls) * 100) : 0;
    
    const nonBoundaryBalls = totalBalls - (fours + sixes + wickets);
    const rankFactors: Record<string, number> = { S: 1.1, A: 0.95, B: 0.8, C: 0.65, D: 0.5, E: 0.4 };
    const rankFactor = rankFactors[rank] || 0.8;
    
    const stressFactors: Record<string, number> = { EXTREME: 1.3, HIGH: 1.15, MEDIUM: 1.0, LOW: 0.85, NO: 0.7 };
    const stressFactor = stressFactors[pressureLevel] || 1.0;
    
    const estOtherRuns = Math.round(nonBoundaryBalls * rankFactor * stressFactor * 0.9);
    const totalRuns = (fours * 4) + (sixes * 6) + estOtherRuns;
    const econEstimate = Number((totalRuns / overs).toFixed(2)) || 0;
    const estDotBalls = Math.round(nonBoundaryBalls * 0.65);
    
    return {
      fours,
      sixes,
      wickets,
      boundaryPct,
      wicketPct,
      totalRuns,
      econEstimate,
      estDotBalls
    };
  };

  const sessionStats = getSessionStats();

  const handleUpdateBallOutcome = (outcomeType: "4" | "6" | "Wicket" | "CLEAR") => {
    if (currentSelectedBallIndex === null) return;
    playSystemClick();
    
    setSessionDeliveries(prev => {
      const updated = [...prev];
      const current = { ...updated[currentSelectedBallIndex] };
      
      if (outcomeType === "4") {
        current.runs = 4;
        current.isWicket = false;
        current.wicketType = "";
      } else if (outcomeType === "6") {
        current.runs = 6;
        current.isWicket = false;
        current.wicketType = "";
      } else if (outcomeType === "Wicket") {
        setShowWicketModal(true);
        return prev;
      } else if (outcomeType === "CLEAR") {
        current.runs = 0;
        current.isWicket = false;
        current.wicketType = "";
        current.angle = undefined;
        current.distance = undefined;
        current.zone = undefined;
      }
      
      updated[currentSelectedBallIndex] = current;
      return updated;
    });
  };

  const handleConfirmWicketModal = () => {
    if (currentSelectedBallIndex === null) return;
    playSystemClick();
    setShowWicketModal(false);
    
    setSessionDeliveries(prev => {
      const updated = [...prev];
      const current = { ...updated[currentSelectedBallIndex] };
      
      current.isWicket = true;
      current.runs = 0;
      current.wicketType = wktModalDismissType;
      
      // If no wagon wheel placement required (Bowled, LBW, Stumped), clear coordinates
      const wwRequired = ["CAUGHT", "RUN_OUT", "CAUGHT_BOWL", "CAUGHT & BOWLED"].includes(wktModalDismissType.toUpperCase());
      if (!wwRequired) {
        current.angle = undefined;
        current.distance = undefined;
        current.zone = undefined;
      }
      
      updated[currentSelectedBallIndex] = current;
      return updated;
    });
  };

  const handleUpdateBallVariation = (variationName: string) => {
    if (currentSelectedBallIndex === null) return;
    playSystemClick();
    setSessionDeliveries(prev => {
      const updated = [...prev];
      updated[currentSelectedBallIndex] = {
        ...updated[currentSelectedBallIndex],
        skillName: variationName
      };
      return updated;
    });
  };

  const handleWagonWheelClick = (coord: { angle: number; distance: number; zone: string }) => {
    if (currentSelectedBallIndex === null) return;
    
    const currentBall = sessionDeliveries[currentSelectedBallIndex];
    const isBoundary = currentBall.runs === 4 || currentBall.runs === 6;
    const isWwWicket = currentBall.isWicket && ["CAUGHT", "RUN_OUT", "CAUGHT_BOWL", "CAUGHT & BOWLED"].includes(currentBall.wicketType?.toUpperCase() || "");
    
    if (!isBoundary && !isWwWicket) {
      playSystemError();
      return;
    }
    
    playSystemClick();
    setSessionDeliveries(prev => {
      const updated = [...prev];
      updated[currentSelectedBallIndex] = {
        ...updated[currentSelectedBallIndex],
        angle: coord.angle,
        distance: coord.distance,
        zone: coord.zone
      };
      return updated;
    });
  };

  const handleConfirmSessionSubmit = () => {
    if (!matchName.trim()) return;
    
    const unplacedDeliveries = sessionDeliveries.filter((d) => {
      const isBoundary = d.runs === 4 || d.runs === 6;
      const isWwWicket = d.isWicket && ["CAUGHT", "RUN_OUT", "CAUGHT_BOWL", "CAUGHT & BOWLED"].includes(d.wicketType?.toUpperCase() || "");
      return (isBoundary || isWwWicket) && (d.angle === undefined || d.distance === undefined);
    });
    
    if (unplacedDeliveries.length > 0) {
      playSystemError();
      const firstUnplaced = unplacedDeliveries[0];
      alert(`Wagon Wheel target placement required! Over ${firstUnplaced.over}, Ball ${firstUnplaced.ballNum} needs coordinate placement. Please click on the Wagon Wheel Map for this delivery.`);
      
      const idx = sessionDeliveries.findIndex(d => d.over === firstUnplaced.over && d.ballNum === firstUnplaced.ballNum);
      if (idx !== -1) setCurrentSelectedBallIndex(idx);
      return;
    }

    playSystemClick();
    const stats = getSessionStats();
    
    let selectedWktSkillStr = sessionDeliveries
      .filter(d => d.isWicket)
      .map(d => d.skillName)
      .filter((v, i, self) => self.indexOf(v) === i)
      .join(", ");
      
    let calculatedThreatElim = Math.min(Math.max(Math.round((100 - stats.boundaryPct) * 0.4 + (stats.wickets * 16) - (stats.econEstimate * 3.5) + 30), 10), 99);
    
    let debriefText = `Dungeon threat rank: ${rank}-Rank. Threat neutralized successfully with an estimated ${calculatedThreatElim}% containment rating. `;
    if (stats.wickets > 0) {
      debriefText += `Logged ${stats.wickets} lethal Skill Takedowns using ${selectedWktSkillStr || "variations"}. `;
    } else {
      debriefText += "Zero key wickets registered during the spell, less striker containment. ";
    }
    if (stats.fours + stats.sixes > 2) {
      debriefText += `Conceded ${stats.fours + stats.sixes} boundaries. Root causes trace back to length overpitches. System recommends Slider drills immediately.`;
    } else {
      debriefText += "Impeccable execution to restrict boundary releases. Target tracking matrix is fully secure.";
    }
    
    const variationsFinalList = Array.from(new Set(sessionDeliveries.map(d => d.skillName))) as string[];
    
    onAddDungeonRecord({
      matchName,
      rank,
      matchDate,
      matchType,
      overs,
      runs: stats.totalRuns,
      wickets: stats.wickets,
      economy: stats.econEstimate,
      dotBalls: stats.estDotBalls,
      boundaries: stats.fours + stats.sixes,
      dismissalType: sessionDeliveries.find(d => d.isWicket)?.wicketType || "Dot Containment",
      threatEliminationScore: calculatedThreatElim,
      aiDebrief: debriefText,
      wicketsBreakdown: sessionDeliveries
        .filter(d => d.isWicket)
        .map(d => ({
          skillId: skills.find(s => s.name === d.skillName)?.id || "Leggy",
          skillName: d.skillName,
          dismissalType: d.wicketType,
          batsmanThreat: "B"
        })),
      boundariesBreakdown: sessionDeliveries
        .filter(d => d.runs === 4 || d.runs === 6)
        .map(d => ({
          skillId: skills.find(s => s.name === d.skillName)?.id || "Leggy",
          skillName: d.skillName,
          scoreType: String(d.runs) as "4" | "6",
          strokeType: d.runs === 6 ? "Slog" : "Drive",
          rootCause: "Dragged Length",
          direction: d.zone || "long off"
        })),
      pressureResilienceLevel: pressureLevel,
      isMvp,
      matchNotes,
      maidenOvers: 0,
      variationsUsed: variationsFinalList
    });
    
    // Reset controls
    setMatchName("");
    setIsMvp(false);
    setSelectedVariations({});
    setMatchNotes("");
    setMaidenOvers(0);
    setIsSessionActive(false);
    playSystemDing();
  };

  const getAIWeaknessAlert = () => {
    const recordsWithBoundaries = pastDungeons.filter(d => d.boundariesBreakdown && d.boundariesBreakdown.length > 0);
    if (recordsWithBoundaries.length === 0) return null;

    const skillCauseCount: Record<string, { total: number; shortBall: number }> = {};
    recordsWithBoundaries.forEach(rec => {
      (rec.boundariesBreakdown || []).forEach(b => {
        if (!skillCauseCount[b.skillName]) {
          skillCauseCount[b.skillName] = { total: 0, shortBall: 0 };
        }
        skillCauseCount[b.skillName].total += 1;
        if (b.rootCause === "Short Ball") {
          skillCauseCount[b.skillName].shortBall += 1;
        }
      });
    });

    for (const [skillName, stats] of Object.entries(skillCauseCount)) {
      const ratio = stats.shortBall / stats.total;
      if (stats.total >= 3 && ratio >= 0.5) {
        return {
          skillName,
          percentage: Math.round(ratio * 100),
          allCount: stats.total,
          rectificationQuest: `EMERGENCY DIRECTIVE: Slider Rectification Drill requested immediately because of high short length vulnerabilities.`
        };
      }
    }
    return null;
  };

  const activeWeaknessAlert = getAIWeaknessAlert();

  // Advanced career statistics generator
  const getLifetimeStats = () => {
    if (pastDungeons.length === 0) {
      return {
        totalDungeons: 0,
        totalWickets: 0,
        totalDotBalls: 0,
        totalOvers: 0,
        totalRunsCode: 0,
        bestEconomy: 0,
        bestFigures: "N/A",
        totalSkillXp: 0,
        totalPlayerXp: 0,
      };
    }

    const totalDungeons = pastDungeons.length;
    let totalWickets = 0;
    let totalDotBalls = 0;
    let totalOvers = 0;
    let totalRunsCode = 0;
    let bestEconomy = Infinity;
    let bestWickets = -1;
    let bestRuns = Infinity;
    let totalSkillXp = 0;
    let totalPlayerXp = 0;

    pastDungeons.forEach(d => {
      totalWickets += d.wickets || 0;
      totalDotBalls += d.dotBalls || 0;
      totalOvers += d.overs || 0;
      totalRunsCode += d.runs || 0;
      totalSkillXp += d.skillXpEarned || 0;
      totalPlayerXp += d.xpEarned || 0;

      if (d.overs > 0) {
        const econ = d.runs / d.overs;
        if (econ < bestEconomy) {
          bestEconomy = econ;
        }
      }

      // Best figures: highest wickets, then lowest runs
      if (d.wickets > bestWickets) {
        bestWickets = d.wickets;
        bestRuns = d.runs;
      } else if (d.wickets === bestWickets) {
        if (d.runs < bestRuns) {
          bestRuns = d.runs;
        }
      }
    });

    return {
      totalDungeons,
      totalWickets,
      totalDotBalls,
      totalOvers,
      totalRunsCode,
      bestEconomy: bestEconomy === Infinity ? 0 : Number(bestEconomy.toFixed(2)),
      bestFigures: bestWickets !== -1 ? `${bestWickets}/${bestRuns}` : "0/0",
      totalSkillXp,
      totalPlayerXp
    };
  };

  const careerStats = getLifetimeStats();

  const getRankColor = (rnk: string) => {
    switch (rnk) {
      case "S":
        return "text-[#FFD700] border-[#FFD700]/30 bg-amber-500/5 shadow-[0_0_8px_rgba(255,215,0,0.25)] font-black";
      case "A":
        return "text-[#FF2B2B] border-[#FF2B2B]/30 bg-red-500/5 shadow-[0_0_8px_rgba(255,43,43,0.3)] font-bold";
      case "B":
        return "text-[#7B2FFF] border-[#7B2FFF]/30 bg-purple-500/5 shadow-[0_0_8px_rgba(123,47,255,0.25)] font-bold";
      case "C":
        return "text-[#00D9FF] border-[#00D9FF]/30 bg-cyan-500/5 font-bold";
      default:
        return "text-gray-400 border-gray-805 bg-gray-500/5";
    }
  };

  // Searching & Sorting filters
  const filteredDungeons = pastDungeons.filter(record => {
    const query = searchQuery.toLowerCase();
    const nameMatch = record.matchName.toLowerCase().includes(query);
    const typeMatch = (record.matchType || "").toLowerCase().includes(query);
    const notesMatch = (record.matchNotes || "").toLowerCase().includes(query);
    const rnkMatch = `${record.rank}-rank`.toLowerCase().includes(query);
    const varMatch = (record.variationsUsed || []).some(v => v.toLowerCase().includes(query));
    return nameMatch || typeMatch || varMatch || notesMatch || rnkMatch;
  });

  const sortedDungeons = [...filteredDungeons].sort((a, b) => {
    switch (sortCriteria) {
      case "date_asc":
        return new Date(a.matchDate || a.timestamp).getTime() - new Date(b.matchDate || b.timestamp).getTime();
      case "wickets_desc":
        return (b.wickets || 0) - (a.wickets || 0);
      case "economy_asc":
        return (a.economy || 0) - (b.economy || 0);
      case "threat_desc":
        return (b.threatEliminationScore || 0) - (a.threatEliminationScore || 0);
      case "date_desc":
      default:
        return new Date(b.matchDate || b.timestamp).getTime() - new Date(a.matchDate || a.timestamp).getTime();
    }
  });

  return (
    <div className="space-y-6">
      
      {/* MONARCH ARCHIVE SYSTEM HEADER */}
      <div className="relative p-6 bg-[#0c0c0c]/90 rounded-2xl border border-red-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Laser red background effect */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-[#FF2B2B] shadow-[0_0_12px_#FF2B2B]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-mono tracking-[0.3em] text-[#FF2B2B] font-bold uppercase">
                CRITIC MATRIX COMMAND
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white tracking-widest uppercase">
              SHADOW BATTLE DUNGEONS
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              AWAKEN PHYSICAL SPELLS & RAID DEBRIEFS MATRIX
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border border-gray-900 rounded-lg p-1 bg-black/60 shrink-0">
            <button
              onClick={() => { playSystemClick(); setActiveTab("PLAY"); }}
              className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeTab === "PLAY" 
                  ? "bg-[#FF2B2B]/20 text-white border border-[#FF2B2B]/30" 
                  : "text-gray-405 hover:text-white"
              }`}
            >
              NEW DUNGEON
            </button>
            <button
              onClick={() => { playSystemClick(); setActiveTab("ARCHIVES"); }}
              className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ARCHIVES" 
                  ? "bg-[#FF2B2B]/20 text-white border border-[#FF2B2B]/30" 
                  : "text-gray-405 hover:text-white"
              }`}
            >
              DUNGEON RECORDS
              {pastDungeons.length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-650 bg-red-600 rounded-full text-[9px] font-black text-white leading-none">
                  {pastDungeons.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: NEW DUNGEON FOR CREATING RAID LOGS */}
        {activeTab === "PLAY" && (
          isSessionActive ? (
            <motion.div
              key="cockpit-session"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <DungeonCockpit
                matchName={matchName}
                rank={rank}
                matchDate={matchDate}
                matchType={matchType}
                overs={overs}
                pressureLevel={pressureLevel}
                isMvp={isMvp}
                matchNotes={matchNotes}
                skills={skills}
                activePracticeQuest={activePracticeQuest}
                onAddDungeonRecord={(record) => {
                  const saveAction = () => {
                    onAddDungeonRecord(record);
                    setIsSessionActive(false);
                    setMatchName("");
                    setIsMvp(false);
                    setMatchNotes("");
                    playSystemDing();
                  };
                  if (onTriggerSectionLoader) {
                    onTriggerSectionLoader(
                      "Analyzing Dungeon Performance...",
                      [
                        "De-escalating Runic Colosseum Spell Barriers...",
                        "Calculating Threat Containment Coefficient...",
                        "Synthesizing Lethal Takedowns Breakdown...",
                        "Generating AI Tactical Debrief...",
                        "Ascending Dungeon Archives..."
                      ],
                      saveAction
                    );
                  } else {
                    saveAction();
                  }
                }}
                onCancel={() => {
                  playSystemClick();
                  setIsSessionActive(false);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="play-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
            {/* Left entry cockpit */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} className="p-6 bg-[#0c0c0c]/90 rounded-2xl border border-red-500/10 shadow-2xl relative space-y-4">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-650 to-amber-700 bg-gradient-to-r from-red-650 via-red-500 to-amber-600" />
                
                <div className="flex items-center justify-between pb-3 border-b border-gray-900">
                  <h3 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Skull className="w-4 h-4 animate-bounce shrink-0" /> CONFIGURE DUNGEON PARAMETERS
                  </h3>
                  <span className="text-[9px] font-mono text-gray-500">SYSTEM INTERFACING V3.0</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1.5">Dungeon Raid Match Name</label>
                    <input
                      type="text"
                      placeholder="e.g. T20 Final vs Shadow Knights"
                      required
                      value={matchName}
                      onChange={(e) => setMatchName(e.target.value)}
                      className="w-full bg-black border border-gray-900 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-[#FF2B2B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1.5">Match Type</label>
                      <select
                        value={matchType}
                        onChange={(e) => setMatchType(e.target.value)}
                        className="w-full bg-black border border-gray-900 rounded-lg px-2.5 py-2 text-xs text-cyan-400 focus:outline-none"
                      >
                        <option value="T20 Match">T20 Match</option>
                        <option value="One Day Match">One Day Match</option>
                        <option value="Test Spell">Test Spell</option>
                        <option value="T10 Match">T10 Match</option>
                        <option value="Net Battle">Net Practice</option>
                        <option value="Clutch Playoff">Playoff Cup</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1.5">Match Date</label>
                      <input
                        type="date"
                        value={matchDate}
                        onChange={(e) => setMatchDate(e.target.value)}
                        className="w-full bg-black border border-gray-900 rounded-lg px-2 py-1.5 text-[10px] text-gray-350 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">Combat Level (Threat Rank)</label>
                    <select
                      value={rank}
                      onChange={(e) => setRank(e.target.value as any)}
                      className="w-full bg-black border border-gray-900 rounded-lg px-2.5 py-2 text-xs text-cyan-400 focus:outline-none focus:border-[#FF2B2B]"
                    >
                      <option value="S">S-RANK (Supreme Core / Elite Team)</option>
                      <option value="A">A-RANK (First Division / Heavy Load)</option>
                      <option value="B">B-RANK (Club Match Spell / Classic)</option>
                      <option value="C">C-RANK (Friendly Spell / Routine)</option>
                      <option value="D">D-RANK (Academy Drill / Net Test)</option>
                      <option value="E">E-RANK (Solo Practice Drill)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase mb-1">Situational Stress Context</label>
                    <select
                      value={pressureLevel}
                      onChange={(e) => setPressureLevel(e.target.value as any)}
                      className="w-full bg-black border border-gray-900 rounded-lg px-2.5 py-2 text-xs text-yellow-500 focus:outline-none focus:border-[#FF2B2B]"
                    >
                      <option value="NO">NO PRESSURE (1.0x Core)</option>
                      <option value="LOW">LOW PRESSURE (1.1x Reward)</option>
                      <option value="MEDIUM">MEDIUM THRESHOLD (1.25x)</option>
                      <option value="HIGH">HIGH CLUTCH SPELL (1.6x)</option>
                      <option value="EXTREME">EXTREME MONARCH IMPACT (2.5x)</option>
                    </select>
                  </div>
                </div>

                {/* Spell Metrics */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-500 uppercase mb-1 text-center">Overs Bowled</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="4"
                      required
                      value={overs}
                      onChange={(e) => setOvers(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-black border border-gray-900 rounded-lg py-2 text-center text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-gray-500 uppercase mb-1 text-center">Runs Conceded</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="20"
                      required
                      value={runs}
                      onChange={(e) => setRuns(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-black border border-gray-900 rounded-lg py-2 text-center text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-gray-500 uppercase mb-1 text-center">Dot Balls</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="12"
                      required
                      value={dotBalls}
                      onChange={(e) => setDotBalls(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-black border border-gray-950 border-gray-905 border-gray-900 rounded-lg py-2 text-center text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-gray-500 uppercase mb-1 text-center">Maiden Overs</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={maidenOvers}
                      onChange={(e) => setMaidenOvers(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-black border border-gray-900 rounded-lg py-2 text-center text-xs text-white"
                    />
                  </div>
                </div>

                {/* Manual Varieties Bowling Checkboxes */}
                <div className="p-3 bg-black/40 border border-gray-900/60 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> CHECK SPIN VARIETIES USED IN THIS SHIELD
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skills.length > 0 ? (
                      skills.map(skill => {
                        const isChecked = !!selectedVariations[skill.name];
                        return (
                          <button
                            type="button"
                            key={skill.id}
                            onClick={() => handleToggleVariation(skill.name)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                              isChecked 
                                ? "bg-purple-950/45 border-purple-500/50 text-purple-200 shadow-[0_0_8px_rgba(147,51,234,0.2)]" 
                                : "bg-black/80 border-gray-900 text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? "bg-purple-400 animate-pulse" : "bg-gray-800"}`} />
                            {skill.name}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-gray-650 font-mono">No spin skills registered yet.</span>
                    )}
                  </div>
                </div>

                {/* WICKETS BREAKDOWN LOG BUILDER */}
                <div className="p-4 bg-black/30 border border-gray-950 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-green-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      ⚔️ DISMISSALS RECORD MATRIX
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 uppercase">{wicketsInMatch.length} TAKEDOWNS ENROLLED</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-5">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">Weapon Applied</span>
                      <select
                        value={selectedWktSkillId}
                        onChange={(e) => setSelectedWktSkillId(e.target.value)}
                        className="bg-[#050505] border border-gray-900 rounded p-1.5 text-[11px] text-gray-300 w-full font-mono focus:outline-none"
                      >
                        {skills.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <span className="text-[8px] font-mono text-gray-500 block mb-1">Dismissal Class</span>
                      <select
                        value={wktDismissType}
                        onChange={(e) => setWktDismissType(e.target.value)}
                        className="bg-[#050505] border border-gray-900 rounded p-1.5 text-[11px] text-gray-300 w-full font-mono focus:outline-none"
                      >
                        <option value="Bowled">Bowled</option>
                        <option value="LBW">LBW</option>
                        <option value="Caught">Caught</option>
                        <option value="Stumped">Stumped</option>
                        <option value="Run Out">Run Out</option>
                        <option value="Hit Wicket">Hit Wicket</option>
                        <option value="Caught & Bowled">Caught & Bowled</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[8px] font-mono text-gray-500 block mb-1">Threat</span>
                      <select
                        value={wktThreat}
                        onChange={(e) => setWktThreat(e.target.value as any)}
                        className="bg-[#050505] border border-gray-900 rounded p-1.5 text-[11px] text-yellow-405 font-mono w-full focus:outline-none text-center"
                      >
                        <option value="S">S</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddWicketItem}
                        className="w-full p-2 bg-green-950/40 hover:bg-green-750/60 hover:bg-green-605 text-green-405 border border-green-500/20 rounded font-mono text-xs font-black transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* List of wickets */}
                  <div className="space-y-1 mt-2 max-h-[140px] overflow-y-auto pr-1">
                    {wicketsInMatch.map((w, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-950/5 border border-green-500/10 rounded-lg text-[10px] font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="text-green-500 font-black">[{index+1}]</span>
                          <strong className="text-gray-100 uppercase">{skills.find(s=>s.id===w.skillId)?.name || "variation"}</strong>
                          <span className="text-gray-500 font-sans">&rarr;</span>
                          <span className="text-emerald-400 font-bold">{w.dismissalType}</span>
                          <span className="text-gray-500">|</span>
                          <span>Batter: <strong className="text-yellow-400 font-bold">{w.batsmanThreat}-Rank</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWicketItem(index)}
                          className="text-red-400 font-bold hover:text-white px-2 cursor-pointer"
                        >
                          REMOVE
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOUNDARIES ENTRY FORM */}
                <div className="p-4 bg-black/30 border border-gray-950 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-red-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      💥 CONCEDED BOUNDARIES DIAGNOSTICS
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 uppercase">{boundariesInMatch.length} HITS LOGGED</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                    <div>
                      <span className="text-[8px] font-mono text-gray-550 block mb-1">Target Skill</span>
                      <select
                        value={selectedBndSkillId}
                        onChange={(e) => setSelectedBndSkillId(e.target.value)}
                        className="bg-[#050505] border border-gray-900 rounded p-1 text-[10px] text-gray-300 w-full font-mono focus:outline-none"
                      >
                        {skills.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[8px] font-mono text-gray-550 block mb-1">Score class</span>
                      <select value={bndType} onChange={(e) => setBndType(e.target.value as any)} className="bg-black border border-gray-900 text-[10px] text-white p-1 rounded font-mono w-full focus:outline-none">
                        <option value="4">4 RUNS</option>
                        <option value="6">6 RUNS</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[8px] font-mono text-gray-550 block mb-1">Failure Trigger</span>
                      <select value={bndCause} onChange={(e) => setBndCause(e.target.value)} className="bg-black border border-gray-900 text-[10px] text-white p-1 rounded font-mono w-full focus:outline-none">
                        <option value="Short Ball">Short Ball (Dragged)</option>
                        <option value="Full Toss">Full Toss (High Release)</option>
                        <option value="Close Ball">Close Angle Error</option>
                        <option value="Just Short">Just Short length</option>
                        <option value="Good Length">Good length hit</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[8px] font-mono text-gray-550 block mb-1">Field location</span>
                      <select value={bndDirection} onChange={(e) => setBndDirection(e.target.value)} className="bg-black border border-gray-900 text-[10px] text-white p-1 rounded font-mono w-full focus:outline-none">
                        <option value="deep mid wicket">Mid Wicket</option>
                        <option value="long off">Long Off</option>
                        <option value="long on">Long On</option>
                        <option value="deep point">Deep Point</option>
                        <option value="deep extra covers">Extra Cover</option>
                        <option value="deep fine leg">Fine Leg</option>
                        <option value="deep square leg">Square Leg</option>
                        <option value="deep third man">Third Man</option>
                      </select>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddBoundaryItem}
                        className="w-full py-1 bg-red-950/40 hover:bg-red-850/60 hover:bg-red-605 text-red-405 border border-red-500/20 rounded font-mono text-xs font-black transition cursor-pointer"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>

                  {/* List of boundaries */}
                  <div className="space-y-1 mt-2 max-h-[145px] overflow-y-auto pr-1">
                    {boundariesInMatch.map((b, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-red-950/5 border border-red-500/10 rounded-lg text-[10px] font-mono">
                        <span>
                          <strong className="text-red-500 font-bold">{b.scoreType === "6" ? "SIX" : "FOUR"} Conceded</strong> on <span className="text-[#FF2B2B] uppercase">{skills.find(s=>s.id===b.skillId)?.name}</span> 
                          <span className="text-gray-500"> | </span> 
                          <span>Trigger: <strong className="text-orange-400">{b.rootCause}</strong> to <strong className="capitalize">{b.direction}</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBoundaryItem(index)}
                          className="text-red-400 font-bold hover:text-white px-2 cursor-pointer"
                        >
                          REMOVE
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MVP & NOTES & ACTION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-500 uppercase mb-1.5">Match Raid Notes / Chronicles</label>
                    <textarea
                      placeholder="Add spell comments or logs e.g. [WIN] Secured 4-meter critical spin break"
                      rows={2}
                      value={matchNotes}
                      onChange={(e) => setMatchNotes(e.target.value)}
                      className="w-full bg-black border border-gray-900 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-[#FF2B2B]"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-3 bg-black/50 border border-gray-905 p-3 rounded-lg mb-1 cursor-pointer" onClick={() => { playSystemClick(); setIsMvp(!isMvp); }}>
                      <input
                        type="checkbox"
                        checked={isMvp}
                        onChange={() => {}}
                        className="w-4 h-4 rounded cursor-pointer accent-yellow-400"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-black text-yellow-450 text-yellow-400 block uppercase tracking-wider leading-none">
                          PROVEN RAID PLAYER (MVP)
                        </span>
                        <span className="text-[9px] font-sans text-gray-500 block leading-tight">
                          Gain extra +150 XP bonus for superior target elimination.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="w-full py-3 bg-gradient-to-r from-red-600 via-red-700 to-amber-700 hover:from-red-500 hover:to-amber-500 disabled:opacity-30 text-white font-mono text-xs font-black tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(255,43,43,0.2)] transition cursor-pointer"
                >
                  {isEvaluating ? "SYSTEM SIMULATING RAID DATA..." : "INITIATE MATCH CONQUEST DEBRIEF"}
                </button>

                <div className="text-center font-mono text-[9px] text-gray-500 my-1">-- OR --</div>

                <button
                  type="button"
                  onClick={handleStartSession}
                  className="w-full py-3 bg-gradient-to-r from-purple-800 to-indigo-850 hover:from-purple-700 hover:to-indigo-750 text-white font-mono text-xs font-black tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.2)] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 animate-pulse text-purple-300" /> LAUNCH INTERACTIVE LIVE BATTLE COCKPIT
                </button>
              </form>
            </div>

            {/* Right Live Summary Status Cockpit */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Active Practice Quest Banner */}
              {activePracticeQuest && (
                <div className="p-5 bg-gradient-to-br from-purple-950/20 to-[#0e0c15] border border-purple-500/35 rounded-2xl space-y-3 shadow-[0_0_15px_rgba(123,47,255,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-4 transform -translate-y-1/2 px-2.5 py-0.5 bg-purple-650 text-[8px] font-mono text-white rounded uppercase font-black tracking-wider animate-pulse">
                    ACTIVE DUNGEON QUEST
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-950/40 border border-purple-500/20 rounded-lg shrink-0 text-purple-400">
                      <Trophy className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-purple-400 font-bold block uppercase tracking-wider">
                        {activePracticeQuest.skillName} CHALLENGE
                      </span>
                      <h4 className="text-xs font-black text-white uppercase tracking-wide mt-0.5">
                        {activePracticeQuest.name}
                      </h4>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans border-t border-purple-500/10 pt-2">
                    {activePracticeQuest.description}
                  </p>

                  <div className="p-3 bg-black/45 border border-purple-500/15 rounded-xl space-y-1.5 font-mono text-[10px]">
                    <span className="text-gray-500 block text-[8px] uppercase tracking-wider font-extrabold pb-1 border-b border-gray-900">
                      QUEST OBJECTIVES CHECKLIST
                    </span>
                    {activePracticeQuest.requirements.oversMin !== undefined && (
                      <div className="flex justify-between text-gray-300">
                        <span>Min Spell Overs:</span>
                        <strong className="text-purple-400">{activePracticeQuest.requirements.oversMin} Overs</strong>
                      </div>
                    )}
                    {activePracticeQuest.requirements.wicketsNeeded !== undefined && (
                      <div className="flex justify-between text-gray-300">
                        <span>Target Wickets:</span>
                        <strong className="text-purple-400">At least {activePracticeQuest.requirements.wicketsNeeded} wickets</strong>
                      </div>
                    )}
                    {activePracticeQuest.requirements.runsMaxLte !== undefined && (
                      <div className="flex justify-between text-gray-300">
                        <span>Max Runs Allowed:</span>
                        <strong className="text-purple-400">At most {activePracticeQuest.requirements.runsMaxLte} runs</strong>
                      </div>
                    )}
                    {activePracticeQuest.requirements.dotBallsNeeded !== undefined && (
                      <div className="flex justify-between text-gray-300">
                        <span>Min Dot Balls:</span>
                        <strong className="text-purple-400">At least {activePracticeQuest.requirements.dotBallsNeeded} dots</strong>
                      </div>
                    )}
                    {activePracticeQuest.requirements.skillsSpecificWickets !== undefined && (
                      <div className="space-y-1 text-gray-300">
                        <span className="text-[8px] text-purple-400 block uppercase">Specific Skill Target:</span>
                        {Object.entries(activePracticeQuest.requirements.skillsSpecificWickets).map(([sk, wkts]) => (
                          <div key={sk} className="flex justify-between pl-2">
                            <span>{sk}:</span>
                            <strong>{wkts} wickets</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-550 bg-purple-950/10 p-2 rounded-lg border border-purple-500/10">
                    <span>BOUNTY REWARD:</span>
                    <span className="text-purple-400 font-bold uppercase">
                      +{activePracticeQuest.xpReward} Player XP / +{activePracticeQuest.masteryReward} Mastery XP
                    </span>
                  </div>
                </div>
              )}

              {/* Active Coach Air Warning */}
              {activeWeaknessAlert && (
                <div className="p-4 bg-red-950/20 border border-[#FF2B2B]/40 rounded-2xl space-y-1.5 shadow-[0_0_15px_rgba(255,43,43,0.15)] relative">
                  <div className="absolute top-0 right-4 transform -translate-y-1/2 px-2.5 py-0.5 bg-red-600 text-[8px] font-mono text-white rounded uppercase font-black tracking-wider animate-pulse">
                    CRITICAL WARNING
                  </div>
                  <div className="flex gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-red-400 font-bold block uppercase tracking-wider">AI SYSTEM DEFECT TRIGGERED</span>
                      <h4 className="text-xs font-bold text-gray-100">
                        Dragged short-ball angle on "{activeWeaknessAlert.skillName}"
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                        {activeWeaknessAlert.percentage}% of recent boundaries conceded on this weapon are dragging short length. Repair the spin release cap as recommended.
                      </p>
                      <div className="pt-1.5 text-[9px] font-mono font-black text-cyan-400 uppercase leading-snug">
                        {activeWeaknessAlert.rectificationQuest}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Career Snapshot */}
              <div className="p-6 bg-gradient-to-r from-[#0a0a0a] to-[#121212] border border-gray-901 border-gray-900 shadow-2xl rounded-2xl relative space-y-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full filter blur-xl" />
                
                <h4 className="text-xs font-mono font-black text-[#FF2B2B] tracking-widest uppercase flex items-center gap-1.5 pb-2 border-b border-gray-900">
                  <Trophy className="w-4 h-4 text-[#FF2B2B] animate-pulse" /> MONARCH RAID STATISTICS
                </h4>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="bg-black/45 p-2 rounded-xl border border-gray-950">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold text-center">TOTAL RAIDS</span>
                    <span className="text-xl font-black text-white block text-center mt-1">{careerStats.totalDungeons}</span>
                  </div>
                  <div className="bg-black/45 p-2 rounded-xl border border-gray-950">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold text-center">WICKETS TAKEN</span>
                    <span className="text-xl font-black text-green-400 block text-center mt-1">{careerStats.totalWickets}</span>
                  </div>
                  <div className="bg-black/45 p-2 rounded-xl border border-gray-950">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold text-center">DOT BALLS</span>
                    <span className="text-xl font-black text-cyan-400 block text-center mt-1">{careerStats.totalDotBalls}</span>
                  </div>
                  <div className="bg-black/45 p-2 rounded-xl border border-gray-950">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold text-center">BEST RATIO [W/R]</span>
                    <span className="text-base font-black text-yellow-405 text-yellow-400 block text-center mt-1.5">{careerStats.bestFigures}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono pt-1 text-center text-xs">
                  <div className="bg-black/30 p-2.5 rounded-lg border border-gray-900/40">
                    <span className="text-[8px] text-gray-500 block uppercase">BEST ECON</span>
                    <span className="font-bold text-gray-300 block mt-0.5">{careerStats.bestEconomy || "N/A"}</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-gray-900/40">
                    <span className="text-[8px] text-gray-500 block uppercase">TOTAL OVERS</span>
                    <span className="font-bold text-gray-300 block mt-0.5">{careerStats.totalOvers}</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-gray-900/40">
                    <span className="text-[8px] text-gray-500 block uppercase">RUNS CEDED</span>
                    <span className="font-bold text-gray-300 block mt-0.5">{careerStats.totalRunsCode}</span>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-gray-900 flex justify-between items-center text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-gray-550 block uppercase">PLAYER EXP SECURED</span>
                    <span className="font-bold text-white text-sm">+{careerStats.totalPlayerXp} XP</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[8px] text-gray-555 text-gray-500 block uppercase">MASTERIES SYNCED</span>
                    <span className="font-bold text-[#00D9FF] text-sm">+{careerStats.totalSkillXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Quick info list */}
              <div className="p-4 bg-[#111111]/40 border border-gray-950 rounded-2xl relative">
                <span className="text-[8.5px] font-mono text-[#FF2B2B] uppercase font-bold tracking-widest block mb-2">SYSTEM CLOUD LOG SYNC</span>
                <p className="text-[10px] text-gray-400 leading-normal font-sans">
                  Each submitted dungeon report is compiled with the Monarch System server core on port 3000, synchronizing local coordinates automatically with your cloud profiles.
                </p>
                <div className="mt-2.5 text-[9px] font-mono text-gray-650 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0" /> Automatically verified on save.
                </div>
              </div>

              </div>
            </motion.div>
          )
        )}

        {/* TAB 2: DUNGEON RECORDS ("DUNGEON ARCHIVES") */}
        {activeTab === "ARCHIVES" && (
          <motion.div
            key="archives-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Career Highlight Statistics Board At the TOP of Archives */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-black/80 border border-gray-900 rounded-2xl font-mono text-center">
                <span className="text-[8.5px] text-gray-500 block uppercase font-bold truncate">TOTAL BATTLES</span>
                <span className="text-xl font-black text-white block mt-1">{careerStats.totalDungeons}</span>
              </div>
              <div className="p-4 bg-black/80 border border-gray-900 rounded-2xl font-mono text-center">
                <span className="text-[8.5px] text-gray-500 block uppercase font-bold truncate">TOTAL TAKEDOWNS</span>
                <span className="text-xl font-black text-green-400 block mt-1">{careerStats.totalWickets}</span>
              </div>
              <div className="p-4 bg-black/80 border border-gray-900 rounded-2xl font-mono text-center">
                <span className="text-[8.5px] text-gray-500 block uppercase font-bold truncate">DOT BALLS</span>
                <span className="text-xl font-black text-cyan-400 block mt-1">{careerStats.totalDotBalls}</span>
              </div>
              <div className="p-4 bg-black/80 border border-gray-900 rounded-2xl font-mono text-center">
                <span className="text-[8.5px] text-gray-500 block uppercase font-bold truncate">BEST ECONOMY</span>
                <span className="text-xl font-black text-purple-400 block mt-1">{careerStats.bestEconomy}</span>
              </div>
              
              <div className="p-4 bg-black/80 border border-gray-900 rounded-2xl font-mono text-center col-span-2 md:col-span-1">
                <span className="text-[8.5px] text-gray-500 block uppercase font-bold truncate">BEST FIGURES [W/R]</span>
                <span className="text-lg font-black text-yellow-405 text-yellow-400 block mt-1.5">{careerStats.bestFigures}</span>
              </div>
              <div className="p-4 bg-black/80 border border-gray-900 rounded-2xl font-mono text-center col-span-2 md:col-span-1">
                <span className="text-[8.5px] text-gray-500 block uppercase font-bold truncate">TOTAL OVERS</span>
                <span className="text-xl font-black text-gray-350 text-white block mt-1">{careerStats.totalOvers}</span>
              </div>
              <div className="p-4 bg-black/80 border border-gray-900 rounded-2xl font-mono text-center col-span-2 shadow-inner">
                <span className="text-[8.5px] text-[#00D9FF] block uppercase font-bold truncate">COMBINED CAREER SYSTEM XP</span>
                <span className="text-base font-black text-[#00D9FF] block mt-1.5">+{careerStats.totalPlayerXp + careerStats.totalSkillXp} XP</span>
              </div>
            </div>

            {/* Records filter & command deck */}
            <div className="p-4 bg-black/70 border border-gray-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Filter by Match Name, Type (e.g. T20), Rank (e.g. S-Rank) or Skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050505] border border-gray-900 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF2B2B]"
                />
              </div>

              {/* Sorting and selection */}
              <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                <div className="flex items-center gap-1 text-gray-500">
                  <ListFilter className="w-3.5 h-3.5 text-[#FF2B2B]" />
                  <span>SORT INDEX:</span>
                </div>
                <select
                  value={sortCriteria}
                  onChange={(e) => setSortCriteria(e.target.value as any)}
                  className="bg-[#050505] border border-gray-900 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="date_desc">DATE (Newest &rarr; Oldest)</option>
                  <option value="date_asc">DATE (Oldest &rarr; Newest)</option>
                  <option value="wickets_desc">WICKETS (Highest first)</option>
                  <option value="economy_asc">ECONOMY (Lowest first)</option>
                  <option value="threat_desc">THREAT SCORES (Highest first)</option>
                </select>
              </div>
            </div>

            {/* List Of Archived Records */}
            {sortedDungeons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDungeons.map((record, index) => {
                  // Calculate chronological index sequential raid log number
                  const actualRaidIndex = pastDungeons.length - pastDungeons.findIndex(d => d.id === record.id);
                  const formattedRaidNo = String(actualRaidIndex).padStart(3, "0");

                  return (
                    <div
                      key={record.id}
                      className="p-5 bg-gradient-to-br from-[#0a0a0a]/95 to-[#111]/95 border border-gray-900 rounded-2xl flex flex-col justify-between hover:border-red-500/35 transition-all duration-300 relative group overflow-hidden"
                    >
                      {/* Visual top indicator depending on rank */}
                      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-red-650/40 bg-gradient-to-r from-[#FF2B2B]/20 via-[#FF2B2B]/60 to-transparent" />
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[8.5px] font-mono text-[#FF2B2B] uppercase tracking-widest block font-black">
                              DUNGEON ARCHIVE #{formattedRaidNo}
                            </span>
                            <h4 className="text-sm font-bold text-gray-100 uppercase line-clamp-1 group-hover:text-white transition">
                              {record.matchName}
                            </h4>
                            <span className="text-[9px] font-mono text-gray-500 block uppercase">
                              {record.matchType || "Combat Spell"} &bull; {record.matchDate || record.timestamp.split(" ")[0]}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[9px] px-2 py-1 rounded-lg border leading-none uppercase ${getRankColor(record.rank)}`}>
                              {record.rank}-RANK
                            </span>
                            <span className="text-[8px] font-mono font-bold tracking-tight bg-red-950/20 border border-red-500/25 px-1.5 py-0.5 rounded text-red-400 uppercase leading-none">
                              THREAT: {record.threatEliminationScore || 0}%
                            </span>
                          </div>
                        </div>

                        {/* Highlight Basic Stats in the card */}
                        <div className="grid grid-cols-4 gap-1 font-mono text-center p-3.5 bg-black/45 rounded-xl border border-gray-950">
                          <div>
                            <span className="text-[8px] text-gray-500 block uppercase font-bold">WICKETS</span>
                            <span className="text-sm font-black text-green-400 block mt-0.5">{record.wickets}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block uppercase font-bold">OVERS</span>
                            <span className="text-sm font-black text-gray-300 block mt-0.5">{record.overs}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block uppercase font-bold">ECON</span>
                            <span className="text-sm font-black text-purple-400 block mt-0.5">{record.economy}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-red-500 block uppercase font-bold">THREAT</span>
                            <span className="text-sm font-black text-red-400 block mt-0.5">{record.threatEliminationScore || 0}%</span>
                          </div>
                        </div>

                        {/* List variations used */}
                        {record.variationsUsed && record.variationsUsed.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8.5px] font-mono text-gray-500 uppercase block">SPINS CONVERTED</span>
                            <div className="flex flex-wrap gap-1">
                              {record.variationsUsed.map((v, i) => (
                                <span key={i} className="text-[9px] font-mono bg-purple-950/20 border border-purple-500/10 px-1.5 py-0.2 rounded text-purple-400 font-bold uppercase">
                                  {v}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Action Controls */}
                      <div className="mt-5 pt-3.5 border-t border-gray-900/65 flex items-center justify-between">
                        
                        <button
                          onClick={() => { playSystemClick(); setSelectedArchive(record); }}
                          className="text-[11px] font-mono font-black text-purple-400 hover:text-white flex items-center gap-1 transition-all uppercase cursor-pointer"
                        >
                          OPEN BATTLE REPORT <ChevronRight className="w-4 h-4 shrink-0 transition group-hover:translate-x-0.5" />
                        </button>

                        <button
                          onClick={() => { playSystemClick(); setArchiveToDelete(record); }}
                          className="p-1.5 h-7 w-7 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 flex items-center justify-center opacity-70 hover:opacity-100 transition cursor-pointer"
                          title="Dismantle Archive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 border-2 border-dashed border-gray-901 border-gray-900 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                <BookOpen className="w-12 h-12 text-gray-700 animate-pulse" />
                <div className="space-y-1">
                  <span className="text-sm font-mono text-gray-400 block uppercase font-bold">DUNGEON ARCHIVE CORES NOT LOCATED</span>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    No logs met your coordinates filter criteria. Enter your latest real spell match on the 'NEW DUNGEON' tab to synthesize raid entries.
                  </p>
                </div>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="px-3.5 py-1.5 bg-gray-950 hover:bg-gray-855 border border-gray-900 font-mono text-[10px] uppercase text-gray-300 rounded cursor-pointer transition">
                    CLEAR SEARCH FILTER
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY 1: CINEMATIC DETAILED MATCH REPORT PAGE */}
      <AnimatePresence>
        {selectedArchive && (() => {
          // Compute chronological sequential number
          const matchIndex = pastDungeons.findIndex(d => d.id === selectedArchive.id);
          const actualRaidIndex = pastDungeons.length - matchIndex;
          const formattedRaidNo = String(actualRaidIndex).padStart(3, "0");

          // Redesigned stats in separate highlighted statistics boxes at the TOP
          const priorityStats = [
            { label: "Threat Rating", value: `${selectedArchive.threatEliminationScore || 0}%`, icon: ShieldAlert, color: "text-red-500 border-red-500/25 bg-red-500/10", glow: "shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse" },
            { label: "Wickets Taken", value: selectedArchive.wickets, icon: Skull, color: "text-green-400 border-green-500/20 bg-green-500/10", glow: "shadow-[0_0_12px_rgba(34,197,94,0.1)]" },
            { label: "Dot Balls Bowled", value: selectedArchive.dotBalls, icon: Award, color: "text-amber-400 border-amber-500/20 bg-amber-500/10", glow: "shadow-[0_0_12px_rgba(245,158,11,0.1)]" },
            { label: "Overs Completed", value: selectedArchive.overs, icon: ShieldCheck, color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10", glow: "shadow-[0_0_12px_rgba(6,182,212,0.1)]" },
            { label: "Economy Rate", value: selectedArchive.economy.toFixed(2), icon: Trophy, color: "text-purple-400 border-purple-500/20 bg-purple-500/10", glow: "shadow-[0_0_12px_rgba(168,85,247,0.1)]" },
            { label: "Total Deliveries", value: selectedArchive.overs * 6, icon: Star, color: "text-blue-400 border-blue-500/20 bg-blue-500/10", glow: "shadow-[0_0_12px_rgba(59,130,246,0.1)]" },
            { label: "Maiden Overs", value: selectedArchive.maidenOvers || 0, icon: ShieldCheck, color: "text-[#00D9FF] border-cyan-500/20 bg-cyan-500/10", glow: "shadow-[0_0_12px_rgba(0,217,255,0.1)]" },
            { label: "Player XP Earned", value: `+${selectedArchive.xpEarned || 0} XP`, icon: Zap, color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10", glow: "shadow-[0_0_12px_rgba(234,179,8,0.1)]" },
            { label: "Skill Mastery XP", value: `+${selectedArchive.skillXpEarned || 0} XP`, icon: Sparkles, color: "text-[#00D9FF] border-cyan-500/20 bg-cyan-500/10", glow: "shadow-[0_0_12px_rgba(0,217,255,0.1)]" },
          ];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-4xl bg-[#090909] border border-red-500/25 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col my-auto max-h-[92vh]"
              >
                {/* Immersive glow header banner */}
                <div className="absolute top-0 inset-x-0 h-1 bg-[#FF2B2B]" />
                
                {/* Header elements */}
                <div className="p-6 border-b border-gray-901 border-gray-900 bg-gradient-to-r from-black/85 to-[#0b0b0b]/90 flex items-center justify-between shrink-0">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-[#FF2B2B] uppercase tracking-widest font-black flex items-center gap-1.5 leading-none">
                      <Skull className="w-3.5 h-3.5 shrink-0" /> CONCLUDE RAID DIARY RECORD
                    </span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                      {selectedArchive.matchName}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center text-[10px] font-mono text-gray-500">
                      <span className="uppercase text-cyan-400 font-bold">{selectedArchive.matchType || "DUEL MATCH"}</span>
                      <span>&bull;</span>
                      <span>DATE: {selectedArchive.matchDate || selectedArchive.timestamp.split(" ")[0]}</span>
                      <span>&bull;</span>
                      <span className="text-gray-450 uppercase">{selectedArchive.timestamp.split(" ")[1] || "Spell Time Locked"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { playSystemClick(); setSelectedArchive(null); }}
                    className="p-1 px-2.5 bg-gray-950 border border-gray-900 rounded-lg text-[10px] font-mono text-gray-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> CLOSE REPORT
                  </button>
                </div>

                {/* Sub-scrolling body representing the match report */}
                <div className="p-6 overflow-y-auto space-y-6">
                  
                  {/* PRIORITY STATS - HIGHLIGHTED STAT BOXES AT THE ABSOLUTE TOP */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-[#FF2B2B] uppercase font-bold tracking-widest block pb-1 border-b border-gray-900/60">
                      🛡️ PRIMARY COMBAT METRICS DEBRIEFING
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {priorityStats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={idx}
                            className={`p-3 bg-black/60 border border-gray-900 rounded-xl flex flex-col justify-between space-y-2 relative overflow-hidden ${stat.glow}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-gray-500 uppercase font-bold leading-none">{stat.label}</span>
                              <Icon className={`w-3.5 h-3.5 ${stat.color} shrink-0`} />
                            </div>
                            <div className="space-y-0.5">
                              <span className={`text-xl font-black font-mono leading-none tracking-tight block ${stat.color}`}>
                                {stat.value}
                              </span>
                            </div>
                            
                            {/* Accent bottom divider */}
                            <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF2B2B]/20 to-transparent" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Variations Used explicitly in the match */}
                  {selectedArchive.variationsUsed && selectedArchive.variationsUsed.length > 0 && (
                    <div className="p-4 bg-black/55 border border-purple-500/10 rounded-xl space-y-2">
                      <span className="text-[9.5px] font-mono text-[#7B2FFF] uppercase font-black block">
                        🔮 COMBAT SPIN VARIATIONS FIRED IN THIS DUEL
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedArchive.variationsUsed.map((variable, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-[#7B2FFF]/5 border border-purple-500/25 rounded-md text-xs font-mono text-purple-300 font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            {variable}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI DEBRIEF ASSESSMENT STATEMENT */}
                  <div className="p-4 bg-black/60 border border-gray-900 rounded-xl relative">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1 font-black">
                      MONARCH DECISION LOGMATRIX DEBRIEF
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed italic pr-12 font-sans">
                      "{selectedArchive.aiDebrief || "Neutered system threat. Target tracking coordinates successfully locked inside current limits."}"
                    </p>
                    {selectedArchive.isMvp && (
                      <span className="absolute bottom-2.5 right-3.5 inline-block text-[8px] font-mono font-black bg-yellow-950/30 border border-yellow-500/20 px-2 py-0.5 text-yellow-405 text-yellow-400 rounded-lg uppercase tracking-wide">
                        MVP PERFORMANCE CLEARANCE
                      </span>
                    )}
                  </div>

                  {/* NOTEBOOK REMARKS */}
                  {selectedArchive.matchNotes && (
                    <div className="p-4 bg-zinc-950/50 border border-gray-901 border-gray-900/60 rounded-xl">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">RECORD NOTES & CHRONICLES</span>
                      <p className="text-xs text-gray-400 leading-relaxed font-mono">
                        {selectedArchive.matchNotes}
                      </p>
                    </div>
                  )}

                  {/* DISMISSALS (TAKEDOWNS) DETAILS */}
                  {selectedArchive.wicketsBreakdown && selectedArchive.wicketsBreakdown.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono text-green-400 uppercase font-black tracking-widest block pb-1 border-b border-gray-900/60">
                        ⚔️ DETAILED SYSTEM ELIMINATIONS (WICKETS LOG)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedArchive.wicketsBreakdown.map((wkt, idx) => (
                          <div key={idx} className="bg-black/80 border border-green-500/10 p-3.5 rounded-xl font-mono text-xs flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500/40" />
                            <div className="space-y-1 pl-1.5 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-gray-500">TAKEDOWN #{idx+1}</span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                                <span className="text-yellow-400 font-black">{wkt.batsmanThreat || wkt.batsmanSpecialty || "B"}-RANK TARGET</span>
                              </div>
                              <h5 className="text-xs font-sans font-black text-white uppercase tracking-wider">
                                {wkt.skillName || wkt.bowlerSkillApplied || "SPLIT VARIETY"}
                              </h5>
                              <p className="text-[9.5px] text-gray-405 text-gray-400 font-sans">
                                Dispatched striker coordinate via <strong className="text-green-400">{wkt.dismissalType || wkt.dismissal || "Bowled"}</strong>.
                              </p>
                            </div>
                            
                            <div className="h-9 w-9 bg-green-950/20 rounded-full flex items-center justify-center text-green-400 uppercase font-black italic border border-green-500/10 shrink-0">
                              W
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOUNDARIES DETAILS (CONCEDED) APPEAR LOWER HERE */}
                  {selectedArchive.boundariesBreakdown && selectedArchive.boundariesBreakdown.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono text-red-400 uppercase font-black tracking-widest block pb-1 border-b border-gray-900/60">
                        💥 CONCEDED BOUNDARIES DIAGNOSTICS (LOWER MATRIX)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedArchive.boundariesBreakdown.map((bnd, idx) => (
                          <div key={idx} className="bg-black/75 border border-red-500/10 p-3.5 rounded-xl font-mono text-xs flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40" />
                            <div className="space-y-1 pl-1.5 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-red-505 font-bold text-red-500">🚨 {bnd.scoreType === "6" ? "SIX Runs" : "FOUR Runs"} Hit</span>
                                <span className="text-[9px] text-gray-500 bg-gray-950 px-1 rounded uppercase capitalize">{bnd.strokeType || "Punched Sweep"}</span>
                              </div>
                              <h5 className="text-xs font-black text-gray-200 uppercase mt-0.5 truncate max-w-[190px]">
                                {bnd.skillName || "Active Delivery Line"}
                              </h5>
                              <p className="text-[10px] text-gray-480 text-gray-400 font-sans">
                                Dispersed boundary to <strong className="text-orange-400 capitalize">{bnd.direction || "on-side"}</strong> due to <strong className="text-red-400 italic">{bnd.rootCause || "Length Short"}</strong> length.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer panel */}
                <div className="p-4 border-t border-gray-901 border-gray-900 bg-black/90 text-center shrink-0">
                  <span className="text-[9px] font-mono text-gray-600">
                    BATTLE LOG CERTIFIED SECURE UNDER SCIENTIFIC SPIN LAUNCH TRACE DIRECTIVES
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* OVERLAY 2: DISMANTLE CONFIRMATION MODAL */}
      <AnimatePresence>
        {archiveToDelete && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#080808] border border-red-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.25)] relative text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-950/30 border border-red-500/30 text-red-505 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold font-mono text-red-500 uppercase tracking-widest">
                  DISMANTLE ARCHIVE KEY?
                </h4>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  You are about to delete <strong>"{archiveToDelete.matchName}"</strong> from your permanent records. This chronicle cannot be reconstructed once erased.
                </p>
              </div>

              <div className="p-2.5 bg-black/60 rounded-xl border border-gray-950 text-[10px] font-mono text-gray-550 text-gray-400">
                DATE: {archiveToDelete.matchDate || archiveToDelete.timestamp.split(" ")[0]} &bull; TAKEDOWNS: {archiveToDelete.wickets}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 font-mono text-xs text-center shrink-0">
                <button
                  type="button"
                  onClick={() => { playSystemClick(); setArchiveToDelete(null); }}
                  className="py-2.5 bg-gray-901 bg-zinc-900 hover:bg-gray-851 text-gray-300 font-bold rounded-lg cursor-pointer transition uppercase"
                >
                  ABORT ACTION
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSystemError();
                    onDeleteDungeonRecord(archiveToDelete.id);
                    setArchiveToDelete(null);
                  }}
                  className="py-2.5 bg-gradient-to-r from-red-700 to-red-651 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg cursor-pointer transition uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  ERASE LOG INDEX
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
