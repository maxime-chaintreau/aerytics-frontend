import { expect, test } from "vitest";
import type { MatchParticipant } from "@/types/match";
import { SCOREBOARD_PRESETS, barRatios, bestValue, formatStat } from "@/features/match/matchStats";

test("formatStat follows the stat's format", () => {
  expect(formatStat("kda", 1.833)).toBe("1,83");
  expect(formatStat("killParticipation", 0.52)).toMatch(/^52\s%$/);
  expect(formatStat("timeSpentDead", 95)).toBe("1:35");
  expect(formatStat("firstBloodKill", 1)).toBe("Oui");
  expect(formatStat("firstBloodKill", 0)).toBe("—");
});

const player = (puuid: string, kills: number, deaths = 0) => ({ puuid, stats: { kills, deaths } }) as unknown as MatchParticipant;

test("barRatios: relative to the best of the game", () => {
  const ratios = barRatios([player("a", 10), player("b", 5), player("c", 0)], ({ stats }) => stats.kills);
  expect([ratios.get("a"), ratios.get("b"), ratios.get("c")]).toEqual([1, 0.5, 0]);
});

test("barRatios: nobody has any -> empty bars, no division by zero", () => {
  const ratios = barRatios([player("a", 0), player("b", 0)], ({ stats }) => stats.kills);
  expect([...ratios.values()]).toEqual([0, 0]);
});

test("bestValue: highest, lowest when lower is better, none when all zero", () => {
  const players = [player("a", 10, 2), player("b", 5, 7)];
  expect(bestValue(players, "kills")).toBe(10);
  expect(bestValue(players, "deaths", true)).toBe(2);
  expect(bestValue([player("a", 0), player("b", 0)], "kills")).toBeNull();
});

test("presets: unique ids, no stat twice in a preset", () => {
  expect(new Set(SCOREBOARD_PRESETS.map(({ id }) => id)).size).toBe(SCOREBOARD_PRESETS.length);
  for (const { columns } of SCOREBOARD_PRESETS) {
    const keys = columns.flatMap((column) => (column.kind === "stat" ? [column.key] : []));
    expect(new Set(keys).size).toBe(keys.length);
  }
});
