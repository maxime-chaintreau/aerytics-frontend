<script setup lang="ts" generic="T extends Stats">
import { useId } from "vue";
import type { OptionStats as Stats } from "@/types/champion";
import OptionStats from "@/features/champion/components/OptionStats.vue";

defineProps<{
  /** read by screen readers: "Builds" */
  label: string;
  options: T[];
}>();

defineSlots<{
  default(props: { option: T; index: number }): unknown;
}>();

const selected = defineModel<number>({ required: true });
const name = useId();
</script>

<template>
  <fieldset class="option-picker">
    <legend class="visually-hidden">{{ label }}</legend>
    <label v-for="(option, index) in options" :key="index" class="option-picker__option">
      <input v-model="selected" class="visually-hidden" type="radio" :name="name" :value="index" />
      <span class="option-picker__card">
        <span class="option-picker__content"><slot :option="option" :index="index" /></span>
        <OptionStats :stats="option" compact />
      </span>
    </label>
  </fieldset>
</template>

<style scoped>
.option-picker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
}

.option-picker__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  height: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--fill-base);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}

.option-picker__content {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.option-picker__option:hover .option-picker__card {
  background: var(--fill-hover);
}

input:checked + .option-picker__card {
  border-color: var(--accent-gold);
  background: var(--fill-panel-2);
}

input:focus-visible + .option-picker__card {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
