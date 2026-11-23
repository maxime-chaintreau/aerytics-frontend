<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { MatchDetail, MatchParticipant, TeamSide } from "@/types/match";
import type { FrameStat, MatchTimeline, TimelineEvent } from "@/types/timeline";
import { focusedParticipant } from "@/features/match/matchLogic";
import { type EventFilter, dragonType, eventLabel, eventSide, filterEvents, linePath, nearestFrame, playersLimit, timeTicks } from "@/features/match/timelineLogic";
import { useStaticDataStore } from "@/stores/staticData";
import { formatCompact, formatDuration, formatInteger } from "@/utils/format";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import ObjectiveIcon from "@/components/game/icon/ObjectiveIcon.vue";

const props = defineProps<{ match: MatchDetail; timeline: MatchTimeline }>();
/** shared with the main block: switching here switches there too */
const stat = defineModel<FrameStat>("stat", { required: true });

const staticData = useStaticDataStore();

const STATS: { value: FrameStat; label: string }[] = [
  { value: "gold", label: "Or" },
  { value: "xp", label: "XP" },
  { value: "cs", label: "CS" },
  { value: "damage", label: "Dégâts" },
];

const SIDES: { side: TeamSide; name: string }[] = [
  { side: "BLUE", name: "Équipe bleue" },
  { side: "RED", name: "Équipe rouge" },
];

const playerOf = (puuid: string) => props.match.participants.find((participant) => participant.puuid === puuid);
const championName = (participant: MatchParticipant | undefined) => (participant ? (staticData.champion(participant.championId)?.name ?? "…") : "Sbires");

// ---------- Players chart ----------

const frameTimes = computed(() => props.timeline.frameTimes);
const duration = computed(() => frameTimes.value.at(-1) ?? props.match.durationSeconds);
const limit = computed(() => playersLimit(props.timeline, stat.value));
const xTicks = computed(() => timeTicks(duration.value));
const yTicks = computed(() => [limit.value, (limit.value * 3) / 4, limit.value / 2, limit.value / 4]);

const SHADES = ["", "white 30%", "black 30%", "white 55%", "black 50%"];

const lines = computed(() =>
  SIDES.flatMap(({ side }) =>
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
  SIDES.map(({ side, name }) => ({
    side,
    name,
    players: lines.value.filter((line) => line.participant.side === side),
  })),
);

const chartId = useId();

// ---------- Events ----------

const FILTERS: { value: EventFilter; label: string }[] = [
  { value: "objectives", label: "Objectifs" },
  { value: "kills", label: "Kills" },
  { value: "all", label: "Tout" },
];
const filter = ref<EventFilter>("objectives");
const shownEvents = computed(() => filterEvents(props.timeline.events, filter.value));

function creditOf(event: TimelineEvent): MatchParticipant | undefined {
  return event.killer ? playerOf(event.killer) : undefined;
}

function objectiveIcon(event: TimelineEvent) {
  if (event.kind === "monster") return event.monster;
  if (event.kind === "building") return event.building;
  return null;
}
</script>

<template>
  <div class="details">
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

          <!-- ----- Legend: value at the hovered minute (or the end), click = highlight ----- -->
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

    <!-- ===== 2. Every event ===== -->
    <section class="details__section" :aria-labelledby="`${chartId}-events`">
      <div class="details__heading">
        <h3 :id="`${chartId}-events`" class="details__title">Événements</h3>
        <SegmentedControl v-model="filter" label="Événements affichés" :options="FILTERS" size="sm" />
      </div>

      <p v-if="shownEvents.length === 0" class="details__empty">Aucun événement.</p>
      <ol v-else class="events">
        <li v-for="(event, index) in shownEvents" :key="index" class="event" :class="`event--${(eventSide(event, playerOf) ?? 'BLUE').toLowerCase()}`">
          <time class="event__time" :datetime="`PT${event.time}S`">{{ formatDuration(event.time) }}</time>

          <!-- kill: killer → victim, assists after -->
          <template v-if="event.kind === 'kill'">
            <span class="event__fight">
              <ChampionIcon :champion-id="playerOf(event.killer)?.championId ?? 0" :size="24" />
              <span class="event__arrow" aria-hidden="true">→</span>
              <ChampionIcon :champion-id="playerOf(event.victim)?.championId ?? 0" :size="24" />
            </span>
            <span class="event__label">
              {{ championName(playerOf(event.killer)) }} tue
              {{ championName(playerOf(event.victim)) }}
              <span v-if="event.firstBlood" class="event__tag">Premier sang</span>
              <span v-if="event.bounty > 400" class="event__tag">Prime {{ formatInteger(event.bounty) }}</span>
            </span>
            <span v-if="event.assists.length > 0" class="event__assists">
              <span class="visually-hidden">Assistances :</span>
              <ChampionIcon v-for="puuid in event.assists" :key="puuid" :champion-id="playerOf(puuid)?.championId ?? 0" :size="18" :title="championName(playerOf(puuid))" />
            </span>
          </template>

          <!-- objective: icon (+ the dragon's element), name, who took it -->
          <template v-else>
            <span class="event__objective">
              <ObjectiveIcon :objective="objectiveIcon(event)!" :side="event.side" :size="20" />
              <span v-if="dragonType(event)" class="dragon-dot" :class="`dragon-dot--${dragonType(event)}`" aria-hidden="true" />
            </span>
            <span class="event__label">
              {{ eventLabel(event, playerOf) }}
            </span>
            <span class="event__credit">
              <ChampionIcon v-if="creditOf(event)" :champion-id="creditOf(event)!.championId" :size="18" />
              {{ championName(creditOf(event)) }}
            </span>
          </template>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

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

.details__empty {
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

/* ===== events ===== */
.events {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.event {
  display: grid;
  grid-template-columns: 44px auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-1) var(--space-2);
  border-left: 3px solid var(--event-color);
  font-size: var(--text-sm);
}

.event + .event {
  border-top: 1px solid var(--line);
}

.event--blue {
  --event-color: var(--team-blue);
}

.event--red {
  --event-color: var(--team-red);
}

.event__time {
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.event__fight,
.event__assists,
.event__credit {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.event__arrow {
  color: var(--event-color);
}

.event__label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-2);
}

.event__tag {
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--fill-panel-2);
  font-size: var(--text-xs);
  color: var(--accent-gold);
}

.event__credit {
  color: var(--text-secondary);
}

.event__objective {
  position: relative;
  display: grid;
  place-items: center;
  width: 24px;
}

.dragon-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 9px;
  height: 9px;
  border: 2px solid var(--fill-panel);
  border-radius: 50%;
  background: var(--dragon-color);
}

.dragon-dot--air {
  --dragon-color: #a8dcea;
}

.dragon-dot--earth {
  --dragon-color: #b8814a;
}

.dragon-dot--fire {
  --dragon-color: #f06a3a;
}

.dragon-dot--water {
  --dragon-color: #3cc6c0;
}

.dragon-dot--hextech {
  --dragon-color: #5fb4ff;
}

.dragon-dot--chemtech {
  --dragon-color: #9ad13c;
}

.dragon-dot--elder {
  --dragon-color: #c8a8ff;
}

@media (max-width: 560px) {
  .event {
    grid-template-columns: 40px auto minmax(0, 1fr);
  }

  .event__assists,
  .event__credit {
    grid-column: 3;
  }
}
</style>
