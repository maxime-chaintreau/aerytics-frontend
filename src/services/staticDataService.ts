import type { ChampionsByKey, ItemsById, RunesData, SummonerSpellsByKey, ChampionDetails } from "@/types/staticData";
import { getJson } from "./http";

const DDRAGON_URL = "https://ddragon.leagueoflegends.com";
const DDRAGON_LOCALE = "fr_FR";

const staticPath = (version: string, file: string) => `/static/${encodeURIComponent(version)}/${DDRAGON_LOCALE}/${file}.json`;

export const staticDataService = {
  /** The patch the backend currently serves */
  async getLatestVersion(signal?: AbortSignal): Promise<string> {
    const { version } = await getJson<{ version: string }>("/static/version", signal);
    return version;
  },

  getChampions(version: string, signal?: AbortSignal): Promise<ChampionsByKey> {
    return getJson(staticPath(version, "champions"), signal);
  },

  getItems(version: string, signal?: AbortSignal): Promise<ItemsById> {
    return getJson(staticPath(version, "items"), signal);
  },

  getRunes(version: string, signal?: AbortSignal): Promise<RunesData> {
    return getJson(staticPath(version, "runes"), signal);
  },

  getSummonerSpells(version: string, signal?: AbortSignal): Promise<SummonerSpellsByKey> {
    return getJson(staticPath(version, "summonerSpells"), signal);
  },

  getChampionDetails(version: string, championKey: number, signal?: AbortSignal): Promise<ChampionDetails> {
    return getJson(staticPath(version, `champions/${championKey}`), signal);
  },
};

// ---------- Image URLs (the browser loads them through <img>) ----------

export const ddragonImage = {
  champion: (version: string, image: string) => `${DDRAGON_URL}/cdn/${version}/img/champion/${image}`,
  item: (version: string, image: string) => `${DDRAGON_URL}/cdn/${version}/img/item/${image}`,
  profileIcon: (version: string, iconId: number) => `${DDRAGON_URL}/cdn/${version}/img/profileicon/${iconId}.png`,
  splash: (championId: string, skin = 0) => `${DDRAGON_URL}/cdn/img/champion/splash/${championId}_${skin}.jpg`,
  summonerSpell: (version: string, image: string) => `${DDRAGON_URL}/cdn/${version}/img/spell/${image}`,
  rune: (icon: string) => `${DDRAGON_URL}/cdn/img/${icon}`,
  map: (version: string, mapId: number) => `${DDRAGON_URL}/cdn/${version}/img/map/map${mapId}.png`,
  championSpell: (version: string, image: string) => `${DDRAGON_URL}/cdn/${version}/img/spell/${image}`,
  passive: (version: string, image: string) => `${DDRAGON_URL}/cdn/${version}/img/passive/${image}`,
};
