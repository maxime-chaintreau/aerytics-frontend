import type { MatchParticipant, ObjectiveName, StatKey } from "@/types/match";
import { formatDecimal, formatDuration, formatInteger, formatPercent } from "@/utils/format";

type StatFormat = "integer" | "decimal1" | "decimal2" | "percent" | "duration" | "yesNo";

interface StatDefinition {
  label: string;
  format: StatFormat;
}

export const STAT_DEFINITIONS: Record<StatKey, StatDefinition> = {
  // combat
  kills: { label: "Éliminations", format: "integer" },
  deaths: { label: "Morts", format: "integer" },
  assists: { label: "Assistances", format: "integer" },
  kda: { label: "KDA", format: "decimal2" },
  killParticipation: { label: "Participation aux kills", format: "percent" },
  soloKills: { label: "Solo kills", format: "integer" },
  largestKillingSpree: { label: "Plus grande série", format: "integer" },
  killingSprees: { label: "Séries d'éliminations", format: "integer" },
  largestMultiKill: { label: "Plus grand multikill", format: "integer" },
  doubleKills: { label: "Doublés", format: "integer" },
  tripleKills: { label: "Triplés", format: "integer" },
  quadraKills: { label: "Quadruplés", format: "integer" },
  pentaKills: { label: "Pentakills", format: "integer" },
  largestCriticalStrike: { label: "Plus gros coup critique", format: "integer" },
  outnumberedKills: { label: "Kills en infériorité", format: "integer" },
  killsUnderOwnTurret: { label: "Kills sous sa tour", format: "integer" },
  killsNearEnemyTurret: { label: "Kills sous tour ennemie", format: "integer" },
  firstBloodKill: { label: "Premier sang", format: "yesNo" },
  firstBloodAssist: { label: "Assistance premier sang", format: "yesNo" },
  timeSpentDead: { label: "Temps mort", format: "duration" },
  longestTimeAlive: { label: "Plus longue survie", format: "duration" },

  // damage
  damageToChampions: { label: "Dégâts aux champions", format: "integer" },
  physicalDamageToChampions: { label: "Dégâts physiques aux champions", format: "integer" },
  magicDamageToChampions: { label: "Dégâts magiques aux champions", format: "integer" },
  trueDamageToChampions: { label: "Dégâts bruts aux champions", format: "integer" },
  damagePerMinute: { label: "Dégâts / min", format: "integer" },
  teamDamagePercentage: { label: "Part des dégâts de l'équipe", format: "percent" },
  totalDamageDealt: { label: "Dégâts totaux infligés", format: "integer" },
  damageTaken: { label: "Dégâts subis", format: "integer" },
  physicalDamageTaken: { label: "Dégâts physiques subis", format: "integer" },
  magicDamageTaken: { label: "Dégâts magiques subis", format: "integer" },
  trueDamageTaken: { label: "Dégâts bruts subis", format: "integer" },
  damageTakenTeamPercentage: { label: "Part des dégâts subis", format: "percent" },
  damageSelfMitigated: { label: "Dégâts atténués", format: "integer" },
  damageToBuildings: { label: "Dégâts aux bâtiments", format: "integer" },
  damageToTurrets: { label: "Dégâts aux tours", format: "integer" },
  damageToObjectives: { label: "Dégâts aux objectifs", format: "integer" },

  // utility
  healingOnTeammates: { label: "Soins sur alliés", format: "integer" },
  shieldingOnTeammates: { label: "Boucliers sur alliés", format: "integer" },
  totalHeal: { label: "Soins totaux", format: "integer" },
  effectiveHealAndShielding: { label: "Soins et boucliers utiles", format: "integer" },
  crowdControlSeconds: { label: "Contrôles infligés (s)", format: "integer" },
  totalTimeCCDealt: { label: "Durée totale des contrôles (s)", format: "integer" },
  enemyChampionImmobilizations: { label: "Ennemis immobilisés", format: "integer" },
  saveAllyFromDeath: { label: "Alliés sauvés", format: "integer" },

  // economy
  gold: { label: "Or gagné", format: "integer" },
  goldSpent: { label: "Or dépensé", format: "integer" },
  goldPerMinute: { label: "Or / min", format: "integer" },
  bountyGold: { label: "Or des primes", format: "integer" },
  champExperience: { label: "Expérience", format: "integer" },

  // farming
  cs: { label: "CS", format: "integer" },
  csPerMinute: { label: "CS / min", format: "decimal1" },
  laneMinions: { label: "Sbires", format: "integer" },
  neutralMinions: { label: "Monstres", format: "integer" },
  allyJungleMonsters: { label: "Monstres de sa jungle", format: "integer" },
  enemyJungleMonsters: { label: "Monstres de la jungle ennemie", format: "integer" },
  laneMinionsFirst10Minutes: { label: "Sbires à 10 min", format: "integer" },
  jungleCsBefore10Minutes: { label: "Monstres à 10 min", format: "integer" },
  scuttleCrabKills: { label: "Carapateurs", format: "integer" },

  // laning
  maxCsAdvantageOnLaneOpponent: { label: "Avance max en CS", format: "integer" },
  maxLevelLeadLaneOpponent: { label: "Avance max en niveaux", format: "integer" },
  laningPhaseGoldExpAdvantage: { label: "Lane gagnée (or + XP)", format: "yesNo" },
  turretPlatesTaken: { label: "Plaques prises", format: "integer" },

  // objectives
  turretKills: { label: "Tours détruites", format: "integer" },
  turretTakedowns: { label: "Participations aux tours", format: "integer" },
  inhibitorTakedowns: { label: "Inhibiteurs", format: "integer" },
  dragonTakedowns: { label: "Dragons", format: "integer" },
  baronTakedowns: { label: "Barons", format: "integer" },
  riftHeraldTakedowns: { label: "Hérauts", format: "integer" },
  voidGrubTakedowns: { label: "Larves du néant", format: "integer" },
  epicMonsterSteals: { label: "Objectifs volés", format: "integer" },
  firstTowerKill: { label: "Première tour", format: "yesNo" },

  // vision
  visionScore: { label: "Score de vision", format: "integer" },
  visionScorePerMinute: { label: "Vision / min", format: "decimal2" },
  wardsPlaced: { label: "Balises posées", format: "integer" },
  wardsKilled: { label: "Balises détruites", format: "integer" },
  controlWardsBought: { label: "Balises de contrôle achetées", format: "integer" },
  controlWardsPlaced: { label: "Balises de contrôle posées", format: "integer" },
  stealthWardsPlaced: { label: "Balises furtives posées", format: "integer" },
  controlWardTimeCoverageInRiverOrEnemyHalf: { label: "Contrôle de la rivière / moitié ennemie", format: "percent" },
  wardTakedowns: { label: "Participations aux balises détruites", format: "integer" },

  // mechanics
  skillshotsHit: { label: "Skillshots touchés", format: "integer" },
  skillshotsDodged: { label: "Skillshots esquivés", format: "integer" },
  qCasts: { label: "Utilisations du A", format: "integer" },
  wCasts: { label: "Utilisations du Z", format: "integer" },
  eCasts: { label: "Utilisations du E", format: "integer" },
  rCasts: { label: "Utilisations du R", format: "integer" },
  summoner1Casts: { label: "Sort d'invocateur 1", format: "integer" },
  summoner2Casts: { label: "Sort d'invocateur 2", format: "integer" },

  // pings
  allInPings: { label: "Ping « Tous dessus »", format: "integer" },
  assistMePings: { label: "Ping « Aidez-moi »", format: "integer" },
  basicPings: { label: "Ping simple", format: "integer" },
  commandPings: { label: "Ping « Commande »", format: "integer" },
  dangerPings: { label: "Ping « Danger »", format: "integer" },
  enemyMissingPings: { label: "Ping « Ennemi disparu »", format: "integer" },
  enemyVisionPings: { label: "Ping « Vision ennemie »", format: "integer" },
  getBackPings: { label: "Ping « Reculez »", format: "integer" },
  holdPings: { label: "Ping « Attendez »", format: "integer" },
  needVisionPings: { label: "Ping « Besoin de vision »", format: "integer" },
  onMyWayPings: { label: "Ping « J'arrive »", format: "integer" },
  pushPings: { label: "Ping « Poussez »", format: "integer" },
  visionClearedPings: { label: "Ping « Vision nettoyée »", format: "integer" },
};

export function formatStat(key: StatKey, value: number): string {
  switch (STAT_DEFINITIONS[key].format) {
    case "integer":
      return formatInteger(value);
    case "decimal1":
      return formatDecimal(value, 1);
    case "decimal2":
      return formatDecimal(value, 2);
    case "percent":
      return formatPercent(value);
    case "duration":
      return formatDuration(value);
    case "yesNo":
      return value > 0 ? "Oui" : "—";
  }
}

// ---------- Scoreboard presets ----------

/**
 * A column of the scoreboard:
 *  - "stat": one number, with a short header (full name on hover); `bar` adds a bar, `lowerIsBetter` for deaths...
 *  - the others are composed cells (several numbers in one place)
 */
export type ScoreboardColumn =
  | { kind: "stat"; key: StatKey; short: string; bar?: boolean; lowerIsBetter?: boolean }
  | { kind: "kda" }
  | { kind: "combat" } // damage dealt, taken, heals + shields: 3 bars
  | { kind: "damageTypes" } // total damage, physical / magic / true split
  | { kind: "vision" }
  | { kind: "cs" }
  | { kind: "items" };

export type ScoreboardPresetId = "general" | "combat" | "damage" | "economy" | "support" | "vision" | "objectives" | "mechanics" | "pings";

export interface ScoreboardPreset {
  id: ScoreboardPresetId;
  label: string;
  columns: ScoreboardColumn[];
}

const stat = (key: StatKey, short: string, options: { bar?: boolean; lowerIsBetter?: boolean } = {}): ScoreboardColumn => ({
  kind: "stat",
  key,
  short,
  ...options,
});

export const SCOREBOARD_PRESETS: ScoreboardPreset[] = [
  {
    id: "general",
    label: "Général",
    columns: [{ kind: "kda" }, { kind: "combat" }, { kind: "vision" }, { kind: "cs" }, { kind: "items" }],
  },
  {
    id: "combat",
    label: "Combat",
    columns: [
      stat("kills", "Kills"),
      stat("deaths", "Morts", { lowerIsBetter: true }),
      stat("assists", "Assists"),
      stat("killParticipation", "KP"),
      stat("soloKills", "Solo kills"),
      stat("largestMultiKill", "Multikill max"),
      stat("largestKillingSpree", "Série max"),
      stat("outnumberedKills", "En infériorité"),
      stat("timeSpentDead", "Temps mort", { lowerIsBetter: true }),
    ],
  },
  {
    id: "damage",
    label: "Dégâts",
    columns: [
      { kind: "damageTypes" },
      stat("teamDamagePercentage", "% équipe"),
      stat("damagePerMinute", "/ min"),
      stat("damageTaken", "Subis"),
      stat("damageSelfMitigated", "Atténués"),
      stat("damageToTurrets", "Tours"),
      stat("damageToObjectives", "Objectifs"),
    ],
  },
  {
    id: "economy",
    label: "Économie",
    columns: [
      stat("gold", "Or", { bar: true }),
      stat("goldPerMinute", "Or / min"),
      stat("goldSpent", "Dépensé"),
      stat("bountyGold", "Primes"),
      stat("cs", "CS"),
      stat("csPerMinute", "CS / min"),
      stat("laneMinionsFirst10Minutes", "CS à 10 min"),
      stat("maxCsAdvantageOnLaneOpponent", "Avance CS max"),
      stat("turretPlatesTaken", "Plaques"),
    ],
  },
  {
    id: "support",
    label: "Soutien",
    columns: [
      stat("effectiveHealAndShielding", "Soins + boucliers utiles", { bar: true }),
      stat("healingOnTeammates", "Soins alliés"),
      stat("shieldingOnTeammates", "Boucliers alliés"),
      stat("totalHeal", "Soins totaux"),
      stat("crowdControlSeconds", "Contrôles (s)"),
      stat("enemyChampionImmobilizations", "Immobilisations"),
      stat("saveAllyFromDeath", "Alliés sauvés"),
    ],
  },
  {
    id: "vision",
    label: "Vision",
    columns: [
      stat("visionScore", "Score", { bar: true }),
      stat("visionScorePerMinute", "/ min"),
      stat("wardsPlaced", "Posées"),
      stat("wardsKilled", "Détruites"),
      stat("controlWardsBought", "Contrôle achetées"),
      stat("controlWardsPlaced", "Contrôle posées"),
      stat("controlWardTimeCoverageInRiverOrEnemyHalf", "Contrôle rivière"),
    ],
  },
  {
    id: "objectives",
    label: "Objectifs",
    columns: [
      stat("damageToObjectives", "Dégâts objectifs", { bar: true }),
      stat("turretKills", "Tours"),
      stat("turretTakedowns", "Participations tours"),
      stat("inhibitorTakedowns", "Inhibiteurs"),
      stat("dragonTakedowns", "Dragons"),
      stat("voidGrubTakedowns", "Larves"),
      stat("riftHeraldTakedowns", "Héraut"),
      stat("baronTakedowns", "Baron"),
      stat("epicMonsterSteals", "Vols"),
    ],
  },
  {
    id: "mechanics",
    label: "Mécaniques",
    columns: [
      stat("skillshotsHit", "Skillshots touchés"),
      stat("skillshotsDodged", "Skillshots esquivés"),
      stat("qCasts", "A"),
      stat("wCasts", "Z"),
      stat("eCasts", "E"),
      stat("rCasts", "R"),
      stat("summoner1Casts", "Sort 1"),
      stat("summoner2Casts", "Sort 2"),
    ],
  },
  {
    id: "pings",
    label: "Pings",
    columns: [
      stat("enemyMissingPings", "Disparu"),
      stat("onMyWayPings", "J'arrive"),
      stat("assistMePings", "Aide"),
      stat("dangerPings", "Danger"),
      stat("getBackPings", "Reculez"),
      stat("allInPings", "Tous dessus"),
      stat("pushPings", "Poussez"),
      stat("holdPings", "Attendez"),
      stat("needVisionPings", "Besoin vision"),
      stat("enemyVisionPings", "Vision ennemie"),
      stat("commandPings", "Commande"),
      stat("basicPings", "Simple"),
    ],
  },
];

// ---------- Values used by the composed cells ----------

export function healAndShield(participant: MatchParticipant): number {
  return participant.stats.totalHeal + participant.stats.shieldingOnTeammates;
}

export function barRatios(participants: MatchParticipant[], valueOf: (participant: MatchParticipant) => number) {
  const max = Math.max(0, ...participants.map(valueOf));
  return new Map(participants.map((participant) => [participant.puuid, max > 0 ? valueOf(participant) / max : 0]));
}

export function bestValue(participants: MatchParticipant[], key: StatKey, lowerIsBetter = false): number | null {
  const values = participants.map(({ stats }) => stats[key]);
  const best = lowerIsBetter ? Math.min(...values) : Math.max(...values);
  return Math.max(...values) === 0 ? null : best;
}

// ---------- Team objectives ----------

/** in the game's order of importance; `first`: how the "first one" is said */
export const TEAM_OBJECTIVES: { name: Exclude<ObjectiveName, "champion">; label: string; first: string }[] = [
  { name: "tower", label: "Tours", first: "première tour" },
  { name: "inhibitor", label: "Inhibiteurs", first: "premier inhibiteur" },
  { name: "dragon", label: "Dragons", first: "premier dragon" },
  { name: "voidGrubs", label: "Larves du Néant", first: "premières larves" },
  { name: "riftHerald", label: "Héraut", first: "premier héraut" },
  { name: "baron", label: "Barons", first: "premier baron" },
];

// ---------- Pings ----------

export type PingType = "allIn" | "assistMe" | "basic" | "command" | "danger" | "enemyMissing" | "enemyVision" | "getBack" | "hold" | "needVision" | "onMyWay" | "push";

export function pingTypeOf(key: StatKey): PingType | null {
  return key.endsWith("Pings") ? (key.slice(0, -"Pings".length) as PingType) : null;
}

// ---------- Objectives ----------

const OBJECTIVE_STATS: Partial<Record<StatKey, Exclude<ObjectiveName, "champion">>> = {
  turretKills: "tower",
  inhibitorTakedowns: "inhibitor",
  dragonTakedowns: "dragon",
  voidGrubTakedowns: "voidGrubs",
  riftHeraldTakedowns: "riftHerald",
  baronTakedowns: "baron",
};

export function objectiveOf(key: StatKey): Exclude<ObjectiveName, "champion"> | null {
  return OBJECTIVE_STATS[key] ?? null;
}
