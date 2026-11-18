import { expect, test } from "vitest";
import { formatRank, formatRole, formatTier } from "@/utils/labels";

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
