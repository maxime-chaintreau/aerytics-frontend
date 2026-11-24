<script setup lang="ts">
import { computed } from "vue";
import type { StatsTier } from "@/types/champion";
import type { Role } from "@/types/riot";
import { useStaticDataStore } from "@/stores/staticData";
import { championRoute } from "@/router/links";

const props = defineProps<{
  championId: number;
  role?: Role | null;
  tier?: StatsTier | null;
}>();

const staticData = useStaticDataStore();

const to = computed(() => {
  const champion = staticData.champion(props.championId);
  return champion ? championRoute(champion, { role: props.role, tier: props.tier }) : undefined;
});
</script>

<template>
  <RouterLink v-if="to" :to="to" class="champion-link"><slot /></RouterLink>
  <span v-else class="champion-link"><slot /></span>
</template>

<style scoped>
.champion-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: inherit;
  text-decoration: none;
}

a.champion-link {
  border-radius: var(--radius-sm);
  transition: color 0.15s;
}

a.champion-link:hover {
  color: var(--accent-gold);
}

a.champion-link:hover :deep(img) {
  filter: brightness(1.2);
}

a.champion-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
