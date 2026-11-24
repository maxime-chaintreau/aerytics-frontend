import { expect, test } from "vitest";
import { championRoute, matchRoute, profileRoute } from "@/router/links";

const kaori = { region: "euw", riotId: { gameName: "Kaori", tagLine: "EUW" } } as const;

test("profile and match links use the Riot ID slug", () => {
  expect(profileRoute(kaori)).toEqual({ name: "profile", params: { region: "euw", riotId: "Kaori-EUW" } });
  expect(matchRoute(kaori, "EUW1_1")).toEqual({ name: "match", params: { region: "euw", riotId: "Kaori-EUW", matchId: "EUW1_1" } });
});

test("champion link keeps the context's role and rank, defaults stay out of the URL", () => {
  const ahri = { id: "Ahri" };
  expect(championRoute(ahri)).toEqual({ name: "champion", params: { champion: "ahri" }, query: {} });
  expect(championRoute(ahri, { role: "BOTTOM", tier: null }).query).toEqual({ role: "adc", tier: "all" });
  expect(championRoute(ahri, { tier: "EMERALD" }).query).toEqual({});
});
