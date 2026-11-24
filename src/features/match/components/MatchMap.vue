<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { MatchDetail, TeamSide } from "@/types/match";
import type { Region } from "@/types/riot";
import type { KillEvent } from "@/types/timeline";
import { useMatchTimeline } from "@/composables/useMatchQueries";
import { type GamePhase, eventLabel, inPhase, mapPosition } from "@/features/match/timelineLogic";
import { useStaticDataStore } from "@/stores/staticData";
import { formatDuration } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import PlayerPicker from "@/features/match/components/PlayerPicker.vue";

const props = defineProps<{ match: MatchDetail; region: Region }>();
const selected = defineModel<string>("selected", { required: true });

const staticData = useStaticDataStore();
const timeline = reactive(
  useMatchTimeline(
    () => props.region,
    () => props.match.matchId,
  ),
);

const PHASES: { value: GamePhase; label: string }[] = [
  { value: "all", label: "Toute la partie" },
  { value: "early", label: "0–14 min" },
  { value: "mid", label: "14–25 min" },
  { value: "late", label: "25 min +" },
];
const phase = ref<GamePhase>("all");

type Involvement = "all" | "kills" | "deaths";
const INVOLVEMENTS: { value: Involvement; label: string }[] = [
  { value: "all", label: "Tous les kills" },
  { value: "kills", label: "Ses kills" },
  { value: "deaths", label: "Ses morts" },
];
const involvement = ref<Involvement>("all");

const playerOf = (puuid: string) => props.match.participants.find((participant) => participant.puuid === puuid);
const sideOf = (puuid: string): TeamSide => playerOf(puuid)?.side ?? "BLUE";

const kills = computed(() =>
  (timeline.data?.events ?? []).filter((event): event is KillEvent => {
    if (event.kind !== "kill" || !inPhase(event.time, phase.value)) return false;
    if (involvement.value === "kills") return event.killer === selected.value || event.assists.includes(selected.value);
    if (involvement.value === "deaths") return event.victim === selected.value;
    return true;
  }),
);

const mapUrl = computed(() => staticData.mapUrl(11));
const markerStyle = (kill: KillEvent) => {
  const { left, top } = mapPosition(kill.position);
  return { left: `${left * 100}%`, top: `${top * 100}%` };
};

const isMine = (kill: KillEvent) => kill.killer === selected.value || kill.victim === selected.value;
</script>

<template>
  <Panel title="Carte des kills">
    <PlayerPicker v-model="selected" :participants="match.participants" label="Joueur mis en avant" class="map__picker" />

    <div class="map__filters">
      <SegmentedControl v-model="phase" label="Phase de jeu" :options="PHASES" />
      <SegmentedControl v-model="involvement" label="Kills affichés" :options="INVOLVEMENTS" />
    </div>

    <div v-if="timeline.error && !timeline.data" role="alert" class="map__message">
      <p>Impossible de charger les positions des kills.</p>
      <button type="button" class="button button--small" :disabled="timeline.isLoading" @click="timeline.refresh()">Réessayer</button>
    </div>

    <span v-else-if="!timeline.data" class="skeleton map__skeleton" aria-hidden="true" />

    <div v-else class="map__layout">
      <div class="map">
        <img v-if="mapUrl" class="map__image" :src="mapUrl" alt="" width="512" height="512" />
        <ul class="map__markers" :aria-label="`${kills.length} kills sur la carte`">
          <li
            v-for="(kill, index) in kills"
            :key="index"
            class="map__marker"
            :class="[`map__marker--${sideOf(kill.killer).toLowerCase()}`, { 'map__marker--mine': involvement === 'all' && isMine(kill) }]"
            :style="markerStyle(kill)"
            :title="`${formatDuration(kill.time)} · ${eventLabel(kill, playerOf)}`"
          >
            <ChampionIcon :champion-id="playerOf(kill.victim)?.championId ?? 0" :size="20" decorative />
            <span class="visually-hidden">{{ formatDuration(kill.time) }} : {{ eventLabel(kill, playerOf) }}</span>
          </li>
        </ul>
      </div>

      <div class="map__side">
        <p class="map__count">
          <strong>{{ kills.length }}</strong> kill{{ kills.length > 1 ? "s" : "" }}
          <span class="map__muted">· icône = champion tué, cadre = équipe du tueur</span>
        </p>
        <ul class="map__legend" aria-hidden="true">
          <li><span class="map__swatch map__swatch--blue" /> Tué par l'équipe bleue</li>
          <li><span class="map__swatch map__swatch--red" /> Tué par l'équipe rouge</li>
          <li v-if="involvement === 'all'"><span class="map__swatch map__swatch--mine" /> Implique le joueur sélectionné</li>
        </ul>
        <p class="map__muted">Les balises n'apparaissent pas : Riot donne le moment où elles sont posées, pas leur position.</p>
      </div>
    </div>
  </Panel>
</template>

<style scoped>
.map__picker {
  margin-bottom: var(--space-3);
}

.map__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.map__layout {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.map {
  position: relative;
  flex: 1 1 320px;
  max-width: 512px;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--fill-base);
}

.map__image {
  display: block;
  width: 100%;
  height: 100%;
  filter: saturate(0.6) brightness(0.75);
}

.map__markers {
  margin: 0;
  padding: 0;
  list-style: none;
}

.map__marker {
  position: absolute;
  translate: -50% -50%;
  display: grid;
  border: 2px solid var(--marker-color);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.6);
  transition: scale 0.1s;
}

.map__marker:hover {
  z-index: 1;
  scale: 1.5;
}

.map__marker--blue {
  --marker-color: var(--team-blue);
}

.map__marker--red {
  --marker-color: var(--team-red);
}

.map__marker--mine {
  z-index: 1;
  outline: 2px solid var(--accent-gold);
}

.map__side {
  display: flex;
  flex: 1 1 200px;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.map__muted {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.map__legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-xs);
}

.map__legend li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.map__swatch {
  width: 12px;
  height: 12px;
  border: 2px solid var(--marker-color, var(--accent-gold));
  border-radius: 50%;
}

.map__swatch--blue {
  --marker-color: var(--team-blue);
}

.map__swatch--red {
  --marker-color: var(--team-red);
}

.map__message {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.map__skeleton {
  display: block;
  max-width: 512px;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
}
</style>
