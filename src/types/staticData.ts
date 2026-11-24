export interface ChampionInfo {
  key: number;
  id: string;
  name: string;
  title: string;
  tags: ChampionClass[];
  image: string;
}

export type ChampionClass = "Assassin" | "Fighter" | "Mage" | "Marksman" | "Support" | "Tank";

export interface ChampionSpellInfo {
  id: string;
  name: string;
  description: string;
  cooldowns: number[];
  costs: number[];
  range: number[];
  image: string;
}

export interface ChampionDetails {
  key: number;
  passive: { name: string; description: string; image: string };
  spells: ChampionSpellInfo[];
}

export interface ItemInfo {
  id: number;
  name: string;
  image: string;
}

/** 103 -> Ahri */
export type ChampionsByKey = Record<number, ChampionInfo>;

/** 3100 -> Lich Bane */
export type ItemsById = Record<number, ItemInfo>;

export interface RuneStyleInfo {
  id: number;
  name: string;
  icon: string;
  slots: number[][];
}

export interface RuneInfo {
  id: number;
  name: string;
  icon: string;
  shortDesc: string;
  styleId: number;
}

export interface RunesData {
  styles: Record<number, RuneStyleInfo>;
  runes: Record<number, RuneInfo>;
  shards: { rows: number[][]; names: Record<number, string> };
}

export interface SummonerSpellInfo {
  key: number;
  name: string;
  description: string;
  cooldown: number;
  image: string;
}

export type SummonerSpellsByKey = Record<number, SummonerSpellInfo>;
