/**
 * questBulkCompiler.ts - Pure bulk-quest text compiler (single authoritative parser).
 *
 * Free of the React app module graph (../App) so the compiler can be unit-tested
 * in isolation. QuestDatabaseManager.parseBulkQuestsText delegates here; there is
 * exactly ONE parser implementation shared by the class and the tests.
 */
import { PracticeQuest } from "../types";
import {
  getQuestSuccessTarget,
  getLegacyQualifyingCondition,
  normalizeQuestDefinition,
  validateQuestDefinition,
  parseQualifyingConditionPhrase,
  parseFailureConditionPhrase
} from "./questCore";
import type { CustomQuest } from "./questDatabaseManager";

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
  toBeExecuted?: number | string;
  totalBalls?: number | string;
  requiredSuccesses?: number | string;
  successCondition?: string;
  earlyCompletion?: boolean | string;
  failureCondition?: string;
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

  const result: CustomQuest = {
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

  // ------------------------------------------------------------------
  // Canonical structured quest logic (AUTHORITATIVE). Explicit structured
  // fields win over any inferred value. If an explicit field is absent, the
  // compiler falls back to a deterministic legacy mapping (never text.).)
  // ------------------------------------------------------------------
  const parseNum = (v: number | string | undefined): number => {
    if (v === undefined || v === "") return 0;
    const n = Number(v);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  // "Absent" vs "explicitly supplied 0" must be distinguished: an explicitly
  // supplied 0 is a malformed requirement the validator must reject — it may
  // NEVER be silently replaced by a derived value (e.g. Overs × 6).
  const parseExplicit = (v: number | string | undefined): number => {
    if (v === undefined || v === "") return -1; // -1 = field absent
    const n = Number(v);
    return isNaN(n) ? -1 : Math.max(0, n);
  };

  const explicitExecutionRequired = parseNum(questData.toBeExecuted);
  const explicitTotalBalls = parseExplicit(questData.totalBalls);
  const explicitRequiredSuccesses = parseExplicit(questData.requiredSuccesses);

  // Legacy keys extracted deterministically from the objectives script (they
  // are explicit-ish numbers, not free-text guessing).
  const legacyTarget = Number(
    parsedReqs.targetSuccessCount ||
    parsedReqs.perfectBallsNeeded ||
    parsedReqs.closeOrBetterNeeded ||
    parsedReqs.dotBallsNeeded ||
    parsedReqs.wicketsNeeded ||
    parsedReqs.consecutivePerfectBalls ||
    0
  );

  // Success condition: explicit phrase wins; legacy deterministic mapping second.
  const successCondition =
    parseQualifyingConditionPhrase(questData.successCondition) ||
    getLegacyQualifyingCondition(parsedReqs);
  const failureCondition =
    parseFailureConditionPhrase(questData.failureCondition) || "WINDOW_EXHAUSTED";

  let earlyCompletion = true;
  if (questData.earlyCompletion !== undefined) {
    if (typeof questData.earlyCompletion === "boolean") {
      earlyCompletion = questData.earlyCompletion;
    } else {
      const t = String(questData.earlyCompletion).trim().toLowerCase();
      earlyCompletion = !(t === "no" || t === "false" || t === "0" || t === "disabled");
    }
  }

  // The execution requirement (To Be Executed) is the number of deliveries
  // that must be assessed via the EXECUTED/MISSED mechanism. It is NOT the
  // success count. If absent (legacy) no execution gate is enforced (0).
  const executionRequired = explicitExecutionRequired;

  // Success target: explicit Required Successes wins; legacy target fallback.
  // An explicitly supplied 0 (or negative) stays 0 so validation rejects it.
  let successTarget = 0;
  if (explicitRequiredSuccesses > 0) {
    successTarget = explicitRequiredSuccesses;
  } else if (explicitRequiredSuccesses === 0) {
    successTarget = 0; // explicitly malformed — the validator must reject it
  } else {
    successTarget = legacyTarget > 0 ? legacyTarget : explicitExecutionRequired;
  }

  let totalBalls = 0;
  if (explicitTotalBalls > 0) {
    totalBalls = explicitTotalBalls; // Explicit Total Balls is authoritative — NEVER replaced with Overs * 6
  } else if (explicitTotalBalls === 0) {
    totalBalls = 0; // explicitly malformed — the validator must reject it
  } else if (typeof overs === "number" && overs > 0) {
    totalBalls = overs * 6;
  } else if (successTarget > 0) {
    totalBalls = successTarget * 3;
  } else {
    totalBalls = 6;
  }
  if (isNaN(totalBalls) || totalBalls <= 0) {
    totalBalls = typeof overs === "number" && overs > 0 ? overs * 6 : 6;
  }

  const maxOvers = typeof overs === "number" && overs > 0 ? overs : Math.max(1, Math.ceil(totalBalls / 6));
  const validReqKeys = Object.keys(parsedReqs).filter(
    (k) => k !== "oversMin" && k !== "noWidesOrNoBalls" &&
      parsedReqs[k] !== undefined && parsedReqs[k] !== false && Number(parsedReqs[k] ?? 0) > 0
  );
  const qualCount = validReqKeys.length;
  const completionRule: "TOTAL_SUCCESSES" | "PER_OVER" | "MULTI_CONDITION" =
    qualCount > 1 ? "MULTI_CONDITION" : "TOTAL_SUCCESSES";

  const canonical: CustomQuest = {
    ...result,
    targetSuccessCount: successTarget,
    maxBalls: totalBalls,
    maximumAttempts: totalBalls,
    maximumOvers: maxOvers,
    oversLength: maxOvers,
    completionRule,
    totalBalls,
    executionRequired,
    successTarget,
    qualifyingCondition: successCondition ?? undefined,
    earlyCompletion,
    failureCondition,
    requirements: {
      ...result.requirements,
      oversMin: maxOvers !== 0 ? maxOvers : result.requirements.oversMin,
      targetSuccessCount: successTarget,
      maxBalls: totalBalls,
      totalBalls,
      executionRequired,
      successTarget,
      qualifyingCondition: successCondition ?? undefined,
      earlyCompletion,
      failureCondition
    }
  };

  return normalizeQuestDefinition(canonical) as CustomQuest;
}

// ------------------------------------------------------------------
// PURE BULK QUEST COMPILER
// ------------------------------------------------------------------
// RAW BULK TEXT
//   -> detect recognized top-level field
//   -> collect all lines belonging to that field
//   -> stop when the NEXT recognized top-level field begins
//   -> normalize
//   -> validate
//   -> compile quest
//
// Blank lines are NEVER quest separators and "Ball N:" is never a quest
// boundary - both are ordinary Description content.
export function parseBulkQuestsTextCore(
  text: string,
  existingQuests: any[]
): {
  readyQuests: any[];
  skippedQuests: Array<{ title: string; reason: string; rawBlock: string }>;
} {
    const readyQuests: any[] = [];
    const skippedQuests: Array<{ title: string; reason: string; rawBlock: string }> = [];

    // A quest starts only at a top-level Title header. Blank lines are valid
    // Description formatting (including between Ball 1..6 instructions).
    const rawLines = text.split("\n");
    const blocks: string[][] = [];
    let currentBlock: string[] = [];

    rawLines.forEach((rawLine) => {
      const line = rawLine.trim();
      const isTitleHeader = /^title\s*:/i.test(line);
      if (isTitleHeader && currentBlock.some((existingLine) => /^title\s*:/i.test(existingLine.trim()))) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      } else if (line === "---") {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
        return;
      }
      currentBlock.push(rawLine); // Preserve whitespace and blank lines.
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
      let toBeExecuted = "";
      let totalBalls = "";
      let requiredSuccesses = "";
      let successCondition = "";
      let earlyCompletion = "";
      let failureCondition = "";
      let currentField = "";
      const knownFields = new Set([
        "title", "description", "desc", "category", "arena", "mode", "overs", "skill", "targetskill", "target_skill",
        "difficulty", "to be executed", "tobeexecuted", "to_be_executed", "total balls", "totalballs", "total_balls",
        "required successes", "requiredsuccesses", "required_successes", "success condition", "successcondition", "success_condition",
        "early completion", "earlycompletion", "early_completion", "failure condition", "failurecondition", "failure_condition"
      ]);

      // Parse fields
      blockLines.forEach((rawLine) => {
        const line = rawLine.trim();
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim().toLowerCase();
          const val = line.substring(colonIdx + 1).trim();

          // Colons inside Description (e.g. "Ball 1:") are content, not
          // headers. Only the explicit schema headers change field context.
          if (!knownFields.has(key)) {
            if (currentField === "description") description += `${description ? "\n" : ""}${rawLine}`;
            return;
          }
          currentField = key === "desc" ? "description" : key;

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
            case "to be executed":
            case "tobeexecuted":
            case "to_be_executed":
              toBeExecuted = val;
              break;
            case "total balls":
            case "totalballs":
            case "total_balls":
              totalBalls = val;
              break;
            case "required successes":
            case "requiredsuccesses":
            case "required_successes":
              requiredSuccesses = val;
              break;
            case "success condition":
            case "successcondition":
            case "success_condition":
              successCondition = val;
              break;
            case "early completion":
            case "earlycompletion":
            case "early_completion":
              earlyCompletion = val;
              break;
            case "failure condition":
            case "failurecondition":
            case "failure_condition":
              failureCondition = val;
              break;
          }
        } else {
          if (currentField === "description") {
            description += `${description ? "\n" : ""}${rawLine}`;
            return;
          }
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

      // Validate the structured record before it becomes ready to ingest.
      // An invalid quest (e.g. to-be-executed > total balls) must be reported,
      // never silently saved or auto-SUCCESS.
      let validationErrors: string[] = [];
      let validationOk = true;
      try {
        const compiled = analyzeAndGenerateQuest({
          title,
          description,
          category: finalCategory as "Practice" | "Challenge" | "Monarch" | "Training",
          arena: finalArena,
          overs: finalOvers,
          targetSkill: finalSkill,
          difficulty: finalDiff as "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH",
          objectivesText: description, // Default objectives to description
          mode: finalMode,
          toBeExecuted: toBeExecuted !== "" ? toBeExecuted : undefined,
          totalBalls: totalBalls !== "" ? totalBalls : undefined,
          requiredSuccesses: requiredSuccesses !== "" ? requiredSuccesses : undefined,
          successCondition: successCondition !== "" ? successCondition : undefined,
          earlyCompletion: earlyCompletion !== "" ? earlyCompletion : undefined,
          failureCondition: failureCondition !== "" ? failureCondition : undefined
        });
        validationErrors = validateQuestDefinition(compiled);
        validationOk = validationErrors.length === 0;
      } catch {
        validationErrors = ["Invalid quest record (unexpected error during compilation)."];
        validationOk = false;
      }

      if (!validationOk) {
        skippedQuests.push({
          title,
          reason: `Invalid Quest: ${validationErrors[0] || "compile failed"}`,
          rawBlock: rawBlockText
        });
        return;
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
        toBeExecuted: toBeExecuted !== "" ? toBeExecuted : undefined,
        totalBalls: totalBalls !== "" ? totalBalls : undefined,
        requiredSuccesses: requiredSuccesses !== "" ? requiredSuccesses : undefined,
        successCondition: successCondition !== "" ? successCondition : undefined,
        earlyCompletion: earlyCompletion !== "" ? earlyCompletion : undefined,
        failureCondition: failureCondition !== "" ? failureCondition : undefined,
        rawBlock: rawBlockText
      });
    });

    return { readyQuests, skippedQuests };
}
