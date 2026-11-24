<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
}>();
</script>

<template>
  <div class="stat-tile">
    <!-- label first in the HTML (read first), value first on screen (CSS order) -->
    <dt class="stat-tile__label">{{ label }}</dt>
    <dd class="stat-tile__value">{{ value }}</dd>
  </div>
</template>

<style scoped>
.stat-tile {
  display: flex;
  flex-direction: column-reverse;
  gap: var(--space-1);
}

.stat-tile__value {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  line-height: 1;
}

.stat-tile__label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}
</style>
