import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 🌑 API ENDPOINT 1: MONARCH AI SYSTEM REPORT & ANALYSIS
app.post("/api/monarch-ai/analyze", async (req, res) => {
  try {
    const { player, attributes, skills, recentDungeons } = req.body;

    const hasApiKey = !!process.env.GEMINI_API_KEY;
    if (!hasApiKey) {
      // Return high-quality, thematic local/offline system results so the app is immediately fully functional!
      return res.json({
        currentLimiter: "Slider Pitch Consistency",
        recommendedTraining: "Holographic Target Session #4",
        expectedGrowth: "+4.1% Accuracy Gain",
        analysisText: "SYSTEM WARNING: Slider trajectory remains shallow. The rotation lacks dynamic bite. Core target analysis indicates over-reliance on standard Googly setup. Initiate lateral drift drills to stabilize release and break the current level plateau.",
        systemAlert: "CRITICAL: CURRENT LIMITER DISCOVERED IN THE EVOLUTION MATRIX",
        forecastPercent: 78,
        forecastReason: [
          "Control stats surged by +5.2% following recent Session data.",
          "Match experience is sufficient, but high-pressure error rate remains high.",
          "Unlock level threshold requires completing the upcoming Ascension trial."
        ]
      });
    }

    const ai = getAI();
    const prompt = `
      You are the ultimate voice of the MONARCH SYSTEM: an advanced, high-tech, futuristic holographic operating system designed for leg spinners (inspired by Jin-Woo's Solo Leveling system interface, but specifically dedicated to cricket spinners).
      The spinner is Rohith Raj (The Shadow Spinner). He is Level ${player?.level || 12}. Title: ${player?.title || "The Awakened"}. Status: ${player?.currentStatus || "E-Rank"}.

      Analyze his modern attributes:
      ${JSON.stringify(attributes || [])}

      Analyze his current Skill Inventory:
      ${JSON.stringify(skills || [])}

      Analyze his recent Dungeon Records (Matches):
      ${JSON.stringify(recentDungeons || [])}

      State his "Current Limiter" (a specific weakness restricting higher performance), recommended training drills, growth forecasts, and a highly thematic "System Alert" or alert of a critical blocker. Deliver feedback in a cold, high-tech, powerful holographic tone (e.g. 'CORE TARGET IDENTIFIED', 'SYSTEM ANOMALY RESOLVED').

      Respond STRICTLY in JSON according to this schema:
      {
        "currentLimiter": "Brief title of major spin/release weakness",
        "recommendedTraining": "Name of system simulation or elite drill suggested",
        "expectedGrowth": "Percent growth estimated, e.g., '+4.5% Deception'",
        "analysisText": "2-3 sentences of core high-tech holographic coach warning and feedback",
        "systemAlert": "An intimidating, high-tech, capitalized warning title",
        "forecastPercent": average probability integer (0 to 100) of ascending to next status (${player?.nextStatus || "D-Rank"}),
        "forecastReason": ["An array of 3 specific data-driven arguments based on attributes and pitch control indicators"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentLimiter: { type: Type.STRING },
            recommendedTraining: { type: Type.STRING },
            expectedGrowth: { type: Type.STRING },
            analysisText: { type: Type.STRING },
            systemAlert: { type: Type.STRING },
            forecastPercent: { type: Type.INTEGER },
            forecastReason: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["currentLimiter", "recommendedTraining", "expectedGrowth", "analysisText", "systemAlert", "forecastPercent", "forecastReason"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Monarch AI analysis failed:", err);
    res.status(500).json({
      error: "Failed to perform system analysis. Fallback generator active.",
      fallbackData: {
        currentLimiter: "Over Spin Release Angle",
        recommendedTraining: "Shadow Drift Grid Drill",
        expectedGrowth: "+3.5% Arcane Drift",
        analysisText: "The system is running on local fallback energy. Maintain current revs to breach status.",
        systemAlert: "SYSTEM OPERATING IN SAFE MATRIX MODE",
        forecastPercent: 70,
        forecastReason: ["Verify system API key link.", "Review standard drills inside Evolution Chamber."]
      }
    });
  }
});

// 🌑 API ENDPOINT 2: MONARCH DUNGEON (MATCH) EVALUATION REPORT
app.post("/api/monarch-ai/dungeon", async (req, res) => {
  try {
    const { overs, runs, wickets, economy, dotBalls, boundaries, dismissalType, rank, boundariesBreakdown, wicketsBreakdown } = req.body;

    const hasApiKey = !!process.env.GEMINI_API_KEY;
    if (!hasApiKey) {
      let listBoundariesRep = "";
      if (boundariesBreakdown && boundariesBreakdown.length > 0) {
        listBoundariesRep = boundariesBreakdown.map((b: any) => `${b.scoreType === "4" ? "FOUR" : "SIX"} hit on skill "${b.skillName}" to "${b.direction || "deep point"}" due to "${b.rootCause}" (${b.strokeType} stroke)`).join("; ");
      } else {
        listBoundariesRep = `${boundaries} boundaries conceded`;
      }

      let listWicketsRep = "";
      if (wicketsBreakdown && wicketsBreakdown.length > 0) {
        listWicketsRep = wicketsBreakdown.map((w: any) => `${w.dismissalType} taking batsman threat level "${w.batsmanThreat}" using skill "${w.skillName}"`).join("; ");
      } else if (wickets > 0) {
        listWicketsRep = `${wickets} wickets via ${dismissalType}`;
      } else {
        listWicketsRep = "no wickets";
      }

      // Simulated holographic report
      const performanceBonus = (wickets * 20) + (dotBalls * 3) - (runs * 1.5) - (boundaries * 5);
      const score = Math.min(Math.max(Math.round(50 + performanceBonus), 10), 100);

      return res.json({
        threatScore: score,
        aiDebrief: `Dungeon Rank: ${rank || "B"}-Rank. Threat neutralized successfully across ${overs} overs (econ: ${economy}). Targets taken down: ${listWicketsRep}. Boundary release vectors: ${listBoundariesRep || "none"}. Dynamic error lengths diagnostic resolved.`,
        unlockedAuraEffect: score > 80 ? "MONARCH GOLD AURA" : "SHADOW CYAN SPARKS"
      });
    }

    const ai = getAI();
    let boundariesDetailPrompt = "";
    if (boundariesBreakdown && boundariesBreakdown.length > 0) {
      boundariesDetailPrompt = "\nDetailed Conceded Boundaries list:\n" + boundariesBreakdown.map((b: any, index: number) => `  ${index + 1}. Hit: ${b.scoreType === "4" ? "FOUR" : "SIX"} runs | Skill used: ${b.skillName} | Field direction: ${b.direction || "deep mid wicket"} | Root cause of failure: ${b.rootCause} | Stroke played: ${b.strokeType}`).join("\n");
    }
    
    let wicketsDetailPrompt = "";
    if (wicketsBreakdown && wicketsBreakdown.length > 0) {
      wicketsDetailPrompt = "\nDetailed Dismissed Defenders (Wickets) list:\n" + wicketsBreakdown.map((w: any, index: number) => `  ${index + 1}. Dismissal: ${w.dismissalType} | Skill used: ${w.skillName} | Batter Level (threat): ${w.batsmanThreat}`).join("\n");
    }

    const prompt = `
      Evaluate a completed Match Dungeon of Rank "${rank || "B"}-Rank".
      Stats logged:
      - Overs bowled: ${overs}
      - Runs conceded: ${runs}
      - Wickets taken: ${wickets} (Econ: ${economy})
      - Dot balls: ${dotBalls}
      - Boundaries conceded total count: ${boundaries}
      ${wicketsDetailPrompt}
      ${boundariesDetailPrompt}

      Act as the MONARCH SYSTEM intelligence core. Assess the Threat Elimination efficiency, compute a dynamic 'threatScore' (between 10 and 100), and write a cold, powerful 'aiDebrief' summarizing physical spin metrics, tactics used, and a training directive.

      Respond STRICTLY in JSON according to this schema:
      {
        "threatScore": calculated integer (10-100),
        "aiDebrief": "3 sentences of futuristic assessment using terminology like target lock, RPM spikes, drift vectors, fending off batters.",
        "unlockedAuraEffect": "A 2-3 word high-tech visual holographic aura unlocked, e.g., 'Monarch Gold Glow' or 'Void Purple Discharge'"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatScore: { type: Type.INTEGER },
            aiDebrief: { type: Type.STRING },
            unlockedAuraEffect: { type: Type.STRING }
          },
          required: ["threatScore", "aiDebrief", "unlockedAuraEffect"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Dungeon report generation failed:", err);
    res.status(500).json({
      error: "Dungeon analysis grid offline. Local calculation mode activated.",
      threatScore: 60,
      aiDebrief: "Dungeon conquered. Local sensors evaluated 3 wickets with sufficient rotation metrics. Stabilize length to maximize elimination scores.",
      unlockedAuraEffect: "STANDARD BLUE AURA"
    });
  }
});

// 🌑 API ENDPOINT 3: DYNAMIC CREATIVE QUESTS GENERATOR
interface DrillTemplate {
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

interface QuestDatabase {
  templates: DrillTemplate[];
  recentlyUsedIds: number[];
}

function getDatabase(): QuestDatabase {
  const dbPath = path.join(process.cwd(), "server_quest_db.json");
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read server_quest_db.json:", err);
  }
  return { templates: [], recentlyUsedIds: [] };
}

function saveDatabase(db: QuestDatabase) {
  const dbPath = path.join(process.cwd(), "server_quest_db.json");
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write server_quest_db.json:", err);
  }
}

function combineRequirements(selectedTemplates: DrillTemplate[], difficulty: string) {
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

  // Balance values if multiple drills are integrated
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

app.post("/api/monarch-ai/generate-quest", async (req, res) => {
  const { category, difficulty, skillId, skillName, playerRank, playerLevel, customTheme } = req.body;
  const sName = (skillName || "LEG BREAK").toUpperCase();
  const diffUpper = (difficulty || "CHALLENGING").toUpperCase() as "EASY" | "MEDIUM" | "CHALLENGING" | "MONARCH";

  try {
    const db = getDatabase();
    const templates = db.templates && db.templates.length > 0 ? db.templates : [];
    let recentlyUsed = db.recentlyUsedIds || [];

    // Filter templates that have not been recently used
    let available = templates.filter(t => !recentlyUsed.includes(t.id));

    // If we run low on available templates, crop/clear recently used list to maintain variety
    if (available.length < 15) {
      recentlyUsed = recentlyUsed.slice(Math.max(0, recentlyUsed.length - 15));
      available = templates.filter(t => !recentlyUsed.includes(t.id));
    }

    // Determine number of drills based on difficulty
    let drillCount = 1;
    if (diffUpper === "MEDIUM") {
      drillCount = Math.random() < 0.5 ? 1 : 2;
    } else if (diffUpper === "CHALLENGING") {
      drillCount = 2;
    } else if (diffUpper === "MONARCH") {
      drillCount = Math.random() < 0.4 ? 2 : 3;
    }

    // Shuffle available and pick drillCount templates
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const selectedTemplates = shuffled.slice(0, Math.min(shuffled.length, drillCount));

    // Update recentlyUsed list
    selectedTemplates.forEach(t => {
      recentlyUsed.push(t.id);
    });
    // Limit recentlyUsed length to around 35 so templates can rotate back
    if (recentlyUsed.length > 35) {
      recentlyUsed = recentlyUsed.slice(recentlyUsed.length - 35);
    }

    db.recentlyUsedIds = recentlyUsed;
    saveDatabase(db);

    // Pools for procedurally generating Arena, Theme, Rewards
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

    const THEMES = [
      "Shadow Monarch Ascent",
      "Absolute Sovereign Dominion",
      "Iron Vanguard Defiance",
      "Glacial Spike Compression",
      "Abyssal Maw Trajectory",
      "Runic Eclipse Calibrations",
      "Solar Flares Deflection",
      "Cosmic Void Anchor",
      "Titanium Aegis Lock",
      "Astral Gatekeeper Trial"
    ];

    const arena = ARENAS[Math.floor(Math.random() * ARENAS.length)];
    const theme = customTheme ? customTheme.substring(0, 45).toUpperCase() : THEMES[Math.floor(Math.random() * THEMES.length)];

    // Scale rewards dynamically with difficulty
    let xp = 150;
    let mastery = 350;
    if (diffUpper === "EASY") {
      xp = 100 + Math.floor(Math.random() * 51);
      mastery = 250 + Math.floor(Math.random() * 101);
    } else if (diffUpper === "MEDIUM") {
      xp = 180 + Math.floor(Math.random() * 61);
      mastery = 400 + Math.floor(Math.random() * 151);
    } else if (diffUpper === "CHALLENGING") {
      xp = 300 + Math.floor(Math.random() * 101);
      mastery = 650 + Math.floor(Math.random() * 151);
    } else if (diffUpper === "MONARCH") {
      xp = 500 + Math.floor(Math.random() * 251);
      mastery = 900 + Math.floor(Math.random() * 401);
    }

    const drillNames = selectedTemplates.map(t => t.name);
    const drillDescs = selectedTemplates.map(t => t.templateDescription);

    const questName = `${sName}: ${theme} [${drillNames.join(" & ")}]`;
    const description = `SYSTEM DIRECTIVE for ${sName} training inside the ${arena}. Weave your trajectory under the ${diffUpper} theme of "${theme}". Complete the following objectives to synchronize your core metrics: ${drillDescs.map((desc, i) => `${i + 1}) ${desc}`).join(" Furthermore, ")}.`;

    const finalRequirements = combineRequirements(selectedTemplates, diffUpper);

    const proceduralQuest = {
      id: `pq-dyn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      skillId: skillId || "s1",
      skillName: sName,
      name: questName,
      description,
      difficulty: diffUpper,
      xpReward: xp,
      masteryReward: mastery,
      type: diffUpper === "EASY" ? "CHAMBER_NET" : (diffUpper === "MEDIUM" ? "CHAMBER_MATCH_SIM" : "DUNGEON_MATCH"),
      requirements: finalRequirements,
      completed: false,
      attemptsCount: 0,
      lastAttemptStatus: "NONE"
    };

    const hasApiKey = !!process.env.GEMINI_API_KEY;
    if (!hasApiKey) {
      return res.json(proceduralQuest);
    }

    // Enhance with cinematic lore text using Gemini
    const ai = getAI();
    const prompt = `
      You are the MONARCH SYSTEM: an advanced, Solo Leveling-inspired holographic training operating core.
      We have procedurally combined target drills from our secure database to generate this Quest:
      ${JSON.stringify(proceduralQuest)}
      
      Your task is to rewrite ONLY the 'name' and 'description' of this quest to make them incredibly cinematic, lore-heavy, and majestically Solo Leveling-themed.
      - Keep the name short but epic (e.g. 'Runic Ice Lock Phase VI').
      - Write 2-3 sentences of lore for the description. Emphasize physical bowling mechanics for ${sName} under high tech matrix simulations.
      - DO NOT alter any other parameters such as difficulty, type, requirements, xpReward, masteryReward, etc.

      Respond STRICTLY in JSON according to this schema:
      {
        "name": "cinematic rewritten name",
        "description": "lore-heavy rewritten description"
      }
    `;

    const aiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      }
    });

    const parsedData = JSON.parse(aiRes.text || "{}");
    if (parsedData.name && parsedData.description) {
      proceduralQuest.name = parsedData.name;
      proceduralQuest.description = parsedData.description;
    }

    res.json(proceduralQuest);

  } catch (err: any) {
    console.error("Dynamic procedural quests synthesis failed:", err);
    res.status(200).json({
      id: `pq-dyn-${Date.now()}`,
      skillId: skillId || "s1",
      skillName: sName,
      name: `Sync Matrix: ${sName}`,
      description: "Holographic calibration offline. Secure standard calibration parameters inside the Evolution Chamber.",
      difficulty: difficulty || "CHALLENGING",
      xpReward: 200,
      masteryReward: 500,
      type: "CHAMBER_NET",
      requirements: { perfectBallsNeeded: 5 },
      completed: false,
      attemptsCount: 0,
      lastAttemptStatus: "NONE",
    });
  }
});

// 🌑 API ENDPOINT 4: CLOUD STORAGE SYNC FOR QUESTS AND SCENARIOS
const CLOUD_STORAGE_FILE = path.join(process.cwd(), "user_quests_cloud.json");

app.get("/api/quests", (req, res) => {
  try {
    if (fs.existsSync(CLOUD_STORAGE_FILE)) {
      const data = fs.readFileSync(CLOUD_STORAGE_FILE, "utf-8");
      return res.json(JSON.parse(data));
    } else {
      // Create empty container to ensure download works from the start
      const defaultData = { quests: [], scenarios: [] };
      fs.writeFileSync(CLOUD_STORAGE_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
      return res.json(defaultData);
    }
  } catch (err) {
    console.error("Failed to read user_quests_cloud.json from cloud storage:", err);
    res.json({ quests: [], scenarios: [] });
  }
});

app.post("/api/quests", (req, res) => {
  try {
    const { quests, scenarios } = req.body;
    fs.writeFileSync(CLOUD_STORAGE_FILE, JSON.stringify({ quests, scenarios }, null, 2), "utf-8");
    res.json({ success: true, message: "Quests database successfully synchronized and saved to cloud storage." });
  } catch (err) {
    console.error("Failed to write to user_quests_cloud.json in cloud storage:", err);
    res.status(500).json({ error: "Failed to persist quest data in cloud storage." });
  }
});

// START EXPRESS/VITE HOTWIRE
async function startServer() {
  // Vite dev or production server configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Monarch Server] Online and ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
