import type { ChampionClass } from "@/types/staticData";
import type { DurationBucket, Matchup } from "@/types/champion";
import { SKILL_SLOTS } from "@/utils/skills";

// ---------- Labels ----------

const CLASS_LABELS: Record<ChampionClass, string> = {
  Assassin: "Assassin",
  Fighter: "Combattant",
  Mage: "Mage",
  Marksman: "Tireur",
  Support: "Support",
  Tank: "Tank",
};

export const formatClasses = (tags: ChampionClass[]) => tags.map((tag) => CLASS_LABELS[tag] ?? tag).join(" / ");

export const formatDurationBucket = ({ from, to }: Pick<DurationBucket, "from" | "to">) => (to === null ? `${from} min +` : `${from}–${to} min`);

// ---------- Matchups ----------

export type Reliability = "high" | "medium" | "low";

export function reliability(games: number): Reliability {
  if (games >= 1000) return "high";
  if (games >= 300) return "medium";
  return "low";
}

export const RELIABILITY_LABELS: Record<Reliability, string> = { high: "Élevée", medium: "Moyenne", low: "Faible" };

export function matchupSections(matchups: Matchup[], size = 3, minGames = 100) {
  const reliable = matchups.filter((matchup) => matchup.games >= minGames);
  const byWinrate = [...reliable].sort((a, b) => b.winrate - a.winrate);
  return {
    mostPlayed: [...matchups].sort((a, b) => b.games - a.games).slice(0, size),
    favorable: byWinrate.slice(0, size),
    difficult: byWinrate.slice(-size).reverse(),
  };
}

// ---------- Skills ----------

export function skillLevels(order: number[]): number[][] {
  return SKILL_SLOTS.map((skill) => order.flatMap((slot, level) => (slot === skill ? [level + 1] : [])));
}

// ---------- Numbers ----------

export function winrateGap(winrate: number, maxGap = 0.06): number {
  return Math.max(-1, Math.min(1, (winrate - 0.5) / maxGap));
}

const cooldownFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function formatCooldowns(cooldowns: number[]): string {
  if (cooldowns.length === 0 || cooldowns.every((cooldown) => cooldown === 0)) return "";
  const values = cooldowns.every((cooldown) => cooldown === cooldowns[0]) ? cooldowns.slice(0, 1) : cooldowns;
  return `${values.map((value) => cooldownFormat.format(value)).join(" / ")} s`;
}

const laneDiffFormats = [0, 1].map((digits) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }));

export function formatLaneDiff(value: number, digits: 0 | 1 = 0): string {
  const text = laneDiffFormats[digits]!.format(Math.abs(value));
  if (text === "0") return "0";
  return `${value > 0 ? "+" : "−"}${text}`;
}
