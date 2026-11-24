<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRoute } from "vue-router";
import type { Role } from "@/types/riot";
import { useStaticDataStore } from "@/stores/staticData";
import { useChampionStats } from "@/composables/useChampionQueries";
import { useChampionFilters } from "@/composables/useChampionFilters";
import { usePageTitle } from "@/composables/usePageTitle";
import { isNotFound } from "@/services/http";
import { formatRole } from "@/utils/labels";
import { formatPercent } from "@/utils/format";
import { championBySlug } from "@/utils/champion";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import RoleIcon from "@/components/game/icon/RoleIcon.vue";
import StatsTierSelect from "@/components/game/StatsTierSelect.vue";
import ChampionHeader from "@/features/champion/components/ChampionHeader.vue";
import BuildPanel from "@/features/champion/components/BuildPanel.vue";
import RunesPanel from "@/features/champion/components/RunesPanel.vue";
import SkillOrderPanel from "@/features/champion/components/SkillOrderPanel.vue";
import MatchupsPanel from "@/features/champion/components/MatchupsPanel.vue";
import SynergiesPanel from "@/features/champion/components/SynergiesPanel.vue";
import DurationPanel from "@/features/champion/components/DurationPanel.vue";
import PatchNotesPanel from "@/features/champion/components/PatchNotesPanel.vue";

const route = useRoute();
const staticData = useStaticDataStore();

const champion = computed(() => (typeof route.params.champion === "string" ? championBySlug(staticData.champions, route.params.champion) : undefined));
const championId = computed(() => champion.value?.key ?? null);

const { role, tier } = useChampionFilters();
const stats = reactive(useChampionStats(championId, role, tier));

usePageTitle(() => (champion.value && stats.data ? `${champion.value.name} ${formatRole(stats.data.role)}` : null));

const notFound = computed(() => (staticData.status === "success" && !champion.value) || isNotFound(stats.error));

// ---------- Filters ----------

const roleOptions = computed(() => {
  const played = stats.data?.roles ?? [];
  const options = played.map(({ role, share }) => ({ value: role, label: formatRole(role), share }));
  const shown = stats.data?.role;
  if (shown && !played.some((entry) => entry.role === shown)) options.push({ value: shown, label: formatRole(shown), share: 0 });
  return options;
});

const offRole = computed(() => !!stats.data && !stats.data.roles.some((entry) => entry.role === stats.data!.role));

const shownRole = computed<Role | null>({
  get: () => stats.data?.role ?? role.value,
  set: (value) => (role.value = value === stats.data?.roles[0]?.role ? null : value),
});
</script>

<template>
  <div class="champion-page">
    <!-- ===== Unknown champion ===== -->
    <template v-if="notFound">
      <h1 tabindex="-1">Champion introuvable</h1>
      <p class="champion-page__muted">Aucun champion ne correspond à cette adresse.</p>
      <RouterLink to="/" class="button champion-page__home">Retour à l'accueil</RouterLink>
    </template>

    <template v-else-if="champion && stats.data">
      <ChampionHeader :champion="champion" :stats="stats.data" />

      <div class="champion-page__toolbar">
        <SegmentedControl v-if="roleOptions.length > 1" v-model="shownRole" label="Rôle" :options="roleOptions" size="lg">
          <template #option="{ option }">
            <RoleIcon :role="option.value" :size="20" decorative />
            {{ option.label }}
            <span class="champion-page__share">{{ formatPercent(roleOptions.find((entry) => entry.value === option.value)!.share) }}</span>
          </template>
        </SegmentedControl>

        <StatsTierSelect v-model="tier" size="lg" class="champion-page__tier" />
      </div>

      <p v-if="offRole" class="champion-page__warning" role="note">{{ champion.name }} est rarement joué en {{ formatRole(stats.data.role) }} : peu de parties, ces chiffres sont moins fiables.</p>

      <div class="champion-page__content" :class="{ 'champion-page__content--stale': stats.isPlaceholderData }" :aria-busy="stats.isPlaceholderData">
        <div class="champion-page__main">
          <BuildPanel :stats="stats.data" />
          <RunesPanel :stats="stats.data" />
          <SkillOrderPanel :stats="stats.data" />
        </div>
        <div class="champion-page__aside">
          <MatchupsPanel :champion="champion" :stats="stats.data" />
          <SynergiesPanel :stats="stats.data" />
          <DurationPanel :stats="stats.data" />
          <PatchNotesPanel :stats="stats.data" />
        </div>
      </div>
    </template>

    <!-- ===== Failed (network, server, static data) ===== -->
    <div v-else-if="stats.error || staticData.status === 'error'" role="alert" class="champion-page__error">
      <h1 tabindex="-1">Impossible de charger le champion</h1>
      <button type="button" class="button" :disabled="stats.isLoading" @click="staticData.status === 'error' ? staticData.load() : stats.refresh()">Réessayer</button>
    </div>

    <!-- ===== Loading ===== -->
    <template v-else>
      <h1 class="visually-hidden" tabindex="-1">Chargement du champion…</h1>
      <span class="skeleton champion-page__header-skeleton" aria-hidden="true" />
      <div class="champion-page__content" aria-hidden="true">
        <span class="skeleton champion-page__panel-skeleton" />
        <span class="skeleton champion-page__panel-skeleton" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.champion-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-6);
}

.champion-page__muted {
  color: var(--text-secondary);
}

.champion-page__home {
  align-self: flex-start;
}

.champion-page__toolbar {
  position: sticky;
  top: var(--header-height);
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-block: var(--space-2);
  background: var(--fill-base);
}

.champion-page__share {
  font-size: var(--text-xs);
  font-weight: var(--weight-regular);
  color: var(--text-secondary);
}

.champion-page__tier {
  margin-left: auto;
}

.champion-page__warning {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--accent-gold);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--accent-gold);
}

.champion-page__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  transition: opacity 0.15s;
}

@media (min-width: 1100px) {
  .champion-page__content {
    grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
    align-items: start;
  }
}

.champion-page__content--stale {
  opacity: 0.5;
  pointer-events: none;
}

.champion-page__main,
.champion-page__aside {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}

.champion-page__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
}

.champion-page__header-skeleton {
  height: 200px;
  border-radius: var(--radius-md);
}

.champion-page__panel-skeleton {
  height: 480px;
  border-radius: var(--radius-md);
}
</style>
