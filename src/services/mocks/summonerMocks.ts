// Fake backend for development. Only "Kaori#EUW" exists: any other player
// returns a 404, so the "player not found" state can be tested too.
import type { ChampionPoolEntry, LpHistoryPoint, MatchPage, MatchSummary, ProfileSummary } from "@/types/profile";
import type { Division, Region, RiotId, Tier } from "@/types/riot";
import { HttpError } from "../http";

const LATENCY_MS = 400;
const DAY_MS = 86_400_000;

const CHAMPION = { AHRI: 103, SYNDRA: 134, ORIANNA: 61, EKKO: 245, ZED: 238, YASUO: 157, VIKTOR: 112 };

/** Simulates network latency so loading states are visible. */
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY_MS));
}

function assertKnownPlayer(region: Region, { gameName, tagLine }: RiotId) {
  const known = region === "euw" && gameName.toLowerCase() === "kaori" && tagLine.toLowerCase() === "euw";
  if (!known) throw new HttpError(404, "Player not found");
}

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/** 30 days of history, from Platinum I 74 LP to Emerald II 48 LP (+174 LP). */
function buildLpHistory(): LpHistoryPoint[] {
  // LP counted from Platinum I 0 LP: every 100 LP is one division up
  const DIVISIONS: [Tier, Division][] = [
    ["PLATINUM", "I"],
    ["EMERALD", "IV"],
    ["EMERALD", "III"],
    ["EMERALD", "II"],
  ];
  const START = 74;
  const END = 348;

  return Array.from({ length: 30 }, (_, day) => {
    const total = Math.round(START + ((END - START) * day) / 29);
    const step = Math.min(Math.floor(total / 100), DIVISIONS.length - 1);
    const [tier, division] = DIVISIONS[step]!;
    const date = new Date(Date.now() - (29 - day) * DAY_MS).toISOString().slice(0, 10);
    return { date, rank: { tier, division, lp: total - step * 100 } };
  });
}

export async function getProfile(region: Region, riotId: RiotId): Promise<ProfileSummary> {
  assertKnownPlayer(region, riotId);
  return delay({
    puuid: "mock-puuid-kaori",
    region,
    riotId: { gameName: "Kaori", tagLine: "EUW" },
    profileIconId: 5367,
    mainRole: "MID",
    mainChampionId: CHAMPION.AHRI,
    rankedGames: 112,
    rank: { tier: "EMERALD", division: "II", lp: 48 },
    streak: { result: "WIN", count: 3 },
    stats: { winrate: 0.54, kda: 3.4, csPerMin: 7.1, visionPerMin: 0.9 },
    lpHistory: buildLpHistory(),
    benchmark: {
      tier: "EMERALD",
      role: "MID",
      values: [
        { metric: "csPerMin", value: 7.1, average: 6.8 },
        { metric: "visionPerMin", value: 0.9, average: 1.1 },
        { metric: "damagePerMin", value: 742, average: 690 },
        { metric: "deathsPerGame", value: 4.6, average: 4.2 },
        { metric: "killParticipation", value: 0.61, average: 0.58 },
      ],
    },
  });
}

export async function getChampionPool(region: Region, riotId: RiotId): Promise<ChampionPoolEntry[]> {
  assertKnownPlayer(region, riotId);
  return delay([
    { championId: CHAMPION.AHRI, games: 46, winrate: 0.57, kda: 3.8, csPerMin: 7.4 },
    { championId: CHAMPION.SYNDRA, games: 22, winrate: 0.5, kda: 3.1, csPerMin: 7.0 },
    { championId: CHAMPION.ORIANNA, games: 18, winrate: 0.56, kda: 2.9, csPerMin: 6.9 },
    { championId: CHAMPION.EKKO, games: 14, winrate: 0.43, kda: 2.6, csPerMin: 6.5 },
  ]);
}

const ALL_MATCHES: MatchSummary[] = [
  {
    matchId: "EUW1_7000000010",
    result: "LOSS",
    lpChange: -18,
    championId: CHAMPION.AHRI,
    opponentChampionId: CHAMPION.ZED,
    kills: 4,
    deaths: 6,
    assists: 7,
    cs: 214,
    items: [2503, 3020, 3100, 4645, 0, 0, 3364],
    durationSeconds: 1864,
    playedAt: minutesAgo(25 + 31),
  },
  {
    matchId: "EUW1_7000000009",
    result: "WIN",
    lpChange: 21,
    championId: CHAMPION.AHRI,
    opponentChampionId: CHAMPION.YASUO,
    kills: 9,
    deaths: 2,
    assists: 11,
    cs: 231,
    items: [2503, 3020, 3100, 4645, 3089, 0, 3364],
    durationSeconds: 1660,
    playedAt: minutesAgo(120 + 28),
  },
  {
    matchId: "EUW1_7000000008",
    result: "WIN",
    lpChange: 20,
    championId: CHAMPION.SYNDRA,
    opponentChampionId: CHAMPION.EKKO,
    kills: 7,
    deaths: 3,
    assists: 8,
    cs: 248,
    items: [6655, 3020, 4645, 3157, 0, 0, 3364],
    durationSeconds: 1992,
    playedAt: minutesAgo(26 * 60),
  },
  {
    matchId: "EUW1_7000000007",
    result: "WIN",
    lpChange: 22,
    championId: CHAMPION.ORIANNA,
    opponentChampionId: CHAMPION.VIKTOR,
    kills: 6,
    deaths: 1,
    assists: 14,
    cs: 205,
    items: [6655, 3020, 3157, 0, 0, 0, 3364],
    durationSeconds: 1541,
    playedAt: minutesAgo(28 * 60),
  },
  {
    matchId: "EUW1_7000000006",
    result: "LOSS",
    lpChange: -17,
    championId: CHAMPION.EKKO,
    opponentChampionId: CHAMPION.SYNDRA,
    kills: 3,
    deaths: 7,
    assists: 4,
    cs: 176,
    items: [3152, 3020, 4645, 0, 0, 0, 3364],
    durationSeconds: 1720,
    playedAt: minutesAgo(30 * 60),
  },
];

export async function getMatches(region: Region, riotId: RiotId, start: number, count: number): Promise<MatchPage> {
  assertKnownPlayer(region, riotId);
  const matches = ALL_MATCHES.slice(start, start + count);
  const next = start + count;
  return delay({ matches, nextStart: next < ALL_MATCHES.length ? next : null });
}
