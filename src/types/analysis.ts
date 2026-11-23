import type { Role, Tier } from "./riot";
import type { TimelineEvent } from "./timeline";

export type PerformanceAxis = "combat" | "economy" | "visionObjectives";

export type ComparedStat =
  | "kda"
  | "killParticipation"
  | "damagePerMinute"
  | "teamDamagePercentage"
  | "deaths"
  | "csPerMinute"
  | "goldPerMinute"
  | "csAt10"
  | "goldAt15"
  | "visionScorePerMinute"
  | "controlWardsPlaced"
  | "wardsKilled"
  | "objectiveDamagePerMinute"
  | "turretTakedowns";

export interface StatComparison {
  key: ComparedStat;
  axis: PerformanceAxis;
  value: number;
  average: number;
  score: number;
  lowerIsBetter?: true;
}

export interface PlayerAnalysis {
  puuid: string;
  score: number;
  rank: number;
  badge: "MVP" | "ACE" | null;
  axes: Record<PerformanceAxis, number>;
  reference: { championId: number; role: Role; tier: Tier | null; games: number };
  stats: StatComparison[];
}

export interface KeyMoment {
  time: number;
  before: number;
  after: number;
  events: TimelineEvent[];
}

export interface MatchAnalysis {
  matchId: string;
  frameTimes: number[];
  winProbability: number[];
  keyMoments: KeyMoment[];
  players: PlayerAnalysis[];
}
