import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import type { ChampionInfo, ChampionsByKey, ItemInfo, ItemsById, RuneInfo, RuneStyleInfo, RunesData, SummonerSpellInfo, SummonerSpellsByKey } from "@/types/staticData";
import { ddragonImage, staticDataService } from "@/services/staticDataService";

type Status = "idle" | "loading" | "success" | "error";

export const useStaticDataStore = defineStore("staticData", () => {
  const version = ref<string | null>(null);
  const champions = shallowRef<ChampionsByKey>({});
  const items = shallowRef<ItemsById>({});
  const runes = shallowRef<RunesData>({ styles: {}, runes: {}, shards: { rows: [], names: {} } });
  const summonerSpells = shallowRef<SummonerSpellsByKey>({});
  const status = ref<Status>("idle");

  let pending: Promise<void> | null = null;

  /** Loads everything once. Safe to call several times: shares the running request, retries after an error. */
  function load(): Promise<void> {
    if (status.value === "success") return Promise.resolve();

    pending ??= (async () => {
      status.value = "loading";
      try {
        const latest = await staticDataService.getLatestVersion();
        const [championList, itemList, runeData, spellList] = await Promise.all([
          staticDataService.getChampions(latest),
          staticDataService.getItems(latest),
          staticDataService.getRunes(latest),
          staticDataService.getSummonerSpells(latest),
        ]);
        version.value = latest;
        champions.value = championList;
        items.value = itemList;
        runes.value = runeData;
        summonerSpells.value = spellList;
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

  function retryAfterError() {
    if (status.value === "error") load();
  }
  window.addEventListener("online", retryAfterError);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") retryAfterError();
  });

  /** undefined while loading, or for a champion too new for the current list */
  const champion = (key: number): ChampionInfo | undefined => champions.value[key];
  const item = (id: number): ItemInfo | undefined => items.value[id];
  const rune = (id: number): RuneInfo | undefined => runes.value.runes[id];
  const runeStyle = (id: number): RuneStyleInfo | undefined => runes.value.styles[id];
  const shardName = (id: number): string | undefined => runes.value.shards.names[id];
  const summonerSpell = (key: number): SummonerSpellInfo | undefined => summonerSpells.value[key];

  const championIconUrl = (champion: ChampionInfo) => (version.value ? ddragonImage.champion(version.value, champion.image) : undefined);
  const itemIconUrl = (item: ItemInfo) => (version.value ? ddragonImage.item(version.value, item.image) : undefined);
  const runeIconUrl = (runeOrStyle: RuneInfo | RuneStyleInfo) => ddragonImage.rune(runeOrStyle.icon);
  const summonerSpellIconUrl = (spell: SummonerSpellInfo) => (version.value ? ddragonImage.summonerSpell(version.value, spell.image) : undefined);
  const profileIconUrl = (iconId: number) => (version.value ? ddragonImage.profileIcon(version.value, iconId) : undefined);
  const mapUrl = (mapId: number) => (version.value ? ddragonImage.map(version.value, mapId) : undefined);
  const championSplashUrl = (champion: ChampionInfo) => ddragonImage.splash(champion.id);

  return {
    version,
    champions,
    items,
    runes,
    summonerSpells,
    status,
    load,
    champion,
    item,
    rune,
    runeStyle,
    shardName,
    summonerSpell,
    championIconUrl,
    itemIconUrl,
    runeIconUrl,
    summonerSpellIconUrl,
    profileIconUrl,
    mapUrl,
    championSplashUrl,
  };
});
