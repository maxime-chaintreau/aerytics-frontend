<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const profileLink = computed(() => ({
  name: "profile",
  params: { region: route.params.region, riotId: route.params.riotId },
}));
</script>

<template>
  <div class="match-page">
    <h1 tabindex="-1">Analyse de la partie</h1>
    <p class="match-page__soon">Bientôt disponible : {{ route.params.matchId }}</p>
    <RouterLink :to="profileLink" class="button">Retour au profil</RouterLink>
  </div>
</template>

<style scoped>
.match-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  padding-block: var(--space-8);
}

.match-page__soon {
  color: var(--text-secondary);
}
</style>
