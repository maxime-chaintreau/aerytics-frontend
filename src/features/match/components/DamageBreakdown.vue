<script setup lang="ts">
import { computed, ref } from "vue";
import type { MatchDetail } from "@/types/match";
import { type DamageMode, type DamageSplit, damageSplit, teamDamageSplit } from "@/features/match/buildLogic";
import { teamOf } from "@/features/match/matchLogic";
import { formatSide } from "@/utils/labels";
import { useStaticDataStore } from "@/stores/staticData";
import { formatCompact, formatInteger, formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";

const props = defineProps<{ match: MatchDetail }>();

const staticData = useStaticDataStore();

const MODES: { value: DamageMode; label: string }[] = [
  { value: "dealt", label: "Infligés" },
  { value: "taken", label: "Subis" },
];
const mode = ref<DamageMode>("dealt");

const TYPES = [
  { key: "physical", label: "Physiques" },
  { key: "magic", label: "Magiques" },
  { key: "true", label: "Bruts" },
] as const;

const maxTotal = computed(() => Math.max(1, ...props.match.participants.map((player) => damageSplit(player, mode.value).total)));

const teams = computed(() =>
  (["BLUE", "RED"] as const).map((side) => {
    const { players } = teamOf(props.match, side);
    const total = teamDamageSplit(players, mode.value);
    return {
      side,
      total,
      players: players.map((player) => ({ player, split: damageSplit(player, mode.value) })).sort((a, b) => b.split.total - a.split.total),
    };
  }),
);

const describe = (split: DamageSplit) => TYPES.map(({ key, label }) => `${label} ${formatInteger(split[key])} (${formatPercent(split[key] / Math.max(1, split.total))})`).join(", ");
</script>

<template>
  <Panel title="Répartition des dégâts">
    <template #aside>
      <SegmentedControl v-model="mode" label="Dégâts affichés" :options="MODES" />
    </template>

    <!-- legend, once for the whole block -->
    <ul class="legend" aria-hidden="true">
      <li v-for="type in TYPES" :key="type.key"><span class="swatch" :class="`swatch--${type.key}`" />{{ type.label }}</li>
    </ul>

    <div class="damage">
      <section v-for="team in teams" :key="team.side" class="damage__team" :class="`damage__team--${team.side.toLowerCase()}`" :aria-label="formatSide(team.side)">
        <!-- the team's profile: 100% wide, the share of each type -->
        <div class="damage__profile">
          <span class="damage__team-name">{{ formatSide(team.side) }}</span>
          <span class="damage__total">{{ formatCompact(team.total.total) }}</span>
          <span class="bar bar--full" :title="describe(team.total)">
            <span
              v-for="type in TYPES"
              :key="type.key"
              class="bar__part"
              :class="`bar__part--${type.key}`"
              :style="{ inlineSize: `${(team.total[type.key] / Math.max(1, team.total.total)) * 100}%` }"
            />
          </span>
          <span class="damage__shares">
            <span v-for="type in TYPES" :key="type.key" :class="`text--${type.key}`">
              {{ formatPercent(team.total[type.key] / Math.max(1, team.total.total)) }}
            </span>
          </span>
          <span class="visually-hidden">{{ describe(team.total) }}</span>
        </div>

        <ol class="damage__players">
          <li v-for="{ player, split } in team.players" :key="player.puuid" class="damage__player">
            <ChampionIcon :champion-id="player.championId" :size="24" />
            <span class="damage__name">{{ staticData.champion(player.championId)?.name ?? player.riotId.gameName }}</span>
            <!-- width = share of the game's biggest total -->
            <span class="bar" :title="describe(split)" :style="{ '--bar-width': `${(split.total / maxTotal) * 100}%` }">
              <span v-for="type in TYPES" :key="type.key" class="bar__part" :class="`bar__part--${type.key}`" :style="{ inlineSize: `${(split[type.key] / Math.max(1, split.total)) * 100}%` }" />
            </span>
            <span class="damage__value">{{ formatInteger(split.total) }}</span>
            <span class="damage__share">{{ formatPercent(split.total / Math.max(1, team.total.total)) }}</span>
            <span class="visually-hidden">{{ describe(split) }}</span>
          </li>
        </ol>
      </section>
    </div>
  </Panel>
</template>

<style scoped>
.legend {
  display: flex;
  gap: var(--space-4);
  margin: 0 0 var(--space-3);
  padding: 0;
  list-style: none;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.legend li {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

/* the same 3 colors as the scoreboard's "Dégâts" column */
.swatch--physical,
.bar__part--physical {
  background: #e8833a;
}

.swatch--magic,
.bar__part--magic {
  background: #5b8cff;
}

.swatch--true,
.bar__part--true {
  background: #e8e8e8;
}

.text--physical {
  color: #e8833a;
}

.text--magic {
  color: #5b8cff;
}

.text--true {
  color: #e8e8e8;
}

/* the 2 teams side by side when there is room */
.damage {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.damage__team--blue {
  --team-color: var(--team-blue);
}

.damage__team--red {
  --team-color: var(--team-red);
}

.damage__profile {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-1) var(--space-2);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--line);
}

.damage__team-name {
  font-weight: 600;
  color: var(--team-color);
}

.damage__total {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.damage__profile .bar,
.damage__shares {
  grid-column: 1 / -1;
}

.damage__shares {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
}

.damage__players {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.damage__player {
  display: grid;
  grid-template-columns: 24px 88px minmax(0, 1fr) auto 40px;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.damage__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.damage__value {
  font-variant-numeric: tabular-nums;
}

.damage__share {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* one bar = 3 segments side by side; its width = the player's share of the game's max */
.bar {
  display: flex;
  inline-size: var(--bar-width, 100%);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--fill-hover);
  transition: inline-size 0.2s;
}

.bar__part {
  display: block;
  height: 100%;
  transition: inline-size 0.2s;
}
</style>
