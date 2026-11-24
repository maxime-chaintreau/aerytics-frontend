<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PlayerKey } from "@/types/riot";
import type { LpHistoryPoint, LpInterval } from "@/types/profile";
import { useLpHistory } from "@/composables/useProfileQueries";
import { lastPromotion, lpChartHeights, lpDelta } from "@/features/profile/profileLogic";
import { formatRankName, formatRank, formatTier, tierColor } from "@/utils/labels";
import { formatMonth, formatRelativeTime, formatShortDate, formatSigned } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import Tag from "@/components/ui/Tag.vue";

const props = defineProps<{ player: PlayerKey }>();

const INTERVALS: { value: LpInterval; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
];

const PERIOD_TEXT: Record<LpInterval, (count: number) => string> = {
  day: (count) => `en ${count} jours`,
  week: (count) => `en ${count} semaines`,
  month: () => "cette saison",
};

const interval = ref<LpInterval>("day");

const { data, isPending, error } = useLpHistory(() => props.player, interval);

const points = computed(() => data.value?.points ?? []);
const heights = computed(() => lpChartHeights(points.value));
const delta = computed(() => lpDelta(points.value));
const promotion = computed(() => lastPromotion(points.value));

const range = computed(() => {
  const first = points.value[0];
  const last = points.value.at(-1);
  return first && last ? `${formatRankName(first.rank)} → ${formatRankName(last.rank)}` : "";
});

/** what a bar covers: "12 nov.", "3 nov. – 9 nov.", "novembre 2026" */
function periodLabel(point: LpHistoryPoint): string {
  if (interval.value === "month") return formatMonth(point.start);
  if (point.start === point.end) return formatShortDate(point.start);
  return `${formatShortDate(point.start)} – ${formatShortDate(point.end)}`;
}

/** a day shows its rank, a week or month shows the peak */
const rankPrefix = computed(() => (interval.value === "day" ? "" : "Max : "));

// ---------- Tooltip: one active bar, set by the mouse or the keyboard ----------

const active = ref<number | null>(null);
const activePoint = computed(() => (active.value === null ? null : points.value[active.value]));

// another grouping = other bars: the old index means nothing
watch(interval, () => (active.value = null));

function onKeydown(event: KeyboardEvent) {
  const last = points.value.length - 1;
  if (last < 0) return;
  const current = active.value ?? last;

  const next = {
    ArrowLeft: Math.max(0, current - 1),
    ArrowRight: Math.min(last, current + 1),
    Home: 0,
    End: last,
  }[event.key];

  if (next === undefined) return; // any other key: let the browser handle it (Tab...)
  event.preventDefault(); // no page scroll on arrows/Home/End
  active.value = next;
}

/** the tooltip stays inside the chart: aligned left on the first bars, right on the last */
const tooltipStyle = computed(() => {
  if (active.value === null) return undefined;
  const left = ((active.value + 0.5) / points.value.length) * 100;
  const shift = left < 15 ? "0%" : left > 85 ? "-100%" : "-50%";
  return { left: `${left}%`, transform: `translateX(${shift})` };
});

/** what a screen reader hears when Tab reaches the chart */
const chartLabel = computed(() => {
  const first = points.value[0];
  const last = points.value.at(-1);
  if (!first || !last) return "";
  const period = PERIOD_TEXT[interval.value](points.value.length);
  return `Évolution des LP ${period} : de ${formatRank(first.rank)} à ${formatRank(last.rank)}, ${formatSigned(delta.value)} LP. Flèches gauche et droite pour parcourir.`;
});
</script>

<template>
  <Panel title="Évolution des LP">
    <template #aside>
      <SegmentedControl v-model="interval" label="Regrouper par" :options="INTERVALS" />
    </template>

    <!-- ===== Failed and nothing to show (data already loaded stays visible) ===== -->
    <p v-if="isPending && error" role="alert" class="lp-chart__empty">Impossible de charger l'historique. Clique sur « Actualiser » pour réessayer.</p>

    <!-- ===== Loading (first load, or a grouping never loaded before) ===== -->
    <span v-else-if="isPending" class="skeleton" style="height: 120px" aria-hidden="true" />

    <!-- ===== No ranked games ===== -->
    <p v-else-if="points.length === 0" class="lp-chart__empty">Pas encore d'historique classé.</p>

    <template v-else>
      <!-- ===== Chart ===== -->
      <div class="lp-chart" role="group" tabindex="0" :aria-label="chartLabel" @keydown="onKeydown" @blur="active = null" @mouseleave="active = null">
        <div class="lp-chart__bars" aria-hidden="true">
          <span
            v-for="(point, index) in points"
            :key="point.start"
            class="lp-chart__bar"
            :class="{ 'lp-chart__bar--active': index === active }"
            :style="{ height: `${heights[index]! * 100}%`, '--bar-color': tierColor(point.rank.tier) }"
            @mouseenter="active = index"
          />
        </div>

        <div v-if="activePoint" class="lp-chart__tooltip" :style="tooltipStyle" aria-hidden="true">
          <span class="lp-chart__tooltip-period">{{ periodLabel(activePoint) }}</span>
          <span :style="{ color: tierColor(activePoint.rank.tier) }"> {{ rankPrefix }}{{ formatRank(activePoint.rank) }} </span>
          <span :class="activePoint.lpChange >= 0 ? 'lp-chart__delta--up' : 'lp-chart__delta--down'"> {{ formatSigned(activePoint.lpChange) }} LP </span>
        </div>
      </div>

      <!-- announces the active bar to screen readers when the arrows move -->
      <p class="visually-hidden" aria-live="polite">
        <template v-if="activePoint"> {{ periodLabel(activePoint) }} : {{ rankPrefix }}{{ formatRank(activePoint.rank) }}, {{ formatSigned(activePoint.lpChange) }} LP </template>
      </p>

      <!-- ===== Summary under the chart ===== -->
      <div class="lp-chart__footer">
        <div class="lp-chart__results">
          <Tag v-if="promotion" :style="{ color: tierColor(promotion.rank.tier) }"> Promotion {{ formatTier(promotion.rank.tier) }} · {{ formatRelativeTime(promotion.end) }} </Tag>
          <span :class="delta >= 0 ? 'lp-chart__delta--up' : 'lp-chart__delta--down'"> {{ formatSigned(delta) }} LP {{ PERIOD_TEXT[interval](points.length) }} </span>
        </div>
        <span class="lp-chart__range">{{ range }}</span>
      </div>
    </template>
  </Panel>
</template>

<style scoped>
.lp-chart {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-sm);
}

.lp-chart__bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  min-height: 120px;
  max-height: 260px;
}

.lp-chart__bar {
  flex: 1;
  min-width: 0;
  border-radius: 2px 2px 0 0;
  background: var(--bar-color);
  opacity: 0.85;
  transition: opacity 0.1s;
}

.lp-chart__bar--active {
  opacity: 1;
  box-shadow: 0 0 0 1px var(--text-primary);
}

.lp-chart__tooltip {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-1) var(--space-2);
  background: var(--fill-panel-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  white-space: nowrap;
  pointer-events: none;
}

.lp-chart__tooltip-period {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.lp-chart__footer {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  font-size: var(--text-sm);
}

.lp-chart__results {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
}

.lp-chart__range {
  flex-shrink: 0;
  color: var(--text-secondary);
  white-space: nowrap;
}

.lp-chart__delta--up {
  color: var(--state-positive);
}

.lp-chart__delta--down {
  color: var(--state-negative);
}

.lp-chart__empty {
  color: var(--text-secondary);
}
</style>
