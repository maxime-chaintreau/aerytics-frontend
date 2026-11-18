<script setup lang="ts">
import type { Rank } from "@/types/riot";
import { formatRank, tierColor } from "@/utils/labels";
import Tag from "@/components/ui/Tag.vue";

defineProps<{ rank: Rank | null }>();
</script>

<template>
  <Tag v-if="rank" :style="{ color: tierColor(rank.tier) }">{{ formatRank(rank) }}</Tag>
  <Tag v-else>Non classé</Tag>
</template>
