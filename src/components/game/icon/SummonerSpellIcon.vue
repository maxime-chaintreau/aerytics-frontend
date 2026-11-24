<script setup lang="ts">
import { computed } from "vue";
import { useImageFallback } from "@/composables/useImageFallback";
import { useStaticDataStore } from "@/stores/staticData";

const props = withDefaults(
  defineProps<{
    spellKey: number;
    size?: number;
    upgraded?: boolean;
    decorative?: boolean;
  }>(),
  { decorative: false },
);

const staticData = useStaticDataStore();

const sizeStyle = computed(() => (props.size ? { "--spell-size": `${props.size}px` } : undefined));

const spell = computed(() => staticData.summonerSpell(props.spellKey));
const src = computed(() => (spell.value ? staticData.summonerSpellIconUrl(spell.value) : undefined));

const name = computed(() => (spell.value ? `${spell.value.name}${props.upgraded ? " (améliorée)" : ""}` : undefined));

const { shown, onError } = useImageFallback(src);
</script>

<template>
  <img
    v-if="shown"
    class="spell-icon"
    :src="shown"
    :class="{ 'spell-icon--upgraded': upgraded }"
    :alt="decorative ? '' : name"
    :title="name"
    :style="sizeStyle"
    :width="size ?? 22"
    :height="size ?? 22"
    loading="lazy"
    decoding="async"
    @error="onError"
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

.spell-icon--upgraded {
  box-shadow: 0 0 0 1px var(--accent-gold);
}
</style>
