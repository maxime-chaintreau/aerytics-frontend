<script setup lang="ts">
import type { MatchDetail } from "@/types/match";
import type { FrameStat, MatchTimeline } from "@/types/timeline";
import TimelinePlayersChart from "@/features/match/components/TimelinePlayersChart.vue";
import TimelineEvents from "@/features/match/components/TimelineEvents.vue";

defineProps<{ match: MatchDetail; timeline: MatchTimeline }>();
const stat = defineModel<FrameStat>("stat", { required: true });
</script>

<template>
  <div class="details">
    <TimelinePlayersChart v-model:stat="stat" :match="match" :timeline="timeline" />
    <TimelineEvents :match="match" :timeline="timeline" />
  </div>
</template>

<style scoped>
.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
</style>
