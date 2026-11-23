<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { PlayerKey, RoleFilter } from "@/types/riot";
import { useChampionPool } from "@/composables/useProfileQueries";
import { useStaticDataStore } from "@/stores/staticData";
import { sortChampionPool, winrateTone, type ChampionSortKey, type SortDirection } from "@/features/profile/profileLogic";
import { formatDecimal, formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import RoleIcon from "@/components/game/icon/RoleIcon.vue";

const props = defineProps<{ player: PlayerKey; role: RoleFilter }>();

const VISIBLE_ROWS = 5;

const COLUMNS: { key: ChampionSortKey; label: string }[] = [
  { key: "games", label: "Parties" },
  { key: "winrate", label: "Winrate" },
  { key: "kda", label: "KDA" },
  { key: "csPerMin", label: "CS/min" },
];

const {
  data: pool,
  isPending,
  error,
} = useChampionPool(
  () => props.player,
  () => props.role,
);
const staticData = useStaticDataStore();

// ---------- Sorting ----------

const sortKey = ref<ChampionSortKey>("games");
const sortDirection = ref<SortDirection>("desc");

function sortBy(key: ChampionSortKey) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
  } else {
    sortKey.value = key;
    sortDirection.value = "desc";
  }
}

function ariaSort(key: ChampionSortKey) {
  if (sortKey.value !== key) return "none";
  return sortDirection.value === "desc" ? "descending" : "ascending";
}

const sorted = computed(() => sortChampionPool(pool.value ?? [], sortKey.value, sortDirection.value));

// ---------- Top 5 / Voir tout ----------

const expanded = ref(false);
const rows = computed(() => (expanded.value ? sorted.value : sorted.value.slice(0, VISIBLE_ROWS)));
const hiddenCount = computed(() => sorted.value.length - VISIBLE_ROWS);

const bodyId = useId();
</script>

<template>
  <Panel title="Pool de champions" aside="Cette saison">
    <!-- ===== Loading ===== -->
    <div v-if="isPending" class="pool__skeleton" aria-hidden="true">
      <span v-for="n in VISIBLE_ROWS" :key="n" class="skeleton" style="height: 32px" />
    </div>

    <!-- ===== Error ===== -->
    <div v-else-if="!pool && error" role="alert" class="pool__message">Impossible de charger les champions. Clique sur « Actualiser » pour réessayer.</div>

    <!-- ===== Empty ===== -->
    <p v-else-if="sorted.length === 0" class="pool__message">{{ role === "ALL" ? "Aucune partie classée cette saison." : "Aucune partie classée sur ce rôle cette saison." }}</p>

    <template v-else>
      <table class="pool">
        <caption class="visually-hidden">
          Champions joués cette saison. Cliquer sur un en-tête pour trier.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="pool__champion-head">Champion</th>
            <th v-for="column in COLUMNS" :key="column.key" scope="col" :aria-sort="ariaSort(column.key)">
              <button type="button" class="pool__sort" @click="sortBy(column.key)">
                {{ column.label }}
                <span class="pool__arrow" aria-hidden="true">
                  {{ sortKey === column.key ? (sortDirection === "desc" ? "▼" : "▲") : "" }}
                </span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody :id="bodyId">
          <tr v-for="entry in rows" :key="`${entry.championId}-${entry.role}`">
            <th scope="row" class="pool__champion">
              <span class="pool__champion-cell">
                <RoleIcon v-if="role === 'ALL'" :role="entry.role" class="pool__role" />
                <ChampionIcon :champion-id="entry.championId" :size="28" decorative />
                {{ staticData.champion(entry.championId)?.name ?? "…" }}
              </span>
            </th>
            <td>{{ entry.games }}</td>
            <td :class="`pool__winrate--${winrateTone(entry.winrate)}`">{{ formatPercent(entry.winrate) }}</td>
            <td>{{ formatDecimal(entry.kda) }}</td>
            <td>{{ formatDecimal(entry.csPerMin) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="hiddenCount > 0">
          <tr>
            <td :colspan="COLUMNS.length + 1" class="pool__footer">
              <button type="button" class="pool__toggle" :aria-expanded="expanded" :aria-controls="bodyId" @click="expanded = !expanded">
                {{ expanded ? "Réduire" : `Voir tout (${sorted.length})` }}
                <span class="pool__toggle-arrow" :class="{ 'pool__toggle-arrow--up': expanded }" aria-hidden="true">▾</span>
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </template>
  </Panel>
</template>

<style scoped>
.pool {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.pool :where(th, td) {
  padding: var(--space-2) var(--space-1);
  text-align: right;
  border-bottom: 1px solid var(--line);
}

.pool tbody tr:last-child > * {
  border-bottom: none;
}

.pool thead th {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
}

.pool__champion-head,
.pool__champion {
  text-align: left;
}

.pool__champion {
  font-weight: var(--weight-semibold);
}

.pool__champion-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pool__role {
  color: var(--text-secondary);
}

.pool__sort {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  border: none;
  background: none;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
}

.pool__sort:hover {
  color: var(--text-primary);
}

.pool__arrow {
  display: inline-block;
  width: 1ch;
  font-size: 8px;
}

.pool__winrate--positive {
  color: var(--state-positive);
}

.pool__winrate--negative {
  color: var(--state-negative);
}

.pool .pool__footer {
  padding: 0;
  border-top: 1px solid var(--line);
  border-bottom: none;
}

.pool__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-2);
  border: none;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  background: none;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition:
    background-color 0.15s,
    color 0.15s;
}

.pool__toggle:hover {
  background: var(--fill-hover);
  color: var(--text-primary);
}

.pool__toggle-arrow {
  transition: transform 0.15s;
}

.pool__toggle-arrow--up {
  transform: rotate(180deg);
}

.pool__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pool__message {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}
</style>
