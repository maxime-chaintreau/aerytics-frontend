import { describe, expect, test } from "vitest";
import type { Matchup } from "@/types/champion";
import { formatClasses, formatCooldowns, formatDurationBucket, formatLaneDiff, matchupSections, reliability, skillLevels, winrateGap } from "@/features/champion/championLogic";

describe("labels", () => {
  test("classes and durations", () => {
    expect(formatClasses(["Mage", "Assassin"])).toBe("Mage / Assassin");
    expect(formatClasses(["Fighter", "Tank"])).toBe("Combattant / Tank");
    expect(formatDurationBucket({ from: 20, to: 25 })).toBe("20–25 min");
    expect(formatDurationBucket({ from: 35, to: null })).toBe("35 min +");
  });
});

describe("matchups", () => {
  const matchup = (championId: number, games: number, winrate: number) => ({ championId, games, winrate, goldDiff15: 0, xpDiff15: 0, csDiff15: 0, firstBloodRate: 0.5 }) as Matchup;
  const list = [matchup(1, 5000, 0.51), matchup(2, 120, 0.66), matchup(3, 40, 0.8), matchup(4, 900, 0.45), matchup(5, 300, 0.49)];

  test("reliability from the number of games", () => {
    expect(reliability(5403)).toBe("high");
    expect(reliability(300)).toBe("medium");
    expect(reliability(129)).toBe("low");
  });

  test("sections: most played, best and worst with enough games", () => {
    const sections = matchupSections(list, 2);
    expect(sections.mostPlayed.map((entry) => entry.championId)).toEqual([1, 4]);
    expect(sections.favorable.map((entry) => entry.championId)).toEqual([2, 1]);
    expect(sections.difficult.map((entry) => entry.championId)).toEqual([4, 5]);
  });
});

describe("champion page formatting", () => {
  test("skill grid rows: the levels of Q, W, E, R", () => {
    const order = [1, 2, 3, 1, 1, 4, 1, 1, 2, 2, 4, 2, 2, 3, 3, 4, 3, 3];
    expect(skillLevels(order)).toEqual([
      [1, 4, 5, 7, 8],
      [2, 9, 10, 12, 13],
      [3, 14, 15, 17, 18],
      [6, 11, 16],
    ]);
  });

  test("duration bar gap is clamped to ±1", () => {
    expect(winrateGap(0.53)).toBeCloseTo(0.5);
    expect(winrateGap(0.4)).toBe(-1);
  });

  test("cooldowns: one value when they never change", () => {
    expect(formatCooldowns([7, 7, 7, 7, 7])).toBe("7 s");
    expect(formatCooldowns([140, 120, 100])).toBe("140 / 120 / 100 s");
    expect(formatCooldowns([0, 0])).toBe("");
  });

  test("lane diffs use a real minus sign and French decimals", () => {
    expect(formatLaneDiff(78)).toBe("+78");
    expect(formatLaneDiff(-2.2, 1)).toBe("−2,2");
    expect(formatLaneDiff(0.2)).toBe("0");
  });
});
