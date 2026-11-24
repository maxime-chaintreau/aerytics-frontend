<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ChampionStats } from "@/types/champion";
import type { RunePage } from "@/types/match";
import { useStaticDataStore } from "@/stores/staticData";
import Panel from "@/components/ui/Panel.vue";
import RuneIcon from "@/components/game/icon/RuneIcon.vue";
import SummonerSpellIcon from "@/components/game/icon/SummonerSpellIcon.vue";
import RunePageDetail from "@/components/game/RunePageDetail.vue";
import OptionPicker from "@/features/champion/components/OptionPicker.vue";
import OptionStats from "@/features/champion/components/OptionStats.vue";

const props = defineProps<{ stats: ChampionStats }>();

const staticData = useStaticDataStore();

const selected = ref(0);
watch(
  () => props.stats.runes,
  () => (selected.value = 0),
);
const page = computed(() => (props.stats.runes[selected.value] ?? props.stats.runes[0])?.page);

const keystoneOf = (page: RunePage) => page.primary[0] ?? page.primaryStyle;

const spellNames = (spells: [number, number]) => spells.map((key) => staticData.summonerSpell(key)?.name ?? "Sort").join(" + ");
</script>

<template>
  <Panel title="Runes">
    <template v-if="page">
      <OptionPicker v-slot="{ option }" v-model="selected" label="Pages de runes les plus jouées" :options="stats.runes">
        <RuneIcon :rune-id="keystoneOf(option.page)" :size="32" decorative />
        <RuneIcon :rune-id="option.page.subStyle" :size="20" />
        <span class="runes__keystone">{{ staticData.rune(keystoneOf(option.page))?.name }}</span>
      </OptionPicker>

      <RunePageDetail :runes="page" />
    </template>

    <section class="runes__spells" aria-labelledby="runes-spells">
      <h3 id="runes-spells" class="runes__heading">Sorts d'invocateur</h3>
      <ul class="runes__list">
        <li v-for="pair in stats.summonerSpells" :key="pair.spells.join('-')" class="runes__row">
          <span class="runes__pair">
            <SummonerSpellIcon v-for="key in pair.spells" :key="key" :spell-key="key" :size="28" decorative />
            <span class="runes__pair-name">{{ spellNames(pair.spells) }}</span>
          </span>
          <OptionStats :stats="pair" />
        </li>
      </ul>
    </section>
  </Panel>
</template>

<style scoped>
.runes__keystone {
  margin-left: var(--space-1);
  overflow: hidden;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runes__spells {
  padding-top: var(--space-4);
  border-top: 1px solid var(--line);
}

.runes__heading {
  margin-bottom: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.runes__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.runes__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
}

.runes__pair {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.runes__pair-name {
  margin-left: var(--space-2);
  font-size: var(--text-sm);
}
</style>
