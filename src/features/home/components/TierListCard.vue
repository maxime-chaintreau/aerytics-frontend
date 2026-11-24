<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoleMeta } from "@/composables/useMetaQueries";
import { useStaticDataStore } from "@/stores/staticData";
import type { StatsTier } from "@/types/champion";
import type { Role } from "@/types/riot";
import { formatPercent } from "@/utils/format";
import { ROLE_OPTIONS } from "@/utils/labels";
import { DEFAULT_STATS_TIER } from "@/utils/statsTier";
import { metaTierTone, statWinrateTone } from "@/utils/tones";
import Panel from "@/components/ui/Panel.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import Tag from "@/components/ui/Tag.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import RoleIcon from "@/components/game/icon/RoleIcon.vue";
import ChampionLink from "@/components/game/ChampionLink.vue";
import StatsTierSelect from "@/components/game/StatsTierSelect.vue";

const role = ref<Role>("MID");
const tier = ref<StatsTier | null>(DEFAULT_STATS_TIER);

const meta = reactive(useRoleMeta(role, tier));
const staticData = useStaticDataStore();

const COLLAPSED = 10;
const expanded = ref(false);
const champions = computed(() => {
  const all = meta.data?.champions ?? [];
  return expanded.value ? all : all.slice(0, COLLAPSED);
});

const title = computed(() => (meta.data ? `Tier list · Patch ${meta.data.patch}` : "Tier list"));
</script>

<template>
  <Panel :title="title">
    <template #aside>
      <StatsTierSelect v-model="tier" />
    </template>

    <SegmentedControl v-model="role" label="Rôle" :options="ROLE_OPTIONS" class="tier-list__roles">
      <template #option="{ option }">
        <RoleIcon :role="option.value" :size="18" decorative />
        <span class="tier-list__role-label">{{ option.label }}</span>
      </template>
    </SegmentedControl>

    <div v-if="meta.error && !meta.data" role="alert" class="tier-list__message">
      <p>Impossible de charger la tier list.</p>
      <button type="button" class="button button--small" :disabled="meta.isLoading" @click="meta.refresh()">Réessayer</button>
    </div>

    <div v-else-if="!meta.data" class="tier-list__skeleton" aria-hidden="true">
      <span v-for="n in COLLAPSED" :key="n" class="skeleton" style="height: 36px" />
    </div>

    <template v-else>
      <table class="tier-list" :aria-busy="meta.isLoading">
        <thead>
          <tr>
            <th scope="col" class="tier-list__place"><abbr title="Classement">#</abbr></th>
            <th scope="col" class="tier-list__left">Champion</th>
            <th scope="col">Tier</th>
            <th scope="col"><abbr title="Taux de victoire">Victoires</abbr></th>
            <th scope="col"><abbr title="Taux de sélection">Choix</abbr></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in champions" :key="entry.championId">
            <td class="tier-list__place">{{ index + 1 }}</td>
            <th scope="row" class="tier-list__left">
              <span class="tier-list__champion">
                <ChampionLink :champion-id="entry.championId" :role="role" :tier="tier">
                  <ChampionIcon :champion-id="entry.championId" :size="28" decorative />
                  {{ staticData.champion(entry.championId)?.name ?? "…" }}
                </ChampionLink>
              </span>
            </th>
            <td>
              <Tag :tone="metaTierTone(entry.tier)" class="tier-list__tier">{{ entry.tier }}</Tag>
            </td>
            <td :class="`tone-${statWinrateTone(entry.winrate)}`">{{ formatPercent(entry.winrate) }}</td>
            <td>{{ formatPercent(entry.pickRate) }}</td>
          </tr>
        </tbody>
      </table>

      <button v-if="(meta.data.champions.length ?? 0) > COLLAPSED" type="button" class="tier-list__more" :aria-expanded="expanded" @click="expanded = !expanded">
        {{ expanded ? "Voir moins" : `Voir les ${meta.data.champions.length}` }}
      </button>
    </template>
  </Panel>
</template>

<style scoped>
.tier-list__roles {
  max-width: 100%;
  overflow-x: auto;
}

.tier-list {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.tier-list th,
.tier-list td {
  padding: var(--space-2) var(--space-1);
  border-bottom: 1px solid var(--line);
  text-align: center;
}

.tier-list thead th {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
}

.tier-list tbody tr:last-child > * {
  border-bottom: none;
}

.tier-list abbr {
  text-decoration: none;
  cursor: help;
}

.tier-list__left {
  text-align: left !important;
}

.tier-list__place {
  width: 2.5ch;
  color: var(--text-secondary);
}

.tier-list__champion {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
}

.tier-list__tier {
  justify-content: center;
  min-width: 2.5em;
}

.tier-list__more {
  align-self: center;
  border: none;
  background: none;
  color: var(--accent);
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}

.tier-list__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tier-list__message {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

@media (max-width: 480px) {
  .tier-list__role-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
