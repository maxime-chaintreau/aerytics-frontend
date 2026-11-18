import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQueryCache, type UseQueryEntry } from "@pinia/colada";
import type { PlayerKey } from "@/types/riot";
import { profileKeys } from "@/composables/useProfileQueries";
import { metaKeys } from "@/composables/useMetaQueries";
import { useStaticDataStore } from "@/stores/staticData";

export function useProfileRefresh(player: MaybeRefOrGetter<PlayerKey | null>) {
  const queryCache = useQueryCache();
  const staticData = useStaticDataStore();

  const visibleEntries = computed<UseQueryEntry[]>(() => {
    const value = toValue(player);
    if (!value) return [];
    return [
      ...queryCache.getEntries({ key: profileKeys.player(value), active: true }),
      ...queryCache.getEntries({ key: metaKeys.all, active: true }),
    ];
  });

  const isRefreshing = computed(() => visibleEntries.value.some((entry) => entry.asyncStatus.value === "loading"));

  const hasError = computed(() => visibleEntries.value.some((entry) => entry.state.value.status === "error"));

  function refreshAll() {
    for (const entry of visibleEntries.value) {
      queryCache.refresh(entry).catch(() => {});
    }
    staticData.load();
  }

  return { refreshAll, isRefreshing, hasError };
}