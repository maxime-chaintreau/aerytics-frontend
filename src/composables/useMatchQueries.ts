import { toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@pinia/colada";
import type { PlayerKey } from "@/types/riot";
import { summonerService } from "@/services/summonerService";
import { toRiotIdSlug } from "@/utils/riotId";

export const matchKeys = {
  all: ["match"] as const,
  detail: (player: PlayerKey, matchId: string) => [...matchKeys.all, matchId, player.region, toRiotIdSlug(player.riotId).toLowerCase()] as const,
};

export function useMatchDetail(player: MaybeRefOrGetter<PlayerKey | null>, matchId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    key: () => {
      const value = toValue(player);
      const id = toValue(matchId);
      return value && id ? matchKeys.detail(value, id) : [...matchKeys.all, "none"];
    },
    query: ({ signal }) => {
      const value = toValue(player);
      const id = toValue(matchId);
      if (!value || !id) throw new Error("Match query ran without a player or a match id");
      return summonerService.getMatch(value.region, value.riotId, id, signal);
    },
    enabled: () => toValue(player) !== null && toValue(matchId) !== null,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}
