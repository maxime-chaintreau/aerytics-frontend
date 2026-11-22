<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRoute } from "vue-router";
import { usePlayerFromRoute } from "@/composables/usePlayerFromRoute";
import { useMatchDetail } from "@/composables/useMatchQueries";
import { isNotFound } from "@/services/http";
import { formatRiotId, toRiotIdSlug } from "@/utils/riotId";
import MatchHeader from "@/features/match/components/MatchHeader.vue";
import Scoreboard from "@/features/match/components/Scoreboard.vue";

const route = useRoute();
const player = usePlayerFromRoute();
const matchId = computed(() => (typeof route.params.matchId === "string" ? route.params.matchId : null));

const match = reactive(useMatchDetail(player, matchId));

const notFound = computed(() => player.value === null || matchId.value === null || isNotFound(match.error));

const profileLink = computed(() => (player.value ? { name: "profile", params: { region: player.value.region, riotId: toRiotIdSlug(player.value.riotId) } } : "/"));
</script>

<template>
  <div class="match-page">
    <RouterLink v-if="player" :to="profileLink" class="match-page__back"> <span aria-hidden="true">←</span> Profil de {{ formatRiotId(player.riotId) }} </RouterLink>

    <!-- ===== Unknown game for this player ===== -->
    <template v-if="notFound">
      <h1 tabindex="-1">Partie introuvable</h1>
      <p class="match-page__muted">Cette partie n'existe pas ou ce joueur n'y a pas participé.</p>
    </template>

    <template v-else-if="match.data && player">
      <MatchHeader :match="match.data" />
      <Scoreboard :match="match.data" :region="player.region" />
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
