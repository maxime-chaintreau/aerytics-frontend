<script setup lang="ts">
import type { PlayerAnalysis } from "@/types/analysis";
import { formatPlace, scoreTone } from "@/features/match/analysisLogic";

defineProps<{ analysis: Pick<PlayerAnalysis, "badge" | "rank" | "score"> }>();
</script>

<template>
  <span class="place" :class="[analysis.badge ? `place--${analysis.badge.toLowerCase()}` : '', `place--${scoreTone(analysis.score)}`]" :title="`Score ${analysis.score}/100`">
    {{ analysis.badge ?? formatPlace(analysis.rank) }}
    <span class="visually-hidden">, score {{ analysis.score }} sur 100</span>
  </span>
</template>

<style scoped>
.place {
  position: relative;
  flex-shrink: 0;
  padding: 0 4px;
  border-radius: var(--radius-sm);
  background: var(--fill-hover);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}

.place--great {
  color: var(--accent-gold);
}

/* the badges win over the tone */
.place--mvp {
  background: var(--accent-gold);
  color: var(--fill-panel);
}

.place--ace {
  background: var(--text-secondary);
  color: var(--fill-panel);
}
</style>
