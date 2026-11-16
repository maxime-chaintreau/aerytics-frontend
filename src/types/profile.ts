import type { MatchResult, Rank, Region, RiotId, Role } from "./riot";

// ---------- Header + headline stats ----------

export interface ProfileSummary {
  puuid: string;
  region: Region;
  riotId: RiotId;
  profileIconId: number;
  mainRole: Role;
  mainChampionId: number;
  rankedGames: number;
  rank: Rank | null; // null = unranked
  streak: { result: "WIN" | "LOSS"; count: number } | null;
  stats: {
    winrate: number; // 0 to 1
    kda: number;
    csPerMin: number;
    visionPerMin: number;
  };
  lpHistory: LpHistoryPoint[];
  benchmark: Benchmark;
}

// ---------- LP history (chart) ----------

export interface LpHistoryPoint {
  date: string; // ISO date, one point per day
  rank: Rank;
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
  games: number;
  winrate: number; // 0 to 1
  kda: number;
  csPerMin: number;
}

// ---------- Recent matches ----------

export interface MatchSummary {
  matchId: string;
  result: MatchResult;
  lpChange: number | null; // null outside ranked
  championId: number;
  opponentChampionId: number | null; // null if no direct opponent found
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  items: number[]; // 6 slots + trinket, 0 = empty slot
  durationSeconds: number;
  playedAt: string; // ISO date of the game start
}

export interface MatchPage {
  matches: MatchSummary[];
  nextStart: number | null; // to load the next page, null = no more matches
}
