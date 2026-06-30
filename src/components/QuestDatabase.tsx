import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Filter, ArrowUpDown, Plus, Copy, Edit2, Trash2, 
  Download, Upload, BarChart2, Database, AlertTriangle, Check, 
  X, HelpCircle, Eye, RefreshCw, Layers, Sparkles, Trophy, 
  Clock, ListTodo, FileText, CheckCircle, Activity, Play, Settings,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { QuestDatabaseManager, CustomQuest, PressureScenarioData } from "../utils/questDatabaseManager";
import { playSystemClick, playSystemDing, playSystemError } from "../utils/audio";

const BULK_IMPORT_EXAMPLE = `---
Title: Perfect Spin Control
Description: Deliver five perfect balls inside the target area without missing the intended line.
Category: Practice
Arena: Evolution Chamber
Mode: Net Drill
Overs: 2
Skill: Leg Break
Difficulty: Easy

---
Title: Pressure Lock
Description: Defend twelve runs in two overs while taking one wicket.
Category: Challenge
Arena: Evolution Chamber
Mode: Pressure Chamber
Overs: 2
Skill: Googly
Difficulty: Challenging
---`;

interface QuestDatabaseProps {
  onRefreshDirectives: () => void;
  onNavigateToTab: (tab: string) => void;
  skills?: any[];
}

export default function QuestDatabase({ onRefreshDirectives, onNavigateToTab, skills }: QuestDatabaseProps) {
  const [activeTab, setActiveTab] = useState<"QUESTS" | "PRESSURE" | "IMPORT_EXPORT" | "STATS">("QUESTS");

  // Dynamically compile active skills (core + dynamic variations)
  const defaultSkills = ["LEG BREAK", "GOOGLY", "SLIDER", "FLIPPER", "TOP SPINNER"];
  const activeSkills = skills 
    ? Array.from(new Set([...defaultSkills, ...skills.map(s => s.name.toUpperCase())]))
    : defaultSkills;

  // State arrays loaded from manager
  const [quests, setQuests] = useState<CustomQuest[]>([]);
  const [scenarios, setScenarios] = useState<PressureScenarioData[]>([]);

  // Search & Filter
  const [questSearch, setQuestSearch] = useState("");
  const [questCategoryFilter, setQuestCategoryFilter] = useState("ALL");
  const [questSkillFilter, setQuestSkillFilter] = useState("ALL");
  const [questDiffFilter, setQuestDiffFilter] = useState("ALL");
  const [questSort, setQuestSort] = useState<"title" | "id" | "xp" | "diff" | "modified">("title");

  const [pressureSearch, setPressureSearch] = useState("");
  const [pressureDiffFilter, setPressureDiffFilter] = useState("ALL");
  const [pressureSort, setPressureSort] = useState<"name" | "id" | "overs" | "runs" | "difficulty">("name");

  // Edit / Add Modal States
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Partial<CustomQuest> | null>(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState(BULK_IMPORT_EXAMPLE);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Delete & Clear Confirmation States
  const [questToDelete, setQuestToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [clearAllConfirmText, setClearAllConfirmText] = useState("");

  // Bulk Import Pipeline States (Quests)
  const [bulkImportStep, setBulkImportStep] = useState<"INPUT" | "PREVIEW" | "RESULT">("INPUT");
  const [parsedPreview, setParsedPreview] = useState<{ readyQuests: any[]; skippedQuests: any[] } | null>(null);
  const [importResultData, setImportResultData] = useState<{ successCount: number; skippedCount: number; skippedReasons: any[] } | null>(null);

  // Bulk Import Pipeline States (Pressure Scenarios)
  const [isPressureBulkOpen, setIsPressureBulkOpen] = useState(false);
  const [pressureBulkText, setPressureBulkText] = useState("");
  const [pressureBulkStep, setPressureBulkStep] = useState<"INPUT" | "PREVIEW" | "RESULT">("INPUT");
  const [pressureParsedPreview, setPressureParsedPreview] = useState<{ readyScenarios: any[]; skippedScenarios: any[] } | null>(null);
  const [pressureImportResultData, setPressureImportResultData] = useState<{ successCount: number; skippedCount: number } | null>(null);

  const [isPressureModalOpen, setIsPressureModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Partial<PressureScenarioData> | null>(null);
  const [specialEventsInput, setSpecialEventsInput] = useState("");

  useEffect(() => {
    if (editingScenario) {
      setSpecialEventsInput(editingScenario.specialMatchEvents?.join(", ") || "");
    } else {
      setSpecialEventsInput("");
    }
  }, [editingScenario]);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Import State
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<"MERGE" | "REPLACE">("MERGE");
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState("");

  // Multi-Select States
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>([]);
  const [isMultiDeleteConfirmOpen, setIsMultiDeleteConfirmOpen] = useState(false);

  // Statistics & History
  const [recentLogs, setRecentLogs] = useState<Array<{ id: string; action: string; time: string }>>([]);

  // Load database
  const loadDatabase = () => {
    setQuests(QuestDatabaseManager.getQuests());
    setScenarios(QuestDatabaseManager.getPressureScenarios());
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  const addRecentLog = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRecentLogs(prev => [{ id: Math.random().toString(), action, time: timestamp }, ...prev].slice(0, 8));
  };

  // Automated notification wrapper
  const notifyChanges = () => {
    loadDatabase();
    onRefreshDirectives();
  };

  // QUEST CRUD ACTIONS
  const handleSaveQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuest?.name) {
      playSystemError();
      alert("Quest Title is required!");
      return;
    }
    playSystemDing();

    const isEditing = !!editingQuest.id;
    QuestDatabaseManager.upsertQuest({
      id: editingQuest.id,
      title: editingQuest.name,
      description: editingQuest.description || "",
      category: editingQuest.category || "Practice",
      arena: editingQuest.arena || "Sovereign Obelisk Grid",
      overs: Number(editingQuest.requirements?.oversMin || 2),
      targetSkill: editingQuest.targetSkill || "LEG BREAK",
      difficulty: editingQuest.difficulty || "MEDIUM",
      objectivesText: editingQuest.objectivesText || editingQuest.description || "",
    });

    addRecentLog(`${isEditing ? "Updated" : "Added"} Quest: ${editingQuest.name}`);
    setIsQuestModalOpen(false);
    setEditingQuest(null);
    notifyChanges();
  };

  const handleDuplicateQuest = (quest: CustomQuest) => {
    playSystemDing();
    const duplicated = {
      ...quest,
      id: `qdb-dup-${Date.now()}`,
      name: `${quest.name} (Copy)`,
    };
    QuestDatabaseManager.upsertQuest({
      id: duplicated.id,
      title: duplicated.name,
      description: duplicated.description,
      category: duplicated.category,
      arena: duplicated.arena,
      overs: Number(duplicated.requirements?.oversMin || 2),
      targetSkill: duplicated.targetSkill,
      difficulty: duplicated.difficulty,
      objectivesText: duplicated.objectivesText,
    });
    addRecentLog(`Duplicated Quest: ${quest.name}`);
    notifyChanges();
  };

  const handleDeleteQuest = (id: string, name: string) => {
    playSystemClick();
    setQuestToDelete({ id, name });
  };

  const handleAnalyzeBulkQuests = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      playSystemError();
      return;
    }
    playSystemClick();
    const parsed = QuestDatabaseManager.parseBulkQuestsText(bulkText);
    setParsedPreview(parsed);
    setBulkImportStep("PREVIEW");
  };

  const handleExecuteBulkImport = () => {
    if (!parsedPreview) return;
    playSystemDing();
    
    // Add quests from parsedPreview.readyQuests
    const questsAdded: CustomQuest[] = [];
    parsedPreview.readyQuests.forEach((qData) => {
      const newQuest = QuestDatabaseManager.upsertQuest({
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

    // Record results
    setImportResultData({
      successCount: questsAdded.length,
      skippedCount: parsedPreview.skippedQuests.length,
      skippedReasons: parsedPreview.skippedQuests
    });

    addRecentLog(`Bulk Imported ${questsAdded.length} Quests, Skipped ${parsedPreview.skippedQuests.length}`);
    setBulkImportStep("RESULT");
    notifyChanges();
  };

  const handleAnalyzeBulkPressure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pressureBulkText.trim()) {
      playSystemError();
      return;
    }
    playSystemClick();
    const parsed = QuestDatabaseManager.parseBulkPressureScenariosText(pressureBulkText);
    setPressureParsedPreview(parsed);
    setPressureBulkStep("PREVIEW");
  };

  const handleExecuteBulkPressure = () => {
    if (!pressureParsedPreview) return;
    playSystemDing();
    
    const scenariosAdded: PressureScenarioData[] = [];
    pressureParsedPreview.readyScenarios.forEach((scData) => {
      const newScenario = QuestDatabaseManager.upsertPressureScenario(scData);
      scenariosAdded.push(newScenario);
    });

    setPressureImportResultData({
      successCount: scenariosAdded.length,
      skippedCount: pressureParsedPreview.skippedScenarios.length
    });

    addRecentLog(`Bulk Imported ${scenariosAdded.length} Scenarios, Skipped ${pressureParsedPreview.skippedScenarios.length}`);
    setPressureBulkStep("RESULT");
    notifyChanges();
  };

  const handleRefreshDatabase = () => {
    playSystemClick();
    loadDatabase();
    setQuestSearch("");
    setQuestCategoryFilter("ALL");
    setQuestSkillFilter("ALL");
    setQuestDiffFilter("ALL");
    setQuestSort("title");
    addRecentLog("Database Refreshed");
    playSystemDing();
  };

  // Temporal counters calculations
  const getRecentlyAddedCount = () => {
    let count = 0;
    const dayAgo = Date.now() - 24 * 3600 * 1000;
    quests.forEach((q) => {
      if (q.id.startsWith("qdb-")) {
        const parts = q.id.split("-");
        if (parts.length > 1) {
          const ts = parseInt(parts[1], 10);
          if (!isNaN(ts) && ts > dayAgo) {
            count++;
          }
        }
      }
    });
    return count;
  };

  const recentlyAddedCount = getRecentlyAddedCount();
  const todayStr = new Date().toISOString().split("T")[0];
  const recentlyModifiedCount = quests.filter(q => q.lastModified === todayStr).length;

  // PRESSURE CRUD ACTIONS
  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScenario?.scenarioName) {
      playSystemError();
      alert("Scenario Name is required!");
      return;
    }
    playSystemDing();

    const isEditing = !!editingScenario.scenarioId;
    QuestDatabaseManager.upsertPressureScenario({
      scenarioId: editingScenario.scenarioId,
      scenarioName: editingScenario.scenarioName,
      story: editingScenario.story || "",
      overs: Number(editingScenario.oversRemaining || 2),
      difficulty: editingScenario.difficultyRating || "MEDIUM",
      runsToDefend: Number(editingScenario.runsLimit || 15),
      targetWickets: Number(editingScenario.wicketsTarget || 2),
      pitch: editingScenario.pitch || "Turning",
      weather: editingScenario.weather || "Cloudy",
      battingTeamStyle: editingScenario.battingTeamStyle || "Aggressive",
      specialMatchEvents: specialEventsInput.split(",").map(ev => ev.trim()).filter(Boolean),
      fieldRestrictions: editingScenario.fieldRestrictions || "Standard",
      objectives: editingScenario.objectives || "",
    });

    addRecentLog(`${isEditing ? "Updated" : "Added"} Scenario: ${editingScenario.scenarioName}`);
    setIsPressureModalOpen(false);
    setEditingScenario(null);
    notifyChanges();
  };

  const handleDeleteScenario = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete pressure scenario "${name}"?`)) {
      playSystemClick();
      QuestDatabaseManager.deletePressureScenario(id);
      addRecentLog(`Deleted Scenario: ${name}`);
      notifyChanges();
    }
  };

  // BACKUP IMPORT / EXPORT ACTIONS
  const handleExportBackup = () => {
    playSystemDing();
    const jsonStr = QuestDatabaseManager.exportBackupString();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monarch_database_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addRecentLog("Exported Database JSON Backup");
  };

  const handleExportCSVQuests = () => {
    playSystemDing();
    const csvContent = QuestDatabaseManager.convertToCSV(quests, [
      "id", "name", "description", "category", "arena", "difficulty", "targetSkill", "xpReward", "masteryReward"
    ]);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monarch_quests_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addRecentLog("Exported Quests CSV");
  };

  const handleExportCSVScenarios = () => {
    playSystemDing();
    const csvContent = QuestDatabaseManager.convertToCSV(scenarios, [
      "scenarioId", "scenarioName", "oversRemaining", "runsLimit", "wicketsTarget", "difficultyRating", "pitch", "weather", "riskRating", "xpReward"
    ]);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monarch_pressure_scenarios_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addRecentLog("Exported Scenarios CSV");
  };

  const handleImportDatabase = () => {
    if (!importText.trim()) {
      playSystemError();
      setImportError("Please paste JSON backup contents first.");
      return;
    }
    const success = QuestDatabaseManager.importBackup(importText, importMode);
    if (success) {
      playSystemDing();
      setImportSuccess(true);
      setImportError("");
      setImportText("");
      addRecentLog(`Imported DB (${importMode})`);
      notifyChanges();
      setTimeout(() => setImportSuccess(false), 4000);
    } else {
      playSystemError();
      setImportError("Invalid JSON structure. Ensure file matches required export format.");
    }
  };

  // Filter & Sort Quests with Enhanced Multi-parameter Search Engine
  const filteredQuests = quests.filter((q) => {
    if (!q) return false;
    const searchLower = questSearch.toLowerCase().trim();
    
    const qName = q.name || q.title || "";
    const qId = q.id || "";
    const qDesc = q.description || "";
    const qSkill = q.targetSkill || q.skillName || "LEG BREAK";
    const qArena = q.arena || "";
    const qDiff = q.difficulty || "EASY";
    const qMode = q.mode || "";
    const qObj = q.objectivesText || "";

    const matchesSearch = !searchLower || 
                          qName.toLowerCase().includes(searchLower) || 
                          qId.toLowerCase().includes(searchLower) ||
                          qDesc.toLowerCase().includes(searchLower) ||
                          qSkill.toLowerCase().includes(searchLower) ||
                          qArena.toLowerCase().includes(searchLower) ||
                          qDiff.toLowerCase().includes(searchLower) ||
                          qMode.toLowerCase().includes(searchLower) ||
                          qObj.toLowerCase().includes(searchLower) ||
                          String(q.overs || "").includes(searchLower) ||
                          String(q.requirements?.oversMin || "").includes(searchLower);

    const matchesCategory = questCategoryFilter === "ALL" || q.category === questCategoryFilter;
    const matchesSkill = questSkillFilter === "ALL" || qSkill.toUpperCase().includes(questSkillFilter.toUpperCase());
    const matchesDiff = questDiffFilter === "ALL" || qDiff === questDiffFilter;
    return matchesSearch && matchesCategory && matchesSkill && matchesDiff;
  }).sort((a, b) => {
    const nameA = a.name || a.title || "";
    const nameB = b.name || b.title || "";
    const idA = a.id || "";
    const idB = b.id || "";
    const diffA = a.difficulty || "MEDIUM";
    const diffB = b.difficulty || "MEDIUM";

    if (questSort === "title") return nameA.localeCompare(nameB);
    if (questSort === "id") return idA.localeCompare(idB);
    if (questSort === "xp") return (b.xpReward || 0) - (a.xpReward || 0);
    if (questSort === "diff") return diffB.localeCompare(diffA);
    if (questSort === "modified") return (b.lastModified || "").localeCompare(a.lastModified || "");
    return 0;
  });

  const PAGE_SIZE = 24;
  // Reset currentPage to 1 if it is out of bounds
  const totalPages = Math.max(1, Math.ceil(filteredQuests.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedQuests = filteredQuests.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  // Auto-reset page when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [questSearch, questCategoryFilter, questSkillFilter, questDiffFilter]);

  // Filter & Sort Scenarios
  const filteredScenarios = scenarios.filter((s) => {
    if (!s) return false;
    const sTerm = pressureSearch.toLowerCase().trim();
    
    const scName = s.scenarioName || "";
    const scId = s.scenarioId || "";
    const scStory = s.story || "";
    const scPitch = s.pitch || "";
    const scWeather = s.weather || "";
    const scDiffRating = s.difficultyRating || "MEDIUM";
    const scObj = s.objectives || "";
    const scRisk = s.riskRating || s.scenarioRiskRating || "";

    if (!sTerm) {
      const matchesDiff = pressureDiffFilter === "ALL" || scDiffRating === pressureDiffFilter;
      return matchesDiff;
    }

    const matchesSearch = 
      scName.toLowerCase().includes(sTerm) || 
      scId.toLowerCase().includes(sTerm) ||
      scStory.toLowerCase().includes(sTerm) ||
      scPitch.toLowerCase().includes(sTerm) ||
      scWeather.toLowerCase().includes(sTerm) ||
      String(s.oversRemaining || "").includes(sTerm) ||
      scDiffRating.toLowerCase().includes(sTerm) ||
      (s.specialMatchEvents && s.specialMatchEvents.some(event => event && event.toLowerCase().includes(sTerm))) ||
      scObj.toLowerCase().includes(sTerm) ||
      scRisk.toLowerCase().includes(sTerm) ||
      String(s.runsLimit || "").includes(sTerm) ||
      String(s.wicketsTarget || "").includes(sTerm);

    const matchesDiff = pressureDiffFilter === "ALL" || scDiffRating === pressureDiffFilter;
    return matchesSearch && matchesDiff;
  }).sort((a, b) => {
    const scNameA = a.scenarioName || "";
    const scNameB = b.scenarioName || "";
    const scIdA = a.scenarioId || "";
    const scIdB = b.scenarioId || "";
    const diffA = a.difficultyRating || "MEDIUM";
    const diffB = b.difficultyRating || "MEDIUM";

    if (pressureSort === "name") return scNameA.localeCompare(scNameB);
    if (pressureSort === "id") return scIdA.localeCompare(scIdB);
    if (pressureSort === "overs") return (b.oversRemaining || 0) - (a.oversRemaining || 0);
    if (pressureSort === "runs") return (a.runsLimit || 0) - (b.runsLimit || 0);
    if (pressureSort === "difficulty") return diffB.localeCompare(diffA);
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-[#0b0b14] border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_25px_rgba(0,217,255,0.15)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px]" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[8px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono font-bold tracking-widest uppercase">
                CONTENT LIBRARY PORTAL
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] text-gray-500 font-mono">Monarch Engine Sync Active</span>
            </div>
            <h1 className="text-2xl font-black font-mono text-white tracking-widest uppercase flex items-center gap-2.5">
              <Database className="w-6 h-6 text-cyan-400" />
              📚 Quest & Scenario Database
            </h1>
            <p className="text-xs text-gray-400 max-w-2xl font-sans">
              Internal library console for the Monarch Spinner System. Create, edit, and analyze quest rewards, variables, and extreme pressure simulation parameters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { playSystemClick(); onNavigateToTab("DIRECTIVES"); }}
              className="px-4 py-2 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <ListTodo className="w-4 h-4" />
              Go to Quest Journal
            </button>
          </div>
        </div>

        {/* DATABASE TABS */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-gray-900 pt-5">
          {[
            { id: "QUESTS", label: "Quest Library", count: quests.length },
            { id: "PRESSURE", label: "Pressure Library", count: scenarios.length },
            { id: "IMPORT_EXPORT", label: "Import / Export", count: null },
            { id: "STATS", label: "Database Statistics", count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { playSystemClick(); setActiveTab(tab.id as any); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,217,255,0.15)]"
                  : "bg-black/40 border-transparent text-gray-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-gray-300 font-black">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT: QUESTS */}
      {activeTab === "QUESTS" && (
        <div className="space-y-6">
          {/* QUEST DATABASE STATS BENTO GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {/* COUNTER 1: TOTAL */}
            <div className="bg-cyan-950/15 border border-cyan-500/20 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(0,217,255,0.02)]">
              <span className="text-[9px] font-mono text-cyan-400/80 font-bold uppercase tracking-wider">Total Quests</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-cyan-300">{quests.length}</span>
                <span className="text-[10px] text-cyan-500 font-mono">active</span>
              </div>
            </div>

            {/* COUNTER 2: CATEGORIES */}
            <div className="bg-purple-950/15 border border-purple-500/20 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(147,51,234,0.02)]">
              <span className="text-[9px] font-mono text-purple-400/80 font-bold uppercase tracking-wider">Categories</span>
              <div className="space-y-0.5 mt-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Practice:</span>
                  <span className="text-white font-bold">{quests.filter(q => q.category === 'Practice').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Challenge:</span>
                  <span className="text-white font-bold">{quests.filter(q => q.category === 'Challenge').length}</span>
                </div>
              </div>
            </div>

            {/* COUNTER 3: ARENA DISTRIBUTIONS */}
            <div className="bg-amber-950/15 border border-amber-500/20 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(245,158,11,0.02)]">
              <span className="text-[9px] font-mono text-amber-400/80 font-bold uppercase tracking-wider">Arena Domains</span>
              <div className="space-y-0.5 mt-1 text-[9px] font-mono text-zinc-400 leading-none">
                <div className="flex justify-between">
                  <span className="truncate max-w-[80px]" title="Evolution Chamber">Evolution:</span>
                  <span className="text-white font-bold">{quests.filter(q => q.arena?.toLowerCase().includes('evolution')).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate max-w-[80px]" title="Match Dungeon">Dungeon:</span>
                  <span className="text-white font-bold">{quests.filter(q => q.arena?.toLowerCase().includes('dungeon') || q.arena?.toLowerCase().includes('sanctum')).length}</span>
                </div>
              </div>
            </div>

            {/* COUNTER 4: DIFFICULTIES E/M */}
            <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(16,185,129,0.02)]">
              <span className="text-[9px] font-mono text-emerald-400/80 font-bold uppercase tracking-wider">Calibration I</span>
              <div className="space-y-0.5 mt-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Easy:</span>
                  <span className="text-emerald-400 font-bold">{quests.filter(q => q.difficulty === 'EASY').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <span className="text-sky-400 font-bold">{quests.filter(q => q.difficulty === 'MEDIUM').length}</span>
                </div>
              </div>
            </div>

            {/* COUNTER 5: DIFFICULTIES C/M */}
            <div className="bg-rose-950/15 border border-rose-500/20 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(244,63,94,0.02)]">
              <span className="text-[9px] font-mono text-rose-400/80 font-bold uppercase tracking-wider">Calibration II</span>
              <div className="space-y-0.5 mt-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span className="truncate">Challenging:</span>
                  <span className="text-orange-400 font-bold">{quests.filter(q => q.difficulty === 'CHALLENGING').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monarch:</span>
                  <span className="text-rose-400 font-bold">{quests.filter(q => q.difficulty === 'MONARCH').length}</span>
                </div>
              </div>
            </div>

            {/* COUNTER 6: TEMPORAL */}
            <div className="bg-blue-950/15 border border-blue-500/20 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(59,130,246,0.02)]">
              <span className="text-[9px] font-mono text-blue-400/80 font-bold uppercase tracking-wider">Telemetry Logs</span>
              <div className="space-y-0.5 mt-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>New added:</span>
                  <span className="text-white font-bold">{recentlyAddedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modified:</span>
                  <span className="text-white font-bold">{recentlyModifiedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="bg-[#0b0b14] border border-zinc-900 p-4 rounded-xl flex flex-col lg:flex-row items-center gap-4">
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search quest library by ID, title, objectives, description..."
                value={questSearch}
                onChange={(e) => setQuestSearch(e.target.value)}
                className="w-full bg-[#050508]/60 border border-zinc-850 focus:border-cyan-500/50 pl-11 pr-4 py-2.5 rounded-xl text-xs font-sans text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={questCategoryFilter}
                  onChange={(e) => setQuestCategoryFilter(e.target.value)}
                  className="bg-black/60 border border-zinc-850 px-3 py-2 rounded-xl text-[11px] font-mono text-zinc-300 focus:outline-none"
                >
                  <option value="ALL">ALL CATEGORIES</option>
                  <option value="Practice">Practice</option>
                  <option value="Challenge">Challenge</option>
                </select>
              </div>

              <select
                value={questSkillFilter}
                onChange={(e) => setQuestSkillFilter(e.target.value)}
                className="bg-black/60 border border-zinc-850 px-3 py-2 rounded-xl text-[11px] font-mono text-zinc-300 focus:outline-none"
              >
                <option value="ALL">ALL SKILLS</option>
                {activeSkills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>

              <select
                value={questDiffFilter}
                onChange={(e) => setQuestDiffFilter(e.target.value)}
                className="bg-black/60 border border-zinc-850 px-3 py-2 rounded-xl text-[11px] font-mono text-zinc-300 focus:outline-none"
              >
                <option value="ALL">ALL DIFFICULTIES</option>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="CHALLENGING">CHALLENGING</option>
                <option value="MONARCH">MONARCH</option>
              </select>

              <select
                value={questSort}
                onChange={(e) => setQuestSort(e.target.value as any)}
                className="bg-black/60 border border-zinc-850 px-3 py-2 rounded-xl text-[11px] font-mono text-zinc-300 focus:outline-none"
              >
                <option value="title">SORT BY TITLE</option>
                <option value="id">SORT BY ID</option>
                <option value="xp">SORT BY XP REWARD</option>
                <option value="diff">SORT BY DIFFICULTY</option>
                <option value="modified">SORT BY MODIFIED</option>
              </select>
            </div>
          </div>

          {/* ACTION STRIP */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-zinc-400">
                Showing <strong className="text-cyan-400">{filteredQuests.length}</strong> of {quests.length} registered quests
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    playSystemClick();
                    setIsMultiSelect(!isMultiSelect);
                    setSelectedQuestIds([]);
                  }}
                  className={`px-3.5 py-2 border text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    isMultiSelect 
                      ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,217,255,0.15)]"
                      : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isMultiSelect ? "Cancel Selection" : "Select Multiple"}</span>
                </button>

                <button
                  onClick={() => {
                    playSystemClick();
                    setEditingQuest({
                      category: "Practice",
                      overs: 2,
                      targetSkill: activeSkills[0] || "LEG BREAK",
                      difficulty: "MEDIUM",
                      arena: "Sovereign Obelisk Grid",
                      requirements: { oversMin: 2 },
                    } as any);
                    setIsQuestModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/20 text-white text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Single Quest
                </button>

                <button
                  onClick={() => {
                    playSystemClick();
                    setBulkImportStep("INPUT");
                    setParsedPreview(null);
                    setImportResultData(null);
                    setIsBulkModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Bulk Add Quests
                </button>

                <button
                  onClick={handleRefreshDatabase}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/30 text-zinc-300 hover:text-cyan-400 text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  title="Reload the current Quest Database from storage"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Database</span>
                </button>

                <button
                  onClick={() => { playSystemClick(); setIsClearAllOpen(true); }}
                  className="px-3.5 py-2 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  title="Delete the entire Quest Database with a safe validation check"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Clear All Quests</span>
                </button>
              </div>
            </div>

            {/* MULTI-SELECT CONTROLS STRIP */}
            {isMultiSelect && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950/40 border border-cyan-500/10 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Selection Engine:</span>
                  <span className="text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    Selected: {selectedQuestIds.length} quests
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playSystemClick();
                      // Select all filtered quests!
                      const allIds = filteredQuests.map(q => q.id);
                      setSelectedQuestIds(allIds);
                    }}
                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-lg transition-all cursor-pointer"
                  >
                    Select All ({filteredQuests.length})
                  </button>
                  <button
                    onClick={() => {
                      playSystemClick();
                      setSelectedQuestIds([]);
                    }}
                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all cursor-pointer"
                  >
                    Clear Selection
                  </button>
                  <button
                    disabled={selectedQuestIds.length === 0}
                    onClick={() => {
                      playSystemClick();
                      setIsMultiDeleteConfirmOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold uppercase ${
                      selectedQuestIds.length === 0
                        ? "bg-zinc-900/40 border border-zinc-850 text-zinc-650 cursor-not-allowed"
                        : "bg-rose-950/40 hover:bg-rose-900/55 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedQuestIds.length})</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* QUESTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedQuests.map((quest) => (
              <div 
                key={quest.id}
                onClick={() => {
                  if (isMultiSelect) {
                    playSystemClick();
                    if (selectedQuestIds.includes(quest.id)) {
                      setSelectedQuestIds(prev => prev.filter(id => id !== quest.id));
                    } else {
                      setSelectedQuestIds(prev => [...prev, quest.id]);
                    }
                  }
                }}
                className={`bg-[#0b0b13] border rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all group ${
                  isMultiSelect 
                    ? "cursor-pointer select-none hover:shadow-[0_0_20px_rgba(0,217,255,0.06)]" 
                    : "hover:border-zinc-800 hover:shadow-[0_8px_25px_rgba(0,217,255,0.05)]"
                } ${
                  isMultiSelect && selectedQuestIds.includes(quest.id)
                    ? "border-cyan-500/50 bg-cyan-950/10 shadow-[0_0_20px_rgba(0,217,255,0.1)]"
                    : "border-zinc-900"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    {isMultiSelect ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedQuestIds.includes(quest.id)}
                          onChange={(e) => {
                            playSystemClick();
                            if (e.target.checked) {
                              setSelectedQuestIds(prev => [...prev, quest.id]);
                            } else {
                              setSelectedQuestIds(prev => prev.filter(id => id !== quest.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-800 text-cyan-500 focus:ring-cyan-500/30 bg-black/60 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">
                          ID: {quest.id}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">
                        ID: {quest.id}
                      </span>
                    )}
                    <span className={`text-[8px] font-mono font-black tracking-widest px-1.5 py-0.5 rounded border uppercase ${
                      quest.difficulty === "EASY" ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" :
                      quest.difficulty === "MEDIUM" ? "bg-blue-950/20 border-blue-500/20 text-blue-400" :
                      quest.difficulty === "CHALLENGING" ? "bg-amber-950/20 border-amber-500/20 text-amber-400" :
                      "bg-rose-950/20 border-rose-500/30 text-rose-400 animate-pulse"
                    }`}>
                      {quest.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-mono text-white tracking-wide uppercase group-hover:text-cyan-400 transition-colors">
                    {quest.name}
                  </h3>

                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2">
                    {quest.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 border-t border-zinc-900/60 pt-3">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase block">Arena / Pitch</span>
                      <span className="text-[10px] text-zinc-300 font-mono uppercase truncate block">{quest.arena}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase block">Target Skill</span>
                      <span className="text-[10px] text-cyan-400 font-mono uppercase truncate block">{quest.targetSkill}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase block">Category / Overs</span>
                      <span className="text-[10px] text-zinc-300 font-mono uppercase truncate block">{quest.category} ({quest.requirements?.oversMin || quest.overs}ov)</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase block">Modified Date</span>
                      <span className="text-[10px] text-zinc-300 font-mono truncate block">{quest.lastModified}</span>
                    </div>
                  </div>

                  {/* AUTO COMPUTED REWARD DISPLAY */}
                  <div className="bg-[#050508]/90 border border-cyan-950/30 rounded-lg p-2.5 mt-2 flex items-center justify-between text-center gap-1.5 font-mono">
                    <div>
                      <span className="text-[7.5px] text-zinc-500 block uppercase">Player XP</span>
                      <span className="text-xs font-bold text-emerald-400">+{quest.xpReward}</span>
                    </div>
                    <div className="border-l border-zinc-850 h-5" />
                    <div>
                      <span className="text-[7.5px] text-zinc-500 block uppercase">Mastery</span>
                      <span className="text-xs font-bold text-cyan-400">+{quest.masteryReward}</span>
                    </div>
                    <div className="border-l border-zinc-850 h-5" />
                    <div>
                      <span className="text-[7.5px] text-zinc-500 block uppercase">Bonus XP</span>
                      <span className="text-xs font-bold text-purple-400">+{quest.bonusXp || 0}</span>
                    </div>
                    <div className="border-l border-zinc-850 h-5" />
                    <div>
                      <span className="text-[7.5px] text-zinc-500 block uppercase">Score</span>
                      <span className="text-xs font-black text-yellow-500">{quest.questScore || 240}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 border-t border-zinc-900/80 pt-3 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); playSystemClick(); setPreviewItem(quest); }}
                    className="flex-1 py-1.5 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-850 text-zinc-300 hover:text-white text-[10px] font-mono font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Preview Quest Card Analysis"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSystemClick();
                      setEditingQuest(quest);
                      setIsQuestModalOpen(true);
                    }}
                    className="p-1.5 bg-[#12121e]/80 hover:bg-[#1a1a2e] border border-cyan-900/20 hover:border-cyan-500/30 text-cyan-400 rounded-lg transition-all cursor-pointer"
                    title="Edit Quest Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDuplicateQuest(quest); }}
                    className="p-1.5 bg-[#12121e]/80 hover:bg-[#1a1a2e] border border-purple-900/20 hover:border-purple-500/30 text-purple-400 rounded-lg transition-all cursor-pointer"
                    title="Duplicate Quest"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteQuest(quest.id, quest.name); }}
                    className="p-1.5 bg-zinc-900/80 hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                    title="Delete Quest"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredQuests.length === 0 && (
              <div className="col-span-full py-16 bg-[#0b0b14]/50 border border-dashed border-zinc-850 rounded-2xl text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-zinc-500 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-300 font-mono uppercase">No Quests Discovered</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Adjust filters or create your first bespoke spin dynamic quest to populate the core Monarch repository.
                </p>
              </div>
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-900 pt-5 mt-4 gap-4">
              <span className="text-[11px] font-mono text-zinc-500">
                Page <strong className="text-zinc-300">{activePage}</strong> of <strong className="text-zinc-300">{totalPages}</strong> ({filteredQuests.length} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={activePage === 1}
                  onClick={() => { playSystemClick(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                  className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase rounded-lg border transition-all ${
                    activePage === 1
                      ? "bg-zinc-950/20 border-zinc-900/50 text-zinc-650 cursor-not-allowed"
                      : "bg-black hover:bg-zinc-900 border-zinc-850 hover:border-cyan-500/30 text-zinc-350 hover:text-white cursor-pointer"
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (activePage > 3) {
                      pageNum = activePage - 3 + i;
                    }
                    if (pageNum + (4 - i) > totalPages) {
                      pageNum = Math.max(1, totalPages - 4 + i);
                    }
                    if (pageNum > totalPages || pageNum < 1) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => { playSystemClick(); setCurrentPage(pageNum); }}
                        className={`w-8 h-8 text-[11px] font-mono font-bold rounded-lg transition-all border ${
                          activePage === pageNum
                            ? "bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.1)] font-bold"
                            : "bg-black hover:bg-zinc-900 border-zinc-850 text-zinc-450 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={activePage === totalPages}
                  onClick={() => { playSystemClick(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                  className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase rounded-lg border transition-all ${
                    activePage === totalPages
                      ? "bg-zinc-950/20 border-zinc-900/50 text-zinc-650 cursor-not-allowed"
                      : "bg-black hover:bg-zinc-900 border-zinc-850 hover:border-cyan-500/30 text-zinc-350 hover:text-white cursor-pointer"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRESSURE SCENARIOS */}
      {activeTab === "PRESSURE" && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="bg-[#0b0b14] border border-zinc-900 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search manual pressure situations by title, story, pitch, weather..."
                value={pressureSearch}
                onChange={(e) => setPressureSearch(e.target.value)}
                className="w-full bg-[#050508]/60 border border-zinc-850 focus:border-cyan-500/50 pl-11 pr-4 py-2.5 rounded-xl text-xs font-sans text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={pressureDiffFilter}
                onChange={(e) => setPressureDiffFilter(e.target.value)}
                className="bg-black/60 border border-zinc-850 px-3 py-2 rounded-xl text-[11px] font-mono text-zinc-300 focus:outline-none"
              >
                <option value="ALL">ALL DIFFICULTIES</option>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="DIFFICULT">DIFFICULT</option>
                <option value="EXTREME">EXTREME</option>
              </select>

              <select
                value={pressureSort}
                onChange={(e) => setPressureSort(e.target.value as any)}
                className="bg-black/60 border border-zinc-850 px-3 py-2 rounded-xl text-[11px] font-mono text-zinc-300 focus:outline-none"
              >
                <option value="name">SORT BY NAME</option>
                <option value="id">SORT BY ID</option>
                <option value="overs">SORT BY OVERS</option>
                <option value="runs">SORT BY TARGET RUNS</option>
                <option value="difficulty">SORT BY DIFFICULTY</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-mono text-zinc-400">
              Showing <strong className="text-cyan-400">{filteredScenarios.length}</strong> of {scenarios.length} pressure scenarios
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playSystemClick();
                  setPressureBulkStep("INPUT");
                  setPressureParsedPreview(null);
                  setPressureImportResultData(null);
                  setPressureBulkText(`Scenario Name: Super Over Chaser
Story: Score 16 runs off 1 over with only 1 wicket left in hand to win the championship.
Overs: 1
Difficulty: Extreme
Runs to Defend: 15
Target Wickets: 1
Pitch: Turning
Weather: Rainy
Special Match Events: Rain Delay, Dew Factor
Objectives: Hit two sixes and defend the remaining runs.

---
Scenario Name: Middle Over Squeeze
Story: Restrict the opponent on a slow dry pitch.
Overs: 4
Difficulty: Medium
Runs to Defend: 25
Target Wickets: 3
Pitch: Dry Pitch
Weather: Sunny
Objectives: Keep run rate below 6.5.`);
                  setIsPressureBulkOpen(true);
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Bulk Add Scenarios
              </button>

              <button
                onClick={() => {
                  playSystemClick();
                  setEditingScenario({
                    oversRemaining: 2,
                    difficultyRating: "MEDIUM",
                    runsLimit: 15,
                    wicketsTarget: 2,
                    pitch: "Turning",
                    weather: "Sunny",
                    battingTeamStyle: "Aggressive",
                    specialMatchEvents: [],
                    fieldRestrictions: "Standard",
                  });
                  setIsPressureModalOpen(true);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/20 text-white text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Pressure Scenario
              </button>
            </div>
          </div>

          {/* PRESSURE TABLE */}
          <div className="bg-[#0b0b14] border border-zinc-900 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="bg-[#0e0e1a] text-zinc-400 border-b border-zinc-850">
                    <th className="p-4 uppercase tracking-wider">ID / Name</th>
                    <th className="p-4 uppercase tracking-wider">Overs</th>
                    <th className="p-4 uppercase tracking-wider">Difficulty</th>
                    <th className="p-4 uppercase tracking-wider">Runs to Defend</th>
                    <th className="p-4 uppercase tracking-wider">Wickets</th>
                    <th className="p-4 uppercase tracking-wider">Pitch & Weather</th>
                    <th className="p-4 uppercase tracking-wider">Risk Level</th>
                    <th className="p-4 uppercase tracking-wider">XP Reward</th>
                    <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredScenarios.map((sc) => (
                    <tr key={sc.scenarioId} className="hover:bg-zinc-900/35 transition-colors">
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-850 rounded text-zinc-500 uppercase">
                            {sc.scenarioId}
                          </span>
                          <span className="font-bold text-white text-xs block truncate max-w-xs">
                            {sc.scenarioName}
                          </span>
                          <span className="text-[10px] text-zinc-400 block truncate max-w-sm font-sans italic">
                            "{sc.story || sc.desc}"
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-300 font-bold">{sc.oversRemaining} Overs</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black border tracking-wider uppercase ${
                          sc.difficultyRating === "EASY" ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" :
                          sc.difficultyRating === "MEDIUM" ? "bg-blue-950/20 border-blue-500/20 text-blue-400" :
                          sc.difficultyRating === "DIFFICULT" ? "bg-amber-950/20 border-amber-500/20 text-amber-400" :
                          "bg-rose-950/20 border-rose-500/30 text-rose-400 animate-pulse"
                        }`}>
                          {sc.difficultyRating}
                        </span>
                      </td>
                      <td className="p-4 text-white font-black text-xs">{sc.runsLimit} Runs</td>
                      <td className="p-4 text-zinc-300">{sc.wicketsTarget} Wkts</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="text-zinc-300 block">{sc.pitch} Pitch</span>
                          <span className="text-zinc-500 text-[10px] block">{sc.weather}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold ${
                          sc.riskRating === "LOW" ? "text-emerald-400" :
                          sc.riskRating === "MEDIUM" ? "text-yellow-400" :
                          sc.riskRating === "HIGH" ? "text-orange-400" : "text-rose-500 font-black uppercase"
                        }`}>
                          {sc.riskRating}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5 font-bold">
                          <span className="text-emerald-400 block">+{sc.xpReward} XP</span>
                          <span className="text-cyan-400 text-[10px] block">+{sc.masteryXpReward} Mastery</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { playSystemClick(); setPreviewItem(sc); }}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Preview Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              playSystemClick();
                              setEditingScenario(sc);
                              setIsPressureModalOpen(true);
                            }}
                            className="p-1.5 bg-cyan-950/20 hover:bg-cyan-900/30 border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer"
                            title="Edit Scenario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteScenario(sc.scenarioId, sc.scenarioName)}
                            className="p-1.5 bg-zinc-900 hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Scenario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredScenarios.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-zinc-500">
                        <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <h4 className="font-bold uppercase mb-1">No Pressure Scenarios Found</h4>
                        <p className="text-zinc-600 max-w-xs mx-auto text-[10px] font-sans">
                          Modify query filters or press Add Pressure Scenario to construct manual calibration matrices.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: IMPORT / EXPORT */}
      {activeTab === "IMPORT_EXPORT" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EXPORT PANEL */}
          <div className="bg-[#0b0b14] border border-zinc-900 p-6 rounded-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4.5 h-4.5 text-cyan-400" />
                Export Core Library
              </h2>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Backup the Monarch content database into standard developer formats. Export entire libraries for distribution or hot reloading.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <button
                onClick={handleExportBackup}
                className="w-full py-4 bg-[#0e0e1a] hover:bg-[#121226] border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300 font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
              >
                <Database className="w-4.5 h-4.5" />
                <span>Download Entire JSON Backup (.json)</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportCSVQuests}
                  className="py-3 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white font-mono text-[11px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Quests CSV</span>
                </button>

                <button
                  onClick={handleExportCSVScenarios}
                  className="py-3 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white font-mono text-[11px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Pressure CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/30 p-4 border border-zinc-900 rounded-xl space-y-2">
              <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block font-mono">EXPORT UTILITY INSTRUCTIONS</h4>
              <ul className="list-disc pl-4 text-[10px] text-zinc-400 space-y-1.5 font-sans leading-relaxed">
                <li>The downloaded JSON file retains all structured rewards, criteria, objectives, and modification timestamps.</li>
                <li>CSV lists are formatted with comma delimiters, appropriate for Microsoft Excel, Google Sheets, or data analytics software.</li>
                <li>Ensure backup files are stored securely to avoid local storage loss during browser clearing cycles.</li>
              </ul>
            </div>
          </div>

          {/* IMPORT PANEL */}
          <div className="bg-[#0b0b14] border border-zinc-900 p-6 rounded-2xl space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4.5 h-4.5 text-purple-400" />
                Import & Sync Database
              </h2>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Paste a valid database JSON string below to merge or replace existing records inside the local cache instantly.
              </p>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste full database JSON backup payload here..."
              className="w-full h-44 bg-[#050508]/60 border border-zinc-850 focus:border-purple-500/50 p-4 rounded-xl text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-zinc-400">IMPORT MODE:</span>
                <label className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={importMode === "MERGE"}
                    onChange={() => setImportMode("MERGE")}
                    className="accent-purple-500"
                  />
                  Merge Unique
                </label>
                <label className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={importMode === "REPLACE"}
                    onChange={() => setImportMode("REPLACE")}
                    className="accent-rose-500"
                  />
                  <span className="text-rose-400">Replace Database</span>
                </label>
              </div>

              <button
                onClick={handleImportDatabase}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Sync Import
              </button>
            </div>

            {importSuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-mono animate-fade-in">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Monarch content library synced successfully. Real-time updates have been broadcasted!</span>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs font-mono animate-fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STATISTICS */}
      {activeTab === "STATS" && (
        <div className="space-y-6">
          {/* STATS BENTO GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0b0b14] border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">TOTAL QUESTS</span>
              <span className="text-3xl font-black font-mono text-white block mt-1.5">{quests.length}</span>
              <span className="text-[10px] text-zinc-400 block mt-1 font-sans">Active in Spinner System</span>
              <Database className="absolute bottom-3 right-3 w-10 h-10 text-cyan-500/5" />
            </div>

            <div className="bg-[#0b0b14] border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">PRESSURE SCENARIOS</span>
              <span className="text-3xl font-black font-mono text-cyan-400 block mt-1.5">{scenarios.length}</span>
              <span className="text-[10px] text-zinc-400 block mt-1 font-sans">Pre-calibrated economy situations</span>
              <AlertTriangle className="absolute bottom-3 right-3 w-10 h-10 text-cyan-500/5" />
            </div>

            <div className="bg-[#0b0b14] border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">TOTAL REWARD POOL</span>
              <span className="text-3xl font-black font-mono text-emerald-400 block mt-1.5">
                {quests.reduce((sum, q) => sum + q.xpReward, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-1 font-sans">Cumulative Player XP</span>
              <Trophy className="absolute bottom-3 right-3 w-10 h-10 text-cyan-500/5" />
            </div>

            <div className="bg-[#0b0b14] border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">AVG DIFFICULTY SCORE</span>
              <span className="text-3xl font-black font-mono text-purple-400 block mt-1.5">
                {Math.round(scenarios.reduce((sum, s) => sum + s.scenarioDifficultyScore, 0) / (scenarios.length || 1))} / 100
              </span>
              <span className="text-[10px] text-zinc-400 block mt-1 font-sans">System tension load index</span>
              <Activity className="absolute bottom-3 right-3 w-10 h-10 text-cyan-500/5" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CATEGORY BREAKDOWN */}
            <div className="bg-[#0b0b14] border border-zinc-900 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                Quest Distribution per Category
              </h3>
              <div className="space-y-3 pt-2">
                {["Practice", "Challenge"].map((cat) => {
                  const count = quests.filter(q => q.category === cat).length;
                  const pct = quests.length ? (count / quests.length) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between text-zinc-300">
                        <span>{cat}</span>
                        <span>{count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SKILL & OVERS BREAKDOWN */}
            <div className="bg-[#0b0b14] border border-zinc-900 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                Target Spin Variation Allocation
              </h3>
              <div className="space-y-3 pt-2">
                {activeSkills.map((skill) => {
                  const count = quests.filter(q => q.targetSkill.toUpperCase().includes(skill)).length;
                  const pct = quests.length ? (count / quests.length) * 100 : 0;
                  return (
                    <div key={skill} className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between text-zinc-300">
                        <span>{skill}</span>
                        <span>{count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT MODS LOGS */}
            <div className="bg-[#0b0b14] border border-zinc-900 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-cyan-400" />
                Live Terminal Logger
              </h3>
              <div className="space-y-2.5 pt-1.5 max-h-[220px] overflow-y-auto">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between gap-2 border-b border-zinc-900 pb-2 text-[10px] font-mono leading-relaxed">
                    <div className="text-zinc-300">
                      <span className="text-cyan-500 font-bold mr-1.5">&gt;</span>
                      {log.action}
                    </div>
                    <span className="text-zinc-500 shrink-0 text-[9px]">{log.time}</span>
                  </div>
                ))}

                {recentLogs.length === 0 && (
                  <div className="text-center py-10 text-zinc-500 italic text-[10px] font-sans">
                    Console idle. Add, edit, duplicate, or delete database elements to track real-time calibrations.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRESSURE LIBRARY METRICS DASHBOARD */}
          <div className="bg-[#0b0b14] border border-zinc-900 p-6 rounded-2xl space-y-6 text-left">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <AlertTriangle className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                Pressure Situation Library Intelligence
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* DIFFICULTY DISTRIBUTION */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider font-mono block">Difficulty Load Metrics</span>
                <div className="space-y-2">
                  {["EASY", "MEDIUM", "DIFFICULT", "EXTREME"].map((diff) => {
                    const count = scenarios.filter(s => s.difficultyRating === diff).length;
                    const pct = scenarios.length ? (count / scenarios.length) * 100 : 0;
                    return (
                      <div key={diff} className="space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between text-zinc-400">
                          <span>{diff}</span>
                          <span>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OVERS DISTRIBUTION */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider font-mono block">Overs Allocation</span>
                <div className="space-y-2">
                  {["1 Over", "2 Overs", "3 Overs", "4+ Overs"].map((oversLabel) => {
                    let count = 0;
                    if (oversLabel === "1 Over") count = scenarios.filter(s => s.oversRemaining === 1).length;
                    else if (oversLabel === "2 Overs") count = scenarios.filter(s => s.oversRemaining === 2).length;
                    else if (oversLabel === "3 Overs") count = scenarios.filter(s => s.oversRemaining === 3).length;
                    else count = scenarios.filter(s => s.oversRemaining >= 4).length;
                    const pct = scenarios.length ? (count / scenarios.length) * 100 : 0;
                    return (
                      <div key={oversLabel} className="space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between text-zinc-400">
                          <span>{oversLabel}</span>
                          <span>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PITCH SURFACE CALIBRATION */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider font-mono block">Pitch Surfaces</span>
                <div className="space-y-2">
                  {Array.from(new Set(scenarios.map(s => s.pitch || "Turning"))).slice(0, 4).map((pitchType) => {
                    const count = scenarios.filter(s => s.pitch === pitchType).length;
                    const pct = scenarios.length ? (count / scenarios.length) * 100 : 0;
                    return (
                      <div key={pitchType} className="space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between text-zinc-400 truncate text-left">
                          <span className="truncate">{pitchType}</span>
                          <span className="shrink-0">{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WEATHER CONDITIONS & METRICS SUMMARY */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider font-mono block">Tactical Averages</span>
                <div className="bg-[#050508]/60 border border-zinc-900 rounded-xl p-3 space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Avg Runs Limit:</span>
                    <span className="text-white font-bold font-mono">
                      {scenarios.length ? Math.round(scenarios.reduce((sum, s) => sum + s.runsLimit, 0) / scenarios.length) : 0} runs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Avg Wickets Target:</span>
                    <span className="text-white font-bold font-mono">
                      {scenarios.length ? (scenarios.reduce((sum, s) => sum + s.wicketsTarget, 0) / scenarios.length).toFixed(1) : 0} wkts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Weather patterns:</span>
                    <span className="text-cyan-400 font-bold font-mono">
                      {Array.from(new Set(scenarios.map(s => s.weather))).filter(Boolean).slice(0, 2).join(", ") || "Sunny"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE QUEST MODAL EDITOR */}
      <AnimatePresence>
        {isQuestModalOpen && editingQuest && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-cyan-500/30 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,217,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* MODAL HEADER */}
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#0d0d1c]">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-cyan-400 block font-mono uppercase tracking-widest font-bold">MONARCH CODEX COMPILER</span>
                  <h3 className="text-sm font-black font-mono text-white uppercase tracking-wider">
                    {editingQuest.id ? `EDIT QUEST RECORD: ${editingQuest.id}` : "CREATE NEW COMPLIANT QUEST"}
                  </h3>
                </div>
                <button
                  onClick={() => { playSystemClick(); setIsQuestModalOpen(false); setEditingQuest(null); }}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* MODAL FORM */}
              <form onSubmit={handleSaveQuest} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Quest Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flight Deviation calibrations"
                      value={editingQuest.name || ""}
                      onChange={(e) => setEditingQuest({ ...editingQuest, name: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white font-sans text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Description Summary</label>
                    <input
                      type="text"
                      placeholder="e.g. Deliver 12 balls inside Glacial Fortress Chamber to recalibrate drift..."
                      value={editingQuest.description || ""}
                      onChange={(e) => setEditingQuest({ ...editingQuest, description: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white font-sans text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Category</label>
                    <select
                      value={editingQuest.category || "Practice"}
                      onChange={(e) => setEditingQuest({ ...editingQuest, category: e.target.value as any })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="Practice">Practice</option>
                      <option value="Challenge">Challenge</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Arena (Combat Floor)</label>
                    <input
                      type="text"
                      placeholder="e.g. Sovereign Obelisk Grid"
                      value={editingQuest.arena || ""}
                      onChange={(e) => setEditingQuest({ ...editingQuest, arena: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-zinc-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Overs Plan</label>
                    <select
                      value={editingQuest.requirements?.oversMin || editingQuest.overs || 2}
                      onChange={(e) => setEditingQuest({
                        ...editingQuest,
                        overs: Number(e.target.value),
                        requirements: { ...editingQuest.requirements, oversMin: Number(e.target.value) }
                      })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="2">2 Overs</option>
                      <option value="5">5 Overs</option>
                      <option value="10">10 Overs</option>
                      <option value="20">20 Overs</option>
                      <option value="30">30 Overs</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Target Spin Variation</label>
                    <select
                      value={editingQuest.targetSkill || "LEG BREAK"}
                      onChange={(e) => setEditingQuest({ ...editingQuest, targetSkill: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      {activeSkills.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Difficulty Calibration</label>
                    <select
                      value={editingQuest.difficulty || "MEDIUM"}
                      onChange={(e) => setEditingQuest({ ...editingQuest, difficulty: e.target.value as any })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="CHALLENGING">CHALLENGING</option>
                      <option value="MONARCH">MONARCH (Elite Tier)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-zinc-400 uppercase font-bold">Objectives Criteria Script</label>
                      <span className="text-[9px] text-zinc-500">Natural language interpreter is enabled</span>
                    </div>
                    <textarea
                      required
                      placeholder="e.g. Bowl 8 perfect deliveries of GOOGLY while conceding under 12 runs inside 5 overs."
                      value={editingQuest.objectivesText || ""}
                      onChange={(e) => setEditingQuest({ ...editingQuest, objectivesText: e.target.value })}
                      className="w-full h-24 bg-black/60 border border-zinc-850 focus:border-cyan-500/50 p-3 rounded-xl focus:outline-none text-zinc-300 font-sans text-xs"
                    />
                    <p className="text-[9px] text-zinc-500 leading-relaxed font-sans">
                      💡 <strong>AI AUTO ANALYSIS:</strong> The compiler will automatically extract numeric limitations (e.g., wicketsNeeded, runsMaxLte, perfectBallsNeeded) and dynamically assign fair Level XP and Mastery Rewards. You do NOT have to enter XP.
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-5 mt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { playSystemClick(); setIsQuestModalOpen(false); setEditingQuest(null); }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Save & Analyze
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK ADD QUESTS MODAL (WIZARD REDESIGN) */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-cyan-500/30 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,217,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden font-mono text-xs text-white"
            >
              {/* HEADER */}
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#0d0d1c]">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-cyan-400 block font-bold tracking-widest uppercase">BULK COMPILER ENGINE</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {bulkImportStep === "INPUT" && "Paste Bulk Quests List"}
                    {bulkImportStep === "PREVIEW" && "Review Import & Audit Report"}
                    {bulkImportStep === "RESULT" && "Bulk Ingest Outcome"}
                  </h3>
                </div>
                <button
                  onClick={() => { playSystemClick(); setIsBulkModalOpen(false); setBulkText(BULK_IMPORT_EXAMPLE); setBulkImportStep("INPUT"); }}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STEP 1: INPUT */}
              {bulkImportStep === "INPUT" && (
                <form onSubmit={handleAnalyzeBulkQuests} className="p-6 space-y-4 text-xs flex flex-col flex-1 overflow-y-auto">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Paste Raw Quests List</label>
                    <textarea
                      required
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="Title: Spin Perfection Quest&#10;description: Deliver 5 perfect balls...&#10;category: Practice&#10;arena: Underworld Shadow Arena&#10;overs: 2&#10;skill: GOOGLY&#10;difficulty: CHALLENGING&#10;&#10;Title: Sovereign Match Drills...&#10;..."
                      className="w-full h-64 bg-black/60 border border-zinc-850 focus:border-cyan-500/50 p-4 rounded-xl text-[11px] text-zinc-300 focus:outline-none resize-none font-mono"
                    />
                    <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl leading-relaxed text-zinc-400 text-[10.5px]">
                      💡 <strong>Flexible Parsing Active:</strong> Separate distinct quest records with a double line break or divider line. Only <strong className="text-zinc-200">Title</strong> and <strong className="text-zinc-200">Description</strong> are required. Missing fields use intelligent default configurations automatically.
                    </div>
                  </div>

                  <div className="pt-3 mt-auto flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setIsBulkModalOpen(false); }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold font-mono"
                    >
                      <span>Analyze Quests</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PREVIEW */}
              {bulkImportStep === "PREVIEW" && parsedPreview && (
                <div className="p-6 flex flex-col flex-1 overflow-y-auto max-h-[65vh] text-xs space-y-5 text-left">
                  <p className="text-zinc-400">
                    The compiler evaluated the provided records. Verify the counts, difficulties, and skipped list below before writing to database.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {/* READY PANEL */}
                    <div className="bg-emerald-950/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Ready for Ingestion ({parsedPreview.readyQuests.length})</span>
                      <div className="space-y-1 text-zinc-300 text-[11px] font-mono">
                        <div>• Easy: {parsedPreview.readyQuests.filter(q => q.difficulty === 'EASY').length}</div>
                        <div>• Medium: {parsedPreview.readyQuests.filter(q => q.difficulty === 'MEDIUM').length}</div>
                        <div>• Challenging: {parsedPreview.readyQuests.filter(q => q.difficulty === 'CHALLENGING').length}</div>
                        <div>• Monarch: {parsedPreview.readyQuests.filter(q => q.difficulty === 'MONARCH').length}</div>
                      </div>
                    </div>

                    {/* SKIPPED PANEL */}
                    <div className="bg-rose-950/5 border border-rose-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">Skipped / Duplicates ({parsedPreview.skippedQuests.length})</span>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        Skipped due to duplicate title/description or lack of minimum required fields.
                      </p>
                    </div>
                  </div>

                  {/* DUPLICATE / AUDIT LOG */}
                  {parsedPreview.skippedQuests.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Skipped/Duplicate Quests Log</h4>
                      <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 text-[11px] leading-relaxed text-left">
                        {parsedPreview.skippedQuests.map((skipped, idx) => (
                          <div key={idx} className="border-b border-zinc-900/60 pb-1.5 last:border-0 last:pb-0">
                            <span className="text-rose-400 font-bold font-mono">[{skipped.reason}]</span>{" "}
                            <span className="text-zinc-200 font-bold font-mono">{skipped.title || "Untitled Card"}</span>
                            <p className="text-zinc-500 mt-0.5">{skipped.description || "No description provided."}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PREVIEW OF READY QUESTS */}
                  {parsedPreview.readyQuests.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Ready Quests Preview</h4>
                      <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 text-[11px] text-left">
                        {parsedPreview.readyQuests.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-start border-b border-zinc-900/40 pb-1.5 last:border-0 last:pb-0">
                            <div>
                              <span className="text-zinc-100 font-bold">{q.title}</span>
                              <span className="text-[9px] text-zinc-500 block">{q.description.substring(0, 80)}...</span>
                            </div>
                            <span className="px-1.5 py-0.5 text-[8px] rounded border border-cyan-500/20 bg-cyan-950/15 text-cyan-400 uppercase font-mono">
                              {q.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-900 mt-auto flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setBulkImportStep("INPUT"); }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Editor
                    </button>
                    <button
                      onClick={handleExecuteBulkImport}
                      disabled={parsedPreview.readyQuests.length === 0}
                      className={`px-5 py-2.5 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        parsedPreview.readyQuests.length === 0
                          ? "bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Ingest Quests ({parsedPreview.readyQuests.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: RESULT */}
              {bulkImportStep === "RESULT" && importResultData && (
                <div className="p-6 flex flex-col flex-1 overflow-y-auto text-xs space-y-5">
                  <div className="text-center py-6 space-y-2">
                    <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="text-base font-bold text-white uppercase tracking-wider font-mono">Ingestion Completed!</h4>
                    <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Successfully parsed, balanced, and imported <strong className="text-emerald-400">{importResultData.successCount}</strong> quests into the Monarch database.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 space-y-2 font-mono text-left">
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-400">Total Quests Ingested:</span>
                      <span className="text-emerald-400 font-bold font-mono">+{importResultData.successCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-400">Duplicates / Skipped:</span>
                      <span className="text-rose-400 font-bold font-mono">{importResultData.skippedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Database Status:</span>
                      <span className="text-cyan-400 font-bold font-mono">Synchronized</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 mt-auto flex justify-end">
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setIsBulkModalOpen(false); setBulkText(BULK_IMPORT_EXAMPLE); setBulkImportStep("INPUT"); }}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold font-mono"
                    >
                      <Check className="w-4 h-4" />
                      <span>Close Wizard</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK ADD PRESSURE SCENARIOS MODAL */}
      <AnimatePresence>
        {isPressureBulkOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-cyan-500/30 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,217,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden font-mono text-xs text-white"
            >
              {/* HEADER */}
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#0d0d1c]">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-cyan-400 block font-bold tracking-widest uppercase">PRESSURE BULK INGESTION ENGINE</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {pressureBulkStep === "INPUT" && "Paste Bulk Scenarios List"}
                    {pressureBulkStep === "PREVIEW" && "Review Situations & Audit Report"}
                    {pressureBulkStep === "RESULT" && "Bulk Ingestion Outcome"}
                  </h3>
                </div>
                <button
                  onClick={() => { playSystemClick(); setIsPressureBulkOpen(false); setPressureBulkStep("INPUT"); }}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STEP 1: INPUT */}
              {pressureBulkStep === "INPUT" && (
                <form onSubmit={handleAnalyzeBulkPressure} className="p-6 space-y-4 text-xs flex flex-col flex-1 overflow-y-auto">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Paste Raw Pressure Situations</label>
                    <textarea
                      required
                      value={pressureBulkText}
                      onChange={(e) => setPressureBulkText(e.target.value)}
                      placeholder="Scenario Name: Super Over Chaser&#10;Story: Score 16 runs off 1 over...&#10;Overs: 1&#10;Difficulty: Extreme&#10;Runs to Defend: 15&#10;Target Wickets: 1&#10;&#10;---&#10;Scenario Name: ..."
                      className="w-full h-64 bg-black/60 border border-zinc-850 focus:border-cyan-500/50 p-4 rounded-xl text-[11px] text-zinc-300 focus:outline-none resize-none font-mono"
                    />
                    <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl leading-relaxed text-zinc-400 text-[10.5px]">
                      💡 <strong>Flexible Parsing Active:</strong> Separate distinct pressure scenario records with a divider line (<code>---</code>). Only <strong className="text-zinc-200">Scenario Name</strong> and <strong className="text-zinc-200">Story</strong> are required. Missing fields use intelligent default configurations automatically.
                    </div>
                  </div>

                  <div className="pt-3 mt-auto flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setIsPressureBulkOpen(false); }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold font-mono"
                    >
                      <span>Analyze Scenarios</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PREVIEW */}
              {pressureBulkStep === "PREVIEW" && pressureParsedPreview && (
                <div className="p-6 flex flex-col flex-1 overflow-y-auto max-h-[65vh] text-xs space-y-5 text-left">
                  <p className="text-zinc-400 font-sans leading-relaxed">
                    The compiler evaluated the provided pressure situations. Verify the counts, difficulties, and skipped list below before writing to database.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {/* READY PANEL */}
                    <div className="bg-emerald-950/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Ready for Ingestion ({pressureParsedPreview.readyScenarios.length})</span>
                      <div className="space-y-1 text-zinc-300 text-[11px] font-mono">
                        <div>• Easy: {pressureParsedPreview.readyScenarios.filter(q => q.difficulty === 'EASY').length}</div>
                        <div>• Medium: {pressureParsedPreview.readyScenarios.filter(q => q.difficulty === 'MEDIUM').length}</div>
                        <div>• Difficult: {pressureParsedPreview.readyScenarios.filter(q => q.difficulty === 'DIFFICULT').length}</div>
                        <div>• Extreme: {pressureParsedPreview.readyScenarios.filter(q => q.difficulty === 'EXTREME').length}</div>
                      </div>
                    </div>

                    {/* SKIPPED PANEL */}
                    <div className="bg-rose-950/5 border border-rose-500/20 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">Skipped / Duplicates ({pressureParsedPreview.skippedScenarios.length})</span>
                      <p className="text-[10.5px] text-zinc-500 leading-normal font-sans">
                        Skipped due to duplicate title/story or lack of minimum required fields (Scenario Name and Story description).
                      </p>
                    </div>
                  </div>

                  {/* DUPLICATE / AUDIT LOG */}
                  {pressureParsedPreview.skippedScenarios.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Skipped/Duplicate Scenarios Log</h4>
                      <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 text-[11px] leading-relaxed text-left">
                        {pressureParsedPreview.skippedScenarios.map((skipped, idx) => (
                          <div key={idx} className="border-b border-zinc-900/60 pb-1.5 last:border-0 last:pb-0">
                            <span className="text-rose-400 font-bold font-mono">[{skipped.reason}]</span>{" "}
                            <span className="text-zinc-200 font-bold font-mono">{skipped.title || "Untitled Situation"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PREVIEW OF READY SCENARIOS */}
                  {pressureParsedPreview.readyScenarios.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Ready Scenarios Preview</h4>
                      <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 text-[11px] text-left">
                        {pressureParsedPreview.readyScenarios.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-start border-b border-zinc-900/40 pb-1.5 last:border-0 last:pb-0">
                            <div>
                              <span className="text-zinc-100 font-bold font-mono">{q.scenarioName}</span>
                              <span className="text-[9px] text-zinc-500 block font-sans">{q.story.substring(0, 80)}...</span>
                            </div>
                            <span className="px-1.5 py-0.5 text-[8px] rounded border border-cyan-500/20 bg-cyan-950/15 text-cyan-400 uppercase font-mono">
                              {q.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-900 mt-auto flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setPressureBulkStep("INPUT"); }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Editor
                    </button>
                    <button
                      onClick={handleExecuteBulkPressure}
                      disabled={pressureParsedPreview.readyScenarios.length === 0}
                      className={`px-5 py-2.5 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        pressureParsedPreview.readyScenarios.length === 0
                          ? "bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Ingest Scenarios ({pressureParsedPreview.readyScenarios.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: RESULT */}
              {pressureBulkStep === "RESULT" && pressureImportResultData && (
                <div className="p-6 flex flex-col flex-1 overflow-y-auto text-xs space-y-5">
                  <div className="text-center py-6 space-y-2">
                    <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="text-base font-bold text-white uppercase tracking-wider font-mono">Ingestion Completed!</h4>
                    <p className="text-zinc-400 max-w-md mx-auto leading-relaxed font-sans">
                      Successfully parsed, balanced, and imported <strong className="text-emerald-400">{pressureImportResultData.successCount}</strong> pressure scenarios into the Pressure library.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 space-y-2 font-mono text-left">
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-400">Total Scenarios Ingested:</span>
                      <span className="text-emerald-400 font-bold font-mono">+{pressureImportResultData.successCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-2">
                      <span className="text-zinc-400">Duplicates / Skipped:</span>
                      <span className="text-rose-400 font-bold font-mono">{pressureImportResultData.skippedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Database Status:</span>
                      <span className="text-cyan-400 font-bold font-mono">Synchronized</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 mt-auto flex justify-end">
                    <button
                      type="button"
                      onClick={() => { playSystemClick(); setIsPressureBulkOpen(false); setPressureBulkStep("INPUT"); }}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold font-mono"
                    >
                      <Check className="w-4 h-4" />
                      <span>Close Wizard</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE PRESSURE SCENARIO MODAL EDITOR */}
      <AnimatePresence>
        {isPressureModalOpen && editingScenario && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-cyan-500/30 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,217,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#0d0d1c]">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-cyan-400 block font-mono uppercase tracking-widest font-bold">PRESSURE STRESS COMPILER</span>
                  <h3 className="text-sm font-black font-mono text-white uppercase tracking-wider">
                    {editingScenario.scenarioId ? `EDIT SCENARIO: ${editingScenario.scenarioId}` : "CREATE NEW PRESSURE SCENARIO"}
                  </h3>
                </div>
                <button
                  onClick={() => { playSystemClick(); setIsPressureModalOpen(false); setEditingScenario(null); }}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveScenario} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Scenario Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flight Turbulence Matrix"
                      value={editingScenario.scenarioName || ""}
                      onChange={(e) => setEditingScenario({ ...editingScenario, scenarioName: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white font-sans text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Story Premise / Background Context</label>
                    <textarea
                      required
                      placeholder="The batting team needs 28 runs off 5 overs. The pitch has lost grip under dew. Re-engage flight coordinates to choke boundaries."
                      value={editingScenario.story || ""}
                      onChange={(e) => setEditingScenario({ ...editingScenario, story: e.target.value })}
                      className="w-full h-16 bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white font-sans text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Overs Remaining</label>
                    <select
                      value={editingScenario.oversRemaining || 2}
                      onChange={(e) => setEditingScenario({ ...editingScenario, oversRemaining: Number(e.target.value) })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="2">2 Overs</option>
                      <option value="5">5 Overs</option>
                      <option value="10">10 Overs</option>
                      <option value="20">20 Overs</option>
                      <option value="30">30 Overs</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Stress Difficulty Rating</label>
                    <select
                      value={editingScenario.difficultyRating || "MEDIUM"}
                      onChange={(e) => setEditingScenario({ ...editingScenario, difficultyRating: e.target.value as any })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="DIFFICULT">DIFFICULT</option>
                      <option value="EXTREME">EXTREME (Unrivalled Chaos)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Runs To Defend Limit</label>
                    <input
                      type="number"
                      required
                      value={editingScenario.runsLimit || ""}
                      onChange={(e) => setEditingScenario({ ...editingScenario, runsLimit: Number(e.target.value) })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Target Wickets to Claim</label>
                    <input
                      type="number"
                      required
                      value={editingScenario.wicketsTarget || ""}
                      onChange={(e) => setEditingScenario({ ...editingScenario, wicketsTarget: Number(e.target.value) })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Pitch Surface</label>
                    <select
                      value={editingScenario.pitch || "Turning"}
                      onChange={(e) => setEditingScenario({ ...editingScenario, pitch: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="Green">Green (Grass seam bounce)</option>
                      <option value="Dry">Dry (Stable spinning deck)</option>
                      <option value="Dust">Dust (Square turning speed)</option>
                      <option value="Turning">Turning (Abrasive drift friction)</option>
                      <option value="Cracked">Cracked (Unpredictable height deviation)</option>
                      <option value="Wet">Wet (Compromised finger grip)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Weather Sky Conditions</label>
                    <select
                      value={editingScenario.weather || "Cloudy"}
                      onChange={(e) => setEditingScenario({ ...editingScenario, weather: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="Sunny">Sunny</option>
                      <option value="Cloudy">Cloudy</option>
                      <option value="Rain Threat">Rain Threat</option>
                      <option value="Heavy Dew">Heavy Dew (Night dampness)</option>
                      <option value="Fog">Fog</option>
                      <option value="Wind">Wind (Strong horizontal cross-drift)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Batting Team Strategy</label>
                    <select
                      value={editingScenario.battingTeamStyle || "Aggressive"}
                      onChange={(e) => setEditingScenario({ ...editingScenario, battingTeamStyle: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    >
                      <option value="Aggressive">Aggressive (Boundary hunters)</option>
                      <option value="Defensive">Defensive (Strike rotators)</option>
                      <option value="Balanced">Balanced</option>
                      <option value="Spin Attackers">Spin Attackers (Sweep exponents)</option>
                      <option value="Power Hitters">Power Hitters (Lofted lofting models)</option>
                      <option value="Tail Enders">Tail Enders (Prone to flight traps)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Field Restrictions</label>
                    <input
                      type="text"
                      placeholder="e.g. Max 3 fielders deep"
                      value={editingScenario.fieldRestrictions || ""}
                      onChange={(e) => setEditingScenario({ ...editingScenario, fieldRestrictions: e.target.value })}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Special Match Events (Delimited list)</label>
                    <input
                      type="text"
                      placeholder="Comma-separated e.g. Strong crosswind, Ball wetness, Crowd pressure"
                      value={specialEventsInput}
                      onChange={(e) => setSpecialEventsInput(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none text-zinc-300"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Scenario Objectives Text</label>
                    <textarea
                      required
                      placeholder="e.g. Secure a win defending under 15 runs while capturing 2 wickets."
                      value={editingScenario.objectives || ""}
                      onChange={(e) => setEditingScenario({ ...editingScenario, objectives: e.target.value })}
                      className="w-full h-16 bg-black/60 border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-cyan-500 text-white font-sans text-xs"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-5 mt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { playSystemClick(); setIsPressureModalOpen(false); setEditingScenario(null); }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Publish Scenario
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED PREVIEW CARD MODAL */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-cyan-500/40 w-full max-w-lg rounded-2xl p-6 shadow-[0_0_55px_rgba(0,217,255,0.3)] relative text-zinc-300 font-mono text-xs space-y-4"
            >
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-cyan-400 block uppercase tracking-widest font-black">CORE COMPILED PREVIEW</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {previewItem.name || previewItem.scenarioName}
                  </h3>
                </div>
                <button
                  onClick={() => { playSystemClick(); setPreviewItem(null); }}
                  className="p-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QUEST TYPE SPECIFIC PREVIEW */}
              {"difficulty" in previewItem ? (
                <div className="space-y-3.5">
                  <div className="bg-[#050508] border border-zinc-900 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">QUEST CODEX ID:</span>
                      <strong className="text-white">{previewItem.id}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">SKILL INSTANCE:</span>
                      <strong className="text-cyan-400">{previewItem.targetSkill || previewItem.skillName}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">DIFFICULTY RANK:</span>
                      <strong className="text-amber-400">{previewItem.difficulty}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">ARENA DEPLOYMENT:</span>
                      <strong className="text-white uppercase">{previewItem.arena}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">MINIMUM OVERS:</span>
                      <strong className="text-white">{previewItem.overs || previewItem.requirements?.oversMin || 2} OVERS</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">QUEST TIER:</span>
                      <strong className="text-purple-400 uppercase">{previewItem.questTier || "INITIATE (TIER 1)"}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">QUEST SYSTEM WEIGHT:</span>
                      <strong className="text-purple-400">{previewItem.questWeight || 1.0}x</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Objectives Narrative</span>
                    <p className="p-3 bg-black/60 rounded-xl text-zinc-300 leading-relaxed font-sans text-[11px] border border-zinc-900">
                      "{previewItem.objectivesText || previewItem.description}"
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">COMPUTED SYSTEM REWARDS</span>
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="bg-[#0e0e1a]/80 p-3 rounded-xl border border-emerald-950">
                        <span className="text-[8px] text-zinc-500 uppercase block">PLAYER XP</span>
                        <strong className="text-emerald-400 text-sm mt-0.5 block">+{previewItem.xpReward}</strong>
                      </div>
                      <div className="bg-[#0e0e1a]/80 p-3 rounded-xl border border-cyan-950">
                        <span className="text-[8px] text-zinc-500 uppercase block">MASTERY XP</span>
                        <strong className="text-cyan-400 text-sm mt-0.5 block">+{previewItem.masteryReward}</strong>
                      </div>
                      <div className="bg-[#0e0e1a]/80 p-3 rounded-xl border border-purple-950">
                        <span className="text-[8px] text-zinc-500 uppercase block">BONUS XP</span>
                        <strong className="text-purple-400 text-sm mt-0.5 block">+{previewItem.bonusXp || 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* PRESSURE SCENARIO PREVIEW */
                <div className="space-y-3.5">
                  <div className="bg-[#050508] border border-zinc-900 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">SCENARIO CODE ID:</span>
                      <strong className="text-white">{previewItem.scenarioId}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">DDA DIFFICULTY:</span>
                      <strong className="text-rose-400">{previewItem.difficultyRating}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">OVERS GOAL:</span>
                      <strong className="text-white">{previewItem.oversRemaining} OVERS</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">RUNS TO DEFEND:</span>
                      <strong className="text-white">{previewItem.runsLimit} RUNS</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">ECONOMY CEILING:</span>
                      <strong className="text-yellow-400">{previewItem.economyTarget || (previewItem.runsLimit / previewItem.oversRemaining).toFixed(1)} / Over</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">PITCH & SURFACE:</span>
                      <strong className="text-white uppercase">{previewItem.pitch} SURFACE</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">WEATHER CRITERIA:</span>
                      <strong className="text-white uppercase">{previewItem.weather}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500">RISK INDEX:</span>
                      <strong className="text-rose-500 uppercase font-black">{previewItem.riskRating}</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">TACTICAL STORY PREMISE</span>
                    <p className="p-3 bg-black/60 rounded-xl text-zinc-300 leading-relaxed font-sans text-[11px] border border-zinc-900">
                      "{previewItem.story || previewItem.matchContext}"
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">STRESS COMPILATION METRICS</span>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-[#0e0e1a]/80 p-3 rounded-xl border border-rose-950">
                        <span className="text-[8px] text-zinc-500 uppercase block">DIFFICULTY SCORE</span>
                        <strong className="text-rose-400 text-sm mt-0.5 block">{previewItem.scenarioDifficultyScore || 75} / 100</strong>
                      </div>
                      <div className="bg-[#0e0e1a]/80 p-3 rounded-xl border border-cyan-950">
                        <span className="text-[8px] text-zinc-500 uppercase block">XP REWARD POOL</span>
                        <strong className="text-cyan-400 text-sm mt-0.5 block">+{previewItem.xpReward} XP</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-900 pt-4 flex justify-end">
                <button
                  onClick={() => { playSystemClick(); setPreviewItem(null); }}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white rounded-xl transition-colors cursor-pointer text-xs"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE QUEST DELETE CONFIRMATION POPUP */}
      <AnimatePresence>
        {questToDelete && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 font-mono text-xs text-white">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-rose-500/40 w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.25)] p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-wider">Delete Quest Record?</h3>
              </div>

              <p className="text-zinc-300 leading-relaxed text-left">
                Delete this quest permanently?
              </p>

              <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 text-left">
                <div className="text-[10px] text-zinc-500 uppercase">QUEST TITLE</div>
                <div className="text-white font-bold text-xs truncate">{questToDelete.name}</div>
                <div className="text-[9px] text-cyan-400 font-mono mt-1">ID: {questToDelete.id}</div>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed text-left">
                This action cannot be undone. The quest will be wiped instantly from local storage cache.
              </p>

              <div className="flex justify-end gap-3 pt-2 text-xs">
                <button
                  onClick={() => { playSystemClick(); setQuestToDelete(null); }}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    playSystemClick();
                    QuestDatabaseManager.deleteQuest(questToDelete.id);
                    addRecentLog(`Deleted Quest: ${questToDelete.name}`);
                    playSystemDing();
                    setQuestToDelete(null);
                    notifyChanges();
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                >
                  Delete Quest
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLEAR ALL QUESTS DANGEROUS CONFIRMATION POPUP */}
      <AnimatePresence>
        {isClearAllOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4 font-mono text-xs text-white">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-rose-600 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-[0_0_60px_rgba(244,63,94,0.35)]"
            >
              <div className="flex items-center gap-3 text-rose-500 border-b border-zinc-900 pb-3">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
                <div className="text-left">
                  <span className="text-[8px] text-rose-400 block tracking-widest uppercase font-black">CRITICAL ACTION REQUIRED</span>
                  <h3 className="text-base font-black uppercase tracking-wider">WARNING</h3>
                </div>
              </div>

              <div className="space-y-2.5 text-zinc-300 leading-relaxed text-left">
                <p className="font-bold text-zinc-200">
                  This will permanently delete every quest stored in the Quest Database.
                </p>
                <p className="text-rose-400 font-bold">
                  This action CANNOT be undone.
                </p>
                <p className="text-zinc-400">
                  To continue type <strong className="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">DELETE</strong>
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <input
                  type="text"
                  placeholder="Type 'DELETE' here to authorize"
                  value={clearAllConfirmText}
                  onChange={(e) => setClearAllConfirmText(e.target.value)}
                  className="w-full bg-black/80 border border-zinc-850 focus:border-rose-500 focus:outline-none p-3.5 rounded-xl text-center font-bold tracking-widest text-white uppercase text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 text-xs">
                <button
                  onClick={() => { playSystemClick(); setIsClearAllOpen(false); setClearAllConfirmText(""); }}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={clearAllConfirmText !== "DELETE"}
                  onClick={() => {
                    playSystemDing();
                    QuestDatabaseManager.clearAllQuests();
                    addRecentLog("Cleared Entire Quest Database");
                    notifyChanges();
                    setIsClearAllOpen(false);
                    setClearAllConfirmText("");
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    clearAllConfirmText === "DELETE"
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                      : "bg-zinc-950/20 border border-zinc-900 text-zinc-650 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear entire database</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MULTI QUESTS DELETE CONFIRMATION POPUP */}
      <AnimatePresence>
        {isMultiDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4 font-mono text-xs text-white">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b14] border border-rose-500/40 w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.25)] p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-wider">Delete Selected Quests?</h3>
              </div>

              <p className="text-zinc-300 leading-relaxed text-left">
                Delete <strong className="text-rose-400 font-bold">{selectedQuestIds.length}</strong> selected quests permanently?
              </p>

              <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 text-left max-h-32 overflow-y-auto space-y-1">
                {selectedQuestIds.map((id) => {
                  const quest = quests.find(q => q.id === id);
                  return (
                    <div key={id} className="text-[10px] text-zinc-400 font-mono truncate">
                      • <span className="text-rose-400">[{id}]</span> {quest ? quest.name : "Unknown Quest"}
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed text-left">
                This action cannot be undone. The selected quests will be wiped instantly from storage and local cache.
              </p>

              <div className="flex justify-end gap-3 pt-2 text-xs">
                <button
                  onClick={() => { playSystemClick(); setIsMultiDeleteConfirmOpen(false); }}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    playSystemClick();
                    selectedQuestIds.forEach((id) => {
                      QuestDatabaseManager.deleteQuest(id);
                    });
                    addRecentLog(`Deleted ${selectedQuestIds.length} Quests`);
                    playSystemDing();
                    setSelectedQuestIds([]);
                    setIsMultiDeleteConfirmOpen(false);
                    setIsMultiSelect(false);
                    notifyChanges();
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                >
                  Delete Selected
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
