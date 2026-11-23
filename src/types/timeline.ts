import type { TeamSide } from "./match";

export interface MapPosition {
  x: number;
  y: number;
}

export type Lane = "top" | "mid" | "bot";
export type DragonType = "air" | "earth" | "fire" | "water" | "hextech" | "chemtech" | "elder";
export type TimelineMonster = "dragon" | "voidGrubs" | "riftHerald" | "baron";
export type TowerTier = "outer" | "inner" | "base" | "nexus";

export interface PlayerFrames {
  puuid: string;
  gold: number[]; // gold earned (not current gold: spending doesn't lower it)
  xp: number[];
  cs: number[];
  damage: number[]; // damage dealt to champions
  level: number[];
  items: ItemEvent[];
  skills: SkillEvent[];
}

export type FrameStat = "gold" | "xp" | "cs" | "damage";

interface TimelineEventBase {
  time: number; // seconds since the start of the game
}

export interface KillEvent extends TimelineEventBase {
  kind: "kill";
  killer: string; // puuid
  victim: string;
  assists: string[];
  position: MapPosition;
  bounty: number;
  firstBlood: boolean;
}

export interface MonsterEvent extends TimelineEventBase {
  kind: "monster";
  monster: TimelineMonster;
  dragon?: DragonType;
  side: TeamSide; // the team that took it
  killer: string;
  stolen: boolean;
  position: MapPosition;
}

export interface BuildingEvent extends TimelineEventBase {
  kind: "building";
  building: "tower" | "inhibitor";
  lane: Lane;
  tier?: TowerTier;
  side: TeamSide; // the team that DESTROYED it
  killer: string | null; // null: finished by minions
}

export type TimelineEvent = KillEvent | MonsterEvent | BuildingEvent;

export interface MatchTimeline {
  matchId: string;
  frameTimes: number[];
  players: PlayerFrames[];
  events: TimelineEvent[];
}

export interface ItemEvent {
  time: number;
  itemId: number;
  action: "purchase" | "sell";
}

export type SkillSlot = 1 | 2 | 3 | 4;

export interface SkillEvent {
  time: number;
  slot: SkillSlot;
}
