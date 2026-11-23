import { toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@pinia/colada";
import type { PlayerKey, Region } from "@/types/riot";
import { matchService } from "@/services/matchService";
import { summonerService } from "@/services/summonerService";
import { toRiotIdSlug } from "@/utils/riotId";

export const matchKeys = {
  all: ["match"] as const,
  detail: (player: PlayerKey, matchId: string) => [...matchKeys.all, matchId, player.region, toRiotIdSlug(player.riotId).toLowerCase()] as const,
  timeline: (matchId: string) => [...matchKeys.all, matchId, "timeline"] as const,
  analysis: (matchId: string) => [...matchKeys.all, matchId, "analysis"] as const,
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

export function useMatchTimeline(region: MaybeRefOrGetter<Region | null>, matchId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    key: () => {
      const id = toValue(matchId);
      return id ? matchKeys.timeline(id) : [...matchKeys.all, "none", "timeline"];
    },
    query: ({ signal }) => {
      const value = toValue(region);
      const id = toValue(matchId);
      if (!value || !id) throw new Error("Timeline query ran without a region or a match id");
      return matchService.getTimeline(value, id, signal);
    },
    enabled: () => toValue(region) !== null && toValue(matchId) !== null,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useMatchAnalysis(region: MaybeRefOrGetter<Region | null>, matchId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    key: () => {
      const id = toValue(matchId);
      return id ? matchKeys.analysis(id) : [...matchKeys.all, "none", "analysis"];
    },
    query: ({ signal }) => {
      const value = toValue(region);
      const id = toValue(matchId);
      if (!value || !id) throw new Error("Analysis query ran without a region or a match id");
      return matchService.getAnalysis(value, id, signal);
    },
    enabled: () => toValue(region) !== null && toValue(matchId) !== null,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}
