import type { Region } from "@/types/riot";
import type { MatchTimeline } from "@/types/timeline";
import type { MatchAnalysis } from "@/types/analysis";
import { getJson } from "./http";

export const matchService = {
  getTimeline(region: Region, matchId: string, signal?: AbortSignal): Promise<MatchTimeline> {
    return getJson(`/matches/${region}/${encodeURIComponent(matchId)}/timeline`, signal);
  },

  getAnalysis(region: Region, matchId: string, signal?: AbortSignal): Promise<MatchAnalysis> {
    return getJson(`/matches/${region}/${encodeURIComponent(matchId)}/analysis`, signal);
  },
};
