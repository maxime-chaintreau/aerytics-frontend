import type { Rank, Region, RiotId } from "./riot";

export interface PlayerCard {
  region: Region;
  riotId: RiotId;
  profileIconId: number;
  summonerLevel: number;
  rank: Rank | null;
}

export interface Ladder {
  region: Region;
  players: PlayerCard[];
}
