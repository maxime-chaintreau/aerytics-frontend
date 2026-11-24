<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ChampionStats } from "@/types/champion";
import { useChampionAbilities } from "@/composables/useChampionAbilities";
import { formatCooldowns, skillLevels } from "@/features/champion/championLogic";
import { SKILL_KEYS, SKILL_SLOTS } from "@/utils/skills";
import Panel from "@/components/ui/Panel.vue";
import OptionPicker from "@/features/champion/components/OptionPicker.vue";
import AbilityIcon from "@/components/game/icon/AbilityIcon.vue";

const props = defineProps<{ stats: ChampionStats }>();

const { details, abilities, passiveIcon } = useChampionAbilities(() => props.stats.championId);

const selected = ref(0);
watch(
  () => props.stats.skillOrders,
  () => (selected.value = 0),
);
const skillOrder = computed(() => props.stats.skillOrders[selected.value] ?? props.stats.skillOrders[0]);
const rows = computed(() => (skillOrder.value ? skillLevels(skillOrder.value.order) : []));
const LEVELS = Array.from({ length: 18 }, (_, index) => index + 1);

const slotAt = (index: number) => SKILL_SLOTS[index]!;
</script>

<template>
  <Panel title="Compétences">
    <template v-if="skillOrder">
      <OptionPicker v-slot="{ option }" v-model="selected" label="Ordres de compétences les plus joués" :options="stats.skillOrders">
        <template v-for="(slot, index) in option.priority" :key="slot">
          <span v-if="index > 0" class="skills__arrow" aria-hidden="true">›</span>
          <AbilityIcon :src="abilities?.[slot].src" :size="28" :letter="SKILL_KEYS[slot]" />
        </template>
        <span class="visually-hidden">: priorité de montée</span>
      </OptionPicker>

      <div class="skills__grid-wrapper">
        <table class="skills__grid">
          <caption class="visually-hidden">
            Niveaux auxquels chaque compétence est montée
          </caption>
          <thead class="visually-hidden">
            <tr>
              <th scope="col">Compétence</th>
              <th v-for="level in LEVELS" :key="level" scope="col">Niveau {{ level }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(levels, index) in rows" :key="index">
              <th scope="row" class="skills__row-head">
                <AbilityIcon :src="abilities?.[slotAt(index)].src" :size="24" />
                <span>{{ SKILL_KEYS[slotAt(index)] }}</span>
                <span v-if="abilities" class="visually-hidden">({{ abilities[slotAt(index)].name }})</span>
              </th>
              <td v-for="level in LEVELS" :key="level" :class="{ 'skills__cell--on': levels.includes(level), 'skills__cell--ult': index === 3 }">
                <span v-if="levels.includes(level)">{{ level }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <details v-if="details" class="skills__details">
      <summary>Détail des compétences</summary>
      <ul class="skills__abilities">
        <li class="skills__ability">
          <AbilityIcon :src="passiveIcon" :size="40" />
          <div>
            <p class="skills__ability-name"><span class="skills__ability-key">Passif</span> {{ details.passive.name }}</p>
            <p class="skills__ability-text">{{ details.passive.description }}</p>
          </div>
        </li>
        <li v-for="(spell, index) in details.spells" :key="spell.id" class="skills__ability">
          <AbilityIcon :src="abilities?.[slotAt(index)].src" :size="40" />
          <div>
            <p class="skills__ability-name">
              <AbilityIcon :src="abilities?.[slotAt(index)].src" :size="40" />
              <span class="skills__ability-key">{{ SKILL_KEYS[slotAt(index)] }}</span> {{ spell.name }}
            </p>
            <p v-if="formatCooldowns(spell.cooldowns)" class="skills__ability-meta">Délai de récupération : {{ formatCooldowns(spell.cooldowns) }}</p>
            <p class="skills__ability-text">{{ spell.description }}</p>
          </div>
        </li>
      </ul>
    </details>
  </Panel>
</template>

<style scoped>
.skills__arrow {
  color: var(--text-secondary);
}

.skills__grid-wrapper {
  overflow-x: auto;
}

.skills__grid {
  border-collapse: separate;
  border-spacing: 3px;
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
}

.skills__row-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-right: var(--space-2);
  font-weight: var(--weight-bold);
}

.skills__grid td {
  width: 24px;
  min-width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 3px;
  background: var(--fill-base);
  text-align: center;
}

.skills__grid td.skills__cell--on {
  background: var(--accent);
  color: var(--fill-base);
  font-weight: var(--weight-bold);
}

.skills__grid td.skills__cell--on.skills__cell--ult {
  background: var(--accent-gold);
}

.skills__details {
  padding-top: var(--space-3);
  border-top: 1px solid var(--line);
}

.skills__details summary {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  cursor: pointer;
}

.skills__details summary:hover {
  color: var(--text-primary);
}

.skills__abilities {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}

.skills__ability {
  display: flex;
  gap: var(--space-3);
}

.skills__ability-name {
  font-weight: var(--weight-semibold);
}

.skills__ability-key {
  margin-right: var(--space-1);
  color: var(--accent-gold);
}

.skills__ability-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.skills__ability-text {
  margin-top: var(--space-1);
  max-width: 75ch;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--text-secondary);
}
</style>
