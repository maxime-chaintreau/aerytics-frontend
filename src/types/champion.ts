import type { MetaTier } from "./meta";
import type { RunePage } from "./match";
import type { Role } from "./riot";
import type { SkillSlot } from "./timeline";

export type StatsTier = "EMERALD" | "DIAMOND" | "MASTER";

export interface OptionStats {
  pickRate: number;
  games: number;
  winrate: number;
}

// ---------- List ----------

export interface ChampionListEntry {
  championId: number;
  mainRole: Role;
  roles: Role[];
  tier: MetaTier;
  winrate: number;
  pickRate: number;
  banRate: number;
}

export interface ChampionList {
  patch: string;
  tier: StatsTier | null;
  champions: ChampionListEntry[];
}

// ---------- One champion ----------

export interface ChampionSummary {
  winrate: number;
  pickRate: number;
  banRate: number;
  games: number;
  tier: MetaTier;
  rank: number;
  rankOf: number;
}

export interface Matchup {
  championId: number;
  games: number;
  winrate: number;
  goldDiff15: number;
  xpDiff15: number;
  csDiff15: number;
  firstBloodRate: number;
}

export interface Synergy {
  championId: number;
  role: Role;
  games: number;
  winrate: number;
}

export interface DurationBucket {
  from: number;
  to: number | null;
  winrate: number;
  share: number;
}

export type PatchVerdict = "buff" | "nerf" | "adjust";

export interface PatchNote {
  target: "champion" | "item" | "rune";
  id: number;
  verdict: PatchVerdict;
  text: string;
}

export interface ChampionStats {
  championId: number;
  role: Role;
  tier: StatsTier | null;
  patch: string;
  roles: { role: Role; share: number }[];
  summary: ChampionSummary;
  builds: (OptionStats & { items: number[] })[];
  situationalItems: (OptionStats & { itemId: number })[];
  boots: (OptionStats & { itemId: number })[];
  startingItems: (OptionStats & { items: number[] })[];
  runes: (OptionStats & { page: RunePage })[];
  summonerSpells: (OptionStats & { spells: [number, number] })[];
  skillOrders: (OptionStats & { order: SkillSlot[]; priority: SkillSlot[] })[];
  matchups: Matchup[];
  synergies: Synergy[];
  byDuration: DurationBucket[];
  patchNotes: PatchNote[];
}
