import type { ChampionInfo, ChampionsByKey } from "@/types/staticData";

export const championSlug = (champion: Pick<ChampionInfo, "id">) => champion.id.toLowerCase();

export function championBySlug(champions: ChampionsByKey, slug: string): ChampionInfo | undefined {
  const wanted = slug.toLowerCase();
  return Object.values(champions).find((champion) => championSlug(champion) === wanted);
}

export const normalizeChampionName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export interface ChampionSearchEntry {
  champion: ChampionInfo;
  normalized: string;
}

export const championSearchIndex = (champions: ChampionsByKey): ChampionSearchEntry[] => Object.values(champions).map((champion) => ({ champion, normalized: normalizeChampionName(champion.name) }));

export function searchChampions(index: ChampionSearchEntry[], query: string, limit = 5): ChampionInfo[] {
  const wanted = normalizeChampionName(query);
  if (!wanted) return [];
  const starts: ChampionInfo[] = [];
  const contains: ChampionInfo[] = [];
  for (const { champion, normalized } of index) {
    if (normalized.startsWith(wanted)) starts.push(champion);
    else if (normalized.includes(wanted)) contains.push(champion);
  }
  const byName = (a: ChampionInfo, b: ChampionInfo) => a.name.localeCompare(b.name, "fr");
  return [...starts.sort(byName), ...contains.sort(byName)].slice(0, limit);
}
