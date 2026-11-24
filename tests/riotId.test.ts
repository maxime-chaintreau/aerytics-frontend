import { describe, expect, test } from "vitest";
import { formatRiotId, isRegion, parseRiotIdSlug, toRiotIdSlug, riotIdSlugToInput, parseRiotIdInput } from "@/utils/riotId";

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
    expect(parseRiotIdSlug("Kaori-GG")).toBeNull();
    expect(parseRiotIdSlug("Kaori-TOOLONG")).toBeNull();
  });
});

test("toRiotIdSlug and parseRiotIdSlug are inverse", () => {
  const riotId = { gameName: "Mid-or-Feed", tagLine: "1234" };
  expect(parseRiotIdSlug(toRiotIdSlug(riotId))).toEqual(riotId);
});

test("riotIdSlugToInput: last '-' becomes '#', even for an invalid tag", () => {
  expect(riotIdSlugToInput("Kaori-EUWEST")).toBe("Kaori#EUWEST");
  expect(riotIdSlugToInput("Jean-Pierre-EUW")).toBe("Jean-Pierre#EUW");
  expect(riotIdSlugToInput("Kaori")).toBe("Kaori");
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

describe("parseRiotIdInput", () => {
  test("what a player types in the search", () => {
    expect(parseRiotIdInput("Kaori#EUW")).toEqual({ gameName: "Kaori", tagLine: "EUW" });
    expect(parseRiotIdInput("  Velkoz Enjoyer # BZH ")).toEqual({ gameName: "Velkoz Enjoyer", tagLine: "BZH" });
  });

  test("splits on the last #", () => {
    expect(parseRiotIdInput("We#are#1234")).toEqual({ gameName: "We#are", tagLine: "1234" });
  });

  test("no #, no name or a wrong tag: null", () => {
    expect(parseRiotIdInput("Kaori")).toBeNull();
    expect(parseRiotIdInput("#EUW")).toBeNull();
    expect(parseRiotIdInput("Kaori#E")).toBeNull();
    expect(parseRiotIdInput("Kaori#TOOLONG")).toBeNull();
  });
});
