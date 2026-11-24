<script setup lang="ts">
import { computed, reactive } from "vue";
import type { MatchDetail } from "@/types/match";
import type { Region } from "@/types/riot";
import { useMatchTimeline } from "@/composables/useMatchQueries";
import { useChampionAbilities } from "@/composables/useChampionAbilities";
import { shopVisits, skillGrid, skillPriority } from "@/features/match/buildLogic";
import { SKILL_KEYS, SKILL_SLOTS } from "@/utils/skills";
import { useStaticDataStore } from "@/stores/staticData";
import { formatDuration } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import ItemIcon from "@/components/game/icon/ItemIcon.vue";
import AbilityIcon from "@/components/game/icon/AbilityIcon.vue";
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

const frames = computed(() => timeline.data?.players.find((player) => player.puuid === selected.value));
const visits = computed(() => shopVisits(frames.value?.items ?? []));
const grid = computed(() => skillGrid(frames.value?.skills ?? []));
const priority = computed(() => skillPriority(frames.value?.skills ?? []));
const levels = computed(() => frames.value?.skills.length ?? 0);
const championId = computed(() => props.match.participants.find((participant) => participant.puuid === selected.value)?.championId ?? null);
const { abilities } = useChampionAbilities(championId);

const itemName = (itemId: number) => staticData.item(itemId)?.name ?? "Objet";
</script>

<template>
  <Panel title="Build">
    <PlayerPicker v-model="selected" :participants="match.participants" label="Joueur affiché" class="build__picker" />

    <div v-if="timeline.error && !timeline.data" role="alert" class="build__message">
      <p>Impossible de charger le build.</p>
      <button type="button" class="button button--small" :disabled="timeline.isLoading" @click="timeline.refresh()">Réessayer</button>
    </div>

    <span v-else-if="!frames" class="skeleton build__skeleton" aria-hidden="true" />

    <div v-else class="build">
      <!-- ===== items, one group per visit to the shop ===== -->
      <section aria-labelledby="build-items">
        <h3 id="build-items" class="build__title">Objets</h3>
        <ol class="visits">
          <li v-for="visit in visits" :key="visit.time" class="visit">
            <ul class="visit__items">
              <li
                v-for="(item, index) in visit.items"
                :key="index"
                class="visit__item"
                :class="{ 'visit__item--sold': item.action === 'sell' }"
                :title="`${itemName(item.itemId)}${item.action === 'sell' ? ' (vendu)' : ''} · ${formatDuration(item.time)}`"
              >
                <ItemIcon :item-id="item.itemId" :size="28" />
                <span class="visually-hidden">{{ itemName(item.itemId) }}{{ item.action === "sell" ? ", vendu" : "" }}</span>
              </li>
            </ul>
            <time class="visit__time" :datetime="`PT${visit.time}S`">{{ formatDuration(visit.time) }}</time>
          </li>
        </ol>
      </section>

      <!-- ===== abilities ===== -->
      <section aria-labelledby="build-skills">
        <h3 id="build-skills" class="build__title">
          Compétences
          <span v-if="priority.length > 0" class="build__priority">
            <template v-for="(slot, index) in priority" :key="slot">
              <AbilityIcon :src="abilities?.[slot].src" :size="24" :letter="SKILL_KEYS[slot]" class="skill-icon" :class="`skill-key--${slot}`" />
              <span v-if="index < priority.length - 1" aria-label="puis"> › </span>
            </template>
          </span>
        </h3>

        <div class="skills__scroll">
          <table class="skills">
            <thead>
              <tr>
                <td />
                <th v-for="level in levels" :key="level" scope="col" class="skills__level">{{ level }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in SKILL_SLOTS" :key="slot">
                <th scope="row" class="skills__row-head">
                  <AbilityIcon :src="abilities?.[slot].src" :size="20" />
                  <span class="skill-key" :class="`skill-key--${slot}`">{{ SKILL_KEYS[slot] }}</span>
                  <span v-if="abilities" class="visually-hidden">({{ abilities[slot].name }})</span>
                </th>
                <td v-for="(leveled, index) in grid[slot]" :key="index" class="skills__cell">
                  <span v-if="leveled" class="skills__point" :class="`skills__point--${slot}`">{{ SKILL_KEYS[slot] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </Panel>
</template>

<style scoped>
.build__picker {
  margin-bottom: var(--space-4);
}

.build {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.build__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
}

.build__priority {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: 400;
  color: var(--text-secondary);
}

.visits {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.visit {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-sm);
  background: var(--fill-panel-2);
}

.visit + .visit::before {
  content: "›";
  position: absolute;
  top: 10px;
  left: calc(var(--space-2) / -2);
  translate: -50% 0;
  color: var(--text-secondary);
}

.visit__items {
  display: flex;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.visit__item {
  position: relative;
}

.visit__item--sold {
  filter: grayscale(1);
  opacity: 0.6;
}

.visit__item--sold::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, transparent calc(50% - 1px), var(--state-negative) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px));
}

.visit__time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ----- abilities ----- */
.skills__scroll {
  position: relative;
  overflow-x: auto;
}

.skills {
  border-collapse: separate;
  border-spacing: 2px;
  font-size: var(--text-xs);
}

.skills th,
.skills td {
  padding: 0;
  text-align: center;
}

.skills__level {
  width: 22px;
  font-weight: 400;
  color: var(--text-secondary);
}

.skills__cell {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: var(--fill-panel-2);
}

.skills__point {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: var(--skill-color);
  color: var(--fill-base);
  font-weight: 700;
}

.skills__row-head {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-right: var(--space-1);
}

.skill-icon :deep(.ability__letter) {
  color: var(--skill-color);
}

.skill-key {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 3px;
  background: var(--fill-panel-2);
  color: var(--skill-color);
  font-size: var(--text-xs);
  font-weight: 700;
}

.skill-key--1,
.skills__point--1 {
  --skill-color: #5fb4ff;
}

.skill-key--2,
.skills__point--2 {
  --skill-color: #4fd1a5;
}

.skill-key--3,
.skills__point--3 {
  --skill-color: #f0b44c;
}

.skill-key--4,
.skills__point--4 {
  --skill-color: #e05a7a;
}

.build__message {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.build__skeleton {
  display: block;
  height: 220px;
  border-radius: var(--radius-sm);
}
</style>
