import { Attribute, DungeonRecord } from "../types";

export type AttributeName =
  | "Accuracy"
  | "Control"
  | "Consistency"
  | "Economy"
  | "Pressure Handling"
  | "Flight"
  | "Drift"
  | "Revolutions"
  | "Bounce"
  | "Variation"
  | "Deception"
  | "Dominance"
  | "Resilience"
  | "Arcane Mastery";

export interface AttributeIdentity {
  name: AttributeName;
  color: string;
  glow: string;
  border: string;
  bg: string;
  description: string;
}

export interface TrainingAttributeInput {
  oversCount: number;
  ballsLoggedCount: number;
  perfectBallsCount: number;
  combatEfficiency: number;
  selectedDrill: string;
  isMatchSim?: boolean;
  runsConceded?: number;
  wicketsTaken?: number;
  widesCount?: number;
  noBallsCount?: number;
  dotsCount?: number;
  balls?: any[];
  pressureScenarioSuccess?: boolean;
}

type GainMap = Partial<Record<AttributeName, { gain: number; contributors: Record<string, number> }>>;

export const ATTRIBUTE_IDENTITIES: AttributeIdentity[] = [
  {
    name: "Accuracy",
    color: "text-blue-400",
    glow: "shadow-[0_0_18px_rgba(59,130,246,0.28)]",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    description: "Landing precision from perfect balls, close balls, target hits, and low release error."
  },
  {
    name: "Control",
    color: "text-orange-400",
    glow: "shadow-[0_0_18px_rgba(251,146,60,0.26)]",
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
    description: "Line, length, release stability, and discipline against wides, no-balls, short balls, and full tosses."
  },
  {
    name: "Consistency",
    color: "text-emerald-400",
    glow: "shadow-[0_0_18px_rgba(52,211,153,0.24)]",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    description: "Repeatability across complete overs, longer spells, and consecutive quality deliveries."
  },
  {
    name: "Economy",
    color: "text-yellow-400",
    glow: "shadow-[0_0_18px_rgba(250,204,21,0.24)]",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    description: "Run restriction from dot balls, low economy, boundary prevention, and match control."
  },
  {
    name: "Pressure Handling",
    color: "text-red-400",
    glow: "shadow-[0_0_18px_rgba(248,113,113,0.25)]",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    description: "Composure in pressure chambers, close simulations, final overs, and recovery moments."
  },
  {
    name: "Flight",
    color: "text-cyan-400",
    glow: "shadow-[0_0_18px_rgba(34,211,238,0.25)]",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    description: "Arc, dip, and air-time mastery from flighted deliveries and flight-heavy variations."
  },
  {
    name: "Drift",
    color: "text-violet-400",
    glow: "shadow-[0_0_18px_rgba(167,139,250,0.27)]",
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    description: "Lateral movement in the air from drift-based skills, wind simulations, and angled releases."
  },
  {
    name: "Revolutions",
    color: "text-amber-400",
    glow: "shadow-[0_0_18px_rgba(251,191,36,0.25)]",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    description: "Spin energy from wrist snap, rev-heavy deliveries, and rotation-focused skill use."
  },
  {
    name: "Bounce",
    color: "text-pink-400",
    glow: "shadow-[0_0_18px_rgba(244,114,182,0.25)]",
    border: "border-pink-500/30",
    bg: "bg-pink-500/10",
    description: "Vertical threat from top spin, bounce drills, high kick, and low skid variation outcomes."
  },
  {
    name: "Variation",
    color: "text-fuchsia-400",
    glow: "shadow-[0_0_18px_rgba(232,121,249,0.25)]",
    border: "border-fuchsia-500/30",
    bg: "bg-fuchsia-500/10",
    description: "Switching between different deliveries and adapting the spell plan under live conditions."
  },
  {
    name: "Deception",
    color: "text-indigo-400",
    glow: "shadow-[0_0_18px_rgba(129,140,248,0.27)]",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    description: "Disguise, false reads, wrong-footing batters, and wicket-taking surprise."
  },
  {
    name: "Dominance",
    color: "text-rose-400",
    glow: "shadow-[0_0_18px_rgba(251,113,133,0.26)]",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    description: "Wickets, maidens, MVP spells, long control, and high threat-elimination performances."
  },
  {
    name: "Resilience",
    color: "text-green-400",
    glow: "shadow-[0_0_18px_rgba(74,222,128,0.24)]",
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    description: "Workload tolerance, recovery after boundaries, long spells, and repeated simulations."
  },
  {
    name: "Arcane Mastery",
    color: "text-white",
    glow: "shadow-[0_0_22px_rgba(196,181,253,0.35)]",
    border: "border-purple-300/40",
    bg: "bg-purple-300/10",
    description: "Overall mastery calculated from every other live attribute."
  }
];

const identityByName = new Map(ATTRIBUTE_IDENTITIES.map((item) => [item.name.toUpperCase(), item]));
const skillAttributeMap: Record<string, AttributeName[]> = {
  "LEG BREAK": ["Flight", "Drift", "Revolutions", "Control"],
  GOOGLY: ["Deception", "Variation", "Control", "Drift"],
  SLIDER: ["Accuracy", "Control", "Economy", "Drift"],
  FLIPPER: ["Bounce", "Accuracy", "Economy", "Flight"],
  "TOP SPINNER": ["Bounce", "Flight", "Revolutions"],
  "3 FINGER FAST BALL": ["Control", "Dominance", "Economy", "Pressure Handling"]
};

function clamp(value: number) {
  return Math.max(0, Math.min(1000, Number(value.toFixed(2))));
}

function getRank(value: number) {
  if (value >= 900) return "Sovereign";
  if (value >= 750) return "S-Rank";
  if (value >= 600) return "A-Rank";
  if (value >= 450) return "B-Rank";
  if (value >= 300) return "C-Rank";
  if (value >= 150) return "D-Rank";
  return "E-Rank";
}

function addGain(gains: GainMap, name: AttributeName, gain: number, contributors: Record<string, number>) {
  if (name === "Arcane Mastery" || gain <= 0) return;
  const existing = gains[name] || { gain: 0, contributors: {} };
  Object.entries(contributors).forEach(([key, value]) => {
    existing.contributors[key] = (existing.contributors[key] || 0) + value;
  });
  existing.gain += gain;
  gains[name] = existing;
}

function qualityStreak(balls: any[]) {
  let max = 0;
  let current = 0;
  balls.forEach((ball) => {
    if (["Perfect Ball", "Close Ball", "Good Length"].includes(ball.length)) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  });
  return max;
}

function uniqueSkillNames(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value).toUpperCase())));
}

function applySkillUsage(gains: GainMap, skillName: string, usage: number, multiplier = 0.02) {
  const targets = skillAttributeMap[skillName.toUpperCase()] || ["Variation"];
  targets.forEach((target) => {
    addGain(gains, target, usage * multiplier, { [`${skillName} usage`]: usage });
  });
}

export class AttributeEngine {
  static getIdentity(name: string) {
    return identityByName.get(name.toUpperCase()) || ATTRIBUTE_IDENTITIES[0];
  }

  static createInitialAttributes(): Attribute[] {
    return ATTRIBUTE_IDENTITIES.map((identity, index) => {
      const value = identity.name === "Arcane Mastery" ? 4 : Math.max(1, 12 - index);
      return {
        name: identity.name,
        value,
        growthRate: "+0.0%",
        trend: "steady",
        description: identity.description,
        rank: getRank(value),
        highestEver: value,
        lowestEver: value,
        todayGain: 0,
        weeklyGain: 0,
        monthlyGain: 0,
        lifetimeGain: 0,
        lastSessionGain: 0,
        recentSource: "Initial profile calibration",
        contributors: {},
        history: []
      };
    });
  }

  static ensureCompleteAttributes(attributes: Attribute[] = []): Attribute[] {
    const byName = new Map(attributes.map((attr) => [attr.name.toUpperCase(), attr]));
    return ATTRIBUTE_IDENTITIES.map((identity) => {
      const existing = byName.get(identity.name.toUpperCase());
      const value = existing ? clamp(Number(existing.value || 0)) : (identity.name === "Arcane Mastery" ? 4 : 1);
      return {
        ...existing,
        name: identity.name,
        value,
        growthRate: existing?.growthRate || "+0.0%",
        trend: existing?.trend || "steady",
        description: identity.description,
        rank: getRank(value),
        highestEver: Math.max(existing?.highestEver ?? value, value),
        lowestEver: Math.min(existing?.lowestEver ?? value, value),
        todayGain: existing?.todayGain || 0,
        weeklyGain: existing?.weeklyGain || 0,
        monthlyGain: existing?.monthlyGain || 0,
        lifetimeGain: existing?.lifetimeGain || 0,
        lastSessionGain: existing?.lastSessionGain || 0,
        recentSource: existing?.recentSource || "Profile restored",
        contributors: existing?.contributors || {},
        history: existing?.history || []
      };
    });
  }

  static applyTrainingSession(attributes: Attribute[], report: TrainingAttributeInput): Attribute[] {
    const balls = report.balls || [];
    const gains: GainMap = {};
    const perfects = report.perfectBallsCount || 0;
    const close = balls.filter((ball) => ball.length === "Close Ball").length;
    const poorLength = balls.filter((ball) => ball.length === "Short Ball" || ball.length === "Full Toss").length;
    const wides = report.widesCount || 0;
    const noBalls = report.noBallsCount || 0;
    const dots = report.dotsCount || 0;
    const wickets = report.wicketsTaken || 0;
    const boundaries = balls.filter((ball) => Number(ball.runsConceded || 0) >= 4).length;
    const isPressure = report.selectedDrill.startsWith("Pressure Chamber");
    const skillNames = uniqueSkillNames(balls.map((ball) => ball.skillName));

    addGain(gains, "Accuracy", perfects * 0.04 + close * 0.02, { "Perfect Balls": perfects, "Close Balls": close });
    addGain(gains, "Control", perfects * 0.03 + Math.max(0, 0.08 - (wides + noBalls) * 0.03) + (poorLength <= 1 ? 0.05 : 0), { "Perfect Balls": perfects, "Release faults avoided": Math.max(0, balls.length - wides - noBalls - poorLength) });
    addGain(gains, "Consistency", qualityStreak(balls) * 0.02 + Math.max(0, report.oversCount - 4) * 0.03, { "Best quality streak": qualityStreak(balls), "Overs completed": report.oversCount });
    addGain(gains, "Economy", report.isMatchSim ? Math.max(0, 0.18 - ((report.runsConceded || 0) / Math.max(1, report.oversCount)) * 0.02) + dots * 0.01 : dots * 0.02, { "Dot balls": dots, "Runs conceded": report.runsConceded || 0 });
    addGain(gains, "Pressure Handling", (isPressure ? 0.15 : 0) + (report.pressureScenarioSuccess ? 0.12 : 0) + (boundaries > 0 && report.combatEfficiency >= 75 ? 0.08 : 0), { "Pressure chamber": isPressure ? 1 : 0, "Pressure success": report.pressureScenarioSuccess ? 1 : 0 });
    addGain(gains, "Dominance", wickets * 0.08 + (report.combatEfficiency >= 85 ? 0.1 : 0), { Wickets: wickets, "Elite efficiency": report.combatEfficiency >= 85 ? 1 : 0 });
    addGain(gains, "Resilience", Math.max(0, report.oversCount - 3) * 0.03 + (boundaries > 0 ? 0.04 : 0), { "Long spell overs": report.oversCount, "Boundary recovery": boundaries });
    addGain(gains, "Variation", skillNames.length * 0.04, { "Different deliveries used": skillNames.length });

    skillNames.forEach((skillName) => {
      const usage = balls.filter((ball) => ball.skillName?.toUpperCase() === skillName).length;
      applySkillUsage(gains, skillName, usage);
    });

    return this.applyGains(attributes, gains, report.selectedDrill || "Evolution Chamber session");
  }

  static applyDungeonSession(attributes: Attribute[], record: DungeonRecord): Attribute[] {
    const gains: GainMap = {};
    const economy = record.economy || record.runs / Math.max(1, record.overs);
    const variations = uniqueSkillNames(record.variationsUsed || []);
    const wickets = record.wickets || 0;
    const dots = record.dotBalls || 0;
    const boundaries = record.boundaries || 0;
    const threat = record.threatEliminationScore || 0;

    addGain(gains, "Accuracy", (threat > 80 ? 0.12 : 0) + dots * 0.01, { "Threat score": threat, "Dot balls": dots });
    addGain(gains, "Control", Math.max(0, 0.16 - economy * 0.015) + (record.runs < 15 ? 0.08 : 0), { Economy: Number(economy.toFixed(2)), "Runs conceded": record.runs });
    addGain(gains, "Consistency", dots * 0.012 + Math.max(0, record.overs - 4) * 0.025, { "Dot balls": dots, Overs: record.overs });
    addGain(gains, "Economy", Math.max(0, 0.24 - economy * 0.025) + (boundaries <= 1 ? 0.12 : 0), { Economy: Number(economy.toFixed(2)), "Boundaries prevented": Math.max(0, 6 - boundaries) });
    addGain(gains, "Pressure Handling", (threat > 85 ? 0.15 : 0) + wickets * 0.03, { "Threat score": threat, Wickets: wickets });
    addGain(gains, "Dominance", wickets * 0.08 + (record.maidenOvers || 0) * 0.1 + threat * 0.002, { Wickets: wickets, "Maiden overs": record.maidenOvers || 0, "Threat score": threat });
    addGain(gains, "Resilience", Math.max(0, record.overs - 3) * 0.04 + boundaries * 0.02, { Overs: record.overs, "Boundary recovery": boundaries });
    addGain(gains, "Variation", variations.length * 0.06, { "Different deliveries used": variations.length });
    variations.forEach((skillName) => applySkillUsage(gains, skillName, 1, 0.1));

    const deceptiveWickets = record.wicketsBreakdown?.filter((wicket) => /googly|slider|flipper|wrong|decept/i.test(`${wicket.skillName || ""} ${wicket.bowlerSkillApplied || ""} ${wicket.dismissalType || ""}`)).length || 0;
    addGain(gains, "Deception", deceptiveWickets * 0.08, { "Deceptive wickets": deceptiveWickets });

    return this.applyGains(attributes, gains, `Match Dungeon: ${record.matchName}`);
  }

  private static applyGains(attributes: Attribute[], gains: GainMap, source: string): Attribute[] {
    const date = new Date().toISOString();
    const normalized = this.ensureCompleteAttributes(attributes);
    const updated = normalized.map((attr) => {
      if (attr.name === "Arcane Mastery") return attr;
      const gainData = gains[attr.name as AttributeName];
      const gain = clamp(gainData?.gain || 0);
      const value = clamp(attr.value + gain);
      const history = gain > 0
        ? [
            {
              id: `attr-${Date.now()}-${attr.name.replace(/\s+/g, "-")}`,
              date,
              source,
              gain,
              value,
              contributors: gainData?.contributors || {}
            },
            ...(attr.history || [])
          ].slice(0, 100)
        : attr.history || [];

      return {
        ...attr,
        value,
        rank: getRank(value),
        highestEver: Math.max(attr.highestEver ?? value, value),
        lowestEver: Math.min(attr.lowestEver ?? value, value),
        growthRate: gain > 0 ? `+${gain.toFixed(2)}` : "+0.0%",
        trend: gain > 0 ? "ascending" : attr.trend,
        lastSessionGain: gain,
        todayGain: clamp((attr.todayGain || 0) + gain),
        weeklyGain: clamp((attr.weeklyGain || 0) + gain),
        monthlyGain: clamp((attr.monthlyGain || 0) + gain),
        lifetimeGain: clamp((attr.lifetimeGain || 0) + gain),
        recentSource: gain > 0 ? source : attr.recentSource,
        contributors: {
          ...(attr.contributors || {}),
          ...(gainData?.contributors || {})
        },
        history
      };
    });

    const nonArcane = updated.filter((attr) => attr.name !== "Arcane Mastery");
    const arcaneValue = clamp(nonArcane.reduce((sum, attr) => sum + attr.value, 0) / Math.max(1, nonArcane.length));
    return updated.map((attr) => {
      if (attr.name !== "Arcane Mastery") return attr;
      const gain = clamp(Math.max(0, arcaneValue - attr.value));
      return {
        ...attr,
        value: arcaneValue,
        rank: getRank(arcaneValue),
        highestEver: Math.max(attr.highestEver ?? arcaneValue, arcaneValue),
        lowestEver: Math.min(attr.lowestEver ?? arcaneValue, arcaneValue),
        growthRate: gain > 0 ? `+${gain.toFixed(2)}` : "+0.0%",
        lastSessionGain: gain,
        todayGain: clamp((attr.todayGain || 0) + gain),
        weeklyGain: clamp((attr.weeklyGain || 0) + gain),
        monthlyGain: clamp((attr.monthlyGain || 0) + gain),
        lifetimeGain: clamp((attr.lifetimeGain || 0) + gain),
        recentSource: "Average of all live attributes",
        history: gain > 0
          ? [
              {
                id: `attr-${Date.now()}-Arcane-Mastery`,
                date,
                source: "Average of all live attributes",
                gain,
                value: arcaneValue,
                contributors: { "Attribute average": nonArcane.length }
              },
              ...(attr.history || [])
            ].slice(0, 100)
          : attr.history || []
      };
    });
  }
}
