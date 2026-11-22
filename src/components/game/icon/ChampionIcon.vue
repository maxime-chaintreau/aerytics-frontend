<script setup lang="ts">
import { computed, ref } from "vue";
import { useStaticDataStore } from "@/stores/staticData";
import placeholderUrl from "@/assets/riot/champion-none.png";

const props = withDefaults(
  defineProps<{
    championId: number;
    /** displayed size in px */
    size?: number;
    /** true when the champion's name is already written next to the icon */
    decorative?: boolean;
  }>(),
  { decorative: false },
);

const sizeStyle = computed(() => (props.size ? { "--champion-size": `${props.size}px` } : undefined));

const staticData = useStaticDataStore();

const champion = computed(() => staticData.champion(props.championId));
const src = computed(() => (champion.value ? staticData.championIconUrl(champion.value) : undefined));

// broken image (404, network): show the placeholder instead of a broken icon
const failedSrc = ref<string>();
const failed = computed(() => src.value !== undefined && src.value === failedSrc.value);

const unknown = computed(() => failed.value || (staticData.status === "success" && !champion.value));
</script>

<template>
  <img
    v-if="src && !failed"
    class="champion-icon"
    :src="src"
    :alt="decorative ? '' : champion?.name"
    :title="champion?.name"
    :style="sizeStyle"
    :width="size ?? 32"
    :height="size ?? 32"
    loading="lazy"
    decoding="async"
    @error="failedSrc = src"
  />
  <img v-else-if="unknown" class="champion-icon" :src="placeholderUrl" :alt="decorative ? '' : 'Champion inconnu'" :style="sizeStyle" :width="size ?? 32" :height="size ?? 32" />
  <span
    v-else
    class="champion-icon champion-icon--placeholder"
    :style="sizeStyle"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : (champion?.name ?? 'Champion')"
    :aria-hidden="decorative ? 'true' : undefined"
  />
</template>

<style scoped>
.champion-icon {
  display: block;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  object-fit: cover;
  width: var(--champion-size, 32px);
  height: var(--champion-size, 32px);
}

.champion-icon--placeholder {
  background: var(--fill-hover);
}
</style>
