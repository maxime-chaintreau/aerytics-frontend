import type { ChampionList, ChampionStats, StatsTier } from "@/types/champion";
import type { Role } from "@/types/riot";
import { getJson } from "./http";

export const championService = {
  getChampions(tier: StatsTier | null, signal?: AbortSignal): Promise<ChampionList> {
    const params = new URLSearchParams();
    if (tier) params.set("tier", tier);
    return getJson(`/champions${params.size > 0 ? `?${params}` : ""}`, signal);
  },

  getChampionStats(championId: number, role: Role | null, tier: StatsTier | null, signal?: AbortSignal): Promise<ChampionStats> {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (tier) params.set("tier", tier);
    return getJson(`/champions/${championId}${params.size > 0 ? `?${params}` : ""}`, signal);
  },
};
