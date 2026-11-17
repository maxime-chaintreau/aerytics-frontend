import { computed } from "vue";
import { useRoute } from "vue-router";
import type { PlayerKey } from "@/types/riot";
import { isRegion, parseRiotIdSlug } from "@/utils/riotId";

/**
 * Reads the player from the URL (/euw/Kaori-EUW).
 * `null` when the URL doesn't describe a valid player.
 */
export function usePlayerFromRoute() {
  const route = useRoute();

  return computed<PlayerKey | null>(() => {
    const { region, riotId } = route.params;
    if (!isRegion(region) || typeof riotId !== "string") return null;

    const parsed = parseRiotIdSlug(riotId);
    return parsed ? { region, riotId: parsed } : null;
  });
}
