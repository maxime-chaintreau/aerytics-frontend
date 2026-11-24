import { expect, test } from "vitest";
import { statsTierFor, tierFromSlug, tierToSlug } from "@/utils/statsTier";

test("tier from the URL: absent = Emerald+, all = every rank, unknown = default", () => {
  expect(tierFromSlug(undefined)).toBe("EMERALD");
  expect(tierFromSlug("all")).toBeNull();
  expect(tierFromSlug("master")).toBe("MASTER");
  expect(tierFromSlug("iron")).toBe("EMERALD");
});

test("tier to the URL: the default is not written", () => {
  expect(tierToSlug("EMERALD")).toBeUndefined();
  expect(tierToSlug(null)).toBe("all");
  expect(tierToSlug("DIAMOND")).toBe("diamond");
});

test("a player's tier maps to the closest filter that includes it", () => {
  expect(statsTierFor("GOLD")).toBeNull();
  expect(statsTierFor("EMERALD")).toBe("EMERALD");
  expect(statsTierFor("DIAMOND")).toBe("DIAMOND");
  expect(statsTierFor("CHALLENGER")).toBe("MASTER");
  expect(statsTierFor(null)).toBeNull();
});
