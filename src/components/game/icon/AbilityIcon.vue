<script setup lang="ts">
import { useImageFallback } from "@/composables/useImageFallback";

const props = defineProps<{ src: string | undefined; size: number; letter?: string }>();

const { shown, onError } = useImageFallback(() => props.src);
</script>

<template>
  <span v-if="shown || letter" class="ability" :class="{ 'ability--image': shown }" :style="{ '--ability-size': `${size}px` }">
    <img v-if="shown" :src="shown" alt="" :width="size" :height="size" class="ability__image" @error="onError" />
    <span v-if="letter" class="ability__letter">{{ letter }}</span>
  </span>
</template>

<style scoped>
.ability {
  position: relative;
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: var(--ability-size);
  height: var(--ability-size);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-weight: var(--weight-bold);
}

.ability--image {
  border: 0;
}

.ability__image {
  display: block;
  border-radius: var(--radius-sm);
}

.ability--image .ability__letter {
  position: absolute;
  right: -4px;
  bottom: -4px;
  padding: 0 3px;
  border-radius: 2px;
  background: var(--fill-base);
  font-size: 10px;
  line-height: 1.3;
}
</style>
