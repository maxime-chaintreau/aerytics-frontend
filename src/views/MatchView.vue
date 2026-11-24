<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { usePlayerFromRoute } from "@/composables/usePlayerFromRoute";
import { useMatchDetail, useMatchTimeline, useMatchAnalysis } from "@/composables/useMatchQueries";
import { usePageTitle } from "@/composables/usePageTitle";
import { useStaticDataStore } from "@/stores/staticData";
import { isNotFound } from "@/services/http";
import { formatRiotId } from "@/utils/riotId";
import { profileRoute } from "@/router/links";
import { formatResult } from "@/utils/labels";
import { focusedParticipant } from "@/features/match/matchLogic";
import NotFoundState from "@/components/ui/NotFoundState.vue";
import MatchHeader from "@/features/match/components/MatchHeader.vue";
import Scoreboard from "@/features/match/components/Scoreboard.vue";
import TimelineGraph from "@/features/match/components/TimelineGraph.vue";
import WinProbability from "@/features/match/components/WinProbability.vue";
import PerformancePanel from "@/features/match/components/PerformancePanel.vue";
import BuildOrder from "@/features/match/components/BuildOrder.vue";
import DamageBreakdown from "@/features/match/components/DamageBreakdown.vue";
import MatchMap from "@/features/match/components/MatchMap.vue";

const route = useRoute();
const player = usePlayerFromRoute();
const matchId = computed(() => (typeof route.params.matchId === "string" ? route.params.matchId : null));

const match = reactive(useMatchDetail(player, matchId));
useMatchTimeline(() => player.value?.region ?? null, matchId);
useMatchAnalysis(() => player.value?.region ?? null, matchId);

const staticData = useStaticDataStore();
usePageTitle(() => {
  const focused = match.data ? focusedParticipant(match.data) : undefined;
  if (!match.data || !focused || !player.value) return null;
  const champion = staticData.champion(focused.championId)?.name;
  return `${formatResult(match.data.result)}${champion ? ` · ${champion}` : ""} — ${formatRiotId(player.value.riotId)}`;
});

const pickedPuuid = ref<string | null>(null);
watch(matchId, () => (pickedPuuid.value = null));
const selectedPuuid = computed({
  get: () => pickedPuuid.value ?? match.data?.focus.puuid ?? "",
  set: (puuid: string) => (pickedPuuid.value = puuid),
});

const notFound = computed(() => player.value === null || matchId.value === null || isNotFound(match.error));

const profileLink = computed(() => (player.value ? profileRoute(player.value) : "/"));

usePageTitle(() => (notFound.value ? "Partie introuvable" : null));
</script>

<template>
  <div class="match-page">
    <RouterLink v-if="player" :to="profileLink" class="match-page__back"> <span aria-hidden="true">←</span> Profil de {{ formatRiotId(player.riotId) }} </RouterLink>

    <NotFoundState v-if="notFound" title="Partie introuvable">
      <template v-if="player">Cette partie n'existe pas, ou {{ formatRiotId(player.riotId) }} n'y a pas participé.</template>
      <template v-else>Cette adresse ne correspond à aucune partie.</template>

      <template #actions>
        <RouterLink v-if="player" :to="profileLink" class="button button--primary">Voir le profil de {{ formatRiotId(player.riotId) }}</RouterLink>
        <RouterLink to="/" class="button">Retour à l'accueil</RouterLink>
      </template>
    </NotFoundState>

    <template v-else-if="match.data && player">
      <MatchHeader :match="match.data" />
      <Scoreboard :match="match.data" :region="player.region" />
      <PerformancePanel v-model:selected="selectedPuuid" :match="match.data" :region="player.region" />
      <BuildOrder v-model:selected="selectedPuuid" :match="match.data" :region="player.region" />
      <DamageBreakdown :match="match.data" />
      <TimelineGraph :match="match.data" :region="player.region" />
      <WinProbability :match="match.data" :region="player.region" />
      <MatchMap v-model:selected="selectedPuuid" :match="match.data" :region="player.region" />
    </template>

    <!-- ===== Failed (network, server) ===== -->
    <div v-else-if="match.error" role="alert" class="match-page__error">
      <h1 tabindex="-1">Impossible de charger la partie</h1>
      <button type="button" class="button" :disabled="match.isLoading" @click="match.refresh()">Réessayer</button>
    </div>

    <!-- ===== Loading ===== -->
    <template v-else>
      <h1 class="visually-hidden" tabindex="-1">Chargement de la partie…</h1>
      <span class="skeleton match-page__header-skeleton" aria-hidden="true" />
    </template>
  </div>
</template>

<style scoped>
.match-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-6);
}

.match-page__back {
  align-self: flex-start;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
}

.match-page__back:hover {
  color: var(--text-primary);
}

.match-page__muted {
  color: var(--text-secondary);
}

.match-page__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
}

.match-page__header-skeleton {
  height: 140px;
  border-radius: var(--radius-md);
}
</style>
