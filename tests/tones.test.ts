import { expect, test } from "vitest";
import { diffTone, metaTierTone, statWinrateTone, winrateTone } from "@/utils/tones";

test("a player's win rate: 55 / 45", () => {
  expect(winrateTone(0.57)).toBe("positive");
  expect(winrateTone(0.55)).toBe("positive");
  expect(winrateTone(0.5)).toBe("neutral");
  expect(winrateTone(0.45)).toBe("negative");
});

test("a champion's win rate: tighter, 52 / 48", () => {
  expect(statWinrateTone(0.52)).toBe("positive");
  expect(statWinrateTone(0.5)).toBe("neutral");
  expect(statWinrateTone(0.48)).toBe("negative");
});

test("meta tiers and differences", () => {
  expect(metaTierTone("S+")).toBe("gold");
  expect(metaTierTone("S")).toBe("positive");
  expect(metaTierTone("B")).toBe("neutral");
  expect(diffTone(-3)).toBe("negative");
  expect(diffTone(0)).toBe("neutral");
});
