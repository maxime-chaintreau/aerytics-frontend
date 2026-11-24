import type { Role, Tier } from "./riot";

export type MetaTier = "S+" | "S" | "A" | "B" | "C";

export interface MetaChampion {
  championId: number;
  tier: MetaTier;
  winrate: number; // 0 to 1
  pickRate: number; // 0 to 1
}

export interface RoleMeta {
  patch: string; // "26.20"
  role: Role;
  minTier: Tier | null; // stats from this tier and above, null = every tier
  champions: MetaChampion[]; // best first
}