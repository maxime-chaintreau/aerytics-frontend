<script setup lang="ts">
import { nextTick, ref, useId, useTemplateRef, watch } from "vue";

defineProps<{
  title: string;
  subtitle?: string;
  size?: "md" | "lg";
}>();

const open = defineModel<boolean>("open", { required: true });

const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const titleId = useId();

const rendered = ref(false);

watch(
  open,
  async (isOpen) => {
    if (isOpen) rendered.value = true;
    await nextTick();
    const element = dialog.value;
    if (!element) return;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  },
  { immediate: true },
);

function onClose() {
  open.value = false;
}

function onClick(event: MouseEvent) {
  if (event.target === dialog.value) dialog.value?.close();
}
</script>

<template>
  <dialog ref="dialog" class="dialog" :class="{ 'dialog--lg': size === 'lg' }" :aria-labelledby="titleId" @close="onClose" @click="onClick">
    <div v-if="rendered" class="dialog__panel">
      <header class="dialog__header">
        <div>
          <h2 :id="titleId" class="dialog__title">{{ title }}</h2>
          <p v-if="subtitle" class="dialog__subtitle">{{ subtitle }}</p>
        </div>
        <button type="button" class="dialog__close" aria-label="Fermer" autofocus @click="dialog?.close()">✕</button>
      </header>
      <div class="dialog__body">
        <slot />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(720px, calc(100vw - 2 * var(--space-4)));
  max-height: calc(100dvh - 2 * var(--space-8));
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--fill-panel);
  color: var(--text-primary);
  box-shadow: 0 24px 64px rgb(0 0 0 / 0.5);
  opacity: 0;
  translate: 0 8px;
  transition:
    opacity 0.15s,
    translate 0.15s,
    overlay 0.15s allow-discrete,
    display 0.15s allow-discrete;
}

.dialog[open] {
  opacity: 1;
  translate: 0 0;
}

@starting-style {
  .dialog[open] {
    opacity: 0;
    translate: 0 8px;
  }
}

.dialog::backdrop {
  background: rgb(0 0 0 / 0.6);
}

.dialog--lg {
  width: min(1080px, calc(100vw - 2 * var(--space-4)));
}

.dialog__panel {
  display: flex;
  flex-direction: column;
  max-height: inherit;
}

.dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--line);
}

.dialog__title {
  font-size: var(--text-lg);
}

.dialog__subtitle {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dialog__close {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.dialog__close:hover {
  color: var(--text-primary);
  background: var(--fill-hover);
}

.dialog__body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-4);
}

@media (prefers-reduced-motion: reduce) {
  .dialog {
    transition: none;
  }
}
</style>

<style>
html:has(dialog[open]) {
  overflow: hidden;
}
</style>
