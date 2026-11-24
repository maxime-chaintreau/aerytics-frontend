<script setup lang="ts">
import { useId } from "vue";

defineProps<{
  title: string;
}>();

const titleId = useId();
</script>

<template>
  <section class="not-found" :aria-labelledby="titleId">
    <div class="not-found__code" aria-hidden="true">
      <span>4</span>
      <svg class="not-found__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round">
        <circle cx="21" cy="21" r="13" stroke-width="4" />
        <path d="M31 31 41 41" stroke-width="5" />
        <path d="M16 16l10 10M26 16 16 26" stroke-width="3" />
      </svg>
      <span>4</span>
    </div>

    <h1 :id="titleId" class="not-found__title" tabindex="-1">{{ title }}</h1>
    <p v-if="$slots.default" class="not-found__text"><slot /></p>

    <div v-if="$slots.actions" class="not-found__actions">
      <slot name="actions" />
    </div>

    <div v-if="$slots.extra" class="not-found__extra">
      <slot name="extra" />
    </div>
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.not-found__code {
  display: flex;
  align-items: center;
  gap: 0.08em;
  font-family: var(--font-display);
  font-size: clamp(80px, 18vw, 160px);
  font-weight: 800;
  line-height: 1;
  color: color-mix(in srgb, var(--text-primary) 18%, transparent);
  user-select: none;
}

.not-found__icon {
  width: 0.78em;
  height: 0.78em;
  color: var(--accent-gold);
}

.not-found__title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.not-found__title:focus {
  outline: none;
}

.not-found__text {
  max-width: 52ch;
  color: var(--text-secondary);
}

.not-found__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

.not-found__extra {
  width: 100%;
  max-width: 640px;
  margin-top: var(--space-4);
}
</style>
