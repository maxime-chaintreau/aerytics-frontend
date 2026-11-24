<script setup lang="ts">
import type { OptionStats } from "@/types/champion";
import { statWinrateTone } from "@/utils/tones";
import { formatCompact, formatPercent } from "@/utils/format";

withDefaults(defineProps<{ stats: OptionStats; compact?: boolean }>(), { compact: false });
</script>

<template>
  <dl class="option-stats" :class="{ 'option-stats--compact': compact }">
    <div>
      <dt>Victoires</dt>
      <dd :class="`tone-${statWinrateTone(stats.winrate)}`">{{ formatPercent(stats.winrate) }}</dd>
    </div>
    <div>
      <dt>Choix</dt>
      <dd>{{ formatPercent(stats.pickRate) }}</dd>
    </div>
    <div v-if="!compact">
      <dt>Parties</dt>
      <dd>{{ formatCompact(stats.games) }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.option-stats {
  display: flex;
  gap: var(--space-4);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.option-stats dt {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.option-stats dd {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.option-stats--compact {
  gap: var(--space-3);
}
</style>
