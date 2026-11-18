import { TIERS, type Rank } from "@/types/riot";
import type { BenchmarkMetric, LpHistoryPoint, MatchSummary } from "@/types/profile";
import { formatDecimal, formatPercent } from "@/utils/format";

const LP_PER_DIVISION = 100;
const LP_PER_TIER = 4 * LP_PER_DIVISION;
const DIVISION_INDEX = { IV: 0, III: 1, II: 2, I: 3 } as const;
const MASTER_INDEX = TIERS.indexOf("MASTER");

/** Turns a rank into one number that only goes up when the player climbs */
export function rankScore({ tier, division, lp }: Rank): number {
  const tierIndex = TIERS.indexOf(tier);
  if (tierIndex >= MASTER_INDEX || !division) return MASTER_INDEX * LP_PER_TIER + lp;
  return tierIndex * LP_PER_TIER + DIVISION_INDEX[division] * LP_PER_DIVISION + lp;
}

/** LP won (or lost) over all the bars. */
export function lpDelta(points: LpHistoryPoint[]): number {
  return points.reduce((total, point) => total + point.lpChange, 0);
}

/** Bar heights between FLOOR and 1: the lowest day is still visible, the highest fills the chart. */
export function lpChartHeights(points: { rank: Rank }[]): number[] {
  const FLOOR = 0.15;
  const scores = points.map((point) => rankScore(point.rank));
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  if (max === min) return scores.map(() => 1);
  return scores.map((score) => FLOOR + ((score - min) / (max - min)) * (1 - FLOOR));
}

/** The last day the player reached a higher TIER (not just a division), or null. */
export function lastPromotion<T extends { rank: Rank }>(points: T[]): T | null {
  for (let i = points.length - 1; i > 0; i--) {
    const current = points[i]!;
    const previous = points[i - 1]!;
    if (current.rank.tier !== previous.rank.tier && rankScore(current.rank) > rankScore(previous.rank)) {
      return current;
    }
  }
  return null;
}

// ---------- Champion pool ----------

export type ChampionSortKey = "games" | "winrate" | "kda" | "csPerMin";
export type SortDirection = "asc" | "desc";

/** Returns a NEW sorted array (the original stays untouched). Ties: most games first. */
export function sortChampionPool<T extends Record<ChampionSortKey, number>>(entries: T[], key: ChampionSortKey, direction: SortDirection): T[] {
  const sign = direction === "desc" ? -1 : 1;
  return [...entries].sort((a, b) => sign * (a[key] - b[key]) || b.games - a.games);
}

export type WinrateTone = "positive" | "negative" | "neutral";

/** ≥ 55 % green, ≤ 45 % red, in between neutral */
export function winrateTone(winrate: number): WinrateTone {
  if (winrate >= 0.55) return "positive";
  if (winrate <= 0.45) return "negative";
  return "neutral";
}

// ---------- You vs the average ----------

export interface MetricDefinition {
  label: string;
  higherIsBetter: boolean;
  format: (value: number) => string;
}

export const BENCHMARK_METRICS: Record<BenchmarkMetric, MetricDefinition> = {
  csPerMin: { label: "CS / min", higherIsBetter: true, format: (value) => formatDecimal(value) },
  visionPerMin: { label: "Vision / min", higherIsBetter: true, format: (value) => formatDecimal(value) },
  damagePerMin: { label: "Dégâts / min", higherIsBetter: true, format: (value) => formatDecimal(value, 0) },
  deathsPerGame: { label: "Morts / partie", higherIsBetter: false, format: (value) => formatDecimal(value) },
  killParticipation: { label: "Participation aux kills", higherIsBetter: true, format: formatPercent },
};

export type Comparison = "better" | "worse" | "equal";

/** a gap under 3 % of the average is noise */
const EQUAL_TOLERANCE = 0.03;

/** Better or worse than the average, depending on the metric's direction */
export function compareToAverage(metric: BenchmarkMetric, value: number, average: number): Comparison {
  if (Math.abs(value - average) <= Math.abs(average) * EQUAL_TOLERANCE) return "equal";
  const isHigher = value > average;
  return isHigher === BENCHMARK_METRICS[metric].higherIsBetter ? "better" : "worse";
}

// ---------- Matches ----------

/** (kills + assists) / deaths. 0 deaths counts as 1, like in the game ("perfect KDA" stays a number). */
export function matchKda({ kills, deaths, assists }: Pick<MatchSummary, "kills" | "deaths" | "assists">): number {
  return (kills + assists) / Math.max(deaths, 1);
}

export function csPerMinute({ cs, durationSeconds }: Pick<MatchSummary, "cs" | "durationSeconds">): number {
  return durationSeconds > 0 ? cs / (durationSeconds / 60) : 0;
}
