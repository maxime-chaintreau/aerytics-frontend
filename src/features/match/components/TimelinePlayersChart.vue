<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { MatchDetail, TeamSide } from "@/types/match";
import type { FrameStat, MatchTimeline } from "@/types/timeline";
import { focusedParticipant } from "@/features/match/matchLogic";
import { linePath, nearestFrame, playersLimit, timeTicks } from "@/features/match/timelineLogic";
import { formatCompact, formatDuration, formatInteger } from "@/utils/format";
import { formatSide } from "@/utils/labels";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";

const props = defineProps<{ match: MatchDetail; timeline: MatchTimeline }>();
const stat = defineModel<FrameStat>("stat", { required: true });

const STATS: { value: FrameStat; label: string }[] = [
  { value: "gold", label: "Or" },
  { value: "xp", label: "XP" },
  { value: "cs", label: "CS" },
  { value: "damage", label: "Dégâts" },
];

const SIDES: TeamSide[] = ["BLUE", "RED"];

const frameTimes = computed(() => props.timeline.frameTimes);
const duration = computed(() => frameTimes.value.at(-1) ?? props.match.durationSeconds);
const limit = computed(() => playersLimit(props.timeline, stat.value));
const xTicks = computed(() => timeTicks(duration.value));
const yTicks = computed(() => [limit.value, (limit.value * 3) / 4, limit.value / 2, limit.value / 4]);

const SHADES = ["", "white 30%", "black 30%", "white 55%", "black 50%"];

const lines = computed(() =>
  SIDES.flatMap((side) =>
    props.match.participants
      .filter((participant) => participant.side === side)
      .map((participant, index) => {
        const frames = props.timeline.players.find((player) => player.puuid === participant.puuid);
        const teamColor = side === "BLUE" ? "var(--team-blue)" : "var(--team-red)";
        return {
          participant,
          values: frames?.[stat.value] ?? [],
          color: SHADES[index] ? `color-mix(in oklab, ${teamColor}, ${SHADES[index]})` : teamColor,
        };
      }),
  ),
);

const selected = ref<string | null>(focusedParticipant(props.match)?.puuid ?? null);
const hovered = ref<string | null>(null);
const highlighted = computed(() => hovered.value ?? selected.value);

const drawOrder = computed(() => [...lines.value].sort((a, b) => Number(a.participant.puuid === highlighted.value) - Number(b.participant.puuid === highlighted.value)));

function toggle(puuid: string) {
  selected.value = selected.value === puuid ? null : puuid;
}

const active = ref<number | null>(null);
const shownFrame = computed(() => active.value ?? frameTimes.value.length - 1);
const activeTime = computed(() => (active.value === null ? null : frameTimes.value[active.value]!));

function onPointerMove(event: PointerEvent) {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
  active.value = nearestFrame(frameTimes.value, ratio * duration.value);
}

function onKeydown(event: KeyboardEvent) {
  const last = frameTimes.value.length - 1;
  const current = active.value ?? last;
  const next = {
    ArrowLeft: Math.max(0, current - 1),
    ArrowRight: Math.min(last, current + 1),
    Home: 0,
    End: last,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  active.value = next;
}

const format = (value: number) => (stat.value === "cs" ? formatInteger(value) : formatCompact(value));

const legend = computed(() =>
  SIDES.map((side) => ({
    side,
    name: formatSide(side),
    players: lines.value.filter((line) => line.participant.side === side),
  })),
);

const chartId = useId();
</script>

<template>
  <section class="details__section" :aria-labelledby="`${chartId}-title`">
    <div class="details__heading">
      <h3 :id="`${chartId}-title`" class="details__title">Par joueur</h3>
      <SegmentedControl v-model="stat" label="Statistique affichée" :options="STATS" size="sm" />
    </div>

    <div class="players">
      <div class="players__layout">
        <div class="players__chart">
          <div class="players__y-axis" aria-hidden="true">
            <span v-for="tick in yTicks" :key="tick" class="players__y-tick" :style="{ top: `${(1 - tick / limit) * 100}%` }">
              {{ format(tick) }}
            </span>
          </div>

          <div
            class="players__plot"
            role="group"
            tabindex="0"
            aria-label="Courbe de chaque joueur. Flèches gauche et droite : les valeurs de la légende suivent la minute choisie."
            @pointermove="onPointerMove"
            @pointerleave="active = null"
            @keydown="onKeydown"
            @blur="active = null"
          >
            <svg class="players__svg" :viewBox="`0 0 ${duration} ${limit}`" preserveAspectRatio="none" aria-hidden="true">
              <line v-for="tick in yTicks" :key="`y${tick}`" class="players__grid" x1="0" :x2="duration" :y1="limit - tick" :y2="limit - tick" />
              <line v-for="tick in xTicks" :key="`x${tick}`" class="players__grid" :x1="tick" :x2="tick" y1="0" :y2="limit" />
              <path
                v-for="line in drawOrder"
                :key="line.participant.puuid"
                class="players__line"
                :class="{
                  'players__line--highlighted': line.participant.puuid === highlighted,
                  'players__line--faded': highlighted !== null && line.participant.puuid !== highlighted,
                }"
                :style="{ stroke: line.color }"
                :d="linePath(frameTimes, line.values, limit)"
              />
              <line v-if="activeTime !== null" class="players__cursor" :x1="activeTime" :x2="activeTime" y1="0" :y2="limit" />
            </svg>
          </div>

          <div class="players__x-axis" aria-hidden="true">
            <span v-for="tick in xTicks" :key="tick" class="players__x-tick" :style="{ left: `${(tick / duration) * 100}%` }">
              {{ formatDuration(tick) }}
            </span>
          </div>
        </div>

        <div class="legend">
          <p class="legend__time" aria-live="polite">
            {{ activeTime === null ? "Fin de partie" : formatDuration(activeTime) }}
          </p>
          <div v-for="team in legend" :key="team.side" class="legend__team" :class="`legend__team--${team.side.toLowerCase()}`">
            <h4 class="legend__name">{{ team.name }}</h4>
            <ul class="legend__list">
              <li v-for="line in team.players" :key="line.participant.puuid">
                <button
                  type="button"
                  class="legend__player"
                  :class="{
                    'legend__player--faded': highlighted !== null && line.participant.puuid !== highlighted,
                  }"
                  :aria-pressed="selected === line.participant.puuid"
                  @click="toggle(line.participant.puuid)"
                  @pointerenter="hovered = line.participant.puuid"
                  @pointerleave="hovered = null"
                  @focus="hovered = line.participant.puuid"
                  @blur="hovered = null"
                >
                  <span class="legend__swatch" :style="{ background: line.color }" aria-hidden="true" />
                  <ChampionIcon :champion-id="line.participant.championId" :size="20" />
                  <span class="legend__player-name">{{ line.participant.riotId.gameName }}</span>
                  <span class="legend__value">{{ format(line.values[shownFrame] ?? 0) }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.details__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.details__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.details__title {
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}

.players {
  container: players / inline-size;
}

.players__layout {
  display: grid;
  gap: var(--space-4);
}

@container players (min-width: 760px) {
  .players__layout {
    grid-template-columns: minmax(0, 1fr) 340px;
  }
}

.players__chart {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  grid-template-rows: 240px 20px;
  column-gap: var(--space-2);
}

.players__y-axis,
.players__x-axis {
  position: relative;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.players__y-tick {
  position: absolute;
  right: 0;
  translate: 0 -50%;
}

.players__x-axis {
  grid-column: 2;
}

.players__x-tick {
  position: absolute;
  top: var(--space-1);
  translate: -50% 0;
}

.players__plot {
  position: relative;
  border-bottom: 1px solid var(--text-secondary);
  touch-action: pan-y;
}

.players__plot:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.players__svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.players__grid,
.players__line,
.players__cursor {
  vector-effect: non-scaling-stroke;
  fill: none;
}

.players__grid {
  stroke: var(--line);
}

.players__line {
  stroke-width: 1.5;
  stroke-linejoin: round;
  transition: opacity 150ms ease;
}

.players__line--highlighted {
  stroke-width: 3;
}

.players__line--faded {
  opacity: 0.2;
}

.players__cursor {
  stroke: var(--text-primary);
  stroke-opacity: 0.4;
}

/* ----- legend ----- */
.legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: var(--space-2) var(--space-4);
}

.legend__time {
  grid-column: 1 / -1;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.legend__name {
  margin-bottom: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 600;
}

.legend__team--blue .legend__name {
  color: var(--team-blue);
}

.legend__team--red .legend__name {
  color: var(--team-red);
}

.legend__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.legend__player {
  display: grid;
  grid-template-columns: 10px 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 2px var(--space-1);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-primary);
  font: inherit;
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
  transition: opacity 150ms ease;
}

.legend__player:hover {
  background: var(--fill-panel-2);
}

.legend__player[aria-pressed="true"] {
  border-color: var(--line);
  background: var(--fill-panel-2);
}

.legend__player--faded {
  opacity: 0.5;
}

.legend__swatch {
  width: 10px;
  height: 3px;
  border-radius: 2px;
}

.legend__player-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend__value {
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}
</style>
