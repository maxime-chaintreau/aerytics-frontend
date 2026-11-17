export const REGIONS = ["euw", "eune", "na", "kr", "br", "jp", "lan", "las", "oce", "tr", "ru"] as const;
export type Region = (typeof REGIONS)[number];

export interface RiotId {
  gameName: string;
  tagLine: string;
}

export interface PlayerKey {
  region: Region;
  riotId: RiotId;
}

export const TIERS = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"] as const;
export type Tier = (typeof TIERS)[number];

export type Division = "I" | "II" | "III" | "IV";

export interface Rank {
  tier: Tier;
  division: Division | null; // null from Master upwards
  lp: number;
}

export type Role = "TOP" | "JUNGLE" | "MID" | "BOTTOM" | "SUPPORT";
export type MatchResult = "WIN" | "LOSS" | "REMAKE";
