import { toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@pinia/colada";
import type { StatsTier } from "@/types/champion";
import type { Role } from "@/types/riot";
import { championService } from "@/services/championService";
import { staticDataService } from "@/services/staticDataService";
import { useStaticDataStore } from "@/stores/staticData";

const ONE_HOUR = 60 * 60_000;

const championKeys = {
  all: ["champions"] as const,
  list: (tier: StatsTier | null) => [...championKeys.all, "list", tier ?? "ALL"] as const,
  stats: (championId: number, role: Role | null, tier: StatsTier | null) => [...championKeys.all, championId, role ?? "MAIN", tier ?? "ALL"] as const,
  details: (version: string, championId: number) => [...championKeys.all, championId, "details", version] as const,
};

export function useChampionList(tier: MaybeRefOrGetter<StatsTier | null>) {
  return useQuery({
    key: () => championKeys.list(toValue(tier)),
    query: ({ signal }) => championService.getChampions(toValue(tier), signal),
    staleTime: ONE_HOUR,
  });
}

export function useChampionStats(championId: MaybeRefOrGetter<number | null>, role: MaybeRefOrGetter<Role | null>, tier: MaybeRefOrGetter<StatsTier | null>) {
  return useQuery({
    key: () => {
      const id = toValue(championId);
      return id === null ? [...championKeys.all, "none"] : championKeys.stats(id, toValue(role), toValue(tier));
    },
    query: ({ signal }) => {
      const id = toValue(championId);
      if (id === null) throw new Error("Champion query ran without a champion");
      return championService.getChampionStats(id, toValue(role), toValue(tier), signal);
    },
    enabled: () => toValue(championId) !== null,
    staleTime: ONE_HOUR,
    placeholderData: (previous, entry) => (previous && entry?.key[1] === toValue(championId) ? previous : undefined),
  });
}

export function useChampionDetails(championId: MaybeRefOrGetter<number | null>) {
  const staticData = useStaticDataStore();
  return useQuery({
    key: () => {
      const id = toValue(championId);
      return id === null || !staticData.version ? [...championKeys.all, "none", "details"] : championKeys.details(staticData.version, id);
    },
    query: ({ signal }) => staticDataService.getChampionDetails(staticData.version!, toValue(championId)!, signal),
    enabled: () => toValue(championId) !== null && staticData.version !== null,
    staleTime: Infinity,
  });
}
