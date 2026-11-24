import { readonly, ref } from "vue";
import type { Region } from "@/types/riot";
import type { PlayerCard } from "@/types/search";
import { isRegion } from "@/utils/riotId";

const RECENT_KEY = "aerytics:recent-searches";
const REGION_KEY = "aerytics:region";
const MAX_RECENT = 8;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignored
  }
}

function isCard(value: unknown): value is PlayerCard {
  const card = value as PlayerCard;
  return typeof card?.riotId?.gameName === "string" && typeof card?.riotId?.tagLine === "string" && isRegion(card.region);
}

const recent = ref<PlayerCard[]>(read<unknown[]>(RECENT_KEY, []).filter(isCard));
const storedRegion = read<unknown>(REGION_KEY, "euw");
const lastRegion = ref<Region>(isRegion(storedRegion) ? storedRegion : "euw");

const sameCard = (a: PlayerCard, b: PlayerCard) =>
  a.region === b.region && a.riotId.gameName.toLowerCase() === b.riotId.gameName.toLowerCase() && a.riotId.tagLine.toLowerCase() === b.riotId.tagLine.toLowerCase();

export function useRecentSearches() {
  function add(card: PlayerCard) {
    recent.value = [card, ...recent.value.filter((other) => !sameCard(other, card))].slice(0, MAX_RECENT);
    write(RECENT_KEY, recent.value);
  }

  function remove(card: PlayerCard) {
    recent.value = recent.value.filter((other) => !sameCard(other, card));
    write(RECENT_KEY, recent.value);
  }

  function clear() {
    recent.value = [];
    write(RECENT_KEY, []);
  }

  function rememberRegion(region: Region) {
    lastRegion.value = region;
    write(REGION_KEY, region);
  }

  return { recent: readonly(recent), lastRegion: readonly(lastRegion), add, remove, clear, rememberRegion };
}
