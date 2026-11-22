<script setup lang="ts">
import { useId } from "vue";

defineProps<{
  title: string;
  aside?: string; // small text on the right of the title
}>();

// unique id per panel, so the <section> can be named by its title
const titleId = useId();
</script>

<template>
  <section class="panel" :aria-labelledby="titleId">
    <header class="panel__header">
      <h2 :id="titleId" class="panel__title">{{ title }}</h2>
      <slot name="aside">
        <p v-if="aside" class="panel__aside">{{ aside }}</p>
      </slot>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--fill-panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  min-width: 0;
}

.panel__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.panel__title {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.panel__aside {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}
</style>
