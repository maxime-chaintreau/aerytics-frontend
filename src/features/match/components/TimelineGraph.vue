<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, useId, watch } from "vue";
import type { MatchDetail, TeamSide } from "@/types/match";
import type { Region } from "@/types/riot";
import type { FrameStat, TimelineEvent } from "@/types/timeline";
import { useMatchTimeline } from "@/composables/useMatchQueries";
import { areaPath, difference, eventLabel, eventSide, eventsInFrame, largestLeads, linePath, nearestFrame, niceLimit, teamTotals, timeTicks } from "@/features/match/timelineLogic";
import { formatCompact, formatDuration, formatInteger } from "@/utils/format";
import Dialog from "@/components/ui/Dialog.vue";
import Panel from "@/components/ui/Panel.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ObjectiveIcon from "@/components/game/icon/ObjectiveIcon.vue";

const props = defineProps<{ match: MatchDetail; region: Region }>();

const timeline = reactive(
  useMatchTimeline(
    () => props.region,
    () => props.match.matchId,
  ),
);

const TimelineDetails = defineAsyncComponent(() => import("@/features/match/components/TimelineDetails.vue"));

const detailsOpen = ref(false);

const STATS: { value: FrameStat; label: string; unit: string }[] = [
  { value: "gold", label: "Or", unit: "d'or" },
  { value: "xp", label: "XP", unit: "d'XP" },
  { value: "cs", label: "CS", unit: "de CS" },
  { value: "damage", label: "Dégâts", unit: "de dégâts" },
];
const stat = ref<FrameStat>("gold");
const statUnit = computed(() => STATS.find(({ value }) => value === stat.value)!.unit);

const SIDE_NAMES: Record<TeamSide, string> = { BLUE: "Bleue", RED: "Rouge" };

// ---------- Curves ----------

const frameTimes = computed(() => timeline.data?.frameTimes ?? []);
const totals = computed(() => (timeline.data ? teamTotals(props.match, timeline.data, stat.value) : { BLUE: [], RED: [] }));
const diff = computed(() => difference(totals.value));
const leads = computed(() => largestLeads(diff.value, frameTimes.value));

const limit = computed(() => niceLimit(Math.max(...diff.value.map(Math.abs), 1)));
const duration = computed(() => frameTimes.value.at(-1) ?? props.match.durationSeconds);

const line = computed(() => linePath(frameTimes.value, diff.value, limit.value));
const area = computed(() => areaPath(frameTimes.value, diff.value, limit.value));
const yTicks = computed(() => [limit.value, limit.value / 2, 0, -limit.value / 2, -limit.value]);
const xTicks = computed(() => timeTicks(duration.value));

const xRatio = (seconds: number) => seconds / duration.value;
const yRatio = (value: number) => (limit.value - value) / (2 * limit.value);

const format = (value: number) => (stat.value === "cs" ? formatInteger(value) : formatCompact(value));
const formatGap = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${format(Math.abs(value))}`;

const clipId = useId();

// ---------- Events (the two rows under the chart) ----------

const playerOf = (puuid: string) => props.match.participants.find((participant) => participant.puuid === puuid);

const events = computed(() => timeline.data?.events ?? []);
const rows = computed(() =>
  (["BLUE", "RED"] as const).map((side) => ({
    side,
    events: events.value.filter((event) => eventSide(event, playerOf) === side),
  })),
);

const eventTitle = (event: TimelineEvent) => `${formatDuration(event.time)} · ${eventLabel(event, playerOf)}`;

function eventIcon(event: TimelineEvent) {
  if (event.kind === "monster") return event.monster;
  if (event.kind === "building") return event.building;
  return null;
}

// ---------- Hover / keyboard: one active frame ----------

const active = ref<number | null>(null);
const activeTime = computed(() => (active.value === null ? null : frameTimes.value[active.value]!));
const activeEvents = computed(() => (active.value === null ? [] : eventsInFrame(events.value, frameTimes.value, active.value)));

watch(
  () => props.match.matchId,
  () => (active.value = null),
);

function onPointerMove(event: PointerEvent) {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
  active.value = nearestFrame(frameTimes.value, ratio * duration.value);
}

function onKeydown(event: KeyboardEvent) {
  const last = frameTimes.value.length - 1;
  if (last < 0) return;
  const current = active.value ?? last;
  const next = { ArrowLeft: Math.max(0, current - 1), ArrowRight: Math.min(last, current + 1), Home: 0, End: last }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  active.value = next;
}

const tooltipStyle = computed(() => {
  if (activeTime.value === null) return undefined;
  const left = xRatio(activeTime.value) * 100;
  const shift = left < 50 ? "var(--space-3)" : "calc(-100% - var(--space-3))";
  return { left: `${left}%`, transform: `translateX(${shift})` };
});

const chartLabel = computed(() => {
  const final = diff.value.at(-1) ?? 0;
  const lead = (side: TeamSide) =>
    leads.value[side].value > 0 ? `équipe ${SIDE_NAMES[side]} +${format(leads.value[side].value)} à ${formatDuration(leads.value[side].time)}` : `équipe ${SIDE_NAMES[side]} jamais devant`;
  return `Écart ${statUnit.value} entre les équipes. Plus gros avantage : ${lead("BLUE")}, ${lead("RED")}. Fin de partie : ${formatGap(final)} pour l'équipe ${SIDE_NAMES[final >= 0 ? "BLUE" : "RED"]}. Flèches gauche et droite pour parcourir.`;
});
</script>

<template>
  <Panel title="Déroulé de la partie">
    <template #aside>
      <div class="graph__actions">
        <SegmentedControl v-model="stat" label="Écart affiché" :options="STATS" />
        <button type="button" class="button button--small" :disabled="!timeline.data" @click="detailsOpen = true">Détails</button>
      </div>
    </template>

    <div v-if="timeline.error && !timeline.data" role="alert" class="graph__message">
      <p>Impossible de charger le déroulé de la partie.</p>
      <button type="button" class="button button--small" :disabled="timeline.isLoading" @click="timeline.refresh()">Réessayer</button>
    </div>

    <span v-else-if="!timeline.data" class="skeleton graph__skeleton" aria-hidden="true" />

    <template v-else>
      <div class="graph">
        <div class="graph__y-axis" aria-hidden="true">
          <span v-for="tick in yTicks" :key="tick" class="graph__y-tick" :class="{ 'graph__y-tick--blue': tick > 0, 'graph__y-tick--red': tick < 0 }" :style="{ top: `${yRatio(tick) * 100}%` }">
            {{ formatGap(tick) }}
          </span>
        </div>

        <div class="graph__plot" role="group" tabindex="0" :aria-label="chartLabel" @pointermove="onPointerMove" @pointerleave="active = null" @keydown="onKeydown" @blur="active = null">
          <svg class="graph__svg" :viewBox="`0 0 ${duration} ${2 * limit}`" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <clipPath :id="`${clipId}-above`"><rect x="0" y="0" :width="duration" :height="limit" /></clipPath>
              <clipPath :id="`${clipId}-below`"><rect x="0" :y="limit" :width="duration" :height="limit" /></clipPath>
            </defs>

            <line v-for="tick in yTicks" :key="`y${tick}`" class="graph__grid" :class="{ 'graph__grid--zero': tick === 0 }" x1="0" :x2="duration" :y1="limit - tick" :y2="limit - tick" />
            <line v-for="tick in xTicks" :key="`x${tick}`" class="graph__grid" :x1="tick" :x2="tick" y1="0" :y2="2 * limit" />

            <path class="graph__area graph__area--blue" :d="area" :clip-path="`url(#${clipId}-above)`" />
            <path class="graph__area graph__area--red" :d="area" :clip-path="`url(#${clipId}-below)`" />
            <path class="graph__line graph__line--blue" :d="line" :clip-path="`url(#${clipId}-above)`" />
            <path class="graph__line graph__line--red" :d="line" :clip-path="`url(#${clipId}-below)`" />

            <line v-if="activeTime !== null" class="graph__cursor" :x1="activeTime" :x2="activeTime" y1="0" :y2="2 * limit" />
          </svg>

          <span
            v-if="active !== null && activeTime !== null"
            class="graph__dot"
            :class="diff[active]! >= 0 ? 'graph__dot--blue' : 'graph__dot--red'"
            :style="{ left: `${xRatio(activeTime) * 100}%`, top: `${yRatio(diff[active]!) * 100}%` }"
            aria-hidden="true"
          />

          <div v-if="active !== null && activeTime !== null" class="graph__tooltip" :style="tooltipStyle" aria-hidden="true">
            <span class="graph__tooltip-time">{{ formatDuration(activeTime) }}</span>
            <span :class="diff[active]! >= 0 ? 'graph__text--blue' : 'graph__text--red'"> {{ formatGap(diff[active]!) }} {{ statUnit }} </span>
            <span class="graph__tooltip-totals">
              <span class="graph__text--blue">{{ format(totals.BLUE[active]!) }}</span>
              –
              <span class="graph__text--red">{{ format(totals.RED[active]!) }}</span>
            </span>
            <ul v-if="activeEvents.length > 0" class="graph__tooltip-events">
              <li v-for="(event, index) in activeEvents" :key="index" :class="eventSide(event, playerOf) === 'BLUE' ? 'graph__text--blue' : 'graph__text--red'">
                {{ formatDuration(event.time) }} {{ eventLabel(event, playerOf) }}
              </li>
            </ul>
          </div>
        </div>

        <div class="graph__x-axis" aria-hidden="true">
          <span v-for="tick in xTicks" :key="tick" class="graph__x-tick" :style="{ left: `${xRatio(tick) * 100}%` }">
            {{ formatDuration(tick) }}
          </span>
        </div>

        <ul v-for="row in rows" :key="row.side" class="graph__events" :aria-label="`Événements de l'équipe ${SIDE_NAMES[row.side]}`">
          <li
            v-for="(event, index) in row.events"
            :key="index"
            class="graph__event"
            :class="{ 'graph__event--kill': event.kind === 'kill' }"
            :style="{ left: `${xRatio(event.time) * 100}%` }"
            :title="eventTitle(event)"
          >
            <ObjectiveIcon v-if="eventIcon(event)" :objective="eventIcon(event)!" :side="row.side" :size="14" />
            <span v-else class="graph__kill" :class="`graph__kill--${row.side.toLowerCase()}`" aria-hidden="true" />
            <span class="visually-hidden">{{ eventTitle(event) }}</span>
          </li>
        </ul>
      </div>

      <p class="visually-hidden" aria-live="polite">
        <template v-if="active !== null && activeTime !== null">
          {{ formatDuration(activeTime) }} : {{ formatGap(diff[active]!) }} {{ statUnit }}.
          <template v-for="(event, index) in activeEvents" :key="index">{{ eventLabel(event, playerOf) }}. </template>
        </template>
      </p>

      <p class="graph__summary">
        <template v-for="side in ['BLUE', 'RED'] as const" :key="side">
          <span v-if="leads[side].value > 0">
            Plus gros avantage {{ SIDE_NAMES[side].toLowerCase() }} :
            <strong :class="side === 'BLUE' ? 'graph__text--blue' : 'graph__text--red'">+{{ format(leads[side].value) }}</strong>
            à {{ formatDuration(leads[side].time) }}
          </span>
        </template>
      </p>
    </template>

    <Dialog v-model:open="detailsOpen" title="Déroulé de la partie" subtitle="Courbe de chaque joueur et tous les événements" size="lg">
      <TimelineDetails v-if="timeline.data" v-model:stat="stat" :match="match" :timeline="timeline.data" />
    </Dialog>
  </Panel>
</template>

<style scoped>
.graph {
  --y-axis-width: 48px;
  display: grid;
  grid-template-columns: var(--y-axis-width) minmax(0, 1fr);
  grid-template-rows: 200px auto auto auto;
  column-gap: var(--space-2);
}

.graph__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.graph__y-axis,
.graph__x-axis {
  position: relative;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.graph__y-tick {
  position: absolute;
  right: 0;
  translate: 0 -50%;
  white-space: nowrap;
}

.graph__y-tick--blue {
  color: var(--team-blue);
}

.graph__y-tick--red {
  color: var(--team-red);
}

.graph__x-axis {
  grid-column: 2;
  height: 20px;
}

.graph__x-tick {
  position: absolute;
  top: var(--space-1);
  translate: -50% 0;
}

/* ----- plot ----- */
.graph__plot {
  position: relative;
  border-radius: var(--radius-sm);
  touch-action: pan-y;
}

.graph__plot:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.graph__svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.graph__grid,
.graph__line,
.graph__cursor {
  vector-effect: non-scaling-stroke;
  fill: none;
}

.graph__grid {
  stroke: var(--line);
  stroke-width: 1;
}

.graph__grid--zero {
  stroke: var(--text-secondary);
  stroke-opacity: 0.5;
}

.graph__area--blue {
  fill: color-mix(in srgb, var(--team-blue) 22%, transparent);
}

.graph__area--red {
  fill: color-mix(in srgb, var(--team-red) 22%, transparent);
}

.graph__line {
  stroke-width: 2;
  stroke-linejoin: round;
}

.graph__line--blue {
  stroke: var(--team-blue);
}

.graph__line--red {
  stroke: var(--team-red);
}

.graph__cursor {
  stroke: var(--text-primary);
  stroke-opacity: 0.4;
  stroke-width: 1;
}

.graph__dot {
  position: absolute;
  width: 9px;
  height: 9px;
  translate: -50% -50%;
  border: 2px solid var(--fill-panel);
  border-radius: 50%;
  pointer-events: none;
}

.graph__dot--blue {
  background: var(--team-blue);
}

.graph__dot--red {
  background: var(--team-red);
}

.graph__tooltip {
  position: absolute;
  top: var(--space-1);
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 140px;
  padding: var(--space-1) var(--space-2);
  background: var(--fill-panel-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
}

.graph__tooltip-time,
.graph__tooltip-totals {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.graph__tooltip-events {
  margin: 2px 0 0;
  padding: 2px 0 0;
  border-top: 1px solid var(--line);
  list-style: none;
  font-size: var(--text-xs);
}

.graph__text--blue {
  color: var(--team-blue);
}

.graph__text--red {
  color: var(--team-red);
}

/* ----- event rows ----- */
.graph__events {
  grid-column: 2;
  position: relative;
  height: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.graph__event {
  position: absolute;
  top: 50%;
  translate: -50% -50%;
  display: grid;
  place-items: center;
}

.graph__event:not(.graph__event--kill) {
  z-index: 1;
  filter: drop-shadow(0 0 2px var(--fill-panel));
}

.graph__kill {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  opacity: 0.7;
}

.graph__kill--blue {
  background: var(--team-blue);
}

.graph__kill--red {
  background: var(--team-red);
}

/* ----- states ----- */
.graph__summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.graph__message {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.graph__skeleton {
  height: 260px;
  border-radius: var(--radius-sm);
}
</style>
