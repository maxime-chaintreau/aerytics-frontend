<script setup lang="ts">
// The line above a team's scoreboard: result, side, bans, objectives (gold = took it first), team KDA and gold.
// Colors come from the parent's --team-color.
import { computed } from "vue";
import type { MatchParticipant, MatchTeam } from "@/types/match";
import type { MatchResult } from "@/types/riot";
import { TEAM_OBJECTIVES } from "@/features/match/matchStats";
import { formatResult, formatSide } from "@/utils/labels";
import { formatCompact } from "@/utils/format";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import ChampionLink from "@/components/game/ChampionLink.vue";
import ObjectiveIcon from "@/components/game/icon/ObjectiveIcon.vue";

const props = defineProps<{ team: MatchTeam; players: MatchParticipant[]; result: MatchResult }>();

const sum = (valueOf: (player: MatchParticipant) => number) => props.players.reduce((total, player) => total + valueOf(player), 0);

const totals = computed(() => ({
  kills: sum(({ stats }) => stats.kills),
  deaths: sum(({ stats }) => stats.deaths),
  assists: sum(({ stats }) => stats.assists),
  gold: sum(({ stats }) => stats.gold),
}));
</script>

<template>
  <div class="team__header">
    <span class="team__result" :class="`team__result--${result.toLowerCase()}`">{{ formatResult(result) }}</span>
    <span class="team__side">{{ formatSide(team.side) }}</span>
    <ul class="team__bans" aria-label="Bannissements">
      <li v-for="(championId, index) in team.bans" :key="index" class="team__ban" :class="{ 'team__ban--none': championId === -1 }">
        <ChampionLink v-if="championId !== -1" :champion-id="championId">
          <ChampionIcon :champion-id="championId" :size="22" />
        </ChampionLink>
        <span v-else class="team__ban-none" role="img" aria-label="Pas de bannissement">–</span>
      </li>
    </ul>

    <ul class="team__objectives" aria-label="Objectifs">
      <li
        v-for="{ name, label, first } in TEAM_OBJECTIVES"
        :key="name"
        class="team__objective"
        :class="{ 'team__objective--first': team.objectives[name].first }"
        :title="team.objectives[name].first ? `${label} · ${first}` : label"
      >
        <ObjectiveIcon :objective="name" :side="team.side" :size="18" />
        {{ team.objectives[name].kills }}
        <span class="visually-hidden">{{ label }}{{ team.objectives[name].first ? `, ${first}` : "" }}</span>
      </li>
    </ul>
    <span class="team__totals">
      <span>{{ totals.kills }} / {{ totals.deaths }} / {{ totals.assists }}</span>
      <span>{{ formatCompact(totals.gold) }} or</span>
    </span>
  </div>
</template>

<style scoped>
.team__header {
  padding: var(--space-3) var(--space-3) var(--space-2);
  font-size: var(--text-sm);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
}

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

/* ----- bans ----- */
.team__bans {
  display: flex;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.team__ban {
  position: relative;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 1px var(--state-negative);
}

.team__ban > * {
  filter: grayscale(1);
  opacity: 0.6;
}

.team__ban::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(to top right, transparent calc(50% - 1px), var(--state-negative) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px));
  pointer-events: none;
}

.team__ban--none {
  box-shadow: none;
}

.team__ban--none::after {
  content: none;
}

.team__ban-none {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  background: var(--fill-hover);
  color: var(--text-secondary);
}

/* ----- objectives ----- */
.team__objectives {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.team__objective {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  color: var(--team-color);
}

.team__objective--first {
  color: var(--accent-gold);
}

.team__totals {
  display: flex;
  gap: var(--space-3);
  margin-left: auto;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}
</style>
