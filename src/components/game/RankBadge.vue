<script setup lang="ts">
import type { Rank } from "@/types/riot";
import { formatRank, tierColor } from "@/utils/labels";
import Tag from "@/components/ui/Tag.vue";
import RankIcon from "@/components/game/icon/RankIcon.vue";

defineProps<{ rank: Rank | null }>();
</script>

<template>
  <Tag class="rank-badge" :style="rank ? { color: tierColor(rank.tier) } : undefined">
    <RankIcon :tier="rank?.tier ?? null" :size="18" decorative />
    {{ rank ? formatRank(rank) : "Non classé" }}
  </Tag>
</template>

<style scoped>
.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
</style>
