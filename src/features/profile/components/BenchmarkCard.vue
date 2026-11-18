<script setup lang="ts">
import { computed } from "vue";
import type { PlayerKey, RoleFilter } from "@/types/riot";
import { useProfileSummary } from "@/composables/useProfileQueries";
import { BENCHMARK_METRICS, compareToAverage } from "@/features/profile/profileLogic";
import { formatRole, formatTier } from "@/utils/labels";
import Panel from "@/components/ui/Panel.vue";
import DeltaBadge from "@/components/ui/DeltaBadge.vue";

const props = defineProps<{ player: PlayerKey; role: RoleFilter }>();

const { data: summary, isPending } = useProfileSummary(
  () => props.player,
  () => props.role,
);

const title = computed(() => {
  const benchmark = summary.value?.benchmark;
  if (!benchmark) return "Toi vs moyenne";
  const suffix = props.role === "ALL" ? " (rôle principal)" : "";
  return `Toi vs moyenne ${formatTier(benchmark.tier)} · ${formatRole(benchmark.role)}${suffix}`;
});

const rows = computed(() =>
  (summary.value?.benchmark.values ?? []).map(({ metric, value, average }) => {
    const definition = BENCHMARK_METRICS[metric];
    return {
      metric,
      label: definition.label,
      value: definition.format(value),
      average: definition.format(average),
      comparison: compareToAverage(metric, value, average),
    };
  }),
);
</script>

<template>
  <Panel :title="title" aside="indicatif">
    <!-- ===== Loading ===== -->
    <div v-if="isPending" class="benchmark__skeleton" aria-hidden="true">
      <span v-for="n in 5" :key="n" class="skeleton" style="height: 32px" />
    </div>

    <p v-else-if="rows.length === 0" class="benchmark__empty">Pas encore assez de parties pour comparer.</p>

    <table v-else class="benchmark">
      <caption class="visually-hidden">
        {{
          title
        }}
      </caption>
      <tbody>
        <tr v-for="row in rows" :key="row.metric">
          <th scope="row">{{ row.label }}</th>
          <td class="benchmark__value">{{ row.value }}</td>
          <td class="benchmark__compare">
            <DeltaBadge :comparison="row.comparison">moy. {{ row.average }}</DeltaBadge>
          </td>
        </tr>
      </tbody>
    </table>
  </Panel>
</template>

<style scoped>
.benchmark {
  flex: 1;
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.benchmark :where(th, td) {
  padding: var(--space-2) var(--space-1);
  border-bottom: 1px solid var(--line);
}

.benchmark tr:last-child > * {
  border-bottom: none;
}

.benchmark th {
  text-align: left;
  font-weight: var(--weight-regular);
  color: var(--text-secondary);
}

.benchmark__value,
.benchmark__compare {
  width: 1%;
  text-align: left;
  white-space: nowrap;
}

.benchmark__value {
  padding-right: var(--space-4);
  font-weight: var(--weight-semibold);
}

.benchmark__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.benchmark__empty {
  color: var(--text-secondary);
}
</style>
