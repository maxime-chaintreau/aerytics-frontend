import { toValue, type MaybeRefOrGetter } from "vue";
import { useInfiniteQuery, useQuery, type EntryKey } from "@pinia/colada";
import type { PlayerKey, RoleFilter } from "@/types/riot";
import type { LpInterval } from "@/types/profile";
import { summonerService } from "@/services/summonerService";
import { toRiotIdSlug } from "@/utils/riotId";

export const profileKeys = {
  all: ["profile"] as const,
  player: ({ region, riotId }: PlayerKey) => [...profileKeys.all, region, toRiotIdSlug(riotId).toLowerCase()] as const,
  summary: (player: PlayerKey, role: RoleFilter) => [...profileKeys.player(player), "summary", role] as const,
  championPool: (player: PlayerKey, role: RoleFilter) => [...profileKeys.player(player), "champion-pool", role] as const,
  matches: (player: PlayerKey, role: RoleFilter) => [...profileKeys.player(player), "matches", role] as const,
  lpHistory: (player: PlayerKey, interval: LpInterval) => [...profileKeys.player(player), "lp-history", interval] as const,
};

/** Player in the url */
type PlayerSource = MaybeRefOrGetter<PlayerKey | null>;

/** Role in the url */
type RoleSource = MaybeRefOrGetter<RoleFilter>;

/** Template for the state storage */
function usePlayerQuery<T>(player: PlayerSource, keyOf: (player: PlayerKey) => EntryKey, fetcher: (player: PlayerKey, signal: AbortSignal) => Promise<T>, { keepPrevious = false } = {}) {
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
    placeholderData: keepPrevious ? (previous, entry) => (isSamePlayer(player)(entry) ? previous : undefined) : undefined,
  });
}

export function useProfileSummary(player: PlayerSource, role: RoleSource) {
  return usePlayerQuery(
    player,
    (value) => profileKeys.summary(value, toValue(role)),
    ({ region, riotId }, signal) => summonerService.getProfile(region, riotId, toValue(role), signal),
    { keepPrevious: true },
  );
}

export function useChampionPool(player: PlayerSource, role: RoleSource) {
  return usePlayerQuery(
    player,
    (value) => profileKeys.championPool(value, toValue(role)),
    ({ region, riotId }, signal) => summonerService.getChampionPool(region, riotId, toValue(role), signal),
    { keepPrevious: true },
  );
}

const MATCHES_PER_PAGE = 5;

export function usePlayerMatches(player: PlayerSource, role: RoleSource) {
  return useInfiniteQuery({
    key: () => {
      const value = toValue(player);
      return value ? profileKeys.matches(value, toValue(role)) : [...profileKeys.all, "none"];
    },
    query: ({ pageParam, signal }) => {
      const value = toValue(player);
      if (!value) throw new Error("Matches query ran without a player");
      return summonerService.getMatches(value.region, value.riotId, { role: toValue(role), start: pageParam, count: MATCHES_PER_PAGE }, signal);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart,
    enabled: () => toValue(player) !== null,
    placeholderData: (previous, entry) => (isSamePlayer(player)(entry) ? previous : undefined),
  });
}

export function useLpHistory(player: PlayerSource, interval: MaybeRefOrGetter<LpInterval>) {
  return usePlayerQuery(
    player,
    (value) => profileKeys.lpHistory(value, toValue(interval)),
    ({ region, riotId }, signal) => summonerService.getLpHistory(region, riotId, toValue(interval), signal),
  );
}

function isSamePlayer(player: PlayerSource) {
  return (entry: { key: EntryKey } | undefined): boolean => {
    const current = toValue(player);
    if (!current || !entry) return false;
    return profileKeys.player(current).every((part, index) => entry.key[index] === part);
  };
}
