import { describe, expect, test } from "vitest";
import type { MatchParticipant } from "@/types/match";
import type { ItemEvent, SkillEvent, SkillSlot } from "@/types/timeline";
import { damageSplit, shopVisits, skillGrid, skillPriority, teamDamageSplit } from "@/features/match/buildLogic";

const buy = (time: number, itemId = 1): ItemEvent => ({ time, itemId, action: "purchase" });
const skills = (slots: SkillSlot[]): SkillEvent[] => slots.map((slot, index) => ({ time: index * 60, slot }));

describe("shopVisits", () => {
  test("groups purchases close in time", () => {
    const visits = shopVisits([buy(0), buy(10), buy(400), buy(430), buy(900)]);
    expect(visits.map((visit) => [visit.time, visit.items.length])).toEqual([
      [0, 2],
      [400, 2],
      [900, 1],
    ]);
  });

  test("no purchase, no visit", () => {
    expect(shopVisits([])).toEqual([]);
  });
});

describe("skills", () => {
  const order = skills([1, 2, 3, 1, 1, 4, 1, 1, 3, 3, 4, 3, 3, 2, 2, 4, 2, 2]);

  test("grid: one ability per level", () => {
    const grid = skillGrid(order);
    expect(grid[1].slice(0, 6)).toEqual([true, false, false, true, true, false]);
    expect(grid[4][5]).toBe(true);
  });

  test("priority: the order they were maxed", () => {
    expect(skillPriority(order)).toEqual([1, 3, 2]);
  });

  test("priority of a short game: by points", () => {
    expect(skillPriority(skills([3, 1, 2, 3, 3, 4, 1]))).toEqual([3, 1, 2]);
  });
});

describe("damage", () => {
  const player = (physical: number, magic: number, trueDamage: number) =>
    ({
      stats: {
        physicalDamageToChampions: physical,
        magicDamageToChampions: magic,
        trueDamageToChampions: trueDamage,
        damageToChampions: physical + magic + trueDamage,
      },
    }) as MatchParticipant;

  test("split of one player, then of the team", () => {
    expect(damageSplit(player(100, 50, 10), "dealt")).toEqual({ physical: 100, magic: 50, true: 10, total: 160 });
    expect(teamDamageSplit([player(100, 0, 0), player(0, 200, 5)], "dealt")).toEqual({ physical: 100, magic: 200, true: 5, total: 305 });
  });
});
