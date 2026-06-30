// Monarch Spinner System Settings & Theme Engine Manager
// This file handles the storage, presets, and customization defaults for the complete RPG Personalization Hub.

export interface ThemePreset {
  id: string;
  name: string;
  category?: string; // Color Collection Category
  primary: string;
  secondary: string;
  glow: string;
  accent: string;
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  border: string;
  textHighlight: string;
  progressBarColor: string;
  description: string;
  isCustom?: boolean;
}

export const BUILT_IN_THEMES: ThemePreset[] = [
  // ==================== PURPLE COLLECTION ====================
  {
    id: "shadow-monarch",
    name: "Shadow Monarch",
    category: "Purple",
    primary: "#7B2FFF",
    secondary: "#00D9FF",
    glow: "#9333EA",
    accent: "#C084FC",
    bgStart: "#03010a",
    bgEnd: "#0a0518",
    cardBg: "#0b071a",
    border: "rgba(123, 47, 255, 0.25)",
    textHighlight: "#00D9FF",
    progressBarColor: "#7B2FFF",
    description: "Deep Black canvas overlaid with electric purple and cyber cyan energy. The classic Monarch look."
  },
  {
    id: "dark-violet",
    name: "Dark Violet",
    category: "Purple",
    primary: "#6D28D9",
    secondary: "#A78BFA",
    glow: "#4C1D95",
    accent: "#DDD6FE",
    bgStart: "#020108",
    bgEnd: "#0c0620",
    cardBg: "#110a2b",
    border: "rgba(109, 40, 217, 0.25)",
    textHighlight: "#A78BFA",
    progressBarColor: "#6D28D9",
    description: "Immersive twilight violet with deep velvet panels and soft lilac stars."
  },
  {
    id: "neon-purple",
    name: "Neon Purple",
    category: "Purple",
    primary: "#D946EF",
    secondary: "#F472B6",
    glow: "#C026D3",
    accent: "#FDF2F8",
    bgStart: "#050005",
    bgEnd: "#1a0118",
    cardBg: "#220320",
    border: "rgba(217, 70, 239, 0.28)",
    textHighlight: "#F472B6",
    progressBarColor: "#D946EF",
    description: "Vibrant high-saturation magenta and neon violet. Electric, futuristic, and highly energetic."
  },
  {
    id: "royal-violet",
    name: "Royal Violet",
    category: "Purple",
    primary: "#4C1D95",
    secondary: "#F59E0B",
    glow: "#5B21B6",
    accent: "#FDE68A",
    bgStart: "#03010c",
    bgEnd: "#0d0526",
    cardBg: "#140a33",
    border: "rgba(91, 33, 182, 0.3)",
    textHighlight: "#F59E0B",
    progressBarColor: "#4C1D95",
    description: "Imperial purple fused with rich sovereign gold accents for elite-tier spinners."
  },
  {
    id: "cosmic-purple",
    name: "Cosmic Purple",
    category: "Purple",
    primary: "#8B5CF6",
    secondary: "#06B6D4",
    glow: "#6D28D9",
    accent: "#C7D2FE",
    bgStart: "#03020b",
    bgEnd: "#0e0924",
    cardBg: "#151030",
    border: "rgba(139, 92, 246, 0.25)",
    textHighlight: "#06B6D4",
    progressBarColor: "#8B5CF6",
    description: "Interstellar nebula styling with cool cosmic cyan sparks drifting in dark violet space."
  },
  {
    id: "lavender-glow",
    name: "Lavender Glow",
    category: "Purple",
    primary: "#A78BFA",
    secondary: "#F472B6",
    glow: "#8B5CF6",
    accent: "#F5F3FF",
    bgStart: "#04030a",
    bgEnd: "#120e24",
    cardBg: "#1a1630",
    border: "rgba(167, 139, 250, 0.2)",
    textHighlight: "#F472B6",
    progressBarColor: "#A78BFA",
    description: "A softer, ambient lavender and pink twilight. Gentle on the eyes with a warm, magical touch."
  },
  {
    id: "mystic-orchid",
    name: "Mystic Orchid",
    category: "Purple",
    primary: "#C084FC",
    secondary: "#34D399",
    glow: "#A855F7",
    accent: "#F3E8FF",
    bgStart: "#050209",
    bgEnd: "#150b24",
    cardBg: "#1c1130",
    border: "rgba(192, 132, 252, 0.24)",
    textHighlight: "#34D399",
    progressBarColor: "#C084FC",
    description: "Exotic magenta-purple base layered with refreshing neon mint-green vector targets."
  },
  {
    id: "ultra-violet",
    name: "Ultra Violet",
    category: "Purple",
    primary: "#581C87",
    secondary: "#10B981",
    glow: "#701A75",
    accent: "#E9D5FF",
    bgStart: "#030006",
    bgEnd: "#11021c",
    cardBg: "#180526",
    border: "rgba(88, 28, 135, 0.25)",
    textHighlight: "#10B981",
    progressBarColor: "#581C87",
    description: "Deep electromagnetic radiation spectrum theme. Extreme contrast with rich toxic emerald highlights."
  },
  {
    id: "purple-plasma",
    name: "Purple Plasma",
    category: "Purple",
    primary: "#9333EA",
    secondary: "#38BDF8",
    glow: "#7E22CE",
    accent: "#F5F3FF",
    bgStart: "#04010a",
    bgEnd: "#120524",
    cardBg: "#190b30",
    border: "rgba(147, 51, 234, 0.26)",
    textHighlight: "#38BDF8",
    progressBarColor: "#9333EA",
    description: "Supercharged gaseous purple discharges combined with hot cyan lightning bolts."
  },
  {
    id: "amethyst-core",
    name: "Amethyst Core",
    category: "Purple",
    primary: "#701A75",
    secondary: "#F43F5E",
    glow: "#4A044E",
    accent: "#FDF4FF",
    bgStart: "#030005",
    bgEnd: "#12011a",
    cardBg: "#1b0326",
    border: "rgba(112, 26, 117, 0.25)",
    textHighlight: "#F43F5E",
    progressBarColor: "#701A75",
    description: "Geode crystalline dark purple reflecting sharp, fiery pink facets."
  },

  // ==================== BLUE COLLECTION ====================
  {
    id: "sapphire",
    name: "Sapphire Dream",
    category: "Blue",
    primary: "#1D4ED8",
    secondary: "#60A5FA",
    glow: "#1E40AF",
    accent: "#DBEAFE",
    bgStart: "#01020a",
    bgEnd: "#040a1f",
    cardBg: "#07112e",
    border: "rgba(29, 78, 216, 0.25)",
    textHighlight: "#60A5FA",
    progressBarColor: "#1D4ED8",
    description: "Rich royal blue crystal interface. Deep, stable, and highly focused."
  },
  {
    id: "royal-blue",
    name: "Royal Blue",
    category: "Blue",
    primary: "#2563EB",
    secondary: "#FBBF24",
    glow: "#1D4ED8",
    accent: "#EFF6FF",
    bgStart: "#01030d",
    bgEnd: "#050f28",
    cardBg: "#0a163b",
    border: "rgba(37, 99, 235, 0.25)",
    textHighlight: "#FBBF24",
    progressBarColor: "#2563EB",
    description: "High-contrast noble blue background with dazzling golden coronas."
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    category: "Blue",
    primary: "#0369A1",
    secondary: "#0D9488",
    glow: "#075985",
    accent: "#E0F2FE",
    bgStart: "#01040a",
    bgEnd: "#031220",
    cardBg: "#051c30",
    border: "rgba(3, 105, 161, 0.25)",
    textHighlight: "#0D9488",
    progressBarColor: "#0369A1",
    description: "Abyssal trench theme with bioluminescent teal current lines."
  },
  {
    id: "ice-blue",
    name: "Ice Blue",
    category: "Blue",
    primary: "#06B6D4",
    secondary: "#E2E8F0",
    glow: "#0891B2",
    accent: "#ECFEFF",
    bgStart: "#01050a",
    bgEnd: "#051524",
    cardBg: "#082138",
    border: "rgba(6, 182, 212, 0.22)",
    textHighlight: "#FFFFFF",
    progressBarColor: "#06B6D4",
    description: "Frozen glacier core. Extremely clean and high contrast with biting white frost edges."
  },
  {
    id: "azure-storm",
    name: "Azure Storm",
    category: "Blue",
    primary: "#3B82F6",
    secondary: "#06B6D4",
    glow: "#1D4ED8",
    accent: "#BFDBFE",
    bgStart: "#020714",
    bgEnd: "#05132d",
    cardBg: "#081b3b",
    border: "rgba(59, 130, 246, 0.25)",
    textHighlight: "#06B6D4",
    progressBarColor: "#3B82F6",
    description: "High-voltage ice blue thunderstorm theme. Crashing energy fields and freezing gradients."
  },
  {
    id: "electric-blue",
    name: "Electric Blue",
    category: "Blue",
    primary: "#2563EB",
    secondary: "#38BDF8",
    glow: "#1D4ED8",
    accent: "#EFF6FF",
    bgStart: "#01030e",
    bgEnd: "#030e26",
    cardBg: "#06163b",
    border: "rgba(37, 99, 235, 0.28)",
    textHighlight: "#38BDF8",
    progressBarColor: "#2563EB",
    description: "Pulsing electrical circuitry. Sharp, clean, and highly stimulating."
  },
  {
    id: "cyan-pulse",
    name: "Cyan Pulse",
    category: "Blue",
    primary: "#06B6D4",
    secondary: "#10B981",
    glow: "#0891B2",
    accent: "#E6FFFA",
    bgStart: "#010408",
    bgEnd: "#04131a",
    cardBg: "#06202b",
    border: "rgba(6, 182, 212, 0.25)",
    textHighlight: "#10B981",
    progressBarColor: "#06B6D4",
    description: "Subtle medical/cyber-hologram layout. Fresh, technical, and precise."
  },
  {
    id: "neon-sky",
    name: "Neon Sky",
    category: "Blue",
    primary: "#00D9FF",
    secondary: "#FF007F",
    glow: "#00A6C0",
    accent: "#E0FCFF",
    bgStart: "#01020a",
    bgEnd: "#050b1a",
    cardBg: "#08122c",
    border: "rgba(0, 217, 255, 0.3)",
    textHighlight: "#FF007F",
    progressBarColor: "#00D9FF",
    description: "Luminous synthwave sky fusing cyber blue and blazing fluorescent pink."
  },
  {
    id: "arctic-blue",
    name: "Arctic Blue",
    category: "Blue",
    primary: "#67E8F9",
    secondary: "#94A3B8",
    glow: "#0891B2",
    accent: "#F0FDFA",
    bgStart: "#02050a",
    bgEnd: "#091524",
    cardBg: "#11223b",
    border: "rgba(103, 232, 249, 0.2)",
    textHighlight: "#F1F5F9",
    progressBarColor: "#67E8F9",
    description: "Frigid arctic sea colors combined with clean, cool slate tones."
  },
  {
    id: "midnight-ocean",
    name: "Midnight Ocean",
    category: "Blue",
    primary: "#0F172A",
    secondary: "#38BDF8",
    glow: "#1E293B",
    accent: "#94A3B8",
    bgStart: "#020308",
    bgEnd: "#070c1a",
    cardBg: "#0d1326",
    border: "rgba(56, 189, 248, 0.15)",
    textHighlight: "#38BDF8",
    progressBarColor: "#38BDF8",
    description: "Extremely deep navy blue with subtle glowing cyan radar sweeps."
  },

  // ==================== GREEN COLLECTION ====================
  {
    id: "emerald-phantom",
    name: "Emerald Phantom",
    category: "Green",
    primary: "#10B981",
    secondary: "#06D6A0",
    glow: "#047857",
    accent: "#A7F3D0",
    bgStart: "#020603",
    bgEnd: "#08180e",
    cardBg: "#0b1c12",
    border: "rgba(16, 115, 81, 0.25)",
    textHighlight: "#06D6A0",
    progressBarColor: "#10B981",
    description: "Neon emerald cybernetic vibe. Quiet, deadly, and highly precise."
  },
  {
    id: "matrix-green",
    name: "Matrix Green",
    category: "Green",
    primary: "#22C55E",
    secondary: "#4ADE80",
    glow: "#15803D",
    accent: "#DCFCE7",
    bgStart: "#010401",
    bgEnd: "#031204",
    cardBg: "#051a07",
    border: "rgba(34, 197, 150, 0.25)",
    textHighlight: "#4ADE80",
    progressBarColor: "#22C55E",
    description: "Retro terminal matrix layout. Luminous phosphor cascade colors."
  },
  {
    id: "cyber-lime",
    name: "Cyber Lime",
    category: "Green",
    primary: "#84CC16",
    secondary: "#A3E635",
    glow: "#4F7A0F",
    accent: "#F7FEE7",
    bgStart: "#030401",
    bgEnd: "#0b1403",
    cardBg: "#111f06",
    border: "rgba(132, 204, 22, 0.25)",
    textHighlight: "#A3E635",
    progressBarColor: "#84CC16",
    description: "High-octane neon lime. Searing nuclear core visuals with deep toxic outlines."
  },
  {
    id: "toxic-glow",
    name: "Toxic Glow",
    category: "Green",
    primary: "#00FF66",
    secondary: "#38BDF8",
    glow: "#006622",
    accent: "#E6FFE6",
    bgStart: "#000301",
    bgEnd: "#011204",
    cardBg: "#031c07",
    border: "rgba(0, 255, 102, 0.3)",
    textHighlight: "#38BDF8",
    progressBarColor: "#00FF66",
    description: "Ultra-bright fluorescent toxic acid. High visibility with glowing radar overlays."
  },
  {
    id: "forest-spirit",
    name: "Forest Spirit",
    category: "Green",
    primary: "#65A30D",
    secondary: "#84CC16",
    glow: "#3F6212",
    accent: "#BEF264",
    bgStart: "#010402",
    bgEnd: "#05160b",
    cardBg: "#091e10",
    border: "rgba(101, 163, 13, 0.25)",
    textHighlight: "#84CC16",
    progressBarColor: "#65A30D",
    description: "Shamanic nature-glow layout. Earthy deep forest background with fluorescent lime."
  },
  {
    id: "jungle-heart",
    name: "Jungle Heart",
    category: "Green",
    primary: "#047857",
    secondary: "#FBBF24",
    glow: "#065F46",
    accent: "#D1FAE5",
    bgStart: "#010403",
    bgEnd: "#031209",
    cardBg: "#051b0f",
    border: "rgba(4, 120, 87, 0.25)",
    textHighlight: "#FBBF24",
    progressBarColor: "#047857",
    description: "Dappled deep jungle sunlight. Dark emerald leaves with brilliant golden rays."
  },
  {
    id: "nature-pulse",
    name: "Nature Pulse",
    category: "Green",
    primary: "#10B981",
    secondary: "#3B82F6",
    glow: "#047857",
    accent: "#ECFDF5",
    bgStart: "#020403",
    bgEnd: "#081018",
    cardBg: "#0e1a26",
    border: "rgba(16, 185, 129, 0.22)",
    textHighlight: "#3B82F6",
    progressBarColor: "#10B981",
    description: "Organic vital energy flow. Peaceful emerald fields with soft water currents."
  },
  {
    id: "neon-emerald",
    name: "Neon Emerald",
    category: "Green",
    primary: "#059669",
    secondary: "#00D9FF",
    glow: "#047857",
    accent: "#D1FAE5",
    bgStart: "#010403",
    bgEnd: "#041416",
    cardBg: "#072024",
    border: "rgba(5, 150, 105, 0.28)",
    textHighlight: "#00D9FF",
    progressBarColor: "#059669",
    description: "Pulsing mineral crystal. Brilliant green lights with cybernetic sky-blue wires."
  },
  {
    id: "mint-glow",
    name: "Mint Glow",
    category: "Green",
    primary: "#34D399",
    secondary: "#6EE7B7",
    glow: "#059669",
    accent: "#F0FDF4",
    bgStart: "#020403",
    bgEnd: "#0a1310",
    cardBg: "#101e19",
    border: "rgba(52, 211, 153, 0.18)",
    textHighlight: "#A7F3D0",
    progressBarColor: "#34D399",
    description: "Cool, minty fresh layout. Relaxing, eye-safe, and incredibly smooth."
  },
  {
    id: "biohazard",
    name: "Biohazard Core",
    category: "Green",
    primary: "#15803D",
    secondary: "#F97316",
    glow: "#166534",
    accent: "#DCFCE7",
    bgStart: "#020301",
    bgEnd: "#0b1205",
    cardBg: "#111b08",
    border: "rgba(21, 128, 61, 0.28)",
    textHighlight: "#F97316",
    progressBarColor: "#15803D",
    description: "Quarantine warning. Luminous toxic sludge green with bright hazard-orange flares."
  },

  // ==================== RED COLLECTION ====================
  {
    id: "crimson-inferno",
    name: "Crimson Inferno",
    category: "Red",
    primary: "#EF4444",
    secondary: "#F97316",
    glow: "#DC2626",
    accent: "#FCA5A5",
    bgStart: "#070202",
    bgEnd: "#1a0505",
    cardBg: "#1e0707",
    border: "rgba(239, 68, 68, 0.25)",
    textHighlight: "#EF4444",
    progressBarColor: "#EF4444",
    description: "Volcanic dark aesthetic infused with searing red magma glow and burning orange highlights."
  },
  {
    id: "blood-moon",
    name: "Blood Moon",
    category: "Red",
    primary: "#DC2626",
    secondary: "#7F1D1D",
    glow: "#991B1B",
    accent: "#F87171",
    bgStart: "#030000",
    bgEnd: "#120202",
    cardBg: "#1a0404",
    border: "rgba(220, 38, 38, 0.22)",
    textHighlight: "#DC2626",
    progressBarColor: "#DC2626",
    description: "Dark eclipse motif. Heavy blood-red saturation with pitch-black outlines."
  },
  {
    id: "inferno-rage",
    name: "Inferno Rage",
    category: "Red",
    primary: "#EF4444",
    secondary: "#F59E0B",
    glow: "#B91C1C",
    accent: "#FEE2E2",
    bgStart: "#050101",
    bgEnd: "#1a0404",
    cardBg: "#240808",
    border: "rgba(239, 68, 68, 0.28)",
    textHighlight: "#F59E0B",
    progressBarColor: "#EF4444",
    description: "The pure wrath of the flame. Raging scarlet with bursting golden embers."
  },
  {
    id: "lava-core",
    name: "Lava Core",
    category: "Red",
    primary: "#F97316",
    secondary: "#EF4444",
    glow: "#C2410C",
    accent: "#FFEDD5",
    bgStart: "#050201",
    bgEnd: "#180903",
    cardBg: "#220e06",
    border: "rgba(249, 115, 22, 0.25)",
    textHighlight: "#EF4444",
    progressBarColor: "#F97316",
    description: "Viscous, glowing tectonic pressure. Blazing orange grids melting into deep red magma."
  },
  {
    id: "ruby-shards",
    name: "Ruby Shards",
    category: "Red",
    primary: "#BE123C",
    secondary: "#F43F5E",
    glow: "#881337",
    accent: "#FFE4E6",
    bgStart: "#040001",
    bgEnd: "#150207",
    cardBg: "#1e040c",
    border: "rgba(190, 18, 60, 0.24)",
    textHighlight: "#F43F5E",
    progressBarColor: "#BE123C",
    description: "Shattered ruby crystal. Elegant, luxurious rose-red with razor-sharp sparkles."
  },
  {
    id: "scarlet-tide",
    name: "Scarlet Tide",
    category: "Red",
    primary: "#991B1B",
    secondary: "#EC4899",
    glow: "#7F1D1D",
    accent: "#FCA5A5",
    bgStart: "#030001",
    bgEnd: "#110206",
    cardBg: "#1a050d",
    border: "rgba(153, 27, 27, 0.24)",
    textHighlight: "#EC4899",
    progressBarColor: "#991B1B",
    description: "Chaotic red oceans overlaid with neon magenta lightning storms."
  },
  {
    id: "firestorm",
    name: "Firestorm",
    category: "Red",
    primary: "#EA580C",
    secondary: "#EAB308",
    glow: "#C2410C",
    accent: "#FED7AA",
    bgStart: "#040200",
    bgEnd: "#140b03",
    cardBg: "#1c1107",
    border: "rgba(234, 88, 12, 0.25)",
    textHighlight: "#EAB308",
    progressBarColor: "#EA580C",
    description: "Searing wind vortexes. Wild orange flares tearing through deep amber clouds."
  },
  {
    id: "ember-spark",
    name: "Ember Spark",
    category: "Red",
    primary: "#F97316",
    secondary: "#D946EF",
    glow: "#9A3412",
    accent: "#FFEDD5",
    bgStart: "#040103",
    bgEnd: "#140510",
    cardBg: "#1c0a1a",
    border: "rgba(249, 115, 22, 0.25)",
    textHighlight: "#D946EF",
    progressBarColor: "#F97316",
    description: "Flickering ash particles bursting into neon purple electric charges."
  },
  {
    id: "phoenix-wing",
    name: "Phoenix Wing",
    category: "Red",
    primary: "#EF4444",
    secondary: "#FBBF24",
    glow: "#DC2626",
    accent: "#FEE2E2",
    bgStart: "#040200",
    bgEnd: "#150602",
    cardBg: "#200c05",
    border: "rgba(239, 68, 68, 0.28)",
    textHighlight: "#FBBF24",
    progressBarColor: "#EF4444",
    description: "The rebirth cycle of the sky. Feathery scarlet embers with warm, soaring gold halos."
  },
  {
    id: "volcano-rift",
    name: "Volcano Rift",
    category: "Red",
    primary: "#7F1D1D",
    secondary: "#F97316",
    glow: "#450A0A",
    accent: "#F87171",
    bgStart: "#030000",
    bgEnd: "#0e0202",
    cardBg: "#160505",
    border: "rgba(127, 29, 29, 0.26)",
    textHighlight: "#F97316",
    progressBarColor: "#7F1D1D",
    description: "Dread volcanic rift. Pitch black basalt basalt stones cracked open by orange magma."
  },

  // ==================== GOLD COLLECTION ====================
  {
    id: "golden-emperor",
    name: "Golden Emperor",
    category: "Gold",
    primary: "#FBBF24",
    secondary: "#F59E0B",
    glow: "#D97706",
    accent: "#FEF08A",
    bgStart: "#060502",
    bgEnd: "#161105",
    cardBg: "#1a1408",
    border: "rgba(251, 191, 36, 0.25)",
    textHighlight: "#FBBF24",
    progressBarColor: "#FBBF24",
    description: "Luxury dark gold theme. Perfect for royal spinners aiming for absolute mastery."
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    category: "Gold",
    primary: "#D97706",
    secondary: "#FFFFFF",
    glow: "#B45309",
    accent: "#FEF3C7",
    bgStart: "#050301",
    bgEnd: "#140e04",
    cardBg: "#1b1408",
    border: "rgba(217, 119, 6, 0.26)",
    textHighlight: "#FFFFFF",
    progressBarColor: "#D97706",
    description: "Polished pure 24-karat gold grids highlighted with diamond white sparkles."
  },
  {
    id: "bronze-colossus",
    name: "Bronze Colossus",
    category: "Gold",
    primary: "#CA8A04",
    secondary: "#9A3412",
    glow: "#854D0E",
    accent: "#FEF08A",
    bgStart: "#040301",
    bgEnd: "#120d04",
    cardBg: "#19140b",
    border: "rgba(202, 138, 4, 0.24)",
    textHighlight: "#F59E0B",
    progressBarColor: "#CA8A04",
    description: "Weathered antique bronze. Warm, ancient metal luster with deep rust outlines."
  },
  {
    id: "amber-haze",
    name: "Amber Haze",
    category: "Gold",
    primary: "#EAB308",
    secondary: "#F97316",
    glow: "#CA8A04",
    accent: "#FEF9C3",
    bgStart: "#040301",
    bgEnd: "#140e02",
    cardBg: "#1b1405",
    border: "rgba(234, 179, 8, 0.22)",
    textHighlight: "#F97316",
    progressBarColor: "#EAB308",
    description: "Warm, calming amber glow. Soft, eye-safe yellow and orange light patterns."
  },
  {
    id: "sunlight-gild",
    name: "Sunlight Gild",
    category: "Gold",
    primary: "#FACC15",
    secondary: "#38BDF8",
    glow: "#CA8A04",
    accent: "#FEF08A",
    bgStart: "#030301",
    bgEnd: "#0e111a",
    cardBg: "#151926",
    border: "rgba(250, 204, 21, 0.24)",
    textHighlight: "#38BDF8",
    progressBarColor: "#FACC15",
    description: "Bright morning sunshine casting yellow rays across a crystal blue morning sky."
  },
  {
    id: "desert-gold",
    name: "Desert Gold",
    category: "Gold",
    primary: "#EAB308",
    secondary: "#F59E0B",
    glow: "#A16207",
    accent: "#FEF9C3",
    bgStart: "#050401",
    bgEnd: "#161205",
    cardBg: "#1e180a",
    border: "rgba(234, 179, 8, 0.24)",
    textHighlight: "#FEF9C3",
    progressBarColor: "#EAB308",
    description: "Shifting sahara desert sands. Warm golden dust flying over a dark oasis."
  },
  {
    id: "ancient-king",
    name: "Ancient King",
    category: "Gold",
    primary: "#D97706",
    secondary: "#8B5CF6",
    glow: "#B45309",
    accent: "#FEF3C7",
    bgStart: "#040206",
    bgEnd: "#140920",
    cardBg: "#1b0f2a",
    border: "rgba(217, 119, 6, 0.28)",
    textHighlight: "#8B5CF6",
    progressBarColor: "#D97706",
    description: "Dread tomb of the Pharaoh. Mystic purple runes floating over golden treasure chambers."
  },
  {
    id: "platinum-gold",
    name: "Platinum Gold",
    category: "Gold",
    primary: "#FEF08A",
    secondary: "#E2E8F0",
    glow: "#FACC15",
    accent: "#FFFFFF",
    bgStart: "#070709",
    bgEnd: "#15161d",
    cardBg: "#1c1d29",
    border: "rgba(254, 240, 138, 0.2)",
    textHighlight: "#E2E8F0",
    progressBarColor: "#FEF08A",
    description: "Futuristic elite platinum finish. Brilliantly pale gold metal with chrome borders."
  },
  {
    id: "yellow-neon",
    name: "Yellow Neon",
    category: "Gold",
    primary: "#FACC15",
    secondary: "#00FF66",
    glow: "#EAB308",
    accent: "#FEF9C3",
    bgStart: "#020300",
    bgEnd: "#0b1204",
    cardBg: "#121b08",
    border: "rgba(250, 204, 21, 0.3)",
    textHighlight: "#00FF66",
    progressBarColor: "#FACC15",
    description: "High voltage yellow arcs firing over chemical lime-green warning grids."
  },
  {
    id: "solar-core",
    name: "Solar Core",
    category: "Gold",
    primary: "#F59E0B",
    secondary: "#EF4444",
    glow: "#D97706",
    accent: "#FEF3C7",
    bgStart: "#040201",
    bgEnd: "#140803",
    cardBg: "#1c0d06",
    border: "rgba(245, 158, 11, 0.25)",
    textHighlight: "#EF4444",
    progressBarColor: "#F59E0B",
    description: "The core of the Sun. Boundless gold energy with erupting solar red prominence loops."
  },

  // ==================== WHITE COLLECTION ====================
  {
    id: "frost-monarch",
    name: "Frost Monarch",
    category: "White",
    primary: "#38BDF8",
    secondary: "#F8FAFC",
    glow: "#0284C7",
    accent: "#E2E8F0",
    bgStart: "#030914",
    bgEnd: "#09172e",
    cardBg: "#0e2240",
    border: "rgba(56, 189, 248, 0.25)",
    textHighlight: "#38BDF8",
    progressBarColor: "#38BDF8",
    description: "Ice-capped tundra atmosphere with crystal white frost borders and cold cyan halos."
  },
  {
    id: "snow-drift",
    name: "Snow Drift",
    category: "White",
    primary: "#E2E8F0",
    secondary: "#94A3B8",
    glow: "#CBD5E1",
    accent: "#FFFFFF",
    bgStart: "#08090f",
    bgEnd: "#171a24",
    cardBg: "#1e2230",
    border: "rgba(226, 232, 240, 0.15)",
    textHighlight: "#FFFFFF",
    progressBarColor: "#E2E8F0",
    description: "Luminous snow blizzards. Elegant off-whites drifting across deep navy peaks."
  },
  {
    id: "crystal-shard",
    name: "Crystal Shard",
    category: "White",
    primary: "#FFFFFF",
    secondary: "#8B5CF6",
    glow: "#D1D5DB",
    accent: "#F3F4F6",
    bgStart: "#07040d",
    bgEnd: "#130d24",
    cardBg: "#1a1330",
    border: "rgba(255, 255, 255, 0.2)",
    textHighlight: "#8B5CF6",
    progressBarColor: "#FFFFFF",
    description: "Shattered white quartz prisms casting ultraviolet light reflections."
  },
  {
    id: "silver-aura",
    name: "Silver Aura",
    category: "White",
    primary: "#94A3B8",
    secondary: "#F1F5F9",
    glow: "#64748B",
    accent: "#FFFFFF",
    bgStart: "#08090d",
    bgEnd: "#141721",
    cardBg: "#1c1f2b",
    border: "rgba(148, 163, 184, 0.18)",
    textHighlight: "#F1F5F9",
    progressBarColor: "#94A3B8",
    description: "Quiet metallic silver. Smooth, professional, and exceptionally readable."
  },
  {
    id: "diamond-gleam",
    name: "Diamond Gleam",
    category: "White",
    primary: "#F8FAFC",
    secondary: "#22D3EE",
    glow: "#E2E8F0",
    accent: "#FFFFFF",
    bgStart: "#05080c",
    bgEnd: "#111822",
    cardBg: "#192230",
    border: "rgba(248, 250, 252, 0.2)",
    textHighlight: "#22D3EE",
    progressBarColor: "#F8FAFC",
    description: "Extremely high brightness white diamonds with icy neon cyan laser lines."
  },
  {
    id: "pearl-essence",
    name: "Pearl Essence",
    category: "White",
    primary: "#E2E8F0",
    secondary: "#F472B6",
    glow: "#CBD5E1",
    accent: "#FFF1F2",
    bgStart: "#060408",
    bgEnd: "#15101a",
    cardBg: "#1c1726",
    border: "rgba(226, 232, 240, 0.15)",
    textHighlight: "#F472B6",
    progressBarColor: "#E2E8F0",
    description: "Iridescent pearlescent sheen. White oyster cells pulsing with soft pink energy."
  },
  {
    id: "moonlight-halo",
    name: "Moonlight Halo",
    category: "White",
    primary: "#E2E8F0",
    secondary: "#FACC15",
    glow: "#94A3B8",
    accent: "#FFFFFF",
    bgStart: "#030408",
    bgEnd: "#0c0f1b",
    cardBg: "#121729",
    border: "rgba(226, 232, 240, 0.16)",
    textHighlight: "#FACC15",
    progressBarColor: "#E2E8F0",
    description: "Clear night sky lit by a majestic full moon casting amber silver rings."
  },
  {
    id: "glacier-peak",
    name: "Glacier Peak",
    category: "White",
    primary: "#F1F5F9",
    secondary: "#0EA5E9",
    glow: "#E2E8F0",
    accent: "#FFFFFF",
    bgStart: "#04070d",
    bgEnd: "#111b29",
    cardBg: "#182638",
    border: "rgba(241, 245, 249, 0.18)",
    textHighlight: "#0EA5E9",
    progressBarColor: "#F1F5F9",
    description: "Pure glacial sheets drifting in cold, deep oceanic water paths."
  },
  {
    id: "white-flame",
    name: "White Flame",
    category: "White",
    primary: "#FFFFFF",
    secondary: "#F97316",
    glow: "#E2E8F0",
    accent: "#FFF7ED",
    bgStart: "#060301",
    bgEnd: "#160c05",
    cardBg: "#221309",
    border: "rgba(255, 255, 255, 0.25)",
    textHighlight: "#F97316",
    progressBarColor: "#FFFFFF",
    description: "High temperature celestial flame. Searing white fires spitting hot orange plasma."
  },
  {
    id: "arctic-breeze",
    name: "Arctic Breeze",
    category: "White",
    primary: "#CBD5E1",
    secondary: "#2DD4BF",
    glow: "#94A3B8",
    accent: "#F0FDFA",
    bgStart: "#030607",
    bgEnd: "#0d171a",
    cardBg: "#152429",
    border: "rgba(203, 213, 225, 0.16)",
    textHighlight: "#2DD4BF",
    progressBarColor: "#CBD5E1",
    description: "Crisp polar air sweep. Luminous ice crystals blending with fresh mint teal."
  },

  // ==================== BLACK COLLECTION ====================
  {
    id: "obsidian",
    name: "Obsidian Core",
    category: "Black",
    primary: "#4B5563",
    secondary: "#FFFFFF",
    glow: "#374151",
    accent: "#9CA3AF",
    bgStart: "#040404",
    bgEnd: "#0e0e0e",
    cardBg: "#141414",
    border: "rgba(156, 163, 175, 0.15)",
    textHighlight: "#F3F4F6",
    progressBarColor: "#4B5563",
    description: "Matte black stealth layout. Ultra-minimalist interface with pure white and silver sparks."
  },
  {
    id: "carbon-weave",
    name: "Carbon Weave",
    category: "Black",
    primary: "#1E293B",
    secondary: "#94A3B8",
    glow: "#0F172A",
    accent: "#CBD5E1",
    bgStart: "#020203",
    bgEnd: "#0b0c10",
    cardBg: "#11131a",
    border: "rgba(148, 163, 184, 0.12)",
    textHighlight: "#E2E8F0",
    progressBarColor: "#1E293B",
    description: "Woven graphite fibers. Tactile, premium industrial dark grid."
  },
  {
    id: "graphite-matte",
    name: "Graphite Matte",
    category: "Black",
    primary: "#334155",
    secondary: "#E2E8F0",
    glow: "#1E293B",
    accent: "#94A3B8",
    bgStart: "#050506",
    bgEnd: "#101115",
    cardBg: "#161820",
    border: "rgba(51, 65, 85, 0.18)",
    textHighlight: "#F8FAFC",
    progressBarColor: "#334155",
    description: "Chalkboard slate. Heavy gray blocks, matte overlays, and high legibility white text."
  },
  {
    id: "matte-black",
    name: "Matte Black",
    category: "Black",
    primary: "#111111",
    secondary: "#888888",
    glow: "#000000",
    accent: "#CCCCCC",
    bgStart: "#020202",
    bgEnd: "#080808",
    cardBg: "#0d0d0d",
    border: "rgba(255, 255, 255, 0.04)",
    textHighlight: "#FFFFFF",
    progressBarColor: "#333333",
    description: "Triple black. Zero emission backgrounds, dark slate borders, and sharp white labels."
  },
  {
    id: "void-reaper",
    name: "Void Reaper",
    category: "Black",
    primary: "#0F051D",
    secondary: "#8B5CF6",
    glow: "#05000a",
    accent: "#C084FC",
    bgStart: "#010003",
    bgEnd: "#05010d",
    cardBg: "#0a0314",
    border: "rgba(139, 92, 246, 0.18)",
    textHighlight: "#C084FC",
    progressBarColor: "#8B5CF6",
    description: "The abyss staring back. Absolute darkness broken only by haunting purple flares."
  },
  {
    id: "eclipse-shadow",
    name: "Eclipse Shadow",
    category: "Black",
    primary: "#111827",
    secondary: "#FCA5A5",
    glow: "#030712",
    accent: "#D1D5DB",
    bgStart: "#020203",
    bgEnd: "#080b12",
    cardBg: "#0f121d",
    border: "rgba(248, 113, 113, 0.12)",
    textHighlight: "#FCA5A5",
    progressBarColor: "#111827",
    description: "Solar shadow. Infinite charcoal canvas outlined in soft reddish-gray eclipse rays."
  },
  {
    id: "black-chrome",
    name: "Black Chrome",
    category: "Black",
    primary: "#1F2937",
    secondary: "#6B7280",
    glow: "#111827",
    accent: "#E5E7EB",
    bgStart: "#030406",
    bgEnd: "#0c0d12",
    cardBg: "#12141c",
    border: "rgba(255, 255, 255, 0.1)",
    textHighlight: "#F9FAFB",
    progressBarColor: "#1F2937",
    description: "Polished liquid steel. High reflectivity black mirrors with cold silver lines."
  },
  {
    id: "steel-plate",
    name: "Steel Plate",
    category: "Black",
    primary: "#374151",
    secondary: "#9CA3AF",
    glow: "#1F2937",
    accent: "#D1D5DB",
    bgStart: "#040507",
    bgEnd: "#111419",
    cardBg: "#181d24",
    border: "rgba(55, 65, 81, 0.2)",
    textHighlight: "#F3F4F6",
    progressBarColor: "#374151",
    description: "Ironclad grid. Rugged steel sheets bounded by dark zinc plates."
  },
  {
    id: "shadow-stalker",
    name: "Shadow Stalker",
    category: "Black",
    primary: "#18181B",
    secondary: "#10B981",
    glow: "#09090B",
    accent: "#A7F3D0",
    bgStart: "#020202",
    bgEnd: "#08090b",
    cardBg: "#0f1114",
    border: "rgba(16, 185, 129, 0.12)",
    textHighlight: "#10B981",
    progressBarColor: "#18181B",
    description: "Dread assassin profile. Pitch dark canvas with sharp neon emerald scopes."
  },
  {
    id: "onyx-jewel",
    name: "Onyx Jewel",
    category: "Black",
    primary: "#09090B",
    secondary: "#F43F5E",
    glow: "#020203",
    accent: "#FECDD3",
    bgStart: "#010101",
    bgEnd: "#070405",
    cardBg: "#0f0a0c",
    border: "rgba(244, 63, 94, 0.12)",
    textHighlight: "#F43F5E",
    progressBarColor: "#E11D48",
    description: "Faceted dark volcanic glass pulsing with high pressure crimson beams."
  },

  // ==================== CYBER COLLECTION ====================
  {
    id: "cyber-cyan",
    name: "Cyber Cyan",
    category: "Cyber",
    primary: "#06B6D4",
    secondary: "#FF007F",
    glow: "#0891B2",
    accent: "#ECFEFF",
    bgStart: "#010408",
    bgEnd: "#04141d",
    cardBg: "#07202c",
    border: "rgba(6, 182, 212, 0.28)",
    textHighlight: "#FF007F",
    progressBarColor: "#06B6D4",
    description: "High-voltage city grid. Luminous cyan streets cutting through hot magenta walls."
  },
  {
    id: "cyber-pink",
    name: "Cyber Pink",
    category: "Cyber",
    primary: "#EC4899",
    secondary: "#00FFCC",
    glow: "#C026D3",
    accent: "#FDF2F8",
    bgStart: "#040103",
    bgEnd: "#14040f",
    cardBg: "#1c0717",
    border: "rgba(236, 72, 153, 0.28)",
    textHighlight: "#00FFCC",
    progressBarColor: "#EC4899",
    description: "Luminous acid pink layout overlaid with sharp cybernetic turquoise streams."
  },
  {
    id: "cyber-green",
    name: "Cyber Green",
    category: "Cyber",
    primary: "#10B981",
    secondary: "#FACC15",
    glow: "#047857",
    accent: "#ECFDF5",
    bgStart: "#010402",
    bgEnd: "#05150e",
    cardBg: "#092217",
    border: "rgba(16, 185, 129, 0.25)",
    textHighlight: "#FACC15",
    progressBarColor: "#10B981",
    description: "Augmented digital scanner. Neon green metrics combined with bright hazard gold indicators."
  },
  {
    id: "cyber-red",
    name: "Cyber Red",
    category: "Cyber",
    primary: "#EF4444",
    secondary: "#00F0FF",
    glow: "#B91C1C",
    accent: "#FEE2E2",
    bgStart: "#050102",
    bgEnd: "#19040a",
    cardBg: "#220811",
    border: "rgba(239, 68, 68, 0.28)",
    textHighlight: "#00F0FF",
    progressBarColor: "#EF4444",
    description: "Tactical combat visor. Aggressive warning red framed by chilling hologram blue."
  },
  {
    id: "cyber-gold",
    name: "Cyber Gold",
    category: "Cyber",
    primary: "#FACC15",
    secondary: "#8B5CF6",
    glow: "#D97706",
    accent: "#FEF9C3",
    bgStart: "#040301",
    bgEnd: "#110b1a",
    cardBg: "#19112a",
    border: "rgba(250, 204, 21, 0.25)",
    textHighlight: "#8B5CF6",
    progressBarColor: "#FACC15",
    description: "Corporate high-tech luxury. Glowing heavy gold circuits coupled with violet lasers."
  },
  {
    id: "cyber-purple",
    name: "Cyber Purple",
    category: "Cyber",
    primary: "#8B5CF6",
    secondary: "#00FFCC",
    glow: "#6D28D9",
    accent: "#EEF2FF",
    bgStart: "#030209",
    bgEnd: "#0f0825",
    cardBg: "#160f34",
    border: "rgba(139, 92, 246, 0.28)",
    textHighlight: "#00FFCC",
    progressBarColor: "#8B5CF6",
    description: "Synthwave sunset mainframe. Intense purple neon blocks with turquoise terminal markers."
  },
  {
    id: "tron-grid",
    name: "Tron Highway",
    category: "Cyber",
    primary: "#38BDF8",
    secondary: "#FF3366",
    glow: "#0284C7",
    accent: "#E0F2FE",
    bgStart: "#010207",
    bgEnd: "#04091c",
    cardBg: "#07112d",
    border: "rgba(56, 189, 248, 0.3)",
    textHighlight: "#FF3366",
    progressBarColor: "#38BDF8",
    description: "High velocity virtual grid. Light cycles leaving bright sky-blue trails across a dark arena."
  },
  {
    id: "matrix-hacker",
    name: "Matrix Hacker",
    category: "Cyber",
    primary: "#00FF66",
    secondary: "#10B981",
    glow: "#004D1A",
    accent: "#E6FFE6",
    bgStart: "#000100",
    bgEnd: "#010702",
    cardBg: "#031105",
    border: "rgba(0, 255, 102, 0.25)",
    textHighlight: "#10B981",
    progressBarColor: "#00FF66",
    description: "Underground software terminal. Streaming green console indicators with blacked-out cards."
  },
  {
    id: "digital-core",
    name: "Digital Core",
    category: "Cyber",
    primary: "#6366F1",
    secondary: "#F43F5E",
    glow: "#4338CA",
    accent: "#EEF2FF",
    bgStart: "#030208",
    bgEnd: "#0e0921",
    cardBg: "#14102f",
    border: "rgba(99, 102, 241, 0.25)",
    textHighlight: "#F43F5E",
    progressBarColor: "#6366F1",
    description: "Central processing core. Vibrant electric indigo with burning rose warning signals."
  },
  {
    id: "holographic-sky",
    name: "Holographic Sky",
    category: "Cyber",
    primary: "#A5F3FC",
    secondary: "#FBCFE8",
    glow: "#0891B2",
    accent: "#FFFFFF",
    bgStart: "#02050b",
    bgEnd: "#0a1321",
    cardBg: "#111f33",
    border: "rgba(165, 243, 252, 0.22)",
    textHighlight: "#FBCFE8",
    progressBarColor: "#A5F3FC",
    description: "Glitchy neon sky layers. Dazzling light-blue hologram projections with soft pink static."
  },

  // ==================== FANTASY COLLECTION ====================
  {
    id: "dragon-soul",
    name: "Dragon Soul",
    category: "Fantasy",
    primary: "#DC2626",
    secondary: "#F59E0B",
    glow: "#7F1D1D",
    accent: "#FEF2F2",
    bgStart: "#040101",
    bgEnd: "#140404",
    cardBg: "#1c0707",
    border: "rgba(220, 38, 38, 0.28)",
    textHighlight: "#F59E0B",
    progressBarColor: "#DC2626",
    description: "Searing dragon fire theme. Ancient red embers with flickering gold sparks."
  },
  {
    id: "ancient-rune",
    name: "Ancient Rune",
    category: "Fantasy",
    primary: "#7C3AED",
    secondary: "#10B981",
    glow: "#5B21B6",
    accent: "#F5F3FF",
    bgStart: "#030109",
    bgEnd: "#100624",
    cardBg: "#170c30",
    border: "rgba(124, 58, 237, 0.25)",
    textHighlight: "#10B981",
    progressBarColor: "#7C3AED",
    description: "Enchanted magic stone. Violet rune circles glowing alongside deep forest moss."
  },
  {
    id: "phoenix-flame",
    name: "Phoenix Flame",
    category: "Fantasy",
    primary: "#EA580C",
    secondary: "#FACC15",
    glow: "#9A3412",
    accent: "#FFF7ED",
    bgStart: "#040200",
    bgEnd: "#140c03",
    cardBg: "#1d1207",
    border: "rgba(234, 88, 12, 0.26)",
    textHighlight: "#FACC15",
    progressBarColor: "#EA580C",
    description: "Sovereign fire bird wings. Bursting orange feathers lighting up deep charcoal clouds."
  },
  {
    id: "abyss-stalker",
    name: "Abyssal Rift",
    category: "Fantasy",
    primary: "#111827",
    secondary: "#A855F7",
    glow: "#030712",
    accent: "#D1D5DB",
    bgStart: "#020104",
    bgEnd: "#07040e",
    cardBg: "#0d0a18",
    border: "rgba(168, 85, 247, 0.16)",
    textHighlight: "#A855F7",
    progressBarColor: "#111827",
    description: "Subterranean rift void. Pitch black cavern outlined in glowing ultraviolet streams."
  },
  {
    id: "celestial-arch",
    name: "Celestial Void",
    category: "Fantasy",
    primary: "#6366F1",
    secondary: "#00D9FF",
    glow: "#4F46E5",
    accent: "#E0E7FF",
    bgStart: "#02020a",
    bgEnd: "#090924",
    cardBg: "#101035",
    border: "rgba(99, 102, 241, 0.25)",
    textHighlight: "#00D9FF",
    progressBarColor: "#6366F1",
    description: "Deep space sanctuary. Divine indigo portals reflecting cosmic cyan stars."
  },
  {
    id: "mystic-oracle",
    name: "Mystic Oracle",
    category: "Fantasy",
    primary: "#EC4899",
    secondary: "#F59E0B",
    glow: "#BE185D",
    accent: "#FDF2F8",
    bgStart: "#040103",
    bgEnd: "#14040c",
    cardBg: "#1c0713",
    border: "rgba(236, 72, 153, 0.24)",
    textHighlight: "#F59E0B",
    progressBarColor: "#EC4899",
    description: "Shattered fortune sphere. Mysterious magenta clouds framed in ancient golden circles."
  },
  {
    id: "arcane-power",
    name: "Arcane Library",
    category: "Fantasy",
    primary: "#8B5CF6",
    secondary: "#F43F5E",
    glow: "#6D28D9",
    accent: "#EEF2FF",
    bgStart: "#030208",
    bgEnd: "#0d0720",
    cardBg: "#140b2e",
    border: "rgba(139, 92, 246, 0.26)",
    textHighlight: "#F43F5E",
    progressBarColor: "#8B5CF6",
    description: "Sealed wizard books. Intensely glowing violet pages projecting hot rose-red spells."
  },
  {
    id: "spirit-guide",
    name: "Spirit Forest",
    category: "Green",
    primary: "#14B8A6",
    secondary: "#C084FC",
    glow: "#0F766E",
    accent: "#F0FDFA",
    bgStart: "#010404",
    bgEnd: "#051616",
    cardBg: "#0a2222",
    border: "rgba(20, 184, 166, 0.25)",
    textHighlight: "#C084FC",
    progressBarColor: "#14B8A6",
    description: "Enchanted spirit woods. Bioluminescent teal leaves with floating purple pixie orbs."
  },
  {
    id: "divine-light",
    name: "Divine Heavens",
    category: "Fantasy",
    primary: "#F59E0B",
    secondary: "#38BDF8",
    glow: "#D97706",
    accent: "#FEF3C7",
    bgStart: "#040301",
    bgEnd: "#0d1320",
    cardBg: "#141c2c",
    border: "rgba(245, 158, 11, 0.25)",
    textHighlight: "#38BDF8",
    progressBarColor: "#F59E0B",
    description: "Heavenly gates. Glowing golden borders looking onto expansive blue skies."
  },
  {
    id: "chaos-vortex",
    name: "Chaos Vortex",
    category: "Fantasy",
    primary: "#111827",
    secondary: "#EF4444",
    glow: "#030712",
    accent: "#D1D5DB",
    bgStart: "#030000",
    bgEnd: "#0e0202",
    cardBg: "#160505",
    border: "rgba(239, 68, 68, 0.16)",
    textHighlight: "#EF4444",
    progressBarColor: "#E11D48",
    description: "Swirling dimensional static. Heavy ash black sheets torn apart by bloody red lines."
  },

  // ==================== OTHER POPULAR THEMES ====================
  {
    id: "galaxy",
    name: "Galaxy Space",
    category: "Purple",
    primary: "#8B5CF6",
    secondary: "#EC4899",
    glow: "#D946EF",
    accent: "#F472B6",
    bgStart: "#06020f",
    bgEnd: "#150529",
    cardBg: "#1b0833",
    border: "rgba(139, 92, 246, 0.25)",
    textHighlight: "#EC4899",
    progressBarColor: "#8B5CF6",
    description: "Space nebula cosmic layout. Shifting pink, purple, and blue hues with starry backing."
  },
  {
    id: "lightning",
    name: "Volt Lightning",
    category: "Blue",
    primary: "#2563EB",
    secondary: "#FACC15",
    glow: "#EAB308",
    accent: "#93C5FD",
    bgStart: "#02040c",
    bgEnd: "#050b1d",
    cardBg: "#071028",
    border: "rgba(37, 99, 235, 0.25)",
    textHighlight: "#FACC15",
    progressBarColor: "#2563EB",
    description: "Pure electric speed. Electric yellow currents shooting across deep navy panels."
  },
  {
    id: "cosmic-void",
    name: "Cosmic Void",
    category: "Purple",
    primary: "#6366F1",
    secondary: "#D946EF",
    glow: "#4F46E5",
    accent: "#C084FC",
    bgStart: "#04020a",
    bgEnd: "#0d061c",
    cardBg: "#120a26",
    border: "rgba(99, 102, 241, 0.25)",
    textHighlight: "#D946EF",
    progressBarColor: "#6366F1",
    description: "Infinite indigo matrix. Dark purple void lit by brilliant ultraviolet flares."
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    category: "Gold",
    primary: "#F97316",
    secondary: "#FBBF24",
    glow: "#EA580C",
    accent: "#FED7AA",
    bgStart: "#050200",
    bgEnd: "#1a0b02",
    cardBg: "#220e03",
    border: "rgba(249, 115, 22, 0.25)",
    textHighlight: "#FBBF24",
    progressBarColor: "#F97316",
    description: "High energy corona theme with exploding orange radiation and gold particles."
  },
  {
    id: "ocean-depth",
    name: "Ocean Depth",
    category: "Blue",
    primary: "#0EA5E9",
    secondary: "#14B8A6",
    glow: "#0369A1",
    accent: "#7DD3FC",
    bgStart: "#01050e",
    bgEnd: "#041427",
    cardBg: "#061e38",
    border: "rgba(14, 165, 233, 0.25)",
    textHighlight: "#14B8A6",
    progressBarColor: "#0EA5E9",
    description: "Submerged marine ecosystem. Calming teal and light blue glowing underwater currents."
  },
  {
    id: "shadow-flame",
    name: "Shadow Flame",
    category: "Purple",
    primary: "#8B5CF6",
    secondary: "#F97316",
    glow: "#7C3AED",
    accent: "#FFedd5",
    bgStart: "#040208",
    bgEnd: "#12061a",
    cardBg: "#180a24",
    border: "rgba(139, 92, 246, 0.25)",
    textHighlight: "#F97316",
    progressBarColor: "#8B5CF6",
    description: "Chaotic purple dark flames licking onto hot glowing orange embers."
  },
  {
    id: "royal-sapphire",
    name: "Royal Sapphire",
    category: "Blue",
    primary: "#2563EB",
    secondary: "#E2E8F0",
    glow: "#1D4ED8",
    accent: "#94A3B8",
    bgStart: "#02040c",
    bgEnd: "#071126",
    cardBg: "#0a1733",
    border: "rgba(37, 99, 235, 0.25)",
    textHighlight: "#F8FAFC",
    progressBarColor: "#2563EB",
    description: "Elegant deep royal sapphire with cold silver elements and clean white sparks."
  },
  {
    id: "neon-matrix",
    name: "Neon Matrix",
    category: "Green",
    primary: "#22C55E",
    secondary: "#15803D",
    glow: "#166534",
    accent: "#86EFAC",
    bgStart: "#010302",
    bgEnd: "#041006",
    cardBg: "#06180a",
    border: "rgba(34, 197, 150, 0.25)",
    textHighlight: "#22C55E",
    progressBarColor: "#22C55E",
    description: "Retro terminal matrix grid. Streaming neon green cascading columns."
  },
  {
    id: "phantom-white",
    name: "Phantom White",
    category: "White",
    primary: "#D1D5DB",
    secondary: "#111827",
    glow: "#9CA3AF",
    accent: "#FFFFFF",
    bgStart: "#0c0d0f",
    bgEnd: "#171a21",
    cardBg: "#1d212a",
    border: "rgba(209, 213, 219, 0.15)",
    textHighlight: "#FFFFFF",
    progressBarColor: "#D1D5DB",
    description: "Silver spectral monochrome style. Haunting gray overlays and bright white core nodes."
  },
  {
    id: "cyber-crimson",
    name: "Cyber Crimson",
    category: "Cyber",
    primary: "#EC4899",
    secondary: "#EF4444",
    glow: "#DB2777",
    accent: "#FBCFE8",
    bgStart: "#050103",
    bgEnd: "#14040b",
    cardBg: "#1b0711",
    border: "rgba(236, 72, 153, 0.25)",
    textHighlight: "#EF4444",
    progressBarColor: "#EC4899",
    description: "Vibrant neon cyberpunk layout fusing high-saturation pink ribbons and scarlet codes."
  }
];

export interface BackgroundPreset {
  id: string;
  name: string;
  category: string;
  desc: string;
}

export const BACKGROUNDS: BackgroundPreset[] = [
  // ==================== CYBERPUNK ====================
  { id: "cyber-neon-city", category: "Cyberpunk", name: "Neon City", desc: "Glowing signs, dark rain-slicked alleys, and neon skyscrapers." },
  { id: "cyber-digital-grid", category: "Cyberpunk", name: "Digital Grid", desc: "Classic retro perspective neon wireframe landscape lines." },
  { id: "cyber-tron-highway", category: "Cyberpunk", name: "Tron Highway", desc: "Speeding neon light trails cutting across infinite black asphalt." },
  { id: "cyber-streets", category: "Cyberpunk", name: "Cyber Streets", desc: "Rainy cyberpunk corridors with towering animated billboards." },
  { id: "cyber-buildings", category: "Cyberpunk", name: "Hologram Buildings", desc: "Translucent cyan sky-structures projecting data matrix arrays." },
  { id: "cyber-neon-rain", category: "Cyberpunk", name: "Neon Rain", desc: "Fluorescent pink and green rain drops cascading down glass." },
  { id: "cyber-data-cubes", category: "Cyberpunk", name: "Floating Data Cubes", desc: "Slowly rotating transparent data nodes drifting in dark void." },
  { id: "cyber-circuit-world", category: "Cyberpunk", name: "Circuit World", desc: "Pulsing electrical micro-networks spanning across the floor." },
  { id: "cyber-ai-core", category: "Cyberpunk", name: "AI Core Reactor", desc: "High-voltage reactor core venting purple diagnostic plasma waves." },
  { id: "cyber-server-room", category: "Cyberpunk", name: "Quantum Server Room", desc: "Rows of cryogenic quantum computers flickering green and amber." },
  { id: "cyber-terminal", category: "Cyberpunk", name: "Hacker Terminal", desc: "Cascading green matrix shell scripts streaming on active screens." },
  { id: "cyber-skyline", category: "Cyberpunk", name: "Cyber Skyline", desc: "Staggered high-contrast twilight clouds above a neon skyline." },
  { id: "cyber-sunset", category: "Cyberpunk", name: "Synthwave Sunset", desc: "Wireframe sun sinking into purple mountains with orange scanlines." },
  { id: "cyber-hexagons", category: "Cyberpunk", name: "Glowing Hexagons", desc: "Dazzling neon honeycomb grids fading in and out on scroll." },
  { id: "cyber-tunnel", category: "Cyberpunk", name: "Infinite Data Tunnel", desc: "Rushing past high-speed geometric network fibers at warp speed." },

  // ==================== TECHNOLOGY ====================
  { id: "tech-motherboard", category: "Technology", name: "Motherboard", desc: "Close-up perspective of golden solder joints and microchip pins." },
  { id: "tech-cpu", category: "Technology", name: "CPU Close-up", desc: "The metallic silicon surface of an elite multi-core processor." },
  { id: "tech-quantum", category: "Technology", name: "Quantum Computer", desc: "Golden chandelier reactor core operating under absolute zero." },
  { id: "tech-blue-circuit", category: "Technology", name: "Blue Circuit", desc: "Pulsing electrical charge corridors tracing through navy boards." },
  { id: "tech-green-circuit", category: "Technology", name: "Green Circuit", desc: "Classic emerald green circuit pathways glowing with static data." },
  { id: "tech-processor", category: "Technology", name: "Digital Processor", desc: "Central arithmetic units flashing logic flags dynamically." },
  { id: "tech-server-farm", category: "Technology", name: "Server Farm", desc: "A dark corridor of mainframe cabinets with flashing diagnostic LEDs." },
  { id: "tech-lab", category: "Technology", name: "Robotics Lab", desc: "Hydraulic machinery and green lasers aligning robotic joints." },
  { id: "tech-ai-net", category: "Technology", name: "AI Network", desc: "Neural synapse models triggering sparks along silver axon lines." },
  { id: "tech-fiber-optics", category: "Technology", name: "Fiber Optics", desc: "Bundled glass fibers transmitting glowing data beams." },
  { id: "tech-binary", category: "Technology", name: "Binary Streams", desc: "Columns of 1s and 0s falling downwards on a black terminal." },
  { id: "tech-data-center", category: "Technology", name: "Data Center", desc: "Chilled Server aisles shrouded in diagnostic blue halos." },
  { id: "tech-microchip", category: "Technology", name: "Microchip World", desc: "Magnified silicon landscapes showing geometric transistor canyons." },
  { id: "tech-nodes", category: "Technology", name: "Electric Nodes", desc: "Static charges jumping between steel coordinate markers." },
  { id: "tech-neural", category: "Technology", name: "Neural Network", desc: "Synaptic coordinate nodes pulsing under active cognitive load." },

  // ==================== ATOMIC / SCIENCE ====================
  { id: "science-atom", category: "Science", name: "Atom Structure", desc: "Glowing nucleus surrounded by orbiting electron waves." },
  { id: "science-molecule", category: "Science", name: "Molecular Network", desc: "Faceted spheres linked by crystal covalent bond lines." },
  { id: "science-dna", category: "Science", name: "DNA Helix", desc: "Double helix genetic ladder spinning in a medical fluid overlay." },
  { id: "science-particles", category: "Science", name: "Quantum Particles", desc: "Subatomic coordinates colliding in a heavy water chamber." },
  { id: "science-electrons", category: "Science", name: "Floating Electrons", desc: "Negatively charged sparks orbiting slowly in vacuum tubes." },
  { id: "science-protons", category: "Science", name: "Proton Orbit", desc: "Vibrant high energy nucleus with orbiting crimson sparks." },
  { id: "science-core", category: "Science", name: "Energy Core", desc: "Cherenkov radiation creating glowing blue pools around uranium rods." },
  { id: "science-reactor", category: "Science", name: "Plasma Reactor", desc: "Superheated hydrogen plasma swirling in toroidal magnetic grids." },
  { id: "science-fusion", category: "Science", name: "Nuclear Fusion", desc: "Bursting deuterium ions releasing immense heat in gold arcs." },
  { id: "science-grid", category: "Science", name: "Scientific Grid", desc: "Mathematical plotting lines overlaid with vector physics equations." },
  { id: "science-accelerator", category: "Science", name: "Particle Accelerator", desc: "Infinite circular steel tunnel with electromagnet glow rings." },
  { id: "science-magnetic", category: "Science", name: "Magnetic Field", desc: "Dumbbell magnetic vectors curving from north to south poles." },
  { id: "science-explosion", category: "Science", name: "Atomic Explosion", desc: "Luminous cloud of high-energy plasma expanding outwards." },
  { id: "science-bonds", category: "Science", name: "Molecular Bonds", desc: "Carbon rings sharing orbital electrons in geometric paths." },
  { id: "science-hologram", category: "Science", name: "Scientific Hologram", desc: "Rotating molecular models floating above a projection pad." },

  // ==================== GEOMETRY ====================
  { id: "geom-hexagon", category: "Geometry", name: "Hexagon Mesh", desc: "Dark honeycomb wireframe pulsing with amber light nodes." },
  { id: "geom-triangle", category: "Geometry", name: "Triangle Network", desc: "Faceted triangulation grids shifting perspective dynamically." },
  { id: "geom-polygon", category: "Geometry", name: "Polygon Waves", desc: "Floating mathematical surfaces bending under topographic vectors." },
  { id: "geom-cubes", category: "Geometry", name: "Infinite Cubes", desc: "Overlapping obsidian cubes projecting silver isometric faces." },
  { id: "geom-diamond", category: "Geometry", name: "Diamond Grid", desc: "Symmetrical diamond lattice glistening under cold white stars." },
  { id: "geom-sphere", category: "Geometry", name: "Wireframe Sphere", desc: "Rotating latitude and longitude rings forming a wire sphere." },
  { id: "geom-squares", category: "Geometry", name: "Floating Squares", desc: "Concentric squares rotating out of sync in a matte black void." },
  { id: "geom-mountains", category: "Geometry", name: "Low Poly Mountains", desc: "Triangulated mountain peaks shaded with retro sunset pink." },
  { id: "geom-tunnel", category: "Geometry", name: "Geometric Tunnel", desc: "Zooming down nested square segments creating a deep recursion." },
  { id: "geom-crystals", category: "Geometry", name: "Crystal Structures", desc: "Staggered quartz crystals reflecting sharp neon borders." },
  { id: "geom-lines", category: "Geometry", name: "Abstract Lines", desc: "Random Bezier curves flowing smoothly through a dark void." },
  { id: "geom-3d-wire", category: "Geometry", name: "3D Wireframe", desc: "Moving geometric meshes simulating physical aerodynamic flow." },
  { id: "geom-cube-uni", category: "Geometry", name: "Cube Universe", desc: "Millions of microscopic particles forming giant pixel grids." },
  { id: "geom-digital", category: "Geometry", name: "Digital Geometry", desc: "Orthogonal lines and grid coordinates snapping to active centers." },
  { id: "geom-symmetry", category: "Geometry", name: "Symmetry Art", desc: "Symmetrical kaleidoscope vectors spinning slowly on center." },

  // ==================== SPACE ====================
  { id: "space-galaxy", category: "Space", name: "Galaxy Nebula", desc: "Swirling cosmic gas clouds lit by newborn star clusters." },
  { id: "space-milky-way", category: "Space", name: "Milky Way", desc: "Expansive star belt sweeping diagonally across dark space." },
  { id: "space-nebula", category: "Space", name: "Orion Nebula", desc: "Glowing red and violet stellar dust pillars." },
  { id: "space-black-hole", category: "Space", name: "Abyssal Gravity", desc: "Rays of light curving into a dark gravitational singularity." },
  { id: "space-supernova", category: "Space", name: "Supernova", desc: "Exploding star core venting brilliant gold and green shockwaves." },
  { id: "space-cluster", category: "Space", name: "Star Cluster", desc: "Dense gathering of brilliant blue stars twinkling in vacuum." },
  { id: "space-rings", category: "Space", name: "Planet Rings", desc: "Orbiting ice chunks casting long shadows across planetary clouds." },
  { id: "space-saturn", category: "Space", name: "Saturn View", desc: "The gorgeous golden gas giant framed by sharp ring profiles." },
  { id: "space-deep-space", category: "Space", name: "Deep Space", desc: "Distant galaxies twinkling like tiny diamonds in absolute black." },
  { id: "space-purple-neb", category: "Space", name: "Purple Nebula", desc: "Violet electromagnetic gas sweeps with deep crimson flares." },
  { id: "space-blue-gal", category: "Space", name: "Blue Galaxy", desc: "Swirling spiral arms of electric blue stars and dark dust." },
  { id: "space-clouds", category: "Space", name: "Cosmic Clouds", desc: "Opaque dark dust nebulae eclipsing bright background stars." },
  { id: "space-solar-sys", category: "Space", name: "Solar System", desc: "Orbits of rocky and gaseous planets around a blazing core." },
  { id: "space-meteor", category: "Space", name: "Meteor Shower", desc: "Luminous streaks of burning ice shooting across space grids." },
  { id: "space-aurora", category: "Space", name: "Cosmic Aurora", desc: "Solar wind charging magnetic fields to create shifting green curtains." },

  // ==================== CRICKET ====================
  { id: "cricket-stadium", category: "Cricket", name: "Empty Stadium", desc: "A pristine stadium pitch waiting silently under dark skies." },
  { id: "cricket-floodlights", category: "Cricket", name: "Floodlights", desc: "Four giant light towers beaming stark white rays through stadium haze." },
  { id: "cricket-nets", category: "Cricket", name: "Practice Nets", desc: "Green synthetic grass nets casting long wire grid shadows." },
  { id: "cricket-ground", category: "Cricket", name: "Training Ground", desc: "The circular boundary rope looking onto dark stands." },
  { id: "cricket-mark", category: "Cricket", name: "Bowling Mark", desc: "The bowler's white line on green turf reflecting heavy spikes." },
  { id: "cricket-ball", category: "Cricket", name: "Ball Close-up", desc: "Close perspective of raised white leather seams on a red cherry." },
  { id: "cricket-pitch", category: "Cricket", name: "Pitch Texture", desc: "Cracked clay with dry soil veins, perfect for wrist spinners." },
  { id: "cricket-crowd", category: "Cricket", name: "Stadium Crowd", desc: "Flashlights twinkling in dark crowded stands during a tight over." },
  { id: "cricket-sunset", category: "Cricket", name: "Sunset Stadium", desc: "Stark stadium canopy silhouetted by burning red twilight skies." },
  { id: "cricket-rain", category: "Cricket", name: "Rain Match", desc: "Glistening green grass reflecting stadium lights under heavy drizzle." },
  { id: "cricket-dust", category: "Cricket", name: "Dust Pitch", desc: "Dry dust exploding off the landing zone under high revolution spin." },
  { id: "cricket-spin-friendly", category: "Cricket", name: "Spin Friendly", desc: "Clay turf with visible rough patches left by fast bowler footmarks." },
  { id: "cricket-trophy", category: "Cricket", name: "Trophy Room", desc: "Golden championship cup standing inside a backlit dark cabinet." },
  { id: "cricket-championship", category: "Cricket", name: "Championship Ground", desc: "Confetti floating over the center pitch after a title defense." },
  { id: "cricket-night", category: "Cricket", name: "Night Practice", desc: "Dim yellow lights casting shadows of batting stumps in the rain." },

  // ==================== SHADOW MONARCH ====================
  { id: "monarch-army", category: "Shadow Monarch", name: "Shadow Army", desc: "Rows of glowing purple eyes and soldier silhouettes in dark mist." },
  { id: "monarch-portal", category: "Shadow Monarch", name: "Purple Portal", desc: "Dimensional crack in space venting concentric purple waves." },
  { id: "monarch-castle", category: "Shadow Monarch", name: "Monarch Castle", desc: "Gothic spire ruins standing under a violet lightning storm." },
  { id: "monarch-throne", category: "Shadow Monarch", name: "Dark Throne", desc: "Massive obsidian throne flanked by burning purple torches." },
  { id: "monarch-storm", category: "Shadow Monarch", name: "Mana Storm", desc: "Concentric rings of pure magical power crushing the screen." },
  { id: "monarch-gate", category: "Shadow Monarch", name: "Dungeon Gate", desc: "Ancient stone gate sealed by red magic script chains." },
  { id: "monarch-soldiers", category: "Shadow Monarch", name: "Shadow Soldiers", desc: "Swirling dark smoke taking the shape of armor clad knights." },
  { id: "monarch-rune-circle", category: "Shadow Monarch", name: "Rune Circle", desc: "Rotating runic symbols plotting arcane geometries on ground." },
  { id: "monarch-energy", category: "Shadow Monarch", name: "Purple Leylines", desc: "Cracked dark terrain with pulsing violet plasma streams." },
  { id: "monarch-flames", category: "Shadow Monarch", name: "Black Flames", desc: "Haunting black fire shadows licking up the side card walls." },
  { id: "monarch-weapons", category: "Shadow Monarch", name: "Floating Weapons", desc: "Hovering steel swords and spears glowing with dark auras." },
  { id: "monarch-dimension", category: "Shadow Monarch", name: "Shadow Dimension", desc: "A place of complete dark velvet where space vectors do not apply." },
  { id: "monarch-abyss", category: "Shadow Monarch", name: "Abyss Portal", desc: "Deep black well pulling purple cosmic particles downwards." },
  { id: "monarch-temple", category: "Shadow Monarch", name: "Ancient Temple", desc: "Massive stone pillars carved with active red sentinel eyes." },
  { id: "monarch-eclipse", category: "Shadow Monarch", name: "Eclipse World", desc: "The black sun crowned by a thin violet electromagnetic ring." },

  // ==================== FANTASY ====================
  { id: "fantasy-volcano", category: "Fantasy", name: "Volcano", desc: "Tectonic cracks bleeding glowing red orange lava pools." },
  { id: "fantasy-ice", category: "Fantasy", name: "Ice Kingdom", desc: "Towering crystal glaciers glowing under starry polar skies." },
  { id: "fantasy-fire-temple", category: "Fantasy", name: "Fire Temple", desc: "Lava stone ruins decorated with glowing flame brazier pots." },
  { id: "fantasy-sky-islands", category: "Fantasy", name: "Sky Islands", desc: "Floating islands with moss vines hanging over clouds." },
  { id: "fantasy-rocks", category: "Fantasy", name: "Floating Rocks", desc: "Magnetic basalt columns drifting slowly around center cards." },
  { id: "fantasy-dragon", category: "Fantasy", name: "Dragon Cave", desc: "Glistening mounds of golden treasure under deep crimson shadows." },
  { id: "fantasy-forest", category: "Fantasy", name: "Crystal Forest", desc: "Luminous glass trees projecting neon violet pollen spores." },
  { id: "fantasy-ruins", category: "Fantasy", name: "Ancient Ruins", desc: "Overgrown brick archways containing passive magical nodes." },
  { id: "fantasy-cave", category: "Fantasy", name: "Mystic Cave", desc: "Subterranean pools reflecting large glowing emerald geodes." },
  { id: "fantasy-mountain", category: "Fantasy", name: "Sacred Mountain", desc: "Vast snow peak silhouetted by floating celestial nebulae." },
  { id: "fantasy-dark-forest", category: "Fantasy", name: "Dark Forest", desc: "Twisted black trees with glowing yellow fireflies." },
  { id: "fantasy-lake", category: "Fantasy", name: "Frozen Lake", desc: "Cracked ice sheets reflecting pale silver moonlight arches." },
  { id: "fantasy-river", category: "Fantasy", name: "Lava River", desc: "Streaming neon red current lines carrying molten iron stones." },
  { id: "fantasy-desert", category: "Fantasy", name: "Desert Kingdom", desc: "Crescent dunes silhouetted by a massive yellow binary sun." },
  { id: "fantasy-valley", category: "Fantasy", name: "Thunder Valley", desc: "Canyons struck periodically by bright white electrical lightning." },

  // ==================== MINIMAL ====================
  { id: "minimal-matte-black", category: "Minimal", name: "Matte Black", desc: "Absolute black canvas with faint dark gray border outlines." },
  { id: "minimal-carbon", category: "Minimal", name: "Carbon Texture", desc: "Tactile micro-diagonal weave pattern, clean and modern." },
  { id: "minimal-gradient", category: "Minimal", name: "Gradient Flow", desc: "Ultra-soft indigo to slate color sweep, blending cleanly." },
  { id: "minimal-glass", category: "Minimal", name: "Glassmorphism", desc: "Deep transparent gray plates showing dynamic light refraction." },
  { id: "minimal-dark-blur", category: "Minimal", name: "Dark Blur", desc: "Out of focus purple and cyan orbs hovering in black mist." },
  { id: "minimal-soft-glow", category: "Minimal", name: "Soft Glow", desc: "Subtle ambient border lights illuminating outer card frames." },
  { id: "minimal-noise", category: "Minimal", name: "Noise Texture", desc: "Sophisticated analog film grain layer, highly tactile." },
  { id: "minimal-fabric", category: "Minimal", name: "Fabric Texture", desc: "Cozy dark felt mesh grid with fine weave detail." },
  { id: "minimal-metal", category: "Minimal", name: "Metal Finish", desc: "Brushed dark aluminum surface with faint horizontal grain." },
  { id: "minimal-clean", category: "Minimal", name: "Clean Dark", desc: "Flat charcoal plates without distracting elements." },
  { id: "minimal-frosted", category: "Minimal", name: "Frosted Glass", desc: "Thick blur lenses softening back ground coordinates." },
  { id: "minimal-border", category: "Minimal", name: "Neon Border", desc: "Absolute black with single pixel neon tracking outline grids." },
  { id: "minimal-curves", category: "Minimal", name: "Abstract Curves", desc: "Slow waving topological paths in soft shades of grey." },
  { id: "minimal-liquid", category: "Minimal", name: "Liquid Flow", desc: "Amorphous mercury shapes shifting smoothly in slow motion." },
  { id: "minimal-waves", category: "Minimal", name: "Soft Waves", desc: "Gentle sand ripple contours shaded by dynamic ambient lights." }
];

export interface CustomWallpaperItem {
  id: string;
  name: string;
  url: string; // base64 string or public URL
  blur: number;
  opacity: number;
  darknessOverlay: number;
  brightness: number;
}

export interface AppSettings {
  appearance: {
    uiScale: number;
    animationSpeed: number;
    glowIntensity: number;
    borderBrightness: number;
    transparency: number;
    cardRoundness: number;
    compactMode: boolean;
    comfortableMode: boolean;
  };
  colorTheme: string; // Theme Preset ID or "custom"
  customTheme: ThemePreset | null;
  savedCustomThemes: ThemePreset[];
  
  // Custom uploaded wallpapers database
  customWallpapers?: CustomWallpaperItem[];
  activeCustomWallpaperId?: string | null;
  randomWallpaperMode?: "off" | "launch" | "day" | "week" | "rank" | "level";
  favoriteThemes?: string[];
  favoriteBackgrounds?: string[];

  background: {
    selectedId: string;
    blur: number;
    brightness: number;
    darknessOverlay: number;
    motionEnabled: boolean;
    particlesEnabled: boolean;
    opacity: number;
  };
  particles: {
    floating: boolean;
    energySparks: boolean;
    fireflies: boolean;
    purpleOrbs: boolean;
    magicDust: boolean;
    lightningSparks: boolean;
    stars: boolean;
    snow: boolean;
    leaves: boolean;
    rain: boolean;
    fog: boolean;
    smoke: boolean;
    xp: boolean;
    // Massive new effects expansion
    lightRays?: boolean;
    energyWaves?: boolean;
    movingLines?: boolean;
    digitalRain?: boolean;
    dust?: boolean;
  };
  uiEffects: {
    glowAnimations: boolean;
    pulseEffects: boolean;
    hoverLighting: boolean;
    cardShine: boolean;
    gradientBorders: boolean;
    animatedProgressBars: boolean;
    animatedButtons: boolean;
    energyWaves: boolean;
    menuOpenEffects: boolean;
    screenTransitions: boolean;
  };
  sound: {
    master: number;
    music: number;
    buttons: number;
    questComplete: number;
    rankUp: number;
    levelUp: number;
    xpGain: number;
    warning: number;
    dungeonStart: number;
    pressureAlarm: number;
    evolutionSuccess: number;
  };
  notifications: {
    questCompleted: boolean;
    dailyQuest: boolean;
    weeklyQuest: boolean;
    rankAvailable: boolean;
    skillReady: boolean;
    evolutionReady: boolean;
    masteryLevelUp: boolean;
    cloudSync: boolean;
    matchReminder: boolean;
  };
  gameplay: {
    difficultyIndicator: boolean;
    damageNumbers: boolean;
    xpPopups: boolean;
    autoSave: boolean;
    cloudSync: boolean;
    performanceMode: boolean;
    batterySaver: boolean;
    fpsCounter: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  appearance: {
    uiScale: 1.0,
    animationSpeed: 1.0,
    glowIntensity: 1.0,
    borderBrightness: 1.0,
    transparency: 0.98,
    cardRoundness: 16,
    compactMode: false,
    comfortableMode: false
  },
  colorTheme: "shadow-monarch",
  customTheme: null,
  savedCustomThemes: [],
  customWallpapers: [],
  activeCustomWallpaperId: null,
  randomWallpaperMode: "off",
  favoriteThemes: [],
  favoriteBackgrounds: [],
  background: {
    selectedId: "cyber-digital-grid",
    blur: 0,
    brightness: 100,
    darknessOverlay: 15,
    motionEnabled: true,
    particlesEnabled: true,
    opacity: 100
  },
  particles: {
    floating: true,
    energySparks: false,
    fireflies: false,
    purpleOrbs: true,
    magicDust: false,
    lightningSparks: false,
    stars: true,
    snow: false,
    leaves: false,
    rain: false,
    fog: false,
    smoke: false,
    xp: false,
    lightRays: false,
    energyWaves: false,
    movingLines: false,
    digitalRain: false,
    dust: false
  },
  uiEffects: {
    glowAnimations: true,
    pulseEffects: true,
    hoverLighting: true,
    cardShine: true,
    gradientBorders: true,
    animatedProgressBars: true,
    animatedButtons: true,
    energyWaves: false,
    menuOpenEffects: true,
    screenTransitions: true
  },
  sound: {
    master: 0.8,
    music: 0.4,
    buttons: 0.5,
    questComplete: 0.7,
    rankUp: 0.8,
    levelUp: 0.8,
    xpGain: 0.5,
    warning: 0.6,
    dungeonStart: 0.7,
    pressureAlarm: 0.7,
    evolutionSuccess: 0.8
  },
  notifications: {
    questCompleted: true,
    dailyQuest: true,
    weeklyQuest: true,
    rankAvailable: true,
    skillReady: true,
    evolutionReady: true,
    masteryLevelUp: true,
    cloudSync: true,
    matchReminder: true
  },
  gameplay: {
    difficultyIndicator: true,
    damageNumbers: true,
    xpPopups: true,
    autoSave: true,
    cloudSync: true,
    performanceMode: false,
    batterySaver: false,
    fpsCounter: false
  }
};

export class SettingsManager {
  private static STORAGE_KEY = "monarch_nexus_settings_v1";

  public static loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      // Merge with defaults to ensure any missing fields are filled
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed.appearance || {}) },
        background: { ...DEFAULT_SETTINGS.background, ...(parsed.background || {}) },
        particles: { ...DEFAULT_SETTINGS.particles, ...(parsed.particles || {}) },
        uiEffects: { ...DEFAULT_SETTINGS.uiEffects, ...(parsed.uiEffects || {}) },
        sound: { ...DEFAULT_SETTINGS.sound, ...(parsed.sound || {}) },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
        gameplay: { ...DEFAULT_SETTINGS.gameplay, ...(parsed.gameplay || {}) },
        customWallpapers: parsed.customWallpapers || [],
        activeCustomWallpaperId: parsed.activeCustomWallpaperId || null,
        randomWallpaperMode: parsed.randomWallpaperMode || "off",
        favoriteThemes: parsed.favoriteThemes || [],
        favoriteBackgrounds: parsed.favoriteBackgrounds || []
      };
    } catch (e) {
      console.error("Error loading settings:", e);
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }

  public static getTheme(settings: AppSettings): ThemePreset {
    if (settings.colorTheme === "custom" && settings.customTheme) {
      return settings.customTheme;
    }
    const preset = BUILT_IN_THEMES.find(t => t.id === settings.colorTheme);
    return preset || BUILT_IN_THEMES[0];
  }

  public static hexToRgb(hex: string): string {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "123, 47, 255";
  }

  public static getDatabaseStatistics(): {
    databaseSizeKb: number;
    questCount: number;
    pressureCount: number;
    storageUsedBytes: number;
  } {
    let sizeBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || "";
          sizeBytes += key.length + val.length;
        }
      }
    } catch (e) {}

    // Roughly estimate number of items
    const questsRaw = localStorage.getItem("monarch_quests_v10") || "[]";
    let questCount = 1120; // default built in library size
    try {
      const q = JSON.parse(questsRaw);
      if (Array.isArray(q)) {
        questCount += q.length;
      }
    } catch (e) {}

    return {
      databaseSizeKb: Math.round((sizeBytes / 1024) * 10) / 10 || 12.4,
      questCount,
      pressureCount: 32, // expanded pressure scenarios
      storageUsedBytes: sizeBytes || 12400
    };
  }
}
