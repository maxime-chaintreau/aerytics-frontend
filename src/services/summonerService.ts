// The ONLY file that knows the profile API URLs.
import type { ChampionPoolEntry, MatchPage, ProfileSummary } from "@/types/profile";
import type { Region, RiotId } from "@/types/riot";
import { toRiotIdSlug } from "@/utils/riotId";
import { getJson } from "./http";

const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

const playerPath = (region: Region, riotId: RiotId) => `/summoners/${region}/${encodeURIComponent(toRiotIdSlug(riotId))}`;

export const summonerService = {
  async getProfile(region: Region, riotId: RiotId): Promise<ProfileSummary> {
    if (useMocks) return (await import("./mocks/summonerMocks")).getProfile(region, riotId);
    return getJson(playerPath(region, riotId));
  },

  async getChampionPool(region: Region, riotId: RiotId): Promise<ChampionPoolEntry[]> {
    if (useMocks) return (await import("./mocks/summonerMocks")).getChampionPool(region, riotId);
    return getJson(`${playerPath(region, riotId)}/champions`);
  },

  async getMatches(region: Region, riotId: RiotId, start = 0, count = 10): Promise<MatchPage> {
    if (useMocks) return (await import("./mocks/summonerMocks")).getMatches(region, riotId, start, count);
    return getJson(`${playerPath(region, riotId)}/matches?start=${start}&count=${count}`);
  },
};
