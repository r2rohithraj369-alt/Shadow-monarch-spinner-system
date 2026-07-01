import React from "react";
import { motion } from "motion/react";
import { Attribute } from "../types";
import { 
  Target, 
  Compass, 
  Repeat, 
  ShieldCheck, 
  Flame, 
  Wind, 
  Navigation, 
  RefreshCw, 
  ArrowUpCircle,
  Eye,
  Shuffle,
  VenetianMask,
  Crown,
  HeartPulse,
  Sparkles
} from "lucide-react";
import { AttributeEngine } from "../utils/attributeEngine";

interface AttributesPanelProps {
  attributes: Attribute[];
}

export default function AttributesPanel({ attributes = [] }: AttributesPanelProps) {
  // Map icons based on attribute name
  const getIcon = (name: string) => {
    switch (name.toUpperCase()) {
      case "ACCURACY":
        return <Target className="w-4 h-4 text-blue-400" />;
      case "CONTROL":
        return <Compass className="w-4 h-4 text-orange-400" />;
      case "CONSISTENCY":
        return <Repeat className="w-4 h-4 text-emerald-400" />;
      case "ECONOMY":
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case "PRESSURE HANDLING":
        return <Flame className="w-4 h-4 text-red-500" />;
      case "FLIGHT":
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case "DRIFT":
        return <Navigation className="w-4 h-4 text-violet-400" />;
      case "REVOLUTIONS":
        return <RefreshCw className="w-4 h-4 text-orange-400" />;
      case "BOUNCE":
        return <ArrowUpCircle className="w-4 h-4 text-pink-400" />;
      case "VARIATION":
        return <Shuffle className="w-4 h-4 text-fuchsia-400" />;
      case "DECEPTION":
        return <VenetianMask className="w-4 h-4 text-indigo-400" />;
      case "DOMINANCE":
        return <Crown className="w-4 h-4 text-rose-400" />;
      case "RESILIENCE":
        return <HeartPulse className="w-4 h-4 text-green-400" />;
      case "ARCANE MASTERY":
        return <Sparkles className="w-4 h-4 text-white" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 bg-[#0a0a0a]/95 rounded-2xl border border-gray-900 shadow-2xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-900/60">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-widest text-cyan-400 flex items-center gap-2 uppercase">
            🧬 SYSTEM ATTRIBUTES PROFILE
          </h3>
          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">CORE KINETIC AND SPIN PHYSICS METRICS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attributes.map((attr) => {
          const identity = AttributeEngine.getIdentity(attr.name);
          const isZeroGrowth = !attr.growthRate || 
                               attr.growthRate === "0%" || 
                               attr.growthRate === "+0.0%" || 
                               attr.growthRate === "0.0%" || 
                               attr.growthRate === "+0%";
          return (
            <div 
              key={attr.name} 
              className={`group relative bg-[#050505] border ${identity.border} rounded-xl p-5 transition-all duration-300 flex flex-col justify-between ${identity.glow}`}
              title={`${attr.name}: ${attr.recentSource || attr.description}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded border ${identity.border} ${identity.bg} transition-all duration-300`}>
                      {getIcon(attr.name)}
                    </div>
                    <div>
                      <span className={`text-[11px] font-black font-mono tracking-wider uppercase transition-colors ${identity.color}`}>
                        {attr.name}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono block uppercase">{attr.rank || "E-Rank"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className={`text-3xl font-black font-mono tracking-tight ${identity.color}`}>
                    {attr.value.toFixed(1)}
                  </span>
                  {!isZeroGrowth && (
                    <span className="text-[10px] font-mono text-green-400 font-bold bg-green-950/20 px-1.5 py-0.5 rounded border border-green-500/10">
                      {attr.growthRate}
                    </span>
                  )}
                </div>
                <div className="h-2 bg-black/70 rounded-full overflow-hidden border border-gray-900">
                  <motion.div
                    className={`${identity.bg} h-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, attr.value / 10)}%` }}
                    transition={{ duration: 0.55 }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-gray-500">
                  <span>LAST <strong className={identity.color}>+{(attr.lastSessionGain || 0).toFixed(2)}</strong></span>
                  <span>TODAY <strong className={identity.color}>+{(attr.todayGain || 0).toFixed(2)}</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-900/50">
                <p className="text-[10px] text-gray-405 text-gray-400 leading-relaxed font-sans font-medium">
                  {attr.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
