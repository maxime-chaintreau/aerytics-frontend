<script setup lang="ts">
import { computed, ref } from "vue";
import { useStaticDataStore } from "@/stores/staticData";

const shardFiles = import.meta.glob<string>("@/assets/riot/shards/*", { eager: true, query: "?url", import: "default" });
const SHARD_ICONS: Record<number, string> = {};
for (const [path, url] of Object.entries(shardFiles)) {
  SHARD_ICONS[Number(path.split("/").pop()!.split(".")[0])] = url;
}

const props = withDefaults(
  defineProps<{
    runeId: number;
    size?: number;
    decorative?: boolean;
  }>(),
  { decorative: false },
);

const staticData = useStaticDataStore();

const sizeStyle = computed(() => (props.size ? { "--rune-size": `${props.size}px` } : undefined));

const isShard = computed(() => props.runeId in SHARD_ICONS);

const resolved = computed(() => {
  if (isShard.value) return { name: staticData.shardName(props.runeId), src: SHARD_ICONS[props.runeId] };
  const info = staticData.rune(props.runeId) ?? staticData.runeStyle(props.runeId);
  return { name: info?.name, src: info ? staticData.runeIconUrl(info) : undefined };
});

const failedSrc = ref<string>();
const failed = computed(() => resolved.value.src !== undefined && resolved.value.src === failedSrc.value);
</script>

<template>
  <img
    v-if="resolved.src && !failed"
    class="rune-icon"
    :class="{ 'rune-icon--shard': isShard }"
    :src="resolved.src"
    :alt="decorative ? '' : (resolved.name ?? 'Rune')"
    :title="resolved.name"
    :style="sizeStyle"
    :width="size ?? 24"
    :height="size ?? 24"
    loading="lazy"
    decoding="async"
    @error="failedSrc = resolved.src"
  />
  <span
    v-else
    class="rune-icon rune-icon--empty"
    :style="sizeStyle"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : (resolved.name ?? 'Rune')"
    :aria-hidden="decorative ? 'true' : undefined"
  />
</template>

<style scoped>
.rune-icon {
  display: block;
  width: var(--rune-size, 24px);
  height: var(--rune-size, 24px);
  flex-shrink: 0;
  object-fit: contain;
}

.rune-icon--shard {
  padding: 3px;
  border-radius: 50%;
  background: var(--fill-base);
  border: 1px solid var(--line);
}

.rune-icon--empty {
  border-radius: 50%;
  background: var(--fill-hover);
}
</style>
