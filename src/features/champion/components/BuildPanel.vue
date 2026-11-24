<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ChampionStats } from "@/types/champion";
import { useStaticDataStore } from "@/stores/staticData";
import Panel from "@/components/ui/Panel.vue";
import ItemIcon from "@/components/game/icon/ItemIcon.vue";
import OptionPicker from "@/features/champion/components/OptionPicker.vue";
import OptionStats from "@/features/champion/components/OptionStats.vue";

const props = defineProps<{ stats: ChampionStats }>();

const staticData = useStaticDataStore();
const itemName = (itemId: number) => staticData.item(itemId)?.name ?? "Objet";

const selected = ref(0);
watch(
  () => props.stats.builds,
  () => (selected.value = 0),
);
const build = computed(() => props.stats.builds[selected.value] ?? props.stats.builds[0]);
</script>

<template>
  <Panel title="Build">
    <template v-if="build">
      <OptionPicker v-slot="{ option }" v-model="selected" label="Builds les plus joués" :options="stats.builds">
        <ItemIcon v-for="itemId in option.items" :key="itemId" :item-id="itemId" :size="28" />
      </OptionPicker>

      <ol class="build__core" aria-label="Objets principaux, dans l'ordre d'achat">
        <li v-for="itemId in build.items" :key="itemId" class="build__core-item">
          <ItemIcon :item-id="itemId" :size="48" />
          <span class="build__core-name">{{ itemName(itemId) }}</span>
        </li>
      </ol>
    </template>

    <div class="build__groups">
      <section class="build__group" aria-labelledby="build-starting">
        <h3 id="build-starting" class="build__heading">Départ</h3>
        <ul class="build__list">
          <li v-for="(start, index) in stats.startingItems" :key="index" class="build__row">
            <span class="build__icons">
              <ItemIcon v-for="(itemId, slot) in start.items" :key="slot" :item-id="itemId" :size="28" />
            </span>
            <OptionStats :stats="start" compact />
          </li>
        </ul>
      </section>

      <section class="build__group" aria-labelledby="build-boots">
        <h3 id="build-boots" class="build__heading">Bottes</h3>
        <ul class="build__list">
          <li v-for="boots in stats.boots" :key="boots.itemId" class="build__row">
            <span class="build__icons">
              <ItemIcon :item-id="boots.itemId" :size="28" />
              <span class="build__name">{{ itemName(boots.itemId) }}</span>
            </span>
            <OptionStats :stats="boots" compact />
          </li>
        </ul>
      </section>

      <section class="build__group build__group--wide" aria-labelledby="build-situational">
        <h3 id="build-situational" class="build__heading">Objets situationnels</h3>
        <ul class="build__list build__list--grid">
          <li v-for="item in stats.situationalItems" :key="item.itemId" class="build__row">
            <span class="build__icons">
              <ItemIcon :item-id="item.itemId" :size="28" />
              <span class="build__name">{{ itemName(item.itemId) }}</span>
            </span>
            <OptionStats :stats="item" compact />
          </li>
        </ul>
      </section>
    </div>
  </Panel>
</template>

<style scoped>
.build__core {
  --core-gap: var(--space-6);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-2) var(--core-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

.build__core-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  width: 80px;
  text-align: center;
}

.build__core-item + .build__core-item::before {
  content: "›";
  position: absolute;
  top: 10px;
  left: calc(-1 * var(--core-gap));
  width: var(--core-gap);
  font-size: var(--text-lg);
  line-height: 1;
  text-align: center;
  color: var(--text-secondary);
}

.build__core-name {
  font-size: var(--text-xs);
  line-height: 1.3;
  color: var(--text-secondary);
}

.build__groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--line);
}

.build__group--wide {
  grid-column: 1 / -1;
}

.build__heading {
  margin-bottom: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.build__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.build__list--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-2) var(--space-4);
}

.build__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.build__icons {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
}

.build__name {
  margin-left: var(--space-1);
  overflow: hidden;
  font-size: var(--text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>