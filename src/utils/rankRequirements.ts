export interface RankRequirements {
  rankName: string;
  nextRankName: string;
  proposedTitle: string;
  description: string;
  levelNeeded: number;
  attributesNeeded: {
    Accuracy?: number;
    Control?: number;
    Consistency?: number;
    Economy?: number;
    "Pressure Handling"?: number;
    Flight?: number;
    Drift?: number;
    Revolutions?: number;
    Bounce?: number;
    "Every Attribute"?: number;
    "All Attributes"?: number;
  };
  practiceQuestsNeeded: number;
  evolutionSessionsNeeded: number;
  matchDungeonsNeeded: number;
  pressureChambersNeeded: number;
  skillsCondition: {
    description: string;
    check: (skills: any[]) => boolean;
  };
  evolutionTrialsNeeded: number;
  perfectDeliveriesNeeded?: number;
  dotBallsNeeded?: number;
  wicketsNeeded?: number;
  economyBelowNeeded?: number;
  extraConditions?: {
    description: string;
    check: (player: any, skills: any[], dungeons: any[]) => boolean;
  };
  unlockedFeatures: string;
  unlockedRewards: string;
}

export const RANK_REQUIREMENTS_LIST: RankRequirements[] = [
  {
    rankName: "E-Rank",
    nextRankName: "D-Rank",
    proposedTitle: "The Calibration Novice",
    description: "Establish basic calibration coordinates. Unleash wrist snap mechanics.",
    levelNeeded: 5,
    attributesNeeded: {
      Accuracy: 20,
      Control: 18,
    },
    practiceQuestsNeeded: 12,
    evolutionSessionsNeeded: 4,
    matchDungeonsNeeded: 2,
    pressureChambersNeeded: 2,
    skillsCondition: {
      description: "Any Skill Level 3",
      check: (skills) => skills.some(s => s.level >= 3),
    },
    evolutionTrialsNeeded: 1,
    unlockedFeatures: "D-Rank Practice Quests, Googly Variation",
    unlockedRewards: "Title 'The Calibration Novice', +15 All Attributes",
  },
  {
    rankName: "D-Rank",
    nextRankName: "C-Rank",
    proposedTitle: "The Grid Controller",
    description: "Solidify flight dynamics and trajectory setups.",
    levelNeeded: 12,
    attributesNeeded: {
      Accuracy: 35,
      Control: 30,
      Consistency: 20,
    },
    practiceQuestsNeeded: 30,
    evolutionSessionsNeeded: 10,
    matchDungeonsNeeded: 5,
    pressureChambersNeeded: 6,
    skillsCondition: {
      description: "Two Skills Level 5",
      check: (skills) => skills.filter(s => s.level >= 5).length >= 2,
    },
    evolutionTrialsNeeded: 2,
    unlockedFeatures: "C-Rank Match Dungeons, Top Spinner Variation",
    unlockedRewards: "Title 'The Grid Controller', +15 All Attributes",
  },
  {
    rankName: "C-Rank",
    nextRankName: "B-Rank",
    proposedTitle: "The Deception Adept",
    description: "Perform mid-pitch trajectories and subtle line deceptions.",
    levelNeeded: 22,
    attributesNeeded: {
      Accuracy: 50,
      Control: 45,
      Consistency: 40,
      Economy: 30,
    },
    practiceQuestsNeeded: 60,
    evolutionSessionsNeeded: 22,
    matchDungeonsNeeded: 12,
    pressureChambersNeeded: 15,
    skillsCondition: {
      description: "Three Skills Level 8",
      check: (skills) => skills.filter(s => s.level >= 8).length >= 3,
    },
    evolutionTrialsNeeded: 4,
    unlockedFeatures: "B-Rank Match Dungeons, Slider Variation",
    unlockedRewards: "Title 'The Deception Adept', +15 All Attributes",
  },
  {
    rankName: "B-Rank",
    nextRankName: "A-Rank",
    proposedTitle: "The Trajectory Controller",
    description: "Control lengths under loaded stress and extreme batters setups.",
    levelNeeded: 35,
    attributesNeeded: {
      Accuracy: 65,
      Control: 60,
      Consistency: 55,
      Economy: 50,
      "Pressure Handling": 40,
    },
    practiceQuestsNeeded: 110,
    evolutionSessionsNeeded: 40,
    matchDungeonsNeeded: 22,
    pressureChambersNeeded: 30,
    skillsCondition: {
      description: "Five Skills Level 12",
      check: (skills) => skills.filter(s => s.level >= 12).length >= 5,
    },
    evolutionTrialsNeeded: 8,
    unlockedFeatures: "A-Rank Match Dungeons, Flipper Variation, Pressure Chamber Module",
    unlockedRewards: "Title 'The Trajectory Controller', +15 All Attributes",
  },
  {
    rankName: "A-Rank",
    nextRankName: "S-Rank",
    proposedTitle: "Elite Sovereign Bowler",
    description: "Gain complete mastery over flight trajectory deflection models.",
    levelNeeded: 50,
    attributesNeeded: {
      Accuracy: 78,
      Control: 75,
      Consistency: 72,
      Economy: 70,
      "Pressure Handling": 65,
      Flight: 50,
      Drift: 50,
    },
    practiceQuestsNeeded: 180,
    evolutionSessionsNeeded: 70,
    matchDungeonsNeeded: 40,
    pressureChambersNeeded: 60,
    skillsCondition: {
      description: "Five Skills Level 18",
      check: (skills) => skills.filter(s => s.level >= 18).length >= 5,
    },
    evolutionTrialsNeeded: 12,
    unlockedFeatures: "S-Rank Dungeons, Monarch Arena Challenges",
    unlockedRewards: "Title 'Elite Sovereign Bowler', +15 All Attributes",
  },
  {
    rankName: "S-Rank",
    nextRankName: "SS-Rank",
    proposedTitle: "The Shadow Sentinel",
    description: "Establish elite side spin rates and unbreakable bowling consistency.",
    levelNeeded: 70,
    attributesNeeded: {
      Accuracy: 88,
      Control: 86,
      Consistency: 84,
      Economy: 82,
      "Pressure Handling": 80,
      Flight: 70,
      Drift: 70,
      Revolutions: 65,
    },
    practiceQuestsNeeded: 280,
    evolutionSessionsNeeded: 110,
    matchDungeonsNeeded: 70,
    pressureChambersNeeded: 100,
    skillsCondition: {
      description: "All Core Skills Level 25",
      check: (skills) => skills.every(s => s.level >= 25),
    },
    evolutionTrialsNeeded: 20,
    unlockedFeatures: "SS-Rank Dungeons, Ultimate Endurance Overs",
    unlockedRewards: "Title 'The Shadow Sentinel', +15 All Attributes",
  },
  {
    rankName: "SS-Rank",
    nextRankName: "SSS-Rank",
    proposedTitle: "Absolute Mortal Apex",
    description: "Shatter the boundary of standard spin physics.",
    levelNeeded: 90,
    attributesNeeded: {
      Accuracy: 96,
      Control: 95,
      Consistency: 95,
      Economy: 94,
      "Pressure Handling": 94,
      Flight: 90,
      Drift: 90,
      Revolutions: 90,
      Bounce: 85,
    },
    practiceQuestsNeeded: 420,
    evolutionSessionsNeeded: 180,
    matchDungeonsNeeded: 120,
    pressureChambersNeeded: 170,
    skillsCondition: {
      description: "All Skills Level 35",
      check: (skills) => skills.every(s => s.level >= 35),
    },
    evolutionTrialsNeeded: 25,
    extraConditions: {
      description: "All Evolution Trials Completed",
      check: (player, skills) => skills.every(s => s.trialObjectives && s.trialObjectives.length === 0),
    },
    unlockedFeatures: "SSS-Rank Dungeons, Extreme Pitch Stress Scenarios",
    unlockedRewards: "Title 'Absolute Mortal Apex', +15 All Attributes",
  },
  {
    rankName: "SSS-Rank",
    nextRankName: "Shadow Monarch",
    proposedTitle: "The Shadow Monarch",
    description: "Surpass the physical limits of mortality to command absolute shadows.",
    levelNeeded: 100,
    attributesNeeded: {
      "Every Attribute": 100,
    },
    practiceQuestsNeeded: 650,
    evolutionSessionsNeeded: 300,
    matchDungeonsNeeded: 200,
    pressureChambersNeeded: 300,
    skillsCondition: {
      description: "Every Skill Fully Evolved",
      check: (skills) => skills.every(s => s.rarity === "LEGENDARY"),
    },
    evolutionTrialsNeeded: 35,
    extraConditions: {
      description: "Every Evolution Trial Completed & Final Monarch Trial Completed",
      check: (player, skills) => skills.every(s => s.trialObjectives && s.trialObjectives.length === 0),
    },
    unlockedFeatures: "Shadow Realm Monarch Dungeons, Absolute Sovereign Skills",
    unlockedRewards: "Permanent Display Title 'Shadow Monarch', Dark Cosmic Interface Aura",
  },
  {
    rankName: "Shadow Monarch",
    nextRankName: "Frost Shadow Monarch",
    proposedTitle: "Frost Shadow Sovereign",
    description: "Infuse absolute glacial zero-drift length configurations.",
    levelNeeded: 110,
    attributesNeeded: {
      "All Attributes": 110,
    },
    practiceQuestsNeeded: 850,
    evolutionSessionsNeeded: 380,
    matchDungeonsNeeded: 260,
    pressureChambersNeeded: 380,
    skillsCondition: {
      description: "Every Skill Level 55",
      check: (skills) => skills.every(s => s.level >= 55),
    },
    evolutionTrialsNeeded: 30,
    perfectDeliveriesNeeded: 2500,
    dotBallsNeeded: 1500,
    wicketsNeeded: 300,
    unlockedFeatures: "Glacial Overload Net Drills",
    unlockedRewards: "Title 'Frost Shadow Sovereign', Glacial Frost Aura Effect",
  },
  {
    rankName: "Frost Shadow Monarch",
    nextRankName: "Iron Shadow Monarch",
    proposedTitle: "Iron Shadow Sovereign",
    description: "Establish unbreakable line, length and iron stamina parameters.",
    levelNeeded: 120,
    attributesNeeded: {
      "All Attributes": 120,
    },
    practiceQuestsNeeded: 1050,
    evolutionSessionsNeeded: 470,
    matchDungeonsNeeded: 340,
    pressureChambersNeeded: 470,
    skillsCondition: {
      description: "Every Skill Level 65",
      check: (skills) => skills.every(s => s.level >= 65),
    },
    evolutionTrialsNeeded: 40,
    perfectDeliveriesNeeded: 4000,
    dotBallsNeeded: 2400,
    wicketsNeeded: 500,
    economyBelowNeeded: 5.00,
    extraConditions: {
      description: "Average Dungeon Economy below 5.00",
      check: (player, skills, dungeons) => {
        if (dungeons.length === 0) return false;
        const avgEcon = dungeons.reduce((sum, d) => sum + (d.economy || 0), 0) / dungeons.length;
        return avgEcon < 5.00;
      },
    },
    unlockedFeatures: "Ironclad Stamina Trajectory Stabilizer",
    unlockedRewards: "Title 'Iron Shadow Sovereign', Platinum Defensive Buffs",
  },
  {
    rankName: "Iron Shadow Monarch",
    nextRankName: "Feral Shadow Monarch",
    proposedTitle: "Feral Shadow Sovereign",
    description: "Unleash primal, animalistic strike rates and aggressive angles.",
    levelNeeded: 130,
    attributesNeeded: {
      "All Attributes": 130,
    },
    practiceQuestsNeeded: 1300,
    evolutionSessionsNeeded: 580,
    matchDungeonsNeeded: 450,
    pressureChambersNeeded: 580,
    skillsCondition: {
      description: "Every Skill Level 75",
      check: (skills) => skills.every(s => s.level >= 75),
    },
    evolutionTrialsNeeded: 60,
    perfectDeliveriesNeeded: 6000,
    dotBallsNeeded: 3500,
    wicketsNeeded: 800,
    unlockedFeatures: "Apex Beast Speed Spikes",
    unlockedRewards: "Title 'Feral Shadow Sovereign', Primal Rage Flame Aura",
  },
  {
    rankName: "Feral Shadow Monarch",
    nextRankName: "Plague Shadow Monarch",
    proposedTitle: "Plague Shadow Sovereign",
    description: "Infect strike zones with dark corrosive drift angles.",
    levelNeeded: 145,
    attributesNeeded: {
      "All Attributes": 145,
    },
    practiceQuestsNeeded: 1650,
    evolutionSessionsNeeded: 720,
    matchDungeonsNeeded: 600,
    pressureChambersNeeded: 720,
    skillsCondition: {
      description: "Every Skill Level 85",
      check: (skills) => skills.every(s => s.level >= 85),
    },
    evolutionTrialsNeeded: 100,
    perfectDeliveriesNeeded: 9000,
    dotBallsNeeded: 5000,
    wicketsNeeded: 1200,
    unlockedFeatures: "Corrosive Decay Rotation Vectors",
    unlockedRewards: "Title 'Plague Shadow Sovereign', Toxic Corrosive Aura Particle Effects",
  },
  {
    rankName: "Plague Shadow Monarch",
    nextRankName: "Flame Shadow Monarch",
    proposedTitle: "Flame Shadow Sovereign",
    description: "Trigger catastrophic spectral flame RPM spikes.",
    levelNeeded: 160,
    attributesNeeded: {
      "All Attributes": 160,
    },
    practiceQuestsNeeded: 2000,
    evolutionSessionsNeeded: 900,
    matchDungeonsNeeded: 800,
    pressureChambersNeeded: 900,
    skillsCondition: {
      description: "Every Skill Level 95",
      check: (skills) => skills.every(s => s.level >= 95),
    },
    evolutionTrialsNeeded: 150,
    perfectDeliveriesNeeded: 13000,
    dotBallsNeeded: 7000,
    wicketsNeeded: 1700,
    unlockedFeatures: "Infernal Combustion Overdrive Mode",
    unlockedRewards: "Title 'Flame Shadow Sovereign', Infernal Supernova Sparkles",
  },
  {
    rankName: "Flame Shadow Monarch",
    nextRankName: "Abyssal Shadow Monarch",
    proposedTitle: "Abyssal Shadow Sovereign",
    description: "Annihilate bat coordinates with absolute abyssal void drift.",
    levelNeeded: 180,
    attributesNeeded: {
      "All Attributes": 180,
    },
    practiceQuestsNeeded: 2500,
    evolutionSessionsNeeded: 1150,
    matchDungeonsNeeded: 1050,
    pressureChambersNeeded: 1150,
    skillsCondition: {
      description: "Every Skill Level 110",
      check: (skills) => skills.every(s => s.level >= 110),
    },
    evolutionTrialsNeeded: 250,
    perfectDeliveriesNeeded: 18000,
    dotBallsNeeded: 10000,
    wicketsNeeded: 2500,
    unlockedFeatures: "Dimensional Void Flight Distortions",
    unlockedRewards: "Title 'Abyssal Shadow Sovereign', Dark Cosmic Nebula Aura Effect",
  },
  {
    rankName: "Abyssal Shadow Monarch",
    nextRankName: "Absolute Shadow Monarch",
    proposedTitle: "Absolute Supreme Shadow Monarch",
    description: "Claim absolute cosmic dominion over the entire spin universe.",
    levelNeeded: 200,
    attributesNeeded: {
      "All Attributes": 200,
    },
    practiceQuestsNeeded: 3500,
    evolutionSessionsNeeded: 1500,
    matchDungeonsNeeded: 1500,
    pressureChambersNeeded: 1500,
    skillsCondition: {
      description: "Every Skill Level 150 (Maximum)",
      check: (skills) => skills.every(s => s.level >= 150),
    },
    evolutionTrialsNeeded: 500,
    perfectDeliveriesNeeded: 25000,
    dotBallsNeeded: 15000,
    wicketsNeeded: 4000,
    extraConditions: {
      description: "Complete Every Skill Evolution, Dungeon Type, Pressure Scenario & Quest Category",
      check: (player, skills, dungeons) => {
        return skills.every(s => s.rarity === "LEGENDARY" && s.level >= 150);
      },
    },
    unlockedFeatures: "The Completed Monarch Cosmos",
    unlockedRewards: "Absolute Shadow Monarch Title, Unique Animated Ascension, Golden Mastery Badges",
  }
];

export function getRankRequirements(rank: string): RankRequirements | undefined {
  return RANK_REQUIREMENTS_LIST.find(r => r.rankName.toLowerCase() === rank.toLowerCase());
}
