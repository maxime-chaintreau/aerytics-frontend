import { expect, test } from "vitest";
import { formatRankName, formatRank, formatRole, formatSide, formatTier, tierColor, formatResult, formatQueue } from "@/utils/labels";

test("formatTier", () => {
  expect(formatTier("EMERALD")).toBe("Émeraude");
  expect(formatTier("GRANDMASTER")).toBe("Grand Maître");
});

test("formatRole uses the community names", () => {
  expect(formatRole("BOTTOM")).toBe("ADC");
});

test("formatRank", () => {
  expect(formatRank({ tier: "EMERALD", division: "II", lp: 48 })).toBe("Émeraude II · 48 LP");
  expect(formatRank({ tier: "MASTER", division: null, lp: 312 })).toBe("Maître · 312 LP");
});

test("tierColor points to the CSS token", () => {
  expect(tierColor("GRANDMASTER")).toBe("var(--tier-grandmaster)");
});

test("formatResult and formatQueue", () => {
  expect(formatResult("LOSS")).toBe("Défaite");
  expect(formatQueue("RANKED_SOLO")).toBe("Classée solo/duo");
});

test("formatRankName: no LP, no division from Master", () => {
  expect(formatRankName({ tier: "EMERALD", division: "II" })).toBe("Émeraude II");
  expect(formatRankName({ tier: "MASTER", division: null })).toBe("Maître");
});

test("formatSide", () => {
  expect(formatSide("BLUE")).toBe("Équipe bleue");
  expect(formatSide("RED")).toBe("Équipe rouge");
});
