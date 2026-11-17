import { toValue, type MaybeRefOrGetter } from "vue";
import { useQuery, type EntryKey } from "@pinia/colada";
import type { PlayerKey } from "@/types/riot";
import { summonerService } from "@/services/summonerService";
import { toRiotIdSlug } from "@/utils/riotId";

export const profileKeys = {
  all: ["profile"] as const,
  player: ({ region, riotId }: PlayerKey) => [...profileKeys.all, region, toRiotIdSlug(riotId).toLowerCase()] as const,
  summary: (player: PlayerKey) => [...profileKeys.player(player), "summary"] as const,
  championPool: (player: PlayerKey) => [...profileKeys.player(player), "champion-pool"] as const,
  matches: (player: PlayerKey) => [...profileKeys.player(player), "matches"] as const,
};

/** Player in the url */
type PlayerSource = MaybeRefOrGetter<PlayerKey | null>;

/** Template for the state storage */
function usePlayerQuery<T>(player: PlayerSource, keyOf: (player: PlayerKey) => EntryKey, fetcher: (player: PlayerKey, signal: AbortSignal) => Promise<T>) {
  return useQuery({
    key: () => {
      const value = toValue(player);
      return value ? keyOf(value) : [...profileKeys.all, "none"];
    },
    query: ({ signal }) => {
      const value = toValue(player);
      // cannot happen 'enabled' is false when there is no player
      if (!value) throw new Error("Profile query ran without a player");
      return fetcher(value, signal);
    },
    enabled: () => toValue(player) !== null,
  });
}

export function useProfileSummary(player: PlayerSource) {
  return usePlayerQuery(player, profileKeys.summary, ({ region, riotId }, signal) => summonerService.getProfile(region, riotId, signal));
}

export function useChampionPool(player: PlayerSource) {
  return usePlayerQuery(player, profileKeys.championPool, ({ region, riotId }, signal) => summonerService.getChampionPool(region, riotId, signal));
}

export function usePlayerMatches(player: PlayerSource) {
  return usePlayerQuery(player, profileKeys.matches, ({ region, riotId }, signal) => summonerService.getMatches(region, riotId, {}, signal));
}
