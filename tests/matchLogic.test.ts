import { describe, expect, test } from "vitest";
import type { MatchDetail, MatchParticipant, TeamSide } from "@/types/match";
import type { Role } from "@/types/riot";
import { focusedParticipant, laneOpponent, teamOf, upgradedSpell } from "@/features/match/matchLogic";

const ROLES: Role[] = ["TOP", "JUNGLE", "MID", "BOTTOM", "SUPPORT"];

const player = (side: TeamSide, role: Role) => ({ puuid: `${side}-${role}`, side, role }) as MatchParticipant;

const match = {
  matchId: "EUW1_1",
  focus: { puuid: "RED-MID", lpChange: -18 },
  teams: [
    { side: "BLUE", win: true },
    { side: "RED", win: false },
  ],
  participants: [...ROLES.map((role) => player("BLUE", role)), ...ROLES.map((role) => player("RED", role))],
} as unknown as MatchDetail;

describe("focusedParticipant", () => {
  test("finds the page's player", () => {
    expect(focusedParticipant(match).puuid).toBe("RED-MID");
  });

  test("throws if the player is not in the game", () => {
    expect(() => focusedParticipant({ ...match, focus: { puuid: "nobody", lpChange: null } })).toThrow();
  });
});

test("laneOpponent: same role, other team", () => {
  expect(laneOpponent(match, focusedParticipant(match))?.puuid).toBe("BLUE-MID");
});

test("teamOf: the team and its 5 players", () => {
  const { team, players } = teamOf(match, "BLUE");
  expect(team.win).toBe(true);
  expect(players.map(({ role }) => role)).toEqual(ROLES);
});

test("upgradedSpell: only Top, quest completed, with Teleport", () => {
  const top: Pick<MatchParticipant, "role" | "roleQuest" | "summonerSpells"> = {
    role: "TOP",
    roleQuest: { completed: true, itemId: 1221 },
    summonerSpells: [4, 12],
  };
  expect(upgradedSpell(top)).toBe(12);
  expect(upgradedSpell({ ...top, roleQuest: { completed: false, itemId: 1200 } })).toBeNull();
  expect(upgradedSpell({ ...top, summonerSpells: [4, 14] })).toBeNull(); // no Teleport: 1220 in the slot instead
  expect(upgradedSpell({ ...top, role: "MID" })).toBeNull();
});
