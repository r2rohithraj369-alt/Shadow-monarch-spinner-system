import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings, Palette, Image, Sliders, Volume2, Bell, Play, Database, Info, 
  Sparkles, Check, Trash2, Download, Upload, RefreshCw, Eye, Save, VolumeX,
  Plus, CheckCircle, ShieldAlert, Zap, Globe, Cpu, Gamepad2, Layers, SlidersHorizontal,
  Star
} from "lucide-react";
import { AppSettings, BUILT_IN_THEMES, BACKGROUNDS, SettingsManager, ThemePreset } from "../utils/settingsManager";
import { playSystemClick, playSystemDing, playPortalSwoosh } from "../utils/audio";

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetSettings: () => void;
}

export default function SettingsPage({
  settings,
  onUpdateSettings,
  onResetSettings
}: SettingsPageProps) {
  // Navigation tabs in settings page
  const [activeSubTab, setActiveSubTab] = useState<string>("THEMES");

  // Custom theme editor state
  const [customPrimary, setCustomPrimary] = useState("#8B5CF6");
  const [customAccent, setCustomAccent] = useState("#EC4899");
  const [customGlow, setCustomGlow] = useState("#A78BFA");
  const [customBgStart, setCustomBgStart] = useState("#05020c");
  const [customBgEnd, setCustomBgEnd] = useState("#110724");
  const [customCardBg, setCustomCardBg] = useState("#150b2b");
  const [customBorder, setCustomBorder] = useState("rgba(139, 92, 246, 0.25)");
  const [customHighlight, setCustomHighlight] = useState("#F472B6");
  const [customThemeName, setCustomThemeName] = useState("My Radiant Void");

  // Database stats
  const [dbStats, setDbStats] = useState(() => SettingsManager.getDatabaseStatistics());

  // FPS Counter
  const [fps, setFps] = useState(60);

  // Search and Category filtering states
  const [themeSearch, setThemeSearch] = useState("");
  const [themeCategory, setThemeCategory] = useState("All");
  const [bgSearch, setBgSearch] = useState("");
  const [bgCategory, setBgCategory] = useState("All");

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let frames = 0;

    const tick = () => {
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }
      frameId = requestAnimationFrame(tick);
    };

    if (settings.gameplay.fpsCounter) {
      frameId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(frameId);
  }, [settings.gameplay.fpsCounter]);

  // Recalculate stats when requested
  const handleRefreshStats = () => {
    playSystemDing();
    setDbStats(SettingsManager.getDatabaseStatistics());
  };

  const handleUpdateAppearance = (key: string, value: any) => {
    const updated = {
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value
      }
    };
    onUpdateSettings(updated);
  };

  const handleUpdateBackground = (key: string, value: any) => {
    const updated = {
      ...settings,
      background: {
        ...settings.background,
        [key]: value
      }
    };
    onUpdateSettings(updated);
  };

  const handleUpdateParticles = (key: string, value: boolean) => {
    const updated = {
      ...settings,
      particles: {
        ...settings.particles,
        [key]: value
      }
    };
    onUpdateSettings(updated);
  };

  const handleUpdateUiEffects = (key: string, value: boolean) => {
    const updated = {
      ...settings,
      uiEffects: {
        ...settings.uiEffects,
        [key]: value
      }
    };
    onUpdateSettings(updated);
  };

  const handleUpdateSound = (key: string, value: number) => {
    const updated = {
      ...settings,
      sound: {
        ...settings.sound,
        [key]: value
      }
    };
    onUpdateSettings(updated);

    // If audioManager settings need updating, we let App.tsx handle it through state updates
  };

  const handleUpdateNotifications = (key: string, value: boolean) => {
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    };
    onUpdateSettings(updated);
  };

  const handleUpdateGameplay = (key: string, value: boolean) => {
    const updated = {
      ...settings,
      gameplay: {
        ...settings.gameplay,
        [key]: value
      }
    };
    onUpdateSettings(updated);
  };

  const handleSelectTheme = (themeId: string) => {
    playPortalSwoosh();
    const updated = {
      ...settings,
      colorTheme: themeId
    };
    onUpdateSettings(updated);
  };

  const handleToggleFavoriteTheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSystemClick();
    const currentFavorites = settings.favoriteThemes || [];
    const updatedFavorites = currentFavorites.includes(themeId)
      ? currentFavorites.filter(id => id !== themeId)
      : [...currentFavorites, themeId];

    onUpdateSettings({
      ...settings,
      favoriteThemes: updatedFavorites
    });
  };

  const handleToggleFavoriteBackground = (bgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSystemClick();
    const currentFavorites = settings.favoriteBackgrounds || [];
    const updatedFavorites = currentFavorites.includes(bgId)
      ? currentFavorites.filter(id => id !== bgId)
      : [...currentFavorites, bgId];

    onUpdateSettings({
      ...settings,
      favoriteBackgrounds: updatedFavorites
    });
  };

  const handleUploadWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const urlStr = event.target?.result as string;
        if (!urlStr) return;

        const newWallpaper = {
          id: `wp-${Date.now()}`,
          name: file.name.split(".")[0] || "Custom Wallpaper",
          url: urlStr,
          blur: 0,
          opacity: 100,
          darknessOverlay: 20,
          brightness: 100
        };

        const currentWps = settings.customWallpapers || [];
        onUpdateSettings({
          ...settings,
          customWallpapers: [...currentWps, newWallpaper],
          activeCustomWallpaperId: newWallpaper.id
        });
        playSystemDing();
      } catch (err) {
        alert("Verification failed. Image corruption or invalid format.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteWallpaper = (wpId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSystemClick();
    const currentWps = settings.customWallpapers || [];
    const filtered = currentWps.filter(w => w.id !== wpId);
    let nextActive = settings.activeCustomWallpaperId;
    if (nextActive === wpId) {
      nextActive = null;
    }
    onUpdateSettings({
      ...settings,
      customWallpapers: filtered,
      activeCustomWallpaperId: nextActive
    });
  };

  const handleUpdateCustomWallpaperParam = (wpId: string, key: string, value: number) => {
    const currentWps = settings.customWallpapers || [];
    const updated = currentWps.map(w => {
      if (w.id === wpId) {
        return { ...w, [key]: value };
      }
      return w;
    });
    onUpdateSettings({
      ...settings,
      customWallpapers: updated
    });
  };

  const handleSaveCustomTheme = () => {
    playSystemDing();
    const newCustom: ThemePreset = {
      id: `custom-${Date.now()}`,
      name: customThemeName || "Bespoke Calibration",
      primary: customPrimary,
      secondary: customHighlight,
      glow: customGlow,
      accent: customAccent,
      bgStart: customBgStart,
      bgEnd: customBgEnd,
      cardBg: customCardBg,
      border: customBorder,
      textHighlight: customHighlight,
      progressBarColor: customPrimary,
      description: "Individually synthesized spectrum settings.",
      isCustom: true
    };

    const updated = {
      ...settings,
      colorTheme: "custom",
      customTheme: newCustom,
      savedCustomThemes: [newCustom, ...settings.savedCustomThemes]
    };
    onUpdateSettings(updated);
  };

  const handleDeleteCustomTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSystemClick();
    const filtered = settings.savedCustomThemes.filter(t => t.id !== id);
    let nextTheme = settings.colorTheme;
    let nextCustom = settings.customTheme;

    if (settings.customTheme?.id === id) {
      if (filtered.length > 0) {
        nextCustom = filtered[0];
        nextTheme = "custom";
      } else {
        nextCustom = null;
        nextTheme = "shadow-monarch";
      }
    }

    onUpdateSettings({
      ...settings,
      colorTheme: nextTheme,
      customTheme: nextCustom,
      savedCustomThemes: filtered
    });
  };

  // Export profile & setting data
  const handleExportData = () => {
    playSystemDing();
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("monarch_") || key.startsWith("supabase_"))) {
        allData[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monarch_nexus_calibration_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import profile and settings
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === "object") {
          Object.keys(parsed).forEach(key => {
            localStorage.setItem(key, parsed[key]);
          });
          playPortalSwoosh();
          alert("Monarch Nexus database successfully calibrated. Reloading application...");
          window.location.reload();
        }
      } catch (err) {
        alert("Corrupted data profile. Verification failed.");
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (confirm("Resetting cache will clear offline backups and restore factory values. Proceed?")) {
      playPortalSwoosh();
      localStorage.clear();
      window.location.reload();
    }
  };

  // Sound play utility for UI slider feedback
  const handleTestSound = (type: string) => {
    playSystemDing();
  };

  // Themes list including saved custom ones
  const allThemes = [...BUILT_IN_THEMES, ...settings.savedCustomThemes];
  const activeThemeObj = SettingsManager.getTheme(settings);

  const subTabs = [
    { id: "THEMES", label: "Color Themes", icon: Palette, desc: "Recolor entire operating interface" },
    { id: "BACKGROUNDS", label: "Background Artwork", icon: Image, desc: "Personalize backdrop categories" },
    { id: "APPEARANCE", label: "Appearance Params", icon: Sliders, desc: "Scale, compact modes & transparency" },
    { id: "EFFECTS", label: "UI & Particles", icon: Sparkles, desc: "Manage high-fidelity particles & glowing effects" },
    { id: "SOUND", label: "Audio Terminal", icon: Volume2, desc: "Fine-tune individual volume variables" },
    { id: "GAMEPLAY", label: "Preferences", icon: Gamepad2, desc: "Performance switches & notification signals" },
    { id: "STORAGE", label: "Data & Storage", icon: Database, desc: "Export credentials & inspect local caches" },
    { id: "ABOUT", label: "Version Manual", icon: Info, desc: "System release notes & credentials" }
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-white font-mono">
      {/* HEADER SECTION */}
      <div className="bg-[#050505] border border-gray-900 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="absolute right-0 top-0 pointer-events-none w-72 h-72 bg-cyan-950/10 rounded-full filter blur-[100px]" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0c0d1b] to-black border border-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(0,217,255,0.2)]">
            <Settings className="w-7 h-7 animate-spin-slow" style={{ animationDuration: "10s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-gray-300 to-cyan-400 bg-clip-text text-transparent">Personalization Hub</h1>
              <span className="text-[9px] bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-black">
                CONSOLE SETTINGS
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Alter operating system appearance, color waves, backdrops, performance limiters, and sound coefficients on the fly.
            </p>
          </div>
        </div>

        {/* STATUS CARD */}
        <div className="flex gap-4 shrink-0 text-xs w-full md:w-auto">
          {settings.gameplay.fpsCounter && (
            <div className="bg-black/80 px-4 py-2.5 rounded-xl border border-gray-900 leading-tight flex-1 md:flex-none">
              <span className="text-gray-500 block text-[9px] uppercase tracking-widest">NEXUS RENDERER</span>
              <span className={`font-extrabold block mt-0.5 ${fps >= 55 ? "text-emerald-400" : fps >= 30 ? "text-yellow-400" : "text-rose-400"}`}>
                {fps} FPS
              </span>
            </div>
          )}
          <div className="bg-black/80 px-4 py-2.5 rounded-xl border border-gray-900 leading-tight flex-1 md:flex-none">
            <span className="text-gray-500 block text-[9px] uppercase tracking-widest">Active System Theme</span>
            <span className="text-cyan-400 font-extrabold truncate max-w-[160px] block mt-0.5">
              {activeThemeObj.name}
            </span>
          </div>
        </div>
      </div>

      {/* SETTINGS MENU SUB-PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: NAVIGATION LIST */}
        <div className="lg:col-span-4 bg-[#050505] border border-gray-900 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block px-2 pb-1 border-b border-gray-900 mb-3">
            SETTINGS DIRECTORIES
          </span>
          <div className="space-y-1">
            {subTabs.map((tab) => {
              const isSelected = activeSubTab === tab.id;
              const IconComp = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => { playSystemClick(); setActiveSubTab(tab.id); }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-left transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? "bg-gradient-to-r from-[#0d1424] to-black border-cyan-500/50 text-white shadow-[0_0_10px_rgba(0,217,255,0.1)]"
                      : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4.5 h-4.5 transition-colors ${isSelected ? "text-cyan-400" : "text-gray-500 group-hover:text-white"}`} />
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-wider leading-none">{tab.label}</span>
                      <span className="text-[9px] text-gray-500 font-sans mt-1 block leading-none">{tab.desc}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { playSystemDing(); onResetSettings(); }}
            className="w-full mt-4 py-2 border border-dashed border-rose-500/20 hover:border-rose-500/50 text-rose-400/80 hover:text-rose-400 hover:bg-rose-950/10 text-[10px] font-bold rounded-lg transition-colors uppercase cursor-pointer"
          >
            Reset Factory Calibration
          </button>
        </div>

        {/* RIGHT COLUMN: MAIN PANEL INTERACTIVE SHEETS */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="wait">
            {activeSubTab === "THEMES" && (
              <motion.div
                key="THEMES"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* INTERACTIVE COMPREHENSIVE LIVE PREVIEW */}
                <div className="border border-gray-900 rounded-2xl p-5 bg-[#030303] relative overflow-hidden">
                  <span className="text-[9px] text-cyan-400 font-black tracking-widest block uppercase mb-4">Live Interface Preview Node</span>
                  
                  {/* Fake UI Preview Card */}
                  <div className="p-4 rounded-xl border relative overflow-hidden transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${activeThemeObj.bgStart}, ${activeThemeObj.bgEnd})`,
                      borderColor: activeThemeObj.border
                    }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeThemeObj.primary }} />
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: activeThemeObj.textHighlight }}>SYSTEM SYNCHRONIZED</span>
                      </div>
                      <span className="text-[9px] text-gray-400">ARENA: VOID SANCTUM</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border text-xs space-y-2" style={{ backgroundColor: activeThemeObj.cardBg, borderColor: activeThemeObj.border }}>
                        <h4 className="font-extrabold uppercase tracking-widest text-[11px]" style={{ color: activeThemeObj.textHighlight }}>Shadow Spin Mastery</h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                          Maintain perfect wrist flexion at 45 degrees. Align indices for deep drift acceleration.
                        </p>
                      </div>

                      {/* Fake Progress / XP Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-gray-400">
                          <span>SYSTEM INTEGRATION LEVEL 12</span>
                          <span style={{ color: activeThemeObj.textHighlight }}>74% SYNCED</span>
                        </div>
                        <div className="h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-gray-900">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: "74%", backgroundColor: activeThemeObj.primary }} />
                        </div>
                      </div>

                      {/* Fake Interactive button */}
                      <div className="flex gap-2">
                        <button className="text-[9px] font-bold px-3 py-1.5 rounded uppercase font-mono shadow transition-all hover:scale-105"
                          style={{
                            backgroundColor: activeThemeObj.primary,
                            color: "#fff"
                          }}
                        >
                          DEPLOY DRILL
                        </button>
                        <button className="text-[9px] font-bold px-3 py-1.5 rounded uppercase font-mono border transition-all"
                          style={{
                            borderColor: activeThemeObj.border,
                            color: activeThemeObj.textHighlight,
                            backgroundColor: "transparent"
                          }}
                        >
                          CALIBRATE AURA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* THEMES GRID */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> BUILT-IN PREMIUM COLORSETS ({allThemes.length})
                      </h3>
                      <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                        Themes recolor menus, sidebars, cards, progress bars, and glows dynamically.
                      </p>
                    </div>

                    {/* LIVE SEARCH BAR */}
                    <input
                      type="text"
                      placeholder="Search themes..."
                      value={themeSearch}
                      onChange={(e) => setThemeSearch(e.target.value)}
                      className="bg-black/60 border border-gray-850 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 w-full md:w-64 focus:border-cyan-500/50 outline-none font-sans"
                    />
                  </div>

                  {/* CATEGORY BUTTON FILTER GROUP */}
                  <div className="flex flex-wrap gap-1.5 border-b border-gray-950 pb-3">
                    {["All", "Favorites", "Purple", "Blue", "Green", "Red", "Gold", "White", "Black", "Cyber", "Fantasy"].map((cat) => {
                      const isSelected = themeCategory === cat;
                      const count = cat === "All" 
                        ? allThemes.length 
                        : cat === "Favorites" 
                          ? (settings.favoriteThemes || []).length 
                          : allThemes.filter(t => t.category === cat).length;

                      return (
                        <button
                          key={cat}
                          onClick={() => { playSystemClick(); setThemeCategory(cat); }}
                          className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border uppercase font-mono cursor-pointer transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#0d1424] to-black border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(0,217,255,0.1)]"
                              : "bg-black/30 border-gray-900 text-gray-400 hover:border-gray-800 hover:text-white"
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                    {allThemes.filter((t) => {
                      const matchesSearch = t.name.toLowerCase().includes(themeSearch.toLowerCase()) ||
                                            t.description.toLowerCase().includes(themeSearch.toLowerCase());
                      if (themeCategory === "All") return matchesSearch;
                      if (themeCategory === "Favorites") {
                        return matchesSearch && (settings.favoriteThemes || []).includes(t.id);
                      }
                      return matchesSearch && t.category === themeCategory;
                    }).map((theme) => {
                      const isSelected = settings.colorTheme === theme.id || 
                        (theme.id.startsWith("custom") && settings.colorTheme === "custom" && settings.customTheme?.id === theme.id);
                      const isFav = (settings.favoriteThemes || []).includes(theme.id);

                      return (
                        <div
                          key={theme.id}
                          onClick={() => handleSelectTheme(theme.isCustom ? "custom" : theme.id)}
                          className={`border rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between group/card ${
                            isSelected 
                              ? "border-cyan-450 bg-[#0c1426]/50 shadow-[0_0_15px_rgba(0,217,255,0.15)]" 
                              : "border-gray-900 bg-black/40 hover:border-gray-850 hover:bg-black/50"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 truncate">
                                {theme.name}
                                {isSelected && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {/* Favorite button */}
                                <button
                                  onClick={(e) => handleToggleFavoriteTheme(theme.id, e)}
                                  className={`p-1 rounded hover:bg-white/5 transition-all cursor-pointer ${
                                    isFav ? "text-amber-400" : "text-gray-600 hover:text-gray-400"
                                  }`}
                                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400" : ""}`} />
                                </button>

                                {theme.isCustom && (
                                  <button
                                    onClick={(e) => handleDeleteCustomTheme(theme.id, e)}
                                    className="text-rose-400 hover:text-rose-500 p-1 rounded hover:bg-rose-950/20"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-sans leading-relaxed min-h-[30px] line-clamp-2">{theme.description}</p>
                          </div>

                          {/* Mini visual colors preview bar */}
                          <div className="flex gap-1.5 mt-3 pt-2 border-t border-gray-900">
                            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: theme.primary }} title="Primary" />
                            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: theme.secondary }} title="Secondary" />
                            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: theme.accent }} title="Accent" />
                            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: theme.glow }} title="Glow" />
                            <div className="w-4 h-4 rounded border border-gray-800 shadow-sm" style={{ backgroundColor: theme.bgStart }} title="Background" />
                          </div>
                        </div>
                      );
                    })}
                    {allThemes.filter((t) => {
                      const matchesSearch = t.name.toLowerCase().includes(themeSearch.toLowerCase()) ||
                                            t.description.toLowerCase().includes(themeSearch.toLowerCase());
                      if (themeCategory === "All") return matchesSearch;
                      if (themeCategory === "Favorites") {
                        return matchesSearch && (settings.favoriteThemes || []).includes(t.id);
                      }
                      return matchesSearch && t.category === themeCategory;
                    }).length === 0 && (
                      <div className="col-span-1 md:col-span-2 py-8 text-center text-xs text-gray-500 border border-dashed border-gray-900 rounded-xl bg-black/20">
                        No color themes matched your current search filters.
                      </div>
                    )}
                  </div>
                </div>

                {/* THEME DESIGNER SUITE */}
                <div className="border border-dashed border-gray-800 rounded-2xl p-5 bg-black/20 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> BESPOKE COLOR MATRIX DESIGNER
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customPrimary.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Accent Highlights</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customAccent.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Glow Halos</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customGlow} onChange={(e) => setCustomGlow(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customGlow.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Text Highlight</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customHighlight} onChange={(e) => setCustomHighlight(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customHighlight.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Background Start</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customBgStart} onChange={(e) => setCustomBgStart(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customBgStart.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Background End</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customBgEnd} onChange={(e) => setCustomBgEnd(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customBgEnd.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Card Fill</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customCardBg} onChange={(e) => setCustomCardBg(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customCardBg.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Border Outlines</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customBorder} onChange={(e) => setCustomBorder(e.target.value)} className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer" />
                        <span className="text-[10px] text-gray-400">{customBorder.substring(0, 7).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-end justify-between border-t border-gray-900 pt-4">
                    <div className="space-y-1.5 w-full md:max-w-xs">
                      <label className="text-[9px] text-gray-500 font-bold block uppercase">Calibration Designation Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Abyssal Flare"
                        value={customThemeName}
                        onChange={(e) => setCustomThemeName(e.target.value)}
                        className="w-full bg-black/60 border border-gray-850 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveCustomTheme}
                      className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 font-extrabold text-[10px] tracking-wider rounded-lg flex items-center gap-2 uppercase transition-all shadow-md cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save custom palette
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === "BACKGROUNDS" && (
              <motion.div
                key="BACKGROUNDS"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 1. CUSTOM GALLERY WALLPAPERS */}
                <div className="border border-dashed border-gray-800 rounded-2xl p-5 bg-black/20 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                        <Upload className="w-4 h-4 animate-bounce" /> PERSONAL WALLPAPER EMBARKATION
                      </h3>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                        Upload custom landscape graphics from your device storage to establish bespoke backdrops.
                      </p>
                    </div>

                    <label className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-extrabold text-[10px] tracking-wider rounded-lg flex items-center gap-2 uppercase cursor-pointer transition-all shrink-0">
                      <Plus className="w-3.5 h-3.5" /> Upload Photo
                      <input type="file" accept="image/*" onChange={handleUploadWallpaper} className="hidden" />
                    </label>
                  </div>

                  {/* Saved Custom Wallpapers Grid */}
                  {(settings.customWallpapers || []).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(settings.customWallpapers || []).map((wp) => {
                        const isSelected = settings.activeCustomWallpaperId === wp.id;

                        return (
                          <div
                            key={wp.id}
                            onClick={() => { playPortalSwoosh(); onUpdateSettings({ ...settings, activeCustomWallpaperId: wp.id }); }}
                            className={`border rounded-xl p-2 cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between group/wp ${
                              isSelected 
                                ? "border-cyan-400 bg-[#0c1426]/50 shadow-[0_0_12px_rgba(0,217,255,0.2)]" 
                                : "border-gray-900 bg-black/40 hover:border-gray-800"
                            }`}
                          >
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-gray-950">
                              <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 group-hover/wp:bg-black/0 transition-colors" />
                              
                              <button
                                onClick={(e) => handleDeleteWallpaper(wp.id, e)}
                                className="absolute right-1 top-1 p-1 bg-black/70 hover:bg-rose-950/80 border border-gray-800 hover:border-rose-500 text-gray-400 hover:text-rose-400 rounded-md transition-all opacity-0 group-hover/wp:opacity-100 z-10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              {isSelected && (
                                <div className="absolute left-1 top-1 bg-cyan-500 text-white p-0.5 rounded-full shadow-md">
                                  <Check className="w-3 h-3 font-bold" />
                                </div>
                              )}
                            </div>

                            <div className="mt-2 flex justify-between items-center px-1">
                              <span className="text-[9px] font-bold text-gray-300 truncate max-w-[100px] block">{wp.name}</span>
                              <span className="text-[8px] text-gray-600 font-mono">CUSTOM</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-[11px] text-gray-500 border border-dashed border-gray-900 rounded-xl bg-black/20 font-sans">
                      No custom wallpapers uploaded yet. Tap the button to select an image.
                    </div>
                  )}

                  {/* INDIVIDUAL SLIDERS FOR SELECTED CUSTOM WALLPAPER */}
                  {settings.activeCustomWallpaperId && settings.customWallpapers?.find(w => w.id === settings.activeCustomWallpaperId) && (() => {
                    const activeWp = settings.customWallpapers.find(w => w.id === settings.activeCustomWallpaperId)!;
                    return (
                      <div className="bg-cyan-950/10 border border-cyan-500/15 p-4 rounded-xl space-y-3.5">
                        <span className="text-[9px] text-cyan-400 font-extrabold tracking-widest block uppercase">
                          CALIBRATING: {activeWp.name}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                              <span>BLUR OVERLAY</span>
                              <span>{activeWp.blur}px</span>
                            </div>
                            <input
                              type="range" min="0" max="24" value={activeWp.blur}
                              onChange={(e) => handleUpdateCustomWallpaperParam(activeWp.id, "blur", parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                              <span>OPACITY SCALE</span>
                              <span>{activeWp.opacity}%</span>
                            </div>
                            <input
                              type="range" min="10" max="100" value={activeWp.opacity}
                              onChange={(e) => handleUpdateCustomWallpaperParam(activeWp.id, "opacity", parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                              <span>DARKNESS COVER</span>
                              <span>{activeWp.darknessOverlay}%</span>
                            </div>
                            <input
                              type="range" min="0" max="100" value={activeWp.darknessOverlay}
                              onChange={(e) => handleUpdateCustomWallpaperParam(activeWp.id, "darknessOverlay", parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                              <span>BRIGHTNESS</span>
                              <span>{activeWp.brightness}%</span>
                            </div>
                            <input
                              type="range" min="20" max="150" value={activeWp.brightness}
                              onChange={(e) => handleUpdateCustomWallpaperParam(activeWp.id, "brightness", parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. PRESETS CATALOG SYSTEM */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <Image className="w-4 h-4" /> PRESET VISUAL DOMAINS ({BACKGROUNDS.length})
                      </h3>
                      <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                        Procedural digital environments that change look based on active orbs, stars, and waves.
                      </p>
                    </div>

                    {/* PRESETS LIVE SEARCH */}
                    <input
                      type="text"
                      placeholder="Search backdrops..."
                      value={bgSearch}
                      onChange={(e) => setBgSearch(e.target.value)}
                      className="bg-black/60 border border-gray-850 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 w-full md:w-64 focus:border-cyan-500/50 outline-none font-sans"
                    />
                  </div>

                  {/* AUTO RANDOM ROTATOR DROPDOWN & SLIDERS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 border border-gray-950 p-4 rounded-xl">
                    <div className="space-y-1.5 col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-950 pb-3">
                      <div className="leading-tight">
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest block">WALLPAPER AUTO RANDOMIZER</span>
                        <span className="text-[9px] text-gray-500 font-sans">Trigger automatic background backdrop cycles on specific intervals or events</span>
                      </div>
                      
                      <select
                        value={settings.randomWallpaperMode || "off"}
                        onChange={(e) => {
                          playSystemClick();
                          onUpdateSettings({ ...settings, randomWallpaperMode: e.target.value as any });
                        }}
                        className="bg-black border border-gray-850 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-mono outline-none cursor-pointer w-full md:w-auto"
                      >
                        <option value="off">Off (Manual Select Only)</option>
                        <option value="launch">On Every App Startup</option>
                        <option value="day">Rotate Randomly Daily</option>
                        <option value="week">Rotate Randomly Weekly</option>
                        <option value="rank">Upon Division Rank Elevation</option>
                        <option value="level">Upon Player Level Milestone</option>
                      </select>
                    </div>

                    {!settings.activeCustomWallpaperId && (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                            <span>GLOBAL PRESENTS OPACITY</span>
                            <span>{settings.background.opacity}%</span>
                          </div>
                          <input
                            type="range" min="10" max="100" value={settings.background.opacity}
                            onChange={(e) => handleUpdateBackground("opacity", parseInt(e.target.value, 10))}
                            className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                            <span>BLUR MATRIX SHIELD</span>
                            <span>{settings.background.blur}px</span>
                          </div>
                          <input
                            type="range" min="0" max="24" value={settings.background.blur}
                            onChange={(e) => handleUpdateBackground("blur", parseInt(e.target.value, 10))}
                            className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                            <span>BRIGHTNESS RATIO</span>
                            <span>{settings.background.brightness}%</span>
                          </div>
                          <input
                            type="range" min="10" max="150" value={settings.background.brightness}
                            onChange={(e) => handleUpdateBackground("brightness", parseInt(e.target.value, 10))}
                            className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                            <span>DARKNESS BLACKOUT COVER</span>
                            <span>{settings.background.darknessOverlay}%</span>
                          </div>
                          <input
                            type="range" min="0" max="100" value={settings.background.darknessOverlay}
                            onChange={(e) => handleUpdateBackground("darknessOverlay", parseInt(e.target.value, 10))}
                            className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-gray-900"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex flex-wrap items-center gap-6 border-t border-gray-900/50 pt-2.5 col-span-1 md:col-span-2 text-[10px] text-gray-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.background.motionEnabled}
                          onChange={(e) => handleUpdateBackground("motionEnabled", e.target.checked)}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span>Animate Backdrops Speed</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.background.particlesEnabled}
                          onChange={(e) => handleUpdateBackground("particlesEnabled", e.target.checked)}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span>Allow Ambient Emitters</span>
                      </label>
                    </div>
                  </div>

                  {/* PRESETS CATEGORIES FILTER TABS */}
                  <div className="flex flex-wrap gap-1.5 border-b border-gray-950 pb-3">
                    {["All", "Favorites", "Cyberpunk", "Technology", "Science", "Geometry", "Space", "Cricket", "Shadow Monarch", "Fantasy", "Minimal"].map((cat) => {
                      const isSelected = bgCategory === cat;
                      const count = cat === "All" 
                        ? BACKGROUNDS.length 
                        : cat === "Favorites" 
                          ? (settings.favoriteBackgrounds || []).length 
                          : BACKGROUNDS.filter(b => b.category === cat).length;

                      return (
                        <button
                          key={cat}
                          onClick={() => { playSystemClick(); setBgCategory(cat); }}
                          className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border uppercase font-mono cursor-pointer transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#0d1424] to-black border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(0,217,255,0.1)]"
                              : "bg-black/30 border-gray-900 text-gray-400 hover:border-gray-800 hover:text-white"
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* PRESETS LIST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                    {BACKGROUNDS.filter((bg) => {
                      const matchesSearch = bg.name.toLowerCase().includes(bgSearch.toLowerCase()) ||
                                            bg.desc.toLowerCase().includes(bgSearch.toLowerCase());
                      if (bgCategory === "All") return matchesSearch;
                      if (bgCategory === "Favorites") {
                        return matchesSearch && (settings.favoriteBackgrounds || []).includes(bg.id);
                      }
                      return matchesSearch && bg.category === bgCategory;
                    }).map((bg) => {
                      const isSelected = settings.background.selectedId === bg.id && !settings.activeCustomWallpaperId;
                      const isFav = (settings.favoriteBackgrounds || []).includes(bg.id);

                      return (
                        <div
                          key={bg.id}
                          onClick={() => {
                            playPortalSwoosh();
                            onUpdateSettings({
                              ...settings,
                              activeCustomWallpaperId: null, // Clear custom wallpaper select
                              background: {
                                ...settings.background,
                                selectedId: bg.id
                              }
                            });
                          }}
                          className={`border rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between group/card ${
                            isSelected 
                              ? "border-cyan-450 bg-[#0c1426]/50 shadow-[0_0_15px_rgba(0,217,255,0.15)]" 
                              : "border-gray-900 bg-black/40 hover:border-gray-850 hover:bg-black/50"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-black uppercase">
                                {bg.category}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {/* Favorite button */}
                                <button
                                  onClick={(e) => handleToggleFavoriteBackground(bg.id, e)}
                                  className={`p-1 rounded hover:bg-white/5 transition-all cursor-pointer ${
                                    isFav ? "text-amber-400" : "text-gray-600 hover:text-gray-400"
                                  }`}
                                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400" : ""}`} />
                                </button>

                                {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />}
                              </div>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider block text-white mt-1">{bg.name}</span>
                            <p className="text-[10px] text-gray-400 font-sans mt-1 leading-relaxed min-h-[30px] line-clamp-2">{bg.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                    {BACKGROUNDS.filter((bg) => {
                      const matchesSearch = bg.name.toLowerCase().includes(bgSearch.toLowerCase()) ||
                                            bg.desc.toLowerCase().includes(bgSearch.toLowerCase());
                      if (bgCategory === "All") return matchesSearch;
                      if (bgCategory === "Favorites") {
                        return matchesSearch && (settings.favoriteBackgrounds || []).includes(bg.id);
                      }
                      return matchesSearch && bg.category === bgCategory;
                    }).length === 0 && (
                      <div className="col-span-1 md:col-span-2 py-8 text-center text-xs text-gray-500 border border-dashed border-gray-900 rounded-xl bg-black/20">
                        No preset background backdrops matched your current filters.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === "APPEARANCE" && (
              <motion.div
                key="APPEARANCE"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> MASTER INTERFACE SCALERS
                  </h3>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    Personalize display density coefficients. These variables immediately modify typography ratios, borders, glow layers, and sizing values.
                  </p>

                  <div className="bg-black/30 border border-gray-900 rounded-xl p-5 space-y-5">
                    {/* UI Scale */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">UI Size Scale Ratio</span>
                        <span className="text-cyan-400 font-black">{Math.round(settings.appearance.uiScale * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0.8" max="1.2" step="0.05" value={settings.appearance.uiScale}
                        onChange={(e) => handleUpdateAppearance("uiScale", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-1 bg-gray-900"
                      />
                    </div>

                    {/* Animation speed scale */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Transition Animation Velocity</span>
                        <span className="text-cyan-400 font-black">{Math.round(settings.appearance.animationSpeed * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0.5" max="1.5" step="0.1" value={settings.appearance.animationSpeed}
                        onChange={(e) => handleUpdateAppearance("animationSpeed", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-1 bg-gray-900"
                      />
                    </div>

                    {/* Glow Intensity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Aura Glow Intensity Scale</span>
                        <span className="text-cyan-400 font-black">{Math.round(settings.appearance.glowIntensity * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0.0" max="2.0" step="0.1" value={settings.appearance.glowIntensity}
                        onChange={(e) => handleUpdateAppearance("glowIntensity", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-1 bg-gray-900"
                      />
                    </div>

                    {/* Border brightness */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Outline Brightness coefficient</span>
                        <span className="text-cyan-400 font-black">{Math.round(settings.appearance.borderBrightness * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0.2" max="2.0" step="0.1" value={settings.appearance.borderBrightness}
                        onChange={(e) => handleUpdateAppearance("borderBrightness", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-1 bg-gray-900"
                      />
                    </div>

                    {/* Transparency opacity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Glassmorphism Transparency opacity</span>
                        <span className="text-cyan-400 font-black">{Math.round(settings.appearance.transparency * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0.5" max="1.0" step="0.05" value={settings.appearance.transparency}
                        onChange={(e) => handleUpdateAppearance("transparency", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-1 bg-gray-900"
                      />
                    </div>

                    {/* Card Roundness */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Card Border Radius</span>
                        <span className="text-cyan-400 font-black">{settings.appearance.cardRoundness}px</span>
                      </div>
                      <input
                        type="range" min="0" max="24" step="2" value={settings.appearance.cardRoundness}
                        onChange={(e) => handleUpdateAppearance("cardRoundness", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer h-1 bg-gray-900"
                      />
                    </div>

                    {/* Compact mode / comfortable toggles */}
                    <div className="border-t border-gray-900/50 pt-4 flex flex-col md:flex-row gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={settings.appearance.compactMode}
                          onChange={(e) => {
                            const updated = e.target.checked;
                            handleUpdateAppearance("compactMode", updated);
                            if (updated) handleUpdateAppearance("comfortableMode", false);
                          }}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <div className="leading-tight">
                          <span className="font-extrabold block">Compact Sizing Mode</span>
                          <span className="text-[9px] text-gray-500 font-sans">Reduce spacing/padding to maximize displayed content</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={settings.appearance.comfortableMode}
                          onChange={(e) => {
                            const updated = e.target.checked;
                            handleUpdateAppearance("comfortableMode", updated);
                            if (updated) handleUpdateAppearance("compactMode", false);
                          }}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <div className="leading-tight">
                          <span className="font-extrabold block">Spacious Spacing Mode</span>
                          <span className="text-[9px] text-gray-500 font-sans">Maximize margins for relaxing readability</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === "EFFECTS" && (
              <motion.div
                key="EFFECTS"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* PARTICLE TYPES SECTION */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" /> HIGH-FIDELITY PARTICLE EMITTERS
                  </h3>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    Inject specific particle waves onto the background canvas. You can toggle multiple concurrent layers to design your own atmospheric space.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: "floating", label: "Floating Orbs", desc: "Drifting glowing nodes" },
                      { id: "energySparks", label: "Energy Sparks", desc: "Rapid lightning sparks" },
                      { id: "fireflies", label: "Fireflies", desc: "Wandering bioluminescent dots" },
                      { id: "purpleOrbs", label: "Purple Plasma", desc: "Large soft floating spheres" },
                      { id: "magicDust", label: "Magic Dust", desc: "Slow glittering sparkles" },
                      { id: "lightningSparks", label: "Lightning Static", desc: "Discharging electrical vectors" },
                      { id: "stars", label: "Twinkling Stars", desc: "Static stellar backgrounds" },
                      { id: "snow", label: "Snow Storm", desc: "Cascading icy crystals" },
                      { id: "leaves", label: "Foliage Drifts", desc: "Falling green/amber leaves" },
                      { id: "rain", label: "Diagonal Rain", desc: "Descending stormy drops" },
                      { id: "fog", label: "Whirling Fog", desc: "Expanding steam circles" },
                      { id: "smoke", label: "Puff Smoke", desc: "Expanding black clouds" },
                      { id: "xp", label: "XP Particle Drops", desc: "Drifting '+' symbols" }
                    ].map((part) => (
                      <label key={part.id} className="border border-gray-900 bg-black/40 hover:bg-black/60 p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={(settings.particles as any)[part.id] || false}
                          onChange={(e) => handleUpdateParticles(part.id, e.target.checked)}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 mt-0.5 cursor-pointer"
                        />
                        <div className="leading-tight">
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-white block">{part.label}</span>
                          <span className="text-[9px] text-gray-500 block font-sans mt-0.5">{part.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* UI EFFECTS */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> GRAPHIC ACCENTS & ACCELERATIONS
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: "glowAnimations", label: "Atmospheric Glow Rings", desc: "Pulsing outline shadows on cards and tabs" },
                      { id: "pulseEffects", label: "Aura Sync Pulses", desc: "Rhythmic scale pumping of core alerts" },
                      { id: "hoverLighting", label: "Interactive Hover Light", desc: "Reflections follow under-cursor movements" },
                      { id: "cardShine", label: "Dynamic Card Reflections", desc: "Diagonal chrome highlights sweeping cells" },
                      { id: "gradientBorders", label: "Multicolor Outlines", desc: "Borders display purple-cyan-gold blends" },
                      { id: "animatedProgressBars", label: "Pulsing Progress Bars", desc: "Loading meters display flowing core energy" },
                      { id: "animatedButtons", label: "Liquid Button Responses", desc: "Interactive button tags emit tactile ripples" },
                      { id: "energyWaves", label: "Interactive Waves", desc: "Clicking empty space radiates plasma bands" },
                      { id: "menuOpenEffects", label: "Holographic Sliders", desc: "Sidebar menu opens with dimensional scaling" },
                      { id: "screenTransitions", label: "Route Slide transitions", desc: "Smooth tabs shifting animations" }
                    ].map((fx) => (
                      <label key={fx.id} className="border border-gray-900 bg-black/40 hover:bg-black/60 p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={(settings.uiEffects as any)[fx.id] || false}
                          onChange={(e) => handleUpdateUiEffects(fx.id, e.target.checked)}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 mt-0.5 cursor-pointer"
                        />
                        <div className="leading-tight">
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-white block">{fx.label}</span>
                          <span className="text-[9px] text-gray-500 block font-sans mt-0.5">{fx.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === "SOUND" && (
              <motion.div
                key="SOUND"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> REVERBERATION SLIDERS
                  </h3>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    Independently tweak sound vectors. Test frequency emissions instantly by clicking the trigger icons on the right.
                  </p>

                  <div className="bg-black/30 border border-gray-900 rounded-xl p-5 space-y-4">
                    {[
                      { id: "master", label: "Master Nexus Volume", desc: "Overrides entire audio emissions" },
                      { id: "music", label: "Ambient Drone & Loops", desc: "Synthesizer background humming" },
                      { id: "buttons", label: "Interface Click Waves", desc: "Short tactile click indicators" },
                      { id: "questComplete", label: "Contract Secured Bells", desc: "Glint rewards play on Quest success" },
                      { id: "rankUp", label: "Ascension Fanfare", desc: "Triumphant sound on Rank elevation" },
                      { id: "levelUp", label: "Limiter Upgrade Glissando", desc: "Synthesizer level up triggers" },
                      { id: "xpGain", label: "Player XP Sparkles", desc: "Small glints when earning player points" },
                      { id: "warning", label: "Anomalies System Alarm", desc: "Heavy sub-bass alert sound" },
                      { id: "dungeonStart", label: "Abyss Gate Swoosh", desc: "Portal expansion on dungeon embark" },
                      { id: "pressureAlarm", label: "Pressure Chamber Alert", desc: "Pulsing sonar warning beats" },
                      { id: "evolutionSuccess", label: "Simulation Calibrated Chord", desc: "Harmonious pad plays on success" }
                    ].map((snd) => (
                      <div key={snd.id} className="flex items-center gap-4 justify-between border-b border-gray-950 pb-3 last:border-0 last:pb-0">
                        <div className="space-y-0.5 flex-1 max-w-sm">
                          <span className="text-[11px] font-extrabold uppercase text-white block">{snd.label}</span>
                          <span className="text-[9px] text-gray-500 block font-sans">{snd.desc}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <input
                            type="range" min="0" max="1" step="0.05"
                            value={(settings.sound as any)[snd.id] || 0}
                            onChange={(e) => handleUpdateSound(snd.id, parseFloat(e.target.value))}
                            className="w-32 accent-cyan-400 cursor-pointer h-1 bg-gray-900"
                          />
                          <span className="text-[10px] text-cyan-400 font-bold w-10 text-right">
                            {Math.round(((settings.sound as any)[snd.id] || 0) * 100)}%
                          </span>
                          <button
                            onClick={() => handleTestSound(snd.id)}
                            className="p-1.5 rounded hover:bg-cyan-950/20 text-cyan-400 border border-cyan-500/10 hover:border-cyan-450 cursor-pointer transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === "GAMEPLAY" && (
              <motion.div
                key="GAMEPLAY"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* GAMEPLAY SETTINGS */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" /> USER GAMEPLAY PREFERENCES
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: "difficultyIndicator", label: "Difficulty Badges", desc: "Display 'MONARCH TIER' and markers on quests" },
                      { id: "damageNumbers", label: "Floating Impact Popups", desc: "Display score counts cascading on canvas landing" },
                      { id: "xpPopups", label: "+XP Glowing Splashes", desc: "Radiate green text splashes on XP earnings" },
                      { id: "autoSave", label: "Automated Core Saving", desc: "Persist progress to localStorage on interactions" },
                      { id: "cloudSync", label: "Continuous Cloud Syncing", desc: "Push profile data dynamically to secure cloud" },
                      { id: "performanceMode", label: "Low Spec GPU Mode", desc: "Halve animations quality and limit particles" },
                      { id: "batterySaver", label: "Battery Saver Mode", desc: "Disable luxury particle layers entirely" },
                      { id: "fpsCounter", label: "Show Frame Rate Counter", desc: "Overlay live rendering speed indicator" }
                    ].map((pref) => (
                      <label key={pref.id} className="border border-gray-900 bg-black/40 hover:bg-black/60 p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={(settings.gameplay as any)[pref.id] || false}
                          onChange={(e) => handleUpdateGameplay(pref.id, e.target.checked)}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 mt-0.5 cursor-pointer"
                        />
                        <div className="leading-tight">
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-white block">{pref.label}</span>
                          <span className="text-[9px] text-gray-500 block font-sans mt-0.5">{pref.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* NOTIFICATIONS CONTROL */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> HUD FLOATING SIGNALS
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: "questCompleted", label: "Quest Completed Signals", desc: "Siren alerts on practice contract completion" },
                      { id: "dailyQuest", label: "Daily Contract Rotations", desc: "Signals on daily quest generation" },
                      { id: "weeklyQuest", label: "Weekly Mega Campaigns", desc: "Notification upon new weekly rotations" },
                      { id: "rankAvailable", label: "Ascension Rank Openings", desc: "Flashing alerts when level requirements are met" },
                      { id: "skillReady", label: "Limiters Ready for Evolution", desc: "Display alerts when skill reaches 100% xp" },
                      { id: "evolutionReady", label: "Net Drill Completed Summary", desc: "Synthesizer feedback upon exit" },
                      { id: "masteryLevelUp", label: "Mastery Level Achievements", desc: "Display alert on wrist style increments" },
                      { id: "cloudSync", label: "Cloud Sync Anomalies", desc: "Show connection signals for database updates" },
                      { id: "matchReminder", label: "Game Reminders", desc: "Daily match scheduling alerts" }
                    ].map((not) => (
                      <label key={not.id} className="border border-gray-900 bg-black/40 hover:bg-black/60 p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={(settings.notifications as any)[not.id] || false}
                          onChange={(e) => handleUpdateNotifications(not.id, e.target.checked)}
                          className="rounded bg-black border-gray-800 text-cyan-500 focus:ring-0 mt-0.5 cursor-pointer"
                        />
                        <div className="leading-tight">
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-white block">{not.label}</span>
                          <span className="text-[9px] text-gray-500 block font-sans mt-0.5">{not.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === "STORAGE" && (
              <motion.div
                key="STORAGE"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* DATABASE STATISTICS */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Database className="w-4 h-4 animate-bounce" /> CORE DATABASE PARAMETERS
                    </h3>
                    <button onClick={handleRefreshStats} className="p-1 bg-gray-950 border border-gray-800 hover:border-gray-600 rounded cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-gray-900 p-4 rounded-xl">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest block leading-none">DATABASE SIZE</span>
                      <span className="text-lg font-black text-cyan-400 mt-2 block leading-none">{dbStats.databaseSizeKb} KB</span>
                      <span className="text-[9px] text-gray-600 font-sans mt-2 block">Accumulated settings and profile logs</span>
                    </div>

                    <div className="bg-black/40 border border-gray-900 p-4 rounded-xl">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest block leading-none">QUEST REGISTRY COUNT</span>
                      <span className="text-lg font-black text-cyan-400 mt-2 block leading-none">{dbStats.questCount} ACTIVE</span>
                      <span className="text-[9px] text-gray-600 font-sans mt-2 block">Total built-in and customized contracts</span>
                    </div>

                    <div className="bg-black/40 border border-gray-900 p-4 rounded-xl">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest block leading-none">PRESSURE SCENARIOS</span>
                      <span className="text-lg font-black text-cyan-400 mt-2 block leading-none">{dbStats.pressureCount} REGISTERED</span>
                      <span className="text-[9px] text-gray-600 font-sans mt-2 block">Built-in high-pressure match scenarios</span>
                    </div>

                    <div className="bg-black/40 border border-gray-900 p-4 rounded-xl">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest block leading-none">STORAGE LOAD RATE</span>
                      <span className="text-lg font-black text-cyan-400 mt-2 block leading-none">
                        {((dbStats.storageUsedBytes / 5000000) * 100).toFixed(4)}%
                      </span>
                      <span className="text-[9px] text-gray-600 font-sans mt-2 block">Fraction of browser localStorage limits</span>
                    </div>
                  </div>
                </div>

                {/* EXPORT IMPORT CONTROLS */}
                <div className="border border-dashed border-gray-800 rounded-2xl p-5 bg-black/10 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" /> GATEWAY PROFILE CONTROLS
                  </h4>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    Safeguard offline spin metrics. Export your total player history, levels, custom designed spin configurations, and unlocked skill matrices to local JSON.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleExportData}
                      className="flex-1 py-3 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-500/20 hover:border-cyan-450 text-cyan-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors uppercase cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Export Nexus Settings
                    </button>

                    <label className="flex-1 py-3 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 hover:border-purple-400 text-purple-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors uppercase cursor-pointer text-center">
                      <Upload className="w-4 h-4" /> Import Nexus Settings
                      <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    </label>
                  </div>

                  <button
                    onClick={handleClearCache}
                    className="w-full py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 hover:border-rose-500 text-rose-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors uppercase cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Local Caches
                  </button>
                </div>
              </motion.div>
            )}

            {activeSubTab === "ABOUT" && (
              <motion.div
                key="ABOUT"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* MANUAL */}
                <div className="bg-[#030303] border border-gray-900 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 font-extrabold uppercase block tracking-wider leading-none">MONARCH CLASSIFICATION</span>
                      <span className="text-sm font-black text-white uppercase block mt-1 leading-none">SYS CALIBRATION BUILD v12.4.0</span>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans text-xs text-gray-400 leading-relaxed border-t border-gray-900 pt-4">
                    <div className="flex justify-between border-b border-gray-950 pb-2">
                      <span className="font-bold text-gray-500">Player Hash Signature:</span>
                      <span className="font-mono font-black text-gray-300">NEX-9832-XPL-12</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-950 pb-2">
                      <span className="font-bold text-gray-500">Sync Portal Engine:</span>
                      <span className="font-mono font-black text-gray-300">Supabase DB Gateway [Online]</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-950 pb-2">
                      <span className="font-bold text-gray-500">Operating Core:</span>
                      <span className="font-mono font-black text-gray-300">Vite 6 + React 18 + Tailwind v4</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-950 pb-2">
                      <span className="font-bold text-gray-500">Developers Notes:</span>
                      <span className="text-right text-gray-300 italic max-w-xs font-mono text-[10px]">
                        "Synthesized to grant spinners high-tech precision feedback. Control limiters, ascend through divisions, and achieve sovereign wrist mechanics."
                      </span>
                    </div>
                  </div>
                </div>

                {/* UPDATE LOG */}
                <div className="space-y-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">CHRONOLOGICAL PATCH HISTORY</span>
                  <div className="space-y-3">
                    {[
                      { v: "v12.4.0", date: "June 2026", desc: "Introduced complete Settings redesign and custom Color Theme Engine alongside particle configurations." },
                      { v: "v11.8.0", date: "May 2026", desc: "Integrated Pressure Chamber scenarios and localized QuestDatabaseManager library." },
                      { v: "v10.1.0", date: "April 2026", desc: "Asynchronous offline profile syncs aligned with Cloud backup relays." }
                    ].map((patch, i) => (
                      <div key={i} className="border border-gray-900 rounded-xl p-3.5 bg-black/40 leading-tight">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-cyan-400">{patch.v}</span>
                          <span className="text-[10px] text-gray-500">{patch.date}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-sans leading-relaxed">{patch.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
