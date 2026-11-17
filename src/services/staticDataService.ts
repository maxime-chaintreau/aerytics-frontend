import type { ChampionsByKey, ItemsById } from "@/types/staticData";
import { getJson } from "./http";

const DDRAGON_URL = "https://ddragon.leagueoflegends.com";
export const DDRAGON_LOCALE = "fr_FR";

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
};

// ---------- Image URLs (the browser loads them through <img>) ----------

export const ddragonImage = {
  champion: (version: string, image: string) => `${DDRAGON_URL}/cdn/${version}/img/champion/${image}`,
  item: (version: string, image: string) => `${DDRAGON_URL}/cdn/${version}/img/item/${image}`,
  profileIcon: (version: string, iconId: number) => `${DDRAGON_URL}/cdn/${version}/img/profileicon/${iconId}.png`,
};
