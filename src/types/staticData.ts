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
