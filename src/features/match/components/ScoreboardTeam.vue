<script setup lang="ts">
import { computed, useId } from "vue";
import type { MatchParticipant, MatchTeam } from "@/types/match";
import type { Region } from "@/types/riot";
import { useStaticDataStore } from "@/stores/staticData";
import { STAT_DEFINITIONS, type ScoreboardColumn, barRatios, bestValue, formatStat, healAndShield } from "@/features/match/matchStats";
import { formatRankName, formatResult } from "@/utils/labels";
import { formatCompact, formatDecimal, formatInteger, formatPercent } from "@/utils/format";
import { formatRiotId, toRiotIdSlug } from "@/utils/riotId";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import ItemSlots from "@/components/game/ItemSlots.vue";
import RuneIcon from "@/components/game/icon/RuneIcon.vue";
import SummonerSpellIcon from "@/components/game/icon/SummonerSpellIcon.vue";

const props = defineProps<{
  team: MatchTeam;
  players: MatchParticipant[];
  /** the 10 players: bars and "best of the game" compare both teams */
  allPlayers: MatchParticipant[];
  columns: ScoreboardColumn[];
  /** the page's player: highlighted row */
  focusPuuid: string;
  region: Region;
  minutes: number;
  remake: boolean;
}>();

defineEmits<{ openRunes: [participant: MatchParticipant] }>();

const staticData = useStaticDataStore();

const SIDE_LABELS = { BLUE: "Équipe bleue", RED: "Équipe rouge" } as const;

const headerId = useId();

/** fixed widths per kind of column: both tables line up, whatever their content */
const COLUMN_WIDTHS: Record<ScoreboardColumn["kind"], number> = {
  stat: 72,
  kda: 128,
  combat: 200,
  damageTypes: 170,
  vision: 128,
  cs: 84,
  items: 224,
};

const result = computed(() => (props.remake ? "REMAKE" : props.team.win ? "WIN" : "LOSS"));

/** the table never squeezes below the sum of its columns: it scrolls instead */
const minWidth = computed(() => 112 + 180 + props.columns.reduce((sum, column) => sum + COLUMN_WIDTHS[column.kind], 0));

// ---------- team totals ----------

const sum = (valueOf: (player: MatchParticipant) => number) => props.players.reduce((total, player) => total + valueOf(player), 0);

const totals = computed(() => ({
  kills: sum(({ stats }) => stats.kills),
  deaths: sum(({ stats }) => stats.deaths),
  assists: sum(({ stats }) => stats.assists),
  gold: sum(({ stats }) => stats.gold),
}));

// ---------- bars and highlights, over the whole game ----------

const ratios = computed<Record<string, Map<string, number>>>(() => ({
  dealt: barRatios(props.allPlayers, ({ stats }) => stats.damageToChampions),
  taken: barRatios(props.allPlayers, ({ stats }) => stats.damageTaken),
  healed: barRatios(props.allPlayers, healAndShield),
  ...Object.fromEntries(props.columns.flatMap((column) => (column.kind === "stat" && column.bar ? [[column.key, barRatios(props.allPlayers, ({ stats }) => stats[column.key])]] : []))),
}));

const best = computed(() => Object.fromEntries(props.columns.flatMap((column) => (column.kind === "stat" ? [[column.key, bestValue(props.allPlayers, column.key, column.lowerIsBetter)]] : []))));

const ratio = (name: string, player: MatchParticipant) => `${(ratios.value[name]?.get(player.puuid) ?? 0) * 100}%`;

/** physical / magic / true, as shares of the player's total */
const damageShares = ({ stats }: MatchParticipant) => {
  const total = Math.max(1, stats.damageToChampions);
  return {
    physical: `${(stats.physicalDamageToChampions / total) * 100}%`,
    magic: `${(stats.magicDamageToChampions / total) * 100}%`,
    true: `${(stats.trueDamageToChampions / total) * 100}%`,
  };
};

const championName = (id: number) => staticData.champion(id)?.name ?? "Champion";

const profileLink = ({ riotId }: MatchParticipant) => ({
  name: "profile",
  params: { region: props.region, riotId: toRiotIdSlug(riotId) },
});
</script>

<template>
  <div class="team" :class="`team--${team.side.toLowerCase()}`">
    <!-- outside the scrolling box: stays in place when the table scrolls sideways -->
    <div :id="headerId" class="team__header">
      <span class="team__result" :class="`team__result--${result.toLowerCase()}`">{{ formatResult(result) }}</span>
      <span class="team__side">{{ SIDE_LABELS[team.side] }}</span>
      <span class="team__totals">
        <span>{{ totals.kills }} / {{ totals.deaths }} / {{ totals.assists }}</span>
        <span>{{ formatCompact(totals.gold) }} or</span>
      </span>
    </div>
    <div class="team__scroll">
      <!-- named by the header above (a <caption> would scroll away with the table) -->
      <table class="team__table" :style="{ minWidth: `${minWidth}px` }" :aria-labelledby="headerId">
        <colgroup>
          <col style="width: 112px" />
          <col />
          <col v-for="(column, index) in columns" :key="index" :style="{ width: `${COLUMN_WIDTHS[column.kind]}px` }" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="team__left">Champion</th>
            <th scope="col" class="team__left">Joueur</th>
            <th v-for="(column, index) in columns" :key="index" scope="col" :class="{ team__left: column.kind === 'items' }">
              <template v-if="column.kind === 'stat'">
                <!-- short header, full name on hover and for screen readers -->
                <abbr :title="STAT_DEFINITIONS[column.key].label">{{ column.short }}</abbr>
              </template>
              <template v-else-if="column.kind === 'kda'">KDA</template>
              <span v-else-if="column.kind === 'combat'" class="team__legend">
                <span class="team__dot team__dot--dealt" />Infligés <span class="team__dot team__dot--taken" />Subis <span class="team__dot team__dot--healed" />Soins
              </span>
              <span v-else-if="column.kind === 'damageTypes'" class="team__legend">
                <span class="team__dot team__dot--physical" />Phys. <span class="team__dot team__dot--magic" />Mag. <span class="team__dot team__dot--true" />Bruts
              </span>
              <template v-else-if="column.kind === 'vision'">Vision</template>
              <template v-else-if="column.kind === 'cs'">CS</template>
              <template v-else>Objets</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in players" :key="player.puuid" :class="{ 'team__row--focus': player.puuid === focusPuuid }">
            <!-- champion, level, spells, runes -->
            <td class="team__left">
              <div class="team__loadout">
                <span class="team__champion">
                  <ChampionIcon :champion-id="player.championId" :size="36" />
                  <span class="team__level">{{ player.championLevel }}</span>
                </span>
                <span class="team__pair">
                  <SummonerSpellIcon v-for="key in player.summonerSpells" :key="key" :spell-key="key" :size="17" />
                </span>
                <button type="button" class="team__pair team__runes" aria-haspopup="dialog" :title="`Runes de ${championName(player.championId)}`" @click="$emit('openRunes', player)">
                  <RuneIcon :rune-id="player.runes.primary[0]!" :size="17" decorative />
                  <RuneIcon :rune-id="player.runes.subStyle" :size="13" decorative />
                  <span class="visually-hidden">Runes de {{ championName(player.championId) }}</span>
                </button>
              </div>
            </td>

            <!-- player: link to their profile, rank -->
            <th scope="row" class="team__left team__player">
              <RouterLink :to="profileLink(player)" class="team__name" :title="formatRiotId(player.riotId)">
                {{ formatRiotId(player.riotId) }}
              </RouterLink>
              <span class="team__muted">{{ player.rank ? formatRankName(player.rank) : "Non classé" }}</span>
            </th>

            <td v-for="(column, index) in columns" :key="index" :class="{ team__left: column.kind === 'items' }">
              <!-- one number (+ bar), gold when it's the best of the game -->
              <template v-if="column.kind === 'stat'">
                <span :class="{ team__best: best[column.key] !== null && player.stats[column.key] === best[column.key] }">
                  {{ formatStat(column.key, player.stats[column.key]) }}
                </span>
                <span v-if="column.bar" class="team__bar" aria-hidden="true">
                  <span class="team__bar-fill" :style="{ inlineSize: ratio(column.key, player) }" />
                </span>
              </template>

              <template v-else-if="column.kind === 'kda'">
                <span class="team__strong">
                  {{ player.stats.kills }} / <span class="team__deaths">{{ player.stats.deaths }}</span> / {{ player.stats.assists }}
                </span>
                <span class="team__muted"> {{ formatDecimal(player.stats.kda, 2) }} KDA · {{ formatPercent(player.stats.killParticipation) }} KP </span>
              </template>

              <!-- 3 bars: dealt, taken, heals + shields -->
              <div v-else-if="column.kind === 'combat'" class="team__meters">
                <span class="team__meter" :title="`Dégâts infligés aux champions : ${formatInteger(player.stats.damageToChampions)}`">
                  <span class="team__meter-value">{{ formatInteger(player.stats.damageToChampions) }}</span>
                  <span class="team__bar"><span class="team__bar-fill team__bar-fill--dealt" :style="{ inlineSize: ratio('dealt', player) }" /></span>
                </span>
                <span class="team__meter" :title="`Dégâts subis : ${formatInteger(player.stats.damageTaken)}`">
                  <span class="team__meter-value">{{ formatInteger(player.stats.damageTaken) }}</span>
                  <span class="team__bar"><span class="team__bar-fill team__bar-fill--taken" :style="{ inlineSize: ratio('taken', player) }" /></span>
                </span>
                <span class="team__meter" :title="`Soins et boucliers : ${formatInteger(healAndShield(player))}`">
                  <span class="team__meter-value">{{ formatInteger(healAndShield(player)) }}</span>
                  <span class="team__bar"><span class="team__bar-fill team__bar-fill--healed" :style="{ inlineSize: ratio('healed', player) }" /></span>
                </span>
              </div>

              <!-- total + split by damage type (the bar's length = the total, relative to the best of the game) -->
              <template v-else-if="column.kind === 'damageTypes'">
                <span>{{ formatInteger(player.stats.damageToChampions) }}</span>
                <span
                  class="team__bar"
                  :title="`Physiques ${formatInteger(player.stats.physicalDamageToChampions)} · Magiques ${formatInteger(player.stats.magicDamageToChampions)} · Bruts ${formatInteger(player.stats.trueDamageToChampions)}`"
                >
                  <span class="team__split" :style="{ inlineSize: ratio('dealt', player) }">
                    <span class="team__split-part team__split-part--physical" :style="{ inlineSize: damageShares(player).physical }" />
                    <span class="team__split-part team__split-part--magic" :style="{ inlineSize: damageShares(player).magic }" />
                    <span class="team__split-part team__split-part--true" :style="{ inlineSize: damageShares(player).true }" />
                  </span>
                </span>
              </template>

              <template v-else-if="column.kind === 'vision'">
                <span class="team__strong">{{ player.stats.visionScore }}</span>
                <span class="team__muted">{{ player.stats.wardsPlaced }} posées · {{ player.stats.wardsKilled }} détruites</span>
              </template>

              <template v-else-if="column.kind === 'cs'">
                <span class="team__strong">{{ player.stats.cs }}</span>
                <span class="team__muted">{{ formatDecimal(player.stats.cs / minutes) }} / min</span>
              </template>

              <ItemSlots v-else class="team__items" :items="player.items" :role-quest="player.roleQuest" reserve-quest-slot />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* the whole team in its color: tinted background, colored bar on the left */
.team {
  --team-color: var(--team-blue);
  border-left: 4px solid var(--team-color);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--team-color) 7%, transparent);
}

.team--red {
  --team-color: var(--team-red);
}

/* position: relative -> the visually-hidden texts (position: absolute) are clipped by this scroll box
   too; without it they escape it and widen the whole page on phones */
.team__scroll {
  position: relative;
  overflow-x: auto;
}

.team__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* widths come from <colgroup>, not from the content: same columns in both tables */
  font-size: var(--text-sm);
}

/* ----- header: result, side, team totals ----- */
.team__header {
  padding: var(--space-3) var(--space-3) var(--space-2);
  font-size: var(--text-sm);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
}

/* victory: filled gold badge; defeat: outlined, muted */
.team__result {
  padding: 2px var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.team__result--win {
  border-color: var(--accent-gold);
  background: var(--accent-gold);
  color: var(--fill-base);
}

.team__side {
  font-weight: var(--weight-semibold);
  color: var(--team-color);
}

.team__totals {
  display: flex;
  gap: var(--space-3);
  margin-left: auto;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}

/* ----- cells ----- */
/* :where(): specificity 0, so .team__left can override the alignment */
.team__table :where(th, td) {
  padding: var(--space-2);
  border-bottom: 1px solid color-mix(in srgb, var(--team-color) 15%, var(--line));
  text-align: right;
  vertical-align: middle;
}

.team__table tbody tr:last-child > * {
  border-bottom: none;
}

.team__table thead th {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  line-height: 1.2;
}

.team__table abbr {
  text-decoration: none;
  cursor: help;
}

.team__left {
  text-align: left;
}

/* the page's player: gold bar on the left, slightly lighter row */
.team__row--focus > * {
  background: color-mix(in srgb, var(--accent-gold) 8%, transparent);
}

.team__row--focus > :first-child {
  box-shadow: inset 3px 0 0 var(--accent-gold);
}

.team__strong {
  display: block;
  font-weight: var(--weight-semibold);
  white-space: nowrap;
}

.team__muted {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
}

.team__deaths {
  color: var(--state-negative);
}

/* best value of the game in this column */
.team__best {
  font-weight: var(--weight-bold);
  color: var(--accent-gold);
}

/* ----- champion ----- */
.team__loadout {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.team__champion {
  position: relative;
}

.team__level {
  position: absolute;
  right: -3px;
  bottom: -3px;
  min-width: 16px;
  padding: 0 2px;
  border-radius: 3px;
  background: var(--fill-base);
  font-size: 10px;
  line-height: 14px;
  text-align: center;
}

.team__pair {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.team__runes {
  padding: 2px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
}

.team__runes:hover {
  border-color: var(--line);
  background: var(--fill-hover);
}

/* ----- player ----- */
.team__player {
  font-weight: var(--weight-regular);
}

.team__name {
  display: block;
  overflow: hidden;
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team__name:hover {
  text-decoration: underline;
}

/* ----- bars ----- */
.team__bar {
  display: flex;
  height: 4px;
  margin-top: 4px;
  border-radius: 2px;
  background: var(--fill-hover);
  overflow: hidden;
}

.team__bar-fill {
  display: block;
  height: 100%;
  background: var(--team-color);
  transition: inline-size 0.2s;
}

.team__bar-fill--dealt {
  background: var(--team-color);
}

.team__bar-fill--taken {
  background: var(--text-secondary);
}

.team__bar-fill--healed {
  background: var(--state-positive);
}

.team__meters {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* value on the left, bar on the right, one line per metric */
.team__meter {
  display: grid;
  grid-template-columns: 52px 1fr;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
}

.team__meter .team__bar {
  margin-top: 0;
}

/* legends of the composed columns */
.team__legend {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 2px 6px;
}

.team__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: -3px;
  border-radius: 50%;
}

.team__dot--dealt {
  background: var(--team-color);
}

.team__dot--taken {
  background: var(--text-secondary);
}

.team__dot--healed {
  background: var(--state-positive);
}

/* damage types: the game's own colors (orange physical, blue magic, white true) */
.team__dot--physical,
.team__split-part--physical {
  background: #e8833a;
}

.team__dot--magic,
.team__split-part--magic {
  background: #5b8cff;
}

.team__dot--true,
.team__split-part--true {
  background: #e8e8e8;
}

.team__split {
  display: flex;
  height: 100%;
}

.team__split-part {
  display: block;
  height: 100%;
}

.team__items {
  --item-size: 22px;
  --item-gap: 2px;
}
</style>
