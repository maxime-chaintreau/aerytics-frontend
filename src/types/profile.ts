import type { MatchResult, Rank, Region, RiotId, Role, RoleQuest } from "./riot";
import type { RunePage } from "./match";

// ---------- Header + headline stats ----------

export interface ProfileSummary {
  puuid: string;
  region: Region;
  riotId: RiotId;
  profileIconId: number;
  mainRole: Role;
  mainChampionId: number | null;
  rankedGames: number;
  rank: Rank | null; // null = unranked
  streak: { result: "WIN" | "LOSS"; count: number } | null;
  stats: {
    winrate: number; // 0 to 1
    kda: number;
    csPerMin: number;
    visionPerMin: number;
  } | null;
  benchmark: Benchmark;
}

// ---------- LP history (chart) ----------

export type LpInterval = "day" | "week" | "month";

export interface LpHistoryPoint {
  start: string; // ISO date of the first day of the period
  end: string;
  rank: Rank; // highest rank reached in the period
  lpChange: number; // LP won or lost over the period
}

export interface LpHistory {
  interval: LpInterval;
  points: LpHistoryPoint[];
}

// ---------- You vs the average ----------

export type BenchmarkMetric = "csPerMin" | "visionPerMin" | "damagePerMin" | "deathsPerGame" | "killParticipation";

export interface Benchmark {
  tier: Rank["tier"]; // compared to players of this tier...
  role: Role; // ...on this role
  values: { metric: BenchmarkMetric; value: number; average: number }[];
}

// ---------- Champion pool ----------

export interface ChampionPoolEntry {
  championId: number;
  role: Role;
  games: number;
  winrate: number; // 0 to 1
  kda: number;
  csPerMin: number;
}

// ---------- Recent matches ----------

export interface MatchSummary {
  matchId: string;
  role: Role;
  result: MatchResult;
  lpChange: number | null; // null outside ranked
  championId: number;
  opponentChampionId: number | null; // null if no direct opponent found
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  items: number[]; // 6 slots + trinket, 0 = empty slot
  roleQuest: RoleQuest | null;
  summonerSpells: [number, number];
  runes: RunePage;
  durationSeconds: number;
  playedAt: string; // ISO date of the game start
}

export interface MatchPage {
  matches: MatchSummary[];
  nextStart: number | null; // to load the next page, null = no more matches
}
