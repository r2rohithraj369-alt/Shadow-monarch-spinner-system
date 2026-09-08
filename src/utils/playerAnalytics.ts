/**
 * playerAnalytics.ts — Authoritative single source of truth for the
 * Probability Engine and Ascension Chamber analytics.
 *
 * Every metric is derived ONLY from real stored player data.
 * No Math.random(). No fabricated coefficients. No decorative percentages.
 *
 * When a metric cannot be calculated because the underlying data is
 * insufficient, the value is `null` and `insufficientData` is true so the
 * UI can render "Insufficient historical data" instead of a fake number.
 */

import { DungeonRecord, SkillItem, Attribute } from "../types";

export interface SessionCounts {
  perfect: number;
  close: number;
  justShort: number;
  short: number;
  fullToss: number;
  dots: number;
  runs: number;
  totalDeliveries?: number;
  [k: string]: any;
}

export interface LoggedSessionLike {
  counts: SessionCounts;
  questStatus?: { questId: string; met: boolean; failures: string[]; reason?: string };
  executionHistory?: Array<{ result: "EXECUTED" | "MISSED" }>;
  timestamp: string;
  [k: string]: any;
}

export interface EvolutionHistoryEntry {
  id: string;
  skillId?: string;
  skillName?: string;
  trialId?: string;
  trialName?: string;
  xpReward?: number;
  masteryReward?: number;
  skillLevelAtCompletion?: number;
  timestamp?: string;
  [k: string]: any;
}

export interface PlayerLike {
  level: number;
  xp: number;
  efficiency?: number;
  probabilityOfNextStatus?: number;
  lifetimePracticeQuests?: number;
  lifetimeEvolutionSessions?: number;
  lifetimeMatchDungeons?: number;
  lifetimePressureChambers?: number;
  lifetimeEvolutionTrials?: number;
  lifetimeSkillEvolutions?: number;
  lifetimeMatchVictories?: number;
  lifetimeDotBalls?: number;
  lifetimeWickets?: number;
  lifetimeDeliveriesBowled?: number;
  lifetimePerfectDeliveries?: number;
  lifetimeXpEarned?: number;
  lifetimeSkillXp?: number;
  lifetimePlayerXp?: number;
  [k: string]: any;
}

/** Input bundle for analytics computation — everything is real stored data. */
export interface PlayerAnalyticsSources {
  player: PlayerLike;
  skills: SkillItem[];
  attributes: Attribute[];
  dungeons: DungeonRecord[];
  chamberSessions: LoggedSessionLike[];
  evolutionHistory: EvolutionHistoryEntry[];
  practiceQuests: any[];
  completedQuestIds: string[];
  failedQuestIds: string[];
}

/** A metric value paired with the real evidence that supports it. */
export interface AnalyticsMetric {
  value: number | null;
  explanation: string[];
  insufficientData: boolean;
}

export interface AnalyticsRaw {
  totalChamberSessions: number;
  totalMatchDungeons: number;
  lifetimeTrials: number;
  totalDeliveries: number;
  perfectDeliveries: number;
  closeDeliveries: number;
  shortDeliveries: number;
  fullTossDeliveries: number;
  totalRuns: number;
  totalWickets: number;
  totalDots: number;
  totalBoundaries: number;
  totalExtras: number;
  avgEconomy: number;
  recentSessions: LoggedSessionLike[];
}

/** All metrics produced by the Probability Engine. */
export interface PlayerAnalytics {
  currentSuccessProbability: AnalyticsMetric;
  accuracyPrediction: AnalyticsMetric;
  estimatedEconomy: AnalyticsMetric;
  boundaryRisk: AnalyticsMetric;
  controlStability: AnalyticsMetric;
  flightEfficiency: AnalyticsMetric;
  turnPotential: AnalyticsMetric;
  driftConfidence: AnalyticsMetric;
  pressureRating: AnalyticsMetric;
  consistencyScore: AnalyticsMetric;
  confidenceMeter: AnalyticsMetric;
  currentForm: AnalyticsMetric;
  strongestAttribute: AnalyticsMetric;
  weakestAttribute: AnalyticsMetric;
  predictedDaysToNextStatus: AnalyticsMetric;
  raw: AnalyticsRaw;
}

/** Shared empty-counts fallback so optional/partial session records never
 *  short out the aggregator. */
const EMPTY_COUNTS: LoggedSessionLike["counts"] = {
  perfect: 0,
  close: 0,
  justShort: 0,
  short: 0,
  fullToss: 0,
  dots: 0,
  runs: 0,
  wickets: 0,
  totalDeliveries: 0,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const clamp0100 = (v: number) => Math.round(clamp01(v) * 100);

/** Build an AnalyticsMetric from a nullable value + explanations. */
function metric(value: number | null, explanations: string[]): AnalyticsMetric {
  return { value, explanation: explanations, insufficientData: value === null };
}

/** Aggregate chamber-session delivery counts. */
function aggregateSessionMetrics(sessions: LoggedSessionLike[]) {
  let perfect = 0, close = 0, justShort = 0, short = 0, fullToss = 0;
  let dots = 0, runs = 0, wickets = 0, boundaries = 0, extras = 0, total = 0;
  let executed = 0, missed = 0;
  for (const s of sessions) {
    const c = s.counts;
    perfect += c.perfect || 0;
    close += c.close || 0;
    justShort += c.justShort || 0;
    short += c.short || 0;
    fullToss += c.fullToss || 0;
    dots += c.dots || 0;
    runs += c.runs || 0;
    wickets += c.wickets || 0;
    total += (c.totalDeliveries || 0);
    // boundaries not tracked in chamber counts; derive from runs proxy
    if (s.executionHistory) {
      for (const e of s.executionHistory) {
        if (e.result === "EXECUTED") executed++;
        else if (e.result === "MISSED") missed++;
      }
    }
  }
  return {
    perfect, close, justShort, short, fullToss, dots, runs, wickets,
    boundaries, extras, total, executed, missed,
  };
}

/** Mean of an array. */
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Sample standard deviation. */
function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

/** Minimal local copy of rank → level mapping (mirrors ForecastEngine ALL_RANKS). */
const ALL_RANKS_SIMPLE = [
  { rank: "E-Rank", levelNeeded: 1 },
  { rank: "D-Rank", levelNeeded: 5 },
  { rank: "C-Rank", levelNeeded: 12 },
  { rank: "B-Rank", levelNeeded: 22 },
  { rank: "A-Rank", levelNeeded: 35 },
  { rank: "S-Rank", levelNeeded: 50 },
  { rank: "SS-Rank", levelNeeded: 70 },
  { rank: "SSS-Rank", levelNeeded: 90 },
  { rank: "Shadow Monarch", levelNeeded: 100 },
  { rank: "Frost Shadow Monarch", levelNeeded: 110 },
  { rank: "Iron Shadow Monarch", levelNeeded: 120 },
  { rank: "Feral Shadow Monarch", levelNeeded: 130 },
  { rank: "Plague Shadow Monarch", levelNeeded: 145 },
  { rank: "Flame Shadow Monarch", levelNeeded: 160 },
  { rank: "Abyssal Shadow Monarch", levelNeeded: 180 },
  { rank: "Absolute Shadow Monarch", levelNeeded: 200 },
];

/**
 * Compute all player analytics from real stored data only.
 */
export function computePlayerAnalytics(sources: PlayerAnalyticsSources): PlayerAnalytics {
  const { player, skills, attributes, dungeons, chamberSessions, evolutionHistory } = sources;

  const agg = aggregateSessionMetrics(chamberSessions);
  const sessionCount = chamberSessions.length;
  const matchCount = dungeons.length;
  const trialCount = evolutionHistory.length;
  const totalDeliveries = agg.total || player.lifetimeDeliveriesBowled || 0;
  const perfectDeliveries = agg.perfect || player.lifetimePerfectDeliveries || 0;

  // ---- Current Success Probability ----
  const chamberQualifyingRate = totalDeliveries > 0
    ? (perfectDeliveries / totalDeliveries) * 100
    : null;
  const questCompleted = player.lifetimePracticeQuests || sources.completedQuestIds.length || 0;
  const questFailed = sources.failedQuestIds.length || 0;
  const questTotal = questCompleted + questFailed;
  const questSuccessRate = questTotal > 0 ? (questCompleted / questTotal) * 100 : null;

  const successProbExplanations: string[] = [];
  let successProb: number | null = null;
  if (chamberQualifyingRate !== null && questSuccessRate !== null) {
    successProb = clamp0100(chamberQualifyingRate * 0.6 + questSuccessRate * 0.4);
    successProbExplanations.push(
      `Chamber qualifying rate: ${chamberQualifyingRate.toFixed(1)}% (${perfectDeliveries}/${totalDeliveries} qualifying deliveries).`,
      `Quest success rate: ${questSuccessRate.toFixed(1)}% (${questCompleted} completed of ${questTotal} assessed).`,
    );
  } else if (chamberQualifyingRate !== null) {
    successProb = clamp0100(chamberQualifyingRate);
    successProbExplanations.push(`Chamber qualifying rate: ${chamberQualifyingRate.toFixed(1)}% (${perfectDeliveries}/${totalDeliveries} qualifying deliveries).`);
  } else if (questSuccessRate !== null) {
    successProb = clamp0100(questSuccessRate);
    successProbExplanations.push(`Quest success rate: ${questSuccessRate.toFixed(1)}% (${questCompleted} completed of ${questTotal} assessed).`);
  } else {
    successProbExplanations.push("No quest or chamber session data recorded yet.");
  }
  const currentSuccessProbability: AnalyticsMetric = metric(successProb, successProbExplanations);

  // ---- Accuracy Prediction ----
  const accurateDeliveries = (agg.perfect || 0) + (agg.close || 0);
  const accuracy = totalDeliveries > 0
    ? clamp0100((accurateDeliveries / totalDeliveries) * 100)
    : null;
  const accuracyExplanations = totalDeliveries > 0
    ? [`${accurateDeliveries} accurate (Perfect+Close) of ${totalDeliveries} total deliveries.`]
    : ["No delivery data recorded. Complete Evolution Chamber sessions to build accuracy statistics."];
  const accuracyPrediction: AnalyticsMetric = metric(accuracy, accuracyExplanations);

  // ---- Estimated Economy ----
  const totalOvers = dungeons.reduce((s, d) => s + (d.overs || 0), 0);
  const totalRuns = dungeons.reduce((s, d) => s + (d.runs || 0), 0);
  const economy = totalOvers > 0 ? Number((totalRuns / totalOvers).toFixed(2)) : null;
  const economyExplanations = totalOvers > 0
    ? [`${totalRuns} runs conceded across ${totalOvers.toFixed(1)} overs in ${dungeons.length} match${dungeons.length !== 1 ? "es" : ""}.`]
    : ["No match dungeon records found. Complete Match Dungeons to build economy statistics."];
  const estimatedEconomy: AnalyticsMetric = metric(economy, economyExplanations);

  // ---- Boundary Risk ----
  const dungeonDeliveries = dungeons.reduce((s, d) => s + ((d.overs || 0) * 6), 0);
  const boundaryRiskValue = dungeonDeliveries > 0 && totalRuns > 0
    ? clamp0100((dungeons.reduce((s, d) => s + (d.boundaries || 0), 0) / dungeonDeliveries) * 100)
    : null;
  const boundaryExplanations = dungeonDeliveries > 0
        ? [`${dungeons.reduce((s, d) => s + (d.boundaries || 0), 0)} boundaries in ${dungeonDeliveries.toFixed(0)} recorded deliveries.`]
    : ["Insufficient match data to assess boundary risk."];
  const boundaryRisk: AnalyticsMetric = metric(boundaryRiskValue, boundaryExplanations);

  // ---- Control Stability ----
  const perSessionRates = chamberSessions
    .map((s) => {
      const c = s.counts;
      const p = c.perfect || 0;
      const t = c.totalDeliveries || 0;
      return t > 0 ? p / t : -1;
    })
    .filter((r) => r >= 0);
  let controlStabilityValue: number | null = null;
  const controlExplanations: string[] = [];
  if (perSessionRates.length >= 3) {
    const cv = stdDev(perSessionRates) / (mean(perSessionRates) || 1);
    controlStabilityValue = clamp0100(100 - cv * 100);
    controlExplanations.push(
      `Stability across ${perSessionRates.length} sessions (CV of qualifying rate = ${cv.toFixed(3)}).`,
      "Lower variation between sessions yields higher stability.",
    );
  } else {
    controlExplanations.push(`Only ${perSessionRates.length} chamber session${perSessionRates.length !== 1 ? "s" : ""} recorded — need ≥3 for stability measurement.`);
  }
  const controlStability: AnalyticsMetric = metric(controlStabilityValue, controlExplanations);

  // ---- Attribute-derived metrics ----
  const attrByName = (name: string) => attributes.find((a) => a.name.toLowerCase() === name.toLowerCase());
  const flightAttr = attrByName("Flight");
  const driftAttr = attrByName("Drift");
  const revAttr = attrByName("Revolutions");
  const pressureAttr = attrByName("Pressure Handling");

  const flightEfficiency: AnalyticsMetric = flightAttr && flightAttr.value !== undefined
    ? { value: clamp0100(flightAttr.value), explanation: [`Flight attribute: ${flightAttr.value.toFixed(1)}.`], insufficientData: false }
    : { value: null, explanation: ["No Flight attribute data."], insufficientData: true };

  const turnPotential: AnalyticsMetric = driftAttr && driftAttr.value !== undefined
    ? { value: clamp0100(driftAttr.value), explanation: [`Drift attribute: ${driftAttr.value.toFixed(1)}.`], insufficientData: false }
    : { value: null, explanation: ["No Drift attribute data."], insufficientData: true };

  const driftConfidence: AnalyticsMetric = revAttr && revAttr.value !== undefined
    ? { value: clamp0100(revAttr.value), explanation: [`Revolutions attribute: ${revAttr.value.toFixed(1)}.`], insufficientData: false }
    : { value: null, explanation: ["No Revolutions attribute data."], insufficientData: true };

  const pressureRating: AnalyticsMetric = pressureAttr && pressureAttr.value !== undefined
    ? {
        value: clamp0100(pressureAttr.value),
        explanation: [
          `Pressure Handling attribute: ${pressureAttr.value.toFixed(1)}.`,
          `Trend: ${pressureAttr.trend || "steady"}.`,
        ],
        insufficientData: false,
      }
    : { value: null, explanation: ["No Pressure Handling attribute data."], insufficientData: true };

  // ---- Consistency Score ----
  let consistencyScore: number | null = null;
  const consistencyExplanations: string[] = [];
  if (perSessionRates.length >= 3) {
    const cv = stdDev(perSessionRates) / (mean(perSessionRates) || 1);
    consistencyScore = clamp0100(100 - cv * 100);
    consistencyExplanations.push(
      `Consistency derived from ${perSessionRates.length} sessions (lower CV = more consistent).`,
      `Coefficient of variation: ${cv.toFixed(3)}.`,
    );
  } else {
    consistencyExplanations.push(`Need ≥3 sessions for consistency measurement (${perSessionRates.length} found).`);
  }
  const consistencyMetric: AnalyticsMetric = metric(consistencyScore, consistencyExplanations);

  // ---- Confidence Meter ----
  const dataPoints = sessionCount + matchCount + trialCount;
  let confidenceMeter: number | null = null;
  const confidenceExplanations: string[] = [];
  if (dataPoints >= 5) {
    const allTimestamps = [
      ...chamberSessions.map((s) => s.timestamp),
      ...dungeons.map((d) => d.timestamp || ""),
      ...evolutionHistory.map((e) => e.timestamp || ""),
    ].filter((t) => !!t);
    const recentCount = allTimestamps.length;
    confidenceMeter = clamp0100(Math.min(100, Math.round(dataPoints * 8 + recentCount)));
    confidenceExplanations.push(
      `${dataPoints} data points across ${recentCount} recorded events.`,
      "More historical events increase prediction reliability.",
    );
  } else {
    confidenceExplanations.push(`Only ${dataPoints} data points recorded — need ≥5 for reliable confidence.`);
  }
  const confidenceMetric: AnalyticsMetric = metric(confidenceMeter, confidenceExplanations);

  // ---- Current Form ----
  let currentForm: number | null = null;
  const formExplanations: string[] = [];
  if (chamberSessions.length >= 2) {
    const sorted = [...chamberSessions].sort((a, b) => (a.timestamp || "") > (b.timestamp || "") ? -1 : 1);
    const recent = sorted.slice(0, 3);
    const prior = sorted.slice(3, 6);
    const recentRate = mean(
      recent.map((s) => {
        const c = s.counts;
        return c.totalDeliveries ? (c.perfect || 0) / c.totalDeliveries : 0;
      }),
    ) * 100;
    if (prior.length > 0) {
      const priorRate = mean(
        prior.map((s) => {
          const c = s.counts;
          return c.totalDeliveries ? (c.perfect || 0) / c.totalDeliveries : 0;
        }),
      ) * 100;
      currentForm = clamp0100(recentRate * 0.7 + priorRate * 0.3);
      formExplanations.push(
        `Recent ${recent.length} sessions: ${recentRate.toFixed(1)}% qualifying.`,
        `Prior ${prior.length} sessions: ${priorRate.toFixed(1)}% qualifying.`,
      );
    } else {
      currentForm = clamp0100(recentRate);
      formExplanations.push(`Recent ${recent.length} sessions: ${recentRate.toFixed(1)}% qualifying. Insufficient prior data for trend.`);
    }
  } else {
    formExplanations.push("Need ≥2 sessions to assess current form.");
  }
  const formMetric: AnalyticsMetric = metric(currentForm, formExplanations);

  // ---- Strongest / Weakest Attribute ----
  const rankedAttrs = attributes
    .filter((a) => a.value !== undefined)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  const strongest = rankedAttrs[0];
  const weakest = rankedAttrs[rankedAttrs.length - 1];
  const strongestAttribute: AnalyticsMetric = strongest
    ? { value: clamp0100(strongest.value || 0), explanation: [`Strongest attribute: ${strongest.name} (${(strongest.value || 0).toFixed(1)}).`], insufficientData: false }
    : { value: null, explanation: ["No attribute data."], insufficientData: true };
  const weakestAttribute: AnalyticsMetric = weakest
    ? { value: clamp0100(weakest.value || 0), explanation: [`Weakest attribute: ${weakest.name} (${(weakest.value || 0).toFixed(1)}).`], insufficientData: false }
    : { value: null, explanation: ["No attribute data."], insufficientData: true };

  // ---- Predicted Days to Next Status ----
  const rankInfo = ALL_RANKS_SIMPLE.find((r) => r.rank === (player.nextStatus || ""));
  const targetLevel = rankInfo ? rankInfo.levelNeeded : player.level + 4;
  let predictedDays: number | null = null;
  const predictedExplanations: string[] = [];
  if (player.level >= targetLevel) {
    predictedDays = 0;
    predictedExplanations.push(`Already at/above target level ${targetLevel}.`);
  } else if (agg.total > 0 && sessionCount > 0) {
    const dailyRate = Math.max(0.4, (agg.perfect + agg.close) / Math.max(1, sessionCount) / 10);
    predictedDays = Math.ceil((targetLevel - player.level) / dailyRate);
    predictedExplanations.push(`Based on ${sessionCount} sessions, ~${dailyRate.toFixed(2)} levels/day trajectory.`);
  } else {
    predictedExplanations.push("Insufficient session data to predict timeline.");
  }
  const predictedDaysToNextStatus: AnalyticsMetric =
    predictedDays !== null
      ? { value: predictedDays, explanation: predictedExplanations, insufficientData: false }
      : { value: null, explanation: predictedExplanations, insufficientData: true };

  // ---- Raw Aggregates ----
  const raw: AnalyticsRaw = {
    totalChamberSessions: sessionCount,
    totalMatchDungeons: matchCount,
    lifetimeTrials: trialCount,
    totalDeliveries: agg.total + (player.lifetimeDeliveriesBowled || 0),
    perfectDeliveries: agg.perfect + (player.lifetimePerfectDeliveries || 0),
    closeDeliveries: agg.close,
    shortDeliveries: agg.short,
    fullTossDeliveries: agg.fullToss,
    totalRuns: agg.runs + dungeons.reduce((s, d) => s + d.runs, 0),
    totalWickets: agg.wickets + dungeons.reduce((s, d) => s + d.wickets, 0),
    totalDots: agg.dots + dungeons.reduce((s, d) => s + d.dotBalls, 0),
    totalBoundaries: dungeons.reduce((s, d) => s + d.boundaries, 0),
    totalExtras: agg.extras,
    avgEconomy: matchCount > 0
      ? Number((dungeons.reduce((s, d) => s + d.economy, 0) / matchCount).toFixed(2))
      : 0,
    recentSessions: chamberSessions.slice(-5),
  };

  return {
    currentSuccessProbability,
    accuracyPrediction,
    estimatedEconomy,
    boundaryRisk,
    controlStability,
    flightEfficiency,
    turnPotential,
    driftConfidence,
    pressureRating,
    consistencyScore: consistencyMetric,
    confidenceMeter: confidenceMetric,
    currentForm: formMetric,
    strongestAttribute,
    weakestAttribute,
    predictedDaysToNextStatus,
    raw,
  };
}
