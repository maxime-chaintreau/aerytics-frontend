import { describe, expect, test } from "vitest";
import type { LpHistoryPoint } from "@/types/profile";
import type { Rank } from "@/types/riot";
import { lastPromotion, lpChartHeights, lpDelta, rankScore, sortChampionPool, winrateTone, compareToAverage, BENCHMARK_METRICS, matchKda, csPerMinute } from "@/features/profile/profileLogic";

const point = (date: string, rank: Rank, lpChange = 0): LpHistoryPoint => ({ start: date, end: date, rank, lpChange });

describe("rankScore", () => {
  test("a higher rank always has a higher score", () => {
    expect(rankScore({ tier: "EMERALD", division: "IV", lp: 0 })).toBeGreaterThan(rankScore({ tier: "PLATINUM", division: "I", lp: 99 }));
    expect(rankScore({ tier: "EMERALD", division: "II", lp: 0 })).toBeGreaterThan(rankScore({ tier: "EMERALD", division: "III", lp: 99 }));
  });

  test("Master and above only count LP", () => {
    expect(rankScore({ tier: "CHALLENGER", division: null, lp: 900 })).toBe(rankScore({ tier: "MASTER", division: null, lp: 900 }));
  });
});

const history = [
  point("2026-10-18", { tier: "PLATINUM", division: "I", lp: 74 }, 20),
  point("2026-11-09", { tier: "EMERALD", division: "IV", lp: 10 }, -15),
  point("2026-11-16", { tier: "EMERALD", division: "II", lp: 48 }, 35),
];

test("lpDelta adds up the LP change of every bar", () => {
  expect(lpDelta(history)).toBe(40);
  expect(lpDelta([])).toBe(0);
});

test("lpChartHeights: lowest bar keeps a minimum height, highest is full", () => {
  const heights = lpChartHeights(history);
  expect(heights[0]).toBeCloseTo(0.15);
  expect(heights.at(-1)).toBe(1);
  expect(lpChartHeights([history[0]!, history[0]!])).toEqual([1, 1]);
});

test("lastPromotion finds the last tier promotion, not divisions", () => {
  expect(lastPromotion(history)?.end).toBe("2026-11-09");
  expect(lastPromotion(history.slice(1))).toBeNull(); // Emerald IV -> II: divisions only
});

describe("sortChampionPool", () => {
  const pool = [
    { championId: 1, games: 10, winrate: 0.5, kda: 3, csPerMin: 7 },
    { championId: 2, games: 30, winrate: 0.6, kda: 2, csPerMin: 6 },
    { championId: 3, games: 20, winrate: 0.6, kda: 4, csPerMin: 8 },
  ];
  const ids = (list: typeof pool) => list.map((entry) => entry.championId);

  test("sorts by the chosen column, in both directions", () => {
    expect(ids(sortChampionPool(pool, "games", "desc"))).toEqual([2, 3, 1]);
    expect(ids(sortChampionPool(pool, "kda", "asc"))).toEqual([2, 1, 3]);
  });

  test("ties are broken by number of games", () => {
    // 2 and 3 both have 60 %: 2 has more games
    expect(ids(sortChampionPool(pool, "winrate", "desc"))).toEqual([2, 3, 1]);
  });

  test("does not modify the original array", () => {
    sortChampionPool(pool, "kda", "asc");
    expect(ids(pool)).toEqual([1, 2, 3]);
  });
});

test("winrateTone", () => {
  expect(winrateTone(0.57)).toBe("positive");
  expect(winrateTone(0.55)).toBe("positive");
  expect(winrateTone(0.5)).toBe("neutral");
  expect(winrateTone(0.45)).toBe("negative");
});

describe("compareToAverage", () => {
  test("more is better for most metrics", () => {
    expect(compareToAverage("csPerMin", 7.1, 6.8)).toBe("better");
    expect(compareToAverage("killParticipation", 0.52, 0.58)).toBe("worse");
  });

  test("fewer deaths is better", () => {
    expect(compareToAverage("deathsPerGame", 4.6, 4.2)).toBe("worse");
    expect(compareToAverage("deathsPerGame", 3.5, 4.2)).toBe("better");
  });

  test("within 3 % of the average: equal", () => {
    expect(compareToAverage("csPerMin", 7.0, 6.9)).toBe("equal"); // 1.4 %
    expect(compareToAverage("damagePerMin", 710, 690)).toBe("equal"); // 2.9 %
    expect(compareToAverage("damagePerMin", 712, 690)).toBe("better"); // 3.2 %
  });
});

test("every metric formats its value", () => {
  expect(BENCHMARK_METRICS.damagePerMin.format(742)).toBe("742");
  expect(BENCHMARK_METRICS.csPerMin.format(7.1)).toBe("7,1");
  expect(BENCHMARK_METRICS.killParticipation.format(0.61).replace(/\s/g, " ")).toBe("61 %");
});

test("matchKda counts 0 deaths as 1", () => {
  expect(matchKda({ kills: 9, deaths: 2, assists: 11 })).toBe(10);
  expect(matchKda({ kills: 6, deaths: 0, assists: 14 })).toBe(20);
});

test("csPerMinute", () => {
  expect(csPerMinute({ cs: 214, durationSeconds: 1864 })).toBeCloseTo(6.89, 2);
  expect(csPerMinute({ cs: 0, durationSeconds: 0 })).toBe(0);
});