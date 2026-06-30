import { PracticeQuest } from "../types";

export interface QuestHistoryTracker {
  completedQuestIds: string[];
  failedQuestIds: string[];
  recentlyGeneratedIds: string[]; // Keep last 50
  activeQuestId: string | null;
}

export interface SkillBehavior {
  id?: string;
  name: string;
  spinDirection?: "Leg Spin" | "Off Spin" | "Straight" | "Mixed";
  primaryBehavior?: "Turn" | "Drift" | "Dip" | "Bounce" | "Skid" | "Seam" | "Swing";
  releaseType?: "Wrist" | "Finger" | "Seam";
  flightStyle?: "Flighted" | "Flat" | "Mixed";
  primaryPurpose?: "Wicket Taking" | "Dot Ball Pressure" | "Defensive Control" | "Attack" | "Deception";
  preferredLength?: "Full" | "Good Length" | "Short" | "Variable";
}

export interface DrillTemplate {
  id: number;
  name: string;
  templateDescription: string;
  baseRequirements: {
    oversMin?: number;
    perfectBallsNeeded?: number;
    closeOrBetterNeeded?: number;
    wicketsNeeded?: number;
    runsMaxLte?: number;
    dotBallsNeeded?: number;
    noWidesOrNoBalls?: boolean;
    consecutivePerfectBalls?: number;
  };
}

export const DRILL_TEMPLATES: DrillTemplate[] = [
  { id: 1, name: "Perfect Length Drill", templateDescription: "Land 12 perfect-length deliveries.", baseRequirements: { perfectBallsNeeded: 12, oversMin: 3 } },
  { id: 2, name: "Stump Hunter", templateDescription: "Hit the stumps 8 times.", baseRequirements: { wicketsNeeded: 8, oversMin: 4 } },
  { id: 3, name: "Yorker Control", templateDescription: "Execute 10 yorkers inside the target zone.", baseRequirements: { perfectBallsNeeded: 10, oversMin: 3 } },
  { id: 4, name: "Flight Master", templateDescription: "Bowl 15 heavily flighted deliveries.", baseRequirements: { closeOrBetterNeeded: 15, oversMin: 4 } },
  { id: 5, name: "Flat Trajectory Drill", templateDescription: "Deliver 15 flat attacking balls.", baseRequirements: { dotBallsNeeded: 15, oversMin: 4 } },
  { id: 6, name: "Drift Creator", templateDescription: "Produce visible drift on 10 deliveries.", baseRequirements: { perfectBallsNeeded: 10, oversMin: 3 } },
  { id: 7, name: "Maximum Turn Challenge", templateDescription: "Generate maximum spin on every ball.", baseRequirements: { perfectBallsNeeded: 8, oversMin: 3 } },
  { id: 8, name: "Bounce Variation", templateDescription: "Produce awkward bounce consistently.", baseRequirements: { closeOrBetterNeeded: 12, oversMin: 3 } },
  { id: 9, name: "Pace Variation", templateDescription: "Alternate slow and fast deliveries.", baseRequirements: { dotBallsNeeded: 12, oversMin: 3 } },
  { id: 10, name: "Release Consistency", templateDescription: "Repeat identical release point 20 times.", baseRequirements: { perfectBallsNeeded: 20, oversMin: 4 } },
  { id: 11, name: "Revolutions Builder", templateDescription: "Maximize revolutions on every delivery.", baseRequirements: { perfectBallsNeeded: 12, oversMin: 3 } },
  { id: 12, name: "Dot Ball Pressure", templateDescription: "Create consecutive dot balls.", baseRequirements: { dotBallsNeeded: 12, oversMin: 3 } },
  { id: 13, name: "Boundary Prevention", templateDescription: "Prevent every boundary.", baseRequirements: { runsMaxLte: 8, oversMin: 3 } },
  { id: 14, name: "Wicket Sequence", templateDescription: "Take wickets using one variation only.", baseRequirements: { wicketsNeeded: 3, oversMin: 3 } },
  { id: 15, name: "Maiden Over Builder", templateDescription: "Complete a maiden over.", baseRequirements: { dotBallsNeeded: 6, oversMin: 1 } },
  { id: 16, name: "Accuracy Grid", templateDescription: "Hit every marked zone.", baseRequirements: { perfectBallsNeeded: 12, oversMin: 3 } },
  { id: 17, name: "Corridor Control", templateDescription: "Bowl repeatedly outside off stump.", baseRequirements: { closeOrBetterNeeded: 10, oversMin: 3 } },
  { id: 18, name: "Leg Stump Assault", templateDescription: "Attack leg stump continuously.", baseRequirements: { closeOrBetterNeeded: 12, oversMin: 3 } },
  { id: 19, name: "Off Stump Attack", templateDescription: "Attack off stump line.", baseRequirements: { closeOrBetterNeeded: 12, oversMin: 3 } },
  { id: 20, name: "Middle Stump Precision", templateDescription: "Target middle stump repeatedly.", baseRequirements: { perfectBallsNeeded: 10, oversMin: 3 } },
  { id: 21, name: "Landing Spot Memory", templateDescription: "Land repeatedly on identical spot.", baseRequirements: { perfectBallsNeeded: 15, oversMin: 4 } },
  { id: 22, name: "Blind Target Drill", templateDescription: "Aim without visible landing marker.", baseRequirements: { perfectBallsNeeded: 8, oversMin: 2 } },
  { id: 23, name: "Pressure Finish", templateDescription: "Execute final over perfectly.", baseRequirements: { runsMaxLte: 6, oversMin: 1 } },
  { id: 24, name: "Last Ball Specialist", templateDescription: "Complete every over with a perfect ball.", baseRequirements: { perfectBallsNeeded: 4, oversMin: 4 } },
  { id: 25, name: "Spin Rhythm", templateDescription: "Maintain identical bowling rhythm.", baseRequirements: { perfectBallsNeeded: 12, oversMin: 3 } },
  { id: 26, name: "Recovery Challenge", templateDescription: "Recover after poor delivery.", baseRequirements: { dotBallsNeeded: 10, oversMin: 3 } },
  { id: 27, name: "Consistency Marathon", templateDescription: "Maintain quality for long spells.", baseRequirements: { perfectBallsNeeded: 18, oversMin: 5 } },
  { id: 28, name: "Death Over Control", templateDescription: "Bowl under death-over pressure.", baseRequirements: { runsMaxLte: 8, oversMin: 2 } },
  { id: 29, name: "Powerplay Restriction", templateDescription: "Restrict scoring in powerplay.", baseRequirements: { runsMaxLte: 12, oversMin: 3 } },
  { id: 30, name: "Strike Rotation Denial", templateDescription: "Prevent easy singles.", baseRequirements: { dotBallsNeeded: 18, oversMin: 4 } },
  { id: 31, name: "Dot Ball Chain", templateDescription: "Build the longest dot-ball streak.", baseRequirements: { dotBallsNeeded: 15, oversMin: 3 } },
  { id: 32, name: "Double Wicket Hunt", templateDescription: "Take two wickets quickly.", baseRequirements: { wicketsNeeded: 2, oversMin: 2 } },
  { id: 33, name: "Triple Threat", templateDescription: "Dismiss three batsmen.", baseRequirements: { wicketsNeeded: 3, oversMin: 3 } },
  { id: 34, name: "Aggressive Flight", templateDescription: "Tempt batsmen into mistakes.", baseRequirements: { wicketsNeeded: 3, oversMin: 4 } },
  { id: 35, name: "Defensive Line", templateDescription: "Force defensive strokes.", baseRequirements: { runsMaxLte: 10, oversMin: 3 } },
  { id: 36, name: "Edge Creator", templateDescription: "Induce outside edges.", baseRequirements: { wicketsNeeded: 2, oversMin: 3 } },
  { id: 37, name: "Bat-Pad Trap", templateDescription: "Create bat-pad opportunities.", baseRequirements: { wicketsNeeded: 2, oversMin: 3 } },
  { id: 38, name: "Stumping Opportunity", templateDescription: "Force batsman out of crease.", baseRequirements: { wicketsNeeded: 2, oversMin: 2 } },
  { id: 39, name: "Catch Practice Creator", templateDescription: "Produce catchable chances.", baseRequirements: { wicketsNeeded: 3, oversMin: 3 } },
  { id: 40, name: "Pressure Sequence", templateDescription: "Increase pressure every over.", baseRequirements: { runsMaxLte: 12, oversMin: 4, dotBallsNeeded: 15 } },
  { id: 41, name: "Variation Rotation", templateDescription: "Use every variation equally.", baseRequirements: { perfectBallsNeeded: 12, oversMin: 4 } },
  { id: 42, name: "Skill Exclusive", templateDescription: "Use only the selected skill.", baseRequirements: { perfectBallsNeeded: 15, oversMin: 3 } },
  { id: 43, name: "Precision Under Fatigue", templateDescription: "Maintain accuracy late in spell.", baseRequirements: { perfectBallsNeeded: 12, oversMin: 4 } },
  { id: 44, name: "Elite Economy", templateDescription: "Maintain target economy.", baseRequirements: { runsMaxLte: 8, oversMin: 3 } },
  { id: 45, name: "Clutch Finish", templateDescription: "Complete final spell without mistake.", baseRequirements: { runsMaxLte: 5, oversMin: 2 } },
  { id: 46, name: "Bounce & Drift Mix", templateDescription: "Combine bounce with drift.", baseRequirements: { perfectBallsNeeded: 10, oversMin: 3 } },
  { id: 47, name: "Tactical Adjustment", templateDescription: "Change plan after every over.", baseRequirements: { perfectBallsNeeded: 12, oversMin: 3 } },
  { id: 48, name: "Perfect Execution", templateDescription: "Meet every session objective.", baseRequirements: { perfectBallsNeeded: 15, oversMin: 4 } },
  { id: 49, name: "Champion Challenge", templateDescription: "Complete all objectives without failure.", baseRequirements: { perfectBallsNeeded: 20, oversMin: 4, runsMaxLte: 10 } },
  { id: 50, name: "Monarch Mastery Trial", templateDescription: "Execute a complete spell with elite consistency.", baseRequirements: { perfectBallsNeeded: 24, oversMin: 5, runsMaxLte: 12 } }
];

export function combineRequirements(selectedTemplates: DrillTemplate[], difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH") {
  const reqs = {
    oversMin: 0,
    perfectBallsNeeded: 0,
    closeOrBetterNeeded: 0,
    wicketsNeeded: 0,
    runsMaxLte: 99,
    dotBallsNeeded: 0,
    noWidesOrNoBalls: false
  };

  let hasPerfect = false;
  let hasClose = false;
  let hasWickets = false;
  let hasRuns = false;
  let hasDots = false;

  selectedTemplates.forEach(t => {
    const base = t.baseRequirements;
    if (base.oversMin) reqs.oversMin = Math.max(reqs.oversMin, base.oversMin);
    if (base.perfectBallsNeeded) {
      reqs.perfectBallsNeeded += base.perfectBallsNeeded;
      hasPerfect = true;
    }
    if (base.closeOrBetterNeeded) {
      reqs.closeOrBetterNeeded += base.closeOrBetterNeeded;
      hasClose = true;
    }
    if (base.wicketsNeeded) {
      reqs.wicketsNeeded += base.wicketsNeeded;
      hasWickets = true;
    }
    if (base.runsMaxLte) {
      reqs.runsMaxLte = Math.min(reqs.runsMaxLte, base.runsMaxLte);
      hasRuns = true;
    }
    if (base.dotBallsNeeded) {
      reqs.dotBallsNeeded += base.dotBallsNeeded;
      hasDots = true;
    }
    if (base.noWidesOrNoBalls) reqs.noWidesOrNoBalls = true;
  });

  if (reqs.oversMin === 0) {
    reqs.oversMin = difficulty === "EASY" ? 2 : difficulty === "MEDIUM" ? 3 : difficulty === "CHALLENGING" ? 4 : 5;
  }

  // Balance values if multiple drills are integrated so that objectives are challenging but feasible
  const count = selectedTemplates.length;
  if (count > 1) {
    if (reqs.perfectBallsNeeded) reqs.perfectBallsNeeded = Math.round(reqs.perfectBallsNeeded * 0.7);
    if (reqs.closeOrBetterNeeded) reqs.closeOrBetterNeeded = Math.round(reqs.closeOrBetterNeeded * 0.7);
    if (reqs.wicketsNeeded) reqs.wicketsNeeded = Math.round(reqs.wicketsNeeded * 0.7);
    if (reqs.dotBallsNeeded) reqs.dotBallsNeeded = Math.round(reqs.dotBallsNeeded * 0.7);
  }

  const finalReqs: any = {};
  if (reqs.oversMin) finalReqs.oversMin = reqs.oversMin;
  if (hasPerfect && reqs.perfectBallsNeeded) finalReqs.perfectBallsNeeded = reqs.perfectBallsNeeded;
  if (hasClose && reqs.closeOrBetterNeeded) finalReqs.closeOrBetterNeeded = reqs.closeOrBetterNeeded;
  if (hasWickets && reqs.wicketsNeeded) finalReqs.wicketsNeeded = reqs.wicketsNeeded;
  if (hasRuns && reqs.runsMaxLte !== 99) finalReqs.runsMaxLte = reqs.runsMaxLte;
  if (hasDots && reqs.dotBallsNeeded) finalReqs.dotBallsNeeded = reqs.dotBallsNeeded;
  if (reqs.noWidesOrNoBalls) finalReqs.noWidesOrNoBalls = true;

  return finalReqs;
}

/**
 * Procedurally combines Selected Skill, Arena, Difficulty, Drill Type, Theme and Rewards
 * to generate a pristine, unseen, highly non-repetitive quest, using Evolution Chamber only.
 */
export function generateHighlyVariedQuest(
  skill: SkillBehavior,
  difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH",
  historyTracker: QuestHistoryTracker,
  playerLevel: number = 1,
  pool?: PracticeQuest[]
): PracticeQuest {
  // 1. Determine a non-repetitive combination of:
  // - Over Length (1, 2, 5, 10, 20, 30 Overs)
  // - Evolution Chamber Mode (Net Drill, Match Simulation, Pressure Mode)
  let recentCombinations: { overs: number; mode: "Net Drill" | "Match Simulation" | "Pressure Mode" }[] = [];
  try {
    const saved = localStorage.getItem("monarch_recently_used_combinations");
    if (saved) {
      recentCombinations = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse recently used combinations:", e);
  }

  const OVERS_OPTIONS = [1, 2, 5, 10, 20, 30];
  const MODES_OPTIONS: ("Net Drill" | "Match Simulation" | "Pressure Mode")[] = [
    "Net Drill",
    "Match Simulation",
    "Pressure Mode"
  ];

  const allCombinations: { overs: number; mode: "Net Drill" | "Match Simulation" | "Pressure Mode" }[] = [];
  OVERS_OPTIONS.forEach(overs => {
    MODES_OPTIONS.forEach(mode => {
      allCombinations.push({ overs, mode });
    });
  });

  // Filter out recently used combinations
  let availableCombos = allCombinations.filter(combo =>
    !recentCombinations.some(rc => rc.overs === combo.overs && rc.mode === combo.mode)
  );

  if (availableCombos.length === 0) {
    recentCombinations = recentCombinations.slice(-1); // Keep last to avoid instant repeat
    availableCombos = allCombinations.filter(combo =>
      !recentCombinations.some(rc => rc.overs === combo.overs && rc.mode === combo.mode)
    );
  }

  // Select random combo
  const chosenCombo = availableCombos[Math.floor(Math.random() * availableCombos.length)] || allCombinations[0];

  // Save back to recently used
  recentCombinations.push(chosenCombo);
  if (recentCombinations.length > 8) {
    recentCombinations = recentCombinations.slice(-8);
  }
  try {
    localStorage.setItem("monarch_recently_used_combinations", JSON.stringify(recentCombinations));
  } catch (e) {
    console.error("Failed to save recently used combinations:", e);
  }

  const sName = skill.name.toUpperCase();

  // 2. Search both sources (Custom Quest DB and Built-in library) inside the provided pool
  if (pool && pool.length > 0) {
    // Filter the pool for matches: skill, difficulty, over length, and mode.
    // Exclude Dungeon Match quests to completely satisfy REMOVE MATCH DUNGEON constraint.
    const matches = pool.filter(q => {
      if (q.type === "DUNGEON_MATCH") return false;
      if (q.id && q.id.toLowerCase().includes("dungeon")) return false;

      // Match skill
      const sLower = skill.name.toLowerCase();
      const qSkillId = q.skillId?.toLowerCase() || "";
      const qSkillName = q.skillName?.toLowerCase() || "";
      const qTargetSkill = (q as any).targetSkill?.toLowerCase() || "";
      const skillMatches = qSkillId === skill.id?.toLowerCase() || qSkillName === sLower || qTargetSkill === sLower || qSkillId === sLower;
      if (!skillMatches) return false;

      // Match difficulty
      if (q.difficulty !== difficulty) return false;

      // Match Over Length
      const qOvers = q.requirements?.oversMin || (q as any).overs || 0;
      if (qOvers !== chosenCombo.overs) return false;

      // Match Mode
      let modeMatches = false;
      if (chosenCombo.mode === "Net Drill") {
        modeMatches = q.type === "CHAMBER_NET";
      } else if (chosenCombo.mode === "Match Simulation") {
        modeMatches = q.type === "CHAMBER_MATCH_SIM" && !q.name.toLowerCase().includes("pressure");
      } else if (chosenCombo.mode === "Pressure Mode") {
        modeMatches = q.type === "CHAMBER_MATCH_SIM" || (q as any).chamberMode === "Pressure Mode" || q.name.toLowerCase().includes("pressure");
      }
      if (!modeMatches) return false;

      // Avoid completed or recently generated quests
      if (historyTracker.completedQuestIds.includes(q.id)) return false;
      if (historyTracker.recentlyGeneratedIds.includes(q.id)) return false;

      return true;
    });

    if (matches.length > 0) {
      const selectedQuest = matches[Math.floor(Math.random() * matches.length)];
      return {
        ...selectedQuest,
        chamberMode: chosenCombo.mode,
        oversLength: chosenCombo.overs,
        requirements: {
          ...selectedQuest.requirements,
          oversMin: chosenCombo.overs // Force it to be the exact over count
        }
      };
    }
  }

  // 3. Fallback: Procedurally generate / synthesize a pristine, customized quest!
  // Load recently used templates from localStorage to guarantee non-repetition across page reloads
  let recentlyUsedIds: number[] = [];
  try {
    const saved = localStorage.getItem("monarch_recently_used_template_ids");
    if (saved) {
      recentlyUsedIds = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse recently used template IDs:", e);
  }

  // Filter out recently used templates to avoid repetition of objectives
  let availableTemplates = DRILL_TEMPLATES.filter(t => !recentlyUsedIds.includes(t.id));

  // If pool runs low, free older templates to keep variety high
  if (availableTemplates.length < 15) {
    recentlyUsedIds = recentlyUsedIds.slice(Math.max(0, recentlyUsedIds.length - 15));
    availableTemplates = DRILL_TEMPLATES.filter(t => !recentlyUsedIds.includes(t.id));
  }

  // Determine drill count depending on difficulty
  let drillCount = 1;
  if (difficulty === "MEDIUM") {
    drillCount = Math.random() < 0.5 ? 1 : 2;
  } else if (difficulty === "CHALLENGING") {
    drillCount = 2;
  } else if (difficulty === "MONARCH") {
    drillCount = Math.random() < 0.4 ? 2 : 3;
  }

  // Shuffle available templates and slice
  const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, Math.min(shuffled.length, drillCount));

  // Update and store recentlyUsed list
  selectedTemplates.forEach(t => {
    recentlyUsedIds.push(t.id);
  });
  if (recentlyUsedIds.length > 35) {
    recentlyUsedIds = recentlyUsedIds.slice(recentlyUsedIds.length - 35);
  }
  try {
    localStorage.setItem("monarch_recently_used_template_ids", JSON.stringify(recentlyUsedIds));
  } catch (e) {
    console.error("Failed to save recently used templates:", e);
  }

  // We only use the Evolution Chamber to fully respect USE EVOLUTION CHAMBER ONLY constraint
  const arena = "Evolution Chamber Grid";

  const THEMES = [
    "Sovereign Ascent",
    "Absolute Dominion",
    "Iron Vanguard Defiance",
    "Glacial Spike Compression",
    "Abyssal Maw Trajectory",
    "Runic Calibrations",
    "Solar Deflection",
    "Cosmic Void Anchor",
    "Titanium Aegis Lock",
    "Astral Gatekeeper Trial"
  ];
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];

  // Scale rewards dynamically with difficulty AND over length multiplier!
  let baseBonusXp = 150;
  let baseBonusMastery = 350;
  if (difficulty === "EASY") {
    baseBonusXp = 100 + Math.floor(Math.random() * 51);
    baseBonusMastery = 250 + Math.floor(Math.random() * 101);
  } else if (difficulty === "MEDIUM") {
    baseBonusXp = 180 + Math.floor(Math.random() * 61);
    baseBonusMastery = 400 + Math.floor(Math.random() * 151);
  } else if (difficulty === "CHALLENGING") {
    baseBonusXp = 300 + Math.floor(Math.random() * 101);
    baseBonusMastery = 650 + Math.floor(Math.random() * 151);
  } else if (difficulty === "MONARCH") {
    baseBonusXp = 500 + Math.floor(Math.random() * 251);
    baseBonusMastery = 900 + Math.floor(Math.random() * 401);
  }

  // Overs reward multipliers
  // 1 over: 0.6x, 2 overs: 0.8x, 5 overs: 1.3x, 10 overs: 2.0x, 20 overs: 3.5x, 30 overs: 5.0x
  let oversMultiplier = 1.0;
  if (chosenCombo.overs === 1) oversMultiplier = 0.6;
  else if (chosenCombo.overs === 2) oversMultiplier = 0.8;
  else if (chosenCombo.overs === 5) oversMultiplier = 1.3;
  else if (chosenCombo.overs === 10) oversMultiplier = 2.0;
  else if (chosenCombo.overs === 20) oversMultiplier = 3.5;
  else if (chosenCombo.overs === 30) oversMultiplier = 5.0;

  const xp = Math.round(baseBonusXp * oversMultiplier);
  const mastery = Math.round(baseBonusMastery * oversMultiplier);

  // Generate and scale requirements proportionally to over length
  const reqs: any = {
    oversMin: chosenCombo.overs
  };

  let sumPerfect = 0;
  let sumClose = 0;
  let sumDots = 0;
  let sumWickets = 0;
  let hasPerfect = false;
  let hasClose = false;
  let hasDots = false;
  let hasWickets = false;
  let hasNoExtras = false;

  selectedTemplates.forEach(t => {
    const base = t.baseRequirements;
    if (base.perfectBallsNeeded) { sumPerfect += base.perfectBallsNeeded; hasPerfect = true; }
    if (base.closeOrBetterNeeded) { sumClose += base.closeOrBetterNeeded; hasClose = true; }
    if (base.dotBallsNeeded) { sumDots += base.dotBallsNeeded; hasDots = true; }
    if (base.wicketsNeeded) { sumWickets += base.wicketsNeeded; hasWickets = true; }
    if (base.noWidesOrNoBalls) { hasNoExtras = true; }
  });

  // Base templates are designed for about 3 overs
  const scale = chosenCombo.overs / 3;

  if (hasPerfect) {
    reqs.perfectBallsNeeded = Math.max(1, Math.min(chosenCombo.overs * 4, Math.round(sumPerfect * scale)));
  }
  if (hasClose) {
    reqs.closeOrBetterNeeded = Math.max(1, Math.min(chosenCombo.overs * 5, Math.round(sumClose * scale)));
  }
  if (hasDots) {
    reqs.dotBallsNeeded = Math.max(1, Math.min(chosenCombo.overs * 5, Math.round(sumDots * scale)));
  }
  if (hasWickets) {
    reqs.wicketsNeeded = Math.max(1, Math.min(chosenCombo.overs * 2, Math.round(sumWickets * scale)));
  }
  if (hasNoExtras) {
    reqs.noWidesOrNoBalls = true;
  }

  // Handle runs conceded limit (runsMaxLte)
  let sumRuns = 0;
  let hasRuns = false;
  selectedTemplates.forEach(t => {
    if (t.baseRequirements.runsMaxLte) {
      sumRuns += t.baseRequirements.runsMaxLte;
      hasRuns = true;
    }
  });

  if (hasRuns) {
    const targetEcon = difficulty === "EASY" ? 8 : difficulty === "MEDIUM" ? 6.5 : difficulty === "CHALLENGING" ? 5.5 : 4.5;
    const econCap = Math.max(4, Math.round(targetEcon * chosenCombo.overs));
    const scaledRuns = Math.max(4, Math.round((sumRuns / selectedTemplates.filter(t => t.baseRequirements.runsMaxLte).length) * scale));
    reqs.runsMaxLte = Math.min(econCap, scaledRuns);
  } else if (difficulty === "MONARCH" || difficulty === "CHALLENGING") {
    const targetEcon = difficulty === "MONARCH" ? 5.0 : 6.0;
    reqs.runsMaxLte = Math.max(5, Math.round(targetEcon * chosenCombo.overs));
  }

  // Generate dynamic, descriptive list of objectives
  const objectivesList: string[] = [];
  if (reqs.perfectBallsNeeded) {
    objectivesList.push(`land at least ${reqs.perfectBallsNeeded} Perfect Deliveries of your active ${sName} variation`);
  }
  if (reqs.closeOrBetterNeeded) {
    objectivesList.push(`deliver ${reqs.closeOrBetterNeeded} Close-or-better classifications`);
  }
  if (reqs.dotBallsNeeded) {
    objectivesList.push(`secure ${reqs.dotBallsNeeded} dot balls to create pressure`);
  }
  if (reqs.wicketsNeeded) {
    objectivesList.push(`claim ${reqs.wicketsNeeded} wickets to breakthrough their lineup`);
  }
  if (reqs.runsMaxLte) {
    objectivesList.push(`restrict scoring to under ${reqs.runsMaxLte} runs conceded`);
  }
  if (reqs.noWidesOrNoBalls) {
    objectivesList.push(`avoid conceding any extra wides/no-balls`);
  }

  const objectivesSentence = objectivesList.join(", ");

  const questName = `${sName}: ${theme} [${selectedTemplates.map(t => t.name).join(" & ")}]`;
  const description = `SYSTEM DIRECTIVE for ${sName} training inside the ${arena}. Weave your trajectory under the ${difficulty} parameters of theme "${theme}". Complete the following session goals: ${objectivesSentence || "conduct a standard spelling calibration."}.`;

  return {
    id: `pq-dyn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    skillId: skill.name.toLowerCase(),
    skillName: sName,
    name: questName,
    description,
    difficulty,
    xpReward: xp,
    masteryReward: mastery,
    type: chosenCombo.mode === "Net Drill" ? "CHAMBER_NET" : "CHAMBER_MATCH_SIM",
    requirements: reqs,
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
    chamberMode: chosenCombo.mode,
    oversLength: chosenCombo.overs
  };
}
