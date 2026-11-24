import type { StatsTier } from "@/types/champion";
import { TIERS, type Tier } from "@/types/riot";

export const DEFAULT_STATS_TIER: StatsTier = "EMERALD";

const TIER_SLUGS: Record<StatsTier | "ALL", string> = { ALL: "all", EMERALD: "emerald", DIAMOND: "diamond", MASTER: "master" };
const SLUG_TO_TIER = new Map(Object.entries(TIER_SLUGS).map(([tier, slug]) => [slug, tier as StatsTier | "ALL"]));

export function tierFromSlug(slug: unknown): StatsTier | null {
  const tier = typeof slug === "string" ? SLUG_TO_TIER.get(slug) : undefined;
  if (tier === undefined) return DEFAULT_STATS_TIER;
  return tier === "ALL" ? null : tier;
}

export function tierToSlug(tier: StatsTier | null): string | undefined {
  if (tier === DEFAULT_STATS_TIER) return undefined;
  return TIER_SLUGS[tier ?? "ALL"];
}

export const STATS_TIER_OPTIONS: { value: StatsTier | null; label: string }[] = [
  { value: null, label: "Tous rangs" },
  { value: "EMERALD", label: "Émeraude +" },
  { value: "DIAMOND", label: "Diamant +" },
  { value: "MASTER", label: "Maître +" },
];

export const statsTierLabel = (tier: StatsTier | null) => STATS_TIER_OPTIONS.find((option) => option.value === tier)!.label;

export function statsTierFor(tier: Tier | null): StatsTier | null {
  if (tier === null) return null;
  const index = TIERS.indexOf(tier);
  if (index >= TIERS.indexOf("MASTER")) return "MASTER";
  if (index >= TIERS.indexOf("DIAMOND")) return "DIAMOND";
  if (index >= TIERS.indexOf("EMERALD")) return "EMERALD";
  return null;
}
