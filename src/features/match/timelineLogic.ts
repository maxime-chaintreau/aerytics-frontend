import type { MatchDetail, MatchParticipant, TeamSide } from "@/types/match";
import type { DragonType, FrameStat, Lane, MatchTimeline, TimelineEvent, TowerTier, MapPosition } from "@/types/timeline";

// ---------- Team curves ----------

export function teamTotals(match: MatchDetail, timeline: MatchTimeline, stat: FrameStat): Record<TeamSide, number[]> {
  const sideOf = new Map(match.participants.map(({ puuid, side }) => [puuid, side]));
  const totals: Record<TeamSide, number[]> = {
    BLUE: timeline.frameTimes.map(() => 0),
    RED: timeline.frameTimes.map(() => 0),
  };
  for (const player of timeline.players) {
    const side = sideOf.get(player.puuid);
    if (!side) continue;
    player[stat].forEach((value, index) => (totals[side][index]! += value));
  }
  return totals;
}

export function difference(totals: Record<TeamSide, number[]>): number[] {
  return totals.BLUE.map((blue, index) => blue - totals.RED[index]!);
}

export interface Lead {
  value: number;
  time: number;
}

export function largestLeads(diff: number[], frameTimes: number[]): Record<TeamSide, Lead> {
  const leads: Record<TeamSide, Lead> = { BLUE: { value: 0, time: 0 }, RED: { value: 0, time: 0 } };
  diff.forEach((value, index) => {
    const side: TeamSide = value >= 0 ? "BLUE" : "RED";
    if (Math.abs(value) > leads[side].value) leads[side] = { value: Math.abs(value), time: frameTimes[index]! };
  });
  return leads;
}

// ---------- Axes ----------

const NICE_STEPS = [1, 2, 2.5, 5, 10];

export function niceLimit(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = NICE_STEPS.find((candidate) => candidate * magnitude >= value)!;
  return step * magnitude;
}

export function timeTicks(durationSeconds: number): number[] {
  const step = (durationSeconds > 40 * 60 ? 10 : 5) * 60;
  const ticks: number[] = [];
  for (let time = step; time < durationSeconds - 60; time += step) ticks.push(time);
  return ticks;
}

export function nearestFrame(frameTimes: number[], seconds: number): number {
  let best = 0;
  frameTimes.forEach((time, index) => {
    if (Math.abs(time - seconds) < Math.abs(frameTimes[best]! - seconds)) best = index;
  });
  return best;
}

// ---------- SVG paths ----------

const point = (time: number, value: number, limit: number) => `${time},${limit - value}`;

export function linePath(frameTimes: number[], values: number[], limit: number): string {
  return values.map((value, index) => `${index === 0 ? "M" : "L"}${point(frameTimes[index]!, value, limit)}`).join("");
}

export function areaPath(frameTimes: number[], values: number[], limit: number): string {
  const end = frameTimes.at(-1) ?? 0;
  return `M0,${limit}${values.map((value, index) => `L${point(frameTimes[index]!, value, limit)}`).join("")}L${end},${limit}Z`;
}

// ---------- Events ----------

const DRAGON_NAMES: Record<DragonType, string> = {
  air: "Dragon des nuages",
  earth: "Dragon de la montagne",
  fire: "Dragon infernal",
  water: "Dragon de l'océan",
  hextech: "Dragon hextech",
  chemtech: "Dragon chimtech",
  elder: "Dragon ancestral",
};

const TOWER_NAMES: Record<TowerTier, string> = {
  outer: "Tour extérieure",
  inner: "Tour intérieure",
  base: "Tour d'inhibiteur",
  nexus: "Tour du Nexus",
};

const LANE_NAMES: Record<Lane, string> = { top: "top", mid: "mid", bot: "bot" };

export function eventLabel(event: TimelineEvent, playerOf: (puuid: string) => MatchParticipant | undefined): string {
  const name = (puuid: string | null) => (puuid ? (playerOf(puuid)?.riotId.gameName ?? "?") : "Sbires");
  switch (event.kind) {
    case "kill":
      return `${name(event.killer)} → ${name(event.victim)}${event.firstBlood ? " (premier sang)" : ""}`;
    case "monster": {
      const monster = {
        dragon: event.dragon ? DRAGON_NAMES[event.dragon] : "Dragon",
        voidGrubs: "Larve du Néant",
        riftHerald: "Héraut de la Faille",
        baron: "Baron Nashor",
      }[event.monster];
      return event.stolen ? `${monster} (volé)` : monster;
    }
    case "building":
      return event.building === "inhibitor" ? `Inhibiteur ${LANE_NAMES[event.lane]}` : event.tier === "nexus" ? TOWER_NAMES.nexus : `${TOWER_NAMES[event.tier ?? "outer"]} ${LANE_NAMES[event.lane]}`;
  }
}

export function eventSide(event: TimelineEvent, playerOf: (puuid: string) => MatchParticipant | undefined): TeamSide | undefined {
  return event.kind === "kill" ? playerOf(event.killer)?.side : event.side;
}

export function eventsInFrame(events: TimelineEvent[], frameTimes: number[], index: number): TimelineEvent[] {
  const from = index === 0 ? -1 : frameTimes[index - 1]!;
  const to = frameTimes[index]!;
  return events.filter(({ time }) => time > from && time <= to);
}

// ---------- Popup ----------

/** top of the per-player chart: the biggest final value (values only grow, so the last frame is the max) */
export function playersLimit(timeline: MatchTimeline, stat: FrameStat): number {
  return niceLimit(Math.max(...timeline.players.map((player) => player[stat].at(-1) ?? 0), 1));
}

export type EventFilter = "objectives" | "kills" | "all";

export function filterEvents(events: TimelineEvent[], filter: EventFilter): TimelineEvent[] {
  if (filter === "all") return events;
  return events.filter((event) => (filter === "kills" ? event.kind === "kill" : event.kind !== "kill"));
}

export function dragonType(event: TimelineEvent): DragonType | null {
  return event.kind === "monster" && event.monster === "dragon" ? (event.dragon ?? null) : null;
}

// ---------- Map ----------

/** Summoner's Rift in Riot's coordinates (blue base bottom-left), the bounds Data Dragon's minimap covers */
const MAP_BOUNDS = { minX: -120, minY: -120, maxX: 14870, maxY: 14980 };

/** a position on the minimap, 0..1 from the top-left corner (CSS left / top) */
export function mapPosition({ x, y }: MapPosition): { left: number; top: number } {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return {
    left: clamp((x - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX)),
    // the image's top is the map's highest y
    top: clamp(1 - (y - MAP_BOUNDS.minY) / (MAP_BOUNDS.maxY - MAP_BOUNDS.minY)),
  };
}

export type GamePhase = "all" | "early" | "mid" | "late";

/** early: before 14 min (laning), mid: 14-25, late: after 25 */
export function inPhase(seconds: number, phase: GamePhase): boolean {
  if (phase === "early") return seconds < 14 * 60;
  if (phase === "mid") return seconds >= 14 * 60 && seconds < 25 * 60;
  if (phase === "late") return seconds >= 25 * 60;
  return true;
}
