<script setup lang="ts">
import { computed } from "vue";
import { useImageFallback } from "@/composables/useImageFallback";
import { useStaticDataStore } from "@/stores/staticData";

const props = defineProps<{ itemId: number; size?: number }>();

const sizeStyle = computed(() => (props.size ? { "--item-size": `${props.size}px` } : undefined));

const staticData = useStaticDataStore();

const item = computed(() => (props.itemId === 0 ? undefined : staticData.item(props.itemId)));
const src = computed(() => (item.value ? staticData.itemIconUrl(item.value) : undefined));

const { shown, onError } = useImageFallback(src);
</script>

<template>
  <img v-if="shown" class="item-icon" :src="shown" :alt="item?.name" :title="item?.name" :style="sizeStyle" :width="size ?? 24" :height="size ?? 24" loading="lazy" decoding="async" @error="onError" />
  <span
    v-else
    class="item-icon item-icon--empty"
    :style="sizeStyle"
    :role="itemId === 0 ? undefined : 'img'"
    :aria-label="itemId === 0 ? undefined : (item?.name ?? 'Objet')"
    :aria-hidden="itemId === 0 ? 'true' : undefined"
  />
</template>

<style scoped>
.item-icon {
  display: block;
  width: var(--item-size, 24px);
  height: var(--item-size, 24px);
  flex-shrink: 0;
  border-radius: var(--radius-sm);
}

.item-icon--empty {
  background: var(--fill-hover);
}
</style>
