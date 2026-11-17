import type { ChampionPoolEntry, MatchPage, ProfileSummary } from "@/types/profile";
import type { Region, RiotId } from "@/types/riot";
import { toRiotIdSlug } from "@/utils/riotId";
import { getJson } from "./http";

const playerPath = (region: Region, riotId: RiotId) => `/summoners/${region}/${encodeURIComponent(toRiotIdSlug(riotId))}`;

export const summonerService = {
  getProfile(region: Region, riotId: RiotId, signal?: AbortSignal): Promise<ProfileSummary> {
    return getJson(playerPath(region, riotId), signal);
  },

  getChampionPool(region: Region, riotId: RiotId, signal?: AbortSignal): Promise<ChampionPoolEntry[]> {
    return getJson(`${playerPath(region, riotId)}/champions`, signal);
  },

  getMatches(region: Region, riotId: RiotId, { start = 0, count = 10 }: { start?: number; count?: number } = {}, signal?: AbortSignal): Promise<MatchPage> {
    return getJson(`${playerPath(region, riotId)}/matches?start=${start}&count=${count}`, signal);
  },
};
