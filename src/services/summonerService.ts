import type { ChampionPoolEntry, LpHistory, LpInterval, MatchPage, ProfileSummary } from "@/types/profile";
import type { Region, RiotId, RoleFilter } from "@/types/riot";
import { toRiotIdSlug } from "@/utils/riotId";
import { getJson } from "./http";

const playerPath = (region: Region, riotId: RiotId) => `/summoners/${region}/${encodeURIComponent(toRiotIdSlug(riotId))}`;

export const summonerService = {
  /** role: one role, ALL, or MAIN (the API picks the player's main role) */
  getProfile(region: Region, riotId: RiotId, role: RoleFilter, signal?: AbortSignal): Promise<ProfileSummary> {
    return getJson(`${playerPath(region, riotId)}?role=${role}`, signal);
  },

  getChampionPool(region: Region, riotId: RiotId, role: RoleFilter, signal?: AbortSignal): Promise<ChampionPoolEntry[]> {
    return getJson(`${playerPath(region, riotId)}/champions?role=${role}`, signal);
  },

  getMatches(region: Region, riotId: RiotId, { role, start = 0, count = 10 }: { role: RoleFilter; start?: number; count?: number }, signal?: AbortSignal): Promise<MatchPage> {
    return getJson(`${playerPath(region, riotId)}/matches?role=${role}&start=${start}&count=${count}`, signal);
  },

  getLpHistory(region: Region, riotId: RiotId, interval: LpInterval, signal?: AbortSignal): Promise<LpHistory> {
    return getJson(`${playerPath(region, riotId)}/lp-history?interval=${interval}`, signal);
  },
};
