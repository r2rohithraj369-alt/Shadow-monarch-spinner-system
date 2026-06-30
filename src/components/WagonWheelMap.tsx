import React, { useState, useRef, useEffect } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  Layers, 
  Eye, 
  BarChart2, 
  Shield, 
  Flame, 
  Crosshair,
  BadgeAlert
} from "lucide-react";

export interface WagonWheelDeliver {
  over: number;
  ballNum: number;
  skillName: string;
  length: string; // "Perfect Ball", "Close Ball", etc.
  runs: number;
  isWicket: boolean;
  wicketType: string; // "BOWLED", "CAUGHT", etc.
  dotBallType?: "BEATEN" | "FIELDER" | null;
  beatenType?: string;
  isExtra?: boolean;
  extraType?: "WIDE" | "NO_BALL" | "NONE";
  // Coordinates (radius: 0 to 100%, angle: 0 to 360 deg)
  angle?: number;
  distance?: number;
  zone?: string;
}

interface WagonWheelMapProps {
  deliveries: WagonWheelDeliver[];
  interactive?: boolean;
  onSelectCoordinate?: (coord: { angle: number; distance: number; zone: string }) => void;
  selectedCoordinate?: { angle: number; distance: number; zone: string } | null;
  // Selected delivery reviews
  onSelectDeliveryReview?: (delivery: WagonWheelDeliver) => void;
  // Mode toggle from external state
  viewType?: "wheel" | "scoring_heatmap" | "wicket_heatmap" | "beaten_heatmap" | "bowling_heatmap";
}

// Global run color definition - V3 Specifications
export const VALUE_COLORS: Record<number, string> = {
  0: "#E2E8F0", // Highly visible bright grey-white (Fielder dot ball)
  1: "#FBBF24", // Yellow (1 run)
  2: "#22D3EE", // Cyan (2 runs)
  3: "#A855F7", // Purple (3 runs)
  4: "#3B82F6", // Blue (4 runs)
  5: "#FF7A00", // Orange (5 runs)
  6: "#EF4444", // Bright Red (6 runs)
};

// Sector definitions spanning full 360 degrees clockwise with 12 o'clock at 0 degrees (Behind Stumps)
export const SECTORS_LIST = [
  // STRAIGHT (Bottom)
  { name: "Straight Drive", start: 170, end: 190, rMin: 0, rMax: 100, color: "#10b981", textColor: "#34d399", side: "Straight" },

  // LEG SIDE (Right side of screen, clockwise from 0°/Top to 180°/Bottom)
  { name: "Fine Leg", start: 0, end: 40, rMin: 0, rMax: 65, color: "#a855f7", textColor: "#e9d5ff", side: "Leg" },
  { name: "Deep Fine Leg", start: 0, end: 40, rMin: 65, rMax: 100, color: "#ec4899", textColor: "#fbcfe8", side: "Leg" },
  { name: "Backward Square Leg", start: 40, end: 65, rMin: 0, rMax: 100, color: "#a855f7", textColor: "#d8b4fe", side: "Leg" },
  { name: "Square Leg", start: 65, end: 95, rMin: 0, rMax: 100, color: "#a855f7", textColor: "#d8b4fe", side: "Leg" },
  { name: "Mid Wicket", start: 95, end: 135, rMin: 0, rMax: 100, color: "#a855f7", textColor: "#c084fc", side: "Leg" },
  { name: "Deep Mid Wicket", start: 135, end: 150, rMin: 0, rMax: 100, color: "#eab308", textColor: "#fde047", side: "Leg" },
  { name: "Long On", start: 150, end: 170, rMin: 0, rMax: 100, color: "#eab308", textColor: "#fde047", side: "Leg" },

  // OFF SIDE (Left side of screen, clockwise from 180°/Bottom to 360°/Top)
  { name: "Long Off", start: 190, end: 210, rMin: 0, rMax: 100, color: "#eab308", textColor: "#fef08a", side: "Off" },
  { name: "Extra Cover", start: 210, end: 235, rMin: 0, rMax: 100, color: "#06b6d4", textColor: "#38bdf8", side: "Off" },
  { name: "Cover", start: 235, end: 260, rMin: 0, rMax: 100, color: "#06b6d4", textColor: "#22d3ee", side: "Off" },
  { name: "Point", start: 260, end: 295, rMin: 0, rMax: 100, color: "#06b6d4", textColor: "#22d3ee", side: "Off" },
  { name: "Backward Point", start: 295, end: 320, rMin: 0, rMax: 100, color: "#06b6d4", textColor: "#22d3ee", side: "Off" },
  { name: "Third Man", start: 320, end: 360, rMin: 0, rMax: 65, color: "#06b6d4", textColor: "#67e8f9", side: "Off" },
  { name: "Deep Third", start: 320, end: 360, rMin: 65, rMax: 100, color: "#3b82f6", textColor: "#93c5fd", side: "Off" }
];

// Helper to determine the exact midpoint of an angle range
export function getMidAngle(start: number, end: number): number {
  let diff = end - start;
  if (diff < 0) diff += 360;
  const mid = start + diff / 2;
  return mid % 360;
}

// Map angles (0° at 12 o'clock / Straight Top, clockwise) to high fidelity cricket field positions (V3 specs)
export function getCricketZone(angle: number, distance: number = 70): { zone: string; side: "Off" | "Leg" | "Straight" } {
  const deg = (angle + 360) % 360;

  // Match corresponding sector based on angle and distance bounds
  const matchedSector = SECTORS_LIST.find(s => {
    let angleMatch = false;
    if (s.start > s.end) {
      // Handles wrapping past 360° to 0°
      angleMatch = (deg >= s.start || deg < s.end);
    } else {
      angleMatch = (deg >= s.start && deg < s.end);
    }
    const distMatch = (distance >= s.rMin && distance <= s.rMax);
    return angleMatch && distMatch;
  });

  if (matchedSector) {
    return { zone: matchedSector.name, side: matchedSector.side as any };
  }

  return { zone: "Straight Drive", side: "Straight" };
}

// Helper to calculate line thickness according to batsman score
function getLineThickness(runs: number): number {
  if (runs >= 6) return 6.0; // Extra Thick
  if (runs >= 4) return 4.5; // Thick
  if (runs >= 1) return 3.0; // Medium-Thick
  return 1.8; // Sharp and visible for dot balls
}

// Generate circular sector wedge path
function getSectorWedgePath(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  
  const x1_out = cx + rOuter * Math.cos(startRad);
  const y1_out = cy + rOuter * Math.sin(startRad);
  const x2_out = cx + rOuter * Math.cos(endRad);
  const y2_out = cy + rOuter * Math.sin(endRad);
  
  const x1_in = cx + rInner * Math.cos(startRad);
  const y1_in = cy + rInner * Math.sin(startRad);
  const x2_in = cx + rInner * Math.cos(endRad);
  const y2_in = cy + rInner * Math.sin(endRad);
  
  let largeArc = 0;
  let diff = endAngle - startAngle;
  if (diff < 0) diff += 360;
  if (diff > 180) largeArc = 1;
  
  if (rInner === 0) {
    return `M ${cx} ${cy} L ${x1_out} ${y1_out} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2_out} ${y2_out} Z`;
  } else {
    return `M ${x1_in} ${y1_in} L ${x1_out} ${y1_out} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1_in} ${y1_in} Z`;
  }
}

export default function WagonWheelMap({
  deliveries = [],
  interactive = false,
  onSelectCoordinate,
  selectedCoordinate = null,
  onSelectDeliveryReview,
  viewType = "wheel"
}: WagonWheelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // V3 Visual Modes Management
  const [analystMode, setAnalystMode] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<"wheel" | "heatmap" | "combined">("combined");

  // State to handle transient zone flashes
  const [flashZone, setFlashZone] = useState<string | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active floating tooltip state
  const [hoveredBall, setHoveredBall] = useState<WagonWheelDeliver | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Pan & Zoom Engine
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgSize = 400;
  const radius = 175; // Expanded field boundaries
  const cx = 200;
  const cy = 200;

  // 25% Larger pitch size configuration (Vertical Orientation)
  const pitchWidth = 18;
  const pitchHeight = 85;

  // Trigger temporary wedge flashing when selecting/changing coordinates
  useEffect(() => {
    if (selectedCoordinate) {
      setFlashZone(selectedCoordinate.zone);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => {
        setFlashZone(null);
      }, 900);
    }
  }, [selectedCoordinate]);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  // Update canvas heatmap render
  useEffect(() => {
    drawHeatmapCanvas();
  }, [viewType, deliveries, zoom, displayMode]);

  const drawHeatmapCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If local display mode is wheel-only, skip drawing underlying blurry heat points
    if (displayMode === "wheel") {
      return;
    }

    let list = deliveries;
    // Map outer view modes to filtered sets
    if (viewType === "wicket_heatmap") {
      list = deliveries.filter(d => d.isWicket && ["CAUGHT", "STUMPED", "RUN_OUT", "CAUGHT_BOWL"].includes(d.wicketType?.toUpperCase() || ""));
    } else if (viewType === "scoring_heatmap") {
      list = deliveries.filter(d => d.runs > 0);
    } else if (viewType === "beaten_heatmap") {
      list = deliveries.filter(d => d.dotBallType === "BEATEN");
    }

    if (viewType === "beaten_heatmap" || viewType === "bowling_heatmap") {
      // Pitch-focused landing layout densities
      const lengthYMapping: Record<string, number> = {
        "Perfect Ball": cy + 12,
        "Close Ball": cy,
        "Just Short": cy - 12,
        "Short Ball": cy - 30,
        "Full Toss": cy + 28
      };

      const skillXOffsets: Record<string, number> = {
        "Googly": -8,
        "Flipper": 8,
        "Slider": 3,
        "Top Spinner": 0,
        "Leg Break": -10,
        "Off Break": 10
      };

      list.forEach(d => {
        let py = lengthYMapping[d.length] || cy;
        let px = cx;
        
        const matchName = Object.keys(skillXOffsets).find(k => d.skillName?.toLowerCase().includes(k.toLowerCase()));
        if (matchName) {
          px += skillXOffsets[matchName];
        } else {
          px += (Math.sin(d.over * 3 + d.ballNum) * 10);
        }

        px += (Math.random() - 0.5) * 5;
        py += (Math.random() - 0.5) * 5;

        const color = viewType === "beaten_heatmap" ? "rgba(168, 85, 247, 0.6)" : "rgba(34, 211, 238, 0.65)";
        const radGrd = ctx.createRadialGradient(px, py, 2, px, py, 16);
        radGrd.addColorStop(0, color);
        radGrd.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Outfield field shots
      list.forEach(d => {
        if (d.angle === undefined || d.distance === undefined) return;
        
        const angleRad = ((d.angle - 90) * Math.PI) / 180;
        const distPixels = (d.distance / 100) * radius;
        const px = cx + distPixels * Math.cos(angleRad);
        const py = cy + distPixels * Math.sin(angleRad);

        let weight = 1;
        let color = "rgba(124, 58, 237, 0.55)";
        if (viewType === "scoring_heatmap") {
          weight = d.runs + 1;
          color = d.runs >= 4 ? "rgba(239, 68, 68, 0.6)" : "rgba(251, 191, 36, 0.55)";
        } else if (viewType === "wicket_heatmap") {
          weight = 3.5;
          color = "rgba(239, 68, 68, 0.7)";
        }

        const size = Math.max(14, 11 + weight * 3);
        const radGrd = ctx.createRadialGradient(px, py, 3, px, py, size);
        radGrd.addColorStop(0, color);
        radGrd.addColorStop(1, "rgba(0,0,0,0)");
        
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  // Zoom management
  const handleZoomIn = () => setZoom(prev => Math.min(4, prev + 0.3));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(1, prev - 0.3);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setHoveredBall(null);
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom === 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPanOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  // Interactive mouse click placements
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onSelectCoordinate) {
      setHoveredBall(null);
      return;
    }

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    const clickX = ((e.clientX - rect.left) / rect.width) * svgSize;
    const clickY = ((e.clientY - rect.top) / rect.height) * svgSize;

    const dx = clickX - cx;
    const dy = clickY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Bound coordinates within field
    if (dist > radius + 15) return;

    const finalDistance = Math.min(100, Math.round((dist / radius) * 100));

    // Calculate angle in degrees (0° at 12 o'clock / Top of screen, clockwise)
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    angleDeg = (angleDeg + 360) % 360;

    const zoneObj = getCricketZone(angleDeg, finalDistance);

    // Fire callback
    onSelectCoordinate({
      angle: Math.round(angleDeg),
      distance: finalDistance,
      zone: zoneObj.zone
    });
    
    setHoveredBall(null);
  };

  // Trajectory conversion helper
  const getCoordinatesFromRadial = (angle: number, distance: number) => {
    const angleRad = ((angle - 90) * Math.PI) / 180;
    const distPixels = (distance / 100) * radius;
    return {
      x: cx + distPixels * Math.cos(angleRad),
      y: cy + distPixels * Math.sin(angleRad),
    };
  };

  // Group runs and balls by side regions (Off Side, Leg Side, BTW, Straight)
  const getSideStats = () => {
    let offRuns = 0;
    let offBalls = 0;
    let legRuns = 0;
    let legBalls = 0;
    let btwRuns = 0;
    let btwBalls = 0;
    let straightRuns = 0;
    let straightBalls = 0;

    deliveries.forEach(d => {
      if (d.angle === undefined) return;
      const deg = (d.angle + 360) % 360;

      if (deg >= 170 && deg < 190) {
        straightRuns += d.runs;
        straightBalls++;
      } else if (deg >= 320 || deg < 40) {
        btwRuns += d.runs;
        btwBalls++;
      } else if (deg >= 40 && deg < 170) {
        legRuns += d.runs;
        legBalls++;
      } else { // 190 to 320
        offRuns += d.runs;
        offBalls++;
      }
    });

    return {
      off: { runs: offRuns, balls: offBalls },
      leg: { runs: legRuns, balls: legBalls },
      btw: { runs: btwRuns, balls: btwBalls },
      straight: { runs: straightRuns, balls: straightBalls },
    };
  };

  const sideStats = getSideStats();

  return (
    <div className="flex flex-col items-center space-y-4 w-full">

      {/* DETAILED INTERACTIVE CONTROL DASHBOARD */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-md bg-[#09090b] border border-gray-900 px-4 py-3 rounded-xl">
        {/* Layer Mode controls */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-black shrink-0">LAYER:</span>
          <div className="grid grid-cols-3 gap-1 bg-black p-1 rounded-lg border border-gray-950 w-full sm:w-auto">
            {(["wheel", "heatmap", "combined"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDisplayMode(mode)}
                className={`px-2 py-1 text-[8.5px] font-mono font-bold rounded uppercase transition ${
                  displayMode === mode 
                    ? "bg-[#7B2FFF]/15 border border-[#7B2FFF]/40 text-[#A855F7]" 
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {mode === "wheel" ? "Wheel" : mode === "heatmap" ? "Heatmap" : "Combined"}
              </button>
            ))}
          </div>
        </div>

        {/* Analyst View controls */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-black shrink-0">HUD VIEW:</span>
          <div className="grid grid-cols-2 gap-1 bg-black p-1 rounded-lg border border-gray-950 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setAnalystMode(false)}
              className={`px-3 py-1 text-[8.5px] font-mono font-bold rounded uppercase transition ${
                !analystMode 
                  ? "bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#22D3EE]" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setAnalystMode(true)}
              className={`px-3 py-1 text-[8.5px] font-mono font-bold rounded uppercase transition ${
                analystMode 
                  ? "bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] font-black" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Analyst
            </button>
          </div>
        </div>
      </div>
      
      {/* MAP STAGE CANVAS BLOCK */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#040405] border border-zinc-900 rounded-2xl p-3.5 sm:p-5 flex flex-col items-center overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        
        {/* Metric Header showing live angle/distance */}
        <div className="w-full flex items-center justify-between border-b border-gray-950 pb-2 mb-3 font-mono text-[9.5px]">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
            <Crosshair className="w-3.5 h-3.5" />
            CRICKET WAGON WHEEL V3
          </span>
          {selectedCoordinate ? (
            <span className="text-yellow-405 text-yellow-400 font-black tracking-widest uppercase bg-yellow-950/25 border border-yellow-500/20 px-2 py-0.5 rounded animate-pulse">
              ZONE: {selectedCoordinate.zone} | {selectedCoordinate.angle}° | {selectedCoordinate.distance}%
            </span>
          ) : interactive ? (
            <span className="text-gray-500 animate-pulse">▲ TAP GROUND TO PLOT TERMINUS</span>
          ) : (
            <span className="text-gray-500 font-bold">OUTFIELD ANALYSIS SYSTEM</span>
          )}
        </div>

        {/* OUTFIELD SVG & CANVAS WRAPPER */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          onDoubleClick={handleResetZoom}
          style={{ cursor: zoom > 1 ? "grab" : "default" }}
          className="relative w-full aspect-square border border-[#1e293b]/50 rounded-xl overflow-hidden bg-gradient-to-b from-[#091109] to-[#010201] select-none touch-none"
        >
          {/* Layer 1: Heat Map (Only loaded if NOT set to pure Wagon Wheel mode) */}
          {displayMode !== "wheel" && (
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-75 mix-blend-screen"
            />
          )}

          {/* Layer 2: Main SVG (Pitch, Sectors, Lines and Wickets) */}
          <svg
            viewBox="0 0 400 400"
            onClick={handleSvgClick}
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            className="absolute inset-0 w-full h-full z-20"
          >
            {/* STYLISH EFFECT GRADIENTS */}
            <defs>
              {/* Ground Grass Turf Radial Gradient */}
              <radialGradient id="grassV3Grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0a210a" stopOpacity={0.8} />
                <stop offset="65%" stopColor="#041204" stopOpacity={0.92} />
                <stop offset="92%" stopColor="#010601" stopOpacity={0.98} />
                <stop offset="100%" stopColor="#000200" stopOpacity={1} />
              </radialGradient>
              
              {/* Clay Texture Gradient for Cricket Pitch */}
              <linearGradient id="dryClayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E4CCA8" />
                <stop offset="40%" stopColor="#D4B688" />
                <stop offset="70%" stopColor="#BD9866" />
                <stop offset="100%" stopColor="#A27D4B" />
              </linearGradient>

              {/* Glowing Outline Filter */}
              <filter id="neonOffGlow">
                <feGaussianBlur stdDeviation="2.2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* BASEFIELD RADIAL CIRCLE */}
            <circle cx={cx} cy={cy} r={radius} fill="url(#grassV3Grad)" stroke="#163816" strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r={radius + 3} fill="none" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.15" />

            {/* 30-YARD INTERNAL CIRCLE RING */}
            <circle cx={cx} cy={cy} r={radius * 0.48} fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.25" />

            {/* 11 STUNNING SECTOR WEDGES WITH SHINY GLOW OUTLINES */}
            {SECTORS_LIST.map((sec, idx) => {
              const isFlashing = flashZone === sec.name;
              const pathStr = getSectorWedgePath(cx, cy, (sec.rMin / 100) * radius, (sec.rMax / 100) * radius, sec.start, sec.end);
              return (
                <path
                  key={idx}
                  d={pathStr}
                  fill={isFlashing ? sec.color : "transparent"}
                  fillOpacity={isFlashing ? 0.28 : 0.02}
                  stroke={sec.color}
                  strokeWidth={isFlashing ? 1.5 : 0.6}
                  strokeDasharray={isFlashing ? "none" : "3 3"}
                  strokeOpacity={isFlashing ? 0.8 : 0.2}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* HIGH-FIDELITY CRICKET PITCH (25% LARGER WITH CLAY TEXTURING, CREASE MARKINGS & STUMPS) */}
            <g id="V3CricketPitch" className="pointer-events-none">
              {/* Pitch turf soil rectangle */}
              <rect
                x={cx - pitchWidth / 2}
                y={cy - pitchHeight / 2}
                width={pitchWidth}
                height={pitchHeight}
                fill="url(#dryClayGrad)"
                stroke="#c29d66"
                strokeWidth="1.2"
                rx="1"
              />

              {/* Crease line markings painted white */}
              {/* Bowling Crease (Bowler's end at bottom) */}
              <line x1={cx - pitchWidth / 2} y1={cy + pitchHeight / 2 - 8} x2={cx + pitchWidth / 2} y2={cy + pitchHeight / 2 - 8} stroke="#ffffff" strokeWidth="0.8" />
              
              {/* Popping Crease (Batsman's end at top) */}
              <line x1={cx - pitchWidth / 2} y1={cy - pitchHeight / 2 + 15} x2={cx + pitchWidth / 2} y2={cy - pitchHeight / 2 + 15} stroke="#ffffff" strokeWidth="0.8" />

              {/* Stumps at Batsman's end (Top) */}
              <g transform={`translate(${cx - 4}, ${cy - pitchHeight / 2 + 8})`}>
                {/* 3 Stumps */}
                <rect x="0" y="-0.5" width="1.2" height="1.8" fill="#facc15" />
                <rect x="3.4" y="-0.5" width="1.2" height="1.8" fill="#facc15" />
                <rect x="6.8" y="-0.5" width="1.2" height="1.8" fill="#facc15" />
                {/* Bails */}
                <line x1="-0.4" y1="-0.8" x2="8.4" y2="-0.8" stroke="#ca8a04" strokeWidth="0.6" />
              </g>

              {/* Stumps at Bowler's end (Bottom) */}
              <g transform={`translate(${cx - 4}, ${cy + pitchHeight / 2 - 9.5})`}>
                <rect x="0" y="0" width="1.2" height="1.8" fill="#facc15" />
                <rect x="3.4" y="0" width="1.2" height="1.8" fill="#facc15" />
                <rect x="6.8" y="0" width="1.2" height="1.8" fill="#facc15" />
                <line x1="-0.4" y1="-0.3" x2="8.4" y2="-0.3" stroke="#ca8a04" strokeWidth="0.6" />
              </g>

              {/* Vertical orientation text descriptors */}
              <text x={cx} y={cy - pitchHeight / 2 - 4} fill="#e2e8f0" fontSize="4.5" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="0.5">BATTING END</text>
              <text x={cx} y={cy + pitchHeight / 2 + 8} fill="#e2e8f0" fontSize="4.5" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="0.5">BOWLING END</text>
            </g>

            {/* FIELD ORIENTATION COMPASS MARKINGS */}

            {/* RENDER PLACED/CLICKED SHOT TARGET COORDINATE */}
            {selectedCoordinate && (
              (() => {
                const coord = getCoordinatesFromRadial(selectedCoordinate.angle, selectedCoordinate.distance);
                return (
                  <g>
                    {/* Pulsing trajectory line with neon-cyan glows */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={coord.x}
                      y2={coord.y}
                      stroke="#22d3ee"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                      filter="url(#neonOffGlow)"
                    />
                    {/* Ring indicator radar flashing animation */}
                    <circle cx={coord.x} cy={coord.y} r="10" fill="#22d3ee" fillOpacity="0.35" className="animate-ping" />
                    <circle cx={coord.x} cy={coord.y} r="5" fill="#22d3ee" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                );
              })()
            )}

            {/* HISTORICAL WAGON WHEEL LINES */}
            {displayMode !== "heatmap" && deliveries.map((d, dIdx) => {
              if (d.angle === undefined || d.distance === undefined) return null;

              const coord = getCoordinatesFromRadial(d.angle, d.distance);
              const color = VALUE_COLORS[d.runs] || "#8B949E";
              const thickness = getLineThickness(d.runs);

              return (
                <g 
                  key={dIdx} 
                  className="cursor-pointer group/item transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                    setHoveredBall(d);
                    if (onSelectDeliveryReview) onSelectDeliveryReview(d);
                  }}
                >
                  {/* Trajectory lines on grass. Wickets appear as MARKER ONLY per rule */}
                  {!d.isWicket && (
                    <line
                      x1={cx}
                      y1={cy}
                      x2={coord.x}
                      y2={coord.y}
                      stroke={color}
                      strokeWidth={d.runs === 0 ? 1.8 : thickness}
                      strokeLinecap="round"
                      strokeOpacity={d.runs === 0 ? "0.75" : "1.0"}
                      strokeDasharray={d.runs === 0 ? "3 3" : "none"}
                      className="hover:stroke-[#ffffff] hover:stroke-[6px] transition-colors"
                    />
                  )}

                  {/* Terminal Node Markers */}
                  {d.isWicket ? (
                    // Black circle with white W inside
                    <g>
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="9"
                        fill="#000000"
                        stroke="#ef4444"
                        strokeWidth="2"
                        className="group-hover/item:scale-135 transition-transform"
                      />
                      <text
                        x={coord.x}
                        y={coord.y + 0.5}
                        fill="#FFFFFF"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="900"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="select-none font-bold"
                      >
                        W
                      </text>
                    </g>
                  ) : (
                    // Standard scoring balls terminal coordinates point
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={Math.max(4.5, thickness * 1.1)}
                      fill={color}
                      stroke="#000000"
                      strokeWidth="1.5"
                      className="group-hover/item:scale-150 group-hover/item:stroke-[#ffffff] transition-transform"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Dynamic Compass / Side HUD labels with total runs when Analyst Mode is enabled */}
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none font-mono text-[9px] tracking-widest font-extrabold uppercase z-20 stroke-neutral-950 stroke-2 px-2 py-1 rounded transition-all duration-300 ${
            analystMode 
              ? "bg-cyan-950/90 text-cyan-300 border-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)] animate-pulse" 
              : "bg-black/60 text-cyan-400 border border-cyan-500/10"
          }`}>
            {analystMode ? `◀ OFF SIDE\n• ${sideStats.off.runs} RUNS\n(${sideStats.off.balls}b)` : "◀ OFF SIDE"}
          </div>

          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none font-mono text-[9px] tracking-widest font-extrabold uppercase z-20 stroke-neutral-950 stroke-2 px-2 py-1 rounded transition-all duration-300 text-right ${
            analystMode 
              ? "bg-purple-950/90 text-purple-200 border-2 border-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse" 
              : "bg-black/60 text-[#a855f7] border border-[#a855f7]/10"
          }`}>
            {analystMode ? `LEG SIDE ▶\n• ${sideStats.leg.runs} RUNS\n(${sideStats.leg.balls}b)` : "LEG SIDE ▶"}
          </div>

          <div className={`absolute left-1/2 -translate-x-1/2 top-2 pointer-events-none font-mono text-[8.5px] tracking-wider font-extrabold uppercase z-20 px-2.5 py-1 rounded transition-all duration-300 ${
            analystMode 
              ? "bg-rose-950/90 text-rose-300 border-2 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" 
              : "bg-black/65 text-rose-400 border border-rose-500/10"
          }`}>
            {analystMode ? `▲ BEHIND THE WICKET (BTW) • ${sideStats.btw.runs} RUNS (${sideStats.btw.balls}b)` : "BEHIND THE WICKET / BTW (TOP)"}
          </div>

          <div className={`absolute left-1/2 -translate-x-1/2 bottom-2 pointer-events-none font-mono text-[8.5px] tracking-wider font-extrabold uppercase z-20 px-2.5 py-1 rounded transition-all duration-300 ${
            analystMode 
              ? "bg-emerald-950/90 text-emerald-300 border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
              : "bg-black/65 text-emerald-400 border border-emerald-500/10"
          }`}>
            {analystMode ? `▼ STRAIGHT • ${sideStats.straight.runs} RUNS (${sideStats.straight.balls}b)` : "STRAIGHT (BOTTOM)"}
          </div>

          {/* FLOATING ACTION INTERACTIVE SHOT TOOLTIP */}
          {hoveredBall && (
            <div 
              style={{
                left: "10%",
                right: "10%",
                top: "12%",
              }}
              className="absolute z-50 p-3 bg-black/95 backdrop-blur-md rounded-xl border border-purple-500/35 text-white font-mono text-[10.5px] shadow-[0_4px_24px_rgba(123,47,255,0.45)] space-y-1.5 leading-snug animate-fade-in-down"
            >
              <div className="flex justify-between items-center bg-purple-950/20 px-2 py-1 rounded border border-purple-900/40">
                <span className="text-[#00D4FF] font-black">OVER {hoveredBall.over} • BALL {hoveredBall.ballNum}</span>
                <span className="text-gray-400 text-[9px]">S{hoveredBall.over} REVIEW</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5 text-[9.5px] pt-1 text-gray-300">
                <div>
                  VARIATION: <strong className="text-purple-400 block font-black uppercase">{hoveredBall.skillName}</strong>
                </div>
                <div>
                  PITCH LANDING: <strong className="text-amber-500 block font-black uppercase">{hoveredBall.length}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-900 flex justify-between items-center">
                <span className="text-gray-400">SHOT OUTCOME:</span>
                <span className="font-extrabold uppercase">
                  {hoveredBall.isWicket 
                    ? `WICKET (${hoveredBall.wicketType})` 
                    : `${hoveredBall.runs} RUNS SCORED`}
                </span>
              </div>

              {hoveredBall.zone && (
                <div className="text-[9.5px] text-green-400 border border-green-950 bg-[#061406]/30 px-1.5 py-0.5 rounded text-center font-bold">
                  FIELD REGION: <span className="uppercase text-white">{hoveredBall.zone} (Angle {hoveredBall.angle}°)</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-[8px] text-gray-505">
                <span className="text-gray-500">Tap elsewhere or Close to dismiss</span>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setHoveredBall(null); }}
                  className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:text-white font-mono text-[8px]"
                >
                  CLOSE [X]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLLER ROW FOR ZOOM/PAN SCALES */}
        <div className="w-full flex justify-between items-center mt-3 pt-2.5 border-t border-gray-950">
          <div className="flex gap-1.5">
            <button
              onClick={handleZoomIn}
              className="p-1.5 bg-[#0e0e11] border border-zinc-800 rounded-lg text-gray-400 hover:text-white transition"
              title="Zoom In Stadium"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 bg-[#0e0e11] border border-zinc-800 rounded-lg text-gray-400 hover:text-white transition"
              title="Zoom Out Stadium"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 bg-[#0e0e11] border border-zinc-800 rounded-lg text-gray-400 hover:text-white transition"
              title="Reset Zoom Scale"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[9px] font-mono font-bold text-gray-400 flex items-center gap-1.5 bg-black px-3 py-1 rounded-lg border border-gray-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ZOOM SCALE: {Math.round(zoom * 100)}%
          </div>
        </div>

      </div>

    </div>
  );
}
