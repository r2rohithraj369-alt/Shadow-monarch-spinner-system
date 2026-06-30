import { PracticeQuest } from "../types";
import { INITIAL_PRACTICE_QUESTS } from "../App";

export interface CustomQuest extends PracticeQuest {
  arena: string;
  category: "Practice" | "Challenge" | "Monarch" | "Training";
  objectivesText: string;
  targetSkill: string;
  // Automatically generated metadata:
  questWeight: number;
  questTier: string;
  questScore: number;
  bonusXp: number;
  lastModified: string;
  // Extra automatic calculations:
  recommendedLevel?: number;
  recommendedRank?: string;
  questValue?: number;
  mode?: string;
  overs?: number | string;
}

export interface PressureScenarioData {
  scenarioId: string;
  scenarioName: string;
  matchContext: string;
  oversRemaining: number;
  runsLimit: number;
  wicketsTarget: number;
  wicketObjective: string;
  economyObjective: string;
  difficultyWord: string;
  difficultyRating: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME";
  xpReward: number;
  masteryXpReward: number;
  riskRating: string;
  desc: string;
  pressureConditions: string;
  specialEvents: string;
  // Extra fields requested for manual database editing:
  story: string;
  pitch: string;
  weather: string;
  battingTeamStyle: string;
  specialMatchEvents: string[];
  fieldRestrictions: string;
  objectives: string;
  economyTarget: number;
  scenarioDifficultyScore: number;
  questWeight: number;
}

// Default scenarios to pre-populate Pressure database if empty
const DEFAULT_PRESSURE_SCENARIOS: PressureScenarioData[] = [
  {
    scenarioId: "sc-p-1-ov-1",
    scenarioName: "The Ultimate Final Over",
    story: "6 balls remaining. The opposition needs 8 runs to win with only 1 wicket in hand. Every single delivery is a championship battle.",
    matchContext: "Championship tie-breaker. The opposition needs 8 runs from the final over. 1 wicket remains.",
    oversRemaining: 1,
    runsLimit: 7,
    wicketsTarget: 1,
    wicketObjective: "Secure the final wicket to dismantle the chase entirely.",
    economyObjective: "Restrict the opposition score to under 8 runs in this single-over spell.",
    difficultyWord: "Clutch Battle",
    difficultyRating: "DIFFICULT",
    xpReward: 300,
    masteryXpReward: 600,
    riskRating: "HIGH",
    desc: "Defend 7 runs in 1 over. Claim the final wicket to win the championship.",
    pressureConditions: "Extreme boundary pressure. Single over squeeze.",
    specialEvents: "Deafening crowd chant. Slick ball grip.",
    pitch: "Dry",
    weather: "Night (Lights)",
    battingTeamStyle: "Aggressive",
    specialMatchEvents: ["Crowd pressure"],
    fieldRestrictions: "Defensive border-guard",
    objectives: "Defend 7 runs, claim 1 wicket, and bowl at least 3 dot balls.",
    economyTarget: 7.0,
    scenarioDifficultyScore: 85,
    questWeight: 2.5
  },
  {
    scenarioId: "sc-p-1-ov-2",
    scenarioName: "Powerplay Blitz Squeeze",
    story: "It is the final over of the powerplay. The batsmen are looking to target your straight boundary lines. Restrict them to under 10 runs.",
    matchContext: "Powerplay final over. The opening batsmen are looking to hit aerially over the infield.",
    oversRemaining: 1,
    runsLimit: 9,
    wicketsTarget: 1,
    wicketObjective: "Claim an opening wicket to halt their powerplay momentum.",
    economyObjective: "Limit scoring to 9 runs or fewer in the over.",
    difficultyWord: "High Alert",
    difficultyRating: "MEDIUM",
    xpReward: 200,
    masteryXpReward: 400,
    riskRating: "MEDIUM",
    desc: "Defend 9 runs in 1 over during the high-tension powerplay sequence.",
    pressureConditions: "Infield-packed powerplay restrictions.",
    specialEvents: "Batsman charging out of crease.",
    pitch: "Flat",
    weather: "Overcast",
    battingTeamStyle: "Power Hitters",
    specialMatchEvents: ["Crease encroachment"],
    fieldRestrictions: "Infield circle restricted",
    objectives: "Defend 9 runs in 1 over, land 2 perfect balls.",
    economyTarget: 9.0,
    scenarioDifficultyScore: 65,
    questWeight: 1.8
  },
  {
    scenarioId: "sc-p-1",
    scenarioName: "The Death Overs Choke",
    story: "The opposition requires only 18 runs from 2 overs with 3 wickets in hand. The crowd is deafening. Secure the win by choking their boundaries.",
    matchContext: "The opposition is chasing 18 runs in the final 2 overs. 3 wickets remain. Extreme boundary pressure is active.",
    oversRemaining: 2,
    runsLimit: 17,
    wicketsTarget: 2,
    wicketObjective: "Secure at least 2 wickets using flight and turn deception.",
    economyObjective: "Restrict target scoring to under 8.5 runs per over.",
    difficultyWord: "Intense",
    difficultyRating: "DIFFICULT",
    xpReward: 350,
    masteryXpReward: 700,
    riskRating: "HIGH",
    desc: "Defend 17 runs in 2 overs. Claim at least 2 wickets against aggressive spin attackers.",
    pressureConditions: "Extremely tight run rate requirement. Fast outfield.",
    specialEvents: "Crowd pressure is spiking. Ball becomes slightly slick.",
    pitch: "Dry",
    weather: "Sunny",
    battingTeamStyle: "Aggressive",
    specialMatchEvents: ["Crowd pressure", "Reverse wind"],
    fieldRestrictions: "5 fielders on boundary",
    objectives: "Defend 17 runs, claim 2 wickets, and bowl at least 4 dot balls.",
    economyTarget: 8.5,
    scenarioDifficultyScore: 78,
    questWeight: 2.2
  },
  {
    scenarioId: "sc-p-2",
    scenarioName: "Dew Factor Lockdown",
    story: "A heavy dew has settled on the outfield. The ball is extremely wet and slippery. You must defend 35 runs in 5 overs.",
    matchContext: "Defend 35 runs in 5 overs under heavy night dew conditions.",
    oversRemaining: 5,
    runsLimit: 34,
    wicketsTarget: 3,
    wicketObjective: "Claim 3 wickets while maintaining wrist snap control.",
    economyObjective: "Maintain under 6.8 runs per over on a wet surface.",
    difficultyWord: "Extreme Matrix",
    difficultyRating: "EXTREME",
    xpReward: 500,
    masteryXpReward: 900,
    riskRating: "EXTREME",
    desc: "Defend 34 runs in 5 overs. Grip is highly compromised due to dew.",
    pressureConditions: "Wet ball surface. Turning pitch has lost half of its friction.",
    specialEvents: "Ball wetness increases. Variable bounce.",
    pitch: "Turning",
    weather: "Heavy Dew",
    battingTeamStyle: "Power Hitters",
    specialMatchEvents: ["Ball wetness", "Broken footmarks"],
    fieldRestrictions: "Ring protection active",
    objectives: "Defend 34 runs, capture 3 wickets, avoid conceding any wides.",
    economyTarget: 6.8,
    scenarioDifficultyScore: 92,
    questWeight: 3.5
  },
  {
    scenarioId: "sc-p-3",
    scenarioName: "Spin Sanctuary Defense",
    story: "A dry cracked pitch offers incredible turn but the batters are trying to sweep everything. Defend 12 runs in 2 overs.",
    matchContext: "Protect a small target on a highly abrasive, dusty turning surface.",
    oversRemaining: 2,
    runsLimit: 11,
    wicketsTarget: 1,
    wicketObjective: "Secure 1 wicket using the Googly variation.",
    economyObjective: "Keep economy under 5.5 runs per over.",
    difficultyWord: "Challenging",
    difficultyRating: "MEDIUM",
    xpReward: 250,
    masteryXpReward: 500,
    riskRating: "MEDIUM",
    desc: "Defend 11 runs in 2 overs. Pitch is turning square.",
    pressureConditions: "Massive turn but high bounce variability.",
    specialEvents: "Dust kicks up from footmarks. Strong headwind.",
    pitch: "Dust",
    weather: "Cloudy",
    battingTeamStyle: "Spin Attackers",
    specialMatchEvents: ["Broken footmarks", "Variable bounce"],
    fieldRestrictions: "Standard 4 fielders out",
    objectives: "Defend 11 runs in 2 overs, claim 1 wicket, land 4 perfect balls.",
    economyTarget: 5.5,
    scenarioDifficultyScore: 60,
    questWeight: 1.5
  }
];

// Parser to extract dynamic requirements from multiline objective texts
export function parseQuestObjectives(text: string) {
  const reqs: any = {};
  
  // 1. Check for perfect balls
  const perfMatch = text.match(/(\d+)\s+perfect\s+(?:delivery|deliveries|ball|balls)/i);
  if (perfMatch) {
    reqs.perfectBallsNeeded = parseInt(perfMatch[1], 10);
  }

  // 2. Check for close or better balls
  const closeMatch = text.match(/(\d+)\s+close\s+(?:or\s+better|delivery|deliveries|ball|balls)/i);
  if (closeMatch) {
    reqs.closeOrBetterNeeded = parseInt(closeMatch[1], 10);
  }

  // 3. Check for runs conceded maximum limit
  const runsMatch = text.match(/(?:concede|defend|under|limit)\s*(\d+)\s*runs/i) || text.match(/runs\s*max(?:imum)?\s*(\d+)/i) || text.match(/keep\s+runs\s+(?:under|below)\s*(\d+)/i);
  if (runsMatch) {
    reqs.runsMaxLte = parseInt(runsMatch[1], 10);
  }

  // 4. Check for wickets
  const wicketsMatch = text.match(/(\d+)\s+wicket/i) || text.match(/take\s*(?:at\s+least)?\s*(\d+)\s*wickets/i);
  if (wicketsMatch) {
    reqs.wicketsNeeded = parseInt(wicketsMatch[1], 10);
  }

  // 5. Check for dot balls
  const dotsMatch = text.match(/(\d+)\s+dot\s+(?:ball|deliveries|balls)/i);
  if (dotsMatch) {
    reqs.dotBallsNeeded = parseInt(dotsMatch[1], 10);
  }

  // 6. Check for consecutive perfect balls
  const consecMatch = text.match(/(\d+)\s+consecutive\s+perfect/i);
  if (consecMatch) {
    reqs.consecutivePerfectBalls = parseInt(consecMatch[1], 10);
  }

  // 7. Check for no extras/wides
  if (/no\s+wides|no\s+extras|no\s+no-balls|no\s+no\s+balls/i.test(text)) {
    reqs.noWidesOrNoBalls = true;
  }

  return reqs;
}

// Automatic analysis engine for Quest Library
export function analyzeAndGenerateQuest(questData: {
  title: string;
  description: string;
  category: "Practice" | "Challenge" | "Monarch" | "Training";
  arena: string;
  overs: number | string;
  targetSkill: string;
  difficulty: "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH";
  objectivesText: string;
  id?: string;
  mode?: string;
}): CustomQuest {
  const difficulty = questData.difficulty;
  const overs = questData.overs;
  const objectives = questData.objectivesText;
  const skill = questData.targetSkill;

  // 1. Calculate Base Multipliers
  let baseScore = 200;
  let tier = "Initiate (Tier 1)";
  let recLevel = 2;
  let recRank = "Initiate";

  switch (difficulty) {
    case "EASY":
      baseScore = 150;
      tier = "Initiate (Tier 1)";
      recLevel = 2;
      recRank = "Initiate";
      break;
    case "MEDIUM":
      baseScore = 250;
      tier = "Adept (Tier 2)";
      recLevel = 8;
      recRank = "Adept";
      break;
    case "CHALLENGING":
      baseScore = 400;
      tier = "Master (Tier 3)";
      recLevel = 15;
      recRank = "Master";
      break;
    case "MONARCH":
      baseScore = 750;
      tier = "Monarch Sovereign (Tier 4)";
      recLevel = 25;
      recRank = "Sovereign";
      break;
  }

  // 2. Overs Multiplier
  let oversMult = 1.0;
  if (typeof overs === "number") {
    if (overs === 5) oversMult = 1.3;
    else if (overs === 10) oversMult = 1.8;
    else if (overs === 20) oversMult = 2.8;
    else if (overs >= 30) oversMult = 4.0;
  }

  // 3. Skill Complexity Multiplier
  let skillMult = 1.0;
  const lowerSkill = skill.toLowerCase();
  if (lowerSkill.includes("slider")) skillMult = 1.1;
  else if (lowerSkill.includes("googly")) skillMult = 1.15;
  else if (lowerSkill.includes("flipper")) skillMult = 1.3;
  else if (lowerSkill.includes("top spinner") || lowerSkill.includes("topspin")) skillMult = 1.25;
  else if (lowerSkill.includes("universal")) skillMult = 1.0;
  else skillMult = 1.05;

  // 4. Objectives text length and numeric complexity
  const parsedReqs = parseQuestObjectives(objectives);
  const reqKeysCount = Object.keys(parsedReqs).length;
  let objectiveMult = 1.0 + (reqKeysCount * 0.15);
  if (objectives.length > 100) objectiveMult += 0.1;
  if (objectives.length > 200) objectiveMult += 0.1;

  // Calculate final score metrics
  const rawScore = baseScore * oversMult * skillMult * objectiveMult;
  const questScore = Math.round(rawScore);
  const questWeight = parseFloat((rawScore / 300).toFixed(2));

  // XP allocations
  const playerXp = Math.round((questScore * 0.8) / 10) * 10;
  const masteryXp = Math.round((questScore * 1.2) / 10) * 10;
  const bonusXp = difficulty === "MONARCH" ? Math.round((questScore * 0.25) / 10) * 10 : Math.round((questScore * 0.1) / 10) * 10;

  // Map Category to standard API types
  let type: PracticeQuest["type"] = "CHAMBER_NET";
  if (questData.category === "Training") type = "CHAMBER_NET";
  else if (questData.category === "Practice") type = "CHAMBER_NET";
  else if (questData.category === "Challenge") type = "CHAMBER_MATCH_SIM";
  else if (questData.category === "Monarch") type = "DUNGEON_MATCH";

  // Skill mappings to support existing app UI structure
  let skillId = "s1";
  if (lowerSkill.includes("googly")) skillId = "s2";
  else if (lowerSkill.includes("slider")) skillId = "s4";
  else if (lowerSkill.includes("flipper")) skillId = "s3";
  else if (lowerSkill.includes("top")) skillId = "s5";

  return {
    id: questData.id || `qdb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    skillId,
    skillName: skill.toUpperCase(),
    name: questData.title,
    description: questData.description || `Hone your ${skill.toUpperCase()} skills under custom criteria.`,
    difficulty: difficulty === "MONARCH" ? "MONARCH" : difficulty,
    xpReward: playerXp,
    masteryReward: masteryXp,
    type,
    requirements: {
      ...parsedReqs,
      oversMin: typeof overs === "number" ? overs : 0,
    },
    completed: false,
    attemptsCount: 0,
    lastAttemptStatus: "NONE",
    // Extra custom metadata
    arena: questData.arena || "Sovereign Obelisk Grid",
    category: questData.category,
    objectivesText: objectives,
    targetSkill: skill,
    questWeight,
    questTier: tier,
    questScore,
    bonusXp,
    lastModified: new Date().toISOString().split("T")[0],
    // Extra automatic calculations requested:
    recommendedLevel: recLevel,
    recommendedRank: recRank,
    questValue: questScore,
    mode: questData.mode || "General",
    overs: overs
  };
}

// Automatic analysis for Pressure Scenarios
export function analyzeAndGeneratePressure(scData: {
  scenarioName: string;
  story: string;
  overs: number;
  difficulty: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME";
  runsToDefend: number;
  targetWickets: number;
  pitch: string;
  weather: string;
  battingTeamStyle: string;
  specialMatchEvents: string[];
  fieldRestrictions: string;
  objectives: string;
  scenarioId?: string;
}): PressureScenarioData {
  const overs = scData.overs || 2;
  const runs = scData.runsToDefend || 15;
  const wickets = scData.targetWickets || 2;
  const difficulty = scData.difficulty || "MEDIUM";

  // Calculate Economy limit
  const economyTarget = parseFloat((runs / overs).toFixed(1));

  // Base scoring metrics
  let baseScore = 200;
  let riskRating = "Medium";
  if (difficulty === "EASY") {
    baseScore = 150;
    riskRating = "Low";
  } else if (difficulty === "MEDIUM") {
    baseScore = 250;
    riskRating = "Medium";
  } else if (difficulty === "DIFFICULT") {
    baseScore = 400;
    riskRating = "High";
  } else if (difficulty === "EXTREME") {
    baseScore = 600;
    riskRating = "Extreme";
  }

  // Defensive pressure bonus if economy rate target is very tough!
  let tightnessMult = 1.0;
  if (economyTarget < 5.0) tightnessMult = 1.4;
  else if (economyTarget < 6.5) tightnessMult = 1.25;
  else if (economyTarget < 8.0) tightnessMult = 1.1;

  // Events & Environment multipliers
  const pitchMult = ["turning", "cracked", "dust"].includes(scData.pitch.toLowerCase()) ? 1.05 : 1.15; // wet or green harder for spin!
  const weatherMult = scData.weather.toLowerCase().includes("dew") || scData.weather.toLowerCase().includes("rain") ? 1.25 : 1.0;
  const eventFactor = 1.0 + (scData.specialMatchEvents.length * 0.08);

  const rawScore = baseScore * tightnessMult * pitchMult * weatherMult * eventFactor * (1.0 + (wickets * 0.05));
  const scenarioDifficultyScore = Math.min(100, Math.round(rawScore / 8));
  const questWeight = parseFloat((rawScore / 300).toFixed(2));

  const xpReward = Math.round((rawScore * 0.8) / 10) * 10;
  const masteryXpReward = Math.round((rawScore * 1.5) / 10) * 10;

  // Build match context
  const matchContext = `${scData.story} You are up against ${scData.battingTeamStyle} batsmen under ${scData.weather} skies.`;
  const desc = `Defend ${runs} runs in ${overs} overs. Target: Claim at least ${wickets} wickets.`;

  return {
    scenarioId: scData.scenarioId || `sc-db-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    scenarioName: scData.scenarioName,
    matchContext,
    oversRemaining: overs,
    runsLimit: runs,
    wicketsTarget: wickets,
    wicketObjective: `Claim at least ${wickets} wickets with tight rotational length controls.`,
    economyObjective: `Defend total runs to lock down economy under ${economyTarget} per over.`,
    difficultyWord: difficulty === "EXTREME" ? "Extreme Matrix" : (difficulty === "DIFFICULT" ? "High Composure" : (difficulty === "MEDIUM" ? "Active Chaos" : "Stable Matrix")),
    difficultyRating: difficulty,
    xpReward,
    masteryXpReward,
    riskRating,
    desc,
    pressureConditions: `Pitch is ${scData.pitch}. Weather: ${scData.weather}.`,
    specialEvents: scData.specialMatchEvents.join(". ") || "Standard professional conditions apply.",
    story: scData.story,
    pitch: scData.pitch,
    weather: scData.weather,
    battingTeamStyle: scData.battingTeamStyle,
    specialMatchEvents: scData.specialMatchEvents,
    fieldRestrictions: scData.fieldRestrictions,
    objectives: scData.objectives,
    economyTarget,
    scenarioDifficultyScore,
    questWeight
  };
}

// STORAGE ENGINE CLASS
const DRILL_TEMPLATES = [
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

const SKILLS_LIST = [
  { id: "s1", name: "LEG BREAK" },
  { id: "s2", name: "GOOGLY" },
  { id: "s3", name: "TOP SPINNER" },
  { id: "s4", name: "SLIDER" },
  { id: "s5", name: "FLIPPER" }
];

const ARENAS = [
  "Sovereign Obelisk Grid",
  "Glacial Fortress Chamber",
  "Underworld Shadow Arena",
  "Evolution Chamber Grid",
  "Monarch Training Sanctum",
  "Abyssal Gateways Stadium",
  "Celestial Void Pitch",
  "Runic Colosseum",
  "Nadir Abyss Core",
  "Aetherial Pinnacle"
];

export class QuestDatabaseManager {
  private static QUEST_KEY = "monarch_quest_db_v1";
  private static PRESSURE_KEY = "monarch_pressure_db_v1";

  // Procedurally generate 500 high-quality quests spanning all skills and templates
  static generate500SystemQuests(): CustomQuest[] {
    const list: CustomQuest[] = [];

    SKILLS_LIST.forEach((skill) => {
      DRILL_TEMPLATES.forEach((temp) => {
        // Generate 2 custom variants per template-skill combo (5 * 50 * 2 = 500 unique quests)
        for (let variant = 1; variant <= 2; variant++) {
          const isAdvanced = variant === 2;
          const category = isAdvanced ? "Challenge" : "Practice";
          const difficulty = isAdvanced
            ? (temp.id % 2 === 0 ? "CHALLENGING" : "MONARCH")
            : (temp.id % 2 === 0 ? "EASY" : "MEDIUM");

          const arena = ARENAS[(temp.id + skill.name.length + variant) % ARENAS.length];
          const overs = temp.baseRequirements.oversMin + (isAdvanced ? 1 : 0);
          
          // Scale requirements for advanced
          const requirements = { ...temp.baseRequirements };
          if (isAdvanced) {
            if (requirements.perfectBallsNeeded) {
              requirements.perfectBallsNeeded = Math.round(requirements.perfectBallsNeeded * 1.5);
            }
            if (requirements.closeOrBetterNeeded) {
              requirements.closeOrBetterNeeded = Math.round(requirements.closeOrBetterNeeded * 1.4);
            }
            if (requirements.dotBallsNeeded) {
              requirements.dotBallsNeeded = Math.round(requirements.dotBallsNeeded * 1.5);
            }
            if (requirements.wicketsNeeded) {
              requirements.wicketsNeeded = requirements.wicketsNeeded + 1;
            }
            if (requirements.runsMaxLte) {
              requirements.runsMaxLte = Math.max(4, Math.round(requirements.runsMaxLte * 0.8));
            }
          }
          requirements.oversMin = overs;

          const title = isAdvanced
            ? `Sovereign ${skill.name} — ${temp.name} [Phase ${temp.id}]`
            : `${skill.name} Matrix: ${temp.name}`;

          // Formulate objective description details
          const details: string[] = [];
          if (requirements.perfectBallsNeeded) {
            details.push(`land ${requirements.perfectBallsNeeded} perfect deliveries`);
          }
          if (requirements.closeOrBetterNeeded) {
            details.push(`deliver ${requirements.closeOrBetterNeeded} close or better classifications`);
          }
          if (requirements.dotBallsNeeded) {
            details.push(`secure ${requirements.dotBallsNeeded} dot balls`);
          }
          if (requirements.wicketsNeeded) {
            details.push(`claim ${requirements.wicketsNeeded} wickets`);
          }
          if (requirements.runsMaxLte) {
            details.push(`concede at most ${requirements.runsMaxLte} runs`);
          }

          const objectivesText = `In a ${overs}-over spell, you must: ${details.join(", and ")}.`;
          const description = `SYSTEM DIRECTIVE: Undertake the shadow calibration sequence for ${skill.name} inside the ${arena}. Weave your trajectory under ${difficulty} parameters to synchronize the system's kinetic core.`;

          const quest = analyzeAndGenerateQuest({
            id: `q-db-auto-${skill.id}-${temp.id}-${variant}`,
            title,
            description,
            category,
            arena,
            overs,
            targetSkill: skill.name,
            difficulty,
            objectivesText
          });

          // Establish clean stable ID & requirements
          quest.id = `q-db-auto-${skill.id}-${temp.id}-${variant}`;
          quest.requirements = requirements;

          list.push(quest);
        }
      });
    });

    return list;
  }

  // Load all quests from DB
  static getQuests(): CustomQuest[] {
    const data = localStorage.getItem(this.QUEST_KEY);
    if (data !== null) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          let changed = false;
          const sanitized = parsed.map(q => {
            if (!q) return null;
            let cat = q.category || "Practice";
            if (cat === "Monarch") { cat = "Challenge"; changed = true; }
            if (cat === "Training") { cat = "Practice"; changed = true; }
            
            const targetSkill = q.targetSkill || q.skillName || "LEG BREAK";
            const skillName = q.skillName || targetSkill;
            const name = q.name || q.title || "Untitled Quest";
            const description = q.description || "";
            const objectivesText = q.objectivesText || description;
            const arena = q.arena || "Sovereign Obelisk Grid";
            const difficulty = q.difficulty || "EASY";
            const id = q.id || `qdb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const type = q.type || "CHAMBER_NET";
            const requirements = q.requirements || {};
            const completed = !!q.completed;
            const lastModified = q.lastModified || new Date().toISOString().split("T")[0];
            const status = q.status || (completed ? "COMPLETED" : "LOCKED");

            if (q.category !== cat || q.targetSkill !== targetSkill || q.skillName !== skillName || q.name !== name || q.objectivesText !== objectivesText || q.arena !== arena || q.difficulty !== difficulty || q.id !== id || q.type !== type || q.completed !== completed || q.lastModified !== lastModified || q.status !== status) {
              changed = true;
            }

            return {
              ...q,
              id,
              name,
              description,
              difficulty,
              xpReward: Number(q.xpReward || 150),
              masteryReward: Number(q.masteryReward || 350),
              type,
              requirements,
              completed,
              arena,
              category: cat,
              objectivesText,
              targetSkill,
              skillName,
              lastModified,
              status
            };
          }).filter(Boolean) as CustomQuest[];

          if (changed) {
            this.saveQuests(sanitized);
          }
          return sanitized;
        }
      } catch (e) {
        console.error("Error parsing quests database:", e);
      }
    }
    
    // Auto-generate the full master library ONLY if there is no database yet
    const initialQuests: CustomQuest[] = [];
    
    // Add INITIAL_PRACTICE_QUESTS
    INITIAL_PRACTICE_QUESTS.forEach((q) => {
      initialQuests.push({
        id: q.id,
        name: q.name,
        description: q.description || "",
        difficulty: q.difficulty || "EASY",
        xpReward: q.xpReward || 150,
        masteryReward: q.masteryReward || 350,
        type: q.type || "CHAMBER_NET",
        requirements: q.requirements || {},
        completed: false,
        arena: (q as any).arena || "Sovereign Obelisk Grid",
        category: "Practice",
        objectivesText: q.description || "",
        targetSkill: q.skillName || "LEG BREAK",
        skillName: q.skillName || "LEG BREAK",
        lastModified: new Date().toISOString().split("T")[0],
        status: "LOCKED"
      } as any);
    });

    // Add generate500SystemQuests
    const systemQuests = this.generate500SystemQuests();
    systemQuests.forEach((q) => {
      q.status = "LOCKED";
      initialQuests.push(q);
    });

    // Add generateBuiltInLibrary
    const builtInLibrary = this.generateBuiltInLibrary();
    builtInLibrary.forEach((q) => {
      q.status = "LOCKED";
      initialQuests.push(q);
    });

    // Deduplicate by ID to prevent any duplicate IDs
    const deduplicatedMap = new Map<string, CustomQuest>();
    initialQuests.forEach((q) => deduplicatedMap.set(q.id, q));
    const finalQuests = Array.from(deduplicatedMap.values());

    this.saveQuests(finalQuests);
    return finalQuests;
  }

  // Force reinitialize full database of 500 quests
  static forceReinitialize500Quests(): CustomQuest[] {
    const systemQuests = this.generate500SystemQuests();
    this.saveQuests(systemQuests);
    return systemQuests;
  }

  // Save all quests to DB
  static saveQuests(quests: CustomQuest[]) {
    localStorage.setItem(this.QUEST_KEY, JSON.stringify(quests));
    this.syncToCloud(quests, undefined);
  }

  static async syncToCloud(quests?: CustomQuest[], scenarios?: PressureScenarioData[]) {
    try {
      let finalQuests = quests;
      if (!finalQuests) {
        const local = localStorage.getItem(this.QUEST_KEY);
        finalQuests = local ? JSON.parse(local) : [];
      }
      let finalScenarios = scenarios;
      if (!finalScenarios) {
        const local = localStorage.getItem(this.PRESSURE_KEY);
        finalScenarios = local ? JSON.parse(local) : [];
      }
      await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quests: finalQuests, scenarios: finalScenarios })
      });
    } catch (err) {
      console.warn("Cloud storage sync non-critical warning:", err);
    }
  }

  static async fetchFromCloud(): Promise<boolean> {
    try {
      const res = await fetch("/api/quests");
      const data = await res.json();
      if (data) {
        const cloudQuests = data.quests || [];
        const cloudScenarios = data.scenarios || [];
        
        const localQuestsStr = localStorage.getItem(this.QUEST_KEY);
        const localScenariosStr = localStorage.getItem(this.PRESSURE_KEY);
        
        const localQuests = localQuestsStr ? JSON.parse(localQuestsStr) : [];
        const localScenarios = localScenariosStr ? JSON.parse(localScenariosStr) : [];
        
        let needsPush = false;
        
        if (Array.isArray(cloudQuests) && cloudQuests.length > 0) {
          localStorage.setItem(this.QUEST_KEY, JSON.stringify(cloudQuests));
        } else if (Array.isArray(localQuests) && localQuests.length > 0) {
          needsPush = true;
        }
        
        if (Array.isArray(cloudScenarios) && cloudScenarios.length > 0) {
          localStorage.setItem(this.PRESSURE_KEY, JSON.stringify(cloudScenarios));
        } else if (Array.isArray(localScenarios) && localScenarios.length > 0) {
          needsPush = true;
        }
        
        if (needsPush) {
          await this.syncToCloud(localQuests, localScenarios);
        }
        return true;
      }
    } catch (err) {
      console.warn("Failed to load quests from cloud storage (non-critical):", err);
    }
    return false;
  }

  // Load all pressure scenarios
  static getPressureScenarios(): PressureScenarioData[] {
    const data = localStorage.getItem(this.PRESSURE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map(s => {
            if (!s) return null;
            return {
              scenarioId: s.scenarioId || s.id || `sc-p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              scenarioName: s.scenarioName || s.name || "Untitled Scenario",
              matchContext: s.matchContext || s.story || "",
              oversRemaining: Number(s.oversRemaining || 1),
              runsLimit: Number(s.runsLimit || 0),
              wicketsTarget: Number(s.wicketsTarget || 0),
              wicketObjective: s.wicketObjective || "",
              economyObjective: s.economyObjective || "",
              difficultyWord: s.difficultyWord || "MEDIUM",
              difficultyRating: s.difficultyRating || "MEDIUM",
              xpReward: Number(s.xpReward || 100),
              masteryXpReward: Number(s.masteryXpReward || 200),
              riskRating: s.riskRating || s.scenarioRiskRating || "MEDIUM",
              desc: s.desc || "",
              pressureConditions: s.pressureConditions || "",
              specialEvents: s.specialEvents || "",
              story: s.story || s.matchContext || "",
              pitch: s.pitch || "Dry",
              weather: s.weather || "Sunny",
              battingTeamStyle: s.battingTeamStyle || "Balanced",
              specialMatchEvents: s.specialMatchEvents || [],
              fieldRestrictions: s.fieldRestrictions || "Standard",
              objectives: s.objectives || "",
              economyTarget: Number(s.economyTarget || 0),
              scenarioDifficultyScore: Number(s.scenarioDifficultyScore || 50),
              questWeight: Number(s.questWeight || 1.0)
            };
          }).filter(Boolean) as PressureScenarioData[];
        }
      } catch (e) {
        console.error("Error parsing pressure database:", e);
      }
    }
    this.savePressureScenarios(DEFAULT_PRESSURE_SCENARIOS);
    return DEFAULT_PRESSURE_SCENARIOS;
  }

  // Save all pressure scenarios
  static savePressureScenarios(scenarios: PressureScenarioData[]) {
    localStorage.setItem(this.PRESSURE_KEY, JSON.stringify(scenarios));
    this.syncToCloud(undefined, scenarios);
  }

  // Add/Edit Quest
  static upsertQuest(questData: any): CustomQuest {
    const quests = this.getQuests();
    const analyzed = analyzeAndGenerateQuest(questData);
    const existingIndex = quests.findIndex((q) => q.id === analyzed.id);
    if (existingIndex >= 0) {
      quests[existingIndex] = analyzed;
    } else {
      quests.push(analyzed);
    }
    this.saveQuests(quests);
    return analyzed;
  }

  // Delete Quest
  static deleteQuest(id: string) {
    const quests = this.getQuests().filter((q) => q.id !== id);
    this.saveQuests(quests);
  }

  // Clear all quests
  static clearAllQuests() {
    this.saveQuests([]);
  }

  // Synthesize new quests dynamically for a newly registered custom variation (skill)
  static synthesizeQuestsForNewSkill(newSkill: any, existingSkills: any[]): PracticeQuest[] {
    const quests = this.getQuests();
    
    // 1. Calculate similarity to identify closest core skill style
    const coreSkillsMapping: Record<string, any> = {
      "LEG BREAK": { spinDirection: "Leg Spin", primaryBehavior: "Turn", releaseType: "Wrist", flightStyle: "Flighted" },
      "GOOGLY": { spinDirection: "Off Spin", primaryBehavior: "Turn", releaseType: "Wrist", flightStyle: "Flighted" },
      "TOP SPINNER": { spinDirection: "Leg Spin", primaryBehavior: "Bounce", releaseType: "Wrist", flightStyle: "Flighted" },
      "SLIDER": { spinDirection: "Straight", primaryBehavior: "Skid", releaseType: "Wrist", flightStyle: "Flat" },
      "FLIPPER": { spinDirection: "Straight", primaryBehavior: "Skid", releaseType: "Finger", flightStyle: "Flat" }
    };

    let closestCore = "LEG BREAK";
    let maxScore = -1;
    for (const [coreName, attrs] of Object.entries(coreSkillsMapping)) {
      let score = 0;
      if (newSkill.spinDirection === attrs.spinDirection) score += 2;
      if (newSkill.primaryBehavior === attrs.primaryBehavior) score += 2;
      if (newSkill.releaseType === attrs.releaseType) score += 1;
      if (newSkill.flightStyle === attrs.flightStyle) score += 1;
      
      if (score > maxScore) {
        maxScore = score;
        closestCore = coreName;
      }
    }

    const sName = newSkill.name.toUpperCase();
    
    // 2. Synthesize 5 brand-new quests designed specifically for this variation
    const newQuestsToCreate: CustomQuest[] = [
      {
        id: `q-synth-1-${newSkill.id}`,
        skillId: newSkill.id,
        skillName: sName,
        name: `${sName} Calibration Sequence`,
        description: `SYSTEM DIRECTIVE: Perform basic kinetic resonance tests for your newly synthesized ${sName} variation. Snap your wrist and stabilize release vectors inside the Sovereign Obelisk Grid to align metrics.`,
        difficulty: "EASY",
        xpReward: 150,
        masteryReward: 350,
        type: "CHAMBER_NET",
        requirements: { perfectBallsNeeded: 6, oversMin: 2 },
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        arena: "Sovereign Obelisk Grid",
        category: "Practice",
        objectivesText: `In a 2-over spell, land at least 6 perfect balls using your new ${sName} variation.`,
        targetSkill: sName,
        questWeight: 1.0,
        questTier: "Initiate (Tier 1)",
        questScore: 200,
        bonusXp: 20,
        lastModified: new Date().toISOString().split("T")[0],
        status: "UNLOCKED"
      },
      {
        id: `q-synth-2-${newSkill.id}`,
        skillId: newSkill.id,
        skillName: sName,
        name: `Tactical Deception: ${sName} Squeeze`,
        description: `SYSTEM DIRECTIVE: Deploy the anomalous spin rotation of your newly synthesized ${sName} to freeze the batsman's stroke-play and restrict target flow in the Glacial Fortress Chamber.`,
        difficulty: "MEDIUM",
        xpReward: 250,
        masteryReward: 500,
        type: "CHAMBER_NET",
        requirements: { dotBallsNeeded: 12, oversMin: 3 },
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        arena: "Glacial Fortress Chamber",
        category: "Practice",
        objectivesText: `Complete a 3-over spell yielding at least 12 dot balls while relying on ${sName} angles.`,
        targetSkill: sName,
        questWeight: 1.5,
        questTier: "Adept (Tier 2)",
        questScore: 350,
        bonusXp: 35,
        lastModified: new Date().toISOString().split("T")[0],
        status: "UNLOCKED"
      },
      {
        id: `q-synth-3-${newSkill.id}`,
        skillId: newSkill.id,
        skillName: sName,
        name: `${sName} Stump Shatter Hunt`,
        description: `SYSTEM DIRECTIVE: Under intense pressure on an abrasive dusty pitch, utilize the ${sName} trajectory to attack middle stump and draw batsman errors.`,
        difficulty: "CHALLENGING",
        xpReward: 400,
        masteryReward: 700,
        type: "CHAMBER_MATCH_SIM",
        requirements: { wicketsNeeded: 2, oversMin: 3 },
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        arena: "Underworld Shadow Arena",
        category: "Challenge",
        objectivesText: `Bowl 3 overs, claiming 2 wickets specifically set up by the ${sName} trajectory.`,
        targetSkill: sName,
        questWeight: 2.2,
        questTier: "Master (Tier 3)",
        questScore: 500,
        bonusXp: 50,
        lastModified: new Date().toISOString().split("T")[0],
        status: "UNLOCKED"
      },
      {
        id: `q-synth-4-${newSkill.id}`,
        skillId: newSkill.id,
        skillName: sName,
        name: `Monarch Sovereign: Ultimate ${sName} Spell`,
        description: `CRITICAL TRIAL: Command absolute control of your newly registered ${sName} inside the Monarch Training Sanctum. Restrict runs and claim wickets to sync the system matrix.`,
        difficulty: "MONARCH",
        xpReward: 650,
        masteryReward: 1200,
        type: "DUNGEON_MATCH",
        requirements: { perfectBallsNeeded: 12, wicketsNeeded: 3, runsMaxLte: 10, oversMin: 4 },
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        arena: "Monarch Training Sanctum",
        category: "Challenge",
        objectivesText: `Complete 4 overs. Deliver 12 perfect balls, take 3 wickets, and concede at most 10 runs using ${sName}.`,
        targetSkill: sName,
        questWeight: 3.5,
        questTier: "Monarch Sovereign (Tier 4)",
        questScore: 900,
        bonusXp: 220,
        lastModified: new Date().toISOString().split("T")[0],
        status: "UNLOCKED"
      },
      {
        id: `q-synth-5-${newSkill.id}`,
        skillId: newSkill.id,
        skillName: sName,
        name: `Pace-Rotation Blend: ${sName} Sync`,
        description: `SYSTEM DIRECTIVE: Alternate your spin velocity and flight style. Let the ${sName} skid and drift sequentially to create maximum confusion inside the Evolution Chamber.`,
        difficulty: "MEDIUM",
        xpReward: 200,
        masteryReward: 450,
        type: "CHAMBER_NET",
        requirements: { closeOrBetterNeeded: 12, oversMin: 3 },
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        arena: "Evolution Chamber Grid",
        category: "Practice",
        objectivesText: `Execute 3 overs delivering 12 close-or-better deliveries with varying speeds focusing on ${sName}.`,
        targetSkill: sName,
        questWeight: 1.3,
        questTier: "Adept (Tier 2)",
        questScore: 300,
        bonusXp: 30,
        lastModified: new Date().toISOString().split("T")[0],
        status: "UNLOCKED"
      }
    ];

    // Add these 5 new quests to the master quests array
    const updatedQuests = [...quests, ...newQuestsToCreate];

    // 3. "Modify Quests": Find existing quests similar to the closest core style and adapt them
    let modifiedCount = 0;
    const finalQuests = updatedQuests.map((q) => {
      if (modifiedCount < 3 && q.targetSkill.toUpperCase() === closestCore && !q.id.startsWith("q-synth-")) {
        modifiedCount++;
        return {
          ...q,
          targetSkill: `${q.targetSkill} / ${sName}`,
          description: `${q.description} [COMPATIBLE VARIATION DETECTED: You may also utilize your newly synthesized ${sName} variation to complete these objectives.]`,
          objectivesText: `${q.objectivesText} [Supports either ${closestCore} or ${sName} variation]`,
          lastModified: new Date().toISOString().split("T")[0],
          status: q.status === "LOCKED" ? "UNLOCKED" : q.status
        };
      }
      return q;
    });

    this.saveQuests(finalQuests);
    
    // Return the new quests to be unlocked instantly in the active practice quests state
    return newQuestsToCreate as any[];
  }

  // Add/Edit Pressure Scenario
  static upsertPressureScenario(scData: any): PressureScenarioData {
    const scenarios = this.getPressureScenarios();
    const analyzed = analyzeAndGeneratePressure(scData);
    const existingIndex = scenarios.findIndex((s) => s.scenarioId === analyzed.scenarioId);
    if (existingIndex >= 0) {
      scenarios[existingIndex] = analyzed;
    } else {
      scenarios.push(analyzed);
    }
    this.savePressureScenarios(scenarios);
    return analyzed;
  }

  // Delete Pressure Scenario
  static deletePressureScenario(id: string) {
    const scenarios = this.getPressureScenarios().filter((s) => s.scenarioId !== id);
    this.savePressureScenarios(scenarios);
  }

  // Helper for seed-based deterministic PRNG
  static seedRandom(seed: number): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  static chooseDeterministic<T>(arr: T[], seed: number): T {
    const rand = this.seedRandom(seed);
    return arr[Math.floor(rand * arr.length)];
  }

  static generateBuiltInLibrary(): CustomQuest[] {
    const library: CustomQuest[] = [];

    const skills = [
      { id: "s1", name: "LEG BREAK" },
      { id: "s2", name: "GOOGLY" },
      { id: "s3", name: "TOP SPINNER" },
      { id: "s4", name: "SLIDER" },
      { id: "s5", name: "FLIPPER" }
    ];

    const arenas = [
      "Sovereign Obelisk Grid",
      "Glacial Fortress Chamber",
      "Underworld Shadow Arena",
      "Evolution Chamber Grid",
      "Monarch Training Sanctum",
      "Abyssal Gateways Stadium",
      "Celestial Void Pitch",
      "Runic Colosseum",
      "Nadir Abyss Core",
      "Aetherial Pinnacle"
    ];

    const objectiveTypes = [
      "Flight control", "Drift", "Loop", "Variation usage", "Economy", "Accuracy", 
      "Length", "Pressure bowling", "Wicket taking", "Dot balls", "Boundary prevention", 
      "Consistency", "Spell management", "Field placement", "Spin amount", "Turn percentage", 
      "Match awareness", "Variation combinations", "Target bowling", "Execution speed", "Mental pressure"
    ];

    // 1. Generate 320 Chamber Training Quests (CHAMBER_NET)
    for (let i = 1; i <= 320; i++) {
      const seed = i * 17;
      const skill = this.chooseDeterministic(skills, seed);
      const temp = this.chooseDeterministic(DRILL_TEMPLATES, seed + 1);
      const arena = this.chooseDeterministic(arenas, seed + 2);
      const objective = this.chooseDeterministic(objectiveTypes, seed + 3);
      const difficulty = i % 3 === 0 ? "CHALLENGING" : i % 2 === 0 ? "MEDIUM" : "EASY";

      const overs = temp.baseRequirements.oversMin || (difficulty === "EASY" ? 2 : difficulty === "MEDIUM" ? 3 : 4);
      const reqs: any = { ...temp.baseRequirements, oversMin: overs };
      if (!reqs.perfectBallsNeeded && !reqs.closeOrBetterNeeded && !reqs.dotBallsNeeded && !reqs.wicketsNeeded) {
        reqs.perfectBallsNeeded = difficulty === "EASY" ? 5 : difficulty === "MEDIUM" ? 10 : 15;
      }

      const title = `${skill.name} Matrix: ${temp.name} (${objective})`;
      const objectivesText = `In a ${overs}-over spell, focus on ${objective} and fulfill the core parameters.`;
      const description = `SYSTEM DIRECTIVE: Calibrate your ${skill.name} trajectory inside the ${arena} focusing on ${objective}. Complete objectives to sync kinetic metrics.`;

      library.push({
        id: `q-built-chamber-${i}`,
        skillId: skill.id,
        skillName: skill.name,
        name: title,
        description,
        difficulty,
        xpReward: difficulty === "EASY" ? 120 : difficulty === "MEDIUM" ? 180 : 250,
        masteryReward: difficulty === "EASY" ? 250 : difficulty === "MEDIUM" ? 380 : 500,
        type: "CHAMBER_NET",
        requirements: reqs,
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        recommendedLevel: Math.max(1, Math.floor(i / 12)),
        arena,
        category: "Practice",
        objectivesText,
        targetSkill: skill.name,
        questWeight: 1,
        questTier: difficulty,
        questScore: 100,
        bonusXp: 20,
        lastModified: new Date().toISOString()
      });
    }

    // 2. Generate 320 Evolution Chamber Quests (CHAMBER_MATCH_SIM)
    for (let i = 1; i <= 320; i++) {
      const seed = i * 23;
      const skill = this.chooseDeterministic(skills, seed);
      const temp = this.chooseDeterministic(DRILL_TEMPLATES, seed + 1);
      const arena = this.chooseDeterministic(arenas, seed + 2);
      const objective = this.chooseDeterministic(objectiveTypes, seed + 3);
      const difficulty = i % 3 === 0 ? "MONARCH" : i % 2 === 0 ? "CHALLENGING" : "MEDIUM";

      const overs = (temp.baseRequirements.oversMin || (difficulty === "MEDIUM" ? 3 : difficulty === "CHALLENGING" ? 4 : 5)) + 1;
      const reqs: any = { ...temp.baseRequirements, oversMin: overs };
      if (reqs.perfectBallsNeeded) reqs.perfectBallsNeeded = Math.round(reqs.perfectBallsNeeded * 1.3);
      if (reqs.closeOrBetterNeeded) reqs.closeOrBetterNeeded = Math.round(reqs.closeOrBetterNeeded * 1.3);
      if (!reqs.wicketsNeeded && !reqs.dotBallsNeeded && !reqs.runsMaxLte) {
        reqs.dotBallsNeeded = difficulty === "MEDIUM" ? 12 : 18;
      }

      const title = `Sovereign ${skill.name} — ${temp.name} [Phase ${temp.id}]`;
      const objectivesText = `Conduct match simulation on the active grid. Restrict run rates and achieve tactical placement.`;
      const description = `WARFARE DIRECTIVE: Step onto the training grid inside ${arena}. Put batsmen under intense pressure using ${skill.name} variations to lock in mastery vectors.`;

      library.push({
        id: `q-built-evolution-${i}`,
        skillId: skill.id,
        skillName: skill.name,
        name: title,
        description,
        difficulty,
        xpReward: difficulty === "MEDIUM" ? 200 : difficulty === "CHALLENGING" ? 300 : 450,
        masteryReward: difficulty === "MEDIUM" ? 400 : difficulty === "CHALLENGING" ? 600 : 900,
        type: "CHAMBER_MATCH_SIM",
        requirements: reqs,
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        recommendedLevel: Math.max(3, Math.floor(i / 8)),
        arena,
        category: "Challenge",
        objectivesText,
        targetSkill: skill.name,
        questWeight: 2,
        questTier: difficulty,
        questScore: 200,
        bonusXp: 40,
        lastModified: new Date().toISOString()
      });
    }

    // 3. Generate 320 Match Dungeon Quests (DUNGEON_MATCH)
    for (let i = 1; i <= 320; i++) {
      const seed = i * 31;
      const skill = this.chooseDeterministic(skills, seed);
      const temp = this.chooseDeterministic(DRILL_TEMPLATES, seed + 1);
      const objective = this.chooseDeterministic(objectiveTypes, seed + 3);
      const difficulty = i % 2 === 0 ? "MONARCH" : "CHALLENGING";

      const overs = difficulty === "CHALLENGING" ? 4 : 5;
      const reqs: any = {
        ...temp.baseRequirements,
        oversMin: overs,
        wicketsNeeded: difficulty === "CHALLENGING" ? 3 : 4,
        runsMaxLte: difficulty === "CHALLENGING" ? 15 : 12
      };

      const title = `Dungeon Strike: ${skill.name} ${temp.name} (${objective})`;
      const objectivesText = `Claim ${reqs.wicketsNeeded} wickets and maintain an economy under ${(reqs.runsMaxLte / overs).toFixed(1)} runs per over.`;
      const description = `REAL COMBAT CONTRACT: Conquer the dungeon match with ${skill.name} maneuvers. Shut down run rates and secure early breakthroughs to secure a solid team victory.`;

      library.push({
        id: `q-built-dungeon-${i}`,
        skillId: skill.id,
        skillName: skill.name,
        name: title,
        description,
        difficulty,
        xpReward: difficulty === "CHALLENGING" ? 350 : 500,
        masteryReward: difficulty === "CHALLENGING" ? 700 : 1000,
        type: "DUNGEON_MATCH",
        requirements: reqs,
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        recommendedLevel: Math.max(5, Math.floor(i / 6)),
        arena: "Match Dungeon Arena",
        category: "Challenge",
        objectivesText,
        targetSkill: skill.name,
        questWeight: 3,
        questTier: difficulty,
        questScore: 300,
        bonusXp: 65,
        lastModified: new Date().toISOString()
      });
    }

    // 4. Generate 160 Skill Mastery Quests (CHAMBER_NET)
    for (let i = 1; i <= 160; i++) {
      const seed = i * 37;
      const skill = this.chooseDeterministic(skills, seed);
      const temp = this.chooseDeterministic(DRILL_TEMPLATES, seed + 1);
      const arena = this.chooseDeterministic(arenas, seed + 2);
      const objective = this.chooseDeterministic(objectiveTypes, seed + 3);
      const difficulty = i % 4 === 0 ? "MONARCH" : i % 3 === 0 ? "CHALLENGING" : i % 2 === 0 ? "MEDIUM" : "EASY";

      const overs = difficulty === "EASY" ? 2 : difficulty === "MEDIUM" ? 3 : 4;
      const reqs: any = {
        oversMin: overs,
        perfectBallsNeeded: difficulty === "EASY" ? 6 : difficulty === "MEDIUM" ? 10 : difficulty === "CHALLENGING" ? 15 : 20
      };

      const title = `Mastery Ritual: ${skill.name} ${temp.name} (${objective})`;
      const objectivesText = `Achieve absolute accuracy landing ${reqs.perfectBallsNeeded} perfect deliveries in a ${overs}-over spell.`;
      const description = `MASTERY PROTOCOL: Unlock extreme fine-motor control for ${skill.name} inside the ${arena}. Achieve high accuracy classification vectors under pressure.`;

      library.push({
        id: `q-built-mastery-${i}`,
        skillId: skill.id,
        skillName: skill.name,
        name: title,
        description,
        difficulty,
        xpReward: difficulty === "EASY" ? 150 : difficulty === "MEDIUM" ? 220 : difficulty === "CHALLENGING" ? 320 : 480,
        masteryReward: difficulty === "EASY" ? 400 : difficulty === "MEDIUM" ? 550 : difficulty === "CHALLENGING" ? 800 : 1200,
        type: "CHAMBER_NET",
        requirements: reqs,
        completed: false,
        attemptsCount: 0,
        lastAttemptStatus: "NONE",
        recommendedLevel: Math.max(1, Math.floor(i / 4)),
        arena,
        category: "Practice",
        objectivesText,
        targetSkill: skill.name,
        questWeight: 2,
        questTier: difficulty,
        questScore: 150,
        bonusXp: 30,
        lastModified: new Date().toISOString()
      });
    }

    return library;
  }

  static generateDailyQuest(dayIndex: number, playerLevel: number, skills: any[]): CustomQuest {
    const targetSkill = skills[dayIndex % skills.length] || { id: "s1", name: "LEG BREAK" };
    const difficulty = dayIndex % 4 === 0 ? "CHALLENGING" : dayIndex % 2 === 0 ? "MEDIUM" : "EASY";

    const baseOvers = difficulty === "EASY" ? 2 : difficulty === "MEDIUM" ? 3 : 4;
    const scaledOvers = baseOvers + Math.floor(playerLevel / 10);
    const perfects = (difficulty === "EASY" ? 5 : difficulty === "MEDIUM" ? 10 : 15) + Math.floor(playerLevel / 2);

    const rewardsXp = 150 + Math.floor(playerLevel * 5) + (dayIndex % 50);
    const rewardsMastery = 350 + Math.floor(playerLevel * 10) + (dayIndex % 100);

    const title = `Daily Routine: ${targetSkill.name} Sync [Day ${dayIndex + 1}]`;
    const objectivesText = `Land ${perfects} Perfect Balls of ${targetSkill.name} inside a ${scaledOvers}-over spell.`;

    return {
      id: `q-built-daily-${dayIndex}`,
      skillId: targetSkill.id,
      skillName: targetSkill.name,
      name: title,
      description: `DAILY AUTOMATED CONTRACT: Maintain your daily bowling rhythm. Load the ${targetSkill.name} trajectory module inside the Chamber and achieve standard accuracy parameters to collect reward bundles.`,
      difficulty,
      xpReward: rewardsXp,
      masteryReward: rewardsMastery,
      type: "CHAMBER_NET",
      requirements: {
        oversMin: scaledOvers,
        perfectBallsNeeded: perfects
      },
      completed: false,
      attemptsCount: 0,
      lastAttemptStatus: "NONE",
      arena: "Sovereign Obelisk Grid",
      category: "Practice",
      objectivesText,
      targetSkill: targetSkill.name,
      questWeight: 1,
      questTier: difficulty,
      questScore: 100,
      bonusXp: 15,
      lastModified: new Date().toISOString()
    };
  }

  static generateWeeklyQuest(weekIndex: number, playerLevel: number, skills: any[]): CustomQuest {
    const targetSkill = skills[weekIndex % skills.length] || { id: "s1", name: "LEG BREAK" };
    const difficulty = weekIndex % 3 === 0 ? "MONARCH" : "CHALLENGING";

    const scaledOvers = (difficulty === "CHALLENGING" ? 6 : 8) + Math.floor(playerLevel / 8);
    const wickets = (difficulty === "CHALLENGING" ? 4 : 6) + Math.floor(playerLevel / 15);
    const runsLimit = (difficulty === "CHALLENGING" ? 24 : 20) + Math.floor(playerLevel / 4);

    const rewardsXp = 800 + Math.floor(playerLevel * 20) + (weekIndex * 10);
    const rewardsMastery = 1600 + Math.floor(playerLevel * 45) + (weekIndex * 20);

    const title = `Weekly Siege: Elite ${targetSkill.name} Campaign [Week ${weekIndex + 1}]`;
    const objectivesText = `Take ${wickets} wickets and concede less than ${runsLimit} runs across a ${scaledOvers}-over spell in Dungeon Matches.`;

    return {
      id: `q-built-weekly-${weekIndex}`,
      skillId: targetSkill.id,
      skillName: targetSkill.name,
      name: title,
      description: `WEEKLY CAMPAIGN CONTRACT: Engage in a prolonged multi-over spell with ${targetSkill.name}. Restrict runs to at most ${runsLimit} and break down defense lines to claim ${wickets} wickets.`,
      difficulty,
      xpReward: rewardsXp,
      masteryReward: rewardsMastery,
      type: "DUNGEON_MATCH",
      requirements: {
        oversMin: scaledOvers,
        wicketsNeeded: wickets,
        runsMaxLte: runsLimit
      },
      completed: false,
      attemptsCount: 0,
      lastAttemptStatus: "NONE",
      arena: "Match Dungeon Arena",
      category: "Challenge",
      objectivesText,
      targetSkill: targetSkill.name,
      questWeight: 3,
      questTier: difficulty,
      questScore: 500,
      bonusXp: 100,
      lastModified: new Date().toISOString()
    };
  }

  // Pre-parse the raw text into potential quests with status (Duplicate, Invalid, etc.)
  static parseBulkQuestsText(text: string): {
    readyQuests: any[];
    skippedQuests: Array<{ title: string; reason: string; rawBlock: string }>;
  } {
    const existingQuests = this.getQuests();
    const readyQuests: any[] = [];
    const skippedQuests: Array<{ title: string; reason: string; rawBlock: string }> = [];

    // Split text by lines, grouping them by non-empty blocks.
    const rawLines = text.split("\n");
    const blocks: string[][] = [];
    let currentBlock: string[] = [];

    rawLines.forEach((rawLine) => {
      const line = rawLine.trim();
      // Separators or empty lines denote end of a block
      if (line === "" || line === "---") {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      } else {
        currentBlock.push(rawLine); // Keep original spacing or line
      }
    });
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    blocks.forEach((blockLines) => {
      let title = "";
      let description = "";
      let category = "";
      let arena = "";
      let mode = "";
      let overs = "";
      let skillName = "";
      let difficulty = "";

      // Parse fields
      blockLines.forEach((rawLine) => {
        const line = rawLine.trim();
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim().toLowerCase();
          const val = line.substring(colonIdx + 1).trim();

          switch (key) {
            case "title":
              title = val;
              break;
            case "description":
            case "desc":
              description = val;
              break;
            case "category":
              category = val;
              break;
            case "arena":
              arena = val;
              break;
            case "mode":
              mode = val;
              break;
            case "overs":
              overs = val;
              break;
            case "skill":
            case "targetskill":
            case "target_skill":
              skillName = val;
              break;
            case "difficulty":
              difficulty = val;
              break;
          }
        } else {
          // Fallback parsing: if we see lines without colons, first line is Title
          if (!title) {
            title = line;
          } else if (!description) {
            description = line;
          }
        }
      });

      const rawBlockText = blockLines.join("\n");

      // Validation
      if (!title) {
        skippedQuests.push({
          title: "Unknown Title",
          reason: "Missing Title",
          rawBlock: rawBlockText
        });
        return;
      }

      if (!description) {
        skippedQuests.push({
          title,
          reason: "Missing Description",
          rawBlock: rawBlockText
        });
        return;
      }

      // Check for Duplicate (compare Title + Description, case-insensitive, trimmed)
      const isDuplicate = existingQuests.some(
        (q) =>
          q.name.trim().toLowerCase() === title.trim().toLowerCase() &&
          q.description.trim().toLowerCase() === description.trim().toLowerCase()
      );

      if (isDuplicate) {
        skippedQuests.push({
          title,
          reason: "Duplicate Quest",
          rawBlock: rawBlockText
        });
        return;
      }

      // Map intelligent defaults:
      // If Overs is missing, store it as "Any"
      let finalOvers: number | string = "Any";
      if (overs) {
        const parsedOvers = parseInt(overs, 10);
        if (!isNaN(parsedOvers)) {
          finalOvers = parsedOvers;
        }
      }

      // If Mode is missing, store it as "General"
      const finalMode = mode || "General";

      // If Skill is missing, store it as "Universal"
      const finalSkill = skillName || "Universal";

      // If Category is missing, default to Practice
      const finalCategory = category || "Practice";

      // If Arena is missing, default to Evolution Chamber
      const finalArena = arena || "Evolution Chamber";

      // Difficulty mapping or guessing
      let finalDiff = (difficulty || "MEDIUM").toUpperCase();
      if (!["EASY", "MEDIUM", "CHALLENGING", "MONARCH"].includes(finalDiff)) {
        // Smart difficulty guessing from text
        const combinedText = (title + " " + description).toLowerCase();
        if (combinedText.includes("monarch") || combinedText.includes("supreme") || combinedText.includes("sovereign") || combinedText.includes("extreme")) {
          finalDiff = "MONARCH";
        } else if (combinedText.includes("challenge") || combinedText.includes("challenging") || combinedText.includes("hard") || combinedText.includes("difficult")) {
          finalDiff = "CHALLENGING";
        } else if (combinedText.includes("easy") || combinedText.includes("simple") || combinedText.includes("initiate")) {
          finalDiff = "EASY";
        } else {
          finalDiff = "MEDIUM";
        }
      }

      readyQuests.push({
        title,
        description,
        category: finalCategory,
        arena: finalArena,
        mode: finalMode,
        overs: finalOvers,
        targetSkill: finalSkill,
        difficulty: finalDiff,
        objectivesText: description, // Default objectives to description
        rawBlock: rawBlockText
      });
    });

    return { readyQuests, skippedQuests };
  }

  // Bulk Add Quests from pasted text
  static bulkAddQuests(text: string): { count: number; questsAdded: CustomQuest[] } {
    const parsed = this.parseBulkQuestsText(text);
    const questsAdded: CustomQuest[] = [];

    parsed.readyQuests.forEach((qData) => {
      const newQuest = this.upsertQuest({
        title: qData.title,
        description: qData.description,
        category: qData.category,
        arena: qData.arena,
        overs: qData.overs,
        targetSkill: qData.targetSkill,
        difficulty: qData.difficulty,
        objectivesText: qData.objectivesText,
        mode: qData.mode
      });
      questsAdded.push(newQuest);
    });

    return {
      count: questsAdded.length,
      questsAdded
    };
  }

  // Pre-parse raw text into potential pressure scenarios with status
  static parseBulkPressureScenariosText(text: string): {
    readyScenarios: any[];
    skippedScenarios: Array<{ title: string; reason: string; rawBlock: string }>;
  } {
    const existingScenarios = this.getPressureScenarios();
    const readyScenarios: any[] = [];
    const skippedScenarios: Array<{ title: string; reason: string; rawBlock: string }> = [];

    // Split text by '---'
    const rawBlocks = text.split("---").map(b => b.trim()).filter(b => b.length > 0);

    rawBlocks.forEach((rawBlockText) => {
      const blockLines = rawBlockText.split("\n");
      
      let scenarioName = "";
      let story = "";
      let overs = "";
      let difficulty = "";
      let runsToDefend = "";
      let targetWickets = "";
      let pitch = "";
      let weather = "";
      let battingTeamStyle = "";
      let fieldRestrictions = "";
      let specialMatchEventsRaw = "";
      let objectives = "";

      let currentKey = "";
      blockLines.forEach((rawLine) => {
        const line = rawLine.trim();
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const rawKey = line.substring(0, colonIdx).trim().toLowerCase();
          const rawValue = line.substring(colonIdx + 1).trim();

          switch (rawKey) {
            case "scenario name":
            case "name":
              scenarioName = rawValue;
              currentKey = "scenarioName";
              break;
            case "story":
            case "description":
            case "desc":
              story = rawValue;
              currentKey = "story";
              break;
            case "overs remaining":
            case "overs":
            case "overslimit":
              overs = rawValue;
              currentKey = "overs";
              break;
            case "difficulty":
            case "diff":
              difficulty = rawValue;
              currentKey = "difficulty";
              break;
            case "runs to defend":
            case "runs":
            case "runslimit":
              runsToDefend = rawValue;
              currentKey = "runsToDefend";
              break;
            case "target wickets":
            case "wickets":
            case "wicketstarget":
              targetWickets = rawValue;
              currentKey = "targetWickets";
              break;
            case "pitch surface":
            case "pitch":
              pitch = rawValue;
              currentKey = "pitch";
              break;
            case "weather":
              weather = rawValue;
              currentKey = "weather";
              break;
            case "batting strategy":
            case "batting team style":
            case "batting style":
              battingTeamStyle = rawValue;
              currentKey = "battingTeamStyle";
              break;
            case "field restrictions":
            case "field":
              fieldRestrictions = rawValue;
              currentKey = "fieldRestrictions";
              break;
            case "special match events":
            case "special events":
              specialMatchEventsRaw = rawValue;
              currentKey = "specialMatchEvents";
              break;
            case "scenario objective":
            case "objective":
            case "objectives":
              objectives = rawValue;
              currentKey = "objectives";
              break;
            default:
              currentKey = "";
          }
        } else {
          const trimmedLine = line.trim();
          if (currentKey && trimmedLine) {
            if (currentKey === "scenarioName") {
              scenarioName += (scenarioName ? " " : "") + trimmedLine;
            } else if (currentKey === "story") {
              story += (story ? "\n" : "") + trimmedLine;
            } else if (currentKey === "pitch") {
              pitch += (pitch ? " " : "") + trimmedLine;
            } else if (currentKey === "weather") {
              weather += (weather ? " " : "") + trimmedLine;
            } else if (currentKey === "battingTeamStyle") {
              battingTeamStyle += (battingTeamStyle ? " " : "") + trimmedLine;
            } else if (currentKey === "fieldRestrictions") {
              fieldRestrictions += (fieldRestrictions ? " " : "") + trimmedLine;
            } else if (currentKey === "specialMatchEvents") {
              specialMatchEventsRaw += (specialMatchEventsRaw ? "\n" : "") + trimmedLine;
            } else if (currentKey === "objectives") {
              objectives += (objectives ? "\n" : "") + trimmedLine;
            }
          }
        }
      });

      // Validation
      if (!scenarioName.trim()) {
        skippedScenarios.push({
          title: "Unknown Scenario Name",
          reason: "Missing Scenario Name",
          rawBlock: rawBlockText
        });
        return;
      }

      if (!story.trim()) {
        skippedScenarios.push({
          title: scenarioName,
          reason: "Missing Story/Description",
          rawBlock: rawBlockText
        });
        return;
      }

      // Check for Duplicate (compare name or story case-insensitive)
      const isDuplicate = existingScenarios.some(
        (s) =>
          s.scenarioName.trim().toLowerCase() === scenarioName.trim().toLowerCase() ||
          s.story.trim().toLowerCase() === story.trim().toLowerCase()
      );

      if (isDuplicate) {
        skippedScenarios.push({
          title: scenarioName,
          reason: "Duplicate Scenario",
          rawBlock: rawBlockText
        });
        return;
      }

      // Parse fields with defaults
      let finalOvers = 2;
      const parsedOvers = parseInt(overs, 10);
      if (!isNaN(parsedOvers) && parsedOvers > 0) {
        finalOvers = parsedOvers;
      }

      let finalRuns = 15;
      const parsedRuns = parseInt(runsToDefend, 10);
      if (!isNaN(parsedRuns) && parsedRuns > 0) {
        finalRuns = parsedRuns;
      }

      let finalWickets = 2;
      const parsedWickets = parseInt(targetWickets, 10);
      if (!isNaN(parsedWickets) && parsedWickets >= 0) {
        finalWickets = parsedWickets;
      }

      let finalDiff: "EASY" | "MEDIUM" | "DIFFICULT" | "EXTREME" = "MEDIUM";
      const upperDiff = difficulty.toUpperCase().trim();
      if (upperDiff.includes("EASY")) finalDiff = "EASY";
      else if (upperDiff.includes("MEDIUM")) finalDiff = "MEDIUM";
      else if (upperDiff.includes("DIFFICULT") || upperDiff.includes("CHALLENGING") || upperDiff.includes("HARD")) finalDiff = "DIFFICULT";
      else if (upperDiff.includes("EXTREME") || upperDiff.includes("MONARCH")) finalDiff = "EXTREME";

      const finalPitch = pitch || "Dry Pitch";
      const finalWeather = weather || "Sunny";
      const finalBatting = battingTeamStyle || "Standard";
      const finalField = fieldRestrictions || "Standard";
      const finalObjectives = objectives || story;

      let specialMatchEventsArr: string[] = [];
      if (specialMatchEventsRaw) {
        const rawParts = specialMatchEventsRaw.split(/[,\n]+/);
        specialMatchEventsArr = rawParts.map(p => p.trim()).filter(p => p.length > 0);
      }

      readyScenarios.push({
        scenarioName,
        story,
        overs: finalOvers,
        difficulty: finalDiff,
        runsToDefend: finalRuns,
        targetWickets: finalWickets,
        pitch: finalPitch,
        weather: finalWeather,
        battingTeamStyle: finalBatting,
        fieldRestrictions: finalField,
        specialMatchEvents: specialMatchEventsArr,
        objectives: finalObjectives,
        rawBlock: rawBlockText
      });
    });

    return { readyScenarios, skippedScenarios };
  }

  // Bulk Add Pressure Scenarios from pasted text
  static bulkAddPressureScenarios(text: string): { count: number; scenariosAdded: PressureScenarioData[] } {
    const parsed = this.parseBulkPressureScenariosText(text);
    const scenariosAdded: PressureScenarioData[] = [];

    parsed.readyScenarios.forEach((scData) => {
      const newScenario = this.upsertPressureScenario(scData);
      scenariosAdded.push(newScenario);
    });

    return {
      count: scenariosAdded.length,
      scenariosAdded
    };
  }

  // Import / Merge database JSON
  static importBackup(backupJsonStr: string, mode: "MERGE" | "REPLACE"): boolean {
    try {
      const data = JSON.parse(backupJsonStr);
      if (!data) return false;

      // Verify structure
      const importedQuests = data.quests || [];
      const importedPressure = data.pressureScenarios || [];

      if (mode === "REPLACE") {
        if (Array.isArray(importedQuests)) {
          this.saveQuests(importedQuests);
        }
        if (Array.isArray(importedPressure)) {
          this.savePressureScenarios(importedPressure);
        }
      } else {
        // MERGE: Keep unique IDs
        const existingQuests = this.getQuests();
        importedQuests.forEach((iq: any) => {
          if (iq && iq.id) {
            const idx = existingQuests.findIndex((q) => q.id === iq.id);
            if (idx >= 0) {
              existingQuests[idx] = iq;
            } else {
              existingQuests.push(iq);
            }
          }
        });
        this.saveQuests(existingQuests);

        const existingPressure = this.getPressureScenarios();
        importedPressure.forEach((ip: any) => {
          if (ip && ip.scenarioId) {
            const idx = existingPressure.findIndex((s) => s.scenarioId === ip.scenarioId);
            if (idx >= 0) {
              existingPressure[idx] = ip;
            } else {
              existingPressure.push(ip);
            }
          }
        });
        this.savePressureScenarios(existingPressure);
      }
      return true;
    } catch (e) {
      console.error("Backup file parsing failed:", e);
      return false;
    }
  }

  // Export full JSON string
  static exportBackupString(): string {
    const payload = {
      quests: this.getQuests(),
      pressureScenarios: this.getPressureScenarios(),
      exportedAt: new Date().toISOString(),
      system: "Monarch Spinner Database"
    };
    return JSON.stringify(payload, null, 2);
  }

  // Helper to convert data to CSV
  static convertToCSV(dataList: any[], headers: string[]): string {
    const headerLine = headers.join(",");
    const rows = dataList.map((item) => {
      return headers.map((header) => {
        let val = item[header];
        if (val === undefined || val === null) return '""';
        if (typeof val === "object") {
          val = JSON.stringify(val);
        }
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(",");
    });
    return [headerLine, ...rows].join("\n");
  }
}
