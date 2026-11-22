<script setup lang="ts">
import { computed, ref } from "vue";
import { useStaticDataStore } from "@/stores/staticData";

const props = defineProps<{ itemId: number; size?: number }>();

const sizeStyle = computed(() => (props.size ? { "--item-size": `${props.size}px` } : undefined));

const staticData = useStaticDataStore();

const item = computed(() => (props.itemId === 0 ? undefined : staticData.item(props.itemId)));
const src = computed(() => (item.value ? staticData.itemIconUrl(item.value) : undefined));

const failedSrc = ref<string>();
const failed = computed(() => src.value !== undefined && src.value === failedSrc.value);
</script>

<template>
  <img
    v-if="src && !failed"
    class="item-icon"
    :src="src"
    :alt="item?.name"
    :title="item?.name"
    :style="sizeStyle"
    :width="size ?? 24"
    :height="size ?? 24"
    loading="lazy"
    decoding="async"
    @error="failedSrc = src"
  />
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
