import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createApp, effectScope, nextTick, ref } from "vue";
import { createPinia } from "pinia";
import { PiniaColada } from "@pinia/colada";
import type { PlayerKey, RoleFilter } from "@/types/riot";
import { summonerService } from "@/services/summonerService";
import { profileKeys, useProfileSummary } from "@/composables/useProfileQueries";

const kaori: PlayerKey = { region: "euw", riotId: { gameName: "Kaori", tagLine: "EUW" } };
const other: PlayerKey = { region: "euw", riotId: { gameName: "Other", tagLine: "EUW" } };

function withApp<T>(setup: () => T): T {
  const app = createApp({});
  app.use(createPinia());
  app.use(PiniaColada);
  return app.runWithContext(() => effectScope().run(setup)!);
}

const flush = async () => {
  for (let i = 0; i < 5; i++) await nextTick();
  await new Promise((r) => setTimeout(r, 0));
};

beforeEach(() => {
  vi.spyOn(summonerService, "getProfile").mockImplementation(async (_r, riotId) => ({ riotId }) as never);
});
afterEach(() => vi.restoreAllMocks());

test("keys are case-insensitive and nested under the player", () => {
  const lower = { region: "euw", riotId: { gameName: "kaori", tagLine: "euw" } } as const;
  expect(profileKeys.summary(kaori, "MAIN")).toEqual(profileKeys.summary(lower, "MAIN"));
  expect(profileKeys.summary(kaori, "MAIN").slice(0, 3)).toEqual(profileKeys.player(kaori));
});

test("loads the player and switches when the player changes", async () => {
  const player = ref<PlayerKey | null>(kaori);
  const { data } = withApp(() => useProfileSummary(player, "MAIN"));

  await flush();
  expect(data.value?.riotId.gameName).toBe("Kaori");

  player.value = other;
  await flush();
  expect(data.value?.riotId.gameName).toBe("Other");
  expect(summonerService.getProfile).toHaveBeenCalledTimes(2);
});

test("sends nothing when there is no player", async () => {
  withApp(() => useProfileSummary(null, "MAIN"));
  await flush();
  expect(summonerService.getProfile).not.toHaveBeenCalled();
});

test("two components asking for the same player share one request", async () => {
  withApp(() => {
    useProfileSummary(kaori, "MAIN");
    useProfileSummary(kaori, "MAIN");
  });
  await flush();
  expect(summonerService.getProfile).toHaveBeenCalledTimes(1);
});

test("each role has its own cache entry", async () => {
  const role = ref<RoleFilter>("MAIN");
  withApp(() => useProfileSummary(kaori, role));
  await flush();

  role.value = "TOP";
  await flush();
  role.value = "MAIN";
  await flush();

  expect(vi.mocked(summonerService.getProfile).mock.calls.map((call) => call[2])).toEqual(["MAIN", "TOP"]);
});
