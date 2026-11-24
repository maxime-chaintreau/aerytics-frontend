<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { Role } from "@/types/riot";
import { usePlayerFromRoute } from "@/composables/usePlayerFromRoute";
import { useRoleFilter } from "@/composables/useRoleFilter";
import { useProfileSummary } from "@/composables/useProfileQueries";
import { useProfileRefresh } from "@/composables/useProfileRefresh";
import { useRecentSearches } from "@/composables/useRecentSearches";
import { isNotFound } from "@/services/http";
import { ROLE_OPTIONS, formatRole } from "@/utils/labels";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import RoleIcon from "@/components/game/icon/RoleIcon.vue";
import ProfileHeader from "@/features/profile/components/ProfileHeader.vue";
import LpHistoryChart from "@/features/profile/components/LpHistoryChart.vue";
import ChampionPoolTable from "@/features/profile/components/ChampionPoolTable.vue";
import BenchmarkCard from "@/features/profile/components/BenchmarkCard.vue";
import MatchList from "@/features/profile/components/MatchList.vue";
import MetaCard from "@/features/profile/components/MetaCard.vue";

const player = usePlayerFromRoute();
const role = useRoleFilter();

const summary = reactive(useProfileSummary(player, role));

const notFound = computed(() => player.value === null || isNotFound(summary.error));

const { add: addRecentSearch } = useRecentSearches();
watch(
  () => summary.data,
  (data) => {
    if (data) addRecentSearch({ region: data.region, riotId: data.riotId, profileIconId: data.profileIconId, summonerLevel: data.summonerLevel, rank: data.rank });
  },
);

// ---------- Role selector ----------

const PROFILE_ROLE_OPTIONS: { value: Role | "ALL"; label: string }[] = [{ value: "ALL", label: "Tous" }, ...ROLE_OPTIONS];

const selectedRole = computed<Role | "ALL" | null>({
  get: () => (role.value === "MAIN" ? (summary.data?.mainRole ?? null) : role.value),
  set: (value) => {
    if (value === null) return;
    role.value = value === summary.data?.mainRole ? "MAIN" : value;
  },
});

// ---------- No games ----------

const noGames = computed(() => summary.data !== undefined && summary.data.stats === null);

// ---------- Actualiser ----------

const { refreshAll, isRefreshing, hasError } = useProfileRefresh(player);
</script>

<template>
  <template v-if="notFound">
    <h1 tabindex="-1">Joueur introuvable</h1>
    <p>Vérifie le Riot ID et la région.</p>
    <p><RouterLink to="/">&lt;- Retour à l'accueil</RouterLink></p>
  </template>

  <div v-else-if="player" class="profile">
    <ProfileHeader :player="player" :role="role" />

    <div class="profile__toolbar">
      <div class="profile__toolbar-inner">
        <SegmentedControl v-model="selectedRole" label="Rôle" :options="PROFILE_ROLE_OPTIONS" size="lg">
          <template #option="{ option }">
            <RoleIcon :role="option.value" :size="20" decorative />
            <span class="profile__role-label">{{ option.label }}</span>
          </template>
        </SegmentedControl>
        <button type="button" class="button button--lg" :class="{ 'button--primary': hasError }" :disabled="isRefreshing" @click="refreshAll">Actualiser</button>
      </div>
    </div>

    <div class="profile__grid" :class="{ 'profile__grid--chart-only': noGames, 'profile__grid--stale': summary.isPlaceholderData }" :aria-busy="summary.isPlaceholderData">
      <LpHistoryChart :player="player" />
      <template v-if="!noGames">
        <ChampionPoolTable :player="player" :role="role" />
        <BenchmarkCard :player="player" :role="role" />
      </template>
    </div>

    <div class="profile__bottom">
      <EmptyState v-if="noGames && selectedRole" :title="selectedRole === 'ALL' ? 'Aucune partie classée cette saison' : `Aucune partie classée en ${formatRole(selectedRole)} cette saison`">
        <template v-if="selectedRole !== 'ALL'" #icon>
          <RoleIcon :role="selectedRole" :size="64" decorative />
        </template>
        Les statistiques apparaîtront dès la première partie classée{{ selectedRole === "ALL" ? "" : " sur ce rôle" }}.
        <template v-if="selectedRole !== 'ALL'" #actions>
          <button type="button" class="button button--primary" @click="selectedRole = 'ALL'">Voir tous les rôles</button>
        </template>
      </EmptyState>
      <MatchList v-else :player="player" :role="role" />
      <MetaCard :player="player" :role="role" />
    </div>
  </div>
</template>

<style scoped>
.profile {
  container: profile / inline-size;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-6);
}

.profile__toolbar {
  position: sticky;
  top: var(--header-height);
  z-index: 5;
  container-type: scroll-state;
  margin-block: calc(-1 * var(--space-2));
  padding-block: var(--space-2);
  background: var(--fill-base);
}

.profile__toolbar-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

@container scroll-state(stuck: top) {
  .profile__toolbar-inner {
    box-shadow:
      0 var(--space-2) 0 0 var(--fill-base),
      0 calc(var(--space-2) + 1px) 0 0 var(--line);
  }
}

.profile__toolbar-inner > .button {
  margin-left: auto;
}

@container profile (max-width: 560px) {
  .profile__role-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

.profile__grid {
  display: grid;
  gap: var(--space-4);
  transition: opacity 0.15s;
}

.profile__grid--stale {
  opacity: 0.55;
  pointer-events: none;
}

@container profile (min-width: 680px) {
  .profile__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile__grid > :first-child {
    grid-column: 1 / -1;
  }
}

@container profile (min-width: 1100px) {
  .profile__grid {
    grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(0, 1fr));
  }

  .profile__grid > :first-child {
    grid-column: auto;
  }

  .profile__grid--chart-only > :first-child {
    grid-column: 1 / -1;
  }
}

.profile__bottom {
  display: grid;
  gap: var(--space-4);
}

@container profile (min-width: 1000px) {
  .profile__bottom {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}
</style>

<style>
html:has(.profile__toolbar) {
  scroll-padding-top: calc(var(--header-height) + 58px + var(--space-4));
}
</style>
