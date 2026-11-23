<script setup lang="ts">
import { computed } from "vue";
import type { Tier } from "@/types/riot";
import { formatTier } from "@/utils/labels";

const files = import.meta.glob<string>("@/assets/riot/ranks/*", { eager: true, query: "?url", import: "default" });
const CRESTS: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  CRESTS[path.split("/").pop()!.split(".")[0]!] = url;
}

const props = withDefaults(
  defineProps<{
    tier: Tier | null;
    size?: number;
    decorative?: boolean;
  }>(),
  { decorative: false },
);

const src = computed(() => CRESTS[props.tier ? props.tier.toLowerCase() : "unranked"]);
const label = computed(() => (props.tier ? formatTier(props.tier) : "Non classé"));
const sizeStyle = computed(() => (props.size ? { "--rank-size": `${props.size}px` } : undefined));
</script>

<template>
  <img v-if="src" class="rank-icon" :src="src" :alt="decorative ? '' : label" :title="label" :style="sizeStyle" :width="size ?? 20" :height="size ?? 20" />
  <span v-else class="rank-icon" :style="sizeStyle" aria-hidden="true" />
</template>

<style scoped>
.rank-icon {
  display: inline-block;
  width: var(--rank-size, 20px);
  height: var(--rank-size, 20px);
  flex-shrink: 0;
  object-fit: contain;
  vertical-align: middle;
}
</style>
