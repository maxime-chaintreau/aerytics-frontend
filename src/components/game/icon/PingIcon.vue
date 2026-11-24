<script setup lang="ts">
import { computed } from "vue";
import type { PingType } from "@/types/match";

const props = defineProps<{ ping: PingType; fallback: string; size?: number }>();

const FILES = Object.fromEntries(
  Object.entries(import.meta.glob<string>("@/assets/riot/pings/*", { eager: true, query: "?url", import: "default" })).map(([path, url]) => [
    path
      .split("/")
      .at(-1)!
      .replace(/\.\w+$/, ""),
    url,
  ]),
);

const url = computed(() => FILES[props.ping]);
</script>

<template>
  <img v-if="url" class="ping-icon" :src="url" alt="" :style="size ? { width: `${size}px`, height: `${size}px` } : undefined" />
  <span v-else>{{ fallback }}</span>
</template>

<style scoped>
.ping-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
</style>
