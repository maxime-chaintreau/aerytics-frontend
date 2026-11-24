import type { MatchResult, Rank, RiotId, Role, RoleQuest } from "./riot";

export type TeamSide = "BLUE" | "RED";

export type Queue = "RANKED_SOLO" | "RANKED_FLEX" | "NORMAL_DRAFT";

export interface RunePage {
  primaryStyle: number; // 8000 Precision, 8100 Domination, 8200 Sorcery, 8300 Inspiration, 8400 Resolve
  primary: number[];
  subStyle: number;
  secondary: number[];
  shards: number[];
}

export interface ParticipantStats {
  // combat
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  killParticipation: number;
  soloKills: number;
  largestKillingSpree: number;
  killingSprees: number;
  largestMultiKill: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  largestCriticalStrike: number;
  outnumberedKills: number;
  killsUnderOwnTurret: number;
  killsNearEnemyTurret: number;
  firstBloodKill: number;
  firstBloodAssist: number;
  timeSpentDead: number;
  longestTimeAlive: number;

  // damage
  damageToChampions: number;
  physicalDamageToChampions: number;
  magicDamageToChampions: number;
  trueDamageToChampions: number;
  damagePerMinute: number;
  teamDamagePercentage: number;
  totalDamageDealt: number;
  damageTaken: number;
  physicalDamageTaken: number;
  magicDamageTaken: number;
  trueDamageTaken: number;
  damageTakenTeamPercentage: number;
  damageSelfMitigated: number;
  damageToBuildings: number;
  damageToTurrets: number;
  damageToObjectives: number;

  // utility
  healingOnTeammates: number;
  shieldingOnTeammates: number;
  totalHeal: number;
  effectiveHealAndShielding: number;
  crowdControlSeconds: number;
  totalTimeCCDealt: number;
  enemyChampionImmobilizations: number;
  saveAllyFromDeath: number;

  // economy
  gold: number;
  goldSpent: number;
  goldPerMinute: number;
  bountyGold: number;
  champExperience: number;

  // farming
  cs: number;
  csPerMinute: number;
  laneMinions: number;
  neutralMinions: number;
  allyJungleMonsters: number;
  enemyJungleMonsters: number;
  laneMinionsFirst10Minutes: number;
  jungleCsBefore10Minutes: number;
  scuttleCrabKills: number;

  // laning
  maxCsAdvantageOnLaneOpponent: number;
  maxLevelLeadLaneOpponent: number;
  laningPhaseGoldExpAdvantage: number;
  turretPlatesTaken: number;

  // objectives
  turretKills: number;
  turretTakedowns: number;
  inhibitorTakedowns: number;
  dragonTakedowns: number;
  baronTakedowns: number;
  riftHeraldTakedowns: number;
  voidGrubTakedowns: number;
  epicMonsterSteals: number;
  firstTowerKill: number;

  // vision
  visionScore: number;
  visionScorePerMinute: number;
  wardsPlaced: number;
  wardsKilled: number;
  controlWardsBought: number;
  controlWardsPlaced: number;
  stealthWardsPlaced: number;
  controlWardTimeCoverageInRiverOrEnemyHalf: number;
  wardTakedowns: number;

  // mechanics
  skillshotsHit: number;
  skillshotsDodged: number;
  qCasts: number;
  wCasts: number;
  eCasts: number;
  rCasts: number;
  summoner1Casts: number;
  summoner2Casts: number;

  // pings
  allInPings: number;
  assistMePings: number;
  basicPings: number;
  commandPings: number;
  dangerPings: number;
  enemyMissingPings: number;
  enemyVisionPings: number;
  getBackPings: number;
  holdPings: number;
  needVisionPings: number;
  onMyWayPings: number;
  pushPings: number;
  visionClearedPings: number;
}

export type StatKey = keyof ParticipantStats;

export interface MatchParticipant {
  puuid: string;
  riotId: RiotId;
  summonerLevel: number;
  profileIconId: number;
  side: TeamSide;
  role: Role;
  championId: number;
  championLevel: number;
  summonerSpells: [number, number];
  runes: RunePage;
  items: number[];
  roleQuest: RoleQuest;
  rank: Rank | null;
  mastery: { level: number; points: number } | null;
  stats: ParticipantStats;
}

export interface ObjectiveStat {
  first: boolean;
  kills: number;
}

export type ObjectiveName = "champion" | "tower" | "inhibitor" | "dragon" | "voidGrubs" | "riftHerald" | "baron";

export interface MatchTeam {
  side: TeamSide;
  win: boolean;
  bans: number[];
  objectives: Record<ObjectiveName, ObjectiveStat>;
}

export interface MatchDetail {
  matchId: string;
  queue: Queue;
  patch: string;
  gameVersion: string;
  startedAt: string;
  durationSeconds: number;
  result: MatchResult;
  remake: boolean;
  endedInSurrender: boolean;
  /** the player whose page this is */
  focus: { puuid: string; lpChange: number | null };
  teams: [MatchTeam, MatchTeam];
  participants: MatchParticipant[];
}

/** the ping kinds counted per player: the "<type>Pings" stats, and the icon files' names */
export type PingType = "allIn" | "assistMe" | "basic" | "command" | "danger" | "enemyMissing" | "enemyVision" | "getBack" | "hold" | "needVision" | "onMyWay" | "push";
