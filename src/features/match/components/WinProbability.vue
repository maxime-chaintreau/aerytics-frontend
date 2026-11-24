<script setup lang="ts">
import { computed, reactive, ref, useId } from "vue";
import type { MatchDetail, TeamSide } from "@/types/match";
import type { Region } from "@/types/riot";
import { useMatchAnalysis } from "@/composables/useMatchQueries";
import { areaPath, eventLabel, eventSide, linePath, nearestFrame, timeTicks } from "@/features/match/timelineLogic";
import { chanceOf, momentSwing } from "@/features/match/analysisLogic";
import { formatDuration, formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";

const props = defineProps<{ match: MatchDetail; region: Region }>();

const analysis = reactive(
  useMatchAnalysis(
    () => props.region,
    () => props.match.matchId,
  ),
);

const SIDE_NAMES: Record<TeamSide, string> = { BLUE: "Bleue", RED: "Rouge" };
const LIMIT = 50;

const frameTimes = computed(() => analysis.data?.frameTimes ?? []);
const chances = computed(() => analysis.data?.winProbability ?? []);
/** -50..+50: the gap to a 50/50 game */
const gaps = computed(() => chances.value.map((chance) => (chance - 0.5) * 100));
const duration = computed(() => frameTimes.value.at(-1) ?? props.match.durationSeconds);
const line = computed(() => linePath(frameTimes.value, gaps.value, LIMIT));
const area = computed(() => areaPath(frameTimes.value, gaps.value, LIMIT));
const xTicks = computed(() => timeTicks(duration.value));
const moments = computed(() => analysis.data?.keyMoments ?? []);

const xRatio = (seconds: number) => seconds / duration.value;
const yRatio = (chance: number) => 1 - chance;

const playerOf = (puuid: string) => props.match.participants.find((participant) => participant.puuid === puuid);
const clipId = useId();

// ---------- hover / keyboard ----------
const active = ref<number | null>(null);
const activeTime = computed(() => (active.value === null ? null : frameTimes.value[active.value]!));

function onPointerMove(event: PointerEvent) {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  active.value = nearestFrame(frameTimes.value, Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) * duration.value);
}

function onKeydown(event: KeyboardEvent) {
  const last = frameTimes.value.length - 1;
  const current = active.value ?? last;
  const next = { ArrowLeft: Math.max(0, current - 1), ArrowRight: Math.min(last, current + 1), Home: 0, End: last }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  active.value = next;
}

const tooltipStyle = computed(() => {
  if (activeTime.value === null) return undefined;
  const left = xRatio(activeTime.value) * 100;
  return { left: `${left}%`, transform: `translateX(${left < 50 ? "var(--space-3)" : "calc(-100% - var(--space-3))"})` };
});

const selectedMoment = ref<number | null>(null);

const chartLabel = computed(() => {
  const list = moments.value
    .map((moment, index) => {
      const { side, points } = momentSwing(moment);
      return `moment ${index + 1} à ${formatDuration(moment.time)} : +${points} points pour l'équipe ${SIDE_NAMES[side]}`;
    })
    .join(", ");
  return `Probabilité de victoire de l'équipe bleue au fil de la partie. ${list}. Flèches gauche et droite pour parcourir.`;
});
</script>

<template>
  <Panel title="Probabilité de victoire">
    <div v-if="analysis.error && !analysis.data" role="alert" class="win__message">
      <p>Impossible de charger l'analyse de la partie.</p>
      <button type="button" class="button button--small" :disabled="analysis.isLoading" @click="analysis.refresh()">Réessayer</button>
    </div>

    <span v-else-if="!analysis.data" class="skeleton win__skeleton" aria-hidden="true" />

    <template v-else>
      <div class="win">
        <div class="win__y-axis" aria-hidden="true">
          <span class="win__y-tick win__text--blue" style="top: 0%">100 %</span>
          <span class="win__y-tick" style="top: 50%">50 %</span>
          <span class="win__y-tick win__text--red" style="top: 100%">100 %</span>
        </div>

        <div class="win__plot" role="group" tabindex="0" :aria-label="chartLabel" @pointermove="onPointerMove" @pointerleave="active = null" @keydown="onKeydown" @blur="active = null">
          <svg class="win__svg" :viewBox="`0 0 ${duration} ${2 * LIMIT}`" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <clipPath :id="`${clipId}-above`"><rect x="0" y="0" :width="duration" :height="LIMIT" /></clipPath>
              <clipPath :id="`${clipId}-below`"><rect x="0" :y="LIMIT" :width="duration" :height="LIMIT" /></clipPath>
            </defs>
            <line class="win__grid win__grid--half" x1="0" :x2="duration" :y1="LIMIT" :y2="LIMIT" />
            <line v-for="tick in xTicks" :key="tick" class="win__grid" :x1="tick" :x2="tick" y1="0" :y2="2 * LIMIT" />
            <path class="win__area win__area--blue" :d="area" :clip-path="`url(#${clipId}-above)`" />
            <path class="win__area win__area--red" :d="area" :clip-path="`url(#${clipId}-below)`" />
            <path class="win__line win__line--blue" :d="line" :clip-path="`url(#${clipId}-above)`" />
            <path class="win__line win__line--red" :d="line" :clip-path="`url(#${clipId}-below)`" />
            <line v-if="activeTime !== null" class="win__cursor" :x1="activeTime" :x2="activeTime" y1="0" :y2="2 * LIMIT" />
          </svg>

          <button
            v-for="(moment, index) in moments"
            :key="moment.time"
            type="button"
            class="win__marker"
            :class="[`win__marker--${momentSwing(moment).side.toLowerCase()}`, { 'win__marker--selected': selectedMoment === index }]"
            :style="{ left: `${xRatio(moment.time) * 100}%`, top: `${yRatio(moment.after) * 100}%` }"
            :aria-label="`Moment clé ${index + 1}, ${formatDuration(moment.time)}`"
            :aria-pressed="selectedMoment === index"
            @click="selectedMoment = selectedMoment === index ? null : index"
          >
            {{ index + 1 }}
          </button>

          <div v-if="active !== null && activeTime !== null" class="win__tooltip" :style="tooltipStyle" aria-hidden="true">
            <span class="win__muted">{{ formatDuration(activeTime) }}</span>
            <span class="win__text--blue">Bleue {{ formatPercent(chanceOf(chances[active]!, "BLUE")) }}</span>
            <span class="win__text--red">Rouge {{ formatPercent(chanceOf(chances[active]!, "RED")) }}</span>
          </div>
        </div>

        <div class="win__x-axis" aria-hidden="true">
          <span v-for="tick in xTicks" :key="tick" class="win__x-tick" :style="{ left: `${xRatio(tick) * 100}%` }">
            {{ formatDuration(tick) }}
          </span>
        </div>
      </div>

      <p class="visually-hidden" aria-live="polite">
        <template v-if="active !== null && activeTime !== null"> {{ formatDuration(activeTime) }} : équipe bleue {{ formatPercent(chances[active]!) }}. </template>
      </p>

      <p v-if="moments.length === 0" class="win__muted">Aucun retournement marquant : la partie a évolué progressivement.</p>
      <ol v-else class="moments">
        <li v-for="(moment, index) in moments" :key="moment.time" class="moment" :class="[`moment--${momentSwing(moment).side.toLowerCase()}`, { 'moment--selected': selectedMoment === index }]">
          <span class="moment__number" aria-hidden="true">{{ index + 1 }}</span>
          <div class="moment__body">
            <p class="moment__title">
              <time :datetime="`PT${moment.time}S`">{{ formatDuration(moment.time) }}</time>
              · Équipe {{ SIDE_NAMES[momentSwing(moment).side].toLowerCase() }}
              <strong>+{{ momentSwing(moment).points }} pts</strong>
              <span class="win__muted"> ({{ formatPercent(chanceOf(moment.before, momentSwing(moment).side)) }} → {{ formatPercent(chanceOf(moment.after, momentSwing(moment).side)) }}) </span>
            </p>
            <ul v-if="moment.events.length > 0" class="moment__events">
              <li v-for="(event, eventIndex) in moment.events" :key="eventIndex" :class="`win__text--${(eventSide(event, playerOf) ?? 'BLUE').toLowerCase()}`">
                {{ formatDuration(event.time) }} {{ eventLabel(event, playerOf) }}
              </li>
            </ul>
            <p v-else class="win__muted">Avance prise au farm, sans combat ni objectif.</p>
          </div>
        </li>
      </ol>
    </template>
  </Panel>
</template>

<style scoped>
.win {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  grid-template-rows: 160px 20px;
  column-gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.win__y-axis,
.win__x-axis {
  position: relative;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.win__y-tick {
  position: absolute;
  right: 0;
  translate: 0 -50%;
  white-space: nowrap;
}

.win__x-axis {
  grid-column: 2;
}

.win__x-tick {
  position: absolute;
  top: var(--space-1);
  translate: -50% 0;
}

.win__plot {
  position: relative;
  touch-action: pan-y;
}

.win__plot:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.win__svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.win__grid,
.win__line,
.win__cursor {
  vector-effect: non-scaling-stroke;
  fill: none;
}

.win__grid {
  stroke: var(--line);
}

.win__grid--half {
  stroke: var(--text-secondary);
  stroke-opacity: 0.5;
  stroke-dasharray: 4 4;
}

.win__area--blue {
  fill: color-mix(in srgb, var(--team-blue) 22%, transparent);
}

.win__area--red {
  fill: color-mix(in srgb, var(--team-red) 22%, transparent);
}

.win__line {
  stroke-width: 2;
  stroke-linejoin: round;
}

.win__line--blue {
  stroke: var(--team-blue);
}

.win__line--red {
  stroke: var(--team-red);
}

.win__cursor {
  stroke: var(--text-primary);
  stroke-opacity: 0.4;
}

/* ----- markers ----- */
.win__marker {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  translate: -50% -50%;
  padding: 0;
  border: 2px solid var(--fill-panel);
  border-radius: 50%;
  background: var(--marker-color);
  color: var(--fill-panel);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 700;
  cursor: pointer;
}

.win__marker--blue,
.moment--blue {
  --marker-color: var(--team-blue);
}

.win__marker--red,
.moment--red {
  --marker-color: var(--team-red);
}

.win__marker--selected,
.win__marker:hover {
  outline: 2px solid var(--marker-color);
  outline-offset: 2px;
}

.win__tooltip {
  position: absolute;
  top: var(--space-1);
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-1) var(--space-2);
  background: var(--fill-panel-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
}

.win__muted {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.win__text--blue {
  color: var(--team-blue);
}

.win__text--red {
  color: var(--team-red);
}

/* ----- key moments ----- */
.moments {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.moment {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid var(--line);
  border-left: 3px solid var(--marker-color);
  border-radius: var(--radius-sm);
  transition: background 150ms ease;
}

.moment--selected {
  background: var(--fill-panel-2);
}

.moment__number {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--marker-color);
  color: var(--fill-panel);
  font-size: var(--text-xs);
  font-weight: 700;
}

.moment__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  font-size: var(--text-sm);
}

.moment__title strong {
  color: var(--marker-color);
}

.moment__events {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-xs);
}

.win__message {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.win__skeleton {
  display: block;
  height: 300px;
  border-radius: var(--radius-sm);
}
</style>
