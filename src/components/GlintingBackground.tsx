import { useEffect, useRef } from "react";
import { AppSettings, SettingsManager, CustomWallpaperItem } from "../utils/settingsManager";

interface GlintingBackgroundProps {
  settings: AppSettings;
}

export default function GlintingBackground({ settings }: GlintingBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Find active custom wallpaper if any
  const customWallpapers = settings.customWallpapers || [];
  const activeCustomWallpaper = settings.activeCustomWallpaperId 
    ? customWallpapers.find(w => w.id === settings.activeCustomWallpaperId)
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const theme = SettingsManager.getTheme(settings);
    const primColor = theme.primary;
    const secColor = theme.secondary;
    const glowColor = theme.glow;

    // Get RGB values for overlays
    const primRgb = SettingsManager.hexToRgb(primColor);
    const secRgb = SettingsManager.hexToRgb(secColor);

    // Particle type declaration
    interface Particle {
      type: string;
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      pulseDirection: number;
      angle?: number;
      spin?: number;
      symbol?: string;
      trail?: { x: number; y: number }[];
    }

    const particles: Particle[] = [];
    const isPerformance = settings.gameplay.performanceMode;
    const isBattery = settings.gameplay.batterySaver;

    // Particle Layer Initializations
    const initParticles = () => {
      particles.length = 0;
      if (isBattery || !settings.background.particlesEnabled) return;

      // 1. Twinkling Stars
      if (settings.particles.stars) {
        const starCount = isPerformance ? 25 : 65;
        for (let i = 0; i < starCount; i++) {
          particles.push({
            type: "star",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            speedX: 0,
            speedY: 0,
            color: "#FFFFFF",
            alpha: Math.random() * 0.8 + 0.2,
            pulseDirection: Math.random() > 0.5 ? 0.004 : -0.004,
          });
        }
      }

      // 2. Floating Orbs
      if (settings.particles.floating) {
        const count = isPerformance ? 8 : 22;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "floating",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3.5 + 1.2,
            speedX: (Math.random() - 0.5) * 0.3 * settings.appearance.animationSpeed,
            speedY: (Math.random() - 0.5) * 0.3 * settings.appearance.animationSpeed,
            color: Math.random() > 0.5 ? primColor : secColor,
            alpha: Math.random() * 0.45 + 0.15,
            pulseDirection: Math.random() > 0.5 ? 0.008 : -0.008,
          });
        }
      }

      // 3. Sparks (Energy Sparks)
      if (settings.particles.energySparks) {
        const count = isPerformance ? 6 : 16;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "spark",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.5 + 0.8,
            speedX: (Math.random() - 0.5) * 2.2 * settings.appearance.animationSpeed,
            speedY: (Math.random() - 0.5) * 2.2 * settings.appearance.animationSpeed,
            color: glowColor,
            alpha: Math.random() * 0.8 + 0.2,
            pulseDirection: -0.02,
          });
        }
      }

      // 4. Fireflies
      if (settings.particles.fireflies) {
        const count = isPerformance ? 8 : 18;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "firefly",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.8,
            speedX: (Math.random() - 0.5) * 0.7 * settings.appearance.animationSpeed,
            speedY: (Math.random() - 0.5) * 0.7 * settings.appearance.animationSpeed,
            color: "#A3E635", // lime green
            alpha: Math.random() * 0.65 + 0.15,
            pulseDirection: Math.random() > 0.5 ? 0.025 : -0.025,
          });
        }
      }

      // 5. Large Purple Plasma Orbs
      if (settings.particles.purpleOrbs) {
        const count = isPerformance ? 3 : 8;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "purple_orb",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 25 + 12,
            speedX: (Math.random() - 0.5) * 0.1 * settings.appearance.animationSpeed,
            speedY: (Math.random() - 0.5) * 0.1 * settings.appearance.animationSpeed,
            color: primColor,
            alpha: Math.random() * 0.12 + 0.02,
            pulseDirection: Math.random() > 0.5 ? 0.0008 : -0.0008,
          });
        }
      }

      // 6. Snow storm flakes
      if (settings.particles.snow) {
        const count = isPerformance ? 12 : 35;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "snow",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.5 + 1,
            speedX: (Math.random() - 0.3) * 0.4 * settings.appearance.animationSpeed,
            speedY: (Math.random() * 0.9 + 0.4) * settings.appearance.animationSpeed,
            color: "#F1F5F9",
            alpha: Math.random() * 0.6 + 0.3,
            pulseDirection: 0,
          });
        }
      }

      // 7. Diagonal Rain drops
      if (settings.particles.rain) {
        const count = isPerformance ? 22 : 55;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "rain",
            x: Math.random() * width,
            y: Math.random() * height - height,
            size: Math.random() * 1.5 + 0.5,
            speedX: -0.8 * settings.appearance.animationSpeed,
            speedY: (Math.random() * 4 + 7) * settings.appearance.animationSpeed,
            color: "#A5F3FC", // light cyan
            alpha: Math.random() * 0.35 + 0.15,
            pulseDirection: 0,
          });
        }
      }

      // 8. Foliage drifts (leaves)
      if (settings.particles.leaves) {
        const count = isPerformance ? 5 : 12;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "leaf",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 5 + 3,
            speedX: (Math.random() - 0.2) * 0.8 * settings.appearance.animationSpeed,
            speedY: (Math.random() * 0.8 + 0.4) * settings.appearance.animationSpeed,
            color: Math.random() > 0.5 ? "#22C55E" : "#F59E0B", // green or amber gold
            alpha: Math.random() * 0.5 + 0.25,
            pulseDirection: 0,
            angle: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.015
          });
        }
      }

      // 9. Floating XP Symbols / Runes
      if (settings.particles.xp) {
        const count = isPerformance ? 3 : 8;
        const runes = ["+XP", "◈", "REV", "RPM", "★", "☿", "🝎", "⚔", "⚙"];
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "xp",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1.5,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: (Math.random() * -0.4 - 0.2) * settings.appearance.animationSpeed,
            color: Math.random() > 0.6 ? "#22C55E" : secColor,
            alpha: Math.random() * 0.6 + 0.2,
            pulseDirection: -0.004,
            symbol: runes[Math.floor(Math.random() * runes.length)]
          });
        }
      }

      // 10. Ambient Dust (Glinting Dust)
      if (settings.particles.dust) {
        const count = isPerformance ? 15 : 45;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "dust",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.4,
            speedX: (Math.random() - 0.5) * 0.15 * settings.appearance.animationSpeed,
            speedY: (Math.random() - 0.5) * 0.15 * settings.appearance.animationSpeed,
            color: secColor,
            alpha: Math.random() * 0.5 + 0.1,
            pulseDirection: Math.random() > 0.5 ? 0.005 : -0.005,
          });
        }
      }

      // 11. Smoke drifts
      if (settings.particles.smoke) {
        const count = isPerformance ? 3 : 10;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "smoke",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 35 + 15,
            speedX: (Math.random() * 0.15 + 0.05) * settings.appearance.animationSpeed,
            speedY: (Math.random() * -0.2 - 0.1) * settings.appearance.animationSpeed,
            color: "#374151",
            alpha: Math.random() * 0.08 + 0.02,
            pulseDirection: -0.002,
          });
        }
      }

      // 12. Floating Magic Dust (Glinting points)
      if (settings.particles.magicDust) {
        const count = isPerformance ? 10 : 30;
        for (let i = 0; i < count; i++) {
          particles.push({
            type: "magic_dust",
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.25 * settings.appearance.animationSpeed,
            speedY: (Math.random() - 0.5) * 0.25 * settings.appearance.animationSpeed,
            color: "#FBBF24", // sparkling gold
            alpha: Math.random() * 0.7 + 0.15,
            pulseDirection: Math.random() > 0.5 ? 0.015 : -0.015,
          });
        }
      }

      // 13. Digital Matrix Rain Column Heads
      if (settings.particles.digitalRain) {
        const columns = Math.floor(width / 24);
        for (let i = 0; i < columns; i += 2) {
          particles.push({
            type: "digital_rain",
            x: i * 24 + Math.random() * 6,
            y: Math.random() * height - height,
            size: Math.random() * 3 + 10, // Font size range
            speedX: 0,
            speedY: (Math.random() * 2 + 3) * settings.appearance.animationSpeed,
            color: "#22C55E",
            alpha: Math.random() * 0.65 + 0.35,
            pulseDirection: 0,
            symbol: Math.random() > 0.5 ? "1" : "0"
          });
        }
      }
    };

    initParticles();

    // Sound alert controller for lightning flashes
    let lightningFlashIntensity = 0;
    let lightningTimer = 0;

    // Light rays controller
    let lightRayAngle = -0.15;

    // Energy wave offsets
    let waveOffset1 = 0;
    let waveOffset2 = Math.PI / 2;
    let animTime = 0;

    // Redraw frame loop
    const draw = () => {
      // Clear with background color blending alpha
      ctx.fillStyle = `rgba(${SettingsManager.hexToRgb(theme.bgStart)}, 0.16)`;
      ctx.fillRect(0, 0, width, height);

      // --- PROCEDURAL BACKGROUND DECORATIONS (BASED ON SELECTED ID) ---
      const bgId = settings.background.selectedId;
      animTime += 0.015 * settings.appearance.animationSpeed;

      // ==========================================
      // 1. CYBERPUNK CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      if (bgId.startsWith("cyber-") || bgId.startsWith("cyber")) {
        // Hexagon wireframe background mesh for all cyber themes
        ctx.strokeStyle = `rgba(${primRgb}, 0.012)`;
        ctx.lineWidth = 1.0;
        const hexSize = 50;
        const h = hexSize * Math.sqrt(3);
        for (let y = -h; y < height + h; y += h) {
          for (let x = -hexSize; x < width + hexSize; x += hexSize * 3) {
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
              const hX = x + hexSize * Math.cos(angle);
              const hY = y + hexSize * Math.sin(angle);
              if (angle === 0) ctx.moveTo(hX, hY);
              else ctx.lineTo(hX, hY);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }

        if (bgId === "cyber-sunset") {
          // Retro Synthwave Sunset Scene
          const centerX = width * 0.5;
          const centerY = height * 0.5;
          const sunRadius = Math.min(width, height) * 0.18;
          
          // Glowing radial sun
          const sunGrad = ctx.createLinearGradient(centerX, centerY - sunRadius, centerX, centerY + sunRadius);
          sunGrad.addColorStop(0, "#F50057"); // Cyber hot pink
          sunGrad.addColorStop(0.5, "#FF1744"); // Red magenta
          sunGrad.addColorStop(1, "#FF9100"); // Hot orange
          
          ctx.save();
          ctx.fillStyle = sunGrad;
          if (settings.uiEffects.glowAnimations) {
            ctx.shadowColor = "#FF1744";
            ctx.shadowBlur = 15;
          }
          ctx.beginPath();
          ctx.arc(centerX, centerY - 20, sunRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Cut horizontal scanlines from the bottom half of the sun
          ctx.fillStyle = `rgba(${SettingsManager.hexToRgb(theme.bgStart)}, 1)`;
          const scanlineSpacing = 14;
          for (let sy = centerY - sunRadius; sy < centerY + sunRadius + 20; sy += scanlineSpacing) {
            const lineY = Math.round(sy);
            if (lineY > centerY - 45) {
              const lineThickness = Math.max(1, (lineY - (centerY - 45)) * 0.16);
              ctx.fillRect(centerX - sunRadius - 15, lineY, sunRadius * 2 + 30, lineThickness);
            }
          }

          // Dynamic perspective grid stretching down
          ctx.strokeStyle = `rgba(${primRgb}, 0.08)`;
          ctx.lineWidth = 1.0;
          const horizonY = centerY + 10;
          
          // Radial grid beams converging to horizon
          const lineCount = 18;
          for (let i = 0; i <= lineCount; i++) {
            const xRatio = i / lineCount;
            const startX = width * (0.5 + (xRatio - 0.5) * 0.14);
            const endX = width * (0.5 + (xRatio - 0.5) * 2.5);
            ctx.beginPath();
            ctx.moveTo(startX, horizonY);
            ctx.lineTo(endX, height);
            ctx.stroke();
          }

          // Horizontal grid lines scrolling down to simulate motion
          const gridSpacing = 28;
          const scrollOffset = (animTime * 14) % gridSpacing;
          for (let gy = horizonY + scrollOffset; gy < height; gy += gridSpacing) {
            const ratio = (gy - horizonY) / (height - horizonY);
            ctx.strokeStyle = `rgba(${primRgb}, ${0.01 + ratio * 0.1})`;
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(width, gy);
            ctx.stroke();
          }
        } else if (bgId === "cyber-neon-city" || bgId === "cyber-streets" || bgId === "cyber-skyline") {
          // Dynamic holographic city skyline silhouettes
          ctx.save();
          const cityCount = Math.ceil(width / 75) + 2;
          for (let i = 0; i < cityCount; i++) {
            const hSeeded = Math.sin(i * 1.6) * 50 + Math.cos(i * 2.8) * 30 + 130;
            const bWidth = 60 + (i % 3) * 15;
            const bX = i * (bWidth - 12) - 20;
            const bY = height - hSeeded;
            
            // Outer silhouette plate
            ctx.fillStyle = "rgba(8, 12, 22, 0.94)";
            ctx.fillRect(bX, bY, bWidth - 4, hSeeded);
            ctx.strokeStyle = `rgba(${primRgb}, 0.03)`;
            ctx.strokeRect(bX, bY, bWidth - 4, hSeeded);
            
            // Rows of cyber neon office windows
            ctx.fillStyle = (i % 2 === 0) ? "rgba(0, 245, 255, 0.16)" : "rgba(236, 72, 153, 0.16)";
            const winCols = 3;
            const winRows = Math.floor(hSeeded / 18);
            const cellW = (bWidth - 10) / winCols;
            for (let r = 2; r < winRows - 1; r++) {
              for (let c = 0; c < winCols; c++) {
                if (Math.sin(i * 3 + r * 6 + c * 8 + animTime * 0.6) > -0.1) {
                  ctx.fillRect(bX + 5 + c * cellW + 1, bY + r * 15, cellW - 3, 7);
                }
              }
            }
          }
          ctx.restore();
        } else if (bgId === "cyber-tunnel" || bgId === "cyber-tron-highway") {
          // Perspective zooming infinite neon square tunnel
          ctx.save();
          const maxSquares = 7;
          const centerX = width * 0.5;
          const centerY = height * 0.5;
          for (let i = 0; i < maxSquares; i++) {
            const progress = ((i / maxSquares) + (animTime * 0.12)) % 1.0;
            const size = Math.pow(progress, 2.4) * Math.max(width, height) * 1.1;
            const opacity = Math.sin(progress * Math.PI) * 0.14;
            ctx.strokeStyle = `rgba(${primRgb}, ${opacity})`;
            ctx.lineWidth = 1.0 + progress * 2.0;
            ctx.strokeRect(centerX - size * 0.5, centerY - size * 0.5, size, size);
            
            // Corner depth guide lines
            ctx.strokeStyle = `rgba(${primRgb}, 0.01)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY); ctx.lineTo(0, 0);
            ctx.moveTo(centerX, centerY); ctx.lineTo(width, 0);
            ctx.moveTo(centerX, centerY); ctx.lineTo(0, height);
            ctx.moveTo(centerX, centerY); ctx.lineTo(width, height);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ==========================================
      // 2. TECHNOLOGY CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("tech-") || bgId.startsWith("tech")) {
        // Base circuit traces
        ctx.strokeStyle = `rgba(${primRgb}, 0.015)`;
        ctx.lineWidth = 1.0;
        const spacing = 130;
        for (let x = spacing; x < width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height * 0.35);
          ctx.lineTo(x + 45, height * 0.35 + 45);
          ctx.lineTo(x + 45, height);
          ctx.stroke();
        }

        if (bgId === "tech-cpu" || bgId === "tech-processor" || bgId === "tech-microchip" || bgId === "tech-motherboard") {
          // Central main processing chip core
          const centerX = width * 0.5;
          const centerY = height * 0.5;
          const chipSize = 150;
          
          ctx.save();
          // Substrate backing
          ctx.fillStyle = "rgba(10, 18, 30, 0.5)";
          ctx.strokeStyle = `rgba(${primRgb}, 0.15)`;
          ctx.lineWidth = 1.8;
          ctx.strokeRect(centerX - chipSize * 0.5, centerY - chipSize * 0.5, chipSize, chipSize);
          ctx.fillRect(centerX - chipSize * 0.5, centerY - chipSize * 0.5, chipSize, chipSize);
          
          // Silicon die core
          const dieSize = 65;
          ctx.fillStyle = "rgba(8, 12, 20, 0.85)";
          ctx.strokeStyle = `rgba(${secRgb}, 0.22)`;
          ctx.strokeRect(centerX - dieSize * 0.5, centerY - dieSize * 0.5, dieSize, dieSize);
          ctx.fillRect(centerX - dieSize * 0.5, centerY - dieSize * 0.5, dieSize, dieSize);
          
          // Escaping high-frequency communication traces
          ctx.strokeStyle = `rgba(${primRgb}, 0.05)`;
          ctx.lineWidth = 1.0;
          const pinLimit = 190;
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const startX = centerX + Math.cos(angle) * (chipSize * 0.5);
            const startY = centerY + Math.sin(angle) * (chipSize * 0.5);
            const midX = centerX + Math.cos(angle) * (chipSize * 0.5 + 25);
            const midY = centerY + Math.sin(angle) * (chipSize * 0.5 + 25);
            const endX = centerX + Math.cos(angle) * pinLimit + (Math.abs(Math.cos(angle)) > 0.01 ? 40 * Math.sign(Math.cos(angle)) : 0);
            const endY = centerY + Math.sin(angle) * pinLimit + (Math.abs(Math.sin(angle)) > 0.01 ? 40 * Math.sign(Math.sin(angle)) : 0);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(midX, midY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Golden solder pad point
            ctx.fillStyle = `rgba(${secRgb}, 0.25)`;
            ctx.beginPath();
            ctx.arc(endX, endY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (bgId === "tech-ai-net" || bgId === "tech-neural" || bgId === "tech-nodes") {
          // Glowing Synaptic Neural Network
          ctx.save();
          const nodeCount = 12;
          const neuralNodes: { x: number; y: number; index: number }[] = [];
          for (let i = 0; i < nodeCount; i++) {
            const xVal = Math.sin(i * 3.7) * 0.35 + 0.5;
            const yVal = Math.cos(i * 2.3) * 0.35 + 0.5;
            neuralNodes.push({ x: width * xVal, y: height * yVal, index: i });
          }

          // Draw synapses
          ctx.strokeStyle = `rgba(${primRgb}, 0.04)`;
          ctx.lineWidth = 1.0;
          for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
              const dx = neuralNodes[i].x - neuralNodes[j].x;
              const dy = neuralNodes[i].y - neuralNodes[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < width * 0.32) {
                ctx.beginPath();
                ctx.moveTo(neuralNodes[i].x, neuralNodes[i].y);
                ctx.lineTo(neuralNodes[j].x, neuralNodes[j].y);
                ctx.stroke();

                // Draw moving packets of logical electrical pulse
                const flow = (animTime * 0.35 + (i + j) * 0.08) % 1.0;
                const fx = neuralNodes[i].x - dx * flow;
                const fy = neuralNodes[i].y - dy * flow;
                ctx.fillStyle = secColor;
                ctx.beginPath();
                ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Draw synapses node core spheres
          neuralNodes.forEach(node => {
            const nodeGlow = Math.sin(animTime * 1.2 + node.index) * 2.5 + 4.5;
            ctx.fillStyle = `rgba(${primRgb}, 0.07)`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeGlow * 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = secColor;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }
      }

      // ==========================================
      // 3. SCIENCE CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("science-") || bgId.startsWith("science")) {
        if (bgId === "science-atom" || bgId === "science-electrons" || bgId === "science-protons") {
          const centerX = width * 0.5;
          const centerY = height * 0.5;
          
          ctx.save();
          // High-energy Nucleus Core Glow
          const nucleusPulse = Math.sin(animTime * 2.8) * 5.0 + 17.0;
          const coreGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, nucleusPulse);
          coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          coreGrad.addColorStop(0.3, `rgba(${primRgb}, 0.75)`);
          coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, nucleusPulse, 0, Math.PI * 2);
          ctx.fill();

          // Elliptical Electron Orbit Trails
          const baseRadius = Math.min(width, height) * 0.24;
          const orbitalPlates = 3;
          for (let i = 0; i < orbitalPlates; i++) {
            const orbitalTilt = (i * Math.PI) / orbitalPlates;
            ctx.strokeStyle = `rgba(${secRgb}, 0.07)`;
            ctx.lineWidth = 1.0;
            
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, baseRadius, baseRadius * 0.32, orbitalTilt + animTime * 0.04, 0, Math.PI * 2);
            ctx.stroke();

            // Sliding electron spheres
            const localProgress = (animTime * 1.1 + (i * Math.PI) / orbitalPlates) % (Math.PI * 2);
            const lx = baseRadius * Math.cos(localProgress);
            const ly = baseRadius * 0.32 * Math.sin(localProgress);
            
            // Coordinate rotation projection
            const tiltAngle = orbitalTilt + animTime * 0.04;
            const fx = centerX + lx * Math.cos(tiltAngle) - ly * Math.sin(tiltAngle);
            const fy = centerY + lx * Math.sin(tiltAngle) + ly * Math.cos(tiltAngle);

            ctx.fillStyle = "#FFFFFF";
            if (settings.uiEffects.glowAnimations) {
              ctx.shadowColor = secColor;
              ctx.shadowBlur = 6;
            }
            ctx.beginPath();
            ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          ctx.restore();
        } else if (bgId === "science-dna") {
          // Spectacular rotating 3D Double Helix
          ctx.save();
          const helixCenterX = width * 0.15; // Placed neatly on the left margin
          const amp = 32;
          const freq = 0.014;
          ctx.lineWidth = 1.2;
          
          for (let y = 0; y < height; y += 14) {
            const phase1 = y * freq + animTime * 1.4;
            const phase2 = phase1 + Math.PI;
            
            const x1 = helixCenterX + Math.sin(phase1) * amp;
            const x2 = helixCenterX + Math.sin(phase2) * amp;
            
            const depth1 = Math.cos(phase1);
            const depth2 = Math.cos(phase2);
            
            if (y > 0) {
              const pPhase1 = (y - 14) * freq + animTime * 1.4;
              const pPhase2 = pPhase1 + Math.PI;
              const px1 = helixCenterX + Math.sin(pPhase1) * amp;
              const px2 = helixCenterX + Math.sin(pPhase2) * amp;
              
              // Draw back strand
              ctx.strokeStyle = `rgba(${primRgb}, ${0.04 + (depth1 + 1) * 0.055})`;
              ctx.beginPath();
              ctx.moveTo(px1, y - 14);
              ctx.lineTo(x1, y);
              ctx.stroke();
              
              // Draw front strand
              ctx.strokeStyle = `rgba(${secRgb}, ${0.04 + (depth2 + 1) * 0.055})`;
              ctx.beginPath();
              ctx.moveTo(px2, y - 14);
              ctx.lineTo(x2, y);
              ctx.stroke();
            }

            // Connecting chemical ladder rungs
            const alpha = Math.min(0.18, (depth1 + depth2 + 2) * 0.05);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();

            // Bases glowing nodes
            ctx.fillStyle = depth1 > 0 ? primColor : `rgba(${primRgb}, 0.4)`;
            ctx.beginPath();
            ctx.arc(x1, y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = depth2 > 0 ? secColor : `rgba(${secRgb}, 0.4)`;
            ctx.beginPath();
            ctx.arc(x2, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // ==========================================
      // 4. GEOMETRY CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("geom-") || bgId.startsWith("geom")) {
        ctx.save();
        if (bgId === "geom-cubes" || bgId === "geom-polygon") {
          // Floating 3D wireframe rotating projection cubes
          ctx.strokeStyle = `rgba(${primRgb}, 0.08)`;
          ctx.lineWidth = 1.0;
          
          const cubes = [
            { cx: width * 0.18, cy: height * 0.3, size: 45, rotSpeed: 0.14 },
            { cx: width * 0.82, cy: height * 0.25, size: 35, rotSpeed: -0.11 },
            { cx: width * 0.5, cy: height * 0.78, size: 55, rotSpeed: 0.08 }
          ];

          cubes.forEach(cube => {
            const rot = animTime * cube.rotSpeed;
            const points = [
              {x:-1, y:-1, z:-1}, {x:1, y:-1, z:-1}, {x:1, y:1, z:-1}, {x:-1, y:1, z:-1},
              {x:-1, y:-1, z:1},  {x:1, y:-1, z:1},  {x:1, y:1, z:1},  {x:-1, y:1, z:1}
            ];

            const projected: { x: number; y: number }[] = [];
            points.forEach(p => {
              // Y rotation
              let x1 = p.x * Math.cos(rot) - p.z * Math.sin(rot);
              let z1 = p.x * Math.sin(rot) + p.z * Math.cos(rot);
              // X rotation
              let y2 = p.y * Math.cos(rot * 0.8) - z1 * Math.sin(rot * 0.8);

              projected.push({
                x: cube.cx + x1 * cube.size,
                y: cube.cy + y2 * cube.size
              });
            });

            const lines = [
              [0,1], [1,2], [2,3], [3,0], // back
              [4,5], [5,6], [6,7], [7,4], // front
              [0,4], [1,5], [2,6], [3,7]  // depth
            ];

            lines.forEach(l => {
              ctx.beginPath();
              ctx.moveTo(projected[l[0]].x, projected[l[0]].y);
              ctx.lineTo(projected[l[1]].x, projected[l[1]].y);
              ctx.stroke();
            });
          });
        } else if (bgId === "geom-diamond" || bgId === "geom-hexagon" || bgId === "geom-symmetry") {
          // Diagonal Diamond Grid Mesh
          ctx.strokeStyle = `rgba(${secRgb}, 0.02)`;
          ctx.lineWidth = 0.8;
          const step = 65;
          for (let x = -step; x < width + step; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + height, height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - height, height);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // ==========================================
      // 5. SPACE CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("space-") || bgId.startsWith("space")) {
        ctx.save();
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        if (bgId === "space-galaxy" || bgId === "space-milky-way" || bgId === "space-nebula" || bgId === "space-purple-neb" || bgId === "space-blue-gal") {
          // Swirling spiral arm cosmic gas clouds
          const swirlPoints = 120;
          for (let i = 0; i < swirlPoints; i++) {
            const factor = i / swirlPoints;
            const theta = factor * Math.PI * 6.5 + animTime * 0.16;
            const radius = factor * Math.min(width, height) * 0.44;
            
            // Arm 1 Coordinates
            const arm1X = centerX + Math.cos(theta) * radius;
            const arm1Y = centerY + Math.sin(theta) * radius;
            
            // Arm 2 Coordinates (Opposite side)
            const arm2X = centerX + Math.cos(theta + Math.PI) * radius;
            const arm2Y = centerY + Math.sin(theta + Math.PI) * radius;

            // Draw radial gas clouds
            const gasRad = 15 + factor * 45;
            const grad1 = ctx.createRadialGradient(arm1X, arm1Y, 1, arm1X, arm1Y, gasRad);
            grad1.addColorStop(0, i % 2 === 0 ? "rgba(219, 39, 119, 0.08)" : "rgba(37, 99, 235, 0.08)");
            grad1.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad1;
            ctx.beginPath(); ctx.arc(arm1X, arm1Y, gasRad, 0, Math.PI * 2); ctx.fill();

            const grad2 = ctx.createRadialGradient(arm2X, arm2Y, 1, arm2X, arm2Y, gasRad);
            grad2.addColorStop(0, i % 2 === 0 ? "rgba(124, 58, 237, 0.08)" : "rgba(8, 145, 178, 0.08)");
            grad2.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad2;
            ctx.beginPath(); ctx.arc(arm2X, arm2Y, gasRad, 0, Math.PI * 2); ctx.fill();
          }
        } else if (bgId === "space-black-hole" || bgId === "space-deep-space" || bgId === "space-supernova") {
          // Deep Space Gravitational Black Hole
          const singRad = 45;
          const diskGrad = ctx.createRadialGradient(centerX, centerY, singRad + 3, centerX, centerY, singRad + 150);
          diskGrad.addColorStop(0, "rgba(239, 68, 68, 0.42)"); // Hot red border
          diskGrad.addColorStop(0.2, "rgba(245, 158, 11, 0.22)"); // Glowing orange disk
          diskGrad.addColorStop(0.55, "rgba(59, 130, 246, 0.07)"); // Accretion warp glow
          diskGrad.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = diskGrad;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, 170, 50, -0.20, 0, Math.PI * 2);
          ctx.fill();

          // Gravity Singularity core (Pure void black)
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(centerX, centerY, singRad, 0, Math.PI * 2);
          ctx.fill();

          // Fine Einstein Ring Lensing Circle
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, singRad + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ==========================================
      // 6. CRICKET CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("cricket-") || bgId.startsWith("cricket")) {
        ctx.save();
        if (bgId === "cricket-floodlights" || bgId === "cricket-stadium" || bgId === "cricket-sunset") {
          // Massive volumetric cricket floodlights emitting diagnostic beams
          const towers = [
            { tx: width * 0.06, ty: 50 },
            { tx: width * 0.94, ty: 50 },
            { tx: width * 0.16, ty: 50 },
            { tx: width * 0.84, ty: 50 }
          ];

          towers.forEach((tower, idx) => {
            const sweep = Math.sin(animTime * 0.4 + idx * 1.6) * 0.06 - 0.16;
            const bWidth = width * 0.36;
            
            const beamGrad = ctx.createRadialGradient(tower.tx, tower.ty, 2, tower.tx, tower.ty, width * 0.45);
            beamGrad.addColorStop(0, "rgba(255, 255, 255, 0.07)");
            beamGrad.addColorStop(0.35, `rgba(${secRgb}, 0.02)`);
            beamGrad.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(tower.tx, tower.ty);
            ctx.lineTo(tower.tx + Math.sin(sweep - 0.14) * width * 0.6, height);
            ctx.lineTo(tower.tx + Math.sin(sweep + 0.14) * width * 0.6 + bWidth, height);
            ctx.closePath();
            ctx.fill();

            // Floodlight core white LED arrays
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            if (settings.uiEffects.glowAnimations) {
              ctx.shadowColor = "#FFFFFF";
              ctx.shadowBlur = 10;
            }
            ctx.beginPath();
            ctx.arc(tower.tx, tower.ty, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }

        // Standard Bowling crease pitch lines
        const centerX = width * 0.5;
        const centerY = height * 0.75;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.022)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY);
        ctx.lineTo(centerX + 100, centerY); // Bowling crease line
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY);
        ctx.lineTo(centerX - 40, centerY - 60); // Batting / Bowling stumps guidelines
        ctx.moveTo(centerX + 40, centerY);
        ctx.lineTo(centerX + 40, centerY - 60);
        ctx.stroke();
        ctx.restore();
      }

      // ==========================================
      // 7. SHADOW MONARCH CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("monarch-") || bgId.startsWith("monarch")) {
        ctx.save();
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        if (bgId === "monarch-portal" || bgId === "monarch-abyss" || bgId === "monarch-storm" || bgId === "monarch-gate") {
          // Cosmic Swirling Void Purple Dimensional Rift
          const riftGrad = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 190);
          riftGrad.addColorStop(0, "#090514"); // Dark abyssal black-purple core
          riftGrad.addColorStop(0.28, "rgba(107, 33, 168, 0.65)"); // Royal purple
          riftGrad.addColorStop(0.65, "rgba(168, 85, 247, 0.16)"); // Soft violet haze
          riftGrad.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = riftGrad;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, 230, 145, animTime * 0.14, 0, Math.PI * 2);
          ctx.fill();

          // Rotating layered concentric magical runic arrays
          ctx.strokeStyle = "rgba(168, 85, 247, 0.12)";
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(centerX, centerY, 250, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(centerX, centerY, 235, 0, Math.PI * 2); ctx.stroke();

          // Rotating magical glyph indices
          ctx.fillStyle = "rgba(192, 132, 252, 0.35)";
          ctx.font = "bold 9px monospace";
          for (let i = 0; i < 8; i++) {
            const angle = i * (Math.PI / 4) + animTime * 0.08;
            const rx = centerX + Math.cos(angle) * 242;
            const ry = centerY + Math.sin(angle) * 242;
            ctx.fillText("▲", rx - 3, ry + 3.5);
          }
        }

        if (bgId === "monarch-army" || bgId === "monarch-soldiers") {
          // Shadow Soldier army silhouettes with glowing purple visor eyes at bottom
          const soldierCount = 14;
          ctx.fillStyle = "rgba(11, 8, 18, 0.96)";
          ctx.strokeStyle = "rgba(147, 51, 234, 0.08)";
          ctx.lineWidth = 1.0;

          for (let i = 0; i < soldierCount; i++) {
            const seedX = Math.sin(i * 1.5) * 0.42 + 0.5;
            const sWidth = 62 + (i % 3) * 12;
            const sx = width * seedX - sWidth * 0.5;
            const sy = height - 70 - Math.cos(i * 2.9) * 28;

            ctx.beginPath();
            ctx.moveTo(sx, height);
            ctx.lineTo(sx + sWidth * 0.2, sy + 20);
            ctx.lineTo(sx + sWidth * 0.5, sy); // Spiky spired head helmet
            ctx.lineTo(sx + sWidth * 0.8, sy + 20);
            ctx.lineTo(sx + sWidth, height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Visor glowing slit eyes
            if (Math.sin(animTime * 1.4 + i) > -0.65) {
              ctx.fillStyle = "rgb(168, 85, 247)";
              if (settings.uiEffects.glowAnimations) {
                ctx.shadowColor = "rgb(192, 132, 252)";
                ctx.shadowBlur = 8;
              }
              ctx.fillRect(sx + sWidth * 0.4 - 4, sy + 18, 3, 2.5);
              ctx.fillRect(sx + sWidth * 0.6 + 1, sy + 18, 3, 2.5);
              ctx.shadowBlur = 0;
              ctx.fillStyle = "rgba(11, 8, 18, 0.96)";
            }
          }
        }
        ctx.restore();
      }

      // ==========================================
      // 8. FANTASY CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("fantasy-") || bgId.startsWith("fantasy")) {
        ctx.save();
        if (bgId === "fantasy-volcano" || bgId === "fantasy-river" || bgId === "fantasy-fire-temple") {
          // Flowing ground volcanic fissures glowing with lava
          const floorY = height - 40;
          const lavaGrad = ctx.createLinearGradient(0, floorY, width, height);
          lavaGrad.addColorStop(0, "rgba(220, 38, 38, 0.06)");
          lavaGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.14)");
          lavaGrad.addColorStop(1, "rgba(239, 68, 68, 0.06)");

          ctx.fillStyle = lavaGrad;
          ctx.fillRect(0, floorY - 35, width, height - floorY + 35);

          // Pulsing fiery cracks
          ctx.lineWidth = 2.5;
          const crackPulse = Math.sin(animTime * 1.6) * 0.25 + 0.5;
          ctx.strokeStyle = `rgba(249, 115, 22, ${crackPulse})`;
          ctx.beginPath();
          const veinY = height - 20;
          for (let x = 0; x < width; x += 35) {
            const offset = Math.sin(x * 0.04) * 16;
            if (x === 0) ctx.moveTo(x, veinY + offset);
            else ctx.lineTo(x, veinY + offset);
          }
          ctx.stroke();
        } else if (bgId === "fantasy-sky-islands" || bgId === "fantasy-rocks") {
          // Floating magical basalt islands gliding slowly
          ctx.fillStyle = "rgba(12, 18, 28, 0.92)";
          ctx.strokeStyle = `rgba(${primRgb}, 0.06)`;
          ctx.lineWidth = 1.0;

          const islands = [
            { x: width * 0.18, y: height * 0.42, rx: 45, ry: 16, speed: 0.18 },
            { x: width * 0.82, y: height * 0.36, rx: 36, ry: 13, speed: -0.14 },
            { x: width * 0.5,  y: height * 0.78, rx: 66, ry: 22, speed: 0.08 }
          ];

          islands.forEach(isl => {
            const offset = Math.sin(animTime * isl.speed) * 12;
            const iy = isl.y + offset;

            ctx.beginPath();
            // Spire bottom tip
            ctx.moveTo(isl.x - isl.rx, iy);
            ctx.lineTo(isl.x + isl.rx, iy);
            ctx.lineTo(isl.x, iy + isl.ry * 2.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Flat island surface cap
            ctx.fillStyle = "rgba(8, 11, 18, 0.96)";
            ctx.beginPath();
            ctx.ellipse(isl.x, iy, isl.rx, isl.ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(12, 18, 28, 0.92)";
          });
        }
        ctx.restore();
      }

      // ==========================================
      // 9. MINIMAL CATEGORY PROCEDURAL ARTWORKS
      // ==========================================
      else if (bgId.startsWith("minimal-") || bgId.startsWith("minimal")) {
        ctx.save();
        if (bgId === "minimal-dark-blur" || bgId === "minimal-frosted" || bgId === "minimal-gradient") {
          // Ambient soft-glowing volumetric color orbs blending in void
          const orbs = [
            { x: width * 0.25 + Math.sin(animTime * 0.12) * 110, y: height * 0.3 + Math.cos(animTime * 0.08) * 80, r: 250, color: primColor },
            { x: width * 0.75 + Math.cos(animTime * 0.10) * 110, y: height * 0.4 + Math.sin(animTime * 0.14) * 90, r: 290, color: secColor },
            { x: width * 0.5 + Math.sin(animTime * 0.08 + Math.PI) * 90, y: height * 0.75 + Math.cos(animTime * 0.12) * 70, r: 220, color: glowColor }
          ];

          orbs.forEach(orb => {
            const radGrad = ctx.createRadialGradient(orb.x, orb.y, 1, orb.x, orb.y, orb.r);
            const orbRgb = SettingsManager.hexToRgb(orb.color);
            radGrad.addColorStop(0, `rgba(${orbRgb}, 0.04)`);
            radGrad.addColorStop(0.5, `rgba(${orbRgb}, 0.01)`);
            radGrad.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (bgId === "minimal-carbon") {
          // Diagonal carbon fiber micro pattern
          ctx.strokeStyle = "rgba(255, 255, 255, 0.009)";
          ctx.lineWidth = 1.0;
          const step = 8;
          for (let x = 0; x < width + height; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - height, height);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // --- NEW TOGGLEABLE BACKGROUND EFFECTS & LAYERS ---

      // A. LIGHT RAYS
      if (settings.particles.lightRays && !isBattery) {
        ctx.save();
        const gradient = ctx.createLinearGradient(width * 0.3, 0, width * 0.7, height);
        gradient.addColorStop(0, `rgba(${primRgb}, 0.0)`);
        gradient.addColorStop(0.3, `rgba(${primRgb}, 0.03)`);
        gradient.addColorStop(0.5, `rgba(${secRgb}, 0.025)`);
        gradient.addColorStop(0.7, `rgba(${primRgb}, 0.03)`);
        gradient.addColorStop(1, `rgba(${primRgb}, 0.0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(width * 0.1, 0);
        ctx.lineTo(width * 0.9, 0);
        ctx.lineTo(width * 1.2, height);
        ctx.lineTo(width * -0.2, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // B. ENERGY SINE WAVES
      if (settings.particles.energyWaves && !isBattery) {
        ctx.save();
        ctx.lineWidth = 1.2;
        waveOffset1 += 0.005 * settings.appearance.animationSpeed;
        waveOffset2 += 0.007 * settings.appearance.animationSpeed;

        // Wave 1
        ctx.strokeStyle = `rgba(${primRgb}, 0.055)`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          const y = height * 0.5 + Math.sin(x * 0.003 + waveOffset1) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2
        ctx.strokeStyle = `rgba(${secRgb}, 0.045)`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          const y = height * 0.53 + Math.cos(x * 0.0025 + waveOffset2) * 25;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // C. MOVING MATRIX LINES (HORIZONTAL SCAN LINES)
      if (settings.particles.movingLines && !isBattery) {
        ctx.strokeStyle = `rgba(${primRgb}, 0.025)`;
        ctx.lineWidth = 0.5;
        const lineSpacing = 60;
        const offset = (Date.now() / 80) % lineSpacing;
        for (let y = offset; y < height; y += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // D. LIGHTNING DISCHARGES (RANDOM FLASHES)
      if (settings.particles.lightningSparks && !isBattery) {
        lightningTimer += Math.random();
        if (lightningTimer > 180) {
          lightningFlashIntensity = Math.random() * 0.4 + 0.1;
          lightningTimer = 0;
        }

        if (lightningFlashIntensity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlashIntensity})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlashIntensity -= 0.012 * settings.appearance.animationSpeed;
        }
      }

      // E. NETWORK CONNECTIVITY FOR FLOATING ORBS
      if (settings.particles.floating && !isPerformance && !isBattery) {
        ctx.strokeStyle = `rgba(${primRgb}, 0.04)`;
        ctx.lineWidth = 0.5;
        const floatingList = particles.filter(p => p.type === "floating");
        for (let i = 0; i < floatingList.length; i++) {
          for (let j = i + 1; j < floatingList.length; j++) {
            const dx = floatingList[i].x - floatingList[j].x;
            const dy = floatingList[i].y - floatingList[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              ctx.beginPath();
              ctx.moveTo(floatingList[i].x, floatingList[i].y);
              ctx.lineTo(floatingList[j].x, floatingList[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // --- DRAW AND ANIMATE ALL PARTICLES ---
      particles.forEach((p) => {
        // Apply Motion Controller if enabled
        if (settings.background.motionEnabled) {
          p.x += p.speedX;
          p.y += p.speedY;

          // Recycle positions depending on particle type
          if (p.type === "snow") {
            if (p.y > height) {
              p.y = 0;
              p.x = Math.random() * width;
            }
          } else if (p.type === "rain") {
            if (p.y > height) {
              p.y = -20;
              p.x = Math.random() * width;
            }
          } else if (p.type === "digital_rain") {
            if (p.y > height) {
              p.y = -24;
              p.x = Math.random() * width;
              p.symbol = Math.random() > 0.5 ? "1" : "0";
            }
          } else if (p.type === "leaf") {
            if (p.angle !== undefined && p.spin !== undefined) {
              p.angle += p.spin;
            }
            if (p.y > height || p.x > width) {
              p.y = -20;
              p.x = Math.random() * width;
            }
          } else if (p.type === "spark") {
            p.alpha += p.pulseDirection;
            if (p.alpha <= 0) {
              p.x = Math.random() * width;
              p.y = Math.random() * height;
              p.alpha = Math.random() * 0.8 + 0.2;
            }
          } else if (p.type === "xp") {
            p.alpha += p.pulseDirection;
            if (p.alpha <= 0) {
              p.x = Math.random() * width;
              p.y = height + 10;
              p.alpha = Math.random() * 0.6 + 0.35;
            }
          } else if (p.type === "smoke") {
            p.alpha += p.pulseDirection;
            if (p.alpha <= 0) {
              p.x = Math.random() * width;
              p.y = height + 30;
              p.alpha = Math.random() * 0.08 + 0.01;
            }
          } else {
            // Standard bouncing border logic
            if (p.x < 0 || p.x > width) p.speedX *= -1;
            if (p.y < 0 || p.y > height) p.speedY *= -1;
          }
        }

        // Handle alphas twinkling/pulsing over time
        if (p.pulseDirection !== 0 && p.type !== "spark" && p.type !== "xp" && p.type !== "smoke") {
          p.alpha += p.pulseDirection;
          if (p.alpha > 0.85 || p.alpha < 0.08) {
            p.pulseDirection *= -1;
          }
        }

        // Draw particle representation
        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === "xp" && p.symbol) {
          ctx.fillStyle = p.color;
          ctx.font = `bold ${Math.round(p.size * 5.5)}px monospace`;
          ctx.fillText(p.symbol, p.x, p.y);
        } else if (p.type === "digital_rain") {
          ctx.fillStyle = p.color;
          ctx.font = `bold ${Math.round(p.size)}px monospace`;
          // Drop head is bright white
          if (Math.random() > 0.8) {
            ctx.fillStyle = "#FFFFFF";
          }
          ctx.fillText(p.symbol || "0", p.x, p.y);
        } else if (p.type === "leaf") {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "rain") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + 11);
          ctx.stroke();
        } else if (p.type === "smoke") {
          const smokeGrad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.size);
          smokeGrad.addColorStop(0, "rgba(55, 65, 81, 0.15)");
          smokeGrad.addColorStop(1, "rgba(15, 23, 42, 0.0)");
          ctx.fillStyle = smokeGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Circular nodes
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          if (settings.uiEffects.glowAnimations && p.type !== "star" && p.type !== "dust" && p.type !== "magic_dust") {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.type === "purple_orb" ? 20 : 6;
          }
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings]);

  // Set customized styles for filters
  const opacityVal = settings.background.opacity / 100;
  const filterVal = `blur(${settings.background.blur}px) brightness(${settings.background.brightness}%)`;

  return (
    <>
      {/* 1. CUSTOM PHONE WALLPAPER LAYER */}
      {activeCustomWallpaper && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
          style={{
            backgroundImage: `url(${activeCustomWallpaper.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: (activeCustomWallpaper.opacity !== undefined ? activeCustomWallpaper.opacity : settings.background.opacity) / 100,
            filter: `blur(${(activeCustomWallpaper.blur !== undefined ? activeCustomWallpaper.blur : settings.background.blur)}px) brightness(${(activeCustomWallpaper.brightness !== undefined ? activeCustomWallpaper.brightness : settings.background.brightness)}%)`
          }}
        />
      )}

      {/* 2. DYNAMIC AMBIENT PARTICLE CANVAS */}
      <canvas
        ref={canvasRef}
        id="portal-matrix-ambient"
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
        style={{
          opacity: activeCustomWallpaper ? 0.75 : opacityVal,
          filter: activeCustomWallpaper ? "none" : filterVal
        }}
      />

      {/* 3. SHADOW BLACKOUT OVERLAY COVER */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300 bg-black"
        style={{ 
          opacity: activeCustomWallpaper 
            ? (activeCustomWallpaper.darknessOverlay !== undefined ? activeCustomWallpaper.darknessOverlay : settings.background.darknessOverlay) / 100
            : settings.background.darknessOverlay / 100 
        }}
      />
    </>
  );
}
