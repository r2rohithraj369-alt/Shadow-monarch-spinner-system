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
  Eye
} from "lucide-react";

interface AttributesPanelProps {
  attributes: Attribute[];
  onBoostAttribute?: (name: string) => void;
}

export default function AttributesPanel({ attributes = [], onBoostAttribute }: AttributesPanelProps) {
  // Map icons based on attribute name
  const getIcon = (name: string) => {
    switch (name.toUpperCase()) {
      case "ACCURACY":
        return <Target className="w-4 h-4 text-blue-400" />;
      case "CONTROL":
        return <Compass className="w-4 h-4 text-purple-400" />;
      case "CONSISTENCY":
        return <Repeat className="w-4 h-4 text-emerald-400" />;
      case "ECONOMY":
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case "PRESSURE HANDLING":
        return <Flame className="w-4 h-4 text-red-500" />;
      case "FLIGHT":
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case "DRIFT":
        return <Navigation className="w-4 h-4 text-indigo-400" />;
      case "REVOLUTIONS":
        return <RefreshCw className="w-4 h-4 text-orange-400" />;
      case "BOUNCE":
        return <ArrowUpCircle className="w-4 h-4 text-pink-400" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBarColorClass = (name: string) => {
    switch (name.toUpperCase()) {
      case "ACCURACY":
        return "bg-gradient-to-r from-blue-700 to-blue-500";
      case "CONTROL":
        return "bg-gradient-to-r from-purple-700 to-purple-500";
      case "CONSISTENCY":
        return "bg-gradient-to-r from-emerald-700 to-emerald-500";
      case "ECONOMY":
        return "bg-gradient-to-r from-amber-600 to-amber-500";
      case "PRESSURE HANDLING":
        return "bg-gradient-to-r from-red-700 to-red-500";
      case "FLIGHT":
        return "bg-gradient-to-r from-cyan-600 to-cyan-400";
      case "DRIFT":
        return "bg-gradient-to-r from-indigo-600 to-indigo-400";
      case "REVOLUTIONS":
        return "bg-gradient-to-r from-orange-600 to-orange-400";
      case "BOUNCE":
        return "bg-gradient-to-r from-pink-600 to-pink-400";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-400";
    }
  };

  const getShadowColorStyle = (name: string) => {
    switch (name.toUpperCase()) {
      case "ACCURACY":
        return "shadow-[0_0_12px_rgba(59,130,246,0.5)]";
      case "CONTROL":
        return "shadow-[0_0_12px_rgba(168,85,247,0.5)]";
      case "CONSISTENCY":
        return "shadow-[0_0_12px_rgba(16,185,129,0.5)]";
      case "ECONOMY":
        return "shadow-[0_0_12px_rgba(245,158,11,0.5)]";
      case "PRESSURE HANDLING":
        return "shadow-[0_0_12px_rgba(239,68,68,0.5)]";
      case "FLIGHT":
        return "shadow-[0_0_12px_rgba(6,182,212,0.5)]";
      case "DRIFT":
        return "shadow-[0_0_12px_rgba(99,102,241,0.5)]";
      case "REVOLUTIONS":
        return "shadow-[0_0_12px_rgba(249,115,22,0.5)]";
      case "BOUNCE":
        return "shadow-[0_0_12px_rgba(236,72,153,0.5)]";
      default:
        return "shadow-[0_0_12px_rgba(156,163,175,0.5)]";
    }
  };

  const getTextColor = (name: string) => {
    switch (name.toUpperCase()) {
      case "ACCURACY": return "text-blue-400";
      case "CONTROL": return "text-purple-400";
      case "CONSISTENCY": return "text-emerald-400";
      case "ECONOMY": return "text-amber-400";
      case "PRESSURE HANDLING": return "text-red-400";
      case "FLIGHT": return "text-cyan-400";
      case "DRIFT": return "text-indigo-400";
      case "REVOLUTIONS": return "text-orange-400";
      case "BOUNCE": return "text-pink-400";
      default: return "text-gray-400";
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
          const isZeroGrowth = !attr.growthRate || 
                               attr.growthRate === "0%" || 
                               attr.growthRate === "+0.0%" || 
                               attr.growthRate === "0.0%" || 
                               attr.growthRate === "+0%";
          return (
            <div 
              key={attr.name} 
              className="group relative bg-[#050505] border border-gray-900 hover:border-cyan-500/20 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_15px_rgba(6,182,212,0.03)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-black border border-gray-800/80 group-hover:border-cyan-500/30 group-hover:bg-cyan-950/10 transition-all duration-300">
                      {getIcon(attr.name)}
                    </div>
                    <span className="text-[11px] font-black font-mono text-gray-400 tracking-wider uppercase group-hover:text-gray-200 transition-colors">
                      {attr.name}
                    </span>
                  </div>
                  
                  {onBoostAttribute && (
                    <button 
                      onClick={() => onBoostAttribute(attr.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black cursor-pointer"
                      title={`Manually train ${attr.name}`}
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className={`text-3xl font-black font-mono tracking-tight ${getTextColor(attr.name)}`}>
                    {attr.value.toFixed(1)}
                  </span>
                  {!isZeroGrowth && (
                    <span className="text-[10px] font-mono text-green-400 font-bold bg-green-950/20 px-1.5 py-0.5 rounded border border-green-500/10">
                      {attr.growthRate}
                    </span>
                  )}
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
