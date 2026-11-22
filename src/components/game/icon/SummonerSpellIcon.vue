<script setup lang="ts">
import { computed, ref } from "vue";
import { useStaticDataStore } from "@/stores/staticData";

const props = withDefaults(
  defineProps<{
    spellKey: number;
    size?: number;
    decorative?: boolean;
  }>(),
  { decorative: false },
);

const staticData = useStaticDataStore();

const sizeStyle = computed(() => (props.size ? { "--spell-size": `${props.size}px` } : undefined));

const spell = computed(() => staticData.summonerSpell(props.spellKey));
const src = computed(() => (spell.value ? staticData.summonerSpellIconUrl(spell.value) : undefined));

const failedSrc = ref<string>();
const failed = computed(() => src.value !== undefined && src.value === failedSrc.value);
</script>

<template>
  <img
    v-if="src && !failed"
    class="spell-icon"
    :src="src"
    :alt="decorative ? '' : spell?.name"
    :title="spell?.name"
    :style="sizeStyle"
    :width="size ?? 22"
    :height="size ?? 22"
    loading="lazy"
    decoding="async"
    @error="failedSrc = src"
  />
  <span
    v-else
    class="spell-icon spell-icon--empty"
    :style="sizeStyle"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : (spell?.name ?? 'Sort d\'invocateur')"
    :aria-hidden="decorative ? 'true' : undefined"
  />
</template>

<style scoped>
.spell-icon {
  display: block;
  width: var(--spell-size, 22px);
  height: var(--spell-size, 22px);
  flex-shrink: 0;
  border-radius: var(--radius-sm);
}

.spell-icon--empty {
  background: var(--fill-hover);
}
</style>
