import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, ShieldCheck, Zap, AlertTriangle, 
  ArrowUp, Trophy, Compass, Search, Calendar, 
  Filter, Sparkles, Clock 
} from "lucide-react";
import { EvolutionLogEntry } from "../types";

interface ChronicleLogProps {
  logs: EvolutionLogEntry[];
}

export default function ChronicleLog({ logs }: ChronicleLogProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");

  // Filter logs based on selection and search
  const filteredLogs = logs.filter((log) => {
    const matchesCategory = filterCategory === "all" || log.category === filterCategory;
    const matchesSearch = 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateTimeA = new Date(`${a.date || "2026-06-02"}T${a.timestamp || "00:00"}`).getTime();
    const dateTimeB = new Date(`${b.date || "2026-06-02"}T${b.timestamp || "00:00"}`).getTime();
    return sortByDate === "desc" ? dateTimeB - dateTimeA : dateTimeA - dateTimeB;
  });

  // Helper to render Category labels and badges
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case "system":
        return { label: "System Core", color: "text-blue-400 bg-blue-950/20 border-blue-500/20" };
      case "quest":
        return { label: "Quest Log", color: "text-purple-400 bg-purple-950/20 border-purple-500/20" };
      case "warning":
        return { label: "Warning Alert", color: "text-red-400 bg-red-950/20 border-red-500/20" };
      case "level_up":
        return { label: "Level Up", color: "text-cyan-400 bg-cyan-950/20 border-cyan-500/10" };
      case "rank_up":
        return { label: "Rank Up", color: "text-yellow-400 bg-yellow-950/20 border-yellow-500/20" };
      case "title":
        return { label: "Title Shift", color: "text-indigo-400 bg-indigo-950/20 border-indigo-500/20" };
      default:
        return { label: "Standard", color: "text-gray-400 bg-gray-900 border-gray-800" };
    }
  };

  const getSeverityIcon = (sev: string, cat: string) => {
    if (cat === "warning") return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
    if (cat === "level_up") return <ArrowUp className="w-4 h-4 text-cyan-400" />;
    if (cat === "rank_up") return <Trophy className="w-4 h-4 text-yellow-400 animate-bounce" />;
    if (cat === "title") return <Sparkles className="w-4 h-4 text-indigo-400" />;

    switch (sev) {
      case "epic":
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case "success":
        return <ShieldCheck className="w-4 h-4 text-green-400" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-cyan-400 m-1" />;
    }
  };

  return (
    <div id="monarch-chronicle-log-section" className="space-y-6 p-6 bg-[#080808] border border-gray-905 rounded-xl relative overflow-hidden">
      {/* Background Hologram Effect */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7B2FFF]/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-900">
        <div>
          <h2 className="text-sm font-bold font-mono text-[#00D4FF] uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 animate-spin-slow" /> CHRONICLES OF EXCELLENCE
          </h2>
          <span className="text-[10px] text-gray-500 font-mono">SEPARATE MULTI-LAYER AUDIT TRAIL</span>
        </div>

        {/* STAT OVERVIEW BANNER */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[9px] font-mono text-gray-500 block uppercase">TOTAL RECORDS</span>
            <span className="text-xs font-bold font-mono text-white">{logs.length} AUDITS</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono text-gray-500 block uppercase">WARNINGS</span>
            <span className="text-xs font-bold font-mono text-crimson-red text-red-500">
              {logs.filter(l => l.category === "warning").length} ALERTS
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER CRADLES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search within logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-gray-900 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Filters */}
        <div className="md:col-span-6 flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Logs" },
            { id: "system", label: "Core" },
            { id: "quest", label: "Quests" },
            { id: "warning", label: "Warnings" },
            { id: "level_up", label: "Level Ups" },
            { id: "rank_up", label: "Rank Ups" },
            { id: "title", label: "Titles" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border shrink-0 transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? "bg-purple-950/40 border-purple-500 text-purple-400 shadow-[0_0_8px_rgba(123,47,255,0.2)]"
                  : "bg-black/40 border-gray-950 text-gray-500 hover:text-gray-300 hover:border-gray-905"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sorting selection toggler */}
        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={() => setSortByDate(sortByDate === "desc" ? "asc" : "desc")}
            className="w-full md:w-auto px-3 py-1.5 bg-[#121212] border border-gray-900 rounded text-[10px] font-mono text-gray-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            {sortByDate === "desc" ? "NEWEST FIRST" : "OLDEST FIRST"}
          </button>
        </div>
      </div>

      {/* MAIN LOG WINDOW GRID */}
      <div className="border border-gray-950 rounded bg-[#030303]/40 p-4 min-h-[300px]">
        {sortedLogs.length > 0 ? (
          <div className="relative border-l border-gray-900 ml-4 pl-6 space-y-5.5">
            <AnimatePresence mode="popLayout">
              {sortedLogs.map((log, index) => {
                const catInfo = getCategoryDetails(log.category || "");
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
                    className="group relative bg-[#0b0b0b] border border-gray-905 hover:border-gray-900 rounded-lg p-3.5 transition-all"
                  >
                    {/* Glowing Timeline Connector dot */}
                    <div className="absolute -left-[31px] top-4.5 w-2.5 h-2.5 rounded-full bg-black border border-gray-900 group-hover:border-purple-500 transition-colors flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full group-hover:scale-150 transition-all" />
                    </div>

                    {/* Metadata Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-gray-950">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(log.severity, log.category || "")}
                        <h4 className="text-xs font-black font-sans text-white uppercase tracking-wide">
                          {log.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-[9px] font-mono">
                        <span className={`px-2 py-0.5 border rounded uppercase font-bold text-[8px] ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                        
                        <div className="flex items-center gap-1 text-gray-550 mr-1.5 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{log.date || "2026-06-02"}</span>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body content */}
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      {log.description}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Compass className="w-10 h-10 text-gray-750 animate-pulse" />
            <div>
              <h4 className="text-xs font-mono text-gray-400 uppercase">NO ALIGNED TIMELINE RECONSTRUCT</h4>
              <p className="text-[10px] text-gray-600 max-w-sm mt-1">Adjust search parameters or complete more drills, dungeons, or quests inside the Monarch mainframe.</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 text-center border-t border-gray-950">
        <span className="text-[9px] font-mono text-gray-600">
          ALL MONARCH SYSTEMS ACTIVE • HISTORY STREAM LOGGED LOCALLY ON CONSOLE INTERNALS
        </span>
      </div>
    </div>
  );
}
