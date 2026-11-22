// Data From Data Dragon, reduced to what the app uses

export interface ChampionInfo {
  /** numeric id used everywhere in the API: 103 */
  key: number;
  /** text id used by Data Dragon: "Ahri", "MonkeyKing" (Wukong) */
  id: string;
  /** display name in the chosen language: "Ahri", "Wukong" */
  name: string;
  /** icon file name: "Ahri.png" */
  image: string;
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
