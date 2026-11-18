<script setup lang="ts">
withDefaults(defineProps<{ tone?: "neutral" | "gold" | "positive" | "negative" }>(), { tone: "neutral" });
</script>

<template>
  <span class="tag" :class="`tag--${tone}`"><slot /></span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border: 1px solid currentColor;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

.tag--neutral {
  color: var(--text-secondary);
}

.tag--gold {
  color: var(--accent-gold);
}

.tag--positive {
  color: var(--state-positive);
}

.tag--negative {
  color: var(--state-negative);
}
</style>
