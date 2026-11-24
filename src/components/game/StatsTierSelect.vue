<script setup lang="ts">
import { computed } from "vue";
import type { StatsTier } from "@/types/champion";
import { STATS_TIER_OPTIONS } from "@/utils/statsTier";

withDefaults(defineProps<{ size?: "sm" | "lg" }>(), { size: "sm" });

const model = defineModel<StatsTier | null>({ required: true });

const choice = computed<StatsTier | "">({
  get: () => model.value ?? "",
  set: (value) => (model.value = value || null),
});
</script>

<template>
  <label class="stats-tier" :class="`stats-tier--${size}`">
    <span class="visually-hidden">Rangs pris en compte</span>
    <select v-model="choice" class="stats-tier__select">
      <option v-for="option in STATS_TIER_OPTIONS" :key="option.value ?? 'all'" :value="option.value ?? ''">{{ option.label }}</option>
    </select>
  </label>
</template>

<style scoped>
.stats-tier__select {
  padding: 2px var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--fill-panel-2);
  color: var(--text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
}

.stats-tier--lg .stats-tier__select {
  min-height: 40px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
}

.stats-tier__select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
</style>