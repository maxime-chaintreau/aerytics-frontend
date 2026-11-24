import { ref, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue";
import { useQuery } from "@pinia/colada";
import type { Region } from "@/types/riot";
import { searchService } from "@/services/searchService";

const searchKeys = {
  all: ["search"] as const,
  players: (query: string, region: Region | null) => [...searchKeys.all, "players", region ?? "ALL", query] as const,
  ladder: (region: Region) => [...searchKeys.all, "ladder", region] as const,
};

export function useDebounced<T>(source: MaybeRefOrGetter<T>, delay: number): Ref<T> {
  const debounced = ref(toValue(source)) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(
    () => toValue(source),
    (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => (debounced.value = value), delay);
    },
  );
  return debounced;
}

export const MIN_QUERY_LENGTH = 2;

export function usePlayerSearch(query: MaybeRefOrGetter<string>, region: MaybeRefOrGetter<Region | null>) {
  const normalized = () => toValue(query).trim().toLowerCase();
  return useQuery({
    key: () => searchKeys.players(normalized(), toValue(region)),
    query: ({ signal }) => searchService.searchPlayers(normalized(), toValue(region), signal),
    enabled: () => normalized().length >= MIN_QUERY_LENGTH,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useLadder(region: MaybeRefOrGetter<Region>) {
  return useQuery({
    key: () => searchKeys.ladder(toValue(region)),
    query: ({ signal }) => searchService.getLadder(toValue(region), signal),
    staleTime: 10 * 60_000,
  });
}
