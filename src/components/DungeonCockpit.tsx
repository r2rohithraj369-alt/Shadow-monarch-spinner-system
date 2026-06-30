import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Skull, Info, X } from "lucide-react";
import { SkillItem, DungeonRecord, PracticeQuest } from "../types";
import { playSystemClick, playSystemDing, playSystemError } from "../utils/audio";
import WagonWheelMap, { WagonWheelDeliver } from "./WagonWheelMap";

interface DungeonCockpitProps {
  matchName: string;
  rank: "S" | "A" | "B" | "C" | "D" | "E";
  matchDate: string;
  matchType: string;
  overs: number;
  pressureLevel: "NO" | "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  isMvp: boolean;
  matchNotes: string;
  skills: SkillItem[];
  activePracticeQuest?: PracticeQuest;
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
  onCancel: () => void;
}

export default function DungeonCockpit({
  matchName,
  rank,
  matchDate,
  matchType,
  overs,
  pressureLevel,
  isMvp,
  matchNotes,
  skills,
  activePracticeQuest,
  onAddDungeonRecord,
  onCancel
}: DungeonCockpitProps) {
  const [sessionDeliveries, setSessionDeliveries] = useState<WagonWheelDeliver[]>(() => {
    const totalBalls = overs * 6;
    return Array.from({ length: totalBalls }).map((_, i) => ({
      over: Math.floor(i / 6) + 1,
      ballNum: (i % 6) + 1,
      skillName: skills[0]?.name || "Leg Break",
      length: "Good Length",
      runs: 0,
      isWicket: false,
      wicketType: "",
      angle: undefined,
      distance: undefined,
      zone: undefined
    }));
  });

  const [currentSelectedBallIndex, setCurrentSelectedBallIndex] = useState<number>(0);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wktDismissType, setWktDismissType] = useState("Bowled");

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

  const stats = getSessionStats();

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
      current.wicketType = wktDismissType;
      
      const wwRequired = ["CAUGHT", "RUN OUT", "CAUGHT & BOWLED"].includes(wktDismissType.toUpperCase());
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
    const isWwWicket = currentBall.isWicket && ["CAUGHT", "RUN OUT", "CAUGHT & BOWLED"].includes(currentBall.wicketType?.toUpperCase() || "");
    
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
    const unplacedDeliveries = sessionDeliveries.filter((d) => {
      const isBoundary = d.runs === 4 || d.runs === 6;
      const isWwWicket = d.isWicket && ["CAUGHT", "RUN OUT", "CAUGHT & BOWLED"].includes(d.wicketType?.toUpperCase() || "");
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
    
    playSystemDing();
  };

  const currentBall = sessionDeliveries[currentSelectedBallIndex];
  const isWwRequiredForCurrent = currentBall && (currentBall.runs === 4 || currentBall.runs === 6 || (currentBall.isWicket && ["CAUGHT", "RUN OUT", "CAUGHT & BOWLED"].includes(currentBall.wicketType?.toUpperCase() || "")));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dungeon-cockpit-stage">
      
      {/* Left Active Controls Panel */}
      <div className="lg:col-span-6 space-y-5">
        <div className="p-5 bg-[#090909] border-2 border-red-500/20 rounded-2xl relative space-y-4 shadow-[0_0_25px_rgba(239,68,68,0.08)]">
          
          {/* Header bar */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-900">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-xs font-mono font-black text-red-500 uppercase tracking-widest">
                BATTLE DUNGEON ACTIVE SPELL COCKPIT
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-cyan-950/40 border border-cyan-800/30 rounded text-[9px] font-mono text-cyan-400 font-bold uppercase">
              {rank}-RANK SPELLS
            </span>
          </div>

          <div className="space-y-1 bg-black/60 p-3 rounded-xl border border-gray-900">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">ENGAGEMENT SPELL</span>
            <h4 className="text-xs font-black text-gray-200 uppercase tracking-wide truncate">{matchName}</h4>
            <div className="flex gap-4 text-[9px] font-mono text-gray-400 pt-0.5">
              <span>OVERS: {overs}</span>
              <span>PRESSURE: <strong className="text-yellow-400">{pressureLevel}</strong></span>
              <span>TYPE: {matchType}</span>
            </div>
          </div>

          {activePracticeQuest && (
            <div className="bg-purple-950/15 border border-purple-500/35 p-3.5 rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
                <span className="text-[9px] font-mono text-purple-400 font-extrabold uppercase tracking-widest">
                  ACTIVE DUNGEON QUEST GOALS
                </span>
              </div>
              <h4 className="text-[11px] font-bold text-white uppercase leading-tight">
                {activePracticeQuest.name}
              </h4>
              <p className="text-[9px] text-gray-400 leading-snug font-sans">
                {activePracticeQuest.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-gray-300 bg-black/45 p-2 rounded-lg border border-purple-500/10 mt-1">
                {activePracticeQuest.requirements.oversMin !== undefined && (
                  <div>Min Overs: <strong className="text-purple-400">{activePracticeQuest.requirements.oversMin}</strong></div>
                )}
                {activePracticeQuest.requirements.wicketsNeeded !== undefined && (
                  <div>Wickets Needed: <strong className="text-purple-400">{activePracticeQuest.requirements.wicketsNeeded}</strong></div>
                )}
                {activePracticeQuest.requirements.runsMaxLte !== undefined && (
                  <div>Max Runs Allowed: <strong className="text-purple-400">{activePracticeQuest.requirements.runsMaxLte}</strong></div>
                )}
                {activePracticeQuest.requirements.dotBallsNeeded !== undefined && (
                  <div>Dot Balls Needed: <strong className="text-purple-400">{activePracticeQuest.requirements.dotBallsNeeded}</strong></div>
                )}
              </div>
            </div>
          )}

          {/* TIMELINE OVER SPELL GRID */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-widest block">
              🛡️ CLICK TIMELINE BALLS TO LOG BOUNDARIES & WICKETS
            </span>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {Array.from({ length: overs }).map((_, overIdx) => {
                const startBallIdx = overIdx * 6;
                return (
                  <div key={overIdx} className="bg-black/45 border border-gray-900 p-2.5 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-[10px] font-mono text-gray-400 font-black shrink-0 w-16">
                      OVER {overIdx + 1} :
                    </span>
                    
                    <div className="grid grid-cols-6 gap-2 flex-1">
                      {Array.from({ length: 6 }).map((_, ballIdx) => {
                        const globalIdx = startBallIdx + ballIdx;
                        const ballObj = sessionDeliveries[globalIdx];
                        if (!ballObj) return null;
                        const isSelected = currentSelectedBallIndex === globalIdx;
                        
                        let bgClass = "bg-[#111] hover:bg-zinc-800 border-gray-800 text-gray-400";
                        let label = `${overIdx + 1}.${ballIdx + 1}`;
                        
                        if (ballObj.runs === 4) {
                          bgClass = "bg-blue-950/80 hover:bg-blue-900/60 border-blue-500 text-blue-300 font-extrabold shadow-[0_0_8px_rgba(59,130,246,0.2)]";
                          label = "4";
                        } else if (ballObj.runs === 6) {
                          bgClass = "bg-red-950/80 hover:bg-red-900/60 border-red-500 text-red-300 font-extrabold shadow-[0_0_8px_rgba(239,68,68,0.25)]";
                          label = "6";
                        } else if (ballObj.isWicket) {
                          bgClass = "bg-green-950/90 hover:bg-green-900/60 border-green-500 text-green-300 font-black shadow-[0_0_8px_rgba(34,197,94,0.3)]";
                          label = "W";
                        }
                        
                        if (isSelected) {
                          bgClass += " ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-105";
                        }

                        return (
                          <button
                            key={ballIdx}
                            type="button"
                            onClick={() => { playSystemClick(); setCurrentSelectedBallIndex(globalIdx); }}
                            className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono border transition-all cursor-pointer ${bgClass}`}
                          >
                            <span>{label}</span>
                            {ballObj.runs === 0 && !ballObj.isWicket && (
                              <span className="text-[6.5px] text-gray-600 block -mt-0.5 uppercase truncate max-w-[40px] leading-none">
                                {ballObj.skillName ? ballObj.skillName.split(" ")[0] : "dot"}
                              </span>
                            )}
                            {(ballObj.runs > 0 || ballObj.isWicket) && (
                              <span className={`text-[6.5px] block -mt-0.5 leading-none ${ballObj.angle !== undefined ? "text-emerald-400" : "text-amber-500 animate-pulse"}`}>
                                {ballObj.angle !== undefined ? "PLACED" : "NEED WW"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE BALL OUTCOME CONTROLLER */}
          {currentBall && (
            <div className="p-4 bg-black/75 rounded-2xl border border-gray-900 space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-gray-900">
                <span className="text-[10px] font-mono text-[#00D9FF] font-black uppercase">
                  🎯 BALL {currentBall.over}.{currentBall.ballNum} OUTCOME LOGGING
                </span>
                <span className="text-[8.5px] font-mono text-purple-400 uppercase bg-purple-950/30 px-2 py-0.5 rounded border border-purple-500/20">
                  {currentBall.skillName}
                </span>
              </div>

              {/* Step 1: Weapon selection */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider block">
                  1. VARIATION / WEAPON APPLIED
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(sk => {
                    const isSelected = currentBall.skillName === sk.name;
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => handleUpdateBallVariation(sk.name)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-950/40 border-purple-500/50 text-purple-200 font-extrabold shadow-[0_0_6px_rgba(168,85,247,0.15)]"
                            : "bg-black hover:bg-zinc-950 border-gray-900 text-gray-500"
                        }`}
                      >
                        {sk.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Scoring changes only */}
              <div className="space-y-2 pt-1">
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider block">
                  2. SCORING EVENT LOGGER (REMOVED 1, 2, 3 CODES)
                </span>
                
                <div className="grid grid-cols-4 gap-2 font-mono">
                  <button
                    type="button"
                    onClick={() => handleUpdateBallOutcome("4")}
                    className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      currentBall.runs === 4
                        ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.35)]"
                        : "bg-black hover:bg-zinc-950 border-gray-900 text-blue-400 hover:text-blue-300"
                    }`}
                  >
                    4 RUNS
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateBallOutcome("6")}
                    className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      currentBall.runs === 6
                        ? "bg-red-600 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.35)]"
                        : "bg-black hover:bg-zinc-950 border-gray-900 text-red-400 hover:text-red-300"
                    }`}
                  >
                    6 RUNS
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateBallOutcome("Wicket")}
                    className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      currentBall.isWicket
                        ? "bg-green-600 border-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.35)]"
                        : "bg-black hover:bg-zinc-950 border-gray-900 text-green-400 hover:text-green-300"
                    }`}
                  >
                    WICKET
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateBallOutcome("CLEAR")}
                    className="py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-white rounded-xl text-[9px] font-bold transition cursor-pointer"
                  >
                    RESET DOT
                  </button>
                </div>
              </div>

              {/* Wagon Wheel feedback helper */}
              {isWwRequiredForCurrent && (
                <div className={`p-2.5 rounded-lg border text-[10px] font-sans transition-all flex items-center gap-2 ${
                  currentBall.angle !== undefined
                    ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                    : "bg-purple-950/20 border-purple-500/30 text-purple-300 animate-pulse"
                }`}>
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  {currentBall.angle !== undefined ? (
                    <span>
                      Wagon Wheel locked: <strong>{currentBall.zone} ({currentBall.angle}°, {currentBall.distance}m)</strong>.
                    </span>
                  ) : (
                    <span>
                      🎯 <strong>PLACEMENT REQUIRED:</strong> Click on the Radar Map to the right to lock landing zone.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SPELL CONQUEST STATS */}
          <div className="bg-gradient-to-r from-neutral-950 to-[#0e0e0e] p-4 rounded-2xl border border-gray-900 space-y-3">
            <span className="text-[8.5px] font-mono text-[#00D9FF] tracking-widest uppercase font-bold block pb-1 border-b border-gray-900">
              🛡️ LIVE COCKPIT SPELL PERFORMANCE METRICS
            </span>
            
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-black/50 p-2 rounded-xl border border-gray-950">
                <span className="text-[7.5px] text-gray-500 block uppercase">4S CONCEDED</span>
                <span className="text-sm font-black text-blue-400 block mt-0.5">{stats.fours}</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-gray-950">
                <span className="text-[7.5px] text-gray-500 block uppercase">6S CONCEDED</span>
                <span className="text-sm font-black text-red-400 block mt-0.5">{stats.sixes}</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-gray-950">
                <span className="text-[7.5px] text-gray-500 block uppercase">WICKETS</span>
                <span className="text-sm font-black text-green-400 block mt-0.5">{stats.wickets}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-black/50 p-2 rounded-xl border border-gray-950">
                <span className="text-[7.5px] text-gray-500 block uppercase">BOUNDARY %</span>
                <span className="text-xs font-bold text-gray-300 block mt-1">{stats.boundaryPct}%</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-gray-950">
                <span className="text-[7.5px] text-gray-500 block uppercase">WICKET %</span>
                <span className="text-xs font-bold text-gray-300 block mt-1">{stats.wicketPct}%</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-yellow-500/10">
                <span className="text-[7.5px] text-yellow-550 text-yellow-500/70 block uppercase font-bold">EST. ECONOMY</span>
                <span className="text-xs font-black text-yellow-400 block mt-1">{stats.econEstimate} rpo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            <button
              type="button"
              onClick={handleConfirmSessionSubmit}
              className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 hover:from-green-500 hover:to-teal-600 text-white font-mono text-xs font-black tracking-widest uppercase rounded-xl shadow-[0_0_18px_rgba(34,197,94,0.3)] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              SUBMIT SPELL DATA & HARVEST REWARDS
            </button>

            <button
              type="button"
              onClick={() => { playSystemClick(); onCancel(); }}
              className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-gray-900 text-gray-500 hover:text-white rounded-lg text-[9px] font-mono uppercase tracking-wider transition cursor-pointer"
            >
              ABORT ACTIVE MISSION & RETURN TO BASE
            </button>
          </div>

        </div>
      </div>

      {/* Right Interactive Ground Map Panel */}
      <div className="lg:col-span-6 space-y-5">
        <div className="p-5 bg-black/90 border border-gray-900 rounded-2xl space-y-4">
          
          <div className="flex items-center justify-between pb-2 border-b border-gray-900">
            <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              🎯 COCKPIT WAGON WHEEL RADAR
            </span>
            <span className="text-[8px] font-mono text-gray-500">
              BOWLER AT BOTTOM ORIENTATION
            </span>
          </div>

          <div className="border border-gray-900 rounded-2xl overflow-hidden bg-black/40 relative">
            <WagonWheelMap
              deliveries={sessionDeliveries}
              interactive={true}
              onSelectCoordinate={handleWagonWheelClick}
              selectedCoordinate={currentSelectedBallIndex !== null && sessionDeliveries[currentSelectedBallIndex] ? {
                angle: sessionDeliveries[currentSelectedBallIndex].angle || 0,
                distance: sessionDeliveries[currentSelectedBallIndex].distance || 0,
                zone: sessionDeliveries[currentSelectedBallIndex].zone || ""
              } : null}
            />
          </div>

          {/* ACTIVE SPELL LOGS */}
          <div className="p-4 bg-black/60 border border-gray-900 rounded-xl space-y-2">
            <span className="text-[8.5px] font-mono text-gray-500 uppercase font-black block pb-1 border-b border-gray-900">
              ⚡ ACTIVE SPELL BOUNDARY & TAKEDOWN LOGS
            </span>
            
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
              {sessionDeliveries.some(d => d.runs > 0 || d.isWicket) ? (
                sessionDeliveries
                  .map((d, idx) => {
                    if (d.runs === 0 && !d.isWicket) return null;
                    return (
                      <div
                        key={idx}
                        onClick={() => { playSystemClick(); setCurrentSelectedBallIndex(idx); }}
                        className={`flex items-center justify-between p-2 rounded-lg text-[10px] font-mono border cursor-pointer transition ${
                          currentSelectedBallIndex === idx
                            ? "bg-purple-950/20 border-purple-500/40 text-white"
                            : "bg-black/40 border-gray-950 text-gray-400 hover:border-gray-900"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-gray-500">O {d.over}.{d.ballNum}</span>
                          <span className="text-purple-400 font-bold uppercase">{d.skillName}</span>
                          <span>&rarr;</span>
                          {d.runs > 0 ? (
                            <span className={d.runs === 6 ? "text-red-400 font-black" : "text-blue-400 font-black"}>
                              {d.runs === 6 ? "SIX" : "FOUR"} Conceded
                            </span>
                          ) : (
                            <span className="text-green-400 font-black">
                              WKT ({d.wicketType})
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] text-gray-500 bg-gray-950 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          {d.zone || "TAP MAP"}
                        </span>
                      </div>
                    );
                  })
                  .filter(Boolean)
              ) : (
                <div className="p-4 text-center text-gray-600 font-mono text-[9px] uppercase leading-relaxed">
                  No boundary or wicket events logged yet.
                  <br />
                  Select a ball on the left panel to change its outcome.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* WICKET MODAL */}
      <AnimatePresence>
        {showWicketModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0c0c0c] border border-green-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(34,197,94,0.15)] relative space-y-4"
            >
              <button
                onClick={() => { playSystemClick(); setShowWicketModal(false); }}
                className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pb-3 border-b border-gray-900">
                <Skull className="w-5 h-5 text-green-400 animate-pulse" />
                <h3 className="text-xs font-mono font-black text-green-400 uppercase tracking-widest">
                  RECORD WICKET TAKEDOWN
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-gray-400 uppercase">
                    Wicket Dismissal Type
                  </label>
                  <select
                    value={wktDismissType}
                    onChange={(e) => setWktDismissType(e.target.value)}
                    className="w-full bg-black border border-gray-900 rounded-lg px-2.5 py-2 text-xs text-green-400 focus:outline-none"
                  >
                    <option value="Bowled">Bowled (No Wagon Wheel required)</option>
                    <option value="LBW">LBW (No Wagon Wheel required)</option>
                    <option value="Stumped">Stumped (No Wagon Wheel required)</option>
                    <option value="Caught">Caught (Requires Wagon Wheel placement)</option>
                    <option value="Run Out">Run Out (Requires Wagon Wheel placement)</option>
                    <option value="Caught & Bowled">Caught & Bowled (Requires Wagon Wheel placement)</option>
                  </select>
                </div>

                <div className="p-3 bg-green-950/10 border border-green-900/40 rounded-xl">
                  <p className="text-[10px] text-gray-400 leading-normal font-sans">
                    {["Caught", "Run Out", "Caught & Bowled"].includes(wktDismissType) ? (
                      <span className="text-amber-500 font-bold">
                        ⚠️ Wagon Wheel Target placement is REQUIRED for this caught/fielding dismissal type.
                      </span>
                    ) : (
                      <span className="text-green-400">
                        ✅ Pure bowler dismissal. No wagon wheel target coordinates required.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmWicketModal}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-black uppercase rounded-lg cursor-pointer"
                >
                  CONFIRM TAKEDOWN
                </button>
                <button
                  type="button"
                  onClick={() => { playSystemClick(); setShowWicketModal(false); }}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white font-mono text-xs uppercase rounded-lg cursor-pointer"
                >
                  CANCEL
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
