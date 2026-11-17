import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import type { ChampionInfo, ChampionsByKey, ItemInfo, ItemsById } from "@/types/staticData";
import { ddragonImage, staticDataService } from "@/services/staticDataService";

type Status = "idle" | "loading" | "success" | "error";

export const useStaticDataStore = defineStore("staticData", () => {
  const version = ref<string | null>(null);
  const champions = shallowRef<ChampionsByKey>({});
  const items = shallowRef<ItemsById>({});
  const status = ref<Status>("idle");

  let pending: Promise<void> | null = null;

  /** Loads everything once. Safe to call several times: shares the running request, retries after an error. */
  function load(): Promise<void> {
    if (status.value === "success") return Promise.resolve();

    pending ??= (async () => {
      status.value = "loading";
      try {
        const latest = await staticDataService.getLatestVersion();
        const [championList, itemList] = await Promise.all([staticDataService.getChampions(latest), staticDataService.getItems(latest)]);
        version.value = latest;
        champions.value = championList;
        items.value = itemList;
        status.value = "success";
      } catch (error) {
        console.error(error);
        status.value = "error";
      } finally {
        pending = null;
      }
    })();

    return pending;
  }

  /** undefined while loading, or for a champion too new for the current list */
  const champion = (key: number): ChampionInfo | undefined => champions.value[key];
  const item = (id: number): ItemInfo | undefined => items.value[id];

  const championIconUrl = (champion: ChampionInfo) => (version.value ? ddragonImage.champion(version.value, champion.image) : undefined);
  const itemIconUrl = (item: ItemInfo) => (version.value ? ddragonImage.item(version.value, item.image) : undefined);
  const profileIconUrl = (iconId: number) => (version.value ? ddragonImage.profileIcon(version.value, iconId) : undefined);

  return { version, champions, items, status, load, champion, item, championIconUrl, itemIconUrl, profileIconUrl };
});
