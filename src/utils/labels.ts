import type { Queue } from "@/types/match";
import type { MatchResult, Rank, Role, Tier, Region } from "@/types/riot";

const TIER_LABELS: Record<Tier, string> = {
  IRON: "Fer",
  BRONZE: "Bronze",
  SILVER: "Argent",
  GOLD: "Or",
  PLATINUM: "Platine",
  EMERALD: "Émeraude",
  DIAMOND: "Diamant",
  MASTER: "Maître",
  GRANDMASTER: "Grand Maître",
  CHALLENGER: "Challenger",
};

const ROLE_LABELS: Record<Role, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MID: "Mid",
  BOTTOM: "ADC",
  SUPPORT: "Support",
};

export function formatTier(tier: Tier): string {
  return TIER_LABELS[tier];
}

export function formatRole(role: Role): string {
  return ROLE_LABELS[role];
}

/** { EMERALD, II } -> "Émeraude II" ; Master+ has no division: "Maître" */
export function formatRankName({ tier, division }: Pick<Rank, "tier" | "division">): string {
  return division ? `${formatTier(tier)} ${division}` : formatTier(tier);
}

export function formatRank(rank: Rank): string {
  return `${formatRankName(rank)} · ${rank.lp} LP`;
}

/** CSS color of a tier, from the --tier-* tokens in variables.css */
export function tierColor(tier: Tier): string {
  return `var(--tier-${tier.toLowerCase()})`;
}

const RESULT_LABELS: Record<MatchResult, string> = {
  WIN: "Victoire",
  LOSS: "Défaite",
  REMAKE: "Remake",
};

export function formatResult(result: MatchResult): string {
  return RESULT_LABELS[result];
}

const QUEUE_LABELS: Record<Queue, string> = {
  RANKED_SOLO: "Classée solo/duo",
  RANKED_FLEX: "Classée flexible",
  NORMAL_DRAFT: "Normale",
};

export function formatQueue(queue: Queue): string {
  return QUEUE_LABELS[queue];
}

/** "euw" -> "EUW": regions are written in capitals everywhere in the game */
export function formatRegion(region: Region): string {
  return region.toUpperCase();
}
