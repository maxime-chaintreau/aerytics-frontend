<script setup lang="ts">
import { useId } from "vue";

defineProps<{
  title: string;
}>();

const titleId = useId();
</script>

<template>
  <section class="empty-state" :aria-labelledby="titleId">
    <div v-if="$slots.icon" class="empty-state__icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <h2 :id="titleId" class="empty-state__title">{{ title }}</h2>
    <p v-if="$slots.default" class="empty-state__text"><slot /></p>
    <div v-if="$slots.actions" class="empty-state__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 320px;
  padding: var(--space-8) var(--space-4);
  text-align: center;
  background: var(--fill-panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  min-width: 0;
}

.empty-state__icon {
  margin-bottom: var(--space-2);
  color: var(--accent-gold);
}

.empty-state__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.empty-state__text {
  max-width: 42ch;
  color: var(--text-secondary);
}

.empty-state__actions {
  margin-top: var(--space-2);
}
</style>
