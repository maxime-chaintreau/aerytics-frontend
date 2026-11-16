import { REGIONS, type Region, type RiotId } from "@/types/riot";

export function isRegion(value: unknown): value is Region {
  return typeof value === "string" && (REGIONS as readonly string[]).includes(value);
}

/**
 * "Kaori-EUW" -> { gameName: 'Kaori', tagLine: 'EUW' }
 * Splits on the LAST "-": a game name can contain "-", a tag line can't.
 */
export function parseRiotIdSlug(slug: string): RiotId | null {
  const index = slug.lastIndexOf("-");
  if (index <= 0 || index === slug.length - 1) return null;

  const gameName = slug.slice(0, index).trim();
  const tagLine = slug.slice(index + 1).trim();
  if (!gameName || !/^[\p{L}\p{N}]{2,5}$/u.test(tagLine)) return null;

  return { gameName, tagLine };
}

/** { gameName: 'Kaori', tagLine: 'EUW' } -> "Kaori-EUW" (for URLs) */
export function toRiotIdSlug({ gameName, tagLine }: RiotId): string {
  return `${gameName}-${tagLine}`;
}

/** { gameName: 'Kaori', tagLine: 'EUW' } -> "Kaori#EUW" (for display) */
export function formatRiotId({ gameName, tagLine }: RiotId): string {
  return `${gameName}#${tagLine}`;
}
