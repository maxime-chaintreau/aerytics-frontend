<script setup lang="ts" generic="T extends string">
import { useId } from "vue";

withDefaults(
  defineProps<{
    /** read by screen readers: "Regrouper par" */
    label: string;
    options: { value: T; label: string }[];
    /** "sm": inside a card header ; "lg": main filter of a page */
    size?: "sm" | "lg";
  }>(),
  { size: "sm" },
);

defineSlots<{
  option?(props: { option: { value: T; label: string }; checked: boolean }): unknown;
}>();

const model = defineModel<T | null>({ required: true });

const name = useId();
</script>

<template>
  <fieldset class="segmented" :class="`segmented--${size}`">
    <legend class="visually-hidden">{{ label }}</legend>
    <label v-for="option in options" :key="option.value" class="segmented__option">
      <input v-model="model" class="visually-hidden" type="radio" :name="name" :value="option.value" />
      <span class="segmented__label">
        <slot name="option" :option="option" :checked="model === option.value">{{ option.label }}</slot>
      </span>
    </label>
  </fieldset>
</template>

<style scoped>
.segmented {
  display: inline-flex;
  margin: 0;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--fill-base);
}

.segmented__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 2px var(--space-2);
  border-radius: 2px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.segmented__option {
  position: relative;
}

.segmented__option:hover .segmented__label {
  color: var(--text-primary);
}

input:checked + .segmented__label {
  background: var(--fill-hover);
  color: var(--text-primary);
}

.segmented--lg {
  padding: 3px;
  border-radius: var(--radius-md);
}

.segmented--lg .segmented__label {
  min-height: 32px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.segmented--lg input:checked + .segmented__label {
  color: var(--accent-gold);
}

input:focus-visible + .segmented__label {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
</style>
