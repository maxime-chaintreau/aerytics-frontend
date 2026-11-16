import { describe, expect, test } from "vitest";
import { formatRiotId, isRegion, parseRiotIdSlug, toRiotIdSlug } from "@/utils/riotId";

describe("parseRiotIdSlug", () => {
  test("splits game name and tag line", () => {
    expect(parseRiotIdSlug("Kaori-EUW")).toEqual({ gameName: "Kaori", tagLine: "EUW" });
  });

  test("splits on the LAST dash: game names can contain dashes", () => {
    expect(parseRiotIdSlug("Mid-or-Feed-1234")).toEqual({ gameName: "Mid-or-Feed", tagLine: "1234" });
  });

  test("keeps spaces and accents in the game name", () => {
    expect(parseRiotIdSlug("Le Héraut-EUW")).toEqual({ gameName: "Le Héraut", tagLine: "EUW" });
  });

  test("rejects invalid slugs", () => {
    expect(parseRiotIdSlug("Kaori")).toBeNull();
    expect(parseRiotIdSlug("-EUW")).toBeNull();
    expect(parseRiotIdSlug("Kaori-")).toBeNull();
    expect(parseRiotIdSlug("Kaori-TOOLONG")).toBeNull();
  });
});

test("toRiotIdSlug and parseRiotIdSlug are inverse", () => {
  const riotId = { gameName: "Mid-or-Feed", tagLine: "1234" };
  expect(parseRiotIdSlug(toRiotIdSlug(riotId))).toEqual(riotId);
});

test("formatRiotId uses #", () => {
  expect(formatRiotId({ gameName: "Kaori", tagLine: "EUW" })).toBe("Kaori#EUW");
});

test("isRegion only accepts known regions", () => {
  expect(isRegion("euw")).toBe(true);
  expect(isRegion("EUW")).toBe(false);
  expect(isRegion("xyz")).toBe(false);
  expect(isRegion(undefined)).toBe(false);
});
