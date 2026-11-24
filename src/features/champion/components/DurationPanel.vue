<script setup lang="ts">
import { computed } from "vue";
import type { ChampionStats } from "@/types/champion";
import { formatDurationBucket, winrateGap } from "@/features/champion/championLogic";
import { statWinrateTone } from "@/utils/tones";
import { formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";

const props = defineProps<{ stats: ChampionStats }>();

const buckets = computed(() =>
  props.stats.byDuration.map((bucket) => ({
    ...bucket,
    label: formatDurationBucket(bucket),
    gap: winrateGap(bucket.winrate),
    tone: statWinrateTone(bucket.winrate),
  })),
);

const best = computed(() => buckets.value.reduce<(typeof buckets.value)[number] | undefined>((top, bucket) => (!top || bucket.winrate > top.winrate ? bucket : top), undefined));
</script>

<template>
  <Panel title="Victoires selon la durée">
    <p v-if="best" class="duration__summary">
      Plus fort dans les parties de <strong>{{ best.label }}</strong>
    </p>
    <ul class="duration">
      <li v-for="bucket in buckets" :key="bucket.from" class="duration__row">
        <span class="duration__label">{{ bucket.label }}</span>
        <span class="duration__track" aria-hidden="true">
          <span class="duration__bar" :class="`duration__bar--${bucket.gap >= 0 ? 'up' : 'down'}`" :style="{ '--gap': Math.abs(bucket.gap) }" />
        </span>
        <span class="duration__value" :class="`tone-${bucket.tone}`">{{ formatPercent(bucket.winrate) }}</span>
        <span class="duration__share">{{ formatPercent(bucket.share) }} des parties</span>
      </li>
    </ul>
  </Panel>
</template>

<style scoped>
.duration__summary {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.duration__summary strong {
  color: var(--text-primary);
}

.duration {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.duration__row {
  display: grid;
  grid-template-columns: 9ch 1fr 5ch;
  grid-template-areas:
    "label track value"
    ". share share";
  align-items: center;
  column-gap: var(--space-3);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.duration__label {
  grid-area: label;
  color: var(--text-secondary);
}

.duration__track {
  grid-area: track;
  position: relative;
  height: 10px;
  border-radius: 2px;
  background: var(--fill-base);
}

.duration__track::after {
  content: "";
  position: absolute;
  inset: -3px auto -3px 50%;
  width: 1px;
  background: var(--text-secondary);
}

.duration__bar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: calc(var(--gap) * 50%);
  min-width: 2px;
}

.duration__bar--up {
  left: 50%;
  border-radius: 0 2px 2px 0;
  background: var(--state-positive);
}

.duration__bar--down {
  right: 50%;
  border-radius: 2px 0 0 2px;
  background: var(--state-negative);
}

.duration__value {
  grid-area: value;
  font-weight: var(--weight-bold);
  text-align: right;
}

.duration__share {
  grid-area: share;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
</style>
