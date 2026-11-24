import type { Ladder, PlayerCard } from "@/types/search";
import type { Region } from "@/types/riot";
import { getJson } from "./http";

export const searchService = {
  searchPlayers(query: string, region: Region | null, signal?: AbortSignal): Promise<PlayerCard[]> {
    const params = new URLSearchParams({ q: query });
    if (region) params.set("region", region);
    return getJson(`/summoners/search?${params}`, signal);
  },

  getLadder(region: Region, signal?: AbortSignal): Promise<Ladder> {
    return getJson(`/ladder/${region}`, signal);
  },
};
