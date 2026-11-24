import type { RouteLocationRaw } from "vue-router";
import type { StatsTier } from "@/types/champion";
import type { Region, RiotId, Role } from "@/types/riot";
import type { ChampionInfo } from "@/types/staticData";
import { toRiotIdSlug } from "@/utils/riotId";
import { ROLE_SLUGS } from "@/utils/roleSlugs";
import { championSlug } from "@/utils/champion";
import { tierToSlug } from "@/utils/statsTier";

interface PlayerLike {
  region: Region;
  riotId: RiotId;
}

export const profileRoute = ({ region, riotId }: PlayerLike) => ({ name: "profile", params: { region, riotId: toRiotIdSlug(riotId) } }) satisfies RouteLocationRaw;

export const matchRoute = ({ region, riotId }: PlayerLike, matchId: string) => ({ name: "match", params: { region, riotId: toRiotIdSlug(riotId), matchId } }) satisfies RouteLocationRaw;

export function championRoute(champion: Pick<ChampionInfo, "id">, context: { role?: Role | null; tier?: StatsTier | null } = {}) {
  const query: Record<string, string> = {};
  if (context.role) query.role = ROLE_SLUGS[context.role];
  if (context.tier !== undefined) {
    const slug = tierToSlug(context.tier);
    if (slug) query.tier = slug;
  }
  return { name: "champion", params: { champion: championSlug(champion) }, query } satisfies RouteLocationRaw;
}
