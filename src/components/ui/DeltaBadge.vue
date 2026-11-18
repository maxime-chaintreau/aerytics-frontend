<script setup lang="ts">
type Comparison = "better" | "worse" | "equal";

const props = defineProps<{ comparison: Comparison }>();

const ARROWS: Record<Comparison, string> = { better: "▲", worse: "▼", equal: "≈" };
const WORDS: Record<Comparison, string> = {
  better: "mieux que",
  worse: "moins bien que",
  equal: "proche de",
};
</script>

<template>
  <span class="delta" :class="`delta--${props.comparison}`">
    <span aria-hidden="true">{{ ARROWS[props.comparison] }}</span>
    <span class="visually-hidden">{{ WORDS[props.comparison] }}</span>
    <slot />
  </span>
</template>

<style scoped>
.delta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border: 1px solid currentColor;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  white-space: nowrap;
}

.delta--better {
  color: var(--state-positive);
}

.delta--worse {
  color: var(--state-negative);
}

.delta--equal {
  color: var(--text-secondary);
}
</style>
