import { describe, expect, test } from "vitest";
import type { MatchDetail, MatchParticipant } from "@/types/match";
import type { MatchTimeline, TimelineEvent } from "@/types/timeline";
import {
  areaPath,
  difference,
  eventLabel,
  eventSide,
  eventsInFrame,
  largestLeads,
  linePath,
  nearestFrame,
  niceLimit,
  teamTotals,
  timeTicks,
  inPhase,
  mapPosition,
} from "@/features/match/timelineLogic";

const players = [
  { puuid: "b1", side: "BLUE", riotId: { gameName: "Kaori", tagLine: "EUW" } },
  { puuid: "b2", side: "BLUE", riotId: { gameName: "Mistral", tagLine: "EUW" } },
  { puuid: "r1", side: "RED", riotId: { gameName: "Sunfire", tagLine: "EUW" } },
] as MatchParticipant[];
const match = { participants: players } as MatchDetail;
const playerOf = (puuid: string) => players.find((player) => player.puuid === puuid);

const frames = (gold: number[]) => ({ gold, xp: [], cs: [], damage: [], level: [], items: [], skills: [] });
const timeline = {
  matchId: "EUW1_1",
  frameTimes: [0, 60, 90],
  players: [
    { puuid: "b1", ...frames([500, 900, 1000]) },
    { puuid: "b2", ...frames([500, 700, 800]) },
    { puuid: "r1", ...frames([500, 1000, 2500]) },
  ],
  events: [],
} as MatchTimeline;

describe("teamTotals / difference / largestLeads", () => {
  const totals = teamTotals(match, timeline, "gold");

  test("sums each team's players per frame", () => {
    expect(totals).toEqual({ BLUE: [1000, 1600, 1800], RED: [500, 1000, 2500] });
  });

  test("difference is blue minus red", () => {
    expect(difference(totals)).toEqual([500, 600, -700]);
  });

  test("each team's biggest lead and its time", () => {
    expect(largestLeads([500, 600, -700], timeline.frameTimes)).toEqual({ BLUE: { value: 600, time: 60 }, RED: { value: 700, time: 90 } });
  });

  test("a team never ahead has a lead of 0", () => {
    expect(largestLeads([0, 100], [0, 60]).RED).toEqual({ value: 0, time: 0 });
  });
});

describe("axes", () => {
  test.each([
    [4230, 5000],
    [870, 1000],
    [12, 20],
    [2400, 2500],
    [5000, 5000],
    [0, 1],
  ])("niceLimit(%i) = %i", (value, expected) => {
    expect(niceLimit(value)).toBe(expected);
  });

  test("time ticks every 5 min, every 10 after 40 min, never on the edges", () => {
    expect(timeTicks(1864)).toEqual([300, 600, 900, 1200, 1500, 1800]);
    expect(timeTicks(1830)).toEqual([300, 600, 900, 1200, 1500]);
    expect(timeTicks(45 * 60)).toEqual([600, 1200, 1800, 2400]);
  });

  test("nearestFrame", () => {
    expect(nearestFrame([0, 60, 120, 150], 100)).toBe(2);
    expect(nearestFrame([0, 60, 120, 150], 140)).toBe(3);
    expect(nearestFrame([0, 60], -10)).toBe(0);
  });
});

describe("paths (y = limit - value)", () => {
  test("line", () => {
    expect(linePath([0, 60], [0, 500], 1000)).toBe("M0,1000L60,500");
  });

  test("area closed on the zero line", () => {
    expect(areaPath([0, 60], [0, -500], 1000)).toBe("M0,1000L0,1000L60,1500L60,1000Z");
  });
});

describe("events", () => {
  const kill: TimelineEvent = { kind: "kill", time: 61, killer: "r1", victim: "b1", assists: [], position: { x: 0, y: 0 }, bounty: 400, firstBlood: true };
  const dragon: TimelineEvent = { kind: "monster", time: 30, monster: "dragon", dragon: "fire", side: "BLUE", killer: "b2", stolen: true, position: { x: 0, y: 0 } };
  const tower: TimelineEvent = { kind: "building", time: 90, building: "tower", lane: "bot", tier: "inner", side: "RED", killer: null };

  test("labels", () => {
    expect(eventLabel(kill, playerOf)).toBe("Sunfire → Kaori (premier sang)");
    expect(eventLabel(dragon, playerOf)).toBe("Dragon infernal (volé)");
    expect(eventLabel(tower, playerOf)).toBe("Tour intérieure bot");
    expect(eventLabel({ ...tower, building: "inhibitor", tier: undefined }, playerOf)).toBe("Inhibiteur bot");
  });

  test("side: the killer's team for a kill", () => {
    expect(eventSide(kill, playerOf)).toBe("RED");
    expect(eventSide(dragon, playerOf)).toBe("BLUE");
  });

  test("eventsInFrame: after the previous frame, up to this one", () => {
    const events = [dragon, kill, tower];
    expect(eventsInFrame(events, [0, 60, 90], 0)).toEqual([]);
    expect(eventsInFrame(events, [0, 60, 90], 1)).toEqual([dragon]);
    expect(eventsInFrame(events, [0, 60, 90], 2)).toEqual([kill, tower]);
  });
});

describe("map", () => {
  test("blue base bottom-left, red base top-right", () => {
    const blue = mapPosition({ x: 500, y: 500 });
    const red = mapPosition({ x: 14300, y: 14300 });
    expect(blue.left).toBeLessThan(0.1);
    expect(blue.top).toBeGreaterThan(0.9);
    expect(red.left).toBeGreaterThan(0.9);
    expect(red.top).toBeLessThan(0.1);
  });

  test("never outside the image", () => {
    expect(mapPosition({ x: -5000, y: 99999 })).toEqual({ left: 0, top: 0 });
  });

  test("phases", () => {
    expect(inPhase(13 * 60, "early")).toBe(true);
    expect(inPhase(14 * 60, "mid")).toBe(true);
    expect(inPhase(25 * 60, "late")).toBe(true);
    expect(inPhase(25 * 60, "mid")).toBe(false);
    expect(inPhase(1, "all")).toBe(true);
  });
});
