export interface TitleMilestone {
  minLevel: number;
  title: string;
  colorClass: string;
}

export const SKILL_TITLE_MILESTONES: TitleMilestone[] = [
  { minLevel: 200, title: "Perfected Mastery", colorClass: "text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/15 shadow-[0_0_10px_rgba(212,175,55,0.3)] animate-pulse" },
  { minLevel: 190, title: "Transcendent Skill", colorClass: "text-[#E6E6FA] border-[#E6E6FA]/40 bg-[#E6E6FA]/10" },
  { minLevel: 175, title: "King of Mastery", colorClass: "text-[#FF4500] border-[#FF4500]/40 bg-[#FF4500]/10" },
  { minLevel: 150, title: "Lord of Execution", colorClass: "text-[#FF8C00] border-[#FF8C00]/40 bg-[#FF8C00]/10" },
  { minLevel: 125, title: "Phantom Artisan", colorClass: "text-[#DA70D6] border-[#DA70D6]/40 bg-[#DA70D6]/10" },
  { minLevel: 100, title: "Arcane Specialist", colorClass: "text-[#7B2FFF] border-[#7B2FFF]/40 bg-[#7B2FFF]/10 shadow-[0_0_8px_rgba(123,47,255,0.25)]" },
  { minLevel: 75, title: "Elite Executor", colorClass: "text-[#00D9FF] border-[#00D9FF]/40 bg-[#00D9FF]/10 shadow-[0_0_8px_rgba(0,217,255,0.2)]" },
  { minLevel: 50, title: "Skilled Practitioner", colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-950/15" },
  { minLevel: 25, title: "Novice Manipulator", colorClass: "text-blue-400 border-blue-500/20 bg-blue-950/10" },
  { minLevel: 10, title: "Awakened Skill", colorClass: "text-amber-400 border-amber-500/20 bg-amber-950/10" },
  { minLevel: 1, title: "Unawakened Skill", colorClass: "text-gray-500 border-gray-800 bg-gray-900/40" },
];

export function getSkillTitle(level: number): string {
  const milestone = SKILL_TITLE_MILESTONES.find(m => level >= m.minLevel);
  return milestone ? milestone.title : "Unawakened Skill";
}

export function getSkillTitleDetails(level: number): TitleMilestone {
  const milestone = SKILL_TITLE_MILESTONES.find(m => level >= m.minLevel);
  return milestone || SKILL_TITLE_MILESTONES[SKILL_TITLE_MILESTONES.length - 1];
}
