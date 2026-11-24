import type { ComparedStat, KeyMoment, PerformanceAxis, PlayerAnalysis } from "@/types/analysis";
import type { TeamSide } from "@/types/match";
import { formatDecimal, formatInteger, formatPercent } from "@/utils/format";

export const COMPARED_STATS: Record<ComparedStat, { label: string; format: "integer" | "decimal1" | "decimal2" | "percent" }> = {
  kda: { label: "KDA", format: "decimal2" },
  killParticipation: { label: "Participation aux kills", format: "percent" },
  damagePerMinute: { label: "Dégâts / min", format: "integer" },
  teamDamagePercentage: { label: "Part des dégâts", format: "percent" },
  deaths: { label: "Morts", format: "decimal1" },
  csPerMinute: { label: "CS / min", format: "decimal1" },
  goldPerMinute: { label: "Or / min", format: "integer" },
  csAt10: { label: "CS à 10 min", format: "integer" },
  goldAt15: { label: "Or à 15 min", format: "integer" },
  visionScorePerMinute: { label: "Vision / min", format: "decimal2" },
  controlWardsPlaced: { label: "Balises de contrôle", format: "decimal1" },
  wardsKilled: { label: "Balises détruites", format: "decimal1" },
  objectiveDamagePerMinute: { label: "Dégâts aux objectifs / min", format: "integer" },
  turretTakedowns: { label: "Tours participées", format: "decimal1" },
};

export const AXES: { axis: PerformanceAxis; label: string }[] = [
  { axis: "combat", label: "Combat" },
  { axis: "economy", label: "Économie" },
  { axis: "visionObjectives", label: "Vision & objectifs" },
];

export function formatCompared(key: ComparedStat, value: number): string {
  switch (COMPARED_STATS[key].format) {
    case "integer":
      return formatInteger(Math.round(value));
    case "decimal1":
      return formatDecimal(value, 1);
    case "decimal2":
      return formatDecimal(value, 2);
    case "percent":
      return formatPercent(value);
  }
}

export type ScoreTone = "great" | "good" | "average" | "poor";

export function scoreTone(score: number): ScoreTone {
  if (score >= 70) return "great";
  if (score >= 58) return "good";
  if (score >= 42) return "average";
  return "poor";
}

export function formatPlace(rank: number): string {
  return rank === 1 ? "1er" : `${rank}e`;
}

export function momentSwing(moment: KeyMoment): { side: TeamSide; points: number } {
  const swing = moment.after - moment.before;
  return { side: swing >= 0 ? "BLUE" : "RED", points: Math.round(Math.abs(swing) * 100) };
}

export const chanceOf = (blueChance: number, side: TeamSide) => (side === "BLUE" ? blueChance : 1 - blueChance);

export function analysisOf(players: PlayerAnalysis[] | undefined, puuid: string): PlayerAnalysis | undefined {
  return players?.find((player) => player.puuid === puuid);
}
