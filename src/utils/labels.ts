import type { Rank, Role, Tier } from "@/types/riot";

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

export function formatRank({ tier, division, lp }: Rank): string {
  const name = division ? `${formatTier(tier)} ${division}` : formatTier(tier);
  return `${name} · ${lp} LP`;
}

/** CSS color of a tier, from the --tier-* tokens in variables.css */
export function tierColor(tier: Tier): string {
  return `var(--tier-${tier.toLowerCase()})`;
}