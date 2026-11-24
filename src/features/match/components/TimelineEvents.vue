<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { MatchDetail, MatchParticipant } from "@/types/match";
import type { MatchTimeline, TimelineEvent } from "@/types/timeline";
import { type EventFilter, dragonType, eventLabel, eventSide, filterEvents } from "@/features/match/timelineLogic";
import { useStaticDataStore } from "@/stores/staticData";
import { formatDuration, formatInteger } from "@/utils/format";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import ObjectiveIcon from "@/components/game/icon/ObjectiveIcon.vue";

const props = defineProps<{ match: MatchDetail; timeline: MatchTimeline }>();

const staticData = useStaticDataStore();

const playerOf = (puuid: string) => props.match.participants.find((participant) => participant.puuid === puuid);
const championName = (participant: MatchParticipant | undefined) => (participant ? (staticData.champion(participant.championId)?.name ?? "…") : "Sbires");

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

const titleId = useId();
</script>

<template>
  <section class="details__section" :aria-labelledby="titleId">
    <div class="details__heading">
      <h3 :id="titleId" class="details__title">Événements</h3>
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

.details__empty {
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
