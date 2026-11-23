<script setup lang="ts">
import { computed, reactive } from "vue";
import type { MatchDetail } from "@/types/match";
import type { Region } from "@/types/riot";
import type { PerformanceAxis } from "@/types/analysis";
import { useMatchAnalysis } from "@/composables/useMatchQueries";
import { AXES, COMPARED_STATS, analysisOf, formatCompared, formatPlace, scoreTone } from "@/features/match/analysisLogic";
import { useStaticDataStore } from "@/stores/staticData";
import { formatRole, formatTier } from "@/utils/labels";
import { formatInteger } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import PlaceBadge from "@/features/match/components/PlaceBadge.vue";
import PlayerPicker from "@/features/match/components/PlayerPicker.vue";

const props = defineProps<{ match: MatchDetail; region: Region }>();

const staticData = useStaticDataStore();
const analysis = reactive(
  useMatchAnalysis(
    () => props.region,
    () => props.match.matchId,
  ),
);

const selected = defineModel<string>("selected", { required: true });

const participant = computed(() => props.match.participants.find(({ puuid }) => puuid === selected.value)!);
const player = computed(() => analysisOf(analysis.data?.players, selected.value));

const championName = computed(() => staticData.champion(participant.value.championId)?.name ?? "…");
const referenceText = computed(() => {
  const reference = player.value?.reference;
  if (!reference) return "";
  const tier = reference.tier ? formatTier(reference.tier) : "tous rangs";
  return `${championName.value} ${formatRole(reference.role)} · ${tier} · ${formatInteger(reference.games)} parties`;
});

const statsOf = (axis: PerformanceAxis) => player.value?.stats.filter((stat) => stat.axis === axis) ?? [];

const deviation = (score: number) => (score - 50) / 50;
</script>

<template>
  <Panel title="Vous vs la moyenne">
    <PlayerPicker v-model="selected" :participants="match.participants" label="Joueur analysé" class="performance__picker" />

    <div v-if="analysis.error && !analysis.data" role="alert" class="performance__message">
      <p>Impossible de charger l'analyse de la partie.</p>
      <button type="button" class="button button--small" :disabled="analysis.isLoading" @click="analysis.refresh()">Réessayer</button>
    </div>

    <span v-else-if="!player" class="skeleton performance__skeleton" aria-hidden="true" />

    <div v-else class="performance">
      <div class="summary">
        <div class="summary__score" :class="`tone--${scoreTone(player.score)}`">
          <span class="summary__value">{{ player.score }}</span>
          <span class="summary__max">/100</span>
        </div>
        <div class="summary__text">
          <p class="summary__name">
            {{ participant.riotId.gameName }}
            <PlaceBadge v-if="player.badge" :analysis="player" />
          </p>
          <p class="performance__muted">{{ formatPlace(player.rank) }} de la partie sur 10</p>
          <p class="performance__muted">Comparé à : {{ referenceText }}</p>
        </div>
      </div>

      <div class="axes">
        <section v-for="{ axis, label } in AXES" :key="axis" class="axis" :aria-label="label">
          <div class="axis__head">
            <h3 class="axis__title">{{ label }}</h3>
            <span class="axis__score" :class="`tone--${scoreTone(player.axes[axis])}`">{{ player.axes[axis] }}</span>
          </div>
          <span class="axis__bar" aria-hidden="true">
            <span class="axis__fill" :class="`fill--${scoreTone(player.axes[axis])}`" :style="{ inlineSize: `${player.axes[axis]}%` }" />
          </span>

          <table class="stats">
            <thead class="visually-hidden">
              <tr>
                <th scope="col">Statistique</th>
                <th scope="col">Joueur</th>
                <th scope="col">Moyenne</th>
                <th scope="col">Écart</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in statsOf(axis)" :key="stat.key">
                <th scope="row" class="stats__label">{{ COMPARED_STATS[stat.key].label }}</th>
                <td class="stats__value" :class="`tone--${scoreTone(stat.score)}`">{{ formatCompared(stat.key, stat.value) }}</td>
                <td class="stats__average">{{ formatCompared(stat.key, stat.average) }}</td>
                <td class="stats__gap">
                  <span class="gap" aria-hidden="true">
                    <span class="gap__fill" :class="deviation(stat.score) >= 0 ? 'gap__fill--better' : 'gap__fill--worse'" :style="{ inlineSize: `${Math.abs(deviation(stat.score)) * 50}%` }" />
                  </span>
                  <span class="visually-hidden">{{ stat.score }} sur 100</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  </Panel>
</template>

<style scoped>
.performance__picker {
  margin-bottom: var(--space-4);
}

/* ----- summary ----- */
.performance {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.summary {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.summary__score {
  display: flex;
  align-items: baseline;
}

.summary__value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.summary__max {
  color: var(--text-secondary);
}

.summary__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.summary__name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
}

.performance__muted {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* ----- axes ----- */
.axes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-4);
}

.axis {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.axis__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.axis__title {
  font-size: var(--text-sm);
  font-weight: 600;
}

.axis__score {
  font-size: var(--text-lg);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.axis__bar {
  position: relative;
  display: block;
  height: 6px;
  border-radius: 3px;
  background: var(--fill-hover);
  overflow: hidden;
}

/* the average */
.axis__bar::after {
  content: "";
  position: absolute;
  inset-block: 0;
  left: 50%;
  width: 2px;
  background: var(--text-secondary);
}

.axis__fill {
  display: block;
  height: 100%;
}

/* ----- stats ----- */
.stats {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.stats td,
.stats th {
  padding: 3px 0;
}

.stats__label {
  font-weight: 400;
  text-align: left;
  color: var(--text-secondary);
}

.stats__value,
.stats__average {
  padding-inline: var(--space-2) !important;
  text-align: right;
  white-space: nowrap;
}

.stats__value {
  font-weight: 600;
}

.stats__average {
  color: var(--text-secondary);
}

.stats__gap {
  width: 56px;
}

.gap {
  position: relative;
  display: block;
  height: 6px;
  border-radius: 3px;
  background: var(--fill-hover);
}

.gap::after {
  content: "";
  position: absolute;
  inset-block: -2px;
  left: 50%;
  width: 1px;
  background: var(--text-secondary);
}

.gap__fill {
  position: absolute;
  inset-block: 0;
  border-radius: 3px;
}

.gap__fill--better {
  left: 50%;
  background: var(--state-positive);
}

.gap__fill--worse {
  right: 50%;
  background: var(--state-negative);
}

/* ----- tones ----- */
.tone--great {
  color: var(--accent-gold);
}

.tone--good {
  color: var(--state-positive);
}

.tone--poor {
  color: var(--state-negative);
}

.fill--great {
  background: var(--accent-gold);
}

.fill--good {
  background: var(--state-positive);
}

.fill--average {
  background: var(--text-secondary);
}

.fill--poor {
  background: var(--state-negative);
}

.performance__message {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.performance__skeleton {
  display: block;
  height: 320px;
  border-radius: var(--radius-sm);
}
</style>
