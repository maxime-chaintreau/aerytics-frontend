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

export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length]!;
}

export function closestChampions(index: ChampionSearchEntry[], query: string, limit = 3): ChampionInfo[] {
  const wanted = normalizeChampionName(query);
  if (!wanted) return [];

  const found = searchChampions(index, query, limit);
  if (found.length >= limit) return found;

  const maxDistance = Math.max(1, Math.floor(wanted.length / 3)); // longer names allow more typos
  const near = index
    .filter(({ champion }) => !found.includes(champion))
    .map(({ champion, normalized }) => {
      const slug = championSlug(champion);
      const distance = slug.includes(wanted) ? 0 : Math.min(editDistance(wanted, normalized), editDistance(wanted, slug));
      return { champion, distance };
    })
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || a.champion.name.localeCompare(b.champion.name, "fr"))
    .map(({ champion }) => champion);

  return [...found, ...near].slice(0, limit);
}
